import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HARMONIC_COMBO_FREQUENCIES, VaultAudioEngine } from '../src/audio';
import { metadata, mountGame } from '../src/index';
import {
  bankUnbankedPot,
  createInitialState,
  launchStriker,
  selectUpgradeAndStartNextRound,
  stepSimulation,
  triggerGreedBust,
  updateAimDrag,
} from '../src/simulation';

describe('RICOCHET VAULT // GREED BREAKER — Toy-First Game Feel & Push-Your-Luck Suite', () => {
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
      ellipse: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      clip: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      setTransform: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn(() => ({ width: 42 })),
      setLineDash: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      drawImage: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  });

  it('1. 3-Second Rule & Anticipation Wind-Up: squashes striker on drag and snaps into flight on release', () => {
    const state = createInitialState(20261108);
    const audio = new VaultAudioEngine();
    expect(state.phase).toBe('aiming');

    // Drag pullback creates wind-up squash-and-stretch deformation
    updateAimDrag(state, 0.6, -0.8, 0.85, audio);
    expect(state.isDraggingAim).toBe(true);
    expect(state.strikers[0].squashParallel).toBeGreaterThan(1.25);
    expect(state.strikers[0].squashPerp).toBeLessThan(0.85);

    // Release launches striker with velocity-inherited particles and recoil shake
    const launched = launchStriker(state, state.aimDirX, state.aimDirY, state.aimTension, audio);
    expect(launched).toBe(true);
    expect(state.phase).toBe('in_flight');
    expect(Math.hypot(state.strikers[0].vx, state.strikers[0].vy)).toBeGreaterThan(600);
    expect(state.particles.length).toBeGreaterThanOrEqual(10);
  });

  it('2. Real 40-60ms Hit-Stop: freezes projectile physics during heavy jackpot impacts and resumes cleanly', () => {
    const state = createInitialState(20261108);
    launchStriker(state, 1, 0, 0.9);

    // Place a Gold Jackpot Bumper directly in front of the Striker
    const ball = state.strikers[0];
    const jackpotPeg = state.pegs.find((p) => p.kind === 'jackpot')!;
    jackpotPeg.x = ball.x + ball.radius + jackpotPeg.radius - 2;
    jackpotPeg.y = ball.y;

    stepSimulation(state, 16);

    // Verify 40-60ms Hit-Stop was triggered!
    expect(state.hitStopLastDurationMs).toBeGreaterThanOrEqual(40);
    expect(state.hitStopLastDurationMs).toBeLessThanOrEqual(60);
    expect(state.hitStopMs).toBeGreaterThan(0);

    // During Hit-Stop, ball position is frozen while camera shake & vibration stay active
    const frozenX = state.strikers[0].x;
    const frozenY = state.strikers[0].y;
    stepSimulation(state, 20);
    expect(state.strikers[0].x).toBe(frozenX);
    expect(state.strikers[0].y).toBe(frozenY);

    // Step past remaining hit-stop window -> ball moves again!
    stepSimulation(state, 45);
    stepSimulation(state, 16);
    expect(Math.hypot(state.strikers[0].x - frozenX, state.strikers[0].y - frozenY)).toBeGreaterThan(2);
  });

  it('3. WebAudio Ascending Harmonic Scale: climbs monotonically in pitch across consecutive chain hits', () => {
    const audio = new VaultAudioEngine();
    expect(HARMONIC_COMBO_FREQUENCIES.length).toBeGreaterThanOrEqual(16);

    let prevHz = 0;
    for (let chain = 1; chain <= 16; chain++) {
      const hz = audio.playComboHit(chain, chain % 5 === 0, 0.3);
      expect(hz).toBeGreaterThan(prevHz);
      prevHz = hz;
    }
  });

  it('4. Push-Your-Luck Greed Dilemma: banking locks in Chips × Mult and heals shields at x6+, while Greed Bust shatters unbanked pot', () => {
    const state = createInitialState(20261108);
    state.shields = 2; // Damaged shield
    launchStriker(state, 0, -1, 0.9);

    // Build an unbanked combo pot at x7 Multiplier
    state.unbankedChips = 200;
    state.chainHits = 5;
    state.comboMult = 7;

    const banked = bankUnbankedPot(state);
    expect(banked).toBe(1400);
    expect(state.bankedScore).toBe(1400);
    expect(state.shields).toBe(3); // Healed +1 Shield Heart for banking x6+!
    expect(state.phase).toBe('upgrade_draft'); // 1400 >= 1200 Round 1 Quota triggers Upgrade Draft!
    expect(state.draftChoices).toHaveLength(3);

    // Pick an upgrade and test Greed Bust on Round 2
    selectUpgradeAndStartNextRound(state, state.draftChoices[0].id);
    expect(state.round).toBe(2);
    expect(state.phase).toBe('aiming');

    launchStriker(state, 0, -1, 0.9);
    state.unbankedChips = 350;
    state.comboMult = 5;
    state.flightTime = 0.8;

    triggerGreedBust(state, 'HIT HAZARD SAW', 120, -90);
    expect(state.lastBustAmount).toBe(1750);
    expect(state.unbankedChips).toBe(0);
    expect(state.shields).toBe(2);
    expect(state.hitStopLastDurationMs).toBeGreaterThanOrEqual(40);
  });

  it('5. Emergent Rule-Bending Synergies: Prism Splitters, Tesla Arcs, and Supernova Recall physically alter shots', () => {
    const state = createInitialState(20261108);
    state.activeUpgrades.push('prism_split', 'tesla_chain', 'supernova_recall');
    launchStriker(state, 1, 0, 0.9);

    const ball = state.strikers[0];
    ball.bouncesThisShot = 2; // Next peg hit is 3rd bounce -> triggers Prism Split!
    const targetPeg = state.pegs.find((p) => p.kind === 'crystal')!;
    targetPeg.x = ball.x + ball.radius + targetPeg.radius - 2;
    targetPeg.y = ball.y;

    stepSimulation(state, 16);

    // Prism Split spawned a twin Phantom Ball AND Tesla Chain arced lightning!
    expect(state.strikers.length).toBeGreaterThanOrEqual(2);
    expect(state.lightningArcs.length).toBeGreaterThan(0);
  });

  it('6. Zero HUD Clutter Mount: mounts full-screen playable canvas cleanly and supports seed reset', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, { initialSeed: 20261108 });
    expect(metadata.id).toBe('13-ricochet-vault');
    expect(container.querySelector('canvas#rv-canvas')).not.toBeNull();

    instance.restartWithSeed?.(99999);
    const snap = instance.getStateSnapshot?.() as { seed: number };
    expect(snap.seed).toBe(99999);

    instance.destroy();
    container.remove();
  });
});
