import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudio } from '../src/audio.js';

function harness(t, { deferredResume = false } = {}) {
  const names = ['AudioContext', 'setInterval', 'clearInterval'];
  const originals = Object.fromEntries(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const contexts = [], timers = new Map();
  let nextTimer = 1;
  let resolveResume;
  const parameter = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {}, setTargetAtTime() {} });
  const node = () => ({ connect() {}, disconnect() {}, gain: parameter(), pan: parameter(), frequency: parameter(), threshold: parameter(), knee: parameter(), ratio: parameter(), attack: parameter(), release: parameter() });
  class FakeAudioContext {
    constructor() { this.state = 'suspended'; this.currentTime = 0; this.sampleRate = 100; this.sources = []; this.destination = node(); contexts.push(this); }
    createGain() { return node(); }
    createDynamicsCompressor() { return node(); }
    createConvolver() { return node(); }
    createStereoPanner() { return node(); }
    createBiquadFilter() { return node(); }
    createPeriodicWave() { return {}; }
    createBuffer(channels, length) { const data = Array.from({ length: channels }, () => new Float32Array(length)); return { numberOfChannels: channels, getChannelData: index => data[index] }; }
    source() {
      const source = { ...node(), started: false, stopped: false, setPeriodicWave() {}, start() { this.started = true; }, stop(at) { if (at === undefined) this.stopped = true; } };
      this.sources.push(source);
      return source;
    }
    createOscillator() { return this.source(); }
    createBufferSource() { return this.source(); }
    resume() { this.state = 'running'; return deferredResume ? new Promise(resolve => { resolveResume = resolve; }) : Promise.resolve(); }
    suspend() { this.state = 'suspended'; return Promise.resolve(); }
    close() { this.state = 'closed'; return Promise.resolve(); }
  }
  globalThis.AudioContext = FakeAudioContext;
  globalThis.setInterval = callback => { const id = nextTimer++; timers.set(id, callback); return id; };
  globalThis.clearInterval = id => timers.delete(id);
  const audio = createAudio();
  t.after(() => {
    audio.destroy();
    for (const name of names) {
      if (originals[name]) Object.defineProperty(globalThis, name, originals[name]); else delete globalThis[name];
    }
  });
  return { audio, contexts, timers, resolveResume: () => resolveResume?.() };
}

test('audio creates no context before unlock and repeated unlock never duplicates the scheduler', async t => {
  const { audio, contexts, timers } = harness(t);
  audio.setIntensity(4, 3);
  audio.consume([{ type: 'shot' }]);
  assert.equal(contexts.length, 0);
  assert.equal(timers.size, 0);
  assert.equal(await audio.unlock(), true);
  await Promise.all([audio.unlock(), audio.unlock()]);
  assert.equal(contexts.length, 1);
  assert.equal(timers.size, 1);
});

test('a burst of combat events cannot exceed 24 simultaneous source voices', async t => {
  const { audio, contexts } = harness(t);
  await audio.unlock();
  audio.consume(Array.from({ length: 200 }, () => ({ type: 'fork', x: 640 })));
  assert.equal(contexts[0].sources.length, 24);
  assert.ok(contexts[0].sources.every(source => source.started));
});

test('mute and suspend clear voices and timers, resume restores one scheduler, destroy stays final', async t => {
  const { audio, contexts, timers } = harness(t);
  await audio.unlock();
  audio.setMuted(true);
  assert.equal(timers.size, 0);
  assert.ok(contexts[0].sources.every(source => source.stopped));
  const previous = contexts[0].sources.length;
  audio.consume([{ type: 'fork' }]);
  assert.equal(contexts[0].sources.length, previous);
  audio.setMuted(false);
  assert.equal(timers.size, 1);
  audio.suspend();
  assert.equal(contexts[0].state, 'suspended');
  assert.equal(timers.size, 0);
  await audio.unlock();
  assert.equal(contexts[0].state, 'running');
  assert.equal(timers.size, 1);
  audio.destroy();
  assert.equal(timers.size, 0);
  assert.equal(contexts[0].state, 'closed');
  assert.equal(await audio.unlock(), false);
});

test('focus loss during a pending audio unlock cannot restart its scheduler', async t => {
  const { audio, contexts, timers, resolveResume } = harness(t, { deferredResume: true });
  const unlocking = audio.unlock();
  audio.suspend();
  resolveResume();
  assert.equal(await unlocking, false);
  assert.equal(contexts[0].state, 'suspended');
  assert.equal(timers.size, 0);
});

test('a terminal event stops the score but permits the final chord and a new run', async t => {
  const { audio, contexts, timers } = harness(t);
  await audio.unlock();
  const before = contexts[0].sources.length;
  audio.consume([{ type: 'run-end', phase: 'won' }]);
  assert.equal(timers.size, 0);
  assert.equal(contexts[0].sources.length, before + 4);
  await audio.unlock();
  assert.equal(timers.size, 1);
});
