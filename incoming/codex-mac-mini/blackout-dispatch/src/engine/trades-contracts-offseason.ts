import {
  ActiveDraftState,
  ALL_POSITIONS,
  DraftPick,
  FranchiseState,
  Player,
  Position,
  POSITION_IDEAL_STARTERS,
  RetiredPlayerSummary,
  SeasonAwardWinner,
  Team,
  TrainingCampDrill,
} from '../models/types';
import {
  calculateMarketContract,
  calculatePlayerOverall,
  createEmptyStats,
  createSeededRng,
  generateDraftClass,
  getReleaseCapPenaltyM,
  getTeamCapRoomM,
  normalizeTeamDepthChart,
} from './rosters-and-generator';
import {
  generateChampionshipBowlSchedule,
  generateConfChampionshipSchedule,
  generateDivisionalSchedule,
  generateRegularSeasonSchedule,
  generateWildCardSchedule,
  sortTeamsForStandings,
} from './schedule-and-standings';
import { simulateScheduledGame } from './game-simulator';
import {
  evaluateWeeklyMoraleAndInbox,
  generateWeeklyNewspaper,
  generateWeeklyTonyBrunoSegment,
  runInSeasonProgression,
} from './storyline-central';

export const TRAINING_CAMP_DRILLS: TrainingCampDrill[] = [
  {
    id: 'DRILL_POCKET_PRESENCE',
    name: 'Pocket Presence & Precision',
    category: 'OFFENSE',
    eligiblePositions: ['QB'],
    description:
      'Dodge simulated pass-rush dummy cannons while hitting moving target rings downfield.',
    attributeBoosts: {
      throwAccuracy: 3,
      awareness: 3,
      throwPower: 1,
    },
    overallBoost: 2,
    injuryRiskPct: 2,
  },
  {
    id: 'DRILL_GROUND_AND_POUND',
    name: 'Gauntlet Ball-Security & Juke',
    category: 'OFFENSE',
    eligiblePositions: ['HB', 'WR', 'TE'],
    description:
      'Run the gauntlet alley through heavy tackle pads to sharpen elusiveness and hands.',
    attributeBoosts: {
      agility: 2,
      carrying: 3,
      catching: 3,
      acceleration: 2,
    },
    overallBoost: 2,
    injuryRiskPct: 4,
  },
  {
    id: 'DRILL_TRENCH_BULL',
    name: 'Oklahoma Trench Drive Drill',
    category: 'PHYSICAL',
    eligiblePositions: ['OL', 'DL', 'TE'],
    description:
      'One-on-one full-contact leverage battle in the chute to build raw power.',
    attributeBoosts: {
      strength: 3,
      runBlock: 3,
      passBlock: 3,
      tackle: 3,
    },
    overallBoost: 2,
    injuryRiskPct: 5,
  },
  {
    id: 'DRILL_HIT_STICK_ALLEY',
    name: '2005 Hit Stick Enforcer Alley',
    category: 'DEFENSE',
    eligiblePositions: ['LB', 'S', 'DL'],
    description:
      'Time explosive shoulder tackles in the open field to master the new Madden 2005 Hit Stick!',
    attributeBoosts: {
      hitPower: 4,
      tackle: 3,
      awareness: 2,
    },
    overallBoost: 2,
    injuryRiskPct: 5,
  },
  {
    id: 'DRILL_SWAT_BALL',
    name: 'Ballhawk Island Coverage Drill',
    category: 'DEFENSE',
    eligiblePositions: ['CB', 'S', 'LB'],
    description:
      'High-pointjugs machine passes in tight man coverage to elevate ball skills.',
    attributeBoosts: {
      coverage: 4,
      catching: 2,
      speed: 1,
    },
    overallBoost: 2,
    injuryRiskPct: 3,
  },
  {
    id: 'DRILL_COFFIN_CORNER',
    name: 'Clutch Crosswind Kicking',
    category: 'SPECIAL',
    eligiblePositions: ['K', 'P'],
    description:
      'Drive 52-yard field goals and directional coffin-corner punts through swirling stadium winds.',
    attributeBoosts: {
      kickAccuracy: 4,
      kickPower: 3,
    },
    overallBoost: 2,
    injuryRiskPct: 0,
  },
];

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

// ============================================================================
// DEPTH CHART & ROSTER MANAGEMENT
// ============================================================================

export function changePlayerDepthOrder(
  state: FranchiseState,
  playerId: string,
  direction: 'UP' | 'DOWN',
): { success: boolean; message: string } {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.teamId !== state.userTeamId) {
    return { success: false, message: 'Player not found on your active roster.' };
  }

  const posGroup = state.players
    .filter((p) => p.teamId === state.userTeamId && p.position === player.position)
    .sort((a, b) => a.depthOrder - b.depthOrder || b.overall - a.overall);

  const idx = posGroup.findIndex((p) => p.id === player.id);
  if (idx === -1) return { success: false, message: 'Position group error.' };

  if (direction === 'UP' && idx > 0) {
    const above = posGroup[idx - 1];
    const tmp = above.depthOrder;
    above.depthOrder = player.depthOrder;
    player.depthOrder = tmp;
    player.morale = clamp(player.morale + 4, 25, 99);
    player.moraleTrend = 'UP';
    player.moraleReason = `Promoted to #${player.depthOrder} ${player.position} on the Depth Chart!`;
    if (above.overall >= 82 && above.depthOrder > 1) {
      above.morale = clamp(above.morale - 4, 25, 99);
      above.moraleTrend = 'DOWN';
      above.moraleReason = `Upset after being demoted behind ${player.lastName}.`;
    }
    normalizeTeamDepthChart(state.userTeamId, state.players);
    return {
      success: true,
      message: `${player.firstName} ${player.lastName} moved up to #${player.depthOrder} ${player.position}.`,
    };
  }

  if (direction === 'DOWN' && idx < posGroup.length - 1) {
    const below = posGroup[idx + 1];
    const tmp = below.depthOrder;
    below.depthOrder = player.depthOrder;
    player.depthOrder = tmp;
    below.morale = clamp(below.morale + 3, 25, 99);
    player.morale = clamp(player.morale - 3, 25, 99);
    normalizeTeamDepthChart(state.userTeamId, state.players);
    return {
      success: true,
      message: `${player.firstName} ${player.lastName} moved down to #${player.depthOrder} ${player.position}.`,
    };
  }

  return { success: false, message: 'Player is already at the boundary of the depth chart.' };
}

