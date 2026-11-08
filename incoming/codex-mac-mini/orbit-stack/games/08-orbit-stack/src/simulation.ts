import {
  CONFIG,
  getDifficultyForLevel,
  getLevelFromClearedBlocks,
  getSidesForLevel,
} from './config';
import {
  BlockColorId,
  generateOrbitalWave,
  WavePatternType,
} from './content';
import { createSeededRng } from './rng';

export type GameStatus = 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

export type OrbitInputAction =
  | { type: 'ROTATE_LEFT' }
  | { type: 'ROTATE_RIGHT' }
  | { type: 'SLAM_INWARD' }
  | { type: 'PHASE_PULSE' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'CONTINUE_ENDLESS' };

export interface FallingShard {
  id: number;
  /** World orbital lane index in [0, numSides - 1] */
  lane: number;
  color: BlockColorId;
  /** Normalized radial distance from core surface (0.0 = core surface, 1.0 = outer spawn ring) */
  distance: number;
  /** True if player pressed Slam while this shard was airborne */
  slammed: boolean;
}

export interface StackedBlock {
  id: number;
  color: BlockColorId;
  /** Visual radial offset (> 0 while animating inward during gravity settling, decays to 0) */
  radialOffset: number;
}

export interface QueuedWaveShard {
  lane: number;
  color: BlockColorId;
  spawnTimerMs: number;
}

export interface MatchCell {
  face: number;
  depth: number;
  color: BlockColorId;
  blockId: number;
}

export interface MatchGroup {
  color: BlockColorId;
  cells: MatchCell[];
  facesInvolved: number[];
  isCrossFace: boolean;
}

export interface SimulationEvent {
  type:
    | 'ROTATED'
    | 'SHARD_LOCKED'
    | 'MATCH_CLEARED'
    | 'CASCADE_CLEARED'
    | 'POLYGON_MORPHED'
    | 'PHASE_PULSE_FIRED'
    | 'VICTORY_UNLOCKED'
    | 'GAME_OVER';
  face?: number;
  depth?: number;
  color?: BlockColorId;
  clearedCount?: number;
  scoreDelta?: number;
  comboMultiplier?: number;
  cascadeDepth?: number;
  newSides?: 6 | 7 | 8;
  cells?: MatchCell[];
}

export interface OrbitGameState {
  seed: number;
  rngState: number;
  status: GameStatus;
  elapsedMs: number;

  level: number;
  numSides: 6 | 7 | 8;
  /** Discrete polygon rotation index in [0, numSides - 1] */
  coreRotationIndex: number;
  /** Continuous signed step counter so UI can smoothly tween angles without wrap jumps */
  visualRotationSteps: number;

  /** Per-face radial stacks: stacks[face][depth] from innermost (0) to outermost */
  stacks: StackedBlock[][];
  /** Active airborne shards flying inward */
  fallingShards: FallingShard[];
  /** Pending shards from current wave waiting to enter outer ring */
  waveQueue: QueuedWaveShard[];

  currentWavePattern: WavePatternType;
  nextWaveCooldownMs: number;
  nextEntityId: number;

  /** Gravity settle timer before checking cascade chain matches */
  gravitySettleTimerMs: number;
  pendingCascadeDepth: number;

  score: number;
  totalClearedBlocks: number;
  comboCount: number;
  comboMultiplier: number;
  comboTimerMs: number;
  maxComboReached: number;

  phasePulseCharge: number;
  phasePulsesUsed: number;

  victoryUnlocked: boolean;
  victoryAcknowledged: boolean;
  breachedFace: number | null;

  /** Transient events emitted during the most recent step/action for UI & Audio consumption */
  events: SimulationEvent[];
}

/**
 * Maps a world orbital `lane` (`0 .. numSides - 1`) to the polygon `face` (`0 .. numSides - 1`)
 * currently rotated beneath that lane.
 */
export function getTargetFaceForLane(
  lane: number,
  coreRotationIndex: number,
  numSides: number
): number {
  return (((lane - coreRotationIndex) % numSides) + numSides) % numSides;
}

