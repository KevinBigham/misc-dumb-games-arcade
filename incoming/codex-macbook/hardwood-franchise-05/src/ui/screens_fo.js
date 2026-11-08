// ===== ui/screens_fo.js — trades, free agency, re-signing, draft, lottery =====
Screens.trade = {
  render() {
    const S = App.S;
    if (!App.trade) App.trade = { tid: S.teams.find(t => t.tid !== S.user).tid, give: { pids: [], picks: [] }, get: { pids: [], picks: [] } };
    const T = App.trade, other = S.teams[T.tid];
    const own = (sel, tid) => { sel.pids = sel.pids.filter(id => { const p = P(S, id); return p && p.tid === tid; }); sel.picks = sel.picks.filter(id => { const k = S.picks.find(x => x.id === id); return k && k.tid === tid; }); };
    own(T.give, S.user); own(T.get, T.tid);
    const closed = (S.phase === PH.REG && S.day > S.deadlineDay) || S.phase === PH.PO;
    const side = (tid, sel, key) => {
      const ps = U.sortBy(roster(S, tid), p => p.ovr);
      const picks = S.picks.filter(k => k.tid === tid).sort((a, b) => a.year - b.year || a.rd - b.rd);
      return `<div class="tw" style="max-height:440px;overflow-y:auto"><table class="t"><tbody>${ps.map(p => `<tr class="${sel.pids.includes(p.pid) ? 'me' : ''}"><td style="width:30px"><input type="checkbox" ${sel.pids.includes(p.pid) ? 'checked' : ''} data-c="trSel" data-s="${key}" data-id="${p.pid}" aria-label="Select ${E(pname(p))}"></td><td>${plink(p)} ${injChip(p)}${S.tradeBlock.includes(p.pid) && tid === S.user ? '<span class="chip warn">TB</span>' : ''}<div class="tiny mute">${p.pos} · ${p.age} yrs · ${U.money(p.contract.amt)} thru ${U.seasonLabel(p.contract.exp)}</div></td><td class="c">${rt(p.ovr)}</td><td class="c">${potStr(S, p)}</td></tr>`).join('')}
        ${picks.map(k => `<tr class="${sel.picks.includes(k.id) ? 'me' : ''}"><td><input type="checkbox" ${sel.picks.includes(k.id) ? 'checked' : ''} data-c="trSel" data-s="${key}" data-pk="${k.id}" aria-label="Select pick"></td><td colspan="3"><b>${E(pickLabel(S, k))}</b> <span class="tiny mute">draft pick${k.rd === 1 ? ` · proj. #${projectedPick(S, k.orig)}` : ''}</span></td></tr>`).join('')}</tbody></table></div>`;
    };
    const sal = pids => U.sum(pids, id => P(S, id).contract.amt);
    const probs = (T.give.pids.length + T.give.picks.length + T.get.pids.length + T.get.picks.length) ? tradeProblems(S, S.user, T.tid, T.give, T.get) : [];
    let meter = '';
    if (T.get.pids.length + T.get.picks.length + T.give.pids.length + T.give.picks.length) {
      const v = aiTradeVerdict(S, T.tid, T.get, T.give, DIFFS[S.diff].trade);
      const r = v.get / Math.max(1, v.need);
      const lbl = r >= 1 ? ['good', 'They would take this deal'] : r >= 0.9 ? ['warn', 'Close — they want a little more'] : r >= 0.7 ? ['warn', 'Not enough value for them'] : ['bad', 'Not interested'];
      meter = `<div class="row"><span class="chip ${lbl[0]}">${lbl[1]}</span><div class="bar" style="flex:1;min-width:120px"><i style="width:${U.clamp(r * 100, 3, 100)}%;background:var(--${lbl[0] === 'good' ? 'good' : lbl[0] === 'warn' ? 'warn' : 'bad'})"></i></div></div>`;
    }
    const offers = S.offers.filter(o => o.s === S.season || true);
    const offerList = offers.map(o => { const t = S.teams[o.tid]; return `<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><div class="small">${logo(t, 20)} <b>${t.abbr}</b> offer ${o.get.pids.map(id => pname(P(S, id))).concat(o.get.picks.map(id => { const k = S.picks.find(x => x.id === id); return k ? pickLabel(S, k) : '?'; })).join(', ')} <span class="mute">for</span> ${o.pids.map(id => pname(P(S, id))).join(', ')}</div><div class="row tight">${btn('Accept', 'offerAccept', 'gold sm', { id: o.id })}${btn('Counter', 'counterOffer', 'sm', { id: o.id })}${btn('Decline', 'offerDecline', 'sm ghost', { id: o.id })}</div></div>`; }).join('');
    return `${pageHead('Trade Center', closed ? '<span class="bad">Trading is closed until the offseason.</span>' : `Deadline: ${S.phase === PH.REG ? 'after Day ' + S.deadlineDay : 'open'} · Cap room ${U.money(capSpace(S, S.user))}`)}
      <div class="row" style="margin-bottom:12px"><label class="fld" style="flex-direction:row;align-items:center;gap:8px">Trade partner <select data-c="trTeam" aria-label="Trade partner">${S.teams.filter(t => t.tid !== S.user).map(t => `<option value="${t.tid}" ${t.tid === T.tid ? 'selected' : ''}>${E(tname(t))} (${rec(t)})</option>`).join('')}</select></label><span class="chip">${teamMode(S, T.tid) === 'contend' ? 'Contending — wants proven players' : teamMode(S, T.tid) === 'rebuild' ? 'Rebuilding — wants youth and picks' : 'Middle of the pack'}</span>${btn('Clear', 'trClear', 'sm ghost')}</div>
      <div class="grid g2">
        ${panel(`You give · ${U.money(sal(T.give.pids))}`, side(S.user, T.give, 'give'), { flush: true })}
        ${panel(`<span class="row tight" style="display:inline-flex">${logo(other, 22)} You get · ${U.money(sal(T.get.pids))}</span>`, side(T.tid, T.get, 'get'), { flush: true })}
      </div>
      <div class="panel" style="margin-top:14px;padding:12px"><div class="stack">${meter}${probs.map(p => `<div class="small bad">⚠ ${E(p)}</div>`).join('')}
        <div class="row">${btn('Propose Trade', 'trPropose', 'gold', {})}${btn('What would they give?', 'trAsk', '')}<span class="small mute">Pick players you'd move and the AI GM builds a counter.</span></div></div></div>
      <div class="grid g2" style="margin-top:14px">
        ${panel('Your Trading Block', S.tradeBlock.length ? S.tradeBlock.map(id => { const p = P(S, id); return p ? `<div class="row between small" style="padding:5px 0">${plink(p)} ${rt(p.ovr)} ${btn('Remove', 'toggleBlock', 'sm ghost', { id })}</div>` : ''; }).join('') : '<div class="empty small">Put players on the block from their player card. Offers arrive weekly in your inbox.</div>')}
        ${panel('Incoming Offers', offerList || '<div class="empty small">No offers on the table.</div>')}
      </div>`;
  },
};
Act.trTeam = el => { App.trade = { tid: +el.value, give: App.trade.give, get: { pids: [], picks: [] } }; rerender(); };
Act.trClear = () => { App.trade.give = { pids: [], picks: [] }; App.trade.get = { pids: [], picks: [] }; rerender(); };
Act.trSel = el => {
  const sel = App.trade[el.dataset.s];
  if (el.dataset.id) { const id = +el.dataset.id; sel.pids = el.checked ? sel.pids.concat([id]) : sel.pids.filter(x => x !== id); }
  else { const id = +el.dataset.pk; sel.picks = el.checked ? sel.picks.concat([id]) : sel.picks.filter(x => x !== id); }
  rerender();
};
Act.trPropose = () => {
  const S = App.S, T = App.trade;
  if (!(T.give.pids.length + T.give.picks.length) || !(T.get.pids.length + T.get.picks.length)) { toast('Select assets on both sides.', 'bad'); return; }
  const r = proposeTrade(S, T.tid, T.give, T.get);
  if (r.ok) { toast('Trade accepted!', 'good'); App.trade = { tid: T.tid, give: { pids: [], picks: [] }, get: { pids: [], picks: [] } }; autosave(); }
  else toast(r.msg, 'bad');
  rerender();
};
Act.trAsk = () => {
  const S = App.S, T = App.trade;
  if (!(T.give.pids.length + T.give.picks.length)) { toast('Select players or picks you would give up.', 'bad'); return; }
  const val = assetsValue(S, S.user, T.give.pids, T.give.picks, T.tid);
  const out = U.sum(T.give.pids, id => P(S, id).contract.amt);
  const userMax = teamPay(S, S.user) - out <= S.cap ? Math.max(out * 1.25 + 100, S.cap - (teamPay(S, S.user) - out)) : out * 1.25 + 100;
  const { pkg } = buildPackage(S, T.tid, (val - 1) / DIFFS[S.diff].trade * 0.96, [], userMax);
  matchSalary(S, T.tid, pkg, out);
  if (tradeProblems(S, S.user, T.tid, T.give, pkg).length || !aiTradeVerdict(S, T.tid, pkg, T.give, DIFFS[S.diff].trade).ok) { toast(`${S.teams[T.tid].abbr} can't find a deal that works for both sides.`); return; }
  if (!pkg.pids.length && !pkg.picks.length) { toast(`${S.teams[T.tid].abbr} don't have a fit for that.`); return; }
  T.get = pkg; rerender();
  toast(`${S.teams[T.tid].abbr} put together an offer. Review it and propose.`);
};
Act.offerAccept = el => { const S = App.S; const o = S.offers.find(x => x.id === +el.dataset.id); if (!o) return; const r = acceptOffer(S, o); if (r) toast(r, 'bad'); else { toast('Trade complete!', 'good'); autosave(); } rerender(); };
Act.offerDecline = el => { App.S.offers = App.S.offers.filter(x => x.id !== +el.dataset.id); rerender(); };

