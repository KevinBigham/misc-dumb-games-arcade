import { CROSSBLOCK_SIZE as SIZE } from '../contracts.js';
import { normalizeSeed, random } from './rng.js';
import { dailyPuzzle } from './crossblock-puzzles.js';

const SHAPES = [
  ['Domino', [[0, 0], [1, 0]], 1],
  ['Trio', [[0, 0], [1, 0], [2, 0]], 2],
  ['Corner', [[0, 0], [0, 1], [1, 1]], 3],
  ['Square', [[0, 0], [1, 0], [0, 1], [1, 1]], 4],
  ['Long line', [[0, 0], [1, 0], [2, 0], [3, 0]], 1],
  ['Elbow', [[0, 0], [0, 1], [0, 2], [1, 2]], 5],
  ['Tee', [[0, 0], [1, 0], [2, 0], [1, 1]], 6],
  ['Zigzag', [[0, 0], [1, 0], [1, 1], [2, 1]], 3],
  ['Hook', [[1, 0], [1, 1], [0, 2], [1, 2]], 2],
  ['Big corner', [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]], 5],
  ['Plus', [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], 6],
];

export function rotateCells(cells) {
  const turned = cells.map(([x, y]) => [-y, x]);
  const minX = Math.min(...turned.map(([x]) => x));
  const minY = Math.min(...turned.map(([, y]) => y));
  return turned.map(([x, y]) => [x - minX, y - minY]);
}

export function pieceSize(piece) {
  return { width: Math.max(...piece.cells.map(([x]) => x)) + 1,
    height: Math.max(...piece.cells.map(([, y]) => y)) + 1 };
}

function makePiece(world, shape) {
  const [name, cells, color] = shape;
  const piece = { name, cells: cells.map(cell => [...cell]), color };
  const rotations = Math.floor(random(world) * 4);
  for (let i = 0; i < rotations; i++) piece.cells = rotateCells(piece.cells);
  return piece;
}

export function canPlace(world, piece, x, y) {
  if (!piece || !Number.isInteger(x) || !Number.isInteger(y)) return false;
  return piece.cells.every(([dx, dy]) => {
    const px = x + dx, py = y + dy;
    return px >= 0 && px < SIZE && py >= 0 && py < SIZE && world.board[py * SIZE + px] === 0;
  });
}

export function pieceFits(world, piece) {
  if (!piece) return false;
  let cells = piece.cells;
  for (let rotation = 0; rotation < 4; rotation++) {
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) if (canPlace(world, { cells }, x, y)) return true;
    }
    cells = rotateCells(cells);
  }
  return false;
}

export function hasMoves(world) {
  return world.hand.some(piece => pieceFits(world, piece));
}

function deal(world) {
  // Larger shapes enter gradually. Every fresh hand includes at least one shape
  // that fits if any shape in the pool can fit, even after rotation.
  const pool = SHAPES.slice(0, world.moves < 12 ? 9 : SHAPES.length);
  world.hand = Array.from({ length: 3 }, () => makePiece(world, pool[Math.floor(random(world) * pool.length)]));
  if (!hasMoves(world)) {
    const fitting = pool.filter(([, cells]) => pieceFits(world, { cells }));
    if (fitting.length) world.hand[0] = makePiece(world, fitting[Math.floor(random(world) * fitting.length)]);
  }
}

export function createCrossblock(seed = 1) {
  const world = { rngState: normalizeSeed(seed), board: Array(SIZE * SIZE).fill(0),
    hand: [], score: 0, lines: 0, chain: 0, moves: 0, crosses: 0,
    status: 'playing', mode: 'free', puzzleKey: null, undo: null };
  // A welcoming first hand; all later hands are seeded.
  world.hand = [SHAPES[5], SHAPES[1], SHAPES[3]].map(shape => makePiece(world, shape));
  return world;
}

