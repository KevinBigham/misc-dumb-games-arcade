import {
  Conference,
  Division,
  Player,
  ScheduledGame,
  Team,
} from '../models/types';
import { createSeededRng, getTeamRatings } from './rosters-and-generator';

const DIVISIONS: Division[] = ['North', 'South', 'East', 'West'];
const CONFERENCES: Conference[] = ['AFC', 'NFC'];

export function getWinPct(team: Team): number {
  const total = team.wins + team.losses + team.ties;
  if (total === 0) return 0.5;
  return (team.wins + team.ties * 0.5) / total;
}

export function sortTeamsForStandings(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => {
    const pctA = getWinPct(a);
    const pctB = getWinPct(b);
    if (Math.abs(pctB - pctA) > 0.0001) return pctB - pctA;
    if (b.wins !== a.wins) return b.wins - a.wins;
    const divPctA =
      a.divisionWins + a.divisionLosses > 0
        ? a.divisionWins / (a.divisionWins + a.divisionLosses)
        : 0.5;
    const divPctB =
      b.divisionWins + b.divisionLosses > 0
        ? b.divisionWins / (b.divisionWins + b.divisionLosses)
        : 0.5;
    if (Math.abs(divPctB - divPctA) > 0.001) return divPctB - divPctA;
    const diffA = a.pointsFor - a.pointsAgainst;
    const diffB = b.pointsFor - b.pointsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    return b.prestige - a.prestige;
  });
}

export interface PlayoffSeedEntry {
  seed: number; // 1 to 6
  team: Team;
  reason: 'Division Leader' | 'Wild Card';
}

export function getConferencePlayoffSeeds(
  conference: Conference,
  teams: Team[],
): PlayoffSeedEntry[] {
  const confTeams = teams.filter((t) => t.conference === conference);
  const divisionWinners: Team[] = [];

  for (const div of DIVISIONS) {
    const divTeams = sortTeamsForStandings(
      confTeams.filter((t) => t.division === div),
    );
    if (divTeams.length > 0) {
      divisionWinners.push(divTeams[0]);
    }
  }

  const sortedWinners = sortTeamsForStandings(divisionWinners);
  const winnerIds = new Set(sortedWinners.map((t) => t.id));
  const remaining = sortTeamsForStandings(
    confTeams.filter((t) => !winnerIds.has(t.id)),
  );

  const seeds: PlayoffSeedEntry[] = [];
  sortedWinners.forEach((team, idx) => {
    seeds.push({
      seed: idx + 1,
      team,
      reason: 'Division Leader',
    });
  });

  remaining.slice(0, 2).forEach((team, idx) => {
    seeds.push({
      seed: 5 + idx,
      team,
      reason: 'Wild Card',
    });
  });

  return seeds;
}

export function getPowerRankings(
  teams: Team[],
  players: Player[],
): { rank: number; team: Team; overall: number; powerScore: number }[] {
  return teams
    .map((team) => {
      const ratings = getTeamRatings(team.id, players);
      const games = team.wins + team.losses + team.ties;
      const winPct = games > 0 ? (team.wins + 0.5 * team.ties) / games : 0.5;
      const pointDiff = team.pointsFor - team.pointsAgainst;
      const powerScore =
        ratings.overall * 0.55 + winPct * 42 + pointDiff * 0.08 + team.streak * 1.1;
      return {
        rank: 0,
        team,
        overall: ratings.overall,
        powerScore,
      };
    })
    .sort((a, b) => b.powerScore - a.powerScore)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));
}

/**
 * Generates a 17-week NFL schedule where each team plays 16 regular season games
 * and has 1 bye week (Weeks 4-11).
 * Includes divisional rivalries, intra-conference, and inter-conference matchups.
 */
