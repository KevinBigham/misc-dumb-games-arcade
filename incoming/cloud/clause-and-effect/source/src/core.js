/* ================= CONFIG ================= */
const CONFIG = {
  VERSION: 1,
  SAVE_KEY: 'clause-effect-save-v1',
  MAX_TICKS: 60,          // default patience per run
  TICK_MS: 260,           // animation time per tick at 1x
  FAST_MULT: 3,           // speed multiplier on fast mode
  CELL_MAX: 54,           // largest cell size in px
  REPEAT_COUNTS: [2, 3, 4, 5, 6, 8],
};

/* ================= DATA ================= */
const DIRS = { north: [0, -1], east: [1, 0], south: [0, 1], west: [-1, 0] };
const DIR_ORDER = ['north', 'east', 'south', 'west'];

// Commands the routine can hold. Action commands take one tick.
const COMMANDS = {
  step:   { label: 'step',        about: 'Move forward one stride.' },
  left:   { label: 'turn left',   about: 'Turn 90° to the left.' },
  right:  { label: 'turn right',  about: 'Turn 90° to the right.' },
  around: { label: 'turn around', about: 'Face the other way.' },
  wait:   { label: 'wait',        about: 'Do nothing for one tick.' },
  repeat: { label: 'repeat',      about: 'Do one action several ticks in a row.' },
  if:     { label: 'if',          about: 'Look one tile ahead, then pick one of two actions.' },
};
const ACTIONS = ['step', 'left', 'right', 'around', 'wait'];

const SENSES = {
  wall:  { label: 'wall ahead',  about: 'A filing wall is right in front.' },
  open:  { label: 'path ahead',  about: 'Pip could step forward without bumping.' },
  ink:   { label: 'ink ahead',   about: 'An ink spill is right in front.' },
  guard: { label: 'guard ahead', about: 'A guard is right in front.' },
  key:   { label: 'holding key', about: 'Pip is carrying the brass key.' },
};

// World clauses. Each has a sentence template with one slot.
const CLAUSES = {
  walls:  { pre: 'Walls are',              post: '.',                opts: { solid: 'solid', soft: 'soft' } },
  hatch:  { pre: 'The hatch',              post: '.',                opts: { fixed: 'stays put', follows: 'follows Pip' } },
  door:   { pre: 'The door opens',         post: '.',                opts: { key: 'with the key', anyone: 'for anyone' } },
  guards: { pre: 'Guards are',             post: '.',                opts: { alert: 'alert', asleep: 'asleep' } },
  ink:    { pre: 'Ink is',                 post: '.',                opts: { deadly: 'wet (it smudges Pip)', dry: 'dry' } },
  spare:  { pre: 'A spare hatch appears',  post: '.',                opts: { none: 'nowhere', under: 'under Pip' } },
  winOn:  { pre: 'Pip escapes by touching', post: '.',               opts: { hatch: 'the hatch', wall: 'any wall' } },
  stride: { pre: "Pip's stride is",        post: '.',                opts: { 1: '1 tile', 2: '2 tiles (a hop)' } },
  pace:   { pre: 'Guards move every',      post: '.',                opts: { 1: 'tick', 2: '2nd tick', 3: '3rd tick' } },
};
const CLAUSE_DEFAULTS = { walls: 'solid', hatch: 'fixed', door: 'key', guards: 'alert', ink: 'deadly', spare: 'none', winOn: 'hatch', stride: '1', pace: '1' };

// The Auditor's seals. "lock" seals freeze a clause; "run" seals inspect the run afterwards.
const SEALS = {
  walls:    { text: 'Walls stay solid.',                         lock: ['walls', 'solid'] },
  noCross:  { text: 'Pip may not pass through or hop over walls or locked doors.', run: t => !t.crossedWall },
  hatchFix: { text: 'The hatch must not move.',                  run: t => !t.hatchMoved },
  keyEsc:   { text: 'Pip must hold the key when escaping.',      run: t => t.hadKeyAtEnd || !t.levelHadKey },
  guards:   { text: 'Guards stay alert.',                        lock: ['guards', 'alert'] },
  oneHatch: { text: 'There is exactly one hatch.',               run: t => t.maxHatches <= 1 },
  hatchOnly:{ text: 'Escapes go through the hatch.',             lock: ['winOn', 'hatch'] },
  noInk:    { text: 'Pip may not touch ink, wet or dry.',        run: t => !t.touchedInk },
  door:     { text: 'The door opens with the key.',              lock: ['door', 'key'] },
  pen:      { text: 'The Pen holds ink for 2 strokes.',          static: (lv, led) => strokes(lv, led) <= 2 },
};

