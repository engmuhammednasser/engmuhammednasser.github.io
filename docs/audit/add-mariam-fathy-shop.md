# Mariam Fathy Shop project addition

## Screenshot Source

- Authoritative read-only source: `C:\Users\CITY STORE\Desktop\screen-shot-marim`
- Source groups used: `dashboard`, `desktop`, and `mobile`.
- The source directory was inspected but not modified. No production dashboard or production database was accessed.
- The live storefront remains behind a Cloudflare verification challenge, so the supplied screenshot source is the evidence used for this portfolio gallery.

## Counts

- Dashboard: 9 screenshots
- Desktop: 16 screenshots (8 Arabic, 8 English)
- Mobile: 16 screenshots (7 Arabic, 9 English)
- Total: 41 screenshots

## Sequence

The final sequence is deterministic and identical in the English and Arabic case-study routes:

1. Dashboard
2. Desktop Storefront
3. Mobile Storefront

Within the Desktop and Mobile groups, variants are ordered Arabic then English. Files within each source folder use natural filename order. The source folders and source files remain unchanged.

## Privacy

- The user confirmed that the customer name, phone number, and receipt information visible in the dashboard screenshots are fictional/assumed values.
- All 41 supplied screenshots are therefore included; none were skipped for privacy reasons.
- The dashboard gallery is published as a visual project record only. No live dashboard URL, credentials, session data, production customer data, tokens, or private files were used.

## Gallery

The committed gallery assets are grouped and ordered as follows:

- Dashboard: `dashboard/01-category-edit.png`, `dashboard/02-categories.png`, `dashboard/03-orders-management.png`, `dashboard/04-hero-slides.png`, `dashboard/05-dashboard-light.png`, `dashboard/06-admin-login.png`, `dashboard/07-dashboard-dark.png`, `dashboard/08-media-library.png`, `dashboard/09-orders-receipt.png`.
- Desktop Arabic: `desktop/ar/01-contact.png`, `desktop/ar/02-checkout.png`, `desktop/ar/03-home.png`, `desktop/ar/04-cart.png`, `desktop/ar/05-shop.png`, `desktop/ar/06-product.png`, `desktop/ar/07-about.png`, `desktop/ar/08-journal.png`.
- Desktop English: `desktop/en/01-about.png`, `desktop/en/02-journal.png`, `desktop/en/03-cart.png`, `desktop/en/04-checkout.png`, `desktop/en/05-contact.png`, `desktop/en/06-home.png`, `desktop/en/07-shop.png`, `desktop/en/08-product.png`.
- Mobile Arabic: `mobile/ar/01-contact.webp`, `mobile/ar/02-checkout.webp`, `mobile/ar/03-home.webp`, `mobile/ar/04-cart.png`, `mobile/ar/05-shop.webp`, `mobile/ar/06-product.webp`, `mobile/ar/07-journal.webp`.
- Mobile English: `mobile/en/01-about.webp`, `mobile/en/02-cart.png`, `mobile/en/03-checkout.webp`, `mobile/en/04-contact.webp`, `mobile/en/05-full-cart.webp`, `mobile/en/06-home.webp`, `mobile/en/07-journal.webp`, `mobile/en/08-shop.webp`, `mobile/en/09-product.webp`.

The ordered source-to-target mapping is canonicalized in `data/mariam-fathy-gallery.json`. Captions are localized and contain no internal-source or local-demo wording.

## Performance

- All 41 gallery images use `loading="lazy"` and `decoding="async"`.
- The gallery does not preload or eagerly load screenshot assets. Only the responsive hero is critical; the Work card continues to use the existing optimized thumbnail pipeline.
- Desktop and dashboard previews use a bounded viewport; mobile previews use a bounded portrait viewport with width-constrained, auto-height images so the source aspect ratio is preserved without distortion.
- The existing `scripts/case-study-screenshots.js` runtime remains scoped and event-driven for hover/focus screenshot scrolling; its image-load/decode measurement handles lazy previews that were not complete at initialization.
- Gallery cards render WebP previews from `projects/mariam-fathy-shop/previews/`; originals remain available through `data-full-src` and are not used as card `src` values.

## Final Media Delivery

### Hero

- Original cover: `projects/mariam-fathy-shop/cover.png` — 2,632,399 bytes.
- Optimized mobile candidate: `projects/mariam-fathy-shop/optimized/hero-800.avif` — 21,575 bytes on disk; Chrome transfer measured 21,770 bytes at 390x844.
- Optimized desktop candidate: `projects/mariam-fathy-shop/optimized/hero-1200.avif` — 41,493 bytes on disk; Chrome transfer measured 41,688 bytes at 1350x940.
- The responsive AVIF preload and `<picture>` selected the same candidate. `cover.png` was not requested and no duplicate hero request was observed.
- WebP sources remain available as the fallback; the optimized 1200px hero remained visually sharp at the tested desktop width.

### Gallery

- 41 original screenshots are preserved.
- 41 optimized WebP preview representations are available; total preview bytes: 1,725,508.
- Dashboard/Desktop previews are constrained to 960px wide; Mobile previews are constrained to 480px wide with preserved portrait aspect ratios.
- Preview images remain lazy-loaded and async-decoded. No gallery preload, eager loading, or `fetchpriority="high"` was added.
- Network inspection found no gallery originals on initial load or after progressive preview scrolling. The first original loaded only after the full-view interaction and displayed successfully in the accessible full-view dialog.
- `projects/mariam-fathy-shop/media-manifest.json` records the deterministic hero and gallery media outputs.

## Content

- The Work entry remains in the `ecommerce` category, immediately after Techmart, with `featured: false`.
- The title, eyebrow, description, hero opening, badges, features, role, and CTA now identify the project clearly as a custom Laravel e-commerce platform with a MoonShine administration dashboard.
- The verified stack remains `Laravel`, `PHP`, `MoonShine`, `Inertia.js`, and `React`.
- The live URL remains `https://mariamfathyshop.com/`; no unsupported business, traffic, revenue, or performance claims were added.

## Validation

- `npm ci` — passed.
- `npm run work:data` — passed.
- `npm run filter:work` — passed.
- `npm run seo:apply` — passed after the content revision.
- `npm run verify` — passed, including static references, image delivery, runtime invariants, Work filtering/Load More behavior, accessibility/SEO, security hygiene, performance budgets, Chrome checks, mobile navigation, idempotency, and `git diff --check`.
- Targeted Chrome/CDP checks passed for both localized routes at 390x844 and 1350x940, including responsive hero selection, no duplicate hero/original-gallery requests, lazy preview loading, full-view original loading, 41 gallery cards, group order, Arabic direction, portrait mobile layout, keyboard/focus scrolling, and no horizontal overflow.

## Risks / notes

- The live storefront's Cloudflare verification challenge prevents independent production navigation and production screenshot capture during this revision.
- The dashboard screenshots remain local evidence and must not be represented as live administrative access.
- Accepted repository risks remain separate: incomplete or unavailable original Next.js source/build configuration, historical repository/media size, and production Core Web Vitals not yet measured.
