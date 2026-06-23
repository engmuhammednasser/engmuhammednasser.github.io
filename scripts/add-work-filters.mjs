import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const categories = {
  ecommerce: [
    "eventgift-uae",
    "eventgift-egypt",
    "eventgift-saudi",
    "botella",
    "techmart",
    "nora24jewelry",
    "oryxbag",
    "ashhalanksa",
    "originals-hub",
    "fast-shopping",
    "mishari-oud"
  ],
  corporate: [
    "ashhalan",
    "gobe",
    "genedyeg",
    "a2mkw",
    "nuc-kw",
    "tbinnovation",
    "mediaandmore",
    "mahmmoud-gomaa",
    "atour",
    "edusmart-system",
    "gold-mine-erp",
    "crm-order-management-system",
    "arcadia-digital",
    "lec-elevators"
  ],
  services: [
    "ashhalanlogistics",
    "ashhalancarrental",
    "meshari-alali",
    "light-islam",
    "juli-tourism",
    "baslim-auto",
    "ozone-clinic"
  ],
  platforms: ["diwaniya", "kuwait-arc", "arabic-window"]
};

const categoryBySlug = new Map(
  Object.entries(categories).flatMap(([category, slugs]) => slugs.map((slug) => [slug, category]))
);

const labels = {
  en: {
    aria: "Filter projects by category",
    hint: "Swipe to explore categories",
    all: "All",
    ecommerce: "E-Commerce",
    corporate: "Corporate Sites",
    services: "Services & Booking",
    platforms: "Platforms"
  },
  ar: {
    aria: "فلترة المشاريع حسب التصنيف",
    hint: "اسحب لاستعراض التصنيفات",
    all: "الكل",
    ecommerce: "متاجر إلكترونية",
    corporate: "مواقع شركات",
    services: "خدمات وحجوزات",
    platforms: "منصات"
  }
};

const counts = {
  all: categoryBySlug.size,
  ...Object.fromEntries(Object.entries(categories).map(([key, slugs]) => [key, slugs.length]))
};

const css = `
.work-filter-shell{width:100%;margin:0 0 2rem}
.work-filter-head{display:flex;align-items:center;justify-content:center;margin-bottom:.75rem}
.work-filter-hint{display:none;color:#64748b;font-size:.75rem;line-height:1.5}
.work-filter-scroll{display:flex;justify-content:center;flex-wrap:wrap;gap:.65rem;padding:.25rem}
.work-filter-pill{position:relative;display:block;flex:0 0 auto;cursor:pointer;-webkit-tap-highlight-color:transparent}
.work-filter-pill input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.work-filter-pill span{min-height:44px;padding:.7rem 1rem;display:flex;align-items:center;justify-content:center;gap:.55rem;border:1px solid rgba(148,163,184,.18);border-radius:999px;background:rgba(15,23,42,.72);color:#94a3b8;font-size:.875rem;font-weight:700;line-height:1;white-space:nowrap;transition:background-color .2s ease,border-color .2s ease,color .2s ease,transform .2s ease,box-shadow .2s ease}
.work-filter-pill small{min-width:1.45rem;height:1.45rem;padding:0 .35rem;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:rgba(148,163,184,.12);color:#94a3b8;font-size:.68rem;font-weight:800;transition:inherit}
.work-filter-pill:hover span{color:#e2e8f0;border-color:rgba(56,189,248,.4);transform:translateY(-1px)}
.work-filter-pill input:checked+span{border-color:rgba(56,189,248,.75);background:#38bdf8;color:#07111f;box-shadow:0 8px 26px rgba(56,189,248,.2)}
.work-filter-pill input:checked+span small{background:rgba(7,17,31,.14);color:#07111f}
.work-filter-pill input:focus-visible+span{outline:3px solid rgba(56,189,248,.35);outline-offset:3px}
.work-project-grid>[data-work-category]{animation:work-card-in .28s ease both}
.work-filter-shell:has(input[value="ecommerce"]:checked)~.work-project-grid>[data-work-category]:not([data-work-category~="ecommerce"]),
.work-filter-shell:has(input[value="corporate"]:checked)~.work-project-grid>[data-work-category]:not([data-work-category~="corporate"]),
.work-filter-shell:has(input[value="services"]:checked)~.work-project-grid>[data-work-category]:not([data-work-category~="services"]),
.work-filter-shell:has(input[value="platforms"]:checked)~.work-project-grid>[data-work-category]:not([data-work-category~="platforms"]){display:none}
@keyframes work-card-in{from{opacity:.35;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:767px){
  .work-filter-shell{margin-bottom:1.5rem}
  .work-filter-head{justify-content:flex-start;padding-inline:.25rem}
  .work-filter-hint{display:block}
  .work-filter-scroll{justify-content:flex-start;flex-wrap:nowrap;overflow-x:auto;overscroll-behavior-inline:contain;scroll-snap-type:x proximity;scrollbar-width:none;margin-inline:-1rem;padding:.3rem 1rem .75rem}
  .work-filter-scroll::-webkit-scrollbar{display:none}
  .work-filter-pill{scroll-snap-align:start}
  .work-filter-pill span{min-height:46px;padding:.75rem .95rem;font-size:.82rem}
}
@media(prefers-reduced-motion:reduce){
  .work-filter-pill span,.work-project-grid>[data-work-category]{animation:none;transition:none}
}`.trim();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function write(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content, "utf8");
  console.log(`Updated ${relativePath}`);
}

