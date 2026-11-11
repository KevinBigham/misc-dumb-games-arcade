import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract';
import { DeliAudioEngine } from './audio';
import { CONFIG } from './config';
import {
  cloneDeliState,
  DeliCareerStats,
  loadDeliSave,
  saveDeliState,
} from './persistence';
import {
  applyInput,
  createInitialState,
  DeliGameState,
  DeliInputAction,
  stepDeliState,
} from './simulation';
import { DeliUIController } from './ui';

export * from './config';
export * from './rng';
export * from './content';
export * from './simulation';
export * from './persistence';
export * from './audio';
export * from './ui';

export const metadata: ArgonGameMetadata = {
  id: '11-metaphysical-deli',
  number: 11,
  title: 'The Metaphysical Deli',
  subtitle: 'Non-Euclidean Soup Cauldron & Forbidden Hybrid Alchemy',
  genre: 'Surreal Physics-Action Culinary Fever Dream',
  primaryReference: 'Jazzpunk / Hylics / WarioWare',
  supportingReference: 'Overcooked · Fruit Ninja · SpaceChem',
  oneSentenceLoop:
    'Pilot The Third Hand across a warping 4th-dimensional delicatessen to grab, laser-bisect, high-velocity splice, and boil sentient baby teeth, melting pocketwatches, and bebop lobsters into the Primordial Broth Vortex to appease 3 multi-eyed subconscious entities before Reality Decrees invert gravity!',
  shortGoal:
    'Satisfy 12 Surreal Entities across shifting Ministry of Ontology Reality Decrees and survive the Grand Comptroller Audit to earn your Transcendental Culinary License.',
  longGoal:
    'Discover all 7 Forbidden Hybrid Delicacies (including the 5th-Dimensional Monolith Meatball), chain x8 Digestion Combos, and master Fever Tier 35.',
  controlsSummary:
    'Mouse / WASD: Move Third Hand · Click / Space: Grab & Fling · D: Boil in Vortex · S: Laser Bisect · E: Splice Hybrid · Q: Paradox Freeze · Z/X/C or Enter: Serve Booth · 1–4: Vending Machine',
  accentColor: '#f472b6',
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const savedEnvelope = loadDeliSave();
  let career: DeliCareerStats = {
    ...savedEnvelope.career,
    hybridsDiscovered: [...savedEnvelope.career.hybridsDiscovered],
  };

  const initialSeed = options?.initialSeed ?? CONFIG.DEFAULT_SEED;
  let state: DeliGameState =
    options?.initialSeed === undefined &&
    savedEnvelope.activeRun &&
    savedEnvelope.activeRun.status !== 'GAME_OVER'
      ? cloneDeliState(savedEnvelope.activeRun)
      : createInitialState(initialSeed);

  const audio = new DeliAudioEngine();

  const handleAction = (action: DeliInputAction): void => {
    applyInput(state, action);
    if (state.events.length > 0) {
      ui.consumeEvents(state, state.events);
      state.events = [];
    }
    if (state.status === 'PAUSED' || action.type === 'SERVE_BOOTH') {
      const env = saveDeliState(career, state);
      career = env.career;
    }
  };

  const handleRestart = (newSeed?: number): void => {
    const seedToUse =
      typeof newSeed === 'number'
        ? newSeed
        : (state.seed + 104729) >>> 0;
    career.gamesPlayed += 1;
    state = createInitialState(seedToUse);
    ui.resetVisuals();
    const env = saveDeliState(career, state);
    career = env.career;
  };

  const handleToggleDebug = (force?: boolean): void => {
    const next = typeof force === 'boolean' ? force : !ui.isDebugVisible();
    ui.setDebugVisible(next);
  };

  const ui = new DeliUIController(
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

    const prevTier = state.feverTier;
    const prevStatus = state.status;

    while (accumulatorMs >= CONFIG.FIXED_STEP_MS) {
      stepDeliState(state, CONFIG.FIXED_STEP_MS);
      if (state.events.length > 0) {
        ui.consumeEvents(state, state.events);
        state.events = [];
      }
      accumulatorMs -= CONFIG.FIXED_STEP_MS;
    }

    if (
      state.feverTier !== prevTier ||
      state.status !== prevStatus ||
      state.score > career.highScore
    ) {
      const env = saveDeliState(
        career,
        state.status === 'GAME_OVER' ? null : state
      );
      career = env.career;
    }

    ui.render(state, career, rawDt || CONFIG.FIXED_STEP_MS);
    rafId = window.requestAnimationFrame(loop);
  };

  ui.render(state, career, CONFIG.FIXED_STEP_MS);
  rafId = window.requestAnimationFrame(loop);

  return {
    destroy(): void {
      destroyed = true;
      window.cancelAnimationFrame(rafId);
      saveDeliState(career, state.status === 'GAME_OVER' ? null : state);
      audio.destroy();
      ui.destroy();
    },
    getStateSnapshot(): DeliGameState {
      return cloneDeliState(state);
    },
    restartWithSeed(seed: number): void {
      handleRestart(seed);
      ui.render(state, career, CONFIG.FIXED_STEP_MS);
    },
    toggleDebug(force?: boolean): void {
      handleToggleDebug(force);
      ui.render(state, career, CONFIG.FIXED_STEP_MS);
    },
  };
}

const metaphysicalDeliModule: ArgonGameModule = {
  metadata,
  mountGame,
};

export default metaphysicalDeliModule;
