import { PinataGame, type GameStats } from "./game";

export interface PinataDebug {
  state: () => Record<string, unknown>;
  start: () => void;
  completeWave: () => void;
  setWave: (index: number) => void;
  gameOver: () => void;
  victory: () => void;
  hit: () => void;
  dash: (x?: number, z?: number) => void;
  teleport: (x: number, z: number) => void;
  setCandy: (value: number) => void;
  throwCandy: () => void;
  busy: () => void;
  openGift: () => void;
  choose: (index: number) => void;
}

declare global {
  interface Window {
    __gameProbe?: () => { x: number; y: number; z: number };
    __gameStats?: () => GameStats;
    __pinataDebug?: PinataDebug;
    __GAME_READY__?: boolean;
  }
}

let session: PinataGame | null = null;

export function startGame(canvas: HTMLCanvasElement): void {
  stopGame();
  const game = new PinataGame(canvas);
  session = game;
  window.__gameProbe = () => game.getProbe();
  window.__gameStats = () => game.getStats();
  if (new URLSearchParams(window.location.search).has("test")) {
    window.__pinataDebug = {
      state: () => game.getDebugState(),
      start: () => game.debugStart(),
      completeWave: () => game.debugCompleteWave(),
      setWave: (index) => game.debugSetWave(index),
      gameOver: () => game.debugGameOver(),
      victory: () => game.debugVictory(),
      hit: () => game.debugHit(),
      dash: (x, z) => game.debugDash(x, z),
      teleport: (x, z) => game.debugTeleport(x, z),
      setCandy: (value) => game.debugSetCandy(value),
      throwCandy: () => game.debugThrow(),
      busy: () => game.debugBusy(),
      openGift: () => game.debugOpenGift(),
      choose: (index) => game.debugChoose(index),
    };
  }
}

export function stopGame(): void {
  session?.dispose();
  session = null;
  delete window.__gameProbe;
  delete window.__gameStats;
  delete window.__pinataDebug;
  window.__GAME_READY__ = false;
}
