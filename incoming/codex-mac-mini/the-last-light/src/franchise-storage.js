import { FRANCHISE_KEY, FRANCHISE_VERSION, POSITIONS } from './contracts.js';
import { TEAM_DATA } from './sim/franchise-data.js';

const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const integer = (x, min, max) => Number.isSafeInteger(x) && x >= min && x <= max;
const string = (x, max = 160) => typeof x === 'string' && x.length > 0 && x.length <= max;
const check = (condition, message) => { if (!condition) throw new Error(`Invalid save: ${message}.`); };
const teamId = x => integer(x, 0, 31);

/** A version gate, followed by structural and reference validation. Never guess
 * at a future schema. Add explicit migrations here when v2 is introduced. */
export function validateFranchise(s) {
  check(object(s), 'expected a franchise');
  check(s.version === FRANCHISE_VERSION, `unsupported version ${s.version ?? 'missing'}`);
  for (const key of ['seed', 'rngState']) check(integer(s[key], 0, 0xffffffff), key);
  check(integer(s.revision, 0, 1e9) && teamId(s.userTeam), 'identity');
  check(integer(s.year, 2005, 9999) && integer(s.week, 1, 21), 'calendar');
  check(['regular', 'playoffs', 'offseason', 'draft', 'preseason'].includes(s.phase), 'phase');
  check(integer(s.cap, 1, 1e12) && integer(s.nextId, 1, 1e9) && integer(s.nextNews, 1, 1e9), 'counters');
  check(typeof s.trainedWeek === 'string' && s.trainedWeek.length < 30 && integer(s.scoutingPoints, 0, 8) && integer(s.scoutingYear, 2005, 9999), 'training and scouting');
  check(Array.isArray(s.teams) && s.teams.length === 32, 'teams');
  const ids = new Set();
  for (const t of s.teams) {
    check(object(t) && teamId(t.id) && !ids.has(t.id), 'team id'); ids.add(t.id);
    const [city, name, abbr, conference, division, color] = TEAM_DATA[t.id];
    check(t.city === city && t.name === name && t.abbr === abbr && t.conference === conference && t.division === division && t.color === color, 'team identity');
    for (const key of ['wins', 'losses', 'ties']) check(integer(t[key], 0, 16), 'record');
    check(t.wins + t.losses + t.ties <= 16, 'record total');
    for (const key of ['pf', 'pa', 'deadCap', 'revenue', 'expenses']) check(integer(t[key], 0, 1e12), key);
    check(integer(t.cash, -1e12, 1e12) && integer(t.streak, -16, 16), 'finances and streak');
    check(integer(t.ticket, 35, 150) && integer(t.fans, 0, 99) && integer(t.stadium, 1, 5) && integer(t.coach, 1, 99), 'ownership');
    check(['balanced', 'pass', 'run'].includes(t.offense) && ['balanced', 'blitz', 'coverage'].includes(t.defense) && ['balanced', 'offense', 'defense'].includes(t.training), 'strategy');
  }
  check(Array.isArray(s.players) && s.players.length <= 4000 && Array.isArray(s.prospects) && s.prospects.length <= 280, 'player lists');
  const playerIds = new Set(), counts = Array(32).fill(0);
  for (const p of [...s.players, ...s.prospects]) {
    check(object(p) && /^p\d+$/.test(p.id) && !playerIds.has(p.id) && Number(p.id.slice(1)) < s.nextId, 'player id'); playerIds.add(p.id);
    check(string(p.name, 80) && string(p.college, 80) && POSITIONS.includes(p.position) && (p.teamId === null || teamId(p.teamId)), 'player identity');
    check(integer(p.overall, 40, 99) && integer(p.potential, p.overall, 99) && integer(p.age, 20, 60) && integer(p.number, 1, 99), 'player ratings');
    check(integer(p.morale, 0, 99) && integer(p.injury, 0, 30) && integer(p.years, 0, 5) && integer(p.depth, 0, 99) && integer(p.change, -99, 99), 'player status');
    check(integer(p.salary, 0, 1e10) && integer(p.bonus, 0, 1e10) && typeof p.scouted === 'boolean', 'contract');
    check(object(p.stats), 'player statistics');
    for (const key of ['games', 'passYards', 'rushYards', 'receivingYards', 'touchdowns', 'tackles', 'sacks']) check(integer(p.stats[key], 0, 1e6), `stat ${key}`);
    if (p.teamId !== null) counts[p.teamId]++;
  }
  check(counts.every(n => n <= 53), 'roster size');
  for (const p of s.prospects) check(p.teamId === null && integer(p.estimate, 40, 99), 'prospect');
  check(Array.isArray(s.schedule) && s.schedule.length >= 256 && s.schedule.length <= 267, 'schedule');
  const games = new Set(), appearances = new Set();
  for (const g of s.schedule) {
    check(object(g) && string(g.id, 40) && /^\d{4}-[gp]\d+(?:-\d+)?$/.test(g.id) && !games.has(g.id), 'game id'); games.add(g.id);
    check(teamId(g.home) && teamId(g.away) && g.home !== g.away && integer(g.week, 1, 21) && typeof g.played === 'boolean' && typeof g.playoff === 'boolean', 'game');
    for (const id of [g.home, g.away]) { const key = `${g.week}-${id}`; check(!appearances.has(key), 'duplicate team game'); appearances.add(key); }
    if (g.playoff) check(string(g.round, 60), 'playoff round');
    if (g.played) {
      check(integer(g.homeScore, 0, 200) && integer(g.awayScore, 0, 200) && g.homeScore !== g.awayScore && integer(g.attendance, 0, 100000), 'result');
      check(Array.isArray(g.boxes) && g.boxes.length === 2 && Array.isArray(g.drives) && g.drives.length <= 30, 'box score');
      for (let i = 0; i < 2; i++) {
        const b = g.boxes[i]; check(object(b) && b.teamId === (i ? g.away : g.home) && b.score === (i ? g.awayScore : g.homeScore), 'box team');
        for (const key of ['passYards', 'rushYards', 'turnovers', 'touchdowns', 'drives']) check(integer(b[key], 0, 2000), 'box statistics');
        check(Array.isArray(b.quarters) && b.quarters.length >= 4 && b.quarters.length <= 5 && b.quarters.every(n => integer(n, 0, 100)) && b.quarters.reduce((a, n) => a + n, 0) === b.score, 'quarter scores');
      }
      for (const d of g.drives) check(object(d) && [g.home, g.away].includes(d.teamId) && integer(d.quarter, 1, 5) && string(d.result, 40) && integer(d.yards, 0, 100) && integer(d.homeScore, 0, 200) && integer(d.awayScore, 0, 200), 'drive');
    }
  }
  check(Array.isArray(s.news) && s.news.length <= 60 && Array.isArray(s.history) && s.history.length <= 100, 'news and history');
  for (const n of s.news) check(object(n) && integer(n.id, 1, s.nextNews - 1) && integer(n.year, 2005, s.year) && integer(n.week, 1, 21) && string(n.category, 80) && string(n.title, 200) && string(n.body, 1000), 'news item');
  for (const h of s.history) check(object(h) && integer(h.year, 2005, s.year) && teamId(h.champion) && teamId(h.runnerUp) && integer(h.homeScore, 0, 200) && integer(h.awayScore, 0, 200) && integer(h.userWins, 0, 16) && integer(h.userLosses, 0, 16) && integer(h.userOverall, 40, 99), 'history');
  check(Array.isArray(s.playoffSeeds) && [0, 2].includes(s.playoffSeeds.length), 'playoff seeds');
  for (const seeds of s.playoffSeeds) check(Array.isArray(seeds) && seeds.length === 6 && seeds.every(teamId) && new Set(seeds).size === 6, 'conference seeds');
  if (s.draft !== null) {
    const d = s.draft;
    check(object(d) && Array.isArray(d.order) && d.order.length === 32 && d.order.every(teamId) && new Set(d.order).size === 32 && d.rounds === 7 && integer(d.cursor, 0, 224) && Array.isArray(d.picks) && d.picks.length === d.cursor, 'draft');
    for (const p of d.picks) check(object(p) && integer(p.pick, 1, 224) && integer(p.round, 1, 7) && teamId(p.teamId) && string(p.name, 80) && string(p.position, 5) && integer(p.overall, 0, 99), 'draft pick');
  }
  if (s.phase === 'draft') check(s.draft !== null && s.draft.cursor < 224 && s.draft.order[s.draft.cursor % 32] === s.userTeam, 'draft turn');
  if (s.phase === 'regular') check(s.week <= 17, 'regular-season week');
  if (s.phase === 'playoffs') check(s.week >= 18 && s.playoffSeeds.length === 2, 'playoff week');
  if (['offseason', 'draft', 'preseason'].includes(s.phase)) check(s.history.length > 0 && s.history[0].year === s.year, 'offseason history');
  return s;
}

