import { useEffect, useRef } from "react";
import { startGame, stopGame } from "@/game/boot";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    startGame(canvas);
    return () => stopGame();
  }, []);

  return (
    <main id="game-root">
      <canvas id="game-canvas" ref={canvasRef} aria-label="HUSH PULSE game arena" />
      <div id="ui-overlay" />
    </main>
  );
}
