// Minimal fake browser for node tests of single-file games and the kit.
// Not a real browser: no layout, no real audio, no real touch. It only proves code paths run.
const vm = require('vm');

function makeEnv(o) {
  o = o || {};
  const storage = o.storage || new Map();
  const log = { errors: [], vibs: [], clip: [], shares: [], toasts: [], audioPlays: [], htmlAudio: 0, execCopy: 0 };
  let clock = 1000, nowMs = o.now || Date.UTC(2026, 10, 6, 15, 0, 0);
  const timers = []; let rafQ = [];
  const param = () => ({ value: 1, setValueAtTime() {}, setTargetAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {} });
  const node = () => ({ _to: [], connect(t) { this._to.push(t); return t; }, disconnect() { this._to = []; }, gain: param(), frequency: param(), Q: param(), pan: param(), playbackRate: param(), detune: param(), type: '', start() { log.audioPlays.push(this); const self = this; win.setTimeout(() => { if (self.onended) self.onended(); }, 60); }, stop() {}, buffer: null, onended: null });
  const contexts = [];
  class AC {
    constructor() { this.currentTime = 0; this.state = o.audioStartState || 'suspended'; this.sampleRate = 8000; this.destination = node(); this._h = {}; this.onstatechange = null; contexts.push(this); }
    addEventListener(t, f) { (this._h[t] = this._h[t] || []).push(f); }
    _set(s) { this.state = s; for (const f of this._h.statechange || []) f({}); if (this.onstatechange) this.onstatechange({}); }
    createGain() { return node(); } createBiquadFilter() { return node(); } createOscillator() { return node(); } createBufferSource() { return node(); }
    createDynamicsCompressor() { const n = node(); n.threshold = param(); n.knee = param(); n.ratio = param(); n.attack = param(); n.release = param(); return n; }
    createStereoPanner() { return node(); } createDelay() { const n = node(); n.delayTime = param(); return n; } createConvolver() { return node(); } createWaveShaper() { return node(); }
    createBuffer(c, n, r) { const d = []; for (let i = 0; i < c; i++) d.push(new Float32Array(n)); return { length: n, sampleRate: r, numberOfChannels: c, duration: n / r, getChannelData: i => d[i || 0] }; }
    resume() { if (o.resumeFails) return Promise.reject(new Error('no')); this._set('running'); return Promise.resolve(); }
    suspend() { this._set('suspended'); return Promise.resolve(); }
    close() { this._set('closed'); return Promise.resolve(); }
  }
  const ctx2d = new Proxy({}, { get(t, k) { if (k in t) return t[k]; if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => ({ addColorStop() {} }); if (k === 'measureText') return s => ({ width: String(s).length * 7 }); if (k === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }); return () => {}; }, set(t, k, v) { t[k] = v; return true; } });
  const byId = {};
  class El {
    constructor(tag, id) {
      this.tagName = (tag || 'div').toUpperCase(); this.nodeName = this.tagName; this.id = id || ''; this.style = {}; this.dataset = {}; this.children = []; this._h = {};
      this.hidden = false; this._cls = new Set(); this._html = ''; this.attrs = {}; this.width = 300; this.height = 150; this.scrollTop = 0; this._text = ''; this.value = ''; this.checked = false; this._q = {};
      const self = this;
      this.classList = { add(...c) { c.forEach(x => self._cls.add(x)); }, remove(...c) { c.forEach(x => self._cls.delete(x)); }, toggle(c, f) { const v = f === undefined ? !self._cls.has(c) : !!f; if (v) self._cls.add(c); else self._cls.delete(c); return v; }, contains: c => self._cls.has(c) };
    }
    get className() { return [...this._cls].join(' '); } set className(v) { this._cls = new Set(String(v).split(/\s+/).filter(Boolean)); }
    set innerHTML(v) { this._html = String(v); this._q = {}; } get innerHTML() { return this._html; }
    set textContent(v) { this._text = String(v); } get textContent() { return this._text; }
    get innerText() { return this._text; } set innerText(v) { this._text = String(v); }
    addEventListener(t, f) { (this._h[t] = this._h[t] || []).push(f); }
    removeEventListener(t, f) { if (this._h[t]) this._h[t] = this._h[t].filter(x => x !== f); }
    fire(t, e) { e = e || {}; if (!e.target) e.target = this; if (!e.preventDefault) { e.defaultPrevented = false; e.cancelable = true; e.preventDefault = function () { this.defaultPrevented = true; }; } if (!e.stopPropagation) e.stopPropagation = () => {}; for (const f of (this._h[t] || []).slice()) f(e); return e; }
    dispatchEvent(e) { return this.fire(e.type, e); }
    click() { this.fire('click', {}); if (this.tagName === 'LABEL') log.labelClicks = (log.labelClicks || 0) + 1; }
    getContext() { return ctx2d; } setPointerCapture() {} releasePointerCapture() {} hasPointerCapture() { return false; }
    getBoundingClientRect() { return { left: 0, top: 0, width: this.width, height: this.height, right: this.width, bottom: this.height }; }
    querySelectorAll() { return []; }
    querySelector(sel) { if (!this._q[sel]) { const e = new El(sel === 'textarea' ? 'textarea' : 'div'); e.parent = this; this._q[sel] = e; } return this._q[sel]; }
    appendChild(c) { this.children.push(c); c.parent = this; if (c.id) byId[c.id] = c; return c; }
    insertBefore(c) { return this.appendChild(c); } prepend(c) { this.children.unshift(c); c.parent = this; }
    removeChild(c) { this.children = this.children.filter(x => x !== c); }
    get firstChild() { return this.children[0]; } get lastChild() { return this.children[this.children.length - 1]; }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(x => x !== this); this.parent = null; }
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'id') { this.id = v; byId[v] = this; } } getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; } removeAttribute(k) { delete this.attrs[k]; } hasAttribute(k) { return k in this.attrs; }
    closest() { return null; } focus() {} blur() {} select() {} setSelectionRange() {} contains() { return false; }
    play() { log.htmlAudio++; return Promise.resolve(); } pause() {}
  }
  const document = new El('document');
  document.visibilityState = 'visible'; document.hidden = false;
  document.getElementById = id => byId[id] || null;
  document.createElement = tag => new El(tag);
  document.createTextNode = t => { const e = new El('#text'); e.textContent = t; return e; };
  document.documentElement = new El('html'); document.body = new El('body'); document.head = new El('head'); document.activeElement = document.body;
  const meta = new El('meta'); meta.attrs.name = 'viewport'; meta.attrs.content = o.viewport || 'width=device-width,initial-scale=1';
  document.head.appendChild(meta);
  document.querySelector = sel => { if (/meta\[name=.?viewport/.test(sel)) return o.noMeta ? null : meta; const m = /^#([\w-]+)$/.exec(sel); if (m) return byId[m[1]] || null; return null; };
  document.querySelectorAll = () => [];
  document.execCommand = () => { log.execCopy++; return !!o.execCopyWorks; };
  (o.ids || []).forEach(id => { byId[id] = new El(id === 'cv' || /canvas/i.test(id) ? 'canvas' : 'div', id); });
  const ua = o.ua || 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
  const nav = {
    userAgent: ua, maxTouchPoints: 5, platform: /iPhone/.test(ua) ? 'iPhone' : 'Linux',
    clipboard: o.noClipboard ? undefined : { writeText: s => { if (o.clipboardFails) return Promise.reject(new Error('denied')); log.clip.push(s); return Promise.resolve(); } },
    storage: { persist: () => Promise.resolve(true) },
    audioSession: o.noAudioSession ? undefined : { type: 'auto' }
  };
  if (o.vibrate) nav.vibrate = p => { log.vibs.push(p); return true; };
  if (o.share) nav.share = d => { log.shares.push(d); return o.share === 'abort' ? Promise.reject(Object.assign(new Error('a'), { name: 'AbortError' })) : o.share === 'fail' ? Promise.reject(new Error('NotAllowed')) : Promise.resolve(); };
  const win = {
    innerWidth: o.w || 390, innerHeight: o.h || 844, devicePixelRatio: 3,
    _h: {}, addEventListener(t, f) { (win._h[t] = win._h[t] || []).push(f); }, removeEventListener(t, f) { if (win._h[t]) win._h[t] = win._h[t].filter(x => x !== f); },
    fire(t, e) { e = e || {}; if (!e.preventDefault) { e.cancelable = true; e.preventDefault = function () { this.defaultPrevented = true; }; } if (!e.stopPropagation) e.stopPropagation = () => {}; for (const f of (win._h[t] || []).slice()) f(e); return e; },
    requestAnimationFrame(f) { rafQ.push(f); return rafQ.length; }, cancelAnimationFrame() {},
    matchMedia: q => ({ matches: !!(o.reducedMotion && /reduce/.test(q)), addEventListener() {}, addListener() {} }),
    getComputedStyle: () => ({ paddingTop: '47px', paddingBottom: '34px', paddingLeft: '0px', paddingRight: '0px', getPropertyValue: () => '' }),
    AudioContext: AC,
    Audio: function () { const e = new El('audio'); return e; },
    URL: { createObjectURL: () => 'blob:x' }, Blob: function () {},
    localStorage: o.noStorage ? undefined : { getItem: k => storage.has(k) ? storage.get(k) : null, setItem: (k, v) => { if (o.storageFull) throw new Error('QuotaExceeded'); storage.set(k, String(v)); }, removeItem: k => storage.delete(k) },
    navigator: nav,
    location: { search: o.search || '', hash: o.hash || '', href: 'https://example.invalid/' + (o.search || '') + (o.hash || '') },
    performance: { now: () => clock },
    setTimeout: (f, ms) => { timers.push({ at: clock + (ms || 0), f }); return timers.length; }, clearTimeout() {},
    setInterval: (f, ms) => { const t = { at: clock + ms, f, every: ms }; timers.push(t); return timers.length; }, clearInterval() {},
    console: { log: (...a) => { if (o.verbose) console.log('[page]', ...a); }, warn: (...a) => { if (o.verbose) console.log('[page warn]', ...a); }, error: (...a) => { log.errors.push(a.join(' ')); console.log('[page error]', ...a); } },
    Date: class extends Date { constructor(...a) { if (a.length) super(...a); else super(nowMs); } static now() { return nowMs; } },
    Intl, TextEncoder, TextDecoder, btoa: s => Buffer.from(s, 'binary').toString('base64'), atob: s => Buffer.from(s, 'base64').toString('binary'),
    escape, unescape, encodeURIComponent, decodeURIComponent, HTMLInputElement: function () {}
  };
  if (o.visualViewport) win.visualViewport = { width: win.innerWidth, height: win.innerHeight, addEventListener() {} };
  win.window = win; win.self = win; win.document = document; win.globalThis = win;
  ['Math', 'JSON', 'Promise', 'Map', 'Set', 'WeakMap', 'Float32Array', 'Float64Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint32Array', 'Int32Array', 'ArrayBuffer', 'DataView', 'Proxy', 'parseFloat', 'parseInt', 'Number', 'String', 'Array', 'Object', 'isFinite', 'isNaN', 'Error', 'RegExp', 'Symbol', 'Boolean', 'Function', 'Infinity', 'NaN', 'Reflect'].forEach(k => { win[k] = globalThis[k]; });
  const context = vm.createContext(win);
  function runTimers() { for (let i = 0; i < timers.length; i++) { const t = timers[i]; if (t.at <= clock) { if (t.every) t.at += t.every; else { timers.splice(i, 1); i--; } try { t.f(); } catch (e) { log.errors.push('timer: ' + e.stack); } } } }
  return {
    win, document, byId, log, context, contexts, El, storage,
    run(src, name) { try { vm.runInContext(src, context, { filename: name || 'script.js' }); } catch (e) { log.errors.push((name || 'script') + ': ' + e.stack); console.log('LOAD ERROR', e.stack); } },
    async flush() { for (let i = 0; i < 5; i++) await new Promise(r => setImmediate(r)); },
    frame(ms) {
      ms = ms || 16.67; clock += ms; nowMs += ms; runTimers();
      const q = rafQ; rafQ = [];
      for (const f of q) { try { f(clock); } catch (e) { log.errors.push('frame: ' + e.stack); if (log.errors.length < 4) console.log('FRAME ERROR', e.stack); } }
    },
    frames(n, ms) { for (let i = 0; i < n; i++) this.frame(ms); },
    advanceWall(ms) { nowMs += ms; },
    setNow(ms) { nowMs = ms; },
    hide() { document.visibilityState = 'hidden'; document.hidden = true; document.fire('visibilitychange', {}); win.fire('pagehide', {}); },
    show() { document.visibilityState = 'visible'; document.hidden = false; document.fire('visibilitychange', {}); win.fire('pageshow', {}); },
    tap(el, x, y, id) {
      const base = { pointerId: id || 1, pointerType: 'touch', clientX: x || 10, clientY: y || 10, isPrimary: true, button: 0 };
      win.fire('pointerdown', Object.assign({}, base)); if (el) el.fire('pointerdown', Object.assign({}, base));
      win.fire('pointerup', Object.assign({}, base)); if (el) el.fire('pointerup', Object.assign({}, base));
      win.fire('touchend', {}); win.fire('click', {}); if (el) el.fire('click', {});
    }
  };
}
module.exports = { makeEnv };
