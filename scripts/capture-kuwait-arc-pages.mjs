import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const root = process.cwd();
const outputDirectory = path.join(root, "projects", "kuwait-arc", "full-page");
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9332;
const profileDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "kuwait-arc-capture-"));

const pages = [
  ["en-01-about", "https://kuwaitarc.com/about/"],
  ["en-02-factory", "https://kuwaitarc.com/the-factory/"],
  ["en-03-clients", "https://kuwaitarc.com/our-clients/"],
  ["en-04-products", "https://kuwaitarc.com/our-products/"],
  ["en-05-services", "https://kuwaitarc.com/services/"],
  ["en-06-contact", "https://kuwaitarc.com/contact-us/"],
  ["en-07-product", "https://kuwaitarc.com/stainless-steel-kitchens/"],
  ["ar-01-about", "https://kuwaitarc.com/ar/معلومات-عنا/"],
  ["ar-02-factory", "https://kuwaitarc.com/ar/المصنع/"],
  ["ar-03-clients", "https://kuwaitarc.com/ar/عملائنا/"],
  ["ar-04-products", "https://kuwaitarc.com/ar/منتجاتنا/"],
  ["ar-05-services", "https://kuwaitarc.com/ar/خدمات/"],
  ["ar-06-contact", "https://kuwaitarc.com/ar/اتصل-بنا-2/"],
  ["ar-07-product", "https://kuwaitarc.com/ar/مطابخ-ستانلس-ستيل/"]
];

fs.mkdirSync(outputDirectory, { recursive: true });

for (const file of fs.readdirSync(outputDirectory)) {
  if (/^(en|ar)-\d{2}-.*\.jpe?g$/i.test(file) || file === "manifest.json") {
    fs.rmSync(path.join(outputDirectory, file));
  }
}

const edge = spawn(
  edgePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--disable-features=Translate,MediaRouter",
    "--disable-background-networking",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDirectory}`,
    "about:blank"
  ],
  { windowsHide: true, stdio: "ignore" }
);

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForBrowser() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page) return page;
    } catch {}
    await sleep(150);
  }
  throw new Error("Timed out waiting for Edge");
}

const target = await waitForBrowser();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++commandId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  }
  return result.result.value;
}

async function waitForPage(url) {
  await send("Page.navigate", { url });
  for (let attempt = 0; attempt < 200; attempt += 1) {
    await sleep(125);
    const state = await evaluate("document.readyState");
    if (state === "complete") break;
  }
  await sleep(2200);
}

async function preparePage() {
  return evaluate(`(async () => {
    const oldStyle = document.querySelector("style[data-capture-style='true']");
    if (oldStyle) oldStyle.remove();

    const style = document.createElement("style");
    style.dataset.captureStyle = "true";
    style.textContent = [
      "html{scroll-behavior:auto!important}",
      "*,*::before,*::after{transition-duration:.001s!important;animation-duration:.001s!important;animation-delay:0s!important;caret-color:transparent!important}",
      ".grecaptcha-badge,.grecaptcha-logo,.grecaptcha-error{display:none!important}",
      ".mfp-wrap,.mfp-bg,.fancybox-container,.fancybox__container,.dialog-widget,.modal,.popup,.pum-overlay,.pum-container{display:none!important}",
      ".elementor-invisible,.wpb_animate_when_almost_visible,.wpb_start_animation{opacity:1!important;visibility:visible!important;transform:none!important}"
    ].join("");
    document.head.appendChild(style);

    const dismissLabels = [
      "accept", "accept all", "allow all", "got it", "close", "ok",
      "agree", "i agree", "understood", "قبول", "موافق", "إغلاق", "اغلاق", "حسنا"
    ];

    for (const element of document.querySelectorAll("button, a, [role='button']")) {
      const text = (element.textContent || element.getAttribute("aria-label") || "").trim().toLowerCase();
      if (!text) continue;
      if (dismissLabels.includes(text) && element.offsetParent !== null) {
        try { element.click(); } catch {}
      }
    }

    const lazyElements = Array.from(document.querySelectorAll("img[loading='lazy'], iframe[data-src], video[data-src]"));
    for (const element of lazyElements) {
      if (element.dataset?.src && !element.src) element.src = element.dataset.src;
    }

    let previousHeight = 0;
    for (let pass = 0; pass < 4; pass += 1) {
      const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 720) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      window.scrollTo(0, height);
      await new Promise((resolve) => setTimeout(resolve, 700));
      const nextHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      if (nextHeight === previousHeight || Math.abs(nextHeight - height) < 20) break;
      previousHeight = nextHeight;
    }

    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 600));

    return {
      title: document.title,
      finalUrl: location.href,
      width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
    };
  })()`);
}

async function captureTiledJpeg(width, height, destination) {
  const tileDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "kuwait-arc-tiles-"));
  const tileHeight = 1000;

  try {
    let tileIndex = 0;
    for (let y = 0; y < height; y += tileHeight) {
      const currentHeight = Math.min(tileHeight, height - y);
      const screenshot = await send("Page.captureScreenshot", {
        format: "jpeg",
        quality: 88,
        fromSurface: true,
        captureBeyondViewport: true,
        clip: { x: 0, y, width, height: currentHeight, scale: 1 }
      });

      fs.writeFileSync(
        path.join(tileDirectory, `${String(tileIndex).padStart(3, "0")}.jpg`),
        Buffer.from(screenshot.data, "base64")
      );
      tileIndex += 1;
    }

    const powershell = `