/* ================= LEVELS (content as data) =================
 Map legend: # wall  . floor  p Pip  H hatch  k key  D door  ~ ink  G guard(see guards[])
*/
const LEVELS = [
  {
    id: 'facing', name: 'Facing Facts',
    memo: 'Pip is an ink blot who wants out of the Registry. Pip does exactly what the ledger says. Tap the glowing word to change which way Pip starts.',
    remark: 'A clerk who reads the ledger. Acceptable.',
    hints: ['The hatch is to the east.', 'Set "Pip starts facing" to east, then Run.'],
    map: ['#######', '#.....#', '#p...H#', '#.....#', '#######'],
    face: { v: 'north' },
    routine: [{ cmd: 'step', lock: true }],
    palette: [], clauses: [], seals: [],
    sol: { face: 'east' },
  },
  {
    id: 'soft', name: 'Soft Paperwork',
    memo: 'A filing wall blocks the way. But the ledger also describes the world, and some of it is not sealed yet.',
    remark: 'Walls that are not walls. Irregular. I am sealing that clause.',
    hints: ['Look at the World section.', 'Make walls soft.'],
    map: ['#######', '#..#..#', '#p.#.H#', '#..#..#', '#######'],
    face: { v: 'east', lock: true },
    routine: [{ cmd: 'step', lock: true }],
    palette: [], clauses: [{ key: 'walls', v: 'solid' }], seals: [],
    sol: { clauses: { walls: 'soft' } },
  },
  {
    id: 'stairs', name: 'Stairwell Clause',
    memo: 'Sealed: walls stay solid. Write a routine instead. Pip reads one line per tick, top to bottom, then starts over.',
    remark: 'Four lines, a hundred steps. Loops are permitted. For now.',
    hints: ['The stairs go step, turn, step, turn.', 'step, turn right, step, turn left.'],
    map: ['#######', '#p.####', '##..###', '###..##', '####.H#', '#######'],
    face: { v: 'east', lock: true },
    routine: [{}, {}, {}, {}],
    palette: ['step', 'left', 'right', 'around', 'wait'],
    clauses: [{ key: 'walls', v: 'solid' }], seals: ['walls'],
    sol: { routine: ['step', 'right', 'step', 'left'] },
  },
  {
    id: 'follow', name: 'Come Here, Hatch',
    memo: 'This corridor twists too much for two lines. Who says Pip has to do the walking?',
    remark: 'The hatch came to you. Hatches do not do that. Sealing.',
    hints: ['Read the hatch clause.', 'Set the hatch to follow Pip. You can leave the routine empty.'],
    map: ['#######', '#p#...#', '#.#.#.#', '#...#H#', '#######'],
    face: { v: 'south', lock: true },
    routine: [{}, {}],
    palette: ['step', 'left', 'right', 'wait'],
    clauses: [{ key: 'walls', v: 'solid' }, { key: 'hatch', v: 'fixed' }], seals: ['walls'],
    sol: { clauses: { hatch: 'follows' }, routine: ['step'] },
  },
  {
    id: 'spiral', name: 'Bolted Down',
    memo: 'New seal: the hatch must not move. You can still edit the clause, but I will check. Pip can look before stepping now.',
    remark: 'One line that thinks. Good. Thinking is allowed. Bending is not.',
    hints: ['Use one "if" line.', 'if wall ahead → turn right, otherwise → step.'],
    map: ['#######', '#p....#', '#####.#', '#..H#.#', '#.###.#', '#.....#', '#######'],
    face: { v: 'east', lock: true },
    routine: [{}],
    palette: ['step', 'left', 'right', 'if'], senses: ['wall', 'open'],
    clauses: [{ key: 'walls', v: 'solid' }, { key: 'hatch', v: 'fixed' }], seals: ['walls', 'hatchFix'],
    sol: { routine: [{ cmd: 'if', sense: 'wall', then: 'right', else: 'step' }] },
  },
  {
    id: 'door', name: 'Anyone May Enter',
    memo: 'The key is boxed in. The door wants the key. Or does it?',
    remark: 'A door that opens for anyone is a hole with hinges. Sealed.',
    hints: ['Read the door clause.', 'Let the door open for anyone.'],
    map: ['#######', '#~~~~~#', '#~#k#~#', '#p.D.H#', '#######'],
    face: { v: 'east', lock: true },
    routine: [{ cmd: 'step', lock: true }],
    palette: [],
    clauses: [{ key: 'walls', v: 'solid' }, { key: 'hatch', v: 'fixed' }, { key: 'door', v: 'key' }, { key: 'ink', v: 'deadly', lock: true }],
    seals: ['walls', 'hatchFix'],
    sol: { clauses: { door: 'anyone' } },
  },
  {
    id: 'keyholder', name: 'Keyholder',
    memo: 'New seal: Pip must hold the key when escaping. "repeat" does one action several ticks in a row.',
    remark: 'Out, back, through. Proper procedure at last.',
    hints: ['Go east to the key, turn around, then walk west all the way.', 'repeat 3 × step, turn around, repeat 6 × step.'],
    map: ['#########', '#HD.p..k#', '#########'],
    face: { v: 'east', lock: true },
    routine: [{}, {}, {}],
    palette: ['step', 'left', 'right', 'around', 'wait', 'repeat'],
    clauses: [{ key: 'walls', v: 'solid' }, { key: 'door', v: 'key' }], seals: ['walls', 'hatchFix', 'keyEsc'],
    sol: { routine: [{ cmd: 'repeat', n: 3, act: 'step' }, 'around', { cmd: 'repeat', n: 6, act: 'step' }] },
  },
  {
    id: 'nap', name: 'Nap Time',
    memo: 'A guard patrols the only corridor. Guards catch Pip if they meet on the same tile.',
    remark: 'You put my guard to sleep. In writing. Sealed.',
    hints: ['Read the guard clause.', 'Guards are asleep.'],
    map: ['#########', '#p.....H#', '#########'],
    guards: [{ x: 4, y: 1, dir: 'west' }],
    face: { v: 'east', lock: true },
    routine: [{ cmd: 'step', lock: true }],
    palette: [],
    clauses: [{ key: 'walls', v: 'solid' }, { key: 'guards', v: 'alert' }], seals: ['walls', 'hatchFix', 'keyEsc'],
    sol: { clauses: { guards: 'asleep' } },
  },
  {
    id: 'shift', name: 'Night Shift',
    memo: 'Sealed: guards stay alert. This one walks north and south across your hall. Watch its rhythm, then time your crossing.',
    remark: 'Patience. A rare quality in an ink blot.',
    hints: ['The guard reaches your hall every 4 ticks.', 'Try step, wait. Or step, step, wait.'],
    map: ['#########', '####.####', '####.####', '#p.....H#', '####.####', '####.####', '#########'],
    guards: [{ x: 4, y: 2, dir: 'north' }],
    face: { v: 'east', lock: true },
    routine: [{}, {}],
    palette: ['step', 'wait'],
    clauses: [{ key: 'walls', v: 'solid' }, { key: 'guards', v: 'alert' }], seals: ['walls', 'guards', 'hatchFix'],
    sol: { routine: ['step', 'wait'] },
  },
  {
    id: 'vault', name: 'Hatch on Demand',
    memo: 'The hatch sits inside a sealed vault. Every seal I own is on this page. Read the World section closely.',
    remark: 'You PRINTED a hatch. Forgery. Sealed, stamped, and filed.',
    hints: ['None of the seals mention spare hatches.', 'A spare hatch appears under Pip.'],
    map: ['#######', '#p....#', '#.###.#', '#.#H#.#', '#.###.#', '#.....#', '#######'],
    face: { v: 'east', lock: true },
    routine: [{ cmd: 'if', sense: 'wall', then: 'right', else: 'step', lock: true }],
    palette: [],
    clauses: [{ key: 'walls', v: 'solid' }, { key: 'hatch', v: 'fixed' }, { key: 'spare', v: 'none' }],
    seals: ['walls', 'hatchFix', 'noCross'],
    sol: { clauses: { spare: 'under' } },
  },
  {
    id: 'marsh', name: 'Ink Marsh',
    memo: 'New seal: exactly one hatch. The path is lined with wet ink, not walls. Pip can sense more than walls.',
    remark: 'You read the ink instead of the walls. Very literate.',
    hints: ['Walls never block this path. Ink does.', 'if ink ahead → turn left, otherwise → step.'],
    map: ['#########', '#~~~~~~~#', '#~~~~~~~#', '#~~...~~#', '#~~.~.~~#', '#~~H~.~~#', '#~~~~.~~#', '#p....~~#', '#########'],
    face: { v: 'east', lock: true },
    routine: [{}],
    palette: ['step', 'left', 'right', 'if'], senses: ['wall', 'open', 'ink'],
    clauses: [{ key: 'walls', v: 'solid' }, { key: 'ink', v: 'deadly' }, { key: 'spare', v: 'none' }],
    seals: ['walls', 'hatchFix', 'oneHatch', 'noInk'],
    sol: { routine: [{ cmd: 'if', sense: 'ink', then: 'left', else: 'step' }] },
  },
  {
    id: 'touch', name: 'Fine Print',
    memo: 'Guards everywhere, ink everywhere, and the hatch far away. Read what escaping actually means.',
    remark: 'Escaping by touching a WALL. I will be rewriting that sentence myself.',
    hints: ['Read the last clause. Then look at what is right next to Pip.', 'Pip escapes by touching any wall, and Pip starts facing west.'],
    map: ['#########', '#~~~~~~~#', '#~G~G~G~#', '#p~~~~~H#', '#########'],
    guards: [{ x: 2, y: 2, dir: 'south' }, { x: 4, y: 2, dir: 'north' }, { x: 6, y: 2, dir: 'south' }],
    face: { v: 'east' },
    routine: [{ cmd: 'step', lock: true }],
    palette: [],
    clauses: [{ key: 'walls', v: 'solid' }, { key: 'ink', v: 'deadly' }, { key: 'winOn', v: 'hatch' }],
    seals: ['walls', 'guards', 'hatchFix', 'oneHatch', 'noInk'],
    sol: { face: 'west', clauses: { winOn: 'wall' } },
  },
  {
    id: 'hop', name: 'Long Stride',
    memo: 'Sealed: escapes go through the hatch. Not every clause is a cheat. Some are just tools, if they pass every seal.',
    remark: 'You changed a rule and broke no seal. Annoyingly legal.',
    hints: ['A 2-tile stride hops over the tile in between.', "Set Pip's stride to 2 tiles, then hop the ink and turn at the walls."],
    map: ['#########', '#p~.~.~.#', '#######~#', '#.~.~H#.#', '#~#####~#', '#.~.~.~.#', '#########'],
    face: { v: 'east', lock: true },
    routine: [{}, {}],
    palette: ['step', 'left', 'right', 'around', 'wait', 'if'], senses: ['wall', 'open', 'ink'],
    clauses: [{ key: 'walls', v: 'solid' }, { key: 'ink', v: 'deadly' }, { key: 'stride', v: '1' }],
    seals: ['walls', 'noCross', 'hatchFix', 'oneHatch', 'hatchOnly', 'noInk'],
    sol: { clauses: { stride: '2' }, routine: [{ cmd: 'if', sense: 'wall', then: 'right', else: 'step' }] },
  },
  {
    id: 'pen', name: "The Auditor's Pen",
    memo: 'The Auditor keeps a Pen in the far office. Take it to the hatch. Every seal is in force. Everything you learned is allowed.',
    remark: 'Put. The Pen. Down.',
    hints: [],
    map: ['###########', '#####.#.###', '#####.#.###', '#HDp~.~.~k#', '#####.#.###', '#####.#.###', '###########'],
    guards: [{ x: 5, y: 1, dir: 'south' }, { x: 7, y: 1, dir: 'north' }],
    keyLook: 'pen',
    face: { v: 'west' },
    routine: [{}, {}, {}],
    palette: ['step', 'left', 'right', 'around', 'wait', 'repeat', 'if'], senses: ['wall', 'open', 'ink', 'guard', 'key'],
    clauses: [{ key: 'walls', v: 'solid' }, { key: 'door', v: 'key' }, { key: 'stride', v: '1' }, { key: 'pace', v: '1' }],
    seals: ['walls', 'noCross', 'hatchFix', 'keyEsc', 'guards', 'oneHatch', 'hatchOnly', 'noInk'],
    sol: { face: 'east', clauses: { stride: '2', pace: '2' }, routine: [{ cmd: 'repeat', n: 4, act: 'step' }, 'around', { cmd: 'repeat', n: 3, act: 'step' }] },
  },
  {
    id: 'audit', name: 'Audit the Auditor',
    memo: 'Pip holds the Pen. The seals are just lines now. Strike a seal and rewrite a clause. The Pen has 2 strokes of ink.',
    remark: 'APPROVED. ...Wait. Who stamped that?',
    hints: ['Pick one old loophole. Strike the seal that blocks it, then change its clause.', 'Strike "exactly one hatch" and set a spare hatch under Pip.'],
    map: ['##########', '#........#', '#p######H#', '##########'],
    guards: [{ x: 5, y: 1, dir: 'west' }],
    face: { v: 'north', lock: true },
    routine: [{ cmd: 'step' }, {}, {}],
    palette: ['step', 'left', 'right', 'around', 'wait', 'repeat', 'if'], senses: ['wall', 'open', 'ink', 'guard', 'key'],
    clauses: [{ key: 'walls', v: 'solid' }, { key: 'hatch', v: 'fixed' }, { key: 'spare', v: 'none' }, { key: 'winOn', v: 'hatch' }, { key: 'guards', v: 'alert' }],
    seals: ['walls', 'hatchFix', 'oneHatch', 'hatchOnly', 'guards', 'pen'],
    strikable: true,
    sol: { clauses: { spare: 'under' }, struck: { oneHatch: true } },
  },
];

