import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyChronoInput,
  CHRONO_CONFIG,
  createInitialChronoState,
  mountGame,
  spawnSectorEnemy,
  stepChronoState,
} from '../src/index';

describe('Game #12: Chrono-Vortex: The God-Forge Arena', () => {
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
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('produces identical deterministic initial states and simulation steps for the same seed', () => {
    const stateA = createInitialChronoState(20261108, 'vanguard-g');
    const stateB = createInitialChronoState(20261108, 'vanguard-g');

    expect(stateA.enemies.map((e) => ({ x: e.x, y: e.y, type: e.type }))).toEqual(
      stateB.enemies.map((e) => ({ x: e.x, y: e.y, type: e.type }))
    );

    applyChronoInput(stateA, { type: 'DASH_STRIKE', targetX: 480, targetY: 180 });
    applyChronoInput(stateB, { type: 'DASH_STRIKE', targetX: 480, targetY: 180 });

    for (let i = 0; i < 30; i++) {
      stepChronoState(stateA, CHRONO_CONFIG.FIXED_STEP_MS);
      stepChronoState(stateB, CHRONO_CONFIG.FIXED_STEP_MS);
    }

    expect(stateA.player.x).toBeCloseTo(stateB.player.x, 5);
    expect(stateA.player.y).toBeCloseTo(stateB.player.y, 5);
    expect(stateA.score).toBe(stateB.score);
  });

  it('triggers Elemental Bumper Resonance and increases Pinball Chain multiplier on bumper collision', () => {
    const state = createInitialChronoState(20261108, 'vanguard-g');
    const bumper = state.bumpers[0];

    // Place player adjacent to bumper and dash directly into it
    state.player.x = bumper.x;
    state.player.y = bumper.y + bumper.radius + state.player.radius - 2;
    state.player.vx = 0;
    state.player.vy = -420;

    stepChronoState(state, CHRONO_CONFIG.FIXED_STEP_MS);

    expect(bumper.hitCount).toBeGreaterThanOrEqual(1);
    expect(state.ledger.totalBankShots).toBeGreaterThanOrEqual(1);
    expect(state.comboCount).toBeGreaterThanOrEqual(1);
  });

  it('spawns Chrono-Ghost Echoes and rewinds player position when rewindPlayer is true', () => {
    const state = createInitialChronoState(20261108, 'phantom-x');
    const firstSample = { ...state.echoHistory[0] };

    state.player.x = 520;
    state.player.y = 340;

    applyChronoInput(state, { type: 'SPAWN_ECHO', rewindPlayer: true });

    expect(state.ghosts.length).toBe(1);
    expect(state.ledger.totalEchoesSpawned).toBe(1);
    expect(state.player.x).toBeCloseTo(firstSample.x, 3);
    expect(state.player.y).toBeCloseTo(firstSample.y, 3);
  });

  it('converts enemy projectiles into allied homing prism shards via Pulse Parry', () => {
    const state = createInitialChronoState(20261108, 'prism-9');
    state.projectiles.push({
      id: 999,
      x: state.player.x + 24,
      y: state.player.y,
      vx: -220,
      vy: 0,
      radius: 6,
      damage: 12,
      isAllied: false,
      isHoming: false,
      pierceLeft: 1,
      color: '#fb7185',
      ttlMs: 3000,
      sourceName: 'Prism-Lens Marksman',
    });

    applyChronoInput(state, { type: 'PULSE_PARRY' });

    const converted = state.projectiles.filter((p) => p.isAllied);
    expect(converted.length).toBeGreaterThanOrEqual(2); // Original + Prism-9 bonus shard
    expect(state.ledger.totalParries).toBe(1);
  });

  it('transitions to RELIC_DRAFT on clearing a sector and advances to next sector on relic selection or anvil smelt', () => {
    const state = createInitialChronoState(20261108, 'vanguard-g');
    state.sectorKills = state.sectorTargetKills;

    stepChronoState(state, CHRONO_CONFIG.FIXED_STEP_MS);
    expect(state.status).toBe('RELIC_DRAFT');
    expect(state.draftOptions).toHaveLength(3);

    const chosenRelic = state.draftOptions[0];
    applyChronoInput(state, { type: 'SELECT_RELIC', relicId: chosenRelic });

    expect(state.status).toBe('PLAYING');
    expect(state.sector).toBe(2);
    expect(state.relicIds).toContain(chosenRelic);
  });

  it('spawns Kronos-Omega in Sector 5 and transitions to VICTORY when defeated', () => {
    const state = createInitialChronoState(20261108, 'vanguard-g');
    state.sector = 4;
    state.sectorKills = state.sectorTargetKills;
    stepChronoState(state, CHRONO_CONFIG.FIXED_STEP_MS);
    applyChronoInput(state, { type: 'SACRIFICE_RELIC_FOR_UPGRADE' });

    expect(state.sector).toBe(5);
    const boss = state.enemies.find((e) => e.type === 'kronos-omega');
    expect(boss).toBeDefined();

    if (boss) {
      boss.hp = 10;
      state.player.x = boss.x;
      state.player.y = boss.y + boss.radius + state.player.radius - 4;
      state.player.dashTimerMs = 150;
      state.player.vx = 0;
      state.player.vy = -650;
      stepChronoState(state, CHRONO_CONFIG.FIXED_STEP_MS);
    }

    expect(state.status).toBe('VICTORY');
  });

  it('mounts UI, switches chassis, toggles debug, reseeds, and cleanly destroys', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, { initialSeed: 20261108, debug: false });
    expect(container.querySelector('#cv-arena-canvas')).toBeTruthy();

    instance.toggleDebug?.(true);
    instance.restartWithSeed?.(99999);
    const snap = instance.getStateSnapshot?.() as { seed: number };
    expect(snap.seed).toBe(99999);

    instance.destroy();
    expect(container.innerHTML).toBe('');
    container.remove();
  });
});
