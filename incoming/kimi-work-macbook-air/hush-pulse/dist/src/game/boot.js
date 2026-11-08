import { HushPulseGame } from "./game.js";
let session = null;
function startGame(canvas) {
  stopGame();
  const uiRoot = document.querySelector("#ui-overlay");
  if (!uiRoot) throw new Error("Missing #ui-overlay");
  const game = new HushPulseGame(canvas, uiRoot);
  session = game;
  window.__gameProbe = () => game.getProbe();
  window.__gameSnapshot = () => game.getSnapshot();
  if (new URLSearchParams(window.location.search).has("verify")) {
    window.__gameTest = { clearWave: () => game.testClearWave(), damage: (amount) => game.testDamage(amount), boss: () => game.testBoss() };
  }
}
function stopGame() {
  session?.dispose();
  session = null;
  delete window.__gameProbe;
  delete window.__gameSnapshot;
  delete window.__gameTest;
  window.__GAME_READY__ = false;
}
export {
  startGame,
  stopGame
};
