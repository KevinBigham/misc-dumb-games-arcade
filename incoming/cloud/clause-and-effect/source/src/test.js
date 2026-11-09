// Bot tests for Clause & Effect.
// Part A: pure rules (every reference solution wins, every blocked exploit fails the expected way, determinism).
// Part B: the real single-file build in jsdom at a 390x844 phone viewport, solving every level through taps.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const C = require('./core.js');

let pass = 0, fail = 0; const failures = [];
function ok(cond, name) { if (cond) pass++; else { fail++; failures.push(name); console.log('  FAIL', name); } }
const L = id => C.LEVELS.find(l => l.id === id);
function run(id, sol) { const lv = L(id); const led = C.applySol(lv, sol); return C.runAll(lv, led); }

console.log('A. Rules');
for (const lv of C.LEVELS) {
  const s = run(lv.id, lv.sol);
  ok(s.status === 'win', `${lv.id}: reference solution wins (got ${s.status} ${s.reason})`);
  ok(lv.par.ok, `${lv.id}: par computed from a winning run`);
  const before = s.tick, again = run(lv.id, lv.sol);
  ok(again.tick === before && again.status === s.status, `${lv.id}: deterministic`);
  const blank = C.runAll(lv, C.freshLedger(lv));
  ok(blank.status !== 'win', `${lv.id}: untouched ledger does not win (got ${blank.status})`);
}
// Each sealed level blocks the previous level's loophole.
const EXPLOITS = [
  ['stairs', { clauses: { walls: 'soft' } }, 'timeout', 'soft walls are sealed solid'],
  ['spiral', { clauses: { hatch: 'follows' } }, 'void', 'The hatch must not move.'],
  ['keyholder', { clauses: { door: 'anyone' }, routine: ['around', { cmd: 'repeat', n: 6, act: 'step' }] }, 'void', 'Pip must hold the key when escaping.'],
  ['shift', { clauses: { guards: 'asleep' }, routine: ['step'] }, 'caught', 'guards are sealed alert'],
  ['marsh', { clauses: { spare: 'under' } }, 'void', 'There is exactly one hatch.'],
  ['marsh', { clauses: { ink: 'dry' }, routine: ['step'] }, 'timeout', 'dry ink straight line still blocked'],
  ['marsh', { clauses: { ink: 'dry' }, routine: [{ cmd: 'if', sense: 'wall', then: 'left', else: 'step' }] }, 'timeout', 'dry ink gives no shortcut'],
  ['hop', { clauses: { ink: 'dry' }, routine: [{ cmd: 'if', sense: 'wall', then: 'right', else: 'step' }] }, 'void', 'Pip may not touch ink, wet or dry.'],
  ['hop', { routine: [{ cmd: 'if', sense: 'wall', then: 'right', else: 'step' }] }, 'smudged', 'stride 1 walks into wet ink'],
  ['pen', { face: 'west', clauses: { stride: '2' }, routine: ['step'] }, 'void', 'Pip may not pass through or hop over walls or locked doors.'],
  ['pen', { face: 'east', clauses: { stride: '2' }, routine: [{ cmd: 'repeat', n: 3, act: 'step' }, 'around', { cmd: 'repeat', n: 3, act: 'step' }] }, 'caught', 'naive pen route is caught'],
  ['pen', { face: 'east', clauses: { stride: '2', pace: '2' }, routine: [{ cmd: 'repeat', n: 3, act: 'step' }, 'around', { cmd: 'repeat', n: 3, act: 'step' }] }, 'caught', 'slowing guards alone is not enough'],
  ['pen', { face: 'east', clauses: { stride: '2', door: 'anyone' }, routine: ['around', { cmd: 'repeat', n: 2, act: 'step' }] }, 'void', 'Pip must hold the key when escaping.'],
  ['audit', { clauses: { spare: 'under' } }, 'void', 'There is exactly one hatch.'],
  ['audit', { clauses: { spare: 'under', winOn: 'wall' }, struck: { oneHatch: true } }, 'void', 'Escapes go through the hatch.'],
  ['audit', { clauses: { spare: 'under', hatch: 'follows' }, struck: { oneHatch: true, hatchFix: true } }, 'void', 'The Pen holds ink for 2 strokes.'],
  ['audit', { clauses: { walls: 'soft' }, routine: ['right', { cmd: 'repeat', n: 8, act: 'step' }] }, 'void', 'Walls stay solid.'],
];
for (const [id, sol, want, why] of EXPLOITS) {
  const s = run(id, sol);
  ok(s.status === want && (want !== 'void' || s.reason === why), `${id} exploit blocked: ${why} (got ${s.status}: ${s.reason})`);
}
// The five finale loopholes each fit in two strokes.
const ENDS = {
  forgery: { clauses: { spare: 'under' }, struck: { oneHatch: true } },
  fineprint: { clauses: { winOn: 'wall' }, struck: { hatchOnly: true }, routine: ['left', 'step'] },
  summons: { clauses: { hatch: 'follows' }, struck: { hatchFix: true }, routine: ['wait'] },
  softwall: { clauses: { walls: 'soft' }, struck: { walls: true }, routine: ['right', { cmd: 'repeat', n: 8, act: 'step' }] },
  nap: { clauses: { guards: 'asleep' }, struck: { guards: true }, routine: ['step', 'right', { cmd: 'repeat', n: 8, act: 'step' }] },
};
for (const [k, sol] of Object.entries(ENDS)) {
  const lv = L('audit'), led = C.applySol(lv, sol), s = C.runAll(lv, led);
  ok(s.status === 'win' && C.loopholeOf(lv, led) === k, `audit ending ${k} reachable in 2 strokes (got ${s.status} ${s.reason} ${C.loopholeOf(lv, led)})`);
}
console.log(`  rules: ${pass} passed, ${fail} failed`);

