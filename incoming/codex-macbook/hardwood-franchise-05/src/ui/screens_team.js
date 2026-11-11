// ===== ui/screens_team.js — roster, player card, rotation, schedule, box scores, camp =====
function rosterCols(S, mode, own) {
  const name = { l: 'Player', k: 'name', s: p => p.ln, f: p => `<span class="row tight">${plink(p)}${injChip(p)}${S.tradeBlock.includes(p.pid) ? '<span class="chip warn" title="On trading block">TB</span>' : ''}</span>` };
  const base = [{ l: '#', k: 'num', n: 1, f: p => p.num }, name, { l: 'Pos', k: 'pos', s: p => POS_IDX[p.pos], f: p => p.pos }, { l: 'Age', k: 'age', n: 1, f: p => p.age }, { l: 'OVR', k: 'ovr', c: 1, f: p => rt(p.ovr) }, { l: 'POT', k: 'pot', c: 1, s: p => Math.max(p.pot, p.ovr), f: p => potStr(S, p) }];
  if (mode === 'stats') {
    const pg = p => p._pg || (p._pg = perGame(seasonTotals(p, S.season, S.phase === PH.PO ? 1 : 0)));
    return base.slice(0, 5).concat([['GP', 'gp', 0], ['MPG', 'mpg', 1], ['PTS', 'ppg', 1], ['REB', 'rpg', 1], ['AST', 'apg', 1], ['STL', 'spg', 1], ['BLK', 'bpg', 1], ['TOV', 'tpg', 1]].map(([l, k, d]) => ({ l, k, n: 1, s: p => pg(p)[k], f: p => d ? pg(p)[k].toFixed(1) : pg(p)[k] })).concat([
      { l: 'FG%', k: 'fgp', n: 1, s: p => pg(p).fgp, f: p => U.fg(pg(p).fgp * 1000, 1000) }, { l: '3P%', k: 'tpp', n: 1, s: p => pg(p).tpp, f: p => U.fg(pg(p).tpp * 1000, 1000) }, { l: 'FT%', k: 'ftp', n: 1, s: p => pg(p).ftp, f: p => U.fg(pg(p).ftp * 1000, 1000) }]));
  }
  if (mode === 'contract') return base.concat([
    { l: 'Salary', k: 'sal', n: 1, s: p => p.contract.amt, f: p => U.money(p.contract.amt) }, { l: 'Thru', k: 'exp', n: 1, s: p => p.contract.exp, f: p => U.seasonLabel(p.contract.exp) },
    { l: 'Value', k: 'val', n: 1, s: p => marketSalary(S, p), f: p => U.money(marketSalary(S, p)) }, { l: 'Morale', k: 'morale', s: p => p.morale, f: p => moodIcon(p.morale) },
    { l: 'Type', k: 'pers', s: p => p.pers, f: p => `<span class="small">${PERSONALITIES[p.pers].n}</span>` }, { l: 'Role', k: 'role', s: p => p.ovr, f: p => `<span class="small mute">${roleName(teamRanks(S, p.tid)[p.pid])}</span>` }]);
  return base.concat([{ l: 'Ht', k: 'hgt', n: 1, f: p => U.hgt(p.hgt) }].concat(['ins', 'mid', 'tpt', 'pas', 'bhd', 'drb', 'pdf', 'idf', 'spd'].map(k => ({ l: RSHORT[k], k, n: 1, tip: RLONG[k], s: p => p.r[k], f: p => p.r[k] }))))
    .concat([{ l: 'Salary', k: 'sal', n: 1, s: p => p.contract.amt, f: p => contractStr(S, p) }, { l: 'Mood', k: 'morale', c: 1, s: p => p.morale, f: p => `<span title="${moodWord(p.morale)}" class="${p.morale >= 65 ? 'good' : p.morale >= 40 ? 'warn' : 'bad'}">●</span>` }]);
}
function rosterTable(S, tid, id) {
  const ps = roster(S, tid);
  ps.forEach(p => delete p._pg);
  const tb = tabs(id + 'm', [['ratings', 'Ratings'], ['stats', 'Stats'], ['contract', 'Contracts']], 'ratings');
  return tb.html + sortTable(id + tb.cur, rosterCols(S, tb.cur, tid === S.user), ps, { sort: { k: 'ovr', d: true } });
}
Screens.roster = {
  render() {
    const S = App.S, t = S.teams[S.user];
    const n = roster(S, S.user).length;
    const pay = payroll(S, S.user);
    const dead = U.sum(t.dead.filter(d => d.exp >= S.season), d => d.amt);
    return `${pageHead('Roster', `${n} players · Payroll ${U.money(pay)}${dead ? ` (incl. ${U.money(dead)} dead money)` : ''} · Cap ${U.money(S.cap)} · Tax line ${U.money(S.tax)}`, `${btn('Rotation', 'go', '', { r: 'rotation' })}${btn('Sign Free Agents', 'go', 'gold', { r: 'fa' })}`)}
      ${userRosterIssues(S).map(x => `<div class="chip bad" style="margin-bottom:10px">${x}</div>`).join('')}
      ${panel(`${E(tname(t))}`, rosterTable(S, S.user, 'ros'), { flush: true })}
      <p class="tiny mute">Click a player for his full card: ratings, career stats, contract actions and the trading block.</p>`;
  },
};
Screens.team = {
  render(prm) {
    const S = App.S, t = S.teams[prm.tid != null ? prm.tid : S.user];
    if (t.tid === S.user) return Screens.roster.render();
    const st = t.staff;
    return `${pageHead(`<span style="display:inline-flex;vertical-align:middle;margin-right:8px">${logo(t, 44)}</span>${E(tname(t))}`, `${rec(t)} · ${CONFS[t.conf]} ${DIVS[t.div]} · ${teamMode(S, t.tid) === 'contend' ? 'Contending' : teamMode(S, t.tid) === 'rebuild' ? 'Rebuilding' : 'Middle of the pack'} · Payroll ${U.money(payroll(S, t.tid))}`, btn('Propose Trade', 'tradeWith', 'gold', { tid: t.tid }))}
      <div class="grid g-main"><div>${panel('Roster', rosterTable(S, t.tid, 'tm'), { flush: true })}</div>
      <div class="stack">${panel('Front Office', `<div class="kv small"><span>Head coach</span><span>${E(staffName(st.hc))} (${staffOvr(st.hc)})</span><span>Arena</span><span>${E(t.arena.name)}</span><span>Capacity</span><span>${t.arena.cap.toLocaleString()}</span><span>Market</span><span>${t.pop.toFixed(1)}M</span><span>Hype</span><span>${Math.round(t.hype)}</span><span>Defense</span><span>${DEF_SCHEMES[t.strat.def].n}</span><span>Pace</span><span>${PACES[t.strat.pace]}</span></div>`)}
      ${panel('Team History', t.hist.length ? sortTable('th' + t.tid, [{ l: 'Season', f: h => U.seasonLabel(h.s) }, { l: 'W-L', f: h => `${h.w}-${h.l}` }, { l: 'Result', f: h => `<span class="${h.po === 5 ? 'gold b' : ''}">${PO_RESULT[h.po]}</span>` }], t.hist.slice().reverse()) : '<div class="empty">First season.</div>', { flush: true })}
      ${panel('Draft Picks', S.picks.filter(k => k.tid === t.tid).sort((a, b) => a.year - b.year || a.rd - b.rd).map(k => `<span class="chip" style="margin:2px">${E(pickLabel(S, k))}</span>`).join('') || '<span class="mute small">None</span>')}
      </div></div>`;
  },
};
Act.tradeWith = el => { App.trade = { tid: +el.dataset.tid, give: { pids: [], picks: [] }, get: { pids: [], picks: [] } }; go('trade'); };