// ---------- free agency ----------
Screens.fa = {
  render() {
    const S = App.S, t = S.teams[S.user];
    const live = S.phase === PH.FA && S.fa;
    const fas = S.players.filter(p => p.tid === -1);
    for (const p of fas) if (!p.ask) { const a = contractAsk(S, p, -1); p.ask = { amt: a.amt, yrs: a.yrs, base: a.amt }; }
    const myOffer = p => p.fa && p.fa.offers.find(o => o.tid === S.user);
    const cols = [
      { l: 'Player', k: 'n', s: p => p.ln, f: p => `${plink(p)} ${injChip(p)}${p.prevTid === S.user ? '<span class="chip">Yours</span>' : ''}` }, { l: 'Pos', k: 'pos', s: p => POS_IDX[p.pos], f: p => p.pos }, { l: 'Age', k: 'age', n: 1, f: p => p.age },
      { l: 'OVR', k: 'ovr', c: 1, f: p => rt(p.ovr) }, { l: 'POT', k: 'pot', c: 1, s: p => Math.max(p.pot, p.ovr), f: p => potStr(S, p) },
      { l: 'Asking', k: 'ask', n: 1, s: p => p.ask.amt, f: p => `${U.money(p.ask.amt)} × ${p.ask.yrs}` },
      { l: 'Type', k: 'pers', s: p => p.pers, f: p => `<span class="small mute">${PERSONALITIES[p.pers].n}</span>` },
    ];
    if (live) cols.push({ l: 'Bids', k: 'bids', n: 1, s: p => p.fa ? p.fa.offers.length : 0, f: p => p.fa ? p.fa.offers.length : 0 });
    cols.push({ l: 'Your offer', k: 'mine', s: p => myOffer(p) ? myOffer(p).amt : 0, f: p => { const o = myOffer(p); return o ? `<span class="gold">${U.money(o.amt)} × ${o.yrs}</span> <span class="tiny">${interestLabel(faScore(S, p, S.user, o.amt, o.yrs))}</span>` : ''; } });
    cols.push({ l: '', f: p => btn(live ? (myOffer(p) ? 'Revise' : 'Offer') : 'Sign', 'faOfferOpen', 'sm ' + (myOffer(p) ? '' : 'gold'), { id: p.pid }) });
    const pending = fas.filter(p => myOffer(p));
    return `${pageHead('Free Agents', live ? `Free agency day ${Math.min(S.fa.day, S.fa.days)} of ${S.fa.days}. Offers are binding until the player decides.` : 'Unsigned players. In-season signings are decided on the spot.', (live ? btn(advanceInfo(S).label, 'faNext', 'gold') : '') + btn('Create a Player', 'capOpen', 'ghost'))}
      <div class="grid g4" style="margin-bottom:14px">
        ${panel('Cap Room', `<div class="big ${capSpace(S, S.user) < 0 ? 'bad' : 'good'}">${U.money(capSpace(S, S.user))}</div><div class="tiny mute">${offseason(S) ? 'Next season' : 'This season'} · cap ${U.money(S.cap)}</div>`)}
        ${panel('Roster', `<div class="big">${rosterCount(S, S.user)}<span class="mute" style="font-size:16px"> / ${rosterMax(S)}</span></div><div class="tiny mute">${offseason(S) ? 'under contract next season' : 'players'}</div>`)}
        ${panel('Mid-Level', `<div class="big">${t.mle ? '<span class="mute">Used</span>' : U.money(S.mle)}</div><div class="tiny mute">once per season when over the cap</div>`)}
        ${panel('Pending Offers', `<div class="big">${pending.length}</div><div class="tiny mute">${pending.length ? U.money(U.sum(pending, p => myOffer(p).amt)) + ' committed' : 'none'}</div>`)}
      </div>
      ${panel('Market', sortTable('fa', cols, fas, { sort: { k: 'ovr', d: true }, maxh: 700, empty: 'No free agents available.' }), { flush: true })}`;
  },
};
Act.faOfferOpen = el => {
  const S = App.S, p = P(S, +el.dataset.id);
  if (!p.ask) { const a = contractAsk(S, p, -1); p.ask = { amt: a.amt, yrs: a.yrs, base: a.amt }; }
  const mine = p.fa && p.fa.offers.find(o => o.tid === S.user);
  App.fo = { pid: p.pid, amt: mine ? mine.amt : p.ask.amt, yrs: mine ? mine.yrs : p.ask.yrs };
  faOfferModal();
};
function faOfferModal(msg) {
  const S = App.S, F = App.fo, p = P(S, F.pid);
  const live = S.phase === PH.FA && S.fa;
  const v = faScore(S, p, S.user, F.amt, F.yrs);
  const block = signBlock(S, S.user, F.amt);
  const body = `<div class="row" style="margin-bottom:10px">${rt(p.ovr)}<div><div class="b">${E(pname(p))} · ${p.pos} · ${p.age}</div><div class="small mute">${PERSONALITIES[p.pers].n}: ${PERSONALITIES[p.pers].d}</div></div></div>
    <div class="kv small"><span>Asking</span><span class="gold">${U.money(p.ask.amt)} × ${p.ask.yrs} yrs</span><span>Your cap room</span><span>${U.money(capSpace(S, S.user))}</span>${live ? `<span>Competing bids</span><span>${p.fa ? p.fa.offers.filter(o => o.tid !== S.user).length : 0}</span>` : ''}</div>
    <hr class="sep"><label class="fld">Salary per season: <b class="num" id="foAmtL">${U.money(F.amt)}</b><input type="range" min="${S.minSal}" max="${S.maxSal}" step="50" value="${F.amt}" data-i="foAmt"></label>
    <div class="fld" style="margin-top:10px">Years ${seg('foYrs', [1, 2, 3, 4, 5].map(y => [y, y]), F.yrs, 'foYrs')}</div>
    <p style="margin-top:12px">His interest: <b id="foInt" class="${v >= 1 ? 'good' : v >= 0.9 ? 'warn' : 'bad'}">${interestLabel(v)}</b></p>
    ${block ? `<p class="small bad">${E(block)}</p>` : ''}${msg ? `<p class="${msg.ok ? 'good' : 'warn'}">${E(msg.msg)}</p>` : ''}`;
  const foot = msg && msg.ok ? btn('Done', 'closeModal', 'gold') : `${live && p.fa && p.fa.offers.some(o => o.tid === S.user) ? btn('Withdraw', 'foWithdraw', 'red') : ''}${btn('Cancel', 'closeModal', 'ghost')}${btn(live ? 'Submit Offer' : 'Sign Now', 'foSubmit', 'gold')}`;
  modal(live ? 'Free Agent Offer' : 'Sign Free Agent', body, foot, { size: 'sm' });
}
Act.foAmt = el => { const S = App.S, F = App.fo; F.amt = +el.value; const l = $('#foAmtL'); if (l) l.textContent = U.money(F.amt); const v = faScore(S, P(S, F.pid), S.user, F.amt, F.yrs); const i = $('#foInt'); if (i) { i.textContent = interestLabel(v); i.className = v >= 1 ? 'good' : v >= 0.9 ? 'warn' : 'bad'; } };
Act.foYrs = el => { App.fo.yrs = +el.dataset.k; faOfferModal(); };
Act.foWithdraw = () => { const S = App.S, p = P(S, App.fo.pid); if (p.fa) p.fa.offers = p.fa.offers.filter(o => o.tid !== S.user); closeModal(); rerender(); };
Act.foSubmit = () => {
  const S = App.S, F = App.fo, p = P(S, F.pid);
  if (S.phase === PH.FA && S.fa) {
    const err = userOffer(S, p, F.amt, F.yrs);
    if (err) { faOfferModal({ ok: false, msg: err }); return; }
    closeModal(); toast(`Offer submitted to ${pname(p)}. He'll decide over the coming days.`); autosave(); rerender();
  } else {
    const r = signNow(S, p, F.amt, F.yrs);
    faOfferModal(r);
    if (r.ok) { autosave(); setTimeout(rerender, 10); }
  }
};

