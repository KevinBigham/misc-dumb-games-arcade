// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyCommand,
  clearSavedState,
  computeEffectiveMultiplier,
  computeEffectiveStat,
  computePossessionProbabilities,
  computeStarterPostMatchFatigueDelta,
  computeTeamEffectiveRatings,
  CONFIG,
  createInitialState,
  getOpponentForFixture,
  getSeasonSummary,
  INITIAL_ROSTER,
  loadStateFromStorage,
   metadata,
  mountGame,
  OPPONENTS,
  parseSaveEnvelope,
  RECAP_TEMPLATES,
  runAutomatedSeason,
  runSeasonStrategyHarness,
  saveStateToStorage,
  serializeSaveEnvelope,
  simulateMatch,
  TACTICAL_PLANS,
} from '../src/index.ts';

describe('Game 01: One More Season — Comprehensive Verification Suite', () => {
  beforeEach(() => {
    clearSavedState();
  });

  it('validates content tables: 8 roster players, 6 opponents, 3 tactical plans, 12 recap templates', () => {
    expect(INITIAL_ROSTER).toHaveLength(8);
    expect(INITIAL_ROSTER.filter((p) => p.defaultStarter)).toHaveLength(5);
    expect(INITIAL_ROSTER.filter((p) => !p.defaultStarter)).toHaveLength(3);

    // First-two-minutes contract: Star attacker Kaelen Vance begins Fixture 1 tired (Fatigue 56)
    const starAttacker = INITIAL_ROSTER[0]!;
    expect(starAttacker.name).toBe('Kaelen Vance');
    expect(starAttacker.attack).toBeGreaterThanOrEqual(9);
    expect(starAttacker.initialFatigue).toBe(56);
    expect(starAttacker.defaultStarter).toBe(true);

    // 6 scheduled opponents with Fixture 1 vulnerable to Patient play
    expect(OPPONENTS).toHaveLength(6);
    const fixture1Opp = getOpponentForFixture(1);
    expect(fixture1Opp.tendency.vulnerableTo).toBe('Patient');
    expect(fixture1Opp.tendency.clubPlanModifier.Patient).toBeGreaterThan(
      fixture1Opp.tendency.clubPlanModifier.Aggressive,
    );

    // 3 tactical plans with exact base distributions
    expect(TACTICAL_PLANS).toHaveLength(3);
    expect(CONFIG.basePlanDistributions.Patient).toEqual({
      p0: 0.25,
      p3: 0.55,
      p7: 0.20,
    });
    expect(CONFIG.basePlanDistributions.Balanced).toEqual({
      p0: 0.35,
      p3: 0.35,
      p7: 0.30,
    });
    expect(CONFIG.basePlanDistributions.Aggressive).toEqual({
      p0: 0.50,
      p3: 0.10,
      p7: 0.40,
    });

    // 12 authored recap templates
    expect(RECAP_TEMPLATES).toHaveLength(12);
    const uniqueTemplateIds = new Set(RECAP_TEMPLATES.map((t) => t.id));
    expect(uniqueTemplateIds.size).toBe(12);
  });

  it('enforces exact mathematical formulas for fatigue, effective attributes, and ±15% probability shift clamp', () => {
    // 1 - fatigue / 200
    expect(computeEffectiveMultiplier(0)).toBeCloseTo(1.0, 6);
    expect(computeEffectiveMultiplier(56)).toBeCloseTo(0.72, 6);
    expect(computeEffectiveMultiplier(100)).toBeCloseTo(0.5, 6);
    expect(computeEffectiveStat(9, 56)).toBeCloseTo(6.48, 4);

    // Post-match starter fatigue gain: 24 - Stamina
    expect(computeStarterPostMatchFatigueDelta(5)).toBe(19);
    expect(computeStarterPostMatchFatigueDelta(8)).toBe(16);

    // Probability shift clamp ±15% and sum = 1.0
    const state = createInitialState(202601);
    const extremeLowFatigueRoster = state.roster.map((p) => ({
      ...p,
      attack: 10,
      control: 10,
      defense: 10,
      fatigue: 0,
    }));
    const highRatings = computeTeamEffectiveRatings(
      extremeLowFatigueRoster,
      state.selectedStarterIds,
    );
    const opp1 = getOpponentForFixture(1);

    for (const plan of ['Patient', 'Balanced', 'Aggressive'] as const) {
      const breakdown = computePossessionProbabilities({
        team: 'club',
        clubPlan: plan,
        teamRatings: highRatings,
        opponent: opp1,
      });
      expect(breakdown.totalShift).toBeLessThanOrEqual(0.15);
      expect(breakdown.totalShift).toBeGreaterThanOrEqual(-0.15);
      expect(breakdown.probabilities.p0).toBeGreaterThanOrEqual(0);
      expect(breakdown.probabilities.p3).toBeGreaterThanOrEqual(0);
      expect(breakdown.probabilities.p7).toBeGreaterThanOrEqual(0);
      expect(
        breakdown.probabilities.p0 +
          breakdown.probabilities.p3 +
          breakdown.probabilities.p7,
      ).toBeCloseTo(1.0, 6);
    }
  });

  it('enforces preparation point rules: max 2 points, max 1 action per player, Rest -24, Train +1 stat & +8 fatigue', () => {
    let state = createInitialState(202601);
    expect(state.prepPointsRemaining).toBe(2);

    // Rest Kaelen Vance (p1): 56 -> 32 fatigue
    state = applyCommand(state, { type: 'SPEND_PREP_REST', playerId: 'p1' });
    const p1 = state.roster.find((p) => p.id === 'p1')!;
    expect(p1.fatigue).toBe(32);
    expect(state.prepPointsRemaining).toBe(1);

    // Cannot apply a second prep action to p1 in the same fixture
    expect(() =>
      applyCommand(state, {
        type: 'SPEND_PREP_TRAIN',
        playerId: 'p1',
        attribute: 'attack',
      }),
    ).toThrow(/at most one preparation action/i);

    // Train Mira Solis (p2) Control: 9 -> 10, fatigue 10 -> 18
    state = applyCommand(state, {
      type: 'SPEND_PREP_TRAIN',
      playerId: 'p2',
      attribute: 'control',
    });
    const p2 = state.roster.find((p) => p.id === 'p2')!;
    expect(p2.control).toBe(10);
    expect(p2.fatigue).toBe(18);
    expect(state.prepPointsRemaining).toBe(0);

    // No 3rd prep point allowed
    expect(() =>
      applyCommand(state, { type: 'SPEND_PREP_REST', playerId: 'p3' }),
    ).toThrow(/no preparation points remaining/i);
  });

  it('demonstrates fatigue and tactical plan directly shifting possession probabilities and outcomes on fixed RNG rolls', () => {
    const baseState = createInitialState(202601);

    // Unprepared tired lineup using Aggressive against Cinderwick (vulnerable to Patient)
    const tiredSim = simulateMatch({
      fixtureNumber: 1,
      roster: baseState.roster.map((p) => ({ ...p, fatigue: 80 })),
      starterIds: baseState.selectedStarterIds,
      clubPlan: 'Aggressive',
      prepActions: [],
      rngState: 202601,
    });

    // Fresh/rested lineup using Patient against Cinderwick on the exact same RNG seed
    let preppedState = applyCommand(baseState, {
      type: 'SPEND_PREP_REST',
      playerId: 'p1',
    });
    preppedState = applyCommand(preppedState, {
      type: 'SPEND_PREP_TRAIN',
      playerId: 'p2',
      attribute: 'control',
    });
    const restedSim = simulateMatch({
      fixtureNumber: 1,
      roster: preppedState.roster,
      starterIds: preppedState.selectedStarterIds,
      clubPlan: 'Patient',
      prepActions: preppedState.prepActionsThisFixture,
      rngState: 202601,
    });

    // Verify the identical 16 random rolls were drawn in both matches
    expect(
      tiredSim.matchResult.possessions.map((p) => p.roll),
    ).toEqual(restedSim.matchResult.possessions.map((p) => p.roll));

    // Verify rested + counter-plan achieves higher totalShift and scores more points
    expect(
      restedSim.matchResult.possessions[0]!.totalShift,
    ).toBeGreaterThan(tiredSim.matchResult.possessions[0]!.totalShift);
    expect(restedSim.matchResult.clubScore).toBeGreaterThan(
      tiredSim.matchResult.clubScore,
    );
  });

  it('guarantees determinism: identical seed and command sequence produce identical season & possession logs', () => {
    const runA = runAutomatedSeason(202601, 'Rotated Patient Matchup');
    const runB = runAutomatedSeason(202601, 'Rotated Patient Matchup');

    expect(runA.finalState.rngState).toBe(runB.finalState.rngState);
    expect(runA.wins).toBe(runB.wins);
    expect(runA.totalPointsFor).toBe(runB.totalPointsFor);
    expect(runA.finalState.seasonHistory).toEqual(runB.finalState.seasonHistory);
  });

  it('verifies post-match fatigue update, idempotency on save/reload, and single zero-fatigue post-match development choice', () => {
    let state = createInitialState(202601);
    const p1Before = state.roster.find((p) => p.id === 'p1')!; // Starter, fatigue 56, stamina 5 -> +19 -> 75
    const p6Before = state.roster.find((p) => p.id === 'p6')!; // Reserve, fatigue 0 -> -18 clamped to 0

    // Set reserve p6 to 30 fatigue to verify -18 recovery -> 12
    state.roster.find((p) => p.id === 'p6')!.fatigue = 30;

    state = applyCommand(state, { type: 'COMMIT_MATCH' });
    expect(state.phase).toBe('match_review');
    expect(state.currentMatch?.fatigueApplied).toBe(true);
    expect(state.currentMatch?.possessions).toHaveLength(16);
    expect(state.currentMatch?.decisiveEvents).toHaveLength(3);

    const p1After = state.roster.find((p) => p.id === 'p1')!;
    const p6After = state.roster.find((p) => p.id === 'p6')!;
    expect(p1After.fatigue).toBe(p1Before.fatigue + (24 - p1Before.stamina)); // 56 + 19 = 75
    expect(p6After.fatigue).toBe(12); // 30 - 18 = 12

    // Save and reload in match_review: fatigue must NOT be applied a second time
    saveStateToStorage(state);
    const reloaded = loadStateFromStorage(202601);
    expect(reloaded.loadedFromSave).toBe(true);
    expect(reloaded.state.roster.find((p) => p.id === 'p1')!.fatigue).toBe(75);
    expect(reloaded.state.currentMatch?.fatigueApplied).toBe(true);

    // Proceed to post-match development (Fixture 1)
    let devState = applyCommand(reloaded.state, { type: 'PROCEED_FROM_MATCH' });
    expect(devState.phase).toBe('development');

    // Apply +1 Attack to Juno Reyes (p6) at zero fatigue cost
    const p6FatigueBeforeDev = devState.roster.find((p) => p.id === 'p6')!.fatigue;
    const p6AttackBeforeDev = devState.roster.find((p) => p.id === 'p6')!.attack;
    devState = applyCommand(devState, {
      type: 'APPLY_DEVELOPMENT',
      playerId: 'p6',
      attribute: 'attack',
    });

    const p6AfterDev = devState.roster.find((p) => p.id === 'p6')!;
    expect(p6AfterDev.attack).toBe(p6AttackBeforeDev + 1);
    expect(p6AfterDev.fatigue).toBe(p6FatigueBeforeDev); // Zero fatigue cost!
    expect(devState.fixtureNumber).toBe(2);
    expect(devState.phase).toBe('preparation');
    expect(devState.prepPointsRemaining).toBe(2); // Unspent points never carry over; reset to 2
  });

  it('recovers gracefully from corrupted save JSON in localStorage', () => {
    window.localStorage.setItem(
      'argon_game01_one_more_season_save_v1',
      '{corrupted-json',
    );
    const loaded = loadStateFromStorage(202605);
    expect(loaded.loadedFromSave).toBe(false);
    expect(loaded.recoveredFromError).toMatch(/corrupted/i);
    expect(loaded.state.seed).toBe(202605);
    expect(loaded.state.fixtureNumber).toBe(1);

    // Also verify serialize/parse roundtrip
    const raw = serializeSaveEnvelope(loaded.state);
    const parsed = parseSaveEnvelope(raw);
    expect(parsed.seed).toBe(202605);
  });

  it('verifies both contrasting strategies reach >= 4 wins on documented seeds while Neglectful Exhaustion loses (<= 3 wins)', () => {
    const harness = runSeasonStrategyHarness(CONFIG.documentedStrategySeeds);

    for (const res of harness.rotatedPatient) {
      expect(res.wins).toBeGreaterThanOrEqual(4);
      expect(res.succeeded).toBe(true);
      expect(res.finalState.phase).toBe('season_recap');
    }

    for (const res of harness.starAggressive) {
      expect(res.wins).toBeGreaterThanOrEqual(4);
      expect(res.succeeded).toBe(true);
      expect(res.finalState.phase).toBe('season_recap');
    }

    // Tradeoff verification: Rotated Patient Matchup maintains lower average starter fatigue than Star-Heavy Aggressive Push
    const avgFatigueRotated =
      harness.rotatedPatient.reduce((s, r) => s + r.averageStarterFatigue, 0) /
      harness.rotatedPatient.length;
    const avgFatigueAggressive =
      harness.starAggressive.reduce((s, r) => s + r.averageStarterFatigue, 0) /
      harness.starAggressive.length;
    expect(avgFatigueRotated).toBeLessThan(avgFatigueAggressive);

    // Verify losing season path (<= 3 wins) reaches season_recap cleanly with succeeded === false
    const losingRun = runAutomatedSeason(202601, 'Neglectful Exhaustion');
    expect(losingRun.finalState.phase).toBe('season_recap');
    expect(losingRun.wins).toBeLessThanOrEqual(3);
    expect(losingRun.succeeded).toBe(false);
    const summary = getSeasonSummary(losingRun.finalState);
    expect(summary.isComplete).toBe(true);
    expect(summary.succeeded).toBe(false);
  });

  it('mounts the interactive UI in DOM, supports prep & match flow, debug toggle, and cleanly destroys', () => {
    expect(metadata.id).toBe('01-one-more-season');
    const container = document.createElement('div');
    document.body.appendChild(container);

    const instance = mountGame(container, { initialSeed: 202601, debug: false });
    expect(container.textContent).toContain('Ironvale Rovers FC');
    expect(container.textContent).toContain('Cinderwick Athletic');
    expect(container.textContent).toContain('Kaelen Vance');

    // Toggle debug mode via ArgonGameInstance contract
    instance.toggleDebug?.(true);
    expect(
      container.querySelector('[data-testid="debug-inspector"]'),
    ).not.toBeNull();

    // Click Commit Match button
    const commitBtn = container.querySelector(
      '[data-testid="commit-match-btn"]',
    ) as HTMLButtonElement;
    expect(commitBtn).not.toBeNull();
    commitBtn.click();

    // Verify transition to match_review and 3 decisive event cards rendered
    const decisiveCards = container.querySelectorAll(
      '[data-testid="decisive-event-card"]',
    );
    expect(decisiveCards).toHaveLength(3);

    instance.destroy();
    expect(container.innerHTML).toBe('');
    container.remove();
  });
});
