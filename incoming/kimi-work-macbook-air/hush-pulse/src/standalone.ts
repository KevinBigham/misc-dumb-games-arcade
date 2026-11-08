import { startGame, stopGame } from "./game/boot";

const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
if (!canvas) throw new Error("Missing game canvas");
startGame(canvas);
window.addEventListener("pagehide", stopGame, { once: true });
