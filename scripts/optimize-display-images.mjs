import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";
import { htmlFiles, attribute, setAttribute, writeChanged } from "./static-site-utils.mjs";

const root = resolve(".");
const manifestPath = resolve(root, "data/image-delivery.json");
const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { images: {} };
const images = previous.images;
const files = htmlFiles(root);
const decode = (url) => decodeURIComponent(url.replaceAll("&amp;", "&"));
const local = (url) => resolve(root, "." + decode(url));
const sources = new Set(Object.keys(images));

// Select only oversized images currently rendered without responsive variants.
// Existing specialized picture/hero pipelines and originals remain untouched.
for (const file of files) {
  const html = readFileSync(file, "utf8").replace(/<script\b[\s\S]*?<\/script>/gi, "");
  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
    const source = attribute(tag, "src");
    if (source.startsWith("/projects/") && !attribute(tag, "srcset") &&
        existsSync(local(source)) && statSync(local(source)).size > 300_000) sources.add(source);
  }
}

let generated = 0;
for (const source of [...sources].sort()) {
  const original = readFileSync(local(source));
  const sourceHash = createHash("sha256").update(original).digest("hex");
  if (images[source]?.sourceHash === sourceHash && images[source].variants.every((v) => existsSync(local(v.url)) && v.bytes < original.length)) continue;
  const metadata = await sharp(original).metadata();
  const slug = source.split("/")[2];
  const key = createHash("sha256").update(source).digest("hex").slice(0, 16);
  const variants = [];
  for (const width of [480, 960, 1600]) {
    let result, quality;
    for (quality of [82, 76, 70]) {
      result = await sharp(original).rotate()
        .resize({ width, height: 16380, fit: "inside", withoutEnlargement: true })
        .webp({ quality, effort: 4, smartSubsample: true }).toBuffer({ resolveWithObject: true });
      if (result.info.size < original.length) break;
    }
    if (result.info.size >= original.length) continue;
    if (variants.some((variant) => variant.width === result.info.width)) continue;
    const url = `/projects/${slug}/previews/${key}-${result.info.width}.webp`;
    mkdirSync(dirname(local(url)), { recursive: true });
    writeFileSync(local(url), result.data);
    variants.push({ url, width: result.info.width, height: result.info.height, bytes: result.info.size, quality });
  }
  if (!variants.length) throw new Error(`No beneficial preview could be generated for ${source}`);
  images[source] = { sourceHash, sourceBytes: original.length, width: metadata.width, height: metadata.height, variants };
  if (++generated % 10 === 0) console.log(`Generated responsive previews for ${generated}/${sources.size} oversized images.`);
}

function preview(tag) {
  const marker = attribute(tag, "data-optimized-preview");
  const source = marker || attribute(tag, "src");
  const entry = images[source];
  if (!entry || (!marker && attribute(tag, "srcset"))) return tag;
  const fallback = entry.variants.find((v) => v.width >= 960) ?? entry.variants.at(-1);
  let next = setAttribute(tag, "src", fallback.url);
  next = setAttribute(next, "srcset", entry.variants.map((v) => `${v.url} ${v.width}w`).join(", "));
  next = setAttribute(next, "sizes", attribute(tag, "sizes") || "(min-width: 1280px) 1200px, 100vw");
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
  let html = original.replace(/<img\b[^>]*>/gi, preview);
  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    const source = attribute(tag, "data-optimized-preload") || attribute(tag, "href"), entry = images[source];
    if (!entry || attribute(tag, "as") !== "image") return tag;
    const fallback = entry.variants.find((v) => v.width >= 960) ?? entry.variants.at(-1);
    let next = setAttribute(tag, "href", fallback.url);
    next = setAttribute(next, "imagesrcset", entry.variants.map((v) => `${v.url} ${v.width}w`).join(", "));
    next = setAttribute(next, "imagesizes", sizesBySource.get(source) || "(min-width: 1280px) 1200px, 100vw");
    return setAttribute(next, "data-optimized-preload", source);
  });
  if (writeChanged(file, html)) changed++;
}
const manifest = { schemaVersion: 1, policy: { minimumSourceBytes: 300000, widths: [480, 960, 1600], quality: 82, format: "webp", originalsPreserved: true }, images: Object.fromEntries(Object.entries(images).sort(([a], [b]) => a.localeCompare(b))) };
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
const entries = Object.values(images);
console.log(JSON.stringify({ generated, changedPages: changed, sources: entries.length, originalBytes: entries.reduce((n, v) => n + v.sourceBytes, 0), preview960Bytes: entries.reduce((n, v) => n + (v.variants.find((x) => x.width >= 960) ?? v.variants.at(-1)).bytes, 0) }));
