import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { readBlog, renderArticle, escapeHtml as escape } from "./blog-utils.mjs";
import { applyBlogNavigation } from "./apply-blog-navigation.mjs";
import { writeChanged } from "./static-site-utils.mjs";

const root = resolve(process.cwd());
const articles = readBlog(root);
const labels = {
  en: { title: "Blog", eyebrow: "DEVELOPMENT NOTES", description: "Practical notes on web development, technical decisions, and the tools behind the work.", latest: "Latest articles", home: "Home", read: "Read more", by: "By", author: "Muhammed Nasser", date: "Last reviewed", minutes: "min read · estimated", toc: "In this article", back: "All articles", language: "اقرأ بالعربية", topics: "Topics" },
  ar: { title: "مدونات", eyebrow: "من واقع التطوير", description: "مقالات عملية عن تطوير الويب والقرارات التقنية والأدوات التي أستخدمها في العمل.", latest: "أحدث المقالات", home: "الرئيسية", read: "اقرأ المزيد", by: "بقلم", author: "محمد ناصر", date: "آخر مراجعة", minutes: "دقائق قراءة تقريبًا", toc: "في هذا المقال", back: "جميع المقالات", language: "Read in English", topics: "الموضوعات" }
};
const routeFor = (locale, slug = "") => `${locale === "ar" ? "/ar" : ""}/blog/${slug ? `${slug}/` : ""}`;
const dateLabel = (date, locale) => new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
function cover(article, locale, card = false) {
  const thumbnail = article.image.replace(/-1200\.webp$/, "-600.webp");
  const responsive = thumbnail !== article.image && existsSync(resolve(root, thumbnail.slice(1)));
  return `<img src="${escape(article.image)}"${responsive ? ` srcset="${escape(thumbnail)} 600w, ${escape(article.image)} 1200w" sizes="${card ? "(min-width: 1100px) 400px, (min-width: 700px) 50vw, 100vw" : "(min-width: 1100px) 1000px, 100vw"}"` : ""} alt="${escape(article.imageAlt[locale])}" width="1200" height="627" loading="${card ? "lazy" : "eager"}" decoding="async"${card ? "" : ' fetchpriority="high"'}/>`;
}
function breadcrumb(locale, article = null) {
  const l = labels[locale];
  return `<nav class="blog-breadcrumbs" aria-label="${locale === "ar" ? "مسار التنقل" : "Breadcrumb"}"><a href="${locale === "ar" ? "/ar/" : "/"}">${l.home}</a><span aria-hidden="true">/</span>${article ? `<a href="${routeFor(locale)}">${l.title}</a><span aria-hidden="true">/</span><span>${locale === "ar" ? "مقال تقني" : "Technical article"}</span>` : `<span aria-current="page">${l.title}</span>`}</nav>`;
}
function indexBody(locale) {
  const l = labels[locale];
  return `<div class="blog-shell">${breadcrumb(locale)}<section class="blog-intro" aria-labelledby="blog-title"><p class="blog-eyebrow">${l.eyebrow}</p><h1 id="blog-title">${l.title}<span class="blog-title-dot" aria-hidden="true">.</span></h1><p class="blog-lead">${l.description}</p></section><section aria-labelledby="latest-articles"><div class="blog-section-heading"><h2 id="latest-articles">${l.latest}</h2><span>${articles.length.toLocaleString(locale === "ar" ? "ar-EG" : "en-GB")} ${locale === "ar" ? (articles.length === 1 ? "مقال" : "مقالات") : (articles.length === 1 ? "article" : "articles")}</span></div><div class="blog-grid">${articles.map((article) => {
    const rendered = renderArticle(readFileSync(resolve(root, article.content[locale]), "utf8"), locale);
    return `<article class="blog-card"><div class="blog-card-cover">${cover(article, locale, true)}</div><div class="blog-card-body"><div class="blog-card-meta"><time datetime="${article.datePublished}">${dateLabel(article.datePublished, locale)}</time><span>${rendered.readingMinutes} ${l.minutes}</span></div><div class="blog-tags">${article.tags.slice(0, 3).map((tag) => `<span dir="auto">${escape(tag)}</span>`).join("")}</div><h3><a href="${routeFor(locale, article.slug)}">${escape(article.title[locale])}</a></h3><p>${escape(article.description[locale])}</p><a class="blog-read-more" data-blog-read-more href="${routeFor(locale, article.slug)}" aria-label="${escape(`${l.read}: ${article.title[locale]}`)}">${l.read}<span aria-hidden="true">${locale === "ar" ? "←" : "→"}</span></a></div></article>`;
  }).join("")}</div></section></div>`;
}
function articleBody(locale, article) {
  const l = labels[locale];
  const other = locale === "ar" ? "en" : "ar";
  const rendered = renderArticle(readFileSync(resolve(root, article.content[locale]), "utf8"), locale);
  return `<div class="blog-shell blog-article">${breadcrumb(locale, article)}<article><div class="blog-article-heading"><p class="blog-eyebrow">${l.eyebrow}</p><div class="blog-tags">${article.tags.map((tag) => `<span dir="auto">${escape(tag)}</span>`).join("")}</div><h1>${escape(article.title[locale])}</h1><p class="blog-lead">${escape(article.description[locale])}</p><div class="blog-article-meta"><span>${l.by} <a href="${locale === "ar" ? "/ar/about/" : "/about/"}" rel="author">${l.author}</a></span><span>${l.date}: <time datetime="${article.dateModified}">${dateLabel(article.dateModified, locale)}</time></span><span>${rendered.readingMinutes} ${l.minutes}</span></div><a class="blog-language" href="${routeFor(other, article.slug)}" lang="${other}" hreflang="${other}">${l.language} <span aria-hidden="true">↗</span></a></div><div class="blog-hero-image">${cover(article, locale)}</div><div class="blog-reading-layout"><aside class="blog-toc"><details open><summary>${l.toc}</summary><nav aria-label="${l.toc}"><ol>${rendered.headings.filter((h) => h.depth === 2).map((h) => `<li><a href="#${h.id}">${escape(h.text)}</a></li>`).join("")}</ol></nav></details></aside><div class="blog-prose">${rendered.html}<div class="blog-end"><a class="blog-read-more" data-blog-back href="${routeFor(locale)}">${locale === "ar" ? "→" : "←"} ${l.back}</a></div></div></div></article></div>`;
}
let updated = 0;
for (const locale of ["en", "ar"]) {
  const template = readFileSync(resolve(root, locale === "ar" ? "ar/about/index.html" : "about/index.html"), "utf8");
  for (const article of [null, ...articles]) {
    const route = routeFor(locale, article?.slug);
    const other = locale === "ar" ? "en" : "ar";
    let html = template.replace(/<main\b[^>]*>[\s\S]*?<\/main>/i, `<main class="flex-1 blog-main" id="main-content">${article ? articleBody(locale, article) : indexBody(locale)}</main>`);
    html = html.replace(/<header\b[\s\S]*?<\/header>/i, (header) => header.replaceAll(`href="${other === "ar" ? "/ar/about/" : "/about/"}"`, `href="${routeFor(other, article?.slug)}"`));
    html = html.replace("</head>", '<link rel="stylesheet" href="/scripts/blog.css" data-blog-style/></head>');
    if (article) html = html.replace("</body>", '<script src="/scripts/blog-copy.js" defer data-blog-copy-script></script></body>');
    html = applyBlogNavigation(html, route);
    const file = resolve(root, route.slice(1), "index.html");
    mkdirSync(dirname(file), { recursive: true });
    if (!existsSync(file)) { writeFileSync(file, html, "utf8"); updated++; }
    else if (writeChanged(file, html)) updated++;
  }
}
console.log(`Rendered ${2 + articles.length * 2} bilingual blog routes (${updated} updated). Run route inventory and SEO generation afterward.`);
