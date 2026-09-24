import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { attribute, htmlFiles, setAttribute, writeChanged } from "./static-site-utils.mjs";

// Add AVIF only to heavy previews; WebP and full-resolution originals stay intact.
const root = resolve(".");
const manifestPath = resolve(root, "data/image-delivery.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const local = url => resolve(root, "." + decodeURIComponent(url.replaceAll("&amp;", "&")));
const recipe = "avif-q55-e5-444-v1";
const policy = { minimumPreviewBytes: 150000, minimumSaving: 0.1, quality: 55, effort: 5, chromaSubsampling: "4:4:4" };
const fallback = variants => variants.find(v => v.width >= 960) ?? variants.at(-1);
const selected = Object.entries(manifest.images).filter(([, entry]) => fallback(entry.variants).bytes > policy.minimumPreviewBytes);
let encoded = 0;
function save() {
  manifest.avifPolicy = policy;
  writeChanged(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}
async function encode([source, entry]) {
  if (entry.avifRecipe === recipe && Array.isArray(entry.avifVariants) && entry.avifVariants.every(v => existsSync(local(v.url)) && statSync(local(v.url)).size === v.bytes)) return;
  const original = readFileSync(local(source));
  if (createHash("sha256").update(original).digest("hex") !== entry.sourceHash) throw new Error(`Regenerate WebP variants first: ${source}`);
  const results = [];
  // All widths must improve, so a small viewport cannot inherit a larger fallback.
  for (const webp of entry.variants) {
    const result = await sharp(original).rotate()
      .resize({ width: webp.width, height: webp.height, fit: "fill", withoutEnlargement: true })
      .avif({ quality: policy.quality, effort: policy.effort, chromaSubsampling: policy.chromaSubsampling })
      .toBuffer({ resolveWithObject: true });
    if (result.info.size > webp.bytes * (1 - policy.minimumSaving)) {
      entry.avifVariants = [];
      entry.avifRecipe = recipe;
      save();
      console.log(`Retained WebP; AVIF does not save 10% at every width: ${source}`);
      return;
    }
    results.push({ data: result.data, variant: { url: webp.url.replace(/\.webp$/, ".avif"), width: result.info.width, height: result.info.height, bytes: result.info.size, quality: policy.quality } });
  }
  for (const { data, variant } of results) writeFileSync(local(variant.url), data);
  entry.avifVariants = results.map(result => result.variant);
  entry.avifRecipe = recipe;
  save();
  console.log(`Added AVIF for heavy preview ${++encoded}: ${source}`);
}
let cursor = 0;
await Promise.all(Array.from({ length: 2 }, async () => { while (cursor < selected.length) await encode(selected[cursor++]); }));

const srcset = variants => variants.map(v => `${v.url} ${v.width}w`).join(", ");
let pages = 0, pictures = 0;
for (const file of htmlFiles(root)) {
  const original = readFileSync(file, "utf8");
  const used = new Set();
  let html = original.replace(/<picture\b[^>]*>[\s\S]*?<\/picture>|<img\b[^>]*>/gi, markup => {
    const isPicture = /^<picture\b/i.test(markup);
    if (isPicture && !/\bdata-optimized-avif\b/.test(markup.match(/^<picture\b[^>]*>/i)[0])) return markup;
    const tag = isPicture ? markup.match(/<img\b[^>]*>/i)?.[0] : markup;
    if (!tag) return markup;
    const source = attribute(tag, "data-optimized-preview");
    const variants = manifest.images[source]?.avifVariants;
    if (!variants?.length) return tag;
    used.add(source);
    pictures++;
    return `<picture data-optimized-avif style="display:contents"><source type="image/avif" srcset="${srcset(variants)}" sizes="${attribute(tag, "sizes")}">${tag}</picture>`;
  });
  html = html.replace(/<link\b[^>]*>/gi, tag => {
    const source = attribute(tag, "data-optimized-preload");
    if (attribute(tag, "as") !== "image" || !used.has(source)) return tag;
    const variants = manifest.images[source].avifVariants;
    let next = setAttribute(tag, "href", fallback(variants).url);
    next = setAttribute(next, "imagesrcset", srcset(variants));
    return setAttribute(next, "type", "image/avif");
  });
  if (writeChanged(file, html)) pages++;
}
save();
const optimized = selected.filter(([, entry]) => entry.avifVariants?.length);
console.log(JSON.stringify({ selected: selected.length, encoded, optimized: optimized.length, pages, pictures,
  webp960Bytes: optimized.reduce((n, [, entry]) => n + fallback(entry.variants).bytes, 0),
  avif960Bytes: optimized.reduce((n, [, entry]) => n + fallback(entry.avifVariants).bytes, 0) }));
