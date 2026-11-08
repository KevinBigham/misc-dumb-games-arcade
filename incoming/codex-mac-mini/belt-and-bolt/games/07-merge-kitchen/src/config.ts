export const MERGE_KITCHEN_CONFIG = {
  GAME_ID: '07-merge-kitchen',
  SAVE_VERSION: 1,
  STORAGE_KEY_STATE: 'argon_07_merge_kitchen_state_v1',
  STORAGE_KEY_PROFILE: 'argon_07_merge_kitchen_profile_v1',

  GRID_SIZE: 4,
  INITIAL_TILES: 2,
  DEFAULT_SEED: 204807,

  // Spawn probabilities on valid slide: 90% Tier 1 (Fresh Egg [2]), 10% Tier 2 (Whisked Batter [4])
  SPAWN_TIER_1_PROBABILITY: 0.9,
  SPAWN_TIER_1_VALUE: 2,
  SPAWN_TIER_2_VALUE: 4,

  // Customer Order Rail
  ORDER_SLOT_COUNT: 3,
  SHORT_GOAL_ORDERS: 10,
  SHORT_GOAL_RECIPE_TIER: 10, // Tier 10 = Michelin Grand Feast [1024]
  MAX_RECIPE_TIER: 11, // Tier 11 = Chef's Legend [2048]

  // Rush-Hour Combo & Tip Multipliers
  BASE_TIP_FRESH: 1.5, // While customer patience > 50%
  BASE_TIP_WARM: 1.25, // While customer patience > 0
  BASE_TIP_LATE: 1.0, // Patience reached 0 (customer stays waiting, base price only)
  RUSH_COMBO_STEP: 0.15, // +15% per consecutive order served within rush window
  RUSH_COMBO_MAX_BONUS: 1.0, // Up to +100% additional rush multiplier
  RUSH_WINDOW_TURNS: 8, // Slides allowed before Rush Streak cools down by 1
} as const;
