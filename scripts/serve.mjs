// Serves a folder over HTTP on 127.0.0.1, to try the built site in a browser, which does not run ES modules from files
// on disk.
//
//   node scripts/serve.mjs [folder] [port]    default: _site at the root of the repository, port 8080
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const folder = resolve(process.argv[2] ?? join(root, "_site"));
const port = Number(process.argv[3] ?? 8080);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

/** The file for a path of a URL under the folder, or null when it leaves the folder. */
function within(path) {
  const file = normalize(join(folder, decodeURIComponent(path)));
  return file === folder || file.startsWith(folder + sep) ? file : null;
}

createServer(async (request, response) => {
  let file = within(new URL(request.url ?? "/", "http://localhost").pathname);
  try {
    if (file !== null && (await stat(file)).isDirectory()) {
      file = join(file, "index.html");
    }
    if (file === null || !(await stat(file)).isFile()) {
      throw new Error("not a file");
    }
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found\n");
    return;
  }
  response.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => console.log(`${folder} at http://127.0.0.1:${port}/`));
