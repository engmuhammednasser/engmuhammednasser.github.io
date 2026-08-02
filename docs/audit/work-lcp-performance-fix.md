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

The local after values above are retained as historical context. They are superseded for base-versus-head decisions by the controlled comparison below.

## Controlled Base vs Head Validation

The base revision (`8f56c38b269263a39048946c20395ab93062e7c4`) and head revision (`5f1ff850962f6c1612807e9a9ffd4d156e15de19`) were measured from separate worktrees through the same Node static server, origin, port, machine, Chrome 150.0.7871.187 profile setup, Lighthouse 13.4.1, route sequence, and cache state. Each revision received five fresh-profile runs for `/work/` and `/ar/work/` at both mobile and desktop settings, for 40 Lighthouse runs total. Mobile was 390×844 with 150 ms RTT, 1,600 Kbps throughput, and 4× CPU slowdown; desktop was 1350×940 with 40 ms RTT, 10,000 Kbps throughput, and no CPU slowdown. Lighthouse used simulated throttling. All 40 runs completed without a Lighthouse runtime error.

The tables report Lighthouse medians and observed five-run ranges. A positive timing delta means head was slower; a negative delta means head was faster. Transfer values are total page transfer bytes.

### `/work/` mobile

| Metric | Base median | Head median | Delta | Base min–max | Head min–max |
| --- | ---: | ---: | ---: | ---: | ---: |
| Performance score | 69 | 68 | -1 | 61–73 | 67–69 |
| LCP (ms) | 7,429 | 7,437 | +8 | 7,352–7,466 | 7,418–7,469 |
| FCP (ms) | 1,521 | 1,517 | -4 | 1,517–1,525 | 1,516–1,522 |
| TBT (ms) | 312 | 331 | +19 | 184–551 | 310–378 |
| CLS | 0 | 0 | 0 | 0–0 | 0–0 |
| Transfer (bytes) | 3,003,201 | 1,991,466 | -1,011,735 | 3,003,201–3,003,201 | 1,991,466–1,991,466 |

### `/work/` desktop

| Metric | Base median | Head median | Delta | Base min–max | Head min–max |
| --- | ---: | ---: | ---: | ---: | ---: |
| Performance score | 57 | 86 | +29 | 56–60 | 86–94 |
| LCP (ms) | 3,483 | 2,557 | -926 | 3,480–3,503 | 1,601–2,560 |
| FCP (ms) | 458 | 451 | -7 | 456–465 | 383–451 |
| TBT (ms) | 566 | 18 | -548 | 485–656 | 10–40 |
| CLS | 0 | 0 | 0 | 0–0 | 0–0 |
| Transfer (bytes) | 4,303,155 | 3,291,420 | -1,011,735 | 4,303,155–4,303,155 | 3,291,420–3,291,420 |

### `/ar/work/` mobile

| Metric | Base median | Head median | Delta | Base min–max | Head min–max |
| --- | ---: | ---: | ---: | ---: | ---: |
| Performance score | 60 | 60 | 0 | 56–65 | 57–75 |
| LCP (ms) | 7,512 | 7,556 | +44 | 7,318–7,580 | 7,453–7,622 |
| FCP (ms) | 1,822 | 1,826 | +4 | 1,816–1,829 | 1,819–1,826 |
| TBT (ms) | 580 | 576 | -4 | 415–742 | 51–703 |
| CLS | 0 | 0 | 0 | 0–0 | 0–0 |
| Transfer (bytes) | 3,036,767 | 2,025,032 | -1,011,735 | 3,036,767–3,036,767 | 2,025,032–2,025,032 |

### `/ar/work/` desktop

| Metric | Base median | Head median | Delta | Base min–max | Head min–max |
| --- | ---: | ---: | ---: | ---: | ---: |
| Performance score | 94 | 86 | -8 | 57–95 | 76–94 |
| LCP (ms) | 1,555 | 2,556 | +1,001 | 1,531–3,540 | 1,592–2,579 |
| FCP (ms) | 505 | 503 | -2 | 501–517 | 463–512 |
| TBT (ms) | 68 | 77 | +9 | 57–547 | 8–266 |
| CLS | 0.000106 | 0 | -0.000106 | 0–0.000106 | 0–0.000106 |
| Transfer (bytes) | 4,336,721 | 3,324,986 | -1,011,735 | 4,336,721–4,336,721 | 3,324,986–3,324,986 |

