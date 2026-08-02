# Script Inventory

This inventory covers every file under `scripts/` at Sprint 5 finalization. “Idempotent” means a supported rerun produces the same committed output. One-time migration and capture tools are intentionally not treated as release-pipeline inputs. No legacy script was deleted because historical project repair and capture provenance still need to remain recoverable.

## Classification rules

- **REQUIRED**: part of the supported static output, runtime, or validation path.
- **REQUIRED BUT NEEDS HARDENING**: useful for controlled content/image maintenance, but not safe to run blindly as part of every release.
- **DEVELOPMENT ONLY**: local capture, migration, audit, server, or asset-authoring utility.
- **LEGACY**: historical repair or project-specific migration retained for provenance.
- **DUPLICATE**: responsibility superseded by a current canonical tool.
- **UNKNOWN**: no current release owner has been established.

## Complete inventory

| Script | Purpose and inputs/outputs | HTML mutation | Determinism/idempotency | Classification |
| --- | --- | --- | --- | --- |
| `add-backend-buttons.mjs` | Historical Backend CTA insertion over exported pages | Yes | Project-specific; not in verify | LEGACY |
| `add-portfolio-effects.mjs` | Adds the portfolio effects CSS/JS references to static HTML | Yes | Marker-aware and rerunnable for the current export | REQUIRED BUT NEEDS HARDENING |
| `add-work-filters.mjs` | Earlier Work filter insertion approach | Yes | Superseded by Work renderer | DUPLICATE |
| `apply-pilot-thumbnails.mjs` | Applies optimized thumbnail variants to pilot project markup/payloads | Yes | Replacement-aware for current pilot set | REQUIRED BUT NEEDS HARDENING |
| `apply-seo-accessibility.mjs` | Emits route-specific metadata, hreflang, JSON-LD, landmarks and headings | Yes | Idempotent; covered by `test:idempotency` | REQUIRED |
| `armadillo-studio-screenshots.js` | Captures Armadillo visual screenshots through a browser | No, writes captures | Environment-dependent | DEVELOPMENT ONLY |
| `audit-project-assets.mjs` | Audits project references and writes audit JSON/Markdown | No production HTML | Deterministic for a fixed export | DEVELOPMENT ONLY |
| `capture-afaaq-pages.mjs` | Captures Afaaq pages/assets from a local/browser session | May write page assets | Environment-dependent | DEVELOPMENT ONLY |
| `capture-arabic-window-pages.mjs` | Captures Arabic Window pages and screenshots | May write page assets | Environment-dependent | DEVELOPMENT ONLY |
| `capture-armadillo-pages.mjs` | Captures Armadillo pages | May write page assets | Environment-dependent | DEVELOPMENT ONLY |
| `capture-kuwait-arc-pages.mjs` | Captures Kuwait Arc pages and screenshots | May write page assets | Environment-dependent | DEVELOPMENT ONLY |
| `capture-site-pages.mjs` | General site page capture utility | May write captures | Environment-dependent | DEVELOPMENT ONLY |
| `capture-torathyat-pages.mjs` | Captures Torathyat pages | May write page assets | Environment-dependent | DEVELOPMENT ONLY |
| `case-study-screenshots.js` | Runtime/helper capture script for case-study screenshots | No production route ownership | Browser-dependent | DEVELOPMENT ONLY |
| `check-card.js` | Small historical Work card smoke check | No | Deterministic but narrow | DEVELOPMENT ONLY |
| `check-idempotency.mjs` | Reruns Work, SEO, route inventory and sitemap generators and compares hashes | Indirectly exercises supported mutators | Determinism gate; must remain byte-stable | REQUIRED |
| `check-image-delivery.mjs` | Validates responsive image markup, manifests, payloads and pilot budgets | No | Deterministic read-only check | REQUIRED |
| `check-performance-budgets.mjs` | Enforces practical runtime/data/Work artifact size budgets | No | Deterministic read-only check | REQUIRED |
| `check-runtime-invariants.mjs` | Checks effect inclusion, lifecycle, DOM scope, CSS and reduced-motion policy | No | Deterministic read-only check | REQUIRED |
| `check-security-hygiene.mjs` | Checks production text for local paths, loopback URLs, secrets, encoding damage, javascript URLs and unsafe external targets | No | Deterministic read-only check | REQUIRED |
| `check-seo-accessibility.mjs` | Validates 184 indexable routes, metadata, semantics, hreflang, JSON-LD, sitemap and robots | No | Deterministic read-only check | REQUIRED |
| `check-static.mjs` | Resolves local `href`/`src` references across static HTML | No | Deterministic read-only check | REQUIRED |
| `check-work-archive.mjs` | Validates canonical project cards, initial 12-card shell and no-JS routes | No | Deterministic read-only check | REQUIRED |
| `create-afaaq-case-study.mjs` | Creates/repairs Afaaq case-study export content | Yes | Content migration; review output | DEVELOPMENT ONLY |
| `create-oryxbag-case-study.mjs` | Creates Oryxbag case-study export content | Yes | Content migration; review output | DEVELOPMENT ONLY |
| `create-torathyat-armadillo-case-studies.mjs` | Creates selected case-study export content | Yes | Content migration; review output | DEVELOPMENT ONLY |
| `extract-work-project-data.mjs` | Extracts project records from existing Work markup | No or data output | Migration snapshot, not release input | DEVELOPMENT ONLY |
| `fix-ashhalan.mjs` | Historical Ashhalan HTML repair | Yes | Project-specific repair | LEGACY |
| `fix-export-paths.mjs` | Repairs static-export paths after an export | Yes | Broad mutation; review output | LEGACY |
| `generate-project-thumbnails.mjs` | Generates optimized project thumbnails/manifests using image tooling | No or image metadata | Deterministic only with the same image toolchain | REQUIRED BUT NEEDS HARDENING |
| `generate-seo-assets.mjs` | Generates committed `sitemap.xml` and `robots.txt` from route data | No HTML | Idempotent; covered by `test:idempotency` | REQUIRED |
| `import-workspace-projects.mjs` | Imports workspace project folders into the export/data model | Yes and copies media | Content/import migration; review output | DEVELOPMENT ONLY |
| `inventory-seo-accessibility.mjs` | Inventories static routes and writes `data/routes.json` | No HTML | Idempotent for fixed HTML; covered by `test:idempotency` | REQUIRED |
| `kuwait-arc-screenshots.js` | Captures Kuwait Arc screenshots | No, writes captures | Environment-dependent | DEVELOPMENT ONLY |
| `normalize-image-delivery.mjs` | Normalizes responsive image markup and payload delivery | Yes | Rerunnable for current patterns; review output | REQUIRED BUT NEEDS HARDENING |
| `portfolio-effects.css` | Production progressive-enhancement styles | No | Static runtime asset | REQUIRED |
| `portfolio-effects.js` | Production progressive-enhancement runtime | No | Static runtime asset; lifecycle-gated | REQUIRED |
| `render-work-archive.mjs` | Renders EN/AR initial Work cards and Flight payload sidecars from `data/projects.json` | Yes | Idempotent; covered by `test:idempotency` | REQUIRED |
| `serve.mjs` | Dependency-free local static server for browser checks | No | Development utility | DEVELOPMENT ONLY |
| `test-seo-browser.mjs` | Runs representative EN/AR Chrome/Edge headless route checks and catches runtime-error patterns | No | Read-only, environment-dependent | REQUIRED |
| `test-work-archive.mjs` | Runs dependency-free fake-DOM Work filter/load-more interaction tests | No | Deterministic read-only test | REQUIRED |
| `torathyat-screenshots.js` | Captures Torathyat screenshots | No, writes captures | Environment-dependent | DEVELOPMENT ONLY |
| `upgrade-arabic-window-case-study.mjs` | Historical Arabic Window case-study upgrade | Yes | Project-specific migration | LEGACY |
| `upgrade-ashhalan-car-rental.mjs` | Historical Ashhalan Car Rental case-study/listing upgrade | Yes | Project-specific migration | LEGACY |
| `validate-project-data.mjs` | Validates canonical project schema, routes, assets, URLs and classifications | No | Deterministic read-only check | REQUIRED |
| `work-archive.js` | Production Work progressive-enhancement client runtime | No | Static runtime asset | REQUIRED |
| `work-card-template.mjs` | Shared renderer for localized Work card markup | No by itself | Pure template used by renderer | REQUIRED |

## Ownership decision

The supported pipeline is intentionally narrow: `validate-project-data`, `render-work-archive`, `inventory-seo-accessibility`, `apply-seo-accessibility`, `generate-seo-assets`, the image/runtime checks, static/Work/SEO/security/budget checks, the fake-DOM test, and the browser test. Capture and historical repair scripts remain available but must be run as explicit, reviewed maintenance operations. The current package manifest and this inventory are the ownership boundary; a new mutation script must either be added to `npm run verify` or be documented as development/legacy before use.
