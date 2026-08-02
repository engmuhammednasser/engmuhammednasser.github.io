# Sprint 1 Engineering Report — Foundation & Asset Performance

Date: 2026-08-02  
Branch: `refactor/performance-clean-architecture`  
Base: Sprint 0 export on commit `2dbfa6b98fc0a0f078e3a40a9c800e398c0c4a9d`

Sprint 1 preserved the committed static export. Because the original Next.js application source and build configuration are absent, repeated changes are implemented through narrow, rerunnable scripts that update the generated HTML and matching payloads. No public route was renamed, no original project media was deleted, and no merge to `main` occurred.

## Validation

### Original failure

The initial `npm run check` run checked 187 HTML files and failed on four missing local references:

```text
/projects/afaaq-developments/full-page/en-01-about.jpg
/projects/afaaq-developments/full-page/en-02-factory.jpg
/projects/afaaq-developments/full-page/en-03-clients.jpg
/projects/afaaq-developments/full-page/en-04-products.jpg
```

Each stale reference appeared as a preload in both:

- `work/afaaq-developments/index.html`
- `ar/work/afaaq-developments/index.html`

The files were not deleted. The available Afaaq capture files use names such as `01-home.jpg`, `02-about-us.jpg`, and `04-amorada-new-cairo.jpg`.

### Root cause and fix

The source was `scripts/create-afaaq-case-study.mjs`. It renamed the Kuwait Arc template with a broad `replaceAll("kuwait-arc", "afaaq-developments")` before running the regex intended to replace the template preload block. The regex consequently no longer matched, leaving the Kuwait Arc preload filenames in the generated Afaaq heads. The same broad replacement also changed the shared `scripts/kuwait-arc-screenshots.js` path into a nonexistent Afaaq-specific path.

The durable fix was to:

1. replace the template preload block before route/asset substitutions;
2. replace only scoped `/work/`, `/ar/work/`, and `/projects/` paths; and
3. preserve the shared screenshot behavior script path.

The generator was rerun for both locale pages. The four stale preloads disappeared and the generated screenshot links now resolve to existing Afaaq assets.

### Final status

`npm run check` passes:

```text
Checked 187 HTML files.
All local href/src references resolve.
Checked image delivery in 187 HTML files and 1,473 serialized payload files.
Validated 10 pilot picture deliveries and generated-thumbnail budgets.
```

The image validation now also checks local `srcset` candidates, pilot dimensions, generated thumbnail manifests/budgets, Work-card loading attributes, and noncritical image preloads.

## Asset Tooling

### Reference audit

`npm run audit:assets` runs `scripts/audit-project-assets.mjs` and writes:

- [project-asset-references.md](project-asset-references.md)
- [project-asset-references.json](project-asset-references.json)

The audit scans HTML, CSS, JavaScript, scripts, JSON, Markdown, serialized Next payloads, metadata, and manifests. It classifies project image files as `REFERENCED`, `POSSIBLY REFERENCED`, `UNREFERENCED CANDIDATE`, `GENERATED`, or `UNKNOWN`. Filename-only matches and full-page/capture uncertainty are deliberately separated from direct references. No candidate was deleted.

Current audit result: 731 project image assets across 1,753 text sources:

| Classification | Files | Bytes |
|---|---:|---:|
| REFERENCED | 590 | 635,410,573 |
| POSSIBLY REFERENCED | 51 | 30,846,269 |
| UNREFERENCED CANDIDATE | 63 | 13,792,213 |
| GENERATED | 20 | 1,150,872 |
| UNKNOWN | 7 | 2,936,714 |

These categories are evidence for future review, not deletion authorization.

### Image loading and preload policy

`npm run images:normalize` runs `scripts/normalize-image-delivery.mjs`. It is idempotent and synchronizes route `index.txt` payloads back into their embedded HTML Next payloads where the export contains both representations.

It now:

