import test from 'node:test';
import assert from 'node:assert/strict';
import { createHonk, stepHonk, continueHonkOvertime, chooseHonkUpgrade } from '../src/sim/honk.js';
import { HONK } from '../src/contracts.js';
import { HONK_AWARDS, earnedHonkAwards, honkReview } from '../src/sim/honk-content.js';
import { parseHonkOffice, honkDailyOffice } from '../src/honk/ui-utils.js';

function worker(id, x, y, extra = {}) {
  return { id, x, y, kind: 'worker', hp: 20, maxHp: 20, speed: 0, age: 40, stun: 0, hit: 0, cooldown: 150, windup: 0, chargeTicks: 0, chargeX: 0, chargeY: 0, ...extra };
}
function chair(x, y, extra = {}) { return { id: 1, x, y, vx: 0, vy: 0, spin: 0, hitIds: [], chain: 0, launchTick: -1, ...extra }; }
test('a honked chair rolls, damages multiple coworkers, and counts a strike', () => {
  const s = createHonk(); s.player.x = 450; s.player.y = 350;
  s.chairs = [chair(500, 350)]; s.enemies = [worker(99, 655, 350), worker(100, 685, 350), worker(101, 715, 350)];
  stepHonk(s, { honk: true }); assert.ok(s.chairs[0].vx > 600);
  for (let i = 0; i < 45; i++) stepHonk(s);
  assert.equal(s.stats.chairHits, 3); assert.equal(s.stats.bestChairChain, 3);
  assert.ok(s.enemies.filter(e => e.id >= 99).every(e => e.hp === 17));
  assert.ok(earnedHonkAwards(s).includes('strike'));
});
test('resting chairs are harmless and one launch cannot repeatedly hit the same target', () => {
  const s = createHonk(); s.chairs = [chair(700, 350)]; s.enemies = [worker(100, 700, 350)];
  stepHonk(s); assert.equal(s.enemies[0].hp, 20);
  s.chairs[0].vx = 120; stepHonk(s); assert.equal(s.enemies[0].hp, 17);
  s.chairs[0].x = s.enemies[0].x; s.chairs[0].y = s.enemies[0].y;
  stepHonk(s); assert.equal(s.enemies[0].hp, 17);
});
test('chair perk doubles damage and reduces friction', () => {
  const a = createHonk(), b = createHonk(); b.upgrades.push('bowling');
  for (const s of [a, b]) { s.chairs = [chair(700, 350, { vx: 500 })]; s.enemies = [worker(100, 715, 350)]; stepHonk(s); }
  assert.equal(a.enemies[0].hp, 17); assert.equal(b.enemies[0].hp, 14); assert.ok(b.chairs[0].vx > a.chairs[0].vx);
});
test('chair impacts respect walls and desk boundaries', () => {
  const s = createHonk(); s.chairs = [chair(1159, 330, { vx: 600 }), chair(840, 175, { vx: 600 })];
  stepHonk(s); assert.ok(s.chairs[0].x <= 1160); assert.ok(s.chairs[0].vx < 0); assert.ok(s.chairs[1].x <= 844); assert.ok(s.chairs[1].vx < 0);
});
test('a chair killing HR wins before an incoming email can kill the goose', () => {
  const s = createHonk(); s.shift = 3; s.player.hp = 1;
  s.chairs = [chair(695, 350, { vx: 300 })]; s.enemies = [worker(99, 710, 350, { kind: 'boss', hp: 2, maxHp: 54, bossPhase: 3 })];
  s.papers = [{ x: 600, y: 350, vx: 0, vy: 0, ttl: 10 }]; stepHonk(s);
  assert.equal(s.phase, 'won'); assert.equal(s.player.hp, 1); assert.equal(s.stats.bosses, 1);
});
test('first shift pizza is scheduled, heals two, and expires', () => {
  const s = createHonk(); s.shiftTick = 599; stepHonk(s);
  assert.equal(s.incident.id, 'pizza'); assert.equal(s.snacks.filter(n => n.kind === 'pizza').length, 3);
  const pizza = s.snacks.find(n => n.kind === 'pizza'); s.player.hp = 2; s.player.x = pizza.x; s.player.y = pizza.y; stepHonk(s);
  assert.equal(s.player.hp, 4); assert.equal(s.stats.lunches, 1);
  s.incident.remaining = 1; stepHonk(s); assert.equal(s.incident, null);
});
test('meeting zones telegraph without damage, then activate; dash protects', () => {
  const s = createHonk(); s.stamps = [{ id: 1, x: 600, y: 350, delay: 2, totalDelay: 2, ttl: 40, radius: 78, impact: false }];
  stepHonk(s); stepHonk(s); assert.equal(s.player.hp, 6);
  stepHonk(s); assert.equal(s.player.hp, 5); assert.ok(s.events.some(e => e.type === 'stamp'));
  s.player.invulnerable = 0; stepHonk(s, { dash: true }); assert.equal(s.player.hp, 5);
});
test('the second shift creates bounded meetings and reply all clears their danger', () => {
  const s = createHonk(); s.shift = 2; s.shiftTick = 599; stepHonk(s);
  assert.equal(s.incident.id, 'meeting'); assert.equal(s.stamps.length, 3); assert.ok(s.stamps.every(m => m.delay >= 99));
  s.charge = 100; stepHonk(s, { reply: true }); assert.equal(s.stamps.length, 0); assert.equal(s.charge, 0);
});
test('storm email fans respect projectile caps and honking charges the special', () => {
  const s = createHonk(); s.incident = { id: 'storm', remaining: 100 };
  s.enemies = [worker(99, 850, 350, { kind: 'email', cooldown: 1 })]; stepHonk(s); assert.equal(s.papers.length, 3);
  s.papers = [{ id: 1, x: 610, y: 350, vx: 0, vy: 0, ttl: 10 }]; stepHonk(s, { honk: true }); assert.equal(s.charge, 37);
  s.papers = Array.from({ length: HONK.maxPapers }, (_, id) => ({ id, x: 1000, y: 600, vx: 0, vy: 0, ttl: 20 })); s.enemies[0].cooldown = 1;
  stepHonk(s); assert.equal(s.papers.length, HONK.maxPapers);
});
test('security locks its charge direction and honking interrupts it', () => {
  const s = createHonk(); s.enemies = [worker(99, 800, 350, { kind: 'security', cooldown: 0, speed: 90 })];
  stepHonk(s); const e = s.enemies[0]; assert.equal(e.windup, 45); assert.equal(e.chargeX, -1); assert.equal(e.chargeY, 0);
  s.player.y = 250; for (let i = 0; i < 44; i++) stepHonk(s); assert.equal(e.chargeTicks, 32); assert.equal(e.chargeY, 0);
  const x = e.x; stepHonk(s); assert.equal(e.x, x - 7);
  s.player.x = e.x - 70; s.player.y = e.y; stepHonk(s, { honk: true }); assert.equal(e.chargeTicks, 0); assert.ok(e.stun > 0);
});
test('security crashing into furniture is stunned instead of clipping through it', () => {
  const s = createHonk(); s.enemies = [worker(99, 839, 178, { kind: 'security', chargeTicks: 30, chargeX: 1 })];
  for (let i = 0; i < 3; i++) stepHonk(s);
  assert.equal(s.enemies[0].chargeTicks, 0); assert.ok(s.enemies[0].stun > 0); assert.ok(s.enemies[0].x <= 846);
});
test('boss health thresholds announce phases and later attacks mark the player position', () => {
  const s = createHonk(); s.shift = 3; s.enemies = [worker(99, 680, 350, { kind: 'boss', hp: 33, maxHp: 54, bossPhase: 1, cooldown: 1 })];
  stepHonk(s, { honk: true }); const boss = s.enemies[0]; assert.equal(boss.bossPhase, 2); assert.ok(s.events.some(e => e.type === 'boss-phase'));
  assert.equal(s.stamps.length, 1); assert.ok(s.stamps[0].delay >= 89);
  boss.hp = 14; s.player.honkCooldown = 0; stepHonk(s, { honk: true }); assert.equal(boss.bossPhase, 3);
});
test('the final boss still arrives when all ordinary enemy slots are full', () => {
  const s = createHonk(); s.shift = 3; s.shiftTick = 598; s.enemies = Array.from({ length: HONK.maxEnemies - 1 }, (_, i) => worker(i + 100, 100, 560));
  stepHonk(s); stepHonk(s); assert.equal(s.bossSpawned, true); assert.equal(s.enemies.length, HONK.maxEnemies);
});
test('overtime is an explicit post-win action and retains earned powers and score', () => {
  const s = createHonk(); assert.equal(continueHonkOvertime(s), false); s.shift = 3; s.phase = 'won'; s.score = 12345; s.upgrades = ['megaphone']; s.player.hp = 1;
  assert.equal(continueHonkOvertime(s), true); assert.equal(s.overtime, 1); assert.equal(s.phase, 'playing'); assert.equal(s.player.hp, 6); assert.equal(s.charge, 100); assert.equal(s.score, 12345); assert.deepEqual(s.upgrades, ['megaphone']);
  s.shiftTick = 239; stepHonk(s); assert.ok(s.enemies.some(e => e.kind === 'boss' && e.maxHp === 64)); assert.equal(continueHonkOvertime(s), false);
});
test('casual Friday adds health and makes hazards slower without changing scoring rules', () => {
  const a = createHonk(44), b = createHonk(44, { mode: 'casual' }); assert.equal(a.player.hp, 6); assert.equal(b.player.hp, 9);
  for (const s of [a, b]) { s.shift = 3; s.shiftTick = 599; stepHonk(s); }
  const aBoss = a.enemies.find(e => e.kind === 'boss'), bBoss = b.enemies.find(e => e.kind === 'boss'); assert.ok(bBoss.speed < aBoss.speed); assert.ok(bBoss.hp < aBoss.hp);
  assert.equal(createHonk(1, { mode: 'invalid' }).mode, 'career');
});
test('new upgrades validate and union protection has a measurable effect', () => {
  const s = createHonk(); s.phase = 'promotion'; s.offers = ['union']; chooseHonkUpgrade(s, 'union'); assert.equal(s.player.maxHp, 7);
  s.player.invulnerable = 0; s.enemies = [worker(99, 600, 350)]; stepHonk(s); assert.equal(s.enemies[0].stun, 100);
  const u = createHonk(); u.upgrades.push('unsubscribe'); u.papers = [{ x: 610, y: 350, vx: 0, vy: 0, ttl: 20 }]; stepHonk(u, { honk: true }); assert.equal(u.charge, 39);
});
test('expired snacks cannot revive a goose or increment lunch stats', () => {
  const s = createHonk(); s.player.hp = 2; s.snacks = [{ x: 600, y: 350, ttl: 1 }]; stepHonk(s); assert.equal(s.player.hp, 2); assert.equal(s.stats.lunches, 0);
});
test('office codes strictly validate and daily seeds are stable for a local date', () => {
  assert.deepEqual(parseHonkOffice(' G-7321-F '), { seed: 7321, mode: 'casual' }); assert.deepEqual(parseHonkOffice('0'), { seed: 0, mode: 'career' });
  for (const value of ['-1', 'G-4294967296-C', 'G-4-Z', '<script>', '1.2', 'Infinity']) assert.equal(parseHonkOffice(value), null);
  const a = honkDailyOffice(new Date(2026, 10, 8, 0)), b = honkDailyOffice(new Date(2026, 10, 8, 23)), c = honkDailyOffice(new Date(2026, 10, 9));
  assert.deepEqual(a, b); assert.notEqual(a.seed, c.seed); assert.equal(a.day, '2026-11-08');
});
test('performance reviews and award evaluation do not mutate simulation', () => {
  const s = createHonk(); s.stats.bosses = 3; s.stats.chairHits = 20; s.stats.bestChairChain = 4; s.stats.lunches = 15; s.stats.meetings = 55; s.stats.replies = 3; s.bestCombo = 21; s.shift = 3;
  const before = structuredClone(s); assert.equal(earnedHonkAwards(s).length, HONK_AWARDS.length); assert.equal(honkReview(s).minutesReturned, 1650); assert.deepEqual(s, before);
});
