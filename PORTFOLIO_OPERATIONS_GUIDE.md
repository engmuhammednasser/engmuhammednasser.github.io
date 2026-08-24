# Muhammed Nasser Portfolio — Operations Guide

> **READ THIS BEFORE MODIFYING THE PORTFOLIO.** Production is live, the checked-in
> static export is part of the maintained system, and source-of-truth ownership must
> be identified before any generated file is changed.

Status: current at `main` commit `5b4560cacf1d7965058ec7a93fa610f04362f38d`

Production: <https://engmuhammednasser.github.io/>
Companion history: `PORTFOLIO_ENGINEERING_HANDOFF.md`

This is the practical guide for maintaining the checked-in portfolio export. It
describes the repository that exists now; it does not assume the missing original
Next.js application can be rebuilt.

## 1. Current Portfolio Architecture

GitHub Pages deploys the repository root of `main`. Production pages are therefore
tracked artifacts, not an output directory that can be deleted and recreated from a
framework command.

```text
checked-in generated/static site output
        + canonical project data + real route files
        ↓
deterministic Node.js rendering and post-processing
        ↓
static HTML + selected exported payload updates
        ↓
route inventory + SEO/accessibility + sitemap/robots
        ↓
native mobile navigation + guarded decorative runtime
        ↓
static checks + browser tests + idempotency
        ↓
pull request quality gate
        ↓
GitHub Pages from main:/
```

The complete original Next.js source and build configuration are not present.
Generated output plus deterministic repository-owned generators are therefore part
of the maintained architecture. Do not casually replace this lifecycle with a new
framework application.

Use this order of authority:

1. Current tracked data, scripts, route files, and manifests.
2. This guide and the current engineering handoff.
3. Historical Sprint and PR reports for evidence about a past state.

If a historical count conflicts with current data, recompute it. Do not “correct”
current output back to a Sprint-era number.

## 2. Prerequisites

- Git and GitHub CLI (`gh`) authenticated to the repository.
- Node.js 20 or newer.
- Chrome, Chromium, Edge, or `CHROME_PATH` for browser checks.
- ImageMagick 7 (`magick`) only when generating thumbnails or project media.
- A clean, current branch based on `origin/main`.

Initial setup:

```bash
git checkout main
git pull --ff-only origin main
npm ci
npm run verify
```

On Windows, CRLF working-tree files are supported. The idempotency check normalizes
CRLF to LF before hashing UTF-8 text, so semantic generator changes still fail while
line-ending-only differences do not.

## 3. Git and scope discipline

Create a focused branch from current production:

```bash
git checkout main
git pull --ff-only origin main
git checkout -b content/<project-slug>
```

Before editing, record and preserve unrelated work:

```bash
git status --short
git rev-parse HEAD
```

Do not stage untracked files you did not create for the task. Do not use destructive
reset/checkout commands to clean a shared worktree. Use one intentional commit or a
small, coherent series, push the branch, and open a pull request. Do not bypass the
PR because the repository workflow is the reliable trigger for `Portfolio quality`.

## 4. Repository map

```text
.
├── index.html, ar/index.html, ...        deployed static routes
├── work/ and ar/work/                    Work archives and case studies
├── backend/, lab/, about/, ...           other static route families
├── _next/                                compiled CSS/fonts/vendor assets
├── data/
│   ├── projects.json                     canonical Work data and order
│   ├── routes.json                       generated route/SEO inventory
│   └── mariam-fathy-gallery.json         Mariam-only gallery mapping
├── projects/<slug>/                      original and optimized project media
├── scripts/
│   ├── render-work-archive.mjs           deterministic Work renderer
│   ├── work-card-template.mjs            Work card/filter markup
│   ├── work-archive.js                   Work filter/Load More runtime
│   ├── generate-project-thumbnails.mjs   selective generic thumbnail pipeline
│   ├── inventory-seo-accessibility.mjs   route inventory generator
│   ├── apply-seo-accessibility.mjs       metadata/semantic transformation
│   ├── generate-seo-assets.mjs           sitemap/robots generator
│   ├── apply-mobile-navigation.mjs       stable menu-hook transformer
│   ├── mobile-navigation.js              native mobile menu controller
│   └── portfolio-effects.{js,css}        guarded decorative runtime
├── docs/                                 architecture, audit, and operations records
├── sitemap.xml and robots.txt            generated public SEO assets
└── .github/workflows/quality.yml          pull-request quality gate
```

