import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const projectRoot = path.join(root, "projects", "mariam-fathy-shop");
const gallery = JSON.parse(fs.readFileSync(path.join(root, "data", "mariam-fathy-gallery.json"), "utf8"));
const heroWidths = [800, 1200, 1600];
const heroFormats = [
  { extension: "avif", quality: 55, extraArgs: ["-define", "heic:speed=6"] },
  { extension: "webp", quality: 72, extraArgs: ["-define", "webp:method=6"] }
];
const previewWidths = { dashboard: 960, desktop: 960, mobile: 480 };

function runMagick(args) {
  const result = spawnSync("magick", args, { encoding: "utf8" });
  if (result.error) throw new Error(`Could not run ImageMagick: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`ImageMagick failed: ${result.stderr || result.stdout}`);
}

function identify(file) {
  const result = spawnSync("magick", ["identify", "-format", "%w %h", file], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Could not identify ${file}: ${result.stderr || result.stdout}`);
  const [width, height] = result.stdout.trim().split(/\s+/).map(Number);
  if (!Number.isFinite(width) || !Number.isFinite(height)) throw new Error(`Invalid dimensions for ${file}.`);
  return { width, height };
}

function dimensionsFor(sourceDimensions, width) {
  const outputWidth = Math.min(sourceDimensions.width, width);
  return {
    width: outputWidth,
    height: Math.max(1, Math.round((sourceDimensions.height * outputWidth) / sourceDimensions.width))
  };
}

function flattenItems() {
  return gallery.sourceGroups.flatMap((group) => {
    const variants = group.variants ?? [{ id: null, items: group.items }];
    return variants.flatMap((variant) => variant.items.map((item) => ({ group: group.id, item })));
  });
}

function generate(source, output, width, quality, extraArgs) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  runMagick([
    source,
    "-auto-orient",
    "-resize",
    `${width}x>`,
    "-strip",
    "-quality",
    String(quality),
    ...extraArgs,
    output
  ]);
}

const heroSource = path.join(projectRoot, "cover.png");
const heroSourceDimensions = identify(heroSource);
const heroManifest = {};

for (const width of heroWidths) {
  const dimensions = dimensionsFor(heroSourceDimensions, width);
  for (const format of heroFormats) {
    const filename = `hero-${width}.${format.extension}`;
    const output = path.join(projectRoot, "optimized", filename);
    generate(heroSource, output, width, format.quality, format.extraArgs);
    heroManifest[filename] = {
      width: dimensions.width,
      height: dimensions.height,
      bytes: fs.statSync(output).size,
      quality: format.quality
    };
  }
}

const galleryManifest = [];
for (const { group, item } of flattenItems()) {
  const original = path.join(projectRoot, item.target);
  if (!fs.existsSync(original)) throw new Error(`Missing gallery original: ${item.target}`);
  const previewTarget = `previews/${item.target.replace(/\.[^.]+$/, ".webp")}`;
  const preview = path.join(projectRoot, previewTarget);
  const width = previewWidths[group];
  const sourceDimensions = identify(original);
  const dimensions = dimensionsFor(sourceDimensions, width);
  generate(original, preview, width, 72, ["-define", "webp:method=6"]);
  galleryManifest.push({
    group,
    original: item.target,
    preview: previewTarget,
    width: dimensions.width,
    height: dimensions.height,
    bytes: fs.statSync(preview).size
  });
}

const manifest = {
  schemaVersion: 1,
  hero: {
    original: "cover.png",
    originalBytes: fs.statSync(heroSource).size,
    originalWidth: heroSourceDimensions.width,
    originalHeight: heroSourceDimensions.height,
    variants: heroManifest
  },
  gallery: {
    originalCount: galleryManifest.length,
    previewFormat: "webp",
    previewWidths,
    items: galleryManifest
  }
};

fs.writeFileSync(path.join(projectRoot, "media-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
const previewBytes = galleryManifest.reduce((total, item) => total + item.bytes, 0);
console.log(`Generated hero variants: ${Object.keys(heroManifest).length}.`);
console.log(`Generated gallery previews: ${galleryManifest.length} (${previewBytes} bytes total).`);
