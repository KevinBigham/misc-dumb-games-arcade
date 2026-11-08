// Full-page smoke test for Prismwheel at a 390x844 phone viewport.
// Runs the built HTML's scripts against a stub DOM with a canvas that records to SVG,
// drives it with the page's own listeners, and writes PNG screenshots via ImageMagick.
const fs = require('fs'), vm = require('vm'), cp = require('child_process');
const HTML = fs.readFileSync(process.argv[2] || '/mnt/project-files/games/overnight/prismwheel/prismwheel.html', 'utf8');
const OUT = process.env.OUT || '/tmp/claude-0/-home-user/73dd78ec-aeed-5eb2-9450-0e1dd0a256a8/scratchpad/shots';
fs.mkdirSync(OUT, { recursive: true });
const BOT = require('./bot.js');
const scripts = []; { const re = /<script id="(\w+)">([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(HTML))) scripts.push([m[1], m[2]]); }

// ---- SVG recording 2D context ----
function makeCtx(VW, VH) {
  let M = [1, 0, 0, 1, 0, 0]; const stack = []; let path = []; let cur = '';
  const st = { fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, globalAlpha: 1, font: '10px sans-serif', textAlign: 'start', textBaseline: 'alphabetic', dash: [], lineCap: 'butt' };
  let out = [];
  const tp = (x, y) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]];
  const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  const col = c => (c && typeof c === 'object') ? c._c : String(c);
  const f = n => (Math.round(n * 10) / 10);
  const ctx = {
    get canvas() { return {}; },
    save() { stack.push([M.slice(), Object.assign({}, st, { dash: st.dash.slice() })]); },
    restore() { const s = stack.pop(); if (s) { M = s[0]; Object.assign(st, s[1]); } },
    setTransform(a, b, c, d, e, g) { M = [a, b, c, d, e, g]; }, resetTransform() { M = [1, 0, 0, 1, 0, 0]; },
    translate(x, y) { M = mul(M, [1, 0, 0, 1, x, y]); }, scale(x, y) { M = mul(M, [x, 0, 0, y, 0, 0]); },
    rotate(a) { const c = Math.cos(a), s = Math.sin(a); M = mul(M, [c, s, -s, c, 0, 0]); },
    beginPath() { path = []; cur = ''; },
    moveTo(x, y) { const [X, Y] = tp(x, y); path.push('M' + f(X) + ' ' + f(Y)); },
    lineTo(x, y) { const [X, Y] = tp(x, y); path.push((path.length ? 'L' : 'M') + f(X) + ' ' + f(Y)); },
    closePath() { path.push('Z'); },
    rect(x, y, w, h) { this.moveTo(x, y); this.lineTo(x + w, y); this.lineTo(x + w, y + h); this.lineTo(x, y + h); this.closePath(); },
    arc(cx, cy, r, a0, a1, ccw) { let span = a1 - a0; if (ccw) span = -(((a0 - a1) % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI) || -2 * Math.PI; const n = Math.max(8, Math.ceil(Math.abs(span) * 12)); for (let i = 0; i <= n; i++) { const a = a0 + span * i / n; const [X, Y] = tp(cx + Math.cos(a) * r, cy + Math.sin(a) * r); path.push((path.length ? 'L' : 'M') + f(X) + ' ' + f(Y)); } },
    fill() { out.push({ t: 'f', d: path.join(''), c: col(st.fillStyle), a: st.globalAlpha }); },
    stroke() { const sc = Math.hypot(M[0], M[1]); out.push({ t: 's', d: path.join(''), c: col(st.strokeStyle), a: st.globalAlpha, w: st.lineWidth * sc, dash: st.dash.length ? st.dash.map(d => d * sc) : null }); },
    fillRect(x, y, w, h) { const sv = path; this.beginPath(); this.rect(x, y, w, h); this.fill(); path = sv; },
    clearRect() {}, strokeRect() {},
    fillText(s, x, y) { this._text(s, x, y, `fill="${col(st.fillStyle)}"`); },
    strokeText(s, x, y) { this._text(s, x, y, `fill="none" stroke="${col(st.strokeStyle)}" stroke-width="${st.lineWidth}"`); },
    _text(s, x, y, paint) {
      const [X, Y] = tp(x, y), sc = Math.hypot(M[0], M[1]); const m = /(\d+)px/.exec(st.font); const size = (m ? +m[1] : 10) * sc; const wt = /^(\d00)/.exec(st.font);
      const anchor = st.textAlign === 'center' ? 'middle' : (st.textAlign === 'right' || st.textAlign === 'end') ? 'end' : 'start';
      const dy = st.textBaseline === 'middle' ? size * 0.35 : 0;
      out.push({ t: 'x', x: X, y: Y + dy, s: String(s), size, bold: !!(wt && +wt[1] >= 700), anchor, paint: paint.startsWith('fill="none') ? 's' : 'f', c: paint.startsWith('fill="none') ? col(st.strokeStyle) : col(st.fillStyle), w: st.lineWidth * sc, a: st.globalAlpha });
    },
    measureText: s => ({ width: String(s).length * 7 }),
    setLineDash(d) { st.dash = d.slice(); }, getLineDash() { return st.dash; },
    createLinearGradient() { const g = { _stops: [], _c: '#888', addColorStop(o, c) { this._stops.push(c); this._c = this._stops[Math.floor(this._stops.length / 2)]; } }; return g; },
    createRadialGradient() { const g = { _stops: [], _c: '#888', addColorStop(o, c) { this._stops.push([o, c]); const mid = this._stops.find(x => x[0] >= 0.3) || this._stops[0]; this._c = mid[1]; } }; return g; },
    _reset() { out = []; }, _ops() { return out; }, _count() { return out.length; },
  };
  for (const k of Object.keys(st)) if (k !== 'dash') Object.defineProperty(ctx, k, { get: () => st[k], set: v => { st[k] = v; } });
  return ctx;
}

