// Headless UI smoke test (jsdom + stubbed canvas/audio). usage: NODE_PATH=<dir with jsdom> node smoke.js
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const HTML = fs.readFileSync(path.join(__dirname, '..', 'dist', 'kilnshot.html'), 'utf8');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function stub() { // anything-goes object: every property is a callable stub that returns another stub
  const f = function () { return P; };
  const P = new Proxy(f, { get(t, k) { if (k === 'then') return undefined; if (k === Symbol.toPrimitive) return () => 0; if (k === 'width') return 10; if (k in t) return t[k]; return P; }, set() { return true; }, apply() { return P; } });
  return P;
}
function boot(store, opts = {}) {
  const errors = []; const audio = { suspends: 0, resumes: 0, made: 0 };
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + HTML + '</body></html>', {
    url: 'https://kiln.test/' + (opts.hash || ''), runScripts: 'dangerously', pretendToBeVisual: false,
    beforeParse(win) {
      for (const [k, v] of Object.entries(store || {})) win.localStorage.setItem(k, v);
      win.HTMLCanvasElement.prototype.getContext = function () { return stub(); };
      win.requestAnimationFrame = (cb) => { win.__raf = cb; return 1; };
      win.__frame = (t) => { const cb = win.__raf; win.__raf = null; if (cb) cb(t); };
      class AC { constructor() { audio.made++; this.state = 'running'; this.sampleRate = 8000; this.currentTime = 0; this.destination = stub(); }
        createGain() { return stub(); } createOscillator() { return stub(); } createBiquadFilter() { return stub(); } createBufferSource() { return stub(); }
        createBuffer(c, n) { return { getChannelData: () => new Float32Array(n) }; }
        suspend() { audio.suspends++; this.state = 'suspended'; return Promise.resolve(); } resume() { audio.resumes++; this.state = 'running'; return Promise.resolve(); } }
      win.AudioContext = AC;
      win.addEventListener('error', (e) => errors.push(e.message));
      win.console.error = (...a) => errors.push(a.join(' '));
    },
  });
  const w = dom.window; const d = w.document;
  const K = w.__kiln; let t = 1000;
  const run = (n) => { for (let i = 0; i < n; i++) { t += 16.7; w.__frame(t); } };
  const runUntil = (pred, max = 4000) => { let i = 0; while (!pred() && i++ < max) run(1); return i; };
  const ptr = (type, x, y, id = 1) => { const el = d.getElementById('cv'); const e = new w.MouseEvent(type, { bubbles: true, clientX: x, clientY: y }); Object.defineProperty(e, 'pointerId', { value: id }); el.dispatchEvent(e); };
  const click = (id) => { const el = d.getElementById(id); if (!el) return false; el.click(); return true; };
  const key = (k) => w.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true }));
  const dump = () => { const o = {}; for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); o[k] = w.localStorage.getItem(k); } return o; };
  return { dom, w, d, K, run, runUntil, ptr, click, key, errors, audio, dump, ovShown: () => !d.getElementById('ov').hidden, card: () => d.getElementById('card').textContent };
}

