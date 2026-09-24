import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

export function htmlFiles(root) {
  const files = [];
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if ([".git", "node_modules", ".cache", "scripts", "docs"].includes(entry.name)) continue;
      const file = join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.name.endsWith(".html")) files.push(file);
    }
  }
  visit(root);
  return files.sort();
}

export function attribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1] ?? "";
}

export function setAttribute(tag, name, value) {
  const pattern = new RegExp(`\\s${name}="[^"]*"`, "i");
  if (pattern.test(tag)) return tag.replace(pattern, ` ${name}="${value}"`);
  return tag.replace(/\/?\s*>$/, ` ${name}="${value}">`);
}

export function writeChanged(file, content) {
  if (readFileSync(file, "utf8").replace(/\r\n/g, "\n") === content.replace(/\r\n/g, "\n")) return false;
  writeFileSync(file, content);
  return true;
}

export function routeFor(root, file) {
  return "/" + relative(root, file).replaceAll("\\", "/").replace(/index\.html$/, "");
}
