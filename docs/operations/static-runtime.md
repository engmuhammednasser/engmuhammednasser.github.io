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

`npm run images:display` discovers currently rendered project images larger than
300,000 bytes without responsive variants. It creates WebP derivatives at up to
480, 960 and 1600 pixels wide, preserving aspect ratio and avoiding enlargement.
The 16,380-pixel height limit accommodates long screenshots within WebP limits.
Metadata and byte counts are stored in `data/image-delivery.json`. Original files
and `data-full-src` targets remain intact; originals are requested only when the
visitor opens full view. Existing specialized responsive pictures are retained.

The script updates image `srcset`, sizes and matching image preloads together to
avoid downloading both the original and the preview. Its manifest lets subsequent
runs skip unchanged sources. Preview quality starts at 82 (falling back to 76 or
70 only when needed to beat the original file size); inspect text and screenshot
crops when introducing different source material.

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
Production real-user performance must still be measured separately.
