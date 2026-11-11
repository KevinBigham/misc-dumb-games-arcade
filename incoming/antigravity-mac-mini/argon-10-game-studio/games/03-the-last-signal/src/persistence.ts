import { DEFAULT_SEED, SAVE_VERSION, STORAGE_KEY } from './config';
import { clampResources, createInitialState, GameState } from './simulation';

export interface SaveEnvelope {
  version: number;
  savedAt: string;
  state: GameState;
}

function isValidGameState(candidate: unknown): candidate is GameState {
  if (!candidate || typeof candidate !== 'object') return false;
  const s = candidate as Partial<GameState>;
  if (typeof s.seed !== 'number' || typeof s.cycle !== 'number') return false;
  if (s.chapter !== 1 && s.chapter !== 2 && s.chapter !== 3) return false;
  if (!s.resources || typeof s.resources.watts !== 'number') return false;
  if (!s.unlockedResources || typeof s.unlockedResources.watts !== 'boolean') {
    return false;
  }
  if (!s.capabilities || typeof s.capabilities.receiverWarmed !== 'boolean') {
    return false;
  }
  if (!Array.isArray(s.completedEvents) || !Array.isArray(s.eventLog)) {
    return false;
  }
  return true;
}

export function serializeState(state: GameState): string {
  const envelope: SaveEnvelope = {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    state: structuredClone(state),
  };
  return JSON.stringify(envelope);
}

export function deserializeState(raw: string): GameState | null {
  try {
    const parsed = JSON.parse(raw) as Partial<SaveEnvelope>;
    if (!parsed || parsed.version !== SAVE_VERSION || !parsed.state) {
      return null;
    }
    if (!isValidGameState(parsed.state)) {
      return null;
    }

    const restored: GameState = structuredClone(parsed.state);
    // Ensure all completedEvents and eventLog entries are consistent so no duplicate rewards can occur
    for (const logEntry of restored.eventLog) {
      if (!restored.completedEvents.includes(logEntry.eventId)) {
        restored.completedEvents.push(logEntry.eventId);
      }
    }
    clampResources(restored);
    return restored;
  } catch {
    return null;
  }
}

export function saveToLocalStorage(
  state: GameState,
  storageKey: string = STORAGE_KEY
): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem(storageKey, serializeState(state));
    return true;
  } catch {
    return false;
  }
}

export function loadFromLocalStorage(
  storageKey: string = STORAGE_KEY
): GameState | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return deserializeState(raw);
  } catch {
    return null;
  }
}

export function clearLocalStorageSave(
  storageKey: string = STORAGE_KEY
): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(storageKey);
  } catch {
    // ignore storage errors
  }
}

export function loadOrInitializeState(
  initialSeed: number = DEFAULT_SEED,
  storageKey: string = STORAGE_KEY
): GameState {
  const existing = loadFromLocalStorage(storageKey);
  if (existing) {
    return existing;
  }
  return createInitialState(initialSeed);
}
