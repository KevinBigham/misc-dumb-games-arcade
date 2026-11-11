import { FlavorAxis, FlavorProfile } from './config';

export interface IngredientTemplate {
  id: string;
  name: string;
  symbol: string;
  tier: 1 | 2 | 3;
  color: string;
  glowColor: string;
  flavors: FlavorProfile;
  radius: number;
  bounciness: number;
  sliceIntoId?: string;
  slicedBonusAxis: FlavorAxis;
  whisper: string;
  lore: string;
  isHazard?: boolean;
}

export interface FusionRecipe {
  id: string;
  ingredientA: string;
  ingredientB: string;
  resultId: string;
  discoveryHeadline: string;
}

export interface PatronArchetype {
  id: string;
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
  greetingQuotes: readonly string[];
  satisfiedQuotes: readonly string[];
  impatientQuotes: readonly string[];
  isBossAuditor?: boolean;
}

export type RealityDecreeId =
  | 'EUCLIDEAN_LULLABY'
  | 'LATERAL_PINBALL'
  | 'CEILING_DRIP'
  | 'MANDATORY_JAZZ_TAX'
  | 'PARANOID_PANTRY'
  | 'HYPER_PENDULUM';

export interface RealityDecreeDef {
  id: RealityDecreeId;
  title: string;
  ministryCode: string;
  description: string;
  gravityX: number;
  gravityY: number;
  bounceChutzpahBonus: number;
  pendulumSpeedMult: number;
  ingredientsFleeHand: boolean;
  bannerColor: string;
}

export const BASE_INGREDIENTS: readonly IngredientTemplate[] = [
  {
    id: 'baby_tooth',
    name: 'Sentient Baby Tooth',
    symbol: '🦷',
    tier: 1,
    color: '#fef08a',
    glowColor: '#facc15',
    flavors: { crunch: 26, nostalgia: 10, static: 2, chutzpah: 6 },
    radius: 23,
    bounciness: 0.86,
    slicedBonusAxis: 'crunch',
    whisper: 'I remember chewing 1998!',
    lore: 'Still holds a grudge against the Tooth Fairy for paying only $0.50.',
  },
  {
    id: 'melting_watch',
    name: "Salvador's Pocketwatch",
    symbol: '🕰️',
    tier: 1,
    color: '#fbbf24',
    glowColor: '#f59e0b',
    flavors: { crunch: 6, nostalgia: 28, static: 4, chutzpah: 8 },
    radius: 25,
    bounciness: 0.72,
    slicedBonusAxis: 'nostalgia',
    whisper: 'It is currently 4:73 PM.',
    lore: 'Drips warm Tuesday afternoons onto the linoleum floor.',
  },
  {
    id: 'jazz_lobster',
    name: 'Bebop Cocktail Lobster',
    symbol: '🦞',
    tier: 1,
    color: '#fb7185',
    glowColor: '#f43f5e',
    flavors: { crunch: 12, nostalgia: 4, static: 8, chutzpah: 28 },
    radius: 26,
    bounciness: 0.9,
    slicedBonusAxis: 'chutzpah',
    whisper: 'Skibidibop-PINCH!',
    lore: 'Plays unlicensed alto-sax solos in 11/8 time and respects no authority.',
  },
  {
    id: 'victorian_regret',
    name: 'Bottled Victorian Tear',
    symbol: '😭',
    tier: 1,
    color: '#60a5fa',
    glowColor: '#3b82f6',
    flavors: { crunch: 2, nostalgia: 30, static: 8, chutzpah: 4 },
    radius: 23,
    bounciness: 0.68,
    slicedBonusAxis: 'nostalgia',
    whisper: 'Alas, my gazebo...',
    lore: 'Distilled from 140-year-old unsent apology letters found in a damp velvet trunk.',
  },
  {
    id: 'glass_eye',
    name: 'Unblinking Glass Oracle',
    symbol: '👁️',
    tier: 1,
    color: '#34d399',
    glowColor: '#10b981',
    flavors: { crunch: 18, nostalgia: 8, static: 16, chutzpah: 14 },
    radius: 24,
    bounciness: 0.88,
    slicedBonusAxis: 'static',
    whisper: 'Fix your posture, mortal.',
    lore: 'Stares directly through the fourth wall and judges your cursor trajectory.',
  },
  {
    id: 'static_toast',
    name: 'Numbers-Station Rye',
    symbol: '📻',
    tier: 1,
    color: '#c084fc',
    glowColor: '#a855f7',
    flavors: { crunch: 14, nostalgia: 6, static: 28, chutzpah: 6 },
    radius: 25,
    bounciness: 0.78,
    slicedBonusAxis: 'static',
    whisper: 'SEVEN... NINE... MARGARINE.',
    lore: 'Burnt sourdough slice broadcasting encrypted shortwave frequencies at 4625 kHz.',
  },
  {
    id: 'klein_worm',
    name: 'Klein-Bottle Gummy Worm',
    symbol: '🪱',
    tier: 1,
    color: '#f472b6',
    glowColor: '#ec4899',
    flavors: { crunch: 8, nostalgia: 12, static: 18, chutzpah: 22 },
    radius: 24,
    bounciness: 0.94,
    slicedBonusAxis: 'chutzpah',
    whisper: 'My inside IS my outside!',
    lore: 'A non-orientable confection that digests the spoon you stir it with.',
  },
  {
    id: 'tax_auditor',
    name: 'Pocket IRS Apparition',
    symbol: '💼',
    tier: 1,
    color: '#94a3b8',
    glowColor: '#cbd5e1',
    flavors: { crunch: 20, nostalgia: 2, static: 18, chutzpah: 20 },
    radius: 25,
    bounciness: 0.76,
    slicedBonusAxis: 'crunch',
    whisper: 'Is that ladle deductible?',
    lore: 'Demands receipts for your dreams; boil immediately to convert into Deductible Bisque.',
  },
];

