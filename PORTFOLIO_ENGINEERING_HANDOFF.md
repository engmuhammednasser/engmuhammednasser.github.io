# Muhammed Nasser Portfolio — Engineering Handoff

Status: production handoff after Sprints 0–5 and merged PRs #1–#8

Authoritative production baseline: `main` at `5b4560cacf1d7965058ec7a93fa610f04362f38d`

Production: <https://engmuhammednasser.github.io/>
Last repository audit: 2026-08-03

This document is the current engineering handoff. The Sprint reports under
`docs/audit/` remain evidence of what was measured at the time; their old counts
and branch names are historical snapshots, not the current production inventory.

For day-to-day maintenance, use `PORTFOLIO_OPERATIONS_GUIDE.md`. For a new project,
start with `NEW_PROJECT_INTAKE_TEMPLATE.md`.

## Executive handoff

The repository is a checked-in static export deployed by GitHub Pages from the
root of `main`. It still contains compiled Next.js output, but it does **not**
contain the original Next.js application source, `next.config.*`, or a reproducible
framework build. Consequently, the tracked HTML, route payloads, assets, canonical
data, and repository-owned generators together form the maintainable production
system.

The engineering program did not rebuild the site. It hardened the existing export:

- Work metadata and ordering are centralized in `data/projects.json`.
- The Work archive is rendered deterministically with 12 initial cards, filters,
  Load More, localized no-JavaScript links, and a single prioritized first image.
- SEO and accessibility metadata are generated and validated against a route
  inventory.
- Decorative effects have explicit capability and lifecycle gates and do not use a
  broad `MutationObserver` or document-wide class scans.
- A native mobile-navigation controller remains functional even when the compiled
  React hydration path throws its known framework exception.
- Image delivery uses bounded optimized derivatives while retaining originals for
  full-view interactions where required.
- Local and pull-request quality gates cover static references, data integrity,
  image policy, runtime invariants, interactions, SEO/accessibility, security,
  budgets, browser behavior, and generator idempotency.

## Current architecture

```text
data/projects.json
        |
        +--> scripts/render-work-archive.mjs
        |       +--> work/index.html + Work payload files
        |       +--> ar/work/index.html + Work payload files
        |       `--> scripts/work-archive.js enhances filter/Load More
        |
projects/<slug>/ originals + optimized derivatives + manifests
        `--> referenced by Work cards and case-study HTML

all static index.html routes
        |
        +--> scripts/inventory-seo-accessibility.mjs --> data/routes.json
        +--> scripts/apply-seo-accessibility.mjs      --> route metadata/semantics
        +--> scripts/generate-seo-assets.mjs          --> sitemap.xml + robots.txt
        `--> scripts/apply-mobile-navigation.mjs      --> stable native menu hooks

