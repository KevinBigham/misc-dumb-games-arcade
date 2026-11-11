import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, stepWorld, applyUpgrade } from '../src/sim/world.js';
import { UPGRADES, updateBoss, updateSpawns } from '../src/sim/content.js';
import { spawnProjectile } from '../src/sim/combat.js';

test('acts wait for unique seeded upgrades and transitions reset danger', () => {
  const a = createWorld(90), b = createWorld(90);
  for (const w of [a, b]) {w.actTick = 3599; w.player.hp = 30; stepWorld(w, {});}
  assert.equal(a.phase, 'upgrade'); assert.deepEqual(a.upgradeOffers, b.upgradeOffers);
  assert.equal(new Set(a.upgradeOffers.map(u => u.id)).size, 3);
  assert.equal(a.enemies.length, 0); assert.equal(a.projectiles.length, 0); assert.equal(a.player.history.length, 0);
  const snapshot = JSON.stringify(a); stepWorld(a, {fire: true}); assert.equal(JSON.stringify(a), snapshot);
  assert.deepEqual(applyUpgrade(a, 'unknown'), []);
  assert.deepEqual(applyUpgrade(a, a.upgradeOffers[0].id), [{type: 'act-start', tick: a.tick, act: 2}]);
  assert.equal(a.act, 2); assert.equal(a.phase, 'playing'); assert.equal(a.player.forkCharges, 2);
  assert.ok(a.player.hp >= 55);
});
test('all six upgrades have their specified effects and cannot be applied twice', () => {
  assert.equal(UPGRADES.length, 6);
  for (const upgrade of UPGRADES) {
    const w = createWorld(1); w.phase = 'upgrade'; w.upgradeOffers = [upgrade];
    assert.equal(applyUpgrade(w, upgrade.id).length, 1); assert.ok(w.player.upgrades.includes(upgrade.id));
    if (upgrade.id === 'damage') assert.equal(w.player.damage, 25);
    if (upgrade.id === 'fire-rate') assert.equal(w.player.fireRate, 9.6);
    if (upgrade.id === 'pierce') assert.equal(w.player.pierce, 1);
    if (upgrade.id === 'echo') assert.equal(w.player.echoDamage, 0.9);
    if (upgrade.id === 'fork-burst') assert.equal(w.player.forkBurst, true);
    if (upgrade.id === 'vitality') assert.equal(w.player.maxHp, 125);
    w.phase = 'upgrade'; w.upgradeOffers = [upgrade]; assert.deepEqual(applyUpgrade(w, upgrade.id), []);
  }
});
test('act three proceeds directly to boss and boss phases follow health', () => {
  const w = createWorld(1); w.act = 3; w.actTick = 3599; stepWorld(w, {});
  assert.equal(w.act, 4); assert.equal(w.phase, 'playing'); assert.equal(w.boss.hp, 12000);
  w.boss.hp = w.boss.maxHp * 0.6; let events = stepWorld(w, {}); assert.equal(w.boss.phase, 2);
  assert.ok(events.some(e => e.type === 'boss-phase' && e.phase === 2));
  w.boss.hp = w.boss.maxHp * 0.3; events = stepWorld(w, {}); assert.equal(w.boss.phase, 3);
  assert.ok(events.some(e => e.type === 'boss-phase' && e.phase === 3));
});
test('boss death wins even with simultaneous player death and terminal ticks stop', () => {
  const w = createWorld(1); w.act = 3; w.actTick = 3599; stepWorld(w, {});
  w.boss.hp = 0; w.player.hp = 0;
  assert.ok(stepWorld(w, {}).some(e => e.type === 'run-end')); assert.equal(w.phase, 'won');
  const snapshot = JSON.stringify(w); assert.deepEqual(stepWorld(w, {}), []); assert.equal(JSON.stringify(w), snapshot);
});
test('spawns have the full 30 tick warning and safe player separation', () => {
  const w = createWorld(1); w.nextSpawnTick = 1; stepWorld(w, {});
  assert.equal(w.enemies[0].spawnTicks, 30);
  assert.ok(Math.hypot(w.enemies[0].x - w.player.x, w.enemies[0].y - w.player.y) >= 160);
  for (let i = 0; i < 29; i++) stepWorld(w, {});
  assert.equal(w.enemies[0].spawnTicks, 1);
  stepWorld(w, {}); assert.equal(w.enemies[0].spawnTicks, 0);
});
test('boss beams deal no damage throughout exactly 48 warning ticks', () => {
  const w = createWorld(1); w.act = 3; w.actTick = 3599; stepWorld(w, {});
  w.boss.hp = w.boss.maxHp * 0.6; w.boss.beamTicks = 1; w.boss.ringTicks = 10000;
  w.player.invulnTicks = 0; const hp = w.player.hp;
  updateBoss(w, []); assert.equal(w.boss.telegraphs[0].remainingTicks, 48);
  for (let i = 0; i < 47; i++) updateBoss(w, []);
  assert.equal(w.player.hp, hp);
  updateBoss(w, []); assert.equal(w.player.hp, hp - 18);
});
test('all enemy types appear in their acts with bounded safe spawns', () => {
  const w = createWorld(51); w.act = 3;
  for (let i = 0; i < 500; i++) {w.actTick += 100; updateSpawns(w);}
  assert.deepEqual(new Set(w.enemies.map(enemy => enemy.kind)), new Set(['chaser', 'sentry', 'lancer']));
  assert.ok(w.enemies.length <= 64);
  for (const enemy of w.enemies) {
    assert.ok(Math.hypot(enemy.x - w.player.x, enemy.y - w.player.y) >= 160);
    assert.ok(w.enemies.every(other => other === enemy || Math.hypot(enemy.x - other.x, enemy.y - other.y) > 34));
  }
});
test('a lethal hostile shot and final boss shot in the same collision step award victory', () => {
  const w = createWorld(1); w.act = 3; w.actTick = 3599; stepWorld(w, {});
  w.player.hp = 1; w.player.invulnTicks = 0; w.boss.hp = 20;
  spawnProjectile(w, {x: w.player.x, y: w.player.y, dx: 1, dy: 0, speed: 1, damage: 8, pierce: 0}, 'enemy');
  spawnProjectile(w, {x: w.boss.x - 100, y: w.boss.y, dx: 1, dy: 0, speed: 12000, damage: 20, pierce: 0}, 'player');
  const events = stepWorld(w, {});
  assert.equal(w.player.hp, 0); assert.equal(w.boss.hp, 0); assert.equal(w.phase, 'won');
  assert.equal(events.find(event => event.type === 'run-end').phase, 'won');
  assert.equal(events.filter(event => event.type === 'kill').length, 1);
});
