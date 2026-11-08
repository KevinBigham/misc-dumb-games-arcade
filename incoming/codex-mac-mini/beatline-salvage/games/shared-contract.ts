export interface ArgonGameMetadata {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  genre: string;
  primaryReference: string;
  supportingReference: string;
  oneSentenceLoop: string;
  shortGoal: string;
  longGoal: string;
  controlsSummary: string;
  accentColor: string;
}

export interface ArgonGameInstance {
  destroy(): void;
  getStateSnapshot?(): unknown;
  restartWithSeed?(seed: number): void;
  toggleDebug?(force?: boolean): void;
}

export interface ArgonGameModule {
  metadata: ArgonGameMetadata;
  mountGame(container: HTMLElement, options?: { initialSeed?: number; debug?: boolean }): ArgonGameInstance;
}
