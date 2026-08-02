# Pull Request Draft

## Suggested title

`refactor: finalize portfolio architecture and release quality gates`

## Description

This PR completes the portfolio engineering refactor through Sprint 5. It preserves the static GitHub Pages delivery model while making project data, route metadata, Work behavior, runtime effects, image delivery, and release validation explicit and reviewable.

### Included

- Canonical project and route data with localized Work rendering.
- Static SEO/accessibility hardening across 184 indexable routes, including canonical URLs, hreflang, JSON-LD, sitemap, robots, landmarks, skip links, headings, and image/button semantics.
- Runtime lifecycle/reduced-motion/DOM-scope safeguards and responsive image delivery checks.
- A single `npm run verify` pipeline with static, data, Work, SEO, security, practical budget, Chrome, idempotency, and diff gates.
- GitHub Actions quality workflow for pull requests and refactor/development pushes with minimal `contents: read` permission.
- Final architecture, script ownership, workflow, rollback, release checklist, and audit report documentation.

### Validation

```text
npm run verify
git diff --check
```

The final local run passed 187 HTML checks, 1,474 payload checks, 43 canonical project checks, 184 indexable route checks, Work interaction tests, security/hygiene checks, practical artifact budgets, and 12 Chrome EN/AR smoke routes. Supported generators were rerun and produced no output changes.

### Known risks / deferred work

- The export has a minimal package-lock with no declared dependencies; CI uses `npm ci` for the locked manifest.
- No fabricated Core Web Vitals, contrast score, or full WCAG conformance claim is made.
- Historical capture and migration scripts remain in `scripts/` and are documented as development/legacy tools; they are not deleted in this PR.
- GitHub Pages remains a static deployment and does not provide a server-side runtime safety net.

### Rollback

Use the non-destructive procedure in [docs/operations/rollback.md](rollback.md): revert the smallest affected commit, rerun `npm run verify`, and merge the rollback through protected-branch review.

Release recommendation: **READY FOR PR REVIEW**.