export const HYBRID_INGREDIENTS: readonly IngredientTemplate[] = [
  {
    id: 'deja_vu_brittle',
    name: 'Déjà Vu Peanut Brittle',
    symbol: '🍬',
    tier: 2,
    color: '#fde047',
    glowColor: '#eab308',
    flavors: { crunch: 48, nostalgia: 46, static: 12, chutzpah: 20 },
    radius: 29,
    bounciness: 0.85,
    slicedBonusAxis: 'crunch',
    whisper: 'Didn’t you just eat me tomorrow?',
    lore: 'Fused from a Baby Tooth and a Melting Watch. Crunches 3 seconds before your teeth touch it.',
  },
  {
    id: 'subpoena_thermidor',
    name: 'Subpoena Lobster Thermidor',
    symbol: '⚖️',
    tier: 2,
    color: '#fb7185',
    glowColor: '#e11d48',
    flavors: { crunch: 34, nostalgia: 14, static: 26, chutzpah: 54 },
    radius: 30,
    bounciness: 0.88,
    slicedBonusAxis: 'chutzpah',
    whisper: 'YOU ARE SERVED (WITH BUTTER)!',
    lore: 'Bebop Lobster + IRS Apparition. Legally obligates the customer’s tastebuds to applaud.',
  },
  {
    id: 'panopticon_bruschetta',
    name: 'Panopticon Bruschetta',
    symbol: '👁️‍🗨️',
    tier: 2,
    color: '#2dd4bf',
    glowColor: '#14b8a6',
    flavors: { crunch: 36, nostalgia: 20, static: 52, chutzpah: 28 },
    radius: 29,
    bounciness: 0.84,
    slicedBonusAxis: 'static',
    whisper: 'THE GARLIC SEES ALL.',
    lore: 'Glass Oracle + Numbers-Station Rye. Watches the customer chew from six angles.',
  },
  {
    id: 'grandmas_dialtone',
    name: "Grandma's Rotary Dialtone",
    symbol: '☎️',
    tier: 2,
    color: '#818cf8',
    glowColor: '#6366f1',
    flavors: { crunch: 18, nostalgia: 56, static: 44, chutzpah: 14 },
    radius: 29,
    bounciness: 0.8,
    slicedBonusAxis: 'nostalgia',
    whisper: 'Bzzzzzt... eat your sweater...',
    lore: 'Victorian Tear + Numbers-Station Rye. Tastes like wood paneling and Sunday evening dread.',
  },
  {
    id: 'chronos_calamari',
    name: 'Mobius Strip Calamari',
    symbol: '🌀',
    tier: 2,
    color: '#e879f9',
    glowColor: '#d946ef',
    flavors: { crunch: 22, nostalgia: 46, static: 30, chutzpah: 40 },
    radius: 30,
    bounciness: 0.92,
    slicedBonusAxis: 'nostalgia',
    whisper: 'Chew clockwise to rewind!',
    lore: 'Melting Watch + Klein Worm. Only has one side, so the marinara sauce is infinite.',
  },
  {
    id: 'velvet_chatterbox',
    name: 'Scat-Singing Dentures',
    symbol: '👄',
    tier: 2,
    color: '#f43f5e',
    glowColor: '#be123c',
    flavors: { crunch: 46, nostalgia: 18, static: 16, chutzpah: 50 },
    radius: 29,
    bounciness: 0.9,
    slicedBonusAxis: 'chutzpah',
    whisper: 'Zebedee-bop-CHOMP!',
    lore: 'Baby Tooth + Bebop Lobster. Harmonizes with the customer’s uvula on the way down.',
  },
  {
    id: 'omega_monolith_meatball',
    name: '5th-Dimensional Monolith Meatball',
    symbol: '🌌',
    tier: 3,
    color: '#38bdf8',
    glowColor: '#f472b6',
    flavors: { crunch: 65, nostalgia: 65, static: 65, chutzpah: 65 },
    radius: 34,
    bounciness: 0.92,
    slicedBonusAxis: 'chutzpah',
    whisper: 'MY FULL OF STARS (AND OREGANO).',
    lore: 'Tier-3 Transcendental Singularity. Contains every soup ever spilled across all parallel timelines.',
  },
];

