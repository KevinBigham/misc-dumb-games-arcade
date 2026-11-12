import {
  ARENA_RADIUS,
  ROUND_DURATION_SEC,
  RicochetVaultState,
  VAULT_RADIUS,
} from './simulation';
import { UpgradeSpec, getUpgradeSpec } from './upgrades';

export interface UpgradeCardHitbox {
  index: number;
  spec: UpgradeSpec;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RenderTransform {
  cx: number;
  cy: number;
  scale: number;
  cardHitboxes: UpgradeCardHitbox[];
}

export function computeArenaTransform(width: number, height: number): {
  cx: number;
  cy: number;
  scale: number;
} {
  const minDim = Math.min(width, height);
  const scale = (minDim * 0.445) / ARENA_RADIUS;
  return {
    cx: width * 0.5,
    cy: height * 0.5,
    scale,
  };
}

export function renderRicochetVault(
  ctx: CanvasRenderingContext2D,
  state: RicochetVaultState,
  width: number,
  height: number,
  reducedMotion = false
): RenderTransform {
  const { cx, cy, scale } = computeArenaTransform(width, height);
  const shakeFactor = reducedMotion ? 0.2 : 1.0;

  // High-frequency micro-vibration during 40-60ms Hit-Stop freeze frames!
  const hitStopJitterX =
    state.hitStopMs > 0 && !reducedMotion
      ? Math.sin(state.hitStopVibrationPhase * 1.7) * 3.5
      : 0;
  const hitStopJitterY =
    state.hitStopMs > 0 && !reducedMotion
      ? Math.cos(state.hitStopVibrationPhase * 2.1) * 3.5
      : 0;

  const camX = cx + (state.shakeX + hitStopJitterX) * scale * shakeFactor;
  const camY = cy + (state.shakeY + hitStopJitterY) * scale * shakeFactor;

  ctx.save();

  // 1. Deep Obsidian Tactile Backdrop
  ctx.fillStyle = '#050814';
  ctx.fillRect(0, 0, width, height);

  // Subtle radial ambient glow behind arena (warms up as Greed Heat rises)
  const bgGrad = ctx.createRadialGradient(
    camX,
    camY,
    20 * scale,
    camX,
    camY,
    ARENA_RADIUS * 1.25 * scale
  );
  if (state.heat >= 0.6) {
    bgGrad.addColorStop(0, 'rgba(244, 63, 94, 0.16)');
    bgGrad.addColorStop(0.55, 'rgba(245, 158, 11, 0.09)');
    bgGrad.addColorStop(1, 'rgba(5, 8, 20, 0)');
  } else {
    bgGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    bgGrad.addColorStop(0.6, 'rgba(99, 102, 241, 0.06)');
    bgGrad.addColorStop(1, 'rgba(5, 8, 20, 0)');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Apply Camera & Scale Transform to Arena Coordinates
  ctx.save();
  ctx.translate(camX, camY);
  ctx.scale(scale, scale);

  // 2. Reactive Spring-Mass Grid Nodes
  ctx.fillStyle = state.heat >= 0.6 ? 'rgba(251, 113, 133, 0.24)' : 'rgba(56, 189, 248, 0.19)';
  for (const node of state.gridNodes) {
    const disp = Math.hypot(node.x - node.baseX, node.y - node.baseY);
    const r = 1.6 + Math.min(2.6, disp * 0.08);
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Outer Arena Boundary + Diegetic Round Quota Ring + 45s Timer Ring
  drawArenaPerimeterRings(ctx, state);

  // 4. Active Gravity Vortices (Singularity Anchor Upgrade)
  for (const v of state.vortices) {
    const ratio = v.life / v.maxLife;
    const vGrad = ctx.createRadialGradient(v.x, v.y, 4, v.x, v.y, v.radius);
    vGrad.addColorStop(0, `rgba(192, 132, 252, ${0.55 * ratio})`);
    vGrad.addColorStop(0.6, `rgba(126, 34, 206, ${0.2 * ratio})`);
    vGrad.addColorStop(1, 'rgba(126, 34, 206, 0)');
    ctx.fillStyle = vGrad;
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(216, 180, 254, ${0.7 * ratio})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.radius * 0.55, state.orbitalAngle, state.orbitalAngle + Math.PI * 1.5);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 5. Wormhole Wall Portals (if Wormhole Walls upgrade active)
  if (state.activeUpgrades.includes('wormhole_walls')) {
    ctx.save();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#818cf8';
    ctx.beginPath();
    ctx.arc(0, 0, ARENA_RADIUS - 2, -0.45, 0.45);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, ARENA_RADIUS - 2, Math.PI - 0.45, Math.PI + 0.45);
    ctx.stroke();
    ctx.restore();
  }

  // 6. Plasma Pinball Flippers (if Pinball Flippers upgrade active)
  if (state.activeUpgrades.includes('pinball_flippers')) {
    drawPinballFlippers(ctx, state);
  }

  // 7. Central Bank Vault Core & Diegetic Shield Hearts
  drawCentralVaultAndShields(ctx, state);

  // 8. Elastic Push-Your-Luck Tether from Center Vault to Primary Striker
  if (state.phase === 'in_flight' && state.strikers[0]) {
    drawGreedyTether(ctx, state, state.strikers[0]);
  }

  // 9. Predictive Bounce Trajectory Line & 3-Second Visual Onboarding
  if (state.phase === 'aiming') {
    drawAimingAndOnboarding(ctx, state);
  }

  // 10. Arena Pegs, Gold Jackpot Bumpers & Crimson Hazard Saws (with Squash & Stretch)
  for (const peg of state.pegs) {
    if (peg.respawnTimer > 0) {
      // Subtle ghost ring where peg will respawn
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(peg.baseX, peg.baseY, peg.radius * 0.65, 0, Math.PI * 2);
      ctx.stroke();
      continue;
    }
    drawPeg(ctx, state, peg);
  }

  // 11. Shockwaves & Jagged Tesla Lightning Arcs
  for (const sw of state.shockwaves) {
    ctx.save();
    ctx.strokeStyle = sw.color;
    ctx.globalAlpha = Math.max(0, sw.alpha);
    ctx.lineWidth = sw.lineWidth;
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  for (const arc of state.lightningArcs) {
    drawJaggedLightning(ctx, arc.x1, arc.y1, arc.x2, arc.y2, arc.color, arc.alpha);
  }

  // 12. Velocity-Inheriting Particles with Motion Trails
  for (const p of state.particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.strokeStyle = p.color;
    ctx.fillStyle = p.color;
    ctx.lineWidth = p.radius * 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.prevX, p.prevY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 13. Striker Balls (with Hooke's Law Squash & Stretch + On-Ball Multiplier/Pot HUD)
  for (const ball of state.strikers) {
    drawStrikerBall(ctx, state, ball);
  }

  // 14. Floating Spring Callouts
  for (const c of state.callouts) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(c.scale, c.scale);
    ctx.globalAlpha = c.alpha;
    ctx.textAlign = 'center';
    ctx.font = '900 18px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#020617';
    ctx.fillText(c.text, 0, 2);
    ctx.fillStyle = c.color;
    ctx.fillText(c.text, 0, 0);

    if (c.subtext) {
      ctx.font = '800 11px "Inter", system-ui, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(c.subtext, 0, 16);
    }
    ctx.restore();
  }

  ctx.restore(); // End Arena Transform

  // 15. Diegetic Corner Status & Active Upgrade Badges (Minimal, Zero Clutter)
  drawMinimalDiegeticOverlay(ctx, state, width, height);

  // 16. In-Canvas 1-of-3 Rule-Bending Upgrade Draft OR Game Over Overlay
  const cardHitboxes: UpgradeCardHitbox[] = [];
  if (state.phase === 'upgrade_draft') {
    cardHitboxes.push(...drawUpgradeDraftOverlay(ctx, state, width, height));
  } else if (state.phase === 'game_over') {
    drawGameOverOverlay(ctx, state, width, height);
  }

  ctx.restore();

  return { cx, cy, scale, cardHitboxes };
}

function drawArenaPerimeterRings(
  ctx: CanvasRenderingContext2D,
  state: RicochetVaultState
): void {
  // Local wall flex deformation on impact
  ctx.save();

  // Base Arena Floor Disc
  const floorGrad = ctx.createRadialGradient(0, 0, VAULT_RADIUS, 0, 0, ARENA_RADIUS);
  floorGrad.addColorStop(0, 'rgba(15, 23, 42, 0.88)');
  floorGrad.addColorStop(0.85, 'rgba(9, 13, 28, 0.94)');
  floorGrad.addColorStop(1, 'rgba(30, 41, 59, 0.96)');
  ctx.fillStyle = floorGrad;
  ctx.beginPath();
  ctx.arc(0, 0, ARENA_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // Outer Track Ring
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.65)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(0, 0, ARENA_RADIUS + 6, 0, Math.PI * 2);
  ctx.stroke();

  // DIEGETIC QUOTA PROGRESS RING (Gold outer arc + Cyan preview of Unbanked Pot!)
  const bankedRatio = Math.min(1, state.bankedScore / Math.max(1, state.roundQuota));
  const unbankedPot = state.unbankedChips * state.comboMult;
  const projectedRatio = Math.min(
    1,
    (state.bankedScore + unbankedPot) / Math.max(1, state.roundQuota)
  );
  const startAngle = -Math.PI / 2;

  if (projectedRatio > bankedRatio) {
    ctx.strokeStyle = state.heat >= 0.58 ? 'rgba(251, 113, 133, 0.65)' : 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(
      0,
      0,
      ARENA_RADIUS + 6,
      startAngle + bankedRatio * Math.PI * 2,
      startAngle + projectedRatio * Math.PI * 2
    );
    ctx.stroke();
  }

  if (bankedRatio > 0) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, ARENA_RADIUS + 6, startAngle, startAngle + bankedRatio * Math.PI * 2);
    ctx.stroke();
  }

  // DIEGETIC 45-SECOND TIMER ARC (Inner glowing perimeter ring)
  const timeRatio = Math.max(0, Math.min(1, state.roundTimerSec / ROUND_DURATION_SEC));
  ctx.strokeStyle =
    state.roundTimerSec < 10 ? '#f43f5e' : state.roundTimerSec < 20 ? '#fbbf24' : '#38bdf8';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, ARENA_RADIUS - 3, startAngle, startAngle + timeRatio * Math.PI * 2);
  ctx.stroke();

  // Top-of-Ring Embedded Diegetic Score Label
  ctx.textAlign = 'center';
  ctx.font = '900 13px "Inter", system-ui, sans-serif';
  ctx.fillStyle = '#f8fafc';
  const timerStr = `${Math.ceil(state.roundTimerSec)}s`;
  ctx.fillText(
    `ROUND ${state.round}  ·  VAULT ${state.bankedScore.toLocaleString()} / ${state.roundQuota.toLocaleString()}  ·  ⏱ ${timerStr}`,
    0,
    -ARENA_RADIUS - 18
  );

  ctx.restore();
}

function drawCentralVaultAndShields(
  ctx: CanvasRenderingContext2D,
  state: RicochetVaultState
): void {
  ctx.save();

  const unbankedPot = Math.round(state.unbankedChips * state.comboMult);
  const canBank = state.phase === 'in_flight' && unbankedPot > 0;
  const pulse = canBank ? 1 + Math.sin(state.onboardingPulseTime * 10) * 0.08 : 1;

  // Vault Core Glow
  const vaultGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, VAULT_RADIUS * 1.3 * pulse);
  if (canBank) {
    vaultGrad.addColorStop(0, 'rgba(250, 204, 21, 0.42)');
    vaultGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.16)');
    vaultGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  } else {
    vaultGrad.addColorStop(0, 'rgba(56, 189, 248, 0.24)');
    vaultGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  }
  ctx.fillStyle = vaultGrad;
  ctx.beginPath();
  ctx.arc(0, 0, VAULT_RADIUS * 1.3 * pulse, 0, Math.PI * 2);
  ctx.fill();

  // Vault Inner Disc
  ctx.fillStyle = '#090d1e';
  ctx.strokeStyle = canBank ? '#facc15' : '#38bdf8';
  ctx.lineWidth = canBank ? 4 : 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, VAULT_RADIUS * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // DIEGETIC HEALTH: 3 Orbital Shield Heart Segments hugging the Center Vault
  const shieldRadius = VAULT_RADIUS + 11;
  const segArc = (Math.PI * 2) / state.maxShields;
  const gap = 0.24;
  for (let i = 0; i < state.maxShields; i++) {
    const a0 = -Math.PI / 2 + i * segArc + gap * 0.5;
    const a1 = -Math.PI / 2 + (i + 1) * segArc - gap * 0.5;
    const active = i < state.shields;

    ctx.strokeStyle = active ? '#10b981' : 'rgba(71, 85, 105, 0.35)';
    ctx.lineWidth = active ? 5.5 : 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, shieldRadius, a0, a1);
    ctx.stroke();
  }

  // Center Vault Prompt Text
  ctx.textAlign = 'center';
  if (canBank) {
    ctx.font = '900 11px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText('BANK NOW', 0, -6);
    ctx.font = '900 14px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`+${unbankedPot.toLocaleString()}`, 0, 10);
    ctx.font = '700 9px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('[R-CLICK / SPACE]', 0, 23);
  } else if (state.phase === 'in_flight') {
    ctx.font = '800 10px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('RECALL', 0, 4);
  }

  ctx.restore();
}

