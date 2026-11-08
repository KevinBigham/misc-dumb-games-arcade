// Round-6 (v0.6) pins — P1-3 INNINGS OPTION (3/6/9 on the title menu).
//  1. Title-menu selector: default 3, d-pad L/R cycles 3→6→9, pick survives
//     the MATCHUP transition into the game state.
//  2. Full CPU-vs-CPU games at 3, 6, and 9 innings all reach FINAL, and none
//     end before the selected last inning (st.inning >= st.innings at the end).
//  3. Walk-off at 9 still ends the game early (home go-ahead run in the bottom
//     of the 9th → walkoff flag → gameOver, no extras played).
// Ties at the end of regulation still go to extras (up to CONST.MAX_EXTRA, then
// a tie stands) — that pre-existing rule is unchanged and now scales off
// st.innings instead of CONST.INNINGS.
import { loadGame } from './load.mjs';
const MBD = loadGame();
const { BTN, CONST } = MBD;
let failures = 0;
function check(cond, name, extra) {
  console.log((cond ? 'PASS  ' : 'FAIL  ') + name + (extra ? '  — ' + extra : ''));
  if (!cond) failures++;
}
function mkPads() { return [{ held: 0, pressed: 0, released: 0 }, { held: 0, pressed: 0, released: 0 }]; }
function press(st, mask) { const p = mkPads(); p[0].pressed = mask; p[0].held = mask; return MBD.tick(st, p); }

/* 1. title menu: innings row cycles 3/6/9 and the pick sticks into MATCHUP */
{
  const st = MBD.newGame({});                       // boots on TITLE
  check(st.scene === 'TITLE' && st.innings === 3, 'menu: game length defaults to 3 innings');
  press(st, BTN.DOWN); press(st, BTN.DOWN); press(st, BTN.DOWN);
  check(st.menuSel === 3, 'menu: fourth row is the innings selector');
  press(st, BTN.RIGHT);
  check(st.innings === 6, 'menu: RIGHT cycles 3 → 6', 'innings=' + st.innings);
  press(st, BTN.RIGHT);
  check(st.innings === 9, 'menu: RIGHT cycles 6 → 9', 'innings=' + st.innings);
  press(st, BTN.RIGHT);
  check(st.innings === 3, 'menu: RIGHT wraps 9 → 3', 'innings=' + st.innings);
  press(st, BTN.LEFT);
  check(st.innings === 9, 'menu: LEFT cycles back 3 → 9', 'innings=' + st.innings);
  press(st, BTN.B);                                 // B on the row toggles forward, does NOT start
  check(st.innings === 3 && st.scene === 'TITLE', 'menu: B on the innings row toggles without starting');
  press(st, BTN.RIGHT);                             // pick 6
  press(st, BTN.UP); press(st, BTN.UP); press(st, BTN.UP);
  check(st.menuSel === 0, 'menu: nav back to 1P VS CPU');
  press(st, BTN.START);
  check(st.scene === 'MATCHUP' && st.innings === 6, 'menu: 6-inning pick survives into MATCHUP', 'innings=' + st.innings);
  press(st, BTN.START);                             // PLAY BALL
  check(st.scene === 'GAME' && st.innings === 6, 'menu: game starts at the selected length');
}

/* 2. full CPU games at 3/6/9 complete and reach FINAL (deterministic seeds) */
for (const [inn, seed, capMin] of [[3, [3, 1, 4, 1, 5], 30], [6, [6, 1, 8, 0, 3], 55], [9, [9, 2, 6, 5, 3], 80]]) {
  const st = MBD.newGame({ scene: 'GAME', demo: true, seed, innings: inn });
  st.scene = 'GAME'; MBD.startHalf(st);
  let f = 0;
  const cap = 60 * 60 * capMin;
  for (; f < cap && !st.gameOver; f++) MBD.tick(st, mkPads());
  check(st.gameOver && st.scene === 'FINAL', `full game: ${inn}-inning CPU game reaches FINAL`,
    `score ${st.score.join('-')} · ${(f / 60 / 60).toFixed(1)} min`);
  check(st.inning >= inn, `full game: ${inn}-inning game played at least ${inn} innings`,
    `ended in inning ${st.inning}${st.inning > inn ? ' (extras)' : ''}`);
}

/* 3. walk-off at 9 ends the game early — no extras */
{
  const st = MBD.newGame({ scene: 'GAME', demo: true, seed: [7, 7, 7, 7, 7], innings: 9 });
  st.scene = 'GAME'; MBD.startHalf(st);
  st.inning = 8; st.half = 1; st.score = [2, 2];
  MBD.scoreRun(st, null);                            // go-ahead run, bottom 8th
  check(!st.walkoff, 'walk-off: bottom-8 go-ahead run does NOT end a 9-inning game');
  st.inning = 9; st.score = [2, 2];
  MBD.scoreRun(st, null);                            // go-ahead run, bottom 9th
  check(st.walkoff, 'walk-off: bottom-9 go-ahead run sets the walk-off flag');
  st.phase = 'LIVE'; st.phaseT = 0;
  MBD.endLivePlay(st, 'walkoff-test');
  check(st.resolveNext === 'gameOver', 'walk-off: play resolution routes to gameOver');
  let f = 0;
  for (; f < 600 && st.scene !== 'FINAL'; f++) MBD.tick(st, mkPads());
  check(st.scene === 'FINAL' && st.gameOver && st.inning === 9,
    'walk-off: 9-inning game ends in the 9th (no extras)', `score ${st.score.join('-')}`);
}

console.log(failures ? `\nROUND 6: ${failures} FAILURES` : '\nROUND 6: ALL PASS');
process.exit(failures ? 1 : 0);
