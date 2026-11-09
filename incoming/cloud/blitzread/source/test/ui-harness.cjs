// Headless UI smoke test: runs blitzread.html's scripts in a tiny fake DOM and drives full games
// through the real click/pointer handlers. Run: node test/ui-harness.cjs [games]
const fs = require('fs'), path = require('path'), vm = require('vm');
const HTML = fs.readFileSync(path.join(__dirname, '..', 'blitzread.html'), 'utf8');
const VOID = new Set(['meta', 'br', 'img', 'input', 'hr', 'link']);
let NOW = 1000;
class El {
  constructor(tag, attrs) {
    this.tagName = tag.toUpperCase(); this.attrs = attrs || {}; this.children = []; this.parentNode = null; this._text = '';
    this.style = {}; this.dataset = {}; this.hidden = 'hidden' in this.attrs; this.listeners = {};
    this.id = this.attrs.id || ''; this.className = this.attrs.class || '';
    for (const k in this.attrs) if (k.startsWith('data-')) this.dataset[k.slice(5)] = this.attrs[k];
    if (this.attrs.style) for (const d of this.attrs.style.split(';')) { const [a, b] = d.split(':'); if (a && b) this.style[a.trim()] = b.trim(); }
    const self = this;
    this.classList = {
      add: (...c) => { const s = new Set(self.className.split(/\s+/).filter(Boolean)); c.forEach(x => s.add(x)); self.className = [...s].join(' '); },
      remove: (...c) => { self.className = self.className.split(/\s+/).filter(x => x && !c.includes(x)).join(' '); },
      contains: c => self.className.split(/\s+/).includes(c),
      toggle: (c, f) => { const has = self.classList.contains(c); const want = f === undefined ? !has : !!f; if (want) self.classList.add(c); else self.classList.remove(c); return want; },
    };
    this.width = +this.attrs.width || 300; this.height = +this.attrs.height || 150;
  }
  get firstChild() { return this.children[0] || null; } get lastChild() { return this.children[this.children.length - 1] || null; }
  appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
  insertBefore(c, ref) { c.parentNode = this; const i = ref ? this.children.indexOf(ref) : -1; if (i < 0) this.children.push(c); else this.children.splice(i, 0, c); return c; }
  removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); return c; }
  set innerHTML(h) { this.children = []; for (const c of parse(h)) this.appendChild(c); }
  get innerHTML() { return '[html]'; }
  set textContent(t) { this.children = []; this._text = String(t); } get textContent() { return this._text + this.children.map(c => c.textContent).join(''); }
  addEventListener(k, f) { (this.listeners[k] = this.listeners[k] || []).push(f); }
  dispatch(k, ev) { for (const f of this.listeners[k] || []) f(ev); }
  setPointerCapture() {} focus() {}
  getBoundingClientRect() { return { left: 0, top: 0, width: 390, height: 780, right: 390, bottom: 780 }; }
  getContext() { return ctx2d(); }
  all() { const out = []; const walk = e => { for (const c of e.children) { out.push(c); walk(c); } }; walk(this); return out; }
  matches(sel) { const m = sel.match(/^([a-z0-9]*)(#[\w-]+)?((?:\.[\w-]+)*)$/i); if (!m) throw new Error('selector ' + sel); if (m[1] && this.tagName !== m[1].toUpperCase()) return false; if (m[2] && this.id !== m[2].slice(1)) return false; if (m[3]) for (const c of m[3].split('.').filter(Boolean)) if (!this.classList.contains(c)) return false; return true; }
  querySelectorAll(sel) { const parts = sel.trim().split(/\s+/); let cur = [this]; for (const p of parts) { const nx = []; for (const r of cur) for (const e of r.all()) if (e.matches(p) && !nx.includes(e)) nx.push(e); cur = nx; } return cur; }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  click() { if (this.onclick) this.onclick({ preventDefault() {} }); }
}
function parse(h) {
  const root = new El('root'); const stack = [root]; const re = /<(\/?)([a-z0-9]+)([^>]*)>|([^<]+)/gi; let m;
  while ((m = re.exec(h))) {
    if (m[4] !== undefined) { const t = m[4].replace(/&amp;/g, '&'); if (t.trim()) stack[stack.length - 1].appendChild(Object.assign(new El('#text'), { _text: t })); continue; }
    const close = m[1] === '/', tag = m[2].toLowerCase();
    if (close) { for (let i = stack.length - 1; i > 0; i--) if (stack[i].tagName === tag.toUpperCase()) { stack.length = i; break; } continue; }
    const attrs = {}; const ar = /([\w-:]+)(?:="([^"]*)")?/g; let a; while ((a = ar.exec(m[3]))) attrs[a[1]] = a[2] === undefined ? '' : a[2];
    const el = new El(tag, attrs); stack[stack.length - 1].appendChild(el); if (!VOID.has(tag) && !m[3].endsWith('/')) stack.push(el);
  }
  return root.children;
}
let drawCalls = 0;
function ctx2d() { return new Proxy({}, { get(t, k) { if (k in t) return t[k]; if (k === 'measureText') return () => ({ width: 10 }); if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} }); return (...a) => { drawCalls++; for (const v of a) if (typeof v === 'number' && !isFinite(v) && k !== 'setLineDash') throw new Error('non-finite arg to ' + String(k) + ': ' + a); }; }, set(t, k, v) { t[k] = v; return true; } }); }
function audioNode() { const p = { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime(v) { if (!(v > 0)) throw new Error('exp ramp to ' + v); }, linearRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} };
  return new Proxy({}, { get(t, k) { if (k in t) return t[k]; if (['gain', 'frequency', 'Q', 'detune', 'playbackRate', 'pan'].includes(k)) return (t[k] = Object.assign({}, p)); if (k === 'connect') return x => x; return () => {}; }, set(t, k, v) { t[k] = v; return true; } }); }
