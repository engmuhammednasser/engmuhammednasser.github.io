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
- The gallery does not preload or eagerly load screenshot assets. Only the existing project cover remains the Work-card/hero visual.
- Desktop and dashboard previews use a bounded viewport; mobile previews use a bounded portrait viewport with width-constrained, auto-height images so the source aspect ratio is preserved without distortion.
- The existing `scripts/case-study-screenshots.js` runtime is reused for hover/focus screenshot scrolling and keyboard-accessible controls; its image-load/decode measurement now also handles lazy images that were not complete at initialization.
- The existing optimized cover variants remain under `projects/mariam-fathy-shop/optimized/`; no second derivative thumbnail set was generated for the gallery.

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
- Targeted browser checks passed for both localized routes at desktop and mobile viewport sizes, including 41 gallery cards, group order, Arabic direction, portrait mobile layout, image paths, and keyboard/focus screenshot scrolling.

## Risks / notes

- The live storefront's Cloudflare verification challenge prevents independent production navigation and production screenshot capture during this revision.
- The dashboard screenshots remain local evidence and must not be represented as live administrative access.
- Accepted repository risks remain separate: incomplete or unavailable original Next.js source/build configuration, historical repository/media size, and production Core Web Vitals not yet measured.
