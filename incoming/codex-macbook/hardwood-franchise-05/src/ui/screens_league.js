// ===== ui/screens_league.js — standings, stats, playoffs, history, All-Star, review =====
function standingsTable(S, list, id, opts = {}) {
  const lead = list[0];
  return sortTable(id, [
    { l: '#', f: x => list.indexOf(x) + 1 },
    { l: 'Team', f: x => `<span class="row tight">${logo(x, 22)} ${tlink(x, true)}${opts.seeds && list.indexOf(x) < 8 ? ` <span class="chip ${list.indexOf(x) < 8 ? 'good' : ''}">${list.indexOf(x) + 1}</span>` : ''}</span>` },
    { l: 'W', n: 1, f: x => x.rec.w }, { l: 'L', n: 1, f: x => x.rec.l }, { l: 'PCT', n: 1, f: x => U.fg(x.rec.w, x.rec.w + x.rec.l) },
    { l: 'GB', n: 1, f: x => { const g = gamesBack(lead, x); return g > 0 ? g.toFixed(1) : '—'; } },
    { l: 'Home', n: 1, f: x => `${x.rec.hw}-${x.rec.hl}` }, { l: 'Away', n: 1, f: x => `${x.rec.aw}-${x.rec.al}` },
    { l: 'Conf', n: 1, f: x => `${x.rec.cw}-${x.rec.cl}` }, { l: 'Div', n: 1, f: x => `${x.rec.dw}-${x.rec.dl}` },
    { l: 'PF', n: 1, f: x => x.rec.w + x.rec.l ? (x.rec.pf / (x.rec.w + x.rec.l)).toFixed(1) : '—' }, { l: 'PA', n: 1, f: x => x.rec.w + x.rec.l ? (x.rec.pa / (x.rec.w + x.rec.l)).toFixed(1) : '—' },
    { l: 'Diff', n: 1, f: x => { const g = x.rec.w + x.rec.l; if (!g) return '—'; const d = (x.rec.pf - x.rec.pa) / g; return `<span class="${d >= 0 ? 'good' : 'bad'}">${d >= 0 ? '+' : ''}${d.toFixed(1)}</span>`; } },
    { l: 'Strk', f: x => streakStr(x) }, { l: 'L10', f: x => `${x.rec.l10.filter(y => y).length}-${x.rec.l10.filter(y => !y).length}` },
  ], list, { rowCls: x => (x.tid === S.user ? 'me' : '') + (opts.seeds && list.indexOf(x) === 8 ? ' sep' : '') });
}
Screens.standings = {
  render() {
    const S = App.S;
    const tb = tabs('stand', [['conf', 'Conference'], ['div', 'Division'], ['league', 'League'], ['power', 'Power Rankings']], 'conf');
    let body = '';
    if (tb.cur === 'conf') body = [0, 1].map(c => panel(`${CONFS[c]}ern Conference`, standingsTable(S, confSeeds(S, c), 'sc' + c, { seeds: true }), { flush: true, style: 'margin-bottom:14px' })).join('') + '<p class="tiny mute">Top eight in each conference make the playoffs. Division winners are guaranteed a top-three seed.</p>';
    else if (tb.cur === 'div') body = `<div class="grid g2">${DIVS.map((d, i) => panel(d, standingsTable(S, standings(S, t => t.div === i), 'sd' + i), { flush: true })).join('')}</div>`;
    else if (tb.cur === 'league') body = panel('League', standingsTable(S, standings(S), 'sl'), { flush: true });
    else {
      const pr = S.power || powerRankings(S);
      body = panel('Power Rankings', sortTable('pw', [{ l: 'Rank', n: 1, f: x => `<b>${x.rank}</b>` }, { l: '', f: x => { const d = x.prev - x.rank; return d > 0 ? `<span class="good">▲${d}</span>` : d < 0 ? `<span class="bad">▼${-d}</span>` : '<span class="dim">—</span>'; } },
        { l: 'Team', f: x => `<span class="row tight">${logo(S.teams[x.tid], 22)} ${tlink(S.teams[x.tid], true)}</span>` }, { l: 'Record', f: x => rec(S.teams[x.tid]) }, { l: 'Top-8 OVR', n: 1, f: x => teamStrength(S, x.tid).toFixed(1) }], pr, { rowCls: x => x.tid === S.user ? 'me' : '' }), { flush: true });
    }
    return `${pageHead('Standings', phaseLine(S))}${tb.html}${body}`;
  },
};

