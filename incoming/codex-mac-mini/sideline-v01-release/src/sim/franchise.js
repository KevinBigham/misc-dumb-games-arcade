import { FRANCHISE_VERSION, ROSTER_LIMIT, POSITIONS, ROSTER_SLOTS, STARTER_SLOTS } from '../contracts.js';
import { random, choose, normalizeSeed } from './rng.js';
import { TEAM_DATA, FIRST_NAMES, LAST_NAMES, COLLEGES, OFFENSES, DEFENSES } from './franchise-data.js';

const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
const int = (s, low, high) => low + Math.floor(random(s) * (high - low + 1));
const average = values => values.reduce((a, b) => a + b, 0) / (values.length || 1);
const emptyStats = () => ({ games: 0, passYards: 0, rushYards: 0, receivingYards: 0, touchdowns: 0, tackles: 0, sacks: 0 });
const emptyRecord = () => ({ wins: 0, losses: 0, ties: 0, pf: 0, pa: 0, streak: 0 });
const fail = message => { throw new Error(message); };
export const getTeam = (s, id = s.userTeam) => s.teams.find(t => t.id === id);
export const getPlayer = (s, id) => s.players.find(p => p.id === id);
export const roster = (s, id = s.userTeam) => s.players.filter(p => p.teamId === id);
export const payroll = (s, id = s.userTeam) => roster(s, id).reduce((a, p) => a + p.salary, 0) + getTeam(s, id).deadCap;
export const capRoom = (s, id = s.userTeam) => s.cap - payroll(s, id);
export const marketSalary = p => Math.round((450 + Math.max(0, p.overall - 55) ** 2 * 4) * (p.position === 'QB' ? 1.45 : ['K', 'P'].includes(p.position) ? .6 : 1));
export const recordText = t => `${t.wins}–${t.losses}${t.ties ? `–${t.ties}` : ''}`;

function news(s, category, title, body) {
  s.news.unshift({ id: s.nextNews++, year: s.year, week: s.week, category, title, body });
  s.news = s.news.slice(0, 60);
}

function player(s, teamId, position, overall, rookie = false) {
  const age = rookie ? int(s, 21, 23) : int(s, 23, 34);
  const p = { id: `p${s.nextId++}`, name: `${choose(s, FIRST_NAMES)} ${choose(s, LAST_NAMES)}`, teamId, position,
    overall, potential: clamp(overall + int(s, 2, age < 26 ? 16 : 6), 50, 99), age,
    number: int(s, 1, 99), college: choose(s, COLLEGES), morale: int(s, 68, 90), injury: 0,
    years: rookie ? 4 : int(s, 1, 4), salary: 0, bonus: 0, depth: 0, change: 0, scouted: false, stats: emptyStats() };
  p.salary = marketSalary(p); p.bonus = Math.round(p.salary * .2);
  return p;
}

/** Six division games, four conference games, four interconference games, two
 * conference placement games. The entire league shares a week-nine bye. */
export function makeSchedule(s) {
  const games = [];
  let serial = 1;
  const add = (week, a, b) => games.push({ id: `${s.year}-g${serial++}`, week: week >= 9 ? week + 1 : week, home: a, away: b, played: false, playoff: false });
  const pairings = [[[0, 3], [1, 2]], [[0, 2], [3, 1]], [[0, 1], [2, 3]]];
  for (let division = 0; division < 8; division++) {
    for (let round = 0; round < 6; round++) {
      for (const [a, b] of pairings[round % 3]) {
        const ids = [division * 4 + a, division * 4 + b];
        if (round >= 3) ids.reverse();
        add(round + 1, ...ids);
      }
    }
  }
  // Rotating paired divisions within each conference.
  const shift = (s.year - 2005) % 3 + 1;
  for (let conference = 0; conference < 2; conference++) {
    for (let d = 0; d < 4; d++) {
      const other = d ^ shift;
      if (d > other) continue;
      for (let round = 0; round < 4; round++) for (let p = 0; p < 4; p++) {
        const ids = [conference * 16 + d * 4 + p, conference * 16 + other * 4 + (p + round) % 4];
        if (round % 2) ids.reverse();
        add(7 + round, ...ids);
      }
    }
  }
  for (let d = 0; d < 4; d++) for (let round = 0; round < 4; round++) for (let p = 0; p < 4; p++) {
    const ids = [d * 4 + p, 16 + ((d + s.year - 2005) % 4) * 4 + (p + round) % 4];
    if (round % 2) ids.reverse();
    add(11 + round, ...ids);
  }
  const remaining = [1, 2, 3].filter(x => x !== shift);
  // Orient the four-division cycle so every club gets one home and one away.
  const cycle = [0, remaining[0], remaining[0] ^ remaining[1], remaining[1]];
  for (let c = 0; c < 2; c++) for (let edge = 0; edge < 4; edge++) {
    const home = cycle[edge], away = cycle[(edge + 1) % 4];
    for (let p = 0; p < 4; p++) add(15 + edge % 2, c * 16 + home * 4 + p, c * 16 + away * 4 + p);
  }
  return games.sort((a, b) => a.week - b.week);
}