scripts/portfolio-effects.{js,css} --> shared guarded decorative runtime
scripts/mobile-navigation.js       --> native mobile-menu fallback
GitHub Pages                       --> serves repository root from main
```

### Deployment model

GitHub Pages is configured as a legacy branch deployment from `main` at `/` with
HTTPS enforced. The `.nojekyll` file allows the `_next` directory to be served.
The `Portfolio quality` workflow runs on pull requests; it also has narrow historic
push triggers for the original refactor branches. A normal direct push to `main`
must not be treated as equivalent to PR validation.

### Source-of-truth boundaries

| Concern | Current source of truth | Generated or derived output | Important boundary |
| --- | --- | --- | --- |
| Work project metadata, order, category, availability, thumbnails, localized routes | `data/projects.json` | EN/AR Work markup and payload slices | Do not hand-edit generated Work cards. |
| Work markup | `scripts/work-card-template.mjs` and `scripts/render-work-archive.mjs` | Six EN/AR Work HTML/payload files | First 12 are active; all localized case links remain in `<noscript>`. |
| Work interaction | `scripts/work-archive.js` | Runtime filter and 12-item Load More batches | No duplicate cards; filtering resets the visible batch. |
| Route existence | Tracked static route files | `data/routes.json` inventory | `data/routes.json` records routes; it does not create them. |
| SEO/accessibility policy | SEO generator scripts plus `data/routes.json` and project data | Per-route metadata/semantics, `sitemap.xml`, `robots.txt` | Inventory new routes before applying SEO. |
| Case-study body content | The route-specific generator when one exists; otherwise the reviewed EN/AR static HTML pair | Deployed case-study pages | There is no universal case-study generator. Do not assume a legacy script owns every route. |
| Generic Work thumbnails | Original media, `scripts/generate-project-thumbnails.mjs`, and `projects/<slug>/optimized/manifest.json` | 480/800 AVIF and WebP variants | Generate only selected projects unless a full regeneration is intentional. |
| Mariam case-study media | `data/mariam-fathy-gallery.json`, `scripts/generate-mariam-fathy-media.mjs`, and its media manifest | Six hero variants and 41 lazy WebP previews | This is a project-specific model, not the generic default. |
| Shared effects | `scripts/portfolio-effects.js` and `.css` | One marked script and stylesheet per HTML file | Preserve capability, visibility, reduced-motion, idle, and DOM-scope gates. |
| Mobile navigation | Stable HTML hooks plus `scripts/mobile-navigation.js` | Native fallback on eligible production pages | Preserve EN/LTR and AR/RTL behavior and update the eligible-page assertion when routes are added. |
| Compiled framework assets | Tracked `_next/` files referenced by static pages | CSS, fonts, and vendor runtime | Do not edit minified vendor chunks as source code. |

## Current production inventory

The values below were recomputed from the tracked files at the authoritative SHA:

| Inventory | Current value |
| --- | ---: |
| Canonical Work projects | 44 |
| Work categories | 4 content categories plus `all` |
| E-Commerce / Corporate / Services / Platforms | 14 / 21 / 7 / 2 |
| Featured projects | 5 |
| Projects with live URLs / case-study only | 42 / 2 |
| Initial active Work cards | 12 per locale |
| Route inventory records | 188 |
| Indexable / noindex utility routes | 186 / 2 |
| Indexable bilingual pairs | 93 |
| Static HTML files | 189 |
| Exported `.txt` payload files | 1,474 |

The HTML total is one higher than the route inventory because the root-level
`404.html` is not an `index.html` route record. The two noindex utility routes are
`/404/` and `/_not-found/`.

Mariam Fathy Shop is project number 6 in canonical Work order, immediately after
Techmart. It remains `ecommerce`, `featured: false`, and uses the English storefront
homepage (`desktop/en/06-home.png`) as the primary image source.

## Sprint history

### Sprint 0 — Forensic baseline and architecture decision

Sprint 0 established what the repository actually contained before changes:

- a generated Next.js static export without the original framework source/build;
- 187 HTML documents and 43 Work cards at that historical point;
- GitHub-reported repository storage of 640,384 KiB and an expanded checkout of
  723,567,760 bytes, including 683,022,157 bytes under `projects/` at that
  historical point;
- distributed Work metadata and all cards present in the initial DOM;
- generic inner-page metadata, no canonical/hreflang strategy, no sitemap/robots;
- broad runtime scanning and unnecessary decorative work.

The decision was to preserve the deployable export, introduce repository-owned data
and generators, and validate their output. Reconstructing or inventing the missing
Next.js application was explicitly out of scope. Evidence is in
`docs/architecture/current-state.md`, `docs/architecture/target-state.md`, and
`docs/audit/sprint-0-report.md`.

### Sprint 1 — Image delivery pilot

Sprint 1 removed four stale Afaaq preloads, normalized loading/decoding policy, and
introduced the selective thumbnail pipeline. Five pilot Work cards received 480 and
800 AVIF/WebP derivatives. Their combined 800px WebP fallback bytes fell from
5,321,992 to 359,082 (a measured 93.3% reduction) while originals were retained.
The image-delivery validator became a release gate. See
`docs/audit/sprint-1-report.md`.

### Sprint 2 — Runtime and effects hardening

Sprint 2 replaced broad inference with bounded, explicit runtime behavior. It:

- removed the splash cursor;
- removed the document-level `MutationObserver` and broad descendant class scans;
- prevented permanent `will-change` promotion;
- gated WebGL by viewport, pointer/hover, reduced motion, capability, visibility,
  and intersection state;
- deferred decorative startup through idle scheduling with a fallback;
- stopped/cancelled work when hidden or offscreen and retained static fallbacks.

The invariants are enforced by `scripts/check-runtime-invariants.mjs`. See
`docs/audit/sprint-2-report.md`.

### Sprint 3 — Canonical Work data and progressive archive

Sprint 3 centralized the historical 43-project set in `data/projects.json`, created
deterministic EN/AR Work rendering, and reduced the active initial archive to 12
cards. Filter controls and Load More operate in 12-item batches, reset cleanly on a
category change, maintain AR behavior, and avoid duplicates. All localized project
links remain available in `<noscript>` for direct access and crawlability. See
`docs/audit/sprint-3-report.md` and the historical design record
`docs/architecture/project-data-model.md`.

### Sprint 4 — SEO and accessibility hardening

Sprint 4 introduced route-specific titles/descriptions, self-canonicals, reciprocal
EN/AR hreflang with English `x-default`, social metadata, valid generated JSON-LD,
`sitemap.xml`, `robots.txt`, skip links, one `main#main-content`, navigation labels,
heading checks, alt checks, safe external targets, and browser smoke coverage.
Utility error routes remain noindex. The route totals in Sprint 4 reports predate
Mariam and must not be reused as current counts. See `docs/audit/final-report.md`
and `docs/architecture/seo-accessibility-strategy.md`.

### Sprint 5 — Release quality and operationalization

Sprint 5 assembled the full `npm run verify` gate, security/hygiene checks,
practical artifact budgets, browser checks, generator idempotency, CI, release and
rollback guidance, and the first full engineering handoff. It deliberately kept
the export model and existing media instead of claiming a framework rebuild or a
repository cleanup that did not occur.

## Post-Sprint pull-request history

All timestamps are UTC and all entries below were verified from GitHub PR metadata.

| PR | Merged | Merge commit | Production change and durable lesson |
| ---: | --- | --- | --- |
| #1 | 2026-08-02 18:19 | `018d4163b111900cbd99243afee42a431d1a9aef` | Merged the Sprints 0–5 engineering program. Missing framework source/build, historical media/repository size, and lack of production field CWV remained accepted risks. The current architecture starts here. |
| #2 | 2026-08-02 19:57 | `8f56c38b269263a39048946c20395ab93062e7c4` | Added the native mobile-navigation fallback after production hydration failures prevented the generated React menu from opening. Pointer, keyboard, focus, overlay, and EN/AR behavior are now tested independently. |
| #3 | 2026-08-02 23:10 | `ad58b99c9851fd0833bd9fd716682ddd773d5cea` | Prioritized only the first Work card and optimized EventGift UAE. The policy is one eager/high initial image; all remaining Work images stay lazy and unprioritized with AVIF/WebP delivery. Controlled network/browser checks passed, so the performance task stopped rather than broadening into unrelated opportunities. |
| #4 | 2026-08-03 16:14 | `1bbe9f343f7903941ed5510c5420e4fb4e156c9b` | Added the Mariam Fathy Laravel/PHP/MoonShine/Inertia/React project after Techmart, sanitized dashboard data, EN/AR case studies, 41 originals, 41 lazy previews, and optimized hero media. This raised Work from 43 to 44 projects and the route inventory from 186/184 indexable to 188/186. |
| #5 | 2026-08-03 17:04 | `9715d432182d09327408c66a8a5acb0216908921` | Restored Mariam case-study styles. Its generator had removed required `_next` CSS/font links while stripping framework assets. A 200 response is not proof that a route is visually complete; preserve required compiled styles and verify a cold direct navigation. |
| #6 | 2026-08-03 17:40 | `a9b4180471c2fe2fda4008f4c085bc2277d4f059` | Replaced the abstract Mariam Work cover with a real storefront homepage screenshot and a top-aligned crop that keeps the storefront header/navigation/hero visible. |
| #7 | 2026-08-03 18:18 | `b4b6423d980835070c2baa839e4d2e6d61a0179b` | Standardized Mariam's Work cover and case-study hero on `projects/mariam-fathy-shop/desktop/en/06-home.png`. The hero is a deterministic north/top 16:9 crop with 800/1200/1600 AVIF/WebP variants; all 41 gallery mappings remained unchanged. |
| #8 | 2026-08-03 18:52 | `5b4560cacf1d7965058ec7a93fa610f04362f38d` | Fixed Windows false positives caused by CRLF checkout plus LF-writing generators. Idempotency now normalizes CRLF to LF before hashing UTF-8 text, while semantic generated-output changes remain detectable and fail the gate. |

