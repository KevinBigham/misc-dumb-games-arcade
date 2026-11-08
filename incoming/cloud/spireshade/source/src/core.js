/* ===== Spireshade core: CONFIG, DATA, RNG, Rules (pure), AI, Review, Puzzle =====
   No DOM in this file. Shared by the game page and the node test harness. */
'use strict';

const CONFIG = {
  N: 5,                 // board is N x N. 25 squares: odd, so a full board can never tie
  MAXH: 3,              // tallest a spire can grow
  RULES_VERSION: 2,     // v1 was a 6x6 test board
  SUN_MODE: 'round',    // 'round': sun turns every two moves; 'ply': every move
  SUN_OFFSET: 0,        // 1 = the sun first turns after Rust's opening move, so Indigo casts first in each new direction
  TIE_GOES_TO: 2,       // unreachable on an odd board; kept as a safe fallback
  TIE_HEIGHT: false,    // tested: barely changes results, so the simpler rule stays. if true, equal spire count is first broken by total height
  // Bot strengths. nodes = search budget (deterministic), ms = phone safety cap.
  LEVELS: [
    { id: 'pebble', name: 'Pebble', blurb: 'Learning the rules', depth: 1, nodes: 400,    noise: 2.6, ms: 120 },
    { id: 'cairn',  name: 'Cairn',  blurb: 'Grabs what it sees',  depth: 2, nodes: 3000,   noise: 0.7, ms: 220 },
    { id: 'spire',  name: 'Spire',  blurb: 'Thinks a few moves',  depth: 3, nodes: 20000,  noise: 0.15, ms: 380 },
    { id: 'summit', name: 'Summit', blurb: 'Plays to win',        depth: 10, nodes: 150000, noise: 0,   ms: 650 }
  ],
  EVAL: { piece: 10, h2: 3, h3: 6, edge: 1, corner: 2, exposed: 2.5 },
  PUZZLE: { minPly: 10, maxPly: 26, tries: 200, margin: 2 },
  REVIEW: { nodes: 6000, depth: 3 }
};

// Shadow directions in sun order. Sun sits opposite the shadow.
// round r = floor(ply/2); shadow dir = DIRS[r % 4]
const DIRS = [
  { dx: -1, dy: 0, name: 'west',  sun: 'east'  },
  { dx: 0, dy: -1, name: 'north', sun: 'south' },
  { dx: 1, dy: 0,  name: 'east',  sun: 'west'  },
  { dx: 0, dy: 1,  name: 'south', sun: 'north' }
];

const DATA = {
  players: {
    1: { name: 'Rust',   glyph: 'dot'  },
    2: { name: 'Indigo', glyph: 'ring' }
  },
  coach: [
    'Tap an empty square to place a spire. Tap it again to confirm.',
    'Tap one of your own spires to raise it. Taller spires throw longer shadows.',
    'Shorter rival spires caught in your shadow turn to your color.',
    'A spire as tall as yours blocks the shadow. Height 3 can never be taken.',
    'The sun turns a quarter every round. Watch where the next shadows fall.'
  ]
};

/* ---------- seeded RNG (mulberry32) ---------- */
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

/* ---------- State ---------- */
// owner[i]: 0 empty, 1 Rust, 2 Indigo. height[i]: 0..3. ply counts moves made.
function newState(firstPlayer) {
  const n = CONFIG.N * CONFIG.N;
  return { owner: new Int8Array(n), height: new Int8Array(n), ply: 0, first: firstPlayer || 1, moves: [] };
}
function toMove(s) { return (s.ply % 2 === 0) ? s.first : 3 - s.first; }
function shadowDir(ply) {
  if (CONFIG.SUN_MODE === 'ply') return DIRS[ply % 4];
  return DIRS[Math.floor((ply + CONFIG.SUN_OFFSET) / 2) % 4];
}
// First ply after `ply` at which the shadow direction changes.
function nextShiftPly(ply) {
  if (CONFIG.SUN_MODE === 'ply') return ply + 1;
  let q = ply + 1; while ((q + CONFIG.SUN_OFFSET) % 2 !== 0) q++; return q;
}
function cloneState(s) {
  return { owner: Int8Array.from(s.owner), height: Int8Array.from(s.height), ply: s.ply, first: s.first, moves: s.moves.slice() };
}
function emptyCount(s) { let c = 0; for (let i = 0; i < s.owner.length; i++) if (!s.owner[i]) c++; return c; }
function isOver(s) { return emptyCount(s) === 0; }
function counts(s) {
  const c = { 1: 0, 2: 0, h1: 0, h2: 0 };
  for (let i = 0; i < s.owner.length; i++) { const o = s.owner[i]; if (o) { c[o]++; c['h' + o] += s.height[i]; } }
  return c;
}
function winner(s) {
  if (!isOver(s)) return 0;
  const c = counts(s);
  if (c[1] !== c[2]) return c[1] > c[2] ? 1 : 2;
  if (CONFIG.TIE_HEIGHT && c.h1 !== c.h2) return c.h1 > c.h2 ? 1 : 2;
  return CONFIG.TIE_GOES_TO;
}

