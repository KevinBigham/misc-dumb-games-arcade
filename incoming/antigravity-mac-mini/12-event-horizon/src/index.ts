import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract';
import { HorizonAudioEngine } from './audio';
import { HORIZON_CONFIG } from './config';
import {
  HorizonCareerStats,
  loadHorizonSave,
  saveHorizonState,
} from './persistence';
import {
  applyHorizonInput,
  cloneHorizonState,
  createInitialHorizonState,
  HorizonGameState,
  HorizonInputAction,
  stepHorizonState,
} from './simulation';
import { HorizonUIController } from './ui';

export * from './config';
export * from './rng';
export * from './content';
export * from './simulation';
export * from './persistence';
export * from './audio';
export * from './ui';

export const metadata: ArgonGameMetadata = {
  id: HORIZON_CONFIG.GAME_ID,
  number: HORIZON_CONFIG.GAME_NUMBER,
  title: HORIZON_CONFIG.TITLE,
  subtitle: HORIZON_CONFIG.SUBTITLE,
  genre: 'Kinetic Gravity-Pinball Action Roguelite & Trickshot Puzzle Sandbox',
  primaryReference: 'Outer Wilds (Orbital Gravity) · Peggle / Pinball · Balatro',
  supportingReference: 'Superhot (Bullet-Time Aim) · Geometry Wars · Katana ZERO',
  oneSentenceLoop:
    'Dilate time to aim a relativistic orbital trajectory around a live Singularity, slingshot your Star-Breaker ship across musical Prism Bumpers to enclose laser Constellation Polygons that vaporize Void Armadas, rewind your own spacetime worldline to spawn a twin Phantom Echo, and draft multiplicative Astro-Relics across 5 cosmic sectors!',
  shortGoal:
    'Conquer all 5 Cosmic Sectors and shatter KARDASHEV-IX in Odyssey Mode, or solve all 5 Constellation Trickshot Dojo puzzles within the 1-Launch Par.',
  longGoal:
    'Unlock all 12 Synergistic Astro-Relics, master all 3 Ship Hulls, sustain Lorentz γ ≥ 6.0x, and compare your trajectory against the 3 Counterfactual AI Archetypes.',
  controlsSummary:
    'Click-Drag: Bullet-Time Aim & Slingshot · [Space]: Launch · [C]: AI Trickshot Coach · [Q]: Quantum Tether · [E]: Supernova · [R]: Chrono-Rewind + Echo · WASD/Arrows: Thrust',
  accentColor: HORIZON_CONFIG.ACCENT_COLOR,
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const savedEnvelope = loadHorizonSave();
  let career: HorizonCareerStats = {
    ...savedEnvelope.career,
    relicsUnlocked: [...savedEnvelope.career.relicsUnlocked],
    verdictsUnlocked: [...savedEnvelope.career.verdictsUnlocked],
    completedRunKeys: [...savedEnvelope.career.completedRunKeys],
  };

  const initialSeed = options?.initialSeed ?? HORIZON_CONFIG.DEFAULT_SEED;
  let state: HorizonGameState =
    options?.initialSeed === undefined &&
    savedEnvelope.activeRun &&
    savedEnvelope.activeRun.status !== 'VICTORY' &&
    savedEnvelope.activeRun.status !== 'GAME_OVER'
      ? cloneHorizonState(savedEnvelope.activeRun)
      : createInitialHorizonState(initialSeed);

  const audio = new HorizonAudioEngine();

  const handleAction = (action: HorizonInputAction): void => {
    applyHorizonInput(state, action);
    if (state.events.length > 0) {
      ui.consumeEvents(state, state.events);
      state.events = [];
    }
    const env = saveHorizonState(career, state);
    career = env.career;
    ui.render(state, career, HORIZON_CONFIG.FIXED_STEP_MS);
  };

  const handleRestart = (newSeed?: number): void => {
    const seedToUse =
      typeof newSeed === 'number' ? newSeed : ((state.seed + 104729) >>> 0);
    state = createInitialHorizonState(seedToUse, {
      mode: state.mode,
      chassis: state.ship.chassis,
      startSector: 1,
    });
    ui.resetVisuals();
    const env = saveHorizonState(career, state);
    career = env.career;
    ui.render(state, career, HORIZON_CONFIG.FIXED_STEP_MS);
  };

  const handleToggleDebug = (force?: boolean): void => {
    const next = typeof force === 'boolean' ? force : !ui.isDebugVisible();
    ui.setDebugVisible(next);
  };

  const ui = new HorizonUIController(
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
    const prevSector = state.sector;

    while (accumulatorMs >= HORIZON_CONFIG.FIXED_STEP_MS) {
      stepHorizonState(state, HORIZON_CONFIG.FIXED_STEP_MS);
      if (state.events.length > 0) {
        ui.consumeEvents(state, state.events);
        state.events = [];
      }
      accumulatorMs -= HORIZON_CONFIG.FIXED_STEP_MS;
    }

    if (
      state.status !== prevStatus ||
      state.sector !== prevSector ||
      state.score > career.highScore
    ) {
      const env = saveHorizonState(career, state);
      career = env.career;
    }

    ui.render(state, career, rawDt || HORIZON_CONFIG.FIXED_STEP_MS);
    rafId = window.requestAnimationFrame(loop);
  };

  ui.render(state, career, HORIZON_CONFIG.FIXED_STEP_MS);
  rafId = window.requestAnimationFrame(loop);

  return {
    destroy(): void {
      destroyed = true;
      window.cancelAnimationFrame(rafId);
      saveHorizonState(career, state);
      audio.destroy();
      ui.destroy();
    },
    getStateSnapshot(): HorizonGameState {
      return cloneHorizonState(state);
    },
    restartWithSeed(seed: number): void {
      handleRestart(seed);
    },
    toggleDebug(force?: boolean): void {
      handleToggleDebug(force);
      ui.render(state, career, HORIZON_CONFIG.FIXED_STEP_MS);
    },
  };
}

const eventHorizonModule: ArgonGameModule = {
  metadata,
  mountGame,
};

export default eventHorizonModule;
