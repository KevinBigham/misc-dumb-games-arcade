// Standalone Playwright acceptance. No added game/runtime dependency.
// Use an existing Playwright installation: HONK_PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs
// Optional: HONK_BROWSER_CHANNEL=chrome, HONK_HEADED=1, HONK_URL=http://localhost:4173/src/honk/index.html
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, isAbsolute } from 'node:path';
import { honkPilot, HONK_PILOT_UPGRADES } from './honk-pilot.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'output/playwright/honk');
const url = process.env.HONK_URL || pathToFileURL(resolve(root, 'src/honk/Honk_If_Youre_Employed.html')).href;
const report = { status: 'running', checks: [], errors: [], externalRequests: [], screenshots: [], results: [] };
await mkdir(output, { recursive: true });
let browser, page;
function check(name) { report.checks.push(name); console.log(`PASS ${name}`); }
async function shot(name) {
  const filename = `${name}.png`;
  await page.screenshot({ path: resolve(output, filename), fullPage: true }); report.screenshots.push(filename);
}
async function snapshot() { return page.evaluate(() => window.__honk.inspect()); }
async function click(selector) { assert.equal(await page.locator(selector).isVisible(), true, `${selector} is visible`); await page.locator(selector).click({ force: true }); }
async function advance(ms) { await page.clock.runFor(ms); }
async function release(keys) { for (const key of keys) await page.keyboard.up(key); keys.clear(); }

async function playToEnding(label) {
  const held = new Set(); let promoted = 0, savedBoss = false;
  for (let step = 0; step < 1600; step++) {
    const s = await snapshot();
    if (['won', 'lost'].includes(s.phase)) {
      await release(held); await advance(120);
      report.results.push({ label, phase: s.phase, score: s.score, seed: s.seed, mode: s.mode, overtime: s.overtime, stats: s.stats });
      assert.equal(s.phase, 'won', `${label}: complete with real keyboard actions`);
      await shot(label); return s;
    }
    assert.equal(s.paused, false, `${label} unexpectedly paused`);
    if (s.phase === 'promotion') {
      await release(held); const tick = s.tick; await advance(500);
      assert.equal((await snapshot()).tick, tick, 'promotion freezes simulation');
      await shot(`${label}-promotion-${++promoted}`);
      const choice = HONK_PILOT_UPGRADES.find(id => s.offers.includes(id));
      await click(`[data-upgrade="${choice}"]`); continue;
    }
    if (!savedBoss && s.enemies.some(e => e.kind === 'boss' && e.bossPhase >= 2)) { await shot(`${label}-hr`); savedBoss = true; }
    const move = honkPilot(s), wanted = new Set(['Space']);
    if (move.x < -.25) wanted.add('a'); if (move.x > .25) wanted.add('d');
    if (move.y < -.25) wanted.add('w'); if (move.y > .25) wanted.add('s');
    for (const key of held) if (!wanted.has(key)) { await page.keyboard.up(key); held.delete(key); }
    for (const key of wanted) if (!held.has(key)) { await page.keyboard.down(key); held.add(key); }
    if (move.reply) await page.keyboard.press('e');
    if (move.dash) await page.keyboard.press('Shift');
    await advance(100);
  }
  throw new Error(`${label} never reached an ending`);
}

