// ===== league.js =====
const PH = { PRE: 0, REG: 1, PO: 2, END: 3, LOTTERY: 4, DRAFT: 5, RESIGN: 6, FA: 7 };
const PH_NAME = ['Preseason', 'Regular Season', 'Playoffs', 'Season Review', 'Draft Lottery', 'Draft', 'Re-sign Players', 'Free Agency'];
const DIFFS = [
  { n: 'Rookie', trade: 0.92, fa: 0.15, boost: 0.015, rev: 1.12 },
  { n: 'Starter', trade: 1.05, fa: 0.0, boost: 0, rev: 1.0 },
  { n: 'All-Star', trade: 1.15, fa: -0.06, boost: -0.008, rev: 0.95 },
  { n: 'Hall of Fame', trade: 1.25, fa: -0.12, boost: -0.016, rev: 0.9 },
];

let PMAP = new Map();
function reindex(S) { PMAP = new Map(); for (const p of S.players) PMAP.set(p.pid, p); for (const p of S.retired) PMAP.set(p.pid, p); }
function P(S, pid) { return PMAP.get(pid); }
function addPlayer(S, p) { S.players.push(p); PMAP.set(p.pid, p); return p; }
function roster(S, tid) { return S.players.filter(p => p.tid === tid); }
function T(S, tid) { return S.teams[tid]; }
function tname(t) { return t.region + ' ' + t.name; }
function payroll(S, tid) {
  let s = 0; for (const p of S.players) if (p.tid === tid) s += p.contract.amt;
  for (const d of S.teams[tid].dead) if (d.exp >= S.season) s += d.amt;
  return s;
}
function payrollNext(S, tid) { // committed for next season
  let s = 0; for (const p of S.players) if (p.tid === tid && p.contract.exp > S.season) s += p.contract.next || p.contract.amt;
  for (const d of S.teams[tid].dead) if (d.exp > S.season) s += d.amt;
  return s;
}
function isUser(S, tid) { return tid === S.user; }

function genStaff(S, role, quality) {
  const nm = genName(0.05);
  const q = quality != null ? quality : U.gauss(60, 12);
  const r = () => Math.round(U.clamp(q + U.gauss(0, 9), 25, 99));
  const st = { id: S.nextSid++, role, fn: nm.fn, ln: nm.ln, age: U.ri(36, 66), exp: S.season + U.ri(1, 4) };
  if (role === 'hc') { st.r = { off: r(), def: r(), dev: r(), mot: r() }; st.pace = U.pick([0, 1, 1, 2]); st.scheme = U.pick(['man', 'man', 'man', 'zone', 'press', 'paint', 'deny']); }
  else if (role === 'asst') st.r = { dev: r(), off: r(), def: r() };
  else if (role === 'trainer') st.r = { med: r(), cond: r() };
  else st.r = { eval: r(), net: r() };
  const avg = U.avg(Object.values(st.r));
  const base = { hc: [800, 6500], asst: [200, 1200], trainer: [150, 900], scout: [120, 700] }[role];
  st.sal = Math.round((base[0] + (base[1] - base[0]) * Math.pow(U.clamp((avg - 30) / 65, 0, 1), 1.6)) / 10) * 10;
  st.wins = 0; st.losses = 0; st.titles = 0;
  return st;
}
function staffName(st) { return st.fn + ' ' + st.ln; }
function staffOvr(st) { return Math.round(U.avg(Object.values(st.r))); }

