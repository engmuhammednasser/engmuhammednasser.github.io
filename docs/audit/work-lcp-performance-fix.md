# Work Archive LCP Performance Fix

Base revision: `8f56c38b269263a39048946c20395ab93062e7c4`
Branch: `perf/work-lcp-image-policy`

This is a narrowly scoped Work archive image-delivery change. It does not change project order, project URLs, the 43-project dataset, case-study originals, visual design, filtering, Load More, or the EN/AR route structure.

## Root Cause

The canonical EventGift Egypt record already had AVIF/WebP thumbnail variants, but the shared Work renderer emitted every card image with `loading="lazy"` and no priority hint. The first visible mobile LCP image was therefore discoverable only as a lazy image.

The desktop issue had a separate source-selection cause. EventGift UAE had no populated optimized thumbnail fields in `data/projects.json`, so the shared fallback selected `/projects/eventgift-uae/home.webp`, a 1,100,908-byte full case-study screenshot. The Work card renderer used that original because its fallback order was optimized WebP, then original. This was independent of the case-study page, which continues to use the original screenshot.

## Implementation

The existing shared Work rendering path now accepts a primary-card policy:

- The first canonical initial card in both `/work/` and `/ar/work/` is `loading="eager"`, `fetchpriority="high"`, and `decoding="async"`.
- The remaining initial cards stay `loading="lazy"` and `decoding="async"` without a high-priority hint.
- Filter and Load More rerenders do not retain the initial high-priority hint; their cards remain lazy.
- The same policy is applied to generated HTML, the Next Flight payloads, and the runtime renderer.
- Responsive `<picture>` sources prefer AVIF, fall back to WebP, and retain the existing card `sizes` policy.

The existing deterministic image thumbnail generator produced only the missing EventGift UAE card variants. No broad media conversion was performed.

## Asset Changes

Added under `projects/eventgift-uae/optimized/`:

| Variant | Bytes | Dimensions |
| --- | ---: | ---: |
| `thumb-480.avif` | 88,191 | 480 × 3,617 |
| `thumb-800.avif` | 140,844 | 800 × 6,029 |
| `thumb-480.webp` | 108,204 | 480 × 3,617 |
| `thumb-800.webp` | 148,314 | 800 × 6,029 |

The source original remains at `projects/eventgift-uae/home.webp` for case-study use. The selected desktop Work-card AVIF is approximately 92% smaller than that original.

## Before/After medians

The **before** values are the production Lighthouse medians documented for the live main revision. The **after** values are three-run Lighthouse medians against the local static export at the same viewport and throttling settings, because this branch had not been deployed during measurement. Local hosting changes TTFB, compression, and request timing, so the score, timing, and total-byte columns are not an apples-to-apples production comparison.

| Route/profile | Score | FCP (ms) | LCP (ms) | TBT (ms) | CLS | Requests | Transfer | LCP asset |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `/work/` mobile — before | 96 | 1,006 | 2,806 | 54 | 0.000 | 27 | 3.51 MB | EventGift Egypt optimized thumbnail; lazy, no priority |
| `/work/` mobile — after local | 76 | 1,508 | 7,238 | 72 | 0.000 | 24 | 1.99 MB | `eventgift-egypt/optimized/thumb-480.avif`, ~84.9 KB; eager/high |
| `/work/` desktop — before | 88 | 344 | 2,247 | 0 | 0.000 | 33 | 4.00 MB | EventGift UAE `home.webp`, ~1.10 MB; lazy |
| `/work/` desktop — after local | 95 | 409 | 1,522 | 0 | 0.000 | 30 | 3.29 MB | `eventgift-uae/optimized/thumb-480.avif`, ~88.2 KB; optimized source |
| `/ar/work/` mobile — before | 94 | 1,045 | 3,003 | 60 | 0.000 | 28 | 3.54 MB | EventGift Egypt optimized thumbnail; lazy, no priority |
| `/ar/work/` mobile — after local | 73 | 1,810 | 7,407 | 157 | 0.000 | 25 | 2.03 MB | `eventgift-egypt/optimized/thumb-480.avif`, ~84.9 KB; eager/high |
| `/ar/work/` desktop — before | 84 | 318 | 2,870 | 0 | 0.000 | 34 | 4.04 MB | EventGift UAE `home.webp`, ~1.10 MB; lazy |
| `/ar/work/` desktop — after local | 95 | 492 | 1,552 | 0 | 0.000 | 31 | 3.33 MB | `eventgift-uae/optimized/thumb-480.avif`, ~88.2 KB; optimized source |

Post-fix run ranges were: English mobile scores 74–76 and reported LCP 7,231–7,239 ms; English desktop scores 95 and LCP 1,521–1,523 ms; Arabic mobile scores 70–73 and LCP 7,404–7,448 ms; Arabic desktop scores 86–95 and LCP 1,547–2,548 ms. The local mobile reports also exposed a Lighthouse trace discrepancy: the LCP candidate was the eager optimized EventGift Egypt image and the observed trace LCP was 180–363 ms, while the reported LCP audit was 7.2–7.4 s. Accordingly, this run demonstrates the source and priority architecture and the desktop resource improvement, but it does not establish a production mobile LCP gain.

## Regression

Validation passed for both locales and both browser profiles:

- Chrome network probes selected the optimized AVIF source, returned HTTP 200, and showed no EventGift UAE `home.webp` request on `/work/` or `/ar/work/`.
- Initial HTML and payloads contain exactly 12 active cards. Only the primary card is eager/high; remaining cards are lazy/async.
- Corporate filtering remained 12 of 21, `aria-pressed` updated correctly, and Load More revealed 21 of 21 before hiding the control.
- English and Arabic card labels/status text remained localized, and no-JS project links remained present.
- Existing image-delivery, Work archive, runtime interaction, SEO/accessibility, route, sitemap, and idempotency checks passed.
- No mobile-navigation, WebGL/effects, homepage, case-study-original, project-copy, canonical/hreflang, JSON-LD, or vendor-runtime source was changed. Generated EventGift UAE route artifacts only picked up the optimized social-image path as a deterministic consequence of the existing thumbnail-aware metadata generator.

## Remaining Opportunities

Production Lighthouse should be repeated after the draft branch is deployed, using the same live-host methodology, before treating the timing columns as a field-relevant result. The existing audit’s Arabic homepage CLS investigation remains separate and was not started here. Other original Work-card media remain outside this targeted fix.
