// ===== ui/base.js — app state, router, shell, shared widgets =====
const App = { S: null, slot: null, route: 'title', params: {}, ui: { sort: {}, tab: {}, navOpen: false }, modal: null, game: null, simStop: false };
const Screens = {};
const Act = {};
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const E = U.esc;

function go(route, params = {}) {
  if (App.game && App.game.running && route !== 'game') App.game.pause();
  App.route = route; App.params = params; App.ui.navOpen = false;
  render();
  window.scrollTo(0, 0);
}
function render() {
  const root = $('#app');
  const scr = Screens[App.route] || Screens.home;
  if (!App.S || scr.bare) { root.innerHTML = scr.render(App.params); }
  else {
    applyTeamTheme();
    root.innerHTML = shell(scr.render(App.params), App.route);
  }
  if (scr.after) scr.after(App.params);
}
function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }
function applyTeamTheme() {
  const t = App.S.teams[App.S.user];
  const r = document.documentElement.style;
  r.setProperty('--team', t.c1); r.setProperty('--team2', t.c2); r.setProperty('--teamtext', textOn(t.c1));
}
function lum(hex) { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
function textOn(hex) { return lum(hex) > 0.62 ? '#14110a' : '#ffffff'; }

// ---------- shared widgets ----------
function logo(t, size = 36) {
  if (!t) return '';
  const c1 = t.c1, c2 = t.c2, tx = textOn(c1), s = size;
  const shape = t.tid % 4;
  const ab = E(t.abbr);
  const fs = ab.length >= 3 ? 30 : 36;
  let body;
  if (shape === 0) body = `<circle cx="50" cy="50" r="46" fill="${c2}"/><circle cx="50" cy="50" r="39" fill="${c1}"/><path d="M11 58 L89 42 L89 50 L11 66Z" fill="${c2}" opacity=".35"/>`;
  else if (shape === 1) body = `<path d="M50 4 L92 16 L88 62 Q80 84 50 96 Q20 84 12 62 L8 16Z" fill="${c2}"/><path d="M50 12 L84 22 L80 60 Q73 78 50 88 Q27 78 20 60 L16 22Z" fill="${c1}"/>`;
  else if (shape === 2) body = `<path d="M50 3 L91 26 L91 74 L50 97 L9 74 L9 26Z" fill="${c2}"/><path d="M50 11 L84 30 L84 70 L50 89 L16 70 L16 30Z" fill="${c1}"/>`;
  else body = `<rect x="14" y="14" width="72" height="72" rx="10" transform="rotate(45 50 50)" fill="${c2}"/><rect x="21" y="21" width="58" height="58" rx="7" transform="rotate(45 50 50)" fill="${c1}"/>`;
  return `<svg class="logo" width="${s}" height="${s}" viewBox="0 0 100 100" aria-label="${E(tname(t))} logo">${body}<text x="50" y="51" text-anchor="middle" dominant-baseline="central" font-family="Saira Condensed, Arial Narrow, sans-serif" font-weight="800" font-style="italic" font-size="${fs}" fill="${tx}" stroke="${c2}" stroke-width="0.6">${ab}</text></svg>`;
}
function rt(v) { const c = v >= 90 ? 'r9' : v >= 80 ? 'r8' : v >= 70 ? 'r7' : v >= 60 ? 'r6' : 'r5'; return `<span class="rt ${c}">${v}</span>`; }
function gradeChip(g) { const c = g[0] === 'A' ? 'r9' : g[0] === 'B' ? 'r8' : g[0] === 'C' ? 'r7' : 'r5'; return `<span class="rt ${c}">${g}</span>`; }
function plink(p, short) { if (!p) return '—'; return `<a class="pl" data-a="player" data-id="${p.pid}">${E(short ? pshort(p) : pname(p))}</a>`; }
function tlink(t, full) { return `<a class="pl" data-a="go" data-r="team" data-tid="${t.tid}">${E(full ? tname(t) : t.abbr)}</a>`; }
function rec(t) { return `${t.rec.w}-${t.rec.l}`; }
function moodIcon(m) { const c = m >= 65 ? 'good' : m >= 40 ? 'warn' : 'bad'; return `<span class="chip ${c}" title="${moodWord(m)} (${Math.round(m)})">${m >= 65 ? '▲' : m >= 40 ? '●' : '▼'} ${moodWord(m)}</span>`; }
function injChip(p) { return p.inj && p.inj.games > 0 ? `<span class="chip bad" title="${E(p.inj.type)}">INJ ${p.inj.games}g</span>` : ''; }
function contractStr(S, p) { if (p.tid < 0) return '—'; const yrs = p.contract.exp - S.season + (offseason(S) ? 0 : 1); return `${U.money(p.contract.amt)} <span class="mute">× ${Math.max(0, yrs)}</span>`; }
function potStr(S, p) { return gradeChip(potGrade(Math.max(p.pot, p.ovr))); }
function streakStr(t) { const s = t.rec.str; return s === 0 ? '—' : (s > 0 ? 'W' : 'L') + Math.abs(s); }
function phaseLine(S) {
  if (S.phase === PH.REG) return `${U.seasonLabel(S.season)} · Day ${S.day}`;
  if (S.phase === PH.PO) return `${U.seasonLabel(S.season)} · ${ROUND_NAMES[S.playoffs.round]}`;
  if (S.phase === PH.FA && S.fa) return `${U.seasonLabel(S.season)} offseason · FA Day ${S.fa.day}/${S.fa.days}`;
  return `${U.seasonLabel(S.season)} · ${PH_NAME[S.phase]}`;
}
function sortTable(id, cols, rows, opts = {}) {
  const st = App.ui.sort[id] || opts.sort || {};
  if (st.k) {
    const col = cols.find(c => c.k === st.k);
    if (col) { const f = col.s || (r => r[col.k]); rows = rows.slice().sort((a, b) => { const x = f(a), y = f(b); return (typeof x === 'string' ? x.localeCompare(y) : x - y) * (st.d ? -1 : 1); }); }
  }
  const th = cols.map(c => `<th class="${c.n ? 'n' : ''} ${c.c ? 'c' : ''} ${c.k && c.sort !== false ? 's' : ''} ${st.k && st.k === c.k ? 'sorted' : ''}" ${c.k && c.sort !== false ? `data-a="sort" data-t="${id}" data-k="${c.k}"` : ''} title="${E(c.tip || '')}">${c.l}${st.k && st.k === c.k ? (st.d ? ' ▾' : ' ▴') : ''}</th>`).join('');
  const body = rows.map(r => `<tr class="${opts.rowCls ? opts.rowCls(r) : ''}">${cols.map(c => `<td class="${c.n ? 'n' : ''} ${c.c ? 'c' : ''}">${c.f ? c.f(r) : E(r[c.k])}</td>`).join('')}</tr>`).join('');
  return `<div class="tw"${opts.maxh ? ` style="max-height:${opts.maxh}px;overflow-y:auto"` : ''}><table class="t"><thead><tr>${th}</tr></thead><tbody>${body || `<tr><td colspan="${cols.length}" class="empty">${opts.empty || 'Nothing here yet.'}</td></tr>`}</tbody></table></div>`;
}
Act.sort = el => {
  const id = el.dataset.t, k = el.dataset.k;
  const cur = App.ui.sort[id] || {};
  App.ui.sort[id] = { k, d: cur.k === k ? !cur.d : true };
  rerender();
};
function tabs(id, list, def) {
  const cur = App.ui.tab[id] || def || list[0][0];
  return { cur, html: `<div class="tabs" role="tablist">${list.map(([k, l]) => `<button role="tab" class="${cur === k ? 'on' : ''}" data-a="tab" data-t="${id}" data-k="${k}">${l}</button>`).join('')}</div>` };
}
Act.tab = el => { App.ui.tab[el.dataset.t] = el.dataset.k; rerender(); };
function seg(id, list, cur, act) { return `<div class="seg">${list.map(([k, l]) => `<button class="${String(cur) === String(k) ? 'on' : ''}" data-a="${act}" data-t="${id}" data-k="${k}">${l}</button>`).join('')}</div>`; }
function panel(title, body, opts = {}) { return `<section class="panel ${opts.cls || ''}"${opts.style ? ` style="${opts.style}"` : ''}><div class="hd"><h3>${title}</h3>${opts.x ? `<div class="x">${opts.x}</div>` : ''}</div><div class="bd ${opts.flush ? 'flush' : ''}">${body}</div></section>`; }
function pageHead(title, sub, acts) { return `<div class="ph"><h1><span class="sl">/</span>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}${acts ? `<div class="acts row">${acts}</div>` : ''}</div>`; }
function btn(label, act, cls = '', data = {}) { return `<button class="btn ${cls}" data-a="${act}" ${Object.entries(data).map(([k, v]) => `data-${k}="${E(v)}"`).join(' ')}><span>${label}</span></button>`; }

// ---------- toasts, modals, busy ----------
function toast(msg, kind) {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + (kind || '');
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 320); }, kind === 'bad' ? 4200 : 3000);
}
function modal(title, body, foot, opts = {}) {
  App.modal = { title, body, foot, opts };
  const el = $('#modal');
  el.innerHTML = `<div class="ovl" data-a="${opts.sticky ? '' : 'modalBg'}"><div class="modal ${opts.size || ''}" role="dialog" aria-modal="true" aria-label="${E(typeof title === 'string' ? title.replace(/<[^>]+>/g, '') : '')}"><div class="mh"><h2>${title}</h2>${opts.sticky ? '' : '<button class="xbtn" data-a="closeModal" aria-label="Close">×</button>'}</div><div class="mb">${body}</div>${foot ? `<div class="mf">${foot}</div>` : ''}</div></div>`;
  if (opts.after) opts.after(el);
}
function closeModal() { $('#modal').innerHTML = ''; const m = App.modal; App.modal = null; if (m && m.opts.onClose) m.opts.onClose(); }
Act.closeModal = () => closeModal();
Act.modalBg = (el, e) => { if (e.target === el) closeModal(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && App.modal && !App.modal.opts.sticky && !App.mg) closeModal(); });
let confirmCb = null;
function confirmBox(title, text, ok, cb, cls = 'gold') {
  confirmCb = cb;
  modal(title, `<p>${text}</p>`, `${btn('Cancel', 'closeModal', 'ghost')}${btn(ok, 'confirmOk', cls)}`, { size: 'sm' });
}
Act.confirmOk = () => { const cb = confirmCb; confirmCb = null; closeModal(); if (cb) cb(); };
function busy(title, sub, stoppable) {
  const el = $('#busy');
  if (!title) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="busy"><div class="box"><div class="t">${title}</div><div class="mute" id="busySub">${sub || ''}</div>${stoppable ? `<div style="margin-top:14px">${btn('Stop', 'simStop', 'sm')}</div>` : ''}</div></div>`;
}
function busySub(text) { const el = $('#busySub'); if (el) el.textContent = text; }
Act.simStop = () => { App.simStop = true; busySub('Stopping…'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- navigation & delegation ----------
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || !el.dataset.a) return;
  const fn = Act[el.dataset.a];
  if (fn) { if (el.tagName === 'A' || el.tagName === 'BUTTON') e.preventDefault(); fn(el, e); }
});
document.addEventListener('change', e => { const el = e.target.closest('[data-c]'); if (el && Act[el.dataset.c]) Act[el.dataset.c](el, e); });
document.addEventListener('input', e => { const el = e.target.closest('[data-i]'); if (el && Act[el.dataset.i]) Act[el.dataset.i](el, e); });
Act.go = el => { const p = Object.assign({}, el.dataset); delete p.a; const r = p.r; delete p.r; for (const k in p) if (/^-?\d+$/.test(p[k])) p[k] = +p[k]; go(r, p); };
Act.burger = () => { App.ui.navOpen = !App.ui.navOpen; const n = $('.nav'); if (n) n.classList.toggle('open', App.ui.navOpen); };

function navLinks(S, route) {
  const t = S.teams[S.user];
  const ph = S.phase;
  const un = unread(S);
  const L = (r, label, extra = '', params = '') => `<a href="#" data-a="go" data-r="${r}" ${params} class="${route === r ? 'on' : ''}">${label}${extra}</a>`;
  const exp = roster(S, S.user).filter(p => p.contract.exp <= S.season).length;
  return `
  <h6>Franchise</h6>
  ${L('home', 'Franchise Central')}
  ${L('inbox', 'Inbox', un ? `<span class="badge">${un}</span>` : '')}
  ${L('news', 'Newsroom')}
  <h6>My Team</h6>
  ${L('roster', 'Roster')}
  ${L('rotation', 'Rotation &amp; Strategy')}
  ${L('schedule', 'Schedule')}
  ${S.fdraft && !S.fdraft.done ? L('fdraft', 'Fantasy Draft', '<span class="badge" style="background:var(--gold);color:#000">LIVE</span>') : ''}
  ${ph === PH.PRE ? L('camp', 'Training Camp', S.camp && S.camp.left ? `<span class="badge" style="background:var(--gold);color:#000">${S.camp.left}</span>` : '') : ''}
  <h6>League</h6>
  ${L('standings', 'Standings')}
  ${L('stats', 'Stats &amp; Leaders')}
  ${S.playoffs ? L('playoffs', 'Playoffs') : ''}
  ${S.allStar ? L('allstar', 'All-Star Weekend', !S.allStar.finished ? '<span class="badge" style="background:var(--gold);color:#000">!</span>' : '') : ''}
  ${L('history', 'History &amp; Records')}
  <h6>Front Office</h6>
  ${L('trade', 'Trade Center', S.offers.length ? `<span class="badge">${S.offers.length}</span>` : '')}
  ${L('fa', 'Free Agents', ph === PH.FA ? '<span class="badge" style="background:var(--gold);color:#000">LIVE</span>' : '')}
  ${ph === PH.RESIGN ? L('resign', 'Re-sign Players', exp ? `<span class="badge">${exp}</span>` : '') : ''}
  ${L('draft', ph === PH.DRAFT ? 'Draft Room' : 'Draft &amp; Scouting', ph === PH.DRAFT ? '<span class="badge" style="background:var(--gold);color:#000">LIVE</span>' : '')}
  <h6>Owner's Box</h6>
  ${L('owner', 'Finances')}
  ${L('tickets', 'Tickets &amp; Pricing')}
  ${L('arena', 'Arena')}
  ${L('staff', 'Staff')}
  ${offseason(S) ? L('relocate', 'Relocation') : ''}
  <h6>Game</h6>
  ${L('save', 'Save / Load')}
  ${L('help', 'How to Play')}`;
}
function tickerItems(S) {
  const items = [];
  const day = S.phase === PH.REG ? S.day - 1 : null;
  if (S.phase === PH.REG) {
    const games = S.sched.filter(g => g.day === day && g.hs != null);
    for (const g of games) { const H = S.teams[g.h], A = S.teams[g.a]; items.push(`<span><b>${A.abbr}</b> ${g.as} @ <b>${H.abbr}</b> ${g.hs}${g.ot ? ' (OT)' : ''} · Final</span>`); }
  }
  if (S.playoffs) for (const sr of S.playoffs.rounds[S.playoffs.round] || []) items.push(`<span><b>${S.teams[sr.hi].abbr}</b> ${sr.w[0]} – ${sr.w[1]} <b>${S.teams[sr.lo].abbr}</b></span>`);
  for (const n of S.news.slice(0, 10)) items.push(`<span>${E(n.h)}</span>`);
  return items.join('<span class="dim">◆</span>') || `<span>Welcome to the ${LEAGUE.name}.</span>`;
}
function shell(content, route) {
  const S = App.S, t = S.teams[S.user];
  const adv = advanceInfo(S);
  const room = capSpace(S, S.user);
  return `<div class="shell">
  <header class="topbar">
    <button class="burger" data-a="burger" aria-label="Menu"><span></span><span></span><span></span></button>
    <div class="brand" data-a="go" data-r="home">${logo(t, 42)}<div style="min-width:0"><div class="tn">${E(t.region)} ${E(t.name)}</div><div class="ts">${rec(t)} · ${phaseLine(S)}</div></div></div>
    <div class="topstats">
      <div class="tstat hide-m"><span class="k">Cash</span><span class="v ${t.cash < 0 ? 'bad' : ''}">${U.money(t.cash)}</span></div>
      <div class="tstat hide-m"><span class="k">Cap room</span><span class="v ${room < 0 ? 'bad' : 'good'}">${U.money(room)}</span></div>
      <div class="tstat"><span class="k">Hype</span><span class="v">${Math.round(t.hype)}</span></div>
      ${adv ? `<button class="btn gold" data-a="${adv.act}"><span>${adv.label}</span></button>` : ''}
    </div>
  </header>
  <nav class="nav ${App.ui.navOpen ? 'open' : ''}" aria-label="Main">${navLinks(S, route)}</nav>
  <main class="main">${content}</main>
  <div class="ticker" aria-label="News ticker"><div class="tag">${LEAGUE.abbr} WIRE</div><div class="track"><div class="crawl">${tickerItems(S)}</div></div></div>
  </div>`;
}