export function releasePlayerToFreeAgency(
  state: FranchiseState,
  playerId: string,
): { success: boolean; message: string } {
  const player = state.players.find((p) => p.id === playerId);
  const userTeam = state.teams.find((t) => t.id === state.userTeamId);
  if (!player || !userTeam || player.teamId !== userTeam.id) {
    return { success: false, message: 'Player is not on your team.' };
  }

  const posCount = state.players.filter(
    (p) => p.teamId === userTeam.id && p.position === player.position,
  ).length;
  if (posCount <= 1) {
    return {
      success: false,
      message: `Cannot release your only ${player.position}! Sign or trade for another ${player.position} first.`,
    };
  }

  const deadCap = getReleaseCapPenaltyM(player);
  userTeam.finances.deadCapPenaltyM = Number(
    (userTeam.finances.deadCapPenaltyM + deadCap).toFixed(2),
  );

  player.teamId = 'FA';
  player.depthOrder = 99;
  player.contract.bonusM = 0;
  player.morale = 70;
  player.moraleReason = `Released by ${userTeam.city}; looking for a new franchise.`;

  normalizeTeamDepthChart(userTeam.id, state.players);

  return {
    success: true,
    message: `Released ${player.position} ${player.firstName} ${player.lastName} to Free Agency (Dead Cap Penalty: $${deadCap.toFixed(2)}M).`,
  };
}

// ============================================================================
// CONTRACT NEGOTIATIONS & FRANCHISE TAG
// ============================================================================

export function evaluateContractOffer(
  player: Player,
  offeredYears: number,
  offeredSalaryM: number,
  offeredBonusM: number,
): {
  accepted: boolean;
  interestScore: number; // 0 to 100
  desiredTotalAnnualM: number;
  agentFeedback: string;
} {
  const market = calculateMarketContract(player.position, player.overall, player.age);
  let desiredAnnual = market.salaryM + market.bonusM;

  if (player.personality === 'Mercenary') desiredAnnual *= 1.14;
  else if (player.personality === 'Vocal Star') desiredAnnual *= 1.08;
  else if (player.personality === 'Team First') desiredAnnual *= 0.92;

  if (player.morale < 60) desiredAnnual *= 1.12;
  else if (player.morale >= 88) desiredAnnual *= 0.96;

  desiredAnnual = Number(desiredAnnual.toFixed(2));
  const offeredAnnual = offeredSalaryM + offeredBonusM;
  const bonusRatio = offeredAnnual > 0 ? offeredBonusM / offeredAnnual : 0;

  // Players value signing bonus security (at least 20% bonus)
  const bonusAdjust = bonusRatio >= 0.25 ? 1.05 : bonusRatio < 0.12 ? 0.9 : 1.0;
  const yearsAdjust =
    player.age >= 32 && offeredYears >= 4
      ? 0.92
      : offeredYears >= 2 && offeredYears <= 5
        ? 1.03
        : 0.96;

  const ratio = (offeredAnnual * bonusAdjust * yearsAdjust) / Math.max(0.4, desiredAnnual);
  const interestScore = clamp(ratio * 82, 5, 100);
  const accepted = interestScore >= 78;

  let agentFeedback = '';
  if (accepted) {
    agentFeedback = `"That deal works for ${player.firstName}! $${offeredAnnual.toFixed(2)}M/yr over ${offeredYears} years with a $${offeredBonusM.toFixed(2)}M/yr signing bonus shows real commitment."`;
  } else if (interestScore >= 64) {
    agentFeedback = `"We're close, Coach. Bring the total package closer to $${desiredAnnual.toFixed(2)}M/yr (especially the signing bonus) and we have a deal."`;
  } else {
    agentFeedback = `"Not even in the ballpark! An ${player.overall} OVR ${player.position} commands around $${desiredAnnual.toFixed(2)}M per year on the open market."`;
  }

  return {
    accepted,
    interestScore,
    desiredTotalAnnualM: desiredAnnual,
    agentFeedback,
  };
}

export function signOrExtendPlayerContract(
  state: FranchiseState,
  playerId: string,
  offeredYears: number,
  offeredSalaryM: number,
  offeredBonusM: number,
): { success: boolean; message: string } {
  const player = state.players.find((p) => p.id === playerId);
  const userTeam = state.teams.find((t) => t.id === state.userTeamId);
  if (!player || !userTeam) {
    return { success: false, message: 'Player or team not found.' };
  }

  const isFreeAgent = player.teamId === 'FA';
  const currentCapHit = isFreeAgent
    ? 0
    : player.contract.salaryM + player.contract.bonusM;
  const newCapHit = offeredSalaryM + offeredBonusM;
  const netCapIncrease = newCapHit - currentCapHit;
  const capRoom = getTeamCapRoomM(userTeam, state.players, state.salaryCapM);

  if (netCapIncrease > capRoom) {
    return {
      success: false,
      message: `Salary Cap Violation! This contract adds $${netCapIncrease.toFixed(2)}M against only $${capRoom.toFixed(2)}M in available Cap Room.`,
    };
  }

  const evalResult = evaluateContractOffer(
    player,
    offeredYears,
    offeredSalaryM,
    offeredBonusM,
  );
  if (!evalResult.accepted) {
    player.morale = clamp(player.morale - 2, 25, 99);
    return {
      success: false,
      message: `Offer Rejected (${evalResult.interestScore}% Interest): ${evalResult.agentFeedback}`,
    };
  }

  player.teamId = userTeam.id;
  player.contract = {
    yearsLeft: offeredYears,
    salaryM: Number(offeredSalaryM.toFixed(2)),
    bonusM: Number(offeredBonusM.toFixed(2)),
    franchiseTagged: false,
  };
  player.morale = clamp(player.morale + 10, 60, 99);
  player.moraleTrend = 'UP';
  player.moraleReason = isFreeAgent
    ? `Thrilled to sign a ${offeredYears}-year contract with ${userTeam.city}!`
    : `Fired up after signing a ${offeredYears}-year extension with ${userTeam.city}!`;

  normalizeTeamDepthChart(userTeam.id, state.players);

  return {
    success: true,
    message: `${isFreeAgent ? 'Signed Free Agent' : 'Extended'} ${player.position} ${player.firstName} ${player.lastName} to a ${offeredYears}-yr, $${((offeredSalaryM + offeredBonusM) * offeredYears).toFixed(2)}M total contract!`,
  };
}

