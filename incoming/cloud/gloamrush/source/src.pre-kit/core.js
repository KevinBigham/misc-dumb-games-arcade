// ===== GLOAMRUSH CORE: pure simulation, no DOM. Exported for Node tests. =====
(function (root) {
'use strict';

// ---------- RNG ----------
function mulberry32(a) {
  a = a >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// Local calendar day key. Rolls over at local midnight (not UTC).
function localDayKey(d) {
  d = d || new Date();
  const p = n => (n < 10 ? '0' : '') + n;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
function dayIndex(key) { // days since epoch for a local key, used for streak math
  const [y, m, dd] = key.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, dd) / 86400000);
}
function keyFromIndex(i) {
  const d = new Date(i * 86400000);
  const p = n => (n < 10 ? '0' : '') + n;
  return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate());
}

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;

// ---------- DATA ----------
const UPG = [
  { id: 'twin', name: 'Twin Sparks', max: 4, d: l => `+1 spark per volley (${l + 1} total)` },
  { id: 'quick', name: 'Quickcast', max: 5, d: () => 'Fire 12% faster' },
  { id: 'dense', name: 'Dense Flame', max: 5, d: () => '+22% spark damage' },
  { id: 'seeker', name: 'Seeker Sparks', max: 3, d: () => 'Sparks curve toward shadows' },
  { id: 'needle', name: 'Needlelight', max: 3, d: () => 'Sparks pierce +1 shadow' },
  { id: 'rico', name: 'Ricochet', max: 3, d: () => 'Sparks bounce to +1 more shadow' },
  { id: 'sharp', name: 'Sharp Ember', max: 4, d: () => '+10% crit chance, crits hit x2.2' },
  { id: 'wings', name: 'Light Wings', max: 4, d: () => '+10% flight speed' },
  { id: 'wax', name: 'Thick Wax', max: 4, d: () => '+20 max HP and heal 20' },
  { id: 'reach', name: 'Wick Reach', max: 4, d: () => '+30% ember pickup range' },
  { id: 'orbit', name: 'Orbiting Lantern', max: 4, d: () => '+1 lantern circles you' },
  { id: 'nova', name: 'Flare Nova', max: 3, d: () => 'Pulse a burning ring every few seconds' },
  { id: 'ash', name: 'Ash Trail', max: 3, d: () => 'Leave burning ash where you fly' },
  { id: 'frost', name: 'Frost Dust', max: 3, d: () => 'Slow shadows near you' },
  { id: 'bloom', name: 'Bloom Burst', max: 3, d: () => 'Shadows may burst on death' },
  { id: 'mend', name: 'Mend', max: 3, d: () => 'Heal 0.6 HP per second' },
  { id: 'thorns', name: 'Thorn Bark', max: 3, d: () => 'Shadows that touch you take damage' },
  { id: 'mwings', name: 'Moth Wings', max: 3, d: () => '+25% graze radius', graze: true },
  { id: 'veil', name: 'Static Veil', max: 3, d: () => 'Each graze fires a homing spark', graze: true },
];
const UPG_BY = {}; UPG.forEach(u => UPG_BY[u.id] = u);

const EVOS = [
  { id: 'glacial', name: 'Glacial Crown', a: 'nova', b: 'frost', d: 'A huge nova every 3s that freezes shadows' },
  { id: 'wbloom', name: 'Wildfire Bloom', a: 'bloom', b: 'dense', d: 'Every kill bursts, and bursts chain' },
  { id: 'thornwheel', name: 'Thornwheel', a: 'orbit', b: 'thorns', d: 'Lanterns grow, spin fast and shred' },
  { id: 'hunter', name: "Hunter's Volley", a: 'seeker', b: 'sharp', d: 'Every 4th volley: 8 homing crit sparks' },
  { id: 'tempest', name: 'Needle Tempest', a: 'needle', b: 'rico', d: 'Endless pierce, sparks split on hit' },
  { id: 'ashgarden', name: 'Ash Garden', a: 'ash', b: 'mend', d: 'Wide ash that heals you while you stand in it' },
  { id: 'phantom', name: 'Phantom Wing', a: 'mwings', b: 'wings', d: 'Graze radius x2 while moving; grazes grant a blink of invulnerability' },
  { id: 'stormveil', name: 'Stormveil', a: 'veil', b: 'orbit', d: 'Each graze makes your lanterns crack a shock ring' },
];
const EVO_BY = {}; EVOS.forEach(e => EVO_BY[e.id] = e);
function evoPartnersOf(id) { const r = []; EVOS.forEach(e => { if (e.a === id) r.push([e, e.b]); else if (e.b === id) r.push([e, e.a]); }); return r; }

const ETYPES = {
  mite:    { hp: 10, spd: 74, r: 9, dmg: 8, xp: 4 },
  dart:    { hp: 7, spd: 150, r: 8, dmg: 7, xp: 4, zig: 1 },
  spitter: { hp: 18, spd: 62, r: 11, dmg: 8, xp: 8, ranged: { dist: 210, cd: 2.8, fan: 3, spread: 0.5, spd: 125 } },
  hollow:  { hp: 95, spd: 46, r: 20, dmg: 16, xp: 18, brute: 1 },
  weaver:  { hp: 34, spd: 54, r: 13, dmg: 10, xp: 12, ranged: { dist: 250, cd: 3.6, ring: 8, spd: 115 } },
  wraith:  { hp: 260, spd: 52, r: 24, dmg: 20, xp: 45, elite: 1, brute: 1, ranged: { dist: 180, cd: 2.3, spiral: 1, spd: 120 } },
};
const GEM_TIERS = [20, 6, 3, 1];

const WAVES = [
  { t: 25, name: 'THE MITES SWARM', type: 'mite', n: 14 },
  { t: 50, name: 'DUSKWINGS DIVE', type: 'dart', n: 12 },
  { t: 78, name: 'THE SPITTER CHOIR', type: 'spitter', n: 8 },
  { t: 102, name: 'HOLLOWS MARCH', type: 'hollow', n: 6 },
  { t: 128, name: 'WEAVERS AT THE HEDGE', type: 'weaver', n: 8 },
  { t: 150, name: 'ALL THE GLOAM', type: 'mite', n: 26, elite: 1 },
  { t: 165, name: 'THE WRAITHS', type: 'wraith', n: 2 },
];
const BOSS_T = 180;

const RAR = [
  { id: 'c', name: 'Common', w: 70, col: '#d9cfa8', glow: 3, hr: 1 },
  { id: 'u', name: 'Uncommon', w: 22, col: '#7fd6a6', glow: 6, hr: 2 },
  { id: 'r', name: 'Rare', w: 7, col: '#7fb4ff', glow: 12, hr: 4 },
  { id: 'm', name: 'Mythic', w: 1, col: '#ff9de6', glow: 30, hr: 8 },
];
// cond: act>=N (a), hero, wild, evos2, long, boss
const MOTHS = [
  // 15 commons
  { id: 'miller', name: 'Dusk Miller', r: 0, mm: [28, 40], c: ['#c9b48a', '#8a7556'] },
  { id: 'lacebell', name: 'Lacebell', r: 0, mm: [22, 34], c: ['#e8dcc0', '#b7a37a'] },
  { id: 'ashwing', name: 'Ash Wing', r: 0, mm: [30, 44], c: ['#a59e98', '#6f6862'] },
  { id: 'tallow', name: 'Tallow Moth', r: 0, mm: [26, 38], c: ['#f0e2a4', '#c4ad5f'] },
  { id: 'moss', name: 'Moss Carpet', r: 0, mm: [24, 33], c: ['#9fbf86', '#5f7f4a'] },
  { id: 'hedgeswift', name: 'Hedge Swift', r: 0, mm: [32, 46], c: ['#c79a6e', '#86603e'] },
  { id: 'clover', name: 'Clover Looper', r: 0, mm: [20, 30], c: ['#b9d79b', '#7c9a5f'] },
  { id: 'brindle', name: 'Brindle Dart', r: 0, mm: [30, 42], c: ['#b08a6a', '#6e5440'] },
  { id: 'chalk', name: 'Chalk Ermine', r: 0, mm: [34, 48], c: ['#f4f1ea', '#a8a49a'] },
  { id: 'dun', name: 'Dun Bar', r: 0, mm: [26, 36], c: ['#c6a77d', '#8b6d48'] },
  { id: 'rush', name: 'Rush Veneer', r: 0, mm: [18, 26], c: ['#dcc99a', '#a08b5a'] },
  { id: 'smoke', name: 'Smoky Wave', r: 0, mm: [24, 34], c: ['#9d97a8', '#635d70'], a: 2 },
  { id: 'gate', name: 'Gatekeeper', r: 0, mm: [36, 48], c: ['#e3a35a', '#9d6526'], a: 2 },
  { id: 'umber', name: 'Umber Thorn', r: 0, mm: [38, 52], c: ['#a8744a', '#6a4528'], a: 3 },
  { id: 'nightshade', name: 'Nightshade Pug', r: 0, mm: [16, 24], c: ['#8f86b8', '#57507d'], a: 3 },
  // 8 uncommons
  { id: 'emberlace', name: 'Ember Lacewing', r: 1, mm: [30, 44], c: ['#ffb36b', '#d1652a'] },
  { id: 'glasswing', name: 'Glasswing', r: 1, mm: [36, 52], c: ['#cfefff', '#7fb8d6'] },
  { id: 'rosy', name: 'Rosy Footman', r: 1, mm: [26, 36], c: ['#ffb0b9', '#c46a7a'] },
  { id: 'lunar', name: 'Lunar Hornet', r: 1, mm: [38, 50], c: ['#f6e27a', '#b39a2c'], a: 2 },
  { id: 'jade', name: 'Jade Swallowtail', r: 1, mm: [44, 60], c: ['#6fe0b0', '#2e9a72'], a: 2 },
  { id: 'bolete', name: 'Bolete Moth', r: 1, mm: [40, 54], c: ['#c98a52', '#7a4b23'], hero: 'beetle' },
  { id: 'lace2', name: 'Silk Lacewing', r: 1, mm: [28, 40], c: ['#d6ffcf', '#86c27a'], hero: 'lacewing' },
  { id: 'violet', name: 'Violet Underwing', r: 1, mm: [48, 64], c: ['#b18cff', '#6a45c4'], a: 3 },
  // 5 rares
  { id: 'cinder', name: 'Cinder Sphinx', r: 2, mm: [58, 76], c: ['#ff7a3a', '#9c2f10'], wild: 1 },
  { id: 'hollowhawk', name: 'Hollow Hawk', r: 2, mm: [70, 92], c: ['#7a8cff', '#3a3f9c'], evos2: 1 },
  { id: 'opal', name: 'Opal Atlas', r: 2, mm: [90, 120], c: ['#ffe9c7', '#d29dff'], a: 3 },
  { id: 'comet', name: 'Comet Luna', r: 2, mm: [80, 110], c: ['#b9ffe6', '#4fc7a1'], a: 2 },
  { id: 'starling', name: 'Starling Emperor', r: 2, mm: [76, 100], c: ['#ffd6f2', '#c46aa6'], boss: 1 },
  // 2 mythics
  { id: 'dawnmoth', name: 'Dawnmoth', r: 3, mm: [110, 140], c: ['#fff1b8', '#ff9de6'], long: 1 },
  { id: 'gloamqueen', name: 'Gloam Queen', r: 3, mm: [120, 160], c: ['#e6d1ff', '#ff6fae'], a: 3 },
];
const MOTH_BY = {}; MOTHS.forEach(m => MOTH_BY[m.id] = m);

const HEROES = [
  { id: 'wick', name: 'Wick', cost: 0, d: 'Balanced firefly knight', hp: 100, spd: 1, twin: 0, graze: 1, orbit: 0 },
  { id: 'lacewing', name: 'Dusk Lacewing', cost: 350, d: 'Fragile. Starts with 2 sparks and +15% graze radius', hp: 70, spd: 1.06, twin: 1, graze: 1.15, orbit: 0 },
  { id: 'beetle', name: 'Bolete Beetle', cost: 800, d: 'Tank. Starts with 2 lanterns. Graze radius -10%', hp: 150, spd: 0.86, twin: 0, graze: 0.9, orbit: 2 },
];
const HERO_BY = {}; HEROES.forEach(h => HERO_BY[h.id] = h);

const META = [
  { id: 'wax', name: 'Thick Wax', max: 5, base: 60, d: '+15 max HP' },
  { id: 'pot', name: 'Potent Flame', max: 5, base: 80, d: '+8% damage' },
  { id: 'wings', name: 'Quick Wings', max: 4, base: 70, d: '+5% flight speed' },
  { id: 'reach', name: 'Long Glow', max: 4, base: 50, d: '+15% pickup range' },
  { id: 'wide', name: 'Wide Wings', max: 3, base: 90, d: '+8% graze radius' },
  { id: 'start', name: 'Head Start', max: 3, base: 120, d: 'A free card at the start of each run' },
  { id: 'reroll', name: 'Second Thoughts', max: 2, base: 150, d: '+1 card reroll per run' },
  { id: 'wind', name: 'Second Wind', max: 1, base: 400, d: 'Once per run, rise again at half HP' },
];
const META_BY = {}; META.forEach(m => META_BY[m.id] = m);
function metaCost(id, lvl) { return META_BY[id].base * (lvl + 1); }

const SKINS = [
  { id: 'amber', name: 'Amber Wick', need: 0, a: '#ffb547', b: '#fff3c4' },
  { id: 'rose', name: 'Rosefire', need: 5, a: '#ff7aa8', b: '#ffe0ec' },
  { id: 'jade', name: 'Jade Lamp', need: 10, a: '#5ff0b0', b: '#dcfff0' },
  { id: 'frost', name: 'Frostglow', need: 15, a: '#7fd2ff', b: '#e6f7ff' },
  { id: 'violet', name: 'Violet Hour', need: 20, a: '#b48cff', b: '#efe6ff' },
  { id: 'gold', name: 'Sunken Gold', need: 25, a: '#ffd84a', b: '#fffbe0' },
  { id: 'dawn', name: 'First Light', need: 30, a: '#fff7e8', b: '#ffffff' },
];

const MPOOL = [
  { id: 'graze', scope: 'run', tiers: [[30, 40], [60, 70], [100, 110]], t: n => `Graze ${n} times in one run` },
  { id: 'chain', scope: 'run', tiers: [[3, 40], [4, 60], [5, 90]], t: n => `Reach a x${n} graze chain` },
  { id: 'wild', scope: 'run', tiers: [[2, 40], [3, 70], [4, 100]], t: n => `Trigger ${n} Wildfires in one run` },
  { id: 'moths', scope: 'day', tiers: [[2, 40], [4, 70], [6, 100]], t: n => `Catch ${n} moths today` },
  { id: 'evolve', scope: 'day', tiers: [[1, 60], [1, 60], [2, 110]], t: n => n === 1 ? 'Evolve once today' : `Evolve ${n} times today` },
  { id: 'survive', scope: 'run', tiers: [[90, 40], [120, 70], [180, 110]], t: n => `Survive ${fmtT(n)} without Second Wind` },
  { id: 'runs', scope: 'day', tiers: [[3, 40], [5, 70], [7, 100]], t: n => `Fly ${n} runs today` },
  { id: 'kills', scope: 'run', tiers: [[250, 40], [450, 70], [700, 110]], t: n => `Defeat ${n} shadows in one run` },
  { id: 'bank', scope: 'run', tiers: [[1, 40], [2, 80], [2, 80]], t: n => n === 1 ? 'Bank glow at a Hearth Stone' : 'Bank at both Hearth Stones in one run' },
];
const MPOOL_BY = {}; MPOOL.forEach(m => MPOOL_BY[m.id] = m);
function fmtT(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

// ---------- SAVE ----------
function defSave() {
  return {
    v: 1, glow: 0, bestTime: 0, bestScore: 0, wins: 0, runs: 0, kills: 0, firstRunDone: false,
    meta: { wax: 0, pot: 0, wings: 0, reach: 0, start: 0, reroll: 0, wind: 0, wide: 0 },
    heroes: { wick: true }, hero: 'wick', skin: 'amber',
    evolutions: [], moths: {},
    daily: { key: '', best: 0, firstDone: false },
    mis: null,
    streak: { n: 0, last: '', shields: 1, shieldWeek: -1 },
    lastSave: 0,
    settings: { music: 0.6, sfx: 0.8, shake: 2, nums: 1, flash: 1, haptics: 1, rm: 0 },
    muted: false,
  };
}
// Type-checked merge: unknown keys dropped, wrong types fall back to defaults.
function mergeSave(raw) {
  const d = defSave();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return d;
  const num = (v, def, lo, hi) => (typeof v === 'number' && isFinite(v)) ? clamp(v, lo, hi) : def;
  const bool = (v, def) => typeof v === 'boolean' ? v : def;
  const str = (v, def) => typeof v === 'string' ? v : def;
  d.glow = Math.floor(num(raw.glow, 0, 0, 1e9));
  d.bestTime = num(raw.bestTime, 0, 0, 1e7);
  d.bestScore = Math.floor(num(raw.bestScore, 0, 0, 1e12));
  d.wins = Math.floor(num(raw.wins, 0, 0, 1e7));
  d.runs = Math.floor(num(raw.runs, 0, 0, 1e7));
  d.kills = Math.floor(num(raw.kills, 0, 0, 1e12));
  d.firstRunDone = bool(raw.firstRunDone, d.runs > 0);
  if (raw.meta && typeof raw.meta === 'object') for (const k in d.meta) d.meta[k] = Math.floor(num(raw.meta[k], 0, 0, META_BY[k].max));
  if (raw.heroes && typeof raw.heroes === 'object') for (const h of HEROES) if (raw.heroes[h.id] === true) d.heroes[h.id] = true;
  d.heroes.wick = true;
  d.hero = (typeof raw.hero === 'string' && d.heroes[raw.hero]) ? raw.hero : 'wick';
  d.skin = (typeof raw.skin === 'string' && SKINS.some(s => s.id === raw.skin)) ? raw.skin : 'amber';
  if (Array.isArray(raw.evolutions)) d.evolutions = raw.evolutions.filter((e, i, a) => typeof e === 'string' && EVO_BY[e] && a.indexOf(e) === i);
  if (raw.moths && typeof raw.moths === 'object') for (const id in raw.moths) {
    const m = raw.moths[id];
    if (MOTH_BY[id] && m && typeof m === 'object') d.moths[id] = { n: Math.max(1, Math.floor(num(m.n, 1, 1, 1e7))), bestMm: num(m.bestMm, 0, 0, 999), first: str(m.first, '') };
  }
  if (raw.daily && typeof raw.daily === 'object') d.daily = { key: str(raw.daily.key, ''), best: Math.floor(num(raw.daily.best, 0, 0, 1e12)), firstDone: bool(raw.daily.firstDone, false) };
  if (raw.mis && typeof raw.mis === 'object' && typeof raw.mis.key === 'string' && Array.isArray(raw.mis.list) && raw.mis.list.length === 3) {
    const list = raw.mis.list.map(m => (m && MPOOL_BY[m.id]) ? { id: m.id, n: Math.max(1, Math.floor(num(m.n, 1, 1, 1e6))), rw: Math.floor(num(m.rw, 40, 0, 1000)), prog: num(m.prog, 0, 0, 1e7), done: bool(m.done, false) } : null);
    if (list.every(Boolean)) d.mis = { key: raw.mis.key, list };
  }
  if (raw.streak && typeof raw.streak === 'object') d.streak = { n: Math.floor(num(raw.streak.n, 0, 0, 1e5)), last: str(raw.streak.last, ''), shields: Math.floor(num(raw.streak.shields, 1, 0, 1)), shieldWeek: Math.floor(num(raw.streak.shieldWeek, -1, -1, 1e7)) };
  d.lastSave = num(raw.lastSave, 0, 0, 1e15);
  if (raw.settings && typeof raw.settings === 'object') {
    const s = raw.settings, ds = d.settings;
    ds.music = num(s.music, ds.music, 0, 1); ds.sfx = num(s.sfx, ds.sfx, 0, 1);
    ds.shake = Math.floor(num(s.shake, ds.shake, 0, 2));
    ds.nums = num(s.nums, ds.nums, 0, 1) ? 1 : 0; ds.flash = num(s.flash, ds.flash, 0, 1) ? 1 : 0;
    ds.haptics = num(s.haptics, ds.haptics, 0, 1) ? 1 : 0; ds.rm = num(s.rm, ds.rm, 0, 1) ? 1 : 0;
  }
  d.muted = bool(raw.muted, false);
  return d;
}

// ---------- MISSIONS / STREAK / OFFLINE (pure, operate on a save) ----------
function ensureMissions(save, dayKey) {
  if (save.mis && save.mis.key === dayKey) return false;
  const rng = mulberry32(hashStr('gloamrush:mis:' + dayKey));
  const ids = MPOOL.map(m => m.id);
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  // always include one day-scope mission
  let pick = ids.slice(0, 3);
  if (!pick.some(id => MPOOL_BY[id].scope === 'day')) pick[2] = ids.find(id => MPOOL_BY[id].scope === 'day');
  const list = pick.map((id, i) => { const tr = MPOOL_BY[id].tiers[i]; return { id, n: tr[0], rw: tr[1], prog: 0, done: false }; });
  save.mis = { key: dayKey, list };
  return true;
}
function missionText(m) { return MPOOL_BY[m.id].t(m.n); }
// value for a run-scope mission from run stats
function missionRunValue(id, st) {
  switch (id) {
    case 'graze': return st.grazes; case 'chain': return st.bestChain; case 'wild': return st.wildfires;
    case 'survive': return st.surviveNoWind; case 'kills': return st.kills; case 'bank': return st.banks;
    default: return 0;
  }
}
// live check during a run: returns list of missions newly completed. dayAdd = {moths, evolve, runs} increments this run so far.
function missionsLive(save, st, dayBase) {
  if (!save.mis) return [];
  const out = [];
  for (const m of save.mis.list) {
    if (m.done) continue;
    const def = MPOOL_BY[m.id];
    let v;
    if (def.scope === 'run') v = Math.max(m.prog, missionRunValue(m.id, st));
    else v = m.prog + (dayBase[m.id] || 0);
    if (v >= m.n) out.push(m);
  }
  return out;
}
// commit run results into missions. returns {completed:[...], reward}
function commitMissions(save, st, dayAdd) {
  const res = { completed: [], reward: 0 };
  if (!save.mis) return res;
  for (const m of save.mis.list) {
    if (m.done) continue;
    const def = MPOOL_BY[m.id];
    if (def.scope === 'run') m.prog = Math.max(m.prog, missionRunValue(m.id, st));
    else m.prog += (dayAdd[m.id] || 0);
    if (m.prog >= m.n) { m.prog = m.n; m.done = true; res.completed.push(m); res.reward += m.rw; }
  }
  return res;
}
function weekOf(dayKey) { return Math.floor((dayIndex(dayKey) + 3) / 7); }
// Mark today on the streak (call when a mission completes). Returns {n, usedShield, grew}
function markStreak(save, dayKey) {
  const s = save.streak, wk = weekOf(dayKey);
  if (s.shieldWeek !== wk) { s.shieldWeek = wk; s.shields = 1; }
  if (s.last === dayKey) return { n: s.n, usedShield: false, grew: false };
  const today = dayIndex(dayKey);
  let used = false;
  if (s.last) {
    const gap = today - dayIndex(s.last);
    if (gap === 1) s.n += 1;
    else if (gap === 2 && s.shields > 0) { s.shields -= 1; s.n += 1; used = true; }
    else s.n = 1;
  } else s.n = 1;
  s.last = dayKey;
  return { n: s.n, usedShield: used, grew: true };
}
// streak value as shown (0 if lapsed beyond forgiveness)
function streakShown(save, dayKey) {
  const s = save.streak; if (!s.last) return 0;
  const gap = dayIndex(dayKey) - dayIndex(s.last);
  if (gap <= 1) return s.n;
  if (gap === 2 && (s.shields > 0 || s.shieldWeek !== weekOf(dayKey))) return s.n;
  return 0;
}
const OFFLINE_CAP_H = 8;
function mothGlowRate(save) { let r = 0; for (const id in save.moths) { const m = MOTH_BY[id]; if (m) r += RAR[m.r].hr; } return r; }
function offlineGain(save, now) {
  if (!save.lastSave || now <= save.lastSave) return 0; // clock rolled back or first launch: nothing
  const h = Math.min(OFFLINE_CAP_H, (now - save.lastSave) / 3600000);
  return Math.floor(h * mothGlowRate(save));
}

// ---------- WORLD ----------
function makeWorld(o) {
  o = o || {};
  const seed = (o.seed >>> 0) || 1;
  const hero = HERO_BY[o.hero] || HERO_BY.wick;
  const meta = Object.assign({ wax: 0, pot: 0, wings: 0, reach: 0, start: 0, reroll: 0, wind: 0, wide: 0 }, o.meta || {});
  const w = {
    seed, daily: !!o.daily, tutorial: !!o.tutorial, hero: hero.id, meta,
    knownEvos: (o.knownEvos || []).slice(), knownMoths: Object.assign({}, o.knownMoths || {}),
    rngSpawn: mulberry32(seed ^ 0xA5A5A5),
    rngMoth: mulberry32(seed ^ 0x3C3C3C),
    rngComet: mulberry32(seed ^ 0x5F5F5F),
    rngFx: mulberry32(seed ^ 0x777777),
    vw: o.vw || 400, vh: o.vh || 800,
    t: 0, act: 1, over: null, dawn: false, longNight: false, longT: 0,
    p: { x: 0, y: 0, vx: 0, vy: 0, r: 11, hp: 0, maxHp: 0, inv: 0, moving: false, face: 0 },
    up: {}, evos: [],
    level: 1, xp: 0, pending: 0, choices: null, rerolls: 1 + meta.reroll, rerollIdx: 0, levelIdx: 0,
    enemies: [], ebul: [], pbul: [], gems: [], puddles: [], moths: [], comet: null, stone: null, boss: null,
    fireT: 0.6, volley: 0, novaT: 3, ashT: 0, orbA: 0,
    spawnT: o.tutorial ? 2.6 : 1.2, waveI: 0, bossWarned: false, tutSpit: false,
    mothT: o.tutorial ? 40 : 35 + 0, cometT: 0, firstMothScripted: !!o.tutorial,
    flare: 0, wild: 0, chain: 0, lastGrazeT: -9, lastHitT: -9, grazeQ: [], grazeTimes: [],
    starfall: 0, swarmHands: 0, windUsed: false,
    score: 0, glowBonus: 0, banked: 0, stonesBanked: 0,
    stats: { kills: 0, grazes: 0, bestChain: 0, wildfires: 0, banks: 0, catches: 0, surviveNoWind: 0, evolves: 0, dmg: 0, comets: 0 },
    caught: [], newMoths: [], newEvos: [],
    events: [], spawnLog: [], mothLog: [],
    gridCell: 72, grid: new Map(),
    st: null,
  };
  w.mothT = o.tutorial ? 40 : 35 + w.rngMoth() * 25;
  w.cometT = 60 + w.rngComet() * 60;
  if (hero.twin) w.up.twin = hero.twin;
  if (hero.orbit) w.up.orbit = hero.orbit;
  derive(w);
  w.p.hp = w.p.maxHp;
  if (meta.start > 0) { w.pending += meta.start; w.headStart = true; }
  if (w.pending > 0) openLevel(w);
  ev(w, 'banner', { text: 'DRAG ANYWHERE TO FLY', sub: w.daily ? "TONIGHT'S DUSK" : 'DUSK', big: true });
  return w;
}
function ev(w, k, d) { const e = d || {}; e.k = k; w.events.push(e); if (w.events.length > 800) w.events.splice(0, 200); }
function lv(w, id) { return w.up[id] || 0; }
function hasEvo(w, id) { return w.evos.indexOf(id) >= 0; }

function derive(w) {
  const hero = HERO_BY[w.hero], m = w.meta;
  const st = {};
  st.maxHp = hero.hp + 15 * m.wax + 20 * lv(w, 'wax');
  st.speed = 215 * hero.spd * (1 + 0.05 * m.wings) * (1 + 0.10 * lv(w, 'wings'));
  st.fireInt = 0.42 * Math.pow(0.88, lv(w, 'quick'));
  st.shots = 1 + lv(w, 'twin');
  st.dmg = 10 * (1 + 0.08 * m.pot) * (1 + 0.22 * lv(w, 'dense'));
  st.dmgMult = (1 + 0.08 * m.pot) * (1 + 0.22 * lv(w, 'dense'));
  st.pierce = hasEvo(w, 'tempest') ? 99 : lv(w, 'needle');
  st.bounce = lv(w, 'rico');
  st.homing = lv(w, 'seeker');
  st.crit = 0.05 + 0.10 * lv(w, 'sharp');
  st.critMul = lv(w, 'sharp') ? 2.2 : 1.8;
  st.reach = 70 * (1 + 0.30 * lv(w, 'reach')) * (1 + 0.15 * m.reach);
  st.orbit = lv(w, 'orbit');
  st.near = 16 * (1 + 0.25 * lv(w, 'mwings')) * (1 + 0.08 * m.wide) * hero.graze;
  st.regen = 0.6 * lv(w, 'mend');
  st.bspd = 520;
  const old = w.st; w.st = st;
  if (old) { const d = st.maxHp - old.maxHp; if (d > 0) w.p.hp += d; }
  w.p.maxHp = st.maxHp;
  w.p.hp = Math.min(w.p.hp, w.p.maxHp);
}

function xpFor(w, l) { if (w.tutorial && l === 1) return 20; return 10 + 7 * l + 1.1 * l * l; }
function hpScale(w) { return 1 + w.t / 60 * 0.4; }
function curGlow(w) { return Math.floor(w.score / 300) + w.glowBonus; }

// ---------- SPATIAL GRID ----------
function buildGrid(w) {
  const g = w.grid; g.clear(); const c = w.gridCell;
  for (const e of w.enemies) {
    if (e.dead) continue;
    const k = ((Math.floor(e.x / c) + 5000) * 10007) + (Math.floor(e.y / c) + 5000);
    let a = g.get(k); if (!a) { a = []; g.set(k, a); } a.push(e);
  }
}
function queryNear(w, x, y, r, out) {
  out.length = 0; const c = w.gridCell;
  const x0 = Math.floor((x - r) / c), x1 = Math.floor((x + r) / c), y0 = Math.floor((y - r) / c), y1 = Math.floor((y + r) / c);
  for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) {
    const a = w.grid.get(((i + 5000) * 10007) + (j + 5000)); if (a) for (const e of a) if (!e.dead) out.push(e);
  }
  return out;
}
const QBUF = [], QBUF2 = [];

// ---------- SPAWNING ----------
const CAP = { enemies: 220, pbul: 600, ebul: 500, gems: 500 };
function spawnDist(w) { return Math.hypot(w.vw, w.vh) / 2 + 40; }
function spawnEnemy(w, type, ang, distMul, extra) {
  const T = ETYPES[type];
  // RNG for schedule is consumed by caller; this only places.
  if (w.enemies.length >= CAP.enemies) return null;
  const d = spawnDist(w) * (distMul || 1) * (w.t < 10 ? 0.75 : 1);
  const sc = hpScale(w) * (w.longNight ? 1 + w.longT / 60 * 0.6 : 1);
  const e = {
    type, x: w.p.x + Math.cos(ang) * d, y: w.p.y + Math.sin(ang) * d, vx: 0, vy: 0, kx: 0, ky: 0,
    hp: T.hp * sc, maxHp: T.hp * sc, r: T.r, spd: T.spd, dmg: T.dmg, xp: T.xp, elite: !!T.elite,
    fireT: T.ranged ? T.ranged.cd * (0.4 + 0.6 * ((ang * 1000) % 1 + 1) % 1) : 0, flash: 0, slow: 0, frozen: 0,
    ramCd: 0, orbCd: 0, grazed: false, gIn: false, gEnter: 0, zig: (ang * 97) % TAU, spA: 0, dead: false, id: ++w._eid || (w._eid = 1),
  };
  if (extra) Object.assign(e, extra);
  w.enemies.push(e);
  return e;
}
function pickType(w, r) {
  const t = w.t;
  let tbl;
  if (w.longNight) tbl = [['mite', 26], ['dart', 20], ['spitter', 20], ['hollow', 14], ['weaver', 14], ['wraith', 6]];
  else if (t < 12) tbl = [['mite', 1]];
  else if (t < 30) tbl = [['mite', 70], ['spitter', 30]];
  else if (t < 60) tbl = [['mite', 55], ['dart', 20], ['spitter', 25]];
  else if (t < 120) tbl = [['mite', 40], ['dart', 20], ['spitter', 22], ['hollow', 10], ['weaver', 8]];
  else tbl = [['mite', 30], ['dart', 20], ['spitter', 20], ['hollow', 14], ['weaver', 12], ['wraith', 4]];
  let sum = 0; for (const x of tbl) sum += x[1];
  let v = r * sum; for (const x of tbl) { v -= x[1]; if (v <= 0) return x[0]; }
  return tbl[0][0];
}
function updateSpawns(w, dt) {
  const R = w.rngSpawn;
  // act changes
  const act = w.t < 60 ? 1 : w.t < 120 ? 2 : 3;
  if (act !== w.act && !w.longNight) {
    w.act = act;
    ev(w, 'act', { act, text: act === 2 ? 'ACT 2 · GLOAMING' : 'ACT 3 · MIDNIGHT' });
  }
  // opening: three slow mites drift in from the left
  if (!w.opened && w.t >= 0.5) {
    w.opened = true;
    for (let i = 0; i < 3; i++) spawnEnemy(w, 'mite', Math.PI + (i - 1) * 0.22, 0.6);
    w.spawnLog.push([+w.t.toFixed(3), 'open']);
  }
  // tutorial spitters
  if (w.tutorial && !w.tutSpit && w.t >= 12) {
    w.tutSpit = true;
    for (let i = 0; i < 2; i++) {
      const e = spawnEnemy(w, 'spitter', -Math.PI / 2 + (i ? 0.7 : -0.7), 0.62, { tut: true, fireT: 0.6 + i * 0.5 });
      if (e) { e.hp = e.maxHp = 80; }
      w.spawnLog.push([+w.t.toFixed(3), 'spitter-tut', i]);
    }
    ev(w, 'banner', { text: 'SKIM THE SPARKS', sub: 'fly close to shots, but don’t touch', tut: true });
  }
  // named waves
  while (w.waveI < WAVES.length && w.t >= WAVES[w.waveI].t && !w.longNight) {
    const wv = WAVES[w.waveI++]; const a0 = R() * TAU;
    for (let i = 0; i < wv.n; i++) spawnEnemy(w, wv.type, a0 + i / wv.n * TAU, wv.type === 'mite' || wv.type === 'dart' ? 0.9 : 1);
    if (wv.elite) spawnEnemy(w, 'wraith', a0 + Math.PI, 1);
    w.spawnLog.push([+w.t.toFixed(3), 'wave', wv.name, +a0.toFixed(4)]);
    ev(w, 'wave', { text: wv.name });
  }
  // hearth stones
  if (!w.longNight && !w.boss) {
    for (const st of [60, 120]) {
      if (w.t >= st && (w.stoneDone || 0) < (st === 60 ? 1 : 2)) {
        w.stoneDone = st === 60 ? 1 : 2;
        const a = R() * TAU;
        w.stone = { x: w.p.x + Math.cos(a) * 320, y: w.p.y + Math.sin(a) * 320, life: 12, fill: 0, r: 62 };
        w.spawnLog.push([+w.t.toFixed(3), 'stone', +a.toFixed(4)]);
        ev(w, 'stone', {});
      }
    }
  }
  // boss
  if (!w.longNight && !w.bossWarned && w.t >= BOSS_T - 5) { w.bossWarned = true; ev(w, 'bossWarn', { text: 'THE HUSH WAKES' }); }
  if (!w.longNight && !w.boss && !w.bossDead && w.t >= BOSS_T) spawnBoss(w);
  // regular trickle
  w.spawnT -= dt;
  if (w.spawnT <= 0) {
    const tt = w.longNight ? 180 + w.longT : w.t;
    let int = lerp(0.8, 0.25, clamp(tt / 180, 0, 1));
    if (w.longNight) int = Math.max(0.16, 0.25 - w.longT / 60 * 0.02);
    if (w.boss) int *= 2.2;
    w.spawnT += int;
    const n = 1 + Math.floor(Math.min(tt, 260) / 50);
    for (let i = 0; i < n; i++) {
      const r1 = R(), r2 = R();
      const type = pickType(w, r1);
      const a = r2 * TAU;
      if (w.spawnLog.length < 4000) w.spawnLog.push([+w.t.toFixed(3), type, +a.toFixed(4)]);
      spawnEnemy(w, type, a, 1);
    }
  }
}

// ---------- BOSS ----------
function spawnBoss(w) {
  const hp = 2600;
  w.boss = { x: w.p.x, y: w.p.y - spawnDist(w) * 0.8, r: 46, hp, maxHp: hp, phase: 1, ringT: 1.6, spA: 0, spT: 0, chargeT: 4, tele: 0, charge: 0, cvx: 0, cvy: 0, sumT: 4, flash: 0, contactCd: 0, ramCd: 0, orbCd: 0, grazed: false, gIn: false };
  w.spawnLog.push([+w.t.toFixed(3), 'boss']);
  ev(w, 'boss', { text: 'THE HUSH' });
}
function fireE(w, x, y, ang, spd, r) {
  if (w.ebul.length >= CAP.ebul) return;
  w.ebul.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: r || 6, life: 7, gIn: false, gEnter: 0, paid: false, dead: false });
}
function updateBoss(w, dt) {
  const b = w.boss; if (!b) return;
  const p = w.p;
  const frac = b.hp / b.maxHp;
  const ph = frac > 0.66 ? 1 : frac > 0.33 ? 2 : 3;
  if (ph !== b.phase) { b.phase = ph; ev(w, 'bossPhase', { phase: ph }); w.ebul.length = Math.min(w.ebul.length, 120); }
  b.flash = Math.max(0, b.flash - dt);
  const dx = p.x - b.x, dy = p.y - b.y, d = Math.hypot(dx, dy) || 1;
  if (b.charge > 0) {
    b.charge -= dt; b.x += b.cvx * dt; b.y += b.cvy * dt;
  } else if (b.tele > 0) {
    b.tele -= dt;
    if (b.tele <= 0) { b.charge = 0.62; const s = 540; b.cvx = dx / d * s; b.cvy = dy / d * s; ev(w, 'bossCharge', {}); }
  } else {
    const sp = 58 + ph * 8;
    b.x += dx / d * sp * dt; b.y += dy / d * sp * dt;
    b.chargeT -= dt;
    if (b.chargeT <= 0) { b.chargeT = ph === 1 ? 5 : ph === 2 ? 6 : 4.5; b.tele = 0.85; b.tx = p.x; b.ty = p.y; ev(w, 'bossTele', {}); }
  }
  b.ringT -= dt;
  if (b.ringT <= 0) {
    const n = ph === 3 ? 22 : 16; b.ringT = ph === 1 ? 1.8 : ph === 2 ? 2.6 : 1.5;
    const off = w.rngFx() * TAU;
    for (let i = 0; i < n; i++) fireE(w, b.x, b.y, off + i / n * TAU, ph === 3 ? 135 : 120, 7);
  }
  if (ph >= 2) {
    b.spT -= dt;
    if (b.spT <= 0) { b.spT = ph === 2 ? 0.11 : 0.16; b.spA += 0.37; fireE(w, b.x, b.y, b.spA, 140, 6); fireE(w, b.x, b.y, b.spA + Math.PI, 140, 6); }
  }
  if (ph === 3) {
    b.sumT -= dt;
    if (b.sumT <= 0) { b.sumT = 4.5; for (let i = 0; i < 6; i++) spawnEnemy(w, 'mite', w.rngFx() * TAU, 0.9); }
  }
  // wildfire ram
  b.ramCd = Math.max(0, b.ramCd - dt);
  if (w.wild > 0 && d < b.r + p.r + 8 && b.ramCd <= 0) { b.ramCd = 0.3; damageBoss(w, 40 * w.st.dmgMult, false); ev(w, 'ram', { x: b.x, y: b.y }); }
  // contact
  b.contactCd = Math.max(0, b.contactCd - dt);
  if (d < b.r + p.r * 0.6 && b.contactCd <= 0) { hurtPlayer(w, 24, b.x, b.y); b.contactCd = 0.6; }
}
function damageBoss(w, dmg, crit) {
  const b = w.boss; if (!b || b.hp <= 0) return;
  b.hp -= dmg; b.flash = 0.06; w.stats.dmg += dmg;
  ev(w, 'dnum', { x: b.x + (w.rngFx() - .5) * 40, y: b.y - b.r, v: dmg, crit });
  if (b.hp <= 0) bossDie(w);
}
function bossDie(w) {
  const b = w.boss;
  ev(w, 'bossDie', { x: b.x, y: b.y });
  for (let i = 0; i < 30; i++) dropGem(w, b.x + (w.rngFx() - .5) * 80, b.y + (w.rngFx() - .5) * 80, 20);
  w.score += 5000;
  w.boss = null; w.bossDead = true;
  w.ebul.length = 0;
  for (const e of w.enemies) if (!e.elite) { e.dead = true; }
  w.dawn = true; w.dawnT = w.t;
  w.winGlow = Math.floor(curGlow(w) * 1.5) + 150;
  w.banked = curGlow(w);
  w.awaitDawn = true; // app shows Long Night / Cash Out
  ev(w, 'dawn', {});
}
function stayLongNight(w) { if (!w.awaitDawn) return; w.awaitDawn = false; w.longNight = true; w.longStartScore = w.score; w.longStartGlow = curGlow(w); ev(w, 'longNight', { text: 'THE LONG NIGHT' }); }
function cashOut(w) { if (!w.awaitDawn && !w.longNight) return; w.awaitDawn = false; endRun(w, true); }

