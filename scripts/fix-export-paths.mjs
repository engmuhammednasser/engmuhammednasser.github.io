import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const ignoredDirectories = new Set([".git", "node_modules", "scripts"]);
const textExtensions = new Set([".html", ".js", ".txt"]);
const replacements = [
  ["/demo/projects/ashhalan/cover.png", "/projects/ashhalan/home-page.png"],
  ["/projects/crm-order-management/ربط ووكومرس.png", "/projects/crm-order-management/ربط WooCommerce.png"],
  ["/demo/", "/"],
  ["/en/", "/"]
];

let changedFiles = 0;
let replacementsMade = 0;

function fixDirectory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        fixDirectory(path);
      }
      continue;
    }

    if (!entry.isFile() || !textExtensions.has(extname(entry.name))) {
      continue;
    }

    const original = readFileSync(path, "utf8");
    let updated = original;
    let fileReplacements = 0;

    for (const [from, to] of replacements) {
      const parts = updated.split(from);
      fileReplacements += parts.length - 1;
      updated = parts.join(to);
    }

    if (updated !== original) {
      writeFileSync(path, updated, "utf8");
      changedFiles += 1;
      replacementsMade += fileReplacements;
      console.log(`Fixed ${relative(root, path)}`);
    }
  }
}

fixDirectory(root);
console.log(`Updated ${changedFiles} files with ${replacementsMade} path replacements.`);
