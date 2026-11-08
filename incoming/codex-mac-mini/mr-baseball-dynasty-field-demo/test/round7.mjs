// Round-7 (v0.7) regression pins — stale-isBatter repair.
//
// ROOT CAUSE (found via live-object tracing, 2026-07-19): makeRunner sets
// isBatter at creation (fromBase===0) and NOTHING ever cleared it — and both
// call sites pass fromBase 0, so EVERY runner read as "the batter-runner"
// forever. Eight consumers keyed on the flag misfired against runners left
// over from earlier PAs:
//   - foulBall's batter-despawn branch VAPORIZED real baserunners on fouls
//     ('scored' with no run, no event — silent offense theft),
//   - a safe pure steal set batterResult '2B'/'3B' at arrival → phantom HIT +
//     'DOUBLE!' banner + the batter LOST HIS PLATE APPEARANCE (samePA routing
//     needs batterResult===null),
//   - a caught steal set batterResult 'OUT' → same PA theft,
//   - flyout attribution (find isBatter&&run) could call the WRONG RUNNER out
//     and let the real batter reach,
//   - the tag-up recall loop and the human RETREAT (B) command skip isBatter
//     runners — i.e. they matched nobody: both were dead code,
//   - computeForces saw any running runner as "the batter running" → spurious
//     force chains during steals (bag-touch outs instead of tags).
// FIX: afterResolve clears isBatter on every runner that survives a play
// boundary (no such runner is the next play's batter-runner), foulBall/
// endLivePlay clear steal state (flag + burst speed) when they settle a thief,
// and the arrival branch only credits SAFE!/'stolen' to a runner arriving at
// the TARGET base (state 'run'), not a tag-back.
//
// PIN TECHNIQUE: runners are put aboard via awardWalk + a real RESOLVE
// boundary (not hand-set flags) so these tests FAIL on the pre-fix engine.
import { loadGame } from './load.mjs';
const MBD = loadGame();
const { BTN, GEO, toSub } = MBD;
let failures = 0;
function check(cond, name, extra) {
  console.log((cond ? 'PASS  ' : 'FAIL  ') + name + (extra ? '  — ' + extra : ''));
  if (!cond) failures++;
}
function mkPads() { return [{ held: 0, pressed: 0, released: 0 }, { held: 0, pressed: 0, released: 0 }]; }
function drainResolve(st) {
  let g = 0;
  while (st.phase === 'RESOLVE' && g++ < 500) MBD.tick(st, mkPads());
}
// walk the current batter aboard and cross a real play boundary
function walkAboard(st) { MBD.awardWalk(st); drainResolve(st); }

/* 1. play boundary clears isBatter; a pure steal then keeps the batter's PA,
      credits no hit, and playDead carries result null */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [3, 9, 9, 9, 9] });
  st.scene = 'GAME'; MBD.startHalf(st);
  st.half = 1; MBD.startHalf(st);                    // human bats (bottom)
  walkAboard(st);
  const r = st.bases[1];
  check(r && r.isBatter === false, 'runner aboard via a real boundary is no longer "the batter"');
  const batter0 = st.batter.player, hits0 = st.hits[1];
  let jumped = false, stolen = false, result = 'unset', stampAtArrival = 'unread';
  for (let f = 0; f < 4000 && result === 'unset'; f++) {
    const p = mkPads();
    if (!jumped && st.phase === 'PREPITCH' && st.phaseT >= 6) { p[0].pressed = BTN.A; p[0].held = BTN.A | BTN.UP; }
    MBD.tick(st, p);
    for (const e of st.events) {
      if (e.type === 'steal') jumped = true;
      if (jumped && e.type === 'stolen') { stolen = true; stampAtArrival = st.bases[e.data.base] && st.bases[e.data.base].stealFrom; }
      if (jumped && e.type === 'playDead') result = e.data.result;
    }
    st.events.length = 0;
  }
  drainResolve(st);
  check(jumped && stolen, 'human steal command races and resolves SAFE (seeded)');
  check(result === null, 'pure steal play carries batterResult null', JSON.stringify(result));
  check(st.batter.player === batter0, 'the batter KEEPS his plate appearance after the steal');
  check(st.hits[1] === hits0, 'no phantom hit credited on the stolen base', 'hits ' + hits0 + '→' + st.hits[1]);
  check(stampAtArrival === 1, 'arrival keeps the foul-recall stamp through the play', 'stealFrom=' + stampAtArrival);
  // the thief may legitimately take 3B on the throw-down — assert on the
  // runner, not a fixed bag
  check(r.stealFrom === undefined, 'stamp clears once the steal is final (next PREPITCH)', 'stealFrom=' + r.stealFrom);
}

