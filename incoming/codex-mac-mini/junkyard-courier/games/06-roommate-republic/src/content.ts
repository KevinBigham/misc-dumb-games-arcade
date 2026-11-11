import {
  GAME_CONFIG,
  PolicyId,
  RoommateId,
  ROOMMATE_ORDER,
  ScenarioId,
} from './config.ts';

export interface RoommateBehaviorParams {
  weeklyIncome: number; // $/week (120 .. 600)
  usageAppetite: number; // baseline consumption multiplier (0.50 .. 2.00)
  freeRideTemptation: number; // 0.00 .. 1.00 propensity to overconsume commons / underreport
  auditSensitivity: number; // 0.00 .. 1.00 responsiveness to metering, price signals & rebates
  fairnessThreshold: number; // 0.00 .. 1.00 tolerance before perceived unfairness erodes morale
  initialCash: number; // starting cash at Week 0 ($250 default)
}

export interface RoommateProfile {
  id: RoommateId;
  name: string;
  archetype: string;
  shortLabel: string;
  color: string;
  badgeText: string;
  bio: string;
  defaultParams: RoommateBehaviorParams;
}

export interface HouseholdAssumptions {
  roommates: Record<RoommateId, RoommateBehaviorParams>;
  reserveContributionRate: number; // default 0.10 (10%)
  weeklyMeteringAdminFee: number; // default $16/wk
  choreCreditDollarValue: number; // default $15/chore unit
}

export interface ScenarioDefinition {
  id: ScenarioId;
  number: number;
  title: string;
  subtitle: string;
  premise: string;
  utilityLabel: string;
  baseWeeklyBillDollars: number;
  initialReserveDollars: number;
  commonsElasticity: number; // how strongly Equal Split inflates total bill via freeRideTemptation
  surpriseExpenseTemplate: {
    title: string;
    category: 'HEATING_SPIKE' | 'PANTRY_SHORTFALL' | 'BOILER_REPAIR';
    baseAmountDollars: number;
    description: string;
  };
  defaultPolicyId: PolicyId;
  recommendedComparisonPolicyId: PolicyId;
  hypothesisPrompt: string;
}

export interface PolicyDefinition {
  id: PolicyId;
  number: number;
  shortTitle: string;
  title: string;
  tagline: string;
  mechanismSummary: string;
  tradeoffWarning: string;
  marginalPriceSignal: number; // 0.25 for equal split, 0.35 for income split, 0.65 for self-report, 1.0 for metered
  collectsReserveBuffer: boolean;
  allowsUnverifiedUnderreporting: boolean;
  chargesMeteringAdminFee: boolean;
  enablesChoreRebate: boolean;
}

export interface DebriefOption {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
}

export interface DebriefPrompt {
  id: string;
  number: number;
  category: 'LEDGER_EVIDENCE' | 'COUNTERFACTUAL_CAUSALITY' | 'MODEL_LIMITATION';
  question: string;
  contextHint: string;
  options: DebriefOption[];
}

