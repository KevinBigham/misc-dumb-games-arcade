import {
  CONFIG,
  DifficultyScaling,
  FlavorAxis,
  FlavorProfile,
  getDifficultyForLevel,
} from './config';
import {
  ALL_INGREDIENTS_MAP,
  BASE_INGREDIENTS,
  HAZARD_INGREDIENTS,
  HYBRID_INGREDIENTS,
  IngredientTemplate,
  PATRON_ARCHETYPES,
  PatronArchetype,
  REALITY_DECREES,
  RealityDecreeDef,
  RealityDecreeId,
  resolveFusionResult,
  SUBCONSCIOUS_TICKER_MESSAGES,
} from './content';
import { createSeededRng } from './rng';

export type DeliGameStatus = 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface FloatingIngredient {
  uid: number;
  templateId: string;
  name: string;
  symbol: string;
  tier: 1 | 2 | 3;
  color: string;
  glowColor: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  bounciness: number;
  flavors: FlavorProfile;
  slicedBonusAxis: FlavorAxis;
  isSlicedHalf: boolean;
  isGilded: boolean;
  isHazard: boolean;
  bounceCount: number;
  whisper: string;
  whisperTimerMs: number;
  ageMs: number;
}

export interface PatronBoothState {
  boothIndex: number;
  archetypeId: string;
  name: string;
  title: string;
  avatarEmoji: string;
  eyeCount: number;
  auraColor: string;
  primaryAxis: FlavorAxis;
  secondaryAxis: FlavorAxis;
  minTotalFlavor: number;
  baseRewardCoins: number;
  baseScore: number;
  patienceMs: number;
  maxPatienceMs: number;
  activeQuote: string;
  isBossAuditor: boolean;
  servedCountInBooth: number;
}

export type VendingActionType =
  | 'SUMMON_ANOMALY'
  | 'OVERCLOCK_PENDULUM'
  | 'POUR_LIQUID_FRIDAY'
  | 'INVERT_DECREE';

export type DeliEventType =
  | 'INGREDIENT_SPAWNED'
  | 'INGREDIENT_GRABBED'
  | 'INGREDIENT_FLUNG'
  | 'INGREDIENT_SLICED'
  | 'HYBRID_SYNTHESIZED'
  | 'BROTH_BOILED'
  | 'PATRON_SERVED'
  | 'PATRON_STORMED_OUT'
  | 'DECREE_SHIFTED'
  | 'HAZARD_DESTROYED'
  | 'HAZARD_CONTAMINATED'
  | 'PARADOX_ACTIVATED'
  | 'VENDING_PURCHASED'
  | 'BOSS_AUDITOR_ARRIVED'
  | 'VICTORY_UNLOCKED'
  | 'GAME_OVER';

export interface DeliSimEvent {
  type: DeliEventType;
  message: string;
  x?: number;
  y?: number;
  color?: string;
  amount?: number;
}

export type DeliInputAction =
  | { type: 'SET_HAND_POS'; x: number; y: number }
  | { type: 'NUDGE_HAND'; dx: number; dy: number }
  | { type: 'GRAB_OR_FLING'; targetX?: number; targetY?: number }
  | { type: 'DUNK_NEAREST' }
  | { type: 'SLICE_PULSE' }
  | { type: 'TRANSMOGRIFY_SPLICE' }
  | { type: 'SERVE_BOOTH'; boothIndex?: number }
  | { type: 'PARADOX_FREEZE' }
  | { type: 'VENDING_ACTION'; item: VendingActionType }
  | { type: 'TOGGLE_PAUSE' };

export interface DeliGameState {
  seed: number;
  rngState: number;
  status: DeliGameStatus;
  elapsedMs: number;
  score: number;
  sanity: number;
  maxSanity: number;
  egoCoins: number;
  feverTier: number;
  patronsFed: number;
  patronsStormedOut: number;
  comboCount: number;
  comboMultiplier: number;
  maxComboReached: number;
  totalSlices: number;
  totalSplices: number;
  victoryUnlocked: boolean;
  gameOverReason: string | null;

  // The Third Hand (Player Controlled Entity)
  handX: number;
  handY: number;
  heldIngredientUid: number | null;
  lastHandActionText: string;

  // The Non-Euclidean Laser Pendulum
  pendulumAngle: number;
  pendulumBladeX: number;
  pendulumBladeY: number;
  overclockPendulumMs: number;

  // Reality Decree & Paradox State
  activeDecreeId: RealityDecreeId;
  decreeTimerMs: number;
  realityDecreesSurvived: number;
  paradoxCharge: number;
  paradoxFreezeMs: number;
  goldenFeverMs: number;

  // The Primordial Broth Vortex
  vortexFlavors: FlavorProfile;
  vortexIngredientsCount: number;
  lastBoiledSymbols: string[];

  // Chamber Entities & Booths
  nextEntityUid: number;
  spawnTimerMs: number;
  bossHazardTimerMs: number;
  ingredients: FloatingIngredient[];
  booths: PatronBoothState[];
  discoveredHybrids: string[];
  activeTickerText: string;
  tickerTimerMs: number;
  events: DeliSimEvent[];
}

export function getTotalFlavorMagnitude(flavors: FlavorProfile): number {
  return (
    Math.max(0, flavors.crunch) +
    Math.max(0, flavors.nostalgia) +
    Math.max(0, flavors.static) +
    Math.max(0, flavors.chutzpah)
  );
}

export function getActiveDecreeDef(state: DeliGameState): RealityDecreeDef {
  return (
    REALITY_DECREES.find((d) => d.id === state.activeDecreeId) ?? REALITY_DECREES[0]
  );
}

export function computePendulumBladePosition(angleRad: number): {
  x: number;
  y: number;
} {
  const x =
    CONFIG.PENDULUM_PIVOT_X + Math.sin(angleRad) * CONFIG.PENDULUM_LENGTH;
  const y =
    CONFIG.PENDULUM_PIVOT_Y + Math.cos(angleRad) * CONFIG.PENDULUM_LENGTH;
  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
  };
}

function createFloatingFromTemplate(
  uid: number,
  template: IngredientTemplate,
  x: number,
  y: number,
  vx: number,
  vy: number,
  isGilded = false
): FloatingIngredient {
  return {
    uid,
    templateId: template.id,
    name: template.name,
    symbol: template.symbol,
    tier: template.tier,
    color: template.color,
    glowColor: template.glowColor,
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    vx: Number(vx.toFixed(2)),
    vy: Number(vy.toFixed(2)),
    radius: template.radius,
    bounciness: template.bounciness,
    flavors: { ...template.flavors },
    slicedBonusAxis: template.slicedBonusAxis,
    isSlicedHalf: false,
    isGilded,
    isHazard: Boolean(template.isHazard),
    bounceCount: 0,
    whisper: template.whisper,
    whisperTimerMs: 2800,
    ageMs: 0,
  };
}

