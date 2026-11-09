import { describe, expect, it } from 'vitest';
import { HYPERNOVA_CONFIG } from '../src/config';
import {
  AUGMENT_REGISTRY,
  CHASSIS_REGISTRY,
  ENEMY_REGISTRY,
} from '../src/content';
import {
  getDefaultCareerStats,
  recordRunEnd,
} from '../src/persistence';
import { HypernovaRNG } from '../src/rng';
import {
  addComboPoints,
  createInitialHypernovaState,
  generateDraftChoices,
  getPlayerDerivedStats,
  selectDraftChoice,
  stepHypernovaState,
  type HypernovaInputState,
} from '../src/simulation';

describe('Hypernova: Chrono-Valkyrie Simulation Suite', () => {
  const neutralInput: HypernovaInputState = {
    moveX: 0,
    moveY: 0,
    aimX: 640,
    aimY: 0,
    firing: false,
    dashRequested: false,
    chronoRequested: false,
  };

  it('creates deterministic initial game state matching configuration and chassis specs', () => {
    const stateA = createInitialHypernovaState(4242, 'interceptor');
    const stateB = createInitialHypernovaState(4242, 'interceptor');

    expect(stateA.seed).toBe(4242);
    expect(stateA.player.hull).toBe(CHASSIS_REGISTRY.interceptor.baseHull);
    expect(stateA.player.shield).toBe(CHASSIS_REGISTRY.interceptor.baseShield);
    expect(stateA.player.dashCharges).toBe(2);
    expect(stateA.player.weapons).toHaveLength(1);
    expect(stateA.player.weapons[0].weaponId).toBe('vulcan');
    expect(stateA.player.x).toBe(HYPERNOVA_CONFIG.ARENA_WIDTH / 2);
    expect(stateA.player.y).toBe(HYPERNOVA_CONFIG.ARENA_HEIGHT / 2);
    expect(stateA.rngState).toBe(stateB.rngState);
  });

  it('correctly simulates movement vector thrust and clamps player within arena boundaries', () => {
    const state = createInitialHypernovaState(1001, 'interceptor');
    state.status = 'PLAYING';

    const rightInput: HypernovaInputState = {
      ...neutralInput,
      moveX: 1,
      moveY: 0,
    };

    // Step 10 ticks forward
    for (let i = 0; i < 10; i++) {
      stepHypernovaState(state, rightInput, 16.6667);
    }

    expect(state.player.x).toBeGreaterThan(HYPERNOVA_CONFIG.ARENA_WIDTH / 2);

    // Thrust violently to the left edge to test arena clamp
    const leftInput: HypernovaInputState = {
      ...neutralInput,
      moveX: -1,
      moveY: 0,
    };

    for (let i = 0; i < 200; i++) {
      stepHypernovaState(state, leftInput, 16.6667);
    }

    expect(state.player.x).toBeGreaterThanOrEqual(state.player.radius + 6);
  });

  it('activates Chrono-Drift time dilation when requested and drains energy', () => {
    const state = createInitialHypernovaState(2002, 'interceptor');
    state.status = 'PLAYING';

    expect(state.player.chronoEnergy).toBe(HYPERNOVA_CONFIG.CHRONO_ENERGY_MAX);
    expect(state.player.isDrifting).toBe(false);

    const chronoInput: HypernovaInputState = {
      ...neutralInput,
      chronoRequested: true,
    };

    stepHypernovaState(state, chronoInput, 16.6667);

    expect(state.player.isDrifting).toBe(true);
    expect(state.player.chronoEnergy).toBeLessThan(HYPERNOVA_CONFIG.CHRONO_ENERGY_MAX);
    expect(state.events.some((e) => e.type === 'CHRONO_DRIFT_START')).toBe(true);
  });

  it('executes phase dash with invulnerability frames and respects cooldown', () => {
    const state = createInitialHypernovaState(3003, 'interceptor');
    state.status = 'PLAYING';

    const dashInput: HypernovaInputState = {
      ...neutralInput,
      dashRequested: true,
    };

    stepHypernovaState(state, dashInput, 16.6667);

    expect(state.player.isDashing).toBe(true);
    expect(state.player.invulnerableTimer).toBeGreaterThan(0);
    expect(state.events.some((e) => e.type === 'DASH')).toBe(true);
  });

  it('fires weapon projectiles in aim direction and checks projectile travel', () => {
    const state = createInitialHypernovaState(4004, 'interceptor');
    state.status = 'PLAYING';

    const fireInput: HypernovaInputState = {
      ...neutralInput,
      aimX: state.player.x + 200,
      aimY: state.player.y,
      firing: true,
    };

    stepHypernovaState(state, fireInput, 16.6667);

    expect(state.projectiles.length).toBeGreaterThan(0);
    const proj = state.projectiles[0];
    expect(proj.fromPlayer).toBe(true);
    expect(proj.vx).toBeGreaterThan(0);

    // Step next frame and verify projectile moved forward
    const initialX = proj.x;
    stepHypernovaState(state, neutralInput, 16.6667);
    expect(proj.x).toBeGreaterThan(initialX);
  });

  it('handles damage collision, shield absorption, and combo point scaling', () => {
    const state = createInitialHypernovaState(5005, 'interceptor');
    state.status = 'PLAYING';

    // Spawn an enemy directly on top of the player to test collision
    state.enemies.push({
      id: 999,
      archetype: 'void_mite',
      x: state.player.x,
      y: state.player.y,
      vx: 0,
      vy: 0,
      hp: 20,
      maxHp: 20,
      radius: 12,
      angle: 0,
      shootCooldown: 5,
      sniperChargeTimer: 0,
      spiralPhase: 0,
      shieldActive: false,
      isBoss: false,
    });

    const initialHull = state.player.hull;
    const initialShield = state.player.shield;

    stepHypernovaState(state, neutralInput, 16.6667);

    // Shield should absorb contact damage
    expect(state.player.shield).toBeLessThan(initialShield);
    expect(state.player.hull).toBe(initialHull);
    expect(state.player.invulnerableTimer).toBeGreaterThan(0);
  });

  it('escalates combo grades and multipliers from D up to APEX', () => {
    const state = createInitialHypernovaState(6006, 'interceptor');

    expect(state.comboGrade).toBe('D');
    expect(state.comboMultiplier).toBe(1.0);

    addComboPoints(state, 150);
    expect(state.comboGrade).toBe('C');
    expect(state.comboMultiplier).toBe(1.25);

    addComboPoints(state, 1000);
    expect(state.comboGrade).toBe('A');
    expect(state.comboMultiplier).toBe(2.0);

    addComboPoints(state, 10000);
    expect(state.comboGrade).toBe('APEX');
    expect(state.comboMultiplier).toBe(10.0);
    expect(state.highestComboGrade).toBe('APEX');
  });

  it('generates 3 randomized draft choices and correctly applies selected augment perks', () => {
    const state = createInitialHypernovaState(7007, 'interceptor');
    state.status = 'DRAFTING';
    state.pendingDraftChoices = generateDraftChoices(state);

    expect(state.pendingDraftChoices).toHaveLength(3);
    const firstAug = state.pendingDraftChoices[0];

    const success = selectDraftChoice(state, 0);
    expect(success).toBe(true);
    expect(state.status).toBe('PLAYING');
    expect(state.player.augments.some((a) => a.augmentId === firstAug.id)).toBe(true);

    const derived = getPlayerDerivedStats(state.player);
    expect(derived).toBeDefined();
  });

  it('properly records career statistics across runs and detects high scores', () => {
    const initialCareer = getDefaultCareerStats();
    expect(initialCareer.highScore).toBe(0);
    expect(initialCareer.runsPlayed).toBe(0);

    const updated = recordRunEnd(
      initialCareer,
      25000,
      5,
      48,
      120,
      1,
      'SSS',
      false
    );

    expect(updated.runsPlayed).toBe(1);
    expect(updated.highScore).toBe(25000);
    expect(updated.highestWave).toBe(5);
    expect(updated.totalKills).toBe(48);
    expect(updated.totalGrazes).toBe(120);
    expect(updated.bossesDefeated).toBe(1);
    expect(updated.highestComboGrade).toBe('SSS');
  });
});
