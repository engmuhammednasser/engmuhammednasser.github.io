# SEO & Accessibility Strategy

Status: historical Sprint 4 design record. The strategy remains in use, but route
counts in this document predate PR #4. Current inventory and operational sequencing
are in `PORTFOLIO_ENGINEERING_HANDOFF.md` and `PORTFOLIO_OPERATIONS_GUIDE.md`.

This document describes the deterministic static-export transformation used for SEO and accessibility. It complements [project-data-model.md](project-data-model.md); it does not replace the canonical Work data contract.

## Route inventory

`data/routes.json` is generated from the exported `index.html` route tree by `scripts/inventory-seo-accessibility.mjs`. Each record includes:

- route and locale;
- whether the current route is indexable;
- page type;
- real EN and AR counterparts, or null when no counterpart exists;
- current title/description sources;
- canonical and social URLs;
- accessibility and metadata measurements.

The inventory is regenerated after a static export change and is consumed by the SEO validator and sitemap generator. The historical before-state remains in `docs/audit/seo-accessibility-before.md`.

## Metadata strategy

`scripts/apply-seo-accessibility.mjs` reads the route inventory, existing visible headings/paragraphs, and the canonical project data. It removes only the old description, social, canonical, alternate, robots, and generated JSON-LD tags, then writes one deterministic set per route.

Indexable routes receive:

- one route-specific title;
- one visible-content-aligned description;
- a canonical URL using the deployed trailing-slash route;
- route-specific Open Graph and Twitter metadata;
- JSON-LD describing the page, with accurate Person/WebSite data on the homepage, CollectionPage data for archive indexes, and CreativeWork data only where a canonical project record exists.

Utility error pages remain noindex. No fabricated project dates, reviews, ratings, awards, client relationships, addresses, or social profiles are emitted.

Project social images use the existing Sprint 1 optimized WebP variant when one exists. Other pages use the existing profile image rather than promoting a full-page screenshot into a social preview.

## EN/AR and hreflang

Hreflang is emitted only when both localized route files exist in the inventory. Such pairs receive reciprocal `en` and `ar` links plus `x-default` pointing to the English route. No missing Arabic route is created to satisfy symmetry.

The current exported indexable routes have real EN/AR counterparts. English pages use `lang="en"`; Arabic pages use `lang="ar" dir="rtl"`. The canonical URL always remains the current localized route.

## Crawl assets

`scripts/generate-seo-assets.mjs` generates:

- `robots.txt`, allowing the public portfolio and excluding only the two utility error routes;
- `sitemap.xml`, containing the 184 real indexable routes from the inventory, with no query/filter states and no fabricated `lastmod` values.

The sitemap URL is declared in robots.txt. Re-run `npm run seo:assets` after route inventory changes.

## Semantic HTML and keyboard behavior

The static transformation gives routes with main content one `main#main-content` landmark and a native skip link. It labels the primary navigation, connects the mobile menu button to its dialog with `aria-controls`, and preserves the existing native menu buttons and runtime behavior.

Indexable pages retain one h1. Lab and Backend index card headings were corrected from h3 to h2 so the existing visual hierarchy does not jump from h1 to h3. Work filters remain native buttons with `aria-pressed`; Load More remains a native button with `aria-controls`.

`scripts/portfolio-effects.css` provides a shared `:focus-visible` outline and a focus-only skip-link presentation. It does not remove browser outlines. Reduced-motion handling for existing effects is preserved, and the skip-link transition is disabled under `prefers-reduced-motion: reduce`.

Images are validated for an alt attribute. Empty alt is retained for the six existing modal placeholders that have no source until a user opens the case-study viewer; informative and functional images retain meaningful labels. No SEO keyword stuffing is added to alt text.

## Structured-data policy

JSON-LD is small, server-rendered, and route-specific. The validator parses every generated block and verifies schema context, type, and route URL. `CreativeWork` is used for an existing project case-study record; generic pages use `WebPage` or `CollectionPage`; the homepage additionally exposes the portfolio owner as a `Person` and the portfolio as a `WebSite`.

## Validation

```powershell
npm run seo:inventory
npm run seo:apply
npm run check
```

`npm run check` validates route metadata, canonical and hreflang targets, JSON-LD syntax, lang/dir, main/skip/navigation semantics, Work controls, robots, sitemap, Sprint 1 image delivery, Sprint 2 runtime invariants, and Sprint 3 Work behavior. `npm run test:seo:browser` reuses Chrome headless for representative EN/AR routes. It does not claim Lighthouse, WCAG certification, contrast ratios, or screen-reader conformance.

## Adding a New Page

1. Add the real static route and its localized counterpart only when the content exists.
2. Preserve a meaningful h1, visible introductory copy, semantic main content, and image alt treatment.
3. Run `npm run seo:inventory` and inspect the route's EN/AR mapping.
4. Run `npm run seo:apply` to derive metadata, canonical, hreflang, JSON-LD, skip navigation, and menu semantics.
5. Run `npm run check` and the browser check before committing.

Do not hand-edit generated metadata across route files or add a sitemap URL for a route that does not exist.

## Adding a New Project

1. Add the record to `data/projects.json` following [project-data-model.md](project-data-model.md), including both locales only when both copies exist.
2. Create and validate the real EN/AR case-study routes; do not invent a fallback route.
3. Preserve the existing live URL and use `liveUrl: null` when no live site exists.
4. Run `npm run work:data`, `npm run filter:work`, `npm run seo:apply`, and `npm run check`.
5. Confirm the project appears in the Work no-JS links, sitemap only through its real route, and localized metadata uses the canonical project copy.

Do not introduce a new framework or client-side metadata runtime for a project addition.
