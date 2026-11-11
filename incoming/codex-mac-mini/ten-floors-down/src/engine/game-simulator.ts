import {
  DefensivePlayId,
  FranchiseState,
  LiveGameState,
  OffensivePlayId,
  PlayAnimationToken,
  Player,
  Position,
  ScheduledGame,
  Team,
} from '../models/types';
import { createSeededRng, getTeamRatings } from './rosters-and-generator';

export interface OffensivePlayDefinition {
  id: OffensivePlayId;
  name: string;
  formation: string;
  category: 'RUN' | 'PASS_SHORT' | 'PASS_DEEP' | 'SPECIAL';
  description: string;
}

export interface DefensivePlayDefinition {
  id: DefensivePlayId;
  name: string;
  formation: string;
  category: 'ZONE' | 'MAN' | 'BLITZ' | 'RUN_STOP';
  description: string;
}

export const OFFENSIVE_PLAYBOOK: OffensivePlayDefinition[] = [
  {
    id: 'IFORM_HB_BLAST',
    name: 'HB Iso Blast',
    formation: 'I-Form Pro',
    category: 'RUN',
    description: 'Lead fullback isolation power run between the tackles.',
  },
  {
    id: 'SINGLEBACK_STRETCH',
    name: 'Outside Zone Stretch',
    formation: 'Singleback Ace',
    category: 'RUN',
    description: 'Perimeter sweep testing the edge speed of your halfback.',
  },
  {
    id: 'PRO_COUNTER',
    name: 'Counter Trey Trap',
    formation: 'Pro Set Split',
    category: 'RUN',
    description: 'Misdirection counter behind pulling guards.',
  },
  {
    id: 'GOALLINE_ISO',
    name: 'Heavy Power Dive',
    formation: 'Goal Line Heavy',
    category: 'RUN',
    description: 'Short-yardage trench smash for 3rd & short or goal-to-go.',
  },
  {
    id: 'SINGLEBACK_SLANTS',
    name: 'West Coast Quick Slants',
    formation: 'Singleback 3WR',
    category: 'PASS_SHORT',
    description: 'High-percentage 3-step drop timing routes across the middle.',
  },
  {
    id: 'SHOTGUN_HB_SCREEN',
    name: 'HB Slip Screen',
    formation: 'Shotgun Spread',
    category: 'PASS_SHORT',
    description: 'Invite the pass rush and dump off behind a wall of blockers.',
  },
  {
    id: 'SHOTGUN_MESH_CORNER',
    name: 'TE Corner / Mesh',
    formation: 'Shotgun Bunch',
    category: 'PASS_SHORT',
    description: 'Crossing underneath mesh paired with a tight end corner route.',
  },
  {
    id: 'IFORM_PA_POST',
    name: 'Play-Action Deep Post',
    formation: 'I-Form Twin WR',
    category: 'PASS_DEEP',
    description: 'Hard play-fake freezes linebackers for a deep strike over the top.',
  },
  {
    id: 'SHOTGUN_FOUR_VERTS',
    name: 'Four Verticals Seam',
    formation: 'Shotgun 4WR',
    category: 'PASS_DEEP',
    description: 'Stretch the secondary vertically with four receivers down the seams.',
  },
  {
    id: 'FIELD_GOAL',
    name: 'Field Goal Unit',
    formation: 'Special Teams',
    category: 'SPECIAL',
    description: 'Send out the placekicker for 3 points (in range inside Opp 38).',
  },
  {
    id: 'PUNT',
    name: 'Punt Formation',
    formation: 'Special Teams',
    category: 'SPECIAL',
    description: 'Pin the opponent deep in their own territory on 4th down.',
  },
  {
    id: 'QB_KNEEL',
    name: 'Victory QB Kneel',
    formation: 'Victory I-Form',
    category: 'SPECIAL',
    description: 'Protect the football and bleed 40 seconds off the game clock.',
  },
];

export const DEFENSIVE_PLAYBOOK: DefensivePlayDefinition[] = [
  {
    id: 'COVER_2_TAMPABAY',
    name: 'Tampa 2 Sink',
    formation: '4-3 Over',
    category: 'ZONE',
    description: 'MLB drops deep down the middle pipe while corners jam the flats.',
  },
  {
    id: 'COVER_3_SKY',
    name: 'Cover 3 Sky',
    formation: '3-4 Solid',
    category: 'ZONE',
    description: 'Strong safety rolls down into the box with 3-deep zone shell.',
  },
  {
    id: 'NICKEL_MAN_UNDER',
    name: '2-Man Under Press',
    formation: 'Nickel 4-2-5',
    category: 'MAN',
    description: 'Tight man-to-man coverage underneath with two deep safeties.',
  },
  {
    id: 'DIME_2MAN_DEEP',
    name: 'Dime Lockdown',
    formation: 'Dime 6-DB',
    category: 'MAN',
    description: 'Six defensive backs on the field to blanket spread passing attacks.',
  },
  {
    id: 'ZONE_BLITZ_43',
    name: 'Sam/Will Fire Zone Blitz',
    formation: '4-3 Under',
    category: 'BLITZ',
    description: 'Bring outside linebacker heat while dropping a defensive end into flat zone.',
  },
  {
    id: 'NICKEL_CORNER_BLITZ',
    name: 'Slot Cat Blitz',
    formation: 'Nickel Normal',
    category: 'BLITZ',
    description: 'Disguised slot cornerback blindside blitz off the edge.',
  },
  {
    id: 'ENGAGE_EIGHT_BLITZ',
    name: 'Engage Eight All-Out Blitz',
    formation: '3-4 Predator',
    category: 'BLITZ',
    description: 'Eight-man pass rush leaving single coverage across the board!',
  },
  {
    id: 'BEAR_46_RUN_STOP',
    name: '46 Bear Enforcer Box',
    formation: '46 Bear',
    category: 'RUN_STOP',
    description: 'Eight men in the box built to crush inside runs and unleash Hit Sticks.',
  },
  {
    id: 'GOALLINE_STACK',
    name: 'Goal Line Trench Wall',
    formation: 'Goal Line 5-3',
    category: 'RUN_STOP',
    description: 'Maximum beef on the line of scrimmage to stuff short-yardage plunges.',
  },
  {
    id: 'PREVENT_DEEP',
    name: 'Prevent 3-Man Rush',
    formation: 'Quarter Prevent',
    category: 'ZONE',
    description: 'Keep everything in front of the secondary to deny Hail Mary bombs.',
  },
];