export const HAZARD_INGREDIENTS: readonly IngredientTemplate[] = [
  {
    id: 'red_tape_stamp',
    name: 'Bureaucratic Red-Tape Stamp',
    symbol: '🚫',
    tier: 1,
    color: '#ef4444',
    glowColor: '#dc2626',
    flavors: { crunch: -12, nostalgia: -12, static: 10, chutzpah: -15 },
    radius: 22,
    bounciness: 0.92,
    slicedBonusAxis: 'chutzpah',
    whisper: 'FORM 27B/6 MISSING!',
    lore: 'Fired by the Grand Comptroller! Slice or fling away before it falls into the Broth Vortex!',
    isHazard: true,
  },
];

export const ALL_INGREDIENTS_MAP: ReadonlyMap<string, IngredientTemplate> = new Map(
  [...BASE_INGREDIENTS, ...HYBRID_INGREDIENTS, ...HAZARD_INGREDIENTS].map((item) => [
    item.id,
    item,
  ])
);

export const FUSION_RECIPES: readonly FusionRecipe[] = [
  {
    id: 'recipe_deja_vu',
    ingredientA: 'baby_tooth',
    ingredientB: 'melting_watch',
    resultId: 'deja_vu_brittle',
    discoveryHeadline: 'SYNTHESIZED: Déjà Vu Peanut Brittle (Tooth + Pocketwatch)!',
  },
  {
    id: 'recipe_subpoena',
    ingredientA: 'jazz_lobster',
    ingredientB: 'tax_auditor',
    resultId: 'subpoena_thermidor',
    discoveryHeadline: 'SYNTHESIZED: Subpoena Lobster Thermidor (Lobster + Auditor)!',
  },
  {
    id: 'recipe_panopticon',
    ingredientA: 'glass_eye',
    ingredientB: 'static_toast',
    resultId: 'panopticon_bruschetta',
    discoveryHeadline: 'SYNTHESIZED: Panopticon Bruschetta (Glass Eye + Static Rye)!',
  },
  {
    id: 'recipe_dialtone',
    ingredientA: 'victorian_regret',
    ingredientB: 'static_toast',
    resultId: 'grandmas_dialtone',
    discoveryHeadline: "SYNTHESIZED: Grandma's Rotary Dialtone (Tear + Static Rye)!",
  },
  {
    id: 'recipe_calamari',
    ingredientA: 'melting_watch',
    ingredientB: 'klein_worm',
    resultId: 'chronos_calamari',
    discoveryHeadline: 'SYNTHESIZED: Mobius Strip Calamari (Watch + Klein Worm)!',
  },
  {
    id: 'recipe_chatterbox',
    ingredientA: 'baby_tooth',
    ingredientB: 'jazz_lobster',
    resultId: 'velvet_chatterbox',
    discoveryHeadline: 'SYNTHESIZED: Scat-Singing Dentures (Tooth + Bebop Lobster)!',
  },
];

