import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const document = JSON.parse(readFileSync(resolve(root, "data/projects.json"), "utf8"));
const failures = [];

function fail(message) {
  failures.push(message);
}

function checkPayload(file, locale, expectedSlugs) {
  const content = readFileSync(resolve(root, file), "utf8");
  const line = content.split(/\r?\n/).find((entry) => entry.startsWith("5:"));
  if (!line) {
    fail(`${file}: missing Work Flight payload root`);
    return;
  }
  let tree;
  try {
    tree = JSON.parse(line.slice(2));
  } catch {
    fail(`${file}: invalid Work Flight payload JSON`);
    return;
  }
  let grid;
  const visit = (value) => {
    if (Array.isArray(value)) {
      if (value[3]?.id === "work-project-grid") grid = value;
      value.forEach(visit);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(visit);
    }
  };
  visit(tree);
  const slugs = grid?.[3]?.children?.map((card) => card?.[3]?.["data-project-id"]) ?? [];
  if (slugs.length !== expectedSlugs.length || slugs.some((slug, index) => slug !== expectedSlugs[index])) {
    fail(`${file}: payload grid does not match the ${expectedSlugs.length}-card canonical initial slice`);
  }
  if (locale === "ar" && !content.includes("data-work-locale")) fail(`${file}: Arabic payload is missing locale metadata`);
}

for (const [file, locale] of [["work/index.html", "en"], ["ar/work/index.html", "ar"]]) {
  const html = readFileSync(resolve(root, file), "utf8");
  const expectedSlugs = document.projects.slice(0, 12).map((project) => project.slug);
  const activeSlugs = [...html.matchAll(/data-project-id="([^"]+)"/g)].map((match) => match[1]);
  const noScriptSection = html.match(/<noscript>([\s\S]*?)<\/noscript>/i)?.[1] ?? "";
  const noScriptSlugs = [...noScriptSection.matchAll(new RegExp(`href="/${locale === "ar" ? "ar/" : ""}work/([^/]+)/"`, "g"))].map((match) => match[1]);

  if (activeSlugs.length !== 12 || activeSlugs.some((slug, index) => slug !== expectedSlugs[index])) {
    fail(`${file}: expected exactly the canonical first 12 active cards`);
  }
  if (noScriptSlugs.length !== document.projects.length) fail(`${file}: no-JS link list has ${noScriptSlugs.length} projects, expected ${document.projects.length}`);
  if (new Set(noScriptSlugs).size !== noScriptSlugs.length) fail(`${file}: no-JS link list contains duplicate project routes`);
  if ((html.match(/data-work-filter="/g) ?? []).length !== document.categories.length) fail(`${file}: category filter count is out of sync`);
  if ((html.match(/aria-pressed="(?:true|false)"/g) ?? []).length !== document.categories.length) fail(`${file}: filters are missing aria-pressed state`);
  if ((html.match(/data-work-load-more/g) ?? []).length !== 2) fail(`${file}: Load More control is missing or duplicated`);
  if (!html.includes('aria-controls="work-project-grid"')) fail(`${file}: Load More control is missing aria-controls`);
  if ((html.match(/<script[^>]+data-work-archive/g) ?? []).length !== 1) fail(`${file}: Work controller script is missing or duplicated`);
  if ((html.match(/loading="lazy"/g) ?? []).length !== 12) fail(`${file}: active card images are not all lazy-loaded`);
  if ((html.match(/decoding="async"/g) ?? []).length !== 12) fail(`${file}: active card images are not all async-decoded`);
  checkPayload(file.replace("index.html", "index.txt"), locale, expectedSlugs);
}

const runtime = readFileSync(resolve(root, "scripts/work-archive.js"), "utf8");
if (runtime.includes("MutationObserver")) fail("scripts/work-archive.js: MutationObserver is not allowed");
if (runtime.includes("document.querySelectorAll")) fail("scripts/work-archive.js: document-wide querySelectorAll is not allowed");
if (!runtime.includes("initialBatch = 12")) fail("scripts/work-archive.js: initial progressive batch is not 12");

if (failures.length) {
  console.error(`Found ${failures.length} Work archive failures:`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Checked EN/AR Work archives: ${document.projects.length} canonical projects, 12 initial cards, and ${document.projects.length} no-JS routes per locale.`);
