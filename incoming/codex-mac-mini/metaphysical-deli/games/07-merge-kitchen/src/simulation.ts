import { MERGE_KITCHEN_CONFIG } from './config.ts';
import {
  CUSTOMER_PATRONS,
  getRecipeByTier,
  getRecipeByValue,
  getTicketTierPoolForProgress,
  tierToValue,
  valueToTier,
} from './content.ts';
import { RngStateSnapshot, SeededRng } from './rng.ts';

export type SlideDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GridMatrix = number[][]; // 4x4 matrix of tile values (0 = empty, 2, 4, 8, ..., 2048)

export interface BoardCoord {
  row: number;
  col: number;
}

export interface MergedCellEvent {
  row: number;
  col: number;
  value: number;
  tier: number;
  scoreAwarded: number;
}

export interface SpawnedTileEvent {
  row: number;
  col: number;
  value: number;
  tier: number;
}

export interface CustomerTicket {
  id: string;
  slotIndex: number; // 0, 1, 2
  patronId: string;
  patronName: string;
  tableLabel: string;
  avatarBadge: string;
  orderQuote: string;
  requiredTier: number; // 3..8
  requiredValue: number; // 8..256
  dishName: string;
  baseScore: number;
  patienceTurns: number;
  maxPatienceTurns: number;
}

export type GameStatus = 'PLAYING' | 'WON' | 'LOST';

export interface LastActionSummary {
  type: 'INIT' | 'SLIDE' | 'BLOCKED_SLIDE' | 'SERVE_ORDER' | 'INVALID_SERVE' | 'KEEP_PLAYING' | 'RESTART';
  changed: boolean;
  direction?: SlideDirection;
  scoreDelta: number;
  mergedCells: MergedCellEvent[];
  spawnedTile: SpawnedTileEvent | null;
  servedTicket?: {
    slotIndex: number;
    dishName: string;
    tier: number;
    value: number;
    row: number;
    col: number;
    scoreAwarded: number;
    tipMultiplier: number;
    rushCombo: number;
  };
}

export interface MergeKitchenState {
  version: number;
  grid: GridMatrix;
  score: number;
  turnCount: number;
  ordersServed: number;
  highestValue: number;
  highestTier: number;
  discoveredTiers: number[];
  rushCombo: number;
  turnsSinceLastServe: number;
  tickets: CustomerTicket[];
  ticketSeq: number;
  status: GameStatus;
  won: boolean;
  keepPlaying: boolean;
  lastMoveChangedBoard: boolean;
  lastAction: LastActionSummary;
  rng: RngStateSnapshot;
}

export type MergeKitchenCommand =
  | { type: 'SLIDE'; direction: SlideDirection }
  | { type: 'SERVE_ORDER'; ticketIndex: number; row?: number; col?: number }
  | { type: 'KEEP_PLAYING' }
  | { type: 'RESTART'; seed?: number };

export function createEmptyGrid(size: number = MERGE_KITCHEN_CONFIG.GRID_SIZE): GridMatrix {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0));
}

export function cloneGrid(grid: GridMatrix): GridMatrix {
  return grid.map((row) => [...row]);
}

export function getEmptyCells(grid: GridMatrix): BoardCoord[] {
  const empty: BoardCoord[] = [];
  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      if (grid[row][col] === 0) {
        empty.push({ row, col });
      }
    }
  }
  return empty;
}

export function spawnRandomIngredient(
  grid: GridMatrix,
  rng: SeededRng
): SpawnedTileEvent | null {
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) {
    return null;
  }
  const chosenCell = emptyCells[rng.nextInt(0, emptyCells.length - 1)];
  const roll = rng.nextFloat();
  const value =
    roll < MERGE_KITCHEN_CONFIG.SPAWN_TIER_1_PROBABILITY
      ? MERGE_KITCHEN_CONFIG.SPAWN_TIER_1_VALUE
      : MERGE_KITCHEN_CONFIG.SPAWN_TIER_2_VALUE;
  const tier = valueToTier(value);
  grid[chosenCell.row][chosenCell.col] = value;
  return {
    row: chosenCell.row,
    col: chosenCell.col,
    value,
    tier,
  };
}