export function applyFranchiseTagToPlayer(
  state: FranchiseState,
  playerId: string,
): { success: boolean; message: string } {
  if (state.franchiseTagUsedThisOffseason) {
    return {
      success: false,
      message: 'You have already used your 1 Exclusive Franchise Tag this season!',
    };
  }
  const player = state.players.find((p) => p.id === playerId);
  const userTeam = state.teams.find((t) => t.id === state.userTeamId);
  if (!player || !userTeam || player.teamId !== userTeam.id) {
    return { success: false, message: 'Player not found on your roster.' };
  }

  const market = calculateMarketContract(player.position, Math.max(89, player.overall), player.age);
  const tagSalaryM = Number(((market.salaryM + market.bonusM) * 0.85).toFixed(2));
  const tagBonusM = Number(((market.salaryM + market.bonusM) * 0.25).toFixed(2));

  const capRoom = getTeamCapRoomM(userTeam, state.players, state.salaryCapM);
  const netDelta =
    tagSalaryM + tagBonusM - (player.contract.salaryM + player.contract.bonusM);
  if (netDelta > capRoom) {
    return {
      success: false,
      message: `Insufficient Cap Room ($${capRoom.toFixed(2)}M) for the Franchise Tag ($${(tagSalaryM + tagBonusM).toFixed(2)}M).`,
    };
  }

  player.contract = {
    yearsLeft: 1,
    salaryM: tagSalaryM,
    bonusM: tagBonusM,
    franchiseTagged: true,
  };
  state.franchiseTagUsedThisOffseason = true;
  player.morale = clamp(player.morale - 3, 55, 95);
  player.moraleReason = 'Playing on the 1-year Exclusive Franchise Tag.';

  return {
    success: true,
    message: `Applied Exclusive Franchise Tag to ${player.position} ${player.firstName} ${player.lastName} (1 yr, $${(tagSalaryM + tagBonusM).toFixed(2)}M guaranteed)!`,
  };
}

// ============================================================================
// TRADE CENTER & CPU GM EVALUATION
// ============================================================================

export function getPlayerTradeValue(player: Player, targetTeam?: Team, allPlayers?: Player[]): number {
  const posWeight: Record<Position, number> = {
    QB: 1.32,
    DL: 1.15,
    CB: 1.14,
    OL: 1.1,
    WR: 1.12,
    LB: 1.1,
    HB: 1.05,
    S: 1.0,
    TE: 0.95,
    K: 0.45,
    P: 0.4,
  };

  const base = Math.pow(Math.max(1, player.overall - 58), 1.75) * posWeight[player.position];
  const ageFactor =
    player.age <= 25
      ? 1.18
      : player.age <= 29
        ? 1.0
        : player.age <= 32
          ? 0.78
          : 0.55;

  let needMultiplier = 1.0;
  if (targetTeam && allPlayers) {
    const existingStarters = allPlayers
      .filter((p) => p.teamId === targetTeam.id && p.position === player.position)
      .sort((a, b) => b.overall - a.overall);
    const idealCount = POSITION_IDEAL_STARTERS[player.position];
    const weakestStarterOvr =
      existingStarters[idealCount - 1]?.overall ?? 65;

    if (player.overall > weakestStarterOvr + 5) {
      needMultiplier = 1.22; // Major positional upgrade for target team!
    } else if (player.overall < weakestStarterOvr - 3) {
      needMultiplier = 0.78;
    }
  }

  return Math.round(base * ageFactor * needMultiplier);
}

export function getDraftPickTradeValue(pick: DraftPick): number {
  const roundValues: Record<number, number> = {
    1: 620,
    2: 340,
    3: 195,
    4: 110,
    5: 65,
  };
  return roundValues[pick.round] ?? 60;
}

export function evaluateTradeProposal(
  state: FranchiseState,
  cpuTeamId: string,
  userPlayerIds: string[],
  userPickIds: string[],
  cpuPlayerIds: string[],
  cpuPickIds: string[],
): {
  accepted: boolean;
  interestScore: number; // 0 to 100
  userPackageValue: number;
  cpuPackageValue: number;
  reason: string;
} {
  if (
    state.phase === 'REGULAR_SEASON' &&
    state.week > state.tradeDeadlineWeek
  ) {
    return {
      accepted: false,
      interestScore: 0,
      userPackageValue: 0,
      cpuPackageValue: 0,
      reason: `The Week ${state.tradeDeadlineWeek} NFL Trade Deadline has passed! Trades reopen in the Offseason.`,
    };
  }

  const userTeam = state.teams.find((t) => t.id === state.userTeamId);
  const cpuTeam = state.teams.find((t) => t.id === cpuTeamId);
  if (!userTeam || !cpuTeam) {
    return {
      accepted: false,
      interestScore: 0,
      userPackageValue: 0,
      cpuPackageValue: 0,
      reason: 'Select a valid trade partner.',
    };
  }

  if (
    userPlayerIds.length + userPickIds.length === 0 ||
    cpuPlayerIds.length + cpuPickIds.length === 0
  ) {
    return {
      accepted: false,
      interestScore: 0,
      userPackageValue: 0,
      cpuPackageValue: 0,
      reason: 'Select at least one asset from both teams to propose a trade.',
    };
  }

  const userPlayers = state.players.filter((p) => userPlayerIds.includes(p.id));
  const cpuPlayers = state.players.filter((p) => cpuPlayerIds.includes(p.id));
  const userPicks = state.draftPicks.filter((pk) => userPickIds.includes(pk.id));
  const cpuPicks = state.draftPicks.filter((pk) => cpuPickIds.includes(pk.id));

  // Verify salary cap room for both teams
  const userOutgoingSal = userPlayers.reduce((s, p) => s + p.contract.salaryM, 0);
  const cpuOutgoingSal = cpuPlayers.reduce((s, p) => s + p.contract.salaryM, 0);
  const userCapRoom = getTeamCapRoomM(userTeam, state.players, state.salaryCapM);
  const cpuCapRoom = getTeamCapRoomM(cpuTeam, state.players, state.salaryCapM);

  if (cpuOutgoingSal - userOutgoingSal > userCapRoom) {
    return {
      accepted: false,
      interestScore: 15,
      userPackageValue: 0,
      cpuPackageValue: 0,
      reason: `${userTeam.city} lacks the Salary Cap space ($${userCapRoom.toFixed(2)}M available) to absorb $${(cpuOutgoingSal - userOutgoingSal).toFixed(2)}M in added salary.`,
    };
  }
  if (userOutgoingSal - cpuOutgoingSal > cpuCapRoom) {
    return {
      accepted: false,
      interestScore: 20,
      userPackageValue: 0,
      cpuPackageValue: 0,
      reason: `${cpuTeam.city} only has $${cpuCapRoom.toFixed(2)}M in Cap Room and cannot absorb this contract load.`,
    };
  }

  const userPackageValue =
    userPlayers.reduce(
      (s, p) => s + getPlayerTradeValue(p, cpuTeam, state.players),
      0,
    ) + userPicks.reduce((s, pk) => s + getDraftPickTradeValue(pk), 0);

  const cpuPackageValue =
    cpuPlayers.reduce(
      (s, p) => s + getPlayerTradeValue(p, userTeam, state.players),
      0,
    ) + cpuPicks.reduce((s, pk) => s + getDraftPickTradeValue(pk), 0);

  const ratio = userPackageValue / Math.max(1, cpuPackageValue);
  const interestScore = clamp(ratio * 78, 5, 100);
  const accepted = interestScore >= 76;

  const reason = accepted
    ? `${cpuTeam.city} GM accepts! "This package upgrades our roster depth and fits our cap structure."`
    : interestScore >= 60
      ? `${cpuTeam.city} GM is intrigued (${interestScore}% interest) but wants a mid-round draft pick or slightly higher-rated player added.`
      : `${cpuTeam.city} GM declines (${interestScore}% interest): "The value gap (${userPackageValue} pts vs ${cpuPackageValue} pts) is too wide for us to pull the trigger."`;

  return {
    accepted,
    interestScore,
    userPackageValue,
    cpuPackageValue,
    reason,
  };
}

