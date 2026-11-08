// ===== story.js — newsroom, radio show, inbox, morale =====
function addNews(S, n) {
  n.id = S.nextNid++; n.s = S.season; n.d = S.day; n.ph = S.phase;
  S.news.unshift(n);
  if (S.news.length > 350) S.news.length = 350;
  return n;
}
function inbox(S, m) {
  m.id = S.nextNid++; m.s = S.season; m.d = S.day; m.read = false; m.done = false;
  S.inbox.unshift(m);
  if (S.inbox.length > 150) S.inbox.length = 150;
  return m;
}
function unread(S) { return S.inbox.filter(m => !m.read).length; }
function dateLabel(S, d, ph) {
  ph = ph != null ? ph : S.phase; d = d != null ? d : S.day;
  if (ph === PH.REG) return 'Day ' + d;
  if (ph === PH.PO) return 'Playoffs, Day ' + d;
  return PH_NAME[ph];
}
function localPaper(t) { return t.region + ' ' + PAPER_NAMES[(t.tid * 7 + t.region.length) % PAPER_NAMES.length]; }
function beatWriter(t) { return WRITERS[(t.tid * 3 + t.name.length) % WRITERS.length]; }

// ---------- player morale ----------
function expectedMinutes(rank) { return rank < 2 ? 31 : rank < 5 ? 25 : rank < 8 ? 15 : rank < 10 ? 7 : 0; }
function roleName(rank) { return rank < 1 ? 'Franchise Player' : rank < 2 ? 'Star' : rank < 5 ? 'Starter' : rank < 8 ? 'Rotation' : rank < 10 ? 'Bench' : 'End of Bench'; }
function teamRanks(S, tid) { const m = {}; U.sortBy(roster(S, tid), p => p.ovr).forEach((p, i) => m[p.pid] = i); return m; }
function currentMpg(S, p) { const t = seasonTotals(p, S.season, 0); return t.gp ? t.min / t.gp : null; }
function teamChem(S, tid) {
  const ps = roster(S, tid);
  if (!ps.length) return 50;
  const mor = U.avg(ps, p => p.morale);
  const cont = U.avg(ps, p => Math.min(5, S.season - p.joined));
  const lead = ps.some(p => p.pers === 'leader' && p.ovr >= 72) ? 5 : 0;
  const divas = ps.filter(p => p.pers === 'diva' && p.morale < 45).length * 4;
  return Math.round(U.clamp(mor * 0.7 + cont * 4 + lead - divas + 8, 0, 100));
}
function moodWord(m) { return m >= 80 ? 'Ecstatic' : m >= 65 ? 'Happy' : m >= 50 ? 'Content' : m >= 35 ? 'Frustrated' : m >= 20 ? 'Unhappy' : 'Furious'; }

