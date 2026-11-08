// ===================== SNAPTHREAD UI: Storage, Audio, Renderer, Input =====================
(function () {
  'use strict';
  var CONFIG = ST.CONFIG, DATA = ST.DATA, Rules = ST.Rules, Validate = ST.Validate, C = DATA.CARDS, I = ART.I;
  var KEY_RUN = 'snapthread.v1.run', KEY_META = 'snapthread.v1.meta', KEY_BAD = 'snapthread.v1.corrupt';
  var DEBUG = /[?&]debug=1/.test(location.search);

  // ---------- Storage ----------
  var Storage = {
    ok: true,
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { Storage.ok = false; return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { Storage.ok = false; return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { Storage.ok = false; } }
  };
  function defaultMeta() { return { v: 1, best: 0, wins: 0, runs: 0, unlock: { dyer: false }, daily: {}, recorded: [], tut: {}, sound: true, music: true }; }
  function loadMeta() {
    var m = defaultMeta(), raw = Storage.get(KEY_META);
    if (!raw) return m;
    try {
      var p = JSON.parse(raw);
      if (p && typeof p === 'object') {
        if (typeof p.best === 'number' && p.best >= 0) m.best = Math.floor(p.best);
        if (typeof p.wins === 'number' && p.wins >= 0) m.wins = Math.floor(p.wins);
        if (typeof p.runs === 'number' && p.runs >= 0) m.runs = Math.floor(p.runs);
        if (p.unlock && p.unlock.dyer === true) m.unlock.dyer = true;
        if (p.daily && typeof p.daily === 'object') Object.keys(p.daily).slice(-30).forEach(function (k) { if (typeof p.daily[k] === 'number') m.daily[k] = p.daily[k]; });
        if (Array.isArray(p.recorded)) m.recorded = p.recorded.filter(function (x) { return typeof x === 'string'; }).slice(-40);
        if (p.tut && typeof p.tut === 'object') Object.keys(p.tut).forEach(function (k) { m.tut[k] = !!p.tut[k]; });
        if (p.sound === false) m.sound = false;
        if (p.music === false) m.music = false;
      }
    } catch (e) { /* keep defaults, meta is non-critical */ }
    return m;
  }
  function saveMeta() { Storage.set(KEY_META, JSON.stringify(meta)); }
  function saveRun() { if (S) Storage.set(KEY_RUN, JSON.stringify(S)); }
  function loadRun() {
    var raw = Storage.get(KEY_RUN);
    if (!raw) return null;
    var st = null, errs;
    try { st = JSON.parse(raw); errs = Validate.save(st); } catch (e) { errs = ['unreadable']; }
    if (errs.length) {
      Storage.set(KEY_BAD, raw); Storage.del(KEY_RUN);
      ui.notice = 'Your saved run could not be read (' + errs[0] + '). A backup copy was kept in this browser, and you can start a fresh run.';
      return null;
    }
    return st;
  }

  // ---------- Audio (all synthesized; starts on first gesture; silent in hidden tabs) ----------
  var Snd = {
    ctx: null, master: null, music: null, musicTimer: null, step: 0,
    init: function () {
      if (Snd.ctx) { if (Snd.ctx.state === 'suspended' && !document.hidden) Snd.ctx.resume(); return; }
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        Snd.ctx = new AC(); Snd.master = Snd.ctx.createGain(); Snd.master.gain.value = 0.55; Snd.master.connect(Snd.ctx.destination);
        Snd.music = Snd.ctx.createGain(); Snd.music.gain.value = 0.16; Snd.music.connect(Snd.master);
        Snd.startMusic();
      } catch (e) { Snd.ctx = null; }
    },
    tone: function (f, dur, type, vol, f2, delay, dest) {
      var c = Snd.ctx; if (!c || !meta.sound || c.state !== 'running') return;
      var t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
      o.type = type || 'triangle'; o.frequency.setValueAtTime(f, t);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest || Snd.master); o.start(t); o.stop(t + dur + 0.02);
    },
    noise: function (dur, vol, freq, delay) {
      var c = Snd.ctx; if (!c || !meta.sound || c.state !== 'running') return;
      var t = c.currentTime + (delay || 0), n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq || 1200; f.Q.value = 0.8; g.gain.value = vol || 0.3;
      s.connect(f); f.connect(g); g.connect(Snd.master); s.start(t);
    },
    sfx: function (name, arg) {
      switch (name) {
        case 'tap': Snd.tone(660, 0.05, 'sine', 0.08); break;
        case 'play': Snd.tone(392 * GK.audio.ladder(arg || 0), 0.14, 'triangle', 0.22); Snd.tone(784 * GK.audio.ladder(arg || 0), 0.08, 'sine', 0.06, null, 0.02); break;
        case 'hit': Snd.noise(0.12, 0.35, 900); Snd.tone(150, 0.12, 'sine', 0.3, 70); break;
        case 'block': Snd.tone(240, 0.09, 'square', 0.07, 200); Snd.noise(0.05, 0.12, 2400); break;
        case 'tension': Snd.tone(300 * GK.audio.ladder(arg || 0), 0.09, 'sawtooth', 0.05); break;
        case 'snap': Snd.noise(0.25, 0.6, 3200); Snd.tone(1400, 0.25, 'square', 0.12, 120); Snd.tone(90, 0.35, 'sine', 0.5, 45, 0.03); break;
        case 'hurt': Snd.noise(0.18, 0.4, 500); Snd.tone(120, 0.2, 'sawtooth', 0.15, 60); break;
        case 'kill': Snd.tone(523, 0.12, 'triangle', 0.2); Snd.tone(392, 0.2, 'triangle', 0.2, null, 0.08); break;
        case 'win': [523, 659, 784, 1046].forEach(function (f, i) { Snd.tone(f, 0.22, 'triangle', 0.22, null, i * 0.09); }); break;
        case 'lose': [392, 330, 262, 196].forEach(function (f, i) { Snd.tone(f, 0.3, 'triangle', 0.2, null, i * 0.14); }); break;
        case 'gold': Snd.tone(988, 0.07, 'square', 0.06); Snd.tone(1318, 0.1, 'square', 0.06, null, 0.06); break;
        case 'turn': Snd.tone(440, 0.06, 'sine', 0.08); break;
        case 'deny': Snd.tone(180, 0.12, 'square', 0.07, 140); break;
      }
    },
    // soft generative loom music. Mood follows the screen: calm on the map, quicker in fights
    // (faster still as Tension climbs), minor and drummed for The Unraveler. All synthesized.
    startMusic: function () {
      if (Snd.musicTimer) return;
      var MAJ = [220, 247, 277, 330, 370, 440, 494, 554, 659], MIN = [220, 262, 294, 330, 392, 440, 523, 587, 659];
      var tick = 0;
      Snd.musicTimer = setInterval(function () {
        if (!Snd.ctx || Snd.ctx.state !== 'running' || !meta.music || !meta.sound || document.hidden) return;
        tick++;
        var c = S && S.combat, boss = c && c.kind === 'boss', heat = c ? c.T : 0;
        var every = !S || !c ? 4 : heat >= 7 ? 2 : 3;
        if (S && (S.phase === 'victory' || S.phase === 'defeat')) every = 6;
        if (tick % every) return;
        var s = Snd.step++, pat = boss ? [0, 3, 2, 4, 3, 1, 2] : [0, 2, 4, 2, 5, 4, 1], sc = boss ? MIN : MAJ;
        if (s % 7 !== 3) Snd.tone(sc[(pat[s % 7] + Math.floor(s / 14)) % sc.length] * (heat >= 8 ? 1.5 : 1), c ? 0.35 : 0.6, 'triangle', 0.5, null, 0, Snd.music);
        if (s % 14 === 0) Snd.tone(boss ? 98 : 110, 1.2, 'sine', 0.6, null, 0, Snd.music);
        if (boss && s % 4 === 0) Snd.tone(70, 0.18, 'sine', 0.9, 40, 0, Snd.music);
        if (c && heat >= 6 && s % 2 === 1) Snd.tone(880 + heat * 40, 0.05, 'sine', 0.15, null, 0, Snd.music);
      }, 110);
    }
  };
  document.addEventListener('visibilitychange', function () {
    if (!Snd.ctx) return;
    if (document.hidden) { try { Snd.ctx.suspend(); } catch (e) {} }
    else if (meta.sound) { try { Snd.ctx.resume(); } catch (e) {} }
  });

  // ---------- state ----------
  var S = null, meta = loadMeta();
  var ui = { mem: {}, view: 'title', sel: null, tgt: null, sheet: null, notice: null, toast: null, busy: 0, lastEvents: [], dbg: false, endShown: null };
  S = loadRun();
  if (S && S.phase !== 'victory' && S.phase !== 'defeat') ui.view = 'title';

  var app = document.getElementById('app');
  var fx = document.createElement('div'); fx.className = 'fxlayer';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }

  function startNewRun(opts) {
    opts = opts || {};
    var seed = opts.seed || (RNGseed());
    S = Rules.newRun({ seed: seed, char: opts.char || 'weaver', daily: !!opts.daily, dailyKey: opts.dailyKey || null });
    S.runId = (opts.daily ? 'd' + opts.dailyKey : 'r') + '-' + seed + '-' + Date.now().toString(36);
    ui.sel = null; ui.tgt = null; ui.sheet = null; ui.view = 'game'; ui.endShown = null;
    meta.runs++; saveMeta(); saveRun(); render();
  }
  function RNGseed() { var a = new Uint32Array(1); try { crypto.getRandomValues(a); } catch (e) { a[0] = (Math.random() * 4294967296) >>> 0; } return (a[0] >>> 0) || 1; }

  function dispatch(cmd) {
    if (!S) return false;
    var r = Rules.apply(S, cmd);
    if (r.error) { ui.toast = r.error; Snd.sfx('deny'); render(); return false; }
    S = r.state; ui.lastEvents = r.events.slice(-40);
    if (cmd.t === 'play' || cmd.t === 'end') { ui.sel = null; }
    if (S.phase !== 'combat') { ui.sel = null; ui.tgt = null; }
    recordEnd();
    saveRun();
    ui.toast = null;
    render();
    playEvents(r.events);
    return true;
  }

  function recordEnd() {
    if (S.phase !== 'victory' && S.phase !== 'defeat') return;
    if (meta.recorded.indexOf(S.runId) >= 0) return;
    meta.recorded.push(S.runId); meta.recorded = meta.recorded.slice(-40);
    var res = { newBest: false, unlocked: null };
    if (S.score > meta.best) { meta.best = S.score; res.newBest = true; }
    if (S.daily && S.dailyKey) { if (!(meta.daily[S.dailyKey] >= S.score)) meta.daily[S.dailyKey] = S.score; }
    if (S.phase === 'victory') { meta.wins++; if (!meta.unlock.dyer) { meta.unlock.dyer = true; res.unlocked = 'dyer'; } }
    S.endNote = res;
    saveMeta();
  }

  // ---------- small render helpers ----------
  function hpBar() { var pct = Math.max(0, S.hp / S.maxHp * 100), pv = ui.mem.p === undefined ? S.hp : ui.mem.p, gp = Math.max(0, Math.min(100, pv / S.maxHp * 100)); return '<div class="hp' + (S.hp <= S.maxHp * 0.3 ? ' low' : '') + '" aria-label="Health ' + S.hp + ' of ' + S.maxHp + '">' + I.heart + '<div class="hpbar"><b class="gh" data-ghost="p" data-to="' + pct + '" style="width:' + gp + '%"></b><i style="width:' + pct + '%"></i></div><span>' + S.hp + '/' + S.maxHp + '</span></div>'; }
  function handMargin(n) {
    var vw = (typeof window !== 'undefined' && window.innerWidth) || 375, cw = vw <= 380 ? 68 : 74;
    var w = Math.min(vw, 560) - 16;
    if (!n) return 0;
    return Math.max(-Math.floor(cw * 0.34), Math.min(2, Math.floor((w / n - cw) / 2)));
  }
  function topBar() {
    var row = S.pos ? S.map.nodes[S.pos].r + 1 : 0;
    var rowTxt = row > CONFIG.ROWS ? 'Mill' : row === 0 ? 'Start' : '<span class="wide">Terrace </span><span class="narrow">▲</span>' + row + '/' + CONFIG.ROWS;
    return '<div class="top">' + hpBar() + '<span class="chip" aria-label="Gold">' + I.gold + S.gold + '</span>' +
      '<span class="chip muted" title="Terrace">' + rowTxt + '</span>' +
      '<span class="grow"></span><button class="iconbtn" data-act="deck" aria-label="View deck, ' + S.deck.length + ' cards">' + I.deck + '<span>' + S.deck.length + '</span></button>' +
      '<button class="iconbtn" data-act="menu" aria-label="Menu">≡</button></div>';
  }
  function fxChips(card, ctx) {
    var out = [], fxl = Rules.cardFx(card), tmp = ctx ? ctx.temper || 0 : 0;
    function dm(n) { var v = n + tmp; if (ctx && ctx.dull) v = Math.floor(v * CONFIG.DULL_MULT); return v; }
    fxl.forEach(function (f) {
      switch (f[0]) {
        case 'dmg': out.push(['d', I.atk, dm(f[1])]); break;
        case 'hits': out.push(['d', I.atk, dm(f[1]) + '×' + f[2]]); break;
        case 'dmgT': out.push(['d', I.atk, ctx ? dm(f[1] + f[2] * ctx.T) : f[1] + '+' + (f[2] > 1 ? f[2] : '') + 'T']); break;
        case 'whip': out.push(['d', I.atk, dm(f[1]) + '×' + (ctx ? Rules.whipHits(f[2], ctx.T) : 'T')]); break;
        case 'dmgBlock': out.push(['d', I.atk, ctx ? dm(ctx.block) : '=' ]); out.push(['b', I.block, '']); break;
        case 'dmgAll': out.push(['d', I.atk, 'all ' + dm(f[1])]); break;
        case 'release': out.push(['d', I.atk, 'all ' + (ctx ? dm(f[1] * ctx.T) : f[1] + '×T')]); break;
        case 'heavy': out.push(['d', I.atk, dm(f[1]) + (ctx && ctx.block >= f[2] ? '×2' : '')]); break;
        case 'block': out.push(['b', I.block, f[1]]); break;
        case 'blockT': out.push(['b', I.block, ctx ? f[1] + f[2] * ctx.T : f[1] + '+T']); break;
        case 'weave': out.push(['w', I.weave, f[1]]); break;
        case 'tense': out.push(['t', I.tension, '+' + f[1]]); break;
        case 'slack': out.push(['t', I.tension, '−' + f[1]]); break;
        case 'loosen': out.push(['t', I.tension, '→']); out.push(['b', I.block, f[1] + '/T']); break;
        case 'draw': out.push(['o', I.draw, f[1]]); break;
        case 'energy': out.push(['o', I.energy, '+' + f[1]]); break;
        case 'brittle': out.push(['o', I.debuff, 'Brt ' + f[1]]); break;
        case 'dull': out.push(['o', I.debuff, 'Dul ' + f[1]]); break;
        case 'double': out.push(['b', I.block, '×2']); break;
        case 'heal': out.push(['h', I.heal, f[1]]); break;
        case 'power': out.push(['o', I.buff, 'Power']); break;
      }
    });
    if (C[card.id].unplayable) out.push(['o', I.knot, 'Knot']);
    return out.map(function (x) { return '<span class="fxc ' + x[0] + '">' + x[1] + x[2] + '</span>'; }).join('');
  }
  function ctxNow() { var c = S && S.combat; return c ? { T: c.T, temper: c.temper, block: c.block, dull: c.dull > 0 } : null; }
  function cardName(c) { return C[c.id].name + (c.up ? '+' : ''); }
  function costText(c) { var k = Rules.cardCost(c); return k < 0 ? '' : k; }
  function handCard(c, i) {
    var d = C[c.id], can = Rules.canPlay(S, c), sel = ui.sel === c.uid;
    return '<button class="card ' + d.plan + (d.type === 'status' ? ' status' : '') + (c.up ? ' up' : '') + (sel ? ' sel' : '') + (can ? '' : ' cant') + '" data-card="' + c.uid + '" aria-label="' + esc(cardName(c) + ', cost ' + costText(c) + '. ' + Rules.describe(c, ctxNow())) + '" style="z-index:' + (sel ? 9 : i + 1) + '">' +
      (d.type === 'status' ? '' : '<span class="cost">' + costText(c) + '</span>') + '<span class="cname' + (cardName(c).length > 8 ? ' long' : '') + '">' + esc(cardName(c)) + '</span>' +
      '<span class="cart">' + ART.cardArt(c.id, d.plan) + '</span><span class="cfx">' + fxChips(c, ctxNow()) + '</span></button>';
  }
  function bigCard(id, up, extraCls, attrs, priceTxt) {
    var d = C[id], c = { id: id, up: up ? 1 : 0 };
    return '<div class="bigcard ' + d.plan + ' ' + (extraCls || '') + '" ' + (attrs || '') + '><div class="bmeta">' + (d.plan === 'taut' ? 'Taut ' : d.plan === 'weave' ? 'Weave ' : '') + d.type + (d.rarity === 'rare' || d.rarity === 'uncommon' ? '<br><span class="rar ' + d.rarity + '">' + d.rarity + '</span>' : '') + '</div>' +
      '<div class="bn">' + esc(d.name + (up ? '+' : '')) + ' <span class="price">(' + Rules.cardCost(c) + ')</span></div><div class="cart">' + ART.cardArt(id, d.plan) + '</div>' +
      '<div class="bt">' + esc(Rules.describe(c)) + '</div>' + (priceTxt ? '<div class="price">' + priceTxt + '</div>' : '') + '</div>';
  }
  function miniCard(c, attrs, preview) {
    var d = C[c.id], show = preview ? { id: c.id, up: 1 } : c;
    return '<button class="minicard ' + d.plan + (c.up ? ' up' : '') + '" ' + (attrs || '') + '>' + esc(cardName(show)) + ' <span class="muted">(' + costText(show) + ')</span><small>' + esc(Rules.describe(show)) + '</small></button>';
  }

  var KW = {
    Tension: 'Tension rises as you pull. At ' + CONFIG.T_MAX + ' the thread SNAPS: it lashes every enemy for ' + CONFIG.SNAP_HIT + ' and you for ' + CONFIG.SNAP_DMG + ' (through Block), then drops to ' + CONFIG.SNAP_RESET + '. Loses ' + CONFIG.SLACK + ' at the end of each turn.',
    Weave: 'At the start of your turn you keep up to your Weave in Block, instead of losing it all. Weave frays by 1 each turn.',
    Brittle: 'Takes 50% more damage. Drops by 1 each turn.',
    Dull: 'Deals 25% less attack damage. Drops by 1 each turn.',
    Knot: 'Unplayable clutter. If it is in your hand at end of turn, +' + CONFIG.KNOT_TENSION + ' Tension.',
    Exhaust: 'Removed for the rest of the fight.',
    Edge: 'Each point adds 1 damage to this enemy’s attacks.'
  };
  function keywordsFor(text) { return Object.keys(KW).filter(function (k) { return text.indexOf(k) >= 0; }); }

  function moveText(i) {
    var c = S.combat, e = c.enemies[i], parts = [], dmg = Rules.intentDamage(S, i), di = 0;
    e.intent.fx.forEach(function (f) {
      switch (f[0]) {
        case 'atk': var a = dmg[di++]; parts.push('attack ' + a.dmg + (a.times > 1 ? '×' + a.times : '')); break;
        case 'block': parts.push('block ' + f[1]); break;
        case 'str': parts.push('gain ' + f[1] + ' Edge'); break;
        case 'strAll': parts.push('all enemies gain ' + f[1] + ' Edge'); break;
        case 'dull': parts.push('make you Dull ' + f[1]); break;
        case 'brittle': parts.push('make you Brittle ' + f[1]); break;
        case 'knot': parts.push('add ' + f[1] + ' Knot' + (f[1] > 1 ? 's' : '') + ' to your discard'); break;
        case 'tense': parts.push('pull your thread +' + f[1] + ' Tension'); break;
        case 'slackP': parts.push('loosen your thread ' + f[1]); break;
        case 'heal': parts.push('heal ' + f[1]); break;
      }
    });
    return e.intent.name + ': ' + parts.join(', ') + '.';
  }
  function intentBubble(i) {
    var e = S.combat.enemies[i]; if (!e.intent) return '';
    var dmg = Rules.intentDamage(S, i), icons = '', di = 0, isAtk = false;
    e.intent.fx.forEach(function (f) {
      if (f[0] === 'atk') { var a = dmg[di++]; isAtk = true; icons += I.atk + a.dmg + (a.times > 1 ? '×' + a.times : ''); }
      else if (f[0] === 'block') icons += '<span style="color:#9fb0ff">' + I.block + '</span>';
      else if (f[0] === 'str' || f[0] === 'strAll' || f[0] === 'heal') icons += '<span style="color:#e9d36a">' + I.buff + '</span>';
      else if (f[0] === 'dull' || f[0] === 'brittle') icons += '<span style="color:#c4cf6a">' + I.debuff + '</span>';
      else if (f[0] === 'knot') icons += '<span style="color:#c3ae8e">' + I.knot + '</span>';
      else if (f[0] === 'tense') icons += '<span style="color:#ffd27a">' + I.tension + '+' + f[1] + '</span>';
    });
    return '<div class="intent' + (isAtk ? ' atk' : '') + '" title="' + esc(moveText(i)) + '">' + icons + '</div>';
  }

  // ---------- screens ----------
  function render() {
    var h;
    if (ui.view === 'title' || !S) h = renderTitle();
    else switch (S.phase) {
      case 'map': h = renderMap(); break;
      case 'combat': h = renderCombat(); break;
      case 'reward': h = renderReward(); break;
      case 'rest': h = renderRest(); break;
      case 'market': h = renderMarket(); break;
      case 'shrine': h = renderShrine(); break;
      default: h = renderEnd();
    }
    if (ui.sheet) h += renderSheet();
    if (DEBUG && ui.dbg) h += '<div class="dbg">' + esc(debugText()) + '</div>';
    if (DEBUG) h += '<button class="iconbtn" data-act="dbg" style="position:absolute;right:6px;bottom:6px;z-index:71">dbg</button>';
    app.innerHTML = h;
    app.appendChild(fx);
    afterRender();
  }

  function renderTitle() {
    var canCont = S && S.phase !== 'victory' && S.phase !== 'defeat';
    var dk = Rules.dailySeed().key, dBest = meta.daily[dk];
    return '<div class="scr title-scr"><div>' + ART.enemy('unraveler').replace('<svg', '<svg style="width:96px;height:96px"') + '</div>' +
      '<h1 class="logo title-font">Snap<b>thread</b></h1>' +
      '<p class="tag">Climb the dye terraces with a deck of cards. Pull your thread tight for big hits, but at 10 Tension it snaps.</p>' +
      (ui.notice ? '<div class="notice" role="alert">' + esc(ui.notice) + '</div>' : '') +
      (!Storage.ok ? '<div class="notice">This browser is blocking storage, so progress won’t be saved after you close the page.</div>' : '') +
      '<div class="menu">' + (canCont ? '<button class="btn primary" data-act="continue">Continue run (terrace ' + ((S.pos ? S.map.nodes[S.pos].r : 0) + 1) + ')</button>' : '') +
      '<button class="btn ' + (canCont ? '' : 'primary') + '" data-act="new">New run</button>' +
      '<button class="btn gold" data-act="daily">Daily thread · ' + dk + '</button>' +
      '<button class="btn ghost" data-act="howto">How to play</button>' +
      '<button class="btn ghost small" data-act="sound">Sound: ' + (meta.sound ? 'on' : 'off') + '</button><div data-pyw="btn ghost small"></div></div>' +
      '<div class="stats">Best score ' + meta.best + ' · Wins ' + meta.wins + ' · Runs ' + meta.runs + (dBest !== undefined ? ' · Today’s daily best ' + dBest : '') + (meta.unlock.dyer ? ' · The Dyer unlocked' : ' · Win once to unlock a second weaver') + '</div></div>';
  }

  function nodeIcon(t) { return I[t] || I.F; }
  var NODE_NAME = { F: 'Fight', E: 'Elite fight', R: 'Tea stall (rest)', M: 'Bazaar', S: 'Wayside event', B: 'The Unraveler' };
  function renderMap() {
    var M = S.map, W = Math.min(app.clientWidth || 380, 520), pad = 40, rowH = 64, H = (CONFIG.ROWS + 1) * rowH + 60;
    var can = Rules.reachable(S);
    function pos(n) { var x = pad + n.c / (CONFIG.COLS - 1) * (W - 2 * pad); var y = H - 40 - n.r * rowH; return [x, y]; }
    var lines = '', nodes = '';
    Object.keys(M.nodes).forEach(function (k) {
      var n = M.nodes[k], a = pos(n);
      n.next.forEach(function (m) {
        var b = pos(M.nodes[m]);
        var walked = S.visited.indexOf(k) >= 0 && S.visited.indexOf(m) >= 0;
        var avail = S.pos === k;
        lines += '<path d="M' + a[0] + ' ' + a[1] + ' L' + b[0] + ' ' + b[1] + '" stroke="' + (walked ? '#e9ab3c' : avail ? '#c3ae8e' : '#5a4436') + '" stroke-width="' + (walked ? 4 : 2.5) + '" stroke-dasharray="' + (walked ? '0' : '5 6') + '"/>';
      });
    });
    Object.keys(M.nodes).forEach(function (k) {
      var n = M.nodes[k], a = pos(n), cls = 'node';
      if (n.type === 'B') cls += ' boss';
      if (S.visited.indexOf(k) >= 0) cls += ' done';
      if (S.pos === k) cls += ' here';
      var ok = can.indexOf(k) >= 0;
      if (ok) cls += ' can'; else if (S.visited.indexOf(k) < 0) cls += ' locked';
      nodes += '<button class="' + cls + '" style="left:' + a[0] + 'px;top:' + a[1] + 'px" ' + (ok ? 'data-node="' + k + '"' : 'tabindex="-1" aria-disabled="true"') + ' aria-label="' + NODE_NAME[n.type] + ', terrace ' + (n.r + 1) + (ok ? ', reachable' : '') + '">' + nodeIcon(n.type) + '</button>';
    });
    var hint = !S.pos ? 'Pick where to start. Glowing circles are reachable.' : 'Choose your next stop up the terraces.';
    return '<div class="scr">' + topBar() + '<div class="info small"><div class="grow">' + hint + '</div></div><div class="mapwrap" id="mapwrap"><div class="map" style="width:' + W + 'px;height:' + H + 'px"><svg class="edges" width="' + W + '" height="' + H + '">' + lines + '</svg>' + nodes + '</div></div>' +
      '<div class="legend"><span>' + I.F + 'Fight</span><span>' + I.E + 'Elite</span><span>' + I.R + 'Rest</span><span>' + I.M + 'Bazaar</span><span>' + I.S + 'Event</span><span>' + I.B + 'Boss</span></div></div>';
  }

  function coachLine() {
    var c = S.combat;
    if (!meta.tut.play) return 'Tap a card to lift it, then tap an enemy to play it. Tap a lifted card again to play it on the only enemy.';
    if (!meta.tut.intent) return 'The bubble above each enemy is its next move. Block the attack or kill it first, then press End turn.';
    if (!meta.tut.tension && c.T > 0) return 'Tension is your thread. Some cards hit harder when it is high. At ' + CONFIG.T_MAX + ' it SNAPS: ' + CONFIG.SNAP_HIT + ' to every enemy, ' + CONFIG.SNAP_DMG + ' to you.';
    if (!meta.tut.knot && c.hand.some(function (x) { return x.id === 'knot'; })) return 'A Knot is clutter from the enemy. Left in your hand at end of turn, it adds ' + CONFIG.KNOT_TENSION + ' Tension.';
    return '';
  }

  function renderCombat() {
    var c = S.combat;
    var selCard = ui.sel !== null ? c.hand.filter(function (x) { return x.uid === ui.sel; })[0] : null;
    var targeting = selCard && Rules.needsTarget(selCard) && Rules.canPlay(S, selCard);
    var al = c.enemies.map(function (e, i) { return e.hp > 0 ? i : -1; }).filter(function (i) { return i >= 0; });
    if (ui.tgt === null || !c.enemies[ui.tgt] || c.enemies[ui.tgt].hp <= 0) ui.tgt = al.length ? al[0] : null;
    var en = c.enemies.map(function (e, i) {
      var st = '';
      if (e.block) st += '<span class="chip block">' + I.block + e.block + '</span>';
      if (e.str) st += '<span class="chip buff" title="Edge">' + I.buff + e.str + '</span>';
      if (e.brittle) st += '<span class="chip bad" title="Brittle">Brittle ' + e.brittle + '</span>';
      if (e.dull) st += '<span class="chip bad" title="Dull">Dull ' + e.dull + '</span>';
      var mk = c.node + ':' + i, prev = ui.mem[mk] === undefined ? e.hp : ui.mem[mk];
      var dying = e.hp <= 0 && prev > 0;
      return '<button class="enemy' + (e.hp <= 0 && !dying ? ' dead' : '') + (dying ? ' dying' : '') + (targeting && e.hp > 0 ? ' targetable' : '') + (ui.tgt === i && e.hp > 0 && (targeting || ui.showTgt) ? ' tgt' : '') + '" data-enemy="' + i + '" aria-label="' + esc(e.name + ', ' + e.hp + ' of ' + e.maxHp + ' HP. Next: ' + (e.intent ? moveText(i) : '')) + '">' +
        (e.hp > 0 ? intentBubble(i) : '<div class="intent"></div>') +
        '<div class="sprite" data-sprite="' + i + '">' + ART.enemy(e.key) + '</div><div class="ename">' + esc(e.name) + '</div>' +
        '<div class="ehp"><b class="gh" data-ghost="' + mk + '" data-to="' + Math.max(0, e.hp / e.maxHp * 100) + '" style="width:' + Math.max(0, prev / e.maxHp * 100) + '%"></b><i style="width:' + Math.max(0, e.hp / e.maxHp * 100) + '%"></i></div><div class="ehpn">' + e.hp + '/' + e.maxHp + '</div><div class="estat">' + st + '</div></button>';
    }).join('');
    // tension gauge with end-of-turn preview from knots
    var knots = c.hand.filter(function (x) { return x.id === 'knot'; }).length * CONFIG.KNOT_TENSION;
    var segs = '';
    for (var k = 1; k <= CONFIG.T_MAX; k++) {
      var cls = k <= c.T ? (c.T >= 8 ? 'hot' : 'on') : (k <= c.T + knots ? 'ghost' : '');
      segs += '<i class="' + cls + '"></i>';
    }
    var ps = '';
    if (c.block) ps += '<span class="chip block">' + I.block + 'Block ' + c.block + '</span>';
    if (c.weave) ps += '<span class="chip weave">' + I.weave + 'Weave ' + c.weave + '</span>';
    if (c.temper) ps += '<span class="chip buff">+' + c.temper + ' dmg</span>';
    if (c.dull) ps += '<span class="chip bad">Dull ' + c.dull + '</span>';
    if (c.brittle) ps += '<span class="chip bad">Brittle ' + c.brittle + '</span>';
    Object.keys(c.powers).forEach(function (k2) { ps += '<span class="chip pow" title="' + esc(DATA.POWERS[k2].text(c.powers[k2])) + '">' + DATA.POWERS[k2].name + '</span>'; });
    if (!ps) ps = '<span class="small muted">No Block. Incoming: ' + Rules.incoming(S) + '</span>';
    else ps += '<span class="small muted">Incoming ' + Rules.incoming(S) + '</span>';
    // info line
    var info;
    if (ui.toast) info = '<div class="grow"><b>' + esc(ui.toast) + '</b></div>';
    else if (selCard) {
      var txt = Rules.describe(selCard, ctxNow()), kws = keywordsFor(txt + (C[selCard.id].type === 'status' ? ' Knot' : ''));
      var why = !Rules.canPlay(S, selCard) ? (C[selCard.id].unplayable ? ' It can’t be played.' : ' Not enough energy.') : (targeting ? (al.length > 1 ? ' Tap an enemy.' : ' Tap again to play.') : ' Tap again to play.');
      info = '<div class="grow"><b>' + esc(cardName(selCard)) + '</b> (' + costText(selCard) + ') ' + esc(txt) + '<span class="muted">' + why + '</span>' + (kws.length ? '<div class="small muted">' + kws.map(function (k3) { return '<b>' + k3 + ':</b> ' + KW[k3]; }).join(' ') + '</div>' : '') + '</div>';
    } else if (ui.showTgt && ui.tgt !== null) info = '<div class="grow"><b>' + esc(c.enemies[ui.tgt].name) + '</b> next: ' + esc(moveText(ui.tgt)) + '</div>';
    else info = '<div class="grow small muted">Tap a card to read it. Tap an enemy to read its next move. Tension at ' + CONFIG.T_MAX + ' snaps.</div>';
    var coach = coachLine();
    var anyPlayable = c.hand.some(function (x) { return Rules.canPlay(S, x); });
    return '<div class="scr" id="scr">' + topBar() + '<div class="arena"><div class="enemies">' + en + '</div>' +
      (coach ? '<div class="coach">' + esc(coach) + '</div>' : '') +
      '<div class="pbar"><div class="tension"><div class="tlab">TENSION ' + c.T + '<small>snaps at ' + CONFIG.T_MAX + '</small></div><div class="tg' + (c.T >= CONFIG.T_MAX - 2 ? ' near' : '') + '" id="tg">' + segs + '</div></div><div class="pstat">' + ps + '</div></div>' +
      '<div class="info" aria-live="polite">' + info + '</div>' +
      '<div class="hand" id="hand" style="--m:' + handMargin(c.hand.length) + 'px">' + c.hand.map(handCard).join('') + (c.hand.length ? '' : '<div class="muted small" style="align-self:center">No cards in hand.</div>') + '</div>' +
      '<div class="bottom"><div class="energy' + (c.energy ? '' : ' zero') + '" aria-label="Energy ' + c.energy + '">' + c.energy + '</div>' +
      '<button class="pile" data-act="pile" data-pile="draw">Draw<b>' + c.draw.length + '</b></button><button class="pile" data-act="pile" data-pile="discard">Discard<b>' + c.discard.length + '</b></button>' +
      '<button class="btn primary endbtn' + (!anyPlayable ? ' nudge' : '') + '" data-act="end">End turn</button></div></div></div>';
  }

  function renderReward() {
    var R = S.reward;
    var cards = R.cards.map(function (id, i) { return bigCard(id, 0, 'pick', 'role="button" tabindex="0" data-reward="' + id + '" aria-label="Take ' + esc(C[id].name) + '"'); }).join('');
    return '<div class="scr">' + topBar() + '<div class="sheet" style="position:relative;background:none"><h2 class="title-font center">Thread won</h2>' +
      '<p class="center">' + I.gold.replace('<svg', '<svg style="width:16px;height:16px;vertical-align:-3px"') + ' +' + R.gold + ' gold' + (R.heal ? ' · healed ' + R.heal : '') + '</p>' +
      (R.charm ? '<p class="center"><span class="chip buff">New charm: ' + esc(DATA.CHARMS[R.charm].name) + '</span><br><span class="small muted">' + esc(DATA.CHARMS[R.charm].text) + '</span></p>' : '') +
      '<p class="center muted small">Add one card to your deck, or unpick one to make it leaner.</p><div class="cardgrid">' + cards + '</div>' +
      '<div class="row" style="justify-content:center;margin-top:14px"><button class="btn" data-act="chip">Unpick a card</button><button class="btn ghost" data-act="skip">Skip</button></div></div></div>';
  }

  function renderRest() {
    var heal = Math.min(Math.round(S.maxHp * CONFIG.REST_HEAL), S.maxHp - S.hp), can = Rules.upgradeable(S).length;
    return '<div class="scr">' + topBar() + '<div class="sheet" style="position:relative;background:none">' +
      '<div class="center">' + I.R.replace('<svg', '<svg style="width:64px;height:64px"') + '</div><h2 class="title-font center">The tea stall</h2>' +
      '<div class="list"><button class="btn primary opt" data-act="rest-heal">Rest<small>Heal ' + heal + ' HP.</small></button>' +
      '<button class="btn opt" data-act="rest-mend"' + (can ? '' : ' disabled') + '>Mend<small>' + (can ? 'Upgrade one card for the rest of the run.' : 'Every card is already upgraded.') + '</small></button></div></div></div>';
  }

  function renderMarket() {
    var M = S.market;
    var cards = M.cards.map(function (it, i) {
      var can = !it.sold && S.gold >= it.price;
      return bigCard(it.id, 0, (it.sold ? 'sold' : 'pick'), can ? 'role="button" tabindex="0" data-buy="' + i + '"' : 'aria-disabled="true"', it.sold ? 'Sold' : it.price + ' gold');
    }).join('');
    var ch = M.charm ? '<button class="btn opt" data-act="buy-charm"' + (M.charmSold || S.gold < CONFIG.PRICE.relic ? ' disabled' : '') + '>Charm: ' + esc(DATA.CHARMS[M.charm].name) + ' · ' + (M.charmSold ? 'sold' : CONFIG.PRICE.relic + ' gold') + '<small>' + esc(DATA.CHARMS[M.charm].text) + '</small></button>' : '';
    return '<div class="scr">' + topBar() + '<div class="sheet" style="position:relative;background:none"><h2 class="title-font center">The bazaar</h2><p class="center muted small">You have ' + S.gold + ' gold.</p>' +
      '<div class="cardgrid">' + cards + '</div><div class="list" style="margin-top:12px">' + ch +
      '<button class="btn opt" data-act="buy-chip"' + (M.chipUsed || S.gold < M.chipPrice ? ' disabled' : '') + '>Unpick a card · ' + (M.chipUsed ? 'done' : M.chipPrice + ' gold') + '<small>Remove one card from your deck.</small></button>' +
      '<button class="btn primary" data-act="leave">Leave the bazaar</button></div></div></div>';
  }

  function renderShrine() {
    var D = DATA.SHRINES[S.shrine.key];
    var opts = D.opts.map(function (o, i) { var dis = o.need && S.gold < o.need; return '<button class="btn opt' + (i === 0 ? ' primary' : '') + '" data-shrine="' + i + '"' + (dis ? ' disabled' : '') + '>' + esc(o.label) + '<small>' + esc(o.hint) + (dis ? ' You need ' + o.need + ' gold.' : '') + '</small></button>'; }).join('');
    return '<div class="scr">' + topBar() + '<div class="sheet" style="position:relative;background:none"><div class="center">' + I.S.replace('<svg', '<svg style="width:56px;height:56px"') + '</div><h2 class="title-font center">' + esc(D.name) + '</h2><p class="center">' + esc(D.text) + '</p><div class="list">' + opts + '</div></div></div>';
  }

  function renderEnd() {
    var won = S.phase === 'victory', st = S.stats, note = S.endNote || {};
    var worst = null; S.log.forEach(function (l) { if (l.t === 'fight' && (!worst || l.hpLost > worst.hpLost)) worst = l; });
    var items = [];
    items.push(won ? 'You beat the Unraveler with ' + S.hp + ' HP left.' : 'You reached terrace ' + (S.end.row + 1) + ' of ' + CONFIG.ROWS + (S.end.row >= CONFIG.ROWS ? ' (the Mill)' : '') + '.');
    if (!won && S.end.by) items.push('Felled by ' + S.end.by.name + (S.end.by.move ? '’s ' + S.end.by.move : '') + '.');
    items.push('Fights won: ' + st.fights + (st.elites ? ' (' + st.elites + ' elite)' : '') + ' · Turns: ' + st.turns + ' · Snaps: ' + st.snaps);
    if (st.biggest) items.push('Biggest hit: ' + st.biggest + (st.biggestCard ? ' with ' + st.biggestCard : '') + '.');
    if (worst && worst.hpLost > 0) items.push('Costliest fight: ' + worst.names.join(' + ') + ' on terrace ' + (worst.row + 1) + ', −' + worst.hpLost + ' HP.');
    items.push('Deck: ' + S.deck.length + ' cards (' + countPlan('taut') + ' taut, ' + countPlan('weave') + ' weave).');
    return '<div class="scr title-scr"><h1 class="logo title-font">' + (won ? 'The thread holds' : 'Snapped') + '</h1>' +
      '<div class="big">' + S.score + '</div><div class="muted">score' + (note.newBest ? ' · new best!' : ' · best ' + meta.best) + (S.daily ? ' · daily ' + esc(S.dailyKey) : '') + '</div>' +
      (note.unlocked ? '<div class="notice" style="background:#3f3816;border-color:#b2992f">New weaver unlocked: The Dyer. Every fight starts with Weave, so Block carries between turns. Choose The Dyer when you start a new run.</div>' : '') +
      '<div class="recap"><ul>' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="menu"><button class="btn primary" data-act="new">New run</button><button class="btn gold" data-act="daily">Daily thread</button><button class="btn ghost" data-act="title">Title</button></div></div>';
  }
  function countPlan(p) { return S.deck.filter(function (x) { return C[x.id].plan === p; }).length; }

  function renderSheet() {
    var s = ui.sheet, body = '';
    if (s.kind === 'deck' || s.kind === 'pick') {
      var list = s.kind === 'pick' && s.mode === 'mend' ? S.deck.filter(function (x) { return !x.up && C[x.id].up; }) : S.deck.slice();
      if (s.pile) list = S.combat ? S.combat[s.pile].slice() : [];
      if (s.pile === 'draw') list.sort(function (a, b) { return C[a.id].name < C[b.id].name ? -1 : 1; });
      body = '<h2 class="title-font">' + esc(s.title || 'Your deck') + '</h2>' + (s.sub ? '<p class="muted small">' + esc(s.sub) + '</p>' : '') +
        '<div class="mini">' + list.map(function (c) { return miniCard(c, s.kind === 'pick' ? 'data-pickuid="' + c.uid + '"' : 'tabindex="-1"', s.mode === 'mend'); }).join('') + '</div>' +
        (s.kind === 'deck' && !s.pile ? '<p class="small muted">Charms: ' + S.charms.map(function (k) { return '<b>' + esc(DATA.CHARMS[k].name) + '</b> ' + esc(DATA.CHARMS[k].text); }).join(' · ') + '</p>' : '');
    } else if (s.kind === 'menu') {
      body = '<h2 class="title-font">Menu</h2><div class="list"><button class="btn" data-act="sound">Sound: ' + (meta.sound ? 'on' : 'off') + '</button><button class="btn" data-act="music">Music: ' + (meta.music ? 'on' : 'off') + '</button><div data-pyw="btn"></div>' +
        '<button class="btn" data-act="howto">How to play</button><button class="btn" data-act="title">Save and go to title</button>' +
        '<button class="btn" data-act="abandon">Abandon this run</button></div><p class="small muted">Seed ' + S.seed + (S.daily ? ' · daily ' + esc(S.dailyKey) : '') + '</p>';
    } else if (s.kind === 'confirm') {
      body = '<h2 class="title-font">Abandon this run?</h2><p>This ends the run and records nothing. It can’t be undone.</p><div class="list"><button class="btn primary" data-act="abandon-yes">Abandon run</button></div>';
    } else if (s.kind === 'howto') {
      body = '<h2 class="title-font">How to play</h2><div class="recap"><ul>' +
        '<li>Climb 10 terraces to the Mill and beat the Unraveler. Pick a path on the map.</li>' +
        '<li>Each turn you get 3 Energy and 5 cards. Tap a card, then tap an enemy. Tap a lifted card again to play it on the only target.</li>' +
        '<li>The bubble over each enemy shows exactly what it will do next.</li>' +
        '<li><b>Tension</b>: ' + KW.Tension + '</li><li><b>Weave</b>: ' + KW.Weave + '</li>' +
        '<li>After each fight add a card, or unpick one. Two plans can win: Taut (ride high Tension) or Weave (stack Block and slam with it).</li>' +
        '<li>Keys: 1–9 pick a card (press again to play), ← → choose target, Enter plays, E ends turn, Esc cancels.</li>' +
        '<li>The Daily thread gives everyone the same map and fights for the day.</li></ul></div>';
    } else if (s.kind === 'char') {
      body = '<h2 class="title-font">Choose your weaver</h2><div class="list">' + Object.keys(DATA.CHARS).map(function (k) {
        var ch = DATA.CHARS[k], ok = !ch.unlock || meta.unlock.dyer;
        return '<button class="btn opt' + (k === 'weaver' ? ' primary' : '') + '" data-char="' + k + '"' + (ok ? '' : ' disabled') + '>' + esc(ch.name) + ' · ' + ch.hp + ' HP<small>' + esc(ch.blurb) + ' Charm: ' + esc(DATA.CHARMS[ch.charm].name) + ' (' + esc(DATA.CHARMS[ch.charm].text) + ')' + (ok ? '' : ' Win a run to unlock.') + '</small></button>';
      }).join('') + '</div>';
    }
    return '<div class="sheet" role="dialog" aria-modal="true"><div class="row"><span class="grow"></span><button class="iconbtn" data-act="close" aria-label="Close">✕</button></div>' + body + '</div>';
  }

  function debugText() {
    if (!S) return 'no run';
    var o = { seed: S.seed, phase: S.phase, hp: S.hp, gold: S.gold, deck: S.deck.length, charms: S.charms };
    if (S.combat) {
      var c = S.combat;
      o.rng = c.rng.s; o.T = c.T; o.turn = c.turn;
      o.drawTopFirst = c.draw.slice().reverse().map(function (x) { return x.id; });
      o.enemies = c.enemies.map(function (e) { return e.key + ' hp' + e.hp + ' str' + e.str + ' next ' + (e.intent && e.intent.name) + ' hist ' + e.hist.join(''); });
    }
    o.lastEvents = ui.lastEvents.map(function (e) { return e.e + (e.n !== undefined ? ':' + e.n : '') + (e.i !== undefined ? '@' + e.i : ''); }).join(' ');
    return JSON.stringify(o, null, 1);
  }

  // ---------- event playback (juice) ----------
  function elCenter(el) { var r = el.getBoundingClientRect(), a = app.getBoundingClientRect(); return [r.left - a.left + r.width / 2, r.top - a.top + r.height / 3]; }
  function floatAt(el, text, cls, delay) {
    if (!el) return;
    function go() {
      var p = elCenter(el), d = document.createElement('div');
      d.className = 'float ' + cls; d.textContent = text; d.style.left = p[0] + 'px'; d.style.top = p[1] + 'px';
      fx.appendChild(d); setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 950);
    }
    if (delay) setTimeout(go, delay); else go();
  }
  function flyCard(f, target) {
    try {
      var holder = document.createElement('div'); holder.className = 'flycard'; holder.innerHTML = f.html;
      holder.style.left = f.x + 'px'; holder.style.top = f.y + 'px'; holder.style.width = f.w + 'px';
      var inner = holder.firstChild; if (inner && inner.classList) { inner.classList.remove('sel'); inner.removeAttribute('data-card'); inner.style.margin = '0'; }
      fx.appendChild(holder);
      var dest = (target !== null && target !== undefined && q('[data-sprite="' + target + '"]')) || q('.enemies') || q('#tg');
      var dx = 0, dy = -120;
      if (dest) { var p = elCenter(dest); dx = p[0] - f.x - f.w / 2; dy = p[1] - f.y - 30; }
      var raf = window.requestAnimationFrame || function (fn) { return setTimeout(fn, 16); };
      raf(function () { raf(function () { holder.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.45) rotate(8deg)'; holder.style.opacity = '0'; }); });
      setTimeout(function () { if (holder.parentNode) holder.parentNode.removeChild(holder); }, 360);
    } catch (e) { /* purely cosmetic */ }
  }
  function pulse(el, cls, delay) { if (!el) return; setTimeout(function () { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }, delay || 0); }
  function q(sel) { return app.querySelector(sel); }
  function playEvents(evs) {
    var t = 0, enemyPhase = false, hits = 0;
    evs.forEach(function (e) {
      switch (e.e) {
        case 'play': Snd.sfx('play', S.combat ? S.combat.T : 0); break;
        case 'hit': (function (tt) { setTimeout(function () { Snd.sfx('hit'); }, tt); })(t); floatAt(q('[data-sprite="' + e.i + '"]'), e.n > 0 ? '-' + e.n : (e.blocked ? 'blocked' : '0'), e.n >= 15 ? 'd big' : 'd', t); pulse(q('[data-sprite="' + e.i + '"]'), 'shake', t); t += 70; hits++; break;
        case 'block': if (e.who === 'p') { floatAt(q('.pstat'), '+' + e.n + ' block', 'b', t); Snd.sfx('block'); } else floatAt(q('[data-sprite="' + e.who + '"]'), '+' + e.n + ' block', 'b', t); break;
        case 'tension': if (e.n > 0) { floatAt(q('#tg'), '+' + e.n + ' tension', 't', t); Snd.sfx('tension', e.T); } break;
        case 'snap': floatAt(q('#tg'), 'SNAP!', 's', t); pulse(q('#tg'), 'shake', t); pulse(app, 'scrshake', t); (function (tt) { setTimeout(function () { Snd.sfx('snap'); }, tt); })(t); if (GK.flash.allow(0.7) > 0) app.querySelectorAll('.sprite').forEach(function (el) { pulse(el, 'flash', t); }); t += 120; break;
        case 'enemyTurn': enemyPhase = true; t += 250; break;
        case 'enemyMove': pulse(q('[data-sprite="' + e.i + '"]'), 'lunge', t); floatAt(q('[data-sprite="' + e.i + '"]'), e.name, 't', t); t += 320; break;
        case 'hurt': if (e.n > 0) { floatAt(q('.pbar'), '-' + e.n, 'd', t); pulse(app, 'scrshake', t); (function (tt) { setTimeout(function () { Snd.sfx('hurt'); }, tt); })(t); } else if (e.blocked) floatAt(q('.pbar'), 'blocked ' + e.blocked, 'b', t); t += 90; break;
        case 'heal': if (e.n) floatAt(q('.top .hp'), '+' + e.n, 'h', t); break;
        case 'kill': (function (tt) { setTimeout(function () { Snd.sfx('kill'); }, tt); })(t); pulse(q('[data-sprite="' + e.i + '"]'), 'flash', t); break;
        case 'win': Snd.sfx('win'); break;
        case 'defeat': setTimeout(function () { Snd.sfx('lose'); }, t); break;
        case 'turn': if (enemyPhase) (function (tt) { setTimeout(function () { Snd.sfx('turn'); }, tt); })(t); break;
        case 'charm': case 'gold': Snd.sfx('gold'); break;
      }
    });
    if (enemyPhase) { ui.busy = Date.now() + Math.min(t, 1600); var eb = q('[data-act="end"]'); if (eb) { eb.disabled = true; setTimeout(function () { var b = q('[data-act="end"]'); if (b) b.disabled = false; }, Math.min(t, 1600)); } }
  }

  function afterRender() {
    app.querySelectorAll('[data-pyw]').forEach(function (s) { s.replaceWith(GK.ui.prefsButton({ className: s.getAttribute('data-pyw'), panel: { text: true, tips: false } })); });
    // trailing "ghost" health bars and enemy fall-away, then remember what was shown
    if (S && S.combat) S.combat.enemies.forEach(function (e, i) { ui.mem[S.combat.node + ':' + i] = e.hp; });
    if (S) ui.mem.p = S.hp;
    var gh = app.querySelectorAll('.gh');
    if (gh.length) setTimeout(function () { gh.forEach(function (g) { g.style.width = g.getAttribute('data-to') + '%'; }); }, 260);
    var dy = app.querySelectorAll('.enemy.dying');
    if (dy.length) setTimeout(function () { dy.forEach(function (d) { d.classList.add('dead'); }); }, 420);
    if (S && S.phase === 'map' && ui.view !== 'title') {
      var mw = document.getElementById('mapwrap');
      if (mw) { var row = S.pos ? S.map.nodes[S.pos].r : 0; var H = (CONFIG.ROWS + 1) * 64 + 60; mw.scrollTop = Math.max(0, H - 40 - row * 64 - mw.clientHeight * 0.75); }
    }
  }

  // ---------- input ----------
  function tutDone(k) { if (!meta.tut[k]) { meta.tut[k] = true; saveMeta(); } }
  function playSel(target) {
    var c = S.combat, card = c.hand.filter(function (x) { return x.uid === ui.sel; })[0];
    if (!card) return;
    if (!Rules.canPlay(S, card)) { ui.toast = C[card.id].unplayable ? 'Knots can’t be played.' : 'Not enough energy for ' + C[card.id].name + '.'; Snd.sfx('deny'); render(); return; }
    var cel = q('[data-card="' + card.uid + '"]'), fly = null;
    if (cel && cel.getBoundingClientRect) { var cr = cel.getBoundingClientRect(), ar = app.getBoundingClientRect(); fly = { html: cel.outerHTML, x: cr.left - ar.left, y: cr.top - ar.top, w: cr.width }; }
    // update the coach flags first so this very render shows the next tip
    var hadPlay = meta.tut.play, hadIntent = meta.tut.intent, hadT = c.T > 0;
    if (hadPlay) tutDone('intent'); tutDone('play'); if (hadT && hadIntent) tutDone('tension');
    var ok = dispatch({ t: 'play', uid: card.uid, target: target });
    if (ok && fly) flyCard(fly, target);
  }
  function tapCard(uid) {
    var c = S.combat; if (!c) return;
    var card = c.hand.filter(function (x) { return x.uid === uid; })[0]; if (!card) return;
    ui.toast = null; ui.showTgt = false;
    if (ui.sel === uid) {
      var al = c.enemies.filter(function (e) { return e.hp > 0; });
      if (!Rules.needsTarget(card) || al.length === 1) { playSel(ui.tgt); return; }
      ui.toast = 'Tap an enemy to play ' + C[card.id].name + '.';
    } else { ui.sel = uid; Snd.sfx('tap'); }
    if (card.id === 'knot') tutDone('knot');
    render();
  }
  function tapEnemy(i) {
    var c = S.combat; if (!c || !c.enemies[i] || c.enemies[i].hp <= 0) return;
    ui.tgt = i;
    var card = ui.sel !== null ? c.hand.filter(function (x) { return x.uid === ui.sel; })[0] : null;
    if (card && Rules.needsTarget(card)) { playSel(i); return; }
    if (card && !Rules.needsTarget(card)) { ui.toast = C[card.id].name + ' needs no target. Tap the card again to play it.'; render(); return; }
    ui.showTgt = true; render();
  }
  function endTurn() { if (Date.now() < ui.busy) return; ui.sel = null; tutDone('play'); tutDone('intent'); dispatch({ t: 'end' }); }

  function onAct(act, el) {
    Snd.init();
    switch (act) {
      case 'continue': ui.view = 'game'; ui.notice = null; render(); break;
      case 'new': if (meta.unlock.dyer) { ui.sheet = { kind: 'char' }; render(); } else startNewRun({ char: 'weaver' }); break;
      case 'daily': var d = Rules.dailySeed(); startNewRun({ seed: d.seed, daily: true, dailyKey: d.key, char: 'weaver' }); break;
      case 'howto': ui.sheet = { kind: 'howto' }; render(); break;
      case 'sound': meta.sound = !meta.sound; saveMeta(); if (meta.sound) Snd.init(); render(); break;
      case 'music': meta.music = !meta.music; saveMeta(); render(); break;
      case 'title': ui.sheet = null; ui.view = 'title'; render(); break;
      case 'menu': ui.sheet = { kind: 'menu' }; render(); break;
      case 'close': ui.sheet = null; render(); break;
      case 'deck': ui.sheet = { kind: 'deck', title: 'Your deck (' + S.deck.length + ')' }; render(); break;
      case 'pile': var p = el.getAttribute('data-pile'); ui.sheet = { kind: 'deck', pile: p, title: p === 'draw' ? 'Draw pile (shown sorted)' : 'Discard pile' }; render(); break;
      case 'abandon': ui.sheet = { kind: 'confirm' }; render(); break;
      case 'abandon-yes': Storage.del(KEY_RUN); S = null; ui.sheet = null; ui.view = 'title'; render(); break;
      case 'end': endTurn(); break;
      case 'skip': dispatch({ t: 'reward', kind: 'skip' }); break;
      case 'chip': ui.sheet = { kind: 'pick', mode: 'chip', title: 'Unpick a card', sub: 'It leaves your deck for the rest of the run.', then: 'reward-chip' }; render(); break;
      case 'rest-heal': dispatch({ t: 'rest', kind: 'heal' }); break;
      case 'rest-mend': ui.sheet = { kind: 'pick', mode: 'mend', title: 'Mend a card', sub: 'Shown as it will be after mending.', then: 'rest-mend' }; render(); break;
      case 'buy-charm': dispatch({ t: 'buy', kind: 'charm' }); break;
      case 'buy-chip': ui.sheet = { kind: 'pick', mode: 'chip', title: 'Unpick a card', sub: 'Costs ' + S.market.chipPrice + ' gold.', then: 'buy-chip' }; render(); break;
      case 'leave': dispatch({ t: 'leave' }); break;
      case 'dbg': ui.dbg = !ui.dbg; render(); break;
    }
  }
  function onPick(uid) {
    var s = ui.sheet; ui.sheet = null;
    if (s.then === 'reward-chip') dispatch({ t: 'reward', kind: 'chip', uid: uid });
    else if (s.then === 'rest-mend') dispatch({ t: 'rest', kind: 'mend', uid: uid });
    else if (s.then === 'buy-chip') dispatch({ t: 'buy', kind: 'chip', uid: uid });
    else if (s.then === 'shrine') dispatch({ t: 'shrine', opt: s.opt, uid: uid });
    else render();
  }

  // pointer handling: tap anywhere via click; cards also support drag-to-target
  var drag = null;
  app.addEventListener('pointerdown', function (ev) {
    Snd.init();
    var cardEl = ev.target.closest && ev.target.closest('.card');
    if (!cardEl || !S || S.phase !== 'combat' || ui.sheet) return;
    drag = { uid: +cardEl.getAttribute('data-card'), x: ev.clientX, y: ev.clientY, el: cardEl, on: false, id: ev.pointerId };
  });
  app.addEventListener('pointermove', function (ev) {
    if (!drag || ev.pointerId !== drag.id) return;
    var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    if (!drag.on && dy < -24 && Math.abs(dy) > Math.abs(dx)) { drag.on = true; drag.el.classList.add('drag'); if (ui.sel !== drag.uid) { ui.sel = drag.uid; } }
    if (drag.on) { drag.el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.08)'; ev.preventDefault(); }
  }, { passive: false });
  function endDrag(ev) {
    if (!drag) return;
    var d = drag; drag = null;
    if (!d.on) return; // plain tap: the click handler does the work
    d.suppressClick = true; suppressClickUntil = Date.now() + 400;
    var under = document.elementFromPoint ? document.elementFromPoint(ev.clientX, ev.clientY) : null;
    var enemyEl = under && under.closest ? under.closest('.enemy') : null;
    var handEl = document.getElementById('hand'), handTop = handEl ? handEl.getBoundingClientRect().top : 1e9;
    var card = S.combat && S.combat.hand.filter(function (x) { return x.uid === d.uid; })[0];
    ui.sel = d.uid;
    if (card && enemyEl && Rules.needsTarget(card)) { playSel(+enemyEl.getAttribute('data-enemy')); return; }
    if (card && !Rules.needsTarget(card) && ev.clientY < handTop - 10) { playSel(null); return; }
    if (card && Rules.needsTarget(card) && ev.clientY < handTop - 10 && S.combat.enemies.filter(function (e) { return e.hp > 0; }).length === 1) { playSel(ui.tgt); return; }
    render();
  }
  var suppressClickUntil = 0;
  app.addEventListener('pointerup', endDrag);
  app.addEventListener('pointercancel', function () { if (drag && drag.on) { drag = null; render(); } drag = null; });

  app.addEventListener('click', function (ev) {
    if (Date.now() < suppressClickUntil) return;
    Snd.init();
    var t = ev.target;
    var a = t.closest('[data-act]'); if (a && !a.disabled) { onAct(a.getAttribute('data-act'), a); return; }
    var n = t.closest('[data-node]'); if (n) { dispatch({ t: 'pick', id: n.getAttribute('data-node') }); return; }
    var cd = t.closest('[data-card]'); if (cd) { tapCard(+cd.getAttribute('data-card')); return; }
    var en = t.closest('[data-enemy]'); if (en) { tapEnemy(+en.getAttribute('data-enemy')); return; }
    var rw = t.closest('[data-reward]'); if (rw) { dispatch({ t: 'reward', kind: 'card', id: rw.getAttribute('data-reward') }); return; }
    var pk = t.closest('[data-pickuid]'); if (pk) { onPick(+pk.getAttribute('data-pickuid')); return; }
    var by = t.closest('[data-buy]'); if (by) { dispatch({ t: 'buy', kind: 'card', slot: +by.getAttribute('data-buy') }); return; }
    var sh = t.closest('[data-shrine]'); if (sh && !sh.disabled) {
      var oi = +sh.getAttribute('data-shrine'), o = DATA.SHRINES[S.shrine.key].opts[oi];
      var need = o.fx.filter(function (f) { return f[0] === 'mend' || f[0] === 'chip'; })[0];
      if (need) { ui.sheet = { kind: 'pick', mode: need[0], title: need[0] === 'mend' ? 'Rework a card' : 'Unpick a card', then: 'shrine', opt: oi }; render(); }
      else dispatch({ t: 'shrine', opt: oi });
      return;
    }
    var ch = t.closest('[data-char]'); if (ch && !ch.disabled) { ui.sheet = null; startNewRun({ char: ch.getAttribute('data-char') }); return; }
    if (S && S.phase === 'combat' && ui.sel !== null && !t.closest('.hand') && !t.closest('.info')) { ui.sel = null; ui.toast = null; render(); }
  });

  document.addEventListener('keydown', function (ev) {
    if (document.querySelector('.gk-prefs')) return;
    Snd.init();
    if (ev.target && /INPUT|TEXTAREA/.test(ev.target.tagName)) return;
    if (ui.sheet && ev.key === 'Escape') { ui.sheet = null; render(); return; }
    if (!S || ui.view === 'title' || ui.sheet) return;
    if (S.phase === 'combat') {
      var c = S.combat, k = ev.key;
      if (/^[1-9]$/.test(k)) { var card = c.hand[+k - 1]; if (card) tapCard(card.uid); ev.preventDefault(); return; }
      if (k === 'ArrowLeft' || k === 'ArrowRight') {
        var al = c.enemies.map(function (e, i) { return e.hp > 0 ? i : -1; }).filter(function (i) { return i >= 0; });
        if (al.length) { var pos = al.indexOf(ui.tgt); pos = (pos + (k === 'ArrowRight' ? 1 : al.length - 1)) % al.length; ui.tgt = al[pos]; ui.showTgt = ui.sel === null; render(); }
        ev.preventDefault(); return;
      }
      if ((k === 'Enter' || k === ' ') && ui.sel !== null) { playSel(ui.tgt); ev.preventDefault(); return; }
      if (k === 'e' || k === 'E') { endTurn(); ev.preventDefault(); return; }
      if (k === 'Escape') { ui.sel = null; ui.toast = null; render(); return; }
    } else if (S.phase === 'reward') {
      if (/^[1-3]$/.test(ev.key) && S.reward.cards[+ev.key - 1]) dispatch({ t: 'reward', kind: 'card', id: S.reward.cards[+ev.key - 1] });
      if (ev.key === 's' || ev.key === 'S') dispatch({ t: 'reward', kind: 'skip' });
    }
  });
  document.addEventListener('keydown', function (ev) {
    if (document.querySelector('.gk-prefs')) return;
    if (ev.key === 'Enter' && ev.target && ev.target.getAttribute && ev.target.getAttribute('role') === 'button') { ev.target.click(); }
  });
  window.addEventListener('resize', function () { if (S && S.phase === 'map' && ui.view !== 'title') render(); });

  // test + debug hook (read access and the same command path the buttons use)
  window.__snapthread = { get state() { return S; }, get meta() { return meta; }, ui: ui, dispatch: dispatch, startNewRun: startNewRun, render: render, onAct: onAct, tapCard: tapCard, tapEnemy: tapEnemy, ST: ST };
  GK.studio();
  GK.coach.create('snapthread-first', [{ target: function () { return app.querySelector('#hand .card'); }, done: function () { return !!meta.tut.play; } }],
    { when: function () { return !!S && S.phase === 'combat' && ui.view !== 'title' && !ui.sheet; } });
  GK.wired('motion', 'shake, screen shake, lunge and pulses off under Calm and Still; Still also stills the rest, with damage numbers kept as a fade');
  GK.wired('flash', 'SNAP blink on the enemies');
  GK.wired('text', 'page CSS floor and scale; hand-card text floored at 12px but not scaled (fixed card tiles; the info bar shows it scaled)');
  GK.wired('combo', 'card-play and tension notes climb GK.audio.ladder with Tension');
  render();
})();
