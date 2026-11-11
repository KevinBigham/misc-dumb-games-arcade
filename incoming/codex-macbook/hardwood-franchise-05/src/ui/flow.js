// ===== ui/flow.js — saving, simming, phase advancement =====
const Store = {
  db: null, mode: 'idb',
  open() {
    return new Promise(res => {
      try {
        const rq = indexedDB.open('hardwood-franchise', 1);
        rq.onupgradeneeded = () => rq.result.createObjectStore('saves');
        rq.onsuccess = () => { this.db = rq.result; res(true); };
        rq.onerror = () => { this.mode = 'ls'; res(false); };
        rq.onblocked = () => { this.mode = 'ls'; res(false); };
        setTimeout(() => { if (!this.db) { this.mode = 'ls'; res(false); } }, 2500);
      } catch (e) { this.mode = 'ls'; res(false); }
    });
  },
  tx(mode, fn) {
    return new Promise((res, rej) => {
      try { const t = this.db.transaction('saves', mode); const st = t.objectStore('saves'); const r = fn(st); t.oncomplete = () => res(r && r.result); t.onerror = () => rej(t.error); } catch (e) { rej(e); }
    });
  },
  async put(key, val) {
    if (this.mode === 'idb' && this.db) { await this.tx('readwrite', st => st.put(val, key)); return true; }
    try { localStorage.setItem('hwf:' + key, JSON.stringify(val)); return true; } catch (e) { return false; }
  },
  async get(key) {
    if (this.mode === 'idb' && this.db) { return new Promise(res => { try { const r = this.db.transaction('saves').objectStore('saves').get(key); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (e) { res(null); } }); }
    try { const v = localStorage.getItem('hwf:' + key); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  },
  async del(key) {
    if (this.mode === 'idb' && this.db) { await this.tx('readwrite', st => st.delete(key)); return; }
    try { localStorage.removeItem('hwf:' + key); } catch (e) { }
  },
  async metas() {
    const m = await this.get('__index');
    return Array.isArray(m) ? m : [];
  },
};
function saveMeta(S, key) {
  const t = S.teams[S.user];
  return { key, team: tname(t), abbr: t.abbr, tid: t.tid, c1: t.c1, c2: t.c2, season: S.season, phase: S.phase, phaseLine: phaseLine(S), w: t.rec.w, l: t.rec.l, owner: S.ownerName, ts: Date.now(), titles: S.history.filter(h => h.champ === S.user).length };
}
let saveTimer = null, saving = false;
async function saveNow(quiet) {
  if (!App.S || !App.slot) return;
  if (saving) { autosave(); return; }
  saving = true;
  try {
    const data = JSON.parse(JSON.stringify(App.S));
    const ok = await Store.put(App.slot, data);
    const idx = (await Store.metas()).filter(m => m.key !== App.slot);
    idx.unshift(saveMeta(App.S, App.slot));
    await Store.put('__index', idx);
    if (!quiet) toast(ok ? 'Franchise saved.' : 'Save failed — export a backup from Save / Load.', ok ? 'good' : 'bad');
  } catch (e) { toast('Save failed: ' + e.message, 'bad'); }
  saving = false;
}
function autosave() { clearTimeout(saveTimer); saveTimer = setTimeout(() => saveNow(true), 800); }
async function loadSlot(key) {
  const data = await Store.get(key);
  if (!data) { toast('That save could not be found.', 'bad'); return false; }
  startWith(data, key);
  return true;
}
function resetTransient() { App.game = null; App.trade = null; App.neg = null; App.fo = null; App.cap = null; App.relo = null; App.ui.campPid = null; App.ui.statPO = 0; App.lotShown = null; App.mg = null; closeModal(); }
function startWith(S, key) {
  resetTransient();
  migrate(S);
  App.S = S; App.slot = key;
  reindex(S);
  go('home');
}
function migrate(S) {
  S.retired = S.retired || []; S.offers = S.offers || []; S.tradeBlock = S.tradeBlock || []; S.hof = S.hof || [];
  for (const t of S.teams) { if (!t.fin) initFinances(S, t); t.dead = t.dead || []; }
}

// ---------- advance button ----------
function advanceInfo(S) {
  switch (S.phase) {
    case PH.PRE: return S.fdraft && !S.fdraft.done ? { label: 'Fantasy Draft ▸', act: 'goFD' } : { label: 'Start Season ▸', act: 'advStart' };
    case PH.REG:
    case PH.PO:
      if (S.allStar && !S.allStar.finished) return { label: 'All-Star Weekend ▸', act: 'goAllStar' };
      if (userGameToday(S)) return { label: 'Game Day ▸', act: 'gameDay' };
      return { label: 'Sim Day ▸', act: 'simDay1' };
    case PH.END: return { label: 'Begin Offseason ▸', act: 'advOffseason' };
    case PH.LOTTERY: return { label: 'Draft Lottery ▸', act: 'goLottery' };
    case PH.DRAFT: return S.draft && S.draft.done ? { label: 'Re-sign Players ▸', act: 'advResign' } : { label: 'Draft Room ▸', act: 'goDraft' };
    case PH.RESIGN: return { label: 'Open Free Agency ▸', act: 'advFA' };
    case PH.FA: return S.fa && S.fa.day <= S.fa.days ? { label: `Next FA Day (${S.fa.day}/${S.fa.days}) ▸`, act: 'faNext' } : { label: 'Finish Free Agency ▸', act: 'faNext' };
  }
  return null;
}
Act.goAllStar = () => go('allstar');
Act.goFD = () => go('fdraft');
Act.gameDay = () => go('game');
Act.simDay1 = () => simDays(1);
Act.simN = el => simDays(+el.dataset.n, { stopAtUserGame: el.dataset.stop === '1' });
Act.simTo = el => {
  const S = App.S, k = el.dataset.k;
  if (k === 'next') simDays(400, { stopAtUserGame: true, skipFirst: true });
  else if (k === 'allstar') simDays(400, { untilDay: S.allStarDay });
  else if (k === 'deadline') simDays(400, { untilDay: S.deadlineDay + 1 });
  else if (k === 'end') simDays(400, { untilPhase: true });
  else if (k === 'round') simDays(60, { untilRound: S.playoffs ? S.playoffs.round + 1 : 0 });
  else if (k === 'po') simDays(200, { untilPhase: true });
};
async function simDays(n, o = {}) {
  const S = App.S;
  if (App.game && !App.game.applied && !App.game.o.allstar && !App.game.finished) { toast('Finish the game in progress first.', 'bad'); go('game'); return; }
  if (App.game && App.game.finished && !App.game.applied && !App.game.o.allstar) { Act.gvContinue(); return; }
  if (S.phase !== PH.REG && S.phase !== PH.PO) return;
  const healthy = roster(S, S.user).filter(p => !p.inj || p.inj.games <= 0).length;
  if (healthy < 5) { toast('You need at least 5 healthy players. Sign a free agent.', 'bad'); go('fa'); return; }
  App.simStop = false;
  busy('Simulating', phaseLine(S), n > 1);
  await sleep(20);
  let i = 0, res = 'ok';
  const ph0 = S.phase;
  while (i < n && !App.simStop) {
    if (S.phase !== PH.REG && S.phase !== PH.PO) break;
    if (S.allStar && !S.allStar.finished) break;
    if (o.stopAtUserGame && userGameToday(S) && !(o.skipFirst && i === 0)) break;
    if (o.untilDay && S.phase === PH.REG && S.day >= o.untilDay) break;
    if (o.untilRound != null && S.playoffs && S.playoffs.round >= o.untilRound) break;
    if (o.untilPhase && S.phase !== ph0) break;
    res = simDay(S);
    i++;
    busySub(phaseLine(S));
    if (res === 'champ') break;
    if (res === 'season-end' && !o.untilPhase) break;
    if (res === 'season-end' && o.untilPhase) break;
    if (i % 2 === 0) await sleep(0);
  }
  busy(null);
  autosave();
  if (S.phase === PH.END) { go('review'); return; }
  if (res === 'season-end') { toast('Regular season complete — the playoffs are set!', 'good'); go('playoffs'); return; }
  if (S.allStar && !S.allStar.finished) { toast('All-Star Weekend has arrived.', 'good'); go('allstar'); return; }
  rerender();
  if (i === 1 && App.route === 'home') {
    const g = S.sched.filter(x => x.day === S.day - 1 && (x.h === S.user || x.a === S.user))[0];
    if (g && g.hs != null) { const won = (g.h === S.user) === (g.hs > g.as); toast(`${won ? 'W' : 'L'} ${g.h === S.user ? 'vs' : '@'} ${S.teams[g.h === S.user ? g.a : g.h].abbr}, ${Math.max(g.hs, g.as)}-${Math.min(g.hs, g.as)}`, won ? 'good' : 'bad'); }
  }
}

Act.advStart = () => {
  const S = App.S;
  if (S.fdraft && !S.fdraft.done) { go('fdraft'); return; }
  const iss = userRosterIssues(S);
  if (iss.length) { modal('Roster problem', `<p>${iss.join('<br>')}</p>`, `${btn('Roster', 'go', '', { r: 'roster' })}${btn('Free Agents', 'go', 'gold', { r: 'fa' })}`, { size: 'sm' }); return; }
  const doit = () => { startRegularSeason(S); autosave(); toast(`The ${U.seasonLabel(S.season)} season is underway!`, 'good'); go('home'); };
  if (S.camp && S.camp.left > 0) confirmBox('Skip camp sessions?', `You still have ${S.camp.left} training camp session${S.camp.left > 1 ? 's' : ''} left. They'll be lost once the season starts.`, 'Start Season', doit);
  else doit();
};
Act.advOffseason = () => {
  const S = App.S;
  busy('Offseason', 'Players age, develop and retire…');
  setTimeout(() => { startOffseason(S); busy(null); autosave(); go('progress'); }, 30);
};
Act.goLottery = () => go('lottery');
Act.goDraft = () => go('draft');
Act.advResign = () => { const S = App.S; finishDraft(S); toResign(S); autosave(); go('resign'); };
Act.advFA = () => {
  const S = App.S;
  const left = roster(S, S.user).filter(p => p.contract.exp <= S.season);
  const doit = () => { toFreeAgencyPhase(S); autosave(); go('fa'); };
  if (left.length) confirmBox('Open free agency?', `${left.map(p => pname(p)).join(', ')} will become free agent${left.length > 1 ? 's' : ''}. You can still bid on them in free agency, but other teams can too.`, 'Open Free Agency', doit);
  else doit();
};
Act.faNext = () => {
  const S = App.S;
  if (S.fa.day <= S.fa.days) {
    const before = new Set(S.players.filter(p => p.tid === -1).map(p => p.pid));
    const signed = faAdvanceDay(S);
    const mine = signed.filter(p => p.tid === S.user);
    const big = signed.filter(p => p.ovr >= 78 && p.tid !== S.user).slice(0, 3);
    if (mine.length) toast(`${mine.map(p => pname(p)).join(', ')} signed with you!`, 'good');
    else if (big.length) toast(`Signed elsewhere: ${big.map(p => `${pname(p)} → ${S.teams[p.tid].abbr}`).join(', ')}`);
    autosave(); rerender();
  } else {
    busy('Wrapping up free agency', 'Teams fill out rosters…');
    setTimeout(() => {
      endFA(S); newSeason(S); busy(null); autosave();
      toast(`Welcome to the ${U.seasonLabel(S.season)} preseason.`, 'good');
      go('home');
    }, 30);
  }
};
