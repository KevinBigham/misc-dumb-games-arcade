import { Vec2, distSq, pointToSegmentDistSq } from './math';

export interface SpatialEntity {
  id: number;
  pos: Vec2;
  radius: number;
}

/**
 * High-speed 2D Spatial Hash Grid for broad-phase collision detection
 * across hundreds of swarm drones, projectiles, and railgun beams.
 */
export class SpatialHashGrid<T extends SpatialEntity> {
  private readonly cellSize: number;
  private readonly cells = new Map<string, T[]>();

  constructor(cellSize = 110) {
    this.cellSize = cellSize;
  }

  clear(): void {
    this.cells.clear();
  }

  private key(cx: number, cy: number): string {
    return `${cx},${cy}`;
  }

  insert(entity: T): void {
    const r = entity.radius;
    const minX = Math.floor((entity.pos.x - r) / this.cellSize);
    const maxX = Math.floor((entity.pos.x + r) / this.cellSize);
    const minY = Math.floor((entity.pos.y - r) / this.cellSize);
    const maxY = Math.floor((entity.pos.y + r) / this.cellSize);

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const k = this.key(cx, cy);
        let bucket = this.cells.get(k);
        if (!bucket) {
          bucket = [];
          this.cells.set(k, bucket);
        }
        bucket.push(entity);
      }
    }
  }

  queryRadius(center: Vec2, radius: number): T[] {
    const minX = Math.floor((center.x - radius) / this.cellSize);
    const maxX = Math.floor((center.x + radius) / this.cellSize);
    const minY = Math.floor((center.y - radius) / this.cellSize);
    const maxY = Math.floor((center.y + radius) / this.cellSize);

    const seen = new Set<number>();
    const results: T[] = [];

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const bucket = this.cells.get(this.key(cx, cy));
        if (!bucket) continue;
        for (const item of bucket) {
          if (seen.has(item.id)) continue;
          seen.add(item.id);
          const maxR = radius + item.radius;
          if (distSq(center, item.pos) <= maxR * maxR) {
            results.push(item);
          }
        }
      }
    }
    return results;
  }

  querySegment(a: Vec2, b: Vec2, beamRadius: number): T[] {
    const minX = Math.floor((Math.min(a.x, b.x) - beamRadius - 60) / this.cellSize);
    const maxX = Math.floor((Math.max(a.x, b.x) + beamRadius + 60) / this.cellSize);
    const minY = Math.floor((Math.min(a.y, b.y) - beamRadius - 60) / this.cellSize);
    const maxY = Math.floor((Math.max(a.y, b.y) + beamRadius + 60) / this.cellSize);

    const seen = new Set<number>();
    const results: T[] = [];

    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const bucket = this.cells.get(this.key(cx, cy));
        if (!bucket) continue;
        for (const item of bucket) {
          if (seen.has(item.id)) continue;
          seen.add(item.id);
          const totalR = beamRadius + item.radius;
          const seg = pointToSegmentDistSq(item.pos, a, b);
          if (seg.distSq <= totalR * totalR) {
            results.push(item);
          }
        }
      }
    }
    return results;
  }
}
