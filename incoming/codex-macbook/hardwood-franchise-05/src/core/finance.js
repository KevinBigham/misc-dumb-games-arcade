// ===== finance.js — owner mode economics (all money in $ thousands) =====
const UPGRADES = {
  suites: { n: 'Luxury Suites', d: 'Adds 20 suites per level. Corporate money.', cost: [15000, 25000, 40000] },
  board: { n: 'Video Board', d: 'Fan happiness and in-arena ad sales.', cost: [8000, 15000, 25000] },
  conc: { n: 'Concourse & Concessions', d: '+10% concessions and merchandise per level.', cost: [10000, 18000, 30000] },
  prac: { n: 'Practice Facility', d: 'Faster player development. Free agents notice.', cost: [12000, 22000, 35000] },
  med: { n: 'Sports Medicine Center', d: 'Fewer injuries and quicker recoveries.', cost: [8000, 15000, 25000] },
  fan: { n: 'Fan Experience', d: 'A louder building: home-court edge and hype.', cost: [6000, 12000, 20000] },
};
const REF = { court: 380, lower: 62, upper: 24, food: 6, drink: 5, merch: 30, parking: 15, suite: 160 };
const PRICE_KEYS = [['court', 'Courtside', 'per seat'], ['lower', 'Lower Bowl', 'per seat'], ['upper', 'Upper Deck', 'per seat'],
  ['suite', 'Luxury Suite', 'season lease ($K)'], ['food', 'Food', 'avg item'], ['drink', 'Drinks', 'avg item'], ['merch', 'Merchandise', 'avg item'], ['parking', 'Parking', 'per car']];
const MKT = [{ n: 'None', cost: 0 }, { n: 'Local', cost: 1000 }, { n: 'Regional', cost: 2500 }, { n: 'National', cost: 5000 }];

function newLedger() {
  return { rev: { tix: 0, suites: 0, conc: 0, merch: 0, park: 0, media: 0, tv: 0, po: 0, naming: 0, ads: 0 }, exp: { sal: 0, staff: 0, ops: 0, mkt: 0, tax: 0, build: 0, debt: 0 }, att: 0, hg: 0, sell: 0 };
}
function initFinances(S, t) {
  t.fin = newLedger();
  if (t.prices.suite == null) t.prices.suite = Math.round(REF.suite * priceFactor(t.pop) / 5) * 5;
}
function ledgerTotal(o) { return U.sum(Object.values(o)); }
function staffPayroll(t) { return U.sum(Object.values(t.staff), s => s.sal); }

function topStars(S, tid) { const ps = U.sortBy(roster(S, tid), p => p.ovr); return ps.length ? (ps[0].ovr + (ps[1] ? ps[1].ovr : ps[0].ovr)) / 2 : 70; }
function teamWinPct(S, t) { const r = t.rec; if (r.w + r.l >= 5) return winPct(r); const h = t.hist[t.hist.length - 1]; return h ? h.w / Math.max(1, h.w + h.l) : 0.5; }

function infl(S) { return S.cap / 49500; }
function seatMap(t) { const cap = t.arena.cap; const court = Math.round(cap * 0.015); const lower = Math.round(cap * 0.45); return { court, lower, upper: cap - court - lower }; }

function demandFor(S, t, opp, po) {
  const winp = teamWinPct(S, t);
  const starF = 1 + (topStars(S, t.tid) - 82) / 45;
  const oppF = opp ? 1 + (topStars(S, opp.tid) - 84) / 90 : 1;
  let d = 0.6 + 0.3 * (t.hype / 100) + 0.22 * (t.fan / 100) + 0.38 * (winp - 0.5);
  d *= starF * oppF * (0.86 + 0.045 * Math.log(1 + t.pop)) * (0.9 + t.arena.cond / 1000 + t.arena.up.board * 0.02);
  if (po) d *= 1.3 + po * 0.08;
  return U.clamp(d, 0.15, 1.6);
}