export function generateRegularSeasonSchedule(
  season: number,
  teams: Team[],
): ScheduledGame[] {
  const rng = createSeededRng(season * 101 + 2005);
  const games: ScheduledGame[] = [];
  let gameSeq = 1;

  // Assign each division pair a bye week in Weeks 4..11 (4 teams per week = 2 matchups on bye)
  const byeWeekByTeam = new Map<string, number>();
  let divPairIdx = 0;
  for (const conf of CONFERENCES) {
    for (const div of DIVISIONS) {
      const divTeams = teams.filter(
        (t) => t.conference === conf && t.division === div,
      );
      // Pair (0,1) and (2,3) get different bye weeks between 4 and 11
      const byeA = 4 + (divPairIdx % 8);
      const byeB = 4 + ((divPairIdx + 4) % 8);
      if (divTeams[0]) byeWeekByTeam.set(divTeams[0].id, byeA);
      if (divTeams[1]) byeWeekByTeam.set(divTeams[1].id, byeA);
      if (divTeams[2]) byeWeekByTeam.set(divTeams[2].id, byeB);
      if (divTeams[3]) byeWeekByTeam.set(divTeams[3].id, byeB);
      divPairIdx++;
    }
  }

  // For each week 1..17, pair available (non-bye) teams prioritizing divisional & conference matchups
  const matchupCounts = new Map<string, number>();
  const pairKey = (a: string, b: string) => (a < b ? `${a}_${b}` : `${b}_${a}`);

  for (let week = 1; week <= 17; week++) {
    const activeTeams = teams.filter((t) => byeWeekByTeam.get(t.id) !== week);
    // Shuffle slightly with deterministic seed
    const pool = [...activeTeams].sort(() => rng() - 0.5);
    const used = new Set<string>();

    // In Weeks 1, 2, 15, 16, 17 prioritize divisional rivalries!
    const preferDivision = [1, 2, 6, 12, 15, 16, 17].includes(week);

    for (let i = 0; i < pool.length; i++) {
      const teamA = pool[i];
      if (used.has(teamA.id)) continue;

      let bestPartner: Team | null = null;
      let bestScore = -9999;

      for (let j = i + 1; j < pool.length; j++) {
        const teamB = pool[j];
        if (used.has(teamB.id)) continue;

        const key = pairKey(teamA.id, teamB.id);
        const timesPlayed = matchupCounts.get(key) ?? 0;
        const sameDiv =
          teamA.conference === teamB.conference &&
          teamA.division === teamB.division;
        const sameConf = teamA.conference === teamB.conference;

        let score = 0;
        if (sameDiv) {
          if (timesPlayed === 0) score += preferDivision ? 90 : 45;
          else if (timesPlayed === 1) score += preferDivision ? 65 : 25;
          else score -= 80; // Don't play a division rival 3 times
        } else if (sameConf) {
          if (timesPlayed === 0) score += 40;
          else score -= 60;
        } else {
          if (timesPlayed === 0) score += 30;
          else score -= 70;
        }

        score += (rng() - 0.5) * 6;
        if (score > bestScore) {
          bestScore = score;
          bestPartner = teamB;
        }
      }

      if (bestPartner) {
        used.add(teamA.id);
        used.add(bestPartner.id);
        const key = pairKey(teamA.id, bestPartner.id);
        const prev = matchupCounts.get(key) ?? 0;
        matchupCounts.set(key, prev + 1);

        const flipHome = prev % 2 === 1 || (prev === 0 && rng() > 0.5);
        const homeTeamId = flipHome ? bestPartner.id : teamA.id;
        const awayTeamId = flipHome ? teamA.id : bestPartner.id;

        games.push({
          id: `GAME_${season}_W${week}_${gameSeq++}`,
          season,
          week,
          stage: 'REG',
          homeTeamId,
          awayTeamId,
          played: false,
          homeScore: 0,
          awayScore: 0,
        });
      }
    }
  }

  return games;
}

export function generateWildCardSchedule(
  season: number,
  teams: Team[],
): ScheduledGame[] {
  const games: ScheduledGame[] = [];
  for (const conf of CONFERENCES) {
    const seeds = getConferencePlayoffSeeds(conf, teams);
    if (seeds.length >= 6) {
      // #3 hosts #6, #4 hosts #5
      games.push({
        id: `PLAYOFF_${season}_WC_${conf}_1`,
        season,
        week: 18,
        stage: 'WC',
        homeTeamId: seeds[2].team.id,
        awayTeamId: seeds[5].team.id,
        played: false,
        homeScore: 0,
        awayScore: 0,
      });
      games.push({
        id: `PLAYOFF_${season}_WC_${conf}_2`,
        season,
        week: 18,
        stage: 'WC',
        homeTeamId: seeds[3].team.id,
        awayTeamId: seeds[4].team.id,
        played: false,
        homeScore: 0,
        awayScore: 0,
      });
    }
  }
  return games;
}

