// ===================== KILNSHOT CORE =====================
// CONFIG + seeded RNG + pure deterministic physics/rules. No DOM in this file.
// Determinism: fixed timestep, only + - * / sqrt in the simulation (no trig),
// launch velocities quantized to integers, iteration order fixed.

const CONFIG = {
  W: 360, H: 640,
  DT: 1 / 240,            // fixed physics step (s)
  G: 800,                 // gravity px/s^2
  MAXV: 1000,             // max launch speed
  POWER: 4.4,             // launch speed per world px of pull
  MIN_PULL: 16,           // pulls shorter than this cancel
  BEAD_R: 7,
  SEG_HALF: 3,            // half thickness of ledges
  MAX_SPEED: 1300,
  BREAK_SPEED: 150,       // impact needed to crack a flawed pot (and a good one!)
  HARD_SPEED: 470,        // impact needed to crack a thick-glazed pot
  FALL_BREAK: 120,        // a falling pot shatters on impacts above this
  PASS_KEEP: 0.72,        // ember keeps this much speed after smashing through
  REL_INHERIT: 0.3,      // released beads inherit this much of the hitter's velocity
  REL_SPREAD: 190,        // ...plus this much radial speed
  REST_SPEED: 24, REST_TIME: 0.45,
  BEAD_LIFE: 8, SHOT_MAX: 12,
  E_STONE: 0.55, F_STONE: 0.05,
  E_PEG: 0.55, E_POT: 0.4,
  SPRING_MIN: 640,        // a reed mat always throws at least this hard
  CLAY_COOL: 0.25,        // stuck embers vanish after this
  LATCH_COOLDOWN: 0.4, LATCH_MIN: 50,
  POT_MASS: 3,
  PREVIEW_T: 0.38,        // seconds of flight the aim preview shows
  EXTRA_EMBERS: 2,        // embers beyond par
  WALL_TOP: -500,
};

// 12 unit directions (precomputed so no trig runs in the sim)
const DIRS = [
  [1, 0], [0.8660254, 0.5], [0.5, 0.8660254], [0, 1], [-0.5, 0.8660254], [-0.8660254, 0.5],
  [-1, 0], [-0.8660254, -0.5], [-0.5, -0.8660254], [0, -1], [0.5, -0.8660254], [0.8660254, -0.5]
];

// mulberry32 seeded RNG
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
function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }

// ---------- world construction ----------
function makeWorld(level) {
  const C = CONFIG;
  const segs = [];
  const frame = level.frame !== false;
  if (frame) {
    segs.push({ x1: 0, y1: C.WALL_TOP, x2: 0, y2: C.H, mat: 'stone', frame: 1 });
    segs.push({ x1: C.W, y1: C.WALL_TOP, x2: C.W, y2: C.H, mat: 'stone', frame: 1 });
    if (!level.pit) segs.push({ x1: 0, y1: 628, x2: C.W, y2: 628, mat: level.floor || 'stone', frame: 1 });
  }
  for (const s of (level.segs || [])) segs.push({ x1: s[0], y1: s[1], x2: s[2], y2: s[3], mat: s[4] || 'stone', gate: s[5] || null });
  const pots = (level.pots || []).map((p, i) => ({
    id: i, x: p.x, y: p.y, r: p.r || 16, kind: p.k === 'k' ? 'keeper' : 'second',
    n: p.n || 0, hard: !!p.hard, cord: p.cord ? { ax: p.cord[0], ay: p.cord[1] } : null,
    dyn: false, vx: 0, vy: 0, rest: 0, broken: false, breaking: false
  }));
  const pegs = (level.pegs || []).map(p => ({ x: p[0], y: p[1], r: p[2] || 8 }));
  const latches = (level.latches || []).map((l, i) => ({ id: i, x: l.x, y: l.y, r: l.r || 10, t: l.t.slice(), cd: 0, flips: 0 }));
  const gates = Object.assign({}, level.gates || {});
  const fans = (level.fans || []).map(f => ({ x: f[0], y: f[1], w: f[2], h: f[3], ax: f[4], ay: f[5] }));
  return {
    level, segs, pots, pegs, latches, gates, fans,
    sling: { x: level.sling[0], y: level.sling[1] },
    beads: [], t: 0, steps: 0, shotT: 0, shots: 0, inShot: false,
    keeperBroken: false, events: [], chain: 0, breakQueue: [], nextBeadId: 1,
  };
}

