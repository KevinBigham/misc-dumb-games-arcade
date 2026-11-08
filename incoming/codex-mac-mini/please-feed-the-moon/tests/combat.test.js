import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, stepWorld } from '../src/sim/world.js';
import { damageEnemy, damagePlayer, spawnProjectile, updateEnemies } from '../src/sim/combat.js';
import { MAX_PROJECTILES } from '../src/contracts.js';

const enemy = (id, x, y, hp = 40) => ({id, kind: 'chaser', x, y, prevX: x, prevY: y, aim: 0, hp, maxHp: hp, radius: 13, spawnTicks: 0, attackTicks: 0, chargeTicks: 0, targetX: x, targetY: y});
test('movement normalizes diagonals and clamps to the circular arena', () => {
  const a = createWorld(1), b = createWorld(1);
  stepWorld(a, {moveX: 1}); stepWorld(b, {moveX: 1, moveY: 1});
  assert.ok(Math.abs(Math.hypot(b.player.x - 640, b.player.y - 360) - (a.player.x - 640)) < 1e-9);
  for (let i = 0; i < 200; i++) stepWorld(a, {moveX: 1});
  assert.ok(Math.hypot(a.player.x - 640, a.player.y - 360) <= 310 - a.player.radius + 1e-9);
});
test('swept shots hit targets crossed between frames and award each kill once', () => {
  const w = createWorld(1); w.enemies = [enemy(100, 700, 360, 20)];
  spawnProjectile(w, {x: 640, y: 360, dx: 1, dy: 0, speed: 12000, damage: 20, pierce: 1}, 'player');
  const events = stepWorld(w, {});
  assert.equal(w.stats.kills, 1); assert.equal(w.score, 100);
  assert.equal(events.filter(e => e.type === 'kill').length, 1);
  stepWorld(w, {}); assert.equal(w.stats.kills, 1);
});
test('piercing shots cannot damage the same target twice', () => {
  const w = createWorld(1); w.enemies = [enemy(100, 690, 360, 100)];
  spawnProjectile(w, {x: 680, y: 360, dx: 1, dy: 0, speed: 60, damage: 20, pierce: 3}, 'player');
  for (let i = 0; i < 10; i++) stepWorld(w, {});
  assert.equal(w.enemies[0].hp, 80);
});
test('dash protects briefly, expires, and respects cooldown', () => {
  const w = createWorld(1);
  stepWorld(w, {dashPressed: true, moveX: 1});
  assert.ok(w.player.dashTicks > 0); assert.ok(w.player.invulnTicks > 0);
  for (let i = 0; i < 10; i++) stepWorld(w, {});
  assert.equal(w.player.dashTicks, 0); assert.equal(w.player.invulnTicks, 0);
  const events = stepWorld(w, {dashPressed: true});
  assert.equal(events.some(e => e.type === 'dash'), false);
});
test('projectile budget reserves space for the player and never exceeds cap', () => {
  const w = createWorld(1), shot = {x: 640, y: 360, dx: 1, dy: 0, speed: 1, damage: 1, pierce: 0};
  for (let i = 0; i < MAX_PROJECTILES + 10; i++) spawnProjectile(w, shot, 'enemy');
  assert.ok(w.projectiles.length < MAX_PROJECTILES);
  assert.ok(spawnProjectile(w, shot, 'player'));
  for (let i = 0; i < MAX_PROJECTILES + 10; i++) spawnProjectile(w, shot, 'echo');
  assert.ok(w.projectiles.length <= MAX_PROJECTILES);
});
test('kills advance sequential recharge once and damage accounting caps at remaining health', () => {
  const w = createWorld(1); w.player.forkCharges = 0; w.player.forkRechargeTicks = 15;
  const target = enemy(100, 700, 360, 5), events = [];
  damageEnemy(w, target, 500, 'echo', events); damageEnemy(w, target, 500, 'echo', events);
  assert.equal(w.stats.damageDealt, 5); assert.equal(w.stats.echoKills, 1);
  assert.equal(w.player.forkCharges, 1); assert.equal(w.player.forkRechargeTicks, 360);
});
test('consecutive kills within two seconds raise the combo each ten kills until timeout', () => {
  const w = createWorld(1);
  for (let i = 0; i < 10; i++) {w.tick = i * 100; damageEnemy(w, enemy(i, 0, 0, 1), 1, 'player', []);}
  assert.equal(w.multiplier, 2);
  w.tick += 100; damageEnemy(w, enemy(50, 0, 0, 1), 1, 'player', []);
  assert.equal(w.multiplier, 2);
  for (let i = 0; i < 9; i++) damageEnemy(w, enemy(60 + i, 0, 0, 1), 1, 'player', []);
  assert.equal(w.multiplier, 3);
  for (let i = 0; i < 121; i++) stepWorld(w, {});
  assert.equal(w.multiplier, 1);
});
test('a tenth kill at exactly 120 ticks preserves the streak and idle expiration waits until tick 121', () => {
  const w = createWorld(1); w.nextSpawnTick = Infinity;
  const killOnNextStep = id => {
    w.enemies = [enemy(id, 700, 360, 1)];
    spawnProjectile(w, {x: 640, y: 360, dx: 1, dy: 0, speed: 12000, damage: 1, pierce: 0}, 'player');
    return stepWorld(w, {});
  };
  for (let i = 0; i < 9; i++) killOnNextStep(1000 + i);
  const ninthKillTick = w.tick;
  for (let i = 0; i < 119; i++) stepWorld(w, {});
  const events = killOnNextStep(1009);
  assert.equal(w.tick - ninthKillTick, 120);
  assert.equal(w.streakKills, 10); assert.equal(w.multiplier, 2);
  assert.equal(events.find(event => event.type === 'kill').amount, 200);
  assert.equal(w.score, 1100);
  for (let i = 0; i < 120; i++) stepWorld(w, {});
  assert.equal(w.streakKills, 10); assert.equal(w.multiplier, 2);
  stepWorld(w, {});
  assert.equal(w.streakKills, 0); assert.equal(w.multiplier, 1);
  assert.equal(w.comboTicks, 0); assert.deepEqual(w.killTicks, []);
});
test('player damage is bounded by health and one hit per immunity window', () => {
  const w = createWorld(1), events = []; w.player.hp = 6;
  assert.ok(damagePlayer(w, 20, events)); assert.equal(damagePlayer(w, 20, events), false);
  assert.equal(w.player.hp, 0); assert.equal(events.length, 1); assert.equal(events[0].amount, 6);
});
test('sentries emit a readable three-shot fan and respect their attack interval', () => {
  const w = createWorld(1), sentry = {...enemy(100, 800, 360, 60), kind: 'sentry'};
  w.enemies.push(sentry); const events = []; updateEnemies(w, events);
  assert.equal(w.projectiles.length, 3);
  const angles = w.projectiles.map(projectile => Math.atan2(projectile.vy, projectile.vx));
  assert.ok(Math.abs(Math.cos(angles[0] - angles[1]) - Math.cos(0.12)) < 1e-9);
  assert.ok(Math.abs(Math.cos(angles[2] - angles[1]) - Math.cos(0.12)) < 1e-9);
  assert.equal(sentry.attackTicks, 150);
  updateEnemies(w, events); assert.equal(w.projectiles.length, 3);
  assert.ok(events.every(event => event.owner === 'enemy' && event.kind === 'sentry'));
});
test('lancers lock their telegraphed direction for all 45 warning ticks before charging', () => {
  const w = createWorld(1), lancer = {...enemy(100, 800, 360, 80), kind: 'lancer', windupTicks: 0, chargeAngle: 0};
  w.enemies.push(lancer); updateEnemies(w, []);
  const startX = lancer.x, startY = lancer.y, aim = lancer.chargeAngle;
  assert.equal(lancer.windupTicks, 45);
  w.player.y = 100;
  for (let i = 0; i < 45; i++) updateEnemies(w, []);
  assert.equal(lancer.x, startX); assert.equal(lancer.y, startY);
  assert.equal(lancer.chargeTicks, 24); assert.equal(lancer.chargeAngle, aim);
  updateEnemies(w, []); assert.ok(lancer.x < startX); assert.equal(lancer.y, startY);
});
