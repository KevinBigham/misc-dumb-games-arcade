export const CONFIG = {
  GAME_ID: '11-metaphysical-deli',
  STORAGE_KEY: 'argon_game11_metaphysical_deli_save_v1',
  DEFAULT_SEED: 20261107,
  FIXED_STEP_MS: 50,

  // Non-Euclidean Kitchen Chamber Dimensions
  CHAMBER_WIDTH: 840,
  CHAMBER_HEIGHT: 520,

  // The Primordial Broth Vortex (Bottom Center Cauldron)
  VORTEX_X: 420,
  VORTEX_Y: 435,
  VORTEX_RADIUS: 78,

  // The Non-Euclidean Laser Pendulum Pivot
  PENDULUM_PIVOT_X: 420,
  PENDULUM_PIVOT_Y: 85,
  PENDULUM_LENGTH: 215,
  PENDULUM_BLADE_RADIUS: 36,

  // The Third Hand (Player Avatar)
  HAND_SPEED_PX_PER_SEC: 460,
  HAND_GRAB_RADIUS: 72,
  HAND_FLING_SPEED: 540,

  // Ego Sanity & Run Progression
  INITIAL_SANITY: 100,
  MAX_SANITY: 100,
  INITIAL_EGO_COINS: 45,
  PATRONS_FOR_VICTORY: 12,
  MAX_DIFFICULTY_LEVEL: 35,
  PATRONS_PER_FEVER_TIER: 2,

  // Chamber Entity Limits & Spawning
  MAX_FLOATING_INGREDIENTS: 11,
  BASE_SPAWN_INTERVAL_MS: 2200,
  MIN_SPAWN_INTERVAL_MS: 680,

  // Patron Booth Settings
  NUM_BOOTHS: 3,
  BASE_PATRON_PATIENCE_MS: 38000,
  MIN_PATRON_PATIENCE_MS: 14000,
  PATRON_IMPATIENCE_SANITY_PENALTY: 16,
  SERVE_SANITY_RESTORE: 12,

  // Reality Decree Rotation
  DECREE_DURATION_MS: 24000,

  // Paradox Freeze & Vending Costs
  PARADOX_MAX_CHARGE: 100,
  PARADOX_FREEZE_DURATION_MS: 4500,
  COST_SUMMON_ANOMALY: 15,
  COST_OVERCLOCK_PENDULUM: 25,
  COST_LIQUID_FRIDAY: 30,
  COST_INVERT_DECREE: 40,
} as const;

export type FlavorAxis = 'crunch' | 'nostalgia' | 'static' | 'chutzpah';

export interface FlavorProfile {
  crunch: number;
  nostalgia: number;
  static: number;
  chutzpah: number;
}

export interface DifficultyScaling {
  effectiveLevel: number;
  speedMultiplier: number;
  spawnIntervalMs: number;
  patronPatienceMs: number;
  pendulumSpeedRadPerSec: number;
  hazardChance: number;
}

/**
 * Monotonic difficulty curve from Level 1 to Level 35 (hard cap).
 */
export function getDifficultyForLevel(level: number): DifficultyScaling {
  const clamped = Math.max(1, Math.min(CONFIG.MAX_DIFFICULTY_LEVEL, Math.floor(level)));
  const progress = (clamped - 1) / (CONFIG.MAX_DIFFICULTY_LEVEL - 1);

  const speedMultiplier = Number((1 + progress * 1.65).toFixed(4));
  const spawnIntervalMs = Math.round(
    CONFIG.BASE_SPAWN_INTERVAL_MS -
      progress * (CONFIG.BASE_SPAWN_INTERVAL_MS - CONFIG.MIN_SPAWN_INTERVAL_MS)
  );
  const patronPatienceMs = Math.round(
    CONFIG.BASE_PATRON_PATIENCE_MS -
      progress * (CONFIG.BASE_PATRON_PATIENCE_MS - CONFIG.MIN_PATRON_PATIENCE_MS)
  );
  const pendulumSpeedRadPerSec = Number((1.45 + progress * 2.35).toFixed(4));
  const hazardChance = Number((0.08 + progress * 0.27).toFixed(4));

  return {
    effectiveLevel: clamped,
    speedMultiplier,
    spawnIntervalMs,
    patronPatienceMs,
    pendulumSpeedRadPerSec,
    hazardChance,
  };
}
