// Rules + bot tests. node test/run-tests.js
const B = require('./bots.js'), LS = B.LS, G = LS.geo;
let pass = 0, fail = 0;
const ok = (c, name, extra) => { if (c) pass++; else fail++; console.log(c ? 'PASS' : 'FAIL', name, extra === undefined ? '' : extra); };
const dt = 1 / 60;
const drain = W => { const e = W.events; W.events = []; return e; };

// --- geometry ---
const sq = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
ok(G.area(sq) === 100 && G.pip(5, 5, sq) && !G.pip(15, 5, sq) && !G.pip(-1, -1, sq), 'area and point-in-polygon on a square');
ok(!!G.segX({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 }) && !G.segX({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }), 'segment crossing test');
const L = [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 30 }, { x: 0, y: 30 }];
ok(G.pip(5, 25, L) && !G.pip(20, 20, L), 'point-in-polygon on a concave L shape');

// --- determinism ---
{ const a = B.run('det', B.orbitBot({ seed: 4 })), b = B.run('det', B.orbitBot({ seed: 4 }));
  ok(a.score === b.score && a.t === b.t && a.cause === b.cause && a.wave === b.wave, 'same seed and same inputs give the same run', a.score + ' / ' + a.t.toFixed(2)); }

// --- loops close correctly ---
// steer a scripted circle around wave 1's three pufflings
function circleRun(seed, cx, cy, R, dir, maxT) {
  const W = LS.create(seed); W.critters.forEach(c => { c.v = 0; });
  let loops = [], t = 0;
  while (!W.over && t < (maxT || 6)) {
    const dx = W.sk.x - cx, dy = W.sk.y - cy, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d, k = Math.max(-1.2, Math.min(1.2, (d - R) / R * 1.6));
    LS.step(W, dt, Math.atan2(ux * dir - uy * k, -uy * dir - ux * k)); t += dt;
    for (const e of drain(W)) if (e.k === 'loop') loops.push(e);
    if (loops.length) break;
  }
  return { W, loops };
}
{ const W0 = LS.create('loopA'); const cs = W0.critters; const cx = cs.reduce((s, c) => s + c.x, 0) / 3, cy = cs.reduce((s, c) => s + c.y, 0) / 3;
  const { W, loops } = circleRun('loopA', cx, cy, 60, 1);
  ok(loops.length === 1 && loops[0].n === 3, 'one scripted circle around the 3 pufflings drops all 3', loops[0] && ('n=' + loops[0].n + ' area=' + loops[0].area.toFixed(0)));
  const bonus = (drain(W), W.score - 90); ok(loops[0] && loops[0].pts === 90 && bonus === Math.ceil(W.timer) * 5 * 1, 'score for 3 pufflings in one loop is 3 x 3 x 10 = 90, plus the clear bonus of 5 per second left', 'loop ' + (loops[0] && loops[0].pts) + ' + bonus ' + bonus);
  ok(W.trail.length === 1, 'the trail resets after a loop closes');
  ok(W.stats.waves === 1 && W.phase === 'between', 'catching every critter clears the wave');
  // the other direction works too
  const r2 = circleRun('loopA', cx, cy, 60, -1); ok(r2.loops.length === 1 && r2.loops[0].n === 3, 'a counter-clockwise loop works the same', r2.loops[0] && r2.loops[0].n); }
{ // a loop that misses: circle somewhere empty
  const { W, loops } = circleRun('loopB', 90, 520, 50, 1);
  ok(loops.length === 1 && loops[0].n === 0 && W.score === 0 && LS.live(W).length === 3, 'a loop around nothing drops nothing, critters outside stay', loops[0] && loops[0].n); }
{ // straight line and gentle wiggle never close a loop
  const W = LS.create('line'); let loops = 0, t = 0;
  while (!W.over && t < 20) { LS.step(W, dt, -Math.PI / 2 + Math.sin(t * 2) * 0.6); t += dt; for (const e of drain(W)) if (e.k === 'loop') loops++; }
  ok(loops === 0, 'a wiggly line along the pond never closes a loop'); }
{ // a crossing that encloses a tiny area does not count
  const W = LS.create('tiny'); W.started = true;
  W.trail = [{ x: 100, y: 100, t: 0 }, { x: 110, y: 100, t: 0 }, { x: 120, y: 100, t: 0 }, { x: 120, y: 110, t: 0 }, { x: 110, y: 110, t: 0 }, { x: 112, y: 90, t: 0 }];
  ok(!LS.tryClose(W), 'a tiny crossing (under the minimum area) is ignored'); }
{ // snap: ending a loop a few units from the trail still closes it
  const W = LS.create('snap'); W.t = 2; W.started = true; const pts = [];
  for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 1.96; pts.push({ x: 180 + Math.cos(a) * 50, y: 300 + Math.sin(a) * 50, t: i * 0.03 }); }
  W.trail = pts.slice(0, -1); W.trail.push({ x: 180 + 50 + 6, y: 300 - 2, t: 1.3 });
  ok(LS.tryClose(W), 'coming within a few units of your trail snaps the loop shut'); }

