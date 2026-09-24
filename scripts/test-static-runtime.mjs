import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { chromium } from "playwright-core";
import { htmlFiles, routeFor } from "./static-site-utils.mjs";

const root = resolve(".");
const direct = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean);
const executablePath = direct.find(existsSync);
assert(executablePath, "Chrome/Chromium/Edge is required for browser regression checks.");
const port = 38126, origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["scripts/serve.mjs"], { cwd: root, env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
let browser;
const failures = [];
const originals = new Set(Object.keys(JSON.parse(readFileSync("data/image-delivery.json", "utf8")).images).map((url) => decodeURIComponent(url.replaceAll("&amp;", "&"))));
function watch(page, route) {
  page.on("pageerror", (error) => failures.push(`${route}: ${error.message}`));
  page.on("console", (message) => { if (message.type() === "error") failures.push(`${route}: ${message.text()}`); });
  page.on("response", (response) => { if (response.status() >= 400 && response.url().startsWith(origin)) failures.push(`${route}: HTTP ${response.status()} ${response.url()}`); });
}
try {
  await new Promise((done, reject) => {
    const timer = setTimeout(() => reject(new Error("Test server startup timed out")), 10000);
    server.once("error", reject);
    server.stdout.once("data", () => { clearTimeout(timer); done(); });
  });
  browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-gpu"] });
  const routes = htmlFiles(root).map((file) => routeFor(root, file));
  let next = 0, verified = 0;
  // Fresh contexts expose missing CSS and prevent cached assets hiding failures.
  async function worker() {
    while (next < routes.length) {
      const route = routes[next++];
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      watch(page, route);
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (originals.has(decodeURIComponent(url.pathname))) failures.push(`${route}: original requested before full-view interaction: ${url.pathname}`);
        if (/\/_next\/.*\.js/.test(url.pathname)) failures.push(`${route}: obsolete framework JS requested`);
      });
      try {
        await page.goto(origin + route, { waitUntil: "load" });
        const state = await page.evaluate(() => ({
          styled: [...document.styleSheets].some((sheet) => sheet.href?.includes("/_next/")) || (["/404.html", "/404/", "/_not-found/"].includes(location.pathname) && document.styleSheets.length > 0),
          headings: document.querySelectorAll("h1").length,
          lang: document.documentElement.lang,
          dir: document.documentElement.dir,
          overflow: document.documentElement.scrollWidth > innerWidth + 1
        }));
        assert(state.styled && state.headings > 0, `${route}: missing styled content`);
        assert.equal(state.lang, route.startsWith("/ar/") ? "ar" : "en", `${route}: incorrect document language`);
        assert(!state.overflow, `${route}: horizontal overflow`);
        if (route.startsWith("/ar/")) assert.equal(state.dir, "rtl");
      } catch (error) { failures.push(error.message); }
      finally { await context.close(); }
      if (++verified % 40 === 0) console.log(`Cold browser checks: ${verified}/${routes.length} routes.`);
    }
  }
  await Promise.all(Array.from({ length: 3 }, worker));

  for (const locale of ["en", "ar"]) {
    const prefix = locale === "ar" ? "/ar" : "";
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      watch(page, `${locale}/${width}`);
      try {
        await page.goto(`${origin}${prefix}/work/`);
        assert.equal(await page.locator("[data-work-card]").count(), 12);
        await page.locator('[data-work-filter="corporate"]').click();
        assert.equal(await page.locator("[data-work-card]").count(), 12);
        await page.locator("[data-work-load-more]").click();
        assert.equal(await page.locator("[data-work-card]").count(), 21);
        await page.locator('[data-work-filter="all"]').click();
        assert.equal(await page.locator("[data-work-card]").count(), 12);
        await page.goto(`${origin}${prefix}/`);
        const atour = page.locator('a[href="' + prefix + '/work/atour/"]');
        assert.equal(await atour.count(), 1, "Atour must link to its actual case study");
        await atour.click();
        await page.waitForURL(`${origin}${prefix}/work/atour/`);
        if (width < 768) {
          assert(await page.locator("aside.sticky").evaluate((aside) => {
            const gallery = aside.parentElement.nextElementSibling;
            return gallery && aside.getBoundingClientRect().bottom <= gallery.getBoundingClientRect().top;
          }), "Project details overlap the mobile gallery");
        } else {
          assert.equal(await page.locator("aside.sticky").evaluate((aside) => getComputedStyle(aside).position), "sticky");
        }
        for (const route of ["/work/atour/", "/backend/techmart/", "/work/armadillo-studio/"]) {
          if (route !== "/work/atour/") await page.goto(`${origin}${prefix}${route}`);
          const shot = page.locator("button[data-case-study-screenshot]").first();
          const original = await shot.getAttribute("data-full-src");
          await shot.click();
          const modal = page.getByRole("dialog", { name: locale === "ar" ? "عرض الصورة كاملة" : "Full screenshot", exact: true });
          await modal.waitFor({ state: "visible" });
          assert.equal(await modal.locator("img").getAttribute("src"), original);
          await page.keyboard.press("Tab");
          assert(await modal.locator("button").evaluate((button) => button === document.activeElement), "Full-view focus escaped");
          await page.keyboard.press("Escape");
          await modal.waitFor({ state: "hidden" });
          assert(await shot.evaluate((button) => button === document.activeElement), "Full-view did not restore focus");
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Mobile page overflows");
        }
      } catch (error) { failures.push(`${locale}/${width}: ${error.message}`); }
      finally { await context.close(); }
    }
  }
  assert.equal(failures.length, 0, failures.join("\n"));
  console.log(`All ${routes.length} routes passed cold browser checks with no JS/HTTP errors, plus EN/AR desktop/mobile filters, navigation and full-view interactions.`);
} finally {
  await browser?.close();
  server.kill();
}
