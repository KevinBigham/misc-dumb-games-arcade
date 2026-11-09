import { load } from './load.mjs'; import fs from 'fs';
const out = []; let fails = 0; process.on('uncaughtException', e => { console.log(out.join('\n')); console.log('CRASH', e.message); process.exit(1); }); const check = (n, c, x = '') => { out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`); if (!c) fails++; };
fs.mkdirSync(new URL('./shots/', import.meta.url), { recursive: true });
const shot = (env, name) => fs.writeFileSync(new URL(`./shots/${name}.png`, import.meta.url), env.doc.getElementById('cv').toPNG());
let env = load(); let { doc, LF, frames, ptr, click, key } = env;
check('title screen shows on load', !doc.getElementById('overlay').hidden && /LEDGER/.test(doc.getElementById('sheet').textContent));
check('no audio before a gesture', env.audio.created === 0);
click('[data-go=new]'); frames(2);
check('Play starts a run', LF.screen === 'play' && LF.S && LF.S.phase === 'play' && doc.getElementById('overlay').hidden);
const cv = doc.getElementById('cv'); const cell = LF.CELLPX;
check('board fits 375px with the side column', cell * 10 + 94 <= 375 - 16, `cell ${cell}px, board ${cell * 10}px`);
// first touch: tap rotates and unlocks audio + music
const r0 = LF.S.piece.r; ptr(cv, 'pointerdown', 100, 100); ptr(cv, 'pointerup', 101, 101); frames(1);
check('first tap on the board turns the piece', LF.S.piece.r === (r0 + 1) % 4, `r ${r0}->${LF.S.piece.r}`);
check('first gesture creates audio and starts music', env.audio.created === 1 && LF.Snd.playing);
// drag right 3 cells
const x0 = LF.S.piece.x; ptr(cv, 'pointerdown', 50, 100); ptr(cv, 'pointermove', 50 + cell * 0.9, 100); ptr(cv, 'pointermove', 50 + cell * 1.8, 100); ptr(cv, 'pointermove', 50 + cell * 2.7, 100); ptr(cv, 'pointerup', 50 + cell * 2.7, 100);
check('drag moves the piece by cells', LF.S.piece.x === Math.min(x0 + 3, 10) || LF.S.piece.x > x0, `${x0}->${LF.S.piece.x}`);
check('drag does not also rotate', LF.S.piece.r === (r0 + 1) % 4);
// flick down = hard drop
const p0 = LF.S.pieces; ptr(cv, 'pointerdown', 120, 60); env.adv(60); ptr(cv, 'pointermove', 120, 60 + cell * 1.2); env.adv(40); ptr(cv, 'pointerup', 120, 200); frames(2);
check('flick down drops and locks', LF.S.pieces === p0 + 1, `pieces ${p0}->${LF.S.pieces}`);
check('lock autosaves the run', !!env.win.localStorage.getItem('ledgerfall.run.v1'));
// pad hold repeats
const left = doc.querySelector('[data-a=left]'); const xa = LF.S.piece.x; ptr(left, 'pointerdown', 0, 0, 7); frames(20, 20); ptr(left, 'pointerup', 0, 0, 7);
check('holding the left button repeats', LF.S.piece.x <= Math.max(0, xa - 3) || LF.S.piece.x <= 0 || LF.S.piece.x < xa - 1, `${xa}->${LF.S.piece.x}`);
const xb = LF.S.piece.x; frames(10, 20); check('releasing the button stops movement', LF.S.piece.x === xb);
// keyboard
const kp = LF.S.pieces; key('ArrowRight'); key('ArrowRight', 'keyup'); key(' '); frames(2);
check('keyboard Space drops', LF.S.pieces === kp + 1);
// gravity works
const y0 = LF.S.piece.y; frames(60, 16); check('gravity pulls the piece down', LF.S.piece.y > y0, `${y0}->${LF.S.piece.y}`);
// hidden tab: pause + stop audio
env.setHidden(true);
check('hidden tab pauses the game', LF.screen === 'pause');
check('hidden tab stops music and suspends audio', !LF.Snd.playing && env.audio.suspended >= 1);
const yh = LF.S.piece.y; const st0 = env.audio.started; frames(200, 16);
check('nothing moves or plays while hidden', LF.S.piece.y === yh && env.audio.started === st0, `osc starts ${st0}->${env.audio.started}`);
env.setHidden(false); click('[data-go=resume]'); frames(2);
check('resume restarts play', LF.screen === 'play');
shot(env, 'early-play');
// reload resumes the same run
const saved = env.win.localStorage.getItem('ledgerfall.run.v1'), meta = env.win.localStorage.getItem('ledgerfall.meta.v1'); const boardBefore = JSON.stringify(JSON.parse(saved).board);
let e2 = load({ storage: { 'ledgerfall.run.v1': saved, 'ledgerfall.meta.v1': meta } });
check('reload offers Continue', !!e2.doc.querySelector('[data-go=continue]'), e2.doc.querySelector('[data-go=continue]') && e2.doc.querySelector('[data-go=continue]').textContent);
e2.click('[data-go=continue]'); e2.frames(1);
check('Continue restores the same board', JSON.stringify(e2.LF.S.board) === boardBefore && e2.LF.screen === 'play');
// New game over an existing run needs a second tap
let e3 = load({ storage: { 'ledgerfall.run.v1': saved } }); e3.click('[data-go=new]');
check('New game asks for a second tap when a run exists', e3.LF.screen === 'title' && /Tap again/.test(e3.doc.getElementById('sheet').textContent));
e3.click('[data-go=new]'); check('second tap starts over', e3.LF.screen === 'play' && e3.LF.S.pieces === 0);
// corrupt save recovery
let e4 = load({ storage: { 'ledgerfall.run.v1': '{"v":1,"board":[1,2,' } });
check('corrupt save shows a notice and keeps a copy', /set aside/.test(e4.doc.getElementById('sheet').textContent) && e4.win.localStorage.getItem('ledgerfall.run.bad') === '{"v":1,"board":[1,2,' && !e4.win.localStorage.getItem('ledgerfall.run.v1'));
check('corrupt save still lets you play', (e4.click('[data-go=new]'), e4.LF.screen === 'play'));
let e5 = load({ storage: { 'ledgerfall.meta.v1': '{"bestNW":"lots","daily":{"bad":1,"2026-01-01":"x"},"tips":{"a":"yes"}}' } });
check('junk meta does not crash', e5.errors.length === 0 && e5.LF.meta().bestNW === null);
// payday via the real UI
{ const S = LF.S; const C = 10, R = 20;
  S.board.fill(0); for (let x = 0; x < 9; x++) S.board[(R - 1) * C + x] = x < 5 ? 1 : x < 8 ? 2 : 3; S.rowsPaid = S.rowsGoal - 1; S.savings = 500; S.debt = 100;
  S.piece = { k: 0, r: 1, x: 7, y: 0, cat: 3, label: 'Savings', cost: 0, imp: false }; LF.S = S;
  key(' '); frames(40, 16);
  const txt = doc.getElementById('sheet').textContent;
  check('clearing the last bill opens Payday', LF.screen === 'payday' && /Payday/.test(txt) && /Interest earned/.test(txt));
  check('a perfect budget row was scored', LF.S.stats.perfect === 1);
  check('payday tip explains card vs savings', /better deal/.test(txt));
  shot(env, 'payday-board');
  click('[data-plan=saver]'); check('payday plan picker sets next month budget', LF.S.plan === 'saver' && doc.querySelector('[data-plan=saver]').classList.contains('on'));
  check('super saver shown as locked early', doc.querySelector('[data-plan=super]').disabled);
  const sv = LF.S.savings, db = LF.S.debt; click('[data-go=paycard]');
  check('Pay off card button works once', LF.S.debt === 0 && LF.S.savings === sv - db && !doc.querySelector('[data-go=paycard]'));
  click('[data-go=nextmonth]'); frames(2);
  check('Start next month resumes play in month 2', LF.screen === 'play' && LF.S.month === 2);
  // charge button
  let g = 0; while (LF.S.piece.cat === 3 && g++ < 20) { key(' '); frames(30, 16); }
  const d0 = LF.S.debt, cost = LF.S.piece.cost; click('#bCharge');
  check('Charge it button adds to the card', LF.S.debt === d0 + cost, `+${cost}`);
  check('Charge button disables until a block is placed', doc.getElementById('bCharge').disabled);
}
// game over via the UI
{ const S = LF.S; for (let i = 0; i < 200; i++) S.board[i] = (i % 10 === 4 || i < 40) ? 0 : 1; LF.S = S; key(' '); frames(60, 16);
  let n = 0; while (LF.screen === 'play' && n++ < 40) { key(' '); frames(40, 16); }
  check('topping out shows the end screen', LF.screen === 'over' && /Overdrawn|Buried/.test(doc.getElementById('sheet').textContent), LF.S.over);
  check('ending clears the run save', !env.win.localStorage.getItem('ledgerfall.run.v1'));
  check('best net worth recorded', typeof JSON.parse(env.win.localStorage.getItem('ledgerfall.meta.v1')).bestNW === 'number');
  click('[data-go=new]'); check('Play again starts fresh', LF.screen === 'play' && LF.S.month === 1); }
// daily is the same for everyone today
{ const a = load(), b = load(); a.click('[data-go=daily]'); b.click('[data-go=daily]');
  check('daily runs share a seed and pieces', a.LF.S.seed === b.LF.S.seed && a.LF.S.piece.k === b.LF.S.piece.k && JSON.stringify(a.LF.S.next) === JSON.stringify(b.LF.S.next), a.LF.S.seed); }
// mute persists
{ click('#bMute'); const m = JSON.parse(env.win.localStorage.getItem('ledgerfall.meta.v1')).muted; check('mute is saved', m === true); }
// long autoplay through the UI with random taps: no errors, no stuck screens
{ const e = load({ w: 390, h: 844 }); e.click('[data-go=new]'); let stuck = 0, steps = 0;
  const pad = [...e.doc.querySelectorAll('#pad button')];
  for (let i = 0; i < 6000; i++) {
    const sc = e.LF.screen; steps++;
    if (sc === 'payday') { const b = e.doc.querySelector('[data-go=paycard]') || e.doc.querySelector('[data-go=nextmonth]'); e.click(b); }
    else if (sc === 'over') { e.click('[data-go=new]'); }
    else if (sc === 'play') { const r = (i * 7919) % 11; if (r < 5) { const b = pad[r]; e.ptr(b, 'pointerdown', 0, 0, 3); e.frames(1); e.ptr(b, 'pointerup', 0, 0, 3); } else if (r === 5) e.click('#bCharge'); }
    else stuck++;
    e.frames(3, 16);
  }
  check('6000 random UI steps: no errors', e.errors.length === 0, e.errors.slice(0, 2).join(' | '));
  check('never stuck on an unknown screen', stuck === 0, `month ${e.LF.S.month}, games ${e.LF.meta().games}`);
  shot(e, 'random-play'); }
check('no script errors in main session', env.errors.length === 0, env.errors.slice(0, 3).join(' | '));
console.log(out.join('\n')); console.log(fails ? `\n${fails} FAILED` : '\nALL PASS'); process.exit(fails ? 1 : 0);
