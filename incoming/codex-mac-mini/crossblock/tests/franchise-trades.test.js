import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as sim from '../src/sim/franchise.js';
import { parseFranchise, validateFranchise } from '../src/franchise-storage.js';
import { shell, tradeDialog } from '../src/franchise-view.js';

function fixture() {
  const s = sim.createFranchise(2005); s.cap = 200000;
  const a = sim.depthChart(s, s.userTeam, 'QB').at(-1), b = sim.depthChart(s, 0, 'QB').at(-1);
  Object.assign(a, { overall: 95, potential: 99, age: 23, salary: 3000, bonus: 600, years: 4 });
  Object.assign(b, { overall: 55, potential: 65, age: 33, salary: 1000, bonus: 200, years: 1 });
  return { s, a, b };
}
function openSpot(s, id, position = 'WR') {
  const user = s.userTeam; s.userTeam = id;
  sim.releasePlayer(s, sim.depthChart(s, id, position).at(-1).id); s.userTeam = user;
}
function rejectWithoutChanges(s, outgoing, incoming, pattern) {
  const before = JSON.stringify(s), preview = sim.evaluateTrade(s, outgoing, incoming);
  assert.equal(preview.accepted, false);
  assert.throws(() => sim.tradePackage(s, outgoing, incoming), pattern);
  assert.equal(JSON.stringify(s), before);
}

test('package previews are deterministic, read-only, and project exact cap charges for both clubs', () => {
  const { s, a, b } = fixture(), before = JSON.stringify(s);
  const r = sim.evaluateTrade(s, [a.id], [b.id]);
  assert.equal(r.accepted, true); assert.equal(r.partnerId, 0);
  assert.deepEqual(r, sim.evaluateTrade(s, [a.id], [b.id])); assert.equal(JSON.stringify(s), before);
  assert.equal(r.teams[0].capAfter, sim.capRoom(s) + 3000 - 1000 - 600);
  assert.equal(r.teams[1].capAfter, sim.capRoom(s, 0) + 1000 - 3000 - 200);
  assert.equal(r.teams[0].deadCapAdded, 600); assert.equal(r.teams[1].deadCapAdded, 200);
});

test('cross-position packages trade two players for one when the receiving club has room', () => {
  const { s, a, b } = fixture(); openSpot(s, 0);
  const c = sim.depthChart(s, s.userTeam, 'WR').at(-1), rng = s.rngState;
  const ids = s.players.map(p => p.id).sort(), stats = structuredClone(a.stats), salary = a.salary, years = a.years;
  const r = sim.evaluateTrade(s, [a.id, c.id], [b.id]); assert.equal(r.accepted, true);
  sim.tradePackage(s, [a.id, c.id], [b.id]);
  assert.equal(a.teamId, 0); assert.equal(c.teamId, 0); assert.equal(b.teamId, s.userTeam);
  assert.equal(sim.roster(s).length, 52); assert.equal(sim.roster(s, 0).length, 53);
  assert.deepEqual(s.players.map(p => p.id).sort(), ids); assert.equal(s.rngState, rng);
  assert.deepEqual(a.stats, stats); assert.equal(a.salary, salary); assert.equal(a.years, years);
  assert.equal(a.bonus, 0); assert.equal(b.bonus, 0); assert.equal(c.bonus, 0);
  for (const t of r.teams) assert.equal(sim.capRoom(s, t.teamId), t.capAfter);
  assert.equal(sim.depthChart(s, 0, 'QB').at(-1).id, a.id);
  validateFranchise(s);
});

test('one-for-two and three-for-three packages support different positions and normalize depth', () => {
  for (const count of [1, 3]) {
    const { s, a, b } = fixture();
    const outgoing = [a, ...sim.roster(s).filter(p => ['WR', 'RB'].includes(p.position)).slice(0, 2)].slice(0, count);
    const incoming = [b, sim.depthChart(s, 0, 'WR').at(-1), sim.depthChart(s, 0, 'RB').at(-1)].slice(0, count === 1 ? 2 : 3);
    for (const p of outgoing) Object.assign(p, { overall: 99, potential: 99, age: 23, years: 4, salary: 1000 });
    for (const p of incoming) Object.assign(p, { overall: 50, age: 34, years: 1, salary: 1000 });
    if (count === 1) openSpot(s, s.userTeam);
    sim.tradePackage(s, outgoing.map(p => p.id), incoming.map(p => p.id));
    for (const id of [s.userTeam, 0]) for (const pos of ['QB', 'RB', 'WR']) {
      assert.deepEqual(sim.depthChart(s, id, pos).map(p => p.depth), sim.depthChart(s, id, pos).map((_, i) => i));
    }
    validateFranchise(s);
  }
});

