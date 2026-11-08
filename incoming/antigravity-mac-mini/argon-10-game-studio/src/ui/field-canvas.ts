import { LiveGameState, Team } from '../models/types';

export class TacticalFieldCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animProgress = 1;
  private lastAnimStart = 0;
  private rafId: number | null = null;
  private currentLive: LiveGameState | null = null;
  private homeTeam: Team | null = null;
  private awayTeam: Team | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D context unavailable');
    this.ctx = ctx;
  }

  public triggerPlayAnimation(
    live: LiveGameState,
    homeTeam: Team,
    awayTeam: Team,
  ): void {
    this.currentLive = live;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.animProgress = 0;
    this.lastAnimStart = performance.now();

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    const step = (now: number) => {
      const elapsed = now - this.lastAnimStart;
      this.animProgress = Math.min(1, elapsed / 950);
      this.render();
      if (this.animProgress < 1) {
        this.rafId = requestAnimationFrame(step);
      } else {
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(step);
  }

  public renderStatic(
    live: LiveGameState,
    homeTeam: Team,
    awayTeam: Team,
  ): void {
    this.currentLive = live;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.animProgress = 1;
    this.render();
  }

  private render(): void {
    const live = this.currentLive;
    const home = this.homeTeam;
    const away = this.awayTeam;
    if (!live || !home || !away) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    const endzoneW = w * 0.085;
    const fieldW = w - endzoneW * 2;

    const yardToX = (yard0To100: number): number =>
      endzoneW + (yard0To100 / 100) * fieldW;
    const yardYToPx = (y0To53: number): number =>
      14 + (y0To53 / 53.3) * (h - 28);

    // 1. Turf stripes
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#14532d' : '#166534';
      const x0 = yardToX(i * 5);
      const x1 = yardToX((i + 1) * 5);
      ctx.fillRect(x0, 0, x1 - x0 + 0.5, h);
    }

    // 2. Endzones
    ctx.fillStyle = home.primaryColor;
    ctx.fillRect(0, 0, endzoneW, h);
    ctx.fillStyle = away.primaryColor;
    ctx.fillRect(w - endzoneW, 0, endzoneW, h);

    // Endzone labels
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(endzoneW / 2, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(home.name.toUpperCase(), 0, 0);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(w - endzoneW / 2, h / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(away.name.toUpperCase(), 0, 0);
    ctx.restore();

    // 3. Sideline & Yard Lines
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, w - 4, h - 4);

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.textAlign = 'center';

    for (let yd = 10; yd <= 90; yd += 10) {
      const x = yardToX(yd);
      ctx.strokeStyle = yd === 50 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.38)';
      ctx.lineWidth = yd === 50 ? 2.2 : 1.2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();

      const labelNum = yd <= 50 ? yd : 100 - yd;
      ctx.fillText(String(labelNum), x, 20);
      ctx.fillText(String(labelNum), x, h - 10);
    }

    // 4. Line of Scrimmage (Blue) & First Down Line (Yellow)
    const absLosYard =
      live.possession === 'HOME' ? live.ballOn : 100 - live.ballOn;
    const dir = live.possession === 'HOME' ? 1 : -1;
    const absFirstDownYard = Math.max(
      0,
      Math.min(100, absLosYard + dir * live.toGo),
    );

    const losPx = yardToX(absLosYard);
    const fdPx = yardToX(absFirstDownYard);

    // Blue LOS
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(losPx, 0);
    ctx.lineTo(losPx, h);
    ctx.stroke();

    // Yellow 1st Down Line
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fdPx, 0);
    ctx.lineTo(fdPx, h);
    ctx.stroke();

    // 5. Ball Trajectory Path
    const t = 1 - Math.pow(1 - this.animProgress, 3); // cubic ease-out
    if (live.lastPlayBallPath) {
      const bp = live.lastPlayBallPath;
      const sx = yardToX(bp.fromX);
      const sy = yardYToPx(bp.fromY);
      const ex = yardToX(bp.toX);
      const ey = yardYToPx(bp.toY);
      const curX = sx + (ex - sx) * t;
      const curY = sy + (ey - sy) * t;

      ctx.save();
      ctx.strokeStyle =
        bp.type === 'PASS'
          ? bp.complete
            ? '#fde047'
            : '#f87171'
          : '#fb923c';
      ctx.lineWidth = 2.5;
      if (bp.type === 'PASS') {
        ctx.setLineDash([6, 4]);
      }
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(curX, curY);
      ctx.stroke();
      ctx.restore();
    }

    // 6. Render 11-on-11 Player Tokens
    const offTeam = live.possession === 'HOME' ? home : away;
    const defTeam = live.possession === 'HOME' ? away : home;

    for (const tok of live.lastPlayTokens) {
      const sx = yardToX(tok.startX);
      const sy = yardYToPx(tok.startY);
      const ex = yardToX(tok.endX);
      const ey = yardYToPx(tok.endY);
      const cx = sx + (ex - sx) * t;
      const cy = sy + (ey - sy) * t;

      // Route trail
      ctx.strokeStyle =
        tok.side === 'OFF'
          ? 'rgba(255,255,255,0.25)'
          : 'rgba(248,113,113,0.22)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(cx, cy);
      ctx.stroke();

      // Hit Stick shockwave ring!
      if (tok.hitStickHighlight) {
        ctx.save();
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 13 + Math.sin(t * Math.PI) * 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Token circle
      const radius = tok.isBallCarrier ? 9.5 : 7.5;
      ctx.fillStyle =
        tok.side === 'OFF' ? offTeam.primaryColor : defTeam.primaryColor;
      ctx.strokeStyle = tok.isBallCarrier
        ? '#facc15'
        : tok.side === 'OFF'
          ? '#ffffff'
          : defTeam.accentColor;
      ctx.lineWidth = tok.isBallCarrier ? 2.5 : 1.6;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Token label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tok.label, cx, cy);
    }
  }
}
