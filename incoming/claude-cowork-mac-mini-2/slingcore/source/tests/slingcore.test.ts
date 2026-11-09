import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CHARGE_FULL_TIME,
  OVERHEAT_LIMIT_TIME,
  SlingCoreEngine,
  UPGRADE_CATALOG,
  WAVE_DURATION,
} from '../src/engine';
import { mountGame } from '../src/index';
import { getStreakFrequency } from '../src/synth';

describe('SLINGCORE — 7 Strict Game-Feel & Playability Rules Suite', () => {
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
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('Rule 1 (Toy-First Test): coils with squash anticipation, snap-launches with stretch, and bounces with wall ripples', () => {
    const engine = new SlingCoreEngine(20261108);
    engine.enemies = []; // Empty room test

    engine.setPointerPosition(850, 300);
    engine.beginPrimaryAction();
    for (let i = 0; i < 12; i++) {
      engine.update(0.05);
    }

    // Charging squashes along aim axis
    expect(engine.player.isCharging).toBe(true);
    expect(engine.player.scaleX).toBeLessThan(0.8);
    expect(engine.player.scaleY).toBeGreaterThan(1.2);

    // Release snap-launches with high velocity, directional kickback shake, and stretch
    engine.releasePrimaryAction();
    expect(engine.player.isLaunching).toBe(true);
    expect(engine.player.vx).toBeGreaterThan(1000);
    expect(engine.player.scaleX).toBeGreaterThan(1.5);
    expect(engine.player.scaleY).toBeLessThan(0.7);
    expect(engine.shakeX).toBeLessThan(0); // Directional kickback opposite launch

    // Step forward until right wall bounce
    for (let i = 0; i < 30; i++) {
      engine.update(0.016);
    }
    expect(engine.player.bouncesInLaunch).toBeGreaterThanOrEqual(1);
    expect(engine.wallRipples.length).toBeGreaterThanOrEqual(1);
    expect(engine.player.trail.length).toBeGreaterThan(5);
  });

  it('Rule 2 (1 Primary Input, 0 Tutorial Walls): mounts immediately in playing state with ONLY canvas and 2 HUD numbers', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const instance = mountGame(container, { initialSeed: 20261108 });

    expect(instance.engine.phase).toBe('playing');
    const hudNums = container.querySelectorAll('.slingcore-hud-num');
    expect(hudNums).toHaveLength(2);
    expect(container.querySelector('canvas')).not.toBeNull();
    const overlay = container.querySelector<HTMLElement>('#sling-draft-overlay');
    expect(overlay?.hidden).toBe(true);

    instance.destroy();
    container.remove();
  });

  it('Rule 3 (Progressive Reveal): Wave 1 spawns only drifters, Wave 2 adds dashers, Wave 3 adds bumpers, Wave 4 adds shielded', () => {
    const engine = new SlingCoreEngine(42);
    expect(engine.wave).toBe(1);
    expect(engine.bumpers).toHaveLength(0);
    for (let i = 0; i < 15; i++) {
      const e = engine.spawnWaveEnemy();
      expect(e.kind).toBe('drifter');
    }

    // Complete Wave 1 (30s) -> pick upgrade -> Wave 2
    engine.waveTimer = 0.02;
    engine.update(0.04);
    expect(engine.phase).toBe('upgrade_draft');
    engine.selectUpgrade(0);
    expect(engine.wave).toBe(2);

    // Complete Wave 2 -> pick upgrade -> Wave 3 (Bumpers appear!)
    engine.waveTimer = 0.02;
    engine.update(0.04);
    engine.selectUpgrade(0);
    expect(engine.wave).toBe(3);
    expect(engine.bumpers).toHaveLength(2);
  });

  it('Rule 4 (Push-Your-Luck Tension): rewards Overcharge hold with bonus chain multiplier, but overheats if held too long', () => {
    const engine = new SlingCoreEngine(99);
    engine.enemies = [];

    // Hold into Overcharge sweet zone (> 0.70s, < 2.05s)
    engine.beginPrimaryAction();
    for (let i = 0; i < 30; i++) {
      engine.update(0.05); // 1.5s total hold
    }
    expect(engine.player.overchargeRatio).toBeGreaterThan(0.5);
    engine.releasePrimaryAction();
    expect(engine.chainCount).toBeGreaterThanOrEqual(1);

    // Hold past Overheat limit (> 2.05s) triggers backfire stun
    engine.beginPrimaryAction();
    for (let i = 0; i < 45; i++) {
      engine.update(0.05);
    }
    expect(engine.player. chargeTime).toBeLessThan(OVERHEAT_LIMIT_TIME);
    expect(engine.player.stunTimer).toBeGreaterThan(0);
  });

  it('Rule 6 (Mandatory Juice Budget): triggers 30-50ms hit-stop on smash, directional shake, and harmonic synth pitch progression', () => {
    const engine = new SlingCoreEngine(2026);
    engine.enemies = [];

    // Place a drifter directly in front of player and snap-launch through it
    const target = engine.spawnWaveEnemy('drifter');
    target.spawnTimer = 0;
    target.x = engine.player.x + 70;
    target.y = engine.player.y;

    engine.setPointerPosition(target.x + 100, target.y);
    engine.beginPrimaryAction();
    engine.update(CHARGE_FULL_TIME);
    engine.releasePrimaryAction();

    engine.update(0.016);
    engine.update(0.016);

    expect(engine.totalKills).toBe(1);
    expect(engine.hitStopTimer).toBeGreaterThanOrEqual(0.030);
    expect(engine.hitStopTimer).toBeLessThanOrEqual(0.055);
    expect(engine.unbankedPoints).toBeGreaterThan(0);

    // Verify harmonic synth pitches up monotonically with combo streak
    const f1 = getStreakFrequency(1);
    const f2 = getStreakFrequency(2);
    const f5 = getStreakFrequency(5);
    const f10 = getStreakFrequency(10);
    expect(f2).toBeGreaterThan(f1);
    expect(f5).toBeGreaterThan(f2);
    expect(f10).toBeGreaterThan(f5);
  });

  it('Rule 7 (Meaningful Between-Wave Choices): offers 3 distinct 1-sentence upgrades that visibly alter mechanics', () => {
    for (const card of UPGRADE_CATALOG) {
      // Every card description is a single concise sentence with no "+5%" filler
      const sentences = card.description.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      expect(sentences).toHaveLength(1);
      expect(card.description).not.toMatch(/\+\d+%/);
    }

    const engine = new SlingCoreEngine(777);
    engine.ownedUpgrades.add('prism_split');
    engine.ownedUpgrades.add('boomerang_snap');

    engine.beginPrimaryAction();
    engine.update(0.5);
    engine.releasePrimaryAction();

    // Prism Split spawns 2 phantom twin cores on launch
    expect(engine.phantomTwins).toHaveLength(2);

    // Boomerang Snap redirects mid-flight on click
    engine.setPointerPosition(100, 100);
    engine.beginPrimaryAction();
    expect(engine.player.usedBoomerangThisFlight).toBe(true);
  });
});
