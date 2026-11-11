import test from 'node:test';
import assert from 'node:assert/strict';
import { createMoonWorld } from '../src/sim/moon.js';
import { createMoonRenderer } from '../src/view/moon-renderer.js';

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze); return Object.freeze(value);
}
function harness(width = 960, height = 480) {
  const calls = [];
  const methods = ['beginPath', 'ellipse', 'fill', 'stroke', 'moveTo', 'lineTo', 'roundRect', 'fillText', 'save', 'restore', 'translate', 'rotate', 'scale', 'bezierCurveTo', 'clip', 'closePath', 'setLineDash', 'fillRect', 'setTransform'];
  const context = Object.fromEntries(methods.map(method => [method, (...args) => {
    for (const arg of args) if (typeof arg === 'number') assert.ok(Number.isFinite(arg), `${method} received a nonfinite coordinate`);
    calls.push(method);
  }]));
  const canvas = { width: 1280, height: 640, getContext: () => context, getBoundingClientRect: () => ({ left: 20, top: 90, width, height }) };
  return { renderer: createMoonRenderer(canvas), calls };
}
test('moon renderer draws all characters, laws, boss and feedback without mutating gameplay', () => {
  const { renderer, calls } = harness(), w = createMoonWorld(9);
  w.enemies = ['clock', 'mail', 'fish', 'chair', 'phone'].map((kind, i) => ({ x: 200 + i * 140, y: 200, kind, hp: 1, maxHp: 3, spawn: i ? 0 : 20, wobble: i, hit: i === 1 ? 5 : 0, windup: kind === 'chair' ? 20 : 0, chargeAngle: 0.4, attack: 40 }));
  w.portals = [{ x: 200, y: 180 }, { x: 1080, y: 470 }];
  w.hazards = [{ x: 400, y: 400, warning: 30, totalWarning: 60, radius: 60 }, { x: 700, y: 470, warning: 0, totalWarning: 60, radius: 70 }];
  w.orbits = [{ x: 600, y: 500 }, { x: 680, y: 500 }];
  w.drops = [{ x: 400, y: 500, ttl: 90, wobble: 2 }];
  w.shots = [{ x: 300, y: 200, angle: 1, enemy: false }, { x: 500, y: 100, enemy: true }];
  w.player.bag = 4; w.player.dashTicks = 4; w.player.invulnerable = 20;
  w.boss = { x: 640, y: 130, hp: 40, maxHp: 150, phase: 2, telegraph: 12, hit: 0 };
  const before = JSON.stringify(w); freeze(w);
  renderer.consume([{ type: 'pop', tick: 10, x: 300, y: 200 }, { type: 'burp', tick: 11, x: 500, y: 500, radius: 300 }, { type: 'feed', tick: 12, x: 640, y: 300 }]);
  renderer.draw(w, 1 / 60); renderer.setReduced(true); renderer.draw(w, 1 / 60); renderer.draw(null, 1 / 60, true);
  assert.equal(JSON.stringify(w), before); assert.ok(calls.length > 100);
  const soup = createMoonWorld(); soup.law = 'soup'; freeze(soup); renderer.draw(soup, 1 / 60);
  const legs = createMoonWorld(2, { loadout: 'tank' }); legs.law = 'legs'; legs.player.refund = true; freeze(legs); renderer.draw(legs, 1 / 60);
  renderer.reset(); renderer.draw(soup, 1 / 60);
});
test('moon pointer aim maps CSS dimensions to simulation coordinates', () => {
  const { renderer } = harness();
  assert.deepEqual(renderer.screenToWorld(500, 330), { x: 640, y: 320 });
  assert.deepEqual(renderer.screenToWorld(20, 90), { x: 0, y: 0 });
});
test('moon portrait camera keeps square pixels and pointer aim aligned with the visible world', () => {
  const { renderer } = harness(360, 360), w = createMoonWorld(); w.player.x = 1000;
  renderer.draw(w, 1 / 60);
  assert.deepEqual(renderer.screenToWorld(200, 270), { x: 960, y: 320 });
  assert.deepEqual(renderer.screenToWorld(20, 90), { x: 640, y: 0 });
  assert.deepEqual(renderer.screenToWorld(380, 450), { x: 1280, y: 640 });
});
