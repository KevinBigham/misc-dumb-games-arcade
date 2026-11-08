// Bot harness for Thistlemarch. Loads the rules from the BUILT html (between CORE markers) and plays both sides:
// the Rot is driven by the game's own planner; the player side by one of several policies below.
// Usage: node tests/bots.js [runs]
const fs = require('fs'), path = require('path'), vm = require('vm');
function loadCore() {
  const html = fs.readFileSync(path.resolve(__dirname, '../thistlemarch.html'), 'utf8');
  const src = html.slice(html.indexOf('/*CORE-START*/'), html.indexOf('/*CORE-END*/'));
  const ctx = { module: undefined, console };
  vm.createContext(ctx);
  vm.runInContext(src + '\n;this.Core=Core;', ctx);
  return ctx.Core;
}
const C = loadCore();

function mulberry(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- evaluation ----------
function evaluate(b, w) {
  if (b.phase === 'won') return 1e6;
  if (b.phase === 'lost') return -1e6;
  let v = 0;
  const foes = C.foes(b), ps = C.players(b);
  for (const e of foes) v -= e.hp * w.foeHp + w.foeCount;
  for (const p of ps) v += p.hp * w.myHp + (p.captain ? 0 : w.alive) + p.level * 2;
  const preds = C.predictAll(b);
  const incoming = {};
  for (const pr of preds) if (!pr.r.fizzle) for (const h of pr.r.hits) { const k = h.seed ? 'seed' : h.id; incoming[k] = (incoming[k] || 0) + h.dmg; }
  for (const p of ps) {
    const d = incoming[p.id] || 0;
    v -= d * w.threat;
    if (d >= p.hp) v -= p.captain ? 5000 : w.lethal;
  }
  if (b.seedling) { v += b.seedling.hp * 30; const d = incoming.seed || 0; v -= d * 25; if (d >= b.seedling.hp) v -= 5000; }
  const k = b.obj.kind;
  if (k === 'reach') {
    const cap = C.captainOf(b);
    if (cap) { let best = 99; for (let y = 0; y < b.rows; y++) for (let x = 0; x < b.cols; x++) if (C.terr(b, x, y).exit) best = Math.min(best, Math.abs(cap.x - x) + Math.abs(cap.y - y)); v -= best * w.reach; }
  }
  if (k === 'hold') {
    v += b.gate * 200;
    for (const e of foes) { for (const n of C.reachable(b, e, { full: true }).values()) if (n.y === b.rows - 1) { v -= w.breach; break; } }
  }
  for (const sp of b.pending || []) { const o = C.unitAt(b, sp.x, sp.y); if (o && o.side === 'p') v += w.block; }
  if (k === 'boss') { const m = foes.find(e => C.UNIT_TYPES[e.type].boss); if (m) v -= m.hp * 6; }
  // approach: rout/boss maps reward closing in a bit so bots do not stall forever
  if (k === 'rout' || k === 'boss') {
    for (const p of ps) { let dmin = 99; for (const e of foes) dmin = Math.min(dmin, C.dist(p.x, p.y, e.x, e.y)); if (dmin < 99) v -= dmin * w.approach; }
  }
  return v;
}

const POLICIES = {
  careful: { foeHp: 10, foeCount: 15, myHp: 6, alive: 25, threat: 7, lethal: 120, reach: 40, breach: 60, block: 15, approach: 1.5 },
  // 'human': careful weights, but only looks at ~1/3 of the options each pick and is noisy (a decent player, not a solver)
  human:   { foeHp: 10, foeCount: 15, myHp: 6, alive: 25, threat: 7, lethal: 120, reach: 40, breach: 60, block: 15, approach: 1.5, sample: 0.33, noise: 25 },
  aggro:   { foeHp: 14, foeCount: 25, myHp: 2, alive: 10, threat: 1.5, lethal: 20, reach: 40, breach: 30, block: 5, approach: 3 },
};

function legalOptions(b, u) {
  const opts = [];
  const tiles = u.moved ? [{ x: u.x, y: u.y }] : [...C.reachable(b, u).values()];
  for (const t of tiles) {
    const c = C.clone(b);
    if (t.x !== u.x || t.y !== u.y) { const r = C.applyCommand(c, { t: 'move', id: u.id, x: t.x, y: t.y }); if (!r.ok) continue; }
    const cu = C.getUnit(c, u.id);
    if (!cu) continue;
    opts.push({ mv: t, act: null });
    if (!cu.acted) for (const tg of C.actTargets(c, cu)) opts.push({ mv: t, act: tg });
  }
  return opts;
}
function simulate(b, u, o) {
  const c = C.clone(b);
  if (o.mv.x !== u.x || o.mv.y !== u.y) C.applyCommand(c, { t: 'move', id: u.id, x: o.mv.x, y: o.mv.y });
  if (o.act) C.applyCommand(c, { t: 'act', id: u.id, x: o.act.x, y: o.act.y });
  return c;
}

// plays one player turn with the named policy; returns commands applied
function playTurn(b, policy, rnd, log) {
  const cmds = [];
  const doCmd = (cmd) => { const r = C.applyCommand(b, cmd); if (!r.ok) throw new Error('illegal ' + JSON.stringify(cmd) + ' ' + r.why); cmds.push(cmd); return r; };
  if (policy === 'passive') { doCmd({ t: 'end' }); return cmds; }
  if (policy === 'random') {
    for (const u of C.players(b)) {
      if (b.phase !== 'player') break;
      const o = legalOptions(b, u); if (!o.length) continue;
      const pick = o[Math.floor(rnd() * o.length)];
      if (pick.mv.x !== u.x || pick.mv.y !== u.y) doCmd({ t: 'move', id: u.id, x: pick.mv.x, y: pick.mv.y });
      if (rnd() < 0.3 && b.undo) doCmd({ t: 'undo' });
      const cu = C.getUnit(b, u.id);
      if (pick.act && cu && !cu.acted && b.phase === 'player') { const tg = C.actTargets(b, cu).find(t => t.x === pick.act.x && t.y === pick.act.y); if (tg) doCmd({ t: 'act', id: u.id, x: tg.x, y: tg.y }); }
    }
    if (b.phase === 'player') doCmd({ t: 'end' });
    return cmds;
  }
  const w = POLICIES[policy] || POLICIES.careful;
  for (let guard = 0; guard < 8 && b.phase === 'player'; guard++) {
    const ready = C.players(b).filter(p => !p.acted);
    if (!ready.length) break;
    let best = null;
    for (const u of ready) {
      for (const o of legalOptions(b, u)) {
        if (policy === 'turtle' && (o.mv.x !== u.x || o.mv.y !== u.y) && o.mv.y < u.y) continue;
        if (w.sample && rnd() > w.sample) continue;
        const c = simulate(b, u, o);
        const val = evaluate(c, w) + rnd() * (w.noise || 0.5);
        if (!best || val > best.val) best = { u, o, val };
      }
    }
    if (!best) break;
    const { u, o } = best;
    if (o.mv.x !== u.x || o.mv.y !== u.y) doCmd({ t: 'move', id: u.id, x: o.mv.x, y: o.mv.y });
    if (b.phase !== 'player') break;
    if (o.act) doCmd({ t: 'act', id: u.id, x: o.act.x, y: o.act.y });
    else { const cu = C.getUnit(b, u.id); if (cu) cu.acted = true, cu.moved = true; } // pass: mark done (bot bookkeeping)
  }
  if (b.phase === 'player') doCmd({ t: 'end' });
  return cmds;
}

// invariants checked after every command
function invariants(b) {
  const seen = new Set();
  for (const u of b.units) {
    if (!(u.hp > 0)) throw new Error('dead unit on board ' + u.id);
    if (u.hp > u.maxHp) throw new Error('hp over max ' + u.type);
    if (!C.inB(b, u.x, u.y)) throw new Error('out of bounds');
    if (C.terr(b, u.x, u.y).block) throw new Error('unit inside bramble');
    const k = u.x + ',' + u.y; if (seen.has(k)) throw new Error('two units on one tile ' + k); seen.add(k);
    for (const f of ['x', 'y', 'hp', 'dmg', 'move']) if (!Number.isFinite(u[f])) throw new Error('NaN ' + f);
  }
  if (!C.validBattle(b) && b.phase === 'player') throw new Error('state fails save validation');
}

function playBattle(def, band, policy, seed, opts) {
  opts = opts || {};
  const b = C.createBattle(def, band, { seed, idx: opts.idx, mode: opts.mode, oath: opts.oath });
  const rnd = mulberry(seed ^ 0xabc);
  let turns = 0, cmds = [];
  while (b.phase === 'player') {
    cmds = cmds.concat(playTurn(b, policy, rnd));
    invariants(b);
    // save/load mid-battle must round-trip
    const rt = JSON.parse(JSON.stringify(b)); if (b.phase === 'player' && !C.validBattle(rt)) throw new Error('round trip invalid');
    if (++turns > 40) throw new Error('soft lock: battle did not end in 40 turns');
  }
  return { b, cmds };
}

function pickBand(c, rnd, style) {
  const picks = [];
  for (const v of c.barracks) if (picks.length < 3 && (v.wound || 0) * 2 < C.vetMaxHp(v)) picks.push({ vetId: v.vetId });
  const pref = style === 'heal' ? ['mender', 'duelist', 'bomber', 'scout'] : style === 'strike' ? ['duelist', 'duelist', 'bomber', 'scout'] : ['duelist', 'bomber', 'mender', 'scout'];
  let i = 0;
  while (picks.length < 3) { const t = pref[i % pref.length]; i++; if (c.unlocked.includes(t)) picks.push({ type: t, name: 'Bot' }); if (i > 20) break; }
  return picks;
}

function playCampaign(seed, policy, style) {
  const c = C.newCampaign(seed);
  const rnd = mulberry(seed);
  const rec = [];
  while (!c.done) {
    const picks = pickBand(c, rnd, style);
    if (!C.validPicks(c, picks)) throw new Error('bad picks');
    const band = C.bandFor(c, picks);
    const { b } = playBattle(C.BATTLES[c.battle], band, policy, C.battleSeed(c), { idx: c.battle });
    const deb = C.settleBattle(c, b);
    const again = C.settleBattle(c, b); if (again !== deb) throw new Error('settle not idempotent');
    while (C.pendingPerks(c) > 0) C.choosePerk(c, C.perkOffer(c)[0]);
    if (!C.validCampaign(c)) throw new Error('campaign invalid');
    rec.push({ i: deb.idx, r: deb.result[0], rd: deb.round, st: deb.stars, fell: deb.fallen.length, why: deb.reason });
  }
  return { c, rec };
}

module.exports = { C, playBattle, playTurn, playCampaign, evaluate, POLICIES, mulberry, invariants };

if (require.main === module) {
  const runs = +process.argv[2] || 12;
  const t0 = Date.now();
  // 1) every battle vs each policy with fresh recruits (no veterans) at fixed seeds
  const policies = ['careful', 'human', 'aggro', 'turtle', 'random', 'passive'];
  console.log('Per-battle win counts (' + runs + ' seeds, fresh level-1 band: duelist, bomber, mender):');
  for (let i = 0; i < C.BATTLES.length; i++) {
    const row = [];
    for (const pol of policies) {
      let w = 0, rounds = 0, fell = 0, taken = 0;
      for (let s = 1; s <= runs; s++) {
        const band = [{ type: 'warden', captain: true, name: 'Oakhorn', level: Math.min(4, 1 + Math.floor(i / 3)), xp: 0, perks: [] },
          { type: 'duelist', name: 'A' }, { type: 'bomber', name: 'B' }, { type: i >= 3 ? 'mender' : 'duelist', name: 'C' }];
        const { b } = playBattle(C.BATTLES[i], band, pol, 1000 + s * 7919 + i, { idx: i });
        taken += b.stats.taken; if (b.phase === 'won') { w++; rounds += b.round; fell += b.fallen.length; }
      }
      row.push(pol + ' ' + w + '/' + runs + (w ? ' (r' + (rounds / w).toFixed(1) + ', fell ' + (fell / w).toFixed(1) + ', hurt ' + (taken / runs).toFixed(0) + ')' : ''));
    }
    console.log(String(i + 1).padStart(2), C.BATTLES[i].name.padEnd(17), row.join(' | '));
  }
  // 2) full campaigns
  console.log('\nFull campaigns:');
  for (const [pol, style] of [['careful', 'mix'], ['careful', 'heal'], ['human', 'mix'], ['human', 'heal'], ['aggro', 'strike'], ['turtle', 'mix']]) {
    let wins = 0, stars = 0, losses = 0; const reached = [];
    for (let s = 1; s <= Math.max(3, Math.floor(runs / 2)); s++) {
      const { c } = playCampaign(500 + s, pol, style);
      if (c.done === 'won') { wins++; stars += C.campaignScore(c); }
      losses += c.losses; reached.push(c.done === 'won' ? 'W' : c.battle + 1);
    }
    console.log(pol + '/' + style, 'won', wins, 'avg stars', wins ? (stars / wins).toFixed(1) : '-', 'battle losses', losses, 'ends', reached.join(','));
  }
  // 3) daily
  let dw = 0; for (let d = 0; d < runs; d++) { const seed = C.hashStr('daily:2026-11-' + (d + 1)); const def = C.dailyDef(seed); const { b } = playBattle(def, C.dailyBand(seed), 'careful', seed, { mode: 'daily' }); if (b.phase === 'won') dw++; }
  console.log('\nDaily skirmish careful wins', dw + '/' + runs);
  // 4) determinism: same seed + same commands -> same result
  const band = [{ type: 'warden', captain: true, name: 'Oakhorn' }, { type: 'duelist' }, { type: 'bomber' }, { type: 'duelist' }];
  const r1 = playBattle(C.BATTLES[1], band, 'careful', 42, { idx: 1 });
  const b2 = C.createBattle(C.BATTLES[1], band, { seed: 42, idx: 1 });
  for (const cmd of r1.cmds) { if (cmd.t === 'end') { for (const u of b2.units) if (u.side === 'p') { } } C.applyCommand(b2, cmd); }
  console.log('Replay determinism:', JSON.stringify(r1.b.units.map(u => [u.id, u.x, u.y, u.hp])) === JSON.stringify(b2.units.map(u => [u.id, u.x, u.y, u.hp])) && r1.b.phase === b2.phase ? 'PASS' : 'FAIL');
  console.log('time', ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
