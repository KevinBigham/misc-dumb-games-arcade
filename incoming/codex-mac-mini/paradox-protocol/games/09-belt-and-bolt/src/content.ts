import {
  BlockType,
  CONFIG,
  EnemyType,
  ItemType,
  VeinType,
  WaveDefinition,
} from './config';

export interface ItemMetadata {
  id: ItemType;
  code: string;
  name: string;
  tier: 'raw' | 'refined';
  color: string;
  strokeColor: string;
  shapeKind: 'circle' | 'square' | 'star' | 'wedge' | 'bolt';
  creditValue: number;
  quotaValue: number;
  damageMultiplier: number;
  pierceBonus: number;
  refinedInto: ItemType | null;
  description: string;
}

export const ITEMS: Record<ItemType, ItemMetadata> = {
  CuCircle: {
    id: 'CuCircle',
    code: 'CuCu',
    name: 'Raw Copper Circle',
    tier: 'raw',
    color: '#f97316',
    strokeColor: '#fdba74',
    shapeKind: 'circle',
    creditValue: 4,
    quotaValue: 1,
    damageMultiplier: 1.0,
    pierceBonus: 0,
    refinedInto: 'CutHalf',
    description: 'Standard kinetic round (1.0x turret dmg) or 4 Core credits.',
  },
  FeSquare: {
    id: 'FeSquare',
    code: 'FeFe',
    name: 'Raw Iron Square',
    tier: 'raw',
    color: '#60a5fa',
    strokeColor: '#bfdbfe',
    shapeKind: 'square',
    creditValue: 6,
    quotaValue: 2,
    damageMultiplier: 1.4,
    pierceBonus: 0,
    refinedInto: 'BoltedAlloy',
    description: 'Dense iron slug (1.4x turret dmg) or refine in Smelter -> BoltedAlloy.',
  },
  AuStar: {
    id: 'AuStar',
    code: 'AuAu',
    name: 'Crystal Star Ore',
    tier: 'raw',
    color: '#facc15',
    strokeColor: '#fef08a',
    shapeKind: 'star',
    creditValue: 10,
    quotaValue: 4,
    damageMultiplier: 1.8,
    pierceBonus: 1,
    refinedInto: 'BoltedAlloy',
    description: 'High-value crystal star (1.8x turret dmg, 10 Core credits).',
  },
  CutHalf: {
    id: 'CutHalf',
    code: 'CuHalf',
    name: 'Cut Copper Wedge',
    tier: 'refined',
    color: '#fb923c',
    strokeColor: '#ffedd5',
    shapeKind: 'wedge',
    creditValue: 8,
    quotaValue: 3,
    damageMultiplier: 2.0,
    pierceBonus: 1,
    refinedInto: null,
    description: 'Precision-cut copper wedge (2.0x turret dmg, 2x Core credit value).',
  },
  BoltedAlloy: {
    id: 'BoltedAlloy',
    code: 'FeBolt',
    name: 'Refined Bolt Ammo',
    tier: 'refined',
    color: '#38bdf8',
    strokeColor: '#e0f2fe',
    shapeKind: 'bolt',
    creditValue: 12,
    quotaValue: 5,
    damageMultiplier: 2.5,
    pierceBonus: 2,
    refinedInto: null,
    description: 'Smelted hyper-velocity bolt (2.5x turret dmg + armor pierce, 2x Core credit value).',
  },
};

export const VEIN_TO_ITEM: Record<VeinType, ItemType> = {
  none: 'CuCircle',
  copper_vein: 'CuCircle',
  iron_vein: 'FeSquare',
  crystal_vein: 'AuStar',
};

export interface BlockMetadata {
  id: BlockType;
  name: string;
  shortLabel: string;
  hotkey: string;
  cost: number;
  maxHp: number;
  unlockWave: number;
  category: 'core' | 'production' | 'logistics' | 'processing' | 'defense';
  color: string;
  accentColor: string;
  rotatable: boolean;
  isTurret: boolean;
  turretRange?: number;
  turretBaseDamage?: number;
  turretFireIntervalTicks?: number;
  turretMaxAmmo?: number;
  turretTargetsPerShot?: number;
  turretAntiBossMultiplier?: number;
  description: string;
}

