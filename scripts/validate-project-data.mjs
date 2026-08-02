import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const dataPath = resolve(root, "data/projects.json");
const errors = [];
const categories = new Set(["ecommerce", "corporate", "services", "platforms"]);
const statuses = new Set(["published", "archived"]);
const availabilityByLiveUrl = (liveUrl) => (liveUrl ? "case-study+live" : "case-study");

function fail(message) {
  errors.push(message);
}

function nonEmpty(value, label) {
  if (typeof value !== "string" || !value.trim()) fail(`${label} must be a non-empty string`);
}

function localRouteExists(route) {
  if (typeof route !== "string" || !route.startsWith("/")) return false;
  const absolutePath = resolve(root, route.replace(/^\/+/, ""));
  return [absolutePath, `${absolutePath}.html`, `${absolutePath}/index.html`].some(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile()
  );
}

function localAssetExists(asset) {
  if (typeof asset !== "string" || !asset.startsWith("/")) return false;
  const absolutePath = resolve(root, asset.replace(/^\/+/, ""));
  return existsSync(absolutePath) && statSync(absolutePath).isFile();
}

if (!existsSync(dataPath)) {
  fail("data/projects.json is missing");
} else {
  let document;
  try {
    document = JSON.parse(readFileSync(dataPath, "utf8"));
  } catch (error) {
    fail(`data/projects.json is not valid JSON: ${error.message}`);
  }

  if (document) {
    if (document.schemaVersion !== 1) fail("schemaVersion must be 1");
    if (!Array.isArray(document.categories)) fail("categories must be an array");
    if (!Array.isArray(document.projects)) fail("projects must be an array");

    const categoryIds = document.categories?.map((category) => category?.id) ?? [];
    if (categoryIds.join(",") !== "all,ecommerce,corporate,services,platforms") {
      fail(`categories must use the canonical order; received ${categoryIds.join(",")}`);
    }
    for (const category of document.categories ?? []) {
      nonEmpty(category?.id, "category id");
      nonEmpty(category?.label?.en, `category ${category?.id} English label`);
      nonEmpty(category?.label?.ar, `category ${category?.id} Arabic label`);
    }

    const ids = new Set();
    const slugs = new Set();
    const caseStudies = new Set();
    for (const [index, project] of (document.projects ?? []).entries()) {
      const label = `projects[${index}]`;
      nonEmpty(project?.id, `${label}.id`);
      nonEmpty(project?.slug, `${label}.slug`);
      if (ids.has(project?.id)) fail(`duplicate project id: ${project.id}`);
      if (slugs.has(project?.slug)) fail(`duplicate project slug: ${project.slug}`);
      ids.add(project?.id);
      slugs.add(project?.slug);

      if (project?.id !== project?.slug) fail(`${label}: id and slug must match`);
      if (!categories.has(project?.category)) fail(`${project?.slug}: invalid category ${project?.category}`);
      if (!statuses.has(project?.status)) fail(`${project?.slug}: invalid status ${project?.status}`);
      if (project?.availability !== availabilityByLiveUrl(project?.liveUrl)) {
        fail(`${project?.slug}: availability does not match liveUrl`);
      }

      for (const locale of ["en", "ar"]) {
        nonEmpty(project?.title?.[locale], `${project?.slug} title.${locale}`);
        nonEmpty(project?.description?.[locale], `${project?.slug} description.${locale}`);
        nonEmpty(project?.eyebrow?.[locale], `${project?.slug} eyebrow.${locale}`);
        const expectedPath = `/${locale === "ar" ? "ar/" : ""}work/${project?.slug}/`;
        if (project?.caseStudy?.[locale] !== expectedPath) {
          fail(`${project?.slug}: caseStudy.${locale} must be ${expectedPath}`);
        }
        if (!localRouteExists(project?.caseStudy?.[locale])) {
          fail(`${project?.slug}: missing case-study route ${project?.caseStudy?.[locale]}`);
        }
        if (caseStudies.has(project?.caseStudy?.[locale])) {
          fail(`duplicate case-study path: ${project.caseStudy[locale]}`);
        }
        caseStudies.add(project?.caseStudy?.[locale]);
      }

      if (!Array.isArray(project?.technologies) || project.technologies.length === 0) {
        fail(`${project?.slug}: technologies must be a non-empty array`);
      } else {
        project.technologies.forEach((technology, technologyIndex) =>
          nonEmpty(technology, `${project.slug} technologies[${technologyIndex}]`)
        );
      }

      const thumbnail = project?.thumbnail;
      if (!localAssetExists(thumbnail?.original)) fail(`${project?.slug}: missing thumbnail ${thumbnail?.original}`);
      for (const variant of ["avif480", "avif800", "webp480", "webp800"]) {
        if (thumbnail?.[variant] !== null && !localAssetExists(thumbnail?.[variant])) {
          fail(`${project?.slug}: missing thumbnail variant ${thumbnail[variant]}`);
        }
      }
      if (!Number.isInteger(thumbnail?.width) || thumbnail.width <= 0) fail(`${project?.slug}: invalid thumbnail width`);
      if (!Number.isInteger(thumbnail?.height) || thumbnail.height <= 0) fail(`${project?.slug}: invalid thumbnail height`);
      if (typeof thumbnail?.aspectRatio !== "number" || thumbnail.aspectRatio <= 0) {
        fail(`${project?.slug}: invalid thumbnail aspect ratio`);
      }

      if (project?.liveUrl !== null) {
        try {
          const liveUrl = new URL(project.liveUrl);
          if (!["http:", "https:"].includes(liveUrl.protocol) || !liveUrl.hostname) {
            fail(`${project.slug}: liveUrl must be an http(s) URL`);
          }
        } catch {
          fail(`${project.slug}: invalid liveUrl ${project.liveUrl}`);
        }
      }
    }
  }
}

if (errors.length) {
  console.error(`Found ${errors.length} project-data validation failures:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const document = JSON.parse(readFileSync(dataPath, "utf8"));
const counts = Object.fromEntries(
  [...categories].map((category) => [category, document.projects.filter((project) => project.category === category).length])
);
const classification = Object.fromEntries(
  ["case-study", "live-only", "archive-only", "case-study+live"].map((type) => [
    type,
    document.projects.filter((project) => project.availability === type).length
  ])
);
console.log(`Validated ${document.projects.length} canonical projects, ${document.categories.length} categories, and ${document.projects.length * 2} localized case-study routes.`);
console.log(`Category counts: ${JSON.stringify(counts)}`);
console.log(`Link classifications: ${JSON.stringify(classification)}`);
