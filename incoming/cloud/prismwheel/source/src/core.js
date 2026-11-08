/* Prismwheel core: CONFIG, DATA, State, pure-ish Rules (no drawing, no audio, no DOM).
   Rules mutate the state object and push plain events to state.events for the app to consume. */
(function (root) {
'use strict';

const CONFIG = {
  maxRows: 8,          // a side overflows when a 9th shard lands on it
  coreR: 0.165,        // core apothem, in wheel units (1 unit = half the play area)
  rowH: 0.07,          // shard thickness, in units
  spawnDist: 1.1,      // where shards appear
  step: 1 / 120,       // fixed timestep (s)
  // difficulty: d' = rate / (1 + damp * d), capped. Fast early, flatter late, hard cap.
  diffStart: 1, diffCap: 35, diffRate: 0.13, diffDamp: 0.08,
  speedBase: 0.3, speedPerDiff: 0.0115,      // units per second
  gapBase: 1.55, gapPerDiff: 0.032, gapMin: 0.5, // seconds between waves
  comboWindowBase: 3.4, comboWindowMin: 2.0,     // seconds to keep a combo alive
  matchMin: 3,
  cascadeDelay: 0.17,  // beat between a clear and the chain check
  flareCharge: 24,     // shards cleared to fill the flare
  flarePush: 0.32,     // how far a flare shoves incoming shards back out
  ringBreather: 0.72,  // difficulty multiplier when you climb a ring
  ringUpPause: 1.8,    // seconds of calm after a ring-up
  colors: 4,
};

const DATA = {
  colors: [
    { name: 'coral', hex: '#ff5d73', glyph: 'circle' },
    { name: 'amber', hex: '#ffc23d', glyph: 'triangle' },
    { name: 'mint',  hex: '#3ee6a6', glyph: 'square' },
    { name: 'sky',   hex: '#4cc3ff', glyph: 'diamond' },
  ],
  // Rings: each climb changes the wheel's shape. Quotas grow ~3x (shards cleared inside the ring).
  rings: [
    { name: 'Ring I',   title: 'Six Faces',   sides: 6, quota: 30,  specials: {} },
    { name: 'Ring II',  title: 'Seven Faces', sides: 7, quota: 90,  specials: { prism: 0.045 } },
    { name: 'Ring III', title: 'Eight Faces', sides: 8, quota: 270, specials: { prism: 0.045, stone: 0.05 } },
    { name: 'Crown',    title: 'Endless',     sides: 8, quota: Infinity, specials: { prism: 0.05, stone: 0.07 } },
  ],
  // Wave patterns as data. count may be [min,max]. laneStep: 'rand' | 'opp' | integer (0 = same lane, 'spin' = +1 or -1).
  patterns: [
    { id: 'single', minDiff: 0,  w: 6,   count: 1 },
    { id: 'trio',   minDiff: 3,  w: 0.7, count: 3, laneStep: 0, sameColor: true, delay: 0.32 },
    { id: 'twin',   minDiff: 4,  w: 2.2, count: 2, laneStep: 'rand', delay: 0 },
    { id: 'spiral', minDiff: 6,  w: 1.6, count: [3, 5], laneStep: 'spin', delay: 0.2 },
    { id: 'mirror', minDiff: 9,  w: 1.3, count: 2, laneStep: 'opp', sameColor: true, delay: 0 },
    { id: 'volley', minDiff: 14, w: 1.1, count: 4, laneStep: 0, delay: 0.27 },
    { id: 'storm',  minDiff: 22, w: 0.9, count: [5, 7], laneStep: 'rand', delay: 0.16 },
  ],
  // Death tips (rule 10: every loss teaches something). First matching tip wins.
  tips: [
    { when: s => s.flareReady, text: 'Your flare was full. Tap the core (or Space) to wipe the bottom row of every face.' },
    { when: s => s.stoneOnTop, text: 'Stones only crack when a match touches them. Clear next to them early.' },
    { when: s => s.bestChain < 2 && s.cleared >= 20, text: 'Try a chain: stack a color on top of a different one, then clear underneath it.' },
    { when: s => s.cleared < 12, text: 'Turn first, then look. Park each color next to its twin on the same row.' },
    { when: s => s.ring >= 1, text: 'Seven faces means turns stop lining up with the old habits. Count faces, not directions.' },
    { when: () => true, text: 'Keep one side low as a dump zone for colors you cannot place yet.' },
  ],
};

// ---------- RNG (seeded, serializable) ----------
function rand(st) { // mulberry32
  let t = (st.rngS = (st.rngS + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }

// ---------- State ----------
function newState(opts) {
  opts = opts || {};
  const ring = DATA.rings[0];
  const st = {
    v: 1, mode: opts.mode || 'classic', seed: (opts.seed >>> 0) || 1, rngS: (opts.seed >>> 0) || 1,
    t: 0, diff: CONFIG.diffStart, ringIdx: 0, ringCleared: 0, sides: ring.sides, rot: 0,
    grid: [], falling: [], queue: [], pending: [], bag: [],
    nextWaveAt: 0.4, score: 0, combo: 0, comboT: 0, chain: 0,
    flare: 0, flareUnlocked: false, ringUpT: 0, over: false, nextId: 1,
    stats: { cleared: 0, bestChain: 0, bestCombo: 0, landed: 0, turns: 0, flares: 0, biggest: 0 },
    events: [],
  };
  for (let i = 0; i < st.sides; i++) st.grid.push([]);
  return st;
}
function serialize(st) { const c = Object.assign({}, st); delete c.events; return JSON.stringify(c); }
function load(json) {
  const st = JSON.parse(json);
  if (!st || st.v !== 1 || !Array.isArray(st.grid) || st.grid.length !== st.sides) throw new Error('bad save');
  st.events = []; return st;
}

// ---------- Derived numbers ----------
const speed = st => CONFIG.speedBase + Math.min(st.diff, CONFIG.diffCap) * CONFIG.speedPerDiff;
const waveGap = st => Math.max(CONFIG.gapMin, CONFIG.gapBase - st.diff * CONFIG.gapPerDiff);
const comboWindow = st => CONFIG.comboWindowBase - (CONFIG.comboWindowBase - CONFIG.comboWindowMin) * Math.min(1, st.diff / CONFIG.diffCap);
const landDist = (st, s) => CONFIG.coreR + st.grid[s].length * CONFIG.rowH;
const sideForLane = (st, lane) => ((lane - st.rot) % st.sides + st.sides) % st.sides;
const ring = st => DATA.rings[st.ringIdx];

// ---------- Spawning ----------
function drawColor(st) {
  if (!st.bag.length) { for (let c = 0; c < CONFIG.colors; c++) st.bag.push(c, c); for (let i = st.bag.length - 1; i > 0; i--) { const j = Math.floor(rand(st) * (i + 1)); [st.bag[i], st.bag[j]] = [st.bag[j], st.bag[i]]; } }
  return st.bag.pop();
}
function drawKind(st) {
  const sp = ring(st).specials, r = rand(st);
  if (sp.stone && r < sp.stone) return 'stone';
  if (sp.prism && r < (sp.stone || 0) + sp.prism) return 'prism';
  return 'shard';
}
function pickPattern(st) {
  const ok = DATA.patterns.filter(p => st.diff >= p.minDiff);
  let tot = 0; for (const p of ok) tot += p.w;
  let r = rand(st) * tot;
  for (const p of ok) { r -= p.w; if (r <= 0) return p; }
  return ok[0];
}
function queueWave(st) {
  const p = pickPattern(st), n = st.sides;
  const count = Array.isArray(p.count) ? p.count[0] + Math.floor(rand(st) * (p.count[1] - p.count[0] + 1)) : p.count;
  let lane = Math.floor(rand(st) * n);
  const dir = rand(st) < 0.5 ? -1 : 1;
  const color = drawColor(st);
  const used = new Set();
  for (let i = 0; i < count; i++) {
    if (i > 0) {
      if (p.laneStep === 'rand') { let tries = 0; do { lane = Math.floor(rand(st) * n); } while (used.has(lane) && ++tries < 8); }
      else if (p.laneStep === 'opp') lane = (lane + Math.floor(n / 2)) % n;
      else if (p.laneStep === 'spin') lane = (lane + dir + n) % n;
      else lane = (lane + (p.laneStep || 0) + n) % n;
    }
    used.add(lane);
    const kind = p.sameColor ? 'shard' : drawKind(st);
    st.queue.push({ at: st.t + i * (p.delay || 0), lane, c: p.sameColor ? color : drawColor(st), kind });
  }
  st.nextWaveAt = st.t + (count - 1) * (p.delay || 0) + waveGap(st);
  st.events.push({ type: 'wave', id: p.id });
}

// ---------- Matching ----------
function matches(b, color) { return b.kind === 'prism' || (b.kind === 'shard' && b.c === color); }
function groupFrom(st, s, r) {
  const g = st.grid, n = st.sides, start = g[s][r];
  if (!start || start.kind === 'stone') return [];
  const colors = start.kind === 'prism' ? [0, 1, 2, 3] : [start.c];
  let best = [];
  for (const color of colors) {
    const seen = new Set([s + ':' + r]), out = [], stack = [[s, r]];
    while (stack.length) {
      const [cs, cr] = stack.pop(); out.push([cs, cr]);
      const nb = [[cs, cr - 1], [cs, cr + 1], [(cs + 1) % n, cr], [(cs - 1 + n) % n, cr]];
      for (const [ns, nr] of nb) {
        const k = ns + ':' + nr; if (seen.has(k)) continue;
        const b = g[ns][nr]; if (!b || !matches(b, color)) continue;
        seen.add(k); stack.push([ns, nr]);
      }
    }
    // a group needs at least one real shard unless it is all prisms
    if (out.length > best.length) best = out;
  }
  return best;
}

// Remove cells, crack touching stones, compact, schedule chain checks. Returns removed info.
function removeCells(st, cells, gen, why) {
  const g = st.grid, n = st.sides, kill = new Set();
  for (const [s, r] of cells) kill.add(s + ':' + r);
  if (why !== 'flare') for (const [s, r] of cells) {
    for (const [ns, nr] of [[s, r - 1], [s, r + 1], [(s + 1) % n, r], [(s - 1 + n) % n, r]]) {
      const b = g[ns] && g[ns][nr]; if (b && b.kind === 'stone') kill.add(ns + ':' + nr);
    }
  }
  const removed = [], minRow = new Array(n).fill(Infinity);
  for (const k of kill) { const [s, r] = k.split(':').map(Number); const b = g[s][r]; removed.push({ s, r, c: b.c, kind: b.kind, id: b.id }); if (r < minRow[s]) minRow[s] = r; }
  const moved = [];
  for (let s = 0; s < n; s++) {
    if (minRow[s] === Infinity) continue;
    g[s] = g[s].filter((b, r) => !kill.has(s + ':' + r));
    for (let r = minRow[s]; r < g[s].length; r++) moved.push(g[s][r].id);
  }
  if (moved.length) st.pending.push({ at: st.t + CONFIG.cascadeDelay, ids: moved, gen: gen + 1 });
  return removed;
}

function scoreClear(st, removed, gen) {
  const size = removed.length;
  st.comboT > 0 ? st.combo++ : (st.combo = 1);
  st.comboT = comboWindow(st);
  const base = size * 10 + Math.max(0, size - 3) * 25;
  const mult = (1 + 0.5 * (st.combo - 1)) * gen;
  const clutch = removed.some(c => c.r >= CONFIG.maxRows - 2);
  const pts = Math.round(base * mult) + (clutch ? 100 * gen : 0);
  st.score += pts; if (clutch) st.stats.clutches = (st.stats.clutches || 0) + 1;
  st.ringCleared += size; st.stats.cleared += size;
  st.stats.bestChain = Math.max(st.stats.bestChain, gen);
  st.stats.bestCombo = Math.max(st.stats.bestCombo, st.combo);
  st.stats.biggest = Math.max(st.stats.biggest, size);
  const wasReady = st.flare >= 1;
  st.flare = Math.min(1, st.flare + size / CONFIG.flareCharge);
  if (st.flare >= 1 && !wasReady) { const first = !st.flareUnlocked; st.flareUnlocked = true; st.events.push({ type: 'flareReady', first }); }
  st.events.push({ type: 'clear', cells: removed, pts, combo: st.combo, chain: gen, size, clutch });
  checkRingUp(st);
}

function checkRingUp(st) {
  const r = ring(st);
  if (st.ringCleared < r.quota || st.ringIdx >= DATA.rings.length - 1) return;
  // shatter everything for a bonus, then reshape the wheel
  let shattered = [];
  for (let s = 0; s < st.sides; s++) for (let i = 0; i < st.grid[s].length; i++) shattered.push({ s, r: i, c: st.grid[s][i].c, kind: st.grid[s][i].kind });
  const bonus = (shattered.length * 15 + 250) * (st.ringIdx + 1);
  st.score += bonus;
  const oldSides = st.sides;
  st.ringIdx++; st.ringCleared = 0;
  st.sides = ring(st).sides; st.rot = 0;
  st.grid = []; for (let i = 0; i < st.sides; i++) st.grid.push([]);
  const fallingOut = st.falling.map(f => ({ lane: f.lane, d: f.d, c: f.c, kind: f.kind }));
  st.falling = []; st.queue = []; st.pending = [];
  st.diff = Math.max(CONFIG.diffStart, st.diff * CONFIG.ringBreather);
  st.ringUpT = CONFIG.ringUpPause; st.nextWaveAt = st.t + CONFIG.ringUpPause + 0.3;
  st.events.push({ type: 'ringup', ring: st.ringIdx, bonus, shattered, oldSides, fallingOut });
}

// ---------- Actions ----------
function rotate(st, dir) {
  if (st.over || st.ringUpT > 0.6) return false;
  st.rot = ((st.rot + dir) % st.sides + st.sides) % st.sides;
  st.stats.turns++;
  st.events.push({ type: 'rot', dir });
  return true;
}
function flare(st) {
  if (st.over || st.flare < 1) return false;
  const cells = [];
  for (let s = 0; s < st.sides; s++) if (st.grid[s].length) cells.push([s, 0]);
  st.flare = 0; st.stats.flares++;
  for (const f of st.falling) f.d = Math.min(CONFIG.spawnDist, f.d + CONFIG.flarePush);
  const removed = cells.length ? removeCells(st, cells, 1, 'flare') : [];
  const pts = removed.length * 20; st.score += pts;
  st.ringCleared += removed.length; st.stats.cleared += removed.length;
  st.events.push({ type: 'flare', cells: removed, pts });
  checkRingUp(st);
  return true;
}

// ---------- Step ----------
function step(st, dt) {
  if (st.over) return st;
  st.t += dt;
  if (st.ringUpT > 0) { st.ringUpT = Math.max(0, st.ringUpT - dt); }
  else st.diff = Math.min(CONFIG.diffCap, st.diff + dt * CONFIG.diffRate / (1 + CONFIG.diffDamp * st.diff));
  if (st.comboT > 0) { st.comboT -= dt; if (st.comboT <= 0) { st.comboT = 0; if (st.combo > 1) st.events.push({ type: 'comboEnd', combo: st.combo }); st.combo = 0; } }

  if (st.ringUpT <= 0 && st.t >= st.nextWaveAt) queueWave(st);
  for (let i = st.queue.length - 1; i >= 0; i--) {
    const q = st.queue[i];
    if (q.at <= st.t) { st.queue.splice(i, 1); st.falling.push({ id: st.nextId++, lane: q.lane, c: q.c, kind: q.kind, d: CONFIG.spawnDist }); st.events.push({ type: 'spawn', lane: q.lane }); }
  }

  // move falling shards; land when they reach their side's stack
  const v = speed(st) * dt;
  for (let i = 0; i < st.falling.length; i++) {
    const f = st.falling[i];
    f.d -= v;
    const s = sideForLane(st, f.lane);
    if (f.d <= landDist(st, s)) {
      st.falling.splice(i--, 1);
      const row = st.grid[s].length;
      if (row >= CONFIG.maxRows) { gameOver(st, s, f); return st; }
      const b = { id: f.id, c: f.c, kind: f.kind };
      st.grid[s].push(b); st.stats.landed++;
      st.events.push({ type: 'land', s, r: row, id: b.id, c: b.c, kind: b.kind, danger: row >= CONFIG.maxRows - 2 });
      const grp = groupFrom(st, s, row);
      if (grp.length >= CONFIG.matchMin) scoreClear(st, removeCells(st, grp, 1, 'match'), 1);
      if (st.ringUpT > 0) return st;
    }
  }

  // chain checks after clears
  for (let i = 0; i < st.pending.length; i++) {
    const p = st.pending[i];
    if (p.at > st.t) continue;
    st.pending.splice(i--, 1);
    let cleared = false;
    for (const id of p.ids) {
      const pos = findId(st, id); if (!pos) continue;
      const grp = groupFrom(st, pos[0], pos[1]);
      if (grp.length >= CONFIG.matchMin) { scoreClear(st, removeCells(st, grp, p.gen, 'chain'), p.gen); cleared = true; if (st.ringUpT > 0) return st; }
    }
    if (!cleared && p.gen > 1) st.chain = 0;
  }
  return st;
}
function findId(st, id) { for (let s = 0; s < st.sides; s++) { const r = st.grid[s].findIndex(b => b.id === id); if (r >= 0) return [s, r]; } return null; }

function gameOver(st, s, f) {
  st.over = true;
  let stoneOnTop = false;
  for (const col of st.grid) if (col.length && col[col.length - 1].kind === 'stone') stoneOnTop = true;
  st.events.push({ type: 'over', s, lane: f.lane, c: f.c });
  st.summary = { score: st.score, ring: st.ringIdx, cleared: st.stats.cleared, bestChain: st.stats.bestChain, bestCombo: st.stats.bestCombo, flareReady: st.flare >= 1, stoneOnTop, time: st.t };
}
function tipFor(sum) { for (const t of DATA.tips) if (t.when(sum)) return t.text; return ''; }
function maxHeight(st) { let m = 0; for (const c of st.grid) m = Math.max(m, c.length); return m; }

const Prism = { CONFIG, DATA, newState, serialize, load, step, rotate, flare, groupFrom, sideForLane, landDist, speed, waveGap, comboWindow, tipFor, maxHeight, hashStr, rand, ring };
if (typeof module !== 'undefined') module.exports = Prism; else root.Prism = Prism;
})(typeof window !== 'undefined' ? window : globalThis);
