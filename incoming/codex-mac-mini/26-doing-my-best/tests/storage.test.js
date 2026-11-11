import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createStorage, PROFILE_KEY } from '../src/storage.js';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/profile-v1.json', import.meta.url), 'utf8'));
const memoryStorage = (raw = null) => {
  const values = new Map(raw === null ? [] : [[PROFILE_KEY, raw]]);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
};

test('a missing profile creates independent version-one defaults', () => {
  const store = createStorage(memoryStorage());
  const first = store.load();
  assert.deepEqual(first, { version: 1, settings: { muted: false, reducedMotion: false }, bestScore: 0, lastSeed: 1 });
  first.settings.muted = true;
  assert.equal(store.load().settings.muted, false);
  assert.equal(store.writable, true);
});

test('version-one fixture survives load, save and reload without adding persistent powers', () => {
  const disk = memoryStorage(JSON.stringify(fixture));
  const store = createStorage(disk);
  assert.deepEqual(store.load(), fixture);
  assert.equal(store.save({ ...fixture, bestScore: 29000, accidentalRun: { hp: 100 } }), true);
  const result = createStorage(disk).load();
  assert.deepEqual(result, { ...fixture, bestScore: 29000 });
  assert.deepEqual(Object.keys(JSON.parse(disk.getItem(PROFILE_KEY))).sort(), ['bestScore', 'lastSeed', 'settings', 'version']);
});

test('an unknown future profile is preserved byte-for-byte and cannot be overwritten', () => {
  const original = '{ "version": 2, "campaign": { "season": 10 }, "settings": { "muted": true } }';
  const disk = memoryStorage(original);
  const store = createStorage(disk);
  assert.equal(store.load().version, 1);
  assert.equal(store.writable, false);
  assert.equal(store.save(fixture), false);
  assert.equal(disk.getItem(PROFILE_KEY), original);
});

test('future versions are protected even when save is called before load', () => {
  const original = '{"version":999,"irreplaceable":true}';
  const disk = memoryStorage(original);
  const store = createStorage(disk);
  assert.equal(store.save(fixture), false);
  assert.equal(disk.getItem(PROFILE_KEY), original);
});

test('malformed JSON recovers to defaults and can be replaced by a valid profile', () => {
  const disk = memoryStorage('{half-written');
  const store = createStorage(disk);
  assert.equal(store.load().bestScore, 0);
  assert.equal(store.writable, true);
  assert.equal(store.save(fixture), true);
  assert.deepEqual(store.load(), fixture);
});

test('invalid fields cannot poison a valid profile or enable settings by truthiness', () => {
  const disk = memoryStorage(JSON.stringify({ version: 1, bestScore: -12, lastSeed: 'oops', settings: { muted: 'false', reducedMotion: true } }));
  assert.deepEqual(createStorage(disk).load(), { version: 1, bestScore: 0, lastSeed: 1, settings: { muted: false, reducedMotion: true } });
});

test('unavailable and quota-limited storage remain playable and report write failure', () => {
  const denied = createStorage({ getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('SecurityError'); } });
  assert.equal(denied.load().lastSeed, 1);
  assert.equal(denied.writable, false);
  assert.equal(denied.save(fixture), false);
  const full = createStorage({ getItem() { return null; }, setItem() { throw new Error('QuotaExceededError'); } });
  assert.equal(full.save(fixture), false);
  assert.equal(full.writable, false);
});

test('a profile changed externally to a future version is never overwritten', () => {
  const disk = memoryStorage();
  const store = createStorage(disk);
  store.load();
  disk.setItem(PROFILE_KEY, '{"version":3,"season":10}');
  assert.equal(store.save(fixture), false);
  assert.equal(disk.getItem(PROFILE_KEY), '{"version":3,"season":10}');
});

test('a stale tab can save settings without erasing another tab\'s higher best score', () => {
  const disk = memoryStorage();
  const firstTab = createStorage(disk);
  const secondTab = createStorage(disk);
  const firstProfile = firstTab.load();
  const staleProfile = secondTab.load();
  firstProfile.bestScore = 5000;
  assert.equal(firstTab.save(firstProfile), true);
  staleProfile.settings.muted = true;
  const beforeSave = structuredClone(staleProfile);
  assert.equal(secondTab.save(staleProfile), true);
  assert.deepEqual(secondTab.load(), { ...firstProfile, settings: { muted: true, reducedMotion: false } });
  assert.deepEqual(staleProfile, beforeSave, 'save must not mutate the caller profile');
});

test('a lower run result preserves the stored record while updating its seed', () => {
  const disk = memoryStorage(JSON.stringify(fixture));
  const store = createStorage(disk);
  const lowerRun = { ...fixture, bestScore: 1200, lastSeed: 42 };
  assert.equal(store.save(lowerRun), true);
  assert.deepEqual(store.load(), { ...fixture, lastSeed: 42 });
  assert.equal(lowerRun.bestScore, 1200);
  assert.equal(store.save({ ...lowerRun, bestScore: 24000 }), true);
  assert.equal(store.load().bestScore, 24000);
});
