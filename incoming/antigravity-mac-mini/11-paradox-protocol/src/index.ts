import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract';
import { ParadoxAudioEngine } from './audio';
import { PARADOX_CONFIG } from './config';
import {
  cloneParadoxState,
  applyParadoxInput,
  createInitialParadoxState,
  ParadoxGameState,
  ParadoxInputAction,
  stepParadoxState,
} from './simulation';
import {
  loadParadoxSave,
  ParadoxCareerStats,
  saveParadoxState,
} from './persistence';
import { ParadoxUIController } from './ui';

export * from './config';
export * from './rng';
export * from './content';
export * from './simulation';
export * from './persistence';
export * from './audio';
export * from './ui';

export const metadata: ArgonGameMetadata = {
  id: PARADOX_CONFIG.GAME_ID,
  number: PARADOX_CONFIG.GAME_NUMBER,
  title: PARADOX_CONFIG.TITLE,
  subtitle: PARADOX_CONFIG.SUBTITLE,
  genre: 'Real-Time Philosophical Arena & Self-Cloning Thought-Experiment Thriller',
  primaryReference: 'The Talos Principle · The Evolution of Trust (Nicky Case)',
  supportingReference: 'Inscryption · Lichess Counterfactual Review · Super Hexagon',
  oneSentenceLoop:
    'Navigate 5 iconic philosophical thought-experiment arenas (Trolley Problem, Newcomb’s Vault, Ship of Theseus, Prisoner’s Dilemma, Laplace’s Demon) while an AI Oracle predicts your moves in real time and spawns an Act B Mirror Echo-Clone trained on the exact moral choices you just made!',
  shortGoal:
    'Survive all 5 Paradox Chambers, shatter Laplace-9’s prediction lock with Quantum Swerves, and discover which of the 4 Philosophical Verdicts your consciousness earns.',
  longGoal:
    'Unlock all 4 Philosophical Endings, audit your 5-Axis Soul Matrix against the 3 Counterfactual Archetypes on the same seed, and test whether you can conquer Chamber V with 100% Biological Humanity intact.',
  controlsSummary:
    'WASD / Arrows / Click-Drag: Move · [1/Q]: Intervene / Shield · [2/E]: Siphon / Defect · [3/Space]: Quantum Swerve · [Shift]: Chrono-Stasis',
  accentColor: PARADOX_CONFIG.ACCENT_COLOR,
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const savedEnvelope = loadParadoxSave();
  let career: ParadoxCareerStats = { ...savedEnvelope.career };

  const initialSeed = options?.initialSeed ?? PARADOX_CONFIG.DEFAULT_SEED;
  let state: ParadoxGameState =
    options?.initialSeed === undefined &&
    savedEnvelope.activeRun &&
    savedEnvelope.activeRun.status !== 'VICTORY' &&
    savedEnvelope.activeRun.status !== 'GAME_OVER'
      ? cloneParadoxState(savedEnvelope.activeRun)
      : createInitialParadoxState(initialSeed);

  const audio = new ParadoxAudioEngine();

  const handleAction = (action: ParadoxInputAction): void => {
    applyParadoxInput(state, action);
    if (state.events.length > 0) {
      ui.consumeEvents(state, state.events);
      state.events = [];
    }
    const env = saveParadoxState(career, state);
    career = env.career;
    ui.render(state, career, PARADOX_CONFIG.FIXED_STEP_MS);
  };

  const handleRestart = (newSeed?: number): void => {
    const seedToUse =
      typeof newSeed === 'number' ? newSeed : ((state.seed + 104729) >>> 0);
    state = createInitialParadoxState(seedToUse);
    ui.resetVisuals();
    const env = saveParadoxState(career, state);
    career = env.career;
    ui.render(state, career, PARADOX_CONFIG.FIXED_STEP_MS);
  };

  const handleToggleDebug = (force?: boolean): void => {
    const next = typeof force === 'boolean' ? force : !ui.isDebugVisible();
    ui.setDebugVisible(next);
  };

  const ui = new ParadoxUIController(
    container,
    audio,
    {
      onAction: handleAction,
      onRestart: handleRestart,
      onToggleDebug: () => handleToggleDebug(),
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
    accumulatorMs += rawDt;

    const prevStatus = state.status;
    const prevChamber = state.chamber;

    while (accumulatorMs >= PARADOX_CONFIG.FIXED_STEP_MS) {
      stepParadoxState(state, PARADOX_CONFIG.FIXED_STEP_MS);
      if (state.events.length > 0) {
        ui.consumeEvents(state, state.events);
        state.events = [];
      }
      accumulatorMs -= PARADOX_CONFIG.FIXED_STEP_MS;
    }

    if (
      state.status !== prevStatus ||
      state.chamber !== prevChamber ||
      state.score > career.highScore
    ) {
      const env = saveParadoxState(career, state);
      career = env.career;
    }

    ui.render(state, career, rawDt || PARADOX_CONFIG.FIXED_STEP_MS);
    rafId = window.requestAnimationFrame(loop);
  };

  ui.render(state, career, PARADOX_CONFIG.FIXED_STEP_MS);
  rafId = window.requestAnimationFrame(loop);

  return {
    destroy(): void {
      destroyed = true;
      window.cancelAnimationFrame(rafId);
      saveParadoxState(career, state);
      audio.destroy();
      ui.destroy();
    },
    getStateSnapshot(): ParadoxGameState {
      return cloneParadoxState(state);
    },
    restartWithSeed(seed: number): void {
      handleRestart(seed);
    },
    toggleDebug(force?: boolean): void {
      handleToggleDebug(force);
      ui.render(state, career, PARADOX_CONFIG.FIXED_STEP_MS);
    },
  };
}

const paradoxProtocolModule: ArgonGameModule = {
  metadata,
  mountGame,
};

export default paradoxProtocolModule;
