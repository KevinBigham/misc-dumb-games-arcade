// Playwright snippet: synthetic renderer load, separate from normal-run acceptance.
async (page) => page.evaluate(async () => {
  const [{ createRenderer }, { createWorld }] = await Promise.all([
    import('./src/view/renderer.js'), import('./src/sim/world.js'),
  ]);
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', zIndex: '9999' });
  document.body.append(canvas);
  const renderer = createRenderer(canvas);
  renderer.resize(innerWidth, innerHeight, 1.5);
  const world = createWorld(992);
  world.act = 4; world.tick = 12000;
  let seed = 992;
  const random = () => { seed = Math.imul(1664525, seed) + 1013904223 | 0; return (seed >>> 0) / 4294967296; };
  const pose = () => { const a = random() * Math.PI * 2, r = Math.sqrt(random()) * 280; return { x: 640 + Math.cos(a) * r, y: 360 + Math.sin(a) * r }; };
  world.enemies = Array.from({ length: 64 }, (_, i) => {
    const p = pose();
    return { id: i + 1, kind: ['chaser', 'sentry', 'lancer'][i % 3], ...p, prevX: p.x, prevY: p.y, aim: random() * 6.28, hp: 30, maxHp: 60, radius: 16, spawnTicks: 0, windupTicks: i % 3 === 2 ? 20 : 0, chargeTicks: 0, chargeAngle: random() * 6.28 };
  });
  world.projectiles = Array.from({ length: 512 }, (_, i) => {
    const p = pose();
    return { id: i + 100, ...p, prevX: p.x - 1, prevY: p.y - 1, vx: 100, vy: 120, radius: i < 384 ? 5 : 3, owner: i < 384 ? 'enemy' : i % 2 ? 'player' : 'echo' };
  });
  world.player.history = Array.from({ length: 240 }, (_, i) => ({ x: 640 + Math.cos(i / 70) * 180, y: 360 + Math.sin(i / 70) * 180, aim: i / 70, shots: [] }));
  world.echoes = [0, 1].map(i => ({ id: i + 900, x: 500 + i * 200, y: 450, prevX: 500 + i * 200, prevY: 450, aim: 1, frames: world.player.history, index: 150 }));
  world.boss = { x: 640, y: 318, radius: 44, hp: 7000, maxHp: 12000, phase: 2, angle: 0.8, telegraphs: [{ angle: 2, remainingTicks: 20, durationTicks: 48, width: 24, activeTicks: 12 }] };
  const renderTimes = [], intervals = [];
  let prior = performance.now();
  for (let i = 0; i < 180; i++) {
    const now = await new Promise(requestAnimationFrame);
    if (i > 10) intervals.push(now - prior);
    prior = now;
    renderer.consume(Array.from({ length: 10 }, () => ({ type: 'kill', tick: world.tick, ...pose(), owner: 'player', kind: 'sentry' })));
    const start = performance.now();
    renderer.draw(world, 0.5, 1 / 60);
    if (i > 10) renderTimes.push(performance.now() - start);
  }
  const summary = values => {
    values.sort((a, b) => a - b);
    return { median: values[Math.floor(values.length / 2)], p95: values[Math.floor(values.length * 0.95)], max: values.at(-1) };
  };
  renderer.destroy(); canvas.remove();
  return { kind: 'synthetic renderer stress', viewport: [innerWidth, innerHeight], dpr: 1.5, enemies: 64, projectiles: 512, echoes: 2, continuouslySaturatedParticles: 700, samples: renderTimes.length, renderMs: summary(renderTimes), frameMs: summary(intervals) };
})
