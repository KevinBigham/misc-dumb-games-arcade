import type { SlingCoreEngine } from './engine';
import { WAVE_DURATION } from './engine';

const COLOR_BG = '#090d16';
const COLOR_GRID = '#111827';
const COLOR_WALL = '#1e293b';
const COLOR_PLAYER = '#00f2fe'; // Strictly 1 color for player power (Rule 5)
const COLOR_DANGER = '#ff2a6d'; // Strictly 1 high-contrast color for danger (Rule 5)
const COLOR_WARNING = '#ffbe0b';
const COLOR_WHITE = '#f8fafc';

export class SlingCoreRenderer {
  public render(ctx: CanvasRenderingContext2D, engine: SlingCoreEngine): void {
    const { width, height, wallPadding } = engine;

    ctx.save();
    // 1. Muted Dark Slate Background (Rule 5)
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, width, height);

    // Apply directional camera spring shake (Rule 6)
    ctx.translate(engine.shakeX, engine.shakeY);

    // 2. Subtle geometric arena grid
    this.drawArenaBackdrop(ctx, engine);

    // 3. Upgrade Effects Underlay (Vortices, Plasma Wake, Tether Wire, Gravity Coil)
    this.drawUpgradeUnderlays(ctx, engine);

    // 4. Resonance Bumpers (Wave 3+)
    this.drawBumpers(ctx, engine);

    // 5. Aim Tension Coil & Predictive Wall-Bounce Sight (Rule 1 & Rule 4)
    if (engine.player.isCharging && engine.phase === 'playing') {
      this.drawChargeAimSight(ctx, engine);
    } else if (!engine.hasLaunchedEver && engine.phase === 'playing') {
      // Zero tutorial wall — just a subtle visual tension line inviting hold & release
      this.drawInitialInviteCue(ctx, engine);
    }

    // 6. Enemies & Telegraphs (Rule 5)
    this.drawEnemies(ctx, engine);

    // 7. Phantom Twins (Prism Split upgrade)
    this.drawPhantomTwins(ctx, engine);

    // 8. Player Core Entity with Ribbon Trail, Squash-and-Stretch & Integrity Rings (Rule 1 & Rule 6)
    this.drawPlayerCore(ctx, engine);

    // 9. Shockwaves, Particles & Floating Combo Pops
    this.drawShockwavesAndParticles(ctx, engine);
    this.drawFloatingPops(ctx, engine);

    // 10. Impact Flash Overlay
    if (engine.flashIntensity > 0.01) {
      ctx.fillStyle = `rgba(0, 242, 254, ${engine.flashIntensity * 0.16})`;
      ctx.fillRect(-32, -32, width + 64, height + 64);
    }

    ctx.restore();

