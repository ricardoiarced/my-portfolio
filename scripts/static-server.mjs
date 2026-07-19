import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const basePath = "/my-portfolio/";
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

export function startStaticServer(port = 4173) {
  const server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    if (pathname === "/my-portfolio") {
      response.writeHead(308, { location: basePath });
      response.end();
      return;
    }
    if (!pathname.startsWith(basePath)) {
      response.writeHead(404).end("Not found");
      return;
    }

    const relativePath = pathname.slice(basePath.length) || "index.html";
    const filePath = resolve(root, relativePath);
    if (!filePath.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    try {
      if (!(await stat(filePath)).isFile()) throw new Error("Not a file");
      response.writeHead(200, {
        "content-type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
        "x-content-type-options": "nosniff",
      });
      if (request.method === "HEAD") response.end();
      else createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });

  return new Promise((resolveServer, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolveServer(server));
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number.parseInt(process.env.PORT ?? "4173", 10);
  await startStaticServer(port);
  console.log(`Portfolio available at http://127.0.0.1:${port}${basePath}`);
}
