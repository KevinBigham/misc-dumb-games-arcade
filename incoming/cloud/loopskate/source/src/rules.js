/* Loopskate rules: a pure simulation with no DOM. Runs in the page and in node (bots, tests).
   World is 360 x 640 units. step(world, dt, steer) where steer is a heading in radians or null. */
(function (root) {
  'use strict';
  var C = {
    W: 360, H: 640, M: 14,
    SK_V: 150, SK_VW: 2.2, SK_VMAX: 176, TURN: 5.6, SK_R: 9,
    TRAIL_LIFE: 3.0, TRAIL_STEP: 5, SNAP: 9, SNAP_AGE: 0.4, SNAP_GAP: 14, MIN_AREA: 1400,
    HOLE_BREAK: 0.45, HOLE_OPEN: 3.6, HOLE_END: 4.4, HOLE_INSET: 9,
    COMBO_WIN: 2.6, BETWEEN: 1.4, CLEAR_BONUS: 5,
    PTS: { puff: 1, snip: 2, burr: 3, glim: 8 },
    R: { puff: 9, snip: 9, burr: 10, glim: 8 }
  };

  /* ---------- seeded rng ---------- */
  function hash(s) { s = String(s); var h = 2166136261 >>> 0; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    var a = (typeof seed === 'number' ? seed : hash(seed)) >>> 0 || 1;
    var r = function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), a | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    r.float = function (lo, hi) { return lo + (hi - lo) * r(); };
    r.int = function (lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); };
    r.chance = function (p) { return r() < p; };
    return r;
  }

  /* ---------- geometry ---------- */
  // segment p1-p2 vs p3-p4: returns {x,y} or null
  function segX(p1, p2, p3, p4) {
    var d1x = p2.x - p1.x, d1y = p2.y - p1.y, d2x = p4.x - p3.x, d2y = p4.y - p3.y;
    var den = d1x * d2y - d1y * d2x; if (Math.abs(den) < 1e-9) return null;
    var ex = p3.x - p1.x, ey = p3.y - p1.y;
    var t = (ex * d2y - ey * d2x) / den, u = (ex * d1y - ey * d1x) / den;
    if (t < 0 || t > 1 || u < 0 || u > 1) return null;
    return { x: p1.x + d1x * t, y: p1.y + d1y * t };
  }
  function area(poly) { var a = 0; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) a += (poly[j].x * poly[i].y - poly[i].x * poly[j].y); return Math.abs(a) / 2; }
  function pip(x, y, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  function distSeg(px, py, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy, t = L ? ((px - a.x) * dx + (py - a.y) * dy) / L : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t; var cx = a.x + dx * t, cy = a.y + dy * t;
    return { d: Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy)), x: cx, y: cy };
  }
  function distPoly(x, y, poly) { var m = 1e9; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var d = distSeg(x, y, poly[j], poly[i]).d; if (d < m) m = d; } return m; }
  function centroid(poly) { var x = 0, y = 0; for (var i = 0; i < poly.length; i++) { x += poly[i].x; y += poly[i].y; } return { x: x / poly.length, y: y / poly.length }; }
  function bbox(poly) { var b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }; poly.forEach(function (p) { if (p.x < b.x0) b.x0 = p.x; if (p.y < b.y0) b.y0 = p.y; if (p.x > b.x1) b.x1 = p.x; if (p.y > b.y1) b.y1 = p.y; }); return b; }
  function inBox(b, x, y, pad) { return x >= b.x0 - pad && x <= b.x1 + pad && y >= b.y0 - pad && y <= b.y1 + pad; }
  function angDiff(a, b) { var d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

  /* ---------- waves ---------- */
  function waveSpec(w) {
    if (w === 1) return { puff: 3, snip: 0, burr: 0, time: 26, glim: 0 };
    if (w === 2) return { puff: 4, snip: 1, burr: 0, time: 26, glim: 0.4 };
    if (w === 3) return { puff: 4, snip: 1, burr: 1, time: 28, glim: 0.4 };
    var puff = Math.min(10, 3 + Math.floor(w * 0.6)), snip = Math.min(4, 1 + Math.floor((w - 2) / 3)), burr = Math.min(4, 1 + Math.floor((w - 3) / 3));
    // more critters get more time, but less time each as the waves climb (about 4.9 s each at wave 4, 3 s by wave 12)
    return { puff: puff, snip: snip, burr: burr, time: Math.max(24, Math.round(20 + 2 * (puff + snip + burr) - (w - 4) * 1.1)), glim: 0.45 };
  }
  function speedOf(type, w) {
    if (type === 'puff') return Math.min(50, 20 + 2.5 * w);
    if (type === 'snip') return Math.min(72, 36 + 3 * w);
    if (type === 'burr') return Math.min(84, 44 + 2.8 * w);
    return 100;
  }

  function create(seed, opts) {
    opts = opts || {};
    var cfg = Object.assign({}, C, opts.cfg || {});
    var W = {
      seed: String(seed), cfg: cfg, r: rng('loopskate|' + seed), t: 0, wave: 0, started: false,
      sk: { x: cfg.W / 2, y: cfg.H * 0.74, a: -Math.PI / 2, v: cfg.SK_V },
      trail: [], holes: [], critters: [], nextId: 1,
      score: 0, combo: 0, lastLoopT: -99, timer: 0, timerMax: 0, phase: 'play', betweenT: 0, glimAt: -1,
      over: false, cause: '', events: [],
      stats: { loops: 0, drops: 0, maxLoop: 0, maxCombo: 0, cuts: 0, waves: 0, burrDrops: 0, glims: 0, emptyLoops: 0 }
    };
    W.trail.push({ x: W.sk.x, y: W.sk.y, t: 0 });
    startWave(W, 1);
    return W;
  }

  function spawn(W, type, x, y) {
    var c = { id: W.nextId++, type: type, x: x, y: y, a: W.r.float(-Math.PI, Math.PI), v: speedOf(type, W.wave), r: C.R[type], t: 0, state: 'live', dropT: 0, turnT: W.r.float(0.5, 1.5), slip: false };
    W.critters.push(c); return c;
  }
  function freeSpot(W, minSk) {
    var cfg = W.cfg, best = null, bestD = -1;
    for (var k = 0; k < 40; k++) {
      var x = W.r.float(cfg.M + 30, cfg.W - cfg.M - 30), y = W.r.float(cfg.M + 40, cfg.H - cfg.M - 40);
      var dsk = Math.hypot(x - W.sk.x, y - W.sk.y), dmin = dsk;
      W.critters.forEach(function (c) { if (c.state === 'live') dmin = Math.min(dmin, Math.hypot(c.x - x, c.y - y) * 3); });
      if (dsk >= minSk && dmin >= 90) return { x: x, y: y };
      var score = Math.min(dsk / minSk, dmin / 90); if (score > bestD) { bestD = score; best = { x: x, y: y }; }
    }
    return best;
  }
  function startWave(W, n) {
    var cfg = W.cfg; W.wave = n; W.phase = 'play';
    W.critters = W.critters.filter(function (c) { return c.state === 'drop'; });
    var s = waveSpec(n);
    if (n === 1) {
      // a friendly first catch: three pufflings close together in the middle of the pond
      var cx = cfg.W / 2, cy = cfg.H * 0.42;
      [[-26, -8], [22, -14], [0, 22]].forEach(function (o) { var c = spawn(W, 'puff', cx + o[0], cy + o[1]); c.v *= 0.6; });
    } else {
      var i, p;
      for (i = 0; i < s.puff; i++) { p = freeSpot(W, 110); spawn(W, 'puff', p.x, p.y); }
      for (i = 0; i < s.snip; i++) { p = freeSpot(W, 140); spawn(W, 'snip', p.x, p.y); }
      for (i = 0; i < s.burr; i++) { p = freeSpot(W, 200); spawn(W, 'burr', p.x, p.y); }
    }
    W.glimAt = s.glim && W.r.chance(s.glim) ? W.r.float(4, 9) : -1;
    W.timer = W.timerMax = s.time;
    W.sk.v = Math.min(cfg.SK_VMAX, cfg.SK_V + cfg.SK_VW * (n - 1));
    W.events.push({ k: 'wave', n: n });
  }

  function live(W) { return W.critters.filter(function (c) { return c.state === 'live'; }); }

  function dropCritter(W, c, slip) {
    c.state = 'drop'; c.dropT = 0; c.slip = !!slip;
    if (c.type === 'burr') W.stats.burrDrops++;
    if (c.type === 'glim') W.stats.glims++;
  }

  function closeLoop(W, poly) {
    var cfg = W.cfg, hole = { poly: poly, t: 0, box: bbox(poly), id: W.nextId++, armed: false, c: centroid(poly) };
    W.holes.push(hole);
    var caught = [];
    W.critters.forEach(function (c) { if (c.state === 'live' && inBox(hole.box, c.x, c.y, 0) && pip(c.x, c.y, poly)) caught.push(c); });
    var n = caught.length, base = 0, pts = 0;
    caught.forEach(function (c) { base += cfg.PTS[c.type]; dropCritter(W, c, false); });
    if (n > 0) {
      W.combo = (W.t - W.lastLoopT <= cfg.COMBO_WIN && W.combo > 0) ? W.combo + 1 : 1;
      W.lastLoopT = W.t;
      pts = Math.round(base * n * (1 + 0.5 * (W.combo - 1)) * 10);
      W.score += pts;
      W.stats.drops += n; W.stats.maxLoop = Math.max(W.stats.maxLoop, n); W.stats.maxCombo = Math.max(W.stats.maxCombo, W.combo);
    } else { W.combo = 0; W.stats.emptyLoops++; }
    W.stats.loops++;
    var cen = centroid(poly);
    W.events.push({ k: 'loop', n: n, pts: pts, combo: W.combo, hole: hole, x: cen.x, y: cen.y, area: area(poly), caught: caught.map(function (c) { return c.id; }) });
    W.trail = [{ x: W.sk.x, y: W.sk.y, t: W.t }];
    checkClear(W);
  }

  function checkClear(W) {
    if (W.phase !== 'play') return;
    var left = W.critters.some(function (c) { return c.state === 'live' && c.type !== 'glim'; });
    if (left) return;
    var bonus = Math.ceil(Math.max(0, W.timer)) * W.cfg.CLEAR_BONUS * W.wave;
    W.score += bonus; W.stats.waves = W.wave;
    W.phase = 'between'; W.betweenT = W.cfg.BETWEEN;
    W.holes.forEach(function (h) { if (h.t < W.cfg.HOLE_OPEN) h.t = W.cfg.HOLE_OPEN; });
    W.critters.forEach(function (c) { if (c.state === 'live' && c.type === 'glim') { c.state = 'gone'; } });
    W.events.push({ k: 'clear', n: W.wave, bonus: bonus });
  }

  function endRun(W, cause) { if (W.over) return; W.over = true; W.cause = cause; W.combo = 0; W.events.push({ k: 'over', cause: cause }); }

  function holeDanger(W, h) { return h.t >= W.cfg.HOLE_BREAK && h.t < W.cfg.HOLE_OPEN; }
  // open water refreezes from the rim inward: 1 when it opens, 0 when it is ice again
  function holeScale(W, h) { var c = W.cfg; return h.t < c.HOLE_BREAK ? 1 : Math.max(0, 1 - (h.t - c.HOLE_BREAK) / (c.HOLE_OPEN - c.HOLE_BREAK)); }
  function inHole(W, h, x, y, inset) {
    var f = holeScale(W, h); if (f < 0.04) return false;
    var qx = h.c.x + (x - h.c.x) / f, qy = h.c.y + (y - h.c.y) / f;
    if (!inBox(h.box, qx, qy, 0) || !pip(qx, qy, h.poly)) return false;
    return distPoly(qx, qy, h.poly) * f > inset;
  }
  // skater: armedOnly = true, so a fresh hole only bites once the skater has left it
  function inWater(W, x, y, inset, armedOnly) {
    for (var i = 0; i < W.holes.length; i++) { var h = W.holes[i]; if (!holeDanger(W, h) || (armedOnly && !h.armed)) continue; if (inHole(W, h, x, y, inset)) return h; }
    return null;
  }
  function armHoles(W) {
    for (var i = 0; i < W.holes.length; i++) { var h = W.holes[i]; if (!h.armed && (!inBox(h.box, W.sk.x, W.sk.y, 14) || (!pip(W.sk.x, W.sk.y, h.poly) && distPoly(W.sk.x, W.sk.y, h.poly) > 14))) h.armed = true; }
  }

  function bounce(W, o, r) {
    var cfg = W.cfg, hit = false;
    if (o.x < cfg.M + r) { o.x = cfg.M + r; o.a = Math.PI - o.a; hit = true; }
    if (o.x > cfg.W - cfg.M - r) { o.x = cfg.W - cfg.M - r; o.a = Math.PI - o.a; hit = true; }
    if (o.y < cfg.M + r) { o.y = cfg.M + r; o.a = -o.a; hit = true; }
    if (o.y > cfg.H - cfg.M - r) { o.y = cfg.H - cfg.M - r; o.a = -o.a; hit = true; }
    return hit;
  }

  // the skater glances off the snowbank: the push into the wall is dropped, so you slide along it and steer away
  function glance(W, s, r) {
    var cfg = W.cfg, vx = Math.cos(s.a), vy = Math.sin(s.a), hit = false;
    if (s.x < cfg.M + r) { s.x = cfg.M + r; vx = Math.max(Math.abs(vx) * 0.35, 0.2); hit = true; }
    if (s.x > cfg.W - cfg.M - r) { s.x = cfg.W - cfg.M - r; vx = -Math.max(Math.abs(vx) * 0.35, 0.2); hit = true; }
    if (s.y < cfg.M + r) { s.y = cfg.M + r; vy = Math.max(Math.abs(vy) * 0.35, 0.2); hit = true; }
    if (s.y > cfg.H - cfg.M - r) { s.y = cfg.H - cfg.M - r; vy = -Math.max(Math.abs(vy) * 0.35, 0.2); hit = true; }
    if (hit) s.a = Math.atan2(vy, vx);
    return hit;
  }
  function stepSkater(W, dt, steer) {
    var cfg = W.cfg, s = W.sk;
    if (steer != null && isFinite(steer)) { var d = angDiff(s.a, steer), m = cfg.TURN * dt; s.a += d > m ? m : d < -m ? -m : d; }
    s.x += Math.cos(s.a) * s.v * dt; s.y += Math.sin(s.a) * s.v * dt;
    if (glance(W, s, cfg.SK_R)) { W.events.push({ k: 'bump', x: s.x, y: s.y }); W.trail.push({ x: s.x, y: s.y, t: W.t }); }
    var tr = W.trail, last = tr[tr.length - 1];
    if (!last || Math.hypot(s.x - last.x, s.y - last.y) >= cfg.TRAIL_STEP) { tr.push({ x: s.x, y: s.y, t: W.t }); tryClose(W); }
    while (W.trail.length > 1 && W.t - W.trail[0].t > cfg.TRAIL_LIFE) W.trail.shift();
  }

  function tryClose(W) {
    var cfg = W.cfg, tr = W.trail, n = tr.length; if (n < 6) return false;
    var A = tr[n - 2], B = tr[n - 1], i, X, poly;
    for (i = n - 4; i >= 0; i--) {
      X = segX(A, B, tr[i], tr[i + 1]);
      if (X) { poly = [X].concat(tr.slice(i + 1, n - 1)); if (poly.length >= 3 && area(poly) >= cfg.MIN_AREA) { closeLoop(W, poly); return true; } }
    }
    // forgiving snap: the blade comes within a few units of an older part of the trail
    for (i = n - 1 - cfg.SNAP_GAP; i >= 0; i--) {
      if (W.t - tr[i].t < cfg.SNAP_AGE) continue;
      var ds = distSeg(B.x, B.y, tr[i], tr[i + 1]);
      if (ds.d <= cfg.SNAP) { poly = [{ x: ds.x, y: ds.y }].concat(tr.slice(i + 1, n)); if (area(poly) >= cfg.MIN_AREA) { closeLoop(W, poly); return true; } }
    }
    return false;
  }

  function stepCritter(W, c, dt) {
    var cfg = W.cfg, s = W.sk;
    c.t += dt;
    if (c.state === 'drop') { c.dropT += dt; return; }
    if (c.state !== 'live') return;
    var dx = s.x - c.x, dy = s.y - c.y, dsk = Math.hypot(dx, dy), want = null, sp = c.v, turn = 2.2;
    if (c.type === 'puff') {
      c.turnT -= dt; if (c.turnT <= 0) { c.turnT = W.r.float(0.6, 1.8); c.a += W.r.float(-1.4, 1.4); }
      if (dsk < 46) { want = Math.atan2(-dy, -dx); sp *= 1.35; turn = 3; }
    } else if (c.type === 'snip') {
      var best = null, bd = 140;
      for (var i = 0; i < W.trail.length - 4; i += 3) { var p = W.trail[i], d = Math.hypot(p.x - c.x, p.y - c.y); if (d < bd) { bd = d; best = p; } }
      if (best) want = Math.atan2(best.y - c.y, best.x - c.x);
      else { c.turnT -= dt; if (c.turnT <= 0) { c.turnT = W.r.float(0.5, 1.4); c.a += W.r.float(-1.6, 1.6); } }
    } else if (c.type === 'burr') {
      // burrbugs scuttle in bursts: 0.9 s chasing, 0.5 s catching their breath (a window to loop them)
      var ph = (c.t + c.id * 0.37) % 1.4; c.rest = ph > 0.9;
      if (c.rest) sp = 0; else want = Math.atan2(dy, dx);
    } else if (c.type === 'glim') {
      if (dsk < 110) { want = Math.atan2(-dy, -dx); turn = 4; } else { c.turnT -= dt; if (c.turnT <= 0) { c.turnT = W.r.float(0.4, 1); c.a += W.r.float(-2, 2); } sp *= 0.5; }
      if (c.t > 9) { c.state = 'gone'; W.events.push({ k: 'glimGone', x: c.x, y: c.y }); return; }
    }
    if (want != null) { var dd = angDiff(c.a, want), m = turn * dt; c.a += dd > m ? m : dd < -m ? -m : dd; }
    c.x += Math.cos(c.a) * sp * dt; c.y += Math.sin(c.a) * sp * dt;
    bounce(W, c, c.r);
    // critters that wander into open water fall in too (half points, rounded up)
    if (inWater(W, c.x, c.y, 2)) {
      dropCritter(W, c, true);
      var pts = Math.ceil(cfg.PTS[c.type] / 2) * 10; W.score += pts; W.stats.drops++;
      W.events.push({ k: 'slip', id: c.id, type: c.type, x: c.x, y: c.y, pts: pts });
      checkClear(W); return;
    }
    if (c.type === 'snip' && (c.cool = (c.cool || 0) - dt) <= 0) {
      for (var j = W.trail.length - 2; j >= 0; j--) {
        if (distSeg(c.x, c.y, W.trail[j], W.trail[j + 1]).d < c.r) { W.trail = W.trail.slice(j + 1); W.stats.cuts++; c.cool = 0.9; c.a += Math.PI * 0.8; W.events.push({ k: 'snip', x: c.x, y: c.y }); break; }
      }
    }
    if (c.type === 'burr' && W.phase === 'play' && dsk < cfg.SK_R + c.r - 2) { W.events.push({ k: 'bite', x: c.x, y: c.y }); endRun(W, 'bite'); }
  }

  function step(W, dt, steer) {
    if (W.over) return W;
    if (!W.started) { if (steer == null) return W; W.started = true; W.events.push({ k: 'start' }); }
    var cfg = W.cfg; W.t += dt;
    stepSkater(W, dt, steer);
    for (var i = 0; i < W.holes.length; i++) W.holes[i].t += dt * (W.phase === 'between' ? 2.5 : 1);
    W.holes = W.holes.filter(function (h) { return h.t < cfg.HOLE_END; });
    armHoles(W);
    if (W.phase === 'play' && inWater(W, W.sk.x, W.sk.y, cfg.HOLE_INSET, true)) { W.events.push({ k: 'plunge', x: W.sk.x, y: W.sk.y }); endRun(W, 'water'); return W; }
    W.critters.forEach(function (c) { if (!W.over) stepCritter(W, c, dt); });
    W.critters = W.critters.filter(function (c) { return c.state === 'live' || (c.state === 'drop' && c.dropT < 0.8); });
    if (W.over) return W;
    if (W.phase === 'play') {
      if (W.glimAt > 0 && W.timerMax - W.timer >= W.glimAt) { W.glimAt = -1; var p = freeSpot(W, 160); var g = spawn(W, 'glim', p.x, p.y); W.events.push({ k: 'glim', id: g.id, x: p.x, y: p.y }); }
      W.timer -= dt;
      if (W.timer <= 0) { W.timer = 0; W.events.push({ k: 'thaw' }); endRun(W, 'thaw'); }
    } else if (W.phase === 'between') {
      W.betweenT -= dt; if (W.betweenT <= 0) startWave(W, W.wave + 1);
    }
    return W;
  }

  var LS = { CONFIG: C, create: create, step: step, waveSpec: waveSpec, speedOf: speedOf, rng: rng, hash: hash,
    geo: { segX: segX, area: area, pip: pip, distSeg: distSeg, distPoly: distPoly, centroid: centroid, angDiff: angDiff },
    inWater: inWater, inHole: inHole, holeScale: holeScale, armHoles: armHoles, holeDanger: holeDanger, live: live, tryClose: tryClose, closeLoop: closeLoop };
  root.LS = LS;
  if (typeof module !== 'undefined' && module.exports) module.exports = LS;
})(typeof window !== 'undefined' ? window : globalThis);
