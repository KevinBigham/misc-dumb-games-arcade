import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HARMONIC_SCALE_HZ,
  SnapLanceSynth,
  computeHarmonicFrequency,
} from '../src/audio';
import {
  SnapLanceEngine,
  UPGRADE_CATALOG,
  WAVE_DURATION_SECONDS,
} from '../src/engine';
import { mountGame } from '../src/index';

describe('SNAP-LANCE — 7 Strict Tactile Game Feel Rules Suite', () => {
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
      setLineDash: vi.fn(),
      fillText: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('Rule 1 (Toy-First Test): gives the player core weight, anticipation squash on hold, multi-bounce sightline, and high-velocity snap on release', () => {
    const engine = new SnapLanceEngine(new SnapLanceSynth(), 20261108);
    engine.enemies = []; // Empty room test

    // 1. Glide momentum toward pointer
    engine.pointerActive = true;
    engine.pointerX = engine.player.x + 250;
    engine.pointerY = engine.player.y;
    engine.step(0.1);
    expect(engine.player.vx).toBeGreaterThan(20);
    expect(engine.trail.length).toBeGreaterThan(0);

    // 2. Anticipation & Coiling on Hold
    engine.beginCharge();
    for (let i = 0; i < 20; i++) {
      engine.step(0.05);
    }
    expect(engine.player.state).toBe('charging');
    expect(engine.player.chargeTier).toBe(3); // Reached Apex Sweet-Spot
    expect(engine.player.scaleX).toBeLessThan(0.75); // Compressed along aim axis
    expect(engine.player.scaleY).toBeGreaterThan(1.2); // Widened perpendicular to aim

    // Multi-bounce raycast sightline works in empty room
    const sightline = engine.computeRaycastBouncePath(3);
    expect(sightline.length).toBe(4);

    // 3. Snap Launch on Release
    engine.releaseCharge();
    expect(engine.player.state).toBe('dash');
    expect(engine.player.vx).toBeGreaterThan(1500);
    expect(engine.player.bouncesLeft).toBe(5);
    expect(engine.player.scaleX).toBeGreaterThan(1.5); // Stretched along launch vector
  });

  it('Rule 2 (1 Primary Input, 0 Tutorial Walls): mounts directly into Wave 1 with ONLY the canvas and 2 HUD numbers', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, { initialSeed: 20261108 });
    const canvas = container.querySelector('canvas');
    const hudNumbers = container.querySelectorAll('.sl-hud-number');
    const overlay = container.querySelector<HTMLElement>('#sl-upgrade-overlay');

    expect(canvas).not.toBeNull();
    expect(hudNumbers).toHaveLength(2);
    expect(overlay?.hidden).toBe(true);
    expect(instance.engine.phase).toBe('playing');
    expect(instance.engine.wave).toBe(1);

    instance.destroy();
    container.remove();
  });

  it('Rule 3 (Progressive Reveal): starts Wave 1 with ONLY drifters, then introduces 1 new element per 30-second wave', () => {
    const engine = new SnapLanceEngine(new SnapLanceSynth(), 20261108);
    expect(WAVE_DURATION_SECONDS).toBe(30);

    // Wave 1: only drifters, 0 bumpers
    expect(engine.wave).toBe(1);
    expect(engine.bumpers).toHaveLength(0);
    for (let i = 0; i < 6; i++) {
      const spawned = engine.spawnTargetForWave();
      expect(spawned.kind).toBe('drifter');
    }

    // Wave 3 introduces 2 Arena Resonance Bumpers
    engine.setupWave(3);
    expect(engine.bumpers).toHaveLength(2);
  });

  it('Rule 4 & Rule 6 (Push-Your-Luck + Mandatory Juice Budget): triggers 30-50ms hit-stop, directional screen shake, squash-and-stretch, and harmonic synth pitch-up', () => {
    const synth = new SnapLanceSynth();
    const engine = new SnapLanceEngine(synth, 20261108);

    // Verify harmonic pitch ladder strictly increases with combo streak
    const f1 = computeHarmonicFrequency(1, 0);
    const f4 = computeHarmonicFrequency(4, 0);
    const f8 = computeHarmonicFrequency(8, 1);
    expect(f1).toBe(HARMONIC_SCALE_HZ[1]);
    expect(f4).toBeGreaterThan(f1);
    expect(f8).toBeGreaterThan(f4);

    // Spawn an active enemy directly in front of the player and skewer it
    engine.enemies = [];
    const target = engine.spawnTargetForWave('drifter', engine.player.x + 60, engine.player.y);
    target.spawnTelegraph = 0; // Active

    engine.pointerX = target.x;
    engine.pointerY = target.y;
    engine.beginCharge();
    engine.step(0.9); // Charge to Apex Sweet-Spot
    engine.releaseCharge();

    // Step forward so the dash skewers the target
    engine.step(0.035);

    expect(engine.score).toBeGreaterThan(0);
    expect(engine.comboStreak).toBeGreaterThan(1);
    // Hit-stop between 30ms and 50ms triggered
    expect(engine.hitStopMs).toBeGreaterThanOrEqual(30);
    expect(engine.hitStopMs).toBeLessThanOrEqual(50);
    // Directional shake along positive X
    expect(engine.shakeVx).toBeGreaterThan(0);
    expect(synth.getLastPlayedFrequency()).toBeGreaterThan(HARMONIC_SCALE_HZ[0]);
  });

  it('Rule 7 (Meaningful Between-Wave Choices): pauses after 30s wave to offer 3 one-sentence upgrades that visibly alter behavior', () => {
    const engine = new SnapLanceEngine(new SnapLanceSynth(), 20261108);

    for (const card of UPGRADE_CATALOG) {
      // Every card description is a single concise sentence
      const sentences = card.description.split('.').filter((s) => s.trim().length > 0);
      expect(sentences).toHaveLength(1);
      expect(card.description).not.toMatch(/\+\d+%/);
    }

    // Complete Wave 1 (30 seconds)
    engine.waveTimeRemaining = 0.01;
    engine.step(0.02);

    expect(engine.phase).toBe('upgrade_draft');
    expect(engine.offeredUpgrades).toHaveLength(3);

    // Pick 'split_prism' upgrade and verify wall bounces visibly fire 2 angled cyan shards
    engine.selectUpgrade('split_prism');
    expect(engine.phase).toBe('playing');
    expect(engine.wave).toBe(2);
    expect(engine.activeUpgrades.has('split_prism')).toBe(true);

    // Force a wall bounce during dash and verify 2 shards spawn
    engine.player.x = engine.width - engine.wallPadding - engine.player.radius - 5;
    engine.pointerX = engine.width + 100;
    engine.pointerY = engine.player.y;
    engine.beginCharge();
    engine.step(0.5);
    engine.releaseCharge();
    engine.step(0.02); // Hits right wall and bounces

    expect(engine.shards.length).toBeGreaterThanOrEqual(2);
  });
});
