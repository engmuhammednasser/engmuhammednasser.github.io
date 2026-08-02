# Sprint 0 Engineering Report

Date: 2026-08-02  
Branch: `refactor/performance-clean-architecture`  
Base commit: `2dbfa6b98fc0a0f078e3a40a9c800e398c0c4a9d`

## Architecture

- The repository is a committed Next.js App Router static export. Generated chunks identify Next `16.2.9`, but the original source tree and build configuration are absent.
- Source-like logic is limited to one-off scripts under `scripts/` and root `.cjs` files. `work/`, `ar/`, `backend/`, and the other route folders are generated output.
- `projects/`, `logos/`, `profile.png`, and root icons are deployed static assets. `_next/` and route payload files are generated runtime/export artifacts.
- There is no `build` or `export` command, no `.github/workflows/` directory, and no reproducible local deployment pipeline. GitHub Pages is enabled externally and the root contains `.nojekyll`.
- The observed delivery shape is external export → committed static output → manual/one-off mutation scripts → Pages serving the repository root.
- Portfolio project data is duplicated in generated Work HTML/Flight payloads and hardcoded script arrays; there is no central project catalog.
- English and Arabic are duplicated route trees with 92 documents each, `lang`/`dir` attributes, localized navigation, and post-build path patches.

See [current-state.md](../architecture/current-state.md) for the full architecture map and [target-state.md](../architecture/target-state.md) for the proposed boundaries.

## Performance

The static baseline is in [baseline.md](baseline.md). Browser LCP, CLS, INP, FCP, and TBT were not measured: no supported Chromium, Playwright, Puppeteer, or Lighthouse installation was available, and no values were fabricated.

Largest measured static bottlenecks:

- `/work/`: 1,073 approximate HTML tags, 62 local resource requests, 43 project cards, and 22.9 MB of referenced card-image bytes.
- Site-wide runtime: effects CSS and JS are injected into all 187 HTML pages; the runtime performs global DOM scans, a document-wide MutationObserver, pointer work, and homepage WebGL/canvas work.
- Case studies: galleries directly reference large full-page images without consistent lazy loading or dimensions; `/work/ozone-clinic/` references about 27.4 MB of image bytes.
- Generated client runtime: representative listing pages reference about 651 KB of local JavaScript before compression.

## Assets

- GitHub reports `640,384 KiB` repository storage; expanded checkout files total `723,567,760` bytes.
- `projects/` contributes `683,022,157` bytes, and project images contribute `682,985,769` bytes.
- PNGs account for `607,483,075` bytes inside `projects/` and `623,253,207` bytes across the checkout.
- The ten largest project directories contribute about 452.8 MB.
- There are 189 full-page files totaling `91,905,966` bytes, 24 generated manifests, and 48 exact duplicate groups representing `61,639,690` duplicate bytes beyond one copy per hash.
- Direct text scanning found 133 media files without a direct path reference. None is approved for deletion; dynamic script names, manifests, missing source workspace data, and public route history require review.

## Risk ranking

### P0 — Critical

- **Non-reproducible production path:** the deployed output is present but the source/build/deployment recipe is not. A future export cannot be reliably regenerated or reviewed from this checkout.
- **Existing static integrity failure:** `npm run check` fails on four missing Afaaq preload references in both language trees.

### P1 — High

- **Large Work initial render:** 43 cards are present in the initial DOM and can reference about 22.9 MB of image bytes.
- **Global runtime cost:** effects are injected into every page and include broad DOM observation, continuous animation, WebGL, and canvas work.
- **Repository/media weight:** project assets consume 683 MB, dominated by large PNG captures.
- **Metadata correctness:** all 187 OG URLs point to the homepage; no canonical, hreflang, sitemap, or robots file was found.

### P2 — Medium

- **Image contract inconsistency:** two Work card images lack lazy/async attributes; case-study images generally lack lazy loading and intrinsic dimensions; the profile image is unnecessarily preloaded.
- **Referenced duplicates:** exact duplicate media is widely referenced, so cleanup requires coordinated path changes.
- **Link hygiene:** four live-site URLs remain HTTP in generated pages and import metadata: Diwaniya, Mashourah, LEC, and Omnas. They require destination verification before rewriting.
- **Mutation fragility:** several scripts rely on string order, template substitution, generated payload line IDs, and hardcoded `_next` chunk names.

