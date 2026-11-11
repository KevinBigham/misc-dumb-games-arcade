import test from 'node:test';
import assert from 'node:assert/strict';
import { createClock } from '../src/clock.js';

test('fixed clock gives the same simulation ticks across presentation rates', () => {
  for (const fps of [30, 60, 120, 144]) {
    let ticks = 0;
    const clock = createClock(() => { ticks++; });
    for (let i = 0; i < fps * 10; i++) clock.advance(1 / fps);
    assert.equal(ticks, 600, `${fps}fps`);
  }
});
test('pause and long frames cannot generate a catch-up spiral', () => {
  let ticks = 0;
  const clock = createClock(() => { ticks++; });
  clock.advance(10);
  assert.equal(ticks, 5);
  clock.advance(10, false);
  clock.advance(1 / 60);
  assert.equal(ticks, 6);
  clock.advance(Infinity);
  clock.advance(-1);
  assert.equal(ticks, 6);
});
test('terminal state stops remaining steps in the same presentation frame', () => {
  let ticks = 0;
  const clock = createClock(() => { ticks++; return false; });
  assert.equal(clock.advance(0.2), 0);
  assert.equal(ticks, 1);
});
