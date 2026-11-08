import {
  BasePossessionDistribution,
  CONFIG,
  PossessionPoints,
  TacticalPlanId,
} from './config.ts';

export type PlayerRole = 'FWD' | 'MID' | 'DEF' | 'UTL';

export interface RosterPlayerTemplate {
  id: string;
  name: string;
  number: number;
  role: PlayerRole;
  roleTitle: string;
  bio: string;
  attack: number;
  defense: number;
  control: number;
  stamina: number;
  initialFatigue: number;
  defaultStarter: boolean;
}

export interface OpponentTendency {
  id: string;
  name: string;
  vulnerableTo: TacticalPlanId;
  summary: string;
  /** Shift (in [-0.15, +0.15]) added to Ironvale's 7-pt probability (and subtracted from 0-pt) when Ironvale attacks */
  clubPlanModifier: Record<TacticalPlanId, number>;
  /** Shift (in [-0.15, +0.15]) added to Opponent's 7-pt probability (and subtracted from 0-pt) when Opponent attacks */
  opponentPossessionModifier: Record<TacticalPlanId, number>;
}

export interface OpponentClub {
  id: string;
  fixtureNumber: number;
  name: string;
  shortName: string;
  nickname: string;
  primaryColor: string;
  secondaryColor: string;
  /** 5-starter equivalent aggregate Attack (scale ~25..36) */
  attack: number;
  /** 5-starter equivalent aggregate Defense (scale ~25..36) */
  defense: number;
  /** 5-starter equivalent aggregate Control (scale ~25..36) */
  control: number;
  defaultPlan: TacticalPlanId;
  scoutingReport: string;
  tacticalHint: string;
  tendency: OpponentTendency;
}

export interface TacticalPlanDefinition {
  id: TacticalPlanId;
  name: string;
  tagline: string;
  description: string;
  baseDistribution: BasePossessionDistribution;
  bestWhen: string;
}

export interface RecapTemplateContext {
  possessionIndex: number;
  half: 1 | 2;
  team: 'club' | 'opponent';
  points: PossessionPoints;
  tacticalPlan: TacticalPlanId;
  opponentName: string;
  tendencyName: string;
  keyPlayerName: string;
  keyPlayerRole: string;
  keyPlayerFatigue: number;
  supportPlayerName: string;
  clubScoreAfter: number;
  opponentScoreAfter: number;
  totalShiftPct: string;
  rollDisplay: string;
}

export interface RecapTemplate {
  id: string;
  title: string;
  category:
    | 'club_breakthrough_7'
    | 'club_clinical_3'
    | 'club_stalled_0'
    | 'opponent_punish_7'
    | 'opponent_chip_3'
    | 'club_defensive_stand_0'
    | 'fatigue_swing'
    | 'tendency_exploit';
  renderHeadline: (ctx: RecapTemplateContext) => string;
  renderBody: (ctx: RecapTemplateContext) => string;
}

