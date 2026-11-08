// Round-4 (v0.6) regression pins — written for defects FOUND in the v0.5 audit:
//  1. THROWS NEVER TRAVELED: a thrown ball spawned at the thrower's feet and his
//     own catch volume (reach 16, d=0) re-caught it the same tick. Every throw
//     in every game looped throw→self-catch→throw until runners settled. Ground-
//     ball force outs could not exist (forceTag 1.38/game were all collisions).
//  2. Contested steals could never be OUT: the tag was only checked on the catch
//     frame, and the throw-down always beat the runner (see #1 — it never even
//     left the catcher's hand). Held-ball tags + an honest exchange (pop time)
//     make the race real.
// These pins guard the MECHANICS (travel, no self-catch, races resolve), with a
// deliberately loose caught-rate band — the race is legitimately high-variance.
import { loadGame } from './load.mjs';
const MBD = loadGame();
const { BTN } = MBD;
let failures = 0;
function check(cond, name, extra) {
  console.log((cond ? 'PASS  ' : 'FAIL  ') + name + (extra ? '  — ' + extra : ''));
  if (!cond) failures++;
}
function mkPads() { return [{ held: 0, pressed: 0, released: 0 }, { held: 0, pressed: 0, released: 0 }]; }

/* 1. CPU throw: ball travels across the diamond, no self-catch, force out lands */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [5, 5, 5, 5, 5] });
  st.scene = 'GAME'; MBD.startHalf(st);
  st.half = 1; MBD.startHalf(st);                          // human bats, CPU fields
  const b = st.ball;
  st.phase = 'LIVE'; st.phaseT = 0; st.camera.mode = 'field';
  b.mode = 'held'; b.heldBy = 7; b.batted = true; st.chaser = 7; st.heldTimer = 0; st.playTimer = 0;
  const br = MBD.makeRunner(st, st.batter.player, 0); br.forced = true;
  let threw = false, travel = 0, selfCatch = false, forceOut = false;
  for (let f = 0; f < 400 && st.phase === 'LIVE'; f++) {
    MBD.tick(st, mkPads());
    for (const e of st.events) {
      if (e.type === 'throw') threw = true;
      if (e.type === 'catchpop' && b.heldBy === b.thrownBy) selfCatch = true;
      if (e.type === 'call:out' && e.data && e.data.kind === 'force') forceOut = true;
    }
    if (b.mode === 'throw') travel++;
    st.events.length = 0;
  }
  check(threw && travel > 30, 'throws travel across the diamond', travel + 'f airborne');
  check(!selfCatch, 'a thrower never fields his own throw');
  check(forceOut, 'ground-ball force out at 1B via a real throw');
}

/* 2. human throw (B + direction) also travels */
{
  const st = MBD.newGame({ scene: 'GAME', humanTeam: 1, seed: [6, 6, 6, 6, 6] });
  st.scene = 'GAME'; MBD.startHalf(st);                     // top: human fields
  const b = st.ball;
  st.phase = 'LIVE'; st.phaseT = 0; st.camera.mode = 'field';
  b.mode = 'held'; b.heldBy = 7; b.batted = true; st.chaser = 7; st.heldTimer = 0; st.playTimer = 0;
  const br = MBD.makeRunner(st, st.batter.player, 0); br.forced = true;
  let threw = false, travel = 0;
  for (let f = 0; f < 200 && st.phase === 'LIVE'; f++) {
    const p = mkPads();
    if (f === 10) { p[0].pressed = BTN.B; p[0].held = BTN.B | BTN.RIGHT; }   // throw to 1B
    MBD.tick(st, p);
    for (const e of st.events) if (e.type === 'throw') threw = true;
    if (b.mode === 'throw') travel++;
    st.events.length = 0;
  }
  check(threw && travel > 20, 'human throw travels toward the target base', travel + 'f airborne');
}

/* 3. steal races resolve both ways, caught-rate in a sane band */
{
  let races = 0, safe = 0, open = false;
  for (let g = 0; g < 14; g++) {
    const st = MBD.newGame({ demo: true, scene: 'GAME', seed: [g + 31, 2, 4, 6, 8] });
    st.scene = 'GAME'; MBD.startHalf(st);
    let guard = 0;
    while (!st.gameOver && guard++ < 140000) {
      MBD.tick(st, mkPads());
      for (const e of st.events) {
        if (e.type === 'steal') { races++; open = true; }
        if (e.type === 'stolen' && open) { safe++; open = false; }
        if (e.type === 'call:out' && open) { open = false; }
        if (e.type === 'playDead') open = false;
      }
      st.events.length = 0;
    }
  }
  const rate = races ? (races - safe) / races : 0;
  check(races >= 8, 'steal races happen', races + ' races');
  check(safe > 0 && races - safe > 0, 'races resolve BOTH ways (safe AND caught)', safe + ' safe / ' + (races - safe) + ' caught');
  // loose on purpose: measured 0.29-0.43 across builds; guards collapse, not tuning
  check(rate >= 0.15 && rate <= 0.65, 'caught-rate in honest band (0.15-0.65)', (rate * 100).toFixed(0) + '%');
}

/* 4. human pitch aim [v0.6 P1-1]: d-pad LEFT held through WINDUP slides the
      release target; the taken pitch crosses the plate near the aim, with the
      pitcher's control scatter STILL applied (aim = target, not result). */
{
  // drive full at-bats with a human pitcher; collect plate-crossing x of TAKEN
  // pitches from the ump call events (data.x = x - PLATE_X at catch)
  const drive = (aimLeft) => {
    const st = MBD.newGame({ scene: 'GAME', humanTeam: 0, seed: [11, 22, 33, 44, 55] });
    st.half = 1; MBD.startHalf(st);                     // bottom half: human (team 0) pitches
    const xs = [];
    for (let f = 0; f < 60000 && xs.length < 8; f++) {
      const p = mkPads();
      if (st.phase === 'PREPITCH') { p[0].pressed = BTN.B; p[0].held = BTN.B; }        // straight pitch
      else if (st.phase === 'WINDUP' && aimLeft) p[0].held = BTN.LEFT;                 // aim inside corner
      MBD.tick(st, p);
      for (const e of st.events) {
        if ((e.type === 'call:ball' || e.type === 'call:strike') && e.data && typeof e.data.x === 'number' && !e.data.swung) xs.push(e.data.x);
      }
      st.events.length = 0;
    }
    return xs;
  };
  const aim = drive(true), neutral = drive(false);
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const span = (a) => Math.max(...a) - Math.min(...a);
  check(aim.length >= 4 && neutral.length >= 4, 'aim test collects taken pitches', aim.length + ' aimed / ' + neutral.length + ' neutral');
  // clamp is PLATE_X - 40; scatter span for the human staff is ±(16-ctrl) ≤ ±10
  check(mean(aim) < -24 && mean(aim) > -56, 'aimed pitches cross near the aim (target -40, scatter on top)', 'mean ' + mean(aim).toFixed(1));
  check(mean(neutral) > mean(aim) + 18, 'aim actually moves the crossing point vs a neutral delivery', 'neutral ' + mean(neutral).toFixed(1) + ' vs aimed ' + mean(aim).toFixed(1));
  check(span(aim) >= 3, 'control scatter still applies — aim is not a laser', 'spread ' + span(aim));
}

console.log(failures === 0 ? '\nROUND 4: ALL PASS' : `\nROUND 4: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