    // 11. Minimal Top Edge Wave Progress Line (part of the arena border, 0 clutter)
    const waveProgress = Math.max(0, Math.min(1, 1 - engine.waveTimer / WAVE_DURATION));
    ctx.fillStyle = COLOR_PLAYER;
    ctx.fillRect(
      wallPadding,
      wallPadding - 2,
      (width - wallPadding * 2) * waveProgress,
      3,
    );
  }

  private drawArenaBackdrop(ctx: CanvasRenderingContext2D, engine: SlingCoreEngine): void {
    const { width, height, wallPadding } = engine;
    const innerW = width - wallPadding * 2;
    const innerH = height - wallPadding * 2;

    // Subtle grid lines
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 1;
    const step = 64;
    ctx.beginPath();
    for (let x = wallPadding + step; x < width - wallPadding; x += step) {
      ctx.moveTo(x, wallPadding);
      ctx.lineTo(x, height - wallPadding);
    }
    for (let y = wallPadding + step; y < height - wallPadding; y += step) {
      ctx.moveTo(wallPadding, y);
      ctx.lineTo(width - wallPadding, y);
    }
    ctx.stroke();

    // Arena Boundary Box
    ctx.strokeStyle = engine.player.isLaunching ? 'rgba(0, 242, 254, 0.45)' : COLOR_WALL;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(wallPadding, wallPadding, innerW, innerH);

    // Wall impact ripples (Rule 6)
    for (const r of engine.wallRipples) {
      const alpha = Math.max(0, r.life / 0.38) * r.intensity;
      const spread = (1 - r.life / 0.38) * 90 + 24;
      ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      if (r.side === 'left') {
        ctx.moveTo(wallPadding, Math.max(wallPadding, r.pos - spread));
        ctx.lineTo(wallPadding, Math.min(height - wallPadding, r.pos + spread));
      } else if (r.side === 'right') {
        ctx.moveTo(width - wallPadding, Math.max(wallPadding, r.pos - spread));
        ctx.lineTo(width - wallPadding, Math.min(height - wallPadding, r.pos + spread));
      } else if (r.side === 'top') {
        ctx.moveTo(Math.max(wallPadding, r.pos - spread), wallPadding);
        ctx.lineTo(Math.min(width - wallPadding, r.pos + spread), wallPadding);
      } else {
        ctx.moveTo(Math.max(wallPadding, r.pos - spread), height - wallPadding);
        ctx.lineTo(Math.min(width - wallPadding, r.pos + spread), height - wallPadding);
      }
      ctx.stroke();
    }
  }

  private drawUpgradeUnderlays(ctx: CanvasRenderingContext2D, engine: SlingCoreEngine): void {
    const p = engine.player;

    // Upgrade 3: Gravity Coil pull field while charging
    if (p.isCharging && engine.ownedUpgrades.has('gravity_coil')) {
      const fx = p.x + Math.cos(p.aimAngle) * 135;
      const fy = p.y + Math.sin(p.aimAngle) * 135;
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(fx, fy, 110 - p.chargeRatio * 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Upgrade 9: Vortex Finale singularities
    for (const v of engine.vortices) {
      const alpha = Math.min(1, v.life / 0.5) * 0.45;
      ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.radius * (0.35 + 0.65 * (v.life / v.maxLife)), 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(0, 242, 254, ${alpha * 0.35})`;
      ctx.beginPath();
      ctx.arc(v.x, v.y, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // Upgrade 5: Plasma Wake blazing trail
    for (const node of engine.plasmaWake) {
      const alpha = (node.life / node.maxLife) * 0.55;
      ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * (0.5 + 0.5 * (node.life / node.maxLife)), 0, Math.PI * 2);
      ctx.fill();
    }

    // Upgrade 2: Tether Wire lightning cord
    if (p.tetherActiveTimer > 0 && engine.ownedUpgrades.has('tether_wire')) {
      const alpha = Math.min(1, p.tetherActiveTimer / 0.4);
      ctx.strokeStyle = `rgba(0, 242, 254, ${alpha * 0.9})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.anchorX, p.anchorY);
      const midX = (p.anchorX + p.x) * 0.5 + (Math.random() - 0.5) * 10;
      const midY = (p.anchorY + p.y) * 0.5 + (Math.random() - 0.5) * 10;
      ctx.lineTo(midX, midY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      ctx.fillStyle = COLOR_PLAYER;
      ctx.beginPath();
      ctx.arc(p.anchorX, p.anchorY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawBumpers(ctx: CanvasRenderingContext2D, engine: SlingCoreEngine): void {
    for (const b of engine.bumpers) {
      const r = b.radius + b.pulse * 7;
      ctx.fillStyle = 'rgba(0, 242, 254, 0.10)';
      ctx.strokeStyle = COLOR_PLAYER;
      ctx.lineWidth = 2.5 + b.pulse * 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner diamond core
      ctx.fillStyle = COLOR_PLAYER;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 6 + b.pulse * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawInitialInviteCue(ctx: CanvasRenderingContext2D, engine: SlingCoreEngine): void {
    const p = engine.player;
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(engine.pointer.x, engine.pointer.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = 'rgba(0, 242, 254, 0.45)';
    ctx.beginPath();
    ctx.arc(engine.pointer.x, engine.pointer.y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawChargeAimSight(ctx: CanvasRenderingContext2D, engine: SlingCoreEngine): void {
    const p = engine.player;
    const segments = engine.computeAimPreviewSegments();

    // Draw predictive bounce trajectory line
    segments.forEach((seg, idx) => {
      const alpha = Math.max(0.18, 0.78 - idx * 0.25);
      ctx.strokeStyle = p.overchargeRatio > 0 ? COLOR_WHITE : `rgba(0, 242, 254, ${alpha})`;
      ctx.lineWidth = idx === 0 ? 2.5 + p.overchargeRatio * 2 : 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw elastic tension gauge arc around the Player Core (Push-Your-Luck visualization)
    const ringRadius = p.radius + 14;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Base charge arc (Cyan)
    ctx.strokeStyle = COLOR_PLAYER;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
      p.x,
      p.y,
      ringRadius,
      -Math.PI * 0.5,
      -Math.PI * 0.5 + Math.PI * 2 * p.chargeRatio,
    );
    ctx.stroke();

    // Overcharge Push-Your-Luck arc (Gold -> Danger Crimson as it nears Overheat!)
    if (p.overchargeRatio > 0) {
      ctx.strokeStyle = p.overchargeRatio > 0.78 ? COLOR_DANGER : COLOR_WARNING;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(
        p.x,
        p.y,
        ringRadius + 5,
        -Math.PI * 0.5,
        -Math.PI * 0.5 + Math.PI * 2 * p.overchargeRatio,
      );
      ctx.stroke();
    }
  }

  private drawEnemies(ctx: CanvasRenderingContext2D, engine: SlingCoreEngine): void {
    for (const e of engine.enemies) {
      // Spawn arrival beacon telegraph (Rule 5: never surprise-hit the player)
      if (e.spawnTimer > 0) {
        const progress = 1 - e.spawnTimer / 0.65;
        ctx.strokeStyle = `rgba(255, 42, 109, ${0.25 + progress * 0.6})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * (1.8 - progress * 0.8), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        continue;
      }

      // Dasher Lock-On Telegraph Laser (Rule 5)
      if (e.kind === 'dasher' && e.telegraphTimer > 0) {
        const urgency = 1 - e.telegraphTimer / 0.85;
        ctx.strokeStyle = urgency > 0.72 ? COLOR_WARNING : `rgba(255, 42, 109, ${0.35 + urgency * 0.65})`;
        ctx.lineWidth = 1.5 + urgency * 2.5;
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x + Math.cos(e.angle) * 340, e.y + Math.sin(e.angle) * 340);
        ctx.stroke();
      }

      // Pulse Orb detonation ring telegraph
      if (e.kind === 'pulse_orb' && e.telegraphTimer > 0) {
        const pRatio = 1 - e.telegraphTimer / 0.55;
        ctx.strokeStyle = COLOR_WARNING;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(e.x, e.y, 175 * pRatio, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);
      ctx.scale(e.scaleX, e.scaleY);

      const fillColor = e.hitFlash > 0.2 ? COLOR_WHITE : e.kind === 'pulse_orb' ? COLOR_WARNING : COLOR_DANGER;
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = COLOR_WHITE;
      ctx.lineWidth = 1.5;

      if (e.kind === 'drifter') {
        // Crisp Hexagon
        this.tracePolygon(ctx, 6, e.radius);
        ctx.fill();
        ctx.stroke();
      } else if (e.kind === 'dasher') {
        // Sharp Delta Spearhead
        ctx.beginPath();
        ctx.moveTo(e.radius * 1.25, 0);
        ctx.lineTo(-e.radius * 0.9, -e.radius * 0.85);
        ctx.lineTo(-e.radius * 0.45, 0);
        ctx.lineTo(-e.radius * 0.9, e.radius * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (e.kind === 'shielded') {
        // Octagon Body + Heavy Front Directional Shield Arc
        this.tracePolygon(ctx, 8, e.radius * 0.88);
        ctx.fill();
        ctx.stroke();

        if (e.hp > 1) {
          ctx.strokeStyle = COLOR_WARNING;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(0, 0, e.radius + 5, -0.85, 0.85);
          ctx.stroke();
        }
      } else if (e.kind === 'pulse_orb') {
        // Volatile Kinetic Sphere
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private drawPhantomTwins(ctx: CanvasRenderingContext2D, engine: SlingCoreEngine): void {
    for (const twin of engine.phantomTwins) {
      for (let i = 0; i < twin.trail.length; i++) {
        const pt = twin.trail[i];
        const alpha = (1 - i / twin.trail.length) * 0.4;
        ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, twin.radius * (1 - i / (twin.trail.length * 1.3)), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = COLOR_PLAYER;
      ctx.beginPath();
      ctx.arc(twin.x, twin.y, twin.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawPlayerCore(ctx: CanvasRenderingContext2D, engine: SlingCoreEngine): void {
    const p = engine.player;

    // 1. Object Ribbon Trail & Ghost Afterimages (Rule 6)
    for (let i = p.trail.length - 1; i >= 1; i--) {
      const node = p.trail[i];
      const ratio = 1 - i / p.trail.length;
      const alpha = (p.isLaunching ? 0.48 : 0.20) * ratio;
      ctx.save();
      ctx.translate(node.x, node.y);
      ctx.rotate(node.angle);
      ctx.scale(node.scaleX, node.scaleY);
      ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * (0.45 + 0.55 * ratio), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Upgrade 7: Orbital Glaives
    if (engine.ownedUpgrades.has('orbital_glaives')) {
      const orbitR = p.isCharging ? 66 + p.overchargeRatio * 24 : 44;
      for (let g = 0; g < 2; g++) {
        const a = p.glaiveAngle + g * Math.PI;
        const gx = p.x + Math.cos(a) * orbitR;
        const gy = p.y + Math.sin(a) * orbitR;
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(a + Math.PI * 0.5);
        ctx.fillStyle = COLOR_PLAYER;
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(-8, -7);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-8, 7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // 3. Player Core Body with Squash-and-Stretch (Rule 1 & Rule 6)
    const jitterX = p.overchargeRatio > 0 ? (Math.random() - 0.5) * 4 * p.overchargeRatio : 0;
    const jitterY = p.overchargeRatio > 0 ? (Math.random() - 0.5) * 4 * p.overchargeRatio : 0;

    ctx.save();
    ctx.translate(p.x + jitterX, p.y + jitterY);

    // Diegetic Integrity Rings (3 orbital shield arcs around the Core so 0 extra HUD bars are needed!)
    for (let i = 0; i < p.hp; i++) {
      const segAngle = (Math.PI * 2) / p.maxHp;
      const start = i * segAngle + p.glaiveAngle * 0.35 + 0.14;
      const end = (i + 1) * segAngle + p.glaiveAngle * 0.35 - 0.14;
      ctx.strokeStyle = p.invulnTimer > 0 && Math.floor(p.invulnTimer * 16) % 2 === 0 ? COLOR_WHITE : 'rgba(0, 242, 254, 0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 7, start, end);
      ctx.stroke();
    }

    ctx.rotate(p.visualAngle);
    ctx.scale(p.scaleX, p.scaleY);

    // Outer Cyan Energy Shell
    ctx.fillStyle = p.stunTimer > 0 ? COLOR_DANGER : COLOR_PLAYER;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner White-Hot Directional Spear Nucleus
    ctx.fillStyle = COLOR_WHITE;
    ctx.beginPath();
    ctx.moveTo(p.radius * 0.85, 0);
    ctx.lineTo(-p.radius * 0.45, -p.radius * 0.5);
    ctx.lineTo(-p.radius * 0.2, 0);
    ctx.lineTo(-p.radius * 0.45, p.radius * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Live Unbanked Chain Badge right beside the Core when chaining (Rule 4)
    if (engine.chainCount >= 2 || engine.unbankedPoints > 0) {
      ctx.font = '800 14px "Inter", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = engine.chainCount >= 4 ? COLOR_WARNING : COLOR_PLAYER;
      ctx.fillText(
        `×${Math.max(1, engine.chainCount)} CHAIN (${(engine.unbankedPoints * Math.max(1, engine.chainCount)).toLocaleString()})`,
        p.x,
        p.y + p.radius + 26,
      );
    }
  }

  private drawShockwavesAndParticles(ctx: CanvasRenderingContext2D, engine: SlingCoreEngine): void {
    for (const s of engine.shockwaves) {
      const progress = 1 - s.life / s.maxLife;
      const curR = s.radius + (s.maxRadius - s.radius) * progress;
      const alpha = Math.max(0, 1 - progress);
      const rgb =
        s.color === 'crimson'
          ? '255, 42, 109'
          : s.color === 'white'
            ? '248, 250, 252'
            : '0, 242, 254';
      ctx.strokeStyle = `rgba(${rgb}, ${alpha * 0.85})`;
      ctx.lineWidth = s.lineWidth * (1 - progress * 0.5);
      ctx.beginPath();
      ctx.arc(s.x, s.y, curR, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const pt of engine.particles) {
      const alpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle =
        pt.color === 'crimson'
          ? `rgba(255, 42, 109, ${alpha})`
          : pt.color === 'gold'
            ? `rgba(255, 190, 11, ${alpha})`
            : pt.color === 'white'
              ? `rgba(248, 250, 252, ${alpha})`
              : `rgba(0, 242, 254, ${alpha})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawFloatingPops(ctx: CanvasRenderingContext2D, engine: SlingCoreEngine): void {
    ctx.textAlign = 'center';
    for (const pop of engine.floatingPops) {
      const alpha = Math.min(1, (pop.life / pop.maxLife) * 1.4);
      ctx.save();
      ctx.translate(pop.x, pop.y);
      ctx.scale(pop.scale, pop.scale);
      ctx.font = '900 18px "Inter", system-ui, sans-serif';
      ctx.fillStyle =
        pop.color === 'crimson'
          ? `rgba(255, 42, 109, ${alpha})`
          : pop.color === 'gold'
            ? `rgba(255, 190, 11, ${alpha})`
            : `rgba(0, 242, 254, ${alpha})`;
      ctx.fillText(pop.text, 0, 0);

      if (pop.subtext) {
        ctx.font = '700 12px "Inter", system-ui, sans-serif';
        ctx.fillStyle = `rgba(248, 250, 252, ${alpha * 0.9})`;
        ctx.fillText(pop.subtext, 0, 20);
      }
      ctx.restore();
    }
  }

  private tracePolygon(ctx: CanvasRenderingContext2D, sides: number, radius: number): void {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
}
