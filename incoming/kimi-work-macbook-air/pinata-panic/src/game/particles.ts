import * as THREE from "three";
import { CFG } from "./content";

export class ConfettiParticles {
  readonly points: THREE.Points;
  private readonly positions = new Float32Array(CFG.maxParticles * 3);
  private readonly colors = new Float32Array(CFG.maxParticles * 3);
  private readonly vx = new Float32Array(CFG.maxParticles);
  private readonly vy = new Float32Array(CFG.maxParticles);
  private readonly vz = new Float32Array(CFG.maxParticles);
  private readonly life = new Float32Array(CFG.maxParticles);
  private readonly maxLife = new Float32Array(CFG.maxParticles);
  private cursor = 0;
  private serial = 0;
  private readonly color = new THREE.Color();
  activeCount = 0;

  constructor() {
    for (let i = 0; i < CFG.maxParticles; i++) this.positions[i * 3 + 1] = -100;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));
    const material = new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, sizeAttenuation: true });
    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 3;
  }

  burst(x: number, y: number, z: number, color: number, count = 12, speed = 4): void {
    this.color.setHex(color);
    for (let n = 0; n < count; n++) {
      const i = this.cursor;
      this.cursor = (this.cursor + 1) % CFG.maxParticles;
      this.serial++;
      const a = this.serial * 2.399963 + n * 0.37;
      const radial = speed * (0.35 + ((this.serial * 37) % 100) / 140);
      const p = i * 3;
      this.positions[p] = x;
      this.positions[p + 1] = y;
      this.positions[p + 2] = z;
      this.vx[i] = Math.cos(a) * radial;
      this.vz[i] = Math.sin(a) * radial;
      this.vy[i] = speed * (0.4 + ((this.serial * 53) % 100) / 100);
      this.life[i] = 0.55 + ((this.serial * 29) % 100) / 130;
      this.maxLife[i] = this.life[i];
      const shade = 0.75 + ((this.serial * 17) % 100) / 400;
      this.colors[p] = Math.min(1, this.color.r * shade);
      this.colors[p + 1] = Math.min(1, this.color.g * shade);
      this.colors[p + 2] = Math.min(1, this.color.b * shade);
    }
  }

  update(dt: number): void {
    let active = 0;
    for (let i = 0; i < CFG.maxParticles; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      const p = i * 3;
      if (this.life[i] <= 0) {
        this.positions[p + 1] = -100;
        continue;
      }
      active++;
      this.vy[i] -= 9.5 * dt;
      this.vx[i] *= 1 - dt * 1.6;
      this.vz[i] *= 1 - dt * 1.6;
      this.positions[p] += this.vx[i] * dt;
      this.positions[p + 1] += this.vy[i] * dt;
      this.positions[p + 2] += this.vz[i] * dt;
      if (this.positions[p + 1] < 0.05) {
        this.positions[p + 1] = 0.05;
        this.vy[i] *= -0.28;
        this.vx[i] *= 0.75;
        this.vz[i] *= 0.75;
      }
      const fade = Math.min(1, this.life[i] / Math.max(0.001, this.maxLife[i] * 0.35));
      this.colors[p] *= 0.97 + fade * 0.03;
      this.colors[p + 1] *= 0.97 + fade * 0.03;
      this.colors[p + 2] *= 0.97 + fade * 0.03;
    }
    this.activeCount = active;
    (this.points.geometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (this.points.geometry.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
  }

  dispose(): void {
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}
