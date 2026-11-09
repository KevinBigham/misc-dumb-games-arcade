// Demo page smoke test: runs demo.html's scripts in the fake browser and plays it with a bot through real taps.
const fs = require('fs'), path = require('path');
const { makeEnv } = require('./stubdom.js');
const HTML = fs.readFileSync(path.join(__dirname, '..', 'demo', 'demo.html'), 'utf8');
const scripts = []; { const re = /<script id="(\w+)">([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(HTML))) scripts.push([m[1], m[2]]); }
const ids = [...HTML.matchAll(/id="([\w-]+)"/g)].map(m => m[1]);
let pass = 0, fail = 0;
function ok(c, name, extra) { if (c) { pass++; console.log('PASS', name, extra === undefined ? '' : extra); } else { fail++; console.log('FAIL', name, extra === undefined ? '' : extra); } }
(async () => {
  const store = new Map();
  const E = makeEnv({ ids, storage: store });
  E.byId.over.hidden = true;
  for (const [id, src] of scripts) E.run(src, id);
  E.frames(5);
  const PD = E.win.PIPDEMO, PIP = E.win.PIP;
  ok(PD && PD.mode === 'title' && E.log.errors.length === 0, 'demo boots to the title with no errors');
  ok(/New course in/.test(E.byId.dailyInfo.textContent), 'title shows the daily countdown', E.byId.dailyInfo.textContent);
  E.byId.bDaily.onclick();
  ok(PD.mode === 'play' && PD.world.seed === E.win.GK.daily.seed('pip-hop'), 'Daily starts a run seeded by the local date');
  // play with the smart bot, pressing through the stage's own pointer listener
  let frames = 0;
  while (PD.mode === 'play' && frames++ < 60 * 60) {
    if (PIP.BOTS.smart(PD.world)) { E.byId.stage.fire('pointerdown', { pointerId: 1, clientX: 100, clientY: 100, pointerType: 'touch' }); E.byId.stage.fire('pointerup', { pointerId: 1, clientX: 100, clientY: 100 }); }
    E.frame(1000 / 60);
  }
  await E.flush();
  ok(PD.mode === 'over' && !E.byId.over.hidden && PD.world.won, 'the bot finishes today\'s daily and the result card shows', E.byId.oWhy.textContent + ' ' + E.byId.oScore.textContent);
  ok(PD.save.plays === 1 && PD.save.days.days === 1 && PD.save.badges.hop, 'save counts the run and the day, and First Hop is earned');
  ok(store.has('pipHop.v1') && JSON.parse(store.get('pipHop.v1')).v === 1, 'progress is written to the versioned save');
  ok(/gk-badges/.test(E.byId.badges.innerHTML), 'badges grid renders');
  ok(E.log.audioPlays.length === 0 || E.win.GK.audio.ctx, 'no sound before a real unlock');
  E.byId.bShare.fire('click', {}); await E.flush();
  ok(E.log.clip.length === 1 && /^Pip Hop Nov \d+: \d+/.test(E.log.clip[0]), 'Share copies the daily result line', JSON.stringify(E.log.clip[0]));
  E.byId.bAgain.onclick(); ok(PD.mode === 'play', 'Again starts a new run');
  E.byId.bMenu.onclick(); E.byId.bRandom.onclick();
  ok(/^[A-Z]{3}-[A-Z]{3}-[A-Z]{3}$/.test(PD.world.seed), 'Random uses a shareable seed code', PD.world.seed);
  E.byId.seedIn.value = 'my lucky run'; E.byId.bSeed.onclick();
  ok(PD.world.seed === 'my lucky run', 'typed text becomes a seed');
  E.byId.bExport.onclick();
  ok(E.document.body.children.some(c => c.className === 'gk-sheet'), 'Export opens the save code box');
  E.hide(); ok(JSON.parse(store.get('pipHop.v1')).d.plays >= 3, 'saves when the page is hidden'); E.show();
  E.byId.bShake.onclick(); E.byId.bStop.onclick(); E.frames(30);
  E.byId.bJuice.onclick(); ok(PD.panel.open, 'Juice panel button opens the panel');
  E.frames(120);
  ok(/Frame rate/.test(E.byId.kv.innerHTML) && /Daily key/.test(E.byId.kv.innerHTML), 'kit status rows render');
  // reload: same storage, progress kept
  const E2 = makeEnv({ ids, storage: store }); for (const [id, src] of scripts) E2.run(src, id); E2.frames(3);
  ok(E2.win.PIPDEMO.save.plays >= 3 && E2.log.errors.length === 0, 'reload keeps progress');
  // corrupt save: restored from a backup
  store.set('pipHop.v1', '{oops'); const E3 = makeEnv({ ids, storage: store }); for (const [id, src] of scripts) E3.run(src, id); E3.frames(3);
  ok(E3.win.PIPDEMO.save.plays >= 1 && /restored/.test(E3.byId.kv.innerHTML), 'a damaged save comes back from a backup');
  ok(E.log.errors.length === 0, 'no page errors', E.log.errors.slice(0, 3).join(' | '));
  console.log('\nTOTAL', pass, 'pass', fail, 'fail'); process.exit(fail ? 1 : 0);
})().catch(e => { console.log('CRASH', e.stack); process.exit(1); });
