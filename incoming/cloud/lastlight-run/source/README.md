# Lastlight Run

Pseudo-3D sunset racer, one self-contained HTML file (vanilla JS, Canvas 2D, code-made WebAudio, no network).

- lastlight-run.html: standalone page, open it in any browser.
- artifact-body.html: the same game without the doctype/head wrapper (what gets published as the Artifact).
- tools/: build.sh (wraps the body), sim2.js (difficulty sims), calib.js (bot stretch times -> `splits`), play.js (390px touch test, screenshots). They need headless Chromium + Playwright.

## Loop
Race the sunset home. Daylight drains every second; each lantern gate buys back the time for the next stretch. Reach the finish before dark. Your best run becomes a ghost you can draft for up to +12% top speed.

## Defaults I picked
- 3 roads: Saltmarsh Causeway (easy), Copperpine Switchbacks (hairpins, hills), Glasswind Mesa (traffic, crosswinds). Each unlocks the next.
- Daylight per stretch = clean bot stretch time x road slack (1.14 / 1.05 / 1.03). If you edit a road, rerun tools/calib.js and paste new `splits`.
- Medals: gold about bot-with-ghost +1%, silver about +8%.
- Touch: hold left/right halves to steer, both to brake, swipe up or Boost button to burn an ember. Optional drag steering in settings.
- Save key: localStorage `lastlight-run.v1` (best times, ghosts, unlocks, settings), all in try/catch.

## Test results (bot-tested only, nobody has played it on a real phone)
- No console or page errors in any run.
- 390x844 touch: steer, brake, swipe boost, boost button, drag mode, pause, settings, save/reload, unlock all pass. No horizontal scroll at 390 or 375.
- Frame time (headless CPU canvas, dpr 1.5): about 16.7 ms steady, 17.4 ms avg at night, draw under 1 ms avg. Under GPU emulation it was much slower, so real-device perf is unverified.
- Difficulty sims (human-like bot with reaction lag, digital steering, missed brakes; 6 runs per skill): road 1 and 2 finished 6/6 at every skill; road 3 finished 3/6 at low skill, 5/6 mid, 6/6 high.

## Blunt self-critique
- The bot "humans" are still better drivers than most real thumbs. Road 2 may be too easy for the bot and still feel hard on glass. Needs real-phone play to tune slack.
- Speed feel relies on stripes, fog and edge streaks; there is no screen shake on bumps beyond a small kick. Cars are flat vector sprites, readable but plain.
- Music is a simple per-region arpeggio. Fine, not memorable.
- Gold on road 1 needs ghost drafting; a first-time player can't get gold until the second run. Intentional, but say so better.
- Frame time on a real mid-range Android is the biggest unknown.

## Next idea
A daily seeded fourth road (same road for everyone that day, built from the same piece list), with the ghost of yesterday's best.
