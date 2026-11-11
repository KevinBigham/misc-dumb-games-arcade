export type ChassisId = 'interceptor' | 'colossus' | 'phantom';

export interface ValkyrieChassis {
  id: ChassisId;
  name: string;
  designation: string;
  role: string;
  description: string;
  baseHull: number;
  baseShield: number;
  speedMultiplier: number;
  dashCooldownMultiplier: number;
  critChance: number;
  critMultiplier: number;
  startingWeaponId: WeaponId;
  accentColor: string;
  passiveDescription: string;
}

export const CHASSIS_REGISTRY: Record<ChassisId, ValkyrieChassis> = {
  interceptor: {
    id: 'interceptor',
    name: 'Valkyrie Interceptor',
    designation: 'MK-IV ZEPHYR',
    role: 'High-Mobility Dogfighter',
    description: 'Ultra-light aerodyne frame equipped with twin vector thrusters and rapid-cycle chrono-capacitors.',
    baseHull: 100,
    baseShield: 80,
    speedMultiplier: 1.25,
    dashCooldownMultiplier: 0.75,
    critChance: 0.12,
    critMultiplier: 2.0,
    startingWeaponId: 'vulcan',
    accentColor: '#00f0ff',
    passiveDescription: '+25% Movement Speed, -25% Dash Cooldown, generates double Chrono Energy on graze.',
  },
  colossus: {
    id: 'colossus',
    name: 'Colossus Dreadnought',
    designation: 'TITAN-9 BASTION',
    role: 'Heavy Armored Fortress',
    description: 'Reinforced depleted uranium-titanium bulkheads with heavy kinetic shielding and an integrated hyper-railgun.',
    baseHull: 180,
    baseShield: 140,
    speedMultiplier: 0.88,
    dashCooldownMultiplier: 1.25,
    critChance: 0.08,
    critMultiplier: 1.8,
    startingWeaponId: 'railgun',
    accentColor: '#fbbf24',
    passiveDescription: '+80% Hull & +75% Shields. Dashing creates an impenetrable shockwave deflecting all nearby projectiles.',
  },
  phantom: {
    id: 'phantom',
    name: 'Phantom Spectre',
    designation: 'SPECTRE-0 WRAITH',
    role: 'Infiltration & Precision Strike',
    description: 'Phase-cloaked tactical prototype wielding quantum swarm micro-missiles and lethal crit matrices.',
    baseHull: 80,
    baseShield: 65,
    speedMultiplier: 1.1,
    dashCooldownMultiplier: 1.0,
    critChance: 0.28,
    critMultiplier: 3.0,
    startingWeaponId: 'swarm_missiles',
    accentColor: '#f43f5e',
    passiveDescription: '+28% Base Crit Chance with 3.0x Damage. Dashing spawns a holographic decoy that detonates on expiration.',
  },
};

export type WeaponId = 'vulcan' | 'railgun' | 'swarm_missiles' | 'singularity' | 'energy_blade';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  description: string;
  cooldownSec: number;
  damage: number;
  projectileSpeed: number;
  projectileCount: number;
  spreadRad: number;
  pierce: number;
  durationSec: number;
  radius: number;
  color: string;
  icon: string;
  sfxName: 'vulcan' | 'railgun' | 'missile' | 'singularity' | 'blade';
}