export function createFranchise(seed = 2005, userTeam = 4) {
  if (!Number.isInteger(userTeam) || userTeam < 0 || userTeam >= 32) fail('Choose a valid team.');
  const s = { version: FRANCHISE_VERSION, revision: 0, seed: normalizeSeed(seed), rngState: normalizeSeed(seed), userTeam,
    year: 2005, week: 1, phase: 'regular', cap: 95000, nextId: 1, nextNews: 1, players: [], teams: [], schedule: [],
    news: [], history: [], draft: null, playoffSeeds: [], trainedWeek: '', scoutingPoints: 8, scoutingYear: 2005, prospects: [] };
  s.teams = TEAM_DATA.map(([city, name, abbr, conference, division, color], id) => ({ id, city, name, abbr, conference, division, color,
    ...emptyRecord(), offense: 'balanced', defense: 'balanced', training: 'balanced', coach: int(s, 65, 85),
    cash: 65000, ticket: 65, fans: int(s, 65, 83), stadium: 1, revenue: 0, expenses: 0, deadCap: 0 }));
  for (const team of s.teams) {
    const strength = int(s, -4, 5);
    for (const pos of POSITIONS) for (let i = 0; i < ROSTER_SLOTS[pos]; i++) {
      const overall = clamp(int(s, i < STARTER_SLOTS[pos] ? 73 : 56, i < STARTER_SLOTS[pos] ? 88 : 73) + strength, 50, 96);
      const p = player(s, team.id, pos, overall); p.depth = i; s.players.push(p);
    }
    const budget = int(s, 76000, 86000), scale = budget / payroll(s, team.id);
    for (const p of roster(s, team.id)) { p.salary = Math.max(300, Math.round(p.salary * scale)); p.bonus = Math.round(p.salary * .2); }
  }
  for (let i = 0; i < 100; i++) s.players.push(player(s, null, POSITIONS[i % POSITIONS.length], int(s, 58, 81)));
  s.schedule = makeSchedule(s); createProspects(s);
  news(s, 'FRONT OFFICE', 'A new era starts here.', `You have the keys to the ${getTeam(s).city} ${getTeam(s).name}. Build your roster, establish an identity, and bring home the championship.`);
  news(s, 'SCOUTING', 'The next generation is on the board.', 'Your scouts have eight reports available. Get an early look at next spring’s draft class.');
  return s;
}

export function depthChart(s, id = s.userTeam, position) {
  return roster(s, id).filter(p => !position || p.position === position).sort((a, b) => a.depth - b.depth || b.overall - a.overall || a.id.localeCompare(b.id));
}
function starters(s, id, positions) {
  return positions.flatMap(pos => {
    const healthy = depthChart(s, id, pos).filter(p => p.injury === 0).slice(0, STARTER_SLOTS[pos]);
    return [...healthy, ...Array(Math.max(0, STARTER_SLOTS[pos] - healthy.length)).fill({ overall: 40, morale: 50 })];
  });
}
export function teamRatings(s, id = s.userTeam) {
  const off = starters(s, id, ['QB', 'RB', 'WR', 'TE', 'OL']);
  const def = starters(s, id, ['DL', 'LB', 'CB', 'S']);
  const offense = Math.round(average(off.map(p => p.overall)));
  const defense = Math.round(average(def.map(p => p.overall)));
  return { offense, defense, overall: Math.round((offense + defense) / 2), morale: Math.round(average(roster(s, id).map(p => p.morale))) };
}
export function standings(s, conference, division) {
  return s.teams.filter(t => (!conference || t.conference === conference) && (!division || t.division === division))
    .sort((a, b) => (b.wins + b.ties / 2) / Math.max(1, b.wins + b.losses + b.ties) - (a.wins + a.ties / 2) / Math.max(1, a.wins + a.losses + a.ties) || (b.pf - b.pa) - (a.pf - a.pa) || b.pf - a.pf || a.id - b.id);
}
export const nextGame = (s, id = s.userTeam) => s.schedule.find(g => !g.played && (g.home === id || g.away === id));
export const lastGame = (s, id = s.userTeam) => s.schedule.filter(g => g.played && (g.home === id || g.away === id)).at(-1);

