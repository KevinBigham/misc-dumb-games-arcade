import { Vec2, clamp, lerp } from './math';

/**
 * Dynamic Arena Camera with trauma-squared shake, hit-stop freeze frames,
 * and smooth mouse-look lead.
 */
export class Camera {
  pos: Vec2 = { x: 1200, y: 1200 };
  zoom = 1.0;
  targetZoom = 1.0;
  trauma = 0;
  chromaticAberration = 0;
  hitStopTimer = 0;
  shakeOffset: Vec2 = { x: 0, y: 0 };
  shakeAngle = 0;
  private time = 0;

  addTrauma(amount: number, chromatic = 0): void {
    this.trauma = clamp(this.trauma + amount, 0, 1);
    this.chromaticAberration = Math.max(this.chromaticAberration, chromatic);
  }

  triggerHitStop(durationSeconds: number): void {
    this.hitStopTimer = Math.max(this.hitStopTimer, durationSeconds);
  }

  update(
    rawDt: number,
    playerPos: Vec2,
    aimPos: Vec2,
    arenaW: number,
    arenaH: number,
    viewW: number,
    viewH: number
  ): number {
    this.time += rawDt;

    if (this.hitStopTimer > 0) {
      this.hitStopTimer = Math.max(0, this.hitStopTimer - rawDt);
    }

    // Look-ahead toward aim cursor
    const leadX = clamp((aimPos.x - playerPos.x) * 0.14, -140, 140);
    const leadY = clamp((aimPos.y - playerPos.y) * 0.14, -110, 110);

    const desiredX = clamp(playerPos.x + leadX, viewW * 0.3, arenaW - viewW * 0.3);
    const desiredY = clamp(playerPos.y + leadY, viewH * 0.3, arenaH - viewH * 0.3);

    this.pos.x = lerp(this.pos.x, desiredX, clamp(rawDt * 8.5, 0, 1));
    this.pos.y = lerp(this.pos.y, desiredY, clamp(rawDt * 8.5, 0, 1));
    this.zoom = lerp(this.zoom, this.targetZoom, clamp(rawDt * 5, 0, 1));
    this.targetZoom = lerp(this.targetZoom, 1.0, clamp(rawDt * 2.5, 0, 1));

    if (this.trauma > 0) {
      const shake = this.trauma * this.trauma;
      this.shakeOffset.x = Math.sin(this.time * 67) * 22 * shake;
      this.shakeOffset.y = Math.cos(this.time * 53) * 22 * shake;
      this.shakeAngle = Math.sin(this.time * 41) * 0.024 * shake;
      this.trauma = Math.max(0, this.trauma - rawDt * 1.65);
    } else {
      this.shakeOffset.x = 0;
      this.shakeOffset.y = 0;
      this.shakeAngle = 0;
    }

    if (this.chromaticAberration > 0) {
      this.chromaticAberration = Math.max(0, this.chromaticAberration - rawDt * 28);
    }

    return this.hitStopTimer > 0 ? 0.05 : 1.0;
  }

  screenToWorld(screenX: number, screenY: number, viewW: number, viewH: number): Vec2 {
    return {
      x: this.pos.x + (screenX - viewW * 0.5) / this.zoom,
      y: this.pos.y + (screenY - viewH * 0.5) / this.zoom,
    };
  }
}