export const ROOMMATE_PROFILES: Record<RoommateId, RoommateProfile> = {
  maya: {
    id: 'maya',
    name: 'Maya',
    archetype: 'Steady Cooperator — Mid Income, Low Free-Ride',
    shortLabel: 'Steady Cooperator',
    color: '#d97706',
    badgeText: 'Civic Planner',
    bio: 'Mid-income urban planner ($280/wk). Keeps steady utility habits, reports honestly on honor systems, and completes her 2 weekly kitchen chores reliably unless household trust collapses.',
    defaultParams: {
      weeklyIncome: 280,
      usageAppetite: 1.0,
      freeRideTemptation: 0.1,
      auditSensitivity: 0.75,
      fairnessThreshold: 0.7,
      initialCash: GAME_CONFIG.INITIAL_ROOMMATE_CASH,
    },
  },
  devon: {
    id: 'devon',
    name: 'Devon',
    archetype: 'Cash-Strapped Grad Student — Low Income, High Price Sensitivity',
    shortLabel: 'Grad Student',
    color: '#059669',
    badgeText: 'Tight Stipend',
    bio: 'Lives on a $145/wk teaching stipend. Uses minimal heat and pantry goods (0.75x appetite) and gladly picks up extra cleaning chores when Policy 4 pays a $15/chore rebate—but faces acute liquidity risk under Equal Split.',
    defaultParams: {
      weeklyIncome: 145,
      usageAppetite: 0.75,
      freeRideTemptation: 0.15,
      auditSensitivity: 0.9,
      fairnessThreshold: 0.55,
      initialCash: GAME_CONFIG.INITIAL_ROOMMATE_CASH,
    },
  },
  priya: {
    id: 'priya',
    name: 'Priya',
    archetype: 'Power-User Remote Worker — High Income, High Utility Usage',
    shortLabel: 'Power User',
    color: '#7c3aed',
    badgeText: '24/7 Home Office',
    bio: 'Senior software contractor ($445/wk) running dual GPU rigs, studio lighting, and a space heater (1.65x appetite). Under Equal Split she only pays 25 cents on the marginal dollar; under Metered Billing she trims excess draw.',
    defaultParams: {
      weeklyIncome: 445,
      usageAppetite: 1.65,
      freeRideTemptation: 0.35,
      auditSensitivity: 0.65,
      fairnessThreshold: 0.75,
      initialCash: GAME_CONFIG.INITIAL_ROOMMATE_CASH,
    },
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    archetype: 'Opportunistic Optimizer — Mid-High Income, Underreports When Unverified',
    shortLabel: 'Opportunist',
    color: '#e11d48',
    badgeText: 'Incentive Hacker',
    bio: 'Freelance growth analyst ($330/wk) who treats household rules strictly as an optimization game (0.85 free-ride temptation). Under Self-Reported Billing he understates his share, shifting a shortfall surcharge onto the house—until sub-meters verify usage.',
    defaultParams: {
      weeklyIncome: 330,
      usageAppetite: 1.25,
      freeRideTemptation: 0.85,
      auditSensitivity: 0.85,
      fairnessThreshold: 0.6,
      initialCash: GAME_CONFIG.INITIAL_ROOMMATE_CASH,
    },
  },
};

export const SCENARIOS: Record<ScenarioId, ScenarioDefinition> = {
  'scenario-1-thermostat': {
    id: 'scenario-1-thermostat',
    number: 1,
    title: 'Scenario 1: The Winter Thermostat Spike',
    subtitle: 'Unequal Usage + Equal-Split Friction',
    premise:
      'January cold snaps hit Apartment 4B. Priya works from home with a space heater while Devon wears two sweaters in a cold bedroom. In Week 3, a Polar Vortex spike plus a drafty window repair hits the winter heating bill.',
    utilityLabel: 'Winter Heating & Electric Grid',
    baseWeeklyBillDollars: 520,
    initialReserveDollars: 0,
    commonsElasticity: 0.24,
    surpriseExpenseTemplate: {
      title: 'Week 3 Polar Vortex Surge & Window Seal Emergency',
      category: 'HEATING_SPIKE',
      baseAmountDollars: 240,
      description:
        'Sub-zero wind chills trigger peak kilowatt pricing and an urgent weatherstripping service call in Week 3.',
    },
    defaultPolicyId: 'policy-1-equal-split',
    recommendedComparisonPolicyId: 'policy-2-income-reserve',
    hypothesisPrompt:
      'Compare how Policy 1 (Equal Split) pools Priya’s high heating draw onto low-income Devon versus how Policy 2 (Income-Proportional + Reserve) or Policy 4 (Metered Usage) redistributes cash flow on the exact same weather schedule.',
  },
  'scenario-2-grocery-jar': {
    id: 'scenario-2-grocery-jar',
    number: 2,
    title: 'Scenario 2: The Honor-System Grocery Jar',
    subtitle: 'Self-Reported Usage & Underreporting Incentives',
    premise:
      'The apartment stocks a shared kitchen pantry, espresso beans, and high-speed fiber bundle. Under the honor jar (Policy 3), each roommate logs their own weekly consumption—and any unpaid gap at the end of the week is split equally as an Unexplained Shortfall Surcharge.',
    utilityLabel: 'Shared Pantry, Espresso & Household Supplies',
    baseWeeklyBillDollars: 480,
    initialReserveDollars: 20,
    commonsElasticity: 0.22,
    surpriseExpenseTemplate: {
      title: 'Week 3 Bulk Pantry & Espresso Machine Descaling Bill',
      category: 'PANTRY_SHORTFALL',
      baseAmountDollars: 200,
      description:
        'A quarterly bulk delivery of cold-pressed olive oil, oat milk cases, and espresso grinder replacement burrs arrives in Week 3.',
    },
    defaultPolicyId: 'policy-3-self-reported',
    recommendedComparisonPolicyId: 'policy-4-metered-rebate',
    hypothesisPrompt:
      'Test whether Leo’s high Free-Ride Temptation (0.85) under Policy 3 (Self-Reported Billing) costs honest roommates more in Shortfall Surcharges than the fixed $16/wk sub-metering fee under Policy 4.',
  },
  'scenario-3-boiler-emergency': {
    id: 'scenario-3-boiler-emergency',
    number: 3,
    title: 'Scenario 3: The Week-3 Boiler Emergency',
    subtitle: 'Liquidity Shock vs. Shared Reserve Buffer',
    premise:
      'Everything looks manageable in Weeks 1 and 2, tempting the household to keep 100% of their cash in personal pockets with zero shared reserve buffer. Then in Week 3, the basement hot-water boiler valve ruptures, demanding immediate cash settlement.',
    utilityLabel: 'Water, Gas & Basement Boiler Maintenance',
    baseWeeklyBillDollars: 500,
    initialReserveDollars: 40,
    commonsElasticity: 0.2,
    surpriseExpenseTemplate: {
      title: 'Week 3 Burst Hot-Water Boiler Emergency Valve Replacement',
      category: 'BOILER_REPAIR',
      baseAmountDollars: 340,
      description:
        'An after-hours plumbing crew replaces a ruptured pressure valve in Week 3, requiring immediate settlement from the Household Reserve or direct roommate cash.',
    },
    defaultPolicyId: 'policy-1-equal-split',
    recommendedComparisonPolicyId: 'policy-2-income-reserve',
    hypothesisPrompt:
      'Compare an unbuffered policy (Policy 1 or Policy 3) against Policy 2 (Income-Proportional Split + 10% Shared Reserve) when the $340 boiler repair hits in Week 3.',
  },
};

