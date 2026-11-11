import test from 'node:test';
import assert from 'node:assert/strict';
import { honkPilot, HONK_PILOT_UPGRADES } from './honk-pilot.js';
import { HONK } from '../src/contracts.js';
import { createHonk, stepHonk, chooseHonkUpgrade, HONK_DESKS } from '../src/sim/honk.js';

function enemy(s, extra = {}) {
  return { id: 999, x: s.player.x + 55, y: s.player.y, kind: 'worker', hp: 2, maxHp: 2, speed: 80, age: 60, stun: 0, hit: 0, cooldown: 100, ...extra };
}
test('honk cancels meetings, deletes nearby email, scores and charges reply all', () => {
  const s = createHonk(12); s.enemies = [enemy(s)]; s.papers = [{ x: 620, y: 350, vx: -100, vy: 0, ttl: 100 }];
  const events = stepHonk(s, { honk: true });
  assert.equal(s.enemies.length, 0); assert.equal(s.papers.length, 0); assert.equal(s.stats.meetings, 1); assert.equal(s.stats.emails, 1);
  assert.ok(s.score > 0); assert.ok(s.charge > 35); assert.ok(events.some(e => e.type === 'honk'));
  stepHonk(s, { honk: true }); assert.equal(s.stats.honks, 1, 'holding is rate limited');
});
test('fixed tick movement, diagonal normalization and furniture collision', () => {
  const a = createHonk(), b = createHonk(); stepHonk(a, { x: 1 }); stepHonk(b, { x: 1, y: 1 });
  assert.ok(Math.abs(Math.hypot(a.player.x - 600, a.player.y - 350) - Math.hypot(b.player.x - 600, b.player.y - 350)) < 1e-8);
  const s = createHonk(); s.player.x = 165; s.player.y = 177;
  for (let i = 0; i < 60; i++) stepHonk(s, { x: 1 });
  assert.ok(s.player.x <= HONK_DESKS[0].x - 18);
  for (let i = 0; i < 500; i++) stepHonk(s, { x: -1, y: -1, honk: true });
  assert.ok(s.player.x >= 40 && s.player.y >= 65);
});
test('contact damage has immunity and dash protects the goose', () => {
  const s = createHonk(); s.enemies = [enemy(s, { x: 600 })];
  stepHonk(s); assert.equal(s.player.hp, 5); for (let i = 0; i < 20; i++) stepHonk(s); assert.equal(s.player.hp, 5);
  const d = createHonk(); d.enemies = [enemy(d, { x: 600 })]; stepHonk(d, { dash: true }); assert.equal(d.player.hp, 6);
  assert.ok(d.player.dashCooldown > 0); assert.ok(d.player.x > 600);
});
test('coworkers navigate around desks instead of getting permanently stuck', () => {
  const s = createHonk(); s.player.x = 600; s.player.y = 178;
  s.enemies = [enemy(s, { x: 1050, y: 178, speed: 90 })];
  for (let i = 0; i < 260; i++) stepHonk(s);
  assert.ok(s.enemies.find(e => e.id === 999).x < 830, 'worker has rounded the right-hand desk');
});
test('reply all requires a full meter and is a real office-wide attack', () => {
  const s = createHonk(); s.enemies = [enemy(s, { x: 1100 })]; stepHonk(s, { reply: true }); assert.equal(s.enemies.length, 1);
  s.charge = 100; stepHonk(s, { reply: true }); assert.equal(s.enemies.length, 0); assert.equal(s.stats.replies, 1);
  assert.equal(s.props.filter(p => p.broken).length, 8); assert.ok(s.events.some(e => e.type === 'reply')); assert.ok(s.player.invulnerable > 0);
  assert.equal(s.charge, 0, 'reply all cannot fund its own next activation');
});
test('snacks heal, expire and are not collected twice', () => {
  const s = createHonk(); s.player.hp = 3; s.snacks = [{ id: 1, x: 601, y: 350, ttl: 3 }, { id: 2, x: 100, y: 100, ttl: 1 }];
  stepHonk(s); assert.equal(s.player.hp, 4); assert.equal(s.snacks.length, 0); stepHonk(s); assert.equal(s.player.hp, 4);
});
test('optional KPI grants its bonus once', () => {
  const s = createHonk(); s.player.hp = 4; s.shiftStats.objects = 3;
  stepHonk(s); assert.equal(s.score, 500); assert.equal(s.player.hp, 5); assert.equal(s.objectiveDone, true);
  stepHonk(s); assert.equal(s.score, 500);
});
test('promotion validates choices, freezes time and resets a shift', () => {
  const s = createHonk(4); assert.equal(chooseHonkUpgrade(s, 'benefits'), false);
  s.shiftTick = HONK.shiftTicks[0] - 1; stepHonk(s); assert.equal(s.phase, 'promotion'); assert.equal(s.offers.length, 3);
  const snapshot = structuredClone(s); stepHonk(s); assert.equal(s.tick, snapshot.tick); assert.equal(s.shiftTick, snapshot.shiftTick);
  assert.equal(chooseHonkUpgrade(s, 'unrecognized'), false); assert.equal(chooseHonkUpgrade(s, s.offers[0]), true);
  assert.equal(s.shift, 2); assert.equal(s.phase, 'playing'); assert.equal(s.shiftTick, 0); assert.equal(s.enemies.length, 0);
  assert.equal(chooseHonkUpgrade(s, s.upgrades[0]), false);
});
test('fatal contact ends play and terminal state cannot progress', () => {
  const s = createHonk(); s.player.hp = 1; s.enemies = [enemy(s, { x: 600 })]; stepHonk(s);
  assert.equal(s.phase, 'lost'); const tick = s.tick; stepHonk(s, { honk: true, dash: true }); assert.equal(s.tick, tick);
});
test('HR spawns in the final shift; boss defeat wins before incoming damage', () => {
  const s = createHonk(); s.shift = 3; s.shiftTick = 599; stepHonk(s); assert.equal(s.bossSpawned, true); assert.ok(s.enemies.some(e => e.kind === 'boss'));
  s.player.hp = 1; s.enemies = [enemy(s, { x: 620, kind: 'boss', hp: 1, maxHp: 38 })];
  s.papers = [{ x: 600, y: 350, vx: 0, vy: 0, ttl: 10 }]; stepHonk(s, { honk: true }); assert.equal(s.phase, 'won'); assert.equal(s.player.hp, 1);
});
test('final timeout has a clear loss state', () => {
  const s = createHonk(); s.shift = 3; s.shiftTick = HONK.shiftTicks[2] - 1; stepHonk(s); assert.equal(s.phase, 'lost'); assert.match(s.headline, /HR outlasted/);
});
test('every promotion applies its advertised benefit exactly once', () => {
  for (const id of ['megaphone', 'espresso', 'benefits', 'reply', 'legal', 'lunch']) {
    const s = createHonk(); s.phase = 'promotion'; s.offers = [id]; s.player.hp = 1;
    assert.equal(chooseHonkUpgrade(s, id), true);
    if (id === 'megaphone') { assert.equal(s.player.damage, 3); assert.equal(s.player.range, 122 * 1.35); }
    if (id === 'espresso') { assert.equal(s.player.speed, 230 * 1.18); assert.equal(s.player.honkRate, 27); }
    if (id === 'benefits') { assert.equal(s.player.maxHp, 8); assert.equal(s.player.hp, 8); }
    if (id === 'reply') { assert.equal(s.charge, 100); s.charge = 0; s.enemies = [enemy(s)]; stepHonk(s, { honk: true }); assert.equal(s.charge, 10); }
    if (id === 'legal') { assert.equal(s.player.dashRate, 50); s.enemies = [enemy(s, { x: 620 })]; stepHonk(s, { dash: true }); assert.equal(s.stats.meetings, 1); }
    if (id === 'lunch') { s.player.hp = 1; s.snacks = [{ x: s.player.x, y: s.player.y, ttl: 50 }]; stepHonk(s); assert.equal(s.player.hp, 3); }
    assert.equal(chooseHonkUpgrade(s, id), false);
  }
});

function play(seed) {
  const s = createHonk(seed);
  for (let i = 0; i < 8000 && !['won', 'lost'].includes(s.phase); i++) {
    if (s.phase === 'promotion') {
      const preferred = HONK_PILOT_UPGRADES.find(id => s.offers.includes(id));
      chooseHonkUpgrade(s, preferred);
    } else stepHonk(s, honkPilot(s));
    assert.ok(s.enemies.length <= HONK.maxEnemies); assert.ok(s.papers.length <= HONK.maxPapers); assert.ok(Number.isFinite(s.score));
  }
  return s;
}
test('seeded full playthrough is deterministic and the final boss is beatable', () => {
  const a = play(7321), b = play(7321); assert.deepEqual(a, b); assert.equal(a.phase, 'won'); assert.equal(a.shift, 3); assert.equal(a.upgrades.length, 2);
});
