# Sprint 2 Engineering Report — Runtime & Rendering Performance

Date: 2026-08-02  
Branch: `refactor/performance-clean-architecture`  
Commits: `57cd336` (inventory), `fbcd1f0` (runtime implementation)

Sprint 2 refactored the optional decorative runtime in the committed static export. Public routes, English/Arabic paths, content, navigation, and project data were not redesigned. The original application source and build configuration remain unavailable, so this work stays within the existing `scripts/` runtime boundary and static validation layer.

## Runtime Before

The pre-change inventory is recorded in [runtime-inventory.md](runtime-inventory.md). The effects module was linked from all 187 HTML documents and measured:

| Item | Before |
|---|---:|
| Effects JavaScript | 17,775 bytes |
| Effects CSS | 8,920 bytes |
| `requestAnimationFrame` references | 7 |
| Canvas systems | 2: WebGL hero and splash cursor |
| Document-wide `MutationObserver` | 1 |
| Hero `ResizeObserver` | 1 |
| Hero `IntersectionObserver` | 1 |
| Global pointer listener | 1, installed by the ambient runtime |
| Global resize listener | 1, installed by the splash cursor |

The WebGL and splash systems each retained a frame schedule for their lifetime. Hidden state skipped drawing but did not cancel those schedules. Mobile/tablet paths could still reach WebGL context creation, and `polishPage()` scanned all class-bearing `main` descendants and all class-bearing links/buttons to infer visual roles.

## Decisions

- Keep the shared ambient mood and homepage hero identity as optional decoration.
- Remove the splash cursor. It was a second full-viewport canvas and a global pointer/resize workload with low content value.
- Remove the document-wide mutation observer. The static export is complete before the deferred effect script runs, and no real dynamic DOM requirement was proven.
- Remove broad runtime role inference. Page title treatment uses a narrow deterministic `main`/`h1` lookup; surface/action treatment now maps existing generated class tokens through CSS selectors instead of scanning and mutating the DOM.
- Centralize reduced-motion, pointer, hover, viewport, visibility, and WebGL API decisions in one runtime policy.
- Defer noncritical mount work with `requestIdleCallback({ timeout: 1200 })`, with a `setTimeout` fallback.
- Keep effects outside navigation, content, links, and layout correctness. Failure falls back to CSS and emits a warning for shader/context failures.

## WebGL

The hero WebGL path now initializes only when all of these are true:

- viewport is desktop-sized (`>= 1024px`);
- pointer is fine and hover-capable;
- reduced motion is not requested;
- the page is visible; and
- a WebGL API is available.

Mobile, tablet, coarse-pointer, reduced-motion, hidden-page, and unsupported-WebGL paths use the static hero treatment without creating a canvas. Context creation is still guarded with `try/catch`; missing context, shader compilation/link failure, and context loss activate the fallback and do not affect page content. The active path requests low-power WebGL, disables antialias/depth, caps DPR at `1.25`, and throttles rendering to approximately 30 FPS.

The shared animation-loop helper cancels the pending frame when the page is hidden or the hero leaves the viewport, and resumes only when eligible. `ResizeObserver` and `IntersectionObserver` remain hero-scoped and disconnect during cleanup.

## DOM Runtime

- Removed `MutationObserver` entirely.
- Removed `main.querySelectorAll("[class]")` and `main.querySelectorAll("a[class], button[class]")` role scans.
- Removed runtime class inference for surfaces and actions; CSS deterministically targets the existing generated class tokens. This retains the visual treatment without a page-wide JavaScript traversal.
- Kept only narrow selectors needed for the explicit homepage hero and page-title enhancement.
- Pointer work is conditional: the global ambient pointer listener is registered only for desktop/fine/hover/motion-enabled conditions; hero pointer input exists only with the WebGL hero.
- The splash cursor’s global pointer and resize listeners are gone.

## Runtime Metrics

| Metric | Before | After |
|---|---:|---:|
| Effects JavaScript bytes | 17,775 | 19,995 |
| Effects CSS bytes | 8,920 | 9,906 |
| Direct `requestAnimationFrame` call sites | 7 | 2, through one lifecycle helper |
| Canvas systems | 2 | 1 optional WebGL system |
| Document-wide `MutationObserver` | 1 | 0 |
| Global resize listener | 1 | 0 |
| Mobile/reduced-motion canvas creation | Possible before policy/fallback | 0 by policy |
| Hidden/offscreen WebGL scheduling | Scheduled while skipping draws | Cancelled and resumed on eligibility |

The unminified JS/CSS payload increased because the centralized policy, lifecycle helper, fallback handling, and deterministic CSS mapping are now explicit. The measurable runtime work is reduced: there is no splash loop, no document observer/remount amplification, no broad DOM traversal, no mobile WebGL initialization, and no permanent `will-change` declaration. No browser transfer or Core Web Vitals result is inferred from these source-byte measurements.

## Changed Files

- `scripts/portfolio-effects.js` — central capability policy, idle initialization, lifecycle-safe animation loop, optional desktop WebGL, static fallback, scoped observers, cleanup, and splash removal.
- `scripts/portfolio-effects.css` — deterministic surface/action selectors, lighter mobile/reduced-motion behavior, hidden-page pause state, fallback styling, and removal of permanent `will-change` and splash-cursor CSS.
- `scripts/check-runtime-invariants.mjs` — validates effect inclusion, no broad observer/scans, reduced-motion/visibility policy, no splash runtime, idle fallback, and no permanent `will-change`.
- `package.json` — includes runtime invariants in `npm run check`.
- `docs/audit/runtime-inventory.md` — pre-change subsystem inventory and measurements.
- `docs/audit/sprint-2-report.md` — this report.
- `PORTFOLIO_ENGINEERING_HANDOFF.md` — Sprint 2 status and next-action updates.

No Work pagination, project data, SEO, accessibility overhaul, framework reconstruction, asset deletion, or public URL changes were made.

## Regression Testing

Passed:

- `npm run check`
- `git diff --check`
- `node --check scripts/portfolio-effects.js`
- Static server route checks returned 200 for `/`, `/work/`, `/ar/`, English/Arabic Techmart case studies, and English/Arabic Afaaq case studies.
- Runtime invariant checks scanned all 187 HTML documents and confirmed exactly one tagged effects stylesheet and script per document.

Static review covers desktop/fine-pointer, coarse/mobile, reduced-motion, hidden-page, offscreen, unsupported-WebGL, shader-failure, and context-loss branches. A supported Chromium/Playwright/Puppeteer/Lighthouse harness is not installed, so real browser rendering, device GPU behavior, Core Web Vitals, and visual screenshots remain unmeasured rather than fabricated.

## Remaining Risks

- The missing source/build boundary still makes the static export and post-build scripts the current change boundary.
- Effects JS/CSS remain linked on all 187 pages; route-scoped delivery should wait for source recovery or a deliberate static injection policy.
- CSS role selectors depend on the current generated utility-class tokens. A future export should move those classes to a source/build owner.
- Actual GPU cost, WebGL context availability, and visual fidelity across mobile/desktop browsers still need browser-capable regression coverage.
- Desktop header and ambient blur remain intentional visual costs; mobile card backdrop blur and orb animation are disabled.

## Sprint 3 Recommendation

Do not begin Sprint 3 implementation in this change. First recover or document a reproducible source/export boundary and add a browser-capable regression harness for desktop fine-pointer, mobile/coarse-pointer, reduced-motion, visibility, and WebGL fallback states. The existing Sprint 3 Work architecture backlog can then address project-data ownership, initial rendering scope, and pagination without mixing those concerns into the completed runtime refactor.