/* 1b. a foul AFTER the thief arrived still undoes the steal (rule: runners
       return to time-of-pitch bases; before, a long foul hang time let the
       steal stand) */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [9, 9, 9, 9, 9] });
  st.scene = 'GAME'; MBD.startHalf(st);
  st.half = 1; MBD.startHalf(st);
  walkAboard(st);
  const r = st.bases[1];
  // completed steal of 2B mid-play, foul verdict still pending
  st.bases[1] = null; st.bases[2] = r;
  r.fromBase = 2; r.toBase = 3; r.state = 'onbase'; r.stealing = false; r.stealFrom = 1;
  const bc2 = GEO.bases[2]; r.xS = toSub(bc2.x); r.yS = toSub(bc2.y);
  MBD.foulBall(st);
  check(st.bases[1] === r && !st.bases[2] && r.fromBase === 1, 'foul recalls even an ARRIVED thief to the launch bag');
}

/* 2. a foul ball recalls a mid-steal baserunner (was: despawned as "the
      batter"), kills the steal, and restores burst speed; the true
      batter-runner still correctly despawns */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [4, 9, 9, 9, 9] });
  st.scene = 'GAME'; MBD.startHalf(st);
  st.half = 1; MBD.startHalf(st);
  walkAboard(st);
  const r = st.bases[1];
  const base = MBD.TABLE16.runSpeed[r.player.ratings.spd];
  st.bases[1] = null; r.state = 'run'; r.toBase = 2; r.forced = false;
  r.stealing = true; r.speedS = base + (base >> 4);          // mid-steal, burst on
  const mid = { x: (GEO.bases[1].x + GEO.bases[2].x) >> 1, y: (GEO.bases[1].y + GEO.bases[2].y) >> 1 };
  r.xS = toSub(mid.x); r.yS = toSub(mid.y);
  const br = MBD.makeRunner(st, st.batter.player, 0);        // this play's real batter-runner
  MBD.foulBall(st);
  check(st.bases[1] === r && r.state === 'onbase', 'foul recalls the runner to his base (was: vaporized)');
  check(r.stealing === false, 'foul kills the steal flag');
  check(r.speedS === base, 'foul restores baseline speed (no compounding burst)', r.speedS + ' vs ' + base);
  check(br.state === 'scored' && st.bases[1] !== br, 'the true batter-runner still despawns on the foul');
}

/* 3. caught fly: the BATTER is the recorded out; a runner caught mid-flight
      tags back ('return' — the recall loop was dead code before) */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [5, 9, 9, 9, 9] });
  st.scene = 'GAME'; MBD.startHalf(st);
  st.half = 1; MBD.startHalf(st);
  walkAboard(st);
  const old = st.bases[1];
  st.bases[1] = null; old.state = 'run'; old.fromBase = 2; old.toBase = 3; old.forced = false;
  const mid23 = { x: (GEO.bases[2].x + GEO.bases[3].x) >> 1, y: (GEO.bases[2].y + GEO.bases[3].y) >> 1 };
  old.xS = toSub(mid23.x); old.yS = toSub(mid23.y);
  const br = MBD.makeRunner(st, st.batter.player, 0); br.forced = true;
  st.phase = 'LIVE'; st.phaseT = 0; st.camera.mode = 'field';
  st.playTimer = 0; st.heldTimer = 0; st.playOuts = 0; st.batterResult = null;
  const f7 = st.fielders[7], b = st.ball;
  b.mode = 'flight'; b.batted = true; b.touchedGround = false; b.heldBy = -1;
  b.t = 30; b.bounces = 0; b.xS = f7.xS; b.yS = f7.yS; b.zS = toSub(10);
  b.vxS = 0; b.vyS = 0; b.vzS = -20;
  st.chaser = 7;
  let flyout = false;
  for (let f = 0; f < 30 && !flyout; f++) {
    MBD.tick(st, mkPads());
    for (const e of st.events) if (e.type === 'flyout') flyout = true;
    st.events.length = 0;
  }
  check(flyout, 'crafted fly is caught');
  check(br.state === 'out' && st.batterResult === 'FLYOUT', 'the BATTER is the man out on the fly', br.state + '/' + st.batterResult);
  check(old.state === 'return', 'runner caught mid-flight tags back (recall loop lives)', old.state);
}