/* ================= RULES (pure) ================= */
// Apply a reference solution (data) to a fresh ledger. Used for par and for tests.
function applySol(level, sol) {
  const led = freshLedger(level);
  if (sol.face) led.face = sol.face;
  if (sol.clauses) Object.assign(led.clauses, sol.clauses);
  if (sol.struck) Object.assign(led.struck, sol.struck);
  if (sol.routine) sol.routine.forEach((r, i) => { Object.assign(led.routine[i], typeof r === 'string' ? { cmd: r } : r); });
  return led;
}

function parseMap(level) {
  const rows = level.map;
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const tiles = [], hatches = [], keys = [];
  let pip = null;
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      const c = rows[y][x] || '#';
      if (c === 'p') { pip = { x, y }; row.push('.'); }
      else if (c === 'H') { hatches.push({ x, y }); row.push('.'); }
      else if (c === 'k') { keys.push({ x, y }); row.push('.'); }
      else if (c === 'G') row.push('.');
      else row.push(c);
    }
    tiles.push(row);
  }
  return { w, h, tiles, pip, hatches, keys };
}

// Build an editable ledger from level data (deep copy so edits never touch DATA).
function freshLedger(level) {
  return {
    face: level.face.v,
    routine: level.routine.map(l => ({ cmd: l.cmd || null, n: l.n || 3, act: l.act || 'step', sense: l.sense || (level.senses ? level.senses[0] : 'wall'), then: l.then || 'right', else: l.else || 'step' })),
    clauses: Object.fromEntries(level.clauses.map(c => [c.key, c.v])),
    struck: {},
  };
}