function secondsLeft(w) { let n = 0; for (const p of w.pots) if (p.kind === 'second' && !p.broken) n++; return n; }
function secondsTotal(w) { let n = 0; for (const p of w.pots) if (p.kind === 'second') n++; return n; }
function embersFor(level) { return level.embers || (level.par + CONFIG.EXTRA_EMBERS); }
function isWon(w) { return !w.keeperBroken && secondsLeft(w) === 0; }

// quantize + clamp a launch vector exactly like the game does
function clampLaunch(vx, vy) {
  vx = Math.round(vx); vy = Math.round(vy);
  const s2 = vx * vx + vy * vy, M = CONFIG.MAXV;
  if (s2 > M * M) { const k = M / Math.sqrt(s2); vx = Math.round(vx * k); vy = Math.round(vy * k); }
  // rounding can push us 1 over; nudge
  while (vx * vx + vy * vy > M * M + 2 * M) { vx -= Math.sign(vx); vy -= Math.sign(vy); }
  return [vx, vy];
}
function pullToLaunch(px, py) { return clampLaunch(-px * CONFIG.POWER, -py * CONFIG.POWER); }

function launch(w, vx, vy) {
  const v = clampLaunch(vx, vy);
  w.beads.push(mkBead(w, w.sling.x, w.sling.y, v[0], v[1], 0));
  w.inShot = true; w.shotT = 0; w.shots++; w.chain = 0;
  w.events.push({ type: 'launch', x: w.sling.x, y: w.sling.y, s: Math.sqrt(v[0] * v[0] + v[1] * v[1]) });
  return v;
}
function mkBead(w, x, y, vx, vy, gen) {
  return { id: w.nextBeadId++, x, y, vx, vy, r: CONFIG.BEAD_R, age: 0, still: 0, stuck: 0, gen, alive: true, lastTouch: -1 };
}

// ---------- geometry helpers ----------
function closestOnSeg(px, py, s) {
  const dx = s.x2 - s.x1, dy = s.y2 - s.y1; const L2 = dx * dx + dy * dy;
  let t = L2 > 0 ? ((px - s.x1) * dx + (py - s.y1) * dy) / L2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
  return [s.x1 + t * dx, s.y1 + t * dy];
}
function segSolid(w, s) { return !s.gate || !!w.gates[s.gate]; }

// bounce body b off a contact normal n with restitution e and tangential friction f
function respond(b, nx, ny, e, f) {
  const vn = b.vx * nx + b.vy * ny;
  if (vn >= 0) return 0;
  const tx = b.vx - vn * nx, ty = b.vy - vn * ny;
  b.vx = tx * (1 - f) - vn * e * nx;
  b.vy = ty * (1 - f) - vn * e * ny;
  return -vn;
}

function applyFields(w, b, dt) {
  let ax = 0, ay = CONFIG.G;
  for (const f of w.fans) if (b.x >= f.x && b.x <= f.x + f.w && b.y >= f.y && b.y <= f.y + f.h) { ax += f.ax; ay += f.ay; }
  b.vx += ax * dt; b.vy += ay * dt;
  const s2 = b.vx * b.vx + b.vy * b.vy, M = CONFIG.MAX_SPEED;
  if (s2 > M * M) { const k = M / Math.sqrt(s2); b.vx *= k; b.vy *= k; }
  b.x += b.vx * dt; b.y += b.vy * dt;
}

