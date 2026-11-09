import type {
  ArgonGameInstance,
  ArgonGameMetadata,
  ArgonGameModule,
} from '../../shared-contract';
import { VoltLashAudioEngine } from './audio';
import {
  cloneVoltLashState,
  createInitialVoltLashState,
  FIXED_DT_MS,
  selectUpgrade,
  stepVoltLashState,
  triggerBankOrOverdrive,
  triggerDashParry,
  VoltLashState,
} from './simulation';
import { VoltLashUIController } from './ui';

export * from './simulation';
export * from './audio';
export * from './ui';

export const metadata: ArgonGameMetadata = {
  id: '13-aegis-volt-lash',
  number: 13,
  title: 'Aegis: Volt-Lash',
  subtitle: 'Kinetic Tether-Parry & Redline Surge Arena',
  genre: 'Kinetic Bullet-Deflection Roguelite × High-Voltage Tether Arena',
  primaryReference: 'Hyper Light Drifter · Geometry Wars: Retro Evolved',
  supportingReference: 'Nuclear Throne · Vampire Survivors · Ikaruga (Graze/Parry Polarity)',
  oneSentenceLoop:
    'Graze enemy barrages and Lash-Parry Dash across the arena to stretch high-voltage tethers and reflect homing plasma volleys, constantly deciding whether to Bank your Volt-Surge for a +30 HP heal or ride Redline Overcharge to 100% Supernova.',
  shortGoal:
    'Parry your first enemy volley, build 35%+ Volt-Surge, and draft your first geometry-altering Reactor Module.',
  longGoal:
    'Chain Triangle Cage tethers and Prism Shatter-Parry shards through 5 escalating waves to obliterate the 3-phase boss ARCHON-V.',
  controlsSummary:
    'WASD / Arrows: Move & Graze · Space / Left-Click: Lash-Parry Dash · E / Right-Click: Bank Surge (+30 HP) or 100% Supernova · 1-2-3: Draft Upgrade · R: Instant Restart · M: Mute',
  accentColor: '#38bdf8',
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  const initialSeed = options?.initialSeed ?? 20261108;
  let state: VoltLashState = createInitialVoltLashState(initialSeed);
  const audio = new VoltLashAudioEngine();

  const flushEvents = (): void => {
    if (state.events.length > 0) {
      ui.consumeEvents(state, state.events);
      state.events = [];
    }
  };

  const handleRestart = (newSeed?: number): void => {
    const nextSeed =
      typeof newSeed === 'number' ? newSeed : ((state.seed + 104729) >>> 0);
    state = createInitialVoltLashState(nextSeed);
    ui.resetVisuals();
    ui.render(state, FIXED_DT_MS);
  };

  const ui = new VoltLashUIController(
    container,
    audio,
    {
      onRestart: handleRestart,
      onSelectUpgrade: (index: number) => {
        if (selectUpgrade(state, index)) {
          flushEvents();
          ui.render(state, FIXED_DT_MS);
        }
      },
      onBankOrOverdrive: () => {
        if (triggerBankOrOverdrive(state)) {
          flushEvents();
          ui.render(state, FIXED_DT_MS);
        }
      },
      onDashTrigger: () => {
        const snap = ui.sampleInput();
        if (triggerDashParry(state, { ...snap, dashPressed: true })) {
          flushEvents();
          ui.render(state, FIXED_DT_MS);
        }
      },
    },
    Boolean(options?.debug)
  );

  let rafId = 0;
  let lastTimeMs = typeof performance !== 'undefined' ? performance.now() : 0;
  let accumulatorMs = 0;
  let destroyed = false;

  const loop = (nowMs: number): void => {
    if (destroyed) return;
    const rawDt = Math.min(100, Math.max(0, nowMs - lastTimeMs));
    lastTimeMs = nowMs;
    accumulatorMs += rawDt;

    while (accumulatorMs >= FIXED_DT_MS) {
      const input = ui.sampleInput();
      stepVoltLashState(state, input, FIXED_DT_MS);
      flushEvents();
      accumulatorMs -= FIXED_DT_MS;
    }

    ui.render(state, rawDt || FIXED_DT_MS);
    rafId = window.requestAnimationFrame(loop);
  };

  ui.render(state, FIXED_DT_MS);
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    rafId = window.requestAnimationFrame(loop);
  }

  return {
    destroy(): void {
      destroyed = true;
      if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(rafId);
      }
      audio.destroy();
      ui.destroy();
    },
    getStateSnapshot(): VoltLashState {
      return cloneVoltLashState(state);
    },
    restartWithSeed(seed: number): void {
      handleRestart(seed);
    },
    toggleDebug(force?: boolean): void {
      const next = typeof force === 'boolean' ? force : !ui.isDebugVisible();
      ui.setDebugVisible(next);
      ui.render(state, FIXED_DT_MS);
    },
  };
}

const voltLashModule: ArgonGameModule = {
  metadata,
  mountGame,
};

export default voltLashModule;
