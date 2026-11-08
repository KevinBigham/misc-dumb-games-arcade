// Playwright tool snippet, not shipped. Run with browser_run_code_unsafe filename.
// Drives ordinary keyboard/mouse events using read-only observations, never game writes.
async (page) => {
  await page.goto('http://localhost:4173/echo.html?seed=1776');
  await page.getByRole('button', { name: 'ENTER THE REQUIEM' }).click();
  return page.evaluate(() => {
    const canvas = document.querySelector('#game');
    const held = new Set(), log = [];
    let nextFork = 259, lastPhase = '', stopped = false;
    const directions = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    function key(code, down) {
      if (down === held.has(code)) return;
      if (down) held.add(code); else held.delete(code);
      window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, bubbles: true }));
    }
    function tap(code) { key(code, true); key(code, false); }
    function release() {
      for (const code of [...held]) key(code, false);
      window.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true }));
    }
    function stop() { stopped = true; clearInterval(timer); release(); }
    function drive() {
      if (stopped) return;
      const s = window.__echoRequiem.inspect();
      const phase = `${s.phase}:${s.act}:${s.boss?.phase || 0}`;
      if (phase !== lastPhase) {
        log.push({ phase: s.phase, act: s.act, bossPhase: s.boss?.phase || 0, tick: s.tick, hp: s.player.hp, score: s.score });
        lastPhase = phase;
      }
      if (s.phase === 'won' || s.phase === 'lost') { stop(); return; }
      if (s.phase === 'upgrade') {
        release();
        const preference = ['damage', 'echo', 'fire-rate', 'vitality', 'pierce', 'fork-burst'];
        const offer = preference.map(id => s.offers.find(o => o.id === id)).find(Boolean) || s.offers[0];
        if (offer) document.querySelector(`[data-upgrade="${offer.id}"]`)?.click();
        return;
      }
      if (s.screen !== 'playing' || s.paused) { release(); return; }
      const p = s.player, rx = p.x - 640, ry = p.y - 360;
      const r = Math.hypot(rx, ry) || 1, correction = (225 - r) / 80;
      const dx = r === 1 ? 1 : -ry / r + rx / r * correction;
      const dy = r === 1 ? 0 : rx / r + ry / r * correction;
      const octant = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
      const [mx, my] = directions[octant];
      key('KeyD', mx > 0); key('KeyA', mx < 0); key('KeyS', my > 0); key('KeyW', my < 0);
      const enemies = s.enemies.filter(e => e.spawnTicks === 0);
      enemies.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
      const target = s.boss || enemies[0] || { x: 640, y: 360 };
      const rect = canvas.getBoundingClientRect(), scale = Math.min(rect.width / 1280, rect.height / 720);
      const clientX = rect.left + (rect.width - 1280 * scale) / 2 + target.x * scale;
      const clientY = rect.top + (rect.height - 720 * scale) / 2 + target.y * scale;
      window.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, pointerType: 'mouse', bubbles: true }));
      canvas.dispatchEvent(new MouseEvent('mousedown', { clientX, clientY, button: 0, buttons: 1, bubbles: true }));
      if (s.tick >= nextFork && p.forkCharges > 0 && p.historyLength >= 60) { tap('Space'); nextFork = s.tick + 260; }
      if (p.dashCooldown === 0 && s.projectiles.some(b => Math.hypot(b.x - p.x, b.y - p.y) < 35)) tap('ShiftLeft');
    }
    const timer = setInterval(drive, 16);
    window.__playtest = { log, stop, status: () => ({ stopped, log, game: window.__echoRequiem.inspect(), perf: window.__echoRequiem.performance() }) };
    return { started: true, seed: 1776, mode: 'keyboard eight-direction input, no simulation writes' };
  });
}
