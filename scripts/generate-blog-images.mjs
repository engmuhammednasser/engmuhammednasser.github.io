import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const root = resolve(".");
const index = process.argv.indexOf("--articles");
if (index < 0 || !process.argv[index + 1]) throw new Error("Select articles explicitly: --articles qodo-codex-windows");
const selected = new Set(process.argv[index + 1].split(","));
const catalog = JSON.parse(readFileSync(resolve(root, "data/blog.json"), "utf8"));
for (const slug of selected) {
  if (!catalog.articles.some((article) => article.slug === slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Unknown article: ${slug}`);
  const directory = resolve(root, "images/blog", slug);
  const source = readFileSync(resolve(directory, "cover.svg"));
  for (const width of [600, 1200]) await sharp(source).resize({ width }).webp({ quality: 88, effort: 6 }).toFile(resolve(directory, `cover-${width}.webp`));
  await sharp(source).resize(1200, 627).flatten({ background: "#0b1424" }).jpeg({ quality: 92, mozjpeg: true }).toFile(resolve(directory, "social.jpg"));
  console.log(`Generated responsive cover and 1200x627 social image: ${slug}`);
}
