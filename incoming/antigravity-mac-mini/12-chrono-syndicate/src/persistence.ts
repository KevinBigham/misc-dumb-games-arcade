import { CHRONO_CONFIG } from './config';
import { SyndicateRankDef } from './content';
import { cloneChronoState, ChronoGameState } from './simulation';

export interface ChronoCareerStats {
  heistsCompleted: number;
  highScore: number;
  totalVaultsCracked: number;
  totalEchoesDeployed: number;
  discoveredRanks: Array<SyndicateRankDef['id']>;
  processedRunKeys: string[];
}

export interface ChronoSaveEnvelope {
  schemaVersion: number;
  career: ChronoCareerStats;
  activeRun: ChronoGameState | null;
}

export function createDefaultChronoCareer(): ChronoCareerStats {
  return {
    heistsCompleted: 0,
    highScore: 0,
    totalVaultsCracked: 0,
    totalEchoesDeployed: 0,
    discoveredRanks: [],
    processedRunKeys: [],
  };
}

export function loadChronoSave(): ChronoSaveEnvelope {
  const fallback: ChronoSaveEnvelope = {
    schemaVersion: CHRONO_CONFIG.SCHEMA_VERSION,
    career: createDefaultChronoCareer(),
    activeRun: null,
  };

  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(CHRONO_CONFIG.STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<ChronoSaveEnvelope>;
    if (!parsed || parsed.schemaVersion !== CHRONO_CONFIG.SCHEMA_VERSION || !parsed.career) {
      return fallback;
    }

    return {
      schemaVersion: CHRONO_CONFIG.SCHEMA_VERSION,
      career: {
        heistsCompleted: Number(parsed.career.heistsCompleted) || 0,
        highScore: Number(parsed.career.highScore) || 0,
        totalVaultsCracked: Number(parsed.career.totalVaultsCracked) || 0,
        totalEchoesDeployed: Number(parsed.career.totalEchoesDeployed) || 0,
        discoveredRanks: Array.isArray(parsed.career.discoveredRanks)
          ? parsed.career.discoveredRanks
          : [],
        processedRunKeys: Array.isArray(parsed.career.processedRunKeys)
          ? parsed.career.processedRunKeys
          : [],
      },
      activeRun: parsed.activeRun ? cloneChronoState(parsed.activeRun) : null,
    };
  } catch {
    return fallback;
  }
}

export function saveChronoState(
  career: ChronoCareerStats,
  activeRun: ChronoGameState | null
): ChronoSaveEnvelope {
  const updatedCareer: ChronoCareerStats = {
    ...career,
    discoveredRanks: [...career.discoveredRanks],
    processedRunKeys: [...career.processedRunKeys],
  };

  if (activeRun) {
    updatedCareer.highScore = Math.max(updatedCareer.highScore, activeRun.score);

    if (
      (activeRun.status === 'VICTORY' || activeRun.status === 'GAME_OVER') &&
      activeRun.finalRankId
    ) {
      const runKey = `${activeRun.seed}-${activeRun.totalTicksElapsed}-${activeRun.finalRankId}`;
      if (!updatedCareer.processedRunKeys.includes(runKey)) {
        updatedCareer.processedRunKeys.push(runKey);
        if (activeRun.status === 'VICTORY') {
          updatedCareer.heistsCompleted += 1;
        }
        updatedCareer.totalVaultsCracked += activeRun.stageSummaries.length;
        updatedCareer.totalEchoesDeployed += activeRun.stageSummaries.reduce(
          (acc, s) => acc + s.echoesUsed,
          0
        );
        if (!updatedCareer.discoveredRanks.includes(activeRun.finalRankId)) {
          updatedCareer.discoveredRanks.push(activeRun.finalRankId);
        }
      }
    }
  }

  const envelope: ChronoSaveEnvelope = {
    schemaVersion: CHRONO_CONFIG.SCHEMA_VERSION,
    career: updatedCareer,
    activeRun: activeRun ? cloneChronoState(activeRun) : null,
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(CHRONO_CONFIG.STORAGE_KEY, JSON.stringify(envelope));
    } catch {
      // Ignore storage quota errors
    }
  }

  return envelope;
}
