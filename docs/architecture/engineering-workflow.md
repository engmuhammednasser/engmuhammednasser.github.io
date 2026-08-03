# Engineering Workflow

Status: current operational summary at `main`
`5b4560cacf1d7965058ec7a93fa610f04362f38d`.

The complete procedure is maintained in
[`PORTFOLIO_OPERATIONS_GUIDE.md`](../../PORTFOLIO_OPERATIONS_GUIDE.md). This file is
the short architecture-level entry point.

## Model

The repository is a committed static export deployed by GitHub Pages from the root
of `main`. The original Next.js application source/build configuration is absent.
Tracked HTML, payloads, compiled assets, canonical data, and repository-owned
generators are production artifacts and must not be deleted as disposable build
output.

## Setup and branch

```bash
git checkout main
git pull --ff-only origin main
git checkout -b <focused-branch>
npm ci
```

Preserve unrelated working-tree files. Edit the narrowest current source of truth,
regenerate only its owned outputs, and review the complete diff.

## Project maintenance

- Work metadata/order: edit `data/projects.json`, then run `npm run filter:work`.
- Generic thumbnails: first render the project with its original, run
  `npm run images:thumbnails -- --projects <slug>`, add the generated variant paths
  to project data, and render Work again.
- Case studies: maintain a complete EN/AR static route pair. Use a route-specific
  generator only when it demonstrably owns that route; no universal case-study
  generator exists.
- New routes: create HTML first, run `npm run seo:inventory`, then
  `npm run seo:apply` and `npm run mobile:apply`.
- Update the explicit mobile eligible-page assertion when an approved route pair
  changes that inventory; do not weaken the assertion.

Use [`NEW_PROJECT_INTAKE_TEMPLATE.md`](../../NEW_PROJECT_INTAKE_TEMPLATE.md) before
adding a project.

## Invariants

- EN and AR are paired; Arabic is reviewed in RTL.
- Work starts with 12 active cards and exposes all localized case links in
  `<noscript>`.
- Only the first canonical Work image is eager/high priority.
- Work cards use bounded 480/800 AVIF with WebP fallback when variants exist.
- Gallery previews are lazy; full originals are deferred until interaction.
- Canonical, hreflang, social metadata, JSON-LD, sitemap, and robots match real
  routes.
- Each HTML file has one marked effects stylesheet/script and preserves runtime
  lifecycle/capability gates.
- Mobile navigation remains independent of the known compiled hydration failure.
- Required `_next` CSS/font files and `.nojekyll` remain intact.
- No broad `MutationObserver`, full-document class scan, permanent `will-change`,
  unsafe external target, local path, secret, or unsanitized private data is added.

## Validation

```bash
npm run verify
git diff --check
```

`npm run verify` runs the static, data, image, runtime, Work, SEO/accessibility,
security, budget, browser, mobile, idempotency, and whitespace gates. Chrome,
Chromium, or Edge is required; set `CHROME_PATH` when needed.

Manual review still owns cold direct-route styling, visual crops, RTL, horizontal
overflow, network/MIME behavior, gallery deferral, and production verification.

## Release

1. Confirm only intended files changed.
2. Complete [`release-checklist.md`](../operations/release-checklist.md).
3. Push the focused branch and open a PR against `main`.
4. Verify the exact PR head SHA and passing `Portfolio quality` check.
5. Merge/deploy only with explicit approval.
6. Confirm Pages deployed the new `main` SHA and perform cold EN/AR production
   checks.

Rollback uses a reviewed `git revert`, never a destructive reset. See
[`rollback.md`](../operations/rollback.md).