### P3 — Low

- No CI quality workflow is committed.
- Generated text payloads and route mirrors increase review noise and make manual diffs difficult.
- Some direct-scan-unreferenced assets may be historical or redundant, but their ownership is not proven.

## Exact Sprint 1 backlog

The implementation should begin with the source/build prerequisite. The remaining tickets are the handoff’s image and asset scope, ordered so changes are durable and reversible.

### ARCH-101 — Re-establish the image change boundary

- **Problem:** image edits made directly to generated HTML can be overwritten and can desynchronize HTML from Next payloads.
- **Root cause:** original application source, export command, and dependency graph are absent; current scripts mutate output after export.
- **Likely files:** `package.json`, `README.md`, `scripts/*`, recovered source tree, `docs/architecture/*`.
- **Implementation:** locate the original source/build or explicitly define a temporary deterministic export contract; make one clean export and record the command/order before changing image consumers.
- **Expected impact:** makes all later image work reviewable and durable.
- **Regression risk:** high if the recovered source differs from the committed export; preserve the current branch/output as rollback.
- **Acceptance:** a clean checkout can reproduce the static artifact or a documented blocker identifies the missing external source; no public route is renamed.

### PERF-101 — Remove the incorrect profile preload

- **Problem:** `/profile.png` is preloaded although it is below the initial hero content.
- **Root cause:** generated homepage head contains a manually/automatically injected image preload with no LCP ownership check.
- **Likely files:** homepage source metadata/layout once recovered; current reference `index.html` and `ar/index.html`; any export metadata helper.
- **Implementation:** remove the profile preload, keep the profile image available with stable dimensions, and only prioritize the verified LCP image.
- **Expected impact:** reduces early image contention and startup request priority.
- **Regression risk:** medium; the profile image must remain visible and the OG image must remain valid.
- **Acceptance:** no below-fold profile preload remains on English or Arabic homepage; hero/LCP behavior is tested on desktop and mobile.

### PERF-102 — Standardize lazy loading and async decoding

- **Problem:** OryxBag and Ashhalan Car Rental card images lack `loading="lazy"` and `decoding="async"`; galleries are inconsistent.
- **Root cause:** multiple card/gallery generators and hand-patched cards use different markup contracts.
- **Likely files:** `scripts/import-workspace-projects.mjs`, `scripts/create-*.mjs`, recovered `ProjectCard`/gallery components, current `work/index.html` and `ar/work/index.html` only as output evidence.
- **Implementation:** enforce the image contract at the card/gallery render boundary; keep the verified above-fold image eager where justified.
- **Expected impact:** lower offscreen transfer, decode, and memory pressure.
- **Regression risk:** medium; eager loading changes can affect visible gallery timing.
- **Acceptance:** all offscreen card/gallery images have lazy/async behavior, no broken image paths, and English/Arabic output matches.

### PERF-103 — Add intrinsic dimensions/aspect-ratio stability

- **Problem:** many generated images use absolute fill styles without intrinsic width/height; galleries use fixed-height wrappers but no consistent image dimensions.
- **Root cause:** output is assembled from `fill`-style markup and post-build string templates rather than a shared image component.
- **Likely files:** card/gallery renderers, project asset metadata, `scripts/create-afaaq-case-study.mjs`, `scripts/import-workspace-projects.mjs`.
- **Implementation:** store dimensions or a trusted aspect ratio in image metadata; render width/height or CSS aspect-ratio at the source boundary.
- **Expected impact:** reduce layout shift and improve deterministic layout work.
- **Regression risk:** medium; incorrect dimensions can distort crops or previews.
- **Acceptance:** cards and gallery containers reserve space before image decode; visual crop and RTL layout remain unchanged.

### PERF-104 — Build optimized card thumbnail variants

