// ===== ui/game.js — Game Day: pregame, live coach mode with animated court =====
Screens.game = {
  render(prm) {
    const S = App.S;
    if (App.game) return App.game.html();
    const g = userGameToday(S);
    if (!g) return `${pageHead('Game Day')}<div class="empty">No game for your team today. ${btn('Back', 'go', '', { r: 'home' })}</div>`;
    return pregame(S, g);
  },
  after() { if (App.game) App.game.mount(); },
};
function pregame(S, g) {
  const H = S.teams[g.h], A = S.teams[g.a];
  const us = S.teams[S.user];
  const five = t => { ensureRotation(S, t.tid); return t.rot.order.slice(0, 5).map(id => P(S, id)); };
  const col = t => `<div class="stack" style="gap:6px">${five(t).map(p => { const pg = perGame(seasonTotals(p, S.season, g.po ? 1 : 0).gp ? seasonTotals(p, S.season, g.po ? 1 : 0) : seasonTotals(p, S.season)); return `<div class="row between small"><span><span class="dim">${p.pos}</span> ${plink(p)}</span><span>${rt(p.ovr)} <span class="num mute">${pg.ppg.toFixed(1)} ppg</span></span></div>`; }).join('')}</div>`;
  const series = S.sched.filter(x => x.hs != null && ((x.h === g.h && x.a === g.a) || (x.h === g.a && x.a === g.h)));
  const sw = series.filter(x => (x.h === S.user) === (x.hs > x.as)).length;
  const calls = (map, cur, act) => `<div class="callgrid">${Object.entries(map).map(([k, v]) => `<button class="call ${cur === k ? 'on' : ''}" data-a="${act}" data-k="${k}"><b>${v.n}</b><span class="mute">${v.d}</span></button>`).join('')}</div>`;
  const sr = g.po ? seriesOf(S, g.h, g.a) : null;
  return `${pageHead('Game Day', g.po ? `${ROUND_NAMES[g.round]} · Game ${g.n} · ${S.teams[sr.hi].abbr} lead ${Math.max(...sr.w)}-${Math.min(...sr.w)}`.replace(/lead (\d)-\1/, 'tied $1-$1') : `Day ${S.day} · Season series ${sw}-${series.length - sw}`)}
    <div class="grid g2">
      ${panel(`<span class="row tight" style="display:inline-flex">${logo(A, 26)} ${E(tname(A))} <span class="mute small">(${rec(A)})</span></span>`, col(A))}
      ${panel(`<span class="row tight" style="display:inline-flex">${logo(H, 26)} ${E(tname(H))} <span class="mute small">(${rec(H)})</span></span>`, col(H))}
    </div>
    ${scoutReport(S, g)}
    <div class="grid g2" style="margin-top:14px">
      ${panel('Your Game Plan: Offense', calls(OFF_PLAYS, us.strat.off, 'stratOff'))}
      ${panel('Your Game Plan: Defense', calls(DEF_SCHEMES, us.strat.def, 'stratDef') + `<div style="margin-top:10px">${seg('pace', PACES.map((p, i) => [i, p]), us.strat.pace, 'stratPace')}</div>`)}
    </div>
    <div class="row" style="justify-content:center;margin-top:16px">${btn('Coach the Game', 'gameStart', 'gold lg', { m: 'coach' })}${btn('Watch', 'gameStart', 'lg', { m: 'watch' })}${btn('Quick Sim', 'gameQuick', 'lg ghost')}${btn('Rotation', 'go', 'ghost', { r: 'rotation' })}</div>`;
}
function teamSeasonTotals(S, tid) {
  const rows = S.players.flatMap(p => p.stats.filter(r => r.s === S.season && r.tid === tid && !r.po));
  return sumRows(rows);
}
function scoutReport(S, g) {
  const oppId = g.h === S.user ? g.a : g.h, opp = S.teams[oppId], us = S.teams[S.user];
  const ot = teamSeasonTotals(S, oppId);
  const games = Math.max(1, opp.rec.w + opp.rec.l);
  const oros = U.sortBy(roster(S, oppId).filter(p => !p.inj || p.inj.games <= 0), p => p.ovr);
  const uros = U.sortBy(roster(S, S.user).filter(p => !p.inj || p.inj.games <= 0), p => p.ovr);
  const avg = (ps, k) => U.avg(ps.slice(0, 8), p => p.r[k]);
  const notes = [], rec = { def: null, off: null };
  const tpRate = ot.fga ? ot.tpa / ot.fga : 0.2, tpPct = ot.tpa ? ot.tpm / ot.tpa : 0.35;
  if (ot.fga && tpRate > 0.22 && tpPct > 0.355) { notes.push(`They live behind the arc: ${(ot.tpa / games).toFixed(1)} threes a game at ${U.fg(ot.tpm, ot.tpa)}.`); rec.def = 'deny'; }
  const oHand = avg(oros, 'bhd'), oBig = Math.max(...oros.filter(p => p.pos === 'C' || p.pos === 'PF').slice(0, 2).map(p => p.ovr), 0);
  if (!rec.def && oHand < 52) { notes.push(`Their ball-handling is shaky (team handles ${Math.round(oHand)}). Pressure them.`); rec.def = 'press'; }
  if (!rec.def && oBig >= 84) { notes.push(`Their frontcourt is the problem: ${pname(oros.find(p => (p.pos === 'C' || p.pos === 'PF') && p.ovr === oBig))} (${oBig}).`); rec.def = 'paint'; }
  const star = U.maxBy(oros, p => { const t = seasonTotals(p, S.season); return t.gp ? t.pts / t.gp + 50 : p.ovr / 10; });
  if (star) { const pg = perGame(seasonTotals(star, S.season)); notes.push(`Stop ${pname(star)}${pg.gp ? `: ${pg.ppg.toFixed(1)} points a night` : ''}.`); }
  const ourBig = uros.filter(p => p.pos === 'C' || p.pos === 'PF')[0], theirIdf = avg(oros, 'idf'), ourTpt = avg(uros, 'tpt');
  if (uros[0] && uros[1] && uros[0].ovr - uros[1].ovr >= 6) { rec.off = 'iso'; notes.push(`Ride ${pname(uros[0])}. Nobody on their roster can guard him straight up.`); }
  else if (ourBig && ourBig.r.ins >= 75 && theirIdf < 52) { rec.off = 'post'; notes.push(`Their interior defense is soft. Feed ${pname(ourBig)} on the block.`); }
  else if (ourTpt >= 58) { rec.off = 'three'; notes.push(`Our shooters can stretch them out.`); }
  else rec.off = 'motion';
  const recs = `${rec.off ? `<span class="chip gold">Offense: ${OFF_PLAYS[rec.off].n}</span>` : ''} ${rec.def ? `<span class="chip gold">Defense: ${DEF_SCHEMES[rec.def].n}</span>` : ''}`;
  return panel(`Scouting Report · Asst. Coach ${E(staffName(us.staff.asst))}`, `<ul style="margin:0 0 10px;padding-left:18px">${notes.map(n => `<li class="small" style="margin:3px 0">${E(n)}</li>`).join('')}</ul><div class="row tight">${recs}${btn('Use these calls', 'useRecs', 'sm', { off: rec.off || '', def: rec.def || '' })}</div>`, { style: 'margin-top:14px' });
}
Act.useRecs = el => { const t = App.S.teams[App.S.user]; if (el.dataset.off) t.strat.off = el.dataset.off; if (el.dataset.def) t.strat.def = el.dataset.def; autosave(); rerender(); toast('Game plan set.'); };
Act.gameQuick = () => { simDays(1); };
Act.gameStart = el => {
  const S = App.S, g = userGameToday(S);
  if (!g) return;
  const side = g.h === S.user ? 0 : 1;
  const sim = new GameSim(S, g, { userSide: el.dataset.m === 'coach' ? side : -1, live: true });
  startGameView(sim, { g, side, watch: el.dataset.m === 'watch' });
};
function startGameView(sim, opts) {
  App.game = new GameView(sim, opts);
  render();
}

