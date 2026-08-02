import {
  existsSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const pilotProjects = ["techmart", "oryxbag", "eventgift-egypt", "gobe", "afaaq-developments"];
const workIndexes = ["work/index.html", "ar/work/index.html"];
const listingPayloads = [
  "work/index.txt",
  "work/__next._full.txt",
  "work/__next.!KGVuKQ/work/__PAGE__.txt",
  "ar/work/index.txt",
  "ar/work/__next._full.txt",
  "ar/work/__next.ar/work/__PAGE__.txt"
];
const sizes = "(max-width: 768px) calc(100vw - 2rem), (max-width: 1280px) 50vw, 33vw";

function readWorkCardSources() {
  const sources = new Map();

  for (const relativePath of workIndexes) {
    const content = readFileSync(join(root, relativePath), "utf8");
    const imagePattern = /<img\b[^>]*\bsrc="(\/projects\/[^"?]+)"[^>]*>/gi;

    for (const match of content.matchAll(imagePattern)) {
      const sourceUrl = match[1];
      const parts = sourceUrl.split("/").filter(Boolean);
      const project = parts[1];
      if (project && !sources.has(project)) sources.set(project, sourceUrl);
    }
  }

  return sources;
}

function replaceAttribute(tag, name, value) {
  const pattern = new RegExp(`\\s${name}="[^"]*"`, "i");
  if (pattern.test(tag)) return tag.replace(pattern, ` ${name}="${value}"`);
  return tag.replace(/^<img\b/i, `<img ${name}="${value}"`);
}

function optimizedPicture(slug, imageTag, manifest) {
  const width = manifest.variants["thumb-800.webp"].width;
  const height = manifest.variants["thumb-800.webp"].height;
  const avifSrcset = [480, 800]
    .map((candidate) => `/projects/${slug}/optimized/thumb-${candidate}.avif ${candidate}w`)
    .join(", ");
  const webpSrcset = [480, 800]
    .map((candidate) => `/projects/${slug}/optimized/thumb-${candidate}.webp ${candidate}w`)
    .join(", ");
  let normalizedImage = replaceAttribute(
    replaceAttribute(
      replaceAttribute(imageTag, "src", `/projects/${slug}/optimized/thumb-800.webp`),
      "loading",
      "lazy"
    ),
    "decoding",
    "async"
  );
  normalizedImage = replaceAttribute(normalizedImage, "width", String(width));
  normalizedImage = replaceAttribute(normalizedImage, "height", String(height));

  return `<picture data-pilot-thumbnail="${slug}"><source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}"/><source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}"/>${normalizedImage}</picture>`;
}

function syncEmbedded(relativeHtmlPath, relativePayloadPath) {
  const rawLines = new Map(
    readFileSync(join(root, relativePayloadPath), "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => [line.slice(0, line.indexOf(":")), line])
  );
  const file = join(root, relativeHtmlPath);
  const original = readFileSync(file, "utf8");
  const pattern = /<script>self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)<\/script>/g;
  const updated = original.replace(pattern, (full, encoded) => {
    let decoded;
    try {
      decoded = JSON.parse(encoded);
    } catch {
      return full;
    }
    const id = decoded.slice(0, decoded.indexOf(":"));
    const raw = rawLines.get(id);
    return raw ? `<script>self.__next_f.push([1,${JSON.stringify(`${raw}\n`)}])</script>` : full;
  });

  if (updated !== original) writeFileSync(file, updated, "utf8");
}

const sources = readWorkCardSources();
let updatedFiles = 0;
let migratedImages = 0;

for (const project of pilotProjects) {
  const sourceUrl = sources.get(project);
  if (!sourceUrl) throw new Error(`No Work-card source found for '${project}'.`);

  const manifestPath = join(root, "projects", project, "optimized", "manifest.json");
  if (!existsSync(manifestPath)) throw new Error(`Missing thumbnail manifest for '${project}'.`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  for (const variant of ["thumb-480.avif", "thumb-800.avif", "thumb-480.webp", "thumb-800.webp"]) {
    const variantPath = join(root, "projects", project, "optimized", variant);
    if (!existsSync(variantPath)) throw new Error(`Missing ${variant} for '${project}'.`);
    if (statSync(variantPath).size > manifest.policy.maxBytes) {
      throw new Error(`${variantPath} exceeds the ${manifest.policy.maxBytes}-byte card budget.`);
    }
  }

  const fallbackUrl = `/projects/${project}/optimized/thumb-800.webp`;
  const escapedProject = project.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const projectAssetPattern = new RegExp(`/projects/${escapedProject}/[^"\\\\]+`, "g");
  for (const relativePath of listingPayloads) {
    const file = join(root, relativePath);
    const original = readFileSync(file, "utf8");
    const updated = original.replace(projectAssetPattern, fallbackUrl);
    if (updated !== original) writeFileSync(file, updated, "utf8");
  }

  for (const relativePath of workIndexes) {
    const file = join(root, relativePath);
    const original = readFileSync(file, "utf8");
    if (original.includes(`<picture data-pilot-thumbnail="${project}">`)) continue;
    const escapedSource = sourceUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const imagePattern = new RegExp(`<img\\b(?=[^>]*\\bsrc="${escapedSource}")[^>]*>`, "gi");
    let fileMigrated = false;
    const updated = original.replace(imagePattern, (imageTag) => {
      migratedImages += 1;
      fileMigrated = true;
      return optimizedPicture(project, imageTag, manifest);
    });

    if (fileMigrated && updated !== original) {
      writeFileSync(file, updated, "utf8");
      updatedFiles += 1;
    }
  }
}

syncEmbedded("work/index.html", "work/index.txt");
syncEmbedded("ar/work/index.html", "ar/work/index.txt");

console.log(`Migrated ${migratedImages} pilot card images across ${updatedFiles} locale Work pages.`);
