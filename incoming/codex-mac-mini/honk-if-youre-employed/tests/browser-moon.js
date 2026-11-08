// Playwright acceptance pilot: ordinary input events, read-only observations, no world writes.
// Load moon.html (source served over HTTP or standalone build), then run this function.
async (page) => {
  const start = page.getByRole('button', { name: 'CLOCK IN' });
  if (await start.count()) await start.click();
  const resume = page.getByRole('button', { name: 'BACK TO THE NONSENSE' });
  if (await resume.count()) await resume.click();
  return page.evaluate(() => {
    const held = new Set(), log = [], canvas = document.getElementById('moon-canvas');
    const options = window.__moonPilotOptions || {};
    let stopped = false, lastPhase = '', lastHP = 0, dashCount = 0, burpCount = 0;
    function key(code, down) {
      if (down === held.has(code)) return;
      down ? held.add(code) : held.delete(code);
      window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, bubbles: true }));
    }
    const tap = code => { key(code, true); key(code, false); };
    const release = () => { for (const code of [...held]) key(code, false); };
    function stop() { clearInterval(timer); release(); stopped = true; }
    function drive() {
      if (stopped) return;
      const s = window.__moon.inspect(), w = s.world;
      if (!w) return;
      const p = w.player, phase = `${w.cycle}:${w.shift}:${w.phase}`;
      if (phase !== lastPhase) { log.push({ phase, tick: w.tick, hp: p.hp, score: w.score, seed: w.seed }); lastPhase = phase; }
      if (p.hp < lastHP) log.push({ hurt: w.tick, hp: p.hp }); lastHP = p.hp;
      if (w.phase === 'won' && w.cycle < (options.overtimeCycles || 0)) { release(); document.querySelector('[data-action="overtime"]')?.click(); return; }
      if (w.phase === 'won' || w.phase === 'lost') { stop(); return; }
      if (w.phase === 'upgrade') {
        release();
        if (options.stopAtUpgrade) { stop(); return; }
        const order = p.hp < 3 ? ['heart', 'power', 'spread', 'severance', 'magnet', 'rapid', 'orbit', 'burp', 'tips', 'pierce', 'refund', 'ricochet'] : ['power', 'spread', 'severance', 'magnet', 'rapid', 'orbit', 'heart', 'burp', 'tips', 'pierce', 'refund', 'ricochet'];
        const choice = order.find(id => w.offers.includes(id)) || w.offers[0];
        document.querySelector(`[data-upgrade="${choice}"]`)?.click(); return;
      }
      if (s.paused) { release(); return; }
      const active = w.enemies.filter(e => !e.spawn);
      const nearest = active.slice().sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
      const drops = w.drops.slice().sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
      let goal;
      if (options.seekPortal && !w.stats.portals && w.portals.length) goal = w.portals[0];
      else if (!w.boss && p.bag >= Math.min(4, w.quota - w.rent)) goal = w.moon;
      else if (drops.length && (!w.boss || Math.hypot(drops[0].x - p.x, drops[0].y - p.y) < 200)) goal = drops[0];
      else if (w.boss) goal = { x: 640 + Math.cos(w.tick / 160) * 380, y: 400 + Math.sin(w.tick / 160) * 120 };
      else goal = nearest || { x: 640, y: 440 };
      let dx = goal.x - p.x, dy = goal.y - p.y;
      const length = Math.hypot(dx, dy) || 1;
      dx /= length; dy /= length;
      let danger = false;
      for (const e of active) {
        const ex = p.x - e.x, ey = p.y - e.y, d = Math.hypot(ex, ey) || 1;
        if (d < 115) { dx += ex / d * (115 - d) / 28; dy += ey / d * (115 - d) / 28; }
        if (d < 70) danger = true;
      }
      for (const bullet of w.shots.filter(b => b.enemy)) {
        const bx = p.x - bullet.x, by = p.y - bullet.y, d = Math.hypot(bx, by) || 1;
        if (d < 90) { dx += bx / d * (90 - d) / 22; dy += by / d * (90 - d) / 22; }
        if (d < 58) danger = true;
      }
      for (const h of w.hazards) {
        const hx = p.x - h.x, hy = p.y - h.y, d = Math.hypot(hx, hy) || 1;
        if (d < h.radius + 55) { dx += hx / d * 3.5; dy += hy / d * 3.5; }
        if (d < h.radius + 15 && h.warning < 20) danger = true;
      }
      if (p.x < 70) dx += 2; if (p.x > 1210) dx -= 2; if (p.y < 80) dy += 2; if (p.y > 570) dy -= 2;
      key('KeyD', dx > 0.25); key('KeyA', dx < -0.25); key('KeyS', dy > 0.25); key('KeyW', dy < -0.25);
      key('Space', true);
      if (danger && p.dashCooldown === 0) { tap('ShiftLeft'); dashCount++; }
      if (p.burp >= 100 && (active.length > 3 || w.boss || danger)) { tap('KeyE'); burpCount++; }
    }
    const timer = setInterval(drive, 16);
    window.__moonPilot = { stop, status: () => ({ stopped, log, dashCount, burpCount, state: window.__moon.inspect() }) };
    canvas.focus(); return { started: true };
  });
}
