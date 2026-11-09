// Renders board frames to PNG using a real canvas inside jsdom. node test/shots.js <node_modules> <outdir>
const path = require('path'), fs = require('fs');
const NM = process.argv[2], OUT = process.argv[3];
const { JSDOM } = require(path.join(NM, 'jsdom'));
const { createCanvas } = require(path.join(NM, '@napi-rs/canvas'));
const html = fs.readFileSync(path.join(__dirname, '../dist/spireshade.html'), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const dark = process.argv[4] === 'dark';
const backing = new Map();
const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>', {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.test/',
  beforeParse(w) {
    w.HTMLCanvasElement.prototype.getContext = function () {
      const el = this;
      const get = () => { let b = backing.get(el); if (!b || b.w !== el.width || b.h !== el.height) { b = { w: el.width, h: el.height, c: createCanvas(Math.max(1, el.width), Math.max(1, el.height)) }; b.x = b.c.getContext('2d'); backing.set(el, b); } return b.x; };
      return new Proxy({}, { get: (t, p) => { const x = get(); const v = x[p]; return typeof v === 'function' ? v.bind(x) : v; }, set: (t, p, v) => { get()[p] = v; return true; } });
    };
    w.HTMLCanvasElement.prototype.getBoundingClientRect = function () { const W = this.id === 'board' ? 360 : 340; return { left: 0, top: 0, width: W, height: this.id === 'board' ? 360 : 150 }; };
    Object.defineProperty(w.HTMLElement.prototype, 'clientWidth', { get() { return this.tagName === 'CANVAS' ? (this.id === 'board' ? 360 : 340) : 375; } });
    Object.defineProperty(w.HTMLElement.prototype, 'clientHeight', { get() { return this.id === 'rvGraph' ? 64 : 150; } });
    w.devicePixelRatio = 2;
    w.matchMedia = q => ({ matches: /reduce/.test(q) || (dark && /dark/.test(q)), addEventListener() {} });
    w.ResizeObserver = class { observe() {} };
  }
});
const w = dom.window;
if (dark) w.document.documentElement.setAttribute('data-theme', 'dark');
const save = (name, el) => { const b = backing.get(el || w.document.getElementById('board')); fs.writeFileSync(path.join(OUT, name + (dark ? '-dark' : '') + '.png'), b.c.toBuffer('image/png')); };
(async () => {
  await sleep(100);
  const A = w.SpireApp, C = w.SpireCore;
  console.log('board color token:', JSON.stringify(w.getComputedStyle(w.document.documentElement).getPropertyValue('--board')));
  // mid-game position from bot self-play
  const rng = C.makeRng(99); const moves = []; const t = C.newState(1);
  while (t.ply < 27) { const m = C.botMove(t, 2, rng, false); C.applyMove(t, m); moves.push(m); }
  A.newGame({ mode: 'bot', level: 2, human: 2, moves }, true);
  await sleep(100); A.render(); save('1-midgame');
  // select the best capture to show the preview
  const best = C.legalMoves(A.s).map(m => C.preview(A.s, m)).sort((a, b) => b.flips.length - a.flips.length)[0];
  A.sel = best.cell; A.updateUI(); A.render(); save('2-preview');
  console.log('preview', C.cellName(best.cell), best.kind, 'flips', best.flips.length, '| button:', w.document.getElementById('confirmBtn').textContent, '| coach:', w.document.getElementById('coachText').textContent);
  // puzzle
  A.sel = null; w.document.getElementById('puzzleBtn').click(); await sleep(50); A.render(); save('3-puzzle');
  console.log('puzzle coach:', w.document.getElementById('coachText').textContent);
  // rules demo
  w.document.getElementById('menuBtn').click(); w.document.querySelector('[data-go="rules"]').click(); await sleep(60);
  save('4-demo', w.document.getElementById('demo'));
  console.log('done');
  process.exit(0);
})();