function getStarter(
  teamId: string,
  pos: Position,
  players: Player[],
  slot = 1,
): Player | undefined {
  const group = players
    .filter((p) => p.teamId === teamId && p.position === pos && p.injuryWeeks === 0)
    .sort((a, b) => a.depthOrder - b.depthOrder || b.overall - a.overall);
  if (group.length >= slot) return group[slot - 1];
  const fallback = players
    .filter((p) => p.teamId === teamId && p.position === pos)
    .sort((a, b) => a.depthOrder - b.depthOrder || b.overall - a.overall);
  return fallback[slot - 1] ?? fallback[0];
}

export function updateHomeTeamFinancesAfterGame(
  homeTeam: Team,
  awayTeam: Team,
  homeWon: boolean,
): void {
  const priceFactor = Math.max(
    0.55,
    Math.min(1.04, 1.15 - (homeTeam.finances.ticketPrice - 55) * 0.006),
  );
  const fanFactor = 0.72 + (homeTeam.fanSupport / 100) * 0.28;
  const marqueeBoost = awayTeam.prestige >= 4 ? 1.05 : 1.0;
  const fillRate = Math.min(1.0, priceFactor * fanFactor * marqueeBoost);
  const attendance = Math.round(homeTeam.stadiumCapacity * fillRate);

  const gateRevM = (attendance * homeTeam.finances.ticketPrice) / 1_000_000;
  const concRevM = (attendance * homeTeam.finances.concessionPrice * 0.65) / 1_000_000;
  const parkRevM = (attendance * 0.28 * homeTeam.finances.parkingPrice) / 1_000_000;
  const gameRevenueM = Number((gateRevM + concRevM + parkRevM).toFixed(2));
  const gameExpenseM = Number(
    (1.45 + homeTeam.finances.marketingBudgetM / 8).toFixed(2),
  );

  homeTeam.finances.lastAttendance = attendance;
  homeTeam.finances.seasonRevenueM = Number(
    (homeTeam.finances.seasonRevenueM + gameRevenueM).toFixed(2),
  );
  homeTeam.finances.seasonExpensesM = Number(
    (homeTeam.finances.seasonExpensesM + gameExpenseM).toFixed(2),
  );
  homeTeam.finances.ownerCashM = Number(
    (homeTeam.finances.ownerCashM + gameRevenueM - gameExpenseM).toFixed(2),
  );

  if (homeWon) {
    homeTeam.fanSupport = Math.min(100, homeTeam.fanSupport + 2);
    awayTeam.fanSupport = Math.max(40, awayTeam.fanSupport - 1);
  } else {
    homeTeam.fanSupport = Math.max(40, homeTeam.fanSupport - 2);
    awayTeam.fanSupport = Math.min(100, awayTeam.fanSupport + 2);
  }
}

export function applyGameResultToStandings(
  game: ScheduledGame,
  homeTeam: Team,
  awayTeam: Team,
): void {
  if (game.stage !== 'REG') return;

  homeTeam.pointsFor += game.homeScore;
  homeTeam.pointsAgainst += game.awayScore;
  awayTeam.pointsFor += game.awayScore;
  awayTeam.pointsAgainst += game.homeScore;

  const sameConf = homeTeam.conference === awayTeam.conference;
  const sameDiv = sameConf && homeTeam.division === awayTeam.division;

  if (game.homeScore > game.awayScore) {
    homeTeam.wins++;
    awayTeam.losses++;
    homeTeam.streak = homeTeam.streak > 0 ? homeTeam.streak + 1 : 1;
    awayTeam.streak = awayTeam.streak < 0 ? awayTeam.streak - 1 : -1;
    if (sameConf) {
      homeTeam.confWins++;
      awayTeam.confLosses++;
    }
    if (sameDiv) {
      homeTeam.divisionWins++;
      awayTeam.divisionLosses++;
    }
  } else if (game.awayScore > game.homeScore) {
    awayTeam.wins++;
    homeTeam.losses++;
    awayTeam.streak = awayTeam.streak > 0 ? awayTeam.streak + 1 : 1;
    homeTeam.streak = homeTeam.streak < 0 ? homeTeam.streak - 1 : -1;
    if (sameConf) {
      awayTeam.confWins++;
      homeTeam.confLosses++;
    }
    if (sameDiv) {
      awayTeam.divisionWins++;
      homeTeam.divisionLosses++;
    }
  } else {
    homeTeam.ties++;
    awayTeam.ties++;
    homeTeam.streak = 0;
    awayTeam.streak = 0;
  }
}

