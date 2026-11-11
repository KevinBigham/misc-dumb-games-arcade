export type PieceId = 'I3' | 'O4' | 'T4' | 'L3' | 'J4' | 'L4' | 'S4';

export interface CellOffset {
  readonly r: number;
  readonly c: number;
}

export interface PieceDefinition {
  readonly id: PieceId;
  readonly name: string;
  readonly color: string;
  readonly border: string;
  readonly glyph: string;
  readonly tip: string;
  /** 4 rotation states (0 = 0deg, 1 = 90deg CW, 2 = 180deg, 3 = 270deg CW), normalized to top-left (0,0) */
  readonly rotations: readonly (readonly CellOffset[])[];
  /** Number of unique rotational symmetries (1, 2, or 4) for accurate Finesse calculation */
  readonly uniqueOrientations: 1 | 2 | 4;
}

function normalizeOffsets(cells: readonly CellOffset[]): readonly CellOffset[] {
  const minR = Math.min(...cells.map((cell) => cell.r));
  const minC = Math.min(...cells.map((cell) => cell.c));
  return cells
    .map((cell) => ({ r: cell.r - minR, c: cell.c - minC }))
    .sort((a, b) => (a.r !== b.r ? a.r - b.r : a.c - b.c));
}

function buildRotations(base: readonly CellOffset[]): readonly (readonly CellOffset[])[] {
  const states: (readonly CellOffset[])[] = [];
  let current = normalizeOffsets(base);
  for (let i = 0; i < 4; i++) {
    states.push(current);
    // Rotate 90 deg CW: (r, c) -> (c, -r)
    current = normalizeOffsets(current.map((cell) => ({ r: cell.c, c: -cell.r })));
  }
  return states;
}

export const PIECE_DEFINITIONS: Record<PieceId, PieceDefinition> = {
  I3: {
    id: 'I3',
    name: 'Beam-3',
    color: '#06b6d4',
    border: '#67e8f9',
    glyph: '━',
    tip: 'Flat leveler or vertical 3-deep well strike.',
    rotations: buildRotations([
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 0, c: 2 },
    ]),
    uniqueOrientations: 2,
  },
  O4: {
    id: 'O4',
    name: 'Anvil-2x2',
    color: '#eab308',
    border: '#fde047',
    glyph: '■',
    tip: 'Requires a 2-wide flat shelf for a zero-overhang flush.',
    rotations: buildRotations([
      { r: 0, c: 0 },
      { r: 0, c: 1 },
      { r: 1, c: 0 },
      { r: 1, c: 1 },
    ]),
    uniqueOrientations: 1,
  },
  T4: {
    id: 'T4',
    name: 'Keystone-T',
    color: '#a855f7',
    border: '#d8b4fe',
    glyph: '┻',
    tip: 'Parity fixer: balances jagged 1-step notches.',
    rotations: buildRotations([
      { r: 0, c: 1 },
      { r: 1, c: 0 },
      { r: 1, c: 1 },
      { r: 1, c: 2 },
    ]),
    uniqueOrientations: 4,
  },
  L3: {
    id: 'L3',
    name: 'Corner-3',
    color: '#f97316',
    border: '#fdba74',
    glyph: '┗',
    tip: 'Compact 3-cell corner that repairs 1-cell steps cleanly.',
    rotations: buildRotations([
      { r: 0, c: 0 },
      { r: 1, c: 0 },
      { r: 1, c: 1 },
    ]),
    uniqueOrientations: 4,
  },
  J4: {
    id: 'J4',
    name: 'Hook-J',
    color: '#3b82f6',
    border: '#93c5fd',
    glyph: '┛',
    tip: 'Left hook: slots into 2-deep steps or flat 3-wide ledges.',
    rotations: buildRotations([
      { r: 0, c: 0 },
      { r: 1, c: 0 },
      { r: 1, c: 1 },
      { r: 1, c: 2 },
    ]),
    uniqueOrientations: 4,
  },
  L4: {
    id: 'L4',
    name: 'Hook-L',
    color: '#10b981',
    border: '#6ee7b7',
    glyph: '┙',
    tip: 'Right hook: slots into right-hand wells or flat ledges.',
    rotations: buildRotations([
      { r: 0, c: 2 },
      { r: 1, c: 0 },
      { r: 1, c: 1 },
      { r: 1, c: 2 },
    ]),
    uniqueOrientations: 4,
  },
  S4: {
    id: 'S4',
    name: 'Step-S',
    color: '#f43f5e',
    border: '#fda4af',
    glyph: '▞',
    tip: 'Staircase piece: rotate vertically to fit 1-step slopes without overhangs.',
    rotations: buildRotations([
      { r: 0, c: 1 },
      { r: 0, c: 2 },
      { r: 1, c: 0 },
      { r: 1, c: 1 },
    ]),
    uniqueOrientations: 2,
  },
};

