// ===== transactions.js — contracts, free agency, draft, trades, AI roster moves =====
const ROSTER_MAX = 15, ROSTER_MIN = 13;
function offseason(S) { return S.phase >= PH.END; }
function firstSeason(S) { return offseason(S) ? S.season + 1 : S.season; }
function teamPay(S, tid) { return offseason(S) ? payrollNext(S, tid) : payroll(S, tid); }
function rosterCount(S, tid) { return offseason(S) ? S.players.filter(p => p.tid === tid && p.contract.exp > S.season).length : roster(S, tid).length; }
function capSpace(S, tid) { return S.cap - teamPay(S, tid); }
function rosterMax(S) { return offseason(S) ? 17 : ROSTER_MAX; }

function logTrans(S, type, tids, text) { S.trans.unshift({ s: S.season, d: S.day, ph: S.phase, type, tids, text }); if (S.trans.length > 400) S.trans.length = 400; }

// can team sign a free agent at this salary? returns null or reason
function signBlock(S, tid, amt) {
  if (rosterCount(S, tid) >= rosterMax(S)) return `Roster is full (${rosterMax(S)} max).`;
  const room = capSpace(S, tid);
  if (amt <= room) return null;
  if (amt <= S.minSal * 1.6) return null; // minimum-level deals always allowed
  if (!S.teams[tid].mle && amt <= S.mle) return null;
  return `Not enough cap room (${U.money(Math.max(0, room))}). Over the cap you can offer up to the mid-level exception (${U.money(S.mle)}) once, or a minimum deal.`;
}
function usesMLE(S, tid, amt) { return amt > capSpace(S, tid) && amt > S.minSal * 1.6 && amt <= S.mle; }

function signPlayer(S, p, tid, amt, yrs, how) {
  const t = S.teams[tid];
  if (how !== 'resign' && usesMLE(S, tid, amt)) t.mle = true;
  const fromTid = p.tid;
  p.tid = tid;
  p.contract = { amt: Math.round(amt / 10) * 10, exp: firstSeason(S) + yrs - 1 };
  if (fromTid !== tid) { p.joined = S.season; p.num = 0; assignNumbers(S, tid); }
  p.morale = U.clamp(p.morale + 10, 0, 100);
  p.neg = 0; p.fa = null; p.noResign = false;
  delete p.ask;
  logTrans(S, how || 'sign', [tid], `${t.abbr} ${how === 'resign' ? 're-signed' : 'signed'} ${pname(p)} (${p.pos}, ${p.ovr}) — ${yrs} yr / ${U.money(amt)}`);
  if (tid === S.user || p.ovr >= 80) addNews(S, { type: 'sign', tids: [tid], pids: [p.pid], h: `${tname(t)} ${how === 'resign' ? 'bring back' : 'sign'} ${pname(p)}`, b: `${yrs} year${yrs > 1 ? 's' : ''}, ${U.money(amt)} per season.`, imp: p.ovr >= 85 ? 3 : 2, local: tid === S.user });
  if (!S.teams[tid].autoRot && tid === S.user) ensureRotation(S, tid);
  return p;
}
function releasePlayer(S, p, why) {
  const t = S.teams[p.tid];
  const ng = p.contract.ng || p.contract.amt <= S.minSal * 1.05;
  const first = firstSeason(S);
  if (!ng && p.contract.exp >= first) t.dead.push({ pid: p.pid, n: pname(p), amt: p.contract.amt, exp: p.contract.exp });
  logTrans(S, 'release', [t.tid], `${t.abbr} released ${pname(p)}${ng ? '' : ' (' + U.money(p.contract.amt) + ' dead money through ' + U.seasonLabel(p.contract.exp) + ')'}`);
  p.tid = -1; p.morale = Math.max(30, p.morale - 10);
  p.contract = { amt: Math.round(marketSalary(S, p) * 0.9), exp: S.season };
  S.tradeBlock = S.tradeBlock.filter(x => x !== p.pid);
  if (t.tid === S.user) ensureRotation(S, t.tid);
}