The root `.nojekyll` file is required for GitHub Pages to serve `_next` assets.

## 5. Source-of-truth table

| Concern | Source of truth | Generated output | Editing rule |
| --- | --- | --- | --- |
| Projects | `data/projects.json` | Project cards, localized Work links, and project-derived SEO fields | Change the canonical record and order, then render; do not duplicate metadata in Work HTML. |
| Routes | Actual tracked `index.html` files | `data/routes.json` from `inventory-seo-accessibility.mjs` | Create/remove the real route first; inventory does not create routes. |
| Work archive | Project data plus `work-card-template.mjs`, `render-work-archive.mjs`, and `work-archive.js` | Six EN/AR Work HTML/payload files and client filter/Load More behavior | Run `npm run filter:work`; do not patch the six outputs as independent sources. |
| Project images | Original files under `projects/<slug>/`, thumbnail generator, and per-project manifest | 480/800 AVIF/WebP Work derivatives | Generate selected slugs, inspect visually, retain originals, and then update project data. |
| Case-study screenshots | Approved/sanitized originals plus the route's explicit mapping or generator | Lazy previews and interaction-deferred full-view targets | Keep captions, locale, ordering, privacy classification, and preview/original roles explicit. |
| SEO | Route HTML/visible copy, project data, route inventory, and SEO scripts | Titles, descriptions, canonical, hreflang, social tags, JSON-LD, and semantics in HTML | Inventory new routes first; fix inputs/generator rather than patching repeated tags. |
| Sitemap | Indexable records in `data/routes.json` and `generate-seo-assets.mjs` | `sitemap.xml` | Generate; do not add nonexistent, utility, query, or fabricated-date URLs manually. |
| Robots | `generate-seo-assets.mjs` policy | `robots.txt` | Preserve public allow, utility exclusions, and production sitemap URL. |
| Mobile navigation | Stable HTML hooks, `apply-mobile-navigation.mjs`, and `mobile-navigation.js` | Native fallback hooks/runtime on eligible pages | Preserve LTR/RTL, focus, inert, overlay, and keyboard behavior; never fix it in minified vendor chunks. |
| Portfolio effects | `portfolio-effects.js` and `portfolio-effects.css` | One marked style/script reference per HTML page | Preserve capability/lifecycle/DOM-scope gates and static fallback. |
| Mariam gallery | `data/mariam-fathy-gallery.json` and approved originals | 41 mapped preview/full-view items in EN/AR case studies | Use the specialized mapping; do not treat directory enumeration as gallery order. |
| Mariam media | `generate-mariam-fathy-media.mjs`, its source files, and `media-manifest.json` | Six responsive hero files and 41 WebP previews | Keep this project-specific pipeline separate from generic Work thumbnails. |
| CI | `.github/workflows/quality.yml` and `package.json` scripts | `Portfolio quality` PR check | Keep least privilege and PR validation; a direct push is not a substitute. |

Some legacy scripts under `scripts/` were one-time migration/capture tools. Their
presence does not make them the current source of truth. In particular,
`extract-work-project-data.mjs` contains the historical 43-card assertion and must
not be used for current Work maintenance.

## 6. Canonical Work data

`data/projects.json` has schema version 1. Project array order is production Work
order. A project has this effective shape:

