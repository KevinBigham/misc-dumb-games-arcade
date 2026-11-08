import test from 'node:test';
import assert from 'node:assert/strict';
import * as sim from '../src/sim/franchise.js';
import { validateFranchise, parseFranchise } from '../src/franchise-storage.js';
import { STARTER_SLOTS } from '../src/contracts.js';

function season(s) { while (['regular', 'playoffs'].includes(s.phase)) sim.advanceWeek(s); }
function finishDraft(s) {
  while (s.phase === 'draft') {
    try { sim.draftPlayer(s, s.prospects[0].id); }
    catch (e) { assert.match(e.message, /roster and salary cap/); sim.skipDraftPick(s); }
  }
}

test('new league has 32 legal 53-man rosters, cap room, unique players and isolated seeded results', () => {
  const a = sim.createFranchise(42), b = sim.createFranchise(42), c = sim.createFranchise(43);
  assert.deepEqual(a, b); assert.notDeepEqual(a.players, c.players);
  for (const t of a.teams) { assert.equal(sim.roster(a, t.id).length, 53); assert.ok(sim.capRoom(a, t.id) >= 0); }
  assert.equal(new Set(a.players.map(p => p.id)).size, a.players.length);
  assert.doesNotThrow(() => validateFranchise(a));
});

test('rotating schedules give every club 16 games, 8 at home, 6 in division and no double bookings', () => {
  const s = sim.createFranchise();
  for (let year = 2005; year < 2017; year++) {
    s.year = year; const schedule = sim.makeSchedule(s);
    assert.equal(schedule.length, 256);
    for (const t of s.teams) {
      const games = schedule.filter(g => g.home === t.id || g.away === t.id);
      assert.equal(games.length, 16); assert.equal(new Set(games.map(g => g.week)).size, 16);
      assert.equal(games.filter(g => g.home === t.id).length, 8);
      assert.ok(!games.some(g => g.week === 9));
      assert.equal(games.filter(g => { const o = sim.getTeam(s, g.home === t.id ? g.away : g.home); return o.division === t.division && o.conference === t.conference; }).length, 6);
    }
  }
});

test('training applies once per fixed week, improves eligible players and never alters injured players', () => {
  const s = sim.createFranchise(91), p = sim.roster(s)[0]; p.injury = 2; const copy = structuredClone(p);
  const prior = sim.roster(s).map(p => ({ id: p.id, morale: p.morale, overall: p.overall }));
  sim.trainTeam(s); assert.deepEqual(p, copy);
  assert.ok(sim.roster(s).some(p => p.morale > prior.find(x => x.id === p.id).morale));
  assert.throws(() => sim.trainTeam(s), /already complete/);
  sim.advanceWeek(s); assert.doesNotThrow(() => sim.trainTeam(s));
  assert.ok(s.players.every(p => p.overall <= p.potential));
});

test('release and sign enforce roster limits, minimum depth, cap math and bonus dead money', () => {
  const s = sim.createFranchise(), free = s.players.find(p => p.teamId === null);
  assert.throws(() => sim.signPlayer(s, free.id), /53-man/);
  const p = sim.depthChart(s, s.userTeam, 'QB').at(-1), before = sim.capRoom(s), salary = p.salary, bonus = p.bonus;
  sim.releasePlayer(s, p.id);
  assert.equal(p.teamId, null); assert.equal(sim.capRoom(s), before + salary - bonus);
  sim.signPlayer(s, free.id); assert.equal(free.teamId, s.userTeam); assert.equal(sim.roster(s).length, 53);
  assert.equal(sim.capRoom(s), before + salary - bonus - sim.marketSalary(free));
  const kicker = sim.depthChart(s, s.userTeam, 'K')[0];
  assert.throws(() => sim.releasePlayer(s, kicker.id), /Keep at least/);
  assert.throws(() => sim.signPlayer(s, free.id), /free agent/);
});

test('unaffordable signing and extension fail before mutating any money or player', () => {
  const s = sim.createFranchise(), reserve = sim.depthChart(s, s.userTeam, 'QB').at(-1);
  sim.releasePlayer(s, reserve.id); s.cap = sim.payroll(s);
  const before = JSON.stringify(s), free = s.players.find(p => p.teamId === null);
  assert.throws(() => sim.signPlayer(s, free.id), /salary cap/); assert.equal(JSON.stringify(s), before);
  const p = sim.roster(s).find(p => p.years === 1); p.salary = 1; s.cap = sim.payroll(s);
  const prior = JSON.stringify(p); assert.throws(() => sim.extendPlayer(s, p.id), /cap space/); assert.equal(JSON.stringify(p), prior);
});