function element(type, props = {}, children, key = null) {
  const nodeProps = { ...props };
  if (children !== undefined) nodeProps.children = children;
  return ["$", type, key, nodeProps];
}

function filterNode(lang) {
  const copy = labels[lang];
  const options = ["all", "ecommerce", "corporate", "services", "platforms"];
  return element(
    "div",
    { className: "work-filter-shell" },
    [
      element("style", {}, css),
      element(
        "div",
        { className: "work-filter-head" },
        element("p", { className: "work-filter-hint" }, copy.hint)
      ),
      element(
        "div",
        {
          className: "work-filter-scroll",
          role: "group",
          "aria-label": copy.aria
        },
        options.map((key) =>
          element(
            "label",
            { className: "work-filter-pill" },
            [
              element("input", {
                type: "radio",
                name: "work-filter",
                value: key,
                defaultChecked: key === "all"
              }),
              element("span", {}, [
                copy[key],
                element("small", { "aria-hidden": "true" }, String(counts[key]))
              ])
            ],
            key
          )
        )
      )
    ],
    "work-filters"
  );
}

function slugFromNode(node) {
  const serialized = JSON.stringify(node);
  for (const slug of categoryBySlug.keys()) {
    const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`/(?:ar/)?work/${escaped}(?:/|")`).test(serialized)) return slug;
  }
  return null;
}

function annotateCards(value) {
  if (!Array.isArray(value)) return;
  if (
    value[0] === "$" &&
    value[3] &&
    typeof value[3] === "object" &&
    typeof value[3].className === "string" &&
    value[3].className.includes("group flex flex-col")
  ) {
    const slug = slugFromNode(value);
    if (slug) value[3]["data-work-category"] = categoryBySlug.get(slug);
  }
  for (const child of value) {
    if (Array.isArray(child)) annotateCards(child);
    else if (child && typeof child === "object") {
      for (const nested of Object.values(child)) annotateCards(nested);
    }
  }
}

function addFilterToTree(value, lang) {
  let inserted = false;
  function walk(node) {
    if (inserted || !node) return;
    if (Array.isArray(node)) {
      const gridIndex = node.findIndex(
        (item) =>
          Array.isArray(item) &&
          item[0] === "$" &&
          item[3] &&
          typeof item[3].className === "string" &&
          item[3].className.includes("grid-cols-1 md:grid-cols-2 lg:grid-cols-3")
      );
      if (gridIndex !== -1) {
        const grid = node[gridIndex];
        grid[3].className = `${grid[3].className} work-project-grid`.replace(
          /\bwork-project-grid(?:\s+work-project-grid)+\b/g,
          "work-project-grid"
        );
        const existing = node.findIndex(
          (item) => Array.isArray(item) && item[2] === "work-filters"
        );
        if (existing !== -1) node[existing] = filterNode(lang);
        else node.splice(gridIndex, 0, filterNode(lang));
        inserted = true;
        return;
      }
      node.forEach(walk);
    } else if (typeof node === "object") {
      Object.values(node).forEach(walk);
    }
  }
  walk(value);
  if (!inserted) throw new Error("Could not find the work projects grid");
}

function updatePayload(relativePath, rootLineId, lang) {
  const lines = read(relativePath).split(/\r?\n/).filter(Boolean);
  for (let index = 0; index < lines.length; index += 1) {
    const separator = lines[index].indexOf(":");
    if (separator === -1) continue;
    const id = lines[index].slice(0, separator);
    let value;
    try {
      value = JSON.parse(lines[index].slice(separator + 1));
    } catch {
      continue;
    }
    annotateCards(value);
    if (id === rootLineId) addFilterToTree(value, lang);
    lines[index] = `${id}:${JSON.stringify(value)}`;
  }
  write(relativePath, `${lines.join("\n")}\n`);
}

