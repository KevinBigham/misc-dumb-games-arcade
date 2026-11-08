// Run in an isolated Playwright context through node_repl. Tests operate actual
// controls; the DOM solver below never changes the game's internal state.
const assert = (value, message) => { if (!value) throw new Error(message); };
const signature = cells => cells.map(([x, y]) => `${x},${y}`).sort().join(';');
const cell = (page, x, y) => page.locator(`.cell[data-x="${x}"][data-y="${y}"]`);
const shape = (page, slot) => page.locator(`[data-slot="${slot}"] .mini-block`).evaluateAll(nodes => nodes.map(node => [parseInt(node.style.gridColumn) - 1, parseInt(node.style.gridRow) - 1]));
const settleLayout = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const saved = page => page.evaluate(() => JSON.parse(localStorage.getItem('crossblock.session')));

export async function findCrossblockMove(page, style = 'score') {
  return page.evaluate(style => {
    const board = [...document.querySelectorAll('.cell')].map(node => node.getAttribute('aria-label').includes('occupied') ? 1 : 0);
    const hand = [...document.querySelectorAll('.piece-card')].map(card => [...card.querySelectorAll('.mini-block')].map(node => [parseInt(node.style.gridColumn) - 1, parseInt(node.style.gridRow) - 1]));
    let best = null;
    for (let slot = 0; slot < 3; slot++) {
      if (!hand[slot].length) continue;
      let cells = hand[slot];
      for (let rotation = 0; rotation < 4; rotation++) {
        for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
          if (!cells.every(([dx, dy]) => x + dx < 8 && y + dy < 8 && !board[(y + dy) * 8 + x + dx])) continue;
          const copy = [...board]; cells.forEach(([dx, dy]) => { copy[(y + dy) * 8 + x + dx] = 1; });
          let rows = 0, columns = 0;
          for (let i = 0; i < 8; i++) {
            if (copy.slice(i * 8, i * 8 + 8).every(Boolean)) rows++;
            if (Array.from({ length: 8 }, (_, row) => copy[row * 8 + i]).every(Boolean)) columns++;
          }
          const value = style === 'jam' ? -(rows + columns) * 10000 + ((x * 3 + y * 5) % 7) * 100 + y * 8 + x : (rows + columns) * 1000 + (rows && columns ? 1000 : 0) + y * 8 + x;
          if (!best || value > best.value) best = { slot, rotation, x, y, value, rows, columns };
        }
        const turned = cells.map(([x, y]) => [-y, x]);
        const minX = Math.min(...turned.map(([x]) => x)), minY = Math.min(...turned.map(([, y]) => y));
        cells = turned.map(([x, y]) => [x - minX, y - minY]);
      }
    }
    return best;
  }, style);
}

export async function playCrossblockMove(page, move) {
  await page.locator(`[data-slot="${move.slot}"]`).click();
  for (let rotation = 0; rotation < move.rotation; rotation++) await page.locator('#rotate-button').click();
  await cell(page, move.x, move.y).click();
}

