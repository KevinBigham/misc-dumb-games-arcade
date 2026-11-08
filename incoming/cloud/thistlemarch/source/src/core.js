/*CORE-START*/
'use strict';
// Thistlemarch core: CONFIG, DATA, RNG, pure Rules, enemy AI. No DOM access in this block.
var Core = (function () {
  const SAVE_V = 1, RULES_V = 2;

  // ===== CONFIG (all tunables) =====
  const CONFIG = {
    SUN_BONUS: 1,        // your attack from a sunlit tile
    SHADE_BONUS: 1,      // a Rot attack from a shaded tile
    MUD_PENALTY: 1,      // attacking from mud
    BUMP_DMG: 1,         // shoved into a wall or another unit
    FLANK_BONUS: 2,      // Duelist bonus if an ally also touches the target
    BLOOM_HEAL: 2,       // blooms heal whoever starts a turn on them
    BLOCK_DMG: 1,        // standing on a burrow when something tries to climb out
    SECOND_WIND: 2, CAMP_HEAL: 2, OATH_HP: 2, OATH_BOSS_HP: 6, OATH_RESOLVE: 2,
    XP_HIT: 1, XP_KILL: 3, XP_BOSS: 8, XP_HEAL: 1,
    CAPTAIN_XP: [0, 6, 15, 27],   // xp for level 2,3,4 at index 1..3
    VET_XP: [0, 5, 13],           // xp for level 2,3
    CAPTAIN_MAX: 4, VET_MAX: 3,
    BARRACKS_CAP: 9,
    RESOLVE: 3,                   // battle losses allowed in a campaign
    GATE_HP: 3, SEED_HP: 5,
  };

  // ===== DATA =====
  const TERRAIN = {
    '.': { key: 'meadow', name: 'Meadow', cost: 1, cover: 0, tip: 'Open ground. No bonus.' },
    'g': { key: 'grass', name: 'Tall grass', cost: 2, cover: 1, tip: 'Costs 2 move. Hits on a unit here deal 1 less.' },
    's': { key: 'stone', name: 'Pebble', cost: 2, cover: 0, high: true, tip: 'Costs 2 move. Ranged attackers here reach 1 tile farther.' },
    'm': { key: 'mud', name: 'Mud', cost: 1, cover: 0, mud: true, tip: 'Stops movement. Attacks made from mud deal 1 less.' },
    '#': { key: 'bramble', name: 'Bramble', cost: 99, block: true, tip: 'Impassable. Shove a foe into it for +1 damage.' },
    'b': { key: 'bloom', name: 'Bloom', cost: 1, cover: 0, heal: true, tip: 'Heals 2 to whoever starts a turn here, friend or foe.' },
    'o': { key: 'burrow', name: 'Burrow', cost: 1, cover: 0, burrow: true, tip: 'The Rot climbs out here. Stand on it to block (you take 1).' },
    'x': { key: 'gate', name: 'Thistle gate', cost: 1, cover: 0, exit: true, tip: 'Reach this with Oakhorn to win.' },
  };

  const UNIT_TYPES = {
    warden:  { name: 'Warden', side: 'p', hp: 8, move: 3, dmg: 2, range: [1, 1], push: 1, role: 'Captain',
               desc: 'Horn Shove: hit, then push the foe 1 tile. Walls and units it hits deal +1.' },
    duelist: { name: 'Mantis Duelist', side: 'p', hp: 5, move: 3, dmg: 3, range: [1, 1], flank: CONFIG.FLANK_BONUS, role: 'Striker',
               desc: 'Flank: +2 damage when another ally also touches the target.' },
    bomber:  { name: 'Bombardier', side: 'p', hp: 4, move: 2, dmg: 2, range: [2, 3], role: 'Ranged',
               desc: 'Lobs at range 2 to 3 (4 from a pebble). Cannot hit adjacent foes.' },
    mender:  { name: 'Ladybug Mender', side: 'p', hp: 5, move: 3, dmg: 1, range: [1, 1], heal: 2, role: 'Healer',
               desc: 'Tap an adjacent ally to heal 2. Can peck a foe for 1.' },
    scout:   { name: 'Hopper Scout', side: 'p', hp: 4, move: 4, dmg: 1, range: [1, 1], push: 1, skirmish: true, jump: true, role: 'Skirmisher',
               desc: 'Leaps over units, ignores foes\' grip. Kick: hit 1 and push 1.' },
    grub:    { name: 'Rot Grub', side: 'e', hp: 8, move: 2, dmg: 3, range: [1, 1], lunge: true, desc: 'Bites the unit it marks. Lunges 1 tile to follow it, so step 2 away to dodge.' },
    gnat:    { name: 'Gnat Swarm', side: 'e', hp: 4, move: 4, dmg: 2, range: [1, 1], fly: true, lunge: true, desc: 'Fast flier. Ignores terrain cost and cover. Lunges 1 tile after its mark.' },
    shell:   { name: 'Shellback', side: 'e', hp: 10, move: 1, dmg: 3, range: [1, 1], armor: 1, desc: 'Slow, armored (takes 1 less), hits hard.' },
    spitter: { name: 'Spitter', side: 'e', hp: 6, move: 2, dmg: 3, range: [2, 3], lob: true, desc: 'Lobs rot at a TILE 2 to 3 away. Step off the marked tile.' },
    mother:  { name: 'The Rotmother', side: 'e', hp: 26, move: 1, dmg: 4, range: [1, 1], armor: 1, sweep: true, boss: true,
               desc: 'Boss. Armored. Her swipe also hits both tiles beside the target.' },
  };

  const CAPTAIN_PERKS = {
    ironShell:  { name: 'Iron Shell', desc: 'Oakhorn takes 1 less damage from every hit.' },
    longHorns:  { name: 'Long Horns', desc: 'Horn Shove pushes 2 tiles.' },
    rally:      { name: 'Rally Cry', desc: 'Allies touching Oakhorn deal +1 damage.' },
    secondWind: { name: 'Second Wind', desc: 'Oakhorn heals 2 at the start of each of your turns.' },
    sunborn:    { name: 'Sunborn', desc: 'Oakhorn gets +2 in sunlight instead of +1.' },
  };
  const PERK_ORDER = ['ironShell', 'longHorns', 'rally', 'secondWind', 'sunborn'];

  const VET_PERK3 = {
    duelist: 'Flank bonus +1', bomber: 'Range +1', mender: 'Heal +1', scout: 'Move +1',
  };

  const NAMES = ['Nettle', 'Sorrel', 'Burdock', 'Yarrow', 'Teasel', 'Vetch', 'Mallow', 'Fennel', 'Sedge', 'Tansy',
    'Clove', 'Dandle', 'Bristle', 'Pip', 'Hazel', 'Rue', 'Cress', 'Moss', 'Bryony', 'Sage', 'Lark', 'Chive',
    'Thyme', 'Basil', 'Juniper', 'Aster', 'Hollis', 'Fern', 'Rowan', 'Briar'];

  // Map legend: . meadow  g tall grass  s pebble  m mud  # bramble  b bloom  o burrow  x gate  p start  S seedling
  // Shade: band of h rows starting at row, moving dir rows each round (wraps).
  const BATTLES = [
    { key: 'gate', name: 'Thistle Gate', obj: { kind: 'rout', limit: 7, par: 4 }, shade: null,
      intro: 'Three rot grubs have chewed through the thistle gate. Oakhorn steps up.',
      tip: 'Red lines show who each grub will bite. Hit first, or step out of reach.',
      map: ['g....g', '.#..#.', '..g...', '......', '...s..', '.g....', '......', '.pppp.'],
      foes: [['grub', 1, 2], ['grub', 4, 2], ['grub', 2, 0]] },
    { key: 'clover', name: 'Clover Run', obj: { kind: 'rout', limit: 7, par: 5 }, shade: { row: 0, h: 2, dir: 1 },
      intro: 'The Hedge throws its shade across the clover. The Rot loves the shade.',
      tip: 'Violet rows are shade: Rot hits +1 there. Fight from the sun (+1 to you).',
      map: ['..#...', 'g...g.', '...#..', '.b....', '....g.', '..s...', '#....#', '.pppp.'],
      foes: [['grub', 0, 1], ['grub', 4, 1], ['gnat', 2, 0], ['grub', 5, 3], ['gnat', 1, 4]] },
    { key: 'steps', name: 'Pebble Steps', obj: { kind: 'hold', rounds: 6 }, shade: { row: 0, h: 2, dir: 1 },
      intro: 'Burrows open on the high steps. Hold the line until the shade passes.',
      tip: 'A foe that reaches your back row cracks the gate. 3 cracks and it falls.',
      unlock: 'mender',
      map: ['o..o..', '..g...', '.s..s.', '......', 'g.##.g', '..ss..', '......', '.pppp.'],
      foes: [['grub', 1, 1], ['spitter', 4, 1], ['grub', 4, 3]],
      spawns: [[1, 'grub', 0, 0], [1, 'gnat', 3, 0], [2, 'grub', 3, 0], [2, 'gnat', 0, 0], [3, 'grub', 0, 0], [3, 'grub', 3, 0], [4, 'spitter', 3, 0], [4, 'gnat', 0, 0], [5, 'grub', 0, 0], [5, 'grub', 3, 0]] },
    { key: 'seedling', name: 'Seedling Watch', obj: { kind: 'protect', rounds: 6 }, shade: { row: 3, h: 2, dir: 1 },
      intro: 'A new acorn seedling has sprouted. The Rot wants it more than it wants you.',
      tip: 'Foes marked on the seedling show a green-ringed line. Shove them off it.',
      map: ['o....o', '..g...', '#..s.#', '..b...', 'g....g', '..S...', '.#..#.', '.pppp.'],
      foes: [['grub', 0, 1], ['grub', 5, 1], ['gnat', 3, 0]],
      spawns: [[1, 'grub', 0, 0], [1, 'gnat', 5, 0], [2, 'gnat', 5, 0], [2, 'grub', 0, 0], [3, 'grub', 0, 0], [3, 'grub', 5, 0], [4, 'gnat', 0, 0], [4, 'gnat', 5, 0], [5, 'grub', 5, 0], [5, 'grub', 0, 0]] },
    { key: 'mudflat', name: 'Mudflat Crossing', obj: { kind: 'reach', limit: 8, par: 5 }, shade: { row: 6, h: 2, dir: -1 },
      intro: 'The way north crosses the mudflats. Get Oakhorn to the far thistle gate.',
      tip: 'Mud stops movement. Shellbacks are slow but hit for 3.',
      unlock: 'scout',
      map: ['#.xx.#', '..mm..', 'm....m', '.g.mm.', '.mm..g', '....m.', 'm.s...', '.pppp.'],
      foes: [['shell', 1, 2], ['shell', 4, 2], ['grub', 1, 0], ['grub', 4, 0], ['gnat', 5, 3], ['gnat', 0, 3]] },
    { key: 'ridge', name: 'Spitter Ridge', obj: { kind: 'rout', limit: 8, par: 6 }, shade: { row: 2, h: 3, dir: 1 },
      intro: 'Spitters squat on the pebbles and lob rot down the slope.',
      tip: 'Spitters mark a TILE, not a unit. Step off it, or shove a foe onto it.',
      map: ['s.oo.s', '......', '.g..g.', '#....#', '..b...', '.s..g.', '......', '.pppp.'],
      foes: [['spitter', 0, 0], ['spitter', 5, 0], ['grub', 1, 2], ['grub', 4, 2], ['shell', 2, 1]],
      spawns: [[2, 'gnat', 2, 0], [3, 'grub', 3, 0], [4, 'gnat', 2, 0]] },
    { key: 'bloom', name: 'Bloom Meadow', obj: { kind: 'rout', limit: 8, par: 6 }, shade: { row: 0, h: 3, dir: 1 },
      intro: 'Gnats nest in the blooms. Blooms heal anything sitting on them, Rot included.',
      tip: 'Shove foes off blooms before they heal. Take the blooms yourself.',
      map: ['b....b', '.g..g.', '..bb..', 'g....g', '..##..', '.b..b.', '......', '.pppp.'],
      foes: [['gnat', 0, 0], ['gnat', 5, 0], ['gnat', 2, 2], ['gnat', 3, 2], ['grub', 1, 1], ['grub', 4, 1], ['spitter', 2, 0]] },
    { key: 'log', name: 'Hollow Log', obj: { kind: 'hold', rounds: 6 }, shade: { row: 0, h: 2, dir: 1 },
      intro: 'The only path to the Mound runs through a hollow log. Hold the far end.',
      tip: 'Narrow lanes: one Warden can grip a whole lane. Foes must stop beside you.',
      map: ['o.##.o', '..##..', '#....#', '#.g..#', '#..g.#', '#....#', '.s..s.', '.pppp.'],
      foes: [['grub', 1, 1], ['grub', 4, 1], ['shell', 2, 2]],
      spawns: [[1, 'grub', 0, 0], [1, 'gnat', 5, 0], [2, 'spitter', 0, 0], [2, 'grub', 5, 0], [3, 'grub', 5, 0], [3, 'grub', 0, 0], [4, 'shell', 5, 0], [4, 'gnat', 0, 0], [5, 'gnat', 0, 0], [5, 'gnat', 5, 0]] },
    { key: 'mound', name: 'Compost Mound', obj: { kind: 'boss', limit: 10, par: 7 }, shade: { row: 0, h: 3, dir: 1 },
      intro: 'The Rotmother heaves up from the Mound. End her, and the meadow breathes.',
      tip: 'Only the Rotmother must fall. Her swipe hits 3 tiles in a row.',
      map: ['o.gg.o', 'g....g', '......', '.#..#.', '..s...', 'g..b.g', '......', '.pppp.'],
      foes: [['mother', 2, 1], ['spitter', 0, 1], ['spitter', 5, 1], ['grub', 3, 2]],
      spawns: [[1, 'grub', 0, 0], [2, 'grub', 5, 0], [3, 'gnat', 0, 0], [4, 'grub', 5, 0], [5, 'grub', 0, 0], [6, 'gnat', 5, 0], [7, 'grub', 0, 0], [8, 'grub', 5, 0], [9, 'gnat', 0, 0]] },
  ];

  const START_UNLOCKS = ['duelist', 'bomber'];

  // ===== RNG (mulberry32; state lives in the save) =====
  function rngNext(st) {
    let t = (st.rng = (st.rng + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function rngInt(st, n) { return Math.floor(rngNext(st) * n); }
  function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }

  // ===== helpers =====
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const mod = (a, n) => ((a % n) + n) % n;
  const dist = (ax, ay, bx, by) => Math.abs(ax - bx) + Math.abs(ay - by);
  function inB(b, x, y) { return x >= 0 && y >= 0 && x < b.cols && y < b.rows; }
  function code(b, x, y) { return b.tiles[y * b.cols + x]; }
  function terr(b, x, y) { return TERRAIN[code(b, x, y)] || TERRAIN['.']; }
  function unitAt(b, x, y) { for (const u of b.units) if (u.hp > 0 && u.x === x && u.y === y) return u; return null; }
  function getUnit(b, id) { for (const u of b.units) if (u.id === id) return u; return null; }
  function isSeed(b, x, y) { return !!(b.seedling && b.seedling.hp > 0 && b.seedling.x === x && b.seedling.y === y); }
  function shadeRowsAt(b, row) { const s = new Set(); if (!b.shade || !b.shade.h) return s; for (let k = 0; k < b.shade.h; k++) s.add(mod(row + k, b.rows)); return s; }
  function inShade(b, y) { return !!(b.shade && b.shade.h) && shadeRowsAt(b, b.shade.row).has(y); }
  function nextShadeRows(b) { if (!b.shade || !b.shade.h) return new Set(); return shadeRowsAt(b, mod(b.shade.row + b.shade.dir, b.rows)); }
  function T(u) { return UNIT_TYPES[u.type]; }
  function captainOf(b) { for (const u of b.units) if (u.captain && u.hp > 0) return u; return null; }
  function players(b) { return b.units.filter(u => u.side === 'p' && u.hp > 0); }
  function foes(b) { return b.units.filter(u => u.side === 'e' && u.hp > 0); }
  function ev(b, k, data) { const e = Object.assign({ k }, data || {}); e.s = snap(b); return e; }
  function snap(b) { const c = clone(b); return c; }

  // ===== unit stats / progression =====
  function applyStats(u) {
    const t = UNIT_TYPES[u.type];
    let hp = t.hp, dmg = t.dmg, move = t.move, armor = t.armor || 0, rmax = t.range[1], heal = t.heal || 0, flank = t.flank || 0, push = t.push || 0;
    if (u.captain) {
      hp += 2 * (u.level - 1);
      if (u.perks.includes('ironShell')) armor += 1;
      if (u.perks.includes('longHorns')) push = 2;
    } else if (u.side === 'p') {
      if (u.level >= 2) hp += 2;
      if (u.level >= 3) {
        hp += 1; dmg += 1;
        if (u.type === 'duelist') flank += 1;
        if (u.type === 'bomber') rmax += 1;
        if (u.type === 'mender') heal += 1;
        if (u.type === 'scout') move += 1;
      }
    }
    const gained = hp - (u.maxHp || hp);
    u.maxHp = hp; u.dmg = dmg; u.move = move; u.armor = armor; u.rmin = t.range[0]; u.rmax = rmax; u.heal = heal; u.flank = flank; u.push = push;
    if (u.hp == null) u.hp = hp; else if (gained > 0) u.hp = Math.min(hp, u.hp + gained);
    if (u.hp > u.maxHp) u.hp = u.maxHp;
  }

  function makeUnit(b, type, x, y, extra) {
    const t = UNIT_TYPES[type];
    const u = { id: b.nextId++, type, side: t.side, x, y, hp: null, maxHp: null, moved: false, acted: false, intent: null,
      xp: 0, level: 1, perks: [], name: t.name, captain: false, vetId: null, gained: 0 };
    Object.assign(u, extra || {});
    applyStats(u);
    if (b.oath && u.side === 'e') { u.maxHp += t.boss ? CONFIG.OATH_BOSS_HP : CONFIG.OATH_HP; u.hp = u.maxHp; }
    b.units.push(u);
    return u;
  }

  function gainXp(b, u, n, events) {
    if (!u || u.side !== 'p' || u.hp <= 0) return;
    u.xp += n; u.gained = (u.gained || 0) + n;
    const table = u.captain ? CONFIG.CAPTAIN_XP : CONFIG.VET_XP;
    const max = u.captain ? CONFIG.CAPTAIN_MAX : CONFIG.VET_MAX;
    while (u.level < max && u.xp >= table[u.level]) {
      u.level++;
      applyStats(u);
      if (events) events.push(ev(b, 'level', { id: u.id, level: u.level, x: u.x, y: u.y }));
    }
  }

  // ===== movement =====
  function passable(b, x, y) { return inB(b, x, y) && !terr(b, x, y).block && !isSeed(b, x, y); }
  function stepCost(b, u, x, y) {
    const t = terr(b, x, y);
    if (t.block) return Infinity;
    if (T(u).fly) return 1;
    return t.cost;
  }
  function zocAt(b, u, x, y) {
    if (T(u).skirmish) return false;
    for (const [dx, dy] of DIRS) { const o = unitAt(b, x + dx, y + dy); if (o && o.side !== u.side) return true; }
    return false;
  }
  // Returns Map "x,y" -> {x,y,rem,path}
  function reachable(b, u, opts) {
    opts = opts || {};
    const res = new Map();
    const start = { x: u.x, y: u.y, rem: opts.full ? u.move : (u.moved ? 0 : u.move), path: [[u.x, u.y]] };
    const best = new Map();
    best.set(u.x + ',' + u.y, start);
    const open = [start];
    const jump = !!T(u).jump, fly = !!T(u).fly;
    while (open.length) {
      open.sort((a, c) => c.rem - a.rem);
      const cur = open.shift();
      if (cur.rem <= 0) continue;
      for (const [dx, dy] of DIRS) {
        const nx = cur.x + dx, ny = cur.y + dy;
        if (!passable(b, nx, ny)) continue;
        const occ = unitAt(b, nx, ny);
        if (occ && occ !== u && occ.side !== u.side && !jump) continue;
        let c = stepCost(b, u, nx, ny);
        let rem;
        if (!fly && terr(b, nx, ny).mud) rem = 0;
        else { if (c > cur.rem) continue; rem = cur.rem - c; }
        if (!(occ && occ !== u) && zocAt(b, u, nx, ny)) rem = 0;
        const key = nx + ',' + ny;
        const prev = best.get(key);
        if (prev && prev.rem >= rem) continue;
        const node = { x: nx, y: ny, rem, path: cur.path.concat([[nx, ny]]) };
        best.set(key, node);
        open.push(node);
      }
    }
    for (const [k, n] of best) {
      const occ = unitAt(b, n.x, n.y);
      if (occ && occ !== u) continue;
      res.set(k, n);
    }
    return res;
  }

  // ===== attacks =====
  function rmaxAt(b, u, x, y) { let m = u.rmax; if (m > 1 && terr(b, x, y).high) m += 1; return m; }
  function inReach(b, u, ux, uy, tx, ty) { const d = dist(ux, uy, tx, ty); return d >= u.rmin && d <= rmaxAt(b, u, ux, uy); }
  function tilesInReach(b, u, ux, uy) {
    const out = [], rm = rmaxAt(b, u, ux, uy);
    for (let y = 0; y < b.rows; y++) for (let x = 0; x < b.cols; x++) {
      const d = dist(ux, uy, x, y); if (d >= u.rmin && d <= rm) out.push([x, y]);
    }
    return out;
  }
  // damage from attacker standing at (ax,ay) against defender (unit or null for seedling) at (dx,dy)
  function calcDamage(b, att, ax, ay, def, dx, dy) {
    let d = att.dmg; const parts = ['base ' + att.dmg];
    if (att.side === 'p') {
      if (!inShade(b, ay)) { const sb = CONFIG.SUN_BONUS * (att.captain && att.perks.includes('sunborn') ? 2 : 1); d += sb; parts.push('sun +' + sb); }
      if (!att.captain) {
        const cap = captainOf(b);
        if (cap && cap.perks.includes('rally') && dist(cap.x, cap.y, ax, ay) === 1) { d += 1; parts.push('rally +1'); }
      }
      if (att.flank && def) {
        for (const [ox, oy] of DIRS) {
          const o = unitAt(b, dx + ox, dy + oy);
          if (o && o.side === 'p' && o !== att && !(o.x === ax && o.y === ay)) { d += att.flank; parts.push('flank +' + att.flank); break; }
        }
      }
    } else {
      if (inShade(b, ay)) { d += CONFIG.SHADE_BONUS; parts.push('shade +' + CONFIG.SHADE_BONUS); }
    }
    if (terr(b, ax, ay).mud && !T(att).fly) { d -= CONFIG.MUD_PENALTY; parts.push('mud -1'); }
    if (def) {
      const cv = T(def).fly ? 0 : terr(b, dx, dy).cover;
      if (cv) { d -= cv; parts.push('grass -' + cv); }
      if (def.armor) { d -= def.armor; parts.push('armor -' + def.armor); }
    }
    return { dmg: Math.max(1, d), parts };
  }

  function damageUnit(b, v, dmg, events, src, kind) {
    if (!v || v.hp <= 0) return;
    v.hp -= dmg;
    if (v.side === 'p') b.stats.taken += dmg; else b.stats.dealt += dmg;
    events.push(ev(b, 'hurt', { id: v.id, x: v.x, y: v.y, dmg, src: src ? src.id : null, kind: kind || 'hit', side: v.side }));
    if (v.hp <= 0) killUnit(b, v, events, src);
  }
  function killUnit(b, v, events, src) {
    v.hp = 0;
    b.units = b.units.filter(u => u !== v);
    if (v.side === 'p') b.fallen.push({ name: v.name, type: v.type, vetId: v.vetId, captain: v.captain, level: v.level });
    else b.kills++;
    events.push(ev(b, 'death', { id: v.id, x: v.x, y: v.y, side: v.side, type: v.type }));
    if (src && src.side === 'p' && v.side === 'e') gainXp(b, src, T(v).boss ? CONFIG.XP_BOSS : CONFIG.XP_KILL, events);
  }
  function damageSeed(b, dmg, events) {
    if (!b.seedling) return;
    b.seedling.hp = Math.max(0, b.seedling.hp - dmg);
    events.push(ev(b, 'hurt', { seed: true, x: b.seedling.x, y: b.seedling.y, dmg, side: 'seed' }));
  }

  // push v away from attacker by n tiles
  function pushUnit(b, att, v, n, events) {
    const dx = Math.sign(v.x - att.x), dy = Math.sign(v.y - att.y);
    for (let i = 0; i < n && v.hp > 0; i++) {
      const nx = v.x + dx, ny = v.y + dy;
      if (!inB(b, nx, ny) || terr(b, nx, ny).block || isSeed(b, nx, ny)) {
        events.push(ev(b, 'bump', { id: v.id, x: v.x, y: v.y, tx: nx, ty: ny }));
        damageUnit(b, v, CONFIG.BUMP_DMG, events, att, 'bump');
        return;
      }
      const occ = unitAt(b, nx, ny);
      if (occ) {
        events.push(ev(b, 'bump', { id: v.id, x: v.x, y: v.y, tx: nx, ty: ny }));
        damageUnit(b, v, CONFIG.BUMP_DMG, events, att, 'bump');
        damageUnit(b, occ, CONFIG.BUMP_DMG, events, occ.side === 'e' ? att : null, 'bump');
        return;
      }
      const fx = v.x, fy = v.y;
      v.x = nx; v.y = ny;
      events.push(ev(b, 'push', { id: v.id, fx, fy, x: nx, y: ny }));
      if (terr(b, nx, ny).mud && !T(v).fly) return;
    }
  }

  // ===== enemy intents =====
  // intent: {k:'unit', id} | {k:'tile', x, y} | {k:'seed'}  plus order
  function sweepTiles(b, e, tx, ty) {
    const out = [[tx, ty]];
    if (T(e).sweep) {
      const dx = Math.sign(tx - e.x), dy = Math.sign(ty - e.y);
      out.push([tx + dy, ty + dx], [tx - dy, ty - dx]);
    }
    return out.filter(([x, y]) => inB(b, x, y));
  }
  // Predict (apply=false) or resolve (apply=true) an intent.
  function resolveIntent(b, e, apply, events, claimed) {
    const it = e.intent;
    if (!it) return null;
    let tx, ty;
    if (it.k === 'unit') {
      const v = getUnit(b, it.id);
      if (!v || v.hp <= 0) return { fizzle: true, reason: 'target gone' };
      tx = v.x; ty = v.y;
    } else if (it.k === 'seed') {
      if (!b.seedling || b.seedling.hp <= 0) return { fizzle: true, reason: 'target gone' };
      tx = b.seedling.x; ty = b.seedling.y;
    } else { tx = it.x; ty = it.y; }
    let ax = e.x, ay = e.y, lunge = null;
    if (!inReach(b, e, ax, ay, tx, ty)) {
      // lungers take one step after a target that slipped away
      if (T(e).lunge && it.k !== 'tile') {
        for (const [dx, dy] of DIRS) {
          const nx = e.x + dx, ny = e.y + dy;
          if (!passable(b, nx, ny) || unitAt(b, nx, ny) || isSeed(b, nx, ny)) continue;
          if (claimed && claimed.has(nx + ',' + ny)) continue;
          if (inReach(b, e, nx, ny, tx, ty)) { lunge = { x: nx, y: ny }; break; }
        }
      }
      if (!lunge) {
        if (apply) events.push(ev(b, 'fizzle', { id: e.id, x: e.x, y: e.y, tx, ty }));
        return { fizzle: true, reason: T(e).lunge ? 'too far to lunge' : 'out of reach', tx, ty };
      }
      ax = lunge.x; ay = lunge.y;
      if (claimed) claimed.add(ax + ',' + ay);
      if (apply) {
        const fx = e.x, fy = e.y; e.x = ax; e.y = ay;
        events.push(ev(b, 'emove', { id: e.id, fx, fy, x: ax, y: ay, path: [[fx, fy], [ax, ay]], lunge: true }));
      }
    }
    const hits = [];
    const at = (ax === e.x && ay === e.y) ? e : Object.assign({}, e, { x: ax, y: ay });
    for (const [x, y] of sweepTiles(b, at, tx, ty)) {
      if (isSeed(b, x, y)) { hits.push({ seed: true, x, y, dmg: calcDamage(b, e, ax, ay, null, x, y).dmg }); continue; }
      const v = unitAt(b, x, y);
      if (v && v !== e) hits.push({ id: v.id, x, y, side: v.side, dmg: calcDamage(b, e, ax, ay, v, x, y).dmg });
    }
    if (apply) {
      events.push(ev(b, 'strike', { id: e.id, x: e.x, y: e.y, tx, ty, miss: hits.length === 0 }));
      for (const h of hits) {
        if (h.seed) damageSeed(b, h.dmg, events);
        else damageUnit(b, getUnit(b, h.id), h.dmg, events, e, 'hit');
      }
    }
    return { fizzle: false, tx, ty, hits, lunge };
  }
  function predictAll(b) {
    const out = [], claimed = new Set();
    const list = foes(b).filter(e => e.intent).sort((a, c) => a.intent.order - c.intent.order);
    for (const e of list) out.push({ id: e.id, order: e.intent.order, r: resolveIntent(b, e, false, null, claimed) });
    return out;
  }

  // distance field from goal tiles using unit u's movement costs (ignores units)
  function distField(b, u, goals) {
    const D = new Array(b.cols * b.rows).fill(Infinity);
    const q = [];
    for (const [x, y] of goals) { if (!passable(b, x, y) && !(x === u.x && y === u.y)) continue; D[y * b.cols + x] = 0; q.push([x, y, 0]); }
    while (q.length) {
      q.sort((a, c) => a[2] - c[2]);
      const [x, y, d] = q.shift();
      if (d > D[y * b.cols + x]) continue;
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy;
        if (!passable(b, nx, ny)) continue;
        // cost of stepping from (nx,ny) into (x,y) ~ cost of (x,y); mud treated as 3
        let c = T(u).fly ? 1 : (terr(b, x, y).mud ? 3 : terr(b, x, y).cost);
        const nd = d + c;
        if (nd < D[ny * b.cols + nx]) { D[ny * b.cols + nx] = nd; q.push([nx, ny, nd]); }
      }
    }
    return D;
  }

  function attackGoals(b, u) {
    const goals = [];
    const targets = players(b).map(p => [p.x, p.y]);
    if (b.seedling && b.seedling.hp > 0) targets.push([b.seedling.x, b.seedling.y]);
    for (let y = 0; y < b.rows; y++) for (let x = 0; x < b.cols; x++) {
      if (!passable(b, x, y)) continue;
      for (const [tx, ty] of targets) { const d = dist(x, y, tx, ty); if (d >= u.rmin && d <= rmaxAt(b, u, x, y)) { goals.push([x, y]); break; } }
    }
    return goals;
  }

  function planEnemies(b, events) {
    const planned = {}; // victim key -> damage already planned
    const order = foes(b).slice().sort((a, c) => {
      const da = Math.min(99, ...players(b).map(p => dist(a.x, a.y, p.x, p.y)));
      const dc = Math.min(99, ...players(b).map(p => dist(c.x, c.y, p.x, p.y)));
      return da - dc || a.id - c.id;
    });
    let n = 1;
    const hold = b.obj.kind === 'hold';
    const backRow = b.rows - 1;
    for (const e of order) {
      if (e.hp <= 0) continue;
      e.intent = null;
      const reach = reachable(b, e, { full: true });
      let best = null;
      const posScore = (t) => {
        let s = 0;
        if (inShade(b, t.y)) s += 4;
        if (!T(e).fly && terr(b, t.x, t.y).cover) s += 2;
        if (terr(b, t.x, t.y).heal && e.hp < e.maxHp) s += 3;
        if (!T(e).fly && terr(b, t.x, t.y).mud) s -= 2;
        s -= 0.01 * dist(t.x, t.y, e.x, e.y);
        return s;
      };
      for (const t of reach.values()) {
        if (hold && t.y === backRow) {
          const s = 60 + posScore(t);
          if (!best || s > best.s) best = { s, t, intent: null, breach: true };
          continue;
        }
        for (const [tx, ty] of tilesInReach(b, e, t.x, t.y)) {
          // evaluate the strike as if e stood at t
          let s = 0, any = false, mainKey = null;
          let tileList = sweepTiles(b, Object.assign({}, e, { x: t.x, y: t.y }), tx, ty);
          for (const [hx, hy] of tileList) {
            if (isSeed(b, hx, hy)) {
              const d = calcDamage(b, e, t.x, t.y, null, hx, hy).dmg;
              s += d * 10 + 30; any = true; if (hx === tx && hy === ty) mainKey = 'seed';
              continue;
            }
            const v = unitAt(b, hx, hy);
            if (!v || v === e) continue;
            const d = calcDamage(b, e, t.x, t.y, v, hx, hy).dmg;
            if (v.side === 'p') {
              const key = 'u' + v.id, pl = planned[key] || 0;
              if (pl >= v.hp) { s -= 15; continue; }
              s += Math.min(d, v.hp - pl) * 10; any = true;
              if (d + pl >= v.hp) s += 25;
              if (v.captain) s += 6;
              if (hx === tx && hy === ty) mainKey = key;
            } else {
              s -= 12;
            }
          }
          if (!any || !mainKey) continue;
          s += posScore(t);
          if (T(e).lob) s += 0; // spitters are happy anywhere in range
          if (!best || s > best.s) {
            let intent;
            if (mainKey === 'seed') intent = { k: 'seed' };
            else if (T(e).lob) intent = { k: 'tile', x: tx, y: ty };
            else intent = { k: 'unit', id: +mainKey.slice(1) };
            best = { s, t, intent, key: mainKey, dmg: calcDamage(b, e, t.x, t.y, mainKey === 'seed' ? null : getUnit(b, +mainKey.slice(1)), tx, ty).dmg };
          }
        }
      }
      if (!best) {
        // approach
        let goals;
        if (hold) { goals = []; for (let x = 0; x < b.cols; x++) goals.push([x, backRow]); }
        else goals = attackGoals(b, e);
        const D = distField(b, e, goals);
        let bs = null;
        for (const t of reach.values()) {
          const d = D[t.y * b.cols + t.x];
          let s = -d * 10 + posScore(t);
          if (T(e).lob) { const near = Math.min(99, ...players(b).map(p => dist(t.x, t.y, p.x, p.y))); if (near < 2) s -= 15; }
          if (!bs || s > bs.s) bs = { s, t };
        }
        if (bs) best = { s: bs.s, t: bs.t, intent: null };
      }
      if (best) {
        const t = best.t;
        if (t.x !== e.x || t.y !== e.y) {
          const fx = e.x, fy = e.y;
          e.x = t.x; e.y = t.y;
          events.push(ev(b, 'emove', { id: e.id, fx, fy, x: t.x, y: t.y, path: t.path }));
        }
        if (best.breach) {
          // slips through the gate
          b.gate = Math.max(0, (b.gate || 0) - 1);
          b.units = b.units.filter(u => u !== e);
          events.push(ev(b, 'breach', { id: e.id, x: e.x, y: e.y }));
          continue;
        }
        if (best.intent) {
          e.intent = Object.assign(best.intent, { order: n++ });
          if (best.key) planned[best.key] = (planned[best.key] || 0) + (best.dmg || 0);
        }
      }
    }
    if (events) events.push(ev(b, 'intents', {}));
  }

  function telegraphSpawns(b) {
    b.pending = (b.spawnPlan || []).filter(s => s[0] === b.round).map(s => ({ type: s[1], x: s[2], y: s[3] }));
  }
  function futureSpawns(b) { return (b.spawnPlan || []).some(s => s[0] > b.round) || (b.pending && b.pending.length > 0); }

  function healBlooms(b, side, events) {
    for (const u of b.units) {
      if (u.side !== side || u.hp <= 0) continue;
      if (terr(b, u.x, u.y).heal && u.hp < u.maxHp) {
        const h = Math.min(CONFIG.BLOOM_HEAL, u.maxHp - u.hp); u.hp += h;
        events.push(ev(b, 'heal', { id: u.id, x: u.x, y: u.y, amt: h }));
      }
      if (side === 'p' && u.captain && u.perks.includes('secondWind') && u.hp < u.maxHp) {
        const h = Math.min(CONFIG.SECOND_WIND, u.maxHp - u.hp); u.hp += h;
        events.push(ev(b, 'heal', { id: u.id, x: u.x, y: u.y, amt: h }));
      }
    }
  }

  // ===== win / loss =====
  function finish(b, result, reason, events) {
    b.phase = result; b.reason = reason;
    for (const u of b.units) u.intent = null;
    events.push(ev(b, result, { reason }));
    return true;
  }
  function checkEnd(b, events) {
    if (b.phase === 'won' || b.phase === 'lost') return true;
    if (b.mode !== 'free' && !captainOf(b)) return finish(b, 'lost', 'captain', events);
    if (players(b).length === 0) return finish(b, 'lost', 'band', events);
    if (b.seedling && b.seedling.hp <= 0) return finish(b, 'lost', 'seedling', events);
    if (b.obj.kind === 'hold' && b.gate <= 0) return finish(b, 'lost', 'breach', events);
    const k = b.obj.kind;
    if (k === 'rout' && foes(b).length === 0 && !futureSpawns(b)) return finish(b, 'won', 'rout', events);
    if (k === 'boss' && !b.units.some(u => u.side === 'e' && T(u).boss && u.hp > 0)) return finish(b, 'won', 'boss', events);
    if (k === 'reach') { const c = captainOf(b); if (c && terr(b, c.x, c.y).exit) return finish(b, 'won', 'reach', events); }
    return false;
  }

  function endTurn(b, events) {
    b.undo = null; b.phase = 'enemy';
    events.push(ev(b, 'phase', { who: 'e' }));
    const order = foes(b).filter(u => u.intent).sort((a, c) => a.intent.order - c.intent.order);
    for (const e of order) {
      if (e.hp <= 0 || !b.units.includes(e)) continue;
      resolveIntent(b, e, true, events);
      e.intent = null;
      if (checkEnd(b, events)) return;
    }
    for (const u of b.units) u.intent = null;
    const k = b.obj.kind;
    if ((k === 'hold' || k === 'protect') && b.round >= b.obj.rounds) { finish(b, 'won', k, events); return; }
    if (b.obj.limit && b.round >= b.obj.limit) { finish(b, 'lost', 'time', events); return; }
    // spawns climb out
    for (const sp of b.pending || []) {
      const occ = unitAt(b, sp.x, sp.y);
      if (occ && occ.side === 'p') { events.push(ev(b, 'blocked', { x: sp.x, y: sp.y, id: occ.id })); damageUnit(b, occ, CONFIG.BLOCK_DMG, events, null, 'block'); if (checkEnd(b, events)) return; continue; }
      if (occ || isSeed(b, sp.x, sp.y)) { events.push(ev(b, 'blocked', { x: sp.x, y: sp.y })); continue; }
      const u = makeUnit(b, sp.type, sp.x, sp.y);
      events.push(ev(b, 'spawn', { id: u.id, x: sp.x, y: sp.y, type: sp.type }));
    }
    b.pending = [];
    b.round++;
    if (b.shade && b.shade.h) { b.shade.row = mod(b.shade.row + b.shade.dir, b.rows); events.push(ev(b, 'shade', {})); }
    healBlooms(b, 'e', events);
    planEnemies(b, events);
    if (checkEnd(b, events)) return;
    telegraphSpawns(b);
    for (const u of b.units) if (u.side === 'p') { u.moved = false; u.acted = false; }
    healBlooms(b, 'p', events);
    b.phase = 'player';
    events.push(ev(b, 'phase', { who: 'p' }));
    checkEnd(b, events);
  }

  // ===== targets for the UI and bots =====
  function actTargets(b, u, x, y) {
    if (x == null) { x = u.x; y = u.y; }
    const out = [];
    for (const [tx, ty] of tilesInReach(b, u, x, y)) {
      const v = unitAt(b, tx, ty);
      if (!v || v === u) continue;
      if (v.side === 'e') out.push({ x: tx, y: ty, kind: 'attack', id: v.id });
      else if (u.heal && dist(x, y, tx, ty) === 1 && v.hp < v.maxHp) out.push({ x: tx, y: ty, kind: 'heal', id: v.id });
    }
    return out;
  }

  // Forecast an action without changing state.
  function forecast(b, u, tx, ty) {
    const c = clone(b);
    const r = applyCommand(c, { t: 'act', id: u.id, x: tx, y: ty });
    return r;
  }

  // ===== command boundary =====
  function applyCommand(b, cmd) {
    const events = [];
    const fail = (why) => ({ ok: false, why, events, state: b });
    if (!cmd || typeof cmd !== 'object') return fail('bad command');
    if (b.phase !== 'player') return fail('not your turn');
    if (cmd.t === 'move') {
      const u = getUnit(b, cmd.id);
      if (!u || u.side !== 'p' || u.hp <= 0) return fail('no unit');
      if (u.moved || u.acted) return fail('already moved');
      const r = reachable(b, u);
      const n = r.get(cmd.x + ',' + cmd.y);
      if (!n) return fail('cannot reach');
      if (n.x === u.x && n.y === u.y) return fail('same tile');
      b.undo = { id: u.id, x: u.x, y: u.y };
      const fx = u.x, fy = u.y;
      u.x = n.x; u.y = n.y; u.moved = true;
      events.push(ev(b, 'move', { id: u.id, fx, fy, x: n.x, y: n.y, path: n.path }));
      checkEnd(b, events);
      return { ok: true, events, state: b };
    }
    if (cmd.t === 'undo') {
      const un = b.undo;
      if (!un) return fail('nothing to undo');
      const u = getUnit(b, un.id);
      if (!u || u.acted || unitAt(b, un.x, un.y)) { b.undo = null; return fail('cannot undo'); }
      const fx = u.x, fy = u.y;
      u.x = un.x; u.y = un.y; u.moved = false; b.undo = null;
      events.push(ev(b, 'move', { id: u.id, fx, fy, x: u.x, y: u.y, path: [[fx, fy], [u.x, u.y]], undo: true }));
      return { ok: true, events, state: b };
    }
    if (cmd.t === 'act') {
      const u = getUnit(b, cmd.id);
      if (!u || u.side !== 'p' || u.hp <= 0) return fail('no unit');
      if (u.acted) return fail('already acted');
      const tg = actTargets(b, u).find(t => t.x === cmd.x && t.y === cmd.y);
      if (!tg) return fail('no target');
      const v = getUnit(b, tg.id);
      if (tg.kind === 'heal') {
        const h = Math.min(u.heal, v.maxHp - v.hp); v.hp += h;
        events.push(ev(b, 'mend', { id: u.id, tid: v.id, x: v.x, y: v.y, amt: h }));
        gainXp(b, u, CONFIG.XP_HEAL, events);
      } else {
        const dmg = calcDamage(b, u, u.x, u.y, v, v.x, v.y).dmg;
        events.push(ev(b, 'pstrike', { id: u.id, tid: v.id, x: u.x, y: u.y, tx: v.x, ty: v.y }));
        gainXp(b, u, CONFIG.XP_HIT, events);
        damageUnit(b, v, dmg, events, u, 'hit');
        if (v.hp > 0 && u.push && dist(u.x, u.y, v.x, v.y) === 1) pushUnit(b, u, v, u.push, events);
      }
      u.acted = true; u.moved = true; b.undo = null;
      checkEnd(b, events);
      return { ok: true, events, state: b };
    }
    if (cmd.t === 'end') {
      endTurn(b, events);
      return { ok: true, events, state: b };
    }
    return fail('unknown command');
  }

  // ===== battle creation =====
  function createBattle(def, band, opts) {
    opts = opts || {};
    const rows = def.map.length, cols = def.map[0].length;
    const b = { v: SAVE_V, rv: RULES_V, key: def.key, idx: opts.idx == null ? -1 : opts.idx, name: def.name, cols, rows,
      tiles: '', units: [], nextId: 1, round: 1, phase: 'player', obj: clone(def.obj), shade: def.shade ? clone(def.shade) : null,
      seed: (opts.seed >>> 0) || 1, rng: (opts.seed >>> 0) || 1, spawnPlan: clone(def.spawns || []), pending: [], fallen: [], kills: 0,
      undo: null, seedling: null, gate: def.obj.kind === 'hold' ? CONFIG.GATE_HP : 0, mode: opts.mode || 'campaign', oath: !!opts.oath, stats: { taken: 0, dealt: 0 }, reason: null };
    const starts = [];
    let tiles = '';
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      let c = def.map[y][x];
      if (c === 'p') { starts.push([x, y]); c = '.'; }
      if (c === 'S') { b.seedling = { x, y, hp: CONFIG.SEED_HP, maxHp: CONFIG.SEED_HP }; c = '.'; }
      if (!TERRAIN[c]) c = '.';
      tiles += c;
    }
    b.tiles = tiles;
    band.forEach((m, i) => {
      const st = starts[i] || starts[starts.length - 1];
      makeUnit(b, m.type, st[0], st[1], { captain: !!m.captain, name: m.name || UNIT_TYPES[m.type].name, vetId: m.vetId == null ? null : m.vetId,
        xp: m.xp || 0, level: m.level || 1, perks: (m.perks || []).slice() });
      const u = b.units[b.units.length - 1];
      if (m.wound > 0) u.hp = Math.max(1, u.maxHp - m.wound);
    });
    for (const [t, x, y] of def.foes) makeUnit(b, t, x, y);
    planEnemies(b, []);
    telegraphSpawns(b);
    return b;
  }

  // ===== daily skirmish map generator =====
  function dailyDef(seed) {
    const st = { rng: seed >>> 0 || 7 };
    for (let tries = 0; tries < 40; tries++) {
      const map = [];
      for (let y = 0; y < 8; y++) {
        let row = '';
        for (let x = 0; x < 6; x++) {
          if (y === 7) { row += (x >= 1 && x <= 4) ? 'p' : '.'; continue; }
          if (y === 6) { row += '.'; continue; }
          const r = rngNext(st);
          row += r < 0.1 ? '#' : r < 0.25 ? 'g' : r < 0.32 ? 's' : r < 0.37 ? 'm' : r < 0.41 ? 'b' : '.';
        }
        map.push(row);
      }
      const types = ['grub', 'grub', 'gnat', 'spitter', 'shell', 'grub'];
      const foesL = [];
      const nFoes = 5 + rngInt(st, 2);
      const used = new Set();
      for (let i = 0; i < nFoes; i++) {
        let x, y, g = 0;
        do { x = rngInt(st, 6); y = rngInt(st, 3); g++; } while ((map[y][x] === '#' || used.has(x + ',' + y)) && g < 50);
        used.add(x + ',' + y);
        foesL.push([types[rngInt(st, types.length)], x, y]);
      }
      const def = { key: 'daily', name: 'Daily Skirmish', obj: { kind: 'rout', limit: 8, par: 6 }, shade: { row: rngInt(st, 3), h: 2, dir: 1 },
        intro: 'A fresh patch of meadow, the same for everyone today.', tip: 'Rout every foe within 8 rounds.', map, foes: foesL };
      if (dailyValid(def)) return def;
    }
    return clone(BATTLES[1]);
  }
  function dailyValid(def) {
    // every foe tile connected to the start row through passable terrain
    const rows = def.map.length, cols = def.map[0].length;
    const seen = new Set(['1,7']);
    const q = [[1, 7]];
    while (q.length) {
      const [x, y] = q.pop();
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || seen.has(k) || def.map[ny][nx] === '#') continue;
        seen.add(k); q.push([nx, ny]);
      }
    }
    return def.foes.every(([, x, y]) => seen.has(x + ',' + y));
  }
  function dailyBand(seed) {
    const st = { rng: (seed ^ 0x9e3779b9) >>> 0 };
    const perks = PERK_ORDER.slice();
    const p1 = perks.splice(rngInt(st, perks.length), 1)[0];
    const p2 = perks.splice(rngInt(st, perks.length), 1)[0];
    const pool = ['duelist', 'bomber', 'mender', 'scout'];
    const band = [{ type: 'warden', captain: true, name: 'Oakhorn', level: 3, xp: CONFIG.CAPTAIN_XP[2], perks: [p1, p2] }];
    for (let i = 0; i < 3; i++) band.push({ type: pool[rngInt(st, pool.length)], level: 2, xp: CONFIG.VET_XP[1], name: NAMES[rngInt(st, NAMES.length)] });
    return band;
  }

  // ===== campaign =====
  // oath = the Thorn Oath: tougher Rot and less resolve, unlocked by winning once
  function newCampaign(seed, oath) {
    return { v: SAVE_V, seed: seed >>> 0, rng: seed >>> 0, battle: 0, captain: { xp: 0, level: 1, perks: [] }, barracks: [], nextVet: 1,
      unlocked: START_UNLOCKS.slice(), stars: [], rounds: [], resolve: oath ? CONFIG.OATH_RESOLVE : CONFIG.RESOLVE, losses: 0, fallenTotal: 0, done: null, log: [], oath: !!oath };
  }
  function recruitName(c) { return NAMES[rngInt(c, NAMES.length)]; }
  function pendingPerks(c) { return Math.max(0, (c.captain.level - 1) - c.captain.perks.length); }
  function perkOffer(c) {
    const left = PERK_ORDER.filter(p => !c.captain.perks.includes(p));
    if (left.length <= 2) return left;
    // deterministic offer from campaign seed + level so reload cannot reroll
    const st = { rng: (c.seed ^ (c.captain.perks.length * 2654435761)) >>> 0 };
    const a = left.splice(rngInt(st, left.length), 1)[0];
    const bb = left.splice(rngInt(st, left.length), 1)[0];
    return [a, bb];
  }
  function choosePerk(c, perk) {
    if (pendingPerks(c) <= 0) return false;
    if (!perkOffer(c).includes(perk)) return false;
    c.captain.perks.push(perk); return true;
  }
  // picks: [{vetId}|{type}] exactly 3
  function bandFor(c, picks) {
    const band = [{ type: 'warden', captain: true, name: 'Oakhorn', xp: c.captain.xp, level: c.captain.level, perks: c.captain.perks.slice() }];
    for (const p of picks) {
      if (p.vetId != null) { const v = c.barracks.find(x => x.vetId === p.vetId); if (v) band.push({ type: v.type, vetId: v.vetId, name: v.name, xp: v.xp, level: v.level, wound: v.wound || 0 }); }
      else if (c.unlocked.includes(p.type)) band.push({ type: p.type, vetId: null, name: p.name || UNIT_TYPES[p.type].name, xp: 0, level: 1 });
    }
    return band;
  }
  function validPicks(c, picks) {
    if (!Array.isArray(picks) || picks.length !== 3) return false;
    const ids = picks.filter(p => p.vetId != null).map(p => p.vetId);
    if (new Set(ids).size !== ids.length) return false;
    return picks.every(p => p.vetId != null ? c.barracks.some(v => v.vetId === p.vetId) : c.unlocked.includes(p.type));
  }
  // Apply a finished battle to the campaign exactly once. Returns a debrief record.
  function settleBattle(c, b) {
    if (c.settledSeed === b.seed && c.lastDebrief) return c.lastDebrief;
    const def = BATTLES[c.battle];
    const deb = { idx: c.battle, name: def.name, result: b.phase, reason: b.reason, round: b.round, stars: 0, why: [], gained: [], fallen: b.fallen.slice(), unlock: null, levelsBefore: c.captain.level };
    if (b.phase === 'won') {
      const lost = b.fallen.length;
      deb.stars = 1; deb.why.push('Victory');
      if (lost === 0) { deb.stars++; deb.why.push('No one fell'); }
      const par = def.obj.par;
      const k = def.obj.kind;
      const clean = k === 'hold' ? b.gate >= CONFIG.GATE_HP : k === 'protect' ? (b.seedling && b.seedling.hp >= b.seedling.maxHp - 1) : b.round <= par;
      if (clean) { deb.stars++; deb.why.push(k === 'hold' ? 'The gate held untouched' : k === 'protect' ? 'Seedling barely scratched' : 'Won by round ' + par); }
      c.stars[c.battle] = Math.max(c.stars[c.battle] || 0, deb.stars);
      c.rounds[c.battle] = b.round;
      // persist survivors
      const cap = b.units.find(u => u.captain);
      if (cap) { c.captain.xp = cap.xp; c.captain.level = cap.level; deb.gained.push({ name: 'Oakhorn', type: 'warden', xp: cap.gained || 0, level: cap.level }); }
      for (const f of b.fallen) if (f.vetId != null) c.barracks = c.barracks.filter(v => v.vetId !== f.vetId);
      restCamp(c, b);
      for (const u of b.units) {
        if (u.side !== 'p' || u.captain) continue;
        const wound = Math.max(0, u.maxHp - u.hp - CONFIG.CAMP_HEAL);
        if (u.vetId != null) { const v = c.barracks.find(x => x.vetId === u.vetId); if (v) { v.xp = u.xp; v.level = u.level; v.battles = (v.battles || 0) + 1; v.wound = wound; } }
        else { c.barracks.push({ vetId: c.nextVet++, type: u.type, name: u.name, xp: u.xp, level: u.level, battles: 1, wound }); }
        deb.gained.push({ name: u.name, type: u.type, xp: u.gained || 0, level: u.level });
      }
      c.barracks.sort((a, z) => z.xp - a.xp);
      if (c.barracks.length > CONFIG.BARRACKS_CAP) c.barracks.length = CONFIG.BARRACKS_CAP;
      c.fallenTotal += b.fallen.length;
      if (def.unlock && !c.unlocked.includes(def.unlock)) { c.unlocked.push(def.unlock); deb.unlock = def.unlock; }
      c.battle++;
      if (c.battle >= BATTLES.length) c.done = 'won';
    } else {
      // the fallen stay fallen, even in defeat; everyone else limps home
      for (const f of b.fallen) if (f.vetId != null) c.barracks = c.barracks.filter(v => v.vetId !== f.vetId);
      c.fallenTotal += b.fallen.filter(f => f.vetId != null).length;
      restCamp(c, b);
      for (const u of b.units) if (u.side === 'p' && u.vetId != null) { const v = c.barracks.find(x => x.vetId === u.vetId); if (v) v.wound = Math.max(0, u.maxHp - u.hp - CONFIG.CAMP_HEAL); }
      c.losses++; c.resolve--;
      if (c.resolve <= 0) c.done = 'lost';
    }
    c.log.push({ b: deb.idx, r: deb.result, rd: deb.round, st: deb.stars });
    c.settledSeed = b.seed;
    c.lastDebrief = deb;
    return deb;
  }
  // veterans who sat this battle out rest fully
  function restCamp(c, b) {
    const fought = new Set(b.units.concat(b.fallen).filter(u => u.vetId != null).map(u => u.vetId));
    for (const v of c.barracks) if (!fought.has(v.vetId)) v.wound = 0;
  }
  function vetMaxHp(v) { const u = { type: v.type, side: 'p', level: v.level, perks: [], captain: false }; applyStats(u); return u.maxHp; }
  function campaignScore(c) { return c.stars.reduce((a, s) => a + (s || 0), 0); }
  function battleSeed(c) { return (hashStr('tm' + c.seed + ':' + c.battle + ':' + c.losses)) >>> 0; }

  // ===== save validation =====
  function num(v, lo, hi) { return typeof v === 'number' && isFinite(v) && v >= lo && v <= hi; }
  function validBattle(b) {
    try {
      if (!b || b.v !== SAVE_V || b.rv !== RULES_V) return false;
      if (!num(b.cols, 4, 12) || !num(b.rows, 4, 14)) return false;
      if (typeof b.tiles !== 'string' || b.tiles.length !== b.cols * b.rows) return false;
      if (!Array.isArray(b.units) || b.units.length > 60) return false;
      if (!['player', 'won', 'lost'].includes(b.phase)) return false;
      if (!b.obj || typeof b.obj.kind !== 'string') return false;
      const seen = new Set(), ids = new Set();
      for (const u of b.units) {
        if (!u || !UNIT_TYPES[u.type] || !num(u.x, 0, b.cols - 1) || !num(u.y, 0, b.rows - 1) || !num(u.hp, 1, 99) || !num(u.maxHp, 1, 99)) return false;
        if (ids.has(u.id)) return false; ids.add(u.id);
        const k = u.x + ',' + u.y; if (seen.has(k)) return false; seen.add(k);
      }
      if (!num(b.round, 1, 99) || !num(b.rng, 0, 4294967295)) return false;
      return true;
    } catch (e) { return false; }
  }
  function validCampaign(c) {
    try {
      if (!c || c.v !== SAVE_V) return false;
      if (!num(c.battle, 0, BATTLES.length) || !c.captain || !num(c.captain.level, 1, CONFIG.CAPTAIN_MAX)) return false;
      if (!Array.isArray(c.barracks) || !Array.isArray(c.unlocked) || !Array.isArray(c.stars)) return false;
      if (!c.unlocked.every(t => UNIT_TYPES[t])) return false;
      if (!c.barracks.every(v => v && UNIT_TYPES[v.type] && num(v.level, 1, CONFIG.VET_MAX) && (v.wound == null || num(v.wound, 0, 20)))) return false;
      if (!c.captain.perks.every(p => CAPTAIN_PERKS[p])) return false;
      if (!num(c.resolve, 0, 9)) return false;
      if (c.oath != null && typeof c.oath !== 'boolean') return false;
      return true;
    } catch (e) { return false; }
  }

  return { vetMaxHp, SAVE_V, RULES_V, CONFIG, TERRAIN, UNIT_TYPES, CAPTAIN_PERKS, PERK_ORDER, VET_PERK3, BATTLES, NAMES,
    rngNext, rngInt, hashStr, clone, dist, inB, terr, code, unitAt, getUnit, isSeed, inShade, nextShadeRows, shadeRowsAt,
    reachable, tilesInReach, inReach, rmaxAt, calcDamage, actTargets, forecast, resolveIntent, predictAll, applyCommand, createBattle,
    captainOf, players, foes, dailyDef, dailyBand, newCampaign, recruitName, pendingPerks, perkOffer, choosePerk, bandFor, validPicks,
    settleBattle, campaignScore, battleSeed, validBattle, validCampaign };
})();
if (typeof module !== 'undefined') module.exports = Core;
/*CORE-END*/
