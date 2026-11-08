import { TEAM_TEMPLATES, StarPlayerSeed } from '../data/teams';
import {
  ALL_POSITIONS,
  CombineMetrics,
  DraftPick,
  PersonalityType,
  Player,
  PlayerAttributes,
  PlayerContract,
  PlayerSeasonStats,
  PlayerTrait,
  Position,
  POSITION_MIN_ROSTER,
  Team,
} from '../models/types';

export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0 || 0x20051984;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  'Marcus', 'Deion', 'Derrick', 'Terrell', 'Jamal', 'Brian', 'Jason', 'Antoine',
  'Jerome', 'Kenyon', 'Keyshawn', 'Lito', 'Reggie', 'Shaun', 'Plaxico', 'Hines',
  'Lavar', 'Tedy', 'Rodney', 'Priest', 'Clinton', 'Warrick', 'Alge', 'Peerless',
  'vonte', 'Quentin', 'Donte', 'Takeo', 'Casey', 'Osi', 'Julius', 'Simeon',
  'Ronde', 'Champ', 'Torry', 'Isaac', 'Orlando', 'Walter', 'Lorenzo', 'Ahman',
  'Javon', 'Bubba', 'Kabeer', 'Donald', 'vis', 'Byron', 'corey', 'Amani',
  'Tiki', 'Olin', 'Lance', 'Charles', 'Adewale', 'Muhsin', 'DeShaun', 'Kris',
  'Lofa', 'Ken', 'Samari', 'Derrick', 'John', 'agile', 'Keith', 'Albert',
  'Vince', 'Matt', 'Carson', 'Philip', 'Braylon', 'Santonio', 'DeAngelo', 'Vernon',
].map((n) => n.charAt(0).toUpperCase() + n.slice(1));

const LAST_NAMES = [
  'Williams', 'Johnson', 'Smith', 'Jackson', 'Taylor', 'Thomas', 'Robinson', 'Brooks',
  'Boulware', 'McAlister', 'Heap', 'Pryce', 'Freeney', 'Mathis', 'Brackett', 'Sanders',
  'Polamalu', 'Farrior', 'Foote', 'Townsend', 'Stroud', 'Henderson', 'Peterson', 'Rasheed',
  'Spikes', 'Fletcher', 'Milloy', 'Schobel', 'Vilma', 'Abraham', 'Pennington', 'Mawae',
  'Seymour', 'Vrabel', 'Bruschi', 'Light', 'Branch', 'Givens', 'Samuel', 'Wilfork',
  'Dawkins', 'Sheppard', 'Brown', 'Runyan', 'Trotter', 'Kearse', 'Burgess', 'Simmons',
  'Urlacher', 'Briggs', 'Tillman', 'Vasher', 'Harris', 'ogunleye', 'Kreutz', 'Peppers',
  'Rucker', 'Jenkins', 'Buckner', 'Witherspoon', 'Gamble', 'Minter', 'Crumpler', 'Dunn',
  'Brooking', 'Kerney', 'Hall', 'Coleman', 'Trufant', 'Hasselbeck', 'Hutchinson', 'Tobeck',
].map((n) => n.charAt(0).toUpperCase() + n.slice(1));

const COLLEGES = [
  'Miami (FL)', 'USC', 'Ohio State', 'Michigan', 'FSU', 'LSU', 'Texas', 'Georgia',
  'Tennessee', 'Oklahoma', 'Florida', 'Virginia Tech', 'Penn State', 'Auburn',
  'Notre Dame', 'Wisconsin', 'Iowa', 'Oregon', 'NC State', 'Pittsburgh',
  'Syracuse', 'California', 'Stanford', 'Marshall', 'Fresno State', 'Alabama',
];

const PERSONALITIES: PersonalityType[] = [
  'Field General',
  'Competitor',
  'Vocal Star',
  'Team First',
  'Mercenary',
  'Enforcer',
];

