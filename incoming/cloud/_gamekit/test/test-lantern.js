// Lantern Drum pilot smoke test: loads an old (pre-kit) save, plays the daily with a bot, checks badges, share, save backups and the daily seed.
// Run with TZ=America/Chicago so the local-midnight checks mean something.
const fs = require('fs'), path = require('path');
const { makeEnv } = require('./stubdom.js');
const NEW = fs.readFileSync(path.join(__dirname, '..', 'pilots', 'lantern-drum.html'), 'utf8');
const OLD = fs.readFileSync(path.join(__dirname, '..', 'pilots', 'lantern-drum.pre-kit.html'), 'utf8');
const scriptsOf = h => [...h.matchAll(/<script(?: id="(\w+)")?>([\s\S]*?)<\/script>/g)].map(m => [m[1] || 'main', m[2]]);
const idsOf = h => [...h.matchAll(/id="([\w-]+)"/g)].map(m => m[1]);
let pass = 0, fail = 0;
function ok(c, name, extra) { if (c) { pass++; console.log('PASS', name, extra === undefined ? '' : extra); } else { fail++; console.log('FAIL', name, extra === undefined ? '' : extra); } }
function boot(html, store, now) {
  const E = makeEnv({ ids: idsOf(html), storage: store, now });
  for (const [id, src] of scriptsOf(html)) E.run(src, id);
  E.frames(3); return E;
}
// advance page time and the audio clock together
function tick(E, ms) { for (const c of E.contexts) if (c.state === 'running') c.currentTime += ms / 1000; E.frame(ms); }

