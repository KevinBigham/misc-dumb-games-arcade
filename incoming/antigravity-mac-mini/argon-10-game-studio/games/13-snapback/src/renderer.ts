import { SNAPBACK_CONFIG, type SnapbackSimulation } from './sim';

export interface UpgradeCardBounds {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function getUpgradeCardRects(): UpgradeCardBounds[] {
  const cardW = 258;
  const cardH = 210;
  const gap = 24;
  const totalW = cardW * 3 + gap * 2;
  const startX = (SNAPBACK_CONFIG.WIDTH - totalW) * 0.5;
  const y = (SNAPBACK_CONFIG.HEIGHT - cardH) * 0.5 + 16;

  return [0, 1, 2].map((index) => ({
    index,
    x: startX + index * (cardW + gap),
    y,
    w: cardW,
    h: cardH,
  }));
}

export function renderSnapbackFrame(
  ctx: CanvasRenderingContext2D,
  sim: SnapbackSimulation,
  hoverCardIndex = -1
): void {
  const W = SNAPBACK_CONFIG.WIDTH;
  const H = SNAPBACK_CONFIG.HEIGHT;
  const M = SNAPBACK_CONFIG.WALL_MARGIN;

  ctx.save();
  // Apply directional camera shake proportional to impact force
  ctx.translate(sim.shakeX, sim.shakeY);

  // 1. Muted Obsidian Arena Background
  ctx.fillStyle = '#080b12';
  ctx.fillRect(-24, -24, W + 48, H + 48);

  // Subtle floor grid ticks (muted so cause & effect stays 100% readable)
  ctx.strokeStyle = '#101726';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = M + 60; gx < W - M; gx += 60) {
    ctx.moveTo(gx, M);
    ctx.lineTo(gx, H - M);
  }
  for (let gy = M + 60; gy < H - M; gy += 60) {
    ctx.moveTo(M, gy);
    ctx.lineTo(W - M, gy);
  }
  ctx.stroke();

  // Wave progress bar subtly integrated into the top arena wall border
  const waveProgress = Math.max(0, Math.min(1, sim.waveTimerS / SNAPBACK_CONFIG.WAVE_DURATION_S));
  ctx.strokeStyle = sim.player.snapTimerS > 0 ? '#00f2fe' : '#1e293b';
  ctx.lineWidth = 3;
  ctx.strokeRect(M, M, W - M * 2, H - M * 2);

  ctx.fillStyle = '#00f2fe';
  ctx.fillRect(M, M - 4, (W - M * 2) * waveProgress, 3);

