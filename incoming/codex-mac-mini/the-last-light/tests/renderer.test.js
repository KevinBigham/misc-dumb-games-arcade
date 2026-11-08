import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer } from '../src/view/renderer.js';
import { createEffects } from '../src/view/effects.js';
import { createWorld } from '../src/sim/world.js';
import { ACT_NAMES } from '../src/contracts.js';

const originalDocument = globalThis.document;

// A recording Canvas2D stub validates actual output commands, without requiring a DOM.
function makeContext() {
  const calls = [];
  const context = { calls };
  for (const method of ['save', 'restore', 'beginPath', 'closePath', 'moveTo', 'lineTo',
    'arc', 'ellipse', 'rect', 'clip', 'fill', 'stroke', 'fillRect', 'strokeRect',
    'clearRect', 'translate', 'rotate', 'scale', 'setTransform', 'quadraticCurveTo',
    'drawImage', 'setLineDash', 'fillText']) {
    context[method] = (...args) => {
      for (const arg of args) if (typeof arg === 'number') assert.ok(Number.isFinite(arg), `${method} received ${arg}`);
      calls.push({ method, args });
    };
  }
  for (const method of ['createRadialGradient', 'createLinearGradient']) {
    context[method] = () => ({ addColorStop() {} });
  }
  return context;
}

function harness(t, width = 1280, height = 720, domScale = 1) {
  const context = makeContext();
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: makeContext }) };
  t.after(() => {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
  });
  const canvas = {
    clientWidth: width, clientHeight: height,
    getContext: () => context,
    getBoundingClientRect: () => ({ left: 17, top: 31, width: width * domScale, height: height * domScale }),
  };
  return { canvas, context, renderer: createRenderer(canvas) };
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function outputCount(context) {
  return context.calls.filter(call => ['fill', 'stroke', 'fillRect', 'fillText', 'drawImage'].includes(call.method)).length;
}

test('pointer conversion handles wide, tall and CSS-scaled letterboxes independently of DPR and shake', t => {
  for (const [width, height, dpr, domScale] of [
    [1280, 720, 1, 1], [1600, 1000, 2, 1], [2000, 720, 1.25, 1], [900, 1100, 3, 0.7],
  ]) {
    const { canvas, renderer } = harness(t, width, height, domScale);
    renderer.resize(width, height, dpr);
    assert.equal(canvas.width, Math.round(width * Math.min(dpr, 1.5)));
    assert.equal(canvas.height, Math.round(height * Math.min(dpr, 1.5)));
    const scale = Math.min(width / 1280, height / 720);
    const offsetX = (width - 1280 * scale) / 2;
    const offsetY = (height - 720 * scale) / 2;
    for (const expected of [{ x: 0, y: 0 }, { x: 640, y: 360 }, { x: 1190, y: 654 }]) {
      const clientX = 17 + (offsetX + expected.x * scale) * domScale;
      const clientY = 31 + (offsetY + expected.y * scale) * domScale;
      const actual = renderer.screenToWorld(clientX, clientY);
      assert.ok(Math.abs(actual.x - expected.x) < 1e-8);
      assert.ok(Math.abs(actual.y - expected.y) < 1e-8);
      renderer.consume([{ type: 'player-hit', x: 640, y: 360 }]);
      renderer.draw(null, 0.5, 1 / 60);
      assert.deepEqual(renderer.screenToWorld(clientX, clientY), actual, 'camera shake moved aim coordinates');
    }
    renderer.destroy();
  }
});

test('rendering all combat states cannot mutate world state or use gameplay randomness', t => {
  const { renderer } = harness(t);
  const world = createWorld(7145);
  world.tick = 200;
  world.player.history = Array.from({ length: 80 }, (_, i) => ({ x: 500 + i, y: 350, aim: 0, shots: [] }));
  world.player.invulnTicks = 20;
  world.player.dashTicks = 5;
  world.enemies = ['chaser', 'sentry', 'lancer'].map((kind, i) => ({
    id: i + 10, kind, x: 450 + i * 80, y: 450, prevX: 449 + i * 80, prevY: 450,
    aim: 0, hp: 20, maxHp: 50, radius: 16, spawnTicks: i === 0 ? 15 : 0,
    windupTicks: 35, chargeTicks: 0, chargeAngle: -0.5, targetX: 640, targetY: 360,
  }));
  world.projectiles = ['player', 'echo', 'enemy'].map((owner, i) => ({
    id: i + 20, owner, x: 650 + i * 40, y: 420, prevX: 647 + i * 40, prevY: 420, vx: 200, vy: 15, radius: 3,
  }));
  world.echoes = [{ id: 30, x: 540, y: 350, aim: 0, frames: world.player.history, index: 40 }];
  world.boss = { x: 640, y: 240, radius: 44, hp: 2000, maxHp: 3000, angle: 0.6, phase: 2,
    telegraphs: [{ angle: 0.3, remainingTicks: 30, durationTicks: 48, width: 24, activeTicks: 12 },
      { angle: 1.3, remainingTicks: 0, durationTicks: 48, width: 24, activeTicks: 10 }] };
  const before = JSON.stringify(world);
  freeze(world);
  const originalRandom = Math.random;
  Math.random = () => { throw new Error('Unseeded randomness during rendering'); };
  try {
    for (const alpha of [0, 0.5, 1]) renderer.draw(world, alpha, 1 / 60);
    renderer.setReducedMotion(true);
    renderer.draw(world, 0.75, 1 / 60);
    renderer.draw(null, 1, 1 / 60);
  } finally { Math.random = originalRandom; }
  assert.equal(JSON.stringify(world), before);
  renderer.destroy();
});

