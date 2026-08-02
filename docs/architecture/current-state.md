# Current Architecture — Sprint 0

## Executive summary

The deployed repository is a committed static export that appears to have been produced by Next.js App Router. It is not a normal Next.js source repository: there is no `src/`, `app/`, `pages/`, `public/`, `next.config.*`, `tsconfig.json`, or `next` dependency. The generated HTML, Next Flight payloads, `_next` chunks, project media, and post-build scripts are the only local implementation material.

The strongest evidence for the framework is the generated runtime in `_next/static/chunks/3peubv2924kx4.js`, which identifies Next `16.2.9`, together with React Flight payloads named `__next_f`. This identifies the export format, not a recoverable source build.

## Repository roles

### Deployed/generated output

- Root `index.html`, `404.html`, and `404/index.html`
- Route directories such as `about/`, `services/`, `work/`, `backend/`, `lab/`, `contact/`, and `ar/`
- 187 HTML documents in total
- 92 English-language documents and 92 Arabic-language documents, plus error documents
- Route-local `index.txt`, `__next._full.txt`, `__next._head.txt`, `__next._tree.txt`, and hashed/locale payload files
- `_next/static/` client chunks, CSS, fonts, and manifests

The `.txt` files are not source content in the normal sense. They are serialized Next Flight/export payloads that duplicate page content and must stay synchronized with some HTML mutations.

### Media

- `projects/`: project covers, card images, full-page captures, and manifests
- `logos/`: English/Arabic logos and contact imagery
- `profile.png`: profile/OG image and homepage image
- Root SVG/ICO/PNG assets: icons and favicons

There is no `public/` directory. `projects/` is functioning as the public asset tree in the export.

### Editable logic present in this checkout

- `package.json`: scripts only; no build, export, lint, test, or typecheck command
- `scripts/`: capture tools, one-off HTML/payload mutation tools, the static checker, static server, and the global effects implementation
- Root `.cjs` files: additional one-off link, language-prefix, and OG-tag mutations
- `README.md`: describes the static export, manual path normalization, and `npm run check`

No `.github/workflows/` directory is present.

## Build and deployment flow

### What is confirmed

`package.json` contains no `build` or `export` script. Its runnable commands are:

```text
capture:arabic-window
capture:kuwait-arc
effects:portfolio
fix:paths
filter:work
upgrade:arabic-window
start
check
```

`README.md` says the repository contains a statically exported site and instructs an engineer to replace the static export, run `npm run fix:paths`, and then run `npm run check`.

The repository has `.nojekyll`, GitHub reports Pages enabled, and the deployed artifact is committed at the repository root. There is no in-repository GitHub Actions deployment workflow. The exact Pages source-branch/directory setting is external configuration and cannot be proven from this checkout; the repository default branch is `main`.

### Observable delivery shape

The current delivery therefore behaves like:

```text
External/missing Next source build
        ↓
Committed static export at repository root
        ↓
Manual or one-off HTML/payload mutation scripts
        ↓
git commit on the Pages-served branch
        ↓
GitHub Pages serves root files
```

The order and complete history of the one-off scripts are not recorded in a build manifest. A future engineer must not treat the current package script list as a reproducible build pipeline.

## Post-build mutation architecture

The mutation layer explains most of the duplicated output and current integrity risk.

| Script | Observed responsibility |
|---|---|
| `scripts/fix-export-paths.mjs` | Rewrites generated `/demo/`, `/en/`, and known bad asset paths across HTML, JS, and TXT files. |
| `scripts/add-portfolio-effects.mjs` | Scans every HTML file and injects the global effects CSS into `</head>` and JS before `</body>`. |
| `scripts/add-work-filters.mjs` | Parses embedded Next payloads and static HTML, inserts category filter markup, and annotates all Work cards. |
| `scripts/add-backend-buttons.mjs` | Locates cards by string order and injects case-study buttons, then resynchronizes payload lines. |
| `scripts/upgrade-*.mjs` and `scripts/create-*.mjs` | Copy or synthesize individual case studies from existing generated pages/templates and rewrite HTML/payload content. |
| `scripts/capture-*.mjs` | Uses a locally installed Chromium/Edge through the DevTools protocol to capture external sites into project media. |
| `scripts/import-workspace-projects.mjs` | Contains hardcoded project metadata and copies images from the absent `S:\workspace` tree into `projects/`. |
| Root `add_og_tags.cjs` | Adds OG/Twitter tags to every HTML file, but hardcodes the root URL for every page. |
| Root `fix_*.cjs` / `replace_links.cjs` | Performs targeted path and language-link repairs in generated files and `_next` chunks. |

These scripts are needed because the repository contains output rather than the component/data source, and because the export has accumulated route-prefix, link, capture, and metadata corrections. The durable problem is that the scripts patch generated representation after rendering; a later export can erase or invalidate those patches.

## Data flow and project rendering

Project information is not centralized. It is distributed across:

