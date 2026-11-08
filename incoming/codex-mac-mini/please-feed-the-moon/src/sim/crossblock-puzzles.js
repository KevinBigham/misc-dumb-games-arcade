import { random } from './rng.js';

// Each blueprint starts with occupied rows and removes three disjoint shapes.
// Filling those holes clears every occupied row. Rotation/reflection preserves
// that proof and turns some days into column puzzles. No server or clock here.
const BLUEPRINTS = [
  { name: 'Room to turn', top: 3, holes: [
    { name: 'Elbow', color: 5, at: [1, 3], cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
    { name: 'Tee', color: 6, at: [4, 4], cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
    { name: 'Zigzag', color: 3, at: [3, 6], cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  ] },
  { name: 'The long way home', top: 2, holes: [
    { name: 'Elbow', color: 5, at: [0, 2], cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
    { name: 'Long line', color: 1, at: [4, 3], cells: [[0, 0], [0, 1], [0, 2], [0, 3]] },
    { name: 'Tee', color: 6, at: [5, 6], cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  ] },
  { name: 'A different angle', top: 3, holes: [
    { name: 'Zigzag', color: 3, at: [0, 3], cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
    { name: 'Tee', color: 6, at: [4, 4], cells: [[1, 0], [0, 1], [1, 1], [2, 1]] },
    { name: 'Elbow', color: 5, at: [2, 5], cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
  ] },
  { name: 'Pieces of a plan', top: 2, holes: [
    { name: 'Long elbow', color: 5, at: [1, 2], cells: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]] },
    { name: 'Zigzag', color: 3, at: [4, 4], cells: [[0, 0], [0, 1], [1, 1], [1, 2]] },
    { name: 'Tee', color: 6, at: [0, 6], cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  ] },
  { name: 'Little connections', top: 3, holes: [
    { name: 'Tee', color: 6, at: [1, 3], cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
    { name: 'Square', color: 4, at: [5, 4], cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
    { name: 'Hook', color: 2, at: [2, 5], cells: [[1, 0], [1, 1], [0, 2], [1, 2]] },
  ] },
];

export function validPuzzleKey(key) {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const [year, month, day] = key.split('-').map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const lengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year >= 2000 && year <= 9999 && month >= 1 && month <= 12 && day >= 1 && day <= lengths[month - 1];
}

export function dailyPuzzle(key) {
  if (!validPuzzleKey(key)) throw new Error('Puzzle date must be a valid YYYY-MM-DD date.');
  let seed = 2166136261;
  for (const char of key) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const rng = { rngState: seed };
  const blueprint = BLUEPRINTS[Math.floor(random(rng) * BLUEPRINTS.length)];
  const turns = Math.floor(random(rng) * 4), mirror = random(rng) < 0.5;
  const transform = ([cx, cy]) => {
    let x = mirror ? 7 - cx : cx, y = cy;
    for (let turn = 0; turn < turns; turn++) [x, y] = [7 - y, x];
    return [x, y];
  };
  const board = Array(64).fill(0);
  for (let y = blueprint.top; y < 8; y++) for (let x = 0; x < 8; x++) {
    const [tx, ty] = transform([x, y]); board[ty * 8 + tx] = 1 + ((Math.floor(x / 2) + y) % 6);
  }
  const solutions = blueprint.holes.map(shape => {
    const absolute = shape.cells.map(([x, y]) => transform([x + shape.at[0], y + shape.at[1]]));
    for (const [x, y] of absolute) board[y * 8 + x] = 0;
    const x = Math.min(...absolute.map(([cx]) => cx)), y = Math.min(...absolute.map(([, cy]) => cy));
    return { piece: { name: shape.name, color: shape.color, cells: absolute.map(([cx, cy]) => [cx - x, cy - y]) }, x, y };
  });
  // Shuffle order independently of board orientation.
  for (let i = solutions.length - 1; i > 0; i--) {
    const j = Math.floor(random(rng) * (i + 1)); [solutions[i], solutions[j]] = [solutions[j], solutions[i]];
  }
  return { seed, name: blueprint.name, board, solutions, rngState: rng.rngState };
}