// ---------- player card ----------
Act.player = el => openPlayer(+el.dataset.id);
function openPlayer(pid) {
  const S = App.S, p = P(S, pid);
  if (!p) return;
  const t = p.tid >= 0 ? S.teams[p.tid] : null;
  const retireBtn = canRetireNum(S, p) ? btn(`Retire #${p.num} in ${E(S.teams[S.user].region)}`, 'retireNum', 'gold', { id: p.pid }) : '';
  if (!p.r) { modal(E(pname(p)), `<p class="mute">Retired ${p.retired}. Career: ${careerTotals(p).pts.toLocaleString()} points in ${careerTotals(p).gp} games.</p>${careerTable(S, p)}`, retireBtn, { size: 'md' }); return; }
  const ranks = t ? teamRanks(S, t.tid) : {};
  const pr = perceived(S, p);
  const scoutedHide = p.tid === -2 && (p.slvl || 0) < 2;
  const bars = RGROUPS.map(([g, ks]) => `<div><div class="eyebrow" style="margin:8px 0 4px">${g}</div>${ks.map(k => { const v = scoutedHide ? null : p.r[k]; return `<div class="rbar"><span class="mute">${RLONG[k]}</span><span class="num b">${v == null ? '??' : v}</span><div class="bar"><i style="width:${v == null ? 0 : v}%;background:${v >= 85 ? 'var(--gold)' : v >= 70 ? 'var(--good)' : v >= 55 ? 'var(--info)' : 'var(--bad)'}"></i></div></div>`; }).join('')}</div>`).join('');
  const aw = {};
  p.awards.forEach(a => { (aw[a.t] = aw[a.t] || []).push(a.s); });
  const awards = Object.keys(aw).sort((a, b) => aw[b].length - aw[a].length).map(k => `<span class="chip gold" title="${aw[k].map(U.seasonLabel).join(', ')}">${aw[k].length > 1 ? aw[k].length + '× ' : ''}${AWARD_NAMES[k] || k}</span>`).join(' ');
  const own = p.tid === S.user;
  const actions = [];
  if (own) {
    actions.push(`<label class="row tight small" style="margin-right:auto">Position <select data-c="setPos" data-id="${p.pid}" aria-label="Change position">${POSS.map(x => `<option value="${x}" ${x === p.pos ? 'selected' : ''}>${x} (${calcOvr(p.r, x)})</option>`).join('')}</select></label>`);
    actions.push(btn(S.tradeBlock.includes(p.pid) ? 'Remove from Block' : 'Add to Trading Block', 'toggleBlock', '', { id: p.pid }));
    if (canExtend(S, p)) actions.push(btn('Extend Contract', 'negotiateOpen', 'gold', { id: p.pid }));
    if (S.phase === PH.RESIGN && p.contract.exp <= S.season) actions.push(btn('Negotiate', 'negotiateOpen', 'gold', { id: p.pid }));
    actions.push(btn('Release', 'releaseAsk', 'red', { id: p.pid }));
  } else if (p.tid >= 0) actions.push(btn('Trade For', 'tradeFor', 'gold', { id: p.pid }));
  else if (p.tid === -1) actions.push(btn('Make Offer', 'faOfferOpen', 'gold', { id: p.pid }));
  else if (retireBtn) actions.push(retireBtn);
  const spark = p.hist.length > 1 ? sparkline(p.hist.map(h => h.ovr).concat([p.ovr])) : '';
  const body = `<div class="pc-top">
      <div class="pc-num">${p.tid >= 0 ? '#' + p.num : ''}</div>
      <div style="min-width:0"><div class="row tight">${t ? logo(t, 26) : ''}<span class="eyebrow">${t ? E(tname(t)) : p.tid === -1 ? 'Free Agent' : p.tid === -2 ? `${p.dyear} Draft Prospect` : 'Retired'}</span></div>
        <div class="small mute" style="margin-top:4px">${p.pos} · ${E(p.arch)} · ${U.hgt(p.hgt)}, ${p.wgt} lbs · Age ${p.age} · ${E(p.college)}${p.country !== 'USA' ? '' : ''}</div>
        <div class="row tight" style="margin-top:6px"><span class="chip" title="${E(PERSONALITIES[p.pers].d)}">${PERSONALITIES[p.pers].n}</span>${moodIcon(p.morale)}${injChip(p)}${t ? `<span class="chip">${roleName(ranks[p.pid])}</span>` : ''}${p.draft && p.draft.rd ? `<span class="chip">${p.draft.year} R${p.draft.rd} #${p.draft.pick}</span>` : ''}</div></div>
      <div class="pc-ovr"><div class="eyebrow">Overall</div><div class="v">${scoutedHide ? `~${pr.ovr}` : p.ovr}</div><div class="small">Potential ${gradeChip(potGrade(Math.max(scoutedHide ? pr.pot : p.pot, scoutedHide ? pr.ovr : p.ovr)))}</div></div>
    </div>
    ${awards ? `<div class="row tight" style="margin-top:10px">${awards}</div>` : ''}
    <div class="grid g2" style="margin-top:12px"><div>${bars}</div><div class="stack">
      ${panel('Contract', p.tid >= 0 ? `<div class="kv small"><span>Salary</span><span>${U.money(p.contract.amt)}</span><span>Through</span><span>${U.seasonLabel(p.contract.exp)}</span><span>Market value</span><span>${U.money(marketSalary(S, p))}</span>${p.contract.next ? `<span>Extension</span><span class="gold">${U.money(p.contract.next)} from ${U.seasonLabel(S.season + 1)}</span>` : ''}${p.contract.rookie ? '<span>Type</span><span>Rookie scale</span>' : ''}${p.contract.ng ? '<span>Guaranteed</span><span>No</span>' : ''}</div>` : p.tid === -1 ? `<div class="kv small"><span>Asking</span><span>${U.money((p.ask || contractAsk(S, p, -1)).amt)} × ${(p.ask || contractAsk(S, p, -1)).yrs}</span></div>` : '<span class="mute small">—</span>')}
      ${spark ? panel('Overall by Season', spark) : ''}
      ${p.tid === -2 ? panel('Combine', combineHtml(p)) : ''}
    </div></div>
    <div style="margin-top:14px">${careerTable(S, p)}</div>`;
  modal(`${E(pname(p))}`, body, actions.join(''), { size: '' });
}
function sparkline(vals) {
  const w = 300, h = 90, mn = Math.min(...vals) - 2, mx = Math.max(...vals) + 2;
  const pts = vals.map((v, i) => [10 + i * (w - 20) / Math.max(1, vals.length - 1), h - 12 - (v - mn) / (mx - mn) * (h - 24)]);
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Overall rating history"><path d="M${pts.map(p => p.join(',')).join(' L')} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h}Z" fill="rgba(255,182,39,.12)"/><polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="#ffb627" stroke-width="2"/>${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 4 : 2.5}" fill="#ffb627"/><text x="${p[0]}" y="${p[1] - 7}" fill="#e8eef8" font-size="10" text-anchor="middle" font-family="Chakra Petch, monospace">${vals[i]}</text>`).join('')}</svg>`;
}
function combineHtml(p) {
  const r = p.r;
  const ws = p.hgt + Math.round((r.blk - 50) / 12 + (r.idf - 50) / 20 + 3);
  return `<div class="kv small"><span>Height (shoes)</span><span>${U.hgt(p.hgt + 1)}</span><span>Wingspan</span><span>${U.hgt(ws)}</span><span>Max vertical</span><span>${(26 + (r.jmp - 40) * 0.28).toFixed(1)}"</span><span>Lane agility</span><span>${(12.4 - (r.spd - 40) * 0.025).toFixed(2)}s</span><span>3/4 sprint</span><span>${(3.62 - (r.spd - 40) * 0.006).toFixed(2)}s</span><span>Bench (185 lb)</span><span>${Math.max(0, Math.round((r.str - 30) / 4))} reps</span></div>`;
}
function careerTable(S, p) {
  const rows = p.stats.slice().sort((a, b) => a.s - b.s || a.po - b.po);
  if (!rows.length) return '<div class="empty small">No games played yet.</div>';
  const cols = [{ l: 'Season', f: r => r.s ? U.seasonLabel(r.s) + (r.po ? ' <span class="chip">PO</span>' : '') : 'Career' + (r.po ? ' (PO)' : '') }, { l: 'Team', f: r => r.tid >= 0 && S.teams[r.tid] ? S.teams[r.tid].abbr : '—' },
  { l: 'GP', n: 1, f: r => r.gp }, { l: 'GS', n: 1, f: r => r.gs }, { l: 'MPG', n: 1, f: r => (r.min / r.gp).toFixed(1) }, { l: 'PTS', n: 1, f: r => (r.pts / r.gp).toFixed(1) }, { l: 'REB', n: 1, f: r => ((r.orb + r.drb) / r.gp).toFixed(1) },
  { l: 'AST', n: 1, f: r => (r.ast / r.gp).toFixed(1) }, { l: 'STL', n: 1, f: r => (r.stl / r.gp).toFixed(1) }, { l: 'BLK', n: 1, f: r => (r.blk / r.gp).toFixed(1) }, { l: 'FG%', n: 1, f: r => U.fg(r.fgm, r.fga) }, { l: '3P%', n: 1, f: r => U.fg(r.tpm, r.tpa) }, { l: 'FT%', n: 1, f: r => U.fg(r.ftm, r.fta) }];
  const reg = careerTotals(p, 0);
  const all = rows.filter(r => r.gp > 0).concat(reg.gp && rows.some(r => r.s) ? [Object.assign({ s: 0, tid: -1, po: 0 }, reg)] : []);
  return `<div class="tw"><table class="t"><thead><tr>${cols.map(c => `<th class="${c.n ? 'n' : ''}">${c.l}</th>`).join('')}</tr></thead><tbody>${all.map(r => `<tr class="${r.s ? '' : 'sep'}">${cols.map(c => `<td class="${c.n ? 'n' : ''}">${c.f(r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function canRetireNum(S, p) {
  if (p.tid !== -3) return false;
  const t = S.teams[S.user];
  if ((t.rafters || []).some(r => r.pid === p.pid || r.num === p.num)) return false;
  const yrs = new Set(p.stats.filter(r => r.tid === S.user && !r.po && r.s).map(r => r.s)).size;
  return yrs >= 4 || (p.hof && yrs >= 1);
}
Act.retireNum = el => {
  const S = App.S, p = P(S, +el.dataset.id), t = S.teams[S.user];
  confirmBox(`Retire #${p.num}?`, `No ${E(t.name)} player will wear #${p.num} again. ${E(pname(p))}'s banner goes up in the rafters at ${E(t.arena.name)}.`, 'Raise the Banner', () => {
    t.rafters = t.rafters || [];
    t.rafters.push({ num: p.num, n: pname(p), pid: p.pid, s: S.season });
    t.hype = Math.min(100, t.hype + 3); t.fan = Math.min(100, t.fan + 3);
    assignNumbers(S, t.tid);
    addNews(S, { type: 'ceremony', tids: [t.tid], pids: [p.pid], h: `${t.name} retire ${pname(p)}'s No. ${p.num}`, b: `A sellout crowd at ${t.arena.name} gave him a standing ovation as the banner went up.`, imp: 3, local: true });
    closeModal(); autosave(); rerender(); toast(`#${p.num} raised to the rafters.`, 'good');
  });
};
Act.setPos = el => {
  const S = App.S, p = P(S, +el.dataset.id), np = el.value;
  if (np === p.pos) return;
  const before = p.ovr;
  p.pos = np; p.ovr = calcOvr(p.r, np); p.pot = Math.max(p.ovr, p.pot + (p.ovr - before));
  ensureRotation(S, S.user); autosave();
  toast(`${pname(p)} moves to ${np} (${before} → ${p.ovr} OVR).`);
  openPlayer(p.pid); rerender();
};
Act.toggleBlock = el => {
  const S = App.S, id = +el.dataset.id;
  if (S.tradeBlock.includes(id)) { S.tradeBlock = S.tradeBlock.filter(x => x !== id); toast('Removed from the trading block.'); }
  else { S.tradeBlock.push(id); toast('On the block. Offers will arrive in your inbox.'); }
  closeModal(); autosave(); rerender();
};
Act.releaseAsk = el => {
  const S = App.S, p = P(S, +el.dataset.id);
  const ng = p.contract.ng || p.contract.amt <= S.minSal * 1.05;
  const yrs = p.contract.exp - firstSeason(S) + 1;
  confirmBox(`Release ${E(pname(p))}?`, ng ? 'His contract is not guaranteed. No dead money.' : `You still owe him ${U.money(p.contract.amt)} a season for ${Math.max(1, yrs)} more season${yrs > 1 ? 's' : ''}. That stays on your cap as dead money.`, 'Release', () => { releasePlayer(S, p); autosave(); toast(`${pname(p)} released.`); rerender(); }, 'red');
};
Act.tradeFor = el => { const p = P(App.S, +el.dataset.id); App.trade = { tid: p.tid, give: { pids: [], picks: [] }, get: { pids: [p.pid], picks: [] } }; closeModal(); go('trade'); };

