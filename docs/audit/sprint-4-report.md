# Sprint 4 Report — SEO & Accessibility Hardening

Date: 2026-08-02  
Status: COMPLETE

## Before

The before-state inventory is recorded in [seo-accessibility-before.md](seo-accessibility-before.md), generated before production HTML changes. The export contained 186 route index files, of which 184 were indexable and two utility error routes were noindex.

| Baseline signal | Before |
| --- | ---: |
| Indexable routes | 184 |
| Routes with canonical links | 0 |
| Routes with hreflang | 0 |
| Routes with JSON-LD | 0 |
| Main-content skip links | 0 |
| Missing image alt attributes | 0 |
| Empty modal-placeholder alts | 6 |
| Indexable routes with one main landmark | 184 |
| h1-to-h3 heading jumps | 4 routes |
| Public sitemap/robots assets | absent |

Inner routes reused homepage-style title, description, and og:url metadata. The before inventory did not assign fabricated contrast ratios, Lighthouse scores, WCAG percentages, or browser CWV values.

## SEO Changes

- Added deterministic route inventory at [routes.json](../../data/routes.json), covering all 186 exported routes, locale relationships, page types, metadata, and accessibility signals.
- Applied unique route-specific titles to all 184 indexable routes.
- Applied visible-content or canonical-project descriptions without inventing project claims.
- Added 184 correct trailing-slash canonical URLs.
- Added reciprocal EN/AR hreflang and x-default relationships for all 184 paired indexable routes; no fake routes were created.
- Corrected og:title, og:description, og:url, og:image, og:type, and Twitter card metadata per route.
- Added 184 server-rendered JSON-LD blocks: WebPage/CollectionPage, accurate homepage Person/WebSite, and CreativeWork only for canonical project records.
- Generated [robots.txt](../../robots.txt) with public root access, utility-route exclusions, and the absolute sitemap URL.
- Generated [sitemap.xml](../../sitemap.xml) with 184 unique existing canonical URLs, no query/filter states, and no fabricated lastmod values.

Representative HTML byte deltas from the Sprint 3 commit:

| Route | Before | After | Delta |
| --- | ---: | ---: | ---: |
| `/` | 113,413 | 114,612 | +1,199 |
| `/work/` | 55,818 | 56,446 | +628 |
| `/about/` | 50,288 | 51,759 | +1,471 |
| `/services/` | 102,939 | 104,468 | +1,529 |
| `/ar/` | 127,744 | 129,057 | +1,313 |
| `/ar/work/` | 59,450 | 60,165 | +715 |

No client-side SEO library or new runtime dependency was added.

## Accessibility Changes

- Added a native, keyboard-reachable skip link to `main#main-content` on all 184 indexable routes, localized for Arabic.
- Added labelled primary navigation and connected the existing mobile menu button to its dialog with `aria-controls="mobile-navigation"`.
- Preserved native button semantics for Work filters and Load More; Sprint 3 behavior remains unchanged.
- Added shared `:focus-visible` outlines for links, buttons, and form controls without disabling browser outlines.
- Added a focus-only skip-link style and reduced-motion transition handling in `portfolio-effects.css`.
- Corrected Lab and Backend index card heading levels from h3 to h2, eliminating four h1-to-h3 jumps while preserving visual classes.
- Verified every image has an alt attribute. The six existing empty alts are modal placeholders with no source until a viewer opens; no fabricated replacement text was added.
- Preserved `lang="en"`, `lang="ar" dir="rtl"`, Sprint 1 lazy/async image delivery, Sprint 2 reduced-motion behavior, and Sprint 3 Work controls.
- Confirmed no functional forms exist in the current static export, so form remediation was not applicable.

## Automated Validation

Passed:

- `npm run check`
- `git diff --check`
- `node scripts/check-seo-accessibility.mjs`: 184 indexable routes, metadata, canonical, hreflang, JSON-LD, robots, sitemap, navigation, main, skip, image, and heading invariants
- `node scripts/test-seo-browser.mjs`: Chrome headless validation of 12 EN/AR representative routes
- Existing `npm run test:work`: Work initial batch, filters, `aria-pressed`, Load More, and duplicate safety
- Existing static/image/runtime checks: 187 HTML files, 1,474 payload files, Sprint 1 image delivery, Sprint 2 runtime invariants

The browser harness verified `/`, `/work/`, `/ar/`, `/ar/work/`, About, Services, Developer Lab, Backend Systems, and representative EN/AR case studies. It checked title, canonical, language/direction, main landmark, skip link, JSON-LD, and Work initial controls.

Contrast measurement, screen-reader output, full mobile-menu focus restoration, Lighthouse, and WCAG certification were not claimed because they were not measured by the available harness.

## Changed Files

- `scripts/inventory-seo-accessibility.mjs`
- `scripts/apply-seo-accessibility.mjs`
- `scripts/check-seo-accessibility.mjs`
- `scripts/test-seo-browser.mjs`
- `scripts/generate-seo-assets.mjs`
- `data/routes.json`
- `robots.txt`
- `sitemap.xml`
- `scripts/portfolio-effects.css`
- 186 exported route HTML files
- `package.json`
- `docs/audit/seo-accessibility-before.md`
- `docs/architecture/seo-accessibility-strategy.md`

## Regression Testing

All existing public route checks passed. English and Arabic Work routes retain 12 initial cards, progressive loading, filtering, and no-JS links. Case-study links, optimized thumbnails, runtime policy, reduced motion, and the absence of broad MutationObserver/DOM scanning regressions were preserved.

## Remaining Risks

- This remains a static-export transformation; future route/content changes must rerun the inventory and SEO application commands.
- The browser harness does not replace real screen-reader, cross-browser, or visual contrast testing.
- No reliable source timestamp exists, so sitemap lastmod is intentionally omitted.
- The static export has no functional form to audit; any future form needs a separate labelled/error-state review.

## Sprint 5 Recommendation

Do not begin Sprint 5 in this change. The next backlog should cover architecture hardening, CI/CD quality gates, reproducible export validation, optional visual/accessibility automation, final link/metadata audit, release-readiness review, and a controlled production release process. No GitHub Actions overhaul, deployment restructuring, framework reconstruction, or main-branch merge was performed.