## Known accepted risks

These are known constraints, not automatic blockers for unrelated changes:

1. **Original Next.js source/build configuration is unavailable.** The export cannot
   be reproduced as a normal framework build from this repository.
2. **Historical repository/media size remains large.** Originals were intentionally
   retained; no destructive history rewrite or bulk media deletion was performed.
3. **Production Core Web Vitals are not yet measured with real-user data.** Local
   and synthetic checks protect delivery policy but do not claim field CWV.
4. **Known compiled hydration exceptions remain.** Representative pages can emit
   `t.reason.enqueueModel is not a function` or `Connection closed.` from the
   generated framework path. PR #2 made mobile navigation independent of that path;
   the exception itself was not repaired because the missing source prevents a safe
   framework-level fix.
5. **CI push coverage is narrow.** Pull requests run `Portfolio quality`; ordinary
   direct pushes to arbitrary branches or `main` are not comprehensively covered by
   the repository workflow. Use a PR and require its passing check.

A diff that introduces a new failure related to one of these constraints is still a
real regression. “Accepted risk” is not permission to broaden or worsen it.

## Maintenance rules

- Start every change from current `origin/main` on a focused branch.
- Treat historical Sprint documents as evidence, not live inventory.
- Change the narrowest current source of truth and regenerate only its owned output.
- Keep EN and AR route/content/metadata changes paired and verify RTL explicitly.
- Preserve project order unless a placement change is requested.
- Never optimize by deleting originals that are still full-view/lightbox targets.
- Never preload a gallery or make multiple Work thumbnails high priority.
- Never remove `_next` stylesheet/font references based only on their generated
  appearance; prove the cold route still has its intended design.
- Never edit minified `_next` chunks to implement a feature or bug fix.
- Never reintroduce a broad `MutationObserver`, full-document class scan, or
  permanent `will-change` layer.
- Never commit local filesystem paths, credentials, unsanitized client records,
  browser profiles, temporary captures, or generated audit caches.
- Run `npm ci`, `npm run verify`, and `git diff --check`; review the actual diff and
  browser-visible EN/AR result; publish through a pull request.

## Document status map

Current operational documents:

- `PORTFOLIO_ENGINEERING_HANDOFF.md` — current architecture and history.
- `PORTFOLIO_OPERATIONS_GUIDE.md` — current maintenance and release procedure.
- `NEW_PROJECT_INTAKE_TEMPLATE.md` — required project intake fields and approvals.
- `docs/operations/release-checklist.md` — concise release gate.
- `docs/operations/rollback.md` — non-destructive rollback procedure.

Historical evidence:

- `docs/audit/sprint-0-report.md` through `docs/audit/final-report.md` describe the
  Sprint 0–5 state before PR #1 merged.
- `docs/architecture/current-state.md` is the Sprint 0 baseline.
- `docs/architecture/target-state.md` is the original target proposal.
- `docs/architecture/project-data-model.md` and
  `docs/architecture/seo-accessibility-strategy.md` record the Sprint 3/4 design and
  contain counts from those dates.
- `docs/operations/pr-draft.md` is the historical PR #1 draft, not a template for a
  current release.
- Post-Sprint audit reports describe the corresponding PR and should be interpreted
  at that PR's commit.

When a current operational statement conflicts with a historical report, verify the
tracked data and scripts at current `main`, then update the current operational docs
in the same PR as the behavior change.

## Preserved Sprint 5 handoff (historical)

The original pre-merge handoff is preserved below as point-in-time evidence. Every
branch status, count, recommendation, and “current” statement inside this appendix
refers to the Sprint 5 branch before PR #1 merged. It must not override the current
sections above.

<details>
<summary>Open the original Sprint 5 handoff</summary>

# Muhammed Nasser Portfolio — Engineering Handoff & Sprint Plan

**Project:** Muhammed Nasser Portfolio  
**Repository:** `engmuhammednasser/engmuhammednasser.github.io`  
**Live Site:** `https://engmuhammednasser.github.io/`  
**Purpose:** Single source of truth for the portfolio refactor, performance, architecture, SEO, accessibility, QA, and delivery work.  
**Status:** Sprint 0, Sprint 1, Sprint 2, Sprint 3, Sprint 4, and Sprint 5 completed; **READY FOR PR REVIEW**. The branch remains separate from `main` and has not been merged.
**Last Updated:** 2026-08-02

---

# 1. Mandatory Reading

Any engineer or coding agent taking over this project must read this file completely **before making changes**.

This project is already live and functional. It is not a greenfield build.

The objective is to improve the technical implementation while preserving:

- Current visual identity
- Existing content
- English and Arabic structure
- Navigation
- Portfolio projects
- Case studies
- Public URLs
- GitHub Pages deployment
- Existing working functionality

This is **not a visual redesign** unless a change is necessary to solve a measurable performance, accessibility, correctness, or maintainability issue.

The engineering flow should be:

```text
Audit
→ Baseline
→ Architecture
→ Performance
→ Portfolio Data Model
→ SEO / Accessibility
→ QA / CI
→ Preview
→ Review
→ Merge
```

---

# 2. Current Production State

Production URL:

```text
https://engmuhammednasser.github.io/
```

Confirmed important routes include:

```text
/
 /work/
 /ar/
```

The site currently includes:

- Homepage
- Services
- Work / Project archive
- About
- Developer Lab
- Backend Systems
- Start a Project
- Arabic version
- Individual case-study/project pages

The `/work/` page currently contains approximately:

```text
43 projects
```

Categories include:

- E-Commerce
- Corporate Sites
- Services & Booking
- Platforms

The portfolio is visually polished and usable in production.

The main engineering problems are:

- asset weight
- oversized repository
- inconsistent image delivery
- unnecessary runtime work
- large Work-page DOM
- post-build HTML mutation
- maintainability
- metadata correctness
- missing technical quality gates

---

# 3. Repository State

Repository:

```text
engmuhammednasser/engmuhammednasser.github.io
```

Default branch:

```text
main
```

Proposed working branch:

```text
refactor/performance-clean-architecture
```

## Important

No refactor implementation has been intentionally applied to production yet.

An attempt to create the branch through the available GitHub integration returned:

```text
403 Resource not accessible by integration
```

The audit shell environment was also unable to resolve `github.com`, so `git clone` could not be completed there.

Therefore:

> Do not assume any implementation work is already committed.

From a normal local development environment, start with:

```bash
git clone https://github.com/engmuhammednasser/engmuhammednasser.github.io.git
cd engmuhammednasser.github.io
git checkout -b refactor/performance-clean-architecture
```

Never start this refactor directly on `main`.

---

# 4. Critical Architecture Observation

The current repository appears to contain substantial generated/static output plus post-processing scripts.

Current `package.json` contains scripts similar to:

```json
{
  "scripts": {
    "capture:arabic-window": "node scripts/capture-arabic-window-pages.mjs",
    "capture:kuwait-arc": "node scripts/capture-kuwait-arc-pages.mjs",
    "effects:portfolio": "node scripts/add-portfolio-effects.mjs",
    "fix:paths": "node scripts/fix-export-paths.mjs",
    "filter:work": "node scripts/add-work-filters.mjs",
    "upgrade:arabic-window": "node scripts/upgrade-arabic-window-case-study.mjs",
    "start": "node scripts/serve.mjs",
    "check": "node scripts/check-static.mjs"
  }
}
```

This suggests part of the current flow behaves like:

```text
Generated HTML
→ patch HTML
→ inject CSS/JS
→ fix paths/content
→ deploy
```

The desired long-term flow is:

```text
Source
→ Validation
→ Build
→ Static Export
→ Deployment
```

The first engineering task is therefore to determine the **actual source of truth** before refactoring generated files.

---

# 5. Repository Size Risk

Repository size was observed at approximately:

```text
640 MB
```

This is unusually large for a static portfolio.

Potential contributors:

- original screenshots
- full-page captures
- generated assets
- duplicated media
- multiple image formats
- obsolete project files
- build output
- captured/archive pages

## Safety Rule

Never delete an asset simply because it appears unused.

Before removal, prove that it has no references from:

- HTML
- JavaScript
- CSS
- project data
- build scripts
- manifests
- case studies
- generated routes

---

# 6. Confirmed Technical Problems

## 6.1 Incorrect Profile Image Preload

Homepage currently preloads:

```html
<link rel="preload" as="image" href="/profile.png">
```

`/profile.png` is used below the initial viewport.

This unnecessarily competes with critical resources such as:

- CSS
- fonts
- LCP content
- startup JavaScript

### Required Fix

Remove unnecessary preload/priority.

Use lazy loading where appropriate:

```html
<img
  src="/profile.png"
  loading="lazy"
  decoding="async"
  width="..."
  height="..."
  alt="..."
>
```

---

## 6.2 Inconsistent Lazy Loading

Many project images use:

```html
loading="lazy"
decoding="async"
```

but this is not consistent.

Observed examples include:

```text
/projects/oryxbag/home-en.jpg
/projects/ashhalancarrental/home-en.jpg
```

without equivalent lazy-loading behavior.

### Required Rule

All non-LCP / offscreen images should use appropriate lazy loading and async decoding.

---

## 6.3 Oversized Project Screenshots Used as Card Thumbnails

Large project screenshots appear to be used directly as card images.

This creates unnecessary:

- bandwidth
- decode cost
- memory usage
- rendering cost

### Target Strategy

Keep high-resolution originals for case-study detail pages.

Generate separate optimized card thumbnails.

Suggested structure:

```text
projects/{slug}/
├── original/
├── thumb-480.avif
├── thumb-800.avif
├── thumb-480.webp
└── thumb-800.webp
```

Suggested budget:

```text
Preferred card thumbnail: 50–120 KB
Hard target: <= 150 KB
Large case-study visual: around <= 300 KB where practical
```

Do not visibly damage image quality to hit a number.

---

## 6.4 Work Page Renders Entire Portfolio Archive

The `/work/` page currently renders all approximately 43 projects in the same DOM.

Client-side filtering hides and shows cards already present.

Lazy loading helps network behavior but does not eliminate:

- large initial HTML
- large DOM
- layout/style work
- many links/buttons/badges
- memory usage
- later request bursts

### Target

Initially render approximately:

```text
9–12 projects
```

Then progressively reveal more through:

```text
Load More
```

or pagination.

Where compatible, expose crawlable category routes:

```text
/work/
/work/ecommerce/
/work/corporate/
/work/services/
/work/platforms/
```

Filtering can remain as UX, but should not require rendering the entire archive initially.

---

## 6.5 Heavy Runtime Visual Effects

The following was the pre-Sprint 2 state and risk inventory.

The portfolio-effects runtime includes expensive behavior such as:

- WebGL
- shaders
- continuous `requestAnimationFrame`
- pointer tracking
- splash cursor canvas
- particles
- `ResizeObserver`
- `IntersectionObserver`
- `MutationObserver`
- DOM scans
- runtime class injection

Related CSS includes expensive effects such as:

```css
filter: blur(110px);
backdrop-filter: blur(18px);
will-change: transform;
```

plus:

- fixed ambient layers
- animated gradients
- pointer glow
- blurred shapes

Some defensive behavior already exists:

- reduced-motion support
- touch/mobile handling
- lower DPR/frame-rate logic
- visibility checks

These positives should be preserved.

### Required Direction

WebGL should be optional and primarily enabled on desktop/fine-pointer environments.

Example:

