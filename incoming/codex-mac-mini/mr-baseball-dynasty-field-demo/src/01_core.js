/* ═══════════════════════════════════════════════════════════════════════════
   MR. BASEBALL DYNASTY — FIELD DEMO v0.6
   SportsDynastyGames · single-file monolith · vanilla JS · no build step
   ═══════════════════════════════════════════════════════════════════════════
   Built from the KGJ spiritual-twin clean-room handoff (behavioral specs only:
   physics constants, timing windows, state-machine shapes). 100% original
   code, art, audio, names, and teams. Zero ROM-derived content.

   PROVENANCE LABELS used on constants (from the handoff):
     [PROVEN]     frame-exact golden-master match or verified code analysis
     [MEASURED]   statistical fit from live captures (n given in handoff)
     [HYPOTHESIS] best mechanism for a measured value
     [OPEN]       unknown; placeholder supplied, wired as a tunable
     [DESIGN]     our original design choice (informed by the handoff)

   SECTION MAP (grep for "SECTION §"):
     §A CONSTANTS   §B RNG        §C FIXED-POINT/ANGLES  §D DATA (teams)
     §E INPUT       §F SIM CORE   §G EVENTS              §H RENDER
     §I AUDIO       §J SHELL      §K TESTHOOKS (node/headless)

   MBD-MERGE NOTES: The sim core (§B–§G) is presentation-free and deterministic
   — it reads (state, inputFrames) and emits ordered events. To merge into
   Mr. Baseball Dynasty: lift §A–§G wholesale, feed MBD rosters through the
   Team/Player schema in §D, and mount §H/§I on MBD's shell. All feel-critical
   numbers live in CONST/TUNE only.
   ═══════════════════════════════════════════════════════════════════════════ */
'use strict';

