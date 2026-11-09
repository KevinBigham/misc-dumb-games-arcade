import type { ChassisId } from './content';
import type { ComboGrade } from './config';

export interface HypernovaCareerStats {
  version: number;
  highScore: number;
  highestWave: number;
  totalKills: number;
  totalGrazes: number;
  bossesDefeated: number;
  highestComboGrade: ComboGrade;
  unlockedChassis: ChassisId[];
  runsPlayed: number;
  runsWon: number;
  lastPlayedTimestamp: number;
}

export interface HypernovaSaveEnvelope {
  career: HypernovaCareerStats;
  lastActiveSeed?: number;
}

const STORAGE_KEY = 'hypernova_chronovalkyrie_save_v1';

export function getDefaultCareerStats(): HypernovaCareerStats {
  return {
    version: 1,
    highScore: 0,
    highestWave: 1,
    totalKills: 0,
    totalGrazes: 0,
    bossesDefeated: 0,
    highestComboGrade: 'D',
    unlockedChassis: ['interceptor', 'colossus', 'phantom'],
    runsPlayed: 0,
    runsWon: 0,
    lastPlayedTimestamp: Date.now(),
  };
}

export function loadHypernovaSave(): HypernovaSaveEnvelope {
  try {
    if (typeof localStorage === 'undefined') {
      return { career: getDefaultCareerStats() };
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { career: getDefaultCareerStats() };
    }
    const parsed = JSON.parse(raw) as Partial<HypernovaSaveEnvelope>;
    const defaultCareer = getDefaultCareerStats();
    return {
      career: {
        ...defaultCareer,
        ...(parsed.career || {}),
        unlockedChassis: parsed.career?.unlockedChassis?.length
          ? parsed.career.unlockedChassis
          : defaultCareer.unlockedChassis,
      },
      lastActiveSeed: parsed.lastActiveSeed,
    };
  } catch {
    return { career: getDefaultCareerStats() };
  }
}

export function saveHypernovaCareer(career: HypernovaCareerStats, lastActiveSeed?: number): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const envelope: HypernovaSaveEnvelope = {
      career: { ...career, lastPlayedTimestamp: Date.now() },
      lastActiveSeed,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // LocalStorage quota or access denied
  }
}

export function recordRunEnd(
  career: HypernovaCareerStats,
  runScore: number,
  waveReached: number,
  kills: number,
  grazes: number,
  bossesKilled: number,
  peakCombo: ComboGrade,
  isVictory: boolean
): HypernovaCareerStats {
  const updated: HypernovaCareerStats = { ...career };
  updated.runsPlayed++;
  if (isVictory) updated.runsWon++;
  if (runScore > updated.highScore) updated.highScore = runScore;
  if (waveReached > updated.highestWave) updated.highestWave = waveReached;
  updated.totalKills += kills;
  updated.totalGrazes += grazes;
  updated.bossesDefeated += bossesKilled;

  const order = ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'APEX'];
  if (order.indexOf(peakCombo) > order.indexOf(updated.highestComboGrade)) {
    updated.highestComboGrade = peakCombo;
  }

  saveHypernovaCareer(updated);
  return updated;
}