// ---------- re-signing ----------
function contractAsk(S, p, tid) {
  let amt = marketSalary(S, p);
  const mood = p.morale;
  let mult = 1;
  if (tid >= 0 && tid === p.tid) {
    if (mood < 40) mult += 0.12; if (mood > 75) mult -= 0.05;
    if (p.pers === 'loyal') mult -= 0.1;
    if (p.pers === 'winner' && teamWinPct(S, S.teams[tid]) < 0.45) mult += 0.1;
  }
  if (p.pers === 'mercenary') mult += 0.08;
  amt = Math.round(U.clamp(amt * mult, S.minSal, S.maxSal) / 10) * 10;
  return { amt, yrs: p.askYrs || (p.askYrs = askYears(p)) };
}
function resignStatus(S, p) {
  if (p.noResign) return 'refuses';
  if (!S.teams[p.tid]) return 'testing';
  if (p.morale < 22 && p.pers !== 'loyal') return 'refuses';
  if (p.pers === 'winner' && teamWinPct(S, S.teams[p.tid]) < 0.4 && p.morale < 55) return 'testing';
  if (p.morale < 40) return 'testing';
  return 'willing';
}
function negotiate(S, p, amt, yrs) {
  if (!p || p.tid !== S.user) return { ok: false, msg: 'He is not under contract with you.' };
  const st = resignStatus(S, p);
  if (st === 'refuses') return { ok: false, msg: `${pname(p)} won't negotiate. He's headed to free agency.` };
  const ask = contractAsk(S, p, p.tid);
  let leeway = 0.03 + (p.morale - 50) / 600 + (p.pers === 'loyal' ? 0.05 : 0) - (st === 'testing' ? 0.04 : 0);
  const yrPen = Math.abs(yrs - ask.yrs) * 0.04;
  const need = ask.amt * (1 - leeway + yrPen);
  if (amt >= need) {
    if (!offseason(S)) {
      // extension: this season's salary stands, the new deal starts next season
      p.contract.exp = S.season + yrs; p.contract.next = Math.round(amt / 10) * 10; p.neg = 0; p.morale = U.clamp(p.morale + 10, 0, 100);
      logTrans(S, 'resign', [p.tid], `${S.teams[p.tid].abbr} extended ${pname(p)} — ${yrs} yr / ${U.money(amt)} starting ${U.seasonLabel(S.season + 1)}`);
      addNews(S, { type: 'sign', tids: [p.tid], pids: [p.pid], h: `${tname(S.teams[p.tid])} extend ${pname(p)}`, b: `${yrs} more year${yrs > 1 ? 's' : ''} at ${U.money(amt)} per season, starting next season.`, imp: p.ovr >= 85 ? 3 : 2, local: true });
    } else {
      p.contract.exp = S.season;
      signPlayer(S, p, p.tid, amt, yrs, 'resign');
    }
    return { ok: true, msg: `${pname(p)} agrees to ${yrs} year${yrs > 1 ? 's' : ''} at ${U.money(amt)}.` };
  }
  p.neg = (p.neg || 0) + 1;
  p.morale = Math.max(0, p.morale - (p.pers === 'diva' || p.pers === 'mercenary' ? 5 : 3));
  if (p.neg >= 3) { p.noResign = true; return { ok: false, msg: `${pname(p)} is insulted and breaks off talks.` }; }
  const close = amt / need;
  return { ok: false, msg: close > 0.93 ? `Close. ${pname(p)}'s agent says you're almost there.` : close > 0.8 ? `${pname(p)}'s camp wants significantly more.` : `${pname(p)}'s agent laughs and hangs up.` };
}
// in-season extension for contract-year players
function canExtend(S, p) { return p.tid === S.user && p.contract.exp === S.season && !p.contract.next && (S.phase === PH.REG || S.phase === PH.PRE); }

function aiResign(S) {
  for (const t of S.teams) {
    if (t.tid === S.user) continue;
    const exp = roster(S, t.tid).filter(p => p.contract.exp <= S.season);
    const ps = U.sortBy(exp, p => playerWorth(p));
    for (const p of ps) {
      if (p.noResign || resignStatus(S, p) === 'refuses') continue;
      const ask = contractAsk(S, p, t.tid);
      const pay = payrollNext(S, t.tid);
      const want = playerWorth(p) >= 70 || (p.age <= 25 && p.pot >= 75);
      const afford = pay + ask.amt <= S.tax * (playerWorth(p) >= 82 ? 1.12 : 0.98);
      const room = S.players.filter(x => x.tid === t.tid && x.contract.exp > S.season).length < 15;
      if (want && afford && room && Math.random() < 0.85) { p.contract.exp = S.season; signPlayer(S, p, t.tid, ask.amt, ask.yrs, 'resign'); }
    }
  }
}