export const WEAPON_REGISTRY: Record<WeaponId, WeaponDef> = {
  vulcan: {
    id: 'vulcan',
    name: 'Plasma Vulcan',
    description: 'High-velocity paired plasma repeater. Shreds unarmored targets at close to medium range.',
    cooldownSec: 0.16,
    damage: 18,
    projectileSpeed: 820,
    projectileCount: 2,
    spreadRad: 0.08,
    pierce: 1,
    durationSec: 1.2,
    radius: 4,
    color: '#38bdf8',
    icon: '⚡',
    sfxName: 'vulcan',
  },
  railgun: {
    id: 'railgun',
    name: 'Chronos Railgun',
    description: 'Hyper-density linear accelerator beam that punches clean through infinite enemies in a straight line.',
    cooldownSec: 1.1,
    damage: 110,
    projectileSpeed: 1800,
    projectileCount: 1,
    spreadRad: 0.0,
    pierce: 99,
    durationSec: 0.8,
    radius: 6,
    color: '#00f0ff',
    icon: '✦',
    sfxName: 'railgun',
  },
  swarm_missiles: {
    id: 'swarm_missiles',
    name: 'Valkyrie Swarm',
    description: 'Micro-homing rockets that seek out the closest targets with dynamic thrust vectors and splash damage.',
    cooldownSec: 0.85,
    damage: 34,
    projectileSpeed: 480,
    projectileCount: 3,
    spreadRad: 0.6,
    pierce: 1,
    durationSec: 2.2,
    radius: 5,
    color: '#f43f5e',
    icon: '🚀',
    sfxName: 'missile',
  },
  singularity: {
    id: 'singularity',
    name: 'Singularity Mortar',
    description: 'Launches a micro-black hole that pulls nearby enemies toward its core before detonating violently.',
    cooldownSec: 2.4,
    damage: 90,
    projectileSpeed: 380,
    projectileCount: 1,
    spreadRad: 0.0,
    pierce: 1,
    durationSec: 1.8,
    radius: 12,
    color: '#c084fc',
    icon: '🌀',
    sfxName: 'singularity',
  },
  energy_blade: {
    id: 'energy_blade',
    name: 'Pulse Glaive Orbiters',
    description: 'Twin high-frequency energy scythes orbiting your hull that slice adjacent foes and parry projectiles.',
    cooldownSec: 0.016, // continuous orbit
    damage: 26,
    projectileSpeed: 0,
    projectileCount: 2,
    spreadRad: 0.0,
    pierce: 99,
    durationSec: 9999,
    radius: 14,
    color: '#34d399',
    icon: '⚔️',
    sfxName: 'blade',
  },
};

export type AugmentRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface AugmentDef {
  id: string;
  name: string;
  rarity: AugmentRarity;
  description: string;
  synergyTag: 'OFFENSE' | 'DEFENSE' | 'CHRONO' | 'TECH' | 'OVERDRIVE';
  maxRank: number;
  statModifiers: {
    damageMultiplier?: number;
    fireRateMultiplier?: number; // e.g. 0.85 = faster
    speedMultiplier?: number;
    hullMaxDelta?: number;
    shieldMaxDelta?: number;
    shieldRegenMultiplier?: number;
    critChanceDelta?: number;
    critMultiplierDelta?: number;
    chronoDurationDelta?: number;
    grazeBonusMultiplier?: number;
    extraProjectiles?: number;
    pierceDelta?: number;
  };
  specialEffect?:
    | 'CHAIN_LIGHTNING'
    | 'AEGIS_NOVA'
    | 'GRAVITON_CRIT'
    | 'BULLET_MIRROR'
    | 'NANITE_HARVEST'
    | 'DECOY_OVERDRIVE'
    | 'CHRONOS_REWIND'
    | 'THRUSTER_BURN'
    | 'APEX_OVERDRIVE';
}

