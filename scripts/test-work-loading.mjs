import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const runtime = readFileSync(new URL("./work-archive.js", import.meta.url), "utf8");
const catalog = JSON.parse(readFileSync(new URL("../data/projects.json", import.meta.url), "utf8"));
const flush = () => new Promise((resolve) => setImmediate(resolve));
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
};

class Element {
  constructor(attributes = {}) {
    this.attributes = attributes;
    this.listeners = new Map();
    this.disabled = false;
    this.hidden = false;
    this.textContent = "";
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  addEventListener(name, listener) {
    this.listeners.set(name, [...(this.listeners.get(name) ?? []), listener]);
  }
  click() {
    if (!this.disabled && !this.hidden) this.dispatchClick();
  }
  dispatchClick() {
    for (const listener of this.listeners.get("click") ?? []) listener({});
  }
  querySelector() { return this.link ??= { focus() {} }; }
}

function harness(locale) {
  const filters = catalog.categories.map((category) => new Element({ "data-work-filter": category.id }));
  const controller = new Element({ "data-work-locale": locale });
  controller.querySelectorAll = () => filters;
  const loadMore = new Element();
  const status = new Element();
  const empty = new Element();
  const script = new Element({ "data-project-data": "/data/projects.json" });
  const grid = new Element();
  grid.children = catalog.projects.slice(0, 12).map((project) => new Element({ "data-project-id": project.id }));
  const cards = (html) => [...html.matchAll(/data-project-id="([^"]+)"/g)].map((match) => new Element({ "data-project-id": match[1] }));
  grid.insertAdjacentHTML = (_position, html) => { grid.children.push(...cards(html)); };
  Object.defineProperty(grid, "innerHTML", { set(html) { grid.children = cards(html); } });
  const queries = new Map([
    ["[data-work-filter-controller]", controller], ["[data-work-load-more]", loadMore],
    ["[data-work-status]", status], ["[data-work-empty]", empty], ["script[data-work-archive]", script]
  ]);
  const requests = [], timers = new Map(), warnings = [];
  let nextTimer = 0;
  vm.runInNewContext(runtime, {
    document: {
      querySelector: (selector) => queries.get(selector) ?? null,
      getElementById: (id) => id === "work-project-grid" ? grid : null
    },
    AbortController, URL,
    console: { warn: (message) => warnings.push(message) },
    // Deliberately ignore abort here: a late response must not overwrite a retry.
    fetch: (url, options) => {
      const request = { ...deferred(), url, options };
      requests.push(request);
      return request.promise;
    },
    setTimeout: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout: (id) => timers.delete(id)
  }, { filename: "work-archive.js" });
  return {
    grid, filters, loadMore, status, requests, timers, warnings,
    ids: () => grid.children.map((card) => card.getAttribute("data-project-id")),
    succeed: (index = requests.length - 1, document = catalog) => requests[index].resolve({ ok: true, json: async () => document }),
    expire: () => {
      const timer = [...timers.values()][0];
      assert.equal(timer.delay, 10000, "Catalog deadline should be ten seconds");
      timer.callback();
    }
  };
}

for (const locale of ["en", "ar"]) {
  const loading = locale === "ar" ? "جارٍ تحميل المشاريع…" : "Loading projects…";
  const retry = locale === "ar" ? "إعادة محاولة تحميل المشاريع" : "Retry loading projects";
  const initialIds = catalog.projects.slice(0, 12).map((project) => project.id);

  test(`${locale}: generated controls are disabled before the deferred runtime arrives`, () => {
    const file = locale === "ar" ? "../ar/work/index.html" : "../work/index.html";
    const html = readFileSync(new URL(file, import.meta.url), "utf8");
    const buttons = [...html.matchAll(/<button\b[^>]*data-work-(?:filter=|load-more\b)[^>]*>/g)];
    assert.equal(buttons.length, catalog.categories.length + 1);
    assert(buttons.every(([tag]) => /\bdisabled\b/.test(tag)));
    assert(html.includes(`>${loading}</button>`));
    const noScript = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1];
    assert.equal((noScript.match(/<li>/g) ?? []).length, catalog.projects.length);
  });

