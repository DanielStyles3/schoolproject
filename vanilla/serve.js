/* Minimal static file server for local development.
 *
 *   node serve.js          -> http://localhost:4173
 *   node serve.js 8080     -> http://localhost:8080
 *
 * Optional: the portal is plain HTML/CSS/JS, so you can also just open
 * index.html directly in a browser. Serving over http:// is more reliable
 * because browsers treat file:// as an opaque origin, which can interfere
 * with the stored login session.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.argv[2]) || 4173;
const root = __dirname;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".sql": "text/plain; charset=utf-8",
};

http
  .createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split("?")[0]);
    if (rel === "/") rel = "/index.html";

    const file = path.join(root, path.normalize(rel));
    if (!file.startsWith(root)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>404 — not found</h1><p>" + rel + "</p>");
        return;
      }
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(data);
    });
  })
  .listen(port, () => {
    console.log("YABATECH portal running at http://localhost:" + port);
  });