// ---------- re-sign ----------
Screens.resign = {
  render() {
    const S = App.S;
    const exp = roster(S, S.user).filter(p => p.contract.exp <= S.season);
    const committed = payrollNext(S, S.user);
    const asks = U.sum(exp.filter(p => resignStatus(S, p) !== 'refuses'), p => contractAsk(S, p, p.tid).amt);
    const cols = [{ l: 'Player', k: 'n', s: p => p.ln, f: p => plink(p) }, { l: 'Pos', k: 'pos', f: p => p.pos }, { l: 'Age', k: 'age', n: 1, f: p => p.age }, { l: 'OVR', k: 'ovr', c: 1, f: p => rt(p.ovr) }, { l: 'POT', k: 'pot', c: 1, s: p => p.pot, f: p => potStr(S, p) },
    { l: 'Current', k: 'cur', n: 1, s: p => p.contract.amt, f: p => U.money(p.contract.amt) }, { l: 'Asking', k: 'ask', n: 1, s: p => contractAsk(S, p, p.tid).amt, f: p => { const a = contractAsk(S, p, p.tid); return `${U.money(a.amt)} × ${a.yrs}`; } },
    { l: 'Mood', k: 'm', s: p => p.morale, f: p => moodIcon(p.morale) }, { l: 'Status', k: 'st', s: p => resignStatus(S, p), f: p => { const s = resignStatus(S, p); return s === 'willing' ? '<span class="chip good">Willing</span>' : s === 'testing' ? '<span class="chip warn">Testing market</span>' : '<span class="chip bad">Won\'t re-sign</span>'; } },
    { l: '', f: p => resignStatus(S, p) === 'refuses' ? '' : btn('Negotiate', 'negotiateOpen', 'gold sm', { id: p.pid }) }];
    return `${pageHead('Re-sign Players', `Committed next season: ${U.money(committed)} · Cap ${U.money(S.cap)} · Tax ${U.money(S.tax)} · Total asks ${U.money(asks)}`, btn('Open Free Agency ▸', 'advFA', 'gold'))}
      ${panel('Expiring Contracts', sortTable('rs', cols, exp, { sort: { k: 'ovr', d: true }, empty: 'No expiring contracts. Head to free agency.' }), { flush: true })}
      <p class="tiny mute">You can always exceed the cap to keep your own players. Three lowball offers and he walks. Players you don't re-sign become free agents — you can still bid on them against the field.</p>`;
  },
};

