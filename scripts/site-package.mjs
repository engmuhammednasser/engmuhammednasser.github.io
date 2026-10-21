import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const origin = "https://engmuhammednasser.github.io";
const runtimeFiles = new Set([
  "scripts/portfolio-effects.js", "scripts/portfolio-effects.css",
  "scripts/mobile-navigation.js", "scripts/case-study-screenshots.js",
  "scripts/work-archive.js", "scripts/torathyat-case-study.css"
]);
const rootFiles = new Set([
  ".nojekyll", "robots.txt", "sitemap.xml", "data/projects.json",
  "favicon.ico", "favicon.png", "favicon.svg", "profile.png", "icons.svg",
  "file.svg", "globe.svg", "next.svg", "vercel.svg", "window.svg"
]);
const requiredFiles = ["index.html", "404.html", ".nojekyll", "robots.txt", "sitemap.xml", "data/projects.json"];
const imageExtensions = new Set([".avif", ".webp", ".png", ".jpg", ".jpeg", ".svg", ".ico"]);
// Below the existing ignored dependency directory: source generators cannot recurse into this copy.
export const siteDirectory = "node_modules/.cache/pages/site";
const maximumBytes = 1_000_000_000;

function validPath(file) {
  return typeof file === "string" && file.length > 0 && !file.includes("\\") && !file.includes(":") &&
    !file.startsWith("/") && file.split("/").every(part => part && part !== "." && part !== "..");
}

export function isPublicFile(file) {
  if (!validPath(file)) return false;
  if (rootFiles.has(file) || runtimeFiles.has(file)) return true;
  if (["index.html", "ar/index.html", "404.html", "404/index.html", "_not-found/index.html"].includes(file)) return true;
  if (/^(?:ar\/)?(?:about|backend|contact|lab|services|work)(?:\/[^/.][^/]*)*\/index\.html$/.test(file)) return true;
  if (/^_next\/static\/chunks\/[^/]+\.css$/.test(file)) return true;
  if (/^_next\/static\/media\/[^/]+\.woff2$/.test(file)) return true;
  // Retain all tracked media in this first phase, including originals and older captures.
  return /^(?:projects|plugins|backend|images|logos|_next\/static\/media)\//.test(file) &&
    file.split("/").every(part => !part.startsWith(".")) && imageExtensions.has(extname(file));
}

function inside(root, target) {
  const path = relative(root, target);
  return !isAbsolute(path) && path !== ".." && !path.startsWith(`..${sep}`);
}

function regularFile(root, file) {
  assert(validPath(file), `Invalid site path: ${file}`);
  let target = root;
  for (const part of file.split("/")) {
    target = join(target, part);
    assert(!lstatSync(target).isSymbolicLink(), `Symbolic links are not publishable: ${file}`);
    assert(inside(root, realpathSync(target)), `Source escapes the site root: ${file}`);
  }
  assert(lstatSync(target).isFile(), `Not a regular file: ${file}`);
  return target;
}

export function collectPublicFiles(root) {
  root = realpathSync(root);
  const entries = execFileSync("git", ["ls-files", "--stage", "-z"], { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  const files = [];
  for (const entry of entries.split("\0").filter(Boolean)) {
    const [metadata, ...pathParts] = entry.split("\t");
    const file = pathParts.join("\t");
    const [mode, , stage] = metadata.split(" ");
    assert.equal(stage, "0", `Unresolved Git index entry: ${file}`);
    if (!isPublicFile(file)) continue;
    assert(["100644", "100755"].includes(mode), `Not a tracked regular file: ${file}`);
    regularFile(root, file);
    files.push(file);
  }
  for (const file of requiredFiles) assert(files.includes(file), `Required tracked site file is missing: ${file}`);
  return files.sort();
}

function decodeEntities(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#x[0-9a-f]+|#\d+);/gi, entity => {
    const named = { "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">" };
    if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
    return String.fromCodePoint(Number.parseInt(entity.slice(entity[2].toLowerCase() === "x" ? 3 : 2, -1), entity[2].toLowerCase() === "x" ? 16 : 10));
  });
}

function localTarget(value, source) {
  value = decodeEntities(value.trim());
  if (!value || value.startsWith("#") || /^(?:data|mailto|tel):/i.test(value)) return null;
  const url = new URL(value, `${origin}/${source}`);
  if (url.origin !== origin) return null;
  // Decode before path resolution. Encoded separators/dot segments must not hide traversal.
  const decoded = decodeURIComponent(value.split(/[?#]/)[0]);
  assert(!decoded.includes("\\") && !decoded.includes("\0"), `Invalid URL in ${source}`);
  if (!/^(?:https?:)?\/\//i.test(value)) {
    const parts = value.startsWith("/") ? [] : source.split("/").slice(0, -1);
    for (const part of decoded.split("/")) {
      if (!part || part === ".") continue;
      if (part === "..") {
        assert(parts.length, `URL traverses above the site root in ${source}: ${value}`);
        parts.pop();
      } else parts.push(part);
    }
  }
  return decodeURIComponent(url.pathname).replace(/^\/+/, "");
}

export function validateReferences(root, files) {
  const selected = new Set(files);
  for (const file of files) {
    assert(isPublicFile(file), `Development file cannot be published: ${file}`);
    regularFile(root, file);
  }
  function check(value, source) {
    const target = localTarget(value, source);
    if (target === null) return;
    const directory = target.replace(/\/$/, "");
    const candidates = target.endsWith("/") || !target ? [`${directory ? `${directory}/` : ""}index.html`] : [target, `${target}.html`, `${target}/index.html`];
    assert(candidates.some(path => selected.has(path)), `Unpublished local reference in ${source}: ${value}`);
  }
  function cssReferences(content, source) {
    for (const match of content.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]*))\s*\)/gi)) check(match[1] ?? match[2] ?? match[3], source);
  }
  for (const file of files) {
    if (!/\.(?:html|css)$/.test(file)) continue;
    const content = readFileSync(join(root, file), "utf8");
    if (file.endsWith(".html")) {
      const tags = content.match(/<[a-z][^>]*>/gi) ?? [];
      for (const tag of tags) {
        for (const match of tag.matchAll(/\s(href|src|srcset|imagesrcset|poster|data-src|data-full-src|data-project-data)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
          const value = match[2] ?? match[3] ?? match[4];
          if (/^(?:srcset|imagesrcset)$/i.test(match[1])) {
            assert(!value.trim().startsWith("data:"), `Inline srcset requires explicit support: ${file}`);
            for (const candidate of value.split(",")) check(candidate.trim().split(/\s+/)[0], file);
          } else check(value, file);
        }
      }
    }
    cssReferences(content, file);
  }
  const catalog = JSON.parse(readFileSync(join(root, "data/projects.json"), "utf8"));
  for (const project of catalog.projects) {
    for (const value of [...Object.values(project.thumbnail), ...Object.values(project.caseStudy)]) {
      if (typeof value === "string" && value.startsWith("/")) check(value, "data/projects.json");
    }
  }
}

