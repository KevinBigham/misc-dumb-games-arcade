import { SoupermarketGame } from "./game.js";
let session = null;
export function startGame(canvas) {
    stopGame();
    window.__GAME_READY__ = false;
    session = new SoupermarketGame(canvas);
    window.__gameProbe = () => {
        const position = session?.playerPosition;
        return { x: position?.x ?? 0, y: position?.y ?? 0, z: position?.z ?? 0 };
    };
}
export function stopGame() {
    session?.dispose();
    session = null;
    delete window.__gameProbe;
    window.__GAME_READY__ = false;
}