```json
{
  "id": "project-slug",
  "slug": "project-slug",
  "category": "ecommerce",
  "featured": false,
  "title": { "en": "English title", "ar": "العنوان العربي" },
  "description": { "en": "English summary", "ar": "الملخص العربي" },
  "eyebrow": { "en": "Laravel / E-Commerce", "ar": "Laravel / التجارة الإلكترونية" },
  "technologies": ["Laravel", "PHP"],
  "thumbnail": {
    "original": "/projects/project-slug/cover.png",
    "avif480": "/projects/project-slug/optimized/thumb-480.avif",
    "avif800": "/projects/project-slug/optimized/thumb-800.avif",
    "webp480": "/projects/project-slug/optimized/thumb-480.webp",
    "webp800": "/projects/project-slug/optimized/thumb-800.webp",
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.7777777778
  },
  "caseStudy": {
    "en": "/work/project-slug/",
    "ar": "/ar/work/project-slug/"
  },
  "liveUrl": "https://example.com/",
  "availability": "case-study+live",
  "status": "published"
}
```

Rules enforced by `scripts/validate-project-data.mjs`:

- `id` and `slug` are equal and unique.
- Category is one of `ecommerce`, `corporate`, `services`, or `platforms`.
- EN and AR title, description, and eyebrow are non-empty.
- Case-study paths are exactly `/work/<slug>/` and `/ar/work/<slug>/`.
- Thumbnail paths are root-relative, exist, and declared dimensions are valid.
- `liveUrl`, when present, is HTTP(S).
- `availability` is `case-study+live` when `liveUrl` exists and `case-study`
  otherwise.
- Status is currently `published` for production entries.

The renderer shows exactly the first 12 projects initially. The first canonical
project is the only Work image marked `loading="eager"` and
`fetchpriority="high"`; all other cards, including cards inserted through filtering
or Load More, are lazy and unprioritized.

`featured` is validated/stored project metadata, but the current Work renderer and
filter runtime do not reorder or visually promote a card because it is true. Array
position remains the visible order. Do not describe `featured` as an automatic
homepage/Work-placement control unless current code is changed and reviewed.

### Remaining explicit counts

- `12` is an intentional Work performance/interaction contract repeated in the
  renderer, browser runtime, validators, budgets, and tests. Adding project #45 does
  not change it.
- `186` is the current eligible-page assertion in
  `scripts/apply-mobile-navigation.mjs`. A new bilingual case-study pair normally
  changes it to 188 after the two real route files exist.
- `scripts/test-seo-browser.mjs` has a fixed 12-route representative smoke list. It
  is not the full route inventory; add a new route to that list only when its risk
  warrants permanent representative coverage, and always perform the manual new
  EN/AR route check.
- The `43` assertion in `scripts/extract-work-project-data.mjs` belongs to the
  historical extraction utility. It is not a current project-count invariant and
  must not be updated or run for routine additions.

All canonical project totals, no-JavaScript link totals, SEO route totals, and
sitemap totals otherwise derive from current data/inventory and should increase
automatically when project #45 and its route pair are added correctly.

## 7. How to Add a New Portfolio Project

Start by completing `NEW_PROJECT_INTAKE_TEMPLATE.md`. Do not import media or write
portfolio claims before asset ownership, privacy, live/demo state, and localized
copy are resolved.

### Step 1 — Decide scope and placement

Confirm:

- final lowercase kebab-case slug;
- category and exact position in the Work array;
- whether `featured` is true or false;
- whether the external URL is live, demo, private, or absent;
- EN and AR titles, descriptions, eyebrow labels, and case-study narrative;
- factual role and technologies;
- authorized, sanitized screenshot set;
- primary Work image, case-study hero, and gallery behavior.

Do not infer a client name, business metric, private admin record, or technology.

### Step 2 — Import and sanitize media

Place project-owned media below:

```text
projects/<slug>/
```

Use deterministic, descriptive lowercase names. Group large sets by purpose or
viewport, for example `dashboard/`, `desktop/en/`, `desktop/ar/`, `mobile/en/`, and
`mobile/ar/`. Keep filenames stable after publishing because the static pages and
manifests reference them directly.

Before commit:

- remove names, emails, phone numbers, addresses, tokens, order IDs, and other
  personal or credential-like data unless explicitly approved for publication;