function recordSimulatedTeamStats(
  team: Team,
  oppTeam: Team,
  pointsScored: number,
  players: Player[],
  rng: () => number,
): {
  totalYards: number;
  turnovers: number;
  topPerformer: Player | undefined;
  topLine: string;
} {
  const qb = getStarter(team.id, 'QB', players, 1);
  const hb1 = getStarter(team.id, 'HB', players, 1);
  const hb2 = getStarter(team.id, 'HB', players, 2);
  const wr1 = getStarter(team.id, 'WR', players, 1);
  const wr2 = getStarter(team.id, 'WR', players, 2);
  const wr3 = getStarter(team.id, 'WR', players, 3);
  const te1 = getStarter(team.id, 'TE', players, 1);
  const dl1 = getStarter(team.id, 'DL', players, 1);
  const dl2 = getStarter(team.id, 'DL', players, 2);
  const lb1 = getStarter(team.id, 'LB', players, 1);
  const lb2 = getStarter(team.id, 'LB', players, 2);
  const cb1 = getStarter(team.id, 'CB', players, 1);
  const s1 = getStarter(team.id, 'S', players, 1);
  const k = getStarter(team.id, 'K', players, 1);
  const p = getStarter(team.id, 'P', players, 1);

  const activeRoster = players.filter(
    (pl) => pl.teamId === team.id && pl.injuryWeeks === 0,
  );
  activeRoster.forEach((pl) => {
    pl.stats.gamesPlayed++;
  });

  const tds = Math.max(0, Math.floor(pointsScored / 7));
  const fgs = Math.max(0, Math.round((pointsScored - tds * 7) / 3));

  const isRunHeavy = team.offenseScheme === 'Power Run';
  const passRatio = isRunHeavy ? 0.52 : 0.64;

  let passTDs = 0;
  let rushTDs = 0;
  for (let i = 0; i < tds; i++) {
    if (rng() < passRatio) passTDs++;
    else rushTDs++;
  }

  const passAtt = Math.round(25 + rng() * 14 + (isRunHeavy ? -4 : 4));
  const qbAccFactor = qb ? qb.attributes.throwAccuracy / 100 : 0.78;
  const cmpPct = Math.min(0.76, Math.max(0.48, 0.52 + (qbAccFactor - 0.7) * 0.45 + (rng() - 0.5) * 0.1));
  const passCmp = Math.round(passAtt * cmpPct);
  const passYards = Math.round(passCmp * (10.2 + rng() * 3.6) + passTDs * 14);
  const ints = rng() < 0.42 ? 1 + (rng() < 0.22 ? 1 : 0) : 0;

  if (qb) {
    qb.stats.passAttempts += passAtt;
    qb.stats.passCompletions += passCmp;
    qb.stats.passYards += passYards;
    qb.stats.passTDs += passTDs;
    qb.stats.interceptions += ints;
    qb.careerYards += passYards;
    qb.careerTouchdowns += passTDs;

    if (qb.attributes.speed >= 82) {
      const scrambles = 4 + Math.floor(rng() * 6);
      const scrambleYds = Math.round(scrambles * (5.2 + rng() * 3.5));
      qb.stats.rushAttempts += scrambles;
      qb.stats.rushYards += scrambleYds;
      qb.careerYards += scrambleYds;
    }
  }

  const totalCarries = Math.round(22 + rng() * 11 + (isRunHeavy ? 6 : 0));
  const hb1Carries = Math.round(totalCarries * 0.76);
  const hb2Carries = Math.max(2, totalCarries - hb1Carries);
  const hb1Ypc = 3.6 + ((hb1?.overall ?? 80) - 75) * 0.06 + (rng() - 0.4) * 1.4;
  const hb1Yards = Math.max(18, Math.round(hb1Carries * hb1Ypc));
  const hb2Yards = Math.max(6, Math.round(hb2Carries * (3.5 + rng() * 1.2)));
  const fumbles = rng() < 0.24 ? 1 : 0;

  if (hb1) {
    hb1.stats.rushAttempts += hb1Carries;
    hb1.stats.rushYards += hb1Yards;
    hb1.stats.rushTDs += rushTDs;
    hb1.stats.fumbles += fumbles;
    hb1.careerYards += hb1Yards;
    hb1.careerTouchdowns += rushTDs;
  }
  if (hb2) {
    hb2.stats.rushAttempts += hb2Carries;
    hb2.stats.rushYards += hb2Yards;
    hb2.careerYards += hb2Yards;
  }

  // Distribute receptions & receiving yards across WR1, WR2, TE1, WR3, HB1
  const receivers = [
    { player: wr1, share: 0.34 },
    { player: wr2, share: 0.25 },
    { player: te1, share: 0.2 },
    { player: wr3, share: 0.12 },
    { player: hb1, share: 0.09 },
  ];

  let remCmp = passCmp;
  let remYds = passYards;
  let remTD = passTDs;

  receivers.forEach((slot, idx) => {
    const pl = slot.player;
    if (!pl) return;
    const isLast = idx === receivers.length - 1;
    const rec = isLast ? Math.max(0, remCmp) : Math.min(remCmp, Math.round(passCmp * slot.share));
    const yds = isLast ? Math.max(0, remYds) : Math.min(remYds, Math.round(passYards * slot.share));
    const td = isLast ? remTD : remTD > 0 && rng() < slot.share * 1.45 ? 1 : 0;

    remCmp -= rec;
    remYds -= yds;
    remTD = Math.max(0, remTD - td);

    pl.stats.targets += Math.round(rec * 1.45);
    pl.stats.receptions += rec;
    pl.stats.recYards += yds;
    pl.stats.recTDs += td;
    pl.careerYards += yds;
    pl.careerTouchdowns += td;
  });

  // Defensive stats
  const defStandouts = [lb1, lb2, dl1, dl2, s1, cb1].filter(
    (d): d is Player => Boolean(d),
  );
  defStandouts.forEach((def, idx) => {
    const tkl =
      def.position === 'LB'
        ? 6 + Math.floor(rng() * 6)
        : def.position === 'S'
          ? 4 + Math.floor(rng() * 5)
          : 3 + Math.floor(rng() * 4);
    def.stats.tackles += tkl;
    if (['DL', 'LB'].includes(def.position) && rng() < 0.38) {
      const sk = rng() < 0.22 ? 2 : 1;
      def.stats.sacks += sk;
      def.stats.tacklesForLoss += sk;
      def.careerSacks += sk;
    }
    if (['CB', 'S', 'LB'].includes(def.position) && rng() < (idx >= 4 ? 0.26 : 0.12)) {
      def.stats.defInterceptions += 1;
      def.stats.passDeflections += 1 + Math.floor(rng() * 2);
      def.careerInterceptions += 1;
    }
    if (def.attributes.hitPower >= 88 && rng() < 0.22) {
      def.stats.forcedFumbles += 1;
    }
  });

  if (k) {
    k.stats.fgMade += fgs;
    k.stats.fgAttempts += fgs + (rng() < 0.2 ? 1 : 0);
    k.stats.xpMade += tds;
    k.stats.xpAttempts += tds;
  }
  if (p) {
    const punts = 3 + Math.floor(rng() * 3);
    p.stats.punts += punts;
    p.stats.puntYards += punts * (42 + Math.floor(rng() * 6));
  }

  // Subtle injury check (trainer rating mitigates risk)
  const trainerMitigation = (team.coaches.trainer.rating - 70) * 0.0012;
  if (rng() < Math.max(0.03, 0.075 - trainerMitigation)) {
    const candidate = activeRoster[Math.floor(rng() * activeRoster.length)];
    if (candidate && candidate.position !== 'K' && candidate.position !== 'P') {
      candidate.injuryWeeks = 1 + Math.floor(rng() * 3);
      const injuries = [
        'Sprained Ankle',
        'Bruised Ribs',
        'Tight Hamstring',
        'Turf Toe',
        'Shoulder Stinger',
      ];
      candidate.injuryType = injuries[Math.floor(rng() * injuries.length)];
    }
  }

  const totalYards = passYards + hb1Yards + hb2Yards;
  const turnovers = ints + fumbles;

  // Pick top performer
  let topPerformer = qb;
  let topLine = qb
    ? `${passCmp}/${passAtt}, ${passYards} YDS, ${passTDs} TD`
    : 'Team Effort';

  if (hb1 && (hb1Yards >= 115 || rushTDs >= 2)) {
    topPerformer = hb1;
    topLine = `${hb1Carries} CAR, ${hb1Yards} YDS, ${rushTDs} TD`;
  } else if (lb1 && lb1.attributes.hitPower >= 92 && rng() < 0.28) {
    topPerformer = lb1;
    topLine = `10 TAK, 1 SACK, 1 FORCED FUMBLE (Hit Stick!)`;
  }

  void oppTeam;
  return { totalYards, turnovers, topPerformer, topLine };
}

