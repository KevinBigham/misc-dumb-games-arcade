/** Bundle this game's small local ES-module graph into a double-clickable HTML.
 * No third-party bundler or runtime assets. Unsupported imports fail the build.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const included = new Set(), chunks = ['const crossblockModules = {};'];
async function bundle(path) {
  const key = relative(root, path).replaceAll('\\', '/');
  if (included.has(key)) return key;
  included.add(key);
  let source = await readFile(path, 'utf8');
  const imports = [...source.matchAll(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?\s*$/gm)];
  for (const match of imports) {
    if (!match[2].startsWith('.')) throw new Error(`Non-local import in ${key}`);
    const imported = await bundle(resolve(dirname(path), match[2]));
    const bindings = match[1].split(',').map(binding => binding.trim().replace(/\s+as\s+/, ': ')).join(', ');
    source = source.replace(match[0], `const { ${bindings} } = crossblockModules[${JSON.stringify(imported)}];\n`);
  }
  const exports = [...source.matchAll(/^export\s+(?:const|function)\s+(\w+)/gm)].map(match => match[1]);
  source = source.replace(/^export\s+(?=const|function)/gm, '');
  if (/^import\s|^export\s/m.test(source)) throw new Error(`Unsupported module syntax in ${key}`);
  chunks.push(`crossblockModules[${JSON.stringify(key)}] = (() => {\n${source}\nreturn { ${exports.join(', ')} };\n})();`);
  return key;
}
await bundle(resolve(root, 'src/crossblock-main.js'));
let css = await readFile(resolve(root, 'src/crossblock.css'), 'utf8');
css = css.replace("@import url('./crossblock-layout.css');", await readFile(resolve(root, 'src/crossblock-layout.css'), 'utf8'));
let html = await readFile(resolve(root, 'crossblock.html'), 'utf8');
const icon = await readFile(resolve(root, 'src/crossblock-icon.svg'), 'utf8');
html = html.replace('./src/crossblock-icon.svg', `data:image/svg+xml,${encodeURIComponent(icon)}`)
  .replace('<link rel="stylesheet" href="./src/crossblock.css" />', () => `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="./src/crossblock-main.js"></script>', () => `<script type="module">\n${chunks.join('\n').replace(/<\/script/gi, '<\\/script')}\n</script>`)
  .replace('<a href="./">More games <span aria-hidden="true">↗</span></a>', '<span>MADE TO MAKE SPACE.</span>')
  .replace('href="./crossblock.html"', 'href="#"');
await writeFile(resolve(root, 'crossblock-play.html'), html);
console.log(`Crossblock standalone built: crossblock-play.html (${Math.round(Buffer.byteLength(html) / 1024)} KB, ${included.size} local modules).`);
