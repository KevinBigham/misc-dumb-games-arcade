// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyCommand,
  buildPotionColorMap,
  clearActiveRun,
  createInitialGameState,
  exportRunSnapshot,
  findShortestPath,
  GAME_CONFIG,
  generateFloor,
  getActionTickPreview,
  importRunSnapshot,
  loadActiveRun,
  loadChronicles,
  metadata,
  mountGame,
  POTION_COLORS,
  POTION_EFFECT_ORDER,
  saveActiveRun,
  WEAPON_CATALOG,
} from '../src/index';

describe('Game 10: Ten Floors Down — Shattered Pixel Dungeon Tactical Roguelike Suite', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('guarantees a valid walkable BFS path from Entrance to Exit Stairs and key items across 22 seeds and all 10 floors', () => {
    for (let seed = 1001; seed <= 1022; seed++) {
      const { effectToColor } = buildPotionColorMap(seed);
      for (let floorNum = 1; floorNum <= GAME_CONFIG.MAX_FLOORS; floorNum++) {
        const floor = generateFloor(floorNum, seed, effectToColor, 'vanguard');

        expect(floor.tiles[floor.entrancePos.y][floor.entrancePos.x]).toBe('stairs_up');
        expect(floor.tiles[floor.stairsDownPos.y][floor.stairsDownPos.x]).toBe('stairs_down');

        const pathToExit = findShortestPath(
          floor.tiles,
          floor.entrancePos,
          floor.stairsDownPos,
        );
        expect(pathToExit).not.toBeNull();
        expect(pathToExit!.length).toBeGreaterThan(1);

        // Verify Alchemy Desk is reachable
        expect(floor.alchemyPos).not.toBeNull();
        const pathToAlchemy = findShortestPath(
          floor.tiles,
          floor.entrancePos,
          floor.alchemyPos!,
        );
        expect(pathToAlchemy).not.toBeNull();

        // Verify all ground items are reachable
        for (const item of floor.groundItems) {
          const pathToItem = findShortestPath(floor.tiles, floor.entrancePos, {
            x: item.x,
            y: item.y,
          });
          expect(pathToItem).not.toBeNull();
        }

        // Verify supply-bounded item guarantees: every floor has a Potion of Mending
        const hasMending = floor.groundItems.some(
          (i) => i.kind === 'potion' && i.color === effectToColor.mending,
        );
        expect(hasMending).toBe(true);

        // Odd floors guarantee Scroll of Upgrade; even floors guarantee Potion of Might
        if (floorNum % 2 === 1) {
          expect(floor.groundItems.some((i) => i.kind === 'scroll_upgrade')).toBe(true);
        } else {
          expect(
            floor.groundItems.some(
              (i) => i.kind === 'potion' && i.color === effectToColor.might,
            ),
          ).toBe(true);
        }

        // Boss spawn checks on Floors 5 & 10
        if (floorNum === GAME_CONFIG.MINI_BOSS_FLOOR) {
          expect(
            floor.monsters.some((m) => m.isBoss && m.templateId === 'iron_warden'),
          ).toBe(true);
        }
        if (floorNum === GAME_CONFIG.FINAL_BOSS_FLOOR) {
          expect(
            floor.monsters.some((m) => m.isBoss && m.templateId === 'abyssal_core'),
          ).toBe(true);
        }
      }
    }
  });

  it('shuffles the 6 Potion Colors bijectively per seed and permanently identifies colors when drunk, thrown, or tested at an Alchemy Desk', () => {
    const mapA = buildPotionColorMap(424242);
    const mapB = buildPotionColorMap(424242);
    expect(mapA.colorToEffect).toEqual(mapB.colorToEffect);

    const assignedEffects = Object.values(mapA.colorToEffect);
    expect(new Set(assignedEffects).size).toBe(6);
    for (const eff of POTION_EFFECT_ORDER) {
      const color = mapA.effectToColor[eff];
      expect(mapA.colorToEffect[color]).toBe(eff);
    }

    // Vanguard starts with 'mending' pre-identified
    const state = createInitialGameState({
      seed: 424242,
      heroClass: 'vanguard',
    });
    const mendingColor = state.effectToColor.mending;
    expect(state.identifiedColors[mendingColor]).toBe(true);
    expect(Object.values(state.identifiedColors).filter(Boolean).length).toBe(1);

    // Add an unidentified Might potion and drink it -> marks color identified & boosts stats
    const mightColor = state.effectToColor.might;
    expect(state.identifiedColors[mightColor]).toBe(false);
    state.hero.inventory.push({
      id: 'test_might',
      kind: 'potion',
      color: mightColor,
    });
    const prevMaxHp = state.hero.maxHp;
    const prevBaseAtk = state.hero.baseAttack;
    applyCommand(state, {
      type: 'DRINK_POTION',
      slotIndex: state.hero.inventory.length - 1,
    });
    expect(state.identifiedColors[mightColor]).toBe(true);
    expect(state.hero.maxHp).toBe(prevMaxHp + 12);
    expect(state.hero.baseAttack).toBe(prevBaseAtk + 2);

    // Test an unidentified Caustic Gas potion at the floor's Alchemy Desk -> identifies WITHOUT consuming the vial!
    const causticColor = state.effectToColor.caustic_gas;
    expect(state.identifiedColors[causticColor]).toBe(false);
    state.hero.inventory.push({
      id: 'test_caustic',
      kind: 'potion',
      color: causticColor,
    });
    const slotIdx = state.hero.inventory.length - 1;
    state.hero.x = state.floor.alchemyPos!.x;
    state.hero.y = state.floor.alchemyPos!.y;
    const prevInvCount = state.hero.inventory.length;

    applyCommand(state, { type: 'USE_ALCHEMY_DESK', slotIndex: slotIdx });
    expect(state.identifiedColors[causticColor]).toBe(true);
    expect(state.hero.inventory.length).toBe(prevInvCount); // Vial preserved!
    expect(state.floor.alchemyCharges).toBe(0);
  });

  it('distinguishes drinking vs throwing harmful potions (Liquid Flame, Frost Mist, Caustic Gas)', () => {
    const state = createInitialGameState({
      seed: 777888,
      heroClass: 'alchemist',
    });
    // Clear monsters for controlled test
    state.floor.monsters = [];

    // 1. Drinking Liquid Flame sets the hero on fire
    const flameColor = state.effectToColor.liquid_flame;
    state.hero.inventory = [{ id: 'p_flame_1', kind: 'potion', color: flameColor }];
    const hpBeforeDrink = state.hero.hp;
    applyCommand(state, { type: 'DRINK_POTION', slotIndex: 0 });
    expect(state.hero.hp).toBeLessThan(hpBeforeDrink);
    expect(state.hero.burningTicks).toBeGreaterThan(0);

    // 2. Drinking Mending heals HP and cures Burning
    const mendingColor = state.effectToColor.mending;
    state.hero.inventory = [{ id: 'p_mend_1', kind: 'potion', color: mendingColor }];
    applyCommand(state, { type: 'DRINK_POTION', slotIndex: 0 });
    expect(state.hero.burningTicks).toBe(0);

    // 3. Throwing Liquid Flame & Frost Mist at a target monster 3 tiles away damages/freezes the monster without harming hero
    const targetX = Math.min(state.floor.width - 3, state.hero.x + 2);
    const targetY = state.hero.y;
    state.floor.tiles[targetY][targetX] = 'floor';
    state.floor.monsters.push({
      id: 'dummy_brute',
      templateId: 'prison_brute',
      name: 'Shackled Brute',
      glyph: 'B',
      color: '#f97316',
      x: targetX,
      y: targetY,
      hp: 60,
      maxHp: 60,
      attack: 12,
      defense: 2,
      moveTicks: 100, // high nextActTick so it doesn't move during throw test
      attackTicks: 100,
      isBoss: false,
      nextActTick: state.currentTick + 500,
      stunnedTicks: 0,
      burningTicks: 0,
      poisonedTicks: 0,
      sunderedDefense: 0,
      telegraph: {
        name: 'Test Slam',
        tiles: [{ x: state.hero.x, y: state.hero.y }],
        damage: 20,
        stunTicks: 10,
      },
      telegraphCooldown: 0,
      alerted: true,
    });

    const frostColor = state.effectToColor.frost_mist;
    state.hero.inventory = [
      { id: 'p_flame_throw', kind: 'potion', color: flameColor },
      { id: 'p_frost_throw', kind: 'potion', color: frostColor },
    ];

    const heroHpBeforeThrow = state.hero.hp;
    // Throw Liquid Flame at (targetX, targetY)
    applyCommand(state, {
      type: 'THROW_POTION',
      slotIndex: 0,
      targetX,
      targetY,
    });
    const brute = state.floor.monsters[0];
    expect(brute.hp).toBeLessThan(60);
    expect(brute.burningTicks).toBe(30);
    expect(state.floor.hazards[targetY][targetX]?.type).toBe('fire');
    expect(state.hero.hp).toBe(heroHpBeforeThrow);

    // Throw Frost Mist at (targetX, targetY) -> freezes monster (stunnedTicks = 20) and cancels telegraph!
    applyCommand(state, {
      type: 'THROW_POTION',
      slotIndex: 0,
      targetX,
      targetY,
    });
    expect(brute.stunnedTicks).toBe(20);
    expect(brute.telegraph).toBeNull();
  });

  it('orders turns accurately via the Actor Tick Scheduler and detects double-turn enemy windows', () => {
    const rogueState = createInitialGameState({
      seed: 999111,
      heroClass: 'rogue',
    });
    rogueState.floor.monsters = [];

    // Rogue move costs 8 ticks
    applyCommand(rogueState, { type: 'WAIT' });
    expect(rogueState.currentTick).toBe(10);

    // Equip heavy 12-tick weapon and place an 8-tick Sewer Rat next to hero
    const heavyAxe = WEAPON_CATALOG.find((w) => w.id === 'executioner_greataxe')!;
    rogueState.hero.weapon = { ...heavyAxe }; // 12 ticks

    const ratX = rogueState.hero.x + 1;
    const ratY = rogueState.hero.y;
    rogueState.floor.tiles[ratY][ratX] = 'floor';
    rogueState.floor.visible[ratY][ratX] = true;
    rogueState.floor.monsters.push({
      id: 'fast_rat',
      templateId: 'sewer_rat',
      name: 'Albino Sewer Rat',
      glyph: 'r',
      color: '#cbd5e1',
      x: ratX,
      y: ratY,
      hp: 80,
      maxHp: 80,
      attack: 6,
      defense: 0,
      moveTicks: 8,
      attackTicks: 8,
      isBoss: false,
      nextActTick: rogueState.currentTick + 4, // acts at tick 14 and tick 22 (both <= 10 + 12 = 22!)
      stunnedTicks: 0,
      burningTicks: 0,
      poisonedTicks: 0,
      sunderedDefense: 0,
      telegraph: null,
      telegraphCooldown: 0,
      alerted: true,
    });

    const preview = getActionTickPreview(rogueState);
    expect(preview.attackTicks).toBe(12);
    expect(preview.doubleTurnMonstersOnAttack).toContain('Albino Sewer Rat');

    const hpBefore = rogueState.hero.hp;
    // Bump-attack the rat (takes 12 ticks, advancing clock from 10 to 22; rat attacks at tick 14 and tick 22!)
    applyCommand(rogueState, { type: 'MOVE', dx: 1, dy: 0 });
    expect(rogueState.currentTick).toBe(22);
    expect(rogueState.hero.hp).toBeLessThan(hpBefore - 5);
  });

  it('triggers Victory when descending from Floor 10 after defeating The Abyssal Core, and enforces Permadeath + Epitaph on 0 HP', () => {
    const state = createInitialGameState({
      seed: 314159,
      heroClass: 'vanguard',
    });

    // Fast-forward to Floor 10
    state.floor = generateFloor(10, state.seed, state.effectToColor, 'vanguard');
    state.hero.x = state.floor.stairsDownPos.x;
    state.hero.y = state.floor.stairsDownPos.y;

    // Attempting to descend while The Abyssal Core is alive is blocked
    applyCommand(state, { type: 'DESCEND_STAIRS' });
    expect(state.status).toBe('playing');

    // Defeat The Abyssal Core and descend -> Victory!
    state.floor.monsters = [];
    applyCommand(state, { type: 'DESCEND_STAIRS' });
    expect(state.status).toBe('victory');
    expect(state.epitaph).not.toBeNull();
    expect(state.epitaph?.outcome).toBe('victory');

    // Now test Permadeath + active save clearing
    const doomedState = createInitialGameState({
      seed: 666000,
      heroClass: 'vanguard',
    });
    saveActiveRun(doomedState);
    expect(loadActiveRun()).not.toBeNull();

    // Drop HP to 2 and drink Liquid Flame to trigger self-burn Permadeath
    doomedState.hero.hp = 2;
    const flameColor = doomedState.effectToColor.liquid_flame;
    doomedState.hero.inventory = [{ id: 'fatal_vial', kind: 'potion', color: flameColor }];
    applyCommand(doomedState, { type: 'DRINK_POTION', slotIndex: 0 });

    expect(doomedState.status).toBe('defeat');
    expect(doomedState.epitaph).not.toBeNull();
    expect(doomedState.epitaph?.outcome).toBe('defeat');
    expect(doomedState.epitaph?.killedBy).toContain('Potion of Liquid Flame');
    expect(doomedState.epitaph?.lastFiveTurns.length).toBeGreaterThan(0);

    // Saving a defeated run must clear the active run slot and record the epitaph in Chronicles
    saveActiveRun(doomedState);
    expect(loadActiveRun()).toBeNull();
    const chronicles = loadChronicles();
    expect(chronicles.length).toBeGreaterThanOrEqual(1);
    expect(chronicles[0].id).toBe(doomedState.epitaph?.id);
  });

  it('preserves exact dungeon state across save/load and JSON export/import, and mounts cleanly via ArgonGameModule', () => {
    clearActiveRun();
    const state = createInitialGameState({
      seed: 123456,
      heroClass: 'alchemist',
    });
    // Identify one extra color
    const firstColor = POTION_COLORS[0].id;
    state.identifiedColors[firstColor] = true;

    saveActiveRun(state);
    const loaded = loadActiveRun();
    expect(loaded).not.toBeNull();
    expect(loaded?.seed).toBe(123456);
    expect(loaded?.hero.classId).toBe('alchemist');
    expect(loaded?.identifiedColors[firstColor]).toBe(true);
    expect(loaded?.floor.stairsDownPos).toEqual(state.floor.stairsDownPos);

    const exportedJson = exportRunSnapshot(state);
    const reimported = importRunSnapshot(exportedJson);
    expect(reimported?.colorToEffect).toEqual(state.colorToEffect);

    // Verify DOM mount contract
    const host = document.createElement('div');
    document.body.appendChild(host);
    const instance = mountGame(host, { initialSeed: 555777, debug: false });
    expect(metadata.id).toBe('10-ten-floors-down');
    expect(metadata.number).toBe(10);

    const snap = instance.getStateSnapshot?.() as { seed: number };
    expect(snap.seed).toBe(555777);

    instance.toggleDebug?.(true);
    instance.restartWithSeed?.(888999);
    const snapAfter = instance.getStateSnapshot?.() as { seed: number; debugRevealAll: boolean };
    expect(snapAfter.seed).toBe(888999);
    expect(snapAfter.debugRevealAll).toBe(true);

    instance.destroy();
    host.remove();
  });
});
