// Rules, determinism, puzzle and timing checks. node test/rules.js
const C = require('../src/core.js');
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
const N = C.CONFIG.N, at = (x, y) => y * N + x;
// Build a position by hand: ply 0 shadows fall west.
let s = C.newState(1);
ok(C.shadowDir(0).name === 'west' && C.shadowDir(1).name === 'west' && C.shadowDir(2).name === 'north', 'sun: both players share a direction each round');
ok(C.nextShiftPly(0) === 2 && C.nextShiftPly(1) === 2, 'next sun change is reported correctly');
// Hand position at ply 4 (shadows north), Rust to move
s.owner[at(2, 4)] = 1; s.height[at(2, 4)] = 2;      // Rust h2 at C2
s.owner[at(2, 3)] = 2; s.height[at(2, 3)] = 1;      // Indigo h1 above it
s.owner[at(2, 2)] = 2; s.height[at(2, 2)] = 2;      // Indigo h2 two above
s.owner[at(2, 1)] = 2; s.height[at(2, 1)] = 1;
s.ply = 2;
let p = C.preview(s, at(2, 4));
ok(p.kind === 'raise' && p.height === 3 && p.flips.length === 3, 'raise to 3 flips three shorter spires north');
s.height[at(2, 2)] = 3;
p = C.preview(s, at(2, 4));
ok(p.flips.length === 1 && p.blockedAt === at(2, 2), 'an equal-height spire blocks the shadow');
s.owner[at(2, 2)] = 1; s.height[at(2, 2)] = 1;
p = C.preview(s, at(2, 4));
ok(p.flips.length === 2 && p.cover.length === 3, 'own shorter spires let the shadow pass');
const pl = C.preview(s, at(4, 4));
ok(pl.kind === 'place' && pl.flips.length === 0, 'a new height-1 spire never captures');
ok(!C.isLegal(s, at(2, 3)), 'cannot touch a rival spire');
s.owner[at(0, 0)] = 1; s.height[at(0, 0)] = 3; ok(!C.isLegal(s, at(0, 0)), 'cannot raise past 3');
// apply/undo round trip
const snap = JSON.stringify([Array.from(s.owner), Array.from(s.height), s.ply]);
const u = C.applyMove(s, at(2, 4)); C.undoMove(s, u);
ok(JSON.stringify([Array.from(s.owner), Array.from(s.height), s.ply]) === snap, 'apply then undo restores the position');
// Every game ends, never has zero legal moves before the end; determinism
let maxPly = 0, stuck = 0;
for (let g = 0; g < 300; g++) {
  const rng = C.makeRng(g); const t = C.newState(1);
  while (!C.isOver(t)) { const ms = C.legalMoves(t); if (!ms.length) { stuck++; break; } C.applyMove(t, ms[Math.floor(rng() * ms.length)]); }
  maxPly = Math.max(maxPly, t.ply);
}
ok(stuck === 0 && maxPly <= N * N * 3, `300 random games all end (longest ${maxPly} moves, bound ${N * N * 3}), no position without a move`);
const playOut = seed => { const rng = C.makeRng(seed), t = C.newState(1); while (!C.isOver(t)) C.applyMove(t, C.botMove(t, 1, rng, false)); return t.moves.join(','); };
ok(playOut(42) === playOut(42), 'same seed gives the same bot game');
// Replay validation
ok(C.replay([0, 0, 0], 1) === null, 'replay rejects an illegal history');
// Puzzles: 60 consecutive days all generate, deterministically, with one clear answer
let made = 0, totalMs = 0, worst = 0;
const d0 = new Date(2026, 10, 6);
for (let i = 0; i < 60; i++) {
  const d = new Date(d0); d.setDate(d.getDate() + i);
  const t0 = Date.now(); const pz = C.makePuzzle(C.dateKey(d)); const dt = Date.now() - t0; totalMs += dt; worst = Math.max(worst, dt);
  if (!pz) continue;
  const st = C.replay(pz.moves, 1); const vals = C.puzzleValues(st);
  const top = vals[0].v, nTop = vals.filter(x => x.v === top).length;
  if (nTop === 1 && vals[0].m === pz.solution && top - vals[1].v >= C.CONFIG.PUZZLE.margin) made++;
}
ok(made === 60, `60 daily puzzles generated with a unique answer (${made}/60, avg ${Math.round(totalMs / 60)} ms, worst ${worst} ms)`);
ok(JSON.stringify(C.makePuzzle('2026-11-06')) === JSON.stringify(C.makePuzzle('2026-11-06')), 'same date gives the same puzzle');
// Review: a deliberately bad move gets flagged
{
  const t = C.newState(1), moves = [];
  const rng = C.makeRng(7);
  while (t.ply < 30) { const m = C.botMove(t, 2, rng, false); C.applyMove(t, m); moves.push(m); }
  // Rust to move at ply 30: pick the worst move by plain value
  const vals = C.puzzleValues(t); const bad = vals[vals.length - 1].m;
  C.applyMove(t, bad); moves.push(bad);
  while (!C.isOver(t)) { const m = C.botMove(t, 2, rng, false); C.applyMove(t, m); moves.push(m); }
  const r = C.reviewGame(moves, 1, 1);
  ok(r.turning && r.recs.length === moves.length, `review finds a turning point (move ${r.turning && r.turning.ply + 1}, planted blunder at move 31, loss ${r.turning && Math.round(r.turning.lossC)})`);
}
// Bot think time (desktop node; phones are slower, the page also caps by time)
for (let L = 0; L < 4; L++) {
  const rng = C.makeRng(5); const t = C.newState(1); let worstMs = 0, sum = 0, n = 0;
  while (!C.isOver(t)) { const t0 = Date.now(); const m = C.botMove(t, L, rng, true); const dt = Date.now() - t0; worstMs = Math.max(worstMs, dt); sum += dt; n++; C.applyMove(t, m); }
  ok(worstMs <= C.CONFIG.LEVELS[L].ms + 40, `${C.CONFIG.LEVELS[L].name}: avg ${Math.round(sum / n)} ms, worst ${worstMs} ms (cap ${C.CONFIG.LEVELS[L].ms})`);
}
ok(C.sanitizeSave({ rules: 1, game: { mode: 'bot', human: 1, level: 0, moves: [0] } }).game === null, 'a game saved under older rules is dropped');
// Save sanitizer
const junk = [null, 5, 'x', [], { game: { mode: 'bot', human: 3, level: 0, moves: [] } }, { stats: { levels: { pebble: { w: -1, l: 2 } } } }, { puzzle: { solved: { 'DROP TABLE': 1 } } }];
ok(junk.every(j => { const o = C.sanitizeSave(j); return o.v === 1 && o.game === null && o.stats.levels.pebble.w === 0 && !o.puzzle.solved['DROP TABLE']; }), 'save sanitizer rejects bad shapes');
console.log(fail ? fail + ' FAILED' : 'ALL PASSED'); process.exit(fail ? 1 : 0);
