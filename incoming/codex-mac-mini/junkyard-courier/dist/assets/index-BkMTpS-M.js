const x="argon_game03_the_last_signal_save_v1";const n={initialWatts:0,initialMaxWatts:60,rectifierBonusMaxWatts:40,chapter2BonusMaxWatts:20,initialAlloy:0,initialMaxAlloy:60,winchBonusMaxAlloy:30,initialCipher:0,initialMaxCipher:30,receiverWarmupWatts:8,initialScrapDiscoveryAlloy:6,baseDynamoWatts:5,rectifierDynamoWatts:9,baseSalvageAlloy:4,winchSalvageAlloy:7,salvageWinchWattCost:2,tuneSignalLockGain:35,tuneCipherWattCost:3,chapter2RequiredEvents:2,chapter3RequiredEvents:7,chapter3RequiredPoweredStations:2,endingARequiredPoweredStations:4,endingARequiredNetworkScore:3,endingAWattCost:25,endingACipherCost:4,endingBRequiredConvoyScore:3,endingBWattCost:25,endingBAlloyCost:12,endingBCipherCost:3},G={watts:{id:"watts",name:"Power (Watts)",shortName:"Watts",unit:"W",description:"Electrical charge stored in the vacuum-tube capacitor bank. Powers receiver tubes, signal decoding, and remote lighthouse beacons.",unlockReason:"Available from the start via the hand-cranked dynamo."},alloy:{id:"alloy",name:"Salvage Alloy",shortName:"Salvage Alloy",unit:"AL",description:"Weather-stripped naval brass and hull plating hauled up from the cliffside wreckage.",unlockReason:"Unlocked in Chapter 1 once the receiver lamp warms up and reveals structural damage to the rectifier & winch."},cipher:{id:"cipher",name:"Cipher Keys (Bandwidth)",shortName:"Cipher Keys",unit:"KEY",description:"Phase-locked harmonic key blocks synthesized from clean carrier waves to decrypt archipelago transmissions.",unlockReason:"Unlocked in Chapter 2 when encrypted archipelago relay traffic arrives."}},k={1:{id:1,title:"Chapter 1: Cold Receiver",subtitle:"A single match, a frozen hand-dynamo, and a scratching SOS.",openingLog:"Ice coats the inside of the lantern glass. The mainland cable is dead. Only the hand-dynamo beside the radio desk still turns.",transformationNote:"Completing your first structural repair brings the Frequency Oscilloscope online and illuminates the relay console."},2:{id:2,title:"Chapter 2: The Archipelago Grid",subtitle:"Four dark stations across the storm-cut sea and four circuit rules.",openingLog:"The backplane relays clack into alignment. Across the black water, four coastal transponders answer your carrier wave.",transformationNote:"Unlocks the Archipelago Radar Map (4 Remote Stations), Safe Automation Rule Rack (4 Rules), and Cipher Keys."},3:{id:3,title:"Chapter 3: The Solstice Transmission",subtitle:"The eye of the gale arrives. Every watt commits the archipelago’s fate.",openingLog:"Barometric pressure plunges. You can either lock all four relays into a permanent autonomous mesh or burn the coastal grid to guide Convoy Meridian past the reef.",transformationNote:"Unlocks Final Convergence protocols for Ending A (The Archival Beacon) and Ending B (The Exodus Convoy)."}},O={repair_rectifier:{id:"repair_rectifier",name:"Overhaul Rectifier Tube Bank",cost:{watts:6,alloy:5},summary:"Boosts Hand-Dynamo output (5W -> 9W) and expands Capacitor Bank (+40 Max Watts).",effectDescription:"Replaces cracked mercury-vapor rectifiers, stabilizing high-voltage storage and bringing the Frequency Oscilloscope online."},repair_winch:{id:"repair_winch",name:"Unjam Cliffside Salvage Winch",cost:{watts:6,alloy:5},summary:"Boosts Salvage Winch haul (4 -> 7 Alloy) and expands Alloy Locker (+30 Max Alloy).",effectDescription:"Clears frozen cable drums on the sea cliff, accelerating hull salvage recovery and bringing the Frequency Oscilloscope online."}},C={north_reef:{id:"north_reef",name:"North Reef Lighthouse",sector:"Sector N-01 (Shoal Point)",coordinates:{x:28,y:24},activationCost:{watts:10,alloy:6},wattUpkeepPerCycle:2,passiveYieldPerCycle:{alloy:1},description:"Automated basalt tower guarding the northern razor-shoals. Guides salvage drones along the tide line.",tradeoffNote:"Drains 2W/cycle, but generates +1 Alloy/cycle and enables the Hull Salvage Drone automation rule."},sunken_dredge:{id:"sunken_dredge",name:"Sunken Dredge Platform",sector:"Sector W-04 (Silt Trench)",coordinates:{x:20,y:68},activationCost:{watts:12,alloy:8},wattUpkeepPerCycle:3,passiveYieldPerCycle:{alloy:3},description:"Half-submerged industrial sea-floor excavator still hooked into the relay power cable.",tradeoffNote:"Heavy 3W/cycle draw, but supplies +3 Salvage Alloy/cycle for major structural fabrication."},weather_buoy:{id:"weather_buoy",name:"Weather Buoy K-9",sector:"Sector E-07 (Deep Gale)",coordinates:{x:76,y:30},activationCost:{watts:12,alloy:6,cipher:1},wattUpkeepPerCycle:2,passiveYieldPerCycle:{cipher:1},description:"High-frequency barometric and ionospheric reference transponder anchored beyond the shelf.",tradeoffNote:"Drains 2W/cycle, but synthesizes +1 Cipher Key/cycle from clean atmospheric telemetry."},convoy_meridian:{id:"convoy_meridian",name:"Offshore Convoy Meridian",sector:"Sector S-12 (Razorback Channel)",coordinates:{x:78,y:74},activationCost:{watts:14,alloy:8,cipher:1},wattUpkeepPerCycle:3,passiveYieldPerCycle:{watts:5},description:"Six ice-coated civilian transport vessels holding position outside the lethal southern reef.",tradeoffNote:"Requires 3W/cycle carrier lock, but backfeeds +5W/cycle from shipboard diesel generators (net +2W/cycle)."}},R={auto_crank:{id:"auto_crank",name:"Auto-Crank Regulator",unlockChapter:2,unlockCost:{watts:8,alloy:6},conditionType:"watts_pct_below",thresholdPct:40,inputs:{alloy:1},outputs:{watts:6},conditionSummary:"WHEN Power < 40%",inputSummary:"CONSUME 1 Salvage Alloy",outputSummary:"PRODUCE +6 Watts/cycle",description:"Converts 1 Salvage Alloy -> +6 Watts/cycle when Power < 40%. Prevents low-power stalls at the cost of steady alloy burn."},signal_scrubber:{id:"signal_scrubber",name:"Signal Scrubber",unlockChapter:2,unlockCost:{watts:10,alloy:6},conditionType:"watts_pct_at_least",thresholdPct:50,inputs:{watts:4},outputs:{cipher:1},conditionSummary:"WHEN Power >= 50%",inputSummary:"CONSUME 4 Watts",outputSummary:"PRODUCE +1 Cipher Key/cycle",description:"Automatically decodes Tier-1 telemetry into +1 Cipher Key (consumes 4W) when Power >= 50%."},hull_salvage_drone:{id:"hull_salvage_drone",name:"Hull Salvage Drone",unlockChapter:2,unlockCost:{watts:10,alloy:8},conditionType:"station_powered",requiredStationId:"north_reef",inputs:{watts:2},outputs:{alloy:2},conditionSummary:"WHEN North Reef Lighthouse is Powered",inputSummary:"CONSUME 2 Watts",outputSummary:"PRODUCE +2 Salvage Alloy/cycle",description:"Gathers +2 Salvage Alloy/cycle (consumes 2W) when North Reef Lighthouse is powered."},emergency_load_shedder:{id:"emergency_load_shedder",name:"Emergency Load Shedder",unlockChapter:2,unlockCost:{watts:8,alloy:5,cipher:1},conditionType:"watts_pct_below",thresholdPct:20,inputs:{},outputs:{watts:5,throttleNonCriticalStations:!0},conditionSummary:"WHEN Power < 20%",inputSummary:"THROTTLE non-critical station beacons",outputSummary:"RECOVER +5 Watts & prevent receiver brownout",description:"Automatically throttles non-critical station beacons if Power drops below 20% to prevent receiver brownout."}},A=[{id:"sig_01_reef_sos",oneTimeFlag:"evt_flag_01_reef_sos",chapter:1,sequenceNumber:1,title:"Distress Fragment: North Reef Watch",sender:"Keeper Vance (North Reef)",frequencyMHz:"118.4 MHz",morsePreview:"... --- ... / .-. . . ..-.",corruptedBody:"[STATIC] ...Ember Point, do you read? Sea wall breached... auxiliary battery at 4%... need carrier lock or we lose the northern shoal...",decodedBody:'"Ember Point Relay, this is Keeper Vance at North Reef! Waves took our lower generator room. Either feed us a stabilizing carrier pulse so our shoal beacon holds, or tell us to abandon the tower and float our spare copper coils down-current to your cove."',prerequisites:{receiverWarmed:!0},decodeCost:{watts:4},choices:[{id:"stabilize_reef_carrier",label:"Feed Stabilizing Carrier Pulse (-4W)",description:"Hold North Reef’s transponder lock and recover +4 Salvage Alloy washed into the lit cove (+1 Network Integrity).",costs:{watts:4},rewards:{alloy:4},networkIntegrityDelta:1,convoyReadinessDelta:0,outcomeLog:"North Reef locks onto your carrier wave. Vance guides a crate of naval brass (+4 Alloy) into your cove."},{id:"strip_reef_coils",label:"Order Tower Strip & Float Coils (-2W)",description:"Have Vance jettison heavy salvage coils down-current (+7 Salvage Alloy, +1 Convoy Readiness).",costs:{watts:2},rewards:{alloy:7},networkIntegrityDelta:0,convoyReadinessDelta:1,outcomeLog:"Vance strips the secondary coils before evacuating to the cliff shelter. +7 Salvage Alloy hauled ashore."}]},{id:"sig_02_dredge_beacon",oneTimeFlag:"evt_flag_02_dredge_beacon",chapter:1,sequenceNumber:2,title:"Sub-Surface Ping: Dredge Platform 04",sender:"Auto-Telemetry DREDGE-04",frequencyMHz:"121.0 MHz",morsePreview:"-.. .-. . -.. --. . / ----- ....-",corruptedBody:"[HUM] ...automated hopper full... pressure valve 04 stuck... awaiting relay command pulse...",decodedBody:'"DREDGE-04 STATUS: Bilge hoppers loaded with 14 tons of hull plate. Subsea cable continuity at 62%. Send calibration pulse to preserve long-term extraction, or blow ballast tanks for an immediate surface dump."',prerequisites:{receiverWarmed:!0,minCompletedRepairs:1,requiredEventIds:["sig_01_reef_sos"]},decodeCost:{watts:5},choices:[{id:"calibrate_dredge_cable",label:"Calibrate Subsea Relay Cable (-5W)",description:"Preserve Dredge-04 telemetry and winch +6 Salvage Alloy (+1 Network Integrity).",costs:{watts:5},rewards:{alloy:6},networkIntegrityDelta:1,convoyReadinessDelta:0,outcomeLog:"Subsea telemetry stabilized. Dredge-04 transfers +6 Salvage Alloy along the trench line."},{id:"blow_dredge_ballast",label:"Trigger Emergency Ballast Blow (-3 Alloy)",description:"Sacrifice 3 Alloy in rigging to recover high-charge thermal cells (+12 Watts, +1 Convoy Readiness).",costs:{alloy:3},rewards:{watts:12},networkIntegrityDelta:0,convoyReadinessDelta:1,outcomeLog:"Thermal battery canisters breach the surf. Capacitor bank surges by +12 Watts."}]},{id:"sig_03_harbor_charter",oneTimeFlag:"evt_flag_03_harbor_charter",chapter:1,sequenceNumber:3,title:"Harbor Master’s Solstice Directive",sender:"Port Authority Archive",frequencyMHz:"124.6 MHz",morsePreview:"--. .-. .. -.. / --- .-. / ..-. .-.. . . -",corruptedBody:"[CARRIER LOCK] ...all island relays must choose protocol before midnight tide... grid backplane ready...",decodedBody:'"SOLSTICE DIRECTIVE: Mainland Ice Blockade confirmed. Ember Point Relay is now the sole master node. Re-seat the Archipelago Backplane to wake the four remote stations."',prerequisites:{receiverWarmed:!0,minCompletedRepairs:1,requiredEventIds:["sig_02_dredge_beacon"]},decodeCost:{watts:6},choices:[{id:"energize_grid_backplane",label:"Reinforce Archipelago Backplane (-4 Alloy)",description:"Install heavy busbars (+8 Watts, +2 Cipher Keys, +1 Network Integrity).",costs:{alloy:4},rewards:{watts:8,cipher:2},networkIntegrityDelta:1,convoyReadinessDelta:0,outcomeLog:"Backplane busbars locked! Four coastal station transponders appear on the Archipelago Radar."},{id:"prime_coastal_searchlight",label:"Prime Coastal Searchlight Bus (-6W)",description:"Wire the high-output sea-lane bus (+6 Salvage Alloy, +2 Cipher Keys, +1 Convoy Readiness).",costs:{watts:6},rewards:{alloy:6,cipher:2},networkIntegrityDelta:0,convoyReadinessDelta:1,outcomeLog:"Searchlight bus primed! The radar scope sweeps across four remote archipelago stations."}]},{id:"sig_04_north_reef_keeper",oneTimeFlag:"evt_flag_04_north_reef_keeper",chapter:2,sequenceNumber:4,title:"North Reef: Rime Ice on the Fresnel Drum",sender:"Keeper Vance",frequencyMHz:"128.2 MHz",morsePreview:".. -.-. . / --- -. / .-.. . -. ...",corruptedBody:"[ENCRYPTED TIER-1] ...salt ice freezing rotation gears... need de-icing load or prism removal...",decodedBody:'"Ember Point, three inches of black rime ice are seizing North Reef’s rotary lens! Route de-icing power and replacement brackets to keep the northern node alive, or let me dismantle the copper prism frame for fleet repairs."',prerequisites:{minChapter:2},decodeCost:{watts:6},choices:[{id:"deice_north_reef",label:"Route De-Icing Load (-6W, -3 Alloy)",description:"Melts the lens ice, grants +2 Cipher Keys, and brings North Reef Lighthouse online (+1 Network Integrity).",costs:{watts:6,alloy:3},rewards:{cipher:2},networkIntegrityDelta:1,convoyReadinessDelta:0,powerStationId:"north_reef",outcomeLog:"Heating coils glow cherry-red at North Reef. The northern lighthouse beam slices through the snow!"},{id:"salvage_reef_prism",label:"Dismantle Prism Frame (-4W)",description:"Strip the brass lens housing for immediate +8 Salvage Alloy and +1 Cipher Key (+1 Convoy Readiness).",costs:{watts:4},rewards:{alloy:8,cipher:1},networkIntegrityDelta:0,convoyReadinessDelta:1,outcomeLog:"North Reef’s secondary prism frame is Barged to Ember Point (+8 Salvage Alloy, +1 Cipher Key)."}]},{id:"sig_05_dredge_overload",oneTimeFlag:"evt_flag_05_dredge_overload",chapter:2,sequenceNumber:5,title:"Sunken Dredge: Trench Turbine Surge",sender:"DREDGE-04 Control",frequencyMHz:"131.5 MHz",morsePreview:"- ..- .-. -... .. -. . / ... ..- .-. --. .",corruptedBody:"[CIPHER BLOCK] ...tidal current driving trench turbine past 140% RPM... governor clamp failing...",decodedBody:'"WARNING: Undertow in the Silt Trench is spinning Dredge-04’s hydro-turbine past redline. Spend Salvage Alloy to brace the governor for clean power + cipher sync, or let it run hot to rip a massive alloy cache from the seabed."',prerequisites:{minChapter:2,requiredEventIds:["sig_04_north_reef_keeper"]},decodeCost:{watts:6,cipher:1},choices:[{id:"brace_dredge_governor",label:"Brace Hydro-Governor (-5 Alloy)",description:"Captures +12 Watts and +2 Cipher Keys while reinforcing the subsea grid (+1 Network Integrity).",costs:{alloy:5},rewards:{watts:12,cipher:2},networkIntegrityDelta:1,convoyReadinessDelta:0,outcomeLog:"Hydro-governor clamped! Clean tidal current surges into Ember Point (+12 Watts, +2 Cipher Keys)."},{id:"overdrive_dredge_claw",label:"Overdrive Excavator Claw (-6W)",description:"Extracts +10 Salvage Alloy and +1 Cipher Key before the clutch slips (+1 Convoy Readiness).",costs:{watts:6},rewards:{alloy:10,cipher:1},networkIntegrityDelta:0,convoyReadinessDelta:1,outcomeLog:"Excavator claw hauls up a massive naval bulkhead (+10 Salvage Alloy, +1 Cipher Key)."}]},{id:"sig_06_buoy_k9_drift",oneTimeFlag:"evt_flag_06_buoy_k9_drift",chapter:2,sequenceNumber:6,title:"Weather Buoy K-9: Mooring Chain Parted",sender:"Telemetry Buoy K-9",frequencyMHz:"134.8 MHz",morsePreview:"-.- ----. / -.. .-. .. ..-. -",corruptedBody:"[CIPHER BLOCK] ...sea anchor dragging toward eastern shelf... harmonic reference drifting...",decodedBody:'"BUOY K-9 ALERT: Primary sea-anchor parted in 40-foot swells. Dispatch a grapple-drone with Salvage Alloy to re-anchor K-9 at its triangulation coordinate, or tow it south to mark the reef passage for Convoy Meridian."',prerequisites:{minChapter:2,requiredEventIds:["sig_05_dredge_overload"]},decodeCost:{watts:7,cipher:1},choices:[{id:"reanchor_buoy_k9",label:"Re-Anchor Triangulation Coordinate (-5 Alloy)",description:"Locks K-9 in Sector E-07, yielding +3 Cipher Keys and +6 Watts (+1 Network Integrity).",costs:{alloy:5},rewards:{watts:6,cipher:3},networkIntegrityDelta:1,convoyReadinessDelta:0,outcomeLog:"Grapple-chain locked into the eastern basalt shelf. K-9 delivers +3 Cipher Keys."},{id:"drift_buoy_to_channel",label:"Drift K-9 into Razorback Channel (-5W)",description:"Marks the convoy lane and yields +6 Salvage Alloy & +2 Cipher Keys (+1 Convoy Readiness).",costs:{watts:5},rewards:{alloy:6,cipher:2},networkIntegrityDelta:0,convoyReadinessDelta:1,outcomeLog:"Buoy K-9 Rides the rip current into Razorback Channel, illuminating the shoal markers."}]},{id:"sig_07_meridian_hail",oneTimeFlag:"evt_flag_07_meridian_hail",chapter:2,sequenceNumber:7,title:"Convoy Meridian: Hull Breach on Transport Three",sender:"Captain Solis (MV Meridian)",frequencyMHz:"137.4 MHz",morsePreview:"-- . .-. .. -.. .. .- -.",corruptedBody:"[URGENT CIPHER] ...six ships holding off Razorback Reef... ice pack crushing Transport Three...",decodedBody:'"Ember Point, this is Captain Solis aboard flagship Meridian! We have 410 civilians across six ice-crusted hulls. Transport Three’s bilge pumps are failing—either ration balanced relay support or dump your main capacitor bank to run our arc-welders!"',prerequisites:{minChapter:2,requiredEventIds:["sig_06_buoy_k9_drift"]},decodeCost:{watts:8,cipher:1},choices:[{id:"ration_balanced_aid",label:"Ration Balanced Relay Aid (-4 Alloy)",description:"Preserves grid reserves while sending patch plates (+8 Watts, +2 Cipher Keys, +1 Network Integrity).",costs:{alloy:4},rewards:{watts:8,cipher:2},networkIntegrityDelta:1,convoyReadinessDelta:0,outcomeLog:"Meridian patches Transport Three and links its radio array into the archipelago repeater."},{id:"dump_capacitor_for_welders",label:"Dump Capacitor for Arc-Welders (-8W, -5 Alloy)",description:"Full emergency weld package (+3 Cipher Keys, +12 Watts backfeed, +2 Convoy Readiness).",costs:{watts:8,alloy:5},rewards:{watts:12,cipher:3},networkIntegrityDelta:0,convoyReadinessDelta:2,outcomeLog:"Arc-welders seal Transport Three’s hull! Captain Solis aligns Meridian’s engines for the channel run."}]},{id:"sig_08_mainland_silence",oneTimeFlag:"evt_flag_08_mainland_silence",chapter:2,sequenceNumber:8,title:"Mainland Admiralty: Scuttle & Blackout Order",sender:"Admiralty High Command",frequencyMHz:"139.9 MHz",morsePreview:"-... .-.. .- -.-. -.- --- ..- -",corruptedBody:"[HIGH CIPHER] ...weather front permanent... wipe regional cipher tables and shut down coastal beacons...",decodedBody:'"DIRECTIVE 99-OMEGA: All outer island stations are declared unrecoverable until spring thaw. Erase local encryption keys immediately. — Keeper, if we obey, the islands go deaf; if we override the directive, we seize full control of the Solstice spectrum."',prerequisites:{minChapter:2,requiredEventIds:["sig_07_meridian_hail"]},decodeCost:{watts:8,cipher:2},choices:[{id:"assert_island_sovereignty",label:"Assert Archipelago Mesh Sovereignty (-6W)",description:"Fork the Admiralty cipher root (+4 Cipher Keys, +6 Salvage Alloy, +2 Network Integrity).",costs:{watts:6},rewards:{alloy:6,cipher:4},networkIntegrityDelta:2,convoyReadinessDelta:0,outcomeLog:"You lock out the mainland kill-switch. The Archipelago Mesh now answers only to Ember Point!"},{id:"crack_admiralty_depot",label:"Crack Admiralty Naval Depot Locks (-1 Cipher)",description:"Seize emergency fleet stores (+10 Salvage Alloy, +10 Watts, +2 Convoy Readiness).",costs:{cipher:1},rewards:{watts:10,alloy:10},networkIntegrityDelta:0,convoyReadinessDelta:2,outcomeLog:"Depot bunkers Pop open along the breakwater! +10 Alloy and +10 Watts routed to evacuation reserves."}]},{id:"sig_09_solstice_squall",oneTimeFlag:"evt_flag_09_solstice_squall",chapter:3,sequenceNumber:9,title:"Eye of the Solstice: 110-Knot Hurricane Wall",sender:"Ember Point Barograph",frequencyMHz:"141.2 MHz",morsePreview:"... --- .-.. ... - .. -.-. .",corruptedBody:"[EXTREME INTERFERENCE] ...barometer 942 mbar... tower guy-wires screaming... sea wall overtopped...",decodedBody:'"SOLSTICE WALL IMPACT: 110-knot gusts are hammering all four sectors. Reinforce every coastal relay mast with Salvage Alloy so the four-station grid survives the night, or focus all power into the southern breakwater radar corridor."',prerequisites:{minChapter:3},decodeCost:{watts:8,cipher:1},choices:[{id:"guywire_all_towers",label:"Guy-Wire All Four Relay Masts (-6 Alloy)",description:"Protects the entire network (+12 Watts, +2 Cipher Keys, +2 Network Integrity).",costs:{alloy:6},rewards:{watts:12,cipher:2},networkIntegrityDelta:2,convoyReadinessDelta:0,outcomeLog:"Steel guy-wires hold fast across all four sectors! Harmonic resonance generates +12W and +2 Cipher Keys."},{id:"focus_southern_radar",label:"Overcharge Southern Radar Corridor (-8W)",description:"Maps every submerged rock in Razorback Channel (+8 Salvage Alloy, +2 Cipher Keys, +2 Convoy Readiness).",costs:{watts:8},rewards:{alloy:8,cipher:2},networkIntegrityDelta:0,convoyReadinessDelta:2,outcomeLog:"High-power radar cuts through the blinding spray, charting a clean evacuation lane."}]},{id:"sig_10_reef_harmonic",oneTimeFlag:"evt_flag_10_reef_harmonic",chapter:3,sequenceNumber:10,title:"Ionospheric Mirror: 142.8 MHz Standing Wave",sender:"Weather Buoy K-9 / Ionosonde",frequencyMHz:"142.8 MHz",morsePreview:".--. .... .- ... . / .-.. --- -.-.",corruptedBody:"[AURORAL BOUNCE] ...rare solstice ionospheric ducting detected... 400-mile range window open...",decodedBody:'"IONOSPHERIC WINDOW: Auroral compression has created a standing wave duct over the archipelago. Phase-lock the duct to permanently synchronize the four-island autonomous grid, or bounce a high-power sonar-radio guide beam ahead of Convoy Meridian."',prerequisites:{minChapter:3,requiredEventIds:["sig_09_solstice_squall"]},decodeCost:{watts:8,cipher:2},choices:[{id:"lock_ionospheric_mesh",label:"Phase-Lock Autonomous Mesh (-6W)",description:"Synthesizes +4 Cipher Keys and +6 Salvage Alloy (+2 Network Integrity).",costs:{watts:6},rewards:{alloy:6,cipher:4},networkIntegrityDelta:2,convoyReadinessDelta:0,outcomeLog:"Standing wave locked! All island repeaters hum in a single self-healing harmonic chord."},{id:"project_convoy_guide_beam",label:"Project Convoy Guide Beam (-4 Alloy)",description:"Generates +12 Watts and +3 Cipher Keys for fleet navigation (+2 Convoy Readiness).",costs:{alloy:4},rewards:{watts:12,cipher:3},networkIntegrityDelta:0,convoyReadinessDelta:2,outcomeLog:"Auroral guide beam illuminates the open ocean beyond the reef (+12 Watts, +3 Cipher Keys)."}]},{id:"sig_11_mutiny_on_meridian",oneTimeFlag:"evt_flag_11_mutiny_on_meridian",chapter:3,sequenceNumber:11,title:"Convoy Meridian: The Pilots’ Ultimatum",sender:"Captain Solis & Harbor Pilots",frequencyMHz:"144.0 MHz",morsePreview:"-.. . -.-. .. -.. . / -. --- .--",corruptedBody:"[CRITICAL TRAFFIC] ...tide crests in twenty minutes... either hold station as Node 4 or run the reef now...",decodedBody:'"Ember Point, the slack-water window is here! Half my captains want to anchor inside the leeward bay as the fourth permanent generator node for your Archipelago Mesh. The rest want you to burn your inland relays into a blinding searchlight corridor so we can break out to the southern mainland tonight. Give the order!"',prerequisites:{minChapter:3,requiredEventIds:["sig_10_reef_harmonic"]},decodeCost:{watts:10,cipher:2},choices:[{id:"anchor_meridian_as_node_4",label:"Order Meridian to Anchor in Leeward Grid (-6W)",description:"Integrates Meridian into the 4-station mesh (+8 Salvage Alloy, +3 Cipher Keys, +2 Network Integrity).",costs:{watts:6},rewards:{alloy:8,cipher:3},networkIntegrityDelta:2,convoyReadinessDelta:0,powerStationId:"convoy_meridian",outcomeLog:"Meridian drops anchor in the sheltered cove and couples its diesel turbines to the Archipelago Grid!"},{id:"clear_meridian_for_breakout",label:"Order Full Fleet Breakout Run (-6 Alloy)",description:"Diverts all coastal reserves to the sea lane (+16 Watts, +3 Cipher Keys, +2 Convoy Readiness).",costs:{alloy:6},rewards:{watts:16,cipher:3},networkIntegrityDelta:0,convoyReadinessDelta:2,outcomeLog:"Six ship horns thunder across the surf as Convoy Meridian forms line-astern for the breakout run!"}]},{id:"sig_12_final_convergence",oneTimeFlag:"evt_flag_12_final_convergence",chapter:3,sequenceNumber:12,title:"Solstice Apex: The Ember Point Convergence",sender:"Ember Point Master Console",frequencyMHz:"146.5 MHz",morsePreview:"... --- .-.. ... - .. -.-. . / .- .--. . -..-",corruptedBody:"[FINAL PROTOCOL READY] ...capacitor bank at peak resonance... select terminal transmission mode...",decodedBody:'"MASTER CONSOLE READY: All 12 Solstice transmissions processed. You now have the bandwidth and charge to execute either final convergence protocol: lock the four-station Archival Beacon for permanent island sovereignty, or fire the Exodus Convoy Overdrive to shepherd the fleet to open sea."',prerequisites:{minChapter:3,requiredEventIds:["sig_11_mutiny_on_meridian"]},decodeCost:{watts:8,cipher:1},choices:[{id:"charge_archival_protocol",label:"Charge Archival Mesh Bus (+14W, +4 Cipher)",description:"Prepares the 4-station Archival Beacon for Ending A (+2 Network Integrity).",costs:{},rewards:{watts:14,alloy:6,cipher:4},networkIntegrityDelta:2,convoyReadinessDelta:0,outcomeLog:"Archival Mesh Bus charged to 100%. Ready to lock Ending A: The Archival Beacon."},{id:"charge_exodus_protocol",label:"Charge Exodus Searchlight Bus (+14W, +10 Alloy)",description:"Prepares the Fresnel Overdrive for Ending B (+2 Convoy Readiness).",costs:{},rewards:{watts:14,alloy:10,cipher:3},networkIntegrityDelta:0,convoyReadinessDelta:2,outcomeLog:"Exodus Searchlight Bus charged to 100%. Ready to fire Ending B: The Exodus Convoy."}]}],y={ending_a_archival_beacon:{id:"ending_a_archival_beacon",title:"Ending A: The Archival Beacon (Network Sovereignty)",subtitle:"All four archipelago relays lock into a self-sustaining harmonic grid.",summary:"By synchronizing North Reef, Sunken Dredge, Weather Buoy K-9, and Leeward Meridian, Ember Point becomes the heart of an unbreakable island commonwealth.",epilogue:"Through the deepest freeze of the Solstice blockade, the four beacons pulse in unison across the dark water. Weather telemetry, dredge salvage, and harbor traffic flow without mainland oversight. When spring finally thaws the strait, the archipelago answers on its own frequency.",requirementDescription:"Requires Chapter 3, all 4 Remote Stations powered, Network Integrity >= 3, 25 Watts, and 4 Cipher Keys."},ending_b_exodus_convoy:{id:"ending_b_exodus_convoy",title:"Ending B: The Exodus Convoy (Fleet Evacuation)",subtitle:"The lighthouse arc burns white-hot, guiding all six ships safely past Razorback Reef.",summary:"You sacrifice the inland repeater coils and channel every last watt and alloy plate into a blinding sea-lane corridor for Convoy Meridian.",epilogue:'One by one, the inland relay tubes shatter as you push the Fresnel arc to 300% capacity. Through the boiling surf of Razorback Channel, Captain Solis steers all six vessels along your razor-thin beam of light. At dawn, the last radio message reaches your cooling receiver from open water: "All hands clear of the shoals. Thank you, Ember Point."',requirementDescription:"Requires Chapter 3, Convoy Readiness >= 3, 25 Watts, 12 Salvage Alloy, and 3 Cipher Keys."}};class H{state;constructor(e){this.state=e>>>0||1}next(){let e=this.state+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}nextInt(e,r){const o=r-e+1;return e+Math.floor(this.next()*o)}getState(){return this.state>>>0}setState(e){this.state=e>>>0||1}}function I(t=30307){const e=new H(t),r=e.nextInt(15,85),o={seed:t,rngState:e.getState(),cycle:0,chapter:1,resources:{watts:n.initialWatts,alloy:n.initialAlloy,cipher:n.initialCipher},maxResources:{watts:n.initialMaxWatts,alloy:n.initialMaxAlloy,cipher:n.initialMaxCipher},unlockedResources:{watts:!0,alloy:!1,cipher:!1},capabilities:{receiverWarmed:!1,oscilloscopeUnlocked:!1,radarUnlocked:!1,automationUnlocked:!1,convergenceUnlocked:!1},repairs:{repair_rectifier:!1,repair_winch:!1},stations:{north_reef:{id:"north_reef",unlocked:!1,activated:!1,powered:!1,throttledByShedder:!1},sunken_dredge:{id:"sunken_dredge",unlocked:!1,activated:!1,powered:!1,throttledByShedder:!1},weather_buoy:{id:"weather_buoy",unlocked:!1,activated:!1,powered:!1,throttledByShedder:!1},convoy_meridian:{id:"convoy_meridian",unlocked:!1,activated:!1,powered:!1,throttledByShedder:!1}},automationRules:{auto_crank:{id:"auto_crank",unlocked:!1,enabled:!1,lastTriggeredCycle:null,lastStatus:"Locked (Unlocks in Chapter 2)"},signal_scrubber:{id:"signal_scrubber",unlocked:!1,enabled:!1,lastTriggeredCycle:null,lastStatus:"Locked (Unlocks in Chapter 2)"},hull_salvage_drone:{id:"hull_salvage_drone",unlocked:!1,enabled:!1,lastTriggeredCycle:null,lastStatus:"Locked (Unlocks in Chapter 2)"},emergency_load_shedder:{id:"emergency_load_shedder",unlocked:!1,enabled:!1,lastTriggeredCycle:null,lastStatus:"Locked (Unlocks in Chapter 2)"}},lastCycleRuleResults:[],signalLock:25,harmonicPhase:r,decodedEvents:[],completedEvents:[],eventLog:[],networkIntegrity:0,convoyReadiness:0,brownoutCount:0,endingReached:null,logs:[],nextLogId:1};return u(o,"chapter",`${k[1].title} — ${k[1].openingLog}`),o}function u(t,e,r){t.logs.unshift({id:t.nextLogId++,cycle:t.cycle,category:e,text:r}),t.logs.length>60&&(t.logs.length=60)}function f(t){["watts","alloy","cipher"].forEach(e=>{const r=t.maxResources[e],o=t.resources[e];t.resources[e]=Math.max(0,Math.min(r,Math.round(o)))})}function g(t,e){return!(e.watts&&t.resources.watts<e.watts||e.alloy&&t.resources.alloy<e.alloy||e.cipher&&t.resources.cipher<e.cipher)}function b(t,e){e.watts&&(t.resources.watts-=e.watts),e.alloy&&(t.resources.alloy-=e.alloy),e.cipher&&(t.resources.cipher-=e.cipher),f(t)}function T(t,e){e.watts&&(t.resources.watts+=e.watts),e.alloy&&(t.unlockedResources.alloy=!0,t.resources.alloy+=e.alloy),e.cipher&&(t.unlockedResources.cipher=!0,t.resources.cipher+=e.cipher),f(t)}function E(t){return Object.values(t.repairs).filter(Boolean).length}function M(t){return Object.values(t.stations).filter(e=>e.powered).length}function U(t,e){if(t.completedEvents.includes(e.id)||t.eventLog.some(o=>o.eventId===e.id||o.oneTimeFlag===e.oneTimeFlag))return!1;const r=e.prerequisites;if(r.receiverWarmed&&!t.capabilities.receiverWarmed||r.minCompletedRepairs!==void 0&&E(t)<r.minCompletedRepairs||r.minChapter!==void 0&&t.chapter<r.minChapter)return!1;if(r.requiredEventIds){for(const o of r.requiredEventIds)if(!t.completedEvents.includes(o))return!1}return!0}function j(t){return A.filter(e=>U(t,e))}function _(t){if(t.chapter===1){const e=E(t),r=t.completedEvents.includes("sig_03_harbor_charter")||e>=1&&t.completedEvents.length>=n.chapter2RequiredEvents&&t.capabilities.oscilloscopeUnlocked;e>=1&&r&&(t.chapter=2,t.unlockedResources.alloy=!0,t.unlockedResources.cipher=!0,t.capabilities.radarUnlocked=!0,t.capabilities.automationUnlocked=!0,t.maxResources.watts+=n.chapter2BonusMaxWatts,Object.keys(t.stations).forEach(o=>{t.stations[o].unlocked=!0}),Object.keys(t.automationRules).forEach(o=>{t.automationRules[o].unlocked||(t.automationRules[o].lastStatus="Ready to fabricate in Rule Rack")}),u(t,"chapter",`${k[2].title} — ${k[2].openingLog}`))}if(t.chapter===2){const e=M(t);(t.completedEvents.includes("sig_08_mainland_silence")||t.completedEvents.length>=n.chapter3RequiredEvents&&e>=n.chapter3RequiredPoweredStations)&&(t.chapter=3,t.capabilities.convergenceUnlocked=!0,u(t,"chapter",`${k[3].title} — ${k[3].openingLog}`))}}function P(t){if(t.endingReached)return{ok:!1,reason:"Transmission convergence already completed."};const e=t.repairs.repair_rectifier?n.rectifierDynamoWatts:n.baseDynamoWatts;return t.resources.watts+=e,f(t),!t.capabilities.receiverWarmed&&t.resources.watts>=n.receiverWarmupWatts?(t.capabilities.receiverWarmed=!0,t.unlockedResources.alloy=!0,t.resources.alloy+=n.initialScrapDiscoveryAlloy,f(t),u(t,"signal",`Pilot lamp ignited! The vacuum tubes warm up, revealing a distress carrier on 118.4 MHz and +${n.initialScrapDiscoveryAlloy} Salvage Alloy beside the cracked rectifier housing.`),{ok:!0,reason:`Cranked Dynamo (+${e}W). Receiver warmed up & Salvage Alloy unlocked!`}):(u(t,"system",`Hand-Dynamo cranked: +${e} Watts (${t.resources.watts}/${t.maxResources.watts}W).`),{ok:!0,reason:`Generated +${e} Watts.`})}function z(t){if(t.endingReached)return{ok:!1,reason:"Transmission convergence already completed."};if(!t.unlockedResources.alloy)return{ok:!1,reason:"Warm up the receiver lamp first to inspect cliffside salvage."};const e=t.repairs.repair_winch?n.winchSalvageAlloy:n.baseSalvageAlloy;if(t.resources.watts>=n.salvageWinchWattCost)return t.resources.watts-=n.salvageWinchWattCost,t.resources.alloy+=e,f(t),u(t,"system",`Powered winch haul (-${n.salvageWinchWattCost}W): recovered +${e} Salvage Alloy.`),{ok:!0,reason:`Winch hauled +${e} Salvage Alloy (-${n.salvageWinchWattCost}W).`};{const r=Math.max(2,Math.floor(e/2));return t.resources.alloy+=r,f(t),u(t,"system",`Manual cliffside salvage haul: recovered +${r} Salvage Alloy.`),{ok:!0,reason:`Manually hauled +${r} Salvage Alloy.`}}}function N(t){if(t.endingReached)return{ok:!1,reason:"Transmission convergence already completed."};if(!t.capabilities.receiverWarmed)return{ok:!1,reason:"Warm up the receiver first."};const e=new H(t.rngState);return t.harmonicPhase=(t.harmonicPhase+e.nextInt(17,33))%100,t.rngState=e.getState(),t.signalLock=Math.min(100,t.signalLock+n.tuneSignalLockGain),t.unlockedResources.cipher&&t.resources.watts>=n.tuneCipherWattCost&&t.resources.cipher<t.maxResources.cipher?(t.resources.watts-=n.tuneCipherWattCost,t.resources.cipher+=1,f(t),u(t,"signal",`Harmonic carrier phase-locked (${t.signalLock}%): synthesized +1 Cipher Key (-${n.tuneCipherWattCost}W).`),{ok:!0,reason:`Signal lock ${t.signalLock}% & synthesized +1 Cipher Key.`}):(u(t,"signal",`Frequency dial aligned: Signal Lock at ${t.signalLock}%.`),{ok:!0,reason:`Signal Lock increased to ${t.signalLock}%.`})}function V(t,e){const r=O[e];if(!r)return{ok:!1,reason:"Unknown repair ID."};if(!t.capabilities.receiverWarmed)return{ok:!1,reason:"Receiver must be warmed up first."};if(t.repairs[e])return{ok:!1,reason:`${r.name} is already completed.`};if(!g(t,r.cost))return{ok:!1,reason:`Insufficient resources for ${r.name}.`};const o=E(t)===0;return b(t,r.cost),t.repairs[e]=!0,e==="repair_rectifier"?t.maxResources.watts+=n.rectifierBonusMaxWatts:e==="repair_winch"&&(t.maxResources.alloy+=n.winchBonusMaxAlloy),o?(t.capabilities.oscilloscopeUnlocked=!0,u(t,"chapter",`STATION TRANSFORMATION: ${r.name} complete! The Frequency Oscilloscope & Harmonic Decoder console comes online.`)):u(t,"system",`Completed structural upgrade: ${r.name}.`),_(t),{ok:!0,reason:`Completed ${r.name}.`}}function Y(t,e,r){const o=C[e],a=t.stations[e];if(!o||!a)return{ok:!1,reason:"Unknown station."};if(!a.unlocked)return{ok:!1,reason:`${o.name} is not yet on the radar grid.`};if(!a.activated)return r===!1?{ok:!1,reason:`${o.name} is already offline.`}:g(t,o.activationCost)?(b(t,o.activationCost),a.activated=!0,a.powered=!0,a.throttledByShedder=!1,u(t,"signal",`Remote Beacon Activated: ${o.name} is now online and linked to Ember Point!`),_(t),{ok:!0,reason:`Activated and powered ${o.name}.`}):{ok:!1,reason:`Insufficient resources to activate ${o.name}.`};const s=r!==void 0?r:!a.powered;return a.powered=s,s&&(a.throttledByShedder=!1),u(t,"system",`${o.name} beacon ${a.powered?"POWERED ON":"THROTTLED OFFLINE"}.`),_(t),{ok:!0,reason:`${o.name} is now ${a.powered?"powered":"offline"}.`}}function J(t,e){const r=R[e],o=t.automationRules[e];return!r||!o?{ok:!1,reason:"Unknown automation rule."}:t.chapter<r.unlockChapter?{ok:!1,reason:`${r.name} unlocks in Chapter ${r.unlockChapter}.`}:o.unlocked?{ok:!1,reason:`${r.name} is already unlocked.`}:g(t,r.unlockCost)?(b(t,r.unlockCost),o.unlocked=!0,o.enabled=!0,o.lastStatus="Armed (Awaiting next cycle check)",u(t,"automation",`Automation Rule Fabricated & Armed: ${r.name} (${r.conditionSummary} -> ${r.outputSummary}).`),{ok:!0,reason:`Unlocked and enabled ${r.name}.`}):{ok:!1,reason:`Insufficient resources to fabricate ${r.name}.`}}function X(t,e,r){const o=R[e],a=t.automationRules[e];return!o||!a?{ok:!1,reason:"Unknown automation rule."}:a.unlocked?(a.enabled=r!==void 0?r:!a.enabled,a.lastStatus=a.enabled?"Armed (Awaiting cycle)":"Disabled by operator",u(t,"automation",`${o.name} ${a.enabled?"ENABLED":"DISABLED"}.`),{ok:!0,reason:`${o.name} ${a.enabled?"enabled":"disabled"}.`}):{ok:!1,reason:`Unlock ${o.name} first.`}}function Z(t){const e=[],r=["auto_crank","signal_scrubber","hull_salvage_drone","emergency_load_shedder"];for(const o of r){const a=R[o],s=t.automationRules[o];if(!s.unlocked||!s.enabled){e.push({ruleId:o,triggered:!1,reason:s.unlocked?"Rule disabled":"Rule locked",conditionSummary:a.conditionSummary,inputSummary:a.inputSummary,outputSummary:a.outputSummary});continue}const p=t.maxResources.watts>0?t.resources.watts/t.maxResources.watts*100:0;let l=!1;if(a.conditionType==="watts_pct_below")l=p<(a.thresholdPct??0);else if(a.conditionType==="watts_pct_at_least")l=p>=(a.thresholdPct??100);else if(a.conditionType==="station_powered"){const m=a.requiredStationId;l=m?t.stations[m].powered:!1}if(!l){const m=`Standby: Condition (${a.conditionSummary}) not met.`;s.lastStatus=m,e.push({ruleId:o,triggered:!1,reason:m,conditionSummary:a.conditionSummary,inputSummary:a.inputSummary,outputSummary:a.outputSummary});continue}if(!g(t,a.inputs)){const m=`Blocked: Insufficient input (${a.inputSummary}).`;s.lastStatus=m,e.push({ruleId:o,triggered:!1,reason:m,conditionSummary:a.conditionSummary,inputSummary:a.inputSummary,outputSummary:a.outputSummary});continue}b(t,a.inputs),T(t,a.outputs),a.outputs.throttleNonCriticalStations&&["sunken_dredge","weather_buoy","convoy_meridian"].forEach(m=>{t.stations[m].powered&&(t.stations[m].powered=!1,t.stations[m].throttledByShedder=!0)}),s.lastTriggeredCycle=t.cycle;const v=`Fired on Cycle ${t.cycle}: ${a.conditionSummary} -> ${a.outputSummary}.`;s.lastStatus=v,u(t,"automation",`[${a.name}] ${v}`),e.push({ruleId:o,triggered:!0,reason:v,conditionSummary:a.conditionSummary,inputSummary:a.inputSummary,outputSummary:a.outputSummary})}return t.lastCycleRuleResults=e,e}function q(t){if(t.endingReached)return{ok:!1,reason:"Transmission convergence already completed."};t.cycle+=1,E(t)>=1&&(t.resources.watts+=2,f(t)),Z(t);let e=0;const r=Object.keys(t.stations).filter(o=>t.stations[o].powered);for(const o of r)e+=C[o].wattUpkeepPerCycle;if(e>0)if(t.resources.watts>=e){t.resources.watts-=e;for(const o of r)T(t,C[o].passiveYieldPerCycle);f(t)}else{const o=t.automationRules.emergency_load_shedder;if(o.unlocked&&o.enabled)["sunken_dredge","weather_buoy","convoy_meridian"].forEach(a=>{t.stations[a].powered&&(t.stations[a].powered=!1,t.stations[a].throttledByShedder=!0)}),t.resources.watts=Math.min(t.maxResources.watts,t.resources.watts+5),o.lastTriggeredCycle=t.cycle,o.lastStatus=`Prevented brownout on Cycle ${t.cycle}`,u(t,"automation","[Emergency Load Shedder] Throttled non-critical beacons to prevent Receiver Brownout (+5W reserve).");else{t.resources.watts=0,t.brownoutCount+=1,t.signalLock=Math.max(10,t.signalLock-30);for(const a of r)t.stations[a].powered=!1;u(t,"warning","RECEIVER BROWNOUT! Beacon load exceeded capacitor reserves. Remote stations tripped offline.")}}return _(t),{ok:!0,reason:`Advanced to Cycle ${t.cycle}.`}}function Q(t,e){const r=A.find(o=>o.id===e);return r?t.completedEvents.includes(e)||t.eventLog.some(o=>o.eventId===e||o.oneTimeFlag===r.oneTimeFlag)?{ok:!1,reason:"Signal already resolved (recorded in persistent eventLog)."}:t.decodedEvents.includes(e)?{ok:!1,reason:"Signal is already decoded."}:U(t,r)?g(t,r.decodeCost)?(b(t,r.decodeCost),t.decodedEvents.push(e),u(t,"signal",`Decoded transmission [${r.frequencyMHz}]: "${r.title}"`),{ok:!0,reason:`Decoded ${r.title}.`}):{ok:!1,reason:"Insufficient resources to decode this transmission."}:{ok:!1,reason:"Signal prerequisites are not yet met."}:{ok:!1,reason:"Unknown signal event ID."}}function ee(t,e,r){const o=A.find(s=>s.id===e);if(!o)return{ok:!1,reason:"Unknown signal event ID."};if(t.completedEvents.includes(e)||t.eventLog.some(s=>s.eventId===e||s.oneTimeFlag===o.oneTimeFlag))return{ok:!1,reason:"Duplicate reward blocked: Event one-time flag already recorded in eventLog."};if(!t.decodedEvents.includes(e))return{ok:!1,reason:"Decode the transmission before transmitting a response."};const a=o.choices.find(s=>s.id===r);if(!a)return{ok:!1,reason:"Invalid choice ID for this signal."};if(!g(t,a.costs))return{ok:!1,reason:"Insufficient resources to execute this transmission choice."};if(b(t,a.costs),T(t,a.rewards),t.networkIntegrity+=a.networkIntegrityDelta,t.convoyReadiness+=a.convoyReadinessDelta,a.powerStationId){const s=t.stations[a.powerStationId];s&&(s.unlocked=!0,s.activated=!0,s.powered=!0,s.throttledByShedder=!1)}return t.completedEvents.push(e),t.eventLog.push({eventId:o.id,oneTimeFlag:o.oneTimeFlag,choiceId:a.id,cycle:t.cycle,outcomeLog:a.outcomeLog}),u(t,"signal",a.outcomeLog),_(t),{ok:!0,reason:a.outcomeLog}}function W(t,e){if(t.endingReached)return{ok:!1,reason:"An ending has already been reached."};if(t.chapter<3)return{ok:!1,reason:"Reach Chapter 3 first."};if(e==="ending_a_archival_beacon"){const r=M(t);return r<n.endingARequiredPoweredStations?{ok:!1,reason:`Requires all 4 remote stations powered (${r}/4 active).`}:t.networkIntegrity<n.endingARequiredNetworkScore?{ok:!1,reason:`Requires Network Integrity >= ${n.endingARequiredNetworkScore} (currently ${t.networkIntegrity}).`}:g(t,{watts:n.endingAWattCost,cipher:n.endingACipherCost})?{ok:!0,reason:"Ready to lock The Archival Beacon."}:{ok:!1,reason:`Requires ${n.endingAWattCost}W and ${n.endingACipherCost} Cipher Keys.`}}return e==="ending_b_exodus_convoy"?t.convoyReadiness<n.endingBRequiredConvoyScore?{ok:!1,reason:`Requires Convoy Readiness >= ${n.endingBRequiredConvoyScore} (currently ${t.convoyReadiness}).`}:g(t,{watts:n.endingBWattCost,alloy:n.endingBAlloyCost,cipher:n.endingBCipherCost})?{ok:!0,reason:"Ready to fire The Exodus Convoy beam."}:{ok:!1,reason:`Requires ${n.endingBWattCost}W, ${n.endingBAlloyCost} Salvage Alloy, and ${n.endingBCipherCost} Cipher Keys.`}:{ok:!1,reason:"Unknown ending ID."}}function te(t,e){const r=W(t,e);if(!r.ok)return r;e==="ending_a_archival_beacon"?b(t,{watts:n.endingAWattCost,cipher:n.endingACipherCost}):(b(t,{watts:n.endingBWattCost,alloy:n.endingBAlloyCost,cipher:n.endingBCipherCost}),["north_reef","sunken_dredge","weather_buoy"].forEach(a=>{t.stations[a].powered=!1})),t.endingReached=e;const o=y[e];return u(t,"chapter",`CONVERGENCE COMPLETE — ${o.title}: ${o.epilogue}`),{ok:!0,reason:o.title}}function me(t){if(!t||typeof t!="object")return!1;const e=t;return!(typeof e.seed!="number"||typeof e.cycle!="number"||e.chapter!==1&&e.chapter!==2&&e.chapter!==3||!e.resources||typeof e.resources.watts!="number"||!e.unlockedResources||typeof e.unlockedResources.watts!="boolean"||!e.capabilities||typeof e.capabilities.receiverWarmed!="boolean"||!Array.isArray(e.completedEvents)||!Array.isArray(e.eventLog))}function re(t){const e={version:1,savedAt:new Date().toISOString(),state:structuredClone(t)};return JSON.stringify(e)}function oe(t){try{const e=JSON.parse(t);if(!e||e.version!==1||!e.state||!me(e.state))return null;const r=structuredClone(e.state);for(const o of r.eventLog)r.completedEvents.includes(o.eventId)||r.completedEvents.push(o.eventId);return f(r),r}catch{return null}}function w(t,e=x){try{return typeof window>"u"||!window.localStorage?!1:(window.localStorage.setItem(e,re(t)),!0)}catch{return!1}}function ae(t=x){try{if(typeof window>"u"||!window.localStorage)return null;const e=window.localStorage.getItem(t);return e?oe(e):null}catch{return null}}function ne(t=x){try{if(typeof window>"u"||!window.localStorage)return;window.localStorage.removeItem(t)}catch{}}function ie(t=30307,e=x){const r=ae(e);return r||I(t)}class ge{ctx=null;muted=!1;ensureContext(){if(this.muted||typeof window>"u")return null;const e=window.AudioContext||window.webkitAudioContext;if(!e)return null;if(!this.ctx)try{this.ctx=new e}catch{return null}return this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}setMuted(e){this.muted=e}isMuted(){return this.muted}playDynamoCrank(e){const r=this.ensureContext();if(!r)return;const o=r.currentTime,a=r.createOscillator(),s=r.createGain();a.type=e?"sawtooth":"triangle",a.frequency.setValueAtTime(e?110:75,o),a.frequency.exponentialRampToValueAtTime(e?220:145,o+.14),s.gain.setValueAtTime(.08,o),s.gain.exponentialRampToValueAtTime(.001,o+.16),a.connect(s),s.connect(r.destination),a.start(o),a.stop(o+.17)}playMorsePulse(){const e=this.ensureContext();if(!e)return;const r=e.currentTime;[0,.08,.16,.28].forEach((a,s)=>{const p=e.createOscillator(),l=e.createGain();p.type="sine",p.frequency.setValueAtTime(s===3?660:780,r+a),l.gain.setValueAtTime(.06,r+a),l.gain.exponentialRampToValueAtTime(.001,r+a+.055),p.connect(l),l.connect(e.destination),p.start(r+a),p.stop(r+a+.06)})}playRelayClunk(){const e=this.ensureContext();if(!e)return;const r=e.currentTime,o=e.createOscillator(),a=e.createGain();o.type="square",o.frequency.setValueAtTime(160,r),o.frequency.exponentialRampToValueAtTime(58,r+.09),a.gain.setValueAtTime(.09,r),a.gain.exponentialRampToValueAtTime(.001,r+.095),o.connect(a),a.connect(e.destination),o.start(r),o.stop(r+.1)}playChapterChord(){const e=this.ensureContext();if(!e)return;const r=e.currentTime;[220,277.18,329.63,440].forEach(a=>{const s=e.createOscillator(),p=e.createGain();s.type="sine",s.frequency.setValueAtTime(a,r),p.gain.setValueAtTime(.045,r),p.gain.exponentialRampToValueAtTime(8e-4,r+.65),s.connect(p),p.connect(e.destination),s.start(r),s.stop(r+.66)})}destroy(){this.ctx&&(this.ctx.close().catch(()=>{}),this.ctx=null)}}function $(t){const e=[];return t.watts&&e.push(`${t.watts}W`),t.alloy&&e.push(`${t.alloy} Alloy`),t.cipher&&e.push(`${t.cipher} Cipher`),e.length>0?e.join(" + "):"Free"}class se{container;state;audio;debugOpen;statusBannerText="";rafId=null;wavePhase=0;boundKeyDown;constructor(e,r,o){this.container=e,this.state=r,this.audio=new ge,this.debugOpen=!!o?.debug,this.boundKeyDown=a=>this.handleKeyDown(a),window.addEventListener("keydown",this.boundKeyDown),this.injectStyles(),this.render(),this.startOscilloscopeLoop()}getState(){return this.state}setState(e){this.state=e,w(this.state),this.render()}restartWithSeed(e){ne(),this.state=I(e),w(this.state),this.statusBannerText=`Restarted Ember Point Relay with seed ${e}.`,this.render()}toggleDebug(e){this.debugOpen=e!==void 0?e:!this.debugOpen,this.render()}destroy(){window.removeEventListener("keydown",this.boundKeyDown),this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.audio.destroy(),this.container.innerHTML=""}handleKeyDown(e){const r=e.target?.tagName;r==="INPUT"||r==="TEXTAREA"||r==="SELECT"||(e.key==="d"||e.key==="D"?(e.preventDefault(),this.toggleDebug()):e.key==="c"||e.key==="C"?(e.preventDefault(),this.handleAction(()=>P(this.state),"crank")):(e.key==="s"||e.key==="S")&&this.state.unlockedResources.alloy?(e.preventDefault(),this.handleAction(()=>z(this.state),"relay")):(e.key==="t"||e.key==="T")&&this.state.capabilities.oscilloscopeUnlocked?(e.preventDefault(),this.handleAction(()=>N(this.state),"morse")):(e.key==="n"||e.key==="N")&&this.state.capabilities.receiverWarmed&&(e.preventDefault(),this.handleAction(()=>q(this.state),"relay")))}handleAction(e,r){const o=this.state.chapter,a=this.state.capabilities.oscilloscopeUnlocked,s=e();this.statusBannerText=s.reason,s.ok&&(this.state.chapter>o||!a&&this.state.capabilities.oscilloscopeUnlocked||this.state.endingReached?this.audio.playChapterChord():r==="crank"?this.audio.playDynamoCrank(this.state.capabilities.receiverWarmed):r==="morse"?this.audio.playMorsePulse():r==="relay"&&this.audio.playRelayClunk(),w(this.state)),this.render()}startOscilloscopeLoop(){if(typeof window>"u")return;const e=()=>{this.wavePhase+=.07,this.drawOscilloscope(),this.rafId=requestAnimationFrame(e)};this.rafId=requestAnimationFrame(e)}drawOscilloscope(){const e=this.container.querySelector("#ember-oscilloscope-canvas");if(!e)return;const r=e.getContext("2d");if(!r)return;const o=e.width,a=e.height;r.fillStyle="#090d12",r.fillRect(0,0,o,a),r.strokeStyle="rgba(245, 158, 11, 0.12)",r.lineWidth=1;for(let l=0;l<o;l+=32)r.beginPath(),r.moveTo(l,0),r.lineTo(l,a),r.stroke();for(let l=0;l<a;l+=24)r.beginPath(),r.moveTo(0,l),r.lineTo(o,l),r.stroke();const s=this.state.signalLock/100,p=(1-s)*14;r.strokeStyle=this.state.endingReached?"#38bdf8":"#f59e0b",r.lineWidth=2,r.beginPath();for(let l=0;l<o;l++){const v=l*.045+this.wavePhase,m=Math.sin(v)*20+Math.sin(v*2.3+this.state.harmonicPhase*.1)*(8*(1-s*.6)),B=Math.sin(l*.7+this.wavePhase*3.1)*p*.6,D=a/2+m+B;l===0?r.moveTo(l,D):r.lineTo(l,D)}r.stroke()}injectStyles(){if(document.getElementById("ember-relay-styles"))return;const e=document.createElement("style");e.id="ember-relay-styles",e.textContent=`
      .ember-root {
        container-type: inline-size;
        container-name: emberrelay;
        background: radial-gradient(circle at 50% 0%, #17202a 0%, #090c10 75%);
        color: #e2e8f0;
        font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        min-height: 100dvh;
        padding: clamp(0.75rem, 2vw, 1.5rem);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .ember-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        border-bottom: 1px solid rgba(245, 158, 11, 0.3);
        padding-bottom: 0.75rem;
      }
      .ember-title {
        font-size: clamp(1.15rem, 1rem + 1.2vw, 1.65rem);
        font-weight: 700;
        color: #f59e0b;
        margin: 0;
        letter-spacing: 0.04em;
      }
      .ember-subtitle {
        font-size: 0.82rem;
        color: #94a3b8;
        margin: 0.2rem 0 0 0;
      }
      .ember-badge-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }
      .ember-badge {
        background: rgba(245, 158, 11, 0.14);
        border: 1px solid rgba(245, 158, 11, 0.4);
        color: #fcd34d;
        padding: 0.25rem 0.6rem;
        border-radius: 4px;
        font-size: 0.75rem;
      }
      .ember-resources {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 0.75rem;
      }
      .ember-res-card {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(148, 163, 184, 0.25);
        border-left: 3px solid #f59e0b;
        border-radius: 6px;
        padding: 0.65rem 0.85rem;
      }
      .ember-res-label {
        font-size: 0.75rem;
        color: #94a3b8;
        text-transform: uppercase;
      }
      .ember-res-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: #f8fafc;
        margin-top: 0.2rem;
      }
      .ember-meter {
        height: 6px;
        background: #1e293b;
        border-radius: 3px;
        overflow: hidden;
        margin-top: 0.4rem;
      }
      .ember-meter-fill {
        height: 100%;
        background: linear-gradient(90deg, #d97706, #fbbf24);
        transition: width 0.2s ease;
      }
      .ember-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      @container emberrelay (min-width: 760px) {
        .ember-grid {
          grid-template-columns: 1.05fr 1fr;
        }
      }
      .ember-panel {
        background: rgba(15, 23, 42, 0.78);
        border: 1px solid rgba(245, 158, 11, 0.24);
        border-radius: 8px;
        padding: 0.9rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .ember-panel-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: #fbbf24;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .ember-btn {
        background: rgba(245, 158, 11, 0.16);
        border: 1px solid #f59e0b;
        color: #fef3c7;
        padding: 0.6rem 0.9rem;
        border-radius: 6px;
        font-family: inherit;
        font-size: 0.84rem;
        font-weight: 600;
        cursor: pointer;
        text-align: left;
        transition: background 0.15s ease, transform 0.08s ease;
      }
      .ember-btn:hover:not(:disabled) {
        background: rgba(245, 158, 11, 0.3);
      }
      .ember-btn:active:not(:disabled) {
        transform: translateY(1px);
      }
      .ember-btn:disabled {
        opacity: 0.42;
        cursor: not-allowed;
        border-color: #475569;
        color: #94a3b8;
      }
      .ember-btn-primary {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.38), rgba(245, 158, 11, 0.2));
        border-width: 1.5px;
      }
      .ember-card {
        background: rgba(9, 13, 20, 0.75);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 6px;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }
      .ember-log-list {
        max-height: 210px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-size: 0.78rem;
      }
      .ember-log-item {
        padding: 0.35rem 0.5rem;
        border-left: 2px solid #64748b;
        background: rgba(2, 6, 23, 0.55);
      }
      .ember-log-item.cat-chapter { border-left-color: #f59e0b; color: #fde68a; }
      .ember-log-item.cat-signal { border-left-color: #38bdf8; color: #bae6fd; }
      .ember-log-item.cat-automation { border-left-color: #34d399; color: #a7f3d0; }
      .ember-log-item.cat-warning { border-left-color: #f87171; color: #fecaca; }
      .ember-banner {
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.35);
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        font-size: 0.82rem;
        color: #fde68a;
      }
    `,document.head.appendChild(e)}render(){const e=this.state,r=k[e.chapter],o=j(e),a=M(e),p=["watts","alloy","cipher"].filter(i=>e.unlockedResources[i]).map(i=>{const c=G[i],d=e.resources[i],h=e.maxResources[i],S=h>0?Math.min(100,Math.round(d/h*100)):0;return`
          <div class="ember-res-card" data-resource="${i}">
            <div class="ember-res-label">${c.name}</div>
            <div class="ember-res-value">${d} / ${h} <span style="font-size:0.8rem;color:#fbbf24;">${c.unit}</span></div>
            <div class="ember-meter"><div class="ember-meter-fill" style="width:${S}%"></div></div>
          </div>
        `}).join(""),l=e.repairs.repair_rectifier?n.rectifierDynamoWatts:n.baseDynamoWatts,v=e.repairs.repair_winch?n.winchSalvageAlloy:n.baseSalvageAlloy,m=e.capabilities.receiverWarmed?`
      <div class="ember-panel" id="ember-repairs-panel">
        <h2 class="ember-panel-title">
          <span>Station Structural Repairs</span>
          <span style="font-size:0.74rem;color:#94a3b8;">${E(e)}/2 Restored</span>
        </h2>
        ${e.capabilities.oscilloscopeUnlocked?"":'<div style="font-size:0.78rem;color:#fcd34d;">Complete either initial repair to bring the Frequency Oscilloscope & Harmonic Decoder online.</div>'}
        ${["repair_rectifier","repair_winch"].map(i=>{const c=O[i],d=e.repairs[i],h=g(e,c.cost);return`
              <div class="ember-card" data-repair="${i}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong style="color:#f8fafc;font-size:0.85rem;">${c.name}</strong>
                  <span class="ember-badge">${d?"ONLINE":$(c.cost)}</span>
                </div>
                <div style="font-size:0.77rem;color:#cbd5e1;">${c.summary}</div>
                ${d?"":`<button class="ember-btn" data-action="repair" data-repair-id="${i}" ${h?"":"disabled"}>
                        Execute Repair (${$(c.cost)})
                      </button>`}
              </div>
            `}).join("")}
      </div>
    `:"",B=e.capabilities.oscilloscopeUnlocked?`
      <div class="ember-card">
        <div style="display:flex;justify-content:space-between;font-size:0.76rem;color:#fcd34d;">
          <span>CARRIER HARMONIC OSCILLOSCOPE</span>
          <span>SIGNAL LOCK: ${e.signalLock}% | PHASE: ${e.harmonicPhase}°</span>
        </div>
        <canvas id="ember-oscilloscope-canvas" width="420" height="84" style="width:100%;height:84px;border-radius:4px;border:1px solid rgba(245,158,11,0.3);"></canvas>
      </div>
    `:"",D=e.capabilities.receiverWarmed?`
      <div class="ember-panel" id="ember-signals-panel">
        <h2 class="ember-panel-title">
          <span>Incoming Distress & Relay Signals</span>
          <span style="font-size:0.74rem;color:#38bdf8;">${e.completedEvents.length}/${A.length} Resolved</span>
        </h2>
        ${B}
        ${o.length===0?`<div class="ember-card" style="color:#94a3b8;font-size:0.8rem;">
                ${e.completedEvents.length>=A.length?"All 12 Solstice transmissions have been resolved. Proceed to Final Convergence.":"No active transmissions awaiting decode in this stage. Complete station repairs or advance chapter prerequisites."}
              </div>`:o.map(i=>{const c=e.decodedEvents.includes(i.id),d=g(e,i.decodeCost);return`
                    <div class="ember-card" data-event-id="${i.id}">
                      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
                        <strong style="color:#38bdf8;font-size:0.86rem;">[${i.frequencyMHz}] ${i.title}</strong>
                        <span class="ember-badge">${i.sender}</span>
                      </div>
                      <div style="font-size:0.73rem;color:#f59e0b;letter-spacing:0.08em;">MORSE: ${i.morsePreview}</div>
                      <div style="font-size:0.8rem;color:#e2e8f0;line-height:1.4;">
                        ${c?i.decodedBody:i.corruptedBody}
                      </div>
                      ${c?`<div style="display:flex;flex-direction:column;gap:0.45rem;margin-top:0.25rem;">
                              ${i.choices.map(h=>{const S=g(e,h.costs);return`
                                    <button class="ember-btn" data-action="resolve-event" data-event-id="${i.id}" data-choice-id="${h.id}" ${S?"":"disabled"}>
                                      <div><strong>${h.label}</strong></div>
                                      <div style="font-size:0.74rem;color:#cbd5e1;margin-top:0.15rem;">${h.description}</div>
                                    </button>
                                  `}).join("")}
                            </div>`:`<button class="ember-btn ember-btn-primary" data-action="decode-event" data-event-id="${i.id}" ${d?"":"disabled"}>
                              Decode Carrier Signal (${$(i.decodeCost)})
                            </button>`}
                    </div>
                  `}).join("")}
      </div>
    `:"",de=e.capabilities.radarUnlocked?`
      <div class="ember-panel" id="ember-radar-panel">
        <h2 class="ember-panel-title">
          <span>Archipelago Radar & Remote Stations</span>
          <span style="font-size:0.74rem;color:#34d399;">${a}/4 Beacons Powered</span>
        </h2>
        <svg viewBox="0 0 240 110" style="width:100%;max-height:130px;background:#06101a;border:1px solid rgba(56,189,248,0.28);border-radius:6px;" aria-label="Archipelago Radar Map">
          <circle cx="120" cy="55" r="46" fill="none" stroke="rgba(56,189,248,0.16)" stroke-dasharray="3 3"/>
          <circle cx="120" cy="55" r="24" fill="none" stroke="rgba(56,189,248,0.22)"/>
          <circle cx="120" cy="55" r="4" fill="#f59e0b"/>
          <text x="126" y="58" fill="#fde68a" font-size="6.5">EMBER POINT</text>
          ${Object.keys(C).map(i=>{const c=C[i],d=e.stations[i],h=Math.round(c.coordinates.x/100*220+10),S=Math.round(c.coordinates.y/100*90+10),L=d.powered?"#34d399":d.activated?"#f59e0b":"#64748b";return`
                <line x1="120" y1="55" x2="${h}" y2="${S}" stroke="${L}" stroke-width="${d.powered?"1.5":"0.7"}" stroke-dasharray="${d.powered?"none":"2 2"}"/>
                <circle cx="${h}" cy="${S}" r="${d.powered?4.5:3}" fill="${L}"/>
                <text x="${h+6}" y="${S+2}" fill="${L}" font-size="6">${c.name.split(" ")[0]}</text>
              `}).join("")}
        </svg>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:0.6rem;">
          ${Object.keys(C).map(i=>{const c=C[i],d=e.stations[i],h=g(e,c.activationCost);return`
                <div class="ember-card" data-station-id="${i}">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <strong style="font-size:0.82rem;color:#f8fafc;">${c.name}</strong>
                    <span class="ember-badge" style="color:${d.powered?"#34d399":"#94a3b8"};">
                      ${d.powered?"POWERED":d.activated?"STANDBY":"OFFLINE"}
                    </span>
                  </div>
                  <div style="font-size:0.73rem;color:#94a3b8;">${c.sector}</div>
                  <div style="font-size:0.75rem;color:#cbd5e1;">${c.tradeoffNote}</div>
                  ${d.activated?`<button class="ember-btn" data-action="toggle-station" data-station-id="${i}">
                          ${d.powered?"Throttle Beacon Offline (Save Upkeep)":"Power Beacon On"}
                        </button>`:`<button class="ember-btn" data-action="toggle-station" data-station-id="${i}" ${h?"":"disabled"}>
                          Activate Beacon (${$(c.activationCost)})
                        </button>`}
                </div>
              `}).join("")}
        </div>
      </div>
    `:"",ue=e.capabilities.automationUnlocked?`
      <div class="ember-panel" id="ember-automation-panel">
        <h2 class="ember-panel-title">
          <span>Safe Automation Rule Rack</span>
          <span style="font-size:0.74rem;color:#34d399;">Declarative Circuit Relays</span>
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.6rem;">
          ${Object.keys(R).map(i=>{const c=R[i],d=e.automationRules[i],h=g(e,c.unlockCost);return`
                <div class="ember-card" data-rule-id="${i}">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <strong style="font-size:0.83rem;color:#fde68a;">${c.name}</strong>
                    <span class="ember-badge">${d.unlocked?d.enabled?"ARMED":"DISABLED":"UNFABRICATED"}</span>
                  </div>
                  <div style="font-size:0.73rem;color:#38bdf8;">${c.conditionSummary}</div>
                  <div style="font-size:0.73rem;color:#cbd5e1;">${c.inputSummary} &rarr; ${c.outputSummary}</div>
                  <div style="font-size:0.72rem;color:#94a3b8;">Status: ${d.lastStatus}</div>
                  ${d.unlocked?`<button class="ember-btn" data-action="toggle-rule" data-rule-id="${i}">
                          ${d.enabled?"Disable Automation Rule":"Enable Automation Rule"}
                        </button>`:`<button class="ember-btn" data-action="unlock-rule" data-rule-id="${i}" ${h?"":"disabled"}>
                          Fabricate Rule (${$(c.unlockCost)})
                        </button>`}
                </div>
              `}).join("")}
        </div>
      </div>
    `:"",F=W(e,"ending_a_archival_beacon"),K=W(e,"ending_b_exodus_convoy"),he=e.capabilities.convergenceUnlocked||e.chapter===3||e.endingReached?`
      <div class="ember-panel" id="ember-convergence-panel" style="border-color:#38bdf8;">
        <h2 class="ember-panel-title" style="color:#38bdf8;">
          <span>Chapter 3: Solstice Convergence Protocols</span>
          <span style="font-size:0.74rem;">Network: ${e.networkIntegrity} | Convoy: ${e.convoyReadiness}</span>
        </h2>
        ${e.endingReached?`<div class="ember-card" style="border-color:#fbbf24;background:rgba(245,158,11,0.12);">
                <h3 style="margin:0;color:#fbbf24;font-size:1.05rem;">${y[e.endingReached].title}</h3>
                <div style="font-size:0.84rem;color:#fde68a;">${y[e.endingReached].subtitle}</div>
                <p style="font-size:0.82rem;color:#f8fafc;line-height:1.5;margin:0.4rem 0 0 0;">${y[e.endingReached].epilogue}</p>
              </div>`:`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:0.75rem;">
                <div class="ember-card" data-ending-id="ending_a_archival_beacon">
                  <strong style="color:#34d399;font-size:0.86rem;">${y.ending_a_archival_beacon.title}</strong>
                  <div style="font-size:0.76rem;color:#cbd5e1;">${y.ending_a_archival_beacon.summary}</div>
                  <div style="font-size:0.73rem;color:#94a3b8;">${y.ending_a_archival_beacon.requirementDescription}</div>
                  <div style="font-size:0.73rem;color:#fcd34d;">Status: ${F.reason}</div>
                  <button class="ember-btn ember-btn-primary" data-action="trigger-ending" data-ending-id="ending_a_archival_beacon" ${F.ok?"":"disabled"}>
                    Lock Archival Beacon (25W + 4 Cipher)
                  </button>
                </div>
                <div class="ember-card" data-ending-id="ending_b_exodus_convoy">
                  <strong style="color:#38bdf8;font-size:0.86rem;">${y.ending_b_exodus_convoy.title}</strong>
                  <div style="font-size:0.76rem;color:#cbd5e1;">${y.ending_b_exodus_convoy.summary}</div>
                  <div style="font-size:0.73rem;color:#94a3b8;">${y.ending_b_exodus_convoy.requirementDescription}</div>
                  <div style="font-size:0.73rem;color:#fcd34d;">Status: ${K.reason}</div>
                  <button class="ember-btn ember-btn-primary" data-action="trigger-ending" data-ending-id="ending_b_exodus_convoy" ${K.ok?"":"disabled"}>
                    Fire Exodus Convoy Beam (25W + 12 Alloy + 3 Cipher)
                  </button>
                </div>
              </div>`}
      </div>
    `:"",pe=this.debugOpen?`
      <div class="ember-panel" id="ember-debug-panel" style="border-color:#f43f5e;">
        <h2 class="ember-panel-title" style="color:#fb7185;">
          <span>Debug & Playtest Inspector [D]</span>
          <span>Seed: ${e.seed} | Brownouts: ${e.brownoutCount}</span>
        </h2>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
          <button class="ember-btn" data-action="debug-grant">+25 All Resources</button>
          <button class="ember-btn" data-action="debug-ch2">Unlock Chapter 2</button>
          <button class="ember-btn" data-action="debug-ch3">Unlock Chapter 3</button>
          <button class="ember-btn" data-action="debug-reset">Reset Clean Save</button>
        </div>
        <div style="font-size:0.74rem;color:#cbd5e1;">
          Completed Events (${e.completedEvents.length}): ${e.completedEvents.join(", ")||"None"}
        </div>
      </div>
    `:"";this.container.innerHTML=`
      <div class="ember-root">
        <header class="ember-header">
          <div>
            <h1 class="ember-title">THE LAST SIGNAL: EMBER RELAY</h1>
            <p class="ember-subtitle">${r.title} — ${r.subtitle}</p>
          </div>
          <div class="ember-badge-row">
            <span class="ember-badge">CYCLE ${e.cycle}</span>
            <span class="ember-badge">CHAPTER ${e.chapter} / 3</span>
            ${e.capabilities.radarUnlocked?`<span class="ember-badge">GRID: ${e.networkIntegrity} | FLEET: ${e.convoyReadiness}</span>`:""}
            <button class="ember-btn" style="padding:0.25rem 0.55rem;font-size:0.73rem;" data-action="toggle-mute">
              ${this.audio.isMuted()?"Audio: Muted":"Audio: On"}
            </button>
            <button class="ember-btn" style="padding:0.25rem 0.55rem;font-size:0.73rem;" data-action="toggle-debug">
              Debug [D]
            </button>
          </div>
        </header>

        ${this.statusBannerText?`<div class="ember-banner" role="status" aria-live="polite">${this.statusBannerText}</div>`:""}

        <section class="ember-resources" aria-label="Station Resource Telemetry">
          ${p}
        </section>

        <div class="ember-grid">
          <div style="display:flex;flex-direction:column;gap:1rem;">
            <section class="ember-panel" id="ember-controls-panel">
              <h2 class="ember-panel-title">
                <span>Ember Point Manual Operations</span>
                <span style="font-size:0.73rem;color:#94a3b8;">Zero-Idle Active Controls</span>
              </h2>
              <button class="ember-btn ember-btn-primary" id="btn-crank-dynamo" data-action="crank-dynamo" ${e.endingReached?"disabled":""}>
                <div><strong>Strike Match / Crank Dynamo (+${l} Watts)</strong></div>
                <div style="font-size:0.74rem;color:#cbd5e1;margin-top:0.15rem;">
                  ${e.capabilities.receiverWarmed?"Manually charge the station capacitor bank. Shortcut: [C]":`Turn the frozen hand-dynamo to reach ${n.receiverWarmupWatts}W and ignite the vacuum receiver lamp.`}
                </div>
              </button>

              ${e.unlockedResources.alloy?`<button class="ember-btn" id="btn-gather-salvage" data-action="gather-salvage" ${e.endingReached?"disabled":""}>
                      <div><strong>Haul Cliffside Salvage Winch (+${v} Alloy)</strong></div>
                      <div style="font-size:0.74rem;color:#cbd5e1;margin-top:0.15rem;">
                        Uses ${n.salvageWinchWattCost}W winch motor (or manual haul if <2W) to recover hull brass. Shortcut: [S]
                      </div>
                    </button>`:""}

              ${e.capabilities.oscilloscopeUnlocked?`<button class="ember-btn" id="btn-align-frequency" data-action="align-frequency" ${e.endingReached?"disabled":""}>
                      <div><strong>Align Frequency Harmonic (+${n.tuneSignalLockGain}% Lock${e.unlockedResources.cipher?" / +1 Cipher Key":""})</strong></div>
                      <div style="font-size:0.74rem;color:#cbd5e1;margin-top:0.15rem;">
                        ${e.unlockedResources.cipher?`Phase-locks carrier wave and synthesizes +1 Cipher Key (-${n.tuneCipherWattCost}W). Shortcut: [T]`:"Stabilizes oscilloscope waveform lock. Shortcut: [T]"}
                      </div>
                    </button>`:""}

              ${e.capabilities.receiverWarmed?`<button class="ember-btn" id="btn-step-cycle" data-action="step-cycle" ${e.endingReached?"disabled":""}>
                      <div><strong>Advance Relay Cycle (Run Beacons & Automation)</strong></div>
                      <div style="font-size:0.74rem;color:#cbd5e1;margin-top:0.15rem;">
                        Executes armed automation rules, station beacon yields, and generator trickle. Shortcut: [N]
                      </div>
                    </button>`:""}
            </section>

            ${m}
            ${ue}
          </div>

          <div style="display:flex;flex-direction:column;gap:1rem;">
            ${he}
            ${D}
            ${de}

            <section class="ember-panel" id="ember-log-panel">
              <h2 class="ember-panel-title">
                <span>Relay Watch Log</span>
                <span style="font-size:0.72rem;color:#94a3b8;">Persistent Event Audit</span>
              </h2>
              <div class="ember-log-list">
                ${e.logs.slice(0,14).map(i=>`
                  <div class="ember-log-item cat-${i.category}">
                    <span style="color:#64748b;">[C${i.cycle}]</span> ${i.text}
                  </div>
                `).join("")}
              </div>
            </section>
          </div>
        </div>

        ${pe}
      </div>
    `,this.bindEvents(),this.drawOscilloscope()}bindEvents(){this.container.querySelectorAll("button[data-action]").forEach(e=>{e.addEventListener("click",()=>{const r=e.dataset.action;if(r)if(r==="crank-dynamo")this.handleAction(()=>P(this.state),"crank");else if(r==="gather-salvage")this.handleAction(()=>z(this.state),"relay");else if(r==="align-frequency")this.handleAction(()=>N(this.state),"morse");else if(r==="step-cycle")this.handleAction(()=>q(this.state),"relay");else if(r==="repair"){const o=e.dataset.repairId;this.handleAction(()=>V(this.state,o),"chord")}else if(r==="decode-event"){const o=e.dataset.eventId??"";this.handleAction(()=>Q(this.state,o),"morse")}else if(r==="resolve-event"){const o=e.dataset.eventId??"",a=e.dataset.choiceId??"";this.handleAction(()=>ee(this.state,o,a),"morse")}else if(r==="toggle-station"){const o=e.dataset.stationId;this.handleAction(()=>Y(this.state,o),"relay")}else if(r==="unlock-rule"){const o=e.dataset.ruleId;this.handleAction(()=>J(this.state,o),"relay")}else if(r==="toggle-rule"){const o=e.dataset.ruleId;this.handleAction(()=>X(this.state,o),"relay")}else if(r==="trigger-ending"){const o=e.dataset.endingId;this.handleAction(()=>te(this.state,o),"chord")}else r==="toggle-mute"?(this.audio.setMuted(!this.audio.isMuted()),this.render()):r==="toggle-debug"?this.toggleDebug():r==="debug-grant"?(this.state.capabilities.receiverWarmed=!0,this.state.unlockedResources.alloy=!0,this.state.unlockedResources.cipher=!0,T(this.state,{watts:25,alloy:25,cipher:10}),w(this.state),this.render()):r==="debug-ch2"?(this.state.capabilities.receiverWarmed=!0,this.state.capabilities.oscilloscopeUnlocked=!0,this.state.repairs.repair_rectifier=!0,this.state.completedEvents.push("sig_01_reef_sos","sig_02_dredge_beacon","sig_03_harbor_charter"),_(this.state),w(this.state),this.render()):r==="debug-ch3"?(this.state.chapter=2,this.state.capabilities.receiverWarmed=!0,this.state.capabilities.oscilloscopeUnlocked=!0,this.state.capabilities.radarUnlocked=!0,this.state.capabilities.automationUnlocked=!0,this.state.unlockedResources.alloy=!0,this.state.unlockedResources.cipher=!0,this.state.completedEvents.push("sig_08_mainland_silence"),_(this.state),w(this.state),this.render()):r==="debug-reset"&&this.restartWithSeed(this.state.seed)})})}}const le={id:"03-the-last-signal",number:3,title:"The Last Signal: Ember Relay",subtitle:"Staged Discovery & Automation Narrative Incremental",genre:'Brief C ("The Last Signal") + Premise 2 ("Ember") — Narrative Incremental',primaryReference:"A Dark Room",supportingReference:"Universal Paperclips & Factorio Circuit Rules",oneSentenceLoop:"Crank the hand-dynamo, restore coastal relay hardware, configure safe declarative automation rules, and triage 12 Solstice distress transmissions across 4 archipelago stations.",shortGoal:"Warm the vacuum receiver, complete your first structural repair to bring the Frequency Oscilloscope online, and answer North Reef’s SOS.",longGoal:"Guide Ember Point Relay through all 3 Chapters to reach either Ending A (The Archival Beacon) or Ending B (The Exodus Convoy).",controlsSummary:"Mouse/Touch buttons or Keyboard: [C] Crank Dynamo, [S] Haul Salvage, [T] Tune Harmonic, [N] Step Cycle, [D] Debug Inspector",accentColor:"#f59e0b"};function ce(t,e){const r=e?.initialSeed!==void 0?I(e.initialSeed):ie(30307);w(r);const o=new se(t,r,{debug:e?.debug});return{destroy(){o.destroy()},getStateSnapshot(){return structuredClone(o.getState())},restartWithSeed(a){o.restartWithSeed(a)},toggleDebug(a){o.toggleDebug(a)}}}const ye={metadata:le,mountGame:ce},fe=Object.freeze(Object.defineProperty({__proto__:null,AUTOMATION_RULES:R,CHAPTERS:k,DEFAULT_SEED:30307,ENDINGS:y,EmberRelayUI:se,GAME_CONFIG:n,INITIAL_REPAIRS:O,MESSAGE_EVENTS:A,REMOTE_STATIONS:C,RESOURCES:G,SAVE_VERSION:1,STORAGE_KEY:x,SeededRng:H,addResources:T,alignFrequency:N,appendLog:u,canAfford:g,canTriggerEnding:W,clampResources:f,clearLocalStorageSave:ne,crankDynamo:P,createInitialState:I,decodeMessageEvent:Q,default:ye,deserializeState:oe,evaluateChapterProgression:_,executeAutomationRulesForCycle:Z,gatherSalvage:z,getAvailableMessageEvents:j,getCompletedRepairCount:E,getPoweredStationCount:M,isEventAvailable:U,loadFromLocalStorage:ae,loadOrInitializeState:ie,metadata:le,mountGame:ce,performInitialRepair:V,resolveMessageEventChoice:ee,saveToLocalStorage:w,serializeState:re,spendResources:b,stepCycle:q,toggleAutomationRule:X,toggleRemoteStation:Y,triggerEnding:te,unlockAutomationRule:J},Symbol.toStringTag,{value:"Module"}));export{fe as g,ce as m};
