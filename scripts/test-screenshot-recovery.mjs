import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

// Controlled image responses exercise the real controller without downloading
// client originals. SITE_ROOT makes the same test exercise the packaged runtime.
const runtime = readFileSync(resolve(process.env.SITE_ROOT ?? ".", "scripts/case-study-screenshots.js"), "utf8");
const executablePath = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean).find(existsSync);
assert(executablePath, "Chrome/Chromium/Edge is required for screenshot recovery checks.");
const browser = await chromium.launch({ executablePath, headless: true });
const svg = (width) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width * 3}"><rect width="100%" height="100%" fill="#38bdf8"/><text x="20" y="80">Screenshot preview</text></svg>`;
const fixture = (locale) => `<!doctype html><html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}"><head><style>button{display:block;width:240px;height:220px}img{display:block;width:100%}</style></head><body style="overflow:auto"><main><h1>Case study</h1>${["one", "two", "three", "decode-error", "decode-timeout"].map(id => `<button data-case-study-screenshot data-full-src="/original-${id}.png" aria-label="Screenshot ${id}"><img alt="Screenshot ${id}" src="/preview-${id}-480.webp" srcset="/preview-${id}-480.webp 480w, /preview-${id}-1600.webp 1600w" sizes="240px" width="480" height="1440"></button>`).join("")}</main><aside inert>Already inert</aside></body></html>`;

