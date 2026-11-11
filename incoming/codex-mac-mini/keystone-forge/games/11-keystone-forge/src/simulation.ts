import { CONFIG, type GameMode } from './config';
import {
  ALL_PIECE_IDS,
  PIECE_DEFINITIONS,
  PUZZLE_TEMPLATES,
  type CellOffset,
  type PieceId,
} from './content';
import { createSeededRng } from './rng';

export type BoardCell = PieceId | 'SLAG' | null;

export interface ActivePieceState {
  pieceId: PieceId;
  rotation: number; // 0, 1, 2, 3
  col: number;
  movesUsed: number;
}

export interface StampTelemetry {
  pieceId: PieceId;
  linesCleared: number;
  newBuriedVoids: number;
  wasFlush: boolean;
  wasPerfectFinesse: boolean;
  wasFlatSkyline: boolean;
  movesUsed: number;
  optimalMoves: number;
  pointsAwarded: number;
  headline: string;
}

export interface GhostPreview {
  landingRow: number;
  cells: CellOffset[];
  newBuriedVoidCells: CellOffset[];
  totalBuriedVoidsAfter: number;
  wouldClearLines: number;
  isFlushFit: boolean;
  isFlatSkylineAfter: boolean;
  optimalMoves: number;
  movesUsed: number;
  isPerfectFinesseSoFar: boolean;
}

export interface CoachRecommendation {
  useHold: boolean;
  pieceId: PieceId;
  rotation: number;
  col: number;
  reason: string;
}

export interface KeystoneForgeState {
  seed: number;
  rngState: number;
  mode: GameMode;
  status: 'playing' | 'won' | 'gameover';
  board: BoardCell[][];
  active: ActivePieceState;
  hold: PieceId | null;
  holdUsedThisTurn: boolean;
  bag: PieceId[];
  nextQueue: PieceId[];
  score: number;
  linesCleared: number;
  level: number;
  stampsCount: number;
  flushStreak: number;
  maxFlushStreak: number;
  comboStreak: number;
  finesseStreak: number;
  perfectFinesseCount: number;
  totalFinesseFaults: number;
  chiselCharges: number;
  elapsedMs: number;
  gravityTimerMs: number;
  gravityIntervalMs: number;
  puzzleIndex: number;
  puzzleTitle: string;
  puzzleLesson: string;
  lastStamp: StampTelemetry | null;
  eventLog: string[];
}

export function createEmptyBoard(): BoardCell[][] {
  return Array.from({ length: CONFIG.BOARD_ROWS }, () =>
    Array.from({ length: CONFIG.BOARD_COLS }, () => null),
  );
}

export function cloneBoard(board: BoardCell[][]): BoardCell[][] {
  return board.map((row) => [...row]);
}

export function getPieceWidth(pieceId: PieceId, rotation: number): number {
  const offsets = PIECE_DEFINITIONS[pieceId].rotations[((rotation % 4) + 4) % 4];
  return Math.max(...offsets.map((o) => o.c)) + 1;
}

export function getPieceHeight(pieceId: PieceId, rotation: number): number {
  const offsets = PIECE_DEFINITIONS[pieceId].rotations[((rotation % 4) + 4) % 4];
  return Math.max(...offsets.map((o) => o.r)) + 1;
}

export function clampColForPiece(pieceId: PieceId, rotation: number, col: number): number {
  const width = getPieceWidth(pieceId, rotation);
  const maxCol = Math.max(0, CONFIG.BOARD_COLS - width);
  return Math.max(0, Math.min(maxCol, col));
}

export function getSpawnCol(pieceId: PieceId, rotation = 0): number {
  const width = getPieceWidth(pieceId, rotation);
  return Math.floor((CONFIG.BOARD_COLS - width) / 2);
}

