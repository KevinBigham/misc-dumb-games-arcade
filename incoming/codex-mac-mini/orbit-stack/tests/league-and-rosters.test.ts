import { describe, expect, it } from 'vitest';
import { createNewFranchiseState } from '../src/engine/franchise-state';
import {
  getTeamCapRoomM,
  getTeamCapUsedM,
  getTeamRatings,
} from '../src/engine/rosters-and-generator';

describe('Madden 2005 Franchise League & Roster Initialization', () => {
  it('initializes all 32 NFL teams across AFC and NFC divisions under the $80.5M salary cap', () => {
    const state = createNewFranchiseState('BAL', 2005);

    expect(state.teams).toHaveLength(32);
    expect(state.salaryCapM).toBe(80.5);
    expect(state.season).toBe(2004);
    expect(state.week).toBe(1);

    const afcTeams = state.teams.filter((t) => t.conference === 'AFC');
    const nfcTeams = state.teams.filter((t) => t.conference === 'NFC');
    expect(afcTeams).toHaveLength(16);
    expect(nfcTeams).toHaveLength(16);

    for (const team of state.teams) {
      const capUsed = getTeamCapUsedM(team, state.players);
      const capRoom = getTeamCapRoomM(team, state.players, state.salaryCapM);
      expect(capUsed).toBeLessThanOrEqual(state.salaryCapM);
      expect(capRoom).toBeGreaterThan(2);

      const ratings = getTeamRatings(team.id, state.players);
      expect(ratings.overall).toBeGreaterThanOrEqual(65);
      expect(ratings.overall).toBeLessThanOrEqual(99);
    }
  });

  it('includes iconic 2004-2005 star players and a 64-player NCAA Combine draft class', () => {
    const state = createNewFranchiseState('BAL', 2005);

    const rayLewis = state.players.find(
      (p) => p.teamId === 'BAL' && p.lastName === 'Lewis' && p.position === 'LB',
    );
    expect(rayLewis).toBeDefined();
    expect(rayLewis?.overall).toBe(99);
    expect(rayLewis?.trait).toBe('Hit Stick Enforcer');

    const peyton = state.players.find(
      (p) => p.teamId === 'IND' && p.lastName === 'Manning' && p.position === 'QB',
    );
    expect(peyton?.overall).toBe(99);

    const freeAgents = state.players.filter((p) => p.teamId === 'FA');
    const draftProspects = state.players.filter((p) => p.teamId === 'DRAFT');

    expect(freeAgents.length).toBeGreaterThanOrEqual(35);
    expect(draftProspects).toHaveLength(64);
    expect(draftProspects[0].combine?.fortyYardDash).toBeGreaterThan(4.1);
  });
});