- inspect the visible pixels, not only filenames or metadata;
- remove local filesystem paths and browser/tool artifacts;
- confirm orientation and dimensions;
- reject corrupt, duplicate, accidental, or irrelevant captures;
- confirm the user has publication rights.

### Step 3 — Add the minimal Work record

Add the project to `data/projects.json` at the approved position. For the first
render, set `thumbnail.original`, `width`, `height`, and `aspectRatio`; omit optimized
variant keys until their files exist. This avoids pointing the thumbnail generator
at nonexistent optimized output.

Validate and render the archive:

```bash
npm run work:data
npm run filter:work
```

The Work renderer updates exactly these six tracked outputs:

```text
work/index.html
work/index.txt
work/__next._full.txt
ar/work/index.html
ar/work/index.txt
ar/work/__next._full.txt
```

Review the generated diff. The new project may be outside the active first 12 but
must be present once in each locale's `<noscript>` list and in runtime data.

### Step 4 — Generate generic Work thumbnails

With ImageMagick available, run only the new slug:

```bash
npm run images:thumbnails -- --projects <slug>
```

This creates:

```text
projects/<slug>/optimized/thumb-480.avif
projects/<slug>/optimized/thumb-800.avif
projects/<slug>/optimized/thumb-480.webp
projects/<slug>/optimized/thumb-800.webp
projects/<slug>/optimized/manifest.json
```

The pipeline preserves aspect ratio, does not upscale, strips metadata, and targets
a maximum of 150,000 bytes per variant by reducing quality within its defined
limits. Inspect the derivatives visually; passing the byte budget does not prove a
useful crop.

Add the four generated paths to the project's thumbnail object, retain the original
path and measured original dimensions, then rerun:

```bash
npm run work:data
npm run filter:work
```

Do not run `--all` unless a deliberate full thumbnail regeneration was requested
and the large binary diff will be reviewed.

#### Case-study hero image policy

A dedicated case-study hero should use responsive AVIF with WebP fallback, explicit
dimensions or a stable aspect-ratio container, and a reviewed crop/anchor. Its
fallback and `srcset` candidates must represent the same intended image. Avoid a
second full-source request alongside the selected optimized candidate. Use preload,
eager loading, or high priority only when the route's actual above-the-fold hero is
the intended LCP image; these hints are not universal defaults.

Retain the approved source original unless deletion is separately authorized and
all Work, hero, gallery, lightbox, manifest, and rollback references have been
proven independent of it.

### Step 5 — Build the EN and AR case-study routes

Required route files:

```text
work/<slug>/index.html
ar/work/<slug>/index.html
```

There is no universal case-study generator. Use a current, visually verified route
of the same type as a structural reference, or create a focused route-specific
generator when repeatable media/gallery construction justifies it. Do not claim a
legacy one-off script owns a new route.

Use only the content sections that help explain the real project. A strong default
sequence is hero and positioning, concise summary/challenge, implemented solution,
verified role and technology stack, storefront/frontend, mobile behavior,
backend/dashboard when applicable, an intentional gallery, and an accurately
labelled live-site/demo CTA. Do not force a backend, dashboard, gallery, or metrics
section onto a project that does not have one.

Each route must preserve:

- the required compiled base stylesheet and fonts;
- one marked portfolio-effects stylesheet and script;
- the stable mobile-menu structure and native runtime;
- correct `lang` and `dir` (`en`/`ltr`, `ar`/`rtl`);
- one `h1`, one `main#main-content`, a skip link, labelled navigation, and a usable
  heading sequence;
- localized internal links and contact CTA;
- safe `target="_blank"` links with `rel="noopener noreferrer"`;
- explicit image dimensions or stable aspect-ratio containers;
- meaningful alt text for informative images and empty alt only for decorative
  images.

If a structural reference includes compiled Next payload scripts, either keep that
route family and all of its payload references internally consistent or produce a
complete standalone static page. Do not leave half-stripped framework markup. PR #5
proved that removing every `_next` head link can leave a route HTTP-healthy but
visually unstyled.

