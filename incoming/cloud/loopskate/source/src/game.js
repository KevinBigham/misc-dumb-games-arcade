/* Loopskate page: input, drawing, sound, juice, saves, badges, daily, share. Rules live in rules.js (window.LS). */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var cv = $('cv'), app = $('app');
  var C = LS.CONFIG, FONT = '"Baloo 2","Trebuchet MS",ui-rounded,system-ui,sans-serif';
  GK.view.init();

  /* ---------- save ---------- */
  var S = GK.save.store('loopskate.v1', { version: 1, defaults: {
    best: 0, bestWave: 0, plays: 0, wins: 0, drops: 0, loops: 0,
    daily: { key: '', best: 0, plays: 0 }, days: { days: 0, last: '' }, badges: {}, muted: false, tips: {}, mode: 'free'
  } });
  function num(v) { v = +v; return isFinite(v) && v >= 0 ? Math.floor(v) : 0; }
  function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  function sanitize() {
    var d = S.data;
    ['best', 'bestWave', 'plays', 'wins', 'drops', 'loops'].forEach(function (k) { d[k] = num(d[k]); });
    d.daily = obj(d.daily); d.daily.key = typeof d.daily.key === 'string' ? d.daily.key : ''; d.daily.best = num(d.daily.best); d.daily.plays = num(d.daily.plays);
    d.days = obj(d.days); d.days.days = num(d.days.days); d.days.last = typeof d.days.last === 'string' ? d.days.last : '';
    d.badges = obj(d.badges); d.tips = obj(d.tips); d.muted = d.muted === true; d.mode = d.mode === 'daily' ? 'daily' : 'free';
    return d;
  }
  var D = sanitize();

  /* ---------- sound ---------- */
  GK.audio.init({}).std();
  GK.audio.define('pip', { wave: 'sine', f: 523.25, dur: 0.18, vol: 0.3, curve: 2.4 });
  GK.audio.define('crack', [{ wave: 'noise', dur: 0.16, vol: 0.3, curve: 3 }, { wave: 'sine', f: 190, f2: 70, dur: 0.24, vol: 0.38 }]);
  GK.audio.define('crackSoft', [{ wave: 'noise', dur: 0.1, vol: 0.16, curve: 3 }, { wave: 'sine', f: 240, f2: 120, dur: 0.12, vol: 0.18 }]);
  GK.audio.define('splash', [{ wave: 'noise', dur: 0.4, vol: 0.2, curve: 1.6 }, { wave: 'sine', f: 600, f2: 220, dur: 0.2, vol: 0.12 }]);
  GK.audio.define('snip', [{ wave: 'square', f: 1900, f2: 1000, dur: 0.035, vol: 0.1 }, { wave: 'square', f: 1600, f2: 800, dur: 0.035, vol: 0.1, at: 0.05 }]);
  GK.audio.define('bump', { wave: 'tri', f: 210, f2: 150, dur: 0.07, vol: 0.22 });
  GK.audio.define('thaw', [{ wave: 'sine', f: 440, f2: 170, dur: 0.75, vol: 0.25 }, { wave: 'noise', dur: 0.5, vol: 0.08, curve: 1 }]);
  GK.audio.define('chomp', [{ wave: 'square', f: 300, f2: 90, dur: 0.12, vol: 0.18 }, { wave: 'noise', dur: 0.1, vol: 0.15 }]);
  GK.audio.define('tick', { wave: 'tri', f: 1240, dur: 0.05, vol: 0.14 });
  GK.audio.setMuted(D.muted);
  // a major pentatonic run: every critter in a loop, and every loop in a combo, climbs one step
  var NOTES = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2, 3, 10 / 3, 4, 9 / 2, 5];
  function note(i, delay) { setTimeout(function () { GK.audio.play('pip', { rate: NOTES[Math.min(i, NOTES.length - 1)], jitter: 0, gap: 0, voices: 12 }); }, delay || 0); }

  /* ---------- juice ---------- */
  var J = GK.juice.create({ maxShake: 9 });
  var panel = GK.juice.panel(J);
  var DBG = { flashes: 0, flashTimes: [], minFont: 99, frames: 0 };
  var flashA = 0, flashCol = '#ffffff', recentFlash = [];
  // at most 3 flashes in any second, and none with reduced motion
  function flash(a, col) {
    if (!J.on.flash) return false;
    var n = performance.now(); recentFlash = recentFlash.filter(function (t) { return n - t < 1000; });
    if (recentFlash.length >= 3) return false;
    recentFlash.push(n); DBG.flashes++; DBG.flashTimes.push(n);
    flashA = Math.max(flashA, a); flashCol = col || '#ffffff'; return true;
  }

  /* ---------- badges ---------- */
  var BDEFS = [
    { id: 'first', name: 'First Crack', desc: 'Drop a critter through the ice' },
    { id: 'five', name: 'Full House', desc: 'Catch 5 in one loop' },
    { id: 'eight', name: 'Ice Fishing Trip', desc: 'Catch 8 in one loop', hidden: true },
    { id: 'chain', name: 'Chain Skater', desc: 'Reach a x4 combo' },
    { id: 'w5', name: 'Five Ponds', desc: 'Clear wave 5' },
    { id: 'w10', name: 'Pond Legend', desc: 'Clear wave 10' },
    { id: 'burr', name: 'Burr Buster', desc: 'Drop a burrbug' },
    { id: 'glim', name: 'Shiny!', desc: 'Catch a glimmer' },
    { id: 'plunge', name: 'Polar Plunge', desc: 'Skate into open water', funny: true },
    { id: 'haircut', name: 'Bad Haircut', desc: 'Get your trail snipped 5 times in one run', funny: true },
    { id: 'days3', name: 'Regular', desc: 'Skate on 3 different days', test: function (s) { return s.days >= 3; } }
  ].concat(GK.badges.milestones([10, 50], []));
  var B;
  function makeBadges() { B = GK.badges.create(BDEFS, D.badges); B.onEarn(function () { GK.audio.play('success'); }); }
  makeBadges();

  /* ---------- layout ---------- */
  var ctx, cw = 390, ch = 844, fit = { s: 1, x: 0, y: 0 }, ins = GK.view.insets, pond = null;
  function layout() {
    GK.view.measure(); ins = GK.view.insets;
    cw = window.innerWidth || 390; ch = window.innerHeight || 844;
    ctx = GK.view.canvas(cv, cw, ch);
    var top = ins.t + 56, bot = ins.b + 8, side = 6;
    var aw = cw - side * 2 - ins.l - ins.r, ah = ch - top - bot;
    if (ah < 560) { top = ins.t + 6; ah = ch - top - bot; }
    var f = GK.view.fit(C.W, C.H, aw, ah, 'fit');
    fit = { s: f.scale, x: side + ins.l + f.x, y: top + f.y };
    bgGrad = null; pond = null;
  }
  GK.view.onResize(layout);
  layout();
  function sx(x) { return fit.x + x * fit.s; }
  function sy(y) { return fit.y + y * fit.s; }

  /* ---------- input ---------- */
  var liftBuf = GK.input.buffer(0.12), lastSteer = null, botFn = null;
  var H = GK.input.attach(cv, {
    stick: { dead: 0.12, radius: 46, follow: true },
    onUp: function () { liftBuf.press(performance.now() / 1000); }
  });
  function getSteer() {
    if (botFn) return botFn(world);
    var st = H.stick;
    if (st.active && (st.x || st.y)) { lastSteer = Math.atan2(st.y, st.x); return lastSteer; }
    // a finger lifted for a moment keeps its line, so a quick re-grip doesn't jerk the skater
    if (!st.active && lastSteer != null && liftBuf.ready(performance.now() / 1000)) return lastSteer;
    return null;
  }

  /* ---------- run state ---------- */
  var world, runKind = D.mode, runSeed = '', mode = 'play', dyingT = 0, fx = [], pops = [], shownScore = 0;
  var fxr = GK.rng.make('loopskate-fx'), banner = { t: 0, text: '', sub: '' }, tipT = {}, lastResult = null, waterSeen = false;
  function start(kind) {
    runKind = kind || runKind; D.mode = runKind;
    runSeed = runKind === 'daily' ? GK.daily.seed('loopskate') : GK.rng.code();
    world = LS.create(runSeed);
    mode = 'play'; dyingT = 0; fx = []; pops = []; shownScore = 0; flashA = 0; tipT = {}; waterSeen = false;
    lastSteer = null; liftBuf.clear(); B.startRun(); pond = null;
    $('over').hidden = true; $('pause').hidden = true; $('badges').hidden = true;
    onEvents(world.events); world.events = [];
  }
  function countPlay() {
    D.plays++;
    if (runKind === 'daily') { var k = GK.daily.key(); if (D.daily.key !== k) D.daily = { key: k, best: 0, plays: 0 }; D.daily.plays++; }
    GK.daily.mark(D.days);
    B.check({ plays: D.plays, days: D.days.days }); S.save();
  }

  /* ---------- events from the rules ---------- */
  function onEvents(evs) {
    for (var i = 0; i < evs.length; i++) {
      var e = evs[i];
      switch (e.k) {
        case 'start': countPlay(); break;
        case 'loop': onLoop(e); break;
        case 'slip':
          GK.audio.play('splash', { vol: 0.6 }); ring(e.x, e.y, 18, '#bfe9ff'); pop(e.x, e.y - 10, '+' + e.pts, 15, '#bfe9ff');
          note(world.combo, 0); if (e.type === 'burr') B.earn('burr'); break;
        case 'snip':
          GK.audio.play('snip'); shards(e.x, e.y, 5, '#ffd2a8', 60); J.kick(fxr.float(-2, 2), fxr.float(-2, 2));
          if (world.stats.cuts >= 5) B.earn('haircut');
          if (!D.tips.snipCut) { D.tips.snipCut = 1; tipT.snipCut = 2.4; }
          break;
        case 'bump': GK.audio.play('bump', { vol: 0.7 }); J.kick(fxr.float(-1.5, 1.5), fxr.float(-1.5, 1.5)); break;
        case 'wave':
          if (e.n > 1) { GK.audio.play('tick'); banner = { t: 1.6, text: 'WAVE ' + e.n, sub: waveSub(e.n) }; }
          if (e.n === 2 && !D.tips.snip) tipT.snip = 4;
          if (e.n === 3 && !D.tips.burr) tipT.burr = 4.5;
          break;
        case 'clear':
          GK.audio.play('win', { vol: 0.8 }); flash(0.22, '#c8f6ff'); J.addTrauma(0.18);
          banner = { t: 1.4, text: 'POND CLEAR', sub: '+' + e.bonus + ' time bonus' };
          if (e.n >= 5) B.earn('w5'); if (e.n >= 10) B.earn('w10');
          break;
        case 'glim': GK.audio.play('tick', { rate: 1.5 }); pop(e.x, e.y - 14, 'Glimmer!', 15, '#ffe27a'); break;
        case 'glimGone': pop(e.x, e.y - 10, 'gone', 13, '#ffe27a'); break;
        case 'bite': GK.audio.play('chomp'); shards(e.x, e.y, 10, '#c9a6ff', 120); break;
        case 'plunge': GK.audio.play('splash'); ring(e.x, e.y, 30, '#ffffff'); ring(e.x, e.y, 18, '#bfe9ff'); B.earn('plunge'); break;
        case 'thaw': GK.audio.play('thaw'); break;
        case 'over': onOver(e.cause); break;
      }
    }
  }
  function waveSub(n) { var s = LS.waveSpec(n), bits = []; if (s.burr) bits.push(s.burr + ' burrbug' + (s.burr > 1 ? 's' : '')); if (s.snip) bits.push(s.snip + ' snipper' + (s.snip > 1 ? 's' : '')); return bits.join(' · '); }
  function onLoop(e) {
    var h = e.hole, n = e.n;
    h.fx = crackLines(h);
    if (n > 0) {
      GK.audio.play('crack'); J.hitstop(Math.min(0.12, 0.05 + 0.012 * n)); J.addTrauma(Math.min(0.7, 0.2 + 0.06 * n)); J.haptic('success');
      var base = Math.max(0, e.combo - 1);
      for (var k = 0; k < n; k++) note(base + k, 60 + k * 75);
      pop(e.x, e.y, '+' + e.pts, n >= 4 ? 26 : 20, '#ffffff');
      if (e.combo > 1) pop(e.x, e.y + 22, 'COMBO x' + e.combo, 16, '#ffb347');
      if (n >= 4) flash(0.3, '#e9fbff');
      edgeShards(h.poly, 18 + n * 4);
      e.caught.forEach(function (id) { var c = world.critters.find(function (q) { return q.id === id; }); if (c) { ring(c.x, c.y, 16, '#bfe9ff'); if (c.type === 'burr') B.earn('burr'); if (c.type === 'glim') B.earn('glim'); } });
      B.earn('first'); if (n >= 5) B.earn('five'); if (n >= 8) B.earn('eight'); if (e.combo >= 4) B.earn('chain');
      if (!D.tips.loop) { D.tips.loop = 1; tipT.big = 2.6; }
    } else {
      GK.audio.play('crackSoft'); J.addTrauma(0.12); edgeShards(h.poly, 10);
      if (!D.tips.empty) { D.tips.empty = 1; tipT.empty = 2.6; }
    }
  }
  function onOver(cause) {
    mode = 'dying'; dyingT = cause === 'thaw' ? 1.2 : 0.95;
    GK.audio.play('fail', { vol: 0.8 }); J.addTrauma(0.55); J.haptic('fail');
    var W = world, sc = W.score, newBest = sc > D.best;
    if (newBest) D.best = sc;
    D.bestWave = Math.max(D.bestWave, W.stats.waves); D.drops += W.stats.drops; D.loops += W.stats.loops;
    var todayBest = 0;
    if (runKind === 'daily') { var k = GK.daily.key(); if (D.daily.key !== k) D.daily = { key: k, best: 0, plays: 0 }; if (sc > D.daily.best) D.daily.best = sc; todayBest = D.daily.best; }
    B.check({ plays: D.plays, days: D.days.days }); S.save();
    lastResult = { cause: cause, score: sc, newBest: newBest, waves: W.stats.waves, wave: W.wave, maxLoop: W.stats.maxLoop, maxCombo: W.stats.maxCombo, today: todayBest, kind: runKind, seed: runSeed };
  }
  function showOver() {
    mode = 'over'; var r = lastResult;
    $('oWhy').textContent = r.cause === 'water' ? 'You skated into open water' : r.cause === 'bite' ? 'A burrbug got you' : 'The pond thawed';
    $('oScore').textContent = r.score;
    $('oBest').innerHTML = (r.newBest && r.score > 0 ? '<b>New best!</b>' : 'Best ' + D.best) + (r.kind === 'daily' ? ' · Today ' + r.today : '');
    $('oWave').textContent = r.waves; $('oLoop').textContent = r.maxLoop; $('oCombo').textContent = r.maxCombo ? 'x' + r.maxCombo : '-';
    $('bMode').textContent = r.kind === 'daily' ? 'Free skate' : 'Daily pond';
    $('bBadges').textContent = 'Badges ' + B.count() + '/' + BDEFS.length;
    $('oNote').textContent = r.kind === 'daily' ? 'Daily pond ' + GK.daily.label(GK.daily.key()) + ' · new pond in ' + GK.daily.countdown(GK.daily.msToNext()) : 'Pond ' + r.seed;
    $('over').hidden = false;
  }
  function shareText() {
    var r = lastResult; if (!r) return 'Loopskate';
    var end = r.cause === 'water' ? '💦' : r.cause === 'bite' ? '🦔' : '🌡️';
    if (r.kind === 'daily') return GK.daily.shareLine({ game: 'Loopskate', score: r.score, grid: '🧊'.repeat(Math.min(12, r.waves)) + end, tail: 'Best loop ' + r.maxLoop + (r.maxCombo > 1 ? ' · combo x' + r.maxCombo : '') });
    return 'Loopskate: ' + r.score + ' on pond ' + r.seed + ' (' + r.waves + ' waves)';
  }

  /* ---------- buttons ---------- */
  $('bAgain').onclick = function () { start(runKind); };
  $('bMode').onclick = function () { start(runKind === 'daily' ? 'free' : 'daily'); };
  GK.share.button($('bShare'), shareText, { title: 'Loopskate' });
  $('bBadges').onclick = function () { B.render($('badgeList')); $('badges').hidden = false; };
  $('bBadgesClose').onclick = function () { $('badges').hidden = true; };
  function pause() { if (mode !== 'play') return; mode = 'paused'; $('pause').hidden = false; soundLabel(); S.save(); }
  function resume() { if (mode !== 'paused') return; $('pause').hidden = true; mode = 'play'; lastSteer = null; liftBuf.clear(); }
  $('bPause').onclick = function () { if (mode === 'play') pause(); else if (mode === 'paused') resume(); };
  $('bResume').onclick = resume;
  $('bRestart').onclick = function () { start(runKind); };
  function soundLabel() { $('bSound').textContent = D.muted ? 'Sound off' : 'Sound on'; }
  $('bSound').onclick = function () { D.muted = !D.muted; GK.audio.setMuted(D.muted); soundLabel(); S.save(); };
  var tools = GK.ui.saveTools(S, { onImported: function () { D = sanitize(); makeBadges(); GK.audio.setMuted(D.muted); soundLabel(); } });
  $('bExport').onclick = tools.exportSave; $('bImport').onclick = tools.importSave;
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); });

  /* ---------- effects ---------- */
  function crackLines(h) {
    var c = h.c, lines = [], P = h.poly, step = Math.max(1, Math.floor(P.length / 9));
    for (var i = 0; i < P.length; i += step) {
      var p = P[i], pts = [{ x: c.x, y: c.y }], segs = 4;
      for (var k = 1; k <= segs; k++) { var f = k / segs; pts.push({ x: c.x + (p.x - c.x) * f + fxr.float(-5, 5) * (k < segs ? 1 : 0), y: c.y + (p.y - c.y) * f + fxr.float(-5, 5) * (k < segs ? 1 : 0) }); }
      lines.push(pts);
    }
    return lines;
  }
  function shards(x, y, n, col, spd) { for (var i = 0; i < n && fx.length < 260; i++) { var a = fxr.float(0, 6.283), v = fxr.float(0.3, 1) * spd; fx.push({ k: 's', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: fxr.float(0.3, 0.6), c: col, sz: fxr.float(1.5, 3.2), r: fxr.float(0, 3) }); } }
  function edgeShards(poly, n) { for (var i = 0; i < n && fx.length < 260; i++) { var p = poly[fxr.int(0, poly.length - 1)]; shards(p.x, p.y, 1, i % 3 ? '#ffffff' : '#9fe7ff', 70); } }
  function ring(x, y, r, col) { if (fx.length < 280) fx.push({ k: 'r', x: x, y: y, t: 0, life: 0.55, r: r, c: col }); }
  function pop(x, y, text, px, col) { pops.push({ x: x, y: y, text: text, px: px, c: col, t: 0, life: 1.0 }); if (pops.length > 12) pops.shift(); }
  function updFx(dt) {
    for (var i = fx.length - 1; i >= 0; i--) { var p = fx[i]; p.t += dt; if (p.t >= p.life) { fx.splice(i, 1); continue; } if (p.k === 's') { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92; } }
    for (var j = pops.length - 1; j >= 0; j--) { pops[j].t += dt; if (pops[j].t >= pops[j].life) pops.splice(j, 1); }
    for (var k in tipT) { tipT[k] -= dt; if (tipT[k] <= 0) delete tipT[k]; }
    if (banner.t > 0) banner.t -= dt;
    flashA = Math.max(0, flashA - dt * 3.2);
  }

  /* ---------- loop ---------- */
  function update(dt) {
    if (mode === 'play') {
      LS.step(world, dt, getSteer());
      var ev = world.events; world.events = []; onEvents(ev);
      if (!waterSeen) for (var i = 0; i < world.holes.length; i++) if (LS.holeDanger(world, world.holes[i]) && world.holes[i].armed) { waterSeen = true; if (!D.tips.water) { D.tips.water = 1; tipT.water = 2.6; } }
    } else if (mode === 'dying') { dyingT -= dt; if (dyingT <= 0) showOver(); }
    updFx(dt);
  }
  var bgGrad = null;
  function txt(s, x, y, px, col, align, weight) {
    px = Math.max(12, px); if (px < DBG.minFont) DBG.minFont = px;
    ctx.font = (weight || 800) + ' ' + px + 'px ' + FONT; ctx.fillStyle = col; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
  }
  function outlineTxt(s, x, y, px, col, align) {
    px = Math.max(12, px); if (px < DBG.minFont) DBG.minFont = px;
    ctx.font = '800 ' + px + 'px ' + FONT; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(3, px / 5); ctx.strokeStyle = 'rgba(10,26,44,.85)'; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y);
  }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath(); }

  // the pond (snowbank, ice and its scratches) is drawn once per run and size, then copied each frame
  function buildPond() {
    var d = GK.view.dpr(), pc = document.createElement('canvas');
    pc.width = Math.ceil(cw * d); pc.height = Math.ceil(ch * d);
    var g = pc.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0);
    var bg = g.createLinearGradient(0, 0, 0, ch); bg.addColorStop(0, '#0b1626'); bg.addColorStop(0.55, '#14294a'); bg.addColorStop(1, '#1d2f4f');
    g.fillStyle = bg; g.fillRect(0, 0, cw, ch);
    var sr = GK.rng.make('loopskate-sky'); g.fillStyle = 'rgba(255,255,255,.5)';
    for (var i = 0; i < 46; i++) g.fillRect(sr.float(0, cw), sr.float(0, ch), 1.4, 1.4);
    g.save(); g.translate(fit.x, fit.y); g.scale(fit.s, fit.s);
    g.fillStyle = 'rgba(0,0,0,.28)'; rrect(g, C.M - 10, C.M - 4, C.W - 2 * C.M + 20, C.H - 2 * C.M + 18, 26); g.fill();
    g.fillStyle = '#eef7fb'; rrect(g, C.M - 10, C.M - 10, C.W - 2 * C.M + 20, C.H - 2 * C.M + 20, 26); g.fill();
    var ice = g.createLinearGradient(0, C.M, 0, C.H - C.M); ice.addColorStop(0, '#d4ecf6'); ice.addColorStop(0.5, '#c4e3f0'); ice.addColorStop(1, '#b3d8ea');
    g.fillStyle = ice; rrect(g, C.M, C.M, C.W - 2 * C.M, C.H - 2 * C.M, 16); g.fill();
    g.save(); rrect(g, C.M, C.M, C.W - 2 * C.M, C.H - 2 * C.M, 16); g.clip();
    var r = GK.rng.make('loopskate-ice|' + runSeed);
    g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.55)';
    for (i = 0; i < 34; i++) { g.beginPath(); var cx = r.float(0, C.W), cy = r.float(0, C.H), rad = r.float(30, 160), a0 = r.float(0, 6.28); g.arc(cx, cy, rad, a0, a0 + r.float(0.3, 1.1)); g.stroke(); }
    g.strokeStyle = 'rgba(120,170,200,.25)';
    for (i = 0; i < 14; i++) { g.beginPath(); var x0 = r.float(0, C.W), y0 = r.float(0, C.H); g.moveTo(x0, y0); g.lineTo(x0 + r.float(-40, 40), y0 + r.float(-40, 40)); g.stroke(); }
    var sheen = g.createRadialGradient(C.W * 0.3, C.H * 0.2, 10, C.W * 0.3, C.H * 0.2, 320); sheen.addColorStop(0, 'rgba(255,255,255,.35)'); sheen.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sheen; g.fillRect(0, 0, C.W, C.H);
    g.restore(); g.restore();
    pond = pc;
  }

  function scaledPath(h, f) {
    var c = h.c, P = h.poly; ctx.beginPath();
    for (var i = 0; i < P.length; i++) { var x = c.x + (P[i].x - c.x) * f, y = c.y + (P[i].y - c.y) * f; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.closePath();
  }
  function drawHoles() {
    var W = world;
    for (var i = 0; i < W.holes.length; i++) {
      var h = W.holes[i], t = h.t;
      if (t < C.HOLE_BREAK) {
        var p = t / C.HOLE_BREAK;
        ctx.strokeStyle = 'rgba(40,90,130,' + (0.5 + 0.5 * p) + ')'; ctx.lineWidth = 1.6;
        (h.fx || []).forEach(function (L) { ctx.beginPath(); ctx.moveTo(L[0].x, L[0].y); var n = Math.max(1, Math.ceil(p * (L.length - 1))); for (var k = 1; k <= n; k++) ctx.lineTo(L[k].x, L[k].y); ctx.stroke(); });
        scaledPath(h, 1); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = 'rgba(30,80,120,' + (0.25 * p) + ')'; ctx.fill();
      } else if (t < C.HOLE_OPEN) {
        var f = LS.holeScale(W, h);
        scaledPath(h, 1); ctx.fillStyle = 'rgba(215,240,250,.7)'; ctx.fill();
        scaledPath(h, f); ctx.fillStyle = '#0d2c47'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2.2; ctx.stroke();
        var rip = (t * 1.3) % 1; scaledPath(h, f * (0.35 + 0.5 * rip)); ctx.strokeStyle = 'rgba(120,190,230,' + (0.45 * (1 - rip)) + ')'; ctx.lineWidth = 1.4; ctx.stroke();
      } else {
        var q = (t - C.HOLE_OPEN) / (C.HOLE_END - C.HOLE_OPEN);
        scaledPath(h, 1); ctx.fillStyle = 'rgba(230,246,252,' + (0.7 * (1 - q)) + ')'; ctx.fill();
      }
    }
  }
  function drawTrail() {
    var T = world.trail, n = T.length; if (n < 2) return;
    var life = C.TRAIL_LIFE, now = world.t, BANDS = 5;
    for (var pass = 0; pass < 2; pass++) {
      for (var b = 0; b < BANDS; b++) {
        var lo = b / BANDS, hi = (b + 1) / BANDS, any = false; ctx.beginPath();
        for (var i = 0; i < n - 1; i++) {
          var age = 1 - Math.min(1, (now - T[i].t) / life);
          if (age < lo || age >= hi && !(b === BANDS - 1 && age >= 1)) continue;
          ctx.moveTo(T[i].x, T[i].y); ctx.lineTo(T[i + 1].x, T[i + 1].y); any = true;
        }
        if (!any) continue;
        var a = (lo + hi) / 2;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (pass === 0) { ctx.strokeStyle = 'rgba(63,224,245,' + (0.32 * a) + ')'; ctx.lineWidth = 10; }
        else { ctx.strokeStyle = 'rgba(232,252,255,' + (0.35 + 0.65 * a) + ')'; ctx.lineWidth = 3.2; }
        ctx.stroke();
      }
    }
    // closing hint: a pulse where the blade is about to meet its own trail
    var s = world.sk, best = 1e9, bx = 0, by = 0;
    for (var j = 0; j < n - C.SNAP_GAP - 1; j++) { if (now - T[j].t < C.SNAP_AGE) continue; var d = Math.hypot(T[j].x - s.x, T[j].y - s.y); if (d < best) { best = d; bx = T[j].x; by = T[j].y; } }
    if (best < 30) { var pr = 6 + 4 * Math.sin(now * 18); ctx.beginPath(); ctx.arc(bx, by, pr, 0, 6.283); ctx.strokeStyle = 'rgba(255,179,71,.95)'; ctx.lineWidth = 2.5; ctx.stroke(); }
  }
  function eyes(x, y, a, sp, col) { var px = Math.cos(a), py = Math.sin(a); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x - py * sp + px * 2, y + px * sp + py * 2, 2.6, 0, 6.283); ctx.arc(x + py * sp + px * 2, y - px * sp + py * 2, 2.6, 0, 6.283); ctx.fill(); ctx.fillStyle = col || '#13233a'; ctx.beginPath(); ctx.arc(x - py * sp + px * 3, y + px * sp + py * 3, 1.3, 0, 6.283); ctx.arc(x + py * sp + px * 3, y - px * sp + py * 3, 1.3, 0, 6.283); ctx.fill(); }
  function drawCritter(c) {
    var x = c.x, y = c.y, r = c.r, k = 1, al = 1;
    if (c.state === 'drop') { var p = Math.min(1, c.dropT / 0.8); k = 1 - p * 0.85; al = 1 - p; y += p * 6; }
    ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.scale(k, k);
    if (c.state === 'drop') ctx.rotate(c.dropT * 7);
    var bob = Math.sin(c.t * 9 + c.id) * 1.2;
    ctx.fillStyle = 'rgba(20,50,80,.18)'; ctx.beginPath(); ctx.ellipse(0, r * 0.75, r * 0.95, r * 0.35, 0, 0, 6.283); ctx.fill();
    if (c.type === 'puff') {
      ctx.fillStyle = '#7fe7c0'; ctx.beginPath(); ctx.arc(0, bob - 1, r, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#b8f7df'; ctx.beginPath(); ctx.arc(-3, bob - 4, r * 0.45, 0, 6.283); ctx.fill();
      eyes(0, bob - 2, c.a, 3.2);
    } else if (c.type === 'snip') {
      ctx.rotate(c.a); var cl = Math.sin(c.t * 14) * 0.35;
      ctx.fillStyle = '#ff9147'; ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.78, 0, 0, 6.283); ctx.fill();
      [-1, 1].forEach(function (sd) { ctx.save(); ctx.translate(r * 0.8, sd * 5); ctx.rotate(sd * (0.4 + cl)); ctx.fillStyle = '#ff7a2e'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8, -2.5 * sd); ctx.lineTo(6, 1.5 * sd); ctx.closePath(); ctx.fill(); ctx.restore(); });
      ctx.rotate(-c.a); eyes(0, -1, c.a, 3.4);
    } else if (c.type === 'burr') {
      var sq = c.rest ? 0.88 : 1;
      ctx.scale(1 / sq, sq);
      ctx.fillStyle = '#7a4fe0'; ctx.beginPath();
      for (var i = 0; i < 16; i++) { var a = i / 16 * 6.283 + c.t * (c.rest ? 0 : 2), rr = i % 2 ? r : r * 1.38; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a07bff'; ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0, 6.283); ctx.fill();
      eyes(0, 0, c.a, 3.4, '#3a0f2e');
      ctx.strokeStyle = '#2a1442'; ctx.lineWidth = 1.6; var px = Math.cos(c.a), py = Math.sin(c.a);
      ctx.beginPath(); ctx.moveTo(-py * 6 + px * 1, px * 6 + py * 1); ctx.lineTo(-py * 1.5 + px * 3.5, px * 1.5 + py * 3.5); ctx.moveTo(py * 6 + px * 1, -px * 6 + py * 1); ctx.lineTo(py * 1.5 + px * 3.5, -px * 1.5 + py * 3.5); ctx.stroke();
      if (c.rest) { ctx.scale(sq, 1 / sq); ctx.fillStyle = 'rgba(255,255,255,.9)'; for (var dd = 0; dd < 3; dd++) { ctx.beginPath(); ctx.arc(-5 + dd * 5, -r - 7 - Math.sin(c.t * 8 + dd) * 1.5, 1.6, 0, 6.283); ctx.fill(); } }
    } else if (c.type === 'glim') {
      ctx.rotate(c.t * 3); ctx.fillStyle = '#ffd84a'; ctx.beginPath();
      for (var j = 0; j < 10; j++) { var b = j / 10 * 6.283, q = j % 2 ? r * 0.45 : r * 1.15; ctx.lineTo(Math.cos(b) * q, Math.sin(b) * q); }
      ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff6c4'; ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, 6.283); ctx.fill();
    }
    ctx.restore();
  }
  function drawSkater() {
    var s = world.sk, t = world.t, sink = 0, spin = 0;
    if (mode === 'dying' || mode === 'over') { var p = 1 - Math.max(0, dyingT) / 0.95; if (world.cause === 'water') sink = Math.min(1, p * 1.2); if (world.cause === 'bite') spin = p * 9; }
    ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.a + spin);
    var k = 1 - sink * 0.6; ctx.scale(k, k); ctx.globalAlpha = 1 - sink * 0.8;
    ctx.fillStyle = 'rgba(20,50,80,.22)'; ctx.beginPath(); ctx.ellipse(-2, 3, 11, 6, 0, 0, 6.283); ctx.fill();
    // blades
    ctx.strokeStyle = '#e8eef4'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(7, -4); ctx.moveTo(-6, 4); ctx.lineTo(7, 4); ctx.stroke();
    // scarf trailing behind
    var w = Math.sin(t * 16) * 3; ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-10, w, -17, -w); ctx.stroke();
    ctx.fillStyle = '#ff4f6a'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 6.5, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#ffe1c4'; ctx.beginPath(); ctx.arc(3, 0, 4.2, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#26457a'; ctx.beginPath(); ctx.arc(2, 0, 4.4, Math.PI * 0.5, Math.PI * 1.5); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-2.6, 0, 1.6, 0, 6.283); ctx.fill();
    ctx.restore();
  }
  function drawFx() {
    for (var i = 0; i < fx.length; i++) {
      var p = fx[i], q = p.t / p.life;
      if (p.k === 's') { ctx.fillStyle = p.c; ctx.globalAlpha = 1 - q; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r + q * 4); ctx.fillRect(-p.sz / 2, -p.sz / 2, p.sz, p.sz * 0.6); ctx.restore(); }
      else { ctx.globalAlpha = 1 - q; ctx.strokeStyle = p.c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.4 + q), 0, 6.283); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }
  function drawLoopHint() {
    // first catch of the first run: a dashed ring shows where to skate
    var L = LS.live(world); if (!L.length) return;
    var cx = 0, cy = 0; L.forEach(function (c) { cx += c.x; cy += c.y; }); cx /= L.length; cy /= L.length;
    var R = 26; L.forEach(function (c) { R = Math.max(R, Math.hypot(c.x - cx, c.y - cy) + 30); });
    ctx.save(); ctx.setLineDash([7, 9]); ctx.lineDashOffset = -world.t * 30; ctx.strokeStyle = 'rgba(255,179,71,.9)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.stroke(); ctx.restore();
    return { x: cx, y: cy - R - 16 };
  }

  function render(alpha, rdt) {
    DBG.frames++;
    if (!pond) buildPond();
    var d = GK.view.dpr(); ctx.setTransform(1, 0, 0, 1, J.x * d, J.y * d); ctx.drawImage(pond, 0, 0); ctx.setTransform(d, 0, 0, d, 0, 0);
    var W = world;
    ctx.save(); J.apply(ctx); ctx.translate(fit.x, fit.y); ctx.scale(fit.s, fit.s);
    ctx.save(); rrect(ctx, C.M, C.M, C.W - 2 * C.M, C.H - 2 * C.M, 16); ctx.clip();
    drawHoles();
    // thaw warning: the ice darkens as time runs out
    if (W.phase === 'play' && W.started && W.timer < 6) { ctx.fillStyle = 'rgba(30,70,110,' + (0.22 * (1 - W.timer / 6) * (0.7 + 0.3 * Math.sin(W.t * 10))) + ')'; ctx.fillRect(0, 0, C.W, C.H); }
    ctx.restore();
    drawTrail();
    var hintAt = null;
    if (W.wave === 1 && W.started && W.stats.drops === 0 && !D.tips.loop) hintAt = drawLoopHint();
    for (var i = 0; i < W.critters.length; i++) drawCritter(W.critters[i]);
    drawSkater(); drawFx();
    ctx.restore();

    // ---- screen space ----
    for (var j = 0; j < pops.length; j++) { var p = pops[j], q = p.t / p.life; ctx.globalAlpha = q < 0.75 ? 1 : 1 - (q - 0.75) / 0.25; outlineTxt(p.text, sx(p.x), sy(p.y) - q * 34, p.px * (q < 0.12 ? 0.7 + q * 2.5 : 1), p.c); }
    ctx.globalAlpha = 1;
    tips(hintAt);
    hud();
    if (banner.t > 0) { var ba = Math.min(1, banner.t * 2.5); ctx.globalAlpha = ba; outlineTxt(banner.text, sx(C.W / 2), sy(C.H * 0.36), 40, '#ffffff'); if (banner.sub) outlineTxt(banner.sub, sx(C.W / 2), sy(C.H * 0.36) + 34, 16, '#cfeaf6'); ctx.globalAlpha = 1; }
    var st = H.stick;
    if (st.active && mode === 'play') { ctx.globalAlpha = 0.5; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(st.ox, st.oy, st.r, 0, 6.283); ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(st.ox + st.x * st.r, st.oy + st.y * st.r, 14, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1; }
    if (flashA > 0.01) { ctx.globalAlpha = flashA; ctx.fillStyle = flashCol; ctx.fillRect(0, 0, cw, ch); ctx.globalAlpha = 1; }
  }
  function tips(hintAt) {
    var W = world;
    if (!W.started && mode === 'play') {
      var y = sy(W.sk.y) + 44, t = (Date.now() % 1600) / 1600;
      outlineTxt('LOOPSKATE', sx(C.W / 2), sy(C.H * 0.2), 44, '#ffffff');
      outlineTxt('Drag anywhere to skate', sx(C.W / 2), y, 20, '#ffffff');
      ctx.globalAlpha = 0.85; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(sx(C.W / 2) - 40 + 80 * GK.ease.quadOut(t), y + 34, 11, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
      if (D.best) outlineTxt('Best ' + D.best + (runKind === 'daily' ? ' · Daily pond' : ''), sx(C.W / 2), sy(C.H * 0.2) + 34, 15, '#cfeaf6');
      return;
    }
    if (hintAt) outlineTxt('Skate a loop around them', sx(hintAt.x), sy(hintAt.y), 17, '#ffb347');
    var mid = sy(C.H * 0.13);
    if (tipT.big) outlineTxt('Bigger loops catch more!', sx(C.W / 2), mid, 18, '#ffffff');
    else if (tipT.empty) outlineTxt('Loop around critters to drop them', sx(C.W / 2), mid, 17, '#ffffff');
    else if (tipT.water) outlineTxt("Open water! Don't skate in", sx(C.W / 2), mid, 18, '#bfe9ff');
    else if (tipT.snipCut) outlineTxt('Snipped! Your loop was cut', sx(C.W / 2), mid, 17, '#ffd2a8');
    var L = LS.live(W);
    function label(type, text, key) { if (!tipT[key]) return; var c = L.find(function (q) { return q.type === type; }); if (c) outlineTxt(text, sx(c.x), sy(c.y) - 26, 15, '#ffffff'); else delete tipT[key]; if (tipT[key] < 0.2) D.tips[key] = 1; }
    label('snip', 'Snipper: cuts your trail', 'snip');
    label('burr', "Burrbug: don't touch. Loop it!", 'burr');
    if (W.phase === 'play' && W.started && W.timer < 6 && mode === 'play') outlineTxt('Ice is thawing!', sx(C.W / 2), sy(C.H - 60), 18, '#ffd0c9');
  }
  function hud() {
    var W = world, x0 = 14 + ins.l, y0 = ins.t + 16;
    shownScore += (W.score - shownScore) * 0.2; if (Math.abs(W.score - shownScore) < 1) shownScore = W.score;
    txt('SCORE', x0, y0, 12, '#a9c3d3', 'left', 800);
    txt(String(Math.round(shownScore)), x0, y0 + 20, 26, '#ffffff', 'left', 800);
    var cx = cw / 2;
    txt((runKind === 'daily' ? 'DAILY · ' : '') + 'WAVE ' + W.wave, cx, y0, 13, '#ffffff', 'center', 800);
    var bw = Math.min(150, cw * 0.36), bh = 8, by = y0 + 14, frac = W.timerMax ? Math.max(0, W.timer / W.timerMax) : 0;
    ctx.fillStyle = 'rgba(169,195,211,.25)'; rrect(ctx, cx - bw / 2, by, bw, bh, 4); ctx.fill();
    var col = W.timer < 5 ? '#ff7b72' : W.timer < 9 ? '#ffb347' : '#3fe0f5';
    if (frac > 0) { ctx.fillStyle = col; rrect(ctx, cx - bw / 2, by, Math.max(bh, bw * frac), bh, 4); ctx.fill(); }
    txt(Math.ceil(W.timer) + 's', cx + bw / 2 + 6, by + 4, 12, W.timer < 5 ? '#ff7b72' : '#a9c3d3', 'left', 800);
    var left = 0; W.critters.forEach(function (c) { if (c.state === 'live' && c.type !== 'glim') left++; });
    txt(left + ' left', cx, by + 22, 12, '#a9c3d3', 'center', 700);
    if (W.combo > 0 && W.t - W.lastLoopT < C.COMBO_WIN && mode === 'play') {
      var cf = 1 - (W.t - W.lastLoopT) / C.COMBO_WIN;
      txt('COMBO x' + W.combo, x0, y0 + 44, 14, '#ffb347', 'left', 800);
      ctx.fillStyle = 'rgba(255,179,71,.85)'; ctx.fillRect(x0, y0 + 54, 72 * cf, 3);
    }
  }

  var loop = GK.loop(update, render, { juice: J, step: 1 / 60 });
  start(runKind);
  loop.start();

  // hooks for the bot tests (harmless in play)
  window.__LST = {
    LS: LS, J: J, DBG: DBG, S: S,
    world: function () { return world; }, mode: function () { return mode; }, save: function () { return D; },
    setBot: function (fn) { botFn = fn; }, start: start, flash: flash, fit: function () { return fit; }, result: function () { return lastResult; }, share: shareText
  };
})();