try {
  const configured = process.env.HONK_PLAYWRIGHT_MODULE || 'playwright';
  const { chromium } = await import(isAbsolute(configured) ? pathToFileURL(configured).href : configured);
  try {
    browser = await chromium.launch({ headless: process.env.HONK_HEADED !== '1', ...(process.env.HONK_BROWSER_CHANNEL ? { channel: process.env.HONK_BROWSER_CHANNEL } : {}) });
  } catch (error) {
    report.status = 'blocked'; report.blocker = 'Playwright could not launch its browser in this environment.'; throw error;
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce' });
  page = await context.newPage(); page.setDefaultTimeout(5000);
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('request', request => { if (/^https?:/.test(request.url()) && !request.url().startsWith(new URL(url).origin + '/')) report.externalRequests.push(request.url()); });
  await page.clock.install({ time: new Date('2026-11-08T12:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-08T12:00:01Z'));
  await page.goto(url); await advance(120);
  assert.equal((await snapshot()).screen, 'title');
  assert.equal(await page.locator('#title-screen').isVisible(), true); await shot('title');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  check('portable title loads without external assets or horizontal overflow');

  await click('#help-button'); assert.equal(await page.locator('#help-dialog').isVisible(), true);
  await click('#help-done'); await click('#career-button');
  assert.equal(await page.locator('#award-grid .award').count(), 9);
  await page.locator('#office-code').fill('not a goose'); await click('#seed-form button');
  assert.match(await page.locator('#seed-message').innerText(), /Use a code/);
  await page.locator('#auto-honk').check({ force: true });
  await page.locator('#reduced-motion').check({ force: true });
  await page.locator('#office-code').fill('G-7321-F'); await click('#seed-form button');
  assert.equal((await snapshot()).mode, 'casual'); assert.equal((await snapshot()).player.maxHp, 9);
  await page.reload(); await advance(120);
  const preferences = await page.evaluate(() => window.__honk.profile().settings);
  assert.equal(preferences.autoHonk, true); assert.equal(preferences.reducedMotion, true); assert.equal(preferences.mode, 'casual');
  check('instructions, invalid code rejection, mode selection and saved accessibility preferences');

  await click('#start-button'); await advance(200); const before = await snapshot();
  await page.keyboard.down('d'); await advance(400); await page.keyboard.up('d');
  let s = await snapshot(); assert.ok(s.player.x > before.player.x + 50); assert.ok(s.stats.honks > 0);
  await page.keyboard.press('Shift'); await advance(80); assert.ok((await snapshot()).player.dashCooldown > 0);
  await page.keyboard.press('Escape'); const pausedTick = (await snapshot()).tick; await advance(1500);
  assert.equal((await snapshot()).tick, pausedTick);
  await click('#pause-options'); await click('#career-done'); assert.equal((await snapshot()).paused, true, 'settings preserve an existing pause');
  await click('#resume-button'); await advance(200); assert.ok((await snapshot()).tick > pausedTick);
  await click('#help-button'); const helpTick = (await snapshot()).tick; await advance(300);
  assert.equal((await snapshot()).tick, helpTick); await click('#help-done'); assert.equal((await snapshot()).paused, false);
  await click('#sound-button'); assert.equal((await snapshot()).muted, true);
  check('keyboard movement, auto-honk, dash, pause, nested settings, help pause/resume, mute');

  // Reload starts a fresh workday; no live-run state is injected or rewritten.
  await page.goto(`${url.split('?')[0]}?seed=G-7321-F`); await advance(120); await click('#start-button');
  const won = await playToEnding('career-victory');
  assert.ok(won.stats.bosses === 1 && won.upgrades.length === 2);
  assert.equal(await page.locator('#overtime-button').isVisible(), true);
  let profile = await page.evaluate(() => window.__honk.profile());
  assert.ok(profile.awards.includes('ceo')); assert.equal(profile.wins, 1); assert.equal(profile.best.casual, won.score);
  check('both promotions, final HR fight, victory review, saved award and best score');

  await click('#overtime-button'); s = await snapshot();
  assert.equal(s.overtime, 1); assert.equal(s.charge, 100); assert.equal(s.player.hp, s.player.maxHp);
  const overtime = await playToEnding('overtime-victory');
  assert.equal(overtime.stats.bosses, 2);
  profile = await page.evaluate(() => window.__honk.profile()); assert.equal(profile.runs, 1); assert.equal(profile.wins, 1);
  await click('#home-button'); await click('#career-button');
  await page.locator('#tie-select').selectOption('gold'); await click('#career-done');
  await page.reload(); await advance(120);
  profile = await page.evaluate(() => window.__honk.profile()); assert.equal(profile.settings.tie, 'gold'); assert.ok(profile.best.casual >= overtime.score);
  check('overtime, single-career accounting, gold-tie unlock and record persistence');

  await click('#daily-button'); s = await snapshot(); assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(s.daily)); assert.equal(s.mode, 'career');
  check('daily office starts in Career mode');
  await page.reload(); await advance(120);
  await page.setViewportSize({ width: 390, height: 844 }); await advance(120); await shot('narrow-title');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await click('#career-button'); await shot('narrow-personnel');
  assert.equal(await page.evaluate(() => { const r = document.querySelector('#career-dialog').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.height <= innerHeight; }), true);
  check('narrow title and scrollable personnel dialog fit the viewport');

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobile = await mobileContext.newPage(); mobile.on('pageerror', error => report.errors.push(error.message));
  await mobile.goto(url); await mobile.locator('#start-button').tap();
  assert.equal(await mobile.locator('[data-key="ArrowUp"]').isVisible(), true);
  await mobile.locator('[data-key="Space"]').tap();
  await mobile.waitForFunction(() => window.__honk.inspect().stats.honks > 0);
  await mobile.keyboard.press('Escape');
  assert.equal(await mobile.locator('#pause-screen').isVisible(), true);
  await mobile.screenshot({ path: resolve(output, 'touch-controls.png'), fullPage: true }); report.screenshots.push('touch-controls.png');
  await mobileContext.close(); check('touch controls appear and accept input');
  assert.deepEqual(report.errors, []); assert.deepEqual(report.externalRequests, []);
  report.status = 'passed';
} catch (error) {
  if (report.status !== 'blocked') report.status = browser ? 'failed' : 'blocked';
  report.error = String(error.stack || error);
  if (page && browser?.isConnected()) { try { await shot('failure'); } catch { /* Preserve primary failure. */ } }
  process.exitCode = 1; console.error(report.blocker || 'Acceptance did not complete.', error.message);
} finally {
  await browser?.close();
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Report: ${resolve(output, 'report.json')}`);
}