export function simulateScheduledGame(
  game: ScheduledGame,
  state: FranchiseState,
  seedOffset = 0,
): ScheduledGame {
  if (game.played) return game;

  const homeTeam = state.teams.find((t) => t.id === game.homeTeamId);
  const awayTeam = state.teams.find((t) => t.id === game.awayTeamId);
  if (!homeTeam || !awayTeam) return game;

  const rng = createSeededRng(
    state.season * 10000 + game.week * 100 + game.id.length * 17 + seedOffset,
  );

  const homeRatings = getTeamRatings(homeTeam.id, state.players);
  const awayRatings = getTeamRatings(awayTeam.id, state.players);

  const homeCoachBonus = (homeTeam.coaches.hc.rating - 80) * 0.22;
  const awayCoachBonus = (awayTeam.coaches.hc.rating - 80) * 0.22;

  // Homefield advantage (+2.5 pts) + rating differential
  const homeAdvantage =
    (homeRatings.overall +
      homeCoachBonus -
      (awayRatings.overall + awayCoachBonus)) *
      0.65 +
    2.5;

  const baseHomePts = 21 + homeAdvantage * 0.55 + (rng() - 0.48) * 18;
  const baseAwayPts = 20 - homeAdvantage * 0.45 + (rng() - 0.48) * 18;

  const realisticFootballScore = (raw: number): number => {
    const clamped = Math.max(3, Math.min(45, Math.round(raw)));
    const commonScores = [
      3, 6, 7, 9, 10, 13, 14, 16, 17, 20, 21, 23, 24, 27, 28, 30, 31, 34, 35,
      38, 41, 42,
    ];
    let closest = commonScores[0];
    for (const s of commonScores) {
      if (Math.abs(s - clamped) < Math.abs(closest - clamped)) {
        closest = s;
      }
    }
    return closest;
  };

  let homeScore = realisticFootballScore(baseHomePts);
  let awayScore = realisticFootballScore(baseAwayPts);
  let isOvertime = false;

  if (homeScore === awayScore) {
    isOvertime = true;
    if (rng() < 0.53) {
      homeScore += rng() < 0.65 ? 3 : 6;
    } else {
      awayScore += rng() < 0.65 ? 3 : 6;
    }
  }

  game.homeScore = homeScore;
  game.awayScore = awayScore;
  game.isOvertime = isOvertime;
  game.played = true;

  const homePerf = recordSimulatedTeamStats(
    homeTeam,
    awayTeam,
    homeScore,
    state.players,
    rng,
  );
  const awayPerf = recordSimulatedTeamStats(
    awayTeam,
    homeTeam,
    awayScore,
    state.players,
    rng,
  );

  game.homeYards = homePerf.totalYards;
  game.awayYards = awayPerf.totalYards;
  game.homeTurnovers = homePerf.turnovers;
  game.awayTurnovers = awayPerf.turnovers;

  const homeWon = homeScore > awayScore;
  const winTeam = homeWon ? homeTeam : awayTeam;
  const loseTeam = homeWon ? awayTeam : homeTeam;
  const winPerf = homeWon ? homePerf : awayPerf;

  game.mvpPlayerId = winPerf.topPerformer?.id;
  game.mvpPlayerName = winPerf.topPerformer
    ? `${winPerf.topPerformer.firstName} ${winPerf.topPerformer.lastName}`
    : `${winTeam.city} Defense`;
  game.mvpSummary = winPerf.topLine;
  game.headline = `${winTeam.city} ${winTeam.name} defeat ${loseTeam.city} ${Math.max(homeScore, awayScore)}-${Math.min(homeScore, awayScore)}${isOvertime ? ' (OT)' : ''}`;

  applyGameResultToStandings(game, homeTeam, awayTeam);
  updateHomeTeamFinancesAfterGame(homeTeam, awayTeam, homeWon);

  return game;
}

