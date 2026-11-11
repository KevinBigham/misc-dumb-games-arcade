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
    description: 'Deflect 15 enemy projectiles using Valkyrie Katana or Phase-Parry.',
    rewardCores: 40,
    icon: '⚔',
  },
  {
    id: 'witch_time_ace',
    title: 'TACHYON PHANTOM',
    description: 'Trigger Perfect-Dash Witch-Time 5 times in a single run.',
    rewardCores: 45,
    icon: '⏳',
  },
  {
    id: 'synergy_architect',
    title: 'SYNERGY OVERLOAD',
    description: 'Unlock any Weapon Synergy Evolution during a run.',
    rewardCores: 60,
    icon: '☢',
  },
  {
    id: 'boss_slayer_1',
    title: 'SERAPH DECOMMISSIONED',
    description: 'Destroy Sector 1 Boss: SERAPH-MKIV.',
    rewardCores: 75,
    icon: '🏆',
  },
  {
    id: 'boss_slayer_2',
    title: 'WYRM BREAKER',
    description: 'Destroy Sector 2 Boss: LEVIATHAN-OMEGA.',
    rewardCores: 120,
    icon: '🐉',
  },
  {
    id: 'voidbreaker_rank',
    title: 'STYLE RANK: VOIDBREAKER',
    description: 'Reach the maximum VOIDBREAKER (SSS) combat style rank.',
    rewardCores: 80,
    icon: '🔥',
  },
  {
    id: 'architect_vanquished',
    title: 'SOVEREIGN OF THE VOID',
    description: 'Defeat Sector 3 Final Boss: ARCHITECT PRIME.',
    rewardCores: 250,
    icon: '👑',
  },
];

export interface RunRecord {
  mechId: MechId;
  score: number;
  waveReached: number;
  kills: number;
  maxCombo: number;
  victory: boolean;
  timestamp: number;
}

export interface SaveProfile {
  voidCores: number;
  totalKills: number;
  totalRuns: number;
  bestScore: number;
  bestWave: number;
  selectedMech: MechId;
  armoryRanks: Record<string, number>;
  unlockedAchievements: string[];
  recentRuns: RunRecord[];
}

const STORAGE_KEY = 'voidbreaker_overdrive_save_v1';

export function createDefaultProfile(): SaveProfile {
  return {
    voidCores: 50, // Starter Void Cores so players can test the Armory right away
    totalKills: 0,
    totalRuns: 0,
    bestScore: 0,
    bestWave: 1,
    selectedMech: 'valkyrie',
    armoryRanks: {},
    unlockedAchievements: [],
    recentRuns: [],
  };
}

export function loadProfile(): SaveProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProfile();
    const parsed = JSON.parse(raw) as Partial<SaveProfile>;
    return {
      ...createDefaultProfile(),
      ...parsed,
      armoryRanks: { ...(parsed.armoryRanks || {}) },
      unlockedAchievements: [...(parsed.unlockedAchievements || [])],
      recentRuns: [...(parsed.recentRuns || [])].slice(0, 10),
    };
  } catch {
    return createDefaultProfile();
  }
}

export function saveProfile(profile: SaveProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors in restricted contexts
  }
}

export function getArmoryUpgradeCost(spec: ArmoryUpgradeSpec, currentRank: number): number {
  return spec.baseCost + currentRank * spec.costStep;
}

export function purchaseArmoryUpgrade(
  profile: SaveProfile,
  upgradeId: string
): { success: boolean; cost: number; newRank: number } {
  const spec = ARMORY_UPGRADES.find((u) => u.id === upgradeId);
  if (!spec) return { success: false, cost: 0, newRank: 0 };

  const currentRank = profile.armoryRanks[upgradeId] || 0;
  if (currentRank >= spec.maxRank) {
    return { success: false, cost: 0, newRank: currentRank };
  }

  const cost = getArmoryUpgradeCost(spec, currentRank);
  if (profile.voidCores < cost) {
    return { success: false, cost, newRank: currentRank };
  }

  profile.voidCores -= cost;
  profile.armoryRanks[upgradeId] = currentRank + 1;
  saveProfile(profile);
  return { success: true, cost, newRank: currentRank + 1 };
}
