# Sprint 0 Baseline — 2026-08-02

## Scope and provenance

This baseline was captured from commit `2dbfa6b98fc0a0f078e3a40a9c800e398c0c4a9d` on the safe branch `refactor/performance-clean-architecture`. The checkout is the public `main` snapshot cloned at audit time; no production code was changed.

Environment:

- Node `v24.11.1`
- npm `11.6.2`
- GitHub repository size: `640,384 KiB` from the repository API
- Working-tree files: `723,567,760` bytes
- 187 HTML files were found

The repository is a committed static export. There is no application source tree or build script in this checkout, so the measurements below describe the exported pages and their referenced local resources.

## Existing validation

Command run:

```text
npm run check
```

Result: **failed** after checking all 187 HTML files. The existing checker reported four missing local references:

```text
/projects/afaaq-developments/full-page/en-01-about.jpg
/projects/afaaq-developments/full-page/en-02-factory.jpg
/projects/afaaq-developments/full-page/en-03-clients.jpg
/projects/afaaq-developments/full-page/en-04-products.jpg
```

Each reference occurs in both `work/afaaq-developments/index.html` and `ar/work/afaaq-developments/index.html`, as preload URLs. The available files use names such as `01-home.jpg`, `02-about-us.jpg`, and `03-amorada-park-view.jpg`. This was documented, not fixed, because Sprint 0 is discovery-only and the generator/source boundary is not yet reproducible.

The checker only validates root-relative `href` and `src` attributes in HTML. It does not validate `srcset`, CSS URLs, metadata correctness, route semantics, or links embedded only in generated payloads.

## Static route baseline

These are deterministic HTML/resource proxies, not browser performance measurements. `requests` is the document plus unique local resources referenced by the page. `image refs` includes every `<img>` in the HTML; `non-lazy` is the subset without `loading="lazy"`. `referenced bytes` includes the document and unique local JS, CSS, font, image, and icon resources. Lazy-loading means the browser may transfer less than the potential image total.

| Route | HTML | Approx. DOM tags | Requests | JS | CSS | Image refs | Non-lazy | Referenced image bytes | Referenced bytes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 128,181 B | 473 | 26 | 649,267 B | 69,393 B | 8 | 4 | 5,050,954 B | 6,036,072 B |
| `/work/` | 145,547 B | 1,073 | 62 | 650,961 B | 69,393 B | 44 | 3 | 22,929,230 B | 23,933,408 B |
| `/services/` | 108,006 B | 490 | 18 | 634,790 B | 69,393 B | 1 | 1 | 20,540 B | 971,006 B |
| `/about/` | 53,698 B | 243 | 19 | 634,790 B | 69,393 B | 2 | 2 | 128,564 B | 1,024,722 B |
| `/ar/` | 138,822 B | 476 | 26 | 649,267 B | 69,393 B | 8 | 4 | 5,046,987 B | 6,042,746 B |
| `/ar/work/` | 152,452 B | 1,073 | 62 | 650,961 B | 69,393 B | 44 | 3 | 22,913,926 B | 23,925,009 B |
| `/work/afaaq-developments/` | 35,863 B | 276 | 17 | 20,683 B | 69,393 B | 8 | 8 | 6,443,945 B | 6,679,377 B |
| `/work/ozone-clinic/` | 84,686 B | 375 | 36 | 662,196 B | 69,393 B | 18 | 18 | 27,404,963 B | 28,359,515 B |
| `/work/ashhalancarrental/` | 56,470 B | 438 | 20 | 17,775 B | 69,393 B | 16 | 2 | 3,285,436 B | 3,433,492 B |

The `/work/` page has 43 unique project-card links and 44 image tags including the shared logo. Its two project-card exceptions are `/projects/oryxbag/home-en.jpg` and `/projects/ashhalancarrental/home-en.jpg`; neither has lazy loading or async decoding. The homepage profile image is also non-lazy and is preloaded despite being below the initial hero content.

## Browser metrics

LCP, CLS, INP, FCP, and TBT were **not measured**. No supported Chromium executable, Playwright, Puppeteer, or Lighthouse installation was available in the environment. No packages were installed for the baseline, and no values are fabricated.

The static proxies above are useful for comparing future builds, but they cannot establish paint timing, layout shift, interaction latency, CPU time, cache behavior, network scheduling, or actual lazy-image transfer.

## Initial findings

1. The largest immediate page-level cost is the fully rendered 43-card Work archive: about 1,073 static tags and 22.9 MB of potential card-image bytes before browser caching/lazy-load behavior.
2. All 187 HTML pages include `scripts/portfolio-effects.css` and `scripts/portfolio-effects.js`; the effect script is therefore a site-wide runtime cost rather than an isolated homepage island.
3. The generated Next runtime contributes about 635–662 KB of local JavaScript to representative pages, before transfer compression.
4. Case-study screenshot galleries are mostly non-lazy and use full-page media directly.
5. The existing static check already exposes a source/generation mismatch in the Afaaq page preloads.

## Baseline acceptance record

- Safe refactor branch created: yes
- Main modified: no
- Existing check run: yes; fails with four known stale preload references
- Browser CWV run: unavailable; explicitly not fabricated
- Sprint 1 implementation: not started
