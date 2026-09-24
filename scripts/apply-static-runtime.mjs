import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { htmlFiles, attribute, setAttribute, writeChanged } from "./static-site-utils.mjs";

// Every interactive control is owned by the repository's native controllers.
// Keep the rendered document, CSS, fonts, JSON-LD and archival payload files;
// do not bootstrap React against stale Flight trees that no longer match it.
export function standaloneHtml(html, home = false) {
  let result = html
    .replace(/<body\b[^>]*>/i, (tag) => {
      const classes = attribute(tag, "class").split(/\s+/).filter(Boolean);
      if (!classes.includes("portfolio-polished")) classes.push("portfolio-polished");
      return setAttribute(tag, "class", classes.join(" "));
    })
    .replace(/<html\b[^>]*>/i, (tag) => {
      let next = tag;
      if (!attribute(tag, "lang")) next = setAttribute(next, "lang", "en");
      if (!attribute(tag, "dir")) next = setAttribute(next, "dir", attribute(next, "lang") === "ar" ? "rtl" : "ltr");
      return next;
    })
    .replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attributes, body) => {
      const source = attribute(" " + attributes, "src");
      return source.startsWith("/_next/") || (!source && /\bself\.__next_f\b/.test(body)) ? "" : tag;
    })
    .replace(/<link\b[^>]*>/gi, (tag) => {
      return attribute(tag, "href").startsWith("/_next/") &&
        (attribute(tag, "as") === "script" || attribute(tag, "rel") === "modulepreload") ? "" : tag;
    });
  if (home) result = result.replace(/(<main\b[^>]*>\s*<div\b[^>]*>\s*<section\b[^>]*class=")([^"]*)"/i, (match, prefix, classes) => {
    return prefix + (classes.split(/\s+/).includes("portfolio-hero-effect") ? classes : classes + " portfolio-hero-effect") + '"';
  });
  return result;
}

let changed = 0;
for (const file of htmlFiles(resolve("."))) {
  const home = [resolve("index.html"), resolve("ar/index.html")].includes(file);
  if (writeChanged(file, standaloneHtml(readFileSync(file, "utf8"), home))) changed++;
}
console.log(`Standalone runtime applied to ${changed} pages; CSS, fonts and native interactions preserved.`);
