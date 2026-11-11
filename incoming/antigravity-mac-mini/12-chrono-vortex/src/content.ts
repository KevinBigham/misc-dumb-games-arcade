export type StrikerChassisId = 'vanguard-g' | 'phantom-x' | 'prism-9';

export interface StrikerChassisDef {
  id: StrikerChassisId;
  name: string;
  title: string;
  tagline: string;
  color: string;
  secondaryColor: string;
  maxHp: number;
  speedMultiplier: number;
  knockbackMultiplier: number;
  parryRadiusMultiplier: number;
  echoDurationMultiplier: number;
  signaturePassive: string;
}

export const STRIKER_CHASSIS: readonly StrikerChassisDef[] = [
  {
    id: 'vanguard-g',
    name: 'VANGUARD-G',
    title: 'The "Big G" Kinetic Titan',
    tagline: 'Heavy pinball juggernaut built for catastrophic wall-slams and multi-bank ricochets.',
    color: '#f59e0b',
    secondaryColor: '#fde047',
    maxHp: 130,
    speedMultiplier: 1.0,
    knockbackMultiplier: 1.35,
    parryRadiusMultiplier: 1.0,
    echoDurationMultiplier: 1.0,
    signaturePassive: 'Titan Impact: +35% Ricochet Knockback & Dash triggers a 95px seismic shockwave.',
  },
  {
    id: 'phantom-x',
    name: 'PHANTOM-X',
    title: 'Chrono-Ghost Assassin',
    tagline: 'Hyper-agile temporal drifter that weaves up to 3 long-lasting Echo Clones simultaneously.',
    color: '#38bdf8',
    secondaryColor: '#a855f7',
    maxHp: 100,
    speedMultiplier: 1.18,
    knockbackMultiplier: 1.05,
    parryRadiusMultiplier: 1.05,
    echoDurationMultiplier: 1.45,
    signaturePassive: 'Time Weaver: +45% Echo Ghost lifespan & -25% Echo Cooldown.',
  },
  {
    id: 'prism-9',
    name: 'PRISM-9',
    title: 'Arcane Bullet Alchemist',
    tagline: 'Transmutes enemy bullet-hell barrages into homing prism storms and elemental novas.',
    color: '#ec4899',
    secondaryColor: '#2dd4bf',
    maxHp: 110,
    speedMultiplier: 1.08,
    knockbackMultiplier: 1.1,
    parryRadiusMultiplier: 1.35,
    echoDurationMultiplier: 1.15,
    signaturePassive: 'Prism Refraction: +35% Parry Aura radius & Parries spawn +1 extra homing shard.',
  },
];

export type BumperElement = 'SOLAR' | 'CRYO' | 'ARC' | 'VOID';

export interface BumperBlueprint {
  xOffset: number;
  yOffset: number;
  radius: number;
  element: BumperElement;
  label: string;
}

export interface SectorDef {
  sector: number;
  name: string;
  subtitle: string;
  lore: string;
  themeColor: string;
  accentColor: string;
  targetKills: number;
  isBossSector: boolean;
  gravityWellStrength: number;
  bumpers: readonly BumperBlueprint[];
  enemyWeights: ReadonlyArray<{ type: EnemyArchetypeId; weight: number }>;
}

export type EnemyArchetypeId =
  | 'gear-hound'
  | 'prism-sniper'
  | 'void-juggernaut'
  | 'arc-weaver'
  | 'chrono-warden'
  | 'kronos-omega';

export interface EnemyArchetypeDef {
  id: EnemyArchetypeId;
  name: string;
  role: string;
  baseHp: number;
  radius: number;
  speed: number;
  mass: number;
  contactDamage: number;
  scoreValue: number;
  color: string;
  outlineColor: string;
  fireCooldownMs: number;
  projectileSpeed: number;
  description: string;
}

