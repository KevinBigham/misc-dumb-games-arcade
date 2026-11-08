import { describe, expect, it } from 'vitest';
import {
  computeGhostPreview,
  countBoardBuriedVoids,
  createGameState,
  findBestPlacementHint,
  holdPiece,
  movePiece,
  mountGame,
  rotatePiece,
  setPieceColumn,
  stampPiece,
  useLaserChisel,
} from '../src/index';

describe('Keystone Forge — Spatial Silhouette & Tetris Finesse Simulation', () => {
  it('produces deterministic 7-bag piece sequences for identical seeds', () => {
    const s1 = createGameState(20261107, 'endless');
    const s2 = createGameState(20261107, 'endless');

    expect(s1.active.pieceId).toBe(s2.active.pieceId);
    expect(s1.nextQueue).toEqual(s2.nextQueue);
    expect(s1.bag).toEqual(s2.bag);
  });

  it('detects 0-void Flush Fits vs new buried voids accurately in Ghost Preview', () => {
    let state = createGameState(20261107, 'endless');
    state.active = { pieceId: 'T4', rotation: 0, col: 1, movesUsed: 0 };

    // On an empty board, T4 in rotation 0 (flat bottom of 3 cells) is a 0-void Flush Fit
    const flushPreview = computeGhostPreview(state);
    expect(flushPreview).not.toBeNull();
    expect(flushPreview!.isFlushFit).toBe(true);
    expect(flushPreview!.newBuriedVoidCells).toHaveLength(0);

    // Rotate T4 180 deg (pointing down: top row has 3 cells, bottom has 1 center cell)
    // On a flat empty floor, the left and right wings overhang 2 empty cells!
    state = rotatePiece(rotatePiece(state, 1), 1);
    const overhangPreview = computeGhostPreview(state);
    expect(overhangPreview).not.toBeNull();
    expect(overhangPreview!.isFlushFit).toBe(false);
    expect(overhangPreview!.newBuriedVoidCells).toHaveLength(2);
  });

  it('calculates Optimal Finesse par and charges the Laser Chisel on 3 Perfect-Finesse Flush Stamps', () => {
    let state = createGameState(42, 'endless');
    expect(state.chiselCharges).toBe(1);

    // Force 3 clean flat stamps with 0 wasted moves
    for (let i = 0; i < 3; i++) {
      state.active = { pieceId: 'O4', rotation: 0, col: 2, movesUsed: 0 };
      state = setPieceColumn(state, (i * 2) % 6);
      state = stampPiece(state);
      expect(state.lastStamp?.wasFlush).toBe(true);
      expect(state.lastStamp?.wasPerfectFinesse).toBe(true);
    }

    expect(state.finesseStreak).toBe(3);
    expect(state.chiselCharges).toBeGreaterThanOrEqual(2);
  });

  it('enforces Hold Chamber once-per-turn lock and resets on next stamp', () => {
    let state = createGameState(20261107, 'endless');
    const firstActive = state.active.pieceId;
    const firstNext = state.nextQueue[0];

    state = holdPiece(state);
    expect(state.hold).toBe(firstActive);
    expect(state.active.pieceId).toBe(firstNext);
    expect(state.holdUsedThisTurn).toBe(true);

    // Second hold attempt before stamping should be a no-op
    const blockedHold = holdPiece(state);
    expect(blockedHold.active.pieceId).toBe(firstNext);

    // After stamping, Hold unlocks again
    state = stampPiece(state);
    expect(state.holdUsedThisTurn).toBe(false);
  });

  it('uses Laser Chisel to vaporize the cap block above a buried void', () => {
    let state = createGameState(20261107, 'endless');
    // Create a buried void at row 9, col 2 by placing a block at row 8, col 2
    state.board[8][2] = 'O4';
    expect(countBoardBuriedVoids(state.board).count).toBe(1);

    state = useLaserChisel(state);
    expect(state.board[8][2]).toBeNull();
    expect(countBoardBuriedVoids(state.board).count).toBe(0);
  });

  it('solves all 5 Cavity Dojo spatial lessons cleanly in 1 move each', () => {
    let state = createGameState(20261107, 'puzzle');
    expect(state.puzzleIndex).toBe(0);

    // Lesson 1: Hook-L rotated 180 deg at Col 3 (0-indexed)
    state = rotatePiece(rotatePiece(state, 1), 1);
    state = setPieceColumn(state, 3);
    state = stampPiece(state);
    expect(state.lastStamp?.wasFlush).toBe(true);
    expect(state.lastStamp?.linesCleared).toBe(2);
    expect(state.puzzleIndex).toBe(1);

    // Lesson 2: Keystone-T rotated 180 deg at Col 2
    state = rotatePiece(rotatePiece(state, 1), 1);
    state = setPieceColumn(state, 2);
    state = stampPiece(state);
    expect(state.lastStamp?.wasFlush).toBe(true);
    expect(state.lastStamp?.linesCleared).toBe(2);
    expect(state.puzzleIndex).toBe(2);

    // Lesson 3: Hold-swap O4 for L3, rotate 180 deg, place at Col 3
    state = holdPiece(state);
    state = rotatePiece(rotatePiece(state, 1), 1);
    state = setPieceColumn(state, 3);
    state = stampPiece(state);
    expect(state.lastStamp?.wasFlush).toBe(true);
    expect(state.lastStamp?.linesCleared).toBe(2);
    expect(state.puzzleIndex).toBe(3);

    // Lesson 4: Step-S rotated 90 deg CW at Col 3
    state = rotatePiece(state, 1);
    state = setPieceColumn(state, 3);
    state = stampPiece(state);
    expect(state.lastStamp?.wasFlush).toBe(true);
    expect(state.lastStamp?.linesCleared).toBe(2);
    expect(state.puzzleIndex).toBe(4);

    // Lesson 5: Beam-3 rotated 90 deg CW at Col 5 (Vertical Well Strike)
    state = rotatePiece(state, 1);
    state = setPieceColumn(state, 5);
    state = stampPiece(state);
    expect(state.lastStamp?.wasFlush).toBe(true);
    expect(state.lastStamp?.linesCleared).toBe(3);
    expect(state.puzzleIndex).toBe(5);
  });

  it('provides an AI Spatial Coach recommendation and mounts/destroys UI cleanly', () => {
    const state = createGameState(20261107, 'puzzle');
    const hint = findBestPlacementHint(state);
    expect(hint).not.toBeNull();
    expect(hint!.reason.length).toBeGreaterThan(10);

    const container = document.createElement('div');
    document.body.appendChild(container);
    const instance = mountGame(container, { initialSeed: 20261107, debug: true });

    expect(container.querySelector('#kf-board')).not.toBeNull();
    const moveRightBtn = container.querySelector<HTMLButtonElement>('#kf-btn-right');
    moveRightBtn?.click();

    const snap = instance.getStateSnapshot?.() as ReturnType<typeof createGameState>;
    expect(snap.active.movesUsed).toBe(1);

    instance.restartWithSeed?.(99999);
    instance.toggleDebug?.(false);
    instance.destroy();
    container.remove();
  });
});
