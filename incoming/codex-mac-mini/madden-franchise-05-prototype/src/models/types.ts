export type Conference = 'AFC' | 'NFC';
export type Division = 'North' | 'South' | 'East' | 'West';

export type Position =
  | 'QB'
  | 'HB'
  | 'WR'
  | 'TE'
  | 'OL'
  | 'DL'
  | 'LB'
  | 'CB'
  | 'S'
  | 'K'
  | 'P';

export const ALL_POSITIONS: Position[] = [
  'QB',
  'HB',
  'WR',
  'TE',
  'OL',
  'DL',
  'LB',
  'CB',
  'S',
  'K',
  'P',
];

export const POSITION_IDEAL_STARTERS: Record<Position, number> = {
  QB: 1,
  HB: 1,
  WR: 3,
  TE: 1,
  OL: 5,
  DL: 4,
  LB: 3,
  CB: 2,
  S: 2,
  K: 1,
  P: 1,
};

export const POSITION_MIN_ROSTER: Record<Position, number> = {
  QB: 2,
  HB: 2,
  WR: 4,
  TE: 2,
  OL: 6,
  DL: 4,
  LB: 4,
  CB: 3,
  S: 2,
  K: 1,
  P: 1,
};

export type PersonalityType =
  | 'Field General'
  | 'Competitor'
  | 'Vocal Star'
  | 'Team First'
  | 'Mercenary'
  | 'Enforcer';

export type PlayerTrait =
  | 'Hit Stick Enforcer'
  | 'Human Joystick'
  | 'Cannon Arm'
  | 'Playmaker Vision'
  | 'Shutdown Corner'
  | 'Ballhawk'
  | 'Trench Mauler'
  | 'Pass Rush Specialist'
  | 'Possession Hands'
  | 'Power Bruiser'
  | 'Clutch Kicker'
  | 'Ironman';

export interface PlayerAttributes {
  speed: number; // SPD 40-99
  strength: number; // STR 40-99
  awareness: number; // AWR 40-99
  agility: number; // AGI 40-99
  acceleration: number; // ACC 40-99
  throwPower: number; // THP 40-99
  throwAccuracy: number; // THA 40-99
  carrying: number; // CAR 40-99
  catching: number; // CTH 40-99
  runBlock: number; // RBK 40-99
  passBlock: number; // PBK 40-99
  tackle: number; // TAK 40-99
  hitPower: number; // POW (Signature Madden 2005 Hit Stick stat!) 40-99
  coverage: number; // COV 40-99
  kickPower: number; // KPW 40-99
  kickAccuracy: number; // KAC 40-99
  stamina: number; // STA 60-99
  injury: number; // INJ 60-99
}

export interface PlayerSeasonStats {
  gamesPlayed: number;
  passAttempts: number;
  passCompletions: number;
  passYards: number;
  passTDs: number;
  interceptions: number;
  sacksTaken: number;
  rushAttempts: number;
  rushYards: number;
  rushTDs: number;
  fumbles: number;
  targets: number;
  receptions: number;
  recYards: number;
  recTDs: number;
  tackles: number;
  tacklesForLoss: number;
  sacks: number;
  defInterceptions: number;
  forcedFumbles: number;
  passDeflections: number;
  fgAttempts: number;
  fgMade: number;
  xpAttempts: number;
  xpMade: number;
  punts: number;
  puntYards: number;
}

export interface PlayerContract {
  yearsLeft: number; // 1 to 7, or 0 if expiring in offseason
  salaryM: number; // Base salary per year in $M
  bonusM: number; // Annual prorated signing bonus in $M (becomes dead cap if cut/traded)
  franchiseTagged?: boolean;
}

