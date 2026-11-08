// Build: inline src/core.js into src/ui.html -> blitzread.html
import fs from 'fs';
import path from 'path';
const here = path.dirname(new URL(import.meta.url).pathname);
const core = fs.readFileSync(path.join(here, 'src', 'core.js'), 'utf8');
const ui = fs.readFileSync(path.join(here, 'src', 'ui.html'), 'utf8');
if (!ui.includes('/*@@CORE@@*/')) throw new Error('placeholder missing');
const out = ui.replace('/*@@CORE@@*/', () => core);
fs.writeFileSync(path.join(here, 'blitzread.html'), out);
console.log('wrote blitzread.html', out.length, 'bytes');
