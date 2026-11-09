// Bundles src/ into one self-contained HTML file: dist/kilnshot.html
const fs = require('fs'), path = require('path');
const src = (f) => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const js = ['core.js', 'levels.js', 'daily.js', 'daily-table.js', 'app.js'].filter(f => fs.existsSync(path.join(__dirname, 'src', f))).map(src).join('\n');
if (/<\/script/i.test(js)) throw new Error('script contains </script');
const html = src('shell.html').replace('/*CORE*/', () => js);
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'kilnshot.html'), html);
fs.writeFileSync(path.join(__dirname, 'dist', 'bundle.js'), js);
console.log('built', html.length, 'bytes');
