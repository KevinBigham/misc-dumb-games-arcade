# Ledgerfall: blunt self-critique (after pass 1 bot tests)

**Pass 1 problems the bots exposed**
1. Joy was decoration. Over 20 bot years, Joy never fell below 78 and there were zero impulse buys. A meter that never matters is clutter.
2. Surprise bills never hurt a steady saver: 15.8 covered per run, 0 charged. The emergency-fund lesson was invisible because you always had one.
3. The "balanced row" bonus fired on about 80% of cleared rows. That is confetti, not a decision.
4. New pieces spawned in the hidden rows and stayed invisible for about 1.6 seconds at month-1 speed. Felt laggy.
5. Payday and game-over screens opened on real-time timers, so they could pop while the game was paused.
6. At 375px the board plus side column overflowed by 5px (padding was not subtracted).
7. "Pay off card from savings" was a no-brainer button.

**Fixes in pass 2**
- New payday decision: pick next month's budget plan (50/40/10, 50/30/20, 50/20/30, 50/10/40). Needs stay at half. Joy retuned so 50/30/20 is roughly neutral; Joy now also changes fall speed (relaxed 25% slower, stressed 20% faster). Bot results over 30 seeds each: Treat yourself median net worth $117 (low savings, so surprises land on the card), Balanced $3,490, Saver $5,356 with 6.8 impulse buys, Super saver $6,123 with 10.8 impulse buys and the most losses (25/30 finished). More saving pays more but is riskier, which is the trade I wanted.
- Pieces spawn fully visible. Screens open on frame-counted delays. Width math fixed.
- The pay-off button now says how much it leaves for surprises, which is the real trade (paying the card zeroes your emergency fund).

**Still weak (not fixed)**
- The bots place blocks instantly, so they cannot feel speed. Human difficulty, the value of "relaxed", and whether month 12 is fair are unknown until someone plays it.
- Balanced bonus still fires most of the time; it's a small reward, not a choice.
- Surprise bills still rarely bite a Balanced or Saver player; they bite mostly when you pay off the card or pick Treat yourself.
- The payday sheet is long on a small phone and scrolls.
- The music is one short loop and may wear thin over a 25-minute year.
- Nobody has played it on a real phone; touch thresholds (tap vs drag vs flick) are tuned by guess.

**Best idea for v2:** an Invest unlock at payday. Move savings into a fund with a higher average return but seeded month-to-month swings that can go down, and it can't pay a surprise bill on the spot. That teaches risk vs return and why the emergency fund stays in plain savings.
