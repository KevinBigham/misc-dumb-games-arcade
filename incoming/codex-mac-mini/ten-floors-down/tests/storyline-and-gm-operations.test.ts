import { describe, expect, it } from 'vitest';
import {
  createNewFranchiseState,
  updateOwnerPricing,
  upgradeCoachStaffMember,
} from '../src/engine/franchise-state';
import { answerTonyBrunoPoll } from '../src/engine/storyline-central';
import {
  applyFranchiseTagToPlayer,
  changePlayerDepthOrder,
  evaluateTradeProposal,
  executeTradeProposal,
  releasePlayerToFreeAgency,
  signOrExtendPlayerContract,
} from '../src/engine/trades-contracts-offseason';

describe('Storyline Central, Tony Bruno Radio, Contracts, Trades & Owner Mode', () => {
  it('processes Tony Bruno Radio polls and updates morale/fan support/cash', () => {
    const state = createNewFranchiseState('BAL', 2005);
    const segment = state.radioSegments[0];
    expect(segment).toBeDefined();

    const opt = segment.pollOptions[0];
    const res = answerTonyBrunoPoll(state, segment.id, opt.id);
    expect(res.success).toBe(true);
    expect(segment.selectedOptionId).toBe(opt.id);
  });

  it('handles Depth Chart reordering, Contract Extensions, Franchise Tag, and Free Agent signing', () => {
    const state = createNewFranchiseState('BAL', 2005);
    const balQBs = state.players
      .filter((p) => p.teamId === 'BAL' && p.position === 'QB')
      .sort((a, b) => a.depthOrder - b.depthOrder);

    expect(balQBs.length).toBeGreaterThanOrEqual(2);
    const backupId = balQBs[1].id;
    const moveRes = changePlayerDepthOrder(state, backupId, 'UP');
    expect(moveRes.success).toBe(true);

    // Apply Franchise Tag
    const tagRes = applyFranchiseTagToPlayer(state, balQBs[0].id);
    expect(tagRes.success).toBe(true);
    expect(state.franchiseTagUsedThisOffseason).toBe(true);

    // Sign a Free Agent with a generous offer
    const fa = state.players.find((p) => p.teamId === 'FA' && p.overall <= 75)!;
    const signRes = signOrExtendPlayerContract(state, fa.id, 3, 2.2, 0.9);
    expect(signRes.success).toBe(true);
    expect(fa.teamId).toBe('BAL');

    // Release backup
    const relRes = releasePlayerToFreeAgency(state, fa.id);
    expect(relRes.success).toBe(true);
    expect(fa.teamId).toBe('FA');
  });

  it('evaluates and executes a multi-asset NFL trade and Owner Mode upgrades', () => {
    const state = createNewFranchiseState('BAL', 2005);
    const userPick1 = state.draftPicks.find(
      (pk) => pk.currentTeamId === 'BAL' && pk.round === 1,
    )!;
    const userPick2 = state.draftPicks.find(
      (pk) => pk.currentTeamId === 'BAL' && pk.round === 2,
    )!;
    const cpuPick4 = state.draftPicks.find(
      (pk) => pk.currentTeamId === 'PIT' && pk.round === 4,
    )!;

    const evalRes = evaluateTradeProposal(
      state,
      'PIT',
      [],
      [userPick1.id, userPick2.id],
      [],
      [cpuPick4.id],
    );
    expect(evalRes.accepted).toBe(true);

    const execRes = executeTradeProposal(
      state,
      'PIT',
      [],
      [userPick1.id, userPick2.id],
      [],
      [cpuPick4.id],
    );
    expect(execRes.success).toBe(true);
    expect(cpuPick4.currentTeamId).toBe('BAL');

    const priceRes = updateOwnerPricing(state, 75, 14, 30, 4.0);
    expect(priceRes.success).toBe(true);

    const coachRes = upgradeCoachStaffMember(state, 'oc');
    expect(coachRes.success).toBe(true);
  });
});