// ---------- PLAYER ----------
function hurtPlayer(w, dmg, sx, sy) {
  const p = w.p;
  if (p.inv > 0 || w.wild > 0 || w.over || w.awaitDawn) return false;
  p.hp -= dmg; p.inv = 0.5; w.lastHitT = w.t;
  w.chain = 0;
  ev(w, 'hurt', { dmg, x: p.x, y: p.y });
  // thorn bark retaliation handled in contact code
  if (p.hp <= 0) {
    if (w.meta.wind > 0 && !w.windUsed) {
      w.windUsed = true; p.hp = p.maxHp * 0.5; p.inv = 3;
      w.ebul.length = 0;
      queryNear(w, p.x, p.y, 340, QBUF);
      for (const e of QBUF) if (!e.elite) killEnemy(w, e, true);
      ev(w, 'revive', { x: p.x, y: p.y });
    } else {
      p.hp = 0; endRun(w, false);
    }
  }
  return true;
}
function findTarget(w, x, y, range) {
  if (w.boss) { const b = w.boss; if (Math.hypot(b.x - x, b.y - y) < 700) return b; }
  let best = null, bd = range * range;
  queryNear(w, x, y, range, QBUF2);
  for (const e of QBUF2) { const d = (e.x - x) ** 2 + (e.y - y) ** 2; if (d < bd) { bd = d; best = e; } }
  return best;
}
function shoot(w, x, y, ang, o) {
  if (w.pbul.length >= CAP.pbul) return;
  const st = w.st;
  const crit = (o && o.crit) || w.rngFx() < st.crit;
  const dmg = st.dmg * (o && o.dmgMul || 1) * (crit ? st.critMul : 1);
  const spd = (o && o.spd) || st.bspd;
  w.pbul.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: (o && o.r) || 4 + lv(w, 'dense') * 0.5, dmg, crit, pierce: st.pierce, bounce: st.bounce, homing: (o && o.homing) || st.homing, life: (o && o.life) || 1.4, hitIds: null, gen: (o && o.gen) || 0, dead: false });
}
function updatePlayer(w, inp, dt) {
  const p = w.p, st = w.st;
  let ax = inp.ax || 0, ay = inp.ay || 0;
  const m = Math.hypot(ax, ay); if (m > 1) { ax /= m; ay /= m; }
  p.vx = ax * st.speed; p.vy = ay * st.speed;
  p.x += p.vx * dt; p.y += p.vy * dt;
  p.moving = m > 0.15;
  if (m > 0.1) p.face = Math.atan2(ay, ax);
  p.inv = Math.max(0, p.inv - dt);
  if (st.regen > 0 && p.hp > 0) p.hp = Math.min(p.maxHp, p.hp + st.regen * dt);
  // fire
  const rate = (w.wild > 0 ? 1.5 : 1) * (w.swarmHands > 0 ? 3 : 1);
  w.fireT -= dt * rate;
  if (w.fireT <= 0) {
    const tgt = inp.aim ? null : findTarget(w, p.x, p.y, 700);
    let ang = null;
    if (inp.aim) ang = Math.atan2(inp.aim.y, inp.aim.x);
    else if (tgt) ang = Math.atan2(tgt.y - p.y, tgt.x - p.x);
    if (ang !== null) {
      w.fireT += st.fireInt;
      if (w.fireT < -st.fireInt) w.fireT = 0;
      w.volley++;
      const n = st.shots, spread = 0.13;
      for (let i = 0; i < n; i++) shoot(w, p.x, p.y, ang + (i - (n - 1) / 2) * spread);
      if (hasEvo(w, 'hunter') && w.volley % 4 === 0) for (let i = 0; i < 8; i++) shoot(w, p.x, p.y, ang + i / 8 * TAU, { crit: true, homing: 3, life: 2 });
      ev(w, 'shoot', {});
    } else w.fireT = 0;
  }
  // orbit lanterns
  const on = st.orbit;
  if (on > 0) {
    const tw = hasEvo(w, 'thornwheel');
    w.orbA += dt * (tw ? 4.4 : 2.6);
    const R = tw ? 96 : 70, rr = tw ? 16 : 10, dmg = st.dmg * (tw ? 2.0 : 0.9);
    for (let i = 0; i < on; i++) {
      const a = w.orbA + i / on * TAU, ox = p.x + Math.cos(a) * R, oy = p.y + Math.sin(a) * R;
      queryNear(w, ox, oy, rr + 26, QBUF);
      for (const e of QBUF) if (e.orbCd <= 0 && Math.hypot(e.x - ox, e.y - oy) < e.r + rr) { e.orbCd = tw ? 0.18 : 0.3; damageEnemy(w, e, dmg, false, ox, oy, 160); }
      if (w.boss && w.boss.orbCd <= 0 && Math.hypot(w.boss.x - ox, w.boss.y - oy) < w.boss.r + rr) { w.boss.orbCd = 0.25; damageBoss(w, dmg, false); }
    }
  }
  if (w.boss) w.boss.orbCd = Math.max(0, w.boss.orbCd - dt);
  // nova
  const nl = lv(w, 'nova'), glac = hasEvo(w, 'glacial');
  if (nl > 0 || glac) {
    w.novaT -= dt;
    if (w.novaT <= 0) {
      w.novaT = glac ? 3 : 5.2 - 0.8 * nl;
      doNova(w, glac ? 230 : 110 + 30 * nl, st.dmg * (glac ? 3.2 : 1.4 + 0.6 * nl), glac);
    }
  }
  // ash
  const al = lv(w, 'ash'), garden = hasEvo(w, 'ashgarden');
  if (al > 0 && p.moving) {
    w.ashT -= dt;
    if (w.ashT <= 0) { w.ashT = 0.3; w.puddles.push({ x: p.x, y: p.y, r: (26 + 6 * al) * (garden ? 1.6 : 1), life: garden ? 3.2 : 2.4, max: garden ? 3.2 : 2.4, dps: st.dmgMult * 14 * al * (garden ? 1.5 : 1), tick: 0 }); if (w.puddles.length > 40) w.puddles.shift(); }
  }
}
function doNova(w, R, dmg, freeze, x, y) {
  x = x === undefined ? w.p.x : x; y = y === undefined ? w.p.y : y;
  queryNear(w, x, y, R, QBUF);
  for (const e of QBUF) if (Math.hypot(e.x - x, e.y - y) < R + e.r) { damageEnemy(w, e, dmg, false, x, y, 260); if (freeze) e.frozen = 1.5; }
  if (w.boss && Math.hypot(w.boss.x - x, w.boss.y - y) < R + w.boss.r) damageBoss(w, dmg * 0.6, false);
  for (const b of w.ebul) if (!b.dead && Math.hypot(b.x - x, b.y - y) < R * 0.6) b.dead = true;
  ev(w, 'nova', { x, y, r: R, freeze: !!freeze });
}

