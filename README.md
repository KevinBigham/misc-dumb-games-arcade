# Misc Dumb Games Arcade

A small arcade of free browser games. Every game is a single static page: no build step, no installs, no accounts.

**Play:** https://kevinbigham.github.io/misc-dumb-games-arcade/

## Games

| Game | Genre | Play | About |
| --- | --- | --- | --- |
| Nine Lives Overdrive | Roguelite shooter | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/nine-lives-overdrive/) | A neon cat roguelite. Five sectors, five bosses, seven weapons, and one extremely unbothered cat. |
| Gloamrush | One-thumb flyer | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/gloamrush/) | Carry the last flame through the Gloam. One thumb, three minutes. |
| Spore Storm | Arena survival | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/spore-storm/) | A tiny spore knight versus the creeping rot. Survive 2:30, stack wild upgrades, slay the Rotking. |
| Stormglass | Merge puzzle | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/stormglass/) | Drop weather into a glass jar and merge matching skies into bigger storms before it overflows. |
| Gravity Moth | Endless runner | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/gravity-moth/) | Flip between floor and ceiling through an endless greenhouse at night. |
| Comet Orchard | Idle clicker | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/comet-orchard/) | Tap the star tree, harvest stardrops, and grow a cosmic orchard. |
| Moonpond Angler | Fishing | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/moonpond-angler/) | One frog, one rod, and a moonlit pond that changes as the night goes on. |
| Lantern Drum | Rhythm | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/lantern-drum/) | Strike each drum the moment its paper lantern touches the glowing line. New river every day. |
| Wobble Bakery | Physics stacker | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/wobble-bakery/) | Stack the tallest festival cake in town before it wobbles over. |
| Kettle Crawl | Deckbuilder | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/kettle-crawl/) | A tea-witch descent. Brew cards, beat elites, and go deeper. |
| Spore Siege | Tower defense | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/spore-siege/) | Plant mushrooms, unwind the clockwork beetles, and save the snail folk. |
| Lagoon Flip | Pinball | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/lagoon-flip/) | Night-tide pinball under a rising moon. |
| Kiln Words | Word game | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/kiln-words/) | Spell fast, fire hot, and keep the clay below the crack. Same daily board for everyone. |
| Nebula Greens | Mini golf | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/nebula-greens/) | Cosmic mini golf. 18 holes of bumpers, wormholes, void pools, and moving gates. |
| Glowtail Rumble | Arena growth | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/glowtail-rumble/) | Deep-trench growth arena. Eat glow, grow long, and make rivals crash into you. |
| Shardstorm Depths | Match-3 RPG | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/shardstorm-depths/) | Swap gems to charge four heroes and slay the Hollow Sovereign. |
| Bug Brawl | Auto-battler | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/bug-brawl/) | Draft a squad of bugs, stack synergies, and let them brawl. |
| Slipstreak | Drift racer | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/slipstreak/) | Hold, slide, and chain drifts from the pier loop to the rooftops. |
| Frostbore | Mining | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/frostbore/) | Drill the glacier, bank the relics, and fly back up before the heat runs out. |
| Clockbreak | Brick breaker | [Play](https://kevinbigham.github.io/misc-dumb-games-arcade/games/clockbreak/) | A roguelite brick breaker. Pick perks and break the wall before it creeps down. |

## Layout

```
index.html                      arcade landing page (links every game)
games/<game-slug>/index.html    one folder per game, fully self-contained
.nojekyll                       serve files as-is on GitHub Pages
```

## Adding a game

1. Put the game in `games/<game-slug>/index.html` (plus any assets in the same folder).
2. Add a card for it in the root `index.html`.
3. Add a row to the table above.

## Notes

- Games save progress in the player's own browser (`localStorage`) only. Nothing is sent anywhere.
- Outside requests: Google Fonts on some games, and Wobble Bakery loads the matter-js physics library from cdnjs.
- All art, music, and sound effects are generated in code. No third-party game assets are used.
- Games were tested with automated bots on desktop. Phone play has not been hand-tested yet.
