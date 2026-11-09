import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract';
import { ChronoAudioEngine } from './audio';
import { CHRONO_CONFIG } from './config';
import {
  ChronoCareerStats,
  loadChronoSave,
  saveChronoState,
} from './persistence';
import {
  applyChronoInput,
  ChronoGameState,
  ChronoInputAction,
  cloneChronoState,
  createInitialChronoState,
  stepChronoState,
} from './simulation';
import { ChronoUIController } from './ui';

export * from './config';
export * from './rng';
export * from './content';
export * from './simulation';
export * from './persistence';
export * from './audio';
export * from './ui';

export const metadata: ArgonGameMetadata = {
  id: CHRONO_CONFIG.GAME_ID,
  number: CHRONO_CONFIG.GAME_NUMBER,
  title: CHRONO_CONFIG.TITLE,
  subtitle: CHRONO_CONFIG.SUBTITLE,
  genre: '4D Cooperative Time-Loop Tactical Heist & Ghost-Echo Orchestrator',
  primaryReference: 'Lemnis Gate · Quantum Conundrum · Braid',
  supportingReference: 'Heat Signature · Monaco: What’s Yours Is Mine · Katana ZERO',
  oneSentenceLoop:
    'Infiltrate high-security Quantum Vaults in 15-second time loops where every move, EMP blast, and Holo-Decoy you deploy is recorded—then rewind to T=0.0s so your autonomous Ghost Echoes hold open laser gates, decrypt dual terminals, and stun sentinels alongside your present self!',
  shortGoal:
    'Crack all 4 Panopticon Vault Sectors by choreographing up to 4 simultaneous Ghost Echoes of yourself within the same 15-second timeline.',
  longGoal:
    'Earn the Omniscient 4D Architect rank by clearing every sector at or below Par Echo count, unlocking all 4 Syndicate Ranks, and mastering the 4D Timeline Scrubber.',
  controlsSummary:
    'WASD / Arrows / Click-Drag: Move · [R]: Commit Loop & Rewind to T=0.0s · [1/Q]: EMP Pulse · [2/E]: Holo-Decoy · [3/Space]: Phase-Blink · [Z]: Undo Last Echo',
  accentColor: CHRONO_CONFIG.ACCENT_COLOR,
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const savedEnvelope = loadChronoSave();
  let career: ChronoCareerStats = {
    ...savedEnvelope.career,
    discoveredRanks: [...savedEnvelope.career.discoveredRanks],
    processedRunKeys: [...savedEnvelope.career.processedRunKeys],
  };

  const initialSeed = options?.initialSeed ?? CHRONO_CONFIG.DEFAULT_SEED;
  let state: ChronoGameState =
    options?.initialSeed === undefined &&
    savedEnvelope.activeRun &&
    savedEnvelope.activeRun.status !== 'VICTORY' &&
    savedEnvelope.activeRun.status !== 'GAME_OVER'
      ? cloneChronoState(savedEnvelope.activeRun)
      : createInitialChronoState(initialSeed);

  const audio = new ChronoAudioEngine();
  let visibilityPaused = false;

  const handleAction = (action: ChronoInputAction): void => {
    applyChronoInput(state, action);
    if (state.events.length > 0) {
      ui.consumeEvents(state, state.events);
      state.events = [];
    }
    const env = saveChronoState(career, state);
    career = env.career;
    ui.render(state, career, CHRONO_CONFIG.FIXED_STEP_MS);
  };

  const handleRestart = (newSeed?: number): void => {
    const seedToUse =
      typeof newSeed === 'number' ? newSeed : ((state.seed + 104729) >>> 0);
    state = createInitialChronoState(seedToUse);
    ui.resetVisuals();
    const env = saveChronoState(career, state);
    career = env.career;
    ui.render(state, career, CHRONO_CONFIG.FIXED_STEP_MS);
  };

  const handleToggleDebug = (force?: boolean): void => {
    const next = typeof force === 'boolean' ? force : !ui.isDebugVisible();
    ui.setDebugVisible(next);
  };

  const ui = new ChronoUIController(
    container,
    audio,
    {
      onAction: handleAction,
      onRestart: handleRestart,
      onToggleDebug: () => handleToggleDebug(),
      onVisibilityPausedChange: (paused: boolean) => {
        visibilityPaused = paused;
      },
    },
    Boolean(options?.debug)
  );

  let rafId = 0;
  let lastTimeMs = performance.now();
  let accumulatorMs = 0;
  let destroyed = false;

  const loop = (nowMs: number): void => {
    if (destroyed) return;
    const rawDt = Math.min(100, Math.max(0, nowMs - lastTimeMs));
    lastTimeMs = nowMs;

    if (!visibilityPaused) {
      accumulatorMs += rawDt;
      const prevStatus = state.status;
      const prevStage = state.stageNumber;

      while (accumulatorMs >= CHRONO_CONFIG.FIXED_STEP_MS) {
        stepChronoState(state, CHRONO_CONFIG.FIXED_STEP_MS);
        if (state.events.length > 0) {
          ui.consumeEvents(state, state.events);
          state.events = [];
        }
        accumulatorMs -= CHRONO_CONFIG.FIXED_STEP_MS;
      }

      if (
        state.status !== prevStatus ||
        state.stageNumber !== prevStage ||
        state.score > career.highScore
      ) {
        const env = saveChronoState(career, state);
        career = env.career;
      }

      ui.render(state, career, rawDt || CHRONO_CONFIG.FIXED_STEP_MS);
    }

    rafId = window.requestAnimationFrame(loop);
  };

  ui.render(state, career, CHRONO_CONFIG.FIXED_STEP_MS);
  rafId = window.requestAnimationFrame(loop);

  return {
    destroy(): void {
      destroyed = true;
      window.cancelAnimationFrame(rafId);
      saveChronoState(career, state);
      audio.destroy();
      ui.destroy();
    },
    getStateSnapshot(): ChronoGameState {
      return cloneChronoState(state);
    },
    restartWithSeed(seed: number): void {
      handleRestart(seed);
    },
    toggleDebug(force?: boolean): void {
      handleToggleDebug(force);
      ui.render(state, career, CHRONO_CONFIG.FIXED_STEP_MS);
    },
  };
}

const chronoSyndicateModule: ArgonGameModule = {
  metadata,
  mountGame,
};

export default chronoSyndicateModule;
