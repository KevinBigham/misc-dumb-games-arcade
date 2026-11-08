import test from 'node:test';
import assert from 'node:assert/strict';
import { createLight } from '../src/sim/last-light.js';
import { createLightRenderer } from '../src/last-light-renderer.js';
import { createLightAudio } from '../src/last-light-audio.js';

function freeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
function fakeCanvas(width = 550, height = 370) {
  const calls = [];
  const methods = ['beginPath','arc','fill','stroke','moveTo','lineTo','fillText','save','restore','translate','rotate','closePath','setLineDash','fillRect','strokeRect','setTransform'];
  const context = Object.fromEntries(methods.map(method => [method, (...args) => {
    for (const arg of args) if (typeof arg === 'number') assert.ok(Number.isFinite(arg), `${method} received nonfinite coordinates`);
    calls.push({ method, args });
  }]));
  context.createRadialGradient = () => ({ addColorStop() {} });
  const canvas = { getContext: () => context, getBoundingClientRect: () => ({ left: 20, top: 60, width, height }) };
  return { canvas, calls };
}
function withWindow(value, fn) {
  const old = globalThis.window; globalThis.window = value;
  return Promise.resolve().then(fn).finally(() => { if (old === undefined) delete globalThis.window; else globalThis.window = old; });
}
test('Last Light renderer: all combat effects draw finite coordinates without mutating world or events', () => withWindow({ devicePixelRatio: 2 }, () => {
  const { canvas, calls } = fakeCanvas(), renderer = createLightRenderer(canvas), w = createLight();
  w.wave = 5; w.waveTick = 3200; w.player.hp = 20; w.player.dashTicks = 3; w.player.dx = 1; w.mods.orbit = true;
  w.enemies = ['seeker','siege','brute','ranged','warden','boss'].map((kind, i) => ({ id: i + 100, kind, x: 150 + i * 130, y: 450, radius: 20, hp: 10, maxHp: 100, angle: .3, flash: 0, phase: 3 }));
  w.people[0].capture = 120; w.people[1].following = true;
  w.beams = [{ x: 500, y: 450, angle: .3, warning: 20, width: 32 }, { x: 600, y: 450, angle: 1, warning: 0, width: 32 }];
  w.sparks = [{ x: 400, y: 300 }]; w.hazards = [{ x: 500, y: 200, radius: 5 }]; w.bolts = [{ x: 300, y: 300, angle: .5 }];
  const events = freeze(['kill','rescue','hurt','hit','dash','dash-hit','person-lost','repair','pulse','follow'].map(type => ({ type, x: 500, y: 300, tick: 1, name: 'Mara', amount: 3 })));
  const before = JSON.stringify(w); freeze(w); renderer.consume(events); renderer.draw(w); renderer.setReducedMotion(true); renderer.draw(w); renderer.reset(); renderer.draw(w);
  createLightRenderer(canvas, true).draw(w);
  assert.equal(JSON.stringify(w), before); assert.ok(calls.length > 200);
  assert.equal(canvas.width, 1100); assert.equal(canvas.height, 740);
  assert.deepEqual(renderer.toWorld(295,245), { x: 550, y: 370 });
}));

test('Last Light renderer: reduced motion removes camera shake and ambient animation', () => withWindow({}, () => {
  const { canvas, calls } = fakeCanvas(), renderer = createLightRenderer(canvas), w = freeze(createLight()); renderer.setReducedMotion(true);
  renderer.consume([{ type: 'pulse', x: 550, y: 370, tick: 1 }]); renderer.draw(w, 0); const first = calls.slice(); calls.length = 0; renderer.draw(w, 0);
  assert.deepEqual(calls, first); assert.ok(!calls.some(call => call.method === 'translate' && call.args[0] !== 550));
}));
function audioHarness() {
  const state = { contexts: [], oscillators: [], gains: [], resolves: [] };
  class Context {
    constructor() { this.state = 'suspended'; this.currentTime = 0; this.destination = {}; state.contexts.push(this); }
    resume() { return new Promise(resolve => state.resolves.push(() => { this.state = 'running'; resolve(); })); }
    suspend() { this.state = 'suspended'; return Promise.resolve(); }
    close() { this.state = 'closed'; return Promise.resolve(); }
    createGain() { const gain = { gain: { setTargetAtTime() {}, setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() { this.disconnected = true; } }; state.gains.push(gain); return gain; }
    createOscillator() { const o = { frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() { this.disconnected = true; }, start() {}, stop(when) { if (when === undefined) { this.stopped = true; this.onended?.(); } } }; state.oscillators.push(o); return o; }
  }
  return { state, Context };
}
test('Last Light audio: mute avoids initialization and delayed resume cannot undo pause', async () => {
  const { state: s, Context } = audioHarness();
  await withWindow({ AudioContext: Context }, async () => {
    const audio = createLightAudio(); audio.setMuted(true); audio.unlock(); assert.equal(s.contexts.length, 0);
    audio.setMuted(false); audio.unlock(); audio.suspend(); s.resolves.shift()(); await Promise.resolve(); assert.equal(s.contexts[0].state, 'suspended');
    audio.unlock(); audio.setMuted(true); s.resolves.shift()(); await Promise.resolve(); assert.equal(s.contexts[0].state, 'suspended'); audio.destroy();
  });
});
test('Last Light audio: cap18 transient voices, release finished slots, discard paused effects, preserve events', async () => {
  const { state: s, Context } = audioHarness();
  await withWindow({ AudioContext: Context }, async () => {
    const audio = createLightAudio(); audio.unlock(); s.resolves.shift()(); await Promise.resolve();
    const events = freeze(Array.from({ length: 100 }, () => ({ type: 'rescue', tick: 1 })));
    audio.consume(events); assert.equal(s.oscillators.length, 21, '3 ambient + 18 effect voices');
    s.oscillators[3].onended(); audio.consume([{ type: 'hurt' }]); assert.equal(s.oscillators.length, 22);
    audio.suspend(); assert.ok(s.oscillators.slice(3).every(o => o.disconnected));
    audio.consume(events); assert.equal(s.oscillators.length, 22);
    audio.unlock(); s.resolves.shift()(); await Promise.resolve(); audio.consume([{ type: 'dash' }]); assert.equal(s.oscillators.length, 23);
    audio.destroy(); assert.ok(s.oscillators.every(o => o.disconnected)); assert.equal(s.contexts[0].state, 'closed');
  });
});
test('Last Light audio: unavailable browser audio leaves play unaffected', () => withWindow({}, () => {
  const audio = createLightAudio(); audio.unlock(); audio.consume([{ type: 'pulse' }]); audio.suspend(); audio.destroy();
}));
