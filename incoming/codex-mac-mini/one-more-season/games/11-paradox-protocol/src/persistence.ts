import { PARADOX_CONFIG } from './config';
import { EndingVerdictDef } from './content';
import { cloneParadoxState, ParadoxGameState } from './simulation';

export interface ParadoxCareerStats {
  gamesPlayed: number;
  highScore: number;
  totalPodsSaved: number;
  totalPredictionsBroken: number;
  discoveredEndings: Array<EndingVerdictDef['id']>;
  processedRunKeys: string[];
}

export interface ParadoxSaveEnvelope {
  schemaVersion: number;
  career: ParadoxCareerStats;
  activeRun: ParadoxGameState | null;
}

export function createDefaultCareerStats(): ParadoxCareerStats {
  return {
    gamesPlayed: 0,
    highScore: 0,
    totalPodsSaved: 0,
    totalPredictionsBroken: 0,
    discoveredEndings: [],
    processedRunKeys: [],
  };
}

export function loadParadoxSave(): ParadoxSaveEnvelope {
  const fallback: ParadoxSaveEnvelope = {
    schemaVersion: PARADOX_CONFIG.SCHEMA_VERSION,
    career: createDefaultCareerStats(),
    activeRun: null,
  };

  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(PARADOX_CONFIG.STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<ParadoxSaveEnvelope>;
    if (!parsed || parsed.schemaVersion !== PARADOX_CONFIG.SCHEMA_VERSION || !parsed.career) {
      return fallback;
    }

    return {
      schemaVersion: PARADOX_CONFIG.SCHEMA_VERSION,
      career: {
        gamesPlayed: Number(parsed.career.gamesPlayed) || 0,
        highScore: Number(parsed.career.highScore) || 0,
        totalPodsSaved: Number(parsed.career.totalPodsSaved) || 0,
        totalPredictionsBroken: Number(parsed.career.totalPredictionsBroken) || 0,
        discoveredEndings: Array.isArray(parsed.career.discoveredEndings)
          ? parsed.career.discoveredEndings
          : [],
        processedRunKeys: Array.isArray(parsed.career.processedRunKeys)
          ? parsed.career.processedRunKeys
          : [],
      },
      activeRun: parsed.activeRun ? cloneParadoxState(parsed.activeRun) : null,
    };
  } catch {
    return fallback;
  }
}

export function saveParadoxState(
  career: ParadoxCareerStats,
  activeRun: ParadoxGameState | null
): ParadoxSaveEnvelope {
  const updatedCareer: ParadoxCareerStats = {
    ...career,
    discoveredEndings: [...career.discoveredEndings],
    processedRunKeys: [...career.processedRunKeys],
  };

  if (activeRun) {
    updatedCareer.highScore = Math.max(updatedCareer.highScore, activeRun.score);

    // Idempotent run completion reward tracking (anti-double-reward on reload)
    if (activeRun.status === 'VICTORY' && activeRun.endingVerdictId) {
      const runKey = `${activeRun.seed}-${activeRun.totalElapsedMs}-${activeRun.endingVerdictId}`;
      if (!updatedCareer.processedRunKeys.includes(runKey)) {
        updatedCareer.processedRunKeys.push(runKey);
        updatedCareer.gamesPlayed += 1;
        updatedCareer.totalPodsSaved += activeRun.podsSavedTotal;
        updatedCareer.totalPredictionsBroken += activeRun.oracle.predictionsBroken;
        if (!updatedCareer.discoveredEndings.includes(activeRun.endingVerdictId)) {
          updatedCareer.discoveredEndings.push(activeRun.endingVerdictId);
        }
      }
    }
  }

  const envelope: ParadoxSaveEnvelope = {
    schemaVersion: PARADOX_CONFIG.SCHEMA_VERSION,
    career: updatedCareer,
    activeRun: activeRun ? cloneParadoxState(activeRun) : null,
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(PARADOX_CONFIG.STORAGE_KEY, JSON.stringify(envelope));
    } catch {
      // Ignore quota errors
    }
  }

  return envelope;
}
