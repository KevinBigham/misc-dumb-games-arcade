export type RoommateId = 'maya' | 'devon' | 'priya' | 'leo';

export type ScenarioId =
  | 'scenario-1-thermostat'
  | 'scenario-2-grocery-jar'
  | 'scenario-3-boiler-emergency';

export type PolicyId =
  | 'policy-1-equal-split'
  | 'policy-2-income-reserve'
  | 'policy-3-self-reported'
  | 'policy-4-metered-rebate';

export type WeekNumber = 1 | 2 | 3 | 4;

export const GAME_CONFIG = {
  GAME_ID: '06-roommate-republic',
  GAME_NUMBER: 6,
  TITLE: 'Roommate Republic',
  SUBTITLE: 'Incentive Prediction, Experiment & Policy Simulation Lab',
  ACCENT_COLOR: '#d97706',
  STORAGE_KEY: 'argon_game06_roommate_republic_v1',
  SCHEMA_VERSION: 1,
  DEFAULT_SEED: 202606,
  WEEKS_PER_RUN: 4 as const,
  SURPRISE_EXPENSE_WEEK: 3 as const,
  INITIAL_ROOMMATE_CASH: 120,
  LIQUIDITY_STRESS_THRESHOLD: 40,
  OVERDRAFT_THRESHOLD: 0,
  POLICY_2_RESERVE_RATE: 0.1, // 10% buffer contribution on weekly bill
  POLICY_4_WEEKLY_ADMIN_FEE: 16, // $16/week fixed metering & admin fee
  POLICY_4_CHORE_CREDIT_RATE: 15, // $15 per extra/shirked chore unit
  BASE_CHORES_PER_ROOMMATE_PER_WEEK: 2,
  TOTAL_WEEKLY_CHORES: 8,
} as const;

export const ROOMMATE_ORDER: readonly RoommateId[] = [
  'maya',
  'devon',
  'priya',
  'leo',
] as const;
