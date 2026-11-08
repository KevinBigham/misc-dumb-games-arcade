// ===== ui/screens_owner.js — finances, pricing, arena, staff, relocation =====
const REV_LABELS = { tix: 'Ticket sales', suites: 'Luxury suites', conc: 'Concessions', merch: 'Merchandise', park: 'Parking', media: 'Local TV & radio', tv: 'National TV share', po: 'Playoff gates', naming: 'Naming rights', ads: 'Sponsors & ads' };
const EXP_LABELS = { sal: 'Player salaries', staff: 'Staff salaries', ops: 'Arena operations', mkt: 'Marketing', tax: 'Luxury tax', build: 'Construction & upgrades', debt: 'Arena debt service' };
Screens.owner = {
  render() {
    const S = App.S, t = S.teams[S.user], L = t.fin;
    const last = t.finHist[t.finHist.length - 1];
    const rev = ledgerTotal(L.rev), exp = ledgerTotal(L.exp);
    const line = (lab, cur, prev) => `<tr><td>${lab}</td><td class="n">${U.money(cur, 2)}</td><td class="n mute">${prev != null ? U.money(prev, 2) : '—'}</td></tr>`;
    const cur = U.seasonLabel(offseason(S) ? S.season + 1 : S.season);
    const ledger = `<div class="tw"><table class="t"><thead><tr><th>Revenue</th><th class="n">${cur}</th><th class="n">Last season</th></tr></thead><tbody>${Object.keys(REV_LABELS).map(k => line(REV_LABELS[k], L.rev[k], last ? last.rev[k] : null)).join('')}<tr class="sep"><td class="b">Total revenue</td><td class="n b good">${U.money(rev, 2)}</td><td class="n mute">${last ? U.money(ledgerTotal(last.rev), 2) : '—'}</td></tr></tbody></table></div>
      <div class="tw" style="margin-top:12px"><table class="t"><thead><tr><th>Expenses</th><th class="n">${cur}</th><th class="n">Last season</th></tr></thead><tbody>${Object.keys(EXP_LABELS).map(k => line(EXP_LABELS[k], L.exp[k], last ? last.exp[k] : null)).join('')}<tr class="sep"><td class="b">Total expenses</td><td class="n b bad">${U.money(exp, 2)}</td><td class="n mute">${last ? U.money(ledgerTotal(last.exp), 2) : '—'}</td></tr></tbody></table></div>`;
    const hist = t.finHist.slice(-10);
    const chart = hist.length ? barChart(hist.map(h => ({ l: String(h.s).slice(2), v: h.profit / 1000 })), '$M profit') : '<div class="empty small">Your first season is still in progress.</div>';
    const pay = payroll(S, S.user);
    return `${pageHead("Owner's Box", `${E(S.ownerName)} · ${E(tname(t))}`, `${btn('Tickets & Pricing', 'go', '', { r: 'tickets' })}${btn('Arena', 'go', '', { r: 'arena' })}`)}
      <div class="grid g4" style="margin-bottom:14px">
        ${panel('Cash on Hand', `<div class="big ${t.cash < 0 ? 'bad' : ''}">${U.money(t.cash)}</div><div class="tiny mute">live balance</div>`)}
        ${panel('Profit to Date', `<div class="big ${rev - exp >= 0 ? 'good' : 'bad'}">${U.money(rev - exp)}</div><div class="tiny mute">${L.hg} home games played</div>`)}
        ${panel('Payroll', `<div class="big">${U.money(pay)}</div><div class="tiny ${pay > S.tax ? 'bad' : 'mute'}">${pay > S.tax ? `Over the tax line by ${U.money(pay - S.tax)} — taxed 1:1` : `Tax line ${U.money(S.tax)}`}</div>`)}
        ${panel('Attendance', `<div class="big">${L.hg ? Math.round(L.att / L.hg).toLocaleString() : '—'}</div><div class="tiny mute">capacity ${t.arena.cap.toLocaleString()} · ${L.sell} sellouts</div>`)}
      </div>
      <div class="grid g-main">
        ${panel('Ledger', ledger, { flush: true })}
        <div class="stack">
          ${panel('Profit History', chart)}
          ${panel('Marketing Budget', `<p class="small mute" style="margin-top:0">Advertising keeps hype from fading. Cost is per season.</p>${seg('mkt', MKT.map((m, i) => [i, `${m.n}${m.cost ? ' · ' + U.money(m.cost) : ''}`]), t.mkt, 'setMkt')}`)}
          ${panel('The Fan Base', `<div class="stack small">${meter('Fan happiness', t.fan)}${meter('Hype', t.hype)}</div><p class="tiny mute" style="margin-bottom:0">Fans respond to winning, fair prices and a good building. Hype drives demand; marketing keeps it up.</p>`)}
          ${t.debt ? panel('Arena Debt', `<div class="kv small"><span>Annual payment</span><span>${U.money(t.debt.amt)}</span><span>Years left</span><span>${t.debt.yrs}</span></div>`) : ''}
        </div>
      </div>`;
  },
};
Act.setMkt = el => { App.S.teams[App.S.user].mkt = +el.dataset.k; autosave(); rerender(); };
function barChart(data, unit) {
  const W = 360, H = 150, pad = 26;
  const mx = Math.max(1, ...data.map(d => Math.abs(d.v)));
  const hasNeg = data.some(d => d.v < 0);
  const zero = hasNeg ? pad + (H - pad * 2) / 2 : H - pad;
  const scale = (hasNeg ? (H - pad * 2) / 2 : H - pad * 2) / mx;
  const bw = (W - pad * 2) / data.length;
  const bars = data.map((d, i) => { const h = Math.abs(d.v) * scale; const y = d.v >= 0 ? zero - h : zero; return `<rect x="${pad + i * bw + 3}" y="${y}" width="${bw - 6}" height="${Math.max(1, h)}" rx="2" fill="${d.v >= 0 ? '#3ddc84' : '#ff5d5d'}"/><text x="${pad + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle" font-size="10" fill="#8e9cb6" font-family="Chakra Petch, monospace">'${d.l}</text><text x="${pad + i * bw + bw / 2}" y="${d.v >= 0 ? y - 3 : y + h + 10}" text-anchor="middle" font-size="9.5" fill="#e8eef8" font-family="Chakra Petch, monospace">${d.v.toFixed(1)}</text>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%" role="img" aria-label="Profit by season">${`<line x1="${pad}" x2="${W - pad}" y1="${zero}" y2="${zero}" stroke="#33466b"/>`}${bars}<text x="4" y="12" font-size="10" fill="#8e9cb6">${unit}</text></svg>`;
}

Screens.tickets = {
  render() {
    const S = App.S, t = S.teams[S.user];
    const pf = priceFactor(t.pop) * infl(S);
    const opp = S.teams[(S.user + 7) % 30];
    const g = gateProjection(S, t, null, 0);
    const seats = seatMap(t);
    const perGame = g.tix + g.conc + g.merch + g.park + g.suites;
    const fairTxt = g.fair < 0.85 ? ['good', 'A bargain — fans love it'] : g.fair < 1.05 ? ['good', 'Fair'] : g.fair < 1.2 ? ['warn', 'Steep — some grumbling'] : g.fair < 1.4 ? ['bad', 'Expensive — talk radio is furious'] : ['bad', 'Outrageous — expect empty seats'];
    const row = (k, label, unit) => {
      const ref = Math.round(REF[k] * pf);
      const step = k === 'court' ? 5 : k === 'suite' ? 5 : 1;
      const max = Math.round(ref * 2.6);
      return `<div class="stack" style="gap:4px;padding:8px 0;border-bottom:1px solid var(--line)"><div class="row between"><span class="b">${label} <span class="tiny mute">${unit}</span></span><span class="num gold" id="pl-${k}">${k === 'suite' ? U.money(t.prices[k]) : U.dollars(t.prices[k])}</span></div><input type="range" min="${Math.max(1, Math.round(ref * 0.3))}" max="${max}" step="${step}" value="${t.prices[k]}" data-i="setPrice" data-k="${k}" aria-label="${label} price"><div class="tiny dim">Fan-fair price ≈ ${k === 'suite' ? U.money(ref) : U.dollars(ref)}</div></div>`;
    };
    return `${pageHead('Tickets & Pricing', 'Set your prices. Projections assume an average opponent at current hype and record.', btn('Reset to fair prices', 'resetPrices', 'ghost'))}
      <div class="grid g-main">
        ${panel('Prices', PRICE_KEYS.map(([k, l, u]) => row(k, l, u)).join(''))}
        <div class="stack">
          ${panel('Projected Home Game', `<div class="kv"><span>Attendance</span><span class="b">${g.att.toLocaleString()} / ${g.cap.toLocaleString()}</span><span>Courtside fill</span><span>${Math.round(g.fill.court * 100)}% of ${seats.court}</span><span>Lower bowl fill</span><span>${Math.round(g.fill.lower * 100)}% of ${seats.lower.toLocaleString()}</span><span>Upper deck fill</span><span>${Math.round(g.fill.upper * 100)}% of ${seats.upper.toLocaleString()}</span><span>Suites leased</span><span>${Math.round(g.sOcc * 100)}% of ${t.arena.suites}</span></div>
            <hr class="sep"><div class="kv"><span>Tickets</span><span>${U.money(g.tix, 2)}</span><span>Concessions</span><span>${U.money(g.conc, 2)}</span><span>Merchandise</span><span>${U.money(g.merch, 2)}</span><span>Parking</span><span>${U.money(g.park, 2)}</span><span>Suites (per game)</span><span>${U.money(g.suites, 2)}</span><span class="b">Per game</span><span class="b gold">${U.money(perGame, 2)}</span><span class="b">Per season (41)</span><span class="b">${U.money(perGame * 41)}</span></div>`)}
          ${panel('Fan Reaction', `<div class="row"><span class="chip ${fairTxt[0]}">${fairTxt[1]}</span><span class="num mute">${Math.round(g.fair * 100)}% of fair</span></div><p class="small mute" style="margin-bottom:0">Fans weigh lower-bowl and upper-deck tickets most, then food, drinks and parking. Fan happiness moves a little after every home game.</p>`)}
          ${panel('Demand Drivers', `<div class="kv small"><span>Demand index</span><span>${Math.round(g.dem * 100)}</span><span>Hype</span><span>${Math.round(t.hype)}</span><span>Fan happiness</span><span>${Math.round(t.fan)}</span><span>Market</span><span>${t.pop.toFixed(1)}M</span><span>Arena condition</span><span>${Math.round(t.arena.cond)}</span></div>`)}
        </div>
      </div>`;
  },
};
Act.setPrice = el => {
  const S = App.S, t = S.teams[S.user], k = el.dataset.k;
  t.prices[k] = +el.value;
  const l = $('#pl-' + k); if (l) l.textContent = k === 'suite' ? U.money(t.prices[k]) : U.dollars(t.prices[k]);
  clearTimeout(App.priceT); App.priceT = setTimeout(() => { autosave(); rerender(); }, 250);
};
Act.resetPrices = () => { const S = App.S, t = S.teams[S.user], pf = priceFactor(t.pop) * infl(S); for (const [k] of PRICE_KEYS) t.prices[k] = Math.round(REF[k] * pf / (k === 'court' || k === 'suite' ? 5 : 1)) * (k === 'court' || k === 'suite' ? 5 : 1); autosave(); rerender(); };

Screens.arena = {
  render() {
    const S = App.S, t = S.teams[S.user], A = t.arena;
    const ups = Object.entries(UPGRADES).map(([k, u]) => {
      const lvl = A.up[k];
      const cost = lvl < 3 ? u.cost[lvl] * infl(S) : 0;
      return `<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="grow"><div class="b">${u.n} <span class="gold">${'★'.repeat(lvl)}<span class="dim">${'★'.repeat(3 - lvl)}</span></span></div><div class="small mute">${u.d}</div></div>${lvl < 3 ? btn(`Upgrade · ${U.money(cost)}`, 'buyUp', t.cash >= cost ? 'gold sm' : 'sm', { k }) : '<span class="chip gold">Maxed</span>'}</div>`;
    }).join('');
    const rc = renovateCost(t);
    const caps = [17500, 19000, 20500, 22000];
    const capSel = App.ui.arenaCap || 20500;
    const q = arenaQuote(S, t, capSel);
    const build = A.build ? `<p>Construction underway: <b>${A.build.cap.toLocaleString()} seats</b>, opens in ${A.build.left} season${A.build.left > 1 ? 's' : ''}. Your share: ${U.money(A.build.own)} financed over 15 years.</p>`
      : `<p class="small mute" style="margin-top:0">A new building resets condition, adds suites and gets the fans buzzing. The city chips in based on fan support.</p><div class="fld">Capacity ${seg('acap', caps.map(c => [c, c.toLocaleString()]), capSel, 'arenaCap')}</div>
        <div class="kv small" style="margin-top:10px"><span>Total cost</span><span>${U.money(q.cost)}</span><span>Public funding</span><span class="${q.pub >= 0.3 ? 'good' : 'warn'}">${Math.round(q.pub * 100)}%</span><span>Your share</span><span>${U.money(q.own)}</span><span>Annual debt payment</span><span>${U.money(Math.round(q.own / 15))} × 15 yrs</span><span>Construction</span><span>2 seasons</span></div>
        <div style="margin-top:10px">${btn('Break Ground', 'buildArena', 'gold')}</div>`;
    return `${pageHead('Arena', E(A.name))}
      <div class="grid g-main">
        ${panel('Upgrades', ups + `<p class="tiny mute">Upgrades take effect immediately. Cash: ${U.money(t.cash)}.</p>`)}
        <div class="stack">
          ${panel('The Building', `<div class="kv"><span>Name</span><span>${E(A.name)}</span><span>Capacity</span><span>${A.cap.toLocaleString()}</span><span>Luxury suites</span><span>${A.suites}</span><span>Opened</span><span>${A.built}</span><span>Naming rights</span><span>${A.naming ? `${E(A.naming.corp)} · ${U.money(A.naming.amt)}/yr · ${A.naming.yrs} yrs` : 'Unsold'}</span></div>
            <div style="margin-top:10px">${meter('Condition', A.cond)}</div><div class="row" style="margin-top:10px">${rc > 0 ? btn(`Renovate · ${U.money(rc)}`, 'renovate', t.cash >= rc ? 'gold sm' : 'sm') : '<span class="chip good">Spotless</span>'}${!A.naming ? btn('Shop naming rights', 'shopNaming', 'sm') : ''}</div>`)}
          ${panel('New Arena', build)}
          ${panel('In the Rafters', (t.rafters || []).length ? `<div class="row">${t.rafters.map(r => `<div class="c" style="background:${t.c1};color:${textOn(t.c1)};padding:10px 12px 14px;clip-path:polygon(0 0,100% 0,100% 85%,50% 100%,0 85%);min-width:84px"><div style="font:900 30px/1 var(--f-disp)">${r.num}</div><div class="tiny" style="white-space:normal">${E(r.n)}</div></div>`).join('')}</div>` : '<div class="small mute">No retired numbers yet. Honor a franchise great from his player card after he retires (four seasons with your team, or a Hall of Famer).</div>')}
        </div>
      </div>`;
  },
};
Act.buyUp = el => { const S = App.S, t = S.teams[S.user], k = el.dataset.k; const lvl = t.arena.up[k]; const cost = Math.round(UPGRADES[k].cost[lvl] * infl(S)); confirmBox(`Upgrade ${UPGRADES[k].n}?`, `Cost: ${U.money(cost)} from cash on hand (${U.money(t.cash)}).`, 'Buy', () => { const save = UPGRADES[k].cost[lvl]; UPGRADES[k].cost[lvl] = cost; const err = buyUpgrade(S, t, k); UPGRADES[k].cost[lvl] = save; if (err) toast(err, 'bad'); else { toast(`${UPGRADES[k].n} upgraded!`, 'good'); addNews(S, { type: 'arena', tids: [t.tid], local: true, h: `${t.name} invest ${U.money(cost)} in ${UPGRADES[k].n.toLowerCase()}`, b: `${S.ownerName} keeps spending on ${t.arena.name}.`, imp: 1 }); autosave(); } rerender(); }); };
Act.renovate = () => { const S = App.S, t = S.teams[S.user]; confirmBox('Renovate the arena?', `Restores condition to 100 for ${U.money(renovateCost(t))}.`, 'Renovate', () => { const err = renovate(S, t); if (err) toast(err, 'bad'); else { toast('Renovations complete.', 'good'); autosave(); } rerender(); }); };
Act.arenaCap = el => { App.ui.arenaCap = +el.dataset.k; rerender(); };
Act.buildArena = () => {
  const S = App.S, t = S.teams[S.user], cap = App.ui.arenaCap || 20500;
  const q = arenaQuote(S, t, cap);
  confirmBox('Break ground?', `A ${cap.toLocaleString()}-seat arena for ${U.money(q.cost)}. The city covers ${Math.round(q.pub * 100)}%; you finance ${U.money(q.own)} at ${U.money(Math.round(q.own / 15))} a year for 15 years. Opens in two seasons.`, 'Build It', () => {
    startArena(S, t, cap, q.pub);
    addNews(S, { type: 'arena', tids: [t.tid], h: `${tname(t)} break ground on a new arena`, b: `The ${cap.toLocaleString()}-seat building opens in two seasons. Public funding covers ${Math.round(q.pub * 100)}% of the ${U.money(q.cost)} price tag.`, imp: 3, local: true });
    t.hype = Math.min(100, t.hype + 6);
    autosave(); rerender(); toast('Shovels in the ground!', 'good');
  });
};
Act.shopNaming = () => { const S = App.S, t = S.teams[S.user]; offerNaming(S, t); toast('A sponsor sent a proposal to your inbox.'); autosave(); rerender(); };

Screens.staff = {
  render() {
    const S = App.S, t = S.teams[S.user];
    const canHire = S.phase >= PH.END || S.phase === PH.PRE;
    if (!S.staffPool) S.staffPool = genStaffPool(S);
    const rlab = { off: 'Offense', def: 'Defense', dev: 'Development', mot: 'Motivation', med: 'Medicine', cond: 'Conditioning', eval: 'Evaluation', net: 'Network' };
    const card = (st, role) => `<div class="panel" style="padding:12px"><div class="eyebrow">${STAFF_ROLES[role]}</div><div class="row between"><div style="font:800 22px/1.1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg)">${E(staffName(st))}</div>${rt(staffOvr(st))}</div>
      <div class="kv small" style="margin-top:8px">${Object.entries(st.r).map(([k, v]) => `<span>${rlab[k]}</span><span>${v}</span>`).join('')}<span>Salary</span><span>${U.money(st.sal)}</span><span>Contract thru</span><span>${U.seasonLabel(st.exp)}</span>${role === 'hc' ? `<span>Record</span><span>${st.wins}-${st.losses}${st.titles ? ` · ${st.titles} title${st.titles > 1 ? 's' : ''}` : ''}</span>` : ''}</div>
      ${canHire && st.exp <= S.season + (offseason(S) ? 0 : -1) + 0 ? `<div style="margin-top:8px">${btn('Re-sign 3 yrs', 'staffResign', 'gold sm', { role })}</div>` : ''}</div>`;
    const pool = S.staffPool.map(st => `<tr><td>${STAFF_ROLES[st.role]}</td><td class="b">${E(staffName(st))}</td><td class="c">${rt(staffOvr(st))}</td><td class="small">${Object.entries(st.r).map(([k, v]) => `${rlab[k]} ${v}`).join(' · ')}</td><td class="n">${U.money(st.sal)}</td><td>${canHire ? btn('Hire', 'staffHire', 'sm gold', { id: st.id }) : ''}</td></tr>`).join('');
    return `${pageHead('Staff', canHire ? 'Hire and fire in the offseason and preseason.' : 'Staff moves open up after the season.')}
      <div class="grid g4">${['hc', 'asst', 'trainer', 'scout'].map(r => card(t.staff[r], r)).join('')}</div>
      <p class="tiny mute">Head coach offense/defense nudge every possession; development and your assistant drive offseason growth and camp gains; the trainer cuts injury time; the scout sharpens draft reads and adds scouting points.</p>
      ${panel('Available Staff', `<div class="tw"><table class="t"><thead><tr><th>Role</th><th>Name</th><th class="c">OVR</th><th>Ratings</th><th class="n">Asking</th><th></th></tr></thead><tbody>${pool}</tbody></table></div>`, { flush: true, style: 'margin-top:14px' })}`;
  },
};
Act.staffHire = el => {
  const S = App.S, t = S.teams[S.user];
  const st = S.staffPool.find(x => x.id === +el.dataset.id);
  const cur = t.staff[st.role];
  const left = Math.max(0, cur.exp - (offseason(S) ? S.season : S.season - 1));
  const buyout = left * cur.sal;
  confirmBox(`Hire ${E(staffName(st))}?`, `${E(staffName(cur))} will be let go${buyout ? ` (buyout ${U.money(buyout)})` : ''}. ${E(staffName(st))} signs for 3 seasons at ${U.money(st.sal)} a year.`, 'Hire', () => {
    t.cash -= buyout; t.fin.exp.staff += buyout;
    st.exp = (offseason(S) ? S.season + 1 : S.season) + 2;
    t.staff[st.role] = st;
    S.staffPool = S.staffPool.filter(x => x !== st);
    cur.exp = S.season; S.staffPool.push(cur);
    if (st.role === 'hc') addNews(S, { type: 'coach', tids: [t.tid], h: `${tname(t)} hire ${staffName(st)} as head coach`, b: `${staffName(cur)} is out.`, imp: 2, local: true });
    if (st.role === 'scout') S.scout.max = scoutPoints(S);
    autosave(); rerender(); toast(`${staffName(st)} hired.`, 'good');
  });
};
Act.staffResign = el => { const S = App.S, t = S.teams[S.user], st = t.staff[el.dataset.role]; st.exp = (offseason(S) ? S.season + 1 : S.season) + 2; st.sal = Math.round(st.sal * 1.08 / 10) * 10; toast(`${staffName(st)} re-signed through ${U.seasonLabel(st.exp)}.`, 'good'); autosave(); rerender(); };

Screens.relocate = {
  render() {
    const S = App.S, t = S.teams[S.user];
    if (!offseason(S)) return `${pageHead('Relocation')}<div class="empty">Relocation requests can only be filed in the offseason.</div>`;
    const R = App.relo || (App.relo = { city: null, name: '', c1: t.c1, c2: t.c2 });
    const taken = new Set(S.teams.map(x => x.region));
    const cities = RELO_CITIES.filter(c => !taken.has(c[0]));
    const fee = Math.round(40000 * infl(S));
    const list = cities.map(([c, pop]) => `<button class="tcard ${R.city === c ? 'on' : ''}" style="width:100%" data-a="reloCity" data-c="${E(c)}"><div class="grow"><div class="b">${E(c)}</div><div class="tiny mute">Market ${pop.toFixed(1)}M · ${pop > t.pop ? '<span class="good">bigger</span>' : '<span class="warn">smaller</span>'} than ${E(t.region)}</div></div></button>`).join('');
    const pal = ['#c1272d', '#ff5a1f', '#ffb703', '#2a9d8f', '#1f7aff', '#4b2a8f', '#0a6e5c', '#1d3557', '#7b2cbf', '#d4af37', '#111827', '#e9ecef', '#00b4d8', '#8d99ae', '#ff4d8d', '#3a5a40'];
    const swatches = (key) => `<div class="row tight">${pal.map(c => `<button style="width:26px;height:26px;border-radius:4px;background:${c};border:2px solid ${R[key] === c ? '#fff' : 'transparent'};cursor:pointer" data-a="reloColor" data-k="${key}" data-c="${c}" aria-label="Color ${c}"></button>`).join('')}</div>`;
    const preview = R.city ? { tid: t.tid, abbr: reloAbbr(R.city), c1: R.c1, c2: R.c2, region: R.city, name: R.name || t.name } : null;
    return `${pageHead('Relocation', `Move the ${E(t.name)} to a new market. Fee ${U.money(fee)} plus a new arena.`)}
      <div class="grid g-main">
        ${panel('Candidate Cities', `<div class="grid g2" style="gap:6px;max-height:560px;overflow-y:auto">${list}</div>`)}
        <div class="stack">${panel('New Identity', `<label class="fld">Nickname<input type="text" maxlength="18" value="${E(R.name)}" placeholder="${E(t.name)}" data-i="reloName" id="reloName"></label>
          <div class="tiny mute" style="margin:6px 0">Ideas: ${U.shuffle(NICK_IDEAS.slice()).slice(0, 6).join(', ')}</div>
          <div class="fld">Primary color${swatches('c1')}</div><div class="fld" style="margin-top:8px">Secondary color${swatches('c2')}</div>
          ${preview ? `<div class="row" style="margin-top:14px">${logo(preview, 64)}<div style="font:800 26px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg)">${E(preview.region)} ${E(preview.name)}</div></div>` : ''}`)}
          ${panel('Rebrand Only', `<p class="small mute" style="margin-top:0">Keep ${E(t.region)}, change the name and colors. New uniforms and signage cost ${U.money(Math.round(5000 * infl(S)))}.</p>${btn('Rebrand in ' + E(t.region), 'rebrandGo', '')}`)}
          ${panel('The Deal', R.city ? (() => { const pop = RELO_CITIES.find(c => c[0] === R.city)[1]; return `<div class="kv small"><span>Relocation fee</span><span>${U.money(fee)}</span><span>New market</span><span>${pop.toFixed(1)}M</span><span>Temporary arena</span><span>16,000 seats until the new one opens</span><span>New arena</span><span>20,500 seats, city pays ~45%</span><span>Your cash</span><span>${U.money(t.cash)}</span></div><div style="margin-top:12px">${btn('Move the Franchise', 'reloGo', 'gold')}</div>`; })() : '<div class="empty small">Pick a city.</div>')}</div>
      </div>`;
  },
};
Act.rebrandGo = () => {
  const S = App.S, t = S.teams[S.user], R = App.relo;
  const name = (R.name || '').trim();
  if (!name && R.c1 === t.c1 && R.c2 === t.c2) { toast('Pick a new nickname or colors first.', 'bad'); return; }
  const cost = Math.round(5000 * infl(S));
  confirmBox('Rebrand the franchise?', `The ${E(tname(t))} become the ${E(t.region)} ${E(name || t.name)} for ${U.money(cost)}.`, 'Rebrand', () => {
    const old = tname(t);
    t.cash -= cost; t.fin.exp.build += cost;
    if (name) t.name = name; t.c1 = R.c1; t.c2 = R.c2;
    t.hype = Math.min(100, t.hype + 6);
    addNews(S, { type: 'rebrand', tids: [t.tid], h: `${old} unveil a new identity: the ${tname(t)}`, b: 'New name, new colors, same city.', imp: 3, local: true });
    App.relo = null; autosave(); applyTeamTheme(); go('home'); toast(`Say hello to the ${tname(t)}!`, 'good');
  });
};
function reloAbbr(city) { const w = city.replace(/[^A-Za-z ]/g, '').split(' '); return (w.length > 1 ? w.map(x => x[0]).join('') : city.slice(0, 3)).toUpperCase().slice(0, 3); }
Act.reloCity = el => { App.relo.city = el.dataset.c; rerender(); };
Act.reloName = el => { App.relo.name = el.value; };
Act.reloColor = el => { App.relo[el.dataset.k] = el.dataset.c; rerender(); };
Act.reloGo = () => {
  const S = App.S, t = S.teams[S.user], R = App.relo;
  const fee = Math.round(40000 * infl(S));
  const name = (R.name || t.name).trim() || t.name;
  confirmBox('Move the franchise?', `The ${E(tname(t))} become the ${E(R.city)} ${E(name)}. ${U.money(fee)} relocation fee. This cannot be undone.`, 'Relocate', () => {
    const old = tname(t);
    const pop = RELO_CITIES.find(c => c[0] === R.city)[1];
    t.cash -= fee; t.fin.exp.build += fee;
    t.region = R.city; t.name = name; t.abbr = reloAbbr(R.city); t.c1 = R.c1; t.c2 = R.c2; t.pop = pop;
    t.hype = Math.min(100, t.hype + 22); t.fan = 72;
    t.arena = { name: `${R.city} Civic Arena`, cap: 16000, suites: 30, cond: 60, built: S.season - 20, up: { suites: 0, board: 0, conc: 0, prac: t.arena.up.prac, med: t.arena.up.med, fan: 0 }, build: null, naming: null };
    const q = arenaQuote(S, t, 20500);
    startArena(S, t, 20500, Math.max(q.pub, 0.45));
    const pf = priceFactor(pop) * infl(S);
    for (const [k] of PRICE_KEYS) t.prices[k] = Math.round(REF[k] * pf);
    addNews(S, { type: 'relocate', tids: [t.tid], h: `${old} relocate to ${R.city}`, b: `Meet the ${R.city} ${name}. A new 20,500-seat arena is on the way.`, imp: 5 });
    App.relo = null;
    autosave(); applyTeamTheme(); go('home'); toast(`Welcome to ${R.city}!`, 'good');
  });
};