try {
  for (const locale of ["en", "ar"]) for (const width of [390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: "reduce" });
    const pending = [];
    const originals = [];
    const errors = [];
    await context.route("http://screenshot.test/**", async route => {
      const url = new URL(route.request().url());
      if (url.pathname === "/") return route.fulfill({ contentType: "text/html", body: fixture(locale) });
      if (url.pathname.includes("original-")) originals.push(url.pathname);
      if (url.pathname.endsWith("1600.webp")) { pending.push({ route, url: url.pathname }); return; }
      return route.fulfill({ contentType: "image/svg+xml", body: svg(480) });
    });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("http://screenshot.test/");
    await page.clock.install();
    await page.evaluate(() => {
      const nativeDecode = HTMLImageElement.prototype.decode;
      window.delayDisplayDecode = false;
      window.displayDecodes = [];
      HTMLImageElement.prototype.decode = function () {
        const result = nativeDecode.call(this);
        if (!window.delayDisplayDecode || !this.hasAttribute("data-full-view-image")) return result;
        return result.then(() => new Promise((resolve, reject) => window.displayDecodes.push({ resolve, reject })));
      };
    });
    await page.addScriptTag({ content: runtime });
    const shot = page.getByRole("button", { name: "Screenshot one", exact: true });
    const second = page.getByRole("button", { name: "Screenshot two", exact: true });
    const third = page.getByRole("button", { name: "Screenshot three", exact: true });
    const modal = page.getByRole("dialog", { name: locale === "ar" ? "عرض الصورة كاملة" : "Full screenshot", exact: true, includeHidden: true });
    const close = modal.getByRole("button", { name: locale === "ar" ? "إغلاق الصورة" : "Close full screenshot", exact: true });
    const retry = modal.locator("[data-full-view-retry]");
    const original = modal.locator("[data-full-view-original]");
    const status = modal.getByRole("status");
    const image = modal.locator("[data-full-view-image]");
    const takeRequest = async () => {
      for (let i = 0; i < 100 && !pending.length; i++) await new Promise(done => setTimeout(done, 10));
      assert(pending.length, "Expected a display image request");
      return pending.shift();
    };

    try {
      await shot.locator("img").evaluate(image => image.decode());
      await shot.click();
      const delayed = await takeRequest();
      assert.equal(delayed.url, "/preview-one-1600.webp");
      assert.equal(await status.textContent(), locale === "ar" ? "جاري تحميل الصورة…" : "Loading image…");
      assert(await modal.locator("[data-full-view-placeholder]").evaluate(image => image.complete && image.naturalWidth > 0));
      assert.equal(await page.locator("main").evaluate(node => node.inert), true);
      assert.equal(await page.evaluate(() => document.body.style.overflow), "hidden");
      assert.deepEqual(originals, [], "Opening full view must not fetch the original");

      // A failed display request leaves the cached preview and a usable retry.
      await delayed.route.abort("failed");
      await retry.waitFor({ state: "visible" });
      assert((await status.textContent()).includes(locale === "ar" ? "تعذر" : "could not"));
      assert(await modal.locator("[data-full-view-placeholder]").isVisible());
      await retry.focus();
      await page.keyboard.press("Enter");
      assert(await close.evaluate(node => node === document.activeElement), "Retry must not leave focus on a hidden control");
      const retried = await takeRequest();
      await page.evaluate(() => { window.delayDisplayDecode = true; });
      await retried.route.fulfill({ contentType: "image/svg+xml", body: svg(1600) });
      await page.waitForFunction(() => window.displayDecodes.length > 0);
      assert(await image.evaluate(image => image.complete && image.naturalWidth > 0));
      assert(!(await image.isVisible()), "Network completion must not reveal an undecoded display image");
      assert(await modal.locator("[data-full-view-placeholder]").isVisible(), "Cached preview must remain during decoding");
      assert.equal(await status.textContent(), locale === "ar" ? "جاري تحميل الصورة…" : "Loading image…");
      await page.evaluate(() => { window.delayDisplayDecode = false; window.displayDecodes.shift().resolve(); });
      await image.waitFor({ state: "visible" });
      assert.equal(await image.evaluate(image => image.naturalWidth), 1600);
      assert.equal(await modal.locator("[data-full-view-placeholder]").count(), 0);
      assert.equal(await status.textContent(), "");
      assert.equal(await original.getAttribute("href"), "/original-one.png");

      // The extra link is reachable; forward/backward Tab remain in the dialog.
      await close.focus();
      await page.keyboard.press("Tab");
      assert(await original.evaluate(node => node === document.activeElement));
      await page.keyboard.press("Tab");
      assert(await close.evaluate(node => node === document.activeElement));
      await page.keyboard.press("Shift+Tab");
      assert(await original.evaluate(node => node === document.activeElement));
      const popupPromise = context.waitForEvent("page");
      await page.keyboard.press("Enter");
      const popup = await popupPromise;
      await popup.waitForLoadState();
      assert.deepEqual(originals, ["/original-one.png"], "Only the explicit original action should download it");
      await popup.close();
      await page.keyboard.press("Escape");
      await modal.waitFor({ state: "hidden" });
      assert(await shot.evaluate(node => node === document.activeElement));
      assert.equal(await page.evaluate(() => document.body.style.overflow), "auto");
      assert.equal(await page.locator("main").evaluate(node => node.inert), false);
      assert.equal(await page.locator("aside").evaluate(node => node.inert), true);
      assert.equal(await modal.locator("img[src]").count(), 0);

      // Closing a pending request and reopening another screenshot isolates events.
      await second.click();
      const stale = await takeRequest();
      await image.evaluate(node => { window.staleImage = node; });
      await close.click();
      await third.click();
      const reopened = await takeRequest();
      assert.equal(reopened.url, "/preview-three-1600.webp");
      await stale.route.fulfill({ contentType: "image/svg+xml", body: svg(777) }).catch(() => {});
      await page.evaluate(() => window.staleImage.dispatchEvent(new Event("load")));
      assert.equal(await image.getAttribute("src"), "/preview-three-1600.webp");
      assert.equal(await original.getAttribute("href"), "/original-three.png");
      await image.evaluate(node => { window.timedOutImage = node; });
      await page.clock.fastForward(15001);
      await retry.waitFor({ state: "visible" });
      assert.equal(await image.getAttribute("src"), null, "A timed-out request should be released");
      await reopened.route.abort("failed").catch(() => {});
      await page.evaluate(() => window.timedOutImage.dispatchEvent(new Event("load")));
      assert(await retry.isVisible(), "Late response must not replace the timeout state");
      await retry.click();
      const recovered = await takeRequest();
      await page.evaluate(() => window.timedOutImage.dispatchEvent(new Event("error")));
      assert.equal(await status.textContent(), locale === "ar" ? "جاري تحميل الصورة…" : "Loading image…");
      await recovered.route.fulfill({ contentType: "image/svg+xml", body: svg(1600) });
      await image.waitFor({ state: "visible" });
      assert.equal(await image.evaluate(image => image.naturalWidth), 1600);
      await close.click();

      // A decoder rejection is recoverable even if the network request succeeded.
      await page.evaluate(() => { window.delayDisplayDecode = true; });
      await page.getByRole("button", { name: "Screenshot decode-error", exact: true }).click();
      const decodeFailure = await takeRequest();
      await decodeFailure.route.fulfill({ contentType: "image/svg+xml", body: svg(1600) });
      await page.waitForFunction(() => window.displayDecodes.length > 0);
      await page.evaluate(() => { window.delayDisplayDecode = false; window.displayDecodes.shift().reject(new Error("Controlled decode failure")); });
      await retry.waitFor({ state: "visible" });
      assert(await modal.locator("[data-full-view-placeholder]").isVisible());
      await retry.click();
      // Browsers may reuse already downloaded bytes or request them again.
      for (let i = 0; i < 100 && !(await image.isVisible()); i++) {
        if (pending.length) await pending.shift().route.fulfill({ contentType: "image/svg+xml", body: svg(1600) });
        await new Promise(done => setTimeout(done, 10));
      }
      await image.waitFor({ state: "visible" });
      await close.click();

      // A late decode must not revive an attempt that already timed out.
      await page.evaluate(() => { window.delayDisplayDecode = true; });
      await page.getByRole("button", { name: "Screenshot decode-timeout", exact: true }).click();
      const decodeTimeout = await takeRequest();
      await decodeTimeout.route.fulfill({ contentType: "image/svg+xml", body: svg(1600) });
      await page.waitForFunction(() => window.displayDecodes.length > 0);
      await page.clock.fastForward(15001);
      await retry.waitFor({ state: "visible" });
      await page.evaluate(() => { window.delayDisplayDecode = false; window.displayDecodes.shift().resolve(); });
      assert(await retry.isVisible(), "Late decode cleared the timeout state");
      assert(!(await image.isVisible()), "Late decode revived a timed-out image");
      assert(await modal.locator("[data-full-view-placeholder]").isVisible());
      await close.click();
      assert.deepEqual(errors, []);
      console.log(`Screenshot recovery passed: ${locale}/${width}, cached preview, delayed/failed decode, network/decode timeout, retry, stale events, original opt-in and keyboard restoration.`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