// ---------- draft ----------
Screens.draft = {
  render() {
    const S = App.S;
    const D = S.draft;
    const live = S.phase === PH.DRAFT && D;
    const year = live ? D.year : S.season + 1;
    const pool = prospects(S, year);
    const board = pool.map(p => ({ p, pr: perceived(S, p) })).sort((a, b) => (b.pr.ovr * 0.42 + b.pr.pot * 0.58) - (a.pr.ovr * 0.42 + a.pr.pot * 0.58));
    const onClock = live && !D.done ? D.picks[D.cur] : null;
    const myTurn = onClock && onClock.tid === S.user;
    const cols = [
      { l: 'Rk', f: x => board.indexOf(x) + 1 },
      { l: 'Prospect', k: 'n', s: x => x.p.ln, f: x => `${plink(x.p)} <span class="tiny mute">${E(x.p.college)}</span>` }, { l: 'Pos', k: 'pos', s: x => POS_IDX[x.p.pos], f: x => x.p.pos }, { l: 'Age', k: 'age', n: 1, s: x => x.p.age, f: x => x.p.age },
      { l: 'Ht', k: 'hgt', n: 1, s: x => x.p.hgt, f: x => U.hgt(x.p.hgt) },
      { l: 'OVR', k: 'ovr', c: 1, s: x => x.pr.ovr, f: x => (x.p.slvl || 0) >= 2 ? rt(x.p.ovr) : `<span class="mute num" title="Scouting estimate">${x.pr.ovr - ((x.p.slvl || 0) ? 2 : 5)}–${x.pr.ovr + ((x.p.slvl || 0) ? 2 : 5)}</span>` },
      { l: 'POT', k: 'pot', c: 1, s: x => x.pr.pot, f: x => gradeChip(potGrade(x.pr.pot)) + ((x.p.slvl || 0) < 2 ? '<span class="dim tiny">?</span>' : '') },
      { l: 'Scouting', f: x => { const l = x.p.slvl || 0; return l >= 2 ? '<span class="chip good">Workout</span>' : l === 1 ? `<span class="chip">Scouted</span> ${btn('Workout 12', 'scout', 'sm ghost', { id: x.p.pid, l: 2 })}` : `${btn('Scout 8', 'scout', 'sm ghost', { id: x.p.pid, l: 1 })}${btn('Workout 20', 'scout', 'sm ghost', { id: x.p.pid, l: 2 })}`; } },
    ];
    if (myTurn) cols.push({ l: '', f: x => btn('Draft', 'draftPick', 'gold sm', { id: x.p.pid }) });
    let room = '';
    if (live) {
      const made = D.picks.slice(0, D.cur).reverse().slice(0, 60);
      room = `<div class="grid g-main" style="margin-bottom:14px">
        ${panel(D.done ? 'Draft Complete' : (myTurn ? '<span class="gold">You\'re on the clock!</span>' : 'On the Clock'), D.done ? `<p>All picks are in. ${btn('Re-sign Players ▸', 'advResign', 'gold')}</p>` : `<div class="row">${logo(S.teams[onClock.tid], 56)}<div><div class="eyebrow">Round ${onClock.rd} · Pick ${onClock.pick}</div><div style="font:800 26px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg)">${E(tname(S.teams[onClock.tid]))}</div>${onClock.orig !== onClock.tid ? `<div class="tiny mute">via ${S.teams[onClock.orig].abbr}</div>` : ''}</div></div>
          <hr class="sep"><div class="row">${myTurn ? btn('Auto-pick for me', 'draftAuto', '') : btn('Sim to my pick', 'draftSim', 'gold', { mode: 'mine' })}${btn('Next pick', 'draftSim', '', { mode: 'one' })}${btn('Sim rest of draft', 'draftSim', 'ghost', { mode: 'all' })}</div>
          <div class="small mute" style="margin-top:8px">Your picks: ${D.picks.filter(k => k.tid === S.user).map(k => k.pid ? `#${k.pick} ${E(pname(P(S, k.pid)))}` : `#${k.pick}`).join(' · ') || 'none'}</div>`)}
        ${panel('Draft Log', `<div style="max-height:220px;overflow-y:auto">${made.map(k => `<div class="row small" style="padding:3px 0;${k.tid === S.user ? 'color:var(--gold2)' : ''}"><span class="num dim" style="width:26px">${k.pick}</span>${logo(S.teams[k.tid], 18)}<b>${S.teams[k.tid].abbr}</b> ${k.pid ? plink(P(S, k.pid)) + ` <span class="dim">${P(S, k.pid).pos}</span>` : '—'}</div>`).join('') || '<div class="empty small">No picks yet.</div>'}</div>`)}
      </div>`;
    }
    const myPicks = S.picks.filter(k => k.tid === S.user && k.year === year).map(k => `${k.rd === 1 ? '1st' : '2nd'} (${S.teams[k.orig].abbr}${k.rd === 1 && !live ? ', proj. #' + projectedPick(S, k.orig) : ''})`);
    return `${pageHead(live ? `${year} Draft Room` : 'Draft & Scouting', `${year} class · ${pool.length} prospects · Scouting points: <b class="gold">${S.scout.pts}</b> / ${S.scout.max}${myPicks.length ? ' · Your picks: ' + myPicks.join(', ') : ''}`)}
      ${room}
      ${panel('Big Board', sortTable('board', cols, board, { maxh: 720 }), { flush: true })}
      <p class="tiny mute">Unscouted ratings are educated guesses with wide error bars — your head scout's eye matters. A workout reveals true ratings and potential. Points refresh every season.</p>`;
  },
};
Act.scout = el => { const S = App.S; const err = scoutProspect(S, P(S, +el.dataset.id), +el.dataset.l); if (err) toast(err, 'bad'); autosave(); rerender(); };
Act.draftPick = el => { const S = App.S; const p = makeDraftPick(S, +el.dataset.id); toast(`You selected ${pname(p)}!`, 'good'); autosave(); rerender(); };
Act.draftAuto = () => { const S = App.S; const p = aiPick(S); if (p) toast(`Staff selected ${pname(p)}.`); autosave(); rerender(); };
Act.draftSim = async el => {
  const S = App.S, D = S.draft, mode = el.dataset.mode;
  if (mode === 'one') { if (!D.done && D.picks[D.cur].tid !== S.user) aiPick(S); rerender(); return; }
  busy('On the clock', '', false);
  await sleep(20);
  let n = 0;
  while (!D.done && !(D.picks[D.cur].tid === S.user && mode === 'mine')) { if (D.picks[D.cur].tid === S.user && mode === 'all') { aiPick(S); continue; } aiPick(S); if (++n % 10 === 0) { busySub(`Pick ${D.cur + 1}`); await sleep(0); } }
  busy(null); autosave(); rerender();
  if (D.picks[D.cur] && D.picks[D.cur].tid === S.user && !D.done) toast("You're on the clock!", 'good');
};