function makeEnv(storage) {
  const errors = [], vibs = [];
  let nowMs = 1000; let rafQ = []; const timers = [];
  const param = () => ({ value: 0, setValueAtTime() {}, setTargetAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} });
  const node = () => ({ connect() {}, disconnect() {}, gain: param(), frequency: param(), Q: param(), type: '', start() {}, stop() {}, buffer: null });
  let acCount = 0;
  class AC { constructor() { acCount++; this.currentTime = 0; this.state = 'running'; this.sampleRate = 8000; this.destination = node(); } createGain() { return node(); } createDynamicsCompressor() { return node(); } createBiquadFilter() { return node(); } createOscillator() { return node(); } createBufferSource() { return node(); } createBuffer(c, n) { return { getChannelData: () => new Float32Array(n) }; } resume() { return Promise.resolve(); } }
  const ctx2d = makeCtx(390, 844);
  const byId = {};
  class El {
    constructor(tag, id) { this.tagName = (tag || 'div').toUpperCase(); this.id = id || ''; this._hidden = false; this.style = { setProperty: (k, v) => { this.style[k] = v; } }; this._h = {}; this.textContent = ''; this.width = 300; this.height = 150; const cls = new Set(); this.classList = { add: c => cls.add(c), remove: c => cls.delete(c), toggle: (c, on) => (on === undefined ? (cls.has(c) ? cls.delete(c) : cls.add(c)) : on ? cls.add(c) : cls.delete(c)), contains: c => cls.has(c) }; }
    get hidden() { return this._hidden; } set hidden(v) { this._hidden = !!v; }
    addEventListener(t, fn) { (this._h[t] = this._h[t] || []).push(fn); }
    removeEventListener() {}
    fire(t, e) { e = Object.assign({ preventDefault() {}, stopPropagation() {}, clientX: 0, clientY: 0 }, e || {}); for (const fn of this._h[t] || []) fn(e); }
    getContext() { return ctx2d; }
    // kit 2.1 stubs: elements the kit creates are inert
    setAttribute(k, v) { this['@' + k] = v; } getAttribute(k) { return this['@' + k]; } removeAttribute() {} appendChild(c) { return c; } remove() {} replaceWith() {} contains() { return false; }
    querySelector() { return null; } querySelectorAll() { return []; } getBoundingClientRect() { return { left: 0, top: 0, width: 0, height: 0 }; }
  }
  const document = { _h: {}, hidden: false, addEventListener(t, fn) { (this._h[t] = this._h[t] || []).push(fn); }, fire(t, e) { for (const fn of this._h[t] || []) fn(e || {}); }, getElementById: id => byId[id] || (byId[id] = new El('div', id)),
    createElement: t => new El(t), head: new El('head'), body: new El('body'), documentElement: new El('html'), querySelector: () => null, querySelectorAll: () => [] };
  // initial hidden state as in the HTML
  for (const id of ['pause', 'over', 'bresume']) document.getElementById(id).hidden = true;
  const win = {
    innerWidth: 390, innerHeight: 844, devicePixelRatio: 2.5, _h: {},
    addEventListener(t, fn) { (this._h[t] = this._h[t] || []).push(fn); }, fire(t, e) { e = Object.assign({ preventDefault() {}, repeat: false }, e || {}); for (const fn of this._h[t] || []) fn(e); },
    requestAnimationFrame(fn) { rafQ.push(fn); return rafQ.length; },
    matchMedia: () => ({ matches: false }), AudioContext: AC,
  };
  const localStorage = { getItem: k => (k in storage ? storage[k] : null), setItem: (k, v) => { storage[k] = String(v); }, removeItem: k => { delete storage[k]; } };
  const sandbox = {
    window: win, document, localStorage, navigator: { vibrate: p => { vibs.push(p); return true; } },
    performance: { now: () => nowMs }, requestAnimationFrame: win.requestAnimationFrame,
    setTimeout: (fn, ms) => { timers.push({ at: nowMs + (ms || 0), fn }); return timers.length; }, clearTimeout() {},
    setInterval: (fn, ms) => { const t = { every: ms, at: nowMs + ms, fn, iv: true }; timers.push(t); return t; }, clearInterval: t => { if (t) t.dead = true; },
    console: { log: (...a) => console.log('[page]', ...a), warn() {}, error: (...a) => errors.push(a.join(' ')) },
    Math, JSON, Date, Set, Map, Array, Object, String, Number, Promise, Float32Array, Infinity, isFinite, parseInt,
  };
  win.window = win; win.localStorage = localStorage; win.document = document;
  vm.createContext(sandbox);
  for (const [id, code] of scripts) { try { vm.runInContext(code, sandbox, { filename: id }); } catch (e) { errors.push(id + ': ' + e.stack); } }
  const domState = () => ({ title: !document.getElementById('title').hidden, pause: !document.getElementById('pause').hidden, over: !document.getElementById('over').hidden, flare: document.getElementById('bf').classList.contains('locked') ? null : (document.getElementById('bf').classList.contains('ready') ? 1 : parseFloat(document.getElementById('bf').style['--f']) / 100 || 0), toast: document.getElementById('toast').classList.contains('show') ? document.getElementById('toast').textContent : '', oscore: document.getElementById('oscore').textContent, otip: document.getElementById('otip').textContent });
  const env = {
    errors, vibs, byId: new Proxy({}, { get: (t, k) => document.getElementById(k) }), win, document, ctx2d, sandbox, storage, acCount: () => acCount,
    frames(n, ms = 16.67) {
      for (let i = 0; i < n; i++) {
        nowMs += ms;
        for (const t of timers.slice()) { if (t.dead || t.at > nowMs) continue; try { t.fn(); } catch (e) { errors.push('timer: ' + e.stack); } if (t.iv) t.at += t.every; else t.dead = true; }
        const q = rafQ; rafQ = []; ctx2d._reset();
        for (const fn of q) { try { fn(nowMs); } catch (e) { errors.push('raf: ' + e.stack); } }
      }
    },
    shot(name, dom) { const p = OUT + '/' + name; fs.writeFileSync(p + '.json', JSON.stringify({ w: 975, h: 2110, ops: ctx2d._ops(), dom: dom || domState() })); try { cp.execSync(`python3 ${__dirname}/render.py ${p}.json ${p}.png`, { stdio: 'pipe', timeout: 60000 }); } catch (e) { errors.push('render failed ' + name + ' ' + e.stderr); } return p + '.png'; },
    G: () => sandbox.window.__prism,
  };
  return env;
}

