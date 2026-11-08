// node build.js : builds artifact-body.html (the published page body) and dual-meet.html (standalone, for local tests).
const fs = require('fs'), path = require('path'), vm = require('vm');
const D = __dirname, rd = f => fs.readFileSync(path.join(D, f), 'utf8');
const safe = s => s.replace(/<\/script/gi, '<\\/script');
const kit = rd('src/gamekit.vendor.js');
const body = rd('src/shell.html') + '\n<script id="gamekit">' + safe(kit) + '</script>\n<script id="rules">' + safe(rd('src/rules.js')) + '</script>\n<script id="game">' + safe(rd('src/game.js')) + '</script>\n';
fs.writeFileSync(path.join(D, 'artifact-body.html'), body);
fs.writeFileSync(path.join(D, 'dual-meet.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>\n' + body + '</body></html>\n');
const re = /<script id="(\w+)">([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(body))) { new vm.Script(m[2], { filename: m[1] }); console.log('parsed', m[1], m[2].length); }
console.log('artifact-body.html bytes', body.length);
