import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
import { buildMoonStandalone } from '../scripts/build-moon.mjs';

test('standalone moon build embeds valid game code, styles and art without external assets', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'moon-build-'));
  try {
    const destination = join(temporary, 'moon.html');
    await buildMoonStandalone(fileURLToPath(new URL('../', import.meta.url)), destination);
    const html = await readFile(destination, 'utf8');
    assert.match(html, /<style>:root/);
    assert.match(html, /data:image\/svg\+xml/);
    assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+rel="stylesheet"|@import/);
    const code = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
    assert.ok(code); assert.doesNotMatch(code, /^import /m);
    assert.doesNotThrow(() => new Script(code));
  } finally { await rm(temporary, { recursive: true, force: true }); }
});