// ---------- free agency ----------
function toFreeAgency(S) {
  // everyone whose deal is up becomes a free agent
  for (const p of S.players) {
    if (p.tid >= 0 && p.contract.exp <= S.season) {
      const t = S.teams[p.tid];
      p.prevTid = p.tid;
      if (p.ovr >= 78 || p.prevTid === S.user) logTrans(S, 'fa', [p.tid], `${pname(p)} hits free agency (left ${t.abbr})`);
      p.tid = -1;
    }
  }
  for (const p of S.players.filter(x => x.tid === -1)) {
    const a = contractAsk(S, p, -1);
    p.ask = { amt: a.amt, yrs: a.yrs, base: a.amt };
    p.fa = { offers: [] };
  }
}
function faScore(S, p, tid, amt, yrs) {
  const t = S.teams[tid];
  const ask = p.ask || contractAsk(S, p, -1);
  let money = amt / Math.max(S.minSal, ask.amt);
  money -= Math.abs(yrs - ask.yrs) * 0.035;
  if (p.age >= 30 && yrs > ask.yrs) money += 0.04 * (yrs - ask.yrs);
  const wp = teamWinPct(S, t);
  const ranks = U.sortBy(roster(S, tid), x => x.ovr);
  const wouldRank = ranks.filter(x => x.ovr > p.ovr).length;
  let fit = (wp - 0.5) * (p.pers === 'winner' ? 0.4 : 0.15) + Math.log(1 + t.pop) * 0.012 + t.arena.up.prac * 0.015 + (t.hype - 50) / 600;
  fit += wouldRank < 5 ? 0.06 : wouldRank < 8 ? 0.02 : -0.05 * (p.pers === 'diva' ? 2 : 1);
  if (p.prevTid === tid) fit += p.pers === 'loyal' ? 0.12 : 0.03;
  if (tid === S.user) fit += DIFFS[S.diff].fa;
  const w = p.pers === 'mercenary' ? 1.35 : 1;
  return money * w + fit - (w - 1);
}
function interestLabel(v) { return v >= 1.08 ? 'Very High' : v >= 1.0 ? 'High' : v >= 0.92 ? 'Medium' : v >= 0.84 ? 'Low' : 'Very Low'; }

function startFA(S) {
  S.fa = { day: 1, days: 10 };
  for (const t of S.teams) t.mle = false;
}
function userOffer(S, p, amt, yrs) {
  const why = signBlock(S, S.user, amt);
  if (why) return why;
  if (amt < (p.ask ? p.ask.amt * 0.5 : 0)) return `That's not a serious offer.`;
  p.fa = p.fa || { offers: [] };
  p.fa.offers = p.fa.offers.filter(o => o.tid !== S.user);
  p.fa.offers.push({ tid: S.user, amt, yrs, day: S.fa ? S.fa.day : 0 });
  return null;
}
function aiFAOffers(S, early) {
  const fas = U.sortBy(S.players.filter(p => p.tid === -1 && p.ask), p => playerWorth(p));
  for (const t of U.shuffle(S.teams.slice())) {
    if (t.tid === S.user) continue;
    const count = rosterCount(S, t.tid);
    if (count >= 15) continue;
    const outstanding = fas.filter(p => p.fa && p.fa.offers.some(o => o.tid === t.tid)).length;
    if (outstanding >= (count < 12 ? 3 : 2)) continue;
    const room = capSpace(S, t.tid);
    const ranks = U.sortBy(roster(S, t.tid).filter(p => !offseason(S) || p.contract.exp > S.season), p => p.ovr);
    const eighth = ranks[7] ? ranks[7].ovr : 60;
    for (const p of fas) {
      if (p.fa.offers.some(o => o.tid === t.tid)) continue;
      if (p.ovr < eighth - 2 && count >= 12) continue;
      const mode = teamMode(S, t.tid);
      let amt = p.ask.amt * (mode === 'rebuild' && room > p.ask.amt * 1.3 ? U.rf(1.0, 1.18) : U.rf(0.88, 1.06));
      if (amt > room) {
        const day = S.fa ? S.fa.day : 10;
        if (!t.mle && (p.ask.amt <= S.mle * 1.15 || (day >= 3 && playerWorth(p) >= 70))) amt = Math.min(amt, S.mle);
        else if (count < 13 && p.ask.amt <= S.minSal * 1.6) amt = Math.min(amt, S.minSal * 1.5);
        else continue;
      }
      if (payrollNext(S, t.tid) + amt > S.tax * 1.05 && playerWorth(p) < 82) continue;
      if (signBlock(S, t.tid, amt)) continue;
      p.fa.offers.push({ tid: t.tid, amt: Math.round(amt / 10) * 10, yrs: U.clamp(p.ask.yrs + U.ri(-1, 1), 1, 5), day: S.fa ? S.fa.day : 0 });
      break;
    }
  }
}
function faDecisions(S, finalDay) {
  const day = S.fa ? S.fa.day : 10;
  const signed = [];
  for (const p of U.sortBy(S.players.filter(x => x.tid === -1 && x.fa && x.fa.offers.length), x => playerWorth(x))) {
    // drop offers that are no longer legal
    p.fa.offers = p.fa.offers.filter(o => !signBlock(S, o.tid, o.amt) || (o.tid === S.user && false));
    if (!p.fa.offers.length) continue;
    const decideP = finalDay ? 1 : U.clamp(0.22 + day * 0.11 + (playerWorth(p) < 70 ? 0.2 : 0), 0, 1);
    if (Math.random() > decideP) continue;
    let best = null, bv = -9;
    for (const o of p.fa.offers) { const v = faScore(S, p, o.tid, o.amt, o.yrs) + U.gauss(0, 0.03); if (v > bv) { bv = v; best = o; } }
    const thresh = 0.97 - day * 0.025;
    if (bv >= thresh || finalDay) {
      const lost = p.fa.offers.filter(o => o.tid === S.user && o !== best).length;
      signPlayer(S, p, best.tid, best.amt, best.yrs, 'sign');
      signed.push(p);
      if (lost) inbox(S, { from: 'Front Office', subj: `${pname(p)} signs elsewhere`, body: `${pname(p)} chose ${tname(S.teams[best.tid])} (${best.yrs} yr / ${U.money(best.amt)}) over your offer.` });
      if (best.tid === S.user) inbox(S, { from: 'Front Office', subj: `${pname(p)} accepts your offer!`, body: `${pname(p)} signed: ${best.yrs} yr / ${U.money(best.amt)}.` });
    }
  }
  return signed;
}
function faAdvanceDay(S) {
  aiFAOffers(S);
  const signed = faDecisions(S, false);
  for (const p of S.players.filter(x => x.tid === -1 && x.ask)) p.ask.amt = Math.max(S.minSal, Math.round(p.ask.amt * 0.96 / 10) * 10);
  S.fa.day++;
  return signed;
}
function endFA(S) {
  aiFAOffers(S); faDecisions(S, true);
  for (const t of S.teams) if (t.tid !== S.user) aiFillRoster(S, t.tid);
  for (const p of S.players.filter(x => x.tid === -1)) { p.fa = null; }
  S.fa = null;
  radioShow(S, 'fa');
}
// instant decision for in-season signings
function signNow(S, p, amt, yrs) {
  const why = signBlock(S, S.user, amt);
  if (why) return { ok: false, msg: why };
  if (!p.ask) { const a = contractAsk(S, p, -1); p.ask = { amt: a.amt, yrs: a.yrs, base: a.amt }; }
  const v = faScore(S, p, S.user, amt, yrs);
  if (v >= 0.95) { signPlayer(S, p, S.user, amt, yrs, 'sign'); return { ok: true, msg: `${pname(p)} signs with the ${S.teams[S.user].name}!` }; }
  return { ok: false, msg: `${pname(p)} turned it down. Interest: ${interestLabel(v)}.` };
}

