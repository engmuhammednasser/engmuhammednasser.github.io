# Work Project Data Model

Status: historical Sprint 3 design record. The schema remains in use, but its
43-project examples/counts predate PR #4. Current inventory and maintenance steps
are in `PORTFOLIO_ENGINEERING_HANDOFF.md` and `PORTFOLIO_OPERATIONS_GUIDE.md`.

## Purpose

The Work archive is driven by one canonical document: `data/projects.json`. The document is shared by the English and Arabic Work routes, the static renderer, the browser controller, and the validation checks. There is no React application or client-side project registry.

## Document shape

```json
{
  "schemaVersion": 1,
  "categories": [
    { "id": "all", "label": { "en": "All", "ar": "الكل" } },
    { "id": "ecommerce", "label": { "en": "E-Commerce", "ar": "متاجر إلكترونية" } }
  ],
  "projects": [
    {
      "id": "project-slug",
      "slug": "project-slug",
      "category": "ecommerce",
      "featured": false,
      "title": { "en": "…", "ar": "…" },
      "description": { "en": "…", "ar": "…" },
      "eyebrow": { "en": "…", "ar": "…" },
      "technologies": ["WordPress", "WooCommerce"],
      "thumbnail": {
        "original": "/projects/project-slug/cover.webp",
        "avif480": null,
        "avif800": null,
        "webp480": null,
        "webp800": null,
        "width": 1200,
        "height": 900,
        "aspectRatio": 1.3333333333
      },
      "caseStudy": { "en": "/work/project-slug/", "ar": "/ar/work/project-slug/" },
      "liveUrl": "https://example.com/",
      "availability": "case-study+live",
      "status": "published"
    }
  ]
}
```

The current canonical set contains 43 projects in the existing Work order:

- 13 e-commerce projects
- 21 corporate projects
- 7 services projects
- 2 platform projects
- 41 `case-study+live` records and 2 `case-study` records
- 0 `live-only` or `archive-only` records

`featured` preserves the existing homepage relationship. Homepage featured cards remain a separate static surface in Sprint 3; the data flag provides a future consistency seam without forcing a risky homepage rewrite.

## Source and validation

`scripts/extract-work-project-data.mjs` is the migration extractor used to faithfully collect the current EN/AR Work cards, their categories, copy, technology labels, thumbnails, case-study routes, and live URLs. The generated JSON is now the source of truth; the extractor is not a runtime dependency.

`scripts/validate-project-data.mjs` checks:

- schema and canonical category order;
- unique IDs, slugs, and case-study paths;
- matching EN/AR category, live URL, and case-study routes;
- localized titles, descriptions, eyebrows, and technologies;
- thumbnail and optimized-variant existence plus intrinsic dimensions/aspect ratio;
- HTTP(S)-only external URLs;
- published/archive status and link availability classification;
- exact `/work/{slug}/` and `/ar/work/{slug}/` route preservation.

The validation command is part of `npm run check`.

## Card rendering contract

`scripts/work-card-template.mjs` defines the deterministic static card contract used by `scripts/render-work-archive.mjs`; `scripts/work-archive.js` reproduces that same contract in the browser after data loading.

Every card is a semantic `<article>` containing:

- a localized internal case-study link;
- a lazy, async image with `width`, `height`, `sizes`, and a stable `aspect-[4/3]` media frame;
- AVIF/WebP `<picture>` sources where Sprint 1 variants exist, with the original asset preserved as fallback;
- localized eyebrow, title, and description;
- a safe external live link using `target="_blank" rel="noopener noreferrer"` when present;
- technology badges and an explicit case-study action;
- `data-project-id`, `data-work-category`, and `data-availability` metadata.

The renderer escapes text and URL attributes. The runtime accepts only the validated internal Work route shape and HTTP(S) live URLs before inserting them.

## Progressive archive behavior

The static EN and AR pages contain the first 12 canonical cards. The browser controller fetches `/data/projects.json`, then renders the selected category in batches of 12: 12, 24, and the remaining matching records. Filtering resets the visible batch to 12 and never duplicates a card.

The native-button controls expose `aria-pressed`, `aria-controls`, visible keyboard focus, and an `aria-live` result status. An empty localized status is available for zero-result filters. The controller is scoped to the Work filter and grid; it does not use a framework, a document-wide scan, or a `MutationObserver`.

No-JavaScript behavior is intentional: the initial 12 cards remain visible, and a `<noscript>` project index exposes all 43 localized case-study links for direct navigation and crawlability. There is no URL filter state in Sprint 3 because the archive is a single static route and adding query/history state would add complexity without a demonstrated requirement. Category landing pages and route-level SEO expansion are deferred to Sprint 4 evaluation.

## Image pipeline relationship

Sprint 1's optimized thumbnail pipeline remains authoritative for the five pilot projects currently carrying generated AVIF/WebP variants. Sprint 3 consumes those manifests and does not mass-convert or rename the remaining original assets. The existing image delivery check validates both the active Work cards and the optimized variant budgets.

## Payload and maintenance boundary

The renderer updates the Work HTML and the exported Work Flight payload roots to the same 12-card initial slice. The legacy workspace importer remains available for case-study generation, but it is no longer the Work archive renderer or category source. Future Work updates should edit `data/projects.json`, then run:

```powershell
npm run work:data
npm run filter:work
npm run check
```
