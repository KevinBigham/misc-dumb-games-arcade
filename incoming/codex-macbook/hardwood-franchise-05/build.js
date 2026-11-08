// Bundles src/ into one self-contained HTML game (two flavors: artifact body + standalone document).
const fs = require('fs'), path = require('path');
const R = p => fs.readFileSync(path.join(__dirname, 'src', p), 'utf8');
const order = JSON.parse(R('order.json'));
const files = order.core.concat(order.ui);
const js = '(function(){\n"use strict";\n' + files.map(f => R(f)).join('\n') + '\n})();';
const css = R('style.css');
const body = R('template.html').replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => js.replace(/<\/script/gi, '<\\/script'));
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'hardwood.html'), body);
const full = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
  body.replace('<div id="app">', '</head>\n<body>\n<div id="app">') + '\n</body>\n</html>\n';
fs.writeFileSync(path.join(__dirname, 'Hardwood Franchise.html'), full);
fs.writeFileSync(path.join(__dirname, 'dist', 'bundle.js'), js);
console.log('built', (body.length / 1024).toFixed(0) + ' KB');
