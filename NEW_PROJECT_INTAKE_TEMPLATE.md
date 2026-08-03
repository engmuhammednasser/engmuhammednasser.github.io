# New Portfolio Project Intake

Complete this file before implementing a new Work entry or case study. Replace all
bracketed prompts; do not leave assumptions hidden in the final PR. If a field does
not apply, write `N/A` and explain why.

## 1. Request and authorization

- Request owner: `[name or team]`
- Intake date: `[YYYY-MM-DD]`
- Requested release window: `[date or none]`
- Publication approved by: `[name/role]`
- Asset ownership or publication permission confirmed: `[yes/no + evidence]`
- Client/business name may be published: `[yes/no]`
- Live URL may be published: `[yes/no/not available]`
- Admin/dashboard screenshots may be published: `[yes/no/not supplied]`
- Customer/order/account data is fictional or sanitized: `[yes/no/not present]`
- Additional confidentiality limits: `[details]`

Stop intake if publication rights or privacy status are unresolved.

## 2. Identity and placement

- Working project name: `[name]`
- Final English title: `[title]`
- Final Arabic title: `[العنوان]`
- Proposed slug: `[lowercase-kebab-case]`
- Category: `[ecommerce/corporate/services/platforms]`
- Featured: `[true/false]`
- Availability type: `[case-study+live/case-study]`
- Requested Work placement: `[for example, immediately after <slug>]`
- Reason for placement: `[brief rationale]`
- Status: `[published]`

The final `id` and `slug` must match. Array order in `data/projects.json` is the
production Work order.

## 3. Link status

- Public URL: `[https://... or N/A]`
- URL classification: `[live production/demo/staging/private/unavailable]`
- Public URL tested on: `[YYYY-MM-DD]`
- Redirect/final URL: `[URL]`
- HTTPS valid: `[yes/no]`
- Authentication required: `[yes/no]`
- Link label must say: `[View Live Site/View Demo/no external CTA/custom]`
- Any geographic/device restrictions: `[details]`

Never label a demo, staging environment, or unavailable site as a live production
store. If no public URL is allowed, use `liveUrl: null` and `availability:
"case-study"`.

## 4. Accurate project facts

- Business/project purpose: `[factual summary]`
- Primary case-study objective: `[what this page should communicate]`
- Problem addressed: `[verified description]`
- Solution delivered: `[verified description]`
- Muhammed Nasser's key engineering contribution: `[specific responsibilities]`
- Frontend/storefront contribution: `[verified details or N/A]`
- Backend/API contribution: `[verified details or N/A]`
- Admin/dashboard contribution: `[verified details or N/A]`
- Performance considerations: `[verified implementation/constraint or N/A]`
- Other contributors/agencies to credit: `[details or N/A]`
- Technologies actually used: `[list]`
- Integrations actually used: `[list or N/A]`
- Features safe to claim publicly: `[list]`
- Features that must not be claimed: `[list or N/A]`
- Launch date or project period, if approved: `[date/range or omit]`
- Metrics/results with evidence and publication approval: `[metric + source or omit]`

Do not invent performance gains, conversion results, client quotes, user counts,
ownership claims, or technology choices.

## 5. Work card copy

### English

- Title: `[concise project title]`
- Eyebrow: `[category/technology label]`
- Description: `[one accurate sentence]`

### Arabic

- Title: `[عنوان واضح]`
- Eyebrow: `[التصنيف/التقنية]`
- Description: `[جملة عربية دقيقة وليست ترجمة آلية غير مراجعة]`

### Consistency review

- EN and AR communicate equivalent facts: `[yes/no]`
- Product/framework names use approved spelling: `[yes/no]`
- No private data or unsupported claim appears in copy: `[yes/no]`

## 6. Case-study copy

Provide approved EN and AR content for:

- Hero summary: `[EN]` / `[AR]`
- Problem: `[EN]` / `[AR]`
- Solution: `[EN]` / `[AR]`
- Key features: `[EN list]` / `[AR list]`
- Role: `[EN list]` / `[AR list]`
- Tech stack: `[shared verified list]`
- Opening badges: `[EN list]` / `[AR list]`
- CTA heading: `[EN]` / `[AR]`
- CTA body: `[EN]` / `[AR]`
- CTA button: `[EN]` / `[AR]`
- Contact destination: `[/contact/ and /ar/contact/]`
- Live/demo button: `[EN]` / `[AR]` / `[omit]`

