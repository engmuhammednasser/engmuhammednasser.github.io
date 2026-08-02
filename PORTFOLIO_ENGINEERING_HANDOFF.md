# Muhammed Nasser Portfolio — Engineering Handoff & Sprint Plan

**Project:** Muhammed Nasser Portfolio  
**Repository:** `engmuhammednasser/engmuhammednasser.github.io`  
**Live Site:** `https://engmuhammednasser.github.io/`  
**Purpose:** Single source of truth for the portfolio refactor, performance, architecture, SEO, accessibility, QA, and delivery work.  
**Status:** Sprint 0, Sprint 1, and Sprint 2 completed; Sprint 3 is TODO.
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
TODO
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
TODO
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
TODO
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
- confirmed source-of-truth architecture
- Lighthouse/PageSpeed baseline
- full-archive thumbnail rollout
- asset cleanup or deletion
- project data centralization
- Load More/pagination implementation
- SEO implementation
- sitemap/robots implementation
- accessibility remediation
- CI/CD hardening
- browser before/after metrics
- Pull Request
- production merge

The remaining list is intentionally scoped to later Sprints. Sprint 1 delivered the reference audit, deterministic AVIF/WebP thumbnail pipeline, five-project pilot, preload/loading normalization, generated-asset validation, static route checks, and before/after static byte metrics. Sprint 2 delivered the runtime inventory, centralized effect policy, optional desktop WebGL, static mobile/reduced-motion fallback, idle initialization, lifecycle-safe loops, splash removal, DOM observer cleanup, CSS compositing reductions, and runtime invariants. Browser CWV metrics remain unavailable and no production merge has occurred.

---

# 23. Exact Immediate Next Action

Do not begin Sprint 3 yet. Review `docs/audit/sprint-2-report.md`, recover or document the source/export boundary, and add a browser-capable regression harness before changing Work architecture. Keep Sprint 3 focused on project-data ownership, initial rendering scope, filtering, and pagination.

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
| Sprint 3 — Work Architecture | `TODO` | No implementation yet |
| Sprint 4 — SEO & Accessibility | `TODO` | No implementation yet |
| Sprint 5 — Architecture / CI / QA | `TODO` | No implementation yet |

Update this table when a Sprint is completed.

Sprint 0 completion record (2026-08-02): the safe branch `refactor/performance-clean-architecture` was created from `main`. The checkout was confirmed to be a committed Next.js static export with no recoverable application source/build configuration, 43 Work cards, 187 HTML pages, 640,384 KiB reported repository storage, and 723,567,760 bytes of expanded files. Browser-based CWV metrics were unavailable because no supported browser or performance harness was installed; static route/resource proxies are documented without fabricated LCP, CLS, INP, FCP, or TBT values.

Sprint 1 completion record (2026-08-02): `npm run check` passes. The four Afaaq preload references were corrected in `scripts/create-afaaq-case-study.mjs` and regenerated in both locale pages. Profile and noncritical gallery preloads were removed through `scripts/normalize-image-delivery.mjs`; 86 Work-card images and 1,526 below-fold project/backend image declarations were standardized for lazy/async delivery. A reusable project reference audit, AVIF/WebP thumbnail pipeline, image validator, and five-project responsive pilot were added. Originals and public URLs remain intact; Sprint 2 was then reviewed and completed separately.

Sprint 2 completion record (2026-08-02): the pre-change runtime inventory is recorded in `docs/audit/runtime-inventory.md`. `scripts/portfolio-effects.js` now centralizes capability policy, defers decoration to idle time, gates WebGL to desktop/fine-pointer/hover/motion-enabled/visible paths, uses a static fallback for mobile/tablet/reduced-motion/unsupported paths, pauses and cancels hidden/offscreen loops, and cleans up scoped observers/listeners. The splash cursor and document-wide `MutationObserver` were removed; broad DOM scans and permanent `will-change` were removed; `scripts/check-runtime-invariants.mjs` is part of `npm run check`; required static route checks passed; and no browser CWV metrics or production merge were claimed.

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
