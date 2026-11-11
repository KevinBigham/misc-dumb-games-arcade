import {
  GAME_CONFIG,
  PolicyId,
  RoommateId,
  ROOMMATE_ORDER,
  ScenarioId,
  WeekNumber,
} from './config.ts';
import {
  cloneAssumptions,
  HouseholdAssumptions,
  POLICIES,
  PolicyDefinition,
  ROOMMATE_PROFILES,
  SCENARIOS,
  ScenarioDefinition,
} from './content.ts';
import { hashString, SeededRng } from './rng.ts';

export interface SurpriseExpenseEvent {
  id: string;
  week: 3;
  title: string;
  category: 'HEATING_SPIKE' | 'PANTRY_SHORTFALL' | 'BOILER_REPAIR';
  amountDollars: number;
  description: string;
}

export interface WeeklyExternalEvent {
  week: WeekNumber;
  weatherOrDemandIndex: number; // e.g., 0.94 .. 1.15
  ambientNote: string;
  roommateExogenousNoise: Record<RoommateId, number>; // -0.04 .. +0.04 frozen per roommate
  surpriseExpense: SurpriseExpenseEvent | null;
}

export interface ExternalEventSchedule {
  scheduleId: string;
  scenarioId: ScenarioId;
  seed: number;
  scheduleSignature: string;
  weeks: readonly WeeklyExternalEvent[];
}

export type LedgerAccount =
  | 'EXTERNAL_EMPLOYER'
  | 'EXTERNAL_UTILITY_VENDOR'
  | 'EXTERNAL_REPAIR_VENDOR'
  | 'EXTERNAL_ADMIN_VENDOR'
  | 'HOUSEHOLD_POT'
  | 'HOUSEHOLD_RESERVE'
  | `ROOMMATE:${RoommateId}`;

export type LedgerTransactionType =
  | 'INCOME_INFLOW'
  | 'UTILITY_BILL_CONTRIBUTION'
  | 'SHORTFALL_SURCHARGE'
  | 'UTILITY_VENDOR_PAYMENT'
  | 'RESERVE_CONTRIBUTION'
  | 'RESERVE_WITHDRAWAL'
  | 'SURPRISE_SHOCK_CONTRIBUTION'
  | 'SURPRISE_VENDOR_PAYMENT'
  | 'ADMIN_METERING_FEE'
  | 'CHORE_REBATE_TRANSFER';

export type LedgerFlowCategory =
  | 'EXTERNAL_INFLOW'
  | 'EXTERNAL_OUTFLOW'
  | 'INTERNAL_TRANSFER';

export interface LedgerTransaction {
  id: string;
  week: WeekNumber;
  type: LedgerTransactionType;
  flowCategory: LedgerFlowCategory;
  fromAccount: LedgerAccount;
  toAccount: LedgerAccount;
  amount: number; // exact dollars to 2 decimal places
  amountCents: number; // exact integer cents
  roommateId?: RoommateId;
  counterpartyRoommateId?: RoommateId;
  description: string;
  assumptionDrivers: string[];
}

export interface ChoreLedgerEntry {
  id: string;
  week: WeekNumber;
  roommateId: RoommateId;
  targetChores: number;
  completedChores: number;
  choreDelta: number; // +1 extra, 0 on target, -1 shirked
  rebateOrPenaltyDollars: number; // +$15 earned, -$15 paid, or $0 under unrebated policies
  trustDelta: number;
  note: string;
}

export interface WeeklyRoommateState {
  roommateId: RoommateId;
  week: WeekNumber;
  startingCash: number;
  incomeReceived: number;
  trueUtilityConsumption: number;
  reportedUtilityConsumption: number;
  underreportedGap: number;
  commonsOverconsumptionAdded: number;
  meteredConservationSaved: number;
  utilityBillPaid: number;
  shortfallSurchargePaid: number;
  reserveContributionPaid: number;
  surpriseShockPaid: number;
  adminFeePaid: number;
  choreRebateNet: number; // positive if received rebate, negative if paid surcharge
  totalOutOfPocketPaid: number;
  endingCash: number;
  inLiquidityStress: boolean;
  inOverdraft: boolean;
  endingTrust: number; // 0 .. 100
}

export interface WeeklySnapshot {
  week: WeekNumber;
  weatherOrDemandIndex: number;
  ambientNote: string;
  totalUtilityBill: number;
  totalUnderreportedGap: number;
  surpriseExpenseAmount: number;
  reserveUsedForSurprise: number;
  endingHouseholdReserve: number;
  endingTotalRoommateCash: number;
  averageHouseholdTrust: number;
  roommateStates: Record<RoommateId, WeeklyRoommateState>;
}

export interface RoommateRunSummary {
  roommateId: RoommateId;
  name: string;
  initialCash: number;
  totalIncome: number;
  totalTrueUtilityConsumption: number;
  totalReportedUtilityConsumption: number;
  totalUnderreportedGap: number;
  totalCommonsOverconsumption: number;
  totalMeteredConservationSaved: number;
  totalUtilityBillPaid: number;
  totalShortfallSurchargePaid: number;
  totalReserveContributionPaid: number;
  totalSurpriseShockPaid: number;
  totalAdminFeePaid: number;
  totalChoreRebateNet: number;
  totalOutOfPocketPaid: number;
  behavioralShiftMagnitude: number;
  primaryBehavioralDriver: string;
  endingCash: number;
  minWeeklyCash: number;
  experiencedLiquidityStress: boolean;
  experiencedOverdraft: boolean;
  endingTrust: number;
  totalChoresCompleted: number;
}

export interface MoneyConservationCheck {
  initialRoommateCash: number;
  initialHouseholdReserve: number;
  initialCash: number; // initialRoommateCash + initialHouseholdReserve
  totalIncome: number; // sum of EXTERNAL_INFLOW
  totalExpenses: number; // sum of EXTERNAL_OUTFLOW
  totalInflows: number; // initialCash + totalIncome
  totalOutflows: number; // totalExpenses
  endingRoommateCash: number;
  endingHouseholdReserve: number;
  finalRoommateCash: number; // alias for endingRoommateCash
  finalHouseholdReserve: number; // alias for endingHouseholdReserve
  expectedEndingTotal: number; // totalInflows - totalOutflows
  actualEndingTotal: number; // endingRoommateCash + endingHouseholdReserve
  discrepancyCents: number;
  discrepancyDollars: number;
  isConserved: boolean;
}

export interface LedgerExplanation {
  id: string;
  category:
    | 'BILLING_SPLIT'
    | 'BEHAVIORAL_INCENTIVE'
    | 'SURPRISE_SHOCK'
    | 'CHORE_EQUITY'
    | 'MODEL_LIMITATION';
  headline: string;
  statement: string;
  transactionIds: string[];
  assumptionRefs: string[];
  modelLimitationNote: string;
}

export interface HouseholdRunResult {
  scenarioId: ScenarioId;
  policyId: PolicyId;
  seed: number;
  scheduleSignature: string;
  eventSchedule: ExternalEventSchedule;
  assumptions: HouseholdAssumptions;
  transactions: LedgerTransaction[];
  choreLedger: ChoreLedgerEntry[];
  weeklySnapshots: WeeklySnapshot[];
  roommateSummaries: Record<RoommateId, RoommateRunSummary>;
  conservation: MoneyConservationCheck;
  explanations: LedgerExplanation[];
  highestNetPayerId: RoommateId;
  largestBehavioralShiftId: RoommateId;
  anyLiquidityStress: boolean;
  anyOverdraft: boolean;
  endingAverageTrust: number;
}

export interface PlayerPrediction {
  highestNetPayer: RoommateId;
  week3ShockOutcome: 'all_solvent_buffered' | 'liquidity_crunch';
  behavioralShift: RoommateId;
}

export interface PredictionGradeItem {
  field: keyof PlayerPrediction;
  title: string;
  predictedLabel: string;
  actualLabel: string;
  isCorrect: boolean;
  explanation: string;
  evidenceTransactionIds: string[];
  assumptionNote: string;
}

export interface PredictionGradeResult {
  totalCorrect: number;
  maxScore: 3;
  summaryHeadline: string;
  items: PredictionGradeItem[];
}

export interface PolicyComparisonDelta {
  roommateId: RoommateId;
  name: string;
  endingCashA: number;
  endingCashB: number;
  cashDeltaBMinusA: number;
  outOfPocketA: number;
  outOfPocketB: number;
  outOfPocketDeltaBMinusA: number;
  trueConsumptionA: number;
  trueConsumptionB: number;
  consumptionDeltaBMinusA: number;
  underreportedA: number;
  underreportedB: number;
  trustA: number;
  trustB: number;
}

export interface PolicyComparisonResult {
  scenarioId: ScenarioId;
  sameScheduleVerified: boolean;
  scheduleSignature: string;
  runA: HouseholdRunResult;
  runB: HouseholdRunResult;
  totalUtilityBillDeltaBMinusA: number;
  endingReserveDeltaBMinusA: number;
  totalShortfallDeltaBMinusA: number;
  totalAdminFeeDeltaBMinusA: number;
  roommateDeltas: Record<RoommateId, PolicyComparisonDelta>;
  comparisonInsights: {
    id: string;
    title: string;
    body: string;
    runATransactionIds: string[];
    runBTransactionIds: string[];
    assumptionAttribution: string;
  }[];
}

function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

