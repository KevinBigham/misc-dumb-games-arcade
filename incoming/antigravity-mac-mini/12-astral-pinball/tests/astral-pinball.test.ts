import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyAstralInput,
  ASTRAL_CONFIG,
  computeOptimalLaunchHint,
  computeTrajectoryPreview,
  createInitialAstralState,
  evaluateAstralVerdict,
  loadAstralSave,
  metadata,
  mountGame,
  runAstralCounterfactuals,
  saveAstralState,
  stepAstralState,
} from '../src/index';

describe('Game 12: Oroboros — The Pinball Singularity Verification Suite', () => {
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
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('exposes valid ArgonGameMetadata for Game 12 (Oroboros: The Pinball Singularity)', () => {
    expect(metadata.id).toBe('12-astral-pinball');
    expect(metadata.number).toBe(12);
    expect(metadata.title).toContain('Oroboros');
    expect(metadata.oneSentenceLoop.length).toBeGreaterThan(30);
  });

  it('produces identical deterministic trajectories for identical seeds', () => {
    const s1 = createInitialAstralState(20261108, 'CAMPAIGN');
    const s2 = createInitialAstralState(20261108, 'CAMPAIGN');

    applyAstralInput(s1, { type: 'LAUNCH_COMET', angleDeg: -16 });
    applyAstralInput(s2, { type: 'LAUNCH_COMET', angleDeg: -16 });

    for (let i = 0; i < 65; i++) {
      if (i === 25) {
        applyAstralInput(s1, { type: 'CAST_MAGNET_PULSE' });
        applyAstralInput(s2, { type: 'CAST_MAGNET_PULSE' });
      }
      stepAstralState(s1, ASTRAL_CONFIG.FIXED_STEP_MS);
      stepAstralState(s2, ASTRAL_CONFIG.FIXED_STEP_MS);
    }

    expect(s1.totalScore).toBe(s2.totalScore);
    expect(s1.currentComboMult).toBe(s2.currentComboMult);
    expect(s1.boss.hp).toBe(s2.boss.hp);
    expect(s1.rngState).toBe(s2.rngState);
    expect(s1.comets.length).toBe(s2.comets.length);
  });

  it('triggers Bifrost Prism Multiball splits, Tesla lightning chains, and Harmonic Bell Sonic Novas', () => {
    const state = createInitialAstralState(20261108, 'SANDBOX');
    applyAstralInput(state, { type: 'LAUNCH_COMET', angleDeg: 0 });
    expect(state.comets).toHaveLength(1);

    // Position the comet directly onto Slot 2 (West Crucible — PRISM_SPLITTER)
    const prismSocket = state.sockets.find((s) => s.nodeType === 'PRISM_SPLITTER')!;
    state.comets[0].x = prismSocket.x;
    state.comets[0].y = prismSocket.y + 5;
    stepAstralState(state, ASTRAL_CONFIG.FIXED_STEP_MS);

    expect(state.totalSplitsTriggered).toBeGreaterThanOrEqual(1);
    expect(state.comets.length).toBeGreaterThanOrEqual(2);

    // Position a comet onto Slot 1 (NE Crown — TESLA_PYLON)
    const teslaSocket = state.sockets.find((s) => s.nodeType === 'TESLA_PYLON')!;
    state.comets[0].x = teslaSocket.x;
    state.comets[0].y = teslaSocket.y + 4;
    state.comets[0].socketCooldownMs = 0;
    state.comets[0].lastSocketHitId = null;
    stepAstralState(state, ASTRAL_CONFIG.FIXED_STEP_MS);

    expect(state.totalLightningChains).toBeGreaterThanOrEqual(1);
    expect(state.boss.hp).toBeLessThan(state.boss.maxHp);

    // Trigger Harmonic Bell 3 times to unleash a full-screen Sonic Nova
    const bellSocket = state.sockets.find((s) => s.nodeType === 'HARMONIC_BELL')!;
    const hpBeforeNova = state.boss.hp;
    for (let hit = 0; hit < 3; hit++) {
      state.comets[0].x = bellSocket.x;
      state.comets[0].y = bellSocket.y + 3;
      state.comets[0].socketCooldownMs = 0;
      state.comets[0].lastSocketHitId = null;
      stepAstralState(state, ASTRAL_CONFIG.FIXED_STEP_MS);
    }
    expect(state.boss.hp).toBeLessThan(hpBeforeNova);
  });

  it('executes Perfect Flipper Parries, reflects Boss Hazards, and supports all 3 Flux Overdrive Verbs', () => {
    const state = createInitialAstralState(20261108, 'CAMPAIGN');
    state.flux = 100;
    applyAstralInput(state, { type: 'LAUNCH_COMET', angleDeg: 0 });

    // Place comet near the bottom Aegis Flipper Array descending downward
    state.comets[0].x = state.paddleX + 10;
    state.comets[0].y = ASTRAL_CONFIG.PADDLE_Y - 12;
    state.comets[0].vy = 320;

    // Spawn an incoming enemy hazard right above the paddle
    state.hazards.push({
      id: 999,
      x: state.paddleX - 8,
      y: ASTRAL_CONFIG.PADDLE_Y - 20,
      vx: 0,
      vy: 180,
      radius: 11,
      kind: 'VOID_METEOR',
      reflected: false,
    });

    // Swing flippers to trigger Perfect Parry on both the comet and the hazard!
    applyAstralInput(state, { type: 'FLIP_SWING', side: 'BOTH' });
    expect(state.totalPerfectParries).toBeGreaterThanOrEqual(2);
    expect(state.comets[0].vy).toBeLessThan(0);
    expect(state.comets[0].isSupernova).toBe(true);
    expect(state.hazards[0].reflected).toBe(true);

    // Test Chrono-Dilation Overdrive & Supernova Multiball Cast
    state.flux = 100;
    applyAstralInput(state, { type: 'CAST_CHRONO_OVERDRIVE' });
    expect(state.chronoOverdriveMs).toBe(4000);

    const cometCountBefore = state.comets.length;
    applyAstralInput(state, { type: 'CAST_SUPERNOVA_MULTIBALL' });
    expect(state.comets.length).toBe(cometCountBefore + 1);
  });

  it('wires, upgrades, and salvages Astral Socket Nodes using Stardust', () => {
    const state = createInitialAstralState(20261108, 'CAMPAIGN');
    state.stardust = 300;

    // Slot 5 (Far West Wing) starts empty
    expect(state.sockets[5].nodeType).toBeNull();

    applyAstralInput(state, {
      type: 'BUILD_OR_UPGRADE_SOCKET',
      slotIndex: 5,
      nodeType: 'WORMHOLE_RELAY',
    });
    expect(state.sockets[5].nodeType).toBe('WORMHOLE_RELAY');
    expect(state.sockets[5].level).toBe(1);

    // Upgrade same socket to Lv.2
    applyAstralInput(state, {
      type: 'BUILD_OR_UPGRADE_SOCKET',
      slotIndex: 5,
      nodeType: 'WORMHOLE_RELAY',
    });
    expect(state.sockets[5].level).toBe(2);

    // Salvage socket for Stardust refund
    const stardustBeforeSell = state.stardust;
    applyAstralInput(state, { type: 'SELL_SOCKET', slotIndex: 5 });
    expect(state.sockets[5].nodeType).toBeNull();
    expect(state.stardust).toBeGreaterThan(stardustBeforeSell);
  });

  it('clears all 5 Cosmic Boss Constellations, drafts Relics, and unlocks Singularity Sovereign Victory', () => {
    const state = createInitialAstralState(20261108, 'CAMPAIGN');

    for (let sec = 1; sec <= 5; sec++) {
      expect(state.sector).toBe(sec);
      applyAstralInput(state, { type: 'LAUNCH_COMET', angleDeg: 0 });
      // Position comet directly into Boss Core with massive chips to shatter boss
      state.comets[0].baseChips = 50000;
      state.comets[0].x = state.boss.coreX;
      state.comets[0].y = state.boss.coreY + 10;
      stepAstralState(state, ASTRAL_CONFIG.FIXED_STEP_MS);

      if (sec < 5) {
        expect(state.status).toBe('SECTOR_CLEARED');
        expect(state.relicChoices.length).toBeGreaterThan(0);
        applyAstralInput(state, {
          type: 'DRAFT_RELIC',
          relicId: state.relicChoices[0],
        });
        expect(state.status).toBe('AIMING');
      }
    }

    expect(state.status).toBe('VICTORY');
    expect(evaluateAstralVerdict(state).id).toBe('SINGULARITY_SOVEREIGN');
  });

  it('computes Relativistic Trajectory Previews, Oracle Launch Hints, and 3-Archetype Counterfactuals', () => {
    const state = createInitialAstralState(20261108, 'CAMPAIGN');
    const preview = computeTrajectoryPreview(state, -15, 60);
    expect(preview.length).toBeGreaterThan(10);

    const hint = computeOptimalLaunchHint(state);
    expect(hint.bestAngleDeg).toBeGreaterThanOrEqual(-60);
    expect(hint.bestAngleDeg).toBeLessThanOrEqual(60);
    expect(hint.expectedDamage).toBeGreaterThan(0);
    expect(hint.rationale.length).toBeGreaterThan(15);

    const cf = runAstralCounterfactuals(20261108);
    expect(cf).toHaveLength(3);
    expect(cf.map((c) => c.archetypeId)).toEqual([
      'SNIPER_PHYSICIST',
      'PRISM_ALCHEMIST',
      'PARRY_VIRTUOSO',
    ]);
  });

  it('persists career stats idempotently without double-counting completed runs', () => {
    const initialSave = loadAstralSave();
    const state = createInitialAstralState(20261108, 'CAMPAIGN');
    state.status = 'VICTORY';
    state.totalScore = 42000;
    state.totalSplitsTriggered = 6;

    const env1 = saveAstralState(initialSave.career, state);
    expect(env1.career.totalRunsCompleted).toBe(1);
    expect(env1.career.totalVictories).toBe(1);
    expect(env1.career.highScore).toBe(42000);

    // Saving the same terminal run a second time must not double-increment career counters
    const env2 = saveAstralState(env1.career, state);
    expect(env2.career.totalRunsCompleted).toBe(1);
    expect(env2.career.totalVictories).toBe(1);
  });

  it('mounts the interactive Canvas & HUD UI, reseeds, toggles debug, and destroys cleanly', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, { initialSeed: 20261108, debug: false });
    expect(container.querySelector('#ap-canvas')).not.toBeNull();
    expect(container.querySelectorAll('.ap-node-btn')).toHaveLength(6);

    instance.toggleDebug?.(true);
    instance.restartWithSeed?.(777888);
    const snap = instance.getStateSnapshot?.() as { seed: number };
    expect(snap.seed).toBe(777888);

    instance.destroy();
    expect(container.innerHTML).toBe('');
    container.remove();
  });
});
