// node retrofit.js <game.html> --id <id> --saves key1,key2 [--opts '{"limiter":false}'] [--pre <path for pre-kit copy>] [--dry]
// --opts passes kit 2 retrofit switches: dpr (cap or false), fps (false), hideAudio (false), limiter (false)
// Puts GameKit 1.1 and one GK.retrofit() line in front of the game's first script. Idempotent: an
// earlier kit block is replaced, so it can be re-run after the game's own build. No game code changes.
// With --dry it only lists the localStorage keys and AudioContext uses it can see.
const fs = require('fs'), path = require('path'), vm = require('vm');
const args = process.argv.slice(2); const file = args[0];
const opt = k => { const i = args.indexOf('--' + k); return i < 0 ? null : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const kit = fs.readFileSync(path.join(__dirname, '..', 'gamekit.js'), 'utf8');
let html = fs.readFileSync(file, 'utf8');
const strip = h => h.replace(/<script id="gamekit">[\s\S]*?<\/script>\s*<script id="gkboot">[\s\S]*?<\/script>\s*/g, '');
function scan(h) {
  const keys = new Set(), lines = [];
  const reKey = /localStorage\s*\.\s*(?:getItem|setItem|removeItem)\s*\(\s*(['"`])([^'"`]+)\1/g; let m;
  while ((m = reKey.exec(h))) keys.add(m[2]);
  h.split('\n').forEach((l, i) => { if (/localStorage|AudioContext|toISOString\(\)\.slice\(0,\s*10\)|getUTC(Date|FullYear|Month)/.test(l)) lines.push((i + 1) + ': ' + l.trim().slice(0, 200)); });
  return { keys: [...keys], lines };
}
const clean = strip(html);
if (opt('dry')) { const s = scan(clean); console.log('literal keys:', JSON.stringify(s.keys)); s.lines.slice(0, 60).forEach(l => console.log('  ' + l)); process.exit(0); }
const id = opt('id'); const saves = String(opt('saves') || '').split(',').filter(Boolean);
if (!id) throw new Error('--id needed');
const pre = opt('pre');
if (pre && pre !== true && !fs.existsSync(pre)) { fs.writeFileSync(pre, clean); console.log('pre-kit copy', pre, clean.length); }
const extra = opt('opts') && opt('opts') !== true ? JSON.parse(opt('opts')) : {};
const allowed = ['dpr', 'fps', 'hideAudio', 'limiter'];
for (const k of Object.keys(extra)) if (!allowed.includes(k)) throw new Error('unknown --opts key ' + k);
const boot = 'window.GK.retrofit(' + JSON.stringify(Object.assign({ game: id, saves }, extra)) + ');';
const block = '<script id="gamekit">' + kit.replace(/<\/script/gi, '<\\/script') + '</script>\n<script id="gkboot">' + boot + '</script>\n';
const at = clean.search(/<script\b(?![^>]*type=["']?(?:application\/(?:ld\+)?json|text\/template))/i);
if (at < 0) throw new Error('no script tag found');
const out = clean.slice(0, at) + block + clean.slice(at);
// parse-check every classic inline script
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi; let m, n = 0;
while ((m = re.exec(out))) { if (/type=["']?(module|application|text\/template)/i.test(m[1]) || /\bsrc=/.test(m[1])) continue; new vm.Script(m[2], { filename: 'script' + n }); n++; }
fs.writeFileSync(file, out);
console.log(id, 'retrofitted', file, clean.length, '->', out.length, 'bytes,', n, 'scripts parse, saves', JSON.stringify(saves));