/**
 * Maps a polygon `face` (`0 .. numSides - 1`) to the world orbital `lane` (`0 .. numSides - 1`)
 * it currently faces.
 */
export function getWorldLaneForFace(
  face: number,
  coreRotationIndex: number,
  numSides: number
): number {
  return (((face + coreRotationIndex) % numSides) + numSides) % numSides;
}

/**
 * Creates a fresh deterministic `OrbitGameState` for the given seed.
 */
export function createInitialState(seed: number = CONFIG.DEFAULT_SEED): OrbitGameState {
  const rng = createSeededRng(seed);
  const numSides = CONFIG.HEX_SIDES;
  const stacks: StackedBlock[][] = Array.from({ length: numSides }, () => []);

  const state: OrbitGameState = {
    seed,
    rngState: rng.getState(),
    status: 'PLAYING',
    elapsedMs: 0,
    level: 1,
    numSides,
    coreRotationIndex: 0,
    visualRotationSteps: 0,
    stacks,
    fallingShards: [],
    waveQueue: [],
    currentWavePattern: 'SINGLE_STREAM',
    nextWaveCooldownMs: 350,
    nextEntityId: 1,
    gravitySettleTimerMs: 0,
    pendingCascadeDepth: 0,
    score: 0,
    totalClearedBlocks: 0,
    comboCount: 0,
    comboMultiplier: 1,
    comboTimerMs: 0,
    maxComboReached: 1,
    phasePulseCharge: CONFIG.PHASE_PULSE_INITIAL_CHARGE,
    phasePulsesUsed: 0,
    victoryUnlocked: false,
    victoryAcknowledged: false,
    breachedFace: null,
    events: [],
  };

  return state;
}

/**
 * Flood-fill connected-component matcher across the radial-polar grid.
 * Two blocks of the same color are connected if:
 *  1) They are on the same face at adjacent depths (`depth +/- 1`), OR
 *  2) They are at the same radial `depth` on adjacent faces (`(face +/- 1) % numSides`).
 * Returns all connected components with size >= `minMatchCount` (default 3).
 */
export function findConnectedMatches(
  stacks: readonly (readonly StackedBlock[])[],
  numSides: number,
  minMatchCount: number = CONFIG.MIN_MATCH_COUNT
): MatchGroup[] {
  const visited = new Set<string>();
  const groups: MatchGroup[] = [];

  const keyOf = (face: number, depth: number) => `${face}:${depth}`;

  for (let face = 0; face < numSides; face++) {
    const faceStack = stacks[face] ?? [];
    for (let depth = 0; depth < faceStack.length; depth++) {
      const startKey = keyOf(face, depth);
      if (visited.has(startKey)) continue;

      const targetColor = faceStack[depth].color;
      const queue: Array<{ f: number; d: number }> = [{ f: face, d: depth }];
      visited.add(startKey);

      const component: MatchCell[] = [];
      const facesSet = new Set<number>();

      while (queue.length > 0) {
        const current = queue.shift()!;
        const block = stacks[current.f]?.[current.d];
        if (!block) continue;

        component.push({
          face: current.f,
          depth: current.d,
          color: block.color,
          blockId: block.id,
        });
        facesSet.add(current.f);

        // 4-way polar grid neighbors: inner, outer, counter-clockwise face, clockwise face
        const leftFace = (current.f - 1 + numSides) % numSides;
        const rightFace = (current.f + 1) % numSides;

        const neighbors = [
          { f: current.f, d: current.d - 1 },
          { f: current.f, d: current.d + 1 },
          { f: leftFace, d: current.d },
          { f: rightFace, d: current.d },
        ];

        for (const nb of neighbors) {
          if (nb.d < 0) continue;
          const nbStack = stacks[nb.f];
          if (!nbStack || nb.d >= nbStack.length) continue;
          const nbKey = keyOf(nb.f, nb.d);
          if (visited.has(nbKey)) continue;
          if (nbStack[nb.d].color === targetColor) {
            visited.add(nbKey);
            queue.push(nb);
          }
        }
      }

      if (component.length >= minMatchCount) {
        groups.push({
          color: targetColor,
          cells: component,
          facesInvolved: Array.from(facesSet).sort((a, b) => a - b),
          isCrossFace: facesSet.size > 1,
        });
      }
    }
  }

  return groups;
}

