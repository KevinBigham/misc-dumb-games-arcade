import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createCrossblock, rotateCells, rotatePiece, canPlace, pieceFits, hasMoves, previewPlacement, placePiece, undoMove } from '../src/sim/crossblock.js';
import { createCrossblockStorage } from '../src/crossblock-storage.js';
import { CROSSBLOCK_PROFILE_KEY as KEY } from '../src/contracts.js';

const piece = (cells, color = 1) => ({ name: 'Test', cells, color });
const square = () => piece([[0, 0], [1, 0], [0, 1], [1, 1]]);
function emptyWorld(seed = 1) { return createCrossblock(seed); }
function memoryStore(raw = null) {
  const values = new Map(raw == null ? [] : [[KEY, raw]]);
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
}

test('Crossblock seeded initial state and four rotations are reproducible', () => {
  assert.deepEqual(createCrossblock(342), createCrossblock(342));
  const world = emptyWorld(), before = structuredClone(world.hand[0].cells);
  for (let i = 0; i < 4; i++) rotatePiece(world, 0);
  assert.deepEqual(world.hand[0].cells, before);
  assert.equal(world.moves, 0); assert.equal(world.score, 0);
});
test('Crossblock rejects overlap, negative and fractional coordinates, and edge wrapping without mutation', () => {
  const world = emptyWorld(); world.hand = [square(), null, null]; world.board[0] = 2;
  for (const [x, y] of [[0, 0], [7, 0], [-1, 0], [0, 7], [0.5, 2], [NaN, 0]]) {
    const before = structuredClone(world);
    assert.equal(canPlace(world, world.hand[0], x, y), false); assert.deepEqual(placePiece(world, 0, x, y), []); assert.deepEqual(world, before);
  }
  assert.deepEqual(placePiece(world, 7, 0, 0), []);
});
test('Crossblock preview is read-only and a legal piece scores once', () => {
  const world = emptyWorld(); world.hand[0] = square(); const before = structuredClone(world);
  assert.equal(previewPlacement(world, 0, 2, 3).valid, true); assert.deepEqual(world, before);
  const events = placePiece(world, 0, 2, 3);
  assert.equal(world.score, 20); assert.equal(world.moves, 1); assert.equal(world.board.filter(Boolean).length, 4);
  assert.equal(events[0].type, 'placed'); assert.equal(world.hand[0], null);
  assert.deepEqual(placePiece(world, 0, 4, 4), []); assert.equal(world.score, 20);
});
test('Crossblock action validation rejects non-slot keys without throwing or mutating', () => {
  const world = createCrossblock(73), before = structuredClone(world);
  for (const slot of [-1, 3, 0.5, '1', 'map', '__proto__', null, undefined]) {
    assert.equal(previewPlacement(world, slot, 0, 0).valid, false);
    assert.deepEqual(rotatePiece(world, slot), []);
    assert.deepEqual(placePiece(world, slot, 0, 0), []);
    assert.deepEqual(world, before);
  }
});
test('Crossblock clears a full row while other blocks stay put', () => {
  const world = emptyWorld(); world.board.fill(1, 0, 6); world.board[56] = 3;
  world.hand[0] = piece([[0, 0], [1, 0]]);
  const events = placePiece(world, 0, 6, 0), cleared = events.find(event => event.type === 'cleared');
  assert.deepEqual(cleared.rows, [0]); assert.deepEqual(cleared.columns, []); assert.equal(cleared.points, 100);
  assert.equal(world.score, 110); assert.equal(world.lines, 1); assert.equal(world.board[56], 3); assert.ok(world.board.slice(0, 8).every(value => value === 0));
});
test('Crossblock clears a full column', () => {
  const world = emptyWorld(); for (let y = 0; y < 6; y++) world.board[y * 8] = 1;
  world.board[63] = 2; world.hand[0] = piece([[0, 0], [0, 1]]);
  const cleared = placePiece(world, 0, 0, 6).find(event => event.type === 'cleared');
  assert.deepEqual(cleared.columns, [0]); assert.deepEqual(cleared.rows, []); assert.equal(world.score, 110);
});
test('Crossblock clears a row and column simultaneously, counts their intersection once, and doubles line points', () => {
  const world = emptyWorld();
  for (let x = 1; x < 8; x++) world.board[x] = 2;
  for (let y = 2; y < 8; y++) world.board[y * 8] = 3;
  world.board[63] = 4; world.hand[0] = piece([[0, 0], [0, 1]]);
  const preview = previewPlacement(world, 0, 0, 0); assert.equal(preview.cleared.length, 15);
  const clear = placePiece(world, 0, 0, 0).find(event => event.type === 'cleared');
  assert.equal(clear.cross, true); assert.equal(clear.points, 800); assert.equal(world.score, 810);
  assert.equal(world.lines, 2); assert.equal(world.crosses, 1); assert.equal(world.board.filter(Boolean).length, 1);
});
test('Crossblock rewards multiple parallel lines and an empty board', () => {
  const world = emptyWorld(); for (let y = 0; y < 2; y++) for (let x = 0; x < 6; x++) world.board[y * 8 + x] = 1;
  world.hand[0] = square(); const events = placePiece(world, 0, 6, 0);
  assert.equal(events.find(event => event.type === 'cleared').points, 400);
  assert.ok(events.some(event => event.type === 'perfect-clear')); assert.equal(world.score, 920); assert.ok(world.board.every(value => value === 0));
});
test('Crossblock streak adds fifty per extra clearing move and resets on a non-clear', () => {
  const world = emptyWorld(); world.board[63] = 1;
  for (let y = 0; y < 2; y++) for (let x = 0; x < 6; x++) world.board[y * 8 + x] = 1;
  world.hand = [piece([[0, 0], [1, 0]]), piece([[0, 0], [1, 0]]), square()];
  placePiece(world, 0, 6, 0); const events = placePiece(world, 1, 6, 1);
  assert.equal(world.chain, 2); assert.equal(events.find(event => event.type === 'cleared').points, 150);
  placePiece(world, 2, 2, 3); assert.equal(world.chain, 0);
});
test('Crossblock move detection checks all rotations without changing piece or RNG', () => {
  const world = emptyWorld(); world.board.fill(1); world.board[2] = 0; world.board[10] = 0; world.board[18] = 0;
  world.hand = [piece([[0, 0], [1, 0], [2, 0]]), null, null]; const before = structuredClone(world);
  assert.equal(canPlace(world, world.hand[0], 2, 0), false); assert.equal(pieceFits(world, world.hand[0]), true); assert.equal(hasMoves(world), true);
  assert.deepEqual(world, before);
});
test('Crossblock ends only when no remaining shape fits, and undo revives the round', () => {
  const world = emptyWorld();
  world.board = Array.from({ length: 64 }, (_, i) => (i + Math.floor(i / 8)) % 2 ? 1 : 0);
  world.board[1] = 0; world.hand = [piece([[0, 0], [1, 0]]), square(), square()];
  assert.ok(hasMoves(world)); const before = structuredClone(world);
  const events = placePiece(world, 0, 0, 0); assert.equal(world.status, 'over'); assert.ok(events.some(event => event.type === 'game-over'));
  assert.deepEqual(placePiece(world, 1, 0, 0), []); undoMove(world); assert.deepEqual(world, before);
});
test('Crossblock undo restores exact next-hand RNG and cannot undo twice', () => {
  const world = emptyWorld(986); world.hand = [square(), null, null]; const before = structuredClone(world);
  placePiece(world, 0, 0, 0); const dealt = structuredClone(world); assert.equal(world.hand.filter(Boolean).length, 3);
  undoMove(world); assert.deepEqual(world, before); assert.deepEqual(undoMove(world), []);
  placePiece(world, 0, 0, 0); assert.deepEqual(world, dealt);
});
test('Crossblock long seeded playthroughs keep board and scoring invariants', () => {
  function run(seed) {
    const world = emptyWorld(seed);
    for (let move = 0; move < 160 && world.status === 'playing'; move++) {
      let best;
      for (let slot = 0; slot < 3; slot++) {
        if (!world.hand[slot]) continue;
        let candidate = structuredClone(world.hand[slot]);
        for (let rotation = 0; rotation < 4; rotation++) {
          for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
            if (!canPlace(world, candidate, x, y)) continue;
            const trial = { ...world, hand: [...world.hand] }; trial.hand[slot] = candidate;
            const preview = previewPlacement(trial, slot, x, y), weight = preview.cleared.length * 100 + y * 8 + x;
            if (!best || weight > best.weight) best = { slot, rotation, x, y, weight };
          }
          candidate = { ...candidate, cells: rotateCells(candidate.cells) };
        }
      }
      assert.ok(best, 'Playing world must contain a legal move');
      for (let r = 0; r < best.rotation; r++) rotatePiece(world, best.slot);
      const score = world.score; placePiece(world, best.slot, best.x, best.y);
      assert.ok(world.score > score); assert.ok(world.board.every(value => Number.isInteger(value) && value >= 0 && value <= 6));
      for (let line = 0; line < 8; line++) {
        assert.ok(Array.from({ length: 8 }, (_, x) => world.board[line * 8 + x]).includes(0));
        assert.ok(Array.from({ length: 8 }, (_, y) => world.board[y * 8 + line]).includes(0));
      }
      assert.equal(world.status === 'playing', hasMoves(world));
    }
    return world;
  }
  for (const seed of [1, 11, 42]) assert.deepEqual(run(seed), run(seed));
});
test('Crossblock profile fixture loads and best score merges across tabs', () => {
  const raw = readFileSync(new URL('./fixtures/crossblock-v1.json', import.meta.url), 'utf8'), mem = memoryStore(raw);
  const first = createCrossblockStorage(mem), second = createCrossblockStorage(mem);
  assert.equal(first.load().bestScore, 1240); first.save({ bestScore: 2000, muted: false }); second.save({ bestScore: 10, muted: true });
  assert.deepEqual(JSON.parse(mem.getItem(KEY)), { version: 1, bestScore: 2000, muted: true });
});
test('Crossblock never overwrites future, malformed, or unrelated profiles', () => {
  for (const raw of ['{bad', 'null', '{"version":9,"bestScore":12,"muted":false}', '{"version":1,"bestScore":-1,"muted":false}']) {
    const mem = memoryStore(raw); mem.setItem('sideline.franchise', 'untouched');
    const storage = createCrossblockStorage(mem); assert.equal(storage.save({ bestScore: 100, muted: false }), false);
    assert.equal(mem.getItem(KEY), raw); assert.equal(mem.getItem('sideline.franchise'), 'untouched');
  }
  const mem = memoryStore(), storage = createCrossblockStorage(mem);
  mem.setItem(KEY, '{"version":2}'); assert.equal(storage.save({ bestScore: 100, muted: false }), false); assert.equal(mem.getItem(KEY), '{"version":2}');
});
test('Crossblock tolerates missing and throwing storage', () => {
  for (const storage of [undefined, { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } }]) {
    const store = createCrossblockStorage(storage); assert.equal(store.load().bestScore, 0); assert.equal(store.save({ bestScore: 200, muted: false }), false);
  }
});
