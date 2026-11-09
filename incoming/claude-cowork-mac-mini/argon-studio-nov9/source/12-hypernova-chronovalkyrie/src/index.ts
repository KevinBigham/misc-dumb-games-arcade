import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract';
import { HYPERNOVA_CONFIG } from './config';
import { HypernovaAudioEngine } from './audio';
import {
  loadHypernovaSave,
  recordRunEnd,
  saveHypernovaCareer,
  type HypernovaCareerStats,
} from './persistence';
import {
  createInitialHypernovaState,
  stepHypernovaState,
  type HypernovaGameState,
} from './simulation';
import { HypernovaUIController } from './ui';
import type { ChassisId } from './content';

export * from './config';
export * from './rng';
export * from './content';
export * from './simulation';
export * from './persistence';
export * from './audio';
export * from './ui';

export const metadata: ArgonGameMetadata = {
  id: HYPERNOVA_CONFIG.GAME_ID,
  number: HYPERNOVA_CONFIG.GAME_NUMBER,
  title: HYPERNOVA_CONFIG.TITLE,
  subtitle: HYPERNOVA_CONFIG.SUBTITLE,
  genre: 'Apex Overdrive Bullet-Time Roguelite & Twin-Stick Graze Arena',
  primaryReference: 'Vampire Survivors · Geometry Wars: Retro Evolved · Hades',
  supportingReference: 'Ikaruga (Bullet Graze) · Hotline Miami (Game Juice & Music) · Touhou Project',
  oneSentenceLoop:
    'Pilot the experimental Chrono-Valkyrie frame across 10 intense escalating waves, triggering bullet-time Chrono-Drift to graze projectiles and parry laser barrages while drafting synergistic weapons and augments to achieve SSS-Rank Apex Overdrive and vanquish the Singularity Titan.',
  shortGoal:
    'Survive through Wave 5, defeat the mid-boss Dreadnought HYPERION THE SUN-DEVOURER, and draft an Exotic Synergy Core.',
  longGoal:
    'Obliterate Wave 10 boss CHRONOS THE SINGULARITY WEAVER, reach APEX Overdrive (x10 multiplier), unlock all 3 Valkyrie frames, and dominate Endless Mode.',
  controlsSummary:
    'WASD / Arrows: Vector Move · Mouse: Aim & Fire · Space / Shift / Right-Click: Chrono-Drift (0.2x Bullet-Time) · 1, 2, 3: Draft Augments · P / Esc: Pause · D: Debug',
  accentColor: HYPERNOVA_CONFIG.ACCENT_COLOR,
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const saveEnvelope = loadHypernovaSave();
  let career: HypernovaCareerStats = { ...saveEnvelope.career };

  const initialSeed = options?.initialSeed ?? HYPERNOVA_CONFIG.DEFAULT_SEED;
  let activeState: HypernovaGameState = createInitialHypernovaState(initialSeed, 'interceptor');

  const audio = new HypernovaAudioEngine();
  let isRunning = true;
  let lastTimestamp = performance.now();
  let animFrameId: number | null = null;

  const ui = new HypernovaUIController(container, audio, career, {
    onRestart: (chassisId: ChassisId, newSeed?: number) => {
      const seedToUse = newSeed ?? Math.floor(Math.random() * 9000000) + 100000;
      activeState = createInitialHypernovaState(seedToUse, chassisId);
      audio.startMusic();
    },
    onRunEnd: (finalState: HypernovaGameState) => {
      career = recordRunEnd(
        career,
        finalState.score,
        finalState.currentWave,
        finalState.totalKills,
        finalState.totalGrazes,
        finalState.activeBossId === null && finalState.currentWave >= 5 ? 1 : 0,
        finalState.highestComboGrade,
        finalState.status === 'VICTORY'
      );
      saveHypernovaCareer(career, finalState.seed);
    },
  });

  function gameLoop(currentTimestamp: number): void {
    if (!isRunning) return;

    const deltaMs = Math.min(currentTimestamp - lastTimestamp, HYPERNOVA_CONFIG.MAX_DELTA_MS);
    lastTimestamp = currentTimestamp;

    if (activeState.status === 'PLAYING') {
      const input = ui.gatherInput(activeState);
      stepHypernovaState(activeState, input, deltaMs);
      ui.handleSimulationEvents(activeState);
      ui.updateHUD(activeState);
    }

    ui.render(activeState, deltaMs);
    animFrameId = requestAnimationFrame(gameLoop);
  }

  animFrameId = requestAnimationFrame(gameLoop);

  return {
    destroy(): void {
      isRunning = false;
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
      }
      ui.destroy();
      audio.stopMusic();
    },
    getStateSnapshot(): unknown {
      return activeState;
    },
    restartWithSeed(seed: number): void {
      activeState = createInitialHypernovaState(seed, activeState.player.chassisId);
      audio.startMusic();
    },
    toggleDebug(force?: boolean): void {
      ui.togglePause(force);
    },
  };
}

export const game12Module: ArgonGameModule = {
  metadata,
  mountGame,
};