The mobile Lighthouse timing medians are neutral within the run variation: English LCP changed by 8 ms and Arabic LCP by 44 ms while total transfer fell by approximately 33%. Desktop English improved materially. Arabic desktop has substantial base variance and overlapping ranges; its reported LCP median is not sufficient evidence of a repeatable implementation regression, while its transfer reduction is stable.

## Lighthouse LCP Discrepancy

The apparent 7.2–7.4 second mobile LCP is Lighthouse's simulated/lantern audit value, not a later browser paint. The representative head report used `throttlingMethod: "simulate"`: `audits.largest-contentful-paint.numericValue` was 7,439 ms, while the same report's `observedLargestContentfulPaint` was 514 ms. The LCP breakdown for the EventGift Egypt image summed to approximately 514 ms (8.7 ms TTFB, 75.3 ms resource-load delay, 39.2 ms resource-load duration, and 391.0 ms element-render delay).

The saved trace contained only the text candidate and the EventGift Egypt image candidate; there was no later 7.4 second `largestContentfulPaint::Candidate`. In the head trace, the image was discovered at approximately 84 ms, began loading at 102 ms, finished at 123 ms, and was `loading="eager"`. The comparable base trace discovered the same image at approximately 331 ms, began loading at 334 ms, finished at 346 ms, and retained `loading="lazy"`. The earlier 180–363 ms observation in the initial local report is the same observed-trace-versus-simulated-audit discrepancy, not evidence of a hidden later paint.

Independent direct Chrome/CDP probes under the same mobile emulation confirmed the causal scheduling change. Across three runs per locale, BASE's EventGift Egypt request was `Low` priority with a median start near 3.4 seconds for English and 4.1 seconds for Arabic; HEAD was `High` priority with median starts near 0.38 and 0.48 seconds respectively. This validates earlier discovery and scheduling without treating the simulated audit value as a production field measurement.

## Resource Policy

| Resource | BASE | HEAD |
| --- | --- | --- |
| EventGift Egypt selected candidate | `/projects/eventgift-egypt/optimized/thumb-480.avif` | `/projects/eventgift-egypt/optimized/thumb-480.avif` |
| EventGift Egypt loading / priority | `lazy` / `Low` (CDP) | `eager` / `High` (CDP) |
| EventGift Egypt transfer | 85,189 bytes CDP transfer; 84,889-byte body | 85,189 bytes CDP transfer; 84,889-byte body |
| EventGift UAE selected candidate | `/projects/eventgift-uae/home.webp` | `/projects/eventgift-uae/optimized/thumb-480.avif` |
| EventGift UAE loading / priority | `lazy` / `Low` | `lazy` / `Low` |
| EventGift UAE transfer | 1,101,222 bytes in Lighthouse | 88,370 bytes in Lighthouse |

HEAD did not download both the optimized EventGift UAE thumbnail and `home.webp`; the original request was absent in the direct network observations. The controlled total-page transfer reduction was 1,011,735 bytes on each route/profile pair.

## SEO Metadata Side Effect

Classification: **INTENDED EXISTING POLICY**.

The existing `scripts/apply-seo-accessibility.mjs` generator maps an existing project's `thumbnail.webp800` to `og:image` and `twitter:image` when that file exists, otherwise it uses `/profile.png`. For project case-study and backend-case-study JSON-LD, the same existing field becomes `CreativeWork.image`. EventGift UAE had no optimized thumbnail fields before this PR, so its EN/AR Work and Backend metadata used the documented fallback; adding the generated variants made the existing policy select `/projects/eventgift-uae/optimized/thumb-800.webp`. Other already-optimized projects follow the same policy. The EN/AR reciprocal routes, canonical URLs, hreflang, JSON-LD, robots, and sitemap checks all pass, so no SEO decoupling is required for this PR.

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
