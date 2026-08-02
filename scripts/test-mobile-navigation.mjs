import { randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { createConnection } from "node:net";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const root = resolve(process.cwd());
const routes = ["/", "/work/", "/ar/", "/ar/work/"];
const blockEffects = process.argv.includes("--block-effects");
const serverPort = 38124;
const browserPort = 38125;
const chromePathCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/microsoft-edge"
].filter(Boolean);
const commandCandidates = ["google-chrome", "chromium", "chromium-browser", "microsoft-edge", "msedge"];

function findBrowser() {
  const directPath = chromePathCandidates.find((candidate) => existsSync(candidate));
  if (directPath) return directPath;
  const lookup = process.platform === "win32" ? "where.exe" : "which";
  for (const command of commandCandidates) {
    const result = spawnSync(lookup, [command], { encoding: "utf8" });
    const candidate = result.status === 0 ? result.stdout.trim().split(/\r?\n/)[0] : "";
    if (candidate && existsSync(candidate)) return candidate;
  }
  return null;
}

function sleep(milliseconds) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

function encodeFrame(message) {
  const payload = Buffer.from(message);
  const mask = randomBytes(4);
  let header;
  if (payload.length < 126) header = Buffer.from([0x81, 0x80 | payload.length]);
  else if (payload.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }
  const masked = Buffer.from(payload);
  for (let index = 0; index < masked.length; index += 1) masked[index] ^= mask[index % 4];
  return Buffer.concat([header, mask, masked]);
}

class LocalWebSocket {
  constructor(url) {
    this.url = new URL(url);
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.handshake = false;
    this.pending = new Map();
    this.nextId = 0;
    this.events = [];
  }

  async connect() {
    const key = randomBytes(16).toString("base64");
    this.socket = createConnection(Number(this.url.port || 80), this.url.hostname);
    this.socket.setNoDelay(true);
    this.socket.on("data", (chunk) => this.onData(chunk));
    await new Promise((resolvePromise, reject) => {
      this.socket.once("connect", () => {
        this.socket.write(
          `GET ${this.url.pathname}${this.url.search} HTTP/1.1\r\n` +
            `Host: ${this.url.host}\r\n` +
            "Upgrade: websocket\r\n" +
            "Connection: Upgrade\r\n" +
            `Sec-WebSocket-Key: ${key}\r\n` +
            "Sec-WebSocket-Version: 13\r\n\r\n"
        );
      });
      this.socket.once("error", reject);
      this.onHandshake = resolvePromise;
    });
    return this;
  }

  onData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    if (!this.handshake) {
      const headerEnd = this.buffer.indexOf("\r\n\r\n");
      if (headerEnd === -1) return;
      const header = this.buffer.subarray(0, headerEnd).toString("utf8");
      if (!/^HTTP\/1\.1 101 /i.test(header)) {
        this.onHandshake?.(new Error(`WebSocket handshake failed: ${header.split("\r\n")[0]}`));
        return;
      }
      this.handshake = true;
      this.buffer = this.buffer.subarray(headerEnd + 4);
      this.onHandshake?.();
    }
    this.parseFrames();
  }

  parseFrames() {
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      let length = second & 0x7f;
      let offset = 2;
      if (length === 126) {
        if (this.buffer.length < 4) return;
        length = this.buffer.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        if (this.buffer.length < 10) return;
        length = Number(this.buffer.readBigUInt64BE(2));
        offset = 10;
      }
      const masked = Boolean(second & 0x80);
      const frameLength = offset + (masked ? 4 : 0) + length;
      if (this.buffer.length < frameLength) return;
      const mask = masked ? this.buffer.subarray(offset, offset + 4) : null;
      const payloadStart = offset + (masked ? 4 : 0);
      const payload = Buffer.from(this.buffer.subarray(payloadStart, payloadStart + length));
      if (mask) for (let index = 0; index < payload.length; index += 1) payload[index] ^= mask[index % 4];
      this.buffer = this.buffer.subarray(frameLength);
      const opcode = first & 0x0f;
      if (opcode === 1) this.onMessage(payload.toString("utf8"));
      else if (opcode === 9) this.socket.write(Buffer.from([0x8a, payload.length, ...payload]));
      else if (opcode === 8) this.socket.end();
    }
  }

  onMessage(text) {
    const message = JSON.parse(text);
    if (message.id && this.pending.has(message.id)) {
      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
      return;
    }
    this.events.push(message);
  }

  send(method, params = {}) {
    const id = ++this.nextId;
    return new Promise((resolvePromise, reject) => {
      this.pending.set(id, { resolve: resolvePromise, reject });
      this.socket.write(encodeFrame(JSON.stringify({ id, method, params })));
    });
  }

  close() {
    this.socket?.end();
  }
}

