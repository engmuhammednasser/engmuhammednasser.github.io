import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

const root = resolve(".");
const siteRoot = resolve(process.env.SITE_ROOT ?? root);
const catalogJson = readFileSync(resolve(siteRoot, "data/projects.json"), "utf8");
const catalog = JSON.parse(catalogJson);
const candidates = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean);
const executablePath = candidates.find(existsSync);
assert(executablePath, "Chrome/Chromium/Edge is required for Work recovery browser checks.");
const port = 38130, origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  cwd: root, env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"], windowsHide: true
});
const failures = [];
let browser;

function watch(page, label) {
  page.on("pageerror", (error) => failures.push(`${label}: ${error.message}`));
}

async function count(page, expected) {
  await page.waitForFunction((number) => document.querySelectorAll("[data-work-card]").length === number, expected);
}

async function pendingCase(context, locale, width) {
  const page = await context.newPage();
  watch(page, `${locale}/${width}/pending`);
  const prefix = locale === "ar" ? "/ar" : "";
  const loading = locale === "ar" ? "جارٍ تحميل المشاريع…" : "Loading projects…";
  let waitingRoute, requestTimer;
  const requested = new Promise((done, reject) => {
    requestTimer = setTimeout(() => reject(new Error("Catalog request was not started")), 10000);
    page.route("**/data/projects.json", (route) => {
      waitingRoute = route;
      clearTimeout(requestTimer);
      done(); // Leave the real browser request pending until navigation cancels it.
    }).catch(reject);
  });
  try {
    await page.goto(`${origin}${prefix}/work/`, { waitUntil: "domcontentloaded" });
    await requested;
    assert.equal(await page.locator("[data-work-status]").textContent(), loading);
    const more = page.locator("[data-work-load-more]");
    assert.equal(await more.textContent(), loading);
    assert(await more.isVisible());
    assert(await more.isDisabled());
    assert.equal(await more.getAttribute("aria-busy"), "true");
    assert(await page.locator("[data-work-filter]").evaluateAll((buttons) => buttons.every((button) => button.disabled)));
    await count(page, 12);
    const firstLink = page.locator("[data-work-card] a[href]").first();
    const path = await firstLink.getAttribute("href");
    await firstLink.click();
    await page.waitForURL(origin + path);
    assert(await page.locator("h1").isVisible(), "Static project links must work while the catalog is pending");
  } finally {
    clearTimeout(requestTimer);
    // A normal document navigation may already have cancelled this paused request.
    if (waitingRoute) await waitingRoute.abort().catch(() => {});
    await page.close();
  }
}

async function retryCase(context, locale, width, failure) {
  const page = await context.newPage();
  watch(page, `${locale}/${width}/${failure}`);
  const prefix = locale === "ar" ? "/ar" : "";
  const retry = locale === "ar" ? "إعادة محاولة تحميل المشاريع" : "Retry loading projects";
  let requests = 0;
  await page.route("**/data/projects.json", async (route) => {
    if (++requests === 1) {
      if (failure === "network") await route.abort("failed");
      else await route.fulfill({ status: 503, contentType: "text/plain", body: "Temporarily unavailable" });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: catalogJson });
    }
  });
  try {
    await page.goto(`${origin}${prefix}/work/`, { waitUntil: "domcontentloaded" });
    const retryButton = page.getByRole("button", { name: retry, exact: true });
    await retryButton.waitFor({ state: "visible" });
    assert(await retryButton.isEnabled());
    await count(page, 12);
    assert(await page.locator("[data-work-filter]").evaluateAll((buttons) => buttons.every((button) => button.disabled)));
    const initialIds = await page.locator("[data-work-card]").evaluateAll((cards) => cards.map((card) => card.dataset.projectId));
    assert.deepEqual(initialIds, catalog.projects.slice(0, 12).map((project) => project.id));
    await retryButton.click();
    await page.waitForFunction(() => document.querySelector("[data-work-load-more]").getAttribute("aria-busy") === "false");
    assert.equal(requests, 2);
    const more = page.locator("[data-work-load-more]");
    assert.equal(await more.textContent(), locale === "ar" ? "تحميل المزيد من المشاريع" : "Load more projects");
    for (let visible = 12; visible < catalog.projects.length;) {
      await more.click();
      visible = Math.min(visible + 12, catalog.projects.length);
      await count(page, visible);
    }
    assert(await more.isHidden());
    const ids = await page.locator("[data-work-card]").evaluateAll((cards) => cards.map((card) => card.dataset.projectId));
    assert.deepEqual(ids, catalog.projects.map((project) => project.id));
    assert.equal(new Set(ids).size, catalog.projects.length, "Retry must not duplicate cards or handlers");
    await page.locator('[data-work-filter="corporate"]').click();
    await count(page, 12);
    await more.click();
    await count(page, catalog.projects.filter((project) => project.category === "corporate").length);
    assert.equal(requests, 2, "Healthy filtering and pagination should reuse the recovered catalog");
    if (locale === "ar") assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Work recovery UI must fit the viewport");
  } finally {
    await page.close();
  }
}

try {
  await new Promise((done, reject) => {
    const timer = setTimeout(() => reject(new Error("Work test server startup timed out")), 10000);
    server.once("error", (error) => { clearTimeout(timer); reject(error); });
    server.stdout.once("data", () => { clearTimeout(timer); done(); });
  });
  browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-gpu"] });
  for (const locale of ["en", "ar"]) {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: "reduce" });
      // This suite isolates catalog requests. Dedicated gallery/browser suites verify real media.
      await context.route("**/*", (route) => route.request().resourceType() === "image"
        ? route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>' })
        : route.continue());
      try {
        await pendingCase(context, locale, width);
        await retryCase(context, locale, width, "network");
        await retryCase(context, locale, width, "http");
        console.log(`Work recovery browser checks passed: ${locale}/${width}, pending navigation, network/HTTP retry, all ${catalog.projects.length} projects.`);
      } finally {
        await context.close();
      }
    }
  }
  assert.equal(failures.length, 0, failures.join("\n"));
} finally {
  await browser?.close();
  server.kill();
}
