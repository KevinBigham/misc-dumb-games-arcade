import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
import { buildLastLight } from '../scripts/build-last-light.mjs';

test('Last Light: portable build contains the complete module graph and no network or module dependencies', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'last-light-build-'));
  try {
    const destination = join(dir, 'play.html');
    const { script, modules } = await buildLastLight(fileURLToPath(new URL('../', import.meta.url)), destination);
    assert.equal(modules, 10);
    assert.doesNotThrow(() => new Script(script));
    const html = await readFile(destination, 'utf8');
    assert.match(html, /THE LAST LIGHT/); assert.match(html, /OFFLINE EDITION/);
    assert.doesNotMatch(html, /<script[^>]+src=/);
    assert.doesNotMatch(html, /<link[^>]+href="\.\//);
    assert.doesNotMatch(script, /^import\s/m);
    assert.doesNotMatch(script, /\bfetch\s*\(/);
    assert.match(script, /last-light\.profile/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('Last Light: HTTP handler serves its entry and rejects private paths without requiring a socket', async () => {
  const { createStaticServer } = await import('../scripts/serve.mjs');
  const server = createStaticServer();
  const request = url => new Promise(resolve => {
    let code, headers;
    server.emit('request', { method: 'GET', url }, {
      writeHead(status, metadata) { code = status; headers = metadata; },
      end(body) { resolve({ code, headers, body: String(body || '') }); },
    });
  });
  const page = await request('/last-light.html');
  assert.equal(page.code, 200); assert.match(page.body, /THE LAST LIGHT/);
  assert.match(page.headers['Content-Type'], /text\/html/);
  const script = await request('/src/last-light-main.js'); assert.equal(script.code, 200);
  assert.equal((await request('/tests/last-light.test.js')).code, 404);
  assert.equal((await request('/.git/config')).code, 404);
});
