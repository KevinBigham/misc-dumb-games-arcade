import { CHRONO_CONFIG } from './config';
import { cloneChronoState, ChronoGameState } from './simulation';

export interface ChronoCareerStats {
  highScore: number;
  bestComboChain: number;
  highestSectorReached: number;
  totalVictories: number;
  totalEnemiesShattered: number;
  totalBankShots: number;
  totalParries: number;
  totalEchoesSpawned: number;
  discoveredRelics: string[];
  rewardedRunSeeds: string[];
}

export interface ChronoSaveEnvelope {
  version: number;
  career: ChronoCareerStats;
  activeRun: ChronoGameState | null;
}

export function createDefaultChronoCareer(): ChronoCareerStats {
  return {
    highScore: 0,
    bestComboChain: 0,
    highestSectorReached: 1,
    totalVictories: 0,
    totalEnemiesShattered: 0,
    totalBankShots: 0,
    totalParries: 0,
    totalEchoesSpawned: 0,
    discoveredRelics: [],
    rewardedRunSeeds: [],
  };
}

export function loadChronoSave(): ChronoSaveEnvelope {
  const defaultEnvelope: ChronoSaveEnvelope = {
    version: CHRONO_CONFIG.SAVE_VERSION,
    career: createDefaultChronoCareer(),
    activeRun: null,
  };

  if (typeof window === 'undefined' || !window.localStorage) {
    return defaultEnvelope;
  }

  try {
    const raw = window.localStorage.getItem(CHRONO_CONFIG.SAVE_KEY);
    if (!raw) return defaultEnvelope;
    const parsed = JSON.parse(raw) as Partial<ChronoSaveEnvelope>;
    if (!parsed || parsed.version !== CHRONO_CONFIG.SAVE_VERSION || !parsed.career) {
      return defaultEnvelope;
    }
    return {
      version: CHRONO_CONFIG.SAVE_VERSION,
      career: {
        ...createDefaultChronoCareer(),
        ...parsed.career,
        discoveredRelics: Array.isArray(parsed.career.discoveredRelics)
          ? [...parsed.career.discoveredRelics]
          : [],
        rewardedRunSeeds: Array.isArray(parsed.career.rewardedRunSeeds)
          ? [...parsed.career.rewardedRunSeeds]
          : [],
      },
      activeRun: parsed.activeRun ? cloneChronoState(parsed.activeRun) : null,
    };
  } catch {
    return defaultEnvelope;
  }
}

export function saveChronoState(
  career: ChronoCareerStats,
  state: ChronoGameState | null
): ChronoSaveEnvelope {
  const updated: ChronoCareerStats = {
    ...career,
    discoveredRelics: [...career.discoveredRelics],
    rewardedRunSeeds: [...career.rewardedRunSeeds],
  };

  if (state) {
    if (state.score > updated.highScore) {
      updated.highScore = state.score;
    }
    if (state.bestComboChain > updated.bestComboChain) {
      updated.bestComboChain = state.bestComboChain;
    }
    if (state.sector > updated.highestSectorReached) {
      updated.highestSectorReached = state.sector;
    }
    for (const rId of state.relicIds) {
      if (!updated.discoveredRelics.includes(rId)) {
        updated.discoveredRelics.push(rId);
      }
    }

    const runKey = `${state.seed}:${Math.round(state.elapsedMs)}`;
    if (
      (state.status === 'VICTORY' || state.status === 'GAME_OVER') &&
      !updated.rewardedRunSeeds.includes(runKey)
    ) {
      updated.rewardedRunSeeds.push(runKey);
      if (updated.rewardedRunSeeds.length > 50) {
        updated.rewardedRunSeeds.shift();
      }
      if (state.status === 'VICTORY') {
        updated.totalVictories += 1;
      }
      updated.totalEnemiesShattered += state.totalKills;
      updated.totalBankShots += state.ledger.totalBankShots;
      updated.totalParries += state.ledger.totalParries;
      updated.totalEchoesSpawned += state.ledger.totalEchoesSpawned;
    }
  }

  const envelope: ChronoSaveEnvelope = {
    version: CHRONO_CONFIG.SAVE_VERSION,
    career: updated,
    activeRun:
      state && state.status !== 'VICTORY' && state.status !== 'GAME_OVER'
        ? cloneChronoState(state)
        : null,
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(CHRONO_CONFIG.SAVE_KEY, JSON.stringify(envelope));
    } catch {
      // Ignore quota errors in restricted sandboxes
    }
  }

  return envelope;
}
