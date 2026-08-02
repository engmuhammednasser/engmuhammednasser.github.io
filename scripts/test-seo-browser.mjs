import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const port = 38123;
const routes = [
  "/",
  "/work/",
  "/ar/",
  "/ar/work/",
  "/about/",
  "/services/",
  "/lab/",
  "/backend/",
  "/work/eventgift-uae/",
  "/ar/work/eventgift-uae/",
  "/work/techmart/",
  "/ar/work/techmart/"
];
const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(Boolean);
const chrome = chromeCandidates.find((candidate) => existsSync(candidate));

if (!chrome) {
  console.error("No supported Chrome/Edge executable was found for the Sprint 4 browser checks.");
  process.exit(1);
}

function count(content, pattern) {
  return (content.match(pattern) ?? []).length;
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] ?? "";
}

function checkDom(route, dom) {
  const failures = [];
  const title = dom.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const canonical = dom.match(/<link\b[^>]*rel="canonical"[^>]*>/i)?.[0] ?? "";
  const htmlTag = dom.match(/<html\b[^>]*>/i)?.[0] ?? "";
  if (!title.trim()) failures.push("missing title");
  if (route !== "/404/" && !canonical) failures.push("missing canonical");
  if (attr(htmlTag, "lang") !== (route === "/ar/" || route.startsWith("/ar/") ? "ar" : "en")) failures.push("incorrect lang");
  if ((route === "/ar/" || route.startsWith("/ar/")) && attr(htmlTag, "dir") !== "rtl") failures.push("incorrect dir");
  if (count(dom, /<main\b[^>]*id="main-content"/gi) !== 1) failures.push("main landmark missing");
  if (count(dom, /data-skip-link/g) !== 1) failures.push("skip link missing");
  if (count(dom, /data-seo-structured-data/g) !== 1) failures.push("JSON-LD missing");
  if (route === "/work/" || route === "/ar/work/") {
    if (count(dom, /data-project-id=/g) !== 12) failures.push("Work initial card count is not 12");
    if (count(dom, /data-work-filter=/g) !== 5) failures.push("Work filter count is not 5");
    if (count(dom, /data-work-load-more/g) !== 2) failures.push("Work Load More shell/control is missing");
  }
  return failures;
}

const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore"
});
const failures = [];
try {
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 700));
  for (const route of routes) {
    const result = spawnSync(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu", "--no-first-run", "--virtual-time-budget=2500", "--dump-dom", `http://127.0.0.1:${port}${route}`], { encoding: "utf8", timeout: 45000 });
    if (result.status !== 0) {
      failures.push(`${route}: browser exited with ${result.status}`);
      continue;
    }
    checkDom(route, result.stdout).forEach((failure) => failures.push(`${route}: ${failure}`));
  }
} finally {
  server.kill();
}

if (failures.length) {
  console.error(`Found ${failures.length} browser regression failures:`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Chrome headless verified ${routes.length} EN/AR routes, metadata, main landmarks, skip links, JSON-LD, and Work initial controls.`);
