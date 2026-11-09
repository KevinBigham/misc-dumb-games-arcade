// Page test in the kit's fake browser (no real layout, raster, audio or touch). Proves the page's code paths at phone sizes.
// node test/test-page.js [w] [h]
const fs = require('fs'), path = require('path');
const { makeEnv } = require('../../../kit/test/stubdom.js');
const Bots = require('./bots.js');
const HTML = fs.readFileSync(path.join(__dirname, '..', 'artifact-body.html'), 'utf8');
const scripts = []; { const re = /<script id="(\w+)">([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(HTML))) scripts.push([m[1], m[2]]); }
const ids = [...HTML.matchAll(/id="([\w-]+)"/g)].map(m => m[1]);
const W0 = +(process.argv[2] || 390), H0 = +(process.argv[3] || 844);
let pass = 0, fail = 0;
const ok = (c, name, extra) => { if (c) pass++; else fail++; console.log(c ? 'PASS' : 'FAIL', name, extra === undefined ? '' : extra); };
function boot(store, extra) {
  const E = makeEnv(Object.assign({ ids, storage: store, w: W0, h: H0 }, extra || {}));
  const fonts = []; let calls = 0;
  E.El.prototype.getContext = function () {
    return new Proxy({}, { get(t, k) { if (k in t) return t[k]; if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => ({ addColorStop() {} }); if (k === 'measureText') return s => ({ width: String(s).length * 7 }); return () => { calls++; }; }, set(t, k, v) { if (k === 'font') fonts.push(v); t[k] = v; return true; } });
  };
  ['over', 'pause', 'badges'].forEach(id => { E.byId[id].hidden = true; });
  for (const [id, src] of scripts) E.run(src, id);
  E.frames(4);
  return { E, fonts, calls: () => calls, T: E.win.__LST };
}
const drag = (E, pts) => { const cv = E.byId.cv; cv.fire('pointerdown', { pointerId: 7, pointerType: 'touch', clientX: pts[0][0], clientY: pts[0][1], cancelable: true }); for (const p of pts.slice(1)) { cv.fire('pointermove', { pointerId: 7, clientX: p[0], clientY: p[1], cancelable: true }); E.frames(3); } };
const lift = (E, p) => E.byId.cv.fire('pointerup', { pointerId: 7, clientX: p[0], clientY: p[1] });

