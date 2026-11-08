// UI test: headless Chromium at phone size. Needs @sparticuz/chromium (installed in the scratchpad) and Playwright.
// usage: node tools/play.mjs <file.html> [tag]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const SCR = '/tmp/claude-0/-home-user/1aa89d75-80e8-5fd6-8c67-31f89c99d232/scratchpad/chr/node_modules/';
const chromium = (await import(SCR + '@sparticuz/chromium/build/index.js')).default;
const { chromium: pw } = require('/opt/node-tools/node_modules/playwright');
const FILE = process.argv[2], TAG = process.argv[3] || 'r1', OUT = new URL('../shots/', import.meta.url).pathname;
const b = await pw.launch({ executablePath: await chromium.executablePath(), args: chromium.args.filter(a => !/use-gl|use-angle|enable-unsafe-swiftshader/.test(a)).concat(['--disable-gpu', '--autoplay-policy=no-user-gesture-required']), headless: true });
const W = +(process.env.W || 375), H = +(process.env.H || 667);
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
const cdp = await ctx.newCDPSession(p);
const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((q, i) => ({ x: q[0], y: q[1], id: q[2] ?? i })) });
const st = () => p.evaluate(() => { const r = __LWT.race(); if (!r) return { mode: __LWT.mode() }; const q = r.p; return { mode: __LWT.mode(), phase: q.phase, lap: q.lap, lx: +q.lx.toFixed(2), v: +q.v.toFixed(2), tank: +q.tank.toFixed(0), o2: +q.o2.toFixed(0), t: +(r.t - r.beepT).toFixed(2), grades: q.log.grades, finish: q.finish }; });
await p.goto('file://' + FILE); await p.waitForTimeout(800);
console.log('scroll', await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth })));
await p.screenshot({ path: OUT + TAG + '-01-title.png' });
await p.tap('#tGo'); await p.waitForTimeout(300); await p.screenshot({ path: OUT + TAG + '-02-pre.png' });
await p.tap('#pGo'); await p.waitForTimeout(600);
const Lp = await p.evaluate(() => __LWT.layout());
const padY = Lp.padTop + Lp.padH / 2, padL = Lp.colX + Lp.colW * 0.25, padR = Lp.colX + Lp.colW * 0.75;
console.log('pads', padL, padR, padY, await st());
// wait for the beep, then real touches: start, kicks, hold to break out, strokes
for (let i = 0; i < 60; i++) { const s = await st(); if (s.phase === 'set') break; await p.waitForTimeout(50); }
await p.screenshot({ path: OUT + TAG + '-03-beep.png' });
await touch('touchStart', [[padL, padY, 1]]); await touch('touchEnd', []);
await p.waitForTimeout(1300); console.log('after start', await st());
await touch('touchStart', [[padR, padY, 2]]); await touch('touchEnd', []); await p.waitForTimeout(400);
await touch('touchStart', [[padL, padY, 3]]); await p.waitForTimeout(300); await touch('touchEnd', []);
await p.waitForTimeout(200); console.log('after hold (should be swim)', await st());
for (let k = 0; k < 6; k++) { const side = k % 2 ? padL : padR; await touch('touchStart', [[side, padY, 10 + k]]); await touch('touchEnd', []); await p.waitForTimeout(560); }
console.log('after 6 real strokes', await st());
await p.screenshot({ path: OUT + TAG + '-04-swim.png' });
// push pill
await touch('touchStart', [[Lp.colX + Lp.colW / 2, Lp.stripY + 22, 30]]); await touch('touchEnd', []); await p.waitForTimeout(100);
console.log('push', await p.evaluate(() => __LWT.race().p.push));
// pause via visibility, then resume
await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
await p.waitForTimeout(200); const t1 = (await st()).t; await p.waitForTimeout(600); const t2 = (await st()).t;
console.log('hidden -> mode', (await st()).mode, 'clock frozen', t1 === t2, 'audio', await p.evaluate(() => __LWT && document.hidden));
await p.screenshot({ path: OUT + TAG + '-05-pause.png' });
await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); });
await p.tap('#uResume'); await p.waitForTimeout(100);
// in-page rhythm bot finishes the race
await p.evaluate(() => {
  const LW = __LWT.LW; let tgt = null, n = 0, ups = [], flipAt = null, lastKey = '';
  __LWT.bot = () => {
    const r = __LWT.race(); if (!r || r.over) return; const q = r.p, t = r.t;
    ups = ups.filter(u => { if (t >= u.t) { LW.raceInput(r, { t, type: 'up', side: u.s }); return false; } return true; });
    const key = q.phase + q.lap; if (key !== lastKey) { lastKey = key; tgt = null; flipAt = null; }
    const press = (s, hold) => { LW.raceInput(r, { t, type: 'down', side: s }); ups.push({ t: t + (hold ? 0.22 : 0.05), s }); };
    if (q.phase === 'set') press('L');
    else if (q.phase === 'uw') { if (t >= q.uw.readyT) press('L', q.lx > 8); }
    else if (q.phase === 'swim') {
      const S = LW.strokeDef(r), d = LW.wallDist(r), fin = LW.isFinalLap(r);
      if (!fin && LW.turnKindFor(r) === 'flip' && d <= 1.95) { press('B'); return; }
      if (d <= 0.8 && (fin || LW.turnKindFor(r) === 'open')) { press('B'); return; }
      if (t >= q.readyT) { n++; press(S.pattern === 'alt' ? q.nextArm : 'B', S.breath && n % 3 === 0); }
    }
  };
});
for (let i = 0; i < 80; i++) { await p.waitForTimeout(500); const s = await st(); if (i === 8) await p.screenshot({ path: OUT + TAG + '-06-mid.png' }); if (s.finish) break; }
await p.waitForTimeout(400); await p.screenshot({ path: OUT + TAG + '-07-touch.png' });
await p.waitForTimeout(2600); console.log('end', await st());
await p.screenshot({ path: OUT + TAG + '-08-results.png', fullPage: false });
console.log('save', await p.evaluate(() => JSON.stringify({ rung: __LWT.save().rung, best: Object.keys(__LWT.save().best), races: __LWT.save().stats.races })));
// reload keeps progress
await p.reload(); await p.waitForTimeout(700);
console.log('after reload', await p.evaluate(() => JSON.stringify({ rung: __LWT.save().rung, best: Object.keys(__LWT.save().best) })));
// corrupt save -> recovers with backup
await p.evaluate(() => localStorage.setItem('lanewake.v1', '{"v":1,"rung":"lots","best":{"free-50":{"time":-3}},"settings":7'));
await p.reload(); await p.waitForTimeout(700);
console.log('corrupt -> ', await p.evaluate(() => ({ rung: __LWT.save().rung, bad: !!localStorage.getItem('lanewake.v1.bad'), toast: document.getElementById('toast').textContent })));
await p.evaluate(() => localStorage.setItem('lanewake.v1', JSON.stringify({ v: 1, rung: 99, best: { 'free-50': { time: 20.5, ghost: [1, 'x'] } }, medals: { c1: 9 } })));
await p.reload(); await p.waitForTimeout(500);
console.log('hostile -> ', await p.evaluate(() => JSON.stringify(__LWT.save()).slice(0, 220)));
// screens at phone width
for (const id of ['tLadder', 'tQuick', 'tHelp', 'tSet']) { await p.evaluate(() => document.querySelectorAll('.scr').forEach(s => s.hidden = true)); await p.evaluate(() => { document.getElementById('sTitle').hidden = false; }); await p.tap('#' + id); await p.waitForTimeout(200); await p.screenshot({ path: OUT + TAG + '-scr-' + id + '.png' }); console.log(id, await p.evaluate(() => ({ sw: document.documentElement.scrollWidth }))); }
console.log('ERRORS', errs.length ? errs : 'none');
await b.close();