```js
const enableWebGL =
  window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Mobile/tablet should receive a lightweight CSS/static fallback.

Noncritical decorative runtime should start only after core content is usable.

Where appropriate use:

```js
requestIdleCallback()
```

with a safe fallback.

### Sprint 2 Outcome

Completed in `docs/audit/sprint-2-report.md`: WebGL is now optional and gated by a centralized desktop/fine-pointer/hover/motion/visibility/WebGL policy; mobile and reduced-motion paths use static fallback styling; noncritical initialization is idle-deferred; hidden/offscreen animation scheduling is cancelled; the splash cursor and document-wide observer were removed; broad runtime role scans were replaced by narrow selectors and deterministic CSS mapping; and permanent `will-change` declarations were removed.

---

## 6.6 Splash Cursor Runtime Cost

The splash cursor is decorative and adds runtime work.

Recommendation:

> Prefer removing it unless testing shows meaningful portfolio value with negligible performance cost.

If retained:

- desktop only
- fine pointer only
- delayed initialization
- disabled for reduced motion
- stop when hidden/offscreen

Sprint 2 applied the preferred outcome and removed the splash cursor from the runtime and stylesheet.

---

## 6.7 Runtime DOM Scanning

Before Sprint 2, the effects layer used patterns similar to:

```js
main.querySelectorAll("[class]")
main.querySelectorAll("a[class], button[class]")
```

and injects classes such as:

```text
portfolio-surface
portfolio-action
portfolio-page-title
```

For a mostly static site, this should be performed at build/render time.

### Replace

```text
render
→ scan DOM
→ infer role
→ inject classes
```

with:

```text
component render
→ correct classes already exist
```

---

## 6.8 Broad MutationObserver

Before Sprint 2, the runtime included broad subtree observation similar to:

```js
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
```

For a static portfolio this should remain only if a real dynamic DOM requirement is proven.

Otherwise remove it.

---

## 6.9 Unnecessary Client JavaScript / Hydration

Most homepage content is static:

- headings
- text
- cards
- sections
- links
- CTAs

Actual interactivity is mainly:

- mobile navigation
- Work filter
- visual effects

### Target

Limit client/runtime components to actual interactive islands such as:

```text
MobileMenu
WorkFilter
InteractiveHero
```

Static content should not be hydrated unnecessarily.

---

## 6.10 SEO Metadata Reuse

The Work page was observed using generic/homepage-style metadata.

For example:

```text
og:url
```

should be route-specific.

For `/work/` it should resolve to:

```text
https://engmuhammednasser.github.io/work/
```

### Required Per Important Route

```text
unique title
unique meta description
canonical
og:title
og:description
og:url
og:image
Twitter metadata
```

---

## 6.11 robots.txt and sitemap.xml

Usable root versions of the following were not found during the audit:

```text
robots.txt
sitemap.xml
```

They should be created/generated.

Sitemap coverage should include:

- English core pages
- Arabic core pages
- case studies
- project routes
- relevant category routes

---

## 6.12 Arabic / English SEO

Arabic functionality must remain intact.

Where appropriate validate:

```text
hreflang
canonical
localized title
localized description
localized OG metadata
```

Do not accidentally canonicalize Arabic routes to English unless intentionally correct.

---

## 6.13 Project Link Integrity

At least one featured project was observed linking to:

```text
/work/
```

instead of a dedicated case-study route.

Project data should explicitly represent whether a project is:

```text
case-study-enabled
archive-only
live-site-only
```

Do not silently fall back to `/work/`.

---

## 6.14 HTTP External Links

Some older external project URLs may still use:

```text
http://
```

If HTTPS is supported, link directly to HTTPS.

If a destination is dead or unsafe, consider removing the Live Site CTA while preserving the case-study/archive entry.

Never blindly rewrite external links without verification.

---

# 7. Existing Positive Behavior

Do not remove good existing behavior unnecessarily.

Confirmed positives include:

- `noopener noreferrer` on new-tab external links
- reduced-motion support
- mobile/touch degradation for some effects
- some images already use correct lazy loading
- GitHub Pages keeps server-side attack surface low
- no obvious heavy analytics/marketing tracker stack in initial HTML

---

# 8. Target Architecture

If the real source is Next.js or an equivalent component framework, the desired logical separation is approximately:

```text
src/
├── app/
├── components/
│   ├── layout/
│   ├── portfolio/
│   ├── ui/
│   └── effects/
├── data/
│   ├── projects.ts
│   ├── services.ts
│   └── navigation.ts
├── lib/
│   ├── seo/
│   ├── images/
│   └── utils/
├── types/
└── styles/

public/
├── images/
├── projects/
├── logos/
└── icons/
```

Do not force this exact folder tree if the real source structure suggests a cleaner alternative.

The principle is:

```text
routes
≠
content/data
≠
UI components
≠
effects
≠
SEO logic
≠
static assets
```

---

# 9. Target Project Data Model

Portfolio projects should eventually use one source of truth.

Example:

```ts
interface Project {
  slug: string;
  title: string;
  description: string;
  category: ProjectCategory;
  technologies: string[];
  thumbnail: string;
  liveUrl?: string;
  caseStudyUrl?: string;
  featured?: boolean;
}
```

Localized fields can be added where required.

Benefits:

- consistent rendering
- safer filters
- fewer duplicated cards
- SEO validation
- easier ordering
- broken-link validation
- simpler future maintenance

---

# 10. Sprint Roadmap

## Sprint 0 — Baseline & Architecture Discovery

### Goal

Understand the real project structure before refactoring.

### Tickets

```text
ARCH-001 Determine source of truth
ARCH-002 Document current build/deploy flow
ARCH-003 Audit post-build mutation scripts
PERF-001 Capture baseline metrics
ASSET-001 Build asset inventory
ASSET-002 Identify repository size contributors
QA-001 Run existing static checks
```

### Representative Routes

```text
/
 /work/
 /services/
 /about/
 /ar/
 /ar/work/