export function resolveFusionResult(
  templateA: IngredientTemplate,
  templateB: IngredientTemplate
): { template: IngredientTemplate; headline: string } {
  // If either is already Tier 2+, fusing creates the Tier-3 Omega Monolith Meatball!
  if (templateA.tier >= 2 || templateB.tier >= 2) {
    const omega = ALL_INGREDIENTS_MAP.get('omega_monolith_meatball')!;
    return {
      template: omega,
      headline: `COSMIC SINGULARITY: ${templateA.name} + ${templateB.name} → 5TH-DIMENSIONAL MONOLITH MEATBALL!`,
    };
  }

  for (const recipe of FUSION_RECIPES) {
    const matchDirect =
      recipe.ingredientA === templateA.id && recipe.ingredientB === templateB.id;
    const matchReverse =
      recipe.ingredientA === templateB.id && recipe.ingredientB === templateA.id;
    if (matchDirect || matchReverse) {
      return {
        template: ALL_INGREDIENTS_MAP.get(recipe.resultId)!,
        headline: recipe.discoveryHeadline,
      };
    }
  }

  // Fallback universal surreal splice based on highest combined flavor axes
  const combined: FlavorProfile = {
    crunch: templateA.flavors.crunch + templateB.flavors.crunch,
    nostalgia: templateA.flavors.nostalgia + templateB.flavors.nostalgia,
    static: templateA.flavors.static + templateB.flavors.static,
    chutzpah: templateA.flavors.chutzpah + templateB.flavors.chutzpah,
  };

  if (combined.crunch >= combined.nostalgia && combined.crunch >= combined.static) {
    const res = ALL_INGREDIENTS_MAP.get('velvet_chatterbox')!;
    return {
      template: res,
      headline: `ALCHEMY SPLICE: ${templateA.symbol}+${templateB.symbol} → ${res.name}!`,
    };
  }
  if (combined.nostalgia >= combined.static && combined.nostalgia >= combined.chutzpah) {
    const res = ALL_INGREDIENTS_MAP.get('chronos_calamari')!;
    return {
      template: res,
      headline: `ALCHEMY SPLICE: ${templateA.symbol}+${templateB.symbol} → ${res.name}!`,
    };
  }
  if (combined.static >= combined.chutzpah) {
    const res = ALL_INGREDIENTS_MAP.get('panopticon_bruschetta')!;
    return {
      template: res,
      headline: `ALCHEMY SPLICE: ${templateA.symbol}+${templateB.symbol} → ${res.name}!`,
    };
  }
  const res = ALL_INGREDIENTS_MAP.get('subpoena_thermidor')!;
  return {
    template: res,
    headline: `ALCHEMY SPLICE: ${templateA.symbol}+${templateB.symbol} → ${res.name}!`,
  };
}