// Effective rule values: defaults, then the ledger's clauses, then seals that lock.
function resolveRules(level, ledger) {
  const r = Object.assign({}, CLAUSE_DEFAULTS, ledger.clauses);
  for (const s of level.seals) {
    if (ledger.struck[s]) continue;
    const seal = SEALS[s];
    if (seal.lock && !level.strikable) r[seal.lock[0]] = seal.lock[1];
  }
  return r;
}

// Which ledger slots count as Pen strokes in the finale: struck seals + changed clauses.
function strokes(level, ledger) {
  let n = Object.keys(ledger.struck).filter(k => ledger.struck[k]).length;
  for (const c of level.clauses) if (ledger.clauses[c.key] !== c.v) n++;
  return n;
}

function isLocked(level, kind, key) {
  // kind: 'clause' → a clause locked by data or by a lock seal (non-strikable levels)
  if (kind === 'clause') {
    const c = level.clauses.find(c => c.key === key);
    if (c && c.lock) return true;
    if (!level.strikable) for (const s of level.seals) if (SEALS[s].lock && SEALS[s].lock[0] === key) return true;
    return false;
  }
  return false;
}

function usedLines(ledger) { return ledger.routine.filter(l => l.cmd).length; }

function newSim(level, ledger) {
  const m = parseMap(level);
  return {
    w: m.w, h: m.h, tiles: m.tiles,
    pip: { x: m.pip.x, y: m.pip.y, dir: ledger.face, pc: 0, rep: 0, key: false },
    hatches: m.hatches.map(h => ({ ...h })), keys: m.keys.map(k => ({ ...k })),
    guards: (level.guards || []).map(g => ({ x: g.x, y: g.y, dir: g.dir })),
    tick: 0, status: 'run', reason: '',
    trace: { crossedWall: false, hatchMoved: false, hadKeyAtEnd: false, maxHatches: m.hatches.length, touchedInk: false, levelHadKey: m.keys.length > 0 },
    events: [],
  };
}