(async () => {
  const store = new Map();
  let { E, fonts, T, calls } = boot(store);
  ok(T && T.mode() === 'play' && !T.world().started && E.log.errors.length === 0, 'opens straight into play, waiting for the first drag, no errors', W0 + 'x' + H0);
  const fit = T.fit();
  ok(fit.s > 0.7 && fit.x >= 0 && fit.x + 360 * fit.s <= W0 + 0.5, 'pond fits the screen width', JSON.stringify({ s: +fit.s.toFixed(3), x: +fit.x.toFixed(1), y: +fit.y.toFixed(1), bottom: +(fit.y + 640 * fit.s).toFixed(0) }));
  ok(fit.y + 640 * fit.s <= H0 - 34 + 0.5, 'pond stays above the bottom safe area');
  // real drag: press, then drag right; the skater starts and turns toward the drag
  const a0 = T.world().sk.a;
  drag(E, [[200, 600], [210, 600], [230, 600], [250, 600], [260, 600]]);
  E.frames(20);
  const w = T.world();
  ok(w.started && Math.abs(LSang(w.sk.a)) < 0.3 && Math.abs(a0 + Math.PI / 2) < 1e-6, 'a real drag starts the run and steers the skater toward the drag', 'heading ' + w.sk.a.toFixed(2));
  lift(E, [260, 600]); E.frames(30);
  ok(T.save().plays === 1, 'the run counts once it starts', T.save().plays);
  // bot plays the rest through the page's own loop
  T.setBot(Bots.orbitBot({ seed: 5 }));
  let f = 0; const times = [];
  while (T.mode() === 'play' && f++ < 60 * 400) { const t0 = process.hrtime.bigint(); E.frame(1000 / 60); times.push(Number(process.hrtime.bigint() - t0) / 1e6); }
  E.frames(90); await E.flush();
  const r = T.result();
  ok(T.mode() === 'over' && !E.byId.over.hidden, 'the run ends and the result card shows', r && (r.cause + ' score ' + r.score + ' waves ' + r.waves));
  ok(E.byId.oScore.textContent === String(r.score) && /open water|burrbug|thawed/.test(E.byId.oWhy.textContent), 'result card has the score and why it ended', E.byId.oWhy.textContent);
  ok(/<button id="bAgain">Again<\/button>/.test(HTML) && /#bAgain\{width:100%;min-height:72px/.test(HTML) && /\.row button,\.btn\{flex:1;min-height:48px/.test(HTML), 'Again is the biggest button on the card (full width, 72px tall; the others are 48px)');
  times.sort((a, b) => a - b);
  const avg = times.reduce((x, y) => x + y, 0) / times.length, p95 = times[Math.floor(times.length * 0.95)], p99 = times[Math.floor(times.length * 0.99)];
  ok(p95 < 4, 'page JS per frame well under a 16.7 ms budget (fake browser, no raster)', 'avg ' + avg.toFixed(2) + ' ms, p95 ' + p95.toFixed(2) + ', p99 ' + p99.toFixed(2) + ' over ' + times.length + ' frames');
  ok(T.DBG.minFont >= 12 && fonts.every(s => +(/(\d+(?:\.\d+)?)px/.exec(s) || [0, 99])[1] >= 12), 'every canvas text is 12px or larger', 'smallest ' + T.DBG.minFont + 'px of ' + fonts.length + ' font sets');
  const ft = T.DBG.flashTimes; let worst = 0; for (let i = 0; i < ft.length; i++) { let n = 0; for (let j = i; j < ft.length && ft[j] - ft[i] < 1000; j++) n++; worst = Math.max(worst, n); }
  ok(worst <= 3, 'never more than 3 flashes in a second during play', 'flashes ' + ft.length + ', worst second ' + worst);
  // flash gate under stress
  let allowed = 0; for (let i = 0; i < 20; i++) { if (T.flash(0.3)) allowed++; E.frame(16); }
  ok(allowed === 3, 'flash gate allows only 3 of 20 back-to-back flash requests', allowed);
  // share
  E.byId.bShare.fire('click', {}); await E.flush();
  ok(E.log.clip.length === 1 && /^Loopskate: \d+ on pond [A-Z]{3}-[A-Z]{3}-[A-Z]{3}/.test(E.log.clip[0]), 'Share copies the result line', JSON.stringify(E.log.clip[0]));
  // Again restarts instantly
  const oldSeed = T.world().seed; T.setBot(null); E.byId.bAgain.onclick(); E.frames(2);
  ok(T.mode() === 'play' && E.byId.over.hidden && !T.world().started && T.world().seed !== oldSeed, 'Again starts a fresh pond at once');
  // daily
  T.setBot(null); E.byId.bAgain.onclick(); // ensure play
  T.start('daily'); E.frames(2);
  ok(T.world().seed === E.win.GK.daily.seed('loopskate'), "Daily pond uses today's seed on the player's clock", T.world().seed);
  T.setBot(Bots.orbitBot({ seed: 9 })); f = 0; while (T.mode() === 'play' && f++ < 60 * 400) E.frame(1000 / 60); E.frames(90); await E.flush();
  E.byId.bShare.fire('click', {}); await E.flush();
  ok(/^Loopskate Nov \d+: \d+\n🧊*(💦|🦔|🌡️)/u.test(E.log.clip[1] || ''), 'daily share line has the date and a wave grid', JSON.stringify(E.log.clip[1]));
  ok(T.save().daily.plays === 1 && T.save().daily.key === E.win.GK.daily.key(), 'daily plays and best are kept for today', JSON.stringify(T.save().daily));
  // pause on hide: time frozen
  T.setBot(Bots.orbitBot({ seed: 2 })); T.start('free'); E.frames(30);
  const t1 = T.world().t; E.hide(); E.frames(30); const t2 = T.world().t;
  ok(T.mode() === 'paused' && !E.byId.pause.hidden && t1 === t2, 'hiding the page pauses the run and freezes its clock', t1.toFixed(3) + ' -> ' + t2.toFixed(3));
  E.show(); E.byId.bResume.onclick(); E.frames(10);
  ok(T.mode() === 'play' && T.world().t > t2, 'Resume carries on');
  E.byId.bPause.fire('click', {}); E.byId.bPause.onclick(); ok(T.mode() === 'paused', 'pause button pauses'); E.byId.bResume.onclick();
  E.byId.bSound.onclick(); ok(T.save().muted === true, 'sound toggle saves'); E.byId.bSound.onclick();
  E.byId.bBadges.onclick(); ok(!E.byId.badges.hidden && /gk-badges/.test(E.byId.badgeList.innerHTML), 'badges screen renders'); E.byId.bBadgesClose.onclick();
  E.hide(); // save on hide
  const saved = JSON.parse(store.get('loopskate.v1'));
  ok(saved.v === 1 && saved.d.plays >= 3 && saved.d.best > 0, 'progress is written to the versioned save', 'plays ' + saved.d.plays + ' best ' + saved.d.best + ' badges ' + Object.keys(saved.d.badges).join(','));
  ok(E.log.errors.length === 0, 'no page errors in the whole session', E.log.errors.slice(0, 3).join(' | '));

  // reload: same storage
  const before = JSON.parse(store.get('loopskate.v1')).d;
  let R = boot(store);
  ok(R.T.save().best === before.best && R.T.save().plays === before.plays && Object.keys(R.T.save().badges).length === Object.keys(before.badges).length && R.E.log.errors.length === 0, 'reload keeps best, plays and badges', 'best ' + R.T.save().best);
  ok(R.T.save().mode === before.mode, 'reload remembers free or daily');
  // damaged save comes back from a backup
  store.set('loopskate.v1', '{oops');
  R = boot(store);
  ok(R.T.S.restored && R.T.save().best === before.best && R.E.log.errors.length === 0, 'a damaged save is restored from a backup', 'best ' + R.T.save().best);
  // hostile values are cleaned
  store.set('loopskate.v1', JSON.stringify({ v: 1, t: 0, d: { best: 'lots', plays: -4, daily: 7, days: null, badges: [1, 2], tips: 'x', muted: 'yes', mode: 'hack' } }));
  R = boot(store); R.E.frames(30);
  const hd = R.T.save();
  ok(hd.best === 0 && hd.plays === 0 && hd.daily.best === 0 && hd.days.days === 0 && !Array.isArray(hd.badges) && hd.muted === false && hd.mode === 'free' && R.E.log.errors.length === 0, 'a hostile save is cleaned to safe values', JSON.stringify(hd).slice(0, 160));
  console.log('\nTOTAL', pass, 'pass', fail, 'fail'); process.exit(fail ? 1 : 0);
})().catch(e => { console.log('CRASH', e.stack); process.exit(1); });
function LSang(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