  // Subtle Wave 1 floor prompt that vanishes the moment the player snaps once
  if (sim.wave === 1 && !sim.player.hasLaunchedOnce && sim.phase === 'playing') {
    ctx.save();
    ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
    ctx.font = '700 14px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'HOLD & RELEASE CLICK (OR SPACE) TO COIL & SNAP',
      W * 0.5,
      H - M - 24
    );
    ctx.restore();
  }

  // 2. Telegraphed Pulse Well Hazards (Wave 5+)
  for (const well of sim.pulseWells) {
    const progress = well.cycleTimerS / well.cyclePeriodS;
    ctx.save();
    ctx.beginPath();
    ctx.arc(well.x, well.y, well.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 42, 95, 0.38)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Expanding danger telegraph fill
    ctx.beginPath();
    ctx.arc(well.x, well.y, well.radius * progress, 0, Math.PI * 2);
    ctx.fillStyle =
      progress > 0.78 ? 'rgba(255, 42, 95, 0.28)' : 'rgba(255, 42, 95, 0.10)';
    ctx.fill();
    ctx.strokeStyle = '#ff2a5f';
    ctx.lineWidth = progress > 0.78 ? 3 : 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // 3. Plasma Wires (Upgrade: laser_wake)
  for (const wire of sim.plasmaWires) {
    const alpha = Math.max(0, wire.life / wire.maxLife);
    ctx.save();
    ctx.strokeStyle = `rgba(0, 242, 254, ${0.85 * alpha})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(wire.x1, wire.y1);
    ctx.lineTo(wire.x2, wire.y2);
    ctx.stroke();
    ctx.restore();
  }

  // 4. Echo Anchor (Upgrade: echo_anchor)
  if (sim.activeEchoAnchor) {
    const anc = sim.activeEchoAnchor;
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(anc.x, anc.y);
    ctx.lineTo(sim.player.x, sim.player.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#00f2fe';
    ctx.beginPath();
    ctx.arc(anc.x, anc.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 5. Kinetic Bumper Pylons (Wave 2+)
  for (const b of sim.bumpers) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(b.scaleX, b.scaleY);

    ctx.beginPath();
    ctx.arc(0, 0, b.radius + Math.sin(b.pulse) * 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.14)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, b.radius - 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#00f2fe';
    ctx.fill();
    ctx.restore();
  }

  // 6. Player Object Ribbon Trail
  for (const node of sim.playerTrail) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, node.alpha);
    ctx.fillStyle = node.color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, Math.max(2, node.radius), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 7. Prism Shards (Upgrade: wall_splitter)
  for (const s of sim.shards) {
    ctx.save();
    ctx.fillStyle = '#00f2fe';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 8. Enemies & High-Contrast Crimson Telegraphs
  for (const e of sim.enemies) {
    ctx.save();
    if (e.spawnTelegraphS > 0) {
      // Clear ground spawn beacon before enemy materializes
      const ratio = e.spawnTelegraphS / 0.85;
      ctx.strokeStyle = 'rgba(255, 42, 95, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius * (1 + ratio * 1.1), 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 42, 95, 0.25)';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius * (1 - ratio * 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    // Lancer Laser Attack Telegraph Line
    if (e.kind === 'lancer' && e.attackTelegraphS > 0) {
      const urgency = 1 - e.attackTelegraphS / 0.95;
      ctx.save();
      ctx.strokeStyle = urgency > 0.7 ? '#ffffff' : '#ff2a5f';
      ctx.lineWidth = 1.5 + urgency * 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.x + e.lockedAimX * 260, e.y + e.lockedAimY * 260);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.translate(e.x, e.y);
    ctx.rotate(e.stretchAngle || e.facingAngle);
    ctx.scale(e.scaleX, e.scaleY);

    if (e.kind === 'drifter') {
      ctx.beginPath();
      ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
      ctx.fillStyle = e.isBowlingProjectile ? '#fbbf24' : '#ff2a5f';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (e.kind === 'lancer') {
      // Crisp crimson diamond striker
      ctx.beginPath();
      ctx.moveTo(e.radius * 1.25, 0);
      ctx.lineTo(0, e.radius * 0.85);
      ctx.lineTo(-e.radius, 0);
      ctx.lineTo(0, -e.radius * 0.85);
      ctx.closePath();
      ctx.fillStyle = e.isBowlingProjectile ? '#fbbf24' : '#ff2a5f';
      ctx.fill();
      ctx.strokeStyle = '#ffd1dc';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (e.kind === 'bulwark') {
      ctx.beginPath();
      ctx.arc(0, 0, e.radius - 2, 0, Math.PI * 2);
      ctx.fillStyle = '#be123c';
      ctx.fill();

      // High-contrast reflective front shield arc
      ctx.beginPath();
      ctx.arc(0, 0, e.radius + 4, -1.05, 1.05);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 9. Charge Trajectory Preview & Elastic Slingshot Tether
  const p = sim.player;
  if (p.isCharging && sim.phase === 'playing') {
    const ratio = sim.getChargeRatio();
    const sweet = sim.isChargeInSweetSpot();
    const previewPts = sim.computeTrajectoryPreview();

    // Predicted multi-bounce trajectory line
    if (previewPts.length >= 2) {
      ctx.save();
      ctx.strokeStyle = sweet ? 'rgba(251, 191, 36, 0.78)' : 'rgba(0, 242, 254, 0.52)';
      ctx.lineWidth = sweet ? 3 : 2;
      ctx.setLineDash([7, 7]);
      ctx.beginPath();
      ctx.moveTo(previewPts[0].x, previewPts[0].y);
      for (let i = 1; i < previewPts.length; i++) {
        ctx.lineTo(previewPts[i].x, previewPts[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Charge ring with golden Sweet-Spot zone indicator
    const chargeRadius = SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS + 14;
    const sweetStartAng =
      -Math.PI * 0.5 +
      (SNAPBACK_CONFIG.SWEET_SPOT_MIN_S / SNAPBACK_CONFIG.MAX_CHARGE_TIME_S) * Math.PI * 2;
    const sweetEndAng =
      -Math.PI * 0.5 +
      (SNAPBACK_CONFIG.SWEET_SPOT_MAX_S / SNAPBACK_CONFIG.MAX_CHARGE_TIME_S) * Math.PI * 2;

    ctx.save();
    // Base ring
    ctx.beginPath();
    ctx.arc(p.x, p.y, chargeRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Sweet-spot bracket
    ctx.beginPath();
    ctx.arc(p.x, p.y, chargeRadius, sweetStartAng, sweetEndAng);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Current fill arc
    ctx.beginPath();
    ctx.arc(
      p.x,
      p.y,
      chargeRadius,
      -Math.PI * 0.5,
      -Math.PI * 0.5 + ratio * Math.PI * 2
    );
    ctx.strokeStyle = sweet ? '#fbbf24' : '#00f2fe';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  // 10. Orbiting Energy Saws during Sweet-Spot Flight (Upgrade: orbit_blades)
  if (p.snapTimerS > 0 && p.snapSweetSpotActive && sim.ownedUpgrades.has('orbit_blades')) {
    for (const offset of [0, Math.PI]) {
      const bx = p.x + Math.cos(p.orbitBladeAngle + offset) * 62;
      const by = p.y + Math.sin(p.orbitBladeAngle + offset) * 62;
      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, 13, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

  // 11. Player Entity (Weight, Anticipation Pullback, Squash-and-Stretch, Invuln Sheath)
  ctx.save();
  const pullback = p.isCharging ? sim.getChargeRatio() * 11 : 0;
  const renderX = p.x - p.dirX * pullback;
  const renderY = p.y - p.dirY * pullback;

  // Draw elastic anchor cord when pulled back
  if (pullback > 1) {
    ctx.strokeStyle = sim.isChargeInSweetSpot() ? '#fbbf24' : '#00f2fe';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x + p.dirX * 12, p.y + p.dirY * 12);
    ctx.lineTo(renderX, renderY);
    ctx.stroke();
  }

  ctx.translate(renderX, renderY);
  ctx.rotate(p.stretchAngle);
  ctx.scale(p.scaleX, p.scaleY);

  // Outer invulnerable kinetic dash sheath when snapping
  if (p.snapTimerS > 0) {
    ctx.beginPath();
    ctx.arc(0, 0, SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS + 6, 0, Math.PI * 2);
    ctx.fillStyle = p.snapSweetSpotActive
      ? 'rgba(251, 191, 36, 0.34)'
      : 'rgba(0, 242, 254, 0.28)';
    ctx.fill();
  }

  // Main Core body
  ctx.beginPath();
  ctx.arc(0, 0, SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle =
    p.invulnTimerS > 0 && Math.floor(p.invulnTimerS * 20) % 2 === 0
      ? '#ffffff'
      : p.snapSweetSpotActive || sim.isChargeInSweetSpot()
        ? '#fbbf24'
        : '#00f2fe';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner dark core & diegetic HP arcs
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#080b12';
  ctx.fill();
  ctx.restore();

  // Diegetic HP Pips around Player Core (no cluttered health bar UI)
  for (let h = 0; h < p.maxHp; h++) {
    const a0 = -Math.PI * 0.5 + (h / p.maxHp) * Math.PI * 2 + 0.12;
    const a1 = -Math.PI * 0.5 + ((h + 1) / p.maxHp) * Math.PI * 2 - 0.12;
    ctx.beginPath();
    ctx.arc(renderX, renderY, 10, a0, a1);
    ctx.strokeStyle = h < p.hp ? '#ffffff' : 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // 12. Push-Your-Luck Unbanked Pot & Golden Cash-Out Halo
  if (sim.unbankedChips > 0) {
    ctx.save();
    // Closing golden bank ring as bankProgress approaches 1.0
    if (sim.bankProgress > 0.05) {
      const ringRadius = 38 - sim.bankProgress * 16;
      ctx.beginPath();
      ctx.arc(
        p.x,
        p.y,
        ringRadius,
        -Math.PI * 0.5,
        -Math.PI * 0.5 + sim.bankProgress * Math.PI * 2
      );
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Floating Unbanked Pot badge above player
    ctx.font = '800 13px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(
      `${sim.unbankedChips} × ${sim.unbankedMult}`,
      p.x,
      p.y - SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS - 16
    );
    ctx.restore();
  }

  // 13. Exact Damage Contact Highlight (Rule 5: Always know why you got hit)
  if (sim.lastDamageContact) {
    ctx.save();
    ctx.strokeStyle = '#ff2a5f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sim.lastDamageContact.x, sim.lastDamageContact.y, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 14. Shockwaves, Particles & Floating Callouts
  for (const sw of sim.shockwaves) {
    const alpha = Math.max(0, sw.life / sw.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = sw.color;
    ctx.lineWidth = sw.lineWidth;
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  for (const pt of sim.particles) {
    const alpha = Math.max(0, pt.life / pt.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (const c of sim.callouts) {
    const alpha = Math.max(0, c.life / c.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `800 ${Math.round(14 * c.scale)}px "Inter", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = c.color;
    ctx.fillText(c.text, c.x, c.y);
    ctx.restore();
  }

  // 15. Aim Reticle at Cursor
  ctx.save();
  ctx.strokeStyle = p.isCharging ? '#fbbf24' : 'rgba(0, 242, 254, 0.65)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.aimX, p.aimY, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 16. Rule 7: Meaningful Between-Wave Choices (3 Cards, 1 Sentence Max)
  if (sim.phase === 'upgrade_choice') {
    ctx.save();
    ctx.fillStyle = 'rgba(8, 11, 18, 0.86)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 24px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`WAVE ${sim.wave} CLEARED — PICK 1 UPGRADE`, W * 0.5, 138);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px "Inter", system-ui, sans-serif';
    ctx.fillText('CLICK A CARD OR PRESS [1] [2] [3]', W * 0.5, 164);

    const rects = getUpgradeCardRects();
    rects.forEach((rect, i) => {
      const upg = sim.offeredUpgrades[i];
      if (!upg) return;
      const hovered = hoverCardIndex === i;

      ctx.fillStyle = hovered ? '#132038' : '#0d1424';
      ctx.strokeStyle = hovered ? '#00f2fe' : '#fbbf24';
      ctx.lineWidth = hovered ? 3 : 2;
      ctx.beginPath();
      ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 12);
      ctx.fill();
      ctx.stroke();

      // Key badge
      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 12px "Inter", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`[${i + 1}]`, rect.x + rect.w * 0.5, rect.y + 28);

      // Glyph
      ctx.font = '32px system-ui, sans-serif';
      ctx.fillText(upg.glyph, rect.x + rect.w * 0.5, rect.y + 68);

      // Title
      ctx.fillStyle = '#00f2fe';
      ctx.font = '800 16px "Inter", system-ui, sans-serif';
      ctx.fillText(upg.name, rect.x + rect.w * 0.5, rect.y + 102);

      // 1-Sentence Description (word-wrapped cleanly)
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '500 13px "Inter", system-ui, sans-serif';
      wrapCanvasText(
        ctx,
        upg.description,
        rect.x + rect.w * 0.5,
        rect.y + 132,
        rect.w - 28,
        18
      );
    });
    ctx.restore();
  }

  // 17. Game Over Overlay (Instant 1-Click / Space Restart)
  if (sim.phase === 'gameover') {
    ctx.save();
    ctx.fillStyle = 'rgba(8, 11, 18, 0.85)';
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff2a5f';
    ctx.font = '900 34px "Inter", system-ui, sans-serif';
    ctx.fillText('CORE SHATTERED', W * 0.5, H * 0.44);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 18px "Inter", system-ui, sans-serif';
    ctx.fillText(`FINAL SCORE: ${sim.score}  ·  WAVE ${sim.wave}`, W * 0.5, H * 0.52);

    ctx.fillStyle = '#00f2fe';
    ctx.font = '800 15px "Inter", system-ui, sans-serif';
    ctx.fillText('CLICK OR PRESS [SPACE] TO PLAY AGAIN', W * 0.5, H * 0.61);
    ctx.restore();
  }

  ctx.restore();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
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
      ctx.fillText(line, centerX, y);
      line = words[i];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, centerX, y);
  }
}
