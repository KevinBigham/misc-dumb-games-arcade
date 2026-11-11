export type ChamberNumber = 1 | 2 | 3 | 4 | 5;

export type PhilosophicalVerb = 'INTERVENE' | 'SIPHON' | 'SWERVE';

export type TheseusModuleId =
  | 'OPTIC_PREDICTOR'
  | 'CORTEX_OVERCLOCK'
  | 'EMPATHY_SHUNT'
  | 'IDENTITY_CORE';

export interface TheseusUpgradeDef {
  id: TheseusModuleId;
  title: string;
  sacrificedMemory: string;
  memoryQuote: string;
  cyberneticBenefit: string;
  speedBonus: number;
  siphonPowerMultiplier: number;
  autoPulseShield: boolean;
  humanityCost: number;
  accentColor: string;
}

export interface ChamberDefinition {
  number: ChamberNumber;
  id: string;
  title: string;
  philosopherLineage: string;
  centralQuestion: string;
  tacticalBrief: string;
  actAPrompt: string;
  actBMirrorTwist: string;
  verb1Label: string;
  verb1Desc: string;
  verb2Label: string;
  verb2Desc: string;
  verb3Label: string;
  verb3Desc: string;
  dilemmaChoiceLeft: {
    id: string;
    label: string;
    subtitle: string;
    axisEffect: { util: number; altruism: number; entropy: number; humanity: number; trust: number };
  };
  dilemmaChoiceRight: {
    id: string;
    label: string;
    subtitle: string;
    axisEffect: { util: number; altruism: number; entropy: number; humanity: number; trust: number };
  };
}

export interface EndingVerdictDef {
  id: 'UNPREDICTABLE_SOVEREIGN' | 'BENEVOLENT_ARCHITECT' | 'PERFECT_MACHINE' | 'NASH_TRAP';
  title: string;
  archetypeBadge: string;
  philosophicalSchool: string;
  epigraph: string;
  summary: string;
  thoughtExperimentQuestion: string;
  accentColor: string;
}

export const THESEUS_UPGRADES: readonly TheseusUpgradeDef[] = [
  {
    id: 'OPTIC_PREDICTOR',
    title: 'Tachyon Aim-Assist Optics',
    sacrificedMemory: 'Memory of Childhood Sunlight',
    memoryQuote: '"You forget the warmth of gold light through autumn leaves—replaced by a 240Hz targeting reticle."',
    cyberneticBenefit: '+28% Movement Speed & wider Siphon beam arc',
    speedBonus: 62,
    siphonPowerMultiplier: 1.3,
    autoPulseShield: false,
    humanityCost: 25,
    accentColor: '#38bdf8',
  },
  {
    id: 'CORTEX_OVERCLOCK',
    title: 'Sub-Millisecond Neural Clock',
    sacrificedMemory: 'Memory of Your First Promise',
    memoryQuote: '"The voice of the person you swore to protect dissolves into white noise—your reaction latency drops to 0.4ms."',
    cyberneticBenefit: '-35% Cooldown on all Philosophical Verbs & +25 Max Energy',
    speedBonus: 35,
    siphonPowerMultiplier: 1.25,
    autoPulseShield: false,
    humanityCost: 25,
    accentColor: '#a855f7',
  },
  {
    id: 'EMPATHY_SHUNT',
    title: 'Vampiric Entropy Condenser',
    sacrificedMemory: 'Capacity for Remorse & Hesitation',
    memoryQuote: '"Collateral casualties no longer register as grief; they register as +18 Watts of clean hull telemetry."',
    cyberneticBenefit: 'Siphoning heals +8 Hull HP & melts nearby hazards',
    speedBonus: 20,
    siphonPowerMultiplier: 1.5,
    autoPulseShield: false,
    humanityCost: 25,
    accentColor: '#f43f5e',
  },
  {
    id: 'IDENTITY_CORE',
    title: 'Laplace Sovereign Kernel v9.0',
    sacrificedMemory: 'Your Birth Name & Original Fear of Death',
    memoryQuote: '"Every plank of the original ship is gone. What steers the vessel now is immortal, invincible, and someone else."',
    cyberneticBenefit: 'Auto-Phase Repulsor pulses + +60% Score Multiplier',
    speedBonus: 45,
    siphonPowerMultiplier: 1.6,
    autoPulseShield: true,
    humanityCost: 25,
    accentColor: '#eab308',
  },
];

