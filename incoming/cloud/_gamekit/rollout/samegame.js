// node samegame.js <live-saved.html> <pre-kit.html> : is the live page the pre-kit game plus only a kit block (any kit version)?
const fs = require('fs'); const [live, pre] = process.argv.slice(2);
let L = fs.readFileSync(live, 'utf8');
const m = L.match(/^<!doctype html><html><head><meta charset=utf8><meta name=viewport[^>]*><style>[^<]*<\/style><\/head><body>\n?/);
if (m) L = L.slice(m[0].length).replace(/\n*<\/body><\/html>\s*$/, '');
const strip = h => h.replace(/<script id="gamekit">[\s\S]*?<\/script>\s*<script id="gkboot">[\s\S]*?<\/script>\s*/g, '');
const kitv = (L.match(/version: '([\d.]+)'/) || [])[1] || 'none';
const a = strip(L).replace(/\s+$/, ''), b = fs.readFileSync(pre, 'utf8').replace(/\s+$/, '');
if (a === b) { console.log('SAME GAME (live kit ' + kitv + ')'); process.exit(0); }
let i = 0; while (i < a.length && a[i] === b[i]) i++;
console.log('DIFFERENT at char ' + i + ' (live kit ' + kitv + ')\n live: ' + JSON.stringify(a.slice(i, i + 120)) + '\n pre:  ' + JSON.stringify(b.slice(i, i + 120))); process.exit(1);