- HTML card markup and embedded Next payloads in `work/index.html`, `work/index.txt`, and equivalents
- Hardcoded category/slug arrays in `scripts/add-work-filters.mjs`
- Hardcoded project records in `scripts/import-workspace-projects.mjs`
- Individual content objects in `scripts/create-*.mjs` and upgrade scripts
- Project image directories and generated manifests under `projects/`

The current Work flow is:

```text
hardcoded script arrays + existing exported template + project media
        ↓
generated/modified Next payloads and HTML
        ↓
43 card nodes in /work/ and 43 card nodes in /ar/work/
        ↓
CSS :has() radio filter hides/shows already-rendered cards
```

The 43-card count is confirmed from the unique project links in both Work index pages. There is no pagination or Load More boundary.

## Image handling

Images are ordinary root-relative static files. Some Next-generated cards use `loading="lazy" decoding="async"`, but the handcrafted OryxBag and Ashhalan Car Rental cards do not. Case-study galleries generally render full-page captures without lazy loading, dimensions, or responsive variants.

The homepage contains a preload for `/profile.png`, while the profile image is lower in the page. The image has no explicit width/height in the generated tag. Project card images use absolute fill styles and usually have no intrinsic dimensions in the HTML.

There is no responsive thumbnail pipeline, no image budget checker, and no central map declaring which asset is a card thumbnail, hero image, gallery image, or OG image.

## Client runtime and effects

`scripts/portfolio-effects.js` and `scripts/portfolio-effects.css` are linked from all 187 HTML files.

The runtime currently:

- Adds a fixed ambient background and pointer glow to every page.
- Scans `main` descendants with `querySelectorAll("[class]")` and scans links/buttons to infer visual roles and inject classes.
- Creates a WebGL hero canvas on the homepage and Arabic homepage.
- Runs the WebGL render loop continuously, throttled to roughly 30 FPS on desktop and 20 FPS on the mobile fallback path; it skips drawing while hidden but still schedules frames.
- Uses `ResizeObserver` and `IntersectionObserver` for the hero.
- Creates a desktop fine-pointer splash cursor canvas with particle rendering and a continuous animation frame.
- Uses a document-wide `MutationObserver` on `document.documentElement` with `{ childList: true, subtree: true }` to remount after DOM changes.
- Responds to route history, pointer capability, and reduced-motion media-query changes.

Positive behavior to preserve includes reduced-motion handling, coarse-pointer degradation, visibility checks, low-power WebGL settings, and no obvious analytics stack in the initial HTML. The current runtime still mounts the hero WebGL code on non-desktop paths, and reduced motion sets shader motion to zero but does not eliminate all runtime setup/loop work.

The CSS adds `backdrop-filter`, large blur radii, fixed ambient layers, `will-change`, and animated gradient orbs. These are visual enhancements applied globally rather than isolated to a small interactive island.

## Localization architecture

English and Arabic are separate static route trees. The Arabic tree is rooted at `/ar/`, uses `<html lang="ar" dir="rtl">`, localized navigation/copy, and language-switch links back to English. English pages use `<html lang="en" dir="ltr">`.

There are 92 pages in each language tree. `fix_lang_prefix.cjs`, `fix_js_txt_links.cjs`, and `replace_links.cjs` patch generated navigation and language-prefix behavior after export. Arabic functionality therefore depends on both duplicated HTML and targeted mutation of generated Next chunks/payloads.

## SEO architecture

All HTML files have a title, description, OG image, OG URL, and Twitter card metadata. However:

- all 187 `og:url` values are `https://engmuhammednasser.github.io/`
- core pages reuse generic homepage-style title/description values
- no HTML file has a canonical link
- no HTML file has `hreflang`
- no root `robots.txt` or `sitemap.xml` exists
- the root `add_og_tags.cjs` script hardcodes the homepage OG URL

Some generated case-study pages have route-specific titles and descriptions, but that does not make their OG URL route-specific.

## Major technical debt

1. **Missing source of truth:** the deployable output exists, but the framework source and original build configuration do not.
2. **Non-reproducible build:** no build/export command, dependency graph, or deployment workflow is committed.
3. **Mutation cascade:** several scripts rewrite HTML, embedded payloads, and runtime chunks by string matching and positional assumptions.
4. **Duplicated content:** the same page data exists in HTML, TXT payloads, Arabic mirrors, and script literals.
5. **Large initial Work DOM:** all 43 cards render before filtering.
6. **Unbounded media weight:** 683 MB of project media, dominated by PNG captures and direct use of large images.
7. **Global runtime:** effects are injected into every page and rely on broad DOM scanning and observation.
8. **Metadata correctness:** generic and root-scoped metadata is generated after the fact.
9. **Weak quality gates:** the current checker is useful but narrow, and it currently fails on four missing references.
10. **External source dependency:** import scripts reference `S:\workspace`, which is not available to a clean checkout.

