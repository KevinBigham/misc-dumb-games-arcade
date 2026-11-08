import { HushPulseGame } from "./game";

declare global {
  interface Window {
    __gameProbe?: () => { x: number; y: number; z: number };
    __GAME_READY__?: boolean;
    __gameSnapshot?: () => ReturnType<HushPulseGame["getSnapshot"]>;
    __gameTest?: { clearWave: () => void; damage: (amount: number) => void; boss: () => void };
  }
}

let session: HushPulseGame | null = null;

export function startGame(canvas: HTMLCanvasElement): void {
  stopGame();
  const uiRoot = document.querySelector<HTMLElement>("#ui-overlay");
  if (!uiRoot) throw new Error("Missing #ui-overlay");
  const game = new HushPulseGame(canvas, uiRoot);
  session = game;
  window.__gameProbe = () => game.getProbe();
  window.__gameSnapshot = () => game.getSnapshot();
  if (new URLSearchParams(window.location.search).has("verify")) {
    window.__gameTest = { clearWave: () => game.testClearWave(), damage: (amount: number) => game.testDamage(amount), boss: () => game.testBoss() };
  }
}

export function stopGame(): void {
  session?.dispose();
  session = null;
  delete window.__gameProbe;
  delete window.__gameSnapshot;
  delete window.__gameTest;
  window.__GAME_READY__ = false;
}
