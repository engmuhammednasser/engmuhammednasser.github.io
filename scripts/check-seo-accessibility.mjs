import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const origin = "https://engmuhammednasser.github.io";
const routesDocument = JSON.parse(readFileSync(resolve(root, "data/routes.json"), "utf8"));
const routeMap = new Map(routesDocument.routes.map((route) => [route.route, route]));
const failures = [];

function fail(message) {
  failures.push(message);
}

function tags(content, tag) {
  return [...content.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] ?? "";
}

function metaTags(content, selector, value) {
  return tags(content, "meta").filter((tag) => attr(tag, selector) === value);
}

function routeFile(route) {
  const relativePath = route === "/" ? "index.html" : `${route.replace(/^\//, "")}index.html`;
  return resolve(root, relativePath);
}

function routeFromUrl(url) {
  if (!url.startsWith(origin)) return null;
  return url.slice(origin.length) || "/";
}

function parseJsonLd(content, route) {
  const scripts = [...content.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*data-seo-structured-data[^>]*>([\s\S]*?)<\/script>/gi)];
  if (scripts.length !== 1) {
    fail(`${route}: expected one generated JSON-LD script, found ${scripts.length}`);
    return;
  }
  try {
    const nodes = JSON.parse(scripts[0][1]);
    if (!Array.isArray(nodes) || nodes.length === 0) fail(`${route}: generated JSON-LD must be a non-empty array`);
    for (const node of nodes) {
      if (node["@context"] !== "https://schema.org") fail(`${route}: JSON-LD has an invalid context`);
      if (!node["@type"]) fail(`${route}: JSON-LD node is missing @type`);
      if (node.url && routeFromUrl(node.url) !== route) fail(`${route}: JSON-LD URL is not route-specific`);
    }
  } catch (error) {
    fail(`${route}: JSON-LD is not valid JSON (${error.message})`);
  }
}