Screens.stats = {
  render() {
    const S = App.S;
    const tb = tabs('stats', [['leaders', 'League Leaders'], ['races', 'Award Races'], ['players', 'Player Stats'], ['teams', 'Team Stats']], 'leaders');
    const po = S.playoffs && App.ui.statPO ? 1 : 0;
    const G = S.settings.games;
    const all = S.players.filter(p => p.tid >= 0).map(p => ({ p, t: seasonTotals(p, S.season, po) })).filter(x => x.t.gp > 0).map(x => Object.assign(x, { pg: perGame(x.t) }));
    const tgp = po ? Math.max(1, U.avg(S.teams.filter(t => S.playoffs && S.playoffs.seeds.flat().includes(t.tid)), t => S.playoffs.games.filter(g => g.h === t.tid || g.a === t.tid).length)) : Math.max(1, U.avg(S.teams, t => t.rec.w + t.rec.l));
    const minG = po ? 1 : Math.max(1, Math.floor(tgp * 0.5));
    let body = '';
    if (tb.cur === 'leaders') {
      const cats = [['Points', 'ppg', 1], ['Rebounds', 'rpg', 1], ['Assists', 'apg', 1], ['Steals', 'spg', 1], ['Blocks', 'bpg', 1], ['FG%', 'fgp', 3, x => x.t.fgm >= tgp * 3], ['3P%', 'tpp', 3, x => x.t.tpm >= tgp * 0.9], ['FT%', 'ftp', 3, x => x.t.ftm >= tgp * 1.5], ['Efficiency', 'eff', 1]];
      body = `<div class="grid g3">${cats.map(([l, k, d, q]) => {
        const list = U.sortBy(all.filter(x => x.t.gp >= minG && (!q || q(x))), x => x.pg[k]).slice(0, 8);
        return panel(l, list.map((x, i) => `<div class="row between small" style="padding:4px 0;${x.p.tid === S.user ? 'color:var(--gold2)' : ''}"><span class="dim" style="width:16px">${i + 1}</span>${logo(S.teams[x.p.tid], 18)}<span class="grow">${plink(x.p)}</span><span class="num b">${d === 3 ? U.fg(x.pg[k] * 1000, 1000) : x.pg[k].toFixed(1)}</span></div>`).join('') || '<div class="empty small">No qualifiers yet.</div>');
      }).join('')}</div>`;
    } else if (tb.cur === 'races') {
      const reg = S.players.filter(p => p.tid >= 0).map(p => { const t = seasonTotals(p, S.season, 0); return { p, t, pg: perGame(t), team: S.teams[p.tid] }; }).filter(x => x.t.gp >= Math.max(1, tgp * 0.4));
      const race = (title, list, val, fmt) => panel(title, list.slice(0, 6).map((x, i) => `<div class="row between small" style="padding:5px 0;${x.p.tid === S.user ? 'color:var(--gold2)' : ''}"><span class="dim" style="width:16px">${i + 1}</span>${logo(x.team, 18)}<span class="grow">${plink(x.p)} <span class="dim">${x.p.pos}</span></span><span class="num mute">${fmt(x)}</span></div>`).join('') || '<div class="empty small">Too early to tell.</div>');
      const line = x => `${x.pg.ppg.toFixed(1)}/${x.pg.rpg.toFixed(1)}/${x.pg.apg.toFixed(1)}`;
      body = `<div class="grid g3">
        ${race('Most Valuable Player', U.sortBy(reg, x => x.pg.eff * (0.72 + winPct(x.team.rec) * 0.56) + x.pg.ppg * 0.18), null, line)}
        ${race('Rookie of the Year', U.sortBy(reg.filter(x => x.p.yrsPro === 0), x => x.pg.eff + x.pg.ppg * 0.3), null, line)}
        ${race('Defensive Player', U.sortBy(reg, x => x.pg.spg * 2.2 + x.pg.bpg * 2.4 + x.pg.rpg * 0.35 + (x.p.r.pdf + x.p.r.idf) / 40 + winPct(x.team.rec) * 3), null, x => `${x.pg.spg.toFixed(1)} stl · ${x.pg.bpg.toFixed(1)} blk`)}
        ${race('Sixth Man', U.sortBy(reg.filter(x => x.t.gs < x.t.gp * 0.35), x => x.pg.ppg * 0.6 + x.pg.eff * 0.5), null, line)}
      </div><p class="tiny mute">Projected from current stats. Voters weigh team success for MVP.</p>`;
    } else if (tb.cur === 'players') {
      const f = App.ui.statTeam != null ? App.ui.statTeam : -9;
      const rows = all.filter(x => f === -9 || x.p.tid === f || (f === -8 && x.p.tid === S.user));
      body = `<div class="row" style="margin-bottom:10px"><select data-c="statTeam" aria-label="Filter by team"><option value="-9">All teams</option>${S.teams.map(t => `<option value="${t.tid}" ${f === t.tid ? 'selected' : ''}>${E(tname(t))}</option>`).join('')}</select></div>` + panel('Players', sortTable('pstats', [
        { l: 'Player', k: 'n', s: x => x.p.ln, f: x => plink(x.p) }, { l: 'Team', k: 't', s: x => S.teams[x.p.tid].abbr, f: x => S.teams[x.p.tid].abbr }, { l: 'Pos', k: 'pos', s: x => POS_IDX[x.p.pos], f: x => x.p.pos },
        ...[['GP', 'gp', 0], ['MPG', 'mpg', 1], ['PTS', 'ppg', 1], ['REB', 'rpg', 1], ['AST', 'apg', 1], ['STL', 'spg', 1], ['BLK', 'bpg', 1], ['TOV', 'tpg', 1]].map(([l, k, d]) => ({ l, k, n: 1, s: x => x.pg[k], f: x => d ? x.pg[k].toFixed(1) : x.pg[k] })),
        { l: 'FG%', k: 'fgp', n: 1, s: x => x.pg.fgp, f: x => U.fg(x.t.fgm, x.t.fga) }, { l: '3P%', k: 'tpp', n: 1, s: x => x.pg.tpp, f: x => U.fg(x.t.tpm, x.t.tpa) }, { l: 'FT%', k: 'ftp', n: 1, s: x => x.pg.ftp, f: x => U.fg(x.t.ftm, x.t.fta) }, { l: 'EFF', k: 'eff', n: 1, s: x => x.pg.eff, f: x => x.pg.eff.toFixed(1) },
      ], rows, { sort: { k: 'ppg', d: true }, maxh: 640, rowCls: x => x.p.tid === S.user ? 'me' : '' }), { flush: true });
    } else {
      const trows = S.teams.map(t => { const ps = S.players.filter(p => p.stats.some(r => r.s === S.season && r.tid === t.tid && r.po === po)); const tot = sumRows(ps.flatMap(p => p.stats.filter(r => r.s === S.season && r.tid === t.tid && r.po === po))); const g = Math.max(1, po ? (S.playoffs ? S.playoffs.games.filter(x => x.h === t.tid || x.a === t.tid).length : 1) : t.rec.w + t.rec.l); return { t, tot, g }; });
      body = panel('Team Stats (per game)', sortTable('tstats', [
        { l: 'Team', k: 'n', s: x => x.t.abbr, f: x => `<span class="row tight">${logo(x.t, 20)} ${tlink(x.t)}</span>` },
        ...[['PTS', 'pts'], ['REB', x => x.orb + x.drb], ['OREB', 'orb'], ['AST', 'ast'], ['STL', 'stl'], ['BLK', 'blk'], ['TOV', 'tov'], ['3PA', 'tpa'], ['FTA', 'fta']].map(([l, k]) => ({ l, k: l, n: 1, s: x => (typeof k === 'function' ? k(x.tot) : x.tot[k]) / x.g, f: x => ((typeof k === 'function' ? k(x.tot) : x.tot[k]) / x.g).toFixed(1) })),
        { l: 'FG%', k: 'fg', n: 1, s: x => x.tot.fgm / Math.max(1, x.tot.fga), f: x => U.fg(x.tot.fgm, x.tot.fga) }, { l: '3P%', k: 'tp', n: 1, s: x => x.tot.tpm / Math.max(1, x.tot.tpa), f: x => U.fg(x.tot.tpm, x.tot.tpa) },
        { l: 'OPP PTS', k: 'opp', n: 1, s: x => x.t.rec.pa / Math.max(1, x.t.rec.w + x.t.rec.l), f: x => (x.t.rec.pa / Math.max(1, x.t.rec.w + x.t.rec.l)).toFixed(1) },
      ], trows, { sort: { k: 'PTS', d: true }, rowCls: x => x.t.tid === S.user ? 'me' : '' }), { flush: true });
    }
    return `${pageHead('Stats & Leaders', `${U.seasonLabel(S.season)} ${po ? 'playoffs' : 'regular season'}`, S.playoffs ? seg('statpo', [[0, 'Regular season'], [1, 'Playoffs']], po, 'statPO') : '')}${tb.html}${body}`;
  },
};
Act.statTeam = el => { App.ui.statTeam = +el.value; rerender(); };
Act.statPO = el => { App.ui.statPO = +el.dataset.k; rerender(); };

