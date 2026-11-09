// DOM bot test with jsdom: real clicks on the real UI, at 375px, with a fake AudioContext.
// Run: NODE_PATH=<dir with jsdom> node dom.mjs
import fs from 'fs';
import { createRequire } from 'module';
import { HTML, loadCore, smartBot, makeRng } from './lib.mjs';
const require = createRequire(process.env.JSDOM_FROM || import.meta.url);
const { JSDOM, VirtualConsole } = require('jsdom');
const T = loadCore();
let fails = 0; const ok = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) fails++; };

function fakeAudio(stats) {
  return class {
    constructor() { this.state = 'suspended'; this.currentTime = 0; this.sampleRate = 8000; this.destination = {}; stats.made++; }
    resume() { this.state = 'running'; stats.resumes++; return Promise.resolve(); }
    suspend() { this.state = 'suspended'; stats.suspends++; return Promise.resolve(); }
    createGain() { return { gain: { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} }, connect() {} }; }
    createOscillator() { stats.tones++; if (this.state !== 'running') stats.tonesWhileSuspended++; return { type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, start() {}, stop() {} }; }
    createBuffer(c, n) { return { getChannelData: () => new Float32Array(n) }; }
    createBufferSource() { return { connect() {}, start() {} }; }
    createBiquadFilter() { return { type: '', frequency: { setValueAtTime() {}, linearRampToValueAtTime() {} }, connect() {} }; }
  };
}

function stubCanvas(w) {
  const noop = () => {}; const grad = { addColorStop: noop };
  const ctx = new Proxy({}, { get: (t, k) => k === 'createLinearGradient' ? () => grad : (k in t ? t[k] : noop), set: (t, k, v) => { t[k] = v; return true; } });
  w.HTMLCanvasElement.prototype.getContext = () => ctx;
}
function open(storage = {}) {
  const html = fs.readFileSync(HTML, 'utf8');
  const errors = []; const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push(e.message)); vc.on('error', (...a) => errors.push(a.join(' ')));
  const stats = { made: 0, resumes: 0, suspends: 0, tones: 0, tonesWhileSuspended: 0 };
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://game.test/', virtualConsole: vc,
    beforeParse(w) {
      Object.defineProperty(w, 'innerWidth', { value: 375 });
      stubCanvas(w);
      w.AudioContext = fakeAudio(stats);
      for (const [k, v] of Object.entries(storage)) w.localStorage.setItem(k, v);
      w.addEventListener('error', e => errors.push(e.message));
    } });
  const w = dom.window, d = w.document;
  const click = sel => { const el = typeof sel === 'string' ? d.querySelector(sel) : sel; if (!el) throw new Error('missing ' + sel); el.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true })); el.click(); return el; };
  return { dom, w, d, click, errors, stats, H: w.__TS };
}

// 1. boot + title + first touch
let E = open();
ok(E.errors.length === 0, 'boots with no errors ' + E.errors.join('|'));
ok(E.d.querySelector('#overlay').classList.contains('on') && /TWELVE SOLS/.test(E.d.querySelector('#overlay').textContent), 'title screen shows');
ok(E.stats.made === 0, 'no AudioContext before a gesture');
E.click('[data-act="new"]');
ok(E.stats.made === 1 && E.stats.resumes >= 1, 'first tap creates and resumes audio');
ok(!E.d.querySelector('#overlay').classList.contains('on'), 'first tap starts the run');
ok(E.d.querySelectorAll('[data-act="scav"]').length === 3, 'three sites on first screen');