test('the same package in a different selection order produces an identical save', () => {
  const { s, a, b } = fixture(), c = sim.depthChart(s, s.userTeam, 'WR').at(-1), d = sim.depthChart(s, 0, 'WR').at(-1);
  const copy = structuredClone(s);
  sim.tradePackage(s, [a.id, c.id], [b.id, d.id]); sim.tradePackage(copy, [c.id, a.id], [d.id, b.id]);
  assert.deepEqual(s, copy);
});

test('malformed, duplicate, missing, free-agent, prospect, own-team and mixed-team selections are atomic rejections', () => {
  const { s, a, b } = fixture(), free = s.players.find(p => p.teamId === null), third = sim.roster(s, 1)[0];
  for (const [outgoing, incoming] of [
    [null, [b.id]], [[a.id], null], [a.id, [b.id]], [[], [b.id]], [[a.id], []],
    [[a.id, a.id], [b.id]], [[a.id], [b.id, b.id]], [[a.id], [a.id]],
    [[a.id, ...sim.roster(s).slice(0, 3).map(p => p.id)], [b.id]], [[null], [b.id]],
    [['p99999999'], [b.id]], [[a.id], [free.id]], [[a.id], [s.prospects[0].id]], [[a.id], [b.id, third.id]], [[b.id], [a.id]],
  ]) rejectWithoutChanges(s, outgoing, incoming, /Choose/);
});

test('roster limits are enforced for either receiving team before transfers', () => {
  const { s, a, b } = fixture(), c = sim.depthChart(s, s.userTeam, 'WR').at(-1), d = sim.depthChart(s, 0, 'WR').at(-1);
  rejectWithoutChanges(s, [a.id, c.id], [b.id], /54 players/);
  rejectWithoutChanges(s, [a.id], [b.id, d.id], /54 players/);
});

test('neither team can trade away required positional depth even for an otherwise valuable package', () => {
  const { s, a, b } = fixture();
  rejectWithoutChanges(s, [sim.depthChart(s, s.userTeam, 'K')[0].id], [b.id], /at least 1 K/);
  rejectWithoutChanges(s, [a.id], [sim.depthChart(s, 0, 'P')[0].id], /at least 1 P/);
  rejectWithoutChanges(s, sim.depthChart(s, s.userTeam, 'QB').map(p => p.id), [b.id], /55 players/);
});

test('existing shortages may remain, but trading cannot worsen them', () => {
  const { s, a, b } = fixture();
  const linemen = sim.depthChart(s, s.userTeam, 'OL');
  for (const p of linemen.slice(2)) Object.assign(p, { teamId: null, years: 0 });
  assert.equal(sim.evaluateTrade(s, [a.id], [b.id]).accepted, true);
  rejectWithoutChanges(s, [a.id, linemen[0].id], [b.id], /at least 2 OL/);
});

test('both clubs must afford incoming salaries and their own dead money, down to the last thousand', () => {
  for (const id of [0, 4]) {
    const { s, a, b } = fixture();
    const initial = sim.evaluateTrade(s, [a.id], [b.id]).teams.find(t => t.teamId === id);
    sim.getTeam(s, id).deadCap += initial.capAfter;
    assert.equal(sim.evaluateTrade(s, [a.id], [b.id]).accepted, true, 'exactly zero cap room is legal');
    sim.getTeam(s, id).deadCap += 1;
    rejectWithoutChanges(s, [a.id], [b.id], /over the salary cap by \$0\.001M/);
  }
});

test('evaluations expire naturally: execution rechecks deadline and revised contracts', () => {
  for (const mutate of [s => { s.week = 9; }, s => { sim.getTeam(s).deadCap = s.cap; }]) {
    const { s, a, b } = fixture(); assert.equal(sim.evaluateTrade(s, [a.id], [b.id]).accepted, true);
    mutate(s); rejectWithoutChanges(s, [a.id], [b.id], /deadline|salary cap/);
  }
});

