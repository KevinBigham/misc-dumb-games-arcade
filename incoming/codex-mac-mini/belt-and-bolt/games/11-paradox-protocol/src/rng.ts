/**
 * Pure deterministic Mulberry32 PRNG with serializable state.
 */
export interface SeededRngState {
  seed: number;
  state: number;
  calls: number;
}

export class SeededRng {
  private seed: number;
  private state: number;
  private calls: number;

  constructor(seed: number = 20261107, restoredState?: number, restoredCalls: number = 0) {
    const cleanSeed = (Math.floor(Math.abs(seed)) || 20261107) >>> 0;
    this.seed = cleanSeed;
    this.state = restoredState !== undefined ? restoredState >>> 0 : cleanSeed;
    this.calls = restoredCalls;
  }

  public next(): number {
    this.calls += 1;
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    this.state = t >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  public nextInt(minInclusive: number, maxInclusive: number): number {
    return Math.floor(this.nextRange(minInclusive, maxInclusive + 1));
  }

  public pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Cannot pick from an empty array');
    }
    return items[this.nextInt(0, items.length - 1)];
  }

  public snapshot(): SeededRngState {
    return {
      seed: this.seed,
      state: this.state,
      calls: this.calls,
    };
  }

  public static fromSnapshot(snap: SeededRngState): SeededRng {
    return new SeededRng(snap.seed, snap.state, snap.calls);
  }
}
