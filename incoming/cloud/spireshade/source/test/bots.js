// Bot harness: node bots.js <mode> <a> <b> <games> <seedBase>
// mode self: level a vs itself, reports first-mover win rate.
// mode vs: level a vs level b, alternating who moves first and which color.
const C = require('../src/core.js');
if (process.env.SUN_MODE) C.CONFIG.SUN_MODE = process.env.SUN_MODE;
if (process.env.SUN_OFFSET) C.CONFIG.SUN_OFFSET = +process.env.SUN_OFFSET;
if (process.env.TIEH) C.CONFIG.TIE_HEIGHT = true;
const OPEN = +(process.env.OPEN || 1);
const [mode, a, b, games, seedBase] = [process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5] || 20, +process.argv[6] || 1000];
function play(lv, seed, first) {
  const rng = C.makeRng(seed); const s = C.newState(first);
  // random opening move for variety (first move only) so self-play is not one repeated game
  for (let k = 0; k < OPEN; k++) { const ms = C.legalMoves(s); C.applyMove(s, ms[Math.floor(rng() * ms.length)]); }
  while (!C.isOver(s)) {
    const m = C.botMove(s, lv[C.toMove(s)], rng, false);
    if (!C.isLegal(s, m)) throw new Error('bot illegal');
    C.applyMove(s, m);
    if (s.ply > C.CONFIG.N * C.CONFIG.N * 3) throw new Error('game too long');
  }
  return { w: C.winner(s), c: C.counts(s), ply: s.ply };
}
let firstWins = 0, aWins = 0, ties = 0, plies = [], margins = [];
for (let g = 0; g < games; g++) {
  const first = g % 2 ? 2 : 1;
  let lv;
  if (mode === 'self') lv = { 1: a, 2: a };
  else lv = (Math.floor(g / 2) % 2) ? { 1: a, 2: b } : { 1: b, 2: a }; // a plays both colors, both orders
  const r = play(lv, seedBase + g, first);
  if (r.w === first) firstWins++;
  if (r.c[1] === r.c[2]) ties++;
  const aColor = lv[1] === a ? 1 : 2;
  if (mode === 'vs' && r.w === aColor) aWins++;
  plies.push(r.ply); margins.push(Math.abs(r.c[1] - r.c[2]));
}
const avg = x => (x.reduce((p, q) => p + q, 0) / x.length).toFixed(1);
console.log(JSON.stringify({ sun: C.CONFIG.SUN_MODE + C.CONFIG.SUN_OFFSET, tieH: C.CONFIG.TIE_HEIGHT, open: OPEN, mode, a: C.CONFIG.LEVELS[a].name, b: mode === 'vs' ? C.CONFIG.LEVELS[b].name : null, games,
  firstMoverWinPct: (100 * firstWins / games).toFixed(0), aWinPct: mode === 'vs' ? (100 * aWins / games).toFixed(0) : null,
  ties, avgPly: avg(plies), maxPly: Math.max(...plies), avgMargin: avg(margins) }));
