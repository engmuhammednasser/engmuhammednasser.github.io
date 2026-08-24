import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { caseStudyRouteFiles, findScreenshotButtons } from "./case-study-screenshot-scroll-utils.mjs";

const root = resolve(process.cwd());
const errors = [];
const bySlug = new Map();
let pageCount = 0;
let buttonCount = 0;

function fail(file, message) {
  errors.push(`${relative(root, file)}: ${message}`);
}

const runtime = readFileSync(resolve(root, "scripts/case-study-screenshots.js"), "utf8");
if (!runtime.includes("data-case-study-scroll-hint")) fail(resolve(root, "scripts/case-study-screenshots.js"), "runtime missing scroll hint contract");
if (!runtime.includes("scrollHeight > card.clientHeight")) fail(resolve(root, "scripts/case-study-screenshots.js"), "runtime does not gate hint on native overflow");
if (!runtime.includes("data-full-src\") || card.getAttribute(\"data-src")) fail(resolve(root, "scripts/case-study-screenshots.js"), "runtime does not support current and legacy full-view sources");
if (!runtime.includes("pointercancel") || !runtime.includes("pointerup")) fail(resolve(root, "scripts/case-study-screenshots.js"), "runtime missing pointer gesture reset handling");

for (const file of caseStudyRouteFiles(root)) {
  const html = readFileSync(file, "utf8");
  const buttons = findScreenshotButtons(html);
  if (!buttons.length) continue;

  pageCount += 1;
  buttonCount += buttons.length;
  const route = relative(root, file).replaceAll("\\", "/");
  const slug = route.replace(/^ar\/work\//, "").replace(/^work\//, "").replace(/\/index\.html$/, "");
  const locale = route.startsWith("ar/") ? "ar" : "en";
  bySlug.set(slug, { ...(bySlug.get(slug) || {}), [locale]: buttons.length });

  if (!html.includes("/scripts/case-study-screenshots.js")) fail(file, "missing shared case-study screenshot runtime");
  if (/document\.querySelectorAll\('\.case-shot'\)[\s\S]*?mouseenter/i.test(html)) fail(file, "legacy transform hover script is still present");

  buttons.forEach((button, index) => {
    const label = `screenshot button ${index + 1}`;
    const markup = button.markup;
    if (!/\bdata-case-study-screenshot\b/i.test(markup)) fail(file, `${label} missing data-case-study-screenshot`);
    if (!/\bdata-full-src="/i.test(markup)) fail(file, `${label} missing normalized data-full-src`);
    if (/overflow\s*:\s*hidden/i.test(markup)) fail(file, `${label} still uses overflow:hidden`);
    if (!/overflow-y\s*:\s*auto/i.test(markup)) fail(file, `${label} missing overflow-y:auto`);
    if (!/-webkit-overflow-scrolling\s*:\s*touch/i.test(markup)) fail(file, `${label} missing touch momentum scrolling`);
    if (!/touch-action\s*:\s*pan-y/i.test(markup)) fail(file, `${label} missing touch-action:pan-y`);
    if (!/overscroll-behavior\s*:\s*contain/i.test(markup)) fail(file, `${label} missing overscroll containment`);
    if (/transition\s*:\s*transform/i.test(markup)) fail(file, `${label} still animates transform`);
    if (/will-change\s*:\s*transform/i.test(markup)) fail(file, `${label} still reserves transform will-change`);
    if (!/transition\s*:\s*none/i.test(markup)) fail(file, `${label} image missing transition:none`);
    if (!/will-change\s*:\s*auto/i.test(markup)) fail(file, `${label} image missing will-change:auto`);
  });
}

for (const [slug, counts] of [...bySlug.entries()].sort()) {
  if (!counts.en || !counts.ar) fail(`${slug}`, "missing EN/AR screenshot route parity");
  if (counts.en && counts.ar && counts.en !== counts.ar) fail(`${slug}`, `EN/AR screenshot count mismatch (${counts.en} vs ${counts.ar})`);
}

if (errors.length) {
  console.error(`Case-study screenshot scroll check failed with ${errors.length} issue(s):`);
  errors.slice(0, 80).forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Case-study screenshot scroll check passed: ${buttonCount} screenshots across ${pageCount} EN/AR project pages.`);
