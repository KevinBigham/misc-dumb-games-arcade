import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyHorizonInput,
  computeOptimalLaunchVector,
  computePolygonAreaShoelace,
  createInitialHorizonState,
  HORIZON_CONFIG,
  isPointInPolygon,
  loadHorizonSave,
  mountGame,
  predictShipTrajectory,
  runHorizonCounterfactuals,
  saveHorizonState,
  SeededRng,
  stepHorizonState,
} from '../src/index';

describe('Game 12 — Event Horizon: Singularity Slingshot Verification Suite', () => {
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
      setLineDash: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('produces 100% deterministic trajectories and simulation states for identical seeds', () => {
    const rngA = new SeededRng(20261108);
    const rngB = new SeededRng(20261108);
    expect(Array.from({ length: 10 }, () => rngA.next())).toEqual(
      Array.from({ length: 10 }, () => rngB.next())
    );

    const stateA = createInitialHorizonState(20261108);
    const stateB = createInitialHorizonState(20261108);

    applyHorizonInput(stateA, { type: 'LAUNCH_SLINGSHOT', angleRad: -0.4, powerPct: 0.9 });
    applyHorizonInput(stateB, { type: 'LAUNCH_SLINGSHOT', angleRad: -0.4, powerPct: 0.9 });

    for (let i = 0; i < 60; i++) {
      stepHorizonState(stateA, HORIZON_CONFIG.FIXED_STEP_MS);
      stepHorizonState(stateB, HORIZON_CONFIG.FIXED_STEP_MS);
    }

    expect(stateA.ship.x).toBeCloseTo(stateB.ship.x, 6);
    expect(stateA.ship.y).toBeCloseTo(stateB.ship.y, 6);
    expect(stateA.score).toBe(stateB.score);
    expect(stateA.rngState).toBe(stateB.rngState);
  });

  it('accurately computes Shoelace polygon area and encloses Constellation Triangles to vaporize enemies', () => {
    const triangle = [
      { x: 300, y: 150 },
      { x: 660, y: 150 },
      { x: 480, y: 450 },
    ];
    const area = computePolygonAreaShoelace(triangle);
    expect(area).toBe(54000);
    expect(isPointInPolygon(480, 260, triangle)).toBe(true);
    expect(isPointInPolygon(100, 100, triangle)).toBe(false);

    const state = createInitialHorizonState(20261108);
    // Position an enemy inside the top-right triangle of bumpers
    const b1 = state.bumpers[0];
    const b2 = state.bumpers[1];
    const b3 = state.bumpers[2];
    const cx = (b1.x + b2.x + b3.x) / 3;
    const cy = (b1.y + b2.y + b3.y) / 3;
    state.enemies = [
      {
        id: 'test-target',
        kind: 'VOID_DRONE',
        x: cx,
        y: cy,
        vx: 0,
        vy: 0,
        radius: 15,
        hp: 40,
        maxHp: 40,
        shielded: false,
        fireCooldownMs: 5000,
        hitFlashMs: 0,
        orbitAngle: 0,
      },
    ];

    // Pre-seed first 2 constellation vertices, then collide ship into 3rd bumper
    state.ship.constellationVertices = [
      { id: b1.id, x: b1.x, y: b1.y },
      { id: b2.id, x: b2.x, y: b2.y },
    ];
    state.ship.x = b3.x - (b3.radius + state.ship.radius - 2);
    state.ship.y = b3.y;
    state.ship.vx = 320;
    state.ship.vy = 0;

    stepHorizonState(state, HORIZON_CONFIG.FIXED_STEP_MS);

    expect(state.stats.polygonsEnclosed).toBe(1);
    expect(state.activePolygons.length).toBe(1);
    expect(state.enemies.length).toBe(0); // Vaporized by Constellation Polygon!
  });

  it('supports Event Horizon skimming, Wormhole pair acceleration, and Roche Limit tidal crushes', () => {
    const state = createInitialHorizonState(20261108, {
      mode: 'ODYSSEY',
      startSector: 4, // Sector 4 has coupled Black Hole -> White Hole wormhole pair!
    });

    const bh = state.wells.find((w) => w.kind === 'BLACK_HOLE')!;
    const wh = state.wells.find((w) => w.kind === 'WHITE_HOLE')!;
    expect(bh).toBeTruthy();
    expect(wh).toBeTruthy();

    // Place ship right at the Black Hole wormhole entry core
    state.ship.x = bh.x - 10;
    state.ship.y = bh.y;
    state.ship.vx = 300;
    state.ship.vy = 0;

    stepHorizonState(state, HORIZON_CONFIG.FIXED_STEP_MS);

    expect(state.stats.wormholeTransits).toBe(1);
    // Ship should have emerged near the White Hole at boosted relativistic velocity
    expect(Math.hypot(state.ship.x - wh.x, state.ship.y - wh.y)).toBeLessThan(wh.skimRadius);
    expect(Math.hypot(state.ship.vx, state.ship.vy)).toBeGreaterThan(420);

    // Place a non-boss enemy inside the Black Hole core to verify Roche Limit Tidal Crush
    const prevCrushes = state.stats.rocheCrushes;
    state.enemies.push({
      id: 'doomed-drone',
      kind: 'VOID_DRONE',
      x: bh.x,
      y: bh.y,
      vx: 0,
      vy: 0,
      radius: 15,
      hp: 50,
      maxHp: 50,
      shielded: false,
      fireCooldownMs: 2000,
      hitFlashMs: 0,
      orbitAngle: 0,
    });

    stepHorizonState(state, HORIZON_CONFIG.FIXED_STEP_MS);
    expect(state.stats.rocheCrushes).toBe(prevCrushes + 1);
  });

  it('executes Worldline Chrono-Rewind ([R]), spawns a Phantom Echo Twin, and triggers Supernova ([E])', () => {
    const state = createInitialHorizonState(20261108);
    const originX = state.ship.x;
    const originY = state.ship.y;

    applyHorizonInput(state, { type: 'LAUNCH_SLINGSHOT', angleRad: -0.2, powerPct: 0.85 });
    for (let i = 0; i < 20; i++) {
      stepHorizonState(state, HORIZON_CONFIG.FIXED_STEP_MS);
    }

    expect(state.worldlineHistory.length).toBeGreaterThan(15);
    expect(Math.hypot(state.ship.x - originX, state.ship.y - originY)).toBeGreaterThan(30);

    // Trigger Worldline Rewind
    applyHorizonInput(state, { type: 'TRIGGER_REWIND' });
    expect(state.stats.rewindsUsed).toBe(1);
    expect(state.activeEcho).not.toBeNull();
    expect(state.ship.x).toBeCloseTo(originX, 1);
    expect(state.ship.y).toBeCloseTo(originY, 1);

    // Trigger Supernova Shockwave
    state.ship.hawkingEnergy = 100;
    applyHorizonInput(state, { type: 'TRIGGER_SUPERNOVA' });
    expect(state.stats.supernovasUsed).toBe(1);
  });

  it('predicts curved trajectories, runs AI Trickshot Coach, and executes 3-Archetype Counterfactual Lab', () => {
    const dojoState = createInitialHorizonState(20261108, {
      mode: 'TRICKSHOT_DOJO',
      startSector: 1,
    });

    const pred = predictShipTrajectory(dojoState);
    expect(pred.length).toBeGreaterThan(60);

    const opt = computeOptimalLaunchVector(dojoState);
    expect(opt.powerPct).toBeGreaterThan(0.5);

    applyHorizonInput(dojoState, { type: 'TRIGGER_AI_COACH' });
    expect(dojoState.launchesUsed).toBe(1);

    const counterfactuals = runHorizonCounterfactuals(20261108);
    expect(counterfactuals).toHaveLength(3);
    for (const c of counterfactuals) {
      expect(c.finalScore).toBeGreaterThan(0);
      expect(c.peakLorentzGamma).toBeGreaterThanOrEqual(1.0);
    }
  });

  it('persists career stats with anti-double-reward idempotency and mounts/destroys UI cleanly', () => {
    const storeMap = new Map<string, string>();
    const mockStorage: Storage = {
      get length() {
        return storeMap.size;
      },
      clear: () => storeMap.clear(),
      getItem: (k: string) => storeMap.get(k) ?? null,
      key: (i: number) => Array.from(storeMap.keys())[i] ?? null,
      removeItem: (k: string) => {
        storeMap.delete(k);
      },
      setItem: (k: string, v: string) => {
        storeMap.set(k, v);
      },
    };

    const env0 = loadHorizonSave(mockStorage);
    const state = createInitialHorizonState(20261108);
    state.score = 12500;
    state.stats.polygonsEnclosed = 4;
    state.status = 'VICTORY';
    state.verdictId = 'SACRED_GEOMETER';

    const env1 = saveHorizonState(env0.career, state, mockStorage);
    expect(env1.career.runsPlayed).toBe(1);
    expect(env1.career.odysseyVictories).toBe(1);
    expect(env1.career.totalPolygonsEnclosed).toBe(4);

    // Saving the exact same completed run a second time must NOT double-increment career totals
    const env2 = saveHorizonState(env1.career, state, mockStorage);
    expect(env2.career.runsPlayed).toBe(1);
    expect(env2.career.odysseyVictories).toBe(1);
    expect(env2.career.totalPolygonsEnclosed).toBe(4);

    // Mount UI and verify lifecycle
    const container = document.createElement('div');
    document.body.appendChild(container);
    const instance = mountGame(container, { initialSeed: 20261108, debug: true });
    expect(container.querySelector('#eh-canvas')).toBeTruthy();
    expect(instance.getStateSnapshot?.()).toBeTruthy();
    instance.restartWithSeed?.(999999);
    instance.toggleDebug?.(false);
    instance.destroy();
    container.remove();
  });
});
