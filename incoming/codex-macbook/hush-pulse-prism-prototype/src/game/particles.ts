import * as THREE from "three";
import { GAME } from "./config";

export class ParticleField {
  readonly points: THREE.Points;
  private readonly positions = new Float32Array(GAME.MAX_PARTICLES * 3);
  private readonly colors = new Float32Array(GAME.MAX_PARTICLES * 3);
  private readonly velocity = new Float32Array(GAME.MAX_PARTICLES * 3);
  private readonly life = new Float32Array(GAME.MAX_PARTICLES);
  private readonly maxLife = new Float32Array(GAME.MAX_PARTICLES);
  private cursor = 0;
  private readonly color = new THREE.Color();

  constructor() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute("color", new THREE.BufferAttribute(this.colors, 3).setUsage(THREE.DynamicDrawUsage));
    const material = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false;
    for (let i = 0; i < GAME.MAX_PARTICLES; i++) this.positions[i * 3 + 1] = -100;
  }

  burst(x: number, y: number, z: number, color: number, count: number, speed = 4, upward = 3) {
    this.color.setHex(color);
    for (let n = 0; n < count; n++) {
      const i = this.cursor++ % GAME.MAX_PARTICLES;
      const p = i * 3;
      const angle = (n / Math.max(1, count)) * Math.PI * 2 + Math.sin(n * 91.7) * 0.35;
      const s = speed * (0.35 + ((n * 37) % 100) / 150);
      this.positions[p] = x;
      this.positions[p + 1] = y;
      this.positions[p + 2] = z;
      this.velocity[p] = Math.cos(angle) * s;
      this.velocity[p + 1] = upward * (0.3 + ((n * 17) % 100) / 100);
      this.velocity[p + 2] = Math.sin(angle) * s;
      this.colors[p] = this.color.r;
      this.colors[p + 1] = this.color.g;
      this.colors[p + 2] = this.color.b;
      this.life[i] = this.maxLife[i] = 0.35 + ((n * 13) % 60) / 100;
    }
  }

  trail(x: number, y: number, z: number, color: number) {
    this.burst(x, y, z, color, 1, 0.35, 0.25);
  }

  update(dt: number) {
    for (let i = 0; i < GAME.MAX_PARTICLES; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      const p = i * 3;
      if (this.life[i] <= 0) {
        this.positions[p + 1] = -100;
        continue;
      }
      this.velocity[p] *= 0.975;
      this.velocity[p + 2] *= 0.975;
      this.velocity[p + 1] -= 5.5 * dt;
      this.positions[p] += this.velocity[p] * dt;
      this.positions[p + 1] += this.velocity[p + 1] * dt;
      this.positions[p + 2] += this.velocity[p + 2] * dt;
      const fade = Math.max(0.1, this.life[i] / this.maxLife[i]);
      this.colors[p] *= 0.985 + fade * 0.015;
      this.colors[p + 1] *= 0.985 + fade * 0.015;
      this.colors[p + 2] *= 0.985 + fade * 0.015;
    }
    (this.points.geometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (this.points.geometry.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
  }

  dispose() {
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}
