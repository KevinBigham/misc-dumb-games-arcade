import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createFranchise } from '../src/sim/franchise.js';
import { createFranchiseStorage, parseFranchise, validateFranchise } from '../src/franchise-storage.js';
import { FRANCHISE_KEY } from '../src/contracts.js';

function backend(initial = null) {
  const map = new Map(initial === null ? [] : [[FRANCHISE_KEY, initial]]);
  return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) };
}
test('save fixture validates and storage round-trips an entire franchise without touching Echo profile', async () => {
  const raw = await readFile(new URL('./fixtures/franchise-v1.json', import.meta.url), 'utf8');
  const s = parseFranchise(raw), b = backend(); b.setItem('echo-requiem.profile', '{"version":1,"bestScore":99}');
  const storage = createFranchiseStorage(b); assert.equal(storage.load(), null); assert.equal(storage.save(s), true);
  assert.deepEqual(storage.load(), s); assert.equal(b.getItem('echo-requiem.profile'), '{"version":1,"bestScore":99}');
});
test('unknown versions and malformed existing saves remain byte-for-byte protected, even without load', () => {
  for (const raw of ['{"version":2}', '{broken', '{"version":1}', '[]', 'null']) {
    const b = backend(raw), storage = createFranchiseStorage(b);
    assert.equal(storage.load(), null); assert.equal(storage.writable, false); assert.equal(storage.save(createFranchise()), false);
    assert.equal(b.getItem(FRANCHISE_KEY), raw); assert.match(storage.error, /protected/);
  }
});
test('concurrent tabs fail closed instead of overwriting another tab’s progress', () => {
  const b = backend(), a = createFranchiseStorage(b), other = createFranchiseStorage(b), s = createFranchise();
  assert.equal(a.save(s), true); s.week = 2;
  assert.equal(other.save(s), false); assert.match(other.error, /Another tab/); assert.equal(parseFranchise(b.getItem(FRANCHISE_KEY)).week, 1);
});
test('storage quota failures report failure without altering the existing save', () => {
  const raw = JSON.stringify(createFranchise()); const b = backend(raw); b.setItem = () => { throw new Error('quota exceeded'); };
  const storage = createFranchiseStorage(b); const s = storage.load();
  assert.equal(storage.save(s), false); assert.match(storage.error, /quota exceeded/); assert.equal(b.getItem(FRANCHISE_KEY), raw);
});
test('import validation rejects broken references, duplicate players, unsafe money and missing nested fields', () => {
  const mutations = [s => { s.players[0].teamId = 999; }, s => { s.players[1].id = s.players[0].id; }, s => { s.teams[0].cash = Infinity; }, s => { delete s.players[0].stats; }, s => { s.schedule[0].home = s.schedule[0].away; }, s => { s.rngState = -1; }, s => { s.teams[0].name = '<script>alert(1)</script>'; }, s => { s.phase = 'draft'; }, s => { s.prospects[0].estimate = 'great'; }];
  for (const mutate of mutations) { const s = createFranchise(); mutate(s); assert.throws(() => validateFranchise(s)); }
  assert.throws(() => parseFranchise(' '.repeat(8_000_001)), /8 MB/);
});
