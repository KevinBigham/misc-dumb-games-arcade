export type AugmentCategory = 'ballistics' | 'voltaic' | 'chrono' | 'reactor' | 'xenobio';
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
    icon: ' bounce',
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
    name: 'Autonomous Glaive Satellites',
    category: 'voltaic',
    rarity: 'rare',
    maxStacks: 3,
    icon: '✦',
    description: 'Spawns +2 high-speed plasma blades that orbit your Cyber-Frame and shred swarmers.',
  },
  {
    id: 'hydra_missiles',
    name: 'Micro-Hydra Missile Pod',
    category: 'voltaic',
    rarity: 'epic',
    maxStacks: 4,
    icon: '🚀',
    description: 'Every 8th primary shot launches a salvo of homing plasma micro-missiles.',
  },
  {
    id: 'emp_nova_shield',
    name: 'Capacitor Discharge Nova',
    category: 'voltaic',
    rarity: 'common',
    maxStacks: 3,
    icon: '◎',
    description: 'When Aegis Shield breaks or recharges to full, unleashes a 320px EMP shockwave.',
  },
  {
    id: 'ion_wake',
    name: 'Ionized Thruster Wake',
    category: 'voltaic',
    rarity: 'common',
    maxStacks: 3,
    icon: '≈',
    description: '+14% Movement Speed and leaves a searing plasma wake while moving.',
  },

  // CHRONO
  {
    id: 'witch_time_dilator',
    name: 'Tachyon Witch-Time Dilator',
    category: 'chrono',
    rarity: 'epic',
    maxStacks: 3,
    icon: '⏳',
    description: '+1.2s Perfect-Dash Witch-Time duration and +25% bonus damage during slow-mo.',
  },
  {
    id: 'phase_echo',
    name: 'Holographic Phase Echo',
    category: 'chrono',
    rarity: 'rare',
    maxStacks: 3,
    icon: '♊',
    description: 'Dashing leaves an unstable phase decoy that pulses damage and taunts drones.',
  },
  {
    id: 'katana_resonator',
    name: 'Harmonic Alt-Fire Resonator',
    category: 'chrono',
    rarity: 'rare',
    maxStacks: 4,
    icon: '⚔',
    description: '-20% Alt-Fire cooldown and +28% Katana / Mortar / Stasis / Warhead radius.',
  },
  {
    id: 'temporal_rewind',
    name: 'Quantum Chrono-Anchor',
    category: 'chrono',
    rarity: 'overdrive',
    maxStacks: 1,
    icon: '♾',
    description: 'Once per sortie, fatal hull damage rewinds spacetime, restoring 60% HP & full Shield.',
  },
  {
    id: 'relativity_thrusters',
    name: 'Relativistic Phase Thrusters',
    category: 'chrono',
    rarity: 'common',
    maxStacks: 4,
    icon: '»',
    description: '-18% Phase-Dash cooldown and +60px Vacuum Shard Pickup Radius.',
  },
  {
    id: 'bullet_graze_matrix',
    name: 'Tachyon Graze Harvester',
    category: 'chrono',
    rarity: 'common',
    maxStacks: 3,
    icon: '✧',
    description: 'Near-misses with enemy bullets grant +18% XP and +15% Heat Dissipation.',
  },

  // REACTOR
  {
    id: 'titan_plating',
    name: 'Reactive Neutronium Plating',
    category: 'reactor',
    rarity: 'common',
    maxStacks: 5,
    icon: '⛨',
    description: '+45 Max Hull HP and +8% Global Damage Reduction.',
  },
  {
    id: 'aegis_overcap',
    name: 'Aegis Flux Overcapacitor',
    category: 'reactor',
    rarity: 'common',
    maxStacks: 5,
    icon: '◈',
    description: '+40 Max Aegis Shield and faster shield recharge.',
  },
  {
    id: 'vampiric_nanites',
    name: 'Vampiric Repair Nanites',
    category: 'reactor',
    rarity: 'epic',
    maxStacks: 3,
    icon: '✚',
    description: 'Every 12 kills restores +8 Hull HP; critical hits restore +4 Aegis Shield.',
  },
  {
    id: 'thermal_heatsink',
    name: 'Cryo-Core Heatsink',
    category: 'reactor',
    rarity: 'common',
    maxStacks: 4,
    icon: '♨',
    description: '-22% Weapon Heat generation per shot.',
  },
  {
    id: 'kinetic_recycler',
    name: 'Void Core Dynamo',
    category: 'reactor',
    rarity: 'rare',
    maxStacks: 3,
    icon: '⚛',
    description: 'Kills grant +35% faster Ultimate Overclock charge.',
  },
  {
    id: 'berserker_reactor',
    name: 'Overdrive Singularity Core',
    category: 'reactor',
    rarity: 'overdrive',
    maxStacks: 2,
    icon: '🔥',
    description: '+35% All Damage and +20% Fire Rate.',
  },

  // XENOBIO & ANTIGRAVITY (NEW BESPOKE KEVIN BIGHAM AUGMENTS!)
  {
    id: 'protac_warhead_catalyst',
    name: 'PROTAC Covalent Degrader',
    category: 'xenobio',
    rarity: 'overdrive',
    maxStacks: 3,
    icon: '🧬',
    description:
      'Critical hits dock a Cys12 covalent warhead, amplifying target damage taken by +35% and chaining catalytic bursts.',
  },
  {
    id: 'antigravity_subagents',
    name: 'Antigravity Sub-Agent Uplink',
    category: 'xenobio',
    rarity: 'overdrive',
    maxStacks: 3,
    icon: '🤖',
    description:
      'Spawns +2 autonomous AI Sub-Agent Wingmen that orbit your Mech, fire vector lances, and intercept enemy bullets.',
  },
  {
    id: 'alphagenome_splicer',
    name: 'AlphaGenome Codon Accelerator',
    category: 'xenobio',
    rarity: 'epic',
    maxStacks: 3,
    icon: '🧪',
    description:
      'Every 4th kill automatically splices a high-impact A-T-G-C nucleotide base and boosts Codon Burst damage by +45%.',
  },
  {
    id: 'hit_stick_hydraulics',
    name: '99-POW Hit-Stick Hydraulics',
    category: 'xenobio',
    rarity: 'epic',
    maxStacks: 3,
    icon: '🏈',
    description:
      'Dashing or Alt-Firing unleashes a concussive Hit-Stick shockwave that bowls enemies into each other for 280% collision damage!',
  },
];

