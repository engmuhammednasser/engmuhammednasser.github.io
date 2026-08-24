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

function upsertAttribute(tag, name, value = "") {
  const pattern = new RegExp(`\\s${name}(?:="[^"]*")?`, "i");
  if (pattern.test(tag)) return tag.replace(pattern, value ? ` ${name}="${value}"` : ` ${name}`);
  return tag.replace(/>$/, value ? ` ${name}="${value}">` : ` ${name}>`);
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

function normalizeButtonTag(tag) {
  let next = upsertAttribute(tag, "data-case-study-screenshot");
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

export function normalizeScreenshotButton(markup) {
  let next = markup.replace(/^<button\b[^>]*>/i, (tag) => normalizeButtonTag(tag));
  next = next.replace(/<img\b[^>]*>/i, (tag) => normalizeImageTag(tag));
  next = next.replace(/<(div|span)\b[^>]*aria-hidden="true"[^>]*>/gi, (tag) => normalizeStickyOverlay(tag));
  return next;
}

export function normalizeCaseStudyHtml(html) {
  const buttons = findScreenshotButtons(html);
  if (!buttons.length) return { html, count: 0 };

  let next = "";
  let cursor = 0;
  let changedCount = 0;
  for (const button of buttons) {
    const normalized = normalizeScreenshotButton(button.markup);
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
