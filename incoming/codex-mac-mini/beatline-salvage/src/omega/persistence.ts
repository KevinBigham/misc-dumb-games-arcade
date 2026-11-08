import { MechId } from './mechs';

export interface ArmoryUpgradeSpec {
  id: string;
  name: string;
  description: string;
  maxRank: number;
  baseCost: number;
  costStep: number;
  icon: string;
}

export const ARMORY_UPGRADES: readonly ArmoryUpgradeSpec[] = [
  {
    id: 'armory_damage',
    name: 'Overclocked Weapon Cores',
    description: '+8% Base Weapon & Alt-Fire Damage per rank.',
    maxRank: 8,
    baseCost: 25,
    costStep: 20,
    icon: '⚔',
  },
  {
    id: 'armory_hull',
    name: 'Reinforced Titan Alloy',
    description: '+25 Max Mech Hull HP per rank.',
    maxRank: 8,
    baseCost: 20,
    costStep: 15,
    icon: '⛨',
  },
  {
    id: 'armory_shield',
    name: 'Capacitor Matrix Expansion',
    description: '+20 Max Aegis Shield per rank.',
    maxRank: 8,
    baseCost: 20,
    costStep: 15,
    icon: '◈',
  },
  {
    id: 'armory_firerate',
    name: 'Accelerator Feed Servos',
    description: '+6% Base Fire Rate per rank.',
    maxRank: 6,
    baseCost: 30,
    costStep: 25,
    icon: '⚡',
  },
  {
    id: 'armory_crit',
    name: 'Neural Targeting Subroutines',
    description: '+4% Base Critical Hit Chance per rank.',
    maxRank: 6,
    baseCost: 35,
    costStep: 25,
    icon: '⊕',
  },
  {
    id: 'armory_speed',
    name: 'Ion Thruster Calibration',
    description: '+5% Base Movement Speed per rank.',
    maxRank: 5,
    baseCost: 25,
    costStep: 20,
    icon: '»',
  },
  {
    id: 'armory_magnet',
    name: 'Subspace Collector Array',
    description: '+35px Base Shard & Void Core Pickup Radius per rank.',
    maxRank: 5,
    baseCost: 20,
    costStep: 15,
    icon: '🧲',
  },
];

export interface AchievementSpec {
  id: string;
  title: string;
  description: string;
  rewardCores: number;
  icon: string;
}

export const ACHIEVEMENTS: readonly AchievementSpec[] = [
  {
    id: 'first_blood',
    title: 'NEURAL LINK ESTABLISHED',
    description: 'Eliminate 50 hostile drones in a single sortie.',
    rewardCores: 25,
    icon: '💀',
  },
  {
    id: 'parry_master',
    title: 'RETURN TO SENDER',
    description: 'Deflect 15 enemy projectiles using Valkyrie Katana, Sub-Agents, or Hit-Stick.',
    rewardCores: 40,
    icon: '⚔',
  },
  {
    id: 'witch_time_ace',
    title: 'TACHYON DANCER',
    description: 'Trigger 5 Perfect-Dash Witch-Time slow-motion windows in a single run.',
    rewardCores: 40,
    icon: '⏳',
  },
  {
    id: 'synergy_architect',
    title: 'SYNERGY EVOLUTIONIST',
    description: 'Unlock a Weapon Synergy Evolution by combining two matching Neural Augments.',
    rewardCores: 50,
    icon: '⚛',
  },
  {
    id: 'kras_covalent_docker',
    title: 'SOTORASIB G12C DOCKING ACE',
    description: 'Land a direct hit on XENOFOLD-OMEGA (KRAS-G12C) P-Loop or Switch-II allosteric pocket.',
    rewardCores: 65,
    icon: '🧬',
  },
  {
    id: 'codon_splicer_master',
    title: 'ALPHAGENOME VARIANT ARCHITECT',
    description: 'Complete 3 A-T-G-C Triplet Codon Splices during a single sortie.',
    rewardCores: 55,
    icon: '🧪',
  },
  {
    id: 'hit_stick_bowling',
    title: 'HALL OF FAME HIT-STICK (99 POW)',
    description: 'Launch an enemy with a Hit-Stick Slam and bowl into another hostile.',
    rewardCores: 60,
    icon: '🏈',
  },
  {
    id: 'boss_slayer_1',
    title: 'SERAPH DECOMMISSIONED',
    description: 'Destroy Sector 01 Boss: SERAPH-MKIV.',
    rewardCores: 60,
    icon: '🏆',
  },
  {
    id: 'boss_slayer_2',
    title: 'WYRM SLAYER',
    description: 'Destroy Sector 02 Boss: LEVIATHAN-OMEGA.',
    rewardCores: 90,
    icon: '🐉',
  },
  {
    id: 'architect_vanquished',
    title: 'SOVEREIGN OF THE VOID',
    description: 'Vanquish Sector 03 Final Boss: ARCHITECT PRIME or XENOFOLD-OMEGA.',
    rewardCores: 150,
    icon: '👑',
  },
  {
    id: 'voidbreaker_rank',
    title: 'STYLE RANK: VOIDBREAKER',
    description: 'Reach the maximum VOIDBREAKER combat style rank during battle.',
    rewardCores: 75,
    icon: '⚡',
  },
];

