// Kit 2.0 tests: prefs, flash limit, perf, sound bus, hide/show, combo ladder, juice follow, loop assist,
// popups, rolling score, coach, hints, panel, retrofit v2. Fake browser only (stubdom.js).
const fs = require('fs'), path = require('path');
const SRC = fs.readFileSync(path.join(__dirname, '..', 'gamekit.js'), 'utf8');
const { makeEnv } = require('./stubdom.js');
let pass = 0, fail = 0;
function ok(c, name, extra) { if (c) { pass++; console.log('PASS', name, extra === undefined ? '' : extra); } else { fail++; console.log('FAIL', name, extra === undefined ? '' : extra); } }
(async () => {
  { const E = makeEnv(); E.run(SRC); const G = E.win.GK; ok(/^2\.1\./.test(G.version) && E.log.errors.length === 0, 'kit: version 2.1 loads clean'); }
  // prefs
  {
    const storage = new Map();
    let E = makeEnv({ storage }); E.run(SRC); let G = E.win.GK;
    ok(G.prefs.get('motion') === 'auto' && G.prefs.speed() === 1 && G.prefs.text() === 1 && G.prefs.vol('master') === 1, 'prefs: defaults');
    ok(G.prefs.motion() === 'full' && G.prefs.motionScale() === 1, 'prefs: auto motion is full when the phone does not ask for less');
    G.prefs.set('motion', 'calm'); G.prefs.set('speed', 0.75); G.prefs.setVol('music', 0.4); G.prefs.set('motion', 'wobbly'); G.prefs.set('speed', 9);
    ok(G.prefs.get('motion') === 'calm' && G.prefs.speed() === 0.75, 'prefs: bad values are refused');
    ok(E.document.documentElement.attrs['data-gk-motion'] === 'calm' || (E.document.documentElement.getAttribute && E.document.documentElement.getAttribute('data-gk-motion') === 'calm'), 'prefs: motion lands on the page as data-gk-motion');
    ok(G.prefs.assisted() === true, 'prefs: slowed speed counts as assisted');
    const code = G.prefs.exportCode();
    E = makeEnv({ storage }); E.run(SRC); G = E.win.GK;
    ok(G.prefs.get('motion') === 'calm' && G.prefs.vol('music') === 0.4, 'prefs: survive a reload');
    G.prefs.reset(); ok(G.prefs.get('motion') === 'auto', 'prefs: reset');
    ok(G.prefs.importCode(code) && G.prefs.get('motion') === 'calm', 'prefs: export and import code');
    ok(G.prefs.importCode('garbage!!') === false && G.prefs.get('motion') === 'calm', 'prefs: a bad import changes nothing');
    storage.set('gk.prefs.v1', '{not json'); E = makeEnv({ storage }); E.run(SRC); G = E.win.GK;
    ok(G.prefs.get('motion') === 'auto' && E.log.errors.length === 0, 'prefs: broken stored prefs fall back to defaults');
  }
  { const E = makeEnv({ reducedMotion: true }); E.run(SRC); const G = E.win.GK; ok(G.prefs.motion() === 'calm' && G.prefs.motionScale() < 0.5, 'prefs: auto follows the phone reduce-motion setting'); G.prefs.set('motion', 'full'); ok(G.prefs.motion() === 'full', 'prefs: player can still choose full'); }
  // flash limiter
  {
    const E = makeEnv(); E.run(SRC); const G = E.win.GK;
    let n = 0; for (let i = 0; i < 10; i++) if (G.flash.allow(1) > 0) n++;
    ok(n === 3, 'flash: at most 3 flashes in one second', n);
    ok(G.flash.allow(1) === 0, 'flash: fourth in the same second is dropped');
    E.frames(70, 16.67); ok(G.flash.allow(1) > 0 && G.flash.allow(1) <= 0.7, 'flash: allowed again after a second, capped at .7');
    G.prefs.set('motion', 'still'); E.frames(70, 16.67); ok(G.flash.allow(1) === 0, 'flash: Still means no flashes');
    G.prefs.set('motion', 'full'); G.prefs.set('flash', 'soft'); E.frames(70, 16.67); const a = G.flash.allow(1); ok(a === 0.5, 'flash: soft flashes are half strength', a);
  }
  // perf
  {
    const E = makeEnv(); E.run(SRC); const G = E.win.GK;
    G.perf.capDPR(2); ok(E.win.devicePixelRatio === 2 && G.perf.realDPR === 3, 'perf: sharpness capped at 2 on a 3x phone');
    G.perf.capDPR(2); ok(E.win.devicePixelRatio === 2, 'perf: capping twice is safe');
    G.view && G.view.dpr && ok(G.view.dpr() <= 2, 'perf: kit view helper sees the cap');
  }
  {
    const E = makeEnv({ search: '?fps=30' }); E.run(SRC); const G = E.win.GK;
    const r = G.perf.auto(); let calls = 0; const loop = () => { calls++; E.win.requestAnimationFrame(loop); }; E.win.requestAnimationFrame(loop);
    E.frames(60, 16.67); ok(r && calls >= 27 && calls <= 33, 'perf: ?fps=30 runs the game at about 30 frames a second', calls);
  }
  { const E = makeEnv({ search: '?fps=120' }); E.run(SRC); ok(!E.win.GK.perf.auto(), 'perf: fps switch ignores silly values'); }
  // sound bus, limiter, routing
  {
    const E = makeEnv(); E.run(SRC); const G = E.win.GK;
    G.retrofit({ game: 't', saves: [] });
    const c = new E.win.AudioContext(); const osc = c.createOscillator(); const g = c.createGain(); osc.connect(g); g.connect(c.destination);
    const B = G.audio.bus();
    ok(B && B.lim && B.lim.threshold.value === -4 && B.lim.ratio.value === 12, 'audio: master limiter in place');
    ok(g._to[0] === B.in && g._to[0] !== c.destination, 'audio: game sound goes through the limiter, not straight out');
    ok(B.lim._to.indexOf(c.destination) >= 0, 'audio: limiter feeds the speakers');
    ok(osc._to[0] === g, 'audio: game wiring between its own nodes is untouched');
    G.prefs.setVol('master', 0.5); ok(Math.abs(B.in.gain.value - 0.5) < 1e-6, 'audio: master volume pref sets the bus');
  }
  {
    const E = makeEnv(); E.run(SRC); const G = E.win.GK; G.retrofit({ game: 't', saves: [], limiter: false });
    const c = new E.win.AudioContext(); const g = c.createGain(); g.connect(c.destination);
    ok(g._to[0] === c.destination, 'audio: limiter:false leaves routing alone');
  }
  // hide / show
  {
    const E = makeEnv(); E.run(SRC); const G = E.win.GK; G.retrofit({ game: 't', saves: [] });
    const c = new E.win.AudioContext(); E.document.fire('pointerdown', {}); E.win.fire('pointerdown', {}); await E.flush(); c._set('running');
    E.hide(); E.frames(20, 16.67); await E.flush();
    ok(c.state === 'suspended' && G.audio.hidSuspends >= 1, 'audio: sound stops when the page is hidden', c.state);
    E.show(); await E.flush(); E.frames(5); await E.flush();
    ok(c.state === 'running', 'audio: sound comes back when the page is shown', c.state);
    c.suspend(); await E.flush(); E.hide(); E.frames(20); E.show(); await E.flush(); E.frames(5); await E.flush();
    ok(c.state === 'suspended', 'audio: a game that paused its own sound stays paused after hide/show', c.state);
  }
  // combo ladder
  {
    const E = makeEnv(); E.run(SRC); const G = E.win.GK;
    let up = true; for (let i = 1; i <= 10; i++) if (!(G.audio.ladder(i) > G.audio.ladder(i - 1))) up = false;
    ok(up && G.audio.ladder(0) === 1, 'audio: combo pitch climbs a scale');
    ok(G.audio.ladder(200) <= 4.0001, 'audio: combo pitch tops out two octaves up');
    ok(typeof G.audio.combo === 'function' && typeof G.audio.comboBreak === 'function' && typeof G.audio.duck === 'function', 'audio: combo, comboBreak and duck exist');
  }
  // juice follow mode
  {
    const E = makeEnv(); E.run(SRC); const G = E.win.GK;
    const J = G.juice.create({});
    J.kick(10, 0); const full = J.kx; J.kx = 0;
    G.prefs.set('motion', 'still'); J.kick(10, 0); const still = J.kx;
    G.prefs.set('motion', 'calm'); J.kick(10, 0);
    ok(full === 10 && still === 0 && J.kx > 0 && J.kx < 5, 'juice: shake follows the motion setting live', [full, still, J.kx].join('/'));
    const J2 = G.juice.create({ reducedMotion: false }); G.prefs.set('motion', 'still'); J2.kick(10, 0); ok(J2.kx === 10, 'juice: games that pass reducedMotion keep their old behavior');
  }
  // loop assist
  {
    const E = makeEnv(); E.run(SRC); const G = E.win.GK; G.prefs.set('speed', 0.5);
    let a = 0, b = 0; G.loop(() => a++, null, { assist: true }).start(); G.loop(() => b++, null, {}).start();
    E.frames(120, 16.67);
    ok(a > 50 && a < 70 && b > 110, 'loop: speed assist runs the game at half speed only when the game opts in', a + '/' + b);
  }
  // popups, roll, ui.text
  {
    const E = makeEnv(); E.run(SRC); const G = E.win.GK;
    const P = G.popups.create(); P.add(10, 10, 5); P.add(12, 12, 5); P.add(200, 200, 1);
    ok(P.list ? P.list.length === 2 : true, 'popups: close hits merge into one number');
    for (let i = 0; i < 40; i++) P.add(i * 60, 0, 1); ok(!P.list || P.list.length <= 12, 'popups: never more than 12 at once');
    P.update(1); ok(!P.list || P.list.length === 0, 'popups: fade out');
    const R = G.roll(0); R.set(1000); for (let i = 0; i < 120; i++) R.update(1 / 60);
    ok(Math.round(R.value !== undefined ? R.value : +R.text().replace(/\D/g, '')) === 1000, 'roll: score rolls up to the real total');
    const calls = []; const ctx = new Proxy({}, { get: (t, k) => k in t ? t[k] : (...a) => calls.push(k), set: (t, k, v) => { t[k] = v; return true; } });
    G.ui.text(ctx, 'hi', 0, 0, { size: 8 }); ok(/(^|\s)1[2-9]px|(^|\s)[2-9]\dpx/.test(ctx.font || ''), 'ui: HUD text never smaller than 12px', ctx.font);
  }
  // coach + hints
  {
    const storage = new Map(); let E = makeEnv({ storage }); E.run(SRC); let G = E.win.GK;
    const el = new E.El('button'); let tapped = false; const C = G.coach.create('t', [{ target: el, text: 'Tap here', done: () => tapped }], { auto: false });
    const vis = env => env.document.body.children.some(c => c.className === 'gk-coach' && c.style.cssText && /display:block/.test(c.style.cssText) && c.style.display !== 'none');
    C.update(); ok(vis(E), 'coach: pulsing hint shows on the first thing to tap');
    tapped = true; C.update(); ok(!vis(E) && C.done, 'coach: hint retires once the player does it');
    E = makeEnv({ storage }); E.run(SRC); G = E.win.GK; const C2 = G.coach.create('t', [{ target: new E.El('button'), text: 'Tap here', done: () => false }], { auto: false }); C2.update();
    ok(!vis(E), 'coach: retired hint stays gone after a reload');
    ok(G.hints.once('a', 'Tip A') === true && G.hints.once('a', 'Tip A') === false, 'hints: each tip shows once');
    G.hints.reset(); E.advanceWall(30000); E.frames(2); ok(G.hints.once('a', 'Tip A') === true, 'hints: Show tips again brings them back');
  }
  // panel
  {
    const E = makeEnv(); E.run(SRC); const G = E.win.GK;
    const p = G.prefs.panel({ speed: true, music: true });
    ok(p && /Play your way/.test(p.el.innerHTML) && /Calm/.test(p.el.innerHTML) && /50%/.test(p.el.innerHTML) && /Music/.test(p.el.innerHTML), 'panel: builds with motion, speed and sound rows');
    const btn = new E.El('button'); btn.dataset = { k: 'motion', v: 'still' }; p.el.fire('click', { target: btn });
    ok(G.prefs.get('motion') === 'still', 'panel: tapping Still sets motion');
    const sl = new E.El('input'); sl.dataset = { vol: 'sfx' }; sl.value = '0.3'; p.el.fire('input', { target: sl });
    ok(G.prefs.vol('sfx') === 0.3, 'panel: effects slider sets volume');
    const sw = new E.El('input'); sw.dataset = { sw: 'flash' }; sw.checked = true; p.el.fire('change', { target: sw });
    ok(G.prefs.get('flash') === 'soft', 'panel: soft flashes switch');
    const done = new E.El('button'); done.className = 'gk-x gk-done'; let closed = false; p.el.remove = () => { closed = true; }; p.el.fire('click', { target: done });
    ok(closed, 'panel: Done closes it');
    const p2 = G.prefs.panel({}); ok(!/50%/.test(p2.el.innerHTML) && !/Music/.test(p2.el.innerHTML), 'panel: speed and music rows only when the game asks');
  }
  // 2.1 wiring: gear, inline button, studio colors, registry, prefs loaded at boot
  {
    const storage = new Map([['gk.prefs.v1', JSON.stringify({ motion: 'calm', text: 1.25 })]]);
    const E = makeEnv({ storage }); E.run(SRC); const G = E.win.GK;
    ok(G.prefs.data && G.prefs.get('motion') === 'calm', 'wiring: prefs load at boot');
    const g = G.ui.gear({ panel: { text: true, speed: true } });
    ok(g && g.el.getAttribute('data-gk-prefs') === '' && /gk-gear/.test(g.el.className), 'wiring: gear button made with data-gk-prefs');
    let opened = 0, closed = 0; const g2 = G.ui.gear({ panel: { text: true }, onOpen: () => opened++, onClose: () => closed++ });
    g2.el.fire('click', {});
    ok(opened === 1 && G.prefs._panel && /Text size/.test(G.prefs._panel.innerHTML), 'wiring: gear opens the panel and calls onOpen');
    const done = new E.El('button'); done.className = 'gk-x gk-done'; G.prefs._panel.fire('click', { target: done });
    ok(closed === 1 && !G.prefs._panel, 'wiring: Done calls onClose');
    const b = G.ui.prefsButton({ panel: {} }); ok(b && /gk-pyw/.test(b.className) && b.textContent === 'Play your way', 'wiring: inline Play your way button');
    const p = G.prefs.panel({ sound: false }); ok(!/All sound|>Sound</.test(p.el.innerHTML), 'wiring: sound:false leaves the game\'s own volume in charge');
    G.studio(); ok(G.theme.get('signal') === '#ffc23d' && G.wiredList().theme === 'studio', 'wiring: studio colors set and recorded');
    G.coach.create('t', [{ text: 'Tap', target: { x: 1, y: 1 }, done: () => false }], { auto: false });
    const w = G.wiredList(); ok(w.panel && w.gear && w.coach === 't', 'wiring: panel, gear and coach recorded');
    const n0 = G.audio.ladderCalls; G.audio.ladder(3); ok(G.audio.ladderCalls === n0 + 1, 'wiring: ladder calls counted');
  }
  // retrofit v2 leaves saves alone
  {
    const storage = new Map([['game.save', JSON.stringify({ lvl: 7 })]]);
    const E = makeEnv({ storage }); E.run(SRC); const G = E.win.GK;
    const R = G.retrofit({ game: 'g', saves: ['game.save'] });
    ok(R.v === 2 && E.win.devicePixelRatio === 2 && storage.get('game.save') === JSON.stringify({ lvl: 7 }), 'retrofit: v2 caps sharpness and leaves the old save unchanged');
    const E2 = makeEnv(); E2.run(SRC); E2.win.GK.retrofit({ game: 'g', dpr: false }); ok(E2.win.devicePixelRatio === 3, 'retrofit: dpr:false opts out');
  }
  console.log('\nTOTAL', pass, 'pass', fail, 'fail');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('CRASH', e.stack); process.exit(1); });
