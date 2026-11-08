import { GAME_CONFIG } from './config';
import { GameState, RunEpitaph } from './simulation';

export interface SavedRunEnvelope {
  version: 1;
  savedAt: string;
  state: GameState;
}

export interface ChroniclesEnvelope {
  version: 1;
  epitaphs: RunEpitaph[];
}

function getSafeStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function saveActiveRun(state: GameState): void {
  const storage = getSafeStorage();
  if (!storage) return;

  // Permadeath & Run Completion Enforcement:
  // If the hero died or achieved victory, delete the active run save slot and record the epitaph!
  if (state.status !== 'playing') {
    clearActiveRun();
    if (state.epitaph) {
      recordEpitaph(state.epitaph);
    }
    return;
  }

  try {
    const envelope: SavedRunEnvelope = {
      version: 1,
      savedAt: new Date().toISOString(),
      state,
    };
    storage.setItem(GAME_CONFIG.STORAGE_KEY_ACTIVE_RUN, JSON.stringify(envelope));
  } catch {
    // Ignore storage quota errors in restricted sandboxes
  }
}

export function loadActiveRun(): GameState | null {
  const storage = getSafeStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(GAME_CONFIG.STORAGE_KEY_ACTIVE_RUN);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedRunEnvelope>;
    if (
      parsed.version !== 1 ||
      !parsed.state ||
      parsed.state.status !== 'playing' ||
      !parsed.state.hero ||
      !parsed.state.floor
    ) {
      return null;
    }
    return parsed.state;
  } catch {
    return null;
  }
}

export function clearActiveRun(): void {
  const storage = getSafeStorage();
  if (!storage) return;
  try {
    storage.removeItem(GAME_CONFIG.STORAGE_KEY_ACTIVE_RUN);
  } catch {
    // Ignore
  }
}

export function recordEpitaph(epitaph: RunEpitaph): void {
  const storage = getSafeStorage();
  if (!storage) return;

  try {
    const current = loadChronicles();
    const deduped = current.filter((e) => e.id !== epitaph.id);
    deduped.unshift(epitaph);
    const trimmed = deduped.slice(0, 25);
    const envelope: ChroniclesEnvelope = {
      version: 1,
      epitaphs: trimmed,
    };
    storage.setItem(GAME_CONFIG.STORAGE_KEY_CHRONICLES, JSON.stringify(envelope));
  } catch {
    // Ignore
  }
}

export function loadChronicles(): RunEpitaph[] {
  const storage = getSafeStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(GAME_CONFIG.STORAGE_KEY_CHRONICLES);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<ChroniclesEnvelope>;
    if (parsed.version !== 1 || !Array.isArray(parsed.epitaphs)) {
      return [];
    }
    return parsed.epitaphs;
  } catch {
    return [];
  }
}

export function exportRunSnapshot(state: GameState): string {
  const envelope: SavedRunEnvelope = {
    version: 1,
    savedAt: new Date().toISOString(),
    state,
  };
  return JSON.stringify(envelope, null, 2);
}

export function importRunSnapshot(jsonStr: string): GameState | null {
  try {
    const parsed = JSON.parse(jsonStr) as Partial<SavedRunEnvelope>;
    if (
      parsed.version !== 1 ||
      !parsed.state ||
      typeof parsed.state.seed !== 'number' ||
      !parsed.state.hero ||
      !parsed.state.floor ||
      !parsed.state.colorToEffect
    ) {
      return null;
    }
    return parsed.state;
  } catch {
    return null;
  }
}