export function computeOptimalFinesseMoves(
  pieceId: PieceId,
  targetRotation: number,
  targetCol: number,
): number {
  const def = PIECE_DEFINITIONS[pieceId];
  const sym = def.uniqueOrientations;
  const normRot = (((targetRotation % 4) + 4) % 4) % sym;
  const rotMoves = normRot === 3 ? 1 : normRot; // 0->0, 1->1(CW), 2->1(180 flip) or 2, let's allow 180 or 2 CW; standard par: min(normRot, 4 - normRot)
  const spawnCol = getSpawnCol(pieceId, 0);
  const shiftMoves = Math.abs(targetCol - spawnCol);
  return Math.min(rotMoves, 4 - normRot) + shiftMoves;
}

export function countBoardBuriedVoids(board: BoardCell[][]): {
  count: number;
  cells: CellOffset[];
} {
  const cells: CellOffset[] = [];
  for (let c = 0; c < CONFIG.BOARD_COLS; c++) {
    let seenSolid = false;
    for (let r = 0; r < CONFIG.BOARD_ROWS; r++) {
      if (board[r][c] !== null) {
        seenSolid = true;
      } else if (seenSolid) {
        cells.push({ r, c });
      }
    }
  }
  return { count: cells.length, cells };
}

export function getColumnHeights(board: BoardCell[][]): number[] {
  const heights: number[] = [];
  for (let c = 0; c < CONFIG.BOARD_COLS; c++) {
    let h = 0;
    for (let r = 0; r < CONFIG.BOARD_ROWS; r++) {
      if (board[r][c] !== null) {
        h = CONFIG.BOARD_ROWS - r;
        break;
      }
    }
    heights.push(h);
  }
  return heights;
}

export function isSkylineFlat(board: BoardCell[][]): boolean {
  const heights = getColumnHeights(board);
  const first = heights[0];
  return heights.every((h) => h === first);
}

export function canPlaceAt(
  board: BoardCell[][],
  pieceId: PieceId,
  rotation: number,
  row: number,
  col: number,
): boolean {
  const offsets = PIECE_DEFINITIONS[pieceId].rotations[((rotation % 4) + 4) % 4];
  for (const off of offsets) {
    const r = row + off.r;
    const c = col + off.c;
    if (c < 0 || c >= CONFIG.BOARD_COLS || r < 0 || r >= CONFIG.BOARD_ROWS) {
      return false;
    }
    if (board[r][c] !== null) {
      return false;
    }
  }
  return true;
}

export function computeDropRow(
  board: BoardCell[][],
  pieceId: PieceId,
  rotation: number,
  col: number,
): number | null {
  const clampedCol = clampColForPiece(pieceId, rotation, col);
  if (!canPlaceAt(board, pieceId, rotation, 0, clampedCol)) {
    return null;
  }
  let landingRow = 0;
  while (canPlaceAt(board, pieceId, rotation, landingRow + 1, clampedCol)) {
    landingRow++;
  }
  return landingRow;
}

function clearCompletedRows(board: BoardCell[][]): {
  nextBoard: BoardCell[][];
  clearedCount: number;
} {
  const keptRows = board.filter((row) => row.some((cell) => cell === null));
  const clearedCount = CONFIG.BOARD_ROWS - keptRows.length;
  const emptyTop = Array.from({ length: clearedCount }, () =>
    Array.from({ length: CONFIG.BOARD_COLS }, () => null as BoardCell),
  );
  return {
    nextBoard: [...emptyTop, ...keptRows],
    clearedCount,
  };
}