Screens.playoffs = {
  render() {
    const S = App.S, PO = S.playoffs;
    if (!PO) return `${pageHead('Playoffs')}<div class="empty">The playoff bracket is set when the regular season ends.</div>`;
    const card = (sr, r) => {
      if (!sr) return `<div class="panel" style="padding:8px;min-height:62px;opacity:.4"><span class="small mute">TBD</span></div>`;
      const line = (tid, w, win) => `<div class="row between" style="padding:3px 0;${tid === S.user ? 'color:var(--gold2)' : ''}${sr.winner != null && !win ? ';opacity:.45' : ''}"><span class="row tight">${logo(S.teams[tid], 20)}<span class="dim tiny">${seedOf(S, tid)}</span> <b>${S.teams[tid].abbr}</b></span><span class="num b">${w}</span></div>`;
      return `<div class="panel" style="padding:8px 10px">${line(sr.hi, sr.w[0], sr.winner === sr.hi)}${line(sr.lo, sr.w[1], sr.winner === sr.lo)}</div>`;
    };
    const col = (r, conf) => { const rd = PO.rounds[r]; const list = rd ? rd.filter(x => x.conf === conf) : []; const n = [4, 2, 1][r]; const out = []; for (let i = 0; i < n; i++) out.push(card(list[i], r)); return `<div class="stack" style="justify-content:space-around;gap:10px">${out.join('')}</div>`; };
    const fin = PO.rounds[3] ? PO.rounds[3][0] : null;
    const champ = PO.champ != null ? S.teams[PO.champ] : null;
    return `${pageHead('Playoffs', `${U.seasonLabel(S.season)} · ${champ ? 'Champions crowned' : ROUND_NAMES[PO.round]}`)}
      ${champ ? `<div class="panel champ" style="margin-bottom:14px">${logo(champ, 90)}<div class="w">${E(tname(champ))}</div><div class="mute">${U.seasonLabel(S.season)} ${LEAGUE.abbr} Champions</div></div>` : ''}
      <div class="tw"><div style="display:grid;grid-template-columns:repeat(7,minmax(130px,1fr));gap:10px;min-width:960px;align-items:stretch">
        ${col(0, 0)}${col(1, 0)}${col(2, 0)}<div class="stack" style="justify-content:center"><div class="eyebrow c">Finals</div>${card(fin, 3)}</div>${col(2, 1)}${col(1, 1)}${col(0, 1)}
      </div></div>
      <div class="row between tiny mute" style="margin-top:6px"><span>◀ East</span><span>West ▶</span></div>
      ${panel('Recent Playoff Games', sortTable('pog', [{ l: 'Round', f: g => `${ROUND_NAMES[g.round]} G${g.n}` }, { l: 'Matchup', f: g => `${S.teams[g.a].abbr} ${g.as} @ ${S.teams[g.h].abbr} ${g.hs}${g.ot ? ' OT' : ''}` }, { l: '', f: g => S.box[g.gid] ? btn('Box', 'box', 'sm ghost', { gid: g.gid }) : '' }], PO.games.slice().reverse().slice(0, 30)), { flush: true, style: 'margin-top:14px' })}`;
  },
};