export function executeTradeProposal(
  state: FranchiseState,
  cpuTeamId: string,
  userPlayerIds: string[],
  userPickIds: string[],
  cpuPlayerIds: string[],
  cpuPickIds: string[],
): { success: boolean; message: string } {
  const check = evaluateTradeProposal(
    state,
    cpuTeamId,
    userPlayerIds,
    userPickIds,
    cpuPlayerIds,
    cpuPickIds,
  );
  if (!check.accepted) {
    return { success: false, message: check.reason };
  }

  const userTeam = state.teams.find((t) => t.id === state.userTeamId)!;
  const cpuTeam = state.teams.find((t) => t.id === cpuTeamId)!;

  for (const pid of userPlayerIds) {
    const p = state.players.find((pl) => pl.id === pid);
    if (p) {
      p.teamId = cpuTeam.id;
      p.morale = clamp(p.morale + 2, 50, 95);
      p.moraleReason = `Traded from ${userTeam.abbr} to ${cpuTeam.abbr}.`;
    }
  }
  for (const pid of cpuPlayerIds) {
    const p = state.players.find((pl) => pl.id === pid);
    if (p) {
      p.teamId = userTeam.id;
      p.morale = clamp(p.morale + 6, 65, 98);
      p.moraleTrend = 'UP';
      p.moraleReason = `Excited to join ${userTeam.city} via blockbuster trade!`;
    }
  }
  for (const pkId of userPickIds) {
    const pk = state.draftPicks.find((d) => d.id === pkId);
    if (pk) pk.currentTeamId = cpuTeam.id;
  }
  for (const pkId of cpuPickIds) {
    const pk = state.draftPicks.find((d) => d.id === pkId);
    if (pk) pk.currentTeamId = userTeam.id;
  }

  normalizeTeamDepthChart(userTeam.id, state.players);
  normalizeTeamDepthChart(cpuTeam.id, state.players);

  const summary = `BLOCKBUSTER TRADE COMPLETE! ${userTeam.city} and ${cpuTeam.city} finalized a ${userPlayerIds.length + userPickIds.length}-for-${cpuPlayerIds.length + cpuPickIds.length} asset deal.`;
  state.pdaInbox.unshift({
    id: `EMAIL_TRADE_${Date.now()}`,
    season: state.season,
    week: state.week,
    senderRole: 'LEAGUE',
    senderName: 'NFL League Office // Transaction Wire',
    subject: `Trade Approved: ${userTeam.abbr} ↔ ${cpuTeam.abbr}`,
    body: summary,
    read: false,
    priority: 'HIGH',
    actionTab: 'ROSTER',
  });

  return { success: true, message: summary };
}

// ============================================================================
// WEEKLY ADVANCEMENT & 5-STAGE OFFSEASON CONTROLLER
// ============================================================================

export function healWeeklyInjuries(state: FranchiseState): void {
  for (const p of state.players) {
    if (p.injuryWeeks > 0) {
      p.injuryWeeks = Math.max(0, p.injuryWeeks - 1);
      if (p.injuryWeeks === 0) {
        p.injuryType = undefined;
      }
    }
  }
}

export function simCurrentWeekGames(state: FranchiseState): void {
  const weekGames = state.schedule.filter(
    (g) => g.season === state.season && g.week === state.week && !g.played,
  );
  weekGames.forEach((g, idx) => {
    simulateScheduledGame(g, state, idx * 31);
  });
}

