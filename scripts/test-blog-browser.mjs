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
const copyLabels = {
  en: { idle: "Copy", copied: "Copied!", success: "Commands copied.", failure: "Automatic copying failed. The code is selected; use your device’s Copy command." },
  ar: { idle: "نسخ", copied: "تم النسخ", success: "تم نسخ الأوامر.", failure: "تعذّر النسخ التلقائي. النص محدد الآن؛ استخدم خيار «نسخ» في جهازك." }
};
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

async function checkCopyButtons(page, locale) {
  const labels = copyLabels[locale];
  const blocks = page.locator(".blog-code:has([data-blog-copy])");
  assert.equal(await blocks.count(), 7, "Only the seven PowerShell examples should expose Copy");
  await page.bringToFront();
  await page.evaluate(() => {
    const writeText = navigator.clipboard.writeText.bind(navigator.clipboard);
    window.__blogClipboardWrites = [];
    Object.defineProperty(navigator.clipboard, "writeText", { configurable: true, value: (text) => {
      window.__blogClipboardWrites.push(text);
      return writeText(text);
    } });
  });
  for (let index = 0; index < await blocks.count(); index++) {
    const block = blocks.nth(index);
    const button = block.locator("button[data-blog-copy]");
    const status = block.locator("[data-blog-copy-status]");
    const label = button.locator("[data-blog-copy-label]");
    const expected = await block.locator("pre > code").textContent();
    assert.equal(await button.getAttribute("type"), "button");
    assert(await button.isVisible());
    assert.equal(await label.innerText(), labels.idle);
    assert((await button.getAttribute("aria-label"))?.includes(labels.idle), "The accessible name must contain the visible Copy label");
    assert.equal(await status.getAttribute("role"), "status");
    assert.equal(await status.getAttribute("aria-live"), "polite");
    await button.scrollIntoViewIfNeeded();
    if (index < 2) {
      await button.focus();
      await button.press(index === 0 ? "Enter" : "Space");
      assert(await button.evaluate((element) => element === document.activeElement), "Successful keyboard copying must retain focus");
    } else await button.click();
    await status.filter({ hasText: labels.success }).waitFor({ state: "visible" });
    assert.equal(await status.innerText(), labels.success);
    assert.equal(await label.innerText(), labels.copied);
    assert((await button.getAttribute("aria-label"))?.includes(labels.copied), "The success-state accessible name must contain the visible confirmation");
    assert.equal(await page.evaluate(() => window.__blogClipboardWrites.at(-1)), expected, `${locale}: writeText must receive the displayed text exactly`);
    // Windows' native clipboard normalizes LF to CRLF; the API input above must remain exact.
    const copied = await page.evaluate(async () => (await navigator.clipboard.readText()).replace(/\r\n/g, "\n"));
    assert.equal(copied, expected, `${locale}: clipboard must contain the complete displayed example`);
  }

  // Exercise text fidelity through the real control without changing article sources.
  const block = blocks.first();
  const code = block.locator("pre > code");
  const original = await code.textContent();
  const exactText = [
    "$message = \"Keep $dollars and 'quotes'\"",
    "$literal = 'A `backtick` and <tag> & text'",
    "",
    'Write-Output "$message`nSecond line"',
    ""
  ].join("\n");
  try {
    await code.evaluate((element, text) => { element.textContent = text; }, exactText);
    await block.locator("[data-blog-copy]").click();
    await block.locator("[data-blog-copy-status]").filter({ hasText: labels.success }).waitFor({ state: "visible" });
    await page.waitForFunction(async (expected) => (await navigator.clipboard.readText()).replace(/\r\n/g, "\n") === expected, exactText);
    assert.equal(await page.evaluate(() => window.__blogClipboardWrites.at(-1)), exactText, "Copy must preserve quotes, dollars, backticks, blank lines and the final newline");
    await block.locator("[data-blog-copy-label]").filter({ hasText: new RegExp(`^${labels.idle}$`) }).waitFor({ state: "visible" });
    assert((await block.locator("[data-blog-copy]").getAttribute("aria-label"))?.includes(labels.idle), "The accessible name must reset with the visible Copy label");
  } finally {
    await code.evaluate((element, text) => { element.textContent = text; }, original);
  }
}