// ---------- ENEMIES ----------
function damageEnemy(w, e, dmg, crit, sx, sy, kb) {
  if (e.dead) return;
  e.hp -= dmg; e.flash = 0.08; w.stats.dmg += dmg;
  if (kb && !e.elite) { const dx = e.x - sx, dy = e.y - sy, d = Math.hypot(dx, dy) || 1; const k = kb * (e.type === 'hollow' ? 0.35 : 1); e.kx += dx / d * k; e.ky += dy / d * k; }
  if (lv(w, 'frost')) e.slow = 1.2;
  ev(w, 'dnum', { x: e.x, y: e.y - e.r, v: dmg, crit });
  if (e.hp <= 0) killEnemy(w, e, false);
}
function dropGem(w, x, y, v) {
  if (w.gems.length >= CAP.gems) { // merge into the oldest
    const g = w.gems[0]; g.v += v; return;
  }
  w.gems.push({ x, y, v, mag: false, vx: 0, vy: 0 });
}
function killEnemy(w, e, silent) {
  if (e.dead) return;
  e.dead = true;
  w.stats.kills++;
  w.score += e.xp * 10 * scoreMult(w);
  if (w.wild <= 0) w.flare = Math.min(1, w.flare + 0.01);
  let v = e.xp;
  for (const t of GEM_TIERS) while (v >= t) { dropGem(w, e.x + (w.rngFx() - .5) * 10, e.y + (w.rngFx() - .5) * 10, t); v -= t; }
  ev(w, 'kill', { x: e.x, y: e.y, type: e.type, brute: !!(ETYPES[e.type].brute) });
  // bloom
  const bl = lv(w, 'bloom'), wb = hasEvo(w, 'wbloom');
  if (!silent && (wb || (bl && w.rngFx() < bl * 0.12))) {
    if ((w._bloomDepth || 0) < 3) {
      w._bloomDepth = (w._bloomDepth || 0) + 1;
      const R = wb ? 92 : 64, dmg = w.st.dmg * (wb ? 4 : 2 * bl);
      ev(w, 'bloom', { x: e.x, y: e.y, r: R });
      queryNear(w, e.x, e.y, R, QBUF2);
      const hits = QBUF2.slice();
      for (const o of hits) if (o !== e && Math.hypot(o.x - e.x, o.y - e.y) < R + o.r) damageEnemy(w, o, dmg, false, e.x, e.y, 120);
      w._bloomDepth--;
    }
  }
}
function scoreMult(w) { return w.longNight ? 1 + 0.1 * Math.floor(w.longT / 60) : 1; }
function updateEnemies(w, dt) {
  const p = w.p, frostL = lv(w, 'frost'), frostR = frostL ? 90 + 20 * frostL : 0, thornL = lv(w, 'thorns');
  const near = w.st.near * (hasEvo(w, 'phantom') && p.moving ? 2 : 1);
  for (const e of w.enemies) {
    if (e.dead) continue;
    const T = ETYPES[e.type];
    e.flash = Math.max(0, e.flash - dt); e.orbCd = Math.max(0, e.orbCd - dt); e.ramCd = Math.max(0, e.ramCd - dt);
    e.slow = Math.max(0, e.slow - dt);
    let sm = 1;
    if (e.frozen > 0) { e.frozen -= dt; sm = 0; }
    const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
    if (frostR && d < frostR) sm *= 1 - 0.15 * frostL;
    if (e.slow > 0) sm *= 0.8;
    let mx = dx / d, my = dy / d;
    if (T.ranged && d < T.ranged.dist) { mx = -mx * 0.4; my = -my * 0.4; const tx = -dy / d, ty = dx / d; mx += tx * 0.6; my += ty * 0.6; }
    if (T.zig) { e.zig += dt * 5; const s = Math.sin(e.zig) * 0.7; mx += -dy / d * s; my += dx / d * s; }
    e.x += (mx * e.spd * sm + e.kx) * dt; e.y += (my * e.spd * sm + e.ky) * dt;
    const kd = Math.pow(0.002, dt); e.kx *= kd; e.ky *= kd;
    // ranged fire
    if (T.ranged && sm > 0 && d < 520) {
      e.fireT -= dt;
      if (e.fireT <= 0) {
        const R = T.ranged; e.fireT = (e.tut ? 1.5 : R.cd) * (0.85 + w.rngFx() * 0.3);
        const ang = Math.atan2(dy, dx);
        if (R.fan) {
          const n = e.tut ? 5 : R.fan, sp = e.tut ? 0.95 : R.spread, spd = e.tut ? 92 : R.spd;
          for (let i = 0; i < n; i++) fireE(w, e.x, e.y, ang + (i - (n - 1) / 2) * (sp / Math.max(1, n - 1)) * 2, spd);
        } else if (R.ring) { const off = w.rngFx() * TAU; for (let i = 0; i < R.ring; i++) fireE(w, e.x, e.y, off + i / R.ring * TAU, R.spd); }
        else if (R.spiral) { for (let k = 0; k < 6; k++) { e.spA += 0.5; fireE(w, e.x, e.y, ang + e.spA, R.spd); } }
        ev(w, 'eshoot', {});
      }
    }
    // body: wildfire ram / contact / graze
    const touch = p.r * 0.75 + e.r;
    if (w.wild > 0) {
      if (d < p.r + e.r + 8 && e.ramCd <= 0) { e.ramCd = 0.3; damageEnemy(w, e, 40 * w.st.dmgMult, false, p.x, p.y, 700); ev(w, 'ram', { x: e.x, y: e.y }); }
    } else if (d < touch) {
      if (hurtPlayer(w, e.dmg, e.x, e.y)) {
        if (thornL) damageEnemy(w, e, 20 * thornL * w.st.dmgMult * (hasEvo(w, 'thornwheel') ? 2 : 1), false, p.x, p.y, 400);
        else { e.kx -= dx / d * 260; e.ky -= dy / d * 260; }
      }
    }
    if (!e.grazed && !e.dead) grazeZone(w, e, d, touch, near);
    // despawn very far stragglers by recycling to the other side
    if (d > spawnDist(w) * 2.2 && !e.elite) { const a = Math.atan2(dy, dx); e.x = p.x + Math.cos(a) * spawnDist(w); e.y = p.y + Math.sin(a) * spawnDist(w); }
  }
  if (w.enemies.length > 60 && w.enemies.some(e => e.dead)) w.enemies = w.enemies.filter(e => !e.dead);
}