export const AUGMENT_REGISTRY: readonly AugmentDef[] = [
  {
    id: 'overclocked_capacitors',
    name: 'Overclocked Capacitors',
    rarity: 'COMMON',
    description: '+18% Weapon Damage across all equipped arsenals.',
    synergyTag: 'OFFENSE',
    maxRank: 5,
    statModifiers: { damageMultiplier: 0.18 },
  },
  {
    id: 'rapid_cycler',
    name: 'Rapid-Cycle Actuator',
    rarity: 'COMMON',
    description: '+16% Attack Speed (faster cooldown on all weapons).',
    synergyTag: 'OFFENSE',
    maxRank: 5,
    statModifiers: { fireRateMultiplier: 0.84 },
  },
  {
    id: 'aerodyne_thrusters',
    name: 'Vector Jet Amplifiers',
    rarity: 'COMMON',
    description: '+15% Flight Mobility and thruster responsiveness.',
    synergyTag: 'CHRONO',
    maxRank: 4,
    statModifiers: { speedMultiplier: 0.15 },
  },
  {
    id: 'ablative_plating',
    name: 'Titanium Nanoplating',
    rarity: 'COMMON',
    description: '+30 Maximum Hull Integrity.',
    synergyTag: 'DEFENSE',
    maxRank: 5,
    statModifiers: { hullMaxDelta: 30 },
  },
  {
    id: 'shield_booster',
    name: 'Flux Shield Harmonics',
    rarity: 'COMMON',
    description: '+25 Maximum Shield capacity and +25% Shield Recharge Rate.',
    synergyTag: 'DEFENSE',
    maxRank: 4,
    statModifiers: { shieldMaxDelta: 25, shieldRegenMultiplier: 1.25 },
  },
  {
    id: 'precision_targeting',
    name: 'Precision Targeting Optics',
    rarity: 'COMMON',
    description: '+8% Critical Strike Chance and +0.3x Critical Damage multiplier.',
    synergyTag: 'OFFENSE',
    maxRank: 4,
    statModifiers: { critChanceDelta: 0.08, critMultiplierDelta: 0.3 },
  },
  {
    id: 'chrono_drift_extender',
    name: 'Tachyon Reservoir',
    rarity: 'RARE',
    description: '+0.35s Chrono-Drift Bullet-Time duration.',
    synergyTag: 'CHRONO',
    maxRank: 3,
    statModifiers: { chronoDurationDelta: 0.35 },
  },
  {
    id: 'graze_siphon',
    name: 'Electro-Magnetic Graze Coil',
    rarity: 'RARE',
    description: '+60% Energy & Score bonus when grazing enemy bullets.',
    synergyTag: 'CHRONO',
    maxRank: 3,
    statModifiers: { grazeBonusMultiplier: 1.6 },
  },
  {
    id: 'bifurcation_core',
    name: 'Bifurcation Emitter',
    rarity: 'RARE',
    description: 'All kinetic & energy weapons fire +1 additional projectile.',
    synergyTag: 'OFFENSE',
    maxRank: 2,
    statModifiers: { extraProjectiles: 1 },
  },
  {
    id: 'tungsten_slugs',
    name: 'High-Density Munitions',
    rarity: 'RARE',
    description: 'All projectiles gain +1 Pierce and +15% Damage.',
    synergyTag: 'OFFENSE',
    maxRank: 3,
    statModifiers: { pierceDelta: 1, damageMultiplier: 0.15 },
  },
  {
    id: 'superconductor',
    name: 'Superconductor Arc Matrix',
    rarity: 'EPIC',
    description: 'Slain foes discharge cascading chain lightning to 3 nearby enemies.',
    synergyTag: 'TECH',
    maxRank: 1,
    statModifiers: {},
    specialEffect: 'CHAIN_LIGHTNING',
  },
  {
    id: 'aegis_nova',
    name: 'Aegis EMP Nova',
    rarity: 'EPIC',
    description: 'When shield breaks, releases an EMP shockwave clearing all bullets and stunning enemies.',
    synergyTag: 'DEFENSE',
    maxRank: 1,
    statModifiers: {},
    specialEffect: 'AEGIS_NOVA',
  },
  {
    id: 'graviton_collapse',
    name: 'Graviton Collapse Lenses',
    rarity: 'EPIC',
    description: 'Critical hits trigger a mini-singularity pulling surrounding foes into the strike point.',
    synergyTag: 'OFFENSE',
    maxRank: 1,
    statModifiers: { critChanceDelta: 0.05 },
    specialEffect: 'GRAVITON_CRIT',
  },
  {
    id: 'bullet_mirror',
    name: 'Tachyon Kinetic Mirror',
    rarity: 'EPIC',
    description: 'Dashing through enemy bullets reflects them back as homing counter-lasers dealing 250% damage.',
    synergyTag: 'CHRONO',
    maxRank: 1,
    statModifiers: {},
    specialEffect: 'BULLET_MIRROR',
  },
  {
    id: 'nanite_harvest',
    name: 'Biotech Nanite Harvesters',
    rarity: 'EPIC',
    description: 'Slain enemies have a 25% chance to release Nanite Repair Cells (+12 Hull).',
    synergyTag: 'DEFENSE',
    maxRank: 1,
    statModifiers: {},
    specialEffect: 'NANITE_HARVEST',
  },
  {
    id: 'thruster_burn',
    name: 'Solar Plasma Exhaust',
    rarity: 'EPIC',
    description: 'Dashing leaves behind a conical jet of hyperheated plasma that burns pursuit craft.',
    synergyTag: 'CHRONO',
    maxRank: 1,
    statModifiers: {},
    specialEffect: 'THRUSTER_BURN',
  },
  {
    id: 'chronos_rewind',
    name: 'Chrono-Paradox Fail-Safe',
    rarity: 'LEGENDARY',
    description: 'Fatal damage triggers an automatic reality rewind: restores 60% Hull and 100% Shield once per run!',
    synergyTag: 'CHRONO',
    maxRank: 1,
    statModifiers: {},
    specialEffect: 'CHRONOS_REWIND',
  },
  {
    id: 'apex_overdrive',
    name: 'Singularity Overdrive Reactor',
    rarity: 'LEGENDARY',
    description: 'Combo decay timer frozen for 5s after any kill; Combo Multiplier cap increased from x10 to x15!',
    synergyTag: 'OVERDRIVE',
    maxRank: 1,
    statModifiers: { damageMultiplier: 0.35, fireRateMultiplier: 0.8 },
  },
];

