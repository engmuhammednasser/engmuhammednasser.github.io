import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const root = resolve(process.cwd());
const ignoredDirectories = new Set([".git", "node_modules", "docs", "scripts", "_next"]);
const textExtensions = new Set([".css", ".html", ".js", ".json", ".mjs", ".txt", ".xml"]);
const files = [];
const errors = [];

function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) collect(join(directory, entry.name));
      continue;
    }
    if (entry.isFile() && textExtensions.has(extname(entry.name).toLowerCase())) files.push(join(directory, entry.name));
  }
}

function report(file, message) {
  errors.push(`${file.slice(root.length + 1)}: ${message}`);
}

function decode(value) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#(?:x([0-9a-f]+)|([0-9]+));/gi, (_, hex, decimal) =>
    String.fromCodePoint(Number.parseInt(hex ?? decimal, hex ? 16 : 10))
  );
}

collect(root);

const localPathPattern = /(?:C:\\Users\\|C:\\Users\/|\/Users\/|\/home\/|file:\/\/|\blocalhost\b|\b127\.0\.0\.1\b)/i;
const secretPattern = /(?:AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bsk-[A-Za-z0-9]{20,}\b)/;

for (const file of files) {
  const relative = file.slice(root.length + 1);
  let content;
  try {
    content = readFileSync(file, "utf8");
    new TextDecoder("utf-8", { fatal: true }).decode(readFileSync(file));
  } catch (error) {
    report(file, `invalid UTF-8 text (${error.message})`);
    continue;
  }

  if (/\ufffd/.test(content)) report(file, "contains the Unicode replacement character (possible encoding damage)");
  if (localPathPattern.test(content)) report(file, "contains a local machine path or loopback URL");
  if (secretPattern.test(content)) report(file, "contains a credential-shaped secret");
  if (/javascript\s*:/i.test(content)) report(file, "contains a javascript: URL");

  if (extname(file).toLowerCase() === ".html") {
    for (const match of content.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) {
      const tag = match[0];
      const rel = tag.match(/\brel=["']([^"']*)["']/i)?.[1] ?? "";
      if (!/\bnoopener\b/i.test(rel) || !/\bnoreferrer\b/i.test(rel)) {
        report(file, `target=_blank link is missing rel="noopener noreferrer" (${tag.slice(0, 120)})`);
      }
    }

    for (const match of content.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
      const value = decode(match[1]);
      if (value.startsWith("http:") || value.startsWith("https:")) {
        try {
          const url = new URL(value);
          if (!["http:", "https:"].includes(url.protocol) || !url.hostname) report(file, `invalid external URL ${value}`);
        } catch {
          report(file, `malformed external URL ${value}`);
        }
      }
    }
  }

  if (relative === "data/projects.json") {
    try {
      const data = JSON.parse(content);
      for (const project of data.projects ?? []) {
        if (project.liveUrl !== null) {
          const liveUrl = new URL(project.liveUrl);
          if (!["http:", "https:"].includes(liveUrl.protocol)) report(file, `${project.slug} liveUrl is not http(s)`);
        }
      }
    } catch (error) {
      report(file, `project data cannot be parsed (${error.message})`);
    }
  }
}

console.log(`Security/hygiene checked ${files.length} production text files (framework vendor output excluded).`);

if (errors.length) {
  console.error(`Found ${errors.length} security/hygiene failures:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("No local paths, javascript URLs, credential-shaped secrets, encoding damage, or unsafe external-target links found in production output.");