export const SYNERGY_EVOLUTIONS: readonly SynergyEvolution[] = [
  {
    id: 'stormbringer_overload',
    name: 'STORMBRINGER OVERLOAD',
    requiredAugments: ['arc_conductor', 'plasma_supercharger'],
    icon: '⚡☀',
    description: '100% Chain Lightning chance + +3 extra arc jumps on every primary shot!',
    bannerColor: '#00f2fe',
  },
  {
    id: 'phantom_assassin_protocol',
    name: 'PHANTOM BLADE PROTOCOL',
    requiredAugments: ['witch_time_dilator', 'katana_resonator'],
    icon: '⏳⚔',
    description: 'Every Phase-Dash automatically triggers a 360° Plasma Katana Bullet-Parry Ring!',
    bannerColor: '#ff0844',
  },
  {
    id: 'event_horizon_saw',
    name: 'EVENT HORIZON GRINDER',
    requiredAugments: ['orbital_blades', 'singularity_rounds'],
    icon: '✦◉',
    description: 'Doubles Orbital Glaive count (+4) and expands their orbit into a vortex saw!',
    bannerColor: '#b721ff',
  },
  {
    id: 'apocalypse_salvo',
    name: 'APOCALYPSE HYDRA BARRAGE',
    requiredAugments: ['hydra_missiles', 'split_chamber'],
    icon: '🚀❖',
    description: 'Halves Micro-Hydra missile interval (every 4th shot) and adds +3 missiles per salvo!',
    bannerColor: '#ff9a00',
  },
  {
    id: 'chrono_rail_overdrive',
    name: 'TACHYON LANCE MATRIX',
    requiredAugments: ['tungsten_sabot', 'executioner_optics'],
    icon: '▲⊕',
    description: '+35% Critical Hit Chance, +4 Hull Pierce, and crits refund 10% weapon heat!',
    bannerColor: '#facc15',
  },
  {
    id: 'immortal_dreadnought',
    name: 'IMMORTAL AEGIS CORE',
    requiredAugments: ['titan_plating', 'vampiric_nanites'],
    icon: '⛨✚',
    description: '+100 Max Hull HP, +60 Max Aegis Shield, and doubles Vampiric Nanite repair!',
    bannerColor: '#10b981',
  },
  {
    id: 'covalent_protac_cascade',
    name: 'ALPHAFOLD COVALENT CASCADE',
    requiredAugments: ['protac_warhead_catalyst', 'alphagenome_splicer'],
    icon: '🧬🧪',
    description:
      'Covalent PROTAC warheads spread across all nearby enemies on death and trigger double A-T-G-C Codon Splices!',
    bannerColor: '#10b981',
  },
  {
    id: 'antigravity_swarm_matrix',
    name: 'ANTIGRAVITY SWARM DYNASTY',
    requiredAugments: ['antigravity_subagents', 'hit_stick_hydraulics'],
    icon: '🤖🏈',
    description:
      'Deploys +2 elite Hit-Stick Sub-Agent Enforcers that autonomously parry enemy bullets and bowl through swarms!',
    bannerColor: '#38bdf8',
  },
];