// ---------- AI roster upkeep ----------
function aiFillRoster(S, tid) {
  let n = rosterCount(S, tid);
  const healthy = roster(S, tid).filter(p => !p.inj || p.inj.games <= 0).length;
  let need = Math.max(ROSTER_MIN - n, offseason(S) ? 0 : 9 - healthy);
  while (need > 0) {
    const pool = U.sortBy(S.players.filter(p => p.tid === -1), p => playerWorth(p) + U.rf(0, 3));
    const p = pool.find(x => !signBlock(S, tid, S.minSal));
    if (!p) break;
    const ask = p.ask ? p.ask.amt : marketSalary(S, p);
    const room = Math.max(S.minSal * 1.5, capSpace(S, tid), S.teams[tid].mle ? 0 : S.mle);
    const amt = Math.max(S.minSal, Math.min(ask, room));
    const big = amt > S.minSal * 1.6;
    signPlayer(S, p, tid, Math.round(amt), big ? U.ri(2, 3) : 1, 'sign');
    if (!big) p.contract.ng = true;
    need--;
  }
}
function aiTrimRoster(S, tid) {
  const max = rosterMax(S);
  let ps = offseason(S) ? S.players.filter(p => p.tid === tid && p.contract.exp > S.season) : roster(S, tid);
  while (ps.length > max) {
    const cut = U.sortBy(ps, p => -(playerWorth(p) + (p.contract.ng ? -4 : 0) + p.contract.amt / 2500))[0];
    releasePlayer(S, cut);
    ps = ps.filter(p => p !== cut);
  }
}

