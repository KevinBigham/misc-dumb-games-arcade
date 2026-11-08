# DESIGN CONTRACT — Game 10: Ten Floors Down

## 1. Grounded Reference & Design Pillars
- **Primary Reference**: *Shattered Pixel Dungeon* (Evan Debenham, based on Watabou's *Pixel Dungeon* — specifically `RegularLevel.java` room-graph generation, `Generator.java` deck-bounded supply tables, and `Actor.java` action-cost tick scheduling).
- **Supporting Reference**: *Brogue* (Brian Walker — unidentified potion discovery, throwing harmful potions as tactical weapons, and environmental tile hazards).
- **One-Sentence Core Loop**: Descend **10 procedural dungeon floors** in a turn-based tactical roguelike where every step, attack, and item use costs **Action Time (`Ticks`)**, **6 Potion Colors** are shuffled per seed until you identify them by drinking, throwing, or testing at an **Alchemy Desk**, and permadeath ends with an honest cause-of-death combat log.

## 2. Player Fantasy & Core Tension
- **Player Fantasy**: A lone delve tactician descending into a lethal 10-floor subterranean labyrinth, turning unknown alchemical vials, corridor bottlenecks, and turn-order manipulation into survival tools against overwhelming monsters.
- **Repeated Decision**: Every turn, choose whether to spend ticks **moving/repositioning**, **striking in melee**, **drinking vs. throwing an unidentified or identified potion**, **committing permanent `Scrolls of Upgrade`** to weapon/armor, or **activating a class ability** while watching the **Action-Cost Tick Preview** to avoid giving fast or heavy monsters a free double-turn.
- **Scarce Resource**:
  1. **HP & Healing Supply**: Bounded by `Generator.java`-style deck guarantees (at least 1 `Potion of Mending` and 1 `Scroll of Upgrade` or `Potion of Might` every 2 floors — plentiful enough to reward smart play, scarce enough that reckless facetanking kills you).
  2. **Action Ticks (`nextActTick`)**: Swinging a heavy 12-tick weapon against an 8-tick Sewer Rat or Void Stalker lets the enemy act twice unless you kite or stun.
  3. **Unidentified Potion Colors**: Drinking an unknown vial in an emergency might heal 45% HP (`Potion of Mending`)—or set you on fire (`Potion of Liquid Flame`). Testing at an **Alchemy Desk** or throwing unknown flasks at enemies identifies the color safely for the rest of the run.
- **Loss Condition (Permadeath)**: Reaching `0 HP` immediately ends the run, deletes the active save slot, and generates a permanent **Run Epitaph & Last-5-Turns Combat Cause-of-Death Recap** explaining the exact tick sequence and tactical mistake that killed you.
- **Victory Condition**: Descend to **Floor 10**, defeat **The Abyssal Core** final boss (navigating its telegraphed multi-tile eruptions), and step onto the Final Sanctuary Stairs.
- **Target Session Length**: 10–18 minutes for a complete 10-floor run (or 3–8 minutes for an early-floor learning death).

## 3. Two Plausible Winning Strategies
1. **The Vanguard Upgrade-Dump Tank (`Ironclad Vanguard`)**:
   - Starts with `Potion of Mending` pre-identified, high base HP (`90`), and `Shield Bash` (stuns adjacent enemy for 20 ticks).
   - Commits early `Scrolls of Upgrade` into heavy armor (`Dwarven Plate` / `Abyssal Aegis`) and uses corridor doorways to fight 1-on-1, saving `Shield Bash` to interrupt **The Iron Warden** (Floor 5) and **The Abyssal Core** (Floor 10) telegraphed slams.
2. **The Rogue Throw-Potion & Kite Tactician (`Shadow Rogue`)**:
   - Moves in `8 ticks` (20% faster than standard `10-tick` monsters) and starts with `Potion of Shadow Veil` pre-identified.
   - Identifies harmful potions (`Liquid Flame`, `Frost Mist`, `Caustic Gas`) early at Alchemy Desks or by throwing unknown flasks at packs, then kites enemies across burning/caustic tiles while using `Smoke Bomb` and `8-tick` daggers to land `2.0x` ambush criticals without taking retaliation hits.

## 4. First 60 Seconds Experience
1. **0–10s**: Player selects their Hero Class (`Ironclad Vanguard`, `Shadow Rogue`, or `Arcane Alchemist`) and either launches the **Daily Seed (`YYYY-MM-DD`)** or a custom seed.
2. **10–25s**: Floor 1 renders immediately on the crisp 2D dungeon canvas with real-time Field-of-View (FOV) lighting. The player sees their pre-identified class potion in the **Potion Journal** alongside 5 mysterious colored flasks (`Crimson`, `Amber`, `Viridian`, `Azure`, `Violet`, `Obsidian`).
3. **25–45s**: Player steps into the first Combat Room, observes the **Action-Cost Tick Preview Badge** (`Move: +10t | Strike: +10t — Warning: Rat gets double turn if you swing heavy!`), and defeats a Sewer Rat or Gnoll Scout.
4. **45–60s**: Player picks up an unidentified colored flask and discovers an **Alchemy Desk** or chooses to **Throw** the flask at a monster pack, permanently unlocking that color's identity across the entire run.

## 5. Out-of-Scope Features
- Hunger/starvation clock (keeps pacing focused on tactical combat, tick scheduling, and potion alchemy across 10 tight floors).
- Multi-branching overworld towns or NPC dialogue trees.
- Cursed equipment unequip locks (streamlined into clean tier upgrades + Scroll of Upgrade choices).

## 6. Playtest Script & Verification Checklist
1. Launch Floor 1 as `Ironclad Vanguard`; verify `Potion of Mending` color is marked `[IDENTIFIED]` in the Potion Journal while the other 5 colors read `??? Unidentified`.
2. Move with `WASD`/Arrows or Tap-to-Move; verify FOV reveals rooms and corridors smoothly and `Action Tick Clock` advances by `10 ticks` per move (`8` for Rogue).
3. Pick up an unidentified potion, click `Throw` (or press `T` after selecting a potion slot), and click a monster tile within range; verify the potion shatters on the target, applies its AoE effect, and permanently identifies that color in the Potion Journal.
4. Step onto an **Alchemy Desk (`⚗`)** and use `Identify Vial`; verify 1 unidentified potion in inventory is safely identified without consuming it.
5. Descend through Floor 5 (`The Iron Warden` mini-boss) and Floor 10 (`The Abyssal Core` final boss), or drop to `0 HP` to inspect the **Run Epitaph & Last-5-Turns Cause-of-Death Recap**.

## 7. Next Experiment Hypothesis
- Adding elemental combo reactions between thrown potions (e.g., throwing `Liquid Flame` onto a `Caustic Gas` cloud triggers a high-damage Alchemical Detonation) to deepen late-floor `Arcane Alchemist` mastery.