/* ════════════════ SECTION §A — CONSTANTS ════════════════ */
// Sub-units: positions & velocities are 8.8 fixed point (256 subunits = 1 world unit).
// World scale: ~8.7 units per foot [MEASURED]. Plate→mound = 526 units = 60.5 ft.
const CONST = {
  FPS: 60.0988,                    // [PROVEN] NTSC frame cadence; fixed timestep

  // ── Ball flight (frame-exact integrator) ──
  GRAVITY_SUB: -12,                // [PROVEN] subunits/frame² (−0.046875 u/f²); velocity-first
  RESTITUTION_SHIFT: 2,            // [MEASURED 0.25 n=99][HYPOTHESIS mech] vz' = -(vz>>2)
  ROLL_FACTOR: 0.9894,             // [MEASURED n=278] exponential ground decay per frame
  ROLL_VZ_THRESHOLD: 32,           // [OPEN] bounce→roll below this upward vz (subunits/f)
  ROLL_STOP_SPEED: 205,            // [MEASURED tails] stop below ~0.8 u/f (subunits/f)
  STEER_ACCEL: 32,                 // [OPEN placeholder] batted-ball d-pad accel, sub/f² per axis

  // ── World geometry [MEASURED anchors; diamond axis-aligned = DESIGN] ──
  PLATE_X: 1536, PLATE_Y: 3100,    // home plate world anchor [MEASURED]
  MOUND_DIST: 526,                 // 60.5 ft [MEASURED]
  BASE_DIST: 783,                  // 90 ft × 8.7 u/ft [DESIGN]
  WORLD_W: 3072, WORLD_H: 5632,    // world clamps [MEASURED bounds]

  // ── Contact geometry [PROVEN, from disassembly] ──
  BAT_PLANE_Z: 16,                 // ball z snaps here on contact [PROVEN]
  HANDEDNESS_OFF: 36,              // bat reference offset, sign by L/R [PROVEN]
  LAT_WINDOW: 47,                  // |dLat| gate [PROVEN]
  DEPTH_WINDOW_HALF: 58,           // 116-unit depth window, symmetric [PROVEN width][OPEN sidedness]
  QUALITY_T4: 40, QUALITY_T2: 45,  // |dDepth| tiers → quality 4/2/0 [PROVEN]
  TIMING_DEADBAND: 12,             // early/on-time/late classifier [DESIGN on PROVEN 3-way sign]

  // ── Swing state machine ──
  SWING_L: 4,                      // [OPEN tunable] B-press → bat live (windup frames)
  SWING_D: 7,                      // [OPEN tunable] frames bat stays live
  SWING_FOLLOW: 14,                // [DESIGN] follow-through lockout
  BOX_RANGE: 8,                    // batter box ±8 units, 17-unit range [PROVEN-adjacent]

  // ── Pitching [MEASURED envelope] ──
  PITCH_T_FAST: 20, PITCH_T_SLOW: 26,  // mound→plate frames (y-speed 26.3–20.2 u/f)
  PITCH_Z0: 24, PITCH_Z_END: 16,   // z corridor 16–57, arrive at bat plane [MEASURED]
  PITCH_STEER_X: 26,               // [OPEN] in-flight lateral steering authority, sub/f²
  PITCH_STEER_T: 8,                // [DESIGN] up/down arrival-time authority (±% of vy, in 1/256)
  WINDUP_FRAMES: 84,               // [MEASURED] command→flight = 84f — the theatrical delivery arc
  ZONE_HALF_W: 24,                 // [DESIGN] called-strike half-width around plate center
  PITCH_AIM_RANGE: 40,             // [v0.6 DESIGN] human pre-release aim clamp, ±units around plate center
  // ── Round-2 gameplay [DESIGN] ──
  BUNT_DEPTH_HALF: 70, BUNT_LAT: 52,   // squared-bunt contact volume (wider, weaker)
  DIVE_FRAMES: 12, DIVE_PRONE: 20, DIVE_SPEED: 5, DIVE_REACH: 10,
  LEAD_MAX: 40,                    // PREPITCH lead distance (world units)
  PICKOFF_OUT_CHANCE: 30,          // /256 when runner at full lead
  FATIGUE_BASE: 18, FATIGUE_PER_STAM: 3,   // pitch count before velo/control decay

  // ── Fielders [MEASURED/PROVEN from RE report] ──
  FLD_START: 192,                  // 0.75 u/f  × 256
  FLD_ACCEL: 20,                   // +0.078125 u/f² × 256
  FLD_BRAKE: 40,                   // −0.15625 u/f² × 256 (2× accel — load-bearing feel)
  FLD_MAX: 896,                    // 3.5 u/f × 256 tested max (per-rating scaled)
  DIAG_NUM: 181,                   // diagonal × 181/256 ≈ 1/√2 [PROVEN]
  PICKUP_RADIUS: 25,               // auto-collect settled/rolling ball [MEASURED]
  CATCH_RADIUS: 16, CATCH_Z: 40,   // [OPEN] airborne catch volume placeholders
  THROW_SPEED: 14,                 // [OPEN] u/f authored throw speed
  THROW_ARRIVE_Z: 10,              // [DESIGN] throws arrive glove-high
  STEAL_POP_TIME: 54,              // [DESIGN v0.6] catcher exchange (frames) before a steal throw-down — makes the race honest

  // ── Fences [DESIGN, tuned to launch-table carry] ──
  // [v0.6] trimmed ~3%: with working throws the outfield swallows everything
  // deep (13-15 flyouts/game dying at the track); restores 2.5-5 runs band
  FENCE_CF: 2280, FENCE_CORNER: 1840, WALL_Z: 28,

  // ── Rules & pacing ──
  PHANTOM_MIN: 330, PHANTOM_MAX: 650, // [MEASURED] idle delay-penalty cadence
  PHANTOM_ANIM: 42,                // [MEASURED] phantom-pitch presentation length
  SCORE_CAP: [99, 98],             // [PROVEN quirk] asymmetric display caps (away/home)
  INNINGS: 3,                      // default game length (title menu offers 3/6/9); MBD season uses 9
  INNINGS_OPTS: [3, 6, 9],         // [v0.6 P1-3] title-menu game-length choices
  MAX_EXTRA: 6,
  CONTACT_BLANK: 6,                // [PROVEN] forced-blank frames, contact → field cut
  LIVENESS_FORCE: 900,             // [DESIGN guard] force-fetch after 15 s live
  LIVENESS_KILL: 1500,             // [DESIGN guard] hard dead-ball after 25 s — stall-proof
  ANGLE_STEPS: 2048,               // [PROVEN] 2048-step circle; quantize all vectors
};

// Runtime-tunable copies of every [OPEN] item (one-line swaps when empirics land)
const TUNE = {
  SWING_L: CONST.SWING_L, SWING_D: CONST.SWING_D,
  STEER_ACCEL: CONST.STEER_ACCEL, PITCH_STEER_X: CONST.PITCH_STEER_X,
  ROLL_VZ_THRESHOLD: CONST.ROLL_VZ_THRESHOLD, THROW_SPEED: CONST.THROW_SPEED,
  CATCH_RADIUS: CONST.CATCH_RADIUS, CATCH_Z: CONST.CATCH_Z,
  CPU_STEAL_PCT: 100,        // [v0.3 DESIGN] CPU steal aggression scale (0 disables; tests pin it)
};

