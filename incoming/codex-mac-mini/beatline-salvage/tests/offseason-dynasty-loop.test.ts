import { describe, expect, it } from 'vitest';
import { createNewFranchiseState } from '../src/engine/franchise-state';
import {
  advanceFranchiseWeekOrStage,
  executeTrainingCampDrill,
  makeDraftSelection,
  scoutDraftProspect,
} from '../src/engine/trades-contracts-offseason';

describe('Full Season, Playoff Bracket & 5-Stage Offseason Dynasty Pipeline', () => {
  it('advances through Weeks 1-17, Playoffs (WC/DIV/CONF/BOWL), and all 5 Offseason stages into Season 2005', () => {
    const state = createNewFranchiseState('BAL', 2005);

    // Advance through 17 Regular Season weeks
    for (let w = 1; w <= 17; w++) {
      advanceFranchiseWeekOrStage(state);
    }
    expect(state.phase).toBe('PLAYOFFS');
    expect(state.week).toBe(18); // Wild Card

    // Advance Wild Card (18), Divisional (19), Conf (20), Bowl (21)
    advanceFranchiseWeekOrStage(state); // -> 19
    expect(state.week).toBe(19);
    advanceFranchiseWeekOrStage(state); // -> 20
    expect(state.week).toBe(20);
    advanceFranchiseWeekOrStage(state); // -> 21 (Championship Bowl)
    expect(state.week).toBe(21);

    // Complete Championship Bowl -> Enter OFFSEASON_AWARDS
    advanceFranchiseWeekOrStage(state);
    expect(state.phase).toBe('OFFSEASON_AWARDS');
    expect(state.championsHistory).toHaveLength(1);
    expect(state.seasonAwards.length).toBeGreaterThanOrEqual(3);

    // Stage 1 -> Stage 2 (OFFSEASON_RESIGN)
    advanceFranchiseWeekOrStage(state);
    expect(state.phase).toBe('OFFSEASON_RESIGN');

    // Stage 2 -> Stage 3 (OFFSEASON_FREE_AGENCY)
    advanceFranchiseWeekOrStage(state);
    expect(state.phase).toBe('OFFSEASON_FREE_AGENCY');

    // Stage 3 -> Stage 4 (OFFSEASON_DRAFT)
    advanceFranchiseWeekOrStage(state);
    expect(state.phase).toBe('OFFSEASON_DRAFT');
    expect(state.activeDraft).not.toBeNull();

    // Scout a prospect and make a user draft selection
    const unscouted = state.players.find(
      (p) => p.teamId === 'DRAFT' && p.scoutedLevel < 2,
    );
    if (unscouted) {
      const scoutRes = scoutDraftProspect(state, unscouted.id);
      expect(scoutRes.success).toBe(true);
    }

    const pickRes = makeDraftSelection(state);
    expect(pickRes.success).toBe(true);

    // Stage 4 -> Stage 5 (OFFSEASON_TRAINING_CAMP)
    advanceFranchiseWeekOrStage(state);
    expect(state.phase).toBe('OFFSEASON_TRAINING_CAMP');
    expect(state.campDrillsRemaining).toBe(4);

    // Run a Hit Stick Alley drill on Ray Lewis!
    const rayLewis = state.players.find(
      (p) => p.teamId === 'BAL' && p.position === 'LB',
    )!;
    const drillRes = executeTrainingCampDrill(
      state,
      'DRILL_HIT_STICK_ALLEY',
      rayLewis.id,
    );
    expect(drillRes.success).toBe(true);
    expect(state.campDrillsRemaining).toBe(3);

    // Stage 5 -> New Season Kickoff (2005 Season, Week 1)
    advanceFranchiseWeekOrStage(state);
    expect(state.season).toBe(2005);
    expect(state.week).toBe(1);
    expect(state.phase).toBe('REGULAR_SEASON');
    expect(state.salaryCapM).toBe(85.0);
  });
});