test('new-run event removes fork ribbons, rupture glyphs, particles, rings and screen flash', t => {
  const { renderer, context } = harness(t);
  const world = createWorld(42);
  renderer.draw(world, 1, 0);
  context.calls.length = 0;
  renderer.draw(world, 1, 0);
  const baseline = outputCount(context);
  renderer.consume([{ type: 'fork', x: 400, y: 360, fromX: 700, fromY: 350,
    path: [{ x: 400, y: 360 }, { x: 600, y: 340 }, { x: 700, y: 350 }] }]);
  context.calls.length = 0;
  renderer.draw(world, 1, 0);
  assert.ok(outputCount(context) > baseline + 50, 'Fork should produce a substantial visible response');
  renderer.consume([{ type: 'run-start', tick: 0, act: 1 }]);
  context.calls.length = 0;
  renderer.draw(world, 1, 0);
  assert.equal(outputCount(context), baseline, 'transient visuals survived new run');
  renderer.destroy();
  context.calls.length = 0;
  renderer.draw(world, 1, 0);
  assert.equal(context.calls.length, 0, 'destroyed renderer should not issue drawing commands');
});

test('cosmetic storm stays within 700 particles and 35 rings, then expires completely', () => {
  const effects = createEffects();
  const context = makeContext();
  effects.consume(Array.from({ length: 1000 }, () => ({ type: 'kill', x: 600, y: 360 })));
  effects.draw(context);
  const primitives = context.calls.filter(call => call.method === 'fill' || call.method === 'stroke').length;
  assert.equal(primitives, 735, 'storm should saturate, not exceed, bounded particle/ring capacity');
  effects.update(2, false);
  context.calls.length = 0;
  effects.draw(context);
  assert.equal(outputCount(context), 0, 'expired particles or rings still render');
});

test('reduced motion suppresses camera shake and screen flash without hiding the Fork cue', () => {
  const effects = createEffects();
  const context = makeContext();
  effects.consume([{ type: 'fork', x: 640, y: 360, fromX: 750, fromY: 400 }]);
  effects.update(0.016, false);
  assert.ok(Math.abs(effects.shake.x) + Math.abs(effects.shake.y) > 0);
  assert.ok(effects.flash > 0);
  effects.update(0.016, true);
  assert.deepEqual(effects.shake, { x: 0, y: 0 });
  assert.equal(effects.flash, 0);
  effects.draw(context);
  assert.ok(context.calls.some(call => call.method === 'fillText' && call.args[0] === 'TIMELINE FORKED'));
  effects.clear();
  effects.update(0, false);
  assert.deepEqual(effects.shake, { x: 0, y: 0 });
  assert.equal(effects.flash, 0);
  context.calls.length = 0;
  effects.draw(context);
  assert.equal(outputCount(context), 0);
});

test('act titles expire, and restarting replaces Choir arrival with a fresh Wake announcement', t => {
  const { renderer, context } = harness(t);
  const world = createWorld(51);
  world.tick = 500;
  world.act = 4;
  world.boss = { x: 640, y: 265, radius: 44, hp: 3000, maxHp: 3000, angle: 0, phase: 1, telegraphs: [] };
  const titles = () => context.calls.filter(call => call.method === 'fillText' && ACT_NAMES.includes(call.args[0])).map(call => call.args[0]);
  renderer.consume([{ type: 'act-start', act: 4 }, { type: 'boss-phase', phase: 1, x: 640, y: 265 }]);
  renderer.draw(world, 1, 0.08);
  assert.deepEqual(titles(), ['THE CHOIR']);
  const before = JSON.stringify(world);
  renderer.setReducedMotion(true);
  // After 1.8 seconds neither the banner nor its timer should linger.
  for (let i = 0; i < 23; i++) renderer.draw(world, 1, 0.08);
  context.calls.length = 0;
  renderer.draw(world, 1, 0.08);
  assert.deepEqual(titles(), []);
  assert.equal(JSON.stringify(world), before, 'arrival animation changed boss position or state');
  renderer.consume([{ type: 'boss-phase', phase: 1, x: 640, y: 265 }]);
  renderer.draw(world, 1, 0.08);
  renderer.consume([{ type: 'run-start', tick: 0, act: 1 }]);
  const restarted = createWorld(51);
  context.calls.length = 0;
  renderer.draw(restarted, 1, 0.08);
  assert.deepEqual(titles(), ['THE WAKE'], 'old presentation timer or backwards tick reset replaced the new banner');
  assert.ok(!context.calls.some(call => call.method === 'fillText' && call.args[0] === 'IV'));
  renderer.destroy();
});