// ---------- negotiation (re-sign / extension) ----------
const canNegotiate = (S, p) => p && p.tid === S.user && (canExtend(S, p) || (S.phase === PH.RESIGN && p.contract.exp <= S.season));
Act.negotiateOpen = el => {
  const S = App.S, p = P(S, +el.dataset.id);
  if (!canNegotiate(S, p)) { toast(p && p.contract.next ? 'He already signed an extension.' : 'He is not yours to negotiate with right now.', 'bad'); S.inbox.forEach(m => { if (m.act && m.act.kind === 'ext' && m.act.pid === (p && p.pid)) m.done = true; }); rerender(); return; }
  const st = resignStatus(S, p);
  if (st === 'refuses') { modal(E(pname(p)), `<p>${E(pname(p))} refuses to negotiate. He'll test free agency.</p>`, '', { size: 'sm' }); return; }
  const ask = contractAsk(S, p, p.tid);
  App.neg = { pid: p.pid, amt: ask.amt, yrs: ask.yrs };
  negModal();
};
function negModal(msg) {
  const S = App.S, N = App.neg, p = P(S, N.pid);
  const ask = contractAsk(S, p, p.tid);
  const st = resignStatus(S, p);
  const body = `<div class="row" style="margin-bottom:10px">${rt(p.ovr)}<div><div class="b">${E(pname(p))} · ${p.pos} · ${p.age}</div><div class="small mute">${PERSONALITIES[p.pers].n} · ${moodWord(p.morale)} · ${st === 'testing' ? '<span class="warn">Wants to test the market</span>' : '<span class="good">Open to staying</span>'}</div></div></div>
  <div class="kv small"><span>Agent's ask</span><span class="gold">${U.money(ask.amt)} × ${ask.yrs} yrs</span><span>Market value</span><span>${U.money(marketSalary(S, p))}</span><span>Your payroll next year</span><span>${U.money(payrollNext(S, S.user) - (offseason(S) ? 0 : 0))}</span><span>Talks so far</span><span>${p.neg || 0} of 3 offers</span></div>
  <hr class="sep">
  <label class="fld">Salary per season: <b class="num" id="negAmtL">${U.money(N.amt)}</b><input type="range" min="${S.minSal}" max="${S.maxSal}" step="50" value="${N.amt}" data-i="negAmt"></label>
  <div class="fld" style="margin-top:10px">Years ${seg('negYrs', [1, 2, 3, 4, 5].map(y => [y, y]), N.yrs, 'negYrs')}</div>
  ${msg ? `<p class="${msg.ok ? 'good' : 'warn'}" style="margin-top:12px">${E(msg.msg)}</p>` : ''}`;
  modal(`${canExtend(S, p) ? 'Extension' : 'Re-sign'} Talks`, body, msg && msg.ok ? btn('Done', 'closeModal', 'gold') : `${btn('Walk Away', 'closeModal', 'ghost')}${btn('Make Offer', 'negSubmit', 'gold')}`, { size: 'sm' });
}
Act.negAmt = el => { App.neg.amt = +el.value; const l = $('#negAmtL'); if (l) l.textContent = U.money(App.neg.amt); };
Act.negYrs = el => { App.neg.yrs = +el.dataset.k; negModal(); };
Act.negSubmit = () => { const S = App.S, N = App.neg; if (!canNegotiate(S, P(S, N.pid))) { closeModal(); toast('These talks are over.', 'bad'); return; } const res = negotiate(S, P(S, N.pid), N.amt, N.yrs); autosave(); negModal(res); if (res.ok) { toast(res.msg, 'good'); setTimeout(rerender, 10); } };