export const INITIAL_ROSTER: readonly RosterPlayerTemplate[] = [
  {
    id: 'p1',
    name: 'Kaelen Vance',
    number: 9,
    role: 'FWD',
    roleTitle: 'Star Finisher',
    bio: 'Deadly top-corner striker who carried Ironvale last month—enters Fixture 1 carrying heavy leg fatigue (56).',
    attack: 9,
    defense: 4,
    control: 7,
    stamina: 5,
    initialFatigue: 56,
    defaultStarter: true,
  },
  {
    id: 'p2',
    name: 'Mira Solis',
    number: 8,
    role: 'MID',
    roleTitle: 'Deep Playmaker',
    bio: 'Threads laser passes through congested five-a-side lanes; dictates Ironvale’s tempo and Control rating.',
    attack: 7,
    defense: 5,
    control: 9,
    stamina: 6,
    initialFatigue: 10,
    defaultStarter: true,
  },
  {
    id: 'p3',
    name: 'Bram Thorne',
    number: 4,
    role: 'DEF',
    roleTitle: 'Iron Sweeper',
    bio: 'Uncompromising last-ditch tackler who anchors the defensive arc and shuts down 7-point breakaways.',
    attack: 4,
    defense: 9,
    control: 6,
    stamina: 7,
    initialFatigue: 8,
    defaultStarter: true,
  },
  {
    id: 'p4',
    name: 'Tariq Osei',
    number: 6,
    role: 'MID',
    roleTitle: 'Box-to-Box Engine',
    bio: 'Relentless two-way runner with high Stamina (8) who absorbs heavy fixture congestion without wilting.',
    attack: 7,
    defense: 7,
    control: 7,
    stamina: 8,
    initialFatigue: 6,
    defaultStarter: true,
  },
  {
    id: 'p5',
    name: 'Soren Lindqvist',
    number: 11,
    role: 'MID',
    roleTitle: 'Wing Metronome',
    bio: 'Composed wide distributor who recycles possession and links defense to attack under heavy pressure.',
    attack: 6,
    defense: 6,
    control: 8,
    stamina: 6,
    initialFatigue: 14,
    defaultStarter: true,
  },
  {
    id: 'p6',
    name: 'Juno Reyes',
    number: 10,
    role: 'FWD',
    roleTitle: 'Fresh Poacher',
    bio: 'Explosive second striker waiting on the bench at 0 Fatigue—ready to deputize whenever Vance needs rest.',
    attack: 8,
    defense: 4,
    control: 7,
    stamina: 7,
    initialFatigue: 0,
    defaultStarter: false,
  },
  {
    id: 'p7',
    name: 'Callum Ward',
    number: 5,
    role: 'DEF',
    roleTitle: 'Half-Back Shield',
    bio: 'Disciplined defensive stopper with iron lungs (Stamina 8) who locks down counter-attacking opponents.',
    attack: 4,
    defense: 8,
    control: 6,
    stamina: 8,
    initialFatigue: 0,
    defaultStarter: false,
  },
  {
    id: 'p8',
    name: 'Dara Novak',
    number: 14,
    role: 'UTL',
    roleTitle: 'Utility Catalyst',
    bio: 'Versatile all-rounder who slots seamlessly into midfield or defense when rotation is required.',
    attack: 6,
    defense: 6,
    control: 7,
    stamina: 7,
    initialFatigue: 0,
    defaultStarter: false,
  },
] as const;

export const TACTICAL_PLANS: readonly TacticalPlanDefinition[] = [
  {
    id: 'Patient',
    name: 'Patient Build-Up',
    tagline: 'High-floor possession triangles (55% base 3-pt rate)',
    description:
      'Works the ball methodically until a high-percentage 3-point angle opens, minimizing 0-point turnovers (25% base) while waiting for clean 7-point cutbacks (20% base).',
    baseDistribution: CONFIG.basePlanDistributions.Patient,
    bestWhen:
      'Facing overeager high presses or wild transition teams that lose shape when starved of the ball.',
  },
  {
    id: 'Balanced',
    name: 'Balanced Tempo',
    tagline: 'Measured two-way rhythm (35% 0-pt / 35% 3-pt / 30% 7-pt)',
    description:
      'Mixes controlled circulation with timely vertical switches, offering steady 3-point pressure and reliable 7-point threat without overcommitting numbers.',
    baseDistribution: CONFIG.basePlanDistributions.Balanced,
    bestWhen:
      'Facing asymmetric mid-blocks or disciplined man-marking sides where adaptability punishes over-rotation.',
  },
  {
    id: 'Aggressive',
    name: 'Aggressive Direct',
    tagline: 'High-ceiling blitz (40% base 7-pt rate, 50% base 0-pt risk)',
    description:
      'Launches immediate vertical balls and central overloads chasing 7-point breakthroughs, accepting frequent 0-point turnovers and bypassing 3-point safety (10% base).',
    baseDistribution: CONFIG.basePlanDistributions.Aggressive,
    bestWhen:
      'Cracking passive low blocks, exploiting fragile high defensive lines, or riding a rested high-Attack lineup.',
  },
] as const;