/* ---------- Rules (pure-ish: legal + preview are pure, apply/undo mutate for search speed) ---------- */
function legalMoves(s) {
  const p = toMove(s), out = [];
  if (isOver(s)) return out;
  for (let i = 0; i < s.owner.length; i++) {
    if (!s.owner[i] || (s.owner[i] === p && s.height[i] < CONFIG.MAXH)) out.push(i);
  }
  return out;
}
function isLegal(s, cell) {
  if (!Number.isInteger(cell) || cell < 0 || cell >= s.owner.length || isOver(s)) return false;
  const p = toMove(s);
  return !s.owner[cell] || (s.owner[cell] === p && s.height[cell] < CONFIG.MAXH);
}
// Cells the shadow covers and which get flipped, without changing state.
function shadowOf(s, cell, heightAfter, p, ply) {
  const N = CONFIG.N, d = shadowDir(ply);
  let x = cell % N, y = (cell / N) | 0;
  const cover = [], flips = [];
  let blockedAt = -1;
  for (let k = 1; k <= heightAfter; k++) {
    x += d.dx; y += d.dy;
    if (x < 0 || y < 0 || x >= N || y >= N) break;
    const c = y * N + x;
    if (s.owner[c] && s.height[c] >= heightAfter) { blockedAt = c; break; }
    cover.push(c);
    if (s.owner[c] && s.owner[c] !== p) flips.push(c);
  }
  return { cover, flips, blockedAt, dir: d };
}
function preview(s, cell) {
  if (!isLegal(s, cell)) return null;
  const p = toMove(s);
  const kind = s.owner[cell] ? 'raise' : 'place';
  const h = kind === 'raise' ? s.height[cell] + 1 : 1;
  const sh = shadowOf(s, cell, h, p, s.ply);
  return { cell, kind, height: h, player: p, cover: sh.cover, flips: sh.flips, blockedAt: sh.blockedAt, dir: sh.dir };
}
// Mutating apply. Returns an undo record.
function applyMove(s, cell) {
  const p = toMove(s);
  const wasEmpty = !s.owner[cell];
  if (wasEmpty) { s.owner[cell] = p; s.height[cell] = 1; } else { s.height[cell]++; }
  const sh = shadowOf(s, cell, s.height[cell], p, s.ply);
  for (const c of sh.flips) s.owner[c] = p;
  s.ply++;
  s.moves.push(cell);
  return { cell, wasEmpty, flips: sh.flips, p };
}
function undoMove(s, u) {
  s.ply--; s.moves.pop();
  for (const c of u.flips) s.owner[c] = 3 - u.p;
  if (u.wasEmpty) { s.owner[u.cell] = 0; s.height[u.cell] = 0; } else { s.height[u.cell]--; }
}
// Pure step: returns new state (for UI and tests).
function step(s, cell) {
  if (!isLegal(s, cell)) throw new Error('Illegal move ' + cell);
  const t = cloneState(s); const u = applyMove(t, cell); return { state: t, undo: u };
}
function replay(moves, first) {
  let s = newState(first);
  for (const m of moves) { if (!isLegal(s, m)) return null; applyMove(s, m); }
  return s;
}
function cellName(i) { const N = CONFIG.N; return 'ABCDEFGH'[i % N] + (N - ((i / N) | 0)); }

