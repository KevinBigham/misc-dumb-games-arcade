// Renders real canvas frames from the bundled game at phone size (375 wide, DPR 2) into PNGs, to eyeball the art.
// usage: NODE_PATH=<jsdom dir>:<@napi-rs/canvas dir> node render.js OUTDIR
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom'); const { createCanvas } = require('@napi-rs/canvas');
const OUT = process.argv[2] || '.'; const HTML = fs.readFileSync(path.join(__dirname, '..', 'dist', 'kilnshot.html'), 'utf8');
const errors = [];
const dom = new JSDOM('<!doctype html><html><body>' + HTML + '</body></html>', { url: 'https://kiln.test/', runScripts: 'dangerously',
  beforeParse(win) {
    win.devicePixelRatio = 2;
    const P = win.HTMLCanvasElement.prototype;
    Object.defineProperty(P, 'width', { get() { return this.__w || 300; }, set(v) { this.__w = v; if (this.__c) this.__c.width = v; } });
    Object.defineProperty(P, 'height', { get() { return this.__h || 150; }, set(v) { this.__h = v; if (this.__c) this.__c.height = v; } });
    P.getContext = function () {
      if (!this.__c) this.__c = createCanvas(this.width, this.height);
      if (!this.__g) { const g = this.__c.getContext('2d'); this.__g = new Proxy(g, { get(o, k) { const v = o[k]; if (k === 'drawImage') return (img, ...a) => o.drawImage(img && img.__c ? img.__c : img, ...a); return typeof v === 'function' ? v.bind(o) : v; }, set(o, k, v) { o[k] = v; return true; } }); }
      return this.__g; };
    win.Element.prototype.getBoundingClientRect = function () {
      if (this.id === 'stage') return { left: 0, top: 50, width: 375, height: 590, right: 375, bottom: 640 };
      if (this.id === 'cv') { const w = parseFloat(this.style.width) || 360, h = parseFloat(this.style.height) || 640; return { left: (375 - w) / 2, top: 50 + (590 - h) / 2, width: w, height: h }; }
      return { left: 0, top: 0, width: 0, height: 0 };
    };
    win.requestAnimationFrame = (cb) => { win.__raf = cb; return 1; };
    win.__frame = (t) => { const cb = win.__raf; win.__raf = null; if (cb) cb(t); };
    win.addEventListener('error', (e) => errors.push(e.message)); win.console.error = (...a) => errors.push(a.join(' '));
  } });
const w = dom.window, K = w.__kiln, cv = w.document.getElementById('cv'); let t = 1000;
const run = (n) => { for (let i = 0; i < n; i++) { t += 16.7; w.__frame(t); } };
const snap = (name) => { fs.writeFileSync(path.join(OUT, name + '.png'), cv.__c.toBuffer('image/png')); console.log('wrote', name); };
const lv = (id) => K.LEVELS.find(l => l.id === id);
K.startLevel(lv('L01')); run(5); snap('r-L01-rest');
K.S.aim = { sx: 200, sy: 300, cx: 200 + 860 / 4.4, cy: 300 + 440 / 4.4 }; run(1); snap('r-L01-aim');
K.S.aim = null; K.fire(-860, -440); let i = 0; while (K.S.mode === 'shot' && i++ < 400) { run(1); if (K.S.fx.length > 25) break; } snap('r-L01-break');
for (const id of ['L08', 'L13', 'L17', 'L19', 'L22', 'L24']) { K.startLevel(lv(id)); run(3); snap('r-' + id); }
K.startLevel(lv('L08')); K.fire(-840, -520); i = 0; while (K.S.mode === 'shot' && i++ < 600) { run(1); if (K.S.fx.length > 60) break; } snap('r-L08-chain');
console.log('errors', errors.length, errors.slice(0, 3).join('|'), 'canvas', cv.width, 'x', cv.height, 'css', cv.style.width, cv.style.height);