export const ALL_PIECE_IDS: readonly PieceId[] = ['I3', 'O4', 'T4', 'L3', 'J4', 'L4', 'S4'];

export interface PuzzleTemplate {
  readonly id: string;
  readonly title: string;
  readonly lesson: string;
  readonly activePiece: PieceId;
  readonly holdPiece: PieceId;
  /** Bottom rows of the 6-column board (each row has 6 strings: '' for empty or a color/piece ID) */
  readonly bottomRows: readonly (readonly (PieceId | null)[])[];
}

export const PUZZLE_TEMPLATES: readonly PuzzleTemplate[] = [
  {
    id: 'dojo-01-flat-shelf',
    title: 'Lesson 1: The Keyed Overhang',
    lesson: 'Rotate Hook-L 180° and slot its tooth into Column 4 to smelt both rows with 0 buried voids.',
    activePiece: 'L4',
    holdPiece: 'O4',
    bottomRows: [
      ['I3', 'I3', 'I3', null, null, null],
      ['J4', 'J4', 'J4', null, 'J4', 'J4'],
    ],
  },
  {
    id: 'dojo-02-keystone-notch',
    title: 'Lesson 2: The Keystone Notch',
    lesson: 'Point the Keystone-T downward into the center notch to smelt both rows at once!',
    activePiece: 'T4',
    holdPiece: 'I3',
    bottomRows: [
      ['O4', 'O4', null, null, null, 'L4'],
      ['J4', 'J4', 'J4', null, 'S4', 'S4'],
    ],
  },
  {
    id: 'dojo-03-hold-discipline',
    title: 'Lesson 3: Hold Chamber Discipline',
    lesson: 'Anvil-2x2 would trap a buried void! Press [C] to swap for Corner-3 in Hold, then rotate 180°.',
    activePiece: 'O4',
    holdPiece: 'L3',
    bottomRows: [
      ['I3', 'I3', 'I3', null, null, 'J4'],
      ['T4', 'T4', 'T4', 'T4', null, 'J4'],
    ],
  },
  {
    id: 'dojo-04-vertical-step',
    title: 'Lesson 4: Staircase Parity',
    lesson: 'Stand Step-S vertically (rotate 90°) so it hugs the 1-cell step without trapping air underneath.',
    activePiece: 'S4',
    holdPiece: 'O4',
    bottomRows: [
      ['I3', 'I3', 'I3', null, null, 'L4'],
      ['J4', 'J4', 'J4', 'J4', null, 'L4'],
    ],
  },
  {
    id: 'dojo-05-deep-well-strike',
    title: 'Lesson 5: The Vertical Well',
    lesson: 'Rotate Beam-3 vertically and drop it into Column 6 for a clean 3-Row Triple Temper!',
    activePiece: 'I3',
    holdPiece: 'T4',
    bottomRows: [
      ['O4', 'O4', 'J4', 'J4', 'J4', null],
      ['O4', 'O4', 'L4', 'L4', 'L4', null],
      ['I3', 'I3', 'I3', 'L3', 'L3', null],
    ],
  },
];
