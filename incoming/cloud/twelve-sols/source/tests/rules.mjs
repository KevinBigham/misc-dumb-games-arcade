// Rules tests: determinism, invariants, soft locks, farming, save round-trips, both endings.
import { loadCore, smartBot, randomBot, passiveBot, play, makeRng } from './lib.mjs';
const T = loadCore(); const { Rules, Store, CONFIG, DATA } = T;
let fails = 0; const ok = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) fails++; };
const allKnown = () => { const m = T.newMeta(); m.known = DATA.RECIPES.map(r => r.id); return m; };

// data validation
const pairs = new Set(); let dataOk = true;
DATA.RECIPES.forEach(r => {
  const k = T.pairKey(r.a, r.b); if (pairs.has(k) || r.a === r.b || !DATA.ITEMS[r.a] || !DATA.ITEMS[r.b]) dataOk = false; pairs.add(k);
  if (r.build && !DATA.BUILDS[r.build]) dataOk = false; if (r.out) Object.keys(r.out).forEach(i => { if (!DATA.ITEMS[i]) dataOk = false; });
  if (!r.hint) dataOk = false;
});
Object.values(DATA.SITES).forEach(s => Object.keys(s.loot).forEach(i => { if (!DATA.ITEMS[i]) dataOk = false; }));
ok(dataOk, 'recipe/site data valid: unique pairs, real items, every recipe has a hint');
// every recipe output is reachable from raw finds
const raw = new Set(); Object.values(DATA.SITES).forEach(s => Object.keys(s.loot).forEach(i => raw.add(i)));
let grew = true; const reach = new Set(raw);
while (grew) { grew = false; DATA.RECIPES.forEach(r => { if (reach.has(r.a) && reach.has(r.b) && r.out) Object.keys(r.out).forEach(i => { if (!reach.has(i)) { reach.add(i); grew = true; } }); }); }
ok(DATA.RECIPES.every(r => reach.has(r.a) && reach.has(r.b)), 'every recipe is craftable from things you can find');

// determinism
const a1 = play(T, smartBot(T, makeRng(9)), { seed: 'det', meta: T.newMeta() });
const a2 = play(T, smartBot(T, makeRng(9)), { seed: 'det', meta: T.newMeta() });
ok(JSON.stringify(a1.s) === JSON.stringify(a2.s), 'same seed + same choices = same run');
const replay = (() => { let m = T.newMeta(); let s = Rules.newRun('det', 'normal', m, ''); for (const a of a1.trace) { const o = Rules.act(s, m, a); s = o.s; m = o.meta; } return s; })();
ok(JSON.stringify(replay) === JSON.stringify(a1.s), 'replaying the action log reproduces the run');

