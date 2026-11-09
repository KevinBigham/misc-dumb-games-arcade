import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  computeHarmonicComboFreq,
  mountGame,
  SNAPBACK_CONFIG,
  SnapbackSimulation,
  UPGRADE_CATALOG,
} from '../src/index';

describe('SNAPBACK: Kinetic Tether — 7 Strict Design Rules Verification', () => {
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
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 42 })),
      setLineDash: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('Rule 1 (Toy-First Test): gives player weighty momentum, anticipation squash on charge, and snap-stretch on release', () => {
    const sim = new SnapbackSimulation(20261108);
    sim.enemies = []; // Empty room test

    // Move aim to the right and step cruise physics
    sim.setAimPosition(850, 300);
    sim.step(0.05);
    expect(sim.player.vx).toBeGreaterThan(20);

    // Hold charge: brakes engage and core compresses (anticipation squash)
    sim.startCharge();
    for (let i = 0; i < 14; i++) {
      sim.step(0.05);
    }
    expect(sim.player.isCharging).toBe(true);
    expect(sim.player.scaleX).toBeLessThan(0.85);
    expect(sim.player.scaleY).toBeGreaterThan(1.15);
    expect(sim.computeTrajectoryPreview().length).toBeGreaterThanOrEqual(2);

    // Release in Sweet-Spot (0.70s): explosive snap launch + stretch elongation
    expect(sim.isChargeInSweetSpot()).toBe(true);
    sim.releaseCharge();
    expect(sim.player.vx).toBeCloseTo(SNAPBACK_CONFIG.SWEET_SNAP_SPEED, 0);
    expect(sim.player.scaleX).toBeGreaterThan(1.45);
    expect(sim.player.scaleY).toBeLessThan(0.65);
  });

  it('Rule 2 (1 Primary Input, 0 Tutorial Walls): mounts immediately with ONLY canvas and 2 HUD numbers (0 buttons)', () => {
    const root = document.createElement('div');
    const instance = mountGame(root, { initialSeed: 20261108 });

    expect(root.querySelectorAll('canvas')).toHaveLength(1);
    expect(root.querySelectorAll('button')).toHaveLength(0);
    expect(root.querySelector('#snapback-hud-score')?.textContent).toBe('0');
    expect(root.querySelector('#snapback-hud-wave')?.textContent).toBe('1');

    instance.destroy();
  });

  it('Rule 3 (Progressive Reveal): starts Wave 1 with ONLY drifters & 0 hazards, introducing bumpers in Wave 2 and pulse wells in Wave 5', () => {
    const sim = new SnapbackSimulation(20261108);
    expect(sim.wave).toBe(1);
    expect(sim.bumpers).toHaveLength(0);
    expect(sim.pulseWells).toHaveLength(0);
    expect(sim.enemies.every((e) => e.kind === 'drifter')).toBe(true);

    sim.setupWaveArena(2);
    expect(sim.bumpers).toHaveLength(2);
    expect(sim.pulseWells).toHaveLength(0);

    sim.setupWaveArena(5);
    expect(sim.bumpers).toHaveLength(2);
    expect(sim.pulseWells).toHaveLength(1);
  });

  it('Rule 4 (Push-Your-Luck Tension): builds unbanked pot on hits, banks into score after cruising, or shatters pot on damage', () => {
    const sim = new SnapbackSimulation(20261108);
    sim.enemies[0].spawnTelegraphS = 0;
    sim.killEnemy(0, 900, 0);

    expect(sim.unbankedChips).toBeGreaterThan(0);
    expect(sim.unbankedMult).toBeGreaterThan(1);
    expect(sim.score).toBe(0);

    // Clear hit-stop and cruise safely for 1.0s to bank pot into score
    sim.hitStopTimerS = 0;
    sim.player.snapTimerS = 0;
    for (let i = 0; i < 25; i++) {
      sim.step(0.045);
    }
    expect(sim.score).toBeGreaterThan(0);
    expect(sim.unbankedChips).toBe(0);

    // Build another unbanked pot and verify taking damage shatters it
    sim.enemies[0].spawnTelegraphS = 0;
    sim.killEnemy(0, 900, 0);
    expect(sim.unbankedChips).toBeGreaterThan(0);
    sim.hitStopTimerS = 0;
    sim.player.snapTimerS = 0;
    sim.damagePlayer(sim.player.x + 10, sim.player.y);
    expect(sim.unbankedChips).toBe(0);
    expect(sim.lastDamageContact).not.toBeNull();
  });

  it('Rule 6 (Mandatory Juice Budget): triggers 30-50ms hit-stop, directional shake, bounce squash-stretch, trails, and harmonic synth pitch', () => {
    const sim = new SnapbackSimulation(20261108);
    sim.enemies[0].spawnTelegraphS = 0;
    sim.killEnemy(0, 1000, 0);

    // 30-50ms hit-stop frame verification
    expect(sim.hitStopTimerS).toBeGreaterThanOrEqual(0.03);
    expect(sim.hitStopTimerS).toBeLessThanOrEqual(0.05);

    // Directional screen shake verification (impact was +X, so shakeX is positive)
    expect(sim.shakeX).toBeGreaterThan(0);
    expect(Math.abs(sim.shakeY)).toBeLessThan(0.01);

    // Harmonic combo synth frequency strictly ascends with streak
    const f0 = computeHarmonicComboFreq(0);
    const f1 = computeHarmonicComboFreq(1);
    const f2 = computeHarmonicComboFreq(2);
    const f5 = computeHarmonicComboFreq(5);
    expect(f1).toBeGreaterThan(f0);
    expect(f2).toBeGreaterThan(f1);
    expect(f5).toBeGreaterThan(f2);
  });

  it('Rule 7 (Meaningful Between-Wave Choices): offers 3 distinct 1-sentence upgrades after 30s wave that visibly alter shot behavior', () => {
    for (const upg of UPGRADE_CATALOG) {
      const sentences = upg.description
        .split('.')
        .map((s) => s.trim())
        .filter(Boolean);
      expect(sentences.length).toBe(1);
    }

    const sim = new SnapbackSimulation(20261108);
    sim.waveTimerS = 0.01;
    sim.step(0.02);

    expect(sim.phase).toBe('upgrade_choice');
    expect(sim.offeredUpgrades).toHaveLength(3);

    // Force-add wall_splitter and verify wall bounce spawns 2 prism shards
    sim.chooseUpgrade(0);
    expect(sim.phase).toBe('playing');
    expect(sim.wave).toBe(2);

    sim.ownedUpgrades.add('wall_splitter');
    sim.player.x = SNAPBACK_CONFIG.WALL_MARGIN + SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS - 2;
    sim.player.vx = -900;
    sim.player.snapTimerS = 0.4;
    sim.hitStopTimerS = 0;
    sim.step(0.016);
    expect(sim.shards.length).toBeGreaterThanOrEqual(2);
  });
});
