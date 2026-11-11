export type AugmentCategory = 'ballistics' | 'voltaic' | 'chrono' | 'reactor';
export type AugmentRarity = 'common' | 'rare' | 'epic' | 'overdrive';

export interface AugmentSpec {
  id: string;
  name: string;
  category: AugmentCategory;
  rarity: AugmentRarity;
  maxStacks: number;
  icon: string;
  description: string;
}

export interface SynergyEvolution {
  id: string;
  name: string;
  requiredAugments: [string, string];
  icon: string;
  description: string;
  bannerColor: string;
}

export const AUGMENTS: readonly AugmentSpec[] = [
  // BALLISTICS
  {
    id: 'split_chamber',
    name: 'Split-Chamber Multiplexer',
    category: 'ballistics',
    rarity: 'rare',
    maxStacks: 4,
    icon: '❖',
    description: '+1 additional projectile per shot and +12% weapon damage.',
  },
  {
    id: 'tungsten_sabot',
    name: 'Tungsten-Carbide Sabot',
    category: 'ballistics',
    rarity: 'common',
    maxStacks: 5,
    icon: '▲',
    description: '+22% projectile damage and +1 enemy hull pierce.',
  },
  {
    id: 'ricochet_matrix',
    name: 'Kinetic Ricochet Matrix',
    category: 'ballistics',
    rarity: 'rare',
    maxStacks: 3,
    icon: 'kos',
    description: 'Projectiles ricochet +1 time toward the nearest enemy within 260px.',
  },
  {
    id: 'cryo_shatter',
    name: 'Cryo-Shatter Payload',
    category: 'ballistics',
    rarity: 'epic',
    maxStacks: 3,
    icon: '❄',
    description: 'Hits chill enemies by 30% and cause frozen targets to shatter in an icy blast.',
  },
  {
    id: 'executioner_optics',
    name: 'Executioner Target Optics',
    category: 'ballistics',
    rarity: 'common',
    maxStacks: 5,
    icon: '⊕',
    description: '+12% Critical Hit Chance and +35% Critical Hit Multiplier.',
  },
  {
    id: 'singularity_rounds',
    name: 'Micro-Singularity Core',
    category: 'ballistics',
    rarity: 'overdrive',
    maxStacks: 2,
    icon: '◉',
    description: 'Critical hits spawn a mini gravity vortex that pulls nearby enemies together.',
  },

  // VOLTAIC
  {
    id: 'arc_conductor',
    name: 'Tesla Arc Conductor',
    category: 'voltaic',
    rarity: 'rare',
    maxStacks: 5,
    icon: '⚡',
    description: 'Shots have a 35% chance to chain 65% lightning damage across +2 nearby targets.',
  },
  {
    id: 'plasma_supercharger',
    name: 'Plasma Supercharger',
    category: 'voltaic',
    rarity: 'epic',
    maxStacks: 3,
    icon: '☀',
    description: '+25% Fire Rate and Active Vent Overcharge deals +40% bonus burn damage.',
  },
  {
    id: 'orbital_blades',
    name: 'Autonomous Orbital Blades',
    category: 'voltaic',
    rarity: 'rare',
    maxStacks: 4,
    icon: '❂',
    description: 'Summons +2 high-speed plasma sawblades that orbit your Mech and slice projectiles.',
  },
  {
    id: 'emp_shockwave',
    name: 'EMP Nova Capacitor',
    category: 'voltaic',
    rarity: 'common',
    maxStacks: 4,
    icon: '◎',
    description: 'Whenever your Aegis Shield breaks or refills, release a 320px EMP blast.',
  },
  {
    id: 'katana_resonator',
    name: 'Harmonic Blade Resonator',
    category: 'voltaic',
    rarity: 'epic',
    maxStacks: 3,
    icon: '⚔',
    description: '+35% Alt-Fire radius & damage; parried bullets split into 2 seeker bolts.',
  },
  {
    id: 'ion_trail',
    name: 'Ionized Thruster Wake',
    category: 'voltaic',
    rarity: 'common',
    maxStacks: 4,
    icon: '♒',
    description: 'Moving and dashing leaves a burning plasma wake that damages pursuing swarmers.',
  },

  // CHRONO-PHASE
  {
    id: 'witch_time_dilator',
    name: 'Tachyon Reflex Dilator',
    category: 'chrono',
    rarity: 'epic',
    maxStacks: 3,
    icon: '⏳',
    description: '+1.2s Perfect-Dash Witch-Time duration and +25% movement speed during slow-mo.',
  },
  {
    id: 'phase_echo',
    name: 'Holographic Phase Echo',
    category: 'chrono',
    rarity: 'rare',
    maxStacks: 3,
    icon: '◈',
    description: 'Dashing leaves an explosive holographic decoy that taunts enemies and detonates.',
  },
  {
    id: 'kinetic_recycler',
    name: 'Chrono-Cooldown Recycler',
    category: 'chrono',
    rarity: 'common',
    maxStacks: 5,
    icon: '↻',
    description: '-16% Dash and Alt-Fire cooldowns; kills reduce Ultimate cooldown by 0.4s.',
  },
  {
    id: 'hyper_thrusters',
    name: 'Vector-Boost Thrusters',
    category: 'chrono',
    rarity: 'common',
    maxStacks: 5,
    icon: '»',
    description: '+14% Mech Movement Speed and +20% Dash distance.',
  },
  {
    id: 'zero_point_vent',
    name: 'Zero-Point Heat Sink',
    category: 'chrono',
    rarity: 'rare',
    maxStacks: 4,
    icon: '❄️',
    description: '-22% Weapon Heat generation and widens the Active Vent Perfect Sweet-Spot.',
  },
  {
    id: 'temporal_rewind',
    name: 'Quantum Chrono-Anchor',
    category: 'chrono',
    rarity: 'overdrive',
    maxStacks: 1,
    icon: '♾',
    description: 'Taking fatal damage rewinds spacetime by 2s, restoring 60% Hull & clearing bullets (once per sector).',
  },

  // REACTOR & HULL
  {
    id: 'vampiric_nanites',
    name: 'Vampiric Repair Nanites',
    category: 'reactor',
    rarity: 'rare',
    maxStacks: 4,
    icon: '✚',
    description: 'Every 12 kills restores +8 Hull HP; critical kills grant +4 Aegis Shield.',
  },
  {
    id: 'titan_plating',
    name: 'Reactive Neutronium Plating',
    category: 'reactor',
    rarity: 'common',
    maxStacks: 5,
    icon: '⛨',
    description: '+40 Max Hull HP and +10% damage resistance.',
  },
  {
    id: 'aegis_overcharger',
    name: 'Aegis Shield Overcharger',
    category: 'reactor',
    rarity: 'common',
    maxStacks: 5,
    icon: '◈',
    description: '+35 Max Aegis Shield and +30% faster shield recharge rate.',
  },
  {
    id: 'magnet_attractor',
    name: 'Graviton Shard Attractor',
    category: 'reactor',
    rarity: 'common',
    maxStacks: 4,
    icon: '🧲',
    description: '+75% XP & Void Core pickup radius and +20% XP gain.',
  },
  {
    id: 'berserk_core',
    name: 'Overclocked Fusion Core',
    category: 'reactor',
    rarity: 'epic',
    maxStacks: 3,
    icon: '☢',
    description: 'Deal up to +50% more damage as your Combo Rank climbs from C to VOIDBREAKER.',
  },
  {
    id: 'omega_missiles',
    name: 'Micro-Hydra Missile Pod',
    category: 'reactor',
    rarity: 'overdrive',
    maxStacks: 3,
    icon: '🚀',
    description: 'Every 8th primary shot launches a salvo of 3 homing micro-missiles.',
  },
];