// ============================================================================
// INTERACTIVE LIVE GAME ENGINE (Playcaller + 11-on-11 Tactical Field Visualizer)
// ============================================================================

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins}:${rem.toString().padStart(2, '0')}`;
}

function buildFieldTokensForPlay(
  ballOn: number,
  possession: 'HOME' | 'AWAY',
  yardsGained: number,
  playType: 'RUN' | 'PASS_SHORT' | 'PASS_DEEP' | 'SPECIAL',
  isBigHit: boolean,
): {
  tokens: PlayAnimationToken[];
  ballPath: LiveGameState['lastPlayBallPath'];
} {
  // ballOn is 1..99 from possessing team's own goal line.
  // Convert to absolute field X (0..100 between endzones)
  const dir = possession === 'HOME' ? 1 : -1;
  const losX = possession === 'HOME' ? ballOn : 100 - ballOn;
  const endBallX = Math.max(
    2,
    Math.min(98, losX + dir * Math.max(-10, Math.min(60, yardsGained))),
  );

  const tokens: PlayAnimationToken[] = [];

  // 5 Offensive Linemen
  const olYs = [21, 24, 26.6, 29.2, 32.2];
  olYs.forEach((y, idx) => {
    tokens.push({
      id: `OFF_OL_${idx}`,
      label: idx === 2 ? 'C' : 'OL',
      side: 'OFF',
      startX: losX - dir * 1.2,
      startY: y,
      endX: losX + dir * (playType === 'RUN' ? 2.5 : -1.5),
      endY: y,
    });
  });

  // QB
  tokens.push({
    id: 'OFF_QB',
    label: 'QB',
    side: 'OFF',
    startX: losX - dir * 4,
    startY: 26.6,
    endX: losX - dir * 6.5,
    endY: 26.6,
  });

  // HB
  tokens.push({
    id: 'OFF_HB',
    label: 'HB',
    side: 'OFF',
    startX: losX - dir * 6.5,
    startY: 24,
    endX: playType === 'RUN' ? endBallX : losX + dir * 4,
    endY: playType === 'RUN' ? 25.5 : 16,
    isBallCarrier: playType === 'RUN',
  });

  // WR1, WR2, WR3, TE
  const recConfigs = [
    { id: 'OFF_WR1', label: 'WR1', sy: 8, ey: 10, depth: playType === 'PASS_DEEP' ? 24 : 11 },
    { id: 'OFF_WR2', label: 'WR2', sy: 45, ey: 42, depth: playType === 'PASS_DEEP' ? 22 : 9 },
    { id: 'OFF_WR3', label: 'SLOT', sy: 15, ey: 24, depth: 12 },
    { id: 'OFF_TE', label: 'TE', sy: 35.5, ey: 33, depth: 10 },
  ];
  recConfigs.forEach((rc, idx) => {
    const isTarget = playType !== 'RUN' && idx === 0;
    tokens.push({
      id: rc.id,
      label: rc.label,
      side: 'OFF',
      startX: losX - dir * 1.5,
      startY: rc.sy,
      endX: isTarget ? endBallX : Math.max(4, Math.min(96, losX + dir * rc.depth)),
      endY: rc.ey,
      isTarget,
      isBallCarrier: isTarget,
    });
  });

  // 11 Defenders (4 DL, 3 LB, 2 CB, 2 S)
  const dlYs = [22, 25, 28, 31];
  dlYs.forEach((y, idx) => {
    tokens.push({
      id: `DEF_DL_${idx}`,
      label: 'DL',
      side: 'DEF',
      startX: losX + dir * 1.5,
      startY: y,
      endX: losX + dir * (playType === 'RUN' ? 0.5 : -2.5),
      endY: y,
    });
  });

  const lbYs = [19, 26.6, 34];
  lbYs.forEach((y, idx) => {
    const isHitStickLb = idx === 1 && isBigHit;
    tokens.push({
      id: `DEF_LB_${idx}`,
      label: idx === 1 ? 'MLB' : 'LB',
      side: 'DEF',
      startX: losX + dir * 5.5,
      startY: y,
      endX: isHitStickLb ? endBallX : losX + dir * (playType === 'RUN' ? 3 : 8),
      endY: isHitStickLb ? (playType === 'RUN' ? 25.5 : 10) : y,
      hitStickHighlight: isHitStickLb,
    });
  });

  // 2 CB + 2 Safeties
  const dbConfigs = [
    { id: 'DEF_CB1', label: 'CB', sx: 6, sy: 8, ey: 10 },
    { id: 'DEF_CB2', label: 'CB', sx: 6, sy: 45, ey: 42 },
    { id: 'DEF_FS', label: 'FS', sx: 15, sy: 20, ey: 18 },
    { id: 'DEF_SS', label: 'SS', sx: 13, sy: 33, ey: 31 },
  ];
  dbConfigs.forEach((db, idx) => {
    tokens.push({
      id: db.id,
      label: db.label,
      side: 'DEF',
      startX: Math.max(3, Math.min(97, losX + dir * db.sx)),
      startY: db.sy,
      endX: idx === 0 && playType !== 'RUN' ? endBallX : Math.max(3, Math.min(97, losX + dir * (db.sx + 4))),
      endY: db.ey,
      hitStickHighlight: idx === 3 && isBigHit,
    });
  });

  const ballPath: LiveGameState['lastPlayBallPath'] =
    playType === 'RUN'
      ? {
          fromX: losX - dir * 4,
          fromY: 26.6,
          toX: endBallX,
          toY: 25.5,
          type: 'RUN',
          complete: true,
        }
      : {
          fromX: losX - dir * 5,
          fromY: 26.6,
          toX: endBallX,
          toY: 10,
          type: playType === 'SPECIAL' ? 'KICK' : 'PASS',
          complete: yardsGained > 0,
        };

  return { tokens, ballPath };
}

export function createLiveGameState(
  game: ScheduledGame,
  state: FranchiseState,
): LiveGameState {
  const userSide: 'HOME' | 'AWAY' =
    game.homeTeamId === state.userTeamId ? 'HOME' : 'AWAY';
  const initialVisual = buildFieldTokensForPlay(25, 'HOME', 0, 'RUN', false);

  return {
    scheduledGameId: game.id,
    homeTeamId: game.homeTeamId,
    awayTeamId: game.awayTeamId,
    userSide,
    quarter: 1,
    clockSeconds: 900, // 15:00 quarters (accelerated clock per play)
    possession: 'HOME',
    down: 1,
    toGo: 10,
    ballOn: 25,
    homeScore: 0,
    awayScore: 0,
    homeTimeouts: 3,
    awayTimeouts: 3,
    homeMomentum: 0,
    hitStickArmed: false,
    offAdjustment: 'NONE',
    defAdjustment: 'NONE',
    homeStats: {
      passYards: 0,
      rushYards: 0,
      firstDowns: 0,
      turnovers: 0,
      sacks: 0,
      hitSticks: 0,
    },
    awayStats: {
      passYards: 0,
      rushYards: 0,
      firstDowns: 0,
      turnovers: 0,
      sacks: 0,
      hitSticks: 0,
    },
    playLog: [],
    lastPlayTokens: initialVisual.tokens,
    lastPlayBallPath: initialVisual.ballPath,
    lastPlayBanner: 'KICKOFF! First & 10 from the 25-yard line.',
    isGameOver: false,
  };
}

export function executeLiveGamePlay(
  live: LiveGameState,
  state: FranchiseState,
  chosenOffPlayId?: OffensivePlayId,
  chosenDefPlayId?: DefensivePlayId,
): LiveGameState {
  if (live.isGameOver) return live;

  const homeTeam = state.teams.find((t) => t.id === live.homeTeamId)!;
  const awayTeam = state.teams.find((t) => t.id === live.awayTeamId)!;
  const offTeam = live.possession === 'HOME' ? homeTeam : awayTeam;
  const defTeam = live.possession === 'HOME' ? awayTeam : homeTeam;
  const offStats = live.possession === 'HOME' ? live.homeStats : live.awayStats;
  const defStats = live.possession === 'HOME' ? live.awayStats : live.homeStats;

  const offRatings = getTeamRatings(offTeam.id, state.players);
  const defRatings = getTeamRatings(defTeam.id, state.players);

  const qb = getStarter(offTeam.id, 'QB', state.players, 1);
  const hb = getStarter(offTeam.id, 'HB', state.players, 1);
  const wr1 = getStarter(offTeam.id, 'WR', state.players, 1);
  const te = getStarter(offTeam.id, 'TE', state.players, 1);
  const k = getStarter(offTeam.id, 'K', state.players, 1);
  const mlb = getStarter(defTeam.id, 'LB', state.players, 1);
  const de = getStarter(defTeam.id, 'DL', state.players, 1);
  const fs = getStarter(defTeam.id, 'S', state.players, 1);

  // Pick CPU play if user is on the other side
  let offPlayId: OffensivePlayId = chosenOffPlayId ?? 'IFORM_HB_BLAST';
  if (!chosenOffPlayId) {
    if (live.down === 4) {
      offPlayId = live.ballOn >= 63 ? 'FIELD_GOAL' : 'PUNT';
    } else if (live.toGo <= 2) {
      offPlayId = 'GOALLINE_ISO';
    } else if (live.toGo >= 9) {
      offPlayId = Math.random() < 0.5 ? 'SHOTGUN_FOUR_VERTS' : 'IFORM_PA_POST';
    } else {
      const cpuOffPool: OffensivePlayId[] = [
        'IFORM_HB_BLAST',
        'SINGLEBACK_STRETCH',
        'SINGLEBACK_SLANTS',
        'SHOTGUN_MESH_CORNER',
        'IFORM_PA_POST',
      ];
      offPlayId = cpuOffPool[Math.floor(Math.random() * cpuOffPool.length)];
    }
  }

  let defPlayId: DefensivePlayId = chosenDefPlayId ?? 'COVER_2_TAMPABAY';
  if (!chosenDefPlayId) {
    const cpuDefPool: DefensivePlayId[] = [
      'COVER_2_TAMPABAY',
      'COVER_3_SKY',
      'NICKEL_MAN_UNDER',
      'ZONE_BLITZ_43',
      'BEAR_46_RUN_STOP',
    ];
    defPlayId = cpuDefPool[Math.floor(Math.random() * cpuDefPool.length)];
  }

  const offPlay =
    OFFENSIVE_PLAYBOOK.find((p) => p.id === offPlayId) ?? OFFENSIVE_PLAYBOOK[0];
  const defPlay =
    DEFENSIVE_PLAYBOOK.find((p) => p.id === defPlayId) ?? DEFENSIVE_PLAYBOOK[0];

  const clockStr = formatClock(live.clockSeconds);
  const ratingEdge = (offRatings.offense - defRatings.defense) * 0.16;

  // Handle Special Teams first
  if (offPlay.id === 'PUNT') {
    const puntDist = Math.round(41 + Math.random() * 12);
    const nextBall = Math.max(20, 100 - Math.min(95, live.ballOn + puntDist));
    const desc = `[PUNT] ${offTeam.abbr} punts ${puntDist} yards. ${defTeam.abbr} takes over at their own ${nextBall}.`;
    const vis = buildFieldTokensForPlay(live.ballOn, live.possession, puntDist, 'SPECIAL', false);
    live.lastPlayTokens = vis.tokens;
    live.lastPlayBallPath = vis.ballPath;
    live.lastPlayBanner = desc;
    live.playLog.unshift({
      id: `PL_${Date.now()}_${Math.random()}`,
      quarter: live.quarter,
      clock: clockStr,
      possessionAbbr: offTeam.abbr,
      description: desc,
      yardsGained: 0,
    });
    flipPossession(live, nextBall);
    advanceClock(live, 36);
    return live;
  }

  if (offPlay.id === 'FIELD_GOAL') {
    const kickDist = 100 - live.ballOn + 17;
    const kAcc = k?.attributes.kickAccuracy ?? 82;
    const makeProb = Math.max(0.15, Math.min(0.97, 0.96 - Math.max(0, kickDist - 32) * 0.024 + (kAcc - 80) * 0.008));
    const isGood = kickDist <= 59 && Math.random() < makeProb;
    const kickerName = k ? `${k.firstName} ${k.lastName}` : `${offTeam.abbr} Kicker`;

    if (k) {
      k.stats.fgAttempts++;
      if (isGood) k.stats.fgMade++;
    }

    const vis = buildFieldTokensForPlay(live.ballOn, live.possession, 100 - live.ballOn, 'SPECIAL', false);
    live.lastPlayTokens = vis.tokens;
    live.lastPlayBallPath = vis.ballPath;

    if (isGood) {
      if (live.possession === 'HOME') live.homeScore += 3;
      else live.awayScore += 3;
      const desc = `[FIELD GOAL GOOD!] ${kickerName} drills the ${kickDist}-yard Field Goal! (+3 PTS)`;
      live.lastPlayBanner = desc;
      live.playLog.unshift({
        id: `PL_${Date.now()}_${Math.random()}`,
        quarter: live.quarter,
        clock: clockStr,
        possessionAbbr: offTeam.abbr,
        description: desc,
        yardsGained: 0,
        isScoringPlay: true,
      });
      flipPossession(live, 25);
    } else {
      const desc = `[MISSED FG] ${kickerName}'s ${kickDist}-yard FG attempt sails wide right!`;
      live.lastPlayBanner = desc;
      live.playLog.unshift({
        id: `PL_${Date.now()}_${Math.random()}`,
        quarter: live.quarter,
        clock: clockStr,
        possessionAbbr: offTeam.abbr,
        description: desc,
        yardsGained: 0,
      });
      flipPossession(live, Math.max(20, 100 - live.ballOn));
    }
    advanceClock(live, 32);
    return live;
  }

  if (offPlay.id === 'QB_KNEEL') {
    const desc = `${qb?.firstName ?? ''} ${qb?.lastName ?? 'QB'} takes a knee for -1 yard to burn clock.`;
    live.ballOn = Math.max(1, live.ballOn - 1);
    live.down = (live.down + 1) as 1 | 2 | 3 | 4;
    live.toGo += 1;
    live.lastPlayBanner = desc;
    live.playLog.unshift({
      id: `PL_${Date.now()}_${Math.random()}`,
      quarter: live.quarter,
      clock: clockStr,
      possessionAbbr: offTeam.abbr,
      description: desc,
      yardsGained: -1,
    });
    advanceClock(live, 40);
    return live;
  }

  // Evaluate tactical matchup between Offensive Play & Defensive Play + Pre-Snap Adjustments
  let tacticalBonus = 0;
  if (offPlay.category === 'RUN' && defPlay.category === 'RUN_STOP') tacticalBonus -= 3.8;
  if (offPlay.category === 'RUN' && defPlay.category === 'MAN') tacticalBonus += 2.6;
  if (offPlay.category === 'PASS_SHORT' && defPlay.category === 'BLITZ') {
    tacticalBonus += offPlay.id === 'SHOTGUN_HB_SCREEN' ? 6.5 : 2.2;
  }
  if (offPlay.category === 'PASS_DEEP' && defPlay.category === 'BLITZ') {
    // High variance: sack risk vs big play!
    tacticalBonus += Math.random() < 0.45 ? -8 : 11;
  }
  if (offPlay.category === 'PASS_DEEP' && defPlay.category === 'ZONE') tacticalBonus -= 2.5;

  // Pre-snap adjustments
  if (live.defAdjustment === 'PINCH_DL' && offPlay.id === 'IFORM_HB_BLAST') tacticalBonus -= 2.5;
  if (live.defAdjustment === 'PRESS_CB' && offPlay.id === 'SINGLEBACK_SLANTS') tacticalBonus -= 2.5;
  if (live.offAdjustment === 'HOT_ROUTE_STREAK' && defPlay.category === 'BLITZ') tacticalBonus += 5.5;

  const hitStickActive = live.hitStickArmed;
  const offAdjustmentActive = live.offAdjustment;
  live.hitStickArmed = false; // reset after snap
  live.offAdjustment = 'NONE';
  live.defAdjustment = 'NONE';

  let yardsGained = 0;
  let isBigHit = false;
  let isTurnover = false;
  let isScoringPlay = false;
  let description = '';

  const qbName = qb ? `${qb.firstName} ${qb.lastName}` : `${offTeam.abbr} QB`;
  const hbName = hb ? `${hb.firstName} ${hb.lastName}` : `${offTeam.abbr} HB`;
  const wrName = wr1 ? `${wr1.firstName} ${wr1.lastName}` : `${offTeam.abbr} WR`;
  const teName = te ? `${te.firstName} ${te.lastName}` : `${offTeam.abbr} TE`;
  const mlbName = mlb ? `${mlb.firstName} ${mlb.lastName}` : `${defTeam.abbr} MLB`;
  const deName = de ? `${de.firstName} ${de.lastName}` : `${defTeam.abbr} DE`;
  const fsName = fs ? `${fs.firstName} ${fs.lastName}` : `${defTeam.abbr} Safety`;

  if (offPlay.category === 'RUN') {
    yardsGained = Math.round(
      4.2 + ratingEdge + tacticalBonus + (Math.random() - 0.44) * 9,
    );
    if (Math.random() < 0.11 && (hb?.attributes.speed ?? 85) >= 88) {
      yardsGained += 12 + Math.floor(Math.random() * 18);
    }

    // Hit Stick impact check!
    if (hitStickActive) {
      if (Math.random() < 0.62) {
        isBigHit = true;
        defStats.hitSticks++;
        yardsGained = Math.min(2, yardsGained - 4);
        if (mlb) mlb.stats.tackles++;
        if (Math.random() < 0.28) {
          isTurnover = true;
          offStats.turnovers++;
          if (mlb) mlb.stats.forcedFumbles++;
          description = `💥 HIT STICK FUMBLE! ${mlbName} levels ${hbName} at the line and forces a turnover!`;
        } else {
          description = `💥 BONE-RATTLING HIT STICK! ${mlbName} stonewalls ${hbName} (${offPlay.name}) for ${yardsGained} yds!`;
        }
      } else {
        // Missed Hit Stick!
        yardsGained += 9;
        description = `${hbName} bounces off an aggressive Hit Stick lunge on ${offPlay.name} for +${yardsGained} yards!`;
      }
    } else {
      description = `${hbName} carries on ${offPlay.name} vs ${defPlay.name} for ${yardsGained >= 0 ? `+${yardsGained}` : yardsGained} yards.`;
    }

    if (hb) {
      hb.stats.rushAttempts++;
      if (!isTurnover) hb.stats.rushYards += yardsGained;
    }
    if (!isTurnover) offStats.rushYards += yardsGained;
  } else {
    // PASS PLAY
    if (qb) qb.stats.passAttempts++;
    const sackChance = defPlay.category === 'BLITZ' ? 0.16 : 0.08;

    if (Math.random() < sackChance && offAdjustmentActive !== 'MAX_PROTECT') {
      yardsGained = -(5 + Math.floor(Math.random() * 5));
      defStats.sacks++;
      if (de) de.stats.sacks++;
      description = `🚨 SACK! ${deName} bursts through on ${defPlay.name} to drop ${qbName} for ${yardsGained} yds!`;
    } else {
      const baseComp = offPlay.category === 'PASS_SHORT' ? 0.68 : 0.48;
      const compChance = Math.max(0.25, Math.min(0.84, baseComp + ratingEdge * 0.03 + tacticalBonus * 0.02));

      if (Math.random() < compChance) {
        const baseGain = offPlay.category === 'PASS_SHORT' ? 8 : 21;
        yardsGained = Math.max(
          2,
          Math.round(baseGain + ratingEdge + tacticalBonus + (Math.random() - 0.35) * 14),
        );
        const targetPlayer =
          offPlay.id === 'SHOTGUN_HB_SCREEN'
            ? hb
            : offPlay.id === 'SHOTGUN_MESH_CORNER'
              ? te
              : wr1;
        const targetName =
          offPlay.id === 'SHOTGUN_HB_SCREEN'
            ? hbName
            : offPlay.id === 'SHOTGUN_MESH_CORNER'
              ? teName
              : wrName;

        if (hitStickActive && Math.random() < 0.55) {
          isBigHit = true;
          defStats.hitSticks++;
          if (Math.random() < 0.24) {
            isTurnover = true;
            offStats.turnovers++;
            description = `💥 HIT STICK JARRED LOOSE! ${fsName} lowers the boom on ${targetName} and forces a fumble!`;
          } else {
            yardsGained = Math.max(1, yardsGained - 4);
            description = `💥 HIT STICK! ${qbName} hits ${targetName} (${offPlay.name}) for +${yardsGained} yds before ${fsName} delivers a thunderous hit!`;
          }
        } else {
          description = `${qbName} connects with ${targetName} on ${offPlay.name} for +${yardsGained} yards!`;
        }

        if (!isTurnover) {
          offStats.passYards += yardsGained;
          if (qb) {
            qb.stats.passCompletions++;
            qb.stats.passYards += yardsGained;
          }
          if (targetPlayer) {
            targetPlayer.stats.receptions++;
            targetPlayer.stats.recYards += yardsGained;
          }
        }
      } else if (Math.random() < 0.11) {
        isTurnover = true;
        offStats.turnovers++;
        if (qb) qb.stats.interceptions++;
        if (fs) fs.stats.defInterceptions++;
        description = `🚨 INTERCEPTED! ${qbName}'s pass into ${defPlay.name} coverage is picked off by ${fsName}!`;
      } else {
        yardsGained = 0;
        description = `Incomplete pass from ${qbName} intended for ${wrName} (${defPlay.name} coverage).`;
      }
    }
  }

  const vis = buildFieldTokensForPlay(
    live.ballOn,
    live.possession,
    yardsGained,
    offPlay.category,
    isBigHit,
  );
  live.lastPlayTokens = vis.tokens;
  live.lastPlayBallPath = vis.ballPath;

  if (isTurnover) {
    live.lastPlayBanner = description;
    live.playLog.unshift({
      id: `PL_${Date.now()}_${Math.random()}`,
      quarter: live.quarter,
      clock: clockStr,
      possessionAbbr: offTeam.abbr,
      description,
      yardsGained: 0,
      isTurnover: true,
      isBigHit,
    });
    flipPossession(live, Math.max(15, Math.min(85, 100 - live.ballOn)));
    advanceClock(live, 34);
    return live;
  }

  // Advance ball
  const nextBall = live.ballOn + yardsGained;
  if (nextBall >= 100) {
    // TOUCHDOWN!
    yardsGained = 100 - live.ballOn;
    isScoringPlay = true;
    if (live.possession === 'HOME') live.homeScore += 7;
    else live.awayScore += 7;

    if (offPlay.category === 'RUN' && hb) hb.stats.rushTDs++;
    if (offPlay.category !== 'RUN') {
      if (qb) qb.stats.passTDs++;
      if (wr1) wr1.stats.recTDs++;
    }

    description = `🏈 TOUCHDOWN ${offTeam.name.toUpperCase()}! ${description} (PAT is GOOD, +7 PTS)`;
    live.lastPlayBanner = description;
    live.playLog.unshift({
      id: `PL_${Date.now()}_${Math.random()}`,
      quarter: live.quarter,
      clock: clockStr,
      possessionAbbr: offTeam.abbr,
      description,
      yardsGained,
      isScoringPlay: true,
      isBigHit,
    });
    flipPossession(live, 25);
    advanceClock(live, 38);
    return live;
  }

  if (nextBall <= 0) {
    // SAFETY!
    isScoringPlay = true;
    if (live.possession === 'HOME') live.awayScore += 2;
    else live.homeScore += 2;
    description = `🚨 SAFETY! ${defTeam.city} swarms the backfield in the endzone! (+2 PTS)`;
    live.lastPlayBanner = description;
    live.playLog.unshift({
      id: `PL_${Date.now()}_${Math.random()}`,
      quarter: live.quarter,
      clock: clockStr,
      possessionAbbr: offTeam.abbr,
      description,
      yardsGained,
      isScoringPlay: true,
    });
    flipPossession(live, 35);
    advanceClock(live, 34);
    return live;
  }

  live.ballOn = nextBall;
  if (yardsGained >= live.toGo) {
    live.down = 1;
    live.toGo = Math.min(10, 100 - live.ballOn);
    offStats.firstDowns++;
    description += ' [FIRST DOWN!]';
  } else {
    if (live.down === 4) {
      description += ` [TURNOVER ON DOWNS! ${defTeam.abbr} takes over!]`;
      live.lastPlayBanner = description;
      live.playLog.unshift({
        id: `PL_${Date.now()}_${Math.random()}`,
        quarter: live.quarter,
        clock: clockStr,
        possessionAbbr: offTeam.abbr,
        description,
        yardsGained,
        isTurnover: true,
      });
      flipPossession(live, 100 - live.ballOn);
      advanceClock(live, 35);
      return live;
    }
    live.down = (live.down + 1) as 1 | 2 | 3 | 4;
    live.toGo = Math.max(1, live.toGo - yardsGained);
  }

  live.lastPlayBanner = description;
  live.playLog.unshift({
    id: `PL_${Date.now()}_${Math.random()}`,
    quarter: live.quarter,
    clock: clockStr,
    possessionAbbr: offTeam.abbr,
    description,
    yardsGained,
    isScoringPlay,
    isBigHit,
  });

  advanceClock(live, yardsGained === 0 ? 18 : 36);
  return live;
}