// invariants over many runs
let bad = 0, softlock = 0, invalidSave = 0, mutated = 0, blockedChanged = 0, runs = 0, maxSteps = 0, maxScore = 0, wins = 0, losses = 0;
const check = (s, m, a, out) => {
  const S = out.s;
  if (Object.values(S.needs).some(v => v < 0 || v > 100) || S.hull < 0 || S.hull > 100) bad++;
  if (Object.values(S.inv).some(v => !Number.isInteger(v) || v < 1 || v > CONFIG.MAX_STACK)) bad++;
  if (Object.keys(S.builds).some(k => S.builds[k] > DATA.BUILDS[k].max)) bad++;
  if (S.hour > Rules.hourLimit(S)) bad++;
  if (!S.result && Rules.legal(S, out.meta).length === 0) softlock++;
  if (!S.result && !Rules.legal(S, out.meta).some(x => x.t === 'end')) softlock++;
  if (!Store.validateRun(JSON.parse(JSON.stringify(S)))) invalidSave++;
  const blocked = out.fx.some(f => f.k === 'blocked');
  if (blocked && JSON.stringify(S) !== JSON.stringify(s)) blockedChanged++;
};
for (let i = 0; i < 600; i++) {
  const r = makeRng(i);
  const bots = [randomBot(T, r), smartBot(T, r), smartBot(T, r, { strategy: 'beacon' }), passiveBot()];
  const metas = [T.newMeta(), allKnown()]; metas[1].unlocked = i % 4;
  const bot = bots[i % 4]; const m0 = metas[i % 2];
  const snapshot = JSON.stringify(m0);
  const res = play(T, bot, { seed: 'inv' + i, meta: m0, mode: i % 7 === 0 ? 'daily' : 'normal', onStep: (s, m, a, out) => { const before = JSON.stringify(s); check(s, m, a, out); if (JSON.stringify(s) !== before) mutated++; } });
  if (JSON.stringify(m0) !== snapshot) mutated++;
  runs++; maxSteps = Math.max(maxSteps, res.steps); maxScore = Math.max(maxScore, res.s.result ? res.s.result.score : 0);
  if (!res.s.result) softlock++; else if (res.s.result.win) wins++; else losses++;
}
ok(bad === 0, 'needs, hull, stacks, builds and hours stay in range (' + bad + ' violations)');
ok(softlock === 0, 'no soft locks: End Sol always available, every run ends (' + softlock + ')');
ok(invalidSave === 0, 'every reachable state passes save validation (' + invalidSave + ' rejected)');
ok(mutated === 0, 'Rules.act never mutates its inputs');
ok(blockedChanged === 0, 'blocked actions change nothing');
ok(maxSteps < 400, 'runs are bounded: most actions in a run = ' + maxSteps);
const scoreCap = Math.round((CONFIG.SOLS * CONFIG.SCORE.perSol + CONFIG.SCORE.win + (CONFIG.SOLS - CONFIG.BEACON_MIN_RESCUE) * CONFIG.SCORE.earlySol + 150) * CONFIG.LEVELS[CONFIG.LEVELS.length - 1].mult);
ok(maxScore <= scoreCap, 'score cannot be farmed: max seen ' + maxScore + ' ≤ cap ' + scoreCap);
ok(wins > 0 && losses > 0, 'both endings happen (' + wins + ' wins, ' + losses + ' losses)');