- removes the below-fold `/profile.png` preload from English and Arabic homepage/about output and matching payload declarations;
- keeps logo and plausible hero preloads (`cover` or first homepage hero) while removing generated gallery/backend preload declarations;
- applies `loading="lazy"` and `decoding="async"` to all Work project-card images;
- applies the same behavior to below-fold project/backend gallery images while preserving the first likely case-study hero image as eager;
- leaves originals and public URLs intact.

Static HTML preload counts measured against the Sprint 0 checkout:

| Metric | Before | After |
|---|---:|---:|
| All image preload declarations | 1,198 | 394 |
| Noncritical project/backend preload declarations | 870 | 0 |
| `/profile.png` preload declarations | 4 (2 homepage, 2 about) | 0 |
| Non-lazy Work project-card images | 2 | 0 |
| Work project-card image declarations standardized | 0 | 86 |
| Below-fold project/backend image declarations standardized | 0 | 1,526 |

The remaining 394 image preloads are logos and plausible hero candidates; the validator rejects new gallery/backend/profile preloads.

### Thumbnail-generation strategy

`npm run images:thumbnails -- --projects slug[,slug...]` runs `scripts/generate-project-thumbnails.mjs`. `--all` is available for a later controlled rollout but was not used in Sprint 1.

The pipeline:

- reads the current Work-card source image;
- writes `projects/{slug}/optimized/thumb-480.avif`, `thumb-800.avif`, `thumb-480.webp`, `thumb-800.webp`;
- preserves aspect ratio and never upscales;
- strips unnecessary metadata;
- records source dimensions, output dimensions, bytes, quality, and policy in `optimized/manifest.json`;
- skips unchanged outputs when the source and pipeline manifest are current;
- adaptively lowers quality only when a variant exceeds the approximately 150 KB budget.

The pilot delivery uses `<picture>` with AVIF/WebP `srcset`, `sizes`, `width`, `height`, lazy loading, async decoding, and a WebP fallback. The original card/case-study path is not removed from the project archive.

## Pilot

The measured new delivery path below is the 800px WebP fallback used by the pilot `<img>` element. AVIF and 480px variants were also generated and validated. Original byte counts are from the committed pre-Sprint 1 card sources.

| Project | Original path | Original bytes | Optimized path | Optimized bytes | Reduction | Status |
|---|---|---:|---|---:|---:|---|
| Techmart | `projects/techmart/cover.png` | 823,664 | `projects/techmart/optimized/thumb-800.webp` | 10,932 | 98.7% | Visual spot-check passed; card and case-study route remain functional. |
| OryxBag | `projects/oryxbag/home-en.jpg` | 1,379,060 | `projects/oryxbag/optimized/thumb-800.webp` | 147,770 | 89.3% | JPEG pilot passed; original gallery image remains intact. |
| EventGift Egypt | `projects/eventgift-egypt/homepage-full.webp` | 626,704 | `projects/eventgift-egypt/optimized/thumb-800.webp` | 146,012 | 76.7% | Existing WebP pilot passed; AVIF fallback also generated. |
| Gobe | `projects/gobe/featured-image.jpg` | 80,455 | `projects/gobe/optimized/thumb-800.webp` | 15,100 | 81.2% | Already-small source remained visually clean at card scale. |
| Afaaq Developments | `projects/afaaq-developments/cover.png` | 2,412,109 | `projects/afaaq-developments/optimized/thumb-800.webp` | 39,268 | 98.4% | Featured card migrated; Afaaq case-study originals and routes remain intact. |
| **Total** | — | **5,321,992** | — | **359,082** | **93.3%** | Five representative cards migrated in English and Arabic. |

The pilot includes a large PNG, a JPEG, an existing WebP source, a small/already optimized source, a Featured card, and normal Work-page projects. The five projects produce 20 optimized variants totaling 1,155,791 bytes including manifests. No original pilot image was modified.

## Code Changes