// 2. one of each verb through real buttons
E.click('[data-act="scav"]:not([disabled])');
ok(E.H.G.s.hour > 0 && E.H.G.s.stats.trips === 1, 'Go button scavenges');
E.click('[data-tab="bench"]');
const make = E.d.querySelector('[data-act="make"]:not([disabled])');
ok(!!make, 'a known recipe is makeable on sol 1');
if (make) { const h = E.H.G.s.hour; E.click(make); ok(E.H.G.s.hour > h, 'Make spends an hour'); }
// experiment: pick two items with an untried pair
const picks = [...E.d.querySelectorAll('[data-act="pick"]')];
let tried = false;
for (let i = 0; i < picks.length && !tried; i++) for (let j = i + 1; j < picks.length && !tried; j++) {
  const a = picks[i].dataset.id, b = picks[j].dataset.id;
  if (T.Rules.pairStatus(E.H.G.meta, a, b).st === 'untried') {
    E.click(`[data-act="pick"][data-id="${a}"]`); E.click(`[data-act="pick"][data-id="${b}"]`);
    const btn = E.d.querySelector('[data-act="try"]');
    if (btn && !btn.disabled) { const before = E.H.G.meta.known.length + E.H.G.meta.duds.length; E.click(btn); ok(E.H.G.meta.known.length + E.H.G.meta.duds.length === before + 1, 'Try records a discovery or a dud'); tried = true; }
  }
}
ok(tried, 'found an untried pair to test');
// a dud pair is blocked without cost
if (E.H.G.meta.duds.length) {
  const [a, b] = E.H.G.meta.duds[0].split('|');
  if (E.H.G.s.inv[a] && E.H.G.s.inv[b]) { const h = E.H.G.s.hour; E.H.doAct({ t: 'craft', a, b }); ok(E.H.G.s.hour === h, 'repeating a known dud costs nothing'); }
}
// 3. End sol needs two taps when hours remain
E.click('#end');
ok(!E.d.querySelector('#overlay').classList.contains('on') && E.H.G.s.sol === 1, 'first End tap only arms');
E.click('#end');
ok(E.d.querySelector('#overlay').classList.contains('on') && /Night of Sol 1/.test(E.d.querySelector('#overlay').textContent), 'second tap shows night report');
// reload during the night report: it must show again, nothing applied twice
const saved = { run: E.w.localStorage.getItem('twelvesols.v1.run'), meta: E.w.localStorage.getItem('twelvesols.v1.meta') };
const solAfter = E.H.G.s.sol; const needsAfter = JSON.stringify(E.H.G.s.needs);
let R = open({ 'twelvesols.v1.run': saved.run, 'twelvesols.v1.meta': saved.meta });
R.click('[data-act="resume"]');
ok(/Night of Sol 1/.test(R.d.querySelector('#overlay').textContent) && R.H.G.s.sol === solAfter && JSON.stringify(R.H.G.s.needs) === needsAfter, 'reload shows the same night report without re-applying it');
R.click('[data-act="ack"]');
ok(!R.d.querySelector('#overlay').classList.contains('on'), 'Dawn closes the report');

// 4. hidden tab stops audio
const tonesBefore = E.stats.tones;
Object.defineProperty(E.d, 'hidden', { value: true, configurable: true });
E.d.dispatchEvent(new E.w.Event('visibilitychange'));
ok(E.stats.suspends >= 1, 'hidden tab suspends audio');
await new Promise(r => setTimeout(r, 2800));
ok(E.stats.tones === tonesBefore, 'no music notes while hidden');
Object.defineProperty(E.d, 'hidden', { value: false, configurable: true });
E.d.dispatchEvent(new E.w.Event('visibilitychange'));
ok(E.H.Audio.ctx.state === 'running', 'visible again resumes audio');
// sound toggle off: no tones
E.click('[data-act="ack"]');
E.click('[data-act="sound"]');
const t2 = E.stats.tones; E.click('[data-tab="go"]'); E.click('[data-act="scav"]:not([disabled])');
ok(E.stats.tones === t2, 'muted means silent');
E.click('[data-act="sound"]');

