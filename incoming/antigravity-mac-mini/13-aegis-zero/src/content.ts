export type AugmentRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface AugmentDefinition {
  id: string;
  name: string;
  rarity: AugmentRarity;
  lineageTag: string;
  description: string;
  synergyHint: string;
  accentColor: string;
}

export interface LoadoutChassis {
  id: string;
  name: string;
  title: string;
  description: string;
  unlockRequirementText: string;
  unlockMinBestScore: number;
  baseHp: number;
  speedMult: number;
  grazeRadiusMult: number;
  damageMult: number;
  startingAugmentId: string;
  color: string;
}

export type EnemyArchetypeId =
  | 'pulse-drone'
  | 'spiral-weaver'
  | 'rail-sniper'
  | 'void-carrier'
  | 'hex-warden-boss'
  | 'chrono-seraph-boss';

export interface EnemyArchetype {
  id: EnemyArchetypeId;
  name: string;
  maxHp: number;
  speed: number;
  radius: number;
  fireIntervalS: number;
  scoreValue: number;
  gemDrops: number;
  isElite: boolean;
  isBoss: boolean;
  color: string;
}

export interface WaveDefinition {
  wave: number;
  title: string;
  subtitle: string;
  durationS: number;
  spawnIntervalS: number;
  enemyPool: readonly EnemyArchetypeId[];
  bossId?: EnemyArchetypeId;
}

export const LOADOUT_CHASSIS: readonly LoadoutChassis[] = [
  {
    id: 'vanguard-zero',
    name: 'Vanguard-Zero',
    title: 'Standard Resonance Interceptor',
    description: 'Balanced 44px Graze Halo and high-velocity Twin Rail-Shards. Built for immediate flow.',
    unlockRequirementText: 'Unlocked by default',
    unlockMinBestScore: 0,
    baseHp: 100,
    speedMult: 1.0,
    grazeRadiusMult: 1.0,
    damageMult: 1.0,
    startingAugmentId: 'arc-capacitor',
    color: '#38bdf8',
  },
  {
    id: 'phantom-braid',
    name: 'Phantom-Braid',
    title: 'Temporal Echo Frame (Blow Lineage)',
    description: 'Wider +25% Graze Halo & faster Phase-Dash. Leaves a temporal twin on every Shatter.',
    unlockRequirementText: 'Reach 6,000+ Score in any run (or unlock in Loadout bay)',
    unlockMinBestScore: 6000,
    baseHp: 80,
    speedMult: 1.15,
    grazeRadiusMult: 1.25,
    damageMult: 1.1,
    startingAugmentId: 'braid-temporal-twin',
    color: '#a855f7',
  },
  {
    id: 'blood-seraph',
    name: 'Blood-Seraph',
    title: 'Sacrificial Overclock Rig (McMillen Lineage)',
    description: 'Fires brutal 1.35x heavy slugs. Can spend Hull HP to trigger Shatter Discharges at 0% Overclock.',
    unlockRequirementText: 'Reach 15,000+ Score in any run',
    unlockMinBestScore: 15000,
    baseHp: 120,
    speedMult: 0.96,
    grazeRadiusMult: 1.1,
    damageMult: 1.35,
    startingAugmentId: 'blood-capacitor',
    color: '#f43f5e',
  },
] as const;