test('trade window includes week eight, offseason and preseason, but excludes playoffs and draft', () => {
  const { s, a, b } = fixture();
  s.week = 8; assert.equal(sim.evaluateTrade(s, [a.id], [b.id]).accepted, true);
  for (const phase of ['offseason', 'preseason']) { s.phase = phase; assert.equal(sim.evaluateTrade(s, [a.id], [b.id]).accepted, true); }
  for (const phase of ['playoffs', 'draft']) { s.phase = phase; rejectWithoutChanges(s, [a.id], [b.id], /Trading is closed/); }
});

test('a starter upgrade has more offer value than the same player joining a stacked position', () => {
  const { s, a } = fixture(), target = sim.depthChart(s, 0, 'WR').at(-1);
  for (const p of sim.depthChart(s, 0, 'QB')) p.overall = 60;
  const needed = sim.evaluateTrade(s, [a.id], [target.id]);
  for (const p of sim.depthChart(s, 0, 'QB')) p.overall = 99;
  const depth = sim.evaluateTrade(s, [a.id], [target.id]);
  assert.ok(needed.offeredValue > depth.offeredValue);
  assert.equal(needed.offerDetails[0].role, 'Starter upgrade'); assert.equal(depth.offerDetails[0].role, 'Depth addition');
});

test('three low-grade reserves cannot buy an elite young starter', () => {
  const { s, b } = fixture(); openSpot(s, 0); openSpot(s, 0);
  const outgoing = ['QB', 'WR', 'RB'].map(pos => sim.depthChart(s, s.userTeam, pos).at(-1));
  outgoing.forEach(p => Object.assign(p, { overall: 55, age: 33, salary: 1000, years: 1 }));
  Object.assign(b, { overall: 98, potential: 99, age: 22, years: 4, salary: 3000 });
  rejectWithoutChanges(s, outgoing.map(p => p.id), [b.id], /Trade declined/);
  assert.ok(sim.evaluateTrade(s, outgoing.map(p => p.id), [b.id]).gap > 100);
});

test('traded contracts do not charge the same bonus twice', () => {
  const { s, a, b } = fixture(); sim.tradePackage(s, [a.id], [b.id]);
  const oldDead = sim.getTeam(s).deadCap;
  const c = sim.depthChart(s, 1, 'QB').at(-1);
  Object.assign(b, { overall: 99, potential: 99, age: 22, salary: 1000, years: 4 });
  Object.assign(c, { overall: 50, age: 34, salary: 1000, years: 1 });
  sim.tradePackage(s, [b.id], [c.id]); assert.equal(sim.getTeam(s).deadCap, oldDead);
});

test('a package made from the original v1 fixture saves and continues deterministically', async () => {
  const s = parseFranchise(await readFile(new URL('./fixtures/franchise-v1.json', import.meta.url), 'utf8'));
  const a = sim.depthChart(s, s.userTeam, 'QB')[0], b = sim.depthChart(s, 0, 'QB').at(-1);
  const beforeKeys = Object.keys(s).sort(); sim.tradePackage(s, [a.id], [b.id]);
  assert.deepEqual(Object.keys(s).sort(), beforeKeys); assert.equal(s.version, 1);
  const copy = parseFranchise(JSON.stringify(s)); sim.advanceWeek(s); sim.advanceWeek(copy); assert.deepEqual(s, copy);
});

test('trade templates escape names and render previews without touching campaign or UI selections', () => {
  const { s, a, b } = fixture(), payload = '<img src=x onerror=alert(1)>'; a.name = payload;
  const ui = { view: 'transactions', market: 'trade', search: '', position: 'all', tradeTeam: 0, tradeOutgoing: [a.id], tradeIncoming: [b.id] };
  const before = JSON.stringify(s), beforeUI = JSON.stringify(ui);
  for (const html of [shell(s, ui, { writable: true }), tradeDialog(s, [a.id], [b.id])]) {
    assert.ok(!html.includes(payload)); assert.ok(html.includes('&lt;img'));
    assert.match(html, /New dead cap/); assert.match(html, /\$600,000/);
  }
  sim.teamNeeds(s); assert.equal(JSON.stringify(s), before); assert.equal(JSON.stringify(ui), beforeUI);
});
