// Loads core modules into one shared scope and runs a test file inside it.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const order = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/order.json'))).core;
let code = order.map(f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8')).join('\n');
const testFile = process.argv[2];
code += '\n' + fs.readFileSync(testFile, 'utf8');
const ctx = { console, process, require, Date, Math, JSON, setTimeout };
vm.createContext(ctx);
vm.runInContext(code, ctx, { filename: 'bundle.js' });
