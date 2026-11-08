import { describe, expect, it } from 'vitest';
import {
  applyBuildCommand,
  BLOCKS,
  createInitialState,
  deserializeGameState,
  diagnoseBottlenecks,
  getTile,
  isBlockUnlocked,
  ITEMS,
  metadata,
  mountGame,
  serializeGameState,
  spawnEnemy,
  stepFactoryTick,
  stepWaveCombat,
  triggerNextWave,
  unlockTechForWave,
} from '../src/index';

describe('Game 09: Belt & Bolt — Core Factory & Wave Defense Suite', () => {
  it('1. Producer -> Conveyor -> Core delivery increments Core credits and quota progress', () => {
    const state = createInitialState({ seed: 42 });
    const startCredits = state.credits;
    const startQuota = state.quotaProgress;

    // Core is at (5, 5). Place Miner at (3, 5) on copper_vein -> Belt at (4, 5) -> Core at (5, 5)
    const r1 = applyBuildCommand(state, {
      type: 'place',
      x: 3,
      y: 5,
      blockType: 'miner',
      direction: 'E',
      free: true,
    });
    const r2 = applyBuildCommand(state, {
      type: 'place',
      x: 4,
      y: 5,
      blockType: 'belt',
      direction: 'E',
      free: true,
    });

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);

    // Tick 1: Miner extracts CuCircle and places it onto Belt (4, 5)
    stepFactoryTick(state);
    const beltTile = getTile(state, 4, 5)!;
    expect(beltTile.item).not.toBeNull();
    expect(beltTile.item?.type).toBe('CuCircle');
    expect(state.stats.itemsDeliveredToCore).toBe(0);

    // Tick 2: Belt (4, 5) transfers CuCircle into Core (5, 5)
    stepFactoryTick(state);
    expect(state.stats.itemsDeliveredToCore).toBe(1);
    expect(state.credits).toBe(startCredits + ITEMS.CuCircle.creditValue);
    expect(state.quotaProgress).toBe(startQuota + ITEMS.CuCircle.quotaValue);
    expect(state.coreInventory.CuCircle).toBe(1);
  });

  it('2. Downstream belt congestion/backpressure stops upstream transfer without deleting items', () => {
    const state = createInitialState({ seed: 42 });

    // Place Miner at (1, 1) -> Belt A at (2, 1) -> Belt B at (3, 1) -> Wall at (4, 1) (blocked dead-end)
    applyBuildCommand(state, {
      type: 'place',
      x: 1,
      y: 1,
      blockType: 'miner',
      direction: 'E',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 2,
      y: 1,
      blockType: 'belt',
      direction: 'E',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 3,
      y: 1,
      blockType: 'belt',
      direction: 'E',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 4,
      y: 1,
      blockType: 'wall',
      free: true,
    });

    // Run 6 ticks so the line completely fills and backs up
    for (let i = 0; i < 6; i++) {
      stepFactoryTick(state);
    }

    const miner = getTile(state, 1, 1)!;
    const beltA = getTile(state, 2, 1)!;
    const beltB = getTile(state, 3, 1)!;

    // Both belts and the miner must still hold their items (nothing deleted) and report congestion
    expect(beltB.item).not.toBeNull();
    expect(beltA.item).not.toBeNull();
    expect(miner.item).not.toBeNull();
    expect(beltB.congested).toBe(true);
    expect(beltA.congested).toBe(true);
    expect(miner.congested).toBe(true);

    const firstIdOnBeltB = beltB.item!.id;
    const firstIdOnBeltA = beltA.item!.id;

    // Step another tick while still blocked: exact same item IDs remain in place
    stepFactoryTick(state);
    expect(beltB.item!.id).toBe(firstIdOnBeltB);
    expect(beltA.item!.id).toBe(firstIdOnBeltA);

    const report = diagnoseBottlenecks(state);
    expect(report.congestedTiles.length).toBeGreaterThanOrEqual(3);
  });

  it('3. Splitter alternates outputs 50/50 between two open downstream paths', () => {
    const state = createInitialState({ seed: 42 });

    // Place Miner at (1, 5) -> Splitter at (2, 5)
    // Two open downstream Buffer Silos at North (2, 4) and South (2, 6)
    applyBuildCommand(state, {
      type: 'place',
      x: 1,
      y: 5,
      blockType: 'miner',
      direction: 'E',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 2,
      y: 5,
      blockType: 'splitter',
      direction: 'N',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 2,
      y: 4,
      blockType: 'silo',
      direction: 'N',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 2,
      y: 6,
      blockType: 'silo',
      direction: 'S',
      free: true,
    });

    // Step 11 ticks: Tick 1 loads splitter, Ticks 2..11 route 10 items through the splitter
    for (let i = 0; i < 11; i++) {
      stepFactoryTick(state);
    }

    const northSilo = getTile(state, 2, 4)!;
    const southSilo = getTile(state, 2, 6)!;

    expect(northSilo.inputBuffer.length).toBe(5);
    expect(southSilo.inputBuffer.length).toBe(5);
  });

  it('4. Smelter transforms raw ore into refined shape/ammo with higher value and turret damage', () => {
    const state = createInitialState({ seed: 42 });
    const initialCredits = state.credits;

    // Iron vein is at (5, 3). Place Miner at (5, 3) facing W -> Smelter at (4, 3) facing S -> Belt at (4, 4) facing S -> Belt at (4, 5) facing E -> Core at (5, 5)
    applyBuildCommand(state, {
      type: 'place',
      x: 5,
      y: 3,
      blockType: 'miner',
      direction: 'W',
      produceOverride: 'FeSquare',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 4,
      y: 3,
      blockType: 'smelter',
      direction: 'S',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 4,
      y: 4,
      blockType: 'belt',
      direction: 'S',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 4,
      y: 5,
      blockType: 'belt',
      direction: 'E',
      free: true,
    });

    // Verify refined BoltedAlloy has 2x credit value and 2.5x turret damage multiplier
    expect(ITEMS.BoltedAlloy.creditValue).toBe(ITEMS.FeSquare.creditValue * 2);
    expect(ITEMS.BoltedAlloy.damageMultiplier).toBe(2.5);

    // Run 4 ticks for FeSquare to be mined, refined into BoltedAlloy, and delivered to Core
    for (let i = 0; i < 4; i++) {
      stepFactoryTick(state);
    }

    expect(state.stats.itemsRefined).toBeGreaterThanOrEqual(1);
    expect(state.coreInventory.BoltedAlloy).toBeGreaterThanOrEqual(1);
    expect(state.credits).toBeGreaterThanOrEqual(
      initialCredits + ITEMS.BoltedAlloy.creditValue
    );
  });

  it('5. Turrets only fire when supplied with ammo via adjacent belt/buffer and damage incoming wave enemies', () => {
    const state = createInitialState({ seed: 42 });

    // Place a Bolt Turret at (8, 5) with NO ammo supply initially
    applyBuildCommand(state, {
      type: 'place',
      x: 8,
      y: 5,
      blockType: 'bolt_turret',
      free: true,
    });

    // Spawn an enemy right in range at (9, 5)
    const enemy = spawnEnemy(state, 'armored_bruiser', 9, 5);
    const startHp = enemy.hp;

    // Step combat while turret has 0 ammo: turret must NOT fire or deal damage
    stepWaveCombat(state);
    expect(state.stats.shotsFired).toBe(0);
    expect(enemy.hp).toBe(startHp);

    // Now supply the turret via Miner at (8, 3) -> Belt at (8, 4) -> Turret at (8, 5)
    applyBuildCommand(state, {
      type: 'place',
      x: 8,
      y: 3,
      blockType: 'miner',
      direction: 'S',
      produceOverride: 'BoltedAlloy',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 8,
      y: 4,
      blockType: 'belt',
      direction: 'S',
      free: true,
    });

    // Tick 1: Miner pushes ammo onto Belt (8, 4)
    stepFactoryTick(state);
    // Tick 2: Belt (8, 4) loads ammo into Bolt Turret (8, 5) and turret fires at enemy!
    stepFactoryTick(state);

    const turretTile = getTile(state, 8, 5)!;
    expect(state.stats.ammoLoaded).toBeGreaterThan(0);
    expect(state.stats.shotsFired).toBeGreaterThan(0);
    expect(enemy.hp).toBeLessThan(startHp);
    expect(turretTile.ammoCount).toBeGreaterThanOrEqual(0);
  });

  it('6. Tech tree unlocks activate at Waves 3, 6, 9, and 12', () => {
    const state = createInitialState({ seed: 42 });

    // Wave 1 starter unlocks
    expect(isBlockUnlocked(state, 'miner')).toBe(true);
    expect(isBlockUnlocked(state, 'belt')).toBe(true);
    expect(isBlockUnlocked(state, 'bolt_turret')).toBe(true);
    expect(isBlockUnlocked(state, 'splitter')).toBe(false);
    expect(isBlockUnlocked(state, 'smelter')).toBe(false);
    expect(isBlockUnlocked(state, 'scatter_turret')).toBe(false);
    expect(isBlockUnlocked(state, 'arc_railgun')).toBe(false);

    // Wave 3 unlocks splitter + overclock_belt
    unlockTechForWave(state, 3);
    expect(isBlockUnlocked(state, 'splitter')).toBe(true);
    expect(isBlockUnlocked(state, 'overclock_belt')).toBe(true);
    expect(isBlockUnlocked(state, 'smelter')).toBe(false);

    // Wave 6 unlocks smelter
    unlockTechForWave(state, 6);
    expect(isBlockUnlocked(state, 'smelter')).toBe(true);
    expect(isBlockUnlocked(state, 'scatter_turret')).toBe(false);

    // Wave 9 unlocks scatter_turret + silo
    unlockTechForWave(state, 9);
    expect(isBlockUnlocked(state, 'scatter_turret')).toBe(true);
    expect(isBlockUnlocked(state, 'silo')).toBe(true);
    expect(isBlockUnlocked(state, 'arc_railgun')).toBe(false);

    // Wave 12 unlocks arc_railgun
    unlockTechForWave(state, 12);
    expect(isBlockUnlocked(state, 'arc_railgun')).toBe(true);
    expect(BLOCKS.arc_railgun.unlockWave).toBe(12);
  });

  it('7. Core reaching 0 HP triggers defeat; surviving Wave 30 triggers Victory', () => {
    // Part A: Defeat when Core reaches 0 HP
    const defeatState = createInitialState({ seed: 101 });
    defeatState.coreHp = 20;
    spawnEnemy(defeatState, 'siege_crawler', defeatState.corePos.x, defeatState.corePos.y);
    stepWaveCombat(defeatState);
    expect(defeatState.coreHp).toBe(0);
    expect(defeatState.status).toBe('defeat');

    // Part B: Campaign Victory when clearing Wave 30
    const victoryState = createInitialState({ seed: 202 });
    triggerNextWave(victoryState, { waveNumber: 30 });
    // Clear the spawn queue and destroy active enemies to simulate defeating the final Wave 30 boss
    victoryState.queuedSpawns = [];
    for (const e of victoryState.enemies) {
      e.hp = 0;
    }
    stepWaveCombat(victoryState);
    expect(victoryState.status).toBe('victory');
  });

  it('8. Save/reload preserves full 12x12 grid, items on belts, wave state, and tech unlocks', () => {
    const state = createInitialState({ seed: 777 });
    unlockTechForWave(state, 6);
    state.wave = 7;

    applyBuildCommand(state, {
      type: 'place',
      x: 3,
      y: 5,
      blockType: 'miner',
      direction: 'E',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 4,
      y: 5,
      blockType: 'belt',
      direction: 'E',
      free: true,
    });

    // Step 1 tick so an item is physically in transit on Belt (4, 5)
    stepFactoryTick(state);
    expect(getTile(state, 4, 5)?.item?.type).toBe('CuCircle');

    const json = serializeGameState(state);
    const restored = deserializeGameState(json);
    expect(restored).not.toBeNull();
    expect(restored!.state.wave).toBe(7);
    expect(restored!.state.unlockedBlocks).toContain('smelter');
    expect(getTile(restored!.state, 3, 5)?.block).toBe('miner');
    expect(getTile(restored!.state, 4, 5)?.block).toBe('belt');
    expect(getTile(restored!.state, 4, 5)?.item?.type).toBe('CuCircle');
  });

  it('9. Exports valid ArgonGameModule metadata and mounts cleanly in DOM', () => {
    expect(metadata.id).toBe('09-belt-and-bolt');
    expect(metadata.number).toBe(9);
    if (typeof document !== 'undefined') {
      const container = document.createElement('div');
      const instance = mountGame(container, { initialSeed: 1234, debug: true });
      expect(instance.getStateSnapshot?.()).toBeDefined();
      instance.restartWithSeed?.(5678);
      instance.toggleDebug?.(false);
      instance.destroy();
    }
  });

  it('10. Overclocked Belts move items 2 tiles per tick and Demolish refunds 75% cost', () => {
    const state = createInitialState({ seed: 99 });
    // Place Miner at (1, 5) -> Overclocked Belts at (2, 5), (3, 5), (4, 5) -> Core at (5, 5)
    applyBuildCommand(state, {
      type: 'place',
      x: 1,
      y: 5,
      blockType: 'miner',
      direction: 'E',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 2,
      y: 5,
      blockType: 'overclock_belt',
      direction: 'E',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 3,
      y: 5,
      blockType: 'overclock_belt',
      direction: 'E',
      free: true,
    });
    applyBuildCommand(state, {
      type: 'place',
      x: 4,
      y: 5,
      blockType: 'overclock_belt',
      direction: 'E',
      free: true,
    });

    // Tick 1: Miner places item on (2, 5)
    stepFactoryTick(state);
    expect(getTile(state, 2, 5)?.item).not.toBeNull();

    // Tick 2: Overclocked belt shunts item 2 tiles from (2, 5) -> (3, 5) -> (4, 5) in a single tick!
    stepFactoryTick(state);
    expect(getTile(state, 4, 5)?.item).not.toBeNull();

    // Test demolish refund (75% of Bolt Turret cost 30 = 22)
    const creditsBefore = state.credits;
    applyBuildCommand(state, {
      type: 'place',
      x: 8,
      y: 8,
      blockType: 'bolt_turret',
    });
    expect(state.credits).toBe(creditsBefore - BLOCKS.bolt_turret.cost);
    const dem = applyBuildCommand(state, {
      type: 'demolish',
      x: 8,
      y: 8,
    });
    expect(dem.ok).toBe(true);
    expect(dem.refundedCredits).toBe(Math.floor(BLOCKS.bolt_turret.cost * 0.75));
  });
});