// 5. full UI-driven run to the end with the smart bot, via doAct + acks
const bot = smartBot(T, makeRng(3), { strategy: 'turtle' });
let guard = 0;
while (!E.H.G.s.result && guard++ < 400) {
  const ack = E.d.querySelector('#overlay [data-act="ack"]'); if (ack) { E.click(ack); continue; }
  E.H.doAct(bot(E.H.G.s, E.H.G.meta));
  if (E.H.G.s.night && !E.H.G.s.night.seen) E.click('#overlay [data-act="ack"]');
}
ok(!!E.H.G.s.result, 'run reaches an ending (' + (E.H.G.s.result && (E.H.G.s.result.win ? 'win' : 'loss')) + ')');
const ackLast = E.d.querySelector('#overlay [data-act="ack"]'); if (ackLast) E.click(ackLast);
ok(/Rescued|Run over/.test(E.d.querySelector('#overlay').textContent), 'end screen shows');
ok(E.H.G.meta.runs === 1, 'run counted once');
// reload after the end: still counted once
R = open({ 'twelvesols.v1.run': E.w.localStorage.getItem('twelvesols.v1.run'), 'twelvesols.v1.meta': E.w.localStorage.getItem('twelvesols.v1.meta') });
ok(R.H.G.meta.runs === 1 && !R.d.querySelector('[data-act="resume"]'), 'finished run is not resumable and not recounted');
E.click('[data-act="new"]');
ok(E.H.G.s.sol === 1 && !E.H.G.s.result, 'New run restarts');

// 6. damaged saves recover
for (const bad of ['{not json', '{"v":1,"sol":99}', JSON.stringify({ v: 1, sol: 2, hour: 3, inv: { gold: 5 } }), 'null', '[]']) {
  const B = open({ 'twelvesols.v1.run': bad, 'twelvesols.v1.meta': '{"known":["water","bogus"],"duds":["a|b",7],"best":"x","runs":-3}' });
  ok(B.errors.length === 0 && /damaged/.test(B.d.querySelector('#overlay').textContent) && B.H.G.meta.known.indexOf('bogus') < 0 && B.H.G.meta.best === 0, 'damaged save recovered: ' + bad.slice(0, 24));
  ok(B.w.localStorage.getItem('twelvesols.v1.damaged') === bad, 'damaged save kept as backup');
}
// storage that throws (private mode)
{
  const html = fs.readFileSync(HTML, 'utf8'); const errs = [];
  const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(e.message));
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://game.test/', virtualConsole: vc,
    beforeParse(w) { stubCanvas(w); Object.defineProperty(w, 'localStorage', { get() { throw new Error('denied'); } }); w.addEventListener('error', e => errs.push(e.message)); } });
  dom.window.document.querySelector('[data-act="new"]').click();
  ok(errs.length === 0 && dom.window.__TS && dom.window.__TS.G.s.sol === 1, 'plays with storage blocked ' + errs.join('|'));
}
// 7. keyboard
E.d.dispatchEvent(new E.w.KeyboardEvent('keydown', { key: '2', bubbles: true }));
ok(E.H.G.tab === 'bench', 'key 2 opens Bench');
E.d.dispatchEvent(new E.w.KeyboardEvent('keydown', { key: 'n', bubbles: true }));
E.d.dispatchEvent(new E.w.KeyboardEvent('keydown', { key: 'n', bubbles: true }));
ok(/Night of Sol 1/.test(E.d.querySelector('#overlay').textContent), 'N N ends the sol');
E.d.dispatchEvent(new E.w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
ok(!E.d.querySelector('#overlay').classList.contains('on'), 'Enter continues');
// daily mode is seeded
E.click('[data-act="menu"]'); E.click('[data-act="daily"]');
const d1 = JSON.stringify(E.H.G.s.sites); E.click('[data-act="menu"]'); E.click('[data-act="daily"]');
ok(E.H.G.s.mode === 'daily' && JSON.stringify(E.H.G.s.sites) === d1, 'daily sol is the same each time');
ok(E.errors.length === 0, 'no errors during play ' + E.errors.join('|'));
console.log(fails ? fails + ' FAILED' : 'ALL DOM CHECKS PASSED');
process.exit(fails ? 1 : 0);
