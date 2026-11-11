import test from 'node:test';
import assert from 'node:assert/strict';
import { createHonkAudio } from '../src/honk/audio.js';

function fakeAudio() {
  const oldWindow = globalThis.window;
  const metrics = { contexts: 0, oscillators: [], resumes: 0, suspends: 0 };
  class Context {
    constructor() { metrics.contexts++; metrics.context = this; this.state = 'suspended'; this.currentTime = 0; this.destination = {}; }
    resume() { metrics.resumes++; return new Promise(resolve => { metrics.finishResume = () => { this.state = 'running'; resolve(); }; }); }
    suspend() { metrics.suspends++; this.state = 'suspended'; return Promise.resolve(); }
    createOscillator() {
      const voice = { frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() { this.disconnected = true; }, start() {}, stop(when) { if (when === undefined) { this.stopped = true; this.onended?.(); } } };
      metrics.oscillators.push(voice); return voice;
    }
    createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} }; }
  }
  globalThis.window = { AudioContext: Context };
  return { metrics, restore() { if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow; } };
}

test('sound waits for interaction; muting never initializes or resumes audio', async () => {
  const { metrics: m, restore } = fakeAudio();
  try {
    const audio = createHonkAudio(); audio.consume([{ type: 'honk' }]); audio.setMuted(true); audio.unlock();
    assert.equal(m.contexts, 0);
    audio.setMuted(false); assert.equal(m.contexts, 0);
    audio.unlock(); m.finishResume(); await Promise.resolve();
    audio.consume([{ type: 'honk' }]); assert.equal(m.oscillators.length, 2);
    audio.setMuted(true); assert.ok(m.oscillators.every(o => o.stopped));
    audio.consume([{ type: 'reply' }]); assert.equal(m.oscillators.length, 2);
  } finally { restore(); }
});

test('a delayed browser audio resume cannot undo a pause or mute', async () => {
  const { metrics: m, restore } = fakeAudio();
  try {
    const audio = createHonkAudio(); audio.unlock(); audio.suspend();
    m.finishResume(); await Promise.resolve();
    assert.equal(m.context.state, 'suspended');
    audio.consume([{ type: 'honk' }]); assert.equal(m.oscillators.length, 0);
    audio.unlock(); audio.setMuted(true); m.finishResume(); await Promise.resolve();
    assert.equal(m.context.state, 'suspended');
  } finally { restore(); }
});

test('audio has a hard voice cap, frees finished voices, and never mutates events', async () => {
  const { metrics: m, restore } = fakeAudio();
  try {
    const audio = createHonkAudio(); audio.unlock(); m.finishResume(); await Promise.resolve();
    const events = Object.freeze(Array.from({ length: 100 }, () => Object.freeze({ type: 'chair-hit', chain: 3 })));
    audio.consume(events); assert.equal(m.oscillators.length, 6, 'burst limit per event type');
    for (let i = 0; i < 20; i++) audio.consume(events);
    assert.equal(m.oscillators.length, 24, 'hard concurrency cap');
    m.oscillators[0].onended(); audio.consume([{ type: 'fired' }]);
    assert.equal(m.oscillators.length, 25); assert.equal(m.oscillators[0].disconnected, true);
    audio.suspend(); assert.ok(m.oscillators.slice(1).every(o => o.stopped));
  } finally { restore(); }
});
