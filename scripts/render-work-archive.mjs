import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  renderFilterShell,
  renderLoadMore,
  renderNoScriptList,
  renderProjectCard
} from "./work-card-template.mjs";

const root = resolve(process.cwd());
const data = JSON.parse(readFileSync(resolve(root, "data/projects.json"), "utf8"));
const initialCount = 12;

const cardClasses = "group flex flex-col bg-[#111827] rounded-2xl overflow-hidden border border-white/5 hover:border-[#38BDF8]/30 transition-all hover:shadow-[0_10px_30px_rgba(56,189,248,0.05)] hover:-translate-y-1";
const actionClasses = "inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border transition-all";
const copy = {
  en: { filterLabel: "Filter projects", all: "All projects", showing: (visible, total) => `Showing ${visible} of ${total} projects`, loadMore: "Load more projects", empty: "No projects match this category.", live: "Live Site", caseStudy: "View Case Study", technologies: "Technologies" },
  ar: { filterLabel: "تصفية المشاريع", all: "كل المشاريع", showing: (visible, total) => `عرض ${visible} من أصل ${total} مشروعًا`, loadMore: "تحميل المزيد من المشاريع", empty: "لا توجد مشاريع مطابقة لهذا التصنيف.", live: "الموقع المباشر", caseStudy: "عرض دراسة الحالة", technologies: "التقنيات" }
};

function element(type, key, props = {}) {
  return ["$", type, key, props];
}

function payloadImage(project, locale) {
  const thumbnail = project.thumbnail;
  const fallback = thumbnail.webp800 || thumbnail.webp480 || thumbnail.original;
  const srcSet = [
    thumbnail.webp480 && `${thumbnail.webp480} 480w`,
    thumbnail.webp800 && `${thumbnail.webp800} 800w`
  ].filter(Boolean).join(", ");
  const image = element("img", null, {
    src: fallback,
    ...(srcSet ? { srcSet } : {}),
    sizes: "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
    width: thumbnail.width,
    height: thumbnail.height,
    alt: project.title[locale],
    loading: "lazy",
    decoding: "async",
    className: "h-full w-full object-cover object-top opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
  });
  const media = thumbnail.avif480 || thumbnail.avif800 || thumbnail.webp480 || thumbnail.webp800
    ? element("picture", null, {
        "data-pilot-thumbnail": project.slug,
        children: [
          ...(thumbnail.avif480 || thumbnail.avif800 ? [element("source", null, { type: "image/avif", srcSet: [thumbnail.avif480 && `${thumbnail.avif480} 480w`, thumbnail.avif800 && `${thumbnail.avif800} 800w`].filter(Boolean).join(", "), sizes: "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" })] : []),
          ...(thumbnail.webp480 || thumbnail.webp800 ? [element("source", null, { type: "image/webp", srcSet: [thumbnail.webp480 && `${thumbnail.webp480} 480w`, thumbnail.webp800 && `${thumbnail.webp800} 800w`].filter(Boolean).join(", "), sizes: "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" })] : []),
          image
        ]
      })
    : image;
  return element("div", null, {
    className: "relative aspect-[4/3] w-full overflow-hidden bg-[#0B1020]",
    "data-thumbnail-aspect": String(thumbnail.aspectRatio),
    children: [media, element("div", null, { className: "absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80" })]
  });
}

function payloadCard(project, locale) {
  const localizedCaseStudy = project.caseStudy[locale];
  const localized = project.title[locale];
  const liveLink = project.liveUrl
    ? element("a", null, { href: project.liveUrl, target: "_blank", rel: "noopener noreferrer", className: `${actionClasses} bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20 hover:bg-[#22C55E]/20 hover:border-[#22C55E]/40`, children: [element("span", null, { className: "h-1.5 w-1.5 rounded-full bg-[#22C55E]", "aria-hidden": "true" }), copy[locale].live] })
    : null;
  const technologies = project.technologies.map((technology) => element("li", technology, { className: "rounded-md border border-white/5 bg-[#1E293B] px-3 py-1.5 text-xs font-semibold text-[#94A3B8]", children: technology }));
  return element("article", project.id, {
    className: cardClasses,
    "data-work-card": "true",
    "data-project-id": project.id,
    "data-work-category": project.category,
    "data-availability": project.availability,
    children: [
      element("a", null, {
        className: "block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#38BDF8]",
        href: localizedCaseStudy,
        children: [
          payloadImage(project, locale),
          element("div", null, {
            className: "flex flex-1 flex-col p-8",
            children: [
              element("div", null, { className: "mb-3 text-xs font-bold uppercase tracking-widest text-[#38BDF8]", children: project.eyebrow[locale] }),
              element("h3", null, { className: "mb-3 text-2xl font-bold leading-snug transition-colors group-hover:text-[#38BDF8]", children: localized }),
              element("p", null, { className: "line-clamp-2 text-sm leading-relaxed text-[#94A3B8]", children: project.description[locale] })
            ]
          })
        ]
      }),
      element("div", null, {
        className: "px-8 pb-8",
        children: [element("div", null, { className: "flex flex-wrap gap-3", children: [liveLink, element("a", null, { href: localizedCaseStudy, className: `${actionClasses} border-[#38BDF8]/20 bg-[#38BDF8]/10 text-[#38BDF8] hover:border-[#38BDF8]/40 hover:bg-[#38BDF8]/20`, children: copy[locale].caseStudy })].filter(Boolean) }), element("ul", null, { "aria-label": copy[locale].technologies, className: "mt-6 flex flex-wrap gap-2", children: technologies })]
      })
    ]
  });
}