/* ---------- Evaluation (from side p) ---------- */
const POS_W = (function () {
  const N = CONFIG.N, w = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) {
    const x = i % N, y = (i / N) | 0;
    const ex = x === 0 || x === N - 1, ey = y === 0 || y === N - 1;
    w[i] = (ex && ey) ? CONFIG.EVAL.corner : (ex || ey) ? CONFIG.EVAL.edge : 0;
  }
  return w;
})();
// Rough threat count: how many of p's pieces the next mover could flip with one raise.
function evaluate(s, p) {
  const E = CONFIG.EVAL;
  if (isOver(s)) {
    const w = winner(s), c = counts(s);
    const diff = c[p] - c[3 - p];
    return (w === p ? 10000 : -10000) + diff * 50;
  }
  let v = 0;
  const o = s.owner, h = s.height;
  for (let i = 0; i < o.length; i++) {
    if (!o[i]) continue;
    const val = E.piece + (h[i] === 2 ? E.h2 : h[i] === 3 ? E.h3 : 0) + POS_W[i];
    v += o[i] === p ? val : -val;
  }
  // Exposure: pieces the side to move could take next turn (cheap one-ply scan).
  const mover = toMove(s);
  let best = 0;
  for (let i = 0; i < o.length; i++) {
    if (o[i] !== mover || h[i] >= CONFIG.MAXH) continue;
    const sh = shadowOf(s, i, h[i] + 1, mover, s.ply);
    if (sh.flips.length > best) best = sh.flips.length;
  }
  v += (mover === p ? 1 : -1) * best * E.exposed;
  return v;
}

