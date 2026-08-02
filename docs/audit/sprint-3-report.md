# Sprint 3 Report — Work Page Architecture & Project Data Model

Date: 2026-08-02  
Status: COMPLETE

## Scope

Sprint 3 consolidated the Work archive around one canonical EN/AR project dataset, replaced the heterogeneous card output with a deterministic contract, reduced the initial HTML archive, and added accessible progressive filtering. Sprint 4 was not started.

## Before / after structural metrics

| Metric | Before Sprint 3 | After Sprint 3 |
| --- | ---: | ---: |
| Canonical project records | 0 | 43 |
| Category counts | 13 / 21 / 7 / 2 in static HTML | 13 / 21 / 7 / 2 from canonical data |
| Initial active cards, EN / AR | 43 / 43 | 12 / 12 |
| No-JS case-study links, EN / AR | not separately exposed | 43 / 43 |
| Work HTML bytes, EN | 148,238 | 55,818 |
| Work HTML bytes, AR | 155,143 | 59,464 |
| Work-specific JS bytes | 0 | 8,900 |
| Localized case-study routes | 43 / locale | 43 / locale, validated |
| Live URLs | 41 | 41, validated as HTTP(S) |
| Missing live URL | 2 | 2, classified as `case-study` |
| Generated thumbnail pilot records | 5 / locale | 5 / locale, preserved |

The HTML reduction is 92,420 bytes in English and 95,679 bytes in Arabic. The external `data/projects.json` is 61,057 bytes and is fetched only by the Work controller; the initial HTML remains statically crawlable.

## Architecture outcome

`data/projects.json` is the source of truth. It contains schema version 1, structured categories, shared EN/AR copy, thumbnail metadata, case-study routes, live URLs, availability classification, featured flags, and status. The resulting data has no duplicate IDs, slugs, or case-study paths.

The new renderer in `scripts/render-work-archive.mjs` uses `scripts/work-card-template.mjs` to produce the same semantic card contract for both locales. It also updates the Work Flight payload roots to the same canonical 12-card initial slice. The old hardcoded filter map was removed from `scripts/add-work-filters.mjs`; that path remains only as a compatibility entry point.

The legacy `scripts/import-workspace-projects.mjs` still contains workspace-import records for case-study generation. It is not invoked by the Work archive renderer and is explicitly outside the canonical archive data path; removing or reconciling that historical importer is deferred until its generation workflow is revisited.

## Link and image preservation

All 43 existing English and 43 Arabic case-study routes remain present and are validated against the canonical slug contract. The 41 existing live URLs are preserved with safe external-link attributes. The two projects without live URLs remain archive/case-study destinations rather than receiving invented fallback URLs. No `live-only` or `archive-only` records exist in the current set.

The Sprint 1 image pipeline is reused as-is. The five pilot records retain AVIF/WebP `srcset` variants and manifest-derived metadata; all records now carry original thumbnail dimensions and aspect-ratio metadata. No mass image conversion or asset renaming was performed.

## Interaction and accessibility outcome

`scripts/work-archive.js` is a scoped, framework-free controller. It fetches the canonical dataset, filters by structured category, resets to a 12-card batch, and reveals cards in 12-card increments without duplicates. Native buttons expose `aria-pressed`; Load More exposes `aria-controls`; filter results and empty states use localized live status text. The controller has no `MutationObserver`, no document-wide scan, and no URL/history state.

The static pages contain the first 12 cards. A localized `<noscript>` index exposes all 43 case-study links per locale. This preserves useful no-JS navigation and crawlability while accepting that the full card grid requires JavaScript.

## Homepage and category-route decisions

Homepage featured cards were not force-rewritten in this sprint. Their existing order is preserved, while the canonical `featured` flag records the relationship for a future shared derivation. Category landing pages and route-level category SEO were evaluated and deferred to Sprint 4 because they would add route, metadata, and maintenance scope beyond this archive refactor.

## Verification

Passed:

- `npm run work:data`
- `node --check scripts/work-archive.js`
- Chrome headless static execution: 12 active cards, 5 filters, 43 no-JS links, and the localized initial status after data fetch
- `npm run test:work`: initial batch, filter reset, `aria-pressed`, progressive reveal, Load More completion, and duplicate safety
- `npm run check`: static routes, image delivery, runtime invariants, Work archive structure, and interaction harness
- `git diff --check`

## Deferred work

Sprint 4 remains TODO. Candidate follow-up items are category-route/SEO evaluation, further shared homepage derivation, and any remaining accessibility or content-quality refinements identified by a later audit.
