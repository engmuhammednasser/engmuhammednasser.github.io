# Work Architecture Before Sprint 3

Date: 2026-08-02  
Branch: `refactor/performance-clean-architecture`  
Scope: English `/work/`, Arabic `/ar/work/`, existing Work mutation scripts, and homepage featured-project references

This inventory was completed before changing Work rendering or project data. The repository is a committed static Next.js export without the original source/build configuration. The current Work implementation is therefore represented by generated HTML, duplicated Next payload text files, and post-processing scripts.

## Source and route map

| Responsibility | Current source/files | Before-state behavior |
|---|---|---|
| English Work document | `work/index.html` | Complete static archive page; 148,238 bytes; all cards present in the initial document |
| Arabic Work document | `ar/work/index.html` | Complete RTL static archive page; 155,143 bytes; all cards present in the initial document |
| English serialized payloads | `work/index.txt`, `work/__next._full.txt`, `work/__next.!KGVuKQ.txt`, related `__next.*` files | Duplicate/serialized page representation used by the export and mutation scripts |
| Arabic serialized payloads | `ar/work/index.txt`, `ar/work/__next._full.txt`, `ar/work/__next.ar.txt`, related `__next.*` files | Arabic duplicate/serialized representation |
| Existing filter injection | `scripts/add-work-filters.mjs` | Inserts filter controls, CSS, and `data-work-category` annotations into HTML and payload trees |
| Workspace project importer | `scripts/import-workspace-projects.mjs` | Contains hardcoded project records, appended project order, card template logic, and case-study generation; references unavailable `S:\workspace` input |
| Pilot image migration | `scripts/apply-pilot-thumbnails.mjs` | Rewrites five Work card image consumers and synchronizes HTML/payload representations |
| Loading normalization | `scripts/normalize-image-delivery.mjs` | Normalizes Work card loading/decoding and image preload policy |
| Image validation | `scripts/check-image-delivery.mjs` | Checks Work card loading, pilot `<picture>` output, dimensions, and generated variants |
| Homepage featured references | `index.html`, `ar/index.html`, matching payloads | Five featured projects are rendered separately from Work and are not sourced from a shared project catalog |

Public Work routes are `/work/` and `/ar/work/`. Existing project routes use `/work/{slug}/` and `/ar/work/{slug}/`; this inventory does not rename or reinterpret them.

## Project ordering and counts

Both Work documents contain the same 43 unique project slugs in the same order:

```text
eventgift-egypt
eventgift-uae
eventgift-saudi
botella
techmart
ashhalan
afaaq-developments
nora24jewelry
oryxbag
gobe
genedyeg
a2mkw
nuc-kw
tbinnovation
mediaandmore
ashhalanksa
ashhalanlogistics
ashhalancarrental
arabic-window
kuwait-arc
torathyat
armadillo-studio
alrowad
crm-order-management-system
gold-mine-erp
originals-hub
arcadia-digital
diwaniya
mahmmoud-gomaa
meshari-alali
light-islam
juli-tourism
baslim-auto
fast-shopping
mishari-oud
lec-elevators
mashora
top-pack
omnas
prowindow
taha-ramadan
asia-eg
zeta-medicine
```

Static measurements before Sprint 3:

| Metric | English | Arabic |
|---|---:|---:|
| Unique project slugs | 43 | 43 |
| Card roots (`data-work-category`) | 43 | 43 |
| Internal project-link occurrences | 86 | 86 |
| Initial project cards in DOM | 43 | 43 |
| Work HTML bytes | 148,238 | 155,143 |
| Work `index.txt` bytes | 104,579 | 109,863 |
| Load More control | absent | absent |

The generated card category distribution is:

| Category | English | Arabic |
|---|---:|---:|
| `ecommerce` | 13 | 13 |
| `corporate` | 21 | 21 |
| `services` | 7 | 7 |
| `platforms` | 2 | 2 |

## Current card contract

The generated card root is a `div` with a shared-looking Tailwind class pattern and `data-work-category`. A typical card contains:

1. an absolute internal project link;
2. an image wrapper with a `4/3` aspect ratio;
3. either a pilot `<picture>` with AVIF/WebP `srcset` or a single original/legacy image;
4. a category label;
5. an `h3` title;
6. a short description;
7. a live-site link where one exists;
8. an internal case-study/archive link;
9. technology badges.

The card markup is not actually one contract. Older generated cards, newer imported cards, backend/case-study cards, and the five pilot cards differ in link labels, image markup, dimensions, descriptions, and whether a live-site link exists. Some project cards use an internal case-study CTA; others use a browse/archive CTA. The current static output does not encode this distinction in a canonical data model.

