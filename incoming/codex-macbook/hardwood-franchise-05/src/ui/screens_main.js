// ===== ui/screens_main.js — title, new franchise, home, inbox, news, save, help =====
const GAME_TITLE = 'Hardwood Franchise';

Screens.title = {
  bare: true,
  render() {
    return `<div class="title-wrap"><canvas class="bg" id="titleBg" aria-hidden="true"></canvas>
    <div class="title-card">
      <h1 class="wordmark">Hardwood<small>Franchise '05</small></h1>
      <p class="tagline">Owner. General manager. Head coach. Thirty teams, one ${LEAGUE.name}, and as many seasons as you can stand.</p>
      <div class="menu" id="titleMenu">
        ${btn('New Franchise', 'newFranchise', 'gold lg')}
        <div id="continueSlot"></div>
        ${btn('Load Franchise', 'loadMenu', '')}
        <label class="btn" style="position:relative;overflow:hidden"><span>Import Save File</span><input type="file" accept=".json,application/json" data-c="importFile" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label>
        ${btn('Cloud Saves', 'cloudMenu', 'ghost')}
        ${btn('How to Play', 'go', 'ghost', { r: 'help' })}
      </div>
      <p class="tiny dim" style="margin-top:22px">An original basketball franchise sim. All teams, players and people are fictional.</p>
    </div></div>`;
  },
  async after() {
    titleBg();
    const metas = await Store.metas();
    if (metas.length) {
      const m = metas[0];
      const el = $('#continueSlot');
      if (el) el.innerHTML = `<button class="btn team" data-a="loadSlot" data-k="${E(m.key)}" style="width:100%;--team:${m.c1};--teamtext:${textOn(m.c1)}"><span>Continue: ${E(m.abbr)} · ${U.seasonLabel(m.season)}</span></button>`;
    }
  },
};
function titleBg() {
  const c = $('#titleBg'); if (!c) return;
  const ctx = c.getContext('2d');
  const fit = () => { c.width = c.clientWidth * devicePixelRatio; c.height = c.clientHeight * devicePixelRatio; };
  fit();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t0 = performance.now();
  const draw = (now) => {
    if (!document.body.contains(c)) return;
    const w = c.width, h = c.height, t = (now - t0) / 1000;
    ctx.clearRect(0, 0, w, h);
    // hardwood planks in perspective
    const horizon = h * 0.42;
    for (let i = 0; i < 26; i++) {
      const x = (i / 25) * w;
      ctx.strokeStyle = `rgba(201,141,78,${0.10 + (i % 3) * 0.03})`; ctx.lineWidth = 1 * devicePixelRatio;
      ctx.beginPath(); ctx.moveTo(w / 2 + (x - w / 2) * 0.15, horizon); ctx.lineTo(x * 2.2 - w * 0.6, h); ctx.stroke();
    }
    for (let j = 0; j < 14; j++) { const y = horizon + Math.pow(j / 13, 2) * (h - horizon); ctx.strokeStyle = 'rgba(201,141,78,0.08)'; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    // center circle
    ctx.strokeStyle = 'rgba(255,182,39,0.25)'; ctx.lineWidth = 2 * devicePixelRatio;
    ctx.beginPath(); ctx.ellipse(w / 2, horizon + (h - horizon) * 0.55, w * 0.16, h * 0.08, 0, 0, Math.PI * 2); ctx.stroke();
    // sweeping arena spotlights
    for (let k = 0; k < 3; k++) {
      const a = Math.sin(t * 0.4 + k * 2.1) * 0.5;
      const sx = w * (0.2 + k * 0.3), g = ctx.createRadialGradient(sx + a * w * 0.3, horizon + h * 0.25, 0, sx + a * w * 0.3, horizon + h * 0.25, w * 0.25);
      g.addColorStop(0, 'rgba(255,214,121,0.12)'); g.addColorStop(1, 'rgba(255,214,121,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    if (!reduce) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
  window.addEventListener('resize', fit, { once: true });
}
Act.loadSlot = el => loadSlot(el.dataset.k);
Act.cloudMenu = () => { modal('Cloud Saves', '<div id="cloudSlot" data-bare="1">' + cloudPanel(true) + '</div>', '', { size: 'md' }); cloudRefresh(); };
Act.loadMenu = async () => {
  const metas = await Store.metas();
  const rows = metas.map(m => `<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="row">${logo({ tid: m.tid, abbr: m.abbr, c1: m.c1, c2: m.c2, region: '', name: m.team }, 40)}<div><div class="b">${E(m.team)}</div><div class="small mute">${E(m.phaseLine)} · ${m.w}-${m.l}${m.titles ? ` · ${m.titles} title${m.titles > 1 ? 's' : ''}` : ''} · saved ${new Date(m.ts).toLocaleString()}</div></div></div><div class="row tight">${btn('Load', 'loadSlot', 'gold sm', { k: m.key })}${btn('Delete', 'delSlot', 'red sm', { k: m.key })}</div></div>`).join('');
  modal('Load Franchise', rows || '<div class="empty">No saved franchises yet.</div>', '', { size: 'md' });
};
Act.delSlot = el => {
  const k = el.dataset.k;
  confirmBox('Delete franchise?', 'This permanently deletes the save from this browser. Export it first if you might want it back.', 'Delete', async () => {
    await Store.del(k);
    await Store.put('__index', (await Store.metas()).filter(m => m.key !== k));
    toast('Save deleted.');
    if (App.route === 'title') render(); else rerender();
  }, 'red');
};
Act.importFile = (el) => {
  const f = el.files && el.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = async () => {
    try {
      const S = JSON.parse(rd.result);
      if (!S || !S.teams || !S.players || S.user == null) throw new Error('Not a Hardwood Franchise save file.');
      const key = 'f' + Date.now();
      startWith(S, key);
      await saveNow(true);
      toast('Save imported.', 'good');
    } catch (e) { toast('Import failed: ' + e.message, 'bad'); }
  };
  rd.readAsText(f);
};

// ---------- new franchise ----------
Screens.new = {
  bare: true,
  render() {
    const N = App.newSetup;
    const S = N.S;
    const sel = N.tid != null ? S.teams[N.tid] : null;
    const card = t => {
      const str = teamStrength(S, t.tid);
      return `<button class="tcard ${N.tid === t.tid ? 'on' : ''}" data-a="pickTeam" data-tid="${t.tid}" style="width:100%">${logo(t, 40)}<div class="grow"><div class="b">${E(t.region)} ${E(t.name)}</div><div class="tiny mute">Market ${t.pop.toFixed(1)}M · Team ${str.toFixed(0)}</div></div></button>`;
    };
    const conf = c => [0, 1, 2].map(d => { const dv = c * 3 + d; return `<div class="eyebrow" style="margin:10px 0 6px">${DIVS[dv]}</div><div class="grid g2" style="gap:6px">${S.teams.filter(t => t.div === dv).map(card).join('')}</div>`; }).join('');
    let detail = '<div class="empty">Pick a franchise to see its situation.</div>';
    if (sel) {
      const ps = U.sortBy(roster(S, sel.tid), p => p.ovr);
      const rank = S.teams.map(t => ({ tid: t.tid, v: teamStrength(S, t.tid) })).sort((a, b) => b.v - a.v).findIndex(x => x.tid === sel.tid) + 1;
      detail = `<div class="row">${logo(sel, 72)}<div><div class="eyebrow">${CONFS[sel.conf]} · ${DIVS[sel.div]}</div><div style="font:800 30px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg)">${E(sel.region)} ${E(sel.name)}</div></div></div>
      <hr class="sep"><div class="kv">
        <span>Roster rank</span><span>${rank} of 30</span>
        <span>Market size</span><span>${sel.pop.toFixed(1)}M</span>
        <span>Payroll</span><span>${U.money(payroll(S, sel.tid))}</span>
        <span>Cash on hand</span><span>${U.money(sel.cash)}</span>
        <span>Arena</span><span>${E(sel.arena.name)} (${sel.arena.cap.toLocaleString()})</span>
        <span>Head coach</span><span>${E(staffName(sel.staff.hc))} (${staffOvr(sel.staff.hc)})</span>
      </div><hr class="sep"><div class="eyebrow" style="margin-bottom:6px">Key players</div>
      ${ps.slice(0, 5).map(p => `<div class="row between small" style="padding:3px 0"><span>${E(p.pos)} · ${E(pname(p))} <span class="mute">(${p.age})</span></span>${rt(p.ovr)}</div>`).join('')}`;
    }
    return `<div style="padding:24px max(16px, env(safe-area-inset-right,0px)) 40px max(16px, env(safe-area-inset-left,0px));max-width:1300px;margin:0 auto">
      ${pageHead('New Franchise', 'Choose the team you will own, run and coach.', btn('Back', 'go', 'ghost', { r: 'title' }))}
      <div class="grid g-main">
        <div class="grid g2">${panel('Eastern Conference', conf(0))}${panel('Western Conference', conf(1))}</div>
        <div class="stack">
          ${panel('Your Franchise', detail)}
          ${panel('League Settings', `<div class="stack">
            <label class="fld">Owner name<input type="text" id="ownerName" maxlength="28" value="${E(N.owner)}" data-i="setOwner"></label>
            <div class="fld">Difficulty ${seg('diff', DIFFS.map((d, i) => [i, d.n]), N.diff, 'setNew')}</div>
            <div class="fld">Season length ${seg('games', [[29, '29 games'], [58, '58 games'], [82, '82 games']], N.games, 'setNew')}</div>
            <label class="row small"><input type="checkbox" id="optInj" ${N.inj ? 'checked' : ''} data-c="setInj"> Injuries on</label>
            <label class="row small"><input type="checkbox" id="optFD" ${N.fd ? 'checked' : ''} data-c="setFD"> Fantasy draft — tear up every roster and draft a new league</label>
            <p class="tiny mute" style="margin:0">${DIFFS[N.diff].n}: ${['AI GMs are generous, free agents favor you, your team gets a small edge.', 'Balanced. The way the league was meant to be played.', 'Shrewd AI GMs and a tougher free-agent market.', 'Ruthless trades, skeptical free agents, and the bounces go against you.'][N.diff]}</p>
            ${btn('Start Franchise', 'startFranchise', 'gold lg')}
          </div>`)}
        </div>
      </div></div>`;
  },
};
Act.newFranchise = () => {
  busy('Building the league', 'Scouting 400 players…');
  setTimeout(() => {
    const S = newLeague({ userTid: 0 });
    App.newSetup = { S, tid: null, owner: 'You', diff: 1, games: 82, inj: true };
    busy(null);
    go('new');
  }, 30);
};
Act.pickTeam = el => { App.newSetup.tid = +el.dataset.tid; rerender(); };
Act.setOwner = el => { App.newSetup.owner = el.value; };
Act.setInj = el => { App.newSetup.inj = el.checked; };
Act.setFD = el => { App.newSetup.fd = el.checked; };
Act.setNew = el => { App.newSetup[el.dataset.t] = +el.dataset.k; rerender(); };
Act.startFranchise = async () => {
  const N = App.newSetup;
  if (N.tid == null) { toast('Pick a team first.', 'bad'); return; }
  const S = N.S;
  S.user = N.tid; S.ownerName = (N.owner || 'Owner').trim() || 'Owner'; S.diff = N.diff; S.settings.injuries = N.inj;
  if (S.settings.games !== N.games) { S.settings.games = N.games; S.nextGid = 1; genSchedule(S); }
  S.scout = { pts: scoutPoints(S), max: scoutPoints(S) };
  S.camp = { left: 4, log: [] };
  const t = S.teams[S.user];
  t.autoRot = true;
  inbox(S, { from: 'League Commissioner', subj: `Welcome to the ${LEAGUE.abbr}, ${S.ownerName}`, body: `Congratulations on your purchase of the ${tname(t)}. You'll make the calls on the floor, in the front office and in the owner's box. The fans of ${t.region} are watching.` });
  inbox(S, { from: `Coach ${staffName(t.staff.hc)}`, subj: 'Training camp is open', body: `We have ${S.camp.left} training camp sessions before the season. Run your young guys through drills (Team → Training Camp). When you're ready, hit Start Season.` });
  const ps = U.sortBy(roster(S, S.user), p => p.ovr);
  const exp = ps.filter(p => p.contract.exp === S.season && p.ovr >= 74)[0];
  if (exp) inbox(S, { from: `${pname(exp)}'s agent`, subj: 'Contract year', body: `${pname(exp)} is entering the final year of his deal. We're open to an extension (Roster → player card → Extend).` });
  if (N.fd) { startFantasyDraft(S); inbox(S, { from: 'League Commissioner', subj: 'Fantasy draft', body: 'Every player in the league is in the pool. Thirteen rounds, snake order. Build your team from scratch.' }); }
  radioShow(S);
  weeklyNews(S);
  App.newSetup = null;
  startWith(S, 'f' + Date.now());
  if (N.fd) go('fdraft');
  await saveNow(true);
  toast(`Welcome to ${t.region}, ${S.ownerName}!`, 'good');
};

// ---------- home ----------
Screens.home = {
  render() {
    const S = App.S, t = S.teams[S.user];
    const r = t.rec;
    const conf = standings(S, x => x.conf === t.conf);
    const crank = conf.indexOf(t) + 1;
    let main = '';
    if (S.phase === PH.REG || S.phase === PH.PO) main = nextGameCard(S);
    else main = phaseCard(S);
    let news = S.news.filter(n => n.imp >= 2 || (n.tids || []).includes(S.user)).slice(0, 6);
    if (news.length < 3) news = S.news.slice(0, 6);
    const msgs = S.inbox.slice(0, 4);
    const leaders = teamLeaders(S, S.user);
    const div = standings(S, x => x.div === t.div);
    const gp = r.w + r.l;
    const fin = t.fin;
    const snap = `<div class="row" style="gap:18px">
      <div><div class="eyebrow">Record</div><div class="big">${rec(t)}</div></div>
      <div><div class="eyebrow">${CONFS[t.conf]}</div><div class="big">${U.ord(crank)}</div></div>
      <div><div class="eyebrow">Streak</div><div class="big">${streakStr(t)}</div></div>
      <div><div class="eyebrow">Last 10</div><div class="big">${r.l10.filter(x => x).length}-${r.l10.filter(x => !x).length}</div></div>
    </div><hr class="sep">
    <div class="stack small">
      ${meter('Fan happiness', t.fan)}${meter('Hype', t.hype)}${meter('Team chemistry', teamChem(S, S.user))}
    </div><hr class="sep"><div class="kv small">
      <span>Point differential</span><span class="${r.pf - r.pa >= 0 ? 'good' : 'bad'}">${gp ? ((r.pf - r.pa) / gp >= 0 ? '+' : '') + ((r.pf - r.pa) / gp).toFixed(1) : '—'}</span>
      <span>Avg. attendance</span><span>${fin && fin.hg ? Math.round(fin.att / fin.hg).toLocaleString() + ' / ' + t.arena.cap.toLocaleString() : '—'}</span>
      <span>Profit this season</span><span>${fin ? U.money(ledgerTotal(fin.rev) - ledgerTotal(fin.exp)) : '—'}</span>
    </div>`;
    return `${pageHead('Franchise Central', `${E(S.ownerName)}, owner · ${phaseLine(S)}`)}
    <div class="grid g-main">
      <div class="stack">${main}
        ${panel('Headlines', news.length ? news.map(newsItem).join('') : '<div class="empty">Quiet around the league.</div>', { x: btn('Newsroom', 'go', 'sm ghost', { r: 'news' }) })}
      </div>
      <div class="stack">
        ${lastGameCard(S)}
        ${panel(`${E(t.name)} Snapshot`, snap)}
        ${panel('Inbox', msgs.length ? msgs.map(m => `<div class="inbox-item ${m.read ? '' : 'unread'}" style="padding:8px 4px"><div class="from">${E(m.from)}</div><div class="b small">${E(m.subj)}</div></div>`).join('') : '<div class="empty">No messages.</div>', { x: btn('Open', 'go', 'sm ghost', { r: 'inbox' }), flush: false })}
        ${panel('Team Leaders', leaders)}
        ${panel(`${DIVS[t.div]} Division`, sortTable('homeDiv', [
      { l: 'Team', f: x => `<span class="row tight">${logo(x, 20)} ${tlink(x)}</span>` }, { l: 'W', n: 1, f: x => x.rec.w }, { l: 'L', n: 1, f: x => x.rec.l },
      { l: 'GB', n: 1, f: x => { const g = gamesBack(div[0], x); return g ? g.toFixed(1) : '—'; } }, { l: 'Strk', f: x => streakStr(x) }], div, { rowCls: x => x.tid === S.user ? 'me' : '' }), { flush: true })}
      </div>
    </div>`;
  },
};
function lastGameCard(S) {
  const u = S.user;
  const games = S.sched.filter(g => g.hs != null && (g.h === u || g.a === u)).concat(S.playoffs ? S.playoffs.games.filter(g => g.h === u || g.a === u) : []);
  const g = games[games.length - 1];
  if (!g) return '';
  const home = g.h === u, opp = S.teams[home ? g.a : g.h];
  const us = home ? g.hs : g.as, them = home ? g.as : g.hs;
  const won = us > them;
  const b = S.box[g.gid];
  let top = '';
  if (b) { const T = b.teams.find(x => x.tid === u); const pl = T ? U.maxBy(T.ps, l => l.pts + (l.orb + l.drb) * 0.7 + l.ast * 0.8) : null; if (pl) top = `<div class="small mute" style="margin-top:6px">${E(pl.n)}: ${pl.pts} pts, ${pl.orb + pl.drb} reb, ${pl.ast} ast</div>`; }
  return panel('Last Game', `<div class="row between"><div class="row">${logo(opp, 36)}<div><div class="b">${home ? 'vs' : '@'} ${E(tname(opp))}</div><div class="small"><span class="b ${won ? 'good' : 'bad'}">${won ? 'W' : 'L'}</span> <span class="num">${us}-${them}${g.ot ? ' OT' : ''}</span></div></div></div>${b ? btn('Box', 'box', 'sm ghost', { gid: g.gid }) : ''}</div>${top}`);
}
function meter(label, v) { return `<div><div class="row between"><span class="mute">${label}</span><span class="num">${Math.round(v)}</span></div><div class="bar e"><i style="width:${U.clamp(v, 0, 100)}%"></i></div></div>`; }
function newsItem(n) {
  const S = App.S;
  const tl = (n.tids || []).slice(0, 2).map(tid => S.teams[tid] ? logo(S.teams[tid], 22) : '').join('');
  return `<div class="news-item"><div class="row tight" style="margin-bottom:2px">${tl}<span class="tiny mute">${dateLabel(S, n.d, n.ph)} · ${U.seasonLabel(n.s)}${n.by ? ' · ' + E(n.by) : ''}</span></div><h4>${E(n.h)}</h4><p>${E(n.b)}</p></div>`;
}
function teamLeaders(S, tid) {
  const ps = roster(S, tid).map(p => ({ p, pg: perGame(seasonTotals(p, S.season)) })).filter(x => x.pg.gp > 0);
  if (!ps.length) { const top = U.sortBy(roster(S, tid), p => p.ovr).slice(0, 4); return top.map(p => `<div class="row between small" style="padding:4px 0"><span>${plink(p)} <span class="mute">${p.pos}</span></span>${rt(p.ovr)}</div>`).join(''); }
  const cats = [['Points', 'ppg'], ['Rebounds', 'rpg'], ['Assists', 'apg'], ['Steals', 'spg'], ['Blocks', 'bpg']];
  return cats.map(([l, k]) => { const x = U.maxBy(ps, y => y.pg[k]); return `<div class="row between small" style="padding:4px 0"><span class="mute" style="width:72px">${l}</span><span class="grow">${plink(x.p)}</span><span class="num b">${x.pg[k].toFixed(1)}</span></div>`; }).join('');
}
function nextGameCard(S) {
  const g = userGameToday(S) || (S.phase === PH.REG ? nextGame(S, S.user) : null);
  const t = S.teams[S.user];
  const elim = S.phase === PH.PO && !S.playoffs.rounds[S.playoffs.round].some(x => (x.hi === S.user || x.lo === S.user) && x.winner == null);
  let body;
  if (S.allStar && !S.allStar.finished) body = `<div class="c" style="padding:12px"><div class="eyebrow">Midseason</div><div style="font:800 30px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg);margin:6px 0 12px">All-Star Weekend</div>${btn('Go to All-Star Weekend', 'goAllStar', 'gold lg')}</div>`;
  else if (g) {
    const H = S.teams[g.h], A = S.teams[g.a];
    const today = g.day === S.day || g.po;
    const sr = g.po ? seriesOf(S, g.h, g.a) : null;
    const side = (T, home) => `<div class="c" style="flex:1;min-width:0">${logo(T, 84)}<div style="font:800 22px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg);margin-top:6px">${E(T.region)}</div><div class="mute small">${E(T.name)} · ${rec(T)}</div><div class="tiny dim">${home ? 'HOME' : 'AWAY'}</div></div>`;
    body = `<div class="row" style="align-items:center;gap:6px">${side(A, false)}<div class="c" style="flex:none"><div style="font:800 28px/1 var(--f-disp);color:var(--gold);transform:skewX(-8deg)">@</div><div class="tiny mute" style="margin-top:6px">${g.po ? `${ROUND_NAMES[g.round]}<br>Game ${g.n} · ${S.teams[sr.hi].abbr} ${sr.w[0]}-${sr.w[1]}` : today ? 'Today' : 'Day ' + g.day}</div></div>${side(H, true)}</div>
    <hr class="sep"><div class="row" style="justify-content:center">${today ? `${btn('Play Game', 'gameDay', 'gold lg')}${btn('Quick Sim Day', 'simDay1', 'lg')}` : btn('Sim to Game Day', 'simTo', 'gold lg', { k: 'next' })}</div>`;
  } else if (elim) body = `<div class="c" style="padding:14px"><div class="eyebrow">Playoffs</div><p>Your season is over. The playoffs go on without you.</p></div>`;
  else body = '<div class="empty">No games scheduled.</div>';
  const sims = S.phase === PH.REG
    ? `${btn('Sim Day', 'simDay1', 'sm')}${btn('Sim Week', 'simN', 'sm', { n: 7 })}${btn('To Next Game', 'simTo', 'sm', { k: 'next' })}${S.day < S.allStarDay ? btn('To All-Star', 'simTo', 'sm', { k: 'allstar' }) : ''}${S.day <= S.deadlineDay ? btn('To Deadline', 'simTo', 'sm', { k: 'deadline' }) : ''}${btn('To Playoffs', 'simTo', 'sm', { k: 'end' })}`
    : `${btn('Sim Day', 'simDay1', 'sm')}${btn('Sim Round', 'simTo', 'sm', { k: 'round' })}${btn('Sim Playoffs', 'simTo', 'sm', { k: 'po' })}`;
  return panel(S.phase === PH.PO ? 'Playoffs' : 'Next Game', body + `<hr class="sep"><div class="row tight" style="justify-content:center">${sims}</div>`);
}
function phaseCard(S) {
  const t = S.teams[S.user];
  const big = (eyebrow, title, text, act) => `<div class="c" style="padding:14px 8px"><div class="eyebrow">${eyebrow}</div><div style="font:800 32px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg);margin:8px 0">${title}</div><p class="mute" style="max-width:52ch;margin:0 auto 14px">${text}</p>${act}</div>`;
  if (S.phase === PH.PRE && S.fdraft && !S.fdraft.done) return panel('Fantasy Draft', big('A brand-new league', 'Fantasy Draft', `Round ${S.fdraft.picks[S.fdraft.cur].rd} of 13. Every player in the league is up for grabs.`, btn('Enter the Draft', 'go', 'gold lg', { r: 'fdraft' })));
  if (S.phase === PH.PRE) {
    const iss = userRosterIssues(S);
    return panel('Preseason', big(U.seasonLabel(S.season), 'Training Camp', `${S.camp && S.camp.left ? `${S.camp.left} camp session${S.camp.left > 1 ? 's' : ''} left. Drill your players to boost their ratings. ` : 'Camp is done. '}Set your rotation and ticket prices before opening night.${iss.length ? `<br><span class="bad">${iss.join(' ')}</span>` : ''}`, `<div class="row" style="justify-content:center">${S.camp && S.camp.left ? btn('Training Camp', 'go', 'lg', { r: 'camp' }) : ''}${btn('Start Season', 'advStart', 'gold lg')}</div>`));
  }
  if (S.phase === PH.END) { const h = S.history[S.history.length - 1]; return panel('Season Complete', big(U.seasonLabel(S.season), `${E(h.champName)} win it all`, `Your ${t.name}: ${t.rec.w}-${t.rec.l}, ${PO_RESULT[h.user.po].toLowerCase()}.`, `<div class="row" style="justify-content:center">${btn('Season Review', 'go', 'lg', { r: 'review' })}${btn('Begin Offseason', 'advOffseason', 'gold lg')}</div>`)); }
  if (S.phase === PH.LOTTERY) return panel('Offseason', big('Offseason', 'Draft Lottery', 'Fourteen teams, one top pick. The ping-pong balls decide the order.', `<div class="row" style="justify-content:center">${btn('Progression Report', 'go', 'lg', { r: 'progress' })}${btn('Run Lottery', 'goLottery', 'gold lg')}</div>`));
  if (S.phase === PH.DRAFT) { const mine = S.draft.picks.filter(p => p.tid === S.user && !p.pid).map(p => '#' + p.pick).join(', '); return panel('Offseason', big(`${S.draft.year} Draft`, S.draft.done ? 'Draft Complete' : 'Draft Day', S.draft.done ? 'Your rookies are signed. Time to deal with expiring contracts.' : `Your picks: ${mine || 'none remaining'}.`, S.draft.done ? btn('Re-sign Players', 'advResign', 'gold lg') : btn('Enter Draft Room', 'goDraft', 'gold lg'))); }
  if (S.phase === PH.RESIGN) { const n = roster(S, S.user).filter(p => p.contract.exp <= S.season).length; return panel('Offseason', big('Contracts', 'Re-sign Players', `${n} of your players ${n === 1 ? 'has' : 'have'} expiring deals. Anyone you don't sign hits the open market.`, `<div class="row" style="justify-content:center">${btn('Negotiate', 'go', 'lg', { r: 'resign' })}${btn('Open Free Agency', 'advFA', 'gold lg')}</div>`)); }
  if (S.phase === PH.FA) { const mine = S.players.filter(p => p.tid === -1 && p.fa && p.fa.offers.some(o => o.tid === S.user)).length; return panel('Offseason', big(`Day ${Math.min(S.fa.day, S.fa.days)} of ${S.fa.days}`, 'Free Agency', `You have ${mine} pending offer${mine === 1 ? '' : 's'}. Cap room: ${U.money(capSpace(S, S.user))}. Players decide over the coming days — the best ones go fast.`, `<div class="row" style="justify-content:center">${btn('Free Agent Market', 'go', 'lg', { r: 'fa' })}${btn(advanceInfo(S).label, 'faNext', 'gold lg')}</div>`)); }
  return '';
}

// ---------- inbox ----------
Screens.inbox = {
  render() {
    const S = App.S;
    const items = S.inbox.map(m => {
      const a = m.act || {};
      let acts = '';
      if (!m.done && a.kind) {
        if (a.kind === 'pt') acts = `${btn('Promise minutes', 'inboxAct', 'gold sm', { id: m.id, c: 'promise' })}${btn('Earn it', 'inboxAct', 'sm', { id: m.id, c: 'earn' })}${btn('Trading block', 'inboxAct', 'sm ghost', { id: m.id, c: 'block' })}`;
        if (a.kind === 'tradereq') acts = `${btn('Sit down with him', 'inboxAct', 'gold sm', { id: m.id, c: 'talk' })}${btn('Put on trading block', 'inboxAct', 'sm', { id: m.id, c: 'block' })}`;
        if (a.kind === 'naming') acts = `${btn('Accept deal', 'inboxAct', 'gold sm', { id: m.id, c: 'accept' })}${btn('Decline', 'inboxAct', 'sm', { id: m.id, c: 'decline' })}`;
        if (a.kind === 'sponsor') acts = `${btn('Accept', 'inboxAct', 'gold sm', { id: m.id, c: 'accept' })}${btn('Decline', 'inboxAct', 'sm', { id: m.id, c: 'decline' })}`;
        if (a.kind === 'ext') acts = `${btn('Open negotiations', 'negotiateOpen', 'gold sm', { id: a.pid })}${btn('Not now', 'inboxAct', 'sm', { id: m.id, c: 'later' })}`;
        if (a.kind === 'offer') acts = `${btn('Accept trade', 'inboxAct', 'gold sm', { id: m.id, c: 'accept' })}${btn('Decline', 'inboxAct', 'sm', { id: m.id, c: 'decline' })}${a.oid ? btn('Counter in Trade Center', 'counterOffer', 'sm ghost', { id: a.oid }) : ''}`;
      }
      return `<div class="inbox-item ${m.read ? '' : 'unread'}"><div class="row between"><span class="from">${E(m.from)}</span><span class="tiny dim">${dateLabel(S, m.d)} · ${U.seasonLabel(m.s)}</span></div><h4>${E(m.subj)}</h4><div class="small">${E(m.body)}</div>${acts ? `<div class="row tight" style="margin-top:8px">${acts}</div>` : ''}${m.reply ? `<div class="small gold" style="margin-top:6px">↳ ${E(m.reply)}</div>` : ''}</div>`;
    }).join('');
    return `${pageHead('Inbox', `${unread(S)} unread`, btn('Mark all read', 'readAll', 'sm'))}${panel('Messages', items || '<div class="empty">No messages.</div>', { flush: true })}`;
  },
  after() { const S = App.S; setTimeout(() => { S.inbox.forEach(m => { if (!m.act || m.done) m.read = true; }); }, 50); },
};
Act.readAll = () => { App.S.inbox.forEach(m => m.read = true); rerender(); };
Act.inboxAct = el => { const msg = resolveInbox(App.S, +el.dataset.id, el.dataset.c); if (msg) toast(msg); autosave(); rerender(); };
Act.counterOffer = el => { const o = App.S.offers.find(x => x.id === +el.dataset.id); if (!o) { toast('Offer expired.'); return; } App.trade = { tid: o.tid, give: { pids: o.pids.slice(), picks: [] }, get: { pids: o.get.pids.slice(), picks: o.get.picks.slice() } }; go('trade'); };

// ---------- newsroom ----------
Screens.news = {
  render() {
    const S = App.S, t = S.teams[S.user];
    const tb = tabs('news', [['herald', 'The Hardwood Herald'], ['local', localPaper(t)], ['radio', RADIO.show], ['trans', 'Transactions']], 'herald');
    let body = '';
    if (tb.cur === 'herald') {
      const items = S.news.filter(n => n.type !== 'column' && n.type !== 'recap');
      const lead = items.slice().sort((a, b) => (b.imp - a.imp) || (b.id - a.id)).slice(0, 1)[0];
      body = `<div class="paper"><div class="mast"><h2>The Hardwood Herald</h2><div class="dt">${LEAGUE.name} · ${phaseLine(S)}</div></div>
        ${lead ? `<div class="lead"><div class="by">${dateLabel(S, lead.d, lead.ph)}</div><h3>${E(lead.h)}</h3><p>${E(lead.b)}</p></div><hr style="border:0;border-top:1px solid #1b1b1b">` : ''}
        <div class="cols">${items.filter(n => n !== lead).slice(0, 40).map(n => `<div class="art"><h4>${E(n.h)}</h4><p>${E(n.b)}</p><div class="by">${dateLabel(S, n.d, n.ph)}, ${U.seasonLabel(n.s)}</div></div>`).join('')}</div></div>`;
    } else if (tb.cur === 'local') {
      const items = S.news.filter(n => (n.tids || []).includes(S.user) || n.local);
      body = `<div class="paper"><div class="mast"><h2>${E(localPaper(t))}</h2><div class="dt">Sports · ${E(t.name)} coverage by ${E(beatWriter(t))}</div></div>
        <div class="cols">${items.slice(0, 50).map(n => `<div class="art"><h4>${E(n.h)}</h4><p>${E(n.b)}</p><div class="by">${n.by ? 'By ' + E(n.by) + ' · ' : ''}${dateLabel(S, n.d, n.ph)}, ${U.seasonLabel(n.s)}</div></div>`).join('') || '<p>No stories yet.</p>'}</div></div>`;
    } else if (tb.cur === 'radio') {
      const eps = S.radio;
      body = `<div class="row" style="margin-bottom:12px"><div><div class="eyebrow">${RADIO.station}</div><div style="font:800 26px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg)">${RADIO.show}</div><div class="small mute">with ${RADIO.host} and ${RADIO.cohost} · new episode every week</div></div></div>` +
        (eps.length ? eps.slice(0, 8).map((ep, i) => panel(`${E(ep.title)} <span class="mute small" style="font-family:var(--f-body);text-transform:none;letter-spacing:0">· ${dateLabel(S, ep.d, ep.ph)}, ${U.seasonLabel(ep.s)}</span>`, ep.lines.map(l => `<div class="radio-line ${l.who === RADIO.host.split(' ')[0] || l.who === RADIO.cohost.split(' ')[0] ? 'host' : ''}"><div class="who">${E(l.who)}</div><div>${E(l.text)}</div></div>`).join(''), { style: 'margin-bottom:12px' })).join('') : '<div class="empty">No episodes yet.</div>');
    } else {
      body = panel('Transaction Wire', sortTable('trans', [{ l: 'When', f: x => `<span class="tiny">${dateLabel(S, x.d, x.ph)} ${U.seasonLabel(x.s)}</span>` }, { l: 'Type', f: x => `<span class="chip">${E(x.type)}</span>` }, { l: 'Details', f: x => `<span style="white-space:normal">${E(x.text)}</span>` }], S.trans.slice(0, 200)), { flush: true });
    }
    return `${pageHead('Newsroom', 'Papers, talk radio and the transaction wire')}${tb.html}${body}`;
  },
};

// ---------- save ----------
Screens.save = {
  render() {
    const S = App.S;
    return `${pageHead('Save / Load', `Saves live in this browser${Store.mode === 'ls' ? ' (local storage)' : ''}. Export a file to back up or move a franchise.`)}
    <div class="grid g2">
      ${panel('This Franchise', `<p class="small mute">The game autosaves after every sim and transaction.</p><div class="row">${btn('Save Now', 'saveBtn', 'gold')}${btn('Export Save File', 'exportSave', '')}${btn('Quit to Title', 'quitTitle', 'ghost')}</div>`)}
      ${panel('Other Franchises', `<div class="row">${btn('Load Franchise', 'loadMenu', '')}<label class="btn" style="position:relative;overflow:hidden"><span>Import Save File</span><input type="file" accept=".json,application/json" data-c="importFile" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label></div>`)}
    </div>
    <div id="cloudSlot" style="margin-top:14px">${cloudPanel()}</div>`;
  },
  after() { cloudRefresh(); },
};
Act.saveBtn = () => saveNow(false);
Act.quitTitle = async () => { await saveNow(true); resetTransient(); App.S = null; App.slot = null; document.documentElement.removeAttribute('style'); go('title'); };
Act.exportSave = async () => {
  const S = App.S;
  const text = JSON.stringify(S);
  const t = S.teams[S.user];
  const filename = `hardwood-${t.abbr.toLowerCase()}-${S.season}.json`;
  const fallback = () => modal('Export Save', `<p class="small">Copy everything below into a text file named <b>${filename}</b>. Import it from the title screen.</p><textarea style="width:100%;height:240px;background:var(--panel2);color:var(--text);border:1px solid var(--line2)" readonly>${E(text)}</textarea>`, btn('Copy', 'copyExport', 'gold'), { size: 'md' });
  if (window.claude && window.claude.use) {
    let dl = null;
    try { dl = await window.claude.use('downloads'); } catch (e) { dl = null; }
    if (!dl) { fallback(); return; }
    try { await dl.save({ filename, data: new Blob([text], { type: 'application/json' }) }); toast('Save file exported.', 'good'); }
    catch (e) { if (e && e.code === 'declined') toast('Export cancelled.'); else fallback(); }
    return;
  }
  try {
    const blob = new Blob([text], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('Save file downloaded.', 'good');
  } catch (e) { fallback(); }
};
Act.copyExport = () => { const ta = $('#modal textarea'); if (!ta) return; try { navigator.clipboard.writeText(ta.value).then(() => toast('Copied.', 'good'), () => { ta.select(); toast('Press Ctrl/Cmd+C to copy.'); }); } catch (e) { ta.select(); } };

// ---------- help ----------
Screens.help = {
  bare: false,
  render() {
    const body = `
    <div class="grid g2">
    ${panel('The Job', `<p>You are the owner, general manager and head coach of a ${LEAGUE.name} franchise. Win games, keep the fans happy and keep the books in the black — season after season.</p>
      <p><b>The gold button</b> in the top bar always moves the franchise forward: start the season, play or sim today's game, run the lottery, open free agency.</p>`)}
    ${panel('Game Day', `<p>On game days choose <b>Play Game</b> to coach it live. Call an offensive set and defensive scheme, set the pace, burn timeouts and make substitutions. Calls apply from the next possession.</p>
      <p>Matchups matter: a zone dares bad shooters to beat you; the press feasts on shaky ball-handlers but tires your legs; feeding a hot hand works until the defense adjusts. Your assistant's <b>scouting report</b> on the pregame screen suggests calls. The opposing coach adjusts at quarter breaks and timeouts.</p>
      <p>Keys: <b>Space</b> pauses and resumes. Tap a player in your lineup, then a bench player, to sub.</p>`)}
    ${panel('Front Office', `<p><b>Trades</b>: build a package in the Trade Center. AI GMs value youth, upside and fair contracts, and contenders and rebuilders want different things. Over the cap, incoming salary must be within 125% of outgoing.</p>
      <p><b>Free agency</b> runs for ten days after re-signing. Players weigh money, years, winning, market, facilities and their role. Over the cap you get one mid-level exception per season plus minimum deals.</p>
      <p><b>Draft</b>: spend scouting points all season to see prospects clearly. Unscouted ratings are guesses.</p>`)}
    ${panel("Owner's Box", `<p>Set ticket, concession, merchandise and parking prices. High prices earn more per fan but empty seats and anger the radio callers. Upgrades boost revenue, development, health and home-court edge. Build a new arena — or move the team to a new city.</p>`)}
    ${panel('Training Camp', `<p>Before each season you get four camp sessions. Three drills are playable mini-games (Shooting: stop the meter in the green; Ball-Handling: repeat the combo; Defense: stay in front of the ball). Young players gain the most.</p>`)}
    ${panel('Players &amp; Morale', `<p>Players want minutes that fit their role, money that fits their value, and to win. Unhappy players play worse, gripe in your inbox and walk in free agency. Promises you make in the inbox are tracked.</p><p>You can move a player to a new position from his card; his overall is recalculated for that spot.</p>`)}
    ${panel('Extras', `<p><b>Fantasy draft</b>: tick it when starting a franchise to throw every player into one pool and draft a new league.</p><p><b>Retire numbers</b>: once a franchise great retires (four seasons with you, or a Hall of Famer), raise his banner from his player card.</p><p><b>All-Star Weekend</b>: if one of your players is in the Three-Point Shootout, you can shoot for him.</p>`)}
    </div>`;
    return App.S ? `${pageHead('How to Play')}${body}` : `<div style="padding:24px max(16px, env(safe-area-inset-right,0px)) 40px max(16px, env(safe-area-inset-left,0px));max-width:1100px;margin:0 auto">${pageHead('How to Play', '', btn('Back', 'go', 'ghost', { r: 'title' }))}${body}</div>`;
  },
};
Object.defineProperty(Screens.help, 'bare', { get() { return !App.S; } });
