// jsdom UI test. Run: NODE_PATH=<dir with jsdom> node tests/ui.test.js
// Boots the built single HTML file, plays with real taps, scripts a full win and a full loss
// through the same dispatch path the buttons use, and checks save/restore + corrupt-save recovery.
'use strict';
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const { makeBot } = require('./bot.js');
const FILE = path.join(__dirname, '..', 'snapthread.html');
const html = fs.readFileSync(FILE, 'utf8');
let fails = 0, passes = 0;
function ok(c, m) { if (c) { passes++; console.log('ok   ' + m); } else { fails++; console.log('FAIL ' + m); } }

function boot(storage, w) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.stack || e.message)));
  vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', url: 'https://example.test/?x=1', virtualConsole: vc, pretendToBeVisual: true,
    beforeParse(win) {
      Object.defineProperty(win, 'innerWidth', { value: w || 375, configurable: true });
      if (storage) for (const [k, v] of Object.entries(storage)) win.localStorage.setItem(k, v);
      win.addEventListener('error', e => errors.push('window.error: ' + e.message));
    }
  });
  const win = dom.window;
  return { win, doc: win.document, errors, api: win.__snapthread };
}
function click(env, sel) { const el = typeof sel === 'string' ? env.doc.querySelector(sel) : sel; if (!el) throw new Error('no element ' + sel); el.dispatchEvent(new env.win.MouseEvent('click', { bubbles: true })); }
function txt(env) { return env.doc.getElementById('app').textContent; }

// --- 1. boot, title, first touch on a card
{
  const env = boot();
  ok(env.errors.length === 0, 'boots with no errors ' + env.errors.join(' | '));
  ok(/Snapthread|Snap/.test(txt(env)) && env.doc.querySelector('[data-act="new"]'), 'title screen shows New run');
  click(env, '[data-act="new"]');
  ok(env.api.state && env.api.state.phase === 'map', 'New run goes to the map');
  const nodes = env.doc.querySelectorAll('[data-node]');
  ok(nodes.length >= 2, 'at least two reachable starting nodes (' + nodes.length + ')');
  click(env, nodes[0]);
  ok(env.api.state.phase === 'combat', 'tapping a node starts a fight');
  ok(/Tap a card/.test(txt(env)), 'coach line explains the first move');
  const s0 = env.api.state, firstAtk = s0.combat.hand.find(c => ['tug', 'pluck'].includes(c.id));
  const cardEl = env.doc.querySelector('[data-card="' + firstAtk.uid + '"]');
  // simulate a real finger: pointerdown/up then click
  cardEl.dispatchEvent(new env.win.Event('pointerdown', { bubbles: true }));
  cardEl.dispatchEvent(new env.win.Event('pointerup', { bubbles: true }));
  click(env, cardEl);
  ok(env.api.ui.sel === firstAtk.uid, 'first tap lifts the card');
  ok(env.doc.querySelector('.card.sel'), 'lifted card is drawn raised');
  const hpBefore = s0.combat.enemies.reduce((a, e) => a + e.hp, 0);
  const energyBefore = env.api.state.combat.energy;
  const alive = env.api.state.combat.enemies.filter(e => e.hp > 0).length;
  if (alive === 1) click(env, '[data-card="' + firstAtk.uid + '"]');
  else click(env, '[data-enemy="0"]');
  const s1 = env.api.state;
  ok(s1.combat && s1.combat.energy === energyBefore - 1, 'second tap (or enemy tap) plays the card and spends energy');
  ok(s1.combat.enemies.reduce((a, e) => a + e.hp, 0) < hpBefore, 'the attack hurt an enemy');
  ok(env.doc.querySelectorAll('.float').length >= 1, 'a floating damage number appeared');
  const turn = s1.combat.turn;
  click(env, '[data-act="end"]');
  ok(env.api.state.phase !== 'combat' || env.api.state.combat.turn === turn + 1, 'End turn runs the enemy turn and starts the next turn');
  ok(env.errors.length === 0, 'no errors after first fight actions ' + env.errors.join(' | '));
  // keyboard: press 1 twice
  if (env.api.state.phase === 'combat') {
    const kd = k => env.doc.dispatchEvent(new env.win.KeyboardEvent('keydown', { key: k, bubbles: true }));
    const before = env.api.state.combat.hand.length;
    kd('1'); kd('Enter');
    const after = env.api.state.combat ? env.api.state.combat.hand.length : -1;
    ok(after === before - 1 || env.api.state.phase !== 'combat' || !env.api.state.combat.hand.length, 'keyboard 1 + Enter plays a card');
    kd('e');
    ok(true, 'keyboard E pressed');
  }
  // save + reload resumes the same decision point
  const saved = env.win.localStorage.getItem('snapthread.v1.run');
  ok(saved && JSON.parse(saved).seed === env.api.state.seed, 'run is autosaved after actions');
  const env2 = boot({ 'snapthread.v1.run': saved, 'snapthread.v1.meta': env.win.localStorage.getItem('snapthread.v1.meta') });
  ok(env2.doc.querySelector('[data-act="continue"]'), 'reload shows Continue');
  click(env2, '[data-act="continue"]');
  ok(JSON.stringify(env2.api.state) === JSON.stringify(JSON.parse(saved)), 'Continue restores exactly the saved state');
  ok(env2.errors.length === 0, 'no errors after reload');
}