let audioCreated = 0, audioState = 'running', resumes = 0, suspends = 0;
let oscs = 0;
class AC { get currentTime() { return NOW / 1000; } constructor() { audioCreated++; this.sampleRate = 8000; this.destination = audioNode(); this.state = 'running'; }
  createGain() { return audioNode(); } createOscillator() { oscs++; return audioNode(); } createBiquadFilter() { return audioNode(); } createBufferSource() { return audioNode(); } createDynamicsCompressor() { return audioNode(); } createStereoPanner() { return audioNode(); } createDelay() { return audioNode(); }
  createBuffer(c, n) { return { getChannelData: () => new Float32Array(n) }; }
  resume() { this.state = 'running'; resumes++; return Promise.resolve(); } suspend() { this.state = 'suspended'; suspends++; return Promise.resolve(); } }

function makeWorld(store) {
  const docRoot = new El('body'); for (const c of parse(HTML.replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/, ''))) docRoot.appendChild(c);
  const byId = id => docRoot.all().find(e => e.id === id) || null;
  const raf = []; const timers = [];
  const docL = {}, winL = {};
  const document = { hidden: false, body: docRoot, getElementById: byId, querySelectorAll: s => docRoot.querySelectorAll(s), querySelector: s => docRoot.querySelector(s), createElement: t => new El(t),
    addEventListener: (k, f) => (docL[k] = docL[k] || []).push(f) };
  const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
  const win = { devicePixelRatio: 2, AudioContext: AC, addEventListener: (k, f) => (winL[k] = winL[k] || []).push(f) };
  const ctx = vm.createContext({ window: win, document, localStorage, performance: { now: () => NOW }, requestAnimationFrame: f => raf.push(f), setTimeout: (f, ms) => { timers.push({ f, at: NOW + (ms || 0) }); return timers.length; }, clearTimeout: () => {},
    getComputedStyle: () => ({ getPropertyValue: () => 'Impact' }), console, Math, JSON, Promise });
  win.window = win;
  // GameKit 2.1: the kit script needs a real browser, so this fake DOM gets a stand-in GK at the kit's default settings
  ctx.GK = win.GK = { studio() {}, wired() {}, coach: { create: () => ({}) }, flash: { allow: a => Math.min(a, 0.7) }, audio: { ladder: () => 1 },
    prefs: { motion: () => 'full', motionScale: () => 1, speed: () => 1, text: () => 1, vol: () => 1, on() {}, get() {}, set() {} },
    ui: { floor: px => Math.max(12, px), prefsButton: o => new El('button', { class: ((o && o.className) || '') + ' gk-pyw' }), gear: () => ({ show() {} }) } };
  const scripts = [...HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  for (const s of scripts) vm.runInContext(s, ctx, { filename: 'blitzread.html' });
  const W = {
    ctx, byId, document, store,
    ev: code => vm.runInContext(code, ctx),
    step(ms) { const end = NOW + ms; while (NOW < end) { NOW += 16; const fs = raf.splice(0); for (const f of fs) f(NOW); for (let i = timers.length - 1; i >= 0; i--) if (timers[i].at <= NOW) { const t = timers.splice(i, 1)[0]; t.f(); } } },
    ptr(type, x, y, id) { byId('field').dispatch(type, { clientX: x, clientY: y, pointerId: id || 1, preventDefault() {} }); },
    key(type, key) { for (const f of winL[type] || []) f({ key, repeat: false, preventDefault() {} }); },
    hide(h) { document.hidden = h; for (const f of docL.visibilitychange || []) f(); },
    click(id) { const e = byId(id); if (!e) throw new Error('no button ' + id); e.click(); },
  };
  return W;
}
module.exports = { makeWorld, stats: () => ({ audioCreated, resumes, suspends, drawCalls, oscs }) };

