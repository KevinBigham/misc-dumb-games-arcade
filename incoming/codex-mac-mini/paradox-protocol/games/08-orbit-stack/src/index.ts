import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract';
import { OrbitAudioEngine } from './audio';
import { CONFIG } from './config';
import {
  cloneOrbitState,
  loadOrbitSave,
  OrbitCareerStats,
  saveOrbitState,
} from './persistence';
import {
  applyInput,
  createInitialState,
  OrbitGameState,
  OrbitInputAction,
  stepOrbitState,
} from './simulation';
import { OrbitUIController } from './ui';

export * from './config';
export * from './rng';
export * from './content';
export * from './simulation';
export * from './persistence';
export * from './audio';
export * from './ui';

export const metadata: ArgonGameMetadata = {
  id: '08-orbit-stack',
  number: 8,
  title: 'Orbit Stack',
  subtitle: 'Morphing Polygon Ring Matcher (6 → 7 → 8 Sides)',
  genre: 'Radial Action-Puzzle',
  primaryReference: 'Hextris (Engstrom, Finucane, Moroze, Yang)',
  supportingReference: 'Super Hexagon (Terry Cavanagh)',
  oneSentenceLoop:
    'Colored orbital shards fly inward toward a rotating central polygon core; rotate the core (Left/Right) or trigger a Phase Pulse (Shift/Up) and Slam (Space/Down) so 3+ connected same-color blocks match and clear before any side breaches the outer containment ring!',
  shortGoal:
    'Reach Level 8 (Octa-Core Mastery) and survive 100 cleared shards to unlock Victory and Endless Orbit.',
  longGoal:
    'Master the 6 → 7 → 8 polygon morph transitions, chain x8 cross-face cascades, and conquer the Level 35 asymptotic speed cap.',
  controlsSummary:
    'Left/Right (A/D): Rotate Polygon · Space/Down: Slam Shard · Shift/Up: Phase Pulse · P: Pause',
  accentColor: '#22d3ee',
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const savedEnvelope = loadOrbitSave();
  let career: OrbitCareerStats = { ...savedEnvelope.career };

  const initialSeed = options?.initialSeed ?? CONFIG.DEFAULT_SEED;
  let state: OrbitGameState =
    options?.initialSeed === undefined &&
    savedEnvelope.activeRun &&
    savedEnvelope.activeRun.status !== 'GAME_OVER'
      ? cloneOrbitState(savedEnvelope.activeRun)
      : createInitialState(initialSeed);

  const audio = new OrbitAudioEngine();

  const handleAction = (action: OrbitInputAction): void => {
    applyInput(state, action);
    if (state.events.length > 0) {
      ui.consumeEvents(state, state.events);
      state.events = [];
    }
    if (state.status === 'PAUSED') {
      const env = saveOrbitState(career, state);
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
    const env = saveOrbitState(career, state);
    career = env.career;
  };

  const handleToggleDebug = (force?: boolean): void => {
    const next = typeof force === 'boolean' ? force : !ui.isDebugVisible();
    ui.setDebugVisible(next);
  };

  const ui = new OrbitUIController(
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

    const prevLevel = state.level;
    const prevStatus = state.status;

    while (accumulatorMs >= CONFIG.FIXED_STEP_MS) {
      stepOrbitState(state, CONFIG.FIXED_STEP_MS);
      if (state.events.length > 0) {
        ui.consumeEvents(state, state.events);
        state.events = [];
      }
      accumulatorMs -= CONFIG.FIXED_STEP_MS;
    }

    if (
      state.level !== prevLevel ||
      state.status !== prevStatus ||
      state.score > career.highScore
    ) {
      const env = saveOrbitState(
        career,
        state.status === 'GAME_OVER' ? null : state
      );
      career = env.career;
    }

    ui.render(state, career, rawDt || CONFIG.FIXED_STEP_MS);
    rafId = window.requestAnimationFrame(loop);
  };

  // Render initial frame immediately so synchronous DOM checks see populated UI
  ui.render(state, career, CONFIG.FIXED_STEP_MS);
  rafId = window.requestAnimationFrame(loop);

  return {
    destroy(): void {
      destroyed = true;
      window.cancelAnimationFrame(rafId);
      saveOrbitState(career, state.status === 'GAME_OVER' ? null : state);
      audio.destroy();
      ui.destroy();
    },
    getStateSnapshot(): OrbitGameState {
      return cloneOrbitState(state);
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

const orbitStackModule: ArgonGameModule = {
  metadata,
  mountGame,
};

export default orbitStackModule;