export interface CombineMetrics {
  fortyYardDash: number; // e.g., 4.38
  benchPressReps: number; // e.g., 24
  verticalJumpIn: number; // e.g., 37.5
  wonderlicScore: number; // 15-48
  projectedRound: number; // 1-5
  college: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  position: Position;
  jerseyNumber: number;
  age: number;
  yearsPro: number;
  overall: number;
  potential: 'A' | 'B' | 'C' | 'D';
  morale: number; // 0-100 (Madden 2005 Morale system)
  moraleTrend: 'UP' | 'STEADY' | 'DOWN';
  moraleReason: string;
  personality: PersonalityType;
  trait: PlayerTrait;
  teamId: string | 'FA' | 'DRAFT';
  depthOrder: number; // 1 = starter, 2 = backup, etc.
  injuryWeeks: number; // 0 = healthy
  injuryType?: string;
  attributes: PlayerAttributes;
  contract: PlayerContract;
  stats: PlayerSeasonStats;
  careerTouchdowns: number;
  careerYards: number;
  careerSacks: number;
  careerInterceptions: number;
  lastProgressionDelta: number;
  scoutedLevel: 0 | 1 | 2; // 0 = unscouted, 1 = combine basic, 2 = full pro/college scout report
  combine?: CombineMetrics;
  campBoostedThisYear?: boolean;
}

export type OffenseScheme =
  | 'West Coast'
  | 'Vertical Air Coryell'
  | 'Power Run'
  | 'Spread Attack'
  | 'Balanced Pro';

export type DefenseScheme =
  | '4-3 Tampa 2'
  | '3-4 Blitzburgh'
  | '46 Bear Enforcer'
  | '4-3 Man Press'
  | 'Nickel Disguise';

export interface CoachMember {
  id: string;
  name: string;
  role: 'HC' | 'OC' | 'DC' | 'TRAINER';
  rating: number; // 65-99
  specialty: string;
  salaryM: number;
  yearsLeft: number;
}

export interface TeamFinances {
  ticketPrice: number; // $45 - $110
  concessionPrice: number; // $6 - $20
  parkingPrice: number; // $15 - $50
  marketingBudgetM: number; // $0.5M - $8.0M per season
  ownerCashM: number; // Available franchise cash in $M
  seasonRevenueM: number;
  seasonExpensesM: number;
  lastAttendance: number;
  deadCapPenaltyM: number; // Current season cap penalty from cutting/trading players with signing bonuses
}

export interface Team {
  id: string;
  city: string;
  name: string;
  abbr: string;
  conference: Conference;
  division: Division;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  stadiumName: string;
  stadiumCapacity: number;
  localPaperName: string;
  fanSupport: number; // 0-100
  prestige: number; // 1-5
  offenseScheme: OffenseScheme;
  defenseScheme: DefenseScheme;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  streak: number; // positive = win streak, negative = loss streak
  divisionWins: number;
  divisionLosses: number;
  confWins: number;
  confLosses: number;
  finances: TeamFinances;
  coaches: {
    hc: CoachMember;
    oc: CoachMember;
    dc: CoachMember;
    trainer: CoachMember;
  };
  championshipsWon: number;
}

export interface DraftPick {
  id: string;
  season: number;
  round: number; // 1 to 5
  originalTeamId: string;
  currentTeamId: string;
  overallPick?: number;
  usedOnPlayerId?: string;
}

export type GameStage = 'REG' | 'WC' | 'DIV' | 'CONF' | 'BOWL';

export interface ScheduledGame {
  id: string;
  season: number;
  week: number; // 1-17 regular season, 18 WC, 19 DIV, 20 CONF, 21 BOWL
  stage: GameStage;
  homeTeamId: string;
  awayTeamId: string;
  played: boolean;
  homeScore: number;
  awayScore: number;
  isOvertime?: boolean;
  homeYards?: number;
  awayYards?: number;
  homeTurnovers?: number;
  awayTurnovers?: number;
  mvpPlayerId?: string;
  mvpPlayerName?: string;
  mvpSummary?: string;
  headline?: string;
  playByPlayHighlights?: string[];
}

