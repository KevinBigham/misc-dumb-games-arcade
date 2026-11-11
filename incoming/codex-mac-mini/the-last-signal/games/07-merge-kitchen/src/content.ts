export interface RecipeTierDefinition {
  tier: number; // 1..11
  value: number; // 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048
  name: string;
  shortName: string;
  courseTag: string;
  description: string;
  baseServeScore: number;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  svgIcon: string;
}

export interface CustomerPatronTemplate {
  id: string;
  patronName: string;
  tableLabel: string;
  orderQuote: string;
  avatarBadge: string;
}

export const RECIPE_TIERS: readonly RecipeTierDefinition[] = [
  {
    tier: 1,
    value: 2,
    name: 'Fresh Egg',
    shortName: 'Fresh Egg',
    courseTag: 'Mise en Place',
    description: 'Farm-fresh pasture egg, ready to crack onto the copper prep station.',
    baseServeScore: 15,
    bgGradient: 'linear-gradient(145deg, #fffdf7 0%, #f5ebd6 100%)',
    borderColor: '#d9c398',
    textColor: '#4a3520',
    accentColor: '#d99b26',
    svgIcon: `<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="24" cy="26" rx="13" ry="16" fill="#fff8ea" stroke="#c89d54" stroke-width="2.5"/>
      <circle cx="24" cy="28" r="6.5" fill="#f59e0b"/>
      <circle cx="22" cy="26" r="2" fill="#fef08a"/>
    </svg>`,
  },
  {
    tier: 2,
    value: 4,
    name: 'Whisked Batter',
    shortName: 'Batter',
    courseTag: 'Mise en Place',
    description: 'Velvety egg and cream batter aerated in a hammered copper mixing bowl.',
    baseServeScore: 30,
    bgGradient: 'linear-gradient(145deg, #fff7e0 0%, #f3dca8 100%)',
    borderColor: '#d4ab58',
    textColor: '#4a3214',
    accentColor: '#c77d15',
    svgIcon: `<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M10 24 H38 A14 13 0 0 1 10 24 Z" fill="#d97706" stroke="#78350f" stroke-width="2.2"/>
      <ellipse cx="24" cy="24" rx="14" ry="4" fill="#fde68a" stroke="#78350f" stroke-width="2"/>
      <path d="M29 10 L22 23 M33 12 L25 24" stroke="#78350f" stroke-width="2.4" stroke-linecap="round"/>
    </svg>`,
  },
  {
    tier: 3,
    value: 8,
    name: 'Golden Omelet',
    shortName: 'Omelet',
    courseTag: 'Café Classic',
    description: 'French rolled omelet glazed with Normandy butter and snipped chives.',
    baseServeScore: 60,
    bgGradient: 'linear-gradient(145deg, #ffefc2 0%, #f8c963 100%)',
    borderColor: '#d99316',
    textColor: '#3f2708',
    accentColor: '#b45309',
    svgIcon: `<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="24" cy="28" rx="17" ry="10" fill="#fffbeb" stroke="#b45309" stroke-width="2"/>
      <path d="M12 27 C14 17, 34 17, 36 27 C31 32, 17 32, 12 27 Z" fill="#facc15" stroke="#a16207" stroke-width="2.2"/>
      <circle cx="20" cy="25" r="1.6" fill="#15803d"/>
      <circle cx="25" cy="24" r="1.6" fill="#15803d"/>
      <circle cx="29" cy="26" r="1.6" fill="#15803d"/>
    </svg>`,
  },
  {
    tier: 4,
    value: 16,
    name: 'Brioche Toast',
    shortName: 'Brioche',
    courseTag: 'Bakery Warmth',
    description: 'Thick-cut golden brioche griddled crisp with a melting sea-salt butter medallion.',
    baseServeScore: 120,
    bgGradient: 'linear-gradient(145deg, #fed7aa 0%, #f59e56 100%)',
    borderColor: '#c25e1a',
    textColor: '#3b1806',
    accentColor: '#9a3412',
    svgIcon: `<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M13 20 C10 15, 16 11, 24 13 C32 11, 38 15, 35 20 L34 35 C34 37, 32 38, 30 38 H18 C16 38, 14 37, 14 35 Z" fill="#ea580c" stroke="#7c2d12" stroke-width="2.2"/>
      <path d="M16 21 C14 17, 19 14, 24 16 C29 14, 34 17, 32 21 L31 33 H17 Z" fill="#fde047"/>
      <rect x="20" y="22" width="8" height="7" rx="1.5" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.6"/>
    </svg>`,
  },
  {
    tier: 5,
    value: 32,
    name: 'Eggs Benedict',
    shortName: 'Benedict',
    courseTag: 'Brunch Star',
    description: 'Poached eggs atop toasted brioche and smoked ham, draped in silky hollandaise.',
    baseServeScore: 240,
    bgGradient: 'linear-gradient(145deg, #fecaca 0%, #f47252 100%)',
    borderColor: '#b93822',
    textColor: '#ffffff',
    accentColor: '#7f1d1d',
    svgIcon: `<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="24" cy="33" rx="17" ry="6" fill="#fff7ed" stroke="#7c2d12" stroke-width="2"/>
      <rect x="13" y="26" width="22" height="6" rx="3" fill="#d97706"/>
      <path d="M14 26 C14 18, 23 18, 24 25 C25 18, 34 18, 34 26 Z" fill="#fef08a" stroke="#a16207" stroke-width="2"/>
      <path d="M13 23 Q19 28 24 23 Q29 28 35 23" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },
  {
    tier: 6,
    value: 64,
    name: 'Bistro Brunch',
    shortName: 'Brunch',
    courseTag: 'Brunch Star',
    description: 'Cast-iron skillet feast with herb-roasted potatoes, confit tomatoes, and artisan charcuterie.',
    baseServeScore: 480,
    bgGradient: 'linear-gradient(145deg, #f87171 0%, #dc2626 100%)',
    borderColor: '#991b1b',
    textColor: '#ffffff',
    accentColor: '#fef08a',
    svgIcon: `<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <circle cx="22" cy="25" r="14" fill="#292524" stroke="#f59e0b" stroke-width="2.2"/>
      <path d="M35 20 L44 15" stroke="#292524" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="18" cy="22" r="4.5" fill="#fef08a"/>
      <circle cx="18" cy="22" r="2" fill="#f97316"/>
      <circle cx="27" cy="23" r="3.5" fill="#ef4444"/>
      <circle cx="23" cy="30" r="3.5" fill="#84cc16"/>
    </svg>`,
  },
  {
    tier: 7,
    value: 128,
    name: 'Truffle Risotto',
    shortName: 'Risotto',
    courseTag: 'Premier Course',
    description: 'Aged Carnaroli rice simmered in parmesan brodo and crowned with shaved Périgord black truffle.',
    baseServeScore: 950,
    bgGradient: 'linear-gradient(145deg, #c084fc 0%, #7e22ce 100%)',
    borderColor: '#581c87',
    textColor: '#ffffff',
    accentColor: '#fde047',
    svgIcon: `<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="24" cy="26" rx="17" ry="12" fill="#faf5ff" stroke="#581c87" stroke-width="2.2"/>
      <ellipse cx="24" cy="26" rx="11.5" ry="7.5" fill="#fef08a" stroke="#ca8a04" stroke-width="1.6"/>
      <circle cx="21" cy="25" r="2.8" fill="#27272a"/>
      <circle cx="26" cy="24" r="2.6" fill="#27272a"/>
      <circle cx="24" cy="28" r="2.4" fill="#3f3f46"/>
    </svg>`,
  },
  {
    tier: 8,
    value: 256,
    name: 'Wellington Roast',
    shortName: 'Wellington',
    courseTag: 'Chef Signature',
    description: 'Center-cut tenderloin and mushroom duxelles wrapped in golden lattice puff pastry.',
    baseServeScore: 1900,
    bgGradient: 'linear-gradient(145deg, #60a5fa 0%, #1d4ed8 100%)',
    borderColor: '#1e3a8a',
    textColor: '#ffffff',
    accentColor: '#fde047',
    svgIcon: `<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="24" cy="33" rx="18" ry="6" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/>
      <path d="M11 31 C11 17, 37 17, 37 31 Z" fill="#d97706" stroke="#78350f" stroke-width="2.2"/>
      <path d="M16 21 L24 31 M24 19 L31 31 M31 21 L23 31 M23 19 L16 31" stroke="#fde68a" stroke-width="1.6"/>
      <circle cx="24" cy="27" r="4.5" fill="#dc2626" stroke="#450a0a" stroke-width="1.5"/>
    </svg>`,
  },
  {
    tier: 9,
    value: 512,
    name: 'Tasting Menu',
    shortName: 'Tasting',
    courseTag: 'Haute Cuisine',
    description: 'Seven-course silver-cloche degustation paired with vintage sommelier pours.',
    baseServeScore: 3800,
    bgGradient: 'linear-gradient(145deg, #34d399 0%, #047857 100%)',
    borderColor: '#064e3b',
    textColor: '#ffffff',
    accentColor: '#fef08a',
    svgIcon: `<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <rect x="8" y="32" width="32" height="4" rx="2" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/>
      <path d="M11 32 A13 13 0 0 1 37 32 Z" fill="#f8fafc" stroke="#0f172a" stroke-width="2.2"/>
      <circle cx="24" cy="16" r="3" fill="#fbbf24" stroke="#0f172a" stroke-width="1.8"/>
      <path d="M18 26 Q24 21 30 26" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    tier: 10,
    value: 1024,
    name: 'Michelin Grand Feast',
    shortName: 'Grand Feast',
    courseTag: '3-Star Crown',
    description: 'Three-Michelin-Star royal banquet service that cements your kitchen among culinary legends!',
    baseServeScore: 8000,
    bgGradient: 'linear-gradient(145deg, #fbbf24 0%, #d97706 55%, #7c2d12 100%)',
    borderColor: '#fef08a',
    textColor: '#ffffff',
    accentColor: '#fef08a',
    svgIcon: `<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <polygon points="24,7 28,17 39,17 30,23 33,34 24,28 15,34 18,23 9,17 20,17" fill="#fde047" stroke="#78350f" stroke-width="2.2"/>
      <circle cx="24" cy="22" r="4.5" fill="#fffbeb"/>
    </svg>`,
  },
  {
    tier: 11,
    value: 2048,
    name: "Chef's Legend",
    shortName: 'Legend',
    courseTag: 'Immortal Toque',
    description: 'The mythical Golden Toque 2048 creation—pinnacle of gastronomic perfection!',
    baseServeScore: 18000,
    bgGradient: 'linear-gradient(145deg, #fde047 0%, #f59e0b 45%, #9333ea 100%)',
    borderColor: '#ffffff',
    textColor: '#ffffff',
    accentColor: '#fde047',
    svgIcon: `<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M15 26 C10 24, 10 15, 17 15 C19 10, 29 10, 31 15 C38 15, 38 24, 33 26 L32 35 H16 Z" fill="#fef9c3" stroke="#78350f" stroke-width="2.2"/>
      <rect x="16" y="33" width="16" height="5" rx="1.5" fill="#f59e0b" stroke="#78350f" stroke-width="1.8"/>
      <path d="M21 20 L24 14 L27 20 Z" fill="#eab308"/>
    </svg>`,
  },
];