```

Also inspect at least 3 representative case studies.

### Baseline Metrics

Capture where possible:

```text
LCP
CLS
INP
FCP
TBT
DOM node count
request count
JS transfer
CSS transfer
image transfer
total page weight
```

### Required Deliverables

```text
docs/audit/baseline.md
docs/audit/asset-inventory.md
docs/architecture/current-state.md
docs/architecture/target-state.md
```

### Current Status

```text
High-level remote audit: DONE
Detailed local/source audit: TODO
Baseline measurements: TODO
Implementation: NOT STARTED
```

---

# 11. Sprint 1 — Images & Asset Delivery

### Tickets

```text
PERF-101 Remove incorrect profile preload
PERF-102 Standardize lazy loading
PERF-103 Add dimensions/aspect ratio
PERF-104 Build optimized thumbnail pipeline
PERF-105 Add responsive image delivery
PERF-106 Add image performance budget
ASSET-101 Audit duplicate/orphan assets
ASSET-102 Safely reduce repository media weight
```

### Acceptance Criteria

- no unnecessary below-fold image preload
- offscreen card images lazy-load consistently
- card images use optimized variants
- originals needed by case studies remain intact
- no broken image paths
- no unacceptable visual regression

### Status

```text
DONE — see docs/audit/sprint-1-report.md
```

---

# 12. Sprint 2 — Runtime & Rendering Performance

### Tickets

```text
PERF-201 Conditional desktop WebGL
PERF-202 Lightweight mobile visual fallback
PERF-203 Delay noncritical effects
PERF-204 Remove or constrain splash cursor
PERF-205 Remove unnecessary DOM scanning
PERF-206 Remove unnecessary MutationObserver
PERF-207 Reduce expensive CSS compositing
PERF-208 Pause effects while hidden/offscreen
PERF-209 Audit unnecessary hydration
```

### Acceptance Criteria

- site works if effects are disabled
- reduced-motion still works
- mobile does not require WebGL
- decorative effects do not compete with core interaction
- no unnecessary continuous animation when hidden
- visual identity remains recognizable

### Status

```text
DONE — see docs/audit/sprint-2-report.md
```

---

# 13. Sprint 3 — Work Page & Portfolio Architecture

### Tickets

```text
WORK-301 Centralize project data
WORK-302 Build reusable ProjectCard
WORK-303 Normalize thumbnail behavior
WORK-304 Render 9–12 projects initially
WORK-305 Add Load More or pagination
WORK-306 Preserve useful filtering
WORK-307 Add category routes where appropriate
WORK-308 Validate case-study links
WORK-309 Validate project metadata
```

### Acceptance Criteria

- one project-card rendering contract
- no unnecessary initial rendering of all 43 cards
- existing case studies remain reachable
- categories/order remain correct
- filters remain usable
- URLs are preserved

### Status

```text
DONE — see docs/audit/sprint-3-report.md and docs/architecture/project-data-model.md
```

---

# 14. Sprint 4 — SEO & Accessibility

### SEO Tickets

```text
SEO-401 Route-specific titles/descriptions
SEO-402 Correct canonical URLs
SEO-403 Correct OG URLs
SEO-404 Create/generate sitemap.xml
SEO-405 Create/generate robots.txt
SEO-406 Localized EN/AR metadata
SEO-407 Evaluate hreflang
SEO-408 Add valid structured data where useful
```

### Accessibility Tickets

```text
A11Y-401 Keyboard navigation
A11Y-402 Focus states
A11Y-403 Heading hierarchy
A11Y-404 Image alt audit
A11Y-405 Semantic HTML
A11Y-406 Mobile navigation accessibility
A11Y-407 Contrast audit
A11Y-408 Reduced-motion validation
```

### Status

```text
DONE — see docs/audit/sprint-4-report.md and docs/architecture/seo-accessibility-strategy.md
```

---

# 15. Sprint 5 — Clean Architecture, CI & Quality Gates

### Architecture

```text
ARCH-501 Reduce HTML post-processing
ARCH-502 Separate effects from content rendering
ARCH-503 Reduce client boundaries
ARCH-504 Centralize portfolio/content data
ARCH-505 Document architecture decisions
```

### QA

```text
QA-501 Broken internal-link validation
QA-502 Missing-image validation
QA-503 Missing-alt validation
QA-504 Duplicate-slug validation
QA-505 Metadata validation
QA-506 Thumbnail-size validation
QA-507 Static export validation
```

### CI

```text
CI-501 GitHub Actions quality pipeline
CI-502 Build validation
CI-503 Static checks
CI-504 Optional reproducible Lighthouse checks
```

### Desired Delivery Flow

```text
Source
→ lint/type/content validation
→ build
→ static checks
→ static export
→ deploy
```

### Status

```text
DONE — final architecture inventory, complete script ownership audit, supported `npm run verify` pipeline, security/hygiene and practical budget gates, generator idempotency checks, Chrome/EN/AR browser validation, GitHub Actions quality workflow, generated-asset policy, release/rollback/PR documentation, and final report are complete. See `docs/audit/final-architecture-inventory.md`, `docs/audit/script-inventory.md`, `docs/audit/final-report.md`, `docs/architecture/engineering-workflow.md`, and `docs/operations/`.
```

---

# 16. Performance Targets

Primary Core Web Vitals targets:

```text
LCP <= 2.5s
INP <= 200ms
CLS <= 0.1
```

Suggested Lighthouse goals where reproducible:

```text
Performance >= 90
Accessibility >= 95
Best Practices >= 95
SEO >= 95
```

Suggested initial JavaScript budget:

```text
Ideally <= 100–150 KB gzip
```

These are engineering targets, not excuses to break functionality.

---

# 17. Mandatory Implementation Rules

1. Never experiment directly on `main`.
2. Work from a dedicated feature/refactor branch.
3. Do not auto-merge to `main`.
4. Do not redesign the portfolio.
5. Do not delete content.
6. Do not remove Arabic.
7. Do not casually change public URLs.
8. Do not silently remove working functionality.
9. Keep major changes reversible.
10. Preserve original assets before optimization/removal.
11. Do not add dependencies without a technical reason.
12. Prefer browser/framework capabilities first.
13. Validate each Sprint independently.
14. Keep commits small and reviewable.
15. Update this handoff after each completed Sprint.

---

# 18. Refactor Philosophy

Prefer:

```text
small robust refactor
```

over:

```text
large rewrite because it looks cleaner
```

For every meaningful change:

```text
Problem
→ Root Cause
→ Smallest Durable Fix
→ Test
→ Regression Check
→ Documentation
```

Clean architecture means clear ownership and boundaries, not unnecessary abstractions.

---

# 19. Suggested Commit Sequence

```text
chore(audit): document current architecture and performance baseline