// ---------- rotation & strategy ----------
Screens.rotation = {
  render() {
    const S = App.S, t = S.teams[S.user];
    ensureRotation(S, S.user);
    const order = t.rot.order.map(id => P(S, id));
    const tot = U.sum(order, p => t.rot.mins[p.pid] || 0);
    const rows = order.map((p, i) => `<tr class="${i === 5 ? 'sep' : ''}"><td class="c">${i < 5 ? '<span class="chip gold">START</span>' : `<span class="dim">${i + 1}</span>`}</td><td>${plink(p)} ${injChip(p)}</td><td>${p.pos}</td><td class="c">${rt(p.ovr)}</td><td class="n">${p.r.sta}</td><td>${moodIcon(p.morale)}</td>
      <td class="n"><input type="number" min="0" max="48" value="${t.rot.mins[p.pid] || 0}" style="width:64px" data-c="rotMin" data-id="${p.pid}" ${t.autoRot ? 'disabled' : ''} aria-label="Minutes for ${E(pname(p))}"></td>
      <td><div class="row tight">${t.autoRot ? '' : `${btn('▲', 'rotMove', 'sm ghost', { id: p.pid, d: -1 })}${btn('▼', 'rotMove', 'sm ghost', { id: p.pid, d: 1 })}`}</div></td></tr>`).join('');
    const strat = t.strat;
    const calls = (map, cur, act) => `<div class="callgrid">${Object.entries(map).map(([k, v]) => `<button class="call ${cur === k ? 'on' : ''}" data-a="${act}" data-k="${k}"><b>${v.n}</b><span class="mute">${v.d}</span></button>`).join('')}</div>`;
    return `${pageHead('Rotation & Strategy', 'Your lineup, minutes and default game plan for simulated games')}
    <div class="grid g-main">
      ${panel('Rotation', `<div class="row between" style="padding:10px 12px"><label class="row small"><input type="checkbox" ${t.autoRot ? 'checked' : ''} data-c="autoRot"> Let the coaching staff set the rotation automatically</label><span class="num ${Math.abs(tot - 240) > 5 && !t.autoRot ? 'warn' : 'mute'}">${tot} / 240 min</span></div>
        <div class="tw"><table class="t"><thead><tr><th class="c">Slot</th><th>Player</th><th>Pos</th><th class="c">OVR</th><th class="n">STA</th><th>Mood</th><th class="n">Min</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
        <p class="tiny mute" style="padding:0 12px 10px">Minutes are targets; the engine scales them to 240 and subs on fatigue and fouls. Unhappy with playing time? Check the inbox.</p>`, { flush: true })}
      <div class="stack">
        ${panel('Default Offense', calls(OFF_PLAYS, strat.off, 'stratOff'))}
        ${panel('Default Defense', calls(DEF_SCHEMES, strat.def, 'stratDef'))}
        ${panel('Pace', seg('pace', PACES.map((p, i) => [i, p]), strat.pace, 'stratPace'))}
      </div>
    </div>`;
  },
};
Act.autoRot = el => { const S = App.S, t = S.teams[S.user]; t.autoRot = el.checked; if (t.autoRot) autoRotation(S, S.user); autosave(); rerender(); };
Act.rotMin = el => { const t = App.S.teams[App.S.user]; t.rot.mins[+el.dataset.id] = U.clamp(+el.value || 0, 0, 48); autosave(); rerender(); };
Act.rotMove = el => {
  const t = App.S.teams[App.S.user], id = +el.dataset.id, d = +el.dataset.d;
  const i = t.rot.order.indexOf(id), j = i + d;
  if (j < 0 || j >= t.rot.order.length) return;
  [t.rot.order[i], t.rot.order[j]] = [t.rot.order[j], t.rot.order[i]];
  if ((i < 5) !== (j < 5)) { const a = t.rot.order[i], b = t.rot.order[j]; [t.rot.mins[a], t.rot.mins[b]] = [t.rot.mins[b], t.rot.mins[a]]; }
  autosave(); rerender();
};
Act.stratOff = el => { App.S.teams[App.S.user].strat.off = el.dataset.k; autosave(); rerender(); };
Act.stratDef = el => { App.S.teams[App.S.user].strat.def = el.dataset.k; autosave(); rerender(); };
Act.stratPace = el => { App.S.teams[App.S.user].strat.pace = +el.dataset.k; autosave(); rerender(); };

