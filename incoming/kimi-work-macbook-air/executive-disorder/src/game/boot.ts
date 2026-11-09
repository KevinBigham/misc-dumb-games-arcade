import { StampDutyGame } from "./game";
import type { LawId } from "./types";

declare global {
  interface Window {
    __gameProbe?: () => { x: number; y: number; z: number };
    __GAME_READY__?: boolean;
    __stampDuty?: {
      snapshot: StampDutyGame["getSnapshot"];
      forceLaw: (id: LawId) => void;
      forceBoss: () => void;
      forceGameOver: () => void;
      forceVictory: () => void;
      spawnBusy: () => void;
      forceUpgrade: () => void;
      testSlam: StampDutyGame["testSlam"];
      testBank: StampDutyGame["testBank"];
      testBossHit: StampDutyGame["testBossHit"];
    };
  }
}

let session: StampDutyGame | null = null;
let readyFrame = 0;

export function startGame(canvas: HTMLCanvasElement): void {
  stopGame();
  const overlay = document.querySelector<HTMLElement>("#ui-overlay");
  if (!overlay) throw new Error("Missing #ui-overlay");
  session = new StampDutyGame(canvas, overlay);
  window.__gameProbe = session.getProbe;
  window.__stampDuty = {
    snapshot: session.getSnapshot,
    forceLaw: session.forceLaw,
    forceBoss: session.forceBoss,
    forceGameOver: session.forceGameOver,
    forceVictory: session.forceVictory,
    spawnBusy: session.spawnBusy,
    forceUpgrade: session.forceUpgrade,
    testSlam: session.testSlam,
    testBank: session.testBank,
    testBossHit: session.testBossHit,
  };
  const ready = () => {
    window.__GAME_READY__ = true;
    readyFrame = 0;
  };
  readyFrame = requestAnimationFrame(ready);
}

export function stopGame(): void {
  if (readyFrame) cancelAnimationFrame(readyFrame);
  readyFrame = 0;
  session?.dispose();
  session = null;
  delete window.__gameProbe;
  delete window.__stampDuty;
  window.__GAME_READY__ = false;
}
