import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { chromium } from "playwright-core";

const root = resolve(".");
const siteRoot = resolve(process.env.SITE_ROOT ?? root);
const executablePath = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"
].filter(Boolean).find(existsSync);
assert(executablePath, "Chrome/Chromium/Edge is required for Blog browser checks.");

const port = 38133;
const origin = `http://127.0.0.1:${port}`;
const publicOrigin = "https://engmuhammednasser.github.io";
const slug = "qodo-codex-windows";
const paths = (locale) => {
  const prefix = locale === "ar" ? "/ar" : "";
  return { index: `${prefix}/blog/`, article: `${prefix}/blog/${slug}/` };
};
const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  cwd: root,
  env: { ...process.env, SITE_ROOT: siteRoot, PORT: String(port), HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"], windowsHide: true
});
let serverErrors = "";
server.stderr.on("data", (chunk) => { serverErrors += chunk.toString(); });
const errors = [];
let browser;

function watch(page, label) {
  page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
}

async function open(page, route) {
  const response = await page.goto(origin + route, { waitUntil: "load" });
  assert.equal(response?.status(), 200, `${route}: direct navigation must succeed`);
  await page.locator("main#main-content").waitFor({ state: "visible" });
  await page.evaluate(async () => { await document.fonts.ready; });
}

async function follow(page, link, route) {
  assert.equal(await link.evaluate((element) => element.tagName), "A", "Reading links must be ordinary anchors");
  assert.equal(await link.getAttribute("href"), route);
  await Promise.all([page.waitForURL(origin + route), link.click()]);
  await page.locator("main#main-content").waitFor({ state: "visible" });
}

async function checkNavigation(page, locale, article) {
  const links = page.locator("header a[data-blog-navigation]");
  assert.equal(await links.count(), 2, "Blog must appear in desktop and mobile navigation");
  for (const link of await links.all()) {
    assert.equal(await link.getAttribute("href"), paths(locale).index);
    assert.equal(await link.getAttribute("aria-current"), article ? "location" : "page");
  }
}

async function checkArticle(page, locale) {
  assert.equal(await page.locator("html").getAttribute("lang"), locale);
  assert.equal(await page.locator("html").getAttribute("dir"), locale === "ar" ? "rtl" : "ltr");
  assert.equal(await page.locator("h1").count(), 1);
  assert(await page.locator(".blog-prose").isVisible());
  const structure = await page.evaluate(() => {
    const headings = [...document.querySelectorAll(".blog-prose h2, .blog-prose h3")];
    const toc = [...document.querySelectorAll(".blog-toc a[href]")];
    const codes = [...document.querySelectorAll(".blog-prose pre")];
    return {
      headingIds: headings.map((heading) => heading.id),
      toc: toc.map((link) => {
        const hash = link.getAttribute("href");
        const target = hash?.startsWith("#") ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
        return { hash, heading: target?.matches("h2, h3") ?? false };
      }),
      codes: codes.map((code) => ({ direction: getComputedStyle(code).direction, tabindex: code.tabIndex, text: code.textContent.trim() }))
    };
  });
  assert(structure.headingIds.length > 0, "Article needs navigable sections");
  assert.equal(new Set(structure.headingIds).size, structure.headingIds.length, "Article heading IDs must be unique");
  assert(structure.headingIds.every(Boolean), "Article headings need stable IDs");
  assert(structure.toc.length > 0 && structure.toc.every((link) => link.heading), "Every table-of-contents link must target an article heading");
  assert(structure.codes.length > 0, "The Windows guide must include usable code examples");
  assert(structure.codes.every((code) => code.direction === "ltr" && code.tabindex === 0 && code.text), "Code blocks must stay LTR and keyboard reachable, including in Arabic");

  const seo = await page.evaluate(() => ({
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    type: document.querySelector('meta[property="og:type"]')?.content,
    nodes: [...document.querySelectorAll('script[type="application/ld+json"][data-seo-structured-data]')].flatMap((script) => JSON.parse(script.textContent))
  }));
  assert.equal(seo.canonical, publicOrigin + paths(locale).article);
  assert.equal(seo.type, "article");
  const articleNodes = seo.nodes.filter((node) => node["@type"] === "BlogPosting");
  assert.equal(articleNodes.length, 1, "Article metadata must retain one BlogPosting after SEO generation");
  assert.equal(articleNodes[0].inLanguage, locale);
  assert.equal(articleNodes[0].url, seo.canonical);
  assert(articleNodes[0].headline && articleNodes[0].datePublished && articleNodes[0].author, "Article metadata must identify the content, author and publication date");
  await checkNavigation(page, locale, true);
}

async function switchLanguage(page, locale) {
  const targetLocale = locale === "ar" ? "en" : "ar";
  const target = paths(targetLocale).article;
  const toggle = page.locator("[data-mobile-menu-toggle]");
  let link;
  if (await toggle.isVisible()) {
    if (await toggle.getAttribute("aria-expanded") !== "true") await toggle.click();
    await page.locator('[data-mobile-menu-toggle][aria-expanded="true"]').waitFor();
    const menu = page.locator('[data-mobile-menu]:not([inert])[aria-hidden="false"]');
    await menu.waitFor({ state: "visible" });
    link = menu.locator(`a[href="${target}"]`);
  } else {
    link = page.locator(`header nav[aria-label="Primary navigation"] a[href="${target}"], header nav[aria-label="التنقل الرئيسي"] a[href="${target}"]`);
  }
  await follow(page, link, target);
  assert.equal(await page.locator("html").getAttribute("lang"), targetLocale, "Language switch must keep the article slug");
  return targetLocale;
}

