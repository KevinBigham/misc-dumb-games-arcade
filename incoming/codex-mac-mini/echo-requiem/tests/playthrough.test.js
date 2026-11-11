import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, stepWorld, applyUpgrade } from '../src/sim/world.js';

/** Input-only acceptance pilot. It has no privileged access to mutate a run. */
function pilot(world, frame) {
  const player = world.player;
  const rx = player.x - world.arena.x, ry = player.y - world.arena.y;
  const radius = Math.hypot(rx, ry) || 1, correction = (225 - radius) / 80;
  const enemies = world.enemies.filter(enemy => enemy.spawnTicks === 0);
  enemies.sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y));
  const target = world.boss || enemies[0] || world.arena;
  const danger = world.projectiles.some(projectile => projectile.owner === 'enemy' && Math.hypot(projectile.x - player.x, projectile.y - player.y) < 55);
  return {
    moveX: radius === 1 ? 1 : -ry / radius + rx / radius * correction,
    moveY: radius === 1 ? 0 : rx / radius + ry / radius * correction,
    aimX: target.x, aimY: target.y, fire: true,
    forkPressed: frame % 260 === 259,
    dashPressed: danger && player.dashCooldown === 0,
  };
}

test('seed 1 completes all acts, upgrades, three boss phases and victory using only legal input', () => {
  const world = createWorld(1), phases = new Set(), acts = new Set([1]);
  const preference = ['damage', 'echo', 'fire-rate', 'vitality', 'pierce', 'fork-burst'];
  let frames = 0;
  while ((world.phase === 'playing' || world.phase === 'upgrade') && frames < 18000) {
    if (world.phase === 'upgrade') {
      const upgrade = preference.find(id => world.upgradeOffers.some(offer => offer.id === id));
      assert.ok(upgrade);
      const events = applyUpgrade(world, upgrade);
      assert.equal(events[0].type, 'act-start');
    }
    const events = stepWorld(world, pilot(world, frames));
    for (const event of events) if (event.type === 'boss-phase') phases.add(event.phase);
    acts.add(world.act); frames++;
    assert.ok(world.enemies.length <= 64 && world.projectiles.length <= 512);
  }
  assert.equal(world.phase, 'won');
  assert.deepEqual(acts, new Set([1, 2, 3, 4]));
  assert.deepEqual(phases, new Set([1, 2, 3]));
  assert.equal(world.player.upgrades.length, 2);
  assert.ok(world.stats.forks > 10 && world.stats.echoKills > 0);
  assert.ok(world.tick > 10800 && world.tick < 15000);
  assert.ok(world.player.hp > 0);
});
