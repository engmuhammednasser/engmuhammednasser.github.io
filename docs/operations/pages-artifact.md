# GitHub Pages artifact publishing

The repository remains the maintained static export and its supporting tooling.
`npm run build:site` makes a separate publishing copy; it does not rebuild the
missing Next.js application, rewrite source pages, or remove historical assets.

## Current state and activation boundary

At preparation of this change, Pages uses **Deploy from a branch**, `main`, `/`
(`build_type: legacy`). HTTPS is enforced, and the `github-pages` environment permits
deployments from `main`. Preparing or merging the workflow does not change these
settings. While legacy publishing remains selected, the repository root remains
public and the exclusions below are not yet a production guarantee.

The `Portfolio quality` workflow runs on pull requests, pushes to `main`, and manual
dispatches. It retains the `verify` job, validates source, tests the packager, builds
the publishing directory, and validates that exact copy. Only a non-PR run on
`main` reads the current Pages mode. It uploads and deploys only when the mode is
already `workflow`; `legacy` skips both steps. API failures or an unknown mode fail
the check. PRs never upload a Pages artifact or deploy.

The deployment job depends on successful verification, uses the `github-pages`
environment, and receives only `pages: write` and `id-token: write`. The verification
job has `contents: read` and `pages: read`. Runs for the same ref are serialized
without cancelling an active run. The upload preserves hidden files so `.nojekyll`
survives; its input is the curated directory, never repository root.

## Publishing policy

`scripts/site-package.mjs` owns the allowlist. It selects Git-tracked paths and copies
their current working-tree bytes. New routes and media must be tracked before they
can enter the package. Review the selected files and all intended source changes
before committing; packaging does not commit or stage anything.

| Included in the publishing copy | Reason |
| --- | --- |
| Supported root, EN/AR route, and error-page HTML | Complete static pages and direct navigation |
| `.nojekyll`, `robots.txt`, `sitemap.xml` | Static hosting and public SEO output |
| `data/projects.json` | Work filtering and Load More catalog |
| Required `_next/static/chunks/*.css` and `_next/static/media/*.woff2` | Existing compiled styles and fonts |
| Approved root profile, favicon, and icon files | Existing page and browser assets |
| Tracked images under `projects/`, `plugins/`, `backend/`, `images/`, `logos/`, and `_next/static/media/` | Originals, previews, variants, and historical captures are retained in this phase |
| The six runtime assets listed below | Native interactions and their styles |

The six runtime assets are four JavaScript files and two stylesheets:

- `scripts/portfolio-effects.js`
- `scripts/portfolio-effects.css`
- `scripts/mobile-navigation.js`
- `scripts/case-study-screenshots.js`
- `scripts/work-archive.js`
- `scripts/torathyat-case-study.css`

Documentation, `.github`, package manifests/lockfiles, generators, capture tools,
tests, development data/manifests, route RSC `.txt` payloads, and retired `_next`
JavaScript are excluded **from the publishing copy only**. They remain available
for maintenance, generation, investigation, and rollback. This phase does not
prune unused images or regenerate media. A future asset or route family needs an
explicit policy update and validation; do not replace the allowlist with a broad
directory copy to bypass a missing-reference failure.

## Build and verify

Use the following sequence, completing any approved source generation after
`npm ci` and before `npm run verify`:

```sh
npm ci
npm run verify
npm run test:site-package
npm run build:site
npm run verify:site
npm run check:site
git diff --check
```

Install dependencies before running generators that need them. `npm ci` replaces
`node_modules` and therefore removes an earlier package; always build again after
installing dependencies or changing source. If `verify` reports generator drift,
review and fix that source/output drift before rebuilding the package.

The output is `node_modules/.cache/pages/site`. Its sibling
`node_modules/.cache/pages/manifest.json` records the selected paths and total bytes
and is not uploaded. Both are disposable, ignored local outputs. The builder uses
a temporary directory, checks the copy, and replaces only recognized generated
output. It rejects unsafe paths and links rather than following them outside the
workspace.

