// Dual Meet: screens and input. Rules live in rules.js (window.DM). Kit: window.GK.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var DM = window.DM, EV = DM.EV, SL = DM.SLOTS, ES = DM.EV_SLOTS, fmt = DM.fmt, esc = GK.esc;
  var GAME = 'dual-meet';
  GK.view.init();

  /* ---------- save ---------- */
  var S = GK.save.store('dualMeet.v1', {
    version: 1,
    defaults: { plays: 0, wins: 0, perfect: 0, beat: 0, days: { days: 0, last: '' }, badges: {}, muted: false, tut: 0,
      draft: { key: '', lu: [] }, today: { key: '', lu: [], us: 0, them: 0, best: 0 }, hist: [] }
  });
  var D = S.data;
  function okLu(lu) { return Array.isArray(lu) && lu.length === DM.NS && DM.valid(lu); }
  function save() { S.save(); }

  /* ---------- kit pieces ---------- */
  GK.audio.init({}).std();
  GK.audio.setMuted(D.muted);
  var J = GK.juice.create();
  GK.juice.panel(J);
  var BADGES = [
    { id: 'first', name: 'First Meet', desc: 'Swim a meet', test: function (s) { return s.plays >= 1; } },
    { id: 'win', name: 'Dual Win', desc: 'Win a meet', test: function (s) { return s.won; } },
    { id: 'perfect', name: 'Perfect Lineup', desc: 'Match the best lineup we found', test: function (s) { return s.perfect; } },
    { id: 'beat', name: 'Coach of the Year', desc: 'Beat the best lineup we found', hidden: true, test: function (s) { return s.beat; } },
    { id: 'relays', name: 'Relay Sweep', desc: 'Win all three relays', test: function (s) { return s.relays === 3; } },
    { id: 'photo', name: 'Photo Finish', desc: 'Win by 2 points or fewer', test: function (s) { return s.won && s.margin <= 2; } },
    { id: 'comeback', name: 'Comeback', desc: 'Win after trailing by 10 or more', test: function (s) { return s.won && s.low <= -10; } },
    { id: 'days7', name: 'Pool Regular', desc: 'Swim 7 daily meets', test: function (s) { return s.days >= 7; } },
    { id: 'scratch', name: 'Scratched', desc: 'Win with an empty lane', funny: true, test: function (s) { return s.won && s.empty > 0; } },
    { id: 'wrongpool', name: 'Wrong Pool', desc: 'Lose by 40 or more', funny: true, test: function (s) { return s.margin <= -40; } }
  ];
  var BD = GK.badges.create(BADGES, D.badges, { toast: true });

  /* ---------- state ---------- */
  var st = { mode: 'title', M: null, lu: null, practice: false, code: '', key: '', sheet: null, hint: null, res: null, shown: 0, timer: 0, retry: false };
  var todayCache = { key: '', M: null };
  function todayKey() { return GK.daily.key(); }
  function todayMeet() {
    var k = todayKey();
    if (todayCache.key !== k) { todayCache.key = k; todayCache.M = DM.makeMeet(GK.daily.seed(GAME, k)); }
    return todayCache.M;
  }
  function pts(x) { return Number.isInteger(x) ? String(x) : x.toFixed(1); }
  function sw(side, p) { return (side === 0 ? st.M.home : st.M.away).swimmers[p]; }
  function g(M) { return M.gender === 'girls' ? 'Girls' : 'Boys'; }

  function show(mode) {
    st.mode = mode;
    $('sTitle').hidden = mode !== 'title'; $('sMeet').hidden = mode !== 'meet'; $('sRes').hidden = mode !== 'res';
    try { window.scrollTo(0, 0); } catch (e) {}
  }

  /* ---------- title ---------- */
  function titleRender() {
    var k = todayKey();
    $('tDate').textContent = 'Today · ' + GK.daily.label(k);
    var M = todayCache.key === k ? todayCache.M : null;
    $('tVs').textContent = M ? g(M) + ' dual meet vs ' + M.away.name : 'Setting up today\'s meet';
    var done = D.today.key === k;
    $('tState').textContent = done ? (D.today.us > D.today.them ? 'Won ' : D.today.us < D.today.them ? 'Lost ' : 'Tied ') + pts(D.today.us) + '–' + pts(D.today.them) + '. Best lineup found: +' + pts(D.today.best) + '.' : (D.draft.key === k ? 'Lineup in progress.' : 'Not swum yet.');
    $('tGo').textContent = done ? 'See today\'s result' : 'Today\'s meet';
    $('tNext').textContent = 'New meet in ' + GK.daily.countdown(GK.daily.msToNext()) + (D.days.days ? ' · ' + D.days.days + (D.days.days === 1 ? ' day' : ' days') + ' played' : '');
  }
  function goTitle() { closeSheet(); clearTimeout(st.timer); show('title'); titleRender(); }

  /* ---------- open a meet ---------- */
  function openToday() {
    var M = todayMeet(), k = todayKey();
    st.M = M; st.practice = false; st.retry = false; st.code = ''; st.key = k;
    if (D.today.key === k && okLu(D.today.lu)) { st.lu = D.today.lu.slice(); finish(false); return; }
    st.lu = (D.draft.key === k && okLu(D.draft.lu)) ? D.draft.lu.slice() : M.defA.slice();
    enterMeet();
  }
  function openPractice(code, lu) {
    st.code = code || GK.rng.code(); st.practice = true; st.key = '';
    st.M = DM.makeMeet('practice|' + st.code);
    st.lu = lu && okLu(lu) ? lu.slice() : st.M.defA.slice();
    enterMeet();
  }
  function retryToday() {
    var M = todayMeet(); st.M = M; st.practice = true; st.retry = true; st.code = ''; st.key = '';
    st.lu = M.defA.slice(); enterMeet();
  }
  function enterMeet() {
    var M = st.M;
    $('mTitle').textContent = g(M) + (st.practice ? (st.retry ? ' · today again' : ' · practice') : ' dual meet');
    $('mSub').textContent = M.home.school + ' vs ' + M.away.name + (st.practice ? (st.retry ? ' · not scored' : ' · ' + st.code) : ' · ' + GK.daily.label(st.key));
    st.hint = D.tut === 0 ? DM.hint(M, st.lu) : null;
    coach(D.tut === 0 ? (st.hint ? 'Their coach built a lineup to beat your usual one. You scouted the ★ events. Tap the pulsing lane to fix one.' : 'Their coach built a lineup to beat your usual one. You scouted the ★ events. Tap any lane to change who swims.') : '');
    show('meet'); renderMeet();
  }
  function coach(text) { $('coach').hidden = !text; $('coachT').textContent = text || ''; }

  /* ---------- the meet sheet ---------- */
  function renderMeet() {
    var M = st.M, lu = st.lu, pA = DM.project(M.home, lu), pB = DM.project(M.away, M.luB);
    var proj = DM.scoreMeet(lu, pA, M.luB, pB, true), h = '', seenUs = 0, seenThem = 0, empty = 0;
    for (var e = 0; e < EV.length; e++) {
      var ev = EV[e], sc = M.reveal.indexOf(e) >= 0, pe = proj.events[e];
      if (sc) { seenUs += pe.us; seenThem += pe.them; }
      h += '<div class="ev' + (sc ? ' sc' : '') + '" data-ev="' + e + '"><div class="evh"><span class="n">' + (e + 1) + '</span><b>' + ev.name + '</b>' +
        (sc ? '<span class="st g">★ Scouted</span><span class="pj">Seeds: <b class="' + (pe.us > pe.them ? 'w' : pe.us < pe.them ? 'l' : '') + '">' + pts(pe.us) + '–' + pts(pe.them) + '</b></span>' : '<span class="st h">Hidden</span>') + '</div>';
      h += '<div class="side you"><span class="mk" aria-label="You">●</span><div class="lanes' + (ev.relay ? ' r' : '') + '">';
      ES[e].forEach(function (si) {
        var p = lu[si], s = SL[si], pulse = st.hint && st.hint.slot === si ? ' pulse' : '';
        if (p < 0) { empty++; h += '<button class="chip empty' + pulse + '" data-slot="' + si + '">+ Add swimmer</button>'; return; }
        var m = pA.mult[si], tag = pA.b2b[si] ? '<span class="cf">▲ +' + ((m - 1) * 100).toFixed(1) + '%</span>' : (m > 1.0049 ? '<span class="cl">+' + ((m - 1) * 100).toFixed(1) + '%</span>' : '');
        h += '<button class="chip' + pulse + '" data-slot="' + si + '" aria-label="' + esc(sw(0, p).name + ', ' + ev.name + (s.relay ? ' ' + DM.LEGNAME[s.leg] + ' leg' : '') + ', ' + fmt(pA.t[si])) + '">' +
          (s.relay ? '<span class="cl">' + DM.LEGNAME[s.leg] + (ev.legs[0] === 'free' ? ' ' + (s.k + 1) : '') + '</span>' : '') +
          '<span class="cn">' + esc(sw(0, p).short) + '</span><span class="ct">' + fmt(pA.t[si]) + tag + '</span></button>';
      });
      h += '</div></div><div class="side them"><span class="mk" aria-label="Them">◆</span>';
      if (sc) {
        h += '<div class="lanes' + (ev.relay ? ' r' : '') + '">';
        ES[e].forEach(function (si) {
          var p = M.luB[si], s = SL[si]; if (p < 0) { h += '<div class="chip empty">Empty</div>'; return; }
          h += '<div class="chip">' + (s.relay ? '<span class="cl">' + DM.LEGNAME[s.leg] + (ev.legs[0] === 'free' ? ' ' + (s.k + 1) : '') + '</span>' : '') + '<span class="cn">' + esc(sw(1, p).short) + '</span><span class="ct">' + fmt(pB.t[si]) + (pB.b2b[si] ? '<span class="cf">▲</span>' : '') + '</span></div>';
        });
        h += '</div>';
      } else h += '<div class="hid">' + topSeeds(e) + '</div>';
      h += '</div></div>';
      if (ev.brk) h += '<div class="brk">Diving · swimmers get a break</div>';
    }
    $('events').innerHTML = h;
    $('mInfo').innerHTML = '<b>Scouted events: ' + pts(seenUs) + '–' + pts(seenThem) + '</b><br>' + M.reveal.length + ' of 11 seen' + (empty ? ' · ' + empty + ' empty ' + (empty === 1 ? 'lane' : 'lanes') : ' · all lanes filled');
    $('mSwim').disabled = false;
  }
  // what a coach can see of a hidden event: their roster's top seeds
  function topSeeds(e) {
    var M = st.M, ev = EV[e], ros = M.away.swimmers;
    if (!ev.relay) {
      var a = ros.slice().sort(function (x, y) { return x.ab[ev.ab] - y.ab[ev.ab]; }).slice(0, 3);
      return 'Their top seeds: ' + a.map(function (s) { return esc(s.last) + ' <span class="num">' + fmt(s.ab[ev.ab]) + '</span>'; }).join(' · ');
    }
    var base = function (s, leg, k) { return DM.slotBase(M.away, ES[e][k], s.id); };
    if (ev.legs[0] === 'free') {
      var f = ros.slice().sort(function (x, y) { return base(x, 'free', 1) - base(y, 'free', 1); }).slice(0, 4);
      return 'Their four fastest: ' + f.map(function (s) { return esc(s.last); }).join(', ');
    }
    var out = [];
    ['back', 'breast', 'fly'].forEach(function (lg, k) { var b = ros.slice().sort(function (x, y) { return base(x, lg, k) - base(y, lg, k); })[0]; out.push(DM.LEGNAME[lg] + ' ' + esc(b.last)); });
    return 'Their best legs: ' + out.join(' · ');
  }

  /* ---------- placing a swimmer ---------- */
  var place = DM.place;
  function schedule(lu, p) {
    var ind = [], all = [];
    EV.forEach(function (ev, e) { if (ES[e].some(function (si) { return lu[si] === p; })) { all.push(ev.short); if (!ev.relay) ind.push(ev.short); } });
    return { ind: ind, all: all };
  }
  function openPick(si) {
    var M = st.M, s = SL[si], ev = EV[s.ev], cur = st.lu[si], rows = [], c = DM.counts(st.lu);
    for (var p = 0; p < DM.ROSTER; p++) {
      var r = place(st.lu, si, p), sc = schedule(st.lu, p), base = { p: p, s: M.home.swimmers[p], sched: sc, ind: c.ind[p], tot: c.tot[p] };
      if (r.lu) rows.push(proj(Object.assign({ r: r, lu: r.lu }, base), si));
      else {
        var tr = DM.trades(st.lu, si, p);
        if (tr.length) tr.forEach(function (t) { rows.push(proj(Object.assign({ r: r, lu: t.lu, tr: t }, base), si)); });
        else rows.push(Object.assign({ r: r }, base));
      }
    }
    rows.sort(function (a, b) { if (!!a.lu !== !!b.lu) return a.lu ? -1 : 1; if (a.lu) return a.t - b.t || (a.tr ? 1 : 0) - (b.tr ? 1 : 0); return a.p - b.p; });
    var h = '<p class="note">' + (s.relay ? DM.LEGNAME[s.leg] + ' leg' + (ev.legs[0] === 'free' ? ' ' + (s.k + 1) : '') + '. ' : '') + 'Times include tiredness from earlier swims. Up to 2 individual events and 4 events each.</p>';
    rows.forEach(function (w) {
      var ok = !!w.lu, hp = st.hint && st.hint.slot === si && st.hint.p === w.p && (st.hint.trade == null ? !w.tr : w.tr && w.tr.slot === st.hint.trade), pulse = hp ? ' pulse' : '';
      var meta;
      if (w.tr) meta = '↔ Trade: ' + (w.tr.q < 0 ? 'leaves ' + EV[w.tr.ev].short + ' open' : esc(M.home.swimmers[w.tr.q].short) + ' takes ' + esc(w.s.short) + '\'s ' + EV[w.tr.ev].short);
      else if (ok) { meta = w.s.label + ' · grade ' + w.s.grade + ' · ' + w.ind + '/2 ind · ' + w.tot + '/4 events'; if (w.sched.all.length) meta += ' · swims ' + w.sched.all.join(', '); }
      else meta = esc(w.r.err) + ' · ' + w.s.label;
      if (ok && w.b2b) meta += ' · <span class="w">▲ back-to-back +' + ((w.m - 1) * 100).toFixed(1) + '%</span>';
      else if (ok && w.m > 1.0049) meta += ' · tired +' + ((w.m - 1) * 100).toFixed(1) + '%';
      h += '<button class="pk' + (w.p === cur ? ' cur' : '') + (ok ? '' : ' off') + pulse + '" data-p="' + w.p + '"' + (w.tr ? ' data-tr="' + w.tr.slot + '"' : '') + (ok ? '' : ' aria-disabled="true"') + '><span class="mk">●</span><span class="pn">' + esc(w.s.name) + (w.p === cur ? ' (here now)' : w.r.swap ? ' (swap lanes)' : '') + '</span><span class="pt">' + (ok ? fmt(w.t) : '–') + '</span><span class="pm">' + meta + '</span></button>';
    });
    if (!s.relay) h += '<button class="pk' + (cur < 0 ? ' cur' : '') + (st.hint && st.hint.slot === si && st.hint.p === -1 ? ' pulse' : '') + '" data-p="-1"><span class="mk">○</span><span class="pn">Leave this lane empty</span><span class="pt"></span><span class="pm">Scores nothing here, frees this swimmer for another event.</span></button>';
    openSheet(ev.name + (s.relay ? ' · ' + DM.LEGNAME[s.leg] : ' · lane ' + (s.k + 1)), h, { kind: 'pick', slot: si });
  }
  function proj(w, si) { var pr = DM.project(st.M.home, w.lu); w.t = pr.t[si]; w.m = pr.mult[si]; w.b2b = pr.b2b[si]; return w; }
  function choose(si, p, tr) {
    var r = place(st.lu, si, p), nlu = r.lu;
    if (!nlu && tr != null) { var t = DM.trades(st.lu, si, p).filter(function (x) { return x.slot === +tr; })[0]; if (t) nlu = t.lu; }
    if (!nlu) { GK.ui.toast(r.err, 2400); J.haptic('fail'); return false; }
    st.lu = nlu; closeSheet();
    if (!st.practice) { D.draft.key = st.key; D.draft.lu = st.lu.slice(); save(); }
    GK.audio.play('tap'); J.haptic('tap');
    if (D.tut === 0 && st.hint) { st.hint = null; coach('Nice. The ★ events show seed points. Fix anything else you want, then tap Swim.'); }
    renderMeet();
    return true;
  }

  /* ---------- sheets ---------- */
  function openSheet(title, html, o) { st.sheet = o || { kind: 'info' }; $('shTitle').textContent = title; $('shBody').innerHTML = html; $('sheet').hidden = false; }
  function closeSheet() { st.sheet = null; $('sheet').hidden = true; $('shBody').innerHTML = ''; }
  function openRoster(tab) {
    var M = st.M, lu = st.lu, h = '<div class="tabs"><button class="btn' + (tab !== 'them' ? ' on' : '') + '" data-act="ros-you">Your roster</button><button class="btn' + (tab === 'them' ? ' on' : '') + '" data-act="ros-them">' + esc(M.away.school) + '</button></div>';
    var c = DM.counts(lu);
    if (tab !== 'them') {
      M.home.swimmers.forEach(function (s, p) {
        var sc = schedule(lu, p);
        h += '<div class="ros"><div class="rn"><span style="color:var(--you)">●</span><b>' + esc(s.name) + '</b><span>' + s.label + ' · ' + s.grade + '</span><span class="cnt">' + c.ind[p] + '/2 · ' + c.tot[p] + '/4</span></div><div class="re">' + (sc.all.length ? 'Swims ' + sc.all.join(', ') : 'Not swimming yet') + '</div><div class="re">' + bests(s) + '</div></div>';
      });
    } else {
      h += '<p class="note">Season best times. Their lineup is hidden except the ★ events.</p>';
      M.away.swimmers.forEach(function (s) { h += '<div class="ros"><div class="rn"><span style="color:var(--them)">◆</span><b>' + esc(s.name) + '</b><span>' + s.label + ' · ' + s.grade + '</span></div><div class="re">' + bests(s) + '</div></div>'; });
    }
    openSheet('Roster', h, { kind: 'roster', tab: tab });
  }
  function bests(s) {
    var a = s.ab, L = [['50 Fr', a.f50], ['100 Fr', a.f100], ['200 Fr', a.f200], ['500 Fr', a.f500], ['100 Bk', a.bk100], ['100 Br', a.br100], ['100 Fl', a.fl100], ['200 IM', a.im200]];
    return L.map(function (x) { return x[0] + ' <span class="num">' + fmt(x[1]) + '</span>'; }).join(' · ');
  }
  function openHelp() {
    openSheet('How to play', '<ol class="rules">' +
      '<li><b>Beat their lineup.</b> Put your 12 swimmers into the 11 events of a high school dual meet, then tap Swim.</li>' +
      '<li><b>Entry limits.</b> Each swimmer gets up to 2 individual events and 4 events in all. You have 3 lanes in each individual event and one relay.</li>' +
      '<li><b>Scoring.</b> Individual places score 6, 4, 3, 2, 1. A relay win scores 8 and second scores 4. Ties split the points. 164 points in all, so 83 wins.</li>' +
      '<li><b>Tired swimmers.</b> Every earlier swim adds a little time, more after long races. Back-to-back events (▲) add 2%. Diving after the 50 Free is a break.</li>' +
      '<li><b>Scouting.</b> Their coach built a lineup to beat your usual one. You can see 4 of their events (★). For the rest you see their top seeds.</li>' +
      '<li><b>Race day.</b> Every swim moves a few tenths from its seed, so a very close race can go either way. A clear gap never flips.</li>' +
      '<li><b>Daily.</b> One meet a day, the same for everyone, new at your midnight. Practice meets never run out.</li>' +
      '</ol><p class="note">All swimmers and schools are made up.</p>', { kind: 'help' });
  }
  function openSettings() {
    openSheet('Settings', '<div class="row"><button class="btn" data-act="mute">' + (D.muted ? 'Sound: off' : 'Sound: on') + '</button><button class="btn" data-act="tut">Show the tips again</button></div>' +
      '<div class="sec">Your save</div><p class="note">Progress keeps three backups and saves when you leave. Safari can clear a page after 7 days away, so export a code now and then.</p>' +
      '<div class="row"><button class="btn" data-act="export">Export save</button><button class="btn" data-act="import">Import save</button></div>', { kind: 'settings' });
  }
  function openBadges() {
    openSheet('Badges · ' + BD.count() + ' of ' + BADGES.length, '<div class="badgeWrap" id="bdWrap"></div>', { kind: 'badges' });
    BD.render($('bdWrap'));
  }
  var tools = GK.ui.saveTools(S, { onImported: function () { D = S.data; BD = GK.badges.create(BADGES, D.badges, { toast: true }); GK.audio.setMuted(D.muted); goTitle(); } });
  function sheetAct(act) {
    if (act === 'ros-you') openRoster('you');
    else if (act === 'ros-them') openRoster('them');
    else if (act === 'mute') { D.muted = !D.muted; GK.audio.setMuted(D.muted); save(); openSettings(); }
    else if (act === 'tut') { D.tut = 0; save(); GK.ui.toast('Tips will show on your next meet', 2000); }
    else if (act === 'export') { closeSheet(); tools.exportSave(); }
    else if (act === 'import') { closeSheet(); tools.importSave(); }
    else if (act === 'again') { closeSheet(); again(); }
  }

  /* ---------- swim and results ---------- */
  function swimNow() {
    if (st.mode !== 'meet') return;
    closeSheet();
    if (D.tut === 0) { D.tut = 1; coach(''); }
    finish(true);
  }
  function finish(fresh) {
    var M = st.M, r = DM.swim(M, st.lu), best = M.best, low = 0, relays = 0, empty = 0;
    r.events.forEach(function (e) { low = Math.min(low, e.runUs - e.runThem); if (EV[e.ev].relay && e.us > e.them) relays++; });
    st.lu.forEach(function (p) { if (p < 0) empty++; });
    var beat = r.margin > best.margin, perfect = r.margin >= best.margin;
    st.res = { r: r, best: best, beat: beat, perfect: perfect, low: low, relays: relays, empty: empty };
    if (fresh) {
      D.plays++; if (r.margin > 0) D.wins++; if (perfect) D.perfect++; if (beat) D.beat++;
      if (!st.practice) {
        D.today = { key: st.key, lu: st.lu.slice(), us: r.us, them: r.them, best: best.margin };
        D.draft = { key: '', lu: [] };
        GK.daily.mark(D.days, st.key);
        D.hist.push({ k: st.key, us: r.us, them: r.them, best: best.margin }); if (D.hist.length > 60) D.hist.splice(0, D.hist.length - 60);
      }
      save();
    }
    show('res'); renderResults(fresh);
  }
  function stars(res) { var m = res.r.margin, b = res.best.margin; return res.perfect ? 3 : m > 0 && m >= b / 2 ? 2 : m > 0 ? 1 : 0; }
  function renderResults(animate) {
    var M = st.M, res = st.res, r = res.r;
    $('rYouN').textContent = M.home.school; $('rThemN').textContent = M.away.school;
    $('rLbl').textContent = st.practice ? (st.retry ? 'Today again · not scored' : 'Practice · ' + st.code) : 'Final · ' + GK.daily.label(st.key);
    $('rEvents').innerHTML = ''; st.shown = 0; st.reveal = r.events.map(eventCard);
    $('rBest').textContent = 'Best';
    var reduce = false; try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    if (!animate) { revealAll(); return; }
    $('rWL').textContent = ''; $('rRate').innerHTML = ''; $('rUs').textContent = '0'; $('rThem').textContent = '0';
    $('rBtns').hidden = true; $('rSkip').hidden = false;
    var step = reduce ? 260 : 620;
    (function tick() {
      if (st.mode !== 'res' || st.shown >= r.events.length) { if (st.shown >= r.events.length) endReveal(); return; }
      showEvent(st.shown++, true);
      st.timer = setTimeout(tick, step);
    })();
  }
  function showEvent(i, sound) {
    var e = st.res.r.events[i], box = $('rEvents');
    box.innerHTML = st.reveal[i] + box.innerHTML; // newest on top
    $('rUs').textContent = pts(e.runUs); $('rThem').textContent = pts(e.runThem);
    $('rUs').className = 'pts bump'; $('rThem').className = 'pts';
    if (sound) GK.audio.play(e.us > e.them ? 'success' : e.us < e.them ? 'fail' : 'tap', { vol: e.us > e.them ? 0.55 : 0.3 });
  }
  function revealAll() { clearTimeout(st.timer); var box = $('rEvents'); box.innerHTML = st.reveal.slice().reverse().join(''); st.shown = st.reveal.length; endReveal(true); }
  function endReveal(quiet) {
    var res = st.res, r = res.r, M = st.M, b = res.best, n = stars(res);
    $('rUs').textContent = pts(r.us); $('rThem').textContent = pts(r.them);
    var w = r.margin > 0 ? 'w' : r.margin < 0 ? 'l' : 't';
    $('rWL').className = w; $('rWL').textContent = w === 'w' ? 'Win by ' + pts(r.margin) : w === 'l' ? 'Lose by ' + pts(-r.margin) : 'Tie';
    $('rRate').innerHTML = '<div class="stars" aria-label="' + n + ' of 3 stars">' + '★★★'.slice(0, n) + '<span style="opacity:.3">' + '★★★'.slice(0, 3 - n) + '</span></div>' +
      (res.beat ? '<b>You beat the best lineup we found (' + signed(b.margin) + ').</b>' : res.perfect ? '<b>Perfect lineup.</b> That matches the best we found.' : 'Best lineup found: <b>' + signed(b.margin) + '</b> (' + pts(b.us) + '–' + pts(b.them) + ')') +
      (st.practice ? '' : '<br>New meet in ' + GK.daily.countdown(GK.daily.msToNext()));
    $('rBtns').hidden = false; $('rSkip').hidden = true;
    $('rBest').textContent = 'Best'; $('rShare').textContent = 'Share';
    var retry = $('rRetry'); if (retry) retry.hidden = st.practice;
    if (!quiet) { GK.audio.play(r.margin > 0 ? 'win' : 'fail'); J.haptic(r.margin > 0 ? 'success' : 'fail'); }
    BD.check({ plays: D.plays, won: r.margin > 0, margin: r.margin, perfect: res.perfect, beat: res.beat, relays: res.relays, low: res.low, empty: res.empty, days: D.days.days });
    save();
  }
  function signed(x) { return (x > 0 ? '+' : x < 0 ? '−' : '') + pts(Math.abs(x)); }
  function eventCard(e) {
    var M = st.M, ev = EV[e.ev], h = '<div class="re1"><div class="rh"><span class="num muted small">' + (e.ev + 1) + '</span><b>' + ev.name + '</b><span class="rp"><span class="y">● ' + pts(e.us) + '</span> · <span class="t">◆ ' + pts(e.them) + '</span></span></div>';
    e.entries.forEach(function (x) {
      var nm = ev.relay ? (x.side === 0 ? M.home.school : M.away.school) + ' relay' : (x.side === 0 ? M.home : M.away).swimmers[x.p].short;
      h += '<div class="rr ' + (x.side === 0 ? 'y' : 't') + '"><span class="pl">' + x.place + (x.tie ? '=' : '') + '</span><span class="mk">' + (x.side === 0 ? '●' : '◆') + '</span><span class="nm">' + esc(nm) + (x.b2b ? ' <span class="b2">▲</span>' : '') + '</span><span class="tm">' + fmt(x.t) + '</span><span class="pt">' + pts(x.pts) + '</span></div>';
      if (ev.relay) h += '<div class="small muted" style="padding-left:44px">' + x.legs.map(function (l, k) { return DM.LEGNAME[ev.legs[k]] + ' ' + esc((x.side === 0 ? M.home : M.away).swimmers[l.p].last) + ' ' + fmt(l.t); }).join(' · ') + '</div>';
    });
    return h + '</div>';
  }
  function shareText() {
    var r = st.res.r, b = st.res.best, n = stars(st.res);
    var grid = r.events.map(function (e) { return e.us > e.them ? '🟦' : e.us < e.them ? '🟥' : '🟨'; }).join('');
    var score = (r.margin > 0 ? 'W ' : r.margin < 0 ? 'L ' : 'T ') + pts(r.us) + '-' + pts(r.them);
    var tail = '★'.repeat(n) + '☆'.repeat(3 - n) + ' · best ' + signed(b.margin);
    if (st.practice && !st.retry) return 'Dual Meet practice ' + st.code + ': ' + score + '\n' + grid + '\n' + tail;
    return GK.daily.shareLine({ game: 'Dual Meet' + (st.retry ? ' (retry)' : ''), key: st.retry ? todayKey() : st.key, score: score, grid: grid, tail: tail });
  }
  function openBest() {
    var M = st.M, bl = M.best.lu, lu = st.lu, h = '<p class="note">The best lineup we found against their real lineup, race-day swings included: ' + pts(M.best.us) + '–' + pts(M.best.them) + '. Gold names are where it differs from yours.</p><div class="cmp"><div class="sec">Yours</div><div class="sec">Best found</div>';
    EV.forEach(function (ev, e) {
      var mine = ES[e].map(function (si) { return lu[si] < 0 ? '–' : M.home.swimmers[lu[si]].last; });
      var bb = ES[e].map(function (si) { var x = bl[si] < 0 ? '–' : M.home.swimmers[bl[si]].last; return lu[si] !== bl[si] ? '<span class="chg">' + esc(x) + '</span>' : esc(x); });
      h += '<div><b>' + ev.short + '</b><br>' + mine.map(esc).join(', ') + '</div><div><b>&nbsp;</b><br>' + bb.join(', ') + '</div>';
    });
    h += '</div><div class="sec">Their full lineup</div><div class="cmp">';
    EV.forEach(function (ev, e) { h += '<div><b>' + ev.short + '</b></div><div>' + ES[e].map(function (si) { return M.luB[si] < 0 ? '–' : esc(M.away.swimmers[M.luB[si]].last); }).join(', ') + '</div>'; });
    openSheet('Best lineup', h + '</div>', { kind: 'best' });
  }
  function again() { GK.ui.toast('New practice meet', 1200); setTimeout(function () { openPractice(); }, 30); }

  /* ---------- wiring ---------- */
  function on(id, fn) { var el = $(id); if (el) el.addEventListener('click', fn); }
  function attr(e, name) { var el = e && e.target; while (el && el !== document) { if (el.getAttribute && el.getAttribute(name) != null) return el.getAttribute(name); el = el.parentNode; } return null; }
  on('tGo', function () { openToday(); });
  on('tPractice', function () { again(); });
  on('tHelp', openHelp); on('tBadges', openBadges); on('tSet', openSettings);
  on('mBack', goTitle); on('mHelp', openHelp); on('mRoster', function () { openRoster('you'); }); on('mSwim', swimNow);
  on('coachX', function () { coach(''); });
  on('rAgain', again); on('rShare', function () { GK.share.text(shareText(), { title: 'Dual Meet' }); });
  on('rBest', openBest); on('rMenu', goTitle); on('rSkip', function () { revealAll(); });
  on('shClose', closeSheet);
  $('sheet').addEventListener('click', function (e) { if (e.target === $('sheet')) closeSheet(); });
  $('events').addEventListener('click', function (e) { var s = attr(e, 'data-slot'); if (s != null) openPick(+s); });
  $('shBody').addEventListener('click', function (e) {
    var a = attr(e, 'data-act'); if (a) { sheetAct(a); return; }
    var p = attr(e, 'data-p'); if (p != null && st.sheet && st.sheet.kind === 'pick') choose(st.sheet.slot, +p, attr(e, 'data-tr'));
  });
  // a Retry button for today's meet sits beside Share/Best/Menu on daily results
  (function () { var row = $('rShare') && $('rShare').parentNode; if (!row || !row.insertBefore) return; var b = document.createElement('button'); b.className = 'btn'; b.id = 'rRetry'; b.textContent = 'Retry'; b.addEventListener('click', retryToday); row.insertBefore(b, $('rMenu')); })();
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && st.sheet) closeSheet(); });

  show('title'); titleRender();
  setTimeout(function () { todayMeet(); titleRender(); }, 30);
  setInterval(function () { if (st.mode === 'title') titleRender(); }, 30000);

  // test hook (bots and smoke tests drive the real handlers through this)
  window.__DMT = {
    st: st, get D() { return D; }, S: S, DM: DM, BD: BD,
    openToday: openToday, openPractice: openPractice, retryToday: retryToday, openPick: openPick, choose: choose, place: place,
    swim: swimNow, revealAll: revealAll, shareText: shareText, openBest: openBest, openRoster: openRoster, openHelp: openHelp, openSettings: openSettings, openBadges: openBadges,
    goTitle: goTitle, sheetAct: sheetAct, todayMeet: todayMeet
  };
})();
