/**
 * storage.ts — localStorage persistence (high score/progress/settings).
 * Browser-local storage: doesn't sync across devices, and clearing browser data loses it — state this to the user on delivery.
 */
const PREFIX = "game.";
export const storage = {
    get(key, fallback) {
        try {
            const raw = localStorage.getItem(PREFIX + key);
            return raw === null ? fallback : JSON.parse(raw);
        }
        catch {
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(PREFIX + key, JSON.stringify(value));
        }
        catch {
            // fails silently when storage is full/in private mode, without affecting the game
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(PREFIX + key);
        }
        catch {
            // same as set(): storage unavailable is not a game error
        }
    },
};
export const highScore = {
    get: () => storage.get("highScore", 0),
    set: (v) => storage.set("highScore", v),
};