/* ---------- Search: negamax alpha-beta with iterative deepening ---------- */
function orderMoves(s, moves) {
  const p = toMove(s);
  const scored = moves.map(m => {
    const h = s.owner[m] ? s.height[m] + 1 : 1;
    const f = shadowOf(s, m, h, p, s.ply).flips.length;
    return { m, k: f * 10 + (s.owner[m] ? 2 : 0) + POS_W[m] };
  });
  scored.sort((a, b) => b.k - a.k);
  return scored.map(x => x.m);
}
function search(s, opts) {
  const maxDepth = opts.depth || 3, nodeCap = opts.nodes || 1e9, msCap = opts.ms || 1e9;
  const now = (typeof performance !== 'undefined' && performance.now) ? () => performance.now() : () => Date.now();
  const t0 = now();
  let nodes = 0, aborted = false;
  const p0 = toMove(s);
  function nega(depth, alpha, beta) {
    nodes++;
    if ((nodes & 255) === 0 && now() - t0 > msCap) aborted = true;
    if (nodes > nodeCap) aborted = true;
    const me = toMove(s);
    if (depth === 0 || isOver(s)) return evaluate(s, me);
    const moves = orderMoves(s, legalMoves(s));
    let best = -Infinity;
    for (const m of moves) {
      const u = applyMove(s, m);
      const v = -nega(depth - 1, -beta, -alpha);
      undoMove(s, u);
      if (aborted) return best === -Infinity ? v : best;
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    return best;
  }
  let rootMoves = orderMoves(s, legalMoves(s));
  let bestScores = null, completedDepth = 0;
  for (let d = 1; d <= maxDepth; d++) {
    const scores = [];
    let alpha = -Infinity;
    for (const m of rootMoves) {
      const u = applyMove(s, m);
      const v = -nega(d - 1, -Infinity, opts.full ? Infinity : -alpha);
      undoMove(s, u);
      if (aborted) break;
      scores.push({ m, v });
      if (v > alpha) alpha = v;
    }
    if (aborted && d > 1) break;
    if (scores.length === rootMoves.length) {
      bestScores = scores; completedDepth = d;
      scores.sort((a, b) => b.v - a.v);
      rootMoves = scores.map(x => x.m);   // principal move first next iteration
    } else if (!bestScores) { bestScores = scores.sort((a, b) => b.v - a.v); completedDepth = d; }
    if (aborted) break;
  }
  return { scores: bestScores || [], depth: completedDepth, nodes, player: p0 };
}
// Exact root values (no root alpha cutoff), for review and puzzles.
function rootValues(s, depth, nodes) {
  return search(s, { depth, nodes: nodes || 1e9, full: true });
}

/* ---------- Bot move choice ---------- */
function botMove(s, levelIndex, rng, timeCap) {
  const L = CONFIG.LEVELS[levelIndex];
  const moves = legalMoves(s);
  if (moves.length === 1) return moves[0];
  const res = search(s, { depth: L.depth, nodes: L.nodes, ms: timeCap === false ? 1e9 : L.ms, full: L.noise > 0 });
  let list = res.scores;
  if (!list.length) return moves[0];
  if (L.noise > 0) {
    // Noise is scaled in "pieces" (E.piece units). Higher noise = more mistakes.
    const scale = L.noise * CONFIG.EVAL.piece;
    let bestM = list[0].m, bestV = -Infinity;
    for (const x of list) {
      const v = x.v + (rng() - 0.5) * 2 * scale;
      if (v > bestV) { bestV = v; bestM = x.m; }
    }
    return bestM;
  }
  return list[0].m;
}

/* ---------- Post-game review ---------- */
// Engine value of the best move vs the played move, from the mover's view. Does not change s.
function reviewPly(s, move, opts) {
  opts = opts || {};
  const nodes = opts.nodes || CONFIG.REVIEW.nodes, depth = opts.depth || CONFIG.REVIEW.depth;
  const p = toMove(s);
  const rec = { ply: s.ply, player: p, move, best: move, bestV: 0, playedV: 0, loss: 0 };
  if (!isOver(s) && legalMoves(s).length > 1) {
    const r = search(s, { depth, nodes, full: true });
    const best = r.scores[0];
    const played = r.scores.find(x => x.m === move);
    if (best) { rec.best = best.m; rec.bestV = best.v; }
    rec.playedV = played ? played.v : rec.bestV;
    rec.loss = Math.max(0, rec.bestV - rec.playedV);
  }
  return rec;
}
function finishRec(s, rec) {
  const c = counts(s);
  rec.diff = c[1] - c[2];
  rec.evalRust = isOver(s) ? (winner(s) === 1 ? 999 : -999) : evaluate(s, 1);
  return rec;
}
// The reviewed player's biggest drop. Decided-game scores are clamped so a lost
// endgame does not drown out the real mistake that lost it.
function turningPoint(recs, reviewFor) {
  let t = null;
  for (const r of recs) {
    if (r.player !== reviewFor || !r.loss) continue;
    const l = Math.min(r.loss, 400);
    if (!t || l > t.lossC) t = Object.assign({}, r, { lossC: l });
  }
  return t;
}
function reviewGame(moves, first, reviewFor, opts) {
  const s = newState(first), recs = [];
  for (const m of moves) { const rec = reviewPly(s, m, opts); applyMove(s, m); recs.push(finishRec(s, rec)); }
  return { recs, turning: turningPoint(recs, reviewFor) };
}

/* ---------- Save validation ---------- */
function dateKey(d) {
  d = d || new Date();
  const z = n => (n < 10 ? '0' : '') + n;
  return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
}
function freshSave() {
  const levels = {};
  for (const L of CONFIG.LEVELS) levels[L.id] = { w: 0, l: 0, best: 0 };
  return {
    v: 1, settings: { sound: true, oneTap: false, nums: true },
    game: null, stats: { levels, pvp: 0 },
    puzzle: { solved: {}, streak: 0, last: '', best: 0, practice: 0 },
    coach: 0, nextHuman: 1, level: 0, rules: CONFIG.RULES_VERSION
  };
}
const isInt = (x, lo, hi) => Number.isInteger(x) && x >= lo && x <= hi;
// Accepts anything; always returns a valid save. Bad parts fall back to defaults.
function sanitizeSave(raw) {
  const out = freshSave();
  if (!raw || typeof raw !== 'object') return out;
  const st = raw.settings;
  if (st && typeof st === 'object') for (const k of ['sound', 'oneTap', 'nums']) if (typeof st[k] === 'boolean') out.settings[k] = st[k];
  if (raw.stats && raw.stats.levels && typeof raw.stats.levels === 'object') {
    for (const L of CONFIG.LEVELS) {
      const r = raw.stats.levels[L.id];
      if (r && isInt(r.w, 0, 1e6) && isInt(r.l, 0, 1e6)) out.stats.levels[L.id] = { w: r.w, l: r.l, best: isInt(r.best, 0, 36) ? r.best : 0 };
    }
    if (isInt(raw.stats.pvp, 0, 1e6)) out.stats.pvp = raw.stats.pvp;
  }
  const pz = raw.puzzle;
  if (pz && typeof pz === 'object') {
    if (pz.solved && typeof pz.solved === 'object') for (const k of Object.keys(pz.solved).slice(-400)) if (/^\d{4}-\d{2}-\d{2}$/.test(k)) out.puzzle.solved[k] = 1;
    if (isInt(pz.streak, 0, 1e5)) out.puzzle.streak = pz.streak;
    if (isInt(pz.best, 0, 1e5)) out.puzzle.best = pz.best;
    if (isInt(pz.practice, 0, 1e6)) out.puzzle.practice = pz.practice;
    if (typeof pz.last === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(pz.last)) out.puzzle.last = pz.last;
  }
  if (isInt(raw.coach, 0, 99)) out.coach = raw.coach;
  if (raw.nextHuman === 1 || raw.nextHuman === 2) out.nextHuman = raw.nextHuman;
  if (isInt(raw.level, 0, CONFIG.LEVELS.length - 1)) out.level = raw.level;
  const g = raw.game;
  if (raw.rules === CONFIG.RULES_VERSION && g && typeof g === 'object' && Array.isArray(g.moves) && g.moves.length <= 120 && g.moves.every(m => isInt(m, 0, CONFIG.N * CONFIG.N - 1))
      && (g.mode === 'bot' || g.mode === 'pvp') && (g.human === 1 || g.human === 2) && isInt(g.level, 0, CONFIG.LEVELS.length - 1)) {
    const s = replay(g.moves, 1);
    if (s) out.game = { mode: g.mode, human: g.human, level: g.level, moves: g.moves.slice(), casual: !!g.casual, recorded: !!g.recorded,
      startPly: isInt(g.startPly, 0, 120) ? g.startPly : 0 };
  }
  return out;
}

/* ---------- Daily puzzle ---------- */
// Value of a move for puzzles: spire lead after your rival's best single reply (plain count).
function puzzleValues(s) {
  const me = toMove(s), out = [];
  for (const m of legalMoves(s)) {
    const u = applyMove(s, m);
    let worst = Infinity, worstR = -1;
    if (isOver(s)) { const c = counts(s); worst = c[me] - c[3 - me]; }
    else {
      for (const r of legalMoves(s)) {
        const u2 = applyMove(s, r);
        const c = counts(s);
        const v = c[me] - c[3 - me];
        undoMove(s, u2);
        if (v < worst) { worst = v; worstR = r; }
      }
    }
    undoMove(s, u);
    out.push({ m, v: worst, reply: worstR });
  }
  out.sort((a, b) => b.v - a.v);
  return out;
}
function makePuzzle(seedStr) {
  const P = CONFIG.PUZZLE;
  const base = hashString(seedStr);
  for (let attempt = 0; attempt < P.tries; attempt++) {
    const rng = makeRng(base + attempt * 7919);
    const first = 1;   // Rust always moves first; side to move varies with ply
    const s = newState(first);
    const target = P.minPly + Math.floor(rng() * (P.maxPly - P.minPly + 1));
    let ok = true;
    while (s.ply < target) {
      if (isOver(s)) { ok = false; break; }
      // Mixed-strength self-play so positions look like real games.
      const lvl = rng() < 0.25 ? 1 : 0;
      applyMove(s, botMove(s, lvl, rng, false));
    }
    if (!ok || isOver(s)) continue;
    const vals = puzzleValues(s);
    if (vals.length < 2) continue;
    const before = counts(s), me = toMove(s);
    const nowLead = before[me] - before[3 - me];
    const top = vals[0].v;
    const solutions = vals.filter(x => x.v === top).map(x => x.m);
    const second = vals.find(x => x.v < top);
    if (solutions.length > 1) continue;                    // one clear answer
    if (!second || top - second.v < P.margin) continue;    // clearly better than the rest
    if (top - nowLead < 2) continue;                       // it must actually win spires
    const pv = preview(s, solutions[0]);
    if (!pv || pv.flips.length < 2) continue;
    return {
      seed: seedStr, attempt, moves: s.moves.slice(), first,
      solution: solutions[0], value: top, nowLead, reply: vals[0].reply,
      secondBest: second.v
    };
  }
  return null;
}

const SpireCore = {
  CONFIG, DATA, DIRS, makeRng, hashString, newState, toMove, shadowDir, nextShiftPly, cloneState, emptyCount,
  isOver, counts, winner, legalMoves, isLegal, preview, applyMove, undoMove, step, replay, cellName,
  evaluate, search, rootValues, botMove, reviewPly, finishRec, turningPoint, reviewGame, puzzleValues, makePuzzle,
  dateKey, freshSave, sanitizeSave
};
if (typeof module !== 'undefined') module.exports = SpireCore;
