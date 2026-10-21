import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import test from "node:test";
import {
  collectPublicFiles,
  isPublicFile,
  packageSite,
  validateReferences,
  verifySitePackage
} from "./site-package.mjs";

const workspace = realpathSync(resolve("."));
const fixtureParent = join(workspace, "node_modules", ".cache", "pages-tests");
const stylesheet = "_next/static/chunks/3b8hwydtiy37e.css";
const font = "_next/static/media/example.woff2";

function within(parent, candidate) {
  return candidate.startsWith(`${parent}${sep}`);
}

function ensureFixtureParent() {
  let directory = workspace;
  for (const segment of ["node_modules", ".cache", "pages-tests"]) {
    directory = join(directory, segment);
    if (existsSync(directory)) {
      assert(!lstatSync(directory).isSymbolicLink(), `Unsafe fixture directory: ${directory}`);
      assert(statSync(directory).isDirectory(), `Fixture path is not a directory: ${directory}`);
      assert(within(workspace, realpathSync(directory)), "Fixture directory escapes the workspace");
    } else {
      mkdirSync(directory);
    }
  }
}

function put(root, path, content) {
  const target = resolve(root, path);
  assert(within(root, target), `Fixture path escapes its root: ${path}`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

function document(body = "", head = "") {
  return `<!doctype html><html lang="en" dir="ltr"><head>${head}</head><body>${body}</body></html>\n`;
}

function createFixture(t, additions = {}) {
  ensureFixtureParent();
  const container = mkdtempSync(join(fixtureParent, "case-"));
  const root = join(container, "repo");
  mkdirSync(root);
  t.after(() => {
    const actual = realpathSync(container);
    assert(within(fixtureParent, actual), "Refusing to clean a fixture outside the fixture directory");
    assert(!lstatSync(container).isSymbolicLink(), "Refusing to clean a substituted fixture symlink");
    rmSync(container, { recursive: true, force: true });
  });
  const files = {
    "index.html": document('<a href="/work/example/">Example</a>'),
    "404.html": document("<h1>Not found</h1>"),
    ".nojekyll": "\n",
    "robots.txt": "User-agent: *\nAllow: /\nSitemap: https://engmuhammednasser.github.io/sitemap.xml\n",
    "sitemap.xml": '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://engmuhammednasser.github.io/</loc></url></urlset>\n',
    "data/projects.json": JSON.stringify({ projects: [] }),
    "work/example/index.html": document("<h1>Example</h1>"),
    ...additions
  };
  for (const [path, content] of Object.entries(files)) put(root, path, content);
  execFileSync("git", ["init", "--quiet", root], { stdio: "pipe", windowsHide: true });
  execFileSync("git", ["-c", "core.autocrlf=false", "add", "--", ...Object.keys(files)], {
    cwd: root,
    stdio: "pipe",
    windowsHide: true
  });
  return { root, container };
}

function fileNames(root) {
  const paths = [];
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      assert(!entry.isSymbolicLink(), "Packaged output must not contain symlinks");
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) paths.push(relative(root, path).split(sep).join("/"));
      else assert.fail(`Unexpected artifact entry: ${path}`);
    }
  }
  visit(root);
  return paths.sort();
}

async function rejects(operation, expected) {
  await assert.rejects(async () => operation(), expected);
}

function directoryLink(target, path) {
  symlinkSync(target, path, process.platform === "win32" ? "junction" : "dir");
}

test("publication policy separates runtime assets from tooling and archived output", () => {
  for (const path of [
    "index.html", "404.html", "ar/work/example/index.html", ".nojekyll", "robots.txt", "sitemap.xml",
    "data/projects.json", "scripts/work-archive.js", "scripts/case-study-screenshots.js",
    "scripts/portfolio-effects.css", "scripts/torathyat-case-study.css", stylesheet, font,
    "projects/example/original.png", "backend/example/preview.webp", "plugins/example/screenshot.avif", "favicon.ico"
  ]) assert.equal(isPublicFile(path), true, `${path} should be publishable`);

  for (const path of [
    "package.json", "package-lock.json", "AGENTS.md", "docs/operations/release-checklist.md",
    ".github/workflows/quality.yml", "scripts/test-work-archive.mjs", "scripts/check-card.js",
    "scripts/torathyat-screenshots.js", "data/routes.json", "data/image-delivery.json",
    "projects/example/manifest.json", "work/index.txt", "__next._full.txt", "fix_js_txt_links.cjs",
    "_next/static/chunks/retired.js", "node_modules/anything/index.html", "../index.html", "/index.html"
  ]) assert.equal(isPublicFile(path), false, `${path} must stay out of publication`);
});

