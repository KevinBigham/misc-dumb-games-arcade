/* GameKit 1.1 : shared starter kit for single-file phone games.
   Paste inline in a script tag before the game's own script. No build step, no network.
   Modules: GK.rng, GK.daily, GK.save, GK.audio, GK.input, GK.juice, GK.ease,
            GK.badges, GK.share, GK.view, GK.ui, GK.loop, GK.retrofit.  README.md has the API. */
(function (root) {
  'use strict';
  var GK = { version: '1.1.1' };
  var HAS_DOM = typeof window !== 'undefined' && typeof document !== 'undefined';
  var W = HAS_DOM ? window : {};
  function now() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function on(t, ev, fn, opt) { if (t && t.addEventListener) t.addEventListener(ev, fn, opt); }
  function off(t, ev, fn, opt) { if (t && t.removeEventListener) t.removeEventListener(ev, fn, opt); }
  GK.clamp = clamp;
  GK.now = now;

  /* ---------- environment ---------- */
  var ENV = GK.env = (function () {
    var ua = HAS_DOM && navigator.userAgent || '';
    var touchMac = HAS_DOM && /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
    var ios = /iPhone|iPad|iPod/.test(ua) || !!touchMac;
    var reduced = false;
    try { reduced = HAS_DOM && W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    return { ios: ios, android: /Android/.test(ua), touch: HAS_DOM && (('ontouchstart' in W) || navigator.maxTouchPoints > 0), reducedMotion: !!reduced };
  })();

  /* ---------- storage (never throws) ---------- */
  var mem = {};
  var LS = GK.ls = {
    get: function (k) { try { var v = W.localStorage.getItem(k); return v == null ? (k in mem ? mem[k] : null) : v; } catch (e) { return k in mem ? mem[k] : null; } },
    set: function (k, v) { mem[k] = v; try { W.localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: function (k) { delete mem[k]; try { W.localStorage.removeItem(k); } catch (e) {} }
  };

  /* ================= RNG ================= */
  // hash4: string -> four 32-bit words (multiply-xorshift mixing, one pass per lane)
  var HMUL = [0x85ebca6b, 0xc2b2ae35, 0x27d4eb2f, 0x165667b1];
  function hash4(str) {
    str = String(str);
    var h = [0x6a09e667 ^ str.length, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a], M = HMUL;
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      for (var j = 0; j < 4; j++) {
        h[j] = Math.imul(h[j] ^ c, M[j]);
        h[j] ^= h[j] >>> 15;
        c = (c + h[j]) | 0;
      }
    }
    for (var k = 0; k < 4; k++) {
      var x = h[k] ^ h[(k + 1) & 3];
      x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
      x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
      h[k] = (x ^ (x >>> 16)) >>> 0;
    }
    return h;
  }
  function hash32(str) { return hash4(str)[0]; }
  // sfc32 generator (small fast counting, 128-bit state); state is kept so a run can resume.
  function sfc(s) {
    var a = s[0] | 0, b = s[1] | 0, c = s[2] | 0, d = s[3] | 0;
    function next() {
      var t = (((a + b) | 0) + d) | 0;
      d = (d + 1) | 0;
      a = b ^ (b >>> 9);
      b = (c + (c << 3)) | 0;
      c = (c << 21) | (c >>> 11);
      c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    }
    for (var i = 0; i < 12; i++) next();
    next.state = function () { return [a >>> 0, b >>> 0, c >>> 0, d >>> 0]; };
    next.load = function (st) { a = st[0] | 0; b = st[1] | 0; c = st[2] | 0; d = st[3] | 0; };
    return next;
  }
  // mulberry32: kept so shipped games keep their exact dailies
  function mulberry32(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function wrap(fn, seedStr) {
    var R = {
      seed: seedStr,
      next: fn,
      float: function (a, b) { if (b === undefined) { b = a === undefined ? 1 : a; a = 0; } return a + fn() * (b - a); },
      int: function (lo, hi) { return lo + Math.floor(fn() * (hi - lo + 1)); }, // inclusive
      chance: function (p) { return fn() < p; },
      pick: function (arr) { return arr[Math.floor(fn() * arr.length)]; },
      sign: function () { return fn() < 0.5 ? -1 : 1; },
      shuffle: function (arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(fn() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; },
      weighted: function (items, weights) {
        var tot = 0, i; for (i = 0; i < weights.length; i++) tot += Math.max(0, weights[i]);
        var r = fn() * tot; for (i = 0; i < items.length; i++) { r -= Math.max(0, weights[i]); if (r < 0) return items[i]; }
        return items[items.length - 1];
      },
      sub: function (label, n) { return GK.rng.make(seedFor(seedStr, label, n)); },
      state: function () { return fn.state ? fn.state() : null; },
      load: function (st) { if (fn.load && st) fn.load(st); return R; }
    };
    return R;
  }
  function seedFor(base, label, n) { return String(base) + '/' + label + (n === undefined ? '' : '#' + n); }
  var CONS = 'BCDFGHJKLMNPQRSTVWXZ';
  GK.rng = {
    hash32: hash32,
    hash4: hash4,
    mulberry32: mulberry32,
    seedFor: seedFor,
    make: function (seed) { var s = String(seed); return wrap(sfc(hash4(s)), s); },
    legacy: function (seed32) { return wrap(mulberry32(seed32), String(seed32)); },
    streams: function (seed) { return { game: GK.rng.make(seedFor(seed, 'game')), fx: GK.rng.make(seedFor(seed, 'fx')) }; },
    code: function (src) { // 9-letter shareable code, no vowels: BCD-FGH-JKL
      var r = src && src.next ? src : GK.rng.make(src === undefined ? Math.random() + ':' + Date.now() : src);
      var out = ''; for (var i = 0; i < 9; i++) { if (i && i % 3 === 0) out += '-'; out += CONS[Math.floor(r.next() * CONS.length)]; }
      return out;
    },
    normalize: function (text) { // any typed text becomes a seed; codes ignore case, spaces and dashes
      var t = String(text || '').trim();
      var c = t.toUpperCase().replace(/[\s\-_.]/g, '');
      if (/^[BCDFGHJKLMNPQRSTVWXZ]{9}$/.test(c)) return c.slice(0, 3) + '-' + c.slice(3, 6) + '-' + c.slice(6);
      return t;
    },
    // bounded retry for generators: never loops on the clock
    tries: function (max, fn) { for (var i = 0; i < max; i++) { var v = fn(i); if (v !== undefined && v !== null && v !== false) return v; } return null; }
  };

  /* ================= DAILY ================= */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function partsIn(date, tz) {
    if (!tz) return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate(), H: date.getHours(), M: date.getMinutes(), S: date.getSeconds() };
    try {
      var f = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' });
      var o = {}; f.formatToParts(date).forEach(function (p) { o[p.type] = p.value; });
      return { y: +o.year, m: +o.month, d: +o.day, H: (+o.hour) % 24, M: +o.minute, S: +o.second };
    } catch (e) { return partsIn(date, null); }
  }
  GK.daily = {
    // YYYY-MM-DD on the player's own clock (or a fixed zone, e.g. {tz:'America/Chicago'})
    key: function (opts, date) { var p = partsIn(date || new Date(), opts && opts.tz); return p.y + '-' + pad(p.m) + '-' + pad(p.d); },
    seed: function (gameId, key) { return gameId + '|' + (key || GK.daily.key()); },
    msToNext: function (opts, date) {
      var p = partsIn(date || new Date(), opts && opts.tz);
      return ((23 - p.H) * 3600 + (59 - p.M) * 60 + (60 - p.S)) * 1000;
    },
    countdown: function (ms) {
      var s = Math.max(0, Math.ceil(ms / 1000)); var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
      return h > 0 ? h + 'h ' + pad(m) + 'm' : m + 'm ' + pad(s % 60) + 's';
    },
    // record a day played. st = {days:0,last:''}; returns true on a new day. Counts total days, never resets.
    mark: function (st, key) { key = key || GK.daily.key(); if (st.last === key) return false; st.last = key; st.days = (st.days | 0) + 1; return true; },
    label: function (key) { var p = key.split('-'); var mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][(+p[1]) - 1]; return mo + ' ' + (+p[2]); },
    // "Lantern Drum Nov 6: 1234" + optional emoji row
    shareLine: function (o) { return (o.game || 'Game') + ' ' + GK.daily.label(o.key || GK.daily.key()) + ': ' + o.score + (o.grid ? '\n' + o.grid : '') + (o.tail ? '\n' + o.tail : ''); }
  };

  /* ================= SAVE ================= */
  function b64e(s) { if (typeof btoa !== 'undefined') return btoa(unescape(encodeURIComponent(s))); return Buffer.from(s, 'utf8').toString('base64'); }
  function b64d(s) { if (typeof atob !== 'undefined') return decodeURIComponent(escape(atob(s))); return Buffer.from(s, 'base64').toString('utf8'); }
  function sum(s) { return (hash32('gk-save|' + s) >>> 0).toString(36); }
  function okJSON(raw) { if (raw == null || raw === '') return false; try { JSON.parse(raw); return true; } catch (e) { return false; } }
  var hideFns = [];
  var hideBound = false;
  function bindHide() {
    if (hideBound || !HAS_DOM) return; hideBound = true;
    var fire = function () { for (var i = 0; i < hideFns.length; i++) { try { hideFns[i](); } catch (e) {} } };
    on(W, 'pagehide', fire);
    on(document, 'visibilitychange', function () { if (document.visibilityState === 'hidden') fire(); });
  }
  function rotate(key, raw, keep) {
    keep = keep || 3;
    if (!raw || LS.get(key + '.bak1') === raw) return false;
    for (var i = keep; i > 1; i--) { var prev = LS.get(key + '.bak' + (i - 1)); if (prev != null) LS.set(key + '.bak' + i, prev); }
    LS.set(key + '.bak1', raw); return true;
  }
  function backups(key, keep) { var out = []; for (var i = 1; i <= (keep || 3); i++) { var v = LS.get(key + '.bak' + i); if (v != null) out.push(v); } return out; }
  function exportRaw(key, raw) { var body = b64e(JSON.stringify({ k: key, v: raw, t: Date.now() })); return 'GK1.' + body + '.' + sum(body); }
  function importRaw(key, code) {
    code = String(code || '').replace(/\s+/g, '');
    var p = code.split('.'); if (p.length !== 3 || p[0] !== 'GK1' || sum(p[1]) !== p[2]) return null;
    try { var o = JSON.parse(b64d(p[1])); if (o.k !== key || typeof o.v !== 'string') return null; return o.v; } catch (e) { return null; }
  }
  GK.save = {
    onHide: function (fn) { hideFns.push(fn); bindHide(); },
    persist: function () { try { if (navigator.storage && navigator.storage.persist) return navigator.storage.persist().catch(function () { return false; }); } catch (e) {} return Promise.resolve(false); },
    // Retrofit an existing game: no format change. Keeps 3 rolling backups (one per session),
    // restores the newest good backup when the key is missing or unreadable, and adds export/import.
    protect: function (key, opts) {
      opts = opts || {};
      var valid = opts.validate || okJSON;
      var keep = opts.keep || 3;
      var raw = LS.get(key), restored = false;
      if (!valid(raw)) {
        var bs = backups(key, keep);
        for (var i = 0; i < bs.length; i++) if (valid(bs[i])) { LS.set(key, bs[i]); raw = bs[i]; restored = true; break; }
      }
      if (valid(raw)) rotate(key, raw, keep);
      GK.save.persist();
      return {
        key: key, restored: restored,
        backups: function () { return backups(key, keep); },
        exportCode: function () { return exportRaw(key, LS.get(key) || ''); },
        importCode: function (code) { var v = importRaw(key, code); if (v == null || !valid(v)) return false; rotate(key, LS.get(key), keep); LS.set(key, v); return true; }
      };
    },
    // New games: versioned store {v,t,d} with defaults, migrations, backups and save on hide.
    store: function (key, opts) {
      opts = opts || {};
      var version = opts.version || 1, defaults = opts.defaults || {}, keep = opts.keep || 3;
      function fresh() { return JSON.parse(JSON.stringify(defaults)); }
      function parse(raw) { try { var o = JSON.parse(raw); return (o && typeof o === 'object' && typeof o.v === 'number' && o.d && typeof o.d === 'object') ? o : null; } catch (e) { return null; } }
      function fill(d) { var f = fresh(); for (var k in f) if (!(k in d) || typeof d[k] !== typeof f[k]) d[k] = f[k]; return d; }
      var S = { key: key, data: null, restored: false };
      S.load = function () {
        var raw = LS.get(key), o = parse(raw);
        if (!o) { var bs = backups(key, keep); for (var i = 0; i < bs.length && !o; i++) { o = parse(bs[i]); if (o) S.restored = true; } }
        var d = o ? o.d : fresh(), v = o ? o.v : version;
        while (o && v < version && opts.migrate) { d = opts.migrate(d, v) || d; v++; }
        S.data = fill(d);
        if (o && raw && parse(raw)) rotate(key, raw, keep);
        return S.data;
      };
      S.save = function () { if (!S.data) return false; return LS.set(key, JSON.stringify({ v: version, t: Date.now(), d: S.data })); };
      S.reset = function () { rotate(key, LS.get(key), keep); S.data = fresh(); S.save(); return S.data; };
      S.exportCode = function () { S.save(); return exportRaw(key, LS.get(key) || ''); };
      S.importCode = function (code) { var v = importRaw(key, code); if (v == null || !parse(v)) return false; rotate(key, LS.get(key), keep); LS.set(key, v); S.load(); return true; };
      S.backups = function () { return backups(key, keep); };
      S.load();
      GK.save.onHide(S.save);
      GK.save.persist();
      return S;
    }
  };

  /* ================= AUDIO ================= */
  var A = GK.audio = { ctx: null, master: null, bank: {}, volume: 1, muted: false, unlocked: false, _last: {}, _voices: {} };
  var GESTURES = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
  function silentWavURL() {
    try {
      var n = 800, buf = new ArrayBuffer(44 + n), v = new DataView(buf);
      var w = function (o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
      w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true);
      v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 8000, true);
      v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
      for (var i = 0; i < n; i++) v.setUint8(44 + i, 128);
      return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
    } catch (e) { return null; }
  }
  var silentEl = null, silentDone = false;
  function playSilentEl() { // routes Web Audio to the media channel so the ringer switch does not mute it
    if (silentDone || !HAS_DOM || !W.Audio) return;
    try {
      if (!silentEl) { var u = silentWavURL(); if (!u) { silentDone = true; return; } silentEl = new W.Audio(u); silentEl.setAttribute('playsinline', ''); silentEl.loop = false; silentEl.volume = 0.01; }
      var p = silentEl.play(); silentDone = true;
      if (p && p.catch) p.catch(function () { silentDone = false; });
    } catch (e) {}
  }
  function poke() { // tiny silent buffer, needed by older iOS to open the output
    var c = A.ctx; if (!c || !c.createBuffer) return;
    try { var b = c.createBuffer(1, 1, c.sampleRate || 44100), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); } catch (e) {}
  }
  function gesture() {
    if (!A.ctx) { if (A.autoCreate === false) return; A.ensure(); }
    var c = A.ctx; if (!c) return;
    playSilentEl();
    if (c.state !== 'running' && !A.held) { try { var p = c.resume(); if (p && p.then) p.then(check, function () {}); } catch (e) {} poke(); }
    check();
  }
  function check() {
    var c = A.ctx;
    if (c && c.state === 'running') {
      if (!A.unlocked) { A.unlocked = true; ringerHint(); if (A._onUnlock) A._onUnlock(); }
      if (silentDone) { // stay listening until both are done; re-arm happens on interruption
        for (var i = 0; i < GESTURES.length; i++) off(W, GESTURES[i], gesture, true);
        A._armed = false;
      }
    }
  }
  function arm() { if (A._armed || !HAS_DOM) return; A._armed = true; for (var i = 0; i < GESTURES.length; i++) on(W, GESTURES[i], gesture, true); }
  function watch() {
    var c = A.ctx; if (!c || c._gkWatched) return; c._gkWatched = true;
    // the game's own suspend() (pause, mute, hidden tab) is a hold: taps and focus must not resume it; its own resume() lifts it
    A.held = false;
    if (typeof c.suspend === 'function' && typeof c.resume === 'function') {
      var s0 = c.suspend, r0 = c.resume;
      try {
        c.suspend = function () { if (A.ctx === c) A.held = true; return s0.apply(c, arguments); };
        c.resume = function () { if (A.ctx === c) A.held = false; return r0.apply(c, arguments); };
      } catch (e) {}
    }
    var prev = c.onstatechange;
    var h = function (e) { if (A.ctx.state !== 'running') { A.unlocked = false; arm(); } else check(); if (A._onState) A._onState(A.ctx.state); };
    if (c.addEventListener) c.addEventListener('statechange', h); else c.onstatechange = function (e) { if (prev) prev.call(c, e); h(e); };
  }
  if (HAS_DOM) {
    var wake = function () { if (A.ctx && A.ctx.state !== 'running' && !A.held && document.visibilityState !== 'hidden') { try { A.ctx.resume().catch(function () {}); } catch (e) {} arm(); } };
    on(document, 'visibilitychange', wake); on(W, 'focus', wake); on(W, 'pageshow', wake);
  }
  A.init = function (opts) {
    opts = opts || {};
    A._onUnlock = opts.onUnlock; A._onState = opts.onState;
    if (opts.create === false) A.autoCreate = false; // the game makes its own context later and hands it over with adopt()
    if (opts.ctx) A.adopt(opts.ctx, opts.output);
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    arm();
    return A;
  };
  A.ensure = function () {
    if (A.ctx) return A.ctx;
    var C = W.AudioContext || W.webkitAudioContext; if (!C) return null;
    try { A.adopt(new C({ latencyHint: 'interactive' })); } catch (e) { try { A.adopt(new C()); } catch (e2) { return null; } }
    return A.ctx;
  };
  // Adopt a game's own AudioContext; output = the node kit sounds should feed (default: a new master gain)
  A.adopt = function (ctx, output) {
    A.ctx = ctx; A._external = !!output;
    if (output) A.master = output;
    else { A.master = ctx.createGain(); A.master.connect(ctx.destination); }
    A._applyVol(); watch(); arm();
    for (var k in A.bank) A.bank[k].buf = null; // re-render for this context
    return ctx;
  };
  A._applyVol = function () { if (A.master && A.master.gain && !A._external) A.master.gain.value = A.muted ? 0 : A.volume; };
  A.setVolume = function (v) { A.volume = clamp(v, 0, 1); A._applyVol(); };
  A.setMuted = function (m) { A.muted = !!m; A._applyVol(); };
  // call inside a tap handler right after adopt() so the very first tap also unlocks
  A.unlockNow = function () { gesture(); };
  A.running = function () { return !!(A.ctx && A.ctx.state === 'running'); };
  // Synth spec: {wave:'sine'|'square'|'tri'|'saw'|'noise', f:Hz, f2:end Hz, dur:s, a:attack s, vol:0..1, at:start s} or an array of them
  function osc(wave, ph) {
    if (wave === 'square') return ph % 1 < 0.5 ? 1 : -1;
    if (wave === 'saw') return 2 * (ph % 1) - 1;
    if (wave === 'tri') { var x = ph % 1; return x < 0.5 ? 4 * x - 1 : 3 - 4 * x; }
    return Math.sin(ph * 6.283185307);
  }
  A.render = function (spec, rate) {
    rate = rate || 44100;
    var layers = Array.isArray(spec) ? spec : [spec], end = 0, i;
    for (i = 0; i < layers.length; i++) end = Math.max(end, (layers[i].at || 0) + (layers[i].dur || 0.1));
    var n = Math.ceil(end * rate) + 1, out = new Float32Array(n), nz = mulberry32(7);
    for (i = 0; i < layers.length; i++) {
      var L = layers[i], dur = L.dur || 0.1, s0 = Math.floor((L.at || 0) * rate), len = Math.floor(dur * rate);
      var a = Math.max(1, Math.floor((L.a === undefined ? 0.004 : L.a) * rate)), ph = 0, f = L.f || 440, f2 = L.f2 || f, vol = L.vol === undefined ? 0.5 : L.vol;
      for (var j = 0; j < len && s0 + j < n; j++) {
        var t = j / len, freq = f * Math.pow(f2 / f, t);
        ph += freq / rate;
        var env = (j < a ? j / a : 1) * Math.pow(1 - t, L.curve || 2);
        out[s0 + j] += (L.wave === 'noise' ? nz() * 2 - 1 : osc(L.wave, ph)) * env * vol;
      }
    }
    for (i = 0; i < n; i++) out[i] = clamp(out[i], -1, 1);
    return out;
  };
  A.define = function (name, spec) { A.bank[name] = { spec: spec, buf: null }; return A; };
  A.std = function () {
    A.define('tap', { wave: 'tri', f: 660, f2: 520, dur: 0.06, vol: 0.35 });
    A.define('success', [{ wave: 'tri', f: 523, dur: 0.09, vol: 0.35 }, { wave: 'tri', f: 784, dur: 0.14, vol: 0.35, at: 0.07 }]);
    A.define('fail', [{ wave: 'square', f: 220, f2: 110, dur: 0.22, vol: 0.18 }, { wave: 'noise', dur: 0.08, vol: 0.12 }]);
    A.define('combo', { wave: 'sine', f: 880, f2: 1320, dur: 0.1, vol: 0.3 });
    A.define('win', [{ wave: 'tri', f: 523, dur: 0.12, vol: 0.3 }, { wave: 'tri', f: 659, dur: 0.12, vol: 0.3, at: 0.1 }, { wave: 'tri', f: 784, dur: 0.12, vol: 0.3, at: 0.2 }, { wave: 'sine', f: 1047, dur: 0.35, vol: 0.3, at: 0.3 }]);
    A.define('hit', [{ wave: 'noise', dur: 0.09, vol: 0.3 }, { wave: 'sine', f: 140, f2: 60, dur: 0.14, vol: 0.4 }]);
    return A;
  };
  // play(name,{vol,rate,jitter=0.05}): +/-5% pitch so repeats do not sound robotic; caps 4 voices and 25 ms repeats per sound
  A.play = function (name, o) {
    o = o || {};
    var c = A.ctx, e = A.bank[name];
    if (!c || !e || A.muted || c.state !== 'running') return false;
    var t = now(); if (A._last[name] && t - A._last[name] < (o.gap === undefined ? 25 : o.gap)) return false;
    if ((A._voices[name] | 0) >= (o.voices || 4)) return false;
    try {
      if (!e.buf) { var data = A.render(e.spec, c.sampleRate || 44100); e.buf = c.createBuffer(1, data.length, c.sampleRate || 44100); e.buf.getChannelData(0).set(data); }
      var src = c.createBufferSource(), g = c.createGain();
      src.buffer = e.buf;
      var j = o.jitter === undefined ? 0.05 : o.jitter;
      src.playbackRate.value = (o.rate || 1) * (1 + (Math.random() * 2 - 1) * j);
      g.gain.value = o.vol === undefined ? 1 : o.vol;
      src.connect(g); g.connect(A.master || c.destination);
      A._voices[name] = (A._voices[name] | 0) + 1; A._last[name] = t;
      src.onended = function () { A._voices[name] = Math.max(0, (A._voices[name] | 0) - 1); };
      src.start(0);
      ringerHint();
      return true;
    } catch (err) { return false; }
  };
  // one-time hint on iPhone, the first time sound unlocks
  var hinted = false;
  function ringerHint() {
    if (hinted || !ENV.ios || A.noHint) return; hinted = true;
    if (LS.get('gk.ringerHint')) return; LS.set('gk.ringerHint', '1');
    if (GK.ui && HAS_DOM) setTimeout(function () { GK.ui.toast('No sound? Check the ringer switch', 3200); }, 400);
  }

  /* ================= INPUT ================= */
  GK.input = {
    // attach(el,{onDown,onMove,onUp,stick:{dead:.1,radius:56,follow:true}}) : one pointer layer for touch, pen and mouse
    attach: function (el, o) {
      o = o || {};
      var H = { queue: [], down: {}, count: 0, stick: null, el: el };
      if (el.style) { el.style.touchAction = 'none'; el.style.webkitUserSelect = 'none'; el.style.userSelect = 'none'; el.style.webkitTouchCallout = 'none'; el.style.webkitTapHighlightColor = 'transparent'; }
      var st = o.stick ? (H.stick = { x: 0, y: 0, active: false, id: null, ox: 0, oy: 0, px: 0, py: 0, dead: o.stick.dead || 0.1, r: o.stick.radius || 56, follow: o.stick.follow !== false }) : null;
      function pos(e) { var r = el.getBoundingClientRect ? el.getBoundingClientRect() : { left: 0, top: 0 }; return { x: e.clientX - r.left, y: e.clientY - r.top }; }
      function upd(p) {
        var dx = p.x - st.ox, dy = p.y - st.oy, d = Math.sqrt(dx * dx + dy * dy);
        if (st.follow && d > st.r) { st.ox = p.x - dx / d * st.r; st.oy = p.y - dy / d * st.r; dx = p.x - st.ox; dy = p.y - st.oy; d = st.r; }
        var m = Math.min(1, d / st.r); if (m < st.dead) { st.x = st.y = 0; } else { var k = (m - st.dead) / (1 - st.dead) / (d || 1) * st.r; st.x = dx / st.r * k; st.y = dy / st.r * k; }
        st.px = p.x; st.py = p.y;
      }
      H._down = function (e) {
        if (e.cancelable) e.preventDefault();
        try { el.setPointerCapture && el.setPointerCapture(e.pointerId); } catch (x) {}
        var p = pos(e); H.down[e.pointerId] = p; H.count++;
        var ev = { type: 'down', x: p.x, y: p.y, id: e.pointerId, t: now(), kind: e.pointerType };
        H.queue.push(ev);
        if (st && st.id === null) { st.id = e.pointerId; st.active = true; st.ox = p.x; st.oy = p.y; st.x = st.y = 0; st.px = p.x; st.py = p.y; }
        if (o.onDown) o.onDown(ev, e);
      };
      H._move = function (e) {
        if (!(e.pointerId in H.down)) return;
        var p = pos(e); H.down[e.pointerId] = p;
        if (st && st.id === e.pointerId) upd(p);
        if (o.onMove) o.onMove({ type: 'move', x: p.x, y: p.y, id: e.pointerId, t: now() }, e);
      };
      H._up = function (e) {
        if (!(e.pointerId in H.down)) return;
        var p = pos(e); delete H.down[e.pointerId]; H.count = Math.max(0, H.count - 1);
        var ev = { type: 'up', x: p.x, y: p.y, id: e.pointerId, t: now() };
        H.queue.push(ev);
        if (st && st.id === e.pointerId) { st.id = null; st.active = false; st.x = st.y = 0; }
        if (o.onUp) o.onUp(ev, e);
      };
      var stop = function (e) { if (e.cancelable) e.preventDefault(); };
      on(el, 'pointerdown', H._down, { passive: false });
      on(el, 'pointermove', H._move, { passive: false });
      on(el, 'pointerup', H._up); on(el, 'pointercancel', H._up); on(el, 'lostpointercapture', H._up);
      on(el, 'contextmenu', stop); on(el, 'selectstart', stop); on(el, 'gesturestart', stop); on(el, 'dblclick', stop);
      on(el, 'touchmove', stop, { passive: false });
      H.drain = function () { var q = H.queue; H.queue = []; return q; };
      H.held = function () { return H.count > 0; };
      H.detach = function () {
        off(el, 'pointerdown', H._down, { passive: false }); off(el, 'pointermove', H._move, { passive: false }); off(el, 'pointerup', H._up);
        off(el, 'pointercancel', H._up); off(el, 'lostpointercapture', H._up); off(el, 'contextmenu', stop); off(el, 'selectstart', stop);
        off(el, 'gesturestart', stop); off(el, 'dblclick', stop); off(el, 'touchmove', stop, { passive: false });
      };
      return H;
    },
    // buffer: a press counts if it happened within `win` seconds before the moment it can be used
    buffer: function (win) {
      win = win === undefined ? 0.1 : win; var t = -1e9;
      return { press: function (at) { t = at; }, ready: function (at) { return at - t <= win; }, consume: function (at) { if (at - t <= win) { t = -1e9; return true; } return false; }, clear: function () { t = -1e9; } };
    },
    // coyote: grace after leaving a ledge
    coyote: function (win) {
      win = win === undefined ? 0.1 : win; var t = -1e9, used = false;
      return { ground: function (at) { t = at; used = false; }, can: function (at) { return !used && at - t <= win; }, use: function () { used = true; } };
    },
    keys: function (target) {
      var K = { held: {}, pressed: [] };
      on(target || W, 'keydown', function (e) { if (!K.held[e.key]) K.pressed.push(e.key); K.held[e.key] = true; });
      on(target || W, 'keyup', function (e) { K.held[e.key] = false; });
      on(W, 'blur', function () { K.held = {}; });
      K.drain = function () { var p = K.pressed; K.pressed = []; return p; };
      return K;
    }
  };

  /* ================= EASING ================= */
  GK.ease = {
    linear: function (t) { return t; },
    quadOut: function (t) { return 1 - (1 - t) * (1 - t); },
    cubicOut: function (t) { var u = 1 - t; return 1 - u * u * u; },
    backOut: function (t, s) { s = s === undefined ? 1.70158 : s; var u = t - 1; return u * u * ((s + 1) * u + s) + 1; },
    smooth: function (cur, target, k, dt) { return cur + (target - cur) * (1 - Math.exp(-k * dt)); }, // frame-rate independent
    lerp: function (a, b, t) { return a + (b - a) * t; }
  };

  /* ================= JUICE ================= */
  function ihash(i) { i = Math.imul((i ^ 61) ^ (i >>> 16), 9); i ^= i >>> 4; i = Math.imul(i, 0x27d4eb2d); i ^= i >>> 15; return (i >>> 0) / 4294967296 * 2 - 1; }
  function noise1(x, lane) { var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return ihash(i + lane * 7919) * (1 - u) + ihash(i + 1 + lane * 7919) * u; }
  GK.noise1 = noise1;
  var hapticLabel = null;
  GK.juice = {
    create: function (o) {
      o = o || {};
      var red = o.reducedMotion === undefined ? ENV.reducedMotion : o.reducedMotion;
      var J = {
        on: { shake: true, hitstop: true, squash: true, haptics: true, particles: true, flash: !red, numbers: true },
        shakeScale: red ? 0.35 : 1, maxShake: o.maxShake || 10, maxRot: o.maxRot || 0.03, decay: o.decay || 0.8, freq: o.freq || 15,
        trauma: 0, kx: 0, ky: 0, t: 0, stopT: 0, recT: 0, recDur: 0.06, x: 0, y: 0, rot: 0, fps: 0, _fpsAcc: 0, _fpsN: 0
      };
      J.addTrauma = function (a) { J.trauma = clamp(J.trauma + a, 0, 1); };
      J.kick = function (dx, dy) { if (!J.on.shake) return; J.kx += dx * J.shakeScale; J.ky += dy * J.shakeScale; };
      J.hitstop = function (sec) { if (!J.on.hitstop) return; J.stopT = Math.max(J.stopT, sec); J.recT = J.recDur; };
      // call once per frame with real dt; returns {x,y,rot} camera offset; J.scale(dt) gives the game dt after hitstop
      J.update = function (dt) {
        J.t += dt;
        J.trauma = Math.max(0, J.trauma - J.decay * dt);
        var s = J.on.shake ? J.trauma * J.trauma * J.shakeScale : 0;
        J.x = J.maxShake * s * noise1(J.t * J.freq, 1) + J.kx;
        J.y = J.maxShake * s * noise1(J.t * J.freq, 2) + J.ky;
        J.rot = J.maxRot * s * noise1(J.t * J.freq, 3);
        var k = Math.exp(-18 * dt); J.kx *= k; J.ky *= k;
        if (Math.abs(J.kx) < 0.05) J.kx = 0; if (Math.abs(J.ky) < 0.05) J.ky = 0;
        J._fpsAcc += dt; J._fpsN++; if (J._fpsAcc >= 0.5) { J.fps = Math.round(J._fpsN / J._fpsAcc); J._fpsAcc = 0; J._fpsN = 0; }
        return J;
      };
      J.scale = function (dt) {
        if (J.stopT > 0) { J.stopT -= dt; return 0; }
        if (J.recT > 0) { J.recT = Math.max(0, J.recT - dt); return dt * (0.2 + 0.8 * GK.ease.quadOut(1 - J.recT / J.recDur)); }
        return dt;
      };
      J.frozen = function () { return J.stopT > 0; };
      // squash: s = J.squash() then J.squashTo(s,'jump'|'land'|'hit') and J.squashStep(s,dt); draw with scale(s.sx,s.sy)
      J.squash = function () { return { sx: 1, sy: 1 }; };
      J.squashTo = function (s, kind) {
        if (!J.on.squash) return s;
        var m = kind === 'jump' ? [0.6, 1.4] : kind === 'land' ? [1.4, 0.6] : kind === 'hit' ? [1.25, 0.8] : (kind || [1.2, 0.8]);
        var f = red ? 0.5 : 1; s.sx = 1 + (m[0] - 1) * f; s.sy = 1 + (m[1] - 1) * f; return s;
      };
      J.squashStep = function (s, dt, rate) { var r = (rate || 1.75) * dt * 2; s.sx += clamp(1 - s.sx, -r, r); s.sy += clamp(1 - s.sy, -r, r); return s; };
      J.haptic = function (kind) { if (J.on.haptics) GK.juice.haptic(kind); };
      J.apply = function (ctx) { if (ctx && (J.x || J.y || J.rot)) { ctx.translate(J.x, J.y); if (J.rot) ctx.rotate(J.rot); } };
      return J;
    },
    // Android: vibrate. iPhone (Safari 17.4+): a hidden switch toggle gives a light tick, only inside a real tap
    // (call from click or pointerup on touch, not touch pointerdown). Elsewhere: nothing.
    haptic: function (kind) {
      if (!HAS_DOM) return false;
      var pat = { tap: 8, light: 8, hit: 18, heavy: 30, success: [10, 40, 14], fail: [30, 50, 30] }[kind] || 10;
      try { if (navigator.vibrate) return navigator.vibrate(pat); } catch (e) {}
      if (!ENV.ios) return false;
      try {
        if (!hapticLabel) {
          var lab = document.createElement('label'), inp = document.createElement('input');
          inp.type = 'checkbox'; inp.setAttribute('switch', ''); inp.tabIndex = -1; lab.setAttribute('aria-hidden', 'true');
          lab.appendChild(inp); lab.style.cssText = 'position:fixed;left:-100px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden';
          document.body.appendChild(lab); hapticLabel = lab;
        }
        hapticLabel.click(); return true;
      } catch (e) { return false; }
    },
    // Hidden tuning panel: opens with ?juice or #juice in the address, or 5 quick taps in the top-left corner.
    // extra: [{label,get(),set(v)}] for game-specific toggles; po.keys limits which built-in toggles show.
    panel: function (J, extra, po) {
      if (!HAS_DOM) return null;
      po = po || {};
      var P = { el: null, open: false };
      function build() {
        GK.ui._css();
        var el = document.createElement('div'); el.className = 'gk-panel'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Juice settings');
        var html = '<div class="gk-ph"><b>Juice</b><span class="gk-fps">-- fps</span><button class="gk-x" aria-label="Close">x</button></div>';
        var keys = po.keys || Object.keys(J.on);
        keys.forEach(function (k) { html += '<label><input type="checkbox" data-k="' + k + '"' + (J.on[k] ? ' checked' : '') + '> ' + k + '</label>'; });
        (extra || []).forEach(function (x, i) { html += '<label><input type="checkbox" data-x="' + i + '"' + (x.get() ? ' checked' : '') + '> ' + x.label + '</label>'; });
        html += '<label>shake size <input type="range" min="0" max="2" step="0.1" value="' + J.shakeScale + '" data-r="1"></label>';
        el.innerHTML = html;
        el.addEventListener('change', function (e) {
          var t = e.target;
          if (t.dataset.k) J.on[t.dataset.k] = t.checked;
          if (t.dataset.x !== undefined) extra[+t.dataset.x].set(t.checked);
          if (t.dataset.r) J.shakeScale = +t.value;
        });
        el.querySelector('.gk-x').addEventListener('click', function () { P.hide(); });
        ['pointerdown', 'touchstart', 'click'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.stopPropagation(); }); });
        document.body.appendChild(el); P.el = el;
        var fpsEl = el.querySelector('.gk-fps');
        P._timer = setInterval(function () { if (P.open) fpsEl.textContent = J.fps + ' fps'; }, 500);
      }
      P.show = function () { if (!P.el) build(); P.el.style.display = 'block'; P.open = true; };
      P.hide = function () { if (P.el) P.el.style.display = 'none'; P.open = false; };
      P.toggle = function () { if (P.open) P.hide(); else P.show(); };
      var loc = '';
      try { loc = (W.location.search || '') + (W.location.hash || ''); } catch (e) {}
      if (/[?#&]juice\b/.test(loc)) setTimeout(P.show, 0);
      var taps = [];
      on(W, 'pointerdown', function (e) {
        if (e.clientX > 48 || e.clientY > 48 + ((GK.view.insets && GK.view.insets.t) || 0)) { taps.length = 0; return; }
        var t = now(); taps.push(t); while (taps.length && t - taps[0] > 2000) taps.shift();
        if (taps.length >= 5) { taps.length = 0; P.toggle(); }
      }, true);
      return P;
    }
  };

  /* ================= BADGES ================= */
  // defs: [{id,name,desc,test?(stats),hidden?,funny?}]; st: a plain object in the game's save (badges stored at st[id]=time)
  GK.badges = {
    create: function (defs, st, opts) {
      opts = opts || {};
      var B = { defs: defs, st: st, failed: {}, listeners: [] };
      B.has = function (id) { return !!st[id]; };
      B.earn = function (id) {
        if (st[id]) return false; var d = B.get(id); if (!d) return false;
        st[id] = Date.now(); delete B.failed[id];
        for (var i = 0; i < B.listeners.length; i++) B.listeners[i](d);
        if (opts.toast !== false && GK.ui && HAS_DOM) GK.ui.toast('Badge: ' + d.name, 2400);
        return true;
      };
      B.fail = function (id) { if (!st[id]) B.failed[id] = true; };
      B.startRun = function () { B.failed = {}; };
      B.get = function (id) { for (var i = 0; i < defs.length; i++) if (defs[i].id === id) return defs[i]; return null; };
      B.check = function (stats) { var got = []; defs.forEach(function (d) { if (d.test && !st[d.id] && d.test(stats)) { if (B.earn(d.id)) got.push(d); } }); return got; };
      B.onEarn = function (fn) { B.listeners.push(fn); };
      B.count = function () { var n = 0; defs.forEach(function (d) { if (st[d.id]) n++; }); return n; };
      B.list = function () {
        return defs.map(function (d) {
          var s = st[d.id] ? 'earned' : B.failed[d.id] ? 'failed' : 'open';
          return { id: d.id, name: (d.hidden && s !== 'earned') ? '???' : d.name, desc: (d.hidden && s !== 'earned') ? 'Hidden' : d.desc, state: s, funny: !!d.funny };
        });
      };
      B.render = function (el) {
        if (!HAS_DOM || !el) return; GK.ui._css();
        var h = '<div class="gk-badges">'; B.list().forEach(function (b) {
          h += '<div class="gk-b gk-' + b.state + '" title="' + esc(b.desc) + '"><div class="gk-bi">' + (b.state === 'earned' ? '★' : b.state === 'failed' ? '✕' : '·') + '</div><div class="gk-bn">' + esc(b.name) + '</div><div class="gk-bd">' + esc(b.desc) + '</div></div>';
        });
        el.innerHTML = h + '</div><div class="gk-bc">' + B.count() + ' of ' + defs.length + '</div>';
      };
      return B;
    },
    // two paths to each milestone: play it enough OR win enough. Both count, so less skilled players still progress.
    milestones: function (playsAt, winsAt, nameFn) {
      var out = [];
      (playsAt || []).forEach(function (n) { out.push({ id: 'plays' + n, name: nameFn ? nameFn('plays', n) : n + (n === 1 ? ' run' : ' runs'), desc: 'Play ' + n + (n === 1 ? ' run' : ' runs'), test: function (s) { return (s.plays | 0) >= n; } }); });
      (winsAt || []).forEach(function (n) { out.push({ id: 'wins' + n, name: nameFn ? nameFn('wins', n) : n + (n === 1 ? ' win' : ' wins'), desc: 'Win ' + n + (n === 1 ? ' time' : ' times'), test: function (s) { return (s.wins | 0) >= n; } }); });
      return out;
    }
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  GK.esc = esc;

  /* ================= SHARE ================= */
  GK.share = {
    // resolves 'shared' | 'copied' | 'sheet' | 'cancel'. Falls back share -> clipboard -> selectable text sheet.
    text: function (text, o) {
      o = o || {};
      return new Promise(function (res) {
        function copyLegacy() {
          try {
            var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0';
            document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
            var ok = document.execCommand && document.execCommand('copy'); ta.remove(); return !!ok;
          } catch (e) { return false; }
        }
        function sheet() { GK.ui.sheet(o.title || 'Copy your result', text); res('sheet'); }
        function clip() {
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(text).then(function () { if (GK.ui) GK.ui.toast('Copied', 1600); res('copied'); }, function () { if (copyLegacy()) { GK.ui.toast('Copied', 1600); res('copied'); } else sheet(); });
              return;
            }
          } catch (e) {}
          if (copyLegacy()) { GK.ui.toast('Copied', 1600); res('copied'); } else sheet();
        }
        var data = { text: text }; if (o.title) data.title = o.title;
        try {
          if (o.preferCopy !== true && navigator.share && (!navigator.canShare || navigator.canShare(data))) {
            navigator.share(data).then(function () { res('shared'); }, function (e) { if (e && e.name === 'AbortError') res('cancel'); else clip(); });
            return;
          }
        } catch (e) {}
        clip();
      });
    },
    button: function (el, getText, o) { on(el, 'click', function (e) { e.stopPropagation(); GK.share.text(typeof getText === 'function' ? getText() : getText, o); }); return el; }
  };

  /* ================= VIEW ================= */
  var V = GK.view = { insets: { t: 0, r: 0, b: 0, l: 0 }, w: 0, h: 0, dprCap: 2, _fns: [] };
  V.init = function (o) {
    o = o || {}; if (o.dprCap) V.dprCap = o.dprCap;
    if (!HAS_DOM) return V;
    var m = document.querySelector('meta[name=viewport]');
    if (!m) { m = document.createElement('meta'); m.name = 'viewport'; document.head.appendChild(m); }
    var c = m.getAttribute('content') || 'width=device-width,initial-scale=1';
    if (!/viewport-fit/.test(c)) m.setAttribute('content', c + ',viewport-fit=cover');
    if (!V._probe) {
      var p = document.createElement('div'); p.setAttribute('aria-hidden', 'true');
      p.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
      document.body.appendChild(p); V._probe = p;
      var fire = function () { V.measure(); for (var i = 0; i < V._fns.length; i++) V._fns[i](V); };
      on(W, 'resize', fire); on(W, 'orientationchange', function () { setTimeout(fire, 120); });
      if (W.visualViewport) on(W.visualViewport, 'resize', fire);
    }
    V.measure();
    return V;
  };
  V.measure = function () {
    if (!HAS_DOM) return V;
    if (V._probe && W.getComputedStyle) { var cs = W.getComputedStyle(V._probe); V.insets = { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 }; }
    var vv = W.visualViewport; V.w = vv ? vv.width : W.innerWidth; V.h = vv ? vv.height : W.innerHeight;
    return V;
  };
  V.onResize = function (fn) { V._fns.push(fn); };
  V.dpr = function () { return Math.min(V.dprCap, (HAS_DOM && W.devicePixelRatio) || 1); };
  // fit a design-size box (dw x dh) into aw x ah. mode 'fit' letterboxes, 'fill' crops, 'fitfill' fits then grows the short side.
  V.fit = function (dw, dh, aw, ah, mode) {
    var sFit = Math.min(aw / dw, ah / dh), sFill = Math.max(aw / dw, ah / dh), s = mode === 'fill' ? sFill : sFit, w = dw, h = dh;
    if (mode === 'fitfill') { w = aw / s; h = ah / s; }
    return { scale: s, w: w, h: h, x: (aw - w * s) / 2, y: (ah - h * s) / 2 };
  };
  // size a canvas for crisp drawing; returns ctx already scaled to CSS pixels
  V.canvas = function (cv, cssW, cssH) {
    var d = V.dpr(); cv.width = Math.round(cssW * d); cv.height = Math.round(cssH * d);
    cv.style.width = cssW + 'px'; cv.style.height = cssH + 'px';
    var ctx = cv.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0); return ctx;
  };

  /* ================= UI ================= */
  GK.ui = {
    _css: function () {
      if (!HAS_DOM || document.getElementById('gk-css')) return;
      var s = document.createElement('style'); s.id = 'gk-css';
      s.textContent = '.gk-toast{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:rgba(20,20,28,.92);color:#fff;font:600 14px/1.3 -apple-system,system-ui,sans-serif;padding:10px 14px;border-radius:12px;z-index:99999;pointer-events:none;max-width:86vw;text-align:center;transition:opacity .25s}' +
        '.gk-sheet{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99998;display:flex;align-items:flex-end;justify-content:center}' +
        '.gk-sheet>div{background:#1b1b24;color:#fff;width:min(520px,100%);padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));border-radius:16px 16px 0 0;font:15px -apple-system,system-ui,sans-serif}' +
        '.gk-sheet textarea{width:100%;box-sizing:border-box;min-height:110px;font:14px ui-monospace,monospace;background:#0e0e14;color:#fff;border:1px solid #444;border-radius:8px;padding:8px;-webkit-user-select:text;user-select:text}' +
        '.gk-sheet button,.gk-panel button{font:600 15px -apple-system,system-ui,sans-serif;border:0;border-radius:10px;padding:10px 14px;margin-top:10px;background:#3d6cf0;color:#fff;min-height:44px}' +
        '.gk-panel{position:fixed;top:calc(8px + env(safe-area-inset-top,0px));right:8px;z-index:99997;background:rgba(18,18,26,.94);color:#fff;font:14px -apple-system,system-ui,sans-serif;padding:10px 12px;border-radius:12px;min-width:180px;display:none}' +
        '.gk-panel label{display:flex;align-items:center;gap:8px;min-height:32px}.gk-ph{display:flex;align-items:center;gap:10px;margin-bottom:4px}.gk-fps{opacity:.7;margin-left:auto}.gk-panel .gk-x{margin:0;padding:4px 10px;min-height:32px;background:#444}' +
        '.gk-badges{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:8px}.gk-b{border-radius:10px;padding:8px 6px;text-align:center;background:rgba(127,127,127,.12);font:12px/1.25 -apple-system,system-ui,sans-serif}' +
        '.gk-bi{font-size:20px}.gk-bn{font-weight:700;margin:2px 0}.gk-bd{opacity:.7;font-size:11px}.gk-earned{background:rgba(255,196,64,.22)}.gk-failed{opacity:.55}.gk-open{opacity:.8}.gk-bc{text-align:center;margin-top:8px;opacity:.7;font:12px -apple-system,system-ui,sans-serif}';
      document.head.appendChild(s);
    },
    toast: function (text, ms) {
      if (!HAS_DOM) return; GK.ui._css();
      var t = document.createElement('div'); t.className = 'gk-toast'; t.setAttribute('role', 'status'); t.textContent = text;
      document.body.appendChild(t);
      setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 300); }, ms || 2000);
    },
    // a bottom sheet with selectable text (the last share fallback, and the save export box)
    sheet: function (title, text, o) {
      if (!HAS_DOM) return null; GK.ui._css(); o = o || {};
      var s = document.createElement('div'); s.className = 'gk-sheet';
      s.innerHTML = '<div role="dialog" aria-label="' + esc(title) + '"><b>' + esc(title) + '</b>' + (o.note ? '<p style="opacity:.75;margin:6px 0">' + esc(o.note) + '</p>' : '') + '<textarea' + (o.editable ? '' : ' readonly') + '></textarea><div style="display:flex;gap:8px;flex-wrap:wrap">' + (o.okLabel ? '<button class="gk-ok">' + esc(o.okLabel) + '</button>' : '') + '<button class="gk-close">Close</button></div></div>';
      var ta = s.querySelector('textarea'); ta.value = text || '';
      ['pointerdown', 'touchstart', 'click'].forEach(function (ev) { s.addEventListener(ev, function (e) { e.stopPropagation(); }); });
      s.querySelector('.gk-close').addEventListener('click', function () { s.remove(); });
      if (o.okLabel) s.querySelector('.gk-ok').addEventListener('click', function () { if (!o.onOk || o.onOk(ta.value) !== false) s.remove(); });
      document.body.appendChild(s);
      if (!o.editable) setTimeout(function () { try { ta.focus(); ta.select(); } catch (e) {} }, 50);
      return s;
    },
    // export/import UI for a save handle from GK.save.protect or GK.save.store
    saveTools: function (handle, o) {
      o = o || {};
      return {
        exportSave: function () { GK.ui.sheet('Your save code', handle.exportCode(), { note: 'Copy this somewhere safe. Paste it back with Import to restore.' }); },
        importSave: function () {
          GK.ui.sheet('Import a save code', '', { editable: true, okLabel: 'Import', note: 'This replaces your current progress. Your old save is kept as a backup.', onOk: function (v) {
            if (handle.importCode(v)) { GK.ui.toast('Save imported', 1800); if (o.onImported) o.onImported(); return true; }
            GK.ui.toast('That code did not work', 2000); return false;
          } });
        }
      };
    }
  };

  /* ================= LOOP ================= */
  // fixed-step loop: update(dt) at `step`, render(alpha) every frame; pauses while the page is hidden; uses juice hitstop if given
  GK.loop = function (update, render, o) {
    o = o || {};
    var step = o.step || 1 / 60, acc = 0, last = 0, running = false, raf = 0, J = o.juice;
    var L = { paused: false };
    function frame(t) {
      if (!running) return;
      raf = W.requestAnimationFrame(frame);
      var dt = last ? Math.min(0.1, (t - last) / 1000) : step; last = t;
      if (J) J.update(dt);
      if (!L.paused) { acc += J ? J.scale(dt) : dt; var n = 0; while (acc >= step && n++ < 5) { update(step); acc -= step; } if (n >= 5) acc = 0; }
      if (render) render(acc / step, dt);
    }
    L.start = function () { if (running) return L; running = true; last = 0; raf = W.requestAnimationFrame(frame); return L; };
    L.stop = function () { running = false; if (W.cancelAnimationFrame) W.cancelAnimationFrame(raf); return L; };
    if (HAS_DOM) on(document, 'visibilitychange', function () { if (document.visibilityState === 'hidden') { L.paused = true; if (o.onHide) o.onHide(); } else { last = 0; L.paused = false; } });
    return L;
  };


  /* ================= RETROFIT (drop-in for a finished game) ================= */
  // GK.retrofit({ game, saves: ['key', ...], validate }) goes in its own script tag right after the kit
  // and before the game's script. It changes no save format and no game code:
  //  - each listed localStorage key gets 3 rolling backups and is restored from the newest good one
  //    when it is missing or broken;
  //  - the first AudioContext the game makes is handed to GK.audio, so it is unlocked on every tap,
  //    plays with the ringer switch on silent, and comes back after a call or a locked screen.
  GK.retrofit = function (o) {
    o = o || {};
    var R = { game: o.game || '', saves: {}, made: 0 };
    var keys = o.saves || [];
    for (var i = 0; i < keys.length; i++) { try { R.saves[keys[i]] = GK.save.protect(keys[i], { validate: o.validate, keep: o.keep }); } catch (e) {} }
    if (o.audio !== false && HAS_DOM) {
      A.init({ create: false });
      var wrap = function (name) {
        var C = W[name]; if (!C || C._gkWrapped) return;
        var G = function (opts) {
          var c = arguments.length ? new C(opts) : new C();
          R.made++;
          if (!A.ctx || A.ctx.state === 'closed') { A.adopt(c, c.destination); gesture(); }
          return c;
        };
        G.prototype = C.prototype; G._gkWrapped = true; G._gkOriginal = C;
        try { Object.setPrototypeOf(G, C); } catch (e) {}
        try { W[name] = G; } catch (e) {}
      };
      wrap('AudioContext'); wrap('webkitAudioContext');
    }
    GK.retrofitted = R;
    return R;
  };

  root.GK = GK;
  if (typeof module !== 'undefined' && module.exports) module.exports = GK;
})(typeof window !== 'undefined' ? window : globalThis);