// --- risk ---
{ // snipper cuts the trail
  const W = LS.create('snipT'); W.started = true; W.t = 1; W.wave = 2;
  W.trail = []; for (let i = 0; i < 30; i++) W.trail.push({ x: 60 + i * 5, y: 200, t: 0.5 + i * 0.01 });
  W.critters = [{ id: 99, type: 'snip', x: 120, y: 203, a: 0, v: 0, r: 9, t: 0, state: 'live', dropT: 0, turnT: 9 }];
  W.sk.x = 300; W.sk.y = 500; LS.step(W, dt, 0); const ev = drain(W);
  ok(ev.some(e => e.k === 'snip') && W.trail.length < 30 && W.trail[0].x > 120, 'a snipper on your trail cuts off the older part', 'trail now ' + W.trail.length + ' points'); }
{ // fresh hole is safe while you are on it; skating back in later is a plunge
  const r = circleRun('loopB', 90, 520, 50, 1); const W = r.W; LS.step(W, dt, W.sk.a);
  ok(!W.over, 'closing a loop does not drop you into your own crack');
  // now steer out and come back through the middle while it is still open
  let t = 0, armed = false; const h = W.holes[0];
  while (!W.over && t < 3) { const out = Math.atan2(W.sk.y - h.c.y, W.sk.x - h.c.x); LS.step(W, dt, armed ? out + Math.PI : out); drain(W); if (h.armed) armed = true; t += dt; }
  ok(W.over && W.cause === 'water', 'leaving your crack and skating back into the open water ends the run', W.cause + ' after ' + t.toFixed(2) + ' s'); }
{ // burrbug bite
  const W = LS.create('bite'); W.started = true; W.critters = [{ id: 50, type: 'burr', x: W.sk.x, y: W.sk.y - 30, a: Math.PI / 2, v: 60, r: 10, t: 0, state: 'live', dropT: 0, turnT: 9 }];
  let t = 0; while (!W.over && t < 2) { LS.step(W, dt, -Math.PI / 2); drain(W); t += dt; }
  ok(W.over && W.cause === 'bite', 'touching a burrbug ends the run', t.toFixed(2) + ' s'); }
{ // idle after starting: the pond thaws
  const W = B.run('idle', B.idleBot()); ok(W.over && W.cause === 'thaw' && Math.abs(W.t - LS.waveSpec(1).time) < 0.05, 'a player who stops steering is ended by the thaw timer', W.t.toFixed(2) + ' s'); }
{ // never touching the screen never starts the clock
  const W = LS.create('wait'); for (let i = 0; i < 600; i++) LS.step(W, dt, null); ok(!W.started && W.t === 0 && !W.over, 'the timer waits for the first drag'); }

// --- combos ---
{ const W = LS.create('combo'); W.started = true; W.t = 5;
  const box = (x, y, s) => [{ x: x - s, y: y - s }, { x: x + s, y: y - s }, { x: x + s, y: y + s }, { x: x - s, y: y + s }];
  W.critters = [1, 2, 3].map(i => ({ id: 10 + i, type: 'puff', x: 80 * i, y: 300, a: 0, v: 0, r: 9, t: 0, state: 'live', dropT: 0, turnT: 9 })).concat([{ id: 30, type: 'puff', x: 100, y: 500, a: 0, v: 0, r: 9, t: 0, state: 'live', dropT: 0, turnT: 9 }]);
  LS.closeLoop(W, box(80, 300, 25)); W.t += 1; LS.closeLoop(W, box(160, 300, 25)); W.t += 1; LS.closeLoop(W, box(240, 300, 25));
  ok(W.combo === 3 && W.score === 10 + 15 + 20, 'loops closed within the combo window climb x1, x1.5, x2', 'combo ' + W.combo + ' score ' + W.score);
  W.t += 5; W.critters.push({ id: 40, type: 'puff', x: 300, y: 100, a: 0, v: 0, r: 9, t: 0, state: 'live', dropT: 0, turnT: 9 }); LS.closeLoop(W, box(300, 100, 25));
  ok(W.combo === 1, 'a slow loop starts the combo over'); }