  test(`${locale}: pending catalog is visibly busy and healthy batches do not duplicate`, async () => {
    const page = harness(locale);
    const initialCards = [...page.grid.children];
    assert.equal(page.loadMore.textContent, loading);
    assert.equal(page.status.textContent, loading);
    assert.equal(page.loadMore.getAttribute("aria-busy"), "true");
    assert(page.loadMore.disabled && !page.loadMore.hidden);
    assert(page.filters.every((button) => button.disabled));
    page.loadMore.dispatchClick();
    page.filters[1].dispatchClick();
    assert.equal(page.requests.length, 1);
    assert.deepEqual(page.ids(), initialIds);
    page.succeed();
    await flush();
    assert.deepEqual(page.grid.children, initialCards, "Keep existing first-card nodes and LCP image");
    assert(page.filters.every((button) => !button.disabled));
    assert.equal(page.loadMore.getAttribute("aria-busy"), "false");
    assert.equal(page.timers.size, 0);
    const counts = [page.grid.children.length];
    while (!page.loadMore.hidden) {
      page.loadMore.click();
      counts.push(page.grid.children.length);
    }
    assert.deepEqual(counts, [12, 24, 36, catalog.projects.length]);
    assert.deepEqual(page.ids(), catalog.projects.map((project) => project.id));
    const corporate = page.filters.find((button) => button.getAttribute("data-work-filter") === "corporate");
    corporate.click();
    assert.equal(page.grid.children.length, 12);
    page.loadMore.click();
    assert.deepEqual(page.ids(), catalog.projects.filter((project) => project.category === "corporate").map((project) => project.id));
    assert.equal(corporate.getAttribute("aria-pressed"), "true");
    assert.equal(page.requests.length, 1, "Pagination/filtering reuse the loaded catalog");
  });

  for (const failure of ["network", "http", "json", "invalid", "empty"]) {
    test(`${locale}: ${failure} failure retains cards and retry recovers once`, async () => {
      const page = harness(locale);
      if (failure === "network") page.requests[0].reject(new TypeError("Network unavailable"));
      if (failure === "http") page.requests[0].resolve({ ok: false, status: 503 });
      if (failure === "json") page.requests[0].resolve({ ok: true, json: async () => { throw new SyntaxError("Invalid JSON"); } });
      if (failure === "invalid") page.succeed(0, null);
      if (failure === "empty") page.succeed(0, { projects: [] });
      await flush();
      assert.deepEqual(page.ids(), initialIds);
      assert.equal(page.loadMore.textContent, retry);
      assert(!page.loadMore.hidden && !page.loadMore.disabled);
      assert(page.filters.every((button) => button.disabled));
      assert.equal(page.timers.size, 0);
      assert.equal(page.warnings.length, 1);
      page.loadMore.click();
      page.loadMore.dispatchClick();
      assert.equal(page.requests.length, 2, "Rapid retry clicks cannot start parallel requests");
      page.succeed();
      await flush();
      page.loadMore.click();
      assert.equal(page.grid.children.length, 24);
      assert.equal(new Set(page.ids()).size, 24);
      assert.equal(page.loadMore.listeners.get("click").length, 1);
    });
  }

  for (const phase of ["headers", "body"]) {
    test(`${locale}: stalled ${phase} times out and late completion cannot replace a retry`, async () => {
      const page = harness(locale);
      const body = deferred();
      if (phase === "body") {
        page.requests[0].resolve({ ok: true, json: () => body.promise });
        await flush();
      }
      page.expire();
      await flush();
      assert.equal(page.requests[0].options.signal.aborted, true);
      assert.equal(page.loadMore.textContent, retry);
      assert.deepEqual(page.ids(), initialIds);
      page.loadMore.click();
      page.succeed(1);
      await flush();
      page.loadMore.click();
      const recoveredIds = page.ids();
      const recoveredStatus = page.status.textContent;
      if (phase === "body") body.resolve({ projects: [catalog.projects.at(-1)] });
      else page.succeed(0, { projects: [catalog.projects.at(-1)] });
      await flush();
      assert.deepEqual(page.ids(), recoveredIds);
      assert.equal(page.status.textContent, recoveredStatus);
      assert.equal(page.timers.size, 0);
      assert.equal(page.grid.children.length, 24);
    });
  }
}