export type EnemyArchetypeId =
  | 'void_mite'
  | 'quantum_striker'
  | 'helios_sniper'
  | 'bulwark_cruiser'
  | 'vortex_weaver'
  | 'boss_hyperion'
  | 'boss_chronos';

export interface EnemyDef {
  id: EnemyArchetypeId;
  name: string;
  maxHp: number;
  speed: number;
  radius: number;
  scoreValue: number;
  xpValue: number;
  color: string;
  outlineColor: string;
  isBoss: boolean;
  behavior: 'SWARM' | 'STRAFE_SHOOT' | 'SNIPER_CHARGE' | 'SHIELD_CHARGE' | 'SPIRAL_WEAVE' | 'BOSS_HYPERION' | 'BOSS_CHRONOS';
}

export const ENEMY_REGISTRY: Record<EnemyArchetypeId, EnemyDef> = {
  void_mite: {
    id: 'void_mite',
    name: 'Void Mite',
    maxHp: 28,
    speed: 210,
    radius: 12,
    scoreValue: 40,
    xpValue: 12,
    color: '#e11d48',
    outlineColor: '#f43f5e',
    isBoss: false,
    behavior: 'SWARM',
  },
  quantum_striker: {
    id: 'quantum_striker',
    name: 'Quantum Striker',
    maxHp: 65,
    speed: 140,
    radius: 16,
    scoreValue: 90,
    xpValue: 24,
    color: '#3b82f6',
    outlineColor: '#60a5fa',
    isBoss: false,
    behavior: 'STRAFE_SHOOT',
  },
  helios_sniper: {
    id: 'helios_sniper',
    name: 'Helios Rail-Pod',
    maxHp: 95,
    speed: 90,
    radius: 18,
    scoreValue: 160,
    xpValue: 40,
    color: '#eab308',
    outlineColor: '#fde047',
    isBoss: false,
    behavior: 'SNIPER_CHARGE',
  },
  bulwark_cruiser: {
    id: 'bulwark_cruiser',
    name: 'Bulwark Dread-Pod',
    maxHp: 240,
    speed: 75,
    radius: 26,
    scoreValue: 320,
    xpValue: 70,
    color: '#10b981',
    outlineColor: '#34d399',
    isBoss: false,
    behavior: 'SHIELD_CHARGE',
  },
  vortex_weaver: {
    id: 'vortex_weaver',
    name: 'Vortex Weaver',
    maxHp: 180,
    speed: 100,
    radius: 22,
    scoreValue: 280,
    xpValue: 60,
    color: '#8b5cf6',
    outlineColor: '#c084fc',
    isBoss: false,
    behavior: 'SPIRAL_WEAVE',
  },
  boss_hyperion: {
    id: 'boss_hyperion',
    name: 'HYPERION // THE SUN-DEVOURER',
    maxHp: 2400,
    speed: 55,
    radius: 54,
    scoreValue: 5000,
    xpValue: 500,
    color: '#f97316',
    outlineColor: '#fdba74',
    isBoss: true,
    behavior: 'BOSS_HYPERION',
  },
  boss_chronos: {
    id: 'boss_chronos',
    name: 'CHRONOS // THE SINGULARITY WEAVER',
    maxHp: 5800,
    speed: 45,
    radius: 68,
    scoreValue: 15000,
    xpValue: 1500,
    color: '#06b6d4',
    outlineColor: '#67e8f9',
    isBoss: true,
    behavior: 'BOSS_CHRONOS',
  },
};

export interface WaveSchedule {
  waveNumber: number;
  name: string;
  subtext: string;
  durationSec: number;
  spawnRates: { archetype: EnemyArchetypeId; intervalSec: number; maxCount: number }[];
  bossSpawn?: EnemyArchetypeId;
}

