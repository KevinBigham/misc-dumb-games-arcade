import { Vec2, clamp, lerp } from './math';

export class Camera {
  pos: Vec2 = { x: 1200, y: 1200 };
  trauma = 0;
  shakeOffset: Vec2 = { x: 0, y: 0 };
  shakeAngle = 0;
  zoom = 1;
  targetZoom = 1;
  chromaticAberration = 0;
  hitStopTimer = 0;
  private time = 0;

  addTrauma(amount: number, chromaticBoost = 0): void {
    this.trauma = clamp(this.trauma + amount, 0, 1.25);
    this.chromaticAberration = Math.min(16, this.chromaticAberration + chromaticBoost);
  }

  triggerHitStop(durationSeconds: number): void {
    this.hitStopTimer = Math.max(this.hitStopTimer, durationSeconds);
  }

  update(
    rawDt: number,
    targetPos: Vec2,
    aimWorldPos: Vec2,
    arenaW: number,
    arenaH: number,
    viewW: number,
    viewH: number
  ): number {
    this.time += rawDt;

    if (this.hitStopTimer > 0) {
      this.hitStopTimer = Math.max(0, this.hitStopTimer - rawDt);
      return 0.02; // Micro time-crawl during impact freeze
    }

    // Look-ahead toward cursor aim
    const leadX = (aimWorldPos.x - targetPos.x) * 0.14;
    const leadY = (aimWorldPos.y - targetPos.y) * 0.14;

    const desiredX = clamp(
      targetPos.x + leadX,
      viewW * 0.35,
      Math.max(viewW * 0.65, arenaW - viewW * 0.35)
    );
    const desiredY = clamp(
      targetPos.y + leadY,
      viewH * 0.35,
      Math.max(viewH * 0.65, arenaH - viewH * 0.35)
    );

    const smooth = 1 - Math.pow(0.0008, rawDt);
    this.pos.x = lerp(this.pos.x, desiredX, smooth);
    this.pos.y = lerp(this.pos.y, desiredY, smooth);

    this.zoom = lerp(this.zoom, this.targetZoom, 1 - Math.pow(0.005, rawDt));
    this.targetZoom = lerp(this.targetZoom, 1, rawDt * 3.5);

    if (this.trauma > 0) {
      const shake = this.trauma * this.trauma;
      this.shakeOffset.x = Math.sin(this.time * 57.3) * 24 * shake;
      this.shakeOffset.y = Math.cos(this.time * 63.1) * 24 * shake;
      this.shakeAngle = Math.sin(this.time * 43.7) * 0.018 * shake;
      this.trauma = Math.max(0, this.trauma - rawDt * 2.1);
    } else {
      this.shakeOffset.x = 0;
      this.shakeOffset.y = 0;
      this.shakeAngle = 0;
    }

    this.chromaticAberration = Math.max(0, this.chromaticAberration - rawDt * 28);
    return 1;
  }

  screenToWorld(screenX: number, screenY: number, viewW: number, viewH: number): Vec2 {
    return {
      x: (screenX - viewW * 0.5) / this.zoom + this.pos.x,
      y: (screenY - viewH * 0.5) / this.zoom + this.pos.y,
    };
  }
}