export const SYNERGY_EVOLUTIONS: readonly SynergyEvolution[] = [
  {
    id: 'stormbringer_overload',
    name: 'STORMBRINGER OVERLOAD',
    requiredAugments: ['arc_conductor', 'plasma_supercharger'],
    icon: '⚡☀',
    description: 'Every shot triggers chain lightning that arcs to 5 targets and leaves ionized shock fields!',
    bannerColor: '#00f2fe',
  },
  {
    id: 'event_horizon_saw',
    name: 'EVENT HORIZON GRINDER',
    requiredAugments: ['orbital_blades', 'singularity_rounds'],
    icon: '❂◉',
    description: 'Orbital blades double in size and pull nearby enemies directly into their shredding orbit!',
    bannerColor: '#b721ff',
  },
  {
    id: 'phantom_assassin_protocol',
    name: 'PHANTOM BLADE PROTOCOL',
    requiredAugments: ['witch_time_dilator', 'katana_resonator'],
    icon: '⏳⚔',
    description: 'Dashing automatically unleashes a 360° Plasma Katana slash that deflects all nearby bullets!',
    bannerColor: '#ff0844',
  },
  {
    id: 'Absolute_Zero_Barrage',
    name: 'ABSOLUTE ZERO BARRAGE',
    requiredAugments: ['split_chamber', 'cryo_shatter'],
    icon: '❖❄',
    description: 'Fires an additional +2 cryo-sabot rounds; shattering chilled enemies triggers chain-freezes!',
    bannerColor: '#38bdf8',
  },
  {
    id: 'immortal_dreadnought',
    name: 'IMMORTAL DREADNOUGHT CORE',
    requiredAugments: ['vampiric_nanites', 'aegis_overcharger'],
    icon: '✚◈',
    description: 'Over-healing Hull HP converts into Overshield and continuously pulses damaging shockwaves!',
    bannerColor: '#10b981',
  },
  {
    id: 'apocalypse_salvo',
    name: 'APOCALYPSE HYDRA SALVO',
    requiredAugments: ['omega_missiles', 'executioner_optics'],
    icon: '🚀⊕',
    description: 'Homing micro-missiles fire every 4th shot and are guaranteed to Critically Strike!',
    bannerColor: '#f59e0b',
  },
];