## 7. Media inventory

List every supplied file before import.

| Source filename | Intended repository name/path | Type | Locale | Viewport | Purpose | Approved | Sanitized |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `[file]` | `projects/<slug>/...` | `[hero/gallery/logo]` | `[EN/AR/shared]` | `[desktop/mobile/dashboard]` | `[description]` | `[yes/no]` | `[yes/no]` |

Required decisions:

- Primary Work-card source: `[file]`
- Case-study hero source: `[file or same as primary]`
- Crop anchor: `[top/center/custom]`
- Hero aspect ratio: `[for example 16:9]`
- Gallery required: `[yes/no]`
- Originals required for lightbox/full view: `[yes/no]`
- Logos/icons with transparent background: `[files or N/A]`
- Alt text/caption owner: `[name]`

Overall media privacy classification (select one only):

- [ ] `PUBLIC SAFE` — supplied media is already safe to publish.
- [ ] `SANITIZED` — private values were replaced/removed and the result was reviewed.
- [ ] `PRIVATE — DO NOT PUBLISH` — keep out of the repository and production site.

### Screenshot privacy checklist

- [ ] No real customer/client full names unless explicitly approved.
- [ ] No personal email addresses or phone numbers.
- [ ] No shipping/billing addresses.
- [ ] No passwords, tokens, API keys, session IDs, or environment values.
- [ ] No private order/account identifiers.
- [ ] No unpublished prices, revenue, analytics, or internal metrics.
- [ ] No browser bookmarks, local paths, desktop notifications, or tool chrome.
- [ ] No third-party assets without publication rights.
- [ ] Visible pixels were inspected at full resolution.
- [ ] Metadata was reviewed/stripped by the optimization pipeline where applicable.

If realistic data is needed for a dashboard narrative, replace it with clearly
fictional values before capture. Record that decision here:

`[sanitization method and reviewer]`

## 8. Gallery mapping

Complete only when a gallery is approved.

| Order | Group | Locale | Original path | Preview width | English caption | Arabic caption | Full-view allowed |
| ---: | --- | --- | --- | ---: | --- | --- | --- |
| `1` | `[dashboard/desktop/mobile]` | `[EN/AR/shared]` | `projects/<slug>/...` | `[480/960/etc.]` | `[caption]` | `[التعليق]` | `[yes/no]` |

Gallery requirements:

- [ ] Preview is optimized and bounded.
- [ ] Preview uses `loading="lazy"` and `decoding="async"`.
- [ ] Original is absent from initial `src`/preload requests.
- [ ] Full original loads only after user interaction.
- [ ] Controls have localized accessible names.
- [ ] Lightbox supports keyboard activation and Escape close.
- [ ] Mobile and long-page images have a usable crop/scroll presentation.

## 9. SEO and route contract

Expected routes:

- English: `/work/[slug]/`
- Arabic: `/ar/work/[slug]/`

Proposed metadata:

- EN title: `[project title | Muhammed Nasser]`
- AR title: `[عنوان المشروع | محمد ناصر]`
- EN description: `[accurate description]`
- AR description: `[وصف دقيق]`
- Social image: `[optimized project image path]`

Acceptance:

- [ ] Both routes are intended to be indexable.
- [ ] Each route self-canonicalizes.
- [ ] EN/AR hreflang is reciprocal.
- [ ] English route is `x-default`.
- [ ] JSON-LD facts match visible copy and current URL.
- [ ] Both routes appear once in the sitemap.
- [ ] No query/filter state is being added as an indexable route.

## 10. Interaction and accessibility acceptance