export function computeSeasonAwardsAndRetirements(state: FranchiseState): void {
  const activePlayers = state.players.filter(
    (p) => p.teamId !== 'FA' && p.teamId !== 'DRAFT',
  );
  const teamMap = new Map(state.teams.map((t) => [t.id, t]));

  // 1. League MVP (Top QB or HB)
  const mvpCandidates = [...activePlayers].sort((a, b) => {
    const scoreA =
      a.stats.passYards * 0.04 +
      a.stats.passTDs * 6 -
      a.stats.interceptions * 3 +
      a.stats.rushYards * 0.08 +
      a.stats.rushTDs * 6 +
      (teamMap.get(a.teamId)?.wins ?? 8) * 5;
    const scoreB =
      b.stats.passYards * 0.04 +
      b.stats.passTDs * 6 -
      b.stats.interceptions * 3 +
      b.stats.rushYards * 0.08 +
      b.stats.rushTDs * 6 +
      (teamMap.get(b.teamId)?.wins ?? 8) * 5;
    return scoreB - scoreA;
  });

  // 2. Defensive Player of the Year (Madden 2005 Cover Award!)
  const dpoyCandidates = activePlayers
    .filter((p) => ['LB', 'DL', 'S', 'CB'].includes(p.position))
    .sort((a, b) => {
      const scoreA =
        a.stats.tackles * 1.2 +
        a.stats.sacks * 9 +
        a.stats.defInterceptions * 12 +
        a.stats.forcedFumbles * 8;
      const scoreB =
        b.stats.tackles * 1.2 +
        b.stats.sacks * 9 +
        b.stats.defInterceptions * 12 +
        b.stats.forcedFumbles * 8;
      return scoreB - scoreA;
    });

  // 3. Best Running Back
  const topRBs = activePlayers
    .filter((p) => p.position === 'HB')
    .sort((a, b) => b.stats.rushYards + b.stats.rushTDs * 45 - (a.stats.rushYards + a.stats.rushTDs * 45));

  // 4. Best Wide Receiver
  const topWRs = activePlayers
    .filter((p) => p.position === 'WR' || p.position === 'TE')
    .sort((a, b) => b.stats.recYards + b.stats.recTDs * 45 - (a.stats.recYards + a.stats.recTDs * 45));

  const awards: SeasonAwardWinner[] = [];
  if (mvpCandidates[0]) {
    const m = mvpCandidates[0];
    awards.push({
      awardName: `${state.season} NFL Most Valuable Player`,
      playerId: m.id,
      playerName: `${m.firstName} ${m.lastName}`,
      position: m.position,
      teamId: m.teamId,
      teamAbbr: m.teamId,
      statLine:
        m.position === 'QB'
          ? `${m.stats.passYards} PASS YDS, ${m.stats.passTDs} TD, ${m.stats.interceptions} INT`
          : `${m.stats.rushYards} RUSH YDS, ${m.stats.rushTDs} TD`,
    });
  }
  if (dpoyCandidates[0]) {
    const d = dpoyCandidates[0];
    awards.push({
      awardName: `${state.season} NFL Defensive Player of the Year`,
      playerId: d.id,
      playerName: `${d.firstName} ${d.lastName}`,
      position: d.position,
      teamId: d.teamId,
      teamAbbr: d.teamId,
      statLine: `${d.stats.tackles} TAK, ${d.stats.sacks} SACKS, ${d.stats.defInterceptions} INT, ${d.stats.forcedFumbles} FF`,
    });
  }
  if (topRBs[0]) {
    const r = topRBs[0];
    awards.push({
      awardName: `${state.season} Best Running Back`,
      playerId: r.id,
      playerName: `${r.firstName} ${r.lastName}`,
      position: r.position,
      teamId: r.teamId,
      teamAbbr: r.teamId,
      statLine: `${r.stats.rushAttempts} CAR, ${r.stats.rushYards} YDS, ${r.stats.rushTDs} TD`,
    });
  }
  if (topWRs[0]) {
    const w = topWRs[0];
    awards.push({
      awardName: `${state.season} Best Receiver`,
      playerId: w.id,
      playerName: `${w.firstName} ${w.lastName}`,
      position: w.position,
      teamId: w.teamId,
      teamAbbr: w.teamId,
      statLine: `${w.stats.receptions} REC, ${w.stats.recYards} YDS, ${w.stats.recTDs} TD`,
    });
  }

  state.seasonAwards = awards;

  // Retirements: Veterans age >= 34 have a chance to retire
  const retired: RetiredPlayerSummary[] = [];
  const remainingPlayers: Player[] = [];
  for (const p of state.players) {
    if (
      p.teamId !== 'DRAFT' &&
      ((p.age >= 35 && Math.random() < 0.55) || (p.age === 34 && Math.random() < 0.25))
    ) {
      retired.push({
        playerId: p.id,
        name: `${p.firstName} ${p.lastName}`,
        position: p.position,
        teamAbbr: p.teamId,
        age: p.age,
        overall: p.overall,
        yearsPro: p.yearsPro,
        hallOfFameInductee: p.overall >= 90 || p.yearsPro >= 12,
      });
    } else {
      remainingPlayers.push(p);
    }
  }
  state.players = remainingPlayers;
  state.retiredPlayers = retired;
}

export function transitionToOffseasonResign(state: FranchiseState): void {
  state.phase = 'OFFSEASON_RESIGN';
  state.franchiseTagUsedThisOffseason = false;

  // Decrement yearsLeft by 1 for all signed players, age everyone +1
  for (const p of state.players) {
    if (p.teamId !== 'DRAFT') {
      p.age += 1;
      p.yearsPro += 1;
      p.campBoostedThisYear = false;
      if (p.teamId !== 'FA') {
        p.contract.yearsLeft = Math.max(0, p.contract.yearsLeft - 1);
      }
      // Slight natural progression for young players, slight decline for 32+
      if (p.age <= 25 && p.potential === 'A') {
        p.overall = clamp(p.overall + 1, 55, 99);
      } else if (p.age >= 32) {
        p.overall = clamp(p.overall - 1, 55, 99);
        p.attributes.speed = clamp(p.attributes.speed - 1, 45, 99);
      }
    }
  }

  // CPU teams automatically re-sign their top expiring starters
  for (const team of state.teams) {
    if (team.id === state.userTeamId) continue;
    const expiring = state.players
      .filter((p) => p.teamId === team.id && p.contract.yearsLeft === 0)
      .sort((a, b) => b.overall - a.overall);
    for (const p of expiring) {
      if (p.overall >= 79) {
        p.contract = calculateMarketContract(p.position, p.overall, p.age);
      } else {
        p.teamId = 'FA';
      }
    }
  }
}

export function transitionToOffseasonFreeAgency(state: FranchiseState): void {
  // Move any remaining un-resigned user players with yearsLeft === 0 into Free Agency
  for (const p of state.players) {
    if (p.teamId !== 'FA' && p.teamId !== 'DRAFT' && p.contract.yearsLeft <= 0) {
      p.teamId = 'FA';
      p.contract = calculateMarketContract(p.position, p.overall, p.age);
      p.moraleReason = 'Entered unrestricted Free Agency.';
    }
  }
  state.phase = 'OFFSEASON_FREE_AGENCY';
}

