import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { verifySitePackage } from "./site-package.mjs";

const root = resolve(".");
const { siteRoot, files } = verifySitePackage(root);
const env = { ...process.env, SITE_ROOT: siteRoot };
const origin = "http://127.0.0.1:38128";
const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  cwd: root,
  env: { ...env, PORT: "38128", HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "inherit"],
  windowsHide: true
});

try {
  await new Promise((done, reject) => {
    const timer = setTimeout(() => finish(new Error("Artifact server startup timed out")), 10000);
    function finish(error) {
      clearTimeout(timer);
      server.removeListener("error", finish);
      server.removeListener("exit", exited);
      error ? reject(error) : done();
    }
    function exited(code) { finish(new Error(`Artifact server exited before startup: ${code}`)); }
    server.once("error", finish);
    server.once("exit", exited);
    server.stdout.once("data", () => finish());
  });
  // These are ordinary source URLs: a dot-file block alone would not prove separation.
  for (const path of [
    "/package.json", "/package-lock.json", "/README.md", "/AGENTS.md",
    "/PORTFOLIO_OPERATIONS_GUIDE.md", "/docs/operations/release-checklist.md",
    "/scripts/serve.mjs", "/scripts/site-package.mjs", "/scripts/test-deep-browser.mjs",
    "/scripts/torathyat-screenshots.js", "/data/routes.json", "/data/image-delivery.json",
    "/work/index.txt", "/work/__next._full.txt", "/_next/static/chunks/01599w_myoj4b.js"
  ]) {
    const response = await fetch(origin + path, { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 404, `Development or retired file was served: ${path}`);
    await response.arrayBuffer();
  }
  for (const file of ["index.html", "ar/index.html", "data/projects.json", "robots.txt", "sitemap.xml"]) {
    const response = await fetch(`${origin}/${file}`, { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200, `Public endpoint is missing: ${file}`);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), readFileSync(join(siteRoot, file)), `Wrong served bytes: ${file}`);
  }
  assert(files.includes(".nojekyll"), "The Pages artifact must retain .nojekyll");
  console.log("Artifact HTTP checks passed: public bytes match and development/retired URLs return 404.");
} finally {
  server.kill();
}

for (const script of ["test-seo-browser.mjs", "test-mobile-navigation.mjs", "test-static-runtime.mjs", "test-deep-browser.mjs", "test-work-loading-browser.mjs", "test-screenshot-recovery.mjs"]) {
  console.log(`Checking the Pages artifact with ${script}...`);
  const result = spawnSync(process.execPath, [join("scripts", script)], { cwd: root, env, stdio: "inherit", windowsHide: true });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${script} failed against the Pages artifact (${result.signal ?? result.status})`);
}

const result = verifySitePackage(root);
console.log(`Pages artifact passed HTTP and browser verification; ${result.files.length} files and ${result.bytes} bytes remain unchanged.`);
