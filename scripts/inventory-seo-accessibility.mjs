import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const origin = "https://engmuhammednasser.github.io";
const htmlFiles = [];
const priorityRoutes = [
  "/",
  "/work/",
  "/about/",
  "/services/",
  "/lab/",
  "/backend/",
  "/ar/",
  "/ar/work/",
  "/ar/about/",
  "/ar/services/",
  "/ar/lab/",
  "/ar/backend/",
  "/work/eventgift-uae/",
  "/ar/work/eventgift-uae/",
  "/work/techmart/",
  "/ar/work/techmart/",
  "/work/oryxbag/",
  "/ar/work/oryxbag/",
  "/work/ashhalancarrental/",
  "/ar/work/ashhalancarrental/",
  "/work/arcadia-digital/",
  "/ar/work/arcadia-digital/",
  "/lab/plugins/access-trail/",
  "/backend/techmart/",
  "/ar/backend/techmart/"
];

function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "scripts" || entry.name === "_next") continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) collect(absolute);
    else if (entry.isFile() && entry.name === "index.html") htmlFiles.push(absolute);
  }
}

function decode(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function attr(tag, name) {
  return decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] ?? "");
}

function tagCount(content, tag) {
  return (content.match(new RegExp(`<${tag}\\b`, "gi")) ?? []).length;
}