Directly open both routes from a cold browser context. Do not first visit another
portfolio route, because cached CSS can hide missing stylesheet references.

> **Production validation rule:** Route HTTP 200 plus automated tests are not
> enough. A generated, styled case study requires clean/cold visual inspection at
> desktop EN, desktop AR, mobile EN, and mobile AR, with its compiled CSS request
> confirmed successful.

### Step 6 — Add gallery behavior only when justified

The default project does not need a large gallery. When a gallery is part of the
approved case study:

- keep an explicit, reviewable mapping of originals to captions and locale groups;
- show bounded optimized previews, normally WebP, with `loading="lazy"` and
  `decoding="async"`;
- place the original URL in the full-view control rather than the initial image
  `src`;
- request an original only after click/full-view interaction;
- support keyboard activation, Escape close, focus behavior, useful labels, and
  non-scrolling background while open;
- never preload the gallery or prioritize its preview images.

For long screenshots, top alignment is normally required so the header/navigation
is visible. Inspect desktop, mobile, and AR crops; `object-fit` can hide the relevant
part without stretching the file.

### Step 7 — Inventory routes, apply SEO, and add mobile hooks

The new HTML files must exist before route inventory. Run in this order:

```bash
npm run seo:inventory
npm run seo:apply
```

The first command adds the new route records to `data/routes.json`. `seo:apply` then
uses that inventory to apply route-specific metadata and semantics, reinventories
the result, and regenerates `sitemap.xml` and `robots.txt`.

For each new bilingual pair, verify:

- exactly one non-empty title and description;
- self-canonical production URL;
- EN, AR, and English `x-default` hreflang;
- route-specific `og:url` and social fields;
- valid JSON-LD array with schema.org context and the current route URL;
- both routes are indexable and appear once in `sitemap.xml`;
- utility routes remain noindex and excluded from the sitemap.

Apply stable mobile-navigation hooks:

```bash
npm run mobile:apply
```

`scripts/apply-mobile-navigation.mjs` deliberately asserts the exact number of
eligible pages. At the current baseline that value is 186. A normal new EN/AR
case-study pair raises it by two; update `expectedPageCount` in the same project PR
to the newly verified eligible count. Do not weaken or delete the assertion merely
to make the command pass.

After the SEO/mobile transforms, review the route diff and rerun the transforms to
confirm no second-run change.

### Step 8 — Verify Work placement and behavior

Check `/work/` and `/ar/work/` at mobile and desktop widths:

- project appears in the exact approved order and only once;
- All and the selected category show it;
- category filtering resets to the first 12 matching projects;
- Load More reveals the next batch without duplicates;
- counts/status text are correct in both languages;
- Arabic card layout and labels remain RTL;
- if placement enters the first 12, the active shell changes intentionally;
- only the first canonical project is eager/high priority;
- Work uses optimized AVIF/WebP and does not request the full original initially.

### Step 9 — Run validation and inspect the diff

```bash
npm ci
npm run verify
git diff --check
git status --short
git diff --stat
git diff
```

`npm run verify` includes all static/data/image/runtime/SEO/security/budget checks,
the Work interaction harness, two mobile-navigation browser passes, SEO browser
smoke tests, idempotency, and `git diff --check`.

Use browser developer tools for claims the static gate cannot prove:

- cold direct EN/AR case-study styling;
- visual crop and distortion;
- RTL layout and horizontal overflow;
- filters, Load More, mobile menu, gallery, and lightbox;
- network status/MIME for required CSS;
- absence of initial original/gallery requests;
- absence of unexpected console errors.

The mobile test permits only the two documented compiled hydration exception
patterns. Any other runtime exception is a failure.

### Step 10 — Pull request and deployment

Commit only the scoped files, push, and open a PR against `main`. The PR description
should state:

- source-of-truth edits and generated outputs;
- EN/AR routes and screenshots reviewed;
- media count and optimization policy;
- SEO/sitemap impact;
- validation results and accepted risks;
- explicit confirmation that no unrelated routes or vendor chunks changed.

