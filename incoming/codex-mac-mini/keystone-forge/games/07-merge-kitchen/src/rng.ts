export interface RngStateSnapshot {
  seed: number;
  state: number;
  calls: number;
}

export class SeededRng {
  private seed: number;
  private state: number;
  private calls: number;

  constructor(seed: number, state?: number, calls = 0) {
    const normalizedSeed = (Number.isFinite(seed) ? Math.floor(seed) : 204807) >>> 0;
    this.seed = normalizedSeed === 0 ? 204807 : normalizedSeed;
    this.state = state !== undefined ? (state >>> 0) : this.seed;
    this.calls = calls;
  }

  public static fromSnapshot(snapshot: RngStateSnapshot): SeededRng {
    return new SeededRng(snapshot.seed, snapshot.state, snapshot.calls);
  }

  public getSnapshot(): RngStateSnapshot {
    return {
      seed: this.seed,
      state: this.state >>> 0,
      calls: this.calls,
    };
  }

  public clone(): SeededRng {
    return SeededRng.fromSnapshot(this.getSnapshot());
  }

  /**
   * Returns a deterministic float in [0, 1) using Mulberry32.
   */
  public nextFloat(): number {
    this.calls += 1;
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    this.state = this.state >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a deterministic integer in [minInclusive, maxInclusive].
   */
  public nextInt(minInclusive: number, maxInclusive: number): number {
    if (maxInclusive <= minInclusive) {
      return minInclusive;
    }
    const span = maxInclusive - minInclusive + 1;
    return minInclusive + Math.floor(this.nextFloat() * span);
  }

  public pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Cannot pick from an empty array');
    }
    const idx = this.nextInt(0, items.length - 1);
    return items[idx];
  }
}