export function initializeOffseasonDraft(state: FranchiseState): void {
  // CPU teams sign a few free agents to fill glaring holes before the Draft
  const faPool = state.players
    .filter((p) => p.teamId === 'FA')
    .sort((a, b) => b.overall - a.overall);

  for (const team of state.teams) {
    if (team.id === state.userTeamId) continue;
    for (const pos of ALL_POSITIONS) {
      const count = state.players.filter(
        (p) => p.teamId === team.id && p.position === pos,
      ).length;
      if (count === 0) {
        const idx = faPool.findIndex((f) => f.position === pos && f.teamId === 'FA');
        if (idx !== -1) {
          faPool[idx].teamId = team.id;
          faPool[idx].depthOrder = 1;
        }
      }
    }
  }

  // Ensure Draft Class exists for current season
  let prospects = state.players.filter((p) => p.teamId === 'DRAFT');
  if (prospects.length < 32) {
    const rng = createSeededRng(state.season * 777 + 99);
    const fresh = generateDraftClass(state.season, rng, 64);
    state.players.push(...fresh);
    prospects = fresh;
  }

  // Build Draft Order (reverse standings order, champion picks 32nd)
  const reverseOrderTeams = [... sortTeamsForStandings(state.teams)].reverse();
  const pickOrder: DraftPick[] = [];

  for (let round = 1; round <= 5; round++) {
    reverseOrderTeams.forEach((origTeam) => {
      let existingPick = state.draftPicks.find(
        (pk) =>
          pk.season === state.season &&
          pk.round === round &&
          pk.originalTeamId === origTeam.id,
      );
      if (!existingPick) {
        existingPick = {
          id: `PICK_${state.season}_R${round}_${origTeam.id}`,
          season: state.season,
          round,
          originalTeamId: origTeam.id,
          currentTeamId: origTeam.id,
        };
        state.draftPicks.push(existingPick);
      }
      existingPick.overallPick = pickOrder.length + 1;
      pickOrder.push(existingPick);
    });
  }

  state.activeDraft = {
    currentRound: 1,
    currentPickIndex: 0,
    pickOrder,
    draftLog: [],
    scoutingHoursRemaining: 15,
  };
  state.phase = 'OFFSEASON_DRAFT';

  // Auto-advance CPU picks until it is the user's turn!
  simCpuDraftPicksUntilUserTurn(state);
}

export function scoutDraftProspect(
  state: FranchiseState,
  prospectId: string,
): { success: boolean; message: string } {
  const prospect = state.players.find(
    (p) => p.id === prospectId && p.teamId === 'DRAFT',
  );
  if (!prospect) return { success: false, message: 'Prospect not found.' };
  if (prospect.scoutedLevel >= 2) {
    return { success: false, message: 'Prospect is already fully scouted!' };
  }

  if (state.activeDraft && state.activeDraft.scoutingHoursRemaining <= 0) {
    return { success: false, message: 'No Scouting Combine hours remaining!' };
  }
  if (state.activeDraft) {
    state.activeDraft.scoutingHoursRemaining--;
  }

  prospect.scoutedLevel = 2;
  return {
    success: true,
    message: `Scouting Report Unlocked: ${prospect.position} ${prospect.firstName} ${prospect.lastName} (${prospect.combine?.college ?? 'NCAA'}) — ${prospect.overall} OVR, Potential '${prospect.potential}', Trait: ${prospect.trait}!`,
  };
}

export function makeDraftSelection(
  state: FranchiseState,
  prospectId?: string,
): { success: boolean; message: string } {
  const draft = state.activeDraft;
  if (!draft || draft.currentPickIndex >= draft.pickOrder.length) {
    return { success: false, message: 'The NFL Draft is complete!' };
  }

  const currentPick = draft.pickOrder[draft.currentPickIndex];
  const pickingTeam = state.teams.find((t) => t.id === currentPick.currentTeamId)!;
  const availableProspects = state.players
    .filter((p) => p.teamId === 'DRAFT')
    .sort((a, b) => b.overall - a.overall);

  if (availableProspects.length === 0) {
    draft.currentPickIndex = draft.pickOrder.length;
    return { success: false, message: 'No prospects remaining.' };
  }

  let chosen: Player | undefined;
  if (prospectId) {
    chosen = availableProspects.find((p) => p.id === prospectId);
  }

  if (!chosen) {
    // Pick best player factoring positional need
    chosen = availableProspects[0];
    for (const candidate of availableProspects.slice(0, 6)) {
      const teamPosPlayers = state.players.filter(
        (p) => p.teamId === pickingTeam.id && p.position === candidate.position,
      );
      const topOvr = teamPosPlayers[0]?.overall ?? 60;
      if (topOvr < 78) {
        chosen = candidate;
        break;
      }
    }
  }

  const rookieSal = Number(
    Math.max(0.38, 1.85 - (currentPick.round - 1) * 0.34).toFixed(2),
  );
  const rookieBonus = Number(
    Math.max(0.08, 0.75 - (currentPick.round - 1) * 0.15).toFixed(2),
  );

  chosen.teamId = pickingTeam.id;
  chosen.scoutedLevel = 2;
  chosen.contract = {
    yearsLeft: 4,
    salaryM: rookieSal,
    bonusM: rookieBonus,
  };
  chosen.morale = 90;
  chosen.moraleTrend = 'UP';
  chosen.moraleReason = `Drafted #${currentPick.overallPick} overall (Rd ${currentPick.round}) by ${pickingTeam.city}!`;

  normalizeTeamDepthChart(pickingTeam.id, state.players);

  draft.draftLog.unshift({
    overallPick: currentPick.overallPick ?? draft.currentPickIndex + 1,
    round: currentPick.round,
    teamId: pickingTeam.id,
    teamAbbr: pickingTeam.abbr,
    playerId: chosen.id,
    playerName: `${chosen.firstName} ${chosen.lastName}`,
    position: chosen.position,
    overall: chosen.overall,
    potential: chosen.potential,
  });

  currentPick.usedOnPlayerId = chosen.id;
  draft.currentPickIndex++;
  if (draft.currentPickIndex < draft.pickOrder.length) {
    draft.currentRound = draft.pickOrder[draft.currentPickIndex].round;
  }

  return {
    success: true,
    message: `Pick #${currentPick.overallPick} (Rd ${currentPick.round}): ${pickingTeam.city} selects ${chosen.position} ${chosen.firstName} ${chosen.lastName} (${chosen.overall} OVR, Pot ${chosen.potential})!`,
  };
}

export function simCpuDraftPicksUntilUserTurn(state: FranchiseState): void {
  const draft = state.activeDraft;
  if (!draft) return;

  let guard = 0;
  while (
    draft.currentPickIndex < draft.pickOrder.length &&
    draft.pickOrder[draft.currentPickIndex].currentTeamId !== state.userTeamId &&
    guard < 200
  ) {
    makeDraftSelection(state);
    guard++;
  }
}

export function simRemainderOfDraft(state: FranchiseState): void {
  const draft = state.activeDraft;
  if (!draft) return;
  let guard = 0;
  while (draft.currentPickIndex < draft.pickOrder.length && guard < 200) {
    makeDraftSelection(state);
    guard++;
  }
}

