# Release Checklist

Current baseline when this checklist was updated: `main`
`5b4560cacf1d7965058ec7a93fa610f04362f38d`, 44 projects, 188 route records,
186 indexable routes, and 12 initial Work cards. Approved changes may legitimately
increase inventory; update explicit invariants and current documentation rather than
forcing output back to these dated values.

## Source and scope

- [ ] Branch starts from current `origin/main` and has one focused purpose.
- [ ] Expected PR head SHA is recorded.
- [ ] `git status --short` contains only intended files plus separately preserved
  unrelated work.
- [ ] Every route/project deletion and binary addition/replacement is explained.
- [ ] No minified `_next` vendor chunk was edited as source code.
- [ ] Required `_next` CSS/fonts, `.nojekyll`, and deployed static route files remain.
- [ ] Source files excluded from the publishing artifact remain in the repository;
  this phase does not delete archived payloads, tools, or media.

## Data and generated output

- [ ] `data/projects.json` is the reviewed Work source of truth and validates.
- [ ] Project order, category, featured state, availability, live URL, EN/AR routes,
  and thumbnail paths match the request.
- [ ] Work has exactly 12 initial cards and all canonical localized links once in
  `<noscript>`.
- [ ] Only the first canonical Work image is eager/high; all other Work images are
  lazy and unprioritized.
- [ ] New/changed thumbnails have valid 480/800 AVIF and WebP files, manifest,
  dimensions, crop, and byte policy.
- [ ] `data/routes.json` matches actual route files; EN/AR counterparts are correct.
- [ ] Sitemap contains exactly the indexable canonical routes and robots retains the
  two intended utility exclusions.
- [ ] Generated output was reviewed for unrelated changes and is idempotent.

## Content, privacy, and accessibility

- [ ] EN and AR facts are equivalent and Arabic RTL was reviewed.
- [ ] Client/project claims, role, stack, and live/demo status are accurate.
- [ ] Screenshot pixels contain no unapproved personal data, credentials, internal
  metrics, local paths, browser chrome, or other private material.
- [ ] Informative images have meaningful localized alt text; decorative images use
  empty alt.
- [ ] One `h1`, one `main#main-content`, skip link, labelled navigation, logical
  headings, and safe external links are preserved.
- [ ] Mobile menu, Work filters/Load More, and any gallery/lightbox are keyboard
  usable and restore focus correctly.

## SEO and media delivery

- [ ] Every indexable route has one self-canonical, route-specific social metadata,
  valid JSON-LD, and reciprocal EN/AR hreflang with English `x-default`.
- [ ] New routes appear once in `sitemap.xml`; utility routes remain noindex.
- [ ] Required CSS loads on a cold direct navigation with HTTP 200 and `text/css`.
- [ ] Full originals are absent from initial Work/gallery requests unless explicitly
  justified as the single hero source.
- [ ] Gallery previews are optimized/lazy and originals load only on full-view
  interaction.
- [ ] No broad `MutationObserver`, full-DOM scan, permanent `will-change`, or
  unconditional WebGL work was introduced.

## Quality gates

```bash
npm ci
npm run verify
npm run test:site-package
npm run build:site
npm run verify:site
npm run check:site
git diff --check
```

- [ ] All commands pass on the final commit.
- [ ] Dependency installation and source generation finish before the final
  `build:site`; no `npm ci` or source edits invalidate the tested package afterward.
- [ ] `node_modules/.cache/pages/site` contains exactly the policy-selected files,
  matches source bytes, and passes local-reference and size checks. Record its
  measured file count and bytes; keep the sibling manifest outside the upload.
- [ ] Browser checks run against the publishing directory, not only repository root.
- [ ] Browser smoke covers EN/AR home and Work plus affected case-study routes.
- [ ] Cold direct navigation verifies styling, crop, RTL, overflow, network requests,
  and console output.
- [ ] No browser runtime exception is accepted; retired framework hydration is not
  reintroduced to make archived payloads appear necessary.
- [ ] No real-user Core Web Vitals claim is made without field data.

## Pull request

- [ ] PR base is `main`; branch and head SHA match the reviewed commit.
- [ ] PR description distinguishes source edits, generated output, binaries, known
  accepted risks, and manual production acceptance.
- [ ] `Portfolio quality` is passing at the reviewed head SHA.
- [ ] Head has not changed since final review.
- [ ] Merge strategy and deployment are explicitly authorized; this checklist alone
  does not authorize a merge.

## Deployment and production

- [ ] Pages source mode is recorded. In `legacy` mode, `main:/` still publishes and
  artifact upload/deployment is intentionally skipped; exclusions are not live yet.
- [ ] If activating artifact publishing, follow [pages-artifact.md](pages-artifact.md)
  after reviewed merge and explicit authorization: select **GitHub Actions**, retain
  the `github-pages` environment restriction to `main`, then manually run
  **Portfolio quality** on the reviewed `main` commit.
- [ ] GitHub Pages deployment passes and deployed SHA equals new `main`.
- [ ] Production URL remains <https://engmuhammednasser.github.io/>.
- [ ] EN/AR affected routes pass a cold/incognito direct navigation.
- [ ] Work placement, filters, Load More, optimized requests, and duplicate safety
  pass in production.
- [ ] One existing case study and representative Work cards show no regression.
- [ ] `sitemap.xml` and `robots.txt` return the intended production content.
- [ ] In artifact mode, representative documentation, tooling, development-data,
  archived-payload, and retired-JavaScript URLs return HTTP 404. Required runtime,
  CSS/font, catalog, media, and original-image URLs remain available.
- [ ] Local `main` is fast-forwarded to deployed `main` and `npm run verify` still
  passes; its rebuilt artifact also passes `npm run verify:site`.
- [ ] Prior known-good SHA and rollback owner are recorded; use the non-destructive
  procedure in [rollback.md](rollback.md) if needed.
