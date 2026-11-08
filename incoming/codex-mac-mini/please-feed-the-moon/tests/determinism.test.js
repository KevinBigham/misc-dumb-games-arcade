import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, stepWorld } from '../src/sim/world.js';

const command = tick => ({moveX: Math.sin(tick / 60), moveY: Math.cos(tick / 60), aimX: 640, aimY: 100, fire: true, dashPressed: tick % 120 === 0, forkPressed: tick % 240 === 239});
test('a seed and 600 commands produce identical worlds and events', () => {
  const a = createWorld(1776), b = createWorld('1776');
  for (let tick = 0; tick < 600; tick++) assert.deepEqual(stepWorld(a, command(tick)), stepWorld(b, command(tick)));
  assert.deepEqual(a, b);
});
test('different seeds change the encounter and invalid seed input is normalized', () => {
  const a = createWorld(1), b = createWorld(2);
  for (let i = 0; i < 300; i++) {stepWorld(a, {}); stepWorld(b, {});}
  assert.notDeepEqual(a.enemies.map(e => [e.x, e.y]), b.enemies.map(e => [e.x, e.y]));
  assert.equal(createWorld('nope').seed, 1);
  assert.equal(createWorld(Infinity).seed, 1);
  assert.equal(createWorld(0).seed, 0);
});
