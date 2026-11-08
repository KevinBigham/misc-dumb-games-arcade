import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LIGHT_PROFILE_KEY } from '../src/contracts.js';
import { createLight, stepLight, chooseLight, finishLight } from '../src/sim/last-light.js';
import { lightPilot } from './last-light-bot.js';
import { createLightStorage, defaultLightProfile, validateLightProfile, makeLightCheckpoint, restoreLightCheckpoint, validateLightCheckpoint } from '../src/last-light-storage.js';
import { lightRecord } from '../src/sim/last-light-story.js';

function memoryStorage() {
  const data = new Map();
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}

test('Last Light save: v1 fixture restores and leaves both existing game namespaces untouched', async () => {
  const fixture = JSON.parse(await readFile(new URL('./fixtures/last-light-v1.json', import.meta.url), 'utf8'));
  assert.ok(validateLightProfile(fixture));
  const backing = memoryStorage(); backing.setItem('sideline.franchise', 'untouched football'); backing.setItem('echo-requiem.profile', 'untouched echo');
  const store = createLightStorage(backing); store.load(); assert.ok(store.save(fixture));
  const loaded = createLightStorage(backing).load();
  assert.deepEqual(restoreLightCheckpoint(loaded.checkpoint), fixture.checkpoint.world);
  assert.equal(backing.getItem('sideline.franchise'), 'untouched football'); assert.equal(backing.getItem('echo-requiem.profile'), 'untouched echo');
});

test('Last Light save: only night starts, councils, and the final decision can be checkpointed', () => {
  const w = createLight(42, 'story'); assert.ok(makeLightCheckpoint(w));
  stepLight(w); assert.equal(makeLightCheckpoint(w), null);
  const path = ['fork', 'sentinel', 'precision', 'closed']; let safePoints = 1;
  for (let tick = 0; tick < 20000 && !['ending', 'lost'].includes(w.phase); tick++) {
    if (w.phase === 'council') {
      assert.ok(makeLightCheckpoint(w), `council ${w.wave}`); safePoints++;
      chooseLight(w, path[w.wave - 1]); assert.ok(makeLightCheckpoint(w), `night ${w.wave}`); safePoints++;
    }
    stepLight(w, lightPilot(w));
  }
  assert.equal(w.phase, 'ending'); assert.ok(makeLightCheckpoint(w)); assert.equal(safePoints, 9);
  finishLight(w, 'keep'); assert.equal(makeLightCheckpoint(w), null);
});

test('Last Light save: checkpoint restore reproduces subsequent events and RNG exactly', () => {
  const original = createLight(7919, 'standard', 'people');
  const restored = restoreLightCheckpoint(makeLightCheckpoint(original));
  for (let i = 0; i < 1800; i++) { const input = lightPilot(original); assert.deepEqual(stepLight(original, input), stepLight(restored, input)); }
  assert.deepEqual(original, restored);
});

test('Last Light save: unknown versions, malformed JSON, and invalid checkpoints remain byte-for-byte intact', () => {
  for (const raw of ['{"version":99}', '{broken', JSON.stringify({ ...defaultLightProfile(), checkpoint: { version: 99, world: {} } })]) {
    const backing = memoryStorage(); backing.setItem(LIGHT_PROFILE_KEY, raw);
    const store = createLightStorage(backing); const fresh = store.load();
    assert.equal(store.writable, false); assert.ok(store.error); assert.equal(store.save(fresh), false); assert.equal(backing.getItem(LIGHT_PROFILE_KEY), raw);
  }
});

test('Last Light save: save-before-load cannot overwrite an unknown profile', () => {
  const backing = memoryStorage(); backing.setItem(LIGHT_PROFILE_KEY, '{"version":42}');
  assert.equal(createLightStorage(backing).save(defaultLightProfile()), false);
  assert.equal(backing.getItem(LIGHT_PROFILE_KEY), '{"version":42}');
});

test('Last Light save: stale tabs cannot erase a newer checkpoint', () => {
  const backing = memoryStorage(), a = createLightStorage(backing), b = createLightStorage(backing);
  const one = a.load(), two = b.load(); one.checkpoint = makeLightCheckpoint(createLight(7));
  assert.ok(a.save(one)); const saved = backing.getItem(LIGHT_PROFILE_KEY);
  two.checkpoint = makeLightCheckpoint(createLight(8)); assert.equal(b.save(two), false);
  assert.equal(backing.getItem(LIGHT_PROFILE_KEY), saved); assert.match(b.error, /Another tab/);
});

test('Last Light save: unavailable storage and quota failure keep gameplay independent', () => {
  const disabled = createLightStorage(null); assert.ok(disabled.load()); assert.equal(disabled.save(defaultLightProfile()), false);
  const backing = memoryStorage(), store = createLightStorage(backing), profile = store.load();
  assert.ok(store.save(profile)); const before = backing.getItem(LIGHT_PROFILE_KEY);
  backing.setItem = () => { throw new Error('QuotaExceededError'); };
  profile.checkpoint = makeLightCheckpoint(createLight()); assert.equal(store.save(profile), false);
  assert.equal(backing.getItem(LIGHT_PROFILE_KEY), before); assert.match(store.error, /could not save/);
});

test('Last Light save: hostile or incomplete state fails validation before reaching the simulation', () => {
  const mutations = [
    c => { c.world.player = {}; },
    c => { c.world.player.hp = -1; },
    c => { c.world.mods.fireRate = 0; },
    c => { c.world.mods.turret = 'yes'; },
    c => { c.world.deck[0] = c.world.deck[1]; },
    c => { c.world.memories[0].text = '<img src=x onerror=alert(1)>'; },
    c => { c.world.people[0].id = c.world.memories[0].id; },
    c => { c.world.stats.rescued = 999; },
    c => { c.world.personIndex = 99; },
    c => { c.world.phase = 'won'; },
    c => { c.world.protectedId = 99999; },
    c => { c.world.promise.id = 'invented'; },
    c => { c.world.enemies = [{}]; },
    c => { c.world.beams = [{}]; },
  ];
  for (const mutate of mutations) { const checkpoint = makeLightCheckpoint(createLight()); mutate(checkpoint); assert.equal(validateLightCheckpoint(checkpoint), false); assert.equal(restoreLightCheckpoint(checkpoint), null); }
});

test('Last Light save: completed records survive round-trip and checkpoints never alias live state', () => {
  const w = createLight(); const checkpoint = makeLightCheckpoint(w); w.player.hp = 25;
  assert.equal(checkpoint.world.player.hp, 100);
  w.phase = 'lost'; w.lossReason = 'keeper';
  // Endings account for people still outside; exercise the actual loss transition.
  w.phase = 'playing'; w.player.hp = 0; stepLight(w);
  const profile = defaultLightProfile(); profile.history = [{ ...lightRecord(w), id: 'record-1', completedAt: '2026-11-08T04:00:00Z' }];
  assert.ok(validateLightProfile(profile));
  const store = createLightStorage(memoryStorage()); store.load(); assert.ok(store.save(profile));
});
