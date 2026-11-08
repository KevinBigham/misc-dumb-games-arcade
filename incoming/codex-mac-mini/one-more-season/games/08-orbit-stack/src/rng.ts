export interface SeededRng {
  /** Current internal 32-bit state so runs can be serialized/restored deterministically */
  getState(): number;
  setState(state: number): void;
  /** Returns a float in [0, 1) */
  nextFloat(): number;
  /** Returns an integer in [minInclusive, maxExclusive) */
  nextInt(minInclusive: number, maxExclusive: number): number;
  /** Picks a deterministic element from a non-empty array */
  pick<T>(items: readonly T[]): T;
}

/**
 * Mulberry32 deterministic PRNG with serializable internal state.
 */
export function createSeededRng(initialSeed: number): SeededRng {
  let state = (initialSeed >>> 0) || 0x1337beef;

  const nextFloat = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nextInt = (minInclusive: number, maxExclusive: number): number => {
    if (maxExclusive <= minInclusive) return minInclusive;
    return minInclusive + Math.floor(nextFloat() * (maxExclusive - minInclusive));
  };

  const pick = <T>(items: readonly T[]): T => {
    if (items.length === 0) {
      throw new Error('Cannot pick from an empty array');
    }
    return items[nextInt(0, items.length)];
  };

  return {
    getState: () => state >>> 0,
    setState: (newState: number) => {
      state = (newState >>> 0) || 0x1337beef;
    },
    nextFloat,
    nextInt,
    pick,
  };
}