function findBalanced(html, start, tagName) {
  const pattern = new RegExp(`<${tagName}(?:\\s|>)|<\\/${tagName}>`, "g");
  pattern.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = pattern.exec(html))) {
    if (match[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) return [start, pattern.lastIndex];
    } else depth += 1;
  }
  throw new Error(`Unbalanced ${tagName}`);
}

function filterHtml(lang) {
  const copy = labels[lang];
  const options = ["all", "ecommerce", "corporate", "services", "platforms"];
  const pills = options
    .map(
      (key) =>
        `<label class="work-filter-pill"><input type="radio" name="work-filter" value="${key}"${key === "all" ? " checked" : ""}><span>${copy[key]}<small aria-hidden="true">${counts[key]}</small></span></label>`
    )
    .join("");
  return `<!-- work-filter:start --><div class="work-filter-shell"><style>${css}</style><div class="work-filter-head"><p class="work-filter-hint">${copy.hint}</p></div><div class="work-filter-scroll" role="group" aria-label="${copy.aria}">${pills}</div></div><!-- work-filter:end -->`;
}

function updateStaticHtml(relativePath, lang) {
  let html = read(relativePath);
  html = html.replace(/<!-- work-filter:start -->[\s\S]*?<!-- work-filter:end -->/g, "");

  const gridMarker = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  const gridStart = html.indexOf(`<div class="${gridMarker}`);
  if (gridStart === -1) throw new Error(`Missing work grid in ${relativePath}`);
  const openingEnd = html.indexOf(">", gridStart);
  let opening = html.slice(gridStart, openingEnd + 1);
  if (!opening.includes("work-project-grid")) {
    opening = opening.replace(gridMarker, `${gridMarker} work-project-grid`);
    html = `${html.slice(0, gridStart)}${opening}${html.slice(openingEnd + 1)}`;
  }

  for (const [slug, category] of categoryBySlug) {
    const hrefPattern = new RegExp(`href="(?:/ar)?/work/${slug}/?"`);
    const match = hrefPattern.exec(html);
    if (!match) throw new Error(`Missing ${slug} card in ${relativePath}`);
    const cardStart = html.lastIndexOf('<div class="group flex flex-col', match.index);
    const cardOpeningEnd = html.indexOf(">", cardStart);
    let cardOpening = html.slice(cardStart, cardOpeningEnd + 1);
    if (/data-work-category="[^"]*"/.test(cardOpening)) {
      cardOpening = cardOpening.replace(/data-work-category="[^"]*"/, `data-work-category="${category}"`);
    } else {
      cardOpening = cardOpening.replace(">", ` data-work-category="${category}">`);
    }
    html = `${html.slice(0, cardStart)}${cardOpening}${html.slice(cardOpeningEnd + 1)}`;
  }

  const updatedGridStart = html.indexOf(`<div class="${gridMarker}`);
  html = `${html.slice(0, updatedGridStart)}${filterHtml(lang)}${html.slice(updatedGridStart)}`;
  write(relativePath, html);
}

function syncEmbedded(relativeHtmlPath, rawPayloadPath) {
  const rawLines = new Map(
    read(rawPayloadPath)
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => [line.slice(0, line.indexOf(":")), line])
  );
  let html = read(relativeHtmlPath);
  const pattern = /<script>self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)<\/script>/g;
  html = html.replace(pattern, (full, encoded) => {
    let decoded;
    try {
      decoded = JSON.parse(encoded);
    } catch {
      return full;
    }
    const id = decoded.slice(0, decoded.indexOf(":"));
    const raw = rawLines.get(id);
    return raw ? `<script>self.__next_f.push([1,${JSON.stringify(`${raw}\n`)}])</script>` : full;
  });
  write(relativeHtmlPath, html);
}

for (const [lang, prefix] of [
  ["en", ""],
  ["ar", "ar/"]
]) {
  updatePayload(`${prefix}work/index.txt`, "5", lang);
  updatePayload(`${prefix}work/__next._full.txt`, "5", lang);
  updatePayload(
    lang === "ar"
      ? "ar/work/__next.ar/work/__PAGE__.txt"
      : "work/__next.!KGVuKQ/work/__PAGE__.txt",
    "0",
    lang
  );
  updateStaticHtml(`${prefix}work/index.html`, lang);
  syncEmbedded(`${prefix}work/index.html`, `${prefix}work/index.txt`);
}

console.log("Work filters added.");
