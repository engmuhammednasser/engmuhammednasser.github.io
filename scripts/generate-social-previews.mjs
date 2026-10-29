import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";
import { socialPreviewSpecs } from "./social-preview-sources.mjs";

const root = resolve(process.cwd());
const allSpecs = [
  ...socialPreviewSpecs(),
  { slug: "portfolio", source: "/projects/portfolio/social-preview.svg", output: "/projects/portfolio/social-preview.jpg" }
];
const projectFlag = process.argv.indexOf("--projects");
const requested = projectFlag >= 0 ? process.argv[projectFlag + 1]?.split(",").map((slug) => slug.trim()).filter(Boolean) : null;
if (!process.argv.includes("--all") && !requested?.length) {
  throw new Error("Pass --projects slug[,slug...] or --all.");
}
const specs = requested ? allSpecs.filter(({ slug }) => requested.includes(slug)) : allSpecs;
if (requested && specs.length !== new Set(requested).size) throw new Error("An unknown social-preview slug was requested.");

for (const { slug, source, output, cropTop = 0 } of specs) {
  const target = resolve(root, output.slice(1));
  mkdirSync(dirname(target), { recursive: true });
  // Existing page captures are anchored at the top so that very tall pages do
  // not become tiny or show an arbitrary middle section in a share preview.
  let image = sharp(resolve(root, source.slice(1))).rotate();
  if (cropTop) {
    const { width, height } = await image.metadata();
    image = image.extract({ left: 0, top: cropTop, width, height: height - cropTop });
  }
  await image
    .resize(1200, 627, { fit: "cover", position: "top" })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(target);
  console.log(`Generated social preview: ${slug}`);
}
