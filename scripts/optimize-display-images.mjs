import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";
import { htmlFiles, attribute, setAttribute, writeChanged, routeFor } from "./static-site-utils.mjs";

const root = resolve(".");
const manifestPath = resolve(root, "data/image-delivery.json");
const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { images: {} };
const images = previous.images;
const recipe = "webp-q72-e6-v2";
const policy = { minimumSourceBytes: 100000, widths: [480, 960, 1600], quality: 72, effort: 6, format: "webp", originalsPreserved: true };
function saveManifest() {
  writeFileSync(manifestPath, JSON.stringify({ schemaVersion: 2, policy, images: Object.fromEntries(Object.entries(images).sort(([a], [b]) => a.localeCompare(b))) }, null, 2) + "\n");
}
// Work cards are generated exclusively from canonical thumbnail metadata.
const files = htmlFiles(root).filter(file => !["/work/", "/ar/work/"].includes(routeFor(root, file)));
const decode = (url) => decodeURIComponent(url.replaceAll("&amp;", "&"));
const local = (url) => resolve(root, "." + decode(url));
const sources = new Set(Object.keys(images));

// Select only oversized images currently rendered without responsive variants.
// Existing specialized picture/hero pipelines and originals remain untouched.
for (const file of files) {
  const html = readFileSync(file, "utf8").replace(/<script\b[\s\S]*?<\/script>/gi, "");
  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
    const source = attribute(tag, "src");
    if (/^\/(?:projects\/|plugins\/|backend\/|profile\.)/.test(source) && /\.(?:png|jpe?g|webp)$/i.test(source) && !attribute(tag, "srcset") &&
        existsSync(local(source)) && statSync(local(source)).size > policy.minimumSourceBytes) sources.add(source);
  }
}

let generated = 0;
async function optimize(source) {
  const original = readFileSync(local(source));
  const sourceHash = createHash("sha256").update(original).digest("hex");
  if (images[source]?.sourceHash === sourceHash && images[source].recipe === recipe && images[source].variants.every((v) => existsSync(local(v.url)) && statSync(local(v.url)).size === v.bytes && v.bytes < original.length)) return;
  const metadata = await sharp(original).metadata();
  const directory = source === "/profile.png" ? "/images" : source.split("/").slice(0, 3).join("/");
  const key = createHash("sha256").update(source).digest("hex").slice(0, 16);
  const variants = [];
  for (const width of [480, 960, 1600]) {
    let result, quality;
    for (quality of [72, 68]) {
      result = await sharp(original).rotate()
        .resize({ width, height: 16380, fit: "inside", withoutEnlargement: true })
        .webp({ quality, effort: 6, smartSubsample: true }).toBuffer({ resolveWithObject: true });
      if (result.info.size < original.length) break;
    }
    if (result.info.size >= original.length) continue;
    if (variants.some((variant) => variant.width === result.info.width)) continue;
    const url = `${directory}/previews/${key}-${result.info.width}.webp`;
    const prior = images[source]?.sourceHash === sourceHash && images[source].variants.find((v) => v.url === url);
    if (prior && existsSync(local(url)) && statSync(local(url)).size === prior.bytes && prior.bytes <= result.info.size) {
      variants.push({ ...prior, quality: prior.quality ?? 82 });
      continue;
    }
    mkdirSync(dirname(local(url)), { recursive: true });
    writeFileSync(local(url), result.data);
    variants.push({ url, width: result.info.width, height: result.info.height, bytes: result.info.size, quality });
  }
  if (!variants.length) throw new Error(`No beneficial preview could be generated for ${source}`);
  images[source] = { sourceHash, recipe, sourceBytes: original.length, width: metadata.width, height: metadata.height, variants };
  if (++generated % 10 === 0) {
    saveManifest();
    console.log(`Generated responsive previews for ${generated}/${sources.size} oversized images.`);
  }
}
const queue = [...sources].sort();
let cursor = 0;
await Promise.all(Array.from({ length: 3 }, async () => { while (cursor < queue.length) await optimize(queue[cursor++]); }));

function preview(tag) {
  const marker = attribute(tag, "data-optimized-preview");
  const source = marker || attribute(tag, "src");
  const entry = images[source];
  if (!entry || (!marker && attribute(tag, "srcset"))) return tag;
  const fallback = entry.variants.find((v) => v.width >= 960) ?? entry.variants.at(-1);
  let next = setAttribute(tag, "src", fallback.url);
  next = setAttribute(next, "srcset", entry.variants.map((v) => `${v.url} ${v.width}w`).join(", "));
  const fallbackSizes = (attribute(tag, "sizes") || "(min-width: 1280px) 1200px, 100vw").replace(/^auto,\s*/, "");
  next = setAttribute(next, "sizes", (attribute(tag, "loading") === "lazy" ? "auto, " : "") + fallbackSizes);
  next = setAttribute(next, "data-optimized-preview", source);
  next = setAttribute(next, "decoding", "async");
  if (!attribute(tag, "width")) next = setAttribute(next, "width", entry.width);
  if (!attribute(tag, "height")) next = setAttribute(next, "height", entry.height);
  return next;
}

let changed = 0;
for (const file of files) {
  const original = readFileSync(file, "utf8");
  const sizesBySource = new Map([...original.matchAll(/<img\b[^>]*>/gi)].map(([tag]) => [attribute(tag, "data-optimized-preview") || attribute(tag, "src"), attribute(tag, "sizes")]));
  const lazySources = new Set(), eagerSources = new Set();
  for (const [tag] of original.matchAll(/<img\b[^>]*>/gi)) {
    const source = attribute(tag, "data-optimized-preview") || attribute(tag, "src");
    (attribute(tag, "loading") === "lazy" ? lazySources : eagerSources).add(source);
  }
  let html = original.replace(/<img\b[^>]*>/gi, preview);
  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    const source = attribute(tag, "data-optimized-preload") || attribute(tag, "href"), entry = images[source];
    if (attribute(tag, "as") === "image" && lazySources.has(source) && !eagerSources.has(source)) return "";
    if (!entry || attribute(tag, "as") !== "image") return tag;
    const fallback = entry.variants.find((v) => v.width >= 960) ?? entry.variants.at(-1);
    let next = setAttribute(tag, "href", fallback.url);
    next = setAttribute(next, "imagesrcset", entry.variants.map((v) => `${v.url} ${v.width}w`).join(", "));
    next = setAttribute(next, "imagesizes", (sizesBySource.get(source) || "(min-width: 1280px) 1200px, 100vw").replace(/^auto,\s*/, ""));
    return setAttribute(next, "data-optimized-preload", source);
  });
  if (writeChanged(file, html)) changed++;
}
saveManifest();
const entries = Object.values(images);
console.log(JSON.stringify({ generated, changedPages: changed, sources: entries.length, originalBytes: entries.reduce((n, v) => n + v.sourceBytes, 0), preview960Bytes: entries.reduce((n, v) => n + (v.variants.find((x) => x.width >= 960) ?? v.variants.at(-1)).bytes, 0) }));
