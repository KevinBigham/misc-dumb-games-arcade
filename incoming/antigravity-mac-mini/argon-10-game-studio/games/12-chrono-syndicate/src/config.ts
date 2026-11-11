export const CHRONO_CONFIG = {
  GAME_ID: '12-chrono-syndicate',
  GAME_NUMBER: 12,
  TITLE: 'Chrono-Syndicate: The 15-Second Heist',
  SUBTITLE: '4D Cooperative Time-Loop Tactical Heist & Ghost-Echo Orchestrator',
  ACCENT_COLOR: '#10b981',
  SECONDARY_COLOR: '#38bdf8',
  TERTIARY_COLOR: '#f59e0b',
  DANGER_COLOR: '#f43f5e',
  DEFAULT_SEED: 20261108,
  FIXED_STEP_MS: 50, // 20 Hz deterministic simulation ticks

  ARENA_WIDTH: 760,
  ARENA_HEIGHT: 440,

  TIMELINE_DURATION_TICKS: 300, // 300 ticks * 50ms = 15.0 seconds per Timeline Loop!
  MAX_ECHOS_PER_STAGE: 4, // Up to 4 simultaneous agents in the same 15s window

  AGENT_RADIUS: 13,
  AGENT_BASE_SPEED: 235, // px per second
  AGENT_DASH_SPEED: 460,
  AGENT_MAX_ENERGY: 100,
  AGENT_START_ENERGY: 100,

  // Action costs & durations
  EMP_COST: 30,
  EMP_RADIUS: 118,
  EMP_STUN_TICKS: 65, // 3.25 seconds of turret/drone disable

  DECOY_COST: 25,
  DECOY_DURATION_TICKS: 90, // 4.5 seconds of guard distraction
  DECOY_ATTRACT_RADIUS: 190,

  BLINK_COST: 22,
  BLINK_DISTANCE: 105,
  BLINK_COOLDOWN_TICKS: 16,

  SWITCH_INTERACT_RADIUS: 34,
  TERMINAL_HACK_RADIUS: 38,
  VAULT_EXTRACT_RADIUS: 36,
  EXTRACTION_PAD_RADIUS: 42,

  // Scoring & Paradox Rules
  PARADOX_MAX_INSTABILITY: 100,
  SIGHT_INSTABILITY_PER_TICK: 3.2,
  LASER_INSTABILITY_HIT: 42,
  TEMPORAL_RESONANCE_RADIUS: 68, // Bonus when an Echo and Active Agent cooperate nearby
  SCORE_TERMINAL_HACKED: 450,
  SCORE_CORE_EXTRACTED: 1200,
  SCORE_STAGE_CLEAR_BASE: 1800,
  SCORE_UNUSED_ECHO_BONUS: 600,
  SCORE_TICK_REMAINING_BONUS: 8,
  SCORE_PARADOX_FREE_BONUS: 750,

  TOTAL_STAGES: 4,
  STORAGE_KEY: 'argon_game12_chrono_syndicate_v1',
  SCHEMA_VERSION: 1,
} as const;
