// Kit tests: pure modules in node, browser modules in a fake DOM (stubdom.js).
// Run: node test/test-kit.js   (prints PASS/FAIL lines and a total, exits 1 on any fail)
const fs = require('fs'), path = require('path');
const KIT = path.join(__dirname, '..', 'gamekit.js');
const SRC = fs.readFileSync(KIT, 'utf8');
const { makeEnv } = require('./stubdom.js');
let pass = 0, fail = 0;
function ok(c, name, extra) { if (c) { pass++; console.log('PASS', name, extra === undefined ? '' : extra); } else { fail++; console.log('FAIL', name, extra === undefined ? '' : extra); } }
const near = (a, b, e) => Math.abs(a - b) <= e;

(async function () {
  // ---------- pure: load with require (no DOM) ----------
  delete require.cache[KIT];
  const GK = require(KIT);

  // RNG
  const a1 = GK.rng.make('seed-1'), a2 = GK.rng.make('seed-1'), b = GK.rng.make('seed-2');
  const s1 = [], s2 = [], s3 = [];
  for (let i = 0; i < 50; i++) { s1.push(a1.next()); s2.push(a2.next()); s3.push(b.next()); }
  ok(JSON.stringify(s1) === JSON.stringify(s2), 'rng: same seed gives the same sequence');
  ok(s1.some((v, i) => v !== s3[i]), 'rng: different seeds differ');
  const bins = new Array(10).fill(0), r = GK.rng.make('uniform');
  for (let i = 0; i < 100000; i++) bins[Math.floor(r.next() * 10)]++;
  const chi = bins.reduce((s, n) => s + (n - 10000) ** 2 / 10000, 0);
  ok(chi < 27.9, 'rng: uniform over 10 bins (chi-square < 27.9, p>0.001)', chi.toFixed(2));
  let lo = 99, hi = -99; const ri = GK.rng.make('ints'); for (let i = 0; i < 20000; i++) { const v = ri.int(3, 7); lo = Math.min(lo, v); hi = Math.max(hi, v); }
  ok(lo === 3 && hi === 7, 'rng: int(lo,hi) is inclusive on both ends');
  const st = GK.rng.make('resume'); st.next(); st.next(); const saved = st.state(); const nA = [st.next(), st.next()];
  const st2 = GK.rng.make('other').load(saved); const nB = [st2.next(), st2.next()];
  ok(nA[0] === nB[0] && nA[1] === nB[1], 'rng: state() and load() resume a run exactly');
  const sub1 = GK.rng.make('run').sub('stage', 3).next(), sub2 = GK.rng.make('run').sub('stage', 3).next(), sub3 = GK.rng.make('run').sub('stage', 4).next();
  ok(sub1 === sub2 && sub1 !== sub3, 'rng: sub-seeds per stage are stable and distinct');
  const sx = GK.rng.streams('w'); const g0 = GK.rng.streams('w').game.next(); sx.fx.next(); sx.fx.next();
  ok(sx.game.next() === g0, 'rng: cosmetic fx stream never shifts the game stream');
  const perm = GK.rng.make('sh').shuffle([1, 2, 3, 4, 5, 6, 7, 8]);
  ok(perm.slice().sort().join() === '1,2,3,4,5,6,7,8', 'rng: shuffle is a permutation');
  const wc = { a: 0, b: 0 }, rw = GK.rng.make('w8'); for (let i = 0; i < 20000; i++) wc[rw.weighted(['a', 'b'], [3, 1])]++;
  ok(near(wc.a / 20000, 0.75, 0.02), 'rng: weighted pick follows weights', (wc.a / 20000).toFixed(3));
  const code = GK.rng.code('abc');
  ok(/^[BCDFGHJKLMNPQRSTVWXZ]{3}-[BCDFGHJKLMNPQRSTVWXZ]{3}-[BCDFGHJKLMNPQRSTVWXZ]{3}$/.test(code), 'rng: share code is ABC-DEF-GHI with no vowels', code);
  ok(GK.rng.normalize(code.toLowerCase().replace(/-/g, ' ')) === code, 'rng: typed code ignores case and spaces');
  ok(GK.rng.normalize('  my lucky run ') === 'my lucky run', 'rng: any other typed text becomes its own seed');
  // mulberry32 must match the version shipped in Gloamrush and Lantern Drum
  function mul(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const m1 = GK.rng.mulberry32(12345), m2 = mul(12345); let same = true; for (let i = 0; i < 1000; i++) if (m1() !== m2()) same = false;
  ok(same, 'rng: mulberry32 matches the shipped games, so their dailies do not change');
  ok(GK.rng.tries(5, i => i === 3 ? 'got' : null) === 'got' && GK.rng.tries(5, () => null) === null, 'rng: tries() is bounded by count, not time');

  // DAILY
  ok(GK.daily.key({}, new Date(2026, 10, 6, 23, 59)) === '2026-11-06', 'daily: local key near midnight is still today');
  ok(GK.daily.key({}, new Date(2026, 10, 7, 0, 1)) === '2026-11-07', 'daily: local key rolls at local midnight');
  // 6 PM Central = 00:00 UTC next day: the old UTC bug. A fixed-zone key must still read Nov 6.
  ok(GK.daily.key({ tz: 'America/Chicago' }, new Date(Date.UTC(2026, 10, 7, 0, 30))) === '2026-11-06', 'daily: 6:30 PM Central is still Nov 6 in Central time (the UTC bug)');
  ok(GK.daily.key({ tz: 'America/Chicago' }, new Date(Date.UTC(2026, 10, 7, 6, 1))) === '2026-11-07', 'daily: rolls at midnight Central');
  ok(GK.daily.msToNext({}, new Date(2026, 10, 6, 23, 59, 30)) === 30000, 'daily: countdown to next local midnight');
  ok(GK.daily.countdown(3 * 3600e3 + 5 * 60e3) === '3h 05m' && GK.daily.countdown(65e3) === '1m 05s', 'daily: countdown text');
  const ds = { days: 0, last: '' };
  GK.daily.mark(ds, '2026-11-01'); GK.daily.mark(ds, '2026-11-01'); GK.daily.mark(ds, '2026-11-05');
  ok(ds.days === 2, 'daily: counts total days played, a missed day never resets it');
  ok(GK.daily.shareLine({ game: 'Lantern Drum', key: '2026-11-06', score: 1234 }) === 'Lantern Drum Nov 6: 1234', 'daily: share line');
  ok(GK.daily.seed('lantern-drum', '2026-11-06') === 'lantern-drum|2026-11-06', 'daily: seed string matches Lantern Drum format');

  // SAVE (node: memory fallback storage)
  GK.ls.set('g.save', JSON.stringify({ a: 1 }));
  let P = GK.save.protect('g.save');
  ok(!P.restored && GK.ls.get('g.save.bak1') === JSON.stringify({ a: 1 }), 'save: protect backs up a good save, no format change');
  GK.ls.set('g.save', '{broken');
  P = GK.save.protect('g.save');
  ok(P.restored && GK.ls.get('g.save') === JSON.stringify({ a: 1 }), 'save: protect restores the newest good backup over a corrupt save');
  GK.ls.del('g.save'); P = GK.save.protect('g.save');
  ok(P.restored && JSON.parse(GK.ls.get('g.save')).a === 1, 'save: protect restores a missing save');
  for (let i = 2; i <= 6; i++) { GK.ls.set('g.save', JSON.stringify({ a: i })); GK.save.protect('g.save'); }
  ok(P.backups().length === 3 && JSON.parse(GK.ls.get('g.save.bak1')).a === 6 && JSON.parse(GK.ls.get('g.save.bak3')).a === 4, 'save: keeps exactly 3 rolling backups, newest first');
  const codeX = P.exportCode();
  GK.ls.set('g.save', JSON.stringify({ a: 99 }));
  ok(P.importCode(codeX) && JSON.parse(GK.ls.get('g.save')).a === 6, 'save: export code round-trips');
  ok(!P.importCode(codeX.slice(0, -2) + 'zz'), 'save: a damaged code is refused');
  ok(!GK.save.protect('other.key').importCode(codeX), 'save: a code from another game is refused');
  ok(!P.importCode('hello'), 'save: junk text is refused');
  const pv = GK.save.protect('v.key', { validate: raw => { try { return JSON.parse(raw).v === 1; } catch (e) { return false; } } });
  ok(!pv.restored, 'save: custom validate works with nothing saved yet');
  // store
  const S1 = GK.save.store('n.save', { version: 1, defaults: { best: 0, name: 'x', list: [] } });
  ok(S1.data.best === 0 && Array.isArray(S1.data.list), 'store: fresh save uses defaults');
  S1.data.best = 42; S1.save();
  const S2 = GK.save.store('n.save', { version: 2, defaults: { best: 0, name: 'x', list: [], coins: 5 }, migrate: (d, v) => { if (v === 1) d.coins = d.best; return d; } });
  ok(S2.data.best === 42 && S2.data.coins === 42, 'store: migrates v1 to v2 and keeps data');
  GK.ls.set('n.save', JSON.stringify({ v: 2, t: 0, d: { best: 'oops', name: 'x', list: [], coins: 1 } }));
  ok(GK.save.store('n.save', { version: 2, defaults: { best: 0, name: 'x', list: [], coins: 5 } }).data.best === 0, 'store: a wrong-typed field falls back to its default');
  GK.ls.set('n.save', 'garbage');
  const S3 = GK.save.store('n.save', { version: 2, defaults: { best: 0, name: 'x', list: [], coins: 5 } });
  ok(S3.restored && S3.data.coins >= 1, 'store: corrupt save loads from backup');
  const ec = S3.exportCode(); S3.data.coins = 777; S3.save();
  ok(S3.importCode(ec) && S3.data.coins !== 777, 'store: export and import');

  // BADGES
  const bst = {};
  const B = GK.badges.create([{ id: 'first', name: 'First', desc: 'd', test: s => s.plays >= 1 }, { id: 'clean', name: 'Clean', desc: 'no hits' }, { id: 'secret', name: 'S', desc: 'x', hidden: true }].concat(GK.badges.milestones([10], [3])), bst);
  let fired = 0; B.onEarn(() => fired++);
  B.check({ plays: 1 }); B.check({ plays: 2 });
  ok(B.has('first') && fired === 1, 'badges: earned once, event fires once');
  B.fail('clean'); ok(B.list().find(x => x.id === 'clean').state === 'failed', 'badges: failed-this-run state');
  B.startRun(); ok(B.list().find(x => x.id === 'clean').state === 'open', 'badges: a new run clears failed');
  ok(B.list().find(x => x.id === 'secret').name === '???', 'badges: hidden badges stay hidden until earned');
  B.check({ plays: 4, wins: 3 }); ok(B.has('wins3') && !B.has('plays10'), 'badges: two paths, wins path works on its own');
  B.check({ plays: 10, wins: 0 }); ok(B.has('plays10'), 'badges: plays path works on its own');

  // JUICE
  const J = GK.juice.create({ reducedMotion: false });
  J.addTrauma(1); let maxOff = 0, maxStep = 0, px = 0;
  for (let i = 0; i < 120; i++) { J.update(1 / 60); maxOff = Math.max(maxOff, Math.abs(J.x), Math.abs(J.y)); if (i) maxStep = Math.max(maxStep, Math.abs(J.x - px)); px = J.x; }
  ok(maxOff <= 10.01 && maxOff > 2, 'juice: shake stays within the max offset', maxOff.toFixed(2));
  ok(maxStep < 5, 'juice: shake moves smoothly frame to frame (noise, not random jumps)', maxStep.toFixed(2));
  const J2 = GK.juice.create({ reducedMotion: false }); J2.addTrauma(1); for (let i = 0; i < 76; i++) J2.update(1 / 60);
  ok(J2.trauma === 0, 'juice: full trauma fades in about 1.25 s');
  J2.hitstop(0.05); const scales = []; for (let i = 0; i < 10; i++) scales.push(J2.scale(1 / 60) * 60);
  ok(scales[0] === 0 && scales[2] === 0 && scales.some(v => v > 0 && v < 1) && near(scales[9], 1, 1e-9), 'juice: hitstop freezes then eases back', scales.map(v => v.toFixed(2)).join(' '));
  const sq = J.squashTo(J.squash(), 'jump'); ok(sq.sx === 0.6 && sq.sy === 1.4, 'juice: jump squash 0.6 x 1.4');
  for (let i = 0; i < 30; i++) J.squashStep(sq, 1 / 60); ok(near(sq.sx, 1, 1e-9) && near(sq.sy, 1, 1e-9), 'juice: squash recovers within half a second');
  const JR = GK.juice.create({ reducedMotion: true }); ok(JR.shakeScale < 0.5 && JR.on.flash === false, 'juice: reduced motion lowers shake and turns flashes off');
  J.on.shake = false; J.addTrauma(1); J.update(1 / 60); ok(J.x === 0 && J.y === 0, 'juice: shake toggle off means no shake');

  // INPUT helpers
  const buf = GK.input.buffer(0.1); buf.press(1.0);
  ok(buf.consume(1.08) && !buf.consume(1.09), 'input: buffered press used once inside 0.1 s');
  buf.press(1.0); ok(!buf.consume(1.2), 'input: buffered press expires after 0.1 s');
  const cy = GK.input.coyote(0.1); cy.ground(2.0); ok(cy.can(2.09) && !cy.can(2.11), 'input: coyote window 0.1 s'); cy.use(); ok(!cy.can(2.05), 'input: coyote jump used once');

  // EASE
  ok(near(GK.ease.backOut(1), 1, 1e-9) && GK.ease.backOut(0.6) > 1, 'ease: backOut overshoots and lands on 1');
  let v60 = 0, v30 = 0; for (let i = 0; i < 60; i++) v60 = GK.ease.smooth(v60, 10, 8, 1 / 60); for (let i = 0; i < 30; i++) v30 = GK.ease.smooth(v30, 10, 8, 1 / 30);
  ok(near(v60, v30, 1e-9), 'ease: smoothing gives the same result at 30 and 60 fps');

  // AUDIO render
  const buf1 = GK.audio.render({ wave: 'tri', f: 660, dur: 0.1 }, 8000), win = GK.audio.render([{ wave: 'tri', f: 523, dur: 0.12 }, { wave: 'sine', f: 1047, dur: 0.35, at: 0.3 }], 8000);
  ok(buf1.length === 801 && Math.max(...buf1.map(Math.abs)) <= 1 && Math.max(...buf1) > 0.1, 'audio: renders a sound into samples, clipped to 1');
  ok(win.length >= 0.65 * 8000, 'audio: layered sounds render to full length');

  // VIEW
  const f = GK.view.fit(400, 800, 390, 844, 'fit'); ok(near(f.scale, 0.975, 1e-9) && near(f.y, (844 - 780) / 2, 1e-9), 'view: fit letterboxes');
  const ff = GK.view.fit(400, 800, 390, 844, 'fitfill'); ok(near(ff.w * ff.scale, 390, 1e-9) && near(ff.h * ff.scale, 844, 1e-9), 'view: fit-then-fill covers the screen with no bars');

  // ---------- browser modules in a fake iPhone ----------
  {
    const E = makeEnv({ ua: undefined });
    E.run(SRC, 'gamekit.js'); const G = E.win.GK;
    ok(G && G.env.ios, 'dom: kit loads in a page and detects iPhone');
    G.audio.init(); G.audio.std();
    ok(E.win.navigator.audioSession.type === 'playback', 'audio: sets the audio session to playback (ringer switch)');
    E.tap(null);
    await E.flush();
    ok(G.audio.ctx && G.audio.ctx.state === 'running' && G.audio.unlocked, 'audio: first tap creates and unlocks the context');
    ok(E.log.htmlAudio === 1, 'audio: plays the silent media element once on the first tap');
    ok(!(E.win._h.pointerdown || []).length || !(E.win._h.touchend || []).some(fn => fn.name === 'gesture'), 'audio: unlock listeners removed once running');
    ok(G.audio.play('tap'), 'audio: plays a sound');
    const rates = []; for (let i = 0; i < 40; i++) { E.frame(40); G.audio.play('combo'); const n = E.log.audioPlays[E.log.audioPlays.length - 1]; rates.push(n.playbackRate.value); }
    ok(Math.min(...rates) >= 0.95 && Math.max(...rates) <= 1.05 && new Set(rates).size > 10, 'audio: pitch varies within +/-5%');
    const before = E.log.audioPlays.length; G.audio.play('win'); G.audio.play('win');
    ok(E.log.audioPlays.length - before === 1, 'audio: same sound twice in 25 ms plays once');
    G.audio.ctx._set('interrupted');
    ok(!G.audio.play('tap') && !G.audio.unlocked, 'audio: a phone call interruption stops sound');
    E.tap(null); await E.flush();
    ok(G.audio.ctx.state === 'running' && G.audio.unlocked, 'audio: next tap after an interruption brings sound back');
    G.audio.ctx._set('suspended'); E.hide(); E.show(); await E.flush();
    ok(G.audio.ctx.state === 'running', 'audio: coming back to the tab resumes sound');
    E.frames(40, 20);
    ok(E.storage.get('gk.ringerHint') === '1', 'audio: ringer hint shown once and remembered');
    G.audio.setMuted(true); ok(!G.audio.play('success'), 'audio: mute works'); G.audio.setMuted(false);

    // haptics on iPhone: hidden switch label clicked
    const ok1 = G.juice.haptic('tap'); ok(ok1 === true && E.log.labelClicks === 1, 'haptics: iPhone switch tick fires');

    // input layer
    const cv = new E.El('canvas'); cv.width = 390; cv.height = 844;
    const H = G.input.attach(cv, { stick: { dead: 0.1, radius: 50 } });
    const dn = cv.fire('pointerdown', { pointerId: 3, clientX: 100, clientY: 500, pointerType: 'touch' });
    ok(dn.defaultPrevented && cv.style.touchAction === 'none', 'input: touch does not scroll or zoom the page');
    cv.fire('pointermove', { pointerId: 3, clientX: 103, clientY: 500 });
    ok(H.stick.x === 0, 'input: stick ignores a small wobble (dead zone)');
    cv.fire('pointermove', { pointerId: 3, clientX: 200, clientY: 500 });
    ok(near(H.stick.x, 1, 1e-9) && H.stick.ox === 150, 'input: stick follows the thumb past its edge');
    cv.fire('pointerup', { pointerId: 3, clientX: 200, clientY: 500 });
    const q = H.drain(); ok(q.length === 2 && q[0].type === 'down' && q[1].type === 'up' && H.drain().length === 0, 'input: presses are latched and drained once');
    ok(cv.fire('contextmenu', {}).defaultPrevented, 'input: long press menu blocked');

    // view
    G.view.init();
    ok(/viewport-fit=cover/.test(E.document.head.children[0].attrs.content), 'view: adds viewport-fit=cover when missing');
    ok(G.view.insets.t === 47 && G.view.insets.b === 34, 'view: reads safe-area insets');
    ok(G.view.dpr() === 2, 'view: caps pixel ratio at 2');

    // juice panel by 5 taps in the corner
    const JJ = G.juice.create(); const panel = G.juice.panel(JJ, [{ label: 'big numbers', get: () => true, set: () => {} }]);
    for (let i = 0; i < 5; i++) { E.frame(100); E.win.fire('pointerdown', { clientX: 10, clientY: 10 }); }
    ok(panel.open, 'juice panel: 5 quick taps in the top-left corner open it');
    panel.el.fire('change', { target: { dataset: { k: 'shake' }, checked: false } });
    ok(JJ.on.shake === false, 'juice panel: toggles change the live effect');
    for (let i = 0; i < 5; i++) { E.frame(100); E.win.fire('pointerdown', { clientX: 10, clientY: 10 }); }
    ok(!panel.open, 'juice panel: 5 more taps close it');

    // save on hide
    let saved = 0; G.save.onHide(() => saved++); E.hide(); ok(saved >= 1, 'save: saves when the page is hidden or closed'); E.show();

    // loop and hitstop
    let ups = 0; const Jl = G.juice.create(); const L = G.loop(() => ups++, null, { juice: Jl }).start();
    E.frames(61, 1000 / 60); ok(ups >= 58 && ups <= 61, 'loop: fixed 60 steps per second', ups);
    ups = 0; Jl.hitstop(0.1); E.frames(6, 1000 / 60); ok(ups === 0, 'loop: hitstop freezes the game steps');
    E.hide(); ups = 0; E.frames(30, 1000 / 60); ok(ups === 0, 'loop: pauses while hidden'); E.show(); L.stop();
  }
  // Android: vibrate
  {
    const E = makeEnv({ ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/130 Mobile', vibrate: true });
    E.run(SRC); const G = E.win.GK;
    G.juice.haptic('hit'); ok(E.log.vibs[0] === 18 && !E.log.labelClicks, 'haptics: Android uses vibrate');
    G.audio.init(); G.audio.std(); E.tap(null); await E.flush(); G.audio.play('tap'); E.frames(40, 20);
    ok(!E.storage.get('gk.ringerHint'), 'audio: no ringer hint off iPhone');
  }
  // juice panel via #juice
  {
    const E = makeEnv({ hash: '#juice' }); E.run(SRC); const G = E.win.GK;
    const p = G.juice.panel(G.juice.create()); E.frame(); ok(p.open, 'juice panel: opens with #juice in the address');
  }
  // share fallbacks
  for (const [label, opts, want] of [
    ['share sheet', { share: 'ok' }, 'shared'],
    ['user cancels share', { share: 'abort' }, 'cancel'],
    ['share blocked, clipboard', { share: 'fail' }, 'copied'],
    ['no share, clipboard', {}, 'copied'],
    ['no share, clipboard denied, legacy copy', { clipboardFails: true, execCopyWorks: true }, 'copied'],
    ['nothing works, text sheet', { noClipboard: true }, 'sheet']
  ]) {
    const E = makeEnv(opts); E.run(SRC); const G = E.win.GK;
    const res = await G.share.text('Gloamrush: 1234');
    ok(res === want, 'share: ' + label + ' -> ' + want, res);
    if (want === 'sheet') ok(E.document.body.children.some(c => c.className === 'gk-sheet'), 'share: selectable text sheet shown as the last fallback');
  }
  // storage blocked entirely (private mode): nothing throws
  {
    const E = makeEnv({ noStorage: true }); E.run(SRC); const G = E.win.GK;
    const S = G.save.store('x', { defaults: { a: 1 } }); S.data.a = 2; S.save();
    ok(E.log.errors.length === 0 && G.save.store('x', { defaults: { a: 1 } }).data.a === 2, 'save: works in memory when storage is blocked');
  }
  {
    const E = makeEnv({ storageFull: true }); E.run(SRC); const G = E.win.GK;
    const S = G.save.store('x', { defaults: { a: 1 } }); ok(S.save() === false && E.log.errors.length === 0, 'save: full storage reports false and does not crash');
  }
  console.log('\nTOTAL', pass, 'pass', fail, 'fail');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('CRASH', e.stack); process.exit(1); });