export const ENEMY_ARCHETYPES: Record<EnemyArchetypeId, EnemyArchetypeDef> = {
  'gear-hound': {
    id: 'gear-hound',
    name: 'Gear-Hound Automaton',
    role: 'Kinetic Rusher (Pinball Ammo)',
    baseHp: 42,
    radius: 15,
    speed: 145,
    mass: 0.8,
    contactDamage: 10,
    scoreValue: 120,
    color: '#fb923c',
    outlineColor: '#fed7aa',
    fireCooldownMs: 0,
    projectileSpeed: 0,
    description: 'Lightweight clockwork drone. Slam it into heavier foes like a high-speed pinball!',
  },
  'prism-sniper': {
    id: 'prism-sniper',
    name: 'Prism-Lens Marksman',
    role: 'Ranged Volley Artillery',
    baseHp: 56,
    radius: 16,
    speed: 95,
    mass: 1.0,
    contactDamage: 12,
    scoreValue: 180,
    color: '#e879f9',
    outlineColor: '#fae8ff',
    fireCooldownMs: 2100,
    projectileSpeed: 255,
    description: 'Orbits the perimeter firing plasma orbs. Use Pulse Parry [Q/Right-Click] to reflect its shots!',
  },
  'void-juggernaut': {
    id: 'void-juggernaut',
    name: 'Obsidian Anvil-Golem',
    role: 'Heavy Bruiser (Weak to Wall/Bumper Slams)',
    baseHp: 135,
    radius: 24,
    speed: 68,
    mass: 1.9,
    contactDamage: 18,
    scoreValue: 320,
    color: '#818cf8',
    outlineColor: '#e0e7ff',
    fireCooldownMs: 2900,
    projectileSpeed: 210,
    description: 'Massive armor plating shrugs off light hits, but takes 2.5x shatter damage from Bumper & Wall impacts!',
  },
  'arc-weaver': {
    id: 'arc-weaver',
    name: 'Tesla-Coil Weaver',
    role: 'Tri-Shot Disruptor',
    baseHp: 72,
    radius: 17,
    speed: 112,
    mass: 1.1,
    contactDamage: 14,
    scoreValue: 240,
    color: '#2dd4bf',
    outlineColor: '#ccfbf1',
    fireCooldownMs: 2300,
    projectileSpeed: 240,
    description: 'Fires 3-way shock spreads. Discharges chain lightning to nearby enemies when slammed.',
  },
  'chrono-warden': {
    id: 'chrono-warden',
    name: 'Paradox Aegis Warden',
    role: 'Directional Shield Elite',
    baseHp: 110,
    radius: 20,
    speed: 88,
    mass: 1.4,
    contactDamage: 16,
    scoreValue: 380,
    color: '#38bdf8',
    outlineColor: '#bae6fd',
    fireCooldownMs: 1950,
    projectileSpeed: 265,
    description: 'Projects a frontal temporal barrier. Flank it with a Chrono-Ghost Echo or bank-shot off a bumper!',
  },
  'kronos-omega': {
    id: 'kronos-omega',
    name: 'KRONOS-OMEGA, ARCHITECT OF ETERNITY',
    role: '3-Phase God-Forge Apex Boss',
    baseHp: 950,
    radius: 36,
    speed: 78,
    mass: 2.8,
    contactDamage: 24,
    scoreValue: 5000,
    color: '#f43f5e',
    outlineColor: '#fde047',
    fireCooldownMs: 1350,
    projectileSpeed: 275,
    description: 'Sovereign of the Chrono-Vortex. Shifts between Spiral Barrages, Gravity Wells, and Temporal Clones.',
  },
};

