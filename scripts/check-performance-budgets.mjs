import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const budgets = [
  ["scripts/portfolio-effects.js", 24000, "interactive runtime"],
  ["scripts/portfolio-effects.css", 13000, "interactive runtime styles"],
  ["scripts/work-archive.js", 12000, "Work progressive enhancement"],
  ["data/projects.json", 75000, "canonical project data"],
  ["work/index.html", 90000, "English Work shell"],
  ["ar/work/index.html", 100000, "Arabic Work shell"]
];
const errors = [];

for (const [relative, limit, purpose] of budgets) {
  const file = resolve(root, relative);
  if (!existsSync(file)) {
    errors.push(`${relative} is missing`);
    continue;
  }
  const size = statSync(file).size;
  if (size > limit) errors.push(`${relative} is ${size} bytes; ${purpose} budget is ${limit} bytes`);
  console.log(`${relative}: ${size} / ${limit} bytes`);
}

const projectData = JSON.parse(readFileSync(resolve(root, "data/projects.json"), "utf8"));
const workMarkup = readFileSync(resolve(root, "work/index.html"), "utf8");
const initialCards = workMarkup.match(/data-project-id=/g)?.length ?? 0;
if (initialCards !== 12) errors.push(`Work initial card budget is ${initialCards}; expected 12`);
if ((projectData.projects?.length ?? 0) < initialCards) errors.push("Work initial card count exceeds canonical project count");

if (errors.length) {
  console.error(`Found ${errors.length} performance budget failures:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Performance budgets passed for ${projectData.projects.length} canonical projects; no Core Web Vitals are inferred by this gate.`);