export const PATRON_ARCHETYPES: readonly PatronArchetype[] = [
  {
    id: 'landlord_tuesday',
    name: 'The Seven-Eyed Landlord of Tuesday',
    title: ' Duke of Expired Leases',
    avatarEmoji: '👁️‍🗨️',
    eyeCount: 7,
    auraColor: '#facc15',
    primaryAxis: 'crunch',
    secondaryAxis: 'nostalgia',
    minTotalFlavor: 38,
    baseRewardCoins: 24,
    baseScore: 320,
    greetingQuotes: [
      'Rent on your pineal gland is due! Serve me a broth with violent CRUNCH and 1990s NOSTALGIA.',
      'I require a soup that sounds like a xylophone falling down a carpeted staircase.',
    ],
    satisfiedQuotes: [
      'EXQUISITE! My fourth eyelid is weeping with osteo-acoustic joy!',
      'Your lease on consciousness is renewed through Thursday!',
    ],
    impatientQuotes: [
      'My seven pupils are dilating with impatience, chef!',
      'Where is my crunchy temporal bisque?!',
    ],
  },
  {
    id: 'baroness_static',
    name: 'Baroness Von Static',
    title: 'Duchess of Channel 3 Snow',
    avatarEmoji: '📺',
    eyeCount: 3,
    auraColor: '#c084fc',
    primaryAxis: 'static',
    secondaryAxis: 'crunch',
    minTotalFlavor: 40,
    baseRewardCoins: 26,
    baseScore: 350,
    greetingQuotes: [
      'Tune my soup to 4625 kHz! I crave high-voltage STATIC and toasted enamel CRUNCH.',
      'Make it taste like touching a CRT television screen in a wool sweater!',
    ],
    satisfiedQuotes: [
      'BZZZZT—MAGNIFICENT! My antennae are vibrating in Technicolor!',
      'Pure white noise perfection! Keep the change in kilohertz!',
    ],
    impatientQuotes: [
      'I am losing vertical hold! Feed me STATIC before I degauss your kitchen!',
    ],
  },
  {
    id: 'trenchcoat_bees',
    name: '4,000 Bees in a Damp Trenchcoat',
    title: 'Definitely One Normal Human',
    avatarEmoji: '🐝',
    eyeCount: 5,
    auraColor: '#fb7185',
    primaryAxis: 'chutzpah',
    secondaryAxis: 'static',
    minTotalFlavor: 42,
    baseRewardCoins: 28,
    baseScore: 380,
    greetingQuotes: [
      'HELLO FELLOW VERTEBRATE. WE REQUIRE MAXIMUM CHUTZPAH AND BUZZING STATIC.',
      'ONE BOWL OF AUDACITY, PLEASE. DO NOT INQUIRE WHY OUR LAPELS ARE HUMMING.',
    ],
    satisfiedQuotes: [
      'THE HIVE APPROVES THIS UMAMI! OUR QUEEN SENDS HER REGARDS!',
      'DELICIOUS! WE SHALL NOT STING YOUR SUBCONSCIOUS TODAY!',
    ],
    impatientQuotes: [
      'OUR TRENCHCOAT IS VIBRATING AT DANGEROUS DECIBELS, CHEF!',
    ],
  },
  {
    id: 'astral_gym_teacher',
    name: "Coach Henderson's Astral Projection",
    title: 'Spectral Dodgeball Coordinator',
    avatarEmoji: '🎽',
    eyeCount: 2,
    auraColor: '#38bdf8',
    primaryAxis: 'nostalgia',
    secondaryAxis: 'chutzpah',
    minTotalFlavor: 40,
    baseRewardCoins: 25,
    baseScore: 340,
    greetingQuotes: [
      'DROP AND GIVE ME 40 MILLILITERS OF PURE NOSTALGIA WITH 110% CHUTZPAH!',
      'I want a soup that smells like a freshly waxed gymnasium floor in 1996!',
    ],
    satisfiedQuotes: [
      'THAT IS VARSITY-GRADE BROTH, KID! TAKE A VICTORY LAP AROUND THE KLEIN BOTTLE!',
    ],
    impatientQuotes: [
      'TWEET! DELAY OF SOUP PENALTY! HUSTLE UP WITH THAT LADLE!',
    ],
  },
  {
    id: 'delayed_train',
    name: 'The Concept of the 5:15 Express',
    title: 'Non-Linear Commuter Entity',
    avatarEmoji: '🚆',
    eyeCount: 4,
    auraColor: '#34d399',
    primaryAxis: 'nostalgia',
    secondaryAxis: 'static',
    minTotalFlavor: 44,
    baseRewardCoins: 30,
    baseScore: 410,
    greetingQuotes: [
      'We apologize for the existential delay. Please ladle melted time (NOSTALGIA) and rail STATIC.',
      'Next stop: Your Frontal Lobe. Stand clear of the closing soup bowl.',
    ],
    satisfiedQuotes: [
      'CHOO-CHOO OF ENLIGHTENMENT ACHIEVED! We are now arriving 12 years early!',
    ],
    impatientQuotes: [
      'SIGNAL FAILURE AT BOOTH #2! OUR PASSENGERS ARE BECOMING ABSTRACT!',
    ],
  },
  {
    id: 'grand_comptroller',
    name: 'THE GRAND COMPTROLLER OF THE SUBCONSCIOUS',
    title: 'Supreme Boss Auditor of Unlicensed Dreams',
    avatarEmoji: '🎩',
    eyeCount: 6,
    auraColor: '#f43f5e',
    primaryAxis: 'chutzpah',
    secondaryAxis: 'crunch',
    minTotalFlavor: 60,
    baseRewardCoins: 55,
    baseScore: 850,
    isBossAuditor: true,
    greetingQuotes: [
      'AUDIT IN PROGRESS! Your broth lacks Form 88-Paradox! Feed me colossal CHUTZPAH & CRUNCH or be liquidated!',
      'I AM GARNISHING YOUR GRAVITY! Slice my Red-Tape Stamps if you dare, mortal cook!',
    ],
    satisfiedQuotes: [
      'BY THE GREAT GOLDEN MONOCLE... THIS SOUP IS COMPLETELY TAX-EXEMPT! AUDIT PASSED!',
    ],
    impatientQuotes: [
      'PENALTY NOTICE ISSUED! YOUR EGO SANITY IS SUBJECT TO IMMEDIATE FORECLOSURE!',
    ],
  },
];

