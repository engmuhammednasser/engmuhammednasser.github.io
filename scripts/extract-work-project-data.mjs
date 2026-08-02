import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const slugsFromHomepage = new Set([
  "eventgift-uae",
  "techmart",
  "oryxbag",
  "botella",
  "ashhalancarrental"
]);
const categories = new Set(["ecommerce", "corporate", "services", "platforms"]);
const categoryDefinitions = [
  { id: "all", label: { en: "All", ar: "الكل" } },
  { id: "ecommerce", label: { en: "E-Commerce", ar: "متاجر إلكترونية" } },
  { id: "corporate", label: { en: "Corporate Sites", ar: "مواقع شركات" } },
  { id: "services", label: { en: "Services & Booking", ar: "خدمات وحجوزات" } },
  { id: "platforms", label: { en: "Platforms", ar: "المنصات" } }
];

function decodeHtml(value) {
  return value
    .replace(/<!-- -->/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanText(value = "") {
  return decodeHtml(value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
}

function balancedDiv(html, start) {
  const token = /<div\b[^>]*>|<\/div>/gi;
  token.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = token.exec(html))) {
    if (match[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) return html.slice(start, token.lastIndex);
    } else {
      depth += 1;
    }
  }
  throw new Error("Unbalanced Work card div");
}

function findCards(html) {
  const starts = [...html.matchAll(/<div\b[^>]*class="[^"]*\bgroup flex flex-col\b[^"]*"[^>]*>/g)].map(
    (match) => match.index
  );
  return starts.map((start) => balancedDiv(html, start));
}

function firstMatch(card, pattern) {
  return card.match(pattern)?.[1] ?? "";
}

function firstExternalUrl(card) {
  return card.match(/<a\b[^>]*href="(https?:\/\/[^\"]+)"/)?.[1] ?? null;
}

function imageDimensions(pathname) {
  if (!pathname?.startsWith("/")) return { width: null, height: null };
  const absolutePath = join(root, pathname.replace(/^\/+/, ""));
  if (!existsSync(absolutePath)) return { width: null, height: null };
  const result = spawnSync("identify", ["-format", "%w %h", absolutePath], { encoding: "utf8" });
  if (result.status !== 0) return { width: null, height: null };
  const [width, height] = result.stdout.trim().split(/\s+/).map(Number);
  return Number.isInteger(width) && Number.isInteger(height) ? { width, height } : { width: null, height: null };
}

function getSlug(card, locale) {
  const prefix = locale === "ar" ? "\\/ar\\/work\\/" : "\\/work\\/";
  const match = card.match(new RegExp(`href="${prefix}([^"/]+)\\/?"`));
  if (!match) throw new Error(`Could not determine project slug in ${locale} Work card`);
  return match[1];
}

function getThumbnail(slug, currentPath) {
  const manifestPath = join(root, "projects", slug, "optimized", "manifest.json");
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const variant = (name) =>
      existsSync(join(root, "projects", slug, "optimized", name))
        ? `/projects/${slug}/optimized/${name}`
        : null;
    const original = `/${manifest.source.replaceAll("\\", "/")}`;
    const dimensions = imageDimensions(original);
    return {
      original,
      avif480: variant("thumb-480.avif"),
      avif800: variant("thumb-800.avif"),
      webp480: variant("thumb-480.webp"),
      webp800: variant("thumb-800.webp"),
      width: dimensions.width ?? manifest.variants?.["thumb-800.webp"]?.width ?? null,
      height: dimensions.height ?? manifest.variants?.["thumb-800.webp"]?.height ?? null,
      aspectRatio: dimensions.width && dimensions.height ? dimensions.width / dimensions.height : null
    };
  }

  const dimensions = imageDimensions(currentPath);
  return {
    original: currentPath,
    avif480: null,
    avif800: null,
    webp480: null,
    webp800: null,
    width: dimensions.width,
    height: dimensions.height,
    aspectRatio: dimensions.width && dimensions.height ? dimensions.width / dimensions.height : null
  };
}

function extractLocaleCards(file, locale) {
  const html = readFileSync(join(root, file), "utf8");
  const cards = findCards(html);
  const records = new Map();

  for (const card of cards) {
    const slug = getSlug(card, locale);
    const category = card.match(/data-work-category="([^"]+)"/)?.[1] ?? null;
    if (!categories.has(category)) throw new Error(`Invalid category for ${slug}: ${category}`);

    const title = cleanText(firstMatch(card, /<h3\b[^>]*>([\s\S]*?)<\/h3>/));
    const description = cleanText(firstMatch(card, /<p(?:\s|>)[^>]*>([\s\S]*?)<\/p>/));
    const eyebrow = cleanText(firstMatch(card, /<div class="text-xs font-bold[^>]*>([\s\S]*?)<\/div>/));
    const currentImage = firstMatch(card, /<img\b[^>]*src="([^"]+)"/);
    const techBlock = firstMatch(card, /<div class="mt-6 flex flex-wrap gap-2">([\s\S]*?)<\/div>/);
    const technologies = [...techBlock.matchAll(/<span\b[^>]*>([\s\S]*?)<\/span>/g)].map((match) => cleanText(match[1]));
    const internalCaseStudy = card.match(
      new RegExp(`href="${locale === "ar" ? "\\/ar" : ""}\\/work\\/${slug}\\/?"`)
    );

    records.set(slug, {
      slug,
      category,
      featured: slugsFromHomepage.has(slug),
      title: { [locale]: title },
      description: { [locale]: description },
      eyebrow: { [locale]: eyebrow },
      technologies,
      thumbnail: getThumbnail(slug, currentImage),
      caseStudyPath: internalCaseStudy ? `/${locale === "ar" ? "ar/" : ""}work/${slug}/` : null,
      liveUrl: firstExternalUrl(card),
      status: "published"
    });
  }
  return records;
}

const en = extractLocaleCards("work/index.html", "en");
const ar = extractLocaleCards("ar/work/index.html", "ar");
if (en.size !== 43 || ar.size !== 43) throw new Error(`Expected 43 Work cards, got EN=${en.size}, AR=${ar.size}`);

const projects = [...en.keys()].map((slug) => {
  const english = en.get(slug);
  const arabic = ar.get(slug);
  if (!arabic) throw new Error(`Missing Arabic Work card for ${slug}`);
  if (english.category !== arabic.category) throw new Error(`Category mismatch for ${slug}`);
  if (english.liveUrl !== arabic.liveUrl) throw new Error(`Live URL mismatch for ${slug}`);
  if (!english.caseStudyPath || !arabic.caseStudyPath) throw new Error(`Missing case study path for ${slug}`);

  return {
    id: slug,
    slug,
    category: english.category,
    featured: english.featured,
    title: { en: english.title.en, ar: arabic.title.ar },
    description: { en: english.description.en, ar: arabic.description.ar },
    eyebrow: { en: english.eyebrow.en, ar: arabic.eyebrow.ar },
    technologies: english.technologies,
    thumbnail: english.thumbnail,
    caseStudy: { en: english.caseStudyPath, ar: arabic.caseStudyPath },
    liveUrl: english.liveUrl,
    availability: english.liveUrl ? "case-study+live" : "case-study",
    status: english.status
  };
});

mkdirSync(join(root, "data"), { recursive: true });
writeFileSync(
  join(root, "data", "projects.json"),
  `${JSON.stringify({ schemaVersion: 1, categories: categoryDefinitions, projects }, null, 2)}\n`,
  "utf8"
);
console.log(`Extracted ${projects.length} canonical Work projects.`);