function cacheDirectory(root) {
  let current = root;
  for (const part of ["node_modules", ".cache", "pages"]) {
    current = join(current, part);
    if (!existsSync(current)) mkdirSync(current);
    assert(!lstatSync(current).isSymbolicLink() && lstatSync(current).isDirectory(), "Unsafe Pages cache directory");
    assert(inside(root, realpathSync(current)), "Pages cache escapes the workspace");
  }
  return current;
}

function outputFiles(root, directory = root, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = join(directory, entry.name);
    assert(!lstatSync(target).isSymbolicLink(), `Link found in Pages output: ${entry.name}`);
    assert(inside(root, realpathSync(target)), "Pages output escapes its root");
    if (entry.isDirectory()) outputFiles(root, target, files);
    else {
      assert(entry.isFile() && statSync(target).nlink === 1, "Pages output must contain regular, unlinked files");
      files.push(relative(root, target).split(sep).join("/"));
    }
  }
  return files.sort();
}

function hash(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function verifyCopy(root, siteRoot, files) {
  assert.deepEqual(outputFiles(siteRoot), files, "Pages file set differs from the tracked publishing policy");
  let bytes = 0;
  for (const file of files) {
    const target = regularFile(siteRoot, file);
    assert.equal(hash(target), hash(regularFile(root, file)), `Packaged bytes differ: ${file}`);
    bytes += statSync(target).size;
  }
  assert(bytes < maximumBytes, `Pages output exceeds the 1 GB site limit: ${bytes} bytes`);
  validateReferences(siteRoot, files);
  return { siteRoot, files, bytes };
}

export function packageSite(root = process.cwd()) {
  root = realpathSync(root);
  const files = collectPublicFiles(root);
  validateReferences(root, files);
  const cache = cacheDirectory(root), siteRoot = join(cache, "site"), manifestPath = join(cache, "manifest.json");
  const marker = lstatSync(manifestPath, { throwIfNoEntry: false });
  if (marker) {
    assert(marker.isFile() && !marker.isSymbolicLink() && marker.nlink === 1, "Unsafe Pages manifest file");
  }
  if (existsSync(siteRoot)) {
    assert(!lstatSync(siteRoot).isSymbolicLink() && lstatSync(siteRoot).isDirectory(), "Unsafe Pages output directory");
    assert(inside(cache, realpathSync(siteRoot)), "Pages output escapes its cache");
    assert(existsSync(manifestPath) && JSON.parse(readFileSync(manifestPath, "utf8")).format === 1, "Refusing to replace unrecognized Pages output");
    outputFiles(siteRoot); // Reject links/junctions before removing only our generated output.
  }
  const staging = mkdtempSync(join(cache, "stage-"));
  try {
    for (const file of files) {
      const target = join(staging, file);
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(regularFile(root, file), target);
    }
    const result = verifyCopy(root, staging, files);
    if (existsSync(siteRoot)) rmSync(siteRoot, { recursive: true });
    renameSync(staging, siteRoot);
    writeFileSync(manifestPath, JSON.stringify({ format: 1, bytes: result.bytes, files }, null, 2) + "\n");
    return { ...result, siteRoot };
  } finally {
    if (existsSync(staging)) {
      assert(inside(cache, realpathSync(staging)) && !lstatSync(staging).isSymbolicLink(), "Unsafe temporary Pages directory");
      rmSync(staging, { recursive: true });
    }
  }
}

export function verifySitePackage(root = process.cwd()) {
  root = realpathSync(root);
  const cache = cacheDirectory(root), siteRoot = join(cache, "site");
  assert(existsSync(siteRoot) && !lstatSync(siteRoot).isSymbolicLink(), "Build the Pages artifact first");
  assert(inside(cache, realpathSync(siteRoot)), "Pages output escapes its cache");
  return verifyCopy(root, siteRoot, collectPublicFiles(root));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  assert(process.argv.length <= 3 && (!process.argv[2] || process.argv[2] === "--check"), "Usage: node scripts/site-package.mjs [--check]");
  const result = process.argv[2] === "--check" ? verifySitePackage() : packageSite();
  console.log(`Pages artifact ${process.argv[2] ? "verified" : "built"}: ${result.files.length} files, ${result.bytes} bytes at ${siteDirectory}.`);
}
