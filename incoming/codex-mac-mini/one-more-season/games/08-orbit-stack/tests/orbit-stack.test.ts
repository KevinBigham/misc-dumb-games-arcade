import { describe, expect, it } from 'vitest';
import {
  applyInput,
  checkContainmentBreach,
  CONFIG,
  createDefaultCareerStats,
  createInitialState,
  deserializeOrbitEnvelope,
  findConnectedMatches,
  getClearedBlocksForLevel,
  getDifficultyForLevel,
  getSidesForLevel,
  getTargetFaceForLane,
  getWorldLaneForFace,
  metadata,
  morphPolygonSides,
  resolveAllCascades,
  resolveMatchesStep,
  serializeOrbitEnvelope,
  stepOrbitState,
} from '../src/index';

describe('Game 08: Orbit Stack — Core Mechanics & Simulation Suite', () => {
  it('exposes valid ArgonGameMetadata matching Game 08 specification', () => {
    expect(metadata.id).toBe('08-orbit-stack');
    expect(metadata.number).toBe(8);
    expect(metadata.title).toContain('Orbit Stack');
  });

  it('wraps rotation Left and Right cleanly modulo numSides (6, 7, and 8)', () => {
    for (const sides of [6, 7, 8] as const) {
      const state = createInitialState(12345);
      if (sides > 6) {
        morphPolygonSides(state, sides);
      }
      expect(state.numSides).toBe(sides);
      expect(state.coreRotationIndex).toBe(0);

      // Rotate left from 0 -> wraps to sides - 1
      applyInput(state, { type: 'ROTATE_LEFT' });
      expect(state.coreRotationIndex).toBe(sides - 1);

      // Rotate right from sides - 1 -> wraps back to 0
      applyInput(state, { type: 'ROTATE_RIGHT' });
      expect(state.coreRotationIndex).toBe(0);

      // Full 360-degree clockwise rotation
      for (let i = 0; i < sides; i++) {
        applyInput(state, { type: 'ROTATE_RIGHT' });
      }
      expect(state.coreRotationIndex).toBe(0);

      // Verify lane <-> face inverse mapping for every rotation index
      for (let rot = 0; rot < sides; rot++) {
        state.coreRotationIndex = rot;
        for (let lane = 0; lane < sides; lane++) {
          const face = getTargetFaceForLane(lane, rot, sides);
          expect(face).toBeGreaterThanOrEqual(0);
          expect(face).toBeLessThan(sides);
          expect(getWorldLaneForFace(face, rot, sides)).toBe(lane);
        }
      }
    }
  });

  it('detects and clears 3+ connected same-color blocks both radially on one face and angularly across adjacent faces (including wrap-around)', () => {
    // Case A: 3 radial blocks on Face 2
    const stateRadial = createInitialState(9001);
    stateRadial.stacks[2] = [
      { id: 1, color: 1, radialOffset: 0 },
      { id: 2, color: 1, radialOffset: 0 },
      { id: 3, color: 1, radialOffset: 0 },
    ];
    const groupsRadial = findConnectedMatches(stateRadial.stacks, stateRadial.numSides);
    expect(groupsRadial).toHaveLength(1);
    expect(groupsRadial[0].cells).toHaveLength(3);
    expect(groupsRadial[0].isCrossFace).toBe(false);

    const resRadial = resolveMatchesStep(stateRadial);
    expect(resRadial.clearedBlocks).toBe(3);
    expect(stateRadial.stacks[2]).toHaveLength(0);
    expect(stateRadial.score).toBeGreaterThan(0);

    // Case B: 3 angularly adjacent blocks wrapping across Face 5 -> Face 0 -> Face 1 at depth 0
    const stateAngular = createInitialState(9002);
    stateAngular.stacks[5] = [{ id: 10, color: 2, radialOffset: 0 }];
    stateAngular.stacks[0] = [{ id: 11, color: 2, radialOffset: 0 }];
    stateAngular.stacks[1] = [{ id: 12, color: 2, radialOffset: 0 }];

    const groupsAngular = findConnectedMatches(
      stateAngular.stacks,
      stateAngular.numSides
    );
    expect(groupsAngular).toHaveLength(1);
    expect(groupsAngular[0].cells).toHaveLength(3);
    expect(groupsAngular[0].isCrossFace).toBe(true);

    const resAngular = resolveMatchesStep(stateAngular);
    expect(resAngular.clearedBlocks).toBe(3);
    expect(stateAngular.stacks[5]).toHaveLength(0);
    expect(stateAngular.stacks[0]).toHaveLength(0);
    expect(stateAngular.stacks[1]).toHaveLength(0);
    // Cross-face match awards higher points than single-face 3-match
    expect(stateAngular.score).toBeGreaterThan(stateRadial.score);
  });

  it('settles outer blocks inward via gravity after an inner clear and triggers cascading chain combos', () => {
    const state = createInitialState(4242);

    // Inner row (depth 0) on Faces 0, 1, 2 has color 0 (Cyan) -> will clear first!
    // Above it (depth 1) on Faces 0 and 1 are color 3 (Emerald), and Face 3 already has color 3 at depth 0,
    // wait: if Faces 0, 1, 2 have color 3 at depth 1, when depth 0 clears on Faces 0, 1, 2,
    // those three color-3 blocks drop from depth 1 to depth 0 and form a 3-block cascade match!
    state.stacks[0] = [
      { id: 1, color: 0, radialOffset: 0 },
      { id: 4, color: 3, radialOffset: 0 },
    ];
    state.stacks[1] = [
      { id: 2, color: 0, radialOffset: 0 },
      { id: 5, color: 3, radialOffset: 0 },
    ];
    state.stacks[2] = [
      { id: 3, color: 0, radialOffset: 0 },
    ];
    // And put the 3rd Emerald (color 3) block already sitting at depth 0 on Face 2?
    // Wait: if Face 2 has color 0 at depth 0 and color 3 at depth 1, then all three drop together.
    // Let's make Face 3 have color 3 at depth 0 so only Faces 0 & 1 drop to depth 0 to meet Face 2 or Face 5!
    state.stacks[5] = [{ id: 6, color: 3, radialOffset: 0 }];

    // Step 1: Resolve primary match (color 0 at depth 0 on Faces 0, 1, 2)
    const firstStep = resolveMatchesStep(state, 1);
    expect(firstStep.clearedBlocks).toBe(3);
    expect(firstStep.outerBlocksDropped).toBe(true);

    // Now Faces 0 and 1 have dropped their color-3 blocks into depth 0, adjacent to Face 5 (depth 0, color 3)!
    expect(state.stacks[0][0].color).toBe(3);
    expect(state.stacks[1][0].color).toBe(3);
    expect(state.stacks[0][0].radialOffset).toBeGreaterThan(0);

    // Schedule cascade via simulation timer and step 150ms to verify automatic gravity settling & cascade
    state.gravitySettleTimerMs = 95;
    state.pendingCascadeDepth = 2;
    state.nextWaveCooldownMs = 5000; // keep wave spawner quiet during test window

    stepOrbitState(state, 150);

    // All three color-3 blocks (Faces 5, 0, 1) should now be cleared by the cascade!
    expect(state.stacks[0]).toHaveLength(0);
    expect(state.stacks[1]).toHaveLength(0);
    expect(state.stacks[5]).toHaveLength(0);
    expect(state.totalClearedBlocks).toBe(6);
    expect(state.comboCount).toBe(2);
    expect(state.comboMultiplier).toBeGreaterThanOrEqual(2);
    expect(state.events.some((e) => e.type === 'CASCADE_CLEARED')).toBe(true);
  });

  it('morphs polygon from 6 -> 7 -> 8 sides at level thresholds while preserving all existing stacks', () => {
    const state = createInitialState(777);
    state.stacks[0] = [
      { id: 101, color: 0, radialOffset: 0 },
      { id: 102, color: 1, radialOffset: 0 },
    ];
    state.stacks[5] = [{ id: 103, color: 2, radialOffset: 0 }];

    expect(getSidesForLevel(1)).toBe(6);
    expect(getSidesForLevel(3)).toBe(6);
    expect(getSidesForLevel(4)).toBe(7);
    expect(getSidesForLevel(6)).toBe(7);
    expect(getSidesForLevel(7)).toBe(8);
    expect(getSidesForLevel(35)).toBe(8);

    // Set cleared blocks just below Level 4 threshold, then clear 3 blocks on Face 2 to trigger Level 4 (Hepta Core)
    const clearsForLv4 = getClearedBlocksForLevel(4);
    state.totalClearedBlocks = clearsForLv4 - 2;
    state.level = 3;
    state.stacks[2] = [
      { id: 201, color: 3, radialOffset: 0 },
      { id: 202, color: 3, radialOffset: 0 },
      { id: 203, color: 3, radialOffset: 0 },
    ];

    resolveMatchesStep(state, 1);

    expect(state.level).toBeGreaterThanOrEqual(4);
    expect(state.numSides).toBe(7);
    expect(state.stacks).toHaveLength(7);
    // Existing stacks on Face 0 and Face 5 are 100% preserved
    expect(state.stacks[0].map((b) => b.id)).toEqual([101, 102]);
    expect(state.stacks[5].map((b) => b.id)).toEqual([103]);
    expect(state.stacks[6]).toEqual([]);

    // Now advance to Level 7 threshold -> morphs to 8-sided Octa Core
    const clearsForLv7 = getClearedBlocksForLevel(7);
    state.totalClearedBlocks = clearsForLv7 - 2;
    state.level = 6;
    state.stacks[3] = [
      { id: 301, color: 1, radialOffset: 0 },
      { id: 302, color: 1, radialOffset: 0 },
      { id: 303, color: 1, radialOffset: 0 },
    ];

    resolveMatchesStep(state, 1);

    expect(state.level).toBeGreaterThanOrEqual(7);
    expect(state.numSides).toBe(8);
    expect(state.stacks).toHaveLength(8);
    expect(state.stacks[0].map((b) => b.id)).toEqual([101, 102]);
    expect(state.stacks[5].map((b) => b.id)).toEqual([103]);
    expect(state.stacks[7]).toEqual([]);
  });

  it('increases difficulty monotonically from Level 1 to 35 and enforces the hard cap at Level 35', () => {
    let prev = getDifficultyForLevel(1);
    for (let lv = 2; lv <= CONFIG.MAX_DIFFICULTY_LEVEL; lv++) {
      const curr = getDifficultyForLevel(lv);
      expect(curr.speedMultiplier).toBeGreaterThanOrEqual(prev.speedMultiplier);
      expect(curr.fallSpeedPerSec).toBeGreaterThanOrEqual(prev.fallSpeedPerSec);
      expect(curr.waveIntervalMs).toBeLessThanOrEqual(prev.waveIntervalMs);
      prev = curr;
    }

    const cap35 = getDifficultyForLevel(35);
    const beyond50 = getDifficultyForLevel(50);
    const beyond99 = getDifficultyForLevel(99);

    expect(beyond50.effectiveLevel).toBe(35);
    expect(beyond50.speedMultiplier).toBe(cap35.speedMultiplier);
    expect(beyond50.fallSpeedPerSec).toBe(cap35.fallSpeedPerSec);
    expect(beyond99.waveIntervalMs).toBe(cap35.waveIntervalMs);
  });

  it('triggers GAME_OVER when any face stack exceeds MAX_STACK_DEPTH, and supports Phase Pulse compression', () => {
    const state = createInitialState(5050);

    // Fill Face 0 with exactly MAX_STACK_DEPTH (7) alternating non-matching blocks
    for (let d = 0; d < CONFIG.MAX_STACK_DEPTH; d++) {
      state.stacks[0].push({
        id: d + 1,
        color: (d % 2) as 0 | 1,
        radialOffset: 0,
      });
    }
    expect(checkContainmentBreach(state)).toBe(false);
    expect(state.status).toBe('PLAYING');

    // Charge and fire Phase Pulse to compress the innermost ring
    state.phasePulseCharge = CONFIG.PHASE_PULSE_MAX_CHARGE;
    applyInput(state, { type: 'PHASE_PULSE' });
    expect(state.stacks[0]).toHaveLength(CONFIG.MAX_STACK_DEPTH - 1);
    expect(state.phasePulseCharge).toBe(0);

    // Now push 2 more blocks onto Face 0 so its height is MAX_STACK_DEPTH + 1 (8)
    state.stacks[0].push({ id: 98, color: 2, radialOffset: 0 });
    state.stacks[0].push({ id: 99, color: 3, radialOffset: 0 });
    expect(state.stacks[0].length).toBe(CONFIG.MAX_STACK_DEPTH + 1);

    expect(checkContainmentBreach(state)).toBe(true);
    expect(state.status).toBe('GAME_OVER');
    expect(state.breachedFace).toBe(0);
  });

  it('produces deterministic wave sequences for identical seeds and round-trips save state cleanly', () => {
    const runA = createInitialState(20260808);
    const runB = createInitialState(20260808);

    for (let step = 0; step < 30; step++) {
      if (step === 5) {
        applyInput(runA, { type: 'ROTATE_RIGHT' });
        applyInput(runB, { type: 'ROTATE_RIGHT' });
      }
      if (step === 12) {
        applyInput(runA, { type: 'SLAM_INWARD' });
        applyInput(runB, { type: 'SLAM_INWARD' });
      }
      stepOrbitState(runA, 100);
      stepOrbitState(runB, 100);
    }

    expect(runA.rngState).toBe(runB.rngState);
    expect(runA.currentWavePattern).toBe(runB.currentWavePattern);
    expect(runA.fallingShards).toEqual(runB.fallingShards);
    expect(runA.stacks).toEqual(runB.stacks);

    // Verify persistence round-trip
    const career = createDefaultCareerStats();
    career.highScore = 4200;
    const raw = serializeOrbitEnvelope(career, runA);
    const restored = deserializeOrbitEnvelope(raw);

    expect(restored).not.toBeNull();
    expect(restored!.career.highScore).toBe(4200);
    expect(restored!.activeRun?.seed).toBe(20260808);
    expect(restored!.activeRun?.rngState).toBe(runA.rngState);
    expect(restored!.activeRun?.stacks).toEqual(runA.stacks);

    // Ensure resolveAllCascades helper also works cleanly
    expect(resolveAllCascades(restored!.activeRun!)).toBeGreaterThanOrEqual(0);
  });
});
