import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const document = JSON.parse(readFileSync(resolve(root, "data/projects.json"), "utf8"));
const failures = [];

function fail(message) {
  failures.push(message);
}

function findImage(value) {
  if (Array.isArray(value)) {
    for (const child of value) {
      const image = findImage(child);
      if (image) return image;
    }
  } else if (value && typeof value === "object") {
    if (typeof value.src === "string" && value.src.startsWith("/projects/")) return value;
    for (const child of Object.values(value)) {
      const image = findImage(child);
      if (image) return image;
    }
  }
  return null;
}

function checkImagePolicy(content, relativePath, expectedSlugs) {
  const cards = [...content.matchAll(/<article\b[^>]*data-project-id="([^"]+)"[^>]*>([\s\S]*?)<\/article>/gi)];
  const images = cards.map(([, slug, body]) => ({ slug, tag: body.match(/<img\b[^>]*>/i)?.[0] ?? "" }));
  const primary = images[0];
  if (!primary || primary.slug !== expectedSlugs[0]) {
    fail(`${relativePath}: primary Work card does not match the canonical first project`);
    return;
  }
  if (!/\bloading="eager"/.test(primary.tag) || !/\bfetchpriority="high"/.test(primary.tag)) {
    fail(`${relativePath}: primary Work image must be eager with fetchpriority=high`);
  }
  if (!primary.tag.includes(`/projects/${expectedSlugs[0]}/optimized/`)) {
    fail(`${relativePath}: primary Work image must use an optimized source`);
  }
  images.slice(1).forEach(({ slug, tag }) => {
    if (!/\bloading="lazy"/.test(tag) || /\bfetchpriority="high"/.test(tag)) {
      fail(`${relativePath}: non-primary Work image ${slug} must remain lazy without high priority`);
    }
  });
  images.forEach(({ slug, tag }) => {
    const project = document.projects.find((entry) => entry.slug === slug);
    const hasOptimizedVariants = Boolean(project?.thumbnail?.avif480 || project?.thumbnail?.avif800 || project?.thumbnail?.webp480 || project?.thumbnail?.webp800);
    if (hasOptimizedVariants && !tag.includes(`/projects/${slug}/optimized/`)) {
      fail(`${relativePath}: Work image ${slug} has optimized variants but uses the original card source`);
    }
  });
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
  const images = grid?.[3]?.children?.map((card) => findImage(card)).filter(Boolean) ?? [];
  if (images.length !== expectedSlugs.length) {
    fail(`${file}: payload grid does not contain one image per active card`);
  } else {
    const primary = images[0];
    if (primary.loading !== "eager" || primary.fetchPriority !== "high" || !primary.src.includes(`/projects/${expectedSlugs[0]}/optimized/`)) {
      fail(`${file}: payload primary Work image has an invalid priority/source policy`);
    }
    images.slice(1).forEach((image, index) => {
      if (image.loading !== "lazy" || image.fetchPriority) fail(`${file}: payload non-primary Work image ${index + 2} is not lazy without priority`);
    });
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
  if ((html.match(/decoding="async"/g) ?? []).length !== 12) fail(`${file}: active card images are not all async-decoded`);
  checkImagePolicy(html, file, expectedSlugs);
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