## Images

Work card images are stored under `/projects/{slug}/...`. The five Sprint 1 pilot projects have generated variants and `<picture>` delivery:

```text
techmart
oryxbag
eventgift-egypt
gobe
afaaq-developments
```

Other cards use their existing original/cover/featured-image/full-page paths. Sprint 3 must reuse this pipeline and must not delete or mass-convert originals.

## Filter behavior

`scripts/add-work-filters.mjs` currently defines radio controls for:

```text
all
ecommerce
corporate
services
platforms
```

The English labels are `All`, `E-Commerce`, `Corporate Sites`, `Services & Booking`, and `Platforms`. Arabic labels are localized in the same script. The controls are inserted as labeled radio inputs inside `.work-filter-shell`.

The filter is CSS-driven:

- the selected radio is styled with `:checked` selectors;
- `:has(input[value="..."]:checked)` selects the active category;
- nonmatching `[data-work-category]` card roots are set to `display: none`;
- all project cards remain in the DOM regardless of the selected filter;
- there is no Load More state and no JavaScript filter controller.

The script’s category arrays contain 35 mapped slugs and its embedded count model is not the same as the current 43-card output. The current HTML has 43 category annotations and the distribution above, so the script is a stale/partial source rather than a safe canonical project database. Category and filter count drift is a known before-state defect.

## Featured project relationship

The English and Arabic homepage each reference five Work projects separately:

```text
eventgift-uae
techmart
oryxbag
botella
ashhalancarrental
```

These homepage cards are not generated from the Work filter script or a shared data file. Sprint 3 will evaluate the relationship, but will not force a homepage rewrite if doing so would expand scope or risk visual/content regression.

## Localization strategy

English and Arabic are separate generated route trees. The same project identity/order is visible in both Work pages, but title, description, alt text, labels, and filter copy are duplicated in separate HTML and payload representations. Arabic uses `/ar/work/{slug}/`, `lang="ar"`, and `dir="rtl"`; no independent source-level locale catalog is available.

The existing output contains Arabic copy for all 43 Work cards. Sprint 3 must extract that copy faithfully and must not invent translations for missing fields.

## Link behavior

Each Work card currently has two internal project-link occurrences, normally an overlay link and a secondary case-study/archive CTA. A subset also has an external live-site link with `target="_blank" rel="noopener noreferrer"`. Some external URLs are HTTP and require preservation/verification rather than blind rewriting.

The current Work output has no explicit `case-study`, `live-site-only`, or `archive-only` field. Link destination semantics must be derived from actual existing routes/markup and represented explicitly in the Sprint 3 data model. No project may silently fall back to `/work/` as a fake case study.

## Initial DOM and SEO tradeoff

The current static page makes all 43 project cards crawlable in the initial HTML, but pays the full card DOM/layout cost before filtering. A client-side Load More implementation can reduce active DOM work while retaining the full project catalog in a static, crawlable data representation. Sprint 3 must document how the no-JavaScript/static HTML tradeoff is handled; GitHub Pages provides no backend API.

## Before-state classifications

| Subsystem | Classification | Reason |
|---|---|---|
| Existing Work HTML/payload export | KEEP / REPLACE INCREMENTALLY | Public routes and content are valuable, but generated duplicates are not a maintainable source of truth |
| `scripts/add-work-filters.mjs` | OPTIMIZE / REPLACE | Current CSS filter styling is useful; hardcoded category arrays/counts are stale |
| `scripts/import-workspace-projects.mjs` | UNKNOWN / REUSE SELECTIVELY | Contains useful project records/templates, but depends on unavailable source media and mixes import, case-study generation, and Work mutation |
| Homepage featured cards | KEEP / DEFER | Preserve current feature presentation; consider shared data derivation only if safe |
| 43-card initial DOM | REMOVE / OPTIMIZE | Main Sprint 3 performance target |
| CSS `:has()` filtering | OPTIMIZE | Preserve the visual control language while moving eligible-set/pagination behavior to structured data |
| Existing image pipeline | KEEP | Sprint 1 work remains the only thumbnail/validation pipeline |

## Sprint 3 implementation boundary

The next implementation should add a canonical project dataset, a deterministic renderer, data validation, and a small Work interaction layer. It must preserve the existing route tree and use only scoped Work-container operations. It must not introduce React, a CMS, a large client framework, category-route expansion, SEO overhaul, or mass asset migration.