export const BLOCKS: Record<BlockType, BlockMetadata> = {
  empty: {
    id: 'empty',
    name: 'Empty Deck',
    shortLabel: '',
    hotkey: '',
    cost: 0,
    maxHp: 0,
    unlockWave: 1,
    category: 'logistics',
    color: '#111827',
    accentColor: '#1f2937',
    rotatable: false,
    isTurret: false,
    description: 'Open industrial deck tile.',
  },
  core: {
    id: 'core',
    name: 'Central Command Core',
    shortLabel: 'CORE',
    hotkey: '',
    cost: 0,
    maxHp: CONFIG.CORE_MAX_HP,
    unlockWave: 1,
    category: 'core',
    color: '#0ea5e9',
    accentColor: '#bae6fd',
    rotatable: false,
    isTurret: false,
    description: 'Accepts ore & refined shapes from all 4 sides for Credits + Quota Progress. Lose if HP hits 0.',
  },
  miner: {
    id: 'miner',
    name: 'Extractor Miner',
    shortLabel: 'MINER',
    hotkey: '1',
    cost: 20,
    maxHp: 90,
    unlockWave: 1,
    category: 'production',
    color: '#d97706',
    accentColor: '#fde68a',
    rotatable: true,
    isTurret: false,
    description: 'Extracts geometric ore from veins (or trace CuCircle on deck) and pushes into facing belt.',
  },
  belt: {
    id: 'belt',
    name: 'Conveyor Belt',
    shortLabel: 'BELT',
    hotkey: '2',
    cost: 4,
    maxHp: 50,
    unlockWave: 1,
    category: 'logistics',
    color: '#334155',
    accentColor: '#94a3b8',
    rotatable: true,
    isTurret: false,
    description: 'Moves 1 item/tick in facing direction. Jams visibly if downstream tile is full.',
  },
  splitter: {
    id: 'splitter',
    name: '1:1 Splitter',
    shortLabel: 'SPLIT',
    hotkey: '3',
    cost: 14,
    maxHp: 75,
    unlockWave: 3,
    category: 'logistics',
    color: '#7c3aed',
    accentColor: '#ddd6fe',
    rotatable: true,
    isTurret: false,
    description: 'Alternates incoming items 50/50 (or toggleable 2:1) between open downstream paths.',
  },
  overclock_belt: {
    id: 'overclock_belt',
    name: 'Overclocked Belt (2x)',
    shortLabel: '2X BELT',
    hotkey: '4',
    cost: 10,
    maxHp: 65,
    unlockWave: 3,
    category: 'logistics',
    color: '#0284c7',
    accentColor: '#7dd3fc',
    rotatable: true,
    isTurret: false,
    description: 'High-speed magnetic conveyor that shunts items up to 2 tiles per tick.',
  },
  smelter: {
    id: 'smelter',
    name: 'Alloy Cutter/Smelter',
    shortLabel: 'SMELT',
    hotkey: '5',
    cost: 35,
    maxHp: 110,
    unlockWave: 6,
    category: 'processing',
    color: '#ea580c',
    accentColor: '#fed7aa',
    rotatable: true,
    isTurret: false,
    description: 'Refines FeSquare -> BoltedAlloy (2.5x turret dmg, 2x Core value) and CuCircle -> CutHalf.',
  },
  silo: {
    id: 'silo',
    name: 'Capacitor Buffer Silo',
    shortLabel: 'SILO',
    hotkey: '6',
    cost: 28,
    maxHp: 130,
    unlockWave: 9,
    category: 'processing',
    color: '#0d9488',
    accentColor: '#99f6e4',
    rotatable: true,
    isTurret: false,
    description: 'Stores up to 12 items to absorb belt congestion spikes and auto-feeds adjacent turrets.',
  },
  bolt_turret: {
    id: 'bolt_turret',
    name: 'Bolt Turret',
    shortLabel: 'BOLT',
    hotkey: '7',
    cost: 30,
    maxHp: 120,
    unlockWave: 1,
    category: 'defense',
    color: '#16a34a',
    accentColor: '#bbf7d0',
    rotatable: false,
    isTurret: true,
    turretRange: 3.8,
    turretBaseDamage: 16,
    turretFireIntervalTicks: 1,
    turretMaxAmmo: 10,
    turretTargetsPerShot: 1,
    turretAntiBossMultiplier: 1.0,
    description: 'Starter kinetic turret. Must be fed ammo via belt or silo (up to 2.5x dmg with BoltedAlloy).',
  },
  scatter_turret: {
    id: 'scatter_turret',
    name: 'Twin-Barrel Scatter Turret',
    shortLabel: 'SCATTER',
    hotkey: '8',
    cost: 55,
    maxHp: 150,
    unlockWave: 9,
    category: 'defense',
    color: '#ca8a04',
    accentColor: '#fef08a',
    rotatable: false,
    isTurret: true,
    turretRange: 3.4,
    turretBaseDamage: 14,
    turretFireIntervalTicks: 1,
    turretMaxAmmo: 14,
    turretTargetsPerShot: 2,
    turretAntiBossMultiplier: 1.1,
    description: 'Fires twin flak bursts at up to 2 enemies simultaneously. Ideal against Swarm Waves.',
  },
  arc_railgun: {
    id: 'arc_railgun',
    name: 'Arc Railgun Turret',
    shortLabel: 'RAILGUN',
    hotkey: '9',
    cost: 85,
    maxHp: 180,
    unlockWave: 12,
    category: 'defense',
    color: '#2563eb',
    accentColor: '#bfdbfe',
    rotatable: false,
    isTurret: true,
    turretRange: 5.5,
    turretBaseDamage: 38,
    turretFireIntervalTicks: 1,
    turretMaxAmmo: 8,
    turretTargetsPerShot: 1,
    turretAntiBossMultiplier: 2.0,
    description: 'Long-range magnetic railgun. Deals 2x bonus damage to Bosses & Shielded units.',
  },
  wall: {
    id: 'wall',
    name: 'Repair Wall',
    shortLabel: 'WALL',
    hotkey: '0',
    cost: 12,
    maxHp: 240,
    unlockWave: 1,
    category: 'defense',
    color: '#475569',
    accentColor: '#cbd5e1',
    rotatable: false,
    isTurret: false,
    description: 'Reinforced industrial bulkhead that absorbs enemy attacks and regenerates hull between waves.',
  },
};