export const REALITY_DECREES: readonly RealityDecreeDef[] = [
  {
    id: 'EUCLIDEAN_LULLABY',
    title: 'DECREE #01: NOMINAL SUBCONSCIOUS GRAVITY',
    ministryCode: 'ONT-200-OK',
    description: 'Ingredients drift downward at a polite Victorian pace. Enjoy it while it lasts.',
    gravityX: 0,
    gravityY: 62,
    bounceChutzpahBonus: 1,
    pendulumSpeedMult: 1.0,
    ingredientsFleeHand: false,
    bannerColor: '#38bdf8',
  },
  {
    id: 'LATERAL_PINBALL',
    title: 'DECREE #02: GRAVITY IS NOW SIDEWAYS',
    ministryCode: 'ONT-90-DEG',
    description: 'The Ministry rotated "Down" by 90 degrees! Ingredients fall toward the East Wall like pinballs!',
    gravityX: 88,
    gravityY: 14,
    bounceChutzpahBonus: 3,
    pendulumSpeedMult: 1.15,
    ingredientsFleeHand: false,
    bannerColor: '#f59e0b',
  },
  {
    id: 'CEILING_DRIP',
    title: 'DECREE #03: REVERSE AUSTRALIAN CEILING RAIN',
    ministryCode: 'ONT-UP-DOWN',
    description: 'Gravity is inverted! Ingredients float toward the ceiling booths unless flung downward into the Vat!',
    gravityX: 0,
    gravityY: -74,
    bounceChutzpahBonus: 2,
    pendulumSpeedMult: 1.1,
    ingredientsFleeHand: false,
    bannerColor: '#a855f7',
  },
  {
    id: 'MANDATORY_JAZZ_TAX',
    title: 'DECREE #04: MANDATORY BEBOP RICOCHET ACT',
    ministryCode: 'ONT-52-ST',
    description: 'Every wall bounce plays an unlicensed jazz chord and injects +6 Chutzpah into the ingredient!',
    gravityX: -28,
    gravityY: 58,
    bounceChutzpahBonus: 6,
    pendulumSpeedMult: 1.25,
    ingredientsFleeHand: false,
    bannerColor: '#fb7185',
  },
  {
    id: 'PARANOID_PANTRY',
    title: 'DECREE #05: SENTIENT INGREDIENT UNION STRIKE',
    ministryCode: 'ONT-404-FLEE',
    description: 'Ingredients have realized they are soup! They actively dodge The Third Hand unless Time-Frozen [Q]!',
    gravityX: 0,
    gravityY: 50,
    bounceChutzpahBonus: 4,
    pendulumSpeedMult: 1.2,
    ingredientsFleeHand: true,
    bannerColor: '#10b981',
  },
  {
    id: 'HYPER_PENDULUM',
    title: 'DECREE #06: GUILLOTINE OVERTIME PROTOCOL',
    ministryCode: 'ONT-SLICE-2X',
    description: 'The Non-Euclidean Laser Pendulum swings at 2.1x hyper-speed, bisecting everything in its arc!',
    gravityX: 18,
    gravityY: 66,
    bounceChutzpahBonus: 3,
    pendulumSpeedMult: 2.1,
    ingredientsFleeHand: false,
    bannerColor: '#ef4444',
  },
];

export const SUBCONSCIOUS_TICKER_MESSAGES: readonly string[] = [
  'REMINDER: Do not make eye contact with the Glass Oracle for more than 4 consecutive seconds.',
  'LOST & FOUND: Someone left a 1997 childhood memory near Booth #2. It is dripping.',
  'HEALTH CODE NOTICE: All Klein-Bottle worms must be washed on both their inside-outside and outside-inside.',
  'WEATHER REPORT: 80% chance of heavy Victorian nostalgia followed by scattered saxophone solos.',
  'MINISTRY BULLETIN: Tuesday has been temporarily rescheduled to late Wednesday afternoon.',
  'KITCHEN TIP: Collide two ingredients at high velocity or press [E] to splice Forbidden Hybrid Delicacies!',
  'AUDITOR WARNING: If a Pocket IRS Apparition touches your Third Hand, boil him into Deductible Bisque!',
];
