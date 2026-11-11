export const ASTRAL_CONFIG = {
  GAME_ID: '12-astral-pinball',
  GAME_NUMBER: 12,
  TITLE: 'Oroboros: The Pinball Singularity',
  SUBTITLE: 'Relativistic Pinball Roguelike, Orbital Gravity Wells & Multiplicative Chip×Mult Alchemy',
  ACCENT_COLOR: '#f59e0b',
  DEFAULT_SEED: 20261108,

  TABLE_WIDTH: 920,
  TABLE_HEIGHT: 600,
  FIXED_STEP_MS: 16,

  // Physics constants (px and seconds)
  GRAVITY_Y: 165,
  MAX_COMET_SPEED: 680,
  MIN_COMET_SPEED: 145,
  COMET_RADIUS: 10,
  MAX_ACTIVE_COMETS: 14,
  LAUNCH_ORIGIN_X: 460,
  LAUNCH_ORIGIN_Y: 538,
  LAUNCH_SPEED: 470,

  // Flippers & Aegis Paddle
  PADDLE_Y: 556,
  PADDLE_HALF_WIDTH: 84,
  FLIPPER_SWING_DURATION_MS: 160,
  PARRY_WINDOW_MS: 150,

  // Economy & Resources
  STARTING_VOLLEYS: 5,
  STARTING_AEGIS_HULL: 100,
  MAX_AEGIS_HULL: 100,
  STARTING_STARDUST: 110,
  STARTING_FLUX: 60,
  MAX_FLUX: 100,

  FLUX_COST_MAGNET: 25,
  FLUX_COST_CHRONO: 30,
  FLUX_COST_SUPERNOVA: 45,

  BASE_COMET_CHIPS: 30,
  MAX_SECTORS: 5,
} as const;
