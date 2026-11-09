import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  comboToPentatonicFreq,
  createInitialVoltLashState,
  damageEnemy,
  FIXED_DT_MS,
  InputSnapshot,
  isRedlined,
  mountGame,
  parryProjectile,
  PENTATONIC_SCALE_HZ,
  selectUpgrade,
  spawnEnemy,
  stepVoltLashState,
  triggerBankOrOverdrive,
  triggerDashParry,
  VoltLashAudioEngine,
} from '../src/index';

const IDLE_INPUT: InputSnapshot = {
  moveX: 0,
  moveY: 0,
  aimX: 600,
  aimY: 200,
  dashPressed: false,
  bankPressed: false,
};

describe('AEGIS: VOLT-LASH — Simulation, Synergies, Audio & UI Verification Suite', () => {
  beforeEach(() => {
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
      scale: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      setLineDash: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('produces 100% deterministic simulation steps for identical seeds and inputs', () => {
    const stateA = createInitialVoltLashState(9001);
    const stateB = createInitialVoltLashState(9001);

    for (let step = 0; step < 60; step++) {
      const input: InputSnapshot = {
        moveX: step % 2 === 0 ? 1 : 0,
        moveY: -0.5,
        aimX: 400 + step * 3,
        aimY: 220,
        dashPressed: step === 10,
        bankPressed: false,
      };
      stepVoltLashState(stateA, input, FIXED_DT_MS);
      stepVoltLashState(stateB, input, FIXED_DT_MS);
    }

    expect(stateA.rngState).toBe(stateB.rngState);
    expect(stateA.player.x).toBe(stateB.player.x);
    expect(stateA.player.y).toBe(stateB.player.y);
    expect(stateA.enemies.length).toBe(stateB.enemies.length);
    expect(stateA.tethers.length).toBe(stateB.tethers.length);
    expect(stateA.score).toBe(stateB.score);
  });

  it('starts immediately in PLAYING state and fades out the 1-line world prompt once player moves and dashes', () => {
    const state = createInitialVoltLashState(20261108);
    expect(state.status).toBe('PLAYING');
    expect(state.enemies.length).toBeGreaterThanOrEqual(3);
    expect(state.tutorialPromptAlpha).toBe(1.0);

    // Move and Dash
    stepVoltLashState(
      state,
      { moveX: 1, moveY: 0, aimX: 800, aimY: 360, dashPressed: true, bankPressed: false },
      FIXED_DT_MS
    );
    expect(state.hasMoved).toBe(true);
    expect(state.hasDashed).toBe(true);

    // Clear hit-stop and step so prompt alpha decays
    state.hitStopMs = 0;
    for (let i = 0; i < 30; i++) {
      stepVoltLashState(
        state,
        { moveX: 1, moveY: 0, aimX: 800, aimY: 360, dashPressed: false, bankPressed: false },
        FIXED_DT_MS
      );
    }
    expect(state.tutorialPromptAlpha).toBeLessThan(1.0);
  });

  it('enforces the Greed vs. Safety Volt-Surge loop: Grazing, Banking (+30 HP), Redline penalty, and 100% Supernova', () => {
    const state = createInitialVoltLashState(4242);
    state.enemies = []; // isolate projectile graze test

    // Spawn an enemy projectile inside the outer graze ring (radius 42) but outside hull radius (13)
    state.projectiles.push({
      id: 999,
      x: state.player.x + 28,
      y: state.player.y,
      vx: 0,
      vy: -0.1,
      radius: 6,
      damage: 20,
      isPlayerOwned: false,
      isParried: false,
      isHoming: false,
      pierceCount: 0,
      lifeMs: 1000,
      maxLifeMs: 1000,
      color: '#fb7185',
      sourceName: 'Test Drone',
      grazed: false,
      trail: [],
    });

    stepVoltLashState(state, IDLE_INPUT, FIXED_DT_MS);
    expect(state.totalGrazes).toBe(1);
    expect(state.surge).toBeGreaterThanOrEqual(8);
    expect(state.combo).toBeGreaterThanOrEqual(1);
    expect(state.player.hp).toBe(100);

    // Test Safety Cash-Out (Bank Surge at 50% heals +30 HP and clears nearby enemy bullets)
    state.player.hp = 60;
    state.surge = 50;
    state.combo = 6;
    const banked = triggerBankOrOverdrive(state);
    expect(banked).toBe(true);
    expect(state.player.hp).toBe(90);
    expect(state.surge).toBe(0);
    expect(state.combo).toBe(0);

    // Test Redline Risk Penalty (>= 80% Surge deals +50% hull damage)
    state.player.invulnMs = 0;
    state.player.hp = 100;
    state.surge = 85;
    expect(isRedlined(state)).toBe(true);

    // Direct hit on player while Redlined (base damage 20 -> 30 damage)
    state.projectiles.push({
      id: 1000,
      x: state.player.x,
      y: state.player.y,
      vx: 0,
      vy: 0,
      radius: 6,
      damage: 20,
      isPlayerOwned: false,
      isParried: false,
      isHoming: false,
      pierceCount: 0,
      lifeMs: 500,
      maxLifeMs: 500,
      color: '#fb7185',
      sourceName: 'Rail Sniper — Rail Beam',
      grazed: true,
      trail: [],
    });
    state.hitStopMs = 0;
    stepVoltLashState(state, IDLE_INPUT, FIXED_DT_MS);
    expect(state.player.hp).toBe(70); // 100 - 20 * 1.5 = 70

    // Test 100% Surge Supernova Overdrive Gambit
    state.surge = 100;
    state.combo = 9;
    const supernova = triggerBankOrOverdrive(state);
    expect(supernova).toBe(true);
    expect(state.player.overdriveMs).toBe(4500);
    expect(state.combo).toBeGreaterThanOrEqual(9); // Preserves combo on 100% Supernova!
  });

  it('telegraphs enemy attacks for >= 500ms before firing and triggers micro hit-stop on parries', () => {
    const state = createInitialVoltLashState(777);
    state.enemies = [];
    const sniper = spawnEnemy(state, 'sniper', 300, 200);
    sniper.cooldownMs = 0;

    stepVoltLashState(state, IDLE_INPUT, FIXED_DT_MS);
    expect(sniper.telegraph.type).toBe('laser_line');
    expect(sniper.telegraph.durationMs).toBeGreaterThanOrEqual(500);
    expect(state.projectiles.filter((p) => !p.isPlayerOwned).length).toBe(0);

    // Advance past the 620ms telegraph wind-up
    for (let i = 0; i < 42; i++) {
      stepVoltLashState(state, IDLE_INPUT, FIXED_DT_MS);
    }
    const enemyBullet = state.projectiles.find((p) => !p.isPlayerOwned);
    expect(enemyBullet).toBeDefined();

    // Parry the projectile and verify micro hit-stop & ownership conversion
    if (enemyBullet) {
      parryProjectile(state, enemyBullet, state.player.x, state.player.y);
      expect(enemyBullet.isPlayerOwned).toBe(true);
      expect(enemyBullet.isParried).toBe(true);
      expect(state.hitStopMs).toBeGreaterThanOrEqual(30);
    }
  });

  it('triggers transformative upgrade synergies: Prism Shatter-Parry, Singularity Implosion, and Triangle Cage', () => {
    const state = createInitialVoltLashState(5555);
    state.upgrades.push('parry_shards', 'kill_implosion', 'triangle_cage');
    state.enemies = [];

    const target = spawnEnemy(state, 'drifter', 620, 320);

    // 1. Prism Shatter-Parry splits a parried bullet into +3 homing shards
    const incoming = {
      id: 501,
      x: state.player.x + 10,
      y: state.player.y,
      vx: -0.2,
      vy: 0,
      radius: 6,
      damage: 14,
      isPlayerOwned: false,
      isParried: false,
      isHoming: false,
      pierceCount: 0,
      lifeMs: 1000,
      maxLifeMs: 1000,
      color: '#fb7185',
      sourceName: 'Drifter',
      grazed: false,
      trail: [],
    };
    state.projectiles.push(incoming);
    parryProjectile(state, incoming, state.player.x, state.player.y);
    // 1 original parried bolt + 3 spawned Prism Shards = 4 player-owned parried projectiles
    expect(state.projectiles.filter((p) => p.isParried).length).toBe(4);

    // 2. Singularity Implosion spawns a gravity vortex when an enemy is killed
    damageEnemy(state, target, 999, state.player.x, state.player.y, 'Parry Shard');
    expect(state.vortices.length).toBe(1);

    // 3. Triangle Cage Protocol damages enemies inside sequential dash tethers
    const cagedEnemy = spawnEnemy(state, 'charger', state.player.x + 60, state.player.y - 30);
    const initialHp = cagedEnemy.hp;
    state.player.dashCooldownMs = 0;
    triggerDashParry(state, {
      moveX: 1,
      moveY: 0,
      aimX: state.player.x + 150,
      aimY: state.player.y,
      dashPressed: true,
      bankPressed: false,
    });
    state.player.dashCooldownMs = 0;
    triggerDashParry(state, {
      moveX: -0.5,
      moveY: -1,
      aimX: state.player.x - 80,
      aimY: state.player.y - 150,
      dashPressed: true,
      bankPressed: false,
    });
    expect(cagedEnemy.hp).toBeLessThan(initialHp);
    expect(state.events.some((e) => e.type === 'TRIANGLE_CAGE')).toBe(true);
  });

  it('scales procedural Web Audio combo pitch up a pentatonic scale and toggles mute cleanly', () => {
    const lowFreq = comboToPentatonicFreq(0);
    const midFreq = comboToPentatonicFreq(4);
    const highFreq = comboToPentatonicFreq(11);
    expect(lowFreq).toBe(PENTATONIC_SCALE_HZ[0]);
    expect(midFreq).toBeGreaterThan(lowFreq);
    expect(highFreq).toBeGreaterThan(midFreq);

    const audio = new VoltLashAudioEngine();
    expect(audio.isMuted()).toBe(false);
    expect(audio.toggleMute()).toBe(true);
    expect(audio.isMuted()).toBe(true);
    audio.destroy();
  });

  it('mounts cleanly into DOM, handles upgrade drafting & instant restart, and cleans up on destroy()', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, { initialSeed: 20261108, debug: true });
    expect(container.querySelector('canvas')).not.toBeNull();
    expect(container.textContent).toContain('VOLT-SURGE');

    const snap1 = instance.getStateSnapshot?.() as ReturnType<typeof createInitialVoltLashState>;
    expect(snap1.seed).toBe(20261108);

    instance.restartWithSeed?.(123456);
    const snap2 = instance.getStateSnapshot?.() as ReturnType<typeof createInitialVoltLashState>;
    expect(snap2.seed).toBe(123456);

    // Verify selectUpgrade works deterministically
    snap2.status = 'DRAFT_UPGRADE';
    snap2.draftChoices = ['tether_lightning', 'parry_shards', 'kill_implosion'];
    expect(selectUpgrade(snap2, 1)).toBe(true);
    expect(snap2.upgrades).toContain('parry_shards');
    expect(snap2.status).toBe('PLAYING');

    instance.toggleDebug?.(false);
    instance.destroy();
    expect(container.innerHTML).toBe('');
    container.remove();
  });
});
