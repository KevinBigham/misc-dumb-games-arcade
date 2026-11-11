export interface SeededRng {
  next(): number;
  nextInt(maxExclusive: number): number;
  shuffle<T>(items: readonly T[]): T[];
  getState(): number;
  setState(state: number): void;
}

export function createSeededRng(seed: number): SeededRng {
  let state = (Math.floor(Math.abs(seed)) || 20261107) >>> 0;

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(maxExclusive: number): number {
    if (maxExclusive <= 1) return 0;
    return Math.floor(next() * maxExclusive);
  }

  function shuffle<T>(items: readonly T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = nextInt(i + 1);
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  return {
    next,
    nextInt,
    shuffle,
    getState: () => state,
    setState: (s: number) => {
      state = s >>> 0;
    },
  };
}