Screens.history = {
  render() {
    const S = App.S;
    const tb = tabs('hist', [['champs', 'Champions & Awards'], ['franchise', 'Your Franchise'], ['records', 'Record Book'], ['hof', 'Hall of Fame'], ['leaders', 'Career Leaders']], 'champs');
    let body = '';
    const nm = (pid, n) => pid != null && P(S, pid) ? `<a class="pl" data-a="player" data-id="${pid}">${E(n || pname(P(S, pid)))}</a>` : E(n || '—');
    if (tb.cur === 'champs') {
      body = panel('Season by Season', S.history.length ? sortTable('hc', [{ l: 'Season', f: h => U.seasonLabel(h.s) }, { l: 'Champion', f: h => `<span class="row tight">${logo(S.teams[h.champ], 20)} <b>${E(h.champName)}</b></span>` }, { l: 'Finals', f: h => `${h.series} over ${E(S.teams[h.runner].abbr)}` }, { l: 'Finals MVP', f: h => nm(h.fmvp, h.fmvpN) }, { l: 'MVP', f: h => nm(h.mvp, h.mvpN) }, { l: 'ROY', f: h => nm(h.roy, h.royN) }, { l: 'DPOY', f: h => nm(h.dpoy, h.dpoyN) }, { l: '6MOY', f: h => E(h.smoyN) }, { l: 'MIP', f: h => E(h.mipN) }, { l: 'Coach of the Year', f: h => h.coy ? `${E(h.coy.n)} (${S.teams[h.coy.tid].abbr})` : '' }], S.history.slice().reverse()) : '<div class="empty">History is written at the end of each season.</div>', { flush: true });
    } else if (tb.cur === 'franchise') {
      const t = S.teams[S.user];
      const titles = t.hist.filter(h => h.po === 5).length;
      body = `<div class="grid g4" style="margin-bottom:14px">${[['Seasons', t.hist.length], ['Titles', titles], ['Playoff trips', t.hist.filter(h => h.po > 0).length], ['All-time W-L', `${U.sum(t.hist, h => h.w)}-${U.sum(t.hist, h => h.l)}`]].map(([k, v]) => panel(k, `<div class="big">${v}</div>`)).join('')}</div>` +
        panel('Season Log', t.hist.length ? sortTable('fh', [{ l: 'Season', f: h => U.seasonLabel(h.s) }, { l: 'W-L', f: h => `${h.w}-${h.l}` }, { l: 'Seed', f: h => h.seed > 0 ? h.seed : '—' }, { l: 'Result', f: h => `<span class="${h.po === 5 ? 'gold b' : ''}">${PO_RESULT[h.po]}</span>` }, { l: 'Coach', f: h => E(h.coach) }, { l: 'Profit', n: 1, f: h => { const f = t.finHist.find(x => x.s === h.s); return f ? U.money(f.profit) : '—'; } }, { l: 'Attendance', n: 1, f: h => { const f = t.finHist.find(x => x.s === h.s); return f ? f.att.toLocaleString() : '—'; } }], t.hist.slice().reverse()) : '<div class="empty">Your first season is underway.</div>', { flush: true });
    } else if (tb.cur === 'records') {
      const R = S.records;
      const list = (title, arr, unit) => panel(title, arr.length ? arr.map((r, i) => `<div class="row between small" style="padding:4px 0"><span class="dim" style="width:18px">${i + 1}</span><span class="grow">${nm(r.pid, r.n)} <span class="mute tiny">${S.teams[r.tid] ? S.teams[r.tid].abbr : ''}${r.opp ? ' vs ' + r.opp : ''} · ${U.seasonLabel(r.s)}</span></span><span class="num b">${r.v}${unit || ''}</span></div>`).join('') : '<div class="empty small">—</div>');
      body = `<div class="eyebrow" style="margin-bottom:8px">Single game</div><div class="grid g3">${list('Points', R.game.pts)}${list('Rebounds', R.game.reb)}${list('Assists', R.game.ast)}</div>
        <div class="eyebrow" style="margin:16px 0 8px">Single season (per game)</div><div class="grid g3">${list('Points', R.season.ppg)}${list('Rebounds', R.season.rpg)}${list('Assists', R.season.apg)}</div>
        <div class="eyebrow" style="margin:16px 0 8px">Team</div><div class="grid g3">${panel('Most Wins', R.team.wins.map((r, i) => `<div class="row between small" style="padding:4px 0"><span class="dim" style="width:18px">${i + 1}</span><span class="grow">${E(r.n)} <span class="mute tiny">${U.seasonLabel(r.s)}</span></span><span class="num b">${r.v}-${r.l}</span></div>`).join('') || '<div class="empty small">—</div>')}</div>`;
    } else if (tb.cur === 'hof') {
      const list = S.hof.map(pid => P(S, pid)).filter(Boolean);
      body = panel('Hall of Fame', list.length ? list.map(p => { const c = careerTotals(p); return `<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><div>${plink(p)} <span class="chip gold">Class of ${p.hof}</span><div class="small mute">${p.pos} · ${p.yrsPro} seasons · ${c.pts.toLocaleString()} pts · ${(c.orb + c.drb).toLocaleString()} reb · ${c.ast.toLocaleString()} ast</div></div><div class="small">${p.awards.filter(a => a.t === 'MVP').length ? p.awards.filter(a => a.t === 'MVP').length + '× MVP · ' : ''}${p.awards.filter(a => a.t === 'CHAMP').length}× Champ · ${p.awards.filter(a => a.t === 'AS').length}× All-Star</div></div>`; }).join('') : '<div class="empty">Players become eligible three seasons after they retire.</div>');
    } else {
      const everyone = S.players.filter(p => p.tid >= -1).concat(S.retired);
      const cat = (l, f) => panel(l, U.sortBy(everyone, p => f(careerTotals(p))).slice(0, 10).map((p, i) => `<div class="row between small" style="padding:4px 0"><span class="dim" style="width:18px">${i + 1}</span><span class="grow">${nm(p.pid)} ${p.tid === -3 ? '<span class="tiny dim">ret.</span>' : ''}</span><span class="num b">${f(careerTotals(p)).toLocaleString()}</span></div>`).join(''));
      body = `<div class="grid g3">${cat('Points', c => c.pts)}${cat('Rebounds', c => c.orb + c.drb)}${cat('Assists', c => c.ast)}${cat('Steals', c => c.stl)}${cat('Blocks', c => c.blk)}${cat('3-Pointers', c => c.tpm)}</div>`;
    }
    return `${pageHead('History & Records', LEAGUE.name)}${tb.html}${body}`;
  },
};

