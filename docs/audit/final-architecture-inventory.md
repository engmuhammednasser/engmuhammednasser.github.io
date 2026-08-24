# Final Architecture Inventory

Status: historical Sprint 5 final inventory for
`refactor/performance-clean-architecture` before PR #1 merged. Its 43-project and
184-indexable-route counts are point-in-time evidence, not the current production
inventory. See `PORTFOLIO_ENGINEERING_HANDOFF.md` for current state.

This is the architecture that exists in the repository at release-readiness review. It describes the committed static export and the supported maintenance pipeline; it does not describe a hypothetical rebuild.

## System map

```text
data/projects.json (43 canonical projects)
        |
        +--> validate-project-data --------------------+
        |                                               |
        +--> render-work-archive --> Work HTML/payload  |
        |                         --> work-archive.js   |
        |                                               |
+--> static route inventory --> data/routes.json -------+--> SEO/accessibility
                                                        |    HTML metadata
                                                        |    hreflang/JSON-LD
                                                        |    sitemap.xml/robots.txt
                                                        |
static images/manifests --> image delivery checks -------+
runtime assets ----------> runtime invariants -----------+
                                                        |
                              npm run check ------------+--> static + browser gates
                              npm run verify ----------------> check + idempotency + diff check
```

The export is served as files. There is no runtime API, database, build server, client-side project fetch, or deployment-time data lookup.

## Canonical sources and generated artifacts

| Area | Source of truth | Materialized output | Owner/check |
| --- | --- | --- | --- |
| Projects | `data/projects.json` | Work cards, localized case-study links, project metadata | `validate-project-data.mjs`, `render-work-archive.mjs` |
| Routes | Static `index.html` files | `data/routes.json` | `inventory-seo-accessibility.mjs` |
| Work archive | Project data plus current Work shells | `work/index.html`, `ar/work/index.html`, Work payload sidecars | `render-work-archive.mjs`, `check-work-archive.mjs`, `test-work-archive.mjs` |
| Images | Committed project media and optimized manifests | `projects/**/optimized/*`, responsive image markup | `normalize-image-delivery.mjs`, `check-image-delivery.mjs` |
| SEO/accessibility | Route inventory plus visible page content | `<head>` metadata, landmarks, skip links, headings, JSON-LD | `apply-seo-accessibility.mjs`, `check-seo-accessibility.mjs` |
| Runtime effects | `scripts/portfolio-effects.js` and `.css` | Static script/style references in HTML | `check-runtime-invariants.mjs` |
| Crawl discovery | `data/routes.json` | `sitemap.xml`, `robots.txt` | `generate-seo-assets.mjs` |

Generated static artifacts are committed because GitHub Pages serves the repository directly. The generators are reproducible from the committed export and are covered by the idempotency gate.

## Route inventory

`data/routes.json` contains 186 route records: 184 indexable and two English utility-error records. The indexable set contains 92 English and 92 Arabic routes. The inventory includes 43 localized case-study records per locale, Work indexes, Backend indexes and case studies, top-level pages, and Lab/plugin pages.

The final SEO gate verifies all 184 indexable records, canonical URLs, reciprocal English/Arabic hreflang, `x-default`, route-specific Open Graph URLs, JSON-LD, language direction, sitemap membership, robots policy, and local route existence. The static export contains 187 HTML files when the fallback/error files outside the route index are included.

## Runtime boundaries

- The initial Work archive is server/static HTML with 12 cards per locale.
- `scripts/work-archive.js` progressively reveals the remaining 31 cards, applies category filters, maintains `aria-pressed`, and preserves no-JavaScript links.
- Portfolio effects are progressive enhancement. They are gated by reduced-motion preference, device/input conditions, lifecycle cleanup, and bounded DOM scope.
- SEO and accessibility are emitted into static HTML. JavaScript is not required for route discovery, language switching, or case-study navigation.
- External project URLs are data values and are structurally restricted to `http:` or `https:`.

## Validation flow

`npm run check` is the supported non-release validation command. It validates project data, local HTML references, image delivery, runtime invariants, Work archive shape and interactions, SEO/accessibility across 184 indexable routes, production-output security/hygiene, practical artifact budgets, and representative Chrome routes.

`npm run verify` is the supported release/CI command. It runs `check`, reruns the supported Work/SEO/route/sitemap generators to prove idempotency, then runs `git diff --check`.

The full script ownership and legacy/development classification is recorded in [script-inventory.md](script-inventory.md). Local setup, content updates, browser checks, and release procedure are recorded in [engineering-workflow.md](../architecture/engineering-workflow.md).

## Architectural constraints and deferred work

- This remains a static-export repository; no broad framework migration is part of Sprint 5.
- `package-lock.json` is committed and lockfile v3 contains no dependencies. CI uses `npm ci` with scripts disabled for reproducible manifest installation.
- Screenshot/capture and case-study migration utilities remain available for historical content work, but they are not part of the supported verify pipeline.
- Real-user or lab Core Web Vitals, automated color-contrast results, and a WCAG conformance claim are intentionally deferred; the repository reports structural and practical budget checks only.
