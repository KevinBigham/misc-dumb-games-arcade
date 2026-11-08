# DESIGN_CONTRACT.md — Game 05: Beatline Salvage

## 1. Title & Concept
- **Title**: Beatline Salvage (*Split-Second Lanes*)
- **Genre**: Precision Audio-Clock Two-Lane Rhythm & Industrial Salvage Sorter
- **Primary Reference**: *Rhythm Doctor* / *Muse Dash* (Ultra-clear two-lane visual & audio telegraphing, strict audio-clock hit windows, calibration discipline)
- **Supporting Reference**: *Thumper* / *Hi-Fi RUSH* (Industrial kinetic feedback, high-risk overdrive lane switching on the beat)
- **One-Sentence Core Loop**: Sort high-velocity magnetic scrap cores across Left and Right induction lanes synced to a 90-second synthesized industrial-synthwave pulse, choosing whether to trigger high-voltage Overdrive Shunt gates for `1.5x` salvage yield at the risk of breaking your combo multiplier.

## 2. Core Design Pillars
- **Player Fantasy**: You are the master operator of an orbital magnetics foundry sorting volatile reactor cores at 128 BPM—feeling the industrial synth bass lock directly into your fingertips as every `PERFECT (±32ms)` strike sparks clean blue plasma.
- **Repeated Decision**: Every 4–8 bars, a **Shunt Gate** approaches on the beat. Do you stay on the **Standard Conveyor Route** (steady rhythmic patterns to protect your `4x` combo multiplier and Capacitor Stability) or press `[Space]` on the gate beat to divert into the **Overdrive Shunt Route** (`1.5x` salvage value per core, syncopated dual-lane crossovers and dense bursts)?
- **Scarce Resource**: **Capacitor Stability (`0..100%`)** and **Combo Multiplier (`1x..4x`)**. Missing notes drains Capacitor Stability (more severely while inside an Overdrive Shunt) and resets your multiplier; clean hits restore stability.
- **Loss / Rank Condition**:
  - **Loss Condition (Short Circuit)**: Capacitor Stability drops to `0%` (unless Practice Mode / No-Fail toggle is active).
  - **Rank Condition**: Completing the 90-second track awards a Shift Rank (`S`, `A`, `B`, `C`, `D`) based on accuracy percentage, max combo, and total salvage score, plus a **Timing-Error Distribution Histogram (`-120ms .. +120ms`)** and **4-Section Breakdown**.
- **Target Session Length**: **90 seconds** for a full shift chart (`30s` for an isolated Section Practice loop; `5s` for the optional 4-beat Audio-Input Calibration tool).

## 3. Two Plausible Winning Strategies
1. **Safe Full-Combo Standard Route ("Precision Auditor")**:
   - Stay on the Standard Conveyor at every Shunt Gate, prioritizing `100%` combo preservation (`4x` multiplier) and tightening timing accuracy inside the `±32ms` `PERFECT` window to lock in a safe `A` or `S` accuracy grade without risking stability drain.
2. **High-Risk Overdrive Shunt Route ("High-Voltage Overclocker")**:
   - Trigger `[Space]` at Shunt Gates during sections you have mastered (`Intro Induction`, `Conveyor Surge`, `High-Voltage Shunt`, `Furnace Finale`) to route cores through the `1.5x` Overdrive lane, using the **Section Practice Loop** on the Results screen to drill syncopated sections until you can hold full combo through Overdrive for maximum leaderboard salvage score.

## 4. First 60 Seconds Experience
- **0–5s**: High-contrast Industrial Control Deck loads with a one-click **"4-Beat Calibration (`-150ms..+150ms`)"** banner and an immediate **"Launch Shift"** button (plus difficulty tabs: `Cadet Sorter [Easy]`, `Shift Lead [Standard]`, `Overclocked Foundry [Expert]`, and `Seeded Daily Track`).
- **5–25s (`Section 1: Intro Induction`)**: The 128 BPM industrial kick and bass arpeggio lock in. Left (`[F]/[D]/[←]`) and Right (`[J]/[K]/[→]`) cores glide down dual magnetic rails with real-time millisecond delta badges (`PERFECT -4ms`, `EARLY -41ms`, `LATE +52ms`).
- **25–45s (`Section 2: Conveyor Surge`)**: The first **Shunt Gate** appears with an audio-visual charge telegraph. Pressing `[Space]` switches the rail aesthetics to High-Voltage Amber and introduces syncopated off-beat salvage cores worth `1.5x` points.
- **45–90s (`Section 3: High-Voltage Shunt` & `Section 4: Furnace Finale`)**: Climax synth lead kicks in; completing the track immediately opens the **Post-Shift Diagnostic Screen** with the **Timing-Error Histogram**, mean early/late bias recommendation, and a 1-click **"Practice Weakest Section"** button.

## 5. Audio Clock, Pause & Focus Discipline
- All hit judgments (`PERFECT ±32ms`, `GOOD ±75ms`, `EARLY/LATE ±120ms`, `MISS >120ms`) are computed strictly in the domain of `audioClockMs - userCalibrationOffsetMs`.
- Visual rendering uses the same clock delta solely for smooth conveyor positioning; dropping visual frames never alters note hit windows.
- **Pause (`[P]` / `[Esc]`) & Window Blur**: Immediately suspends/snapshots the active audio clock timestamp and opens a Pause Overlay. Resuming executes a clean resync so zero phantom misses occur.

## 6. Tested Device & Input Assumptions
- **Desktop Keyboard**: Left Lane (`[F]`, `[D]`, `[ArrowLeft]`), Right Lane (`[J]`, `[K]`, `[ArrowRight]`), Overdrive Shunt Switch (`[Space]`), Pause (`[P]` / `[Esc]`), Quick Restart (`[R]`), Debug Inspector (`[Backquote]` / `[F3]`).
- **Mobile / Touch (`375px+` width)**: Dedicated oversized bottom-left (`LEFT RAIL`), bottom-center (`OVERDRIVE SHUNT`), and bottom-right (`RIGHT RAIL`) touch pads triggered on `pointerdown` for zero-latency response.

## 7. Playtest Script & Next Experiment
- **Playtest Question**: Does the post-track Timing-Error Histogram and "Practice Weakest Section" button help players measurably reduce their mean timing error and clear Overdrive Shunt sections on their second run?
- **Next Experiment**: Compare player retry rate with and without the automatic calibration offset suggestion when mean timing bias exceeds `±25ms`.
