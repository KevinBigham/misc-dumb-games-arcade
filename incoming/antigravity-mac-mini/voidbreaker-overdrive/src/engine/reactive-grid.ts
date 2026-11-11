import { Vec2, clamp } from './math';

interface GridNode {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
  hueShift: number;
}

/**
 * Geometry-Wars-inspired Hooke's Law Spring-Mass Warping Reactive Grid.
 * Explosions, dashes, singularities, and boss beams physically warp spacetime!
 */
export class ReactiveGrid {
  readonly cols: number;
  readonly rows: number;
  readonly spacing: number;
  readonly width: number;
  readonly height: number;
  private nodes: GridNode[];

  constructor(width: number, height: number, spacing = 60) {
    this.width = width;
    this.height = height;
    this.spacing = spacing;
    this.cols = Math.floor(width / spacing) + 1;
    this.rows = Math.floor(height / spacing) + 1;
    this.nodes = new Array(this.cols * this.rows);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const bx = c * spacing;
        const by = r * spacing;
        this.nodes[r * this.cols + c] = {
          baseX: bx,
          baseY: by,
          x: bx,
          y: by,
          vx: 0,
          vy: 0,
          energy: 0,
          hueShift: 0,
        };
      }
    }
  }

  /**
   * Push grid nodes radially outward (e.g. explosion, railgun blast, phase dash).
   */
  applyImpulse(pos: Vec2, radius: number, force: number, hueShift = 0): void {
    const rSq = radius * radius;
    const minC = Math.max(1, Math.floor((pos.x - radius) / this.spacing));
    const maxC = Math.min(this.cols - 2, Math.ceil((pos.x + radius) / this.spacing));
    const minR = Math.max(1, Math.floor((pos.y - radius) / this.spacing));
    const maxR = Math.min(this.rows - 2, Math.ceil((pos.y + radius) / this.spacing));

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const node = this.nodes[r * this.cols + c];
        const dx = node.x - pos.x;
        const dy = node.y - pos.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < rSq && d2 > 1) {
          const d = Math.sqrt(d2);
          const falloff = 1 - d / radius;
          const mag = force * falloff * falloff;
          node.vx += (dx / d) * mag;
          node.vy += (dy / d) * mag;
          node.energy = Math.min(1.5, node.energy + falloff * 0.9);
          node.hueShift = hueShift;
        }
      }
    }
  }

  /**
   * Pull grid nodes inward toward a gravity well / singularity mortar.
   */
  applyImplosion(pos: Vec2, radius: number, force: number, hueShift = 285): void {
    const rSq = radius * radius;
    const minC = Math.max(1, Math.floor((pos.x - radius) / this.spacing));
    const maxC = Math.min(this.cols - 2, Math.ceil((pos.x + radius) / this.spacing));
    const minR = Math.max(1, Math.floor((pos.y - radius) / this.spacing));
    const maxR = Math.min(this.rows - 2, Math.ceil((pos.y + radius) / this.spacing));

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const node = this.nodes[r * this.cols + c];
        const dx = pos.x - node.x;
        const dy = pos.y - node.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < rSq && d2 > 9) {
          const d = Math.sqrt(d2);
          const falloff = 1 - d / radius;
          const mag = force * falloff;
          node.vx += (dx / d) * mag;
          node.vy += (dy / d) * mag;
          node.energy = Math.min(1.6, node.energy + falloff * 0.7);
          node.hueShift = hueShift;
        }
      }
    }
  }

  update(dt: number): void {
    const stiffness = 26;
    const neighborCoupling = 7.5;
    const damping = Math.pow(0.04, dt);

    for (let r = 1; r < this.rows - 1; r++) {
      for (let c = 1; c < this.cols - 1; c++) {
        const idx = r * this.cols + c;
        const n = this.nodes[idx];

        // Restoring spring force to anchor point
        let fx = (n.baseX - n.x) * stiffness;
        let fy = (n.baseY - n.y) * stiffness;

        // Neighbor wave propagation
        const left = this.nodes[idx - 1];
        const right = this.nodes[idx + 1];
        const up = this.nodes[idx - this.cols];
        const down = this.nodes[idx + this.cols];

        const avgDx =
          left.x - left.baseX +
          (right.x - right.baseX) +
          (up.x - up.baseX) +
          (down.x - down.baseX);
        const avgDy =
          left.y - left.baseY +
          (right.y - right.baseY) +
          (up.y - up.baseY) +
          (down.y - down.baseY);

        fx += (avgDx * 0.25 - (n.x - n.baseX)) * neighborCoupling;
        fy += (avgDy * 0.25 - (n.y - n.baseY)) * neighborCoupling;

        n.vx = (n.vx + fx * dt) * damping;
        n.vy = (n.vy + fy * dt) * damping;

        n.x = clamp(n.x + n.vx * dt, n.baseX - this.spacing * 1.4, n.baseX + this.spacing * 1.4);
        n.y = clamp(n.y + n.vy * dt, n.baseY - this.spacing * 1.4, n.baseY + this.spacing * 1.4);
        n.energy = Math.max(0, n.energy - dt * 1.8);
      }
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    camX: number,
    camY: number,
    viewW: number,
    viewH: number,
    witchTimeFactor: number
  ): void {
    const startC = Math.max(0, Math.floor(camX / this.spacing) - 1);
    const endC = Math.min(this.cols - 1, Math.ceil((camX + viewW) / this.spacing) + 1);
    const startR = Math.max(0, Math.floor(camY / this.spacing) - 1);
    const endR = Math.min(this.rows - 1, Math.ceil((camY + viewH) / this.spacing) + 1);

    // Base grid pass
    ctx.lineWidth = 1;
    ctx.strokeStyle =
      witchTimeFactor > 0.1
        ? `rgba(0, 242, 254, ${0.14 + witchTimeFactor * 0.14})`
        : 'rgba(56, 189, 248, 0.11)';

    ctx.beginPath();
    for (let r = startR; r <= endR; r++) {
      for (let c = startC; c < endC; c++) {
        const a = this.nodes[r * this.cols + c];
        const b = this.nodes[r * this.cols + c + 1];
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
    }
    for (let c = startC; c <= endC; c++) {
      for (let r = startR; r < endR; r++) {
        const a = this.nodes[r * this.cols + c];
        const b = this.nodes[(r + 1) * this.cols + c];
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
    }
    ctx.stroke();

    // High-energy deformed segments pass
    for (let r = startR; r < endR; r++) {
      for (let c = startC; c < endC; c++) {
        const a = this.nodes[r * this.cols + c];
        if (a.energy < 0.08) continue;

        const right = this.nodes[r * this.cols + c + 1];
        const down = this.nodes[(r + 1) * this.cols + c];
        const alpha = Math.min(0.85, a.energy * 0.65);
        const hue = a.hueShift || 192;

        ctx.strokeStyle = `hsla(${hue}, 100%, 64%, ${alpha})`;
        ctx.lineWidth = 1 + a.energy * 1.4;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(right.x, right.y);
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(down.x, down.y);
        ctx.stroke();
      }
    }
  }
}
