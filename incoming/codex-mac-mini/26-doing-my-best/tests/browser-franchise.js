// Importable Playwright acceptance. Uses ordinary UI actions; state reads are assertions only.
// Run in a disposable browser session against a freshly created franchise.
export default async (page) => {
  const errors = [], stages = [];
  page.on('pageerror', error => errors.push(error.message));
  const read = () => page.evaluate(() => JSON.parse(localStorage.getItem('sideline.franchise')));
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const nav = async name => page.getByRole('navigation').getByRole('button', { name, exact: true }).click();
  const close = async () => { if (await page.locator('dialog[open]').count()) await page.getByRole('button', { name: 'Close dialog', exact: true }).click(); };
  await page.reload();
  await nav('Game plan');
  await page.getByLabel('Offensive system').selectOption('pass');
  await page.getByLabel('Defensive system').selectOption('coverage');
  await page.getByLabel('Training focus').selectOption('offense');
  await page.getByRole('button', { name: 'Save game plan', exact: true }).click();
  await page.getByRole('button', { name: 'Run weekly training', exact: true }).click();
  let s = await read(); assert(s.trainedWeek === '2005-1', 'Practice did not persist');
  assert(s.teams[s.userTeam].offense === 'pass', 'Strategy did not persist');
  stages.push('strategy and practice');
  await nav('Team roster');
  await page.getByLabel('Position', { exact: true }).selectOption('QB');
  const backup = s.players.filter(p => p.teamId === s.userTeam && p.position === 'QB').sort((a, b) => b.depth - a.depth)[0];
  await page.locator(`[data-player="${backup.id}"]`).first().click();
  await page.getByRole('button', { name: 'Release player', exact: true }).click();
  await page.getByRole('button', { name: 'Release player', exact: true }).click();
  s = await read(); assert(s.players.find(p => p.id === backup.id).teamId === null, 'Release failed');
  await nav('Transactions');
  await page.getByLabel('Position', { exact: true }).selectOption('QB');
  const free = s.players.filter(p => p.teamId === null && p.position === 'QB').sort((a, b) => b.overall - a.overall)[0];
  await page.locator(`[data-player="${free.id}"]`).first().click();
  await page.getByRole('button', { name: /Sign 2 years/ }).click();
  s = await read(); assert(s.players.find(p => p.id === free.id).teamId === s.userTeam, 'Signing failed');
  stages.push('release and free-agent signing');
  await nav('Scouting & draft');
  await page.getByRole('button', { name: 'Scout', exact: true }).first().click();
  s = await read(); assert(s.scoutingPoints === 7 && s.prospects.some(p => p.scouted), 'Scouting failed');
  await nav('Owner’s office');
  await page.getByLabel('Average ticket price ($)').fill('72');
  await page.getByRole('button', { name: 'Update ticket price', exact: true }).click();
  await page.getByRole('button', { name: 'Invest $8.0M', exact: true }).click();
  s = await read(); assert(s.teams[s.userTeam].ticket === 72, 'Ticket pricing failed');
  stages.push('scouting and owner decisions');
  await nav('Overview');
  await page.getByRole('button', { name: 'Simulate week', exact: true }).click();
  assert(await page.getByRole('heading', { name: 'The final whistle.' }).isVisible(), 'Game recap missing');
  await page.locator('summary').click();
  assert(await page.locator('.drive-list>div').count() >= 24, 'Drive recap missing');
  await close(); await page.reload();
  s = await read(); assert(s.week === 2, 'Week did not survive reload');
  stages.push('weekly results, box score, drives, reload persistence');
  for (let guard = 0; guard < 24; guard++) {
    s = await read(); if (!['regular', 'playoffs'].includes(s.phase)) break;
    await page.locator('[data-action="advance"]').click(); await close();
  }
  s = await read(); assert(s.phase === 'offseason' && s.history.length === 1, 'Season did not reach offseason');
  stages.push('16-game season, bye, playoffs and championship');
  await page.getByRole('button', { name: 'Enter the draft', exact: true }).click();
  await page.getByRole('button', { name: 'Enter draft', exact: true }).click();
  for (let round = 0; round < 7; round++) {
    s = await read(); assert(s.phase === 'draft', `Draft stopped at round ${round + 1}`);
    await page.getByRole('button', { name: 'Draft', exact: true }).first().click();
  }
  s = await read(); assert(s.phase === 'preseason' && s.draft.cursor === 224, 'Draft not complete');
  await page.getByRole('button', { name: 'Start 2006 season', exact: true }).click();
  s = await read(); assert(s.year === 2006 && s.week === 1 && s.phase === 'regular', 'New season failed');
  stages.push('seven draft picks and second season');
  for (const name of ['Standings', 'League news', 'Franchise history', 'Settings', 'Schedule', 'Transactions', 'Game plan', 'Team roster', 'Scouting & draft', 'Owner’s office', 'Overview']) await nav(name);
  assert(errors.length === 0, `Browser errors: ${errors.join(', ')}`);
  return { passed: stages, year: s.year, week: s.week, history: s.history.length, draftPicks: s.draft.picks.length, pageErrors: errors };
}