// ---------- the step ----------
function step(w) {
  const C = CONFIG, dt = C.DT;
  w.t += dt; w.steps++; w.shotT += dt;
  for (const l of w.latches) if (l.cd > 0) l.cd -= dt;

  for (const b of w.beads) {
    if (!b.alive) continue;
    b.age += dt;
    if (b.stuck > 0) { b.stuck += dt; if (b.stuck > C.CLAY_COOL) b.alive = false; continue; }
    applyFields(w, b, dt);
    // ledges
    for (const s of w.segs) {
      if (!segSolid(w, s)) continue;
      const c = closestOnSeg(b.x, b.y, s);
      let dx = b.x - c[0], dy = b.y - c[1]; const R = b.r + C.SEG_HALF;
      const d2 = dx * dx + dy * dy; if (d2 >= R * R) continue;
      let d = Math.sqrt(d2), nx, ny;
      if (d < 1e-9) { const sx = s.x2 - s.x1, sy = s.y2 - s.y1, L = Math.sqrt(sx * sx + sy * sy); nx = -sy / L; ny = sx / L; d = 0; }
      else { nx = dx / d; ny = dy / d; }
      b.x = c[0] + nx * R; b.y = c[1] + ny * R;
      if (s.mat === 'clay') {
        const imp = -(b.vx * nx + b.vy * ny);
        b.vx = 0; b.vy = 0; b.stuck = dt;
        w.events.push({ type: 'clay', x: b.x, y: b.y, s: imp });
        break;
      } else if (s.mat === 'spring') {
        const imp = respond(b, nx, ny, 1.0, 0);
        if (imp > 0) {
          const vn = b.vx * nx + b.vy * ny; // now positive
          if (vn < C.SPRING_MIN) { b.vx += (C.SPRING_MIN - vn) * nx; b.vy += (C.SPRING_MIN - vn) * ny; }
          w.events.push({ type: 'spring', x: b.x, y: b.y, s: imp });
        }
      } else {
        const imp = respond(b, nx, ny, C.E_STONE, C.F_STONE);
        if (imp > 60) w.events.push({ type: 'tick', x: b.x, y: b.y, s: imp });
      }
    }
    if (!b.alive || b.stuck) continue;
    // stone pegs
    for (const p of w.pegs) {
      const dx = b.x - p.x, dy = b.y - p.y, R = b.r + p.r, d2 = dx * dx + dy * dy;
      if (d2 >= R * R || d2 < 1e-12) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
      b.x = p.x + nx * R; b.y = p.y + ny * R;
      const imp = respond(b, nx, ny, C.E_PEG, C.F_STONE);
      if (imp > 60) w.events.push({ type: 'tick', x: b.x, y: b.y, s: imp });
    }
    // latches
    for (const l of w.latches) {
      const dx = b.x - l.x, dy = b.y - l.y, R = b.r + l.r, d2 = dx * dx + dy * dy;
      if (d2 >= R * R || d2 < 1e-12) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
      b.x = l.x + nx * R; b.y = l.y + ny * R;
      const imp = respond(b, nx, ny, 0.5, 0.05);
      if (imp > C.LATCH_MIN && l.cd <= 0) {
        l.cd = C.LATCH_COOLDOWN; l.flips++;
        for (const g of l.t) w.gates[g] = !w.gates[g];
        dropUnsupported(w);
        w.events.push({ type: 'latch', x: l.x, y: l.y, id: l.id });
      }
    }
    // pots (static and falling)
    for (const p of w.pots) {
      if (p.broken || p.breaking) continue;
      // cords
      if (p.cord) {
        const cs = { x1: p.cord.ax, y1: p.cord.ay, x2: p.x, y2: p.y - p.r };
        const c = closestOnSeg(b.x, b.y, cs); const dx = b.x - c[0], dy = b.y - c[1];
        if (dx * dx + dy * dy < (b.r + 1) * (b.r + 1)) {
          p.cord = null; p.dyn = true; p.vx = 0; p.vy = 0; p.rest = 0;
          w.events.push({ type: 'cut', x: c[0], y: c[1] });
        }
      }
      const dx = b.x - p.x, dy = b.y - p.y, R = b.r + p.r, d2 = dx * dx + dy * dy;
      if (d2 >= R * R || d2 < 1e-12) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
      const rvx = b.vx - p.vx, rvy = b.vy - p.vy;
      const imp = -(rvx * nx + rvy * ny);
      if (imp <= 0) { b.x = p.x + nx * R; b.y = p.y + ny * R; continue; }
      const thr = p.hard ? C.HARD_SPEED : C.BREAK_SPEED;
      if (imp >= thr) {
        queueBreak(w, p, b.vx, b.vy);
        b.vx *= C.PASS_KEEP; b.vy *= C.PASS_KEEP;
      } else {
        b.x = p.x + nx * R; b.y = p.y + ny * R;
        if (!p.dyn) { respond(b, nx, ny, C.E_POT, 0.05); }
        else {
          // two-body exchange, pot is heavier
          const m1 = 1, m2 = C.POT_MASS, j = (1 + C.E_POT) * imp / (1 / m1 + 1 / m2);
          b.vx += j / m1 * nx; b.vy += j / m1 * ny; p.vx -= j / m2 * nx; p.vy -= j / m2 * ny;
        }
        if (imp > 40) w.events.push({ type: 'clink', x: b.x, y: b.y, s: imp, kind: p.kind, id: p.id });
      }
    }
    // lifetime / rest / out of world
    const sp2 = b.vx * b.vx + b.vy * b.vy;
    if (sp2 < C.REST_SPEED * C.REST_SPEED) b.still += dt; else b.still = 0;
    if (b.still > C.REST_TIME || b.age > C.BEAD_LIFE || b.y > C.H + 60 || b.x < -60 || b.x > C.W + 60) b.alive = false;
  }

  // falling pots
  for (const p of w.pots) {
    if (!p.dyn || p.broken || p.breaking) continue;
    applyFields(w, p, dt);
    let hit = 0;
    for (const s of w.segs) {
      if (!segSolid(w, s)) continue;
      const c = closestOnSeg(p.x, p.y, s); let dx = p.x - c[0], dy = p.y - c[1]; const R = p.r + C.SEG_HALF;
      const d2 = dx * dx + dy * dy; if (d2 >= R * R || d2 < 1e-12) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
      p.x = c[0] + nx * R; p.y = c[1] + ny * R;
      const imp = s.mat === 'spring' ? respond(p, nx, ny, 1.0, 0) : respond(p, nx, ny, 0.3, 0.1);
      if (s.mat === 'clay') { p.vx = 0; p.vy = 0; }
      if (imp > hit) hit = imp;
    }
    for (const q of w.pegs) {
      const dx = p.x - q.x, dy = p.y - q.y, R = p.r + q.r, d2 = dx * dx + dy * dy;
      if (d2 >= R * R || d2 < 1e-12) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
      p.x = q.x + nx * R; p.y = q.y + ny * R;
      const imp = respond(p, nx, ny, 0.3, 0.1); if (imp > hit) hit = imp;
    }
    for (const q of w.pots) {
      if (q === p || q.broken || q.breaking) continue;
      const dx = p.x - q.x, dy = p.y - q.y, R = p.r + q.r, d2 = dx * dx + dy * dy;
      if (d2 >= R * R || d2 < 1e-12) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
      const rvx = p.vx - q.vx, rvy = p.vy - q.vy; const imp = -(rvx * nx + rvy * ny);
      if (imp <= 0) continue;
      p.x = q.x + nx * R; p.y = q.y + ny * R;
      const thr = q.hard ? C.HARD_SPEED : C.BREAK_SPEED;
      if (imp >= thr) queueBreak(w, q, p.vx, p.vy);
      if (!q.dyn) respond(p, nx, ny, 0.3, 0.1);
      else { const j = (1.3) * imp / 2; p.vx += j * nx; p.vy += j * ny; q.vx -= j * nx; q.vy -= j * ny; }
      if (imp > hit) hit = imp;
    }
    if (hit >= C.FALL_BREAK) { queueBreak(w, p, p.vx, p.vy); continue; }
    if (p.y > C.H + 80) { // fell out of the world: a lost pot counts as broken (it shattered below)
      queueBreak(w, p, p.vx, p.vy, true); continue;
    }
    const sp2 = p.vx * p.vx + p.vy * p.vy;
    if (sp2 < C.REST_SPEED * C.REST_SPEED) p.rest += dt; else p.rest = 0;
    if (p.rest > C.REST_TIME) { p.dyn = false; p.vx = 0; p.vy = 0; w.events.push({ type: 'settle', x: p.x, y: p.y }); }
  }

  // resolve breaks (in queue order)
  if (w.breakQueue.length) {
    const q = w.breakQueue; w.breakQueue = [];
    for (const br of q) doBreak(w, br);
  }
  // compact dead beads occasionally
  if ((w.steps & 63) === 0 && w.beads.length > 0) w.beads = w.beads.filter(b => b.alive);
}

