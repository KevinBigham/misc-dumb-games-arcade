import test from 'node:test';
import assert from 'node:assert/strict';
import { createMoonAudio } from '../src/moon-audio.js';

function fakeAudio(t) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'AudioContext');
  const instances = [];
  const parameter = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} });
  class Audio {
    constructor() { this.state = 'suspended'; this.currentTime = 0; this.destination = {}; this.nodes = []; this.suspends = 0; instances.push(this); }
    createGain() { return { gain: parameter(), connect() {}, disconnect() {} }; }
    createOscillator() { const node = { frequency: parameter(), connect() {}, disconnect() {}, start() {}, stop() {} }; this.nodes.push(node); return node; }
    async resume() { if (this.gate) await this.gate; this.state = 'running'; }
    async suspend() { this.suspends++; this.state = 'suspended'; }
  }
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, writable: true, value: Audio });
  t.after(() => { if (original) Object.defineProperty(globalThis, 'AudioContext', original); else delete globalThis.AudioContext; });
  return instances;
}

test('moon audio bounds simultaneous voices and releases completed notes', async t => {
  const contexts = fakeAudio(t), audio = createMoonAudio(); await audio.unlock();
  const context = contexts[0];
  const event = Object.freeze({ type: 'shot' }), events = Object.freeze([event, event]);
  for (let i = 0; i < 100; i++) audio.consume(events);
  assert.equal(context.nodes.length, 32, 'events are deduplicated and voices capped');
  context.nodes[0].onended(); audio.consume(events);
  assert.equal(context.nodes.length, 33, 'ended voices free a slot');
  audio.setMuted(true); audio.consume(events);
  assert.equal(context.nodes.length, 33);
});

test('moon audio cannot start sounds after a late unlock finishes while paused', async t => {
  const contexts = fakeAudio(t), audio = createMoonAudio(); await audio.unlock();
  const context = contexts[0]; let release;
  context.gate = new Promise(resolve => { release = resolve; });
  const pending = audio.unlock(); audio.suspend(); release(); await pending;
  audio.consume([{ type: 'burp' }]);
  assert.equal(context.state, 'suspended'); assert.equal(context.nodes.length, 0);
});

test('moon soundtrack reads frozen worlds and gracefully tolerates missing audio', async t => {
  const contexts = fakeAudio(t), audio = createMoonAudio(); await audio.unlock();
  const world = Object.freeze({ tick: 60, boss: Object.freeze({ hp: 90 }) });
  audio.update(world); const count = contexts[0].nodes.length;
  audio.update(world); assert.equal(contexts[0].nodes.length, count, 'same tick does not replay music');
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: undefined });
  const silent = createMoonAudio(); await silent.unlock();
  assert.doesNotThrow(() => { silent.consume([{ type: 'portal' }]); silent.update(world); silent.suspend(); });
});