// ---------- All-Star ----------
Screens.allstar = {
  render() {
    const S = App.S, A = S.allStar;
    if (!A) return `${pageHead('All-Star Weekend')}<div class="empty">All-Star Weekend arrives at the midseason break (Day ${S.allStarDay}).</div>`;
    const plist = (ids, starters) => ids.map(id => { const p = P(S, id); const pg = perGame(seasonTotals(p, S.season)); return `<div class="row between small" style="padding:4px 0;${p.tid === S.user ? 'color:var(--gold2)' : ''}">${logo(S.teams[p.tid], 18)}<span class="grow">${plink(p)} <span class="dim">${p.pos}</span>${starters && starters.includes(id) ? ' <span class="chip gold">Starter</span>' : ''}</span><span class="num mute">${pg.ppg.toFixed(1)}/${pg.rpg.toFixed(1)}/${pg.apg.toFixed(1)}</span></div>`; }).join('');
    const userIn3 = A.three.find(id => P(S, id).tid === S.user);
    const three = A.res.three ? `<div class="tw"><table class="t"><thead><tr><th>Shooter</th><th class="n">Round 1</th><th class="n">Final</th></tr></thead><tbody>${A.res.three.r1.slice().sort((a, b) => b.tot - a.tot).map(x => { const f = A.res.three.r2.find(y => y.pid === x.pid); return `<tr class="${x.pid === A.res.three.winner ? 'me' : ''}"><td>${plink(P(S, x.pid))}${x.pid === A.res.three.winner ? ' 🏆' : ''}</td><td class="n">${x.tot}</td><td class="n">${f ? f.tot : '—'}</td></tr>`; }).join('')}</tbody></table></div>`
      : `${plist(A.three)}<div class="row" style="margin-top:10px">${userIn3 ? btn(`Shoot for ${pshort(P(S, userIn3))}`, 'play3', 'gold', { id: userIn3 }) : ''}${btn('Sim Shootout', 'sim3', userIn3 ? '' : 'gold')}</div>`;
    const dunk = A.res.dunk ? A.res.dunk.r2.map(x => `<div style="padding:4px 0">${plink(P(S, x.pid))}${x.pid === A.res.dunk.winner ? ' 🏆' : ''} <span class="num b">${x.tot}</span><div class="tiny mute">${x.d.map(d => `${E(d.dunk)} (${d.s})`).join(' · ')}</div></div>`).join('') + `<div class="tiny mute" style="margin-top:6px">Round 1: ${A.res.dunk.r1.map(x => `${pshort(P(S, x.pid))} ${x.tot}`).join(', ')}</div>`
      : `${plist(A.dunk)}<div style="margin-top:10px">${btn('Sim Dunk Contest', 'simDunk', 'gold')}</div>`;
    const game = A.res.game ? `<div class="c"><div style="font:700 36px/1 var(--f-num)">EAST ${A.res.game.score[0]} – ${A.res.game.score[1]} WEST</div><p>MVP: ${plink(P(S, A.res.game.mvp))}</p>${btn('Box Score', 'asBox', 'sm ghost')}</div>` : `<div class="row" style="justify-content:center">${btn('Watch All-Star Game', 'asWatch', 'gold')}${btn('Sim Game', 'asSim', '')}</div>`;
    return `${pageHead('All-Star Weekend', `${U.seasonLabel(S.season)} midseason classic`, A.finished ? btn('Back to the Season', 'go', 'gold', { r: 'home' }) : btn('Sim Everything', 'asAll', ''))}
      <div class="grid g2">${panel('East All-Stars', plist(A.sel[0], A.starters[0]))}${panel('West All-Stars', plist(A.sel[1], A.starters[1]))}</div>
      <div class="grid g3" style="margin-top:14px">${panel('Three-Point Shootout', three)}${panel('Slam Dunk Contest', dunk)}${panel('All-Star Game', game)}</div>`;
  },
};
Act.sim3 = () => { threeContest(App.S); autosave(); rerender(); };
Act.simDunk = () => { dunkContest(App.S); autosave(); rerender(); };
const clearASGame = () => { if (App.game && App.game.o.allstar) App.game = null; };
Act.asSim = () => { clearASGame(); const sim = allStarGame(App.S); sim.simToEnd(); allStarFinish(App.S, sim); autosave(); rerender(); };
Act.asAll = () => { clearASGame(); allStarAuto(App.S); autosave(); rerender(); };
Act.asWatch = () => { const sim = allStarGame(App.S); App.game = null; go('game', { allstar: 1 }); startGameView(sim, { allstar: true, watch: true }); };
Act.asBox = () => { const b = App.S.allStar.res.game.box; App.S.box[-1] = Object.assign({}, b, { teams: b.teams.map((t, i) => Object.assign({}, t, { tid: -1 })) }); openAllStarBox(b); };
function openAllStarBox(b) {
  const S = App.S;
  const mk = i => ({ abbr: i === 0 ? 'EAST' : 'WEST', tid: i === 0 ? 0 : 3, c1: i === 0 ? '#1f4e8c' : '#8c1f2f', c2: '#ffffff', region: i === 0 ? 'East' : 'West', name: 'All-Stars' });
  modal('All-Star Game', `<div class="c big" style="margin-bottom:10px">EAST ${b.score[0]} – ${b.score[1]} WEST</div>${[0, 1].map(i => `<div class="eyebrow" style="margin:12px 0 6px">${mk(i).abbr}</div>${boxTable(S, b.teams[i], b)}`).join('')}`, '', {});
}
Act.play3 = el => {
  const S = App.S, pid = +el.dataset.id, p = P(S, pid);
  MiniGames.shoot(p, (grade, detail) => {
    const r1 = { pid, racks: detail.racks, tot: detail.tot };
    const others = S.allStar.three.filter(id => id !== pid).map(id => threeRound(P(S, id)));
    const all = others.concat([r1]).sort((a, b) => b.tot - a.tot);
    const inFinal = all.slice(0, 3).some(x => x.pid === pid);
    const done = (r2u) => {
      threeContest(S, { r1: Object.fromEntries(all.map(x => [x.pid, x])), r2: r2u ? { [pid]: r2u } : {} });
      autosave(); rerender();
      const w = S.allStar.res.three.winner;
      toast(w === pid ? `${pname(p)} wins the Shootout!` : `${pname(P(S, w))} wins the Shootout.`, w === pid ? 'good' : '');
    };
    if (!inFinal) { modal('Shootout', `<p>${E(pname(p))} scored ${r1.tot} and missed the final round (cutoff: ${all[2].tot}).</p>`, btn('Continue', 'closeModal', 'gold'), { size: 'sm', onClose: () => done(null) }); return; }
    modal('Final Round!', `<p>${E(pname(p))} scored ${r1.tot} and made the final three. Shoot again for the title.</p>`, btn('Shoot the Final', 'closeModal', 'gold'), { size: 'sm', onClose: () => setTimeout(() => MiniGames.shoot(p, (g2, d2) => done({ pid, racks: d2.racks, tot: d2.tot }), { contest: true }), 50) });
  }, { contest: true });
};