Before merge, confirm the PR head SHA and `Portfolio quality` status. After merge,
wait for `pages-build-deployment`, confirm its deployed SHA equals current `main`,
then perform cold production checks on the new EN/AR routes, Work archive, one
existing case study, CSS requests, media requests, mobile navigation, and RTL.

## 8. Mariam Fathy media model

Mariam is intentionally more complex than a generic Work project.

### Canonical pieces

- Work data: `data/projects.json`
- Work thumbnail original: `projects/mariam-fathy-shop/desktop/en/06-home.png`
- Generic Work variants: four `optimized/thumb-*` AVIF/WebP files and
  `optimized/manifest.json`
- Gallery mapping: `data/mariam-fathy-gallery.json`
- Specialized media generator: `scripts/generate-mariam-fathy-media.mjs`
- Specialized case generator: `scripts/generate-mariam-fathy-case-study.mjs`
- Media manifest: `projects/mariam-fathy-shop/media-manifest.json`

Current gallery inventory:

| Group | Originals | Initial preview policy |
| --- | ---: | --- |
| Dashboard | 9 | 960px WebP, lazy |
| Desktop | 16 (8 AR + 8 EN) | 960px WebP, lazy |
| Mobile | 16 (7 AR + 9 EN) | 480px WebP, lazy |
| Total | 41 | Original deferred until full-view interaction |

The case hero is a north-aligned 16:9 crop of the English homepage source and has
800/1200/1600 AVIF and WebP variants (six files). This hero model is separate from
the full-height Work thumbnail derivatives.

When changing Mariam media:

```bash
npm run media:mariam
npm run images:thumbnails -- --projects mariam-fathy-shop
npm run filter:work
```

When changing Mariam case-study copy or structure, edit its focused generator and
run it explicitly:

```bash
node scripts/generate-mariam-fathy-case-study.mjs
npm run seo:inventory
npm run seo:apply
npm run mobile:apply
```

Run only the commands owned by the requested change. For example, a gallery caption
change does not authorize regenerating Work thumbnails. Always inspect whether the
case generator preserved the required compiled stylesheet/font links; PR #5 was
caused by stripping them too broadly.

## 9. What the quality gate proves

`npm run check` runs:

- static local reference resolution across tracked HTML;
- Work data schema and Work generated-output consistency;
- image delivery and optimized-variant policy;
- effects lifecycle and DOM-scope invariants;
- Work interaction tests;
- SEO/accessibility and sitemap/robots integrity;
- security/hygiene checks for production text and runtime assets;
- practical byte budgets;
- SEO browser smoke tests;
- the mobile navigation browser suite on representative EN/AR routes.

`npm run verify` adds supported-generator idempotency and `git diff --check`.

It does **not** prove:

- a reproducible Next.js framework build;
- real-user Core Web Vitals;
- full visual correctness of every route/crop/viewport;
- legal permission to publish supplied media;
- absence of private data visible inside screenshots;
- behavior of every third-party live site.

Those require human review and, where applicable, production verification.

## 10. Rollback

Use the reviewed non-destructive procedure in `docs/operations/rollback.md`.
Operationally:

1. Record the failing production SHA, Pages deployment, affected EN/AR routes, and
   last known-good `main` SHA.
2. Create a focused rollback branch from current `origin/main`.
3. Revert the offending merge commit with `git revert`; use `-m 1` for a merge
   commit. Do not reset, force-push, or rewrite `main`.
4. Keep the revert complete when HTML, project data, metadata, and media must move
   together. A partial media rollback can leave broken references.
5. Run `npm ci`, `npm run verify`, and `git diff --check` on the revert.
6. Open and review a rollback PR, verify its exact head SHA and CI, then merge only
   with explicit authorization.
7. Confirm Pages deployed the reverted `main` SHA and repeat cold EN/AR production,
   CSS, media, navigation, Work, sitemap, and robots checks.

Preserve the failed commit and incident evidence so the root cause can be corrected
in a new forward PR. A rollback restores known-good production; it is not the place
for opportunistic cleanup.