function makeTeam(S, d, tid) {
  const [abbr, region, name, div, pop, c1, c2] = d;
  const cap = U.ri(17, 21) * 1000 + U.ri(0, 9) * 100;
  const t = {
    tid, abbr, region, name, div, conf: div < 3 ? 0 : 1, pop, c1, c2,
    hype: U.ri(35, 65), fan: U.ri(50, 70),
    arena: {
      name: (Math.random() < 0.6 ? U.pick(CORPS) + ' ' : region + ' ') + U.pick(ARENA_SUFFIX), cap, suites: U.ri(40, 90),
      cond: U.ri(55, 90), built: S.season - U.ri(2, 30), up: { suites: 0, board: 0, conc: 0, prac: 0, med: 0, fan: 0 }, build: null,
    },
    prices: { court: 0, lower: 0, upper: 0, food: 6, drink: 5, merch: 30, parking: 15 },
    cash: Math.round(U.rf(15, 45) * 1000), mkt: 1,
    staff: {}, strat: { off: 'balanced', def: 'man', pace: 1 },
    rot: { order: [], mins: {} }, autoRot: true,
    rec: null, hist: [], fin: null, finHist: [], mle: false, dead: [], debt: null,
  };
  const pf = priceFactor(pop);
  t.prices.court = Math.round(380 * pf / 5) * 5; t.prices.lower = Math.round(62 * pf); t.prices.upper = Math.round(24 * pf);
  t.staff.hc = genStaff(S, 'hc'); t.staff.asst = genStaff(S, 'asst'); t.staff.trainer = genStaff(S, 'trainer'); t.staff.scout = genStaff(S, 'scout');
  t.strat.pace = t.staff.hc.pace; t.strat.def = t.staff.hc.scheme;
  t.rec = newRec();
  return t;
}
function priceFactor(pop) { return 0.78 + 0.12 * Math.log(1 + pop); }
function newRec() { return { w: 0, l: 0, hw: 0, hl: 0, aw: 0, al: 0, cw: 0, cl: 0, dw: 0, dl: 0, pf: 0, pa: 0, str: 0, l10: [] }; }

function newLeague(opts) {
  const S = {
    v: 1, season: 2005, phase: PH.PRE, day: 0, user: opts.userTid, ownerName: opts.ownerName || 'Owner', diff: opts.diff != null ? opts.diff : 1,
    settings: { games: opts.games || 82, injuries: opts.injuries !== false, fantasy: !!opts.fantasy },
    cap: 49500, tax: 61700, minSal: 400, maxSal: 17300, mle: 5000,
    teams: [], players: [], retired: [], sched: [], playoffs: null, picks: [], news: [], inbox: [], radio: [], history: [], records: null, box: {},
    trans: [], fa: null, draft: null, lottery: null, allStar: null, allStarDay: 0, deadlineDay: 0, scout: { pts: 100, max: 100 },
    camp: null, nextPid: 1, nextGid: 1, nextNid: 1, nextSid: 1, nextPick: 1, hof: [], tradeBlock: [], offers: [], promises: [],
    created: Date.now(), saveName: opts.saveName || '', lastRadioDay: 0, gameSpeed: 1,
  };
  S.records = { game: { pts: [], reb: [], ast: [] }, season: { ppg: [], rpg: [], apg: [] }, team: { wins: [] } };
  TEAM_DEFS.forEach((d, i) => S.teams.push(makeTeam(S, d, i)));
  reindex(S);
  // rosters: tiered talent so every team has a star, starters and depth
  const tiers = [[70, 4], [63, 4], [62, 4], [57, 4], [56, 4], [51, 4], [50, 4], [48, 4], [45, 4], [43, 5], [41, 5], [40, 5], [38, 5]];
  const posPlan = ['PG', 'SG', 'SF', 'PF', 'C', 'PG', 'SG', 'SF', 'PF', 'C', null, null, null];
  for (const t of S.teams) {
    const off = U.gauss(0, 1.8);
    const plan = U.shuffle(posPlan.map(x => x || U.pick(POSS)));
    tiers.forEach((tier, i) => {
      let age = Math.round(U.clamp(U.gauss(i < 3 ? 27 : 26.5, 3.8), 19, 37));
      const talent = U.gauss(tier[0] + off, tier[1]) - Math.max(0, 25 - age) * 1.3;
      const p = genPlayer(S, { pos: plan[i], talent, age, tid: t.tid });
      addPlayer(S, p);
    });
  }
  // free agent pool
  for (let i = 0; i < 40; i++) addPlayer(S, genPlayer(S, { talent: U.gauss(41, 6), age: U.ri(22, 35), tid: -1 }));
  for (const p of S.players) {
    p.yrsPro = Math.max(0, p.age - U.ri(19, 22));
    if (p.tid >= 0) {
      p.contract = { amt: Math.round(marketSalary(S, p) * U.rf(0.75, 1.3) / 10) * 10, exp: S.season + U.ri(0, 4) };
      p.contract.amt = U.clamp(p.contract.amt, S.minSal, S.maxSal);
      p.joined = S.season - U.ri(0, Math.min(5, p.yrsPro));
      p.morale = U.ri(55, 80);
      p.draft = { year: S.season - p.yrsPro, rd: 0, pick: 0, tid: -1 };
    } else {
      p.contract = { amt: marketSalary(S, p), exp: S.season };
      p.draft = { year: S.season - p.yrsPro, rd: 0, pick: 0, tid: -1 };
    }
  }
  // pretend draft history for vets
  for (const p of S.players) {
    if (p.yrsPro > 0 && Math.random() < 0.8) { const pick = Math.round(U.clamp(U.gauss(70 - p.ovr * 0.6, 14), 1, 60)); p.draft.rd = pick <= 30 ? 1 : 2; p.draft.pick = pick; p.draft.tid = U.ri(0, 29); }
  }
  // keep payrolls sane
  for (const t of S.teams) {
    let pay = payroll(S, t.tid);
    const ps = roster(S, t.tid);
    if (pay > S.tax * 0.98) { const f = (S.tax * U.rf(0.85, 0.97)) / pay; ps.forEach(p => { p.contract.amt = Math.max(S.minSal, Math.round(p.contract.amt * f / 10) * 10); }); }
    else if (pay < S.cap * 0.82) { const f = (S.cap * U.rf(0.85, 1.0)) / pay; ps.forEach(p => { p.contract.amt = Math.min(S.maxSal, Math.round(p.contract.amt * f / 10) * 10); }); }
    assignNumbers(S, t.tid);
  }
  const ranked = U.sortBy(S.players.filter(p => p.tid >= -1), p => p.ovr);
  S.ovrTarget = U.avg(ranked.slice(0, 60), p => p.ovr);
  S.depTarget = U.avg(ranked.slice(60, 360), p => p.ovr);
  genPicks(S);
  genDraftClass(S, S.season + 1);
  genDraftClass(S, S.season + 2, true);
  for (const t of S.teams) autoRotation(S, t.tid);
  genSchedule(S);
  for (const t of S.teams) initFinances(S, t);
  S.scout = { pts: scoutPoints(S), max: scoutPoints(S) };
  return S;
}