export const AUGMENT_POOL: readonly AugmentDefinition[] = [
  // COMMON
  {
    id: 'arc-capacitor',
    name: 'Wide-Band Graze Coil',
    rarity: 'Common',
    lineageTag: 'TenHueg Systems',
    description: '+22% Graze Halo radius and +20% Overclock charge rate from enemy projectiles.',
    synergyHint: 'Stacks multiplicatively with Singularity Magnet and Prism Split.',
    accentColor: '#38bdf8',
  },
  {
    id: 'kinetic-thrusters',
    name: 'Vector Afterburners',
    rarity: 'Common',
    lineageTag: 'Vlambeer Kinetic',
    description: '+18% ship movement speed and -20% Phase-Dash cooldown.',
    synergyHint: 'Lets you dive for White-Hot 1.5s Flux Gems before they decay.',
    accentColor: '#38bdf8',
  },
  {
    id: 'flux-stabilizer',
    name: 'Cryo-Flux Stabilizer',
    rarity: 'Common',
    lineageTag: 'TenHueg Systems',
    description: 'Flux Gems last +1.5s longer before exploding and grant +25% more XP.',
    synergyHint: 'Pairs with Supercritical Harvest for massive level-up velocity.',
    accentColor: '#38bdf8',
  },
  {
    id: 'tungsten-shards',
    name: 'Tungsten Rail-Slugs',
    rarity: 'Common',
    lineageTag: 'Vlambeer Kinetic',
    description: '+25% Graze Shot damage and +15% Critical Strike chance.',
    synergyHint: 'Heavy crits trigger 40ms hitstop and knock enemies back.',
    accentColor: '#38bdf8',
  },
  {
    id: 'magnet-core',
    name: 'Graviton Harvester',
    rarity: 'Common',
    lineageTag: 'TenHueg Systems',
    description: '+65% Flux Gem pickup magnet radius and +10 Max Hull HP.',
    synergyHint: 'Pulls volatile gems out of bullet curtains safely.',
    accentColor: '#38bdf8',
  },

  // RARE
  {
    id: 'vlambeer-recoil',
    name: 'Heavy Kickback Cannon',
    rarity: 'Rare',
    lineageTag: 'Vlambeer Feel',
    description: 'Graze Volleys fire +2 extra heavy shells per burst with physical recoil impulse and +30% Crit Damage.',
    synergyHint: 'Use the recoil kick to surf backward out of dense spiral patterns.',
    accentColor: '#f59e0b',
  },
  {
    id: 'chain-tesla',
    name: 'Tesla Graze Arc',
    rarity: 'Rare',
    lineageTag: 'TenHueg Systems',
    description: 'Every 3rd grazed bullet arcs chain-lightning to 2 nearby enemies for 45 electric damage.',
    synergyHint: 'Shreds swarm drones while you weave through dense rings.',
    accentColor: '#f59e0b',
  },
  {
    id: 'supercritical-vamp',
    name: 'Supercritical Siphon',
    rarity: 'Rare',
    lineageTag: 'McMillen Risk',
    description: 'Picking up a Flux Gem within its 1.5s White-Hot window heals +4 Hull HP and fires a radial nova.',
    synergyHint: 'Rewards aggressive point-blank kills and immediate gem dives.',
    accentColor: '#f59e0b',
  },
  {
    id: 'shatter-alchemy',
    name: 'Bullet-to-Shard Alchemy',
    rarity: 'Rare',
    lineageTag: 'Vlambeer Feel',
    description: 'Shatter Discharge converts every vaporized enemy bullet into a homing friendly plasma missile.',
    synergyHint: 'Wait until the screen is packed with bullets, then press SPACE!',
    accentColor: '#f59e0b',
  },
  {
    id: 'ricochet-prism',
    name: 'Refractive Prism Hull',
    rarity: 'Rare',
    lineageTag: 'TenHueg Systems',
    description: 'Your Graze Shots pierce 1 enemy and ricochet off arena walls with +20% velocity.',
    synergyHint: 'Doubles effective DPS in tight corner maneuvers.',
    accentColor: '#f59e0b',
  },

  // EPIC
  {
    id: 'braid-temporal-twin',
    name: 'Braid Worldline Twin',
    rarity: 'Epic',
    lineageTag: 'Jonathan Blow Temporal',
    description: 'Triggering Phase-Dash / Shatter spawns a 3.5s Temporal Ghost at your position that ALSO grazes bullets and fires!',
    synergyHint: 'Place your Temporal Ghost inside boss bullet streams for double Overclock.',
    accentColor: '#a855f7',
  },
  {
    id: 'blood-capacitor',
    name: 'Martyr Blood-Capacitor',
    rarity: 'Epic',
    lineageTag: 'Edmund McMillen Pact',
    description: '+45% Damage when below 60% HP. If Overclock is under 30%, pressing SPACE spends 12 HP to force a Full Shatter Nova!',
    synergyHint: 'Combine with Supercritical Siphon to spend HP as ammo and heal it back.',
    accentColor: '#a855f7',
  },
  {
    id: 'overclock-singularity',
    name: 'Overclock Time-Dilation',
    rarity: 'Epic',
    lineageTag: 'Jonathan Blow Temporal',
    description: 'While Overclock is above 75%, enemy projectiles within 140px are slowed by 45% for effortless grazing.',
    synergyHint: 'Turns terrifying bullet curtains into slow-motion batteries.',
    accentColor: '#a855f7',
  },
  {
    id: 'volatile-corpse-bloom',
    name: 'Detonation Chain-Reaction',
    rarity: 'Epic',
    lineageTag: 'Vlambeer Feel',
    description: 'Enemies killed by Critical Graze Shots explode for 95 AoE damage and convert decayed Gem shrapnel into friendly fire.',
    synergyHint: 'Turns expired Flux Gems from a hazard into a screen-clearing trap.',
    accentColor: '#a855f7',
  },

  // LEGENDARY
  {
    id: 'seraph-halo-overdrive',
    name: 'Aegis-Omega Halo Array',
    rarity: 'Legendary',
    lineageTag: 'Apex Director Cut',
    description: '+35% Graze Halo, +40% Fire Rate, and grazing bullets has a 20% chance to vaporize them on contact into +5 Overclock.',
    synergyHint: 'The ultimate defensive-offensive feedback loop.',
    accentColor: '#fde047',
  },
  {
    id: 'throne-bullet-heaven',
    name: 'Nuclear Throne Cataclysm',
    rarity: 'Legendary',
    lineageTag: 'Vlambeer × McMillen',
    description: 'Doubles projectiles per Graze Volley (+100% multishot), +35% Crit Damage, and Boss/Elite hits drop live Flux Gems immediately.',
    synergyHint: 'Sustains infinite Overclock during Boss phases.',
    accentColor: '#fde047',
  },
] as const;