Add-Type -AssemblyName System.Drawing
$tiles = Get-ChildItem -LiteralPath $env:TILE_DIR -Filter *.jpg | Sort-Object Name
$canvas = [System.Drawing.Bitmap]::new([int]$env:IMAGE_WIDTH, [int]$env:IMAGE_HEIGHT)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.Clear([System.Drawing.Color]::White)
$offsetY = 0
foreach ($tile in $tiles) {
  $image = [System.Drawing.Image]::FromFile($tile.FullName)
  $graphics.DrawImageUnscaled($image, 0, $offsetY)
  $offsetY += $image.Height
  $image.Dispose()
}
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]84)
$canvas.Save($env:IMAGE_OUTPUT, $codec, $parameters)
$parameters.Dispose()
$graphics.Dispose()
$canvas.Dispose()
`;

    const result = spawnSync("powershell", ["-NoProfile", "-Command", powershell], {
      windowsHide: true,
      encoding: "utf8",
      env: {
        ...process.env,
        TILE_DIR: tileDirectory,
        IMAGE_WIDTH: String(width),
        IMAGE_HEIGHT: String(height),
        IMAGE_OUTPUT: destination
      }
    });

    if (result.status !== 0) {
      throw new Error(result.stderr || "Failed to stitch screenshot tiles");
    }
  } finally {
    fs.rmSync(tileDirectory, { recursive: true, force: true });
  }
}

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false
});

const manifest = [];

try {
  for (let index = 0; index < pages.length; index += 1) {
    const [name, url] = pages[index];
    const filename = `${name}.jpg`;
    const destination = path.join(outputDirectory, filename);
    process.stdout.write(`[${index + 1}/${pages.length}] ${name} ... `);

    try {
      await waitForPage(url);
      const pageInfo = await preparePage();
      const metrics = await send("Page.getLayoutMetrics");
      const content = metrics.cssContentSize;
      const width = Math.ceil(Math.min(1440, content.width));
      const height = Math.ceil(content.height);

      if (height > 10000) {
        await captureTiledJpeg(width, height, destination);
      } else {
        const screenshot = await send("Page.captureScreenshot", {
          format: "jpeg",
          quality: 84,
          fromSurface: true,
          captureBeyondViewport: true,
          clip: { x: 0, y: 0, width, height, scale: 1 }
        });
        fs.writeFileSync(destination, Buffer.from(screenshot.data, "base64"));
      }

      const size = fs.statSync(destination).size;
      manifest.push({
        order: index + 1,
        name,
        file: filename,
        requestedUrl: url,
        finalUrl: pageInfo.finalUrl,
        title: pageInfo.title,
        width,
        height,
        bytes: size
      });

      console.log(`${width}x${height}, ${(size / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      manifest.push({
        order: index + 1,
        name,
        file: null,
        requestedUrl: url,
        error: error.message
      });
      console.log(`FAILED: ${error.message}`);
    }
  }
} finally {
  fs.writeFileSync(
    path.join(outputDirectory, "manifest.json"),
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        viewportWidth: 1440,
        scope: "Six English main-menu pages, six Arabic main-menu pages, plus one product page in each language.",
        pages: manifest
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  socket.close();
  edge.kill();
  await sleep(400);

  try {
    fs.rmSync(profileDirectory, { recursive: true, force: true });
  } catch {}
}

const successful = manifest.filter((item) => item.file).length;
const failed = manifest.length - successful;
console.log(`Captured ${successful} pages; ${failed} failed.`);