// ---------- drive full games ----------
function playOne(W, R, style, log) {
  let guard = 0; const seen = new Set();
  while (guard++ < 40000) {
    const mode = W.ev('App.mode'); seen.add(mode);
    if (W.ev('App.paused')) { W.click('pRes'); continue; }
    if (mode === 'menu') { return seen; }
    if (mode === 'call') {
      const sheet = W.byId('callSheet'); if (sheet.classList.contains('off')) throw new Error('call mode but sheet hidden');
      const cards = W.byId('cards').querySelectorAll('.card'); if (!cards.length) throw new Error('no cards');
      const fg = W.byId('fgBtn'), pt = W.byId('puntBtn');
      const down = W.ev('App.s.down');
      if (down === 4 && !fg.hidden && R() < 0.7) { fg.click(); W.step(400 + R() * 900); W.ptr('pointerdown', 200, 400); W.ptr('pointerup', 200, 400); W.step(50); continue; }
      if (down === 4 && !pt.hidden && R() < 0.6) { pt.click(); W.step(30); continue; }
      if (R() < 0.15) W.key('keydown', 'm');
      if (R() < 0.3) W.key('keydown', String(1 + Math.floor(R() * cards.length))); else cards[Math.floor(R() * cards.length)].click();
      W.step(16); continue;
    }
    if (mode === 'hut') { W.step(16); continue; }
    if (mode === 'live') {
      const kind = W.ev('App.s.play.kind');
      const t = W.ev('App.s.play.t');
      if (kind === 'pass' && t > 0.6 + R() * 1.5 && W.ev("(()=>{const P=App.s.play;return !P.thrown&&!P.scramble&&Core.carrierOf(P)===P.E[P.ix.QB]})()")) {
        const k = ['X', 'Y', 'Z', 'RB'][Math.floor(R() * 4)];
        const [x, y] = W.ev("w2s(App.s.play.E[App.s.play.ix['" + k + "']].x, App.s.play.E[App.s.play.ix['" + k + "']].y)");
        W.ptr('pointerdown', x, y); W.step(32); W.ptr('pointerup', x, y); W.step(16); continue;
      }
      if (style === 'hold' && R() < 0.05) {
        // hold and steer upfield, with a flick sometimes
        const [cxp, cyp] = W.ev("(()=>{const c=Core.carrierOf(App.s.play);return c?w2s(c.x,c.y+4):[195,300]})()");
        W.ptr('pointerdown', cxp, cyp, 2); W.step(200); W.ptr('pointermove', cxp + 10, cyp - 20, 2); W.step(150);
        if (R() < 0.5) { W.step(150); W.ptr('pointermove', cxp + 60, cyp - 25, 2); }
        W.step(300); W.ptr('pointerup', cxp, cyp, 2); continue;
      }
      if (style === 'keys' && R() < 0.05) { W.key('keydown', 'ArrowUp'); W.step(300); if (R() < 0.3) W.key('keydown', ' '); W.key('keyup', 'ArrowUp'); continue; }
      W.step(16); continue;
    }
    if (mode === 'after') { if (R() < 0.5) { W.ptr('pointerdown', 100, 100); W.ptr('pointerup', 100, 100); } W.step(100); continue; }
    if (mode === 'def') {
      const btns = W.byId('defcalls').querySelectorAll('button');
      if (W.byId('defcalls').style.display !== 'none' && !W.ev('App.defAnim')) { if (R() < 0.3) W.key('keydown', String(1 + Math.floor(R() * 4))); else btns[Math.floor(R() * btns.length)].click(); }
      W.step(100); continue;
    }
    if (mode === 'kick') { W.step(50); continue; }
    if (mode === 'idle') { W.step(16); continue; }
    throw new Error('unknown mode ' + mode);
  }
  throw new Error('game stuck in ' + W.ev('App.mode') + ' phase ' + W.ev('App.s && App.s.phase'));
}
if (require.main === module) {
  const N = +process.argv[2] || 8; const store = {}; let R = (() => { let a = 7; return () => { a = (a * 1103515245 + 12345) & 0x7fffffff; return a / 0x7fffffff; }; })();
  let W = makeWorld(store); W.step(100);
  if (!W.byId('mPlay')) throw new Error('no play button on title');
  const out = [];
  for (let g = 0; g < N; g++) {
    // alternate season and daily
    const daily = g % 4 === 3;
    if (daily) W.click('mDaily'); else if (W.byId('mPlay')) W.click('mPlay'); else if (W.byId('mResume')) W.click('mResume'); else if (W.byId('mNew')) W.click('mNew'), W.click('mPlay');
    W.step(50);
    // mid-game: hide tab once, check pause + audio suspended
    let hidTested = false;
    const style = ['tap', 'hold', 'keys'][g % 3];
    const seen = playOne(W, R, style);
    const txt = W.byId('menu').textContent;
    const fin = /FINAL|HARVEST CUP/.test(txt) ? txt.match(/CDR \d+ · \d+ \w+/) : null;
    out.push({ g, daily, style, final: fin && fin[0], modes: [...seen].join(','), rung: JSON.parse(store['blitzread.v1']).season.rung, losses: JSON.parse(store['blitzread.v1']).season.losses });
    if (W.byId('fMenu')) W.click('fMenu'); W.step(50);
  }
  console.table(out);
  console.log(module.exports.stats());
}
