/* Twelve Sols — core rules. No DOM in this file: it runs in the browser and in Node tests.
   Layout: CONFIG (tunables) · DATA (items, recipes, builds, sites, events) · RNG (seeded) ·
   Rules (pure: newRun / check / act) · Store (validate + repair saves). */
(function (G) {
  'use strict';

  // ---------- CONFIG: every tunable number lives here ----------
  const CONFIG = {
    VERSION: 1,
    SOLS: 12,                    // rescue lands at dawn after this sol
    DAY_HOURS: 8,                // daylight hours per sol
    LAMP_HOURS: 2,               // extra bench hours after dusk with a lamp
    START: { air: 85, warm: 85, food: 85, hull: 100 },
    START_INV: { cell: 3, ice: 2, moss: 2, ration: 1, scrap: 2, wire: 1, oxy: 1, dust: 1, resin: 1 },
    HOUR_DRAIN: { air: 1, warm: 1, food: 1 },
    NIGHT_DRAIN: { air: 5, warm: 11, food: 7 },
    INSUL_WARM: 5,               // night warmth saved per insulation
    COLD_SNAP: 8,                // extra night warmth loss on a deep-cold sol
    BREACH: { hourAir: 2, nightAir: 14, nightWarm: 8 },
    STORM_BASE: 6, STORM_RAMP: 3.4, STORM_EXP: 0.9, STORM_CAP: 40,
    SURGE_MULT: 1.5, CALM_MULT: 0.6,
    SHUTTER_BLOCK: 8,
    NUMB_BELOW: 25,              // warmth under this: bench work takes 2 hours
    GUST_FROM_SOL: 8, GUST_AIR: 4,
    LINER_AIR_MULT: 0.6,
    NOTE_CHANCE: 0.35,
    BEACON_DELAY: 3, BEACON_MIN_RESCUE: 8,
    MAX_STACK: 15,
    SCORE: { perSol: 100, win: 600, earlySol: 110 },
    // Dust levels: unlocked one at a time by being rescued. Each level is harsher and scores more.
    LEVELS: [
      { name: 'Calm season', storm: 0, warm: 0, mult: 1 },
      { name: 'Dry season', storm: 4, warm: 2, mult: 1.25 },
      { name: 'Red season', storm: 8, warm: 4, mult: 1.5 },
      { name: 'Howling season', storm: 12, warm: 6, mult: 1.8 },
    ],
    DAILY_LEVEL: 1,
    STARTER_KNOWN: ['water', 'mash', 'brick', 'patch'],
    STARTER_HINTS: ['oxy', 'coil', 'heat'],
  };

  // ---------- DATA: content as data ----------
  const ITEMS = {
    ice:     { name: 'Ice Chunk',    color: '#bfe6ff', shape: 'hex' },
    dust:    { name: 'Red Dust',     color: '#d0603f', shape: 'dots' },
    scrap:   { name: 'Scrap Plate',  color: '#9aa3ad', shape: 'square' },
    wire:    { name: 'Copper Wire',  color: '#e0904a', shape: 'zig' },
    glass:   { name: 'Glass Shard',  color: '#8fe3d6', shape: 'tri' },
    moss:    { name: 'Rust Moss',    color: '#8db84a', shape: 'blob' },
    cell:    { name: 'Power Cell',   color: '#f2d14b', shape: 'bar' },
    cloth:   { name: 'Tarp Cloth',   color: '#d9c7a7', shape: 'wave' },
    resin:   { name: 'Sealant Resin', color: '#b08cd9', shape: 'drop' },
    ration:  { name: 'Old Ration',   color: '#e8b98a', shape: 'pack', use: { food: 22 } },
    water:   { name: 'Water Flask',  color: '#5fb0ff', shape: 'drop' },
    mash:    { name: 'Moss Mash',    color: '#a9cf63', shape: 'bowl', use: { food: 28 } },
    broth:   { name: 'Hot Broth',    color: '#ff9a5a', shape: 'bowl', use: { food: 20, warm: 30 } },
    oxy:     { name: 'Oxygen Can',   color: '#9ee7ff', shape: 'can', use: { air: 36 } },
    brick:   { name: 'Dust Brick',   color: '#b5523b', shape: 'brick' },
    patch:   { name: 'Hull Patch',   color: '#c9a0ff', shape: 'square', use: { hull: 30 }, hours: 1 },
    coil:    { name: 'Heat Coil',    color: '#ff7a45', shape: 'zig' },
    heat:    { name: 'Heat Pack',    color: '#ff5d3d', shape: 'pack', use: { warm: 45 } },
    antenna: { name: 'Antenna Mast', color: '#cfd6dc', shape: 'mast' },
    circuit: { name: 'Signal Board', color: '#65d18a', shape: 'board' },
  };

  const BUILDS = {
    lamp:    { name: 'Work Lamp',     max: 1, desc: '+2 bench hours after dusk' },
    planter: { name: 'Moss Planter',  max: 2, desc: '+1 Rust Moss every dawn' },
    shutter: { name: 'Storm Shutter', max: 3, desc: 'blocks 8 storm each night' },
    insul:   { name: 'Insulation',    max: 2, desc: 'saves 5 warmth each night' },
    panel:   { name: 'Solar Panel',   max: 2, desc: '+1 Power Cell every clear dawn' },
    liner:   { name: 'Suit Liner',    max: 1, desc: 'trips cost 40% less air' },
    beacon:  { name: 'Signal Beacon', max: 1, desc: 'calls the rescue lander early' },
  };

  // Each recipe: two different ingredients (order free) -> items or a build.
  const RECIPES = [
    { id: 'water',   a: 'ice',     b: 'cell',    out: { water: 3 },  hint: 'Ice melts fast with a power cell pressed against it.' },
    { id: 'mash',    a: 'moss',    b: 'water',   out: { mash: 1 },   hint: 'Soaked moss is barely food. Barely is enough.' },
    { id: 'oxy',     a: 'water',   b: 'cell',    out: { oxy: 1 },    hint: 'Run current through water and you can breathe what bubbles up.' },
    { id: 'broth',   a: 'mash',    b: 'cell',    out: { broth: 1 },  hint: 'Warm the mash on a live cell and it warms you back.' },
    { id: 'brick',   a: 'dust',    b: 'water',   out: { brick: 1 },  hint: 'Wet red dust packs into a brick.' },
    { id: 'patch',   a: 'brick',   b: 'resin',   out: { patch: 1 },  hint: 'A brick sealed in resin plugs a hole in the hull.' },
    { id: 'coil',    a: 'wire',    b: 'scrap',   out: { coil: 1 },   hint: 'Wind wire around a plate and it glows when powered.' },
    { id: 'heat',    a: 'coil',    b: 'cell',    out: { heat: 1 },   hint: 'A glowing coil plus a cell makes a hand-warmer.' },
    { id: 'lamp',    a: 'glass',   b: 'wire',    build: 'lamp',      hint: 'Glass and wire make a lamp for working after dark.' },
    { id: 'planter', a: 'moss',    b: 'dust',    build: 'planter',   hint: 'Moss grows in a tray of red dust, given a night.' },
    { id: 'shutter', a: 'brick',   b: 'scrap',   build: 'shutter',   hint: 'Plate bolted over brick takes the storm\'s punches.' },
    { id: 'insul',   a: 'cloth',   b: 'resin',   build: 'insul',     hint: 'Tarp glued into the walls holds warmth overnight.' },
    { id: 'panel',   a: 'glass',   b: 'coil',    build: 'panel',     hint: 'Glass laid over a coil can drink the weak sunlight.' },
    { id: 'liner',   a: 'cloth',   b: 'wire',    build: 'liner',     hint: 'Stitch wire through tarp for a suit liner that wastes less air.' },
    { id: 'antenna', a: 'coil',    b: 'scrap',   out: { antenna: 1 }, hint: 'A coil on a tall plate could throw a signal far.' },
    { id: 'circuit', a: 'glass',   b: 'cell',    out: { circuit: 1 }, hint: 'Etch glass on a live cell and you have a signal board.' },
    { id: 'beacon',  a: 'antenna', b: 'circuit', build: 'beacon',    hint: 'Mast plus signal board: a beacon the lander can follow.' },
  ];

  const SITES = {
    crater: { name: 'Crater Field', h: 2, air: 8,  n: 3, loot: { dust: 4, glass: 3, scrap: 2, ice: 1, cell: 1 }, note: 0 },
    wreck:  { name: 'Probe Wreck',  h: 3, air: 10, n: 4, loot: { scrap: 4, wire: 4, cell: 4, glass: 1, cloth: 1 }, note: 0.2 },
    shelf:  { name: 'Ice Shelf',    h: 2, air: 9,  n: 3, loot: { ice: 6, glass: 1, dust: 1, cell: 1 }, note: 0 },
    gully:  { name: 'Moss Gully',   h: 2, air: 8,  n: 3, loot: { moss: 5, dust: 2, ice: 1, resin: 1 }, note: 0 },
    depot:  { name: 'Old Depot',    h: 3, air: 10, n: 4, loot: { cloth: 3, resin: 3, cell: 2, ration: 2, wire: 1 }, note: 0.15 },
    dunes:  { name: 'Glass Dunes',  h: 2, air: 8,  n: 3, loot: { glass: 4, dust: 3, cell: 1, wire: 1 }, note: 0 },
  };
  const LIFE_SITES = ['shelf', 'gully'];   // one of these is always offered (no impossible sols)

  const EVENTS = {
    plain:  { name: 'Ordinary sol', text: 'Thin wind. Pale sun.', w: 5 },
    calm:   { name: 'Still air',    text: 'Tonight\'s storm will be weaker.', w: 2 },
    haze:   { name: 'Dust haze',    text: 'Trips take 1 extra hour. Panels sleep at dawn.', w: 2 },
    cold:   { name: 'Deep cold',    text: 'Tonight will steal 8 extra warmth.', w: 2 },
    surge:  { name: 'Storm surge',  text: 'Tonight\'s storm hits 50% harder.', w: 1, wPerSol: 0.35 },
    cache:  { name: 'Supply pod',   text: 'A pod thumped down by the hatch: +1 Old Ration, +1 Power Cell.', w: 1, give: { ration: 1, cell: 1 } },
    meteor: { name: 'Meteor rain',  text: 'Fragments rattled the dome: +2 Scrap Plate, +1 Glass Shard.', w: 1, give: { scrap: 2, glass: 1 } },
  };

  const NEED_KEYS = ['air', 'warm', 'food'];
  const NEED_NAMES = { air: 'Air', warm: 'Warmth', food: 'Food', hull: 'Hull' };

  const DATA = { ITEMS, BUILDS, RECIPES, SITES, LIFE_SITES, EVENTS, NEED_KEYS, NEED_NAMES };
  const RECIPE_BY_ID = {}; const RECIPE_BY_PAIR = {};
  function pairKey(a, b) { return a < b ? a + '|' + b : b + '|' + a; }
  RECIPES.forEach(r => { RECIPE_BY_ID[r.id] = r; RECIPE_BY_PAIR[pairKey(r.a, r.b)] = r; });

  // ---------- RNG: seeded, state lives in the run ----------
  function hashSeed(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
  function rnd(s) { // mulberry32 step on s.rng
    let t = (s.rng = (s.rng + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function pickW(s, table) { // table: {key: weight}
    const keys = Object.keys(table); let tot = 0; keys.forEach(k => tot += table[k]);
    let r = rnd(s) * tot;
    for (const k of keys) { r -= table[k]; if (r < 0) return k; }
    return keys[keys.length - 1];
  }

  // ---------- helpers ----------
  const clone = o => JSON.parse(JSON.stringify(o));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function stormPower(sol) {
    return Math.round(Math.min(CONFIG.STORM_CAP, CONFIG.STORM_BASE + CONFIG.STORM_RAMP * Math.pow(sol, CONFIG.STORM_EXP)));
  }
  function lv(s) { return CONFIG.LEVELS[s.level || 0]; }
  function stormTonight(s) {
    let p = stormPower(s.sol) + lv(s).storm;
    if (s.event === 'surge') p = Math.round(p * CONFIG.SURGE_MULT);
    if (s.event === 'calm') p = Math.round(p * CONFIG.CALM_MULT);
    const blocked = Math.min(p, (s.builds.shutter || 0) * CONFIG.SHUTTER_BLOCK);
    return { power: p, blocked, dmg: p - blocked };
  }
  function hourLimit(s) { return CONFIG.DAY_HOURS + (s.builds.lamp ? CONFIG.LAMP_HOURS : 0); }
  function isNight(s) { return s.hour >= CONFIG.DAY_HOURS; }
  function count(s, id) { return s.inv[id] || 0; }

  function newMeta() {
    return { v: CONFIG.VERSION, known: CONFIG.STARTER_KNOWN.slice(), hints: CONFIG.STARTER_HINTS.slice(), duds: [],
      best: 0, runs: 0, wins: 0, daily: {}, lastFinished: '', unlocked: 0 };
  }

  function log(s, text, kind) { s.log.push({ t: text, k: kind || '' }); if (s.log.length > 40) s.log.splice(0, s.log.length - 40); }

  function addItems(s, give, fx) {
    const lost = [];
    Object.keys(give).forEach(id => {
      const have = count(s, id); const room = CONFIG.MAX_STACK - have; const n = give[id];
      const add = Math.max(0, Math.min(room, n));
      if (add > 0) s.inv[id] = have + add;
      if (add < n) lost.push(ITEMS[id].name);
    });
    if (lost.length && fx) fx.push({ k: 'full', items: lost });
    return lost;
  }

  function rollDay(s) {
    // three distinct sites, at least one life site
    const ids = Object.keys(SITES);
    const life = LIFE_SITES[Math.floor(rnd(s) * LIFE_SITES.length)];
    const pool = ids.filter(i => i !== life); const out = [life];
    while (out.length < 3) { const k = pool.splice(Math.floor(rnd(s) * pool.length), 1)[0]; out.push(k); }
    // shuffle order
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd(s) * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    s.sites = out; s.visited = [false, false, false];
    if (s.sol === 1) { s.event = 'plain'; return; }
    const table = {}; Object.keys(EVENTS).forEach(k => { const e = EVENTS[k]; table[k] = e.w + (e.wPerSol || 0) * s.sol; });
    s.event = pickW(s, table);
  }

  function applyNeeds(s, delta) {
    Object.keys(delta).forEach(k => {
      if (k === 'hull') s.hull = clamp(s.hull + delta[k], 0, 100);
      else s.needs[k] = clamp(s.needs[k] + delta[k], 0, 100);
    });
  }

  // spend hours inside the hab (or outside, with the suit replacing hab air)
  function spendHours(s, h, outside) {
    for (let i = 0; i < h; i++) {
      const d = { warm: -CONFIG.HOUR_DRAIN.warm, food: -CONFIG.HOUR_DRAIN.food };
      if (!outside) d.air = -CONFIG.HOUR_DRAIN.air - (s.hull <= 0 ? CONFIG.BREACH.hourAir : 0);
      applyNeeds(s, d);
    }
    s.hour += h;
  }

  function deadNeed(s) { for (const k of NEED_KEYS) if (s.needs[k] <= 0) return k; return null; }

  function score(s, win) {
    const sc = CONFIG.SCORE; const solsDone = win ? s.rescueSol : s.sol - 1;
    let pts = solsDone * sc.perSol;
    if (win) {
      pts += sc.win + (CONFIG.SOLS - s.rescueSol) * sc.earlySol;
      pts += Math.round((s.needs.air + s.needs.warm + s.needs.food) / 3 + s.hull / 2);
    }
    return Math.round(pts * lv(s).mult);
  }

  function finish(s, meta, win, cause, fx) {
    s.result = { win, cause: cause || null, score: score(s, win), sol: s.sol };
    if (meta.lastFinished !== s.runId) {
      meta.lastFinished = s.runId; meta.runs += 1; if (win) meta.wins += 1;
      if (win && s.mode === 'normal' && (s.level || 0) >= meta.unlocked && meta.unlocked < CONFIG.LEVELS.length - 1) { meta.unlocked += 1; s.result.unlocked = meta.unlocked; }
      s.result.newBest = s.result.score > meta.best;
      if (s.result.newBest) meta.best = s.result.score;
      if (s.mode === 'daily') { const prev = meta.daily[s.day] || 0; if (s.result.score > prev) meta.daily[s.day] = s.result.score; }
    }
    fx.push({ k: win ? 'win' : 'lose', cause });
  }

  // ---------- Rules ----------
  const Rules = {
    newRun(seedStr, mode, meta, day, level) {
      let L = mode === 'daily' ? CONFIG.DAILY_LEVEL : (level == null ? (meta ? meta.unlocked : 0) : level);
      if (mode !== 'daily') L = Math.min(L, meta ? meta.unlocked : 0);
      L = clamp(L | 0, 0, CONFIG.LEVELS.length - 1);
      const s = {
        level: L,
        v: CONFIG.VERSION, runId: seedStr + ':' + (meta ? meta.runs : 0), seed: seedStr, mode: mode || 'normal', day: day || '',
        rng: hashSeed(seedStr), sol: 1, hour: 0,
        needs: { air: CONFIG.START.air, warm: CONFIG.START.warm, food: CONFIG.START.food }, hull: CONFIG.START.hull,
        inv: clone(CONFIG.START_INV), builds: {}, sites: [], visited: [], event: 'plain',
        rescueSol: CONFIG.SOLS, beaconSol: 0,
        stats: { found: [], crafts: 0, trips: 0, dmg: 0, breachNights: 0, tries: 0, duds: 0 },
        log: [], night: null, result: null,
      };
      rollDay(s);
      log(s, 'Sol 1. The lander left you a hab, some supplies, and a promise: back at dawn after Sol ' + CONFIG.SOLS + '.', 'sys');
      return s;
    },

    // Is an action allowed? Returns {ok, why, hours}
    check(s, meta, a) {
      if (!s || s.result) return { ok: false, why: 'The run is over.' };
      const limit = hourLimit(s); const left = limit - s.hour;
      switch (a.t) {
        case 'scav': {
          const id = s.sites[a.i]; const site = SITES[id];
          if (!site) return { ok: false, why: 'No such site.' };
          if (s.visited[a.i]) return { ok: false, why: 'Already picked clean today.' };
          if (isNight(s)) return { ok: false, why: 'Too dark to go out.' };
          const h = site.h + (s.event === 'haze' ? 1 : 0);
          if (s.hour + h > CONFIG.DAY_HOURS) return { ok: false, why: 'Needs ' + h + 'h of daylight.' };
          return { ok: true, hours: h, air: Rules.tripAir(s, id) };
        }
        case 'craft': {
          const A = a.a, B = a.b;
          if (!ITEMS[A] || !ITEMS[B] || A === B) return { ok: false, why: 'Pick two different items.' };
          if (count(s, A) < 1 || count(s, B) < 1) return { ok: false, why: 'Missing an ingredient.' };
          const key = pairKey(A, B); const r = RECIPE_BY_PAIR[key];
          if (!r && meta.duds.indexOf(key) >= 0) return { ok: false, why: 'Tried before: nothing useful.' };
          if (r && r.build) {
            const b = BUILDS[r.build];
            if ((s.builds[r.build] || 0) >= b.max) return { ok: false, why: b.name + ' is already maxed (' + b.max + ').' };
          }
          if (isNight(s) && !s.builds.lamp) return { ok: false, why: 'Too dark to work. A lamp would help.' };
          const h = s.needs.warm < CONFIG.NUMB_BELOW ? 2 : 1;
          if (h > left) return { ok: false, why: left <= 0 ? 'No hours left. End the sol.' : 'Numb hands: needs 2h.' };
          return { ok: true, hours: h, recipe: r || null };
        }
        case 'use': {
          const it = ITEMS[a.id];
          if (!it || !it.use) return { ok: false, why: 'Not usable.' };
          if (count(s, a.id) < 1) return { ok: false, why: 'None left.' };
          const h = it.hours || 0;
          if (h) {
            if (isNight(s) && !s.builds.lamp) return { ok: false, why: 'Too dark to patch.' };
            if (h > left) return { ok: false, why: 'Needs ' + h + 'h.' };
          }
          const useful = Object.keys(it.use).some(k => (k === 'hull' ? s.hull : s.needs[k]) < 100);
          if (!useful) return { ok: false, why: 'Already full.' };
          return { ok: true, hours: h };
        }
        case 'end': return { ok: true };
        case 'ack': return { ok: true };
        default: return { ok: false, why: 'Unknown action.' };
      }
    },

    tripAir(s, id) {
      let air = SITES[id].air + (s.sol >= CONFIG.GUST_FROM_SOL ? CONFIG.GUST_AIR : 0);
      if (s.builds.liner) air = Math.round(air * CONFIG.LINER_AIR_MULT);
      return air;
    },

    // Pure: returns {s, meta, fx}. Never mutates its inputs.
    act(s0, meta0, a) {
      const s = clone(s0), meta = clone(meta0), fx = [];
      if (a.t === 'ack') { if (s.night) s.night.seen = true; return { s, meta, fx }; }
      const c = Rules.check(s, meta, a);
      if (!c.ok) { fx.push({ k: 'blocked', why: c.why }); return { s, meta, fx }; }

      if (a.t === 'scav') {
        const id = s.sites[a.i]; const site = SITES[id];
        s.visited[a.i] = true; s.stats.trips++;
        applyNeeds(s, { air: -c.air });
        spendHours(s, c.hours, true);
        const got = {};
        for (let i = 0; i < site.n; i++) { const k = pickW(s, site.loot); got[k] = (got[k] || 0) + 1; }
        addItems(s, got, fx);
        const names = Object.keys(got).map(k => got[k] + ' ' + ITEMS[k].name).join(', ');
        log(s, site.name + ': ' + names + '. (−' + c.air + ' air)', 'loot');
        fx.push({ k: 'loot', site: id, got });
        // field note: a hint for a recipe you don't know yet
        if (rnd(s) < CONFIG.NOTE_CHANCE + site.note) {
          const unknown = RECIPES.filter(r => meta.known.indexOf(r.id) < 0 && meta.hints.indexOf(r.id) < 0);
          if (unknown.length) {
            const r = unknown[Math.floor(rnd(s) * unknown.length)];
            meta.hints.push(r.id);
            log(s, 'Field note found: "' + r.hint + '"', 'note');
            fx.push({ k: 'note', id: r.id });
          }
        }
      } else if (a.t === 'craft') {
        const key = pairKey(a.a, a.b); const r = c.recipe;
        spendHours(s, c.hours, false); s.stats.tries++;
        if (!r) {
          meta.duds.push(key); s.stats.duds++;
          log(s, ITEMS[a.a].name + ' + ' + ITEMS[a.b].name + ': nothing useful. Noted in the journal.', 'dud');
          fx.push({ k: 'dud', key });
        } else {
          s.inv[r.a]--; s.inv[r.b]--;
          if (!s.inv[r.a]) delete s.inv[r.a];
          if (!s.inv[r.b]) delete s.inv[r.b];
          const isNew = meta.known.indexOf(r.id) < 0;
          if (isNew) { meta.known.push(r.id); s.stats.found.push(r.id); }
          s.stats.crafts++;
          let made;
          if (r.build) {
            s.builds[r.build] = (s.builds[r.build] || 0) + 1; made = BUILDS[r.build].name;
            if (r.build === 'beacon') {
              s.beaconSol = s.sol;
              const res = Math.max(s.sol + CONFIG.BEACON_DELAY, CONFIG.BEACON_MIN_RESCUE);
              s.rescueSol = Math.min(s.rescueSol, res);
              log(s, 'The beacon is pulsing. The lander answers: dawn after Sol ' + s.rescueSol + '.', 'good');
            }
          } else {
            addItems(s, r.out, fx);
            made = Object.keys(r.out).map(k => r.out[k] + ' ' + ITEMS[k].name).join(', ');
          }
          log(s, (isNew ? 'Discovered! ' : 'Made ') + made + '.', isNew ? 'new' : 'make');
          fx.push({ k: isNew ? 'discover' : 'craft', id: r.id });
        }
      } else if (a.t === 'use') {
        const it = ITEMS[a.id];
        s.inv[a.id]--; if (!s.inv[a.id]) delete s.inv[a.id];
        if (c.hours) spendHours(s, c.hours, false);
        applyNeeds(s, it.use);
        log(s, 'Used ' + it.name + '.', 'use');
        fx.push({ k: 'use', id: a.id });
      } else if (a.t === 'end') {
        Rules.night(s, meta, fx);
        return { s, meta, fx };
      }
      const dn = deadNeed(s);
      if (dn) finish(s, meta, false, dn, fx);
      return { s, meta, fx };
    },

    night(s, meta, fx) {
      const st = stormTonight(s);
      const rep = { sol: s.sol, event: s.event, power: st.power, blocked: st.blocked, dmg: st.dmg,
        hullBefore: s.hull, breach: false, drain: {}, dawn: {}, seen: false };
      s.hull = clamp(s.hull - st.dmg, 0, 100); s.stats.dmg += st.dmg;
      rep.hullAfter = s.hull;
      if (s.hull <= 0) { rep.breach = true; s.stats.breachNights++; }
      const warmLoss = Math.max(0, CONFIG.NIGHT_DRAIN.warm + lv(s).warm - (s.builds.insul || 0) * CONFIG.INSUL_WARM
        + (s.event === 'cold' ? CONFIG.COLD_SNAP : 0) + (rep.breach ? CONFIG.BREACH.nightWarm : 0));
      const airLoss = CONFIG.NIGHT_DRAIN.air + (rep.breach ? CONFIG.BREACH.nightAir : 0);
      rep.drain = { air: airLoss, warm: warmLoss, food: CONFIG.NIGHT_DRAIN.food };
      applyNeeds(s, { air: -airLoss, warm: -warmLoss, food: -CONFIG.NIGHT_DRAIN.food });
      fx.push({ k: 'storm', dmg: st.dmg, power: st.power, breach: rep.breach });
      s.night = rep;
      const dn = deadNeed(s);
      if (dn) { log(s, 'Night of Sol ' + s.sol + ': the storm hit for ' + st.dmg + '.', 'storm'); finish(s, meta, false, dn, fx); return; }
      if (s.sol >= s.rescueSol) {
        log(s, 'Dawn. Engines overhead. The lander is down.', 'good');
        rep.rescued = true; finish(s, meta, true, null, fx); return;
      }
      // dawn
      const haze = s.event === 'haze';
      s.sol += 1; s.hour = 0;
      const give = {};
      if (s.builds.planter) give.moss = s.builds.planter;
      if (s.builds.panel && !haze) give.cell = s.builds.panel;
      if (Object.keys(give).length) addItems(s, give, fx);
      rep.dawn = give;
      rollDay(s);
      const ev = EVENTS[s.event];
      if (ev.give) addItems(s, ev.give, fx);
      rep.nextEvent = s.event;
      log(s, 'Sol ' + s.sol + ' — ' + ev.name + '. ' + ev.text, 'sys');
    },

    // knowledge helpers for the UI and bots
    secretsFor(meta, id) { return RECIPES.filter(r => (r.a === id || r.b === id) && meta.known.indexOf(r.id) < 0).length; },
    pairStatus(meta, a, b) {
      const key = pairKey(a, b); const r = RECIPE_BY_PAIR[key];
      if (r && meta.known.indexOf(r.id) >= 0) return { st: 'known', r };
      if (meta.duds.indexOf(key) >= 0) return { st: 'dud' };
      return { st: 'untried' };
    },
    legal(s, meta) { // every action a bot or test could try, with check results
      const out = [];
      s.sites.forEach((_, i) => out.push({ t: 'scav', i }));
      const ids = Object.keys(s.inv);
      for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) out.push({ t: 'craft', a: ids[i], b: ids[j] });
      ids.forEach(id => { if (ITEMS[id].use) out.push({ t: 'use', id }); });
      out.push({ t: 'end' });
      return out.filter(a => Rules.check(s, meta, a).ok);
    },
    stormTonight, stormPower, level: lv, hourLimit, pairKey, hashSeed, score,
  };

  // ---------- Store: validate and repair saved data ----------
  const isInt = (v, lo, hi) => typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi;
  const isNum = (v, lo, hi) => typeof v === 'number' && isFinite(v) && v >= lo && v <= hi;
  const Store = {
    validateRun(s) {
      try {
        if (!s || typeof s !== 'object' || s.v !== CONFIG.VERSION) return null;
        if (!isInt(s.sol, 1, CONFIG.SOLS) || !isInt(s.hour, 0, CONFIG.DAY_HOURS + CONFIG.LAMP_HOURS)) return null;
        if (!isInt(s.rescueSol, 1, CONFIG.SOLS) || s.sol > s.rescueSol) return null;
        if (!isInt(s.rng, 0, 4294967295) || typeof s.seed !== 'string' || typeof s.runId !== 'string') return null;
        if (!s.needs || !NEED_KEYS.every(k => isNum(s.needs[k], 0, 100)) || !isNum(s.hull, 0, 100)) return null;
        if (!s.inv || typeof s.inv !== 'object') return null;
        for (const k of Object.keys(s.inv)) if (!ITEMS[k] || !isInt(s.inv[k], 1, CONFIG.MAX_STACK)) return null;
        if (!s.builds || typeof s.builds !== 'object') return null;
        for (const k of Object.keys(s.builds)) if (!BUILDS[k] || !isInt(s.builds[k], 0, BUILDS[k].max)) return null;
        if (!Array.isArray(s.sites) || s.sites.length !== 3 || !s.sites.every(k => SITES[k])) return null;
        if (!Array.isArray(s.visited) || s.visited.length !== 3 || !s.visited.every(v => typeof v === 'boolean')) return null;
        if (!EVENTS[s.event]) return null;
        if (!Array.isArray(s.log) || !s.stats || typeof s.stats !== 'object' || !Array.isArray(s.stats.found)) return null;
        if (s.result !== null && (typeof s.result !== 'object' || typeof s.result.win !== 'boolean')) return null;
        if (s.night !== null && typeof s.night !== 'object') return null;
        if (s.mode !== 'normal' && s.mode !== 'daily') return null;
        if (!isInt(s.level, 0, CONFIG.LEVELS.length - 1)) return null;
        return s;
      } catch (e) { return null; }
    },
    repairMeta(m) {
      const out = newMeta();
      if (!m || typeof m !== 'object') return out;
      const ids = r => Array.isArray(r) ? r.filter((x, i) => typeof x === 'string' && RECIPE_BY_ID[x] && r.indexOf(x) === i) : [];
      out.known = Array.from(new Set(CONFIG.STARTER_KNOWN.concat(ids(m.known))));
      out.hints = Array.from(new Set(CONFIG.STARTER_HINTS.concat(ids(m.hints))));
      if (Array.isArray(m.duds)) out.duds = m.duds.filter((k, i) => {
        if (typeof k !== 'string' || m.duds.indexOf(k) !== i) return false;
        const p = k.split('|'); return p.length === 2 && ITEMS[p[0]] && ITEMS[p[1]] && p[0] < p[1] && !RECIPE_BY_PAIR[k];
      });
      ['best', 'runs', 'wins'].forEach(k => { if (isInt(m[k], 0, 1e7)) out[k] = m[k]; });
      if (isInt(m.unlocked, 0, CONFIG.LEVELS.length - 1)) out.unlocked = m.unlocked;
      if (out.wins > out.runs) out.wins = out.runs;
      if (m.daily && typeof m.daily === 'object') Object.keys(m.daily).forEach(d => {
        if (/^\d{8}$/.test(d) && isInt(m.daily[d], 0, 1e7)) out.daily[d] = m.daily[d];
      });
      if (typeof m.lastFinished === 'string') out.lastFinished = m.lastFinished;
      return out;
    },
  };

  G.TwelveSols = { CONFIG, DATA, Rules, Store, newMeta, pairKey, RECIPE_BY_ID, RECIPE_BY_PAIR };
})(typeof window !== 'undefined' ? window : globalThis);