export const BUILDABLE_BLOCK_ORDER: readonly BlockType[] = [
  'miner',
  'belt',
  'splitter',
  'overclock_belt',
  'smelter',
  'silo',
  'bolt_turret',
  'scatter_turret',
  'arc_railgun',
  'wall',
];

export interface TechUnlockDefinition {
  wave: number;
  title: string;
  unlockedBlocks: BlockType[];
  description: string;
}

export const TECH_TREE_UNLOCKS: readonly TechUnlockDefinition[] = [
  {
    wave: 1,
    title: 'Tier 0: Pioneer Starter Kit',
    unlockedBlocks: ['miner', 'belt', 'bolt_turret', 'wall'],
    description: 'Basic extraction, 1x conveyors, kinetic Bolt Turrets, and defensive Repair Walls.',
  },
  {
    wave: 3,
    title: 'Tier 1: Logistics Routing & Overclock',
    unlockedBlocks: ['splitter', 'overclock_belt'],
    description: 'Unlocks 1:1 Splitters to balance Core vs. Turret routing and 2x Overclocked Belts.',
  },
  {
    wave: 6,
    title: 'Tier 2: Geometric Alloy Refinement',
    unlockedBlocks: ['smelter'],
    description: 'Unlocks Alloy Cutter/Smelter (FeSquare -> BoltedAlloy with 2.5x turret damage & 2x Core value).',
  },
  {
    wave: 9,
    title: 'Tier 3: Flak Defense & Surge Buffering',
    unlockedBlocks: ['scatter_turret', 'silo'],
    description: 'Unlocks Twin-Barrel Scatter Turrets and 12-slot Capacitor Buffer Silos.',
  },
  {
    wave: 12,
    title: 'Tier 4: High-Voltage Boss Suppression',
    unlockedBlocks: ['arc_railgun'],
    description: 'Unlocks long-range Arc Railgun Turrets with 2.0x anti-boss/shield penetration.',
  },
];