export async function runCrossblockAcceptance(browser, url, dailyPuzzle, screenshotDirectory) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: 'America/Chicago', reducedMotion: 'reduce' });
  const page = await context.newPage(), errors = [], requests = [], passed = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  try {
    await page.goto(url);
    assert(await page.locator('.cell').count() === 64, 'Board must have 64 cells');
    assert(await page.locator('.piece-card').count() === 3, 'Hand must have 3 shapes');
    await cell(page, 0, 0).click();
    assert(await page.locator('#score').textContent() === '0', 'Empty selection placed a piece');
    await page.locator('[data-slot="2"]').click();
    await cell(page, 0, 0).hover(); assert(await page.locator('.ghost').count() === 4, 'Square preview missing');
    await cell(page, 0, 0).click(); assert(await page.locator('#moves').textContent() === '01', 'Mouse placement failed');
    await cell(page, 0, 0).click(); assert(await page.locator('#moves').textContent() === '01', 'Overlap accepted');
    await page.keyboard.press('z'); assert(await page.locator('#moves').textContent() === '00', 'Undo failed');
    passed.push('mouse selection, preview, placement, overlap rejection, undo');
    await page.keyboard.press('2'); const original = signature(await shape(page, 1));
    for (let i = 0; i < 4; i++) await page.keyboard.press('r');
    assert(signature(await shape(page, 1)) === original, 'Rotation cycle changed shape');
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter');
    assert(await page.locator('#moves').textContent() === '01', 'Keyboard placement failed');
    const beforeReload = (await saved(page)).free;
    await page.reload(); assert(JSON.stringify((await saved(page)).free) === JSON.stringify(beforeReload), 'Reload changed saved run');
    await page.keyboard.press('z'); assert(await page.locator('#moves').textContent() === '00', 'Restored undo failed');
    passed.push('keyboard rotation, movement, placement, exact resume, restored undo');
    const source = await page.locator('[data-slot="2"]').boundingBox(), target = await cell(page, 3, 3).boundingBox();
    await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2); await page.mouse.down();
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 10 });
    assert(await page.locator('.ghost').count() === 4, 'Drag preview missing');
    await page.mouse.up(); assert(await page.locator('#moves').textContent() === '01', 'Drag placement failed');
    await page.locator('#help-button').click(); assert(await page.locator('#help-dialog').isVisible(), 'Help missing');
    await page.keyboard.press('Escape'); await page.locator('#new-button').click();
    await page.getByRole('button', { name: 'Keep playing' }).click();
    assert(await page.locator('#moves').textContent() === '01', 'Cancelled restart reset the board');
    passed.push('drag/drop, help, Escape, cancelled reset');
    const freeBeforeDaily = (await saved(page)).free;
    await page.locator('#mode-daily').click();
    const key = (await page.locator('#mode-description').textContent()).slice(0, 10);
    const solution = dailyPuzzle(key).solutions;
    for (let slot = 0; slot < 3; slot++) {
      await page.locator(`[data-slot="${slot}"]`).click();
      for (let turns = 0; turns < 4 && signature(await shape(page, slot)) !== signature(solution[slot].piece.cells); turns++) await page.locator('#rotate-button').click();
      assert(signature(await shape(page, slot)) === signature(solution[slot].piece.cells), 'Daily rotation mismatch');
      await cell(page, solution[slot].x, solution[slot].y).click();
    }
    await page.locator('#end-dialog[open]').waitFor();
    assert(await page.locator('#end-title').textContent() === 'Perfect fit.', 'Daily puzzle did not win');
    assert(await page.locator('.cell.filled').count() === 0, 'Solved daily contains blocks');
    const dailyScore = (await saved(page)).daily.score;
    assert((await saved(page)).completedDaily.score === dailyScore, 'Daily record not saved');
    await page.reload(); await page.locator('#end-dialog[open]').waitFor();
    assert(await page.locator('#end-title').textContent() === 'Perfect fit.', 'Daily completion lost on reload');
    if (screenshotDirectory) await page.screenshot({ path: `${screenshotDirectory}/daily-victory.png` });
    await page.locator('#play-again').click();
    assert(JSON.stringify((await saved(page)).free) === JSON.stringify(freeBeforeDaily), 'Daily mode changed free-play board');
    assert(await page.locator('#daily-mark').textContent() === '✓', 'Daily completion badge missing');
    passed.push('daily three-move victory, completion persistence, isolated free-play board');
    const linesBefore = (await saved(page)).free.lines;
    let played = 0, rowClears = 0, columnClears = 0, crosses = 0;
    while (played < 90 && (await saved(page)).free.status === 'playing') {
      const move = await findCrossblockMove(page); assert(move, 'UI cannot find a move in an active round');
      await playCrossblockMove(page, move); rowClears += move.rows; columnClears += move.columns; if (move.rows && move.columns) crosses++; played++;
    }
    assert((await saved(page)).free.lines > linesBefore, 'Long playthrough never cleared a line');
    assert((await saved(page)).free.moves > 3, 'Fresh hand failed');
    const longRun = { placements: played, rowClears, columnClears, crosses, score: (await saved(page)).free.score, status: (await saved(page)).free.status };
    if (longRun.status === 'over') { await page.locator('#end-dialog[open]').waitFor(); await page.locator('#play-again').click(); }
    else { await page.locator('#new-button').click(); await page.locator('#confirm-restart').click(); }
    let jamMoves = 0;
    while ((await saved(page)).free.status === 'playing' && jamMoves < 90) {
      const move = await findCrossblockMove(page, 'jam'); assert(move, 'Active round has no move');
      await playCrossblockMove(page, move); jamMoves++;
    }
    assert((await saved(page)).free.status === 'over', 'Jam run failed to reach game over');
    await page.locator('#end-dialog[open]').waitFor();
    const over = (await saved(page)).free; await page.locator('#end-undo').click();
    assert((await saved(page)).free.status === 'playing' && (await saved(page)).free.moves === over.moves - 1, 'Game-over undo failed');
    await page.locator('#new-button').click(); await page.locator('#confirm-restart').click();
    assert((await saved(page)).free.moves === 0, 'Fresh round failed');
    passed.push('long real-input playthrough, new hands, clears, game over, recovery, restart');
    const viewportResults = [];
    for (const [width, height] of [[1440, 900], [1280, 720], [900, 900], [768, 1024], [390, 844], [320, 568]]) {
      await page.setViewportSize({ width, height }); await settleLayout(page);
      const metrics = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, overflow: document.documentElement.scrollWidth > innerWidth, boardWidth: Math.round(document.querySelector('#board').getBoundingClientRect().width) }));
      assert(!metrics.overflow, `Horizontal overflow at ${width}px`); assert(metrics.boardWidth >= 240, `Board too small at ${width}px`); viewportResults.push(metrics);
    }
    await page.setViewportSize({ width: 1440, height: 900 }); await settleLayout(page);
    await page.locator('#mode-daily').click(); await page.locator('#end-dialog[open]').waitFor(); await page.keyboard.press('Escape');
    await page.locator('#new-button').click(); await page.locator('#confirm-restart').click();
    if (screenshotDirectory) await page.screenshot({ path: `${screenshotDirectory}/daily-desktop.png`, fullPage: true });
    await page.locator('#mode-free').click();
    if (screenshotDirectory) await page.screenshot({ path: `${screenshotDirectory}/free-desktop.png`, fullPage: true });
    await page.locator('#sound-button').click(); const mute = await page.locator('#sound-button').getAttribute('aria-pressed');
    await page.reload(); assert(await page.locator('#sound-button').getAttribute('aria-pressed') === mute, 'Sound preference not restored');
    passed.push('six responsive widths, sound preference persistence');
    assert(errors.length === 0, errors.join('\n'));
    if (url.startsWith('file:')) assert(requests.length === 0, 'Standalone requested HTTP assets');
    return { passed, longRun, gameOverPlacements: jamMoves, daily: { key, score: dailyScore }, viewports: viewportResults, pageErrors: errors, httpRequests: requests };
  } finally { await context.close(); }
}