export const SCENARIO_LIST: readonly ScenarioDefinition[] = [
  SCENARIOS['scenario-1-thermostat'],
  SCENARIOS['scenario-2-grocery-jar'],
  SCENARIOS['scenario-3-boiler-emergency'],
] as const;

export const POLICIES: Record<PolicyId, PolicyDefinition> = {
  'policy-1-equal-split': {
    id: 'policy-1-equal-split',
    number: 1,
    shortTitle: 'Policy 1: Equal Split (25%)',
    title: 'Policy 1: Equal Split (25% Each)',
    tagline: 'Zero admin overhead, but pools overconsumption and strains low-income roommates.',
    mechanismSummary:
      'Every weekly utility bill and Week 3 surprise shock is divided 25% / 25% / 25% / 25% regardless of income or actual usage. No shared reserve is collected and no metering fee is charged.',
    tradeoffWarning:
      'Because each roommate only pays $0.25 per $1.00 of marginal consumption, high-appetite and high-temptation agents inflate total consumption ("tragedy of the commons"), while low-income Devon bears a regressive cash burden.',
    marginalPriceSignal: 0.25,
    collectsReserveBuffer: false,
    allowsUnverifiedUnderreporting: false,
    chargesMeteringAdminFee: false,
    enablesChoreRebate: false,
  },
  'policy-2-income-reserve': {
    id: 'policy-2-income-reserve',
    number: 2,
    shortTitle: 'Policy 2: Income Split + 10% Reserve',
    title: 'Policy 2: Income-Proportional Split + Shared Reserve (10% Buffer)',
    tagline: 'Protects low-income cash flow and buffers Week 3 shocks, at the cost of locking up cash.',
    mechanismSummary:
      'Weekly bills are split in proportion to weekly income (Devon ~13.8%, Maya ~23.3%, Leo ~27.1%, Priya ~35.8%). Each week, roommates also contribute an extra 10% buffer into the Shared Household Reserve, which automatically absorbs the Week 3 Surprise Expense first.',
    tradeoffWarning:
      'Reduces discretionary cash in Weeks 1–2 by locking funds into the Shared Reserve, and higher-income Priya pays a larger share even if she moderates usage.',
    marginalPriceSignal: 0.35,
    collectsReserveBuffer: true,
    allowsUnverifiedUnderreporting: false,
    chargesMeteringAdminFee: false,
    enablesChoreRebate: false,
  },
  'policy-3-self-reported': {
    id: 'policy-3-self-reported',
    number: 3,
    shortTitle: 'Policy 3: Self-Reported Billing',
    title: 'Policy 3: Self-Reported Usage Billing (Honor Jar)',
    tagline: 'Rewards frugal honest users, but invites opportunists to underreport usage.',
    mechanismSummary:
      'Roommates pay in proportion to their self-reported usage log. However, each roommate discounts their reported usage by (freeRideTemptation * 52%). The resulting unpaid gap between the vendor bill and self-reported payments is split equally (25% each) as an "Unexplained Shortfall Surcharge".',
    tradeoffWarning:
      'When freeRideTemptation is high (e.g. Leo at 0.85), underreporting shifts a heavy Shortfall Surcharge onto honest roommates and rapidly erodes household trust.',
    marginalPriceSignal: 0.65,
    collectsReserveBuffer: false,
    allowsUnverifiedUnderreporting: true,
    chargesMeteringAdminFee: false,
    enablesChoreRebate: false,
  },
  'policy-4-metered-rebate': {
    id: 'policy-4-metered-rebate',
    number: 4,
    shortTitle: 'Policy 4: Metered + Chore Rebate',
    title: 'Policy 4: Metered Usage + Chore-Credit Rebate',
    tagline: 'Aligns marginal usage and rewards extra chores, but costs a fixed $16/wk metering fee.',
    mechanismSummary:
      'Smart sub-meters verify 100% of each roommate’s true consumption (eliminating underreporting and curbing excess draw via auditSensitivity), plus a $16/week fixed metering/admin fee paid to the external metering vendor. Roommates who do extra chores earn a $15/chore rebate funded by a $15/chore surcharge on shirkers.',
    tradeoffWarning:
      'Extracts $16/week ($64 over 4 weeks) in deadweight administrative overhead paid to an external vendor, and does not automatically build a Shared Reserve buffer for Week 3 shocks.',
    marginalPriceSignal: 1.0,
    collectsReserveBuffer: false,
    allowsUnverifiedUnderreporting: false,
    chargesMeteringAdminFee: true,
    enablesChoreRebate: true,
  },
};

