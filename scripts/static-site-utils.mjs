import { readdirSync, readFileSync, writeFileSync, renameSync, existsSync, unlinkSync } from "node:fs";
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
  // Readers see either the old or complete new page, never a truncated document.
  const temporary = `${file}.${process.pid}.tmp`;
  try {
    writeFileSync(temporary, content);
    for (let attempt = 0; ; attempt++) {
      try { renameSync(temporary, file); break; }
      catch (error) {
        if (process.platform !== "win32" || attempt >= 3 || !["EACCES", "EPERM", "EBUSY", "UNKNOWN"].includes(error.code)) throw error;
        // Windows indexers can briefly hold a generated file open.
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50 * (attempt + 1));
      }
    }
  } finally { if (existsSync(temporary)) unlinkSync(temporary); }
  return true;
}

export function routeFor(root, file) {
  return "/" + relative(root, file).replaceAll("\\", "/").replace(/index\.html$/, "");
}