export function evaluatePlacementOnBoard(
  board: BoardCell[][],
  pieceId: PieceId,
  rotation: number,
  col: number,
  movesUsed = 0,
): GhostPreview | null {
  const cleanRot = ((rotation % 4) + 4) % 4;
  const clampedCol = clampColForPiece(pieceId, cleanRot, col);
  const landingRow = computeDropRow(board, pieceId, cleanRot, clampedCol);
  if (landingRow === null) return null;

  const offsets = PIECE_DEFINITIONS[pieceId].rotations[cleanRot];
  const cells = offsets.map((off) => ({ r: landingRow + off.r, c: clampedCol + off.c }));

  const beforeVoids = countBoardBuriedVoids(board);
  const beforeSet = new Set(beforeVoids.cells.map((v) => `${v.r},${v.c}`));

  const tempBoard = cloneBoard(board);
  for (const cell of cells) {
    tempBoard[cell.r][cell.c] = pieceId;
  }

  // Check newly buried voids directly on the placed board BEFORE line clear, or after line clear:
  // If a placement completes a line, that line smelts immediately, so measure voids on the post-clear board!
  const { nextBoard, clearedCount } = clearCompletedRows(tempBoard);
  const afterVoids = countBoardBuriedVoids(nextBoard);
  const newBuriedVoidCells = afterVoids.cells.filter((v) => !beforeSet.has(`${v.r},${v.c}`));

  const optimalMoves = computeOptimalFinesseMoves(pieceId, cleanRot, clampedCol);

  return {
    landingRow,
    cells,
    newBuriedVoidCells,
    totalBuriedVoidsAfter: afterVoids.count,
    wouldClearLines: clearedCount,
    isFlushFit: newBuriedVoidCells.length === 0,
    isFlatSkylineAfter: isSkylineFlat(nextBoard),
    optimalMoves,
    movesUsed,
    isPerfectFinesseSoFar: movesUsed <= optimalMoves,
  };
}

export function computeGhostPreview(state: KeystoneForgeState): GhostPreview | null {
  return evaluatePlacementOnBoard(
    state.board,
    state.active.pieceId,
    state.active.rotation,
    state.active.col,
    state.active.movesUsed,
  );
}

function drawNextFromBag(
  rngState: number,
  bag: PieceId[],
): { piece: PieceId; nextBag: PieceId[]; nextRngState: number } {
  const rng = createSeededRng(1);
  rng.setState(rngState);
  let workingBag = [...bag];
  if (workingBag.length === 0) {
    workingBag = rng.shuffle(ALL_PIECE_IDS);
  }
  const piece = workingBag.shift()!;
  return {
    piece,
    nextBag: workingBag,
    nextRngState: rng.getState(),
  };
}

function applyPuzzleStage(state: KeystoneForgeState, puzzleIndex: number): void {
  const template = PUZZLE_TEMPLATES[puzzleIndex % PUZZLE_TEMPLATES.length];
  const board = createEmptyBoard();
  const startRow = CONFIG.BOARD_ROWS - template.bottomRows.length;
  for (let r = 0; r < template.bottomRows.length; r++) {
    for (let c = 0; c < CONFIG.BOARD_COLS; c++) {
      board[startRow + r][c] = template.bottomRows[r][c];
    }
  }
  state.board = board;
  state.active = {
    pieceId: template.activePiece,
    rotation: 0,
    col: getSpawnCol(template.activePiece, 0),
    movesUsed: 0,
  };
  state.hold = template.holdPiece;
  state.holdUsedThisTurn = false;
  state.puzzleIndex = puzzleIndex;
  state.puzzleTitle = template.title;
  state.puzzleLesson = template.lesson;
}

