import { CROSSBLOCK_SESSION_VERSION as VERSION, CROSSBLOCK_SESSION_KEY as KEY } from './contracts.js';
import { hasMoves } from './sim/crossblock.js';
import { validPuzzleKey } from './sim/crossblock-puzzles.js';

const natural = (value, max = 1000000000) => Number.isSafeInteger(value) && value >= 0 && value <= max;
function validPiece(piece) {
  if (piece === null) return true;
  if (!piece || typeof piece.name !== 'string' || piece.name.length > 30 || !natural(piece.color, 6) || piece.color < 1 || !Array.isArray(piece.cells) || piece.cells.length < 2 || piece.cells.length > 5) return false;
  if (!piece.cells.every(cell => Array.isArray(cell) && cell.length === 2 && cell.every(value => natural(value, 4)))) return false;
  const keys = new Set(piece.cells.map(([x, y]) => `${x},${y}`));
  if (keys.size !== piece.cells.length || Math.min(...piece.cells.map(([x]) => x)) !== 0 || Math.min(...piece.cells.map(([, y]) => y)) !== 0) return false;
  const reached = new Set(), pending = [piece.cells[0]];
  while (pending.length) {
    const [x, y] = pending.pop(), key = `${x},${y}`;
    if (reached.has(key)) continue;
    reached.add(key);
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) if (keys.has(`${x + dx},${y + dy}`)) pending.push([x + dx, y + dy]);
  }
  return reached.size === keys.size;
}

export function validCrossblockRun(world, snapshot = false) {
  if (!world || !natural(world.rngState, 0xffffffff) || !['free', 'daily'].includes(world.mode) || !['playing', 'over', 'won'].includes(world.status)) return false;
  if (!Array.isArray(world.board) || world.board.length !== 64 || !world.board.every(value => natural(value, 6))) return false;
  if (!Array.isArray(world.hand) || world.hand.length !== 3 || !world.hand.every(validPiece)) return false;
  if (!['score', 'moves', 'lines', 'chain', 'crosses'].every(key => natural(world[key])) || world.chain > world.moves || world.crosses > world.moves || world.lines > world.moves * 16) return false;
  for (let line = 0; line < 8; line++) {
    if (Array.from({ length: 8 }, (_, x) => world.board[line * 8 + x]).every(Boolean) || Array.from({ length: 8 }, (_, y) => world.board[y * 8 + line]).every(Boolean)) return false;
  }
  const remaining = world.hand.filter(Boolean).length;
  if (world.mode === 'free') {
    if (world.puzzleKey !== null || world.status === 'won' || remaining !== 3 - world.moves % 3) return false;
  } else {
    if (!validPuzzleKey(world.puzzleKey) || world.moves > 3 || remaining !== 3 - world.moves) return false;
    if (world.status === 'won' && (remaining !== 0 || world.board.some(Boolean))) return false;
    if (world.status === 'over' && remaining === 0 && world.board.every(value => value === 0)) return false;
  }
  if (world.status === 'playing' && (remaining === 0 || !hasMoves(world))) return false;
  if (world.status === 'over' && hasMoves(world)) return false;
  if (snapshot) return world.undo === undefined && world.status === 'playing';
  if (world.undo !== null && (!validCrossblockRun(world.undo, true) || world.undo.moves !== world.moves - 1 || world.undo.mode !== world.mode || world.undo.puzzleKey !== world.puzzleKey)) return false;
  return true;
}

function validSession(data) {
  return !!data && data.version === VERSION && natural(data.revision) && ['free', 'daily'].includes(data.mode)
    && (data.free === null || (data.free?.mode === 'free' && validCrossblockRun(data.free)))
    && (data.daily === null || (data.daily?.mode === 'daily' && validCrossblockRun(data.daily)))
    && (data.completedDaily === null || (validPuzzleKey(data.completedDaily?.key) && natural(data.completedDaily?.score)));
}

export function createCrossblockSessionStorage(storage) {
  let current = { version: VERSION, revision: 0, mode: 'free', free: null, daily: null, completedDaily: null };
  let status = storage ? 'ready' : 'unavailable';
  try {
    const raw = storage?.getItem(KEY);
    if (raw != null) {
      if (raw.length > 30000) status = 'protected';
      else { const data = JSON.parse(raw); if (validSession(data)) current = data; else status = 'protected'; }
    }
  } catch { status = 'protected'; }
  return {
    load: () => structuredClone(current),
    get status() { return status; },
    save(next) {
      if (!storage || status === 'protected' || status === 'conflict') return false;
      try {
        const raw = storage.getItem(KEY);
        if (raw != null && raw.length > 30000) { status = 'protected'; return false; }
        const remote = raw == null ? null : JSON.parse(raw);
        if (raw != null && !validSession(remote)) { status = 'protected'; return false; }
        if ((remote?.revision ?? 0) !== current.revision) { status = 'conflict'; return false; }
        const value = { ...next, version: VERSION, revision: current.revision + 1 };
        if (!validSession(value)) { status = 'invalid'; return false; }
        storage.setItem(KEY, JSON.stringify(value)); current = structuredClone(value); status = 'ready'; return true;
      } catch { status = 'unavailable'; return false; }
    },
  };
}
