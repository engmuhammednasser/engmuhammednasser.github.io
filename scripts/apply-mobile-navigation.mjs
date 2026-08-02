import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const expectedPageCount = 184;
const runtimeTag = '<script src="/scripts/mobile-navigation.js" defer data-mobile-navigation="script"></script>';
const htmlFiles = [];

function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "scripts"].includes(entry.name)) continue;
    const file = join(directory, entry.name);
    if (entry.isDirectory()) collect(file);
    else if (entry.isFile() && extname(entry.name).toLowerCase() === ".html") htmlFiles.push(file);
  }
}

function addAttribute(tag, attributeName, attributeValue = null) {
  const attributePattern = new RegExp(`\\b${attributeName}(?:=|\\s|>)`, "i");
  if (attributePattern.test(tag)) return tag;
  const suffix = attributeValue === null ? attributeName : `${attributeName}="${attributeValue}"`;
  return `${tag.slice(0, -1)} ${suffix}>`;
}

function transform(file) {
  const original = readFileSync(file, "utf8");
  const toggleMatches = original.match(/<button\b[^>]*aria-controls="mobile-navigation"[^>]*>/gi) ?? [];
  const menuMatches = original.match(/<(?:div|nav)\b[^>]*id="mobile-navigation"[^>]*>/gi) ?? [];

  if (toggleMatches.length === 0 && menuMatches.length === 0) return original;
  if (toggleMatches.length !== 1 || menuMatches.length !== 1) {
    throw new Error(`${relative(root, file)} has an unexpected mobile navigation structure.`);
  }

  let next = original.replace(toggleMatches[0], (tag) => addAttribute(tag, "data-mobile-menu-toggle"));
  next = next.replace(menuMatches[0], (tag) => {
    let transformed = addAttribute(tag, "data-mobile-menu");
    transformed = addAttribute(transformed, "aria-hidden", "true");
    return addAttribute(transformed, "inert");
  });

  const menuIdIndex = next.indexOf('id="mobile-navigation"');
  if (menuIdIndex === -1) throw new Error(`${relative(root, file)} is missing the mobile navigation menu.`);
  const menuOpenStart = next.lastIndexOf("<", menuIdIndex);
  const menuOpenEnd = next.indexOf(">", menuOpenStart);
  const firstMenuSectionEnd = next.indexOf("</div>", menuOpenEnd + 1);
  const closeButtonStart = next.indexOf("<button", menuOpenEnd + 1);
  const closeButtonEnd = next.indexOf(">", closeButtonStart);
  if (menuOpenStart === -1 || menuOpenEnd === -1 || firstMenuSectionEnd === -1 || closeButtonStart === -1 || closeButtonStart > firstMenuSectionEnd || closeButtonEnd === -1) {
    throw new Error(`${relative(root, file)} is missing the mobile menu close button.`);
  }
  const closeButtonTag = next.slice(closeButtonStart, closeButtonEnd + 1);
  if (!/\baria-label\s*=/i.test(closeButtonTag)) {
    throw new Error(`${relative(root, file)} has an unexpected mobile menu close button.`);
  }
  next = `${next.slice(0, closeButtonStart)}${addAttribute(closeButtonTag, "data-mobile-menu-close")}${next.slice(closeButtonEnd + 1)}`;

  const runtimeCount = (next.match(/data-mobile-navigation="script"/g) ?? []).length;
  if (runtimeCount > 1) {
    throw new Error(`${relative(root, file)} has duplicate mobile navigation runtime tags.`);
  }
  next = next.replace(/<script\b[^>]*data-mobile-navigation="script"[^>]*><\/script>/gi, "");
  const workRuntime = next.match(/<script\b[^>]*data-work-archive[^>]*><\/script>/i)?.[0];
  if (workRuntime) {
    next = next.replace(workRuntime, `${runtimeTag}${workRuntime}`);
  } else {
    const closingBodyCount = (next.match(/<\/body>/gi) ?? []).length;
    if (closingBodyCount !== 1) throw new Error(`${relative(root, file)} does not have one closing body tag.`);
    next = next.replace(/<\/body>/i, `${runtimeTag}</body>`);
  }

  const finalToggleCount = (next.match(/\bdata-mobile-menu-toggle(?:=|\s|>)/g) ?? []).length;
  const finalMenuCount = (next.match(/\bdata-mobile-menu(?:=|\s|>)/g) ?? []).length;
  const finalCloseCount = (next.match(/\bdata-mobile-menu-close(?:=|\s|>)/g) ?? []).length;
  const finalRuntimeCount = (next.match(/data-mobile-navigation="script"/g) ?? []).length;
  if (finalToggleCount !== 1 || finalMenuCount !== 1 || finalCloseCount !== 1 || finalRuntimeCount !== 1) {
    throw new Error(`${relative(root, file)} failed mobile navigation transformation validation.`);
  }

  return next;
}

collect(root);
const eligibleFiles = htmlFiles.filter((file) => {
  const content = readFileSync(file, "utf8");
  return content.includes('aria-controls="mobile-navigation"') || content.includes('id="mobile-navigation"');
});

if (eligibleFiles.length !== expectedPageCount) {
  throw new Error(`Expected ${expectedPageCount} mobile navigation pages, found ${eligibleFiles.length}.`);
}

let changed = 0;
for (const file of eligibleFiles.sort()) {
  const original = readFileSync(file, "utf8");
  const transformed = transform(file);
  if (transformed !== original) {
    writeFileSync(file, transformed);
    changed += 1;
  }
}

console.log(`Mobile navigation transformation checked ${eligibleFiles.length} pages; changed ${changed}.`);
