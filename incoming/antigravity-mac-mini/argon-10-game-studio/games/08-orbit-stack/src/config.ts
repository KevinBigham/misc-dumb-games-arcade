export interface LevelDifficultyProfile {
  level: number;
  effectiveLevel: number;
  numSides: 6 | 7 | 8;
  activeColorCount: 4 | 5;
  /** Radial speed in normalized distance units per second (spawn is 1.0, core surface is 0.0) */
  fallSpeedPerSec: number;
  /** Delay in milliseconds between waves */
  waveIntervalMs: number;
  /** Delay in milliseconds between shards within a multi-shard wave */
  intraWaveStepMs: number;
  /** Speed multiplier relative to Level 1 */
  speedMultiplier: number;
}

export const CONFIG = {
  GAME_ID: '08-orbit-stack',
  STORAGE_KEY: 'argon_game08_orbit_stack_v1',
  DEFAULT_SEED: 80802026,
  FIXED_STEP_MS: 1000 / 60,

  /** Radial stack capacity per polygon face before outer red perimeter breach */
  MAX_STACK_DEPTH: 7,
  /** Warning threshold on a face (triggers pulsing danger indicator) */
  DANGER_STACK_DEPTH: 5,

  /** Minimum connected same-color blocks (radial + angular neighbors) to clear */
  MIN_MATCH_COUNT: 3,

  /** Polygon morph level thresholds */
  HEX_SIDES: 6 as const,
  HEPTA_SIDES: 7 as const,
  OCTA_SIDES: 8 as const,
  HEPTA_UNLOCK_LEVEL: 4,
  OCTA_UNLOCK_LEVEL: 7,

  /** Short-goal Victory milestone */
  VICTORY_TARGET_LEVEL: 8,
  VICTORY_TARGET_CLEARS: 100,

  /** Hard difficulty cap modeled after Hextris wavegen */
  MAX_DIFFICULTY_LEVEL: 35,

  /** Normalized radial coordinate system:
   *  0.0 = surface of central polygon core
   *  Each stacked block occupies BLOCK_RADIAL_THICKNESS (0.105)
   *  7 blocks = 0.735 -> outer containment ring is at 0.735
   *  1.0 = outer orbital spawn ring
   */
  BLOCK_RADIAL_THICKNESS: 0.105,
  SPAWN_RADIAL_DISTANCE: 1.0,

  /** Fast-drop / Slam multiplier when player presses Space / Down */
  SLAM_SPEED_MULTIPLIER: 5.5,
  SLAM_SCORE_BONUS_PER_BLOCK: 15,

  /** Gravity settling speed when inner blocks clear and outer blocks drop inward */
  GRAVITY_SETTLE_SPEED_PER_SEC: 3.4,

  /** Combo window & multiplier settings */
  COMBO_WINDOW_MS: 2600,
  MAX_COMBO_MULTIPLIER: 8,

  /** Phase Pulse (emergency radial compression ability) */
  PHASE_PULSE_MAX_CHARGE: 100,
  PHASE_PULSE_INITIAL_CHARGE: 50,
  PHASE_PULSE_CHARGE_PER_BLOCK: 7,
  PHASE_PULSE_CROSS_FACE_BONUS: 14,
  PHASE_PULSE_SCORE_BONUS: 150,

  /** Base scoring */
  BASE_BLOCK_SCORE: 50,
  CROSS_FACE_BONUS_MULTIPLIER: 1.5,
  CASCADE_BONUS_MULTIPLIER: 1.35,
} as const;

/**
 * Returns the polygon side count (6 -> 7 -> 8) for a given level.
 */
export function getSidesForLevel(level: number): 6 | 7 | 8 {
  if (level >= CONFIG.OCTA_UNLOCK_LEVEL) {
    return CONFIG.OCTA_SIDES;
  }
  if (level >= CONFIG.HEPTA_UNLOCK_LEVEL) {
    return CONFIG.HEPTA_SIDES;
  }
  return CONFIG.HEX_SIDES;
}

/**
 * Returns how many block colors/glyphs are active at a given level.
 * Levels 1-3 use 4 colors; Levels 4+ unlock the 5th color.
 */
export function getColorCountForLevel(level: number): 4 | 5 {
  return level >= CONFIG.HEPTA_UNLOCK_LEVEL ? 5 : 4;
}

/**
 * Returns the cumulative cleared blocks required to reach `level`.
 * Level 1 starts at 0 cleared blocks.
 */
export function getClearedBlocksForLevel(level: number): number {
  if (level <= 1) return 0;
  // Smooth progression: L2=5, L3=11, L4(Hepta)=18, L5=26, L6=35, L7(Octa)=45, L8(Victory)=56...
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += 4 + Math.min(14, l);
  }
  return total;
}

/**
 * Computes the current level from total cleared blocks.
 */
export function getLevelFromClearedBlocks(clearedBlocks: number): number {
  let level = 1;
  while (getClearedBlocksForLevel(level + 1) <= clearedBlocks) {
    level++;
  }
  return level;
}

/**
 * Hextris-inspired two-stage difficulty curve:
 * - Brisk early ramp from Level 1 to Level 10
 * - Asymptotic flattening from Level 11 to Level 35
 * - Hard cap at Level 35 (`CONFIG.MAX_DIFFICULTY_LEVEL`)
 */
export function getDifficultyForLevel(rawLevel: number): LevelDifficultyProfile {
  const level = Math.max(1, Math.floor(rawLevel));
  const effectiveLevel = Math.min(CONFIG.MAX_DIFFICULTY_LEVEL, level);

  // Stage 1 (L1..L10): rises from 0.0 to 0.62
  // Stage 2 (L11..L35): rises smoothly from 0.62 to 1.00
  let progress01 = 0;
  if (effectiveLevel <= 10) {
    progress01 = ((effectiveLevel - 1) / 9) * 0.62;
  } else {
    const post10 = (effectiveLevel - 10) / (CONFIG.MAX_DIFFICULTY_LEVEL - 10);
    // Concave easing so it flattens toward Level 35
    progress01 = 0.62 + (1 - Math.pow(1 - post10, 1.65)) * 0.38;
  }

  const speedMultiplier = Number((1 + progress01 * 1.45).toFixed(4));
  const fallSpeedPerSec = Number((0.26 * speedMultiplier).toFixed(4));
  const waveIntervalMs = Math.round(1580 - progress01 * 860); // 1580ms down to 720ms at cap
  const intraWaveStepMs = Math.round(340 - progress01 * 155); // 340ms down to 185ms at cap

  return {
    level,
    effectiveLevel,
    numSides: getSidesForLevel(level),
    activeColorCount: getColorCountForLevel(level),
    fallSpeedPerSec,
    waveIntervalMs,
    intraWaveStepMs,
    speedMultiplier,
  };
}
