export type Direction = 'N' | 'E' | 'S' | 'W';

export type VeinType = 'none' | 'copper_vein' | 'iron_vein' | 'crystal_vein';

export type ItemType =
  | 'CuCircle'
  | 'FeSquare'
  | 'AuStar'
  | 'CutHalf'
  | 'BoltedAlloy';

export type BlockType =
  | 'empty'
  | 'core'
  | 'miner'
  | 'belt'
  | 'splitter'
  | 'overclock_belt'
  | 'smelter'
  | 'silo'
  | 'bolt_turret'
  | 'scatter_turret'
  | 'arc_railgun'
  | 'wall';

export type EnemyType =
  | 'scout_drone'
  | 'swarm_wasp'
  | 'armored_bruiser'
  | 'siege_crawler'
  | 'shielded_dreadnought'
  | 'apex_goliath';

export type SplitterRatioMode = '1:1' | '2:1_A' | '2:1_B';

export interface WaveDefinition {
  wave: number;
  title: string;
  isBossWave: boolean;
  techUnlockNote?: string;
  rewardCredits: number;
  earlyLaunchBonus: number;
  spawns: Array<{
    enemyType: EnemyType;
    count: number;
    spacingTicks: number;
  }>;
}

export const DIRECTION_ORDER: readonly Direction[] = ['N', 'E', 'S', 'W'];

export const DIRECTION_DELTAS: Record<Direction, { dx: number; dy: number }> = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
};

export function rotateDirectionCW(dir: Direction): Direction {
  switch (dir) {
    case 'N':
      return 'E';
    case 'E':
      return 'S';
    case 'S':
      return 'W';
    case 'W':
      return 'N';
  }
}

export function oppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case 'N':
      return 'S';
    case 'E':
      return 'W';
    case 'S':
      return 'N';
    case 'W':
      return 'E';
  }
}

export const CONFIG = {
  GRID_SIZE: 12,
  CORE_DEFAULT_X: 5,
  CORE_DEFAULT_Y: 5,
  CORE_MAX_HP: 500,
  INITIAL_CREDITS: 150,
  REFUND_RATIO: 0.75,
  SHORT_GOAL_WAVE: 10,
  CAMPAIGN_MAX_WAVE: 30,
  TICK_INTERVAL_MS: 220,
  WAVE_PREP_TICKS: 25,
  EARLY_WAVE_BONUS_BASE: 20,

  // Producer / Processor / Storage parameters
  MINER_INTERVAL_TICKS: 1,
  SMELTER_PROCESS_TICKS: 1,
  SMELTER_INPUT_CAPACITY: 3,
  SILO_CAPACITY: 12,
  AMMO_PER_DELIVERED_ITEM: 2,

  // Quota milestones that grant bonus Core overcharge credits + tech points
  QUOTA_MILESTONES: [15, 60, 200, 600] as const,
  QUOTA_MILESTONE_REWARDS: [45, 90, 180, 350] as const,

  // Tech unlock waves
  TECH_UNLOCK_WAVES: [1, 3, 6, 9, 12] as const,

  STORAGE_KEY: 'argon_game09_belt_and_bolt_save_v1',
} as const;