function payloadFilter(document, locale) {
  const counts = Object.fromEntries(document.categories.map((category) => [category.id, document.projects.filter((project) => project.category === category.id).length]));
  const buttons = document.categories.map((category, index) => element("button", category.id, {
    type: "button",
    className: "min-h-11 rounded-full border border-white/10 bg-[#0F172A]/80 px-4 py-3 text-sm font-bold text-[#94A3B8] transition-colors hover:border-[#38BDF8]/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#38BDF8]",
    "data-work-filter": category.id,
    "aria-pressed": index === 0 ? "true" : "false",
    children: [category.id === "all" ? copy[locale].all : category.label[locale], element("span", null, { "aria-hidden": "true", className: "rounded-full bg-white/10 px-2 py-0.5 text-xs", children: category.id === "all" ? document.projects.length : counts[category.id] })]
  }));
  return element("div", "work-filters", {
    className: "work-filter-shell mb-8 w-full",
    "data-work-filter-controller": "true",
    "data-work-locale": locale,
    children: [
      element("div", null, { className: "mb-3 text-center", children: element("p", null, { className: "text-sm font-bold uppercase tracking-widest text-[#94A3B8]", id: "work-filter-label", children: copy[locale].filterLabel }) }),
      element("div", null, { className: "flex flex-wrap justify-center gap-3", role: "group", "aria-labelledby": "work-filter-label", children: buttons }),
      element("p", null, { className: "mt-4 text-center text-sm text-[#94A3B8]", "data-work-status": "true", "aria-live": "polite", children: copy[locale].showing(Math.min(initialCount, document.projects.length), document.projects.length) })
    ]
  });
}

function updatePayload(relativeFile, locale) {
  const path = resolve(root, relativeFile);
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  const lineIndex = lines.findIndex((line) => line.startsWith("5:"));
  if (lineIndex === -1) return;
  const tree = JSON.parse(lines[lineIndex].slice(2));
  const section = tree[3].children.find((child) => Array.isArray(child) && child[0] === "$" && child[1] === "section");
  if (!section) throw new Error(`${relativeFile}: Work section missing from payload`);
  const children = section[3].children;
  const header = children[0];
  section[3].children = [
    header,
    payloadFilter(data, locale),
    element("div", null, {
      id: "work-project-grid",
      className: "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 work-project-grid",
      children: data.projects.slice(0, initialCount).map((project) => payloadCard(project, locale))
    }),
    element("div", null, {
      className: "mt-10 text-center",
      "data-work-load-more-shell": "true",
      children: element("button", null, { type: "button", className: "min-h-11 rounded-full border border-[#38BDF8]/40 bg-[#38BDF8]/10 px-6 py-3 text-sm font-bold text-[#38BDF8]", "data-work-load-more": "true", "aria-controls": "work-project-grid", children: copy[locale].loadMore })
    })
  ];
  lines[lineIndex] = `5:${JSON.stringify(tree)}`;
  writeFileSync(path, `${lines.join("\n").replace(/\n+$/, "")}\n`, "utf8");
  console.log(`Updated Work Flight payload: ${relativeFile}`);
}

function renderLocale(locale, file) {
  const path = resolve(root, file);
  const html = readFileSync(path, "utf8");
  const marker = "<!-- work-filter:start -->";
  const markerStart = html.indexOf(marker);
  const mainEnd = html.indexOf("</main>");
  if (markerStart === -1 || mainEnd === -1 || markerStart > mainEnd) {
    throw new Error(`${file}: could not locate Work archive content boundary`);
  }

  const initialProjects = data.projects.slice(0, initialCount);
  const archiveContent = [
    renderFilterShell(data, locale),
    `<div id="work-project-grid" class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 work-project-grid">${initialProjects.map((project) => renderProjectCard(project, locale)).join("")}</div>`,
    renderLoadMore(data, locale),
    renderNoScriptList(data, locale),
    "</section>"
  ].join("");

  let nextHtml = `${html.slice(0, markerStart)}${archiveContent}${html.slice(mainEnd)}`;
  nextHtml = nextHtml.replace(/<script\b[^>]*data-work-archive[^>]*><\/script>/gi, "");
  nextHtml = nextHtml.replace(
    "</body>",
    `<script src="/scripts/work-archive.js" defer data-work-archive data-project-data="/data/projects.json"></script></body>`
  );
  writeFileSync(path, nextHtml, "utf8");
  console.log(`Rendered ${locale.toUpperCase()} Work archive: ${initialProjects.length}/${data.projects.length} cards in HTML.`);
}

renderLocale("en", "work/index.html");
renderLocale("ar", "ar/work/index.html");
for (const [file, locale] of [["work/index.txt", "en"], ["work/__next._full.txt", "en"], ["ar/work/index.txt", "ar"], ["ar/work/__next._full.txt", "ar"]]) {
  updatePayload(file, locale);
}
