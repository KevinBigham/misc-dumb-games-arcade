import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { MOON_PROFILE_KEY } from '../src/contracts.js';
import { createMoonStorage, defaultMoonProfile, validMoonProfile, moonDailySeed } from '../src/moon-storage.js';

function memory(value) {
  const data = new Map(value === undefined ? [] : [[MOON_PROFILE_KEY, value]]);
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, v) => data.set(key, v) };
}
function result(overrides = {}) { return { token: 'run:1:0', score: 12000, cycle: 0, difficulty: 'night', loadout: 'classic', mode: 'free', day: '', won: true, ...overrides }; }

test('moon profile fixture matches initial schema and round-trips only its own namespace', async () => {
  const fixture = JSON.parse(await readFile(new URL('./fixtures/moon-v1.json', import.meta.url), 'utf8'));
  assert.deepEqual(fixture, defaultMoonProfile()); assert.equal(validMoonProfile(fixture), true);
  const raw = memory(); raw.data.set('echo-requiem.profile', 'untouched'); raw.data.set('sideline.franchise', 'untouched');
  const storage = createMoonStorage(raw); assert.equal(storage.fresh, true);
  storage.settings({ muted: true, difficulty: 'fever', loadout: 'tank' });
  const reloaded = createMoonStorage(raw).load(); assert.equal(reloaded.settings.muted, true); assert.equal(reloaded.settings.loadout, 'tank');
  assert.equal(raw.data.get('echo-requiem.profile'), 'untouched'); assert.equal(raw.data.get('sideline.franchise'), 'untouched');
});
test('moon unknown or corrupted profiles remain byte-for-byte protected even across stale tabs', () => {
  for (const original of ['{"version":99,"future":"keep"}', 'not-json', '{"version":1,"settings":null}']) {
    const raw = memory(original), storage = createMoonStorage(raw);
    storage.settings({ muted: true }); storage.record(result());
    assert.equal(storage.status, 'protected'); assert.equal(raw.data.get(MOON_PROFILE_KEY), original);
    assert.equal(storage.load().settings.muted, true, 'session controls remain useful');
  }
  const raw = memory(), stale = createMoonStorage(raw);
  raw.data.set(MOON_PROFILE_KEY, '{"version":2}'); stale.settings({ autoAim: true });
  assert.equal(raw.data.get(MOON_PROFILE_KEY), '{"version":2}');
});
test('moon records deduplicate results, preserve higher scores, and merge concurrent tabs', () => {
  const raw = memory(), a = createMoonStorage(raw), b = createMoonStorage(raw);
  a.record(result()); a.record(result()); assert.equal(a.load().suns, 1);
  b.record(result({ token: 'run:2:0', score: 11000, loadout: 'courier' }));
  a.record(result({ token: 'run:3:0', score: 14000, loadout: 'tank' }));
  const merged = a.load(); assert.equal(merged.suns, 3); assert.equal(merged.best.night, 14000);
  assert.deepEqual(merged.winsWith, ['classic', 'courier', 'tank']); assert.ok(merged.badges.includes('all-builds'));
  b.settings({ reduced: true }); assert.equal(b.load().best.night, 14000); assert.equal(b.load().suns, 3);
});
test('moon daily and overtime results stay separate and old days cannot replace newer records', () => {
  const storage = createMoonStorage(memory());
  storage.record(result({ token: 'daily:1', mode: 'daily', day: '2026-11-07', score: 3000 }));
  storage.record(result({ token: 'daily:2', mode: 'daily', day: '2026-11-08', score: 2000 }));
  storage.record(result({ token: 'daily:3', mode: 'daily', day: '2026-11-07', score: 99999 }));
  storage.record(result({ token: 'over:1', cycle: 1, score: 20000 }));
  const p = storage.load(); assert.equal(p.daily.day, '2026-11-08'); assert.equal(p.daily.score, 2000);
  assert.equal(p.best.night, 0); assert.equal(p.best.overtime, 20000);
  assert.equal(moonDailySeed('2026-11-07'), moonDailySeed('2026-11-07'));
  assert.notEqual(moonDailySeed('2026-11-07'), moonDailySeed('2026-11-08'));
});
test('moon storage failures preserve session progress and reject invalid values', () => {
  const raw = memory(); raw.setItem = () => { throw new Error('quota'); };
  const storage = createMoonStorage(raw);
  storage.record(result()); storage.settings({ muted: true }); storage.record(result({ token: 'new', score: 15000 }));
  assert.equal(storage.status, 'unavailable'); assert.equal(storage.load().suns, 2); assert.equal(storage.load().best.night, 15000);
  const before = storage.load(); storage.record(result({ score: Infinity })); assert.deepEqual(storage.load(), before);
  storage.settings({ loadout: '<script>', difficulty: 'impossible', muted: 'no' }); assert.deepEqual(storage.load(), before);
  storage.discover(['portal', '<script>'], ['enemy:chair', 'enemy:fake']);
  assert.deepEqual(storage.load().badges, ['portal']); assert.deepEqual(storage.load().discovered, ['enemy:chair']);
  assert.equal(createMoonStorage(null).status, 'unavailable');
});
test('moon profile validation rejects nonfinite scores, arbitrary badge strings and invalid settings', () => {
  for (const mutate of [p => { p.best.night = NaN; }, p => { p.badges = ['fake']; }, p => { p.discovered = ['<script>']; }, p => { p.settings.loadout = 'fake'; }, p => { p.suns = -1; }]) {
    const p = defaultMoonProfile(); mutate(p); assert.equal(validMoonProfile(p), false);
  }
});
test('moon daily seeds reject impossible dates and accept real leap days', () => {
  for (const day of ['', '2026-00-08', '2026-13-08', '2026-11-31', '2026-02-29', '1900-02-29', '2026-11-00', '0000-11-08']) {
    assert.throws(() => moonDailySeed(day));
  }
  assert.equal(Number.isInteger(moonDailySeed('2000-02-29')), true);
  assert.equal(Number.isInteger(moonDailySeed('2028-02-29')), true);
  const storage = createMoonStorage(memory());
  storage.record(result({ mode: 'daily', day: '2026-02-29' }));
  assert.equal(storage.load().suns, 0);
});
