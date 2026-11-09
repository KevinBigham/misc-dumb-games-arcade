import { JSDOM, VirtualConsole } from 'jsdom';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
export const FILE = '/mnt/project-files/games/overnight/undertoll/undertoll.html';
export function load({ w = 390, h = 844, storage = null, url = 'https://example.test/' } = {}) {
  const html = fs.readFileSync(FILE, 'utf8');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.stack || e.message)));
  vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
  vc.on('warn', (...a) => errors.push('console.warn: ' + a.join(' ')));
  let clock = 1000;
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: false, url,
    virtualConsole: vc,
    beforeParse(win) {
      Object.defineProperty(win, 'innerWidth', { value: w, configurable: true, writable: true });
      Object.defineProperty(win, 'innerHeight', { value: h, configurable: true, writable: true });
      win.devicePixelRatio = 2;
      win.requestAnimationFrame = () => 0; win.cancelAnimationFrame = () => {};
      win.performance.now = () => clock;
      win.__adv = ms => { clock += ms; return clock; };
      const P = win.HTMLCanvasElement.prototype;
      const nc = el => { if (!el._nc) { el._nc = createCanvas(el._w || 300, el._h || 150); el._ctx = el._nc.getContext('2d'); } return el._nc; };
      Object.defineProperty(P, 'width', { get() { return this._w || 300; }, set(v) { this._w = v | 0; nc(this).width = this._w; }, configurable: true });
      Object.defineProperty(P, 'height', { get() { return this._h || 150; }, set(v) { this._h = v | 0; nc(this).height = this._h; }, configurable: true });
      P.getContext = function (type) { if (type !== '2d') return null; if (!this._w && this.getAttribute('width')) this._w = +this.getAttribute('width'); if (!this._h && this.getAttribute('height')) this._h = +this.getAttribute('height'); nc(this); return this._ctx; };
      win.HTMLCanvasElement.prototype.toPNG = function () { return this._nc.toBuffer('image/png'); };
      if (storage) for (const [k, v] of Object.entries(storage)) win.localStorage.setItem(k, v);
      win.addEventListener('error', e => errors.push('window.error: ' + e.message));
    },
  });
  const win = dom.window;
  return { dom, win, BB: win.__UT, errors, adv: ms => win.__adv(ms), doc: win.document };
}
// draw a frame and save the main canvas
export function shot(env, file) {
  env.BB.draw(env.adv(16));
  fs.writeFileSync(file, env.doc.getElementById('game').toPNG());
}
