import { MERGE_KITCHEN_CONFIG } from './config.ts';
import { createInitialState, MergeKitchenState } from './simulation.ts';

export interface MergeKitchenProfile {
  version: number;
  bestScore: number;
  mostOrdersServed: number;
  highestTierReached: number;
  highestValueReached: number;
  gamesPlayed: number;
  totalWins: number;
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export interface ExportBundle {
  gameId: string;
  version: number;
  exportedAt: string;
  state: MergeKitchenState;
  profile: MergeKitchenProfile;
}

export function createDefaultProfile(): MergeKitchenProfile {
  return {
    version: MERGE_KITCHEN_CONFIG.SAVE_VERSION,
    bestScore: 0,
    mostOrdersServed: 0,
    highestTierReached: 1,
    highestValueReached: 2,
    gamesPlayed: 1,
    totalWins: 0,
    soundEnabled: true,
    reducedMotion: false,
  };
}

function isValidGrid(grid: unknown): grid is number[][] {
  if (!Array.isArray(grid) || grid.length !== MERGE_KITCHEN_CONFIG.GRID_SIZE) {
    return false;
  }
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== MERGE_KITCHEN_CONFIG.GRID_SIZE) {
      return false;
    }
    for (const cell of row) {
      if (typeof cell !== 'number' || !Number.isFinite(cell) || cell < 0) {
        return false;
      }
    }
  }
  return true;
}

export function isValidGameState(candidate: unknown): candidate is MergeKitchenState {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }
  const s = candidate as Record<string, unknown>;
  if (s.version !== MERGE_KITCHEN_CONFIG.SAVE_VERSION) {
    return false;
  }
  if (!isValidGrid(s.grid)) {
    return false;
  }
  if (typeof s.score !== 'number' || typeof s.ordersServed !== 'number') {
    return false;
  }
  if (!Array.isArray(s.tickets) || s.tickets.length !== MERGE_KITCHEN_CONFIG.ORDER_SLOT_COUNT) {
    return false;
  }
  if (!s.rng || typeof (s.rng as Record<string, unknown>).seed !== 'number') {
    return false;
  }
  return true;
}

export function saveGameState(
  state: MergeKitchenState,
  storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(MERGE_KITCHEN_CONFIG.STORAGE_KEY_STATE, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function loadGameState(
  fallbackSeed: number = MERGE_KITCHEN_CONFIG.DEFAULT_SEED,
  storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null
): { state: MergeKitchenState; restoredFromSave: boolean; recoveredFromCorruption: boolean } {
  if (!storage) {
    return {
      state: createInitialState(fallbackSeed),
      restoredFromSave: false,
      recoveredFromCorruption: false,
    };
  }

  try {
    const raw = storage.getItem(MERGE_KITCHEN_CONFIG.STORAGE_KEY_STATE);
    if (!raw) {
      return {
        state: createInitialState(fallbackSeed),
        restoredFromSave: false,
        recoveredFromCorruption: false,
      };
    }
    const parsed: unknown = JSON.parse(raw);
    if (isValidGameState(parsed)) {
      return {
        state: parsed,
        restoredFromSave: true,
        recoveredFromCorruption: false,
      };
    }
    // Corrupted or outdated payload: clean up and recover gracefully
    storage.removeItem(MERGE_KITCHEN_CONFIG.STORAGE_KEY_STATE);
    return {
      state: createInitialState(fallbackSeed),
      restoredFromSave: false,
      recoveredFromCorruption: true,
    };
  } catch {
    try {
      storage.removeItem(MERGE_KITCHEN_CONFIG.STORAGE_KEY_STATE);
    } catch {
      // ignore
    }
    return {
      state: createInitialState(fallbackSeed),
      restoredFromSave: false,
      recoveredFromCorruption: true,
    };
  }
}

export function loadProfile(
  storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null
): MergeKitchenProfile {
  const defaults = createDefaultProfile();
  if (!storage) return defaults;
  try {
    const raw = storage.getItem(MERGE_KITCHEN_CONFIG.STORAGE_KEY_PROFILE);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<MergeKitchenProfile>;
    if (!parsed || typeof parsed !== 'object') {
      return defaults;
    }
    return {
      version: MERGE_KITCHEN_CONFIG.SAVE_VERSION,
      bestScore: typeof parsed.bestScore === 'number' ? Math.max(0, parsed.bestScore) : 0,
      mostOrdersServed:
        typeof parsed.mostOrdersServed === 'number' ? Math.max(0, parsed.mostOrdersServed) : 0,
      highestTierReached:
        typeof parsed.highestTierReached === 'number'
          ? Math.max(1, parsed.highestTierReached)
          : 1,
      highestValueReached:
        typeof parsed.highestValueReached === 'number'
          ? Math.max(2, parsed.highestValueReached)
          : 2,
      gamesPlayed:
        typeof parsed.gamesPlayed === 'number' ? Math.max(1, parsed.gamesPlayed) : 1,
      totalWins: typeof parsed.totalWins === 'number' ? Math.max(0, parsed.totalWins) : 0,
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      reducedMotion: typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion : false,
    };
  } catch {
    return defaults;
  }
}

export function saveProfile(
  profile: MergeKitchenProfile,
  storage: Storage | null = typeof window !== 'undefined' ? window.localStorage : null
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(MERGE_KITCHEN_CONFIG.STORAGE_KEY_PROFILE, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}

export function syncProfileWithState(
  profile: MergeKitchenProfile,
  state: MergeKitchenState,
  justWon = false
): MergeKitchenProfile {
  return {
    ...profile,
    bestScore: Math.max(profile.bestScore, state.score),
    mostOrdersServed: Math.max(profile.mostOrdersServed, state.ordersServed),
    highestTierReached: Math.max(profile.highestTierReached, state.highestTier),
    highestValueReached: Math.max(profile.highestValueReached, state.highestValue),
    totalWins: justWon ? profile.totalWins + 1 : profile.totalWins,
  };
}

export function exportSaveString(
  state: MergeKitchenState,
  profile: MergeKitchenProfile
): string {
  const bundle: ExportBundle = {
    gameId: MERGE_KITCHEN_CONFIG.GAME_ID,
    version: MERGE_KITCHEN_CONFIG.SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    state,
    profile,
  };
  return JSON.stringify(bundle);
}

export function importSaveString(
  jsonText: string
): { ok: true; state: MergeKitchenState; profile?: MergeKitchenProfile } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(jsonText) as Partial<ExportBundle> & Partial<MergeKitchenState>;
    if (parsed && isValidGameState(parsed.state)) {
      return {
        ok: true,
        state: parsed.state,
        profile: parsed.profile,
      };
    }
    if (isValidGameState(parsed)) {
      return {
        ok: true,
        state: parsed,
      };
    }
    return {
      ok: false,
      error: 'Invalid Merge Kitchen save structure or version mismatch.',
    };
  } catch {
    return {
      ok: false,
      error: 'Could not parse save JSON string.',
    };
  }
}
