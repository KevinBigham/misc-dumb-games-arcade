// node livebody.js <live-saved.html> <out.html> : the live page as published, minus the wrapper the artifact host adds
const fs = require('fs'); const [live, out] = process.argv.slice(2);
let L = fs.readFileSync(live, 'utf8');
const m = L.match(/^<!doctype html><html><head><meta charset=utf8><meta name=viewport[^>]*><style>[^<]*<\/style><\/head><body>\n?/);
if (!m) throw new Error('no publish wrapper found');
L = L.slice(m[0].length).replace(/\n*<\/body><\/html>\s*$/, '');
fs.writeFileSync(out, L); console.log('wrote', out, L.length);
