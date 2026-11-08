// Scripted win: find a seed the rules bot wins, then replay it through the real UI with taps and check the end screen.
import { load, shot } from './load.mjs'; import { makeBot, playSeed } from './bot.mjs'; import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ok = []; const check = (name, cond, extra = '') => ok.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' · ' + extra : ''}`);
const probe = load(); let seed = null, ref = null;
for (let i = 0; i < 40 && !seed; i++) { const s = 'WIN' + i; const r = playSeed(probe.BB, s, 'diver'); if (r.over === 'won') { seed = s; ref = r; } }
check('found a winning seed', !!seed, seed + ' in ' + (ref && ref.actions) + ' actions');
const env = load(); const { BB, doc, win, errors } = env;
const click = sel => { const el = doc.querySelector(sel); el.dispatchEvent(new win.MouseEvent('click', { bubbles: true })); };
const tapTile = (x, y) => { const [sx, sy] = BB.tileToScreen(x, y); BB.tapAt(sx + BB.R.TS / 2, sy + BB.R.TS / 2); };
const settle = n => { for (let i = 0; i < (n || 4); i++) BB.draw(env.adv(16)); };
BB.startRun({ cls: 'diver', seed }); settle(20); // same as the Dive button, with a fixed seed
const bot = makeBot(BB); let acts = 0, tapMoves = 0, fallback = 0, waitTaps = 0;
const wb = () => BB.R.buttons.find(b => b.id === 'wait');
while (BB.UI.S && !BB.UI.S.over && acts < 6000) {
  const S = BB.UI.S; const a = bot(S); acts++;
  if (a.t === 'move') { const before = S.turns, fl = S.floor; settle(); tapTile(S.p.x + a.dx, S.p.y + a.dy); BB.stepWalk(env.adv(200)); BB.UI.walk = null; tapMoves++; if (BB.UI.S && BB.UI.S.turns === before && BB.UI.S.floor === fl) { fallback++; BB.doAct(a); } }
  else if (a.t === 'wait') { settle(1); const b = wb(); BB.tapAt(b.x + b.w / 2, b.y + b.h / 2); waitTaps++; }
  else if (a.t === 'use' && a.mode === 'throw') { BB.UI.target = { it: S.p.pack[a.i] }; settle(); tapTile(a.x, a.y); }
  else BB.doAct(a);
  if (BB.UI.S && BB.UI.S.floor === 10 && !globalThis.bs) { globalThis.bs = 1; settle(30); shot(env, 'bb/shots/r3-boss.png'); }
}
const S = BB.UI.S || {};
check('run won through taps', S.over === 'won', `${acts} actions, ${tapMoves} tap moves (${fallback} fell back), ${waitTaps} Wait taps`);
await sleep(1500);
const scr = doc.getElementById('screen'); const h2 = (scr.querySelector('h2') || {}).textContent;
check('end screen says The bell is silent', scr.classList.contains('on') && h2 === 'The bell is silent', h2);
check('score card', /Score/.test(scr.textContent), (scr.querySelector('.stats') || {}).textContent);
const M = JSON.parse(win.localStorage.getItem('undertoll.meta.v1'));
check('meta: win counted, no grave, deepest 10', M.wins === 1 && !M.grave && M.bestFloor === 10, JSON.stringify({ wins: M.wins, best: M.best, bestFloor: M.bestFloor, grave: M.grave }));
fs.writeFileSync('bb/shots/win-end.html', scr.innerHTML);
click('[data-act=title]'); check('Bellringer now unlocked on title', !doc.querySelector('[data-c=ringer]').classList.contains('lock'));
check('no script errors', errors.length === 0, JSON.stringify(errors).slice(0, 300));
console.log(ok.join('\n')); process.exit(0);