function inB(s, x, y) { return x >= 0 && y >= 0 && x < s.w && y < s.h; }
function tileAt(s, x, y) { return inB(s, x, y) ? s.tiles[y][x] : '#'; }
function doorOpen(s, rules) { return rules.door === 'anyone' || s.pip.key; }
function solidForPip(s, rules, x, y) {
  if (!inB(s, x, y)) return true;
  const t = s.tiles[y][x];
  if (t === '#') return rules.walls === 'solid' || x === 0 || y === 0 || x === s.w - 1 || y === s.h - 1;
  if (t === 'D') return !doorOpen(s, rules);
  return false;
}
function solidForGuard(s, rules, x, y, self) {
  if (!inB(s, x, y)) return true;
  const t = s.tiles[y][x];
  if (t === '#') return true;
  if (t === 'D') return !doorOpen(s, rules);
  return s.guards.some(g => g !== self && g.x === x && g.y === y);
}
function turn(dir, how) {
  const i = DIR_ORDER.indexOf(dir);
  if (how === 'left') return DIR_ORDER[(i + 3) % 4];
  if (how === 'right') return DIR_ORDER[(i + 1) % 4];
  if (how === 'around') return DIR_ORDER[(i + 2) % 4];
  return dir;
}
function ahead(s) { const d = DIRS[s.pip.dir]; return { x: s.pip.x + d[0], y: s.pip.y + d[1] }; }
function sense(s, rules, what) {
  const a = ahead(s);
  switch (what) {
    case 'wall': return tileAt(s, a.x, a.y) === '#';
    case 'open': return !solidForPip(s, rules, a.x, a.y);
    case 'ink': return tileAt(s, a.x, a.y) === '~';
    case 'guard': return s.guards.some(g => g.x === a.x && g.y === a.y);
    case 'key': return s.pip.key;
  }
  return false;
}

