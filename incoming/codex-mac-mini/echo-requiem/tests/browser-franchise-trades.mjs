import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import * as sim from '../src/sim/franchise.js';

/** Run on a fresh disposable browser context. Gameplay is driven only through
 * controls; storage reads and pure simulation previews are assertions. */
export async function acceptTradePackages(page, artifactDir) {
  const errors = [], stages = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
  const read = () => page.evaluate(() => JSON.parse(localStorage.getItem('sideline.franchise')));
  const nav = name => page.getByRole('navigation').getByRole('button', { name, exact: true }).click();
  const desk = async () => { await nav('Transactions'); await page.getByRole('button', { name: 'Trade desk', exact: true }).click(); };
  const fill = async (outgoing, incoming) => {
    await page.getByLabel('Partner team', { exact: true }).selectOption('0');
    for (let i = 0; i < 3; i++) await page.locator(`#trade-outgoing-${i}`).selectOption(outgoing[i] || '');
    for (let i = 0; i < 3; i++) await page.locator(`#trade-incoming-${i}`).selectOption(incoming[i] || '');
  };
  let s = await read(); assert.equal(s.week, 1); assert.equal(s.userTeam, 4);
  await desk();
  assert.equal(await page.getByRole('button', { name: 'Review trade', exact: true }).isDisabled(), true);
  const own = sim.roster(s).sort((a, b) => sim.tradeValue(b) - sim.tradeValue(a));
  const targets = sim.roster(s, 0).sort((a, b) => sim.tradeValue(a) - sim.tradeValue(b));
  let packageIds;
  search: for (const a of own) for (const b of targets) for (const c of targets) {
    if (b.id === c.id) continue;
    const report = sim.evaluateTrade(s, [a.id], [b.id, c.id]);
    if (!report.gap && report.reasons.length === 1 && report.reasons[0].includes('54 players')) {
      packageIds = { outgoing: [a.id], incoming: [b.id, c.id] }; break search;
    }
  }
  assert.ok(packageIds, 'No real one-for-two test package found');
  const { outgoing, incoming } = packageIds;
  await fill(outgoing, incoming);
  assert.match(await page.locator('#trade-feedback').innerText(), /54 players/);
  assert.equal(await page.getByRole('button', { name: 'Review trade', exact: true }).isDisabled(), true);
  assert.deepEqual(await read(), s, 'Preview mutated the campaign');
  assert.equal(await page.locator(`#trade-incoming-2 option[value="${incoming[0]}"]`).isDisabled(), true);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'trade-incoming-2', 'Selection lost keyboard focus');
  await page.getByLabel('Partner team', { exact: true }).selectOption('1');
  assert.equal(await page.locator('#trade-incoming-0').inputValue(), '');
  assert.equal(await page.locator('#trade-incoming-1').inputValue(), '');
  assert.equal(await page.locator('#trade-outgoing-0').inputValue(), outgoing[0]);
  await page.getByRole('button', { name: 'Clear package', exact: true }).click();
  assert.equal(await page.locator('#trade-outgoing-0').inputValue(), '');
  stages.push('live full-roster rejection, duplicate protection, partner reset, clear and keyboard focus');

  await fill([sim.depthChart(s, s.userTeam, 'QB').at(-1).id], [sim.depthChart(s, 0, 'QB')[0].id]);
  assert.match(await page.locator('#trade-feedback').innerText(), /Trade declined/);
  assert.equal(await page.getByRole('button', { name: 'Review trade', exact: true }).isDisabled(), true);
  assert.deepEqual(await read(), s);
  stages.push('declined offer explains the value gap without saving');

  const reserve = sim.depthChart(s, s.userTeam, 'WR').filter(p => !outgoing.includes(p.id)).at(-1);
  await nav('Team roster'); await page.locator(`[data-player="${reserve.id}"]`).first().click();
  await page.getByRole('button', { name: 'Release player', exact: true }).click();
  await page.getByRole('button', { name: 'Release player', exact: true }).click();
  s = await read(); assert.equal(sim.roster(s).length, 52);
  await desk(); await fill(outgoing, incoming);
  const preview = sim.evaluateTrade(s, outgoing, incoming); assert.equal(preview.accepted, true);
  assert.match(await page.locator('#trade-feedback').innerText(), /We have a deal/);
  if (artifactDir) { await mkdir(artifactDir, { recursive: true }); await page.screenshot({ path: join(artifactDir, 'sideline-trade-desktop.png'), fullPage: true }); }
  await page.getByRole('button', { name: 'Review trade', exact: true }).click();
  assert.match(await page.getByRole('dialog').innerText(), /Confirm this trade/);
  assert.deepEqual(await read(), s);
  await page.getByRole('button', { name: 'Keep negotiating', exact: true }).click();
  assert.deepEqual(await read(), s);
  assert.equal(await page.locator('#trade-incoming-1').inputValue(), incoming[1]);
  await page.getByRole('button', { name: 'Review trade', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm trade', exact: true }).click();
  const after = await read();
  assert.equal(after.revision, s.revision + 1); assert.equal(after.rngState, s.rngState);
  for (const id of outgoing) assert.equal(sim.getPlayer(after, id).teamId, 0);
  for (const id of incoming) assert.equal(sim.getPlayer(after, id).teamId, after.userTeam);
  for (const t of preview.teams) { assert.equal(sim.capRoom(after, t.teamId), t.capAfter); assert.equal(sim.roster(after, t.teamId).length, t.rosterAfter); }
  assert.equal(await page.locator('#trade-outgoing-0').inputValue(), '');
  await page.reload(); assert.deepEqual(await read(), after);
  stages.push('one-for-two deal: cancel, final confirmation, exact cap/dead-money accounting and reload');

  await desk();
  const nextOut = sim.roster(after).sort((a, b) => sim.tradeValue(b) - sim.tradeValue(a));
  const nextIn = sim.roster(after, 0).sort((a, b) => sim.tradeValue(a) - sim.tradeValue(b));
  let next;
  for (const a of nextOut) { for (const b of nextIn) if (sim.evaluateTrade(after, [a.id], [b.id]).accepted) { next = [a.id, b.id]; break; } if (next) break; }
  assert.ok(next); await fill([next[0]], [next[1]]);
  const widths = [390, 768, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Page overflow at ${width}`);
    await page.getByRole('button', { name: 'Review trade', exact: true }).click();
    assert.equal(await page.getByRole('dialog').evaluate(d => d.scrollWidth > d.clientWidth), false, `Dialog overflow at ${width}`);
    if (width === 390 && artifactDir) await page.screenshot({ path: join(artifactDir, 'sideline-trade-mobile.png') });
    await page.getByRole('button', { name: 'Keep negotiating', exact: true }).click();
  }
  stages.push('package and confirmation layouts at 390, 768 and 1440 pixels');

  await page.getByRole('button', { name: 'Review trade', exact: true }).click();
  const other = await page.context().newPage(); await other.goto(page.url());
  await other.getByRole('navigation').getByRole('button', { name: 'Game plan', exact: true }).click();
  await other.locator('[data-action="train"]').click();
  const savedElsewhere = await other.evaluate(() => localStorage.getItem('sideline.franchise'));
  await page.getByRole('button', { name: 'Confirm trade', exact: true }).click();
  assert.match(await page.locator('.dialog-status').innerText(), /Another tab changed/);
  assert.equal(await page.evaluate(() => localStorage.getItem('sideline.franchise')), savedElsewhere);
  await other.close(); await page.reload();
  stages.push('stale-tab confirmation preserves the newer save and reports the conflict inside the dialog');

  while ((await read()).week <= 8) {
    await page.locator('[data-action="advance"]').click();
    if (await page.getByRole('dialog').isVisible()) await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  }
  await desk(); assert.match(await page.locator('#trade-feedback').innerText(), /Trading is closed/);
  assert.equal(await page.locator('#trade-outgoing-0').isDisabled(), true);
  stages.push('week-nine deadline closes the builder through ordinary season advancement');
  assert.deepEqual(errors, []);
  return { passed: stages, viewportWidths: widths, pageErrors: errors };
}