const TRAITS_BY_POS: Record<Position, PlayerTrait[]> = {
  QB: ['Playmaker Vision', 'Cannon Arm', 'Human Joystick', 'Ironman'],
  HB: ['Human Joystick', 'Power Bruiser', 'Possession Hands', 'Ironman'],
  WR: ['Possession Hands', 'Human Joystick', 'Playmaker Vision'],
  TE: ['Possession Hands', 'Trench Mauler', 'Power Bruiser'],
  OL: ['Trench Mauler', 'Ironman'],
  DL: ['Pass Rush Specialist', 'Trench Mauler', 'Hit Stick Enforcer'],
  LB: ['Hit Stick Enforcer', 'Ballhawk', 'Pass Rush Specialist'],
  CB: ['Shutdown Corner', 'Ballhawk', 'Human Joystick'],
  S: ['Hit Stick Enforcer', 'Ballhawk', 'Shutdown Corner'],
  K: ['Clutch Kicker', 'Ironman'],
  P: ['Clutch Kicker', 'Ironman'],
};

const JERSEY_RANGES: Record<Position, [number, number]> = {
  QB: [1, 19],
  HB: [20, 44],
  WR: [80, 89],
  TE: [80, 89],
  OL: [60, 79],
  DL: [90, 99],
  LB: [50, 59],
  CB: [20, 39],
  S: [20, 49],
  K: [1, 10],
  P: [1, 15],
};

