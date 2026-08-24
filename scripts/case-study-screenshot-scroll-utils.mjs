import { existsSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

export const screenshotRuntime = '<script src="/scripts/case-study-screenshots.js" defer></script>';

export function caseStudyRouteFiles(root) {
  const files = [];
  for (const base of ["work", join("ar", "work")]) {
    const directory = join(root, base);
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith("_")) {
        const file = join(directory, entry.name, "index.html");
        if (existsSync(file)) files.push(file);
      }
    }
  }
  return files.sort((a, b) => relative(root, a).localeCompare(relative(root, b)));
}

export function findScreenshotButtons(html) {
  const buttons = [];
  const buttonPattern = /<button\b[\s\S]*?<\/button>/gi;
  let match;
  while ((match = buttonPattern.exec(html))) {
    const markup = match[0];
    if (!/<img\b/i.test(markup)) continue;
    if (!isScreenshotButton(markup)) continue;
    buttons.push({ start: match.index, end: buttonPattern.lastIndex, markup });
  }
  return buttons;
}

export function isScreenshotButton(markup) {
  return /\bdata-case-study-screenshot\b/i.test(markup)
    || /\bclass="[^"]*\bcase-shot\b/i.test(markup)
    || /\bdata-(?:full-)?src="/i.test(markup)
    || /aria-label="[^"]*(?:full screenshot|كاملاً)[^"]*"/i.test(markup)
    || /(?:Hover to scroll preview|Tap to view|Full page|صفحة كاملة|مرّر داخل الإطار)/i.test(markup);
}

export function canonicalScrollHint(locale) {
  return locale === "ar" ? "مرّر لعرض الصورة" : "Scroll to explore";
}

export const legacyHintTextPattern = "(?:Scroll\\s+(?:inside|screenshot|to\\s+view)|Hover\\s+to\\s+scroll|Tap\\s+to\\s+view|مرر|مرّر|اسحب)";

function upsertAttribute(tag, name, value = "") {
  const pattern = new RegExp(`\\s${name}(?:="[^"]*")?`, "i");
  if (pattern.test(tag)) return tag.replace(pattern, value ? ` ${name}="${value}"` : ` ${name}`);
  return tag.replace(/>$/, value ? ` ${name}="${value}">` : ` ${name}>`);
}

function readAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"));
  return match ? match[1] : "";
}

function upsertStyleProperty(style, property, value) {
  const parts = style.split(";").map((part) => part.trim()).filter(Boolean);
  const next = [];
  let found = false;
  for (const part of parts) {
    const colon = part.indexOf(":");
    if (colon === -1) {
      next.push(part);
      continue;
    }
    const name = part.slice(0, colon).trim().toLowerCase();
    if (name === property.toLowerCase()) {
      if (!found) next.push(`${property}:${value}`);
      found = true;
    } else {
      next.push(part);
    }
  }
  if (!found) next.push(`${property}:${value}`);
  return next.join(";");
}

function removeStyleProperty(style, property) {
  return style
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part.slice(0, part.indexOf(":")).trim().toLowerCase() !== property.toLowerCase())
    .join(";");
}

function updateStyleAttribute(tag, updates) {
  let style = "";
  const styleMatch = tag.match(/\sstyle="([^"]*)"/i);
  if (styleMatch) style = styleMatch[1];
  for (const [property, value] of updates) {
    if (value === null) style = removeStyleProperty(style, property);
    else style = upsertStyleProperty(style, property, value);
  }
  if (styleMatch) return tag.replace(/\sstyle="[^"]*"/i, ` style="${style}"`);
  return tag.replace(/>$/, ` style="${style}">`);
}