function updateMorale(S) {
  for (const t of S.teams) {
    const ranks = teamRanks(S, t.tid);
    const wp = teamWinPct(S, t);
    const hasLeader = roster(S, t.tid).some(p => p.pers === 'leader' && p.ovr >= 72);
    for (const p of roster(S, t.tid)) {
      const rank = ranks[p.pid];
      const exp = expectedMinutes(rank);
      const mpg = currentMpg(S, p);
      let target = 60;
      target += (wp - 0.5) * (p.pers === 'winner' ? 70 : 35);
      if (mpg != null && !(p.inj && p.inj.games > 0)) target += U.clamp(mpg - exp, -16, 6) * (p.pers === 'diva' ? 1.6 : p.pers === 'easy' ? 0.45 : 1);
      const fair = marketSalary(S, p);
      const under = (fair - p.contract.amt) / 1000;
      if (under > 1) target -= Math.min(12, under * (p.pers === 'mercenary' ? 2.2 : 1));
      if (hasLeader) target += 4;
      if (p.pers === 'easy') target = 60 + (target - 60) * 0.6;
      if (p.pers === 'diva' && t.pop > 5) target += 3;
      if (p.prom) {
        if (S.day >= p.prom.until && S.phase === PH.REG) {
          const row = seasonTotals(p, S.season, 0);
          const gp = row.gp - p.prom.gp0, min = row.min - p.prom.min0;
          const kept = gp <= 0 ? true : (min / gp) >= p.prom.want - 2;
          if (kept) { p.morale = Math.min(100, p.morale + 12); if (t.tid === S.user) inbox(S, { from: pname(p), subj: 'Thanks for keeping your word', body: `Coach gave me the minutes you promised. I won't forget that.` }); }
          else {
            p.morale = Math.max(0, p.morale - 22);
            if (t.tid === S.user) inbox(S, { from: pname(p), subj: 'You lied to me', body: `You promised me ${p.prom.want} minutes a night. I'm averaging ${(min / gp).toFixed(1)} since. I want out.`, act: { kind: 'tradereq', pid: p.pid } });
          }
          p.prom = null;
        } else target += 4;
      }
      p.morale = U.clamp(p.morale + (target - p.morale) * 0.22 + U.gauss(0, 1.5), 0, 100);
      // complaints to the user's front office
      if (t.tid === S.user && S.phase === PH.REG && !p.prom && mpg != null && rank < 10) {
        const last = p.lastGripe || -99;
        if (p.morale < 38 && mpg < exp - 5 && S.day - last > 25 && Math.random() < 0.6) {
          p.lastGripe = S.day;
          inbox(S, { from: pname(p), subj: 'I need more minutes', body: `I'm averaging ${mpg.toFixed(1)} minutes. A player of my ability (${roleName(rank)}) should be closer to ${exp}+. What are you going to do about it?`, act: { kind: 'pt', pid: p.pid, want: exp } });
        } else if (p.morale < 18 && S.day - last > 30 && Math.random() < 0.5) {
          p.lastGripe = S.day;
          inbox(S, { from: `${pname(p)}'s agent`, subj: 'Formal trade request', body: `My client has lost confidence in the direction of this franchise and requests a trade.`, act: { kind: 'tradereq', pid: p.pid } });
        }
      }
    }
  }
}

function resolveInbox(S, id, choice) {
  const m = S.inbox.find(x => x.id === id);
  if (!m || m.done) return null;
  m.done = true; m.read = true;
  const a = m.act || {};
  const p = a.pid != null ? P(S, a.pid) : null;
  let msg = null;
  if (a.kind === 'pt' && p) {
    if (choice === 'promise') { const row = seasonTotals(p, S.season, 0); p.prom = { want: a.want, until: S.day + 21, gp0: row.gp, min0: row.min }; p.morale = Math.min(100, p.morale + 8); msg = `${pname(p)} likes what he hears. Give him ${a.want}+ minutes over the next three weeks.`; }
    else if (choice === 'earn') { p.morale = Math.max(0, p.morale - (p.pers === 'diva' ? 12 : 5)); msg = `${pname(p)} did not take that well.`; }
    else if (choice === 'block') { if (!S.tradeBlock.includes(p.pid)) S.tradeBlock.push(p.pid); msg = `${pname(p)} is on the trading block.`; }
  } else if (a.kind === 'tradereq' && p) {
    if (choice === 'block') { if (!S.tradeBlock.includes(p.pid)) S.tradeBlock.push(p.pid); p.morale = Math.min(100, p.morale + 5); msg = `${pname(p)} is on the trading block.`; }
    else if (choice === 'talk') { if (Math.random() < 0.45 + (p.pers === 'loyal' ? 0.25 : 0)) { p.morale = Math.min(100, p.morale + 15); msg = `The sit-down worked. ${pname(p)} is willing to give it another shot.`; } else { p.morale = Math.max(0, p.morale - 6); msg = `${pname(p)} walked out of the meeting.`; } }
  } else if (a.kind === 'naming') {
    if (choice === 'accept') {
      const t = S.teams[S.user];
      const suf = t.arena.name.split(' ').pop();
      t.arena.naming = { corp: a.corp, amt: a.amt, yrs: a.yrs };
      t.arena.name = a.corp + ' ' + suf;
      msg = `Welcome to ${t.arena.name}.`;
      addNews(S, { type: 'arena', tids: [t.tid], h: `${t.name} sell arena naming rights to ${a.corp}`, b: `The deal is worth ${U.money(a.amt)} a season over ${a.yrs} seasons.`, imp: 2 });
    } else msg = 'You passed on the naming deal.';
  } else if (a.kind === 'sponsor') {
    if (choice === 'accept') { const t = S.teams[S.user]; t.cash += a.amt; t.fin.rev.ads += a.amt; t.fan = U.clamp(t.fan + (a.fan || 0), 0, 100); t.hype = U.clamp(t.hype + (a.hype || 0), 0, 100); msg = `Deal done: +${U.money(a.amt)}.`; }
    else msg = 'You declined the promotion.';
  } else if (a.kind === 'ext') {
    msg = 'Maybe later.';
  } else if (a.kind === 'offer') {
    const o = S.offers.find(x => x.id === a.oid);
    if (o && choice === 'accept') { const r = acceptOffer(S, o); msg = r || 'Trade complete.'; if (r) m.done = false; }
    else { S.offers = S.offers.filter(x => x.id !== a.oid); msg = 'Offer declined.'; }
  }
  m.reply = msg;
  return msg;
}