function assignNumbers(S, tid) {
  const used = new Set((S.teams[tid].rafters || []).map(r => r.num));
  for (const p of roster(S, tid)) {
    if (p.num && !used.has(p.num)) { used.add(p.num); continue; }
    let n; let tries = 0;
    do { n = Math.random() < 0.7 ? U.ri(0, 35) : U.ri(36, 55); tries++; } while ((used.has(n) || n === 0 && Math.random() < 0.8) && tries < 50);
    p.num = n; used.add(n);
  }
}

function genPicks(S) {
  for (let y = S.season + 1; y <= S.season + 4; y++) {
    for (const t of S.teams) for (const rd of [1, 2]) {
      if (!S.picks.some(k => k.year === y && k.rd === rd && k.orig === t.tid)) S.picks.push({ id: S.nextPick++, year: y, rd, orig: t.tid, tid: t.tid });
    }
  }
}

function scoutPoints(S) { const sc = S.teams[S.user].staff.scout; return 80 + Math.round(sc.r.net * 0.6); }

function genDraftClass(S, year, partial) {
  if (S.players.some(p => p.tid === -2 && p.dyear === year)) return;
  const q = U.gauss(0, 2.5);
  const n = 64;
  for (let i = 0; i < n; i++) {
    const age = U.wpick([19, 20, 21, 22, 23], a => ({ 19: 18, 20: 24, 21: 26, 22: 24, 23: 8 })[a]);
    const topTier = i < 2 ? 12 : i < 6 ? 8 : i < 14 ? 5 : i < 30 ? 2 : 0;
    const talent = U.gauss(33 + q + topTier - (age - 19) * -0.8, 6.5);
    const p = genPlayer(S, { talent, age, tid: -2, intl: 0.16 });
    p.yrsPro = 0; p.dyear = year; p.contract = { amt: 0, exp: year };
    // upside skews younger
    let g;
    if (age <= 19) g = U.gauss(17, 6); else if (age <= 20) g = U.gauss(14, 6); else if (age <= 21) g = U.gauss(11, 5); else if (age <= 22) g = U.gauss(8, 4.5); else g = U.gauss(6, 4);
    if (Math.random() < 0.06) g += U.rf(6, 14); // late bloomer
    p.pot = U.clamp(Math.round(p.ovr + Math.max(1, g)), p.ovr + 1, 97);
    p.sn = { o: U.gauss(0, 1), p: U.gauss(0, 1) }; p.slvl = 0;
    p.morale = 70; p.joined = year;
    addPlayer(S, p);
  }
}