export const ENEMY_ARCHETYPES: Readonly<Record<EnemyArchetypeId, EnemyArchetype>> = {
  'pulse-drone': {
    id: 'pulse-drone',
    name: 'Pulse Scout',
    maxHp: 48,
    speed: 78,
    radius: 14,
    fireIntervalS: 1.65,
    scoreValue: 120,
    gemDrops: 1,
    isElite: false,
    isBoss: false,
    color: '#fb7185',
  },
  'spiral-weaver': {
    id: 'spiral-weaver',
    name: 'Spiral Weaver',
    maxHp: 95,
    speed: 55,
    radius: 18,
    fireIntervalS: 0.95,
    scoreValue: 240,
    gemDrops: 2,
    isElite: false,
    isBoss: false,
    color: '#c084fc',
  },
  'rail-sniper': {
    id: 'rail-sniper',
    name: 'Vector Lancer',
    maxHp: 82,
    speed: 92,
    radius: 15,
    fireIntervalS: 1.8,
    scoreValue: 260,
    gemDrops: 2,
    isElite: false,
    isBoss: false,
    color: '#fbbf24',
  },
  'void-carrier': {
    id: 'void-carrier',
    name: 'Crucible Dreadnought',
    maxHp: 240,
    speed: 40,
    radius: 25,
    fireIntervalS: 1.25,
    scoreValue: 550,
    gemDrops: 4,
    isElite: true,
    isBoss: false,
    color: '#f97316',
  },
  'hex-warden-boss': {
    id: 'hex-warden-boss',
    name: 'HEX-WARDEN VEX // SECTOR MID-BOSS',
    maxHp: 1350,
    speed: 48,
    radius: 36,
    fireIntervalS: 0.72,
    scoreValue: 2500,
    gemDrops: 10,
    isElite: true,
    isBoss: true,
    color: '#ec4899',
  },
  'chrono-seraph-boss': {
    id: 'chrono-seraph-boss',
    name: 'CHRONO-SERAPH OMEGA // APEX ARCHITECT',
    maxHp: 2800,
    speed: 56,
    radius: 44,
    fireIntervalS: 0.55,
    scoreValue: 6000,
    gemDrops: 18,
    isElite: true,
    isBoss: true,
    color: '#fde047',
  },
};

export const WAVE_SCHEDULE: readonly WaveDefinition[] = [
  {
    wave: 1,
    title: 'WAVE 01 // IGNITION HALO',
    subtitle: 'Graze within 44px of enemy plasma to charge your Rail-Capacitors!',
    durationS: 32,
    spawnIntervalS: 2.3,
    enemyPool: ['pulse-drone'],
  },
  {
    wave: 2,
    title: 'WAVE 02 // SPIRAL CONVERGENCE',
    subtitle: 'Harvest Volatile Flux Gems within 1.5s before they destabilize!',
    durationS: 36,
    spawnIntervalS: 2.0,
    enemyPool: ['pulse-drone', 'spiral-weaver'],
  },
  {
    wave: 3,
    title: 'WAVE 03 // CROSSFIRE LANCERS',
    subtitle: 'Press SPACE at 30%+ Overclock to Shatter bullets into homing shards!',
    durationS: 38,
    spawnIntervalS: 1.8,
    enemyPool: ['pulse-drone', 'spiral-weaver', 'rail-sniper'],
  },
  {
    wave: 4,
    title: 'WAVE 04 // MID-BOSS: HEX-WARDEN VEX',
    subtitle: 'Ride the rotational bullet curtains to sustain maximum Overclock!',
    durationS: 45,
    spawnIntervalS: 2.6,
    enemyPool: ['pulse-drone', 'spiral-weaver'],
    bossId: 'hex-warden-boss',
  },
  {
    wave: 5,
    title: 'WAVE 05 // DREADNOUGHT ARMADA',
    subtitle: 'Elite Crucible Dreadnoughts enter the sector.',
    durationS: 42,
    spawnIntervalS: 1.65,
    enemyPool: ['spiral-weaver', 'rail-sniper', 'void-carrier'],
  },
  {
    wave: 6,
    title: 'WAVE 06 // VELOCITY SINGULARITY',
    subtitle: 'High-density curtains — chain Shatter Discharges to survive!',
    durationS: 44,
    spawnIntervalS: 1.45,
    enemyPool: ['pulse-drone', 'spiral-weaver', 'rail-sniper', 'void-carrier'],
  },
  {
    wave: 7,
    title: 'WAVE 07 // PRELUDE TO OMEGA',
    subtitle: 'Dual Dreadnoughts & Lancer Squadrons.',
    durationS: 46,
    spawnIntervalS: 1.3,
    enemyPool: ['spiral-weaver', 'rail-sniper', 'void-carrier'],
  },
  {
    wave: 8,
    title: 'WAVE 08 // APEX BOSS: CHRONO-SERAPH OMEGA',
    subtitle: 'Shatter the Architect of the Bullet Curtain!',
    durationS: 60,
    spawnIntervalS: 2.4,
    enemyPool: ['spiral-weaver', 'rail-sniper'],
    bossId: 'chrono-seraph-boss',
  },
] as const;
