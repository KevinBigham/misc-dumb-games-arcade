import { describe, expect, it, vi } from 'vitest';
import {
  ALL_INGREDIENTS_MAP,
  applyInput,
  boilIngredientIntoVortex,
  CONFIG,
  createDefaultCareerStats,
  createInitialState,
  deserializeDeliEnvelope,
  fuseTwoIngredients,
  getDifficultyForLevel,
  getTotalFlavorMagnitude,
  metadata,
  mountGame,
  serializeDeliEnvelope,
  servePatronBooth,
  sliceIngredientEntity,
  stepDeliState,
} from '../src/index';

describe('Game 11: The Metaphysical Deli — Surreal Physics & Alchemy Suite', () => {
  it('exposes valid ArgonGameMetadata for Game 11', () => {
    expect(metadata.id).toBe('11-metaphysical-deli');
    expect(metadata.number).toBe(11);
    expect(metadata.title).toContain('Metaphysical Deli');
  });

  it('allows The Third Hand to grab, move, fling, and dunk floating sentient ingredients', () => {
    const state = createInitialState(20261107);
    expect(state.ingredients.length).toBeGreaterThanOrEqual(4);
    expect(state.heldIngredientUid).toBeNull();

    // Grab nearest ingredient
    applyInput(state, { type: 'GRAB_OR_FLING' });
    expect(state.heldIngredientUid).not.toBeNull();

    const heldId = state.heldIngredientUid!;
    applyInput(state, { type: 'SET_HAND_POS', x: 400, y: 260 });
    const heldIng = state.ingredients.find((i) => i.uid === heldId)!;
    expect(heldIng.x).toBe(400);
    expect(heldIng.y).toBe(260);

    // Fling toward the Vortex
    applyInput(state, {
      type: 'GRAB_OR_FLING',
      targetX: CONFIG.VORTEX_X,
      targetY: CONFIG.VORTEX_Y,
    });
    expect(state.heldIngredientUid).toBeNull();
    expect(Math.hypot(heldIng.vx, heldIng.vy)).toBeGreaterThan(200);

    // Dunk nearest ingredient directly into the Primordial Broth Vortex
    const beforePotency = getTotalFlavorMagnitude(state.vortexFlavors);
    applyInput(state, { type: 'DUNK_NEAREST' });
    const afterPotency = getTotalFlavorMagnitude(state.vortexFlavors);
    expect(afterPotency).toBeGreaterThan(beforePotency);
  });

  it('bisects ingredients into twin sub-concepts with targeted flavor bonuses and shreds Red-Tape hazards', () => {
    const state = createInitialState(9999);
    const first = state.ingredients[0];
    const initialCount = state.ingredients.length;

    sliceIngredientEntity(state, first);
    expect(state.totalSlices).toBe(1);
    expect(state.ingredients.length).toBe(initialCount + 1);
    const halves = state.ingredients.filter((i) => i.isSlicedHalf);
    expect(halves.length).toBe(2);

    // Spawn a Bureaucratic Red-Tape Stamp hazard and slice it for +18 Ego Coins
    const hazardTmpl = ALL_INGREDIENTS_MAP.get('red_tape_stamp')!;
    const hazardEntity = {
      uid: state.nextEntityUid++,
      templateId: hazardTmpl.id,
      name: hazardTmpl.name,
      symbol: hazardTmpl.symbol,
      tier: hazardTmpl.tier,
      color: hazardTmpl.color,
      glowColor: hazardTmpl.glowColor,
      x: 300,
      y: 250,
      vx: 0,
      vy: 0,
      radius: hazardTmpl.radius,
      bounciness: hazardTmpl.bounciness,
      flavors: { ...hazardTmpl.flavors },
      slicedBonusAxis: hazardTmpl.slicedBonusAxis,
      isSlicedHalf: false,
      isGilded: false,
      isHazard: true,
      bounceCount: 0,
      whisper: hazardTmpl.whisper,
      whisperTimerMs: 1000,
      ageMs: 500,
    };
    state.ingredients.push(hazardEntity);
    const coinsBefore = state.egoCoins;
    sliceIngredientEntity(state, hazardEntity);
    expect(state.egoCoins).toBe(coinsBefore + 18);
  });

  it('splices two base ingredients into a Tier-2 Forbidden Hybrid and fuses Tier-2 into the Tier-3 Monolith Meatball', () => {
    const state = createInitialState(7777);
    const tooth = state.ingredients.find((i) => i.templateId === 'baby_tooth')!;
    const watch = state.ingredients.find((i) => i.templateId === 'melting_watch')!;
    expect(tooth).toBeDefined();
    expect(watch).toBeDefined();

    const hybrid = fuseTwoIngredients(state, tooth, watch);
    expect(hybrid).not.toBeNull();
    expect(hybrid!.templateId).toBe('deja_vu_brittle');
    expect(hybrid!.tier).toBe(2);
    expect(state.discoveredHybrids).toContain('deja_vu_brittle');

    // Now fuse the Tier-2 Déjà Vu Brittle with another ingredient -> Tier-3 Omega Monolith Meatball!
    const other = state.ingredients.find((i) => i.uid !== hybrid!.uid)!;
    const monolith = fuseTwoIngredients(state, hybrid!, other);
    expect(monolith).not.toBeNull();
    expect(monolith!.templateId).toBe('omega_monolith_meatball');
    expect(monolith!.tier).toBe(3);
    expect(state.discoveredHybrids).toContain('omega_monolith_meatball');
  });

  it('serves surreal patrons, builds digestion combos, advances Fever Tiers, and unlocks Victory at 12 patrons fed', () => {
    const state = createInitialState(4242);

    for (let i = 0; i < CONFIG.PATRONS_FOR_VICTORY; i++) {
      // Load up the Primordial Broth with high potency across all 4 axes
      state.vortexFlavors = {
        crunch: 80,
        nostalgia: 80,
        static: 80,
        chutzpah: 80,
      };
      const served = servePatronBooth(state, i % 3);
      expect(served).toBe(true);
    }

    expect(state.patronsFed).toBe(CONFIG.PATRONS_FOR_VICTORY);
    expect(state.victoryUnlocked).toBe(true);
    expect(state.comboMultiplier).toBeGreaterThan(1);
    expect(state.feverTier).toBeGreaterThan(1);
    expect(state.score).toBeGreaterThan(2000);
  });

  it('supports Vending Machine purchases and Paradox Time-Freeze', () => {
    const state = createInitialState(31415);
    state.egoCoins = 200;
    state.paradoxCharge = 80;

    applyInput(state, { type: 'PARADOX_FREEZE' });
    expect(state.paradoxFreezeMs).toBe(CONFIG.PARADOX_FREEZE_DURATION_MS);
    expect(state.paradoxCharge).toBe(0);

    const beforeIngCount = state.ingredients.length;
    applyInput(state, { type: 'VENDING_ACTION', item: 'SUMMON_ANOMALY' });
    expect(state.ingredients.length).toBe(beforeIngCount + 2);

    applyInput(state, { type: 'VENDING_ACTION', item: 'OVERCLOCK_PENDULUM' });
    expect(state.overclockPendulumMs).toBe(12000);

    applyInput(state, { type: 'VENDING_ACTION', item: 'POUR_LIQUID_FRIDAY' });
    expect(state.vortexFlavors.nostalgia).toBeGreaterThanOrEqual(40);

    applyInput(state, { type: 'VENDING_ACTION', item: 'INVERT_DECREE' });
    expect(state.goldenFeverMs).toBe(10000);
  });

  it('scales difficulty monotonically from Level 1 to Level 35 and enforces the Level 35 hard cap', () => {
    let prev = getDifficultyForLevel(1);
    for (let lv = 2; lv <= CONFIG.MAX_DIFFICULTY_LEVEL; lv++) {
      const curr = getDifficultyForLevel(lv);
      expect(curr.speedMultiplier).toBeGreaterThanOrEqual(prev.speedMultiplier);
      expect(curr.spawnIntervalMs).toBeLessThanOrEqual(prev.spawnIntervalMs);
      expect(curr.patronPatienceMs).toBeLessThanOrEqual(prev.patronPatienceMs);
      expect(curr.pendulumSpeedRadPerSec).toBeGreaterThanOrEqual(
        prev.pendulumSpeedRadPerSec
      );
      prev = curr;
    }

    const cap35 = getDifficultyForLevel(35);
    const beyond60 = getDifficultyForLevel(60);
    expect(beyond60.effectiveLevel).toBe(35);
    expect(beyond60.speedMultiplier).toBe(cap35.speedMultiplier);
    expect(beyond60.spawnIntervalMs).toBe(cap35.spawnIntervalMs);
  });

  it('steps deterministically for identical seeds and round-trips versioned persistence', () => {
    const runA = createInitialState(20261107);
    const runB = createInitialState(20261107);

    for (let step = 0; step < 25; step++) {
      if (step === 4) {
        applyInput(runA, { type: 'SLICE_PULSE' });
        applyInput(runB, { type: 'SLICE_PULSE' });
      }
      if (step === 10) {
        applyInput(runA, { type: 'TRANSMOGRIFY_SPLICE' });
        applyInput(runB, { type: 'TRANSMOGRIFY_SPLICE' });
      }
      if (step === 15) {
        applyInput(runA, { type: 'DUNK_NEAREST' });
        applyInput(runB, { type: 'DUNK_NEAREST' });
      }
      stepDeliState(runA, 100);
      stepDeliState(runB, 100);
    }

    expect(runA.rngState).toBe(runB.rngState);
    expect(runA.score).toBe(runB.score);
    expect(runA.vortexFlavors).toEqual(runB.vortexFlavors);
    expect(runA.ingredients).toEqual(runB.ingredients);

    const career = createDefaultCareerStats();
    career.highScore = 9500;
    const raw = serializeDeliEnvelope(career, runA);
    const restored = deserializeDeliEnvelope(raw);

    expect(restored).not.toBeNull();
    expect(restored!.career.highScore).toBe(9500);
    expect(restored!.activeRun?.seed).toBe(20261107);
    expect(restored!.activeRun?.vortexFlavors).toEqual(runA.vortexFlavors);

    // Also verify boiling directly updates vortexIngredientsCount
    const countBefore = restored!.activeRun!.vortexIngredientsCount;
    boilIngredientIntoVortex(
      restored!.activeRun!,
      restored!.activeRun!.ingredients[0]
    );
    expect(restored!.activeRun!.vortexIngredientsCount).toBe(countBefore + 1);
  });

  it('mounts the full interactive Canvas & DOM UI, reseeds, toggles debug, and destroys cleanly', () => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      quadraticCurveTo: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, {
      initialSeed: 20261107,
      debug: false,
    });

    expect(container.querySelector('#deli-canvas')).not.toBeNull();
    expect(container.querySelectorAll('.deli-booth-card')).toHaveLength(3);

    instance.toggleDebug?.(true);
    instance.restartWithSeed?.(888888);
    const snap = instance.getStateSnapshot?.() as { seed: number };
    expect(snap.seed).toBe(888888);

    instance.destroy();
    expect(container.innerHTML).toBe('');
    container.remove();
  });
});
