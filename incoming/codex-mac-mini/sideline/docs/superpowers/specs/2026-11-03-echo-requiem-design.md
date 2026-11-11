# ECHO REQUIEM — approved design

You are the last living weapon inside a cathedral orbiting a dying sun. The cathedral remembers everything you do. Make that useful.

## Play
Desktop browser twin-stick arena action: WASD move, mouse aim/left hold fires, Space/E/right click Fork, Shift dash, Esc pause, M mute, 1/2/3 upgrades. Fixed logical1280×720; circular arena centered640,360 radius310. Base player100HP, speed260, shots20damage at8/sec and speed900; dash0.15sec and1.5sec cooldown. Numbers may be tuned from playtest evidence.

## Fork
Capture last240 completed player frames (pose/aim/actual emitted shots), minimum60frames. Two starting charges; sequential360tick recharge, each kill removes18ticks from current recharge. Activation before movement/collisions teleports to oldest pose, clears history, grants18ticks immunity; Fork wins over simultaneous dash. Ghost starts next tick, one recorded frame per tick, exactly-once recorded shots at60% captured damage. Max2 echoes, retire oldest; no RNG during replay or echo history recording. Health, world/enemies/live bullets/upgrades/cooldowns continue. History trail and landing preview must make ability legible.

## Run
Three60sec acts: THE WAKE (chasers, first8sec gentle onboarding), THE FRACTURE (sentries), THE PROCESSION (lancers), then THE CHOIR boss. Seeded spawns with30tick warning and safe separation. Each kill100base, combo up to5; every ten consecutive kills increments multiplier; each kill refreshes a2sec inactivity timeout, and expiration resets the streak. After acts1/2, pause for choose1of3 unique seeded unowned upgrades: damage+25%, fire rate+20%, pierce+1, echo60->90%, Fork90radius40damage burst, maxHP+25/heal25. Transition clears hostile entities/projectiles/history/echoes; heals25, resets dash and fills charges. Act3 goes straight to boss.

Boss12000HP after playtest tuning, always damageable, phases at66%/33%HP. Rotating gapped rings, targeted0.8sec telegraph beams, then spirals. Visual fractured perimeter does not introduce hidden collision. Boss death wins, even simultaneous player death. Results score/time/kills/echo kills/seed, same-seed retry/new run. No persistent power.

## Look and sound
Near-black cathedral; worn gold architecture, ivory player, cyan echoes, vermilion threats. Dramatic eclipse, solid silhouettes, readable telegraphs; smooth trails and impact flashes. Fork ribbon collapse/audio dip/bass impact. Procedural organ/bass/percussion builds with acts. Animated world title with one main Play button. Reduced motion disables shake/intense flashes.

## Technical invariants
Pure fixed60Hz sim, seeded gameplay RNG and independent cosmetics. Bounded enemies64/projectiles512/particles700; reserve projectile capacity for player/echo. Cached glow sprites and geometry; DPR<=1.5. Pause/focus loss stops ticks and clears input. Profile v1 only settings/bestScore/lastSeed with fixture; unknown versions preserved, writes disabled. No external dependencies/runtime network.

## Tuning evidence
Initial3000HP made the final boss last only10seconds under accurate play.12000HP exposes all three phases, producing35–45second fights for a strong legal-input pilot. Final boss ring/spiral/beam damage is8/8/18; sentries fire a three-shot ±0.12rad fan for10damage per bullet with150tick spacing. Combo uses a rolling inactivity deadline between consecutive kills, not an impractical ten-kills-in-two-seconds quota.