function flipPossession(live: LiveGameState, newBallOn: number): void {
  live.possession = live.possession === 'HOME' ? 'AWAY' : 'HOME';
  live.ballOn = Math.max(1, Math.min(99, newBallOn));
  live.down = 1;
  live.toGo = Math.min(10, 100 - live.ballOn);
}

function advanceClock(live: LiveGameState, elapsedSeconds: number): void {
  live.clockSeconds -= elapsedSeconds;
  if (live.clockSeconds <= 0) {
    if (live.quarter < 4) {
      live.quarter = (live.quarter + 1) as 1 | 2 | 3 | 4;
      live.clockSeconds = 900;
      if (live.quarter === 3) {
        // Second half kickoff
        live.possession = 'AWAY';
        live.ballOn = 25;
        live.down = 1;
        live.toGo = 10;
        live.homeTimeouts = 3;
        live.awayTimeouts = 3;
      }
    } else if (live.quarter === 4 && live.homeScore === live.awayScore) {
      live.quarter = 5;
      live.clockSeconds = 600;
      live.lastPlayBanner = 'OVERTIME! Sudden-death rules in effect!';
    } else {
      live.clockSeconds = 0;
      live.isGameOver = true;
      live.lastPlayBanner = `FINAL WHISTLE! Final Score: ${live.awayScore} - ${live.homeScore}`;
    }
  } else if (live.quarter === 5 && live.homeScore !== live.awayScore) {
    live.clockSeconds = 0;
    live.isGameOver = true;
  }
}

