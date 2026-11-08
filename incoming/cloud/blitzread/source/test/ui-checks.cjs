// Targeted UI checks: saves, resume, hidden tab, first touch, kick, unlocks. Run: node test/ui-checks.cjs
const H = require('./ui-harness.cjs');
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
// 1. corrupt save -> fresh season + backup kept + warning
{ const st = { 'blitzread.v1': '{"v":1,"season":{"rung":99}' }; const W = H.makeWorld(st); W.step(50);
  ok(!!st['blitzread.v1.bak'], 'corrupt save kept as backup'); ok(/could not be read/.test(W.byId('menu').textContent), 'corrupt save warning shown'); ok(!!W.byId('mPlay'), 'fresh season playable'); }
{ const st = { 'blitzread.v1': JSON.stringify({ v: 1, season: { rung: 2, losses: 1, results: ['W', 'W'] }, best: {}, daily: {}, unlocks: {}, game: { phase: 'live', junk: true }, ctx: {} }) }; const W = H.makeWorld(st); W.step(50);
  ok(/could not be read/.test(W.byId('menu').textContent), 'save with a bad in-progress game is rejected'); }
// 2. no audio before a gesture; audio after first tap
{ const st = {}; const before = H.stats().audioCreated; const W = H.makeWorld(st); W.step(500); ok(H.stats().audioCreated === before, 'no AudioContext before first gesture');
  W.click('mPlay'); W.step(50); ok(H.stats().audioCreated === before + 1, 'AudioContext created on first tap');
  // first touch in the call sheet works
  ok(W.ev('App.mode') === 'call', 'first screen after Play is the call sheet');
  W.byId('cards').querySelectorAll('.card')[2].click(); W.step(16); ok(W.ev('App.mode') === 'hut', 'first card tap snaps the ball');
  W.step(700); ok(W.ev('App.mode') === 'live', 'play goes live after the hut freeze');
  // hidden tab mid-play: pauses, suspends audio, sim frozen
  const t0 = W.ev('App.s.play.t'); const sus = H.stats().suspends; W.hide(true); W.step(2000);
  ok(W.ev('App.paused') === true, 'hidden tab pauses the game'); ok(H.stats().suspends > sus, 'hidden tab suspends audio'); ok(W.ev('App.s.play.t') === t0, 'play clock frozen while hidden');
  W.hide(false); W.click('pRes'); W.step(200); ok(W.ev('App.s.play.t') > t0, 'resume continues the play');
  // finish play, then reload and resume from the save
  let g = 0; while (W.ev('App.mode') !== 'call' && W.ev('App.mode') !== 'def' && g++ < 2000) { W.step(50); if (W.ev('App.mode') === 'after') { W.ptr('pointerdown', 9, 9); W.ptr('pointerup', 9, 9); } }
  const saved = JSON.parse(st['blitzread.v1']); ok(saved.game && saved.game.nplay >= 1, 'game autosaved after the whistle');
  const W2 = H.makeWorld(st); W2.step(50); ok(!!W2.byId('mResume'), 'reload offers Resume'); W2.click('mResume'); W2.step(50);
  ok(W2.ev('App.s.nplay') === saved.game.nplay && W2.ev('App.s.score.me') === saved.game.score.me, 'resume restores the same game');
  // quit mid-play from pause returns to the last whistle
  if (W2.ev('App.mode') === 'call') { const np = W2.ev('App.s.nplay'); W2.byId('cards').querySelectorAll('.card')[0].click(); W2.step(900); W2.click('pauseBtn'); W2.click('pQuit'); W2.step(30);
    ok(!!W2.byId('mResume'), 'quit mid-play keeps a resumable save'); W2.click('mResume'); W2.step(30); ok(W2.ev('App.s.nplay') === np && W2.ev('App.mode') === 'call', 'quit mid-play rewinds to the last whistle'); }
}
// 3. kick meter flow
{ const W = H.makeWorld({}); W.step(30); W.click('mPlay'); W.step(30);
  W.ev("App.s.los = 72; App.s.ltg = 80; App.s.down = 4; openCall();");
  ok(!W.byId('fgBtn').hidden, 'FG button shows in range'); W.click('fgBtn'); W.step(16); ok(W.ev('App.mode') === 'kick', 'kick meter opens');
  W.step(400); W.ptr('pointerdown', 50, 50); W.step(16); ok(W.ev('App.mode') === 'after', 'tap resolves the kick'); ok(/GOOD/.test(W.byId('toastBig').textContent), 'kick result toast: ' + W.byId('toastBig').textContent); }
