// One More Season — tunable rules. Every number the sim uses lives here.
export const CONFIG = {
  saveVersion: 1,
  fixtures: 6,
  winTarget: 4,
  startersCount: 5,
  possessionsPerTeam: 8,
  outcomes: [0, 3, 7],
  // Base chances (percent) for 0 / 3 / 7 points at equal strength.
  base: {
    patient: [25, 55, 20],
    balanced: [35, 35, 30],
    aggressive: [50, 10, 40],
  },
  // Shift S (percentage points) moves chance from the 0 bucket to the 7 bucket.
  // S = round(kAttack*(offAttack - defDefense) + kControl*(offControl - defControl) + tendency)
  // then clamped to [-maxShift, +maxShift]. The 3-point bucket never changes.
  kAttack: 3,
  kControl: 2,
  maxShift: 15,
  fatigueMax: 100,
  fatigueDivisor: 200, // effective = attribute * (1 - fatigue / 200)
  attrMin: 1,
  attrMax: 10,
  prepPoints: 2,
  restAmount: 24,
  trainFatigue: 8,
  starterFatigueBase: 24, // starters gain (24 - Stamina)
  reserveRecovery: 18,
  // Decisive-event picker: swing = |points - expected points|, +lateBonus if
  // possession index >= lateFrom and the margin before it was within lateMargin.
  lateFrom: 12,
  lateMargin: 7,
  lateBonus: 1.5,
  tiredBelow: 0.8, // recap calls your side "tired" when average fatigue multiplier < 0.8
  tiredWarn: 45, // prep screen warns about any starter at or above this fatigue
  playbackMs: 650,
};