export function simLiveGameDrive(
  live: LiveGameState,
  state: FranchiseState,
): LiveGameState {
  const startPossession = live.possession;
  const startQuarter = live.quarter;
  let guard = 0;
  while (
    !live.isGameOver &&
    live.possession === startPossession &&
    live.quarter === startQuarter &&
    guard < 16
  ) {
    executeLiveGamePlay(live, state);
    guard++;
  }
  return live;
}

export function commitLiveGameToFranchise(
  live: LiveGameState,
  state: FranchiseState,
): ScheduledGame | undefined {
  const game = state.schedule.find((g) => g.id === live.scheduledGameId);
  if (!game) return undefined;

  // If game wasn't finished yet, sim remaining plays
  let safety = 0;
  while (!live.isGameOver && safety < 140) {
    executeLiveGamePlay(live, state);
    safety++;
  }

  // Ensure no tie
  if (live.homeScore === live.awayScore) {
    live.homeScore += 3;
    live.quarter = 5;
  }

  const homeTeam = state.teams.find((t) => t.id === live.homeTeamId)!;
  const awayTeam = state.teams.find((t) => t.id === live.awayTeamId)!;

  game.played = true;
  game.homeScore = live.homeScore;
  game.awayScore = live.awayScore;
  game.isOvertime = live.quarter === 5;
  game.homeYards = live.homeStats.passYards + live.homeStats.rushYards;
  game.awayYards = live.awayStats.passYards + live.awayStats.rushYards;
  game.homeTurnovers = live.homeStats.turnovers;
  game.awayTurnovers = live.awayStats.turnovers;

  const homeWon = live.homeScore > live.awayScore;
  const winTeam = homeWon ? homeTeam : awayTeam;
  const loseTeam = homeWon ? awayTeam : homeTeam;
  const winQb = getStarter(winTeam.id, 'QB', state.players, 1);

  game.mvpPlayerId = winQb?.id;
  game.mvpPlayerName = winQb
    ? `${winQb.firstName} ${winQb.lastName}`
    : `${winTeam.city} Team`;
  game.mvpSummary = `Led ${winTeam.abbr} to victory (${Math.max(live.homeScore, live.awayScore)}-${Math.min(live.homeScore, live.awayScore)})`;
  game.headline = `${winTeam.city} ${winTeam.name} triumph over ${loseTeam.city} ${Math.max(live.homeScore, live.awayScore)}-${Math.min(live.homeScore, live.awayScore)}`;
  game.playByPlayHighlights = live.playLog.slice(0, 6).map((p) => p.description);

  // Increment gamesPlayed for both rosters
  state.players
    .filter((p) => p.teamId === homeTeam.id || p.teamId === awayTeam.id)
    .forEach((p) => {
      if (p.injuryWeeks === 0) p.stats.gamesPlayed++;
    });

  applyGameResultToStandings(game, homeTeam, awayTeam);
  updateHomeTeamFinancesAfterGame(homeTeam, awayTeam, homeWon);

  return game;
}
