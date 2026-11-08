const d={gameId:"04-junkyard-courier",saveStorageKey:"argon_game04_junkyard_courier_save_v1",saveVersion:1,defaultSeed:404,maxHoldSlots:8,baseMaxHull:40,baseMaxFuel:10,auxTankFuelBonus:4,startingCredits:60,startingFuelDrums:1,startingRepairKits:1,maxActiveContracts:2,offersPerPort:3,deliveriesToWin:3,fuelPerDrum:4,baseRepairAmount:10,bilgeRigRepairAmount:15,portFuelUnitCost:3,portHullPointCost:2,fuelDrumCost:14,fuelDrumResell:10,repairKitCost:16,repairKitResell:11,startNodeId:"node-01-anchorhead"},N={hauler:{id:"hauler",name:"Light High-Capacity Hauler",tagline:"Max cargo slots & extended internal fuel tank for multi-contract outer routes.",moduleIds:["mod-aux-tank","mod-gyro-cradle"],fuelDrums:1,repairKits:1,preferredStrategy:"Leaves 4 Hold Slots open for bulky/dual contracts (3+1 Slots). Takes longer low-hazard outer channels using +4 Aux Tank fuel."},armored_runner:{id:"armored_runner",name:"Armored Storm-Runner",tagline:"Heavy icebreaker prow & twin-prop outrigger to punch straight through hazardous shortcuts.",moduleIds:["mod-icebreaker-prow","mod-twin-prop","mod-bilge-rig"],fuelDrums:1,repairKits:1,preferredStrategy:"Commits 4 Hold Slots to armor & propulsion modules, leaving 2 Slots for single high-margin contracts across Scrap Reef & Riptide shortcuts."}},E=[{id:"mod-twin-prop",name:"Twin-Prop Outrigger",slotCost:1,creditCost:38,shortTag:"OUTRIGGER",description:"Negates Cross-Current Riptide extra fuel burn (+2 Fuel -> 0) and hull shear.",counteredHazards:["cross_current_riptide","rogue_wake"]},{id:"mod-icebreaker-prow",name:"Reinforced Icebreaker Prow",slotCost:2,creditCost:52,shortTag:"ARMOR PROW",description:"Negates Scrap Reef hull damage (-10 -> 0) and cuts Floating Minefield damage by 67%.",counteredHazards:["scrap_reef","floating_minefield"]},{id:"mod-gyro-cradle",name:"Gyro-Shock Cradle",slotCost:1,creditCost:40,shortTag:"GYRO CRADLE",description:"Protects Fragile cargo from Acid Squall & Rogue Wake shock penalties and reduces wave hull damage.",counteredHazards:["acid_squall","rogue_wake"]},{id:"mod-aux-tank",name:"Auxiliary Reserve Tank",slotCost:1,creditCost:36,shortTag:"AUX TANK",description:"Adds +4 Max Internal Fuel capacity (10 -> 14) for long low-hazard outer detours.",counteredHazards:["silt_fogbank"]},{id:"mod-salvage-winch",name:"Salvage Magnet Winch",slotCost:1,creditCost:42,shortTag:"MAG WINCH",description:"Dredges +12¢ to +18¢ bonus scrap credits whenever pressing through Scrap Reef, Minefield, or Silt Fogbank.",counteredHazards:["scrap_reef","floating_minefield","silt_fogbank"]},{id:"mod-bilge-rig",name:"Bilge Pump & Patch Rig",slotCost:1,creditCost:34,shortTag:"BILGE RIG",description:"Boosts every Repair Kit from +10 Hull to +15 Hull and reduces Acid Squall corrosion by 3 Hull.",counteredHazards:["acid_squall"]}],v={scrap_reef:{id:"scrap_reef",name:"Scrap Reef",severity:"HIGH",badgeColor:"#e05a47",shortCode:"REEF",description:"Jagged submerged rebar and collapsed gantry cranes just beneath the waterline.",consequenceSummary:"-10 Hull (0 Hull with Reinforced Icebreaker Prow) | Evade: +2 Fuel",counterModuleId:"mod-icebreaker-prow",baseHullDamage:10,baseExtraFuel:0,threatensFragileCargo:!0,isDebrisField:!0,choices:[{id:"press_on",label:"Crunch Through Reef",summary:"-10 Hull (0 with Icebreaker Prow). +14¢ scrap if Magnet Winch installed."},{id:"evade_burn",label:"Full-Throttle Channel Swing",summary:"+2 extra Fuel burn, 0 Hull damage, keeps Fragile cargo safe."},{id:"patch_brace",label:"Spend Repair Kit on Fenders",summary:"Consumes 1 Repair Kit to absorb impact (0 Hull damage, cargo safe)."}]},cross_current_riptide:{id:"cross_current_riptide",name:"Cross-Current Riptide",severity:"HIGH",badgeColor:"#d9822b",shortCode:"RIPTIDE",description:"Roaring tidal race pouring through breached industrial cofferdams.",consequenceSummary:"+2 Fuel & -4 Hull (0 penalty with Twin-Prop Outrigger)",counterModuleId:"mod-twin-prop",baseHullDamage:4,baseExtraFuel:2,threatensFragileCargo:!1,isDebrisField:!1,choices:[{id:"press_on",label:"Hold Heading Against Current",summary:"+2 extra Fuel & -4 Hull (0 extra Fuel & 0 Hull with Twin-Prop Outrigger)."},{id:"evade_burn",label:"High-RPM Ferry Glide",summary:"+1 extra Fuel burn, 0 Hull damage."},{id:"patch_brace",label:"Spend Repair Kit on Rudder Strut",summary:"Consumes 1 Repair Kit, 0 extra Fuel, 0 Hull damage."}]},acid_squall:{id:"acid_squall",name:"Acid Squall",severity:"MEDIUM",badgeColor:"#b8c93a",shortCode:"SQUALL",description:"Blistering sulfur rain and violent cross-chop rolling off the condenser stacks.",consequenceSummary:"-7 Hull & damages Fragile cargo (-16¢) unless Gyro-Shock Cradle installed",counterModuleId:"mod-gyro-cradle",baseHullDamage:7,baseExtraFuel:0,threatensFragileCargo:!0,isDebrisField:!1,choices:[{id:"press_on",label:"Weather the Squall",summary:"-7 Hull (-3 with Gyro Cradle/Bilge Rig). Fragile cargo loses 16¢ without Gyro Cradle."},{id:"evade_burn",label:"Outrun Squall Curtain",summary:"+2 extra Fuel burn, 0 Hull damage, Fragile cargo protected."},{id:"patch_brace",label:"Seal Hatches with Repair Kit",summary:"Consumes 1 Repair Kit, 0 Hull damage, Fragile cargo protected."}]},floating_minefield:{id:"floating_minefield",name:"Floating Minefield",severity:"HIGH",badgeColor:"#cf3c5c",shortCode:"MINES",description:"Drifting tethered sea-mines and tangled buoyancy chains in deep water.",consequenceSummary:"-12 Hull (-4 Hull with Icebreaker Prow) | +18¢ with Magnet Winch",counterModuleId:"mod-icebreaker-prow",baseHullDamage:12,baseExtraFuel:0,threatensFragileCargo:!0,isDebrisField:!0,choices:[{id:"press_on",label:"Thread the Mine Tethers",summary:"-12 Hull (-4 with Icebreaker Prow). +18¢ scrap if Magnet Winch installed."},{id:"evade_burn",label:"Sonar Slalom Burn",summary:"+2 extra Fuel burn, -2 Hull, Fragile cargo safe."},{id:"patch_brace",label:"Cut Cable & Patch Plating",summary:"Consumes 1 Repair Kit, 0 Hull damage, Fragile cargo safe."}]},silt_fogbank:{id:"silt_fogbank",name:"Silt Fogbank",severity:"LOW",badgeColor:"#5da7b8",shortCode:"FOG",description:"Dense yellow dredge-mist hiding shifting mudbanks along the outer perimeter.",consequenceSummary:"+1 Fuel drift & -3 Hull (0 Hull on Radar Burn)",counterModuleId:"mod-aux-tank",baseHullDamage:3,baseExtraFuel:1,threatensFragileCargo:!1,isDebrisField:!0,choices:[{id:"press_on",label:"Dead-Reckoning Crawl",summary:"+1 extra Fuel & -3 Hull. +12¢ flotsam if Magnet Winch installed."},{id:"evade_burn",label:"Radar Sweep & Trim",summary:"+1 extra Fuel burn, 0 Hull damage."},{id:"patch_brace",label:"Pole Off Mudbar with Kit",summary:"Consumes 1 Repair Kit, 0 extra Fuel, 0 Hull damage."}]},rogue_wake:{id:"rogue_wake",name:"Rogue Wake",severity:"LOW",badgeColor:"#4c91d1",shortCode:"WAKE",description:"Steep rolling displacement swells rebounding off sunken drydock walls.",consequenceSummary:"-5 Hull & jolts Fragile cargo (-12¢) unless Gyro-Shock Cradle installed",counterModuleId:"mod-gyro-cradle",baseHullDamage:5,baseExtraFuel:0,threatensFragileCargo:!0,isDebrisField:!1,choices:[{id:"press_on",label:"Punch Through the Crest",summary:"-5 Hull (-1 with Gyro Cradle or Twin-Prop). Protects Fragile cargo with Gyro Cradle."},{id:"evade_burn",label:"Quarter the Swell",summary:"+1 extra Fuel burn, 0 Hull damage, Fragile cargo safe."},{id:"patch_brace",label:"Shoring Struts (1 Repair Kit)",summary:"Consumes 1 Repair Kit, 0 Hull damage, Fragile cargo safe."}]}},x=[{id:"node-01-anchorhead",code:"N01",name:"Anchorhead Drydock",zone:"WEST_BAY",x:88,y:245,isPort:!0,flavor:"Main salvage guild slipway and diesel bunkering pier."},{id:"node-02-siltgate",code:"N02",name:"Siltgate Lock",zone:"NORTH_REACH",x:195,y:105,isPort:!0,flavor:"Flooded canal lock guarding the calm northern dredge channel."},{id:"node-03-slag-reef",code:"N03",name:"Slag-Toothed Narrows",zone:"CENTRAL_SPINE",x:245,y:248,isPort:!0,flavor:"Collapsed steelworks causeway offering a treacherous shortcut east."},{id:"node-04-brine-pumps",code:"N04",name:"Brine-Pump Station 4",zone:"SOUTH_SHOALS",x:205,y:390,isPort:!0,flavor:"Half-sunken desalination rig along the southern shoal loop."},{id:"node-05-cinder-wharf",code:"N05",name:"Cinder-Barge Wharf",zone:"NORTH_REACH",x:370,y:90,isPort:!0,flavor:"Floating coal-and-isotope transfer depot anchored to refinery pilings."},{id:"node-06-maelstrom-spillway",code:"N06",name:"Spillway Weir",zone:"CENTRAL_SPINE",x:400,y:245,isPort:!0,flavor:"High-velocity turbine sluice where four tidal channels collide."},{id:"node-07-rust-atoll",code:"N07",name:"Rust-Chain Atoll",zone:"SOUTH_SHOALS",x:385,y:395,isPort:!0,flavor:"Ring oflashed tanker hulls serving as a bustling scrap market."},{id:"node-08-sulfur-stacks",code:"N08",name:"Sulfur Condenser Stacks",zone:"NORTH_REACH",x:545,y:100,isPort:!0,flavor:"Smoking chemical distillation towers paying top credit for optics and valves."},{id:"node-09-mine-channel",code:"N09",name:"Chain-Boom Trench",zone:"CENTRAL_SPINE",x:555,y:250,isPort:!0,flavor:"Old naval cordon bristling with tethered mines and high-grade alloy scrap."},{id:"node-10-dredge-harbor",code:"N10",name:"Dredge-Bucket Harbor",zone:"SOUTH_SHOALS",x:560,y:395,isPort:!0,flavor:"Sheltered basin beneath a mammoth bucket-wheel excavator."},{id:"node-11-beacon-spindle",code:"N11",name:"Beacon Spindle Relay",zone:"EAST_TERMINUS",x:700,y:160,isPort:!0,flavor:"Radio telemetry spire guiding convoys around the eastern fogbanks."},{id:"node-12-iron-citadel",code:"N12",name:"Iron Foundry Citadel",zone:"EAST_TERMINUS",x:710,y:335,isPort:!0,flavor:"Offshore blast-furnace fortress that smelts heavy salvage for the archipelago."}],V=[{id:"edge-01-02",from:"node-01-anchorhead",to:"node-02-siltgate",baseFuelCost:2,defaultHazard:"silt_fogbank",channelType:"OUTER_SAFE"},{id:"edge-02-05",from:"node-02-siltgate",to:"node-05-cinder-wharf",baseFuelCost:2,defaultHazard:"silt_fogbank",channelType:"OUTER_SAFE"},{id:"edge-05-08",from:"node-05-cinder-wharf",to:"node-08-sulfur-stacks",baseFuelCost:2,defaultHazard:"rogue_wake",channelType:"OUTER_SAFE"},{id:"edge-08-11",from:"node-08-sulfur-stacks",to:"node-11-beacon-spindle",baseFuelCost:2,defaultHazard:"silt_fogbank",channelType:"OUTER_SAFE"},{id:"edge-01-04",from:"node-01-anchorhead",to:"node-04-brine-pumps",baseFuelCost:2,defaultHazard:"rogue_wake",channelType:"OUTER_SAFE"},{id:"edge-04-07",from:"node-04-brine-pumps",to:"node-07-rust-atoll",baseFuelCost:2,defaultHazard:"silt_fogbank",channelType:"OUTER_SAFE"},{id:"edge-07-10",from:"node-07-rust-atoll",to:"node-10-dredge-harbor",baseFuelCost:2,defaultHazard:"silt_fogbank",channelType:"OUTER_SAFE"},{id:"edge-10-12",from:"node-10-dredge-harbor",to:"node-12-iron-citadel",baseFuelCost:2,defaultHazard:"rogue_wake",channelType:"OUTER_SAFE"},{id:"edge-11-12",from:"node-11-beacon-spindle",to:"node-12-iron-citadel",baseFuelCost:2,defaultHazard:"silt_fogbank",channelType:"OUTER_SAFE"},{id:"edge-01-03",from:"node-01-anchorhead",to:"node-03-slag-reef",baseFuelCost:1,defaultHazard:"scrap_reef",channelType:"INNER_SHORTCUT"},{id:"edge-03-05",from:"node-03-slag-reef",to:"node-05-cinder-wharf",baseFuelCost:1,defaultHazard:"scrap_reef",channelType:"INNER_SHORTCUT"},{id:"edge-03-06",from:"node-03-slag-reef",to:"node-06-maelstrom-spillway",baseFuelCost:1,defaultHazard:"cross_current_riptide",channelType:"INNER_SHORTCUT"},{id:"edge-03-07",from:"node-03-slag-reef",to:"node-07-rust-atoll",baseFuelCost:1,defaultHazard:"scrap_reef",channelType:"INNER_SHORTCUT"},{id:"edge-06-08",from:"node-06-maelstrom-spillway",to:"node-08-sulfur-stacks",baseFuelCost:1,defaultHazard:"acid_squall",channelType:"INNER_SHORTCUT"},{id:"edge-06-09",from:"node-06-maelstrom-spillway",to:"node-09-mine-channel",baseFuelCost:1,defaultHazard:"floating_minefield",channelType:"INNER_SHORTCUT"},{id:"edge-06-10",from:"node-06-maelstrom-spillway",to:"node-10-dredge-harbor",baseFuelCost:1,defaultHazard:"cross_current_riptide",channelType:"INNER_SHORTCUT"},{id:"edge-09-11",from:"node-09-mine-channel",to:"node-11-beacon-spindle",baseFuelCost:1,defaultHazard:"scrap_reef",channelType:"INNER_SHORTCUT"},{id:"edge-09-12",from:"node-09-mine-channel",to:"node-12-iron-citadel",baseFuelCost:1,defaultHazard:"floating_minefield",channelType:"INNER_SHORTCUT"},{id:"edge-02-03",from:"node-02-siltgate",to:"node-03-slag-reef",baseFuelCost:2,defaultHazard:"rogue_wake",channelType:"CROSS_LINK"},{id:"edge-04-03",from:"node-04-brine-pumps",to:"node-03-slag-reef",baseFuelCost:2,defaultHazard:"rogue_wake",channelType:"CROSS_LINK"},{id:"edge-05-06",from:"node-05-cinder-wharf",to:"node-06-maelstrom-spillway",baseFuelCost:2,defaultHazard:"cross_current_riptide",channelType:"CROSS_LINK"},{id:"edge-06-07",from:"node-06-maelstrom-spillway",to:"node-07-rust-atoll",baseFuelCost:2,defaultHazard:"rogue_wake",channelType:"CROSS_LINK"},{id:"edge-08-09",from:"node-08-sulfur-stacks",to:"node-09-mine-channel",baseFuelCost:2,defaultHazard:"acid_squall",channelType:"CROSS_LINK"},{id:"edge-09-10",from:"node-09-mine-channel",to:"node-10-dredge-harbor",baseFuelCost:2,defaultHazard:"scrap_reef",channelType:"CROSS_LINK"}],W=[{id:"ctype-safe-ballast",categoryName:"Safe Modest Freight",cargoName:"Sealed Ballast Bearings",cargoSlots:1,basePayout:44,fragile:!1,bulky:!1,urgentMaxHops:null,description:"Compact waterproof crate of cast-iron bearings. Fits in a single Hold Slot and shrugs off spray."},{id:"ctype-fragile-isotopes",categoryName:"Fragile Isotope Consignment",cargoName:"Volatile Isotope Cores",cargoSlots:3,basePayout:96,fragile:!0,bulky:!0,urgentMaxHops:null,description:"Bulky 3-Slot lead-glass containment rack. Pays double, but shocks in Acid Squalls or Reefs without a Gyro-Shock Cradle."},{id:"ctype-bulky-turbine",categoryName:"Bulky Heavy Salvage",cargoName:"Submerged Turbine Rotor",cargoSlots:3,basePayout:88,fragile:!1,bulky:!0,urgentMaxHops:null,description:"Massive 3-Slot bronze rotor assembly. Crowds out modules and spare fuel drums, forcing strict hold budgeting."},{id:"ctype-precision-optics",categoryName:"Fragile Precision Optics",cargoName:"Sonar Gyro-Lens Array",cargoSlots:2,basePayout:74,fragile:!0,bulky:!1,urgentMaxHops:null,description:"Delicate 2-Slot quartz rangefinder mirrors. Vulnerable to Acid Squalls and Rogue Wakes unless cradled."},{id:"ctype-tide-express",categoryName:"Urgent Tide-Window Express",cargoName:"Lock-Gate Hydraulic Valves",cargoSlots:1,basePayout:64,fragile:!1,bulky:!1,urgentMaxHops:4,description:"Light 1-Slot priority parts with a +15¢ tide-window bonus if delivered within 4 hops."},{id:"ctype-corrosive-sludge",categoryName:"Fragile Chemical Freight",cargoName:"Pressurized Sulfur Slurry",cargoSlots:2,basePayout:70,fragile:!0,bulky:!1,urgentMaxHops:null,description:"Glass-lined carboys occupying 2 Slots. High industrial payout if kept dry and level."},{id:"ctype-salvage-plate",categoryName:"Standard Industrial Freight",cargoName:"Riveted Boiler Plating",cargoSlots:2,basePayout:58,fragile:!1,bulky:!1,urgentMaxHops:null,description:"Reliable 2-Slot stack of salvaged hull plates. Weatherproof and steady profit."},{id:"ctype-cryo-meds",categoryName:"Urgent Medical Relay",cargoName:"Cryo-Sealed Plasma Packs",cargoSlots:1,basePayout:54,fragile:!0,bulky:!1,urgentMaxHops:5,description:"Compact 1-Slot cold-chain canister for outlying rigs."}];function h(e){const t=x.find(r=>r.id===e);if(!t)throw new Error(`Unknown archipelago node: ${e}`);return t}function b(e){const t=E.find(r=>r.id===e);if(!t)throw new Error(`Unknown boat module: ${e}`);return t}class z{state;constructor(t){this.state=t>>>0||1}next(){let t=this.state+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}nextInt(t,r){return r<=t?t:t+Math.floor(this.next()*(r-t+1))}pick(t){if(t.length===0)throw new Error("Cannot pick from empty array");return t[this.nextInt(0,t.length-1)]}shuffle(t){const r=[...t];for(let a=r.length-1;a>0;a--){const o=this.nextInt(0,a),n=r[a];r[a]=r[o],r[o]=n}return r}getState(){return this.state>>>0}setState(t){this.state=t>>>0||1}}function M(e){const t=e.maxHoldSlots??d.maxHoldSlots,r=e.acceptedContracts.reduce((c,s)=>c+Math.max(0,s.cargoSlots),0),a=e.installedModules.reduce((c,s)=>c+b(s).slotCost,0),o=Math.max(0,e.fuelDrums),n=Math.max(0,e.repairKits),i=r+a+o+n;return{cargoSlots:r,moduleSlots:a,fuelDrumSlots:o,repairKitSlots:n,usedSlots:i,maxSlots:t,freeSlots:t-i}}function k(e){if(e.fuelDrums<0||e.repairKits<0){const r=M(e);return{valid:!1,usedSlots:r.usedSlots,maxSlots:r.maxSlots,breakdown:r,reason:"Supply counts cannot be negative."}}const t=M(e);return t.usedSlots>t.maxSlots?{valid:!1,usedSlots:t.usedSlots,maxSlots:t.maxSlots,breakdown:t,reason:`Hold capacity exceeded: requires ${t.usedSlots}/${t.maxSlots} Hold Slots (Cargo ${t.cargoSlots} + Modules ${t.moduleSlots} + Drums ${t.fuelDrumSlots} + Kits ${t.repairKitSlots}).`}:{valid:!0,usedSlots:t.usedSlots,maxSlots:t.maxSlots,breakdown:t}}function R(e){const t=e.contracts.filter(r=>r.status==="ACCEPTED");return k({installedModules:e.installedModules,acceptedContracts:t,fuelDrums:e.fuelDrums,repairKits:e.repairKits,maxHoldSlots:e.maxHoldSlots})}function P(e){const t=e.includes("mod-aux-tank");return d.baseMaxFuel+(t?d.auxTankFuelBonus:0)}function Y(e){const t=["silt_fogbank","rogue_wake"],r=["scrap_reef","cross_current_riptide","acid_squall","floating_minefield"];return V.map(a=>{let o=a.defaultHazard;return new Set(["edge-01-02","edge-02-05","edge-01-04","edge-04-07","edge-01-03","edge-03-05","edge-03-06","edge-03-07"]).has(a.id)||(a.channelType==="OUTER_SAFE"?o=e.pick(t):a.channelType==="INNER_SHORTCUT"&&e.next()>.65&&(o=e.pick(r))),{id:a.id,from:a.from,to:a.to,baseFuelCost:a.baseFuelCost,hazardId:o,channelType:a.channelType,timesTraversed:0,lastResolvedChoice:null}})}function I(e,t){return e.edges.filter(r=>r.from===t||r.to===t)}function O(e,t,r){return e.edges.find(a=>a.from===t&&a.to===r||a.from===r&&a.to===t)}function $(e,t){return e.from===t?e.to:e.from}function w(e,t,r,a,o=0){const n=W.find(i=>i.id===t);return{id:`contract-${e}`,templateId:n.id,categoryName:n.categoryName,cargoName:n.cargoName,originNodeId:r,destinationNodeId:a,cargoSlots:n.cargoSlots,basePayout:n.basePayout+o,accumulatedPenalty:0,fragile:n.fragile,bulky:n.bulky,urgentMaxHops:n.urgentMaxHops,hopsTaken:0,status:"OFFERED",paidOut:!1,description:n.description}}function J(e,t){const r=new Map;r.set(t,0);const a=[t];for(;a.length>0;){const o=a.shift(),n=r.get(o);for(const i of I(e,o)){const c=$(i,o);r.has(c)||(r.set(c,n+1),a.push(c))}}return r}function j(e){const t=e.contracts.filter(s=>s.status==="OFFERED"&&s.originNodeId===e.currentNodeId);if(t.length>=d.offersPerPort)return;const r=new z(e.rngState),a=J(e,e.currentNodeId),o=x.filter(s=>{const u=a.get(s.id)??0;return s.id!==e.currentNodeId&&u>=2&&u<=3}),n=x.filter(s=>s.id!==e.currentNodeId),i=o.length>0?o:n,c=d.offersPerPort-t.length;for(let s=0;s<c;s++){const u=t.length+s;let p;u===0?p="ctype-safe-ballast":u===1?p=r.pick(["ctype-fragile-isotopes","ctype-bulky-turbine"]):p=r.pick(["ctype-precision-optics","ctype-tide-express","ctype-corrosive-sludge","ctype-salvage-plate","ctype-cryo-meds"]);const l=r.pick(i),f=a.get(l.id)??2,g=Math.max(0,(f-2)*10),m=w(e.nextContractSeq++,p,e.currentNodeId,l.id,g);e.contracts.push(m)}e.rngState=r.getState()}function K(e=d.defaultSeed){const t=new z(e),r=Y(t),a=[w(1,"ctype-safe-ballast","node-01-anchorhead","node-05-cinder-wharf",0),w(2,"ctype-fragile-isotopes","node-01-anchorhead","node-05-cinder-wharf",0),w(3,"ctype-tide-express","node-01-anchorhead","node-07-rust-atoll",0)];return{version:d.saveVersion,seed:e,rngState:t.getState(),turn:1,runStatus:"IN_PROGRESS",currentNodeId:d.startNodeId,hull:d.baseMaxHull,maxHull:d.baseMaxHull,fuel:d.baseMaxFuel,maxFuel:d.baseMaxFuel,credits:d.startingCredits,fuelDrums:d.startingFuelDrums,repairKits:d.startingRepairKits,maxHoldSlots:d.maxHoldSlots,installedModules:[],contracts:a,deliveredContractIds:[],deliveriesCompleted:0,edges:r,pendingEncounter:null,pendingUpgradeChoices:[],selectedNodeId:"node-05-cinder-wharf",failureDiagnostic:null,log:[{turn:1,nodeId:d.startNodeId,edgeId:null,hazardId:null,choiceId:null,fuelDelta:0,hullDelta:0,creditsDelta:0,message:"Moored at Anchorhead Drydock. Inspect the 8-Slot Hold Grid, accept up to 2 contracts, and chart your route."}],nextContractSeq:4}}function D(e,t,r){const a=new Set(e.installedModules),o=a.has("mod-icebreaker-prow"),n=a.has("mod-twin-prop"),i=a.has("mod-gyro-cradle"),c=a.has("mod-salvage-winch"),s=a.has("mod-bilge-rig");if(r==="patch_brace"&&e.repairKits>0)return{extraFuel:0,hullDamage:0,cargoPenaltyPerFragile:0,scrapCreditBonus:0,repairKitsSpent:1,summaryNote:"Used 1 Repair Kit to brace bulkheads & fenders (0 Hull damage, cargo safe)."};if(r==="evade_burn")switch(t){case"scrap_reef":return{extraFuel:2,hullDamage:0,cargoPenaltyPerFragile:0,scrapCreditBonus:0,repairKitsSpent:0,summaryNote:"Swung wide around the Scrap Reef (+2 Fuel burn, 0 Hull damage)."};case"cross_current_riptide":return{extraFuel:n?0:1,hullDamage:0,cargoPenaltyPerFragile:0,scrapCreditBonus:0,repairKitsSpent:0,summaryNote:"High-RPM ferry glide across Riptide (+1 Fuel burn, 0 Hull damage)."};case"acid_squall":return{extraFuel:2,hullDamage:0,cargoPenaltyPerFragile:0,scrapCreditBonus:0,repairKitsSpent:0,summaryNote:"Outran the Acid Squall curtain (+2 Fuel burn, 0 Hull damage)."};case"floating_minefield":return{extraFuel:2,hullDamage:o?0:2,cargoPenaltyPerFragile:0,scrapCreditBonus:0,repairKitsSpent:0,summaryNote:"Sonar slalom through Minefield (+2 Fuel burn, minimal grazing)."};case"silt_fogbank":return{extraFuel:1,hullDamage:0,cargoPenaltyPerFragile:0,scrapCreditBonus:0,repairKitsSpent:0,summaryNote:"Radar sweep guided the skiff cleanly through the Silt Fogbank (+1 Fuel)."};case"rogue_wake":return{extraFuel:1,hullDamage:0,cargoPenaltyPerFragile:0,scrapCreditBonus:0,repairKitsSpent:0,summaryNote:"Quartered into the Rogue Wake (+1 Fuel burn, 0 Hull damage)."}}switch(t){case"scrap_reef":return{extraFuel:0,hullDamage:o?0:10,cargoPenaltyPerFragile:o||i?0:14,scrapCreditBonus:c?14:0,repairKitsSpent:0,summaryNote:o?"Reinforced Icebreaker Prow crushed through the Scrap Reef with 0 Hull damage!":"Scraped across submerged rebar (-10 Hull)."};case"cross_current_riptide":return{extraFuel:n?0:2,hullDamage:n?0:4,cargoPenaltyPerFragile:0,scrapCreditBonus:0,repairKitsSpent:0,summaryNote:n?"Twin-Prop Outrigger held course effortlessly through the Riptide (0 extra Fuel, 0 Hull)!":"Cross-Current Riptide dragged the skiff (+2 Fuel burn, -4 Hull)."};case"acid_squall":{let u=7;return i&&(u-=3),s&&(u-=3),u=Math.max(1,u),{extraFuel:0,hullDamage:u,cargoPenaltyPerFragile:i?0:16,scrapCreditBonus:0,repairKitsSpent:0,summaryNote:i?`Gyro-Shock Cradle stabilized fragile cargo through the Acid Squall (-${u} Hull).`:`Acid Squall corroded plating (-${u} Hull) and jolted uncradled fragile crates.`}}case"floating_minefield":return{extraFuel:0,hullDamage:o?4:12,cargoPenaltyPerFragile:i||o?0:18,scrapCreditBonus:c?18:0,repairKitsSpent:0,summaryNote:o?"Icebreaker Prow deflected mine tethers (-4 Hull).":"Mine tether detonation scorched the hull (-12 Hull)!"};case"silt_fogbank":return{extraFuel:1,hullDamage:3,cargoPenaltyPerFragile:0,scrapCreditBonus:c?12:0,repairKitsSpent:0,summaryNote:"Crawled through Silt Fogbank (+1 Fuel drift, -3 Hull)."};case"rogue_wake":return{extraFuel:0,hullDamage:i||n?1:5,cargoPenaltyPerFragile:i?0:12,scrapCreditBonus:0,repairKitsSpent:0,summaryNote:i?"Gyro-Shock Cradle absorbed the Rogue Wake (-1 Hull, cargo untouched).":"Slammed into Rogue Wake crest (-5 Hull)."}}}function Z(e,t,r="press_on"){const a=[];let o=0,n=0,i=0,c=0,s=0;const u=e.contracts.filter(g=>g.status==="ACCEPTED"&&g.fragile).length;for(let g=0;g<t.length-1;g++){const m=t[g],y=t[g+1],C=O(e,m,y);if(!C)throw new Error(`No edge connecting ${m} and ${y}`);a.push(C.id),o+=C.baseFuelCost;const S=D(e,C.hazardId,"press_on");let F=S;if(r==="smart"){const H=D(e,C.hazardId,"evade_burn"),be=S.hullDamage*3.5+S.extraFuel*4+S.cargoPenaltyPerFragile*u*1.2-S.scrapCreditBonus;H.hullDamage*3.5+H.extraFuel*4+H.cargoPenaltyPerFragile*u*1.2<be&&e.maxFuel>=12&&(F=H)}n+=F.extraFuel,i+=F.hullDamage,c+=F.cargoPenaltyPerFragile*u,s+=F.scrapCreditBonus}const p=o+n,l=e.installedModules.includes("mod-aux-tank")?2.2:4.2,f=i*3.8+p*l+c*1.5-s*.5;return{pathNodeIds:[...t],edgeIds:a,totalBaseFuel:o,expectedExtraFuel:n,totalExpectedFuel:p,expectedHullDamage:i,expectedCargoPenalty:c,expectedScrapBonus:s,score:f}}function L(e,t,r,a=5){const o=[];function n(i,c){if(!(c.length-1>a)){if(i===r){o.push(Z(e,c,"press_on"));return}for(const s of I(e,i)){const u=$(s,i);c.includes(u)||(c.push(u),n(u,c),c.pop())}}}if(n(t,[t]),o.length===0)throw new Error(`No route found between ${t} and ${r}`);return o.sort((i,c)=>i.score-c.score),o[0]}function ye(e){const t=e.fuel+e.fuelDrums*d.fuelPerDrum,r=e.contracts.filter(a=>a.status==="OFFERED"&&a.originNodeId===e.currentNodeId);for(const a of r){const o=L(e,e.currentNodeId,a.destinationNodeId,4),n=e.hull-o.expectedHullDamage,i=t-o.totalExpectedFuel;if(n>=15&&i>=2)return{viable:!0,viableContractId:a.id,route:o,remainingHull:n,remainingEffectiveFuel:i}}return{viable:!1,viableContractId:null,route:null,remainingHull:0,remainingEffectiveFuel:0}}function X(e,t){if(e.runStatus!=="IN_PROGRESS")return{ok:!1,error:"Run has already ended."};if(e.pendingEncounter)return{ok:!1,error:"Resolve the current sea hazard encounter first."};const r=e.contracts.find(n=>n.id===t);if(!r)return{ok:!1,error:"Contract not found."};if(r.status!=="OFFERED")return{ok:!1,error:`Contract is ${r.status}, not OFFERED.`};if(r.originNodeId!==e.currentNodeId)return{ok:!1,error:"Must be moored at the contract origin port to load cargo."};const a=e.contracts.filter(n=>n.status==="ACCEPTED");if(a.length>=d.maxActiveContracts)return{ok:!1,error:`Cannot carry more than ${d.maxActiveContracts} active contracts at once.`};const o=k({installedModules:e.installedModules,acceptedContracts:[...a,r],fuelDrums:e.fuelDrums,repairKits:e.repairKits,maxHoldSlots:e.maxHoldSlots});return o.valid?(r.status="ACCEPTED",e.selectedNodeId=r.destinationNodeId,e.log.push({turn:e.turn,nodeId:e.currentNodeId,edgeId:null,hazardId:null,choiceId:null,fuelDelta:0,hullDelta:0,creditsDelta:0,message:`Loaded "${r.cargoName}" (${r.cargoSlots} Hold Slot${r.cargoSlots>1?"s":""}) bound for ${h(r.destinationNodeId).name}.`}),{ok:!0}):{ok:!1,error:o.reason}}function Q(e,t){const r=e.contracts.find(a=>a.id===t);return!r||r.status!=="ACCEPTED"?{ok:!1,error:"Only accepted contracts can be jettisoned/abandoned."}:(r.status="FAILED",e.log.push({turn:e.turn,nodeId:e.currentNodeId,edgeId:null,hazardId:null,choiceId:null,fuelDelta:0,hullDelta:0,creditsDelta:0,message:`Jettisoned "${r.cargoName}" (${r.cargoSlots} Slots freed). Contract marked FAILED.`}),j(e),{ok:!0})}function ee(e,t){if(e.pendingEncounter)return{ok:!1,payout:0,error:"Cannot deliver while resolving an encounter."};const r=e.contracts.find(i=>i.id===t);if(!r)return{ok:!1,payout:0,error:"Contract does not exist."};if(r.paidOut||r.status==="DELIVERED"||e.deliveredContractIds.includes(r.id))return{ok:!1,payout:0,error:"Contract has already been delivered and paid out."};if(r.status!=="ACCEPTED")return{ok:!1,payout:0,error:`Contract cannot be delivered from status ${r.status}.`};if(e.currentNodeId!==r.destinationNodeId)return{ok:!1,payout:0,error:`Must reach destination port (${h(r.destinationNodeId).name}) to deliver.`};const a=r.urgentMaxHops!==null&&r.hopsTaken<=r.urgentMaxHops?15:0,o=Math.max(10,r.basePayout-r.accumulatedPenalty+a);r.status="DELIVERED",r.paidOut=!0,e.deliveredContractIds.push(r.id),e.credits+=o,e.deliveriesCompleted+=1;const n=E.map(i=>i.id).filter(i=>!e.installedModules.includes(i));return e.pendingUpgradeChoices=n.slice(0,3),e.log.push({turn:e.turn,nodeId:e.currentNodeId,edgeId:null,hazardId:null,choiceId:null,fuelDelta:0,hullDelta:0,creditsDelta:o,message:`Delivered "${r.cargoName}" at ${h(e.currentNodeId).name} for +${o}¢! (${e.deliveriesCompleted}/${d.deliveriesToWin} Deliveries)`}),e.deliveriesCompleted>=d.deliveriesToWin?(e.runStatus="VICTORY",e.log.push({turn:e.turn,nodeId:e.currentNodeId,edgeId:null,hazardId:null,choiceId:null,fuelDelta:0,hullDelta:0,creditsDelta:0,message:`VICTORY! Completed ${e.deliveriesCompleted} salvage deliveries across The Rustwater Shallows with ${e.credits}¢ in the guild vault!`})):j(e),{ok:!0,payout:o}}function te(e,t){if(e.pendingUpgradeChoices.length===0)return{ok:!1,error:"No pending delivery upgrade available."};if(t==="skip_for_credits")return e.pendingUpgradeChoices=[],e.credits+=20,e.log.push({turn:e.turn,nodeId:e.currentNodeId,edgeId:null,hazardId:null,choiceId:null,fuelDelta:0,hullDelta:0,creditsDelta:20,message:"Declined module refit and claimed +20¢ guild salvage stipend."}),{ok:!0};if(!e.pendingUpgradeChoices.includes(t))return{ok:!1,error:"Module is not in the current upgrade offer."};const r=U(e,t,{freeUpgrade:!0});return r.ok?(e.pendingUpgradeChoices=[],{ok:!0}):r}function U(e,t,r){if(e.pendingEncounter)return{ok:!1,error:"Cannot refit modules at sea during an encounter."};if(e.installedModules.includes(t))return{ok:!1,error:"Module is already installed."};const a=b(t),o=r?.freeUpgrade?0:a.creditCost;if(e.credits<o)return{ok:!1,error:`Insufficient credits: need ${o}¢, have ${e.credits}¢.`};const n=[...e.installedModules,t],i=e.contracts.filter(s=>s.status==="ACCEPTED"),c=k({installedModules:n,acceptedContracts:i,fuelDrums:e.fuelDrums,repairKits:e.repairKits,maxHoldSlots:e.maxHoldSlots});return c.valid?(e.credits-=o,e.installedModules=n,e.maxFuel=P(e.installedModules),t==="mod-aux-tank"&&(e.fuel=Math.min(e.maxFuel,e.fuel+d.auxTankFuelBonus)),e.log.push({turn:e.turn,nodeId:e.currentNodeId,edgeId:null,hazardId:null,choiceId:null,fuelDelta:t==="mod-aux-tank"?d.auxTankFuelBonus:0,hullDelta:0,creditsDelta:-o,message:`Installed ${a.name} (${a.slotCost} Hold Slot${a.slotCost>1?"s":""}).`}),{ok:!0}):{ok:!1,error:c.reason}}function re(e,t){if(e.pendingEncounter)return{ok:!1,error:"Cannot uninstall modules during an encounter."};if(!e.installedModules.includes(t))return{ok:!1,error:"Module is not installed."};const r=b(t),a=Math.floor(r.creditCost*.65);return e.installedModules=e.installedModules.filter(o=>o!==t),e.maxFuel=P(e.installedModules),e.fuel=Math.min(e.fuel,e.maxFuel),e.credits+=a,e.log.push({turn:e.turn,nodeId:e.currentNodeId,edgeId:null,hazardId:null,choiceId:null,fuelDelta:0,hullDelta:0,creditsDelta:a,message:`Removed ${r.name} (+${a}¢ salvage refund, freed ${r.slotCost} Slot${r.slotCost>1?"s":""}).`}),{ok:!0}}function ae(e,t){if(e.pendingEncounter)return{ok:!1,error:"Cannot swap loadout presets during a hazard encounter."};const r=N[t],a=r.moduleIds,o=e.contracts.filter(i=>i.status==="ACCEPTED"),n=k({installedModules:a,acceptedContracts:o,fuelDrums:r.fuelDrums,repairKits:r.repairKits,maxHoldSlots:e.maxHoldSlots});return n.valid?(e.installedModules=[...a],e.fuelDrums=r.fuelDrums,e.repairKits=r.repairKits,e.maxFuel=P(e.installedModules),e.fuel=e.maxFuel,e.log.push({turn:e.turn,nodeId:e.currentNodeId,edgeId:null,hazardId:null,choiceId:null,fuelDelta:0,hullDelta:0,creditsDelta:0,message:`Configured "${r.name}" preset (${n.usedSlots}/${n.maxSlots} Hold Slots used).`}),{ok:!0}):{ok:!1,error:n.reason}}function oe(e){if(e.credits<d.fuelDrumCost)return{ok:!1,error:`Need ${d.fuelDrumCost}¢ to buy a Spare Fuel Drum.`};const t=e.contracts.filter(a=>a.status==="ACCEPTED"),r=k({installedModules:e.installedModules,acceptedContracts:t,fuelDrums:e.fuelDrums+1,repairKits:e.repairKits,maxHoldSlots:e.maxHoldSlots});return r.valid?(e.credits-=d.fuelDrumCost,e.fuelDrums+=1,{ok:!0}):{ok:!1,error:r.reason}}function ne(e){return e.fuelDrums<=0?{ok:!1,error:"No Fuel Drums in hold to unload."}:(e.fuelDrums-=1,e.credits+=d.fuelDrumResell,{ok:!0})}function _(e){if(e.fuelDrums<=0)return{ok:!1,error:"No Spare Fuel Drums in hold."};if(e.fuel>=e.maxFuel)return{ok:!1,error:"Internal fuel tank is already full."};const t=Math.min(d.fuelPerDrum,e.maxFuel-e.fuel);return e.fuelDrums-=1,e.fuel+=t,e.log.push({turn:e.turn,nodeId:e.currentNodeId,edgeId:null,hazardId:null,choiceId:null,fuelDelta:t,hullDelta:0,creditsDelta:0,message:`Cracked open 1 Spare Fuel Drum (+${t} Fuel, freed 1 Hold Slot).`}),{ok:!0}}function le(e){if(e.credits<d.repairKitCost)return{ok:!1,error:`Need ${d.repairKitCost}¢ to buy a Repair Kit.`};const t=e.contracts.filter(a=>a.status==="ACCEPTED"),r=k({installedModules:e.installedModules,acceptedContracts:t,fuelDrums:e.fuelDrums,repairKits:e.repairKits+1,maxHoldSlots:e.maxHoldSlots});return r.valid?(e.credits-=d.repairKitCost,e.repairKits+=1,{ok:!0}):{ok:!1,error:r.reason}}function se(e){return e.repairKits<=0?{ok:!1,error:"No Repair Kits in hold to unload."}:(e.repairKits-=1,e.credits+=d.repairKitResell,{ok:!0})}function ie(e){if(e.repairKits<=0)return{ok:!1,restored:0,error:"No Repair Kits in hold."};if(e.hull>=e.maxHull)return{ok:!1,restored:0,error:"Hull is already at maximum integrity."};const t=e.installedModules.includes("mod-bilge-rig")?d.bilgeRigRepairAmount:d.baseRepairAmount,r=Math.min(t,e.maxHull-e.hull);return e.repairKits-=1,e.hull+=r,e.log.push({turn:e.turn,nodeId:e.currentNodeId,edgeId:null,hazardId:null,choiceId:null,fuelDelta:0,hullDelta:r,creditsDelta:0,message:`Patched hull plating with Repair Kit (+${r} Hull, freed 1 Hold Slot).`}),{ok:!0,restored:r}}function de(e,t){const r=e.maxFuel-e.fuel;if(r<=0)return{ok:!1,added:0,error:"Tank is already topped off."};const a=Math.floor(e.credits/d.portFuelUnitCost);if(a<=0)return{ok:!1,added:0,error:"Insufficient credits to refuel at port."};const o=t?Math.min(t,r,a):Math.min(r,a),n=o*d.portFuelUnitCost;return e.fuel+=o,e.credits-=n,{ok:!0,added:o}}function ce(e,t){const r=e.maxHull-e.hull;if(r<=0)return{ok:!1,restored:0,error:"Hull is already at 100%."};const a=Math.floor(e.credits/d.portHullPointCost);if(a<=0)return{ok:!1,restored:0,error:"Insufficient credits for drydock hull repair."};const o=t?Math.min(t,r,a):Math.min(r,a),n=o*d.portHullPointCost;return e.hull+=o,e.credits-=n,{ok:!0,restored:o}}function T(e,t,r){const a=h(e.currentNodeId).name,o=r?v[r.hazardId]:null;if(t==="HULL_ZERO"){if(r&&o?.counterModuleId&&!e.installedModules.includes(o.counterModuleId)){const i=b(o.counterModuleId);return{cause:"HULL_ZERO",title:`Hull Breached in ${o.name} near ${a}`,summary:`The Iron Skiff broke apart after taking unmitigated ${o.name} damage on leg ${r.id} without ${i.name} installed.`,mistakeCategory:"UNCOUNTERED_HAZARD",failedNodeId:e.currentNodeId,lastEdgeId:r.id,lastHazardId:r.hazardId,recommendation:`Equip ${i.name} before entering ${o.name} shortcuts, or route around via the outer Silt Fogbank channels.`}}return{cause:"HULL_ZERO",title:`Sunk by Cumulative Hull Fatigue at ${a}`,summary:e.repairKits>0?`Sank with ${e.repairKits} unused Repair Kit(s) still sitting in the hold instead of patching before traversal.`:`Pushed into ${o?o.name:"hazardous waters"} on critically low hull without a Repair Kit in reserve.`,mistakeCategory:"SKIPPED_REPAIR",failedNodeId:e.currentNodeId,lastEdgeId:r?r.id:null,lastHazardId:r?r.hazardId:null,recommendation:"Keep at least 15 Hull buffer before entering medium/high hazards or spend a Repair Kit to brace during the encounter."}}const n=e.contracts.filter(i=>i.status==="ACCEPTED").reduce((i,c)=>i+c.cargoSlots,0);return n>=3&&e.fuelDrums===0&&!e.installedModules.includes("mod-aux-tank")?{cause:"FUEL_STRANDED",title:`Out of Diesel at ${a} (Overloaded Cargo Detour)`,summary:`Carried ${n} Hold Slots of cargo without an Auxiliary Reserve Tank or Spare Fuel Drum, running dry after ${o?o.name:"channel"} fuel burn.`,mistakeCategory:"OVERLOADED_DETOUR",failedNodeId:e.currentNodeId,lastEdgeId:r?r.id:null,lastHazardId:r?r.hazardId:null,recommendation:"When hauling 3+ Slots of cargo on outer routes, install the Auxiliary Reserve Tank (+4 Max Fuel) or pack at least 1 Spare Fuel Drum."}:{cause:"FUEL_STRANDED",title:`Stranded Dead-in-Water at ${a}`,summary:`Depleted all internal fuel (0/${e.maxFuel}) and 0 Spare Fuel Drums after traversing ${r?r.id:"the channel"}.`,mistakeCategory:"FUEL_MISCALCULATION",failedNodeId:e.currentNodeId,lastEdgeId:r?r.id:null,lastHazardId:r?r.hazardId:null,recommendation:"Check each route leg’s base fuel + hazard drift cost before departure, or equip Twin-Prop Outrigger to negate Cross-Current Riptide fuel burn."}}function A(e,t,r){if(e.runStatus!=="IN_PROGRESS")return{ok:!1,error:"Cannot travel: run has already concluded."};if(e.pendingEncounter)return{ok:!1,error:"Must resolve current hazard encounter before moving again."};const a=R(e);if(!a.valid)return{ok:!1,error:a.reason};const o=O(e,e.currentNodeId,t);if(!o)return{ok:!1,error:`No direct channel connects ${e.currentNodeId} to ${t}.`};for(;e.fuel<o.baseFuelCost&&e.fuelDrums>0;)_(e);return e.fuel<o.baseFuelCost?(e.runStatus="LOSS",e.failureDiagnostic=T(e,"FUEL_STRANDED",o),{ok:!1,error:`Insufficient fuel: edge requires ${o.baseFuelCost} Fuel, have ${e.fuel}.`}):(e.fuel-=o.baseFuelCost,e.pendingEncounter={edgeId:o.id,fromNodeId:e.currentNodeId,toNodeId:t,baseFuelPaid:o.baseFuelCost,hazardId:o.hazardId},r?B(e,r):{ok:!0})}function B(e,t){const r=e.pendingEncounter;if(!r)return{ok:!1,error:"No pending encounter to resolve."};const a=e.edges.find(g=>g.id===r.edgeId),o=D(e,r.hazardId,t);o.repairKitsSpent>0&&(e.repairKits=Math.max(0,e.repairKits-o.repairKitsSpent));let n=o.extraFuel;for(;e.fuel<n&&e.fuelDrums>0;)_(e);const i=Math.min(e.fuel,n);e.fuel-=i;const c=n-i,s=o.hullDamage+c*4;if(e.hull=Math.max(0,e.hull-s),o.cargoPenaltyPerFragile>0)for(const g of e.contracts)g.status==="ACCEPTED"&&g.fragile&&(g.accumulatedPenalty+=o.cargoPenaltyPerFragile);o.scrapCreditBonus>0&&(e.credits+=o.scrapCreditBonus),e.currentNodeId=r.toNodeId,e.selectedNodeId=r.toNodeId,e.turn+=1,a.timesTraversed+=1,a.lastResolvedChoice=t,e.pendingEncounter=null;for(const g of e.contracts)g.status==="ACCEPTED"&&(g.hopsTaken+=1);if(e.log.push({turn:e.turn,nodeId:e.currentNodeId,edgeId:a.id,hazardId:r.hazardId,choiceId:t,fuelDelta:-(r.baseFuelPaid+i),hullDelta:-s,creditsDelta:o.scrapCreditBonus,message:`Arrived at ${h(e.currentNodeId).name} via ${v[r.hazardId].name}: ${o.summaryNote}`}),e.hull<=0)return e.runStatus="LOSS",e.failureDiagnostic=T(e,"HULL_ZERO",a),e.log.push({turn:e.turn,nodeId:e.currentNodeId,edgeId:a.id,hazardId:r.hazardId,choiceId:t,fuelDelta:0,hullDelta:0,creditsDelta:0,message:`LOSS: ${e.failureDiagnostic.title} — ${e.failureDiagnostic.summary}`}),{ok:!0};const u=e.contracts.some(g=>g.status==="ACCEPTED"&&g.destinationNodeId===e.currentNodeId&&!g.paidOut),p=Math.min(...I(e,e.currentNodeId).map(g=>g.baseFuelCost)),l=e.fuel+e.fuelDrums*d.fuelPerDrum,f=Math.floor(e.credits/d.portFuelUnitCost);return l<=0||l+f<p&&!u?(e.runStatus="LOSS",e.failureDiagnostic=T(e,"FUEL_STRANDED",a),e.log.push({turn:e.turn,nodeId:e.currentNodeId,edgeId:a.id,hazardId:r.hazardId,choiceId:t,fuelDelta:0,hullDelta:0,creditsDelta:0,message:`LOSS: ${e.failureDiagnostic.title} — ${e.failureDiagnostic.summary}`}),{ok:!0}):(j(e),{ok:!0})}class ue{ctx=null;muted=!1;ensureContext(){if(this.muted||typeof window>"u")return null;const t=window.AudioContext||window.webkitAudioContext;if(!t)return null;if(!this.ctx)try{this.ctx=new t}catch{return null}return this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.ctx}playSonarPing(){const t=this.ensureContext();if(!t)return;const r=t.currentTime,a=t.createOscillator(),o=t.createGain();a.type="sine",a.frequency.setValueAtTime(1180,r),a.frequency.exponentialRampToValueAtTime(880,r+.28),o.gain.setValueAtTime(.11,r),o.gain.exponentialRampToValueAtTime(.001,r+.32),a.connect(o),o.connect(t.destination),a.start(r),a.stop(r+.34)}playDieselChug(){const t=this.ensureContext();if(!t)return;const r=t.currentTime;for(let a=0;a<3;a++){const o=r+a*.095,n=t.createOscillator(),i=t.createGain();n.type="sawtooth",n.frequency.setValueAtTime(64+a*6,o),n.frequency.exponentialRampToValueAtTime(42,o+.08),i.gain.setValueAtTime(.09,o),i.gain.exponentialRampToValueAtTime(.001,o+.085),n.connect(i),i.connect(t.destination),n.start(o),n.stop(o+.09)}}playFoghorn(){const t=this.ensureContext();if(!t)return;const r=t.currentTime;for(const a of[110,164.8]){const o=t.createOscillator(),n=t.createGain();o.type="triangle",o.frequency.setValueAtTime(a,r),o.frequency.linearRampToValueAtTime(a*.96,r+.55),n.gain.setValueAtTime(.001,r),n.gain.linearRampToValueAtTime(.11,r+.06),n.gain.exponentialRampToValueAtTime(.001,r+.6),o.connect(n),n.connect(t.destination),o.start(r),o.stop(r+.62)}}playHullClank(){const t=this.ensureContext();if(!t)return;const r=t.currentTime,a=t.createOscillator(),o=t.createGain();a.type="square",a.frequency.setValueAtTime(185,r),a.frequency.exponentialRampToValueAtTime(52,r+.16),o.gain.setValueAtTime(.12,r),o.gain.exponentialRampToValueAtTime(.001,r+.18),a.connect(o),o.connect(t.destination),a.start(r),a.stop(r+.19)}playCoinChime(){const t=this.ensureContext();if(!t)return;const r=t.currentTime;[987.77,1318.51].forEach((o,n)=>{const i=r+n*.08,c=t.createOscillator(),s=t.createGain();c.type="sine",c.frequency.setValueAtTime(o,i),s.gain.setValueAtTime(.11,i),s.gain.exponentialRampToValueAtTime(.001,i+.25),c.connect(s),s.connect(t.destination),c.start(i),c.stop(i+.26)})}destroy(){this.ctx&&(this.ctx.close().catch(()=>{}),this.ctx=null)}}function G(e){const t={gameId:d.gameId,version:d.saveVersion,savedAtIso:new Date().toISOString(),state:structuredClone(e)};return JSON.stringify(t)}function q(e){try{const t=JSON.parse(e);if(!t||typeof t!="object")return{ok:!1,error:"Invalid save JSON payload."};if(t.gameId!==d.gameId)return{ok:!1,error:`Save belongs to another game (${String(t.gameId)}).`};if(t.version!==d.saveVersion)return{ok:!1,error:`Unsupported save version: ${String(t.version)}.`};const r=t.state;if(!r||typeof r.seed!="number"||typeof r.currentNodeId!="string"||!Array.isArray(r.edges)||!Array.isArray(r.contracts)||!Array.isArray(r.installedModules))return{ok:!1,error:"Corrupted run state structure."};const a=structuredClone(r),o=R(a);return o.valid?{ok:!0,state:a}:{ok:!1,error:`Invalid saved loadout: ${o.reason}`}}catch(t){return{ok:!1,error:t instanceof Error?t.message:"Failed to parse save data."}}}function ge(e,t=typeof localStorage<"u"?localStorage:void 0){if(!t)return!1;try{return t.setItem(d.saveStorageKey,G(e)),!0}catch{return!1}}function pe(e=typeof localStorage<"u"?localStorage:void 0){if(!e)return null;try{const t=e.getItem(d.saveStorageKey);if(!t)return null;const r=q(t);return r.ok&&r.state?r.state:null}catch{return null}}function Se(e=typeof localStorage<"u"?localStorage:void 0){if(e)try{e.removeItem(d.saveStorageKey)}catch{}}const ke=`
.jc-root {
  container: courier-shell / inline-size;
  box-sizing: border-box;
  inline-size: 100%;
  min-block-size: 100dvh;
  background: radial-gradient(circle at 20% 15%, #16262e 0%, #0b1317 70%);
  color: #e6edf0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding-block: 0.75rem 1.5rem;
  padding-inline: clamp(0.5rem, 2cqi, 1.25rem);
}

.jc-root *, .jc-root *::before, .jc-root *::after {
  box-sizing: border-box;
}

.jc-header {
  display: flex;
  flex-wrap: wrap;
  align-items: safe center;
  gap: 0.75rem;
  padding-block: 0.65rem;
  padding-inline: 0.9rem;
  background: #122028;
  border: 1px solid #2b4654;
  border-radius: 8px;
  margin-block-end: 0.85rem;
}

.jc-brand {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.jc-title {
  margin: 0;
  font-size: clamp(1.05rem, 2.2cqi, 1.35rem);
  font-weight: 800;
  letter-spacing: 0.03em;
  color: #f3b34c;
  text-transform: uppercase;
}

.jc-subtitle {
  margin: 0;
  font-size: 0.78rem;
  color: #9ab3bf;
}

.jc-telemetry {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-inline-start: auto;
}

.jc-stat-pill {
  display: flex;
  flex-direction: column;
  padding-block: 0.3rem;
  padding-inline: 0.65rem;
  background: #0c161c;
  border: 1px solid #29424f;
  border-radius: 6px;
  min-inline-size: 86px;
}

.jc-stat-label {
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #87a4b2;
}

.jc-stat-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f0f6f8;
}

.jc-stat-value.warn {
  color: #e05a47;
}

.jc-stat-value.good {
  color: #56c288;
}

.jc-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: safe center;
  gap: 0.45rem;
  margin-block-end: 0.85rem;
}

.jc-btn {
  appearance: none;
  background: #1a313d;
  color: #e6edf0;
  border: 1px solid #385a6b;
  border-radius: 6px;
  padding-block: 0.42rem;
  padding-inline: 0.72rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.14s ease, border-color 0.14s ease;
}

.jc-btn:hover:not(:disabled) {
  background: #244354;
  border-color: #5ca1c2;
}

.jc-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.jc-btn-primary {
  background: #c87d20;
  border-color: #f3b34c;
  color: #0b1317;
  font-weight: 700;
}

.jc-btn-primary:hover:not(:disabled) {
  background: #e0922b;
  border-color: #ffd07b;
}

.jc-btn-success {
  background: #216e47;
  border-color: #46b87c;
  color: #eefaf3;
}

.jc-btn-danger {
  background: #5c2222;
  border-color: #b54545;
  color: #ffdede;
}

.jc-toast {
  padding-block: 0.5rem;
  padding-inline: 0.8rem;
  border-radius: 6px;
  margin-block-end: 0.8rem;
  font-size: 0.84rem;
  font-weight: 600;
  background: #19313d;
  border-inline-start: 4px solid #f3b34c;
}

.jc-toast.error {
  background: #3a1a1d;
  border-inline-start-color: #e05a47;
  color: #ffb8ae;
}

.jc-main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
}

@container courier-shell (inline-size > 880px) {
  .jc-main-grid {
    grid-template-columns: 1.25fr 1fr;
    align-items: start;
  }
}

.jc-panel {
  background: #111e25;
  border: 1px solid #26404d;
  border-radius: 8px;
  padding: 0.85rem;
}

.jc-panel-title {
  margin: 0 0 0.6rem 0;
  font-size: 0.92rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #f3b34c;
  display: flex;
  align-items: safe center;
  justify-content: space-between;
  gap: 0.5rem;
}

.jc-map-canvas {
  display: block;
  inline-size: 100%;
  block-size: auto;
  aspect-ratio: 5 / 3;
  background: #091319;
  border: 1px solid #2c4c5c;
  border-radius: 6px;
  cursor: pointer;
}

.jc-leg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.55rem;
  margin-block-start: 0.75rem;
}

.jc-leg-card {
  background: #0c171d;
  border: 1px solid #294452;
  border-radius: 6px;
  padding: 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.jc-badge {
  display: inline-block;
  padding-block: 0.12rem;
  padding-inline: 0.45rem;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
}

.jc-hold-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.45rem;
  margin-block: 0.55rem 0.75rem;
}

@container courier-shell (inline-size < 460px) {
  .jc-hold-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.jc-slot-cell {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px dashed #355566;
  background: #0a141a;
  min-block-size: 58px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.jc-slot-cell.cargo {
  border-style: solid;
  border-color: #f3b34c;
  background: rgba(243, 179, 76, 0.14);
}

.jc-slot-cell.module {
  border-style: solid;
  border-color: #5bc0de;
  background: rgba(91, 192, 222, 0.14);
}

.jc-slot-cell.fuel {
  border-style: solid;
  border-color: #e67e22;
  background: rgba(230, 126, 34, 0.14);
}

.jc-slot-cell.repair {
  border-style: solid;
  border-color: #56c288;
  background: rgba(86, 194, 136, 0.14);
}

.jc-slot-index {
  font-size: 0.64rem;
  color: #7e9aa8;
  font-weight: 700;
}

.jc-slot-name {
  font-size: 0.74rem;
  font-weight: 700;
  color: #eef5f8;
}

.jc-contract-list, .jc-module-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.jc-card {
  background: #0c161c;
  border: 1px solid #27414e;
  border-radius: 6px;
  padding: 0.65rem;
}

.jc-card.active-contract {
  border-color: #f3b34c;
  background: #172428;
}

.jc-card-header {
  display: flex;
  flex-wrap: wrap;
  align-items: safe center;
  justify-content: space-between;
  gap: 0.4rem;
  margin-block-end: 0.35rem;
}

.jc-log-list {
  max-block-size: 165px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
  font-size: 0.76rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding-inline-end: 0.25rem;
}

/* Native modal dialog rules per modern-web-guidance */
dialog.jc-encounter-dialog {
  background: #101e26;
  color: #e6edf0;
  border: 2px solid #f3b34c;
  border-radius: 10px;
  padding: 1.15rem;
  max-inline-size: min(540px, 94dvw);
  inline-size: 100%;
}

dialog.jc-encounter-dialog[open] {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

dialog.jc-encounter-dialog:modal {
  overscroll-behavior: contain;
}

dialog.jc-encounter-dialog::backdrop {
  background: rgba(4, 10, 14, 0.78);
  overflow: hidden;
  overscroll-behavior: contain;
}

.jc-outcome-banner {
  padding: 0.9rem;
  border-radius: 8px;
  margin-block-end: 0.85rem;
  border: 2px solid #f3b34c;
  background: #172830;
}

.jc-outcome-banner.loss {
  border-color: #e05a47;
  background: #2d1417;
}

.jc-outcome-banner.victory {
  border-color: #56c288;
  background: #122e22;
}
`;class fe{container;state;audio;debugOpen;statusNotice=null;keydownHandler;constructor(t,r,a){this.container=t,this.state=r,this.audio=new ue,this.debugOpen=!!a?.debug,this.keydownHandler=o=>{if(o.key==="d"||o.key==="D"){if(document.activeElement&&["INPUT","TEXTAREA"].includes(document.activeElement.tagName))return;this.toggleDebug()}},window.addEventListener("keydown",this.keydownHandler),this.render()}getState(){return this.state}setState(t){this.state=t,this.render()}restartWithSeed(t){this.state=K(t),this.statusNotice={text:`Started fresh archipelago run with Seed #${t}.`,isError:!1},this.audio.playFoghorn(),this.render()}toggleDebug(t){this.debugOpen=typeof t=="boolean"?t:!this.debugOpen,this.render()}destroy(){window.removeEventListener("keydown",this.keydownHandler),this.audio.destroy(),this.container.innerHTML=""}setNotice(t,r=!1){this.statusNotice={text:t,isError:r}}buildHoldSlotsVisualArray(){const t=[];for(const r of this.state.contracts.filter(a=>a.status==="ACCEPTED"))for(let a=0;a<r.cargoSlots;a++)t.push({slotNumber:t.length+1,category:"cargo",title:r.cargoName,subtitle:`Cargo (${a+1}/${r.cargoSlots}) -> ${h(r.destinationNodeId).code}`});for(const r of this.state.installedModules){const a=b(r);for(let o=0;o<a.slotCost;o++)t.push({slotNumber:t.length+1,category:"module",title:a.shortTag,subtitle:a.name})}for(let r=0;r<this.state.fuelDrums;r++)t.push({slotNumber:t.length+1,category:"fuel",title:"FUEL DRUM",subtitle:`+${d.fuelPerDrum} Reserve Fuel`});for(let r=0;r<this.state.repairKits;r++){const a=this.state.installedModules.includes("mod-bilge-rig")?d.bilgeRigRepairAmount:d.baseRepairAmount;t.push({slotNumber:t.length+1,category:"repair",title:"REPAIR KIT",subtitle:`+${a} Hull Patch`})}for(;t.length<this.state.maxHoldSlots;)t.push({slotNumber:t.length+1,category:"empty",title:"OPEN SLOT",subtitle:"Available Hold Space"});return t}render(){const t=this.state,r=R(t),a=h(t.currentNodeId),o=t.contracts.filter(l=>l.status==="ACCEPTED"),n=t.contracts.filter(l=>l.status==="OFFERED"&&l.originNodeId===t.currentNodeId),i=I(t,t.currentNodeId),c=this.buildHoldSlotsVisualArray();let s="";const u=t.selectedNodeId&&t.selectedNodeId!==t.currentNodeId?t.selectedNodeId:o[0]?.destinationNodeId;let p=[];if(u&&u!==t.currentNodeId)try{const l=L(t,t.currentNodeId,u,5);p=l.pathNodeIds;const f=h(u);s=`
          <div style="margin-block-start:0.55rem;padding:0.5rem 0.65rem;background:#0c1820;border:1px solid #2b4a59;border-radius:6px;font-size:0.78rem;">
            <strong>Best Route Preview to ${f.name} (${f.code}):</strong>
            <span>${l.pathNodeIds.map(g=>h(g).code).join(" → ")}</span>
            <span style="margin-inline-start:0.6rem;color:#f3b34c;">Est. Fuel: ${l.totalExpectedFuel}F</span>
            <span style="margin-inline-start:0.6rem;color:#e05a47;">Est. Hull Risk: -${l.expectedHullDamage}</span>
          </div>
        `}catch{}this.container.innerHTML=`
      <style>${ke}</style>
      <div class="jc-root">
        <header class="jc-header">
          <div class="jc-brand">
            <h1 class="jc-title">Junkyard Courier · The Rustwater Shallows</h1>
            <p class="jc-subtitle">Vessel: The Iron Skiff · Moored at <strong>${a.name} (${a.code})</strong> · Turn ${t.turn} · Seed #${t.seed}</p>
          </div>
          <div class="jc-telemetry" role="region" aria-label="Boat Telemetry">
            <div class="jc-stat-pill">
              <span class="jc-stat-label">Hull Plating</span>
              <span class="jc-stat-value ${t.hull<=12?"warn":"good"}" data-testid="stat-hull">${t.hull}/${t.maxHull}</span>
            </div>
            <div class="jc-stat-pill">
              <span class="jc-stat-label">Internal Fuel</span>
              <span class="jc-stat-value ${t.fuel<=2?"warn":""}" data-testid="stat-fuel">${t.fuel}/${t.maxFuel} (+${t.fuelDrums} Drum)</span>
            </div>
            <div class="jc-stat-pill">
              <span class="jc-stat-label">Hold Capacity</span>
              <span class="jc-stat-value ${r.usedSlots>=t.maxHoldSlots?"warn":""}" data-testid="stat-hold">${r.usedSlots}/${t.maxHoldSlots} Slots</span>
            </div>
            <div class="jc-stat-pill">
              <span class="jc-stat-label">Guild Credits</span>
              <span class="jc-stat-value good" data-testid="stat-credits">${t.credits}¢</span>
            </div>
            <div class="jc-stat-pill">
              <span class="jc-stat-label">Deliveries</span>
              <span class="jc-stat-value good" data-testid="stat-deliveries">${t.deliveriesCompleted}/${d.deliveriesToWin}</span>
            </div>
          </div>
        </header>

        <div class="jc-toolbar">
          <button type="button" class="jc-btn" data-action="preset-hauler" title="${N.hauler.preferredStrategy}">
            Preset: Light High-Capacity Hauler
          </button>
          <button type="button" class="jc-btn" data-action="preset-armored" title="${N.armored_runner.preferredStrategy}">
            Preset: Armored Storm-Runner
          </button>
          <button type="button" class="jc-btn" data-action="save-run">Save Run</button>
          <button type="button" class="jc-btn" data-action="load-run">Load Saved</button>
          <button type="button" class="jc-btn" data-action="new-run">New Seed Run</button>
          <button type="button" class="jc-btn" data-action="toggle-mute">${this.audio.muted?"Unmute Audio":"Mute Audio"}</button>
          <button type="button" class="jc-btn" data-action="toggle-debug" style="margin-inline-start:auto;">[D] Debug Inspector</button>
        </div>

        ${this.statusNotice?`<div class="jc-toast ${this.statusNotice.isError?"error":""}" role="status">${this.statusNotice.text}</div>`:""}

        ${this.renderOutcomeBanner()}
        ${this.renderPendingUpgradeBanner()}

        <div class="jc-main-grid">
          <!-- LEFT COLUMN: 12-Node Archipelago Map & Outgoing Route Legs -->
          <section class="jc-panel" aria-label="Archipelago Navigation Chart">
            <h2 class="jc-panel-title">
              <span>12-Location Rustwater Archipelago Chart</span>
              <span style="font-size:0.74rem;color:#9ab3bf;font-weight:500;">Click any adjacent node or route card to sail</span>
            </h2>
            <canvas class="jc-map-canvas" width="800" height="480" data-testid="archipelago-canvas"></canvas>
            ${s}

            <h3 style="margin:0.8rem 0 0.4rem 0;font-size:0.82rem;color:#f3b34c;text-transform:uppercase;">
              Outgoing Route Legs from ${a.name} (${a.code})
            </h3>
            <div class="jc-leg-grid">
              ${i.map(l=>{const f=$(l,t.currentNodeId),g=h(f),m=v[l.hazardId],y=m.counterModuleId&&t.installedModules.includes(m.counterModuleId);return`
                    <div class="jc-leg-card" style="${o.some(S=>S.destinationNodeId===f)?"border-color:#f3b34c;":""}">
                      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.3rem;">
                        <strong style="font-size:0.84rem;color:#fff;">→ ${g.code}: ${g.name}</strong>
                        <span class="jc-badge" style="background:${m.badgeColor};color:#081014;">${m.shortCode}</span>
                      </div>
                      <div style="font-size:0.74rem;color:#b4c7d0;">
                        Base Fuel: <strong>${l.baseFuelCost}F</strong> · Channel: ${l.channelType.replace("_"," ")}
                      </div>
                      <div style="font-size:0.72rem;color:#9ab3bf;">
                        ${m.name}: ${m.consequenceSummary}
                      </div>
                      <div style="font-size:0.71rem;color:${y?"#56c288":"#f3b34c"};">
                        ${y?`✓ Counter Equipped (${b(m.counterModuleId).shortTag})`:m.counterModuleId?`Counter Module: ${b(m.counterModuleId).name}`:"Standard seamanship leg"}
                      </div>
                      <button
                        type="button"
                        class="jc-btn jc-btn-primary"
                        data-action="sail-node"
                        data-node-id="${f}"
                        ${t.runStatus!=="IN_PROGRESS"?"disabled":""}
                      >
                        Sail to ${g.code} (${l.baseFuelCost} Fuel)
                      </button>
                    </div>
                  `}).join("")}
            </div>
          </section>

          <!-- RIGHT COLUMN: 8-Slot Hold Grid, Contract Clipboard & Modules -->
          <div style="display:flex;flex-direction:column;gap:0.9rem;">
            <!-- Hold Slot Allocation Grid -->
            <section class="jc-panel" aria-label="Boat Hold Slot Allocation">
              <h2 class="jc-panel-title">
                <span>Iron Skiff Shared Hold (${r.usedSlots}/${t.maxHoldSlots} Slots)</span>
                <span style="font-size:0.74rem;color:#9ab3bf;">Cargo ${r.breakdown.cargoSlots} · Mods ${r.breakdown.moduleSlots} · Drums ${r.breakdown.fuelDrumSlots} · Kits ${r.breakdown.repairKitSlots}</span>
              </h2>
              <div class="jc-hold-grid" data-testid="hold-slot-grid">
                ${c.map(l=>`
                  <div class="jc-slot-cell ${l.category}">
                    <span class="jc-slot-index">SLOT 0${l.slotNumber} · ${l.category.toUpperCase()}</span>
                    <span class="jc-slot-name">${l.title}</span>
                    <span style="font-size:0.66rem;color:#9ab3bf;">${l.subtitle}</span>
                  </div>
                `).join("")}
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
                <button type="button" class="jc-btn" data-action="port-refuel" ${t.fuel>=t.maxFuel?"disabled":""}>
                  Refuel Tank (+1F / ${d.portFuelUnitCost}¢)
                </button>
                <button type="button" class="jc-btn" data-action="port-repair" ${t.hull>=t.maxHull?"disabled":""}>
                  Drydock Patch (+5 Hull / ${d.portHullPointCost*5}¢)
                </button>
                <button type="button" class="jc-btn" data-action="buy-drum">
                  +1 Fuel Drum (${d.fuelDrumCost}¢ · 1 Slot)
                </button>
                <button type="button" class="jc-btn" data-action="crack-drum" ${t.fuelDrums<=0||t.fuel>=t.maxFuel?"disabled":""}>
                  Crack Drum (+${d.fuelPerDrum}F)
                </button>
                <button type="button" class="jc-btn" data-action="sell-drum" ${t.fuelDrums<=0?"disabled":""}>
                  Unload Drum (+${d.fuelDrumResell}¢)
                </button>
                <button type="button" class="jc-btn" data-action="buy-kit">
                  +1 Repair Kit (${d.repairKitCost}¢ · 1 Slot)
                </button>
                <button type="button" class="jc-btn" data-action="use-kit" ${t.repairKits<=0||t.hull>=t.maxHull?"disabled":""}>
                  Use Kit (+${t.installedModules.includes("mod-bilge-rig")?d.bilgeRigRepairAmount:d.baseRepairAmount} Hull)
                </button>
                <button type="button" class="jc-btn" data-action="sell-kit" ${t.repairKits<=0?"disabled":""}>
                  Unload Kit (+${d.repairKitResell}¢)
                </button>
              </div>
            </section>

            <!-- Port Contract Clipboard -->
            <section class="jc-panel" aria-label="Port Salvage Contracts">
              <h2 class="jc-panel-title">
                <span>Salvage Contract Clipboard</span>
                <span style="font-size:0.74rem;color:#9ab3bf;">Active: ${o.length}/${d.maxActiveContracts}</span>
              </h2>

              <div class="jc-contract-list">
                ${o.map(l=>{const f=h(l.destinationNodeId),g=t.currentNodeId===l.destinationNodeId&&!l.paidOut;return`
                      <div class="jc-card active-contract" data-testid="active-contract-${l.id}">
                        <div class="jc-card-header">
                          <strong>[IN HOLD] ${l.cargoName} (${l.cargoSlots} Slot${l.cargoSlots>1?"s":""})</strong>
                          <span class="jc-badge" style="background:#f3b34c;color:#0b1317;">Payout ${Math.max(10,l.basePayout-l.accumulatedPenalty)}¢</span>
                        </div>
                        <div style="font-size:0.76rem;color:#d0e0e7;margin-block-end:0.4rem;">
                          Destination: <strong>${f.name} (${f.code})</strong> · Hops: ${l.hopsTaken}
                          ${l.fragile?' · <span style="color:#ff9f7f;">FRAGILE</span>':""}
                          ${l.bulky?' · <span style="color:#f3b34c;">BULKY (3 Slots)</span>':""}
                        </div>
                        <div style="display:flex;gap:0.45rem;">
                          ${g?`<button type="button" class="jc-btn jc-btn-success" data-action="deliver-contract" data-contract-id="${l.id}">Deliver & Claim Payout (${Math.max(10,l.basePayout-l.accumulatedPenalty)}¢)</button>`:`<button type="button" class="jc-btn" data-action="focus-node" data-node-id="${l.destinationNodeId}">Plot Route to ${f.code}</button>`}
                          <button type="button" class="jc-btn jc-btn-danger" data-action="abandon-contract" data-contract-id="${l.id}">Jettison Cargo</button>
                        </div>
                      </div>
                    `}).join("")}

                ${n.map(l=>{const f=h(l.destinationNodeId),g=r.breakdown.freeSlots>=l.cargoSlots;return`
                      <div class="jc-card" data-testid="offer-contract-${l.id}">
                        <div class="jc-card-header">
                          <strong>${l.cargoName} — ${l.categoryName}</strong>
                          <div>
                            <span class="jc-badge" style="background:#264554;color:#fff;">${l.cargoSlots} Hold Slot${l.cargoSlots>1?"s":""}</span>
                            <span class="jc-badge" style="background:#56c288;color:#08120c;">+${l.basePayout}¢</span>
                          </div>
                        </div>
                        <div style="font-size:0.75rem;color:#9ab3bf;margin-block-end:0.35rem;">
                          Deliver to <strong>${f.name} (${f.code})</strong>
                          ${l.fragile?' · <strong style="color:#ff9f7f;">FRAGILE</strong>':""}
                          ${l.urgentMaxHops?` · <strong style="color:#7fd4ff;">URGENT (≤${l.urgentMaxHops} hops: +15¢)</strong>`:""}
                        </div>
                        <p style="margin:0 0 0.45rem 0;font-size:0.73rem;color:#8aa4b0;">${l.description}</p>
                        <div style="display:flex;gap:0.45rem;">
                          <button
                            type="button"
                            class="jc-btn jc-btn-primary"
                            data-action="accept-contract"
                            data-contract-id="${l.id}"
                            ${!g||o.length>=d.maxActiveContracts?"disabled":""}
                          >
                            ${g?`Accept & Load (${l.cargoSlots} Slot${l.cargoSlots>1?"s":""})`:`Needs ${l.cargoSlots} Free Slots (${r.breakdown.freeSlots} Free)`}
                          </button>
                          <button type="button" class="jc-btn" data-action="focus-node" data-node-id="${l.destinationNodeId}">
                            Inspect Route
                          </button>
                        </div>
                      </div>
                    `}).join("")}
              </div>
            </section>

            <!-- 6 Boat Modules Refit Bay -->
            <section class="jc-panel" aria-label="Boat Module Refit Bay">
              <h2 class="jc-panel-title">
                <span>Boat Modules (${t.installedModules.length}/6 Installed)</span>
                <span style="font-size:0.74rem;color:#9ab3bf;">Modules share the 8-Slot Hold</span>
              </h2>
              <div class="jc-module-list">
                ${E.map(l=>{const f=t.installedModules.includes(l.id);return`
                    <div class="jc-card" style="display:flex;justify-content:space-between;align-items:center;gap:0.6rem;">
                      <div>
                        <div style="font-size:0.81rem;font-weight:700;color:${f?"#5bc0de":"#e6edf0"};">
                          ${l.name} (${l.slotCost} Slot${l.slotCost>1?"s":""} · ${l.creditCost}¢)
                        </div>
                        <div style="font-size:0.72rem;color:#9ab3bf;">${l.description}</div>
                      </div>
                      ${f?`<button type="button" class="jc-btn jc-btn-danger" data-action="uninstall-mod" data-mod-id="${l.id}">Remove</button>`:`<button type="button" class="jc-btn" data-action="install-mod" data-mod-id="${l.id}">Install (${l.creditCost}¢)</button>`}
                    </div>
                  `}).join("")}
              </div>
            </section>

            <!-- Voyage Log -->
            <section class="jc-panel" aria-label="Skipper Logbook">
              <h2 class="jc-panel-title"><span>Skipper's Logbook</span></h2>
              <div class="jc-log-list">
                ${[...t.log].reverse().map(l=>`
                  <div>
                    <strong style="color:#f3b34c;">[T${l.turn}]</strong>
                    <span>${l.message}</span>
                  </div>
                `).join("")}
              </div>
            </section>
          </div>
        </div>

        ${this.debugOpen?this.renderDebugPanel():""}
        ${this.renderEncounterDialog()}
      </div>
    `,this.drawArchipelagoCanvas(p),this.bindEvents(),this.syncEncounterModal()}renderOutcomeBanner(){const t=this.state;if(t.runStatus==="VICTORY")return`
        <div class="jc-outcome-banner victory" role="region" aria-label="Run Victory Summary">
          <h2 style="margin:0 0 0.35rem 0;color:#56c288;">★ VOYAGE VICTORY — 3 SALVAGE DELIVERIES COMPLETED!</h2>
          <p style="margin:0 0 0.55rem 0;font-size:0.85rem;">
            The Iron Skiff conquered The Rustwater Shallows with <strong>${t.credits}¢</strong> in guild earnings,
            <strong>${t.hull}/${t.maxHull} Hull</strong>, and <strong>${t.fuel}/${t.maxFuel} Fuel</strong> remaining.
          </p>
          <button type="button" class="jc-btn jc-btn-primary" data-action="new-run">Launch Next Archipelago Run</button>
        </div>
      `;if(t.runStatus==="LOSS"&&t.failureDiagnostic){const r=t.failureDiagnostic;return`
        <div class="jc-outcome-banner loss" role="region" aria-label="Failure Diagnostic Report" data-testid="failure-diagnostic">
          <h2 style="margin:0 0 0.35rem 0;color:#ff8978;">✕ VOYAGE LOST — ${r.title}</h2>
          <p style="margin:0 0 0.35rem 0;font-size:0.84rem;">
            <strong>Diagnostic (${r.mistakeCategory}):</strong> ${r.summary}
          </p>
          <p style="margin:0 0 0.6rem 0;font-size:0.8rem;color:#ffd0c8;">
            <strong>Skipper Recommendation:</strong> ${r.recommendation}
          </p>
          <button type="button" class="jc-btn jc-btn-primary" data-action="new-run">Retry Archipelago Run</button>
        </div>
      `}return""}renderPendingUpgradeBanner(){const t=this.state;return t.pendingUpgradeChoices.length===0||t.runStatus!=="IN_PROGRESS"?"":`
      <div class="jc-outcome-banner" role="region" aria-label="Delivery Module Upgrade Reward">
        <h3 style="margin:0 0 0.35rem 0;color:#f3b34c;">Delivery Complete! Select 1 Guild Module Upgrade (or +20¢ Stipend):</h3>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
          ${t.pendingUpgradeChoices.map(r=>{const a=b(r);return`
                <button type="button" class="jc-btn jc-btn-primary" data-action="claim-upgrade" data-mod-id="${a.id}">
                  Install Free: ${a.name} (${a.slotCost} Slot${a.slotCost>1?"s":""})
                </button>
              `}).join("")}
          <button type="button" class="jc-btn" data-action="claim-upgrade" data-mod-id="skip_for_credits">
            Skip Module (+20¢ Guild Stipend)
          </button>
        </div>
      </div>
    `}renderEncounterDialog(){const t=this.state.pendingEncounter;if(!t)return'<dialog class="jc-encounter-dialog" id="jc-hazard-modal" aria-labelledby="jc-hazard-title" closedby="none"></dialog>';const r=v[t.hazardId],a=h(t.toNodeId);return`
      <dialog class="jc-encounter-dialog" id="jc-hazard-modal" aria-labelledby="jc-hazard-title" closedby="none">
        <div>
          <span class="jc-badge" style="background:${r.badgeColor};color:#081014;">${r.severity} HAZARD ENCOUNTER</span>
          <h2 id="jc-hazard-title" style="margin:0.35rem 0 0.25rem 0;color:#f3b34c;">${r.name} — En Route to ${a.name}</h2>
          <p style="margin:0;font-size:0.83rem;color:#c2d5de;">${r.description}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.55rem;">
          ${r.choices.map((o,n)=>{const i=D(this.state,t.hazardId,o.id),c=o.id==="patch_brace"&&this.state.repairKits<=0;return`
                <div class="jc-card">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;margin-block-end:0.3rem;">
                    <strong>${o.label}</strong>
                    <span style="font-size:0.74rem;color:#f3b34c;">
                      Extra Fuel: ${i.extraFuel}F · Hull: -${i.hullDamage}
                      ${i.scrapCreditBonus>0?` · +${i.scrapCreditBonus}¢ Scrap`:""}
                    </span>
                  </div>
                  <p style="margin:0 0 0.45rem 0;font-size:0.76rem;color:#9ab3bf;">${i.summaryNote}</p>
                  <button
                    type="button"
                    class="jc-btn jc-btn-primary"
                    data-action="resolve-encounter"
                    data-choice-id="${o.id}"
                    ${n===0?"autofocus":""}
                    ${c?"disabled":""}
                  >
                    ${c?"Requires 1 Repair Kit in Hold":`Execute: ${o.label}`}
                  </button>
                </div>
              `}).join("")}
        </div>
      </dialog>
    `}renderDebugPanel(){const t=this.state,r=R(t);return`
      <section class="jc-panel" style="margin-block-start:0.9rem;border-color:#5bc0de;" data-testid="debug-inspector">
        <h2 class="jc-panel-title"><span>[D] Debug Telemetry & Route Inspector</span></h2>
        <div style="font-size:0.76rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.6rem;">
          <div>
            <strong>Seed / RNG State:</strong> ${t.seed} / ${t.rngState}<br/>
            <strong>Hold Validation:</strong> ${r.valid?"VALID":"INVALID"} (${r.usedSlots}/${r.maxSlots} Slots)<br/>
            <strong>Delivered IDs (Anti-Double-Pay Ledger):</strong> ${t.deliveredContractIds.join(", ")||"None"}
          </div>
          <div>
            <strong>Serialize / Import State:</strong>
            <div style="display:flex;gap:0.4rem;margin-block-start:0.3rem;">
              <button type="button" class="jc-btn" data-action="debug-add-credits">+50¢ Credits</button>
              <button type="button" class="jc-btn" data-action="debug-heal">Full Hull & Fuel</button>
            </div>
          </div>
        </div>
      </section>
    `}syncEncounterModal(){const t=this.container.querySelector("#jc-hazard-modal");if(t)if(this.state.pendingEncounter){if(!t.open&&typeof t.showModal=="function")try{t.showModal()}catch{t.setAttribute("open","")}}else t.open&&typeof t.close=="function"&&t.close()}drawArchipelagoCanvas(t){const r=this.container.querySelector(".jc-map-canvas");if(!r||typeof navigator<"u"&&/jsdom/i.test(navigator.userAgent))return;let a=null;try{a=r.getContext("2d")}catch{return}if(!a)return;const o=r.width,n=r.height;a.clearRect(0,0,o,n),a.strokeStyle="rgba(65, 115, 138, 0.16)",a.lineWidth=1;for(let s=40;s<o;s+=60)a.beginPath(),a.moveTo(s,0),a.lineTo(s,n),a.stroke();for(let s=40;s<n;s+=60)a.beginPath(),a.moveTo(0,s),a.lineTo(o,s),a.stroke();const i=new Set;for(let s=0;s<t.length-1;s++)i.add(`${t[s]}__${t[s+1]}`),i.add(`${t[s+1]}__${t[s]}`);for(const s of this.state.edges){const u=h(s.from),p=h(s.to),l=v[s.hazardId],f=i.has(`${s.from}__${s.to}`);a.save(),a.beginPath(),a.moveTo(u.x,u.y),a.lineTo(p.x,p.y),a.strokeStyle=f?"#f3b34c":l.badgeColor,a.lineWidth=f?4:2.2,s.channelType==="INNER_SHORTCUT"&&!f&&a.setLineDash([6,4]),a.stroke(),a.restore();const g=(u.x+p.x)/2,m=(u.y+p.y)/2,y=`${s.baseFuelCost}F·${l.shortCode}`;a.fillStyle="rgba(9, 19, 25, 0.88)",a.fillRect(g-28,m-9,56,17),a.strokeStyle=l.badgeColor,a.lineWidth=1,a.strokeRect(g-28,m-9,56,17),a.fillStyle="#e6edf0",a.font="bold 9px Inter, sans-serif",a.textAlign="center",a.textBaseline="middle",a.fillText(y,g,m)}const c=new Set(this.state.contracts.filter(s=>s.status==="ACCEPTED").map(s=>s.destinationNodeId));for(const s of x){const u=s.id===this.state.currentNodeId,p=c.has(s.id),l=s.id===this.state.selectedNodeId;a.beginPath(),a.arc(s.x,s.y,u?15:11,0,Math.PI*2),a.fillStyle=u?"#f3b34c":p?"#56c288":"#1b3542",a.fill(),a.lineWidth=l?3:2,a.strokeStyle=l?"#ffffff":u?"#081014":"#5bc0de",a.stroke(),a.fillStyle=u||p?"#081014":"#e6edf0",a.font="bold 9px Inter, sans-serif",a.textAlign="center",a.textBaseline="middle",a.fillText(s.code,s.x,s.y),a.fillStyle=u?"#f3b34c":p?"#7ef0b0":"#d2e2e9",a.font="bold 11px Inter, sans-serif",a.fillText(s.name,s.x,s.y+24)}}bindEvents(){const t=this.container.querySelector(".jc-map-canvas");t&&t.addEventListener("click",r=>{const a=t.getBoundingClientRect(),o=t.width/a.width,n=t.height/a.height,i=(r.clientX-a.left)*o,c=(r.clientY-a.top)*n;for(const s of x)if(Math.hypot(i-s.x,c-s.y)<=24){if(this.state.selectedNodeId=s.id,I(this.state,this.state.currentNodeId).some(l=>$(l,this.state.currentNodeId)===s.id)&&this.state.runStatus==="IN_PROGRESS"){const l=A(this.state,s.id);l.ok?this.audio.playDieselChug():this.setNotice(l.error??"Unable to sail.",!0)}else this.audio.playSonarPing(),this.setNotice(`Selected ${s.name} (${s.code}) on archipelago chart.`);this.render();break}}),this.container.querySelectorAll("button[data-action]").forEach(r=>{r.addEventListener("click",()=>{const a=r.dataset.action;switch(a){case"preset-hauler":case"preset-armored":{const o=a==="preset-hauler"?"hauler":"armored_runner",n=ae(this.state,o);n.ok?(this.audio.playHullClank(),this.setNotice(`Equipped ${N[o].name} loadout.`)):this.setNotice(n.error??"Preset blocked by hold capacity.",!0),this.render();break}case"save-run":{const o=ge(this.state);this.setNotice(o?`Run saved at ${h(this.state.currentNodeId).name} (Seed #${this.state.seed}).`:"Unable to save run to localStorage.",!o),this.render();break}case"load-run":{const o=pe();o?(this.state=o,this.audio.playSonarPing(),this.setNotice(`Loaded saved run (Seed #${o.seed}, Turn ${o.turn}).`)):this.setNotice("No saved run found in localStorage.",!0),this.render();break}case"new-run":{this.restartWithSeed(this.state.seed+1);break}case"toggle-mute":{this.audio.muted=!this.audio.muted,this.render();break}case"toggle-debug":{this.toggleDebug();break}case"sail-node":{const o=r.dataset.nodeId,n=A(this.state,o);n.ok?this.audio.playDieselChug():this.setNotice(n.error??"Cannot sail leg.",!0),this.render();break}case"resolve-encounter":{const o=r.dataset.choiceId,n=B(this.state,o);n.ok?this.audio.playHullClank():this.setNotice(n.error??"Encounter resolution failed.",!0),this.render();break}case"accept-contract":{const o=r.dataset.contractId,n=X(this.state,o);n.ok?(this.audio.playHullClank(),this.setNotice("Contract cargo loaded into Hold.")):this.setNotice(n.error??"Cannot accept contract.",!0),this.render();break}case"abandon-contract":{const o=r.dataset.contractId,n=Q(this.state,o);n.ok?this.setNotice("Cargo jettisoned; hold slots freed."):this.setNotice(n.error??"Cannot jettison contract.",!0),this.render();break}case"deliver-contract":{const o=r.dataset.contractId,n=ee(this.state,o);n.ok?(this.audio.playCoinChime(),this.setNotice(`Delivered contract for +${n.payout}¢!`)):this.setNotice(n.error??"Delivery rejected.",!0),this.render();break}case"claim-upgrade":{const o=r.dataset.modId,n=te(this.state,o);n.ok?(this.audio.playCoinChime(),this.setNotice("Applied post-delivery guild upgrade!")):this.setNotice(n.error??"Cannot install upgrade (check free Hold Slots).",!0),this.render();break}case"focus-node":{this.state.selectedNodeId=r.dataset.nodeId??null,this.audio.playSonarPing(),this.render();break}case"install-mod":{const o=r.dataset.modId,n=U(this.state,o);n.ok?(this.audio.playHullClank(),this.setNotice("Module bolted into boat hold.")):this.setNotice(n.error??"Module installation failed.",!0),this.render();break}case"uninstall-mod":{const o=r.dataset.modId,n=re(this.state,o);n.ok?this.setNotice("Module uninstalled and hold space freed."):this.setNotice(n.error??"Cannot remove module.",!0),this.render();break}case"port-refuel":{const o=de(this.state,1);o.ok||this.setNotice(o.error??"Cannot refuel.",!0),this.render();break}case"port-repair":{const o=ce(this.state,5);o.ok||this.setNotice(o.error??"Cannot repair hull.",!0),this.render();break}case"buy-drum":{const o=oe(this.state);o.ok||this.setNotice(o.error??"Cannot buy Fuel Drum.",!0),this.render();break}case"crack-drum":{const o=_(this.state);o.ok||this.setNotice(o.error??"Cannot crack drum.",!0),this.render();break}case"sell-drum":{const o=ne(this.state);o.ok||this.setNotice(o.error??"Cannot sell drum.",!0),this.render();break}case"buy-kit":{const o=le(this.state);o.ok||this.setNotice(o.error??"Cannot buy Repair Kit.",!0),this.render();break}case"use-kit":{const o=ie(this.state);o.ok||this.setNotice(o.error??"Cannot use Repair Kit.",!0),this.render();break}case"sell-kit":{const o=se(this.state);o.ok||this.setNotice(o.error??"Cannot sell Repair Kit.",!0),this.render();break}case"debug-add-credits":{this.state.credits+=50,this.render();break}case"debug-heal":{this.state.hull=this.state.maxHull,this.state.fuel=this.state.maxFuel,this.render();break}}})})}exportStateJson(){return G(this.state)}importStateJson(t){const r=q(t);return r.ok&&r.state?(this.state=r.state,this.render(),!0):!1}}const me={id:"04-junkyard-courier",number:4,title:"Junkyard Courier",subtitle:"The Rustwater Shallows — Boat Loadout & Route Roguelite",genre:"Archipelago Loadout & Route Strategy Roguelite",primaryReference:"Sunless Sea / Dredge",supportingReference:"FTL: Faster Than Light",oneSentenceLoop:"Pack your 8-slot workboat hold with salvage cargo, modules, fuel drums, and repair kits, then thread a 12-node flooded industrial archipelago where every route leg trades fuel burn against visible sea hazards.",shortGoal:"Complete your first port-to-port salvage delivery and claim a Boat Module Upgrade.",longGoal:"Complete 3 salvage deliveries across The Rustwater Shallows without sinking (0 Hull) or running out of diesel at sea (0 Fuel).",controlsSummary:"Mouse / Touch to accept contracts, configure the 8-Slot Hold, click connected archipelago nodes to sail, resolve hazard cards, and press [D] for the Debug Inspector.",accentColor:"#f3b34c"};function he(e,t){const r=t?.initialSeed??d.defaultSeed,a=K(r),o=new fe(e,a,{debug:t?.debug});return{destroy(){o.destroy()},getStateSnapshot(){return structuredClone(o.getState())},restartWithSeed(n){o.restartWithSeed(n)},toggleDebug(n){o.toggleDebug(n)}}}const Ce={metadata:me,mountGame:he},xe=Object.freeze(Object.defineProperty({__proto__:null,ARCHIPELAGO_EDGES:V,ARCHIPELAGO_NODES:x,BOAT_MODULES:E,CONTRACT_TEMPLATES:W,CourierAudioEngine:ue,GAME_CONFIG:d,HAZARDS:v,JunkyardCourierUI:fe,LOADOUT_PRESETS:N,SeededRng:z,abandonContract:Q,acceptContract:X,analyzeFailure:T,applyLoadoutPreset:ae,beginTravelToNode:A,buildSeededArchipelagoEdges:Y,buyFuelDrum:oe,buyRepairKit:le,clearSavedRunFromStorage:Se,computeHoldSlotBreakdown:M,computeHopDistances:J,crackFuelDrumIntoTank:_,createInitialRunState:K,default:Ce,deliverContract:ee,deserializeRunState:q,ensurePortContractOffers:j,evaluateRouteForLoadout:Z,findOptimalRouteForLoadout:L,getConnectedEdges:I,getEdgeBetween:O,getMaxFuelForModules:P,getModuleById:b,getNeighborNodeId:$,getNodeById:h,installModule:U,loadRunFromStorage:pe,metadata:me,mountGame:he,previewHazardOutcome:D,refuelAtPort:de,repairHullAtPort:ce,resolvePendingEncounter:B,saveRunToStorage:ge,selectDeliveryUpgradeModule:te,sellFuelDrum:ne,sellRepairKit:se,serializeRunState:G,uninstallModule:re,useRepairKitOnHull:ie,validateLoadout:k,validateStarterViableRoute:ye,validateStateHoldCapacity:R},Symbol.toStringTag,{value:"Module"}));export{xe as g,he as m};
