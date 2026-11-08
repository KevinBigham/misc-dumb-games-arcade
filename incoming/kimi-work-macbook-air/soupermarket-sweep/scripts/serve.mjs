import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
const root = resolve(new URL("../dist/", import.meta.url).pathname);
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const inline = args.find((arg) => arg.startsWith(`--${name}=`));
  if (inline) return inline.split("=")[1];
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : fallback;
};
const port = Number(getArg("port", process.env.PORT || "3000"));
const host = getArg("host", "127.0.0.1");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent((req.url ?? "/").split("?")[0]);
    const raw = pathname === "/" ? "/index.html" : pathname;
    const file = resolve(root, `.${raw}`);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { "content-type": mime[extname(file)] ?? "application/octet-stream", "cache-control": "no-cache" });
    res.end(data);
  } catch { res.writeHead(404).end("Not found"); }
});
server.listen(port, host, () => console.log(`SOUPERMARKET SWEEP ready at http://${host}:${port}/`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