/**
 * Expands the central polygon from 6 -> 7 -> 8 sides while preserving all existing stacks.
 */
export function morphPolygonSides(state: OrbitGameState, newSides: 6 | 7 | 8): void {
  if (newSides <= state.numSides) return;
  while (state.stacks.length < newSides) {
    state.stacks.push([]);
  }
  state.numSides = newSides;
  state.coreRotationIndex = ((state.coreRotationIndex % newSides) + newSides) % newSides;
  for (const shard of state.fallingShards) {
    shard.lane = ((shard.lane % newSides) + newSides) % newSides;
  }
  for (const queued of state.waveQueue) {
    queued.lane = ((queued.lane % newSides) + newSides) % newSides;
  }
  state.events.push({
    type: 'POLYGON_MORPHED',
    newSides,
  });
}

/**
 * Resolves any currently connected 3+ matches, applies gravity inward to outer blocks,
 * updates score/combo/level/polygon-morphing, and records whether outer blocks dropped
 * so a subsequent cascade check can fire.
 */
export function resolveMatchesStep(
  state: OrbitGameState,
  cascadeDepth: number = 1
): { clearedBlocks: number; outerBlocksDropped: boolean } {
  const groups = findConnectedMatches(state.stacks, state.numSides);
  if (groups.length === 0) {
    return { clearedBlocks: 0, outerBlocksDropped: false };
  }

  const toRemoveByFace = new Map<number, Set<number>>();
  let totalRemoved = 0;
  let anyCrossFace = false;
  const allClearedCells: MatchCell[] = [];

  for (const group of groups) {
    if (group.isCrossFace) anyCrossFace = true;
    for (const cell of group.cells) {
      if (!toRemoveByFace.has(cell.face)) {
        toRemoveByFace.set(cell.face, new Set());
      }
      const set = toRemoveByFace.get(cell.face)!;
      if (!set.has(cell.depth)) {
        set.add(cell.depth);
        totalRemoved++;
        allClearedCells.push(cell);
      }
    }
  }

  let outerBlocksDropped = false;

  // Remove matched blocks and apply inward radial gravity to surviving blocks above gaps
  for (const [face, depthsSet] of toRemoveByFace.entries()) {
    const oldStack = state.stacks[face];
    const newStack: StackedBlock[] = [];
    let removedBelowCount = 0;

    for (let d = 0; d < oldStack.length; d++) {
      if (depthsSet.has(d)) {
        removedBelowCount++;
      } else {
        const surviving = oldStack[d];
        if (removedBelowCount > 0) {
          outerBlocksDropped = true;
          surviving.radialOffset += removedBelowCount * CONFIG.BLOCK_RADIAL_THICKNESS;
        }
        newStack.push(surviving);
      }
    }

    state.stacks[face] = newStack;
  }

  // Update combo state
  state.comboCount += 1;
  state.comboTimerMs = CONFIG.COMBO_WINDOW_MS;
  const crossFaceChainBonus = anyCrossFace && totalRemoved >= 4 ? 1 : 0;
  state.comboMultiplier = Math.min(
    CONFIG.MAX_COMBO_MULTIPLIER,
    1 + Math.floor((state.comboCount + crossFaceChainBonus) / 1)
  );
  if (state.comboMultiplier > state.maxComboReached) {
    state.maxComboReached = state.comboMultiplier;
  }

  // Compute score
  const crossMultiplier = anyCrossFace ? CONFIG.CROSS_FACE_BONUS_MULTIPLIER : 1.0;
  const cascadeMultiplier = cascadeDepth > 1 ? Math.pow(CONFIG.CASCADE_BONUS_MULTIPLIER, cascadeDepth - 1) : 1.0;
  const sizeBonus = totalRemoved > 3 ? 1 + (totalRemoved - 3) * 0.25 : 1.0;
  const scoreDelta = Math.round(
    totalRemoved *
      CONFIG.BASE_BLOCK_SCORE *
      state.comboMultiplier *
      crossMultiplier *
      cascadeMultiplier *
      sizeBonus
  );

  state.score += scoreDelta;
  state.totalClearedBlocks += totalRemoved;

  // Charge Phase Pulse meter
  const pulseGain =
    totalRemoved * CONFIG.PHASE_PULSE_CHARGE_PER_BLOCK +
    (anyCrossFace ? CONFIG.PHASE_PULSE_CROSS_FACE_BONUS : 0);
  state.phasePulseCharge = Math.min(
    CONFIG.PHASE_PULSE_MAX_CHARGE,
    state.phasePulseCharge + pulseGain
  );

  const primaryCell = allClearedCells[0];
  state.events.push({
    type: cascadeDepth > 1 ? 'CASCADE_CLEARED' : 'MATCH_CLEARED',
    face: primaryCell?.face,
    depth: primaryCell?.depth,
    color: primaryCell?.color,
    clearedCount: totalRemoved,
    scoreDelta,
    comboMultiplier: state.comboMultiplier,
    cascadeDepth,
    cells: allClearedCells,
  });

  // Check level progression & dynamic polygon morph (6 -> 7 -> 8)
  const newLevel = getLevelFromClearedBlocks(state.totalClearedBlocks);
  if (newLevel > state.level) {
    state.level = newLevel;
    const requiredSides = getSidesForLevel(state.level);
    if (requiredSides > state.numSides) {
      morphPolygonSides(state, requiredSides);
    }
  }

  // Check short-goal Victory condition
  if (
    !state.victoryUnlocked &&
    state.level >= CONFIG.VICTORY_TARGET_LEVEL &&
    state.totalClearedBlocks >= CONFIG.VICTORY_TARGET_CLEARS
  ) {
    state.victoryUnlocked = true;
    if (!state.victoryAcknowledged) {
      state.status = 'VICTORY';
    }
    state.events.push({ type: 'VICTORY_UNLOCKED' });
  }

  return { clearedBlocks: totalRemoved, outerBlocksDropped };
}

