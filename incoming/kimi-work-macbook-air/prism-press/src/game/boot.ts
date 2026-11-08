import { AudioSystem } from "./audio";
import { GameLoop } from "./engine";
import { GameModel, type UISnapshot } from "./model";
import { ReactorScene, type RenderStats } from "./scene";

declare global {
  interface Window {
    __gameProbe?: () => { x: number; y: number; z: number };
    __gameStats?: () => RenderStats;
    __prismSnapshot?: () => UISnapshot;
    __prismTest?: { model: GameModel; scene: ReactorScene };
    __GAME_READY__?: boolean;
  }
}

interface Session {
  model: GameModel;
  scene: ReactorScene;
  audio: AudioSystem;
  dispose: () => void;
}

let session: Session | null = null;
let dragging = false;

export const gameActions = {
  start(): void { session?.model.start(); },
  toTitle(): void { session?.model.toTitle(); },
  pause(): void { session?.model.pause(); },
  resume(): void { session?.model.resume(); },
  restart(): void { session?.model.start(); },
  continueSector(): void { session?.model.continueSector(); },
  continueEndless(): void { session?.model.continueEndless(); },
  rotate(): void { session?.model.rotate(); },
  hold(): void { session?.model.holdSelected(); },
  pulse(): void { session?.model.togglePulse(); },
  select(slot: number): void { session?.model.select(slot); },
  beginDrag(slot: number, x: number, y: number): void {
    if (!session || !session.model.select(slot)) return;
    dragging = true;
    session.scene.updatePointer(x, y);
  },
  toggleMute(): boolean {
    if (!session) return false;
    const muted = session.audio.toggleMute();
    if (!muted) session.audio.sfx("ui");
    window.dispatchEvent(new CustomEvent("prism:mute", { detail: muted }));
    return muted;
  },
};

export function startGame(canvas: HTMLCanvasElement, onSnapshot: (snapshot: UISnapshot) => void): void {
  stopGame();
  const model = new GameModel();
  const scene = new ReactorScene(canvas, model);
  const audio = new AudioSystem();

  const offUI = model.subscribe(() => {
    scene.markDirty();
    onSnapshot(model.snapshot());
  });
  const offEvents = model.onEvent((event) => {
    scene.handleEvent(event);
    switch (event.type) {
      case "start": audio.sfx("sector"); audio.startMusic(); break;
      case "place": audio.sfx("place"); break;
      case "invalid": audio.sfx("invalid"); break;
      case "clear": audio.sfx(event.strength && event.strength > 2 ? "combo" : "clear", event.strength); break;
      case "pulse": audio.sfx("pulse"); break;
      case "hold": audio.sfx("hold"); break;
      case "rotate": audio.sfx("rotate"); break;
      case "select": audio.sfx("select"); break;
      case "warning": audio.sfx("warning"); break;
      case "sector": audio.sfx("sector"); break;
      case "victory": audio.sfx("win"); break;
      case "gameover": audio.sfx("lose"); break;
      case "ui": audio.sfx("ui"); break;
    }
  });

  const onResize = () => scene.resize();
  const onKeyDown = (event: KeyboardEvent) => {
    const controlled = [
      "Space", "Enter", "Escape", "KeyP", "KeyM", "KeyR", "KeyH", "KeyQ",
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
      "KeyW", "KeyA", "KeyS", "KeyD", "Digit1", "Digit2", "Digit3",
    ];
    if (controlled.includes(event.code)) event.preventDefault();
    if (event.repeat) return;
    if (event.code === "KeyM") {
      gameActions.toggleMute();
      onSnapshot(model.snapshot());
      return;
    }

    if (model.phase === "title") {
      if (event.code === "Space" || event.code === "Enter") model.start();
      return;
    }
    if (model.phase === "gameover") {
      if (event.code === "Space" || event.code === "Enter") model.start();
      if (event.code === "Escape") model.toTitle();
      return;
    }
    if (model.phase === "victory") {
      if (event.code === "Space" || event.code === "Enter") model.continueEndless();
      if (event.code === "Escape") model.toTitle();
      return;
    }
    if (model.phase === "sector") {
      if (event.code === "Space" || event.code === "Enter") model.continueSector();
      return;
    }
    if (model.phase === "paused") {
      if (event.code === "Escape" || event.code === "KeyP" || event.code === "Space") model.resume();
      return;
    }

    switch (event.code) {
      case "Escape": model.pulseMode ? model.togglePulse() : model.pause(); break;
      case "KeyP": model.pause(); break;
      case "KeyR": model.rotate(); break;
      case "KeyH": model.holdSelected(); break;
      case "KeyQ": model.togglePulse(); break;
      case "Digit1": model.select(0); break;
      case "Digit2": model.select(1); break;
      case "Digit3": model.select(2); break;
      case "ArrowUp": case "KeyW": model.moveCursor(-1, 0); break;
      case "ArrowDown": case "KeyS": model.moveCursor(1, 0); break;
      case "ArrowLeft": case "KeyA": model.moveCursor(0, -1); break;
      case "ArrowRight": case "KeyD": model.moveCursor(0, 1); break;
      case "Enter":
        if (model.pulseMode) model.pulseAt(model.hoverRow, model.hoverCol);
        else model.placeSelected();
        break;
    }
  };

  const onCanvasPointerDown = (event: PointerEvent) => {
    if (model.phase !== "playing" || event.button !== 0) return;
    event.preventDefault();
    dragging = true;
    scene.updatePointer(event.clientX, event.clientY);
    try { canvas.setPointerCapture(event.pointerId); } catch { /* window fallback still tracks */ }
  };
  const onPointerMove = (event: PointerEvent) => {
    if (model.phase !== "playing") return;
    if (dragging || event.target === canvas) scene.updatePointer(event.clientX, event.clientY);
  };
  const onPointerUp = (event: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    if (model.phase === "playing") scene.dropPointer(event.clientX, event.clientY);
  };
  const onCancel = () => { dragging = false; };
  const onBlur = () => {
    dragging = false;
    if (model.phase === "playing") model.pause();
  };
  const onVisibility = () => { if (document.hidden) onBlur(); };

  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", onKeyDown, { passive: false });
  canvas.addEventListener("pointerdown", onCanvasPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onCancel);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onVisibility);

  const loop = new GameLoop({
    update: (dt) => {
      model.update(dt);
      scene.update(dt);
      audio.setIntensity(model.heat / 100);
      audio.setPlaying(model.phase === "playing");
      audio.update(dt);
    },
    render: () => {
      scene.render();
      window.__GAME_READY__ = true;
    },
  });
  loop.start();

  session = {
    model, scene, audio,
    dispose: () => {
      loop.stop();
      offUI();
      offEvents();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointerdown", onCanvasPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      scene.dispose();
      audio.dispose();
      dragging = false;
      delete window.__gameProbe;
      delete window.__gameStats;
      delete window.__prismSnapshot;
      delete window.__prismTest;
      window.__GAME_READY__ = false;
    },
  };

  window.__gameProbe = () => ({ x: model.hoverCol - 3, y: 0, z: model.hoverRow - 3 });
  window.__gameStats = () => scene.getStats();
  window.__prismSnapshot = () => model.snapshot();
  if (new URLSearchParams(window.location.search).has("verify")) {
    window.__prismTest = { model, scene };
  }
  onSnapshot(model.snapshot());
}

export function stopGame(): void {
  session?.dispose();
  session = null;
}
