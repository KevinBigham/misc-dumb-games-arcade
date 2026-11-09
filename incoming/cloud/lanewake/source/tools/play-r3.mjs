// Round 3 UI test: rival final, stroke unlock card, records screen, ladder summary, a recall at a rookie meet.
// usage: node tools/play-r3.mjs <file.html> [tag]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const SCR = '/tmp/claude-0/-home-user/1aa89d75-80e8-5fd6-8c67-31f89c99d232/scratchpad/chr/node_modules/';
const chromium = (await import(SCR + '@sparticuz/chromium/build/index.js')).default;
const { chromium: pw } = require('/opt/node-tools/node_modules/playwright');
const FILE = process.argv[2], TAG = process.argv[3] || 'r3', OUT = new URL('../shots/', import.meta.url).pathname;
const b = await pw.launch({ executablePath: await chromium.executablePath(), args: chromium.args.filter(a => !/use-gl|use-angle|enable-unsafe-swiftshader/.test(a)).concat(['--disable-gpu']), headless: true });
const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
const cdp = await ctx.newCDPSession(p);
const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((q, i) => ({ x: q[0], y: q[1], id: q[2] ?? i })) });
const installBot = () => p.evaluate(() => {
  const LW = __LWT.LW; let n = 0, ups = [], lastKey = '';
  __LWT.bot = () => {
    const r = __LWT.race(); if (!r || r.over) return; const q = r.p, t = r.t;
    ups = ups.filter(u => { if (t >= u.t) { LW.raceInput(r, { t, type: 'up', side: u.s }); return false; } return true; });
    const key = q.phase + q.lap; if (key !== lastKey) lastKey = key;
    const press = (s, hold) => { LW.raceInput(r, { t, type: 'down', side: s }); ups.push({ t: t + (hold ? 0.22 : 0.05), s }); };
    if (q.phase === 'set') press('L');
    else if (q.phase === 'uw') { if (t >= q.uw.readyT) press('L', q.lx > 8 || q.uw.kicks >= LW.strokeDef(r).uwMax); }
    else if (q.phase === 'swim') {
      const S = LW.strokeDef(r), d = LW.wallDist(r), fin = LW.isFinalLap(r);
      if (!fin && LW.turnKindFor(r) === 'flip' && d <= 1.95) { press('B'); return; }
      if (d <= 0.8 && (fin || LW.turnKindFor(r) === 'open')) { press(S.pattern === 'alt' ? q.nextArm : 'B'); return; }
      if (t >= q.readyT) { n++; press(S.pattern === 'alt' ? q.nextArm : 'B', S.breath && n % 3 === 0); }
    }
  };
});
const waitFinish = async () => { for (let i = 0; i < 120; i++) { await p.waitForTimeout(500); if (await p.evaluate(() => __LWT.mode() === 'menu')) return; } };
// seed a save: rung 1 (next final is the 100 free at Splashdown), so a medal unlocks backstroke
await p.goto('file://' + FILE); await p.waitForTimeout(500);
await p.evaluate(() => localStorage.setItem('lanewake.v1', JSON.stringify({ v: 1, rung: 1, medals: { c1: 2 }, best: {}, stats: { races: 3, wins: 0, perfect: 40, strokes: 90 }, seen: { intro: true } })));
await p.reload(); await p.waitForTimeout(600);
// 1. recall at a rookie meet: real touch during "take your mark"
await p.tap('#tGo'); await p.waitForTimeout(250); await p.tap('#pGo'); await p.waitForTimeout(300);
const Lp = await p.evaluate(() => __LWT.layout()); const padY = Lp.padTop + Lp.padH / 2, padL = Lp.colX + Lp.colW * 0.25;
for (let i = 0; i < 60; i++) { if (await p.evaluate(() => __LWT.race().p.phase === 'marks')) break; await p.waitForTimeout(40); }
await touch('touchStart', [[padL, padY, 1]]); await touch('touchEnd', []); await p.waitForTimeout(150);
console.log('recall', await p.evaluate(() => ({ phase: __LWT.race().p.phase, recalls: __LWT.race().p.log.recalls, banner: __LWT.fx.banner && __LWT.fx.banner.txt })));
await p.screenshot({ path: OUT + TAG + '-01-recall.png' });
await installBot(); await waitFinish();
await p.waitForTimeout(300); await p.screenshot({ path: OUT + TAG + '-02-results-unlock.png' });
console.log('after c2', await p.evaluate(() => ({ rung: __LWT.save().rung, unlockShown: !document.getElementById('rUnlock').hidden, unl: document.getElementById('rUnlockName').textContent, sub: document.getElementById('rSub').textContent })));
await p.evaluate(() => document.getElementById('rUnlock').scrollIntoView()); await p.waitForTimeout(100); await p.screenshot({ path: OUT + TAG + '-03-unlock-card.png' });
// 2. try-it button opens a backstroke practice
await p.tap('#rTry'); await p.waitForTimeout(250);
console.log('try', await p.evaluate(() => ({ ev: document.getElementById('pEvent').textContent, meet: document.getElementById('pMeet').textContent })));
await p.tap('#pBack'); await p.waitForTimeout(200);
// 3. rival final (c3): pre screen and race start
await p.evaluate(() => __LWT.showPre(__LWT.ladderSpec(2))); await p.waitForTimeout(200);
console.log('pre rival', await p.evaluate(() => document.getElementById('pNote').textContent));
await p.screenshot({ path: OUT + TAG + '-04-pre-rival.png' });
await p.tap('#pGo'); await p.waitForTimeout(1200); await p.screenshot({ path: OUT + TAG + '-05-rival-blocks.png' });
await installBot(); await waitFinish(); await p.waitForTimeout(300);
console.log('rival result', await p.evaluate(() => ({ sub: document.getElementById('rSub').textContent, rival: __LWT.save().rival })));
await p.screenshot({ path: OUT + TAG + '-06-rival-results.png' });
// 4. ladder summary and records
await p.tap('#rMenu'); await p.waitForTimeout(200); await p.screenshot({ path: OUT + TAG + '-07-title.png' });
await p.tap('#tLadder'); await p.waitForTimeout(200); await p.screenshot({ path: OUT + TAG + '-08-ladder.png' });
console.log('ladder sum', await p.evaluate(() => document.getElementById('lSum').textContent));
await p.tap('#lBack'); await p.waitForTimeout(150); await p.tap('#tRec'); await p.waitForTimeout(200);
await p.screenshot({ path: OUT + TAG + '-09-records.png' });
console.log('records rows', await p.evaluate(() => document.querySelectorAll('#recTable tr').length), 'scrollW', await p.evaluate(() => document.documentElement.scrollWidth));
// 5. a record-breaking save shows a star
await p.evaluate(() => { const s = __LWT.save(); s.best['free-50'] = { time: 20.0, ghost: null, date: '' }; __LWT.store.write(); });
await p.tap('#recBack'); await p.waitForTimeout(100); await p.tap('#tRec'); await p.waitForTimeout(150);
console.log('star', await p.evaluate(() => document.querySelector('#recTable td.st').textContent), 'title sub', await p.evaluate(() => document.getElementById('tRecSub').textContent));
console.log('ERRORS', errs.length ? errs.join('\n') : 'none');
await b.close();
