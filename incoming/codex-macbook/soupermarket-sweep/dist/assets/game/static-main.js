import { startGame, stopGame } from "./boot.js";
import { shell } from "./shell.js";
document.getElementById("root").innerHTML = shell;
startGame(document.getElementById("game-canvas"));
window.addEventListener("pagehide", stopGame, { once: true });