// ---------- weekly radio show ----------
// picks a line not used recently, so the show doesn't repeat itself week to week
function fresh(S, key, arr) {
  S.rUsed = S.rUsed || {};
  const used = S.rUsed[key] || [];
  const pool = arr.map((x, i) => i).filter(i => !used.includes(i));
  const i = pool.length ? U.pick(pool) : U.ri(0, arr.length - 1);
  S.rUsed[key] = used.concat([i]).slice(-Math.max(1, Math.floor(arr.length * 0.6)));
  return arr[i];
}
function radioShow(S, special) {
  const t = S.teams[S.user];
  const r = t.rec, wp = winPct(r), gp = r.w + r.l;
  const H = RADIO.host.split(' ')[0], C = RADIO.cohost.split(' ')[0];
  const T = t.name, CITY = t.region;
  const lines = [];
  const say = (who, text) => lines.push({ who, text });
  const ps = U.sortBy(roster(S, t.tid), p => p.ovr);
  const star = ps[0], second = ps[1];
  const weekStats = (p) => { const rows = recentLines(S, p.pid, 7); if (!rows.length) return null; return { g: rows.length, pts: U.avg(rows, x => x.pts), reb: U.avg(rows, x => x.orb + x.drb), ast: U.avg(rows, x => x.ast) }; };
  say(H, fresh(S, 'intro', [
    `Welcome back to ${RADIO.show} on ${RADIO.station}! ${RADIO.host} here with ${RADIO.cohost}, and the phones are LIT about your ${T}.`,
    `It's ${RADIO.show}, you're on ${RADIO.station}. Lotta ground to cover on the ${T} today, so let's get right to it.`,
    `Good afternoon, ${CITY}! ${RADIO.host} and ${RADIO.cohost}, ${RADIO.show}, and we are talking ${T} basketball.`,
    `Pull the car over, turn it up. ${RADIO.show} is on the air and ${C} is already mad at me.`,
    `You found us. ${RADIO.station}, home of the ${T}. I'm ${RADIO.host}, she's ${RADIO.cohost}, and nobody's hanging up on me today.`,
    `Hour two of ${RADIO.show}. Phone lines are full, the coffee is cold, and the ${T} are the only thing on the menu.`,
    `Big show today, ${CITY}. Let's talk some ${T} hoops.`,
  ]));
  if (special === 'draft') {
    const picks = S.draft ? S.draft.picks.filter(k => k.tid === t.tid && k.pid).map(k => P(S, k.pid)).filter(Boolean) : [];
    if (picks.length) {
      const top = picks[0];
      say(H, fresh(S, 'draft1', [`Draft night is in the books. The ${T} went with ${pname(top)} out of ${top.college}. ${C}, grade it.`, `So the ${T} took ${pname(top)}. ${top.age} years old, ${U.hgt(top.hgt)}, plays ${top.pos}. I want to like it, ${C}.`, `${pname(top)}. That's the pick. Let's see if he's a guy or a "guy."`]));
      const g = U.grade(Math.max(top.pot, top.ovr) + (top.draft && top.draft.pick <= 5 ? -4 : 6));
      say(C, `I'm giving it ${/^[AB]/.test(g) ? 'a solid' : 'a shaky'} ${g}. ${top.pot >= 85 ? "The upside is real. Be patient with him." : top.ovr >= 68 ? "He can help right away, but I don't see a star." : "That's a project. Two, three years before we know."}`);
    } else say(H, `The ${T} sat out the draft. No picks. I hope somebody upstairs has a plan.`);
  } else if (special === 'fa') {
    const signed = S.trans.filter(x => x.s === S.season && x.type === 'sign' && x.tids.includes(t.tid) && x.ph === PH.FA).slice(0, 3);
    if (signed.length) { say(H, `Free agency recap. The ${T} were busy: ${signed.map(x => x.text.replace(/^\w+ signed /, '')).join('; ')}.`); say(C, fresh(S, 'fa1', ['I like the aggression. You don\'t win standing still.', 'Some of that money is going to look bad in two years. But that\'s next year\'s problem.', 'Depth. They finally bought some depth.'])); }
    else { say(H, `Free agency came and went, and the ${T} did... nothing. Nothing at all.`); say(C, fresh(S, 'fa0', ['Sometimes the best deal is the one you don\'t make.', 'The fans wanted a splash. They got a puddle.'])); }
  } else if (gp === 0) say(H, fresh(S, 'camp', [`No games yet, but I'm hearing big things out of training camp. ${star ? pname(star) + ' looks like a man on a mission.' : ''}`, `Camp is open. ${star ? 'The whole thing hinges on ' + pname(star) + '.' : ''} If he's healthy, anything can happen.`, `Preseason predictions, ${C}. I've got the ${T} winning ${Math.round(30 + (teamStrength(S, t.tid) - 72) * 4)} games. Write it down.`]));
  else if (wp >= 0.68) say(H, fresh(S, 'rec4', [`${r.w} and ${r.l}! I'll say it: this team is the real deal. When's the last time this city felt like this?`, `${r.w}-${r.l}. I have been doing this show a long time, and this might be the most fun team I've covered.`, `${r.w} wins. ${r.l} losses. I'm running out of superlatives, ${C}.`, `Championship or bust. At ${r.w}-${r.l}, anything less is a disappointment.`]));
  else if (wp >= 0.52) say(H, fresh(S, 'rec3', [`${r.w}-${r.l}. Not bad. Not great. I need to see this team beat the big boys before I buy a parade float.`, `${r.w} and ${r.l}. Solid. But "solid" doesn't hang banners, ${C}.`, `A ${r.w}-${r.l} team. Good enough to make the playoffs, good enough to get bounced in the first round.`, `${r.w}-${r.l}, and I still can't tell you what this team is.`]));
  else if (wp >= 0.38) say(H, fresh(S, 'rec2', [`${r.w}-${r.l}. Mediocrity, folks. The worst place to be in this league.`, `${r.w} and ${r.l}, and I'm running out of patience. Somebody upstairs has to make a move.`, `${r.w}-${r.l}. Not good enough to win, not bad enough to get a top pick. Purgatory.`, `I keep waiting for the turn. ${r.w}-${r.l}. Still waiting.`]));
  else say(H, fresh(S, 'rec1', [`${r.w}-${r.l}. I'm not gonna sugarcoat it. Start learning about ping-pong balls, people.`, `I've seen better basketball at the Y on a Tuesday night. ${r.w}-${r.l}. Brutal.`, `${r.w} and ${r.l}. I got an email asking if we could stop talking about the ${T}. Denied.`, `The ${T} are ${r.w}-${r.l}. My mother called. She wants to know what happened.`]));
  if (!special) {
    if (r.str >= 5) say(C, fresh(S, 'hot', [`${r.str} straight wins, ${H}. The building is rocking again.`, `${r.str} in a row! Nobody wants to play these guys right now.`, `That's ${r.str} straight. I'm not saying I'm on the bandwagon. I'm saying I'm looking at the bandwagon.`]));
    else if (r.str <= -5) say(C, fresh(S, 'cold', [`That's ${-r.str} losses in a row. You can feel it in the arena. It's quiet. Too quiet.`, `${-r.str} straight losses. Somebody call a team meeting. Somebody call ANYONE.`, `The losing streak is at ${-r.str}. The body language is the worst part.`]));
    if (star) {
      const w = weekStats(star);
      if (w && w.g >= 2) say(C, w.pts >= 25 ? fresh(S, 'starhot', [`And ${pname(star)}? ${w.pts.toFixed(1)} a night this week. He's carrying this franchise.`, `${pname(star)} is playing like an MVP. ${w.pts.toFixed(1)} points per game this week.`, `Give ${pname(star)} the ball and get out of the way. ${w.pts.toFixed(1)} a night!`])
        : w.pts < 12 ? fresh(S, 'starcold', [`What's going on with ${pname(star)}? ${w.pts.toFixed(1)} points a game this week. That's not a max-player stat line.`, `${pname(star)} looks tired. Or hurt. Or both. ${w.pts.toFixed(1)} a game won't cut it.`])
          : `${pname(star)} quietly giving you ${w.pts.toFixed(1)}, ${w.reb.toFixed(1)} boards and ${w.ast.toFixed(1)} assists this week.`);
    }
    const hurt = roster(S, t.tid).filter(p => p.inj && p.inj.games > 3).sort((a, b) => b.ovr - a.ovr)[0];
    if (hurt) say(H, fresh(S, 'inj', [`And the injury bug: ${pname(hurt)} still out with the ${hurt.inj.type.toLowerCase()}. That hurts.`, `${pname(hurt)} is still in street clothes. ${hurt.inj.games} more games, they say. I'll believe it when I see it.`]));
  }
  // callers
  const callers = [];
  const addC = (k, f) => callers.push({ k, f });
  const g = t.lastGate;
  const strat = t.strat;
  if (g && g.fair > 1.18) addC('c1', () => [`I took my kids to the game Saturday. ${U.dollars(t.prices.lower)} for lower bowl, ${U.dollars(t.prices.food)} for a hot dog, ${U.dollars(t.prices.parking)} to PARK? The owner is robbing us blind!`, `At those prices, ${S.ownerName} better hope this team wins.`]);
  if (g && g.fair > 1.18) addC('c2', () => [`Is anybody going to say it? Half the lower bowl was empty last week. Lower the prices!`, `Empty seats don't buy beer, ${C}. The owner should know that.`]);
  if (g && g.fair < 0.85) addC('c3', () => [`Gotta give the owner credit. Tickets are affordable, the hot dogs are cheap. Great family night out.`, `See, ${C}? Treat the fans right and they show up.`]);
  if (t.arena.cond < 50) addC('c4', () => [`${H}, have you been in the bathrooms at ${t.arena.name}? Disgraceful. Fix the building!`, `The old barn is falling apart. They gotta reinvest.`]);
  if (t.arena.build) addC('c5', () => [`Drove by the new arena site. Cranes everywhere! I can't wait.`, `New building, new era. If they put a winner in it.`]);
  const bust = ps.find(p => p.contract.amt > 7000 && p.ovr < 76);
  if (bust) addC('c6', () => [`Trade ${pname(bust)}! He's making ${U.money(bust.contract.amt)} a year and giving us nothing!`, `Easy to say, tough to do with that contract. Who's taking that on?`]);
  const rook = ps.find(p => p.yrsPro === 0 && p.draft && p.draft.year === S.season);
  if (rook) addC('c7', () => [`I love what I'm seeing from the rookie, ${pname(rook)}. Play the kid more!`, `The kid's got something. Patience, though. Rookies hit the wall.`]);
  if (wp < 0.4 && gp > 10) addC('c8', () => [`Fire ${staffName(t.staff.hc)}! He's lost the locker room!`, `Firing the coach is the easy headline. The roster is the problem.`]);
  if (strat.def === 'zone' && gp > 5) addC('c9', () => [`Why are we playing so much zone? Teams are raining threes on us!`, `It's a choice. Hides some bad individual defenders. I get it, but I don't love it.`]);
  if (strat.pace === 2 && gp > 5) addC('c10', () => [`I love this run-and-gun stuff! Most fun team to watch in years!`, `Fun, sure. Let's see if it holds up in a seven-game series.`]);
  if (strat.pace === 0 && gp > 5) addC('c11', () => [`This offense is putting me to sleep. Walk it up, walk it up, every time!`, `Grind-it-out ball wins in May. Not in February ratings, though.`]);
  const divRival = standings(S, x => x.div === t.div && x.tid !== t.tid)[0];
  if (divRival) addC('c12', () => [`I don't care what the record is, as long as we beat ${divRival.region}. Can't stand that team.`, `The ${divRival.name} rivalry is real, folks. Circle those dates.`]);
  if (wp >= 0.6 && gp > 10) addC('c13', () => [`I'm calling it right now: championship. This is the year. I can feel it, ${H}!`, `Easy there. Let's get through the first round before we plan the parade route.`]);
  if (S.phase === PH.REG && S.day < S.deadlineDay && S.deadlineDay - S.day < 14) addC('c14', () => [`Trade deadline's coming. We gotta make a move. Go get a star!`, `Every caller wants a star. Nobody wants to give one up.`]);
  if (t.hype > 70) addC('c15', () => [`First time in years my buddies at work are talking about the ${T} instead of football!`, `The buzz is real. Bandwagon's filling up fast.`]);
  if (second && star) addC('c16', () => [`Who's better, ${pname(star)} or ${pname(second)}? My brother-in-law and I have been fighting about it for a week.`, `It's ${pname(star)}, and it's not close. Tell your brother-in-law ${H} said so.`]);
  if (S.tradeBlock.length) { const b = P(S, S.tradeBlock[0]); if (b) addC('c17', () => [`I hear ${pname(b)} is on the trading block. Is that true? Why would you do that?`, `If the price is right, everybody is available. That's the business.`]); }
  if (t.cash < 0) addC('c18', () => [`I read the team is losing money. Are they going to move the team? Tell me they're not moving the team!`, `Nobody's moving anywhere. Yet.`]);
  if (special === 'draft') addC('c19', () => [`Best draft in years! Can't wait for summer league!`, `Summer league. Where every rookie looks like a Hall of Famer.`]);
  S.rUsed = S.rUsed || {};
  const recent = S.rUsed.callers || [];
  U.shuffle(callers);
  callers.sort((x, y) => (recent.includes(x.k) ? 1 : 0) - (recent.includes(y.k) ? 1 : 0));
  const chosen = callers.slice(0, U.ri(2, 3));
  S.rUsed.callers = recent.concat(chosen.map(c => c.k)).slice(-5);
  for (const c of chosen.map(x => x.f)) {
    const [q, a] = c();
    say(`${U.pick(RADIO.callerFirst)} from ${U.pick(RADIO.callerTown)}`, q);
    say(Math.random() < 0.6 ? H : C, a);
  }
  say(H, fresh(S, 'outro', [`That's all the time we've got. Keep those calls coming, ${CITY}!`, `We'll be right back after this. Don't touch that dial.`, `Gotta pay some bills. More ${T} talk after the break.`, `${C} gets the last word. ${C}?`, `Lines are open. We'll be back.`]));
  const ep = { s: S.season, d: S.day, ph: S.phase, title: special === 'draft' ? 'Draft Night Grades' : special === 'fa' ? 'Free Agency Report Card' : radioTitle(S, t), lines };
  S.radio.unshift(ep); if (S.radio.length > 25) S.radio.length = 25;
  return ep;
}
function radioTitle(S, t) {
  const r = t.rec;
  if (r.w + r.l === 0) return 'Camp Talk: Expectations';
  if (r.str >= 5) return 'The Streak Is On';
  if (r.str <= -5) return 'Rock Bottom?';
  if (S.phase === PH.PO) return 'Playoff Fever';
  return winPct(r) >= 0.55 ? 'Contender Check' : winPct(r) < 0.4 ? 'Blow It Up?' : 'Stuck in the Middle';
}
function recentLines(S, pid, days) {
  const out = [];
  for (const gid in S.box) {
    const b = S.box[gid];
    if (b.s !== S.season || S.day - b.d > days) continue;
    for (const T of b.teams) for (const l of T.ps) if (l.pid === pid) out.push(l);
  }
  return out;
}

