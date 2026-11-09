// Fathomsong headless harness: runs the real game script in a Node vm with a fake
// DOM, a fake 2D canvas, a mock AudioContext whose clock is driven by a fake
// performance clock, and fake timers. No browser is required.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');

function makeEnv(opts) {
  opts = opts || {};
  const W = opts.w || 390, H = opts.h || 844;
  const clock = { ms: 1000 };              // fake performance.now()
  const timers = []; let tid = 1;
  const rafs = []; let lastRaf = 0;
  const errors = [];
  const store = opts.storage || {};
  const lsThrows = !!opts.lsThrows;
  const localStorage = {
    getItem(k) { if (lsThrows) throw new Error('blocked'); return k in store ? store[k] : null; },
    setItem(k, v) { if (lsThrows) throw new Error('blocked'); store[k] = String(v); },
    removeItem(k) { delete store[k]; },
  };

  // ---- fake 2D context ----
  const grad = () => ({ addColorStop() { } });
  function ctx2d() {
    const o = { createRadialGradient: grad, createLinearGradient: grad, createConicGradient: grad, measureText: () => ({ width: 10 }), canvas: null };
    return new Proxy(o, { get(t, p) { if (p in t) return t[p]; return () => { }; }, set(t, p, v) { t[p] = v; return true; } });
  }
  // ---- fake DOM ----
  const byId = {};
  class El {
    constructor(tag, id) {
      this.tagName = (tag || 'div').toUpperCase(); this.id = id || ''; this._cls = new Set(); this.style = {}; this.dataset = {};
      this.children = []; this._q = {}; this._l = {}; this.textContent = ''; this.value = ''; this.disabled = false; this.width = 300; this.height = 150; this.attrs = {};
      const self = this;
      this.classList = {
        add: (...c) => c.forEach(x => self._cls.add(x)), remove: (...c) => c.forEach(x => self._cls.delete(x)),
        toggle: (c, on) => { const v = on === undefined ? !self._cls.has(c) : !!on; if (v) self._cls.add(c); else self._cls.delete(c); return v; },
        contains: c => self._cls.has(c),
      };
    }
    set className(v) { this._cls = new Set(String(v).split(/\s+/).filter(Boolean)); }
    get className() { return [...this._cls].join(' '); }
    set innerHTML(v) { this._html = v; this.children = []; this._q = {}; }
    get innerHTML() { return this._html || ''; }
    get offsetWidth() { return 0; }
    addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); }
    removeEventListener() { }
    dispatch(t, e) { e = Object.assign({ type: t, preventDefault() { }, stopPropagation() { }, timeStamp: clock.ms }, e || {}); (this._l[t] || []).forEach(f => f(e)); if (t === 'click' && this.onclick) this.onclick(e); }
    click() { this.dispatch('click'); }
    appendChild(c) { this.children.push(c); return c; }
    setAttribute(k, v) { this.attrs[k] = v; }
    querySelector(sel) { return this._q[sel] || (this._q[sel] = new El('div')); }
    querySelectorAll(sel) { return this._qa && this._qa[sel] ? this._qa[sel] : []; }
    getContext() { const c = ctx2d(); return c; }
    getBoundingClientRect() {
      if (this.id === 'hud') return { top: 0, bottom: 74, left: 0, right: W, width: W, height: 74 };
      if (this.id === 'pads') { const ph = Math.max(100, Math.min(150, H * 0.17)); return { top: H - ph, bottom: H, left: 0, right: W, width: W, height: ph }; }
      return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
    }
    select() { } focus() { }
  }
  const ids = ['cv', 'hud', 'pads', 'score', 'lvl', 'combo', 'acc', 'bPause', 'res', 'resFill', 'ovTitle', 'bPlay', 'bSongs', 'bHow', 'bSettings', 'howBox', 'rank', 'ver',
    'ovSelect', 'bSelBack', 'diffSeg', 'diffNote', 'swBlind', 'blindNote', 'songList', 'seedIn', 'bSeed', 'ovResults', 'rGrade', 'rSong', 'rScore', 'rBest', 'rAcc', 'rCombo', 'rPeak', 'rP', 'rG', 'rM',
    'hist', 'rAdvice', 'bNudge', 'bRetry', 'bPractice', 'bResSongs', 'bShare', 'ovPause', 'pauseWhy', 'bResume', 'bRestart', 'bQuit', 'ovSettings', 'vol', 'bOffM', 'offVal', 'bOffP',
    'calBox', 'calDot', 'calMsg', 'bCal', 'swMotion', 'bExport', 'bImportShow', 'importBox', 'importTxt', 'bImport', 'bReset', 'bSetDone', 'ovShare', 'shareTxt', 'bCopy', 'bShareDone', 'countdown', 'toast', 'debug'];
  ids.forEach(id => byId[id] = new El('div', id));
  ['ovSelect', 'ovResults', 'ovPause', 'ovSettings', 'ovShare', 'countdown', 'debug', 'howBox', 'importBox', 'rAdvice', 'bNudge', 'bPractice'].forEach(id => byId[id]._cls.add('hidden'));
  byId.hud._cls.add('dim'); byId.pads._cls.add('dim');
  const pads = [0, 1, 2].map(i => { const p = new El('button'); p.dataset.lane = String(i); p._cls.add('pad'); p._cls.add('p' + i); return p; });
  byId.diffSeg._qa = { button: ['chill', 'flow', 'surge'].map(d => { const b = new El('button'); b.dataset.d = d; return b; }) };
  const docL = {};
  const document = {
    getElementById: id => byId[id] || (byId[id] = new El('div', id)),
    createElement: t => new El(t),
    querySelector: sel => { const m = /\.pad\.p(\d)/.exec(sel); return m ? pads[+m[1]] : null; },
    querySelectorAll: sel => sel === '.pad' ? pads : [],
    addEventListener: (t, f) => { (docL[t] = docL[t] || []).push(f); },
    hidden: false,
    execCommand() { return true; },
  };
  const winL = {};
  // ---- mock AudioContext ----
  const audioLog = { starts: [] };
  function param(v) {
    return { value: v, setValueAtTime(x) { this.value = x; return this; }, linearRampToValueAtTime(x) { this.value = x; return this; }, exponentialRampToValueAtTime(x) { if (!(x > 0)) throw new Error('exp ramp to non-positive ' + x); this.value = x; return this; }, setTargetAtTime() { return this; }, cancelScheduledValues() { return this; } };
  }
  class MockAC {
    constructor() {
      this.sampleRate = 48000; this.state = 'running'; this._base = clock.ms; this._acc = 0; this.destination = {}; this.outputLatency = 0.02; this.baseLatency = 0.005; this.onstatechange = null;
      env.ctx = this;
    }
    get currentTime() { const raw = this._acc + (this.state === 'running' ? (clock.ms - this._base) / 1000 : 0); return Math.floor(raw * 48000 / 128) * 128 / 48000; }
    _freeze() { this._acc += (clock.ms - this._base) / 1000; }
    suspend() { if (this.state === 'running') { this._freeze(); this.state = 'suspended'; if (this.onstatechange) this.onstatechange(); } return Promise.resolve(); }
    resume() { if (this.state !== 'running') { this._base = clock.ms; this.state = 'running'; if (this.onstatechange) this.onstatechange(); } return Promise.resolve(); }
    getOutputTimestamp() { return { contextTime: Math.max(0, this.currentTime - this.outputLatency), performanceTime: clock.ms }; }
    _node(extra) { return Object.assign({ connect(n) { return n; }, disconnect() { } }, extra || {}); }
    createGain() { return this._node({ gain: param(1) }); }
    createDynamicsCompressor() { return this._node({ threshold: param(0), knee: param(0), ratio: param(1), attack: param(0), release: param(0) }); }
    createConvolver() { return this._node({ buffer: null }); }
    createDelay() { return this._node({ delayTime: param(0) }); }
    createBiquadFilter() { return this._node({ type: 'lowpass', frequency: param(350), Q: param(1) }); }
    createBuffer(ch, len, sr) { const d = []; for (let i = 0; i < ch; i++) d.push(new Float32Array(len)); return { getChannelData: i => d[i], length: len, sampleRate: sr }; }
    createBufferSource() { const ac = this; return this._node({ buffer: null, start(t) { audioLog.starts.push({ kind: 'buf', t: t || 0, now: ac.currentTime }); }, stop() { } }); }
    createOscillator() { const ac = this; return this._node({ type: 'sine', frequency: param(440), detune: param(0), start(t) { audioLog.starts.push({ kind: 'osc', t, now: ac.currentTime }); }, stop() { } }); }
  }
  const env = {
    clock, timers, errors, store, audioLog, byId, pads, winL, docL, ctx: null, W, H,
  };
  const g = {
    console: { log: (...a) => { if (opts.verbose) console.log(...a); }, warn: () => { }, error: (...a) => { errors.push(a.map(String).join(' ')); } },
    document, localStorage,
    performance: { now: () => clock.ms },
    setTimeout: (f, d) => { const id = tid++; timers.push({ id, at: clock.ms + (d || 0), f }); return id; },
    clearTimeout: id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); },
    setInterval: (f, d) => { const id = tid++; const t = { id, at: clock.ms + d, f, every: d }; timers.push(t); return id; },
    clearInterval: id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); },
    requestAnimationFrame: f => { rafs.push(f); return rafs.length; },
    navigator: {},
    location: { href: 'https://example.test/game', hash: opts.hash || '', search: opts.search || '' },
    URLSearchParams, Math, JSON, Date, Promise, Object, Array, Set, Map, Uint8Array, Float32Array, String, Number, Error, isNaN, encodeURIComponent,
    matchMedia: () => ({ matches: false }),
    innerWidth: W, innerHeight: H, devicePixelRatio: 3,
    addEventListener: (t, f) => { (winL[t] = winL[t] || []).push(f); },
    AudioContext: opts.noAudio ? undefined : MockAC,
  };
  g.window = g;
  const context = vm.createContext(g);
  env.g = g; env.context = context;
  env.fire = (t, e) => (winL[t] || []).forEach(f => f(Object.assign({ preventDefault() { }, stopPropagation() { }, timeStamp: clock.ms }, e || {})));
  env.key = (k, extra) => env.fire('keydown', Object.assign({ key: k, repeat: false }, extra || {}));
  // advance fake time, running timers, rAF at 60 Hz, and microtasks
  env.advance = async (ms, onStep) => {
    const end = clock.ms + ms;
    while (clock.ms < end) {
      clock.ms = Math.min(end, clock.ms + 2);
      timers.sort((a, b) => a.at - b.at);
      while (timers.length && timers[0].at <= clock.ms) {
        const t = timers[0];
        if (t.every) t.at += t.every; else timers.shift();
        try { t.f(); } catch (e) { errors.push('timer: ' + e.stack); }
      }
      if (clock.ms - lastRaf >= 16.667) {
        lastRaf = clock.ms; const fs2 = rafs.splice(0);
        for (const f of fs2) { try { f(clock.ms); } catch (e) { errors.push('raf: ' + e.stack); } }
      }
      if (onStep) onStep();
      await null;
    }
  };
  env.until = async (pred, maxMs, onStep) => { let waited = 0; while (!pred() && waited < maxMs) { await env.advance(20, onStep); waited += 20; } return pred(); };
  return env;
}

function load(opts) {
  const html = fs.readFileSync(opts.file, 'utf8');
  const m = /<script>([\s\S]*)<\/script>/.exec(html);
  const env = makeEnv(opts);
  vm.runInContext(m[1], env.context, { filename: 'fathomsong.js' });
  env.FS = env.g.FS;
  return env;
}
module.exports = { load };
