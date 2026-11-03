import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Marked, Renderer } from "marked";

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));

export function readBlog(root) {
  const catalog = JSON.parse(readFileSync(resolve(root, "data/blog.json"), "utf8"));
  if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.articles)) throw new Error("Unsupported blog catalog");
  const slugs = new Set();
  for (const article of catalog.articles) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug) || slugs.has(article.slug)) throw new Error("Blog slugs must be unique kebab-case names");
    slugs.add(article.slug);
    for (const key of ["datePublished", "dateModified"]) {
      const value = article[key];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) throw new Error(`${article.slug}: invalid ${key}`);
    }
    if (article.dateModified < article.datePublished) throw new Error(`${article.slug}: modification predates publication`);
    for (const locale of ["en", "ar"]) {
      for (const key of ["title", "description", "imageAlt"]) if (typeof article[key]?.[locale] !== "string" || !article[key][locale].trim()) throw new Error(`${article.slug}: missing ${locale} ${key}`);
      const expected = `content/blog/${article.slug}.${locale}.md`;
      if (article.content?.[locale] !== expected || !existsSync(resolve(root, expected))) throw new Error(`${article.slug}: missing or unexpected ${locale} content path`);
    }
    for (const key of ["image", "socialImage"]) {
      if (typeof article[key] !== "string" || !/^\/images\/blog\/[a-z0-9-]+\/[a-z0-9.-]+$/.test(article[key]) || !existsSync(resolve(root, article[key].slice(1)))) throw new Error(`${article.slug}: missing or invalid ${key}`);
    }
    if (!Array.isArray(article.tags) || !article.tags.length || article.tags.some((tag) => typeof tag !== "string" || !tag.trim())) throw new Error(`${article.slug}: invalid tags`);
  }
  return catalog.articles;
}

export function renderArticle(markdown, locale) {
  const headings = [];
  let codeIndex = 0;
  const base = new Renderer();
  const parser = new Marked({ gfm: true, async: false });
  parser.use({ renderer: {
    html() { throw new Error("Blog Markdown must not contain raw HTML; use Markdown syntax"); },
    image() { throw new Error("Article images must use the reviewed catalog cover; inline images need an explicit delivery recipe"); },
    heading({ text, depth, tokens }) {
      if (depth < 2) throw new Error("The page template owns the article H1; start Markdown sections at H2");
      const id = `section-${headings.length + 1}`;
      headings.push({ id, depth, text: text.replace(/[`*_]/g, "") });
      return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
    },
    code({ text, lang }) {
      const language = lang?.split(/\s/)[0] || "text";
      if (!/^[a-z0-9+-]+$/i.test(language)) throw new Error("Invalid code language label");
      const id = `blog-code-${++codeIndex}`;
      const copyable = language.toLowerCase() === "powershell";
      const label = locale === "ar" ? "نسخ" : "Copy";
      const copy = copyable ? `<button type="button" class="blog-copy-button" data-blog-copy hidden aria-controls="${id}" aria-label="${locale === "ar" ? "نسخ أوامر PowerShell" : "Copy PowerShell commands"}"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg><span data-blog-copy-label>${label}</span></button>` : "";
      return `<div class="blog-code"><div class="blog-code-toolbar"><span class="blog-code-label" aria-hidden="true">${escapeHtml(language)}</span>${copy}</div><pre id="${id}" dir="ltr" tabindex="0" aria-label="${locale === "ar" ? "مقطع برمجي" : "Code sample"}: ${escapeHtml(language)}"><code>${escapeHtml(text)}\n</code></pre>${copyable ? '<p class="blog-copy-status" data-blog-copy-status role="status" aria-live="polite"></p>' : ""}</div>\n`;
    },
    link({ href, title, tokens }) {
      if (!/^(https:\/\/|\/(?!\/)|#[a-z0-9-]+$)/i.test(href) || /[\u0000-\u0020\\]/.test(href)) throw new Error(`Unsupported article link: ${href}`);
      const external = href.startsWith("https://");
      return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ""}${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${this.parser.parseInline(tokens)}</a>`;
    },
    table(token) {
      base.parser = this.parser;
      return `<div class="blog-table" tabindex="0" role="region" aria-label="${locale === "ar" ? "جدول قابل للتمرير" : "Scrollable table"}">${base.table(token)}</div>\n`;
    }
  } });
  const html = parser.parse(markdown.replace(/^\uFEFF/, ""));
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return { html, headings, readingMinutes: Math.max(1, Math.ceil(words / (locale === "ar" ? 170 : 200))) };
}