// ---------------- Tests ----------------
const results = []; const ok = (name, cond, info) => { results.push([cond ? 'PASS' : 'FAIL', name, info || '']); };
const storage = {};
let env = makeEnv(storage);
env.frames(5); console.log('boot errors', env.errors);
ok('boots without errors', env.errors.length === 0, env.errors.join(' | '));
ok('title visible on boot', env.byId.title.hidden === false);
env.frames(1); env.shot('01-title');
const { Game, R } = env.G();
ok('layout: wheel fits 390 width', (() => { const lim = (0.165 + 8 * 0.07) / Math.cos(Math.PI / 6); return R.cx - lim * R.u >= 0 && R.cx + lim * R.u <= 390; })(), 'u=' + R.u.toFixed(1));
ok('layout: wheel clears HUD and buttons', (() => { const lim = (0.165 + 8 * 0.07); return R.cy - lim * R.u > 74 && R.cy + lim * R.u < 844 - 112; })(), 'cy=' + R.cy);

// start
env.byId.bplay.fire('click');
ok('play hides title', env.byId.title.hidden === true);
ok('audio context created on play', env.acCount() === 1);
env.frames(60); env.shot('02-start');
const st0 = Game.st;
ok('first wave spawns within 1.5s', st0.falling.length + st0.stats.landed > 0);
// touch input via buttons and canvas halves
const r0 = st0.rot;
env.byId.br.fire('pointerdown'); env.frames(1);
ok('right button rotates clockwise', st0.rot === (r0 + 1) % st0.sides);
env.byId.bl.fire('pointerdown'); env.byId.bl.fire('pointerdown'); env.frames(1);
ok('left button rotates counterclockwise', st0.rot === (r0 - 1 + st0.sides) % st0.sides);
env.byId.cv.fire('pointerdown', { clientX: 300, clientY: 400 });
ok('tap right half rotates', st0.rot === r0);
env.byId.cv.fire('pointerdown', { clientX: 60, clientY: 400 });
ok('tap left half rotates', st0.rot === (r0 - 1 + st0.sides) % st0.sides);
env.win.fire('keydown', { key: 'ArrowRight' });
ok('keyboard rotates', st0.rot === r0);

