// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyCommand,
  canSlideAnyDirection,
  createInitialState,
  exportSaveString,
  getRecipeByTier,
  importSaveString,
  isTerminalLoss,
  loadGameState,
  metadata,
  mountGame,
  RECIPE_TIERS,
  saveGameState,
  slideGrid,
  slideLineWithSingleMerge,
} from '../src/index.ts';

describe('Game 07: Merge Kitchen — 2048 & Bistro Order Simulation', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defines all 11 culinary recipe tiers from Fresh Egg [2] to Chef’s Legend [2048]', () => {
    expect(RECIPE_TIERS).toHaveLength(11);
    expect(getRecipeByTier(1).name).toBe('Fresh Egg');
    expect(getRecipeByTier(1).value).toBe(2);
    expect(getRecipeByTier(5).name).toBe('Eggs Benedict');
    expect(getRecipeByTier(5).value).toBe(32);
    expect(getRecipeByTier(10).name).toBe('Michelin Grand Feast');
    expect(getRecipeByTier(10).value).toBe(1024);
    expect(getRecipeByTier(11).name).toBe("Chef's Legend");
    expect(getRecipeByTier(11).value).toBe(2048);
  });

  it('enforces the Single-Merge-Per-Turn invariant on 1D lines and 4x4 grids', () => {
    // [2, 2, 4, 0] sliding left -> [4, 4, 0, 0], NEVER [8, 0, 0, 0]
    const res1 = slideLineWithSingleMerge([2, 2, 4, 0]);
    expect(res1.line).toEqual([4, 4, 0, 0]);
    expect(res1.scoreDelta).toBe(4);
    expect(res1.moved).toBe(true);

    // [2, 2, 2, 2] sliding left -> [4, 4, 0, 0], NEVER [8, 0, 0, 0]
    const res2 = slideLineWithSingleMerge([2, 2, 2, 2]);
    expect(res2.line).toEqual([4, 4, 0, 0]);
    expect(res2.scoreDelta).toBe(8);

    // [4, 2, 2, 0] sliding RIGHT on a 4x4 grid -> [0, 0, 4, 4], NEVER [0, 0, 0, 8]
    const grid = [
      [4, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const rightSlide = slideGrid(grid, 'RIGHT');
    expect(rightSlide.grid[0]).toEqual([0, 0, 4, 4]);
    expect(rightSlide.scoreDelta).toBe(4);
  });

  it('traverses strictly in the movement direction for UP, DOWN, LEFT, and RIGHT', () => {
    // Triplet row [2, 2, 2, 0]:
    // Sliding LEFT merges the leftmost pair -> [4, 2, 0, 0]
    // Sliding RIGHT merges the rightmost pair -> [0, 0, 2, 4]
    const rowGrid = [
      [2, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(slideGrid(rowGrid, 'LEFT').grid[0]).toEqual([4, 2, 0, 0]);
    expect(slideGrid(rowGrid, 'RIGHT').grid[0]).toEqual([0, 0, 2, 4]);

    // Triplet column [2, 2, 2, 0]^T:
    // Sliding UP merges the top pair -> col0 = [4, 2, 0, 0]
    // Sliding DOWN merges the bottom pair -> col0 = [0, 0, 2, 4]
    const colGrid = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const upResult = slideGrid(colGrid, 'UP');
    expect(upResult.grid.map((r) => r[0])).toEqual([4, 2, 0, 0]);

    const downResult = slideGrid(colGrid, 'DOWN');
    expect(downResult.grid.map((r) => r[0])).toEqual([0, 0, 2, 4]);
  });

  it('enforces the Blocked Move Rule: no tile spawn, no turn increment, and no RNG or patience change', () => {
    const baseState = createInitialState(12345);
    // Flush a single tile into the top-left corner so UP and LEFT are completely blocked
    const customState = {
      ...baseState,
      grid: [
        [2, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    };

    const afterBlockedLeft = applyCommand(customState, { type: 'SLIDE', direction: 'LEFT' });
    expect(afterBlockedLeft.lastMoveChangedBoard).toBe(false);
    expect(afterBlockedLeft.lastAction.type).toBe('BLOCKED_SLIDE');
    expect(afterBlockedLeft.turnCount).toBe(customState.turnCount);
    expect(afterBlockedLeft.rng.calls).toBe(customState.rng.calls);
    expect(afterBlockedLeft.grid).toEqual(customState.grid);
    expect(afterBlockedLeft.tickets[0].patienceTurns).toBe(customState.tickets[0].patienceTurns);

    // Now slide RIGHT (valid move) -> tile moves to (0,3) and 1 new tile spawns
    const afterValidRight = applyCommand(customState, { type: 'SLIDE', direction: 'RIGHT' });
    expect(afterValidRight.lastMoveChangedBoard).toBe(true);
    expect(afterValidRight.turnCount).toBe(customState.turnCount + 1);
    expect(afterValidRight.grid[0][3]).toBe(2);
    const nonZeroCount = afterValidRight.grid.flat().filter((v) => v > 0).length;
    expect(nonZeroCount).toBe(2); // original tile + 1 newly spawned tile
  });

  it('serves a Customer Order, removing the matching dish tile from the board, awarding tip score, and advancing ordersServed', () => {
    const initial = createInitialState(204807);
    const ticket0 = initial.tickets[0]; // e.g., requires Tier 3 (Golden Omelet [8])
    const requiredVal = ticket0.requiredValue;

    const stateWithDish = {
      ...initial,
      grid: [
        [requiredVal, 2, 0, 0],
        [4, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    };

    const servedState = applyCommand(stateWithDish, {
      type: 'SERVE_ORDER',
      ticketIndex: 0,
      row: 0,
      col: 0,
    });

    expect(servedState.lastMoveChangedBoard).toBe(true);
    expect(servedState.lastAction.type).toBe('SERVE_ORDER');
    expect(servedState.grid[0][0]).toBe(0); // Dish tile removed from board!
    expect(servedState.ordersServed).toBe(1);
    expect(servedState.rushCombo).toBe(1);
    expect(servedState.score).toBeGreaterThan(stateWithDish.score);
    expect(servedState.tickets[0].id).not.toBe(ticket0.id); // New ticket spawned in slot 0
  });

  it('triggers Short Goal Victory at 10 orders served and allows Keep Cooking endless mode', () => {
    const initial = createInitialState(999);
    const ticket = initial.tickets[1];
    const preWinState = {
      ...initial,
      ordersServed: 9,
      grid: [
        [2, ticket.requiredValue, 0, 0],
        [4, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    };

    const wonState = applyCommand(preWinState, { type: 'SERVE_ORDER', ticketIndex: 1 });
    expect(wonState.ordersServed).toBe(10);
    expect(wonState.won).toBe(true);
    expect(wonState.status).toBe('WON');

    // Clicking "Keep Cooking (Endless Service)" resumes PLAYING status
    const endlessState = applyCommand(wonState, { type: 'KEEP_PLAYING' });
    expect(endlessState.keepPlaying).toBe(true);
    expect(endlessState.status).toBe('PLAYING');
  });

  it('detects terminal loss only when the board is full, no merges exist, AND no active ticket can be served', () => {
    const initial = createInitialState(777);
    // Checkerboard of 2 and 4 with no adjacent matches and no empty cells
    const fullLockedGrid = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    expect(canSlideAnyDirection(fullLockedGrid)).toBe(false);

    // All tickets require Tier 3+ (>= 8), so none match 2 or 4 -> terminal loss!
    const lockedState = {
      ...initial,
      grid: fullLockedGrid,
    };
    expect(isTerminalLoss(lockedState)).toBe(true);

    // However, if cell (1,1) has value 8 (Golden Omelet) and Ticket 0 requests value 8,
    // the player is NOT lost because they can serve Ticket 0 to free cell (1,1)!
    const fullButServableGrid = [
      [2, 4, 2, 4],
      [4, 8, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    const rescuableState = {
      ...initial,
      grid: fullButServableGrid,
      tickets: initial.tickets.map((t, i) =>
        i === 0 ? { ...t, requiredTier: 3, requiredValue: 8 } : t
      ),
    };
    expect(canSlideAnyDirection(rescuableState.grid)).toBe(false);
    expect(isTerminalLoss(rescuableState)).toBe(false);

    // Serving Ticket 0 clears (1,1) and saves the kitchen from lockup!
    const rescued = applyCommand(rescuableState, { type: 'SERVE_ORDER', ticketIndex: 0 });
    expect(rescued.status).toBe('PLAYING');
    expect(rescued.grid[1][1]).toBe(0);
    expect(canSlideAnyDirection(rescued.grid)).toBe(true);
  });

  it('persists and restores exact board, score, tickets, and RNG state across save/load and handles corruption', () => {
    let state = createInitialState(424242);
    state = applyCommand(state, { type: 'SLIDE', direction: 'LEFT' });
    state = applyCommand(state, { type: 'SLIDE', direction: 'DOWN' });

    expect(saveGameState(state)).toBe(true);
    const loaded = loadGameState(99999);
    expect(loaded.restoredFromSave).toBe(true);
    expect(loaded.state.grid).toEqual(state.grid);
    expect(loaded.state.score).toBe(state.score);
    expect(loaded.state.rng).toEqual(state.rng);

    // Export / Import round-trip
    const exported = exportSaveString(state, {
      version: 1,
      bestScore: state.score,
      mostOrdersServed: state.ordersServed,
      highestTierReached: state.highestTier,
      highestValueReached: state.highestValue,
      gamesPlayed: 1,
      totalWins: 0,
      soundEnabled: true,
      reducedMotion: false,
    });
    const imported = importSaveString(exported);
    expect(imported.ok).toBe(true);
    if (imported.ok) {
      expect(imported.state.grid).toEqual(state.grid);
    }

    // Corrupt localStorage payload and verify graceful recovery
    window.localStorage.setItem('argon_07_merge_kitchen_state_v1', '{bad-json');
    const recovered = loadGameState(204807);
    expect(recovered.recoveredFromCorruption).toBe(true);
    expect(recovered.state.grid).toHaveLength(4);
  });

  it('mounts cleanly via the ArgonGameModule contract and supports interactive controls', () => {
    expect(metadata.id).toBe('07-merge-kitchen');
    expect(metadata.number).toBe(7);

    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, { initialSeed: 204807, debug: true });
    expect(container.querySelector('[data-testid="merge-kitchen-root"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="prep-board"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="debug-panel"]')).not.toBeNull();

    const upBtn = container.querySelector('[data-action="slide"][data-dir="UP"]') as HTMLButtonElement;
    expect(upBtn).not.toBeNull();
    upBtn.click();

    const snapshot = instance.getStateSnapshot?.() as { grid: number[][] };
    expect(snapshot.grid).toHaveLength(4);

    instance.destroy();
    expect(container.innerHTML).toBe('');
  });
});
