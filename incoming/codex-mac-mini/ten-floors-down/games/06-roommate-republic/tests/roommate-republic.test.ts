// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';
import {
  allocateCentsByWeights,
  buildLedgerExplanations,
  clearPersistedState,
  comparePoliciesOnSameEvents,
  createDefaultAssumptions,
  createDefaultPersistedState,
  exportStateToJson,
  GAME_CONFIG,
  generateExternalEventSchedule,
  gradePrediction,
  importStateFromJson,
  loadPersistedState,
  metadata,
  mountGame,
  POLICIES,
  POLICY_LIST,
  ROOMMATE_ORDER,
  savePersistedState,
  SCENARIOS,
  SCENARIO_LIST,
  simulateHouseholdRun,
} from '../src/index.ts';

describe('Game 06: Roommate Republic — Simulation, Conservation & Counterfactual Suite', () => {
  beforeEach(() => {
    clearPersistedState();
  });

  it('exposes valid ArgonGameMetadata and ArgonGameModule contract', () => {
    expect(metadata.id).toBe('06-roommate-republic');
    expect(metadata.number).toBe(6);
    expect(metadata.title).toBe('Roommate Republic');
    expect(typeof mountGame).toBe('function');
  });

  it('allocates cents by weights using Largest Remainder with zero rounding loss', () => {
    const primeCents = 10003; // $100.03 split across unequal weights
    const shares = allocateCentsByWeights(primeCents, {
      maya: 280,
      devon: 145,
      priya: 445,
      leo: 330,
    });
    const sum = shares.maya + shares.devon + shares.priya + shares.leo;
    expect(sum).toBe(primeCents);
  });

  it('enforces strict money conservation across all 3 scenarios and all 4 policies', () => {
    const seeds = [202606, 404, 99991];

    for (const seed of seeds) {
      for (const scenario of SCENARIO_LIST) {
        const schedule = generateExternalEventSchedule(scenario.id, seed);
        expect(schedule.weeks).toHaveLength(4);
        expect(schedule.weeks[0].surpriseExpense).toBeNull();
        expect(schedule.weeks[1].surpriseExpense).toBeNull();
        expect(schedule.weeks[2].surpriseExpense).not.toBeNull();
        expect(schedule.weeks[3].surpriseExpense).toBeNull();

        for (const policy of POLICY_LIST) {
          const assumptions = createDefaultAssumptions();
          const run = simulateHouseholdRun(
            scenario,
            policy,
            assumptions,
            schedule,
          );

          const c = run.conservation;
          expect(c.isConserved).toBe(true);
          expect(c.discrepancyCents).toBe(0);
          expect(c.discrepancyDollars).toBe(0);

          // Check explicit formula 1: initialCash + totalIncome - totalExpenses === finalRoommateCash + finalHouseholdReserve
          const lhs1 = Number(
            (c.initialCash + c.totalIncome - c.totalExpenses).toFixed(2),
          );
          const rhs1 = Number(
            (c.finalRoommateCash + c.finalHouseholdReserve).toFixed(2),
          );
          expect(lhs1).toBe(rhs1);

          // Check explicit formula 2: totalInflows - totalOutflows === endingRoommateCash + endingHouseholdReserve
          const lhs2 = Number((c.totalInflows - c.totalOutflows).toFixed(2));
          const rhs2 = Number(
            (c.endingRoommateCash + c.endingHouseholdReserve).toFixed(2),
          );
          expect(lhs2).toBe(rhs2);

          // Cross-check directly from raw ledger transactions
          const rawInflowsCents = run.transactions
            .filter((tx) => tx.flowCategory === 'EXTERNAL_INFLOW')
            .reduce((acc, tx) => acc + tx.amountCents, 0);
          const rawOutflowsCents = run.transactions
            .filter((tx) => tx.flowCategory === 'EXTERNAL_OUTFLOW')
            .reduce((acc, tx) => acc + tx.amountCents, 0);
          const rawInitialCents = Math.round(c.initialCash * 100);
          const rawEndingRoommateCents = ROOMMATE_ORDER.reduce(
            (acc, rId) =>
              acc + Math.round(run.roommateSummaries[rId].endingCash * 100),
            0,
          );
          const rawEndingReserveCents = Math.round(
            c.endingHouseholdReserve * 100,
          );

          expect(rawInitialCents + rawInflowsCents - rawOutflowsCents).toBe(
            rawEndingRoommateCents + rawEndingReserveCents,
          );
        }
      }
    }
  });

  it('replays the exact same ExternalEventSchedule across policy comparisons while isolating policy mechanics', () => {
    const schedule = generateExternalEventSchedule(
      'scenario-1-thermostat',
      202606,
    );
    const assumptions = createDefaultAssumptions();

    // Compare Policy 1 (Equal Split) vs Policy 2 (Income-Proportional + 10% Reserve)
    const cmp12 = comparePoliciesOnSameEvents(
      'scenario-1-thermostat',
      'policy-1-equal-split',
      'policy-2-income-reserve',
      assumptions,
      schedule,
    );

    expect(cmp12.sameScheduleVerified).toBe(true);
    expect(cmp12.runA.eventSchedule).toBe(cmp12.runB.eventSchedule);
    expect(cmp12.runA.weeklySnapshots[2].surpriseExpenseAmount).toBe(
      cmp12.runB.weeklySnapshots[2].surpriseExpenseAmount,
    );

    // Under Policy 1, Devon suffers liquidity stress (< $40); under Policy 2, Devon has higher ending cash and no liquidity stress
    expect(cmp12.runA.roommateSummaries.devon.experiencedLiquidityStress).toBe(
      true,
    );
    expect(cmp12.runB.roommateSummaries.devon.experiencedLiquidityStress).toBe(
      false,
    );
    expect(cmp12.roommateDeltas.devon.cashDeltaBMinusA).toBeGreaterThan(100);

    // Policy 2 absorbs part or all of the Week 3 Surprise Expense from the Shared Reserve
    expect(cmp12.runA.weeklySnapshots[2].reserveUsedForSurprise).toBe(0);
    expect(
      cmp12.runB.weeklySnapshots[2].reserveUsedForSurprise,
    ).toBeGreaterThan(0);

    // Compare Policy 3 (Self-Reported Billing) vs Policy 4 (Metered Usage + Chore-Credit Rebate)
    const schedule2 = generateExternalEventSchedule(
      'scenario-2-grocery-jar',
      202606,
    );
    const cmp34 = comparePoliciesOnSameEvents(
      'scenario-2-grocery-jar',
      'policy-3-self-reported',
      'policy-4-metered-rebate',
      assumptions,
      schedule2,
    );

    expect(cmp34.sameScheduleVerified).toBe(true);
    // Under Policy 3, Leo underreports usage and triggers SHORTFALL_SURCHARGE transactions
    expect(cmp34.runA.roommateSummaries.leo.totalUnderreportedGap).toBeGreaterThan(
      80,
    );
    expect(
      cmp34.runA.transactions.some((tx) => tx.type === 'SHORTFALL_SURCHARGE'),
    ).toBe(true);

    // Under Policy 4, underreporting is 0, ADMIN_METERING_FEE ($64 total) and CHORE_REBATE_TRANSFER are recorded
    expect(cmp34.runB.roommateSummaries.leo.totalUnderreportedGap).toBe(0);
    expect(
      cmp34.runB.transactions.some((tx) => tx.type === 'SHORTFALL_SURCHARGE'),
    ).toBe(false);
    expect(
      cmp34.runB.transactions.some((tx) => tx.type === 'ADMIN_METERING_FEE'),
    ).toBe(true);
    expect(
      cmp34.runB.transactions.some((tx) => tx.type === 'CHORE_REBATE_TRANSFER'),
    ).toBe(true);
  });

  it('ensures every generated explanation cites valid recorded transaction IDs and model assumptions', () => {
    for (const scenario of SCENARIO_LIST) {
      const schedule = generateExternalEventSchedule(scenario.id, 777);
      for (const policy of POLICY_LIST) {
        const run = simulateHouseholdRun(
          scenario,
          policy,
          createDefaultAssumptions(),
          schedule,
        );
        const txIdSet = new Set(run.transactions.map((t) => t.id));
        const explanations = buildLedgerExplanations(run);

        expect(explanations.length).toBeGreaterThanOrEqual(4);
        for (const exp of explanations) {
          expect(exp.transactionIds.length).toBeGreaterThan(0);
          for (const citedId of exp.transactionIds) {
            expect(txIdSet.has(citedId)).toBe(true);
          }
          expect(exp.assumptionRefs.length).toBeGreaterThan(0);
          expect(exp.modelLimitationNote).toContain('Model Assumption Note:');
        }
      }
    }
  });

  it('accurately grades player predictions against simulated ledger outcomes', () => {
    const schedule = generateExternalEventSchedule(
      'scenario-1-thermostat',
      GAME_CONFIG.DEFAULT_SEED,
    );
    const run = simulateHouseholdRun(
      SCENARIOS['scenario-1-thermostat'],
      POLICIES['policy-1-equal-split'],
      createDefaultAssumptions(),
      schedule,
    );

    const txIdSet = new Set(run.transactions.map((t) => t.id));

    const exactPrediction = {
      highestNetPayer: run.highestNetPayerId,
      week3ShockOutcome: run.anyLiquidityStress
        ? ('liquidity_crunch' as const)
        : ('all_solvent_buffered' as const),
      behavioralShift: run.largestBehavioralShiftId,
    };

    const perfectGrade = gradePrediction(exactPrediction, run);
    expect(perfectGrade.totalCorrect).toBe(3);
    for (const item of perfectGrade.items) {
      expect(item.isCorrect).toBe(true);
      expect(item.evidenceTransactionIds.length).toBeGreaterThan(0);
      for (const id of item.evidenceTransactionIds) {
        expect(txIdSet.has(id)).toBe(true);
      }
    }

    const wrongPrediction = {
      highestNetPayer:
        run.highestNetPayerId === 'maya' ? ('devon' as const) : ('maya' as const),
      week3ShockOutcome: run.anyLiquidityStress
        ? ('all_solvent_buffered' as const)
        : ('liquidity_crunch' as const),
      behavioralShift:
        run.largestBehavioralShiftId === 'devon'
          ? ('maya' as const)
          : ('devon' as const),
    };

    const zeroGrade = gradePrediction(wrongPrediction, run);
    expect(zeroGrade.totalCorrect).toBe(0);
  });

  it('persists and reloads predictions, frozen schedules, and custom assumptions via localStorage & JSON export', () => {
    const state = createDefaultPersistedState(5150);
    state.activeScenarioId = 'scenario-3-boiler-emergency';
    state.activePolicyId = 'policy-2-income-reserve';
    state.comparisonPolicyId = 'policy-4-metered-rebate';
    state.predictionsByScenario['scenario-3-boiler-emergency'] = {
      highestNetPayer: 'priya',
      week3ShockOutcome: 'all_solvent_buffered',
      behavioralShift: 'priya',
    };
    state.committedPredictionsByScenario['scenario-3-boiler-emergency'] = true;
    state.assumptionsByScenario[
      'scenario-3-boiler-emergency'
    ].roommates.leo.freeRideTemptation = 0.25;
    state.debriefAnswers['debrief-1-commons-vs-reserve'] = 'opt-1a';

    const saved = savePersistedState(state);
    expect(saved).toBe(true);

    const loaded = loadPersistedState(999);
    expect(loaded.seed).toBe(5150);
    expect(loaded.activeScenarioId).toBe('scenario-3-boiler-emergency');
    expect(loaded.activePolicyId).toBe('policy-2-income-reserve');
    expect(loaded.comparisonPolicyId).toBe('policy-4-metered-rebate');
    expect(
      loaded.committedPredictionsByScenario['scenario-3-boiler-emergency'],
    ).toBe(true);
    expect(
      loaded.assumptionsByScenario['scenario-3-boiler-emergency'].roommates.leo
        .freeRideTemptation,
    ).toBe(0.25);
    expect(
      loaded.frozenSchedulesByScenario['scenario-3-boiler-emergency']
        .scheduleSignature,
    ).toBe(
      state.frozenSchedulesByScenario['scenario-3-boiler-emergency']
        .scheduleSignature,
    );

    const exported = exportStateToJson(loaded);
    const reimported = importStateFromJson(exported);
    expect(reimported).not.toBeNull();
    expect(reimported?.seed).toBe(5150);
    expect(reimported?.debriefAnswers['debrief-1-commons-vs-reserve']).toBe(
      'opt-1a',
    );
  });

  it('mounts interactive UI, commits predictions, switches policies, and highlights ledger rows cleanly', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, { initialSeed: 202606, debug: false });
    expect(container.textContent).toContain('Roommate Republic');
    expect(container.textContent).toContain('100% CONSERVED ✓');

    // Commit prediction & run button
    const commitBtn = container.querySelector<HTMLButtonElement>(
      '[data-action="commit-and-run"]',
    );
    expect(commitBtn).not.toBeNull();
    commitBtn?.click();

    const snap1 = instance.getStateSnapshot?.() as any;
    expect(
      snap1.persisted.committedPredictionsByScenario['scenario-1-thermostat'],
    ).toBe(true);

    // Switch comparison policy to Policy 4
    const compBtn = container.querySelector<HTMLButtonElement>(
      '[data-action="select-comparison-policy"][data-policy-id="policy-4-metered-rebate"]',
    );
    expect(compBtn).not.toBeNull();
    compBtn?.click();

    const snap2 = instance.getStateSnapshot?.() as any;
    expect(snap2.persisted.comparisonPolicyId).toBe('policy-4-metered-rebate');
    expect(snap2.comparisonResult.sameScheduleVerified).toBe(true);

    // Click a transaction chip to highlight row in ledger
    const txChip = container.querySelector<HTMLButtonElement>(
      '[data-action="focus-tx"]',
    );
    expect(txChip).not.toBeNull();
    const targetTxId = txChip?.dataset.txId;
    txChip?.click();
    const highlightedRow = container.querySelector(`#row-${targetTxId}`);
    expect(highlightedRow?.classList.contains('rr-tx-highlighted')).toBe(true);

    // Toggle Debug Drawer
    instance.toggleDebug?.(true);
    expect(container.textContent).toContain('DEBUG INSPECTOR [D]');

    instance.destroy();
    expect(container.innerHTML).toBe('');
    container.remove();
  });
});
