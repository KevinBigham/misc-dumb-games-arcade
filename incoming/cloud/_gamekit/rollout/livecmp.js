// node livecmp.js <live-saved.html> <local.html> : strips the publish wrapper from the live copy and compares
const fs = require('fs');
const [live, local] = process.argv.slice(2);
let L = fs.readFileSync(live, 'utf8'), S = fs.readFileSync(local, 'utf8');
const wrap = /^<!doctype html><html><head><meta charset=utf8><meta name=viewport[^>]*><style>[^<]*<\/style><\/head><body>\n?/;
const m = L.match(wrap); const body = (m ? L.slice(m[0].length) : L).replace(/\n*<\/body><\/html>\s*$/, '');
const norm = s => s.replace(/\s+$/, '');
const strip = s => s.replace(/^\s*<!doctype html>\s*/i, '').replace(/^\s*<html[^>]*>\s*/i, '').replace(/<\/html>\s*$/i, '').replace(/<\/body>\s*$/i, '');
const a = norm(body), b = norm(S);
if (a === b) { console.log('SAME (wrapper stripped)'); process.exit(0); }
// try a looser compare: local may carry its own doctype/head/body tags that the publisher folded
const a2 = a.replace(/\s+/g, ' '), b2 = b.replace(/\s+/g, ' ');
if (a2 === b2) { console.log('SAME (whitespace only)'); process.exit(0); }
let i = 0; while (i < a.length && a[i] === b[i]) i++;
console.log('DIFF at char', i, 'live len', a.length, 'local len', b.length);
console.log('live :', JSON.stringify(a.slice(Math.max(0, i - 80), i + 120)));
console.log('local:', JSON.stringify(b.slice(Math.max(0, i - 80), i + 120)));
process.exit(2);
