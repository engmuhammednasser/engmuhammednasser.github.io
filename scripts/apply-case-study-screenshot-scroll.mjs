import { readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { caseStudyRouteFiles, normalizeCaseStudyHtml } from "./case-study-screenshot-scroll-utils.mjs";

const root = resolve(process.cwd());
let pageCount = 0;
let buttonCount = 0;
let changedFiles = 0;

for (const file of caseStudyRouteFiles(root)) {
  const html = readFileSync(file, "utf8");
  const result = normalizeCaseStudyHtml(html);
  if (!result.count) continue;
  pageCount += 1;
  buttonCount += result.count;
  if (result.html !== html) {
    writeFileSync(file, result.html);
    changedFiles += 1;
  }
}

console.log(`Case-study screenshot scroll normalized: ${buttonCount} screenshots across ${pageCount} pages; ${changedFiles} files changed.`);
