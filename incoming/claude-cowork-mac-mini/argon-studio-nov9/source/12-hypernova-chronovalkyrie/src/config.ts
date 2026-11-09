export const HYPERNOVA_CONFIG = {
  GAME_ID: '12-hypernova-chronovalkyrie',
  GAME_NUMBER: 12,
  TITLE: 'Hypernova: Chrono-Valkyrie',
  SUBTITLE: 'Apex Overdrive Bullet-Time Roguelite',
  VERSION: '1.0.0',
  DEFAULT_SEED: 1337077,
  ACCENT_COLOR: '#00f0ff',
  ARENA_WIDTH: 1280,
  ARENA_HEIGHT: 800,
  TICK_MS: 16.6667, // 60 FPS standard simulation tick
  MAX_DELTA_MS: 50, // Max frame accumulator step to avoid spiral of death

  // Player defaults
  BASE_SPEED: 320, // Pixels per second
  DASH_SPEED_MULTIPLIER: 2.8,
  DASH_DURATION_SEC: 0.35,
  DASH_COOLDOWN_SEC: 1.6,
  BASE_HULL: 100,
  BASE_SHIELD: 80,
  SHIELD_REGEN_DELAY_SEC: 3.5,
  SHIELD_REGEN_RATE: 24, // Shield HP restored per second
  GRAZE_RADIUS: 42, // Pixel distance beyond player radius where graze registers
  INVULNERABILITY_AFTER_HIT_SEC: 0.8,

  // Chrono-Drift (Bullet-Time)
  CHRONO_DRIFT_TIMESCALE: 0.22, // Simulation speed multiplier for world during drift
  CHRONO_DRIFT_DURATION_SEC: 1.2,
  CHRONO_ENERGY_MAX: 100,
  CHRONO_ENERGY_RECHARGE_RATE: 12, // Passive per sec
  CHRONO_ENERGY_GRAZE_BONUS: 16, // Instant energy per bullet graze
  CHRONO_ENERGY_COST: 40,

  // Combo Engine
  COMBO_DECAY_DELAY_SEC: 3.2,
  COMBO_DECAY_RATE_PER_SEC: 15,
  COMBO_TIERS: [
    { grade: 'D', threshold: 0, multiplier: 1.0, color: '#94a3b8' },
    { grade: 'C', threshold: 100, multiplier: 1.25, color: '#38bdf8' },
    { grade: 'B', threshold: 300, multiplier: 1.6, color: '#34d399' },
    { grade: 'A', threshold: 750, multiplier: 2.0, color: '#fbbf24' },
    { grade: 'S', threshold: 1600, multiplier: 2.8, color: '#f87171' },
    { grade: 'SS', threshold: 3200, multiplier: 4.0, color: '#c084fc' },
    { grade: 'SSS', threshold: 6000, multiplier: 6.5, color: '#f43f5e' },
    { grade: 'APEX', threshold: 10000, multiplier: 10.0, color: '#00f0ff' },
  ] as const,

  // Progression
  XP_BASE_REQUIRED: 60,
  XP_GROWTH_EXPONENT: 1.45,
  MAX_AUGMENT_CHOICES: 3,
  TOTAL_WAVES: 10,
  WAVE_DURATION_SEC: 45,

  // Visual Juice
  MAX_TRAUMA: 1.0,
  TRAUMA_DECAY_PER_SEC: 1.5,
  MAX_SHAKE_OFFSET_PX: 24,
  MAX_SHAKE_ROTATION_RAD: 0.05,
  HITSTOP_CRIT_MS: 45,
  HITSTOP_BOSS_KILL_MS: 160,
} as const;

export type ComboGrade = typeof HYPERNOVA_CONFIG.COMBO_TIERS[number]['grade'];