export const POLICY_LIST: readonly PolicyDefinition[] = [
  POLICIES['policy-1-equal-split'],
  POLICIES['policy-2-income-reserve'],
  POLICIES['policy-3-self-reported'],
  POLICIES['policy-4-metered-rebate'],
] as const;

export function createDefaultAssumptions(): HouseholdAssumptions {
  const roommates = {} as Record<RoommateId, RoommateBehaviorParams>;
  for (const id of ROOMMATE_ORDER) {
    roommates[id] = { ...ROOMMATE_PROFILES[id].defaultParams };
  }
  return {
    roommates,
    reserveContributionRate: GAME_CONFIG.POLICY_2_RESERVE_RATE,
    weeklyMeteringAdminFee: GAME_CONFIG.POLICY_4_WEEKLY_ADMIN_FEE,
    choreCreditDollarValue: GAME_CONFIG.POLICY_4_CHORE_CREDIT_RATE,
  };
}

export function cloneAssumptions(source: HouseholdAssumptions): HouseholdAssumptions {
  const roommates = {} as Record<RoommateId, RoommateBehaviorParams>;
  for (const id of ROOMMATE_ORDER) {
    roommates[id] = { ...source.roommates[id] };
  }
  return {
    roommates,
    reserveContributionRate: source.reserveContributionRate,
    weeklyMeteringAdminFee: source.weeklyMeteringAdminFee,
    choreCreditDollarValue: source.choreCreditDollarValue,
  };
}