export interface NewspaperIssue {
  id: string;
  season: number;
  week: number;
  localPaperTitle: string;
  localHeadline: string;
  localSubhead: string;
  localBody: string;
  localMoraleSpotlight: string;
  nationalPaperTitle: string;
  nationalHeadline: string;
  nationalSubhead: string;
  nationalBody: string;
  offensivePlayerOfWeek: string;
  defensivePlayerOfWeek: string;
}

export interface TonyBrunoSegment {
  id: string;
  season: number;
  week: number;
  showTitle: string;
  topicBadge: string;
  tonyMonologue: string;
  callerName: string;
  callerCity: string;
  callerQuote: string;
  tonyRebuttal: string;
  guestInterviewName?: string;
  guestInterviewQuote?: string;
  pollQuestion: string;
  pollOptions: {
    id: string;
    label: string;
    effectDescription: string;
    moraleDelta: number;
    fanDelta: number;
    cashDeltaM: number;
  }[];
  selectedOptionId?: string;
}

export interface PdaEmail {
  id: string;
  season: number;
  week: number;
  senderRole: 'OWNER' | 'COACH' | 'TRAINER' | 'AGENT' | 'SCOUT' | 'LEAGUE';
  senderName: string;
  subject: string;
  body: string;
  read: boolean;
  priority: 'NORMAL' | 'HIGH' | 'ALERT';
  relatedPlayerId?: string;
  actionTab?: 'ROSTER' | 'TRADE' | 'OWNER' | 'STORYLINE' | 'OFFSEASON';
}

export interface SeasonAwardWinner {
  awardName: string;
  playerId: string;
  playerName: string;
  position: Position;
  teamId: string;
  teamAbbr: string;
  statLine: string;
}

export interface RetiredPlayerSummary {
  playerId: string;
  name: string;
  position: Position;
  teamAbbr: string;
  age: number;
  overall: number;
  yearsPro: number;
  hallOfFameInductee: boolean;
}

export type FranchisePhase =
  | 'REGULAR_SEASON'
  | 'PLAYOFFS'
  | 'OFFSEASON_AWARDS'
  | 'OFFSEASON_RESIGN'
  | 'OFFSEASON_FREE_AGENCY'
  | 'OFFSEASON_DRAFT'
  | 'OFFSEASON_TRAINING_CAMP';

export interface ActiveDraftState {
  currentRound: number;
  currentPickIndex: number; // 0 to totalPicks-1
  pickOrder: DraftPick[];
  draftLog: {
    overallPick: number;
    round: number;
    teamId: string;
    teamAbbr: string;
    playerId: string;
    playerName: string;
    position: Position;
    overall: number;
    potential: string;
  }[];
  scoutingHoursRemaining: number;
}

export interface TrainingCampDrill {
  id: string;
  name: string;
  category: 'OFFENSE' | 'DEFENSE' | 'PHYSICAL' | 'SPECIAL';
  eligiblePositions: Position[];
  description: string;
  attributeBoosts: Partial<PlayerAttributes>;
  overallBoost: number;
  injuryRiskPct: number;
}

export interface ChampionHistoryEntry {
  season: number;
  winnerTeamId: string;
  winnerName: string;
  loserTeamId: string;
  loserName: string;
  score: string;
  mvpName: string;
  userRecord: string;
}

export interface FranchiseState {
  version: number;
  franchiseName: string;
  userTeamId: string;
  season: number; // Starts in 2004 (The 2004-2005 Madden 2005 Season!)
  week: number; // 1-17 reg season, 18-21 playoffs
  phase: FranchisePhase;
  salaryCapM: number; // $80.5M in 2004, grows each season
  teams: Team[];
  players: Player[]; // Includes team rosters, free agents ('FA'), and draft class ('DRAFT')
  schedule: ScheduledGame[];
  draftPicks: DraftPick[];
  newspapers: NewspaperIssue[];
  radioSegments: TonyBrunoSegment[];
  pdaInbox: PdaEmail[];
  seasonAwards: SeasonAwardWinner[];
  retiredPlayers: RetiredPlayerSummary[];
  activeDraft: ActiveDraftState | null;
  campDrillsRemaining: number;
  franchiseTagUsedThisOffseason: boolean;
  championsHistory: ChampionHistoryEntry[];
  tradeDeadlineWeek: number; // Week 6 in NFL 2004/2005 era, or Week 8 for extended fun (let's use Week 8)
}