test("packaging keeps tracked public bytes and excludes tools and untracked files", async (t) => {
  const { root } = createFixture(t, {
    "projects/example/original.png": Buffer.from([0, 255, 128, 42, 13, 10]),
    "scripts/work-archive.js": "fetch('/data/projects.json');\n",
    "package.json": '{"private":true}',
    "scripts/test-work-archive.mjs": "throw new Error('development only');\n",
    "docs/example.md": "Development notes\n",
    "work/index.txt": "archived payload\n"
  });
  put(root, "projects/example/untracked.png", "untracked image");
  put(root, "work/untracked/index.html", document("Untracked page"));

  const expected = await collectPublicFiles(root);
  assert.deepEqual(expected, [...expected].sort(), "Tracked selection should be deterministic");
  assert(!expected.includes("projects/example/untracked.png"));
  assert(!expected.includes("work/untracked/index.html"));
  const summary = await packageSite(root);
  assert.equal(summary.siteRoot, join(root, "node_modules", ".cache", "pages", "site"));
  assert.deepEqual(fileNames(summary.siteRoot), expected);
  for (const path of expected) {
    assert.deepEqual(readFileSync(join(summary.siteRoot, path)), readFileSync(join(root, path)), `${path} changed in transit`);
  }
  assert.equal(summary.bytes, expected.reduce((total, path) => total + statSync(join(root, path)).size, 0));
  assert.deepEqual(await verifySitePackage(root), summary);
});

test("reference closure resolves relative, encoded, responsive, and full-view assets", async (t) => {
  const catalog = {
    projects: [{
      thumbnail: { original: "/projects/example/full.png", webp480: "/projects/example/small.webp" },
      caseStudy: { en: "/work/example/", ar: "/ar/work/example/" }
    }]
  };
  const { root } = createFixture(t, {
    "index.html": document(
      '<a href="https://engmuhammednasser.github.io/work/example/?from=home#details">Example</a>' +
      '<a href="https://example.com/not-local">External</a><a href="mailto:hello@example.com">Email</a>' +
      '<img src="/projects/example/small.webp?x=1&amp;y=2" srcset="/projects/example/small.webp 480w, /projects/example/full.png 960w">' +
      '<button data-full-src="/projects/example/full.png"><img src="/projects/example/small.webp"></button>' +
      '<script src="/scripts/work-archive.js" data-project-data="/data/projects.json"></script>',
      `<link rel="stylesheet" href="/${stylesheet}"><link rel="preload" as="image" href="/projects/example/small.webp" imagesrcset="/projects/example/small.webp 480w, /projects/example/full.png 960w">`
    ),
    "work/example/index.html": document('<img src="../../projects/example/image%20one.png"><img src="/projects/example/%D9%84%D9%82%D8%B7%D8%A9.png"><button data-src="/projects/example/full.png">Open</button>'),
    "ar/work/example/index.html": document("Arabic route"),
    [stylesheet]: '@font-face{font-family:example;src:url("../media/example.woff2")}\n',
    [font]: "font fixture",
    "scripts/work-archive.js": "fetch('/data/projects.json');\n",
    "projects/example/full.png": "full image",
    "projects/example/small.webp": "preview image",
    "projects/example/image one.png": "space in filename",
    "projects/example/لقطة.png": "encoded filename",
    "data/projects.json": JSON.stringify(catalog)
  });
  await validateReferences(root, await collectPublicFiles(root));
  await packageSite(root);
  await verifySitePackage(root);
});

for (const [name, additions] of [
  ["srcset candidate", { "index.html": document('<img src="/profile.png" srcset="/profile.png 480w, /projects/example/missing.webp 960w">'), "profile.png": "preview" }],
  ["image preload candidate", { "index.html": document("", '<link rel="preload" as="image" href="/profile.png" imagesrcset="/profile.png 480w, /projects/example/missing.webp 960w">'), "profile.png": "preview" }],
  ["full-view original", { "index.html": document('<button data-full-src="/projects/example/missing.png">Open</button>') }],
  ["legacy full-view original", { "index.html": document('<button data-src="/projects/example/missing.png">Open</button>') }],
  ["poster image", { "index.html": document('<video poster="/projects/example/missing.png"></video>') }],
  ["runtime JSON endpoint", { "index.html": document('<script src="/scripts/work-archive.js" data-project-data="/data/missing.json"></script>'), "scripts/work-archive.js": "" }],
  ["dynamic thumbnail", { "data/projects.json": JSON.stringify({ projects: [{ thumbnail: { original: "/projects/example/missing.png" }, caseStudy: {} }] }) }],
  ["dynamic case-study route", { "data/projects.json": JSON.stringify({ projects: [{ thumbnail: {}, caseStudy: { en: "/work/missing/" } }] }) }],
  ["stylesheet font", { "index.html": document("", `<link rel="stylesheet" href="/${stylesheet}">`), [stylesheet]: '@font-face{src:url("../media/missing.woff2")}\n' }]
]) {
  test(`reference closure rejects a missing ${name}`, async (t) => {
    const { root } = createFixture(t, additions);
    await rejects(async () => validateReferences(root, await collectPublicFiles(root)), /Unpublished local reference/);
    await rejects(() => packageSite(root), /Unpublished local reference/);
  });
}