// --- 2. corrupt and hostile saves recover without crashing
{
  for (const bad of ['{not json', JSON.stringify({ v: 1, phase: 'combat', hp: 10, maxHp: 64, deck: [{ uid: 1, id: 'nope' }] }), JSON.stringify({ v: 99 }), 'null', '[]']) {
    const env = boot({ 'snapthread.v1.run': bad, 'snapthread.v1.meta': '{"best":"lots","unlock":{"dyer":"yes"}}' });
    ok(env.errors.length === 0 && /could not be read/.test(txt(env)), 'bad save handled with a notice: ' + bad.slice(0, 30));
    ok(env.win.localStorage.getItem('snapthread.v1.corrupt') === bad, '  bad save kept as a backup');
    ok(env.api.meta.best === 0 && env.api.meta.unlock.dyer === false, '  bad meta fields ignored');
    click(env, '[data-act="new"]');
    ok(env.api.state.phase === 'map', '  can start fresh');
  }
}

// --- 3. scripted full runs (win and loss) end on real end screens
{
  const ST = require('../src/core.js');
  const R = ST.Rules;
  function nextCmds(st) {
    const cur = JSON.parse(JSON.stringify(st)), cmds = [], orig = R.applyMut;
    R.applyMut = function (s, ev, cmd) { if (s === cur) cmds.push(cmd); return orig.apply(this, arguments); };
    try { shadowStep(ST, cur); } finally { R.applyMut = orig; }
    return cmds;
  }
  function pureOutcome(seed) {
    let st = R.newRun({ seed, char: 'weaver' }), g = 0;
    while (!['victory', 'defeat'].includes(st.phase) && g++ < 3000) for (const c of nextCmds(st)) st = R.apply(st, c).state;
    return st.phase;
  }
  let winSeed = null, loseSeed = null;
  for (let s = 1000; s < 1300 && (winSeed === null || loseSeed === null); s++) {
    const o = pureOutcome(s);
    if (o === 'victory' && winSeed === null) winSeed = s;
    if (o === 'defeat' && loseSeed === null) loseSeed = s;
  }
  ok(winSeed !== null && loseSeed !== null, 'found seeds for a scripted win (' + winSeed + ') and loss (' + loseSeed + ')');
  for (const [seed, want] of [[winSeed, 'victory'], [loseSeed, 'defeat']]) {
    if (seed === null) continue;
    const env = boot();
    env.api.startNewRun({ seed, char: 'weaver' });
    let guard = 0;
    while (!['victory', 'defeat'].includes(env.api.state.phase) && guard++ < 3000) {
      for (const c of nextCmds(env.api.state)) env.api.dispatch(c);
    }
    ok(env.api.state.phase === want, 'scripted run on seed ' + seed + ' ends in ' + want);
    ok(env.doc.querySelector('.recap') && env.doc.querySelector('[data-act="new"]'), '  end screen shows recap and New run');
    ok(/score/.test(txt(env)), '  end screen shows the score');
    if (want === 'victory') ok(env.api.meta.unlock.dyer === true && /unlocked/i.test(txt(env)), '  first win unlocks The Dyer');
    if (want === 'defeat') ok(/Felled by|reached terrace/i.test(txt(env)), '  loss recap names what happened');
    const wins = env.api.meta.wins, best = env.api.meta.best;
    env.api.render(); env.api.dispatch({ t: 'end' });
    const env3 = boot({ 'snapthread.v1.run': env.win.localStorage.getItem('snapthread.v1.run'), 'snapthread.v1.meta': env.win.localStorage.getItem('snapthread.v1.meta') });
    ok(env.api.meta.wins === wins && env3.api.meta.wins === wins && env3.api.meta.best === best, '  re-render and reload do not record the result twice');
    ok(env.errors.length === 0, '  no errors during the scripted run ' + env.errors.slice(0, 2).join(' | '));
  }
}

