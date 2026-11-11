/** End-to-end acceptance. Supply a fresh Playwright page and a source or portable URL. */
export async function testQuarterlife(page, url, outputDirectory) {
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const read = () => page.evaluate(() => JSON.parse(localStorage.getItem('twenty-six.run')));
  const click = async locator => { await page.waitForTimeout(200); await locator.click(); };
  const button = (action, id) => {
    const result = page.locator(`[data-action="${action}"]${id ? `[data-id="${id}"]` : ''}`);
    return action === 'close' ? result.first() : result;
  };
  const issues = [], requests = [], stages = [];
  page.on('pageerror', e => issues.push(e.message));
  page.on('request', request => { if (/^https?:/.test(request.url()) && !/^http:\/\/(localhost|127\.0\.0\.1):/.test(request.url())) requests.push(request.url()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(url); await button('start').waitFor();
  check((await page.locator('.stat').first().innerText()).includes('$650'), 'Currency symbol missing');
  await page.screenshot({ path: `${outputDirectory}/welcome.png`, fullPage: true });
  await click(button('start')); check((await read()).day === 1, 'Start failed');
  await click(button('help')); check(await page.locator('#life-dialog').isVisible(), 'Help unavailable');
  await page.keyboard.press('Escape'); check(!(await page.locator('#life-dialog').isVisible()), 'Help cannot close');
  await click(button('sound')); check((await button('sound').getAttribute('aria-label')) === 'Mute sound', 'Sound toggle failed');
  await page.keyboard.press('m'); check((await button('sound').getAttribute('aria-label')) === 'Turn sound on', 'Sound shortcut failed');
  const beforePet = await read(); await click(button('pet'));
  check((await read()).stats.peace === beforePet.stats.peace + 3, 'Cat reward missing');
  check(await button('pet').isDisabled(), 'Cat reward can be farmed');
  await click(button('play', 'cook'));
  check((await read()).food === 3, 'Food did not persist after daily meal');
  check(await page.locator('.has-combo[data-id="host"]').isVisible(), 'Cook-social setup not visible');
  const beforeHost = await read(); await click(button('play', 'host'));
  check((await read()).combos === 1 && (await read()).stats.cash === beforeHost.stats.cash - 10, 'Combo payout wrong');
  await page.screenshot({ path: `${outputDirectory}/playing.png`, fullPage: true });
  stages.push('onboarding, help, mouse controls, sound shortcut, daily cat limit, cooking, combo');
  await click(button('play', 'sleep'));
  check((await read()).phase === 'event', 'Expected a surprise on day 3');
  const pending = JSON.stringify(await read()); await page.reload();
  check(JSON.stringify(await read()) === pending, 'Reload changed pending event');
  check(await page.locator('#life-dialog').isVisible(), 'Pending event did not restore');
  await page.keyboard.press('Escape'); check(await page.locator('#life-dialog').isVisible(), 'Mandatory event escaped');
  await page.screenshot({ path: `${outputDirectory}/surprise.png`, fullPage: true });
  await click(page.locator('[data-action="event"]:not(:disabled)').nth(1));
  check((await read()).day === 4, 'Event did not advance to day 4');
  const beforeReroll = await read(); await click(button('reroll'));
  const afterReroll = await read();
  check(afterReroll.stats.peace === beforeReroll.stats.peace - 5, 'Rethink cost wrong');
  check(afterReroll.hand.every(id => !beforeReroll.hand.includes(id)), 'Rethink kept old cards');
  check(await button('reroll').isDisabled(), 'Rethink can repeat');
  await page.waitForTimeout(200); await page.keyboard.press('4');
  check((await read()).day === 5, 'Rest shortcut failed');
  stages.push('event reload, event response, mandatory modal, reroll limit, keyboard rest');
  const preserved = JSON.stringify(await read()); await page.reload();
  check(JSON.stringify(await read()) === preserved, 'Midmonth save diverged on reload');
  let turns = 0, events = 1, upgrades = 0;
  while ((await read()).phase !== 'ended' && turns++ < 80) {
    const s = await read();
    if (s.phase === 'event') { events++; await click(page.locator('[data-action="event"]:not(:disabled)').nth(1)); continue; }
    if (s.phase === 'upgrade') {
      upgrades++;
      check(await page.locator('.weekly-highlights').isVisible(), 'Weekly summary missing');
      if (upgrades === 1) await page.screenshot({ path: `${outputDirectory}/upgrade.png`, fullPage: true });
      await click(button('upgrade').first()); continue;
    }
    const enabled = await page.locator('.plan:not(:disabled)').evaluateAll(elements => elements.map(e => e.dataset.id));
    let choice = s.stats.energy < 35 ? 'sleep' : enabled.find(id => ['gig', 'sell'].includes(id) && s.stats.cash < 1600);
    if (!choice && s.stats.social < 40) choice = enabled.find(id => ['host', 'call', 'friend', 'drinks'].includes(id));
    if (!choice && s.boundaries < 3 && enabled.includes('boundary')) choice = 'boundary';
    if (!choice) choice = enabled[0] || 'sleep';
    await click(button('play', choice));
    const next = await read();
    check(next.history.length === s.history.length + 1, 'A choice did not spend exactly one evening');
  }
  const final = await read();
  check(final.phase === 'ended' && final.history.length === 28, 'Month never ended');
  check(events === 8 && upgrades === 3, `Wrong progression: ${events} events, ${upgrades} upgrades`);
  check(final.ending.score > 0, 'Final score missing');
  check(await page.locator('.era-card').isVisible(), 'Personality recap missing');
  await page.screenshot({ path: `${outputDirectory}/ending.png`, fullPage: true });
  const downloadWait = page.waitForEvent('download'); await click(button('download'));
  const download = await downloadWait; check(download.suggestedFilename().endsWith('.png'), 'Recap format wrong');
  await download.saveAs(`${outputDirectory}/my-month.png`);
  const last = JSON.stringify(final); await page.reload();
  check(JSON.stringify(await read()) === last, 'Ended save changed on reload');
  await click(button('close')); await page.keyboard.press('4');
  check(JSON.stringify(await read()) === last, 'Ended game accepts actions');
  stages.push('all 28 evenings, 8 events, 3 upgrades, ending, PNG download, ended save restore');
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}px`);
    await click(button('results'));
    check(await page.locator('#life-dialog').evaluate(e => e.getBoundingClientRect().right <= innerWidth && e.scrollWidth <= e.clientWidth), `Dialog overflow at ${width}px`);
    await click(button('close'));
  }
  await click(button('results')); await click(button('same'));
  const replay = await read(); check(replay.seed === final.seed && replay.day === 1 && replay.history.length === 0, 'Same-seed replay failed');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${outputDirectory}/mobile.png`, fullPage: true });
  await click(button('restart')); await click(button('close')); check((await read()).seed === replay.seed, 'Canceled restart lost run');
  await click(button('restart')); await click(button('new')); check((await read()).day === 1, 'New month failed');
  stages.push('360/390/768/1440px layouts, same-seed replay, restart cancel/confirm');
  check(issues.length === 0, `Browser errors: ${issues.join('; ')}`);
  check(requests.length === 0, `Unexpected network requests: ${requests.join('; ')}`);
  return { url, stages, final: { score: final.ending.score, cash: final.stats.cash, goals: final.ending.wins, memories: final.memories.length, combos: final.combos }, errors: issues, externalRequests: requests };
}

export async function testProtectedLifeSaves(page, url) {
  const check = (condition, message) => { if (!condition) throw Error(message); };
  await page.goto(url);
  const future = JSON.stringify({ version: 999, future: 'preserve this exact value' });
  await page.evaluate(raw => localStorage.setItem('twenty-six.run', raw), future);
  await page.reload();
  check((await page.locator('.storage-warning').innerText()).includes('another version'), 'Unknown version warning missing');
  await page.locator('[data-action="start"]').click();
  await page.locator('[data-id="cook"]').click();
  check(await page.evaluate(() => localStorage.getItem('twenty-six.run')) === future, 'Future save overwritten');
  check(!(await page.locator('.page-footer').innerText()).includes('Saved on this device'), 'False save-success claim');
  return { preservedUnknownVersion: true, playableTemporarySession: true };
}