test('extensions preserve expiring players through rollover and the draft closes the re-sign window', () => {
  const s = sim.createFranchise(); season(s);
  const p = sim.roster(s).find(p => p.years === 1 && p.age < 30); sim.extendPlayer(s, p.id);
  assert.equal(p.years, 4); sim.beginDraft(s); assert.equal(p.years, 3); assert.equal(p.teamId, s.userTeam);
  assert.equal(s.phase, 'draft'); assert.throws(() => sim.beginDraft(s), /after the championship/);
});

test('depth changes are deterministic and missing or injured starters affect ratings', () => {
  const s = sim.createFranchise(), qbs = sim.depthChart(s, s.userTeam, 'QB');
  qbs.forEach((p, i) => { p.overall = [95, 65, 50][i]; });
  const healthy = sim.teamRatings(s).offense; qbs[0].injury = 2;
  assert.ok(sim.teamRatings(s).offense < healthy);
  assert.throws(() => sim.promotePlayer(s, qbs[0].id), /injured/);
  sim.promotePlayer(s, qbs[2].id); assert.equal(sim.depthChart(s, s.userTeam, 'QB')[0].id, qbs[2].id);
  assert.ok(sim.teamRatings(s).offense < healthy);
});

test('injuries recover during regular and playoff byes without consuming a game', () => {
  const s = sim.createFranchise();
  while (s.week < 9) sim.advanceWeek(s);
  const p = sim.roster(s)[0]; p.injury = 3; const games = p.stats.games;
  sim.advanceWeek(s); assert.equal(p.injury, 2); assert.equal(p.stats.games, games);
  while (s.phase === 'regular') sim.advanceWeek(s);
  const resting = sim.roster(s, s.playoffSeeds[0][0])[0]; resting.injury = 2;
  const count = resting.stats.games; sim.advanceWeek(s);
  assert.equal(resting.injury, 1); assert.equal(resting.stats.games, count);
});

test('trade rejection is atomic; accepted same-position swaps conserve players and book both bonuses', () => {
  const s = sim.createFranchise(); s.cap = 200000;
  const a = sim.depthChart(s, s.userTeam, 'QB')[0], b = sim.depthChart(s, 0, 'QB').at(-1);
  a.overall = 95; a.age = 23; b.overall = 55; b.age = 33;
  const total = s.players.length, aBonus = a.bonus, bBonus = b.bonus, userCap = sim.capRoom(s), otherCap = sim.capRoom(s, 0), aSalary = a.salary, bSalary = b.salary;
  sim.tradePlayers(s, a.id, b.id); assert.equal(a.teamId, 0); assert.equal(b.teamId, s.userTeam); assert.equal(s.players.length, total);
  assert.equal(sim.capRoom(s), userCap + aSalary - bSalary - aBonus);
  assert.equal(sim.capRoom(s, 0), otherCap + bSalary - aSalary - bBonus);
  const snapshot = JSON.stringify(s); assert.throws(() => sim.tradePlayers(s, b.id, a.id), /declined/); assert.equal(JSON.stringify(s), snapshot);
  s.week = 9; assert.throws(() => sim.tradePlayers(s, b.id, a.id), /deadline/);
});

test('owner economics charge integer money, honor cash limits and model ticket demand', () => {
  const s = sim.createFranchise(), t = sim.getTeam(s), before = t.cash, fans = sim.attendance(t);
  sim.setTicketPrice(s, 150); assert.ok(sim.attendance(t) < fans);
  assert.throws(() => sim.setTicketPrice(s, 151), /between/);
  sim.upgradeFacility(s); assert.equal(t.cash, before - 15000); assert.equal(t.stadium, 2);
  const coach = t.coach; sim.upgradeCoach(s); assert.equal(t.cash, before - 23000); assert.equal(t.coach, coach + 5);
  t.cash = 0; assert.throws(() => sim.upgradeFacility(s), /cash/); assert.throws(() => sim.upgradeCoach(s), /cash/);
  sim.advanceWeek(s); assert.ok(Number.isSafeInteger(t.revenue)); assert.ok(Number.isSafeInteger(t.expenses));
});

test('full season has balanced records, 12 playoff qualifiers, 11 playoff games and a real champion', () => {
  const s = sim.createFranchise();
  while (s.phase === 'regular') sim.advanceWeek(s);
  assert.equal(s.week, 18); assert.equal(s.playoffSeeds.flat().length, 12);
  assert.equal(s.teams.reduce((sum, t) => sum + t.wins, 0), 256);
  assert.equal(s.teams.reduce((sum, t) => sum + t.losses, 0), 256);
  for (const t of s.teams) assert.equal(t.wins + t.losses, 16);
  for (const [i, c] of ['Atlantic', 'Pacific'].entries()) {
    for (const division of ['East', 'North', 'South', 'West']) assert.ok(s.playoffSeeds[i].slice(0, 4).includes(sim.standings(s, c, division)[0].id));
    const wildcards = s.schedule.filter(g => g.week === 18).flatMap(g => [g.home, g.away]);
    for (const id of s.playoffSeeds[i].slice(0, 2)) assert.ok(!wildcards.includes(id));
  }
  season(s); const games = s.schedule.filter(g => g.playoff), final = games.at(-1);
  assert.equal(games.length, 11); assert.ok(games.every(g => g.played && g.homeScore !== g.awayScore));
  assert.equal(s.history[0].champion, final.homeScore > final.awayScore ? final.home : final.away);
  assert.doesNotThrow(() => validateFranchise(s));
});