// ---------- draft ----------
function rookieScale(S, pick) {
  if (pick > 30) return S.minSal;
  return Math.round((3900 - (pick - 1) * 107) * S.cap / 49500 / 10) * 10;
}
function lotteryTeams(S) {
  const po = new Set(S.playoffs ? S.playoffs.seeds.flat() : []);
  return standings(S).filter(t => !po.has(t.tid)).reverse(); // worst first
}
const LOTTO_ODDS = [250, 199, 156, 119, 88, 63, 53, 43, 28, 17, 11, 8, 7, 6];
function runLottery(S) {
  const lt = lotteryTeams(S);
  const pool = lt.map((t, i) => ({ tid: t.tid, w: LOTTO_ODDS[i] || 5, seed: i + 1 }));
  const winners = [];
  for (let k = 0; k < 3; k++) {
    const rem = pool.filter(x => !winners.includes(x));
    winners.push(U.wpick(rem, x => x.w));
  }
  const order = winners.concat(pool.filter(x => !winners.includes(x)));
  const year = S.season + 1;
  const poTeams = standings(S).filter(t => !lt.includes(t)).reverse();
  const r1 = order.map(x => x.tid).concat(poTeams.map(t => t.tid));
  const r2 = standings(S).reverse().map(t => t.tid);
  const picks = [];
  r1.forEach((tid, i) => { const k = S.picks.find(x => x.year === year && x.rd === 1 && x.orig === tid); picks.push({ pick: i + 1, rd: 1, orig: tid, tid: k ? k.tid : tid }); });
  r2.forEach((tid, i) => { const k = S.picks.find(x => x.year === year && x.rd === 2 && x.orig === tid); picks.push({ pick: 31 + i, rd: 2, orig: tid, tid: k ? k.tid : tid }); });
  S.lottery = { year, results: order.map((x, i) => ({ tid: x.tid, seed: x.seed, pick: i + 1, odds: (x.w / 10).toFixed(1) })) };
  S.draft = { year, picks, cur: 0, done: false };
  const jump = order.slice(0, 3).filter((x, i) => x.seed > i + 1);
  const w = S.teams[order[0].tid];
  addNews(S, { type: 'draft', tids: [w.tid], h: `${tname(w)} win the draft lottery!`, b: `${w.name} will pick first in the ${year} Draft${order[0].seed > 1 ? ', jumping from the No. ' + order[0].seed + ' slot' : ''}.${jump.length > 1 ? ' Lottery luck was everywhere.' : ''}`, imp: 4 });
  return S.lottery;
}
function prospects(S, year) { return S.players.filter(p => p.tid === -2 && p.dyear === (year || (S.draft ? S.draft.year : S.season + 1))); }
function scoutSd(S, lvl) { const sc = S.teams[S.user].staff.scout.r.eval; const f = 1.25 - sc / 140; return lvl >= 2 ? [0, 1.5 * f] : lvl === 1 ? [2.5 * f, 4.5 * f] : [5.5 * f, 9 * f]; }
function perceived(S, p) {
  if (p.tid !== -2) return { ovr: p.ovr, pot: p.pot };
  const [so, sp] = scoutSd(S, p.slvl || 0);
  return { ovr: U.clamp(Math.round(p.ovr + p.sn.o * so), 30, 99), pot: U.clamp(Math.round(p.pot + p.sn.p * sp), 35, 99) };
}
function scoutProspect(S, p, lvl) {
  const cost = lvl === 2 ? 20 : 8;
  const have = p.slvl || 0;
  if (have >= lvl) return 'Already scouted at that level.';
  const c = lvl === 2 && have === 1 ? 12 : cost;
  if (S.scout.pts < c) return 'Not enough scouting points.';
  S.scout.pts -= c; p.slvl = lvl;
  return null;
}
function aiDraftValue(S, tid, p) {
  const sc = S.teams[tid].staff.scout.r.eval;
  const noise = p['an' + (tid % 5)] != null ? p['an' + (tid % 5)] : (p['an' + (tid % 5)] = U.gauss(0, 1));
  return p.ovr * 0.42 + p.pot * 0.58 + noise * (6 - sc / 25) - (p.age - 19) * 0.6;
}
function makeDraftPick(S, pid) {
  const d = S.draft; const pk = d.picks[d.cur];
  const p = P(S, pid);
  p.tid = pk.tid; p.draft = { year: d.year, rd: pk.rd, pick: pk.pick, tid: pk.tid };
  const amt = rookieScale(S, pk.pick);
  p.contract = { amt, exp: d.year + (pk.rd === 1 ? 2 : 1), ng: pk.rd === 2, rookie: true };
  p.joined = S.season + 1; p.yrsPro = 0; delete p.sn; p.slvl = 3;
  pk.pid = pid;
  S.picks = S.picks.filter(k => !(k.year === d.year && k.rd === pk.rd && k.orig === pk.orig));
  assignNumbers(S, pk.tid);
  const t = S.teams[pk.tid];
  logTrans(S, 'draft', [pk.tid], `${t.abbr} select ${pname(p)} (${p.pos}, ${p.college}) at No. ${pk.pick}`);
  if (pk.pick <= 3 || pk.tid === S.user) addNews(S, { type: 'draft', tids: [pk.tid], pids: [pid], h: `${tname(t)} take ${pname(p)} at No. ${pk.pick}`, b: `The ${p.age}-year-old ${p.pos} out of ${p.college} (${U.hgt(p.hgt)}, ${p.wgt} lbs).`, imp: pk.pick === 1 ? 4 : 2, local: pk.tid === S.user });
  d.cur++;
  if (d.cur >= d.picks.length) d.done = true;
  return p;
}
function aiPick(S) {
  const d = S.draft; const pk = d.picks[d.cur];
  const pool = prospects(S, d.year);
  if (!pool.length) { d.cur++; if (d.cur >= d.picks.length) d.done = true; return null; }
  const ros = roster(S, pk.tid);
  const posCount = POSS.map(ps => ros.filter(p => p.pos === ps).length);
  const best = U.maxBy(pool, p => aiDraftValue(S, pk.tid, p) + (posCount[POS_IDX[p.pos]] <= 1 ? 1.5 : 0));
  return makeDraftPick(S, best.pid);
}
function finishDraft(S) {
  while (!S.draft.done) aiPick(S);
  for (const p of prospects(S, S.draft.year)) {
    p.tid = -1; p.draft = { year: S.draft.year, rd: 0, pick: 0, tid: -1 }; delete p.sn; p.slvl = 3; p.yrsPro = 0;
    p.contract = { amt: S.minSal, exp: S.season };
  }
  S.picks = S.picks.filter(k => k.year !== S.draft.year);
  if (!S.draft.radio) { S.draft.radio = true; radioShow(S, 'draft'); }
}

