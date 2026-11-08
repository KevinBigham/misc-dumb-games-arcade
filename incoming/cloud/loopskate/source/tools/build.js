// node tools/build.js : inlines the kit, rules and game into artifact-body.html (for the Artifact) and loopskate.html (standalone), then parse-checks.
const fs = require('fs'), path = require('path'), vm = require('vm');
const D = path.join(__dirname, '..'), KIT = path.join(D, '..', '..', 'kit', 'gamekit.js');
const safe = s => s.replace(/<\/script/gi, '<\\/script');
const shell = fs.readFileSync(path.join(D, 'src/shell.html'), 'utf8');
const parts = [['gamekit', fs.readFileSync(KIT, 'utf8')], ['rules', fs.readFileSync(path.join(D, 'src/rules.js'), 'utf8')], ['game', fs.readFileSync(path.join(D, 'src/game.js'), 'utf8')]];
const body = shell + '\n' + parts.map(([id, src]) => '<script id="' + id + '">' + safe(src) + '</script>').join('\n') + '\n';
fs.writeFileSync(path.join(D, 'artifact-body.html'), body);
fs.writeFileSync(path.join(D, 'loopskate.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>\n' + body + '</body></html>\n');
const re = /<script id="(\w+)">([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(body))) { new vm.Script(m[2], { filename: m[1] }); console.log('parsed', m[1], m[2].length); }
console.log('artifact-body.html bytes', Buffer.byteLength(body));