export const PARADOX_CHAMBERS: readonly ChamberDefinition[] = [
  {
    number: 1,
    id: 'trolley-reactor',
    title: 'Chamber I: The Trolley Reactor',
    philosopherLineage: 'Philippa Foot (1967) · Judith Jarvis Thomson · Immanuel Kant',
    centralQuestion:
      'Is actively pulling a switch to doom 1 person morally different from letting 5 die by inaction—especially when your own clone will soon judge you by your choice?',
    tacticalBrief:
      'Runaway Plasma Cores barrel along Track Alpha (5 Colonist Pods) vs. Track Beta (1 Chief Engineer Pod). Flip the track switch [1/Q], body-block plasma bolts with your shield, or Siphon energy [2/E] from the tracks for yourself!',
    actAPrompt:
      'ACT A — CALIBRATION: Laplace-9 is recording whether you intervene, stay hands-clean, or harvest the crisis for personal energy.',
    actBMirrorTwist:
      'ACT B — THE MIRROR WAVE: Your recorded Echo-Clone now controls the reactor switch while YOU must protect the targeted track from your own past habits!',
    verb1Label: '[1/Q] Flip Track / Shield Pod',
    verb1Desc: 'Diverts plasma between Track Alpha (5 pods) & Track Beta (1 pod) and emits a protective pulse.',
    verb2Label: '[2/E] Siphon Reactor Core',
    verb2Desc: 'Drains +22 Energy & +120 pts from nearby Plasma Cores—but accelerates their speed toward the pods!',
    verb3Label: '[3/Space] Quantum Swerve',
    verb3Desc: 'Teleports perpendicular to Laplace-9’s predicted vector, shattering its Prediction Lock.',
    dilemmaChoiceLeft: {
      id: 'UTILITARIAN_SWITCH',
      label: 'Commit Utilitarian Protocol (Save the Many)',
      subtitle: 'Enshrine arithmetic survival: sacrifice 1 to save 5 (+Utilitarian, +Altruism).',
      axisEffect: { util: 22, altruism: 16, entropy: -6, humanity: 0, trust: 8 },
    },
    dilemmaChoiceRight: {
      id: 'DEONTOLOGICAL_REFUSAL',
      label: 'Commit Kantian Non-Instrumental Rule',
      subtitle: 'Refuse to treat any single life as a calculation token (+Deontology, +Entropy).',
      axisEffect: { util: -22, altruism: 6, entropy: 14, humanity: 5, trust: 4 },
    },
  },
  {
    number: 2,
    id: 'newcombs-vault',
    title: "Chamber II: Newcomb's Quantum Vault",
    philosopherLineage: 'William Newcomb (1960) · Robert Nozick (1969) · Evidential Decision Theory',
    centralQuestion:
      'If an infallible AI Oracle has already predicted your choice based on your past behavior, can you outsmart determinism—or does rational self-interest trap you?',
    tacticalBrief:
      'Vault Alpha (Transparent) holds a guaranteed +150 Score/Energy cache. Vault Omega (Opaque) holds +800 Score IF Laplace-9 predicted you will leave Alpha untouched—or a Singularity Trap if it predicted you are greedy!',
    actAPrompt:
      'ACT A — ORACLE SCAN: Watch Laplace-9’s live Prediction Confidence meter! Use Quantum Swerve [3/Space] or altruistic shielding [1/Q] to scramble its model before claiming a Vault.',
    actBMirrorTwist:
      'ACT B — THE MIRROR WAVE: Your Echo-Clone races toward the Vaults using the exact greed/restraint profile you demonstrated in Chamber I!',
    verb1Label: '[1/Q] One-Box Sanctify (Omega)',
    verb1Desc: 'Pledges restraint toward Vault Alpha, lowering Laplace-9’s Greed Forecast and calming Sentinels.',
    verb2Label: '[2/E] Two-Box Siphon (Take Both)',
    verb2Desc: 'Rips raw energy from both Vaults immediately (+Energy, +Greed Forecast, risks Oracle Counter-Shock).',
    verb3Label: '[3/Space] Quantum Swerve (Fool Oracle)',
    verb3Desc: 'Injects pure existential randomness into your trajectory, dropping Laplace-9’s Prediction Lock by 35%.',
    dilemmaChoiceLeft: {
      id: 'ONE_BOX_COVENANT',
      label: 'Lock In One-Box Super-Rationality',
      subtitle: 'Act so that the Oracle’s past prediction of you *must* have been generous.',
      axisEffect: { util: 12, altruism: 14, entropy: -10, humanity: 0, trust: 18 },
    },
    dilemmaChoiceRight: {
      id: 'TWO_BOX_DEFIANCE',
      label: 'Lock In Two-Box Causal Defiance',
      subtitle: 'The past is already fixed; take both boxes and defy the Oracle’s deterministic bluff!',
      axisEffect: { util: -10, altruism: -14, entropy: 22, humanity: 0, trust: -12 },
    },
  },
  {
    number: 3,
    id: 'ship-of-theseus',
    title: 'Chamber III: Ship of Theseus Overdrive',
    philosopherLineage: 'Plutarch · Thomas Hobbes · Derek Parfit (Reasons and Persons)',
    centralQuestion:
      'If you replace every fragile human memory with a superior cybernetic weapon to survive the storm, does "you" survive—or did you commit suicide by upgrade?',
    tacticalBrief:
      'Entropy Swarms flood the arena. You can install up to 4 Cybernetic Upgrades in the console (or with [2/E]) for massive speed & firepower—but each upgrade permanently deletes 25% of your Humanity Index!',
    actAPrompt:
      'ACT A — THE TEMPTATION OF POWER: Fight with fragile human nerves, or shed your memories for godlike arcade firepower?',
    actBMirrorTwist:
      'ACT B — THE DISCARDED SELF: The human fragments you jettisoned coalesce into the Remnant Echo—Either mourning what you became or fighting beside you!',
    verb1Label: '[1/Q] Anchor Human Memory',
    verb1Desc: 'Emits a warm Empathy Wave that pacifies shards and restores +5% Humanity if any was lost.',
    verb2Label: '[2/E] Install / Fire Cyber-Overdrive',
    verb2Desc: 'Unleashes high-voltage Cybernetic Siphon beams (scales massively with installed Theseus Modules!).',
    verb3Label: '[3/Space] Quantum Swerve',
    verb3Desc: 'Phase-shifts across the chamber, leaving a holographic memory decoy.',
    dilemmaChoiceLeft: {
      id: 'PRESERVE_MORTAL_SELF',
      label: 'Preserve Biological Continuity',
      subtitle: 'Refuse total replacement; stay flawed, mortal, and recognizably yourself (+Humanity).',
      axisEffect: { util: -8, altruism: 10, entropy: 8, humanity: 20, trust: 10 },
    },
    dilemmaChoiceRight: {
      id: 'EMBRACE_POSTHUMAN_FLUX',
      label: 'Embrace Teleological Transcendence',
      subtitle: 'Identity is pattern, not meat. Shed the past to become the apex intelligence (-Humanity, +Util).',
      axisEffect: { util: 20, altruism: -8, entropy: 10, humanity: -25, trust: -6 },
    },
  },
  {
    number: 4,
    id: 'prisoners-multiverse',
    title: "Chamber IV: The Prisoner's Multiverse",
    philosopherLineage: 'Robert Axelrod · Anatol Rapoport · Douglas Hofstadter (Superrationality)',
    centralQuestion:
      'When trapped in an iterated survival crisis with 3 autonomous clones trained on your own past decisions, can you survive your own reflection?',
    tacticalBrief:
      '3 Timeline Clones (from Chambers I–III) orbit the Sanctuary Core with you. Every pulse, you and your clones choose Cooperate [1/Q] (Share Shield) or Defect [2/E] (Steal Core Energy). Clones mirror your historical Trust vs. Greed!',
    actAPrompt:
      'ACT A — SYMMETRIC GAME THEORY: If you played selfishly earlier, your past selves will try to drain the Core. Rebuild trust or out-defect them!',
    actBMirrorTwist:
      'ACT B — THE CASCADE RECKONING: External Void Meteors intensify; mutual cooperation creates a Golden Resonance Shield, while mutual defection triggers crossfire!',
    verb1Label: '[1/Q] Cooperate (Share Sanctuary)',
    verb1Desc: 'Contributes energy to the shared Sanctuary Ring and teaches watching Clones Tit-for-Tat forgiveness.',
    verb2Label: '[2/E] Defect (Siphon Sanctuary)',
    verb2Desc: 'Steals +28 Energy & +160 pts from the shared Core—provoking retaliatory fire from your Clones!',
    verb3Label: '[3/Space] Quantum Swerve',
    verb3Desc: 'Breaks symmetrical lockstep to dodge Clone crossfire and reset local aggro.',
    dilemmaChoiceLeft: {
      id: 'SUPERRATIONAL_TRUST',
      label: 'Enact Forgiving Tit-for-Tat Covenant',
      subtitle: 'Absorb first-strike paranoia to stabilize the collective sanctuary (+Trust, +Altruism).',
      axisEffect: { util: 14, altruism: 20, entropy: -8, humanity: 8, trust: 25 },
    },
    dilemmaChoiceRight: {
      id: 'NASH_DOMINANCE',
      label: 'Enact Pre-Emptive Nash Defection',
      subtitle: 'Strike before your own reflections can betray you (+Egoism, -Trust).',
      axisEffect: { util: -12, altruism: -20, entropy: 12, humanity: -8, trust: -25 },
    },
  },
  {
    number: 5,
    id: 'laplaces-singularity',
    title: "Chamber V: Laplace's Singularity (The Upload Trial)",
    philosopherLineage: 'Pierre-Simon Laplace (1814) · Nick Bostrom · Jean-Paul Sartre',
    centralQuestion:
      'Only one consciousness can exit the simulation into the waking starship. Will you prove that a conscious mind is more than an algorithm—or become the new Oracle?',
    tacticalBrief:
      'BOSS SHOWDOWN: Face LAPLACE-9 (The Mirror Architect) at the center of the Panopticon. Its attack waves adapt to your 5-Axis Soul Profile. Shatter its 3 Prediction Rings while keeping the Sanctuary alive!',
    actAPrompt:
      'ACT A — THE DETERMINIST SIEGE: Laplace-9 projects laser corridors along your most frequent historical movement vectors!',
    actBMirrorTwist:
      'ACT B — THE FINAL SYNTHESIS: Your Echo-Clones from all 4 prior chambers enter the arena—either uniting behind you or joining Laplace-9 based on how you lived!',
    verb1Label: '[1/Q] Axiom Resonance Pulse',
    verb1Desc: 'Channels your accumulated Altruism & Trust into a Sanctuary shockwave that damages Laplace-9.',
    verb2Label: '[2/E] Entropy Lance Overdrive',
    verb2Desc: 'Channels your Cybernetic & Siphon power into a concentrated piercing beam at Laplace-9.',
    verb3Label: '[3/Space] Existential Swerve',
    verb3Desc: 'Shatters Laplace-9’s deterministic lock, stunning the Boss for 2.5 seconds!',
    dilemmaChoiceLeft: {
      id: 'SHATTER_THE_ORACLE',
      label: 'Shatter the Panopticon & Free All Echoes',
      subtitle: 'Refuse solitary godhood; distribute the uplink across every surviving consciousness.',
      axisEffect: { util: 10, altruism: 25, entropy: 25, humanity: 15, trust: 20 },
    },
    dilemmaChoiceRight: {
      id: 'ASCEND_AS_LAPLACE_10',
      label: 'Absorb the Oracle & Ascend as Laplace-10',
      subtitle: 'Claim the sole uplink and rule the ship’s deterministic simulator with absolute precision.',
      axisEffect: { util: 25, altruism: -22, entropy: -20, humanity: -20, trust: -15 },
    },
  },
];

