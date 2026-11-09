// Build: concatenate the ES modules (in dependency order) into one inline script in one HTML file.
// Usage: node build.mjs   ->   dist/one-more-season.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const order = ['config', 'content', 'rng', 'sim', 'game', 'storage', 'ui'];
let bundle = "'use strict';\n";
for (const m of order) {
  let src = readFileSync(join(root, 'src', m + '.mjs'), 'utf8');
  src = src.replace(/^import .*$/gm, '').replace(/^export (const|function|let)/gm, '$1');
  if (/^\s*(import|export)\b/m.test(src)) throw new Error(m + ': unhandled import/export');
  bundle += `// ---- ${m}.mjs ----\n${src}\n`;
}
const html = readFileSync(join(root, 'src', 'template.html'), 'utf8').replace('/*__BUNDLE__*/', () => `(function(){\n${bundle}\n})();`);
if (/<\/script>/i.test(bundle)) throw new Error('bundle contains a closing script tag');
mkdirSync(join(root, 'dist'), { recursive: true });
// Artifact version: the host wraps it in its own doctype/head/body.
writeFileSync(join(root, 'dist', 'one-more-season.html'), html);
// Standalone version: open straight from disk or any static host.
const standalone = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  + html.replace('<div id="app">', '</head>\n<body>\n<div id="app">') + '</body>\n</html>\n';
writeFileSync(join(root, 'dist', 'one-more-season.standalone.html'), standalone);
console.log('built dist/one-more-season.html', html.length, 'bytes (+ standalone)');
