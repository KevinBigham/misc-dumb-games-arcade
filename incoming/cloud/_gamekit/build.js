// node build.js : inlines gamekit.js and the demo sim into demo/demo.html, then parse-checks every script.
const fs = require('fs'), path = require('path'), vm = require('vm');
const D = __dirname;
const kit = fs.readFileSync(path.join(D, 'gamekit.js'), 'utf8');
function inline(src, map) { for (const k in map) { if (!src.includes(k)) throw new Error('marker missing ' + k); src = src.split(k).join(map[k].replace(/<\/script/gi, '<\\/script')); } return src; }
const out = inline(fs.readFileSync(path.join(D, 'demo', 'demo.src.html'), 'utf8'), { '/*GAMEKIT*/': kit, '/*PIPSIM*/': fs.readFileSync(path.join(D, 'demo', 'pip-sim.js'), 'utf8') });
fs.writeFileSync(path.join(D, 'demo', 'demo.html'), out);
const re = /<script id="(\w+)">([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(out))) { new vm.Script(m[2], { filename: m[1] }); console.log('parsed', m[1], m[2].length); }
console.log('demo.html bytes', out.length);
// Lantern Drum pilot
{
  const out2 = inline(fs.readFileSync(path.join(D, 'pilots', 'lantern-drum.src.html'), 'utf8'), { '/*GAMEKIT*/': kit });
  fs.writeFileSync(path.join(D, 'pilots', 'lantern-drum.html'), out2);
  const re2 = /<script(?: id="(\w+)")?>([\s\S]*?)<\/script>/g; let m2; while ((m2 = re2.exec(out2))) { new vm.Script(m2[2], { filename: m2[1] || 'main' }); console.log('lantern parsed', m2[1] || 'main', m2[2].length); }
  console.log('lantern-drum.html bytes', out2.length);
}
