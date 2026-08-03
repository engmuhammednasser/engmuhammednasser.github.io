# Mariam Fathy Shop project addition

## Classification

- Project: `mariam-fathy-shop`
- Category: `ecommerce`
- Featured: `false`
- Availability: `case-study+live`
- Status: `published`
- Placement: inserted after the existing Techmart e-commerce entry in the canonical project order.
- Live URL: `https://mariamfathyshop.com/`
- Case-study routes: `/work/mariam-fathy-shop/` and `/ar/work/mariam-fathy-shop/`

The project is kept out of the featured set because this addition is a new portfolio entry and the request did not establish a featured placement. It is visible in both Work archives, in the e-commerce filter, in the no-JavaScript list, and through its localized case-study routes.

## Content

The entry uses the canonical `data/projects.json` schema and includes English and Arabic titles, descriptions, eyebrows, case-study paths, technologies, thumbnail variants, live URL, availability, and publication status.

The case study describes the Laravel storefront, catalog and collection discovery, product presentation, cart and checkout journey, and the native MoonShine workspace for catalog, media, products, and orders. It does not add unsupported traffic, conversion, performance, revenue, or delivery metrics.

The implementation content was checked against the available local Laravel application copy and the supplied project brief. The public storefront could not be independently crawled during this work because the live domain returned a Cloudflare JavaScript/cookie verification challenge to both direct HTTP and a fresh headless Chrome session. No live dashboard was accessed.

## Screenshots

The case study uses five local assets: one public-facing storefront representative render and four native dashboard screens.

- `storefront-home.png`: local representative storefront render. It is not presented as a verified production capture while the public domain is behind the Cloudflare challenge.
- `dashboard-overview.png`: native MoonShine dashboard overview with fictional local demo data.
- `orders-index.png`: native order list with `DEMO-1001` and fictional demo customer data.
- `order-detail.png`: native order detail with fictional demo contact, address, order, and request metadata.
- `products-index.png`: native product catalog with `DEMO-0001` through `DEMO-0005` products.

Dashboard screenshot provenance and privacy checks:

- Screens were captured from a clean local Laravel copy using a fresh local SQLite database.
- The dashboard user, customer, products, order, address, IP, and user-agent values are fictional demo values.
- No production dashboard, production database, customer media, credentials, session data, API tokens, or private files were inspected or used.
- The screenshot labels identify dashboard images as local demo screens and the storefront image as a local representative render.

## Assets

The cover is stored at `/projects/mariam-fathy-shop/cover.png`; the gallery assets are stored beside it. The Work card uses the generated optimized variants under `/projects/mariam-fathy-shop/optimized/`:

- `thumb-480.avif`
- `thumb-480.webp`
- `thumb-800.avif`
- `thumb-800.webp`

All four generated thumbnail files are below the repository's 150 KB project-thumbnail budget. `npm run images:thumbnails -- --projects mariam-fathy-shop` generated the manifest and variants. No local filesystem paths, local environment files, credentials, or unrelated binary/generated files are part of this addition.

## Validation

Completed checks:

- `npm ci` — passed; no package vulnerabilities reported.
- `npm run work:data` — passed; 44 canonical projects and 88 localized case-study routes.
- `npm run filter:work` — passed; 12 initial cards per locale and all 44 no-JavaScript project routes per locale.
- `npm run seo:inventory`, `npm run seo:apply`, and `npm run seo:assets` — passed; both new routes are indexable with canonical, reciprocal hreflang, sitemap, robots, and JSON-LD output.
- `npm run verify` — passed, including static references, image delivery, runtime invariants, Work filtering/Load More behavior, accessibility/SEO checks, security hygiene, performance budgets, Chrome browser checks, mobile navigation, idempotency, and `git diff --check`.
- Targeted local route checks — HTTP 200 for both localized case-study routes, both Work archives, both optimized thumbnail variants, `sitemap.xml`, and `robots.txt`.
- Targeted HTML checks — EN/AR reciprocal links, localized Arabic contact CTA, JSON-LD parsing, screenshot runtime inclusion, and removal of inherited Techmart payload markers.

## Risks / notes

- The live storefront is currently protected by a Cloudflare verification challenge, so production storefront navigation and production screenshot capture remain content-review items rather than verified evidence in this change.
- The dashboard gallery is intentionally local-only. It must not be replaced with production dashboard captures unless the owner supplies an approved, sanitized capture process.
- The local Laravel source copy lacked the optional GD extension needed by its original image-fixture helper; that helper was not used to create dashboard evidence and no production data was touched.
- The accepted repository risks remain separate: incomplete or unavailable original Next.js source/build configuration, historical repository/media size, and production Core Web Vitals not yet measured.