// Interactive Game Day Live Simulation Types
export type OffensivePlayId =
  | 'IFORM_HB_BLAST'
  | 'IFORM_PA_POST'
  | 'SINGLEBACK_STRETCH'
  | 'SINGLEBACK_SLANTS'
  | 'SHOTGUN_FOUR_VERTS'
  | 'SHOTGUN_HB_SCREEN'
  | 'SHOTGUN_MESH_CORNER'
  | 'PRO_COUNTER'
  | 'GOALLINE_ISO'
  | 'QB_KNEEL'
  | 'FIELD_GOAL'
  | 'PUNT';

export type DefensivePlayId =
  | 'COVER_2_TAMPABAY'
  | 'ZONE_BLITZ_43'
  | 'COVER_3_SKY'
  | 'ENGAGE_EIGHT_BLITZ'
  | 'BEAR_46_RUN_STOP'
  | 'NICKEL_MAN_UNDER'
  | 'NICKEL_CORNER_BLITZ'
  | 'DIME_2MAN_DEEP'
  | 'GOALLINE_STACK'
  | 'PREVENT_DEEP';

export type PreSnapOffenseAdjustment = 'NONE' | 'HOT_ROUTE_STREAK' | 'MAX_PROTECT' | 'FLIP_PLAY';
export type PreSnapDefenseAdjustment =
  | 'NONE'
  | 'PINCH_DL'
  | 'SPREAD_LB'
  | 'PRESS_CB'
  | 'QB_SPY';

export interface PlayAnimationToken {
  id: string;
  label: string;
  side: 'OFF' | 'DEF';
  startX: number; // 0 to 100 yard line
  startY: number; // 0 to 53.3 yards width
  endX: number;
  endY: number;
  isBallCarrier?: boolean;
  isTarget?: boolean;
  hitStickHighlight?: boolean;
}

export interface LiveGameState {
  scheduledGameId: string;
  homeTeamId: string;
  awayTeamId: string;
  userSide: 'HOME' | 'AWAY';
  quarter: 1 | 2 | 3 | 4 | 5; // 5 = OT
  clockSeconds: number; // 0 to 900 (15:00)
  possession: 'HOME' | 'AWAY';
  down: 1 | 2 | 3 | 4;
  toGo: number;
  ballOn: number; // 1 to 99 (yards from possessing team's own goal line; e.g. 20 = own 20, 80 = opp 20)
  homeScore: number;
  awayScore: number;
  homeTimeouts: number;
  awayTimeouts: number;
  homeMomentum: number; // -100 to +100
  hitStickArmed: boolean;
  offAdjustment: PreSnapOffenseAdjustment;
  defAdjustment: PreSnapDefenseAdjustment;
  homeStats: {
    passYards: number;
    rushYards: number;
    firstDowns: number;
    turnovers: number;
    sacks: number;
    hitSticks: number;
  };
  awayStats: {
    passYards: number;
    rushYards: number;
    firstDowns: number;
    turnovers: number;
    sacks: number;
    hitSticks: number;
  };
  playLog: {
    id: string;
    quarter: number;
    clock: string;
    possessionAbbr: string;
    description: string;
    yardsGained: number;
    isScoringPlay?: boolean;
    isTurnover?: boolean;
    isBigHit?: boolean;
  }[];
  lastPlayTokens: PlayAnimationToken[];
  lastPlayBallPath?: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    type: 'PASS' | 'RUN' | 'KICK';
    complete?: boolean;
  };
  lastPlayBanner: string;
  isGameOver: boolean;
}