test("an existing untracked target cannot satisfy a published reference", async (t) => {
  const { root } = createFixture(t, { "index.html": document('<img src="/projects/example/untracked.png">') });
  put(root, "projects/example/untracked.png", "not approved for publication");
  await rejects(() => packageSite(root));
});

test("an existing development file cannot satisfy a published reference", async (t) => {
  const { root } = createFixture(t, {
    "index.html": document('<a href="/docs/internal.md">Wrong link</a>'),
    "docs/internal.md": "Development only"
  });
  await rejects(() => packageSite(root));
});

for (const path of ["/%2e%2e/private.png", "/projects/%2e%2e/%2e%2e/private.png", "/projects/%5c..%5cprivate.png"]) {
  test(`reference validation rejects encoded traversal ${path}`, async (t) => {
    const { root } = createFixture(t, { "index.html": document(`<img src="${path}">`) });
    await rejects(() => packageSite(root));
  });
}

test("a rebuild removes stale files and verifier detects modified or injected output", async (t) => {
  const { root } = createFixture(t);
  const { siteRoot } = await packageSite(root);
  put(siteRoot, "scripts/private-tool.mjs", "not publishable");
  await rejects(() => verifySitePackage(root));
  await packageSite(root);
  assert(!existsSync(join(siteRoot, "scripts", "private-tool.mjs")));
  await verifySitePackage(root);
  put(siteRoot, "index.html", document("changed artifact"));
  await rejects(() => verifySitePackage(root));
  await packageSite(root);
  unlinkSync(join(siteRoot, "404.html"));
  await rejects(() => verifySitePackage(root));
});

test("tracked files cannot escape the source through a replaced parent directory", async (t) => {
  const { root, container } = createFixture(t, { "projects/example/full.png": "source image" });
  const source = join(root, "projects", "example");
  const moved = join(container, "outside-source");
  renameSync(source, moved);
  directoryLink(moved, source);
  await rejects(() => packageSite(root));
  assert.equal(readFileSync(join(moved, "full.png"), "utf8"), "source image");
});

test("tracked symbolic-link files cannot become public content", async (t) => {
  const { root, container } = createFixture(t, { "projects/example/full.png": "tracked image" });
  const target = join(container, "outside-image.png");
  writeFileSync(target, "must not publish");
  const link = join(root, "projects", "example", "full.png");
  unlinkSync(link);
  try {
    symlinkSync(target, link, "file");
  } catch (error) {
    if (process.platform === "win32" && ["EPERM", "EACCES"].includes(error.code)) {
      t.skip("Windows file symlink permission is unavailable; directory-junction escape is tested separately.");
      return;
    }
    throw error;
  }
  await rejects(() => packageSite(root));
  assert.equal(readFileSync(target, "utf8"), "must not publish");
});

for (const directory of ["node_modules", "node_modules/.cache/pages/site"]) {
  test(`destination guard rejects a substituted ${directory} directory`, async (t) => {
    const { root, container } = createFixture(t);
    const target = join(container, "outside-destination");
    mkdirSync(target);
    put(target, "sentinel.txt", "preserve target");
    const link = join(root, directory);
    mkdirSync(dirname(link), { recursive: true });
    directoryLink(target, link);
    await rejects(() => packageSite(root));
    assert.deepEqual(fileNames(target), ["sentinel.txt"]);
    assert.equal(readFileSync(join(target, "sentinel.txt"), "utf8"), "preserve target");
  });
}

test("destination guard rejects a hard-linked build manifest", async (t) => {
  const { root, container } = createFixture(t);
  const target = join(container, "outside-manifest.json");
  const original = '{"sentinel":"preserve target"}\n';
  writeFileSync(target, original);
  const manifest = join(root, "node_modules", ".cache", "pages", "manifest.json");
  mkdirSync(dirname(manifest), { recursive: true });
  linkSync(target, manifest);
  await rejects(() => packageSite(root));
  assert.equal(readFileSync(target, "utf8"), original);
});

test("destination guard rejects a dangling manifest symlink", async (t) => {
  const { root, container } = createFixture(t);
  const target = join(container, "outside-missing-manifest.json");
  const manifest = join(root, "node_modules", ".cache", "pages", "manifest.json");
  mkdirSync(dirname(manifest), { recursive: true });
  try {
    symlinkSync(target, manifest, "file");
  } catch (error) {
    if (process.platform === "win32" && ["EPERM", "EACCES"].includes(error.code)) {
      t.skip("Windows file symlink permission is unavailable; manifest hardlink protection is tested separately.");
      return;
    }
    throw error;
  }
  await rejects(() => packageSite(root));
  assert(!existsSync(target), "A dangling manifest link must not create a file outside the output cache");
});