// ---------- schedule & box scores ----------
Screens.schedule = {
  render() {
    const S = App.S, u = S.user;
    const gs = teamGames(S, u);
    const rows = gs.map(g => {
      const home = g.h === u, opp = S.teams[home ? g.a : g.h];
      const played = g.hs != null;
      const won = played && (home ? g.hs > g.as : g.as > g.hs);
      return `<tr class="${g.day === S.day && S.phase === PH.REG ? 'me' : ''}"><td class="n">${g.day}</td><td>${home ? 'vs' : '@'}</td><td><span class="row tight">${logo(opp, 20)} ${tlink(opp, true)}</span></td><td class="mute small">${rec(opp)}</td>
        <td>${played ? `<span class="${won ? 'good' : 'bad'} b">${won ? 'W' : 'L'}</span> <span class="num">${home ? g.hs : g.as}-${home ? g.as : g.hs}${g.ot ? ' OT' : ''}</span>` : '<span class="dim">—</span>'}</td>
        <td>${played && S.box[g.gid] ? btn('Box', 'box', 'sm ghost', { gid: g.gid }) : ''}</td></tr>`;
    }).join('');
    const po = S.playoffs ? S.playoffs.games.filter(g => g.h === u || g.a === u) : [];
    const poRows = po.map(g => { const home = g.h === u, opp = S.teams[home ? g.a : g.h]; const won = home ? g.hs > g.as : g.as > g.hs; return `<tr><td>${ROUND_NAMES[g.round]} G${g.n}</td><td>${home ? 'vs' : '@'} ${tlink(opp, true)}</td><td><span class="${won ? 'good' : 'bad'} b">${won ? 'W' : 'L'}</span> <span class="num">${home ? g.hs : g.as}-${home ? g.as : g.hs}</span></td><td>${S.box[g.gid] ? btn('Box', 'box', 'sm ghost', { gid: g.gid }) : ''}</td></tr>`; }).join('');
    const lastDay = S.phase === PH.REG ? S.day - 1 : 0;
    const board = S.phase === PH.REG ? S.sched.filter(g => g.day === lastDay && g.hs != null) : [];
    const slate = S.phase === PH.REG ? S.sched.filter(g => g.day === S.day) : [];
    const sb = board.length || slate.length ? panel(`Around the League`, `<div class="grid g2" style="gap:6px">${board.map(g => `<div class="row between small" style="padding:6px 8px;background:var(--panel2);border-radius:4px"><span><b class="${g.as > g.hs ? '' : 'mute'}">${S.teams[g.a].abbr} ${g.as}</b> @ <b class="${g.hs > g.as ? '' : 'mute'}">${S.teams[g.h].abbr} ${g.hs}</b>${g.ot ? ' OT' : ''}</span>${S.box[g.gid] ? btn('Box', 'box', 'sm ghost', { gid: g.gid }) : ''}</div>`).join('')}</div>${board.length ? `<div class="tiny mute" style="margin:6px 0 10px">Day ${lastDay} finals</div>` : ''}${slate.length ? `<div class="eyebrow" style="margin:8px 0 4px">Today, Day ${S.day}</div><div class="small">${slate.map(g => `${S.teams[g.a].abbr} @ ${S.teams[g.h].abbr}`).join(' · ')}</div>` : ''}`, { style: 'margin-bottom:14px' }) : '';
    return `${pageHead('Schedule', `${U.seasonLabel(S.season)} · All-Star break after Day ${S.allStarDay - 1} · Trade deadline Day ${S.deadlineDay}`)}
      ${sb}
      ${poRows ? panel('Playoffs', `<div class="tw"><table class="t"><tbody>${poRows}</tbody></table></div>`, { flush: true, style: 'margin-bottom:14px' }) : ''}
      ${panel('Regular Season', `<div class="tw"><table class="t"><thead><tr><th class="n">Day</th><th></th><th>Opponent</th><th>Record</th><th>Result</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`, { flush: true })}`;
  },
};
Act.box = el => openBox(+el.dataset.gid);
function boxTable(S, T, b) {
  const cols = ['MIN', 'PTS', 'FG', '3PT', 'FT', 'OREB', 'REB', 'AST', 'STL', 'BLK', 'TO', 'PF', '+/-'];
  const tot = newLine();
  const rows = T.ps.map(l => { for (const k in tot) tot[k] += l[k] || 0; return `<tr><td>${l.gs ? '<b>' : ''}<a class="pl" data-a="player" data-id="${l.pid}">${E(l.n)}</a>${l.gs ? '</b>' : ''} <span class="dim small">${l.pos}</span></td><td class="n">${Math.round(l.min)}</td><td class="n b">${l.pts}</td><td class="n">${l.fgm}-${l.fga}</td><td class="n">${l.tpm}-${l.tpa}</td><td class="n">${l.ftm}-${l.fta}</td><td class="n">${l.orb}</td><td class="n">${l.orb + l.drb}</td><td class="n">${l.ast}</td><td class="n">${l.stl}</td><td class="n">${l.blk}</td><td class="n">${l.tov}</td><td class="n">${l.pf}</td><td class="n ${l.pm > 0 ? 'good' : l.pm < 0 ? 'bad' : ''}">${l.pm > 0 ? '+' : ''}${l.pm}</td></tr>`; }).join('');
  const tr = `<tr class="sep"><td class="b">Totals</td><td></td><td class="n b">${tot.pts}</td><td class="n">${tot.fgm}-${tot.fga}<div class="tiny mute">${U.fg(tot.fgm, tot.fga)}</div></td><td class="n">${tot.tpm}-${tot.tpa}<div class="tiny mute">${U.fg(tot.tpm, tot.tpa)}</div></td><td class="n">${tot.ftm}-${tot.fta}<div class="tiny mute">${U.fg(tot.ftm, tot.fta)}</div></td><td class="n">${tot.orb}</td><td class="n">${tot.orb + tot.drb}</td><td class="n">${tot.ast}</td><td class="n">${tot.stl}</td><td class="n">${tot.blk}</td><td class="n">${tot.tov}</td><td class="n">${tot.pf}</td><td></td></tr>`;
  return `<div class="tw"><table class="t"><thead><tr><th>Player</th>${cols.map(c => `<th class="n">${c}</th>`).join('')}</tr></thead><tbody>${rows}${tr}</tbody></table></div>`;
}
function openBox(gid) {
  const S = App.S, b = S.box[gid];
  if (!b) { toast('Box score not available.'); return; }
  const tm = i => S.teams[b.teams[i].tid] || { abbr: b.teams[i].abbr, tid: 0, c1: '#555', c2: '#999', region: b.teams[i].abbr, name: '' };
  const qh = b.qs[0].map((_, i) => `<th class="n">${i < 4 ? i + 1 : 'OT' + (i > 4 ? i - 3 : '')}</th>`).join('');
  const qrow = i => `<tr><td class="b">${E(tm(i).abbr)}</td>${b.qs[i].map(x => `<td class="n">${x}</td>`).join('')}<td class="n b">${b.score[i]}</td></tr>`;
  const body = `<div class="row" style="justify-content:center;gap:24px;margin-bottom:12px">${logo(tm(1), 52)}<div class="c"><div style="font:700 40px/1 var(--f-num)">${b.score[1]} – ${b.score[0]}</div><div class="small mute">Final${b.ot ? ' / ' + (b.ot > 1 ? b.ot : '') + 'OT' : ''}</div></div>${logo(tm(0), 52)}</div>
    <div class="tw" style="max-width:420px;margin:0 auto 14px"><table class="t"><thead><tr><th></th>${qh}<th class="n">T</th></tr></thead><tbody>${qrow(1)}${qrow(0)}</tbody></table></div>
    ${[1, 0].map(i => `<div class="eyebrow" style="margin:12px 0 6px">${E(tm(i).abbr)}</div>${boxTable(S, b.teams[i], b)}`).join('')}
    ${b.log ? `<details style="margin-top:14px"><summary class="b" style="cursor:pointer">Play-by-play</summary><div class="pbp" style="max-height:420px">${b.log.slice().reverse().map(e => `<div class="e ${e[6] ? 'score' : ''}"><span class="t">Q${e[0]} ${Math.floor(e[1] / 60)}:${String(e[1] % 60).padStart(2, '0')}</span><span>${E(e[3])}</span><span class="s">${e[5]}-${e[4]}</span></div>`).join('')}</div></details>` : ''}
    ${b.shots ? `<details style="margin-top:10px"><summary class="b" style="cursor:pointer">Shot chart</summary><div class="grid g2" style="margin-top:8px">${[1, 0].map(i => `<div><div class="eyebrow">${E(tm(i).abbr)}</div>${shotChart(b.shots.filter(s => s.side === i), tm(i))}</div>`).join('')}</div></details>` : ''}`;
  modal(`${E(tm(1).abbr)} @ ${E(tm(0).abbr)}`, body, '', {});
}
function shotChart(shots, t) {
  const W = 500, H = 470, sx = x => W / 2 + x * 10, sy = y => H - y * 10;
  const court = `<rect x="0" y="0" width="${W}" height="${H}" fill="#2a1b10"/><g stroke="#c98d4e" stroke-width="2" fill="none" opacity=".7"><rect x="${sx(-8)}" y="${sy(19)}" width="160" height="190"/><circle cx="${sx(0)}" cy="${sy(19)}" r="60"/><path d="M${sx(-22)},${H} L${sx(-22)},${sy(14)} A237.5,237.5 0 0 1 ${sx(22)},${sy(14)} L${sx(22)},${H}"/><circle cx="${sx(0)}" cy="${sy(5.25)}" r="7.5" stroke="#ff7a1a"/><line x1="${sx(-3)}" y1="${sy(4)}" x2="${sx(3)}" y2="${sy(4)}"/></g>`;
  const dots = shots.map(s => s.made ? `<circle cx="${sx(s.x)}" cy="${sy(Math.min(46, s.y))}" r="6" fill="${t.c1}" stroke="#fff" stroke-width="1.5"/>` : `<g stroke="#ff5d5d" stroke-width="2.5" opacity=".85"><line x1="${sx(s.x) - 5}" y1="${sy(Math.min(46, s.y)) - 5}" x2="${sx(s.x) + 5}" y2="${sy(Math.min(46, s.y)) + 5}"/><line x1="${sx(s.x) + 5}" y1="${sy(Math.min(46, s.y)) - 5}" x2="${sx(s.x) - 5}" y2="${sy(Math.min(46, s.y)) + 5}"/></g>`).join('');
  const m = shots.filter(s => s.made).length;
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;border-radius:4px" role="img" aria-label="Shot chart: ${m} of ${shots.length} made">${court}${dots}</svg><div class="tiny mute c">${m}/${shots.length} FG · ● made · ✕ missed</div>`;
}