// pots resting on a door that just swung open start to fall
function dropUnsupported(w) {
  for (const p of w.pots) {
    if (p.broken || p.dyn || p.cord) continue;
    for (const s of w.segs) {
      if (!s.gate || w.gates[s.gate]) continue;
      const c = closestOnSeg(p.x, p.y, s); const dx = p.x - c[0], dy = p.y - c[1];
      if (dy < 0 && dx * dx + dy * dy <= (p.r + CONFIG.SEG_HALF + 1.5) * (p.r + CONFIG.SEG_HALF + 1.5)) { p.dyn = true; p.vx = 0; p.vy = 0; p.rest = 0; break; }
    }
  }
}
function queueBreak(w, p, hvx, hvy, offscreen) {
  if (p.breaking || p.broken) return;
  p.breaking = true;
  w.breakQueue.push({ p, hvx, hvy, off: !!offscreen });
}
function doBreak(w, br) {
  const C = CONFIG, p = br.p;
  p.breaking = false; p.broken = true; p.dyn = false; p.cord = null;
  w.chain++;
  if (p.kind === 'keeper') w.keeperBroken = true;
  w.events.push({ type: 'break', x: p.x, y: p.y, kind: p.kind, chain: w.chain, id: p.id, n: p.n, off: br.off });
  if (p.n > 0 && !br.off) {
    // fountain: beads fan evenly across the upper half-circle, then inherit part of the hit
    for (let i = 0; i < p.n; i++) {
      const ux = p.n === 1 ? 0 : -0.94 + 1.88 * i / (p.n - 1);
      const uy = -Math.sqrt(1 - ux * ux);
      const vx = br.hvx * C.REL_INHERIT + ux * C.REL_SPREAD;
      const vy = br.hvy * C.REL_INHERIT + uy * C.REL_SPREAD;
      w.beads.push(mkBead(w, p.x + ux * p.r * 0.5, p.y + uy * p.r * 0.5, vx, vy, 1));
    }
  }
}

