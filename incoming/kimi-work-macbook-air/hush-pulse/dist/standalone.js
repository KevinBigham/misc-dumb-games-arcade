import { startGame, stopGame } from "./src/game/boot.js";
const canvas = document.querySelector("#game-canvas");
if (!canvas) throw new Error("Missing game canvas");
startGame(canvas);
window.addEventListener("pagehide", stopGame, { once: true });
