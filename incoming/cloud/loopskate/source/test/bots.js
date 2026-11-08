// Bot drivers for Loopskate. Each bot is (world) -> steer heading (radians) or null.
const LS = require('../src/rules.js');
function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

/* Orbit bot: picks the nearest cluster, circles it, steers off open water and burrbugs.
   noise = steering wobble (radians), react = seconds of lag on re-targeting, greed = how many critters it tries to fit in one loop. */
function orbitBot(o = {}) {
  const r = LS.rng('bot|' + (o.seed ?? 1)), noise = o.noise ?? 0, greed = o.greed ?? 4, react = o.react ?? 0, care = o.care ?? 1;
  let tgt = null, dir = 1, retarget = 0, lastLoops = -1, wob = 0;
  return function (W) {
    const s = W.sk, cfg = W.cfg, L = LS.live(W).filter(c => c.type !== 'burr' || o.loopBurrs !== false);
    if (W.stats.loops !== lastLoops) { lastLoops = W.stats.loops; tgt = null; retarget = react; dir = r() < 0.5 ? 1 : -1; }
    retarget -= 1 / 60;
    if (!L.length) return s.a + 0.6 * dir;
    if (!tgt || retarget <= 0 && !tgt.locked) {
      L.sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y));
      const seed = L[0], group = L.filter(c => Math.hypot(c.x - seed.x, c.y - seed.y) < 85).slice(0, greed);
      tgt = { ids: group.map(c => c.id) }; retarget = 0.5;
    }
    const g = W.critters.filter(c => c.state === 'live' && tgt.ids.includes(c.id)); if (!g.length) { tgt = null; return s.a; }
    let cx = 0, cy = 0; g.forEach(c => { cx += c.x; cy += c.y; }); cx /= g.length; cy /= g.length;
    let R = g.some(c => c.type === 'burr') ? 52 : 34; g.forEach(c => { R = Math.max(R, Math.hypot(c.x - cx, c.y - cy) + 30); });
    cx = Math.min(cfg.W - cfg.M - R, Math.max(cfg.M + R, cx)); cy = Math.min(cfg.H - cfg.M - R, Math.max(cfg.M + R, cy));
    const dx = s.x - cx, dy = s.y - cy, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    const tx = -uy * dir, ty = ux * dir, k = Math.max(-1.2, Math.min(1.2, (d - R) / R * 1.6));
    let h = Math.atan2(ty - uy * k, tx - ux * k);
    // danger look-ahead: try the orbit heading first, then nearby headings, and keep the first clear one
    if (care) {
      const bad = (hh) => {
        for (const ahead of [8, 18, 30, 44, 60]) {
          const ax = s.x + Math.cos(hh) * ahead, ay = s.y + Math.sin(hh) * ahead;
          for (const ho of W.holes) { if (!LS.holeDanger(W, ho) && ho.t > cfg.HOLE_BREAK) continue; if (!ho.armed && LS.geo.pip(s.x, s.y, ho.poly)) continue; if (LS.inHole(W, ho, ax, ay, 2)) return true; }
          for (const c of W.critters) if (c.state === 'live' && c.type === 'burr' && Math.hypot(c.x - ax, c.y - ay) < 22 * care) return true;
        }
        return false;
      };
      if (bad(h)) { for (const off of [0.4, -0.4, 0.8, -0.8, 1.2, -1.2, 1.7, -1.7, 2.3, -2.3, 3.1]) { if (!bad(h + off * dir)) { h += off * dir; break; } } }
    }
    if (noise) { wob = wob * 0.9 + gauss(r) * noise * 0.3; h += wob; }
    return h;
  };
}
function randomBot(o = {}) { const r = LS.rng('rnd|' + (o.seed ?? 3)); let h = 0, t = 0; return W => { t -= 1 / 60; if (t <= 0) { t = r.float(0.2, 1.2); h = r.float(-Math.PI, Math.PI); } return h; }; }
function idleBot() { let first = true; return W => { if (first) { first = false; return W.sk.a; } return null; }; }
function straightBot() { return W => -Math.PI / 2; }

function run(seed, bot, opts = {}, maxT = 900) {
  const W = LS.create(seed, opts); const dt = 1 / 60; let steps = 0;
  while (!W.over && W.t < maxT && steps < maxT * 60 + 10) { LS.step(W, dt, bot(W)); W.events.length = 0; steps++; }
  return W;
}
module.exports = { orbitBot, randomBot, idleBot, straightBot, run, LS };
