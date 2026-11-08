import { startGame, stopGame } from "./boot";
import { shell } from "./shell";
document.getElementById("root")!.innerHTML = shell;
startGame(document.getElementById("game-canvas") as HTMLCanvasElement);
window.addEventListener("pagehide", stopGame, { once: true });