export function createCustomerTicket(
  rng: SeededRng,
  slotIndex: number,
  ordersServed: number,
  ticketSeq: number
): CustomerTicket {
  const tierPool = getTicketTierPoolForProgress(ordersServed, slotIndex);
  const requiredTier = rng.pick(tierPool);
  const recipe = getRecipeByTier(requiredTier);
  const patron = rng.pick(CUSTOMER_PATRONS);
  // Higher tier dishes grant more patience turns so the player has time to cook them
  const maxPatienceTurns = 8 + requiredTier * 3;
  return {
    id: `ticket-${ticketSeq}`,
    slotIndex,
    patronId: patron.id,
    patronName: patron.patronName,
    tableLabel: patron.tableLabel,
    avatarBadge: patron.avatarBadge,
    orderQuote: patron.orderQuote,
    requiredTier,
    requiredValue: recipe.value,
    dishName: recipe.name,
    baseScore: recipe.baseServeScore,
    patienceTurns: maxPatienceTurns,
    maxPatienceTurns,
  };
}

/**
 * Slides a 1D line of length N toward index 0, enforcing the 2048 Single-Merge-Per-Turn invariant:
 * - Non-zero tiles slide toward index 0 in strict traversal order (0 -> N-1).
 * - Two adjacent equal tiles merge into `val * 2`, and that target slot is marked merged so it
 *   can NEVER merge a second time during the same swipe move.
 */
export function slideLineWithSingleMerge(line: readonly number[]): {
  line: number[];
  scoreDelta: number;
  mergedIndices: number[];
  mergedValues: number[];
  moved: boolean;
} {
  const size = line.length;
  const target: number[] = [];
  const mergedFlags: boolean[] = [];
  const mergedIndices: number[] = [];
  const mergedValues: number[] = [];
  let scoreDelta = 0;

  for (let i = 0; i < size; i += 1) {
    const val = line[i];
    if (val === 0) {
      continue;
    }
    const lastIdx = target.length - 1;
    if (lastIdx >= 0 && target[lastIdx] === val && !mergedFlags[lastIdx]) {
      const mergedVal = val * 2;
      target[lastIdx] = mergedVal;
      mergedFlags[lastIdx] = true;
      mergedIndices.push(lastIdx);
      mergedValues.push(mergedVal);
      scoreDelta += mergedVal;
    } else {
      target.push(val);
      mergedFlags.push(false);
    }
  }

  while (target.length < size) {
    target.push(0);
  }

  let moved = false;
  for (let i = 0; i < size; i += 1) {
    if (target[i] !== line[i]) {
      moved = true;
      break;
    }
  }

  return {
    line: target,
    scoreDelta,
    mergedIndices,
    mergedValues,
    moved,
  };
}

export interface SlideGridResult {
  grid: GridMatrix;
  moved: boolean;
  scoreDelta: number;
  mergedCells: MergedCellEvent[];
}

/**
 * Slides the entire 4x4 grid in one of the 4 cardinal directions (`UP`, `DOWN`, `LEFT`, `RIGHT`).
 * Traversal order strictly follows movement direction:
 * - `LEFT`: columns 0 -> 3
 * - `RIGHT`: columns 3 -> 0
 * - `UP`: rows 0 -> 3
 * - `DOWN`: rows 3 -> 0
 */