async function connectCdp() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const targets = await fetchJson(`http://127.0.0.1:${browserPort}/json/list`);
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return new LocalWebSocket(page.webSocketDebuggerUrl).connect();
    } catch {}
    await sleep(250);
  }
  throw new Error("Chrome CDP target unavailable.");
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result?.value;
}

async function navigate(cdp, route) {
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${serverPort}${route}` });
  await sleep(1200);
}

async function clickAt(cdp, selector) {
  const rect = await evaluate(cdp, `(() => { const element = document.querySelector(${JSON.stringify(selector)}); const rect = element?.getBoundingClientRect(); return rect && {x: rect.x, y: rect.y, width: rect.width, height: rect.height}; })()`);
  if (!rect) throw new Error(`Could not find clickable element ${selector}`);
  const x = Math.round(rect.x + rect.width / 2);
  const y = Math.round(rect.y + rect.height / 2);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  await sleep(180);
}

async function pressKey(cdp, key, code, keyCode) {
  const text = key === "Enter" ? "\r" : key === " " ? " " : undefined;
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key, code, text, unmodifiedText: text, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
  await sleep(180);
}

function stopProcess(child) {
  if (!child?.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    child.kill("SIGTERM");
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function diagnostics(cdp) {
  const exceptions = cdp.events
    .filter((event) => event.method === "Runtime.exceptionThrown")
    .map((event) => event.params.exceptionDetails?.exception?.description ?? event.params.exceptionDetails?.text ?? "unknown exception");
  const consoleErrors = cdp.events
    .filter((event) => event.method === "Runtime.consoleAPICalled" && ["error", "assert"].includes(event.params.type))
    .map((event) => event.params.args?.map((argument) => argument.value ?? argument.description).join(" ") ?? event.params.type);
  const knownExceptions = exceptions.filter((exception) => /t\.reason\.enqueueModel is not a function|Error: Connection closed\./.test(exception));
  const unexpectedExceptions = exceptions.filter((exception) => !/t\.reason\.enqueueModel is not a function|Error: Connection closed\./.test(exception));
  return { knownExceptions, unexpectedExceptions, consoleErrors };
}

const chrome = findBrowser();
if (!chrome) {
  console.error("No supported Chrome/Edge executable was found for mobile navigation checks.");
  process.exit(1);
}

const server = spawn(process.execPath, ["scripts/serve.mjs"], { cwd: root, env: { ...process.env, PORT: String(serverPort) }, stdio: "ignore" });
const userDataDir = mkdtempSync(join(tmpdir(), "portfolio-mobile-menu-"));
const browser = spawn(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--no-first-run", `--remote-debugging-port=${browserPort}`, `--user-data-dir=${userDataDir}`, "about:blank"], { stdio: "ignore" });
const failures = [];
let cdp;

try {
  await sleep(700);
  cdp = await connectCdp();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  if (blockEffects) {
    await cdp.send("Network.enable");
    await cdp.send("Network.setBlockedURLs", { urls: ["*/scripts/portfolio-effects.js"] });
  }
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const routeResults = [];

  for (const route of routes) {
    try {
      cdp.events.length = 0;
      await navigate(cdp, route);
      const before = await evaluate(cdp, "(() => { const toggle = document.querySelector('[data-mobile-menu-toggle]'); const menu = document.querySelector('[data-mobile-menu]'); return { locale: document.documentElement.lang, direction: document.documentElement.dir, closed: toggle?.getAttribute('aria-expanded') === 'false' && menu?.getAttribute('aria-hidden') === 'true' && menu?.classList.contains(document.documentElement.dir === 'rtl' ? 'translate-x-full' : '-translate-x-full'), togglePresent: Boolean(toggle), menuPresent: Boolean(menu) }; })()");
      assert(before.togglePresent && before.menuPresent, `${route}: fallback hooks are missing`);
      assert(before.closed, `${route}: menu must start closed`);

      await clickAt(cdp, "[data-mobile-menu-toggle]");
      const pointerOpen = await evaluate(cdp, "(() => { const toggle = document.querySelector('[data-mobile-menu-toggle]'); const menu = document.querySelector('[data-mobile-menu]'); return toggle?.getAttribute('aria-expanded') === 'true' && menu?.getAttribute('aria-hidden') === 'false' && menu?.classList.contains('translate-x-0') && !menu?.hasAttribute('inert') && Boolean(document.querySelector('[data-mobile-menu-overlay]')); })()");
      assert(pointerOpen, `${route}: pointer activation did not open the menu`);

      await clickAt(cdp, "[data-mobile-menu-toggle]");
      const pointerClose = await evaluate(cdp, "(() => { const toggle = document.querySelector('[data-mobile-menu-toggle]'); const menu = document.querySelector('[data-mobile-menu]'); return toggle?.getAttribute('aria-expanded') === 'false' && menu?.getAttribute('aria-hidden') === 'true' && !document.querySelector('[data-mobile-menu-overlay]'); })()");
      assert(pointerClose, `${route}: second pointer activation did not close the menu`);

      await clickAt(cdp, "[data-mobile-menu-toggle]");
      await pressKey(cdp, "Escape", "Escape", 27);
      const escapeClose = await evaluate(cdp, "document.querySelector('[data-mobile-menu-toggle]')?.getAttribute('aria-expanded') === 'false'");
      assert(escapeClose, `${route}: Escape did not close the menu`);

      await evaluate(cdp, "document.querySelector('[data-mobile-menu-toggle]')?.focus()");
      await pressKey(cdp, "Enter", "Enter", 13);
      const enterOpen = await evaluate(cdp, "document.querySelector('[data-mobile-menu-toggle]')?.getAttribute('aria-expanded') === 'true'");
      assert(enterOpen, `${route}: keyboard Enter did not open the menu`);
      await pressKey(cdp, "Escape", "Escape", 27);

      await evaluate(cdp, "document.querySelector('[data-mobile-menu-toggle]')?.focus()");
      await pressKey(cdp, " ", "Space", 32);
      const spaceOpen = await evaluate(cdp, "document.querySelector('[data-mobile-menu-toggle]')?.getAttribute('aria-expanded') === 'true'");
      assert(spaceOpen, `${route}: keyboard Space did not open the menu`);
      await pressKey(cdp, "Escape", "Escape", 27);

      const runtime = diagnostics(cdp);
      assert(runtime.unexpectedExceptions.length === 0, `${route}: unexpected runtime exception: ${runtime.unexpectedExceptions[0]}`);
      assert(runtime.consoleErrors.length === 0, `${route}: console error: ${runtime.consoleErrors[0]}`);
      routeResults.push({ route, locale: before.locale, direction: before.direction, pointerOpen, pointerClose, escapeClose, enterOpen, spaceOpen, knownExceptions: runtime.knownExceptions });
    } catch (error) {
      failures.push(error.message);
    }
  }

  for (const linkCase of [{ route: "/", href: "/work/", expected: "/work/", locale: "en", direction: "ltr" }, { route: "/ar/", href: "/ar/work/", expected: "/ar/work/", locale: "ar", direction: "rtl" }]) {
    try {
      cdp.events.length = 0;
      await navigate(cdp, linkCase.route);
      await clickAt(cdp, "[data-mobile-menu-toggle]");
      await clickAt(cdp, `[data-mobile-menu] a[href="${linkCase.href}"]`);
      await sleep(700);
      const linkResult = await evaluate(cdp, "({path: location.pathname, locale: document.documentElement.lang, direction: document.documentElement.dir})");
      assert(linkResult.path === linkCase.expected && linkResult.locale === linkCase.locale && linkResult.direction === linkCase.direction, `${linkCase.route}: navigation link did not preserve locale and route`);
      const runtime = diagnostics(cdp);
      assert(runtime.unexpectedExceptions.length === 0, `${linkCase.route}: unexpected runtime exception: ${runtime.unexpectedExceptions[0]}`);
      assert(runtime.consoleErrors.length === 0, `${linkCase.route}: console error: ${runtime.consoleErrors[0]}`);
    } catch (error) {
      failures.push(error.message);
    }
  }

  if (failures.length) {
    console.error(`Found ${failures.length} mobile navigation regression failures:`);
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
  } else {
    console.log(`Chrome mobile navigation verified ${routeResults.length} EN/AR routes at 390x844${blockEffects ? " with portfolio effects blocked" : ""}: pointer, close, Escape, Enter, Space, and locale-preserving links.`);
  }
} finally {
  cdp?.close();
  stopProcess(browser);
  stopProcess(server);
  await sleep(300);
  rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