(async () => {
  // 1. fresh boot
  let g = boot({});
  ok(g.errors.length === 0, 'boots with no errors ' + g.errors.join('|'));
  ok(g.ovShown() && /KILN/.test(g.card()) && /Start firing/.test(g.card()), 'title screen shows "Start firing" on a fresh save');
  ok(g.audio.made === 0, 'no audio context before the first gesture');
  g.click('tPlay');
  ok(g.K.S.mode === 'play' && g.K.S.level.id === 'L01' && !g.ovShown(), 'Start firing opens L01');
  ok(g.audio.made === 1, 'audio starts on the first tap');
  g.run(3);
  // 2. first drag: pull back and release fires a shot
  g.ptr('pointerdown', 100, 200); g.ptr('pointermove', 140, 220); g.ok = g.K.S.aim; g.ptr('pointermove', 180, 240);
  ok(!!g.K.S.aim, 'dragging shows the aim');
  g.ptr('pointerup', 180, 240);
  ok(g.K.S.mode === 'shot' && g.K.S.shots.length === 1, 'releasing the first drag throws an ember');
  const saved = JSON.parse(g.dump()['kilnshot.v1']);
  ok(saved.cur && saved.cur.shots.length === 1, 'the throw is saved before it resolves');
  const n = g.runUntil(() => g.K.S.mode !== 'shot');
  ok(g.K.S.mode !== 'shot', 'the shot settles (' + n + ' frames)');
  // tiny drag cancels
  if (g.K.S.mode === 'play') { const before = g.K.S.shots.length; g.ptr('pointerdown', 100, 200); g.ptr('pointermove', 103, 202); g.ptr('pointerup', 103, 202);
    ok(g.K.S.shots.length === before && /farther/.test(g.d.getElementById('toast').textContent), 'a tiny drag does not throw and says why'); }
  // 3. retry, then win with the solver's line
  await sleep(1000); // let any result overlay appear
  g.K.retry();
  ok(g.K.S.shots.length === 0 && g.K.S.mode === 'play', 'retry resets the level instantly');
  g.K.fire(-860, -440); g.runUntil(() => g.K.S.mode !== 'shot');
  ok(g.K.S.mode === 'over' && g.K.S.result.kind === 'won' && g.K.S.result.stars === 3, 'solver line wins L01 for 3 stars in the real app');
  await sleep(800);
  ok(g.ovShown() && /Next level/.test(g.card()), 'result card offers Next level');
  const st = JSON.parse(g.dump()['kilnshot.v1']);
  ok(st.best.L01 && st.best.L01.stars === 3 && st.cur === null, 'best saved, finished attempt cleared');
  // farming check: winning again does not stack anything
  g.click('rRetry'); g.K.fire(-860, -440); g.runUntil(() => g.K.S.mode !== 'shot');
  const st2 = JSON.parse(g.dump()['kilnshot.v1']);
  ok(Object.keys(st2.best).length === 1 && st2.best.L01.stars === 3, 'replaying a won level adds nothing (no farm loop)');
  // 4. hidden tab stops audio
  Object.defineProperty(g.d, 'hidden', { configurable: true, get: () => true });
  g.d.dispatchEvent(new g.w.Event('visibilitychange'));
  ok(g.audio.suspends >= 1, 'audio suspends when the tab is hidden');
  Object.defineProperty(g.d, 'hidden', { configurable: true, get: () => false });
  g.d.dispatchEvent(new g.w.Event('visibilitychange'));
  ok(g.audio.resumes >= 1, 'audio resumes when the tab comes back');
  // 5. keyboard throw
  await sleep(800); g.click('rNext'); g.run(2);
  ok(g.K.S.level.id === 'L02', 'Next level opens L02');
  g.key('ArrowLeft'); ok(g.K.S.aim && g.K.S.aim.kb, 'arrow keys show a keyboard aim');
  g.key(' '); ok(g.K.S.mode === 'shot', 'space throws');
  const store = g.dump(); g.runUntil(() => g.K.S.mode !== 'shot');
  ok(g.errors.length === 0, 'no runtime errors during play ' + g.errors.join('|'));

  // 6. refresh mid-level resumes the exact board, the throw stays spent
  const s7 = JSON.parse(store['kilnshot.v1']); s7.cur = { id: 'L07', shots: [[-400, -760]] }; s7.best.L06 = { stars: 3, shots: 1 }; s7.best.L05 = { stars: 3, shots: 1 };
  for (const id of ['L02', 'L03', 'L04']) s7.best[id] = { stars: 2, shots: 2 };
  g = boot({ 'kilnshot.v1': JSON.stringify(s7) });
  ok(/Continue/.test(g.card()), 'after a refresh the title offers Continue');
  g.click('tPlay');
  ok(g.K.S.level.id === 'L07' && g.K.S.shots.length === 1 && g.K.S.mode === 'play', 'Continue restores L07 with the throw already spent');
  ok(g.d.querySelectorAll('#hEmbers i.spent').length === 1, 'HUD shows one ember spent');
  g.click('bMenu');
  const tiles = [...g.d.querySelectorAll('button[data-i]')]; const locked = tiles.filter(b => b.classList.contains('locked')).length;
  ok(tiles.length === 24 && locked > 0 && locked < 24, 'level select: 24 tiles, ' + (24 - locked) + ' open');

  // 7. corrupt save
  g = boot({ 'kilnshot.v1': '{"v":1,"best":{"L01":' });
  ok(g.errors.length === 0 && /set aside/.test(g.card()), 'corrupt save: game boots and says it set the old save aside');
  ok(g.dump()['kilnshot.v1.corrupt'], 'corrupt save is kept as a backup');
  // hostile-but-valid JSON
  g = boot({ 'kilnshot.v1': JSON.stringify({ v: 1, best: { L01: { stars: 99, shots: -4 }, ZZZ: { stars: 3, shots: 1 } }, cur: { id: 'L03', shots: [[1e9, 'x']] }, daily: { best: { 'nope': { shots: 1 } }, cache: { date: '2026-01-01', level: { pots: 'x' } } } }) });
  ok(g.errors.length === 0 && g.K.Storage.data.best.L01 === undefined && g.K.Storage.data.cur === null && !g.K.Storage.data.daily.cache, 'bad values in a save are dropped, not trusted');
  // storage throwing (private mode)
  const g2 = (() => { try { const x = boot({}, {}); Object.defineProperty(x.w, 'localStorage', { get() { throw new Error('denied'); } }); x.click('tPlay'); x.K.fire(-860, -440); x.runUntil(() => x.K.S.mode !== 'shot'); return x; } catch (e) { return { errors: [String(e)] }; } })();
  ok(g2.errors.length === 0, 'storage that throws does not break play');

  // 8. daily kiln builds in slices and lands in a playable level
  g = boot({}); g.click('tDaily'); const t0 = Date.now();
  while (g.K.S.mode !== 'play' && Date.now() - t0 < 60000) { await sleep(50); g.run(1); }
  ok(g.K.S.mode === 'play' && g.K.S.isDaily, 'daily kiln builds and starts (' + (Date.now() - t0) + ' ms)');
  if (g.K.S.isDaily) {
    const L = g.K.S.level; console.log('   daily', L.date, 'par', L.par, 'pots', L.pots.length, 'proof', JSON.stringify(L.proof));
    if (L.proof) { for (const v of L.proof) { g.K.fire(v[0], v[1]); g.runUntil(() => g.K.S.mode !== 'shot'); }
      ok(g.K.S.result && g.K.S.result.kind === 'won', 'replaying the daily proof in the app wins it');
      await sleep(800); ok(/Kilnshot daily/.test(g.card()), 'daily result shows share text'); }
    const cached = JSON.parse(g.dump()['kilnshot.v1']).daily.cache; ok(cached && cached.date === L.date, 'daily level is cached for the day');
  }
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
