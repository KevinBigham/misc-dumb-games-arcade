export const GAME_CONFIG = {
  ID: '10-ten-floors-down',
  TITLE: 'Ten Floors Down',
  SUBTITLE: '10-Floor Tactical Alchemy Roguelike',
  MAX_FLOORS: 10,
  MINI_BOSS_FLOOR: 5,
  FINAL_BOSS_FLOOR: 10,
  GRID_WIDTH: 26,
  GRID_HEIGHT: 18,
  FOV_RADIUS: 6,
  MAX_INVENTORY_SLOTS: 6,
  THROW_RANGE: 6,
  DEFAULT_MOVE_TICKS: 10,
  ROGUE_MOVE_TICKS: 8,
  WAIT_TICKS: 10,
  POTION_USE_TICKS: 10,
  SCROLL_USE_TICKS: 10,
  ALCHEMY_USE_TICKS: 10,
  STORAGE_KEY_ACTIVE_RUN: 'argon_g10_ten_floors_active_run_v1',
  STORAGE_KEY_CHRONICLES: 'argon_g10_ten_floors_chronicles_v1',
  ACCENT_COLOR: '#10b981',
} as const;

export type PotionColorId =
  | 'crimson'
  | 'amber'
  | 'viridian'
  | 'azure'
  | 'violet'
  | 'obsidian';

export type PotionEffectId =
  | 'mending'
  | 'liquid_flame'
  | 'frost_mist'
  | 'might'
  | 'shadow_veil'
  | 'caustic_gas';

export type HeroClassId = 'vanguard' | 'rogue' | 'alchemist';

export type TileType =
  | 'wall'
  | 'floor'
  | 'door'
  | 'stairs_up'
  | 'stairs_down'
  | 'alchemy_desk';

export type HazardType = 'fire' | 'frost' | 'caustic';
