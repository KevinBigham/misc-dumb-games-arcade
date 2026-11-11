// A portable edition of the same source: no packages, server, or runtime needed.
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const contracts = (await read('src/contracts.js')).split('\n').filter(line => /^export const QUARTERLIFE_/.test(line)).join('\n');
const modules = ['src/sim/rng.js', 'src/sim/quarterlife-data.js', 'src/sim/quarterlife.js', 'src/quarterlife-storage.js', 'src/quarterlife-recap.js', 'src/quarterlife-view.js', 'src/quarterlife-share.js', 'src/quarterlife-main.js'];
let code = contracts;
for (const file of modules) code += '\n\n' + (await read(file)).replace(/^import .+;\s*$/gm, '').replace(/^export /gm, '');
code = code.replace(/^export /gm, '');
if (/^import\s/m.test(code)) throw new Error('Unexpected import in portable bundle');
const css = await read('src/quarterlife.css');
const html = (await read('src/twenty-six.html'))
  .replace('<link rel="stylesheet" href="./quarterlife.css">', () => `<style>${css.replaceAll('</style', '<\\/style')}</style>`)
  .replace('<script type="module" src="./quarterlife-main.js"></script>', () => `<script type="module">${code.replaceAll('</script', '<\\/script')}</script>`)
  .replaceAll('href="./twenty-six.html"', 'href="#"');
await writeFile(new URL('twenty-six.html', root), html);
console.log('Built twenty-six.html — self-contained, works directly from disk.');