export interface ComputedAugmentStats {
  extraProjectiles: number;
  damageMultiplier: number;
  fireRateMultiplier: number;
  pierceBonus: number;
  ricochetBounces: number;
  critChance: number;
  critMultiplier: number;
  chainLightningChance: number;
  chainTargets: number;
  orbitalBladesCount: number;
  moveSpeedMultiplier: number;
  dashCooldownMultiplier: number;
  altCooldownMultiplier: number;
  altRadiusMultiplier: number;
  heatGenMultiplier: number;
  witchTimeBonusSeconds: number;
  bonusMaxHp: number;
  bonusMaxShield: number;
  damageReduction: number;
  pickupRadiusBonus: number;
  xpMultiplier: number;
  cryoStacks: number;
  singularityStacks: number;
  phaseEchoStacks: number;
  vampiricStacks: number;
  missileStacks: number;
  ionTrailStacks: number;
  empNovaStacks: number;
  hasTemporalRewind: boolean;
  unlockedSynergies: SynergyEvolution[];
}

export function computeAugmentStats(
  ranks: Record<string, number>,
  armoryRanks: Record<string, number> = {}
): ComputedAugmentStats {
  const r = (id: string) => ranks[id] || 0;
  const a = (id: string) => armoryRanks[id] || 0;

  const unlockedSynergies = SYNERGY_EVOLUTIONS.filter(
    (syn) => r(syn.requiredAugments[0]) > 0 && r(syn.requiredAugments[1]) > 0
  );
  const hasSyn = (id: string) => unlockedSynergies.some((s) => s.id === id);

  const extraProjectiles =
    r('split_chamber') + (hasSyn('Absolute_Zero_Barrage') ? 2 : 0);

  const damageMultiplier =
    (1 +
      r('split_chamber') * 0.12 +
      r('tungsten_sabot') * 0.22 +
      r('berserk_core') * 0.18 +
      a('armory_damage') * 0.08) *
    (hasSyn('stormbringer_overload') ? 1.25 : 1);

  const fireRateMultiplier =
    1 + r('plasma_supercharger') * 0.25 + a('armory_firerate') * 0.06;

  const pierceBonus = r('tungsten_sabot');
  const ricochetBounces = r('ricochet_matrix');

  const critChance =
    0.08 + r('executioner_optics') * 0.12 + a('armory_crit') * 0.04;
  const critMultiplier = 1.65 + r('executioner_optics') * 0.35;

  const chainLightningChance = hasSyn('stormbringer_overload')
    ? 1.0
    : Math.min(0.9, r('arc_conductor') * 0.35);
  const chainTargets =
    r('arc_conductor') * 2 + (hasSyn('stormbringer_overload') ? 3 : 0);

  const orbitalBladesCount =
    r('orbital_blades') * 2 + (hasSyn('event_horizon_saw') ? 2 : 0);

  const moveSpeedMultiplier =
    1 + r('hyper_thrusters') * 0.14 + a('armory_speed') * 0.05;
  const dashCooldownMultiplier = Math.max(
    0.35,
    1 - r('kinetic_recycler') * 0.14
  );
  const altCooldownMultiplier = Math.max(
    0.35,
    1 - r('kinetic_recycler') * 0.14
  );
  const altRadiusMultiplier = 1 + r('katana_resonator') * 0.35;
  const heatGenMultiplier = Math.max(0.3, 1 - r('zero_point_vent') * 0.2);
  const witchTimeBonusSeconds = r('witch_time_dilator') * 1.2;

  const bonusMaxHp = r('titan_plating') * 40 + a('armory_hull') * 25;
  const bonusMaxShield = r('aegis_overcharger') * 35 + a('armory_shield') * 20;
  const damageReduction = Math.min(0.55, r('titan_plating') * 0.09);

  const pickupRadiusBonus = r('magnet_attractor') * 75 + a('armory_magnet') * 35;
  const xpMultiplier = 1 + r('magnet_attractor') * 0.2;

  return {
    extraProjectiles,
    damageMultiplier,
    fireRateMultiplier,
    pierceBonus,
    ricochetBounces,
    critChance,
    critMultiplier,
    chainLightningChance,
    chainTargets,
    orbitalBladesCount,
    moveSpeedMultiplier,
    dashCooldownMultiplier,
    altCooldownMultiplier,
    altRadiusMultiplier,
    heatGenMultiplier,
    witchTimeBonusSeconds,
    bonusMaxHp,
    bonusMaxShield,
    damageReduction,
    pickupRadiusBonus,
    xpMultiplier,
    cryoStacks: r('cryo_shatter'),
    singularityStacks: r('singularity_rounds'),
    phaseEchoStacks: r('phase_echo'),
    vampiricStacks: r('vampiric_nanites'),
    missileStacks: r('omega_missiles'),
    ionTrailStacks: r('ion_trail'),
    empNovaStacks: r('emp_shockwave'),
    hasTemporalRewind: r('temporal_rewind') > 0,
    unlockedSynergies,
  };
}
