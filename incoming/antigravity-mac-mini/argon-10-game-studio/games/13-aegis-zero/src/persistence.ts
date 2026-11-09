import { LOADOUT_CHASSIS } from './content';

export const PERSISTENCE_KEY = 'argon_game13_aegis_zero_save_v1';

export interface RunTelemetryRecord {
  runKey: string;
  seed: number;
  loadoutId: string;
  outcome: 'victory' | 'defeat';
  waveReached: number;
  score: number;
  peakCombo: number;
  totalDamageDealt: number;
  bulletsGrazed: number;
  bulletsShattered: number;
  supercriticalGemsCollected: number;
  augmentsPicked: string[];
  causeOfEnd: string;
  timestampIso: string;
}

export interface AegisSaveDataV1 {
  version: 1;
  bestScore: number;
  bestCombo: number;
  totalRuns: number;
  totalVictories: number;
  totalBulletsGrazed: number;
  selectedLoadoutId: string;
  unlockedLoadoutIds: string[];
  processedRunKeys: string[];
  recentRuns: RunTelemetryRecord[];
}

export function createDefaultSaveData(): AegisSaveDataV1 {
  return {
    version: 1,
    bestScore: 0,
    bestCombo: 1,
    totalRuns: 0,
    totalVictories: 0,
    totalBulletsGrazed: 0,
    selectedLoadoutId: 'vanguard-zero',
    unlockedLoadoutIds: ['vanguard-zero'],
    processedRunKeys: [],
    recentRuns: [],
  };
}

export function loadAegisSave(): AegisSaveDataV1 {
  try {
    if (typeof localStorage === 'undefined') {
      return createDefaultSaveData();
    }
    const raw = localStorage.getItem(PERSISTENCE_KEY);
    if (!raw) {
      return createDefaultSaveData();
    }
    const parsed = JSON.parse(raw) as Partial<AegisSaveDataV1>;
    if (!parsed || parsed.version !== 1) {
      return createDefaultSaveData();
    }
    const unlocked = Array.isArray(parsed.unlockedLoadoutIds)
      ? Array.from(new Set(['vanguard-zero', ...parsed.unlockedLoadoutIds]))
      : ['vanguard-zero'];

    const selected =
      typeof parsed.selectedLoadoutId === 'string' && unlocked.includes(parsed.selectedLoadoutId)
        ? parsed.selectedLoadoutId
        : 'vanguard-zero';

    return {
      version: 1,
      bestScore: typeof parsed.bestScore === 'number' ? Math.max(0, Math.floor(parsed.bestScore)) : 0,
      bestCombo: typeof parsed.bestCombo === 'number' ? Math.max(1, Math.floor(parsed.bestCombo)) : 1,
      totalRuns: typeof parsed.totalRuns === 'number' ? Math.max(0, Math.floor(parsed.totalRuns)) : 0,
      totalVictories:
        typeof parsed.totalVictories === 'number' ? Math.max(0, Math.floor(parsed.totalVictories)) : 0,
      totalBulletsGrazed:
        typeof parsed.totalBulletsGrazed === 'number'
          ? Math.max(0, Math.floor(parsed.totalBulletsGrazed))
          : 0,
      selectedLoadoutId: selected,
      unlockedLoadoutIds: unlocked,
      processedRunKeys: Array.isArray(parsed.processedRunKeys) ? parsed.processedRunKeys.slice(-50) : [],
      recentRuns: Array.isArray(parsed.recentRuns) ? parsed.recentRuns.slice(0, 12) : [],
    };
  } catch {
    return createDefaultSaveData();
  }
}

export function saveAegisData(save: AegisSaveDataV1): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(save));
  } catch {
    // Ignore quota errors in restricted sandboxes
  }
}

export function recordCompletedRun(
  currentSave: AegisSaveDataV1,
  record: RunTelemetryRecord
): AegisSaveDataV1 {
  // Anti-double-reward protection: never credit the same runKey twice
  if (currentSave.processedRunKeys.includes(record.runKey)) {
    return currentSave;
  }

  const nextBestScore = Math.max(currentSave.bestScore, record.score);
  const nextBestCombo = Math.max(currentSave.bestCombo, record.peakCombo);

  const unlockedSet = new Set(currentSave.unlockedLoadoutIds);
  unlockedSet.add('vanguard-zero');
  for (const chassis of LOADOUT_CHASSIS) {
    if (nextBestScore >= chassis.unlockMinBestScore || record.outcome === 'victory') {
      unlockedSet.add(chassis.id);
    }
  }

  const updated: AegisSaveDataV1 = {
    version: 1,
    bestScore: nextBestScore,
    bestCombo: nextBestCombo,
    totalRuns: currentSave.totalRuns + 1,
    totalVictories: currentSave.totalVictories + (record.outcome === 'victory' ? 1 : 0),
    totalBulletsGrazed: currentSave.totalBulletsGrazed + record.bulletsGrazed,
    selectedLoadoutId: currentSave.selectedLoadoutId,
    unlockedLoadoutIds: Array.from(unlockedSet),
    processedRunKeys: [...currentSave.processedRunKeys.slice(-49), record.runKey],
    recentRuns: [record, ...currentSave.recentRuns].slice(0, 10),
  };

  saveAegisData(updated);
  return updated;
}

export function selectLoadoutChassis(
  currentSave: AegisSaveDataV1,
  loadoutId: string
): AegisSaveDataV1 {
  // Allow selecting unlocked loadouts (or unlocking via loadout bay toggle for experimentation)
  const unlockedSet = new Set(currentSave.unlockedLoadoutIds);
  unlockedSet.add(loadoutId);
  const updated: AegisSaveDataV1 = {
    ...currentSave,
    selectedLoadoutId: loadoutId,
    unlockedLoadoutIds: Array.from(unlockedSet),
  };
  saveAegisData(updated);
  return updated;
}