/**
 * Synchronously settles gravity and resolves all cascading chain matches to completion.
 * Useful for deterministic multi-step tests and instant cascade evaluation.
 */
export function resolveAllCascades(state: OrbitGameState): number {
  let depth = 1;
  let totalCleared = 0;
  while (depth <= 12) {
    const res = resolveMatchesStep(state, depth);
    if (res.clearedBlocks === 0) break;
    totalCleared += res.clearedBlocks;
    for (const faceStack of state.stacks) {
      for (const b of faceStack) {
        b.radialOffset = 0;
      }
    }
    if (!res.outerBlocksDropped) break;
    depth++;
  }
  state.gravitySettleTimerMs = 0;
  state.pendingCascadeDepth = 0;
  return totalCleared;
}

/**
 * Checks whether any polygon face stack has exceeded `CONFIG.MAX_STACK_DEPTH`.
 */
export function checkContainmentBreach(state: OrbitGameState): boolean {
  for (let face = 0; face < state.numSides; face++) {
    const stack = state.stacks[face];
    if (stack && stack.length > CONFIG.MAX_STACK_DEPTH) {
      state.status = 'GAME_OVER';
      state.breachedFace = face;
      state.events.push({
        type: 'GAME_OVER',
        face,
      });
      return true;
    }
  }
  return false;
}

/**
 * Applies a discrete player input action (`ROTATE_LEFT`, `ROTATE_RIGHT`, `SLAM_INWARD`, `PHASE_PULSE`, etc.).
 */
