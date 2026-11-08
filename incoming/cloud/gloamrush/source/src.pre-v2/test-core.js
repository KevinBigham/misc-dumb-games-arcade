// Acceptance tests for the pure core (spec section "Acceptance tests").
const B = require('./bot.js'); const GR = B.GR;
let pass = 0, fail = 0;
function ok(cond, name, extra) { if (cond) { pass++; console.log('PASS', name, extra || ''); } else { fail++; console.log('FAIL', name, extra || ''); } }

// 1. Daily determinism
{
  const seed = GR.hashStr('gloamrush:' + '2026-11-05');
  const a = B.runSim({ seed, world: { daily: true }, maxT: 200 }), b = B.runSim({ seed, world: { daily: true }, maxT: 200 });
  ok(JSON.stringify(a.w.spawnLog) === JSON.stringify(b.w.spawnLog) && a.w.spawnLog.length > 300, 'daily: same seed + same play -> identical spawn schedule', a.w.spawnLog.length + ' spawns');
  ok(JSON.stringify(a.w.mothLog) === JSON.stringify(b.w.mothLog) && a.w.mothLog.length > 2, 'daily: identical moth/comet schedule', JSON.stringify(a.w.mothLog));
  // different play style: spawn timing/types/angles still match over the common window
  const c = B.runSim({ seed, world: { daily: true }, maxT: 200, bot: B.grazeBot, pick: 'random' });
  const T = Math.min(a.w.t, c.w.t, 175) - 1;
  const cut = L => L.filter(x => x[0] < T && x[1] !== 'boss').map(x => JSON.stringify(x)).join('|');
  ok(cut(a.w.spawnLog) === cut(c.w.spawnLog), 'daily: spawn schedule independent of how you play', 'compared to t=' + T.toFixed(0));
  const tMoth = L => L.filter(x => x[0] < T && x[1] !== 'cinder').map(x => x[0]).join('|');
  ok(tMoth(a.w.mothLog) === tMoth(c.w.mothLog), 'daily: moth timing independent of how you play');
  // card offers identical for identical picks
  const offers = s => { const w = GR.makeWorld({ seed, daily: true }); const out = []; let n = 0; const bot = B.bot; while (!w.over && n < 60 * 120) { n++; if (w.choices) { out.push(w.choices.map(c => c.id).join(',')); GR.chooseUpgrade(w, 0); continue; } GR.step(w, bot(w), 1 / 60); w.events.length = 0; } return out.join(';'); };
  ok(offers() === offers(), 'daily: identical card offers for identical picks');
  // different dates -> different dusk
  const d2 = B.runSim({ seed: GR.hashStr('gloamrush:2026-11-06'), world: { daily: true }, maxT: 60 });
  ok(JSON.stringify(d2.w.spawnLog.slice(0, 40)) !== JSON.stringify(a.w.spawnLog.slice(0, 40)), 'daily: next day is a different dusk');
}
// local day key rolls at local midnight
{
  const k1 = GR.localDayKey(new Date(2026, 10, 5, 23, 59)), k2 = GR.localDayKey(new Date(2026, 10, 6, 0, 1)), k3 = GR.localDayKey(new Date(2026, 10, 5, 18, 30));
  ok(k1 === '2026-11-05' && k2 === '2026-11-06' && k3 === '2026-11-05', 'day key: 6:30 pm and 11:59 pm are still Nov 5, 12:01 am is Nov 6 (TZ=' + (process.env.TZ || 'system') + ')');
}
// 2. Graze rules
{
  const mk = () => { const w = GR.makeWorld({ seed: 5 }); w.choices = null; w.pending = 0; w.enemies = []; w.spawnT = 999; w.mothT = 999; w.cometT = 999; w.waveI = 99; return w; };
  const grazes = w => w.events.filter(e => e.k === 'graze').length;
  // bullet passes 14px from center (inside zone, outside hitbox), no hit -> pays once
  let w = mk();
  w.ebul.push({ x: -200, y: 14, vx: 300, vy: 0, r: 6, life: 7, gIn: false, gEnter: 0, paid: false, dead: false });
  for (let i = 0; i < 120; i++) GR.step(w, {}, 1 / 60);
  ok(grazes(w) === 1 && w.stats.grazes === 1, 'graze: a near pass pays exactly once', 'events=' + grazes(w));
  // same pass, but player is hit 0.1s after the bullet enters the zone -> no pay
  w = mk(); w.events.length = 0;
  w.ebul.push({ x: -200, y: 14, vx: 300, vy: 0, r: 6, life: 7, gIn: false, gEnter: 0, paid: false, dead: false });
  let hitDone = false, enterT = null;
  for (let i = 0; i < 120; i++) { GR.step(w, {}, 1 / 60); const b = w.ebul[0]; if (b && b.gIn && enterT === null) enterT = w.t; if (enterT !== null && !hitDone && w.t >= enterT + 0.1) { w.p.inv = 0; w.wild = 0; w.lastHitT = w.t; w.p.hp -= 5; hitDone = true; } }
  ok(hitDone && grazes(w) === 0, 'graze: no pay when hit within 0.2s after entering');
  // fast bullet exits within 0.1s and the hit comes 0.15s after entry (after exit) -> still no pay
  w = mk(); w.events.length = 0;
  w.ebul.push({ x: -100, y: 15, vx: 900, vy: 0, r: 6, life: 7, gIn: false, gEnter: 0, paid: false, dead: false });
  enterT = null; hitDone = false;
  for (let i = 0; i < 90; i++) { GR.step(w, {}, 1 / 60); const b = w.ebul[0]; if (b && b.gIn && enterT === null) enterT = w.t; if (enterT !== null && !hitDone && w.t >= enterT + 0.15) { w.lastHitT = w.t; hitDone = true; } }
  ok(hitDone && grazes(w) === 0, 'graze: delayed hit (after the bullet already left) still cancels the pay');
  // a bullet that hits does not pay
  w = mk(); w.events.length = 0;
  w.ebul.push({ x: -200, y: 0, vx: 300, vy: 0, r: 6, life: 7, gIn: false, gEnter: 0, paid: false, dead: false });
  for (let i = 0; i < 120; i++) GR.step(w, {}, 1 / 60);
  ok(grazes(w) === 0 && w.p.hp < w.p.maxHp, 'graze: a bullet that hits you never pays');
  // 8 per second cap
  w = mk(); w.events.length = 0;
  for (let i = 0; i < 20; i++) w.ebul.push({ x: -60 - i * 0.5, y: 15, vx: 400, vy: 0, r: 6, life: 7, gIn: false, gEnter: 0, paid: false, dead: false });
  for (let i = 0; i < 40; i++) GR.step(w, {}, 1 / 60);
  ok(grazes(w) === 8, 'graze: capped at 8 payouts per second', 'paid=' + grazes(w));
  // chain multiplier and Flare
  ok(w.chain === 8 && (w.flare > 0 || w.stats.wildfires > 0), 'graze: chain counts up and fills Flare', 'chain=' + w.chain + ' flare=' + w.flare.toFixed(2));
}
// 3. Evolution card in slot 1 when both halves maxed, survives rerolls
{
  let all = true, rr = true, n = 0;
  for (let s = 1; s <= 200; s++) {
    const w = GR.makeWorld({ seed: s * 13 }); w.choices = null; w.pending = 0;
    const e = GR.EVOS[s % GR.EVOS.length];
    w.up[e.a] = GR.UPG_BY[e.a].max; w.up[e.b] = GR.UPG_BY[e.b].max;
    // some noise upgrades
    w.up.quick = 2; w.levelIdx = 2 + (s % 9);
    w.pending = 1; w.choices = GR.rollChoices(w); n++;
    if (w.choices[0].kind !== 'evo' || w.choices[0].id !== e.id) all = false;
    w.rerolls = 2; GR.reroll(w); if (w.choices[0].kind !== 'evo') rr = false; GR.reroll(w); if (w.choices[0].kind !== 'evo') rr = false;
  }
  ok(all, 'evolution: card is in slot 1 every time both halves are maxed (' + n + ' trials)');
  ok(rr, 'evolution: card survives rerolls');
  // card always offers 3 distinct options
  let distinct = true;
  for (let s = 1; s <= 300; s++) { const w = GR.makeWorld({ seed: s }); w.levelIdx = s % 20; const c = GR.rollChoices(w); if (new Set(c.map(x => x.id)).size !== 3) distinct = false; }
  ok(distinct, 'level-up: always 3 different cards');
}
// 4. Focused runs reach an evolution before 3:00, 5/6 pacing
{
  const N = +process.env.N || 200; let evo = 0, times = [], wins = 0, lvls = 0, firstLvl = [], wild = [];
  for (let s = 1; s <= N; s++) {
    const r = B.runSim({ seed: s * 7919, pick: 'focused', maxT: 400 });
    if (r.firstEvoT !== null && r.firstEvoT < 180) evo++;
    times.push(r.w.over ? r.w.over.time : r.w.t); if (r.w.over && r.w.over.win) wins++; lvls += r.w.level;
  }
  const avgT = times.reduce((a, b) => a + b, 0) / N;
  ok(evo / N >= 0.5, 'focused runs: at least 50% reach an evolution before 3:00', `${evo}/${N} (${Math.round(evo / N * 100)}%)`);
  console.log(`INFO focused bot: avg run ${GR.fmtT(avgT)}, dawn reached ${wins}/${N}, avg level ${(lvls / N).toFixed(1)}`);
  ok(avgT >= 150 && avgT <= 260, 'session length: average bot run lands near the 3-4 minute band', GR.fmtT(avgT));
  for (let s = 1; s <= 40; s++) { const r = B.runSim({ seed: s * 31, world: { tutorial: true }, pick: 'first', maxT: 40 }); firstLvl.push(r.firstLevelT); wild.push(r.firstWildT); }
  const fl = firstLvl.filter(x => x !== null), med = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  ok(fl.length === 40 && fl.filter(t => t >= 6 && t <= 10).length >= 36, 'first run: first level-up lands between 6 and 10 s in 90%+ of runs (idle-dodge bot)', `median ${med(fl).toFixed(1)}s, min ${Math.min(...fl).toFixed(1)}, max ${Math.max(...fl).toFixed(1)}`);
  const wl = wild.filter(x => x !== null);
  console.log(`INFO first run, idle-dodge bot: first Wildfire before 30s in ${wild.filter(x => x !== null && x < 30).length}/40, median ${wl.length ? med(wl).toFixed(1) : '-'}s`);
  const wild2 = []; for (let s = 1; s <= 40; s++) { const r = B.runSim({ seed: s * 31, world: { tutorial: true }, pick: 'first', maxT: 40, bot: B.skimBot }); wild2.push(r.firstWildT); }
  const g2 = wild2.filter(x => x !== null && x < 30).length;
  ok(g2 >= 30, 'first run: a bot that skims shots gets its first Wildfire before 30 s', `${g2}/40`);
}
// 7. Corrupt saves
{
  let threw = false, d;
  const junk = [null, 42, 'x', [], { glow: 'lots', meta: { wax: NaN, pot: 99 }, heroes: { beetle: 'yes' }, hero: 'dragon', evolutions: ['glacial', 'nope', 7, 'glacial'], moths: { miller: { n: 'a' }, fake: { n: 3 } }, mis: { key: 3, list: [1, 2] }, streak: { n: -5, shields: 9 }, settings: { music: 7, shake: 'x' } }];
  try { for (const j of junk) d = GR.mergeSave(j); } catch (e) { threw = e; }
  ok(!threw && d.glow === 0 && d.meta.pot === 5 && d.meta.wax === 0 && d.hero === 'wick' && !d.heroes.beetle && d.evolutions.join() === 'glacial' && d.moths.miller && !d.moths.fake && d.mis === null && d.streak.n === 0 && d.streak.shields === 1 && d.settings.music === 1, 'save: corrupt values load to safe defaults without throwing', threw ? String(threw) : '');
  const s = GR.defSave(); s.glow = 123; s.moths.miller = { n: 2, bestMm: 30, first: '2026-11-05' };
  const back = GR.mergeSave(JSON.parse(JSON.stringify(s)));
  ok(back.glow === 123 && back.moths.miller.n === 2, 'save: a good save round-trips');
}
// 8. Offline glow
{
  const s = GR.defSave(); s.moths = { miller: { n: 1 }, emberlace: { n: 1 }, cinder: { n: 1 }, dawnmoth: { n: 1 } }; // 1+2+4+8 = 15/h
  const now = 1.8e12; s.lastSave = now - 20 * 3600e3;
  ok(GR.offlineGain(s, now) === 15 * 8, 'offline: capped at 8 hours', GR.offlineGain(s, now) + ' glow');
  s.lastSave = now + 3600e3;
  ok(GR.offlineGain(s, now) === 0, 'offline: clock rolled back pays 0');
  s.lastSave = now - 2 * 3600e3;
  ok(GR.offlineGain(s, now) === 30, 'offline: 2 hours of 15/h = 30');
}
// Missions + streak
{
  const s = GR.defSave(); GR.ensureMissions(s, '2026-11-05');
  const ids = s.mis.list.map(m => m.id);
  ok(s.mis.list.length === 3 && new Set(ids).size === 3 && s.mis.list.some(m => GR.MPOOL_BY[m.id].scope === 'day'), 'missions: 3 different, at least one day-scope', ids.join(','));
  const s2 = GR.defSave(); GR.ensureMissions(s2, '2026-11-05');
  ok(JSON.stringify(s2.mis) === JSON.stringify(s.mis), 'missions: same day -> same missions');
  let st = GR.defSave();
  GR.markStreak(st, '2026-11-01'); GR.markStreak(st, '2026-11-02'); GR.markStreak(st, '2026-11-02');
  ok(st.streak.n === 2, 'streak: consecutive days count, same day once');
  const r = GR.markStreak(st, '2026-11-04'); // missed the 3rd
  ok(r.usedShield && st.streak.n === 3 && st.streak.shields === 0, 'streak: one missed day is forgiven by the ember shield');
  GR.markStreak(st, '2026-11-07');
  ok(st.streak.n === 1, 'streak: two missed days restarts');
}
// Payout rules
{
  const w = GR.makeWorld({ seed: 9 }); w.choices = null; w.score = 30000; w.banked = 40; w.glowBonus = 20; // curGlow = 120
  GR.endRun(w, false);
  ok(w.over.pay.base === 40 + 40, 'payout: death keeps banked + half of unbanked', JSON.stringify(w.over.pay));
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
