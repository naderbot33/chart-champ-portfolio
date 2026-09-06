import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("dist");
const config = JSON.parse(await readFile("firebase.json", "utf8"));
const shared = config.hosting.headers.find(entry => entry.source === "**").headers;
const types = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain" };
createServer(async (req, res) => {
  for (const { key, value } of shared) res.setHeader(key, value);
  res.setHeader("Cache-Control", "no-cache");
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (pathname === "/watchlists" || pathname.startsWith("/watchlists/")) { res.writeHead(301, { Location: "/#research" }); return res.end(); }
    let file = resolve(root, "." + pathname);
    if (file !== root && !file.startsWith(root + sep)) throw new Error("Invalid path");
    if (pathname.endsWith("/")) file = resolve(file, "index.html");
    else if (!extname(file)) file += ".html";
    await stat(file);
    res.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end("Not found"); }
}).listen(8766, "127.0.0.1", () => console.log("ChartChamp preview: http://127.0.0.1:8766"));
