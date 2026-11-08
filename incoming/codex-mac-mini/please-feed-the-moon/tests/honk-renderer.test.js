import test from 'node:test';
import assert from 'node:assert/strict';
import { createHonk, stepHonk } from '../src/sim/honk.js';
import { createHonkRenderer } from '../src/honk/renderer.js';

test('office renderer consumes effects without mutating simulation state or RNG', () => {
  const oldWindow = globalThis.window, oldMedia = globalThis.matchMedia;
  globalThis.window = { devicePixelRatio: 1 }; globalThis.matchMedia = () => ({ matches: false });
  try {
    const context = new Proxy({ measureText: value => ({ width: value.length * 7 }) }, { get: (target, key) => target[key] ?? (() => {}) });
    const canvas = { width: 1200, height: 640, getContext: () => context, getBoundingClientRect: () => ({ width: 1200, height: 640 }) };
    const renderer = createHonkRenderer(canvas), state = createHonk(42);
    for (let i = 0; i < 200; i++) stepHonk(state, { honk: true });
    state.stamps.push({ id: 555, x: 500, y: 300, delay: 30, totalDelay: 90, ttl: 100, radius: 68, impact: false }, { id: 556, x: 700, y: 400, delay: 0, totalDelay: 90, ttl: 30, radius: 78, impact: true });
    state.chairs[0].vx = 300; state.chairs[0].spin = 4;
    state.enemies.push({ id: 557, kind: 'security', x: 100, y: 300, hp: 5, maxHp: 5, age: 100, hit: 0, stun: 0, windup: 20, chargeX: 1, chargeY: 0, chargeTicks: 0, line: 'BADGE CHECK.' });
    state.enemies.push({ id: 558, kind: 'boss', x: 1000, y: 300, hp: 10, maxHp: 54, age: 100, hit: 0, stun: 0, bossPhase: 3, line: 'WE NEED TO TALK.' });
    state.snacks.push({ id: 559, kind: 'pizza', x: 600, y: 400, ttl: 100 });
    const before = structuredClone(state);
    renderer.consume(state.events);
    renderer.render(state, .016, false, 3);
    renderer.render(state, .016, true, 4);
    assert.deepEqual(state, before);
    renderer.reset();
    renderer.setPreferences({ reducedMotion: true, tie: '#ffcc00' });
    renderer.render(state, .016, false, 5);
    assert.deepEqual(state, before);
  } finally {
    if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
    if (oldMedia === undefined) delete globalThis.matchMedia; else globalThis.matchMedia = oldMedia;
  }
});
