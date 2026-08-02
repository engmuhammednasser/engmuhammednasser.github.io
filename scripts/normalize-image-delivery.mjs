import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const payloadExtensions = new Set([".html", ".txt"]);
const workIndexPaths = new Set(["work/index.html", "ar/work/index.html"]);

function collectFiles(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;

    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      collectFiles(absolutePath, files);
    } else if (payloadExtensions.has(extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function addImageAttribute(tag, name, value) {
  const attributePattern = new RegExp(`\\s${name}="[^"]*"`, "i");
  if (attributePattern.test(tag)) {
    return tag.replace(attributePattern, ` ${name}="${value}"`);
  }

  return tag.replace(/^<img\b/i, `<img ${name}="${value}"`);
}

function normalizeProjectImage(tag) {
  let normalized = addImageAttribute(tag, "loading", "lazy");
  normalized = addImageAttribute(normalized, "decoding", "async");
  return normalized;
}

function isCriticalImagePreload(href) {
  if (href.startsWith("/logos/")) return true;
  if (!href.startsWith("/projects/")) return !href.startsWith("/backend/");
  return /\/cover\.(?:avif|gif|jpeg|jpg|png|svg|webp)$/i.test(href) ||
    /\/01-(?:home|homepage-hero)(?:-[^/]+)?\.(?:avif|gif|jpeg|jpg|png|svg|webp)$/i.test(href);
}

function imagePreloadHref(tag) {
  return tag.match(/\bhref="([^"]+)"/i)?.[1] ?? "";
}

function normalizeBelowFoldImages(content) {
  const seenProjectRoots = new Set();
  let normalizedCount = 0;
  const normalized = content.replace(
    /<img\b[^>]*\bsrc="(\/projects\/[^"?]+|\/backend\/[^"?]+)"[^>]*>/gi,
    (tag, src) => {
      if (src.startsWith("/backend/")) {
        normalizedCount += 1;
        return normalizeProjectImage(tag);
      }

      const projectRoot = src.split("/").slice(0, 3).join("/");
      if (!seenProjectRoots.has(projectRoot)) {
        seenProjectRoots.add(projectRoot);
        return tag;
      }

      normalizedCount += 1;
      return normalizeProjectImage(tag);
    }
  );

  return { content: normalized, normalizedCount };
}

function normalizeHtml(content, relativePath) {
  let normalized = content;
  let profilePreloadsRemoved = 0;
  let galleryPreloadsRemoved = 0;
  let projectImagesNormalized = 0;
  let galleryImagesNormalized = 0;

  normalized = normalized.replace(
    /<link\b(?=[^>]*\brel="preload")(?=[^>]*\bas="image")[^>]*>/gi,
    (tag) => {
      const href = imagePreloadHref(tag);
      if (href === "/profile.png") {
        profilePreloadsRemoved += 1;
        return "";
      }
      if ((href.startsWith("/projects/") || href.startsWith("/backend/")) && !isCriticalImagePreload(href)) {
        galleryPreloadsRemoved += 1;
        return "";
      }
      return tag;
    }
  );

  if (!workIndexPaths.has(relativePath)) {
    const result = normalizeBelowFoldImages(normalized);
    normalized = result.content;
    galleryImagesNormalized = result.normalizedCount;
  }

  normalized = normalized.replace(
    /<img\b[^>]*\bsrc="\/profile\.png"[^>]*>/gi,
    (tag) => addImageAttribute(addImageAttribute(tag, "loading", "lazy"), "decoding", "async")
  );

  if (workIndexPaths.has(relativePath)) {
    normalized = normalized.replace(
      /<img\b[^>]*\bsrc="\/projects\/[^"]+"[^>]*>/gi,
      (tag) => {
        projectImagesNormalized += 1;
        return normalizeProjectImage(tag);
      }
    );
  }

  return {
    content: normalized,
    profilePreloadsRemoved,
    galleryPreloadsRemoved,
    projectImagesNormalized,
    galleryImagesNormalized
  };
}

function normalizePayload(content) {
  let profilePreloadsRemoved = 0;
  let galleryPreloadsRemoved = 0;
  const pattern = /^:HL\["([^"]+)","image"\]\r?\n?/gm;
  return {
    content: content.replace(pattern, (line, href) => {
      if (href === "/profile.png") {
        profilePreloadsRemoved += 1;
        return "";
      }
      if ((href.startsWith("/projects/") || href.startsWith("/backend/")) && !isCriticalImagePreload(href)) {
        galleryPreloadsRemoved += 1;
        return "";
      }
      return line;
    }),
    profilePreloadsRemoved,
    galleryPreloadsRemoved
  };
}

function syncEmbeddedPayload(htmlFile) {
  const payloadFile = join(dirname(htmlFile), "index.txt");
  if (!existsSync(payloadFile)) return false;

  const rawLines = new Map(
    readFileSync(payloadFile, "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => [line.slice(0, line.indexOf(":")), line])
  );
  const original = readFileSync(htmlFile, "utf8");
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

  if (updated === original) return false;
  writeFileSync(htmlFile, updated, "utf8");
  return true;
}

let changedFiles = 0;
let profilePreloadsRemoved = 0;
let galleryPreloadsRemoved = 0;
let projectImagesNormalized = 0;
let galleryImagesNormalized = 0;

for (const file of collectFiles(root)) {
  const relativePath = relative(root, file).replaceAll("\\", "/");
  const original = readFileSync(file, "utf8");
  const result = relativePath.endsWith(".html")
    ? normalizeHtml(original, relativePath)
    : normalizePayload(original);

  profilePreloadsRemoved += result.profilePreloadsRemoved;
  galleryPreloadsRemoved += result.galleryPreloadsRemoved ?? 0;
  projectImagesNormalized += result.projectImagesNormalized ?? 0;
  galleryImagesNormalized += result.galleryImagesNormalized ?? 0;

  if (result.content !== original) {
    writeFileSync(file, result.content, "utf8");
    changedFiles += 1;
  }
}

let embeddedPayloadsSynchronized = 0;
for (const file of collectFiles(root)) {
  if (extname(file) === ".html" && syncEmbeddedPayload(file)) embeddedPayloadsSynchronized += 1;
}

console.log(`Image delivery normalization scanned ${collectFiles(root).length} HTML/payload files.`);
console.log(`Removed ${profilePreloadsRemoved} profile image preload declarations.`);
console.log(`Removed ${galleryPreloadsRemoved} noncritical project/gallery preload declarations.`);
console.log(`Standardized ${projectImagesNormalized} Work-page project images for lazy loading and async decoding.`);
console.log(`Standardized ${galleryImagesNormalized} below-fold project/backend images for lazy loading and async decoding.`);
console.log(`Synchronized ${embeddedPayloadsSynchronized} embedded Next payloads.`);
console.log(`Updated ${changedFiles} files.`);