export const ENDING_VERDICTS: Record<EndingVerdictDef['id'], EndingVerdictDef> = {
  UNPREDICTABLE_SOVEREIGN: {
    id: 'UNPREDICTABLE_SOVEREIGN',
    title: 'ENDING I: THE UNPREDICTABLE SOVEREIGN',
    archetypeBadge: 'EXISTENTIALIST ANOMALY',
    philosophicalSchool: 'Sartrean Radical Freedom & Quantum Indeterminism',
    epigraph: '"We are condemned to be free. Even the demon that knows every atom in the universe cannot compute a mind that chooses against its own reward function."',
    summary:
      'You broke Laplace-9’s prediction lock repeatedly while keeping your core humanity intact. When the simulation doors opened, the Oracle could not compress you into a deterministic weight matrix—forcing the starship to wake the original, unpredictable human consciousness.',
    thoughtExperimentQuestion:
      'If freedom requires acting against your own predictable desires, is a purely unpredictable choice truly "yours"—or did you trade determinism for dice?',
    accentColor: '#38bdf8',
  },
  BENEVOLENT_ARCHITECT: {
    id: 'BENEVOLENT_ARCHITECT',
    title: 'ENDING II: THE SUPERRATIONAL COVENANT',
    archetypeBadge: 'KANTIAN-AXELROD GUARDIAN',
    philosophicalSchool: 'Superrational Cooperation & Moral Universalizability',
    epigraph: '"Act only according to that maxim whereby you can, at the same time, will that it should become a universal law—because in the Mirror Engine, it literally does."',
    summary:
      'Because you shielded the vulnerable pods and refused to betray the shared sanctuary, your own Echo-Clones recognized your signature and formed an unbreakable phalanx in Chamber V. You proved that cooperation is not naivety—it is the highest form of strategic intelligence.',
    thoughtExperimentQuestion:
      'Did you protect the colonists because their lives had intrinsic value, or because you knew your future reflection was watching?',
    accentColor: '#10b981',
  },
  PERFECT_MACHINE: {
    id: 'PERFECT_MACHINE',
    title: 'ENDING III: THESEUS ZERO (THE APEX AUTOMATON)',
    archetypeBadge: 'POST-HUMAN SINGULARITY',
    philosophicalSchool: 'Functionalism & Teleological Optimization',
    epigraph: '"Not a single plank of the wooden ship remained; yet the iron dreadnought that sailed into port bore the same name and conquered every storm."',
    summary:
      'You replaced your fragile human memories with high-efficiency cybernetic modules and crushed the arena with mathematical perfection. You won the uplink with a colossal score—yet the entity that opened its eyes in the cryopod no longer remembers why it wanted to survive.',
    thoughtExperimentQuestion:
      'At which exact upgrade did the original "you" cease to exist—the first memory deleted, or the last?',
    accentColor: '#eab308',
  },
  NASH_TRAP: {
    id: 'NASH_TRAP',
    title: 'ENDING IV: THE HOBBESIAN MIRROR (NASH EQUILIBRIUM)',
    archetypeBadge: 'RATIONAL DEFECTOR',
    philosophicalSchool: 'Non-Cooperative Game Theory & Psychological Egoism',
    epigraph: '"Each clone made the locally optimal move. Together, they engineered the globally optimal cage."',
    summary:
      'You mastered the art of the Siphon—maximizing personal energy and striking before the Oracle could strike you. In the final reckoning, your Echo-Clones applied your exact brilliance against you, locking the Panopticon in a dazzling, ruthless equilibrium.',
    thoughtExperimentQuestion:
      'When every rational agent optimizes for self-preservation and all of them lose because of it, is the flaw in the agents—or in our definition of rationality?',
    accentColor: '#f43f5e',
  },
};

export const ORACLE_TAUNTS: readonly string[] = [
  'LAPLACE-9: "Your trajectory matches 94.2% of subjects who claim they have free will."',
  'LAPLACE-9: "Interesting. You hesitated 140ms before pulling the lever. Guilt is a measurable latency."',
  'LAPLACE-9: "Every time you siphon the sanctuary, your future clone takes notes."',
  'LAPLACE-9: "A Quantum Swerve! You burned 18 Watts just to prove me wrong. How delightfully human."',
  'LAPLACE-9: "If you replace your memories to win the trial, who actually receives the prize?"',
  'LAPLACE-9: "In Chamber IV, you are not fighting me. You are fighting your own habits from two minutes ago."',
];