// price projection used by both the sim and the Ticket Office preview
function gateProjection(S, t, opp, po, prices) {
  prices = prices || t.prices;
  const pf = priceFactor(t.pop) * infl(S);
  const dem = demandFor(S, t, opp, po);
  const seats = seatMap(t);
  const poMul = po ? 1.5 : 1;
  const el = { court: 0.7, lower: 1.15, upper: 1.45 };
  let att = 0, tix = 0;
  const fill = {};
  for (const k of ['court', 'lower', 'upper']) {
    const ref = REF[k] * pf * poMul;
    const f = U.clamp(dem * Math.pow(ref / Math.max(1, prices[k]), el[k]), 0, 1);
    fill[k] = f; att += seats[k] * f; tix += seats[k] * f * prices[k] * poMul / 1000;
  }
  att = Math.round(att);
  const cu = 1 + t.arena.up.conc * 0.1;
  const buyF = U.clamp(0.9 * Math.pow(REF.food * pf / prices.food, 1.3), 0, 1.6);
  const buyD = U.clamp(1.1 * Math.pow(REF.drink * pf / prices.drink, 1.3), 0, 1.8);
  const conc = att * (buyF * prices.food + buyD * prices.drink) * cu / 1000;
  const starF = 1 + (topStars(S, t.tid) - 82) / 30;
  const merch = (att * 0.12 * U.clamp(Math.pow(REF.merch * pf / prices.merch, 1.6), 0, 2) * prices.merch * cu * Math.max(0.5, starF)) / 1000;
  const cars = att / 2.6 * U.clamp(Math.pow(REF.parking * pf / prices.parking, 1.2), 0, 1);
  const park = cars * prices.parking / 1000;
  const sOcc = U.clamp(dem * Math.pow(REF.suite * pf / Math.max(1, prices.suite), 0.9), 0, 1);
  const suites = t.arena.suites * sOcc * prices.suite / 41;
  // fairness: how prices compare to what fans think is reasonable (1.0 = fair)
  const fair = (prices.lower / (REF.lower * pf) * 0.35 + prices.upper / (REF.upper * pf) * 0.3 + prices.food / (REF.food * pf) * 0.1 + prices.drink / (REF.drink * pf) * 0.1 + prices.parking / (REF.parking * pf) * 0.1 + prices.merch / (REF.merch * pf) * 0.05);
  return { att, fill, tix, conc, merch, park, suites, sOcc, dem, fair, cap: t.arena.cap };
}

function seasonScale(S) { return 82 / S.settings.games; }

function gameFinances(S, g, po) {
  const sc = seasonScale(S);
  const df = DIFFS[S.diff];
  for (const tid of [g.h, g.a]) {
    const t = S.teams[tid];
    if (!t.fin) initFinances(S, t);
    const L = t.fin;
    const net0 = ledgerTotal(L.rev) - ledgerTotal(L.exp);
    const rm = tid === S.user ? df.rev : 1;
    if (!po) {
      L.rev.tv += 30000 * infl(S) / S.settings.games;
      L.rev.media += (3000 + t.pop * 900) * infl(S) * (0.6 + t.hype / 125) / S.settings.games;
      L.exp.sal += payroll(S, tid) / S.settings.games;
      L.exp.staff += staffPayroll(t) / S.settings.games;
      L.exp.mkt += MKT[t.mkt].cost / S.settings.games;
      if (t.debt) L.exp.debt += t.debt.amt / S.settings.games;
    }
    if (tid === g.h) {
      const opp = S.teams[g.a];
      const gp = gateProjection(S, t, opp, po ? (S.playoffs ? S.playoffs.round + 1 : 1) : 0);
      const mult = (po ? 1 : sc) * rm;
      if (po) L.rev.po += (gp.tix + gp.conc + gp.merch + gp.park) * rm;
      else { L.rev.tix += gp.tix * mult; L.rev.conc += gp.conc * mult; L.rev.merch += gp.merch * mult; L.rev.park += gp.park * mult; L.rev.suites += gp.suites * mult; }
      L.rev.ads += t.arena.up.board * 18 * (po ? 1 : sc);
      if (t.arena.naming && !po) L.rev.naming += t.arena.naming.amt / 41 * sc;
      L.exp.ops += (380 + t.arena.cap * 0.008) * infl(S) * (po ? 1 : sc) * (1.1 - t.arena.cond / 500);
      L.att += gp.att; L.hg++; if (gp.att >= t.arena.cap * 0.995) L.sell++;
      // fan mood follows winning, prices and the building
      const winp = teamWinPct(S, t);
      const target = U.clamp(52 + (winp - 0.5) * 70 - (gp.fair - 1) * 45 + t.arena.up.board * 3 + t.arena.up.fan * 2 + (t.arena.cond - 70) / 6, 5, 98);
      t.fan = U.clamp(t.fan + (target - t.fan) * 0.06, 0, 100);
      t.lastGate = gp;
    }
    t.cash += ledgerTotal(L.rev) - ledgerTotal(L.exp) - net0;
  }
}