export function createEmptyStats(): PlayerSeasonStats {
  return {
    gamesPlayed: 0,
    passAttempts: 0,
    passCompletions: 0,
    passYards: 0,
    passTDs: 0,
    interceptions: 0,
    sacksTaken: 0,
    rushAttempts: 0,
    rushYards: 0,
    rushTDs: 0,
    fumbles: 0,
    targets: 0,
    receptions: 0,
    recYards: 0,
    recTDs: 0,
    tackles: 0,
    tacklesForLoss: 0,
    sacks: 0,
    defInterceptions: 0,
    forcedFumbles: 0,
    passDeflections: 0,
    fgAttempts: 0,
    fgMade: 0,
    xpAttempts: 0,
    xpMade: 0,
    punts: 0,
    puntYards: 0,
  };
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function calculatePlayerOverall(
  position: Position,
  attr: PlayerAttributes,
): number {
  switch (position) {
    case 'QB':
      return clamp(
        attr.throwPower * 0.28 +
          attr.throwAccuracy * 0.34 +
          attr.awareness * 0.24 +
          attr.speed * 0.08 +
          attr.agility * 0.06,
        45,
        99,
      );
    case 'HB':
      return clamp(
        attr.speed * 0.26 +
          attr.acceleration * 0.18 +
          attr.agility * 0.2 +
          attr.carrying * 0.18 +
          attr.awareness * 0.1 +
          attr.strength * 0.08,
        45,
        99,
      );
    case 'WR':
      return clamp(
        attr.speed * 0.27 +
          attr.catching * 0.32 +
          attr.acceleration * 0.16 +
          attr.agility * 0.13 +
          attr.awareness * 0.12,
        45,
        99,
      );
    case 'TE':
      return clamp(
        attr.catching * 0.28 +
          attr.runBlock * 0.22 +
          attr.strength * 0.18 +
          attr.speed * 0.18 +
          attr.awareness * 0.14,
        45,
        99,
      );
    case 'OL':
      return clamp(
        attr.runBlock * 0.34 +
          attr.passBlock * 0.34 +
          attr.strength * 0.2 +
          attr.awareness * 0.12,
        45,
        99,
      );
    case 'DL':
      return clamp(
        attr.tackle * 0.28 +
          attr.strength * 0.25 +
          attr.hitPower * 0.17 +
          attr.acceleration * 0.16 +
          attr.awareness * 0.14,
        45,
        99,
      );
    case 'LB':
      return clamp(
        attr.tackle * 0.28 +
          attr.hitPower * 0.2 +
          attr.awareness * 0.18 +
          attr.speed * 0.18 +
          attr.coverage * 0.16,
        45,
        99,
      );
    case 'CB':
      return clamp(
        attr.coverage * 0.34 +
          attr.speed * 0.28 +
          attr.acceleration * 0.16 +
          attr.agility * 0.12 +
          attr.awareness * 0.1,
        45,
        99,
      );
    case 'S':
      return clamp(
        attr.coverage * 0.26 +
          attr.hitPower * 0.22 +
          attr.tackle * 0.2 +
          attr.speed * 0.18 +
          attr.awareness * 0.14,
        45,
        99,
      );
    case 'K':
    case 'P':
      return clamp(
        attr.kickPower * 0.48 + attr.kickAccuracy * 0.44 + attr.awareness * 0.08,
        45,
        99,
      );
  }
}

export function generateAttributesForTargetOvr(
  position: Position,
  targetOvr: number,
  rng: () => number,
  speedBonus = 0,
  hitPowerBonus = 0,
): PlayerAttributes {
  const jitter = () => (rng() - 0.5) * 8;
  const base = targetOvr;

  const attr: PlayerAttributes = {
    speed: 70,
    strength: 70,
    awareness: clamp(base - 2 + jitter(), 48, 99),
    agility: 70,
    acceleration: 74,
    throwPower: 45,
    throwAccuracy: 45,
    carrying: 65,
    catching: 60,
    runBlock: 50,
    passBlock: 50,
    tackle: 55,
    hitPower: 55,
    coverage: 50,
    kickPower: 45,
    kickAccuracy: 45,
    stamina: clamp(82 + rng() * 16, 75, 99),
    injury: clamp(80 + rng() * 18, 68, 99),
  };

  switch (position) {
    case 'QB':
      attr.throwPower = clamp(base + 2 + jitter(), 72, 99);
      attr.throwAccuracy = clamp(base + 1 + jitter(), 68, 99);
      attr.speed = clamp(65 + speedBonus + jitter(), 54, 97);
      attr.agility = clamp(68 + speedBonus * 0.8 + jitter(), 55, 97);
      attr.acceleration = clamp(70 + speedBonus * 0.8 + jitter(), 58, 97);
      attr.carrying = clamp(68 + jitter(), 55, 88);
      break;
    case 'HB':
      attr.speed = clamp(base + 3 + speedBonus + jitter(), 78, 99);
      attr.acceleration = clamp(base + 4 + jitter(), 80, 99);
      attr.agility = clamp(base + 2 + jitter(), 76, 99);
      attr.carrying = clamp(base + jitter(), 72, 99);
      attr.catching = clamp(base - 12 + jitter(), 58, 90);
      attr.strength = clamp(base - 10 + jitter(), 62, 94);
      break;
    case 'WR':
      attr.speed = clamp(base + 4 + speedBonus + jitter(), 82, 99);
      attr.acceleration = clamp(base + 4 + jitter(), 82, 99);
      attr.agility = clamp(base + 2 + jitter(), 78, 99);
      attr.catching = clamp(base + 2 + jitter(), 72, 99);
      attr.carrying = clamp(72 + jitter(), 60, 88);
      break;
    case 'TE':
      attr.catching = clamp(base + 1 + jitter(), 68, 99);
      attr.runBlock = clamp(base - 4 + jitter(), 62, 92);
      attr.passBlock = clamp(base - 8 + jitter(), 58, 88);
      attr.strength = clamp(base - 2 + jitter(), 70, 95);
      attr.speed = clamp(base - 8 + speedBonus + jitter(), 68, 91);
      break;
    case 'OL':
      attr.runBlock = clamp(base + 2 + jitter(), 68, 99);
      attr.passBlock = clamp(base + 2 + jitter(), 68, 99);
      attr.strength = clamp(base + 3 + jitter(), 75, 99);
      attr.speed = clamp(54 + jitter(), 45, 68);
      break;
    case 'DL':
      attr.tackle = clamp(base + 1 + jitter(), 68, 99);
      attr.strength = clamp(base + 2 + jitter(), 72, 99);
      attr.hitPower = clamp(base + hitPowerBonus + jitter(), 68, 99);
      attr.acceleration = clamp(base - 4 + speedBonus + jitter(), 65, 95);
      attr.speed = clamp(base - 14 + speedBonus + jitter(), 58, 89);
      break;
    case 'LB':
      attr.tackle = clamp(base + 3 + jitter(), 70, 99);
      attr.hitPower = clamp(base + 2 + hitPowerBonus + jitter(), 70, 99);
      attr.speed = clamp(base - 7 + speedBonus + jitter(), 70, 93);
      attr.coverage = clamp(base - 8 + jitter(), 60, 92);
      attr.strength = clamp(base - 4 + jitter(), 68, 95);
      break;
    case 'CB':
      attr.coverage = clamp(base + 3 + jitter(), 68, 99);
      attr.speed = clamp(base + 4 + speedBonus + jitter(), 83, 99);
      attr.acceleration = clamp(base + 4 + jitter(), 83, 99);
      attr.agility = clamp(base + 2 + jitter(), 78, 99);
      attr.catching = clamp(base - 12 + jitter(), 58, 88);
      attr.tackle = clamp(base - 16 + jitter(), 52, 85);
      attr.hitPower = clamp(base - 18 + hitPowerBonus + jitter(), 48, 88);
      break;
    case 'S':
      attr.coverage = clamp(base + jitter(), 66, 98);
      attr.hitPower = clamp(base + 3 + hitPowerBonus + jitter(), 70, 99);
      attr.tackle = clamp(base + jitter(), 68, 96);
      attr.speed = clamp(base - 2 + speedBonus + jitter(), 78, 96);
      attr.acceleration = clamp(base + jitter(), 78, 97);
      break;
    case 'K':
    case 'P':
      attr.kickPower = clamp(base + 3 + jitter(), 74, 99);
      attr.kickAccuracy = clamp(base + 2 + jitter(), 70, 99);
      break;
  }

  return attr;
}

export function calculateMarketContract(
  position: Position,
  overall: number,
  age: number,
): PlayerContract {
  const posMultiplier: Record<Position, number> = {
    QB: 1.45,
    DL: 1.15,
    OL: 1.05,
    CB: 1.12,
    WR: 1.12,
    LB: 1.08,
    HB: 1.05,
    S: 0.95,
    TE: 0.9,
    K: 0.45,
    P: 0.4,
  };

  const mult = posMultiplier[position];
  let baseTotalAnnual = 0.55;
  if (overall >= 95) {
    baseTotalAnnual = 6.2 * mult;
  } else if (overall >= 90) {
    baseTotalAnnual = 4.4 * mult;
  } else if (overall >= 85) {
    baseTotalAnnual = 2.9 * mult;
  } else if (overall >= 80) {
    baseTotalAnnual = 1.85 * mult;
  } else if (overall >= 75) {
    baseTotalAnnual = 1.1 * mult;
  } else {
    baseTotalAnnual = 0.55 * mult;
  }

  if (age >= 33) baseTotalAnnual *= 0.82;

  const salaryM = Number(Math.max(0.35, baseTotalAnnual * 0.72).toFixed(2));
  const bonusM = Number(Math.max(0.05, baseTotalAnnual * 0.28).toFixed(2));
  const yearsLeft = age >= 32 ? 2 : overall >= 88 ? 4 : 3;

  return {
    yearsLeft,
    salaryM,
    bonusM,
  };
}

export function getPlayerCapHitM(player: Player): number {
  return Number((player.contract.salaryM + player.contract.bonusM).toFixed(2));
}

export function getReleaseCapPenaltyM(player: Player): number {
  if (player.contract.yearsLeft <= 0) return 0;
  return Number(
    (player.contract.bonusM * Math.min(player.contract.yearsLeft, 3) * 0.65).toFixed(2),
  );
}

export function getTeamRoster(teamId: string, players: Player[]): Player[] {
  return players
    .filter((p) => p.teamId === teamId)
    .sort((a, b) => a.depthOrder - b.depthOrder || b.overall - a.overall);
}

export function getTeamCapUsedM(team: Team, players: Player[]): number {
  const rosterHit = players
    .filter((p) => p.teamId === team.id)
    .reduce((acc, p) => acc + p.contract.salaryM + p.contract.bonusM, 0);
  return Number((rosterHit + team.finances.deadCapPenaltyM).toFixed(2));
}

export function getTeamCapRoomM(
  team: Team,
  players: Player[],
  salaryCapM: number,
): number {
  return Number((salaryCapM - getTeamCapUsedM(team, players)).toFixed(2));
}

export function getTeamRatings(
  teamId: string,
  players: Player[],
): { offense: number; defense: number; overall: number } {
  const roster = players.filter((p) => p.teamId === teamId && p.injuryWeeks === 0);
  const allTeamPlayers =
    roster.length >= 11 ? roster : players.filter((p) => p.teamId === teamId);

  const offPositions: Position[] = ['QB', 'HB', 'WR', 'TE', 'OL'];
  const defPositions: Position[] = ['DL', 'LB', 'CB', 'S'];

  const topAtPos = (pos: Position, count: number): number => {
    const posPlayers = allTeamPlayers
      .filter((p) => p.position === pos)
      .sort((a, b) => a.depthOrder - b.depthOrder || b.overall - a.overall)
      .slice(0, count);
    if (posPlayers.length === 0) return 70;
    return posPlayers.reduce((s, p) => s + p.overall, 0) / posPlayers.length;
  };

  const offScore =
    topAtPos('QB', 1) * 0.3 +
    topAtPos('HB', 1) * 0.2 +
    topAtPos('WR', 2) * 0.2 +
    topAtPos('TE', 1) * 0.1 +
    topAtPos('OL', 3) * 0.2;

  const defScore =
    topAtPos('DL', 2) * 0.26 +
    topAtPos('LB', 2) * 0.28 +
    topAtPos('CB', 2) * 0.24 +
    topAtPos('S', 2) * 0.22;

  const offense = clamp(offScore, 65, 99);
  const defense = clamp(defScore, 65, 99);
  const overall = clamp(offense * 0.5 + defense * 0.5, 65, 99);

  return { offense, defense, overall };
}

export function normalizeTeamDepthChart(teamId: string, players: Player[]): void {
  for (const pos of ALL_POSITIONS) {
    const posGroup = players
      .filter((p) => p.teamId === teamId && p.position === pos)
      .sort((a, b) => a.depthOrder - b.depthOrder || b.overall - a.overall);
    posGroup.forEach((p, idx) => {
      p.depthOrder = idx + 1;
    });
  }
}

function createPlayerFromSeed(
  id: string,
  teamId: string,
  seed: StarPlayerSeed,
  rng: () => number,
): Player {
  const attributes = generateAttributesForTargetOvr(
    seed.position,
    seed.overall,
    rng,
    seed.speedBonus ?? 0,
    seed.hitPowerBonus ?? 0,
  );
  const contract = calculateMarketContract(seed.position, seed.overall, seed.age);
  contract.yearsLeft = 1 + Math.floor(rng() * 4);
  const yearsPro = Math.max(1, seed.age - 21);

  return {
    id,
    firstName: seed.firstName,
    lastName: seed.lastName,
    position: seed.position,
    jerseyNumber: seed.jerseyNumber,
    age: seed.age,
    yearsPro,
    overall: seed.overall,
    potential: seed.overall >= 90 || seed.age <= 24 ? 'A' : 'B',
    morale: clamp(82 + rng() * 14, 70, 98),
    moraleTrend: 'STEADY',
    moraleReason: 'Locked in for the 2004 kickoff campaign.',
    personality: seed.personality,
    trait: seed.trait,
    teamId,
    depthOrder: 1,
    injuryWeeks: 0,
    attributes,
    contract,
    stats: createEmptyStats(),
    careerTouchdowns:
      ['QB', 'HB', 'WR', 'TE'].includes(seed.position)
        ? Math.floor(yearsPro * (seed.position === 'QB' ? 22 : 8))
        : 0,
    careerYards:
      ['QB', 'HB', 'WR', 'TE'].includes(seed.position)
        ? Math.floor(yearsPro * (seed.position === 'QB' ? 3400 : 950))
        : 0,
    careerSacks:
      ['DL', 'LB'].includes(seed.position) ? Math.floor(yearsPro * 6.5) : 0,
    careerInterceptions:
      ['CB', 'S', 'LB'].includes(seed.position) ? Math.floor(yearsPro * 3.5) : 0,
    lastProgressionDelta: 0,
    scoutedLevel: 2,
  };
}

export function generateRandomPlayer(
  id: string,
  teamId: string | 'FA' | 'DRAFT',
  position: Position,
  targetOvr: number,
  rng: () => number,
  isDraftProspect = false,
): Player {
  const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
  const [minJ, maxJ] = JERSEY_RANGES[position];
  const jerseyNumber = minJ + Math.floor(rng() * (maxJ - minJ + 1));

  const age = isDraftProspect
    ? 21 + Math.floor(rng() * 3)
    : 22 + Math.floor(rng() * 12);
  const yearsPro = isDraftProspect ? 0 : Math.max(1, age - 21);

  const attributes = generateAttributesForTargetOvr(position, targetOvr, rng);
  const computedOvr = calculatePlayerOverall(position, attributes);
  const ovr = clamp((targetOvr + computedOvr) / 2, 58, 98);

  const traits = TRAITS_BY_POS[position];
  const trait = traits[Math.floor(rng() * traits.length)];
  const personality = PERSONALITIES[Math.floor(rng() * PERSONALITIES.length)];

  const potentialRoll = rng();
  const potential: 'A' | 'B' | 'C' | 'D' =
    ovr >= 86 || potentialRoll > 0.78
      ? 'A'
      : potentialRoll > 0.38
        ? 'B'
        : potentialRoll > 0.12
          ? 'C'
          : 'D';

  const contract = isDraftProspect
    ? { yearsLeft: 4, salaryM: 0.45, bonusM: 0.15 }
    : calculateMarketContract(position, ovr, age);

  if (!isDraftProspect) {
    contract.yearsLeft = 1 + Math.floor(rng() * 4);
  }

  let combine: CombineMetrics | undefined;
  if (isDraftProspect) {
    const fortyBase = 5.35 - (attributes.speed - 50) * 0.021;
    const fortyYardDash = Number(
      Math.max(4.24, Math.min(5.45, fortyBase + (rng() - 0.5) * 0.08)).toFixed(2),
    );
    const benchPressReps = clamp(
      10 + (attributes.strength - 55) * 0.52 + (rng() - 0.5) * 4,
      8,
      42,
    );
    const verticalJumpIn = Number(
      clamp(26 + (attributes.agility - 55) * 0.32 + (rng() - 0.5) * 3, 24, 44).toFixed(1),
    );
    const wonderlicScore = clamp(
      14 + (attributes.awareness - 50) * 0.55 + (rng() - 0.5) * 8,
      12,
      48,
    );
    const projectedRound =
      ovr >= 80 ? 1 : ovr >= 76 ? 2 : ovr >= 72 ? 3 : ovr >= 68 ? 4 : 5;

    combine = {
      fortyYardDash,
      benchPressReps,
      verticalJumpIn,
      wonderlicScore,
      projectedRound,
      college: COLLEGES[Math.floor(rng() * COLLEGES.length)],
    };
  }

  return {
    id,
    firstName,
    lastName,
    position,
    jerseyNumber,
    age,
    yearsPro,
    overall: ovr,
    potential,
    morale: clamp(76 + rng() * 16, 65, 96),
    moraleTrend: 'STEADY',
    moraleReason: isDraftProspect
      ? 'Preparing for the NFL Scouting Combine.'
      : 'Ready for training camp competition.',
    personality,
    trait,
    teamId,
    depthOrder: 2,
    injuryWeeks: 0,
    attributes,
    contract,
    stats: createEmptyStats(),
    careerTouchdowns: 0,
    careerYards: 0,
    careerSacks: 0,
    careerInterceptions: 0,
    lastProgressionDelta: 0,
    scoutedLevel: isDraftProspect ? 1 : 2,
    combine,
  };
}

export function generateDraftClass(
  season: number,
  rng: () => number,
  count = 64,
): Player[] {
  const prospects: Player[] = [];
  const posPool: Position[] = [
    'QB', 'QB', 'HB', 'HB', 'WR', 'WR', 'WR', 'TE',
    'OL', 'OL', 'OL', 'DL', 'DL', 'DL', 'LB', 'LB',
    'CB', 'CB', 'S', 'S', 'K', 'P',
  ];

  for (let i = 0; i < count; i++) {
    const position = posPool[i % posPool.length];
    // Top prospects in round 1 range from 79-85 OVR, later rounds 65-77 OVR
    const tier = i < 12 ? 82 : i < 28 ? 77 : i < 45 ? 73 : 68;
    const targetOvr = clamp(tier + (rng() - 0.5) * 6, 63, 86);
    const p = generateRandomPlayer(
      `DRAFT_${season}_${i + 1}`,
      'DRAFT',
      position,
      targetOvr,
      rng,
      true,
    );
    p.scoutedLevel = i < 10 ? 1 : 0;
    prospects.push(p);
  }

  return prospects.sort((a, b) => {
    const rA = a.combine?.projectedRound ?? 3;
    const rB = b.combine?.projectedRound ?? 3;
    return rA - rB || b.overall - a.overall;
  });
}

export function buildInitialLeague(seed = 2005): {
  teams: Team[];
  players: Player[];
  draftPicks: DraftPick[];
} {
  const rng = createSeededRng(seed);
  const teams: Team[] = [];
  const players: Player[] = [];
  const draftPicks: DraftPick[] = [];
  let playerSeq = 1;

  for (const tpl of TEAM_TEMPLATES) {
    const team: Team = {
      id: tpl.id,
      city: tpl.city,
      name: tpl.name,
      abbr: tpl.abbr,
      conference: tpl.conference,
      division: tpl.division,
      primaryColor: tpl.primaryColor,
      secondaryColor: tpl.secondaryColor,
      accentColor: tpl.accentColor,
      stadiumName: tpl.stadiumName,
      stadiumCapacity: tpl.stadiumCapacity,
      localPaperName: tpl.localPaperName,
      fanSupport: tpl.fanSupport,
      prestige: tpl.prestige,
      offenseScheme: tpl.offenseScheme,
      defenseScheme: tpl.defenseScheme,
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      streak: 0,
      divisionWins: 0,
      divisionLosses: 0,
      confWins: 0,
      confLosses: 0,
      finances: {
        ticketPrice: 65,
        concessionPrice: 10,
        parkingPrice: 25,
        marketingBudgetM: 2.5,
        ownerCashM: Number((22 + tpl.prestige * 3.5).toFixed(2)),
        seasonRevenueM: 0,
        seasonExpensesM: 0,
        lastAttendance: Math.round(tpl.stadiumCapacity * (0.85 + tpl.fanSupport * 0.0014)),
        deadCapPenaltyM: 0,
      },
      coaches: {
        hc: {
          id: `HC_${tpl.id}`,
          name: tpl.coachName,
          role: 'HC',
          rating: tpl.coachRating,
          specialty: `${tpl.offenseScheme} / ${tpl.defenseScheme}`,
          salaryM: Number((2.2 + (tpl.coachRating - 75) * 0.12).toFixed(2)),
          yearsLeft: 3,
        },
        oc: {
          id: `OC_${tpl.id}`,
          name: `${FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)]}`,
          role: 'OC',
          rating: clamp(tpl.coachRating - 3 + (rng() - 0.5) * 10, 70, 96),
          specialty: tpl.offenseScheme,
          salaryM: 1.1,
          yearsLeft: 2,
        },
        dc: {
          id: `DC_${tpl.id}`,
          name: `${FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)]}`,
          role: 'DC',
          rating: clamp(tpl.coachRating - 2 + (rng() - 0.5) * 10, 70, 97),
          specialty: tpl.defenseScheme,
          salaryM: 1.1,
          yearsLeft: 2,
        },
        trainer: {
          id: `TR_${tpl.id}`,
          name: `${FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)]}`,
          role: 'TRAINER',
          rating: clamp(76 + rng() * 18, 72, 96),
          specialty: 'Sports Medicine & Conditioning',
          salaryM: 0.65,
          yearsLeft: 3,
        },
      },
      championshipsWon: 0,
    };

    teams.push(team);

    // 1. Add Team Stars
    for (const star of tpl.stars) {
      const p = createPlayerFromSeed(`PLY_${playerSeq++}`, tpl.id, star, rng);
      players.push(p);
    }

    // 2. Fill remaining minimum roster spots for each position
    for (const pos of ALL_POSITIONS) {
      const existingAtPos = players.filter(
        (p) => p.teamId === tpl.id && p.position === pos,
      );
      const needed = POSITION_MIN_ROSTER[pos] - existingAtPos.length;
      for (let i = 0; i < needed; i++) {
        const isStarterNeeded = existingAtPos.length + i === 0;
        const baseTier = isStarterNeeded
          ? 78 + tpl.prestige * 2
          : 71 + tpl.prestige * 1.2;
        const targetOvr = clamp(baseTier + (rng() - 0.5) * 9, 64, 88);
        const p = generateRandomPlayer(
          `PLY_${playerSeq++}`,
          tpl.id,
          pos,
          targetOvr,
          rng,
          false,
        );
        players.push(p);
      }
    }

    normalizeTeamDepthChart(tpl.id, players);

    // Scale contracts gently if initial team cap exceeds $72.5M so every team starts with healthy cap room ($6M-$18M under the $80.5M cap)
    const initialCap = getTeamCapUsedM(team, players);
    if (initialCap > 72.5) {
      const factor = 71.0 / initialCap;
      for (const p of players.filter((pl) => pl.teamId === tpl.id)) {
        p.contract.salaryM = Number(Math.max(0.35, p.contract.salaryM * factor).toFixed(2));
        p.contract.bonusM = Number(Math.max(0.05, p.contract.bonusM * factor).toFixed(2));
      }
    }

    // Create 5 rounds of draft picks for Season 2004 and 2005
    for (const season of [2004, 2005]) {
      for (let round = 1; round <= 5; round++) {
        draftPicks.push({
          id: `PICK_${season}_R${round}_${tpl.id}`,
          season,
          round,
          originalTeamId: tpl.id,
          currentTeamId: tpl.id,
        });
      }
    }
  }

  // 3. Generate Free Agent Pool (40 veteran free agents across all positions)
  for (let i = 0; i < 40; i++) {
    const pos = ALL_POSITIONS[i % ALL_POSITIONS.length];
    const targetOvr = clamp(72 + (rng() - 0.35) * 14, 65, 86);
    const fa = generateRandomPlayer(
      `FA_INIT_${i + 1}`,
      'FA',
      pos,
      targetOvr,
      rng,
      false,
    );
    fa.morale = 75;
    fa.moraleReason = 'Seeking a starting opportunity in Free Agency.';
    players.push(fa);
  }

  // 4. Generate 2004 College Draft Class (can be scouted during the season!)
  const draftClass = generateDraftClass(2004, rng, 64);
  players.push(...draftClass);

  return { teams, players, draftPicks };
}