// ---------- lottery ----------
Screens.lottery = {
  render() {
    const S = App.S;
    if (S.phase !== PH.LOTTERY && !S.lottery) return `${pageHead('Draft Lottery')}<div class="empty">The lottery is held after the playoffs.</div>`;
    if (!S.lottery) {
      const lt = lotteryTeams(S);
      return `${pageHead('Draft Lottery', `${S.season + 1} Draft · 14 non-playoff teams · top three picks are drawn`, btn('Run the Lottery', 'runLottery', 'gold lg'))}
        ${panel('Lottery Odds', sortTable('lo', [{ l: 'Seed', n: 1, f: (t) => lt.indexOf(t) + 1 }, { l: 'Team', f: t => `<span class="row tight">${logo(t, 22)} ${E(tname(t))}</span>` }, { l: 'Record', f: t => rec(t) }, { l: 'Odds for #1', n: 1, f: t => (LOTTO_ODDS[lt.indexOf(t)] / 10).toFixed(1) + '%' }], lt, { rowCls: t => t.tid === S.user ? 'me' : '' }), { flush: true })}`;
    }
    const L = S.lottery;
    const shown = App.lotShown != null ? App.lotShown : 0;
    const rows = L.results.slice().reverse().map((r, i) => {
      const t = S.teams[r.tid];
      const idx = L.results.length - 1 - i; // 13..0
      const vis = idx >= L.results.length - shown;
      const jump = r.seed - r.pick;
      return `<div class="lot-row ${vis ? 'reveal' : 'hidden'}" style="${r.tid === S.user && vis ? 'border-color:var(--gold)' : ''}"><div class="pk">${r.pick}</div><div class="row">${vis ? logo(t, 34) : ''}<div><div class="b">${vis ? E(tname(t)) : '???'}</div>${vis ? `<div class="tiny mute">Seed ${r.seed} · ${r.odds}% odds</div>` : ''}</div></div><div>${vis && jump > 0 ? `<span class="chip good">▲ ${jump}</span>` : vis && jump < 0 ? `<span class="chip bad">▼ ${-jump}</span>` : ''}</div></div>`;
    }).reverse().join('');
    const done = shown >= L.results.length;
    return `${pageHead('Draft Lottery', `${L.year} Draft order`, done ? btn('Enter the Draft Room ▸', 'goDraft', 'gold lg') : btn('Reveal All', 'lotAll', ''))}<div class="lotto" style="max-width:640px">${rows}</div>`;
  },
  after() {
    const S = App.S;
    if (!S.lottery || App.lotShown == null || App.lotShown >= S.lottery.results.length || App.lotTimer) return;
    App.lotTimer = setTimeout(() => { App.lotTimer = null; App.lotShown++; if (App.route === 'lottery') rerender(); }, App.lotShown >= S.lottery.results.length - 3 ? 1400 : 450);
  },
};
Act.runLottery = () => { const S = App.S; runLottery(S); S.phase = PH.DRAFT; App.lotShown = 0; autosave(); rerender(); };
Act.lotAll = () => { App.lotShown = App.S.lottery.results.length; rerender(); };