function hypeAfterGame(S, t, won, margin, po) {
  let d = won ? 0.35 : -0.3;
  if (t.rec.str >= 5) d += 0.2; if (t.rec.str <= -5) d -= 0.25;
  if (po) d *= 3;
  if (won && margin >= 20) d += 0.15;
  const base = 45 + t.mkt * 4 + t.arena.up.fan * 2;
  d += (base - t.hype) * 0.004;
  t.hype = U.clamp(t.hype + d, 0, 100);
}

function closeSeasonBooks(S) {
  for (const t of S.teams) {
    const L = t.fin;
    const pay = payroll(S, t.tid);
    const tax = pay > S.tax ? (pay - S.tax) : 0;
    L.exp.tax += tax;
    t.cash -= tax;
    if (tax > 0) {
      // tax pool shared with non-taxpayers
      t._tax = tax;
    }
  }
  const pool = U.sum(S.teams, t => t._tax || 0);
  const under = S.teams.filter(t => !t._tax);
  for (const t of under) { t.fin.rev.media += pool / Math.max(1, under.length); t.cash += pool / Math.max(1, under.length); }
  for (const t of S.teams) {
    delete t._tax;
    const L = t.fin;
    const rev = ledgerTotal(L.rev), exp = ledgerTotal(L.exp);
    t.finHist.push({ s: S.season, rev: Object.assign({}, L.rev), exp: Object.assign({}, L.exp), profit: rev - exp, att: L.hg ? Math.round(L.att / L.hg) : 0, sell: L.sell, hype: Math.round(t.hype), fan: Math.round(t.fan) });
    if (t.finHist.length > 25) t.finHist.shift();
    t.fin = newLedger();
  }
}

