import { createReadStream, existsSync, statSync, realpathSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(process.cwd());
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "127.0.0.1";

const mimeTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
};

function resolveRequestPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0]);
  // Development metadata and dependencies are never public site assets.
  if (decodedPath.split(/[/\\]+/).some((part) => part.startsWith(".") || part === "node_modules")) return null;
  const relativePath = normalize(decodedPath).replace(/^([/\\])+/, "");
  const requestedPath = resolve(root, relativePath);

  if (requestedPath !== root && !requestedPath.startsWith(`${root}${sep}`)) {
    return null;
  }

  const candidates = [requestedPath];

  if (existsSync(requestedPath) && statSync(requestedPath).isDirectory()) {
    candidates.unshift(join(requestedPath, "index.html"));
  } else if (!extname(requestedPath)) {
    candidates.push(`${requestedPath}.html`, join(requestedPath, "index.html"));
  }

  return candidates.find((candidate) => {
    try {
      return existsSync(candidate) && statSync(candidate).isFile() && realpathSync(candidate).startsWith(`${root}${sep}`);
    } catch {
      return false;
    }
  });
}

const server = createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }
  let filePath;

  try {
    filePath = resolveRequestPath(request.url ?? "/");
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }

  if (!filePath) {
    const notFoundPath = join(root, "404.html");
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    if (request.method === "HEAD") response.end();
    else createReadStream(notFoundPath).on("error", () => response.destroy()).pipe(response);
    return;
  }

  response.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Length": statSync(filePath).size,
    "X-Content-Type-Options": "nosniff",
    "Content-Type": mimeTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream"
  });
  if (request.method === "HEAD") response.end();
  else createReadStream(filePath).on("error", () => response.destroy()).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Static site running at http://${host}:${port}`);
});