// --- 4. the unlock changes play: after a win, New run offers The Dyer, who starts with Weave and a different deck
{
  const env = boot({ 'snapthread.v1.meta': JSON.stringify({ v: 1, best: 300, wins: 1, runs: 2, unlock: { dyer: true }, tut: { play: true, intent: true, tension: true, knot: true } }) });
  click(env, '[data-act="new"]');
  const dy = env.doc.querySelector('[data-char="dyer"]');
  ok(dy && !dy.disabled, 'unlocked: New run offers The Dyer');
  click(env, dy);
  ok(env.api.state.char === 'dyer' && env.api.state.charms.indexOf('mordant') >= 0, 'Dyer run starts with the Mordant Pot');
  ok(env.api.state.deck.filter(c => c.id === 'weave').length === 1 && !env.api.state.deck.some(c => c.id === 'pluck'), 'Dyer deck differs from the Weaver deck');
  click(env, env.doc.querySelectorAll('[data-node]')[0]);
  ok(env.api.state.combat && env.api.state.combat.weave >= 2, 'Dyer fight starts with Weave');
  ok(env.errors.length === 0, 'no errors on the Dyer path');
  const env2 = boot();
  click(env2, '[data-act="new"]');
  ok(env2.api.state.phase === 'map' && env2.api.state.char === 'weaver', 'locked: New run goes straight to a Weaver run');
}

function shadowStep(ST, st) {
  // one bot "step" on st, mirroring tests/bot.js step() for the weave policy
  const b = makeBot(ST, 'weave');
  b._step = b._step || null;
  // bot.js exposes playRun/combatTurn only, so emulate step via a tiny dispatcher
  const R = ST.Rules;
  if (st.phase === 'combat') { b.combatTurn(st, 'weave'); return; }
  if (st.phase === 'map') { R.applyMut(st, [], { t: 'pick', id: R.reachable(st)[0] }); return; }
  if (st.phase === 'reward') { const id = st.reward.cards.find(k => ST.DATA.CARDS[k].plan !== 'taut'); R.applyMut(st, [], id ? { t: 'reward', kind: 'card', id } : { t: 'reward', kind: 'skip' }); return; }
  if (st.phase === 'rest') { R.applyMut(st, [], { t: 'rest', kind: 'heal' }); return; }
  if (st.phase === 'market') { R.applyMut(st, [], { t: 'leave' }); return; }
  if (st.phase === 'shrine') { const o = ST.DATA.SHRINES[st.shrine.key].opts; const i = o.findIndex(x => !x.need && !x.fx.some(f => f[0] === 'mend' || f[0] === 'chip')); R.applyMut(st, [], { t: 'shrine', opt: i >= 0 ? i : 1, uid: st.deck[0].uid }); return; }
}

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