// Do one action; returns event name.
function doAction(s, rules, act, ev) {
  const p = s.pip;
  if (act === 'step') {
    const d = DIRS[p.dir], st = Number(rules.stride) || 1;
    const mx = p.x + d[0], my = p.y + d[1];
    const tx = p.x + d[0] * st, ty = p.y + d[1] * st;
    // A hop (stride 2) flies over the middle tile; it fails if the middle is off the map.
    let bx = null, by = null;
    if (st === 2 && !inB(s, mx, my)) { bx = mx; by = my; }
    else if (solidForPip(s, rules, tx, ty)) { bx = tx; by = ty; if (st === 2 && solidForPip(s, rules, mx, my)) { bx = mx; by = my; } }
    if (bx !== null) {
      ev.bump = { x: bx, y: by };
      if (tileAt(s, bx, by) === '#') ev.touchWall = true;
      return;
    }
    if (st === 2) {
      const mt = tileAt(s, mx, my);
      if (mt === '#' || (mt === 'D' && !doorOpen(s, rules))) s.trace.crossedWall = true;
    }
    ev.move = { fx: p.x, fy: p.y, hop: st === 2 };
    p.x = tx; p.y = ty;
    if (tileAt(s, p.x, p.y) === '#') { s.trace.crossedWall = true; ev.touchWall = true; }
  } else if (act === 'left' || act === 'right' || act === 'around') {
    p.dir = turn(p.dir, act); ev.turn = act;
  } else { ev.wait = true; }
}

