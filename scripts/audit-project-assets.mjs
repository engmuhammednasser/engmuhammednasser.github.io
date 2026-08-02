import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";

const root = resolve(process.cwd());
const projectRoot = join(root, "projects");
const outputJson = join(root, "docs", "audit", "project-asset-references.json");
const outputMarkdown = join(root, "docs", "audit", "project-asset-references.md");
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const textExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".mjs",
  ".md",
  ".txt",
  ".xml"
]);
const excludedOutputs = new Set([
  "docs/audit/project-asset-references.json",
  "docs/audit/project-asset-references.md"
]);

function collectFiles(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      collectFiles(absolutePath, files);
    } else {
      files.push(absolutePath);
    }
  }
  return files;
}

function relativePath(file) {
  return relative(root, file).replaceAll("\\", "/");
}

function readTextSources() {
  return collectFiles(root)
    .map((file) => ({ file, path: relativePath(file) }))
    .filter(({ path }) => textExtensions.has(extname(path)) && !excludedOutputs.has(path))
    .map(({ file, path }) => {
      const content = readFileSync(file, "utf8");
      let decoded = "";
      try {
        decoded = decodeURIComponent(content);
      } catch {
        decoded = content;
      }
      return { path, searchable: `${content}\n${decoded}`.replaceAll("\\", "/") };
    });
}

function classificationFor(assetPath, searchableSources) {
  const normalized = assetPath.replaceAll("\\", "/");
  const urlPath = `/${normalized}`;
  const fileName = basename(normalized);
  const exactSources = [];
  const possibleSources = [];

  for (const source of searchableSources) {
    if (source.searchable.includes(normalized) || source.searchable.includes(urlPath)) {
      exactSources.push(source.path);
    } else if (fileName.length > 4 && source.searchable.includes(fileName)) {
      possibleSources.push(source.path);
    }
  }

  if (normalized.includes("/optimized/")) {
    return {
      classification: "GENERATED",
      referenceCount: exactSources.length,
      references: exactSources.slice(0, 12),
      possibleReferences: possibleSources.slice(0, 12)
    };
  }

  if (exactSources.length) {
    return {
      classification: "REFERENCED",
      referenceCount: exactSources.length,
      references: exactSources.slice(0, 12),
      possibleReferences: possibleSources.slice(0, 12)
    };
  }

  if (possibleSources.length) {
    return {
      classification: "POSSIBLY REFERENCED",
      referenceCount: 0,
      references: [],
      possibleReferences: possibleSources.slice(0, 12)
    };
  }

  if (normalized.includes("/full-page/") || normalized.includes("/capture/")) {
    return {
      classification: "UNKNOWN",
      referenceCount: 0,
      references: [],
      possibleReferences: []
    };
  }

  return {
    classification: "UNREFERENCED CANDIDATE",
    referenceCount: 0,
    references: [],
    possibleReferences: []
  };
}

const searchableSources = readTextSources();
const assets = collectFiles(projectRoot)
  .filter((file) => imageExtensions.has(extname(file).toLowerCase()))
  .map((file) => {
    const path = relativePath(file);
    const stats = statSync(file);
    return {
      path,
      bytes: stats.size,
      ...classificationFor(path, searchableSources)
    };
  })
  .sort((left, right) => left.path.localeCompare(right.path));

const classifications = [
  "REFERENCED",
  "POSSIBLY REFERENCED",
  "UNREFERENCED CANDIDATE",
  "GENERATED",
  "UNKNOWN"
];
const summary = Object.fromEntries(
  classifications.map((classification) => {
    const matching = assets.filter((asset) => asset.classification === classification);
    return [
      classification,
      {
        files: matching.length,
        bytes: matching.reduce((total, asset) => total + asset.bytes, 0)
      }
    ];
  })
);

const report = {
  version: 1,
  scope: "projects/ image assets",
  scannedTextSources: searchableSources.length,
  classificationPolicy: {
    REFERENCED: "Exact normalized projects/ path found in HTML, CSS, JavaScript, JSON, Markdown, text, or manifest sources.",
    "POSSIBLY REFERENCED": "Only a filename-level match was found; this is not proof of usage.",
    "UNREFERENCED CANDIDATE": "No direct or filename-level text match was found; never treat this as deletion approval.",
    GENERATED: "Generated optimized delivery output under projects/*/optimized/.",
    UNKNOWN: "Capture/full-page media without a direct match; dynamic generators and absent source workspaces need review."
  },
  summary,
  assets
};

mkdirSync(join(root, "docs", "audit"), { recursive: true });
writeFileSync(outputJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

function markdownTableRows(items) {
  return items.map((asset) => {
    const references = [...asset.references, ...asset.possibleReferences]
      .slice(0, 4)
      .map((value) => `\`${value}\``)
      .join(", ") || "—";
    return `| \`${asset.path}\` | ${formatBytes(asset.bytes)} | ${asset.classification} | ${references} |`;
  });
}

const candidateAssets = assets.filter((asset) =>
  ["UNREFERENCED CANDIDATE", "UNKNOWN", "POSSIBLY REFERENCED"].includes(asset.classification)
);
const markdown = [
  "# Project Asset Reference Audit",
  "",
  "Generated by `npm run audit:assets` from the committed static export.",
  "",
  "This is a reference map, not a deletion plan. Text scanning cannot prove that an asset is safe to remove when filenames are constructed dynamically, capture scripts refer to an absent workspace, or public history depends on stable files.",
  "",
  `Scanned ${assets.length} project image assets and ${searchableSources.length} text sources.`,
  "",
  "## Classification summary",
  "",
  "| Classification | Files | Bytes |",
  "|---|---:|---:|",
  ...classifications.map((classification) => `| ${classification} | ${summary[classification].files} | ${formatBytes(summary[classification].bytes)} |`),
  "",
  "## Method",
  "",
  "- Exact normalized `/projects/...` and `projects/...` paths were checked across HTML, CSS, JavaScript, JSON, Markdown, text payloads, scripts, metadata, and manifests.",
  "- Filename-only matches are separated as `POSSIBLY REFERENCED` because they can be false positives.",
  "- `GENERATED` currently identifies optimized thumbnail variants and does not imply that originals are disposable.",
  "- Full-page/capture media without a direct match is `UNKNOWN`, not approved for deletion.",
  "",
  "## Review candidates",
  "",
  "| Asset | Bytes | Classification | Matching sources (sample) |",
  "|---|---:|---|---|",
  ...markdownTableRows(candidateAssets),
  "",
  "## Complete machine-readable map",
  "",
  "See [project-asset-references.json](./project-asset-references.json) for every asset, byte count, classification, and sampled matching source.",
  "",
  "No project original was deleted or overwritten by this audit."
].join("\n");

writeFileSync(outputMarkdown, `${markdown}\n`, "utf8");
console.log(`Audited ${assets.length} project image assets against ${searchableSources.length} text sources.`);
for (const classification of classifications) {
  console.log(`${classification}: ${summary[classification].files} files, ${summary[classification].bytes} bytes`);
}
console.log(`Wrote ${relativePath(outputMarkdown)} and ${relativePath(outputJson)}.`);
