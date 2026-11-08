import { strict as assert } from 'node:assert';
import { lightPilot } from './last-light-bot.js';

export async function readLight(page) {
  return page.evaluate(async () => {
    const app = await import('/src/last-light-main.js');
    return { world: app.inspectLight(), ui: app.inspectLightStatus() };
  });
}

/** Drives only public UI inputs. Does not mutate world state or bypass decisions.
 * Playwright's virtual clock exercises the real requestAnimationFrame loop.
 */
export function createLightBrowserPilot(page, { path = ['fork', 'sentinel', 'precision', 'closed'], ending = 'keep', allowPulse = true, quantum = 160 } = {}) {
  let held = new Set(), aiming = false, steps = 0;
  const visited = [], snapshots = [], bossPhases = new Set(); let beamsObserved = 0, wardensObserved = 0;
  async function release() {
    for (const key of held) await page.keyboard.up(key);
    held.clear(); if (aiming) await page.mouse.up(); aiming = false;
  }
  async function advance(limit = 80, { stopAtCouncil = false, stopAtEnding = false } = {}) {
    for (let i = 0; i < limit; i++) {
      const { world: w, ui } = await readLight(page);
      assert.ok(w, 'Pilot requires a started run');
      for (const enemy of w.enemies) if (enemy.kind === 'boss') bossPhases.add(enemy.phase);
      if (w.beams.length) beamsObserved++;
      if (w.enemies.some(e => e.kind === 'warden')) wardensObserved++;
      if (w.phase === 'lost' || w.phase === 'won') { await release(); return { done: true, phase: w.phase, wave: w.wave, stats: w.stats, visited, steps, bossPhases: [...bossPhases], beamsObserved, wardensObserved }; }
      if (w.phase === 'council') {
        if (stopAtCouncil) { await release(); return { done: false, phase: 'council', wave: w.wave, steps }; }
        await release(); visited.push(`council-${w.wave}`); snapshots.push({ wave: w.wave, hp: w.player.hp, archive: w.beacon.hp, rescued: w.stats.rescued });
        const requested = page.locator(`[data-choice="${path[w.wave - 1]}"]`);
        const target = await requested.isEnabled() ? requested : page.locator('[data-choice]:not([disabled])').first();
        await target.click(); continue;
      }
      if (w.phase === 'ending') {
        if (stopAtEnding) { await release(); return { done: false, phase: 'ending', wave: w.wave, steps }; }
        await release(); visited.push('final-decision');
        await page.locator(`[data-ending="${ending}"]`).click(); continue;
      }
      if (ui.paused || ui.screen) throw new Error(`Unexpected modal/paused state: ${JSON.stringify(ui)}`);
      const input = lightPilot(w);
      // Keyboard directions approximate the per-tick Node pilot; no aim or state teleporting.
      const desired = new Set();
      if (input.moveX < -.2) desired.add('a'); if (input.moveX > .2) desired.add('d');
      if (input.moveY < -.2) desired.add('w'); if (input.moveY > .2) desired.add('s');
      for (const key of held) if (!desired.has(key)) await page.keyboard.up(key);
      for (const key of desired) if (!held.has(key)) await page.keyboard.down(key);
      held = desired;
      if (input.manualAim) {
        const box = await page.locator('#arena').boundingBox();
        await page.mouse.move(box.x + input.aimX / 1100 * box.width, box.y + input.aimY / 740 * box.height);
        if (!aiming) { await page.mouse.down(); aiming = true; }
      } else if (aiming) { await page.mouse.up(); aiming = false; }
      if (input.dashPressed && w.player.dashCooldown === 0) await page.keyboard.press('Space');
      if (allowPulse && input.pulsePressed && w.player.pulseCooldown === 0) await page.keyboard.press('e');
      await page.clock.runFor(quantum); steps++;
      if (steps > 4000) throw new Error('Pilot exceeded its bounded run duration');
    }
    const { world: w } = await readLight(page);
    return { done: false, phase: w.phase, wave: w.wave, tick: w.tick, health: Math.round(w.player.hp), archive: Math.round(w.beacon.hp), stats: w.stats, visited, steps, snapshots };
  }
  return { advance, release };
}
