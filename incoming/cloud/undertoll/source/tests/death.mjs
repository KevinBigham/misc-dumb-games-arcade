// Scripted death through the real UI: Dive, then only tap Wait until the tide takes you.
import { load, shot } from './load.mjs'; import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = load(); const { BB, doc, win, errors } = env; const out = 'bb/shots';
const click = sel => { const el = doc.querySelector(sel); if (!el) throw new Error('missing ' + sel); el.dispatchEvent(new win.MouseEvent('click', { bubbles: true })); };
const ok = []; const check = (name, cond, extra = '') => ok.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' · ' + extra : ''}`);
click('[data-act=new]'); BB.draw(env.adv(16));
const S = BB.UI.S; const seed = S.seed;
let taps = 0;
while (BB.UI.S && !BB.UI.S.over && taps < 3000) { const wb = BB.R.buttons.find(b => b.id === 'wait'); BB.tapAt(wb.x + wb.w / 2, wb.y + wb.h / 2); BB.draw(env.adv(120)); taps++; }
check('run ends by only tapping Wait', S.over === 'dead', `${taps} taps, T=${Math.round(S.T)}, cause=${JSON.stringify(S.stats.cause)}`);
await sleep(1500);
const scr = doc.getElementById('screen');
check('end screen shown', scr.classList.contains('on'));
const h2 = scr.querySelector('h2') && scr.querySelector('h2').textContent; check('end screen headline', !!h2, h2);
const lesson = scr.querySelector('.lesson'); check('lesson card', !!lesson && /teaches/.test(lesson.textContent), lesson && lesson.textContent.slice(0, 160));
check('grave note on end screen', /grave will wait on floor 1/.test(scr.textContent));
fs.writeFileSync(out + '/death-end.html', scr.innerHTML);
const M = JSON.parse(win.localStorage.getItem('undertoll.meta.v1'));
check('meta saved: grave + best + death', M.grave && M.grave.floor === 1 && M.deaths === 1 && M.runs === 1, JSON.stringify({ grave: M.grave, best: M.best, deaths: M.deaths }));
check('saved run cleared', !win.localStorage.getItem('undertoll.run.v1'));
{ const e2 = load({ storage: { 'undertoll.meta.v1': JSON.stringify(M) } }); const sc2 = e2.doc.getElementById('screen'); const scr = sc2; check('title shows grave line', /last grave waits on floor 1/.test(scr.textContent), (scr.querySelector('.grave') || {}).textContent);
check('title shows unlock progress', /deepest 1/.test(scr.textContent) && /\/6\)/.test(scr.textContent), [...scr.querySelectorAll('.cls small')].map(e => e.textContent).join(' | ')); }
click('[data-act=again]'); BB.draw(env.adv(16));
const S2 = BB.UI.S; check('Dive again starts a new run', S2 && !S2.over && S2.floor === 1 && S2.seed !== seed);
check('grave placed on floor 1 of next run', !!S2.grave, S2.grave && `${S2.grave.x},${S2.grave.y} by ${S2.grave.by}`);
const M2 = JSON.parse(win.localStorage.getItem('undertoll.meta.v1')); check('grave consumed from meta', M2.grave === null);
check('no script errors', errors.length === 0, JSON.stringify(errors).slice(0, 300));
console.log(ok.join('\n')); process.exit(0);