export const WAVE_SCHEDULES: readonly WaveSchedule[] = [
  {
    waveNumber: 1,
    name: 'WAVE 01: PERIMETER INTRUSION',
    subtext: 'Light scout swarm incoming. Calibrate movement and test Chrono-Drift.',
    durationSec: 35,
    spawnRates: [
      { archetype: 'void_mite', intervalSec: 1.4, maxCount: 16 },
    ],
  },
  {
    waveNumber: 2,
    name: 'WAVE 02: STRIKE CORRIDOR',
    subtext: 'Quantum Strikers detected. Watch for paired plasma fire.',
    durationSec: 40,
    spawnRates: [
      { archetype: 'void_mite', intervalSec: 1.8, maxCount: 14 },
      { archetype: 'quantum_striker', intervalSec: 3.5, maxCount: 6 },
    ],
  },
  {
    waveNumber: 3,
    name: 'WAVE 03: SIEGE LINE',
    subtext: 'Bulwark Dread-Pods entering arena. Flank their armored shields.',
    durationSec: 45,
    spawnRates: [
      { archetype: 'void_mite', intervalSec: 2.0, maxCount: 12 },
      { archetype: 'quantum_striker', intervalSec: 3.8, maxCount: 5 },
      { archetype: 'bulwark_cruiser', intervalSec: 6.0, maxCount: 3 },
    ],
  },
  {
    waveNumber: 4,
    name: 'WAVE 04: HELIOS VOLLEY',
    subtext: 'Rail-Pod snipers locking on. Dodge when laser sights snap to red.',
    durationSec: 45,
    spawnRates: [
      { archetype: 'void_mite', intervalSec: 1.8, maxCount: 12 },
      { archetype: 'quantum_striker', intervalSec: 3.2, maxCount: 6 },
      { archetype: 'helios_sniper', intervalSec: 4.5, maxCount: 4 },
    ],
  },
  {
    waveNumber: 5,
    name: 'WAVE 05: APEX TITAN ENGAGEMENT',
    subtext: 'MID-BOSS ALERT: Hyperion Sun-Devourer detected! Brace for cluster ordnance!',
    durationSec: 60,
    spawnRates: [
      { archetype: 'void_mite', intervalSec: 4.0, maxCount: 6 },
      { archetype: 'quantum_striker', intervalSec: 7.0, maxCount: 3 },
    ],
    bossSpawn: 'boss_hyperion',
  },
  {
    waveNumber: 6,
    name: 'WAVE 06: VORTEX BLOSSOM',
    subtext: 'Vortex Weavers deploying bullet hell spirals across quadrant.',
    durationSec: 45,
    spawnRates: [
      { archetype: 'quantum_striker', intervalSec: 3.0, maxCount: 6 },
      { archetype: 'vortex_weaver', intervalSec: 4.5, maxCount: 4 },
      { archetype: 'void_mite', intervalSec: 2.0, maxCount: 10 },
    ],
  },
  {
    waveNumber: 7,
    name: 'WAVE 07: COMBINED ARMS',
    subtext: 'Heavy coordinated fleet assault. Graze bullet walls for instant Chrono charge.',
    durationSec: 50,
    spawnRates: [
      { archetype: 'bulwark_cruiser', intervalSec: 5.5, maxCount: 4 },
      { archetype: 'helios_sniper', intervalSec: 4.0, maxCount: 5 },
      { archetype: 'vortex_weaver', intervalSec: 5.0, maxCount: 3 },
    ],
  },
  {
    waveNumber: 8,
    name: 'WAVE 08: CHRONO-COLLAPSE',
    subtext: 'Space-time fracturing. Enemy swarms accelerating to combat velocity.',
    durationSec: 50,
    spawnRates: [
      { archetype: 'void_mite', intervalSec: 1.0, maxCount: 22 },
      { archetype: 'quantum_striker', intervalSec: 2.5, maxCount: 8 },
      { archetype: 'vortex_weaver', intervalSec: 4.0, maxCount: 4 },
    ],
  },
  {
    waveNumber: 9,
    name: 'WAVE 09: SINGULARITY HORIZON',
    subtext: 'All fleets converging. Survive the maelstrom to reach the Weaver.',
    durationSec: 50,
    spawnRates: [
      { archetype: 'bulwark_cruiser', intervalSec: 4.0, maxCount: 5 },
      { archetype: 'helios_sniper', intervalSec: 3.5, maxCount: 6 },
      { archetype: 'vortex_weaver', intervalSec: 3.8, maxCount: 5 },
      { archetype: 'void_mite', intervalSec: 1.5, maxCount: 16 },
    ],
  },
  {
    waveNumber: 10,
    name: 'WAVE 10: SUPREME CHRONOS NEXUS',
    subtext: 'FINAL BOSS: Chronos The Singularity Weaver has arrived. Destroy the core!',
    durationSec: 90,
    spawnRates: [
      { archetype: 'void_mite', intervalSec: 5.0, maxCount: 8 },
      { archetype: 'quantum_striker', intervalSec: 8.0, maxCount: 4 },
    ],
    bossSpawn: 'boss_chronos',
  },
];