export function transitionToTrainingCamp(state: FranchiseState): void {
  // Move any undrafted prospects into Free Agency
  for (const p of state.players) {
    if (p.teamId === 'DRAFT') {
      p.teamId = 'FA';
      p.scoutedLevel = 2;
      p.contract = { yearsLeft: 2, salaryM: 0.38, bonusM: 0.05 };
    }
  }
  state.campDrillsRemaining = 4;
  state.phase = 'OFFSEASON_TRAINING_CAMP';
}

export function executeTrainingCampDrill(
  state: FranchiseState,
  drillId: string,
  playerId: string,
): { success: boolean; message: string } {
  if (state.campDrillsRemaining <= 0) {
    return {
      success: false,
      message: 'All 4 Training Camp Mini-Camp sessions have been completed!',
    };
  }
  const drill = TRAINING_CAMP_DRILLS.find((d) => d.id === drillId);
  const player = state.players.find(
    (p) => p.id === playerId && p.teamId === state.userTeamId,
  );
  if (!drill || !player) {
    return { success: false, message: 'Select a valid drill and player.' };
  }
  if (!drill.eligiblePositions.includes(player.position)) {
    return {
      success: false,
      message: `${drill.name} requires one of: ${drill.eligiblePositions.join(', ')}.`,
    };
  }
  if (player.campBoostedThisYear) {
    return {
      success: false,
      message: `${player.firstName} ${player.lastName} has already participated in a Training Camp drill this offseason.`,
    };
  }

  state.campDrillsRemaining--;
  player.campBoostedThisYear = true;

  // Apply attribute boosts
  const boostsApplied: string[] = [];
  for (const [key, delta] of Object.entries(drill.attributeBoosts)) {
    const k = key as keyof typeof player.attributes;
    if (typeof delta === 'number') {
      player.attributes[k] = clamp(player.attributes[k] + delta, 40, 99);
      boostsApplied.push(`+${delta} ${key.toUpperCase()}`);
    }
  }

  const newComputed = calculatePlayerOverall(player.position, player.attributes);
  player.overall = clamp(
    Math.max(player.overall + drill.overallBoost, newComputed),
    55,
    99,
  );
  player.lastProgressionDelta = drill.overallBoost;
  player.morale = clamp(player.morale + 5, 50, 99);
  player.moraleTrend = 'UP';
  player.moraleReason = `Earned Gold Trophy in Training Camp (${drill.name})!`;

  return {
    success: true,
    message: `🏆 GOLD TROPHY! ${player.position} ${player.firstName} ${player.lastName} crushed ${drill.name}: +${drill.overallBoost} OVR (Now ${player.overall} OVR; ${boostsApplied.join(', ')})!`,
  };
}

export function startNewSeasonAfterTrainingCamp(state: FranchiseState): void {
  const nextSeason = state.season + 1;
  state.season = nextSeason;
  state.week = 1;
  state.phase = 'REGULAR_SEASON';
  state.salaryCapM = Number((state.salaryCapM + 4.5).toFixed(2)); // Cap grows each year
  state.activeDraft = null;
  state.seasonAwards = [];
  state.retiredPlayers = [];
  state.franchiseTagUsedThisOffseason = false;

  // Reset team records & dead cap, add next season's draft picks, reset player season stats
  for (const team of state.teams) {
    team.wins = 0;
    team.losses = 0;
    team.ties = 0;
    team.pointsFor = 0;
    team.pointsAgainst = 0;
    team.streak = 0;
    team.divisionWins = 0;
    team.divisionLosses = 0;
    team.confWins = 0;
    team.confLosses = 0;
    team.finances.deadCapPenaltyM = 0;
    team.finances.seasonRevenueM = 0;
    team.finances.seasonExpensesM = 0;

    for (let round = 1; round <= 5; round++) {
      state.draftPicks.push({
        id: `PICK_${nextSeason + 1}_R${round}_${team.id}`,
        season: nextSeason + 1,
        round,
        originalTeamId: team.id,
        currentTeamId: team.id,
      });
    }
  }

  for (const p of state.players) {
    p.stats = createEmptyStats();
    p.injuryWeeks = 0;
    p.injuryType = undefined;
    p.lastProgressionDelta = 0;
  }

  // Generate new college draft class for the new season
  const rng = createSeededRng(nextSeason * 31337);
  const newDraftClass = generateDraftClass(nextSeason, rng, 64);
  state.players.push(...newDraftClass);

  // Generate new 17-week regular season schedule
  state.schedule = generateRegularSeasonSchedule(nextSeason, state.teams);

  generateWeeklyNewspaper(state, 1);
  generateWeeklyTonyBrunoSegment(state, 1);

  const userTeam = state.teams.find((t) => t.id === state.userTeamId)!;
  state.pdaInbox.unshift({
    id: `EMAIL_NEWSEASON_${nextSeason}`,
    season: nextSeason,
    week: 1,
    senderRole: 'OWNER',
    senderName: `${userTeam.city} Ownership Group`,
    subject: `Welcome to the ${nextSeason} NFL Season! (Cap: $${state.salaryCapM.toFixed(1)}M)`,
    body: `Coach, a brand new campaign is underway at ${userTeam.stadiumName}! The League Salary Cap has risen to $${state.salaryCapM.toFixed(2)}M. Our goal is simple: dominate the ${userTeam.conference} ${userTeam.division} and bring home the Championship Trophy!`,
    read: false,
    priority: 'HIGH',
    actionTab: 'STORYLINE',
  });
}