function shotOver(w) {
  if (!w.inShot) return true;
  if (w.shotT > CONFIG.SHOT_MAX) return true;
  if (w.breakQueue.length) return false;
  for (const b of w.beads) if (b.alive) return false;
  for (const p of w.pots) if (p.dyn && !p.broken) return false;
  return true;
}
function endShot(w) {
  w.inShot = false; w.beads = []; w.breakQueue = [];
  for (const p of w.pots) if (p.dyn && !p.broken) { p.dyn = false; p.vx = 0; p.vy = 0; } // freeze anything still sliding at timeout
}

// Run a whole shot to completion. Returns summary.
function runShot(w, vx, vy, onStep) {
  const s0 = secondsLeft(w);
  launch(w, vx, vy);
  let guard = 0;
  while (!shotOver(w) && guard++ < 1e6) { step(w); if (onStep) onStep(w); else w.events.length = 0; }
  endShot(w);
  return { broke: s0 - secondsLeft(w), keeper: w.keeperBroken, left: secondsLeft(w) };
}

// Replay a full attempt from level data
function replay(level, shots) {
  const w = makeWorld(level);
  for (const s of shots) { if (w.keeperBroken || secondsLeft(w) === 0) break; runShot(w, s[0], s[1]); }
  w.events.length = 0;
  return w;
}