// play with a human-ish bot through the page's own input path
const bot = BOT.makeBot('human');
let shots = { combo: false, ring: false, danger: false, flare: false };
let sawClear = false, sawRing = false, maxParts = 0, frameCount = 0;
function drive(frames, onFrame) {
  for (let i = 0; i < frames && !Game.st.over; i++) {
    const a = bot(Game.st, 1 / 60);
    if (a === 'flare') env.byId.bf.fire('pointerdown'); else if (a === 1) env.byId.br.fire('pointerdown'); else if (a === -1) env.byId.bl.fire('pointerdown');
    env.frames(1); frameCount++;
    maxParts = Math.max(maxParts, R.parts.length);
    if (onFrame) onFrame(i);
  }
}
drive(60 * 30, () => {
  const st = Game.st;
  if (!shots.combo && R.texts.length >= 1 && st.combo >= 2) { shots.combo = true; env.shot('03-combo'); }
  if (R.parts.length) sawClear = true;
});
ok('clears happened in 30s of bot play', Game.st.stats.cleared > 0, 'cleared=' + Game.st.stats.cleared);
ok('particles spawned', maxParts > 0, 'max=' + maxParts);
ok('no errors during play', env.errors.length === 0, env.errors.slice(0, 3).join(' | '));
// autosave + refresh resume
env.document.hidden = true; env.document.fire('visibilitychange'); env.document.hidden = false;
ok('hidden tab pauses', Game.paused === true && env.byId.pause.hidden === false);
const saved = JSON.parse(storage['prismwheel.v1'] || '{}');
ok('run autosaved on hide', !!saved.save);
const scoreBefore = Game.st.score, ringBefore = Game.st.ringIdx;
env.shot('04-pause');
// "refresh": new page with same storage
let env2 = makeEnv(storage); env2.frames(3);
ok('refresh shows Resume button', env2.byId.bresume.hidden === false);
env2.byId.bresume.fire('click'); env2.frames(2);
const G2 = env2.G().Game;
ok('resume restores score', G2.st.score === scoreBefore && G2.st.ringIdx === ringBefore, G2.st.score + ' vs ' + scoreBefore);
ok('resumed run starts paused', G2.paused === true);
env2.byId.bunpause.fire('click'); env2.frames(30);
ok('resumed run continues without errors', env2.errors.length === 0 && !G2.paused, env2.errors.join('|'));
env = env2; const Gm = G2, Rr = env2.G().R;
// keep playing to ring up and death
let ringShotDone = false, dangerShot = false, flareShot = false;
const t0 = Gm.st.t;
for (let i = 0; i < 60 * 900 && !Gm.st.over; i++) {
  const a = bot(Gm.st, 1 / 60);
  if (a === 'flare') { env.byId.bf.fire('pointerdown'); if (!flareShot) { env.frames(4); env.shot('06-flare'); flareShot = true; } }
  else if (a === 1) env.byId.br.fire('pointerdown'); else if (a === -1) env.byId.bl.fire('pointerdown');
  env.frames(1);
  if (Rr.banner && Gm.st.ringIdx >= 1 && !ringShotDone && Rr.banner.life > 0.3) { ringShotDone = true; env.shot('05-ringup'); }
  if (!dangerShot && Gm.st.ringIdx >= 1 && Math.max(...Gm.st.grid.map(c => c.length)) >= 6) { dangerShot = true; env.shot('07-danger-ring' + Gm.st.ringIdx); }
  if (i === 60 * 200) env.shot('08-midgame');
}
ok('reached ring II in bot play', Gm.st.ringIdx >= 1, 'ring=' + Gm.st.ringIdx);
ok('flare fired at least once', Gm.st.stats.flares > 0, 'flares=' + Gm.st.stats.flares);
// force a loss if bot survived: stop input
let idle = 0; while (!Gm.st.over && idle++ < 60 * 300) env.frames(1);
ok('game can be lost', Gm.st.over === true, 't=' + Gm.st.t.toFixed(0));
env.frames(80);
ok('game over screen shows', env.byId.over.hidden === false);
ok('tip shown', (env.byId.otip.textContent || '').length > 10, env.byId.otip.textContent);
const sv = JSON.parse(storage['prismwheel.v1']);
ok('best score saved', sv.best === Gm.st.score || sv.best >= Gm.st.score, 'best=' + sv.best + ' score=' + Gm.st.score);
ok('save cleared after loss', sv.save === null);
env.shot('09-over');
env.byId.bretry.fire('click'); env.frames(30);
ok('retry starts a fresh run', Gm.st.score === 0 && !Gm.st.over && env.byId.over.hidden === true);
env.byId.bmenu.fire('click'); env.frames(2);
// daily
env.byId.bdaily.fire('click'); env.frames(10);
const seedA = Gm.st.seed; env.byId.bpause.fire('click'); env.byId.bquit.fire('click'); env.byId.bdaily.fire('click');
ok('daily seed is stable within the day', Gm.st.seed === seedA && Gm.st.mode === 'daily');
// storage blocked
const envX = makeEnv(new Proxy({}, { get() { throw new Error('blocked'); }, set() { throw new Error('blocked'); }, has() { throw new Error('blocked'); } }));
envX.frames(3); envX.byId.bplay.fire('click'); envX.frames(120);
ok('works with storage blocked', envX.errors.length === 0, envX.errors.slice(0, 2).join('|'));
ok('no console errors overall', env.errors.length === 0, env.errors.slice(0, 3).join(' | '));
ok('haptics fired', env.vibs.length > 0);
for (const r of results) console.log(r.join('  '));
console.log(results.filter(r => r[0] === 'FAIL').length + ' failed of ' + results.length, '| bot frames', frameCount, '| final score', Gm.st.score);