export function createDailyCrossblock(key) {
  const puzzle = dailyPuzzle(key), world = createCrossblock(puzzle.seed);
  world.mode = 'daily'; world.puzzleKey = key; world.rngState = puzzle.rngState;
  world.board = [...puzzle.board];
  world.hand = puzzle.solutions.map(({ piece }) => {
    const next = structuredClone(piece), turns = Math.floor(random(world) * 4);
    for (let i = 0; i < turns; i++) next.cells = rotateCells(next.cells);
    return next;
  });
  return world;
}

export function previewPlacement(world, slot, x, y) {
  const piece = Number.isInteger(slot) && slot >= 0 && slot < 3 ? world.hand[slot] : null;
  if (!canPlace(world, piece, x, y)) return { valid: false, cells: [], rows: [], columns: [], cleared: [] };
  const cells = piece.cells.map(([dx, dy]) => (y + dy) * SIZE + x + dx);
  const occupied = new Set(cells);
  const full = index => world.board[index] !== 0 || occupied.has(index);
  const rows = [], columns = [];
  for (let i = 0; i < SIZE; i++) {
    if (Array.from({ length: SIZE }, (_, xPos) => i * SIZE + xPos).every(full)) rows.push(i);
    if (Array.from({ length: SIZE }, (_, yPos) => yPos * SIZE + i).every(full)) columns.push(i);
  }
  const cleared = Array.from({ length: SIZE * SIZE }, (_, i) => i)
    .filter(i => rows.includes(Math.floor(i / SIZE)) || columns.includes(i % SIZE));
  return { valid: true, cells, rows, columns, cleared };
}

export function rotatePiece(world, slot) {
  if (world.status !== 'playing' || !Number.isInteger(slot) || slot < 0 || slot >= 3 || !world.hand[slot]) return [];
  world.hand[slot].cells = rotateCells(world.hand[slot].cells);
  return [{ type: 'rotated', slot }];
}

export function placePiece(world, slot, x, y) {
  if (world.status !== 'playing') return [];
  const preview = previewPlacement(world, slot, x, y);
  if (!preview.valid) return [];
  const { undo, ...snapshot } = world;
  world.undo = structuredClone(snapshot);
  const piece = world.hand[slot];
  const events = [{ type: 'placed', cells: preview.cells, color: piece.color }];
  for (const index of preview.cells) world.board[index] = piece.color;
  world.hand[slot] = null;
  world.moves++;
  world.score += preview.cells.length * 5;
  const lineCount = preview.rows.length + preview.columns.length;
  if (lineCount) {
    world.chain++;
    world.lines += lineCount;
    const cross = preview.rows.length > 0 && preview.columns.length > 0;
    if (cross) world.crosses++;
    const points = 100 * lineCount * lineCount * (cross ? 2 : 1) + 50 * (world.chain - 1);
    world.score += points;
    const clearedCells = preview.cleared.map(index => ({ index, color: world.board[index] }));
    for (const index of preview.cleared) world.board[index] = 0;
    events.push({ type: 'cleared', cells: clearedCells, rows: preview.rows,
      columns: preview.columns, points, cross, chain: world.chain });
    if (world.board.every(cell => cell === 0)) {
      world.score += 500;
      events.push({ type: 'perfect-clear', points: 500 });
    }
  } else world.chain = 0;
  if (world.mode === 'daily' && world.hand.every(pieceInHand => pieceInHand === null)) {
    world.status = world.board.every(cell => cell === 0) ? 'won' : 'over';
    events.push({ type: world.status === 'won' ? 'puzzle-won' : 'game-over' });
    return events;
  }
  if (world.hand.every(pieceInHand => pieceInHand === null)) {
    deal(world);
    events.push({ type: 'dealt' });
  }
  if (!hasMoves(world)) {
    world.status = 'over';
    events.push({ type: 'game-over' });
  }
  return events;
}

export function undoMove(world) {
  if (!world.undo) return [];
  const snapshot = world.undo;
  Object.assign(world, structuredClone(snapshot), { undo: null });
  return [{ type: 'undone' }];
}
