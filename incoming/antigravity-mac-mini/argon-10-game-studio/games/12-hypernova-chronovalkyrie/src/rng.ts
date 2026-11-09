/**
 * Deterministic Mulberry32 PRNG with game helper utilities.
 */
export class HypernovaRNG {
  private state: number;

  constructor(seed: number) {
    this.state = (seed ^ 0x6d2b79f5) >>> 0;
  }

  /**
   * Returns a pseudo-random 32-bit unsigned integer.
   */
  nextUint32(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
  }

  /**
   * Returns a float in [0, 1).
   */
  nextFloat(): number {
    return this.nextUint32() / 4294967296.0;
  }

  /**
   * Returns a float in [min, max).
   */
  rangeFloat(min: number, max: number): number {
    return min + this.nextFloat() * (max - min);
  }

  /**
   * Returns an integer in [min, max] inclusive.
   */
  rangeInt(min: number, max: number): number {
    return Math.floor(this.rangeFloat(min, max + 1));
  }

  /**
   * Returns true with probability `chance` in [0, 1].
   */
  chance(probability: number): boolean {
    return this.nextFloat() < probability;
  }

  /**
   * Selects an item at random from an array.
   */
  pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return array[this.rangeInt(0, array.length - 1)];
  }

  /**
   * Performs an in-place or copied Fisher-Yates shuffle.
   */
  shuffle<T>(array: readonly T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.rangeInt(0, i);
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  /**
   * State serialization for deterministic snapshots.
   */
  getState(): number {
    return this.state;
  }

  setState(savedState: number): void {
    this.state = savedState >>> 0;
  }
}
