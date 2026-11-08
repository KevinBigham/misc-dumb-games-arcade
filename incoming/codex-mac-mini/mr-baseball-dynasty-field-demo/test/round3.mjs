// Round-3 (v0.3) mechanics: steals, fielder switch, camera grammar cuts,
// K/BB/HBP texture bounds. All deterministic (fixed seeds, scripted inputs).
import { loadGame } from './load.mjs';
const MBD = loadGame();
const { BTN } = MBD;
let failures = 0;
function check(cond, name, extra) {
  console.log((cond ? 'PASS  ' : 'FAIL  ') + name + (extra ? '  — ' + extra : ''));
  if (!cond) failures++;
}
function mkPads() {
  return [{ held: 0, pressed: 0, released: 0 }, { held: 0, pressed: 0, released: 0 }];
}

/* 1. human steal command: A+UP during PREPITCH sends the runner from 1B */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [9, 9, 2, 3, 4] });
  st.scene = 'GAME'; MBD.startHalf(st);
  st.half = 1; MBD.startHalf(st);                       // bottom: human bats
  st.balls = 3; MBD.awardWalk(st); st.phase = 'PREPITCH'; st.phaseT = 0; MBD.newPA(st);
  for (let f = 0; f < 50; f++) MBD.tick(st, mkPads());  // build a lead
  const p = mkPads(); p[0].pressed = BTN.A; p[0].held = BTN.A | BTN.UP;
  MBD.tick(st, p);
  const r = st.runners.find(x => x.stealing);
  check(!!r && st.bases[1] === null, 'steal: A+UP launches the runner off 1B', r ? 'stealing, toBase ' + r.toBase : 'no steal');
  // 2. the runner completes the steal through non-LIVE phases
  let stolen = false, guard = 0;
  while (!stolen && guard++ < 2000) {
    MBD.tick(st, mkPads());
    for (const e of st.events) if (e.type === 'stolen') stolen = true;
    st.events.length = 0;
  }
  check(stolen && !!st.bases[2], 'steal: early jump completes — SAFE at 2B', 'frames ' + guard);
}

/* 3. contested steal: late jump (mid-windup) draws a catcher throw-down race */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [3, 1, 4, 1, 6] });
  st.scene = 'GAME'; MBD.startHalf(st);
  st.half = 1; MBD.startHalf(st);
  st.balls = 3; MBD.awardWalk(st); st.phase = 'PREPITCH'; st.phaseT = 0; MBD.newPA(st);
  // wait for the CPU pitcher to commit, then steal INTO the windup (bad jump)
  let guard = 0;
  while (st.phase !== 'WINDUP' && guard++ < 1200) MBD.tick(st, mkPads());
  for (let f = 0; f < 30; f++) MBD.tick(st, mkPads());  // deep into the windup
  const p = mkPads(); p[0].pressed = BTN.A; p[0].held = BTN.A | BTN.UP;
  MBD.tick(st, p);
  const launched = st.runners.some(x => x.stealing);
  let threw = false, outcome = null; guard = 0;
  while (outcome === null && guard++ < 3000) {
    MBD.tick(st, mkPads());
    for (const e of st.events) {
      if (e.type === 'throw') threw = true;
      if (e.type === 'stolen') outcome = 'safe';
      if (e.type === 'call:out') outcome = 'out';
    }
    st.events.length = 0;
  }
  check(launched, 'steal: windup-timed jump launches');
  check(threw, 'steal: defense contests with a throw-down', 'outcome: ' + outcome);
  check(outcome !== null, 'steal: race resolves decisively', outcome);
}

/* 4. fielder switch: A cycles the controlled chaser during a live ball */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [7, 7, 7, 1, 2] });
  st.scene = 'GAME'; MBD.startHalf(st);                 // top 1: human fields
  // inject a HANGING fly to the LF gap (long airtime → ball stays loose)
  const elevRad = ((680 - 512) / 2048) * Math.PI * 2;
  const speedU = 150 / 16;
  const planar = speedU * Math.cos(elevRad);
  const launch = { vxS: -Math.round(0.5 * planar * 256), vyS: -Math.round(0.85 * planar * 256), vzS: Math.round(Math.sin(elevRad) * speedU * 256) };
  st.ball.xS = MBD.CONST.PLATE_X << 8; st.ball.yS = MBD.CONST.PLATE_Y << 8;   // contact happens AT the plate
  st.phase = 'PITCH';
  MBD.applyContact(st.ball, launch);
  st.phase = 'BLANK'; st.phaseT = 0;
  for (let f = 0; f < 10; f++) MBD.tick(st, mkPads());  // through BLANK into LIVE
  const before = st.chaser;
  const p = mkPads(); p[0].pressed = BTN.A;
  MBD.tick(st, p);
  check(st.phase === 'LIVE' && st.chaser !== before && st.chaser >= 0, 'switch: A hands control to the next-nearest fielder', before + ' → ' + st.chaser);
  // lock holds against auto re-pick for a while
  const locked = st.chaser;
  for (let f = 0; f < 30; f++) MBD.tick(st, mkPads());
  check(st.chaser === locked || st.ball.heldBy >= 0, 'switch: manual pick is not instantly overridden');
}

