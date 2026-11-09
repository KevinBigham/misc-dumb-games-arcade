// Dual Meet rules: pure logic, no DOM. Runs in the browser (global GK from GameKit) and in node (tests set global.GK).
// Everything here is deterministic for a given seed string.
(function (root) {
  'use strict';
  var GK = root.GK;

  /* ---------- events, in high school dual meet order ---------- */
  // ab = which ability an individual swim uses. legs = stroke per relay leg. brk = a break (diving) after this event.
  var EV = [
    { id: 'mr', name: '200 Medley Relay', short: 'Medley Relay', relay: true, legs: ['back', 'breast', 'fly', 'free'], leg: 50 },
    { id: '200fr', name: '200 Free', short: '200 Free', ab: 'f200', dist: 200 },
    { id: '200im', name: '200 IM', short: '200 IM', ab: 'im200', dist: 200 },
    { id: '50fr', name: '50 Free', short: '50 Free', ab: 'f50', dist: 50, brk: true },
    { id: '100fl', name: '100 Fly', short: '100 Fly', ab: 'fl100', dist: 100 },
    { id: '100fr', name: '100 Free', short: '100 Free', ab: 'f100', dist: 100 },
    { id: '500fr', name: '500 Free', short: '500 Free', ab: 'f500', dist: 500 },
    { id: '200frr', name: '200 Free Relay', short: '200 Free Relay', relay: true, legs: ['free', 'free', 'free', 'free'], leg: 50 },
    { id: '100bk', name: '100 Back', short: '100 Back', ab: 'bk100', dist: 100 },
    { id: '100br', name: '100 Breast', short: '100 Breast', ab: 'br100', dist: 100 },
    { id: '400frr', name: '400 Free Relay', short: '400 Free Relay', relay: true, legs: ['free', 'free', 'free', 'free'], leg: 100 }
  ];
  var LEGNAME = { back: 'Back', breast: 'Breast', fly: 'Fly', free: 'Free' };
  var IND_PTS = [6, 4, 3, 2, 1], REL_PTS = [8, 4, 2];
  var LANES = 3, MAX_IND = 2, MAX_TOT = 4, ROSTER = 12;
  var LOAD = { 50: 0.5, 100: 1, 200: 1.6, 500: 3.2 };
  var SWAP_P = 0.35, T0 = 2.2, TIRE = 0.004, B2B = 0.02, REVEAL_IND = 3, AWAY_EDGE = 0;

  // flat slot layout: 8 individual events x 3 lanes, then 3 relays x 4 legs = 36 slots
  var SLOTS = [];
  EV.forEach(function (e, ei) {
    if (e.relay) for (var k = 0; k < 4; k++) SLOTS.push({ ev: ei, k: k, leg: e.legs[k], relay: true });
    else for (var j = 0; j < LANES; j++) SLOTS.push({ ev: ei, k: j, relay: false });
  });
  var NS = SLOTS.length;
  var EV_SLOTS = EV.map(function (e, ei) { var a = []; SLOTS.forEach(function (s, i) { if (s.ev === ei) a.push(i); }); return a; });
  var TOTAL_PTS = EV.reduce(function (t, e) { return t + (e.relay ? REL_PTS[0] + REL_PTS[1] : 16); }, 0); // 164

  /* ---------- time formatting ---------- */
  function fmt(t) {
    if (t == null || !isFinite(t)) return '--';
    var c = Math.round(t * 100), m = Math.floor(c / 6000), s = (c - m * 6000) / 100;
    var ss = s.toFixed(2); if (m > 0 && s < 10) ss = '0' + ss;
    return m > 0 ? m + ':' + ss : ss;
  }
  function r2(x) { return Math.round(x * 100) / 100; }

  /* ---------- names (invented) ---------- */
  var FIRST = {
    girls: ['Ada', 'Bree', 'Cora', 'Dani', 'Elle', 'Faye', 'Gwen', 'Hana', 'Ivy', 'Jo', 'Kira', 'Lena', 'Mira', 'Nell', 'Opal', 'Pia', 'Quinn', 'Rae', 'Sage', 'Tess', 'Uma', 'Vera', 'Wren', 'Xia', 'Yara', 'Zoe', 'Ines', 'Maeve', 'Noor', 'Lark', 'Juno', 'Esme', 'Callie', 'Della', 'Rhea', 'Tova', 'Mina', 'Kaia', 'Liv', 'Sela'],
    boys: ['Abe', 'Beck', 'Cal', 'Dax', 'Eli', 'Finn', 'Gus', 'Hal', 'Ike', 'Jude', 'Kit', 'Lev', 'Milo', 'Nico', 'Otis', 'Pax', 'Rafe', 'Seth', 'Tate', 'Ugo', 'Vic', 'Wes', 'Xan', 'Yuri', 'Zeke', 'Ansel', 'Bo', 'Cy', 'Dov', 'Emil', 'Ford', 'Gray', 'Hugo', 'Ivo', 'Jett', 'Kai', 'Lars', 'Moss', 'Nash', 'Odin']
  };
  var LAST = ['Abernathy', 'Birchall', 'Calloway', 'Dunmore', 'Eskew', 'Fairlie', 'Garrow', 'Holloway', 'Iverly', 'Jessup', 'Kettering', 'Lorne', 'Marchetti', 'Nyland', 'Okonkwo', 'Pellam', 'Quarles', 'Roswell', 'Sandoval', 'Tremaine', 'Underhill', 'Vasquez', 'Whitlock', 'Yarrow', 'Zielin', 'Ambrose', 'Brannock', 'Corliss', 'Delacroix', 'Ellery', 'Fenwick', 'Gaskill', 'Harrow', 'Ingles', 'Jaramillo', 'Kowal', 'Lindqvist', 'Mabry', 'Nakashima', 'Ortolan', 'Pruett', 'Rasmus', 'Sorrell', 'Thibault', 'Varga', 'Wexler', 'Achebe', 'Brightwater', 'Cuthbert', 'Dorsey', 'Faraday', 'Greaves', 'Hartigan', 'Lomax', 'Mercado', 'Nightingale', 'Petrakis', 'Rook', 'Stavros', 'Tolliver'];
  var SCHOOLS = ['Larkspur Ridge', 'Thistle Creek', 'Quarry Hill', 'Bramblewood', 'Kestrel Point', 'Ashgrove', 'Millrace', 'Copper Hollow', 'Wrenfield', 'Osprey Bay', 'Fennel Park', 'Granite Bend', 'Marrowbrook', 'Silverleaf', 'Tamarack'];
  var MASCOTS = ['Otters', 'Herons', 'Marlins', 'Barracudas', 'Gulls', 'Pike', 'Seals', 'Kingfishers', 'Orcas', 'Stingrays', 'Terns', 'Narwhals'];
  var HOME = { school: 'Juniper Lake', mascot: 'Comets' };

  var PROFILES = ['sprint', 'distance', 'back', 'breast', 'fly', 'im', 'free'];
  var PROFILE_LABEL = { sprint: 'Sprinter', distance: 'Distance', back: 'Backstroker', breast: 'Breaststroker', fly: 'Flyer', im: 'IMer', free: 'Freestyler' };

  /* ---------- roster generation ---------- */
  function makeSwimmer(R, L, prof, g) {
    var f50 = (21.7 + L * 5.2) * g;
    var d = prof === 'distance' ? R.float(0.55, 1) : prof === 'sprint' ? R.float(-1, -0.55) : R.float(-0.4, 0.4);
    var f100 = f50 * 2.2 * (1 - 0.01 * d);
    var f200 = f100 * 2.19 * (1 - 0.022 * d);
    var f500 = f200 * 2.75 * (1 - 0.03 * d);
    var sb = R.float(-0.01, 0.05), sr = R.float(-0.015, 0.06), sf = R.float(-0.01, 0.05);
    if (prof === 'back') sb = R.float(-0.055, -0.03);
    if (prof === 'breast') sr = R.float(-0.065, -0.035);
    if (prof === 'fly') sf = R.float(-0.05, -0.025);
    if (prof === 'im') { sb = R.float(-0.035, 0); sr = R.float(-0.035, 0.005); sf = R.float(-0.035, 0); }
    var bk100 = f100 * 1.12 * (1 + sb), br100 = f100 * 1.27 * (1 + sr), fl100 = f100 * 1.09 * (1 + sf);
    var im200 = f200 * 1.115 * (1 + (sb + sr + sf) / 3 * 0.85 + (prof === 'im' ? -0.012 : 0));
    var a = { f50: r2(f50), f100: r2(f100), f200: r2(f200), f500: r2(f500), bk100: r2(bk100), br100: r2(br100), fl100: r2(fl100), im200: r2(im200) };
    return a;
  }
  function makeTeam(R, gender, strength, school, mascot, used) {
    var g = gender === 'girls' ? 1.105 : 1;
    // a roster always has the strokes a medley relay needs, plus some spread
    var profs = ['back', 'back', 'breast', 'breast', 'fly', 'fly', 'sprint', 'sprint', 'distance', 'im', 'free', R.pick(PROFILES)];
    R.shuffle(profs);
    var levels = [];
    for (var i = 0; i < ROSTER; i++) levels.push(Math.max(0, Math.min(1, (i / (ROSTER - 1)) * 0.92 + R.float(-0.07, 0.07) - strength)));
    R.shuffle(levels);
    var sw = [];
    for (i = 0; i < ROSTER; i++) {
      var nm, sh, tries = 0;
      do {
        var fn = R.pick(FIRST[gender]), ln = R.pick(LAST);
        nm = fn + ' ' + ln; sh = fn.charAt(0) + '. ' + ln; tries++;
      } while ((used[nm] || used['s:' + school + sh] || used['l:' + ln]) && tries < 60);
      used[nm] = 1; used['s:' + school + sh] = 1; used['l:' + ln] = 1;
      sw.push({ id: i, name: nm, short: sh, last: ln, grade: R.int(9, 12), prof: profs[i], label: PROFILE_LABEL[profs[i]], ab: makeSwimmer(R, levels[i], profs[i], g) });
    }
    return { school: school, mascot: mascot, name: school + ' ' + mascot, swimmers: sw };
  }

  /* ---------- swim times ---------- */
  // base time for a swimmer in a slot (before fatigue and noise). Relay legs 2-4 get a relay start.
  function legBase(ab, leg, dist, k) {
    var t;
    if (leg === 'free') t = dist === 100 ? ab.f100 : ab.f50;
    else if (leg === 'back') t = ab.bk100 * 0.476;
    else if (leg === 'breast') t = ab.br100 * 0.468;
    else t = ab.fl100 * 0.462;
    if (k > 0) t -= dist === 100 ? 0.65 : 0.6;
    return t;
  }
  function slotBase(team, si, p) {
    var s = SLOTS[si], e = EV[s.ev], ab = team.swimmers[p].ab;
    return s.relay ? legBase(ab, s.leg, e.leg, s.k) : ab[e.ab];
  }
  function slotLoad(si) { var s = SLOTS[si], e = EV[s.ev]; return s.relay ? LOAD[e.leg] : LOAD[e.dist]; }

  // per-day race-day swing for every swimmer and event: small (about 0.3%), never big enough to flip a clear seed gap
  function makeNoise(seed, side) {
    var R = GK.rng.make(seed + '/noise/' + side), n = [];
    for (var p = 0; p < ROSTER; p++) { var row = []; for (var e = 0; e < EV.length; e++) { var u = (R.next() + R.next() + R.next() - 1.5) * 0.0062; row.push(Math.max(-0.008, Math.min(0.008, u))); } n.push(row); }
    return n;
  }

  // fatigue multiplier for each filled slot, from that swimmer's earlier swims in the meet
  // returns {mult: [NS], b2b: [NS], load: [NS]}
  function fatigue(lu) {
    var mult = new Array(NS), b2b = new Array(NS), ld = new Array(NS);
    var acc = new Float64Array(ROSTER), lastEv = new Int32Array(ROSTER).fill(-9);
    for (var e = 0; e < EV.length; e++) {
      var sl = EV_SLOTS[e];
      for (var j = 0; j < sl.length; j++) {
        var si = sl[j], p = lu[si];
        if (p < 0) { mult[si] = 1; b2b[si] = false; ld[si] = 0; continue; }
        var bb = lastEv[p] === e - 1 && !EV[e - 1].brk;
        mult[si] = 1 + TIRE * acc[p] + (bb ? B2B : 0); b2b[si] = bb; ld[si] = acc[p];
      }
      for (j = 0; j < sl.length; j++) { var q = lu[sl[j]]; if (q >= 0) { acc[q] += slotLoad(sl[j]); lastEv[q] = e; } }
    }
    return { mult: mult, b2b: b2b, load: ld };
  }

  // swim times for a whole lineup. noise optional (projections use none).
  function times(team, lu, noise) {
    var f = fatigue(lu), t = new Array(NS);
    for (var si = 0; si < NS; si++) {
      var p = lu[si]; if (p < 0) { t[si] = null; continue; }
      var x = slotBase(team, si, p) * f.mult[si];
      if (noise) x *= 1 + noise[p][SLOTS[si].ev];
      t[si] = r2(x);
    }
    return { t: t, mult: f.mult, b2b: f.b2b };
  }
  function relayTime(tt, ei) { var sl = EV_SLOTS[ei], s = 0; for (var j = 0; j < sl.length; j++) { if (tt[sl[j]] == null) return null; s += tt[sl[j]]; } return r2(s); }

  /* ---------- validity ---------- */
  function counts(lu) {
    var ind = new Int32Array(ROSTER), tot = new Int32Array(ROSTER);
    for (var e = 0; e < EV.length; e++) {
      var seen = {}, sl = EV_SLOTS[e];
      for (var j = 0; j < sl.length; j++) { var p = lu[sl[j]]; if (p < 0 || seen[p]) continue; seen[p] = 1; tot[p]++; if (!EV[e].relay) ind[p]++; }
    }
    return { ind: ind, tot: tot };
  }
  function problems(lu) {
    var out = [];
    if (!lu || lu.length !== NS) return ['bad lineup'];
    for (var e = 0; e < EV.length; e++) { var seen = {}; EV_SLOTS[e].forEach(function (si) { var p = lu[si]; if (p < -1 || p >= ROSTER || p !== (p | 0)) out.push('bad swimmer in ' + EV[e].id); else if (p >= 0) { if (seen[p]) out.push('swimmer ' + p + ' twice in ' + EV[e].id); seen[p] = 1; } }); }
    var c = counts(lu);
    for (var p = 0; p < ROSTER; p++) { if (c.ind[p] > MAX_IND) out.push('swimmer ' + p + ' has ' + c.ind[p] + ' individual events'); if (c.tot[p] > MAX_TOT) out.push('swimmer ' + p + ' has ' + c.tot[p] + ' events'); }
    return out;
  }
  function valid(lu) { return problems(lu).length === 0; }

  /* ---------- scoring ---------- */
  function placePoints(entries, table) {
    // entries: [{side, t, ...}] -> sets place and pts with ties splitting points
    entries.sort(function (a, b) { return a.t - b.t; });
    var i = 0;
    while (i < entries.length) {
      var j = i; while (j + 1 < entries.length && entries[j + 1].t === entries[i].t) j++;
      var sum = 0; for (var k = i; k <= j; k++) sum += table[k] || 0;
      for (k = i; k <= j; k++) { entries[k].place = i + 1; entries[k].pts = sum / (j - i + 1); entries[k].tie = j > i; }
      i = j + 1;
    }
    return entries;
  }
  // score a meet. A = home team, B = visitor. ta/tb are times() results.
  function scoreMeet(luA, ta, luB, tb, detail) {
    var us = 0, them = 0, evs = detail ? [] : null;
    for (var e = 0; e < EV.length; e++) {
      var en = [], ev = EV[e], sl = EV_SLOTS[e], j, x;
      if (ev.relay) {
        x = relayTime(ta.t, e); if (x != null) en.push({ side: 0, t: x, legs: sl.map(function (si) { return { p: luA[si], t: ta.t[si] }; }) });
        x = relayTime(tb.t, e); if (x != null) en.push({ side: 1, t: x, legs: sl.map(function (si) { return { p: luB[si], t: tb.t[si] }; }) });
        placePoints(en, REL_PTS);
      } else {
        for (j = 0; j < sl.length; j++) {
          if (luA[sl[j]] >= 0) en.push({ side: 0, t: ta.t[sl[j]], p: luA[sl[j]], b2b: ta.b2b[sl[j]], mult: ta.mult[sl[j]] });
          if (luB[sl[j]] >= 0) en.push({ side: 1, t: tb.t[sl[j]], p: luB[sl[j]], b2b: tb.b2b[sl[j]], mult: tb.mult[sl[j]] });
        }
        placePoints(en, IND_PTS);
      }
      var eu = 0, et = 0; for (j = 0; j < en.length; j++) { if (en[j].side === 0) eu += en[j].pts; else et += en[j].pts; }
      us += eu; them += et;
      if (detail) evs.push({ ev: e, entries: en, us: eu, them: et, runUs: us, runThem: them });
    }
    return { us: us, them: them, margin: us - them, events: evs };
  }

  /* ---------- the assistant's lineup: a sensible but naive default ---------- */
  // Puts each swimmer in their relatively strongest events, ignores back-to-back and the other team.
  function defaultLineup(team) {
    var lu = new Array(NS).fill(-1), sw = team.swimmers;
    var ind = new Int32Array(ROSTER), tot = new Int32Array(ROSTER), pairs = [];
    EV.forEach(function (e, ei) {
      if (e.relay) return;
      var ts = sw.map(function (s) { return s.ab[e.ab]; }).slice().sort(function (a, b) { return a - b; });
      var med = (ts[5] + ts[6]) / 2;
      sw.forEach(function (s, p) { pairs.push({ ei: ei, p: p, v: (med - s.ab[e.ab]) / med }); });
    });
    pairs.sort(function (a, b) { return b.v - a.v || a.ei - b.ei || a.p - b.p; });
    var filled = {};
    pairs.forEach(function (q) {
      if (ind[q.p] >= MAX_IND) return; var sl = EV_SLOTS[q.ei], n = filled[q.ei] | 0; if (n >= LANES) return;
      lu[sl[n]] = q.p; filled[q.ei] = n + 1; ind[q.p]++; tot[q.p]++;
    });
    // relays: best available four, in meet order
    EV.forEach(function (e, ei) {
      if (!e.relay) return;
      var sl = EV_SLOTS[ei], cand = [];
      for (var p = 0; p < ROSTER; p++) if (tot[p] < MAX_TOT) cand.push(p);
      var best = null, bt = 1e9;
      if (e.legs[0] === 'back') {
        for (var a = 0; a < cand.length; a++) for (var b = 0; b < cand.length; b++) { if (b === a) continue; for (var c = 0; c < cand.length; c++) { if (c === a || c === b) continue; for (var d = 0; d < cand.length; d++) { if (d === a || d === b || d === c) continue;
          var t = legBase(sw[cand[a]].ab, 'back', 50, 0) + legBase(sw[cand[b]].ab, 'breast', 50, 1) + legBase(sw[cand[c]].ab, 'fly', 50, 2) + legBase(sw[cand[d]].ab, 'free', 50, 3);
          if (t < bt) { bt = t; best = [cand[a], cand[b], cand[c], cand[d]]; } } } }
      } else {
        best = cand.slice().sort(function (x, y) { return legBase(sw[x].ab, 'free', e.leg, 1) - legBase(sw[y].ab, 'free', e.leg, 1) || x - y; }).slice(0, 4);
        best.sort(function (x, y) { return legBase(sw[x].ab, 'free', e.leg, 1) - legBase(sw[y].ab, 'free', e.leg, 1) || x - y; });
        best = [best[1], best[2], best[3], best[0]].filter(function (v) { return v !== undefined; }); // fastest anchors
      }
      if (best && best.length === 4) for (var k = 0; k < 4; k++) { lu[sl[k]] = best[k]; tot[best[k]]++; }
    });
    return lu;
  }

  /* ---------- local search: best lineup for one side against a fixed other side ---------- */
  // A fast scorer for one side against fixed opponent times (no allocation per call). Same rules as scoreMeet.
  function fastScorer(team, noise, oppLu, oppTimes) {
    var base = new Float64Array(NS * ROSTER), nz = new Float64Array(NS * ROSTER), ld = new Float64Array(NS);
    for (var si = 0; si < NS; si++) { ld[si] = slotLoad(si); for (var p = 0; p < ROSTER; p++) { base[si * ROSTER + p] = slotBase(team, si, p); nz[si * ROSTER + p] = noise ? 1 + noise[p][SLOTS[si].ev] : 1; } }
    var opp = EV.map(function (e, ei) {
      if (e.relay) return relayTime(oppTimes.t, ei);
      var a = []; EV_SLOTS[ei].forEach(function (k) { if (oppLu[k] >= 0) a.push(oppTimes.t[k]); }); return a;
    });
    var acc = new Float64Array(ROSTER), last = new Int32Array(ROSTER), tt = new Float64Array(NS), mine = [0, 0, 0];
    function pts(x, arrA, nA, arrB, table) { // points for time x among arrA (first nA) + arrB
      var faster = 0, eq = 0, i;
      for (i = 0; i < nA; i++) { if (arrA[i] < x) faster++; else if (arrA[i] === x) eq++; }
      for (i = 0; i < arrB.length; i++) { if (arrB[i] < x) faster++; else if (arrB[i] === x) eq++; }
      var s = 0; for (i = faster; i < faster + eq; i++) s += table[i] || 0; return s / eq;
    }
    return function (lu) {
      acc.fill(0); last.fill(-9);
      var us = 0, them = 0, soft = 0;
      for (var e = 0; e < EV.length; e++) {
        var sl = EV_SLOTS[e], ev = EV[e], j, q;
        for (j = 0; j < sl.length; j++) {
          var k = sl[j]; q = lu[k];
          if (q < 0) { tt[k] = -1; soft -= 0.05; continue; }
          var m = 1 + TIRE * acc[q] + ((last[q] === e - 1 && !EV[e - 1].brk) ? B2B : 0);
          tt[k] = Math.round(base[k * ROSTER + q] * m * nz[k * ROSTER + q] * 100) / 100; soft -= m - 1;
        }
        for (j = 0; j < sl.length; j++) { q = lu[sl[j]]; if (q >= 0) { acc[q] += ld[sl[j]]; last[q] = e; } }
        if (ev.relay) {
          var rt = 0, ok = true; for (j = 0; j < 4; j++) { if (tt[sl[j]] < 0) { ok = false; break; } rt += tt[sl[j]]; }
          rt = Math.round(rt * 100) / 100; var ot = opp[e];
          if (ok && ot != null) { if (rt < ot) { us += 8; them += 4; } else if (rt > ot) { us += 4; them += 8; } else { us += 6; them += 6; } }
          else if (ok) us += 8; else if (ot != null) them += 8;
        } else {
          var n = 0; for (j = 0; j < sl.length; j++) if (tt[sl[j]] >= 0) mine[n++] = tt[sl[j]];
          var oa = opp[e];
          for (j = 0; j < n; j++) us += pts(mine[j], mine, n, oa, IND_PTS);
          for (j = 0; j < oa.length; j++) them += pts(oa[j], mine, n, oa, IND_PTS);
        }
      }
      return us - them + soft * 0.02;
    };
  }
  // simulated annealing with swaps and restarts, deterministic RNG; then a greedy polish
  function optimize(team, noise, oppLu, oppTimes, o) {
    o = o || {};
    var R = GK.rng.make(o.seed || 'opt'), iters = o.iters || 6000, restarts = o.restarts || 4;
    var asA = o.asA !== false; void asA; // the scorer is symmetric: it always scores `team` against the fixed side
    var evalLu = fastScorer(team, noise, oppLu, oppTimes);
    var starts = o.starts || [], best = null, bestV = -1e9, evals = 0;
    for (var r = 0; r < restarts; r++) {
      var cur = (starts[r] || starts[0] || defaultLineup(team)).slice();
      if (!starts[r] && r > 0) cur = shake(R, cur, 14);
      var cv = evalLu(cur); evals++;
      var lbest = cur.slice(), lbv = cv;
      for (var it = 0; it < iters; it++) {
        var T = T0 * Math.pow(0.02 / T0, it / iters);
        var nx = neighbor(R, cur); if (!nx) continue;
        var nv = evalLu(nx); evals++;
        if (nv >= cv || R.next() < Math.exp((nv - cv) / T)) { cur = nx; cv = nv; if (cv > lbv) { lbv = cv; lbest = cur.slice(); } }
      }
      var pol = polish(team, lbest, evalLu); evals += pol.evals; if (pol.v > lbv) { lbv = pol.v; lbest = pol.lu; }
      if (lbv > bestV) { bestV = lbv; best = lbest; }
    }
    return { lu: best, v: bestV, evals: evals };
  }
  function polish(team, lu, evalLu) {
    var cur = lu.slice(), cv = evalLu(cur), evals = 1, improved = true, rounds = 0;
    while (improved && rounds++ < 6) {
      improved = false;
      for (var si = 0; si < NS; si++) for (var p = -1; p < ROSTER; p++) {
        var nx = setSlot(cur, si, p); if (!nx) continue;
        var v = evalLu(nx); evals++; if (v > cv + 1e-9) { cur = nx; cv = v; improved = true; }
      }
    }
    return { lu: cur, v: cv, evals: evals };
  }
  // put swimmer p (or -1) in slot si; swaps inside the event or with p's slot elsewhere when needed. null if impossible.
  function setSlot(lu, si, p) {
    if (lu[si] === p) return null;
    var s = SLOTS[si], out = lu.slice(), sl = EV_SLOTS[s.ev], q = lu[si];
    if (p < 0) { if (s.relay) return null; out[si] = -1; return out; }
    for (var j = 0; j < sl.length; j++) if (lu[sl[j]] === p) { out[sl[j]] = q; out[si] = p; return out; }
    out[si] = p;
    if (fastOk(out, p) && (q < 0 || fastOk(out, q))) return out;
    // swap: p leaves one of its other slots of the same kind, q takes it
    var cands = [];
    for (var k = 0; k < NS; k++) if (lu[k] === p && SLOTS[k].relay === s.relay) cands.push(k);
    for (k = 0; k < cands.length; k++) {
      var o2 = out.slice(); o2[cands[k]] = q;
      if (o2[cands[k]] === q && dupFree(o2, SLOTS[cands[k]].ev) && fastOk(o2, p) && (q < 0 || fastOk(o2, q))) return o2;
    }
    return null;
  }
  // limits for one swimmer only (the others did not change)
  function fastOk(lu, p) {
    var ind = 0, tot = 0;
    for (var e = 0; e < EV.length; e++) { var sl = EV_SLOTS[e], n = 0; for (var j = 0; j < sl.length; j++) if (lu[sl[j]] === p) n++; if (n > 1) return false; if (n) { tot++; if (!EV[e].relay) ind++; } }
    return ind <= MAX_IND && tot <= MAX_TOT;
  }
  function dupFree(lu, e) { var sl = EV_SLOTS[e], seen = 0; for (var j = 0; j < sl.length; j++) { var p = lu[sl[j]]; if (p < 0) continue; if (seen & (1 << p)) return false; seen |= 1 << p; } return true; }
  function swapSlots(lu, a, b) {
    var pa = lu[a], pb = lu[b]; if (pa === pb || SLOTS[a].ev === SLOTS[b].ev) return null;
    var out = lu.slice(); out[a] = pb; out[b] = pa;
    if (!dupFree(out, SLOTS[a].ev) || !dupFree(out, SLOTS[b].ev)) return null;
    if ((pa >= 0 && !fastOk(out, pa)) || (pb >= 0 && !fastOk(out, pb))) return null;
    if ((pa < 0 && SLOTS[b].relay) || (pb < 0 && SLOTS[a].relay)) return null;
    return out;
  }
  function neighbor(R, lu) {
    if (R.next() < SWAP_P) { for (var t2 = 0; t2 < 8; t2++) { var sw2 = swapSlots(lu, R.int(0, NS - 1), R.int(0, NS - 1)); if (sw2) return sw2; } }
    for (var tries = 0; tries < 8; tries++) {
      var si = R.int(0, NS - 1), r = R.next(), p;
      if (r < 0.04 && !SLOTS[si].relay) p = -1; else p = R.int(0, ROSTER - 1);
      var nx = setSlot(lu, si, p); if (nx) return nx;
    }
    return null;
  }
  function shake(R, lu, n) { var cur = lu; for (var i = 0; i < n; i++) { var nx = neighbor(R, cur); if (nx) cur = nx; } return cur; }

  /* ---------- a whole meet from a seed ---------- */
  var cache = {};
  function makeMeet(seed, o) {
    o = o || {};
    var key = seed + '|' + (o.quick ? 'q' : 'f') + '|' + (o.homeEdge || 0) + '|' + (o.awayEdge || 0) + '|' + (o.revealInd === undefined ? '' : o.revealInd);
    if (cache[key]) return cache[key];
    var M = null;
    for (var attempt = 0; attempt < 4; attempt++) {
      M = buildMeet(seed, attempt, o);
      if (M.defaultMargin < 0 && M.best.margin >= 2) break;
    }
    M.attempt = attempt;
    cache[key] = M;
    return M;
  }
  function buildMeet(seed, attempt, o) {
    var R = GK.rng.make(seed + '/meet/' + attempt);
    var gender = R.chance(0.5) ? 'girls' : 'boys', used = {};
    var home = makeTeam(R.sub('home'), gender, o.homeEdge === undefined ? 0 : o.homeEdge, HOME.school, HOME.mascot, used);
    var away = makeTeam(R.sub('away'), gender, (o.awayEdge === undefined ? AWAY_EDGE : o.awayEdge) + R.float(-0.02, 0.02), R.pick(SCHOOLS), R.pick(MASCOTS), used);
    var noiseA = makeNoise(seed + '#' + attempt, 'A'), noiseB = makeNoise(seed + '#' + attempt, 'B');
    var defA = defaultLineup(home), tDefA = times(home, defA, noiseA);
    // their coach scouted your usual lineup and built theirs to beat it
    var defB = defaultLineup(away);
    var optB = optimize(away, noiseB, defA, tDefA, { asA: false, seed: seed + '/coachB', iters: o.quick ? 1500 : 2500, restarts: 1, starts: [defB] });
    var luB = optB.lu, tB = times(away, luB, noiseB);
    var defScore = scoreMeet(defA, tDefA, luB, tB);
    var optA = optimize(home, noiseA, luB, tB, { asA: true, seed: seed + '/best', iters: o.quick ? 4000 : 12000, restarts: o.quick ? 3 : 12, starts: [defA] });
    var bestLu = optA.lu, bestScore = scoreMeet(bestLu, times(home, bestLu, noiseA), luB, tB);
    // scouted events: one relay and two individual events of theirs are visible
    var RR = R.sub('reveal'), rel = [0, 7, 10], indv = [1, 2, 3, 4, 5, 6, 8, 9];
    RR.shuffle(indv);
    var nInd = o.revealInd === undefined ? REVEAL_IND : o.revealInd;
    var reveal = [RR.pick(rel)].concat(indv.slice(0, nInd)).sort(function (a, b) { return a - b; });
    return {
      seed: seed, gender: gender, home: home, away: away, noiseA: noiseA, noiseB: noiseB,
      defA: defA, luB: luB, tB: tB, reveal: reveal,
      defaultMargin: defScore.margin, defaultScore: defScore,
      best: { lu: bestLu, us: bestScore.us, them: bestScore.them, margin: bestScore.margin },
      evals: optA.evals + optB.evals
    };
  }
  // final result of a player's lineup
  function swim(M, lu) {
    var tA = times(M.home, lu, M.noiseA);
    return scoreMeet(lu, tA, M.luB, M.tB, true);
  }
  // seed-time projection (no race-day swing) for display
  function project(team, lu) { return times(team, lu, null); }

  // what a tap can do: put p in slot si directly, or swap lanes inside the same event. Never moves a swimmer out of another event.
  function place(lu, si, p) {
    var s = SLOTS[si], sl = EV_SLOTS[s.ev], q = lu[si], out = lu.slice();
    if (q === p) return { lu: out, same: true };
    if (p < 0) { if (s.relay) return { err: 'A relay needs all four legs.' }; out[si] = -1; return { lu: out }; }
    for (var j = 0; j < sl.length; j++) if (lu[sl[j]] === p) { if (q < 0 && s.relay) return { err: 'A relay needs all four legs.' }; out[sl[j]] = q; out[si] = p; return { lu: out, swap: true }; }
    out[si] = p;
    var c = counts(out), ind = [], all = [];
    EV.forEach(function (ev, e) { if (EV_SLOTS[e].some(function (k) { return lu[k] === p; })) { all.push(ev.short); if (!ev.relay) ind.push(ev.short); } });
    if (c.ind[p] > MAX_IND) return { err: 'Already has 2 individual events (' + ind.join(', ') + ').' };
    if (c.tot[p] > MAX_TOT) return { err: 'Already has 4 events (' + all.join(', ') + ').' };
    return { lu: out };
  }
  // when p is at a limit: p takes slot si and the swimmer there (or an empty lane) takes p's place in one of p's other events
  function trades(lu, si, p) {
    var s = SLOTS[si], q = lu[si], outL = [];
    if (p < 0 || q === p || EV_SLOTS[s.ev].some(function (k) { return lu[k] === p; })) return outL;
    for (var k = 0; k < NS; k++) {
      if (lu[k] !== p || SLOTS[k].ev === s.ev) continue;
      if (q < 0 && SLOTS[k].relay) continue;
      var o2 = lu.slice(); o2[si] = p; o2[k] = q;
      if (valid(o2)) outL.push({ lu: o2, slot: k, q: q, ev: SLOTS[k].ev });
    }
    return outL;
  }
  // every lineup one tap away (a direct pick, a lane swap, or a trade)
  function taps(lu) {
    var outL = [];
    for (var si = 0; si < NS; si++) for (var p = -1; p < ROSTER; p++) {
      var pr = place(lu, si, p);
      if (pr.lu && !pr.same) outL.push({ slot: si, p: p, lu: pr.lu });
      else if (pr.err && p >= 0) trades(lu, si, p).forEach(function (t) { outL.push({ slot: si, p: p, lu: t.lu, trade: t.slot }); });
    }
    return outL;
  }
  // what the player can know of their lineup: the scouted events as they are, the rest guessed from their usual lineup
  function assumedOpp(M) {
    var lu = defaultLineup(M.away);
    M.reveal.forEach(function (ei) { EV_SLOTS[ei].forEach(function (si) { lu[si] = M.luB[si]; }); });
    return lu;
  }
  // best single tap for the first-play hint, judged only on what the page shows (seed times, scouted events, their roster)
  function hint(M, lu) {
    var opp = assumedOpp(M), tOpp = times(M.away, opp, null);
    var f = fastScorer(M.home, null, opp, tOpp), base = f(lu), best = null, bestV = base + 0.99;
    taps(lu).forEach(function (t) {
      var v = f(t.lu) + (M.reveal.indexOf(SLOTS[t.slot].ev) >= 0 ? 0.5 : 0);
      if (v > bestV) { bestV = v; best = { slot: t.slot, p: t.p, trade: t.trade, lu: t.lu, gain: Math.round(v - base) }; }
    });
    return best;
  }

  var DM = {
    EV: EV, SLOTS: SLOTS, NS: NS, EV_SLOTS: EV_SLOTS, LEGNAME: LEGNAME, IND_PTS: IND_PTS, REL_PTS: REL_PTS, TOTAL_PTS: TOTAL_PTS,
    LANES: LANES, MAX_IND: MAX_IND, MAX_TOT: MAX_TOT, ROSTER: ROSTER, TIRE: TIRE, B2B: B2B, LOAD: LOAD, HOME: HOME,
    fmt: fmt, makeTeam: makeTeam, times: times, project: project, fatigue: fatigue, relayTime: relayTime, counts: counts,
    problems: problems, valid: valid, scoreMeet: scoreMeet, placePoints: placePoints, defaultLineup: defaultLineup,
    optimize: optimize, _tune: function (k, v) { if (k === 'swap') SWAP_P = v; if (k === 't0') T0 = v; }, fastScorer: fastScorer, setSlot: setSlot, place: place, trades: trades, taps: taps, assumedOpp: assumedOpp, makeMeet: makeMeet, swim: swim, hint: hint, slotBase: slotBase, _cache: cache
  };
  root.DM = DM;
  if (typeof module !== 'undefined' && module.exports) module.exports = DM;
})(typeof window !== 'undefined' ? window : globalThis);
