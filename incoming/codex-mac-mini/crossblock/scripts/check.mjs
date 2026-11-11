import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path));
    else if (/\.m?js$/.test(path)) result.push(path);
  }
  return result;
}
let count = 0;
for (const directory of ['src', 'scripts', 'tests']) {
  for (const path of await walk(join(root, directory))) {
    const check = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
    if (check.status !== 0) { process.stderr.write(check.stderr); process.exit(1); }
    const source = await readFile(path, 'utf8');
    if (path.includes('/src/sim/') && /Math\.random\s*\(|Date\.now\s*\(/.test(source)) throw new Error(`Unseeded or real-time simulation source: ${relative(root, path)}`);
    count++;
  }
}
console.log(`Checked ${count} JavaScript files; simulation randomness/time guard passed.`);