// ---------- GRAZE ----------
// gIn: inside the graze ring now. When it leaves (or expires) we queue a payout that
// settles 0.2s after it entered, and only if the player was not hit since it entered.
function grazeZone(w, o, d, touch, near) {
  const zone = touch + near;
  if (d < zone && d >= touch) {
    if (!o.gIn) { o.gIn = true; o.gEnter = w.t; }
  } else if (o.gIn && d >= zone) {
    o.gIn = false; o.grazed = true; queueGraze(w, o);
  }
}
function queueGraze(w, o) {
  if (w.over) return;
  w.grazeQ.push({ at: Math.max(w.t, o.gEnter + 0.2), enter: o.gEnter, x: o.x, y: o.y });
}
function processGraze(w) {
  if (!w.grazeQ.length) return;
  const keep = [];
  for (const g of w.grazeQ) {
    if (w.t < g.at) { keep.push(g); continue; }
    if (w.lastHitT >= g.enter || w.over || w.p.hp <= 0) continue; // hit since entering: no pay
    // cap 8 per second
    while (w.grazeTimes.length && w.t - w.grazeTimes[0] > 1) w.grazeTimes.shift();
    if (w.grazeTimes.length >= 8) continue;
    w.grazeTimes.push(w.t);
    payGraze(w, g);
  }
  w.grazeQ = keep;
}
function payGraze(w, g) {
  if (w.t - w.lastGrazeT <= 2.6) w.chain++; else w.chain = 1;
  w.lastGrazeT = w.t;
  const mult = Math.min(5, w.chain);
  // kindling: the first Wildfire of a run fills faster (x3 on the very first run) so the power fantasy lands early
  const kindle = w.stats.wildfires === 0 ? (w.tutorial ? 3 : 1.6) : 1;
  if (w.wild <= 0) w.flare = Math.min(1, w.flare + 0.06 * Math.sqrt(mult) * kindle);
  w.score += 25 * mult * scoreMult(w);
  w.stats.grazes++; w.stats.bestChain = Math.max(w.stats.bestChain, w.chain);
  const p = w.p;
  const vl = lv(w, 'veil');
  for (let i = 0; i < vl; i++) shoot(w, p.x, p.y, w.rngFx() * TAU, { homing: 3, spd: 380, life: 1.8, dmgMul: 0.8 });
  if (hasEvo(w, 'stormveil') && w.st.orbit > 0) {
    const R = 70; for (let i = 0; i < w.st.orbit; i++) { const a = w.orbA + i / w.st.orbit * TAU; doNova(w, 64, w.st.dmg * 1.2, false, p.x + Math.cos(a) * R, p.y + Math.sin(a) * R); }
  }
  if (hasEvo(w, 'phantom')) p.inv = Math.max(p.inv, 0.25);
  ev(w, 'graze', { chain: w.chain, x: p.x, y: p.y, gx: g.x, gy: g.y });
  if (w.flare >= 1 && w.wild <= 0) startWildfire(w);
}
function startWildfire(w) {
  w.wild = 4; w.flare = 0; w.stats.wildfires++;
  ev(w, 'wildfire', { x: w.p.x, y: w.p.y });
  // rare condition-gated moth: Cinder Sphinx appears only during Wildfire
  if (!w.moths.some(m => m.sp === 'cinder') && w.rngFx() < 0.12) spawnMoth(w, 'cinder', 5.5, false, w.rngFx);
}

