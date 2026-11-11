import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { Script } from 'node:vm';

// A portable, zero-request edition; double-click the generated HTML to play.
const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFile(join(root, path), 'utf8');
let html = await read('src/honk/index.html');
const contract = (await read('src/contracts.js')).split('\n').filter(line => line.startsWith('export const HONK')).join('\n');
const modules = await Promise.all(['src/sim/rng.js', 'src/sim/honk-content.js', 'src/sim/honk.js', 'src/honk/storage.js', 'src/honk/ui-utils.js', 'src/honk/renderer.js', 'src/honk/audio.js', 'src/honk/input.js', 'src/honk/main.js'].map(read));
const source = [contract, ...modules].join('\n').replace(/^import .*;\n/gm, '').replace(/^export /gm, '');
new Script(`(() => {\n${source}\n})();`, { filename: 'honk-portable.js' });
const css = [await read('src/honk/style.css'), await read('src/honk/enhancements.css')].join('\n');
const icon = Buffer.from(await read('src/honk/icon.svg')).toString('base64');
html = html.replace('href="./index.html"', 'href="./Honk_If_Youre_Employed.html"').replace('./icon.svg', `data:image/svg+xml;base64,${icon}`).replace('<link rel="stylesheet" href="./style.css">', `<style>\n${css}\n</style>`)
  .replace('<link rel="stylesheet" href="./enhancements.css">', '')
  .replace('<script type="module" src="./main.js"></script>', `<script>\n(() => {\n${source.replace(/<\/script/gi, '<\\/script')}\n})();\n</script>`);
await writeFile(join(root, 'src/honk/Honk_If_Youre_Employed.html'), html);
console.log('Portable game created: src/honk/Honk_If_Youre_Employed.html (no server or network required).');
