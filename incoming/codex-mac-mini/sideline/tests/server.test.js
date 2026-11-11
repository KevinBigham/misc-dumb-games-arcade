import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createStaticServer } from '../scripts/serve.mjs';

test('static server delivers modules with correct MIME and denies private paths', async t => {
  const server = createStaticServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const index = await fetch(base);
  assert.equal(index.status, 200);
  assert.match(await index.text(), /SIDELINE/);
  const legacy = await fetch(`${base}/echo.html`);
  assert.equal(legacy.status, 200);
  assert.match(await legacy.text(), /ECHO REQUIEM/);
  const moon = await fetch(`${base}/moon.html`);
  assert.equal(moon.status, 200);
  assert.match(await moon.text(), /PLEASE FEED THE MOON/);
  const puzzle = await fetch(`${base}/crossblock.html`);
  assert.equal(puzzle.status, 200);
  assert.match(await puzzle.text(), /CROSSBLOCK/);
  const light = await fetch(`${base}/last-light.html`);
  assert.equal(light.status, 200);
  assert.match(await light.text(), /THE LAST LIGHT/);
  const module = await fetch(`${base}/src/contracts.js`);
  assert.match(module.headers.get('content-type'), /javascript/);
  for (const path of ['/.git/config', '/package.json', '/src/%2e%2e%2fpackage.json']) {
    assert.equal((await fetch(base + path)).status, 404, path);
  }
  assert.equal((await fetch(base, { method: 'POST' })).status, 405);
});