export function setStrategy(s, offense, defense, training) {
  if (!Object.hasOwn(OFFENSES, offense) || !Object.hasOwn(DEFENSES, defense) || !['balanced', 'offense', 'defense'].includes(training)) fail('Invalid game plan.');
  Object.assign(getTeam(s), { offense, defense, training });
}
export function promotePlayer(s, id) {
  const p = getPlayer(s, id);
  if (!p || p.teamId !== s.userTeam) fail('This player is not on your roster.');
  if (p.injury > 0) fail('An injured player cannot start.');
  const list = depthChart(s, s.userTeam, p.position).filter(q => q.id !== id);
  [p, ...list].forEach((q, i) => { q.depth = i; });
}
export function trainTeam(s) {
  if (!['regular', 'playoffs'].includes(s.phase)) fail('Weekly training is available during the season.');
  const key = `${s.year}-${s.week}`;
  if (s.trainedWeek === key) fail('Training is already complete this week.');
  const t = getTeam(s);
  const group = t.training === 'offense' ? ['QB', 'RB', 'WR', 'TE', 'OL'] : t.training === 'defense' ? ['DL', 'LB', 'CB', 'S'] : POSITIONS;
  const eligible = roster(s).filter(p => group.includes(p.position) && p.injury === 0);
  let improved = 0;
  for (const p of eligible) {
    p.morale = clamp(p.morale + 2, 0, 99);
    if (p.age < 28 && p.overall < p.potential && random(s) < .16 + (t.coach - 70) / 200) { p.overall++; p.change++; improved++; }
  }
  s.trainedWeek = key;
  news(s, 'PRACTICE REPORT', 'The work happens during the week.', `${improved} players improved. ${eligible.length} healthy players gained morale in ${t.training} training.`);
  return improved;
}