// ---------- schedule ----------
function genSchedule(S) {
  const G = S.settings.games, n = S.teams.length;
  const games = [];
  const add = (h, a, k = 1) => { for (let i = 0; i < k; i++) games.push({ h, a }); };
  if (G === 82) {
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const a = S.teams[i], b = S.teams[j];
      if (a.div === b.div) { add(i, j, 2); add(j, i, 2); }
      else if (a.conf !== b.conf) { add(i, j); add(j, i); }
    }
    for (const c of [0, 1]) {
      const divs = [0, 1, 2].map(d => U.shuffle(S.teams.filter(t => t.div === c * 3 + d).map(t => t.tid)));
      for (const [x, y] of [[0, 1], [0, 2], [1, 2]]) {
        const A = divs[x], B = divs[y];
        for (let i = 0; i < 5; i++) for (let k = 0; k < 5; k++) {
          const a = A[i], b = B[(i + k) % 5];
          if (k === 0) { add(a, b, 2); add(b, a, 1); }
          else if (k === 1) { add(a, b, 1); add(b, a, 2); }
          else { add(a, b, 2); add(b, a, 2); }
        }
      }
    }
  } else if (G === 58) {
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { add(i, j); add(j, i); }
  } else {
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { if ((i + j) % 2) add(i, j); else add(j, i); }
  }
  const targetDays = G === 82 ? 158 : G === 58 ? 112 : 58;
  const left = new Array(n).fill(0); games.forEach(g => { left[g.h]++; left[g.a]++; });
  const last = new Array(n).fill(-9);
  let pending = U.shuffle(games), day = 1;
  const perDay = games.length / targetDays;
  const out = [];
  while (pending.length) {
    const used = new Set(); let cnt = 0;
    const cap = Math.max(2, Math.round(perDay + U.gauss(0, 1.6)));
    pending.sort((x, y) => (left[y.h] + left[y.a]) - (left[x.h] + left[x.a]) + (Math.random() - 0.5) * 6);
    const rest = [];
    for (const g of pending) {
      const b2b = last[g.h] === day - 1 || last[g.a] === day - 1;
      if (cnt < cap && !used.has(g.h) && !used.has(g.a) && !(b2b && Math.random() < 0.6)) {
        used.add(g.h); used.add(g.a); cnt++; g.day = day; out.push(g); left[g.h]--; left[g.a]--; last[g.h] = day; last[g.a] = day;
      } else rest.push(g);
    }
    pending = rest; day++;
  }
  const totalDays = day - 1;
  S.allStarDay = Math.round(totalDays * 0.56);
  for (const g of out) if (g.day >= S.allStarDay) g.day += 4;
  S.deadlineDay = Math.round(totalDays * 0.68) + 4;
  S.lastDay = totalDays + 4;
  out.sort((a, b) => a.day - b.day);
  S.sched = out.map(g => ({ gid: S.nextGid++, day: g.day, h: g.h, a: g.a, hs: null, as: null, ot: 0 }));
}

function teamGames(S, tid) { return S.sched.filter(g => g.h === tid || g.a === tid); }
function nextGame(S, tid) { return S.sched.find(g => g.hs == null && (g.h === tid || g.a === tid)); }
function gamesOnDay(S, day) { return S.sched.filter(g => g.day === day && g.hs == null); }

function winPct(r) { return r.w + r.l ? r.w / (r.w + r.l) : 0; }
function standings(S, filter) {
  let ts = S.teams.slice();
  if (filter) ts = ts.filter(filter);
  return ts.sort((a, b) => (winPct(b.rec) - winPct(a.rec)) || ((b.rec.w - b.rec.l) - (a.rec.w - a.rec.l)) || ((b.rec.pf - b.rec.pa) - (a.rec.pf - a.rec.pa)));
}
function confSeeds(S, conf) {
  // division winners guaranteed top-3 seeds (2005 format)
  const conf_ = standings(S, t => t.conf === conf);
  const divWinners = [0, 1, 2].map(d => conf_.find(t => t.div === conf * 3 + d));
  const rest = conf_.filter(t => !divWinners.includes(t));
  const top = standings(S, t => divWinners.includes(t));
  return top.concat(rest);
}
function gamesBack(lead, t) { return ((lead.rec.w - t.rec.w) + (t.rec.l - lead.rec.l)) / 2; }

