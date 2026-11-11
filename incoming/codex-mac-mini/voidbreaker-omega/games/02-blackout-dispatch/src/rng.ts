export interface SeededRng {
  readonly seed: number;
  next(): number;
  nextInt(minInclusive: number, maxInclusive: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

export function createSeededRng(initialSeed: number): SeededRng {
  const normalizedSeed = (Math.floor(initialSeed) >>> 0) || 1;
  let state = normalizedSeed;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nextInt = (minInclusive: number, maxInclusive: number): number => {
    if (maxInclusive <= minInclusive) return minInclusive;
    return minInclusive + Math.floor(next() * (maxInclusive - minInclusive + 1));
  };

  const pick = <T>(items: readonly T[]): T => {
    if (items.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return items[nextInt(0, items.length - 1)];
  };

  const shuffle = <T>(items: readonly T[]): T[] => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = nextInt(0, i);
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  };

  return {
    seed: normalizedSeed,
    next,
    nextInt,
    pick,
    shuffle,
  };
}
