# Deep runtime and media review — 2026-09-24

Compared with commit `3fb7a091` (the first static-runtime/image-delivery fix).
This review keeps the static-export architecture and preserves original media.

## Reproduced issues and repairs

- At 768px, the desktop navigation extended beyond the viewport on the shared
  header. The tablet layout now keeps the mobile menu until 1024px. Its links
  remain visible, and widening the viewport closes the menu, restores scrolling
  and moves focus to a visible header link.
- Load More replaced existing card nodes and left keyboard focus on the body
  when its button disappeared. It now appends only new cards and focuses the
  first new result. Initial enhancement retains matching server-rendered cards.
- Some decorative presentation classes were added only during idle JavaScript,
  allowing a transient narrow-screen overflow. Body and home hero presentation
  classes are now in the HTML, including when JavaScript is disabled.
- The solid green contact action failed automated text-contrast checks. Dark
  text corrects the contrast in both languages without changing its layout.
- Full-view images left the background interactive and retained their previous
  scroll position/source. The modal now makes the background inert, restores it
  on dismissal, resets scrolling and clears the original image source on close.
- 54 image preloads bypassed lazy-preview behavior. They were removed where the
  image had no eager use; lazy previews now advertise their actual layout size.
- Lab/plugin and some backend/profile images were outside the first optimization
  pass. They now have responsive derivatives; plugin galleries also retain
  explicit access to originals through the shared full-view controller.
- The localhost server exposed development files by URL and served POST like
  GET. Dot paths and dependencies are blocked, symlinks are confined to the
  workspace, HEAD omits the response body, and unsupported methods return 405.
- Generated HTML writes now replace complete files atomically, with bounded
  retries for transient Windows file locks.

## Image results

The pipeline encodes from originals at WebP quality 72/effort 6, retaining any
existing derivative that is already smaller. Six representative source samples
were compared and Arabic text/image crops inspected before the broader run.

| Comparable group | Before | After |
| --- | ---: | ---: |
| Same 271 sources, approximately 960px previews | 37,606,894 B | 28,182,334 B |
| All 530 selected originals versus their 960px previews | 628,644,074 B | 38,501,026 B |

The same-set reduction is 25.1% beyond the first compression pass. Coverage grew
by 259 sources. Nine additional canonical Work covers received 480/800 AVIF/WebP
variants; existing optimized covers were not regenerated. All originals remain
byte-identical, checked against recorded SHA-256 hashes.

Cold local Chrome measurements using Resource Timing image-body bytes:

| Page and viewport | Before | After |
| --- | ---: | ---: |
| English home, 320px | 256,898 B | 197,762 B |
| English home, 1280px | 1,167,262 B | 847,798 B |
| Developer Lab, 320px | 4,773,218 B | 97,542 B |
| Developer Lab, 1280px | 4,773,218 B | 262,952 B |

These are local transferred image bytes, not load-time percentages or field Core
Web Vitals. Gallery-scroll totals are omitted because explicit image decoding in
the follow-up audit changed the sampling point.

## Verification coverage

`npm run verify` includes the existing static, SEO, security, budget, browser and
generator-idempotency checks. The new `npm run test:deep` adds all 191 HTML pages
at 320/768px, 44 WCAG-tagged axe scans across 11 paired EN/AR templates, tablet-menu
transitions, retained Work cards/keyboard focus, gallery candidate selection,
modal state, no-JavaScript access to all 45 Work links and localhost boundaries.
Desktop cold checks still cover all 191 pages. Automated checks are supplemented
by EN/AR visual inspection; they are not a claim of complete WCAG conformance.

## Follow-up verification and selective AVIF compression

A second requested review compared against `5697061e`. All rendered raster images
without responsive candidates were inventoried; none exceeded the existing
100,000-byte selection threshold. The remaining heavy responsive previews were
then evaluated with the locked Sharp/libvips tools. No new production interaction
defect was found in this follow-up.

55 sources had an approximately 960px WebP preview larger than 150,000 bytes.
AVIF at quality 55, effort 5 and 4:4:4 chroma was encoded from each source, using
the same dimensions. 50 sources passed the requirement to save at least 10% at
**every** width; five retained WebP only. The accepted 150 AVIF files are used in
186 picture deliveries across 58 EN/AR pages. Existing WebP files and all original
media remain byte-identical. These are delivery savings, not repository-size
savings: the fallback and original formats are retained.

| Same 50-source group | Existing WebP | New AVIF |
| --- | ---: | ---: |
| Approximately 960px previews | 12,452,610 B | 9,732,139 B |
| All three responsive widths | 39,540,496 B | 30,584,436 B |

The 960px reduction is **21.85% additional** for this selected group. Four visual
samples covered fine English text, Arabic headings/body copy and photographic
detail, including a separate crop of small Arabic body text at native resolution.

Cold local Chrome measurements used fresh contexts, 320px/2x and 1280px/1x,
reduced motion, explicit decoding of the first three gallery images and a final
network-idle wait. These rows had matching requested resource identities after
normalizing `.avif` to `.webp`:

| Page and viewport | Before image-body bytes | After image-body bytes |
| --- | ---: | ---: |
| EN A2M, 320px/2x | 731,030 | 661,644 |
| EN A2M, 1280px/1x | 1,870,390 | 1,546,592 |
| AR A2M, 320px/2x | 727,063 | 657,677 |
| EN Genedy, 320px/2x | 2,589,921 | 2,306,747 |
| EN Genedy, 1280px/1x | 3,103,511 | 2,783,564 |

Other gallery samples are excluded from before/after totals because Chrome's
lazy-loading window requested different additional images. These measurements do
not establish a load-time percentage or field Core Web Vitals.

The repeatable pipeline is `npm run images:display`, with the selective AVIF step
also available as `npm run images:heavy`. Cached results prevent progressive
recompression. `npm run verify` now additionally checks AVIF dimensions/byte
savings, source/fallback markup and generator idempotency. Eight cold EN/AR
mobile/desktop format cases cover native AVIF selection, a simulated unsupported
AVIF type falling back to WebP, no duplicate-format downloads, deferred originals
and preserved gallery width. Existing all-191-page desktop/mobile/tablet checks,
44 automated accessibility scans and interactive regression coverage remain.
