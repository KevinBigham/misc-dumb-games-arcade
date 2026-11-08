# Loopskate notes

Original one-thumb arcade game. Drag anywhere to skate; your glowing trail fades after 3 s. Cross your own trail to close a loop: the ice inside cracks and every critter in it drops. Clear all critters before the wave timer thaws the pond.

## Critters
- Puffling (1 pt): wanders, flees when close.
- Snipper (2): cuts your trail (0.9 s cooldown after each cut).
- Burrbug (3): chases in bursts; touching it ends the run.
- Glimmer (8): rare, fast, leaves after 9 s.

## Rules
- Loops within 2.6 s chain a combo (x1, x1.5, x2...). Combo notes climb a pentatonic scale.
- Holes are safe until you skate 14 units clear, then they ice over as the water shrinks.
- Runs end on falling in, a bite, or the thaw timer.
- Clear bonus: seconds left x 5 x wave.

## Build and test
- node tools/build.js  -> artifact-body.html (published) and loopskate.html (standalone)
- node test/run-tests.js  (27 rules checks)
- node test/test-page.js [w h]  (28 page checks, fake browser)
- node test/quick.js, node test/sweep.js  (balance)

## Bot results (Nov 6)
- Wave clear rates: w1 99%, w2 85%, w3 73%, w4 65%, w5 46%, w6 38%, w7 24%.
- Run length median about 55 s, p90 about 118 s; 600 runs all end.
- Careful bot 862 mean score, careless 676, random 2.
- Trail life sweep: 3.0 s chosen (2.9 waves avg).
- Page logic 0.13 ms avg per frame (no raster); smallest text 12px; max 3 flashes per second.
- Passed at 390x844, 430x932, 320x568.

## Only a real phone can check
Touch feel, real frame rate with drawing, sound unlock, haptics (iPhone may not tick mid-drag), Share sheet in the frame, safe-area layout, readability, human difficulty.