export interface ComputedAugmentStats {
  damageMultiplier: number;
  fireRateMultiplier: number;
  extraProjectiles: number;
  pierceBonus: number;
  ricochetBounces: number;
  critChance: number;
  critMultiplier: number;
  chainLightningChance: number;
  chainTargets: number;
  cryoStacks: number;
  singularityStacks: number;
  orbitalBladesCount: number;
  missileStacks: number;
  empNovaStacks: number;
  ionTrailStacks: number;
  witchTimeBonusSeconds: number;
  phaseEchoStacks: number;
  altCooldownMultiplier: number;
  altRadiusMultiplier: number;
  hasTemporalRewind: boolean;
  dashCooldownMultiplier: number;
  pickupRadiusBonus: number;
  xpMultiplier: number;
  heatGenMultiplier: number;
  bonusMaxHp: number;
  bonusMaxShield: number;
  damageReduction: number;
  vampiricStacks: number;
  moveSpeedMultiplier: number;
  protacStacks: number;
  subagentStacks: number;
  codonSplicerStacks: number;
  hitStickStacks: number;
  unlockedSynergies: SynergyEvolution[];
}

export function computeAugmentStats(
  ranks: Record<string, number>,
  armoryRanks: Record<string, number> = {}
): ComputedAugmentStats {
  const r = (id: string) => ranks[id] || 0;
  const arm = (id: string) => armoryRanks[id] || 0;

  const unlockedSynergies = SYNERGY_EVOLUTIONS.filter(
    (syn) => r(syn.requiredAugments[0]) > 0 && r(syn.requiredAugments[1]) > 0
  );
  const hasSyn = (id: string) => unlockedSynergies.some((s) => s.id === id);

  let damageMultiplier =
    1 +
    r('split_chamber') * 0.12 +
    r('tungsten_sabot') * 0.22 +
    r('berserker_reactor') * 0.35 +
    r('protac_warhead_catalyst') * 0.15 +
    arm('armory_damage') * 0.08;

  const fireRateMultiplier =
    1 +
    r('plasma_supercharger') * 0.25 +
    r('berserker_reactor') * 0.2 +
    arm('armory_firerate') * 0.06;

  const extraProjectiles = r('split_chamber');
  const pierceBonus = r('tungsten_sabot') + (hasSyn('chrono_rail_overdrive') ? 4 : 0);
  const ricochetBounces = r('ricochet_matrix');

  const critChance = Math.min(
    0.95,
    0.1 +
      r('executioner_optics') * 0.12 +
      arm('armory_crit') * 0.04 +
      (hasSyn('chrono_rail_overdrive') ? 0.35 : 0)
  );
  const critMultiplier = 1.65 + r('executioner_optics') * 0.35;

  const chainLightningChance = hasSyn('stormbringer_overload')
    ? 1.0
    : r('arc_conductor') > 0
    ? 0.35
    : 0;
  const chainTargets =
    r('arc_conductor') * 2 + (hasSyn('stormbringer_overload') ? 3 : 0);

  const orbitalBladesCount =
    r('orbital_blades') * 2 + (hasSyn('event_horizon_saw') ? 2 : 0);

  const bonusMaxHp =
    r('titan_plating') * 45 +
    arm('armory_hull') * 25 +
    (hasSyn('immortal_dreadnought') ? 100 : 0);

  const bonusMaxShield =
    r('aegis_overcap') * 40 +
    arm('armory_shield') * 20 +
    (hasSyn('immortal_dreadnought') ? 60 : 0);

  const damageReduction = Math.min(0.6, r('titan_plating') * 0.08);
  const vampiricStacks =
    r('vampiric_nanites') * (hasSyn('immortal_dreadnought') ? 2 : 1);

  const moveSpeedMultiplier = 1 + r('ion_wake') * 0.14 + arm('armory_speed') * 0.05;

  const protacStacks =
    r('protac_warhead_catalyst') + (hasSyn('covalent_protac_cascade') ? 2 : 0);
  const subagentStacks =
    r('antigravity_subagents') + (hasSyn('antigravity_swarm_matrix') ? 2 : 0);
  const codonSplicerStacks =
    r('alphagenome_splicer') + (hasSyn('covalent_protac_cascade') ? 1 : 0);
  const hitStickStacks =
    r('hit_stick_hydraulics') + (hasSyn('antigravity_swarm_matrix') ? 1 : 0);

  if (hasSyn('covalent_protac_cascade')) {
    damageMultiplier += 0.25;
  }

  return {
    damageMultiplier,
    fireRateMultiplier,
    extraProjectiles,
    pierceBonus,
    ricochetBounces,
    critChance,
    critMultiplier,
    chainLightningChance,
    chainTargets,
    cryoStacks: r('cryo_shatter'),
    singularityStacks: r('singularity_rounds'),
    orbitalBladesCount,
    missileStacks: r('hydra_missiles') + (hasSyn('apocalypse_salvo') ? 2 : 0),
    empNovaStacks: r('emp_nova_shield'),
    ionTrailStacks: r('ion_wake'),
    witchTimeBonusSeconds: r('witch_time_dilator') * 1.2,
    phaseEchoStacks: r('phase_echo'),
    altCooldownMultiplier: Math.max(0.35, 1 - r('katana_resonator') * 0.2),
    altRadiusMultiplier: 1 + r('katana_resonator') * 0.28,
    hasTemporalRewind: r('temporal_rewind') > 0,
    dashCooldownMultiplier: Math.max(0.38, 1 - r('relativity_thrusters') * 0.18),
    pickupRadiusBonus: r('relativity_thrusters') * 60 + arm('armory_magnet') * 35,
    xpMultiplier: 1 + r('bullet_graze_matrix') * 0.18,
    heatGenMultiplier: Math.max(0.3, 1 - r('thermal_heatsink') * 0.22),
    bonusMaxHp,
    bonusMaxShield,
    damageReduction,
    vampiricStacks,
    moveSpeedMultiplier,
    protacStacks,
    subagentStacks,
    codonSplicerStacks,
    hitStickStacks,
    unlockedSynergies,
  };
}