function checkSigning(s, p, id, salary) {
  if (roster(s, id).length >= ROSTER_LIMIT) fail('Your 53-man roster is full. Release or trade a player first.');
  if (capRoom(s, id) < salary) fail('Not enough salary cap space.');
  if (!p || p.teamId !== null) fail('That player is no longer a free agent.');
}
export function signPlayer(s, id, years = 2) {
  const p = getPlayer(s, id);
  if (!p || p.teamId !== null || !Number.isInteger(years) || years < 1 || years > 4) fail('Choose a free agent and a 1–4 year contract.');
  const salary = marketSalary(p); checkSigning(s, p, s.userTeam, salary);
  Object.assign(p, { teamId: s.userTeam, years, salary, bonus: Math.round(salary * .2), depth: 99, morale: 78 });
  normalizeDepth(s, s.userTeam);
  news(s, 'TRANSACTION', `${p.name} signs with ${getTeam(s).city}.`, `${years}-year contract, $${(salary / 1000).toFixed(2)}M per year. ${p.position} · ${p.overall} OVR.`);
}
export function releasePlayer(s, id) {
  const p = getPlayer(s, id);
  if (!p || p.teamId !== s.userTeam) fail('This player is not on your roster.');
  if (depthChart(s, s.userTeam, p.position).length <= STARTER_SLOTS[p.position]) fail(`Keep at least ${STARTER_SLOTS[p.position]} ${p.position} on the roster.`);
  getTeam(s).deadCap += p.bonus;
  Object.assign(p, { teamId: null, years: 0, depth: 99 });
  normalizeDepth(s, s.userTeam);
  news(s, 'TRANSACTION', `${p.name} released.`, `The remaining $${(p.bonus / 1000).toFixed(2)}M signing bonus stays on this season’s cap.`);
}
export function extendPlayer(s, id, years = 3) {
  const p = getPlayer(s, id);
  if (!p || p.teamId !== s.userTeam) fail('This player is not on your roster.');
  if (p.years > 1) fail('Extensions open in the final contract year.');
  if (!Number.isInteger(years) || years < 1 || years > 4) fail('Choose a 1–4 year extension.');
  const salary = marketSalary(p);
  if (capRoom(s) + p.salary < salary) fail('Not enough salary cap space for this extension.');
  Object.assign(p, { salary, years: years + 1, bonus: Math.round(salary * .2), morale: clamp(p.morale + 8, 0, 99) });
  news(s, 'CONTRACT', `${p.name} is staying.`, `Extended for ${years} additional years at $${(salary / 1000).toFixed(2)}M per season, effective immediately.`);
}
export function tradeValue(p) { return Math.round(p.overall ** 2 / 100 + Math.max(0, 28 - p.age) * 2 + (p.years > 1 ? 3 : 0) + (p.position === 'QB' ? 10 : 0) - p.salary / 1200 - p.injury * 2); }
export function tradePlayers(s, outgoingId, incomingId) {
  if (!['regular', 'offseason', 'preseason'].includes(s.phase) || (s.phase === 'regular' && s.week > 8)) fail('Trading is closed. The regular-season deadline is week 8.');
  const a = getPlayer(s, outgoingId), b = getPlayer(s, incomingId);
  if (!a || !b || a.teamId !== s.userTeam || b.teamId === null || b.teamId === s.userTeam) fail('Choose a player from each team.');
  if (a.position !== b.position) fail('This trade desk supports same-position swaps.');
  if (tradeValue(a) < tradeValue(b) + 3) fail('Trade declined. The other front office wants more value.');
  const other = b.teamId;
  if (capRoom(s) + a.salary - b.salary - a.bonus < 0 || capRoom(s, other) + b.salary - a.salary - b.bonus < 0) fail('This trade would put a team over the salary cap.');
  getTeam(s).deadCap += a.bonus; getTeam(s, other).deadCap += b.bonus;
  a.teamId = other; b.teamId = s.userTeam;
  a.bonus = 0; b.bonus = 0; a.depth = 99; b.depth = 99;
  normalizeDepth(s, other); normalizeDepth(s, s.userTeam);
  news(s, 'TRADE', `${b.name} joins ${getTeam(s).city}.`, `${a.name} heads to ${getTeam(s, other).city} in a player-for-player deal.`);
}
function normalizeDepth(s, id) { for (const pos of POSITIONS) depthChart(s, id, pos).forEach((p, i) => { p.depth = i; }); }
export function setTicketPrice(s, value) {
  if (!Number.isInteger(value) || value < 35 || value > 150) fail('Ticket prices must be between $35 and $150.');
  getTeam(s).ticket = value;
}
export function upgradeFacility(s) {
  const t = getTeam(s), cost = 15000 * t.stadium;
  if (t.stadium >= 5) fail('Your facilities are already at the highest level.');
  if (t.cash < cost) fail('Not enough owner cash for this investment.');
  t.cash -= cost; t.expenses += cost; t.stadium++; t.fans = clamp(t.fans + 3, 0, 99);
  news(s, 'OWNERSHIP', 'Investing in the home-field advantage.', 'Facility upgrades increase stadium capacity, concession revenue, and fan interest.');
}
export function upgradeCoach(s) {
  const t = getTeam(s);
  if (t.coach >= 95) fail('Your coaching staff is already elite.');
  if (t.cash < 8000) fail('You need $8M in owner cash to invest in staff.');
  t.cash -= 8000; t.expenses += 8000; t.coach = Math.min(95, t.coach + 5);
  news(s, 'COACHING', 'A stronger staff. A higher standard.', 'Coaching quality improves game preparation and the chance of player growth in training.');
}
export function attendance(t) { return Math.round((60000 + t.stadium * 2000) * clamp(.6 + t.fans / 180 - (t.ticket - 65) / 200, .3, 1)); }

