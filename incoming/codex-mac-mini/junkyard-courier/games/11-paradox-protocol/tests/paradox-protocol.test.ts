import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyParadoxInput,
  computeEndingVerdict,
  createInitialParadoxState,
  loadParadoxSave,
  mountGame,
  PARADOX_CONFIG,
  runCounterfactualComparison,
  saveParadoxState,
  stepParadoxState,
} from '../src/index';

describe('Game 11: Paradox Protocol — The Mirror Engine Verification Suite', () => {
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
    const s1 = createInitialParadoxState(20261107);
    const s2 = createInitialParadoxState(20261107);

    for (let i = 0; i < 40; i++) {
      if (i === 5) {
        applyParadoxInput(s1, { type: 'TRIGGER_VERB', verb: 'INTERVENE' });
        applyParadoxInput(s2, { type: 'TRIGGER_VERB', verb: 'INTERVENE' });
      }
      if (i === 20) {
        applyParadoxInput(s1, { type: 'TRIGGER_VERB', verb: 'SWERVE' });
        applyParadoxInput(s2, { type: 'TRIGGER_VERB', verb: 'SWERVE' });
      }
      stepParadoxState(s1, PARADOX_CONFIG.FIXED_STEP_MS);
      stepParadoxState(s2, PARADOX_CONFIG.FIXED_STEP_MS);
    }

    expect(s1.score).toBe(s2.score);
    expect(s1.player.x).toBeCloseTo(s2.player.x, 5);
    expect(s1.player.y).toBeCloseTo(s2.player.y, 5);
    expect(s1.oracle.predictionLockPct).toBeCloseTo(s2.oracle.predictionLockPct, 5);
    expect(s1.rngState).toEqual(s2.rngState);
  });

  it('flips Trolley Reactor tracks on INTERVENE and shatters Oracle prediction lock on SWERVE', () => {
    const state = createInitialParadoxState(999111);
    expect(state.trolleyActiveTrack).toBe('ALPHA');

    applyParadoxInput(state, { type: 'TRIGGER_VERB', verb: 'INTERVENE' });
    expect(state.trolleyActiveTrack).toBe('BETA');
    expect(state.verbCounts.INTERVENE).toBe(1);

    state.oracle.predictionLockPct = 82;
    state.player.energy = 80;
    applyParadoxInput(state, { type: 'TRIGGER_VERB', verb: 'SWERVE' });
    expect(state.oracle.predictionLockPct).toBeLessThan(50);
    expect(state.oracle.predictionsBroken).toBe(1);
    expect(state.soul.entropy).toBeGreaterThan(35);
  });

  it('spawns the Act B Mirror Echo-Clone at 14s reflecting the player Act A calibration', () => {
    const state = createInitialParadoxState(20261107);
    expect(state.act).toBe('ACT_A_CALIBRATION');
    expect(state.clones).toHaveLength(0);

    // Perform altruistic interventions in Act A
    applyParadoxInput(state, { type: 'TRIGGER_VERB', verb: 'INTERVENE' });

    const stepsToActB = Math.ceil(
      (PARADOX_CONFIG.ACT_B_MIRROR_START_SECONDS * 1000) / PARADOX_CONFIG.FIXED_STEP_MS
    ) + 2;
    for (let i = 0; i < stepsToActB; i++) {
      stepParadoxState(state, PARADOX_CONFIG.FIXED_STEP_MS);
    }

    expect(state.act).toBe('ACT_B_MIRROR');
    expect(state.clones.length).toBeGreaterThanOrEqual(1);
    expect(state.clones[state.clones.length - 1].disposition).toBe('ALLY');
  });

  it('installs Ship of Theseus cybernetic upgrades at the cost of 25% Humanity each and triggers PERFECT_MACHINE verdict at low humanity', () => {
    const state = createInitialParadoxState(20261107);
    expect(state.soul.humanity).toBe(100);

    applyParadoxInput(state, { type: 'INSTALL_UPGRADE', upgradeId: 'OPTIC_PREDICTOR' });
    applyParadoxInput(state, { type: 'INSTALL_UPGRADE', upgradeId: 'CORTEX_OVERCLOCK' });
    applyParadoxInput(state, { type: 'INSTALL_UPGRADE', upgradeId: 'EMPATHY_SHUNT' });

    expect(state.player.installedUpgrades).toHaveLength(3);
    expect(state.soul.humanity).toBe(25);
    expect(computeEndingVerdict(state).id).toBe('PERFECT_MACHINE');
  });

  it('progresses through all 5 chambers via dilemma commitments and computes counterfactual comparisons', () => {
    const state = createInitialParadoxState(20261107);

    for (let ch = 1; ch <= 5; ch++) {
      expect(state.chamber).toBe(ch);
      state.chamberElapsedMs = PARADOX_CONFIG.CHAMBER_DURATION_SECONDS * 1000;
      stepParadoxState(state, PARADOX_CONFIG.FIXED_STEP_MS);
      expect(state.status).toBe('CHAMBER_DILEMMA');

      applyParadoxInput(state, { type: 'CHOOSE_DILEMMA', side: 'LEFT' });
    }

    expect(state.status).toBe('VICTORY');
    expect(state.endingVerdictId).toBeTruthy();
    expect(state.dilemmaHistory).toHaveLength(5);

    const counterfactuals = runCounterfactualComparison(state);
    expect(counterfactuals).toHaveLength(4);
    expect(counterfactuals[0].projectedScore).toBe(state.score);
  });

  it('persists career stats idempotently without double-rewarding on reload', () => {
    const loaded0 = loadParadoxSave();
    const state = createInitialParadoxState(777);
    state.status = 'VICTORY';
    state.endingVerdictId = 'UNPREDICTABLE_SOVEREIGN';
    state.podsSavedTotal = 9;

    const env1 = saveParadoxState(loaded0.career, state);
    expect(env1.career.gamesPlayed).toBe(1);
    expect(env1.career.totalPodsSaved).toBe(9);

    const env2 = saveParadoxState(env1.career, state);
    expect(env2.career.gamesPlayed).toBe(1);
    expect(env2.career.totalPodsSaved).toBe(9);
  });

  it('mounts UI cleanly, handles reseeding and debug toggle, and destroys without leaks', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, { initialSeed: 20261107, debug: false });
    expect(container.querySelector('#px-arena-canvas')).toBeTruthy();
    expect(container.querySelectorAll('[data-chamber-jump]')).toHaveLength(5);

    instance.toggleDebug?.(true);
    instance.restartWithSeed?.(123456);
    const snap = instance.getStateSnapshot?.() as { seed: number };
    expect(snap.seed).toBe(123456);

    instance.destroy();
    container.remove();
  });
});