export function createGameState(seed = 20261107, mode: GameMode = 'endless'): KeystoneForgeState {
  const rng = createSeededRng(seed);
  let bag = rng.shuffle(ALL_PIECE_IDS);
  let rngState = rng.getState();

  const queue: PieceId[] = [];
  for (let i = 0; i < CONFIG.PREVIEW_COUNT + 1; i++) {
    const drawn = drawNextFromBag(rngState, bag);
    queue.push(drawn.piece);
    bag = drawn.nextBag;
    rngState = drawn.nextRngState;
  }

  const firstPiece = queue.shift()!;

  const state: KeystoneForgeState = {
    seed,
    rngState,
    mode,
    status: 'playing',
    board: createEmptyBoard(),
    active: {
      pieceId: firstPiece,
      rotation: 0,
      col: getSpawnCol(firstPiece, 0),
      movesUsed: 0,
    },
    hold: null,
    holdUsedThisTurn: false,
    bag,
    nextQueue: queue,
    score: 0,
    linesCleared: 0,
    level: 1,
    stampsCount: 0,
    flushStreak: 0,
    maxFlushStreak: 0,
    comboStreak: 0,
    finesseStreak: 0,
    perfectFinesseCount: 0,
    totalFinesseFaults: 0,
    chiselCharges: CONFIG.INITIAL_CHISEL_CHARGES,
    elapsedMs: 0,
    gravityTimerMs: 0,
    gravityIntervalMs: CONFIG.BASE_GRAVITY_MS,
    puzzleIndex: 0,
    puzzleTitle: '',
    puzzleLesson: '',
    lastStamp: null,
    eventLog: ['Keystone Forge initialized. Align ghost silhouette for a 0-void Flush Stamp!'],
  };

  if (mode === 'puzzle') {
    applyPuzzleStage(state, 0);
    state.eventLog = [`Dojo Stage 1 — ${state.puzzleTitle}: ${state.puzzleLesson}`];
  }

  return state;
}

export function movePiece(state: KeystoneForgeState, deltaCol: -1 | 1): KeystoneForgeState {
  if (state.status !== 'playing') return state;
  const nextCol = clampColForPiece(
    state.active.pieceId,
    state.active.rotation,
    state.active.col + deltaCol,
  );
  if (nextCol === state.active.col) return state;

  return {
    ...state,
    active: {
      ...state.active,
      col: nextCol,
      movesUsed: state.active.movesUsed + 1,
    },
  };
}

export function setPieceColumn(state: KeystoneForgeState, targetCol: number): KeystoneForgeState {
  if (state.status !== 'playing') return state;
  const clamped = clampColForPiece(state.active.pieceId, state.active.rotation, targetCol);
  const delta = Math.abs(clamped - state.active.col);
  if (delta === 0) return state;
  return {
    ...state,
    active: {
      ...state.active,
      col: clamped,
      movesUsed: state.active.movesUsed + delta,
    },
  };
}

export function rotatePiece(
  state: KeystoneForgeState,
  deltaRotation: 1 | -1 | 2 = 1,
): KeystoneForgeState {
  if (state.status !== 'playing') return state;
  const nextRot = (((state.active.rotation + deltaRotation) % 4) + 4) % 4;
  const kickedCol = clampColForPiece(state.active.pieceId, nextRot, state.active.col);
  if (computeDropRow(state.board, state.active.pieceId, nextRot, kickedCol) === null) {
    return state;
  }
  return {
    ...state,
    active: {
      ...state.active,
      rotation: nextRot,
      col: kickedCol,
      movesUsed: state.active.movesUsed + 1,
    },
  };
}

export function holdPiece(state: KeystoneForgeState): KeystoneForgeState {
  if (state.status !== 'playing' || state.holdUsedThisTurn) return state;

  const currentId = state.active.pieceId;
  if (state.hold !== null) {
    const swappedId = state.hold;
    return {
      ...state,
      active: {
        pieceId: swappedId,
        rotation: 0,
        col: getSpawnCol(swappedId, 0),
        movesUsed: 0,
      },
      hold: currentId,
      holdUsedThisTurn: true,
      gravityTimerMs: 0,
      eventLog: [`Swapped ${currentId} into Hold Chamber for ${swappedId}.`, ...state.eventLog.slice(0, 11)],
    };
  }

  // Hold was empty: pull next piece from nextQueue
  const nextQueue = [...state.nextQueue];
  const nextId = nextQueue.shift()!;
  const drawn = drawNextFromBag(state.rngState, state.bag);
  nextQueue.push(drawn.piece);

  return {
    ...state,
    rngState: drawn.nextRngState,
    bag: drawn.nextBag,
    nextQueue,
    active: {
      pieceId: nextId,
      rotation: 0,
      col: getSpawnCol(nextId, 0),
      movesUsed: 0,
    },
    hold: currentId,
    holdUsedThisTurn: true,
    gravityTimerMs: 0,
    eventLog: [`Stored ${currentId} in Hold Chamber; deployed ${nextId}.`, ...state.eventLog.slice(0, 11)],
  };
}

