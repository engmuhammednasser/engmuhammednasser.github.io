import { readdirSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const root = resolve(process.cwd());
const runtimePath = join(root, "scripts", "portfolio-effects.js");
const stylesPath = join(root, "scripts", "portfolio-effects.css");
const runtime = readFileSync(runtimePath, "utf8");
const styles = readFileSync(stylesPath, "utf8");
const htmlFiles = [];

function collectHtmlFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "scripts") continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) collectHtmlFiles(absolute);
    else if (entry.isFile() && extname(entry.name) === ".html") htmlFiles.push(absolute);
  }
}

function count(content, pattern) {
  return content.match(pattern)?.length ?? 0;
}

collectHtmlFiles(root);

const failures = [];
if (runtime.includes("MutationObserver")) {
  failures.push("portfolio-effects.js must not install a document MutationObserver.");
}
if (runtime.includes('querySelectorAll("[class]")')) {
  failures.push("portfolio-effects.js must not scan all class-bearing main descendants.");
}
if (runtime.includes('querySelectorAll("a[class], button[class]")')) {
  failures.push("portfolio-effects.js must not infer action roles from all links/buttons.");
}
if (runtime.includes("portfolio-splash-cursor") || styles.includes("portfolio-splash-cursor")) {
  failures.push("The removed splash cursor must not be present in runtime code or CSS.");
}
if (!runtime.includes("heroWebGLAllowed") || !runtime.includes("webglAvailable")) {
  failures.push("The runtime policy must gate WebGL with an explicit capability state.");
}
if (!runtime.includes("requestIdleCallback") || !runtime.includes("window.setTimeout(run, 0)")) {
  failures.push("Decorative initialization must use an idle callback with a fallback.");
}
if (!runtime.includes('"visibilitychange"') || !styles.includes("prefers-reduced-motion")) {
  failures.push("Visibility and reduced-motion handling must remain explicit.");
}
if (styles.includes("will-change")) {
  failures.push("Effects CSS must not permanently promote decorative layers with will-change.");
}

for (const htmlFile of htmlFiles) {
  const content = readFileSync(htmlFile, "utf8");
  const styleCount = count(content, /data-portfolio-effects="style"/g);
  const scriptCount = count(content, /data-portfolio-effects="script"/g);
  if (styleCount !== 1 || scriptCount !== 1) {
    failures.push(
      `${htmlFile.slice(root.length + 1)} must contain exactly one effects stylesheet and one effects script.`
    );
  }
}

console.log(`Checked runtime invariants in ${htmlFiles.length} HTML files.`);

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Runtime policy, lifecycle, DOM-scope, CSS, and effect-inclusion invariants pass.");
