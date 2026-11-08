export function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export class SeededRng {
  private state: number;

  constructor(seed: number) {
    const normalized = (Math.floor(seed) >>> 0) || 0x6d2b79f5;
    this.state = normalized;
  }

  /**
   * Returns a deterministic float in [0, 1) using Mulberry32.
   */
  nextFloat(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a deterministic float in [min, max).
   */
  nextRange(min: number, max: number): number {
    return min + this.nextFloat() * (max - min);
  }

  /**
   * Returns a deterministic integer in [min, max] inclusive.
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.nextRange(min, max + 1));
  }

  /**
   * Forks a new deterministic RNG derived from current state + salt string.
   */
  fork(salt: string): SeededRng {
    const combined = (this.state ^ hashString(salt)) >>> 0;
    return new SeededRng(combined || 1337);
  }
}
