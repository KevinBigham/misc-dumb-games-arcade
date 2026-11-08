import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { HONK_PROFILE_KEY } from '../src/contracts.js';
import { createHonk } from '../src/sim/honk.js';
import { createHonkStorage, defaultHonkProfile, validateHonkProfile, recordHonkResult } from '../src/honk/storage.js';

function memory(initial = {}) { const data = new Map(Object.entries(initial)); return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; }
function result(mode = 'career') { const s = createHonk(44, { mode }); s.phase = 'won'; s.shift = 3; s.score = 9999; s.stats.bosses = 1; s.stats.meetings = 55; return s; }
test('initial version-one fixture matches the defaults and round-trips', async () => {
  const fixture = JSON.parse(await readFile(new URL('./fixtures/honk-v1.json', import.meta.url), 'utf8'));
  assert.deepEqual(fixture, defaultHonkProfile()); assert.equal(validateHonkProfile(fixture), true);
  const storage = memory(), store = createHonkStorage(storage); store.load(); store.transact(p => recordHonkResult(p, result()));
  const next = createHonkStorage(storage).load(); assert.equal(next.best.career, 9999); assert.equal(next.runs, 1); assert.equal(next.wins, 1); assert.ok(next.awards.includes('ceo'));
});
test('settings and earned records survive reload without touching other games', () => {
  const storage = memory({ 'sideline.franchise': 'football', 'echo-requiem.profile': 'echo', 'moon.profile': 'moon' });
  const store = createHonkStorage(storage); store.transact(p => { p.settings.muted = true; p.settings.autoHonk = true; return p; });
  assert.equal(createHonkStorage(storage).load().settings.autoHonk, true); assert.equal(storage.data.get('sideline.franchise'), 'football'); assert.equal(storage.data.get('echo-requiem.profile'), 'echo'); assert.equal(storage.data.get('moon.profile'), 'moon');
});
test('future and malformed profiles remain byte-for-byte protected even before load', () => {
  for (const raw of ['{"version":99,"precious":"future career"}', '{broken', JSON.stringify({ ...defaultHonkProfile(), best: { career: -5, casual: 0 } })]) {
    const storage = memory({ [HONK_PROFILE_KEY]: raw }), store = createHonkStorage(storage);
    const p = store.transact(previous => recordHonkResult(previous, result()));
    assert.equal(storage.data.get(HONK_PROFILE_KEY), raw); assert.equal(store.status, 'protected'); assert.equal(p.best.career, 9999);
  }
});
test('a format changed by another tab is protected on the next write', () => {
  const storage = memory({ [HONK_PROFILE_KEY]: JSON.stringify(defaultHonkProfile()) }), store = createHonkStorage(storage); store.load();
  const future = '{"version":55}'; storage.setItem(HONK_PROFILE_KEY, future);
  store.transact(p => recordHonkResult(p, result())); assert.equal(storage.getItem(HONK_PROFILE_KEY), future); assert.equal(store.status, 'protected');
});
test('latest valid records and awards merge before writing from a stale tab', () => {
  const storage = memory(), a = createHonkStorage(storage), b = createHonkStorage(storage); a.load(); b.load();
  a.transact(p => recordHonkResult(p, result()));
  const lower = result('casual'); lower.score = 1000;
  const profile = b.transact(p => recordHonkResult(p, lower)); assert.equal(profile.best.career, 9999); assert.equal(profile.best.casual, 1000); assert.equal(profile.runs, 2);
  assert.ok(profile.awards.includes('ceo'));
});
test('storage denial never prevents session play and never attempts a blind overwrite', () => {
  let writes = 0; const storage = { getItem() { throw new Error('denied'); }, setItem() { writes++; } }, store = createHonkStorage(storage);
  const profile = store.transact(p => recordHonkResult(p, result())); assert.equal(profile.wins, 1); assert.equal(store.status, 'session'); assert.equal(writes, 0);
  const unavailable = createHonkStorage(); assert.equal(unavailable.load().runs, 0); assert.equal(unavailable.status, 'session');
});
test('quota failure retains every later session result in memory', () => {
  const raw = JSON.stringify(defaultHonkProfile()); let writes = 0;
  const store = createHonkStorage({ getItem: () => raw, setItem() { writes++; throw new Error('quota'); } });
  store.load(); store.transact(p => recordHonkResult(p, result())); const profile = store.transact(p => recordHonkResult(p, result()));
  assert.equal(profile.runs, 2); assert.equal(profile.wins, 2); assert.equal(writes, 1); assert.equal(store.status, 'session');
});
test('overtime extends records without counting the same career repeatedly', () => {
  const store = createHonkStorage(), s = result(); store.transact(p => recordHonkResult(p, s));
  s.overtime = 2; s.stats.bosses = 3; s.score = 15000;
  const p = store.transact(previous => recordHonkResult(previous, s)); assert.equal(p.runs, 1); assert.equal(p.wins, 1); assert.equal(p.overtime.career, 2); assert.equal(p.best.career, 15000); assert.ok(p.awards.includes('overqualified'));
});
test('locked cosmetics, unknown awards and malformed settings are rejected', () => {
  const p = defaultHonkProfile(); p.settings.tie = 'gold'; assert.equal(validateHonkProfile(p), false);
  p.awards.push('ceo'); assert.equal(validateHonkProfile(p), true);
  p.awards.push('script'); assert.equal(validateHonkProfile(p), false);
  p.awards = ['ceo']; p.settings.autoHonk = 'yes'; assert.equal(validateHonkProfile(p), false);
  assert.throws(() => createHonkStorage().transact(profile => ({ ...profile, version: 99 })), /Invalid/);
});
test('reading or recording returns independent objects and live runs do not increment results', () => {
  const store = createHonkStorage(), p = store.load(); p.settings.muted = true; assert.equal(store.load().settings.muted, false);
  const s = createHonk(), before = structuredClone(s), profile = defaultHonkProfile();
  assert.deepEqual(recordHonkResult(profile, s), profile); assert.deepEqual(s, before);
  s.phase = 'lost'; const next = recordHonkResult(profile, s); assert.equal(next.runs, 1); assert.equal(next.wins, 0); assert.equal(profile.runs, 0);
});