// Aim preview: simulate the ember alone from the sling, through one stone bounce, until the next contact or PREVIEW_T.
function preview(w, vx, vy, maxT) {
  const C = CONFIG; const v = clampLaunch(vx, vy);
  const b = { x: w.sling.x, y: w.sling.y, vx: v[0], vy: v[1], r: C.BEAD_R };
  const pts = []; const T = maxT || C.PREVIEW_T; let t = 0, k = 0, bounces = 1;
  while (t < T) {
    applyFields(w, b, C.DT); t += C.DT; k++;
    if ((k % 8) === 0) pts.push([b.x, b.y]);
    let hit = false;
    for (const s of w.segs) {
      if (!segSolid(w, s)) continue;
      const c = closestOnSeg(b.x, b.y, s); let dx = b.x - c[0], dy = b.y - c[1]; const R = b.r + C.SEG_HALF, d2 = dx * dx + dy * dy;
      if (d2 >= R * R) continue;
      // bounce once off plain stone (walls, shelves) so a bank shot shows its line; stop at anything else
      if (bounces > 0 && s.mat === 'stone' && d2 > 0) {
        const d = Math.sqrt(d2); dx /= d; dy /= d; const vn = b.vx * dx + b.vy * dy;
        if (vn < 0) { b.vx -= (1 + C.E_STONE) * vn * dx; b.vy -= (1 + C.E_STONE) * vn * dy; }
        b.x = c[0] + dx * R; b.y = c[1] + dy * R; bounces--; pts.push([b.x, b.y]);
      } else hit = true;
      break;
    }
    if (!hit) for (const p of w.pots) { if (p.broken) continue; const dx = b.x - p.x, dy = b.y - p.y, R = b.r + p.r; if (dx * dx + dy * dy < R * R) { hit = true; break; } }
    if (!hit) for (const p of w.pegs) { const dx = b.x - p.x, dy = b.y - p.y, R = b.r + p.r; if (dx * dx + dy * dy < R * R) { hit = true; break; } }
    if (!hit) for (const p of w.latches) { const dx = b.x - p.x, dy = b.y - p.y, R = b.r + p.r; if (dx * dx + dy * dy < R * R) { hit = true; break; } }
    if (hit) { pts.push([b.x, b.y]); break; }
  }
  return pts;
}

// World snapshot used by Renderer/tests to compare states
function boardKey(w) {
  return w.pots.map(p => p.broken ? 'x' : (Math.round(p.x) + ',' + Math.round(p.y) + (p.cord ? 'c' : ''))).join('|') + '#' + Object.keys(w.gates).sort().map(k => k + (w.gates[k] ? 1 : 0)).join('');
}
function cloneWorld(w) {
  return {
    level: w.level, segs: w.segs, pegs: w.pegs, fans: w.fans, sling: w.sling,
    pots: w.pots.map(p => Object.assign({}, p, { cord: p.cord ? Object.assign({}, p.cord) : null })),
    latches: w.latches.map(l => Object.assign({}, l, { t: l.t })),
    gates: Object.assign({}, w.gates), beads: [], t: w.t, steps: w.steps, shotT: 0, shots: w.shots, inShot: false,
    keeperBroken: w.keeperBroken, events: [], chain: 0, breakQueue: [], nextBeadId: w.nextBeadId,
  };
}

function starsFor(level, shots) { if (shots <= level.par) return 3; if (shots <= level.par + 1) return 2; return 1; }
