import { CONFIG } from './config.ts';
import { getScenarioById } from './content.ts';
import {
  BoardState,
  DistrictState,
  GameState,
  StagedActionRecord,
  TurnHistoryEntry,
  cloneBoard,
  createInitialGameState,
  previewTurnOutcome,
} from './simulation.ts';

export interface SerializedSavePayload {
  rulesVersion: string;
  savedAtIso: string;
  scenarioId: string;
  seed?: number;
  turn: number;
  status: 'playing' | 'won' | 'lost';
  lossReason: string | null;
  materials: number;
  actionsRemaining: number;
  board: BoardState;
  districts: Record<string, DistrictState>;
  cityCumulativeUnmetMW: number;
  stagedActions: StagedActionRecord[];
  turnStartSnapshot: {
    board: BoardState;
    materials: number;
    actionsRemaining: number;
  };
  history: TurnHistoryEntry[];
}

export function serializeGameState(state: GameState): string {
  const payload: SerializedSavePayload = {
    rulesVersion: CONFIG.RULES_VERSION,
    savedAtIso: new Date().toISOString(),
    scenarioId: state.scenarioId,
    seed: state.scenario.seed,
    turn: state.turn,
    status: state.status,
    lossReason: state.lossReason,
    materials: state.materials,
    actionsRemaining: state.actionsRemaining,
    board: cloneBoard(state.board),
    districts: JSON.parse(JSON.stringify(state.districts)),
    cityCumulativeUnmetMW: state.cityCumulativeUnmetMW,
    stagedActions: JSON.parse(JSON.stringify(state.stagedActions)),
    turnStartSnapshot: {
      board: cloneBoard(state.turnStartSnapshot.board),
      materials: state.turnStartSnapshot.materials,
      actionsRemaining: state.turnStartSnapshot.actionsRemaining,
    },
    history: JSON.parse(JSON.stringify(state.history)),
  };
  return JSON.stringify(payload);
}

export function deserializeGameState(rawJson: string): GameState | null {
  try {
    const parsed = JSON.parse(rawJson) as Partial<SerializedSavePayload>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.rulesVersion !== CONFIG.RULES_VERSION) return null;
    if (typeof parsed.scenarioId !== 'string') return null;
    if (typeof parsed.turn !== 'number' || parsed.turn < 1 || parsed.turn > CONFIG.TOTAL_TURNS) {
      return null;
    }
    if (typeof parsed.materials !== 'number' || typeof parsed.actionsRemaining !== 'number') {
      return null;
    }
    if (!parsed.board || typeof parsed.board.links !== 'object') return null;
    if (!parsed.districts || typeof parsed.districts !== 'object') return null;
    if (!parsed.turnStartSnapshot || typeof parsed.turnStartSnapshot.board?.links !== 'object') {
      return null;
    }

    const scenario = getScenarioById(parsed.scenarioId, parsed.seed ?? CONFIG.DEFAULT_SEED);
    const baseState = createInitialGameState(scenario);

    baseState.turn = parsed.turn;
    baseState.status =
      parsed.status === 'won' || parsed.status === 'lost' ? parsed.status : 'playing';
    baseState.lossReason = parsed.lossReason ?? null;
    baseState.materials = parsed.materials;
    baseState.actionsRemaining = parsed.actionsRemaining;
    baseState.board = cloneBoard(parsed.board);
    baseState.cityCumulativeUnmetMW =
      typeof parsed.cityCumulativeUnmetMW === 'number' ? parsed.cityCumulativeUnmetMW : 0;

    for (const d of scenario.districts) {
      const savedDist = parsed.districts[d.id];
      if (savedDist && typeof savedDist.cumulativeUnmetMW === 'number') {
        baseState.districts[d.id] = {
          ...baseState.districts[d.id],
          cumulativeUnmetMW: savedDist.cumulativeUnmetMW,
          lastTurnDeliveredMW: savedDist.lastTurnDeliveredMW ?? 0,
          lastTurnUnmetMW: savedDist.lastTurnUnmetMW ?? 0,
        };
      }
    }

    baseState.stagedActions = Array.isArray(parsed.stagedActions) ? parsed.stagedActions : [];
    baseState.turnStartSnapshot = {
      board: cloneBoard(parsed.turnStartSnapshot.board),
      materials: parsed.turnStartSnapshot.materials,
      actionsRemaining: parsed.turnStartSnapshot.actionsRemaining,
    };
    baseState.history = Array.isArray(parsed.history) ? parsed.history : [];
    baseState.preview = previewTurnOutcome(baseState);

    return baseState;
  } catch {
    return null;
  }
}

export function saveGameStateToStorage(state: GameState, storageKey = CONFIG.STORAGE_KEY): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem(storageKey, serializeGameState(state));
    return true;
  } catch {
    return false;
  }
}

export function loadGameStateFromStorage(storageKey = CONFIG.STORAGE_KEY): GameState | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const restored = deserializeGameState(raw);
    if (!restored) {
      window.localStorage.removeItem(storageKey);
      return null;
    }
    return restored;
  } catch {
    return null;
  }
}

export function clearSavedGameState(storageKey = CONFIG.STORAGE_KEY): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(storageKey);
  } catch {
    // Ignore storage access errors
  }
}