function toDollars(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Splits `totalCents` across the 4 roommates using the Largest Remainder Method
 * so that the sum of allocated integer cents ALWAYS equals `totalCents` with 0 drift.
 */
export function allocateCentsByWeights(
  totalCents: number,
  weights: Record<RoommateId, number>,
): Record<RoommateId, number> {
  const safeTotal = Math.max(0, Math.round(totalCents));
  let weightSum = 0;
  for (const id of ROOMMATE_ORDER) {
    weightSum += Math.max(0, weights[id]);
  }

  const normalizedWeights: Record<RoommateId, number> = {
    maya: weightSum > 0 ? Math.max(0, weights.maya) / weightSum : 0.25,
    devon: weightSum > 0 ? Math.max(0, weights.devon) / weightSum : 0.25,
    priya: weightSum > 0 ? Math.max(0, weights.priya) / weightSum : 0.25,
    leo: weightSum > 0 ? Math.max(0, weights.leo) / weightSum : 0.25,
  };

  const floored = {} as Record<RoommateId, number>;
  const remainders: { id: RoommateId; rem: number; idx: number }[] = [];
  let flooredSum = 0;

  ROOMMATE_ORDER.forEach((id, idx) => {
    const exact = safeTotal * normalizedWeights[id];
    const fl = Math.floor(exact);
    floored[id] = fl;
    flooredSum += fl;
    remainders.push({ id, rem: exact - fl, idx });
  });

  const leftover = safeTotal - flooredSum;
  remainders.sort((a, b) => (b.rem !== a.rem ? b.rem - a.rem : a.idx - b.idx));

  for (let i = 0; i < leftover; i++) {
    floored[remainders[i].id] += 1;
  }

  return floored;
}

const AMBIENT_WEEK_NOTES: Record<ScenarioId, readonly [string, string, string, string]> = {
  'scenario-1-thermostat': [
    'Week 1: Crisp early-January frost; radiator runs steady overnight.',
    'Week 2: Freezing sleet keeps everyone indoors; workstation & heater draw rises.',
    'Week 3: POLAR VORTEX ALERT — Sub-zero gusts + emergency window seal repair!',
    'Week 4: Late-January thaw moderates baseline heating demand.',
  ],
  'scenario-2-grocery-jar': [
    'Week 1: Fresh bulk pantry restock of espresso beans, oat milk, and cooking oils.',
    'Week 2: Busy deadline week; late-night kitchen snacking and coffee pulls accelerate.',
    'Week 3: QUARTERLY RESTOCK SHOCK — Specialty coffee burrs & pantry invoice arrives!',
    'Week 4: End-of-month pantry audit as roommates finish remaining staples.',
  ],
  'scenario-3-boiler-emergency': [
    'Week 1: Routine winter water & gas usage; basement boiler hums quietly.',
    'Week 2: Cold rain increases hot shower draw; pressure gauge ticks slightly upward.',
    'Week 3: BOILER VALVE RUPTURE — Emergency after-hours plumbing crew requires cash!',
    'Week 4: New boiler valve operates efficiently as household settles final month balances.',
  ],
};

/**
 * Generates and freezes the 4-week external shock & surprise expense schedule ONCE
 * for a given `(scenarioId, seed)`. Policy simulations and counterfactual replays
 * read this frozen schedule directly without calling any RNG.
 */
export function generateExternalEventSchedule(
  scenarioId: ScenarioId | ScenarioDefinition,
  seed: number = GAME_CONFIG.DEFAULT_SEED,
): ExternalEventSchedule {
  const scenario =
    typeof scenarioId === 'string' ? SCENARIOS[scenarioId] : scenarioId;
  const normalizedSeed = Math.floor(seed) >>> 0;
  const rng = new SeededRng(
    (normalizedSeed ^ hashString(`schedule:${scenario.id}`)) >>> 0,
  );

  const weeks: WeeklyExternalEvent[] = [];
  const weekNumbers: readonly WeekNumber[] = [1, 2, 3, 4];

  for (const w of weekNumbers) {
    // Deterministic weather/market demand multiplier around 0.96 .. 1.12
    const baseWave = w === 3 ? 1.08 : w === 2 ? 1.03 : w === 1 ? 0.99 : 0.96;
    const jitter = (rng.nextFloat() - 0.5) * 0.06;
    const weatherOrDemandIndex = Number((baseWave + jitter).toFixed(3));

    const roommateExogenousNoise = {} as Record<RoommateId, number>;
    for (const rId of ROOMMATE_ORDER) {
      const rJitter = (rng.nextFloat() - 0.5) * 0.06; // -0.03 .. +0.03
      roommateExogenousNoise[rId] = Number(rJitter.toFixed(3));
    }

    let surpriseExpense: SurpriseExpenseEvent | null = null;
    if (w === GAME_CONFIG.SURPRISE_EXPENSE_WEEK) {
      // Deterministic offset in multiples of $4 around template baseAmountDollars
      const stepOffset = rng.nextInt(-2, 3) * 4;
      const amountDollars =
        scenario.surpriseExpenseTemplate.baseAmountDollars + stepOffset;
      surpriseExpense = {
        id: `SHOCK-W3-${scenario.id.toUpperCase()}`,
        week: 3,
        title: scenario.surpriseExpenseTemplate.title,
        category: scenario.surpriseExpenseTemplate.category,
        amountDollars,
        description: scenario.surpriseExpenseTemplate.description,
      };
    }

    weeks.push({
      week: w,
      weatherOrDemandIndex,
      ambientNote: AMBIENT_WEEK_NOTES[scenario.id][w - 1],
      roommateExogenousNoise,
      surpriseExpense,
    });
  }

  const signaturePayload = JSON.stringify({
    scenarioId: scenario.id,
    seed: normalizedSeed,
    weeks,
  });
  const scheduleSignature = `SIG-${scenario.id}-${normalizedSeed}-${hashString(signaturePayload).toString(16)}`;

  return Object.freeze({
    scheduleId: `sched-${scenario.id}-${normalizedSeed}`,
    scenarioId: scenario.id,
    seed: normalizedSeed,
    scheduleSignature,
    weeks: Object.freeze(weeks),
  });
}

/**
 * Pure deterministic simulation of a 4-week household run.
 * Reads ONLY `(scenario, policy, assumptions, eventSchedule)` with zero RNG calls.
 * Enforces strict double-entry money conservation to the exact cent.
 */
export function simulateHouseholdRun(
  scenarioInput: ScenarioId | ScenarioDefinition,
  policyInput: PolicyId | PolicyDefinition,
  assumptionsInput: HouseholdAssumptions,
  eventSchedule: ExternalEventSchedule,
): HouseholdRunResult {
  const scenario =
    typeof scenarioInput === 'string' ? SCENARIOS[scenarioInput] : scenarioInput;
  const policy =
    typeof policyInput === 'string' ? POLICIES[policyInput] : policyInput;
  const assumptions = cloneAssumptions(assumptionsInput);

  const transactions: LedgerTransaction[] = [];
  const choreLedger: ChoreLedgerEntry[] = [];
  const weeklySnapshots: WeeklySnapshot[] = [];

  // Track exact integer cents per roommate and household reserve
  const cashCents: Record<RoommateId, number> = {
    maya: toCents(assumptions.roommates.maya.initialCash),
    devon: toCents(assumptions.roommates.devon.initialCash),
    priya: toCents(assumptions.roommates.priya.initialCash),
    leo: toCents(assumptions.roommates.leo.initialCash),
  };

  const initialRoommateCashCents =
    cashCents.maya + cashCents.devon + cashCents.priya + cashCents.leo;
  let reserveCents = toCents(scenario.initialReserveDollars);
  const initialHouseholdReserveCents = reserveCents;

  const trustScore: Record<RoommateId, number> = {
    maya: 82,
    devon: 80,
    priya: 82,
    leo: 78,
  };

  let txCounter = 0;
  const nextTxId = (week: WeekNumber): string => {
    txCounter += 1;
    return `TX-W${week}-${String(txCounter).padStart(3, '0')}`;
  };

  // Cumulative trackers for RoommateRunSummary
  const summaryAccum = {} as Record<
    RoommateId,
    {
      totalIncomeCents: number;
      totalTrueUtilityCents: number;
      totalReportedUtilityCents: number;
      totalUnderreportedCents: number;
      totalCommonsAddedCents: number;
      totalMeteredSavedCents: number;
      totalUtilityBillPaidCents: number;
      totalShortfallPaidCents: number;
      totalReservePaidCents: number;
      totalSurprisePaidCents: number;
      totalAdminFeePaidCents: number;
      totalChoreRebateNetCents: number;
      minWeeklyCashCents: number;
      experiencedLiquidityStress: boolean;
      experiencedOverdraft: boolean;
      totalChoresCompleted: number;
    }
  >;

  for (const id of ROOMMATE_ORDER) {
    summaryAccum[id] = {
      totalIncomeCents: 0,
      totalTrueUtilityCents: 0,
      totalReportedUtilityCents: 0,
      totalUnderreportedCents: 0,
      totalCommonsAddedCents: 0,
      totalMeteredSavedCents: 0,
      totalUtilityBillPaidCents: 0,
      totalShortfallPaidCents: 0,
      totalReservePaidCents: 0,
      totalSurprisePaidCents: 0,
      totalAdminFeePaidCents: 0,
      totalChoreRebateNetCents: 0,
      minWeeklyCashCents: cashCents[id],
      experiencedLiquidityStress:
        toDollars(cashCents[id]) < GAME_CONFIG.LIQUIDITY_STRESS_THRESHOLD,
      experiencedOverdraft:
        toDollars(cashCents[id]) < GAME_CONFIG.OVERDRAFT_THRESHOLD,
      totalChoresCompleted: 0,
    };
  }

  const equalWeights: Record<RoommateId, number> = {
    maya: 1,
    devon: 1,
    priya: 1,
    leo: 1,
  };

  const incomeWeights: Record<RoommateId, number> = {
    maya: Math.max(1, assumptions.roommates.maya.weeklyIncome),
    devon: Math.max(1, assumptions.roommates.devon.weeklyIncome),
    priya: Math.max(1, assumptions.roommates.priya.weeklyIncome),
    leo: Math.max(1, assumptions.roommates.leo.weeklyIncome),
  };

  for (const weekEvent of eventSchedule.weeks) {
    const w = weekEvent.week;
    const startingCashCents: Record<RoommateId, number> = { ...cashCents };

    // 1. Weekly Income Inflows (EXTERNAL_EMPLOYER -> ROOMMATE:<id>)
    const weeklyIncomeCents: Record<RoommateId, number> = {
      maya: 0,
      devon: 0,
      priya: 0,
      leo: 0,
    };
    for (const id of ROOMMATE_ORDER) {
      const incCents = toCents(assumptions.roommates[id].weeklyIncome);
      weeklyIncomeCents[id] = incCents;
      cashCents[id] += incCents;
      summaryAccum[id].totalIncomeCents += incCents;

      transactions.push({
        id: nextTxId(w),
        week: w,
        type: 'INCOME_INFLOW',
        flowCategory: 'EXTERNAL_INFLOW',
        fromAccount: 'EXTERNAL_EMPLOYER',
        toAccount: `ROOMMATE:${id}`,
        amount: toDollars(incCents),
        amountCents: incCents,
        roommateId: id,
        description: `${ROOMMATE_PROFILES[id].name} receives Week ${w} income ($${toDollars(incCents).toFixed(2)}).`,
        assumptionDrivers: [
          `${id}.weeklyIncome=$${assumptions.roommates[id].weeklyIncome}/wk`,
        ],
      });
    }

    // 2. Compute each roommate's True Utility Consumption in Week w
    const basePerPersonDollars =
      0.25 * scenario.baseWeeklyBillDollars * weekEvent.weatherOrDemandIndex;

    const trueUtilityCents: Record<RoommateId, number> = {
      maya: 0,
      devon: 0,
      priya: 0,
      leo: 0,
    };
    const commonsAddedCents: Record<RoommateId, number> = {
      maya: 0,
      devon: 0,
      priya: 0,
      leo: 0,
    };
    const meteredSavedCents: Record<RoommateId, number> = {
      maya: 0,
      devon: 0,
      priya: 0,
      leo: 0,
    };

    for (const id of ROOMMATE_ORDER) {
      const params = assumptions.roommates[id];
      const exoNoise = weekEvent.roommateExogenousNoise[id] ?? 0;
      const neutralFactor = Math.max(0.35, params.usageAppetite + exoNoise);
      const neutralDollars = basePerPersonDollars * neutralFactor;

      // Commons overconsumption when marginalPriceSignal < 1.0
      const unpricedFraction = Math.max(0, 1 - policy.marginalPriceSignal);
      const commonsInflationMultiplier =
        unpricedFraction *
        scenario.commonsElasticity *
        (0.55 * params.freeRideTemptation +
          0.45 * Math.max(0, params.usageAppetite - 0.85)) *
        2.1;
      const commonsExtraDollars = neutralDollars * commonsInflationMultiplier;

      // Metered conservation savings when marginalPriceSignal === 1.0 (Policy 4)
      const meteredConservationMultiplier =
        policy.chargesMeteringAdminFee || policy.marginalPriceSignal >= 0.95
          ? 0.16 * params.auditSensitivity
          : 0;
      const meteredSavedDollars = neutralDollars * meteredConservationMultiplier;

      const actualDollars = Math.max(
        20,
        neutralDollars + commonsExtraDollars - meteredSavedDollars,
      );

      trueUtilityCents[id] = toCents(actualDollars);
      commonsAddedCents[id] = toCents(commonsExtraDollars);
      meteredSavedCents[id] = toCents(meteredSavedDollars);

      summaryAccum[id].totalTrueUtilityCents += trueUtilityCents[id];
      summaryAccum[id].totalCommonsAddedCents += commonsAddedCents[id];
      summaryAccum[id].totalMeteredSavedCents += meteredSavedCents[id];
    }

    const totalUtilityBillCents =
      trueUtilityCents.maya +
      trueUtilityCents.devon +
      trueUtilityCents.priya +
      trueUtilityCents.leo;

    // 3. Determine Utility Billing Split & Shortfall Surcharges under active Policy
    const utilityBillPaidCents: Record<RoommateId, number> = {
      maya: 0,
      devon: 0,
      priya: 0,
      leo: 0,
    };
    const reportedUtilityCents: Record<RoommateId, number> = {
      maya: trueUtilityCents.maya,
      devon: trueUtilityCents.devon,
      priya: trueUtilityCents.priya,
      leo: trueUtilityCents.leo,
    };
    const underreportedGapCents: Record<RoommateId, number> = {
      maya: 0,
      devon: 0,
      priya: 0,
      leo: 0,
    };
    const shortfallSurchargeCents: Record<RoommateId, number> = {
      maya: 0,
      devon: 0,
      priya: 0,
      leo: 0,
    };

    if (policy.id === 'policy-1-equal-split') {
      const equalShares = allocateCentsByWeights(
        totalUtilityBillCents,
        equalWeights,
      );
      for (const id of ROOMMATE_ORDER) {
        utilityBillPaidCents[id] = equalShares[id];
        cashCents[id] -= equalShares[id];
        summaryAccum[id].totalUtilityBillPaidCents += equalShares[id];
        summaryAccum[id].totalReportedUtilityCents += reportedUtilityCents[id];

        transactions.push({
          id: nextTxId(w),
          week: w,
          type: 'UTILITY_BILL_CONTRIBUTION',
          flowCategory: 'INTERNAL_TRANSFER',
          fromAccount: `ROOMMATE:${id}`,
          toAccount: 'HOUSEHOLD_POT',
          amount: toDollars(equalShares[id]),
          amountCents: equalShares[id],
          roommateId: id,
          description: `${ROOMMATE_PROFILES[id].name} pays 25% Equal Split of Week ${w} utility bill ($${toDollars(equalShares[id]).toFixed(2)}; true usage was $${toDollars(trueUtilityCents[id]).toFixed(2)}).`,
          assumptionDrivers: [
            `policy=Equal Split (25% share)`,
            `${id}.usageAppetite=${assumptions.roommates[id].usageAppetite.toFixed(2)}`,
            `marginalPriceSignal=${policy.marginalPriceSignal}`,
          ],
        });
      }
    } else if (policy.id === 'policy-2-income-reserve') {
      const incomeShares = allocateCentsByWeights(
        totalUtilityBillCents,
        incomeWeights,
      );
      const totalIncomeSum =
        incomeWeights.maya +
        incomeWeights.devon +
        incomeWeights.priya +
        incomeWeights.leo;

      for (const id of ROOMMATE_ORDER) {
        const sharePct = ((incomeWeights[id] / totalIncomeSum) * 100).toFixed(1);
        utilityBillPaidCents[id] = incomeShares[id];
        cashCents[id] -= incomeShares[id];
        summaryAccum[id].totalUtilityBillPaidCents += incomeShares[id];
        summaryAccum[id].totalReportedUtilityCents += reportedUtilityCents[id];

        transactions.push({
          id: nextTxId(w),
          week: w,
          type: 'UTILITY_BILL_CONTRIBUTION',
          flowCategory: 'INTERNAL_TRANSFER',
          fromAccount: `ROOMMATE:${id}`,
          toAccount: 'HOUSEHOLD_POT',
          amount: toDollars(incomeShares[id]),
          amountCents: incomeShares[id],
          roommateId: id,
          description: `${ROOMMATE_PROFILES[id].name} pays ${sharePct}% Income-Proportional share of Week ${w} utility bill ($${toDollars(incomeShares[id]).toFixed(2)}).`,
          assumptionDrivers: [
            `policy=Income-Proportional Split (${sharePct}%)`,
            `${id}.weeklyIncome=$${assumptions.roommates[id].weeklyIncome}/wk`,
          ],
        });
      }
    } else if (policy.id === 'policy-3-self-reported') {
      let totalReportedCents = 0;
      for (const id of ROOMMATE_ORDER) {
        const params = assumptions.roommates[id];
        // Underreporting fraction driven by freeRideTemptation when unverified
        const underreportFraction = clamp(
          params.freeRideTemptation * 0.52 * (1 - 0.3 * params.auditSensitivity),
          0,
          0.6,
        );
        const gap = Math.round(trueUtilityCents[id] * underreportFraction);
        const reported = Math.max(0, trueUtilityCents[id] - gap);

        reportedUtilityCents[id] = reported;
        underreportedGapCents[id] = gap;
        utilityBillPaidCents[id] = reported;
        totalReportedCents += reported;

        cashCents[id] -= reported;
        summaryAccum[id].totalUtilityBillPaidCents += reported;
        summaryAccum[id].totalReportedUtilityCents += reported;
        summaryAccum[id].totalUnderreportedCents += gap;

        transactions.push({
          id: nextTxId(w),
          week: w,
          type: 'UTILITY_BILL_CONTRIBUTION',
          flowCategory: 'INTERNAL_TRANSFER',
          fromAccount: `ROOMMATE:${id}`,
          toAccount: 'HOUSEHOLD_POT',
          amount: toDollars(reported),
          amountCents: reported,
          roommateId: id,
          description: `${ROOMMATE_PROFILES[id].name} self-reports $${toDollars(reported).toFixed(2)} of Week ${w} usage (true usage $${toDollars(trueUtilityCents[id]).toFixed(2)}, underreported gap $${toDollars(gap).toFixed(2)}).`,
          assumptionDrivers: [
            `policy=Self-Reported Usage Billing (unverified)`,
            `${id}.freeRideTemptation=${params.freeRideTemptation.toFixed(2)}`,
            `${id}.auditSensitivity=${params.auditSensitivity.toFixed(2)}`,
          ],
        });
      }

      const totalShortfallCents = Math.max(
        0,
        totalUtilityBillCents - totalReportedCents,
      );
      if (totalShortfallCents > 0) {
        const shortfallShares = allocateCentsByWeights(
          totalShortfallCents,
          equalWeights,
        );
        for (const id of ROOMMATE_ORDER) {
          shortfallSurchargeCents[id] = shortfallShares[id];
          cashCents[id] -= shortfallShares[id];
          summaryAccum[id].totalShortfallPaidCents += shortfallShares[id];

          transactions.push({
            id: nextTxId(w),
            week: w,
            type: 'SHORTFALL_SURCHARGE',
            flowCategory: 'INTERNAL_TRANSFER',
            fromAccount: `ROOMMATE:${id}`,
            toAccount: 'HOUSEHOLD_POT',
            amount: toDollars(shortfallShares[id]),
            amountCents: shortfallShares[id],
            roommateId: id,
            description: `${ROOMMATE_PROFILES[id].name} pays 25% of Week ${w} Unexplained Shortfall Surcharge ($${toDollars(shortfallShares[id]).toFixed(2)} of $${toDollars(totalShortfallCents).toFixed(2)} uncollected gap).`,
            assumptionDrivers: [
              `policy=Self-Reported Shortfall Split (25% each)`,
              `leo.freeRideTemptation=${assumptions.roommates.leo.freeRideTemptation.toFixed(2)}`,
            ],
          });
        }
      }
    } else {
      // Policy 4: Metered Usage + Chore-Credit Rebate
      for (const id of ROOMMATE_ORDER) {
        const meteredCents = trueUtilityCents[id];
        utilityBillPaidCents[id] = meteredCents;
        reportedUtilityCents[id] = meteredCents;
        cashCents[id] -= meteredCents;
        summaryAccum[id].totalUtilityBillPaidCents += meteredCents;
        summaryAccum[id].totalReportedUtilityCents += meteredCents;

        transactions.push({
          id: nextTxId(w),
          week: w,
          type: 'UTILITY_BILL_CONTRIBUTION',
          flowCategory: 'INTERNAL_TRANSFER',
          fromAccount: `ROOMMATE:${id}`,
          toAccount: 'HOUSEHOLD_POT',
          amount: toDollars(meteredCents),
          amountCents: meteredCents,
          roommateId: id,
          description: `${ROOMMATE_PROFILES[id].name} pays exact sub-metered Week ${w} usage ($${toDollars(meteredCents).toFixed(2)}; saved $${toDollars(meteredSavedCents[id]).toFixed(2)} via metered price response).`,
          assumptionDrivers: [
            `policy=Metered Usage (100% marginal price signal)`,
            `${id}.usageAppetite=${assumptions.roommates[id].usageAppetite.toFixed(2)}`,
            `${id}.auditSensitivity=${assumptions.roommates[id].auditSensitivity.toFixed(2)}`,
          ],
        });
      }
    }

    // Pay the external utility vendor from HOUSEHOLD_POT (clears utility pot to $0)
    transactions.push({
      id: nextTxId(w),
      week: w,
      type: 'UTILITY_VENDOR_PAYMENT',
      flowCategory: 'EXTERNAL_OUTFLOW',
      fromAccount: 'HOUSEHOLD_POT',
      toAccount: 'EXTERNAL_UTILITY_VENDOR',
      amount: toDollars(totalUtilityBillCents),
      amountCents: totalUtilityBillCents,
      description: `Household Pot settles Week ${w} ${scenario.utilityLabel} invoice ($${toDollars(totalUtilityBillCents).toFixed(2)}) with external utility vendor.`,
      assumptionDrivers: [
        `weatherOrDemandIndex=${weekEvent.weatherOrDemandIndex}`,
        `baseWeeklyBill=$${scenario.baseWeeklyBillDollars}`,
      ],
    });

    // 4. Policy 2 Shared Reserve Buffer Contributions (10% of weekly bill)
    const reserveContributionCents: Record<RoommateId, number> = {
      maya: 0,
      devon: 0,
      priya: 0,
      leo: 0,
    };
    if (policy.collectsReserveBuffer && assumptions.reserveContributionRate > 0) {
      const totalReserveAddCents = Math.round(
        totalUtilityBillCents * assumptions.reserveContributionRate,
      );
      const reserveShares = allocateCentsByWeights(
        totalReserveAddCents,
        incomeWeights,
      );
      for (const id of ROOMMATE_ORDER) {
        const contrib = reserveShares[id];
        reserveContributionCents[id] = contrib;
        cashCents[id] -= contrib;
        reserveCents += contrib;
        summaryAccum[id].totalReservePaidCents += contrib;

        transactions.push({
          id: nextTxId(w),
          week: w,
          type: 'RESERVE_CONTRIBUTION',
          flowCategory: 'INTERNAL_TRANSFER',
          fromAccount: `ROOMMATE:${id}`,
          toAccount: 'HOUSEHOLD_RESERVE',
          amount: toDollars(contrib),
          amountCents: contrib,
          roommateId: id,
          description: `${ROOMMATE_PROFILES[id].name} contributes $${toDollars(contrib).toFixed(2)} into the Shared Household Reserve (${Math.round(assumptions.reserveContributionRate * 100)}% buffer).`,
          assumptionDrivers: [
            `policy=Shared Reserve Buffer (${Math.round(assumptions.reserveContributionRate * 100)}%)`,
            `${id}.weeklyIncome=$${assumptions.roommates[id].weeklyIncome}/wk`,
          ],
        });
      }
    }

    // 5. Policy 4 Fixed Metering & Admin Fee ($16/wk split equally -> EXTERNAL_ADMIN_VENDOR)
    const adminFeeCents: Record<RoommateId, number> = {
      maya: 0,
      devon: 0,
      priya: 0,
      leo: 0,
    };
    if (policy.chargesMeteringAdminFee && assumptions.weeklyMeteringAdminFee > 0) {
      const totalAdminCents = toCents(assumptions.weeklyMeteringAdminFee);
      const adminShares = allocateCentsByWeights(totalAdminCents, equalWeights);
      for (const id of ROOMMATE_ORDER) {
        const fee = adminShares[id];
        adminFeeCents[id] = fee;
        cashCents[id] -= fee;
        summaryAccum[id].totalAdminFeePaidCents += fee;

        transactions.push({
          id: nextTxId(w),
          week: w,
          type: 'ADMIN_METERING_FEE',
          flowCategory: 'EXTERNAL_OUTFLOW',
          fromAccount: `ROOMMATE:${id}`,
          toAccount: 'EXTERNAL_ADMIN_VENDOR',
          amount: toDollars(fee),
          amountCents: fee,
          roommateId: id,
          description: `${ROOMMATE_PROFILES[id].name} pays $${toDollars(fee).toFixed(2)} share of Week ${w} smart sub-metering & chore-ledger admin fee.`,
          assumptionDrivers: [
            `policy=Metered Usage Admin Fee ($${assumptions.weeklyMeteringAdminFee}/wk)`,
          ],
        });
      }
    }

    // 6. Week 3 Surprise Expense Settlement
    const surpriseShockPaidCents: Record<RoommateId, number> = {
      maya: 0,
      devon: 0,
      priya: 0,
      leo: 0,
    };
    let surpriseExpenseCents = 0;
    let reserveUsedForSurpriseCents = 0;

    if (weekEvent.surpriseExpense) {
      surpriseExpenseCents = toCents(weekEvent.surpriseExpense.amountDollars);
      reserveUsedForSurpriseCents = Math.min(reserveCents, surpriseExpenseCents);

      if (reserveUsedForSurpriseCents > 0) {
        reserveCents -= reserveUsedForSurpriseCents;
        transactions.push({
          id: nextTxId(w),
          week: w,
          type: 'RESERVE_WITHDRAWAL',
          flowCategory: 'INTERNAL_TRANSFER',
          fromAccount: 'HOUSEHOLD_RESERVE',
          toAccount: 'HOUSEHOLD_POT',
          amount: toDollars(reserveUsedForSurpriseCents),
          amountCents: reserveUsedForSurpriseCents,
          description: `Shared Household Reserve absorbs $${toDollars(reserveUsedForSurpriseCents).toFixed(2)} of ${weekEvent.surpriseExpense.title}.`,
          assumptionDrivers: [
            `surpriseExpense=$${weekEvent.surpriseExpense.amountDollars}`,
            `availableReserve=$${toDollars(reserveUsedForSurpriseCents + reserveCents).toFixed(2)}`,
          ],
        });
      }

      const uncoveredSurpriseCents =
        surpriseExpenseCents - reserveUsedForSurpriseCents;
      if (uncoveredSurpriseCents > 0) {
        const shockWeights =
          policy.id === 'policy-2-income-reserve' ? incomeWeights : equalWeights;
        const shockShares = allocateCentsByWeights(
          uncoveredSurpriseCents,
          shockWeights,
        );
        for (const id of ROOMMATE_ORDER) {
          const share = shockShares[id];
          surpriseShockPaidCents[id] = share;
          cashCents[id] -= share;
          summaryAccum[id].totalSurprisePaidCents += share;

          transactions.push({
            id: nextTxId(w),
            week: w,
            type: 'SURPRISE_SHOCK_CONTRIBUTION',
            flowCategory: 'INTERNAL_TRANSFER',
            fromAccount: `ROOMMATE:${id}`,
            toAccount: 'HOUSEHOLD_POT',
            amount: toDollars(share),
            amountCents: share,
            roommateId: id,
            description: `${ROOMMATE_PROFILES[id].name} pays $${toDollars(share).toFixed(2)} out-of-pocket toward uncovered Week 3 Surprise Expense (${weekEvent.surpriseExpense.title}).`,
            assumptionDrivers: [
              `surpriseExpense=${weekEvent.surpriseExpense.id}`,
              `uncoveredAfterReserve=$${toDollars(uncoveredSurpriseCents).toFixed(2)}`,
              `policy=${policy.shortTitle}`,
            ],
          });
        }
      }

      transactions.push({
        id: nextTxId(w),
        week: w,
        type: 'SURPRISE_VENDOR_PAYMENT',
        flowCategory: 'EXTERNAL_OUTFLOW',
        fromAccount: 'HOUSEHOLD_POT',
        toAccount: 'EXTERNAL_REPAIR_VENDOR',
        amount: toDollars(surpriseExpenseCents),
        amountCents: surpriseExpenseCents,
        description: `Household Pot pays $${toDollars(surpriseExpenseCents).toFixed(2)} to external vendor for ${weekEvent.surpriseExpense.title}.`,
        assumptionDrivers: [
          `eventSchedule.surpriseExpense=$${weekEvent.surpriseExpense.amountDollars} (frozen seed=${eventSchedule.seed})`,
        ],
      });
    }

    // 7. Weekly Kitchen & Cleaning Chores + Policy 4 Chore-Credit Rebate Transfers
    const choreRebateNetCents: Record<RoommateId, number> = {
      maya: 0,
      devon: 0,
      priya: 0,
      leo: 0,
    };

    // Rank roommates by chore willingness score
    const willingnessScores = ROOMMATE_ORDER.map((id) => {
      const p = assumptions.roommates[id];
      const score =
        p.auditSensitivity * 0.75 -
        p.freeRideTemptation * 0.7 +
        (320 - p.weeklyIncome) / 900;
      return { id, score };
    }).sort((a, b) => b.score - a.score);

    const choreDeltas: Record<RoommateId, number> = {
      maya: 0,
      devon: 0,
      priya: 0,
      leo: 0,
    };

    if (policy.enablesChoreRebate && assumptions.choreCreditDollarValue > 0) {
      const creditCents = toCents(assumptions.choreCreditDollarValue);
      // Top willingness roommate picks up +1 extra chore from lowest willingness roommate
      const helper1 = willingnessScores[0].id;
      const shirker1 = willingnessScores[3].id;
      if (willingnessScores[0].score - willingnessScores[3].score >= 0.15) {
        choreDeltas[helper1] = 1;
        choreDeltas[shirker1] = -1;
        cashCents[shirker1] -= creditCents;
        cashCents[helper1] += creditCents;
        choreRebateNetCents[helper1] += creditCents;
        choreRebateNetCents[shirker1] -= creditCents;
        summaryAccum[helper1].totalChoreRebateNetCents += creditCents;
        summaryAccum[shirker1].totalChoreRebateNetCents -= creditCents;

        transactions.push({
          id: nextTxId(w),
          week: w,
          type: 'CHORE_REBATE_TRANSFER',
          flowCategory: 'INTERNAL_TRANSFER',
          fromAccount: `ROOMMATE:${shirker1}`,
          toAccount: `ROOMMATE:${helper1}`,
          amount: toDollars(creditCents),
          amountCents: creditCents,
          roommateId: helper1,
          counterpartyRoommateId: shirker1,
          description: `${ROOMMATE_PROFILES[shirker1].name} pays $${toDollars(creditCents).toFixed(2)} Chore-Credit Rebate to ${ROOMMATE_PROFILES[helper1].name} for covering 1 extra kitchen/cleaning chore in Week ${w}.`,
          assumptionDrivers: [
            `policy=Chore-Credit Rebate ($${assumptions.choreCreditDollarValue}/chore)`,
            `${helper1}.auditSensitivity=${assumptions.roommates[helper1].auditSensitivity.toFixed(2)}`,
            `${shirker1}.freeRideTemptation=${assumptions.roommates[shirker1].freeRideTemptation.toFixed(2)}`,
          ],
        });
      }

      // Second pair if willingness gap >= 0.25
      const helper2 = willingnessScores[1].id;
      const shirker2 = willingnessScores[2].id;
      if (willingnessScores[1].score - willingnessScores[2].score >= 0.25) {
        choreDeltas[helper2] = 1;
        choreDeltas[shirker2] = -1;
        cashCents[shirker2] -= creditCents;
        cashCents[helper2] += creditCents;
        choreRebateNetCents[helper2] += creditCents;
        choreRebateNetCents[shirker2] -= creditCents;
        summaryAccum[helper2].totalChoreRebateNetCents += creditCents;
        summaryAccum[shirker2].totalChoreRebateNetCents -= creditCents;

        transactions.push({
          id: nextTxId(w),
          week: w,
          type: 'CHORE_REBATE_TRANSFER',
          flowCategory: 'INTERNAL_TRANSFER',
          fromAccount: `ROOMMATE:${shirker2}`,
          toAccount: `ROOMMATE:${helper2}`,
          amount: toDollars(creditCents),
          amountCents: creditCents,
          roommateId: helper2,
          counterpartyRoommateId: shirker2,
          description: `${ROOMMATE_PROFILES[shirker2].name} pays $${toDollars(creditCents).toFixed(2)} Chore-Credit Rebate to ${ROOMMATE_PROFILES[helper2].name} for covering 1 extra kitchen/cleaning chore in Week ${w}.`,
          assumptionDrivers: [
            `policy=Chore-Credit Rebate ($${assumptions.choreCreditDollarValue}/chore)`,
            `${helper2}.auditSensitivity=${assumptions.roommates[helper2].auditSensitivity.toFixed(2)}`,
            `${shirker2}.freeRideTemptation=${assumptions.roommates[shirker2].freeRideTemptation.toFixed(2)}`,
          ],
        });
      }
    } else {
      // Unrebated policies: if worst free-rider has freeRideTemptation >= 0.55, they shirk 1 chore and top cooperator covers it unpaid
      const helper = willingnessScores[0].id;
      const shirker = willingnessScores[3].id;
      if (assumptions.roommates[shirker].freeRideTemptation >= 0.55) {
        choreDeltas[helper] = 1;
        choreDeltas[shirker] = -1;
      }
    }

    // 8. Update Trust/Morale & Record Chore Ledger + Weekly Snapshot
    const weeklyRoommateStates = {} as Record<RoommateId, WeeklyRoommateState>;

    for (const id of ROOMMATE_ORDER) {
      const targetChores = GAME_CONFIG.BASE_CHORES_PER_ROOMMATE_PER_WEEK;
      const delta = choreDeltas[id];
      const completedChores = targetChores + delta;
      summaryAccum[id].totalChoresCompleted += completedChores;

      const totalOutOfPocketCents =
        utilityBillPaidCents[id] +
        shortfallSurchargeCents[id] +
        reserveContributionCents[id] +
        surpriseShockPaidCents[id] +
        adminFeeCents[id] -
        choreRebateNetCents[id];

      // Trust update based on billing fairness vs true usage, shortfall surcharges, and unpaid chores
      const overpaymentRatio =
        (utilityBillPaidCents[id] + shortfallSurchargeCents[id] - trueUtilityCents[id]) /
        Math.max(100, trueUtilityCents[id]);
      const allowedOverpayment =
        (1 - assumptions.roommates[id].fairnessThreshold) * 0.35;

      let trustDelta = 0;
      if (overpaymentRatio > allowedOverpayment) {
        trustDelta -= Math.round((overpaymentRatio - allowedOverpayment) * 28);
      } else {
        trustDelta += 2;
      }
      if (shortfallSurchargeCents[id] > 0 && underreportedGapCents[id] < shortfallSurchargeCents[id]) {
        trustDelta -= 6; // Honest roommate resents paying for someone else's underreporting
      }
      if (delta > 0 && !policy.enablesChoreRebate) {
        trustDelta -= 5; // Covering extra chores without rebate erodes morale
      } else if (delta > 0 && policy.enablesChoreRebate) {
        trustDelta += 3; // Paid fairly for extra chore
      }
      if (toDollars(cashCents[id]) < GAME_CONFIG.LIQUIDITY_STRESS_THRESHOLD) {
        trustDelta -= 8; // Financial stress hurts household morale
      }

      trustScore[id] = clamp(trustScore[id] + trustDelta, 15, 100);

      choreLedger.push({
        id: `CHORE-W${w}-${id.toUpperCase()}`,
        week: w,
        roommateId: id,
        targetChores,
        completedChores,
        choreDelta: delta,
        rebateOrPenaltyDollars: toDollars(choreRebateNetCents[id]),
        trustDelta,
        note:
          delta > 0
            ? policy.enablesChoreRebate
              ? `Completed ${completedChores} chores (+1 extra) and earned +$${toDollars(choreRebateNetCents[id]).toFixed(2)} chore rebate.`
              : `Completed ${completedChores} chores (+1 extra unpaid cover for shirked chore).`
            : delta < 0
              ? policy.enablesChoreRebate
                ? `Completed ${completedChores} chore (-1) and paid $${Math.abs(toDollars(choreRebateNetCents[id])).toFixed(2)} chore rebate to housemate.`
                : `Completed ${completedChores} chore (-1 shirked without financial penalty).`
              : `Completed standard ${completedChores} weekly chores.`,
      });

      const endingCashDollars = toDollars(cashCents[id]);
      const inStress = endingCashDollars < GAME_CONFIG.LIQUIDITY_STRESS_THRESHOLD;
      const inOverdraft = endingCashDollars < GAME_CONFIG.OVERDRAFT_THRESHOLD;

      if (cashCents[id] < summaryAccum[id].minWeeklyCashCents) {
        summaryAccum[id].minWeeklyCashCents = cashCents[id];
      }
      if (inStress) summaryAccum[id].experiencedLiquidityStress = true;
      if (inOverdraft) summaryAccum[id].experiencedOverdraft = true;

      weeklyRoommateStates[id] = {
        roommateId: id,
        week: w,
        startingCash: toDollars(startingCashCents[id]),
        incomeReceived: toDollars(weeklyIncomeCents[id]),
        trueUtilityConsumption: toDollars(trueUtilityCents[id]),
        reportedUtilityConsumption: toDollars(reportedUtilityCents[id]),
        underreportedGap: toDollars(underreportedGapCents[id]),
        commonsOverconsumptionAdded: toDollars(commonsAddedCents[id]),
        meteredConservationSaved: toDollars(meteredSavedCents[id]),
        utilityBillPaid: toDollars(utilityBillPaidCents[id]),
        shortfallSurchargePaid: toDollars(shortfallSurchargeCents[id]),
        reserveContributionPaid: toDollars(reserveContributionCents[id]),
        surpriseShockPaid: toDollars(surpriseShockPaidCents[id]),
        adminFeePaid: toDollars(adminFeeCents[id]),
        choreRebateNet: toDollars(choreRebateNetCents[id]),
        totalOutOfPocketPaid: toDollars(totalOutOfPocketCents),
        endingCash: endingCashDollars,
        inLiquidityStress: inStress,
        inOverdraft,
        endingTrust: trustScore[id],
      };
    }

    const totalUnderreportedCentsWeek =
      underreportedGapCents.maya +
      underreportedGapCents.devon +
      underreportedGapCents.priya +
      underreportedGapCents.leo;

    const endingTotalRoommateCashCents =
      cashCents.maya + cashCents.devon + cashCents.priya + cashCents.leo;

    const avgTrust = Number(
      (
        (trustScore.maya + trustScore.devon + trustScore.priya + trustScore.leo) /
        4
      ).toFixed(1),
    );

    weeklySnapshots.push({
      week: w,
      weatherOrDemandIndex: weekEvent.weatherOrDemandIndex,
      ambientNote: weekEvent.ambientNote,
      totalUtilityBill: toDollars(totalUtilityBillCents),
      totalUnderreportedGap: toDollars(totalUnderreportedCentsWeek),
      surpriseExpenseAmount: toDollars(surpriseExpenseCents),
      reserveUsedForSurprise: toDollars(reserveUsedForSurpriseCents),
      endingHouseholdReserve: toDollars(reserveCents),
      endingTotalRoommateCash: toDollars(endingTotalRoommateCashCents),
      averageHouseholdTrust: avgTrust,
      roommateStates: weeklyRoommateStates,
    });
  }

  // Build RoommateRunSummary for each roommate
  const roommateSummaries = {} as Record<RoommateId, RoommateRunSummary>;
  let highestNetPayerId: RoommateId = 'priya';
  let highestNetPaidCents = -Infinity;
  let largestBehavioralShiftId: RoommateId = 'priya';
  let largestBehavioralShiftCents = -Infinity;

  for (const id of ROOMMATE_ORDER) {
    const acc = summaryAccum[id];
    const netOutOfPocketCents =
      acc.totalUtilityBillPaidCents +
      acc.totalShortfallPaidCents +
      acc.totalReservePaidCents +
      acc.totalSurprisePaidCents +
      acc.totalAdminFeePaidCents -
      acc.totalChoreRebateNetCents;

    if (netOutOfPocketCents > highestNetPaidCents) {
      highestNetPaidCents = netOutOfPocketCents;
      highestNetPayerId = id;
    }

    const shiftMagnitudeCents =
      acc.totalCommonsAddedCents +
      acc.totalUnderreportedCents +
      acc.totalMeteredSavedCents +
      Math.abs(acc.totalChoreRebateNetCents);

    if (shiftMagnitudeCents > largestBehavioralShiftCents) {
      largestBehavioralShiftCents = shiftMagnitudeCents;
      largestBehavioralShiftId = id;
    }

    let primaryDriver = 'Steady baseline consumption';
    if (acc.totalUnderreportedCents > 2500) {
      primaryDriver = `Underreported $${toDollars(acc.totalUnderreportedCents).toFixed(2)} under unverified billing`;
    } else if (acc.totalCommonsAddedCents > 3500) {
      primaryDriver = `Added $${toDollars(acc.totalCommonsAddedCents).toFixed(2)} in unpriced commons draw`;
    } else if (acc.totalChoreRebateNetCents > 0) {
      primaryDriver = `Earned +$${toDollars(acc.totalChoreRebateNetCents).toFixed(2)} in extra chore rebates & saved $${toDollars(acc.totalMeteredSavedCents).toFixed(2)} via metering`;
    } else if (acc.totalMeteredSavedCents > 2000) {
      primaryDriver = `Curbed usage by $${toDollars(acc.totalMeteredSavedCents).toFixed(2)} under 100% metered price signal`;
    }

    roommateSummaries[id] = {
      roommateId: id,
      name: ROOMMATE_PROFILES[id].name,
      initialCash: assumptions.roommates[id].initialCash,
      totalIncome: toDollars(acc.totalIncomeCents),
      totalTrueUtilityConsumption: toDollars(acc.totalTrueUtilityCents),
      totalReportedUtilityConsumption: toDollars(acc.totalReportedUtilityCents),
      totalUnderreportedGap: toDollars(acc.totalUnderreportedCents),
      totalCommonsOverconsumption: toDollars(acc.totalCommonsAddedCents),
      totalMeteredConservationSaved: toDollars(acc.totalMeteredSavedCents),
      totalUtilityBillPaid: toDollars(acc.totalUtilityBillPaidCents),
      totalShortfallSurchargePaid: toDollars(acc.totalShortfallPaidCents),
      totalReserveContributionPaid: toDollars(acc.totalReservePaidCents),
      totalSurpriseShockPaid: toDollars(acc.totalSurprisePaidCents),
      totalAdminFeePaid: toDollars(acc.totalAdminFeePaidCents),
      totalChoreRebateNet: toDollars(acc.totalChoreRebateNetCents),
      totalOutOfPocketPaid: toDollars(netOutOfPocketCents),
      behavioralShiftMagnitude: toDollars(shiftMagnitudeCents),
      primaryBehavioralDriver: primaryDriver,
      endingCash: toDollars(cashCents[id]),
      minWeeklyCash: toDollars(acc.minWeeklyCashCents),
      experiencedLiquidityStress: acc.experiencedLiquidityStress,
      experiencedOverdraft: acc.experiencedOverdraft,
      endingTrust: trustScore[id],
      totalChoresCompleted: acc.totalChoresCompleted,
    };
  }

  // Strict Money Conservation Verification
  const totalExternalInflowsCents = transactions
    .filter((tx) => tx.flowCategory === 'EXTERNAL_INFLOW')
    .reduce((sum, tx) => sum + tx.amountCents, 0);

  const totalExternalOutflowsCents = transactions
    .filter((tx) => tx.flowCategory === 'EXTERNAL_OUTFLOW')
    .reduce((sum, tx) => sum + tx.amountCents, 0);

  const endingRoommateCashCents =
    cashCents.maya + cashCents.devon + cashCents.priya + cashCents.leo;
  const endingHouseholdReserveCents = reserveCents;

  const initialCashCents =
    initialRoommateCashCents + initialHouseholdReserveCents;
  const totalInflowsCents = initialCashCents + totalExternalInflowsCents;
  const totalOutflowsCents = totalExternalOutflowsCents;

  const expectedEndingTotalCents = totalInflowsCents - totalOutflowsCents;
  const actualEndingTotalCents =
    endingRoommateCashCents + endingHouseholdReserveCents;
  const discrepancyCents = expectedEndingTotalCents - actualEndingTotalCents;

  const conservation: MoneyConservationCheck = {
    initialRoommateCash: toDollars(initialRoommateCashCents),
    initialHouseholdReserve: toDollars(initialHouseholdReserveCents),
    initialCash: toDollars(initialCashCents),
    totalIncome: toDollars(totalExternalInflowsCents),
    totalExpenses: toDollars(totalExternalOutflowsCents),
    totalInflows: toDollars(totalInflowsCents),
    totalOutflows: toDollars(totalOutflowsCents),
    endingRoommateCash: toDollars(endingRoommateCashCents),
    endingHouseholdReserve: toDollars(endingHouseholdReserveCents),
    finalRoommateCash: toDollars(endingRoommateCashCents),
    finalHouseholdReserve: toDollars(endingHouseholdReserveCents),
    expectedEndingTotal: toDollars(expectedEndingTotalCents),
    actualEndingTotal: toDollars(actualEndingTotalCents),
    discrepancyCents,
    discrepancyDollars: toDollars(discrepancyCents),
    isConserved: discrepancyCents === 0,
  };

  const anyLiquidityStress = ROOMMATE_ORDER.some(
    (id) => roommateSummaries[id].experiencedLiquidityStress,
  );
  const anyOverdraft = ROOMMATE_ORDER.some(
    (id) => roommateSummaries[id].experiencedOverdraft,
  );
  const endingAverageTrust =
    weeklySnapshots[weeklySnapshots.length - 1].averageHouseholdTrust;

  const partialResult: HouseholdRunResult = {
    scenarioId: scenario.id,
    policyId: policy.id,
    seed: eventSchedule.seed,
    scheduleSignature: eventSchedule.scheduleSignature,
    eventSchedule,
    assumptions,
    transactions,
    choreLedger,
    weeklySnapshots,
    roommateSummaries,
    conservation,
    explanations: [],
    highestNetPayerId,
    largestBehavioralShiftId,
    anyLiquidityStress,
    anyOverdraft,
    endingAverageTrust,
  };

  partialResult.explanations = buildLedgerExplanations(partialResult);
  return partialResult;
}

/**
 * Generates trace-backed explanations where EVERY explanation item points to concrete
 * recorded transaction IDs in `runResult.transactions` and explicitly states which
 * model assumptions produced that behavior (never claiming simplified equations are
 * universal truths about real people).
 */
export function buildLedgerExplanations(
  runResult: HouseholdRunResult,
): LedgerExplanation[] {
  const { policyId, roommateSummaries, transactions, assumptions } = runResult;
  const policy = POLICIES[policyId];
  const explanations: LedgerExplanation[] = [];

  // 1. Billing Split & Highest/Lowest Burden Explanation
  const devonUtilityTxs = transactions
    .filter(
      (tx) =>
        tx.roommateId === 'devon' && tx.type === 'UTILITY_BILL_CONTRIBUTION',
    )
    .map((tx) => tx.id);
  const priyaUtilityTxs = transactions
    .filter(
      (tx) =>
        tx.roommateId === 'priya' && tx.type === 'UTILITY_BILL_CONTRIBUTION',
    )
    .map((tx) => tx.id);

  const highestPayer = roommateSummaries[runResult.highestNetPayerId];
  const devonSummary = roommateSummaries.devon;

  explanations.push({
    id: 'EXP-BILLING-BURDEN',
    category: 'BILLING_SPLIT',
    headline: `Billing Distribution: ${highestPayer.name} paid the highest net total ($${highestPayer.totalOutOfPocketPaid.toFixed(2)}); Devon ended at $${devonSummary.endingCash.toFixed(2)} cash`,
    statement: `In the recorded ledger (${[...devonUtilityTxs.slice(0, 2), ...priyaUtilityTxs.slice(0, 2)].join(', ')}), ${policy.shortTitle} resulted in ${highestPayer.name} paying $${highestPayer.totalOutOfPocketPaid.toFixed(2)} out-of-pocket over 4 weeks while Devon paid $${devonSummary.totalOutOfPocketPaid.toFixed(2)} on a $${assumptions.roommates.devon.weeklyIncome}/wk income. Under our model’s billing equation (${policy.id}), Devon’s minimum weekly cash reached $${devonSummary.minWeeklyCash.toFixed(2)} (${devonSummary.experiencedLiquidityStress ? 'triggering Liquidity Stress < $40' : 'remaining above the $40 stress threshold'}).`,
    transactionIds: [...devonUtilityTxs, ...priyaUtilityTxs],
    assumptionRefs: [
      `devon.weeklyIncome=$${assumptions.roommates.devon.weeklyIncome}/wk`,
      `priya.weeklyIncome=$${assumptions.roommates.priya.weeklyIncome}/wk`,
      `priya.usageAppetite=${assumptions.roommates.priya.usageAppetite.toFixed(2)}`,
      `policy=${policy.id}`,
    ],
    modelLimitationNote:
      'Model Assumption Note: This cash trajectory follows deterministically from fixed weekly incomes and the selected billing formula; real roommates might renegotiate mid-month or lend cash informally outside the formal ledger.',
  });

  // 2. Behavioral Incentive Explanation (Commons vs Underreporting vs Metering)
  if (policyId === 'policy-3-self-reported') {
    const shortfallTxs = transactions
      .filter((tx) => tx.type === 'SHORTFALL_SURCHARGE')
      .map((tx) => tx.id);
    const leoReportTxs = transactions
      .filter(
        (tx) =>
          tx.roommateId === 'leo' && tx.type === 'UTILITY_BILL_CONTRIBUTION',
      )
      .map((tx) => tx.id);
    const cited = [...leoReportTxs.slice(0, 2), ...shortfallTxs.slice(0, 2)];

    explanations.push({
      id: 'EXP-INCENTIVE-UNDERREPORT',
      category: 'BEHAVIORAL_INCENTIVE',
      headline: `Unverified Reporting Gap: $${ (roommateSummaries.maya.totalUnderreportedGap + roommateSummaries.devon.totalUnderreportedGap + roommateSummaries.priya.totalUnderreportedGap + roommateSummaries.leo.totalUnderreportedGap).toFixed(2) } shifted via Shortfall Surcharges`,
      statement: `Because Policy 3 uses unverified self-reporting, our agent equation discounts reported usage by (freeRideTemptation * 0.52 * (1 - 0.30 * auditSensitivity)). Leo (freeRideTemptation=${assumptions.roommates.leo.freeRideTemptation.toFixed(2)}) underreported $${roommateSummaries.leo.totalUnderreportedGap.toFixed(2)} across ${leoReportTxs.join(', ')}, forcing the household to cover an Unexplained Shortfall Surcharge across ${shortfallTxs.slice(0, 4).join(', ')}.`,
      transactionIds: cited.length > 0 ? cited : leoReportTxs,
      assumptionRefs: [
        `leo.freeRideTemptation=${assumptions.roommates.leo.freeRideTemptation.toFixed(2)}`,
        `leo.auditSensitivity=${assumptions.roommates.leo.auditSensitivity.toFixed(2)}`,
        `policy.allowsUnverifiedUnderreporting=true`,
      ],
      modelLimitationNote:
        'Model Assumption Note: The underreporting gap is a conditional consequence of setting Leo’s `freeRideTemptation` slider to a high value in an unverified equation—not a claim that all real roommates cheat on honor jars.',
    });
  } else if (policyId === 'policy-4-metered-rebate') {
    const adminTxs = transactions
      .filter((tx) => tx.type === 'ADMIN_METERING_FEE')
      .map((tx) => tx.id);
    const totalSaved =
      roommateSummaries.maya.totalMeteredConservationSaved +
      roommateSummaries.devon.totalMeteredConservationSaved +
      roommateSummaries.priya.totalMeteredConservationSaved +
      roommateSummaries.leo.totalMeteredConservationSaved;
    const totalAdmin =
      roommateSummaries.maya.totalAdminFeePaid +
      roommateSummaries.devon.totalAdminFeePaid +
      roommateSummaries.priya.totalAdminFeePaid +
      roommateSummaries.leo.totalAdminFeePaid;

    explanations.push({
      id: 'EXP-INCENTIVE-METERED',
      category: 'BEHAVIORAL_INCENTIVE',
      headline: `Metered Verification vs. Admin Overhead: Saved $${totalSaved.toFixed(2)} in usage at a $${totalAdmin.toFixed(2)} metering fee`,
      statement: `Under Policy 4, setting marginalPriceSignal=1.0 caused roommates to curb consumption by $${totalSaved.toFixed(2)} via their auditSensitivity parameters while eliminating underreporting. However, ledger entries ${adminTxs.slice(0, 4).join(', ')} record $${totalAdmin.toFixed(2)} paid to EXTERNAL_ADMIN_VENDOR ($${assumptions.weeklyMeteringAdminFee}/wk fixed fee).`,
      transactionIds: adminTxs,
      assumptionRefs: [
        `policy.marginalPriceSignal=1.0`,
        `weeklyMeteringAdminFee=$${assumptions.weeklyMeteringAdminFee}/wk`,
        `priya.auditSensitivity=${assumptions.roommates.priya.auditSensitivity.toFixed(2)}`,
      ],
      modelLimitationNote:
        'Model Assumption Note: In this stylized equation, sub-metering has zero measurement error and a flat weekly fee; real smart-home sub-meters cannot easily separate shared refrigerator or hallway heat draw.',
    });
  } else {
    const vendorUtilityTxs = transactions
      .filter((tx) => tx.type === 'UTILITY_VENDOR_PAYMENT')
      .map((tx) => tx.id);
    const totalCommons =
      roommateSummaries.maya.totalCommonsOverconsumption +
      roommateSummaries.devon.totalCommonsOverconsumption +
      roommateSummaries.priya.totalCommonsOverconsumption +
      roommateSummaries.leo.totalCommonsOverconsumption;

    explanations.push({
      id: 'EXP-INCENTIVE-COMMONS',
      category: 'BEHAVIORAL_INCENTIVE',
      headline: `Pooled Marginal Cost Effect: +$${totalCommons.toFixed(2)} in unpriced commons consumption`,
      statement: `Because ${policy.shortTitle} sets marginalPriceSignal=${policy.marginalPriceSignal.toFixed(2)} (each roommate pays only ${Math.round(policy.marginalPriceSignal * 100)} cents on an extra dollar of consumption), our model’s commons-elasticity term added $${totalCommons.toFixed(2)} to vendor utility invoices (${vendorUtilityTxs.join(', ')}), led by Priya ($${roommateSummaries.priya.totalCommonsOverconsumption.toFixed(2)}) and Leo ($${roommateSummaries.leo.totalCommonsOverconsumption.toFixed(2)}).`,
      transactionIds: vendorUtilityTxs,
      assumptionRefs: [
        `policy.marginalPriceSignal=${policy.marginalPriceSignal}`,
        `priya.usageAppetite=${assumptions.roommates.priya.usageAppetite.toFixed(2)}`,
        `leo.freeRideTemptation=${assumptions.roommates.leo.freeRideTemptation.toFixed(2)}`,
      ],
      modelLimitationNote:
        'Model Assumption Note: This "tragedy of the commons" inflation is driven by our multiplicative price-elasticity equation; real roommates may conserve energy out of environmental values even when bills are split equally.',
    });
  }

  // 3. Week 3 Surprise Shock & Reserve Buffer Explanation
  const shockTxs = transactions
    .filter(
      (tx) =>
        tx.type === 'RESERVE_WITHDRAWAL' ||
        tx.type === 'SURPRISE_SHOCK_CONTRIBUTION' ||
        tx.type === 'SURPRISE_VENDOR_PAYMENT',
    )
    .map((tx) => tx.id);
  const w3Snap = runResult.weeklySnapshots[2];

  explanations.push({
    id: 'EXP-WEEK3-SHOCK',
    category: 'SURPRISE_SHOCK',
    headline: `Week 3 Surprise Expense ($${w3Snap.surpriseExpenseAmount.toFixed(2)}): $${w3Snap.reserveUsedForSurprise.toFixed(2)} buffered by Reserve`,
    statement: `When the frozen Week 3 Surprise Expense hit (${shockTxs.join(', ')}), the Shared Household Reserve absorbed $${w3Snap.reserveUsedForSurprise.toFixed(2)} first, leaving $${(w3Snap.surpriseExpenseAmount - w3Snap.reserveUsedForSurprise).toFixed(2)} to be paid out-of-pocket by roommates during Week 3.`,
    transactionIds: shockTxs,
    assumptionRefs: [
      `policy.collectsReserveBuffer=${policy.collectsReserveBuffer}`,
      `reserveContributionRate=${Math.round(assumptions.reserveContributionRate * 100)}%`,
      `eventSchedule.week3Surprise=$${w3Snap.surpriseExpenseAmount.toFixed(2)}`,
    ],
    modelLimitationNote:
      'Model Assumption Note: The model treats the Week 3 repair as requiring immediate full settlement in Week 3; real landlords or utilities sometimes allow multi-month payment plans.',
  });

  // 4. Chore Equity & Trust Explanation
  const choreRebateTxs = transactions
    .filter((tx) => tx.type === 'CHORE_REBATE_TRANSFER')
    .map((tx) => tx.id);
  const fallbackWeek4Txs = transactions
    .filter((tx) => tx.week === 4)
    .slice(0, 2)
    .map((tx) => tx.id);

  explanations.push({
    id: 'EXP-CHORE-TRUST',
    category: 'CHORE_EQUITY',
    headline:
      choreRebateTxs.length > 0
        ? `Chore-Credit Rebates transferred $${(assumptions.choreCreditDollarValue * choreRebateTxs.length).toFixed(2)} to extra-chore helpers`
        : `Uncompensated Chore Imbalance & Billing Friction left Household Trust at ${runResult.endingAverageTrust.toFixed(1)}%`,
    statement:
      choreRebateTxs.length > 0
        ? `Under Policy 4, explicit Chore-Credit Rebate transfers (${choreRebateTxs.slice(0, 4).join(', ')}) compensated roommates who completed 3 weekly chores (+1 extra) via a $${assumptions.choreCreditDollarValue.toFixed(2)} transfer from roommates who completed 1 chore (-1), maintaining average household trust at ${runResult.endingAverageTrust.toFixed(1)}%.`
        : `Without a financial chore rebate (${fallbackWeek4Txs.join(', ')}), high freeRideTemptation caused chore shirking that cooperative roommates covered unpaid, combining with billing friction to leave Week 4 household trust at ${runResult.endingAverageTrust.toFixed(1)}%.`,
    transactionIds:
      choreRebateTxs.length > 0 ? choreRebateTxs : fallbackWeek4Txs,
    assumptionRefs: [
      `policy.enablesChoreRebate=${policy.enablesChoreRebate}`,
      `choreCreditDollarValue=$${assumptions.choreCreditDollarValue}`,
      `devon.fairnessThreshold=${assumptions.roommates.devon.fairnessThreshold.toFixed(2)}`,
    ],
    modelLimitationNote:
      'Model Assumption Note: Paying cash rebates for chores can align budget incentives in our ledger equation, though behavioral economics research shows monetizing household favors can sometimes crowd out intrinsic goodwill.',
  });

  return explanations;
}

/**
 * Grades a player's committed 3-part prediction against the simulated runResult,
 * citing specific recorded ledger transaction IDs for every graded item.
 */
export function gradePrediction(
  prediction: PlayerPrediction,
  runResult: HouseholdRunResult,
): PredictionGradeResult {
  const { roommateSummaries, transactions } = runResult;

  // 1. Highest Net Payer
  const actualHighestPayer = runResult.highestNetPayerId;
  const isPayerCorrect = prediction.highestNetPayer === actualHighestPayer;
  const highestPayerTxs = transactions
    .filter(
      (tx) =>
        tx.roommateId === actualHighestPayer &&
        (tx.type === 'UTILITY_BILL_CONTRIBUTION' ||
          tx.type === 'SURPRISE_SHOCK_CONTRIBUTION' ||
          tx.type === 'RESERVE_CONTRIBUTION'),
    )
    .slice(0, 4)
    .map((tx) => tx.id);

  const item1: PredictionGradeItem = {
    field: 'highestNetPayer',
    title: '1. Highest 4-Week Net Household Payer',
    predictedLabel: `${ROOMMATE_PROFILES[prediction.highestNetPayer].name} ($${roommateSummaries[prediction.highestNetPayer].totalOutOfPocketPaid.toFixed(2)})`,
    actualLabel: `${ROOMMATE_PROFILES[actualHighestPayer].name} ($${roommateSummaries[actualHighestPayer].totalOutOfPocketPaid.toFixed(2)})`,
    isCorrect: isPayerCorrect,
    explanation: `${ROOMMATE_PROFILES[actualHighestPayer].name} paid the highest 4-week net out-of-pocket total ($${roommateSummaries[actualHighestPayer].totalOutOfPocketPaid.toFixed(2)}) across ledger entries ${highestPayerTxs.join(', ')}, while you predicted ${ROOMMATE_PROFILES[prediction.highestNetPayer].name} ($${roommateSummaries[prediction.highestNetPayer].totalOutOfPocketPaid.toFixed(2)}).`,
    evidenceTransactionIds: highestPayerTxs,
    assumptionNote: `Driven by ${POLICIES[runResult.policyId].shortTitle}, ${actualHighestPayer}.weeklyIncome=$${runResult.assumptions.roommates[actualHighestPayer].weeklyIncome}, and ${actualHighestPayer}.usageAppetite=${runResult.assumptions.roommates[actualHighestPayer].usageAppetite.toFixed(2)}.`,
  };

  // 2. Week 3 Shock & Liquidity Survival
  const actualShockOutcome: 'all_solvent_buffered' | 'liquidity_crunch' =
    runResult.anyLiquidityStress ? 'liquidity_crunch' : 'all_solvent_buffered';
  const isShockCorrect = prediction.week3ShockOutcome === actualShockOutcome;
  const shockTxs = transactions
    .filter((tx) => tx.week === 3 && tx.type !== 'INCOME_INFLOW')
    .slice(0, 4)
    .map((tx) => tx.id);

  const stressedNames = ROOMMATE_ORDER.filter(
    (id) => roommateSummaries[id].experiencedLiquidityStress,
  ).map(
    (id) =>
      `${ROOMMATE_PROFILES[id].name} (min cash $${roommateSummaries[id].minWeeklyCash.toFixed(2)})`,
  );

  const item2: PredictionGradeItem = {
    field: 'week3ShockOutcome',
    title: '2. Week 3 Surprise Expense & Liquidity Survival',
    predictedLabel:
      prediction.week3ShockOutcome === 'all_solvent_buffered'
        ? 'All Roommates Stay Above $40 Stress Threshold'
        : 'Liquidity Crunch (< $40 Cash for >= 1 Roommate)',
    actualLabel:
      actualShockOutcome === 'all_solvent_buffered'
        ? 'All Roommates Stayed >= $40 (Buffered/Solvent)'
        : `Liquidity Crunch Triggered (${stressedNames.join(', ')})`,
    isCorrect: isShockCorrect,
    explanation:
      actualShockOutcome === 'liquidity_crunch'
        ? `During the Week 3 shock settlement (${shockTxs.join(', ')}), ${stressedNames.join(' and ')} dropped below the $40 Liquidity Stress threshold.`
        : `Every roommate remained above the $40 Liquidity Stress threshold across all 4 weeks (${shockTxs.join(', ')}); Devon’s minimum cash was $${roommateSummaries.devon.minWeeklyCash.toFixed(2)}.`,
    evidenceTransactionIds: shockTxs,
    assumptionNote: `Driven by devon.initialCash=$${runResult.assumptions.roommates.devon.initialCash}, devon.weeklyIncome=$${runResult.assumptions.roommates.devon.weeklyIncome}/wk, and Week 3 reserve absorption ($${runResult.weeklySnapshots[2].reserveUsedForSurprise.toFixed(2)}).`,
  };

  // 3. Largest Behavioral Shift
  const actualShiftId = runResult.largestBehavioralShiftId;
  const isShiftCorrect = prediction.behavioralShift === actualShiftId;
  const shiftTxs = transactions
    .filter(
      (tx) =>
        tx.roommateId === actualShiftId && tx.type !== 'INCOME_INFLOW',
    )
    .slice(0, 4)
    .map((tx) => tx.id);

  const item3: PredictionGradeItem = {
    field: 'behavioralShift',
    title: '3. Largest Incentive-Driven Behavioral Shift',
    predictedLabel: `${ROOMMATE_PROFILES[prediction.behavioralShift].name} ($${roommateSummaries[prediction.behavioralShift].behavioralShiftMagnitude.toFixed(2)} shift)`,
    actualLabel: `${ROOMMATE_PROFILES[actualShiftId].name} ($${roommateSummaries[actualShiftId].behavioralShiftMagnitude.toFixed(2)} shift — ${roommateSummaries[actualShiftId].primaryBehavioralDriver})`,
    isCorrect: isShiftCorrect,
    explanation: `${ROOMMATE_PROFILES[actualShiftId].name} exhibited the largest modeled behavioral shift ($${roommateSummaries[actualShiftId].behavioralShiftMagnitude.toFixed(2)}: ${roommateSummaries[actualShiftId].primaryBehavioralDriver}) in transactions ${shiftTxs.join(', ')}.`,
    evidenceTransactionIds: shiftTxs,
    assumptionNote: `Driven by ${actualShiftId}.freeRideTemptation=${runResult.assumptions.roommates[actualShiftId].freeRideTemptation.toFixed(2)}, ${actualShiftId}.auditSensitivity=${runResult.assumptions.roommates[actualShiftId].auditSensitivity.toFixed(2)}, and ${POLICIES[runResult.policyId].shortTitle}.`,
  };

  const items = [item1, item2, item3];
  const totalCorrect = items.filter((i) => i.isCorrect).length;

  const summaryHeadline =
    totalCorrect === 3
      ? '3/3 Predictions Confirmed by the Double-Entry Ledger!'
      : totalCorrect === 2
        ? '2/3 Predictions Matched — Inspect the 1 Counterintuitive Ledger Outcome!'
        : totalCorrect === 1
          ? '1/3 Predictions Matched — The Incentive Equations Revealed 2 Surprises!'
          : '0/3 Predictions Matched — A Classic Game-Theory Surprise! Audit the Ledger Below.';

  return {
    totalCorrect,
    maxScore: 3,
    summaryHeadline,
    items,
  };
}

/**
 * Runs two policies (or two assumption sets) against the EXACT SAME frozen
 * `ExternalEventSchedule` so the comparison isolates the policy/assumption delta
 * with zero RNG drift.
 */
export function comparePoliciesOnSameEvents(
  scenarioInput: ScenarioId | ScenarioDefinition,
  policyAInput: PolicyId | PolicyDefinition,
  policyBInput: PolicyId | PolicyDefinition,
  assumptionsA: HouseholdAssumptions,
  eventSchedule: ExternalEventSchedule,
  assumptionsB?: HouseholdAssumptions,
): PolicyComparisonResult {
  const runA = simulateHouseholdRun(
    scenarioInput,
    policyAInput,
    assumptionsA,
    eventSchedule,
  );
  const runB = simulateHouseholdRun(
    scenarioInput,
    policyBInput,
    assumptionsB ?? assumptionsA,
    eventSchedule,
  );

  const sameScheduleVerified =
    runA.scheduleSignature === runB.scheduleSignature &&
    runA.eventSchedule === runB.eventSchedule;

  const roommateDeltas = {} as Record<RoommateId, PolicyComparisonDelta>;
  for (const id of ROOMMATE_ORDER) {
    const sumA = runA.roommateSummaries[id];
    const sumB = runB.roommateSummaries[id];
    roommateDeltas[id] = {
      roommateId: id,
      name: sumA.name,
      endingCashA: sumA.endingCash,
      endingCashB: sumB.endingCash,
      cashDeltaBMinusA: Number((sumB.endingCash - sumA.endingCash).toFixed(2)),
      outOfPocketA: sumA.totalOutOfPocketPaid,
      outOfPocketB: sumB.totalOutOfPocketPaid,
      outOfPocketDeltaBMinusA: Number(
        (sumB.totalOutOfPocketPaid - sumA.totalOutOfPocketPaid).toFixed(2),
      ),
      trueConsumptionA: sumA.totalTrueUtilityConsumption,
      trueConsumptionB: sumB.totalTrueUtilityConsumption,
      consumptionDeltaBMinusA: Number(
        (
          sumB.totalTrueUtilityConsumption - sumA.totalTrueUtilityConsumption
        ).toFixed(2),
      ),
      underreportedA: sumA.totalUnderreportedGap,
      underreportedB: sumB.totalUnderreportedGap,
      trustA: sumA.endingTrust,
      trustB: sumB.endingTrust,
    };
  }

  const totalUtilityA = runA.weeklySnapshots.reduce(
    (s, w) => s + w.totalUtilityBill,
    0,
  );
  const totalUtilityB = runB.weeklySnapshots.reduce(
    (s, w) => s + w.totalUtilityBill,
    0,
  );
  const totalUtilityBillDeltaBMinusA = Number(
    (totalUtilityB - totalUtilityA).toFixed(2),
  );

  const endingReserveDeltaBMinusA = Number(
    (
      runB.conservation.endingHouseholdReserve -
      runA.conservation.endingHouseholdReserve
    ).toFixed(2),
  );

  const totalShortfallA = ROOMMATE_ORDER.reduce(
    (s, id) => s + runA.roommateSummaries[id].totalShortfallSurchargePaid,
    0,
  );
  const totalShortfallB = ROOMMATE_ORDER.reduce(
    (s, id) => s + runB.roommateSummaries[id].totalShortfallSurchargePaid,
    0,
  );
  const totalShortfallDeltaBMinusA = Number(
    (totalShortfallB - totalShortfallA).toFixed(2),
  );

  const totalAdminA = ROOMMATE_ORDER.reduce(
    (s, id) => s + runA.roommateSummaries[id].totalAdminFeePaid,
    0,
  );
  const totalAdminB = ROOMMATE_ORDER.reduce(
    (s, id) => s + runB.roommateSummaries[id].totalAdminFeePaid,
    0,
  );
  const totalAdminFeeDeltaBMinusA = Number(
    (totalAdminB - totalAdminA).toFixed(2),
  );

  const devonDelta = roommateDeltas.devon;
  const leoDelta = roommateDeltas.leo;

  const comparisonInsights = [
    {
      id: 'CMP-DEVON-LIQUIDITY',
      title: `Low-Income Liquidity Impact (Devon): ${devonDelta.cashDeltaBMinusA >= 0 ? '+' : ''}$${devonDelta.cashDeltaBMinusA.toFixed(2)} Ending Cash`,
      body: `On the identical 4-week external schedule (${runA.scheduleSignature}), Devon’s ending cash moved from $${devonDelta.endingCashA.toFixed(2)} under ${POLICIES[runA.policyId].shortTitle} to $${devonDelta.endingCashB.toFixed(2)} under ${POLICIES[runB.policyId].shortTitle}. Week 3 Reserve absorption changed from $${runA.weeklySnapshots[2].reserveUsedForSurprise.toFixed(2)} to $${runB.weeklySnapshots[2].reserveUsedForSurprise.toFixed(2)}.`,
      runATransactionIds: runA.transactions
        .filter((tx) => tx.roommateId === 'devon' && tx.week === 3)
        .map((tx) => tx.id),
      runBTransactionIds: runB.transactions
        .filter((tx) => tx.roommateId === 'devon' && tx.week === 3)
        .map((tx) => tx.id),
      assumptionAttribution: `Isolated strictly by policy change (${runA.policyId} -> ${runB.policyId}) with identical weather multipliers and Week 3 shock ($${runA.weeklySnapshots[2].surpriseExpenseAmount.toFixed(2)}).`,
    },
    {
      id: 'CMP-TOTAL-EFFICIENCY',
      title: `Household Consumption & Overhead Delta: ${totalUtilityBillDeltaBMinusA >= 0 ? '+' : ''}$${totalUtilityBillDeltaBMinusA.toFixed(2)} Utility Bill, ${totalAdminFeeDeltaBMinusA >= 0 ? '+' : ''}$${totalAdminFeeDeltaBMinusA.toFixed(2)} Admin Fee`,
      body: `Total 4-week utility consumption changed from $${totalUtilityA.toFixed(2)} to $${totalUtilityB.toFixed(2)} (${totalUtilityBillDeltaBMinusA >= 0 ? '+' : ''}$${totalUtilityBillDeltaBMinusA.toFixed(2)}), while Leo’s cumulative underreported gap shifted from $${leoDelta.underreportedA.toFixed(2)} to $${leoDelta.underreportedB.toFixed(2)} and external metering fees shifted by ${totalAdminFeeDeltaBMinusA >= 0 ? '+' : ''}$${totalAdminFeeDeltaBMinusA.toFixed(2)}.`,
      runATransactionIds: runA.transactions
        .filter((tx) => tx.type === 'UTILITY_VENDOR_PAYMENT')
        .map((tx) => tx.id),
      runBTransactionIds: runB.transactions
        .filter((tx) => tx.type === 'UTILITY_VENDOR_PAYMENT')
        .map((tx) => tx.id),
      assumptionAttribution: `Driven by marginalPriceSignal (${POLICIES[runA.policyId].marginalPriceSignal} vs ${POLICIES[runB.policyId].marginalPriceSignal}) and chargesMeteringAdminFee (${POLICIES[runA.policyId].chargesMeteringAdminFee} vs ${POLICIES[runB.policyId].chargesMeteringAdminFee}).`,
    },
  ];

  return {
    scenarioId: runA.scenarioId,
    sameScheduleVerified,
    scheduleSignature: runA.scheduleSignature,
    runA,
    runB,
    totalUtilityBillDeltaBMinusA,
    endingReserveDeltaBMinusA,
    totalShortfallDeltaBMinusA,
    totalAdminFeeDeltaBMinusA,
    roommateDeltas,
    comparisonInsights,
  };
}
