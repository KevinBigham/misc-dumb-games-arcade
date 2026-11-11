import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/** These known ES modules have disjoint top-level declarations. Bundle without a dependency. */
export async function buildMoonStandalone(root, destination) {
  const sources = ['src/contracts.js', 'src/sim/rng.js', 'src/clock.js', 'src/sim/moon-content.js', 'src/sim/moon.js', 'src/moon-storage.js', 'src/view/moon-renderer.js', 'src/moon-audio.js', 'src/moon-main.js'];
  const modules = await Promise.all(sources.map(path => readFile(join(root, path), 'utf8')));
  const script = modules.map((source, index) => `// ${sources[index]}\n${source.replace(/^import .*;\r?\n/gm, '').replace(/^export \{.*\};\r?\n/gm, '').replace(/^export (?=(?:const|function|async function)\b)/gm, '')}`).join('\n\n');
  if (/^\s*(?:import |export )/m.test(script)) throw new Error('Unsupported module syntax in standalone Moon build.');
  const css = await readFile(join(root, 'src/moon.css'), 'utf8');
  const icon = await readFile(join(root, 'src/moon-icon.svg'), 'utf8');
  const html = (await readFile(join(root, 'moon.html'), 'utf8'))
    .replace('href="./moon.html"', 'href=""')
    .replace('<link rel="stylesheet" href="./src/moon.css" />', `<style>${css}</style>`)
    .replace('href="./src/moon-icon.svg"', `href="data:image/svg+xml,${encodeURIComponent(icon)}"`)
    .replace('<script type="module" src="./src/moon-main.js"></script>', `<script type="module">${script.replace(/<\/script/gi, '<\\/script')}</script>`);
  await writeFile(destination, html);
}
