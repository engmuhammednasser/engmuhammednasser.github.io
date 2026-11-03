# Maintaining the bilingual Blog

The Blog is generated static HTML. Its maintained sources are `data/blog.json`,
the paired Markdown files in `content/blog/`, and reviewed images in
`images/blog/<slug>/`. Edit those sources and regenerate; do not maintain the
English and Arabic HTML outputs independently.

The listing routes are `/blog/` and `/ar/blog/`. Each catalog entry produces
`/blog/<slug>/` and `/ar/blog/<slug>/`. The header and article language links keep
the current article when switching languages. Reading and return links work
without JavaScript.

## Catalog and article content

`data/blog.json` contains `schemaVersion: 1` and an `articles` array. The array
order is the listing order. Each article has these fields:

| Field | Required value |
| --- | --- |
| `slug` | A unique lowercase kebab-case name, also used by the public routes. |
| `datePublished`, `dateModified` | Real calendar dates in `YYYY-MM-DD` format. Modification must not predate publication. |
| `title`, `description` | Objects with nonempty `en` and `ar` strings. These supply visible text and search/share metadata. |
| `tags` | A nonempty array of topic strings. The listing shows the first three; the article shows all. |
| `image` | A root-relative cover path under `/images/blog/<slug>/`. |
| `socialImage` | A root-relative social-preview image path under the same image directory. |
| `imageAlt` | Nonempty `en` and `ar` descriptions of the cover. |
| `content` | `en: "content/blog/<slug>.en.md"` and `ar: "content/blog/<slug>.ar.md"`. Both files must exist. |

The template supplies the article title as the single H1, author, dates, estimated
reading time, language link, and table of contents. Start Markdown sections at H2
(`##`); H2 headings become table-of-contents links. Use lower-level headings for
subsections. Heading IDs are generated in document order, so changing section
order also changes their fragment links.

Use fenced code blocks with a simple language label such as `powershell` or
`json`. Code renders as escaped text, stays left-to-right in both languages, and
can receive keyboard focus for horizontal scrolling. Tables have their own
scrollable container. Reading time is an estimate derived from the article text.

PowerShell blocks have a localized Copy button, enabled by the article-only
`scripts/blog-copy.js` enhancement. It copies the exact visible code, including
line breaks, and announces success only when the Clipboard API completes. If
clipboard access fails or is unavailable, it selects the code for manual copying
and explains the fallback. It never executes commands. Buttons stay hidden when
JavaScript is unavailable; the code remains selectable and readable.

Raw HTML and inline Markdown images are intentionally rejected. Use the catalog
cover; additional image placements need an explicit rendering and delivery change.
Article links accept HTTPS URLs, root-relative local paths, and heading fragments.
External links receive `noopener noreferrer`. Keep examples free of credentials,
private screenshots, real user-directory paths, and client information. Check
technical claims against their linked primary sources when updating an article.

## Image delivery

Keep each article's assets in `images/blog/<slug>/`. The current article uses
`cover-1200.webp`, `cover-600.webp`, and `social.jpg`. The renderer adds a responsive
600/1200 `srcset` when the corresponding `-600.webp` variant exists. Covers use a
1200 × 627 aspect ratio; the social preview is a 1200 × 627 JPEG and must meet the
existing social-image checks. Inspect both the small listing card and the large
article image before publishing.

The listing defers cover loading; the article prioritizes its hero. Do not add a
second eager hero or serve an oversized original as the card image. Catalog paths
must point to files that exist and are tracked for packaging.

For the tracked SVG cover recipe, regenerate only the selected article:

```sh
npm run images:blog -- --articles qodo-codex-windows
```

## Generate and validate

After dependency installation, run the supported Blog generation command:

```sh
npm ci
npm run blog
```

This generates the paired listings and article pages, adds Blog navigation, then
refreshes route inventory, SEO, and the shared page enhancements. Route generation
must precede inventory and SEO so that metadata references real HTML pages.
Generated SEO includes canonical and language-alternate links, article sharing
metadata, and `BlogPosting` structured data. Review source changes and generated
output together, including the existing pages whose header gains the Blog link.

The mobile-navigation generator intentionally asserts the eligible-page total
in `scripts/apply-mobile-navigation.mjs` (currently 192). Adding another paired
article increases that total by two. Recompute and update the assertion after
creating the real routes; also extend representative browser coverage when a new
article introduces a different content or interaction pattern.

Run the repository's required validation sequence:

```sh
npm run verify
npm run test:site-package
npm run build:site
npm run verify:site
npm run check:site
git diff --check
```

Stage the intended new source files, routes, and assets before package validation:
the curated package selects tracked and staged paths. Do not stage unrelated
work. Never repair the disposable package by hand.

The focused browser check is `node scripts/test-blog-browser.mjs`. It verifies
English/Arabic read-more and return navigation, language switching, article SEO,
table-of-contents targets, cover loading, accessible LTR code blocks, responsive
columns, header fit, four WCAG scans, and reading without JavaScript. It uses the existing installed Chrome,
Chromium, or Edge browser and respects `SITE_ROOT` when checking the built package.
Keep this check in both source and packaged verification when extending the Blog.

Before release, inspect English and Arabic at desktop and narrow mobile widths,
including a cold direct article load and the social preview. A passing check does
not authorize publication or a Pages source change. Follow the reviewed-PR and
publishing policy in [the Pages artifact guide](pages-artifact.md).