test('save round-trip at midseason reproduces the same future games, injuries and progression', () => {
  const a = sim.createFranchise(677);
  for (let i = 0; i < 5; i++) { sim.trainTeam(a); sim.advanceWeek(a); }
  const b = parseFranchise(JSON.stringify(a)); season(a); season(b); assert.deepEqual(a, b);
  sim.beginDraft(a); sim.beginDraft(b); finishDraft(a); finishDraft(b); sim.startSeason(a); sim.startSeason(b);
  assert.deepEqual(a, b);
});

test('seven-round draft assigns unique rookies, enforces scouting budget and rolls into a clean season', () => {
  const s = sim.createFranchise();
  for (const p of s.prospects.slice(0, 8)) sim.scoutPlayer(s, p.id);
  assert.throws(() => sim.scoutPlayer(s, s.prospects[8].id), /No scouting/);
  assert.throws(() => sim.scoutPlayer(s, s.prospects[0].id), /unscouted/);
  season(s); sim.beginDraft(s); finishDraft(s);
  assert.equal(s.draft.cursor, 224); assert.equal(s.draft.picks.length, 224); assert.equal(s.phase, 'preseason');
  const picks = s.draft.picks.filter(p => p.playerId); assert.equal(new Set(picks.map(p => p.playerId)).size, picks.length);
  const userPicks = picks.filter(p => p.teamId === s.userTeam); assert.equal(userPicks.length, 7);
  for (const pick of userPicks) { const p = sim.getPlayer(s, pick.playerId); assert.equal(p.teamId, s.userTeam); assert.equal(p.years, 4); }
  sim.startSeason(s); assert.equal(s.year, 2006); assert.equal(s.scoutingPoints, 8); assert.equal(s.prospects.length, 280);
  assert.ok(s.teams.every(t => t.wins === 0 && t.losses === 0)); assert.ok(s.players.every(p => p.stats.games === 0));
  assert.doesNotThrow(() => validateFranchise(s));
});

test('rating advantage produces favored teams, while scoring remains variable and football-sized', () => {
  let favorites = 0, count = 0; const scores = [];
  for (let seed = 1; seed <= 20; seed++) {
    const s = sim.createFranchise(seed); const week = s.schedule.filter(g => g.week === 1);
    const homeIds = new Set(week.map(g => g.home));
    for (const p of s.players) if (p.teamId !== null) { p.overall = homeIds.has(p.teamId) ? 95 : 55; p.potential = 99; p.morale = 75; }
    sim.advanceWeek(s);
    for (const g of week) { favorites += Number(g.homeScore > g.awayScore); count++; scores.push(g.homeScore, g.awayScore); }
  }
  assert.ok(favorites / count > .8, `favorite rate: ${favorites / count}`);
  const mean = scores.reduce((a, n) => a + n, 0) / scores.length;
  assert.ok(mean > 15 && mean < 40, `mean score: ${mean}`); assert.ok(new Set(scores).size > 20); assert.ok(scores.every(n => n >= 0 && n <= 87));
});

test('a decade-long career preserves valid saves, roster/cap bounds, records, history and deterministic continuation', { timeout: 120000 }, () => {
  let s = sim.createFranchise(101);
  for (let i = 0; i < 10; i++) {
    season(s); validateFranchise(s); sim.beginDraft(s); finishDraft(s); sim.startSeason(s); validateFranchise(s);
    for (const t of s.teams) { assert.ok(sim.roster(s, t.id).length <= 53); assert.ok(sim.capRoom(s, t.id) >= 0); }
    assert.ok(s.players.length <= 2046); assert.equal(s.history.length, i + 1);
    s = parseFranchise(JSON.stringify(s));
  }
  assert.equal(s.year, 2015); const copy = parseFranchise(JSON.stringify(s));
  sim.advanceWeek(s); sim.advanceWeek(copy); assert.deepEqual(s, copy);
  assert.ok(sim.roster(s).every(p => p.age < 39));
  for (const position of Object.keys(STARTER_SLOTS)) assert.ok(sim.depthChart(s, s.userTeam, position).length >= STARTER_SLOTS[position]);
});