export const OPPONENTS: readonly OpponentClub[] = [
  {
    id: 'opp-1',
    fixtureNumber: 1,
    name: 'Cinderwick Athletic',
    shortName: 'CIN',
    nickname: 'The Ash-Hounds',
    primaryColor: '#d97706',
    secondaryColor: '#fef3c7',
    attack: 27,
    defense: 26,
    control: 29,
    defaultPlan: 'Patient',
    scoutingReport:
      'Cinderwick sprint out in an Overeager High Press on every whistle. They leave wide-open passing triangles behind their front line—vulnerable to Patient build-up, while reckless Aggressive passes feed their traps.',
    tacticalHint:
      'Recommended: Choose Patient (+9% shift to 7-pt breakthroughs) and either Rest tired star Kaelen Vance (Fatigue 56 -> 32) or swap in fresh striker Juno Reyes.',
    tendency: {
      id: 'tend-1',
      name: 'Overeager High Press',
      vulnerableTo: 'Patient',
      summary: 'Leaves central pockets open vs Patient (+9% 7-pt shift); traps Aggressive (-4% shift).',
      clubPlanModifier: {
        Patient: 0.09,
        Balanced: 0.03,
        Aggressive: -0.04,
      },
      opponentPossessionModifier: {
        Patient: -0.05,
        Balanced: -0.02,
        Aggressive: 0.03,
      },
    },
  },
  {
    id: 'opp-2',
    fixtureNumber: 2,
    name: 'Docklands United',
    shortName: 'DOC',
    nickname: 'The Harbor Wall',
    primaryColor: '#0284c7',
    secondaryColor: '#e0f2fe',
    attack: 26,
    defense: 30,
    control: 29,
    defaultPlan: 'Patient',
    scoutingReport:
      'Docklands park four defenders on the edge of their D-arc in a Low-Block Harbor Wall. Slow perimeter passing gets absorbed, whereas direct Aggressive strikes or crisp Balanced switches fracture their low block.',
    tacticalHint:
      'Recommended: Aggressive (+9% 7-pt shift) or Balanced (+4% shift) with high Attack starters.',
    tendency: {
      id: 'tend-2',
      name: 'Low-Block Harbor Wall',
      vulnerableTo: 'Aggressive',
      summary: 'Vulnerable to Aggressive vertical strikes (+9% 7-pt shift); absorbs Patient play (-2%).',
      clubPlanModifier: {
        Patient: -0.02,
        Balanced: 0.04,
        Aggressive: 0.09,
      },
      opponentPossessionModifier: {
        Patient: -0.03,
        Balanced: -0.03,
        Aggressive: -0.04,
      },
    },
  },
  {
    id: 'opp-3',
    fixtureNumber: 3,
    name: 'Millgate Foundry FC',
    shortName: 'MIL',
    nickname: 'The Smelters',
    primaryColor: '#dc2626',
    secondaryColor: '#fee2e2',
    attack: 29,
    defense: 28,
    control: 30,
    defaultPlan: 'Balanced',
    scoutingReport:
      'Millgate overload the strong-side touchline in a Split-Midfield Gamble. A Balanced tempo switches play into the weak-side channel before their pivot can slide across.',
    tacticalHint:
      'Recommended: Balanced (+9% 7-pt shift, -5% opponent shift) while watching mid-season starter fatigue.',
    tendency: {
      id: 'tend-3',
      name: 'Split-Midfield Gamble',
      vulnerableTo: 'Balanced',
      summary: 'Punished by Balanced weak-side switches (+9% 7-pt shift); solid vs Aggressive (+4%).',
      clubPlanModifier: {
        Patient: 0.03,
        Balanced: 0.09,
        Aggressive: 0.04,
      },
      opponentPossessionModifier: {
        Patient: -0.03,
        Balanced: -0.05,
        Aggressive: 0.01,
      },
    },
  },
  {
    id: 'opp-4',
    fixtureNumber: 4,
    name: 'Redmoor Rangers',
    shortName: 'RED',
    nickname: 'The Moorland Raiders',
    primaryColor: '#9333ea',
    secondaryColor: '#f3e8ff',
    attack: 31,
    defense: 27,
    control: 29,
    defaultPlan: 'Aggressive',
    scoutingReport:
      'Redmoor thrive on chaotic end-to-end transitions with a Wild Counter-Blitz. Starving them with Patient control denies their runners oxygen and exposes their undisciplined back line.',
    tacticalHint:
      'Recommended: Patient (+10% 7-pt shift and -6% to Redmoor’s breakaways) with high-Control midfielders.',
    tendency: {
      id: 'tend-4',
      name: 'Wild Counter-Blitz',
      vulnerableTo: 'Patient',
      summary: 'Starved by Patient control (+10% 7-pt shift, -6% opp shift); dangerous in open firefights.',
      clubPlanModifier: {
        Patient: 0.10,
        Balanced: 0.04,
        Aggressive: 0.03,
      },
      opponentPossessionModifier: {
        Patient: -0.06,
        Balanced: -0.03,
        Aggressive: 0.03,
      },
    },
  },
  {
    id: 'opp-5',
    fixtureNumber: 5,
    name: 'Glassworks Dynamo',
    shortName: 'GLA',
    nickname: 'The Prisms',
    primaryColor: '#0d9488',
    secondaryColor: '#ccfbf1',
    attack: 30,
    defense: 28,
    control: 31,
    defaultPlan: 'Balanced',
    scoutingReport:
      'Dynamo push their sweepers up to the halfway line in a Fragile High Line. Early Aggressive balls in behind or sharp Balanced through-balls create clean 1-on-1 breakaways.',
    tacticalHint:
      'Recommended: Aggressive (+10% 7-pt shift) or Balanced (+6% shift) with rested forwards.',
    tendency: {
      id: 'tend-5',
      name: 'Fragile High Line',
      vulnerableTo: 'Aggressive',
      summary: 'Exposed by Aggressive direct runs (+10% 7-pt shift) and Balanced switches (+6%).',
      clubPlanModifier: {
        Patient: 0.03,
        Balanced: 0.06,
        Aggressive: 0.10,
      },
      opponentPossessionModifier: {
        Patient: -0.03,
        Balanced: -0.04,
        Aggressive: -0.03,
      },
    },
  },
  {
    id: 'opp-6',
    fixtureNumber: 6,
    name: 'Sovereign City FC',
    shortName: 'SOV',
    nickname: 'The Royals',
    primaryColor: '#eab308',
    secondaryColor: '#fef9c3',
    attack: 31,
    defense: 30,
    control: 31,
    defaultPlan: 'Balanced',
    scoutingReport:
      'The division pacesetters lock man-to-man across the pitch in a Title-Chasing Man-Mark. A composed Balanced structure—or an overpowering, well-trained attack—drags their markers out of shape in the season finale.',
    tacticalHint:
      'Finale: Empty the tank! Spend both Prep Points on your strongest five and exploit Balanced (+9% shift) or your highest-trained style.',
    tendency: {
      id: 'tend-6',
      name: 'Title-Chasing Man-Mark',
      vulnerableTo: 'Balanced',
      summary: 'Outmaneuvered by Balanced tempo (+9% 7-pt shift) or high-stat Aggressive/Patient play (+6%).',
      clubPlanModifier: {
        Patient: 0.06,
        Balanced: 0.09,
        Aggressive: 0.06,
      },
      opponentPossessionModifier: {
        Patient: -0.04,
        Balanced: -0.05,
        Aggressive: -0.02,
      },
    },
  },
] as const;

