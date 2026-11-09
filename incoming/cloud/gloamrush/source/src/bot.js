// Headless bots for Gloamrush core.
const GR = require(process.env.CORE || './core.js');
function bot(w, style) {
  const p = w.p; let ax = 0, ay = 0;
  // flee bullets (strongly), enemies (moderately)
  for (const b of w.ebul) {
    const dx = p.x - b.x, dy = p.y - b.y, d = Math.hypot(dx, dy);
    if (d < 70) { const f = (70 - d) / 70; ax += dx / d * f * 3; ay += dy / d * f * 3; }
  }
  for (const e of w.enemies) {
    if (e.dead) continue;
    const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy);
    const R = e.r + 70;
    if (d < R) { const f = (R - d) / R; ax += dx / d * f * 2; ay += dy / d * f * 2; }
  }
  if (w.boss) { const dx = p.x - w.boss.x, dy = p.y - w.boss.y, d = Math.hypot(dx, dy); if (d < 220) { ax += dx / d * 2; ay += dy / d * 2; } }
  // seek
  const seek = (x, y, s) => { const dx = x - p.x, dy = y - p.y, d = Math.hypot(dx, dy) || 1; ax += dx / d * s; ay += dy / d * s; };
  if (w.stone) seek(w.stone.x, w.stone.y, 1.2);
  if (w.comet) seek(w.comet.x, w.comet.y, 1.0);
  for (const m of w.moths) seek(m.x, m.y, 0.9);
  if (style !== 'idle' && w.gems.length) { let g = w.gems[0], bd = 1e9; for (const x of w.gems) { const d = Math.hypot(x.x - p.x, x.y - p.y); if (d < bd) { bd = d; g = x; } } if (bd < 400) seek(g.x, g.y, 0.5); }
  // gentle circle so we keep moving
  ax += Math.cos(w.t * 0.7) * 0.25; ay += Math.sin(w.t * 0.7) * 0.25;
  const m = Math.hypot(ax, ay); if (m > 1) { ax /= m; ay /= m; }
  return { ax, ay };
}
function pick(w, mode, rng) {
  const ch = w.choices;
  if (mode === 'first') return 0;
  if (mode === 'random') return Math.floor(rng() * ch.length);
  // focused: evo > recipe ingredients (a,b of first two recipes w/ progress) > anything
  let bestI = 0, bs = -1;
  ch.forEach((c, i) => {
    let s = 0;
    if (c.kind === 'evo') s = 100;
    else if (c.kind === 'up') {
      const parts = GR.evoPartnersOf(c.id).filter(([e]) => !GR.hasEvo(w, e.id));
      if (parts.length) s = 10 + GR.lv(w, c.id) * 3 + parts.reduce((a, [e, pt]) => a + GR.lv(w, pt) * 2, 0);
      if (c.id === 'twin' || c.id === 'quick' || c.id === 'dense') s += 6;
    }
    if (s > bs) { bs = s; bestI = i; }
  });
  return bestI;
}
function runSim(o) {
  o = o || {};
  const w = GR.makeWorld(Object.assign({ seed: o.seed || 1, vw: 400, vh: 800 }, o.world || {}));
  const rng = GR.mulberry32((o.seed || 1) * 31 + 7);
  const dt = 1 / 60, maxT = o.maxT || 260;
  let firstLevelT = null, firstWildT = null, firstEvoT = null, frames = 0;
  while (!w.over && w.t < maxT && frames < maxT * 60 + 5000) {
    frames++;
    if (w.choices) {
      if (firstLevelT === null && !(w.headStart && w.levelIdx <= w.meta.start)) firstLevelT = w.t;
      GR.chooseUpgrade(w, pick(w, o.pick || 'focused', rng));
      continue;
    }
    if (w.awaitDawn) { if (o.longNight) GR.stayLongNight(w); else GR.cashOut(w); continue; }
    const inp = (o.bot || bot)(w, o.style);
    GR.step(w, inp, dt);
    for (const e of w.events) {
      if (e.k === 'wildfire' && firstWildT === null) firstWildT = w.t;
      if (e.k === 'evolve' && firstEvoT === null) firstEvoT = w.t;
    }
    w.events.length = 0;
  }
  return { w, firstLevelT, firstWildT, firstEvoT, frames };
}
module.exports = { bot, pick, runSim, GR };
if (require.main === module) {
  const N = +process.argv[2] || 20;
  const res = [];
  for (let s = 1; s <= N; s++) {
    const r = runSim({ seed: s * 101, pick: process.argv[3] || 'focused', world: { tutorial: process.argv[4] === 'tut' } });
    const w = r.w;
    res.push(r);
    console.log(`seed ${s}: t=${w.t.toFixed(1)} win=${w.over && w.over.win} lvl=${w.level} kills=${w.stats.kills} graze=${w.stats.grazes} chain=${w.stats.bestChain} wild=${w.stats.wildfires} evos=${w.evos.join(',')} catches=${w.stats.catches} glow=${w.over && w.over.pay.glow} firstLvl=${r.firstLevelT && r.firstLevelT.toFixed(1)} firstWild=${r.firstWildT && r.firstWildT.toFixed(1)} firstEvo=${r.firstEvoT && r.firstEvoT.toFixed(1)} bossHp=${w.boss ? Math.round(w.boss.hp) : '-'}`);
  }
  const avg = k => (res.reduce((a, r) => a + k(r), 0) / res.length).toFixed(1);
  console.log('avg t', avg(r => r.w.t), 'wins', res.filter(r => r.w.over && r.w.over.win).length, 'avg lvl', avg(r => r.w.level), 'evo<180', res.filter(r => r.firstEvoT && r.firstEvoT < 180).length);
}
// graze-seeking bot: hovers just outside bullets
function grazeBot(w) {
  const p = w.p; const base = bot(w, 'g');
  let ax = base.ax, ay = base.ay, best = null, bd = 1e9;
  for (const b of w.ebul) { const d = Math.hypot(b.x - p.x, b.y - p.y); if (d < bd && d > 30) { bd = d; best = b; } }
  if (best && bd < 220) { const dx = best.x - p.x, dy = best.y - p.y; // move perpendicular-ish toward it
    const tx = -dy / bd, ty = dx / bd; ax += (dx / bd) * (bd > 50 ? 0.6 : -0.6) + tx * 0.5; ay += (dy / bd) * (bd > 50 ? 0.6 : -0.6) + ty * 0.5; }
  const m = Math.hypot(ax, ay); if (m > 1) { ax /= m; ay /= m; } return { ax, ay };
}
module.exports.grazeBot = grazeBot;
// skimmer: line itself up so incoming shots pass ~20px away
function skimBot(w) {
  const p = w.p; let ax = 0, ay = 0, best = null, bd = 1e9;
  for (const b of w.ebul) {
    const dx = p.x - b.x, dy = p.y - b.y, d = Math.hypot(dx, dy), sp = Math.hypot(b.vx, b.vy);
    const toward = (dx * b.vx + dy * b.vy) / (sp * d);
    if (d < 15) { ax += dx / d * 3; ay += dy / d * 3; }
    if (toward > 0.3 && d < 240 && d < bd) { bd = d; best = b; }
  }
  if (best) {
    const sp = Math.hypot(best.vx, best.vy), ux = best.vx / sp, uy = best.vy / sp;
    const dx = p.x - best.x, dy = p.y - best.y; const perp = dx * -uy + dy * ux; // signed distance from the bullet's line
    const s = perp >= 0 ? 1 : -1, want = 20 * s, err = want - perp;
    ax += -uy * clamp(err / 10, -1, 1); ay += ux * clamp(err / 10, -1, 1);
  } else { const b = bot(w, 'g'); ax += b.ax; ay += b.ay; }
  for (const e of w.enemies) { if (e.dead) continue; const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy); if (d < e.r + 40) { ax += dx / d * 2; ay += dy / d * 2; } }
  const m = Math.hypot(ax, ay); if (m > 1) { ax /= m; ay /= m; } return { ax, ay };
}
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
module.exports.skimBot = skimBot;
