export interface SeededRng {
  next(): number;
  nextInt(minInclusive: number, maxInclusive: number): number;
  pick<T>(items: readonly T[]): T;
  getState(): number;
}

export function mulberry32(seed: number): SeededRng {
  let state = seed >>> 0;
  if (state === 0) state = 0x6d2b79f5;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    nextInt(minInclusive: number, maxInclusive: number): number {
      const span = Math.max(1, maxInclusive - minInclusive + 1);
      return minInclusive + Math.floor(next() * span);
    },
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) {
        throw new Error('Cannot pick from an empty array');
      }
      const idx = Math.floor(next() * items.length);
      return items[idx];
    },
    getState(): number {
      return state >>> 0;
    },
  };
}
