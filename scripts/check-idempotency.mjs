import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.cwd());
const ignoredDirectories = new Set([".git", "node_modules", "docs", "scripts", "_next"]);
const trackedOutputExtensions = new Set([".html", ".txt", ".json", ".xml"]);

function collect(directory, output = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) collect(join(directory, entry.name), output);
      continue;
    }
    if (entry.isFile() && trackedOutputExtensions.has(extname(entry.name).toLowerCase())) output.push(join(directory, entry.name));
  }
  return output;
}

function hashTextFile(file) {
  const content = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  return createHash("sha256").update(content, "utf8").digest("hex");
}

function snapshot() {
  const files = collect(root).sort();
  return new Map(files.map((file) => [file.slice(root.length + 1), hashTextFile(file)]));
}

function run(script) {
  const result = spawnSync(process.execPath, [`scripts/${script}`], { cwd: root, encoding: "utf8", stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Idempotency prerequisite failed: scripts/${script}`);
    process.exit(result.status || 1);
  }
}

const before = snapshot();
run("render-work-archive.mjs");
run("apply-seo-accessibility.mjs");
run("inventory-seo-accessibility.mjs");
run("generate-seo-assets.mjs");
run("apply-mobile-navigation.mjs");
run("apply-case-study-screenshot-scroll.mjs");
const after = snapshot();
const changed = [];
const allFiles = new Set([...before.keys(), ...after.keys()]);

for (const file of [...allFiles].sort()) {
  if (before.get(file) !== after.get(file)) changed.push(file);
}

if (changed.length) {
  console.error(`Supported generators are not idempotent; ${changed.length} output files changed on a second run:`);
  changed.slice(0, 40).forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log("Supported Work, SEO, route-inventory, and sitemap generators are deterministic and idempotent.");
