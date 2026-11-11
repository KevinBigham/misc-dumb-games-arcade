export const PARADOX_CONFIG = {
  GAME_ID: '11-paradox-protocol',
  GAME_NUMBER: 11,
  TITLE: 'Paradox Protocol: The Mirror Engine',
  SUBTITLE: 'Real-Time Philosophical Arena & Self-Cloning Thought-Experiment Thriller',
  ACCENT_COLOR: '#f43f5e',
  SECONDARY_COLOR: '#38bdf8',
  TERTIARY_COLOR: '#a855f7',
  DEFAULT_SEED: 20261107,
  FIXED_STEP_MS: 50, // 20 Hz deterministic simulation ticks

  ARENA_WIDTH: 760,
  ARENA_HEIGHT: 440,

  PLAYER_RADIUS: 15,
  PLAYER_BASE_SPEED: 220, // px per second
  PLAYER_DASH_SPEED: 420,
  PLAYER_MAX_HP: 100,
  PLAYER_MAX_ENERGY: 100,
  PLAYER_START_ENERGY: 50,

  CHAMBER_DURATION_SECONDS: 28,
  ACT_B_MIRROR_START_SECONDS: 14, // Halfway through each chamber, the Mirror Wave begins!
  TOTAL_CHAMBERS: 5,

  // Action costs & cooldowns
  INTERVENE_COOLDOWN_MS: 900,
  SIPHON_COOLDOWN_MS: 800,
  SWERVE_COOLDOWN_MS: 1400,
  SWERVE_ENERGY_COST: 18,
  CHRONO_BRAKE_DRAIN_PER_SEC: 22,

  // Scoring & telemetry weights
  POD_SAVED_SCORE: 180,
  POD_LOST_PENALTY: 60,
  SHARD_COLLECT_SCORE: 45,
  PREDICTION_BROKEN_BONUS: 250,
  BOSS_DEFEATED_BONUS: 1200,

  STORAGE_KEY: 'argon_game11_paradox_protocol_v1',
  SCHEMA_VERSION: 1,
} as const;