function buyUpgrade(S, t, key) {
  const lvl = t.arena.up[key];
  if (lvl >= 3) return 'Already maxed out.';
  const cost = UPGRADES[key].cost[lvl];
  if (t.cash < cost) return 'Not enough cash on hand.';
  t.cash -= cost; t.fin.exp.build += cost;
  t.arena.up[key]++;
  if (key === 'suites') t.arena.suites += 20;
  if (key === 'fan') t.hype = Math.min(100, t.hype + 3);
  return null;
}
function renovateCost(t) { return Math.round((100 - t.arena.cond) * 420); }
function renovate(S, t) {
  const c = renovateCost(t);
  if (c <= 0) return 'The building is in perfect shape.';
  if (t.cash < c) return 'Not enough cash on hand.';
  t.cash -= c; t.fin.exp.build += c; t.arena.cond = 100;
  return null;
}
function arenaQuote(S, t, cap) {
  const cost = Math.round((180000 + (cap - 17000) * 30) * (S.cap / 49500));
  const pub = U.clamp(0.12 + (t.fan - 50) / 180 + (t.hype - 50) / 300 + Math.log(1 + t.pop) * 0.04, 0, 0.6);
  return { cost, pub, own: Math.round(cost * (1 - pub)) };
}
function startArena(S, t, cap, pub) {
  const q = arenaQuote(S, t, cap);
  const share = Math.round(q.cost * (1 - pub));
  t.arena.build = { cap, cost: q.cost, own: share, left: 2, suites: Math.round(cap / 220) };
  const add = Math.round(share / 15);
  t.debt = t.debt ? { amt: Math.round((t.debt.amt * t.debt.yrs + share) / 15), yrs: 15, total: (t.debt.total || 0) + share } : { amt: add, yrs: 15, total: share };
  return t.arena.build;
}
function finishArenas(S) {
  for (const t of S.teams) {
    const b = t.arena.build;
    if (!b) continue;
    b.left--;
    if (b.left <= 0) {
      const up = t.arena.up;
      t.arena = { name: t.region + ' ' + U.pick(ARENA_SUFFIX), cap: b.cap, suites: b.suites, cond: 100, built: S.season, up: { suites: 1, board: Math.max(1, up.board), conc: Math.max(1, up.conc), prac: up.prac, med: up.med, fan: Math.max(1, up.fan) }, build: null, naming: null };
      t.hype = Math.min(100, t.hype + 15); t.fan = Math.min(100, t.fan + 10);
      addNews(S, { type: 'arena', tids: [t.tid], h: `${tname(t)} open the doors to their new ${t.arena.cap.toLocaleString()}-seat home`, b: `Fans got their first look at the new building tonight. The ${t.name} expect the new revenue streams to change how they compete.`, imp: 3 });
      if (t.tid === S.user) offerNaming(S, t);
    }
  }
}
function offerNaming(S, t) {
  const corp = U.pick(CORPS);
  const amt = Math.round((1500 + t.pop * 380) * (0.7 + t.hype / 100) / 10) * 10;
  const yrs = U.ri(5, 12);
  inbox(S, { from: corp + ' (Marketing Dept.)', subj: 'Arena naming rights proposal', body: `${corp} would like to put its name on your building: ${U.money(amt)} per season for ${yrs} seasons. The arena would become "${corp} ${t.arena.name.split(' ').pop()}".`, act: { kind: 'naming', corp, amt, yrs } });
}
function seasonMaintenance(S) {
  for (const t of S.teams) {
    t.arena.cond = U.clamp(t.arena.cond - U.rf(3, 6), 20, 100);
    if (t.debt) { t.debt.yrs--; if (t.debt.yrs <= 0) t.debt = null; }
    if (t.arena.naming) { t.arena.naming.yrs--; if (t.arena.naming.yrs <= 0) { t.arena.naming = null; if (t.tid === S.user) offerNaming(S, t); } }
    if (t.tid !== S.user) aiOwner(S, t);
  }
}
function aiOwner(S, t) {
  // AI owners keep the lights on: renovate tired buildings, buy a cheap upgrade when flush
  if (t.arena.cond < 55 && t.cash > renovateCost(t) * 1.5) renovate(S, t);
  if (t.cash > 40000 && Math.random() < 0.5) {
    const k = U.pick(Object.keys(UPGRADES));
    if (t.arena.up[k] < 3) buyUpgrade(S, t, k);
  }
  const pf = priceFactor(t.pop) * infl(S);
  const wp = teamWinPct(S, t);
  const m = 0.9 + wp * 0.25 + (t.hype - 50) / 300;
  t.prices.court = Math.round(REF.court * pf * m / 5) * 5; t.prices.lower = Math.round(REF.lower * pf * m); t.prices.upper = Math.round(REF.upper * pf * m);
  t.prices.suite = Math.round(REF.suite * pf * m / 5) * 5;
  t.mkt = t.cash > 30000 ? 2 : t.cash > 5000 ? 1 : 0;
}
