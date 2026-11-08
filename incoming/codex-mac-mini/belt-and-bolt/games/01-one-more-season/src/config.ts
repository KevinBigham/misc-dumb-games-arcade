export const RULES_VERSION = '1.0.0';
export const SAVE_SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'argon_game01_one_more_season_save_v1';

export type AttributeKey = 'attack' | 'defense' | 'control' | 'stamina';

export type TacticalPlanId = 'Patient' | 'Balanced' | 'Aggressive';

export type PossessionPoints = 0 | 3 | 7;

export interface BasePossessionDistribution {
  p0: number;
  p3: number;
  p7: number;
}

export const ATTRIBUTE_KEYS: readonly AttributeKey[] = [
  'attack',
  'defense',
  'control',
  'stamina',
] as const;

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  attack: 'Attack',
  defense: 'Defense',
  control: 'Control',
  stamina: 'Stamina',
};

export const TACTICAL_PLAN_IDS: readonly TacticalPlanId[] = [
  'Patient',
  'Balanced',
  'Aggressive',
] as const;

export const CONFIG = {
  rulesVersion: RULES_VERSION,
  saveSchemaVersion: SAVE_SCHEMA_VERSION,
  defaultSeed: 202601,
  clubName: 'Ironvale Rovers FC',
  clubNickname: 'The Ironworks Five',
  seasonFixtures: 6,
  seasonWinTarget: 4,
  rosterSize: 8,
  startersCount: 5,
  reservesCount: 3,
  prepPointsPerFixture: 2,
  restFatigueDelta: -24,
  trainFatigueDelta: 8,
  trainAttributeDelta: 1,
  postMatchDevAttributeDelta: 1,
  minAttribute: 1,
  maxAttribute: 10,
  minFatigue: 0,
  maxFatigue: 100,
  effectiveFatigueDivisor: 200,
  postMatchStarterFatigueBase: 24,
  postMatchReserveFatigueDelta: -18,
  possessionsPerTeam: 8,
  totalPossessions: 16,
  maxProbabilityShift: 0.15,
  attributeDeltaShiftScale: 0.008,
  basePlanDistributions: {
    Patient: { p0: 0.25, p3: 0.55, p7: 0.20 },
    Balanced: { p0: 0.35, p3: 0.35, p7: 0.30 },
    Aggressive: { p0: 0.50, p3: 0.10, p7: 0.40 },
  } as Record<TacticalPlanId, BasePossessionDistribution>,
  documentedStrategySeeds: [202601, 202602, 202605, 202609] as const,
} as const;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clampFatigue(fatigue: number): number {
  return clamp(Math.round(fatigue), CONFIG.minFatigue, CONFIG.maxFatigue);
}

export function clampAttribute(value: number): number {
  return clamp(Math.round(value), CONFIG.minAttribute, CONFIG.maxAttribute);
}

/**
 * Exact contract: Multiply each starter's Attack, Defense, and Control by (1 - fatigue / 200).
 * Stamina reduces post-match fatigue rather than boosting match stats.
 */
export function computeEffectiveMultiplier(fatigue: number): number {
  const clamped = clampFatigue(fatigue);
  return 1 - clamped / CONFIG.effectiveFatigueDivisor;
}

export function computeEffectiveStat(rawStat: number, fatigue: number): number {
  return Number((rawStat * computeEffectiveMultiplier(fatigue)).toFixed(4));
}

/**
 * Post-match starter fatigue gain: 24 - Stamina.
 */
export function computeStarterPostMatchFatigueDelta(stamina: number): number {
  return Math.max(0, CONFIG.postMatchStarterFatigueBase - stamina);
}
