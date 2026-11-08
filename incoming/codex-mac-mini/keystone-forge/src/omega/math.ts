export interface Vec2 {
  x: number;
  y: number;
}

export function vec2(x = 0, y = 0): Vec2 {
  return { x, y };
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

export function lenSq(v: Vec2): number {
  return v.x * v.x + v.y * v.y;
}

export function len(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

export function distSq(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalize(v: Vec2): Vec2 {
  const l = Math.hypot(v.x, v.y);
  if (l < 1e-8) return { x: 0, y: 0 };
  return { x: v.x / l, y: v.y / l };
}

export function angleBetween(from: Vec2, to: Vec2): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

export function fromAngle(angle: number, magnitude = 1): Vec2 {
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

export function lerpAngle(a: number, b: number, t: number): number {
  let diff = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * clamp(t, 0, 1);
}

export function circlesOverlap(aPos: Vec2, aRadius: number, bPos: Vec2, bRadius: number): boolean {
  const r = aRadius + bRadius;
  return distSq(aPos, bPos) <= r * r;
}

/**
 * Shortest distance squared from point P to line segment AB, plus projection parameter t in [0, 1].
 */
export function pointToSegmentDistSq(
  p: Vec2,
  a: Vec2,
  b: Vec2
): { distSq: number; t: number; closest: Vec2 } {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const abLenSq = abx * abx + aby * aby;
  if (abLenSq < 1e-8) {
    return { distSq: distSq(p, a), t: 0, closest: { x: a.x, y: a.y } };
  }
  const apx = p.x - a.x;
  const apy = p.y - a.y;
  const t = clamp((apx * abx + apy * aby) / abLenSq, 0, 1);
  const closest = { x: a.x + abx * t, y: a.y + aby * t };
  return { distSq: distSq(p, closest), t, closest };
}

/**
 * Deterministic Mulberry32 PRNG for Daily Seed Runs & reproducible combat tests.
 */
export class SeededRandom {
  private state: number;

  constructor(seedInput: string | number = Date.now()) {
    if (typeof seedInput === 'number') {
      this.state = seedInput >>> 0 || 0x1337beef;
    } else {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < seedInput.length; i++) {
        h ^= seedInput.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      this.state = h >>> 0 || 0x1337beef;
    }
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  int(min: number, maxInclusive: number): number {
    return Math.floor(this.range(min, maxInclusive + 1));
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }

  shuffle<T>(items: readonly T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }
}