export function advanceFranchiseWeekOrStage(state: FranchiseState): {
  headline: string;
  details: string;
} {
  // 1. Handle Offseason Stages
  if (state.phase === 'OFFSEASON_AWARDS') {
    transitionToOffseasonResign(state);
    return {
      headline: 'OFFSEASON STAGE 2: RE-SIGN PLAYERS & FRANCHISE TAG',
      details:
        'Negotiate extensions with your expiring players or apply your 1 Exclusive Franchise Tag before Free Agency opens.',
    };
  }
  if (state.phase === 'OFFSEASON_RESIGN') {
    transitionToOffseasonFreeAgency(state);
    return {
      headline: 'OFFSEASON STAGE 3: FREE AGENCY FRENZY',
      details:
        'Unrestricted Free Agency is now open! Bid on top veterans to upgrade your roster before the NFL Draft.',
    };
  }
  if (state.phase === 'OFFSEASON_FREE_AGENCY') {
    initializeOffseasonDraft(state);
    return {
      headline: 'OFFSEASON STAGE 4: SCOUTING COMBINE & NFL DRAFT',
      details:
        'Welcome to Radio City Music Hall! Scout college prospects and make your selections across 5 rounds.',
    };
  }
  if (state.phase === 'OFFSEASON_DRAFT') {
    if (
      state.activeDraft &&
      state.activeDraft.currentPickIndex < state.activeDraft.pickOrder.length
    ) {
      simRemainderOfDraft(state);
    }
    transitionToTrainingCamp(state);
    return {
      headline: 'OFFSEASON STAGE 5: TRAINING CAMP POSITION DRILLS',
      details:
        'Put up to 4 players through high-intensity Madden 2005 Training Camp drills for permanent rating boosts!',
    };
  }
  if (state.phase === 'OFFSEASON_TRAINING_CAMP') {
    startNewSeasonAfterTrainingCamp(state);
    return {
      headline: `KICKOFF ${state.season}! WEEK 1 REGULAR SEASON`,
      details: `The ${state.season} NFL Regular Season has begun! Check Storyline Central and set your Week 1 gameplan.`,
    };
  }

  // 2. Simulate any unplayed games in the current week
  simCurrentWeekGames(state);
  const completedWeek = state.week;

  // Heal injuries 1 week
  healWeeklyInjuries(state);

  // Evaluate morale & generate newspaper + Tony Bruno Radio Show
  evaluateWeeklyMoraleAndInbox(state);
  const paper = generateWeeklyNewspaper(state, completedWeek);

  // In-Season Progression at Weeks 4, 8, 12, 16
  let progNote = '';
  if ([4, 8, 12, 16].includes(completedWeek)) {
    const boosts = runInSeasonProgression(state);
    if (boosts.length > 0) {
      progNote = ` • In-Season Progression boosted ${boosts.length} players on your roster!`;
    }
  }

  // Advance from Week 1..16 -> next regular season week
  if (completedWeek < 17) {
    state.week = completedWeek + 1;
    generateWeeklyTonyBrunoSegment(state, state.week);
    return {
      headline: `Advanced to Week ${state.week} (${state.season} Season)`,
      details: `${paper.localHeadline}${progNote}`,
    };
  }

  // Completed Week 17 -> Enter Wild Card Playoffs (Week 18)
  if (completedWeek === 17) {
    state.week = 18;
    state.phase = 'PLAYOFFS';
    const wcGames = generateWildCardSchedule(state.season, state.teams);
    state.schedule.push(...wcGames);
    generateWeeklyTonyBrunoSegment(state, 18);
    return {
      headline: 'WELCOME TO THE NFL PLAYOFFS // WILD CARD WEEKEND!',
      details:
        'The 12-team playoff bracket is locked! Division seeds #1 and #2 earn first-round byes while #3 vs #6 and #4 vs #5 battle on Wild Card Weekend.',
    };
  }

  // Completed Week 18 (Wild Card) -> Divisional Round (Week 19)
  if (completedWeek === 18) {
    state.week = 19;
    const divGames = generateDivisionalSchedule(
      state.season,
      state.teams,
      state.schedule,
    );
    state.schedule.push(...divGames);
    generateWeeklyTonyBrunoSegment(state, 19);
    return {
      headline: 'DIVISIONAL PLAYOFF ROUND SET!',
      details: 'Top seeds #1 and #2 take the field in the Divisional Round!',
    };
  }

  // Completed Week 19 (Divisional) -> Conference Championships (Week 20)
  if (completedWeek === 19) {
    state.week = 20;
    const confGames = generateConfChampionshipSchedule(
      state.season,
      state.teams,
      state.schedule,
    );
    state.schedule.push(...confGames);
    generateWeeklyTonyBrunoSegment(state, 20);
    return {
      headline: 'AFC & NFC CONFERENCE CHAMPIONSHIP SUNDAY!',
      details: 'Four teams remain! Winners punch their ticket to the Championship Bowl!',
    };
  }

  // Completed Week 20 (Conf Championships) -> Championship Bowl (Week 21)
  if (completedWeek === 20) {
    state.week = 21;
    const bowlGames = generateChampionshipBowlSchedule(
      state.season,
      state.schedule,
    );
    state.schedule.push(...bowlGames);
    generateWeeklyTonyBrunoSegment(state, 21);
    return {
      headline: 'CHAMPIONSHIP BOWL SUNDAY!',
      details: 'The AFC Champion and NFC Champion collide for the Lombardi Trophy!',
    };
  }

  // Completed Week 21 (Championship Bowl) -> Crown Champion & Enter Offseason Stage 1!
  const bowlGame = state.schedule.find(
    (g) => g.season === state.season && g.stage === 'BOWL' && g.played,
  );
  if (bowlGame) {
    const winId =
      bowlGame.homeScore >= bowlGame.awayScore
        ? bowlGame.homeTeamId
        : bowlGame.awayTeamId;
    const loseId =
      bowlGame.homeScore >= bowlGame.awayScore
        ? bowlGame.awayTeamId
        : bowlGame.homeTeamId;
    const winTeam = state.teams.find((t) => t.id === winId)!;
    const loseTeam = state.teams.find((t) => t.id === loseId)!;
    const userTeam = state.teams.find((t) => t.id === state.userTeamId)!;

    winTeam.championshipsWon++;
    state.championsHistory.unshift({
      season: state.season,
      winnerTeamId: winTeam.id,
      winnerName: `${winTeam.city} ${winTeam.name}`,
      loserTeamId: loseTeam.id,
      loserName: `${loseTeam.city} ${loseTeam.name}`,
      score: `${Math.max(bowlGame.homeScore, bowlGame.awayScore)}-${Math.min(bowlGame.homeScore, bowlGame.awayScore)}`,
      mvpName: bowlGame.mvpPlayerName ?? `${winTeam.city} MVP`,
      userRecord: `${userTeam.wins}-${userTeam.losses}${userTeam.ties > 0 ? `-${userTeam.ties}` : ''}`,
    });
  }

  computeSeasonAwardsAndRetirements(state);
  state.phase = 'OFFSEASON_AWARDS';

  return {
    headline: `${state.season} SEASON COMPLETE // OFFSEASON STAGE 1: AWARDS & RETIREMENTS`,
    details:
      'Review the Season Award winners, Championship Bowl recap, and Hall of Fame retirements before starting contract negotiations.',
  };
}
