import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json; charset=utf-8' };

export function createStaticServer(root = projectRoot) {
  const base = resolve(root);
  return http.createServer(async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
    }
    try {
      const url = new URL(req.url, 'http://localhost');
      const path = decodeURIComponent(url.pathname);
      const relative = path === '/' ? 'index.html' : path.replace(/^\/+/, '');
      const allowed = relative === 'index.html' || relative === 'favicon.svg' || relative.startsWith('src/');
      const full = resolve(base, relative);
      if (!allowed || !full.startsWith(base + sep) || relative.split('/').some(part => part.startsWith('.'))) {
        res.writeHead(404); res.end('Not found'); return;
      }
      const info = await stat(full);
      if (!info.isFile()) throw new Error('Not a file');
      const data = await readFile(full);
      res.writeHead(200, { 'Content-Type': mime[extname(full)] || 'application/octet-stream', 'Content-Length': data.length, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (error) {
      res.writeHead(error instanceof URIError ? 400 : 404);
      res.end(error instanceof URIError ? 'Bad request' : 'Not found');
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const directory = args.includes('--dir') ? args[args.indexOf('--dir') + 1] : '.';
  const portArg = args.includes('--port') ? args[args.indexOf('--port') + 1] : '4173';
  const port = Number(portArg);
  if (!directory || !Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Usage: npm run dev -- [--dir dist] [--port 4173]');
  const server = createStaticServer(resolve(projectRoot, directory));
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`ECHO REQUIEM · http://localhost:${port} · serving ${directory}`));
}
