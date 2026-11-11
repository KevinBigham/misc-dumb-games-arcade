import { AstralRelicId } from './content';
import { AstralGameState, cloneAstralState } from './simulation';

export const ASTRAL_SAVE_KEY = 'argon_game12_astral_pinball_v1';

export interface AstralCareerStats {
  version: 1;
  highScore: number;
  bestVolleyScore: number;
  maxSectorReached: number;
  totalSectorsCleared: number;
  totalRunsCompleted: number;
  totalVictories: number;
  totalSplits: number;
  totalPerfectParries: number;
  unlockedRelics: AstralRelicId[];
  completedRunIds: string[];
}

export interface AstralSaveEnvelope {
  version: 1;
  career: AstralCareerStats;
  activeRun: AstralGameState | null;
}

export function createDefaultAstralCareer(): AstralCareerStats {
  return {
    version: 1,
    highScore: 0,
    bestVolleyScore: 0,
    maxSectorReached: 1,
    totalSectorsCleared: 0,
    totalRunsCompleted: 0,
    totalVictories: 0,
    totalSplits: 0,
    totalPerfectParries: 0,
    unlockedRelics: ['NEWTON_THIRD_LAW'],
    completedRunIds: [],
  };
}

export function loadAstralSave(): AstralSaveEnvelope {
  try {
    if (typeof localStorage === 'undefined') {
      return { version: 1, career: createDefaultAstralCareer(), activeRun: null };
    }
    const raw = localStorage.getItem(ASTRAL_SAVE_KEY);
    if (!raw) {
      return { version: 1, career: createDefaultAstralCareer(), activeRun: null };
    }
    const parsed = JSON.parse(raw) as Partial<AstralSaveEnvelope>;
    if (!parsed || parsed.version !== 1 || !parsed.career) {
      return { version: 1, career: createDefaultAstralCareer(), activeRun: null };
    }
    const career: AstralCareerStats = {
      ...createDefaultAstralCareer(),
      ...parsed.career,
      unlockedRelics: Array.isArray(parsed.career.unlockedRelics)
        ? parsed.career.unlockedRelics
        : ['NEWTON_THIRD_LAW'],
      completedRunIds: Array.isArray(parsed.career.completedRunIds)
        ? parsed.career.completedRunIds.slice(-30)
        : [],
    };
    return {
      version: 1,
      career,
      activeRun: parsed.activeRun ? cloneAstralState(parsed.activeRun) : null,
    };
  } catch {
    return { version: 1, career: createDefaultAstralCareer(), activeRun: null };
  }
}

export function saveAstralState(
  careerInput: AstralCareerStats,
  state: AstralGameState
): AstralSaveEnvelope {
  const career: AstralCareerStats = {
    ...careerInput,
    highScore: Math.max(careerInput.highScore, state.totalScore),
    bestVolleyScore: Math.max(careerInput.bestVolleyScore, state.bestVolleyScore),
    maxSectorReached: Math.max(careerInput.maxSectorReached, state.sector),
    unlockedRelics: Array.from(new Set([...careerInput.unlockedRelics, ...state.relics])),
    completedRunIds: [...careerInput.completedRunIds],
  };

  const isTerminal = state.status === 'VICTORY' || state.status === 'GAME_OVER';
  if (isTerminal && !career.completedRunIds.includes(state.runId)) {
    career.completedRunIds.push(state.runId);
    if (career.completedRunIds.length > 30) {
      career.completedRunIds.shift();
    }
    career.totalRunsCompleted += 1;
    if (state.status === 'VICTORY') {
      career.totalVictories += 1;
      career.totalSectorsCleared += 5;
    } else {
      career.totalSectorsCleared += Math.max(0, state.sector - 1);
    }
    career.totalSplits += state.totalSplitsTriggered;
    career.totalPerfectParries += state.totalPerfectParries;
  }

  const envelope: AstralSaveEnvelope = {
    version: 1,
    career,
    activeRun: cloneAstralState(state),
  };

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ASTRAL_SAVE_KEY, JSON.stringify(envelope));
    }
  } catch {
    // Ignore storage quota errors
  }

  return envelope;
}
