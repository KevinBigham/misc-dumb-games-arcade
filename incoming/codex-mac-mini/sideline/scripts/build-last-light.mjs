import { readFile, writeFile } from 'node:fs/promises';
import { posix, join } from 'node:path';

/** Small, closed-graph packager for this game's own named-export modules.
 * Creates a portable offline page without a dependency or local server.
 */
export async function buildLastLight(root, destination) {
  const modules = new Map();
  async function visit(path) {
    if (modules.has(path)) return;
    const source = await readFile(join(root, path), 'utf8');
    const imports = [...source.matchAll(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?\s*$/gm)];
    for (const match of imports) await visit(posix.normalize(posix.join(posix.dirname(path), match[2])));
    const names = [...source.matchAll(/^export\s+(?:const|let|function)\s+(\w+)/gm)].map(match => match[1]);
    const body = source.replace(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?\s*$/gm, (_, names, relative) => `const {${names}} = __lightModules[${JSON.stringify(posix.normalize(posix.join(posix.dirname(path), relative)))}];`).replace(/^export\s+/gm, '');
    if (/^import\s/m.test(body)) throw new Error(`Unsupported import in standalone module: ${path}`);
    modules.set(path, `__lightModules[${JSON.stringify(path)}] = (() => {\n${body}\nreturn { ${names.join(', ')} };\n})();`);
  }
  await visit('src/last-light-main.js');
  const script = `const __lightModules = Object.create(null);\n${[...modules.values()].join('\n')}\n`;
  const css = await readFile(join(root, 'src/last-light.css'), 'utf8');
  const icon = await readFile(join(root, 'src/last-light-icon.svg'), 'utf8');
  let html = await readFile(join(root, 'last-light.html'), 'utf8');
  html = html.replace('<link rel="stylesheet" href="./src/last-light.css">', () => `<style>${css}</style>`);
  html = html.replace('href="./src/last-light-icon.svg"', `href="data:image/svg+xml,${encodeURIComponent(icon)}"`);
  html = html.replace('<script type="module" src="./src/last-light-main.js"></script>', () => `<script type="module">\n${script.replace(/<\/script/gi, '<\\/script')}\n</script>`);
  // A self-contained copy does not depend on the other games being beside it.
  html = html.replace('<a href="./">SIDELINE ↗</a><a href="./echo.html">ECHO REQUIEM ↗</a>', '<span>OFFLINE EDITION / NO INSTALL NEEDED</span>');
  html = html.replace('href="./last-light.html"', 'href=""');
  await writeFile(destination, html);
  return { script, modules: modules.size };
}