export function applyInput(state: OrbitGameState, action: OrbitInputAction): OrbitGameState {
  if (action.type === 'TOGGLE_PAUSE') {
    if (state.status === 'PLAYING') {
      state.status = 'PAUSED';
    } else if (state.status === 'PAUSED') {
      state.status = 'PLAYING';
    }
    return state;
  }

  if (action.type === 'CONTINUE_ENDLESS') {
    if (state.status === 'VICTORY') {
      state.victoryAcknowledged = true;
      state.status = 'PLAYING';
    }
    return state;
  }

  if (state.status !== 'PLAYING') {
    return state;
  }

  if (action.type === 'ROTATE_LEFT') {
    state.coreRotationIndex =
      (state.coreRotationIndex - 1 + state.numSides) % state.numSides;
    state.visualRotationSteps -= 1;
    state.events.push({ type: 'ROTATED' });
    return state;
  }

  if (action.type === 'ROTATE_RIGHT') {
    state.coreRotationIndex = (state.coreRotationIndex + 1) % state.numSides;
    state.visualRotationSteps += 1;
    state.events.push({ type: 'ROTATED' });
    return state;
  }

  if (action.type === 'SLAM_INWARD') {
    // Mark the closest airborne shard (or all currently active shards) as slammed
    if (state.fallingShards.length > 0) {
      let closest = state.fallingShards[0];
      for (const s of state.fallingShards) {
        if (!s.slammed && s.distance < closest.distance) {
          closest = s;
        }
      }
      closest.slammed = true;
    }
    return state;
  }

  if (action.type === 'PHASE_PULSE') {
    if (state.phasePulseCharge >= CONFIG.PHASE_PULSE_MAX_CHARGE) {
      state.phasePulseCharge = 0;
      state.phasePulsesUsed += 1;

      let compressedBlocks = 0;
      const pulseCells: MatchCell[] = [];

      for (let face = 0; face < state.numSides; face++) {
        const stack = state.stacks[face];
        if (stack && stack.length > 0) {
          const removed = stack.shift()!;
          compressedBlocks++;
          pulseCells.push({
            face,
            depth: 0,
            color: removed.color,
            blockId: removed.id,
          });
          for (const b of stack) {
            b.radialOffset += CONFIG.BLOCK_RADIAL_THICKNESS;
          }
        }
      }

      const bonusScore = Math.max(
        CONFIG.PHASE_PULSE_SCORE_BONUS,
        compressedBlocks * 45
      );
      state.score += bonusScore;
      state.totalClearedBlocks += compressedBlocks;

      state.events.push({
        type: 'PHASE_PULSE_FIRED',
        clearedCount: compressedBlocks,
        scoreDelta: bonusScore,
        cells: pulseCells,
      });

      // Check level & morph after Phase Pulse clears
      const newLevel = getLevelFromClearedBlocks(state.totalClearedBlocks);
      if (newLevel > state.level) {
        state.level = newLevel;
        const requiredSides = getSidesForLevel(state.level);
        if (requiredSides > state.numSides) {
          morphPolygonSides(state, requiredSides);
        }
      }

      // Schedule cascade check after pulse compression
      const cascadeRes = resolveMatchesStep(state, 2);
      if (cascadeRes.outerBlocksDropped) {
        state.gravitySettleTimerMs = 95;
        state.pendingCascadeDepth = 3;
      }
    }
    return state;
  }

  return state;
}

/**
 * Advances the Orbit Stack simulation by `dtMs` milliseconds.
 */