// ---------- season review & progression ----------
Screens.review = {
  render() {
    const S = App.S;
    const h = S.history.filter(x => x.s === S.season)[0] || S.history[S.history.length - 1];
    if (!h) return `${pageHead('Season Review')}<div class="empty">No completed season yet.</div>`;
    const A = S.seasonAwards || {};
    const t = S.teams[S.user];
    const champ = S.teams[h.champ];
    const fh = t.finHist.find(f => f.s === h.s);
    const aw = (l, pid) => pid != null && P(S, pid) ? `<div class="row between small" style="padding:5px 0;border-bottom:1px solid var(--line)"><span class="mute">${l}</span><span>${plink(P(S, pid))} <span class="dim">${P(S, pid).tid >= 0 ? S.teams[P(S, pid).tid].abbr : ''}</span></span></div>` : '';
    const teamList = (ids) => ids.map(id => plink(P(S, id), true)).join(', ');
    return `${pageHead('Season Review', U.seasonLabel(h.s), S.phase === PH.END ? btn('Begin Offseason', 'advOffseason', 'gold') : '')}
      <div class="panel champ" style="margin-bottom:14px">${logo(champ, 96)}<div class="w">${E(h.champName)}</div><div class="mute">beat the ${E(S.teams[h.runner].name)} ${h.series} · Finals MVP ${E(h.fmvpN)}</div></div>
      <div class="grid g3">
        ${panel('Your Season', `<div class="big">${h.user.w}-${h.user.l}</div><p class="${h.user.po === 5 ? 'gold b' : 'mute'}">${PO_RESULT[h.user.po]}</p>${fh ? `<div class="kv small"><span>Revenue</span><span>${U.money(ledgerTotal(fh.rev))}</span><span>Expenses</span><span>${U.money(ledgerTotal(fh.exp))}</span><span>Profit</span><span class="${fh.profit >= 0 ? 'good' : 'bad'}">${U.money(fh.profit)}</span><span>Avg. attendance</span><span>${fh.att.toLocaleString()}</span><span>Fan happiness</span><span>${fh.fan}</span></div>` : ''}`)}
        ${panel('Major Awards', aw('Most Valuable Player', A.mvp) + aw('Defensive Player', A.dpoy) + aw('Rookie of the Year', A.roy) + aw('Sixth Man', A.smoy) + aw('Most Improved', A.mip) + (A.coy ? `<div class="row between small" style="padding:5px 0"><span class="mute">Coach of the Year</span><span>${E(A.coy.n)} <span class="dim">${S.teams[A.coy.tid].abbr}</span></span></div>` : ''))}
        ${panel('Stat Champions', aw('Points', A.lead && A.lead.pts) + aw('Rebounds', A.lead && A.lead.reb) + aw('Assists', A.lead && A.lead.ast) + aw('Steals', A.lead && A.lead.stl) + aw('Blocks', A.lead && A.lead.blk))}
      </div>
      ${A.all ? `<div class="grid g3" style="margin-top:14px">${A.all.map((tm, i) => panel(`All-League ${U.ord(i + 1)} Team`, `<div class="small">${teamList(tm)}</div>`)).join('')}</div>
      <div class="grid g3" style="margin-top:14px">${A.alld.map((tm, i) => panel(`All-Defense ${U.ord(i + 1)} Team`, `<div class="small">${teamList(tm)}</div>`)).join('')}${panel('All-Rookie Team', `<div class="small">${teamList(A.allr)}</div>`)}</div>` : ''}`;
  },
};
Screens.progress = {
  render() {
    const S = App.S;
    const rep = S.progReport || [];
    return `${pageHead('Progression Report', 'How your players developed over the offseason', btn('Draft Lottery ▸', 'goLottery', 'gold'))}
      ${panel('Your Roster', sortTable('prog', [{ l: 'Player', f: r => `<a class="pl" data-a="player" data-id="${r.pid}">${E(r.n)}</a>` }, { l: 'Pos', f: r => r.pos }, { l: 'Age', n: 1, f: r => r.age + 1 }, { l: 'Before', c: 1, f: r => rt(r.before) }, { l: 'After', c: 1, f: r => rt(r.after) },
      { l: 'Change', n: 1, k: 'd', s: r => r.after - r.before, f: r => { const d = r.after - r.before; return `<span class="b ${d > 0 ? 'good' : d < 0 ? 'bad' : 'mute'}">${d > 0 ? '+' : ''}${d}</span>`; } }], rep), { flush: true })}
      <p class="tiny mute">Development depends on age, potential, minutes played, your coaching staff and practice facility.</p>
      ${panel('Retirements Around the League', S.news.filter(n => n.type === 'retire' && n.s === S.season).map(newsItem).join('') || '<div class="empty small">No notable retirements.</div>', { style: 'margin-top:14px' })}`;
  },
};
