import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const value = (name, fallback) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : fallback; };
const port = Number(value("--port", process.env.PORT || "7100"));
const host = value("--host", "0.0.0.0");
if (!existsSync("dist/index.html") || args.includes("--build")) {
  const built = spawnSync(process.execPath, ["scripts/build-native.mjs"], { stdio: "inherit" });
  if (built.status !== 0) process.exit(built.status ?? 1);
}
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  if (path === "/" || path === ".") path = "/index.html";
  let file = join(process.cwd(), "dist", path);
  if (!file.startsWith(join(process.cwd(), "dist"))) { res.writeHead(403); res.end(); return; }
  if (!existsSync(file) || !statSync(file).isFile()) file = join(process.cwd(), "dist/index.html");
  res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store", "Cross-Origin-Opener-Policy": "same-origin" });
  res.end(readFileSync(file));
});
server.listen(port, host, () => console.log(`HUSH//PULSE preview → http://${host === "0.0.0.0" ? "localhost" : host}:${port}/`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