// --- every bot run ends ---
{ let worst = 0, all = true, n = 0;
  for (const [name, mk] of [['orbit', s => B.orbitBot({ seed: s })], ['human', s => B.orbitBot({ seed: s, noise: 0.35, react: 0.25, greed: 3 })], ['careless', s => B.orbitBot({ seed: s, care: 0 })], ['random', s => B.randomBot({ seed: s })], ['idle', () => B.idleBot()], ['straight', () => B.straightBot()]]) {
    for (let s = 1; s <= 100; s++) { const W = B.run(name + s, mk(s), {}, 900); n++; if (!W.over) all = false; worst = Math.max(worst, W.t); }
  }
  ok(all, 'every run ends, for all 6 bots over 100 seeds each', n + ' runs, longest ' + worst.toFixed(0) + ' s'); }

// --- difficulty ramps ---
{ const reach = Array(30).fill(0), clr = Array(30).fill(0), T = [];
  for (let s = 1; s <= 300; s++) { const W = B.run('ramp' + s, B.orbitBot({ seed: s })); T.push(W.t); for (let w = 1; w <= W.wave; w++) reach[w]++; for (let w = 1; w <= W.stats.waves; w++) clr[w]++; }
  const rate = w => reach[w] ? clr[w] / reach[w] : 0;
  const row = []; for (let w = 1; w <= 8; w++) row.push('w' + w + ' ' + Math.round(rate(w) * 100) + '%');
  ok(rate(1) > 0.95 && rate(2) > rate(3) && rate(3) >= rate(5) && rate(5) > rate(6), 'waves get harder: the orbit bot clears fewer of each later wave', row.join(', '));
  T.sort((a, b) => a - b); ok(T[150] > 30 && T[150] < 120, 'a typical bot run lasts about a minute', 'median ' + T[150].toFixed(0) + ' s, p90 ' + T[270].toFixed(0) + ' s');
  const s1 = LS.waveSpec(1), s8 = LS.waveSpec(8); ok(s8.puff + s8.snip + s8.burr > s1.puff * 3 && LS.speedOf('burr', 8) > LS.speedOf('burr', 3), 'later waves have more and faster critters'); }
{ // skill matters: a careful bot beats a careless one and a random one
  const mean = mk => { let s = 0; for (let i = 1; i <= 120; i++) s += B.run('skill' + i, mk(i)).score; return s / 120; };
  const good = mean(s => B.orbitBot({ seed: s })), care0 = mean(s => B.orbitBot({ seed: s, care: 0 })), rnd = mean(s => B.randomBot({ seed: s }));
  ok(good > care0 * 1.1 && care0 > rnd * 20, 'watching for open water and burrbugs pays off', 'careful ' + good.toFixed(0) + ', careless ' + care0.toFixed(0) + ', random ' + rnd.toFixed(0)); }

// --- performance of the rules ---
{ const W = LS.create('perf'); W.started = true; for (let w = 2; w <= 12; w++) LS.waveSpec(w);
  W.wave = 12; W.critters = []; for (let i = 0; i < 20; i++) W.critters.push({ id: 100 + i, type: ['puff', 'snip', 'burr'][i % 3], x: 40 + (i * 37) % 280, y: 60 + (i * 53) % 520, a: i, v: 50, r: 9, t: 0, state: 'live', dropT: 0, turnT: 1 });
  W.critters.forEach(c => { if (c.type === 'burr') { c.x = 30; c.y = 600; } });
  for (let k = 0; k < 6; k++) { const pts = []; for (let i = 0; i < 60; i++) { const a = i / 60 * 6.283; pts.push({ x: 60 + k * 45 + Math.cos(a) * 40, y: 120 + k * 70 + Math.sin(a) * 40 }); } W.holes.push({ poly: pts, t: 1, box: { x0: 0, y0: 0, x1: 360, y1: 640 }, id: 900 + k, armed: true, c: { x: 60 + k * 45, y: 120 + k * 70 } }); }
  W.trail = []; for (let i = 0; i < 100; i++) W.trail.push({ x: 300 - i * 0.5, y: 600 - i * 3, t: W.t });
  W.sk.x = 330; W.sk.y = 40;
  const t0 = process.hrtime.bigint(); let n = 0; while (n < 600 && !W.over) { LS.step(W, dt, W.sk.a + 0.02); drain(W); n++; W.holes.forEach(h => { h.t = 1; }); }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / n;
  ok(ms < 1, 'a crowded late-wave step (20 critters, 6 open holes, long trail) costs well under 1 ms', ms.toFixed(3) + ' ms per step over ' + n + ' steps'); }

console.log('\nTOTAL', pass, 'pass', fail, 'fail'); process.exit(fail ? 1 : 0);
