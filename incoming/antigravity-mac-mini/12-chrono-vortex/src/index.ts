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
  genre: 'Kinetic Pinball-Brawler & Time-Echo Bullet-Alchemist Roguelite',
  primaryReference: 'Hades · Demon’s Tilt / Peggle · Into the Breach',
  supportingReference: 'Braid (Time-Echoes) · Ikaruga (Bullet Alchemy)',
  oneSentenceLoop:
    'Ricochet your Striker and enemy automatons off 4 Elemental Resonance Bumpers inside an octagonal Cosmic Crucible, weave up to 3 parallel Chrono-Ghost Echoes of your own past 4 seconds, and parry enemy bullet-hell volleys into homing prism storms across 5 Sectors!',
  shortGoal:
    'Shatter the 4 Crucible Sectors, draft synergistic God-Forge Relics (or smelt them at the Anvil), and topple the 3-Phase Boss Kronos-Omega.',
  longGoal:
    'Master all 3 Striker Chassis (Vanguard-G, Phantom-X, Prism-9), unlock all 12 God-Forge Relics, and sustain a 16x Pinball Overdrive Chain.',
  controlsSummary:
    'WASD / Arrows: Drift · Click / Space: Kinetic Dash-Slam · Q / Right-Click: Alchemy Parry · E: Spawn Chrono-Ghost · R: Rewind & Fork · F: Overdrive',
  accentColor: CHRONO_CONFIG.ACCENT_COLOR,
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const savedEnvelope = loadChronoSave();
  let career: ChronoCareerStats = {
    ...savedEnvelope.career,
    discoveredRelics: [...savedEnvelope.career.discoveredRelics],
    rewardedRunSeeds: [...savedEnvelope.career.rewardedRunSeeds],
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
    state = createInitialChronoState(seedToUse, state.player.chassisId);
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
      state.sector !== prevSector ||
      state.score > career.highScore
    ) {
      const env = saveChronoState(career, state);
      career = env.career;
    }

    ui.render(state, career, rawDt || CHRONO_CONFIG.FIXED_STEP_MS);
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

const chronoVortexModule: ArgonGameModule = {
  metadata,
  mountGame,
};

export default chronoVortexModule;
