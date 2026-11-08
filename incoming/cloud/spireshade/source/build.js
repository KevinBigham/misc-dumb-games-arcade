// node build.js -> dist/spireshade.html (one self-contained file)
const fs = require('fs'), path = require('path');
const d = __dirname;
const core = fs.readFileSync(path.join(d, 'src/core.js'), 'utf8');
const ui = fs.readFileSync(path.join(d, 'src/ui.js'), 'utf8');
let html = fs.readFileSync(path.join(d, 'src/shell.html'), 'utf8');
html = html.replace('/*__CORE__*/', () => core).replace('/*__UI__*/', () => ui);
fs.mkdirSync(path.join(d, 'dist'), { recursive: true });
fs.writeFileSync(path.join(d, 'dist/spireshade.html'), html);
console.log('built', html.length, 'bytes');