export function useLaserChisel(
  state: KeystoneForgeState,
  preferredCol?: number,
): KeystoneForgeState {
  if (state.status !== 'playing' || state.chiselCharges <= 0) return state;

  const board = cloneBoard(state.board);

  // Find target column: either preferredCol, or column with shallowest buried void, or tallest column
  let targetCol = -1;
  if (
    preferredCol !== undefined &&
    preferredCol >= 0 &&
    preferredCol < CONFIG.BOARD_COLS &&
    board.some((row) => row[preferredCol] !== null)
  ) {
    targetCol = preferredCol;
  } else {
    const voids = countBoardBuriedVoids(board);
    if (voids.cells.length > 0) {
      // Pick the highest buried void (smallest row index) so chiseling above it uncovers it fastest
      const sorted = [...voids.cells].sort((a, b) => a.r - b.r);
      targetCol = sorted[0].c;
    } else {
      const heights = getColumnHeights(board);
      const maxH = Math.max(...heights);
      if (maxH > 0) {
        targetCol = heights.indexOf(maxH);
      }
    }
  }

  if (targetCol === -1) return state;

  // Vaporize the topmost solid block in targetCol
  for (let r = 0; r < CONFIG.BOARD_ROWS; r++) {
    if (board[r][targetCol] !== null) {
      board[r][targetCol] = null;
      return {
        ...state,
        board,
        chiselCharges: state.chiselCharges - 1,
        eventLog: [
          `⚡ Laser Chisel vaporized top cap in Column ${targetCol + 1} to open the cavity!`,
          ...state.eventLog.slice(0, 11),
        ],
      };
    }
  }

  return state;
}

function injectSlagRow(board: BoardCell[][], gapCol: number): BoardCell[][] {
  const next = cloneBoard(board);
  // Shift rows 1..9 up to 0..8
  for (let r = 0; r < CONFIG.BOARD_ROWS - 1; r++) {
    next[r] = [...next[r + 1]];
  }
  const bottomRow: BoardCell[] = Array.from({ length: CONFIG.BOARD_COLS }, (_, c) =>
    c === gapCol ? null : 'SLAG',
  );
  next[CONFIG.BOARD_ROWS - 1] = bottomRow;
  return next;
}

