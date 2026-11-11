import { SoupermarketGame } from "./game";

declare global {
  interface Window {
    __gameProbe?: () => { x: number; y: number; z: number };
    __GAME_READY__?: boolean;
  }
}

let session: SoupermarketGame | null = null;

export function startGame(canvas: HTMLCanvasElement): void {
  stopGame();
  window.__GAME_READY__ = false;
  session = new SoupermarketGame(canvas);
  window.__gameProbe = () => {
    const position = session?.playerPosition;
    return { x: position?.x ?? 0, y: position?.y ?? 0, z: position?.z ?? 0 };
  };
}

export function stopGame(): void {
  session?.dispose();
  session = null;
  delete window.__gameProbe;
  window.__GAME_READY__ = false;
}
