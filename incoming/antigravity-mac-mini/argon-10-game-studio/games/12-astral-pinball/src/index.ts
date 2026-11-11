import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract';
import { AstralAudioEngine } from './audio';
import { ASTRAL_CONFIG } from './config';
import {
  AstralCareerStats,
  loadAstralSave,
  saveAstralState,
} from './persistence';
import {
  applyAstralInput,
  AstralGameState,
  AstralInputAction,
  cloneAstralState,
  createInitialAstralState,
  stepAstralState,
} from './simulation';
import { AstralUIController } from './ui';

export * from './config';
export * from './rng';
export * from './content';
export * from './simulation';
export * from './persistence';
export * from './audio';
export * from './ui';

export const metadata: ArgonGameMetadata = {
  id: ASTRAL_CONFIG.GAME_ID,
  number: ASTRAL_CONFIG.GAME_NUMBER,
  title: ASTRAL_CONFIG.TITLE,
  subtitle: ASTRAL_CONFIG.SUBTITLE,
  genre: 'Relativistic Pinball-Roguelike × Orbital Alchemist × Multiplicative Synergy Engine',
  primaryReference: 'Space Cadet 3D Pinball · Balatro (Chips × Mult × Relic Synergy)',
  supportingReference: 'Peglin · Into the Breach (Trajectory Oracle) · Arkanoid (Parry Flipper)',
  oneSentenceLoop:
    'Launch relativistic star-comets into a customizable cosmos of prism splitters, gravity wells, and Tesla bumpers, actively deflecting them with twin plasma flippers and magnetic pulses to shatter 5 Cosmic Boss Constellations in multiplicative Chips × Mult chain reactions.',
  shortGoal:
    'Shatter Sector I (The Clockwork Astrolabe) and wire a Bifrost Prism + Tesla Pylon multiball chain.',
  longGoal:
    'Conquer all 5 Cosmic Boss Constellations (up to OROBOROS, The Grand Architect), bind 5+ Astral Relics, and benchmark your trajectory efficiency against the 3-Archetype Counterfactual Simulator.',
  controlsSummary:
    'Mouse / A-D / ←-→: Aim & Move Flipper Array · Space / Click: Launch & Flipper Parry · [E]: Magnet Pulse · [Q]: Chrono-Dilation · [F]: Supernova Split · [H]: Oracle Hint',
  accentColor: ASTRAL_CONFIG.ACCENT_COLOR,
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const savedEnvelope = loadAstralSave();
  let career: AstralCareerStats = { ...savedEnvelope.career };

  const initialSeed = options?.initialSeed ?? ASTRAL_CONFIG.DEFAULT_SEED;
  let state: AstralGameState =
    options?.initialSeed === undefined &&
    savedEnvelope.activeRun &&
    savedEnvelope.activeRun.status !== 'VICTORY' &&
    savedEnvelope.activeRun.status !== 'GAME_OVER'
      ? cloneAstralState(savedEnvelope.activeRun)
      : createInitialAstralState(initialSeed, 'CAMPAIGN');

  const audio = new AstralAudioEngine();
  let visibilityPaused = false;

  const handleAction = (action: AstralInputAction): void => {
    applyAstralInput(state, action);
    if (state.events.length > 0) {
      ui.consumeEvents(state, state.events);
      state.events = [];
    }
    const env = saveAstralState(career, state);
    career = env.career;
    ui.render(state, career, ASTRAL_CONFIG.FIXED_STEP_MS);
  };

  const handleRestart = (newSeed?: number): void => {
    const seedToUse =
      typeof newSeed === 'number' ? newSeed : ((state.seed + 104729) >>> 0);
    state = createInitialAstralState(seedToUse, state.mode);
    ui.resetVisuals();
    const env = saveAstralState(career, state);
    career = env.career;
    ui.render(state, career, ASTRAL_CONFIG.FIXED_STEP_MS);
  };

  const handleToggleDebug = (force?: boolean): void => {
    const next = typeof force === 'boolean' ? force : !ui.isDebugVisible();
    ui.setDebugVisible(next);
  };

  const ui = new AstralUIController(
    container,
    audio,
    {
      onAction: handleAction,
      onRestart: handleRestart,
      onToggleDebug: () => handleToggleDebug(),
      onVisibilityPausedChange: (paused: boolean) => {
        visibilityPaused = paused;
        lastTimeMs = performance.now();
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
    if (visibilityPaused) {
      lastTimeMs = nowMs;
      rafId = window.requestAnimationFrame(loop);
      return;
    }

    const rawDt = Math.min(100, Math.max(0, nowMs - lastTimeMs));
    lastTimeMs = nowMs;
    accumulatorMs += rawDt;

    const prevStatus = state.status;
    const prevSector = state.sector;

    while (accumulatorMs >= ASTRAL_CONFIG.FIXED_STEP_MS) {
      stepAstralState(state, ASTRAL_CONFIG.FIXED_STEP_MS);
      if (state.events.length > 0) {
        ui.consumeEvents(state, state.events);
        state.events = [];
      }
      accumulatorMs -= ASTRAL_CONFIG.FIXED_STEP_MS;
    }

    if (
      state.status !== prevStatus ||
      state.sector !== prevSector ||
      state.totalScore > career.highScore
    ) {
      const env = saveAstralState(career, state);
      career = env.career;
    }

    ui.render(state, career, rawDt || ASTRAL_CONFIG.FIXED_STEP_MS);
    rafId = window.requestAnimationFrame(loop);
  };

  ui.render(state, career, ASTRAL_CONFIG.FIXED_STEP_MS);
  rafId = window.requestAnimationFrame(loop);

  return {
    destroy(): void {
      destroyed = true;
      window.cancelAnimationFrame(rafId);
      saveAstralState(career, state);
      audio.destroy();
      ui.destroy();
    },
    getStateSnapshot(): AstralGameState {
      return cloneAstralState(state);
    },
    restartWithSeed(seed: number): void {
      handleRestart(seed);
    },
    toggleDebug(force?: boolean): void {
      handleToggleDebug(force);
      ui.render(state, career, ASTRAL_CONFIG.FIXED_STEP_MS);
    },
  };
}

const astralPinballModule: ArgonGameModule = {
  metadata,
  mountGame,
};

export default astralPinballModule;
