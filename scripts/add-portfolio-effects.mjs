import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const styleTag = '<link rel="stylesheet" href="/scripts/portfolio-effects.css" data-portfolio-effects="style"/>';
const scriptTag = '<script src="/scripts/portfolio-effects.js" defer data-portfolio-effects="script"></script>';

const htmlFiles = [];

function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(absolute);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(absolute);
  }
}

collect(root);

let updated = 0;
for (const file of htmlFiles) {
  let html = fs.readFileSync(file, "utf8");
  const original = html;
  html = html.replace(/<link[^>]+data-portfolio-effects="style"[^>]*>/g, "");
  html = html.replace(/<script[^>]+data-portfolio-effects="script"[^>]*><\/script>/g, "");
  html = html.replace("</head>", `${styleTag}</head>`);
  html = html.replace("</body>", `${scriptTag}</body>`);
  if (html !== original) {
    fs.writeFileSync(file, html, "utf8");
    updated += 1;
  }
}

console.log(`Portfolio effects linked in ${updated} HTML files.`);