/* ---------------- Part B: DOM ---------------- */
async function boot(storage, label) {
  const html = fs.readFileSync(path.join(__dirname, 'dist/clause-and-effect.html'), 'utf8');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('error', e => errors.push(String(e && e.stack || e)));
  vc.on('jsdomError', e => { if (!/getContext|Not implemented: HTMLCanvasElement/.test(String(e))) errors.push('jsdom: ' + e.message); });
  const doc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>${html}</body></html>`;
  const dom = new JSDOM(doc, {
    url: 'https://example.test/', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      Object.defineProperty(w, 'innerWidth', { value: 390, configurable: true });
      Object.defineProperty(w, 'innerHeight', { value: 844, configurable: true });
      w.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
      const noop = () => {};
      const ctx = new Proxy({}, { get: (t, k) => (k in t ? t[k] : (k === 'measureText' ? () => ({ width: 10 }) : noop)), set: (t, k, v) => { t[k] = v; return true; } });
      w.HTMLCanvasElement.prototype.getContext = () => ctx;
      if (storage) for (const [k, v] of Object.entries(storage)) w.localStorage.setItem(k, v);
    },
  });
  await new Promise(r => setTimeout(r, 30));
  const w = dom.window;
  w.eval('CONFIG.TICK_MS = 12');
  return { dom, w, d: w.document, errors, label };
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
function click(el, name) { if (!el) throw new Error('missing element: ' + name); el.dispatchEvent(new el.ownerDocument.defaultView.MouseEvent('click', { bubbles: true })); }
function chooseOption(d, label) {
  const opts = [...d.querySelectorAll('#sheetbg .opt')];
  const o = opts.find(b => b.querySelector('b').firstChild.textContent.trim() === String(label));
  if (!o) throw new Error(`option "${label}" not in [${opts.map(b => b.querySelector('b').firstChild.textContent).join(', ')}]`);
  click(o, label);
}
function setSlot(d, k, i, label) {
  click(d.querySelector(`.slot[data-k="${k}"][data-i="${i}"]`), `${k}/${i}`);
  chooseOption(d, label);
}
// Enter a reference solution the way a player would: tapping slots and picking options.
function enter(d, lv, sol) {
  if (sol.face && sol.face !== lv.face.v) setSlot(d, 'face', 0, sol.face);
  for (const [k, v] of Object.entries(sol.clauses || {})) setSlot(d, 'clause', k, C.CLAUSES[k].opts[v]);
  for (const id of Object.keys(sol.struck || {})) click(d.querySelector(`[data-k="strike"][data-i="${id}"]`), 'strike ' + id);
  (sol.routine || []).forEach((r, i) => {
    const l = typeof r === 'string' ? { cmd: r } : r;
    if (lv.routine[i].lock) return;
    setSlot(d, 'cmd', i, C.COMMANDS[l.cmd].label);
    if (l.cmd === 'repeat') { setSlot(d, 'n', i, l.n + ' ticks'); setSlot(d, 'act', i, C.COMMANDS[l.act].label); }
    if (l.cmd === 'if') { setSlot(d, 'sense', i, C.SENSES[l.sense].label); setSlot(d, 'then', i, C.COMMANDS[l.then].label); setSlot(d, 'else', i, C.COMMANDS[l.else].label); }
  });
}
async function runUntilDone(d, w) {
  click(d.querySelector('#run'), 'run');
  for (let i = 0; i < 400; i++) {
    await sleep(15);
    const r = d.querySelector('#result');
    if (r && !r.hidden && r.innerHTML) return r.textContent;
    if (w.eval('State.screen') === 'finale') return d.body.textContent;
  }
  return 'NO RESULT';
}

(async () => {
  console.log('B. DOM at 390x844');
  const t = await boot(null, 'fresh');
  const { d, w } = t;
  ok(/Clause/.test(d.querySelector('.title-mark').textContent), 'title renders');
  ok(d.title.includes('Clause'), 'page title set');
  click(d.querySelector('#go'), 'start');
  ok(w.eval('State.screen') === 'play' && w.eval('State.li') === 0, 'Start opens level 1 immediately');
  ok(d.querySelector('.slot.hot') !== null, 'level 1 shows a pulsing slot to tap');
  // Canvas is sized to fit the phone.
  const cvw = parseInt(d.querySelector('#board').style.width, 10);
  ok(cvw > 0 && cvw <= 390 - 32, `board fits 390px wide (got ${cvw}px)`);

  // Locked slot gives feedback instead of nothing.
  click(d.querySelector('[data-k="lockedline"]'), 'locked line');
  ok(/fixed/.test((d.querySelector('#toast') || {}).textContent || ''), 'locked line explains itself');

  // An untouched level 1 run stalls, then the card offers to edit.
  let txt = await runUntilDone(d, w);
  ok(/STALLED/.test(txt), 'untouched level 1 run stalls with a clear message');
  click(d.querySelector('#edit'), 'edit');

  const perLevel = [];
  for (let i = 0; i < C.LEVELS.length; i++) {
    const lv = C.LEVELS[i];
    ok(w.eval('State.li') === i, `on level ${i + 1}`);
    // For sealed levels, first try the blocked exploit through the UI and confirm it fails.
    const ex = EXPLOITS.find(e => e[0] === lv.id && e[2] === 'void');
    if (ex) {
      enter(d, lv, ex[1]);
      const out = await runUntilDone(d, w);
      ok(/VOID/.test(out) && out.includes(ex[3]), `UI: ${lv.id} exploit shows VOID with seal "${ex[3]}"`);
      ok(d.querySelector('.seal-line.broken') !== null || lv.strikable, `UI: ${lv.id} broken seal highlighted`);
      click(d.querySelector('#edit'), 'edit');
      click(d.querySelector('#fresh'), 'clear edits');
    }
    enter(d, lv, lv.sol);
    const out = await runUntilDone(d, w);
    const won = lv.strikable ? /APPROVED/.test(out) : /ESCAPED/.test(out);
    const stars = (out.match(/★/g) || []).length;
    perLevel.push(`${String(i + 1).padStart(2)} ${lv.name.padEnd(20)} ${won ? 'ESCAPED' : 'FAILED '} ${lv.strikable ? '' : stars + '★'} par ${lv.par.ticks}t/${lv.par.lines}l`);
    ok(won, `UI: level ${i + 1} ${lv.name} solved by taps`);
    if (!lv.strikable) ok(stars === 3, `UI: level ${i + 1} reference solution earns 3 stars (got ${stars})`);
    if (i < C.LEVELS.length - 1) click(d.querySelector('#next'), 'next');
  }
  console.log(perLevel.map(s => '   ' + s).join('\n'));
  ok(w.eval('Storage.data.unlocked') === C.LEVELS.length, 'all levels unlocked after the run');
  ok(w.eval('Object.keys(Storage.data.endings).length') === 1, 'finale ending recorded');

  // Finale replay: find a second loophole.
  click(d.querySelector('#again'), 'again');
  enter(d, L('audit'), ENDS.nap);
  txt = await runUntilDone(d, w);
  ok(/The Long Nap/.test(txt), 'second finale loophole recognized as The Long Nap');
  ok(w.eval('Object.keys(Storage.data.endings).length') === 2, 'two endings recorded');

  // Keyboard: Space runs, R resets.
  w.eval('openLevel(0)');
  const kd = key => d.dispatchEvent(new w.KeyboardEvent('keydown', { key, bubbles: true }));
  d.activeElement && d.activeElement.blur && d.activeElement.blur();
  kd(' '); await sleep(80);
  ok(w.eval('State.sim && State.sim.tick > 0'), 'Space starts a run');
  kd('r'); ok(w.eval('State.sim === null'), 'R resets the board');
  kd('h'); ok(d.querySelector('#hintbox').textContent.length > 0, 'H shows a hint');

  // Persistence: reload with the same storage.
  const saved = {}; for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); saved[k] = w.localStorage.getItem(k); }
  const t2 = await boot(saved, 'reload');
  ok(t2.w.eval('Storage.data.unlocked') === C.LEVELS.length, 'reload keeps unlocked levels');
  ok(t2.w.eval('Storage.data.stars.stairs') === 3, 'reload keeps stars');
  ok(/Continue/.test(t2.d.querySelector('#go').textContent), 'title says Continue after progress');
  // Draft survives reload.
  t2.w.eval('openLevel(2)'); setSlot(t2.d, 'cmd', 0, 'turn left');
  const saved2 = JSON.parse(t2.w.localStorage.getItem('clause-effect-save-v1'));
  const t3 = await boot({ 'clause-effect-save-v1': JSON.stringify(saved2) }, 'draft');
  t3.w.eval('openLevel(2)');
  ok(t3.d.querySelector('.slot[data-k="cmd"][data-i="0"]').textContent === 'turn left', 'edited line survives a refresh');

  // Corrupt save: keep a backup, start fresh, tell the player.
  const t4 = await boot({ 'clause-effect-save-v1': '{not json' }, 'corrupt');
  ok(t4.w.localStorage.getItem('clause-effect-save-v1.backup') === '{not json', 'corrupt save is backed up, not destroyed');
  ok(/backup/.test(t4.d.querySelector('.fineprint').textContent), 'player is told about the backup');

  // Level select is reachable and shows the endings.
  t2.w.eval('showLevels()');
  ok(t2.d.querySelectorAll('.lvl').length === C.LEVELS.length, 'level select lists 15 levels');
  ok(/Long Nap/.test(t2.d.body.textContent), 'level select shows found loopholes');

  const allErr = [t, t2, t3, t4].flatMap(x => x.errors.map(e => x.label + ': ' + e));
  ok(allErr.length === 0, 'no console errors: ' + allErr.slice(0, 3).join(' | '));
  console.log(`\nTOTAL ${pass} passed, ${fail} failed`);
  if (fail) console.log(failures.map(f => ' - ' + f).join('\n'));
  [t, t2, t3, t4].forEach(x => x.dom.window.close());
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(2); });