export const RECAP_TEMPLATES: readonly RecapTemplate[] = [
  {
    id: 'tpl-01',
    title: 'Top-Corner Breakthrough (7 Pts)',
    category: 'club_breakthrough_7',
    renderHeadline: (c) =>
      `Possession #${c.possessionIndex}: ${c.keyPlayerName} rifles a 7-pt breakthrough (${c.clubScoreAfter}–${c.opponentScoreAfter})`,
    renderBody: (c) =>
      `Executing Ironvale's ${c.tacticalPlan} plan against ${c.opponentName}'s ${c.tendencyName}, ${c.supportPlayerName} slipped ${c.keyPlayerName} (${c.keyPlayerFatigue}% fatigue) into the box. With a ${c.totalShiftPct} matchup shift (roll ${c.rollDisplay}), Ironvale converted a decisive 7-point strike.`,
  },
  {
    id: 'tpl-02',
    title: 'Tactical Tendency Shredded (7 Pts)',
    category: 'tendency_exploit',
    renderHeadline: (c) =>
      `Possession #${c.possessionIndex}: ${c.tacticalPlan} shape Carves ${c.opponentName}'s ${c.tendencyName} for 7 pts`,
    renderBody: (c) =>
      `The scouting report paid off in Half ${c.half}. ${c.keyPlayerName} exploited ${c.opponentName}'s ${c.tendencyName} directly, turning a ${c.totalShiftPct} probability boost (roll ${c.rollDisplay}) into a clean 7-point finish with ${c.supportPlayerName} providing the screen.`,
  },
  {
    id: 'tpl-03',
    title: 'Clinical Combination Play (3 Pts)',
    category: 'club_clinical_3',
    renderHeadline: (c) =>
      `Possession #${c.possessionIndex}: ${c.keyPlayerName} & ${c.supportPlayerName} work a 3-pt conversion (${c.clubScoreAfter}–${c.opponentScoreAfter})`,
    renderBody: (c) =>
      `Under ${c.tacticalPlan} tempo in Half ${c.half}, ${c.keyPlayerName} (${c.keyPlayerRole}) linked up with ${c.supportPlayerName} at the edge of the arc to bank 3 points (roll ${c.rollDisplay}, matchup shift ${c.totalShiftPct}).`,
  },
  {
    id: 'tpl-04',
    title: 'Metronome Pressure Pays Off (3 Pts)',
    category: 'club_clinical_3',
    renderHeadline: (c) =>
      `Possession #${c.possessionIndex}: Patient angles from ${c.keyPlayerName} secure 3 points`,
    renderBody: (c) =>
      `Refusing to force a low-percentage shot against ${c.opponentName}, ${c.keyPlayerName} (at ${c.keyPlayerFatigue}% fatigue) recycled the ball to ${c.supportPlayerName} for a textbook 3-point conversion (roll ${c.rollDisplay}).`,
  },
  {
    id: 'tpl-05',
    title: 'Fatigue-Heavy Turnover (0 Pts)',
    category: 'fatigue_swing',
    renderHeadline: (c) =>
      `Possession #${c.possessionIndex}: Heavy legs on ${c.keyPlayerName} (${c.keyPlayerFatigue}% fatigue) stall the attack (0 pts)`,
    renderBody: (c) =>
      `Fatigue bit into Ironvale's effective ratings on Possession #${c.possessionIndex}. ${c.keyPlayerName} (${c.keyPlayerFatigue}% fatigue) couldn't separate from ${c.opponentName}'s marker under ${c.tacticalPlan} play, resulting in a 0-point turnover (roll ${c.rollDisplay}, shift ${c.totalShiftPct}).`,
  },
  {
    id: 'tpl-06',
    title: 'Attack Repelled at the Arc (0 Pts)',
    category: 'club_stalled_0',
    renderHeadline: (c) =>
      `Possession #${c.possessionIndex}: ${c.opponentName} closes the lane on ${c.keyPlayerName} (0 pts)`,
    renderBody: (c) =>
      `Ironvale pushed forward in Half ${c.half} using ${c.tacticalPlan} tempo, but ${c.opponentName}'s ${c.tendencyName} cut off the passing angle to ${c.supportPlayerName} (roll ${c.rollDisplay}, shift ${c.totalShiftPct}), leaving the score at ${c.clubScoreAfter}–${c.opponentScoreAfter}.`,
  },
  {
    id: 'tpl-07',
    title: 'Ironvale Defensive Stand (0 Pts Allowed)',
    category: 'club_defensive_stand_0',
    renderHeadline: (c) =>
      `Possession #${c.possessionIndex}: ${c.keyPlayerName} slams the door on ${c.opponentName} (0 pts allowed)`,
    renderBody: (c) =>
      `With ${c.opponentName} pressing in Half ${c.half}, ${c.keyPlayerName} (${c.keyPlayerFatigue}% fatigue) and ${c.supportPlayerName} held a compact defensive line (shift ${c.totalShiftPct}, roll ${c.rollDisplay}) to force a 0-point empty possession.`,
  },
  {
    id: 'tpl-08',
    title: 'Sweeper Interception in the Box (0 Pts Allowed)',
    category: 'club_defensive_stand_0',
    renderHeadline: (c) =>
      `Possession #${c.possessionIndex}: Clean tackle by ${c.keyPlayerName} preserves the ${c.clubScoreAfter}–${c.opponentScoreAfter} line`,
    renderBody: (c) =>
      `${c.opponentName} probed for an opening, but Ironvale's effective Defense + Control rating (${c.totalShiftPct} modifier) allowed ${c.keyPlayerName} to dispossess their runner cleanly (roll ${c.rollDisplay}).`,
  },
  {
    id: 'tpl-09',
    title: 'Opponent Counter-Punish (7 Pts Allowed)',
    category: 'opponent_punish_7',
    renderHeadline: (c) =>
      `Possession #${c.possessionIndex}: ${c.opponentName} breaks through for 7 pts (${c.clubScoreAfter}–${c.opponentScoreAfter})`,
    renderBody: (c) =>
      `${c.opponentName} capitalized on an opening in Half ${c.half}, beating ${c.keyPlayerName} (${c.keyPlayerFatigue}% fatigue) on roll ${c.rollDisplay} (modifier ${c.totalShiftPct}) for a costly 7-point swing.`,
  },
  {
    id: 'tpl-10',
    title: 'Defensive Gap Exploited (7 Pts Allowed)',
    category: 'opponent_punish_7',
    renderHeadline: (c) =>
      `Possession #${c.possessionIndex}: ${c.opponentName}'s ${c.tendencyName} carves out a 7-pt goal`,
    renderBody: (c) =>
      `Despite ${c.supportPlayerName}'s recovery run, ${c.opponentName} found space behind ${c.keyPlayerName} to convert a 7-point possession (roll ${c.rollDisplay}, shift ${c.totalShiftPct}), making it ${c.clubScoreAfter}–${c.opponentScoreAfter}.`,
  },
  {
    id: 'tpl-11',
    title: 'Opponent Perimeter Conversion (3 Pts Allowed)',
    category: 'opponent_chip_3',
    renderHeadline: (c) =>
      `Possession #${c.possessionIndex}: ${c.opponentName} chips in 3 pts past ${c.keyPlayerName}`,
    renderBody: (c) =>
      `Ironvale denied the 7-point lane through ${c.supportPlayerName}, but ${c.opponentName} settled for a 3-point perimeter conversion in Half ${c.half} (roll ${c.rollDisplay}, shift ${c.totalShiftPct}).`,
  },
  {
    id: 'tpl-12',
    title: 'Late-Half Momentum Swing',
    category: 'tendency_exploit',
    renderHeadline: (c) =>
      `Possession #${c.possessionIndex}: ${c.team === 'club' ? c.keyPlayerName : c.opponentName} swings Half ${c.half} (${c.points} pts, ${c.clubScoreAfter}–${c.opponentScoreAfter})`,
    renderBody: (c) =>
      `A pivotal Half ${c.half} possession under Ironvale's ${c.tacticalPlan} setup vs ${c.opponentName}'s ${c.tendencyName}: ${c.keyPlayerName} (${c.keyPlayerFatigue}% fatigue) was at the center of the action as roll ${c.rollDisplay} (shift ${c.totalShiftPct}) produced ${c.points} points.`,
  },
] as const;

export function getOpponentForFixture(fixtureNumber: number): OpponentClub {
  const found = OPPONENTS.find((o) => o.fixtureNumber === fixtureNumber);
  if (!found) {
    throw new Error(`No opponent configured for fixture ${fixtureNumber}`);
  }
  return found;
}

export function getTacticalPlanDefinition(planId: TacticalPlanId): TacticalPlanDefinition {
  const found = TACTICAL_PLANS.find((p) => p.id === planId);
  if (!found) {
    throw new Error(`Unknown tactical plan: ${planId}`);
  }
  return found;
}