- **Problem:** large project screenshots are reused as card images; some single card images are multi-megabyte PNGs.
- **Root cause:** no distinction between original/case-study media and card media.
- **Likely files:** `projects/*`, image build utility to be selected after ARCH-101, project catalog/card renderer, `scripts/import-workspace-projects.mjs`.
- **Implementation:** retain originals, generate bounded WebP/AVIF or equivalent thumbnail variants at one or two card widths, and update only card consumers.
- **Expected impact:** materially reduce Work/home image bytes, decode cost, and memory use.
- **Regression risk:** high for visual quality and path integrity; use before/after image review and keep originals.
- **Acceptance:** every card has a verified thumbnail variant, preferred thumbnail size is 50–120 KB with a 150 KB hard target where practical, and case-study galleries still use required originals.

### PERF-105 — Add responsive image delivery

- **Problem:** cards and galleries do not consistently use `srcset`/`sizes` or a responsive image contract.
- **Root cause:** static file paths are embedded directly in generated HTML and one-off scripts.
- **Likely files:** image helper/card/gallery renderer, project catalog, generated output, validation script.
- **Implementation:** use responsive variants for cards; preserve stable fallback `src`; keep full-page captures out of card `srcset` candidates.
- **Expected impact:** smaller transfers on narrow screens and sharper images on larger screens without shipping desktop captures everywhere.
- **Regression risk:** high if path encoding or Arabic filenames is mishandled.
- **Acceptance:** browser-selected candidates match viewport sizes, all candidates resolve, and no public case-study URL changes.

### PERF-106 — Add an image performance budget

- **Problem:** there is no automated guard against new oversized card images or unnecessary preloads.
- **Root cause:** `scripts/check-static.mjs` validates paths only and package scripts contain no budget check.
- **Likely files:** new small validator under `scripts/`, `package.json`, `docs/`, project catalog/manifest.
- **Implementation:** fail validation for missing dimensions, missing card thumbnails, oversized card variants, broken `srcset`, and non-LCP image preloads; report exceptions explicitly.
- **Expected impact:** prevents regression after the initial cleanup.
- **Regression risk:** low to medium; thresholds need exceptions for required originals and case-study hero media.
- **Acceptance:** CI/local validation reports route, asset, role, and byte-size failures with actionable paths.

### ASSET-101 — Complete duplicate/orphan reference audit

- **Problem:** 48 exact duplicate groups and 133 direct-scan-unreferenced media candidates exist, but direct deletion is unsafe.
- **Root cause:** imported source copies, generated captures, aliases, and public consumers share one flat media tree.
- **Likely files:** `projects/*`, `projects/*/full-page/manifest.json`, all HTML/TXT/JS/MJS/CJS/CSS/JSON, source workspace when available.
- **Implementation:** generate a machine-readable reference map; classify every candidate as card, hero, gallery, OG, generated, source, or unknown; verify dynamic references.
- **Expected impact:** identifies safe future savings without breaking case studies.
- **Regression risk:** high if a dynamic or Arabic path is missed.
- **Acceptance:** every proposed removal has no HTML/payload/script/manifest/source reference and a reversible review artifact.

### ASSET-102 — Reduce repository media weight safely

- **Problem:** project media is 683 MB, with PNGs at 607.5 MB inside `projects/`.
- **Root cause:** large screenshot captures and duplicate aliases are committed at delivery resolution; no retention policy exists.
- **Likely files:** largest `projects/*` groups, image pipeline, manifests, `.gitignore`/deployment packaging only if generated output is separated.
- **Implementation:** optimize verified replacement variants first; retain originals needed by case studies; remove only candidates approved by ASSET-101 in a separate reversible commit.
- **Expected impact:** lower repository clone time, deployment size, and media bandwidth.
- **Regression risk:** high; accidental removal affects public case studies and rollback size.
- **Acceptance:** no broken references, case-study visuals remain acceptable, measured repository/output bytes decrease, and a rollback mapping is documented.

## Sprint 1 regression gates

- `npm run check` passes with no missing local references.
- English and Arabic `/`, `/work/`, and at least three case studies render with the same public URLs.
- Mobile navigation, RTL direction, and language switches remain intact.
- Homepage profile and card images remain visually correct.
- No full-page original required by a case study is deleted.
- Static image/resource proxy is captured again; browser CWV is added only when a supported browser harness is available.