export const DEBRIEF_PROMPTS: readonly DebriefPrompt[] = [
  {
    id: 'debrief-1-commons-vs-reserve',
    number: 1,
    category: 'LEDGER_EVIDENCE',
    question:
      'Ledger Audit #1: When comparing Policy 1 (Equal Split) against Policy 2 (Income-Proportional + 10% Reserve) on the exact same Event Schedule, why does Devon’s ending cash improve under Policy 2 despite the extra 10% reserve contributions?',
    contextHint:
      'Inspect Devon’s UTILITY_BILL_CONTRIBUTION and SURPRISE_SHOCK_PAYMENT ledger entries across Weeks 1–4.',
    options: [
      {
        id: 'opt-1a',
        label:
          'Devon’s income share (~13.8% of $1,200 total household income) is much lower than 25%, and the Shared Reserve absorbs the Week 3 surprise shock before out-of-pocket surcharges hit.',
        isCorrect: true,
        explanation:
          'Correct! Under the model’s income-proportional equation, Devon ($165/wk out of $1,200/wk) pays ~13.8% of bills + reserve buffer rather than a flat 25%, and the accumulated Shared Reserve absorbs the Week 3 Surprise Expense.',
      },
      {
        id: 'opt-1b',
        label:
          'Policy 2 cancels the Week 3 Surprise Expense in the external event schedule so the vendor never bills the household.',
        isCorrect: false,
        explanation:
          'Incorrect. The External Event Schedule is frozen and identical across policy runs; the Week 3 Surprise Expense still occurs and is paid to the external vendor, but the Household Reserve absorbs it first.',
      },
      {
        id: 'opt-1c',
        label:
          'Policy 2 increases Devon’s weekly stipend from $165/wk to $300/wk in Weeks 3 and 4.',
        isCorrect: false,
        explanation:
          'Incorrect. Weekly employer inflows (`INCOME_INFLOW`) remain fixed at $165/wk unless you manually edit Devon’s income slider in the Assumptions Panel.',
      },
    ],
  },
  {
    id: 'debrief-2-self-report-vs-metering',
    number: 2,
    category: 'COUNTERFACTUAL_CAUSALITY',
    question:
      'Ledger Audit #2: Under Policy 3 (Self-Reported Usage Billing), which specific ledger mechanism transfers cost from an opportunistic agent (Leo) onto honest roommates, and what happens to that transfer under Policy 4 (Metered Usage)?',
    contextHint:
      'Filter the Transaction Ledger by Week 1–4 for `SHORTFALL_SURCHARGE` vs `ADMIN_METERING_FEE`.',
    options: [
      {
        id: 'opt-2a',
        label:
          'Leo’s `freeRideTemptation` reduces his self-reported payment, creating an uncollected vendor gap that triggers `SHORTFALL_SURCHARGE` entries split 25% each; Policy 4 eliminates `SHORTFALL_SURCHARGE` but adds `$16/wk` in `ADMIN_METERING_FEE`.',
        isCorrect: true,
        explanation:
          'Spot on! In our simulation equations, Policy 3 lets `freeRideTemptation` discount reported usage, generating explicit `SHORTFALL_SURCHARGE` ledger rows for all 4 roommates. Policy 4 replaces unverified reporting with exact sub-metering at a fixed `$16/wk` (`$64` total) external fee.',
      },
      {
        id: 'opt-2b',
        label:
          'Policy 3 charges a $50/week fine only to Maya, while Policy 4 refunds all utility bills to $0.',
        isCorrect: false,
        explanation:
          'Incorrect. The shortfall is caused by the gap between total vendor billing and self-reported payments, which is split across all four roommates as `SHORTFALL_SURCHARGE`.',
      },
      {
        id: 'opt-2c',
        label:
          'Policy 4 generates fresh random weather numbers that happen to be warmer than Policy 3.',
        isCorrect: false,
        explanation:
          'Incorrect! Both policies read the exact same frozen `ExternalEventSchedule`; the consumption reduction comes strictly from `marginalPriceSignal = 1.0` interacting with each roommate’s `auditSensitivity`.',
      },
    ],
  },
  {
    id: 'debrief-3-model-limitations',
    number: 3,
    category: 'MODEL_LIMITATION',
    question:
      'Epistemic Humility #3: Which statement best describes an important limitation of this simulation’s mathematical equations compared to a real-world apartment?',
    contextHint:
      'Consider what the 5 numerical sliders per roommate capture—and what real social norms or non-monetary dynamics they leave out.',
    options: [
      {
        id: 'opt-3a',
        label:
          'The simulation assumes deterministic linear/multiplicative responses to price signals and fixed `freeRideTemptation` sliders, omitting real-world verbal negotiation, friendship bonds, intrinsic guilt, or social ostracism outside the ledger.',
        isCorrect: true,
        explanation:
          'Exactly right. Our agent equations isolate specific economic incentives (marginal cost sharing, reserve buffering, underreporting gaps, and admin overhead), but real roommates also negotiate face-to-face, care about friendship, and adapt norms in ways a 5-parameter equation cannot claim as universal law.',
      },
      {
        id: 'opt-3b',
        label:
          'The simulation equations prove as a universal scientific law that every real-world freelancer named Leo will always underreport 44% of their grocery consumption.',
        isCorrect: false,
        explanation:
          'Never! A stylized incentive model illustrates conditional *if-then* consequences of explicit assumptions (`freeRideTemptation = 0.85`), not universal truths about real people.',
      },
      {
        id: 'opt-3c',
        label:
          'Money is not conserved in the simulation because utilities disappear without being recorded.',
        isCorrect: false,
        explanation:
          'Incorrect. Money is strictly conserved to the exact cent in the double-entry ledger (`Initial Cash + Total Income - Total Expenses === Ending Roommate Cash + Ending Household Reserve`). The limitation is behavioral simplification, not accounting drift.',
      },
    ],
  },
] as const;