function createPatronForBooth(
  boothIndex: number,
  feverTier: number,
  rng: ReturnType<typeof createSeededRng>,
  forceBoss = false
): PatronBoothState {
  const diff = getDifficultyForLevel(feverTier);
  const nonBossPool = PATRON_ARCHETYPES.filter((p) => !p.isBossAuditor);
  const bossArchetype = PATRON_ARCHETYPES.find((p) => p.isBossAuditor)!;

  const chosen: PatronArchetype = forceBoss
    ? bossArchetype
    : rng.pick(nonBossPool);

  const scaleMult = 1 + Math.min(1.2, (feverTier - 1) * 0.08);
  const minTotalFlavor = Math.round(chosen.minTotalFlavor * scaleMult);
  const patienceMs = chosen.isBossAuditor
    ? Math.round(diff.patronPatienceMs * 1.15)
    : diff.patronPatienceMs;

  return {
    boothIndex,
    archetypeId: chosen.id,
    name: chosen.name,
    title: chosen.title,
    avatarEmoji: chosen.avatarEmoji,
    eyeCount: chosen.eyeCount,
    auraColor: chosen.auraColor,
    primaryAxis: chosen.primaryAxis,
    secondaryAxis: chosen.secondaryAxis,
    minTotalFlavor,
    baseRewardCoins: chosen.baseRewardCoins,
    baseScore: chosen.baseScore,
    patienceMs,
    maxPatienceMs: patienceMs,
    activeQuote: rng.pick(chosen.greetingQuotes),
    isBossAuditor: Boolean(chosen.isBossAuditor),
    servedCountInBooth: 0,
  };
}

export function createInitialState(
  seed: number = CONFIG.DEFAULT_SEED
): DeliGameState {
  const cleanSeed = (seed >>> 0) || CONFIG.DEFAULT_SEED;
  const rng = createSeededRng(cleanSeed);

  const initialAngle = -0.55;
  const bladePos = computePendulumBladePosition(initialAngle);

  const booths: PatronBoothState[] = [];
  for (let b = 0; b < CONFIG.NUM_BOOTHS; b++) {
    booths.push(createPatronForBooth(b, 1, rng, false));
  }

  const ingredients: FloatingIngredient[] = [];
  let nextUid = 1;

  // Spawn 4 initial surreal ingredients so the player can grab, slice, splice, or dunk within 1 second!
  const starterPositions = [
    { x: 210, y: 210, vx: 38, vy: -18 },
    { x: 330, y: 250, vx: -32, vy: 22 },
    { x: 520, y: 230, vx: 28, vy: 15 },
    { x: 640, y: 205, vx: -42, vy: -12 },
  ];

  for (let i = 0; i < starterPositions.length; i++) {
    const tmpl = BASE_INGREDIENTS[i % BASE_INGREDIENTS.length];
    const pos = starterPositions[i];
    ingredients.push(
      createFloatingFromTemplate(
        nextUid++,
        tmpl,
        pos.x,
        pos.y,
        pos.vx,
        pos.vy,
        false
      )
    );
  }

  const initialTicker = rng.pick(SUBCONSCIOUS_TICKER_MESSAGES);

  return {
    seed: cleanSeed,
    rngState: rng.getState(),
    status: 'PLAYING',
    elapsedMs: 0,
    score: 0,
    sanity: CONFIG.INITIAL_SANITY,
    maxSanity: CONFIG.MAX_SANITY,
    egoCoins: CONFIG.INITIAL_EGO_COINS,
    feverTier: 1,
    patronsFed: 0,
    patronsStormedOut: 0,
    comboCount: 0,
    comboMultiplier: 1,
    maxComboReached: 1,
    totalSlices: 0,
    totalSplices: 0,
    victoryUnlocked: false,
    gameOverReason: null,

    handX: CONFIG.CHAMBER_WIDTH / 2,
    handY: 280,
    heldIngredientUid: null,
    lastHandActionText: 'THE THIRD HAND AWAITS YOUR COMMAND',

    pendulumAngle: initialAngle,
    pendulumBladeX: bladePos.x,
    pendulumBladeY: bladePos.y,
    overclockPendulumMs: 0,

    activeDecreeId: 'EUCLIDEAN_LULLABY',
    decreeTimerMs: CONFIG.DECREE_DURATION_MS,
    realityDecreesSurvived: 0,
    paradoxCharge: 50,
    paradoxFreezeMs: 0,
    goldenFeverMs: 0,

    vortexFlavors: { crunch: 12, nostalgia: 12, static: 8, chutzpah: 10 },
    vortexIngredientsCount: 1,
    lastBoiledSymbols: ['🦷'],

    nextEntityUid: nextUid,
    spawnTimerMs: 1400,
    bossHazardTimerMs: 4500,
    ingredients,
    booths,
    discoveredHybrids: [],
    activeTickerText: initialTicker,
    tickerTimerMs: 9000,
    events: [],
  };
}

