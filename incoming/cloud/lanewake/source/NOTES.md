# Lanewake — working notes (builder: Game 15)

## Design contract (Round 1)
- Fantasy: a lane, a wall, a touchpad. Find your stroke rhythm and the water lets you glide; fight it and you tire.
- Core loop (one sentence): tap each stroke as your arm comes ready, breathe on a hold, nail the wall, and touch out the field.
- Twist on the rhythm genre: the beat is your own body. Each stroke's ready time comes from the last stroke, so there is no song to follow; cadence is the skill, and gear (cruise/push) changes it.
- Repeated decision: tap now (rushed = weak + costly) or wait for the ready window (perfect); breathe now (costs a little glide) or hold off (O2 debt); push gear now (faster cadence, drains tank) or save it for the closing sprint.
- Scarce resources: Tank (energy) and O2 (free/fly).
- Loss: finishing outside the medals, false start DQ, or DNF (time cap). A race always ends.
- Target session: 30 s (50) to ~2:15 (200) per race; a series is 5-8 races.
- Two plausible strategies: even pace with push saved for the last 25; or go out hot in push and hang on (fly-and-die).
- First 60 s: title -> one tap "Race" -> 50 free, banner explains pads, beep, dive, underwater kicks, breakout, ~20 strokes, touch.
- Out of scope: online, accounts, real swimmers/teams/brands, stat upgrades, career sim.

## Rules (timing)
- Clock: performance.now()/event.timeStamp mapped to sim time; fixed 1/120 s steps with inputs applied at their exact timestamp. Not the audio clock: the rhythm is the swimmer's body, not music. Audio is feedback only.

## Round 2: bot tests and blunt critique (Nov 6)

What the bots showed (test/run-tests.js, 67 checks pass):
- Rhythm beats mashing everywhere. A masher (taps every ~0.11 s) is 2x+ slower and bonks in every event. A steady 0.40 s tapper who ignores the ring is 24% slower (62.7 vs 50.5 in the 100 free). Good: the beat is the skill.
- Pacing in the 200 works: paced 98.5, all-push 101.4 (tank empties at 118 m), never-push 102.0.
- Walls matter: sloppy flips cost ~1.4 s over a 100.
- Idle never soft-locks: auto start, drift breakout, auto walls, then DNF.

What was wrong, bluntly:
1. Breathing was decoration. A swimmer who never breathed was FASTER (49.95 vs 50.16) because a gasp cost almost nothing. Fixed: a gasp now kills that stroke (25% power), drops speed 18%, costs tank and only refills air to 60. Never-breathe is now 53.0 vs 50.2 with 8 gasps. Breathing only when low is still slightly fast, which is a real skill trade, not a hole.
2. One-thumb assist matched a skilled two-thumb swimmer (50.18 vs 50.16), so it was the best way to play. Fixed: assist walls are always "good", never "perfect" (q 0.9). Assist is now ~0.45 s slower over a 100 and still finishes.
3. False start on the very first race ended it as a DQ. A new player's first tap on "Take your mark" is the most likely mistake in the game. Fixed: Rookie and Club meets (and assist) recall the field with a whistle and a fresh beep; Regional and up is still one-start DQ. Help and coach notes say so.
4. The difficulty curve was a cliff: a realistic human (75 ms timing spread, sloppy walls) medaled at Rookie and nowhere from Regional up, and IM events were nearly free medals. Fixed: field tiers loosened (1.20 to 1.025) and event pars evened out. Now: realistic human medals Rookie to Regional and sometimes Conference; a decent player medals into State; Summit needs near-expert timing plus good pacing.
5. Tests had a bug: the timing-window test pressed the wrong arm after the breakout (crossed stroke), and the recall test rebuilt its bot every frame. Both fixed.

Juice added: entry and breakout ripples, speed-scaled stroke splashes, a V bow wake on every swimmer, your lane softly lit, glowing touchpads as each swimmer finishes, crowd claps over the last 20% (more when it's close), and a photo-finish call (beeps, applause, flash) when you touch within 0.25 s of someone.

Still weak after Round 2 (for Round 3):
- The ladder is just a list of 12 races. No season feel, no rivals, no reason to replay a won rung.
- Stroke unlocks are a toast and a chip; no moment.
- Rope floats are busy at 375 px; lane 3 highlight is almost invisible.
- Coach hint banner sits over the top wall during turns.

## Round 3: depth and beauty (Nov 6)

Added:
- Season rival. Tamsin Quell (Bluefen) swims every ladder final from Cobalt Cove on, always lane 4, always a little quicker than the middle of the field. Pre-race names her, the blocks show RIVAL over her lane, results say who won and by how much, and the ladder keeps a season head-to-head.
- Pool records. Every event has a record held by a fictional pool legend. Times are the best expert-bot swim (20 ms timing spread, best pacing found by search) plus 0.6%, so only near-flawless strokes, walls and pacing break them. A records screen shows record, holder, your best and a star; breaking one plays a fanfare and says so on the results.
- Stroke unlock moment. Earning a new stroke puts a "New stroke" card on the results with a one-line how-to and a Try it now button that opens a practice race in that stroke.
- Ladder summary: gold/silver/bronze counts and the rival tally.
- Beauty: lighter rope floats, your lane lit more clearly, swimmers clipped to the pool so nobody stands on the HUD, backstrokers start in the water, coach hints moved to mid-pool so they never cover a wall, current-rung badge readable.

Retested: 74 rule checks pass (determinism, rhythm vs masher in all 12 events, recall vs DQ, breathing, pacing, walls, assist, save fuzz, rival lane and determinism, records reachable only by expert timing). Headless phone runs at 375x667 and 320x568: real touches, pause on hidden tab with the clock frozen and audio suspended, reload keeps progress, corrupt and hostile saves recover, no horizontal scroll, no page errors. Round 3 flow test: recall banner, unlock card, Try it, rival final, ladder summary, records star.

Blunt critique after Round 3:
- Nobody has played this on a real phone. Touch latency, thumb comfort and whether the closing rings read at arm's length are all unproven.
- In the 50 and 100, pushing the whole way is still the fastest plan. Pacing only really bites in the 200s. A real coach would like that, but it means the push pill is close to an "always on" switch in sprints.
- The daily race can land on a stroke you haven't unlocked yet. It's fair (everyone gets the same race) but a brand-new player could meet butterfly there first.
- The rival tally counts replays, so it can be padded on an easy rung. It's only bragging rights, nothing else hangs on it.
- The roster of five lanes repeats faces quickly; more swimmers and a few rival lines of trash talk would add life.