export function slideGrid(grid: GridMatrix, direction: SlideDirection): SlideGridResult {
  const size = grid.length;
  const nextGrid = createEmptyGrid(size);
  let anyMoved = false;
  let totalScoreDelta = 0;
  const mergedCells: MergedCellEvent[] = [];

  if (direction === 'LEFT') {
    for (let r = 0; r < size; r += 1) {
      const rowSlice = grid[r];
      const result = slideLineWithSingleMerge(rowSlice);
      if (result.moved) anyMoved = true;
      totalScoreDelta += result.scoreDelta;
      for (let c = 0; c < size; c += 1) {
        nextGrid[r][c] = result.line[c];
      }
      for (let m = 0; m < result.mergedIndices.length; m += 1) {
        const col = result.mergedIndices[m];
        const value = result.mergedValues[m];
        mergedCells.push({
          row: r,
          col,
          value,
          tier: valueToTier(value),
          scoreAwarded: value,
        });
      }
    }
  } else if (direction === 'RIGHT') {
    for (let r = 0; r < size; r += 1) {
      // Traverse columns 3 -> 0
      const reversedRow = [...grid[r]].reverse();
      const result = slideLineWithSingleMerge(reversedRow);
      if (result.moved) anyMoved = true;
      totalScoreDelta += result.scoreDelta;
      for (let idx = 0; idx < size; idx += 1) {
        const col = size - 1 - idx;
        nextGrid[r][col] = result.line[idx];
      }
      for (let m = 0; m < result.mergedIndices.length; m += 1) {
        const col = size - 1 - result.mergedIndices[m];
        const value = result.mergedValues[m];
        mergedCells.push({
          row: r,
          col,
          value,
          tier: valueToTier(value),
          scoreAwarded: value,
        });
      }
    }
  } else if (direction === 'UP') {
    for (let c = 0; c < size; c += 1) {
      // Traverse rows 0 -> 3
      const colSlice: number[] = [];
      for (let r = 0; r < size; r += 1) {
        colSlice.push(grid[r][c]);
      }
      const result = slideLineWithSingleMerge(colSlice);
      if (result.moved) anyMoved = true;
      totalScoreDelta += result.scoreDelta;
      for (let r = 0; r < size; r += 1) {
        nextGrid[r][c] = result.line[r];
      }
      for (let m = 0; m < result.mergedIndices.length; m += 1) {
        const row = result.mergedIndices[m];
        const value = result.mergedValues[m];
        mergedCells.push({
          row,
          col: c,
          value,
          tier: valueToTier(value),
          scoreAwarded: value,
        });
      }
    }
  } else if (direction === 'DOWN') {
    for (let c = 0; c < size; c += 1) {
      // Traverse rows 3 -> 0
      const reversedCol: number[] = [];
      for (let r = size - 1; r >= 0; r -= 1) {
        reversedCol.push(grid[r][c]);
      }
      const result = slideLineWithSingleMerge(reversedCol);
      if (result.moved) anyMoved = true;
      totalScoreDelta += result.scoreDelta;
      for (let idx = 0; idx < size; idx += 1) {
        const row = size - 1 - idx;
        nextGrid[row][c] = result.line[idx];
      }
      for (let m = 0; m < result.mergedIndices.length; m += 1) {
        const row = size - 1 - result.mergedIndices[m];
        const value = result.mergedValues[m];
        mergedCells.push({
          row,
          col: c,
          value,
          tier: valueToTier(value),
          scoreAwarded: value,
        });
      }
    }
  }

  return {
    grid: nextGrid,
    moved: anyMoved,
    scoreDelta: totalScoreDelta,
    mergedCells,
  };
}

export function findMatchingBoardCells(grid: GridMatrix, requiredTier: number): BoardCoord[] {
  const targetValue = tierToValue(requiredTier);
  const matches: BoardCoord[] = [];
  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      if (grid[row][col] === targetValue) {
        matches.push({ row, col });
      }
    }
  }
  return matches;
}

export interface ServableTicketMatch {
  ticketIndex: number;
  ticket: CustomerTicket;
  matchingCells: BoardCoord[];
}

export function getServableTickets(state: Pick<MergeKitchenState, 'grid' | 'tickets'>): ServableTicketMatch[] {
  const matches: ServableTicketMatch[] = [];
  for (let i = 0; i < state.tickets.length; i += 1) {
    const ticket = state.tickets[i];
    const matchingCells = findMatchingBoardCells(state.grid, ticket.requiredTier);
    if (matchingCells.length > 0) {
      matches.push({
        ticketIndex: i,
        ticket,
        matchingCells,
      });
    }
  }
  return matches;
}