## 11. Troubleshooting

### `mobile:apply` reports an unexpected page count

First confirm the exact new eligible route count. If the new route pair is intended
and has one mobile toggle/menu each, update the explicit count. If the increase is
unexpected, find duplicate or accidental HTML before changing the assertion.

### Thumbnail generation cannot find the source

Render Work once with only `thumbnail.original` configured. The generator discovers
the selected source from the EN/AR Work markup. Generate the files, add variant
paths to project data, and render again.

### A case study is HTTP 200 but unstyled

Open it cold, inspect `<head>`, and check the required `_next/static/chunks/*.css`
request for HTTP 200 and `text/css`. Compare with a verified route. Do not restore
all framework tags blindly; restore only proven required styles/fonts and rerun the
full gate.

### Idempotency fails only on Windows

Current hashing already normalizes CRLF. A failure after PR #8 should be treated as
a semantic generated-output change until the diff proves otherwise. Do not disable
the gate or ignore changed files.

### Browser checks cannot find Chrome/Edge

Install a supported browser or set `CHROME_PATH` to its executable. CI provisions
Chromium on Ubuntu, but local verification should not silently skip the browser
tests.

### A generator changes many unrelated files

Stop and inspect ownership. Revert only the files produced by your current action
using a safe, explicit method, then use the narrow command or route-specific edit.
Do not hide the diff in a bulk commit.

## 12. Do not do this

- Do not attempt `next build`; the source/build configuration is absent.
- Do not delete `_next`, `.nojekyll`, root route files, or payload files as “build
  artifacts.” They are part of the deployed export.
- Do not edit minified `_next` vendor chunks to fix product behavior.
- Do not run legacy extraction/migration scripts because their names look relevant;
  verify current ownership first.
- Do not hand-edit repeated Work cards in EN, AR, and payload files. Edit project
  data and render.
- Do not duplicate a project as an independent HTML registry beside
  `data/projects.json`.
- Do not use `data/routes.json` to invent a route; create the route, then inventory.
- Do not apply SEO before inventorying a newly created route pair.
- Do not add EN without AR, or reuse English canonical/metadata on Arabic routes.
- Do not change a Work image to eager/high because it is visually prominent after a
  filter. Only the initial first canonical card owns that hint.
- Do not preload gallery screenshots or load full originals in card/preview `src`.
- Do not serve a giant original screenshot as a Work-card resource when bounded
  optimized variants are available.
- Do not replace a storefront top crop with a center crop that hides its header.
- Do not remove required styles/fonts while stripping framework scripts.
- Do not treat a route HTTP 200 response as proof that its compiled CSS and visual
  design loaded correctly.
- Do not reintroduce `MutationObserver`, document-wide class scans, permanent
  `will-change`, or unconditional WebGL animation.
- Do not publish real client/customer records, credentials, tokens, local paths, or
  unapproved analytics/business metrics.
- Do not use `git reset --hard`, force-push `main`, or rewrite repository history for
  routine portfolio maintenance.
- Do not merge before the expected PR head SHA and passing CI have been confirmed.
- Do not bypass `npm run verify`, ignore semantic idempotency drift, or commit
  CRLF/LF-only generated-file churn.
- Do not equate a successful Pages deployment with complete production visual and
  network verification.

## 13. Current baseline for review

At the handoff SHA, reviewers should expect:

- 44 canonical projects;
- 12 initial Work cards per locale;
- 188 route inventory records, 186 indexable and 2 noindex;
- 93 indexable EN/AR route pairs;
- 189 HTML files and 1,474 `.txt` payload files;
- 186 mobile-navigation-eligible pages;
- 186 sitemap URLs;
- no broad effects `MutationObserver`;
- one prioritized initial Work image;
- 41 Mariam lazy previews with originals deferred.

These values are a dated baseline, not permanent magic numbers. When an approved
feature legitimately changes inventory, update the relevant explicit invariant and
this baseline in the same pull request.