const SPOTS = [[0, 27], [-17, 19], [17, 17], [-7, 9], [6, 5]];
class GameView {
  constructor(sim, o) {
    this.sim = sim; this.o = o; this.side = o.side != null ? o.side : -1; this.watch = !!o.watch;
    this.speed = App.gameSpeed || 1; this.running = true; this.anims = []; this.cur = null; this.feed = [];
    this.pos = {}; this.ball = { x: 47, y: 25, z: 0 }; this.sel = null; this.finished = false; this.applied = false; this.lastTs = 0; this.poss = -1;
    this.pauseAtQ = !this.watch;
    for (const s of [0, 1]) sim.T[s].ps.forEach((g, i) => { this.pos[g.pid] = { x: 47 + (s ? 4 : -4) * (i % 5 + 1), y: 6 + (i % 5) * 9 }; });
    this.colors = [this.teamColor(0), this.teamColor(1)];
    if (this.colors[0].c1 === this.colors[1].c1 || colorDist(this.colors[0].c1, this.colors[1].c1) < 90) this.colors[1] = { c1: this.colors[1].c2, c2: this.colors[1].c1 };
    for (const e of sim.log) this.feed.push(e);
  }
  teamColor(s) { const t = this.sim.T[s].t; return t ? { c1: t.c1, c2: t.c2 } : (s === 0 ? { c1: '#1f4e8c', c2: '#ffffff' } : { c1: '#b5121b', c2: '#ffffff' }); }
  tinfo(s) { const T = this.sim.T[s]; return T.t || { tid: s === 0 ? 4 : 9, abbr: T.abbr, region: T.name, name: 'All-Stars', c1: this.colors[s].c1, c2: this.colors[s].c2 }; }
  pause() { this.running = false; }
  html() {
    const s = this.sim;
    const ctrl = this.side >= 0 && !this.watch;
    return `<div class="stack" style="gap:12px">
      <div id="gvScore">${this.scoreHtml()}</div>
      <div id="gvStrip">${this.stripHtml()}</div>
      <div class="grid g-main" style="gap:12px">
        <div class="stack" style="gap:12px">
          <div class="court-wrap" id="courtWrap"><canvas id="court" aria-label="Animated court view"></canvas></div>
          <div class="panel" style="padding:10px"><div class="row between">
            <div class="row tight">${btn(this.running ? '❚❚ Pause' : '▶ Play', 'gvPlay', 'sm', {})}${seg('spd', [[1, '1×'], [2, '2×'], [4, '4×'], [12, 'Max']], this.speed, 'gvSpeed')}</div>
            <div class="row tight">${btn('Sim Quarter', 'gvSimQ', 'sm')}${btn('Sim to End', 'gvSimEnd', 'sm')}${ctrl ? btn(`Timeout (${s.T[this.side].tos})`, 'gvTO', 'sm gold') : btn('Take Control', 'gvControl', 'sm gold')}</div>
          </div></div>
          <div id="gvCalls">${ctrl ? this.callsHtml() : ''}</div>
        </div>
        <div class="stack" style="gap:12px">
          <div id="gvLineup">${this.lineupHtml()}</div>
          ${panel('Play-by-Play', `<div class="pbp" id="gvPbp">${this.pbpHtml()}</div>`, { flush: true })}
        </div>
      </div>
      <details class="panel" id="gvBoxWrap"><summary style="padding:10px 12px;cursor:pointer" class="b">Box Score</summary><div id="gvBox" style="padding:0 12px 12px">${this.boxHtml()}</div></details>
    </div>`;
  }
  scoreHtml() {
    const s = this.sim;
    const team = (i, cls) => { const t = this.tinfo(i), T = s.T[i]; return `<div class="sb-team ${cls}" style="--tc:${this.colors[i].c1}">${logo(t, 46)}<div style="min-width:0"><div class="nm">${E(t.region || T.name)}</div><div class="meta">${E(T.abbr)} · Fouls ${T.qf}${T.qf >= 5 ? ' <b class="warn">BONUS</b>' : ''}</div><div class="tos">${[0, 1, 2, 3, 4, 5, 6].map(k => `<i class="${k < T.tos ? '' : 'u'}"></i>`).join('')}</div></div><div class="sc">${s.score[i]}</div></div>`; };
    const q = s.done ? 'Final' : s.q <= 4 ? `${U.ord(s.q)} Qtr` : `OT${s.q > 5 ? s.q - 4 : ''}`;
    return `<div class="scorebug">${team(1, 'away')}<div class="sb-mid"><div class="q">${q}</div><div class="clk">${s.done ? '0:00' : s.clockStr()}</div><div class="tiny mute">${s.done ? '' : (s.pos === 0 ? '▶ ' + s.T[0].abbr : s.T[1].abbr + ' ◀')}</div></div>${team(0, '')}</div>`;
  }
  stripHtml() {
    const s = this.sim;
    const tot = i => { const t = newLine(); for (const g of s.T[i].ps) for (const k in t) t[k] += g.st[k]; t.bench = U.sum(s.T[i].ps.filter(g => !g.starter), g => g.st.pts); return t; };
    const a = tot(1), h = tot(0);
    const cell = (l, x, y, hi) => `<div class="c" style="min-width:76px"><div class="eyebrow">${l}</div><div class="num small"><span class="${hi === 1 ? 'gold' : ''}">${x}</span> <span class="dim">·</span> <span class="${hi === 0 ? 'gold' : ''}">${y}</span></div></div>`;
    const pc = (m, n) => n ? Math.round(m / n * 100) + '%' : '—';
    const better = (x, y, low) => x === y ? -1 : (low ? x < y : x > y) ? 1 : 0;
    return `<div class="panel" style="padding:8px 10px"><div class="row" style="justify-content:space-around;gap:6px"><div class="tiny mute">${E(s.T[1].abbr)} · ${E(s.T[0].abbr)}</div>
      ${cell('FG', pc(a.fgm, a.fga), pc(h.fgm, h.fga), better(a.fgm / (a.fga || 1), h.fgm / (h.fga || 1)))}${cell('3PT', `${a.tpm}/${a.tpa}`, `${h.tpm}/${h.tpa}`, better(a.tpm, h.tpm))}${cell('FT', `${a.ftm}/${a.fta}`, `${h.ftm}/${h.fta}`, better(a.ftm, h.ftm))}
      ${cell('REB', a.orb + a.drb, h.orb + h.drb, better(a.orb + a.drb, h.orb + h.drb))}${cell('AST', a.ast, h.ast, better(a.ast, h.ast))}${cell('TO', a.tov, h.tov, better(a.tov, h.tov, true))}${cell('Bench', a.bench, h.bench, better(a.bench, h.bench))}</div></div>`;
  }
  callsHtml() {
    const T = this.sim.T[this.side];
    const c = (map, cur, act) => Object.entries(map).map(([k, v]) => `<button class="call ${cur === k ? 'on' : ''}" data-a="${act}" data-k="${k}" title="${E(v.d)}"><b>${v.n}</b></button>`).join('');
    return `<div class="grid g2" style="gap:12px">${panel('Offense', `<div class="callgrid">${c(OFF_PLAYS, T.strat.off, 'gvOff')}</div>`)}${panel('Defense', `<div class="callgrid">${c(DEF_SCHEMES, T.strat.def, 'gvDef')}</div><div style="margin-top:8px">${seg('gpace', PACES.map((p, i) => [i, p]), T.strat.pace, 'gvPace')}</div>`)}</div>`;
  }
  lineupHtml() {
    const s = this.sim;
    const sides = this.side >= 0 ? [this.side, 1 - this.side] : [0, 1];
    const blk = (si, full) => {
      const T = s.T[si];
      const on = T.ps.filter(g => g.on), bench = T.ps.filter(g => !g.on);
      const row = g => `<div class="pr ${this.sel === g.pid ? 'sel' : ''} ${g.out ? 'out' : ''}" ${full && !g.out ? `data-a="gvSel" data-id="${g.pid}"` : ''}><span class="jer" style="background:${this.colors[si].c1};color:${textOn(this.colors[si].c1)}">${g.p.num}</span><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${E(pshort(g.p))} <span class="dim tiny">${g.p.pos}</span>${T.feed === g.pid ? ' <span class="chip gold">FEED</span>' : ''}</span><div class="bar e" title="Energy ${Math.round(g.energy * 100)}%"><i style="width:${Math.round(g.energy * 100)}%"></i></div><span class="num small ${g.fouls >= 5 ? 'bad' : g.fouls >= 4 ? 'warn' : 'mute'}">${g.fouls}F</span><span class="num small b" title="${g.st.fgm}-${g.st.fga} FG">${g.st.pts}</span></div>`;
      return `<div class="lineup">${on.map(row).join('')}${full ? `<div class="eyebrow" style="padding:8px 8px 4px">Bench</div>${bench.map(row).join('')}` : ''}</div>`;
    };
    const ctrl = this.side >= 0 && !this.watch;
    const T = ctrl ? s.T[this.side] : null;
    const head = ctrl ? `<div class="row between" style="padding:8px 10px;border-bottom:1px solid var(--line)"><label class="row tight small"><input type="checkbox" ${T.auto ? 'checked' : ''} data-c="gvAuto"> Auto-subs</label>${this.sel ? btn(T.feed === this.sel ? 'Stop feeding' : 'Feed him', 'gvFeed', 'sm', {}) : '<span class="tiny mute">Tap a player, then another, to sub</span>'}</div>` : '';
    return ctrl ? panel(`${E(s.T[this.side].abbr)} Lineup`, head + blk(this.side, true), { flush: true }) + `<div style="margin-top:12px">${panel(`${E(s.T[1 - this.side].abbr)} On Court`, blk(1 - this.side, false), { flush: true })}</div>`
      : `<div class="grid g2" style="gap:12px">${sides.map(si => panel(`${E(s.T[si].abbr)}`, blk(si, false), { flush: true })).join('')}</div>`;
  }
  pbpHtml() {
    return this.feed.slice(-120).reverse().filter(e => !(e.type === 'sub' && e.quiet)).map(e => {
      const cls = e.type === 'period' || e.type === 'final' ? 'per' : (e.type === 'shot' && e.made) || e.type === 'ft' && e.made ? 'score' : '';
      const big = (e.type === 'shot' && e.made && e.pts === 3) || e.blk || e.steal ? 'big' : '';
      const c = e.side >= 0 ? this.colors[e.side].c1 : 'transparent';
      return `<div class="e ${cls} ${big}"><span class="t">${e.type === 'period' || e.type === 'final' ? '' : `Q${e.q} ${Math.floor(e.clk / 60)}:${String(Math.floor(e.clk % 60)).padStart(2, '0')}`}</span><span>${e.side >= 0 && cls !== 'per' ? `<i class="tm" style="background:${c}"></i>` : ''}${E(e.text)}</span><span class="s">${e.sc[1]}-${e.sc[0]}</span></div>`;
    }).join('');
  }
  boxHtml() { const b = this.sim.box(); return [1, 0].map(i => `<div class="eyebrow" style="margin:10px 0 6px">${E(this.sim.T[i].abbr)}</div>${boxTable(App.S, b.teams[i], b)}`).join(''); }
  refresh(parts) {
    if (App.route !== 'game') return;
    if (!parts || parts.includes('score')) { const el = $('#gvScore'); if (el) el.innerHTML = this.scoreHtml(); const st = $('#gvStrip'); if (st) st.innerHTML = this.stripHtml(); }
    if (!parts || parts.includes('pbp')) { const el = $('#gvPbp'); if (el) el.innerHTML = this.pbpHtml(); }
    if (!parts || parts.includes('lineup')) { const el = $('#gvLineup'); if (el) el.innerHTML = this.lineupHtml(); }
    if (!parts || parts.includes('box')) { const w = $('#gvBoxWrap'); if (w && w.open) { const el = $('#gvBox'); if (el) el.innerHTML = this.boxHtml(); } }
  }
  mount() {
    this.cv = $('#court'); if (!this.cv) return;
    this.ctx = this.cv.getContext('2d');
    this.fit();
    if (!this.onResize) { this.onResize = () => this.fit(); window.addEventListener('resize', this.onResize); }
    const w = $('#gvBoxWrap'); if (w) w.addEventListener('toggle', () => { if (w.open) { const el = $('#gvBox'); if (el) el.innerHTML = this.boxHtml(); } });
    if (!this.loopOn) { this.loopOn = true; requestAnimationFrame(t => this.loop(t)); }
    if (this.finished) this.showFinal();
  }
  fit() { if (!this.cv) return; const r = this.cv.getBoundingClientRect(); this.cv.width = Math.round(r.width * devicePixelRatio); this.cv.height = Math.round(r.height * devicePixelRatio); this.sc = this.cv.width / 94; }
  // court coordinates: sim half-court (x lateral, y from baseline) → full court feet
  dir(side) { const right = this.sim.q <= 2 ? side === 0 : side === 1; return right; }
  toCourt(side, sx, sy) { return this.dir(side) ? { x: 94 - sy, y: 25 + sx } : { x: sy, y: 25 - sx }; }
  rim(side) { return this.dir(side) ? { x: 88.75, y: 25 } : { x: 5.25, y: 25 }; }
  formation(side) {
    const s = this.sim;
    const off = s.on(side).sort((a, b) => a.pi - b.pi), def = s.on(1 - side).sort((a, b) => a.pi - b.pi);
    const tgt = {};
    off.forEach((g, i) => { const sp = SPOTS[i]; tgt[g.pid] = this.toCourt(side, sp[0] + U.rf(-2.5, 2.5), sp[1] + U.rf(-2, 2)); });
    def.forEach((g, i) => { const sp = SPOTS[i]; const o = this.toCourt(side, sp[0] * 0.82, sp[1] * 0.72 + 1.5); tgt[g.pid] = o; });
    return { tgt, handler: off[0] };
  }
  push(a) { this.anims.push(a); }
  moveAll(tgt, dur) { const from = {}; for (const k in tgt) from[k] = Object.assign({}, this.pos[k] || tgt[k]); this.push({ dur, fn: t => { const e = ease(t); for (const k in tgt) { if (!this.pos[k]) this.pos[k] = {}; this.pos[k].x = from[k].x + (tgt[k].x - from[k].x) * e; this.pos[k].y = from[k].y + (tgt[k].y - from[k].y) * e; } } }); }
  ballTo(getTo, dur, arc = 0, onEnd) { let from; this.push({ dur, start: () => { from = Object.assign({}, this.ball); }, fn: t => { const to = getTo(); const e = arc ? t : ease(t); this.ball.x = from.x + (to.x - from.x) * e; this.ball.y = from.y + (to.y - from.y) * e; this.ball.z = arc ? Math.sin(Math.PI * t) * arc : 0; }, end: onEnd }); }
  wait(dur, onEnd) { this.push({ dur, fn: () => { }, end: onEnd }); }
  pop(text, at, color) {
    const wrap = $('#courtWrap'); if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'court-pop'; el.textContent = text; el.style.left = (at.x / 94 * 100) + '%'; el.style.top = (at.y / 50 * 100) + '%'; if (color) el.style.color = color;
    wrap.appendChild(el); setTimeout(() => el.remove(), 1000);
  }
  nextPossession() {
    const s = this.sim;
    if (s.done) { if (!this.finished) this.finish(); return; }
    const q0 = s.q;
    const evs = s.step();
    const side = evs.find(e => ['shot', 'tov', 'ft'].includes(e.type));
    const off = side ? side.side : s.pos;
    let setup = false;
    const doSetup = (sd) => { if (setup) return; setup = true; const f = this.formation(sd); this.moveAll(f.tgt, 420); const h = f.handler; this.ballTo(() => this.pos[h.pid] || { x: 47, y: 25 }, 200); };
    const show = (e) => this.wait(1, () => { this.feed.push(e); this.refresh(['score', 'pbp', 'lineup']); });
    for (const e of evs) {
      if (e.type === 'shot') {
        doSetup(e.side);
        const sp = this.toCourt(e.side, e.x, e.y), rim = this.rim(e.side);
        const shooter = e.pid;
        const tg = {}; tg[shooter] = sp;
        const d = s.matchup(e.side, s.T[e.side].ps.find(g => g.pid === shooter));
        if (d) tg[d.pid] = { x: sp.x + (rim.x - sp.x) * 0.15, y: sp.y + (rim.y - sp.y) * 0.15 };
        this.ballTo(() => this.pos[shooter] || sp, 220);
        this.moveAll(tg, 260);
        this.ballTo(() => rim, 520, e.zone === 'rim' ? 3 : e.zone === 'close' ? 5 : 9, () => {
          this.feed.push(e); this.refresh(['score', 'pbp', 'lineup']);
          if (e.made) this.pop(e.pts === 3 ? '+3' : '+2', rim, e.pts === 3 ? '#ffd479' : '#fff');
          else if (e.blk) this.pop('BLOCKED!', rim, '#ff5d5d');
        });
        if (e.made) this.wait(160);
      } else if (e.type === 'reb') {
        const rim = this.rim(e.off ? e.side : 1 - e.side);
        const rb = e.pid; const spot = { x: rim.x + (rim.x > 47 ? -U.rf(3, 9) : U.rf(3, 9)), y: rim.y + U.rf(-8, 8) };
        const tg = {}; tg[rb] = spot; this.moveAll(tg, 200);
        this.ballTo(() => this.pos[rb] || spot, 220, 2, () => { this.feed.push(e); this.refresh(['pbp', 'lineup']); });
      } else if (e.type === 'tov') {
        doSetup(e.side);
        if (e.steal) { this.ballTo(() => this.pos[e.by] || { x: 47, y: 25 }, 260, 0, () => { this.feed.push(e); this.refresh(['pbp', 'lineup']); this.pop('STEAL', this.pos[e.by] || { x: 47, y: 25 }, '#5cc8ff'); }); }
        else { this.ballTo(() => ({ x: this.ball.x, y: this.ball.y > 25 ? 51 : -1 }), 260, 0, () => { this.feed.push(e); this.refresh(['pbp', 'lineup']); this.pop('TURNOVER', { x: this.ball.x, y: 25 }, '#ff5d5d'); }); }
      } else if (e.type === 'ft') {
        const rim = this.rim(e.side); const line = { x: rim.x + (rim.x > 47 ? -15 : 15), y: 25 };
        const tg = {}; tg[e.pid] = line; this.moveAll(tg, 260);
        this.ballTo(() => this.pos[e.pid] || line, 120);
        for (let k = 0; k < e.n; k++) { this.ballTo(() => rim, 420, 6, () => { if (k < e.made) this.pop('+1', rim, '#fff'); }); if (k < e.n - 1) this.ballTo(() => this.pos[e.pid] || line, 150); }
        this.wait(1, () => { this.feed.push(e); this.refresh(['score', 'pbp', 'lineup']); });
      } else if (e.type === 'period' || e.type === 'final') {
        this.wait(e.type === 'final' ? 300 : 650, () => { this.feed.push(e); this.refresh(); });
      } else if (e.type === 'timeout' || e.type === 'inj' || e.type === 'foulout') {
        this.wait(500, () => { this.feed.push(e); this.refresh(['score', 'pbp', 'lineup']); this.pop(e.type === 'timeout' ? 'TIMEOUT' : e.type === 'inj' ? 'INJURY' : 'FOULED OUT', { x: 47, y: 25 }, '#ffb627'); });
      } else show(e);
    }
    this.wait(this.anims.length ? 120 : 1, () => this.refresh(['score']));
    if (this.pauseAtQ && s.q !== q0 && !s.done) this.wait(1, () => { this.running = false; this.refresh(); this.updatePlayBtn(); toast(`End of the ${U.ord(q0)}${q0 > 4 ? ' OT' : ' quarter'}. Make your adjustments, then press Play.`); });
  }
  updatePlayBtn() { const b = $$('[data-a="gvPlay"]')[0]; if (b) b.innerHTML = `<span>${this.running ? '❚❚ Pause' : '▶ Play'}</span>`; }
  loop(ts) {
    if (App.game !== this) { this.loopOn = false; if (this.onResize) window.removeEventListener('resize', this.onResize); return; }
    const dt = this.lastTs ? Math.min(100, ts - this.lastTs) : 16;
    this.lastTs = ts;
    if (this.running && App.route === 'game') {
      let budget = dt * this.speed;
      let guard = 0;
      while (budget > 0 && guard++ < 50) {
        if (!this.cur) {
          if (!this.anims.length) { if (this.running && !this.finished) this.nextPossession(); if (!this.anims.length) break; }
          this.cur = this.anims.shift(); this.cur.t = 0; if (this.cur.start) this.cur.start();
        }
        const a = this.cur;
        const need = a.dur * (1 - a.t);
        const use = Math.min(budget, need);
        a.t += use / a.dur; budget -= use;
        a.fn(Math.min(1, a.t));
        if (a.t >= 0.999) { if (a.end) a.end(); this.cur = null; if (!this.running) break; }
      }
    }
    if (App.route === 'game') this.draw();
    requestAnimationFrame(t => this.loop(t));
  }
  draw() {
    const c = this.ctx, cv = this.cv; if (!c || !cv || !document.body.contains(cv)) return;
    const k = this.sc, W = cv.width, H = cv.height;
    const X = x => x * k, Y = y => y * k;
    // hardwood
    c.fillStyle = '#c48a4f'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 50; i++) { c.fillStyle = i % 2 ? 'rgba(120,70,30,0.10)' : 'rgba(255,220,170,0.06)'; c.fillRect(0, Y(i), W, Y(1)); }
    // paint in home colors
    const hc = this.colors[0].c1;
    c.globalAlpha = 0.55; c.fillStyle = hc; c.fillRect(0, Y(17), X(19), Y(16)); c.fillRect(X(75), Y(17), X(19), Y(16)); c.globalAlpha = 1;
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = Math.max(1.5, k * 0.18);
    c.strokeRect(X(0.2), Y(0.2), X(93.6), Y(49.6));
    c.beginPath(); c.moveTo(X(47), 0); c.lineTo(X(47), H); c.stroke();
    c.beginPath(); c.arc(X(47), Y(25), X(6), 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(X(47), Y(25), X(2), 0, Math.PI * 2); c.stroke();
    for (const side of [0, 1]) {
      const bx = side ? 88.75 : 5.25, dirn = side ? -1 : 1, base = side ? 94 : 0;
      c.strokeRect(X(side ? 75 : 0), Y(17), X(19), Y(16));
      c.beginPath(); c.arc(X(base + dirn * 19), Y(25), X(6), side ? Math.PI / 2 : -Math.PI / 2, side ? Math.PI * 1.5 : Math.PI / 2); c.stroke();
      c.beginPath(); c.moveTo(X(base), Y(3)); c.lineTo(X(base + dirn * 14), Y(3)); c.moveTo(X(base), Y(47)); c.lineTo(X(base + dirn * 14), Y(47)); c.stroke();
      c.beginPath(); const th = Math.asin(22 / 23.75); if (side) c.arc(X(bx), Y(25), X(23.75), Math.PI - th, Math.PI + th); else c.arc(X(bx), Y(25), X(23.75), -th, th); c.stroke();
      c.beginPath(); c.moveTo(X(base + dirn * 4), Y(22)); c.lineTo(X(base + dirn * 4), Y(28)); c.stroke();
      c.strokeStyle = '#ff7a1a'; c.beginPath(); c.arc(X(bx), Y(25), X(0.75), 0, Math.PI * 2); c.stroke(); c.strokeStyle = 'rgba(255,255,255,0.85)';
    }
    // center logo text
    c.save(); c.globalAlpha = 0.22; c.fillStyle = hc; c.font = `italic 800 ${Math.round(X(4))}px "Saira Condensed", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(this.sim.T[0].abbr, X(47), Y(25)); c.restore();
    // players
    const r = 1.35;
    for (const s of [0, 1]) for (const g of this.sim.on(s)) {
      const p = this.pos[g.pid]; if (!p) continue;
      c.beginPath(); c.arc(X(p.x), Y(p.y) + k * 0.4, X(r), 0, Math.PI * 2); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
      c.beginPath(); c.arc(X(p.x), Y(p.y), X(r), 0, Math.PI * 2); c.fillStyle = this.colors[s].c1; c.fill(); c.lineWidth = Math.max(1.5, k * 0.25); c.strokeStyle = this.colors[s].c2; c.stroke();
      if (g.energy < 0.8) { c.beginPath(); c.arc(X(p.x), Y(p.y), X(r + 0.35), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * g.energy); c.strokeStyle = g.energy < 0.65 ? '#ff5d5d' : '#ffcc4d'; c.lineWidth = Math.max(1.5, k * 0.22); c.stroke(); }
      if (this.sel === g.pid) { c.beginPath(); c.arc(X(p.x), Y(p.y), X(r + 0.7), 0, Math.PI * 2); c.strokeStyle = '#ffb627'; c.lineWidth = k * 0.3; c.stroke(); }
      c.fillStyle = textOn(this.colors[s].c1); c.font = `700 ${Math.round(X(1.3))}px "Chakra Petch", monospace`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(g.p.num, X(p.x), Y(p.y) + 1);
    }
    // ball
    const b = this.ball, bz = b.z || 0;
    c.beginPath(); c.arc(X(b.x), Y(b.y), X(0.55), 0, Math.PI * 2); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill();
    c.beginPath(); c.arc(X(b.x), Y(b.y) - X(bz * 0.35), X(0.62 + bz * 0.04), 0, Math.PI * 2); c.fillStyle = '#ff7a1a'; c.fill(); c.strokeStyle = '#3a1a00'; c.lineWidth = Math.max(1, k * 0.1); c.stroke();
  }
  finish() {
    this.finished = true; this.running = false;
    this.refresh(); this.updatePlayBtn();
    this.showFinal();
  }
  showFinal() {
    const s = this.sim;
    const w = s.score[0] > s.score[1] ? 0 : 1;
    const pog = U.maxBy(s.T[w].ps, g => g.st.pts + (g.st.orb + g.st.drb) * 0.7 + g.st.ast * 0.8 + g.st.stl + g.st.blk);
    const userWon = this.o.side != null && this.o.side >= 0 ? w === this.o.side : null;
    const title = this.o.allstar ? `${w === 0 ? 'East' : 'West'} wins!` : userWon === true ? 'Victory!' : userWon === false ? 'Defeat' : 'Final';
    modal(title, `<div class="c"><div style="font:700 44px/1 var(--f-num)">${E(s.T[1].abbr)} ${s.score[1]} – ${s.score[0]} ${E(s.T[0].abbr)}</div><p class="mute">${s.q > 4 ? (s.q === 5 ? 'Overtime' : (s.q - 4) + ' overtimes') : 'Final'}</p>
      <p>Player of the game: <b>${E(pname(pog.p))}</b> — ${pog.st.pts} pts, ${pog.st.orb + pog.st.drb} reb, ${pog.st.ast} ast</p></div>`, btn('Continue', 'gvContinue', 'gold'), { size: 'sm', sticky: true });
  }
}
function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function colorDist(a, b) { const h = x => { const n = parseInt(x.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }; const p = h(a), q = h(b); return Math.sqrt((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2); }

Act.gvPlay = () => { const G = App.game; if (!G || G.finished) return; G.running = !G.running; G.updatePlayBtn(); };
Act.gvSpeed = el => { const G = App.game; G.speed = +el.dataset.k; App.gameSpeed = G.speed; $$('[data-a="gvSpeed"]').forEach(b => b.classList.toggle('on', b.dataset.k === el.dataset.k)); };
Act.gvSimQ = () => { const G = App.game; if (!G || G.finished) return; G.anims = []; G.cur = null; const q = G.sim.q; while (!G.sim.done && G.sim.q === q) { const ev = G.sim.step(); G.feed.push(...ev); } G.formationSnap(); G.refresh(); if (G.sim.done) G.finish(); else if (G.pauseAtQ) { G.running = false; G.updatePlayBtn(); } };
Act.gvSimEnd = () => { const G = App.game; if (!G || G.finished) return; G.anims = []; G.cur = null; while (!G.sim.done) { const ev = G.sim.step(); G.feed.push(...ev); } G.refresh(); G.finish(); };
GameView.prototype.formationSnap = function () { const f = this.formation(this.sim.pos); for (const k in f.tgt) this.pos[k] = f.tgt[k]; };
Act.gvTO = () => { const G = App.game; if (G.sim.timeout(G.side)) { G.feed.push(G.sim.log[G.sim.log.length - 1]); G.refresh(); G.running = false; G.updatePlayBtn(); toast('Timeout. Adjust and press Play.'); } else toast('No timeouts left.', 'bad'); };
Act.gvControl = () => { const G = App.game; if (G.o.allstar || G.o.side == null || G.o.side < 0) { toast('Spectator mode for this one.'); return; } G.watch = false; G.side = G.o.side; G.sim.userSide = G.side; G.pauseAtQ = true; render(); };
Act.gvOff = el => { const G = App.game; G.sim.setPlay(G.side, el.dataset.k); $('#gvCalls').innerHTML = G.callsHtml(); };
Act.gvDef = el => { const G = App.game; G.sim.setDef(G.side, el.dataset.k); $('#gvCalls').innerHTML = G.callsHtml(); };
Act.gvPace = el => { const G = App.game; G.sim.setPace(G.side, +el.dataset.k); $('#gvCalls').innerHTML = G.callsHtml(); };
Act.gvAuto = el => { const G = App.game; G.sim.T[G.side].auto = el.checked; G.refresh(['lineup']); };
Act.gvFeed = () => { const G = App.game, T = G.sim.T[G.side]; T.feed = T.feed === G.sel ? null : G.sel; G.sel = null; G.refresh(['lineup']); };
Act.gvSel = el => {
  const G = App.game, id = +el.dataset.id, T = G.sim.T[G.side];
  if (G.sel == null || G.sel === id) { G.sel = G.sel === id ? null : id; G.refresh(['lineup']); return; }
  const a = T.ps.find(g => g.pid === G.sel), b = T.ps.find(g => g.pid === id);
  if (a.on !== b.on) {
    const out = a.on ? a : b, inn = a.on ? b : a;
    if (G.sim.sub(G.side, out.pid, inn.pid)) { G.feed.push(G.sim.log[G.sim.log.length - 1]); G.pos[inn.pid] = Object.assign({}, G.pos[out.pid] || { x: 47, y: 50 }); }
    G.sel = null;
  } else G.sel = id;
  G.refresh(['lineup', 'pbp']);
};
Act.gvContinue = () => {
  const G = App.game, S = App.S;
  closeModal();
  if (G.o.allstar) { App.game = null; if (S.allStar && !S.allStar.done.game) allStarFinish(S, G.sim); autosave(); go(S.allStar ? 'allstar' : 'home'); return; }
  if (!G.applied && G.o.g.hs == null) { G.applied = true; applyResult(S, G.o.g, G.sim); }
  App.game = null;
  // finish the rest of today's slate and turn the page
  for (const g of todaysGames(S)) if (g.hs == null) playGame(S, g);
  const res = endDay(S);
  autosave();
  if (S.phase === PH.END) { go('review'); return; }
  if (res === 'season-end') { toast('Regular season complete — the playoffs are set!', 'good'); go('playoffs'); return; }
  if (S.allStar && !S.allStar.finished) { go('allstar'); return; }
  go('home');
  openBox(G.o.g.gid);
};
