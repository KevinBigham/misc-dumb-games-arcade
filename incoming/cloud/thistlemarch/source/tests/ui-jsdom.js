// DOM-level test: boots the built page in jsdom (canvas stubbed), drives it through real buttons and
// canvas taps, plays one full campaign to the victory screen and one to the campaign-loss screen.
// Usage: NODE_PATH=<dir with jsdom> node tests/ui-jsdom.js
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const bots = require('./bots.js');
const html = fs.readFileSync(path.resolve(__dirname, '../thistlemarch.html'), 'utf8');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function boot(storage) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push('jsdom: ' + (e.message || e)));
  vc.on('error', e => errors.push('console.error: ' + e));
  const dom = new JSDOM('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>', {
    url: 'https://example.test/#debug', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      Object.defineProperty(w, 'innerWidth', { value: 375 }); Object.defineProperty(w, 'innerHeight', { value: 667 });
      const noop = () => {};
      const ctx = new Proxy({}, { get: (t, k) => k in t ? t[k] : (k === 'measureText' ? () => ({ width: 10 }) : /Gradient$/.test(String(k)) ? () => ({ addColorStop: noop }) : noop), set: (t, k, v) => { t[k] = v; return true; } });
      w.HTMLCanvasElement.prototype.getContext = () => ctx;
      if (storage) for (const [k, v] of Object.entries(storage)) w.localStorage.setItem(k, v);
      w.addEventListener('error', e => errors.push('window error: ' + e.message));
    },
  });
  await sleep(50);
  const w = dom.window; w.TM_DEBUG.fast = true;
  return { dom, w, d: w.document, errors };
}
function clickText(d, txt) {
  const b = [...d.querySelectorAll('button')].find(x => x.textContent.includes(txt) && !x.disabled);
  if (!b) throw new Error('no button: ' + txt + ' | have: ' + [...d.querySelectorAll('button')].map(x => x.textContent).join(' / '));
  b.click(); return b;
}
async function idle(w) { for (let i = 0; i < 400 && w.TM_DEBUG.busy(); i++) await sleep(5); await sleep(5); }
async function tap(w, x, y) {
  const cv = w.document.getElementById('board'), ts = w.TM_DEBUG.ts();
  const ev = new w.MouseEvent('pointerdown', { clientX: x * ts + ts / 2, clientY: y * ts + ts / 2, bubbles: true, cancelable: true }); cv.dispatchEvent(ev);
  await idle(w);
}
async function playBattleUI(w, policy, seed) {
  const T = w.TM_DEBUG, rnd = bots.mulberry(seed);
  for (let turn = 0; turn < 40; turn++) {
    const b = T.S.battle; if (!b || b.phase !== 'player') break;
    const sim = JSON.parse(JSON.stringify(b));
    const cmds = bots.playTurn(sim, policy, rnd);
    for (const c of cmds) {
      if (T.S.battle.phase !== 'player') break;
      if (c.t === 'end') { T.tryEnd(); T.tryEnd(); } else T.exec(c);
      await idle(w);
    }
  }
  for (let i = 0; i < 100 && w.TM_DEBUG.S.screen === 'battle'; i++) await sleep(10);
}
async function campaign(policy, wantFinal) {
  const { w, d, errors } = await boot();
  clickText(d, 'Start campaign');
  const T = w.TM_DEBUG;
  // first touch: real taps on Oakhorn, a move tile, a target
  clickText(d, 'March!'); await idle(w);
  const cap0 = T.C.captainOf(T.S.battle), cx = cap0.x, cy = cap0.y;
  await tap(w, cx, cy);
  if (T.U.sel !== cap0.id) throw new Error('first tap did not select Oakhorn');
  await tap(w, cx, cy - 2);
  if (T.C.captainOf(T.S.battle).y !== cy - 2) throw new Error('tap-to-move failed');
  const undo = d.getElementById('undoBtn'); undo.click(); await idle(w);
  if (T.C.captainOf(T.S.battle).y !== cy) throw new Error('undo failed');
  let battles = 0;
  for (let guard = 0; guard < 40; guard++) {
    if (T.S.screen === 'battle') { await playBattleUI(w, policy, 77 + guard); battles++; continue; }
    if (T.S.screen === 'debrief') {
      const perk = d.querySelector('.perk'); if (perk) { perk.click(); await sleep(5); }
      const t = [...d.querySelectorAll('#screen .btn.primary')][0];
      if (!t) throw new Error('no debrief button');
      t.click(); await sleep(5); continue;
    }
    if (T.S.screen === 'brief') { clickText(d, 'March!'); await idle(w); continue; }
    if (T.S.screen === 'final') break;
    throw new Error('unexpected screen ' + T.S.screen);
  }
  const txt = d.getElementById('screen').textContent;
  const ok = wantFinal === 'won' ? txt.includes('The meadow breathes') : txt.includes('The shade wins');
  return { ok, battles, errors, screen: T.S.screen, camp: T.S.camp, w, d };
}
(async () => {
  const res = [];
  const win = await campaign('careful', 'won');
  res.push(['scripted campaign WIN reaches victory screen', win.ok, 'battles ' + win.battles + ', stars ' + win.w.TM_DEBUG.C.campaignScore(win.camp)]);
  // after a win: the Thorn Oath unlocks on the title screen and starts a harder campaign
  {
    const { w, d } = win; const T = w.TM_DEBUG;
    clickText(d, 'Title'); await sleep(5);
    const ob = [...d.querySelectorAll('button')].find(b => b.textContent.startsWith('Thorn Oath'));
    let ok = !!ob && !!d.querySelector('#screen canvas');
    if (ob) { ob.click(); await sleep(5); clickText(d, 'Swear it'); await sleep(5); }
    ok = ok && T.S.screen === 'brief' && T.S.camp.oath === true && T.S.camp.resolve === 2 && d.getElementById('screen').textContent.includes('Thorn Oath');
    if (ok) { clickText(d, 'March!'); await idle(w); }
    const g = ok && T.S.battle.units.find(u => u.type === 'grub');
    res.push(['Thorn Oath unlocks after a win and toughens the Rot', ok && g && g.maxHp === 10, g ? 'grub hp ' + g.maxHp : '']);
  }
  const lose = await campaign('passive', 'lost');
  res.push(['scripted campaign LOSS reaches defeat screen', lose.ok, 'battles ' + lose.battles + ', resolve ' + lose.camp.resolve]);
  // save/reload mid-battle
  {
    const { w, d } = await boot();
    clickText(d, 'Start campaign'); clickText(d, 'March!'); await idle(w);
    const T = w.TM_DEBUG; const c0 = T.C.captainOf(T.S.battle); const c = { id: c0.id, x: c0.x, y: c0.y };
    T.exec({ t: 'move', id: c.id, x: c.x, y: c.y - 1 }); await idle(w);
    const saved = {}; for (let i = 0; i < w.localStorage.length; i++) { const k = w.localStorage.key(i); saved[k] = w.localStorage.getItem(k); }
    const r2 = await boot(saved);
    const cont = [...r2.d.querySelectorAll('button')].find(b => b.textContent.startsWith('Continue'));
    cont.click(); await idle(r2.w);
    const c2 = r2.w.TM_DEBUG.C.captainOf(r2.w.TM_DEBUG.S.battle);
    res.push(['reload resumes mid-battle at same spot', r2.w.TM_DEBUG.S.screen === 'battle' && c2.y === c.y - 1, '']);
    // corrupt save -> recovers from previous good copy, keeps bad copy
    const bad = Object.assign({}, saved); bad['thistlemarch.save.v1'] = '{"v":1,"camp":{"v":1,"battle":"x"}}';
    const r3 = await boot(bad);
    const t3 = r3.d.getElementById('screen').textContent;
    res.push(['corrupt save: recovers previous copy, keeps the bad one', t3.includes('restored') && !!r3.w.localStorage.getItem('thistlemarch.corrupt.v1'), '']);
    const r4 = await boot({ 'thistlemarch.save.v1': 'not json at all' });
    res.push(['unreadable save with no backup: shows notice, no crash', r4.d.getElementById('screen').textContent.includes('could not be read') && r4.errors.length === 0, '']);
    // hidden tab suspends audio context
    const T4 = r4.w.TM_DEBUG; let suspended = false;
    T4.Snd.ctx = { state: 'running', suspend() { suspended = true; }, resume() {} };
    Object.defineProperty(r4.d, 'hidden', { value: true, configurable: true });
    r4.d.dispatchEvent(new r4.w.Event('visibilitychange'));
    res.push(['audio suspends on hidden tab', suspended, '']);
  }
  // daily
  {
    const { w, d, errors } = await boot();
    clickText(d, 'Daily skirmish'); await idle(w);
    await playBattleUI(w, 'careful', 5);
    for (let i = 0; i < 50 && w.TM_DEBUG.S.screen !== 'daily'; i++) await sleep(10);
    res.push(['daily skirmish plays to its result screen', w.TM_DEBUG.S.screen === 'daily' && d.getElementById('screen').textContent.includes('pts'), errors.join('; ')]);
  }
  const allErr = win.errors.concat(lose.errors);
  res.push(['no runtime errors during campaigns', allErr.length === 0, allErr.slice(0, 3).join(' | ')]);
  for (const r of res) console.log((r[1] ? 'PASS ' : 'FAIL ') + r[0] + (r[2] ? '  (' + r[2] + ')' : ''));
  setTimeout(() => process.exit(res.every(r => r[1]) ? 0 : 1), 10);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