// ---------- fantasy draft ----------
Screens.fdraft = {
  render() {
    const S = App.S, F = S.fdraft;
    if (!F) return `${pageHead('Fantasy Draft')}<div class="empty">No fantasy draft in progress.</div>`;
    const pk = F.done ? null : F.picks[F.cur];
    const mine = pk && pk.tid === S.user;
    const pool = fdPool(S);
    const ros = U.sortBy(roster(S, S.user), p => p.ovr);
    const cols = [{ l: 'Player', k: 'n', s: p => p.ln, f: p => `${plink(p)} ${injChip(p)}` }, { l: 'Pos', k: 'pos', s: p => POS_IDX[p.pos], f: p => p.pos }, { l: 'Age', k: 'age', n: 1, f: p => p.age },
    { l: 'OVR', k: 'ovr', c: 1, f: p => rt(p.ovr) }, { l: 'POT', k: 'pot', c: 1, s: p => Math.max(p.pot, p.ovr), f: p => potStr(S, p) }, { l: 'Salary', k: 'sal', n: 1, s: p => p.contract.amt, f: p => `${U.money(p.contract.amt)} <span class="mute">× ${Math.max(1, p.contract.exp - S.season + 1)}</span>` },
    { l: 'Type', k: 'pers', f: p => `<span class="small mute">${PERSONALITIES[p.pers].n}</span>` }];
    if (mine) cols.push({ l: '', f: p => btn('Draft', 'fdPick', 'gold sm', { id: p.pid }) });
    const log = F.picks.slice(0, F.cur).reverse().slice(0, 40).map((k, i) => `<div class="row small" style="padding:3px 0;${k.tid === S.user ? 'color:var(--gold2)' : ''}"><span class="num dim" style="width:30px">${F.cur - i}</span>${logo(S.teams[k.tid], 18)}<b>${S.teams[k.tid].abbr}</b> ${plink(P(S, k.pid))} <span class="dim">${P(S, k.pid).pos} ${P(S, k.pid).ovr}</span></div>`).join('');
    return `${pageHead('Fantasy Draft', F.done ? 'Complete' : `Round ${pk.rd} of 13 · Pick ${F.cur + 1} of ${F.picks.length}`, F.done ? btn('Franchise Central ▸', 'go', 'gold', { r: 'home' }) : '')}
      <div class="grid g-main" style="margin-bottom:14px">
        ${panel(F.done ? 'Draft Complete' : mine ? '<span class="gold">You\'re on the clock!</span>' : 'On the Clock', F.done ? `<p>Rosters are set. Payroll: ${U.money(payroll(S, S.user))} (cap ${U.money(S.cap)}).</p>` : `<div class="row">${logo(S.teams[pk.tid], 56)}<div style="font:800 26px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg)">${E(tname(S.teams[pk.tid]))}</div></div><hr class="sep"><div class="row">${mine ? btn('Auto-pick for me', 'fdAuto', '') : btn('Sim to my pick', 'fdSim', 'gold', { m: 'mine' })}${btn('Auto-draft the rest', 'fdSim', 'ghost', { m: 'all' })}</div>`)}
        ${panel(`Your Roster (${ros.length})`, ros.map(p => `<div class="row between small" style="padding:3px 0"><span><span class="dim">${p.pos}</span> ${plink(p)}</span><span>${rt(p.ovr)} <span class="mute num">${U.money(p.contract.amt)}</span></span></div>`).join('') || '<div class="empty small">No picks yet.</div>')}
      </div>
      ${F.done ? '' : panel('Player Pool', sortTable('fdpool', cols, pool, { sort: { k: 'ovr', d: true }, maxh: 640 }), { flush: true })}
      ${log ? panel('Recent Picks', log, { style: 'margin-top:14px' }) : ''}`;
  },
};
Act.fdPick = el => { const S = App.S; const p = fdPick(S, +el.dataset.id); toast(`You drafted ${pname(p)}.`, 'good'); autosave(); rerender(); };
Act.fdAuto = () => { const S = App.S; const p = fdAI(S); toast(`Staff drafted ${pname(p)}.`); autosave(); rerender(); };
Act.fdSim = async el => {
  const S = App.S, F = S.fdraft, m = el.dataset.m;
  busy('Fantasy draft', '');
  await sleep(20);
  let n = 0;
  while (!F.done && !(m === 'mine' && F.picks[F.cur].tid === S.user)) { fdAI(S); if (++n % 15 === 0) { busySub(`Pick ${F.cur + 1}`); await sleep(0); } }
  busy(null); autosave(); rerender();
  if (F.done) toast('Fantasy draft complete!', 'good');
};

