# Prismwheel: blunt self-critique (bot-tested only, nobody has played it on a real phone)

## Round 1 (after the first playable build + 390px screenshots)
1. Falling shards were drawn as full-width slabs at their distance, so far-out shards looked like giant bars and the triple trail made volleys unreadable. FIXED: shards are capped at the dashed-ring face width and keep one faint ghost.
2. The opening was sleepy: a shard took about 4 s to land and the first wave waited 0.6 s. FIXED: base speed 0.25 to 0.30, spawn distance 1.2 to 1.1, first wave at 0.4 s.
3. Turning eased over ~180 ms, which feels mushy for an arcade spinner. FIXED: ~85 ms exponential settle; rules use the new face instantly.
4. Side-lane shards start off-screen on a 390px phone (the wheel is width-limited). MITIGATED: colored edge chevrons and shorter spawn distance.
5. Chains basically never happen (greedy bots max out at chain 2-3), so the deepest skill is nearly invisible. PARTLY ADDRESSED: CLUTCH SAVE bonus (+100 x chain) for clearing near the dashed ring, big CHAIN text, and a death tip that teaches chain setup. Still the weakest system.
6. On desktop the turn buttons stretched across half the screen. FIXED: capped at 240px.
7. The first-run toast covered the ring progress bar. FIXED: moved down.

## Round 2 (readability)
8. It was hard to tell which face a shard would hit mid-turn. FIXED: dashed landing ghost on the target face that brightens as the shard closes in. This is the single biggest readability win for a rotate-the-container game.
9. Score changes were easy to miss. FIXED: score bounce + warm tint on gain.

## Known limits
- Audio, haptics and touch feel are unverified on hardware; the harness stubs WebAudio and renders frames through a recording canvas.
- Difficulty curve was tuned on bots: a "sloppy" bot (25% misreads, late reactions) averages ~4.5 min and usually reaches Ring II; a perfect greedy bot lasts 8-12 min and hits the diff cap of 35.
- Ring-up wipes your stack for a bonus. That is a deliberate breather, but it can feel like losing a setup you were proud of.