// ---------- BULLETS ----------
function updateBullets(w, dt) {
  const p = w.p, near = w.st.near * (hasEvo(w, 'phantom') && p.moving ? 2 : 1), hitR = p.r * 0.62;
  for (const b of w.ebul) {
    if (b.dead) continue;
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy);
    const touch = hitR + b.r;
    if (b.life <= 0) { b.dead = true; if (b.gIn && !b.paid) { b.paid = true; queueGraze(w, b); } continue; }
    if (d < touch && w.wild <= 0 && !w.awaitDawn) {
      if (p.inv <= 0) { b.dead = true; hurtPlayer(w, 9, b.x, b.y); continue; }
    }
    if (!b.paid) {
      const zone = touch + near;
      if (d < zone && d >= touch) { if (!b.gIn) { b.gIn = true; b.gEnter = w.t; } }
      else if (b.gIn && d >= zone) { b.gIn = false; b.paid = true; queueGraze(w, b); }
    }
    if (d > 1400) b.dead = true;
  }
  w.ebul = w.ebul.filter(b => !b.dead);
  for (const b of w.pbul) {
    if (b.dead) continue;
    b.life -= dt; if (b.life <= 0) { b.dead = true; continue; }
    if (b.homing) {
      const t = findTarget(w, b.x, b.y, 320);
      if (t) {
        const want = Math.atan2(t.y - b.y, t.x - b.x), cur = Math.atan2(b.vy, b.vx);
        let da = want - cur; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
        const turn = Math.min(Math.abs(da), dt * (2.2 + 1.6 * b.homing)) * Math.sign(da);
        const s = Math.hypot(b.vx, b.vy); const na = cur + turn; b.vx = Math.cos(na) * s; b.vy = Math.sin(na) * s;
      }
    }
    b.x += b.vx * dt; b.y += b.vy * dt;
    // boss
    const B = w.boss;
    if (B && Math.hypot(B.x - b.x, B.y - b.y) < B.r + b.r) { damageBoss(w, b.dmg, b.crit); b.dead = true; continue; }
    queryNear(w, b.x, b.y, b.r + 26, QBUF);
    for (const e of QBUF) {
      if (e.dead || (b.hitIds && b.hitIds.indexOf(e.id) >= 0)) continue;
      if (Math.hypot(e.x - b.x, e.y - b.y) < e.r + b.r) {
        damageEnemy(w, e, b.dmg, b.crit, b.x - b.vx * 0.01, b.y - b.vy * 0.01, 90);
        (b.hitIds || (b.hitIds = [])).push(e.id);
        if (hasEvo(w, 'tempest') && b.gen < 1 && w.pbul.length < CAP.pbul - 2) {
          const a = Math.atan2(b.vy, b.vx);
          for (const s of [-0.6, 0.6]) { shoot(w, b.x, b.y, a + s, { dmgMul: 0.6, life: 0.6, gen: b.gen + 1 }); const nb = w.pbul[w.pbul.length - 1]; nb.hitIds = b.hitIds.slice(); nb.pierce = 1; }
        }
        if (b.pierce > 0) { b.pierce--; }
        else if (b.bounce > 0) {
          b.bounce--;
          queryNear(w, b.x, b.y, 260, QBUF2);
          let best = null, bd = 1e9; for (const o of QBUF2) { if (o === e || o.dead || b.hitIds.indexOf(o.id) >= 0) continue; const dd = Math.hypot(o.x - b.x, o.y - b.y); if (dd < bd) { bd = dd; best = o; } }
          if (best) { const s = Math.hypot(b.vx, b.vy); const a = Math.atan2(best.y - b.y, best.x - b.x); b.vx = Math.cos(a) * s; b.vy = Math.sin(a) * s; b.life = Math.max(b.life, 0.7); }
          else b.dead = true;
        } else b.dead = true;
        break;
      }
    }
  }
  w.pbul = w.pbul.filter(b => !b.dead);
  // puddles
  for (const u of w.puddles) {
    u.life -= dt; u.tick -= dt;
    if (u.tick <= 0) {
      u.tick = 0.25;
      queryNear(w, u.x, u.y, u.r, QBUF);
      for (const e of QBUF) if (Math.hypot(e.x - u.x, e.y - u.y) < u.r + e.r) damageEnemy(w, e, u.dps * 0.25, false, 0, 0, 0);
      if (hasEvo(w, 'ashgarden') && Math.hypot(p.x - u.x, p.y - u.y) < u.r) p.hp = Math.min(p.maxHp, p.hp + 1.2);
    }
  }
  w.puddles = w.puddles.filter(u => u.life > 0);
}

