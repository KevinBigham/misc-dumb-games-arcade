// Pip Hop: the kit demo's game rules. Pure code, no DOM, so bots can run it in node.
// A one-button runner over blocks and pits. Uses GK.rng (course), GK.input.buffer and GK.input.coyote.
(function (root) {
  'use strict';
  var GK = root.GK || (typeof require !== 'undefined' ? require('../gamekit.js') : null);
  var PX = 80, SIZE = 24, G = 2200, JUMP = 760;
  var DEF = { gap: 1, speed: 220, accel: 3, len: 45, coyote: 0.1, buffer: 0.1 };
  function make(seed, params) {
    var p = {}, k; for (k in DEF) p[k] = DEF[k]; if (params) for (k in params) p[k] = params[k];
    var R = GK.rng.make(GK.rng.seedFor(seed, 'course'));
    var course = [], x = 520, end = (p.speed + p.accel * p.len / 2) * p.len + 400;
    while (x < end) {
      x += R.float(170, 330) * p.gap;
      var pit = R.chance(0.35);
      var o = pit ? { type: 'pit', x: x, w: R.int(50, 92), h: 0 } : { type: 'block', x: x, w: R.int(22, 34), h: R.pick([26, 40]) };
      course.push(o); x += o.w;
    }
    return { seed: String(seed), p: p, course: course, t: 0, x: 0, py: 0, vy: 0, ground: true, falling: false, dead: false, won: false, cause: '', score: 0, jumps: 0, cleared: 0, next: 0, ev: [],
      buf: GK.input.buffer(p.buffer), coy: GK.input.coyote(p.coyote), firstBlock: null };
  }
  function speed(w) { return w.p.speed + w.p.accel * w.t; }
  function overPit(w, cx) { for (var i = Math.max(0, w.next - 1); i < w.course.length; i++) { var o = w.course[i]; if (o.x > cx) break; if (o.type === 'pit' && cx > o.x + 3 && cx < o.x + o.w - 3) return true; } return false; }
  function ev(w, k, d) { w.ev.push({ k: k, d: d || null }); }
  // step(w, dt, pressed): pressed = number of taps since the last step
  function step(w, dt, pressed) {
    if (w.dead || w.won) return w;
    w.t += dt;
    for (var i = 0; i < (pressed | 0); i++) w.buf.press(w.t);
    if (w.ground) w.coy.ground(w.t);
    if ((w.ground || w.coy.can(w.t)) && !w.falling && w.buf.consume(w.t)) {
      var coyote = !w.ground;
      w.vy = JUMP; w.ground = false; w.coy.use(); w.jumps++; ev(w, 'jump', { coyote: coyote });
    }
    w.x += speed(w) * dt;
    var px = w.x + PX, cx = px + SIZE / 2;
    w.vy -= G * dt; w.py += w.vy * dt;
    var pit = overPit(w, cx);
    if (w.py <= 0) {
      if (!pit && !w.falling) { if (!w.ground) ev(w, 'land', { v: -w.vy }); w.py = 0; w.vy = 0; w.ground = true; }
      else { w.ground = false; if (w.py < -2 && !w.coy.can(w.t)) w.falling = true; }
    } else w.ground = false;
    if (w.falling && w.py < -48) { w.dead = true; w.cause = 'pit'; ev(w, 'die', { cause: 'pit' }); return w; }
    for (var j = w.next; j < w.course.length; j++) {
      var o = w.course[j]; if (o.x > px + SIZE) break;
      if (o.x + o.w < px) { w.next = j + 1; w.cleared++; ev(w, 'clear', { type: o.type, n: w.cleared }); continue; }
      if (o.type === 'block' && w.py < o.h && w.py + SIZE > 0) { w.dead = true; w.cause = w.cleared === 0 ? 'first-block' : 'block'; ev(w, 'die', { cause: w.cause }); return w; }
    }
    var sc = Math.floor(w.x / 10); if (Math.floor(sc / 100) > Math.floor(w.score / 100)) ev(w, 'milestone', { score: sc }); w.score = sc;
    if (w.t >= w.p.len) { w.won = true; ev(w, 'win'); }
    return w;
  }
  // Bots. Each looks at the next obstacle and decides whether to tap this step.
  function nextObs(w) { var px = w.x + PX; for (var i = w.next; i < w.course.length; i++) { var o = w.course[i]; if (o.x + o.w >= px) return o; } return null; }
  var BOTS = {
    early: function (w) { var o = nextObs(w); return o && w.ground && o.x - (w.x + PX + SIZE) < 70 * speed(w) / 220; },
    late: function (w) { var o = nextObs(w); return o && w.ground && o.x - (w.x + PX + SIZE) < 6; },
    smart: function (w) { var o = nextObs(w); if (!o) return false; var d = o.x - (w.x + PX + SIZE), s = speed(w) / 220; return w.ground && (o.type === 'block' ? d < 38 * s : d < -6); },
    // presses after running off the ledge: only lives because of coyote time
    ledge: function (w) { var o = nextObs(w); if (!o) return false; var d = o.x - (w.x + PX + SIZE), s = speed(w) / 220; if (o.type === 'block') return w.ground && d < 38 * s; return !w.falling && w.py <= 0 && d < -SIZE + 2; },
    mash: function (w, r) { return r.next() < 0.08; }
  };
  function runBot(seed, botName, params, dt) {
    dt = dt || 1 / 60; var w = make(seed, params), bot = BOTS[botName], r = GK.rng.make(GK.rng.seedFor(seed, 'bot'));
    var guard = Math.ceil(w.p.len / dt) + 10;
    while (!w.dead && !w.won && guard-- > 0) { step(w, dt, bot(w, r) ? 1 : 0); w.ev.length = 0; }
    return { survived: w.won ? 1 : 0, score: w.score, jumps: w.jumps, cleared: w.cleared, time: +w.t.toFixed(2), cause: w.cause || 'none' };
  }
  var PIP = { make: make, step: step, speed: speed, BOTS: BOTS, runBot: runBot, PX: PX, SIZE: SIZE, DEF: DEF };
  root.PIP = PIP;
  if (typeof module !== 'undefined' && module.exports) module.exports = PIP;
})(typeof window !== 'undefined' ? window : globalThis);
