// DOM smoke test in jsdom (no real canvas or audio; both stubbed). Usage: node test/smoke.js <path-to-jsdom-node_modules>
const path = require('path'), fs = require('fs');
const { JSDOM } = require(path.join(process.argv[2], 'jsdom'));
const html = fs.readFileSync(path.join(__dirname, '../dist/spireshade.html'), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let failures = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) failures++; };

function makeDom(storage) {
  const errors = [];
  const audio = { suspends: 0, resumes: 0 };
  const dom = new JSDOM('<!doctype html><html><head></head><body>' + html + '</body></html>', {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.test/',
    beforeParse(w) {
      if (storage) for (const [k, v] of Object.entries(storage)) w.localStorage.setItem(k, v);
      const ctx2d = new Proxy({}, { get: (t, p) => p in t ? t[p] : (p === 'measureText' ? () => ({ width: 10 }) : () => {}), set: (t, p, v) => { t[p] = v; return true; } });
      w.HTMLCanvasElement.prototype.getContext = function () { return ctx2d; };
      w.HTMLCanvasElement.prototype.getBoundingClientRect = function () { return { left: 0, top: 0, width: 360, height: 360, right: 360, bottom: 360 }; };
      w.matchMedia = q => ({ matches: /reduce/.test(q), addEventListener() {}, removeEventListener() {} });
      w.ResizeObserver = class { observe() {} };
      w.AudioContext = class { constructor() { this.state = 'running'; this.currentTime = 0; this.sampleRate = 8000; this.destination = {}; }
        suspend() { audio.suspends++; this.state = 'suspended'; return Promise.resolve(); } resume() { audio.resumes++; this.state = 'running'; return Promise.resolve(); }
        createOscillator() { return { type: '', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, start() {}, stop() {} }; }
        createGain() { return { gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
        createBuffer(c, n) { return { getChannelData: () => new Float32Array(n) }; }
        createBufferSource() { return { connect() {}, start() {} }; }
        createBiquadFilter() { return { frequency: {}, Q: {}, connect() {} }; } };
      w.addEventListener('error', e => errors.push(e.message || String(e.error)));
    }
  });
  dom.window.console.error = (...a) => errors.push(a.join(' '));
  return { dom, w: dom.window, errors, audio };
}
const tapCell = (w, i) => {
  const cv = w.document.getElementById('board'), m = 360 * 0.085, cs = (360 - 2 * m) / 5;
  const x = m + (i % 5 + 0.5) * cs, y = m + (Math.floor(i / 5) + 0.5) * cs;
  for (const t of ['pointerdown', 'pointerup']) cv.dispatchEvent(new w.MouseEvent(t, { clientX: x, clientY: y, bubbles: true }));
};
async function waitFor(fn, ms, label) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await sleep(25); } ok(false, 'timeout: ' + label); return false; }