for (const record of routesDocument.routes) {
  const file = routeFile(record.route);
  if (!statSync(file, { throwIfNoEntry: false })) {
    fail(`${record.route}: route file is missing`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
  const titleTags = [...html.matchAll(/<title>[\s\S]*?<\/title>/gi)];
  if (titleTags.length !== 1) fail(`${record.route}: expected exactly one title`);
  if (record.indexable) {
    const description = metaTags(html, "name", "description");
    if (description.length !== 1 || !attr(description[0], "content").trim()) fail(`${record.route}: indexable route needs one non-empty description`);
    const canonical = tags(html, "link").filter((tag) => attr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical"));
    if (canonical.length !== 1 || attr(canonical[0], "href") !== `${origin}${record.route}`) fail(`${record.route}: canonical URL is missing or incorrect`);
    for (const [selector, value, label] of [["property", "og:title", "og:title"], ["property", "og:description", "og:description"], ["property", "og:image", "og:image"], ["property", "og:url", "og:url"], ["property", "og:type", "og:type"], ["name", "twitter:card", "twitter:card"], ["name", "twitter:title", "twitter:title"], ["name", "twitter:description", "twitter:description"], ["name", "twitter:image", "twitter:image"]]) {
      const values = metaTags(html, selector, value);
      if (values.length !== 1 || !attr(values[0], "content").trim()) fail(`${record.route}: ${label} metadata is missing or duplicated`);
    }
    const ogUrl = attr(metaTags(html, "property", "og:url")[0] ?? "", "content");
    if (ogUrl !== `${origin}${record.route}`) fail(`${record.route}: og:url is not route-specific`);
    const alternates = tags(html, "link").filter((tag) => attr(tag, "rel").toLowerCase().split(/\s+/).includes("alternate") && attr(tag, "hreflang"));
    if (!record.enEquivalent || !record.arEquivalent) {
      if (alternates.length) fail(`${record.route}: hreflang exists for a route without a validated equivalent`);
    } else {
      const expected = new Map([["en", `${origin}${record.enEquivalent}`], ["ar", `${origin}${record.arEquivalent}`], ["x-default", `${origin}${record.enEquivalent}`]]);
      if (alternates.length !== expected.size) fail(`${record.route}: expected ${expected.size} hreflang links, found ${alternates.length}`);
      for (const alternate of alternates) {
        const language = attr(alternate, "hreflang");
        if (expected.get(language) !== attr(alternate, "href")) fail(`${record.route}: invalid ${language} hreflang target`);
        if (!routeMap.has(routeFromUrl(attr(alternate, "href")))) fail(`${record.route}: hreflang target does not exist`);
      }
    }
    if (attr(htmlTag, "lang") !== record.locale) fail(`${record.route}: html lang does not match locale`);
    if (record.locale === "ar" && attr(htmlTag, "dir") !== "rtl") fail(`${record.route}: Arabic route is not rtl`);
    const main = tags(html, "main");
    if (main.length !== 1 || attr(main[0], "id") !== "main-content") fail(`${record.route}: expected one main#main-content landmark`);
    if (!new RegExp(`<a\\b[^>]*href="#main-content"[^>]*data-skip-link`, "i").test(html)) fail(`${record.route}: skip link is missing`);
    const navs = tags(html, "nav");
    if (!navs.length || !navs.some((nav) => attr(nav, "aria-label").trim())) fail(`${record.route}: navigation landmark lacks an accessible label`);
    const menuButtons = tags(html, "button").filter((button) => /aria-expanded=/.test(button));
    if (menuButtons.length !== 1 || attr(menuButtons[0], "aria-controls") !== "mobile-navigation") fail(`${record.route}: mobile menu button relationship is incomplete`);
    if (!/<div\b[^>]*id="mobile-navigation"[^>]*role="dialog"/i.test(html)) fail(`${record.route}: mobile navigation dialog relationship is incomplete`);
    const h1Count = tags(html, "h1").length;
    if (h1Count !== 1) fail(`${record.route}: expected one h1, found ${h1Count}`);
    const headings = [...html.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
    for (let index = 1; index < headings.length; index += 1) {
      if (headings[index] > headings[index - 1] + 1) fail(`${record.route}: heading level jumps from h${headings[index - 1]} to h${headings[index]}`);
    }
    const images = tags(html, "img");
    if (images.some((image) => !/\balt="/i.test(image))) fail(`${record.route}: an image is missing alt`);
    parseJsonLd(html, record.route);
  } else {
    const robots = metaTags(html, "name", "robots");
    if (robots.length !== 1 || !/noindex/i.test(attr(robots[0], "content"))) fail(`${record.route}: utility route must remain noindex`);
  }

  const buttons = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)].map((match) => ({ opening: `<button${match[1]}>`, content: match[2] }));
  if (buttons.some((button) => !attr(button.opening, "aria-label") && !button.content.replace(/<[^>]+>/g, "").trim())) fail(`${record.route}: button without accessible name`);
  const externalLinks = [...html.matchAll(/<a\b[^>]*href="https?:\/\/[^\"]+"[^>]*>/gi)].map((match) => match[0]);
  if (externalLinks.some((link) => /target="_blank"/i.test(link) && !/rel="[^"]*noopener/i.test(link))) fail(`${record.route}: target=_blank external link lacks noopener`);
}

for (const route of ["/work/", "/ar/work/"]) {
  const html = readFileSync(routeFile(route), "utf8");
  const filterButtons = tags(html, "button").filter((button) => /data-work-filter=/.test(button));
  if (filterButtons.length !== 5) fail(`${route}: Work filter count changed`);
  if (filterButtons.some((button) => !/aria-pressed="(?:true|false)"/.test(button))) fail(`${route}: Work filter lacks aria-pressed`);
  const loadMoreButtons = tags(html, "button").filter((button) => /data-work-load-more(?:\s|=|>)/.test(button));
  if (loadMoreButtons.length !== 1 || !/aria-controls="work-project-grid"/.test(html)) fail(`${route}: Load More semantics changed`);
}

const css = readFileSync(resolve(root, "scripts/portfolio-effects.css"), "utf8");
if (!/:where\(a, button, input, select, textarea\):focus-visible/.test(css) || !/\[data-skip-link\]:focus-visible/.test(css)) fail("portfolio-effects.css: shared focus/skip styles are missing");

const robots = readFileSync(resolve(root, "robots.txt"), "utf8");
if (!/^User-agent: \*\r?\nAllow: \/\r?\n/m.test(robots)) fail("robots.txt: public root is not allowed");
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) fail("robots.txt: sitemap URL is missing");
const sitemap = readFileSync(resolve(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedSitemap = routesDocument.routes.filter((route) => route.indexable).map((route) => `${origin}${route.route}`).sort();
if (sitemapUrls.length !== expectedSitemap.length || new Set(sitemapUrls).size !== sitemapUrls.length || sitemapUrls.slice().sort().some((url, index) => url !== expectedSitemap[index])) {
  fail(`sitemap.xml: expected exactly ${expectedSitemap.length} unique canonical URLs`);
}

if (failures.length) {
  console.error(`Found ${failures.length} SEO/accessibility failures:`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Checked ${routesDocument.routes.filter((route) => route.indexable).length} indexable routes for metadata, hreflang, semantics, JSON-LD, robots, and sitemap integrity.`);