function simulateGame(s, game) {
  const home = getTeam(s, game.home), away = getTeam(s, game.away);
  const hr = teamRatings(s, home.id), ar = teamRatings(s, away.id);
  const boxes = [home, away].map(t => ({ teamId: t.id, score: 0, quarters: [0, 0, 0, 0], passYards: 0, rushYards: 0, turnovers: 0, touchdowns: 0, drives: 0 }));
  const drives = [];
  for (let drive = 0; drive < 24; drive++) {
    const i = drive % 2, t = i === 0 ? home : away, opp = i === 0 ? away : home;
    const ratings = i === 0 ? hr : ar, other = i === 0 ? ar : hr;
    const scheme = (t.offense === 'run' && opp.defense === 'coverage') || (t.offense === 'pass' && opp.defense === 'blitz') ? 3 : (t.offense === 'pass' && opp.defense === 'coverage') || (t.offense === 'run' && opp.defense === 'blitz') ? -3 : 0;
    const edge = ratings.offense - other.defense + (t.coach - opp.coach) / 3 + (ratings.morale - 75) / 8 + scheme + (i === 0 ? 2 : 0);
    const touchdown = clamp(.22 + edge / 180, .07, .45);
    const roll = random(s), box = boxes[i], quarter = Math.floor(drive / 6);
    let points = 0, result = 'Punt', yards = int(s, 8, 35);
    if (roll < touchdown) { points = 7; result = 'Touchdown'; yards = int(s, 55, 80); box.touchdowns++; }
    else if (roll < touchdown + .15) { points = 3; result = 'Field goal'; yards = int(s, 35, 60); }
    else if (roll < touchdown + .25 + (opp.defense === 'blitz' ? .025 : 0)) { result = 'Turnover'; box.turnovers++; yards = int(s, 0, 25); }
    const passShare = t.offense === 'pass' ? .78 : t.offense === 'run' ? .42 : .62;
    const pass = Math.round(yards * clamp(passShare + (random(s) - .5) * .2, .2, .9));
    box.passYards += pass; box.rushYards += yards - pass; box.score += points; box.quarters[quarter] += points; box.drives++;
    drives.push({ quarter: quarter + 1, teamId: t.id, result, yards, homeScore: boxes[0].score, awayScore: boxes[1].score });
  }
  if (boxes[0].score === boxes[1].score) {
    const winner = random(s) < clamp(.52 + (hr.overall - ar.overall) / 150, .2, .8) ? 0 : 1;
    boxes[winner].score += 3; boxes[0].quarters.push(winner === 0 ? 3 : 0); boxes[1].quarters.push(winner === 1 ? 3 : 0);
    drives.push({ quarter: 5, teamId: boxes[winner].teamId, result: 'Overtime field goal', yards: int(s, 30, 65), homeScore: boxes[0].score, awayScore: boxes[1].score });
  }
  Object.assign(game, { played: true, homeScore: boxes[0].score, awayScore: boxes[1].score, boxes, drives, attendance: attendance(home) });
  for (let i = 0; i < 2; i++) {
    const t = i === 0 ? home : away, box = boxes[i], other = boxes[1 - i], won = box.score > other.score;
    if (!game.playoff) {
      t.pf += box.score; t.pa += other.score;
      t.wins += Number(won); t.losses += Number(!won); t.streak = won ? Math.max(0, t.streak) + 1 : Math.min(0, t.streak) - 1;
    }
    t.fans = clamp(t.fans + (won ? 2 : -2), 30, 99);
    const players = roster(s, t.id);
    for (const p of players) { p.morale = clamp(p.morale + (won ? 2 : -2), 25, 99); if (!p.injury) p.stats.games++; }
    const qb = depthChart(s, t.id, 'QB').find(p => !p.injury);
    const rb = depthChart(s, t.id, 'RB').find(p => !p.injury);
    if (qb) { qb.stats.passYards += box.passYards; qb.stats.touchdowns += Math.round(box.touchdowns * .65); }
    if (rb) { rb.stats.rushYards += box.rushYards; rb.stats.touchdowns += box.touchdowns - Math.round(box.touchdowns * .65); }
    const receivers = depthChart(s, t.id, 'WR').filter(p => !p.injury).slice(0, 3);
    receivers.forEach((p, index) => { p.stats.receivingYards += Math.floor(box.passYards * [0.45, .33, .22][index]); });
    for (const p of starters(s, t.id, ['DL', 'LB', 'CB', 'S']).filter(p => p.id)) { p.stats.tackles += int(s, 2, 7); if (random(s) < .11) p.stats.sacks++; }
    const healthy = players.filter(p => !p.injury);
    if (healthy.length && random(s) < .32) {
      const p = choose(s, healthy); p.injury = int(s, 1, 4);
      if (t.id === s.userTeam) news(s, 'INJURY REPORT', `${p.name} sidelined.`, `${p.position} will miss ${p.injury} week${p.injury === 1 ? '' : 's'}. The next healthy player on the depth chart takes over.`);
    }
    const revenue = 3000 + (i === 0 ? Math.round(game.attendance * (t.ticket + 18 + t.stadium * 3) / 1000) : 0);
    const cost = Math.round(payroll(s, t.id) / 16) + 650;
    t.cash += revenue - cost; t.revenue += revenue; t.expenses += cost;
  }
  return game;
}