export interface EnemyMetadata {
  id: EnemyType;
  name: string;
  maxHp: number;
  speedTilesPerTick: number;
  coreDamage: number;
  wallDamage: number;
  bountyCredits: number;
  isBoss: boolean;
  isShielded: boolean;
  color: string;
  radiusRatio: number;
}

export const ENEMY_TYPES: Record<EnemyType, EnemyMetadata> = {
  scout_drone: {
    id: 'scout_drone',
    name: 'Scout Drone',
    maxHp: 28,
    speedTilesPerTick: 0.42,
    coreDamage: 18,
    wallDamage: 12,
    bountyCredits: 8,
    isBoss: false,
    isShielded: false,
    color: '#ef4444',
    radiusRatio: 0.26,
  },
  swarm_wasp: {
    id: 'swarm_wasp',
    name: 'Swarm Wasp',
    maxHp: 20,
    speedTilesPerTick: 0.58,
    coreDamage: 12,
    wallDamage: 8,
    bountyCredits: 6,
    isBoss: false,
    isShielded: false,
    color: '#f97316',
    radiusRatio: 0.22,
  },
  armored_bruiser: {
    id: 'armored_bruiser',
    name: 'Armored Bruiser',
    maxHp: 85,
    speedTilesPerTick: 0.3,
    coreDamage: 35,
    wallDamage: 24,
    bountyCredits: 16,
    isBoss: false,
    isShielded: true,
    color: '#a855f7',
    radiusRatio: 0.32,
  },
  siege_crawler: {
    id: 'siege_crawler',
    name: 'Siege Crawler (Boss)',
    maxHp: 320,
    speedTilesPerTick: 0.22,
    coreDamage: 95,
    wallDamage: 50,
    bountyCredits: 65,
    isBoss: true,
    isShielded: true,
    color: '#dc2626',
    radiusRatio: 0.42,
  },
  shielded_dreadnought: {
    id: 'shielded_dreadnought',
    name: 'Shielded Dreadnought (Boss)',
    maxHp: 560,
    speedTilesPerTick: 0.2,
    coreDamage: 130,
    wallDamage: 75,
    bountyCredits: 110,
    isBoss: true,
    isShielded: true,
    color: '#7c3aed',
    radiusRatio: 0.45,
  },
  apex_goliath: {
    id: 'apex_goliath',
    name: 'Apex Goliath (Final Boss)',
    maxHp: 980,
    speedTilesPerTick: 0.18,
    coreDamage: 220,
    wallDamage: 110,
    bountyCredits: 250,
    isBoss: true,
    isShielded: true,
    color: '#be123c',
    radiusRatio: 0.48,
  },
};

