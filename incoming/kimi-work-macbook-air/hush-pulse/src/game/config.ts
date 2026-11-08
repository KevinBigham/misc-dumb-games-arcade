export const INPUT_CONFIG = {
  MOUSE_SENS_X: 0.0026,
  MOUSE_SENS_Y: 0.0022,
  INVERT_X: false,
  INVERT_Y: false,
} as const;

export const GAME = {
  ARENA_RADIUS: 20,
  MAX_ENEMIES: 30,
  MAX_PROJECTILES: 56,
  MAX_PULSES: 24,
  MAX_PARTICLES: 420,
  PLAYER_SPEED: 7.2,
  HUSH_SPEED: 3.25,
  PLAYER_RADIUS: 0.55,
  PLAYER_HP: 100,
  FIRE_INTERVAL: 0.235,
  BOLT_SPEED: 21,
  BOLT_DAMAGE: 1,
  PULSE_COOLDOWN: 1.55,
  PULSE_RADIUS: 11,
  PULSE_SPEED: 15,
  DECOY_COOLDOWN: 7,
  FIXED_STEP: 1 / 60,
} as const;

export const COLORS = {
  void: 0x03040a,
  cyan: 0x72f7e6,
  cyanHot: 0xc7fff5,
  magenta: 0xff3b81,
  violet: 0x9d62ff,
  amber: 0xffc857,
  red: 0xff355e,
  white: 0xf4f0e8,
} as const;

export const QUALITY = {
  DPR_MAX: 1.75,
  PARTICLES_HIGH: 420,
  PARTICLES_LOW: 180,
  DEGRADE_FPS: 42,
} as const;