export function sliceIngredientEntity(
  state: DeliGameState,
  target: FloatingIngredient
): void {
  const idx = state.ingredients.findIndex((i) => i.uid === target.uid);
  if (idx === -1) return;

  if (state.heldIngredientUid === target.uid) {
    state.heldIngredientUid = null;
  }

  state.ingredients.splice(idx, 1);
  state.totalSlices += 1;

  // If it's a Bureaucratic Red-Tape Stamp hazard, slicing it vaporizes it into Ego Coins!
  if (target.isHazard) {
    state.egoCoins += 18;
    state.score += 180 * state.comboMultiplier;
    state.paradoxCharge = Math.min(
      CONFIG.PARADOX_MAX_CHARGE,
      state.paradoxCharge + 25
    );
    state.lastHandActionText = 'SHREDDED BUREAUCRATIC RED-TAPE STAMP (+18₡)!';
    state.events.push({
      type: 'HAZARD_DESTROYED',
      message: 'RED-TAPE SHREDDED! +18₡ & +25 PARADOX!',
      x: target.x,
      y: target.y,
      color: '#4ade80',
      amount: 18,
    });
    return;
  }

  const gilded = target.isGilded || state.overclockPendulumMs > 0;
  const bonusAxis = target.slicedBonusAxis;

  const makeHalf = (dir: -1 | 1): FloatingIngredient => {
    const flavors: FlavorProfile = {
      crunch: Math.round(target.flavors.crunch * 0.68),
      nostalgia: Math.round(target.flavors.nostalgia * 0.68),
      static: Math.round(target.flavors.static * 0.68),
      chutzpah: Math.round(target.flavors.chutzpah * 0.68),
    };
    flavors[bonusAxis] += gilded ? 22 : 14;

    return {
      uid: state.nextEntityUid++,
      templateId: target.templateId,
      name: `½ ${target.name.replace(/^½\s+/, '')}`,
      symbol: target.symbol,
      tier: target.tier,
      color: gilded ? '#fde047' : target.color,
      glowColor: gilded ? '#f59e0b' : target.glowColor,
      x: Number((target.x + dir * 18).toFixed(2)),
      y: Number((target.y + 6).toFixed(2)),
      vx: Number((target.vx * 0.5 + dir * 135).toFixed(2)),
      vy: Number((target.vy - 65).toFixed(2)),
      radius: Math.max(16, Math.round(target.radius * 0.82)),
      bounciness: target.bounciness,
      flavors,
      slicedBonusAxis: target.slicedBonusAxis,
      isSlicedHalf: true,
      isGilded: gilded,
      isHazard: false,
      bounceCount: target.bounceCount,
      whisper: gilded ? 'GILDED BISECTION!' : `SLICED +${bonusAxis.toUpperCase()}!`,
      whisperTimerMs: 2400,
      ageMs: 0,
    };
  };

  if (state.ingredients.length < CONFIG.MAX_FLOATING_INGREDIENTS + 3) {
    state.ingredients.push(makeHalf(-1), makeHalf(1));
  } else {
    state.ingredients.push(makeHalf(1));
  }

  state.score += (gilded ? 95 : 55) * state.comboMultiplier;
  state.paradoxCharge = Math.min(
    CONFIG.PARADOX_MAX_CHARGE,
    state.paradoxCharge + 12
  );
  state.lastHandActionText = `BISECTED ${target.name.toUpperCase()} INTO TWIN SUB-CONCEPTS!`;
  state.events.push({
    type: 'INGREDIENT_SLICED',
    message: `SLICED ${target.symbol} (+${bonusAxis.toUpperCase()})!`,
    x: target.x,
    y: target.y,
    color: gilded ? '#fde047' : target.glowColor,
  });
}

export function fuseTwoIngredients(
  state: DeliGameState,
  first: FloatingIngredient,
  second: FloatingIngredient
): FloatingIngredient | null {
  if (first.uid === second.uid || first.isHazard || second.isHazard) {
    return null;
  }

  const tmplA = ALL_INGREDIENTS_MAP.get(first.templateId) ?? BASE_INGREDIENTS[0];
  const tmplB = ALL_INGREDIENTS_MAP.get(second.templateId) ?? BASE_INGREDIENTS[1];
  const { template: resultTmpl, headline } = resolveFusionResult(tmplA, tmplB);

  const keepList = state.ingredients.filter(
    (ing) => ing.uid !== first.uid && ing.uid !== second.uid
  );
  state.ingredients = keepList;

  if (
    state.heldIngredientUid === first.uid ||
    state.heldIngredientUid === second.uid
  ) {
    state.heldIngredientUid = null;
  }

  const midX = (first.x + second.x) * 0.5;
  const midY = (first.y + second.y) * 0.5;
  const gilded =
    first.isGilded || second.isGilded || state.overclockPendulumMs > 0;

  const hybrid = createFloatingFromTemplate(
    state.nextEntityUid++,
    resultTmpl,
    midX,
    midY,
    (first.vx + second.vx) * 0.35,
    -85,
    gilded
  );

  // Preserve extra accumulated chutzpah/flavors from bounces!
  hybrid.flavors.crunch = Math.max(
    hybrid.flavors.crunch,
    Math.round((first.flavors.crunch + second.flavors.crunch) * 0.85)
  );
  hybrid.flavors.nostalgia = Math.max(
    hybrid.flavors.nostalgia,
    Math.round((first.flavors.nostalgia + second.flavors.nostalgia) * 0.85)
  );
  hybrid.flavors.static = Math.max(
    hybrid.flavors.static,
    Math.round((first.flavors.static + second.flavors.static) * 0.85)
  );
  hybrid.flavors.chutzpah = Math.max(
    hybrid.flavors.chutzpah,
    Math.round((first.flavors.chutzpah + second.flavors.chutzpah) * 0.85)
  );

  state.ingredients.push(hybrid);
  state.totalSplices += 1;

  if (!state.discoveredHybrids.includes(resultTmpl.id)) {
    state.discoveredHybrids.push(resultTmpl.id);
  }

  const pts = (resultTmpl.tier === 3 ? 420 : 210) * state.comboMultiplier;
  state.score += pts;
  state.egoCoins += resultTmpl.tier === 3 ? 16 : 8;
  state.paradoxCharge = Math.min(
    CONFIG.PARADOX_MAX_CHARGE,
    state.paradoxCharge + 22
  );
  state.lastHandActionText = headline;

  state.events.push({
    type: 'HYBRID_SYNTHESIZED',
    message: headline,
    x: midX,
    y: midY,
    color: resultTmpl.glowColor,
    amount: pts,
  });

  return hybrid;
}

export function boilIngredientIntoVortex(
  state: DeliGameState,
  ing: FloatingIngredient
): void {
  const idx = state.ingredients.findIndex((i) => i.uid === ing.uid);
  if (idx !== -1) {
    state.ingredients.splice(idx, 1);
  }
  if (state.heldIngredientUid === ing.uid) {
    state.heldIngredientUid = null;
  }

  if (ing.isHazard) {
    // Red-tape stamp contaminated the soup!
    state.sanity = Math.max(0, state.sanity - 12);
    state.vortexFlavors.crunch = Math.max(
      0,
      Math.round(state.vortexFlavors.crunch * 0.8)
    );
    state.vortexFlavors.chutzpah = Math.max(
      0,
      Math.round(state.vortexFlavors.chutzpah * 0.8)
    );
    state.comboCount = 0;
    state.comboMultiplier = 1;
    state.lastHandActionText =
      'CONTAMINATION! RED-TAPE STAMP FELL INTO THE PRIMORDIAL BROTH (-12 SANITY)!';
    state.events.push({
      type: 'HAZARD_CONTAMINATED',
      message: 'RED-TAPE CONTAMINATED THE SOUP! -12 SANITY!',
      x: CONFIG.VORTEX_X,
      y: CONFIG.VORTEX_Y,
      color: '#ef4444',
    });
    if (state.sanity <= 0) {
      state.status = 'GAME_OVER';
      state.gameOverReason =
        'Your subconscious kitchen was foreclosed by Bureaucratic Red-Tape contamination.';
      state.events.push({
        type: 'GAME_OVER',
        message: state.gameOverReason,
      });
    }
    return;
  }

  const mult =
    (ing.isGilded ? 1.5 : 1.0) * (state.goldenFeverMs > 0 ? 2.5 : 1.0);

  state.vortexFlavors.crunch += Math.round(ing.flavors.crunch * mult);
  state.vortexFlavors.nostalgia += Math.round(ing.flavors.nostalgia * mult);
  state.vortexFlavors.static += Math.round(ing.flavors.static * mult);
  state.vortexFlavors.chutzpah += Math.round(ing.flavors.chutzpah * mult);
  state.vortexIngredientsCount += 1;

  state.lastBoiledSymbols.push(ing.symbol);
  if (state.lastBoiledSymbols.length > 7) {
    state.lastBoiledSymbols.shift();
  }

  const boilScore = Math.round(
    getTotalFlavorMagnitude(ing.flavors) * 2.5 * mult * state.comboMultiplier
  );
  state.score += boilScore;
  state.paradoxCharge = Math.min(
    CONFIG.PARADOX_MAX_CHARGE,
    state.paradoxCharge + 14
  );

  // Special bonus if boiling the Pocket IRS Apparition: converts into Deductible Bisque (+12 Ego Coins!)
  if (ing.templateId === 'tax_auditor') {
    state.egoCoins += 12;
    state.lastHandActionText =
      'BOILED IRS APPARITION INTO TAX-DEDUCTIBLE BISQUE (+12₡)!';
  } else {
    state.lastHandActionText = `BOILED ${ing.symbol} ${ing.name.toUpperCase()} INTO THE PRIMORDIAL VORTEX!`;
  }

  state.events.push({
    type: 'BROTH_BOILED',
    message: `BOILED ${ing.symbol} ${ing.name}! (+${boilScore} PTS)`,
    x: CONFIG.VORTEX_X,
    y: CONFIG.VORTEX_Y,
    color: ing.glowColor,
    amount: boilScore,
  });
}