/* 4. human RETREAT (B) actually recalls a runner (was: dead code) */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [6, 9, 9, 9, 9] });
  st.scene = 'GAME'; MBD.startHalf(st);
  st.half = 1; MBD.startHalf(st);
  walkAboard(st);
  const r = st.bases[1];
  st.bases[1] = null; r.state = 'run'; r.toBase = 2; r.forced = false;
  const mid = { x: (GEO.bases[1].x + GEO.bases[2].x) >> 1, y: (GEO.bases[1].y + GEO.bases[2].y) >> 1 };
  r.xS = toSub(mid.x); r.yS = toSub(mid.y);
  st.phase = 'LIVE'; st.phaseT = 0; st.camera.mode = 'field';
  st.playTimer = 0; st.heldTimer = 0;
  const f7 = st.fielders[7], b = st.ball;
  b.mode = 'held'; b.heldBy = 7; b.batted = true; b.xS = f7.xS; b.yS = f7.yS;
  st.chaser = 7;
  let retreat = false;
  const p = mkPads(); p[0].pressed = BTN.B; p[0].held = BTN.B;
  MBD.tick(st, p);
  for (const e of st.events) if (e.type === 'retreat') retreat = true;
  st.events.length = 0;
  check(retreat && r.state === 'return', 'B recalls a non-forced runner', 'retreat=' + retreat + ' state=' + r.state);
}

/* 5. a thief tagging BACK to his own bag is not SAFE — no 'stolen' event, but
      steal state still clears on the arrival */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [7, 9, 9, 9, 9] });
  st.scene = 'GAME'; MBD.startHalf(st);
  st.half = 1; MBD.startHalf(st);
  walkAboard(st); walkAboard(st);                    // runners at 1B and 2B
  const thief = st.bases[2];
  const base = MBD.TABLE16.runSpeed[thief.player.ratings.spd];
  st.bases[2] = null; thief.state = 'return'; thief.fromBase = 2; thief.toBase = 3;
  thief.stealing = true; thief.speedS = base + (base >> 4);
  const near = { x: GEO.bases[2].x + 6, y: GEO.bases[2].y + 4 };   // a step off the bag
  thief.xS = toSub(near.x); thief.yS = toSub(near.y);
  st.phase = 'LIVE'; st.phaseT = 0; st.camera.mode = 'field';
  st.playTimer = 0; st.heldTimer = 0;
  const f8 = st.fielders[8], b = st.ball;
  b.mode = 'held'; b.heldBy = 8; b.batted = true; b.xS = f8.xS; b.yS = f8.yS;
  st.chaser = 8;
  let stolenEv = false;
  for (let f = 0; f < 20 && thief.state !== 'onbase'; f++) {
    MBD.tick(st, mkPads());
    for (const e of st.events) if (e.type === 'stolen') stolenEv = true;
    st.events.length = 0;
  }
  check(thief.state === 'onbase' && st.bases[2] === thief, 'returning thief settles on his own bag');
  check(!stolenEv, 'tag-back arrival fires NO stolen-base event');
  check(thief.stealing === false && thief.speedS === base, 'steal state still clears on the tag-back', 'speedS ' + thief.speedS);
}

/* 6. computeForces: a mid-steal runner is not "the batter running" — no
      spurious force chain during a steal */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [8, 9, 9, 9, 9] });
  st.scene = 'GAME'; MBD.startHalf(st);
  st.half = 1; MBD.startHalf(st);
  walkAboard(st); walkAboard(st);                    // runners at 1B and 2B
  const thief = st.bases[2], holder = st.bases[1];
  st.bases[2] = null; thief.state = 'run'; thief.toBase = 3; thief.forced = false; thief.stealing = true;
  MBD.computeForces(st);
  check(holder.forced === false, 'runner holding 1B is NOT forced by a teammate\'s steal', 'forced=' + holder.forced);
  check(thief.forced === false, 'the thief is NOT flagged as a forced batter-runner', 'forced=' + thief.forced);
}

console.log(failures === 0 ? '\nROUND 7: ALL PASS' : `\nROUND 7: ${failures} FAILURE(S)`);
process.exit(failures ? 1 : 0);
