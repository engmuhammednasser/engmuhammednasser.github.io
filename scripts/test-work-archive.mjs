import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

const root = resolve(process.cwd());
const projectsDocument = JSON.parse(readFileSync(resolve(root, "data/projects.json"), "utf8"));
const runtime = readFileSync(resolve(root, "scripts/work-archive.js"), "utf8");
const listeners = new Map();

function control(attributes = {}) {
  return {
    hidden: false,
    disabled: false,
    textContent: "",
    getAttribute(name) { return attributes[name] ?? null; },
    setAttribute(name, value) { attributes[name] = String(value); },
    addEventListener(name, handler) { listeners.set(attributes["data-work-filter"] || name, handler); }
  };
}

const filterButtons = ["all", "ecommerce", "corporate", "services", "platforms"].map((category) =>
  control({ "data-work-filter": category, "aria-pressed": category === "all" ? "true" : "false" })
);
const controller = {
  getAttribute(name) { return name === "data-work-locale" ? "en" : null; },
  querySelectorAll(selector) { return selector === "[data-work-filter]" ? filterButtons : []; }
};
const grid = {
  value: "",
  set innerHTML(value) { this.value = value; },
  get innerHTML() { return this.value; }
};
const loadMore = control({ "data-work-load-more": "true" });
const status = control();
const empty = control();
const script = { getAttribute(name) { return name === "data-project-data" ? "/data/projects.json" : null; } };

const sandbox = {
  console,
  URL,
  document: {
    querySelector(selector) {
      return {
        "[data-work-filter-controller]": controller,
        "[data-work-load-more]": loadMore,
        "[data-work-status]": status,
        "[data-work-empty]": empty,
        "script[data-work-archive]": script
      }[selector] ?? null;
    },
    getElementById(id) { return id === "work-project-grid" ? grid : null; }
  },
  fetch: async () => ({ ok: true, json: async () => projectsDocument })
};

vm.runInNewContext(runtime, sandbox);
await new Promise((resolvePromise) => setTimeout(resolvePromise, 0));

function cardIds() {
  return [...grid.innerHTML.matchAll(/data-project-id="([^"]+)"/g)].map((match) => match[1]);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function imageTags() {
  return [...grid.innerHTML.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
}

assert(cardIds().length === 12, "initial render must contain 12 cards");
assert(status.textContent === `Showing 12 of ${projectsDocument.projects.length} projects`, "initial status is incorrect");
assert(/\bloading="eager"/.test(imageTags()[0]), "initial primary image must be eager");
assert(/\bfetchpriority="high"/.test(imageTags()[0]), "initial primary image must be high priority");
assert(imageTags().slice(1).every((image) => /\bloading="lazy"/.test(image) && !/\bfetchpriority="high"/.test(image)), "initial non-primary images must remain lazy and unprioritized");
assert(imageTags()[0].includes(`/projects/${projectsDocument.projects[0].slug}/optimized/`), "initial primary image must use an optimized source");

listeners.get("corporate")();
assert(cardIds().length === 12, "corporate filter must reset to the first 12 projects");
assert(new Set(cardIds()).size === 12, "corporate filter must not duplicate cards");
assert(filterButtons[2].getAttribute("aria-pressed") === "true", "corporate filter must expose aria-pressed=true");
assert(imageTags().every((image) => /\bloading="lazy"/.test(image) && !/\bfetchpriority="high"/.test(image)), "filtered images must not retain the initial high-priority hint");

loadMore.dispatch = listeners.get("click");
listeners.get("click")();
assert(cardIds().length === 21, "Load More must reveal all 21 corporate projects");
assert(loadMore.hidden === true, "Load More must hide when all matching projects are visible");

listeners.get("services")();
assert(cardIds().length === 7, "services filter must reveal all seven matching projects");
assert(loadMore.hidden === true, "Load More must remain hidden for a complete small category");

console.log("Work runtime interaction checks passed: initial batch, filter reset, aria state, progressive reveal, and duplicate safety.");