export function stampPiece(state: KeystoneForgeState): KeystoneForgeState {
  if (state.status !== 'playing') return state;

  const preview = computeGhostPreview(state);
  if (!preview) {
    return {
      ...state,
      status: 'gameover',
      eventLog: ['Press Head jammed at top of anvil — Forge Over!', ...state.eventLog.slice(0, 11)],
    };
  }

  const nextBoard = cloneBoard(state.board);
  for (const cell of preview.cells) {
    nextBoard[cell.r][cell.c] = state.active.pieceId;
  }

  const { nextBoard: clearedBoard, clearedCount } = clearCompletedRows(nextBoard);
  const newVoids = preview.newBuriedVoidCells.length;
  const wasFlush = newVoids === 0;
  const wasPerfectFinesse = preview.movesUsed <= preview.optimalMoves;
  const faults = Math.max(0, preview.movesUsed - preview.optimalMoves);
  const wasFlatSkyline = isSkylineFlat(clearedBoard);
  const isBoardEmpty = clearedBoard.every((row) => row.every((c) => c === null));

  const nextFlushStreak = wasFlush ? state.flushStreak + 1 : 0;
  const nextMaxFlushStreak = Math.max(state.maxFlushStreak, nextFlushStreak);
  const nextComboStreak = clearedCount > 0 ? state.comboStreak + 1 : 0;
  const nextFinesseStreak = wasPerfectFinesse && wasFlush ? state.finesseStreak + 1 : 0;

  // Calculate score
  let points = 0;
  if (wasFlush) {
    points += CONFIG.SCORE_FLUSH_BASE * state.level * Math.min(nextFlushStreak, 5);
  }
  if (clearedCount > 0) {
    const clearScore = CONFIG.LINE_CLEAR_SCORES[Math.min(clearedCount, 4)] ?? 1200;
    points += clearScore * state.level;
    if (nextComboStreak > 1) {
      points += CONFIG.COMBO_BONUS_BASE * (nextComboStreak - 1) * state.level;
    }
  }
  if (wasFlatSkyline) {
    points += (isBoardEmpty ? CONFIG.SCORE_ALL_CLEAR : CONFIG.SCORE_FLAT_SKYLINE) * state.level;
  }
  if (wasPerfectFinesse) {
    points = Math.round(points * CONFIG.FINESSE_BONUS_MULTIPLIER);
  }

  // Chisel charge awards
  let chiselCharges = state.chiselCharges;
  if (
    nextFinesseStreak > 0 &&
    nextFinesseStreak % CONFIG.FINESSE_STREAK_FOR_CHISEL === 0 &&
    chiselCharges < CONFIG.MAX_CHISEL_CHARGES
  ) {
    chiselCharges++;
  } else if (clearedCount >= 2 && chiselCharges < CONFIG.MAX_CHISEL_CHARGES) {
    chiselCharges++;
  }

  const totalLines = state.linesCleared + clearedCount;
  const nextLevel = 1 + Math.floor(totalLines / CONFIG.LINES_PER_LEVEL);
  const nextStampsCount = state.stampsCount + 1;

  const clearNames = ['Flush Stamp', 'Single Forge', 'Double Weld', 'Triple Temper', 'QUAD KEYSTONE!'];
  const headlineParts: string[] = [];
  if (clearedCount > 0) {
    headlineParts.push(clearNames[Math.min(clearedCount, 4)]);
  } else if (wasFlush) {
    headlineParts.push(`Flush Fit ×${nextFlushStreak}`);
  } else {
    headlineParts.push(`+${newVoids} Buried Void${newVoids > 1 ? 's' : ''}`);
  }
  if (wasPerfectFinesse) headlineParts.push('⚡ Finesse');
  if (wasFlatSkyline) headlineParts.push('✨ Level Anvil');

  const telemetry: StampTelemetry = {
    pieceId: state.active.pieceId,
    linesCleared: clearedCount,
    newBuriedVoids: newVoids,
    wasFlush,
    wasPerfectFinesse,
    wasFlatSkyline,
    movesUsed: preview.movesUsed,
    optimalMoves: preview.optimalMoves,
    pointsAwarded: points,
    headline: headlineParts.join(' · '),
  };

  // Handle Puzzle Dojo mode progression
  if (state.mode === 'puzzle') {
    const nextState: KeystoneForgeState = {
      ...state,
      score: state.score + points + (wasFlush && clearedCount > 0 ? CONFIG.SCORE_PUZZLE_CLEAR : 0),
      linesCleared: totalLines,
      stampsCount: nextStampsCount,
      flushStreak: nextFlushStreak,
      maxFlushStreak: nextMaxFlushStreak,
      comboStreak: nextComboStreak,
      finesseStreak: nextFinesseStreak,
      perfectFinesseCount: state.perfectFinesseCount + (wasPerfectFinesse ? 1 : 0),
      totalFinesseFaults: state.totalFinesseFaults + faults,
      chiselCharges,
      lastStamp: telemetry,
      gravityTimerMs: 0,
    };

    if (wasFlush && clearedCount > 0) {
      const nextIdx = state.puzzleIndex + 1;
      applyPuzzleStage(nextState, nextIdx);
      nextState.eventLog = [
        `✅ Dojo Stage ${state.puzzleIndex + 1} Solved (${telemetry.headline})! Advancing to ${nextState.puzzleTitle}.`,
        ...state.eventLog.slice(0, 11),
      ];
    } else {
      // Reset current puzzle so player can immediately retry with lesson feedback
      applyPuzzleStage(nextState, state.puzzleIndex);
      nextState.eventLog = [
        `🔄 Retry ${nextState.puzzleTitle}: Aim for 0 buried voids and a row clear!`,
        ...state.eventLog.slice(0, 11),
      ];
    }
    return nextState;
  }

  // Handle Sprint win condition
  if (state.mode === 'sprint' && totalLines >= CONFIG.SPRINT_TARGET_LINES) {
    return {
      ...state,
      board: clearedBoard,
      score: state.score + points,
      linesCleared: totalLines,
      level: nextLevel,
      stampsCount: nextStampsCount,
      flushStreak: nextFlushStreak,
      maxFlushStreak: nextMaxFlushStreak,
      comboStreak: nextComboStreak,
      finesseStreak: nextFinesseStreak,
      perfectFinesseCount: state.perfectFinesseCount + (wasPerfectFinesse ? 1 : 0),
      totalFinesseFaults: state.totalFinesseFaults + faults,
      chiselCharges,
      status: 'won',
      lastStamp: telemetry,
      eventLog: [
        `🏆 20-Line Finesse Sprint Completed in ${(state.elapsedMs / 1000).toFixed(1)}s!`,
        ...state.eventLog.slice(0, 11),
      ],
    };
  }

  // Check if Slag Mold rises in Endless mode
  let finalBoard = clearedBoard;
  const rng = createSeededRng(1);
  rng.setState(state.rngState);

  if (
    state.mode === 'endless' &&
    nextLevel >= 2 &&
    nextStampsCount % CONFIG.SLAG_RISE_INTERVAL_STAMPS === 0
  ) {
    const maxH = Math.max(...getColumnHeights(finalBoard));
    if (maxH <= CONFIG.SLAG_MAX_STACK_HEIGHT) {
      const gapCol = rng.nextInt(CONFIG.BOARD_COLS);
      finalBoard = injectSlagRow(finalBoard, gapCol);
    }
  }

  // Draw next piece
  const nextQueue = [...state.nextQueue];
  const nextPieceId = nextQueue.shift()!;
  const drawn = drawNextFromBag(rng.getState(), state.bag);
  nextQueue.push(drawn.piece);

  const spawnCol = getSpawnCol(nextPieceId, 0);
  const canSpawn = computeDropRow(finalBoard, nextPieceId, 0, spawnCol) !== null;

  const nextGravityInterval = Math.max(
    CONFIG.MIN_GRAVITY_MS,
    CONFIG.BASE_GRAVITY_MS - (nextLevel - 1) * CONFIG.GRAVITY_DECAY_PER_LEVEL_MS,
  );

  return {
    ...state,
    rngState: drawn.nextRngState,
    bag: drawn.nextBag,
    board: finalBoard,
    active: {
      pieceId: nextPieceId,
      rotation: 0,
      col: spawnCol,
      movesUsed: 0,
    },
    holdUsedThisTurn: false,
    nextQueue,
    score: state.score + points,
    linesCleared: totalLines,
    level: nextLevel,
    stampsCount: nextStampsCount,
    flushStreak: nextFlushStreak,
    maxFlushStreak: nextMaxFlushStreak,
    comboStreak: nextComboStreak,
    finesseStreak: nextFinesseStreak,
    perfectFinesseCount: state.perfectFinesseCount + (wasPerfectFinesse ? 1 : 0),
    totalFinesseFaults: state.totalFinesseFaults + faults,
    chiselCharges,
    gravityTimerMs: 0,
    gravityIntervalMs: nextGravityInterval,
    status: canSpawn ? 'playing' : 'gameover',
    lastStamp: telemetry,
    eventLog: [
      `${telemetry.headline} (+${points} pts)`,
      ...state.eventLog.slice(0, 11),
    ],
  };
}