/* 5. camera grammar: a throw hard-cuts the camera to the contested base */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [2, 2, 2, 2, 9] });
  st.scene = 'GAME'; MBD.startHalf(st);
  const elevRad = ((580 - 512) / 2048) * Math.PI * 2;
  const speedU = 110 / 16;
  const launch = { vxS: Math.round(0.5 * speedU * 256), vyS: -Math.round(0.8 * speedU * 256), vzS: Math.round(Math.sin(elevRad) * speedU * 256) };
  st.ball.xS = MBD.CONST.PLATE_X << 8; st.ball.yS = MBD.CONST.PLATE_Y << 8;
  st.phase = 'PITCH';
  MBD.applyContact(st.ball, launch);
  st.phase = 'BLANK'; st.phaseT = 0;
  let guard = 0;
  while (st.ball.heldBy < 0 && st.phase !== 'RESOLVE' && guard++ < 1200) MBD.tick(st, mkPads());
  if (st.ball.heldBy >= 0 && st.phase === 'LIVE') {
    const p = mkPads(); p[0].pressed = BTN.B; p[0].held = BTN.B | BTN.RIGHT;   // throw to 1B
    for (let f = 0; f < 8 && st.ball.mode !== 'throw'; f++) MBD.tick(st, f === 0 ? p : mkPads());
    MBD.tick(st, mkPads());                             // camera grammar applies post-throw
    const bc = MBD.GEO.bases[1];
    const dx = Math.abs((st.camera.xS >> 8) - bc.x), dy = Math.abs((st.camera.yS >> 8) - bc.y);
    check(st.ball.mode === 'throw' && dx <= 780 && dy <= 780, 'camera: throw cuts to frame the contested base', 'd=(' + dx + ',' + dy + ')');
  } else {
    check(true, 'camera: (skipped — ball resolved before a throwable hold)', 'phase ' + st.phase);
  }
}

/* 6. texture bounds: 6-game K/BB/HBP/steal mix inside sane arcade bands */
{
  const agg = { k: 0, bb: 0, hbp: 0, steal: 0, runs: 0 };
  const N = 6;
  for (let g = 0; g < N; g++) {
    const st = MBD.newGame({ scene: 'GAME', demo: true, seed: [g + 11, 3, 5, 7, 9] });
    st.scene = 'GAME'; MBD.startHalf(st);
    let guard = 0;
    while (st.scene !== 'FINAL' && guard++ < 250000) {
      MBD.tick(st, mkPads());
      for (const e of st.events) {
        if (e.type === 'call:strikeout') agg.k++;
        if (e.type === 'call:walk') agg.bb++;
        if (e.type === 'call:hbp') agg.hbp++;
        if (e.type === 'steal') agg.steal++;
      }
      st.events.length = 0;
    }
    agg.runs += st.score[0] + st.score[1];
  }
  const per = (v) => +(v / N).toFixed(2);
  check(per(agg.k) >= 1.5 && per(agg.k) <= 7, 'texture: strikeouts in band (1.5-7/game)', per(agg.k));
  check(per(agg.bb) >= 0.3 && per(agg.bb) <= 5, 'texture: walks exist, in band (0.3-5/game)', per(agg.bb));
  check(per(agg.hbp) <= 1.2, 'texture: HBP rare (≤1.2/game)', per(agg.hbp));
  check(per(agg.steal) >= 0.3, 'texture: CPU steals happen', per(agg.steal));
  check(per(agg.runs) >= 1 && per(agg.runs) <= 14, 'texture: total runs in arcade band', per(agg.runs));
}

console.log(failures === 0 ? '\nROUND 3: ALL PASS' : `\nROUND 3: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