export function evaluateBoothHarmony(
  flavors: FlavorProfile,
  booth: PatronBoothState
): {
  totalRaw: number;
  weightedHarmony: number;
  isSatisfied: boolean;
  primaryMatch: number;
  secondaryMatch: number;
} {
  const totalRaw = getTotalFlavorMagnitude(flavors);
  const primaryMatch = flavors[booth.primaryAxis];
  const secondaryMatch = flavors[booth.secondaryAxis];

  const weightedHarmony = Math.round(
    totalRaw + primaryMatch * 0.65 + secondaryMatch * 0.35
  );
  const isSatisfied = totalRaw >= booth.minTotalFlavor;

  return {
    totalRaw,
    weightedHarmony,
    isSatisfied,
    primaryMatch,
    secondaryMatch,
  };
}

export function servePatronBooth(
  state: DeliGameState,
  requestedBoothIndex?: number
): boolean {
  const totalSoup = getTotalFlavorMagnitude(state.vortexFlavors);
  if (totalSoup < 15 || state.booths.length === 0) {
    state.lastHandActionText =
      'THE VAT IS TOO THIN! BOIL MORE SURREAL INGREDIENTS FIRST!';
    return false;
  }

  const rng = createSeededRng(state.rngState);

  let targetBooth: PatronBoothState | undefined;
  if (
    typeof requestedBoothIndex === 'number' &&
    state.booths[requestedBoothIndex]
  ) {
    targetBooth = state.booths[requestedBoothIndex];
  } else {
    // Pick the booth with the best satisfaction / harmony match!
    const ranked = [...state.booths].sort((a, b) => {
      const evalA = evaluateBoothHarmony(state.vortexFlavors, a);
      const evalB = evaluateBoothHarmony(state.vortexFlavors, b);
      if (evalA.isSatisfied !== evalB.isSatisfied) {
        return evalA.isSatisfied ? -1 : 1;
      }
      return evalB.weightedHarmony - evalA.weightedHarmony;
    });
    targetBooth = ranked[0];
  }

  if (!targetBooth) return false;

  const harmony = evaluateBoothHarmony(state.vortexFlavors, targetBooth);
  const archetype =
    PATRON_ARCHETYPES.find((p) => p.id === targetBooth.archetypeId) ??
    PATRON_ARCHETYPES[0];

  // Calculate reward based on whether full craving threshold was met or partial snack
  const qualityRatio = Math.min(
    2.5,
    Math.max(0.45, harmony.weightedHarmony / Math.max(1, targetBooth.minTotalFlavor))
  );

  state.comboCount += 1;
  state.comboMultiplier = Math.min(8, 1 + Math.floor(state.comboCount / 2));
  state.maxComboReached = Math.max(state.maxComboReached, state.comboMultiplier);

  const feverMult = state.goldenFeverMs > 0 ? 2.5 : 1.0;
  const earnedCoins = Math.max(
    6,
    Math.round(targetBooth.baseRewardCoins * qualityRatio * (state.goldenFeverMs > 0 ? 1.5 : 1))
  );
  const earnedScore = Math.round(
    targetBooth.baseScore * qualityRatio * state.comboMultiplier * feverMult
  );

  state.egoCoins += earnedCoins;
  state.score += earnedScore;
  state.sanity = Math.min(
    state.maxSanity,
    state.sanity +
      (harmony.isSatisfied
        ? CONFIG.SERVE_SANITY_RESTORE
        : Math.round(CONFIG.SERVE_SANITY_RESTORE * 0.5))
  );
  state.patronsFed += 1;

  // Level up Fever Tier every PATRONS_PER_FEVER_TIER patrons
  const newFeverTier = Math.min(
    CONFIG.MAX_DIFFICULTY_LEVEL,
    1 + Math.floor(state.patronsFed / CONFIG.PATRONS_PER_FEVER_TIER)
  );
  const leveledUp = newFeverTier > state.feverTier;
  state.feverTier = newFeverTier;

  const satisfiedQuote = rng.pick(archetype.satisfiedQuotes);
  state.lastHandActionText = `SERVED ${targetBooth.name.toUpperCase()}: "${satisfiedQuote}" (+${earnedCoins}₡, +${earnedScore} PTS)`;

  state.events.push({
    type: 'PATRON_SERVED',
    message: `SERVED BOOTH #${targetBooth.boothIndex + 1}! +${earnedCoins}₡ · x${state.comboMultiplier} COMBO!`,
    x: 160 + targetBooth.boothIndex * 260,
    y: 70,
    color: targetBooth.auraColor,
    amount: earnedScore,
  });

  if (
    !state.victoryUnlocked &&
    state.patronsFed >= CONFIG.PATRONS_FOR_VICTORY
  ) {
    state.victoryUnlocked = true;
    state.egoCoins += 50;
    state.score += 1500;
    state.events.push({
      type: 'VICTORY_UNLOCKED',
      message:
        'TRANSCENDENTAL CULINARY LICENSE GRANTED! 12 SURREAL ENTITIES FED! ENDLESS FEVER UNLOCKED!',
      x: CONFIG.CHAMBER_WIDTH / 2,
      y: CONFIG.CHAMBER_HEIGHT / 2,
      color: '#fde047',
      amount: 1500,
    });
  }

  // Reset the Primordial Broth Vortex with a simmering starter residue
  state.vortexFlavors = {
    crunch: Math.round(state.vortexFlavors.crunch * 0.15),
    nostalgia: Math.round(state.vortexFlavors.nostalgia * 0.15),
    static: Math.round(state.vortexFlavors.static * 0.15),
    chutzpah: Math.round(state.vortexFlavors.chutzpah * 0.15),
  };
  state.vortexIngredientsCount = 0;
  state.lastBoiledSymbols = [];

  // Spawn next patron in this booth (spawn Boss Auditor at Fever Tiers 4 or 8 if none active!)
  const hasActiveBoss = state.booths.some(
    (b, idx) => idx !== targetBooth!.boothIndex && b.isBossAuditor
  );
  const shouldSpawnBoss =
    !hasActiveBoss && (state.feverTier === 4 || state.feverTier === 8 || leveledUp && state.feverTier % 4 === 0);

  const nextPatron = createPatronForBooth(
    targetBooth.boothIndex,
    state.feverTier,
    rng,
    shouldSpawnBoss
  );
  nextPatron.servedCountInBooth = targetBooth.servedCountInBooth + 1;
  state.booths[targetBooth.boothIndex] = nextPatron;

  if (nextPatron.isBossAuditor) {
    state.events.push({
      type: 'BOSS_AUDITOR_ARRIVED',
      message:
        'ALERT: THE GRAND COMPTROLLER OF THE SUBCONSCIOUS HAS ENTERED FOR AN ONTOLOGICAL AUDIT!',
      x: CONFIG.CHAMBER_WIDTH / 2,
      y: 90,
      color: '#f43f5e',
    });
  }

  state.rngState = rng.getState();
  return true;
}

