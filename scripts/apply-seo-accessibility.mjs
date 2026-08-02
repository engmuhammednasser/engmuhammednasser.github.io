import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const origin = "https://engmuhammednasser.github.io";
const routesDocument = JSON.parse(readFileSync(resolve(root, "data/routes.json"), "utf8"));
const projectsDocument = JSON.parse(readFileSync(resolve(root, "data/projects.json"), "utf8"));
const projects = new Map(projectsDocument.projects.map((project) => [project.slug, project]));

const siteName = { en: "Muhammed Nasser", ar: "محمد ناصر" };
const defaultTitle = {
  en: "Muhammed Nasser | WordPress & WooCommerce Developer",
  ar: "محمد ناصر | مطوّر WordPress وWooCommerce"
};
const defaultDescription = {
  en: "WordPress & WooCommerce Developer for Custom Stores, Plugins & Laravel Systems.",
  ar: "مطوّر وردبريس وووكومرس ببني مواقع، متاجر، إضافات، ثيمز، وأنظمة Backend مخصصة."
};
const pageLabels = {
  en: { work: "Work", backend: "Backend Systems", lab: "Developer Lab" },
  ar: { work: "الأعمال", backend: "أنظمة Backend", lab: "مختبر المطور" }
};

function decode(value = "") {
  return value
    .replace(/<!-- -->/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

function escapeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function routeRecord(route) {
  return routesDocument.routes.find((candidate) => candidate.route === route);
}

function projectFor(route) {
  const match = route.match(/^\/(?:ar\/)?(work|backend)\/([^/]+)\/$/);
  return match ? projects.get(match[2]) ?? null : null;
}

function localeFor(route) {
  return route === "/ar/" || route.startsWith("/ar/") ? "ar" : "en";
}

function pageType(route) {
  return routeRecord(route)?.pageType ?? "page";
}

function visibleText(fragment) {
  return decode(fragment.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<style\b[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " "));
}

function firstHeading(html) {
  return visibleText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
}

function firstUsefulParagraph(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const paragraphs = [...main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => visibleText(match[1]))
    .filter((text) => text.length >= 45 && !/^©/.test(text));
  return paragraphs[0] ?? "";
}

function metadataFor(route, html) {
  const locale = localeFor(route);
  const type = pageType(route);
  const project = projectFor(route);
  const heading = firstHeading(html);
  const paragraph = firstUsefulParagraph(html);
  const currentDescription = decode(html.match(/<meta\b[^>]*name="description"[^>]*content="([^"]*)"/i)?.[1] ?? "");
  const currentTitle = decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  let title = currentTitle || defaultTitle[locale];
  let description = currentDescription || defaultDescription[locale];

  if (route === "/" || route === "/ar/") {
    title = defaultTitle[locale];
    description = defaultDescription[locale];
  } else if (type === "work-index") {
    title = `${pageLabels[locale].work} | ${siteName[locale]}`;
    description = paragraph || (locale === "en" ? "Explore selected WordPress, WooCommerce, corporate, services, and platform projects by Muhammed Nasser." : "تصفح مجموعة من مشاريع ووردبريس ووكومرس والمواقع corporate والخدمات والمنصات التي نفذها محمد ناصر.");
  } else if (type === "backend-index") {
    title = `${pageLabels[locale].backend} | ${siteName[locale]}`;
    description = paragraph || (locale === "en" ? "Explore backend systems, integrations, and application work by Muhammed Nasser." : "تصفح أنظمة Backend والتكاملات وأعمال التطبيقات التي نفذها محمد ناصر.");
  } else if (type === "developer-lab") {
    title = `${pageLabels[locale].lab} | ${siteName[locale]}`;
    description = paragraph || (locale === "en" ? "Explore developer tools, plugins, and technical experiments by Muhammed Nasser." : "تصفح الأدوات والإضافات والتجارب التقنية في مختبر محمد ناصر.");
  } else if (project && type === "case-study") {
    title = `${project.title[locale]} | ${siteName[locale]}`;
    description = project.description[locale];
  } else if (type === "backend-case-study") {
    title = `${heading || project?.title[locale] || currentTitle} | ${pageLabels[locale].backend} | ${siteName[locale]}`;
    description = paragraph || project?.description[locale] || currentDescription || defaultDescription[locale];
  } else if (type === "lab-plugin") {
    title = `${heading || currentTitle} | ${pageLabels[locale].lab} | ${siteName[locale]}`;
    description = paragraph || currentDescription || defaultDescription[locale];
  } else if (type === "utility-error") {
    title = currentTitle || (locale === "en" ? "Page not found" : "الصفحة غير موجودة");
    description = "";
  } else if (heading) {
    title = `${heading} | ${siteName[locale]}`;
    description = paragraph || currentDescription || defaultDescription[locale];
  }

  const indexable = routeRecord(route)?.indexable && type !== "utility-error";
  const canonical = indexable ? `${origin}${route}` : null;
  const socialImage = project?.thumbnail?.webp800 && existsSync(resolve(root, project.thumbnail.webp800.replace(/^\/+/, "")))
    ? `${origin}${project.thumbnail.webp800}`
    : `${origin}/profile.png`;
  const nodes = [];
  const webPageType = type === "work-index" || type === "backend-index" ? "CollectionPage" : "WebPage";
  if (indexable) {
    nodes.push({
      "@context": "https://schema.org",
      "@type": webPageType,
      name: title,
      description,
      url: canonical,
      inLanguage: locale
    });
    if (project && (type === "case-study" || type === "backend-case-study")) {
      const creativeWork = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title[locale],
        description: project.description[locale],
        url: canonical,
        inLanguage: locale
      };
      if (project.thumbnail?.webp800 && existsSync(resolve(root, project.thumbnail.webp800.replace(/^\/+/, "")))) creativeWork.image = `${origin}${project.thumbnail.webp800}`;
      nodes.push(creativeWork);
    }
    if (route === "/" || route === "/ar/") {
      nodes.push({
        "@context": "https://schema.org",
        "@type": "Person",
        name: siteName[locale],
        url: canonical,
        image: `${origin}/profile.png`,
        jobTitle: locale === "en" ? "WordPress & WooCommerce Developer" : "مطوّر WordPress وWooCommerce"
      });
      nodes.push({ "@context": "https://schema.org", "@type": "WebSite", name: `${siteName[locale]} Portfolio`, url: canonical, inLanguage: locale });
    }
  }

  return { locale, title, description, canonical, socialImage, nodes, indexable };
}

function removeMetadata(html) {
  return html
    .replace(/<meta\b[^>]*(?:name="description"|name="robots"|property="og:[^"]+"|name="twitter:[^"]+")[^>]*>\s*/gi, "")
    .replace(/<link\b[^>]*rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<link\b[^>]*rel="alternate"[^>]*hreflang="[^"]+"[^>]*>\s*/gi, "")
    .replace(/<script\b[^>]*type="application\/ld\+json"[^>]*data-seo-structured-data[^>]*>[\s\S]*?<\/script>\s*/gi, "");
}

function renderHead(metadata, route) {
  const tags = [
    `<meta name="description" content="${escapeHtml(metadata.description)}"/>`,
    metadata.indexable ? `<link rel="canonical" href="${escapeHtml(metadata.canonical)}"/>` : `<meta name="robots" content="noindex, nofollow"/>`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}"/>`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}"/>`,
    `<meta property="og:image" content="${escapeHtml(metadata.socialImage)}"/>`,
    `<meta property="og:url" content="${escapeHtml(metadata.canonical || `${origin}${route}`)}"/>`,
    `<meta property="og:type" content="website"/>`,
    `<meta name="twitter:card" content="summary_large_image"/>`,
    `<meta name="twitter:title" content="${escapeHtml(metadata.title)}"/>`,
    `<meta name="twitter:description" content="${escapeHtml(metadata.description)}"/>`,
    `<meta name="twitter:image" content="${escapeHtml(metadata.socialImage)}"/>`
  ];
  const record = routeRecord(route);
  if (metadata.indexable && record?.enEquivalent && record?.arEquivalent) {
    const enRoute = record.locale === "en" ? route : record.enEquivalent;
    const arRoute = record.locale === "ar" ? route : record.arEquivalent;
    tags.push(`<link rel="alternate" hreflang="en" href="${origin}${enRoute}"/>`);
    tags.push(`<link rel="alternate" hreflang="ar" href="${origin}${arRoute}"/>`);
    tags.push(`<link rel="alternate" hreflang="x-default" href="${origin}${enRoute}"/>`);
  }
  if (metadata.nodes.length) tags.push(`<script type="application/ld+json" data-seo-structured-data>${escapeJson(metadata.nodes)}</script>`);
  return tags.join("");
}

function addAccessibilitySemantics(html, locale) {
  let next = html;
  const mainMatch = next.match(/<main\b[^>]*>/i);
  if (mainMatch && !/\bid="[^"]+"/i.test(mainMatch[0])) {
    next = next.replace(mainMatch[0], mainMatch[0].replace(/>$/, ' id="main-content">'));
  }
  if (mainMatch && !/<a\b[^>]*data-skip-link/i.test(next)) {
    const mainId = next.match(/<main\b[^>]*\bid="([^"]+)"[^>]*>/i)?.[1] ?? "main-content";
    const label = locale === "ar" ? "تخطي إلى المحتوى الرئيسي" : "Skip to main content";
    const skip = `<a href="#${escapeHtml(mainId)}" data-skip-link>${escapeHtml(label)}</a>`;
    next = next.replace(/<body\b[^>]*>/i, (tag) => `${tag}${skip}`);
  }
  const navLabel = locale === "ar" ? "التنقل الرئيسي" : "Primary navigation";
  next = next.replace(/<nav\b(?![^>]*\baria-label=)([^>]*class="hidden md:flex[^>]*")>/i, `<nav aria-label="${navLabel}"$1>`);
  next = next.replace(/<button\b([^>]*aria-expanded="false"[^>]*)>/i, (tag, attrs) => /aria-controls=/.test(attrs) ? tag : `<button aria-controls="mobile-navigation"${attrs}>`);
  next = next.replace(/<div\b([^>]*role="dialog"[^>]*)>/i, (tag, attrs) => /\bid=/.test(attrs) ? tag : `<div id="mobile-navigation"${attrs}>`);
  return next;
}

for (const record of routesDocument.routes) {
  const file = resolve(root, record.file);
  const html = readFileSync(file, "utf8");
  const metadata = metadataFor(record.route, html);
  let next = removeMetadata(html);
  next = next.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  next = next.replace(/<\/head>/i, `${renderHead(metadata, record.route)}</head>`);
  next = addAccessibilitySemantics(next, metadata.locale);
  if (metadata.indexable && (pageType(record.route) === "developer-lab" || pageType(record.route) === "backend-index")) {
    next = next.replace(/<h3\b/gi, "<h2").replace(/<\/h3>/gi, "</h2>");
  }
  writeFileSync(file, next, "utf8");
}

console.log(`Applied route-specific metadata and accessibility semantics to ${routesDocument.routes.length} HTML routes.`);
