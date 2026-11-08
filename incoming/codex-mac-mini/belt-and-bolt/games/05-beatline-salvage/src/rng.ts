/**
 * Deterministic Mulberry32 PRNG for reproducible daily tracks and chart generation.
 */
export class SeededRng {
  private state: number;

  constructor(seed: number) {
    this.state = (seed >>> 0) || 0x6d2b79f5;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(minInclusive: number, maxInclusive: number): number {
    return Math.floor(this.next() * (maxInclusive - minInclusive + 1)) + minInclusive;
  }

  pick<T>(items: readonly T[]): T {
    return items[this.nextInt(0, items.length - 1)];
  }
}

export function getTodayDailySeed(now: Date = new Date()): number {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  const d = now.getUTCDate();
  return y * 10000 + m * 100 + d;
}
