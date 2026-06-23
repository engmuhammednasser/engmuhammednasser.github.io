import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(process.cwd());
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "127.0.0.1";

const mimeTypes = {
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
      return existsSync(candidate) && statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
}

const server = createServer((request, response) => {
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
    createReadStream(notFoundPath).pipe(response);
    return;
  }

  response.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Type": mimeTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream"
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Static site running at http://${host}:${port}`);
});