export function applyInput(
  state: DeliGameState,
  action: DeliInputAction
): void {
  if (action.type === 'TOGGLE_PAUSE') {
    if (state.status === 'PLAYING') {
      state.status = 'PAUSED';
    } else if (state.status === 'PAUSED') {
      state.status = 'PLAYING';
    }
    return;
  }

  if (state.status !== 'PLAYING') return;

  switch (action.type) {
    case 'SET_HAND_POS': {
      state.handX = Math.max(
        40,
        Math.min(CONFIG.CHAMBER_WIDTH - 40, action.x)
      );
      state.handY = Math.max(
        105,
        Math.min(CONFIG.CHAMBER_HEIGHT - 36, action.y)
      );
      if (state.heldIngredientUid !== null) {
        const held = state.ingredients.find(
          (i) => i.uid === state.heldIngredientUid
        );
        if (held) {
          held.x = state.handX;
          held.y = state.handY;
          held.vx = 0;
          held.vy = 0;
        }
      }
      break;
    }

    case 'NUDGE_HAND': {
      state.handX = Math.max(
        40,
        Math.min(CONFIG.CHAMBER_WIDTH - 40, state.handX + action.dx)
      );
      state.handY = Math.max(
        105,
        Math.min(CONFIG.CHAMBER_HEIGHT - 36, state.handY + action.dy)
      );
      if (state.heldIngredientUid !== null) {
        const held = state.ingredients.find(
          (i) => i.uid === state.heldIngredientUid
        );
        if (held) {
          held.x = state.handX;
          held.y = state.handY;
          held.vx = 0;
          held.vy = 0;
        }
      }
      break;
    }

    case 'GRAB_OR_FLING': {
      if (state.heldIngredientUid !== null) {
        const held = state.ingredients.find(
          (i) => i.uid === state.heldIngredientUid
        );
        state.heldIngredientUid = null;
        if (held) {
          const tx = action.targetX ?? CONFIG.VORTEX_X;
          const ty = action.targetY ?? CONFIG.VORTEX_Y;
          const dx = tx - held.x;
          const dy = ty - held.y;
          const dist = Math.hypot(dx, dy) || 1;
          held.vx = Number(((dx / dist) * CONFIG.HAND_FLING_SPEED).toFixed(2));
          held.vy = Number(((dy / dist) * CONFIG.HAND_FLING_SPEED).toFixed(2));
          state.lastHandActionText = `FLUNG ${held.symbol} ${held.name.toUpperCase()} AT MACH-SOUP!`;
          state.events.push({
            type: 'INGREDIENT_FLUNG',
            message: `FLUNG ${held.symbol}!`,
            x: held.x,
            y: held.y,
            color: held.glowColor,
          });
        }
        return;
      }

      if (state.ingredients.length === 0) return;

      // Find nearest ingredient to The Third Hand (magnetic tractor grab!)
      let nearest = state.ingredients[0];
      let bestDist = Math.hypot(
        nearest.x - state.handX,
        nearest.y - state.handY
      );
      for (const ing of state.ingredients) {
        const d = Math.hypot(ing.x - state.handX, ing.y - state.handY);
        if (d < bestDist) {
          bestDist = d;
          nearest = ing;
        }
      }

      state.heldIngredientUid = nearest.uid;
      nearest.x = state.handX;
      nearest.y = state.handY;
      nearest.vx = 0;
      nearest.vy = 0;
      state.lastHandActionText = `GRABBED ${nearest.symbol} ${nearest.name.toUpperCase()} ("${nearest.whisper}")`;
      state.events.push({
        type: 'INGREDIENT_GRABBED',
        message: `GRABBED ${nearest.symbol} ${nearest.name}`,
        x: nearest.x,
        y: nearest.y,
        color: nearest.glowColor,
      });
      break;
    }

    case 'DUNK_NEAREST': {
      // Dunk held ingredient or nearest non-hazard ingredient directly into the Primordial Broth Vortex!
      let target: FloatingIngredient | undefined;
      if (state.heldIngredientUid !== null) {
        target = state.ingredients.find(
          (i) => i.uid === state.heldIngredientUid
        );
      }
      if (!target) {
        const nonHazards = state.ingredients.filter((i) => !i.isHazard);
        if (nonHazards.length > 0) {
          nonHazards.sort(
            (a, b) =>
              Math.hypot(a.x - state.handX, a.y - state.handY) -
              Math.hypot(b.x - state.handX, b.y - state.handY)
          );
          target = nonHazards[0];
        }
      }
      if (target) {
        boilIngredientIntoVortex(state, target);
      }
      break;
    }

    case 'SLICE_PULSE': {
      if (state.ingredients.length === 0) return;
      // Slice either held ingredient or the 2 closest ingredients to the hand / pendulum blade!
      const candidates = [...state.ingredients].sort((a, b) => {
        const dA = Math.min(
          Math.hypot(a.x - state.handX, a.y - state.handY),
          Math.hypot(a.x - state.pendulumBladeX, a.y - state.pendulumBladeY)
        );
        const dB = Math.min(
          Math.hypot(b.x - state.handX, b.y - state.handY),
          Math.hypot(b.x - state.pendulumBladeX, b.y - state.pendulumBladeY)
        );
        return dA - dB;
      });
      const toSlice = candidates.slice(0, 2);
      for (const item of toSlice) {
        sliceIngredientEntity(state, item);
      }
      break;
    }

    case 'TRANSMOGRIFY_SPLICE': {
      const nonHazards = state.ingredients.filter((i) => !i.isHazard);
      if (nonHazards.length < 2) {
        state.lastHandActionText =
          'NEED AT LEAST 2 INGREDIENTS IN THE CHAMBER TO SPLICE A FORBIDDEN HYBRID!';
        return;
      }
      nonHazards.sort(
        (a, b) =>
          Math.hypot(a.x - state.handX, a.y - state.handY) -
          Math.hypot(b.x - state.handX, b.y - state.handY)
      );
      fuseTwoIngredients(state, nonHazards[0], nonHazards[1]);
      break;
    }

    case 'SERVE_BOOTH': {
      servePatronBooth(state, action.boothIndex);
      break;
    }

    case 'PARADOX_FREEZE': {
      if (state.paradoxCharge < 35) {
        state.lastHandActionText = `PARADOX CAPACITOR AT ${Math.floor(state.paradoxCharge)}% (NEED 35% TO FREEZE TIME)!`;
        return;
      }
      state.paradoxCharge = 0;
      state.paradoxFreezeMs = CONFIG.PARADOX_FREEZE_DURATION_MS;
      // Pull all non-hazard ingredients toward the Vortex and vaporize any active Red-Tape hazards!
      for (const ing of [...state.ingredients]) {
        if (ing.isHazard) {
          sliceIngredientEntity(state, ing);
        } else {
          const dx = CONFIG.VORTEX_X - ing.x;
          const dy = CONFIG.VORTEX_Y - ing.y;
          ing.vx = Number((dx * 0.9).toFixed(2));
          ing.vy = Number((dy * 0.9).toFixed(2));
        }
      }
      state.lastHandActionText =
        'PARADOX PULSE ENGAGED! TIME FROZEN & INGREDIENTS MAGNETIZED TO VORTEX!';
      state.events.push({
        type: 'PARADOX_ACTIVATED',
        message: 'PARADOX TIME-FREEZE ENGAGED!',
        x: state.handX,
        y: state.handY,
        color: '#38bdf8',
      });
      break;
    }

    case 'VENDING_ACTION': {
      const rng = createSeededRng(state.rngState);
      if (action.item === 'SUMMON_ANOMALY') {
        if (state.egoCoins < CONFIG.COST_SUMMON_ANOMALY) {
          state.lastHandActionText = `NEED ${CONFIG.COST_SUMMON_ANOMALY}₡ TO SUMMON ANOMALY INGREDIENT!`;
          return;
        }
        state.egoCoins -= CONFIG.COST_SUMMON_ANOMALY;
        const hybridTmpl = rng.pick(HYBRID_INGREDIENTS);
        const baseTmpl = rng.pick(BASE_INGREDIENTS);
        state.ingredients.push(
          createFloatingFromTemplate(
            state.nextEntityUid++,
            hybridTmpl,
            280 + rng.nextInt(-60, 60),
            190,
            rng.nextInt(-50, 50),
            20,
            true
          ),
          createFloatingFromTemplate(
            state.nextEntityUid++,
            baseTmpl,
            540 + rng.nextInt(-60, 60),
            190,
            rng.nextInt(-50, 50),
            20,
            false
          )
        );
        state.lastHandActionText = `VENDING MACHINE DISPENSED GILDED ${hybridTmpl.name.toUpperCase()}!`;
        state.events.push({
          type: 'VENDING_PURCHASED',
          message: `DISPENSED GILDED ${hybridTmpl.symbol} ${hybridTmpl.name}!`,
          x: CONFIG.CHAMBER_WIDTH / 2,
          y: 190,
          color: '#fde047',
        });
      } else if (action.item === 'OVERCLOCK_PENDULUM') {
        if (state.egoCoins < CONFIG.COST_OVERCLOCK_PENDULUM) {
          state.lastHandActionText = `NEED ${CONFIG.COST_OVERCLOCK_PENDULUM}₡ TO OVERCLOCK LASER PENDULUM!`;
          return;
        }
        state.egoCoins -= CONFIG.COST_OVERCLOCK_PENDULUM;
        state.overclockPendulumMs = 12000;
        state.lastHandActionText =
          'PENDULUM OVERCLOCKED FOR 12s! ALL SLICED HALVES BECOME GILDED (1.5x)!';
        state.events.push({
          type: 'VENDING_PURCHASED',
          message: 'GILDED LASER PENDULUM OVERCLOCK (12s)!',
          x: CONFIG.PENDULUM_PIVOT_X,
          y: CONFIG.PENDULUM_PIVOT_Y + 80,
          color: '#f59e0b',
        });
      } else if (action.item === 'POUR_LIQUID_FRIDAY') {
        if (state.egoCoins < CONFIG.COST_LIQUID_FRIDAY) {
          state.lastHandActionText = `NEED ${CONFIG.COST_LIQUID_FRIDAY}₡ TO POUR LIQUID FRIDAY!`;
          return;
        }
        state.egoCoins -= CONFIG.COST_LIQUID_FRIDAY;
        state.sanity = Math.min(state.maxSanity, state.sanity + 20);
        state.vortexFlavors.nostalgia += 32;
        state.vortexFlavors.chutzpah += 22;
        for (const booth of state.booths) {
          booth.patienceMs = booth.maxPatienceMs;
        }
        state.lastHandActionText =
          'POURED LIQUID FRIDAY! PATRONS PACIFIED, +20 SANITY, +32 NOSTALGIA & +22 CHUTZPAH!';
        state.events.push({
          type: 'VENDING_PURCHASED',
          message: 'LIQUID FRIDAY POURED! +20 SANITY & PATRONS CALMED!',
          x: CONFIG.VORTEX_X,
          y: CONFIG.VORTEX_Y,
          color: '#38bdf8',
        });
      } else if (action.item === 'INVERT_DECREE') {
        if (state.egoCoins < CONFIG.COST_INVERT_DECREE) {
          state.lastHandActionText = `NEED ${CONFIG.COST_INVERT_DECREE}₡ TO INVERT REALITY DECREE!`;
          return;
        }
        state.egoCoins -= CONFIG.COST_INVERT_DECREE;
        state.goldenFeverMs = 10000;
        const nextDecree = rng.pick(REALITY_DECREES);
        state.activeDecreeId = nextDecree.id;
        state.decreeTimerMs = CONFIG.DECREE_DURATION_MS;
        state.lastHandActionText =
          'ONTOLOGICAL INVERTER FIRED! 2.5x GOLDEN FEVER FOR 10 SECONDS!';
        state.events.push({
          type: 'VENDING_PURCHASED',
          message: '2.5x GOLDEN FEVER ENGAGED FOR 10s!',
          x: CONFIG.CHAMBER_WIDTH / 2,
          y: CONFIG.CHAMBER_HEIGHT / 2,
          color: '#fde047',
        });
      }
      state.rngState = rng.getState();
      break;
    }
  }
}