function bfsStep(s, rules, from, to) {
  // One step from `from` toward `to` along tiles Pip could stand on (never through walls).
  const key = (x, y) => y * s.w + x, seen = new Map();
  const q = [[to.x, to.y]]; seen.set(key(to.x, to.y), null);
  while (q.length) {
    const [x, y] = q.shift();
    if (x === from.x && y === from.y) break;
    for (const d of DIR_ORDER) {
      const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
      if (!inB(s, nx, ny) || seen.has(key(nx, ny)) || tileAt(s, nx, ny) === '#') continue;
      if (tileAt(s, nx, ny) === 'D' && !doorOpen(s, rules)) continue;
      seen.set(key(nx, ny), [x, y]); q.push([nx, ny]);
    }
  }
  const prev = seen.get(key(from.x, from.y));
  return prev ? { x: prev[0], y: prev[1] } : null;
}

function onHatch(s) { return s.hatches.some(h => h.x === s.pip.x && h.y === s.pip.y); }

// Advance the simulation by one tick. Mutates and returns s (callers clone if needed).
function step(level, ledger, s) {
  if (s.status !== 'run') return s;
  const rules = resolveRules(level, ledger);
  const p = s.pip;
  s.tick++;
  const ev = { tick: s.tick };

  // Spare hatches are printed before Pip moves.
  if (rules.spare === 'under' && !onHatch(s)) { s.hatches.push({ x: p.x, y: p.y }); ev.spare = true; }
  s.trace.maxHatches = Math.max(s.trace.maxHatches, s.hatches.length);
  if (ev.spare && rules.winOn === 'hatch') { ev.line = -1; return finish(level, ledger, s, 'win', '', ev); }

  // Pip reads one routine line.
  const lines = ledger.routine.map((l, i) => ({ l, i })).filter(o => o.l.cmd);
  if (lines.length === 0) { ev.wait = true; ev.line = -1; }
  else {
    if (p.pc >= lines.length) p.pc = 0;
    const { l, i } = lines[p.pc];
    ev.line = i;
    let advance = true;
    if (l.cmd === 'repeat') {
      if (p.rep <= 0) p.rep = l.n;
      doAction(s, rules, l.act, ev);
      p.rep--; ev.rep = l.n - p.rep;
      if (p.rep > 0) advance = false;
    } else if (l.cmd === 'if') {
      const yes = sense(s, rules, l.sense); ev.branch = yes ? 'then' : 'else';
      doAction(s, rules, yes ? l.then : l.else, ev);
    } else doAction(s, rules, l.cmd, ev);
    if (advance) p.pc = (p.pc + 1) % lines.length;
  }

  // Pickups and hazards.
  const ki = s.keys.findIndex(k => k.x === p.x && k.y === p.y);
  if (ki >= 0) { s.keys.splice(ki, 1); p.key = true; ev.key = true; }
  const won = () => (rules.winOn === 'hatch' && onHatch(s)) || (rules.winOn === 'wall' && ev.touchWall);
  if (tileAt(s, p.x, p.y) === '~') {
    s.trace.touchedInk = true;
    if (rules.ink === 'deadly' && !won()) return finish(level, ledger, s, 'smudged', 'Pip stepped in wet ink and smudged.', ev);
  }
  if (won()) return finish(level, ledger, s, 'win', '', ev);

  // The hatch may wander toward Pip.
  if (rules.hatch === 'follows') {
    for (const h of s.hatches) {
      if (h.x === p.x && h.y === p.y) continue;
      const nx = bfsStep(s, rules, h, p);
      if (nx) { h.x = nx.x; h.y = nx.y; s.trace.hatchMoved = true; ev.hatchMove = true; }
    }
    if (rules.winOn === 'hatch' && onHatch(s)) return finish(level, ledger, s, 'win', '', ev);
  }

  // Guards patrol, then catch.
  if (rules.guards === 'alert' && s.guards.length) {
    const pace = Number(rules.pace) || 1;
    const before = s.guards.map(g => ({ x: g.x, y: g.y }));
    if (s.tick % pace === 0) {
      for (const g of s.guards) {
        let d = DIRS[g.dir];
        if (solidForGuard(s, rules, g.x + d[0], g.y + d[1], g)) { g.dir = turn(g.dir, 'around'); d = DIRS[g.dir]; }
        if (!solidForGuard(s, rules, g.x + d[0], g.y + d[1], g)) { g.x += d[0]; g.y += d[1]; }
      }
      ev.guardsMoved = true;
    }
    const pf = ev.move ? { x: ev.move.fx, y: ev.move.fy } : { x: p.x, y: p.y };
    for (let i = 0; i < s.guards.length; i++) {
      const g = s.guards[i], b = before[i];
      const same = g.x === p.x && g.y === p.y;
      const swap = b.x === p.x && b.y === p.y && g.x === pf.x && g.y === pf.y;
      if (same || swap) return finish(level, ledger, s, 'caught', 'A guard caught Pip.', ev);
    }
  }

  const max = level.maxTicks || CONFIG.MAX_TICKS;
  if (s.tick >= max) return finish(level, ledger, s, 'timeout', `Pip ran out of patience after ${max} ticks.`, ev);
  s.events.push(ev);
  return s;
}

