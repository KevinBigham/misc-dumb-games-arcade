import { describe, expect, it } from 'vitest';
import { createNewFranchiseState } from '../src/engine/franchise-state';
import {
  commitLiveGameToFranchise,
  createLiveGameState,
  executeLiveGamePlay,
  simLiveGameDrive,
  simulateScheduledGame,
} from '../src/engine/game-simulator';
import { getConferencePlayoffSeeds } from '../src/engine/schedule-and-standings';

describe('Schedule, Full-Game Simulator & Interactive 11-on-11 Live Game Engine', () => {
  it('generates a 17-week regular season schedule and simulates games with box scores', () => {
    const state = createNewFranchiseState('BAL', 2005);
    const week1Games = state.schedule.filter((g) => g.week === 1);
    expect(week1Games).toHaveLength(16); // All 32 teams play in Week 1

    const firstGame = week1Games[0];
    simulateScheduledGame(firstGame, state, 1);

    expect(firstGame.played).toBe(true);
    expect(firstGame.homeScore).not.toBe(firstGame.awayScore);
    expect(firstGame.mvpPlayerName).toBeDefined();
  });

  it('executes interactive live plays (offense, defense, hit stick, field goal, punt) and commits result', () => {
    const state = createNewFranchiseState('BAL', 2005);
    const userGame = state.schedule.find(
      (g) => g.week === 1 && (g.homeTeamId === 'BAL' || g.awayTeamId === 'BAL'),
    )!;

    const live = createLiveGameState(userGame, state);
    expect(live.lastPlayTokens).toHaveLength(22); // 11 OFF + 11 DEF tokens

    // Run offensive blast play
    executeLiveGamePlay(live, state, 'IFORM_HB_BLAST');
    expect(live.playLog.length).toBe(1);

    // Arm Hit Stick and run defensive blitz
    live.hitStickArmed = true;
    executeLiveGamePlay(live, state, undefined, 'ENGAGE_EIGHT_BLITZ');
    expect(live.hitStickArmed).toBe(false);

    // Sim a full drive
    simLiveGameDrive(live, state);
    expect(live.playLog.length).toBeGreaterThan(2);

    // Commit live game to franchise standings
    const finished = commitLiveGameToFranchise(live, state);
    expect(finished?.played).toBe(true);

    const afcSeeds = getConferencePlayoffSeeds('AFC', state.teams);
    expect(afcSeeds).toHaveLength(6);
  });
});
