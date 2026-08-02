# Asset Inventory — Sprint 0

## Repository breakdown

The repository API reports `640,384 KiB` of GitHub repository storage. The checked-out files sum to `723,567,760` bytes (about 690 MiB). The difference is expected because repository storage is compressed/deduplicated while the working tree contains expanded files.

| Group | Files | Bytes | Share of working tree |
|---|---:|---:|---:|
| `projects/` | 735 | 683,022,157 | 94.4% |
| `ar/` | 825 | 11,720,267 | 1.6% |
| `backend/` | 370 | 9,605,724 | 1.3% |
| `work/` | 389 | 5,818,754 | 0.8% |
| `_next/` | 29 | 1,118,619 | 0.2% |
| Everything else | — | 12,282,239 | 1.7% |

Within `projects/`, there are 735 files: 711 image files and 24 generated `manifest.json` files. Project media alone is `682,985,769` bytes.

| Project image format | Files | Bytes |
|---|---:|---:|
| PNG | 430 | 607,483,075 |
| WebP | 172 | 42,676,516 |
| JPG | 98 | 31,135,069 |
| JPEG | 11 | 1,691,109 |

PNG is the dominant contributor: about 607.5 MB inside `projects/`, or roughly 89% of project media. Across the entire checkout, PNG files account for about 623.3 MB.

## Largest project groups

| Directory | Files | Bytes |
|---|---:|---:|
| `projects/eventgift/` | 25 | 82,800,921 |
| `projects/atour/` | 28 | 81,327,537 |
| `projects/genedyeg/` | 16 | 61,327,959 |
| `projects/nuc-kw/` | 29 | 49,429,053 |
| `projects/nora24jewelry/` | 18 | 34,707,790 |
| `projects/ashhalanksa/` | 14 | 31,597,741 |
| `projects/ashhalan/` | 15 | 29,016,781 |
| `projects/ozone-clinic/` | 18 | 27,457,420 |
| `projects/tbinnovation/` | 15 | 26,347,777 |
| `projects/a2mkw/` | 14 | 23,759,199 |

These ten directories account for about 452.8 MB, approximately two-thirds of `projects/`.

## Largest individual files

The largest files are mostly full-page or desktop captures, and several are used as both card and case-study media:

```text
18.21 MB  projects/genedyeg/sectors.png
13.71 MB  projects/eventgift/uae-homepage-full-desktop.png
13.22 MB  projects/armadillo-studio/full-page/01-home.png
13.15 MB  projects/atour/frontend/05-trip-detail-desktop.png
12.96 MB  projects/atour/frontend/01-homepage-hero-desktop.png
12.18 MB  projects/eventgift/saudi-homepage-full-desktop.png
11.95 MB  projects/ozone-clinic/frontend/01-homepage-hero-desktop.png
 9.96 MB  projects/nuc-kw/المشاريع.png
 9.94 MB  projects/nuc-kw/Our Project - NUC.png
 9.62 MB  projects/atour/frontend/08-biography-4-desktop.png
 9.28 MB  projects/nora24jewelry/cover.png
 9.28 MB  projects/nora24jewelry/home.png
 9.06 MB  projects/eventgift/egypt-homepage-full-desktop.png
 9.00 MB  projects/ashhalan/home-page.png
 8.73 MB  projects/atour/frontend/10-biography-6-desktop.png
 8.53 MB  projects/ashhalan/home-page-ar.png
 7.97 MB  projects/atour/frontend/07-biography-3-desktop.png
 7.92 MB  projects/eventgift/uae-about-desktop.png
 7.64 MB  projects/atour/frontend/09-biography-5-desktop.png
 7.50 MB  projects/genedyeg/projects.png
```

## Full-page captures and generated media

There are 189 files under 24 `projects/*/full-page/` directories, totaling `91,905,966` bytes (13.5% of project media). The largest full-page groups are:

- `armadillo-studio/full-page/`: 17.33 MB
- `torathyat/full-page/`: 14.74 MB
- `alrowad/full-page/`: 10.63 MB
- `arabic-window/full-page/`: 5.89 MB
- `afaaq-developments/full-page/`: 5.20 MB
- `prowindow/full-page/`: 4.38 MB

The repository has no explicit `original/` or `source/` media partition. Imported images are copied into project roots and `full-page/`; generated manifests preserve an external source hint such as `S:\workspace\<project>` and the original filename. That source workspace is not present in this checkout.