// ---------- weekly league stuff ----------
function powerRankings(S) {
  const rows = S.teams.map(t => {
    const r = t.rec, gp = r.w + r.l;
    const net = gp ? (r.pf - r.pa) / gp : 0;
    const str = U.avg(U.sortBy(roster(S, t.tid).filter(p => !p.inj), p => p.ovr).slice(0, 8), p => p.ovr);
    return { tid: t.tid, v: (gp ? winPct(r) : 0.5) * 40 + net * 1.2 + (str - 70) * (gp < 20 ? 2 : 0.8) };
  }).sort((a, b) => b.v - a.v);
  const prev = S.power || [];
  S.power = rows.map((x, i) => ({ tid: x.tid, rank: i + 1, prev: (prev.find(p => p.tid === x.tid) || { rank: i + 1 }).rank }));
  return S.power;
}
function weeklyNews(S) {
  const pr = powerRankings(S);
  const top = S.teams[pr[0].tid], riser = pr.slice().sort((a, b) => (b.prev - b.rank) - (a.prev - a.rank))[0];
  const ut = S.teams[S.user], ur = pr.find(x => x.tid === S.user);
  addNews(S, { type: 'power', tids: [top.tid], h: `Power Rankings: ${tname(top)} hold the top spot`, b: `${top.name} (${top.rec.w}-${top.rec.l}) lead this week's rankings. Biggest climber: ${tname(S.teams[riser.tid])}, up ${riser.prev - riser.rank} spots. Your ${ut.name} check in at No. ${ur.rank}.`, imp: 1 });
  // local beat column
  const t = ut, r = t.rec;
  if (r.w + r.l >= 3) {
    const ps = U.sortBy(roster(S, t.tid), p => (seasonTotals(p, S.season).pts / Math.max(1, seasonTotals(p, S.season).gp)));
    const lead = ps[0];
    const ppg = r.pf / (r.w + r.l), opp = r.pa / (r.w + r.l);
    addNews(S, {
      type: 'column', tids: [t.tid], local: true, by: beatWriter(t),
      h: U.pick([`${t.name} notebook: ${r.w}-${r.l} and ${winPct(r) >= 0.5 ? 'trending the right way' : 'searching for answers'}`, `Beat column: What we learned about the ${t.name} this week`, `${t.name} at ${r.w}-${r.l}: grading the week`]),
      b: `The ${t.name} are scoring ${ppg.toFixed(1)} a night and allowing ${opp.toFixed(1)}. ${lead ? pname(lead) + ' leads the team in scoring, and the offense runs through him.' : ''} ${ppg - opp > 4 ? 'The point differential says this is a legitimate team.' : ppg - opp < -4 ? 'The point differential is ugly, and it is not a fluke.' : 'The margins are thin, and every possession matters.'} Team chemistry grades out at ${teamChem(S, t.tid)}/100.`,
      imp: 1,
    });
  }
  // random sponsorship / promo offer for the owner
  if (Math.random() < 0.18) {
    const corp = U.pick(CORPS);
    const amt = Math.round(U.rf(150, 900) * (0.7 + ut.hype / 100));
    const promo = U.pick([['Bobblehead Night', 2, 1], ['Free T-Shirt Friday', 3, 0], ['Halftime Car Giveaway', 1, 3], ['Kids Eat Free Night', 4, 0], ['Throwback Jersey Night', 1, 2]]);
    inbox(S, { from: corp, subj: `Sponsorship: ${promo[0]}`, body: `${corp} wants to sponsor a ${promo[0]} at ${ut.arena.name}. They'll pay ${U.money(amt)}. Fans love these nights.`, act: { kind: 'sponsor', amt, fan: promo[1], hype: promo[2] } });
  }
}