export function stepOrbitState(state: OrbitGameState, dtMs: number): OrbitGameState {
  if (state.status !== 'PLAYING' || dtMs <= 0) {
    return state;
  }

  state.elapsedMs += dtMs;
  const difficulty = getDifficultyForLevel(state.level);
  const rng = createSeededRng(state.seed);
  rng.setState(state.rngState);

  // 1. Update combo decay timer
  if (state.comboTimerMs > 0) {
    state.comboTimerMs = Math.max(0, state.comboTimerMs - dtMs);
    if (state.comboTimerMs === 0) {
      state.comboCount = 0;
      state.comboMultiplier = 1;
    }
  }

  // 2. Animate radial gravity offset on stacked blocks
  const settleDelta = (CONFIG.GRAVITY_SETTLE_SPEED_PER_SEC * dtMs) / 1000;
  for (let face = 0; face < state.numSides; face++) {
    const stack = state.stacks[face];
    if (!stack) continue;
    for (const block of stack) {
      if (block.radialOffset > 0) {
        block.radialOffset = Math.max(0, block.radialOffset - settleDelta);
      }
    }
  }

  // 3. Process pending gravity cascade check
  if (state.gravitySettleTimerMs > 0) {
    state.gravitySettleTimerMs = Math.max(0, state.gravitySettleTimerMs - dtMs);
    if (state.gravitySettleTimerMs === 0 && state.pendingCascadeDepth > 0) {
      const depth = state.pendingCascadeDepth;
      state.pendingCascadeDepth = 0;
      const cascadeResult = resolveMatchesStep(state, depth);
      if (cascadeResult.outerBlocksDropped) {
        state.gravitySettleTimerMs = 95;
        state.pendingCascadeDepth = depth + 1;
      }
    }
  }

  // 4. Wave generation & queued shard spawning
  for (let i = state.waveQueue.length - 1; i >= 0; i--) {
    const q = state.waveQueue[i];
    q.spawnTimerMs -= dtMs;
    if (q.spawnTimerMs <= 0) {
      state.fallingShards.push({
        id: state.nextEntityId++,
        lane: q.lane % state.numSides,
        color: q.color,
        distance: CONFIG.SPAWN_RADIAL_DISTANCE,
        slammed: false,
      });
      state.waveQueue.splice(i, 1);
    }
  }

  state.nextWaveCooldownMs -= dtMs;
  if (state.nextWaveCooldownMs <= 0 && state.waveQueue.length === 0) {
    const wave = generateOrbitalWave(
      rng,
      state.level,
      state.numSides,
      difficulty.activeColorCount,
      difficulty.waveIntervalMs,
      difficulty.intraWaveStepMs
    );
    state.currentWavePattern = wave.pattern;
    state.nextWaveCooldownMs = wave.durationMs;

    for (const s of wave.shards) {
      if (s.delayMs <= 0) {
        state.fallingShards.push({
          id: state.nextEntityId++,
          lane: s.lane % state.numSides,
          color: s.color,
          distance: CONFIG.SPAWN_RADIAL_DISTANCE,
          slammed: false,
        });
      } else {
        state.waveQueue.push({
          lane: s.lane % state.numSides,
          color: s.color,
          spawnTimerMs: s.delayMs,
        });
      }
    }
  }

  // 5. Advance airborne falling shards inward and check lock against target polygon face stack
  // Sort by distance ascending so inner shards lock first
  state.fallingShards.sort((a, b) => a.distance - b.distance);

  const remainingShards: FallingShard[] = [];
  let anyShardLocked = false;

  for (const shard of state.fallingShards) {
    const speed =
      difficulty.fallSpeedPerSec *
      (shard.slammed ? CONFIG.SLAM_SPEED_MULTIPLIER : 1.0);
    shard.distance -= (speed * dtMs) / 1000;

    const targetFace = getTargetFaceForLane(
      shard.lane,
      state.coreRotationIndex,
      state.numSides
    );
    const faceStack = state.stacks[targetFace];
    const landingSurfaceDistance =
      (faceStack.length + 1) * CONFIG.BLOCK_RADIAL_THICKNESS;

    if (shard.distance <= landingSurfaceDistance) {
      // Lock shard onto the target polygon face
      const lockedBlock: StackedBlock = {
        id: shard.id,
        color: shard.color,
        radialOffset: 0,
      };
      faceStack.push(lockedBlock);
      anyShardLocked = true;

      if (shard.slammed) {
        state.score += CONFIG.SLAM_SCORE_BONUS_PER_BLOCK;
      }

      state.events.push({
        type: 'SHARD_LOCKED',
        face: targetFace,
        depth: faceStack.length - 1,
        color: shard.color,
      });
    } else {
      remainingShards.push(shard);
    }
  }

  state.fallingShards = remainingShards;

  // 6. If any shard locked, evaluate immediate connected matches, cascades, and containment breach
  if (anyShardLocked) {
    const matchRes = resolveMatchesStep(state, 1);
    if (matchRes.outerBlocksDropped) {
      state.gravitySettleTimerMs = 95;
      state.pendingCascadeDepth = 2;
    }
    checkContainmentBreach(state);
  }

  state.rngState = rng.getState();
  return state;
}
