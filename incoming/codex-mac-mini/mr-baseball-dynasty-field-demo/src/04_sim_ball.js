/* ════════════════ SECTION §F1 — BALL PHYSICS (frame-exact core) ════════════════ */
// The sacred integrator [PROVEN 61/62 frames vs real capture]:
// all state 8.8 subunits; velocity-FIRST order is load-bearing.
//   vz -= 12;  x += vx;  y += vy;  z += vz;   zInt = z >> 8
function newBall() {
  return {
    xS: toSub(200), yS: toSub(408), zS: 0,           // off-field parking spot [MEASURED anchor]
    vxS: 0, vyS: 0, vzS: 0,
    mode: 'dead',            // dead|held|pitch|flight|rolling|throw
    heldBy: -1,              // fielder index when held
    t: 0,                    // frames in current mode
    pitch: null,             // authored pitch curve state
    bounces: 0, touchedGround: false, fairTouch: null, batted: false,
    throwTarget: -1, wallHit: false, pastFence: false, throwT: 0,
  };
}

// One tick of free flight / rolling. Emits via ev(type, data). steer = {ax, ay} sub/f².
function ballStep(b, ev, steerAx, steerAy) {
  if (b.mode === 'flight' || b.mode === 'throw') {
    b.vzS += CONST.GRAVITY_SUB;                    // velocity first [PROVEN]
    if (steerAx) b.vxS += steerAx;                 // batted-ball d-pad steering [MEASURED presence]
    if (steerAy) b.vyS += steerAy;
    b.xS += b.vxS; b.yS += b.vyS; b.zS += b.vzS;
    if (b.zS < 0) {                                // ground event
      b.zS = 0;
      const vzUp = -(b.vzS >> CONST.RESTITUTION_SHIFT);   // −(vz>>2) = 0.25 bounce [MEASURED/HYP]
      b.bounces++; b.touchedGround = true;
      if (ev) ev('bounce', { n: b.bounces });
      if (vzUp <= TUNE.ROLL_VZ_THRESHOLD) { b.mode = 'rolling'; b.vzS = 0; if (ev) ev('roll'); }
      else b.vzS = vzUp;
    }
  } else if (b.mode === 'rolling') {
    b.xS += b.vxS; b.yS += b.vyS; b.zS = 0;
    b.vxS = Math.trunc(b.vxS * CONST.ROLL_FACTOR);       // exponential decay [MEASURED n=278]
    b.vyS = Math.trunc(b.vyS * CONST.ROLL_FACTOR);
    if (Math.abs(b.vxS) + Math.abs(b.vyS) < CONST.ROLL_STOP_SPEED) {
      b.vxS = 0; b.vyS = 0; b.mode = 'settled'; if (ev) ev('settle');
    }
  }
  // world clamps [MEASURED bounds] — planar motion zeroed at hard edges
  const xI = toInt(b.xS), yI = toInt(b.yS);
  if (xI < 8 || xI > CONST.WORLD_W - 8) { b.xS = toSub(clamp(xI, 8, CONST.WORLD_W - 8)); b.vxS = 0; }
  if (yI < 8 || yI > CONST.WORLD_H - 8) { b.yS = toSub(clamp(yI, 8, CONST.WORLD_H - 8)); b.vyS = 0; }
  b.t++;
}

// Predicted landing point of an airborne ball (for fielder routing) — analytic
// on the same integer law, ignoring steering (fielders re-plan every few frames).
function predictLanding(b) {
  if (b.mode === 'rolling' || b.mode === 'settled') {
    // rolling: geometric series of exponential decay ≈ v/(1-f) remaining travel
    const rem = 1 / (1 - CONST.ROLL_FACTOR);
    return { x: toInt(b.xS + b.vxS * rem), y: toInt(b.yS + b.vyS * rem), tGround: 0 };
  }
  // solve frames until zS returns to 0 under vz' = vz - 12 (discrete)
  let vz = b.vzS, z = b.zS, t = 0;
  while (t < 1200) { vz += CONST.GRAVITY_SUB; z += vz; t++; if (z <= 0) break; }
  return { x: toInt(b.xS + b.vxS * t), y: toInt(b.yS + b.vyS * t), tGround: t };
}