// rotation: balanced starting five then best available
function autoRotation(S, tid) {
  const t = S.teams[tid];
  const ps = roster(S, tid).filter(p => !p.inj || p.inj.games <= 0);
  const hurt = roster(S, tid).filter(p => p.inj && p.inj.games > 0);
  const by = U.sortBy(ps, p => p.ovr + (p.morale - 50) * 0.02);
  const start = [];
  const take = (fn) => { const p = by.find(x => !start.includes(x) && fn(x)); if (p) start.push(p); };
  take(p => p.pos === 'PG'); take(p => p.pos === 'SG' || p.pos === 'PG');
  take(p => p.pos === 'SF' || p.pos === 'SG'); take(p => p.pos === 'PF' || p.pos === 'SF'); take(p => p.pos === 'C' || p.pos === 'PF');
  // if a starter is much worse than the best bench player, swap by best fit
  for (let i = 0; i < start.length; i++) {
    const bench = by.filter(x => !start.includes(x));
    const cand = bench.find(x => Math.abs(POS_IDX[x.pos] - POS_IDX[start[i].pos]) <= 1 && x.ovr >= start[i].ovr + 5);
    if (cand) start[i] = cand;
  }
  while (start.length < 5 && by.length > start.length) take(() => true);
  const order = start.concat(by.filter(x => !start.includes(x))).concat(hurt);
  t.rot.order = order.map(p => p.pid);
  const plan = [35, 34, 33, 32, 31, 22, 19, 15, 11, 8, 0, 0, 0, 0, 0];
  t.rot.mins = {};
  order.forEach((p, i) => { t.rot.mins[p.pid] = (p.inj && p.inj.games > 0) ? 0 : (plan[i] || 0); });
  // stars play more
  const st = order[0]; if (st && st.ovr >= 86 && t.rot.mins[st.pid]) t.rot.mins[st.pid] = 37;
}

function ensureRotation(S, tid) {
  const t = S.teams[tid];
  if (t.autoRot || !isUser(S, tid)) { autoRotation(S, tid); return; }
  const ids = new Set(roster(S, tid).map(p => p.pid));
  t.rot.order = t.rot.order.filter(id => ids.has(id));
  for (const id of ids) if (!t.rot.order.includes(id)) { t.rot.order.push(id); t.rot.mins[id] = 0; }
  t.rot.saved = t.rot.saved || {};
  const isHurt = id => { const p = P(S, id); return p.inj && p.inj.games > 0; };
  // healed players get their old slot and minutes back
  for (const id of Object.keys(t.rot.saved).map(Number)) {
    const sv = t.rot.saved[id];
    if (!ids.has(id)) { delete t.rot.saved[id]; continue; }
    if (isHurt(id)) continue;
    if (sv.to != null && t.rot.mins[sv.to] != null) t.rot.mins[sv.to] = Math.max(0, t.rot.mins[sv.to] - sv.m);
    t.rot.mins[id] = sv.m;
    t.rot.order = t.rot.order.filter(x => x !== id);
    t.rot.order.splice(Math.min(sv.i, t.rot.order.length), 0, id);
    delete t.rot.saved[id];
  }
  const healthy = t.rot.order.filter(id => !isHurt(id));
  if (healthy.length >= 5) {
    const hurt = t.rot.order.filter(id => !healthy.includes(id));
    for (const id of hurt) {
      const m = t.rot.mins[id] || 0;
      if (m > 0) {
        const repl = healthy.find((h, i) => i >= 5 && (t.rot.mins[h] || 0) < 20) || healthy[5];
        if (repl != null) t.rot.mins[repl] = (t.rot.mins[repl] || 0) + m;
        if (!t.rot.saved[id]) t.rot.saved[id] = { i: t.rot.order.indexOf(id), m, to: repl != null ? repl : null };
        t.rot.mins[id] = 0;
      }
    }
    t.rot.order = healthy.concat(hurt);
  }
}