export const SECTORS: readonly SectorDef[] = [
  {
    sector: 1,
    name: 'Sector I: The Clockwork Crucible',
    subtitle: 'Ignition of the Pinball Anvil',
    lore: 'Bank your Striker and enemy drones into the 4 Elemental Resonance Bumpers to ignite exponential Chain Multipliers.',
    themeColor: '#f59e0b',
    accentColor: '#38bdf8',
    targetKills: 10,
    isBossSector: false,
    gravityWellStrength: 0,
    bumpers: [
      { xOffset: -115, yOffset: -95, radius: 28, element: 'SOLAR', label: 'Solar Anvil' },
      { xOffset: 115, yOffset: -95, radius: 28, element: 'ARC', label: 'Arc Coil' },
      { xOffset: -115, yOffset: 95, radius: 28, element: 'CRYO', label: 'Cryo Prism' },
      { xOffset: 115, yOffset: 95, radius: 28, element: 'SOLAR', label: 'Solar Anvil' },
    ],
    enemyWeights: [
      { type: 'gear-hound', weight: 55 },
      { type: 'prism-sniper', weight: 35 },
      { type: 'void-juggernaut', weight: 10 },
    ],
  },
  {
    sector: 2,
    name: 'Sector II: Astral Prism Vault',
    subtitle: 'Bullet Alchemy & Refraction Geometry',
    lore: 'Prism-Snipers and Arc-Weavers flood the arena. Trigger Pulse Parry [Q / Right-Click] to transmute enemy fire into Homing Shards!',
    themeColor: '#ec4899',
    accentColor: '#2dd4bf',
    targetKills: 13,
    isBossSector: false,
    gravityWellStrength: 0,
    bumpers: [
      { xOffset: 0, yOffset: -130, radius: 30, element: 'ARC', label: 'Zenith Tesla' },
      { xOffset: -135, yOffset: 0, radius: 28, element: 'CRYO', label: 'West Cryo-Lens' },
      { xOffset: 135, yOffset: 0, radius: 28, element: 'SOLAR', label: 'East Solar-Lens' },
      { xOffset: 0, yOffset: 130, radius: 30, element: 'VOID', label: 'Nadir Void-Core' },
    ],
    enemyWeights: [
      { type: 'gear-hound', weight: 30 },
      { type: 'prism-sniper', weight: 35 },
      { type: 'arc-weaver', weight: 25 },
      { type: 'void-juggernaut', weight: 10 },
    ],
  },
  {
    sector: 3,
    name: 'Sector III: Singularity Foundry',
    subtitle: 'Orbital Slingshots & Heavy Collisions',
    lore: 'A central Void Singularity curves trajectories. Slingshot Obsidian Juggernauts into the bumpers for 2.5x Shatter Crits!',
    themeColor: '#8b5cf6',
    accentColor: '#f43f5e',
    targetKills: 15,
    isBossSector: false,
    gravityWellStrength: 42,
    bumpers: [
      { xOffset: 0, yOffset: 0, radius: 34, element: 'VOID', label: 'Singularity Core' },
      { xOffset: -140, yOffset: -85, radius: 26, element: 'SOLAR', label: 'Solar Bumper' },
      { xOffset: 140, yOffset: -85, radius: 26, element: 'ARC', label: 'Arc Bumper' },
      { xOffset: -140, yOffset: 85, radius: 26, element: 'CRYO', label: 'Cryo Bumper' },
      { xOffset: 140, yOffset: 85, radius: 26, element: 'SOLAR', label: 'Solar Bumper' },
    ],
    enemyWeights: [
      { type: 'gear-hound', weight: 25 },
      { type: 'void-juggernaut', weight: 30 },
      { type: 'arc-weaver', weight: 25 },
      { type: 'chrono-warden', weight: 20 },
    ],
  },
  {
    sector: 4,
    name: 'Sector IV: The Paradox Loom',
    subtitle: 'Crossfire of the Temporal Ghosts',
    lore: 'Paradox Wardens deflect frontal attacks. Spawn Chrono-Ghost Echoes [E] to execute 4-way temporal pincer combos!',
    themeColor: '#06b6d4',
    accentColor: '#fbbf24',
    targetKills: 18,
    isBossSector: false,
    gravityWellStrength: 25,
    bumpers: [
      { xOffset: -85, yOffset: 0, radius: 30, element: 'VOID', label: 'Alpha Loom' },
      { xOffset: 85, yOffset: 0, radius: 30, element: 'VOID', label: 'Omega Loom' },
      { xOffset: 0, yOffset: -135, radius: 26, element: 'ARC', label: 'North Conduit' },
      { xOffset: 0, yOffset: 135, radius: 26, element: 'SOLAR', label: 'South Conduit' },
    ],
    enemyWeights: [
      { type: 'chrono-warden', weight: 35 },
      { type: 'arc-weaver', weight: 25 },
      { type: 'prism-sniper', weight: 20 },
      { type: 'void-juggernaut', weight: 20 },
    ],
  },
  {
    sector: 5,
    name: 'Sector V: Throne of Kronos-Omega',
    subtitle: 'Final Reckoning in the God-Forge',
    lore: 'Shatter Kronos-Omega across 3 cosmic phases! Parry his Supernova Rings, ricochet his Clockwork Hounds into his core, and unleash Overdrive!',
    themeColor: '#f43f5e',
    accentColor: '#fde047',
    targetKills: 1,
    isBossSector: true,
    gravityWellStrength: 30,
    bumpers: [
      { xOffset: -130, yOffset: -100, radius: 28, element: 'SOLAR', label: 'Solar Star-Anvil' },
      { xOffset: 130, yOffset: -100, radius: 28, element: 'ARC', label: 'Arc Star-Anvil' },
      { xOffset: -130, yOffset: 100, radius: 28, element: 'CRYO', label: 'Cryo Star-Anvil' },
      { xOffset: 130, yOffset: 100, radius: 28, element: 'VOID', label: 'Void Star-Anvil' },
    ],
    enemyWeights: [
      { type: 'gear-hound', weight: 50 },
      { type: 'prism-sniper', weight: 30 },
      { type: 'chrono-warden', weight: 20 },
    ],
  },
];