The following are generated or export artifacts rather than application source:

- `_next/static/` JavaScript, CSS, font, and manifest files
- route `index.html` files
- route `index.txt`, `__next._full.txt`, `__next._head.txt`, `__next._tree.txt`, and variant payloads
- `projects/*/full-page/manifest.json`
- capture outputs created by the screenshot scripts

## Exact duplicates

SHA-256 comparison found 48 exact duplicate groups, 107 files, and `61,639,690` bytes of duplicate copies beyond one copy per hash. Examples include:

- `nora24jewelry/cover.png` and `home.png` — 9.28 MB
- `genedyeg/cover.png` and `home.png` — 6.07 MB
- `ashhalanksa/cover.png` and `home.png` — 6.05 MB
- `eventgift/saudi-landing-feature-desktop.png` and `saudi-landing-page-desktop.png` — 4.93 MB
- `tbinnovation/cover.png` and `home.png` — 4.42 MB
- `alrowad/cover.png` and `full-page/01-الري-يسية.png` — 3.98 MB
- `gobe/cover.png` and `الرئيسية.png` — 3.88 MB
- `ashhalanlogistics/cover.png` and `home.png` — 3.08 MB

Every large duplicate checked had direct references in tracked HTML, payload, or manifest text. These are therefore deduplication candidates, not deletion candidates. A future change must update all references and preserve stable asset URLs where public links or case-study behavior depend on them.

## Reference analysis and cleanup classifications

The direct reference scan covered tracked HTML, Next payload text, JavaScript, MJS/CJS scripts, CSS, JSON, and Markdown. It found 133 media files with no direct `/projects/...` or `/logos/...` string reference. “Unreferenced” here is only a text-scan result; it is not proof that a file is removable because the original workspace is absent and some scripts construct names dynamically.

### SAFE TO INVESTIGATE

- Exact duplicate cover/home aliases where all references are first mapped.
- Large card images that are directly referenced from both `/work/` and case-study pages, as candidates for a separate thumbnail variant rather than deletion.
- Repeated capture outputs with equivalent content, after confirming their manifest and route ownership.

No file is marked safe to delete in Sprint 0.

### LIKELY REQUIRED

- Images referenced by the 43 English and 43 Arabic Work cards.
- Case-study hero and gallery images referenced from `work/*`, `ar/work/*`, and custom case-study scripts.
- `profile.png`, logos, icons, and Open Graph image targets.
- Full-page captures that are named in a route HTML file, payload, or manifest.
- Any asset referenced by `scripts/create-*.mjs`, `scripts/upgrade-*.mjs`, capture scripts, or the external workspace import flow, even if the current HTML does not reference it directly.

### GENERATED

- `_next/static/*` runtime chunks, styles, fonts, and manifests.
- `index.html` and the route-local Next payload files.
- `projects/*/full-page/manifest.json` and capture outputs.

Generated does not mean disposable: these files are currently the deployed site and are committed because the source build is absent.

### UNKNOWN / NEEDS REVIEW

The following are representative direct-scan candidates, not removal instructions:

- `projects/torathyat/full-page/01-home.png`, `03-shop.png`, `06-single-product.png`, `08-contact.png`, `09-checkout.png`
- `projects/nora24jewelry/1.png`, `2.png`, `3.png`, `4.png`
- `projects/arabic-window/full-page/03-books.jpg`, `04-blog.jpg`
- `projects/ashhalanksa/404.png`
- `projects/pxls-creative/*` (no current Work route was found)
- root aliases such as `projects/eventgift-cover.png`, `projects/techmart-cover.png`, `projects/botella-cover.png`, and `projects/ashhalan-cover.png`
- `projects/afaaq-developments/full-page/03-amorada-park-view.jpg`, which is present in the capture manifest but is omitted from the current custom screenshot list

Before any cleanup, each candidate must be checked against generated payloads, manifests, script-generated names, the missing external source workspace, and the public route set. Preserve originals until an optimized replacement has passed visual and link regression checks.

## Asset conclusions

1. Repository size is primarily an image-delivery problem, not a JavaScript or CSS problem.
2. PNG captures dominate the working tree and are often much larger than a portfolio card needs.
3. Full-page media is a real contributor, but card-sized copies and repeated cover/home aliases also matter.
4. The current repository has no durable image pipeline or source-of-truth manifest for card versus case-study use.
5. Sprint 1 should generate/introduce optimized card variants and a reference map before considering any deletion.
