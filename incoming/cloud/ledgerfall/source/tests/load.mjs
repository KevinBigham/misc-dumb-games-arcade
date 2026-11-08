// jsdom harness: real page scripts, mocked canvas (napi), mocked WebAudio, manual clock + frames.
import { createRequire } from 'module'; import fs from 'fs'; import { FILE } from './core.mjs';
const require = createRequire('/tmp/claude-0/-home-user/7953052c-7890-53d2-bf7f-c4d8208b9c62/scratchpad/deps/x.js');
const { JSDOM, VirtualConsole } = require('jsdom'); const { createCanvas } = require('@napi-rs/canvas');
export function load({ w = 375, h = 667, storage = null } = {}) {
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync(FILE, 'utf8') + '</body></html>';
  const errors = []; const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.stack || e.message))); vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
  let clock = 1000; const audio = { created: 0, started: 0, suspended: 0, resumed: 0, ctx: null };
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://example.test/', virtualConsole: vc, beforeParse(win) {
    Object.defineProperty(win, 'innerWidth', { value: w, configurable: true }); Object.defineProperty(win, 'innerHeight', { value: h, configurable: true });
    win.devicePixelRatio = 2; win.requestAnimationFrame = () => 0; win.performance.now = () => clock;
    const P = win.HTMLCanvasElement.prototype;
    const nc = el => { if (!el._nc) { el._nc = createCanvas(el._w || 300, el._h || 150); el._ctx = el._nc.getContext('2d'); } return el._nc; };
    Object.defineProperty(P, 'width', { get() { return this._w || 300; }, set(v) { this._w = v | 0; nc(this).width = this._w; }, configurable: true });
    Object.defineProperty(P, 'height', { get() { return this._h || 150; }, set(v) { this._h = v | 0; nc(this).height = this._h; }, configurable: true });
    P.getContext = function () { nc(this); return this._ctx; };
    P.toPNG = function () { return this._nc.toBuffer('image/png'); };
    if (!win.PointerEvent) win.PointerEvent = class extends win.MouseEvent { constructor(t, o = {}) { super(t, o); this.pointerId = o.pointerId || 1; } };
    class FakeParam { setValueAtTime() {} exponentialRampToValueAtTime() {} setTargetAtTime() {} set value(v) { this._v = v; } get value() { return this._v; } }
    const node = () => ({ connect() {}, gain: new FakeParam(), frequency: new FakeParam(), type: '', start() { audio.started++; }, stop() {}, buffer: null, getChannelData: () => new Float32Array(10) });
    win.AudioContext = class { constructor() { audio.created++; audio.ctx = this; this.state = 'running'; this.currentTime = 0; this.sampleRate = 8000; this.destination = {}; }
      createGain() { return node(); } createOscillator() { return node(); } createBiquadFilter() { return node(); } createBufferSource() { return node(); }
      createBuffer(c, l) { return { getChannelData: () => new Float32Array(l) }; } resume() { audio.resumed++; this.state = 'running'; return Promise.resolve(); } suspend() { audio.suspended++; this.state = 'suspended'; return Promise.resolve(); } };
    if (storage) for (const [k, v] of Object.entries(storage)) win.localStorage.setItem(k, v);
    win.addEventListener('error', e => errors.push('window.error: ' + e.message));
  } });
  const win = dom.window, doc = win.document, LF = win.LF;
  const frames = (n, ms = 16) => { for (let i = 0; i < n; i++) { clock += ms; if (audio.ctx) audio.ctx.currentTime += ms / 1000; LF.frame(clock); } };
  const ptr = (el, type, x, y, id = 1) => el.dispatchEvent(new win.PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: id }));
  const click = sel => { const el = typeof sel === 'string' ? doc.querySelector(sel) : sel; if (!el) throw new Error('missing ' + sel); el.dispatchEvent(new win.MouseEvent('click', { bubbles: true })); };
  const key = (k, type = 'keydown') => win.dispatchEvent(new win.KeyboardEvent(type, { key: k, bubbles: true }));
  const setHidden = h => { Object.defineProperty(doc, 'hidden', { value: h, configurable: true }); doc.dispatchEvent(new win.Event('visibilitychange')); };
  return { dom, win, doc, LF, errors, audio, frames, ptr, click, key, setHidden, adv: ms => { clock += ms; } };
}
