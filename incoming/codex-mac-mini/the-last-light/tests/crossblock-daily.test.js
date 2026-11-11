import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createCrossblock, createDailyCrossblock, rotatePiece, placePiece, undoMove, canPlace } from '../src/sim/crossblock.js';
import { dailyPuzzle, validPuzzleKey } from '../src/sim/crossblock-puzzles.js';
import { createCrossblockSessionStorage, validCrossblockRun } from '../src/crossblock-session.js';
import { CROSSBLOCK_SESSION_KEY as KEY } from '../src/contracts.js';
const signature = cells => cells.map(([x, y]) => `${x},${y}`).sort().join(';');
const emptySession = () => ({ version: 1, revision: 0, mode: 'free', free: createCrossblock(1234), daily: null, completedDaily: null });
function memoryStore(raw = null) {
  const values = new Map(raw == null ? [] : [[KEY, raw]]);
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
function solve(world, order = [0, 1, 2]) {
  const { solutions } = dailyPuzzle(world.puzzleKey);
  let last;
  for (const slot of order) {
    const solution = solutions[slot];
    for (let rotation = 0; rotation < 4 && signature(world.hand[slot].cells) !== signature(solution.piece.cells); rotation++) rotatePiece(world, slot);
    assert.equal(signature(world.hand[slot].cells), signature(solution.piece.cells));
    last = placePiece(world, slot, solution.x, solution.y);
    assert.ok(last.length, `Daily solution failed at ${world.puzzleKey}/${slot}`);
    assert.ok(validCrossblockRun(world), 'Result must be resumable');
  }
  return last;
}

test('Crossblock daily puzzle keys validate calendar dates without simulation clocks', () => {
  for (const key of ['2026-11-07', '2028-02-29', '2000-02-29']) assert.ok(validPuzzleKey(key));
  for (const key of ['2026-02-29', '2100-02-29', '2026-13-01', '2026-11-31', '2026-1-01', '', null]) {
    assert.equal(validPuzzleKey(key), false); assert.throws(() => createDailyCrossblock(key));
  }
});
test('Crossblock daily is deterministic and all 365 generated days have a complete three-move solution', () => {
  const layouts = new Set();
  for (let day = 0; day < 365; day++) {
    const key = new Date(Date.UTC(2027, 0, 1 + day)).toISOString().slice(0, 10);
    const world = createDailyCrossblock(key);
    assert.deepEqual(world, createDailyCrossblock(key)); assert.ok(validCrossblockRun(world));
    layouts.add(JSON.stringify(world.board));
    const events = solve(world);
    assert.equal(world.status, 'won'); assert.equal(world.moves, 3); assert.ok(world.hand.every(value => value === null));
    assert.ok(world.board.every(value => value === 0)); assert.ok(events.some(event => event.type === 'puzzle-won'));
    assert.ok(!events.some(event => event.type === 'dealt')); assert.deepEqual(placePiece(world, 0, 0, 0), []);
    undoMove(world); assert.equal(world.status, 'playing'); assert.equal(world.moves, 2); assert.ok(validCrossblockRun(world));
  }
  assert.ok(layouts.size >= 30, `Expected varied templates/orientations; got ${layouts.size}`);
});
test('Crossblock daily solution supports any choice of shape order', () => {
  const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  for (let day = 1; day <= 12; day++) for (const order of orders) {
    const world = createDailyCrossblock(`2026-11-${String(day).padStart(2, '0')}`);
    solve(world, order); assert.equal(world.status, 'won');
  }
});
test('Crossblock daily loses when all three pieces are spent without clearing the board', () => {
  const world = createDailyCrossblock('2026-11-07');
  for (let slot = 0; slot < 3 && world.status === 'playing'; slot++) {
    let placed = false;
    for (let rotation = 0; rotation < 4 && !placed; rotation++) {
      for (let y = 0; y < 8 && !placed; y++) for (let x = 0; x < 8 && !placed; x++) {
        if (canPlace(world, world.hand[slot], x, y)) { placePiece(world, slot, x, y); placed = true; }
      }
      if (!placed) rotatePiece(world, slot);
    }
  }
  assert.equal(world.status, 'over'); assert.ok(world.board.some(Boolean)); assert.ok(validCrossblockRun(world));
});
test('Crossblock session round-trips both games, solved daily record, and undo', () => {
  const mem = memoryStore(), storage = createCrossblockSessionStorage(mem), session = emptySession();
  placePiece(session.free, 0, 0, 0);
  session.daily = createDailyCrossblock('2026-11-07'); solve(session.daily);
  session.completedDaily = { key: '2026-11-07', score: session.daily.score }; session.mode = 'daily';
  assert.ok(storage.save(session));
  const restored = createCrossblockSessionStorage(mem).load();
  assert.deepEqual(restored.free, session.free); assert.deepEqual(restored.daily, session.daily); assert.deepEqual(restored.completedDaily, session.completedDaily);
  undoMove(restored.free); assert.equal(restored.free.moves, 0); assert.ok(restored.free.board.every(value => value === 0));
});
test('Crossblock run schema rejects corrupted board, disconnected shapes, nested undo, and impossible states', () => {
  const cases = [
    world => { world.board = [1]; },
    world => { world.board[0] = 7; },
    world => { world.board.fill(1, 0, 8); },
    world => { world.hand[0].cells = [[0, 0], [3, 3]]; },
    world => { world.hand[0].cells = [[0, 0], [0, 0]]; },
    world => { world.score = Infinity; },
    world => { world.mode = 'hacked'; },
    world => { world.status = 'won'; },
    world => { world.hand = [null, null, null]; },
    world => { world.rngState = -1; },
    world => { world.undo = { ...structuredClone(world), undo: {} }; },
  ];
  for (const corrupt of cases) { const world = createCrossblock(1234); corrupt(world); assert.equal(validCrossblockRun(world), false); }
});
test('Crossblock session protects future, malformed, and oversized data byte for byte', () => {
  for (const raw of ['null', '{}', '{bad', '{"version":99}', ' '.repeat(30001)]) {
    const mem = memoryStore(raw), storage = createCrossblockSessionStorage(mem);
    assert.equal(storage.status, 'protected'); assert.equal(storage.save(emptySession()), false); assert.equal(mem.getItem(KEY), raw);
  }
  const mem = memoryStore(), storage = createCrossblockSessionStorage(mem);
  mem.setItem(KEY, 'null'); assert.equal(storage.save(emptySession()), false); assert.equal(mem.getItem(KEY), 'null');
});
test('Crossblock session refuses stale-tab overwrite and tolerates denied storage', () => {
  const mem = memoryStore(), first = createCrossblockSessionStorage(mem), second = createCrossblockSessionStorage(mem);
  assert.ok(first.save(emptySession())); const before = mem.getItem(KEY);
  assert.equal(second.save(emptySession()), false); assert.equal(second.status, 'conflict'); assert.equal(mem.getItem(KEY), before);
  const blocked = createCrossblockSessionStorage({ getItem() { return null; }, setItem() { throw new Error('Quota'); } });
  assert.equal(blocked.save(emptySession()), false); assert.equal(blocked.status, 'unavailable');
});
test('Crossblock session-v1 fixture loads without modifying the unchanged profile namespace', () => {
  const raw = readFileSync(new URL('./fixtures/crossblock-session-v1.json', import.meta.url), 'utf8');
  const mem = memoryStore(raw); mem.setItem('crossblock.profile', '{"version":1,"bestScore":500,"muted":false}');
  const storage = createCrossblockSessionStorage(mem), session = storage.load();
  assert.equal(storage.status, 'ready'); assert.equal(session.free.rngState, 1199731377);
  assert.ok(storage.save(session)); assert.equal(mem.getItem('crossblock.profile'), '{"version":1,"bestScore":500,"muted":false}');
});