// ---------- training camp ----------
Screens.camp = {
  render() {
    const S = App.S;
    if (S.phase !== PH.PRE || !S.camp) return `${pageHead('Training Camp')}<div class="empty">Training camp opens in the preseason.</div>`;
    const sel = App.ui.campPid != null ? P(S, App.ui.campPid) : null;
    const ps = U.sortBy(roster(S, S.user), p => (p.age <= 24 ? 10 : 0) + p.pot);
    const list = ps.map(p => `<button class="tcard ${sel && sel.pid === p.pid ? 'on' : ''}" style="width:100%" data-a="campPick" data-id="${p.pid}" ${p.campYr === S.season ? 'disabled' : ''}>${rt(p.ovr)}<div class="grow"><div class="b">${E(pname(p))}</div><div class="tiny mute">${p.pos} · Age ${p.age} · POT ${potGrade(Math.max(p.pot, p.ovr))}${p.campYr === S.season ? ' · already drilled' : ''}</div></div></button>`).join('');
    const drills = Object.entries(DRILLS).map(([k, d]) => `<button class="call" style="padding:10px" data-a="campDrill" data-k="${k}" ${!sel || !S.camp.left ? 'disabled' : ''}><b>${d.n}</b><span class="mute">${d.d}</span><div class="tiny" style="margin-top:4px">${d.keys.map(x => RSHORT[x] + (sel ? ' ' + sel.r[x] : '')).join(' · ')}</div>${d.game ? '<span class="chip gold" style="margin-top:6px">Playable</span>' : '<span class="chip" style="margin-top:6px">Simulated</span>'}</button>`).join('');
    const log = S.camp.log.map(r => `<tr><td>${E(r.n)}</td><td>${DRILLS[r.drill].n}</td><td class="c">${gradeChip(U.grade(r.grade))}</td><td>${Object.entries(r.gains).map(([k, v]) => `${RSHORT[k]} <span class="${v > 0 ? 'good' : 'mute'}">+${v}</span>`).join(' · ')}</td><td class="n ${r.d > 0 ? 'good' : ''}">${r.d > 0 ? '+' + r.d : r.d} OVR</td></tr>`).join('');
    return `${pageHead('Training Camp', `${S.camp.left} session${S.camp.left === 1 ? '' : 's'} remaining · each player can attend one session`, btn('Start Season', 'advStart', 'gold'))}
      <div class="grid g-main"><div class="stack">${panel(sel ? `Drills for ${E(pname(sel))}` : 'Pick a player', `<div class="callgrid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${drills}</div>`)}
      ${panel('Camp Results', log ? `<div class="tw"><table class="t"><tbody>${log}</tbody></table></div>` : '<div class="empty">No sessions run yet.</div>', { flush: true })}</div>
      ${panel('Players', `<div class="stack" style="gap:6px;max-height:620px;overflow-y:auto">${list}</div>`)}</div>`;
  },
};
Act.campPick = el => { App.ui.campPid = +el.dataset.id; rerender(); };
Act.campDrill = el => {
  const S = App.S, k = el.dataset.k, p = P(S, App.ui.campPid);
  if (!p || !S.camp.left) return;
  const finish = (grade) => {
    const r = campApply(S, p.pid, k, grade);
    App.ui.campPid = null;
    autosave();
    if (r) modal('Drill Complete', `<div class="c"><div class="eyebrow">${DRILLS[k].n}</div><div style="font:800 56px/1 var(--f-num);color:var(--gold);margin:8px 0">${U.grade(grade)}</div><p>${E(r.n)}: ${Object.entries(r.gains).map(([x, v]) => `${RLONG[x]} +${v}`).join(', ')}${r.d ? ` · <b class="good">+${r.d} OVR</b>` : ''}</p></div>`, btn('Continue', 'closeModal', 'gold'), { size: 'sm', onClose: rerender });
    else rerender();
  };
  if (DRILLS[k].game) MiniGames[DRILLS[k].game](p, finish);
  else finish(campSimGrade(S, p));
};