export async function runCrossblockResilience(browser, url, createWorld) {
  const passed = [], errors = [];
  async function fixture(init, arg, options = {}) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, timezoneId: 'America/Chicago', ...options });
    if (init) await context.addInitScript(init, arg);
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(url); return { context, page };
  }
  const unavailable = await fixture(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }));
  try {
    await unavailable.page.locator('[data-slot="2"]').click(); await cell(unavailable.page, 0, 0).click();
    assert(await unavailable.page.locator('#score').textContent() === '20', 'Blocked storage prevented play');
    assert((await unavailable.page.locator('#save-note').textContent()).includes('can’t save'), 'Temporary-play message missing');
    passed.push('denied browser storage still permits play');
  } finally { await unavailable.context.close(); }

  for (const [key, raw] of [['crossblock.session', '{"version":99,"keep":"untouched"}'], ['crossblock.session', '{broken'], ['crossblock.profile', '{"version":99,"keep":"untouched"}']]) {
    const run = await fixture(({ key, raw }) => localStorage.setItem(key, raw), { key, raw });
    try {
      await run.page.locator('[data-slot="2"]').click(); await cell(run.page, 0, 0).click();
      assert(await run.page.locator('#score').textContent() === '20', 'Protected save prevented temporary play');
      assert(await run.page.evaluate(key => localStorage.getItem(key), key) === raw, 'Protected save was overwritten');
    } finally { await run.context.close(); }
  }
  passed.push('future profile, future session, and malformed session preserved byte for byte');

  const shared = await fixture();
  try {
    await shared.page.locator('[data-slot="2"]').click(); await cell(shared.page, 0, 0).click();
    const second = await shared.context.newPage(); second.on('pageerror', error => errors.push(error.message)); await second.goto(url);
    const before = JSON.stringify(await saved(second));
    await playCrossblockMove(shared.page, await findCrossblockMove(shared.page));
    assert(JSON.stringify(await saved(second)) === before, 'Stale tab overwrote newer session');
    assert((await shared.page.locator('#save-note').textContent()).includes('Another tab'), 'Stale-tab message missing');
    passed.push('stale tab cannot overwrite a newer saved board');
  } finally { await shared.context.close(); }

  const rolloverContext = await browser.newContext({ viewport: { width: 1280, height: 800 }, timezoneId: 'America/Chicago', reducedMotion: 'reduce' });
  try {
    const page = await rolloverContext.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-11-08T05:30:00Z')); await page.goto(url);
    await page.locator('[data-slot="2"]').click(); await cell(page, 1, 1).click(); const free = (await saved(page)).free;
    await page.locator('#mode-daily').click(); assert((await saved(page)).daily.puzzleKey === '2026-11-07', 'Daily ignores local calendar');
    await page.clock.setFixedTime(new Date('2026-11-08T06:30:00Z')); await page.reload();
    assert((await saved(page)).daily.puzzleKey === '2026-11-08', 'Daily did not roll at local midnight');
    assert((await saved(page)).daily.moves === 0, 'New day inherited moves');
    assert(JSON.stringify((await saved(page)).free) === JSON.stringify(free), 'Daily rollover changed free board');
    passed.push('local midnight produces a fresh daily and preserves free play');
  } finally { await rolloverContext.close(); }

  const cross = createWorld(9);
  for (let x = 1; x < 8; x++) cross.board[x] = 2;
  for (let y = 2; y < 8; y++) cross.board[y * 8] = 3;
  cross.board[63] = 4; cross.hand[0] = { name: 'Domino', color: 1, cells: [[0, 0], [0, 1]] };
  const crossing = await fixture(world => localStorage.setItem('crossblock.session', JSON.stringify({ version: 1, revision: 0, mode: 'free', free: world, daily: null, completedDaily: null })), cross);
  try {
    const page = crossing.page;
    await page.locator('[data-slot="0"]').click(); await cell(page, 0, 0).hover();
    assert(await page.locator('.will-clear').count() === 15, 'Cross preview does not highlight intersection correctly');
    await cell(page, 0, 0).click();
    assert(await page.locator('#score').textContent() === '810', 'Cross score incorrect');
    assert(await page.locator('#lines').textContent() === '02', 'Cross should clear two lines');
    assert((await page.locator('#board-toast').textContent()).includes('CROSS!'), 'Cross celebration absent');
    assert(await page.locator('.clear-flash').count() === 15, 'Clear animation missing or duplicated intersection');
    await page.waitForFunction(() => document.querySelectorAll('.clear-flash').length === 0);
    await page.keyboard.press('z'); assert(await page.locator('#score').textContent() === '0', 'Animated clear undo failed');
    assert((await saved(page)).free.board.filter(Boolean).length === 14, 'Undo did not restore crossed board');
    passed.push('Cross preview, double points, non-reduced animations, cleanup, and undo');
  } finally { await crossing.context.close(); }
  assert(errors.length === 0, errors.join('\n'));
  return { passed, pageErrors: errors };
}