export type RelicSchool = 'KINETIC' | 'CHRONO' | 'ALCHEMY' | 'AEGIS';

export interface RelicDef {
  id: string;
  name: string;
  school: RelicSchool;
  rarity: 'RARE' | 'EPIC' | 'MYTHIC';
  icon: string;
  color: string;
  description: string;
}

export const GOD_FORGE_RELICS: readonly RelicDef[] = [
  {
    id: 'celestial-bumper-spurs',
    name: 'Celestial Bumper Spurs',
    school: 'KINETIC',
    rarity: 'RARE',
    icon: '⚡',
    color: '#f59e0b',
    description: 'Bumper collisions grant +45% velocity and deal +55% bonus Elemental Nova damage.',
  },
  {
    id: 'newtonian-guillotine',
    name: 'Newtonian Guillotine',
    school: 'KINETIC',
    rarity: 'EPIC',
    icon: '☄️',
    color: '#fb923c',
    description: 'Enemy-into-Enemy and Wall-Slam impacts deal +65% damage and restore 8 Stamina.',
  },
  {
    id: 'pinball-overdrive-core',
    name: 'Pinball Overdrive Core',
    school: 'KINETIC',
    rarity: 'MYTHIC',
    icon: '🔥',
    color: '#ef4444',
    description: 'Every 3rd bounce in a single Dash fires a ring of 6 homing Forge Bolts.',
  },
  {
    id: 'mobius-tape-spool',
    name: 'Möbius Tape Spool',
    school: 'CHRONO',
    rarity: 'RARE',
    icon: '⏳',
    color: '#38bdf8',
    description: 'Chrono-Ghost Echoes last +2.0 seconds longer and deal +40% ramming damage.',
  },
  {
    id: 'paradox-rewind-anchor',
    name: 'Paradox Rewind Anchor',
    school: 'CHRONO',
    rarity: 'EPIC',
    icon: '⏪',
    color: '#a855f7',
    description: 'Spawning a Chrono-Ghost heals 12 HP and triggers a Free Pulse Parry at both positions.',
  },
  {
    id: 'trinity-timeline-loom',
    name: 'Trinity Timeline Loom',
    school: 'CHRONO',
    rarity: 'MYTHIC',
    icon: '🌀',
    color: '#818cf8',
    description: 'Echo cooldown reduced by 35%. Active Chrono-Ghosts fire homing bolts every 1.2s.',
  },
  {
    id: 'philosophers-ricochet',
    name: "Philosopher's Ricochet",
    school: 'ALCHEMY',
    rarity: 'RARE',
    icon: '💎',
    color: '#ec4899',
    description: 'Parried enemy projectiles deal +75% damage and pierce through 1 additional target.',
  },
  {
    id: 'supernova-crucible',
    name: 'Supernova Crucible',
    school: 'ALCHEMY',
    rarity: 'EPIC',
    icon: '☀️',
    color: '#f43f5e',
    description: 'Solar & Arc Bumpers ignite enemies for 3s; ignited foes explode on death.',
  },
  {
    id: 'absolute-zero-lens',
    name: 'Absolute Zero Lens',
    school: 'ALCHEMY',
    rarity: 'RARE',
    icon: '❄️',
    color: '#06b6d4',
    description: 'Cryo & Void Bumpers slow enemies by 50% and make them take +40% Shatter Damage.',
  },
  {
    id: 'vampiric-gyroscope',
    name: 'Vampiric Gyroscope',
    school: 'AEGIS',
    rarity: 'EPIC',
    icon: '🩸',
    color: '#10b981',
    description: 'Eliminating an enemy while at 4x+ Combo Chain restores 5 HP and +12 Overdrive.',
  },
  {
    id: 'mirror-aegis-capacitor',
    name: 'Mirror Aegis Capacitor',
    school: 'AEGIS',
    rarity: 'RARE',
    icon: '🛡️',
    color: '#2dd4bf',
    description: 'Pulse Parry radius increased by +35% and successful parries reset Dash cooldown.',
  },
  {
    id: 'god-forge-crown',
    name: 'Crown of the GOAT Architect',
    school: 'AEGIS',
    rarity: 'MYTHIC',
    icon: '👑',
    color: '#fde047',
    description: '+35 Max HP, +20% All Damage, and Overdrive unleashes continuous Lightning Storms.',
  },
];
