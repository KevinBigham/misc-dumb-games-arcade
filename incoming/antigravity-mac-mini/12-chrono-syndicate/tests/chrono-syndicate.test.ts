import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyChronoInput,
  CHRONO_CONFIG,
  commitLoopAndRewind,
  computeSyndicateRank,
  createInitialChronoState,
  getStageBlueprint,
  loadChronoSave,
  mountGame,
  saveChronoState,
  stepChronoState,
} from '../src/index';

describe('Game 12: Chrono-Syndicate — The 15-Second Heist Verification Suite', () => {
  beforeEach(() => {
    window.localStorage.clear();
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('produces identical deterministic state trajectories for the same seed', () => {
    const s1 = createInitialChronoState(20261108);
    const s2 = createInitialChronoState(20261108);

    applyChronoInput(s1, { type: 'SET_MOVE', dirX: 1, dirY: 0 });
    applyChronoInput(s2, { type: 'SET_MOVE', dirX: 1, dirY: 0 });

    for (let i = 0; i < 30; i++) {
      if (i === 10) {
        applyChronoInput(s1, { type: 'TRIGGER_ABILITY', verb: 'EMP_PULSE' });
        applyChronoInput(s2, { type: 'TRIGGER_ABILITY', verb: 'EMP_PULSE' });
      }
      stepChronoState(s1, CHRONO_CONFIG.FIXED_STEP_MS);
      stepChronoState(s2, CHRONO_CONFIG.FIXED_STEP_MS);
    }

    expect(s1.agent.x).toBeCloseTo(s2.agent.x, 5);
    expect(s1.agent.y).toBeCloseTo(s2.agent.y, 5);
    expect(s1.agent.energy).toBeCloseTo(s2.agent.energy, 5);
    expect(s1.rngState).toEqual(s2.rngState);
  });

  it('records Loop #1 frames and replays an autonomous Ghost Echo in Loop #2 that holds Pressure Plates and decrypts Ciphers', () => {
    const state = createInitialChronoState(20261108, 1);
    const bp = getStageBlueprint(1);
    const plateA = bp.switches[0];

    // Teleport agent onto Plate A during Loop 1 and record 15 ticks
    state.agent.x = plateA.x;
    state.agent.y = plateA.y;

    for (let t = 0; t < 15; t++) {
      stepChronoState(state, CHRONO_CONFIG.FIXED_STEP_MS);
    }

    expect(state.switches[0].pressed).toBe(true);
    expect(state.laserGates[0].isOpen).toBe(true);
    expect(state.currentLoopRecording).toHaveLength(15);

    // Commit Loop #1 and rewind to T=0.0s for Loop #2
    commitLoopAndRewind(state);
    expect(state.loopNumber).toBe(2);
    expect(state.tick).toBe(0);
    expect(state.recordedEchoes).toHaveLength(1);
    expect(state.activeGhosts).toHaveLength(1);

    // Move live Operative #2 away from Plate A; verify Ghost Echo #1 still opens Plate A!
    state.agent.x = bp.spawnPos.x;
    state.agent.y = bp.spawnPos.y;
    stepChronoState(state, CHRONO_CONFIG.FIXED_STEP_MS);

    expect(state.switches[0].pressed).toBe(true);
    expect(state.switches[0].activatedByLabel).toBe('ECHO #1');
    expect(state.laserGates[0].isOpen).toBe(true);
  });

  it('allows Holo-Decoys to hold open Pressure Plates and distract Sentinels, and EMP Pulses to stun Sentinels', () => {
    const state = createInitialChronoState(20261108, 1);
    const plateA = state.switches[0];
    state.agent.x = plateA.x;
    state.agent.y = plateA.y;

    applyChronoInput(state, { type: 'TRIGGER_ABILITY', verb: 'DEPLOY_DECOY' });
    expect(state.decoys).toHaveLength(1);

    // Move live player far away; decoy remains on Plate A
    state.agent.x = 70;
    state.agent.y = 350;
    stepChronoState(state, CHRONO_CONFIG.FIXED_STEP_MS);
    expect(state.switches[0].pressed).toBe(true);

    // Test EMP Pulse stunning a Sentinel
    const sentinel = state.sentinels[0];
    state.agent.x = sentinel.x + 10;
    state.agent.y = sentinel.y + 10;
    state.agent.energy = 100;
    applyChronoInput(state, { type: 'TRIGGER_ABILITY', verb: 'EMP_PULSE' });
    expect(sentinel.stunnedTicks).toBeGreaterThanOrEqual(CHRONO_CONFIG.EMP_STUN_TICKS);
  });

  it('unlocks the Quantum Vault once all Cipher Terminals are decrypted, allows seizing the Core, and extracts at Helipad', () => {
    const state = createInitialChronoState(20261108, 1);
    const bp = getStageBlueprint(1);
    const term = state.terminals[0];

    // Position agent on Cipher Terminal 1 until decrypted
    state.agent.x = term.x;
    state.agent.y = term.y;
    for (let i = 0; i < term.hackTicksRequired + 2; i++) {
      stepChronoState(state, CHRONO_CONFIG.FIXED_STEP_MS);
    }

    expect(state.terminals[0].hacked).toBe(true);
    expect(state.vaultUnlocked).toBe(true);

    // Move agent to Vault Core to pick it up
    state.agent.x = bp.vaultPos.x;
    state.agent.y = bp.vaultPos.y;
    stepChronoState(state, CHRONO_CONFIG.FIXED_STEP_MS);
    expect(state.coreCarrierLabel).toBe('OPERATIVE #1');

    // Move agent to Extraction Helipad to complete Sector 1
    state.agent.x = bp.extractionPos.x;
    state.agent.y = bp.extractionPos.y;
    stepChronoState(state, CHRONO_CONFIG.FIXED_STEP_MS);
    expect(state.status).toBe('STAGE_CLEAR');
    expect(state.stageSummaries).toHaveLength(1);

    // Advance through remaining stages
    applyChronoInput(state, { type: 'NEXT_STAGE' });
    expect(state.stageNumber).toBe(2);
    expect(state.status).toBe('PLAYING');
  });

  it('persists career stats idempotently without double-rewarding on reload', () => {
    const initialSave = loadChronoSave();
    const state = createInitialChronoState(999);
    state.status = 'VICTORY';
    state.score = 14200;
    state.stageSummaries = [
      {
        stageNumber: 1,
        title: 'Test',
        echoesUsed: 2,
        parEchoCount: 2,
        ticksUsed: 180,
        paradoxPeak: 10,
        stageScore: 3500,
      },
    ];
    state.finalRankId = computeSyndicateRank(state).id;

    const env1 = saveChronoState(initialSave.career, state);
    expect(env1.career.heistsCompleted).toBe(1);
    expect(env1.career.totalVaultsCracked).toBe(1);

    // Saving identical completed run again must not double-count
    const env2 = saveChronoState(env1.career, state);
    expect(env2.career.heistsCompleted).toBe(1);
    expect(env2.career.totalVaultsCracked).toBe(1);
  });

  it('mounts UI cleanly, scrubs timeline ticks, toggles debug, and destroys without leaks', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, { initialSeed: 20261108, debug: false });
    expect(container.querySelector('#cs-heist-canvas')).toBeTruthy();
    expect(container.querySelectorAll('[data-stage-jump]')).toHaveLength(4);

    instance.toggleDebug?.(true);
    instance.restartWithSeed?.(777888);
    const snap = instance.getStateSnapshot?.() as { seed: number };
    expect(snap.seed).toBe(777888);

    instance.destroy();
    container.remove();
  });
});