`test:site-package` exercises selection and failure cases using isolated fixtures.
`check:site` compares the full package file set with policy, recomputes SHA-256
against source bytes, rejects links and extra files, checks the size limit, and
validates local HTML/CSS/catalog references. A check failure requires rebuilding or
fixing the source/policy, not editing the package by hand.

`verify:site` includes package checks and browser validation served from the package,
so source-root files cannot mask missing published dependencies. It covers the
existing EN/AR, responsive, accessibility, navigation, Work, gallery, and runtime
checks. Browser validation requires Chrome, Chromium, or Edge; set `CHROME_PATH`
when needed. Source generator/idempotency checks remain part of `npm run verify`.

The published site must stay below GitHub Pages' 1 GB limit. The package enforces
a conservative 1,000,000,000-byte ceiling on file contents. Record measured package
size for a release; do not infer a browser speed improvement from fewer publishing
files. No production or package metrics are established by this document.

### Preview the exact package

From repository root in PowerShell:

```powershell
$env:SITE_ROOT = "node_modules/.cache/pages/site"
npm start
```

After stopping the server, clear the preview override before returning to source
maintenance:

```powershell
Remove-Item Env:SITE_ROOT
```

In a POSIX shell:

```sh
SITE_ROOT=node_modules/.cache/pages/site npm start
```

Open <http://127.0.0.1:3000/>. Without `SITE_ROOT`, the server uses the repository
root. The artifact browser gate sets its own root; manually exporting the variable
is not required for `npm run verify:site`.

## Authorized production transition

1. Complete the [release checklist](release-checklist.md), review the PR and exact
   head SHA, and merge only with explicit authorization. Record the known-good
   production SHA and current Pages source, HTTPS/custom-domain configuration, and
   environment restrictions.
2. Confirm the prepared workflow has passed on the intended `main` commit. The
   deployment steps should still be skipped while Pages uses `legacy` mode.
3. With explicit production authorization, open repository **Settings → Pages →
   Build and deployment → Source** and select **GitHub Actions**. Preserve HTTPS,
   any custom domain, and the `github-pages` environment's `main` restriction. Do
   not add a second generated workflow; this repository already has one.
4. In **Actions → Portfolio quality → Run workflow**, select `main`. Wait for both
   verification and deployment, and match the deployed SHA to the reviewed commit.
5. Cold-load `/`, `/work/`, `/ar/`, `/ar/work/`, and an EN/AR case-study pair. Check
   styling/fonts, RTL, mobile menu, Work filters/Load More, gallery preview/full
   view, keyboard behavior, `sitemap.xml`, and `robots.txt`.
6. Verify development paths such as `/package.json`, `/README.md`,
   `/data/routes.json`, and `/scripts/site-package.mjs` return HTTP 404. Check a
   known archived payload path and retired framework-JavaScript path as well.
   Required runtime assets, CSS/fonts, catalog, images, and originals must still
   return successful responses with appropriate content types.
7. Record deployment URL/SHA, results, and package size. Future authorized `main`
   releases use the same validation and artifact deployment path automatically.

This procedure is an activation guide, not authorization to change production.
Until it is executed and verified, report the work as prepared rather than live.

## Rollback

For an initial transition failure, the preserved source root provides a fallback.
Wait for any active artifact deployment to finish, or cancel it with authorization,
before changing the source; a run that already passed the mode check can still be
in progress. With explicit authorization, select **Settings → Pages → Build and deployment →
Source → Deploy from a branch**, choose **main** and **/(root)**, and save. Trigger
or rerun the legacy Pages build as needed, then confirm a successful deployment
for the intended SHA and repeat the live checks. The workflow's guard will skip
artifact deployment once Pages reports `legacy` again.

Legacy fallback publishes the repository root again, including development files
that the curated artifact excludes. Treat this as a documented temporary rollback,
not evidence that artifact exclusions are still active. For content regressions,
use the reviewed revert procedure in [rollback.md](rollback.md), retain all required
source/generated files, and rebuild the corrected package. Never reset or
force-push `main` to roll back a deployment.

## GitHub references

- [Custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Configuring the publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
