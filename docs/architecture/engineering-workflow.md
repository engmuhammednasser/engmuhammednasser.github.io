# Engineering Workflow

This repository is a committed static export. Node 20 or newer is required; the current package has no runtime or development dependencies and has a minimal committed lockfile.

## Local setup

```powershell
git clone <repository-url>
cd engmuhammednasser.github.io
npm ci --ignore-scripts --no-audit --no-fund
```

`npm ci` is intentionally lightweight today. Update `package-lock.json` with the package manifest if dependencies are added; do not use broad upgrades as part of content work.

## Validation commands

Use the supported release command before review:

```powershell
npm run verify
```

It runs the complete static/data/image/runtime/Work/SEO/security/budget/browser gate, the supported generator idempotency test, and `git diff --check`. For a faster non-idempotency pass use `npm run check`; for focused checks use `npm run test:work`, `npm run test:browser`, `npm run check:security`, or `npm run check:budgets`.

The browser check requires Chrome, Chromium, or Edge. Set `CHROME_PATH` when the executable is not on PATH. The test uses the dependency-free `scripts/serve.mjs`, covers representative EN/AR routes, and reports clear browser runtime/console error patterns where Chromium exposes them.

## Updating a project

1. Edit the matching record in `data/projects.json`; keep the same `id`/`slug`, localized title/description/eyebrow, category, case-study routes, technologies, thumbnail paths, and live URL rules.
2. Add or replace committed project media and optimized variants using the image workflow below.
3. Run `npm run filter:work` to render the EN/AR Work archive and no-JavaScript payload routes.
4. Run `npm run seo:apply` to refresh route metadata and crawl assets.
5. Run `npm run verify` and review the generated HTML/data diff.

## Adding a project

Use the historical import/case-study tools only as local authoring helpers. The release source of truth is still a reviewed `data/projects.json` record plus committed localized case-study routes. Confirm the new slug is unique, both localized case-study routes exist, the category is canonical, the live URL is `http`/`https` or `null`, and all image paths resolve. Then run the same Work/SEO/verify sequence.

## Updating SEO or accessibility

Route-specific metadata is derived from `data/routes.json`, visible page content, and the project record. Run:

```powershell
npm run seo:inventory
npm run seo:apply
npm run verify
```

Keep one meaningful `h1`, a logical heading sequence, localized `lang`/`dir`, a labelled navigation landmark, the `#main-content` skip target, reciprocal EN/AR hreflang, canonical URLs, route-specific OG URLs, and valid JSON-LD. Do not add fabricated performance or WCAG claims to audit documents.

## Images and generated assets

Original project media and optimized variants are committed release assets. Use `npm run images:normalize` for controlled markup normalization and `npm run images:thumbnails -- --projects <slug>` when image tooling is available. Review every output; these maintenance mutators are not part of `npm run verify` because they can touch many exported pages. `npm run audit:assets` produces audit documentation and is development-only.

The generated asset policy is simple: commit production files that GitHub Pages serves (`data/routes.json`, optimized manifests/variants, `sitemap.xml`, `robots.txt`, static HTML); ignore only local captures, traces, logs, caches, and test output. Never broadly ignore or delete historical project screenshots.

## Browser checks

```powershell
npm run test:browser
```

The representative routes include `/`, `/work/`, `/ar/`, `/ar/work/`, About, Services, Lab, Backend, and EN/AR case studies. The static gate separately covers all route references and 184 indexable metadata records. Manual review should tab from the skip link through navigation, operate Work filters and Load More, check both language directions, and inspect the browser console for errors.

## Release flow

1. Work only on a refactor/development branch; do not merge or rewrite `main` locally.
2. Review `git diff --check`, generated data, route deletions, binary changes, and local-path scans.
3. Run `npm run verify` with a supported browser.
4. Complete [release-checklist.md](../operations/release-checklist.md).
5. Use [pr-draft.md](../operations/pr-draft.md) to open the review request.
6. After review/approval, merge through the repository’s normal protected-branch process and monitor the static deployment.

## Troubleshooting

- **No browser found:** install Chrome/Chromium/Edge or set `CHROME_PATH` to the executable.
- **Port already in use:** stop the process on port `38123`, then rerun `npm run test:browser`.
- **Missing local reference:** run `npm run check:static` and correct the source path; do not mask it in the checker.
- **Work output changes on idempotency:** inspect the first generator diff, confirm data ordering and newline normalization, then rerun the explicit generator and review the result.
- **SEO inventory changes:** review `data/routes.json`, canonical/hreflang targets, and `sitemap.xml` together.
- **Image tool unavailable:** keep the source media, document the deferred optimization, and do not fabricate generated dimensions or budgets.
