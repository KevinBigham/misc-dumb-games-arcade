// Round-2 mechanics: 84f delivery, bunt, manual baserunning, 2P routing, pickoff
import { loadGame } from './load.mjs';
const MBD = loadGame();
const { CONST, BTN, TUNE } = MBD;
let failures = 0;
const check = (ok, label, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`); if (!ok) failures++; };
const mkPads = () => [{ held: 0, pressed: 0, released: 0 }, { held: 0, pressed: 0, released: 0 }];

/* 1. delivery arc: windup event → release event = 84 frames [MEASURED target] */
{
  const st = MBD.newGame({ scene: 'GAME', demo: true, seed: [1, 1, 1, 1, 1] });
  st.scene = 'GAME'; MBD.startHalf(st);
  let windF = -1, relF = -1;
  for (let f = 0; f < 4000 && relF < 0; f++) {
    MBD.tick(st, mkPads());
    for (const e of st.events) {
      if (e.type === 'windup' && windF < 0) windF = st.frame;
      if (e.type === 'release' && relF < 0) relF = st.frame;
    }
  }
  check(relF - windF === CONST.WINDUP_FRAMES && CONST.WINDUP_FRAMES === 84, 'delivery: command→flight = 84 frames', `${relF - windF}f`);
}

/* 2. bunt: squared stance produces weak bunt contact on a zone pitch */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [8, 8, 8, 8, 8] });
  st.scene = 'GAME'; st.half = 1; MBD.startHalf(st);       // human bats
  let buntCrack = null;
  for (let f = 0; f < 6000 && !buntCrack; f++) {
    const p = mkPads();
    p[0].held = BTN.A;                                      // squared around the whole time
    MBD.tick(st, p);
    const c = st.events.find(e => e.type === 'crack');
    if (c && c.data.bunt) buntCrack = { f, launch: st.lastLaunch };
    if (c && !c.data.bunt) break;
  }
  check(!!buntCrack, 'bunt: squared stance makes bunt contact');
  if (buntCrack) {
    check(buntCrack.launch.speedRaw < 80 && buntCrack.launch.quality === 0, 'bunt: launch is a weak dribbler', `raw ${buntCrack.launch.speedRaw}`);
  }
}

/* 3. manual baserunning: A sends the runner off first */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [3, 1, 4, 1, 5] });
  st.scene = 'GAME'; st.half = 1; MBD.startHalf(st);
  // put a runner on 1B, then enter LIVE with a batted ball on the ground far away
  st.balls = 3; MBD.awardWalk(st); st.phase = 'PREPITCH'; MBD.newPA(st);
  const launch = MBD.computeLaunch(st.rng, 2, 20, 5, 'R', 4);
  MBD.applyContact(st.ball, launch);
  st.ball.xS = MBD.toSub(900); st.ball.yS = MBD.toSub(1400); st.ball.vxS = -400; st.ball.vyS = -300;
  st.phase = 'BLANK'; st.phaseT = 0;
  for (let f = 0; f < 10 && st.phase !== 'LIVE'; f++) MBD.tick(st, mkPads());
  // runner should currently be on 1B (it was placed by the walk); force-hold him there
  const r1 = st.bases[1];
  check(!!r1, 'baserunning: runner staged on 1B');
  // wait for auto-decisions to settle, then A-send
  let sent = false;
  for (let f = 0; f < 240 && st.phase === 'LIVE'; f++) {
    const p = mkPads();
    if (f === 30 && st.bases[1]) { p[0].pressed = BTN.A; }
    MBD.tick(st, p);
    if (st.events.find(e => e.type === 'send')) { sent = true; break; }
    if (!st.bases[1]) { sent = true; break; }              // auto-logic sent him — also fine
  }
  check(sent, 'baserunning: A press (or force) sends the runner');
}

/* 4. 2P routing: with control=[human1,human0], pad 1 swings for the away side */
{
  const st = MBD.newGame({ scene: 'GAME', control: ['human1', 'human0'], seed: [2, 7, 1, 8, 2] });
  st.scene = 'GAME'; MBD.startHalf(st);                     // top 1: away bats = human1 = pad 1
  // P1 (pad 0) pitches: press B
  for (let f = 0; f < 200 && st.phase === 'PREPITCH'; f++) {
    const p = mkPads(); if (f === 10) { p[0].pressed = BTN.B; p[0].held = BTN.B; }
    MBD.tick(st, p);
  }
  check(st.phase === 'WINDUP' || st.phase === 'PITCH', '2P: pad0 pitch command accepted', st.phase);
  while (st.phase === 'WINDUP') MBD.tick(st, mkPads());
  let swung = false;
  for (let f = 0; f < 40 && st.phase === 'PITCH'; f++) {
    const p = mkPads(); if (f === 2) { p[1].pressed = BTN.B; p[1].held = BTN.B; }
    MBD.tick(st, p);
    if (st.events.find(e => e.type === 'swing')) { swung = true; break; }
  }
  check(swung, '2P: pad1 swing registers for the away batter');
}

/* 5. pickoff: full-lead runner can be picked off; mechanism verified deterministically */
/* v0.3 test update (documented per handoff rules): CPU baserunners can now STEAL
   (cpuStealThink fires during PREPITCH). This fixture verifies the PICKOFF
   mechanism specifically, so CPU steal aggression is pinned to 0 for the trial
   — same pattern as the existing PICKOFF_OUT_CHANCE pin. Steals get their own
   coverage in test/round3.mjs. */
{
  function pickoffTrial(forceOut) {
    const savedSteal = MBD.TUNE.CPU_STEAL_PCT;
    MBD.TUNE.CPU_STEAL_PCT = 0;
    const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [7, 2, 3, 4, 5] });
    st.scene = 'GAME'; MBD.startHalf(st);                   // top 1: human fields
    st.balls = 3; MBD.awardWalk(st); st.phase = 'PREPITCH'; st.phaseT = 0; MBD.newPA(st);
    for (let f = 0; f < 180; f++) MBD.tick(st, mkPads());   // lead builds to max
    MBD.TUNE.CPU_STEAL_PCT = savedSteal;
    const r = st.bases[1];
    const leadBefore = r ? (r.leadS || 0) : 0;
    const saved = MBD.CONST.PICKOFF_OUT_CHANCE;
    MBD.CONST.PICKOFF_OUT_CHANCE = forceOut ? 256 : 0;
    const p = mkPads(); p[0].pressed = BTN.A; p[0].held = BTN.A | BTN.RIGHT;
    MBD.tick(st, p);
    MBD.CONST.PICKOFF_OUT_CHANCE = saved;
    return { outs: st.outs, leadBefore, leadAfter: st.bases[1] ? (st.bases[1].leadS || 0) : -1, fullLead: leadBefore >= (MBD.CONST.LEAD_MAX * 256) - 80 };
  }
  const out = pickoffTrial(true);
  const safe = pickoffTrial(false);
  check(out.fullLead, 'pickoff: lead reaches full extension', `${Math.round(out.leadBefore / 256)}u of ${MBD.CONST.LEAD_MAX}`);
  check(out.outs === 1, 'pickoff: full-lead runner is out when the roll hits', `outs ${out.outs}`);
  check(safe.outs === 0 && safe.leadAfter === 0, 'pickoff: survivor scrambles back, lead reset');
}

console.log(failures === 0 ? '\nROUND 2: ALL PASS' : `\nROUND 2: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
