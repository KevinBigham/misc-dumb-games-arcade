# DESIGN CONTRACT — Game 03: The Last Signal: Ember Relay

**Brief**: Brief C ("The Last Signal") — Staged Discovery & Automation Narrative Incremental  
**Premise**: Premise 2 ("Ember") — *The Last Signal: Ember Relay*  
**Primary Reference**: *A Dark Room* (Doublespeak Games)  
**Supporting Reference**: *Universal Paperclips* (Frank Lantz) & *Factorio* (circuit condition rules)

---

## 1. Player Fantasy
You are the lone night-watch signal keeper stranded inside **Ember Point Relay**, a storm-battered coastal lighthouse and vacuum-tube radio station cut off from the mainland during the Solstice gale. Starting in total darkness with a frozen hand-dynamo and a single garbled SOS scratching across the speaker, you bring the station back to life room by room—eventually orchestrating an entire archipelago's relay network and deciding whether to preserve the islands' permanent communication sovereignty or burn out the grid to shepherd a fleeing refugee convoy past the reefs.

## 2. Core Repeated Decision
Every cycle, the keeper must decide how to allocate scarce **Watts**, **Salvage Alloy**, and **Cipher Keys** across three competing demands:
1. **Local Station Capability vs. Remote Beacon Upkeep**: Keeping remote island stations powered drains Watts every cycle and requires Salvage Alloy for antenna fortifications, slowing local capacitor and decoder upgrades.
2. **Automation Efficiency vs. Reserve Margin**: Enabling declarative automation rules (such as the *Auto-Crank Regulator* or *Signal Scrubber*) eliminates manual chores and accelerates throughput, but continuously consumes Alloy or Watts—risking a shortage when an encrypted high-priority distress transmission suddenly requires manual reserve power.
3. **Network Sovereignty vs. Convoy Evacuation**: Each of the 12 authored transmissions forces a concrete resource and structural commitment—either reinforcing the permanent 4-station archipelago mesh (**Network Integrity**) or stripping coastal beacons to overcharge the sea lane corridor for the **Offshore Convoy Meridian** (**Convoy Readiness**).

## 3. Scarce Resources (Capped at 3)
1. **`Power (Watts)`** *(Unlocked from Cycle 0)*: Generated manually via the Hand-Dynamo or passively via restored generators/automation; consumed by station beacons, signal decoding, and capacitor discharges.Bounded by `maxWatts` capacitor capacity.
2. **`Salvage Alloy`** *(Unlocked in Chapter 1 after initial dynamo warmup reveals hull damage)*: Recovered via the cliffside salvage winch or automated salvage drones; required for structural repairs, remote beacon activation, and the *Auto-Crank Regulator*.
3. **`Cipher Keys (Bandwidth)`** *(Unlocked in Chapter 2 when encrypted archipelago transmissions begin)*: Synthesized by aligning the frequency tuner or running the *Signal Scrubber* automation rule; spent to decrypt high-stakes transmissions and synchronize final Chapter 3 protocols.

## 4. Brownout / Reset & Failure Friction
- If **Power (Watts)** drops to `0 W` while remote stations are drawing load (and the *Emergency Load Shedder* automation rule is not active), the station suffers a **Receiver Brownout**: active remote beacons trip offline, signal lock degrades, and the player must either manually crank the dynamo or shed load to restore telemetry.
- There is **never** a mandatory real-time idle wall: every stage provides active mechanical actions (`Strike Match / Crank Dynamo`, `Haul Salvage Winch`, `Align Frequency Harmonic`, and `Advance Relay Cycle`) so a skilled player can play at full agency.

## 5. Target Session & Pacing
- **Target Session**: 10–15 minutes for a complete playthrough to Ending A or Ending B.
- **3 Chapters**:
  - **Chapter 1: Cold Receiver**: Starts with a single button (`Strike Match / Crank Dynamo`), an incomplete distress signal (`SIG-01`), and a choice between two initial repairs (`Rectifier Tube Bank` vs. `Cliffside Salvage Winch`). Completing the first repair and answering the first two distress transmissions transforms the station into a multi-panel relay room.
  - **Chapter 2: The Archipelago Grid**: Reveals the **Archipelago Radar Map** (4 remote stations), the **Safe Automation Rule Rack** (4 constrained declarative rules), and **Cipher Keys**.
  - **Chapter 3: The Solstice Transmission**: High-stakes signal triage as the eye of the storm hits. The player resolves the final transmissions and commits resources to either **Ending A** or **Ending B**.

## 6. Two Plausible Strategies & Reachable Endings
- **Strategy A — The Archival Beacon (Ending A: Network Sovereignty)**:
  - Prioritize early `Salvage Winch` repair and activate `Hull Salvage Drone` + `Signal Scrubber`.
  - Power and synchronize all 4 remote stations (`North Reef Lighthouse`, `Sunken Dredge Platform`, `Weather Buoy K-9`, `Offshore Convoy Meridian`) and choose network-preserving responses in transmissions.
  - Culminates in firing the **Archival Mesh Lock**, establishing a self-sustaining archipelago relay grid.
- **Strategy B — The Exodus Convoy (Ending B: Fleet Evacuation)**:
  - Prioritize `Rectifier Tube Bank` for high Watt surge capacity, paired with `Auto-Crank Regulator` and `Emergency Load Shedder`.
  - Channel Salvage Alloy and Cipher Keys into overcharging the reef corridor and answering Convoy Meridian's evacuation requests, deliberately sacrificing inland relay permanence to guide 400 survivors safely to open water.

## 7. First 60 Seconds
- **0–15s**: Screen shows a stark, dark panel with a cold status log and a single tactile button: **`Strike Match / Crank Dynamo (+4 W)`**.
- **15–35s**: At `8 W`, the vacuum receiver warms up with a synthesized tube hum. An incomplete Morse distress signal (`... --- ... / N-REEF`) flickers onto the newly revealed **Signal Feed**, and the player discovers the cracked lamp housing—unlocking **Salvage Alloy** and the choice between **two initial repairs**: *Overhaul Rectifier Tubes* (boosts dynamo output & Watt cap) or *Unjam Cliffside Winch* (boosts salvage yield).
- **35–60s**: The player decodes `SIG-01`, makes their first resource-backed transmission decision, completes their chosen initial repair, and witnesses the first visible station transformation as the **Frequency Oscilloscope** stabilizes.

## 8. Out-of-Scope Features (First Playable Discipline)
- No arbitrary code/script `eval()` in automation rules (strictly a 4-rule declarative condition-action rack).
- No more than 3 resources, 3 chapters, 4 remote stations, 12 authored message events, and 2 endings.
- No mandatory real-time waiting or offline wall-clock timers.

## 9. Playtest Verification Script
1. Mount game; verify only `Watts` and `Strike Match / Crank Dynamo` are initially visible.
2. Crank dynamo to warm receiver; verify `Salvage Alloy`, initial signal `SIG-01`, and the 2 initial repair choices appear.
3. Complete Chapter 1 repairs and events; verify transition to Chapter 2 unlocks `Cipher Keys`, the 4 remote stations, and the 4 automation rules.
4. Toggle automation rules and step cycles; verify deterministic resource conversion and clear per-rule explanations.
5. Verify reloading or re-dispatching an already-completed message ID never grants duplicate rewards (`completedEvents` guard).
6. Drive state to Ending A and Ending B in automated tests.

## 10. Next Experiment
Test whether players prefer tuning the harmonic frequency via a continuous phase-slider mini-interaction vs. discrete harmonic lock pulses during Chapter 3 storm interference spikes.