(async () => {
  const OLD_SAVE = { vol: 0.5, muted: false, offset: 12, kit: 1, lastMode: 'random', bestRandom: 3100, daily: { date: '2026-11-05', score: 900 }, bestCombo: 44, total: 700, runs: 6 };
  const store = new Map([['lanternDrum.v1', JSON.stringify(OLD_SAVE)]]);
  const E = boot(NEW, store);
  const L = E.win.LANTERN;
  ok(L && L.state === 'title' && E.log.errors.length === 0, 'boots to the title with no errors', E.log.errors.slice(0, 2).join(' | '));
  const S = L.save;
  ok(S.total === 700 && S.runs === 6 && S.kit === 1 && S.offset === 12 && S.bestRandom === 3100 && S.daily.score === 900, 'an old save loads with every field kept');
  ok(S.badges && Object.keys(S.badges).length === 0, 'old save gets an empty badges list');
  ok(store.has('lanternDrum.v1.bak1'), 'a backup of the old save is made on load');
  ok(/New river in|in \d+h|\d+m/.test(E.byId.dailySub.textContent), 'title shows the countdown to the next river', E.byId.dailySub.textContent);

  // same daily seed as before the kit
  // the pre-kit game hides its helpers inside a closure, so lift its own two functions out and run them in the same fake browser
  const O = makeEnv({ storage: new Map() });
  O.run(OLD.match(/function hashStr[^\n]*/)[0] + '\n' + OLD.match(/function todayKey[^\n]*/)[0] + '\nwindow.__T={hashStr:hashStr,todayKey:todayKey};', 'old');
  const T = O.win.__T;
  ok(L.todayKey() === T.todayKey() && /^\d{4}-\d{2}-\d{2}$/.test(L.todayKey()), 'daily key matches the pre-kit game', L.todayKey());
  ok(L.hashStr('lantern-drum|' + L.todayKey()) === T.hashStr('lantern-drum|' + T.todayKey()), 'daily seed matches the pre-kit game, so today\'s river is unchanged');
  // 11:30 PM Central is already the next day in UTC; the key must stay on the local date
  const late = boot(NEW, new Map(), Date.UTC(2026, 10, 7, 5, 30));
  ok(late.win.LANTERN.todayKey() === '2026-11-06', 'at 11:30 PM local the river is still today\'s', late.win.LANTERN.todayKey());

  // play the daily with a bot that hits every lantern for a while, then stops
  E.byId.mDaily.fire('click', {}); await E.flush();
  ok(L.state === 'play' && L.run && L.run.mode === 'daily' && L.run.seed === L.hashStr('lantern-drum|' + L.todayKey()), 'Tonight\'s River starts with the daily seed');
  ok(E.contexts.length === 1, 'one audio context, shared by the game and the kit', E.contexts.length + ' contexts');
  let f = 0; const held = [];
  while (L.state === 'play' && f++ < 60 * 240) {
    const R = L.run, now = L.heardNow() - S.offset / 1000;
    if (R.phase === 'run' && f < 60 * 70) {
      for (let i = R.first; i < R.notes.length; i++) {
        const n = R.notes[i]; if (n.t > now + 0.02) break;
        if (n.state === 0 && Math.abs(n.t - now) <= 0.02) { L.laneDown(n.lane, 0); if (n.endT) held.push(n); else L.laneUp(n.lane); }
      }
      for (let i = held.length - 1; i >= 0; i--) if (now >= held[i].endT) { L.laneUp(held[i].lane); held.splice(i, 1); }
    }
    tick(E, 1000 / 60);
  }
  for (let i = 0; i < 120; i++) tick(E, 1000 / 60);
  await E.flush();
  const R = L.run;
  ok(L.state === 'over' && R.committed, 'the run ends and is saved', 'score ' + R.score + ', struck ' + R.struck + ', combo ' + R.maxCombo + ', ' + Math.round(f / 60) + ' s');
  ok(S.runs === 7 && S.total === 700 + R.struck && S.daily.date === L.todayKey(), 'run count, lanterns and today\'s best update');
  ok(S.badges.river > 0, 'River Regular is earned for playing the daily');
  ok(R.maxCombo >= 50 ? S.badges.fever > 0 : true, 'Fever Dream is earned when fever was reached', 'max combo ' + R.maxCombo);
  const saved = JSON.parse(store.get('lanternDrum.v1'));
  ok(saved.runs === 7 && saved.badges.river > 0 && saved.offset === 12, 'badges are written into the same save format');
  ok(E.byId.overCard.innerHTML.length > 200, 'over screen renders');
  ok(E.byId.overCard.innerHTML.includes('shareBtn'), 'over screen has a Share button');
  const line = L.shareLine();
  ok(/^Lantern Drum .*Nov 6/.test(line) && line.includes(L.fmt(R.score)), 'share line names the game, the day and the score', JSON.stringify(line));

  // badges screen
  E.byId.badgeBtn.fire('click', {});
  ok(/gk-badges/.test(E.byId.badgeGrid.innerHTML) && /of 11 earned/.test(E.byId.badgeCount.textContent), 'badges screen renders all 11', E.byId.badgeCount.textContent);

  // export then import round trip through the kit
  const code = L.protect.exportCode();
  ok(/^GK1\./.test(code), 'export makes a save code');
  const S2 = new Map(); const E2 = boot(NEW, S2);
  const imp = E2.win.LANTERN.protect.importCode(code);
  ok(imp && imp.ok !== false && JSON.parse(S2.get('lanternDrum.v1')).runs === 7, 'importing the code on another phone restores the save', JSON.stringify(imp));

  // a damaged save comes back from the backup
  store.set('lanternDrum.v1', '{oops');
  const E3 = boot(NEW, store);
  ok(E3.win.LANTERN.save.runs >= 6 && E3.log.errors.length === 0, 'a damaged save comes back from a backup', 'runs ' + E3.win.LANTERN.save.runs);

  ok(E.log.errors.length === 0, 'no page errors', E.log.errors.slice(0, 3).join(' | '));
  // kit 2: Motion setting drives the game's reduced-motion switch live; prefs live outside the game save; kit routing stays off
  {
    const st = new Map([['lanternDrum.v1', JSON.stringify(OLD_SAVE)]]);
    const E2 = boot(NEW, st); const G2 = E2.win.GK;
    ok(/^2\.1\./.test(G2.version) && /GK.audio.route=false/.test(NEW), 'kit 2.1 on the page, sound routing left as the game built it');
    const slot = E2.byId.pywSlot, pyw = slot && slot.children[0];
    G2.prefs.set('motion', 'still');
    ok(pyw && 'data-gk-prefs' in (pyw.attrs || {}) && G2.prefs.get('motion') === 'still' && !E2.byId.motRow, 'Motion lives in Play your way, opened from Settings (old Motion row gone)');
    ok(!/motion/.test(st.get('lanternDrum.v1')) && st.has('gk.prefs.v1'), 'Motion choice is kept apart from the game save');
    ok(E2.log.errors.length === 0, 'no errors with Motion set to Still', E2.log.errors.slice(0, 2).join(' | '));
  }
  console.log('\nTOTAL', pass, 'pass', fail, 'fail'); process.exit(fail ? 1 : 0);
})().catch(e => { console.log('CRASH', e.stack); process.exit(1); });
