# Muhammed Nasser Portfolio

Static portfolio published by GitHub Pages from the root of `main`:
<https://engmuhammednasser.github.io/>.

The repository contains the deployed static export. The original Next.js
application source/build configuration is unavailable, so tracked HTML, payloads,
compiled assets, canonical data, and repository-owned generators are production
artifacts—not a disposable build directory.

## Documentation

- [`PORTFOLIO_ENGINEERING_HANDOFF.md`](PORTFOLIO_ENGINEERING_HANDOFF.md) — current
  architecture, inventory, Sprint history, PR #1–#8 history, and accepted risks.
- [`PORTFOLIO_OPERATIONS_GUIDE.md`](PORTFOLIO_OPERATIONS_GUIDE.md) — maintenance,
  project, media, SEO, validation, release, and rollback workflow.
- [`NEW_PROJECT_INTAKE_TEMPLATE.md`](NEW_PROJECT_INTAKE_TEMPLATE.md) — required
  content, privacy, media, localization, and acceptance inputs for a new project.

## Local use

Requirements: Node.js 20+ and Chrome/Chromium/Edge. ImageMagick 7 is additionally
required for media generation.

```bash
npm ci
npm start
```

The local site is served at <http://127.0.0.1:3000/>.

## Validation

```bash
npm run verify
git diff --check
```

Use focused branches and pull requests. Do not merge or deploy without explicit
authorization.
