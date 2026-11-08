// Assemble the single-file game: node build.mjs
import fs from 'fs';
const r = f => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
let html = r('./src/shell.html');
html = html.replace('/*CSS*/', () => r('./src/style.css')).replace('/*CORE*/', () => r('./src/core.js')).replace('/*UI*/', () => r('./src/ui.js'));
fs.writeFileSync(new URL('./twelve-sols.html', import.meta.url), html);
console.log('built twelve-sols.html', html.length, 'bytes');