(async () => {
  // 1. Fresh boot + first touch
  let { w, errors, audio } = makeDom();
  await sleep(100);
  const A = w.SpireApp, C = w.SpireCore, $ = id => w.document.getElementById(id);
  ok(A && A.s && A.s.ply === 0, 'boots into a game at move 0');
  ok($('confirmBtn').disabled, 'confirm disabled before a tap');
  tapCell(w, 12);
  ok(A.sel === 12 && /Place at C3/.test($('confirmBtn').textContent), 'first touch selects and previews (' + $('confirmBtn').textContent + ')');
  tapCell(w, 12);
  ok(A.g.moves.length === 1 && A.s.owner[12] === 1, 'second tap commits the move');
  await waitFor(() => A.g.moves.length === 2 && !A.busy && !A.anim, 3000, 'bot reply');
  ok(A.g.moves.length === 2, 'bot replied');
  // tap rival spire -> explanation, no move
  const rival = A.s.owner.findIndex(o => o === 2);
  tapCell(w, rival); ok(A.g.moves.length === 2 && /Indigo's spire/.test($('coachText').textContent), 'tapping a rival spire explains instead of moving');
  // 2. Undo
  $('undoBtn').click(); ok(A.g.moves.length === 0 && A.g.casual, 'undo takes back your move and the reply');
  // 3. Visibility stops audio
  Object.defineProperty(w.document, 'hidden', { configurable: true, get: () => true });
  w.document.dispatchEvent(new w.Event('visibilitychange'));
  ok(audio.suspends >= 1, 'hidden tab suspends audio');
  Object.defineProperty(w.document, 'hidden', { configurable: true, get: () => false });
  w.document.dispatchEvent(new w.Event('visibilitychange'));
  // 4. Full game vs Pebble as Rust, random legal moves
  $('menuBtn').click();
  w.document.querySelector('[data-lv="0"]').click(); w.document.querySelector('[data-hu="1"]').click(); w.document.getElementById('startBtn').click();
  ok(A.g.level === 0 && A.g.moves.length === 0, 'menu starts a new game vs Pebble');
  let guard = 0;
  while (!C.isOver(A.s) && guard++ < 200) {
    await waitFor(() => A.humanToMove() && !A.anim && !A.busy || C.isOver(A.s), 4000, 'your turn');
    if (C.isOver(A.s)) break;
    const ms = C.legalMoves(A.s); const m = ms[Math.floor(Math.random() * ms.length)];
    tapCell(w, m); tapCell(w, m);
  }
  ok(C.isOver(A.s), 'full game vs Pebble reaches the end in ' + A.s.ply + ' moves');
  await waitFor(() => w.document.getElementById('rvBtn'), 2000, 'result sheet');
  ok(!!w.document.getElementById('rvBtn'), 'result sheet offers review');
  const rec = A.g.recorded; ok(rec, 'result recorded once');
  w.document.getElementById('rvBtn').click();
  await waitFor(() => A.review && A.review.done, 20000, 'review analysis');
  ok(A.review.done && A.review.recs.length === A.g.moves.length, 'review analysed every move');
  ok(/Turning point|Clean game/.test($('rvText').textContent), 'review shows a turning point or clean game');
  const retry = w.document.querySelector('[data-retry]');
  if (retry) { const ply = +retry.dataset.retry; retry.click(); ok(A.mode === 'play' && A.g.moves.length === ply && A.g.casual && A.humanToMove(), 'retry from the turning point puts you on move'); }
  else { $('rvDone').click(); ok(A.mode === 'play', 'review done returns to play'); }
  // 5. Daily puzzle: solve it
  $('puzzleBtn').click();
  ok(A.mode === 'puzzle' && A.puzzle.phase === 'ask', 'daily puzzle opens');
  const sol = A.puzzle.pz.solution; tapCell(w, sol); tapCell(w, sol);
  await waitFor(() => A.puzzle && A.puzzle.phase === 'done', 5000, 'puzzle resolve');
  const store = JSON.parse(w.localStorage.getItem('spireshade:v1'));
  ok(store.puzzle.solved[C.dateKey()] === 1 && store.puzzle.streak === 1, 'solving marks today and starts a streak');
  ok(/Solved/.test($('coachText').textContent), 'puzzle says solved: ' + $('coachText').textContent.slice(0, 60));
  $('confirmBtn').click(); ok(A.mode === 'puzzle' && !A.puzzle.isDaily, 'practice another opens a practice puzzle');
  // wrong answer path
  const wrong = C.legalMoves(A.s).find(m => m !== A.puzzle.pz.solution);
  tapCell(w, wrong); tapCell(w, wrong);
  await waitFor(() => A.puzzle.phase === 'done', 5000, 'wrong resolve');
  ok(/Not quite/.test($('coachText').textContent), 'wrong answer explains and offers retry');
  $('confirmBtn').click(); ok(A.puzzle.phase === 'ask', 'try again resets the puzzle');
  $('undoBtn').click(); ok(A.puzzle.showAnswer, 'show answer reveals');
  $('undoBtn').click(); ok(A.mode === 'play', 'back to game');
  // 6. Pass and play
  $('menuBtn').click(); w.document.querySelector('[data-lv="pvp"]').click(); w.document.getElementById('startBtn').click();
  ok(A.g.mode === 'pvp', 'pass and play starts');
  tapCell(w, 0); tapCell(w, 0); await sleep(50); tapCell(w, 24); tapCell(w, 24); await sleep(50);
  ok(A.g.moves.length === 2 && A.s.owner[24] === 2, 'both players move on one device');
  $('undoBtn').click(); ok(A.g.moves.length === 1, 'pass-and-play undo takes back one move');
  ok(errors.length === 0, 'no script errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  const saved = w.localStorage.getItem('spireshade:v1');
  w.close();

  // 7. Reload keeps progress
  ({ w, errors } = makeDom({ 'spireshade:v1': saved }));
  await sleep(100);
  ok(w.SpireApp.g.mode === 'pvp' && w.SpireApp.g.moves.length === 1, 'reload restores the game in progress');
  w.close();
  // 8. Corrupt save recovers, keeps a copy
  ({ w, errors } = makeDom({ 'spireshade:v1': '{"v":1, broken' }));
  await sleep(100);
  ok(w.SpireApp && w.SpireApp.s.ply === 0 && w.localStorage.getItem('spireshade:v1:unreadable'), 'unreadable save: fresh game, raw copy kept');
  ok(errors.length === 0, 'no errors on corrupt save');
  w.close();
  // 9. Tampered game: illegal moves dropped, record kept
  const bad = JSON.parse(saved); bad.game.moves = [3, 3, 3, 3, 3]; bad.stats.levels.pebble.w = 7;
  ({ w, errors } = makeDom({ 'spireshade:v1': JSON.stringify(bad) }));
  await sleep(150);
  ok(w.SpireApp.s.ply === 0 && JSON.parse(w.localStorage.getItem('spireshade:v1')).stats.levels.pebble.w === 7, 'illegal saved game dropped, record kept');
  ok(errors.length === 0, 'no errors on tampered save');
  w.close();
  // 10. Narrow phone width layout sanity: no element forces min-width > 375 (static check)
  ok(!/min-width:\s*(3[8-9]\d|[4-9]\d\d)px/.test(html), 'no min-width wider than a phone');
  console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.log('CRASH', e); process.exit(2); });
