# Repository Agent Guidance

This repository is the live static GitHub Pages export. Read
`PORTFOLIO_ENGINEERING_HANDOFF.md` and `PORTFOLIO_OPERATIONS_GUIDE.md` before making
production changes. Use `NEW_PROJECT_INTAKE_TEMPLATE.md` for project additions.

- Do not assume the original Next.js source/build exists; it does not.
- Treat `data/projects.json` as the canonical Work metadata and ordering source.
- Create actual EN/AR static routes before regenerating `data/routes.json` and SEO.
- Preserve required `_next` CSS/fonts, `.nojekyll`, static route files, and payloads.
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
- Run `npm ci`, `npm run verify`, and `git diff --check`, then use a reviewed PR.
- Do not merge or deploy unless the user explicitly requests that operation.