// ---------- GEMS ----------
function updateGems(w, dt) {
  const p = w.p, reach = w.st.reach * (w.wild > 0 ? 2.4 : 1);
  for (const g of w.gems) {
    if (g.dead) continue;
    const dx = p.x - g.x, dy = p.y - g.y, d = Math.hypot(dx, dy) || 1;
    if (d < reach || g.mag) g.mag = true;
    if (g.mag) { const s = 380 + (w.wild > 0 ? 300 : 0); g.x += dx / d * s * dt; g.y += dy / d * s * dt; }
    if (d < p.r + 10) {
      g.dead = true;
      const xp = g.v * (w.starfall > 0 ? 2 : 1);
      w.xp += xp;
      w.gemChain = (w.t - (w.lastGemT || -9) < 0.6) ? (w.gemChain || 0) + 1 : 0; w.lastGemT = w.t;
      ev(w, 'gem', { n: w.gemChain, v: g.v });
      while (w.xp >= xpFor(w, w.level)) { w.xp -= xpFor(w, w.level); w.level++; w.pending++; }
    }
    if (d > 1600) g.dead = true;
  }
  w.gems = w.gems.filter(g => !g.dead);
  if (w.pending > 0 && !w.choices && !w.over && !w.awaitDawn) openLevel(w);
}

