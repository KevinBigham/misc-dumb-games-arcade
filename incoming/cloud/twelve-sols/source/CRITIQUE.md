# Blunt self-critique (after pass 1) and what changed

1. **Unwinnable as built.** First balance run: an all-knowing bot won 1% of runs; warmth killed nearly everything by Sol 5. Heat Packs needed wire, the scarcest find. Fix: softer nights (warmth −11 instead of −16), stronger Heat Pack (+45), Hot Broth as a second warmth route, a wire chance at Glass Dunes, water yields 3. Expert bot now wins 89% (turtle) / 83% (beacon).
2. **First run was a brick wall.** Heat needed two undiscovered recipes and only one had a hint. Fix: the starting journal page hints Heat Coil too. A hint-reading first-timer bot went from 0% to 39%; with its journal kept, run 2 wins 80%.
3. **Knowledge maxes out, then the game goes flat.** Once all 17 recipes are known, the expert wins ~89% every time. Fix: four seasons unlocked by being rescued (storm +4/+8/+12, colder nights, score x1.25 to x1.8). Expert win rate drops 89% → 78% → 64% → 40%.
4. **Beacon run scored less than turtling.** Fixed the early-rescue bonus so both routes land near the same score; beacon is riskier on harsh seasons (26% vs 40% at the top level).
5. **Bot-caught risks checked:** no soft lock (End Sol always legal, every run ends), no farm loop (score capped; a dud costs its hour once then is blocked; builds capped; Use limited to what you hold), saves validated on load with damaged data kept as a backup and the journal cleaned instead of wiped, no double-counting on reload, audio only after first tap and suspended on hidden tab.

## Still weak (not fixed)
- Nobody has played it on a real phone. No real browser was available here, so layout at 375px is reasoned from CSS plus jsdom click tests, not seen.
- The ✦ "secrets left" counter makes discovery close to mechanical deduction. It removes frustration, but also some mystery.
- The night report is one extra tap every sol.
- Music is a sparse generative pad; fine, not memorable.
- Daily scores depend on how much of the journal you've filled, so it isn't a level field between friends.