export function parseFranchise(raw) {
  if (typeof raw !== 'string' || raw.length > 8_000_000) throw new Error('Save file must be smaller than 8 MB.');
  return validateFranchise(JSON.parse(raw));
}
export function createFranchiseStorage(backend) {
  let writable = true, error = '', observed = null;
  try { backend ??= globalThis.localStorage; if (!backend) throw new Error(); observed = backend.getItem(FRANCHISE_KEY); }
  catch { writable = false; error = 'Browser storage is unavailable. Play in this tab and export your save to keep it.'; }
  const protect = reason => { writable = false; error = reason; };
  if (observed !== null) { try { parseFranchise(observed); } catch (e) { protect(`${e.message} The stored save is protected and will not be overwritten. This session is temporary.`); } }
  return {
    load() { if (!writable || observed === null) return null; return parseFranchise(observed); },
    save(s) {
      if (!writable) return false;
      try {
        validateFranchise(s);
        if (backend.getItem(FRANCHISE_KEY) !== observed) { protect('Another tab changed this franchise. Reload to load its progress. Your stored save has not been overwritten.'); return false; }
        const encoded = JSON.stringify(s);
        backend.setItem(FRANCHISE_KEY, encoded); observed = encoded; return true;
      } catch (e) { protect(`Autosave failed: ${e.message} Export your save before closing this tab.`); return false; }
    },
    get writable() { return writable; },
    get error() { return error; },
  };
}