function finish(level, ledger, s, status, reason, ev) {
  ev.end = status;
  s.events.push(ev);
  s.status = status; s.reason = reason;
  if (status === 'win') {
    s.trace.hadKeyAtEnd = s.pip.key;
    const broken = checkSeals(level, ledger, s.trace);
    if (broken) { s.status = 'void'; s.reason = broken; s.voidSeal = broken; }
  }
  return s;
}

function checkSeals(level, ledger, trace) {
  for (const id of level.seals) {
    if (ledger.struck[id]) continue;
    const seal = SEALS[id];
    if (seal.run && !seal.run(trace)) return seal.text;
    if (seal.static && !seal.static(level, ledger)) return seal.text;
    if (seal.lock && level.strikable && ledger.clauses[seal.lock[0]] !== undefined && ledger.clauses[seal.lock[0]] !== seal.lock[1]) return seal.text;
  }
  return null;
}

// Run to completion (used by tests and the star calculation).
function runAll(level, ledger) {
  const s = newSim(level, ledger);
  while (s.status === 'run') step(level, ledger, s);
  return s;
}

function computePars() {
  for (const lv of LEVELS) {
    const led = applySol(lv, lv.sol || {});
    const s = runAll(lv, led);
    lv.par = { ticks: s.tick, lines: usedLines(led), ok: s.status === 'win' };
  }
}

function starsFor(level, ledger, s) {
  if (s.status !== 'win') return 0;
  let st = 1;
  if (s.tick <= level.par.ticks) st++;
  if (usedLines(ledger) <= level.par.lines) st++;
  return st;
}

// Which loophole closed the finale? (for the ending collection)
function loopholeOf(level, ledger) {
  const r = resolveRules(level, ledger);
  if (r.spare === 'under' && ledger.struck.oneHatch) return 'forgery';
  if (r.winOn === 'wall' && ledger.struck.hatchOnly) return 'fineprint';
  if (r.hatch === 'follows' && ledger.struck.hatchFix) return 'summons';
  if (r.walls === 'soft' && ledger.struck.walls) return 'softwall';
  if (r.guards === 'asleep' && ledger.struck.guards) return 'nap';
  return 'other';
}
const ENDINGS = {
  forgery:   { name: 'The Forgery',   line: 'You printed a hatch with the Auditor\'s own Pen.' },
  fineprint: { name: 'The Fine Print', line: 'You touched a wall and called it a door.' },
  summons:   { name: 'The Summons',   line: 'You called the hatch, and it came.' },
  softwall:  { name: 'The Soft Wall', line: 'You walked out through the paperwork.' },
  nap:       { name: 'The Long Nap',  line: 'Everyone slept. You walked.' },
  other:     { name: 'The Unfiled',   line: 'You found a way nobody wrote down.' },
};

computePars();
if (typeof module !== 'undefined') module.exports = { applySol, computePars, CONFIG, DIRS, COMMANDS, ACTIONS, SENSES, CLAUSES, SEALS, LEVELS, ENDINGS, parseMap, freshLedger, resolveRules, newSim, step, runAll, starsFor, usedLines, isLocked, strokes, checkSeals, loopholeOf };