// ---------- trades ----------
function teamStrength(S, tid) { return U.avg(U.sortBy(roster(S, tid), p => p.ovr).slice(0, 8), p => p.ovr); }
function teamMode(S, tid) {
  const t = S.teams[tid];
  const ranks = S.teams.map(x => ({ tid: x.tid, v: teamStrength(S, x.tid) + (x.rec.w + x.rec.l > 10 ? (winPct(x.rec) - 0.5) * 10 : 0) })).sort((a, b) => b.v - a.v);
  const r = ranks.findIndex(x => x.tid === tid);
  return r < 9 ? 'contend' : r >= 21 ? 'rebuild' : 'neutral';
}
function projectedPick(S, origTid) {
  const ranks = S.teams.map(x => ({ tid: x.tid, v: teamStrength(S, x.tid) + (x.rec.w + x.rec.l > 10 ? (winPct(x.rec) - 0.5) * 12 : 0) })).sort((a, b) => a.v - b.v);
  return ranks.findIndex(x => x.tid === origTid) + 1;
}
function pickValue(S, k, mode) {
  const proj = projectedPick(S, k.orig);
  let v = k.rd === 1 ? 70 * Math.pow(0.93, proj - 1) + 6 : 3;
  v *= Math.pow(0.9, Math.max(0, k.year - S.season - 1));
  if (mode === 'rebuild') v *= 1.25; if (mode === 'contend') v *= 0.8;
  return v;
}
function pickLabel(S, k) { return `${k.year} ${k.rd === 1 ? '1st' : '2nd'} (${S.teams[k.orig].abbr})`; }
function assetsValue(S, tid, pids, picks, forTid) {
  const mode = teamMode(S, forTid);
  return U.sum(pids, id => P(S, id) ? Math.max(-15, tradeValue(S, P(S, id), mode)) : 0) + U.sum(picks, id => { const k = S.picks.find(x => x.id === id); return k ? pickValue(S, k, mode) : 0; });
}
function salaryOf(S, pids) { return U.sum(pids, id => P(S, id).contract.amt); }
// a = tid giving aGive {pids,picks} and receiving bGive from b
function tradeProblems(S, a, b, aGive, bGive) {
  const probs = [];
  if (S.phase === PH.REG && S.day > S.deadlineDay) probs.push('The trade deadline has passed.');
  if (S.phase === PH.PO) probs.push('No trades during the playoffs.');
  for (const [tid, give] of [[a, aGive], [b, bGive]]) {
    for (const id of give.pids) { const p = P(S, id); if (!p || p.tid !== tid) probs.push(`${p ? pname(p) : 'A player'} is no longer on ${S.teams[tid].abbr}.`); }
    for (const id of give.picks) { const k = S.picks.find(x => x.id === id); if (!k || k.tid !== tid) probs.push(`A selected draft pick is no longer available.`); }
  }
  if (probs.length) return probs;
  for (const [tid, give, get] of [[a, aGive, bGive], [b, bGive, aGive]]) {
    const t = S.teams[tid];
    const n = rosterCount(S, tid) - give.pids.length + get.pids.length;
    if (n > rosterMax(S)) probs.push(`${t.abbr} would have ${n} players (max ${rosterMax(S)}).`);
    const out = salaryOf(S, give.pids), inc = salaryOf(S, get.pids);
    const after = teamPay(S, tid) - out + inc;
    if (after > S.cap && inc > out * 1.25 + 100) probs.push(`${t.abbr} is over the cap: incoming salary (${U.money(inc)}) can't exceed 125% of outgoing (${U.money(out)}) + $100K.`);
  }
  return probs;
}
function aiTradeVerdict(S, aiTid, aiGive, aiGet, margin) {
  const give = assetsValue(S, aiTid, aiGive.pids, aiGive.picks, aiTid);
  const get = assetsValue(S, aiTid, aiGet.pids, aiGet.picks, aiTid);
  const need = give * margin + (aiGive.pids.length + aiGive.picks.length ? 1 : 0);
  return { ok: get >= need && get > 0, give, get, need };
}
function executeTrade(S, a, b, aGive, bGive) {
  const ta = S.teams[a], tb = S.teams[b];
  const move = (pids, to) => pids.forEach(id => { const p = P(S, id); p.tid = to; p.joined = S.season; p.morale = U.clamp(p.morale - 4 + (teamMode(S, to) === 'contend' ? 6 : 0), 0, 100); p.prom = null; S.tradeBlock = S.tradeBlock.filter(x => x !== id); });
  move(aGive.pids, b); move(bGive.pids, a);
  aGive.picks.forEach(id => { S.picks.find(k => k.id === id).tid = b; });
  bGive.picks.forEach(id => { S.picks.find(k => k.id === id).tid = a; });
  assignNumbers(S, a); assignNumbers(S, b);
  if (S.draft && !S.draft.done) for (const pk of S.draft.picks) { if (pk.pid) continue; const k = S.picks.find(x => x.year === S.draft.year && x.rd === pk.rd && x.orig === pk.orig); if (k) pk.tid = k.tid; }
  const desc = (give) => give.pids.map(id => pname(P(S, id))).concat(give.picks.map(id => pickLabel(S, S.picks.find(k => k.id === id)))).join(', ') || 'nothing';
  const text = `${ta.abbr} trade ${desc(aGive)} to ${tb.abbr} for ${desc(bGive)}`;
  logTrans(S, 'trade', [a, b], text);
  const big = aGive.pids.concat(bGive.pids).map(id => P(S, id)).sort((x, y) => y.ovr - x.ovr)[0];
  addNews(S, { type: 'trade', tids: [a, b], h: big ? `Trade: ${pname(big)} dealt to ${big.tid === a ? ta.name : tb.name}` : `${ta.name} and ${tb.name} swap picks`, b: text + '.', imp: big && big.ovr >= 82 ? 4 : 2, local: a === S.user || b === S.user });
  for (const tid of [a, b]) { if (tid !== S.user) { aiTrimRoster(S, tid); aiFillRoster(S, tid); } ensureRotation(S, tid); }
  S.offers = S.offers.filter(o => !o.pids.concat(o.get.pids).some(id => aGive.pids.includes(id) || bGive.pids.includes(id)));
}
function proposeTrade(S, b, give, get) {
  const probs = tradeProblems(S, S.user, b, give, get);
  if (probs.length) return { ok: false, msg: probs.join(' ') };
  const v = aiTradeVerdict(S, b, get, give, DIFFS[S.diff].trade);
  if (!v.ok) {
    const r = v.get / Math.max(1, v.need);
    return { ok: false, msg: r > 0.9 ? `${S.teams[b].abbr}: "We're close. Sweeten it a little."` : r > 0.7 ? `${S.teams[b].abbr}: "Not enough value coming back for us."` : `${S.teams[b].abbr}: "Not interested. Don't insult us."`, v };
  }
  executeTrade(S, S.user, b, give, get);
  return { ok: true, msg: 'Trade accepted!', v };
}
// AI builds a package from its own assets worth about `target` in its own eyes.
// maxSal caps the total salary the package may carry (so the other side stays cap-legal).
function buildPackage(S, tid, target, exclude = [], maxSal = Infinity) {
  const mode = teamMode(S, tid);
  const assets = [];
  const stars = U.sortBy(roster(S, tid), p => p.ovr).slice(0, 2).map(p => p.pid);
  for (const p of roster(S, tid)) if (!exclude.includes(p.pid) && !(stars.includes(p.pid) && mode === 'contend')) assets.push({ pid: p.pid, v: Math.max(0, tradeValue(S, p, mode)), sal: p.contract.amt });
  for (const k of S.picks.filter(k => k.tid === tid)) assets.push({ pick: k.id, v: pickValue(S, k, mode), sal: 0 });
  U.shuffle(assets);
  assets.sort((x, y) => y.v - x.v + U.rf(-4, 4));
  const out = { pids: [], picks: [] }; let sum = 0, sal = 0;
  for (const a of assets) {
    if (sum >= target * 0.97) break;
    if (a.v < 1) continue;
    if (sum + a.v > target * 1.15) continue;
    if (sal + a.sal > maxSal) continue;
    if (a.pid) out.pids.push(a.pid); else out.picks.push(a.pick);
    sum += a.v; sal += a.sal;
    if (out.pids.length + out.picks.length >= 4) break;
  }
  return { pkg: out, v: sum };
}
// add salary filler from tid so that a capped-out team can legally take on `incoming`
function matchSalary(S, tid, pkg, incoming, exclude = [], maxTotal = Infinity) {
  const out = () => salaryOf(S, pkg.pids);
  const ok = () => teamPay(S, tid) - out() + incoming <= S.cap || incoming <= out() * 1.25 + 100;
  let guard = 0;
  while (!ok() && guard++ < 4 && pkg.pids.length < 4) {
    const need = (incoming - 100) / 1.25 - out();
    const pool = roster(S, tid).filter(p => !pkg.pids.includes(p.pid) && !exclude.includes(p.pid) && out() + p.contract.amt <= maxTotal);
    if (!pool.length) break;
    // prefer the cheapest-value contract that closes the gap without overshooting
    const pick = U.maxBy(pool, p => -(Math.abs(p.contract.amt - need) / 1000) - Math.max(0, tradeValue(S, p, 'neutral')) / 25 + (p.contract.amt >= need ? 1 : 0));
    pkg.pids.push(pick.pid);
  }
  return ok();
}
function tradeBlockOffers(S) {
  if (!S.tradeBlock.length || S.phase === PH.PO || (S.phase === PH.REG && S.day > S.deadlineDay)) return;
  for (const pid of S.tradeBlock) {
    const p = P(S, pid);
    if (!p || p.tid !== S.user) continue;
    if (Math.random() > 0.55) continue;
    const t = U.pick(S.teams.filter(x => x.tid !== S.user));
    const val = tradeValue(S, p, teamMode(S, t.tid));
    if (val < 2) continue;
    const userMax = teamPay(S, S.user) - p.contract.amt <= S.cap ? Infinity : p.contract.amt * 1.25 + 100;
    const { pkg, v } = buildPackage(S, t.tid, (val - 1) * U.rf(0.85, 1.0) / DIFFS[S.diff].trade, [], userMax);
    if (!pkg.pids.length && !pkg.picks.length) continue;
    const give = { pids: [pid], picks: [] };
    matchSalary(S, t.tid, pkg, p.contract.amt, [pid]);
    if (!aiTradeVerdict(S, t.tid, pkg, give, 1.0).ok) continue;
    if (tradeProblems(S, S.user, t.tid, give, pkg).length) continue;
    const o = { id: S.nextNid++, tid: t.tid, pids: [pid], get: pkg, d: S.day, s: S.season };
    S.offers.push(o);
    const desc = pkg.pids.map(id => `${pname(P(S, id))} (${P(S, id).pos}, ${P(S, id).ovr})`).concat(pkg.picks.map(id => pickLabel(S, S.picks.find(k => k.id === id)))).join(', ');
    inbox(S, { from: `${tname(t)} GM`, subj: `Offer for ${pname(p)}`, body: `We'd give you ${desc} for ${pname(p)}.`, act: { kind: 'offer', oid: o.id } });
  }
  S.offers = S.offers.filter(o => S.day - o.d < 14 || o.s !== S.season);
}
function acceptOffer(S, o) {
  const give = { pids: o.pids, picks: [] };
  if (o.pids.some(id => P(S, id).tid !== S.user) || o.get.pids.some(id => P(S, id).tid !== o.tid) || o.get.picks.some(id => { const k = S.picks.find(x => x.id === id); return !k || k.tid !== o.tid; })) { S.offers = S.offers.filter(x => x !== o); return 'That offer is no longer valid.'; }
  const probs = tradeProblems(S, S.user, o.tid, give, o.get);
  if (probs.length) return probs.join(' ');
  executeTrade(S, S.user, o.tid, give, o.get);
  S.offers = S.offers.filter(x => x !== o);
  return null;
}
function aiAiTrade(S, tries = 8) {
  for (let i = 0; i < tries; i++) if (aiAiTryOnce(S)) return true;
  return false;
}
function aiAiTryOnce(S) {
  if (S.phase === PH.REG && S.day > S.deadlineDay) return;
  const ai = S.teams.filter(t => t.tid !== S.user);
  const buyers = ai.filter(t => teamMode(S, t.tid) === 'contend'), sellers = ai.filter(t => teamMode(S, t.tid) === (Math.random() < 0.75 ? 'rebuild' : 'neutral'));
  if (!buyers.length || !sellers.length) return;
  const b = U.pick(buyers), s = U.pick(sellers);
  const vet = U.sortBy(roster(S, s.tid).filter(p => p.age >= 27 && p.ovr >= 72), p => p.ovr)[U.ri(0, 2)];
  if (!vet) return;
  const val = tradeValue(S, vet, teamMode(S, b.tid));
  const sellerMax = teamPay(S, s.tid) - vet.contract.amt <= S.cap ? Infinity : vet.contract.amt * 1.25 + 100;
  const { pkg } = buildPackage(S, b.tid, val * 0.98, [], sellerMax);
  if (!pkg.pids.length && !pkg.picks.length) return;
  const give = { pids: [vet.pid], picks: [] };
  matchSalary(S, b.tid, pkg, vet.contract.amt, [], sellerMax);
  // seller may need to take back less salary than it sends
  if (tradeProblems(S, s.tid, b.tid, give, pkg).length) return;
  const v1 = aiTradeVerdict(S, s.tid, give, pkg, 1.0), v2 = aiTradeVerdict(S, b.tid, pkg, give, 0.95);
  if (v1.ok && v2.ok) { executeTrade(S, s.tid, b.tid, give, pkg); return true; }
  return false;
}
