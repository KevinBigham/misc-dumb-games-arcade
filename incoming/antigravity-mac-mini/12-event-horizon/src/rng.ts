export interface RngState {
  state: number;
}

export class SeededRng {
  private state: number;

  constructor(seed: number = 20261108) {
    this.state = (seed >>> 0) || 0x1337beef;
  }

  public getState(): number {
    return this.state >>> 0;
  }

  public setState(newState: number): void {
    this.state = (newState >>> 0) || 0x1337beef;
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  public nextInt(minInclusive: number, maxInclusive: number): number {
    const low = Math.ceil(minInclusive);
    const high = Math.floor(maxInclusive);
    if (high <= low) return low;
    return low + Math.floor(this.next() * (high - low + 1));
  }

  public pick<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return items[this.nextInt(0, items.length - 1)];
  }

  public shuffle<T>(items: readonly T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }
}
