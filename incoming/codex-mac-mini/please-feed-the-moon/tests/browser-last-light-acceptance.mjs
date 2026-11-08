/** Run with the available Playwright package path as argument; no game dependency.
 * node tests/browser-last-light-acceptance.mjs /absolute/path/to/playwright/package.json
 */
import { createRequire } from 'node:module';
import { strict as assert } from 'node:assert';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createStaticServer } from '../scripts/serve.mjs';
import { createLightBrowserPilot, readLight } from './browser-last-light.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'output/last-light'); await mkdir(output, { recursive: true });
const packagePath = process.argv[2];
if (!packagePath) throw new Error('Pass the installed Playwright package.json path.');
const { chromium } = createRequire(packagePath)('playwright');
const server = createStaticServer(root); await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const report = { started: new Date().toISOString(), base, checks: [], runs: [], errors: [], screenshots: [] };
const emit = (event, data) => console.log(JSON.stringify({ event, ...data }));
const checkpointReport = () => writeFile(join(output, 'acceptance.json'), JSON.stringify(report, null, 2) + '\n');
let currentPage;
async function contextPage(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
  const page = await context.newPage(); page.setDefaultTimeout(6000); page.setDefaultNavigationTimeout(10000);
  page.on('pageerror', e => report.errors.push(e.message));
  await page.clock.install({ time: new Date('2026-11-08T04:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-08T04:00:01Z'));
  currentPage = page; return { context, page };
}
async function advance(page, milliseconds) {
  while (milliseconds > 0) { const slice = Math.min(160, milliseconds); await page.clock.runFor(slice); milliseconds -= slice; }
}
async function shot(page, name) {
  await page.screenshot({ path: join(output, name), fullPage: true }); report.screenshots.push(name);
}
async function start(page, mode = 'standard', promise = 'none') {
  await page.getByRole('radio', { name: mode === 'story' ? 'STORY less pressure' : 'STANDARD', exact: true }).check();
  await page.locator('#begin').click(); await page.locator(`[data-promise="${promise}"]`).click(); await advance(page, 32);
}
async function coreUi(page) {
  emit('stage', { name: 'core-ui' });
  await page.goto(`${base}/last-light.html?seed=42`);
  await shot(page, 'title-desktop.png');
  await page.locator('#motion').click(); // Remove transitions from the controlled-clock acceptance run.
  await page.locator('#sound').click();
  await start(page, 'story', 'memory');
  await page.keyboard.down('a'); await advance(page, 700); await page.keyboard.up('a');
  await page.keyboard.down('d'); await advance(page, 700); await page.keyboard.up('d');
  await page.keyboard.down('w'); await advance(page, 400); await page.keyboard.up('w');
  let { world } = await readLight(page); assert.ok(world.stats.rescued >= 3, 'Recruit and delivery must work through keyboard input');
  await page.keyboard.press('Escape'); const pausedTick = world.tick; await advance(page, 1000);
  assert.equal((await readLight(page)).world.tick, pausedTick, 'Pause must freeze ticks');
  await page.locator('[data-action="review"]').click();
  await page.locator('#overlay [data-protect]').first().click(); const protectedId = (await readLight(page)).world.protectedId;
  await page.locator('[data-action="back-review"]').click(); await page.locator('[data-action="resume"]').click();
  await page.keyboard.press('e'); await advance(page, 160);
  ({ world } = await readLight(page)); assert.equal(world.stats.burned, 1); assert.ok(world.promise.broken); assert.equal(world.memories.find(m => m.id === protectedId).status, 'kept');
  await page.keyboard.press('j'); const ledgerTick = world.tick; await advance(page, 320); assert.equal((await readLight(page)).world.tick, ledgerTick);
  assert.ok((await page.locator('.ledger-list').innerText()).includes('lost a memory'));
  await page.locator('[data-action="back-ledger"]').click();
  await page.keyboard.press('Escape'); await page.locator('[data-action="restart-confirm"]').click(); await page.locator('[data-action="retry"]').click(); await page.locator('[data-action="cancel-start"]').click();
  assert.equal((await readLight(page)).ui.screen, 'pause', 'Cancel restart must return to a resumable pause');
  await page.locator('[data-action="resume"]').click(); await advance(page, 160);
  await page.evaluate(() => window.dispatchEvent(new Event('blur'))); assert.equal((await readLight(page)).ui.screen, 'pause');
  await page.locator('[data-action="checkpoint-home"]').click(); await page.reload(); await page.locator('#resume-saved').click();
  ({ world } = await readLight(page)); assert.equal(world.tick, 0); assert.equal(world.stats.burned, 0); assert.equal(world.promise.id, 'memory');
  await page.keyboard.press('Escape'); await page.locator('[data-action="checkpoint-home"]').click();
  report.checks.push('keyboard rescue/delivery', 'pause and ledger freeze', 'protected memory pulse', 'promise break', 'restart cancellation', 'blur auto-pause', 'reload night-start recovery');
  await checkpointReport();
}
async function playRun(page, spec, index) {
  emit('stage', { name: `run-${index}`, spec });
  await start(page, spec.mode, spec.promise);
  const pilot = createLightBrowserPilot(page, { path: spec.path, ending: spec.ending, allowPulse: spec.allowPulse });
  if (index === 1) {
    let status;
    do { status = await pilot.advance(180, { stopAtCouncil: true }); } while (status.phase !== 'council' && !status.done);
    assert.equal(status.phase, 'council'); await shot(page, 'council.png');
    await page.locator('[data-action="review"]').click(); await page.locator('#overlay [data-protect]').first().click();
    const protectedId = (await readLight(page)).world.protectedId;
    await page.locator('[data-action="back-review"]').click(); await page.reload(); await page.locator('#resume-saved').click();
    const restored = await readLight(page); assert.equal(restored.world.phase, 'council'); assert.equal(restored.world.protectedId, protectedId);
    report.checks.push('council reload recovery preserves protected memory');
  }
  let status, finalCheckpointChecked = false;
  do {
    status = await pilot.advance(240, { stopAtEnding: index === 3 && !finalCheckpointChecked });
    if (status.phase === 'ending' && index === 3 && !finalCheckpointChecked) {
      await page.reload(); await page.locator('#resume-saved').click();
      assert.equal((await readLight(page)).world.phase, 'ending');
      assert.ok(await page.locator('[data-ending="release"]').isVisible());
      finalCheckpointChecked = true; report.checks.push('final decision survives a browser reload');
    }
    emit('progress', { run: index, phase: status.phase, wave: status.wave, steps: status.steps });
    if (!status.done && status.wave === 5 && !report.screenshots.includes(`arena-run-${index}.png`)) await shot(page, `arena-run-${index}.png`);
    await checkpointReport();
  } while (!status.done);
  const { world, ui } = await readLight(page);
  report.runs.push({ mode: spec.mode, path: spec.path, finalDecision: world.finalDecision, promise: world.promise, result: status, saveError: ui.saveError });
  assert.equal(status.phase, 'won', `Run ${index} must complete through actual inputs`);
  assert.deepEqual(status.visited, ['council-1', 'council-2', 'council-3', 'council-4', 'final-decision']);
  assert.equal(ui.saveError, ''); assert.equal(ui.historyCount, index); assert.equal(ui.checkpointPhase, null);
  if (spec.path[3] === 'closed') { assert.equal(world.stats.missed, 6); assert.equal(world.stats.burned, 0); assert.equal(world.promise.broken, false); }
  if (spec.path[0] === 'engine') { assert.ok(world.stats.burned >= 3); assert.equal(world.promise.broken, true); assert.ok(await page.locator('.comparison').isVisible()); }
  await shot(page, `ending-run-${index}.png`);
  const downloadPromise = page.waitForEvent('download'); await page.locator('[data-action="download"]').click(); const download = await downloadPromise;
  const path = join(output, `record-run-${index}.txt`); await download.saveAs(path);
  const text = await readFile(path, 'utf8'); assert.match(text, /THE LAST LIGHT/); assert.ok(text.includes(`World ${world.seed}`));
  report.checks.push(`run ${index}: download matches world ${world.seed}`);
  await page.locator('[data-action="home"]').click(); await page.locator('#history').click();
  assert.equal(await page.locator('.history-table tbody tr').count(), index);
  await page.locator('[data-action="close-history"]').click();
  await checkpointReport();
}
async function lossAndRetry() {
  emit('stage', { name: 'loss-and-retry' });
  const { context, page } = await contextPage();
  await page.goto(`${base}/last-light.html?seed=808`); await page.locator('#motion').click(); await start(page, 'standard', 'people');
  await page.keyboard.down('a'); await page.keyboard.down('w'); await advance(page, 2400); await page.keyboard.up('a'); await page.keyboard.up('w');
  const box = await page.locator('#arena').boundingBox(); await page.mouse.move(box.x + 2, box.y + 2); await page.mouse.down();
  for (let i = 0; i < 1500; i++) {
    const { world } = await readLight(page);
    if (world.phase === 'lost') break;
    if (world.phase === 'council') { await page.mouse.up(); await page.locator('[data-choice]:not([disabled])').first().click(); await page.mouse.down(); }
    await advance(page, 160);
  }
  await page.mouse.up(); const lost = await readLight(page);
  assert.equal(lost.world.phase, 'lost'); assert.equal(lost.ui.historyCount, 1); assert.equal(lost.ui.saveError, ''); assert.equal(lost.ui.checkpointPhase, null);
  assert.equal(lost.world.people.length, 0); assert.equal(lost.world.missing.length, lost.world.stats.missed);
  await shot(page, 'loss-record.png'); await page.locator('[data-action="retry"]').click(); await page.locator('[data-promise="memory"]').click();
  const retry = await readLight(page); assert.equal(retry.world.seed, 808); assert.equal(retry.world.wave, 1); assert.equal(retry.world.stats.burned, 0); assert.equal(retry.world.promise.id, 'memory');
  await page.reload(); await page.locator('#history').click(); assert.equal(await page.locator('.history-table tbody tr').count(), 1);
  report.checks.push('loss records unresolved people exactly once', 'loss is persisted', 'same-world retry resets state and changes promise');
  await context.close(); await checkpointReport();
}
async function responsiveAndTouch() {
  emit('stage', { name: 'responsive-and-touch' });
  const { context, page } = await contextPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.goto(`${base}/last-light.html?seed=77`); await page.locator('#motion').click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await shot(page, 'title-mobile.png'); await start(page, 'story', 'none');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'mobile arena must fit before touch input');
  const box = await page.locator('#arena').boundingBox(); const session = await context.newCDPSession(page);
  const initial = (await readLight(page)).world.player.x;
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x + 60, y: point.y }] });
  await advance(page, 500); await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert.ok((await readLight(page)).world.player.x > initial + 50, 'A real touch drag must move the keeper');
  await page.locator('#dash').tap(); await advance(page, 32); assert.ok((await readLight(page)).world.player.dashCooldown > 0);
  await page.locator('#pulse').tap(); await advance(page, 32); assert.equal((await readLight(page)).world.stats.burned, 1);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await shot(page, 'game-mobile.png');
  for (const [width, height] of [[768, 1024], [1440, 900], [1920, 1080]]) {
    await page.setViewportSize({ width, height }); await advance(page, 32);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `overflow at ${width}`);
  }
  report.checks.push('390/768/1440/1920px no horizontal overflow', 'real touch drag', 'touch dash', 'touch memory pulse');
  await context.close(); await checkpointReport();
}
async function saveSafety() {
  emit('stage', { name: 'browser-save-safety' });
  const { context, page } = await contextPage();
  await page.addInitScript(() => { localStorage.setItem('last-light.profile', '{"version":999,"private":"preserve"}'); localStorage.setItem('sideline.franchise', 'football sentinel'); localStorage.setItem('echo-requiem.profile', 'echo sentinel'); });
  await page.goto(`${base}/last-light.html?seed=5`); await start(page, 'story', 'none'); await advance(page, 200);
  const values = await page.evaluate(() => ({ light: localStorage.getItem('last-light.profile'), football: localStorage.getItem('sideline.franchise'), echo: localStorage.getItem('echo-requiem.profile') }));
  assert.equal(values.light, '{"version":999,"private":"preserve"}'); assert.equal(values.football, 'football sentinel'); assert.equal(values.echo, 'echo sentinel');
  assert.equal((await readLight(page)).ui.saveWritable, false); await context.close();
  const pair = await contextPage(); const a = pair.page; await a.goto(`${base}/last-light.html?seed=11`);
  const b = await pair.context.newPage(); b.setDefaultTimeout(6000); await b.clock.install({ time: new Date('2026-11-08T04:00:00Z') }); await b.clock.pauseAt(new Date('2026-11-08T04:00:01Z')); await b.goto(`${base}/last-light.html?seed=12`);
  await start(a, 'story', 'none'); const before = await a.evaluate(() => localStorage.getItem('last-light.profile'));
  await start(b, 'story', 'none'); assert.equal((await readLight(b)).ui.saveWritable, false);
  assert.equal(await b.evaluate(() => localStorage.getItem('last-light.profile')), before);
  await pair.context.close();
  report.checks.push('future save preserved in browser', 'other game saves untouched', 'stale browser tab rejected'); await checkpointReport();
}
async function standalone() {
  emit('stage', { name: 'standalone-offline' });
  const { context, page } = await contextPage(); const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto(`file://${join(root, 'dist/last-light-standalone.html')}?seed=123`);
  await page.locator('#motion').click(); await page.locator('#begin').click(); await page.locator('[data-promise="people"]').click();
  await page.keyboard.down('a'); await advance(page, 400); await page.keyboard.up('a'); await page.keyboard.press('Escape');
  assert.ok(await page.getByRole('heading', { name: 'The dark can wait.' }).isVisible());
  assert.ok(requests.every(url => url.startsWith('file:') || url.startsWith('data:')), requests.join('\n'));
  report.checks.push('portable file starts and pauses without network assets'); await context.close();
}
let deadline;
try {
  await Promise.race([
    (async () => {
      const { context, page } = await contextPage();
      if (process.env.LIGHT_QUICK !== '1') {
      await coreUi(page);
      await playRun(page, { mode: 'standard', promise: 'memory', path: ['fork', 'sentinel', 'precision', 'closed'], ending: 'keep', allowPulse: false }, 1);
      await playRun(page, { mode: 'standard', promise: 'memory', path: ['engine', 'mercy', 'erase', 'open'], ending: 'release', allowPulse: true }, 2);
      await playRun(page, { mode: 'story', promise: 'people', path: ['shelter', 'caravan', 'magnet', 'beacon'], ending: 'release', allowPulse: true }, 3);
      }
      await context.close(); await lossAndRetry(); await responsiveAndTouch(); await saveSafety(); await standalone();
      assert.deepEqual(report.errors, []); report.passed = true;
    })(),
    new Promise((_, reject) => { deadline = setTimeout(() => reject(new Error('Acceptance exceeded eight-minute budget')), 480000); }),
  ]);
} catch (error) {
  report.passed = false; report.failure = error.stack || error.message;
  if (currentPage && !currentPage.isClosed()) {
    try { await currentPage.screenshot({ path: join(output, 'failure.png'), fullPage: true, timeout: 5000 }); report.failureBody = (await currentPage.locator('body').innerText({ timeout: 2000 })).slice(-10000); } catch { /* Preserve the first failure. */ }
  }
  process.exitCode = 1;
} finally {
  clearTimeout(deadline); report.finished = new Date().toISOString(); await checkpointReport();
  emit('complete', { passed: report.passed, failure: report.failure, runs: report.runs.length, checks: report.checks.length, errors: report.errors });
  await browser.close(); await new Promise(resolve => server.close(resolve));
}
