# Repository Agent Guidance

This repository is the live static GitHub Pages export. Read
`PORTFOLIO_ENGINEERING_HANDOFF.md` and `PORTFOLIO_OPERATIONS_GUIDE.md` before making
production changes. Use `NEW_PROJECT_INTAKE_TEMPLATE.md` for project additions.
Read `docs/operations/pages-artifact.md` for publishing policy, package validation,
and the separately authorized Pages source transition.

- Do not assume the original Next.js source/build exists; it does not.
- Treat `data/projects.json` as the canonical Work metadata and ordering source.
- Create actual EN/AR static routes before regenerating `data/routes.json` and SEO.
- Preserve required `_next` CSS/fonts, `.nojekyll`, static route files, and payloads.
- Preserve the maintained source export. Excluding development files, archived
  payloads, or retired framework JavaScript from the Pages artifact does not
  authorize deleting them from the repository.
- Keep the publishing allowlist in `scripts/site-package.mjs` explicit. Preserve
  the six native runtime assets, real EN/AR routes, catalog/SEO, required CSS/fonts,
  and all tracked media in the supported media roots during this phase.
- Build only after dependency installation and source generation. The disposable
  artifact is `node_modules/.cache/pages/site`; its sibling manifest is not public.
- Do not edit minified `_next` chunks as source code.
- Keep EN/AR changes paired and test Arabic RTL explicitly.
- Preserve the 12-card Work shell and one eager/high first-image policy.
- Use selective thumbnail generation; do not regenerate all media without scope.
- Preserve lazy gallery previews and defer originals until full-view interaction.
- Do not reintroduce a broad `MutationObserver`, full-DOM scan, permanent
  `will-change`, or unconditional WebGL work.
- Do not commit credentials, local paths, private client data, or unsanitized
  screenshots.
- Preserve unrelated working-tree changes and stage only the task's files.
- Run `npm ci`, `npm run verify`, `npm run test:site-package`, `npm run build:site`,
  `npm run verify:site`, and `git diff --check`, then use a reviewed PR. Use
  `npm run check:site` to recheck package hashes, file selection, size, and references.
- Keep PR validation separate from deployment permission. The workflow uploads and
  deploys only verified `main` artifacts when Pages is already in `workflow` mode;
  do not enable Pages or change its publishing source implicitly.
- Do not merge or deploy unless the user explicitly requests that operation.
