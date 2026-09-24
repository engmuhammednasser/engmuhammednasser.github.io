# Torathyat / Bin Hilal case study

The existing `/work/torathyat/` and `/ar/work/torathyat/` routes document one
project in two phases: Torathyat on WordPress/WooCommerce, followed by the
completed Bin Hilal rebuild on Laravel. The owner confirmed completion and
delivery. Do not infer data migration, payment integrations, launch dates, or
performance improvements from the screenshots.

## Content ownership

- `data/projects.json` owns the current title, summary, stack and Work thumbnail.
- The paired case-study HTML files own the bilingual story and galleries.
- `scripts/torathyat-case-study.css` is scoped to these two routes.
- The original seven screenshots and their original media paths remain intact.
- Do not rerun `create-torathyat-armadillo-case-studies.mjs`; it predates this
  content and the native runtime and would overwrite the maintained pages.

## New screenshots

Public viewport captures taken on 2026-09-24:

| File under `projects/torathyat/bin-hilal/` | Source |
| --- | --- |
| `cover.jpg` | `https://torathyat.com/` |
| `02-category-plates.jpg` | `https://torathyat.com/product-category/صحون/` |
| `03-product-bowl.jpg` | `https://torathyat.com/product/صحفة-عيش-مقاس-وسط/` |
| `04-product-mobile.jpg` | Same product, mobile viewport |

Full-page captures from the in-app browser contained duplicated content and
blank regions, so only visually checked viewport captures were retained.
Some live homepage categories have no image element; these are not failed image
loads. The mobile capture uses the product page to show a complete product image.
Capture dates are not project delivery dates.

`manifest.json` records intrinsic dimensions, original sizes and preview sizes.
The previews use Sharp WebP quality 82, effort 6, smart subsampling, and widths
480/960/original width without enlargement. Originals are served only when a
gallery image is opened; responsive previews remain lazy. The hero is eager.
Use `npm run images:thumbnails -- --projects torathyat` for the Work card only.

After editing content, run the Work, native-runtime and SEO generators followed
by `npm run verify`. Check both languages and the original-size image viewer.