export function tickTimer(state: KeystoneForgeState, deltaMs: number): KeystoneForgeState {
  if (state.status !== 'playing' || deltaMs <= 0) return state;
  const nextElapsed = state.elapsedMs + deltaMs;
  if (state.mode === 'puzzle') {
    return {
      ...state,
      elapsedMs: nextElapsed,
    };
  }

  const nextGravity = state.gravityTimerMs + deltaMs;
  if (nextGravity >= state.gravityIntervalMs) {
    return stampPiece({
      ...state,
      elapsedMs: nextElapsed,
      gravityTimerMs: 0,
    });
  }

  return {
    ...state,
    elapsedMs: nextElapsed,
    gravityTimerMs: nextGravity,
  };
}

export function findBestPlacementHint(state: KeystoneForgeState): CoachRecommendation | null {
  const candidates: {
    useHold: boolean;
    pieceId: PieceId;
    rotation: number;
    col: number;
    score: number;
    reason: string;
  }[] = [];

  const candidatePieces: { pieceId: PieceId; useHold: boolean }[] = [
    { pieceId: state.active.pieceId, useHold: false },
  ];
  if (!state.holdUsedThisTurn) {
    const holdCandidate = state.hold ?? state.nextQueue[0];
    if (holdCandidate && holdCandidate !== state.active.pieceId) {
      candidatePieces.push({ pieceId: holdCandidate, useHold: true });
    }
  }

  for (const cand of candidatePieces) {
    const sym = PIECE_DEFINITIONS[cand.pieceId].uniqueOrientations;
    for (let rot = 0; rot < sym; rot++) {
      const width = getPieceWidth(cand.pieceId, rot);
      for (let col = 0; col <= CONFIG.BOARD_COLS - width; col++) {
        const preview = evaluatePlacementOnBoard(state.board, cand.pieceId, rot, col, 0);
        if (!preview) continue;

        // Calculate resulting board roughness & max height
        const tempBoard = cloneBoard(state.board);
        for (const cell of preview.cells) {
          tempBoard[cell.r][cell.c] = cand.pieceId;
        }
        const { nextBoard } = clearCompletedRows(tempBoard);
        const heights = getColumnHeights(nextBoard);
        const maxH = Math.max(...heights);
        let roughness = 0;
        for (let i = 0; i < heights.length - 1; i++) {
          roughness += Math.abs(heights[i] - heights[i + 1]);
        }

        const score =
          preview.wouldClearLines * 500 -
          preview.newBuriedVoidCells.length * 400 -
          preview.totalBuriedVoidsAfter * 80 -
          roughness * 25 -
          maxH * 15 +
          (preview.isFlatSkylineAfter ? 300 : 0) -
          (cand.useHold ? 5 : 0);

        const reasons: string[] = [];
        if (preview.wouldClearLines > 0) {
          reasons.push(`clears ${preview.wouldClearLines} row${preview.wouldClearLines > 1 ? 's' : ''}`);
        }
        if (preview.newBuriedVoidCells.length === 0) {
          reasons.push('0 buried voids');
        }
        if (preview.isFlatSkylineAfter) {
          reasons.push('levels the skyline');
        } else if (roughness <= 2) {
          reasons.push('keeps surface flat');
        }

        candidates.push({
          useHold: cand.useHold,
          pieceId: cand.pieceId,
          rotation: rot,
          col,
          score,
          reason: reasons.length > 0 ? reasons.join(', ') : 'best available contour fit',
        });
      }
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  return {
    useHold: best.useHold,
    pieceId: best.pieceId,
    rotation: best.rotation,
    col: best.col,
    reason: `${best.useHold ? 'Hold-swap [C] to ' : ''}${PIECE_DEFINITIONS[best.pieceId].name} @ Col ${best.col + 1} (${best.rotation * 90}°): ${best.reason}.`,
  };
}