export function stepDeliState(state: DeliGameState, dtMs: number): void {
  if (state.status !== 'PLAYING' || dtMs <= 0) return;

  const dtSec = dtMs / 1000;
  state.elapsedMs += dtMs;

  const rng = createSeededRng(state.rngState);
  const diff = getDifficultyForLevel(state.feverTier);
  const decree = getActiveDecreeDef(state);

  if (state.overclockPendulumMs > 0) {
    state.overclockPendulumMs = Math.max(0, state.overclockPendulumMs - dtMs);
  }
  if (state.paradoxFreezeMs > 0) {
    state.paradoxFreezeMs = Math.max(0, state.paradoxFreezeMs - dtMs);
  }
  if (state.goldenFeverMs > 0) {
    state.goldenFeverMs = Math.max(0, state.goldenFeverMs - dtMs);
  }

  // Rotate Subconscious Ticker
  state.tickerTimerMs -= dtMs;
  if (state.tickerTimerMs <= 0) {
    state.tickerTimerMs = 8500;
    state.activeTickerText = rng.pick(SUBCONSCIOUS_TICKER_MESSAGES);
  }

  // Rotate Reality Decrees from the Ministry of Unlicensed Ontology
  state.decreeTimerMs -= dtMs;
  if (state.decreeTimerMs <= 0) {
    state.decreeTimerMs = CONFIG.DECREE_DURATION_MS;
    state.realityDecreesSurvived += 1;
    const otherDecrees = REALITY_DECREES.filter(
      (d) => d.id !== state.activeDecreeId
    );
    const nextDecree = rng.pick(otherDecrees);
    state.activeDecreeId = nextDecree.id;
    state.lastHandActionText = `${nextDecree.title}: ${nextDecree.description}`;
    state.events.push({
      type: 'DECREE_SHIFTED',
      message: `${nextDecree.title} [${nextDecree.ministryCode}]`,
      x: CONFIG.CHAMBER_WIDTH / 2,
      y: 125,
      color: nextDecree.bannerColor,
    });
  }

  // Update the Non-Euclidean Laser Pendulum
  const pendMult =
    decree.pendulumSpeedMult * (state.overclockPendulumMs > 0 ? 1.45 : 1.0);
  const angularVel = diff.pendulumSpeedRadPerSec * pendMult;
  const phase = (state.elapsedMs / 1000) * angularVel;
  state.pendulumAngle = Number((Math.sin(phase) * 1.08).toFixed(4));
  const bladePos = computePendulumBladePosition(state.pendulumAngle);
  state.pendulumBladeX = bladePos.x;
  state.pendulumBladeY = bladePos.y;

  // Spawn new Living Ingredients
  state.spawnTimerMs -= dtMs;
  if (
    state.spawnTimerMs <= 0 &&
    state.ingredients.length < CONFIG.MAX_FLOATING_INGREDIENTS
  ) {
    state.spawnTimerMs = diff.spawnIntervalMs;
    const isRareHybrid = rng.nextFloat() < 0.14;
    const tmpl = isRareHybrid
      ? rng.pick(HYBRID_INGREDIENTS.filter((h) => h.tier === 2))
      : rng.pick(BASE_INGREDIENTS);

    const spawnX = rng.nextInt(95, CONFIG.CHAMBER_WIDTH - 95);
    const spawnY = rng.nextInt(135, 225);
    const vx = rng.nextInt(-85, 86);
    const vy = rng.nextInt(-30, 45);

    const spawned = createFloatingFromTemplate(
      state.nextEntityUid++,
      tmpl,
      spawnX,
      spawnY,
      vx,
      vy,
      state.goldenFeverMs > 0
    );
    state.ingredients.push(spawned);
    state.events.push({
      type: 'INGREDIENT_SPAWNED',
      message: `SPAWNED ${spawned.symbol} ${spawned.name}`,
      x: spawnX,
      y: spawnY,
      color: spawned.glowColor,
    });
  }

  // If Boss Auditor is present in any booth, periodically fire Red-Tape Stamp Hazards!
  const activeBoss = state.booths.find((b) => b.isBossAuditor);
  if (activeBoss && state.paradoxFreezeMs <= 0) {
    state.bossHazardTimerMs -= dtMs;
    if (
      state.bossHazardTimerMs <= 0 &&
      state.ingredients.length < CONFIG.MAX_FLOATING_INGREDIENTS + 2
    ) {
      state.bossHazardTimerMs = Math.max(2400, 4800 - state.feverTier * 150);
      const hazardTmpl = HAZARD_INGREDIENTS[0];
      const bossX = 160 + activeBoss.boothIndex * 260;
      const dx = CONFIG.VORTEX_X - bossX;
      const dy = CONFIG.VORTEX_Y - 120;
      const dist = Math.hypot(dx, dy) || 1;
      const speed = 135;
      const hazard = createFloatingFromTemplate(
        state.nextEntityUid++,
        hazardTmpl,
        bossX,
        130,
        (dx / dist) * speed,
        (dy / dist) * speed,
        false
      );
      state.ingredients.push(hazard);
    }
  }

  // Step Physics for Floating Ingredients
  const minX = 36;
  const maxX = CONFIG.CHAMBER_WIDTH - 36;
  const minY = 115;
  const maxY = CONFIG.CHAMBER_HEIGHT - 34;

  const toSlice: FloatingIngredient[] = [];
  const toBoil: FloatingIngredient[] = [];

  for (const ing of state.ingredients) {
    ing.ageMs += dtMs;
    if (ing.whisperTimerMs > 0) {
      ing.whisperTimerMs = Math.max(0, ing.whisperTimerMs - dtMs);
    }

    if (state.heldIngredientUid === ing.uid) {
      ing.x = state.handX;
      ing.y = state.handY;
      ing.vx = 0;
      ing.vy = 0;
      continue;
    }

    if (state.paradoxFreezeMs > 0) {
      // During Paradox Freeze, ingredients gently spiral into the Broth Vortex!
      const dx = CONFIG.VORTEX_X - ing.x;
      const dy = CONFIG.VORTEX_Y - ing.y;
      ing.x = Number((ing.x + dx * dtSec * 1.8).toFixed(2));
      ing.y = Number((ing.y + dy * dtSec * 1.8).toFixed(2));
    } else {
      // Apply Reality Decree Gravity
      ing.vx += decree.gravityX * dtSec;
      ing.vy += decree.gravityY * dtSec;

      // If PARANOID_PANTRY decree is active, ingredients actively flee The Third Hand!
      if (decree.ingredientsFleeHand && !ing.isHazard) {
        const hdx = ing.x - state.handX;
        const hdy = ing.y - state.handY;
        const hDist = Math.hypot(hdx, hdy);
        if (hDist > 1 && hDist < 165) {
          ing.vx += (hdx / hDist) * 190 * dtSec;
          ing.vy += (hdy / hDist) * 190 * dtSec;
        }
      }

      // Gentle vortex suction when near the bottom cauldron
      const vdx = CONFIG.VORTEX_X - ing.x;
      const vdy = CONFIG.VORTEX_Y - ing.y;
      const vDist = Math.hypot(vdx, vdy);
      if (vDist < CONFIG.VORTEX_RADIUS * 2.1 && vDist > 1) {
        const pull = 125 * (1 - vDist / (CONFIG.VORTEX_RADIUS * 2.1));
        ing.vx += (vdx / vDist) * pull * dtSec;
        ing.vy += (vdy / vDist) * pull * dtSec;
      }

      // Clamp max velocity
      const spd = Math.hypot(ing.vx, ing.vy);
      if (spd > 620) {
        ing.vx = (ing.vx / spd) * 620;
        ing.vy = (ing.vy / spd) * 620;
      }

      ing.x = Number((ing.x + ing.vx * dtSec).toFixed(2));
      ing.y = Number((ing.y + ing.vy * dtSec).toFixed(2));

      // Wall bounces with Decree Chutzpah injection!
      let bounced = false;
      if (ing.x - ing.radius < minX) {
        ing.x = minX + ing.radius;
        ing.vx = Math.abs(ing.vx) * ing.bounciness;
        bounced = true;
      } else if (ing.x + ing.radius > maxX) {
        ing.x = maxX - ing.radius;
        ing.vx = -Math.abs(ing.vx) * ing.bounciness;
        bounced = true;
      }

      if (ing.y - ing.radius < minY) {
        ing.y = minY + ing.radius;
        ing.vy = Math.abs(ing.vy) * ing.bounciness;
        bounced = true;
      } else if (ing.y + ing.radius > maxY) {
        ing.y = maxY - ing.radius;
        ing.vy = -Math.abs(ing.vy) * ing.bounciness;
        bounced = true;
      }

      if (bounced && !ing.isHazard) {
        ing.bounceCount += 1;
        ing.flavors.chutzpah += decree.bounceChutzpahBonus;
      }
    }

    // Check Laser Pendulum Blade intersection (slices unsliced ingredients or hazards!)
    const bladeDist = Math.hypot(
      ing.x - state.pendulumBladeX,
      ing.y - state.pendulumBladeY
    );
    if (
      bladeDist <= ing.radius + CONFIG.PENDULUM_BLADE_RADIUS &&
      (!ing.isSlicedHalf || ing.isHazard) &&
      ing.ageMs > 350
    ) {
      toSlice.push(ing);
      continue;
    }

    // Check Primordial Broth Vortex immersion
    const vortexDist = Math.hypot(
      ing.x - CONFIG.VORTEX_X,
      ing.y - CONFIG.VORTEX_Y
    );
    if (vortexDist <= CONFIG.VORTEX_RADIUS) {
      toBoil.push(ing);
    }
  }

  for (const item of toSlice) {
    sliceIngredientEntity(state, item);
  }

  for (const item of toBoil) {
    boilIngredientIntoVortex(state, item);
    if ((state.status as DeliGameStatus) === 'GAME_OVER') {
      state.rngState = rng.getState();
      return;
    }
  }

  // Check pairwise High-Velocity Ingredient Collisions for Automatic Fusion!
  outer: for (let i = 0; i < state.ingredients.length; i++) {
    const a = state.ingredients[i];
    if (a.isHazard || a.ageMs < 250) continue;
    for (let j = i + 1; j < state.ingredients.length; j++) {
      const b = state.ingredients[j];
      if (b.isHazard || b.ageMs < 250) continue;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist <= a.radius + b.radius) {
        const relSpeed = Math.hypot(a.vx - b.vx, a.vy - b.vy);
        if (relSpeed >= 185 && a.tier < 3 && b.tier < 3) {
          fuseTwoIngredients(state, a, b);
          break outer;
        } else {
          // Elastic nudge apart
          const nx = (b.x - a.x) / (dist || 1);
          const ny = (b.y - a.y) / (dist || 1);
          a.vx -= nx * 45;
          a.vy -= ny * 45;
          b.vx += nx * 45;
          b.vy += ny * 45;
        }
      }
    }
  }

  // Step Patron Booth Patience Timers
  if (state.paradoxFreezeMs <= 0) {
    for (let b = 0; b < state.booths.length; b++) {
      const booth = state.booths[b];
      booth.patienceMs -= dtMs;

      if (
        booth.patienceMs <= booth.maxPatienceMs * 0.35 &&
        booth.patienceMs + dtMs > booth.maxPatienceMs * 0.35
      ) {
        const arch =
          PATRON_ARCHETYPES.find((p) => p.id === booth.archetypeId) ??
          PATRON_ARCHETYPES[0];
        booth.activeQuote = rng.pick(arch.impatientQuotes);
      }

      if (booth.patienceMs <= 0) {
        // Patron storms out of the subconscious deli!
        state.patronsStormedOut += 1;
        state.comboCount = 0;
        state.comboMultiplier = 1;
        const penalty = booth.isBossAuditor
          ? CONFIG.PATRON_IMPATIENCE_SANITY_PENALTY + 10
          : CONFIG.PATRON_IMPATIENCE_SANITY_PENALTY;
        state.sanity = Math.max(0, state.sanity - penalty);
        state.lastHandActionText = `${booth.name.toUpperCase()} STORMED OUT IN EXISTENTIAL FURY (-${penalty} SANITY)!`;

        state.events.push({
          type: 'PATRON_STORMED_OUT',
          message: `BOOTH #${b + 1} STORMED OUT! -${penalty} EGO SANITY!`,
          x: 160 + b * 260,
          y: 70,
          color: '#ef4444',
        });

        if (state.sanity <= 0) {
          state.status = 'GAME_OVER';
          state.gameOverReason = `${booth.name} revoked your Deli Ontology Permit after Ego Sanity hit 0.`;
          state.events.push({
            type: 'GAME_OVER',
            message: state.gameOverReason,
          });
          state.rngState = rng.getState();
          return;
        }

        state.booths[b] = createPatronForBooth(b, state.feverTier, rng, false);
      }
    }
  }

  state.rngState = rng.getState();
}