/* ════════════════ SECTION §B — RNG ════════════════ */
// 5-byte shift-register PRNG — original re-expression of the recovered
// recurrence (pure algorithm = functional behavior, clean to reuse).
// Verified against the reference: 320 steps × 8 seeds, 0 mismatches.
function RNG(seed) {
  const s = seed && seed.length === 5 ? seed.slice() : [0x12, 0x34, 0x56, 0x78, 0x9A];
  this.a = s[0] & 0xFF; this.b = s[1] & 0xFF; this.c = s[2] & 0xFF; this.d = s[3] & 0xFF; this.e = s[4] & 0xFF;
}
RNG.prototype.next = function () {
  const fb = (((this.b >> 4) | ((this.c << 4) & 0xFF)) ^ (((this.e & 1) << 7) | (this.d >> 1))) & 0xFF;
  this.e = this.d; this.d = this.c; this.c = this.b; this.b = this.a; this.a = fb;
  return fb;
};
// Unbiased range helper — floor(byte × n / 256), the original's multiplier idiom [PROVEN]
RNG.prototype.range = function (n) { return (this.next() * n) >> 8; };
RNG.prototype.pick = function (arr) { return arr[this.range(arr.length)]; };
// Weighted choice from [weight, value] pairs (small cumulative tables — authentic texture)
RNG.prototype.weighted = function (pairs) {
  let total = 0; for (let i = 0; i < pairs.length; i++) total += pairs[i][0];
  let r = this.range(total);
  for (let i = 0; i < pairs.length; i++) { r -= pairs[i][0]; if (r < 0) return pairs[i][1]; }
  return pairs[pairs.length - 1][1];
};
RNG.prototype.state = function () { return [this.a, this.b, this.c, this.d, this.e]; };

/* ════════════════ SECTION §C — FIXED-POINT & ANGLES ════════════════ */
const SUB = 256;                       // 8.8 fixed point
const toSub = (u) => (u * SUB) | 0;
const toInt = (s) => s >> 8;           // floor conversion [PROVEN]
const TAU = Math.PI * 2;
// 2048-step circle [PROVEN granularity]. Modern impl: real trig, outputs
// quantized to 8.8 at assignment (per spec §6) — reproduces the grain.
function vecFromAngle(steps, speedU) {  // steps: 0 = toward CF (−y); + = toward RF (+x)
  const rad = (steps / CONST.ANGLE_STEPS) * TAU;
  return { vx: Math.round(Math.sin(rad) * speedU * SUB), vy: -Math.round(Math.cos(rad) * speedU * SUB) };
}
function degToSteps(d) { return Math.round(d / 360 * CONST.ANGLE_STEPS); }
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist2d = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); };

// Derived field geometry (world units, integer)
const GEO = (() => {
  const PX = CONST.PLATE_X, PY = CONST.PLATE_Y, B = CONST.BASE_DIST;
  const d = Math.round(B / Math.SQRT2); // 554
  return {
    plate: { x: PX, y: PY },
    mound: { x: PX, y: PY - CONST.MOUND_DIST },
    bases: [ { x: PX, y: PY },            // 0 = home
             { x: PX + d, y: PY - d },    // 1B
             { x: PX, y: PY - 2 * d },    // 2B
             { x: PX - d, y: PY - d } ],  // 3B
    // Fence distance from plate as a function of |azimuth| (0=CF, ±45°=lines)
    fenceDist(azSteps) {
      const a = Math.abs(azSteps) / degToSteps(45); // 0..1
      return Math.round(CONST.FENCE_CF - (CONST.FENCE_CF - CONST.FENCE_CORNER) * a * a);
    },
    // Fair iff within the 90° wedge toward the outfield
    isFair(x, y) { return y <= PY && Math.abs(x - PX) <= (PY - y); },
    azimuthOf(x, y) { // angle steps from CF axis as seen from the plate
      return Math.round(Math.atan2(x - PX, PY - y) / TAU * CONST.ANGLE_STEPS);
    },
    distFromPlate(x, y) { return dist2d(x, y, PX, PY); },
  };
})();

// Defensive spots [DESIGN]: position id → world coords
const FIELD_POS = (() => {
  const P = GEO.plate, spot = (azDeg, d) => {
    const r = azDeg / 360 * TAU;
    return { x: Math.round(P.x + Math.sin(r) * d), y: Math.round(P.y - Math.cos(r) * d) };
  };
  return [
    { id: 'P',  ...GEO.mound },
    { id: 'C',  x: P.x, y: P.y + 90 },
    { id: '1B', ...spot( 38, 850) },
    { id: '2B', ...spot( 14, 1050) },
    { id: '3B', ...spot(-38, 850) },
    { id: 'SS', ...spot(-14, 1050) },
    { id: 'LF', ...spot(-32, 1500) },   // [v0.3] wider + deeper: gaps open, more balls drop
    { id: 'CF', ...spot(  0, 1620) },
    { id: 'RF', ...spot( 32, 1500) },
  ];
})();
const POS_COVERS_BASE = { '1B': 1, '2B': 2, '3B': 3, 'C': 0, 'SS': 2, 'P': -1 };
