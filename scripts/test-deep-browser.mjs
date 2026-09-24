import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import { htmlFiles, routeFor } from "./static-site-utils.mjs";
import { resolve } from "node:path";

const executablePath = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean).find(existsSync);
assert(executablePath, "Chrome/Chromium/Edge is required.");
const origin = "http://127.0.0.1:38127";
const server = spawn(process.execPath, ["scripts/serve.mjs"], { env: { ...process.env, PORT: "38127", HOST: "127.0.0.1" }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
const failures = [];
let browser;
const expect = (value, message) => { if (!value) failures.push(message); };
const manifest = JSON.parse(readFileSync("data/image-delivery.json", "utf8"));
const variants = new Map(Object.values(manifest.images).flatMap(entry => [...entry.variants, ...(entry.avifVariants ?? [])].map(v => [v.url, v])));
try {
  await new Promise((done, reject) => {
    const timer = setTimeout(() => reject(new Error("Server startup timeout")), 10000);
    server.once("error", reject);
    server.stdout.once("data", () => { clearTimeout(timer); done(); });
  });
  // The preview server must not expose development metadata, even when encoded.
  for (const path of ["/.git/HEAD", "/%2egit/config", "/node_modules/axe-core/package.json", "/.cache/deep-audit-before.json", "/missing-route/"]) {
    const response = await fetch(origin + path);
    expect(response.status === 404, `Preview server exposed ${path}`);
  }
  expect((await fetch(origin + "/", { method: "POST" })).status === 405, "Preview server accepted POST");
  const head = await fetch(origin + "/", { method: "HEAD" });
  expect(head.status === 200 && (await head.text()) === "" && Number(head.headers.get("content-length")) > 0, "Incorrect HEAD response");
  browser = await chromium.launch({ executablePath, headless: true });
  const routes = htmlFiles(resolve(".")).map(file => routeFor(resolve("."), file));
  const templates = new Set(["/", "/work/", "/work/atour/", "/backend/techmart/", "/work/mariam-fathy-shop/", "/contact/", "/lab/", "/lab/plugins/access-trail/", "/lab/plugins/custom-currency-icon/", "/backend/edusmart-system/", "/about/"]);
  let cursor = 0, audited = 0;
  async function worker() {
    while (cursor < routes.length) {
      const route = routes[cursor++];
      const context = await browser.newContext({ viewport: { width: 320, height: 844 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      page.on("pageerror", error => failures.push(`${route}: ${error.message}`));
      try {
        await page.goto(origin + route, { waitUntil: "load" });
        for (const width of [320, 768]) {
          await page.setViewportSize({ width, height: 844 });
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
          expect(!overflow, `${route}/${width}: horizontal overflow`);
          if (templates.has(route.replace(/^\/ar(?=\/)/, ""))) {
            await page.addScriptTag({ path: "node_modules/axe-core/axe.min.js" });
            const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
            expect(!violations.length, `${route}/${width}: ${JSON.stringify(violations)}`);
          }
        }
      } catch (error) { failures.push(`${route}: ${error.message}`); }
      finally { await context.close(); }
      if (++audited % 50 === 0) console.log(`Deep responsive audit: ${audited}/${routes.length} pages.`);
    }
  }
  await Promise.all(Array.from({ length: 3 }, worker));
  if (failures.length) console.log("Responsive/accessibility findings:", JSON.stringify(failures));
  for (const prefix of ["", "/ar"]) {
    const page = await browser.newPage({ viewport: { width: 768, height: 844 }, reducedMotion: "reduce" });
    await page.goto(origin + prefix + "/");
    await page.locator("[data-mobile-menu-toggle]").click();
    expect(await page.locator('[data-mobile-menu] a[href="' + prefix + '/work/"]').isVisible(), `${prefix}: tablet menu links are hidden`);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.waitForFunction(() => document.querySelector("[data-mobile-menu]").getAttribute("aria-hidden") === "true");
    expect(await page.evaluate(() => document.body.style.overflow !== "hidden" && !document.querySelector("[data-mobile-menu-overlay]") && document.activeElement.getClientRects().length > 0), `${prefix}: resizing the menu leaves a scroll/focus trap`);
    await page.goto(origin + prefix + "/work/");
    await page.locator('[data-work-filter="corporate"]').click();
    const first = await page.locator("[data-work-card]").first().elementHandle();
    await page.locator("[data-work-load-more]").focus();
    await page.keyboard.press("Enter");
    expect(await first.evaluate(n => n.isConnected), `${prefix}: Load More destroyed existing cards`);
    expect(await page.locator("[data-work-card]").nth(12).evaluate(n => n.contains(document.activeElement)), `${prefix}: Load More did not focus the new results`);
    await page.goto(origin + prefix + "/work/atour/");
    const shot = page.locator("button[data-case-study-screenshot]").first();
    await shot.scrollIntoViewIfNeeded();
    await shot.locator("img").evaluate(image => image.decode());
    const delivered = await shot.locator("img").evaluate(image => ({ source: new URL(image.currentSrc).pathname, width: image.getBoundingClientRect().width }));
    expect(variants.get(delivered.source)?.width <= Math.max(960, delivered.width * 2), `${prefix}: gallery image is oversized for its rendered slot`);
    await shot.click();
    const modal = page.getByRole("dialog", { name: prefix ? "عرض الصورة كاملة" : "Full screenshot", exact: true, includeHidden: true });
    expect(await page.locator("main").evaluate(main => main.inert), `${prefix}: full view leaves the background interactive`);
    await modal.locator("img").evaluate(image => image.decode());
    await modal.evaluate(dialog => { dialog.scrollTop = 200; });
    await page.keyboard.press("Escape");
    expect(await page.locator("main").evaluate(main => !main.inert), `${prefix}: full view did not restore the background`);
    expect(await modal.locator("img").getAttribute("src") === null, `${prefix}: full view retained its decoded original after closing`);
    await shot.click();
    expect(await modal.evaluate(dialog => dialog.scrollTop === 0), `${prefix}: reopening full view retained the old scroll position`);
    await page.keyboard.press("Escape");
    await page.close();
    // Static browsing must remain usable when enhancement JavaScript is disabled.
    const noScript = await browser.newContext({ javaScriptEnabled: false });
    const fallback = await noScript.newPage();
    await fallback.goto(origin + prefix + "/work/");
    expect(await fallback.locator("noscript li a").count() === 45, `${prefix}: no-JS project routes are missing`);
    await noScript.close();
  }
  // Exercise native picture selection and the WebP fallback with cold caches.
  // An unsupported source MIME simulates a browser without AVIF capability.
  for (const prefix of ["", "/ar"]) for (const width of [320, 1280]) for (const avif of [true, false]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: width === 320 ? 2 : 1, reducedMotion: "reduce" });
    const page = await context.newPage();
    const requested = new Set();
    const label = `${prefix || "/en"}/${width}/${avif ? "avif" : "webp"}`;
    page.on("request", request => requested.add(decodeURIComponent(new URL(request.url()).pathname)));
    page.on("pageerror", error => failures.push(`${label}: ${error.message}`));
    page.on("response", response => { if (response.status() >= 400) failures.push(`${label}: HTTP ${response.status()} ${response.url()}`); });
    if (!avif) await page.route("**/work/a2mkw/", async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replaceAll('type="image/avif"', 'type="image/x-unsupported-format"') });
    });
    try {
      await page.goto(origin + prefix + "/work/a2mkw/");
      const image = page.locator("picture[data-optimized-avif] img").first();
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(image => image.decode());
      const state = await image.evaluate(image => ({ source: image.dataset.optimizedPreview, delivered: new URL(image.currentSrc).pathname, width: image.getBoundingClientRect().width }));
      const entry = manifest.images[state.source];
      const expected = avif ? entry.avifVariants : entry.variants;
      const unused = avif ? entry.variants : entry.avifVariants;
      expect(expected.some(v => v.url === state.delivered), `${label}: incorrect image format selected`);
      expect(!unused.some(v => requested.has(decodeURIComponent(v.url))), `${label}: downloaded both fallback and AVIF`);
      expect(!requested.has(decodeURIComponent(state.source)), `${label}: full-resolution original was fetched before interaction`);
      expect(state.width > 100 && state.width <= width, `${label}: picture wrapper changed the gallery layout`);
    } finally { await context.close(); }
  }
  assert.equal(failures.length, 0, failures.join("\n"));
  console.log(`Deep checks passed: ${routes.length} pages at 320/768px, 44 template accessibility scans, 8 AVIF/WebP selection checks, native state transitions, responsive gallery selection, no-JS fallback and private-file protection.`);
} finally { await browser?.close(); server.kill(); }