export interface RunHistoryEntry {
  mechId: MechId;
  score: number;
  waveReached: number;
  kills: number;
  maxCombo: number;
  victory: boolean;
  timestamp: number;
}

export interface SaveProfile {
  version: number;
  voidCores: number;
  selectedMech: MechId;
  armoryRanks: Record<string, number>;
  unlockedAchievements: string[];
  bestScore: number;
  bestWave: number;
  totalKills: number;
  totalRuns: number;
  recentRuns: RunHistoryEntry[];
}

const STORAGE_KEY = 'voidbreaker_overdrive_profile_v1';

export function createDefaultProfile(): SaveProfile {
  return {
    version: 1,
    voidCores: 75, // Start with 75 Void Cores so the player can immediately test Armory upgrades
    selectedMech: 'xenofold',
    armoryRanks: {},
    unlockedAchievements: [],
    bestScore: 0,
    bestWave: 1,
    totalKills: 0,
    totalRuns: 0,
    recentRuns: [],
  };
}

export function loadProfile(): SaveProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProfile();
    const parsed = JSON.parse(raw) as Partial<SaveProfile>;
    const def = createDefaultProfile();
    return {
      ...def,
      ...parsed,
      armoryRanks: { ...def.armoryRanks, ...(parsed.armoryRanks || {}) },
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements
        : [],
      recentRuns: Array.isArray(parsed.recentRuns) ? parsed.recentRuns : [],
    };
  } catch {
    return createDefaultProfile();
  }
}

export function saveProfile(profile: SaveProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export function getArmoryUpgradeCost(spec: ArmoryUpgradeSpec, currentRank: number): number {
  return spec.baseCost + currentRank * spec.costStep;
}

export function purchaseArmoryUpgrade(
  profile: SaveProfile,
  upgradeId: string
): { success: boolean; newRank: number; costPaid: number } {
  const spec = ARMORY_UPGRADES.find((u) => u.id === upgradeId);
  if (!spec) return { success: false, newRank: 0, costPaid: 0 };

  const currentRank = profile.armoryRanks[upgradeId] || 0;
  if (currentRank >= spec.maxRank) {
    return { success: false, newRank: currentRank, costPaid: 0 };
  }

  const cost = getArmoryUpgradeCost(spec, currentRank);
  if (profile.voidCores < cost) {
    return { success: false, newRank: currentRank, costPaid: 0 };
  }

  profile.voidCores -= cost;
  profile.armoryRanks[upgradeId] = currentRank + 1;
  saveProfile(profile);
  return { success: true, newRank: currentRank + 1, costPaid: cost };
}
