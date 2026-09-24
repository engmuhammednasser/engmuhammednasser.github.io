import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { attribute, htmlFiles, routeFor } from "./static-site-utils.mjs";

const root = resolve(".");
const manifest = JSON.parse(readFileSync("data/image-delivery.json", "utf8"));
const local = (url) => resolve(root, "." + decodeURIComponent(url.replaceAll("&amp;", "&")));
let pages = 0, previews = 0;
for (const file of htmlFiles(root)) {
  const html = readFileSync(file, "utf8"), route = routeFor(root, file);
  assert(!/<script\b[^>]*src="\/_next\//i.test(html) && !/\bself\.__next_f\b/.test(html), `${route}: obsolete hydration bootstrap`);
  assert(!/<link\b(?=[^>]*as="script")(?=[^>]*href="\/_next\/)/i.test(html), `${route}: obsolete JS preload`);
  const utility = ["/404.html", "/404/", "/_not-found/"].includes(route);
  assert((utility && /<style\b/i.test(html)) || /<link\b(?=[^>]*rel="stylesheet")(?=[^>]*href="\/_next\/)/i.test(html), `${route}: missing base CSS`);
  assert(!/src="\/scripts\/(?:kuwait-arc|torathyat|armadillo-studio)-screenshots\.js"/.test(html), `${route}: conflicting screenshot controller`);
  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
    const source = attribute(tag, "data-optimized-preview");
    if (!source) continue;
    const entry = manifest.images[source];
    assert(entry, `${route}: missing preview manifest entry ${source}`);
    assert(entry.variants.some((v) => v.url === attribute(tag, "src")), `${route}: incorrect preview fallback`);
    assert(attribute(tag, "srcset"), `${route}: missing responsive preview sizes`);
    if (attribute(tag, "loading") === "lazy") assert(attribute(tag, "sizes").startsWith("auto,"), `${route}: lazy preview should match its layout size`);
    previews++;
  }
  for (const [picture] of html.matchAll(/<picture\b[^>]*data-optimized-avif[^>]*>[\s\S]*?<\/picture>/gi)) {
    const image = picture.match(/<img\b[^>]*>/i)?.[0] ?? "";
    const source = picture.match(/<source\b[^>]*>/i)?.[0] ?? "";
    const variants = manifest.images[attribute(image, "data-optimized-preview")]?.avifVariants;
    assert(variants?.length, `${route}: missing AVIF manifest entry`);
    assert.equal(attribute(source, "type"), "image/avif", `${route}: incorrect picture type`);
    assert.equal(attribute(source, "sizes"), attribute(image, "sizes"), `${route}: AVIF/WebP sizes mismatch`);
    assert.equal(attribute(source, "srcset"), variants.map(v => `${v.url} ${v.width}w`).join(", "), `${route}: incorrect AVIF srcset`);
  }
  for (const [tag] of html.matchAll(/<link\b[^>]*data-optimized-preload[^>]*>/gi)) {
    const entry = manifest.images[attribute(tag, "data-optimized-preload")];
    const variants = attribute(tag, "type") === "image/avif" ? entry?.avifVariants : entry?.variants;
    assert(variants?.some(v => v.url === attribute(tag, "href")), `${route}: mismatched preview preload format`);
    assert.equal(attribute(tag, "imagesrcset"), variants.map(v => `${v.url} ${v.width}w`).join(", "), `${route}: mismatched preview preload candidates`);
  }
  pages++;
}
for (const [source, entry] of Object.entries(manifest.images)) {
  assert.equal(statSync(local(source)).size, entry.sourceBytes, `Original changed: ${source}`);
  assert.equal(createHash("sha256").update(readFileSync(local(source))).digest("hex"), entry.sourceHash, `Original content changed: ${source}`);
  for (const variant of entry.variants) {
    assert(existsSync(local(variant.url)), `Missing ${variant.url}`);
    assert.equal(statSync(local(variant.url)).size, variant.bytes, `Stale bytes for ${variant.url}`);
    const metadata = await sharp(local(variant.url)).metadata();
    assert.equal(metadata.width, variant.width, `Incorrect srcset width: ${variant.url}`);
    assert.equal(metadata.height, variant.height, `Incorrect preview height: ${variant.url}`);
    assert(variant.bytes < entry.sourceBytes, `Preview is larger than its original: ${variant.url}`);
    assert(variant.width <= entry.width && variant.height <= entry.height, `Upscaled ${variant.url}`);
  }
  if (entry.avifVariants?.length) {
    assert.equal(entry.avifVariants.length, entry.variants.length, `Incomplete AVIF width coverage: ${source}`);
    for (const variant of entry.avifVariants) {
      const webp = entry.variants.find(v => v.width === variant.width);
      assert(webp && webp.height === variant.height, `AVIF dimensions differ from fallback: ${source}`);
      assert.equal(statSync(local(variant.url)).size, variant.bytes, `Stale AVIF bytes: ${variant.url}`);
      const metadata = await sharp(local(variant.url)).metadata();
      assert.equal(metadata.width, variant.width, `Incorrect AVIF width: ${variant.url}`);
      assert.equal(metadata.height, variant.height, `Incorrect AVIF height: ${variant.url}`);
      assert(variant.bytes <= webp.bytes * (1 - manifest.avifPolicy.minimumSaving), `Insufficient AVIF savings: ${variant.url}`);
    }
  }
}
const catalog = JSON.parse(readFileSync("data/projects.json", "utf8"));
for (const project of catalog.projects) {
  if (statSync(local(project.thumbnail.original)).size > manifest.policy.minimumSourceBytes) {
    assert(project.thumbnail.webp800 && project.thumbnail.avif800, `${project.slug}: oversized unoptimized Work thumbnail`);
  }
}
console.log(`Verified standalone runtime in ${pages} pages and ${previews} responsive image deliveries with preserved originals.`);
