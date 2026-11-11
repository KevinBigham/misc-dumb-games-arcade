import { HORIZON_CONFIG } from './config';
import { AstroRelicId } from './content';
import { cloneHorizonState, HorizonGameState } from './simulation';

export interface HorizonCareerStats {
  highScore: number;
  bestLorentzGamma: number;
  runsPlayed: number;
  odysseyVictories: number;
  dojoCompletions: number;
  totalPolygonsEnclosed: number;
  totalEnemiesVaporized: number;
  relicsUnlocked: AstroRelicId[];
  verdictsUnlocked: string[];
  completedRunKeys: string[];
}

export interface HorizonSaveEnvelope {
  version: number;
  career: HorizonCareerStats;
  activeRun: HorizonGameState | null;
}

export function createDefaultHorizonCareer(): HorizonCareerStats {
  return {
    highScore: 0,
    bestLorentzGamma: 1.0,
    runsPlayed: 0,
    odysseyVictories: 0,
    dojoCompletions: 0,
    totalPolygonsEnclosed: 0,
    totalEnemiesVaporized: 0,
    relicsUnlocked: [],
    verdictsUnlocked: [],
    completedRunKeys: [],
  };
}

export function loadHorizonSave(storage: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null): HorizonSaveEnvelope {
  const defaultEnvelope: HorizonSaveEnvelope = {
    version: HORIZON_CONFIG.SAVE_VERSION,
    career: createDefaultHorizonCareer(),
    activeRun: null,
  };

  if (!storage) return defaultEnvelope;

  try {
    const raw = storage.getItem(HORIZON_CONFIG.SAVE_KEY);
    if (!raw) return defaultEnvelope;
    const parsed = JSON.parse(raw) as Partial<HorizonSaveEnvelope>;
    if (!parsed || parsed.version !== HORIZON_CONFIG.SAVE_VERSION || !parsed.career) {
      return defaultEnvelope;
    }

    const c = parsed.career;
    return {
      version: HORIZON_CONFIG.SAVE_VERSION,
      career: {
        highScore: Number.isFinite(c.highScore) ? c.highScore : 0,
        bestLorentzGamma: Number.isFinite(c.bestLorentzGamma) ? c.bestLorentzGamma : 1.0,
        runsPlayed: Number.isFinite(c.runsPlayed) ? c.runsPlayed : 0,
        odysseyVictories: Number.isFinite(c.odysseyVictories) ? c.odysseyVictories : 0,
        dojoCompletions: Number.isFinite(c.dojoCompletions) ? c.dojoCompletions : 0,
        totalPolygonsEnclosed: Number.isFinite(c.totalPolygonsEnclosed) ? c.totalPolygonsEnclosed : 0,
        totalEnemiesVaporized: Number.isFinite(c.totalEnemiesVaporized) ? c.totalEnemiesVaporized : 0,
        relicsUnlocked: Array.isArray(c.relicsUnlocked) ? [...c.relicsUnlocked] : [],
        verdictsUnlocked: Array.isArray(c.verdictsUnlocked) ? [...c.verdictsUnlocked] : [],
        completedRunKeys: Array.isArray(c.completedRunKeys) ? [...c.completedRunKeys] : [],
      },
      activeRun:
        parsed.activeRun &&
        typeof parsed.activeRun.seed === 'number' &&
        parsed.activeRun.ship &&
        Array.isArray(parsed.activeRun.wells)
          ? cloneHorizonState(parsed.activeRun)
          : null,
    };
  } catch {
    return defaultEnvelope;
  }
}

export function saveHorizonState(
  career: HorizonCareerStats,
  state: HorizonGameState | null,
  storage: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null
): HorizonSaveEnvelope {
  const updatedCareer: HorizonCareerStats = {
    ...career,
    relicsUnlocked: [...career.relicsUnlocked],
    verdictsUnlocked: [...career.verdictsUnlocked],
    completedRunKeys: [...career.completedRunKeys],
  };

  if (state) {
    updatedCareer.highScore = Math.max(updatedCareer.highScore, state.score);
    updatedCareer.bestLorentzGamma = Math.max(
      updatedCareer.bestLorentzGamma,
      state.ship.peakLorentzGamma
    );

    for (const relicId of state.relics) {
      if (!updatedCareer.relicsUnlocked.includes(relicId)) {
        updatedCareer.relicsUnlocked.push(relicId);
      }
    }

    if (state.status === 'VICTORY' || state.status === 'GAME_OVER') {
      const runKey = `${state.seed}:${state.mode}:${state.tick}:${state.status}`;
      if (!updatedCareer.completedRunKeys.includes(runKey)) {
        updatedCareer.completedRunKeys.push(runKey);
        if (updatedCareer.completedRunKeys.length > 60) {
          updatedCareer.completedRunKeys.shift();
        }
        updatedCareer.runsPlayed += 1;
        updatedCareer.totalPolygonsEnclosed += state.stats.polygonsEnclosed;
        updatedCareer.totalEnemiesVaporized += state.stats.enemiesVaporized;

        if (state.status === 'VICTORY') {
          if (state.mode === 'ODYSSEY') updatedCareer.odysseyVictories += 1;
          if (state.mode === 'TRICKSHOT_DOJO') updatedCareer.dojoCompletions += 1;
        }
        if (state.verdictId && !updatedCareer.verdictsUnlocked.includes(state.verdictId)) {
          updatedCareer.verdictsUnlocked.push(state.verdictId);
        }
      }
    }
  }

  const envelope: HorizonSaveEnvelope = {
    version: HORIZON_CONFIG.SAVE_VERSION,
    career: updatedCareer,
    activeRun:
      state && state.status !== 'VICTORY' && state.status !== 'GAME_OVER'
        ? cloneHorizonState(state)
        : null,
  };

  if (storage) {
    try {
      storage.setItem(HORIZON_CONFIG.SAVE_KEY, JSON.stringify(envelope));
    } catch {
      // Ignore storage quota errors
    }
  }

  return envelope;
}