export function buildWaveTable(): WaveDefinition[] {
  const waves: WaveDefinition[] = [];
  for (let w = 1; w <= CONFIG.CAMPAIGN_MAX_WAVE; w++) {
    const techUnlock = TECH_TREE_UNLOCKS.find((t) => t.wave === w);
    if (w === 15) {
      waves.push({
        wave: w,
        title: 'Wave 15: Siege Crawler Assault',
        isBossWave: true,
        rewardCredits: 90,
        earlyLaunchBonus: 35,
        spawns: [
          { enemyType: 'scout_drone', count: 4, spacingTicks: 2 },
          { enemyType: 'siege_crawler', count: 1, spacingTicks: 4 },
          { enemyType: 'armored_bruiser', count: 2, spacingTicks: 3 },
        ],
      });
    } else if (w === 20) {
      waves.push({
        wave: w,
        title: 'Wave 20: Shielded Dreadnought Vanguard',
        isBossWave: true,
        rewardCredits: 120,
        earlyLaunchBonus: 45,
        spawns: [
          { enemyType: 'swarm_wasp', count: 6, spacingTicks: 2 },
          { enemyType: 'shielded_dreadnought', count: 1, spacingTicks: 4 },
          { enemyType: 'armored_bruiser', count: 3, spacingTicks: 3 },
        ],
      });
    } else if (w === 25) {
      waves.push({
        wave: w,
        title: 'Wave 25: Twin Dreadnought Siege',
        isBossWave: true,
        rewardCredits: 160,
        earlyLaunchBonus: 55,
        spawns: [
          { enemyType: 'armored_bruiser', count: 4, spacingTicks: 2 },
          { enemyType: 'shielded_dreadnought', count: 2, spacingTicks: 5 },
          { enemyType: 'swarm_wasp', count: 8, spacingTicks: 1 },
        ],
      });
    } else if (w === 30) {
      waves.push({
        wave: w,
        title: 'Wave 30: Apex Goliath Final Reckoning',
        isBossWave: true,
        rewardCredits: 300,
        earlyLaunchBonus: 80,
        spawns: [
          { enemyType: 'armored_bruiser', count: 4, spacingTicks: 2 },
          { enemyType: 'siege_crawler', count: 1, spacingTicks: 4 },
          { enemyType: 'apex_goliath', count: 1, spacingTicks: 5 },
        ],
      });
    } else {
      const spawns: WaveDefinition['spawns'] = [];
      const scoutCount = Math.min(8, 2 + Math.floor(w * 0.45));
      spawns.push({ enemyType: 'scout_drone', count: scoutCount, spacingTicks: 2 });
      if (w >= 4) {
        spawns.push({
          enemyType: 'swarm_wasp',
          count: 1 + Math.floor((w - 3) * 0.5),
          spacingTicks: 2,
        });
      }
      if (w >= 7) {
        spawns.push({
          enemyType: 'armored_bruiser',
          count: 1 + Math.floor((w - 6) * 0.35),
          spacingTicks: 3,
        });
      }
      waves.push({
        wave: w,
        title: techUnlock ? `Wave ${w}: ${techUnlock.title}` : `Wave ${w}: Sector Patrol`,
        isBossWave: false,
        techUnlockNote: techUnlock?.title,
        rewardCredits: 20 + w * 4,
        earlyLaunchBonus: 12 + w * 2,
        spawns,
      });
    }
  }
  return waves;
}

export const WAVE_TABLE: readonly WaveDefinition[] = buildWaveTable();

export function getWaveDefinition(waveNumber: number): WaveDefinition {
  if (waveNumber >= 1 && waveNumber <= WAVE_TABLE.length) {
    return WAVE_TABLE[waveNumber - 1];
  }
  // Endless overdrive wave scaling beyond Wave 30
  const extra = Math.max(1, waveNumber - 30);
  return {
    wave: waveNumber,
    title: `Wave ${waveNumber}: Endless Overdrive +${extra}`,
    isBossWave: waveNumber % 5 === 0,
    rewardCredits: 180 + extra * 15,
    earlyLaunchBonus: 50 + extra * 5,
    spawns: [
      { enemyType: 'swarm_wasp', count: 6 + extra, spacingTicks: 1 },
      { enemyType: 'armored_bruiser', count: 3 + Math.floor(extra * 0.6), spacingTicks: 2 },
      ...(waveNumber % 5 === 0
        ? [{ enemyType: 'apex_goliath' as const, count: 1 + Math.floor(extra / 5), spacingTicks: 4 }]
        : []),
    ],
  };
}