perf(images): establish responsive portfolio image pipeline

perf(runtime): reduce decorative effect rendering cost

refactor(portfolio): centralize project data and project card rendering

perf(work): progressively render portfolio archive

refactor(architecture): remove unnecessary DOM post-processing

seo: add route-specific metadata sitemap and canonical handling

a11y: improve navigation motion and semantic accessibility

ci: add static quality and performance checks
```

Do not place the complete refactor in one giant commit.

---

# 20. Required Regression Checks

## English

Validate:

```text
/
 /work/
navigation
mobile navigation
featured projects
project archive
filters
case studies
external links
```

## Arabic

Validate:

```text
/ar/
Arabic navigation
Arabic routes
RTL direction
locale switching
localized metadata
```

## Images

Validate:

```text
hero assets
logos
profile image
project cards
case-study media
Open Graph images
```

## Runtime

Validate:

```text
desktop mouse
keyboard
mobile touch
reduced motion
slow device behavior
page visibility / tab switching
```

---

# 21. Work Already Completed

The following has already been completed at analysis level:

- live homepage reviewed
- live Work page reviewed
- Arabic homepage confirmed
- GitHub repository identified
- generated homepage HTML inspected
- Work-page HTML inspected
- current package scripts inspected
- incorrect profile preload identified
- lazy-loading inconsistencies identified
- oversized-card-image risk identified
- 43-project Work-page rendering issue identified
- visual runtime inspected
- WebGL runtime cost identified
- DOM scanning identified
- MutationObserver architecture identified
- expensive CSS effects identified
- SEO metadata reuse identified
- robots/sitemap gap identified
- case-study link integrity issue identified
- HTTP external-link risk noted
- Sprint structure defined
- target clean-architecture direction defined

---

# 22. Work NOT Completed Yet

The following remains pending:

- recover or re-establish the original source/build boundary
- recovery of the original source/build boundary (the committed static export remains the supported delivery boundary)
- Lighthouse/PageSpeed baseline
- full-archive thumbnail rollout
- asset cleanup or deletion
- browser CWV before/after metrics
- Pull Request
- production merge

The remaining list is intentionally scoped to post-review work. Sprint 1 delivered the reference audit, deterministic AVIF/WebP thumbnail pipeline, five-project pilot, preload/loading normalization, generated-asset validation, static route checks, and before/after static byte metrics. Sprint 2 delivered the runtime inventory, centralized effect policy, optional desktop WebGL, static mobile/reduced-motion fallback, idle initialization, lifecycle-safe loops, splash removal, DOM observer cleanup, CSS compositing reductions, and runtime invariants. Sprint 3 delivered canonical EN/AR Work data, deterministic cards, 12-card progressive rendering, accessible filters, no-JS route discovery, Work payload normalization, structural metrics, and interaction checks. Sprint 4 delivered route-specific metadata, canonical URLs, reciprocal EN/AR hreflang, robots/sitemap, structured data, skip navigation, semantic/focus improvements, accessibility validation, and browser checks. Sprint 5 delivered architecture ownership, a single verification pipeline, CI, idempotency/security/budget gates, and release operations documentation. Browser CWV metrics remain unavailable; no production merge has occurred.

---

# 23. Exact Immediate Next Action

Sprint 5 is complete. Review `docs/audit/final-report.md`, run `npm run verify`, complete `docs/operations/release-checklist.md`, and open the PR using `docs/operations/pr-draft.md`. Keep the branch separate from `main` until review and protected-branch approval.

The current working branch is already the safe refactor branch:

```bash
git checkout refactor/performance-clean-architecture
```

Run `npm run check` and `npm run audit:assets` before any wider pilot rollout. Do not begin destructive cleanup until the reference map and case-study regression checks are reviewed.

---

# 24. Agent Startup Prompt

When handing this project to a coding agent, use:

> Read `PORTFOLIO_ENGINEERING_HANDOFF.md` completely before making any change.
>
> Treat it as the current source of truth for this engineering refactor.
>
> Start with the current incomplete Sprint in the status board; do not repeat completed Sprint 0, Sprint 1, or Sprint 2 work.
>
> Do not modify `main`.
>
> Do not redesign the portfolio.
>
> Do not remove Arabic functionality.
>
> Do not delete assets until reference analysis proves they are safe to remove.
>
> Preserve all existing public case-study URLs unless a change is explicitly justified.
>
> Your first deliverable for a new Sprint is an evidence-backed audit, not a broad rewrite.
>
> After Sprint 0, report:
>
> - actual source architecture
> - generated vs source files
> - build and deployment flow
> - repository size contributors
> - baseline performance metrics
> - top risks
> - exact Sprint 1 files/tasks
> - any blockers
>
> Do not start the next Sprint until the current Sprint report and regression checks have been documented.

---

# 25. Sprint Status Board

| Sprint | Status | Notes |
|---|---|---|
| Sprint 0 — Audit & Baseline | `COMPLETE` | Local source/output audit, static baseline, asset inventory, architecture documents, and existing-check result recorded in `docs/audit/` and `docs/architecture/`. `npm run check` still reports four stale Afaaq preload references; no implementation fix was made in Sprint 0. |
| Sprint 1 — Images & Assets | `COMPLETE` | Root-cause Afaaq preload fix, image loading/preload normalization, reference audit, deterministic AVIF/WebP pipeline, five-project EN/AR pilot, image validation, route checks, and report completed in `docs/audit/sprint-1-report.md`. |
| Sprint 2 — Runtime Performance | `COMPLETE` | Runtime inventory, centralized capability policy, optional desktop WebGL, lifecycle-safe animation, splash removal, DOM/observer cleanup, CSS compositing reductions, runtime invariants, route checks, and report completed in `docs/audit/sprint-2-report.md`. |
| Sprint 3 — Work Architecture | `COMPLETE` | Canonical EN/AR project data, deterministic card renderer, 12-card progressive archive, accessible filters, no-JS links, payload normalization, validation, and report completed in `docs/audit/sprint-3-report.md`. |
| Sprint 4 — SEO & Accessibility | `COMPLETE` | Route inventory, unique metadata, canonical URLs, EN/AR hreflang, robots/sitemap, structured data, skip navigation, semantics, focus treatment, validation, browser checks, and report completed in `docs/audit/sprint-4-report.md`. |
| Sprint 5 — Architecture / CI / QA | `COMPLETE` | Final architecture and script inventories, supported `npm run verify` pipeline, security/hygiene and budget gates, generator idempotency, cross-platform browser checks, GitHub Actions workflow, generated-asset policy, final report, workflow, rollback, release checklist, and PR draft completed. Release recommendation: `READY FOR PR REVIEW`; no PR was created and `main` was not merged. |

Update this table when a Sprint is completed.

Sprint 0 completion record (2026-08-02): the safe branch `refactor/performance-clean-architecture` was created from `main`. The checkout was confirmed to be a committed Next.js static export with no recoverable application source/build configuration, 43 Work cards, 187 HTML pages, 640,384 KiB reported repository storage, and 723,567,760 bytes of expanded files. Browser-based CWV metrics were unavailable because no supported browser or performance harness was installed; static route/resource proxies are documented without fabricated LCP, CLS, INP, FCP, or TBT values.

Sprint 1 completion record (2026-08-02): `npm run check` passes. The four Afaaq preload references were corrected in `scripts/create-afaaq-case-study.mjs` and regenerated in both locale pages. Profile and noncritical gallery preloads were removed through `scripts/normalize-image-delivery.mjs`; 86 Work-card images and 1,526 below-fold project/backend image declarations were standardized for lazy/async delivery. A reusable project reference audit, AVIF/WebP thumbnail pipeline, image validator, and five-project responsive pilot were added. Originals and public URLs remain intact; Sprint 2 was then reviewed and completed separately.

Sprint 2 completion record (2026-08-02): the pre-change runtime inventory is recorded in `docs/audit/runtime-inventory.md`. `scripts/portfolio-effects.js` now centralizes capability policy, defers decoration to idle time, gates WebGL to desktop/fine-pointer/hover/motion-enabled/visible paths, uses a static fallback for mobile/tablet/reduced-motion/unsupported paths, pauses and cancels hidden/offscreen loops, and cleans up scoped observers/listeners. The splash cursor and document-wide `MutationObserver` were removed; broad DOM scans and permanent `will-change` were removed; `scripts/check-runtime-invariants.mjs` is part of `npm run check`; required static route checks passed; and no browser CWV metrics or production merge were claimed.

Sprint 3 completion record (2026-08-02): `data/projects.json` now contains the 43-project canonical Work archive with shared EN/AR copy, structured categories, thumbnail metadata, case-study routes, live URLs, availability classification, featured flags, and status. Work HTML was reduced from 43 to 12 initial cards per locale, with 12-card progressive Load More, accessible native filters, localized empty/status messaging, and 43 no-JS case-study links per locale. Work Flight payload roots were normalized to the same initial slice. `npm run check`, the framework-free interaction harness, Chrome headless static execution, and `git diff --check` passed. Sprint 4 and Sprint 5 were TODO at that completion point; no production merge was made.

Sprint 4 completion record (2026-08-02): the before-state is recorded in `docs/audit/seo-accessibility-before.md`, with current route inventory in `data/routes.json`. All 184 indexable routes now have route-specific metadata, canonical URLs, reciprocal EN/AR hreflang with x-default, safe JSON-LD, and localized language semantics. `robots.txt` and a deterministic 184-URL `sitemap.xml` were generated. Native skip navigation, labelled navigation/menu relationships, shared focus-visible treatment, and Lab/Backend heading fixes were applied without reintroducing runtime cost. `npm run check`, `git diff --check`, route metadata validation, and Chrome headless EN/AR regression checks passed. Sprint 5 then finalized the architecture, quality gates, CI, and release documentation; no production merge was made.

Sprint 5 completion record (2026-08-02): the final architecture and complete 47-file script inventory are recorded in `docs/audit/final-architecture-inventory.md` and `docs/audit/script-inventory.md`. `npm run verify` passed after a locked `npm ci`, including project/data validation, 187 HTML and 1,474 payload checks, 184 indexable SEO/accessibility routes, Work interaction tests, security/hygiene checks, practical artifact budgets, 12 Chrome EN/AR smoke routes, supported-generator idempotency, and `git diff --check`. `.github/workflows/quality.yml` runs the same pipeline with Node 20, Chromium fallback, and `contents: read`. Rollback, release, workflow, PR, and final report documents are complete. Overall status: **READY FOR PR REVIEW**; `main` was not modified or merged.

---

# 26. Definition of Project Completion

The refactor is not complete until:

- build succeeds
- static export/checks succeed
- English routes remain functional
- Arabic routes remain functional
- case studies remain intact
- internal links are validated
- image references are valid
- unnecessary preloads are removed
- card media is optimized
- Work page initial rendering is reduced
- decorative runtime does not materially damage mobile performance
- unnecessary broad DOM scanning is removed
- unnecessary broad DOM observation is removed
- metadata is route-specific
- sitemap and robots are valid
- accessibility regressions are not introduced
- before/after metrics exist
- architecture is documented
- rollback information exists
- changes are reviewed before merge

Final engineering report:

```text
docs/audit/final-report.md
```

It should contain:

- baseline
- final metrics
- architecture changes
- performance changes
- SEO changes
- accessibility changes
- repository-size changes
- remaining risks
- intentionally deferred tasks
- rollback procedure
- recommended future improvements

---

# 27. Final Engineering Principle

The portfolio should communicate technical credibility through its implementation as well as its design.

Desired final state:

```text
Fast
Maintainable
Accessible
SEO-correct
Static-first
Minimal-runtime
Asset-efficient
Easy to extend
Safe to deploy
```

without sacrificing the current portfolio identity, English/Arabic content, or case-study history.

</details>
