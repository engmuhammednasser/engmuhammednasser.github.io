# Mobile Navigation Hotfix Report

## Incident

After PR #1 deployed at `018d4163b111900cbd99243afee42a431d1a9aef`, production verification found that the mobile navigation button did not open the menu on EN or AR pages.

The defect predated PR #1. The production menu HTML and `_next/static/chunks/0mr0fnckbkr54.js` are byte-identical to the pre-merge `main` revision. PR #1 did not modify the generated Next chunk. Rollback was therefore not an appropriate corrective action.

## Root Cause

The static export delivers server-rendered markup for a React navigation component, but the generated React client fails during hydration before the component's `onClick` handler is attached.

Evidence from a real Chrome pointer test at `390 × 844`:

- `/`, `/work/`, `/ar/`, and `/ar/work/` all received one captured `pointerdown` event on the visible button.
- The button stayed at `aria-expanded="false"` and the menu stayed in its locale-specific closed class (`-translate-x-full` for EN and `translate-x-full` for AR).
- After page load, the button had no React-owned DOM props and `DOMDebugger.getEventListeners` returned no listeners for the button.
- The generated component source defines `onClick: () => s(!l)`, but that handler is not present on the delivered DOM.
- The exception occurred before pointer activation.

The proven failure category is:

```text
B. Event reaches button but no handler exists
E. Hydration/runtime exception prevents React handler attachment
```

The effects layer is not the cause. The pointer hit-test lands on the button's child span, the effects CSS marks decorative layers `pointer-events: none`, and the fallback passes with `portfolio-effects.js` blocked.

## Fix

The hotfix adds a small standalone progressive-enhancement controller at `scripts/mobile-navigation.js`. It owns the menu interaction when the generated React handler is unavailable and does not modify the vendor chunk.

The controller:

- uses stable `data-mobile-menu-toggle` and `data-mobile-menu` hooks;
- uses one idempotent initialization marker;
- handles native click activation, which preserves mouse, touch, Enter, and Space behavior;
- stops the button click from bubbling into a future React delegated handler, preventing double toggles;
- updates `aria-expanded`, `aria-hidden`, `inert`, CSS state, and body scroll state;
- supports the close button, Escape, overlay click, and navigation-link close behavior;
- preserves EN/LTR and AR/RTL closed-state classes.

`scripts/apply-mobile-navigation.mjs` applies those hooks and the runtime script to the 184 generated pages with mobile navigation. It validates the expected page count and is idempotent.

## React Exception

The generated exception contributes to the defect by preventing the React navigation handler from being attached. It remains unresolved because the original Next.js source/build configuration is unavailable and the generated vendor chunk must not be patched directly.

Observed exceptions:

```text
TypeError: t.reason.enqueueModel is not a function
    at M (.../_next/static/chunks/0mr0fnckbkr54.js:1:3244)
```

and on Work routes:

```text
Error: Connection closed.
    at eo (.../_next/static/chunks/0mr0fnckbkr54.js:1:14512)
```

The hotfix does not attempt to remove unrelated generated framework errors. The standalone controller works with the same exception present and does not introduce a new console error.

## Tests

`scripts/test-mobile-navigation.mjs` uses Chrome CDP with a `390 × 844` mobile viewport and real `Input.dispatchMouseEvent` pointer activation.

Verified on `/`, `/work/`, `/ar/`, and `/ar/work/`:

- menu starts closed;
- pointer opens and second pointer activation closes;
- `aria-expanded` and CSS visibility state change correctly;
- Escape closes the menu;
- native Enter activation opens the menu;
- native Space activation opens the menu;
- EN and AR navigation links remain usable;
- AR remains RTL;
- no unexpected new console/runtime error was introduced;
- the same test passes with `portfolio-effects.js` blocked.

## Validation

The full validation results are recorded in the final handoff. The hotfix validation includes:

```text
npm ci                 PASS
npm run verify        PASS
git diff --check      PASS
Chrome regression     PASS
```

The security scanner explicitly includes `scripts/mobile-navigation.js`. No broad `MutationObserver` was added, no vendor Next chunk was edited, and no project data, SEO content, images, or case-study content is changed.

## Remaining Risk

The generated Next/React hydration exception remains technical debt. Repairing it safely would require the unavailable original Next.js source/build configuration. The mobile navigation no longer depends on that hydration path for its required interaction behavior.
