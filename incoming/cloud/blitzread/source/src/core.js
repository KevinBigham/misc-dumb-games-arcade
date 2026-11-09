/*CORE-START*/
// BLITZREAD core: CONFIG, DATA, State, pure Rules. No DOM, no Date, no Math.random.
var Core = (function () {
'use strict';

// ---------------- CONFIG ----------------
const CONFIG = {
  SCHEMA: 3, RULES: 'blitzread-r3',
  FIELD_W: 40, HALF_SECS: 330, KICKOFF_START: 25, OT_START: 75, OT_MAX_ROUNDS: 4,
  DT: 1 / 60, MAX_PLAY_T: 13, PLAY_TIME_SCALE: 1.5,
  PACE: { milk: 36, normal: 22, hurry: 7 },
  SPD: { QB: 6.6, RB: 7.4, WR: 7.9, SL: 7.6, OL: 5.6, DL: 7.25, LB: 8.3, CB: 9.0, S: 8.8 },
  ACC_O: 42, ACC_D: 32,
  TACKLE_R: 1.3, CLOSE_R: 4.5, CLOSE_BOOST: 1.2, STUN: 0.35, BLOCK_NEAR: 7, CATCH_SLOW: 0.55, BLOCK_R: 1.35, CATCH_R: 1.8,
  JUKE: { burst: 11.5, inv: 0.3, max: 2, cd: 0.42 },
  BREAK_TACKLE: 0.07,
  BALL_SPEED: 22, PITCH_SPEED: 14,
  HEAT_STEP: 1, HEAT_COOL: 0.5, HEAT_MAX: 3, HEAT_WEIGHT: 0.55, OPP_OFF: 1.2,
  FG_MAX: 59, PUNT_NET: 37,
  IRON: { disguise: 0.12, defSpd: 0.04, adapt: 0.25, m: 0.15, off: 0.8 },
};

// ---------------- DATA ----------------
const PLAY_IDS = ['DIVE', 'TOSS', 'SLANT', 'SCREEN', 'CROSS', 'DEEP'];
const DEFS = ['BLITZ', 'SHELL', 'MAN', 'STACK'];
const PLAYS = {
  DIVE:   { name: 'Iron Dive',     kind: 'run',  tag: 'Inside run',   good: 'Shell, Man',  bad: 'Blitz, Stack' },
  TOSS:   { name: 'Barn Sweep',    kind: 'run',  tag: 'Outside run',  good: 'Blitz, Shell', bad: 'Stack' },
  SLANT:  { name: 'Quick Slants',  kind: 'pass', tag: 'Fast throw',   good: 'Blitz, Stack', bad: 'Man' },
  SCREEN: { name: 'Tunnel Screen', kind: 'pass', tag: 'Dump to back', good: 'Blitz',       bad: 'Stack' },
  CROSS:  { name: 'Mesh Cross',    kind: 'pass', tag: 'Crossers',     good: 'Man, Stack',  bad: 'Blitz' },
  DEEP:   { name: 'Moonshot',      kind: 'pass', tag: 'Fake + deep',  good: 'Man, Stack',  bad: 'Blitz, Shell' },
  FLEA:   { name: 'Hayride Flea',  kind: 'pass', tag: 'Trick deep',   good: 'Shell, Stack', bad: 'Blitz', unlock: true },
};
const MATCH = { // offense perspective: +1 good for you, -1 good for defense
  DIVE:   { BLITZ: -1, SHELL: 1,  MAN: 1,  STACK: -1 },
  TOSS:   { BLITZ: 1,  SHELL: 1,  MAN: 0,  STACK: -1 },
  SLANT:  { BLITZ: 1,  SHELL: 0,  MAN: -1, STACK: 1 },
  SCREEN: { BLITZ: 1,  SHELL: 0,  MAN: 0,  STACK: -1 },
  CROSS:  { BLITZ: -1, SHELL: 0,  MAN: 1,  STACK: 1 },
  DEEP:   { BLITZ: -1, SHELL: -1, MAN: 1,  STACK: 1 },
  FLEA:   { BLITZ: -1, SHELL: 1,  MAN: 0,  STACK: 1 },
};
const DEF_INFO = {
  BLITZ: { name: 'Blitz',  tell: 'Linebackers creep to the line, no deep safety', stops: 'Deep, Dive, Cross' },
  SHELL: { name: 'Shell',  tell: 'Corners bail, safety sits deep',            stops: 'Deep shots' },
  MAN:   { name: 'Man',    tell: 'Corners press nose-to-nose',                 stops: 'Quick slants' },
  STACK: { name: 'Stack',  tell: 'Eight in the box feel, safety down',         stops: 'Runs, screens' },
};
const CATS = ['RUN', 'QUICK', 'DEEP'];
const DEF_O = { // your defensive call vs their offense category, offense perspective
  BLITZ: { RUN: 0, QUICK: 1, DEEP: -1 },
  SHELL: { RUN: 1, QUICK: 0, DEEP: -1 },
  MAN:   { RUN: 0, QUICK: -1, DEEP: 1 },
  STACK: { RUN: -1, QUICK: 0, DEEP: 1 },
};
const ME = { name: 'Cedar Flats Lamplighters', short: 'Lamplighters', abbr: 'CDR', c1: '#12494a', c2: '#f3b23a' };
// tendencies are weights in DEFS order [BLITZ, SHELL, MAN, STACK] and CATS order [RUN, QUICK, DEEP]
const TEAMS = [
  { id: 'thistle', name: 'Millbrook Thistles', short: 'Thistles', abbr: 'MIL', c1: '#6a3f98', c2: '#efe2ff',
    defSpd: 0.93, disguise: 0.08, adapt: 0.2, off: -0.9, kick: 0.9,
    defTend: { EARLY: [10, 50, 25, 15], SHORT: [15, 15, 20, 50], LONG: [15, 60, 20, 5] },
    offTend: { EARLY: [60, 28, 12], SHORT: [75, 20, 5], LONG: [25, 50, 25] },
    blurb: 'Sits deep and hopes you get bored. Runs the ball on short downs.' },
  { id: 'gulls', name: 'Harrow Point Gulls', short: 'Gulls', abbr: 'HAR', c1: '#e5e7ea', c2: '#1f5fa8',
    defSpd: 0.95, disguise: 0.12, adapt: 0.25, off: -0.5, kick: 0.92,
    defTend: { EARLY: [15, 20, 50, 15], SHORT: [20, 10, 55, 15], LONG: [25, 25, 45, 5] },
    offTend: { EARLY: [30, 55, 15], SHORT: [35, 55, 10], LONG: [10, 65, 25] },
    blurb: 'Press-man corners everywhere. Throws quick, rarely deep.' },
  { id: 'stags', name: 'Copperline Stags', short: 'Stags', abbr: 'COP', c1: '#b4572a', c2: '#2a1a12',
    defSpd: 0.97, disguise: 0.14, adapt: 0.3, off: -0.1, kick: 0.92,
    defTend: { EARLY: [15, 10, 20, 55], SHORT: [10, 5, 15, 70], LONG: [35, 30, 25, 10] },
    offTend: { EARLY: [65, 20, 15], SHORT: [80, 15, 5], LONG: [30, 40, 30] },
    blurb: 'Loads the box on early downs. Pounds the ball.' },
  { id: 'wardens', name: 'Ashgrove Wardens', short: 'Wardens', abbr: 'ASH', c1: '#2f3b2c', c2: '#d8d06a',
    defSpd: 0.99, disguise: 0.17, adapt: 0.35, off: 0.2, kick: 0.94,
    defTend: { EARLY: [45, 15, 25, 15], SHORT: [40, 5, 20, 35], LONG: [55, 20, 20, 5] },
    offTend: { EARLY: [40, 40, 20], SHORT: [50, 40, 10], LONG: [15, 45, 40] },
    blurb: 'Sends the house on third down. Mixed offense.' },
  { id: 'kestrels', name: 'Tallow Ridge Kestrels', short: 'Kestrels', abbr: 'TAL', c1: '#8b1e2d', c2: '#f1d9a6',
    defSpd: 1.0, disguise: 0.24, adapt: 0.4, off: 0.7, kick: 0.96,
    defTend: { EARLY: [20, 35, 30, 15], SHORT: [25, 10, 25, 40], LONG: [25, 45, 25, 5] },
    offTend: { EARLY: [30, 30, 40], SHORT: [45, 40, 15], LONG: [10, 35, 55] },
    blurb: 'Disguises a lot. Airs it out.' },
  { id: 'anvils', name: 'Blackmere Anvils', short: 'Anvils', abbr: 'BLK', c1: '#17171a', c2: '#c9c9cf',
    defSpd: 1.03, disguise: 0.3, adapt: 0.5, off: 1.1, kick: 0.97,
    defTend: { EARLY: [25, 25, 25, 25], SHORT: [30, 10, 25, 35], LONG: [35, 30, 30, 5] },
    offTend: { EARLY: [40, 35, 25], SHORT: [55, 35, 10], LONG: [15, 45, 40] },
    blurb: 'Champions. Balanced, disguised, and they learn fast.' },
];
const DAILY_TOWNS = ['Fernhollow', 'Quarry Bend', 'Lantern Gap', 'Oxbow', 'Pinecastle', 'Wicker Falls', 'Red Silo', 'Duskmoor', 'Saltmarsh', 'Brookhaven Mill'];
const DAILY_NICKS = ['Owls', 'Plowmen', 'Comets', 'Ferrets', 'Bison', 'Rooks', 'Larks', 'Mavericks', 'Hornets', 'Badgers'];

// ---------------- RNG ----------------
function rnd(s) {
  let t = (s.rng = (s.rng + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function hashStr(str) { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h || 1; }
function pickW(s, w) { let tot = 0; for (const x of w) tot += Math.max(0, x); let r = rnd(s) * tot; for (let i = 0; i < w.length; i++) { r -= Math.max(0, w[i]); if (r < 0) return i; } return w.length - 1; }
function gauss(s, m, sd) { const u = Math.max(1e-9, rnd(s)), v = rnd(s); return m + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * v); }
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ---------------- Teams ----------------
function dailyTeam(dateStr) {
  const s = { rng: hashStr('daily-' + dateStr) };
  const base = TEAMS[Math.floor(rnd(s) * 4) + 2];
  const t = JSON.parse(JSON.stringify(base));
  t.id = 'daily'; const town = DAILY_TOWNS[Math.floor(rnd(s) * DAILY_TOWNS.length)]; const nick = DAILY_NICKS[Math.floor(rnd(s) * DAILY_NICKS.length)];
  t.name = town + ' ' + nick; t.short = nick; t.abbr = town.replace(/[^A-Z]/g, '').padEnd(3, town.toUpperCase().replace(/[^A-Z]/g, '')).slice(0, 3);
  const hues = [['#2d6a4f', '#f1faee'], ['#9d4edd', '#fff3b0'], ['#e76f51', '#264653'], ['#14213d', '#fca311'], ['#6d597a', '#ffd6a5'], ['#005f73', '#e9d8a6']];
  const h = hues[Math.floor(rnd(s) * hues.length)]; t.c1 = h[0]; t.c2 = h[1];
  for (const b of ['EARLY', 'SHORT', 'LONG']) { t.defTend[b] = t.defTend[b].map(x => Math.round(x * (0.5 + rnd(s)))); t.offTend[b] = t.offTend[b].map(x => Math.round(x * (0.6 + rnd(s) * 0.8))); }
  t.blurb = 'Daily opponent. Same team for everyone today.';
  return t;
}
function teamById(id) { return TEAMS.find(t => t.id === id) || null; }

// ---------------- State ----------------
function newGame(o) {
  const opp = o.team ? JSON.parse(JSON.stringify(o.team)) : JSON.parse(JSON.stringify(teamById(o.oppId) || TEAMS[0]));
  const s = {
    schema: CONFIG.SCHEMA, rules: CONFIG.RULES, seed: (o.seed >>> 0) || 1, rng: (o.seed >>> 0) || 1,
    mode: o.mode || 'season', iron: !!o.iron, flea: !!o.flea, opp,
    score: { me: 0, op: 0 }, half: 1, clock: CONFIG.HALF_SECS, otRound: 0,
    poss: 'me', los: CONFIG.KICKOFF_START, down: 1, ltg: CONFIG.KICKOFF_START + 10, pace: 'normal',
    heat: {}, defHeat: {}, seen: { EARLY: {}, SHORT: {}, LONG: {} },
    phase: 'call', defCall: null, look: null, play: null, drive: null, nplay: 0,
    log: [], last: null, stats: { me: { yds: 0, plays: 0, tds: 0 }, op: { yds: 0, plays: 0 } }, final: null,
  };
  for (const p of PLAY_IDS.concat(['FLEA'])) s.heat[p] = 0;
  for (const d of DEFS) s.defHeat[d] = 0;
  startDown(s);
  return s;
}
function T(s) { return s.opp; }
function bucketOf(down, togo) { return down >= 3 ? (togo <= 3 ? 'SHORT' : 'LONG') : 'EARLY'; }
function bucket(s) { return bucketOf(s.down, s.ltg - s.los); }
function disguiseRate(s) { return clamp(T(s).disguise + (s.iron ? CONFIG.IRON.disguise : 0), 0, 0.6); }
function defWeights(s) {
  const t = T(s); const w = t.defTend[bucket(s)].slice(); const ad = t.adapt + (s.iron ? CONFIG.IRON.adapt : 0);
  DEFS.forEach((d, i) => { let k = 0; for (const p in s.heat) if (MATCH[p] && MATCH[p][d] === -1) k += s.heat[p]; w[i] *= 1 + ad * k; });
  return w;
}
function scout(s) { // what the player sees: base tendency % for this situation + what they showed today
  const b = bucket(s); const w = T(s).defTend[b]; const tot = w.reduce((a, c) => a + c, 0) || 1;
  return { bucket: b, pct: DEFS.map((d, i) => Math.round(100 * w[i] / tot)), seen: DEFS.map(d => s.seen[b][d] || 0), disguise: disguiseRate(s) };
}
function startDown(s) {
  s.phase = 'call'; s.poss = 'me';
  const call = DEFS[pickW(s, defWeights(s))];
  let look = call;
  if (rnd(s) < disguiseRate(s)) { const others = DEFS.filter(d => d !== call); look = others[Math.floor(rnd(s) * 3)]; }
  s.defCall = call; s.look = look;
}
function fgDist(s) { return 100 - s.los + 17; }
function canFG(s) { return s.phase === 'call' && fgDist(s) <= CONFIG.FG_MAX; }
function canPunt(s) { return s.phase === 'call' && s.down === 4 && s.half < 3; }
function legalPlays(s) { return PLAY_IDS.concat(s.flea ? ['FLEA'] : []); }

// ---------------- Live play construction ----------------
function mods(m) {
  return {
    readDelay: Math.max(0.03, 0.28 + 0.32 * m), readSpeed: 1 - 0.09 * m,
    hold: Math.max(0.45, 1.45 + 0.65 * m), runHold: Math.max(0.25, 0.7 + 0.35 * m),
    jam: m < -0.5 ? 0.45 : (m < 0.5 ? 0.22 : 0.05),
  };
}
const OFF_POS = { QB: [20, -4.2], RB: [22.6, -4.4], X: [4, -0.6], Y: [29, -0.9], Z: [36, -0.6], LT: [18.4, -1.1], RT: [21.6, -1.1] };
const OFF_ROLE = { QB: 'QB', RB: 'RB', X: 'WR', Y: 'SL', Z: 'WR', LT: 'OL', RT: 'OL' };
const OFF_NUM = { QB: 7, RB: 22, X: 81, Y: 14, Z: 88, LT: 70, RT: 64 };
const DEF_ROLE = { E1: 'DL', E2: 'DL', M1: 'LB', M2: 'LB', C1: 'CB', C2: 'CB', FS: 'S' };
const DEF_NUM = { E1: 91, E2: 95, M1: 52, M2: 55, C1: 24, C2: 29, FS: 31 };
function alignment(look) {
  const a = { E1: [17.8, 1.2], E2: [22.2, 1.2], M1: [15, 5], M2: [25, 5], C1: [4, 6], C2: [36, 6], FS: [22, 13] };
  if (look === 'BLITZ') { a.M1 = [16.6, 1.9]; a.M2 = [23.4, 1.9]; a.FS = [28.5, 6.5]; a.C1 = [4, 4]; a.C2 = [36, 4]; }
  if (look === 'SHELL') { a.C1 = [6, 10]; a.C2 = [34, 10]; a.FS = [20, 17]; a.M1 = [14.5, 6.5]; a.M2 = [25.5, 6.5]; }
  if (look === 'MAN') { a.C1 = [4, 1.6]; a.C2 = [36, 1.6]; a.FS = [29, 8]; a.M1 = [17, 5]; a.M2 = [23, 4.5]; }
  if (look === 'STACK') { a.M1 = [17.6, 3]; a.M2 = [22.4, 3]; a.FS = [20, 5.5]; a.C1 = [5, 5]; a.C2 = [35, 5]; }
  return a;
}
function assignments(call, los) {
  const z = (x, dy, deep) => ({ type: 'zone', x, y: los + dy, deep: !!deep });
  const man = (k) => ({ type: 'man', k });
  const rush = { type: 'rush' };
  switch (call) {
    case 'BLITZ': return { E1: rush, E2: rush, M1: rush, M2: rush, C1: man('X'), C2: man('Z'), FS: man('Y') };
    case 'SHELL': return { E1: rush, E2: rush, M1: z(14, 6), M2: z(26, 6), C1: z(6, 17, 1), C2: z(34, 17, 1), FS: z(20, 22, 1) };
    case 'MAN': return { E1: rush, E2: rush, M1: man('Y'), M2: man('RB'), C1: man('X'), C2: man('Z'), FS: z(20, 16, 1) };
    default: return { E1: rush, E2: rush, M1: { type: 'fit', x: 17, dz: z(15, 6) }, M2: { type: 'fit', x: 23, dz: z(25, 6) }, FS: { type: 'fit', x: 20, dz: z(20, 13, 1) }, C1: man('X'), C2: man('Z') };
  }
}
// waypoints [dx, dy] relative to the player's own start; for X dx>0 is inside; for Y/Z we mirror (inside = -x)
const ROUTES = {
  SLANT:  { QB: [[0, -1]], X: [[0, 2], [5, 8], [10, 14]], Y: [[0, 3], [6, 7], [12, 10]], Z: [[0, 2], [5, 8], [10, 14]], RB: 'pro' },
  DEEP:   { QB: [[0, -2.6]], X: [[0, 45]], Y: [[0, 40]], Z: [[0, 12], [7, 30], [10, 45]], RB: 'pro', fake: 0.55 },
  CROSS:  { QB: [[0, -2]], X: [[0, 5], [26, 8], [33, 9]], Y: [[0, 2], [20, 4], [26, 5]], Z: [[0, 12], [14, 13], [24, 14]], RB: [[-3, 3, 'abs'], [-6, 5, 'abs']] },
  SCREEN: { QB: [[0, -3.4]], X: [[0, 40]], Y: 'stalk', Z: [[0, 40]], RB: [[3.5, -1.8, 'abs'], [6, -1.6, 'abs'], [6.5, 5, 'abs'], [6.5, 60, 'abs']], OLout: 0.75 },
  DIVE:   { QB: [[0, -0.4]], X: 'stalk', Y: 'stalk', Z: 'stalk', RB: [[-2.4, 3.2, 'abs'], [-2.4, 70, 'abs']], hand: 0.38 },
  TOSS:   { QB: [[0, -0.4]], X: [[0, 30]], Y: 'stalk', Z: 'stalk', RB: [[8, 0.2, 'abs'], [13, 3, 'abs'], [14, 70, 'abs']], pitch: 0.24, OLpull: true },
  FLEA:   { QB: [[0, -1.2]], X: [[0, 45]], Y: [[0, 12], [-6, 34], [-8, 45]], Z: [[0, 45]], RB: [[-0.6, 1.2, 'abs']], flea: 0.75 },
};
function mkEnt(team, key, role, x, y, num) {
  return { team, key, role, x, y, vx: 0, vy: 0, spd: CONFIG.SPD[role], num, eng: -1, engUntil: 0, stunUntil: 0, cool: 0, tried: false, wp: null, wi: 0, mode: null, asg: null, hist: [], sx: x, sy: y };
}
function callPlay(s, pid) {
  if (s.phase !== 'call' || legalPlays(s).indexOf(pid) < 0) return false;
  const t = T(s), call = s.defCall, los = s.los;
  let m = MATCH[pid][call] - CONFIG.HEAT_WEIGHT * (s.heat[pid] || 0) - (s.iron ? CONFIG.IRON.m : 0);
  m = clamp(m, -1.8, 1);
  for (const p in s.heat) s.heat[p] = Math.max(0, s.heat[p] - CONFIG.HEAT_COOL);
  s.heat[pid] = Math.min(CONFIG.HEAT_MAX, (s.heat[pid] || 0) + CONFIG.HEAT_STEP + CONFIG.HEAT_COOL * (pid === 'FLEA' ? 3 : 1));
  const md = mods(m);
  const E = [], ix = {};
  for (const k of ['QB', 'RB', 'X', 'Y', 'Z', 'LT', 'RT']) { const p = OFF_POS[k]; ix[k] = E.length; E.push(mkEnt('O', k, OFF_ROLE[k], p[0], los + p[1], OFF_NUM[k])); }
  const al = alignment(s.look), as = assignments(call, los);
  const dspd = t.defSpd + (s.iron ? CONFIG.IRON.defSpd : 0);
  for (const k of ['E1', 'E2', 'M1', 'M2', 'C1', 'C2', 'FS']) { const p = al[k]; ix[k] = E.length; const e = mkEnt('D', k, DEF_ROLE[k], p[0], los + p[1], DEF_NUM[k]); e.spd *= dspd * (0.96 + 0.08 * rnd(s)); e.rj = (rnd(s) - 0.5) * 0.24; e.asg = as[k]; E.push(e); }
  // receivers vary their break depth a little every snap
  const jit = () => (rnd(s) - 0.5) * 1.4;
  const R = ROUTES[pid];
  for (const k of ['QB', 'RB', 'X', 'Y', 'Z']) {
    const e = E[ix[k]]; const r = R[k];
    if (r === 'stalk' || r === 'pro') { e.mode = r; continue; }
    if (!r) { e.mode = 'idle'; continue; }
    const mir = (k === 'Y' || k === 'Z') ? -1 : 1;
    const jy = jit();
    e.wp = r.map(w => w[2] === 'abs' ? [e.x + w[0], e.y + w[1] + (w[1] > 1 ? jy * 0.5 : 0)] : [e.x + w[0] * mir, e.y + w[1] + jy]);
    e.mode = 'route';
  }
  for (const k of ['LT', 'RT']) E[ix[k]].mode = PLAYS[pid].kind === 'run' ? 'lead' : (pid === 'SCREEN' ? 'screen' : 'pro');
  const P = {
    pid, kind: PLAYS[pid].kind, call, look: s.look, m, md, t: 0, E, ix, los, ltg: s.ltg,
    ball: { st: 'held', h: ix.QB, x: E[ix.QB].x, y: E[ix.QB].y, z: 1 },
    carrier: ix.QB, pursuit: false, pursuitAt: 99, thrown: false, caught: false, scramble: false,
    jukes: 0, jukeCd: 0, inv: 0, ev: [], result: null, maxSpeed: 0, handed: false,
  };
  if (P.kind === 'run') P.pursuitAt = (R.hand || R.pitch || 0.3) + md.readDelay;
  // press jam: man-call corners near receivers at the snap slow the release
  if (call === 'MAN' || call === 'BLITZ') for (const k of ['X', 'Z']) { const r = E[ix[k]], c = E[ix[k === 'X' ? 'C1' : 'C2']]; if (dist(r, c) < 3) r.jamUntil = md.jam; }
  s.play = P; s.phase = 'live'; s.nplay++;
  s.lastCall = { pid, look: s.look, call, m };
  const b = bucket(s); s.seen[b][call] = (s.seen[b][call] || 0) + 1;
  P.ev.push({ k: 'snap' });
  if (s.look !== call) P.ev.push({ k: 'disguise', call });
  return true;
}

// ---------------- Live play simulation ----------------
function steerTo(e, tx, ty, spd, acc, dt) {
  let dx = tx - e.x, dy = ty - e.y; const d = Math.hypot(dx, dy);
  let wx = 0, wy = 0;
  if (d > 0.15) { const sp = Math.min(spd, d * 6); wx = dx / d * sp; wy = dy / d * sp; }
  accel(e, wx, wy, acc, dt);
}
function accel(e, wx, wy, acc, dt) {
  let ax = wx - e.vx, ay = wy - e.vy; const a = Math.hypot(ax, ay), lim = acc * dt;
  if (a > lim) { ax = ax / a * lim; ay = ay / a * lim; }
  e.vx += ax; e.vy += ay;
}
function carrierOf(P) { return P.ball.st === 'held' ? P.E[P.ball.h] : null; }
function end(s, P, type, y, extra) {
  if (P.result) return;
  P.result = Object.assign({ type, y, t: P.t }, extra || {});
  P.ball.st = 'dead';
  P.ev.push({ k: 'whistle', type });
}
function receivers(P) { return ['X', 'Y', 'Z', 'RB'].map(k => P.E[P.ix[k]]); }
function throwTo(s, key) {
  const P = s.play; if (!P || P.result) return false;
  const qb = P.E[P.ix.QB];
  if (P.kind !== 'pass' || P.ball.st !== 'held' || P.ball.h !== P.ix.QB || P.scramble || P.t < 0.12) return false;
  if (P.fleaAt && !P.fleaBack) return false;
  const r = P.E[P.ix[key]]; if (!r) return false;
  const A = aimFor(P, r); const ax0 = A.x, ay = A.y, T0 = A.T; let ax = ax0;
  ax = clamp(ax, 0.4, CONFIG.FIELD_W - 0.4);
  P.ball = { st: 'air', kind: 'pass', h: -1, fx: qb.x, fy: qb.y, tx: ax, ty: ay, t0: P.t, T: T0, target: P.ix[key], x: qb.x, y: qb.y, z: 1 };
  P.thrown = true; P.throwT = P.t; P.ev.push({ k: 'throw', key, air: Math.round(ay - P.los) });
  // defenders near the landing spot break on the ball
  for (const d of P.E) if (d.team === 'D' && d.asg && d.asg.type !== 'rush') {
    if (Math.hypot(d.x - ax, d.y - ay) < 11) d.breakAt = P.t + P.md.readDelay * 0.6;
  }
  return true;
}
// where a receiver will be after T seconds if he keeps running his route
function predict(P, r, T) {
  let x = r.x, y = r.y; const sp = Math.max(Math.hypot(r.vx, r.vy), r.spd * 0.85); let rem = T * sp;
  if (r.mode === 'route' && r.wp && !(r.jamUntil && P.t < r.jamUntil) && P.ball.h !== P.E.indexOf(r)) {
    let i = r.wi;
    while (rem > 0 && i < r.wp.length) { const w = r.wp[i]; const d = Math.hypot(w[0] - x, w[1] - y); if (d >= rem) { x += (w[0] - x) / d * rem; y += (w[1] - y) / d * rem; rem = 0; } else { x = w[0]; y = w[1]; rem -= d; i++; } }
    if (rem > 0) { const a = r.wp[r.wp.length - 1], b = r.wp.length > 1 ? r.wp[r.wp.length - 2] : [r.sx, r.sy]; const dx = a[0] - b[0], dy = a[1] - b[1]; const l = Math.hypot(dx, dy) || 1; x += dx / l * rem; y += dy / l * rem; }
    return { x, y };
  }
  if (r.jamUntil && P.t < r.jamUntil) return { x: r.x, y: r.y + T * 2 };
  return { x: r.x + r.vx * T, y: r.y + r.vy * T };
}
function aimFor(P, r) {
  const qb = P.E[P.ix.QB]; let T0 = Math.max(0.28, dist(qb, r) / CONFIG.BALL_SPEED); let A = { x: r.x, y: r.y };
  for (let i = 0; i < 4; i++) { A = predict(P, r, T0); T0 = Math.max(0.28, Math.hypot(A.x - qb.x, A.y - qb.y) / CONFIG.BALL_SPEED); }
  return { x: A.x, y: A.y, T: T0 };
}
function juke(P, jx, jy) {
  const c = carrierOf(P); if (!c || P.result) return false;
  if (P.jukes >= CONFIG.JUKE.max || P.t < P.jukeCd) return false;
  const l = Math.hypot(jx, jy) || 1; jx /= l; jy /= l;
  if (jy < -0.2) jy = -0.2; // never juke straight backwards
  const l2 = Math.hypot(jx, jy) || 1;
  c.vx = c.vx * 0.35 + jx / l2 * CONFIG.JUKE.burst; c.vy = c.vy * 0.35 + jy / l2 * CONFIG.JUKE.burst;
  P.jukes++; P.jukeCd = P.t + CONFIG.JUKE.cd; P.inv = P.t + CONFIG.JUKE.inv; P.jukeBurstUntil = P.t + 0.2;
  P.ev.push({ k: 'juke', x: c.x, y: c.y });
  return true;
}
function tick(s, dt, inp) {
  const P = s.play; if (!P || P.result) return;
  inp = inp || {};
  P.t += dt; const t = P.t, E = P.E, ix = P.ix, los = P.los, W = CONFIG.FIELD_W;
  const R = ROUTES[P.pid];
  const qb = E[ix.QB], rb = E[ix.RB];
  // scripted ball transfers
  if (R.hand && !P.handed && t >= R.hand) { P.handed = true; P.ball = { st: 'held', h: ix.RB, x: rb.x, y: rb.y, z: 1 }; P.ev.push({ k: 'handoff' }); }
  if (R.pitch && !P.handed && t >= R.pitch) { P.handed = true; const T0 = 0.32; P.ball = { st: 'air', kind: 'pitch', h: -1, fx: qb.x, fy: qb.y, tx: rb.x + rb.vx * T0, ty: rb.y + rb.vy * T0, t0: t, T: T0, target: ix.RB, x: qb.x, y: qb.y, z: 1 }; P.ev.push({ k: 'pitch' }); }
  if (R.flea && !P.fleaAt && t >= 0.25) { P.fleaAt = t; P.ball = { st: 'held', h: ix.RB, x: rb.x, y: rb.y, z: 1 }; P.ev.push({ k: 'handoff' }); }
  if (R.flea && P.fleaAt && !P.fleaBack && t >= R.flea) { P.fleaBack = true; P.ball = { st: 'air', kind: 'pitch', h: -1, fx: rb.x, fy: rb.y, tx: qb.x, ty: qb.y, t0: t, T: 0.3, target: ix.QB, x: rb.x, y: rb.y, z: 1 }; P.ev.push({ k: 'pitch' }); }
  if (inp.juke) juke(P, inp.juke.x, inp.juke.y);
  if (inp.throwTo) throwTo(s, inp.throwTo);
  const car = carrierOf(P);
  // record receiver history (for delayed man coverage)
  for (const k of ['X', 'Y', 'Z', 'RB', 'QB']) { const e = E[ix[k]]; e.hist.push(e.x, e.y); if (e.hist.length > 120) e.hist.splice(0, 2); }
  if (!P.pursuit && t >= P.pursuitAt) { P.pursuit = true; }
  // ---- offense movement
  for (const k of ['QB', 'RB', 'X', 'Y', 'Z', 'LT', 'RT']) {
    const e = E[ix[k]]; const isCar = car === e;
    let spd = isCar && e !== qb ? e.spd * 0.96 : e.spd;
    if (e.jamUntil && t < e.jamUntil) spd *= 0.25;
    if (isCar && (inp.steer || inp.steerTo)) {
      let dx, dy;
      if (inp.steerTo) { dx = inp.steerTo.x - e.x; dy = inp.steerTo.y - e.y; } else { dx = inp.steer.x; dy = inp.steer.y; }
      const l = Math.hypot(dx, dy);
      if (l > 0.35) accel(e, dx / l * spd, dy / l * spd, CONFIG.ACC_O, dt); else accel(e, e.vx * 0.9, e.vy * 0.9, CONFIG.ACC_O, dt);
      if (e === qb && P.kind === 'pass' && !P.thrown && !P.scramble && e.y > los + 0.3) { P.scramble = true; P.pursuitAt = Math.min(P.pursuitAt, t + 0.2); P.ev.push({ k: 'scramble' }); }
      continue;
    }
    if (isCar && e !== qb && (e.mode !== 'route' || !e.wp || e.wi >= e.wp.length || P.caught)) { accel(e, e.vx * 0.15, spd, CONFIG.ACC_O, dt); continue; }
    if (isCar && e === qb && (P.scramble || P.kind === 'run')) { accel(e, 0, spd, CONFIG.ACC_O, dt); continue; }
    if (P.caught && e !== car && e !== qb) { blockerMove(s, P, e, dt, car); continue; }
    if (R.flea && e === rb && !P.fleaBack) { steerTo(e, e.sx - 0.6, e.sy + 1.2, spd, CONFIG.ACC_O, dt); continue; }
    if (e.mode === 'route' && e.wp) {
      if (R.fake && e === qb && t < R.fake) { steerTo(e, e.sx, e.sy - 0.6, spd, CONFIG.ACC_O, dt); continue; }
      if (e.wi < e.wp.length) {
        const w = e.wp[e.wi]; steerTo(e, w[0], w[1], spd, CONFIG.ACC_O, dt);
        if (Math.hypot(w[0] - e.x, w[1] - e.y) < 0.6) e.wi++;
      } else if (e === qb) accel(e, 0, 0, CONFIG.ACC_O, dt);
      else { const v = Math.hypot(e.vx, e.vy) || 1; accel(e, e.vx / v * spd, e.vy / v * spd, CONFIG.ACC_O, dt); }
      continue;
    }
    if (e.mode === 'pro' || e.mode === 'lead' || e.mode === 'stalk' || (P.caught && e !== car) || (P.kind === 'run' && e !== car && e !== qb)) { blockerMove(s, P, e, dt, car); continue; }
    accel(e, 0, 0, CONFIG.ACC_O, dt);
  }
  // ---- defense movement
  const md = P.md;
  for (const k of ['E1', 'E2', 'M1', 'M2', 'C1', 'C2', 'FS']) {
    const d = E[ix[k]];
    if (t < d.stunUntil) { accel(d, 0, 0, CONFIG.ACC_D * 2, dt); continue; }
    let spd = d.spd * (P.pursuit ? 1 : md.readSpeed); let tx, ty;
    const target = car || (P.ball.st === 'air' ? { x: P.ball.tx, y: P.ball.ty, vx: 0, vy: 0 } : qb);
    const a = d.asg;
    if (P.pursuit || (a.type === 'rush')) {
      const c = car || E[P.ball.target >= 0 ? P.ball.target : ix.QB];
      const ip = intercept(d, c, d.spd); tx = ip.x; ty = ip.y;
      if (a.type === 'rush' && !P.pursuit && P.kind === 'pass' && P.ball.st === 'air') { tx = d.x; ty = d.y; spd *= 0.3; }
    } else if (d.breakAt && t >= d.breakAt && P.ball.st === 'air') { tx = P.ball.tx; ty = P.ball.ty; }
    else if (a.type === 'man') {
      const r = E[ix[a.k]]; const fr = Math.round(Math.max(0, md.readDelay + d.rj) * 60 * 0.85); const h = r.hist; const i = Math.max(0, h.length - 2 - fr * 2);
      tx = h.length ? h[i] : r.x; ty = (h.length ? h[i + 1] : r.y) + 0.7;
      // a defense that's in the right call jumps the route: it plays where the receiver is going, from underneath
      if (P.m < -0.2 && r.wp && t > 0.15) { const pr = predict(P, r, Math.min(0.6, 0.3 * -P.m)); tx = pr.x; ty = Math.min(ty, pr.y - 0.2); }
    } else if (a.type === 'zone') { const zt = zoneTarget(P, a); tx = zt.x; ty = zt.y; }
    else if (a.type === 'spy') { const h = qb.hist; const i = Math.max(0, h.length - 2 - 20); tx = h.length ? h[i] : qb.x; ty = los + 4; }
    else if (a.type === 'fit') {
      if (t < md.readDelay + 0.3) { tx = a.x; ty = los + 1.5; }
      else if (P.kind === 'run' || (R.flea && !P.fleaBack)) { tx = target.x; ty = target.y; }
      else { const zt = zoneTarget(P, a.dz); tx = zt.x; ty = zt.y; }
    } else { tx = d.x; ty = d.y; }
    if (car && P.pursuit && dist(d, car) < CONFIG.CLOSE_R) spd *= CONFIG.CLOSE_BOOST;
    d.lim = spd;
    if (d.eng >= 0) {
      if (t >= d.engUntil) { const b = E[d.eng]; if (b) { b.eng = -1; b.cool = t + 0.9; } d.eng = -1; d.shedT = t; }
      else spd *= 0.12;
    }
    steerTo(d, tx, ty, spd, CONFIG.ACC_D, dt);
  }
  // ---- integrate + speed clamp
  for (const e of E) {
    const lim = (car === e && P.jukeBurstUntil && t < P.jukeBurstUntil) ? CONFIG.JUKE.burst : (e.team === 'D' ? Math.max(e.spd, e.lim || 0) * 1.02 : e.spd);
    const v = Math.hypot(e.vx, e.vy); if (v > lim) { e.vx = e.vx / v * lim; e.vy = e.vy / v * lim; }
    e.x += e.vx * dt; e.y += e.vy * dt;
  }
  if (car) { P.ball.x = car.x; P.ball.y = car.y; P.ball.z = 1; P.maxSpeed = Math.max(P.maxSpeed, Math.hypot(car.vx, car.vy)); }
  // ---- block engagement
  for (const b of E) {
    if (b.team !== 'O' || b === car || b.eng >= 0 || t < b.cool) continue;
    if (b.mode === 'route' && !P.caught && P.kind === 'pass') continue;
    if (b === qb) continue;
    if (P.pursuit && car && dist(b, car) > CONFIG.BLOCK_NEAR) continue;
    for (const d of E) {
      if (d.team !== 'D' || d.eng >= 0 || t < d.stunUntil) continue;
      if (dist(b, d) < CONFIG.BLOCK_R) {
        const passPro = P.kind === 'pass' && !P.caught && !P.scramble && b.mode === 'pro';
        const hold = passPro ? md.hold : md.runHold * (b.role === 'WR' || b.role === 'SL' ? 1.3 : 1);
        d.eng = E.indexOf(b); b.eng = E.indexOf(d); d.engUntil = t + hold * (0.75 + 0.5 * rnd(s)); b.engUntil = d.engUntil;
        P.ev.push({ k: 'block', x: d.x, y: d.y });
        break;
      }
    }
  }
  for (const b of E) if (b.team === 'O' && b.eng >= 0 && t >= b.engUntil) { b.eng = -1; b.cool = t + 0.9; }
  // ---- ball in air
  if (P.ball.st === 'air') {
    const B = P.ball; const u = clamp((t - B.t0) / B.T, 0, 1);
    B.x = B.fx + (B.tx - B.fx) * u; B.y = B.fy + (B.ty - B.fy) * u; B.z = 1 + Math.sin(u * Math.PI) * Math.min(9, B.T * 7);
    if (u >= 1) resolveCatch(s, P);
  }
  if (P.result) return;
  const c2 = carrierOf(P);
  // ---- tackles / sack
  if (c2) {
    if (c2.y >= 100 && c2.x >= 0 && c2.x <= W) { end(s, P, 'td', 100, { x: c2.x }); return; }
    for (const d of E) {
      if (d.team !== 'D' || d.eng >= 0 || t < d.stunUntil) continue;
      if (dist(d, c2) < CONFIG.TACKLE_R) {
        if (t < P.inv) { d.stunUntil = t + CONFIG.STUN; P.ev.push({ k: 'ankles', x: d.x, y: d.y }); continue; }
        if (!d.tried && rnd(s) < CONFIG.BREAK_TACKLE + (c2.role === 'RB' ? 0.05 : 0)) { d.tried = true; d.stunUntil = t + 0.55; P.ev.push({ k: 'shed', x: d.x, y: d.y }); continue; }
        const sack = c2 === qb && P.kind === 'pass' && !P.thrown && !P.scramble && c2.y <= los + 0.3;
        const closing = Math.hypot(d.vx - c2.vx, d.vy - c2.vy);
        end(s, P, sack ? 'sack' : 'tackle', c2.y, { x: c2.x, hit: closing, by: d.key });
        return;
      }
    }
    if (c2.x < 0 || c2.x > W) { end(s, P, 'oob', c2.y, { x: clamp(c2.x, 0, W) }); return; }
    if (c2.y >= 100) { end(s, P, 'td', 100, { x: c2.x }); return; }
    if (c2.y <= 0) { end(s, P, 'safety', 0, { x: c2.x }); return; }
  }
  if (t > CONFIG.MAX_PLAY_T) { const y = c2 ? c2.y : los; end(s, P, c2 === qb && !P.thrown && y <= los ? 'sack' : 'tackle', y, { x: c2 ? c2.x : 20, timeout: true }); }
}
function intercept(d, c, sp) { // earliest point where d can meet c running straight
  const rx = c.x - d.x, ry = c.y - d.y, vx = c.vx || 0, vy = c.vy || 0;
  const a = vx * vx + vy * vy - sp * sp, b = 2 * (rx * vx + ry * vy), cc = rx * rx + ry * ry;
  let tau;
  if (Math.abs(a) < 1e-6) tau = b < 0 ? -cc / b : 0.5;
  else { const disc = b * b - 4 * a * cc; if (disc < 0) tau = 0.8; else { const t1 = (-b - Math.sqrt(disc)) / (2 * a), t2 = (-b + Math.sqrt(disc)) / (2 * a); tau = [t1, t2].filter(x => x > 0).sort((x, y) => x - y)[0]; if (tau === undefined) tau = 0.8; } }
  tau = clamp(tau, 0, 1.6);
  return { x: c.x + vx * tau, y: c.y + vy * tau };
}
function zoneTarget(P, z) {
  let best = null, bd = 1e9;
  for (const r of receivers(P)) { const dd = Math.hypot(r.x - z.x, r.y - z.y); if (dd < 9 && dd < bd) { bd = dd; best = r; } }
  if (!best) return { x: z.x, y: z.y };
  let tx = z.x + (best.x - z.x) * 0.7, ty = z.y + (best.y - z.y) * 0.7;
  if (z.deep) ty = Math.max(ty, best.y + 1.5);
  return { x: tx, y: ty };
}
function blockerMove(s, P, b, dt, car) {
  const E = P.E;
  if (b.eng >= 0) { const d = E[b.eng]; steerTo(b, d.x, d.y, b.spd * 0.4, CONFIG.ACC_O, dt); return; }
  const qb = E[P.ix.QB];
  if (b.mode === 'pro' && P.kind === 'pass' && !P.caught && !P.scramble && P.ball.st !== 'air') {
    // pass pro: stand between QB and the nearest rusher not already blocked
    let best = null, bd = 1e9;
    for (const d of E) if (d.team === 'D' && d.asg.type === 'rush' && d.eng < 0) { const dd = dist(d, qb) + dist(d, b) * 0.5; if (dd < bd) { bd = dd; best = d; } }
    if (!best) { steerTo(b, b.sx, b.sy - 1, b.spd, CONFIG.ACC_O, dt); return; }
    const dq = dist(best, qb) || 1; const k = Math.min(2.2, Math.max(0.6, dq - 0.6));
    steerTo(b, qb.x + (best.x - qb.x) / dq * k, qb.y + (best.y - qb.y) / dq * k, b.spd, CONFIG.ACC_O, dt); return;
  }
  const R = ROUTES[P.pid];
  if (b.mode === 'screen' && !P.caught) { if (P.t < R.OLout) steerTo(b, b.sx, b.sy - 0.5, b.spd, CONFIG.ACC_O, dt); else steerTo(b, b.sx + 7.5, P.los - 0.6, b.spd, CONFIG.ACC_O, dt); return; }
  if (R.OLpull && b.role === 'OL' && P.t < 0.9) { steerTo(b, b.sx + 8, P.los + 0.5, b.spd, CONFIG.ACC_O, dt); return; }
  // lead / stalk: attack the defender most threatening the ball
  const ref = car || (P.ball.st === 'air' ? { x: P.ball.tx, y: P.ball.ty } : qb);
  let best = null, bd = 1e9;
  for (const d of E) if (d.team === 'D' && d.eng < 0) {
    const dc = dist(d, ref), db = dist(d, b);
    if (b.mode === 'stalk' && !P.caught && P.kind === 'pass') { if (db < bd) { bd = db; best = d; } continue; }
    const sc = dc + db * 0.8 - (d.y > ref.y - 1 ? 2 : 0); if (dc < 10 && sc < bd) { bd = sc; best = d; }
  }
  if (!best) { steerTo(b, ref.x + (b.x > ref.x ? 2 : -2), ref.y + 3, b.spd, CONFIG.ACC_O, dt); return; }
  steerTo(b, (best.x * 2 + ref.x) / 3, (best.y * 2 + ref.y) / 3, b.spd, CONFIG.ACC_O, dt);
}
function resolveCatch(s, P) {
  const B = P.ball; const r = P.E[B.target];
  const aim = { x: B.tx, y: B.ty };
  if (B.kind === 'pitch') { P.ball = { st: 'held', h: B.target, x: r.x, y: r.y, z: 1 }; P.ev.push({ k: 'catch', soft: true }); return; }
  if (aim.y > 110) { end(s, P, 'inc', P.los, { x: B.tx, why: 'miss' }); return; }
  const rd = dist(r, aim);
  let dd = 99, nd = null;
  for (const d of P.E) if (d.team === 'D' && P.t >= d.stunUntil) { const x = dist(d, aim); if (x < dd) { dd = x; nd = d; } }
  const deep = B.T > 0.9;
  // the right call reads the throw: defenders play the ball as if closer; the wrong call is a step late
  let pInt = dd < 1.5 ? Math.max(0, 0.2 - 0.13 * dd) + (deep ? 0.04 : 0) - 0.03 * P.m : 0;
  if (dd < 3.5) pInt += 0.05 * Math.max(0, -P.m);
  dd = dd - 1.1 * Math.max(0, -P.m) + 0.3 * Math.max(0, P.m);
  pInt = clamp(pInt, 0, 0.4);
  if (rd > CONFIG.CATCH_R) { // ball not near the receiver
    if (nd && dd < 1.2 && rnd(s) < pInt + 0.15) { end(s, P, 'int', B.ty, { x: B.tx, by: nd.key }); return; }
    end(s, P, 'inc', P.los, { x: B.tx, why: 'miss' }); return;
  }
  const pCatch = dd >= 3 ? 0.96 : clamp(0.36 + 0.2 * dd + 0.06 * P.m, 0.12, 0.96);
  const roll = rnd(s);
  if (roll < pInt) { end(s, P, 'int', B.ty, { x: B.tx, by: nd.key }); return; }
  if (roll < pInt + (1 - pInt) * pCatch) {
    P.ball = { st: 'held', h: B.target, x: r.x, y: r.y, z: 1 }; P.caught = true; r.vx *= CONFIG.CATCH_SLOW; r.vy *= CONFIG.CATCH_SLOW;
    P.pursuitAt = Math.min(P.pursuitAt, P.t + 0.12);
    P.ev.push({ k: 'catch', contested: dd < 2, x: r.x, y: r.y });
    return;
  }
  end(s, P, 'inc', P.los, { x: B.tx, why: dd < 2 ? 'breakup' : 'drop', by: nd && nd.key });
}

// ---------------- Applying results ----------------
function logEv(s, o) { o.half = s.half; o.clock = Math.max(0, Math.round(s.clock)); o.score = s.score.me + '-' + s.score.op; s.log.push(o); if (s.log.length > 160) s.log.shift(); }
function finishPlay(s) {
  const P = s.play; if (!P || !P.result || s.phase !== 'live') return null;
  const r = P.result; const los = P.los; const ot = s.half >= 3;
  if (!ot) s.clock -= P.t * CONFIG.PLAY_TIME_SCALE;
  let gained = (r.type === 'inc' || r.type === 'int') ? 0 : Math.round(r.y - los);
  if (r.type === 'td') gained = 100 - los;
  const out = { type: r.type, gained, pid: P.pid, call: P.call, look: P.look, first: false, turnover: false, score: 0, text: '' };
  s.stats.me.plays++; if (r.type !== 'int') s.stats.me.yds += gained;
  s.play = null;
  if (r.type === 'td') {
    s.score.me += 7; s.stats.me.tds++; out.score = 7; out.text = 'TOUCHDOWN';
    logEv(s, { who: 'me', k: 'td', pid: P.pid, yds: gained, call: P.call });
    nextPossession(s, 'op', CONFIG.KICKOFF_START); return (s.last = out);
  }
  if (r.type === 'safety') {
    s.score.op += 2; out.text = 'SAFETY'; logEv(s, { who: 'me', k: 'safety', pid: P.pid });
    nextPossession(s, 'op', 35); return (s.last = out);
  }
  if (r.type === 'int') {
    out.turnover = true; out.text = 'INTERCEPTED';
    logEv(s, { who: 'me', k: 'int', pid: P.pid, call: P.call, look: P.look });
    const y = r.y >= 100 ? 80 : clamp(r.y, 1, 99);
    nextPossession(s, 'op', 100 - y); return (s.last = out);
  }
  const newLos = r.type === 'inc' ? los : clamp(Math.round(r.y * 2) / 2, 1, 99);
  const clockRuns = (r.type === 'tackle' || r.type === 'sack');
  out.text = r.type === 'inc' ? (r.why === 'breakup' ? 'BROKEN UP' : 'INCOMPLETE') : r.type === 'sack' ? 'SACKED' : r.type === 'oob' ? 'OUT OF BOUNDS' : (gained >= 0 ? 'GAIN OF ' + gained : 'LOSS OF ' + (-gained));
  if (gained >= 20) logEv(s, { who: 'me', k: 'big', pid: P.pid, yds: gained, call: P.call, look: P.look });
  if (r.type === 'sack') logEv(s, { who: 'me', k: 'sack', pid: P.pid, call: P.call });
  s.los = newLos;
  if (newLos >= s.ltg) { s.down = 1; s.ltg = Math.min(100, newLos + 10); out.first = true; }
  else {
    s.down++;
    if (s.down > 4) {
      out.turnover = true; out.text += ' · TURNOVER ON DOWNS';
      logEv(s, { who: 'me', k: 'downs', pid: P.pid });
      nextPossession(s, 'op', 100 - newLos); return (s.last = out);
    }
  }
  if (clockRuns && !ot) s.clock -= CONFIG.PACE[s.pace];
  if (!ot && s.clock <= 0) { endHalf(s); return (s.last = out); }
  startDown(s);
  return (s.last = out);
}
function kickFG(s, acc) {
  if (!canFG(s)) return null;
  const d = fgDist(s); const thr = 0.25 + clamp((d - 20) / 45, 0, 1.2) * 0.6;
  acc = clamp(+acc || 0, 0, 1);
  const good = acc >= thr; const ot = s.half >= 3;
  if (!ot) s.clock -= 5;
  const out = { type: good ? 'fg' : 'fgmiss', dist: d, gained: 0, text: good ? d + '-YARD FIELD GOAL IS GOOD' : d + '-YARD KICK MISSES', score: good ? 3 : 0, turnover: !good };
  logEv(s, { who: 'me', k: good ? 'fg' : 'fgmiss', dist: d });
  if (good) { s.score.me += 3; nextPossession(s, 'op', CONFIG.KICKOFF_START); }
  else nextPossession(s, 'op', clamp(100 - (s.los - 7), 20, 99));
  return (s.last = out);
}
function punt(s) {
  if (!canPunt(s)) return null;
  const net = CONFIG.PUNT_NET + Math.round(rnd(s) * 10 - 4); const land = s.los + net;
  s.clock -= 8;
  const start = land >= 100 ? 20 : clamp(100 - land, 1, 99);
  const out = { type: 'punt', gained: 0, text: land >= 100 ? 'PUNT · TOUCHBACK' : 'PUNT OF ' + net, turnover: true };
  logEv(s, { who: 'me', k: 'punt' });
  nextPossession(s, 'op', start);
  return (s.last = out);
}
function nextPossession(s, who, startY) {
  const ot = s.half >= 3;
  if (!ot && s.clock <= 0) { endHalf(s); return; }
  if (ot) {
    if (who === 'op') { startOppDrive(s, CONFIG.OT_START); return; }
    // the opponent just finished its OT drive
    if (s.score.me !== s.score.op || s.otRound >= CONFIG.OT_MAX_ROUNDS) { finalize(s); return; }
    s.otRound++; startMyDrive(s, CONFIG.OT_START); return;
  }
  if (who === 'op') startOppDrive(s, startY); else startMyDrive(s, startY);
}
function startMyDrive(s, y) { s.poss = 'me'; s.los = y; s.down = 1; s.ltg = Math.min(100, y + 10); s.drive = null; startDown(s); }
function startOppDrive(s, y) {
  s.poss = 'op'; s.phase = 'defcall'; s.play = null;
  s.drive = { y, down: 1, ltg: Math.min(100, y + 10), call: null, third: null, need: 'base', ev: [], plays: 0, startY: y, done: false };
}
function endHalf(s) {
  if (s.half === 1) { s.half = 2; s.clock = CONFIG.HALF_SECS; logEv(s, { who: 'x', k: 'half' }); startOppDrive(s, CONFIG.KICKOFF_START); s.halfJustEnded = true; return; }
  if (s.half === 2) {
    if (s.score.me === s.score.op) { s.half = 3; s.clock = 0; s.otRound = 1; logEv(s, { who: 'x', k: 'ot' }); startMyDrive(s, CONFIG.OT_START); return; }
    finalize(s); return;
  }
  finalize(s);
}
function finalize(s) {
  s.phase = 'final'; s.play = null; s.drive = null;
  const res = s.score.me > s.score.op ? 'W' : s.score.me < s.score.op ? 'L' : 'T';
  s.final = { res, me: s.score.me, op: s.score.op, margin: s.score.me - s.score.op, moments: keyMoments(s) };
}
function keyMoments(s) {
  const pri = { td: 5, int: 5, fumble: 5, downs: 4, big: 3, fg: 3, sack: 2, fgmiss: 3, safety: 4, stop: 3, optd: 4, opfg: 2, opint: 4 };
  const L = s.log.filter(e => pri[e.k]).map((e, i) => ({ e, i, p: pri[e.k] + (e.yds || 0) / 40 }));
  L.sort((a, b) => b.p - a.p || b.i - a.i);
  return L.slice(0, 3).sort((a, b) => a.i - b.i).map(x => x.e);
}

// ---------------- Opponent drive (sim) ----------------
function oppWeights(s, down, togo) {
  const b = bucketOf(down, togo); const w = T(s).offTend[b].slice();
  // CPU offense adapts to your favourite defensive call
  CATS.forEach((c, i) => { let best = 0; for (const d of DEFS) if (DEF_O[d][c] === 1) best += s.defHeat[d] || 0; w[i] *= 1 + 0.14 * best; });
  return w;
}
function oppScout(s) {
  const D = s.drive; if (!D) return null;
  const b = bucketOf(D.down, D.ltg - D.y); const w = T(s).offTend[b]; const tot = w.reduce((a, c) => a + c, 0) || 1;
  return { bucket: b, pct: CATS.map((c, i) => Math.round(100 * w[i] / tot)) };
}
function callDefense(s, call) {
  if (s.phase !== 'defcall' || !s.drive || DEFS.indexOf(call) < 0) return null;
  const D = s.drive;
  if (D.need === 'base') D.call = call; else D.third = call;
  for (const d of DEFS) s.defHeat[d] = Math.max(0, (s.defHeat[d] || 0) - 0.3);
  s.defHeat[call] = Math.min(3, (s.defHeat[call] || 0) + 1);
  D.need = null;
  const t = T(s); const off = t.off + CONFIG.OPP_OFF + (s.iron ? CONFIG.IRON.off : 0);
  const newEv = [];
  let outcome = null;
  for (let guard = 0; guard < 40 && !outcome; guard++) {
    const ot = s.half >= 3;
    if (!ot && s.clock <= 0) { outcome = { k: 'clock' }; break; }
    const togo = D.ltg - D.y;
    if (D.down >= 3 && D.askedAt !== D.down + ':' + D.ltg + ':' + D.plays && (D.down === 3)) { D.askedAt = D.down + ':' + D.ltg + ':' + D.plays; D.need = 'third'; return { pause: true, ev: newEv }; }
    const diff = s.score.op - s.score.me; // opponent perspective
    const late = s.half === 2 && s.clock < 120;
    if (D.down === 4) {
      const fd = 100 - D.y + 17;
      const needTD = ot ? diff < -3 : (late && diff < -3 && s.clock < 45);
      let choice;
      if (needTD) choice = 'go';
      else if (fd <= 50 && !(togo <= 1 && D.y >= 92 && diff < 0)) choice = 'kick';
      else if (ot) choice = fd <= 54 ? 'kick' : 'go';
      else if ((togo <= 2 && D.y >= 40) || (late && diff < 0)) choice = 'go';
      else choice = 'punt';
      if (choice === 'kick') {
        const p = clamp(1.02 - (fd - 20) * 0.019, 0.3, 0.97) * t.kick;
        if (!ot) s.clock -= 5;
        if (rnd(s) < p) { s.score.op += 3; outcome = { k: 'opfg', fd }; } else outcome = { k: 'opfgmiss', fd, y: D.y };
        break;
      } else if (choice === 'punt') {
        const net = CONFIG.PUNT_NET + Math.round(rnd(s) * 10 - 4); const land = D.y + net; s.clock -= 8;
        outcome = { k: 'oppunt', start: land >= 100 ? 20 : clamp(100 - land, 1, 99) }; break;
      }
    }
    const callNow = D.down >= 3 && D.third ? D.third : D.call;
    const ci = pickW(s, oppWeights(s, D.down, togo)); const cat = CATS[ci];
    let o = DEF_O[callNow][cat];
    let g = 0, inc = false, sack = false, to = false, big = false;
    const pTO = clamp(0.024 - 0.016 * o + (cat === 'DEEP' ? 0.012 : 0), 0.006, 0.06);
    if (rnd(s) < pTO) to = true;
    else if (cat === 'RUN') { g = Math.round(gauss(s, 4.2 + 4.0 * o + off * 0.8, 3.0)); if (rnd(s) < 0.03 + 0.04 * Math.max(0, o)) { g += 10 + Math.round(rnd(s) * 22); big = true; } }
    else if (cat === 'QUICK') { if (rnd(s) < 0.28 - 0.17 * o) inc = true; else { g = Math.round(gauss(s, 6.2 + 3.8 * o + off * 0.8, 3.6)); if (rnd(s) < 0.03 + 0.04 * Math.max(0, o)) { g += 12 + Math.round(rnd(s) * 20); big = true; } } }
    else { if (rnd(s) < (callNow === 'BLITZ' ? 0.15 : 0.05)) { sack = true; g = -Math.round(5 + rnd(s) * 5); } else if (rnd(s) < 0.48 - 0.2 * o) inc = true; else { g = Math.round(gauss(s, 22 + 6 * o + off, 7)); big = g >= 20; } }
    g = clamp(g, -12, 100);
    const ev = { down: D.down, togo, y: D.y, cat, call: callNow, g, inc, sack, to, big };
    D.plays++; s.stats.op.plays++;
    // clock
    let runs = !inc && !to;
    let pace = 22; if (late) pace = diff > 0 ? 36 : diff < 0 ? 7 : 22;
    if (!ot) { s.clock -= 6 + (runs ? pace : 0); }
    if (to) { newEv.push(ev); D.ev.push(ev); outcome = { k: 'opint', y: D.y }; break; }
    D.y += inc ? 0 : g; s.stats.op.yds += inc ? 0 : g;
    if (D.y >= 100) { D.y = 100; ev.td = true; newEv.push(ev); D.ev.push(ev); s.score.op += 7; outcome = { k: 'optd' }; break; }
    if (D.y <= 0) { newEv.push(ev); D.ev.push(ev); s.score.me += 2; outcome = { k: 'opsafety' }; break; }
    if (D.y >= D.ltg) { D.down = 1; D.ltg = Math.min(100, D.y + 10); ev.first = true; }
    else { D.down++; if (D.down > 4) { newEv.push(ev); D.ev.push(ev); outcome = { k: 'stop', y: D.y }; break; } }
    newEv.push(ev); D.ev.push(ev);
  }
  if (!outcome) outcome = { k: 'stop', y: D.y };
  D.done = true; D.outcome = outcome;
  logEv(s, { who: 'op', k: outcome.k, plays: D.plays, yds: D.y - D.startY });
  const ret = { ev: newEv, outcome };
  // hand the ball back
  if (outcome.k === 'clock') { endHalf(s); return ret; }
  let start = CONFIG.KICKOFF_START;
  if (outcome.k === 'oppunt') start = outcome.start;
  else if (outcome.k === 'stop') start = clamp(100 - outcome.y, 1, 99);
  else if (outcome.k === 'opint') start = clamp(100 - outcome.y, 1, 99);
  else if (outcome.k === 'opfgmiss') start = clamp(100 - (outcome.y - 7), 20, 99);
  else if (outcome.k === 'opsafety') start = 35;
  nextPossession(s, 'me', start);
  return ret;
}

// ---------------- Save validation ----------------
function validState(s) {
  try {
    if (!s || typeof s !== 'object' || s.schema !== CONFIG.SCHEMA) return false;
    if (['call', 'defcall', 'final'].indexOf(s.phase) < 0) return false;
    if (!s.opp || !Array.isArray(s.opp.defTend && s.opp.defTend.EARLY) || typeof s.opp.name !== 'string') return false;
    if (!s.score || !isFinite(s.score.me) || !isFinite(s.score.op)) return false;
    if (!isFinite(s.los) || s.los < 0 || s.los > 100 || !isFinite(s.clock) || !(s.down >= 1 && s.down <= 4)) return false;
    if (!isFinite(s.rng) || [1, 2, 3].indexOf(s.half) < 0) return false;
    if (s.phase === 'call' && (DEFS.indexOf(s.defCall) < 0 || DEFS.indexOf(s.look) < 0)) return false;
    if (s.phase === 'defcall' && (!s.drive || !isFinite(s.drive.y))) return false;
    return true;
  } catch (e) { return false; }
}

return {
  CONFIG, PLAY_IDS, DEFS, PLAYS, MATCH, DEF_INFO, CATS, DEF_O, ME, TEAMS, rnd, hashStr, dailyTeam, teamById,
  newGame, scout, oppScout, bucket, callPlay, tick, throwTo, finishPlay, kickFG, punt, callDefense, canFG, canPunt, fgDist,
  legalPlays, validState, predict, aimFor, ROUTES, OFF_POS, alignment, bucketOf, keyMoments, disguiseRate, carrierOf, receivers, mods, clamp,
};
})();
if (typeof module !== 'undefined') module.exports = Core;
/*CORE-END*/
