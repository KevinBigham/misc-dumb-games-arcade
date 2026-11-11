import { CONFIG } from './config';
import { createInitialState, GameState } from './simulation';

export const SAVE_SCHEMA_VERSION = 1;

export interface BestFactoryRecord {
  bestWaveReached: number;
  bestQuotaProgress: number;
  bestCreditsEarned: number;
  campaignsWon: number;
}

export interface SaveEnvelopeV1 {
  schemaVersion: number;
  savedAtIso: string;
  state: GameState;
  bestRecord: BestFactoryRecord;
}

const DEFAULT_BEST_RECORD: BestFactoryRecord = {
  bestWaveReached: 1,
  bestQuotaProgress: 0,
  bestCreditsEarned: 0,
  campaignsWon: 0,
};

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export function serializeGameState(
  state: GameState,
  bestRecord?: BestFactoryRecord
): string {
  const currentBest = bestRecord ?? computeUpdatedBestRecord(state, DEFAULT_BEST_RECORD);
  const envelope: SaveEnvelopeV1 = {
    schemaVersion: SAVE_SCHEMA_VERSION,
    savedAtIso: new Date().toISOString(),
    state: deepClone(state),
    bestRecord: currentBest,
  };
  return JSON.stringify(envelope);
}

export function deserializeGameState(rawJson: string): {
  state: GameState;
  bestRecord: BestFactoryRecord;
} | null {
  try {
    const parsed = JSON.parse(rawJson) as Partial<SaveEnvelopeV1>;
    if (
      !parsed ||
      parsed.schemaVersion !== SAVE_SCHEMA_VERSION ||
      !parsed.state ||
      typeof parsed.state.gridSize !== 'number' ||
      !Array.isArray(parsed.state.grid)
    ) {
      return null;
    }

    const fallback = createInitialState({ seed: parsed.state.seed ?? 9092026 });
    const restoredState: GameState = {
      ...fallback,
      ...deepClone(parsed.state),
    };

    const bestRecord: BestFactoryRecord = {
      ...DEFAULT_BEST_RECORD,
      ...(parsed.bestRecord ?? {}),
    };

    return { state: restoredState, bestRecord };
  } catch {
    return null;
  }
}

export function computeUpdatedBestRecord(
  state: GameState,
  prev: BestFactoryRecord
): BestFactoryRecord {
  return {
    bestWaveReached: Math.max(prev.bestWaveReached, state.wave),
    bestQuotaProgress: Math.max(prev.bestQuotaProgress, state.quotaProgress),
    bestCreditsEarned: Math.max(prev.bestCreditsEarned, state.stats.totalCreditsEarned),
    campaignsWon:
      prev.campaignsWon + (state.status === 'victory' && prev.campaignsWon === 0 ? 1 : 0),
  };
}

export function saveGameToStorage(
  state: GameState,
  storageKey: string = CONFIG.STORAGE_KEY
): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const prev = loadGameFromStorage(storageKey)?.bestRecord ?? DEFAULT_BEST_RECORD;
    const updatedBest = computeUpdatedBestRecord(state, prev);
    const payload = serializeGameState(state, updatedBest);
    window.localStorage.setItem(storageKey, payload);
    return true;
  } catch {
    return false;
  }
}

export function loadGameFromStorage(
  storageKey: string = CONFIG.STORAGE_KEY
): { state: GameState; bestRecord: BestFactoryRecord } | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return deserializeGameState(raw);
  } catch {
    return null;
  }
}

export function clearSavedGame(storageKey: string = CONFIG.STORAGE_KEY): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(storageKey);
  } catch {
    // ignore storage errors in restricted environments
  }
}