function tags(content, tag) {
  return [...content.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function meta(content, selector, value) {
  const tag = tags(content, "meta").find((candidate) => attr(candidate, selector) === value);
  return tag ? attr(tag, "content") : null;
}

function routeFromFile(file) {
  const relativePath = relative(root, file).replaceAll("\\", "/").replace(/(?:^|\/)index\.html$/, "");
  return `/${relativePath ? `${relativePath}/` : ""}`;
}

function localeFor(route) {
  return route === "/ar/" || route.startsWith("/ar/") ? "ar" : "en";
}

function pageTypeFor(route) {
  if (route === "/" || route === "/ar/") return "homepage";
  if (route === "/work/" || route === "/ar/work/") return "work-index";
  if (route.startsWith("/work/") || route.startsWith("/ar/work/")) return "case-study";
  if (route === "/backend/" || route === "/ar/backend/") return "backend-index";
  if (route.startsWith("/backend/") || route.startsWith("/ar/backend/")) return "backend-case-study";
  if (route === "/lab/" || route === "/ar/lab/") return "developer-lab";
  if (route.startsWith("/lab/") || route.startsWith("/ar/lab/")) return "lab-plugin";
  if (route === "/404/" || route === "/_not-found/") return "utility-error";
  return route.split("/").filter(Boolean).length === 1 || route.split("/").filter(Boolean).length === 2 ? "top-level" : "page";
}

function collectRecord(file) {
  const html = readFileSync(file, "utf8");
  const route = routeFromFile(file);
  const locale = localeFor(route);
  const counterpart = locale === "ar" ? route.replace(/^\/ar/, "") || "/" : `/ar${route}`;
  const images = tags(html, "img");
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map((match) => Number(match[1]));
  const robots = meta(html, "name", "robots");
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim() || null;
  const description = meta(html, "name", "description");
  const canonical = tags(html, "link").find((tag) => attr(tag, "rel").toLowerCase().split(/\s+/).includes("canonical"));
  const routeExists = htmlFiles.some((candidate) => routeFromFile(candidate) === counterpart);
  const meaningfulAlts = images.filter((image) => attr(image, "alt").trim()).length;
  const emptyAlts = images.filter((image) => image.match(/\balt=""/i)).length;
  const missingAlts = images.length - meaningfulAlts - emptyAlts;
  const buttons = tags(html, "button");
  const externalLinks = [...html.matchAll(/<a\b[^>]*href="https?:\/\/[^\"]+"[^>]*>/gi)].map((match) => match[0]);
  return {
    route,
    locale,
    canonicalURL: canonical ? attr(canonical, "href") : null,
    indexable: !/\bnoindex\b/i.test(robots ?? ""),
    pageType: pageTypeFor(route),
    enEquivalent: locale === "en" ? route : (routeExists ? counterpart : null),
    arEquivalent: locale === "ar" ? route : (routeExists ? counterpart : null),
    title: title ? { value: title, source: "static-html" } : null,
    description: description ? { value: description, source: "static-html" } : null,
    ogImage: meta(html, "property", "og:image"),
    metadata: {
      ogTitle: meta(html, "property", "og:title"),
      ogDescription: meta(html, "property", "og:description"),
      ogUrl: meta(html, "property", "og:url"),
      ogType: meta(html, "property", "og:type"),
      twitterCard: meta(html, "name", "twitter:card"),
      twitterTitle: meta(html, "name", "twitter:title"),
      twitterDescription: meta(html, "name", "twitter:description"),
      twitterImage: meta(html, "name", "twitter:image"),
      robots,
      hreflangCount: tags(html, "link").filter((tag) => attr(tag, "rel").toLowerCase().split(/\s+/).includes("alternate") && attr(tag, "hreflang")).length,
      structuredDataCount: [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"/gi)].length
    },
    accessibility: {
      landmarks: { header: tagCount(html, "header"), nav: tagCount(html, "nav"), main: tagCount(html, "main"), footer: tagCount(html, "footer"), section: tagCount(html, "section") },
      headings,
      images: { total: images.length, meaningfulAlt: meaningfulAlts, emptyAlt: emptyAlts, missingAlt: missingAlts },
      links: tagCount(html, "a"),
      buttons: buttons.length,
      labeledButtons: buttons.filter((button) => attr(button, "aria-label").trim() || button.replace(/<[^>]+>/g, "").trim()).length,
      forms: tagCount(html, "form"),
      labels: tagCount(html, "label"),
      skipLink: /<a\b[^>]*href="#(?:main-content|content|main)"/i.test(html),
      focusVisible: /focus-visible/i.test(html),
      workFilters: (html.match(/data-work-filter=/g) ?? []).length,
      loadMore: (html.match(/data-work-load-more(?:=|\b)/g) ?? []).length,
      externalLinksWithoutSafeRel: externalLinks.filter((link) => !/target="_blank"/i.test(link) || !/rel="[^"]*noopener/i.test(link)).length
    },
    language: { lang: attr(html.match(/<html\b[^>]*>/i)?.[0] ?? "", "lang") || null, dir: attr(html.match(/<html\b[^>]*>/i)?.[0] ?? "", "dir") || null },
    file: relative(root, file).replaceAll("\\", "/")
  };
}

collect(root);
const routes = htmlFiles.sort().map(collectRecord);
const routeMap = new Map(routes.map((route) => [route.route, route]));
for (const route of routes) {
  if (route.enEquivalent && !routeMap.has(route.enEquivalent)) route.enEquivalent = null;
  if (route.arEquivalent && !routeMap.has(route.arEquivalent)) route.arEquivalent = null;
}

const aggregate = {
  routeCount: routes.length,
  indexableCount: routes.filter((route) => route.indexable).length,
  missingTitle: routes.filter((route) => !route.title).length,
  missingDescription: routes.filter((route) => !route.description).length,
  canonicalCount: routes.filter((route) => route.canonicalURL).length,
  ogUrlCount: routes.filter((route) => route.metadata.ogUrl).length,
  hreflangRouteCount: routes.filter((route) => route.metadata.hreflangCount > 0).length,
  structuredDataRouteCount: routes.filter((route) => route.metadata.structuredDataCount > 0).length,
  noindexCount: routes.filter((route) => !route.indexable).length,
  languageMismatchCount: routes.filter((route) => route.language.lang !== (route.locale === "ar" ? "ar" : "en") || (route.locale === "ar" && route.language.dir !== "rtl")).length,
  missingAltImages: routes.reduce((total, route) => total + route.accessibility.images.missingAlt, 0),
  emptyAltImages: routes.reduce((total, route) => total + route.accessibility.images.emptyAlt, 0),
  skipLinkCount: routes.filter((route) => route.accessibility.skipLink).length,
  mainLandmarkCount: routes.filter((route) => route.accessibility.landmarks.main === 1).length,
  formCount: routes.reduce((total, route) => total + route.accessibility.forms, 0),
  workFilterRoutes: routes.filter((route) => route.accessibility.workFilters > 0).length,
  loadMoreRoutes: routes.filter((route) => route.accessibility.loadMore > 0).length
};

mkdirSync(resolve(root, "data"), { recursive: true });
writeFileSync(resolve(root, "data/routes.json"), `${JSON.stringify({ schemaVersion: 1, origin, generatedFrom: "static index.html routes", routes }, null, 2)}\n`, "utf8");

const representative = priorityRoutes.map((route) => routeMap.get(route)).filter(Boolean);
const compact = (value) => (value ? value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ") : "—");
const metadataRows = representative.map((route) => `| \`${route.route}\` | ${route.locale} | ${route.pageType} | ${compact(route.title?.value)} | ${compact(route.description?.value)} | ${compact(route.canonicalURL)} | ${compact(route.metadata.ogUrl)} | ${route.metadata.hreflangCount} |`).join("\n");
const headingSummary = routes.reduce((counts, route) => {
  const key = route.accessibility.headings.join(",") || "none";
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});
const beforeMarkdown = `# SEO & Accessibility Before-State Inventory

Date: 2026-08-02  
Source: static exported HTML on refactor/performance-clean-architecture before Sprint 4 production changes

## Scope and method

This inventory was generated by scripts/inventory-seo-accessibility.mjs. It reads every exported index.html outside _next, records route and locale relationships, extracts head metadata, and counts semantic/accessibility signals without changing production HTML. The full deterministic route inventory is data/routes.json.

Representative coverage includes the homepage, Work, About, Services, Developer Lab, Backend Systems, English and Arabic equivalents, five bilingual case studies, a lab plugin, and a backend project route.

## Aggregate baseline

| Signal | Result |
| --- | ---: |
| Exported route files | ${aggregate.routeCount} |
| Indexable by current robots meta | ${aggregate.indexableCount} |
| Missing titles | ${aggregate.missingTitle} |
| Missing descriptions | ${aggregate.missingDescription} |
| Routes with canonical links | ${aggregate.canonicalCount} |
| Routes with og:url | ${aggregate.ogUrlCount} |
| Routes with hreflang | ${aggregate.hreflangRouteCount} |
| Routes with JSON-LD | ${aggregate.structuredDataRouteCount} |
| Routes marked noindex | ${aggregate.noindexCount} |
| EN/AR language or RTL mismatches | ${aggregate.languageMismatchCount} |
| Images missing alt | ${aggregate.missingAltImages} |
| Images with empty alt | ${aggregate.emptyAltImages} |
| Routes with skip links | ${aggregate.skipLinkCount} |
| Routes with exactly one main landmark | ${aggregate.mainLandmarkCount} |
| Functional forms | ${aggregate.formCount} |
| Work filter routes | ${aggregate.workFilterRoutes} |
| Work Load More routes | ${aggregate.loadMoreRoutes} |

Heading sequence distribution is recorded as: ${JSON.stringify(headingSummary)}.

## Representative metadata

| Route | Locale | Type | Title | Description | Canonical | og:url | Hreflang |
| --- | --- | --- | --- | --- | --- | --- | ---: |
${metadataRows}

The representative output shows the existing homepage-style metadata reuse on inner pages, including Work and Services. Current og:url values likewise point to the homepage rather than the current route. Canonical and hreflang links are absent in the baseline. Twitter card fields exist on the sampled pages but inherit the same generic title/description/image pattern.

## SEO findings

### P0 — Critical

None observed in this static inventory.

### P1 — High

- Important inner routes reuse generic homepage title/description content.
- og:url is not route-specific on sampled inner pages.
- No canonical links were found in the export.
- No reciprocal EN/AR hreflang relationships were found.
- No public robots.txt or sitemap.xml exists at the repository root.

### P2 — Medium

- JSON-LD structured data was not found in the export.
- Route metadata is not visibly derived from the canonical Work dataset for case studies or backend routes.
- Indexability of utility/error routes requires an explicit generated policy rather than relying only on current export behavior.

### P3 — Low

- Social metadata is present but needs route-specific title, description, URL, and image selection.
- No reliable lastmod source was found; the future sitemap should omit it rather than fabricate dates.

## Accessibility findings

### P0 — Critical

None observed from static inspection.

### P1 — High

- Skip navigation is not a site-wide invariant; only two legacy EventGift routes expose a skip target, while the remaining representative and indexable routes do not.
- Navigation/menu semantics and focus restoration need browser verification on representative desktop/mobile states.
- Inner-page heading sequences and route-specific landmark structure need deterministic validation rather than assuming the homepage pattern.

### P2 — Medium

- The export contains a mixture of informative, functional, and decorative image usage; alt treatment should be classified and validated by route type.
- Focus-visible styling is present in some controls but is not a route-wide invariant for every interactive element.
- Repeated CTA/link names should be checked for contextual accessible names, especially case-study and external live links.
- Form applicability must be confirmed; static form counts are recorded above before deciding whether any rewrite is in scope.

### P3 — Low

- Contrast was not assigned fabricated ratios in this inventory. A later check may measure key controls with reliable tooling; any palette adjustment should remain minimal.

## Existing strengths to preserve

- EN pages expose lang="en"; Arabic pages expose lang="ar" dir="rtl" in the sampled routes.
- Work filters use native buttons with aria-pressed, and Load More uses a native button with aria-controls.
- Sprint 1 lazy/async image delivery and optimized pilot variants are already validated.
- Sprint 2 reduced-motion and runtime lifecycle invariants are already validated.
- Sprint 3 provides canonical project data, no-JS case-study links, and an EN/AR interaction harness.

## Accessibility/static limitations

This is a static and headless baseline, not a WCAG certification or a fabricated Lighthouse score. It does not prove visual contrast, screen-reader announcement quality, keyboard focus order through every mobile-menu state, or browser-specific assistive-technology behavior. Sprint 4 browser checks must cover those behaviors where Chrome headless can observe them.
`;
if (process.argv.includes("--before")) {
  writeFileSync(resolve(root, "docs/audit/seo-accessibility-before.md"), beforeMarkdown, "utf8");
}
console.log(`Generated SEO/accessibility inventory for ${routes.length} routes and ${representative.length} representative pages.`);
console.log(JSON.stringify(aggregate));