// ---------- notable game stories ----------
function gameStories(S, g, sim, po) {
  const H = S.teams[g.h], A = S.teams[g.a];
  const w = sim.score[0] > sim.score[1] ? 0 : 1, wt = w === 0 ? H : A, lt = w === 0 ? A : H;
  const ws = Math.max(...sim.score), ls = Math.min(...sim.score);
  const isUser = g.h === S.user || g.a === S.user;
  for (const s of [0, 1]) {
    const T = sim.T[s], team = S.teams[T.tid], opp = S.teams[sim.T[1 - s].tid];
    for (const gp of T.ps) {
      const st = gp.st, reb = st.orb + st.drb;
      const n = pname(gp.p);
      const dd = [st.pts, reb, st.ast, st.stl, st.blk].filter(x => x >= 10).length;
      if (st.pts >= 45) addNews(S, { type: 'perf', tids: [team.tid], pids: [gp.pid], h: `${n} erupts for ${st.pts} as ${team.name} ${s === w ? 'top' : 'fall to'} ${opp.name}`, b: `${n} went ${st.fgm}-for-${st.fga} from the field, ${st.tpm}-for-${st.tpa} from deep, and ${st.ftm}-for-${st.fta} at the line in ${Math.round(st.min)} minutes.`, imp: st.pts >= 55 ? 5 : 4 });
      else if (st.pts >= 38 && (isUser || Math.random() < 0.5)) addNews(S, { type: 'perf', tids: [team.tid], pids: [gp.pid], h: `${n} pours in ${st.pts} against ${opp.region}`, b: `${n} added ${reb} rebounds and ${st.ast} assists.`, imp: 2, local: team.tid === S.user });
      if (dd >= 3) addNews(S, { type: 'perf', tids: [team.tid], pids: [gp.pid], h: `${n} posts a triple-double: ${st.pts}/${reb}/${st.ast}`, b: `The ${team.name} ${s === w ? 'won' : 'lost'} ${sim.score[s]}-${sim.score[1 - s]} against ${tname(opp)}.`, imp: 3 });
      else if (st.pts >= 20 && reb >= 20) addNews(S, { type: 'perf', tids: [team.tid], pids: [gp.pid], h: `${n} goes for ${st.pts} and ${reb} against ${opp.name}`, b: `A monster 20-20 night.`, imp: 3 });
      // records
      pushRecord(S.records.game.pts, { v: st.pts, pid: gp.pid, n, tid: team.tid, s: S.season, opp: opp.abbr });
      pushRecord(S.records.game.reb, { v: reb, pid: gp.pid, n, tid: team.tid, s: S.season, opp: opp.abbr });
      pushRecord(S.records.game.ast, { v: st.ast, pid: gp.pid, n, tid: team.tid, s: S.season, opp: opp.abbr });
    }
  }
  if (sim.q >= 6) addNews(S, { type: 'game', tids: [H.tid, A.tid], h: `${wt.name} outlast ${lt.name} in ${sim.q - 4}OT marathon, ${ws}-${ls}`, b: `It took ${sim.q - 4} overtimes to settle it.`, imp: 3 });
  if (ws - ls >= 35) addNews(S, { type: 'game', tids: [wt.tid], h: `${wt.name} demolish ${lt.name} by ${ws - ls}`, b: `${ws}-${ls}. It was over early.`, imp: 2 });
  if (sim.walkoff) { const p = P(S, sim.walkoff); addNews(S, { type: 'game', tids: [wt.tid], pids: [p.pid], h: `${pname(p)} beats the buzzer! ${wt.name} stun ${lt.name}, ${ws}-${ls}`, b: `Pandemonium${g.h === wt.tid ? ' in ' + wt.region : ' on the road'}.`, imp: 4, local: isUser }); }
  for (const tm of [wt, lt]) {
    const st = tm.rec.str;
    if ((st >= 7 || st <= -8) && Math.abs(st) % 2 === 1) addNews(S, { type: 'streak', tids: [tm.tid], h: st > 0 ? `${tname(tm)} win ${st} straight` : `${tname(tm)} drop ${-st} in a row`, b: st > 0 ? `The ${tm.name} are the hottest team in the league.` : `The ${tm.name} can't buy a win.`, imp: Math.abs(st) >= 11 ? 3 : 2 });
  }
  if (isUser && !po) {
    const ut = S.user === H.tid ? 0 : 1;
    const top = U.maxBy(sim.T[ut].ps, x => x.st.pts + (x.st.orb + x.st.drb) * 0.6 + x.st.ast * 0.8);
    const won = ut === w;
    addNews(S, { type: 'recap', tids: [S.user], local: true, h: `${S.teams[S.user].name} ${won ? (ws - ls >= 15 ? 'cruise past' : 'beat') : (ws - ls >= 15 ? 'routed by' : 'fall to')} ${S.teams[sim.T[1 - ut].tid].name}, ${sim.score[ut]}-${sim.score[1 - ut]}`, b: `${top ? pname(top.p) + ' led the way with ' + top.st.pts + ' points, ' + (top.st.orb + top.st.drb) + ' rebounds and ' + top.st.ast + ' assists.' : ''}`, imp: 1, gid: g.gid });
  }
}
function pushRecord(list, rec) {
  if (list.length >= 10 && rec.v <= list[list.length - 1].v) return;
  list.push(rec); list.sort((a, b) => b.v - a.v); if (list.length > 10) list.length = 10;
}
