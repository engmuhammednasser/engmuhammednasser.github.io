import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const root = resolve(process.cwd());
const ignoredDirectories = new Set([".git", "node_modules", "scripts"]);
const htmlFiles = [];

function collectHtmlFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        collectHtmlFiles(join(directory, entry.name));
      }
      continue;
    }

    if (entry.isFile() && extname(entry.name) === ".html") {
      htmlFiles.push(join(directory, entry.name));
    }
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
  const target = resolve(root, cleanPath.replace(/^\/+/, ""));
  const candidates = [target, `${target}.html`, join(target, "index.html")];

  return candidates.some((candidate) => {
    try {
      return existsSync(candidate) && statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
}

collectHtmlFiles(root);

const missingReferences = new Map();
const attributePattern = /\b(?:href|src)=["'](\/[^"'<>]+)["']/g;

for (const htmlFile of htmlFiles) {
  const content = readFileSync(htmlFile, "utf8");

  for (const match of content.matchAll(attributePattern)) {
    const reference = match[1];

    if (reference.startsWith("//") || localPathExists(reference)) {
      continue;
    }

    if (!missingReferences.has(reference)) {
      missingReferences.set(reference, []);
    }

    const sources = missingReferences.get(reference);
    if (sources.length < 3) {
      sources.push(htmlFile.slice(root.length + 1));
    }
  }
}

console.log(`Checked ${htmlFiles.length} HTML files.`);

if (missingReferences.size === 0) {
  console.log("All local href/src references resolve.");
  process.exit(0);
}

console.error(`Found ${missingReferences.size} missing local references:`);
for (const [reference, sources] of missingReferences) {
  console.error(`- ${reference} (${sources.join(", ")})`);
}
process.exit(1);
