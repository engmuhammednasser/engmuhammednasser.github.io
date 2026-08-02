# Target Architecture — Sprint 0 Proposal

## Design principles

The target should preserve the current visual identity, content, English/Arabic URLs, RTL behavior, case studies, and GitHub Pages deployment model. It should reduce duplication and runtime work without introducing a new platform or a large abstraction layer.

The first prerequisite is to recover or re-establish the real source/build boundary. Editing only committed HTML is not a durable architecture change because the next export or mutation script can overwrite it.

## Proposed delivery flow

```text
Source content + components + public assets
        ↓
Validation (content, links, images, metadata, budgets)
        ↓
Deterministic static build/export
        ↓
Static artifact inspection
        ↓
GitHub Pages deployment
```

The generated artifact should be treated as disposable output. If GitHub Pages continues to serve the repository root, the build can publish the validated export to that root or to a Pages artifact; the public route contract must remain unchanged either way.

## Suggested source boundaries

Use the existing framework if it can be recovered. A minimal logical layout is:

```text
src/
├── app/                       # route composition and localized route shells
├── components/
│   ├── layout/                # Header, Footer, MobileMenu
│   ├── portfolio/             # ProjectCard, ProjectGrid, ProjectGallery
│   ├── ui/                    # small shared presentational pieces
│   └── effects/               # optional homepage/fine-pointer effects only
├── data/
│   ├── projects.ts            # one project catalog
│   ├── navigation.ts          # EN/AR navigation labels and paths
│   └── services.ts            # service content if it is reused
├── lib/
│   ├── images.ts              # asset role/variant helpers
│   ├── routes.ts              # public URL and locale helpers
│   └── seo.ts                 # route metadata generation
└── styles/

public/
├── projects/{slug}/           # original/case-study media and card variants
├── logos/
└── icons/

out/                            # generated static export, not source
```

This is a boundary proposal, not a requirement to reproduce this exact tree. If the original source uses another valid structure, keep its conventions while enforcing the same ownership boundaries.

## Central project contract

Project rendering should consume one catalog. The contract should explicitly distinguish archive, case-study, and live-site behavior:

```ts
type Locale = "en" | "ar";
type ProjectCategory = "ecommerce" | "corporate" | "services" | "platforms";
type ProjectAvailability = "case-study" | "archive-only" | "live-site-only";

interface Project {
  slug: string;
  category: ProjectCategory;
  availability: ProjectAvailability;
  featured?: boolean;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  technologies: string[];
  thumbnail: string;
  caseStudyPath?: string;
  liveUrl?: string;
  gallery?: Array<{
    src: string;
    alt: Record<Locale, string>;
  }>;
}
```

Rendering rules:

- `ProjectCard` owns one card markup contract and image attributes.
- `ProjectGrid` receives filtered/sliced projects and does not infer categories from DOM strings.
- A missing `caseStudyPath` never silently falls back to `/work/`; the availability value controls the CTA.
- English and Arabic use the same project records with localized fields and explicit route helpers.
- Ordering and category membership are data, not duplicated arrays in mutation scripts.

## Route and rendering boundaries

Static content should render at build time. Keep client-side behavior limited to real interactive islands:

- `MobileMenu`: keyboard/focus behavior and open/close state.
- `WorkFilter`: category selection over the current rendered subset; no DOM-wide inference.
- `LoadMore` or pagination: progressively exposes additional project cards.
- `InteractiveHero`: optional and isolated from the content tree.

The initial `/work/` HTML should contain approximately 9–12 cards, matching the existing roadmap. Additional projects should be available through a crawlable route or server/build-generated page. If a client Load More control is used, its fallback must still expose all project URLs to crawlers and no-JavaScript users.

## Runtime effects boundary

Effects must be optional decoration, never a dependency of content or navigation:

1. Render the static page fully usable without effect JavaScript.
2. Load the global light CSS fallback by default only if it materially contributes to identity.
3. Initialize WebGL only on desktop fine-pointer devices after core content is usable, preferably from an idle callback with a timeout fallback.
4. Disable WebGL and splash cursor for coarse pointers and reduced motion.
5. Remove the document-wide `MutationObserver` and DOM role inference; components emit their final classes at render time.
6. Pause and tear down animation loops when hidden or offscreen, not just skip drawing.
7. Keep blur/backdrop effects bounded and provide a simple static fallback.

The effects module should expose an explicit `mountHeroEffects(element, options)` cleanup contract. No effect should scan the complete page or mutate unrelated content.

## Asset strategy

Keep case-study originals when they are part of the content, but assign explicit asset roles:

```text
public/projects/{slug}/
├── original/                  # retained source/case-study media
├── thumb-480.webp
├── thumb-800.webp
├── thumb-480.avif             # optional when supported by the build tool
└── thumb-800.avif
```

The initial card contract should use a bounded thumbnail, `width`/`height` or a stable aspect ratio, `decoding="async"`, and `loading="lazy"` for offscreen cards. Only the verified LCP image should be prioritized. Full-page gallery images should be lazy by default and should not be preloaded as a group.

Do not delete current assets as part of the architecture migration. First produce a reference map, retain originals, switch consumers to verified variants, then review orphan candidates in a separate reversible change.

## SEO and localization boundary

`seo.ts` (or the equivalent framework metadata layer) should accept a route and locale and generate, in one place:

- localized title and description
- canonical URL
- `og:title`, `og:description`, `og:url`, and `og:image`
- Twitter card metadata
- optional `hreflang` links between valid EN/AR equivalents

The same route catalog should generate `sitemap.xml` and `robots.txt`. Metadata validation should fail the build for missing titles, descriptions, canonical URLs, invalid locale alternates, duplicate slugs, or an OG URL that does not match the page route.

Arabic must remain a first-class route tree with `lang="ar"`, `dir="rtl"`, localized copy, and explicit switch links. The canonical for an Arabic page must not silently point to English unless that is the intentional alternate policy.

## Validation and deterministic build

The minimum quality pipeline should be dependency-light and run before deployment:

```text
validate project catalog and duplicate slugs
validate internal routes and asset references
validate image roles, dimensions, and thumbnail budgets
validate EN/AR metadata and RTL attributes
build static export
inspect output for missing links/images and unexpected generated mutations
publish only the validated artifact
```

The current `scripts/check-static.mjs` can be retained and extended rather than replaced immediately. It should eventually validate `src`, `srcset`, CSS URLs, metadata, and generated route files. A committed GitHub Actions workflow should run the same commands used locally; no production merge should depend on an undocumented manual script order.

## Migration sequence

1. Recover or document the source build and make one clean export reproducible.
2. Add the project contract and metadata helpers without changing public URLs.
3. Replace card rendering at the source boundary; keep generated output changes out of hand-edited files.
4. Introduce image variants and loading/dimension rules.
5. Isolate effects and compare reduced-motion/mobile/desktop behavior.
6. Add Work progressive rendering and route-aware SEO.
7. Remove obsolete post-build mutations only after each responsibility has a source-level owner and a regression test.

## Guardrails

- Do not rename public case-study routes during migration.
- Do not remove Arabic routes or change RTL semantics.
- Do not deduplicate files by path replacement without a complete reference map.
- Do not make WebGL, client hydration, or effects necessary for navigation.
- Keep each migration reversible and verify both the source output and deployed-style static output.
