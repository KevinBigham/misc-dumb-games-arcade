// Bot balance harness test, run on the demo game (Pip Hop). Writes CSVs to test/out/.
const fs = require('fs'), path = require('path');
const bots = require('../gk-bots.js');
const PIP = require('../demo/pip-sim.js');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
function ok(c, name, extra) { if (c) { pass++; console.log('PASS', name, extra === undefined ? '' : extra); } else { fail++; console.log('FAIL', name, extra === undefined ? '' : extra); } }

// 1. seed sweep: course gap knob x 1000 seeds, smart bot
const t0 = Date.now();
const sw = bots.sweep({ knob: 'gap', values: [0.8, 1, 1.25], seeds: 1000, seedBase: 'pip', run: (p, sd) => PIP.runBot(sd, 'smart', p), csv: path.join(OUT, 'pip-gap-sweep.csv') });
const surv = sw.summary.map(s => s.survived_mean);
ok(sw.rows.length === 3000 && sw.errors.length === 0, 'sweep: 3 values x 1000 seeds, no crashes', ((Date.now() - t0) / 1000).toFixed(1) + ' s');
ok(surv[0] < surv[1] && surv[1] < surv[2], 'sweep: wider gaps make the course easier for the bot', surv.map(v => (v * 100).toFixed(1) + '%').join(' / '));
ok(fs.existsSync(path.join(OUT, 'pip-gap-sweep.csv')) && fs.readFileSync(path.join(OUT, 'pip-gap-sweep.csv'), 'utf8').split('\n')[0].startsWith('gap,seed,'), 'sweep: CSV written with a header row');
const scoreOut = sw.outliers.filter(o => o.metric === 'score');
ok(scoreOut.length > 0 && scoreOut.length <= 0.025 * 3000, 'sweep: flags about 1% of seeds at each end for a look', scoreOut.length + ' score outliers');
console.log('  summary:', JSON.stringify(sw.summary.map(s => ({ gap: s.gap, survived: s.survived_mean, score_p50: s.score_p50, jumps_p50: s.jumps_p50 }))));

// 2. strategy round-robin: same course, higher score wins
const play = (a, b, sd, na, nb) => { const ra = PIP.runBot(sd, na), rb = PIP.runBot(sd, nb); return ra.score > rb.score ? 1 : ra.score < rb.score ? 0 : 0.5; };
const rr = bots.roundRobin({ strategies: { early: 'early', late: 'late', smart: 'smart', ledge: 'ledge', mash: 'mash' }, games: 200, play, csv: path.join(OUT, 'pip-round-robin.csv') });
ok(rr.flags.some(f => f.strategy === 'smart'), 'round-robin: flags the strategy that beats the field over 60%', JSON.stringify(rr.overall, (k, v) => typeof v === 'number' ? +v.toFixed(2) : v));
ok(near1(Object.values(rr.overall).reduce((a, b) => a + b, 0) / 5, 0.5), 'round-robin: win rates balance to 50% on average');
function near1(a, b) { return Math.abs(a - b) < 1e-9; }

// 3. never-picked choices
ok(JSON.stringify(bots.usage({ jump: 40, dash: 3, shield: 0 }, ['jump', 'dash', 'shield', 'magnet'])) === '["shield","magnet"]', 'usage: lists choices no bot ever picked');

// 4. the demo's feel rules, checked with bots
let coy = 0, noCoy = 0; for (let i = 0; i < 300; i++) { coy += PIP.runBot('c' + i, 'ledge').survived; noCoy += PIP.runBot('c' + i, 'ledge', { coyote: 0 }).survived; }
ok(coy > 0.3 * 300 && noCoy === 0, 'coyote time: a late press just off a ledge still jumps', 'with ' + coy + '/300, without ' + noCoy + '/300');
{ // input buffer: tap 0.08 s before landing jumps on landing
  const w = PIP.make('buf'); PIP.step(w, 1 / 60, 1); let f = 0, pressedAt = -1, jumpedAt = -1;
  while (f++ < 200) { const air = !w.ground; const press = air && w.vy < 0 && w.py < 0.08 * -w.vy && pressedAt < 0 ? 1 : 0; if (press) pressedAt = w.t; PIP.step(w, 1 / 60, press); if (pressedAt > 0 && w.ev.some(e => e.k === 'jump')) { jumpedAt = w.t; break; } w.ev.length = 0; }
  ok(jumpedAt > 0 && jumpedAt - pressedAt <= 0.1, 'input buffer: a tap just before landing jumps on landing', (jumpedAt - pressedAt).toFixed(3) + ' s later');
}
{ // same seed, same course
  const a = PIP.make('daily|2026-11-06'), b = PIP.make('daily|2026-11-06');
  ok(JSON.stringify(a.course) === JSON.stringify(b.course), 'daily: same seed gives the same course on every phone');
}
console.log('\nTOTAL', pass, 'pass', fail, 'fail');
process.exit(fail ? 1 : 0);
