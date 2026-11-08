/* ===== Lanewake rules: CONFIG, DATA, RNG, pure race simulation, save validation =====
   No DOM, no audio, no clocks. The caller feeds inputs with exact timestamps (seconds of sim time)
   and steps the race up to each timestamp, so judgments never depend on frame rate. */
(function (G) {
'use strict';
const RULES_VERSION = 3;

const CONFIG = {
  POOL: 25,               // metres per length (short course)
  DT: 1 / 120,            // fixed sim step
  DRAG: 0.32,             // surface drag k in dv/dt = thrust - k v^2
  DRAG_UW: 0.235,         // streamline drag underwater
  MIN_V: 0.25,            // you always drift forward a little (no soft lock)
  PULL_DUR: 0.22,         // a stroke's thrust is spread over this long
  WIN: { pEarly: 0.05, pLate: 0.06, gEarly: 0.11, gLate: 0.15 }, // timing windows (s)
  HOLD_T: 0.17,           // press held this long = breathe (surface) or break out (underwater)
  SYNC_T: 0.085,          // two pads within this = one two-hand press
  TANK_REGEN: 0.9,        // energy per second
  BONK_AT: 20,            // below this, strokes weaken
  O2_LOW: 35,             // below this, every stroke costs more energy
  O2_SURF_REGEN: 22,      // per second on the surface for strokes that breathe every cycle
  UW_LIMIT: 15,           // metres from the wall you must be up by
  UW_DRIFT_T: 1.15,       // no kick for this long -> you drift up
  UW_FIRST_KICK: 0.32,    // glide after push-off before the first kick is ready
  TURN_ZONE: 3.3,         // flip turns can be called from here
  FLIP_IDEAL: 1.9,        // distance from wall for a clean flip (the T on the floor is at 2 m)
  REACH: 0.95,            // touch range (turn touch / finish)
  AUTO_FLIP_AT: 0.35,
  DIVE_DIST: 3.4, DIVE_T: 0.8, DIVE_V: 2.85, BACK_PUSH_V: 2.2,
  FLIP_PUSH_V: 2.5, OPEN_PUSH_V: 2.3,
  STAND_T: 1.0, MARK_MIN: 1.15, MARK_SPAN: 0.8, LATE_START: 1.6,
  FLOW_AT: 8, FLOW_BONUS: 1.03,
  DNF_FACTOR: 2.6,
  GHOST_DT: 0.1,
  TIERS: [1.20, 1.14, 1.10, 1.07, 1.045, 1.025],
  RECALL_MAX_TIER: 1,     // tiers 0-1: a false start is recalled, from tier 2 it is a DQ
  ASSIST_WALL_Q: 0.9,     // one-thumb auto walls are good, never perfect // field pace vs the reference swimmer
};

/* Stroke data. J = speed added per perfect stroke (m/s), R = arm recovery (s) before the next stroke is ready. */
const STROKES = {
  free:   { name: 'Freestyle', short: 'FREE',  pattern: 'alt',   R: 0.62, J: 0.640, pushR: 0.80, pushJ: 1.04, cost: 0.55, pushCost: 3.8, o2: 9,  breath: true,  turn: 'flip', uwJ: 0.40, uwR: 0.42, uwMax: 99, uwO2: 4.5 },
  back:   { name: 'Backstroke', short: 'BACK', pattern: 'alt',   R: 0.66, J: 0.590, pushR: 0.81, pushJ: 1.04, cost: 0.55, pushCost: 3.7, o2: 0,  breath: false, turn: 'flip', uwJ: 0.38, uwR: 0.43, uwMax: 99, uwO2: 4.5, flags: true },
  breast: { name: 'Breaststroke', short: 'BRST', pattern: 'phase', phases: [ { key: 'pull', R: 0.34, J: 0.30 }, { key: 'kick', R: 0.70, J: 0.58 } ], pushR: 0.84, pushJ: 1.03, cost: 0.62, pushCost: 3.5, o2: 0, breath: false, turn: 'open', uwJ: 0.62, uwR: 0.62, uwMax: 2, uwO2: 6 },
  fly:    { name: 'Butterfly', short: 'FLY',   pattern: 'sync',  R: 0.84, J: 0.880, pushR: 0.82, pushJ: 1.04, cost: 0.95, pushCost: 3.4, o2: 13, breath: true,  turn: 'open', uwJ: 0.42, uwR: 0.41, uwMax: 99, uwO2: 4.5 },
};
const IM_ORDER = ['fly', 'back', 'breast', 'free'];

/* Fictional field. Names are invented. */
const ROSTER = [
  { name: 'Pip Harrow',     club: 'Saltmarsh Otters', cap: '#ff6b6b', spec: 'free',   style: 'flyer'  },
  { name: 'Juno Lark',      club: 'Cobalt Cove',      cap: '#ffd166', spec: 'back',   style: 'even'   },
  { name: 'Rafe Linwater',  club: 'Northgate Gulls',  cap: '#06d6a0', spec: 'breast', style: 'closer' },
  { name: 'Kit Brightwell', club: 'Harbor Lights',    cap: '#c77dff', spec: 'fly',    style: 'flyer'  },
  { name: 'Odessa Fenn',    club: 'Riverbend Pike',   cap: '#ff9f1c', spec: 'free',   style: 'closer' },
  { name: 'Bram Kettleby',  club: 'Ironwood Seals',   cap: '#8ecae6', spec: 'back',   style: 'even'   },
  { name: 'Nia Corral',     club: 'Glasswater',       cap: '#f15bb5', spec: 'fly',    style: 'even'   },
  { name: 'Sol Marrow',     club: 'Dunmore Herons',   cap: '#bde0fe', spec: 'breast', style: 'flyer'  },
  { name: 'Wren Tidewell',  club: 'Copper Reef',      cap: '#90be6d', spec: 'free',   style: 'even'   },
  { name: 'Dax Holloway',   club: 'Stonebridge',      cap: '#f9844a', spec: 'free',   style: 'closer' },
  { name: 'Mika Ashgrove',  club: 'Lakeshore Loons',  cap: '#43aa8b', spec: 'back',   style: 'closer' },
  { name: 'Tamsin Quell',   club: 'Bluefen',          cap: '#e9c46a', spec: 'fly',    style: 'closer' },
];

/* Reference times (s) for a solid, well-paced swimmer: calibrated by the bot harness (test/calibrate.js). */
const PAR = { // good-bot reference (test/calibrate.js, Round 1), evened across events in Round 2 so no event is a free medal
  'free-50': 24.1, 'free-100': 48.6, 'free-200': 97.7,
  'back-50': 26.1, 'back-100': 51.4, 'back-200': 103.0,
  'breast-50': 27.6, 'breast-100': 58.4,
  'fly-50': 25.15, 'fly-100': 51.9,
  'im-100': 53.9, 'im-200': 107.9,
};

const MODS = {
  none:   { name: 'Standard pool', desc: 'Nothing special today.', drag: 1, cost: 1, field: 1 },
  fast:   { name: 'Deep fast pool', desc: 'Calm, deep water. Everyone glides a bit more.', drag: 0.97, cost: 1, field: 0.985 },
  warm:   { name: 'Warm water', desc: 'Strokes cost 12% more energy. Pace it.', drag: 1, cost: 1.12, field: 1 },
  stacked:{ name: 'Stacked heat', desc: 'The field is 2% faster than usual.', drag: 1, cost: 1, field: 0.98 },
};

/* Championship ladder: content as data. Each rung is one final; top 3 advances. */
const LADDER = [
  { id: 'c1',  meet: 'Splashdown Time Trial',  ev: 'free-50',   tier: 0, note: 'Learn the rhythm. Top 3 moves you on.' },
  { id: 'c2',  meet: 'Splashdown Time Trial',  ev: 'free-100',  tier: 0, note: 'Three walls. Flip at the T.' },
  { id: 'c3',  meet: 'Cobalt Cove Invite',     ev: 'back-50',   tier: 1, note: 'Backstroke unlocked. Count strokes from the flags.' },
  { id: 'c4',  meet: 'Cobalt Cove Invite',     ev: 'free-200',  tier: 1, note: 'Eight lengths. Save the push for the end.' },
  { id: 'c5',  meet: 'Riverbend Classic',      ev: 'breast-50', tier: 2, note: 'Breaststroke unlocked. Pull, kick, glide.' },
  { id: 'c6',  meet: 'Riverbend Classic',      ev: 'back-100',  tier: 2, note: 'Long underwaters, but watch your air.' },
  { id: 'c7',  meet: 'Northgate Conference',   ev: 'fly-50',    tier: 3, note: 'Butterfly unlocked. Both hands, every time.' },
  { id: 'c8',  meet: 'Northgate Conference',   ev: 'free-100',  tier: 3, note: 'A real field now. Clean walls win it.' },
  { id: 'c9',  meet: 'Glasswater State',       ev: 'im-100',    tier: 4, note: 'Individual medley unlocked: fly, back, breast, free.' },
  { id: 'c10', meet: 'Glasswater State',       ev: 'breast-100',tier: 4, note: 'Pull, kick, glide, for four lengths.' },
  { id: 'c11', meet: 'Summit Championships',   ev: 'free-200',  tier: 5, note: 'The final. Negative split or bust.' },
  { id: 'c12', meet: 'Summit Championships',   ev: 'im-200',    tier: 5, note: 'Eight lengths, four strokes. The crown.' },
];
// The season rival: in every ladder final from Cobalt Cove on, always lane 4, always a touch quicker than the middle of the field.
const RIVAL = 11, RIVAL_FROM = 2, RIVAL_SPREAD = -0.017;
// Pool records: the target past the ladder. Fictional holders; times sit just under the reference swimmer.
const RECORD_HOLDERS = ['Ines Varga', 'Teodor Brann', 'Lua Okonjo', 'Halden Pryce', 'Mara Quist', 'Ovid Saltry'];
const RECORDS = {};
// times: best expert-bot swim (20 ms timing spread, best pacing found by search) + 0.6%, so only near-flawless play breaks them
const RECORD_T = { 'free-50': 23.75, 'free-100': 47.72, 'free-200': 97.33, 'back-50': 26.19, 'back-100': 51.05, 'back-200': 101.43, 'breast-50': 27.58, 'breast-100': 58.55, 'fly-50': 24.79, 'fly-100': 51.02, 'im-100': 53.54, 'im-200': 108.65 };
for (const k of Object.keys(RECORD_T)) RECORDS[k] = { time: RECORD_T[k], holder: RECORD_HOLDERS[hashStr(k) % RECORD_HOLDERS.length] };
const UNLOCK_AT = { back: 'c3', breast: 'c5', fly: 'c7', im: 'c9' }; // stroke becomes free to race once you reach that rung

const EVENTS = ['free-50', 'free-100', 'free-200', 'back-50', 'back-100', 'back-200', 'breast-50', 'breast-100', 'fly-50', 'fly-100', 'im-100', 'im-200'];

/* ---------- seeded RNG (mulberry32), state lives in the race ---------- */
function rngNext(r) {
  let t = (r.s = (r.s + 0x6D2B79F5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

function parseEvent(key) {
  const [stroke, d] = String(key).split('-');
  const dist = +d;
  if (!(stroke in STROKES) && stroke !== 'im') return null;
  if (![50, 100, 200].includes(dist)) return null;
  const laps = dist / CONFIG.POOL;
  const legs = [];
  for (let i = 0; i < laps; i++) legs.push(stroke === 'im' ? IM_ORDER[Math.floor(i * 4 / laps)] : stroke);
  return { key, stroke, dist, laps, legs, name: (stroke === 'im' ? 'IM' : STROKES[stroke].name) };
}
function eventLabel(key) { const e = parseEvent(key); if (!e) return key; return e.dist + ' ' + (e.stroke === 'im' ? 'IM' : STROKES[e.stroke].name); }

/* ---------- field ---------- */
function makeOppSplits(total, laps, style, r) {
  const base = total / laps;
  const w = [];
  for (let i = 0; i < laps; i++) w.push(i === 0 ? base - 1.3 : base + 1.3 / Math.max(1, laps - 1));
  const a = style === 'flyer' ? 0.035 : style === 'closer' ? -0.02 : 0;
  for (let i = 0; i < laps; i++) {
    const f = laps === 1 ? 0 : (i / (laps - 1)) * 2 - 1; // -1..1
    w[i] *= (1 + a * f) * (1 + (rngNext(r) - 0.5) * 0.016);
  }
  const s = w.reduce((x, y) => x + y, 0);
  const cum = []; let c = 0;
  for (let i = 0; i < laps; i++) { c += w[i] * total / s; cum.push(c); }
  return cum;
}
function makeField(ev, tier, modKey, r, rival) {
  const tierF = CONFIG.TIERS[Math.max(0, Math.min(CONFIG.TIERS.length - 1, tier | 0))];
  const mod = MODS[modKey] || MODS.none;
  const par = PAR[ev.key];
  const idx = ROSTER.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rngNext(r) * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const spreads = [-0.026, -0.012, 0.0, 0.013, 0.027];
  for (let i = spreads.length - 1; i > 0; i--) { const j = Math.floor(rngNext(r) * (i + 1)); [spreads[i], spreads[j]] = [spreads[j], spreads[i]]; }
  const lanes = [1, 2, 4, 5, 6];
  if (rival) { const at = idx.indexOf(RIVAL); [idx[2], idx[at]] = [idx[at], idx[2]]; } // rival into lane 4
  const opps = [];
  for (let k = 0; k < 5; k++) {
    const R = ROSTER[idx[k]];
    const isR = rival && idx[k] === RIVAL;
    let f = tierF * mod.field * (1 + (isR ? RIVAL_SPREAD : spreads[k]) + (rngNext(r) - 0.5) * 0.006);
    if (R.spec === ev.stroke) f *= 0.985;
    const total = par * f;
    const rt = 0.6 + rngNext(r) * 0.16;
    opps.push({ name: R.name, club: R.club, cap: R.cap, style: R.style, rival: !!isR, lane: lanes[k], rt, splits: makeOppSplits(total, ev.laps, R.style, r), finish: total, rate: 0.9 + rngNext(r) * 0.2 });
  }
  return opps;
}
/* Opponent distance (0..dist) at race time t (seconds since the beep). */
function oppPos(o, t, ev) {
  if (t <= o.rt) return 0;
  const sp = o.splits, L = CONFIG.POOL;
  if (t >= sp[sp.length - 1]) return ev.dist;
  let i = 0; while (t > sp[i]) i++;
  const t0 = i === 0 ? o.rt : sp[i - 1];
  const f = (t - t0) / (sp[i] - t0);
  const g = 1 - Math.pow(1 - f, 1.22); // quick off the wall, steady into it
  return i * L + L * g;
}

/* ---------- race ---------- */
function createRace(opts) {
  const ev = parseEvent(opts.event);
  if (!ev) throw new Error('bad event ' + opts.event);
  const seed = (opts.seed >>> 0) || 1;
  const r = { s: seed };
  const modKey = MODS[opts.mod] ? opts.mod : 'none';
  const race = {
    v: RULES_VERSION, seed, ev, mod: modKey, tier: opts.tier | 0, assist: !!opts.assist,
    t: 0, rng: r, beepT: 0, over: false, ev_: [], par: PAR[ev.key],
    opps: null, p: null,
  };
  race.beepT = CONFIG.STAND_T + CONFIG.MARK_MIN + rngNext(r) * CONFIG.MARK_SPAN;
  race.opps = makeField(ev, race.tier, modKey, r, !!opts.rival);
  race.p = {
    phase: 'stand', standUntil: CONFIG.STAND_T, lap: 0, lx: 0, v: 0, thr: [],
    lastStrokeT: 0, readyT: 0, nextArm: 'L', phaseIdx: 0, pend: null,
    tank: 100, o2: 100, push: false, flow: 0, bonked: false,
    down: { L: null, R: null }, lastPress: null,
    uw: null, turn: null, dive: null,
    rt: null, finish: null, finishLabel: '', dq: null,
    nextGhostT: 0, ghost: [],
    log: {
      splits: [], grades: { perfect: 0, good: 0, rush: 0, late: 0, crossed: 0, lopsided: 0 },
      kicks: { perfect: 0, good: 0, rush: 0, late: 0 }, turns: [], breakouts: [], breaths: 0, gasps: 0,
      pushTime: 0, recalls: 0, bonkAt: null, tankMin: 100, strokes: [], maxFlow: 0, events: [],
    },
  };
  return race;
}
function emit(race, e) { e.t = race.t; race.ev_.push(e); }
function note(race, txt) { race.p.log.events.push({ t: +(race.t - race.beepT).toFixed(2), x: +xOf(race).toFixed(1), txt }); }
function xOf(race) { return race.p.lap * CONFIG.POOL + race.p.lx; }
function strokeKey(race, lap) { const L = race.ev.legs; return L[Math.min(L.length - 1, lap)]; }
function strokeDef(race) { return STROKES[strokeKey(race, race.p.lap)]; }
function isFinalLap(race) { return race.p.lap >= race.ev.laps - 1; }
function turnKindFor(race) {
  const a = strokeKey(race, race.p.lap), b = strokeKey(race, race.p.lap + 1);
  if (a !== b) return 'open';
  return STROKES[a].turn;
}
function wallDist(race) { return CONFIG.POOL - race.p.lx; }
function modDef(race) { return MODS[race.mod] || MODS.none; }

function gradeTiming(dt) {
  const W = CONFIG.WIN;
  if (dt < -W.gEarly) return 'rush';
  if (dt < -W.pEarly) return 'good';
  if (dt <= W.pLate) return 'perfect';
  if (dt <= W.gLate) return 'good';
  return 'late';
}
function gradeFactor(g, frac) {
  switch (g) {
    case 'rush': return { f: 0.85 * frac * frac, cm: 1.7 };
    case 'good': return { f: 0.94, cm: 1.08 };
    case 'perfect': return { f: 1, cm: 1 };
    default: return { f: 0.95, cm: 1 };
  }
}
function bonkFactor(p) {
  if (p.tank <= 0) return 0.62;
  if (p.tank < CONFIG.BONK_AT) return 0.8 + 0.2 * (p.tank / CONFIG.BONK_AT);
  return 1;
}
function spendTank(race, cost) {
  const p = race.p;
  p.tank = Math.max(0, p.tank - cost);
  if (p.tank < p.log.tankMin) p.log.tankMin = p.tank;
  if (p.tank <= 0 && !p.bonked) { p.bonked = true; p.log.bonkAt = +xOf(race).toFixed(1); emit(race, { k: 'bonk' }); note(race, 'Tank empty'); }
  if (p.tank > 8) p.bonked = false;
}

function setPush(race, on) {
  const p = race.p;
  if (p.phase === 'done' || p.phase === 'dq' || p.phase === 'dnf') return;
  p.push = !!on; emit(race, { k: 'push', on: p.push });
}

/* ---- starts ---- */
// rookie meets (and assist mode) call everyone back instead of disqualifying: a new beep, nothing lost but a moment
function recall(race) {
  const p = race.p, C = CONFIG;
  p.log.recalls++; note(race, 'False start: recalled');
  p.phase = 'stand'; p.standUntil = race.t + C.STAND_T;
  race.beepT = p.standUntil + C.MARK_MIN + rngNext(race.rng) * C.MARK_SPAN;
  p.nextGhostT = 0; p.ghost = [];
  emit(race, { k: 'recall' });
}
function startOff(race, late) {
  const p = race.p, C = CONFIG;
  const rt = race.t - race.beepT;
  p.rt = +rt.toFixed(3); race.p.log.rt = p.rt;
  let q = rt <= 0.62 ? 1 : Math.max(0.78, 1 - (rt - 0.62) * 0.55);
  if (late) q = 0.72;
  const first = strokeKey(race, 0);
  emit(race, { k: 'start', rt: p.rt, late: !!late });
  if (first === 'back') { p.lx = 0.2; enterUW(race, C.BACK_PUSH_V * q); }
  else { p.phase = 'dive'; p.dive = { t0: race.t, dur: C.DIVE_T, x0: 0, x1: C.DIVE_DIST, q }; }
}
function enterUW(race, v0) {
  const p = race.p;
  p.phase = 'uw'; p.v = v0; p.thr = [];
  p.uw = { start: race.t, kicks: 0, lastKick: race.t, readyT: race.t + CONFIG.UW_FIRST_KICK, fromLap: p.lap };
  emit(race, { k: 'enter' });
}
function kick(race, side) {
  const p = race.p, S = strokeDef(race), u = p.uw;
  if (u.kicks >= S.uwMax) { emit(race, { k: 'nokick' }); return; }
  const dt = race.t - u.readyT;
  const g = gradeTiming(dt);
  const span = Math.max(0.05, u.readyT - u.lastKick);
  const frac = Math.max(0, Math.min(1, (race.t - u.lastKick) / span));
  const gf = gradeFactor(g, frac);
  const imp = S.uwJ * gf.f * bonkFactor(p);
  p.thr.push({ a: imp / CONFIG.PULL_DUR, end: race.t + CONFIG.PULL_DUR });
  p.o2 = Math.max(0, p.o2 - S.uwO2);
  spendTank(race, 0.35 * gf.cm * modDef(race).cost);
  u.kicks++; u.lastKick = race.t; u.readyT = race.t + S.uwR;
  p.log.kicks[g === 'rush' ? 'rush' : g]++;
  emit(race, { k: 'kick', g, side });
}
function breakout(race, why) {
  const p = race.p, S = strokeDef(race);
  const lx = p.lx;
  p.log.breakouts.push({ lap: p.lap, m: +lx.toFixed(1), why });
  if (why === 'limit') { p.v *= 0.86; note(race, '15 m mark: forced up'); }
  if (why === 'drift') note(race, 'Drifted up at ' + lx.toFixed(1) + ' m');
  p.phase = 'swim'; p.uw = null;
  // breakout stroke: fixed, slightly weaker than a perfect stroke
  const J = S.pattern === 'phase' ? S.phases[0].J : S.J;
  const imp = J * 0.88 * bonkFactor(p);
  p.thr.push({ a: imp / CONFIG.PULL_DUR, end: race.t + CONFIG.PULL_DUR });
  p.lastStrokeT = race.t;
  p.phaseIdx = S.pattern === 'phase' ? 1 : 0;
  const R = S.pattern === 'phase' ? S.phases[0].R : S.R;
  p.readyT = race.t + R * (p.push ? S.pushR : 1);
  p.nextArm = 'R';
  p.lastPress = null;
  emit(race, { k: 'breakout', why, m: +lx.toFixed(1) });
}

/* ---- surface strokes ---- */
function curR(race, S) {
  const p = race.p;
  const base = S.pattern === 'phase' ? S.phases[p.phaseIdx].R : S.R;
  return base * (p.push ? S.pushR : 1) * (p.tank <= 0 ? 1.12 : 1);
}
function stroke(race, side, clean) {
  const p = race.p, S = strokeDef(race), mod = modDef(race);
  const t = race.t;
  let crossed = false;
  const expected = p.nextArm;
  if (S.pattern === 'alt' && !race.assist && side !== 'B' && side !== expected) crossed = true;
  const dt = t - p.readyT;
  let g = gradeTiming(dt);
  const span = Math.max(0.05, p.readyT - p.lastStrokeT);
  const frac = Math.max(0, Math.min(1, (t - p.lastStrokeT) / span));
  const gf = gradeFactor(g, frac);
  let f = gf.f, cm = gf.cm;
  if (crossed) { g = 'crossed'; f *= 0.45; cm *= 1.4; }
  if (g === 'perfect') { p.flow++; if (p.flow > p.log.maxFlow) p.log.maxFlow = p.flow; } else p.flow = 0;
  const flowB = p.flow >= CONFIG.FLOW_AT ? CONFIG.FLOW_BONUS : 1;
  let gasp = false;
  if (S.breath && p.o2 <= 0) { gasp = true; f *= 0.25; p.v *= 0.82; p.o2 = 60; p.log.gasps++; spendTank(race, 4); note(race, 'Out of air: gasped'); }
  let J = S.pattern === 'phase' ? S.phases[p.phaseIdx].J : S.J;
  if (p.push) J *= S.pushJ;
  let imp = J * f * bonkFactor(p) * flowB;
  let cost = S.cost * (p.push ? S.pushCost : 1) * cm * (p.o2 < CONFIG.O2_LOW ? 1.4 : 1) * mod.cost;
  // two-hand strokes: a lone pad is lopsided unless the other lands within SYNC_T (upgrade below)
  let pend = null;
  if ((S.pattern === 'sync' || S.pattern === 'phase') && !clean && !race.assist) {
    pend = { t, side, full: imp, cost, g, until: t + CONFIG.SYNC_T, idx: p.log.strokes.length };
    imp *= 0.6; cost *= 1.25;
  }
  p.thr.push({ a: imp / CONFIG.PULL_DUR, end: t + CONFIG.PULL_DUR });
  spendTank(race, cost);
  if (S.breath) p.o2 = Math.max(0, p.o2 - S.o2 * (p.push ? 1.2 : 1));
  p.lastStrokeT = t;
  if (S.pattern === 'phase') p.phaseIdx = (p.phaseIdx + 1) % S.phases.length;
  p.readyT = t + curR(race, S);
  if (S.pattern === 'alt') { const used = (side === 'B' || race.assist) ? expected : side; p.nextArm = used === 'L' ? 'R' : 'L'; }
  p.log.strokes.push({ t: +(t - race.beepT).toFixed(3), lap: p.lap, g: pend ? 'lopsided' : g, dt: +dt.toFixed(3) });
  if (pend) { p.pend = pend; p.log.grades.lopsided++; }
  else { p.log.grades[g]++; emit(race, { k: 'stroke', g, side, dt: +dt.toFixed(3), flow: p.flow, gasp }); }
  p.lastPress = { t, side, kind: 'stroke' };
}
function upgradeSync(race) {
  const p = race.p, pd = p.pend;
  const add = pd.full * 0.4;
  p.thr.push({ a: add / CONFIG.PULL_DUR, end: race.t + CONFIG.PULL_DUR });
  p.tank = Math.min(100, p.tank + pd.cost * 0.2);
  p.log.grades.lopsided--; p.log.grades[pd.g]++;
  p.log.strokes[pd.idx].g = pd.g;
  if (pd.g === 'perfect') { /* flow already counted at press */ }
  emit(race, { k: 'stroke', g: pd.g, side: 'B', dt: p.log.strokes[pd.idx].dt, flow: p.flow });
  p.pend = null;
}
function breath(race) {
  const p = race.p;
  p.o2 = 100; p.v *= 0.965; p.log.breaths++;
  emit(race, { k: 'breath' });
}

/* ---- walls ---- */
function flip(race, auto) {
  const p = race.p, C = CONFIG;
  const d = wallDist(race);
  let q, label;
  if (auto) { q = 0.6; label = 'Jammed the wall'; }
  else if (race.assist) { q = C.ASSIST_WALL_Q; label = 'Assist flip'; }
  else {
    const e = Math.abs(d - C.FLIP_IDEAL);
    q = e <= 0.3 ? 1 : Math.max(0.6, 1 - (e - 0.3) * 0.5);
    label = e <= 0.3 ? 'Clean flip' : d > C.FLIP_IDEAL ? 'Flipped early' : 'Flipped late';
  }
  const dur = auto ? 0.9 : 0.55 + (d > C.FLIP_IDEAL ? (d - C.FLIP_IDEAL) / 1.1 : (C.FLIP_IDEAL - d) * 0.4);
  p.phase = 'turn'; p.thr = []; p.pend = null;
  p.turn = { t0: race.t, dur, x0: p.lx, kind: 'flip', q, label, pushV: C.FLIP_PUSH_V * q };
  p.log.turns.push({ lap: p.lap, kind: 'flip', d: +d.toFixed(2), q: +q.toFixed(2), label });
  emit(race, { k: 'turn', kind: 'flip', q, label, d });
}
function touchTurn(race, auto) {
  const p = race.p, C = CONFIG;
  const d = wallDist(race);
  const q = auto ? 0.85 : race.assist ? CONFIG.ASSIST_WALL_Q : (d >= 0.1 && d <= 0.8 ? 1 : 0.92);
  const label = auto ? 'Glided into the wall' : q === 1 ? 'Clean touch' : 'Touch';
  const dur = auto ? 0.95 : 0.75 + d * 0.45;
  p.phase = 'turn'; p.thr = []; p.pend = null;
  p.turn = { t0: race.t, dur, x0: p.lx, kind: 'open', q, label, pushV: C.OPEN_PUSH_V * q };
  p.log.turns.push({ lap: p.lap, kind: 'open', d: +d.toFixed(2), q: +q.toFixed(2), label });
  emit(race, { k: 'turn', kind: 'open', q, label, d });
}
function finish(race, auto) {
  const p = race.p;
  const d = Math.max(0, wallDist(race));
  let add, label;
  if (auto) { add = 0.15; label = 'Glided in'; }
  else {
    const short = race.t - p.readyT < -0.18;
    add = d * 0.2 + (short ? 0.12 : 0);
    label = short ? 'Short touch (mid-stroke)' : d >= 0.3 ? 'Lunge touch!' : 'Touch';
  }
  p.finish = +(race.t - race.beepT + add).toFixed(2);
  p.finishLabel = label;
  p.phase = 'done'; p.thr = []; p.pend = null;
  p.lx = CONFIG.POOL;
  const L = p.log;
  L.splits.push(p.finish);
  L.finishTouch = label;
  race.over = true;
  emit(race, { k: 'finish', time: p.finish, label });
}

/* ---- input entry point: caller must have stepped the race to ev.t first ---- */
function raceInput(race, e) {
  const p = race.p;
  if (race.t + 1e-9 < e.t) stepTo(race, e.t);
  if (e.type === 'up') {
    if (e.side === 'B') { p.down.L = null; p.down.R = null; } else p.down[e.side] = null;
    return;
  }
  const side = e.side;
  const rec = { t: race.t, phase: p.phase, used: false };
  if (side === 'B') { p.down.L = rec; p.down.R = { ...rec, used: true }; } else p.down[side] = rec;
  switch (p.phase) {
    case 'stand': rec.used = true; return;
    case 'marks':
      rec.used = true;
      if (race.tier <= CONFIG.RECALL_MAX_TIER || race.assist) { recall(race); return; }
      p.phase = 'dq'; p.dq = 'False start'; race.over = true; note(race, 'Moved before the beep');
      emit(race, { k: 'dq', why: 'False start' }); return;
    case 'set': rec.used = true; startOff(race, false); return;
    case 'dive': case 'turn': case 'done': case 'dq': case 'dnf': rec.used = true; return;
    case 'uw': {
      const lp = p.lastPress;
      if (lp && lp.kind === 'kick' && lp.side !== side && race.t - lp.t <= CONFIG.SYNC_T) { rec.used = true; return; } // second hand of the same kick
      kick(race, side); p.lastPress = { t: race.t, side, kind: 'kick' }; return;
    }
    case 'swim': {
      const S = strokeDef(race), d = wallDist(race);
      const finalWall = isFinalLap(race);
      if (finalWall && d <= CONFIG.REACH) { rec.used = true; finish(race, false); return; }
      if (!finalWall) {
        const tk = turnKindFor(race);
        if (tk === 'open' && d <= CONFIG.REACH) { rec.used = true; touchTurn(race, false); return; }
        if (tk === 'flip' && d <= CONFIG.TURN_ZONE) {
          if (side === 'B') { rec.used = true; flip(race, false); return; }
          const lp = p.lastPress;
          if (lp && lp.kind === 'stroke' && lp.side !== side && lp.side !== 'B' && race.t - lp.t <= CONFIG.SYNC_T) {
            // two thumbs in the flip zone = flip; undo most of the stroke the first thumb started
            p.tank = Math.min(100, p.tank + S.cost * 0.6);
            rec.used = true; flip(race, false); return;
          }
        }
      }
      if (p.pend && side !== p.pend.side && race.t <= p.pend.until) { rec.used = true; upgradeSync(race); return; }
      stroke(race, side, side === 'B');
      return;
    }
  }
}

/* ---- simulation step ---- */
function physics(race, dt, uw) {
  const p = race.p, mod = modDef(race);
  let a = 0;
  for (let i = p.thr.length - 1; i >= 0; i--) {
    const th = p.thr[i];
    if (race.t >= th.end) { p.thr.splice(i, 1); continue; }
    a += th.a;
  }
  const k = (uw ? CONFIG.DRAG_UW : CONFIG.DRAG) * mod.drag;
  p.v += (a - k * p.v * p.v) * dt;
  if (p.v < CONFIG.MIN_V) p.v = CONFIG.MIN_V;
  p.lx += p.v * dt;
  p.tank = Math.min(100, p.tank + CONFIG.TANK_REGEN * dt);
  if (p.push) p.log.pushTime += dt;
}
function stepRace(race, dt) {
  const p = race.p, C = CONFIG;
  const t1 = race.t + dt;
  race.t = t1;
  switch (p.phase) {
    case 'stand': if (race.t >= p.standUntil) { p.phase = 'marks'; emit(race, { k: 'marks' }); } break;
    case 'marks': if (race.t >= race.beepT) { race.t = Math.max(race.t, race.beepT); p.phase = 'set'; emit(race, { k: 'beep' }); } break;
    case 'set': if (race.t >= race.beepT + C.LATE_START) startOff(race, true); break;
    case 'dive': {
      const dv = p.dive, f = Math.min(1, (race.t - dv.t0) / dv.dur);
      p.lx = dv.x0 + (dv.x1 - dv.x0) * f;
      p.v = C.DIVE_V * dv.q;
      if (f >= 1) enterUW(race, C.DIVE_V * dv.q);
      break;
    }
    case 'uw': {
      physics(race, dt, true);
      const u = p.uw;
      if (p.lx >= C.UW_LIMIT) breakout(race, 'limit');
      else if (race.t - Math.max(u.lastKick, u.start) > C.UW_DRIFT_T + (u.kicks === 0 ? 0.3 : 0)) breakout(race, 'drift');
      break;
    }
    case 'swim': {
      physics(race, dt, false);
      if (p.pend && race.t > p.pend.until) {
        emit(race, { k: 'stroke', g: 'lopsided', side: p.pend.side, dt: 0, flow: 0 });
        p.flow = 0; p.pend = null;
      }
      const S = strokeDef(race);
      if (!S.breath) p.o2 = Math.min(100, p.o2 + C.O2_SURF_REGEN * dt);
      const d = wallDist(race);
      if (isFinalLap(race)) { if (d <= 0) finish(race, true); }
      else {
        const tk = turnKindFor(race);
        if (tk === 'flip' && d <= C.AUTO_FLIP_AT && !race.assist) flip(race, true);
        else if (tk === 'flip' && race.assist && d <= C.FLIP_IDEAL + 0.1) flip(race, false);
        else if (tk === 'open' && d <= 0) touchTurn(race, true);
        else if (tk === 'open' && race.assist && d <= 0.5) touchTurn(race, false);
      }
      break;
    }
    case 'turn': {
      const tn = p.turn, f = Math.min(1, (race.t - tn.t0) / tn.dur);
      p.lx = tn.x0 + (C.POOL - tn.x0) * Math.min(1, f * 1.6);
      p.v = 0;
      if (f >= 1) {
        p.log.splits.push(+(race.t - race.beepT - 0.2).toFixed(2));
        p.lap++; p.lx = 0;
        emit(race, { k: 'split', lap: p.lap, time: p.log.splits[p.log.splits.length - 1] });
        enterUW(race, tn.pushV);
      }
      break;
    }
  }
  // hold detection: breathe on the surface, break out underwater
  if (p.phase === 'swim' || p.phase === 'uw') {
    for (const s of ['L', 'R']) {
      const h = p.down[s];
      if (!h || h.used || h.phase !== p.phase) continue;
      if (race.t - h.t >= C.HOLD_T) {
        h.used = true;
        if (p.phase === 'uw') breakout(race, 'hold');
        else if (strokeDef(race).breath) breath(race);
      }
    }
  }
  // ghost samples
  if (race.t >= race.beepT) {
    const rt = race.t - race.beepT;
    while (rt >= p.nextGhostT && p.phase !== 'done' && p.phase !== 'dq' && p.phase !== 'dnf') {
      p.ghost.push(Math.round(xOf(race) * 100) / 100);
      p.nextGhostT += C.GHOST_DT;
    }
    if (!race.over && rt > race.par * C.DNF_FACTOR) { p.phase = 'dnf'; race.over = true; emit(race, { k: 'dnf' }); note(race, 'Time ran out'); }
  }
}
function stepTo(race, t) {
  const DT = CONFIG.DT;
  while (race.t + DT <= t + 1e-12) stepRace(race, DT);
  const rem = t - race.t;
  if (rem > 1e-9) stepRace(race, rem);
}

function raceTime(race) { return Math.max(0, race.t - race.beepT); }
function standings(race) {
  const p = race.p;
  const rows = race.opps.map(o => ({ name: o.name, club: o.club, lane: o.lane, cap: o.cap, time: +o.finish.toFixed(2), you: false }));
  const ok = p.phase === 'done';
  rows.push({ name: 'You', club: '', lane: 3, cap: '#4cc9f0', time: ok ? p.finish : null, you: true, dq: p.dq || (p.phase === 'dnf' ? 'DNF' : null) });
  rows.sort((a, b) => (a.time == null ? 1e9 : a.time) - (b.time == null ? 1e9 : b.time));
  let place = 0, last = null;
  rows.forEach((r, i) => { if (r.time == null) { r.place = null; return; } if (r.time !== last) place = i + 1; r.place = place; last = r.time; });
  return rows;
}
function playerPlace(race) { const me = standings(race).find(r => r.you); return me.place; }

/* Coach notes: built only from what the log recorded. */
function coachNotes(race) {
  const p = race.p, L = p.log, out = [];
  if (p.dq) { out.push('False start. Wait for the beep, then go. From Regional meets up there is no recall.'); return out; }
  if (p.phase === 'dnf') { out.push('Time ran out. Tap as each arm comes ready; drifting is slow.'); return out; }
  if (L.recalls > 0) out.push('Went early ' + (L.recalls > 1 ? L.recalls + ' times' : 'once') + ' and got recalled. From Regional meets up, that is a DQ.');
  const G = L.grades, total = G.perfect + G.good + G.rush + G.late + G.crossed + G.lopsided;
  const pct = total ? Math.round(100 * G.perfect / total) : 0;
  if (G.rush > total * 0.25) out.push('Rushing: ' + G.rush + ' of ' + total + ' strokes came before the arm was ready. They cost more and push less. Wait for the ring.');
  if (G.late > total * 0.3) out.push('Late: ' + G.late + ' strokes came well after the ready window, so you lost glide between strokes.');
  if (G.crossed > 2) out.push('Crossed arms ' + G.crossed + ' times. Alternate left and right.');
  if (G.lopsided > 1) out.push(G.lopsided + ' strokes were one-handed. Hit both pads together on ' + (race.ev.stroke === 'breast' ? 'breaststroke' : 'butterfly') + '.');
  if (L.bonkAt != null) out.push('Tank ran dry at ' + L.bonkAt + ' m. Ease out of push earlier, or go to push later.');
  if (L.gasps > 0) out.push('Ran out of air ' + L.gasps + ' time' + (L.gasps > 1 ? 's' : '') + '. Hold a stroke to breathe before the O2 bar empties.');
  const bad = L.turns.filter(t => t.q < 0.9);
  if (bad.length) out.push(bad.length + ' of ' + L.turns.length + ' walls were off: ' + bad.map(t => t.label.toLowerCase() + ' (' + t.d + ' m)').slice(0, 2).join(', ') + '. Flip as your head reaches the T.');
  const ups = L.breakouts.filter(b => b.why === 'limit');
  if (ups.length) out.push('Stayed under past 15 m ' + ups.length + 'x and got forced up. Hold to break out before the marker.');
  if (p.rt != null && p.rt > 0.8) out.push('Reaction ' + p.rt.toFixed(2) + ' s. Go on the beep, not after it.');
  if (L.splits.length >= 3) {
    const lapT = L.splits.map((s, i) => s - (i ? L.splits[i - 1] : 0));
    const firstHalf = lapT.slice(0, lapT.length / 2).reduce((a, b) => a + b, 0), secondHalf = lapT.slice(lapT.length / 2).reduce((a, b) => a + b, 0);
    if (secondHalf < firstHalf + 0.6 * (lapT.length / 2)) out.push('Strong back half: ' + secondHalf.toFixed(2) + ' vs ' + firstHalf.toFixed(2) + ' out. That is how distance swimmers win.');
  }
  if (!out.length || pct >= 70) out.unshift(pct + '% perfect strokes' + (L.maxFlow >= CONFIG.FLOW_AT ? ', longest flow ' + L.maxFlow : '') + '.');
  return out.slice(0, 4);
}

/* Ghost position (metres) at race time t from samples every GHOST_DT. */
function ghostPos(samples, t) {
  if (!samples || !samples.length || t <= 0) return 0;
  const i = t / CONFIG.GHOST_DT, a = Math.floor(i);
  if (a >= samples.length - 1) return samples[samples.length - 1];
  return samples[a] + (samples[a + 1] - samples[a]) * (i - a);
}

/* Daily seeded race: same event, field and pool for everyone on that date. */
function dailySpec(dateStr) {
  const h = hashStr('lanewake-daily-' + dateStr);
  const evs = ['free-50', 'free-100', 'back-50', 'breast-50', 'fly-50', 'free-200', 'back-100', 'im-100'];
  const mods = ['none', 'fast', 'warm', 'stacked'];
  return { event: evs[h % evs.length], seed: (h ^ 0x9e3779b9) >>> 0, tier: 3, mod: mods[(h >>> 8) % mods.length], date: dateStr };
}

/* ---------- save: defaults + validation (never trust stored data) ---------- */
const SAVE_VERSION = 1;
function defaultSave() {
  return { v: SAVE_VERSION, rung: 0, ladderDone: false, medals: {}, best: {}, daily: {}, settings: { sound: true, haptics: true, assist: false, offsetMs: 0, sfx: 0.8 }, stats: { races: 0, wins: 0, perfect: 0, strokes: 0 }, rival: { w: 0, l: 0 }, seen: { intro: false } };
}
function num(x, lo, hi, d) { return (typeof x === 'number' && isFinite(x) && x >= lo && x <= hi) ? x : d; }
function validateSave(raw) {
  const d = defaultSave(), errs = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, save: d, errs: ['not an object'] };
  if (raw.v !== SAVE_VERSION) errs.push('version');
  const s = d;
  s.rung = Math.floor(num(raw.rung, 0, LADDER.length, 0));
  s.ladderDone = raw.ladderDone === true;
  if (raw.medals && typeof raw.medals === 'object') for (const id of LADDER.map(r => r.id)) { const m = raw.medals[id]; if ([1, 2, 3].includes(m)) s.medals[id] = m; }
  if (raw.best && typeof raw.best === 'object') {
    for (const k of EVENTS) {
      const b = raw.best[k];
      if (!b || typeof b !== 'object') continue;
      const time = num(b.time, 5, 1000, null); if (time == null) { errs.push('best ' + k); continue; }
      let ghost = Array.isArray(b.ghost) && b.ghost.length <= 12000 && b.ghost.every(v => typeof v === 'number' && isFinite(v) && v >= 0 && v <= 250) ? b.ghost.slice() : null;
      s.best[k] = { time, ghost, date: typeof b.date === 'string' ? b.date.slice(0, 10) : '' };
    }
  }
  if (raw.daily && typeof raw.daily === 'object') {
    const keys = Object.keys(raw.daily).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort().slice(-30);
    for (const k of keys) { const t = num(raw.daily[k], 5, 1000, null); if (t != null) s.daily[k] = t; }
  }
  const st = raw.settings || {};
  s.settings.sound = st.sound !== false; s.settings.haptics = st.haptics !== false; s.settings.assist = st.assist === true;
  s.settings.offsetMs = Math.round(num(st.offsetMs, -80, 80, 0)); s.settings.sfx = num(st.sfx, 0, 1, 0.8);
  const ss = raw.stats || {};
  for (const k of Object.keys(s.stats)) s.stats[k] = Math.floor(num(ss[k], 0, 1e7, 0));
  const rv = raw.rival || {}; s.rival.w = Math.floor(num(rv.w, 0, 1e6, 0)); s.rival.l = Math.floor(num(rv.l, 0, 1e6, 0));
  s.seen.intro = !!(raw.seen && raw.seen.intro);
  return { ok: errs.length === 0, save: s, errs };
}

G.LW = {
  RULES_VERSION, CONFIG, STROKES, IM_ORDER, ROSTER, PAR, MODS, LADDER, UNLOCK_AT, EVENTS, RIVAL, RIVAL_FROM, RECORDS,
  parseEvent, eventLabel, createRace, raceInput, stepRace, stepTo, setPush, oppPos, ghostPos, raceTime, standings, playerPlace,
  coachNotes, dailySpec, defaultSave, validateSave, hashStr, wallDist, strokeDef, turnKindFor, isFinalLap, xOf, strokeKey,
};
})(typeof window !== 'undefined' ? window : globalThis);
