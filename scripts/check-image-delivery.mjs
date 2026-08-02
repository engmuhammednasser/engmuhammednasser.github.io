import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";
import { extname, join, resolve } from "node:path";

const root = resolve(process.cwd());
const htmlFiles = [];
const payloadFiles = [];
const failures = [];
const maxCardBytes = 150_000;

function collectHtmlFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "scripts") continue;
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) collectHtmlFiles(absolutePath);
    else if (entry.isFile() && extname(entry.name) === ".html") htmlFiles.push(absolutePath);
    else if (entry.isFile() && extname(entry.name) === ".txt") payloadFiles.push(absolutePath);
  }
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(?:x([0-9a-f]+)|([0-9]+));/gi, (_, hex, decimal) =>
      String.fromCodePoint(Number.parseInt(hex ?? decimal, hex ? 16 : 10))
    );
}

function localPathExists(pathname) {
  const cleanPath = decodeURIComponent(decodeHtmlEntities(pathname).split(/[?#]/)[0]);
  if (!cleanPath.startsWith("/")) return true;
  const target = resolve(root, cleanPath.replace(/^\/+/, ""));
  const candidates = [target, `${target}.html`, join(target, "index.html")];
  return candidates.some((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

function reportFailure(message) {
  failures.push(message);
}

function checkSrcsets(content, relativePath) {
  for (const match of content.matchAll(/\bsrcset="([^"]+)"/gi)) {
    for (const candidate of match[1].split(",")) {
      const source = candidate.trim().split(/\s+/)[0];
      if (source.startsWith("/") && !localPathExists(source)) {
        reportFailure(`${relativePath}: missing srcset asset ${source}`);
      }
    }
  }
}

function checkPilotPictures(content, relativePath) {
  for (const match of content.matchAll(/<picture\b[^>]*data-pilot-thumbnail="([^"]+)"[^>]*>([\s\S]*?)<\/picture>/gi)) {
    const slug = match[1];
    const body = match[2];
    const image = body.match(/<img\b[^>]*>/i)?.[0] ?? "";
    if (!/\bloading="(?:lazy|eager)"/.test(image) || !/\bdecoding="async"/.test(image)) {
      reportFailure(`${relativePath}: pilot thumbnail ${slug} has invalid loading/decoding policy`);
    }
    if (/\bloading="eager"/.test(image) && !/\bfetchpriority="high"/.test(image)) {
      reportFailure(`${relativePath}: eager pilot thumbnail ${slug} is missing fetchpriority=high`);
    }
    if (!/\bwidth="\d+"/.test(image) || !/\bheight="\d+"/.test(image)) {
      reportFailure(`${relativePath}: pilot thumbnail ${slug} is missing intrinsic dimensions`);
    }
  }
}

function checkWorkImages(content, relativePath) {
  if (!new Set(["work/index.html", "ar/work/index.html"]).has(relativePath)) return;
  for (const match of content.matchAll(/<img\b[^>]*\bsrc="\/projects\/[^"]+"[^>]*>/gi)) {
    const image = match[0];
    if (!/\bloading="(?:lazy|eager)"/.test(image) || !/\bdecoding="async"/.test(image)) {
      reportFailure(`${relativePath}: Work project image has invalid loading/decoding policy`);
    }
  }
  const images = [...content.matchAll(/<img\b[^>]*\bsrc="\/projects\/[^\"]+"[^>]*>/gi)].map((match) => match[0]);
  if (images.length !== 12) reportFailure(`${relativePath}: expected 12 active Work project images, found ${images.length}`);
  const primary = images[0] ?? "";
  if (!/\bloading="eager"/.test(primary) || !/\bfetchpriority="high"/.test(primary)) {
    reportFailure(`${relativePath}: primary Work image must be eager with fetchpriority=high`);
  }
  images.slice(1).forEach((image) => {
    if (!/\bloading="lazy"/.test(image) || /\bfetchpriority="high"/.test(image)) {
      reportFailure(`${relativePath}: non-primary Work image must remain lazy without high priority`);
    }
  });
}

function isCriticalImagePreload(href) {
  if (href.startsWith("/logos/")) return true;
  if (!href.startsWith("/projects/")) return !href.startsWith("/backend/");
  return /\/cover\.(?:avif|gif|jpeg|jpg|png|svg|webp)$/i.test(href) ||
    /\/01-(?:home|homepage-hero)(?:-[^/]+)?\.(?:avif|gif|jpeg|jpg|png|svg|webp)$/i.test(href);
}

function checkPreloads(content, relativePath) {
  for (const match of content.matchAll(/<link\b(?=[^>]*\brel="preload")(?=[^>]*\bas="image")[^>]*>/gi)) {
    const href = match[0].match(/\bhref="([^"]+)"/i)?.[1] ?? "";
    if (href === "/profile.png") reportFailure(`${relativePath}: profile.png is still preloaded`);
    if ((href.startsWith("/projects/") || href.startsWith("/backend/")) && !isCriticalImagePreload(href)) {
      reportFailure(`${relativePath}: noncritical image preload remains: ${href}`);
    }
  }
}

function checkGeneratedVariants() {
  const optimizedDirectories = [];
  for (const project of readdirSync(join(root, "projects"), { withFileTypes: true })) {
    if (!project.isDirectory()) continue;
    const directory = join(root, "projects", project.name, "optimized");
    if (existsSync(directory) && statSync(directory).isDirectory()) optimizedDirectories.push(directory);
  }

  for (const directory of optimizedDirectories) {
    const manifestPath = join(directory, "manifest.json");
    if (!existsSync(manifestPath)) {
      reportFailure(`${directory}: optimized directory is missing manifest.json`);
      continue;
    }

    let manifest;
    try {
      manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch {
      reportFailure(`${manifestPath}: invalid JSON manifest`);
      continue;
    }

    const budget = manifest.policy?.maxBytes ?? maxCardBytes;
    for (const [name, metadata] of Object.entries(manifest.variants ?? {})) {
      const output = join(directory, name);
      if (!existsSync(output)) {
        reportFailure(`${manifestPath}: missing generated variant ${name}`);
        continue;
      }
      const bytes = statSync(output).size;
      if (bytes > budget) {
        reportFailure(`${output}: ${bytes} bytes exceeds card budget ${budget}`);
      }
      if (metadata.bytes !== bytes) {
        reportFailure(`${manifestPath}: byte count for ${name} is stale (${metadata.bytes} != ${bytes})`);
      }
    }
  }
}

collectHtmlFiles(root);
for (const file of htmlFiles) {
  const content = readFileSync(file, "utf8");
  const relativePath = file.slice(root.length + 1).replaceAll("\\", "/");
  checkSrcsets(content, relativePath);
  checkPilotPictures(content, relativePath);
  checkWorkImages(content, relativePath);
  checkPreloads(content, relativePath);
}

for (const file of payloadFiles) {
  const content = readFileSync(file, "utf8");
  const relativePath = file.slice(root.length + 1).replaceAll("\\", "/");
  for (const match of content.matchAll(/^:HL\["([^"]+)","image"\]/gm)) {
    const href = match[1];
    if (href === "/profile.png") reportFailure(`${relativePath}: profile.png is still preloaded in payload`);
    if ((href.startsWith("/projects/") || href.startsWith("/backend/")) && !isCriticalImagePreload(href)) {
      reportFailure(`${relativePath}: noncritical image preload remains in payload: ${href}`);
    }
  }
}
checkGeneratedVariants();

console.log(`Checked image delivery in ${htmlFiles.length} HTML files and ${payloadFiles.length} payload files.`);
if (failures.length) {
  console.error(`Found ${failures.length} image delivery failures:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const pilotPictures = htmlFiles.reduce(
  (total, file) => total + (readFileSync(file, "utf8").match(/data-pilot-thumbnail=/g)?.length ?? 0),
  0
);
console.log(`Validated ${pilotPictures} pilot picture deliveries and generated-thumbnail budgets.`);
