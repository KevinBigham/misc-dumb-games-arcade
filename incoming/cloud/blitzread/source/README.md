# Blitzread

Arcade 7-on-7 football for a phone. You are the play-caller and the quarterback for the Cedar Flats Lamplighters in the fictional Harvest Circuit 7s league.

Every down the defense shows a look, and a scouting bar shows what they usually call in this situation. Pick one of six plays, then run it yourself: tap a receiver to throw, hold to steer the runner, swipe to juke. Some teams disguise their look, and calling the same play over and over heats it up, so the defense keys on it. When they have the ball you call one of four defenses against their visible offensive tendency, and call again on every 3rd down.

- Season: six teams on a ladder, three strikes ends the season. Winning the Harvest Cup unlocks Iron Season (sharper disguises, faster-learning defenses) and the Hayride Flea trick play.
- Daily game: one seeded game per date against a generated town team.
- Clock: two 5:30 halves, pace control (Milk / Normal / Hurry), overtime from the 25.

## Files
- `src/core.js`: pure, seeded rules engine (CONFIG, DATA, state, rules, sim). No DOM.
- `src/ui.html`: renderer, input, generated WebAudio, storage.
- `build.mjs`: inlines core into the shell, writing `blitzread.html` (the one shipped file).
- `test/`: bot harness and checks (see PLAYTEST.md).

Build: `node build.mjs`. Everything is original: names, art (canvas), text and music (generated in code). No external assets or network calls.
