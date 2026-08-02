import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const origin = "https://engmuhammednasser.github.io";
const routesDocument = JSON.parse(readFileSync(resolve(root, "data/routes.json"), "utf8"));
const routes = routesDocument.routes
  .filter((route) => route.indexable && route.route !== "/404/" && route.route !== "/_not-found/")
  .map((route) => `${origin}${route.route}`)
  .sort();

function xmlEscape(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;"
  }[character]));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`).join("\n")}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\nDisallow: /404/\nDisallow: /_not-found/\n\nSitemap: ${origin}/sitemap.xml\n`;

writeFileSync(resolve(root, "sitemap.xml"), sitemap, "utf8");
writeFileSync(resolve(root, "robots.txt"), robots, "utf8");
console.log(`Generated sitemap.xml with ${routes.length} canonical URLs and robots.txt.`);