/* ── Launch vector generation [HYPOTHESIS tables, PROVEN encodings] ── */
// quality: 4/2/0 · dDepth: signed timing units · dLat: signed lateral units
// batterHand: 'R'|'L' · pow: 0-15 rating (collapses to even tier — authentic)
function computeLaunch(rng, quality, dDepth, dLat, batterHand, pow) {
  // timing class [PROVEN 3-way signed classifier]
  const tc = dDepth <= -CONST.TIMING_DEADBAND ? 'early' : dDepth >= CONST.TIMING_DEADBAND ? 'late' : 'on';
  let az = LAUNCH.azTiming[tc];
  az += dLat * LAUNCH.azDLatGain;
  az += rng.range(LAUNCH.azJitter * 2) - LAUNCH.azJitter;
  if (batterHand === 'L') az = -az;              // mirror spray for lefties
  az = clamp(az, -620, 620);
  // elevation band (weighted) + speed from POW tier [PROVEN tier collapse: & ~1]
  const band = rng.weighted(LAUNCH.elev[quality]);
  const elevRaw = band[0] + rng.range(band[1] - band[0]);
  const speedRaw = LAUNCH.speedBase[quality] + (tier(pow) >> 1) * LAUNCH.powPerTier + rng.range(LAUNCH.rngSpan);
  // decode [PROVEN]: speed = raw/16 u/f · elevation = (raw−512)×360/2048 deg
  const speedU = speedRaw / 16;
  const elevRad = ((elevRaw - 512) / CONST.ANGLE_STEPS) * TAU;
  const planar = speedU * Math.cos(elevRad);
  const v = vecFromAngle(az, planar);            // quantized to 8.8 [spec §6]
  return {
    vxS: v.vx, vyS: v.vy,
    vzS: Math.round(Math.sin(elevRad) * speedU * SUB),
    az, elevRaw, speedRaw, timingClass: tc, quality,
  };
}

// Trajectory REPLACEMENT at contact [PROVEN] — the crisp 16-bit hit feel:
// discard pitch trajectory in one frame; snap z to bat plane; assign new vector.
function applyContact(ball, launch) {
  ball.zS = toSub(CONST.BAT_PLANE_Z);
  ball.vxS = launch.vxS; ball.vyS = launch.vyS; ball.vzS = launch.vzS;
  ball.mode = 'flight'; ball.t = 0; ball.bounces = 0; ball.touchedGround = false;
  ball.fairTouch = null; ball.wallHit = false; ball.pitch = null; ball.heldBy = -1;
  ball.batted = true; ball.pastFence = false;
}

// Authored throw: ballistic under the same gravity, arrives glove-high [DESIGN]
function setThrow(ball, fromXS, fromYS, target, ev) {
  const tx = toSub(target.x), ty = toSub(target.y);
  const d = dist2d(toInt(fromXS), toInt(fromYS), target.x, target.y);
  const T = Math.max(6, Math.round(d / TUNE.THROW_SPEED));
  ball.xS = fromXS; ball.yS = fromYS;
  if (toInt(ball.zS) < 12) ball.zS = toSub(14);
  ball.vxS = Math.round((tx - ball.xS) / T);
  ball.vyS = Math.round((ty - ball.yS) / T);
  // solve discrete ballistic: z(T) = z0 + Σ(vz0 + k·g) = z0 + vz0·T + g·T(T+1)/2
  const zTarget = toSub(CONST.THROW_ARRIVE_Z);
  ball.vzS = Math.round((zTarget - ball.zS - CONST.GRAVITY_SUB * T * (T + 1) / 2) / T);
  ball.mode = 'throw'; ball.t = 0; ball.heldBy = -1; ball.throwT = T;
  ball.bounces = 0; ball.touchedGround = false;
  if (ev) ev('throw', { T });
}