function addPlayoff(s, home, away, week, round) {
  s.schedule.push({ id: `${s.year}-p${week}-${home}`, week, home, away, played: false, playoff: true, round });
}
function seedPlayoffs(s) {
  s.phase = 'playoffs'; s.week = 18; s.playoffSeeds = [];
  for (const conference of ['Atlantic', 'Pacific']) {
    const ordered = standings(s, conference);
    const champions = ['East', 'North', 'South', 'West'].map(d => standings(s, conference, d)[0].id);
    const seeds = [...ordered.filter(t => champions.includes(t.id)), ...ordered.filter(t => !champions.includes(t.id)).slice(0, 2)].map(t => t.id);
    s.playoffSeeds.push(seeds);
    addPlayoff(s, seeds[2], seeds[5], 18, 'Wild Card'); addPlayoff(s, seeds[3], seeds[4], 18, 'Wild Card');
  }
  news(s, 'POSTSEASON', 'The road to the Championship.', s.playoffSeeds.flat().includes(s.userTeam) ? 'You are in. Twelve teams remain. Make every possession count.' : 'Your season is over. Follow the playoff bracket, then build for next year.');
}
function nextPlayoffRound(s) {
  const winners = s.schedule.filter(g => g.week === s.week && g.playoff).map(g => g.homeScore > g.awayScore ? g.home : g.away);
  if (s.week === 21) {
    const champion = getTeam(s, winners[0]);
    const final = s.schedule.find(g => g.week === 21);
    s.history.unshift({ year: s.year, champion: champion.id, runnerUp: champion.id === final.home ? final.away : final.home, homeScore: final.homeScore, awayScore: final.awayScore,
      userWins: getTeam(s).wins, userLosses: getTeam(s).losses, userOverall: teamRatings(s).overall });
    s.history = s.history.slice(0, 100);
    s.phase = 'offseason';
    news(s, 'CHAMPIONS', `${champion.city} takes the crown.`, `The ${champion.name} are your ${s.year} champions. Contract decisions and the draft are next.`);
    return;
  }
  if (s.week === 18 || s.week === 19) {
    for (const seeds of s.playoffSeeds) {
      const alive = (s.week === 18 ? [...seeds.slice(0, 2), ...winners.filter(id => seeds.includes(id))] : winners.filter(id => seeds.includes(id))).sort((a, b) => seeds.indexOf(a) - seeds.indexOf(b));
      for (let i = 0; i < alive.length / 2; i++) addPlayoff(s, alive[i], alive[alive.length - 1 - i], s.week + 1, s.week === 18 ? 'Divisional' : 'Conference Championship');
    }
  } else addPlayoff(s, winners[0], winners[1], 21, 'League Championship');
  s.week++;
}

export function advanceWeek(s) {
  if (!['regular', 'playoffs'].includes(s.phase)) fail('Finish the offseason before advancing the schedule.');
  const recovering = s.players.filter(p => p.injury > 0);
  const games = s.schedule.filter(g => g.week === s.week && !g.played);
  let userGame = null;
  for (const game of games) {
    simulateGame(s, game);
    if ([game.home, game.away].includes(s.userTeam)) userGame = game;
  }
  // Existing injuries heal on a calendar week, including playoff byes. Injuries
  // sustained in the games above retain their full announced recovery duration.
  for (const p of recovering) p.injury = Math.max(0, p.injury - 1);
  if (userGame) {
    const home = getTeam(s, userGame.home), away = getTeam(s, userGame.away);
    const won = (userGame.home === s.userTeam ? userGame.homeScore > userGame.awayScore : userGame.awayScore > userGame.homeScore);
    news(s, 'FINAL WHISTLE', `${won ? 'Victory' : 'A tough result'} in ${home.city}.`, `${away.abbr} ${userGame.awayScore} · ${home.abbr} ${userGame.homeScore}. ${won ? 'Carry the momentum into next week.' : 'Back to the film room. The next opportunity awaits.'}`);
  }
  if (s.phase === 'playoffs') nextPlayoffRound(s);
  else if (s.week === 17) seedPlayoffs(s);
  else {
    if (s.week === 9) news(s, 'BYE WEEK', 'A chance to reset.', 'The league takes a week off. Injured players move one week closer to returning.');
    s.week++;
  }
  return userGame;
}

