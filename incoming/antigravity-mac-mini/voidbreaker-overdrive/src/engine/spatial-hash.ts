import { Vec2, distSq, pointToSegmentDistSq } from './math';

export interface SpatialEntity {
  id: number;
  pos: Vec2;
  radius: number;
}

/**
 * High-performance 2D Spatial Hash Grid for broad-phase collision detection
 * across thousands of projectiles, enemies, and shards at 60-120 FPS.
 */
export class SpatialHashGrid<T extends SpatialEntity> {
  private cellSize: number;
  private buckets: Map<number, T[]> = new Map();

  constructor(cellSize = 96) {
    this.cellSize = Math.max(16, cellSize);
  }

  clear(): void {
    this.buckets.clear();
  }

  private hashCoords(cx: number, cy: number): number {
    // 16-bit signed coordinate packing into a safe 32-bit integer key
    const hx = (cx + 32768) & 0xffff;
    const hy = (cy + 32768) & 0xffff;
    return (hx << 16) | hy;
  }

  insert(entity: T): void {
    const r = entity.radius;
    const minX = Math.floor((entity.pos.x - r) / this.cellSize);
    const maxX = Math.floor((entity.pos.x + r) / this.cellSize);
    const minY = Math.floor((entity.pos.y - r) / this.cellSize);
    const maxY = Math.floor((entity.pos.y + r) / this.cellSize);

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const key = this.hashCoords(cx, cy);
        let bucket = this.buckets.get(key);
        if (!bucket) {
          bucket = [];
          this.buckets.set(key, bucket);
        }
        bucket.push(entity);
      }
    }
  }

  /**
   * Returns all entities whose bounding circle overlaps the query circle (center, radius).
   */
  queryRadius(center: Vec2, radius: number): T[] {
    const minX = Math.floor((center.x - radius) / this.cellSize);
    const maxX = Math.floor((center.x + radius) / this.cellSize);
    const minY = Math.floor((center.y - radius) / this.cellSize);
    const maxY = Math.floor((center.y + radius) / this.cellSize);

    const seen = new Set<number>();
    const results: T[] = [];

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const bucket = this.buckets.get(this.hashCoords(cx, cy));
        if (!bucket) continue;
        for (let i = 0; i < bucket.length; i++) {
          const item = bucket[i];
          if (seen.has(item.id)) continue;
          const totalR = radius + item.radius;
          if (distSq(center, item.pos) <= totalR * totalR) {
            seen.add(item.id);
            results.push(item);
          }
        }
      }
    }
    return results;
  }

  /**
   * Returns all entities intersecting a laser beam / railgun segment AB with beam thickness `beamRadius`.
   */
  querySegment(a: Vec2, b: Vec2, beamRadius = 8): T[] {
    const minX = Math.floor((Math.min(a.x, b.x) - beamRadius) / this.cellSize);
    const maxX = Math.floor((Math.max(a.x, b.x) + beamRadius) / this.cellSize);
    const minY = Math.floor((Math.min(a.y, b.y) - beamRadius) / this.cellSize);
    const maxY = Math.floor((Math.max(a.y, b.y) + beamRadius) / this.cellSize);

    const seen = new Set<number>();
    const results: T[] = [];

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const bucket = this.buckets.get(this.hashCoords(cx, cy));
        if (!bucket) continue;
        for (let i = 0; i < bucket.length; i++) {
          const item = bucket[i];
          if (seen.has(item.id)) continue;
          const check = pointToSegmentDistSq(item.pos, a, b);
          const totalR = beamRadius + item.radius;
          if (check.distSq <= totalR * totalR) {
            seen.add(item.id);
            results.push(item);
          }
        }
      }
    }
    return results;
  }
}