- [ ] EN page is `lang="en" dir="ltr"`.
- [ ] AR page is `lang="ar" dir="rtl"`.
- [ ] One `h1` and one `main#main-content` exist.
- [ ] Skip link and labelled navigation work.
- [ ] Mobile menu opens/closes by pointer, Enter, Space, Escape, and overlay.
- [ ] Focus enters the menu, remains trapped while open, and is restored on close.
- [ ] Informative images have meaningful localized alt text.
- [ ] Decorative images use empty alt.
- [ ] External new-tab links use `rel="noopener noreferrer"`.
- [ ] No horizontal overflow at representative mobile widths.
- [ ] Gallery/lightbox is keyboard usable, if present.
- [ ] Reduced-motion users do not depend on animation to understand content.

## 11. Performance acceptance

- [ ] Work has exactly 12 initial cards.
- [ ] Only the first canonical Work image is eager/high priority.
- [ ] New Work card uses 480/800 AVIF with WebP fallback.
- [ ] Each generic thumbnail variant is within the 150,000-byte pipeline budget.
- [ ] Full original is not requested on initial Work load.
- [ ] The selected Work/hero resource is not transferred twice through duplicate
  preload and image requests.
- [ ] Gallery previews are lazy and originals are interaction-deferred.
- [ ] Required stylesheet loads with HTTP 200 and `text/css` on cold navigation.
- [ ] No new broad `MutationObserver`, DOM-wide scan, or unconditional WebGL work.
- [ ] No production Core Web Vitals claim is made without field evidence.

## 12. Implementation file plan

Expected source-of-truth edits:

- [ ] `data/projects.json`
- [ ] `projects/<slug>/...` originals
- [ ] EN/AR case-study route source or focused generator: `[paths]`
- [ ] Gallery mapping, if applicable: `[path or N/A]`
- [ ] Explicit page-count invariant update, if route count changes

Expected generated outputs:

- [ ] Four generic Work thumbnails and manifest
- [ ] Six EN/AR Work output files from `npm run filter:work`
- [ ] EN and AR case-study `index.html`
- [ ] `data/routes.json`
- [ ] SEO/accessibility metadata in route HTML
- [ ] `sitemap.xml` and `robots.txt`
- [ ] Stable mobile-navigation hooks
- [ ] Project-specific previews/media manifest, if applicable

Unexpected files that must not change:

`[list route families, vendor chunks, unrelated projects, or write “all unrelated files”]`

## 13. Validation record

Record exact outcomes rather than writing only “tested”.

| Validation | Result | Notes |
| --- | --- | --- |
| `npm ci` | `[pass/fail]` | `[details]` |
| `npm run work:data` | `[pass/fail]` | `[project count]` |
| `npm run filter:work` | `[pass/fail]` | `[12 initial / total]` |
| `npm run seo:inventory` | `[pass/fail]` | `[route/indexable counts]` |
| `npm run seo:apply` | `[pass/fail]` | `[sitemap count]` |
| `npm run mobile:apply` | `[pass/fail]` | `[eligible page count]` |
| `npm run verify` | `[pass/fail]` | `[summary]` |
| `git diff --check` | `[pass/fail]` | `[details]` |
| EN Work visual/interaction | `[pass/fail]` | `[browser/viewport]` |
| AR Work visual/interaction | `[pass/fail]` | `[browser/viewport]` |
| EN case study cold navigation | `[pass/fail]` | `[CSS/network/console]` |
| AR case study cold navigation | `[pass/fail]` | `[RTL/CSS/network/console]` |
| Media request policy | `[pass/fail]` | `[initial vs interaction]` |
| Existing case-study regression | `[pass/fail]` | `[route tested]` |

## 14. Pull request and production record

- Branch: `[content/<slug>]`
- Commit SHA: `[SHA]`
- PR: `[#]`
- Reviewed head SHA: `[SHA]`
- `Portfolio quality`: `[pass/fail]`
- Merge commit: `[SHA or pending]`
- Pages deployment SHA: `[SHA or pending]`
- Production EN route: `[verified/pending]`
- Production AR route: `[verified/pending]`
- Production Work EN/AR: `[verified/pending]`
- Rollback trigger/owner: `[details]`

## 15. Final approvals

- Content accuracy: `[name/date]`
- Arabic review: `[name/date]`
- Privacy/media review: `[name/date]`
- Engineering review: `[name/date]`
- Production visual verification: `[name/date or pending]`

Open questions or accepted project-specific risks:

`[details]`