// 4. champion unlocks Iron + Flea, applied once
{ const W = H.makeWorld({}); W.step(30); W.ev("Store.data.season.rung = 5; Store.save(); titleScreen();"); W.click('mPlay'); W.step(30);
  W.ev("App.s.phase='final'; App.s.final={res:'W',me:21,op:7,margin:14,moments:[]}; routePhase();");
  ok(W.ev('Store.data.unlocks.iron && Store.data.unlocks.flea && Store.data.best.titles === 1'), 'winning game 6 unlocks Iron + Flea');
  W.ev('finalScreen()'); ok(W.ev('Store.data.best.titles') === 1, 'result applied once even if final screen redraws');
  ok(/HARVEST CUP/.test(W.byId('menu').textContent), 'champion screen'); W.click('fNext'); W.step(30); ok(W.ev('Store.data.season.iron') === true, 'Iron season starts');
  W.click('mPlay'); W.step(30); ok(W.ev("Core.legalPlays(App.s).includes('FLEA')"), 'Flea play available in Iron season'); ok(W.byId('cards').querySelectorAll('.card').length === 7, '7 cards shown'); }
// 5. three losses ends the season
{ const W = H.makeWorld({}); W.step(30);
  for (let i = 0; i < 3; i++) { W.click(W.byId('mPlay') ? 'mPlay' : 'mResume'); W.step(30); W.ev("App.s.phase='final'; App.s.final={res:'L',me:0,op:7,margin:-7,moments:[]}; routePhase();"); W.click('fMenu'); W.step(20); }
  ok(W.ev('Store.data.season.over') && !!W.byId('mNew'), 'third loss ends the season, New season offered'); }
// 6. daily is the same game for the same date
{ const a = H.makeWorld({}); a.step(30); a.click('mDaily'); a.step(30); const b = H.makeWorld({}); b.step(30); b.click('mDaily'); b.step(30);
  ok(a.ev('App.s.seed') === b.ev('App.s.seed') && a.ev('App.s.opp.id') === b.ev('App.s.opp.id') && a.ev('App.s.look') === b.ev('App.s.look'), 'daily game seeded by date'); }
// 7. storage blocked entirely
{ const W = H.makeWorld({}); W.ev("localStorage.setItem = () => { throw new Error('quota'); }; localStorage.getItem = () => { throw new Error('denied'); }; Store.load(); titleScreen();"); W.click('mPlay'); W.step(30); ok(W.ev('App.mode') === 'call', 'plays with storage blocked'); }
// 8. music: band on menus, drumline at the call sheet, silent during the live play, stops when hidden
{ const W = H.makeWorld({}); W.step(30); W.click('mHelp'); W.step(30); W.click('hBack'); W.step(30);
  ok(W.ev('Snd.mode') === 'menu', 'menu music mode on title'); const o0 = H.stats().oscs; W.step(3000); ok(H.stats().oscs > o0 + 20, 'band notes scheduled on the title screen (' + (H.stats().oscs - o0) + ' oscillators in 3s)');
  W.click('mPlay'); W.step(100); ok(W.ev('Snd.mode') === 'drums', 'drumline at the call sheet');
  W.byId('cards').querySelectorAll('.card')[0].click(); W.step(900); ok(W.ev('Snd.mode') === null, 'music off during the live play');
  W.hide(true); const o1 = H.stats().oscs; W.step(2000); ok(H.stats().oscs === o1, 'no notes scheduled while hidden'); W.hide(false); }
