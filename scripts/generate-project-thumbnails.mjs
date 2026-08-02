import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.cwd());
const pipelineVersion = 3;
const maxVariantBytes = 150_000;
const widths = [480, 800];
const formats = [
  {
    extension: "avif",
    initialQuality: 55,
    minimumQuality: 35,
    qualityStep: 5,
    extraArgs: ["-define", "heic:speed=6"]
  },
  {
    extension: "webp",
    initialQuality: 68,
    minimumQuality: 30,
    qualityStep: 5,
    extraArgs: ["-define", "webp:method=6"]
  }
];

function readWorkCardSources() {
  const sources = new Map();

  for (const relativePath of ["work/index.html", "ar/work/index.html"]) {
    const content = readFileSync(join(root, relativePath), "utf8");
    const imagePattern = /<img\b[^>]*\bsrc="(\/projects\/[^"?]+)"[^>]*>/gi;

    for (const match of content.matchAll(imagePattern)) {
      const sourceUrl = match[1];
      const parts = sourceUrl.split("/").filter(Boolean);
      const project = parts[1];
      if (project && !sources.has(project)) {
        sources.set(project, sourceUrl);
      }
    }
  }

  return sources;
}

function resolveOriginalSource(project, sourceUrl) {
  if (!sourceUrl.includes("/optimized/")) return sourceUrl;

  const manifestPath = join(root, "projects", project, "optimized", "manifest.json");
  if (!existsSync(manifestPath)) return sourceUrl;

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (typeof manifest.source === "string") return `/${manifest.source}`;
  } catch {
    // The normal missing/invalid-manifest error is reported after resolution.
  }

  return sourceUrl;
}

function parseProjectArguments() {
  const projectFlagIndex = process.argv.indexOf("--projects");
  const allRequested = process.argv.includes("--all");

  if (allRequested) return null;
  if (projectFlagIndex === -1) {
    throw new Error("Pass --projects slug[,slug...] or --all.");
  }

  const values = process.argv[projectFlagIndex + 1]?.split(",").map((value) => value.trim()).filter(Boolean);
  if (!values?.length) {
    throw new Error("--projects requires at least one project slug.");
  }

  return new Set(values);
}

function runMagick(args) {
  const result = spawnSync("magick", args, { encoding: "utf8" });
  if (result.error) {
    throw new Error(`Could not run ImageMagick (magick): ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`ImageMagick failed: ${result.stderr || result.stdout}`);
  }
}

function identify(file) {
  const result = spawnSync("magick", ["identify", "-format", "%w %h", file], {
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(`Could not identify ${file}: ${result.stderr || result.stdout}`);
  }

  const [width, height] = result.stdout.trim().split(/\s+/).map(Number);
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error(`Invalid dimensions returned for ${file}.`);
  }

  return { width, height };
}

function variantDimensions(sourceDimensions, targetWidth) {
  const width = Math.min(sourceDimensions.width, targetWidth);
  const height = Math.max(1, Math.round((sourceDimensions.height * width) / sourceDimensions.width));
  return { width, height };
}

function shouldGenerate(output, source, manifest, key) {
  if (!existsSync(output)) return true;
  if (!manifest || manifest.pipelineVersion !== pipelineVersion || !manifest.variants?.[key]) {
    return true;
  }

  return statSync(output).mtimeMs < statSync(source).mtimeMs;
}

function generateVariant(source, output, format, width) {
  let quality = format.initialQuality;

  while (true) {
    runMagick([
      source,
      "-auto-orient",
      "-resize",
      `${width}x>`,
      "-strip",
      "-quality",
      String(quality),
      ...format.extraArgs,
      output
    ]);

    if (statSync(output).size <= maxVariantBytes || quality <= format.minimumQuality) {
      return quality;
    }

    quality = Math.max(format.minimumQuality, quality - format.qualityStep);
  }
}

function writeJsonIfChanged(file, value) {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  if (existsSync(file) && readFileSync(file, "utf8") === content) return false;
  writeFileSync(file, content, "utf8");
  return true;
}

const requestedProjects = parseProjectArguments();
const sourceMap = readWorkCardSources();
const projects = requestedProjects
  ? [...requestedProjects]
  : [...sourceMap.keys()];

if (!projects.length) throw new Error("No project card sources were found.");

let generated = 0;
let skipped = 0;

for (const project of projects) {
  const selectedSourceUrl = sourceMap.get(project);
  if (!selectedSourceUrl) {
    throw new Error(`No Work-card source found for project '${project}'.`);
  }
  const sourceUrl = resolveOriginalSource(project, selectedSourceUrl);

  const source = join(root, sourceUrl.replace(/^\//, "").replaceAll("/", "\\"));
  if (!existsSync(source)) throw new Error(`Missing source image: ${sourceUrl}`);

  const sourceDimensions = identify(source);
  const optimizedDirectory = join(root, "projects", project, "optimized");
  mkdirSync(optimizedDirectory, { recursive: true });
  const manifestPath = join(optimizedDirectory, "manifest.json");
  let previousManifest = null;

  if (existsSync(manifestPath)) {
    try {
      previousManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch {
      previousManifest = null;
    }
  }

  const manifest = {
    pipelineVersion,
    source: relative(root, source).replaceAll("\\", "/"),
    sourceBytes: statSync(source).size,
    sourceWidth: sourceDimensions.width,
    sourceHeight: sourceDimensions.height,
    policy: {
      widths,
      formats: formats.map(({ extension }) => extension),
      preserveAspectRatio: true,
      noUpscaling: true,
      maxBytes: maxVariantBytes,
      quality: {
        avif: { initial: 55, minimum: 35 },
        webp: { initial: 68, minimum: 30 }
      }
    },
    variants: {}
  };

  for (const width of widths) {
    for (const format of formats) {
      const key = `thumb-${width}.${format.extension}`;
      const output = join(optimizedDirectory, key);
      const outputDimensions = variantDimensions(sourceDimensions, width);
      let qualityUsed = format.initialQuality;

      if (shouldGenerate(output, source, previousManifest, key)) {
        qualityUsed = generateVariant(source, output, format, width);
        generated += 1;
      } else {
        skipped += 1;
        qualityUsed = previousManifest.variants[key].quality;
      }

      manifest.variants[key] = {
        width: outputDimensions.width,
        height: outputDimensions.height,
        bytes: statSync(output).size,
        quality: qualityUsed
      };
    }
  }

  writeJsonIfChanged(manifestPath, manifest);
  console.log(`${project}: ${relative(root, source)} -> ${Object.entries(manifest.variants).map(([name, value]) => `${name} ${value.bytes} B (q${value.quality})`).join(", ")}`);
}

console.log(`Thumbnail pipeline complete: generated ${generated}, skipped ${skipped}.`);
