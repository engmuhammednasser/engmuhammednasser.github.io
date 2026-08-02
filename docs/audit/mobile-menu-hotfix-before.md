# Mobile Navigation Hotfix — Before Reproduction

Date: 2026-08-02

Production revision: `018d4163b111900cbd99243afee42a431d1a9aef`

## Affected routes

The defect reproduces on all four required production routes:

| Route | Locale | Direction | Result |
| --- | --- | --- | --- |
| `/` | EN | LTR | pointer reaches toggle; menu remains closed |
| `/work/` | EN | LTR | pointer reaches toggle; menu remains closed |
| `/ar/` | AR | RTL | pointer reaches toggle; menu remains closed |
| `/ar/work/` | AR | RTL | pointer reaches toggle; menu remains closed |

## Browser reproduction

- Browser: installed Google Chrome, headless CDP session
- Viewport: `390 × 844`, mobile emulation enabled
- Interaction: `Input.dispatchMouseEvent` with `mouseMoved`, `mousePressed`, and `mouseReleased` at the center of the visible toggle; this is a real browser pointer path, not `element.click()` or direct JavaScript invocation.
- Toggle selector: `[aria-controls="mobile-navigation"]`
- Menu selector: `#mobile-navigation` / `[role="dialog"]`

## DOM before and after

The toggle is visible and receives the pointer event. On every route:

- Before: `aria-expanded="false"`
- Pointer delivery: one captured `pointerdown` event on the toggle
- After: `aria-expanded="false"`
- Menu class remains closed:
  - EN: `-translate-x-full`
  - AR: `translate-x-full`
- The menu remains in the closed CSS state; no open-state class is applied.
- The toggle's child `<span>` is the element at the pointer coordinates, confirming the button is not blocked by an effects overlay.
- The document reaches `readyState="complete"`.

## Expected behavior

Activating the native menu button should open the menu, apply the open CSS state, and set `aria-expanded="true"`.

## Actual behavior

The browser pointer event reaches the native button, but no state change follows. The menu does not open and `aria-expanded` stays `false`.

## Runtime evidence

The exception occurs before pointer activation. No `console.error` or `console.assert` call was captured, but an uncaught generated Next/React exception was captured on each page:

Homepage routes:

```text
TypeError: t.reason.enqueueModel is not a function
    at M (https://engmuhammednasser.github.io/_next/static/chunks/0mr0fnckbkr54.js:1:3244)
    at https://engmuhammednasser.github.io/_next/static/chunks/0mr0fnckbkr54.js:1:18037
    at t (https://engmuhammednasser.github.io/_next/static/chunks/0mr0fnckbkr54.js:1:18090)
```

Work routes:

```text
Error: Connection closed.
    at eo (https://engmuhammednasser.github.io/_next/static/chunks/0mr0fnckbkr54.js:1:14512)
    at t (https://engmuhammednasser.github.io/_next/static/chunks/0mr0fnckbkr54.js:1:14935)
```

The same failure pattern occurs in EN and AR. Root-cause ownership and whether the exception prevents the React handler from attaching are investigated separately in the hotfix report.
