import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const { projects } = JSON.parse(readFileSync(resolve(root, "data/projects.json"), "utf8"));

// Prefer a public-facing screen or an empty sign-in screen when the Work card
// contains an operational dashboard. These sources are already in the export.
const overrides = new Map([
  ["shipping-delivery-operations-platform", "/projects/shipping-delivery-operations-platform/02-public-landing-page.webp"],
  ["crm-order-management-system", "/projects/crm-order-management/تسجيل الدخول.png"]
]);

// Older case-study routes are still public even though they are not Work cards.
const additional = new Map([
  ["atour", "/projects/atour/frontend/01-homepage-hero-desktop.png"],
  ["ozone-clinic", "/projects/ozone-clinic/frontend/01-homepage-hero-desktop.png"],
  ["edusmart-system", "/backend/edusmart-system/01-login-page-desktop.png"]
]);
const aliases = new Map([["eventgift", "eventgift-uae"]]);
const sources = new Map(projects.map((project) => [project.slug, overrides.get(project.slug) ?? project.thumbnail.original]));
for (const [slug, source] of additional) sources.set(slug, source);

export function socialPreviewSpecs() {
  return [...sources].map(([slug, source]) => ({
    slug,
    source,
    // This historical public-site capture includes a WordPress admin toolbar.
    cropTop: slug === "baslim-auto" ? 23 : 0,
    output: `/projects/${slug}/social-preview.jpg`
  }));
}

export function socialPreviewForRoute(route) {
  if (["/", "/ar/", "/work/", "/ar/work/"].includes(route)) return "/projects/portfolio/social-preview.jpg";
  const match = route.match(/^\/(?:ar\/)?(?:work|backend)\/([^/]+)\/$/);
  if (!match) return null;
  const slug = aliases.get(match[1]) ?? match[1];
  return sources.has(slug) ? `/projects/${slug}/social-preview.jpg` : null;
}
