import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AegisAudioEngine } from '../src/audio';
import {
  AEGIS_CONFIG,
  AUGMENT_POOL,
  LOADOUT_CHASSIS,
  WAVE_SCHEDULE,
  buildRunTelemetryRecord,
  createDefaultSaveData,
  createInitialSimulationState,
  getCameraShakeOffset,
  metadata,
  mountGame,
  recordCompletedRun,
  selectAugment,
  selectLoadoutChassis,
  spawnEnemy,
  spawnFluxGem,
  stepSimulation,
  triggerShatterOrDash,
  type PlayerInputState,
} from '../src/index';

const IDLE_INPUT: PlayerInputState = {
  moveX: 0,
  moveY: 0,
  aimX: 480,
  aimY: 120,
  dashOrShatterPressed: false,
};

describe('Game 13 — Aegis-Zero: Graze Overclock (Director’s Cut Suite)', () => {
  beforeEach(() => {
    localStorage.clear();
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
      translate: vi.fn(),
      rotate: vi.fn(),
      setLineDash: vi.fn(),
      fillText: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('1. boots immediately into active Wave 1 gameplay on Frame 1 (Zero tutorial text walls)', () => {
    const state = createInitialSimulationState(20261108, 'vanguard-zero');
    expect(state.status).toBe('playing');
    expect(state.wave).toBe(1);
    expect(state.enemies.length).toBeGreaterThanOrEqual(3);
    expect(state.bullets.some((b) => !b.isPlayer)).toBe(true);
    expect(metadata.id).toBe('13-aegis-zero');
    expect(AUGMENT_POOL.length).toBe(16);
    expect(LOADOUT_CHASSIS.length).toBe(3);
    expect(WAVE_SCHEDULE.length).toBe(8);
  });

  it('2. is 100% deterministic across identical seeds and input sequences', () => {
    const stateA = createInitialSimulationState(999111, 'vanguard-zero');
    const stateB = createInitialSimulationState(999111, 'vanguard-zero');

    for (let i = 0; i < 120; i++) {
      const inp: PlayerInputState = {
        moveX: i % 2 === 0 ? 0.5 : -0.25,
        moveY: -0.4,
        aimX: 400 + i,
        aimY: 150,
        dashOrShatterPressed: i === 45,
      };
      stepSimulation(stateA, inp, AEGIS_CONFIG.FIXED_DT);
      stepSimulation(stateB, inp, AEGIS_CONFIG.FIXED_DT);
    }

    expect(stateA.player.x).toBe(stateB.player.x);
    expect(stateA.player.y).toBe(stateB.player.y);
    expect(stateA.score).toBe(stateB.score);
    expect(stateA.bullets.length).toBe(stateB.bullets.length);
    expect(stateA.rng.getState()).toBe(stateB.rng.getState());
  });

  it('3. enforces The Signature Twist: Grazing within the 44px Halo charges Overclock and fires Rail-Volleys', () => {
    const state = createInitialSimulationState(20261108, 'vanguard-zero');
    state.bullets = [];
    state.player.overclock = 10;
    state.player.grazeFireCooldownS = 0;

    // Spawn an enemy bullet 24px away from the player (outside 7px lethal core, inside 44px+ Graze Halo)
    state.bullets.push({
      id: 9001,
      isPlayer: false,
      x: state.player.x + 24,
      y: state.player.y,
      vx: 0,
      vy: 10,
      radius: 5,
      damage: 14,
      isCrit: false,
      pierceLeft: 0,
      ricochetLeft: 0,
      homing: false,
      grazedByPlayer: false,
      grazedTickCooldown: 0,
      color: '#fb7185',
      ageS: 0,
      maxAgeS: 5,
    });

    stepSimulation(state, IDLE_INPUT, AEGIS_CONFIG.FIXED_DT);

    expect(state.player.isCurrentlyGrazing).toBe(true);
    expect(state.bulletsGrazed).toBeGreaterThanOrEqual(1);
    expect(state.player.overclock).toBeGreaterThan(10);
    // Player automatically fired a graze volley in response!
    expect(state.bullets.some((b) => b.isPlayer)).toBe(true);
    expect(state.lightningArcs.length).toBeGreaterThan(0);
  });

  it('4. executes Phase-Shatter Nova at >=30% Overclock, vaporizing nearby enemy bullets & spawning Braid Twins', () => {
    const state = createInitialSimulationState(20261108, 'phantom-braid');
    state.player.overclock = 65;

    // Place 4 enemy bullets inside Shatter radius
    for (let i = 0; i < 4; i++) {
      state.bullets.push({
        id: 8000 + i,
        isPlayer: false,
        x: state.player.x + 30 + i * 5,
        y: state.player.y,
        vx: 0,
        vy: 0,
        radius: 5,
        damage: 12,
        isCrit: false,
        pierceLeft: 0,
        ricochetLeft: 0,
        homing: false,
        grazedByPlayer: false,
        grazedTickCooldown: 0,
        color: '#fb7185',
        ageS: 0,
        maxAgeS: 5,
      });
    }

    const didShatter = triggerShatterOrDash(state, {
      ...IDLE_INPUT,
      dashOrShatterPressed: true,
    });

    expect(didShatter).toBe(true);
    expect(state.player.overclock).toBe(0);
    expect(state.bulletsShattered).toBeGreaterThanOrEqual(4);
    // Phantom-Braid starts with Braid Worldline Twin augment
    expect(state.temporalGhosts.length).toBe(1);
    expect(state.hitstopMs).toBeGreaterThanOrEqual(AEGIS_CONFIG.HITSTOP_HEAVY_MS);
  });

  it('5. implements Scarce Resource Risk-Reward: 1.5s Supercritical Flux Gems vs. 4.0s Decay Shrapnel Detonation', () => {
    const state = createInitialSimulationState(20261108, 'vanguard-zero');
    state.enemies = [];
    state.bullets = [];

    // 1) Collect a White-Hot Supercritical Gem (< 1.5s) right on the player
    spawnFluxGem(state, state.player.x, state.player.y, 40);
    stepSimulation(state, IDLE_INPUT, AEGIS_CONFIG.FIXED_DT);
    expect(state.supercriticalGemsCollected).toBe(1);
    expect(state.xp).toBeGreaterThanOrEqual(80); // 2x supercritical bonus!

    // 2) Spawn a distant Gem and age it past 4.0s so it detonates into shrapnel
    spawnFluxGem(state, 100, 100, 40);
    const distantGem = state.fluxGems[0]!;
    distantGem.ageS = distantGem.maxAgeS + 0.05;
    const bulletsBefore = state.bullets.length;
    stepSimulation(state, IDLE_INPUT, AEGIS_CONFIG.FIXED_DT);

    expect(state.expiredGemsDetonated).toBe(1);
    expect(state.bullets.length).toBe(bulletsBefore + AEGIS_CONFIG.GEM_SHRAPNEL_COUNT_ON_DECAY);
  });

  it('6. verifies Hitstop (40ms heavy / 120ms Boss kill) and quadratic trauma² screenshake', () => {
    const state = createInitialSimulationState(20261108, 'vanguard-zero');
    state.trauma = 0.5;
    state.cameraPhase = 1.0;

    const shakeHalf = getCameraShakeOffset(state);
    expect(shakeHalf.shakeIntensity).toBeCloseTo(0.25, 5); // 0.5² = 0.25

    // Spawn Boss and deal lethal damage via player bullet
    const boss = spawnEnemy(state, 'hex-warden-boss', 300, 200);
    boss.hp = 10;
    state.bullets.push({
      id: 7777,
      isPlayer: true,
      x: 300,
      y: 200,
      vx: 0,
      vy: 0,
      radius: 8,
      damage: 50,
      isCrit: true,
      pierceLeft: 0,
      ricochetLeft: 0,
      homing: false,
      grazedByPlayer: false,
      grazedTickCooldown: 0,
      color: '#fde047',
      ageS: 0,
      maxAgeS: 2,
    });

    stepSimulation(state, IDLE_INPUT, AEGIS_CONFIG.FIXED_DT);
    expect(state.hitstopMs).toBe(AEGIS_CONFIG.HITSTOP_BOSS_KILL_MS); // 120ms boss kill freeze!
    expect(state.trauma).toBeGreaterThan(0.8);
  });

  it('7. supports 3-Choice Augment Draft, Versioned Persistence, and 4-Track Adaptive Audio', () => {
    const state = createInitialSimulationState(20261108, 'vanguard-zero');
    state.xp = state.xpToNextLevel + 10;
    spawnFluxGem(state, state.player.x, state.player.y, 20);
    stepSimulation(state, IDLE_INPUT, AEGIS_CONFIG.FIXED_DT);

    expect(state.status).toBe('draft');
    expect(state.draftChoices).toHaveLength(3);

    const pickedOk = selectAugment(state, 1);
    expect(pickedOk).toBe(true);
    expect(state.status).toBe('playing');

    // Persistence anti-double-reward check
    let save = createDefaultSaveData();
    state.score = 16500;
    state.status = 'victory';
    const record = buildRunTelemetryRecord(state);

    save = recordCompletedRun(save, record);
    expect(save.totalRuns).toBe(1);
    expect(save.bestScore).toBe(16500);
    expect(save.unlockedLoadoutIds).toContain('phantom-braid');
    expect(save.unlockedLoadoutIds).toContain('blood-seraph');

    // Recording exact same runKey again must NOT double-credit
    save = recordCompletedRun(save, record);
    expect(save.totalRuns).toBe(1);

    save = selectLoadoutChassis(save, 'blood-seraph');
    expect(save.selectedLoadoutId).toBe('blood-seraph');

    // 4-Track Adaptive Audio intensity scaling
    const audio = new AegisAudioEngine();
    audio.updateMusicIntensity({
      comboMultiplier: 8,
      overclockPct: 85,
      isBossActive: true,
      wave: 8,
      isPaused: false,
    });
    const tel = audio.getMusicTelemetry();
    expect(tel.bpm).toBeGreaterThan(135);
    expect(tel.activeTracks).toEqual([true, true, true, true]);
    audio.destroy();
  });

  it('8. mounts full responsive Canvas UI, handles reseed & debug toggle, and destroys cleanly', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, { initialSeed: 20261108, debug: false });
    expect(container.querySelector('#aegis-canvas')).not.toBeNull();

    instance.toggleDebug?.(true);
    instance.restartWithSeed?.(777888);
    const snap = instance.getStateSnapshot?.() as { seed: number };
    expect(snap.seed).toBe(777888);

    instance.destroy();
    expect(container.innerHTML).toBe('');
    container.remove();
  });
});