function createProspects(s) {
  s.prospects = [];
  for (let i = 0; i < 280; i++) {
    const p = player(s, null, POSITIONS[i % POSITIONS.length], clamp(Math.round(82 - i / 12 + int(s, -7, 7)), 50, 88), true);
    p.estimate = clamp(p.overall + int(s, -7, 7), 45, 95); p.salary = 600; p.bonus = 0;
    s.prospects.push(p);
  }
  s.prospects.sort((a, b) => b.estimate - a.estimate || a.id.localeCompare(b.id));
}
export function scoutPlayer(s, id) {
  const p = s.prospects.find(x => x.id === id);
  if (!p || p.scouted) fail('Choose an unscouted prospect.');
  if (s.scoutingPoints < 1) fail('No scouting reports remaining this season.');
  p.scouted = true; s.scoutingPoints--;
}
function autoFill(s, team) {
  // Computer teams and a short user roster receive minimum-cost replacement players.
  // The user can replace them through the normal market. No existing player is silently cut.
  for (const pos of POSITIONS) {
    let count = roster(s, team.id).filter(p => p.position === pos).length;
    while (count < STARTER_SLOTS[pos] && roster(s, team.id).length < ROSTER_LIMIT) {
      if (capRoom(s, team.id) < 450) break;
      const p = player(s, team.id, pos, int(s, 49, 58)); p.salary = 450; p.bonus = 0; p.years = 1; p.depth = 99;
      s.players.push(p); count++;
    }
  }
  normalizeDepth(s, team.id);
}
export function beginDraft(s) {
  if (s.phase !== 'offseason') fail('The draft opens after the championship.');
  // Leave expiring deals available for extension until the director starts the draft.
  for (const t of s.teams) t.deadCap = 0;
  for (const p of s.players) {
    p.age++; p.injury = 0;
    const change = p.age <= 26 ? int(s, 0, 3) : p.age >= 30 ? -int(s, 1, p.age >= 34 ? 5 : 3) : int(s, -1, 1);
    const prior = p.overall; p.overall = clamp(p.overall + change, 40, p.potential); p.change = p.overall - prior;
    p.years = Math.max(0, p.years - 1);
    if (p.years === 0) { p.teamId = null; p.bonus = 0; }
    if (p.age >= 39 || (p.age >= 35 && random(s) < .3)) {
      if (p.teamId === s.userTeam) news(s, 'RETIREMENT', `${p.name} hangs up the cleats.`, `The ${p.age}-year-old ${p.position} closes the book on his career.`);
      p.retired = true;
    }
  }
  s.players = s.players.filter(p => !p.retired && (p.teamId !== null || p.age < 35));
  s.cap = Math.round(s.cap * 1.04);
  const order = standings(s).map(t => t.id).reverse();
  const champion = s.history[0].champion, runner = s.history[0].runnerUp;
  const draftOrder = [...order.filter(id => id !== champion && id !== runner), runner, champion];
  s.draft = { order: draftOrder, cursor: 0, picks: [], rounds: 7 };
  s.phase = 'draft';
  news(s, 'DRAFT DAY', 'The future is on the clock.', 'Seven rounds. Thirty-two teams. Contract expirations and offseason player development have been processed.');
  autoDraftUntilUser(s);
}
function selectProspect(s, id) {
  const index = s.prospects.findIndex(p => p.id === id);
  if (index < 0) fail('That prospect has already been drafted.');
  const d = s.draft, teamId = d.order[d.cursor % 32], t = getTeam(s, teamId);
  const salary = Math.max(600, Math.round(3500 / (1 + d.cursor / 18)));
  if (roster(s, teamId).length >= ROSTER_LIMIT || capRoom(s, teamId) < salary) return false;
  const p = s.prospects.splice(index, 1)[0];
  Object.assign(p, { teamId, years: 4, salary, bonus: Math.round(salary * .25), depth: 99 });
  s.players.push(p); normalizeDepth(s, teamId);
  d.picks.push({ pick: d.cursor + 1, round: Math.floor(d.cursor / 32) + 1, teamId, playerId: p.id, name: p.name, position: p.position, overall: p.overall });
  d.cursor++;
  if (teamId === s.userTeam) news(s, 'DRAFT PICK', `${t.city} selects ${p.name}.`, `${p.position} · ${p.college} · ${p.overall} OVR. Pick ${d.cursor}, four-year rookie deal.`);
  return true;
}
function passPick(s) { s.draft.picks.push({ pick: s.draft.cursor + 1, round: Math.floor(s.draft.cursor / 32) + 1, teamId: s.draft.order[s.draft.cursor % 32], name: 'Pick passed', position: '—', overall: 0 }); s.draft.cursor++; }
function autoDraftUntilUser(s) {
  const d = s.draft;
  while (d.cursor < d.rounds * 32 && d.order[d.cursor % 32] !== s.userTeam) {
    const id = d.order[d.cursor % 32];
    const current = roster(s, id);
    const needs = Object.fromEntries(POSITIONS.map(pos => [pos, Math.max(0, ROSTER_SLOTS[pos] - current.filter(p => p.position === pos).length) * 2]));
    const candidate = [...s.prospects].sort((a, b) => b.estimate + needs[b.position] - a.estimate - needs[a.position])[0];
    if (!candidate || !selectProspect(s, candidate.id)) passPick(s);
  }
  if (d.cursor >= d.rounds * 32) {
    for (const p of s.prospects) { p.teamId = null; p.years = 0; s.players.push(p); }
    s.prospects = []; s.phase = 'preseason';
    news(s, 'OFFSEASON', 'A new roster. A new opportunity.', 'The draft is complete. Sign free agents, check your depth chart, then open the new season.');
  }
}
export function draftPlayer(s, id) {
  if (s.phase !== 'draft' || s.draft.order[s.draft.cursor % 32] !== s.userTeam) fail('It is not your turn to draft.');
  if (!selectProspect(s, id)) fail('Make roster and salary cap room for this rookie, or pass this pick.');
  autoDraftUntilUser(s);
}
export function skipDraftPick(s) {
  if (s.phase !== 'draft') fail('The draft is not open.');
  passPick(s); autoDraftUntilUser(s);
}
export function startSeason(s) {
  if (s.phase !== 'preseason') fail('Complete the draft before opening the season.');
  if (capRoom(s) < 0) fail('Get under the salary cap before starting the season.');
  for (const t of s.teams) {
    autoFill(s, t);
    if (t.id !== s.userTeam) {
      const pool = s.players.filter(p => p.teamId === null).sort((a, b) => b.overall - a.overall);
      for (const p of pool) {
        if (roster(s, t.id).length >= ROSTER_LIMIT) break;
        const salary = marketSalary(p);
        if (capRoom(s, t.id) >= salary && depthChart(s, t.id, p.position).length < ROSTER_SLOTS[p.position]) Object.assign(p, { teamId: t.id, salary, bonus: Math.round(salary * .2), years: int(s, 1, 3), depth: 99 });
      }
      for (const pos of POSITIONS) depthChart(s, t.id, pos).sort((a, b) => b.overall - a.overall).forEach((p, i) => { p.depth = i; });
    }
    Object.assign(t, emptyRecord(), { revenue: 0, expenses: 0 });
  }
  s.year++; s.week = 1; s.phase = 'regular'; s.trainedWeek = ''; s.playoffSeeds = []; s.scoutingPoints = 8; s.scoutingYear = s.year;
  for (const p of s.players) p.stats = emptyStats();
  // Keep the free-agent population bounded across long careers.
  const bestFreeAgents = s.players.filter(p => p.teamId === null).sort((a, b) => b.overall - a.overall).slice(0, 350);
  s.players = [...s.players.filter(p => p.teamId !== null), ...bestFreeAgents];
  s.schedule = makeSchedule(s); createProspects(s);
  news(s, 'SEASON OPENER', `${s.year}. A clean slate.`, 'The schedule is set. Minimum-cost replacements filled any vacant starting positions where cap space allowed. Review your lineup before kickoff.');
}