export async function runCrossblockTouch(browser, url, screenshotDirectory) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, timezoneId: 'America/Chicago' });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(url);
    await page.locator('[data-slot="2"]').tap(); await cell(page, 0, 0).tap();
    assert(await page.locator('#moves').textContent() === '01', 'Touch tap placement failed');
    await page.locator('#undo-button').tap();
    const protocol = await context.newCDPSession(page);
    async function drag(to) {
      await page.locator('[data-slot="2"]').scrollIntoViewIfNeeded();
      const box = await page.locator('[data-slot="2"]').boundingBox(), target = await to();
      const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      await protocol.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
      for (let i = 1; i <= 12; i++) await protocol.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + (target.x - start.x) * i / 12, y: start.y + (target.y - start.y) * i / 12 }] });
      await protocol.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    await drag(async () => ({ x: 3, y: 350 }));
    assert(await page.locator('#moves').textContent() === '00', 'Cancelled touch drag placed a shape');
    assert(await page.locator('.ghost').count() === 0, 'Cancelled drag left a ghost');
    await drag(async () => { const box = await cell(page, 3, 3).boundingBox(); return { x: box.x + box.width / 2, y: box.y + box.height / 2 }; });
    assert(await page.locator('#moves').textContent() === '01', 'Touch drag placement failed');
    await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); }); await settleLayout(page);
    const rect = await page.locator('#board').boundingBox(), start = { x: rect.x + rect.width / 2, y: rect.y + rect.height * 0.7 };
    await protocol.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
    for (let i = 1; i <= 10; i++) await protocol.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x, y: start.y - i * 15 }] });
    await protocol.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(() => scrollY > 0);
    assert(await page.locator('#moves').textContent() === '01', 'Scrolling the board placed a shape');
    await page.reload(); assert(await page.locator('#moves').textContent() === '01', 'Touch game did not resume');
    await page.locator('#mode-daily').tap();
    await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); }); await settleLayout(page);
    const layout = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, overflow: document.documentElement.scrollWidth > innerWidth, controlsBottom: document.querySelector('.board-tools').getBoundingClientRect().bottom }));
    assert(!layout.overflow && layout.controlsBottom <= layout.height, 'Phone controls do not fit');
    if (screenshotDirectory) await page.screenshot({ path: `${screenshotDirectory}/daily-mobile.png`, fullPage: true });
    assert(errors.length === 0, errors.join('\n'));
    return { passed: ['touch tap and undo', 'cancelled drag', 'touch drag/drop', 'scrolling the board without placing a shape', 'touch run resumes', '390×844 phone controls fit'], layout, pageErrors: errors };
  } finally { await context.close(); }
}
