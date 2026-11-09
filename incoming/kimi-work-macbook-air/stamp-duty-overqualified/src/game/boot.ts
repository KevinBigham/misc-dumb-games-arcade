import { StampDuty } from "./stamp";

let session: StampDuty | null = null;

export function startGame(canvas: HTMLCanvasElement): void {
  stopGame();
  const overlay = document.getElementById("ui-overlay");
  if (!(overlay instanceof HTMLElement)) throw new Error("Missing game UI overlay");
  session = new StampDuty(canvas, overlay);
}

export function stopGame(): void {
  session?.dispose();
  session = null;
}
