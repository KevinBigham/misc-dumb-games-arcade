import {
  ATTRIBUTE_KEYS,
  clampAttribute,
  clampFatigue,
  CONFIG,
  RULES_VERSION,
  SAVE_SCHEMA_VERSION,
  STORAGE_KEY,
  TACTICAL_PLAN_IDS,
} from './config.ts';
import { cloneState, createInitialState, GameState } from './simulation.ts';

export interface SaveEnvelope {
  schemaVersion: number;
  rulesVersion: string;
  savedAtIso: string;
  state: GameState;
}

export function validateAndSanitizeState(candidate: unknown): GameState {
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('Save data is not a valid object.');
  }
  const raw = candidate as Partial<GameState>;

  if (raw.rulesVersion !== RULES_VERSION) {
    throw new Error(
      `Incompatible rulesVersion: expected ${RULES_VERSION}, got ${String(raw.rulesVersion)}`,
    );
  }

  if (
    typeof raw.seed !== 'number' ||
    typeof raw.rngState !== 'number' ||
    typeof raw.fixtureNumber !== 'number' ||
    raw.fixtureNumber < 1 ||
    raw.fixtureNumber > CONFIG.seasonFixtures
  ) {
    throw new Error('Invalid seed, rngState, or fixtureNumber in save state.');
  }

  const validPhases = [
    'preparation',
    'match_review',
    'development',
    'season_recap',
  ];
  if (!raw.phase || !validPhases.includes(raw.phase)) {
    throw new Error(`Invalid game phase: ${String(raw.phase)}`);
  }

  if (!Array.isArray(raw.roster) || raw.roster.length !== CONFIG.rosterSize) {
    throw new Error(`Roster must contain exactly ${CONFIG.rosterSize} players.`);
  }

  for (const player of raw.roster) {
    if (!player || typeof player.id !== 'string' || typeof player.name !== 'string') {
      throw new Error('Invalid player entry in roster.');
    }
    for (const key of ATTRIBUTE_KEYS) {
      if (typeof player[key] !== 'number') {
        throw new Error(`Player ${player.id} missing numeric attribute ${key}.`);
      }
      player[key] = clampAttribute(player[key]);
    }
    if (typeof player.fatigue !== 'number') {
      throw new Error(`Player ${player.id} missing numeric fatigue.`);
    }
    player.fatigue = clampFatigue(player.fatigue);
  }

  if (
    !Array.isArray(raw.selectedStarterIds) ||
    new Set(raw.selectedStarterIds).size !== CONFIG.startersCount
  ) {
    throw new Error(
      `selectedStarterIds must contain ${CONFIG.startersCount} unique IDs.`,
    );
  }

  if (
    !raw.selectedPlan ||
    !TACTICAL_PLAN_IDS.includes(raw.selectedPlan)
  ) {
    throw new Error(`Invalid selectedPlan: ${String(raw.selectedPlan)}`);
  }

  // Ensure idempotency flags on currentMatch and seasonHistory are preserved
  if (raw.currentMatch) {
    raw.currentMatch.fatigueApplied = Boolean(raw.currentMatch.fatigueApplied);
    raw.currentMatch.devChoiceApplied = Boolean(
      raw.currentMatch.devChoiceApplied,
    );
  }

  if (Array.isArray(raw.seasonHistory)) {
    for (const m of raw.seasonHistory) {
      m.fatigueApplied = Boolean(m.fatigueApplied);
      m.devChoiceApplied = Boolean(m.devChoiceApplied);
    }
  } else {
    raw.seasonHistory = [];
  }

  return cloneState(raw as GameState);
}

export function serializeSaveEnvelope(state: GameState): string {
  const validated = validateAndSanitizeState(state);
  const envelope: SaveEnvelope = {
    schemaVersion: SAVE_SCHEMA_VERSION,
    rulesVersion: RULES_VERSION,
    savedAtIso: new Date().toISOString(),
    state: validated,
  };
  return JSON.stringify(envelope, null, 2);
}

export function parseSaveEnvelope(rawJson: string): GameState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('Corrupted save JSON: unable to parse.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Save payload must be a JSON object.');
  }

  const env = parsed as Partial<SaveEnvelope>;
  if (env.schemaVersion !== SAVE_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported save schemaVersion: expected ${SAVE_SCHEMA_VERSION}, got ${String(env.schemaVersion)}`,
    );
  }

  return validateAndSanitizeState(env.state);
}

export function saveStateToStorage(
  state: GameState,
  storageKey: string = STORAGE_KEY,
): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const payload = serializeSaveEnvelope(state);
    window.localStorage.setItem(storageKey, payload);
    return true;
  } catch {
    return false;
  }
}

export function loadStateFromStorage(
  fallbackSeed: number = CONFIG.defaultSeed,
  storageKey: string = STORAGE_KEY,
): {
  state: GameState;
  loadedFromSave: boolean;
  recoveredFromError?: string;
} {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        state: createInitialState(fallbackSeed),
        loadedFromSave: false,
      };
    }
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return {
        state: createInitialState(fallbackSeed),
        loadedFromSave: false,
      };
    }
    const restored = parseSaveEnvelope(raw);
    return {
      state: restored,
      loadedFromSave: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown save error';
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore cleanup error
    }
    return {
      state: createInitialState(fallbackSeed),
      loadedFromSave: false,
      recoveredFromError: message,
    };
  }
}

export function clearSavedState(storageKey: string = STORAGE_KEY): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(storageKey);
    }
  } catch {
    // ignore storage errors
  }
}
