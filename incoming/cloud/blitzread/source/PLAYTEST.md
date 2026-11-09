# Blitzread playtest log (bot-tested only; nobody has played it on a real phone yet)

Run from this folder:
- `node test/bots.cjs 40`: smart vs random per team, single-play exploit vs Wardens, yards by play x defense, idle soft-lock, determinism, save round-trip.
- `node test/humanish.cjs 40 [iron]`: a "decent human" bot (70% right reads, sloppy timing) by rung.
- `node test/exploit.cjs 30`: spam one play vs every team.
- `node test/defcheck.cjs 30 [team]`: how much the defensive call matters.
- `node test/playlab.cjs PLAY DEF [heat] [team]`: one play vs one forced defense, 300 snaps.
- `node test/ui-checks.cjs`: 36 checks on the built page in a fake DOM (saves, audio, hidden tab, resume, kick meter, unlocks, music).
- `node test/ui-harness.cjs 10`: plays full games through the real tap, hold, swipe and key handlers.

## Results (Round 3 build)
- Smart bot (reads + execution) wins 0.97-1.0 vs the first four teams and 0.83-0.9 vs the Anvils; random play wins 0-0.13.
- Decent-human bot by rung: 0.93, 0.90, 0.97, 0.55, 0.57, 0.60. Iron Season: 0.83 down to 0.17.
- Defensive read vs the Kestrels: smart calls allow 6.8 points, random 11.2, always the wrong call 14.8.
- One play spammed all game: best case 0.67 (Tunnel Screen vs game-one Thistles), 0.5 or less from game three on; mixing calls 0.79-1.0.
- Idle bot (never throws or steers) finishes every game: no soft locks.
- Same seed gives the same game; saving and reloading every snap gives the same final score.
- UI: no audio before the first tap; hidden tab pauses the game, freezes the play and suspends audio; a corrupt save is kept as a backup and a fresh season starts; quitting mid-play rewinds to the last whistle; storage blocked still plays.

## Not tested
- Real touch feel on a phone (tap radius, swipe-juke threshold, hold-to-steer), frame rate on older phones, iPhone audio unlock in practice, the score bug and card sheet at real 375px rendering (laid out by estimate, not seen).
