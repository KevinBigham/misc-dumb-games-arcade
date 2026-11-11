import test from 'node:test';
import assert from 'node:assert/strict';
import { createHonkInput } from '../src/honk/input.js';

test('a quick honk tap survives pointer/key release before the next simulation tick', () => {
  for (const pointer of [false, true]) {
    const input = createHonkInput();
    if (pointer) { input.setPointerHonk(true); input.setPointerHonk(false); }
    else { input.setKey('Space', true); input.setKey('Space', false); }
    assert.equal(input.sample().honk, true); assert.equal(input.sample().honk, false);
  }
});
test('held honk repeats while dash and reply fire only on a fresh press', () => {
  const input = createHonkInput();
  for (const key of ['Space', 'ShiftLeft', 'KeyE']) input.setKey(key, true);
  assert.deepEqual(input.sample(), { x: 0, y: 0, honk: true, dash: true, reply: true });
  input.setKey('ShiftLeft', true); input.setKey('KeyE', true);
  assert.deepEqual(input.sample(), { x: 0, y: 0, honk: true, dash: false, reply: false });
  input.setKey('KeyE', false); input.setKey('KeyE', true); input.setKey('KeyE', false);
  assert.equal(input.sample().reply, true); assert.equal(input.sample().reply, false);
});
test('clearing focus removes held directions, pointer fire, and queued special actions', () => {
  const input = createHonkInput();
  for (const key of ['KeyW', 'ArrowRight', 'ShiftRight', 'KeyE']) input.setKey(key, true);
  input.setPointerHonk(true); input.clear();
  assert.deepEqual(input.sample(), { x: 0, y: 0, honk: false, dash: false, reply: false });
  assert.equal(input.sample(true).honk, true, 'auto-honk remains an explicit caller preference');
});
test('alternate movement keys combine without doubling speed and opposites cancel', () => {
  const input = createHonkInput(); input.setKey('KeyD', true); input.setKey('ArrowRight', true);
  assert.equal(input.sample().x, 1); input.setKey('ArrowLeft', true); assert.equal(input.sample().x, 0);
  input.setKey('ArrowLeft', false); input.setKey('KeyW', true);
  assert.deepEqual(input.sample(), { x: 1, y: -1, honk: false, dash: false, reply: false });
});