// ---------- create-a-player ----------
Act.capOpen = () => { App.cap = App.cap || { fn: '', ln: '', pos: 'SF', age: 22, hgt: 79, arch: 0, ovr: 72, country: 'USA' }; capModal(); };
function capModal() {
  const C = App.cap;
  const archs = ARCH[C.pos];
  if (C.arch >= archs.length) C.arch = 0;
  const body = `<div class="grid g2">
    <label class="fld">First name<input type="text" maxlength="16" value="${E(C.fn)}" data-i="capF" data-k="fn"></label>
    <label class="fld">Last name<input type="text" maxlength="18" value="${E(C.ln)}" data-i="capF" data-k="ln"></label>
  </div>
  <div class="fld" style="margin-top:10px">Position ${seg('cappos', POSS.map(p => [p, p]), C.pos, 'capPos')}</div>
  <div class="fld" style="margin-top:10px">Style ${seg('caparch', archs.map((a, i) => [i, a[0]]), C.arch, 'capArch')}</div>
  <div class="grid g3" style="margin-top:10px">
    <label class="fld">Age <b class="num" id="capAgeL">${C.age}</b><input type="range" min="19" max="36" value="${C.age}" data-i="capR" data-k="age"></label>
    <label class="fld">Height <b class="num" id="capHgtL">${U.hgt(C.hgt)}</b><input type="range" min="70" max="89" value="${C.hgt}" data-i="capR" data-k="hgt"></label>
    <label class="fld">Overall <b class="num" id="capOvrL">${C.ovr}</b><input type="range" min="45" max="99" value="${C.ovr}" data-i="capR" data-k="ovr"></label>
  </div>
  <p class="tiny mute">Your creation joins the free-agent pool with a fair asking price. Younger players get more upside.</p>`;
  modal('Create a Player', body, `${btn('Cancel', 'closeModal', 'ghost')}${btn('Create', 'capMake', 'gold')}`, { size: 'md' });
}
Act.capF = el => { App.cap[el.dataset.k] = el.value; };
Act.capR = el => { const k = el.dataset.k; App.cap[k] = +el.value; const l = $('#cap' + k[0].toUpperCase() + k.slice(1) + 'L'); if (l) l.textContent = k === 'hgt' ? U.hgt(+el.value) : el.value; };
Act.capPos = el => { App.cap.pos = el.dataset.k; App.cap.arch = 0; App.cap.hgt = Math.round(HGT[App.cap.pos][0]); capModal(); };
Act.capArch = el => { App.cap.arch = +el.dataset.k; capModal(); };
Act.capMake = () => {
  const S = App.S, C = App.cap;
  const fn = (C.fn || '').trim() || 'Rookie', ln = (C.ln || '').trim() || 'Phenom';
  // search for a talent level that lands on the requested overall
  let best = null;
  for (let i = 0; i < 40; i++) {
    const talent = 50 + (C.ovr - 70) / 0.85 + U.gauss(0, 1.5);
    const p = genPlayer(S, { pos: C.pos, talent, age: C.age, tid: -1, name: { fn, ln, country: C.country } });
    if (!best || Math.abs(p.ovr - C.ovr) < Math.abs(best.ovr - C.ovr)) best = p;
    if (Math.abs(p.ovr - C.ovr) <= 1) break;
  }
  const p = best;
  S.nextPid = Math.max(S.nextPid, p.pid + 1);
  const arch = ARCH[C.pos][C.arch];
  p.arch = arch[0];
  const hd = C.hgt - p.hgt; p.hgt = C.hgt; p.r.orb = U.clamp(p.r.orb + hd * 2, 15, 99); p.r.drb = U.clamp(p.r.drb + hd * 2, 15, 99); p.r.blk = U.clamp(p.r.blk + hd * 2, 15, 99); p.r.spd = U.clamp(p.r.spd - hd * 1.5, 15, 99);
  p.ovr = calcOvr(p.r, p.pos);
  const fix = C.ovr - p.ovr; if (fix) { for (const k in OVR_W[p.pos]) p.r[k] = Math.round(U.clamp(p.r[k] + fix, 15, 99)); p.ovr = calcOvr(p.r, p.pos); }
  p.pot = potFor(p.ovr, p.age); p.yrsPro = Math.max(0, C.age - 21); p.college = 'Created Player';
  p.draft = { year: S.season, rd: 0, pick: 0, tid: -1 };
  const a = contractAsk(S, p, -1); p.ask = { amt: a.amt, yrs: a.yrs, base: a.amt }; p.contract = { amt: a.amt, exp: S.season };
  if (S.phase === PH.FA && S.fa) p.fa = { offers: [] };
  addPlayer(S, p);
  App.cap = null; closeModal(); autosave(); rerender();
  toast(`${pname(p)} (${p.pos}, ${p.ovr} OVR) is in the free-agent pool.`, 'good');
  openPlayer(p.pid);
};