// ---------- LEVEL-UP ----------
function evoReady(w) {
  return EVOS.filter(e => !hasEvo(w, e.id) && lv(w, e.a) >= UPG_BY[e.a].max && lv(w, e.b) >= UPG_BY[e.b].max);
}
function openLevel(w) { w.rerollIdx = 0; w.levelIdx++; w.choices = rollChoices(w); ev(w, 'levelup', { level: w.level }); }
function rollChoices(w) {
  const rng = mulberry32((w.seed ^ Math.imul(w.levelIdx, 7919) ^ Math.imul(w.rerollIdx, 104729)) >>> 0);
  const out = [];
  if (w.tutorial && w.levelIdx === 1 && !w.headStart) return ['twin', 'quick', 'mwings'].map(id => ({ kind: 'up', id }));
  const ready = evoReady(w);
  if (ready.length) out.push({ kind: 'evo', id: ready[0].id });
  const pool = UPG.filter(u => lv(w, u.id) < u.max);
  const weight = u => {
    const s = lv(w, u.id); let wt = 1 + 0.5 * s;
    for (const [e, partner] of evoPartnersOf(u.id)) if (!hasEvo(w, e.id) && lv(w, partner) > 0) wt *= 3;
    return wt;
  };
  const take = (cands) => {
    let sum = 0; for (const u of cands) sum += weight(u);
    let v = rng() * sum; for (const u of cands) { v -= weight(u); if (v <= 0) return u; }
    return cands[cands.length - 1];
  };
  let avail = pool.slice();
  // build slot: something you already have or a missing half of a recipe
  const build = avail.filter(u => lv(w, u.id) > 0 || evoPartnersOf(u.id).some(([e, pt]) => !hasEvo(w, e.id) && lv(w, pt) > 0));
  if (build.length && out.length < 3) { const u = take(build); out.push({ kind: 'up', id: u.id }); avail = avail.filter(x => x !== u); }
  while (out.length < 3 && avail.length) { const u = take(avail); out.push({ kind: 'up', id: u.id }); avail = avail.filter(x => x !== u); }
  const fillers = ['tea', 'jar'];
  while (out.length < 3) out.push({ kind: 'fill', id: fillers[out.length % 2] });
  // shuffle all but an evo in slot 1
  const start = out[0].kind === 'evo' ? 1 : 0;
  for (let i = out.length - 1; i > start; i--) { const j = start + Math.floor(rng() * (i - start + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
function cardInfo(w, c) {
  if (c.kind === 'evo') { const e = EVO_BY[c.id]; return { title: e.name, tag: 'EVOLUTION', desc: e.d, sub: UPG_BY[e.a].name + ' + ' + UPG_BY[e.b].name, evo: true }; }
  if (c.kind === 'fill') return c.id === 'tea' ? { title: 'Warm Nectar', tag: 'HEAL', desc: 'Heal 40% HP' } : { title: 'Glow Jar', tag: 'GLOW', desc: '+20 glow for this run' };
  const u = UPG_BY[c.id], l = lv(w, c.id), next = l + 1;
  let sub = '';
  const parts = evoPartnersOf(c.id).filter(([e]) => !hasEvo(w, e.id));
  if (parts.length) {
    const [e, pt] = parts[0];
    sub = (next >= u.max ? 'MAX · evolves with ' : 'evolves with ') + UPG_BY[pt].name + (lv(w, pt) ? ` (${lv(w, pt)}/${UPG_BY[pt].max})` : '');
  }
  return { title: u.name + (l ? ' ' + roman(next) : ''), tag: l ? `LV ${next}/${u.max}` : 'NEW', desc: u.d(l), sub, graze: !!u.graze, max: next >= u.max };
}
function roman(n) { return ['', 'I', 'II', 'III', 'IV', 'V', 'VI'][n] || String(n); }
function chooseUpgrade(w, idx) {
  if (!w.choices || !w.choices[idx]) return false;
  const c = w.choices[idx];
  if (c.kind === 'evo') applyEvo(w, c.id);
  else if (c.kind === 'fill') { if (c.id === 'tea') w.p.hp = Math.min(w.p.maxHp, w.p.hp + w.p.maxHp * 0.4); else w.glowBonus += 20; }
  else {
    w.up[c.id] = lv(w, c.id) + 1; derive(w);
    if (c.id === 'wax') w.p.hp = Math.min(w.p.maxHp, w.p.hp + 20);
    const u = UPG_BY[c.id];
    if (w.up[c.id] >= u.max) {
      const parts = evoPartnersOf(c.id).filter(([e]) => !hasEvo(w, e.id));
      ev(w, 'maxed', { id: c.id, name: u.name, partner: parts.length ? UPG_BY[parts[0][1]].name : null, ready: parts.some(([e, pt]) => lv(w, pt) >= UPG_BY[pt].max) });
    }
  }
  w.pending--; w.choices = null;
  if (w.pending > 0) openLevel(w);
  return true;
}
function reroll(w) {
  if (!w.choices || w.rerolls <= 0) return false;
  w.rerolls--; w.rerollIdx++;
  const evo = w.choices[0].kind === 'evo' ? w.choices[0] : null;
  w.choices = rollChoices(w);
  if (evo && w.choices[0].kind !== 'evo') w.choices[0] = evo;
  return true;
}
function applyEvo(w, id) {
  if (hasEvo(w, id)) return;
  w.evos.push(id); w.stats.evolves++; derive(w);
  const isNew = w.knownEvos.indexOf(id) < 0;
  if (isNew) { w.knownEvos.push(id); w.newEvos.push(id); }
  ev(w, 'evolve', { id, name: EVO_BY[id].name, isNew, x: w.p.x, y: w.p.y });
  doNova(w, 260, w.st.dmg * 3, false);
}

// ---------- MOTHS / COMET / STONE ----------
function mothEligible(w, m) {
  if (m.a && w.act < m.a && !w.longNight) return false;
  if (m.hero && m.hero !== w.hero) return false;
  if (m.wild) return false; // only via wildfire trigger
  if (m.evos2 && w.evos.length < 2) return false;
  if (m.long && !w.longNight) return false;
  if (m.boss && !w.boss) return false;
  return true;
}
function pickMoth(w, r1, r2) {
  const el = MOTHS.filter(m => mothEligible(w, m));
  const rw = RAR.map(x => x.w);
  if (w.longNight) rw[3] = 6;
  const present = [0, 1, 2, 3].filter(i => el.some(m => m.r === i));
  let sum = 0; for (const i of present) sum += rw[i];
  let v = r1 * sum, ri = present[0];
  for (const i of present) { v -= rw[i]; if (v <= 0) { ri = i; break; } }
  const list = el.filter(m => m.r === ri);
  // prefer species not yet caught 60% of the time (keeps the book moving)
  const fresh = list.filter(m => !w.knownMoths[m.id]);
  const src = fresh.length && r2 < 0.6 ? fresh : list;
  return src[Math.floor((r2 < 0.6 ? r2 / 0.6 : (r2 - 0.6) / 0.4) * src.length) % src.length];
}
function spawnMoth(w, sp, life, comet, rng) {
  const p = w.p, R = rng || (comet ? w.rngComet : w.rngMoth);
  const side = Math.floor(R() * 4), u = R();
  const hw = w.vw / 2 + 30, hh = w.vh / 2 + 30;
  let x, y;
  if (side === 0) { x = -hw; y = (u - .5) * w.vh * 0.7; } else if (side === 1) { x = hw; y = (u - .5) * w.vh * 0.7; }
  else if (side === 2) { y = -hh; x = (u - .5) * w.vw * 0.8; } else { y = hh; x = (u - .5) * w.vw * 0.8; }
  // aim through a point near the player
  const tx = (R() - .5) * w.vw * 0.4, ty = (R() - .5) * w.vh * 0.3;
  const L = life || (comet ? 6.5 + R() * 1.5 : 6 + R() * 3);
  const dx = tx - x, dy = ty - y, D = Math.hypot(dx, dy);
  const spd = D * 2 / L;
  const o = { sp, x: p.x + x, y: p.y + y, vx: dx / D * spd, vy: dy / D * spd, life: L, max: L, ph: R() * TAU, comet: !!comet, mm: 0 };
  if (!comet) { const M = MOTH_BY[sp]; o.mm = Math.round(M.mm[0] + R() * (M.mm[1] - M.mm[0])); w.moths.push(o); w.mothLog.push([+w.t.toFixed(3), sp]); ev(w, 'mothSpawn', { sp, r: M.r }); }
  else { w.mothLog.push([+w.t.toFixed(3), 'COMET']); if (!w.comet) { w.comet = o; ev(w, 'cometSpawn', {}); } }
}
function updateMoths(w, dt) {
  const p = w.p;
  if (!w.over && !w.awaitDawn) {
    w.mothT -= dt;
    if (w.mothT <= 0) {
      const r1 = w.rngMoth(), r2 = w.rngMoth();
      w.mothT = 35 + w.rngMoth() * 25;
      if (w.firstMothScripted) { w.firstMothScripted = false; spawnMoth(w, 'miller'); }
      else spawnMoth(w, pickMoth(w, r1, r2).id);
    }
    w.cometT -= dt;
    if (w.cometT <= 0) { w.cometT = 60 + w.rngComet() * 60; spawnMoth(w, 'comet', 0, true); }
  }
  const cr = p.r + 26;
  for (const m of w.moths) {
    m.life -= dt; m.ph += dt * 9;
    m.x += m.vx * dt; m.y += m.vy * dt + Math.sin(m.ph * 0.35) * 40 * dt;
    if (Math.hypot(m.x - p.x, m.y - p.y) < cr) { m.dead = true; catchMoth(w, m); }
    if (m.life <= 0) { m.dead = true; ev(w, 'mothGone', { sp: m.sp }); }
  }
  w.moths = w.moths.filter(m => !m.dead);
  const c = w.comet;
  if (c) {
    c.life -= dt; c.x += c.vx * dt; c.y += c.vy * dt; c.ph += dt * 12;
    if (Math.hypot(c.x - p.x, c.y - p.y) < cr + 6) { w.comet = null; catchComet(w, c); }
    else if (c.life <= 0) w.comet = null;
  }
  w.starfall = Math.max(0, w.starfall - dt); w.swarmHands = Math.max(0, w.swarmHands - dt);
  // stone
  const s = w.stone;
  if (s) {
    s.life -= dt;
    if (Math.hypot(s.x - p.x, s.y - p.y) < s.r) { s.fill += dt; if (s.fill >= 1.5) { w.banked = curGlow(w); w.stats.banks++; w.stone = null; ev(w, 'bank', { v: w.banked }); } }
    if (w.stone && s.life <= 0) { w.stone = null; ev(w, 'stoneGone', {}); }
  }
}
function catchMoth(w, m) {
  const M = MOTH_BY[m.sp], R = RAR[M.r];
  w.stats.catches++;
  w.glowBonus += R.glow;
  const isNew = !w.knownMoths[m.sp];
  const prev = w.knownMoths[m.sp];
  const isPB = !isNew && m.mm > (prev.bestMm || 0);
  if (isNew) { w.knownMoths[m.sp] = { n: 1, bestMm: m.mm }; w.newMoths.push(m.sp); }
  else { prev.n++; if (isPB) prev.bestMm = m.mm; }
  w.caught.push({ sp: m.sp, mm: m.mm, isNew, isPB });
  ev(w, 'catch', { sp: m.sp, name: M.name, r: M.r, mm: m.mm, isNew, isPB, x: m.x, y: m.y, count: Object.keys(w.knownMoths).length });
}
function catchComet(w, c) {
  const r = w.rngComet(); w.stats.comets++;
  let out;
  if (r < 0.55) { out = 'starfall'; w.starfall = 20; if (w.wild <= 0) { w.flare = Math.min(1, w.flare + 0.3); if (w.flare >= 1) startWildfire(w); } }
  else if (r < 0.85) { out = 'windfall'; const v = 30 + Math.floor(w.t / 6); w.glowBonus += v; }
  else { out = 'swarm'; w.swarmHands = 10; }
  ev(w, 'comet', { out, x: c.x, y: c.y });
}

// ---------- STEP ----------
function step(w, inp, dt) {
  if (w.over || w.choices || w.awaitDawn || w.paused) return;
  dt = Math.min(dt, 1 / 20);
  w.t += dt;
  if (w.longNight) w.longT += dt;
  if (!w.windUsed) w.stats.surviveNoWind = w.t;
  buildGrid(w);
  updateSpawns(w, dt);
  updatePlayer(w, inp || {}, dt);
  buildGrid(w);
  updateEnemies(w, dt);
  updateBoss(w, dt);
  if (w.over) return;
  updateBullets(w, dt);
  if (w.over) return;
  updateGems(w, dt);
  updateMoths(w, dt);
  processGraze(w);
  if (w.chain > 0 && w.t - w.lastGrazeT > 2.6) { w.chain = 0; ev(w, 'chainEnd', {}); }
  if (w.wild > 0) { w.wild -= dt; if (w.wild <= 0) { w.wild = 0; doNova(w, 200, w.st.dmg * 3, false); ev(w, 'wildEnd', {}); } }
}
function payout(w) {
  const g = curGlow(w);
  let base;
  if (w.dawn) base = w.winGlow + (w.longNight ? Math.max(0, g - (w.longStartGlow || g)) : 0);
  else base = w.banked + Math.floor(0.5 * (g - w.banked));
  const disc = 60 * w.newEvos.length + 40 * w.newMoths.length;
  return { glow: base + disc, base, disc, lost: w.dawn ? 0 : g - w.banked - Math.floor(0.5 * (g - w.banked)), runGlow: g };
}
function endRun(w, win) {
  if (w.over) return;
  w.over = { win: win || w.dawn, time: w.t, score: Math.floor(w.score), pay: payout(w) };
  ev(w, 'over', { win: w.over.win });
}

const api = {
  mulberry32, hashStr, localDayKey, dayIndex, keyFromIndex, clamp, lerp, fmtT, TAU,
  UPG, UPG_BY, EVOS, EVO_BY, ETYPES, WAVES, RAR, MOTHS, MOTH_BY, HEROES, HERO_BY, META, META_BY, SKINS, MPOOL, MPOOL_BY, BOSS_T,
  metaCost, defSave, mergeSave, ensureMissions, missionText, missionRunValue, missionsLive, commitMissions, markStreak, streakShown, weekOf, offlineGain, mothGlowRate, OFFLINE_CAP_H,
  makeWorld, step, rollChoices, chooseUpgrade, reroll, cardInfo, evoReady, evoPartnersOf, xpFor, curGlow, payout, endRun, stayLongNight, cashOut, lv, hasEvo, pickMoth,
};
if (typeof module !== 'undefined' && module.exports) module.exports = api;
root.GR = api;
})(typeof window !== 'undefined' ? window : globalThis);
