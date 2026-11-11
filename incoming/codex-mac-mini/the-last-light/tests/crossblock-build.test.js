import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

test('Crossblock standalone build embeds all runtime assets and valid JavaScript', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const build = spawnSync(process.execPath, ['scripts/build-crossblock.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(build.status, 0, build.stderr);
  const html = readFileSync(new URL('../crossblock-play.html', import.meta.url), 'utf8');
  const scripts = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  assert.doesNotThrow(() => new Script(scripts[0][1]));
  assert.doesNotMatch(html, /(?:src|href)="(?:\.\/src\/|https?:\/\/)/);
  assert.doesNotMatch(html, /@import/);
  assert.doesNotMatch(scripts[0][1], /^import\s|^export\s/m);
  assert.match(html, /data:image\/svg\+xml,/);
  assert.match(html, /id="mode-daily"/);
  assert.match(html, /crossblock\.session/);
});