- `.gitignore` — excludes local caches, test/build output, temporary files, and backups while explicitly retaining the committed static export.
- `package.json` — adds deterministic normalization, thumbnail, pilot, asset-audit, and image-validation commands; extends `npm run check`.
- `scripts/create-afaaq-case-study.mjs` — fixes the stale preload generation order and scopes template path replacement.
- `scripts/normalize-image-delivery.mjs` — deterministic profile/preload cleanup, lazy-loading normalization, gallery loading policy, and embedded payload synchronization.
- `scripts/generate-project-thumbnails.mjs` — reusable ImageMagick AVIF/WebP pipeline with manifests, no-upscale behavior, idempotence, and byte budget.
- `scripts/apply-pilot-thumbnails.mjs` — deterministic five-project responsive-card migration for English and Arabic Work output plus listing payload synchronization.
- `scripts/audit-project-assets.mjs` — auditable project-media reference map and classifications.
- `scripts/check-image-delivery.mjs` — checks `srcset`, generated variants, thumbnail budgets, dimensions, loading attributes, and preload policy.
- `scripts/serve.mjs` — serves AVIF with `image/avif` during local static regression checks.
- Generated `work/`, `ar/work/`, homepage/about HTML, case-study HTML, and matching serialized payload files — regenerated or normalized by the scripts above; public routes remain unchanged.
- `projects/{pilot}/optimized/` — new generated delivery variants and manifests only; originals remain in their existing paths.
- `docs/audit/project-asset-references.{md,json}` — generated reference audit artifacts.

## Regression Testing

Completed checks:

- `npm run check` — passed.
- `git diff --check` — run as the final handoff gate.
- Static HTTP route checks using the repository server returned 200 for `/`, `/work/`, `/ar/`, both English/Arabic pilot case-study routes, and the Afaaq routes.
- Optimized AVIF and WebP endpoints returned 200 with `image/avif` and `image/webp` content types.
- English and Arabic Work cards contain the pilot `<picture>` markup, valid AVIF/WebP candidates, lazy/async attributes, and intrinsic dimensions.
- Case-study originals remain at their original paths; no original pilot file is modified or deleted.
- Existing project links, locale paths, and route shapes were preserved.
- Local visual spot-checks of the OryxBag and EventGift pilot outputs showed no material card-scale quality regression.

No supported Chromium, Playwright, Puppeteer, or Lighthouse harness was available. Browser Core Web Vitals were therefore not measured or fabricated. The route checks above are static-server and asset checks, not browser LCP/CLS/INP measurements.

## Repository impact

The current working tree excluding `.git` is 724,748,631 bytes versus the Sprint 0 recorded 723,567,760 bytes: a net increase of 1,180,871 bytes. Sprint 1 intentionally retains all originals, so it does not reduce repository storage. The increase is the five pilot’s generated variants/manifests plus scripts and reports. Historical Git objects were not rewritten.

## Remaining Risks

- The original application source/build configuration is still unavailable; the static export and post-processing scripts remain the current change boundary.
- Only five projects were migrated. The other Work cards still use their existing original card paths, although their loading attributes are now standardized.
- Full-page originals and duplicate media remain intentionally untouched; the asset audit identifies candidates but does not prove safe deletion.
- Browser CWV and visual regression automation remain unavailable.
- The generated payload architecture can still drift when a future export introduces a new route or embedded payload shape; the normalizer only handles known static-export representations.
- The 150 KB budget applies to generated card variants, not archival case-study originals.

## Sprint 2 Recommendation

Do not begin Sprint 2 yet. First review and accept this Sprint 1 pilot, then widen the thumbnail migration in small batches using the reference audit and image validator. The next backlog should be:

1. recover or document a reproducible source/export boundary;
2. migrate the remaining card images with visual review and route checks;
3. add a browser-capable regression harness for mobile/desktop and reduced-motion checks;
4. only then evaluate Sprint 2 runtime work such as conditional WebGL, observer scope, and effect initialization.

Sprint 2 should not include unrelated Work pagination, project-data centralization, SEO rewrite, or framework reconstruction.