export function canSlideAnyDirection(grid: GridMatrix): boolean {
  const size = grid.length;
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const val = grid[r][c];
      if (val === 0) {
        return true;
      }
      if (r + 1 < size && grid[r + 1][c] === val) {
        return true;
      }
      if (c + 1 < size && grid[r][c + 1] === val) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Loss Condition:
 * 1. Board is 100% full (no empty cells)
 * 2. No adjacent equal tiles remain in any row or column
 * 3. No tile currently on the board matches an immediately servable Customer Order
 */
export function isTerminalLoss(state: Pick<MergeKitchenState, 'grid' | 'tickets'>): boolean {
  if (canSlideAnyDirection(state.grid)) {
    return false;
  }
  const servable = getServableTickets(state);
  return servable.length === 0;
}

export function computeTicketTipMultiplier(ticket: CustomerTicket): number {
  if (ticket.patienceTurns > Math.floor(ticket.maxPatienceTurns * 0.5)) {
    return MERGE_KITCHEN_CONFIG.BASE_TIP_FRESH;
  }
  if (ticket.patienceTurns > 0) {
    return MERGE_KITCHEN_CONFIG.BASE_TIP_WARM;
  }
  return MERGE_KITCHEN_CONFIG.BASE_TIP_LATE;
}

export function computeRushMultiplier(rushCombo: number): number {
  if (rushCombo <= 1) {
    return 1.0;
  }
  const bonus = Math.min(
    MERGE_KITCHEN_CONFIG.RUSH_COMBO_MAX_BONUS,
    (rushCombo - 1) * MERGE_KITCHEN_CONFIG.RUSH_COMBO_STEP
  );
  return Number((1 + bonus).toFixed(2));
}

function computeBoardHighest(grid: GridMatrix, prevHighestValue: number): {
  highestValue: number;
  highestTier: number;
} {
  let maxVal = prevHighestValue;
  for (let r = 0; r < grid.length; r += 1) {
    for (let c = 0; c < grid[r].length; c += 1) {
      if (grid[r][c] > maxVal) {
        maxVal = grid[r][c];
      }
    }
  }
  return {
    highestValue: maxVal,
    highestTier: valueToTier(maxVal),
  };
}

function collectDiscoveredTiers(grid: GridMatrix, prevDiscovered: readonly number[]): number[] {
  const set = new Set<number>(prevDiscovered);
  for (let r = 0; r < grid.length; r += 1) {
    for (let c = 0; c < grid[r].length; c += 1) {
      const val = grid[r][c];
      if (val > 0) {
        set.add(valueToTier(val));
      }
    }
  }
  return Array.from(set).sort((a, b) => a - b);
}

export function createInitialState(seed: number = MERGE_KITCHEN_CONFIG.DEFAULT_SEED): MergeKitchenState {
  const rng = new SeededRng(seed);
  const grid = createEmptyGrid(MERGE_KITCHEN_CONFIG.GRID_SIZE);

  let lastSpawn: SpawnedTileEvent | null = null;
  for (let i = 0; i < MERGE_KITCHEN_CONFIG.INITIAL_TILES; i += 1) {
    lastSpawn = spawnRandomIngredient(grid, rng);
  }

  let ticketSeq = 1;
  const tickets: CustomerTicket[] = [];
  for (let slot = 0; slot < MERGE_KITCHEN_CONFIG.ORDER_SLOT_COUNT; slot += 1) {
    tickets.push(createCustomerTicket(rng, slot, 0, ticketSeq));
    ticketSeq += 1;
  }

  const { highestValue, highestTier } = computeBoardHighest(grid, 2);
  const discoveredTiers = collectDiscoveredTiers(grid, [1]);

  return {
    version: MERGE_KITCHEN_CONFIG.SAVE_VERSION,
    grid,
    score: 0,
    turnCount: 0,
    ordersServed: 0,
    highestValue,
    highestTier,
    discoveredTiers,
    rushCombo: 0,
    turnsSinceLastServe: 0,
    tickets,
    ticketSeq,
    status: 'PLAYING',
    won: false,
    keepPlaying: false,
    lastMoveChangedBoard: true,
    lastAction: {
      type: 'INIT',
      changed: true,
      scoreDelta: 0,
      mergedCells: [],
      spawnedTile: lastSpawn,
    },
    rng: rng.getSnapshot(),
  };
}

export function applyCommand(
  state: MergeKitchenState,
  command: MergeKitchenCommand
): MergeKitchenState {
  if (command.type === 'RESTART') {
    const nextSeed = command.seed ?? state.rng.seed;
    const fresh = createInitialState(nextSeed);
    return {
      ...fresh,
      lastAction: {
        ...fresh.lastAction,
        type: 'RESTART',
      },
    };
  }

  if (command.type === 'KEEP_PLAYING') {
    if (!state.won) {
      return state;
    }
    const nextStatus: GameStatus = isTerminalLoss(state) ? 'LOST' : 'PLAYING';
    return {
      ...state,
      keepPlaying: true,
      status: nextStatus,
      lastMoveChangedBoard: false,
      lastAction: {
        type: 'KEEP_PLAYING',
        changed: true,
        scoreDelta: 0,
        mergedCells: [],
        spawnedTile: null,
      },
    };
  }

  // If game is in WON modal and player hasn't clicked Keep Playing, or if LOST, block board commands
  if (state.status === 'LOST' || (state.status === 'WON' && !state.keepPlaying)) {
    return {
      ...state,
      lastMoveChangedBoard: false,
    };
  }

  if (command.type === 'SLIDE') {
    const slideResult = slideGrid(state.grid, command.direction);

    // Blocked Move Rule: a directional input that neither moves nor merges a tile is a no-op!
    if (!slideResult.moved) {
      return {
        ...state,
        lastMoveChangedBoard: false,
        lastAction: {
          type: 'BLOCKED_SLIDE',
          changed: false,
          direction: command.direction,
          scoreDelta: 0,
          mergedCells: [],
          spawnedTile: null,
        },
      };
    }

    const rng = SeededRng.fromSnapshot(state.rng);
    const nextGrid = slideResult.grid;
    const spawnedTile = spawnRandomIngredient(nextGrid, rng);

    // Advance customer ticket patience turns by 1 (floors at 0 so tickets remain servable at base price)
    const nextTickets = state.tickets.map((ticket) => ({
      ...ticket,
      patienceTurns: Math.max(0, ticket.patienceTurns - 1),
    }));

    const nextTurnsSinceServe = state.turnsSinceLastServe + 1;
    let nextRushCombo = state.rushCombo;
    if (
      nextRushCombo > 0 &&
      nextTurnsSinceServe >= MERGE_KITCHEN_CONFIG.RUSH_WINDOW_TURNS
    ) {
      nextRushCombo = Math.max(0, nextRushCombo - 1);
    }

    const { highestValue, highestTier } = computeBoardHighest(nextGrid, state.highestValue);
    const discoveredTiers = collectDiscoveredTiers(nextGrid, state.discoveredTiers);
    const nextScore = state.score + slideResult.scoreDelta;
    const nextTurnCount = state.turnCount + 1;

    const reachedShortGoal =
      state.ordersServed >= MERGE_KITCHEN_CONFIG.SHORT_GOAL_ORDERS ||
      highestTier >= MERGE_KITCHEN_CONFIG.SHORT_GOAL_RECIPE_TIER;
    const nextWon = state.won || reachedShortGoal;

    let nextStatus: GameStatus = 'PLAYING';
    if (nextWon && !state.keepPlaying) {
      nextStatus = 'WON';
    } else if (isTerminalLoss({ grid: nextGrid, tickets: nextTickets })) {
      nextStatus = 'LOST';
    }

    return {
      ...state,
      grid: nextGrid,
      score: nextScore,
      turnCount: nextTurnCount,
      highestValue,
      highestTier,
      discoveredTiers,
      rushCombo: nextRushCombo,
      turnsSinceLastServe: nextTurnsSinceServe,
      tickets: nextTickets,
      status: nextStatus,
      won: nextWon,
      lastMoveChangedBoard: true,
      lastAction: {
        type: 'SLIDE',
        changed: true,
        direction: command.direction,
        scoreDelta: slideResult.scoreDelta,
        mergedCells: slideResult.mergedCells,
        spawnedTile,
      },
      rng: rng.getSnapshot(),
    };
  }

  if (command.type === 'SERVE_ORDER') {
    const { ticketIndex, row, col } = command;
    if (ticketIndex < 0 || ticketIndex >= state.tickets.length) {
      return {
        ...state,
        lastMoveChangedBoard: false,
        lastAction: {
          type: 'INVALID_SERVE',
          changed: false,
          scoreDelta: 0,
          mergedCells: [],
          spawnedTile: null,
        },
      };
    }

    const ticket = state.tickets[ticketIndex];
    const matchingCells = findMatchingBoardCells(state.grid, ticket.requiredTier);
    if (matchingCells.length === 0) {
      return {
        ...state,
        lastMoveChangedBoard: false,
        lastAction: {
          type: 'INVALID_SERVE',
          changed: false,
          scoreDelta: 0,
          mergedCells: [],
          spawnedTile: null,
        },
      };
    }

    let chosenCell = matchingCells[0];
    if (row !== undefined && col !== undefined) {
      const explicitMatch = matchingCells.find((c) => c.row === row && c.col === col);
      if (explicitMatch) {
        chosenCell = explicitMatch;
      }
    }

    const rng = SeededRng.fromSnapshot(state.rng);
    const nextGrid = cloneGrid(state.grid);
    nextGrid[chosenCell.row][chosenCell.col] = 0;

    // Safeguard: if serving removed the very last tile on the board, spawn a fresh ingredient
    const remainingTiles = nextGrid.flat().filter((v) => v > 0).length;
    let emergencySpawn: SpawnedTileEvent | null = null;
    if (remainingTiles === 0) {
      emergencySpawn = spawnRandomIngredient(nextGrid, rng);
    }

    const nextOrdersServed = state.ordersServed + 1;
    const nextRushCombo = state.rushCombo + 1;
    const tipMultiplier = computeTicketTipMultiplier(ticket);
    const rushMultiplier = computeRushMultiplier(nextRushCombo);
    const recipe = getRecipeByValue(ticket.requiredValue);
    const scoreAwarded = Math.round(recipe.baseServeScore * tipMultiplier * rushMultiplier);

    const nextTicketSeq = state.ticketSeq + 1;
    const replacementTicket = createCustomerTicket(
      rng,
      ticketIndex,
      nextOrdersServed,
      state.ticketSeq
    );

    const nextTickets = state.tickets.map((t, idx) =>
      idx === ticketIndex ? replacementTicket : t
    );

    const reachedShortGoal =
      nextOrdersServed >= MERGE_KITCHEN_CONFIG.SHORT_GOAL_ORDERS ||
      state.highestTier >= MERGE_KITCHEN_CONFIG.SHORT_GOAL_RECIPE_TIER;
    const nextWon = state.won || reachedShortGoal;

    let nextStatus: GameStatus = 'PLAYING';
    if (nextWon && !state.keepPlaying) {
      nextStatus = 'WON';
    } else if (isTerminalLoss({ grid: nextGrid, tickets: nextTickets })) {
      nextStatus = 'LOST';
    }

    return {
      ...state,
      grid: nextGrid,
      score: state.score + scoreAwarded,
      ordersServed: nextOrdersServed,
      rushCombo: nextRushCombo,
      turnsSinceLastServe: 0,
      tickets: nextTickets,
      ticketSeq: nextTicketSeq,
      status: nextStatus,
      won: nextWon,
      lastMoveChangedBoard: true,
      lastAction: {
        type: 'SERVE_ORDER',
        changed: true,
        scoreDelta: scoreAwarded,
        mergedCells: [],
        spawnedTile: emergencySpawn,
        servedTicket: {
          slotIndex: ticketIndex,
          dishName: ticket.dishName,
          tier: ticket.requiredTier,
          value: ticket.requiredValue,
          row: chosenCell.row,
          col: chosenCell.col,
          scoreAwarded,
          tipMultiplier: Number((tipMultiplier * rushMultiplier).toFixed(2)),
          rushCombo: nextRushCombo,
        },
      },
      rng: rng.getSnapshot(),
    };
  }

  return state;
}
