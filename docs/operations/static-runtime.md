# Static runtime and responsive image delivery

The production HTML is the complete rendered page. Navigation uses ordinary links;
mobile navigation, Work filters/Load More, screenshot full view and decorative
effects use the maintained controllers under `scripts/`.

The retired Next.js bootstrap attempted to hydrate stale serialized React trees
against the independently maintained HTML. It emitted `enqueueModel` and
`Connection closed` exceptions. `npm run runtime:static` removes only executable
framework script tags, inline Flight bootstrap scripts and framework JavaScript
preloads. It preserves the page markup, JSON-LD, compiled CSS, fonts, native scripts,
and the archival `_next/` files and `.txt` payloads. This is not a reconstructed
Next.js build. Internal navigation intentionally loads complete HTML documents.

Run `npm run runtime:static` after importing a page from an older export or running
a legacy page generator. `npm run verify` now rejects framework bootstraps and any
browser exceptions, including the previously accepted hydration errors.

Screenshot buttons use the shared native scroll/full-view controller. Legacy
project-specific hover controllers must not be included alongside it. Backend
`View full image:` buttons are normalized to the same contract. The modal traps
keyboard focus and restores focus/scroll state on dismissal.

The surface styles preserve sticky positioning on desktop case-study sidebars.
At mobile widths, sidebars stay in normal flow with no top offset, so they cannot
cover the following gallery heading.

## Images

`npm run images:display` normalizes gallery controls, then discovers currently
rendered project, plugin, backend and profile images larger than 100,000 bytes
without responsive variants. It creates WebP derivatives at up to
480, 960 and 1600 pixels wide, preserving aspect ratio and avoiding enlargement.
The 16,380-pixel height limit accommodates long screenshots within WebP limits.
Metadata and byte counts are stored in `data/image-delivery.json`. Original files
and `data-full-src` targets remain intact; originals are requested only when the
visitor opens full view. Existing specialized responsive pictures are retained.

The script updates image `srcset`, sizes and matching image preloads together to
avoid downloading both the original and the preview. Its manifest lets subsequent
runs skip unchanged sources and recipes. Preview quality starts at 72 with encoder
effort 6 (falling back to 68 only when needed to beat the original file size).
Existing smaller derivatives are retained instead of growing them. The recipe is
recorded per image; three bounded workers encode from the originals, not from
lossy previews. Inspect text and screenshot crops when changing source material.

Lazy previews use `sizes="auto, ..."` so supported browsers select a derivative
from the actual rendered width, with the existing sizes list as a fallback.
Preloads of images used only by lazy previews are removed. Explicit width/height
attributes remain present. Lab screenshots share the original-resolution full-view
controller used by project galleries. Original bytes and SHA-256 hashes are checked.

Body/hero presentation classes are rendered into HTML rather than waiting for idle
JavaScript. The tablet header uses the mobile navigation until 1024px. Resizing or
leaving a page closes the menu and restores scrolling. Load More appends new cards,
preserves existing image nodes and focuses the first new result. Full view makes
the background inert, resets its scroll position and releases the original on close.

Generic Work thumbnails use the locked Sharp dependency and the canonical project
catalog, including projects outside the initial 12 cards. Select explicitly:

```sh
npm run images:thumbnails -- --projects example-project
```

Add the resulting AVIF/WebP paths to that project's thumbnail fields, then run
`npm run filter:work`. The existing 480/800 widths, aspect ratio, 150,000-byte
variant budget and single eager/high first-card policy remain enforced. Specialized
legacy media generators can still require ImageMagick.

## Verification

`npm run verify` includes cold browser checks across all static HTML routes,
strict console/HTTP checks, CSS presence, deferred originals, mobile/desktop EN/AR
filtering, navigation, full-view keyboard behavior and all prior repository gates.
`npm run test:static:browser` runs the additional browser checks independently.
`npm run test:deep` adds 320/768px coverage across all HTML pages, WCAG-tagged axe
checks on 11 representative templates in both locales, no-JavaScript Work browsing,
tablet-menu transitions, image selection and full-view state restoration. It also
checks that the localhost server blocks development metadata/dependencies and
handles GET/HEAD while rejecting other methods. The same gate runs in CI.
Production real-user performance must still be measured separately.