// farming attempts: hoard production over a long run, spam use/craft
{
  let m = allKnown(); let s = Rules.newRun('farm', 'normal', m, '');
  let actions = 0; let o;
  // spam the same blocked actions: nothing should change
  for (let i = 0; i < 200; i++) { o = Rules.act(s, m, { t: 'use', id: 'ration' }); if (!o.fx.some(f => f.k === 'blocked')) { s = o.s; m = o.meta; actions++; } }
  ok(actions <= 1, 'spamming Use cannot gain more than you hold (' + actions + ' uses)');
  // dud spam: each dud costs an hour once, then blocked
  m = T.newMeta(); s = Rules.newRun('farm2', 'normal', m, ''); s.inv = { scrap: 1, ice: 1 };
  o = Rules.act(s, m, { t: 'craft', a: 'scrap', b: 'ice' }); const h1 = o.s.hour;
  const o2 = Rules.act(o.s, o.meta, { t: 'craft', a: 'scrap', b: 'ice' });
  ok(h1 === 1 && o2.s.hour === 1 && o2.fx[0].k === 'blocked', 'a dud costs one hour once, then is blocked');
  // builds cap
  m = allKnown(); s = Rules.newRun('farm3', 'normal', m, ''); s.inv = { brick: 9, scrap: 9 };
  let built = 0; for (let i = 0; i < 8; i++) { o = Rules.act(s, m, { t: 'craft', a: 'brick', b: 'scrap' }); if (!o.fx.some(f => f.k === 'blocked')) built++; s = o.s; s.hour = 0; }
  ok(built === DATA.BUILDS.shutter.max, 'shutters cap at ' + DATA.BUILDS.shutter.max);
  // a discovery is recorded once and is not re-scored
  m = T.newMeta(); s = Rules.newRun('farm4', 'normal', m, ''); s.inv = { wire: 3, scrap: 3 };
  o = Rules.act(s, m, { t: 'craft', a: 'wire', b: 'scrap' }); o = Rules.act(o.s, o.meta, { t: 'craft', a: 'wire', b: 'scrap' });
  ok(o.meta.known.filter(x => x === 'coil').length === 1 && o.s.stats.found.length === 1, 'a recipe is discovered once');
}
// finishing twice does not double-count (idempotent meta update)
{
  const res = play(T, passiveBot(), { seed: 'once', meta: T.newMeta() });
  ok(res.meta.runs === 1, 'loss counted once');
  const again = Rules.act(res.s, res.meta, { t: 'end' });
  ok(again.meta.runs === 1 && again.fx[0].k === 'blocked', 'no actions after the end');
}
// beacon: rescue earlier but never before the floor
{
  let m = allKnown(); let s = Rules.newRun('bea', 'normal', m, ''); s.inv = { antenna: 1, circuit: 1 };
  const o = Rules.act(s, m, { t: 'craft', a: 'antenna', b: 'circuit' });
  ok(o.s.rescueSol === CONFIG.BEACON_MIN_RESCUE && o.s.builds.beacon === 1, 'beacon on sol 1 sets rescue to sol ' + CONFIG.BEACON_MIN_RESCUE);
}
// cold hands and darkness block with a reason
{
  let m = allKnown(); let s = Rules.newRun('dark', 'normal', m, ''); s.hour = CONFIG.DAY_HOURS;
  const c = Rules.check(s, m, { t: 'craft', a: 'ice', b: 'cell' });
  ok(!c.ok && /dark/i.test(c.why), 'no bench work after dusk without a lamp: "' + c.why + '"');
  s.builds.lamp = 1; ok(Rules.check(s, m, { t: 'craft', a: 'ice', b: 'cell' }).ok, 'a lamp allows bench work after dusk');
  s.hour = 0; s.needs.warm = 10; ok(Rules.check(s, m, { t: 'craft', a: 'ice', b: 'cell' }).hours === 2, 'numb hands make bench work take 2h');
}
// levels unlock one at a time, only by winning at the top unlocked level
{
  let m = allKnown(); let unlockedSeen = []; let tries = 0;
  while (m.unlocked < CONFIG.LEVELS.length - 1 && tries++ < 200) {
    const res = play(T, smartBot(T, makeRng(tries)), { seed: 'lv' + tries, meta: m });
    if (res.s.result.win) unlockedSeen.push(res.meta.unlocked); m = res.meta;
  }
  ok(m.unlocked === CONFIG.LEVELS.length - 1 && unlockedSeen.every((u, i) => i === 0 || u - unlockedSeen[i - 1] <= 1), 'levels unlock in order by winning (' + tries + ' runs to unlock all)');
  const s = Rules.newRun('cheat', 'normal', T.newMeta(), '', 3);
  ok(s.level === 0, 'cannot start a locked level');
  const d = Rules.newRun('d', 'daily', T.newMeta(), '20261106', 3);
  ok(d.level === CONFIG.DAILY_LEVEL, 'daily always uses level ' + CONFIG.DAILY_LEVEL);
}
// meta repair keeps good data
{
  const m = T.newMeta(); m.known.push('coil'); m.duds.push('ice|scrap'); m.best = 900; m.runs = 3; m.wins = 1;
  const r = Store.repairMeta(JSON.parse(JSON.stringify(m)));
  ok(JSON.stringify(r) === JSON.stringify(m), 'a healthy journal survives repair unchanged');
  const r2 = Store.repairMeta({ known: ['coil', 'coil', 'nope'], duds: ['ice|scrap', 'scrap|ice', 'cell|ice', 'x|y'], wins: 9, runs: 2 });
  ok(r2.known.filter(x => x === 'coil').length === 1 && r2.duds.length === 1 && r2.wins === 2, 'a bad journal is cleaned, not wiped');
}
console.log(fails ? fails + ' FAILED' : 'ALL RULES CHECKS PASSED');
process.exit(fails ? 1 : 0);