async function checkOverflow(page, label) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: page must not overflow horizontally`);
}

async function checkAccessibility(page, label) {
  await page.addScriptTag({ path: resolve(root, "node_modules/axe-core/axe.min.js") });
  const violations = await page.evaluate(async () => (await window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] }
  })).violations.map((violation) => ({ id: violation.id, targets: violation.nodes.map((node) => node.target) })));
  assert.deepEqual(violations, [], `${label}: ${JSON.stringify(violations)}`);
}

async function checkCover(image, label) {
  await image.scrollIntoViewIfNeeded();
  const loaded = await image.evaluate(async (element) => {
    try { await element.decode(); } catch { return false; }
    return element.naturalWidth > 0 && element.naturalHeight > 0;
  });
  assert(loaded, `${label}: cover image must load`);
}

async function checkHeaderFit(page, label) {
  const problems = await page.evaluate(() => {
    const controls = [...document.querySelectorAll("header a[href], header button")].filter((element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return !element.closest("[inert]") && style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight;
    }).map((element) => ({ label: element.textContent.trim() || element.getAttribute("aria-label") || "header control", box: element.getBoundingClientRect() }));
    const issues = [];
    for (const [index, control] of controls.entries()) {
      if (control.box.left < -1 || control.box.right > innerWidth + 1) issues.push(`${control.label} is clipped by the viewport`);
      for (const other of controls.slice(index + 1)) {
        const overlapX = Math.min(control.box.right, other.box.right) - Math.max(control.box.left, other.box.left);
        const overlapY = Math.min(control.box.bottom, other.box.bottom) - Math.max(control.box.top, other.box.top);
        if (overlapX > 2 && overlapY > 2) issues.push(`${control.label} overlaps ${other.label}`);
      }
    }
    return issues;
  });
  assert.deepEqual(problems, [], `${label}: Blog navigation must fit the header`);
}

try {
  await new Promise((done, reject) => {
    const timer = setTimeout(() => finish(new Error(`Blog server startup timed out: ${serverErrors}`)), 10000);
    function finish(error) {
      clearTimeout(timer);
      server.removeListener("error", finish);
      server.removeListener("exit", exited);
      error ? reject(error) : done();
    }
    function exited(code) { finish(new Error(`Blog server exited before startup (${code}): ${serverErrors}`)); }
    server.once("error", finish);
    server.once("exit", exited);
    server.stdout.once("data", () => finish());
  });
  browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-gpu"] });

  for (const locale of ["en", "ar"]) for (const width of [390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    watch(page, `${locale}/${width}`);
    try {
      await open(page, paths(locale).index);
      assert(await page.locator(".blog-grid").isVisible());
      assert(await page.locator("article.blog-card").count() > 0);
      await checkNavigation(page, locale, false);
      await checkCover(page.locator("article.blog-card img").first(), `${locale}/${width}/index`);
      if (width === 1280) await checkAccessibility(page, `${locale}/index`);
      const more = page.locator(`a[data-blog-read-more][href="${paths(locale).article}"]`);
      await follow(page, more, paths(locale).article);
      await checkArticle(page, locale);
      await checkCover(page.locator(".blog-hero-image img"), `${locale}/${width}/article`);
      if (width === 1280) await checkAccessibility(page, `${locale}/article`);
      await checkOverflow(page, `${locale}/${width}/article`);
      const switched = await switchLanguage(page, locale);
      await checkArticle(page, switched);
      await follow(page, page.locator(`main a[href="${paths(switched).index}"]`).first(), paths(switched).index);
      assert(await page.locator(".blog-grid").isVisible(), "Article must provide a working return to the Blog");
    } finally { await context.close(); }
  }

  for (const locale of ["en", "ar"]) {
    const context = await browser.newContext({ viewport: { width: 320, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    watch(page, `${locale}/responsive`);
    try {
      for (const width of [320, 768, 1024, 1100, 1200, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await open(page, paths(locale).index);
        const columns = await page.locator(".blog-grid").evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length);
        assert.equal(columns, width >= 1100 ? 3 : width >= 700 ? 2 : 1, `${locale}/${width}: Blog columns must adapt to the viewport`);
        await checkOverflow(page, `${locale}/${width}/index`);
        if (width >= 1024) await checkHeaderFit(page, `${locale}/${width}/index`);
        await open(page, paths(locale).article);
        await checkOverflow(page, `${locale}/${width}/article`);
        if (width >= 1024) await checkHeaderFit(page, `${locale}/${width}/article`);
      }
    } finally { await context.close(); }
  }

  // Read-more and return links must remain usable when JavaScript is disabled.
  for (const locale of ["en", "ar"]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      await open(page, paths(locale).index);
      await follow(page, page.locator(`a[data-blog-read-more][href="${paths(locale).article}"]`), paths(locale).article);
      assert(await page.locator(".blog-prose").isVisible());
      assert((await page.locator(".blog-prose").innerText()).trim().length > 0);
      await follow(page, page.locator(`main a[href="${paths(locale).index}"]`).first(), paths(locale).index);
    } finally { await context.close(); }
  }
  assert.deepEqual(errors, [], errors.join("\n"));
  console.log("Blog browser checks passed: EN/AR reading and language navigation, article metadata and covers, four WCAG scans, code/TOC accessibility, responsive grids/header fit, and no-JavaScript reading.");
} finally {
  await browser?.close();
  server.kill();
}