export function generateDivisionalSchedule(
  season: number,
  teams: Team[],
  existingSchedule: ScheduledGame[],
): ScheduledGame[] {
  const games: ScheduledGame[] = [];
  const wcGames = existingSchedule.filter(
    (g) => g.season === season && g.stage === 'WC' && g.played,
  );

  for (const conf of CONFERENCES) {
    const seeds = getConferencePlayoffSeeds(conf, teams);
    const seedMap = new Map<string, number>();
    seeds.forEach((s) => seedMap.set(s.team.id, s.seed));

    const confWcWinners = wcGames
      .filter((g) => seedMap.has(g.homeTeamId))
      .map((g) => (g.homeScore >= g.awayScore ? g.homeTeamId : g.awayTeamId))
      .sort((a, b) => (seedMap.get(a) ?? 9) - (seedMap.get(b) ?? 9));

    if (seeds.length >= 2 && confWcWinners.length === 2) {
      const highestRemainingSeed = confWcWinners[0];
      const lowestRemainingSeed = confWcWinners[1];
      // #1 seed hosts lowest remaining seed; #2 seed hosts highest remaining seed
      games.push({
        id: `PLAYOFF_${season}_DIV_${conf}_1`,
        season,
        week: 19,
        stage: 'DIV',
        homeTeamId: seeds[0].team.id,
        awayTeamId: lowestRemainingSeed,
        played: false,
        homeScore: 0,
        awayScore: 0,
      });
      games.push({
        id: `PLAYOFF_${season}_DIV_${conf}_2`,
        season,
        week: 19,
        stage: 'DIV',
        homeTeamId: seeds[1].team.id,
        awayTeamId: highestRemainingSeed,
        played: false,
        homeScore: 0,
        awayScore: 0,
      });
    }
  }

  return games;
}

export function generateConfChampionshipSchedule(
  season: number,
  teams: Team[],
  existingSchedule: ScheduledGame[],
): ScheduledGame[] {
  const games: ScheduledGame[] = [];
  const divGames = existingSchedule.filter(
    (g) => g.season === season && g.stage === 'DIV' && g.played,
  );

  for (const conf of CONFERENCES) {
    const seeds = getConferencePlayoffSeeds(conf, teams);
    const seedMap = new Map<string, number>();
    seeds.forEach((s) => seedMap.set(s.team.id, s.seed));

    const winners = divGames
      .filter((g) => seedMap.has(g.homeTeamId))
      .map((g) => (g.homeScore >= g.awayScore ? g.homeTeamId : g.awayTeamId))
      .sort((a, b) => (seedMap.get(a) ?? 9) - (seedMap.get(b) ?? 9));

    if (winners.length === 2) {
      games.push({
        id: `PLAYOFF_${season}_CONF_${conf}`,
        season,
        week: 20,
        stage: 'CONF',
        homeTeamId: winners[0],
        awayTeamId: winners[1],
        played: false,
        homeScore: 0,
        awayScore: 0,
      });
    }
  }

  return games;
}

export function generateChampionshipBowlSchedule(
  season: number,
  existingSchedule: ScheduledGame[],
): ScheduledGame[] {
  const confGames = existingSchedule.filter(
    (g) => g.season === season && g.stage === 'CONF' && g.played,
  );
  if (confGames.length < 2) return [];

  const afcWinner =
    confGames[0].homeScore >= confGames[0].awayScore
      ? confGames[0].homeTeamId
      : confGames[0].awayTeamId;
  const nfcWinner =
    confGames[1].homeScore >= confGames[1].awayScore
      ? confGames[1].homeTeamId
      : confGames[1].awayTeamId;

  return [
    {
      id: `PLAYOFF_${season}_BOWL`,
      season,
      week: 21,
      stage: 'BOWL',
      homeTeamId: afcWinner,
      awayTeamId: nfcWinner,
      played: false,
      homeScore: 0,
      awayScore: 0,
    },
  ];
}