function drawGreedyTether(
  ctx: CanvasRenderingContext2D,
  state: RicochetVaultState,
  ball: { x: number; y: number }
): void {
  if (state.unbankedChips <= 0) return;

  ctx.save();
  const isOverdrive = state.heat >= 0.58;
  const color = isOverdrive ? '#fb7185' : state.comboMult >= 5 ? '#facc15' : '#38bdf8';

  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.35 + Math.min(0.55, state.heat * 0.55);
  ctx.lineWidth = state.activeUpgrades.includes('supernova_recall') ? 4.5 : 2.5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(ball.x, ball.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawAimingAndOnboarding(
  ctx: CanvasRenderingContext2D,
  state: RicochetVaultState
): void {
  ctx.save();

  // Animated 3-Second Onboarding Pulse before first shot
  const dirX = state.isDraggingAim
    ? state.aimDirX
    : Math.cos(-1.05 + Math.sin(state.onboardingPulseTime * 1.8) * 0.35);
  const dirY = state.isDraggingAim
    ? state.aimDirY
    : Math.sin(-1.05 + Math.sin(state.onboardingPulseTime * 1.8) * 0.35);
  const tension = state.isDraggingAim
    ? state.aimTension
    : 0.55 + Math.sin(state.onboardingPulseTime * 3.2) * 0.25;

  const primary = state.strikers[0];
  const startX = primary ? primary.x : 0;
  const startY = primary ? primary.y : 0;

  // Elastic Slingshot Pullback Band cords to Vault Anchor
  if (state.isDraggingAim) {
    const perpX = -dirY * 14;
    const perpY = dirX * 14;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3 + tension * 2.5;
    ctx.beginPath();
    ctx.moveTo(perpX, perpY);
    ctx.lineTo(startX, startY);
    ctx.lineTo(-perpX, -perpY);
    ctx.stroke();
  }

  // Raycast predictive trajectory line to first peg or arena wall + 1 bounce preview!
  let hitDist = ARENA_RADIUS - 14;
  let hitPeg: { x: number; y: number; radius: number } | null = null;

  for (const peg of state.pegs) {
    if (peg.respawnTimer > 0) continue;
    const proj = peg.x * dirX + peg.y * dirY;
    if (proj <= 20) continue;
    const perpSq = peg.x * peg.x + peg.y * peg.y - proj * proj;
    const radSum = peg.radius + 14;
    if (perpSq < radSum * radSum) {
      const d = proj - Math.sqrt(radSum * radSum - perpSq);
      if (d > 20 && d < hitDist) {
        hitDist = d;
        hitPeg = peg;
      }
    }
  }

  const impactX = dirX * hitDist;
  const impactY = dirY * hitDist;

  // Primary Laser Aim Line
  ctx.strokeStyle = state.isDraggingAim ? '#38bdf8' : 'rgba(56, 189, 248, 0.68)';
  ctx.lineWidth = state.isDraggingAim ? 3 : 2.2;
  ctx.setLineDash([10, 8]);
  ctx.lineDashOffset = -state.onboardingPulseTime * 48;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(impactX, impactY);
  ctx.stroke();

  // Secondary Ricochet Preview Vector
  let nx = -impactX / (Math.hypot(impactX, impactY) || 1);
  let ny = -impactY / (Math.hypot(impactX, impactY) || 1);
  if (hitPeg) {
    const dx = impactX - hitPeg.x;
    const dy = impactY - hitPeg.y;
    const d = Math.hypot(dx, dy) || 1;
    nx = dx / d;
    ny = dy / d;
  }
  const dot = dirX * nx + dirY * ny;
  const rx = dirX - 2 * dot * nx;
  const ry = dirY - 2 * dot * ny;

  ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(impactX, impactY);
  ctx.lineTo(impactX + rx * 115, impactY + ry * 115);
  ctx.stroke();
  ctx.setLineDash([]);

  // Impact Target Reticle
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(impactX, impactY, 10, 0, Math.PI * 2);
  ctx.stroke();

  // 3-Second Rule Diegetic Prompt directly beside the Vault Core
  ctx.textAlign = 'center';
  if (!state.hasFiredFirstShot) {
    const bob = Math.sin(state.onboardingPulseTime * 4) * 4;
    ctx.font = '900 15px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('CLICK & DRAG TO SLINGSHOT', 0, VAULT_RADIUS + 42 + bob);
    ctx.font = '700 12px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText('RIGHT-CLICK OR [SPACE] MID-FLIGHT TO BANK COMBO POT', 0, VAULT_RADIUS + 60 + bob);
  } else {
    ctx.font = '800 12px "Inter", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
    ctx.fillText('DRAG TO AIM & LAUNCH  ·  [SPACE / RIGHT-CLICK] BANK POT', 0, VAULT_RADIUS + 38);
  }

  ctx.restore();
}

function drawPeg(
  ctx: CanvasRenderingContext2D,
  state: RicochetVaultState,
  peg: {
    kind: string;
    x: number;
    y: number;
    radius: number;
    scale: number;
    hitFlash: number;
    rotation: number;
  }
): void {
  ctx.save();
  ctx.translate(peg.x, peg.y);
  ctx.scale(peg.scale, peg.scale);

  if (peg.kind === 'hazard') {
    // Crimson Spinning Hazard Saw
    ctx.rotate(peg.rotation);
    const teeth = 8;
    ctx.fillStyle = peg.hitFlash > 0 ? '#ffffff' : '#f43f5e';
    ctx.strokeStyle = '#fecdd3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
      const r = i % 2 === 0 ? peg.radius * 1.18 : peg.radius * 0.72;
      const a = (i / (teeth * 2)) * Math.PI * 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner Danger Core
    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.arc(0, 0, peg.radius * 0.42, 0, Math.PI * 2);
    ctx.fill();
  } else if (peg.kind === 'jackpot') {
    // Heavy Gold Octagon Bumper
    ctx.rotate(peg.rotation);
    const sides = 8;
    ctx.fillStyle = peg.hitFlash > 0.2 ? '#ffffff' : '#f59e0b';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const rx = Math.cos(a) * peg.radius;
      const ry = Math.sin(a) * peg.radius;
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.rotate(-peg.rotation);
    ctx.fillStyle = '#020617';
    ctx.font = '900 11px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('2X', 0, 4);
  } else {
    // Crystal (Cyan) or Prism (Magenta) Peg
    const isPrism = peg.kind === 'prism';
    ctx.fillStyle =
      peg.hitFlash > 0.2 ? '#ffffff' : isPrism ? '#d946ef' : '#0ea5e9';
    ctx.strokeStyle = isPrism ? '#f5d0fe' : '#bae6fd';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, peg.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Specular highlight dot
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.beginPath();
    ctx.arc(-peg.radius * 0.3, -peg.radius * 0.3, peg.radius * 0.24, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawStrikerBall(
  ctx: CanvasRenderingContext2D,
  state: RicochetVaultState,
  ball: {
    isPhantom: boolean;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    squashParallel: number;
    squashPerp: number;
    squashAngle: number;
    trail: Array<{ x: number; y: number; alpha: number }>;
  }
): void {
  // 1. Velocity Ribbon Trail
  for (let i = 0; i < ball.trail.length; i++) {
    const t = ball.trail[i];
    const r = ball.radius * (1 - i / (ball.trail.length * 1.15));
    ctx.fillStyle =
      state.heat >= 0.58
        ? `rgba(251, 113, 133, ${t.alpha * 0.38})`
        : ball.isPhantom
          ? `rgba(192, 132, 252, ${t.alpha * 0.32})`
          : `rgba(56, 189, 248, ${t.alpha * 0.38})`;
    ctx.beginPath();
    ctx.arc(t.x, t.y, Math.max(2, r), 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Sawblade Orbitals Synergy (if unlocked)
  if (!ball.isPhantom && state.activeUpgrades.includes('orbital_blades')) {
    const orbitRadius = 38 + Math.min(48, state.comboMult * 2.4);
    ctx.save();
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, orbitRadius, 0, Math.PI * 2);
    ctx.stroke();

    for (let arm = 0; arm < 2; arm++) {
      const a = state.orbitalAngle + arm * Math.PI;
      const ox = ball.x + Math.cos(a) * orbitRadius;
      const oy = ball.y + Math.sin(a) * orbitRadius;
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#fdf2f8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ox, oy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. Striker Core with Squash & Stretch Spring Transform
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.squashAngle);
  ctx.scale(ball.squashParallel, ball.squashPerp);

  const isOverdrive = state.heat >= 0.58;
  ctx.fillStyle =
    state.hitStopMs > 0
      ? '#ffffff'
      : isOverdrive
        ? '#fb7185'
        : ball.isPhantom
          ? '#c084fc'
          : '#38bdf8';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // 4. DIEGETIC ON-BALL HUD: Thermal Risk Ring + Live Unbanked Pot & Combo Mult right on the ball!
  if (!ball.isPhantom && state.phase === 'in_flight') {
    ctx.save();
    ctx.translate(ball.x, ball.y);

    // Thermal Heat Arc around the ball
    if (state.heat > 0.02) {
      ctx.strokeStyle = state.heat >= 0.75 ? '#f43f5e' : state.heat >= 0.5 ? '#facc15' : '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius + 7, -Math.PI / 2, -Math.PI / 2 + state.heat * Math.PI * 2);
      ctx.stroke();
    }

    const pot = Math.round(state.unbankedChips * state.comboMult);
    if (pot > 0) {
      ctx.textAlign = 'center';
      ctx.font = '900 14px "Inter", system-ui, sans-serif';
      ctx.fillStyle = '#020617';
      ctx.fillText(`x${state.comboMult} · +${pot.toLocaleString()}`, 0, -ball.radius - 13);
      ctx.fillStyle = state.heat >= 0.6 ? '#fda4af' : '#fde047';
      ctx.fillText(`x${state.comboMult} · +${pot.toLocaleString()}`, 0, -ball.radius - 15);
    }

    ctx.restore();
  }
}

function drawPinballFlippers(
  ctx: CanvasRenderingContext2D,
  state: RicochetVaultState
): void {
  const y = ARENA_RADIUS * 0.66;
  ctx.save();
  ctx.lineCap = 'round';

  // Left Flipper
  ctx.strokeStyle = state.flipperFlashLeft > 0 ? '#ffffff' : '#facc15';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-140, y - 14);
  ctx.lineTo(-28, y + 8 - state.flipperFlashLeft * 22);
  ctx.stroke();

  // Right Flipper
  ctx.strokeStyle = state.flipperFlashRight > 0 ? '#ffffff' : '#facc15';
  ctx.beginPath();
  ctx.moveTo(140, y - 14);
  ctx.lineTo(28, y + 8 - state.flipperFlashRight * 22);
  ctx.stroke();

  ctx.restore();
}

function drawJaggedLightning(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  alpha: number
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const segments = 4;
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const mx = x1 + (x2 - x1) * t + (Math.sin(i * 19 + x1) * 12);
    const my = y1 + (y2 - y1) * t + (Math.cos(i * 23 + y1) * 12);
    ctx.lineTo(mx, my);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawMinimalDiegeticOverlay(
  ctx: CanvasRenderingContext2D,
  state: RicochetVaultState,
  width: number,
  height: number
): void {
  // Active Rule-Bending Upgrade Runes along bottom-center margin (purely visual icons)
  if (state.activeUpgrades.length > 0) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '800 12px "Inter", system-ui, sans-serif';
    const labels = state.activeUpgrades.map((id) => {
      const s = getUpgradeSpec(id);
      return `${s.symbol} ${s.name}`;
    });
    ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
    ctx.fillText(labels.join('   ·   '), width * 0.5, height - 16);
    ctx.restore();
  }
}

function drawUpgradeDraftOverlay(
  ctx: CanvasRenderingContext2D,
  state: RicochetVaultState,
  width: number,
  height: number
): UpgradeCardHitbox[] {
  const hitboxes: UpgradeCardHitbox[] = [];

  ctx.save();
  ctx.fillStyle = 'rgba(2, 6, 23, 0.82)';
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fde047';
  ctx.font = '900 14px "Inter", system-ui, sans-serif';
  ctx.fillText(`ROUND ${state.round} QUOTA CLEARED!`, width * 0.5, height * 0.17);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '900 28px "Inter", system-ui, sans-serif';
  ctx.fillText('PICK 1 RULE-BENDING SYNERGY', width * 0.5, height * 0.23);

  const cardW = Math.min(280, (width - 80) / 3);
  const cardH = Math.min(310, height * 0.52);
  const gap = 20;
  const totalW = cardW * state.draftChoices.length + gap * (state.draftChoices.length - 1);
  const startX = (width - totalW) * 0.5;
  const cardY = height * 0.29;

  state.draftChoices.forEach((spec, idx) => {
    const x = startX + idx * (cardW + gap);
    const y = cardY;

    // Card Backdrop
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = spec.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 16);
    ctx.fill();
    ctx.stroke();

    // Key Badge [1] [2] [3]
    ctx.fillStyle = spec.color;
    ctx.font = '900 12px "Inter", system-ui, sans-serif';
    ctx.fillText(`PRESS [${idx + 1}] OR CLICK`, x + cardW * 0.5, y + 28);

    // Visual Icon Emblem
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.arc(x + cardW * 0.5, y + 88, 38, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = spec.color;
    ctx.font = '900 34px "Inter", system-ui, sans-serif';
    ctx.fillText(spec.symbol, x + cardW * 0.5, y + 100);

    // Upgrade Title & Tagline
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 17px "Inter", system-ui, sans-serif';
    ctx.fillText(spec.name, x + cardW * 0.5, y + 156);

    ctx.fillStyle = spec.color;
    ctx.font = '800 11px "Inter", system-ui, sans-serif';
    ctx.fillText(spec.tagline, x + cardW * 0.5, y + 176);

    // Wrapped Rule Change Description
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 13px "Inter", system-ui, sans-serif';
    wrapCanvasText(ctx, spec.ruleChange, x + cardW * 0.5, y + 206, cardW - 32, 18);

    hitboxes.push({
      index: idx,
      spec,
      x,
      y,
      w: cardW,
      h: cardH,
    });
  });

  ctx.restore();
  return hitboxes;
}

function drawGameOverOverlay(
  ctx: CanvasRenderingContext2D,
  state: RicochetVaultState,
  width: number,
  height: number
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(2, 6, 23, 0.86)';
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fb7185';
  ctx.font = '900 36px "Inter", system-ui, sans-serif';
  ctx.fillText('VAULT SHIELDS SHATTERED', width * 0.5, height * 0.38);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '800 20px "Inter", system-ui, sans-serif';
  ctx.fillText(
    `TOTAL BANKED SCORE: ${state.totalRunScore.toLocaleString()}  ·  ROUND ${state.round}`,
    width * 0.5,
    height * 0.46
  );

  if (state.lastBustReason) {
    ctx.fillStyle = '#fda4af';
    ctx.font = '700 15px "Inter", system-ui, sans-serif';
    ctx.fillText(
      `LAST GREED MISTAKE: ${state.lastBustReason} (Lost ${state.lastBustAmount.toLocaleString()} Unbanked Pot)`,
      width * 0.5,
      height * 0.52
    );
  }

  ctx.fillStyle = '#fde047';
  ctx.font = '900 18px "Inter", system-ui, sans-serif';
  ctx.fillText('CLICK ANYWHERE OR PRESS [R / SPACE] FOR INSTANT REPLAY', width * 0.5, height * 0.62);

  ctx.restore();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
): void {
  const words = text.split(' ');
  let line = '';
  let y = startY;
  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, cx, y);
      line = words[i];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, cx, y);
  }
}
