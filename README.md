# Muhammed Nasser Portfolio

Static portfolio hosted by GitHub Pages:
<https://engmuhammednasser.github.io/>.

Publishing currently uses the root of `main` (`legacy` mode). A curated Pages
artifact and guarded Actions deployment are prepared; they become the production
path only after an explicitly authorized publishing-source switch. See the
[Pages artifact runbook](docs/operations/pages-artifact.md).

The repository contains the deployed static export. The original Next.js
application source/build configuration is unavailable, so tracked HTML, payloads,
compiled assets, canonical data, and repository-owned generators remain maintained
project files. Only the staged publishing copy is disposable.

## Documentation

- [`PORTFOLIO_ENGINEERING_HANDOFF.md`](PORTFOLIO_ENGINEERING_HANDOFF.md) — current
  architecture, inventory, Sprint history, PR #1–#8 history, and accepted risks.
- [`PORTFOLIO_OPERATIONS_GUIDE.md`](PORTFOLIO_OPERATIONS_GUIDE.md) — maintenance,
  project, media, SEO, validation, release, and rollback workflow.
- [`NEW_PROJECT_INTAKE_TEMPLATE.md`](NEW_PROJECT_INTAKE_TEMPLATE.md) — required
  content, privacy, media, localization, and acceptance inputs for a new project.
- [`docs/operations/pages-artifact.md`](docs/operations/pages-artifact.md) — what
  ships, artifact validation, activation, and publishing-source rollback.

## Local use

Requirements: Node.js 20.9+ and Chrome/Chromium/Edge. Responsive previews and generic
Work thumbnails use the locked Sharp dependency. Specialized legacy media
generators additionally require ImageMagick 7.

Pages use maintained native JavaScript controllers, with compiled CSS/fonts
preserved and obsolete framework hydration retired. See
[`docs/operations/static-runtime.md`](docs/operations/static-runtime.md) for image
generation, standalone runtime normalization and strict browser validation.

```bash
npm ci
npm start
```

The local site is served at <http://127.0.0.1:3000/>.

## Validation

```bash
npm ci
npm run verify
npm run test:site-package
npm run build:site
npm run verify:site
npm run check:site
git diff --check
```

`build:site` copies the tracked public file set to
`node_modules/.cache/pages/site`; it preserves the maintained source export.
Documentation, generators, tests, development data, archived route payloads, and
retired framework JavaScript stay in the repository but are excluded from this
publishing directory. All tracked image media in the supported media directories,
including originals and older captures, is retained in this phase.

`verify:site` checks the packaged bytes/references and runs browser validation
against that directory. `check:site` is the quicker file-set, SHA-256 comparison,
size, and local-reference check. Install dependencies and finish source generation
before packaging: `npm ci` clears the cached artifact. To preview the package, set
`SITE_ROOT=node_modules/.cache/pages/site` for `npm start`; see the runbook for
PowerShell and shell examples.

Use focused branches and pull requests. Do not merge or deploy without explicit
authorization.