const TIER_MAP = new Map<number, RecipeTierDefinition>(
  RECIPE_TIERS.map((recipe) => [recipe.tier, recipe])
);

const VALUE_MAP = new Map<number, RecipeTierDefinition>(
  RECIPE_TIERS.map((recipe) => [recipe.value, recipe])
);

export function getRecipeByTier(tier: number): RecipeTierDefinition {
  const clamped = Math.max(1, Math.min(RECIPE_TIERS.length, Math.round(tier)));
  return TIER_MAP.get(clamped) ?? RECIPE_TIERS[0];
}

export function getRecipeByValue(value: number): RecipeTierDefinition {
  const direct = VALUE_MAP.get(value);
  if (direct) {
    return direct;
  }
  const computedTier = valueToTier(value);
  return getRecipeByTier(computedTier);
}

export function valueToTier(value: number): number {
  if (value <= 0) return 0;
  const tier = Math.round(Math.log2(value));
  return Math.max(1, Math.min(RECIPE_TIERS.length, tier));
}

export function tierToValue(tier: number): number {
  if (tier <= 0) return 0;
  return Math.pow(2, tier);
}

export const CUSTOMER_PATRONS: readonly CustomerPatronTemplate[] = [
  {
    id: 'critic-moreau',
    patronName: 'Inspector Moreau',
    tableLabel: 'Table 1 · Window',
    orderQuote: 'Crisp plating and hot pan sear, Chef!',
    avatarBadge: '🎩',
  },
  {
    id: 'chef-colette',
    patronName: 'Madame Colette',
    tableLabel: 'Table 2 · Banquette',
    orderQuote: 'My regulars swear by this house specialty.',
    avatarBadge: '🥂',
  },
  {
    id: 'baron-henri',
    patronName: 'Baron Henri',
    tableLabel: 'Table 3 · Chef Counter',
    orderQuote: 'Worth a double tip if served fresh off the pass!',
    avatarBadge: '🍷',
  },
  {
    id: 'sommelier-luc',
    patronName: 'Sommelier Luc',
    tableLabel: 'Table 4 · Cellar Alcove',
    orderQuote: 'I have the Burgundy uncorked and waiting.',
    avatarBadge: '🍇',
  },
  {
    id: 'duchess-elodie',
    patronName: 'Duchess Élodie',
    tableLabel: 'Table 5 · Terrace',
    orderQuote: 'Send it straight from the copper skillet!',
    avatarBadge: '👑',
  },
  {
    id: 'journalist-remy',
    patronName: 'Critic Rémy',
    tableLabel: 'Table 6 · Salon',
    orderQuote: 'Show me why this kitchen earned its stars.',
    avatarBadge: '✒️',
  },
];

/**
 * Determines the allowed recipe tier pools for customer orders as `ordersServed` scales up.
 * - Early service (0..2 orders): Tiers 3..4 ([8] Golden Omelet .. [16] Brioche Toast)
 * - Mid service (3..5 orders): Tiers 3..5 ([8] .. [32] Eggs Benedict)
 * - Prime rush (6..9 orders): Tiers 4..6 ([16] .. [64] Bistro Brunch)
 * - Encore service (10+ orders): Tiers 4..8 ([16] .. [256] Wellington Roast)
 */
export function getTicketTierPoolForProgress(ordersServed: number, slotIndex: number): readonly number[] {
  if (ordersServed < 2) {
    return slotIndex === 0 ? [3] : [3, 4];
  }
  if (ordersServed < 5) {
    if (slotIndex === 0) return [3, 4];
    if (slotIndex === 1) return [4, 5];
    return [3, 4, 5];
  }
  if (ordersServed < 9) {
    if (slotIndex === 0) return [3, 4];
    if (slotIndex === 1) return [4, 5];
    return [5, 6];
  }
  if (slotIndex === 0) return [4, 5];
  if (slotIndex === 1) return [5, 6, 7];
  return [6, 7, 8];
}
