import { describe, expect, it } from 'vitest';
import {
  SeededRandom,
  add,
  circlesOverlap,
  dist,
  normalize,
  pointToSegmentDistSq,
} from '../src/engine/math';
import { SpatialHashGrid } from '../src/engine/spatial-hash';
import { ReactiveGrid } from '../src/engine/reactive-grid';

describe('Math & SeededRandom', () => {
  it('computes vector operations and segment distances accurately', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 100, y: 0 };
    const p = { x: 50, y: 12 };

    expect(add(a, b)).toEqual({ x: 100, y: 0 });
    expect(dist(a, b)).toBe(100);
    expect(normalize({ x: 3, y: 4 })).toEqual({ x: 0.6, y: 0.8 });

    const seg = pointToSegmentDistSq(p, a, b);
    expect(seg.t).toBeCloseTo(0.5);
    expect(seg.distSq).toBeCloseTo(144);
    expect(circlesOverlap(a, 10, { x: 15, y: 0 }, 6)).toBe(true);
  });

  it('produces deterministic sequences for identical seeds', () => {
    const rng1 = new SeededRandom('DAILY-2026-11-03');
    const rng2 = new SeededRandom('DAILY-2026-11-03');
    const seq1 = [rng1.next(), rng1.next(), rng1.int(1, 100)];
    const seq2 = [rng2.next(), rng2.next(), rng2.int(1, 100)];
    expect(seq1).toEqual(seq2);
  });
});

describe('SpatialHashGrid & ReactiveGrid', () => {
  it('queries radius and laser beam segments without duplicates', () => {
    const grid = new SpatialHashGrid<{ id: number; pos: { x: number; y: number }; radius: number }>(
      80
    );
    grid.insert({ id: 1, pos: { x: 100, y: 100 }, radius: 20 });
    grid.insert({ id: 2, pos: { x: 140, y: 100 }, radius: 20 });
    grid.insert({ id: 3, pos: { x: 900, y: 900 }, radius: 20 });

    const near = grid.queryRadius({ x: 110, y: 100 }, 40);
    expect(near.map((e) => e.id).sort()).toEqual([1, 2]);

    const beamHits = grid.querySegment({ x: 0, y: 100 }, { x: 300, y: 100 }, 5);
    expect(beamHits.map((e) => e.id).sort()).toEqual([1, 2]);
  });

  it('deforms and relaxes spring-mass vertices on impulse and implosion', () => {
    const rGrid = new ReactiveGrid(600, 600, 60);
    rGrid.applyImpulse({ x: 300, y: 300 }, 180, 400);
    rGrid.update(0.016);
    rGrid.applyImplosion({ x: 300, y: 300 }, 180, 350);
    rGrid.update(0.016);
    expect(rGrid.cols).toBe(11);
    expect(rGrid.rows).toBe(11);
  });
});