async function checkCopyFailure(page, locale) {
  const labels = copyLabels[locale];
  const block = page.locator(".blog-code:has([data-blog-copy])").first();
  const button = block.locator("[data-blog-copy]");
  const status = block.locator("[data-blog-copy-status]");
  const expected = await block.locator("pre > code").textContent();
  assert(await button.isVisible(), "Manual-copy assistance must remain available without Clipboard API access");
  await button.click();
  await status.filter({ hasText: labels.failure }).waitFor({ state: "visible" });
  assert.equal(await status.innerText(), labels.failure);
  assert.equal(await button.locator("[data-blog-copy-label]").innerText(), labels.idle, "Failed copying must not claim success");
  const selection = await page.evaluate(() => {
    const range = getSelection()?.rangeCount ? getSelection().getRangeAt(0) : null;
    return { text: range?.cloneContents().textContent, focusedCode: document.activeElement?.matches(".blog-code pre") };
  });
  assert.equal(selection.text, expected, "The manual fallback must select the complete visible code");
  assert(selection.focusedCode, "The selected code must receive keyboard focus for manual copying");
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
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin });
    const page = await context.newPage();
    watch(page, `${locale}/${width}`);
    try {
      await open(page, paths(locale).index);
      assert(await page.locator(".blog-grid").isVisible());
      assert(await page.locator("article.blog-card").count() > 0);
      assert.equal(await page.locator("[data-blog-copy]").count(), 0);
      assert.equal(await page.locator('script[src="/scripts/blog-copy.js"]').count(), 0, "Copy runtime must remain article-only");
      await checkNavigation(page, locale, false);
      await checkCover(page.locator("article.blog-card img").first(), `${locale}/${width}/index`);
      if (width === 1280) await checkAccessibility(page, `${locale}/index`);
      const more = page.locator(`a[data-blog-read-more][href="${paths(locale).article}"]`);
      await follow(page, more, paths(locale).article);
      await checkArticle(page, locale);
      await checkCover(page.locator(".blog-hero-image img"), `${locale}/${width}/article`);
      if (width === 1280) await checkAccessibility(page, `${locale}/article`);
      await checkCopyButtons(page, locale);
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

  for (const locale of ["en", "ar"]) for (const failure of ["rejected", "unavailable"]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await context.addInitScript((mode) => {
      if (mode === "unavailable") Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
      else Object.defineProperty(navigator.clipboard, "writeText", { configurable: true, value: () => Promise.reject(new DOMException("Clipboard permission denied", "NotAllowedError")) });
    }, failure);
    const page = await context.newPage();
    watch(page, `${locale}/clipboard-${failure}`);
    try {
      await open(page, paths(locale).article);
      await checkCopyFailure(page, locale);
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
      const copyButtons = page.locator("[data-blog-copy]");
      assert.equal(await copyButtons.count(), 7);
      for (const button of await copyButtons.all()) {
        assert(await button.evaluate((element) => element.hidden));
        assert.equal(await button.isVisible(), false, "No-JavaScript readers must not encounter inactive Copy controls");
      }
      await follow(page, page.locator(`main a[href="${paths(locale).index}"]`).first(), paths(locale).index);
    } finally { await context.close(); }
  }
  assert.deepEqual(errors, [], errors.join("\n"));
  console.log("Blog browser checks passed: EN/AR reading and language navigation, article metadata and covers, four WCAG scans, exact clipboard copying and manual fallback, code/TOC accessibility, responsive grids/header fit, and no-JavaScript reading.");
} finally {
  await browser?.close();
  server.kill();
}
