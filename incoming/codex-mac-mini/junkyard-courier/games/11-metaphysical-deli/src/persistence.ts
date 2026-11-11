import { CONFIG } from './config';
import { DeliGameState } from './simulation';

export const SAVE_SCHEMA_VERSION = 1;

export interface DeliCareerStats {
  highScore: number;
  maxFeverTier: number;
  maxComboReached: number;
  totalPatronsFedLifetime: number;
  hybridsDiscovered: string[];
  gamesPlayed: number;
  victoriesUnlocked: number;
}

export interface DeliSaveEnvelope {
  schemaVersion: number;
  gameId: string;
  updatedAtIso: string;
  career: DeliCareerStats;
  activeRun: DeliGameState | null;
}

export function createDefaultCareerStats(): DeliCareerStats {
  return {
    highScore: 0,
    maxFeverTier: 1,
    maxComboReached: 1,
    totalPatronsFedLifetime: 0,
    hybridsDiscovered: [],
    gamesPlayed: 0,
    victoriesUnlocked: 0,
  };
}

export function cloneDeliState(state: DeliGameState): DeliGameState {
  return {
    ...state,
    vortexFlavors: { ...state.vortexFlavors },
    lastBoiledSymbols: [...state.lastBoiledSymbols],
    ingredients: state.ingredients.map((i) => ({
      ...i,
      flavors: { ...i.flavors },
    })),
    booths: state.booths.map((b) => ({ ...b })),
    discoveredHybrids: [...state.discoveredHybrids],
    events: [],
  };
}

export function serializeDeliEnvelope(
  career: DeliCareerStats,
  activeRun: DeliGameState | null
): string {
  const envelope: DeliSaveEnvelope = {
    schemaVersion: SAVE_SCHEMA_VERSION,
    gameId: CONFIG.GAME_ID,
    updatedAtIso: new Date().toISOString(),
    career: {
      ...career,
      hybridsDiscovered: [...career.hybridsDiscovered],
    },
    activeRun: activeRun ? cloneDeliState(activeRun) : null,
  };
  return JSON.stringify(envelope);
}

export function deserializeDeliEnvelope(rawJson: string): DeliSaveEnvelope | null {
  try {
    const parsed = JSON.parse(rawJson) as Partial<DeliSaveEnvelope>;
    if (
      !parsed ||
      parsed.schemaVersion !== SAVE_SCHEMA_VERSION ||
      parsed.gameId !== CONFIG.GAME_ID ||
      !parsed.career
    ) {
      return null;
    }

    const career: DeliCareerStats = {
      highScore: Math.max(0, Number(parsed.career.highScore) || 0),
      maxFeverTier: Math.max(1, Number(parsed.career.maxFeverTier) || 1),
      maxComboReached: Math.max(1, Number(parsed.career.maxComboReached) || 1),
      totalPatronsFedLifetime: Math.max(
        0,
        Number(parsed.career.totalPatronsFedLifetime) || 0
      ),
      hybridsDiscovered: Array.isArray(parsed.career.hybridsDiscovered)
        ? parsed.career.hybridsDiscovered.filter((x) => typeof x === 'string')
        : [],
      gamesPlayed: Math.max(0, Number(parsed.career.gamesPlayed) || 0),
      victoriesUnlocked: Math.max(
        0,
        Number(parsed.career.victoriesUnlocked) || 0
      ),
    };

    let activeRun: DeliGameState | null = null;
    if (
      parsed.activeRun &&
      typeof parsed.activeRun.seed === 'number' &&
      Array.isArray(parsed.activeRun.ingredients) &&
      Array.isArray(parsed.activeRun.booths)
    ) {
      activeRun = cloneDeliState(parsed.activeRun as DeliGameState);
    }

    return {
      schemaVersion: SAVE_SCHEMA_VERSION,
      gameId: CONFIG.GAME_ID,
      updatedAtIso:
        typeof parsed.updatedAtIso === 'string'
          ? parsed.updatedAtIso
          : new Date().toISOString(),
      career,
      activeRun,
    };
  } catch {
    return null;
  }
}

export function loadDeliSave(
  storageKey: string = CONFIG.STORAGE_KEY
): DeliSaveEnvelope {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const loaded = deserializeDeliEnvelope(raw);
        if (loaded) return loaded;
      }
    }
  } catch {
    // Fallback to in-memory default if localStorage is blocked
  }
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    gameId: CONFIG.GAME_ID,
    updatedAtIso: new Date().toISOString(),
    career: createDefaultCareerStats(),
    activeRun: null,
  };
}

export function saveDeliState(
  career: DeliCareerStats,
  activeRun: DeliGameState | null,
  storageKey: string = CONFIG.STORAGE_KEY
): DeliSaveEnvelope {
  const mergedHybrids = new Set<string>(career.hybridsDiscovered);
  if (activeRun) {
    for (const h of activeRun.discoveredHybrids) {
      mergedHybrids.add(h);
    }
  }

  const updatedCareer: DeliCareerStats = {
    highScore: Math.max(career.highScore, activeRun?.score ?? 0),
    maxFeverTier: Math.max(career.maxFeverTier, activeRun?.feverTier ?? 1),
    maxComboReached: Math.max(
      career.maxComboReached,
      activeRun?.maxComboReached ?? 1
    ),
    totalPatronsFedLifetime: Math.max(
      career.totalPatronsFedLifetime,
      activeRun?.patronsFed ?? 0
    ),
    hybridsDiscovered: Array.from(mergedHybrids),
    gamesPlayed: career.gamesPlayed,
    victoriesUnlocked: Math.max(
      career.victoriesUnlocked,
      activeRun?.victoryUnlocked ? 1 : 0
    ),
  };

  const json = serializeDeliEnvelope(updatedCareer, activeRun);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(storageKey, json);
    }
  } catch {
    // Ignore storage errors
  }

  return deserializeDeliEnvelope(json)!;
}