function normalizeButtonTag(tag, fallbackSource) {
  let next = upsertAttribute(tag, "data-case-study-screenshot");
  const source = readAttribute(next, "data-src") || readAttribute(next, "data-full-src") || fallbackSource;
  if (source && !readAttribute(next, "data-full-src")) next = upsertAttribute(next, "data-full-src", source);
  next = updateStyleAttribute(next, [
    ["overflow", null],
    ["overflow-x", "hidden"],
    ["overflow-y", "auto"],
    ["-webkit-overflow-scrolling", "touch"],
    ["overscroll-behavior", "contain"],
    ["touch-action", "pan-y"],
    ["scrollbar-width", "thin"],
    ["scrollbar-color", "rgba(148,163,184,.8) rgba(15,23,42,.65)"],
  ]);
  return next;
}

function normalizeImageTag(tag) {
  return updateStyleAttribute(tag, [
    ["position", "static"],
    ["width", "100%"],
    ["height", "auto"],
    ["max-width", "none"],
    ["transform", "translateY(0)"],
    ["transition", "none"],
    ["will-change", "auto"],
  ]);
}

function normalizeStickyOverlay(tag) {
  let next = tag;
  if (/\sstyle="/i.test(next) && /bottom:/i.test(next)) {
    next = updateStyleAttribute(next, [
      ["position", "sticky"],
      ["pointer-events", "none"],
    ]);
  }
  return next;
}

function removeLegacyHintNodes(markup) {
  let next = markup;
  next = next.replace(/<(span|div)\b[^>]*\bdata-case-study-scroll-hint\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  next = next.replace(new RegExp(`<div\\b(?=[^>]*aria-hidden)(?=[\\s\\S]*?${legacyHintTextPattern})[\\s\\S]*?<\\/div>`, "gi"), "");
  next = next.replace(new RegExp(`<span\\b(?=[^>]*(?:bottom-|bottom:|left-1\\/2))(?=[\\s\\S]*?${legacyHintTextPattern})[\\s\\S]*?<\\/span>\\s*<\\/span>`, "gi"), "");
  next = next.replace(new RegExp(`<span\\b(?=[^>]*(?:bottom-|bottom:|left-1\\/2))(?=[\\s\\S]*?${legacyHintTextPattern})[\\s\\S]*?<\\/span>`, "gi"), "");
  return next;
}

function appendCanonicalHint(markup, locale) {
  const hint = `<span data-case-study-scroll-hint aria-hidden="true">${canonicalScrollHint(locale)}</span>`;
  return markup.replace(/<\/button>$/i, `${hint}</button>`);
}

export function normalizeScreenshotButton(markup, locale = "en") {
  const imageSource = readAttribute(markup.match(/<img\b[^>]*>/i)?.[0] || "", "src");
  let next = removeLegacyHintNodes(markup);
  next = next.replace(/^<button\b[^>]*>/i, (tag) => normalizeButtonTag(tag, imageSource));
  next = next.replace(/<img\b[^>]*>/i, (tag) => normalizeImageTag(tag));
  next = next.replace(/<(div|span)\b[^>]*aria-hidden="true"[^>]*>/gi, (tag) => normalizeStickyOverlay(tag));
  return appendCanonicalHint(next, locale);
}

export function normalizeCaseStudyHtml(html) {
  const buttons = findScreenshotButtons(html);
  if (!buttons.length) return { html, count: 0 };
  const locale = /<html\b[^>]*\blang="ar"/i.test(html) ? "ar" : "en";

  let next = "";
  let cursor = 0;
  let changedCount = 0;
  for (const button of buttons) {
    const normalized = normalizeScreenshotButton(button.markup, locale);
    next += html.slice(cursor, button.start) + normalized;
    cursor = button.end;
    if (normalized !== button.markup) changedCount += 1;
  }
  next += html.slice(cursor);

  next = next.replace(
    /<div id="case-modal"[\s\S]*?<\/div><script>\(function\(\)\{document\.querySelectorAll\('\.case-shot'\)[\s\S]*?<\/script>/g,
    "",
  );
  if (!next.includes("/scripts/case-study-screenshots.js")) {
    next = next.replace("</body>", `${screenshotRuntime}</body>`);
  }
  return { html: next, count: buttons.length, changedCount };
}
