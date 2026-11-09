import * as THREE from "three";
import { WORLD } from "./config";
import { Random } from "./utils";
export class ParticleField {
  readonly mesh: THREE.InstancedMesh;
  private alive = new Uint8Array(WORLD.maxParticles); private x = new Float32Array(WORLD.maxParticles); private y = new Float32Array(WORLD.maxParticles); private z = new Float32Array(WORLD.maxParticles);
  private vx = new Float32Array(WORLD.maxParticles); private vy = new Float32Array(WORLD.maxParticles); private vz = new Float32Array(WORLD.maxParticles);
  private life = new Float32Array(WORLD.maxParticles); private maxLife = new Float32Array(WORLD.maxParticles); private size = new Float32Array(WORLD.maxParticles);
  private cursor = 0; private dummy = new THREE.Object3D(); private rng = new Random(0xdecaf);
  constructor() {
    this.mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.11, 0.07, 0.15), new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: true, transparent: true }), WORLD.maxParticles);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.mesh.frustumCulled = false;
    const color = new THREE.Color();
    for (let i = 0; i < WORLD.maxParticles; i++) { this.dummy.scale.setScalar(0); this.dummy.updateMatrix(); this.mesh.setMatrixAt(i, this.dummy.matrix); this.mesh.setColorAt(i, color.setHex(0xffffff)); }
  }
  burst(x: number, z: number, color: number, count = 16, force = 4, height = 0.3): void {
    const c = new THREE.Color(color);
    for (let n = 0; n < count; n++) {
      const i = this.cursor++ % WORLD.maxParticles; const angle = this.rng.range(0, Math.PI * 2); const speed = this.rng.range(force * 0.35, force);
      this.alive[i] = 1; this.x[i] = x; this.y[i] = height; this.z[i] = z;
      this.vx[i] = Math.cos(angle) * speed; this.vz[i] = Math.sin(angle) * speed; this.vy[i] = this.rng.range(force * 0.45, force * 1.2);
      this.life[i] = this.maxLife[i] = this.rng.range(0.35, 0.8); this.size[i] = this.rng.range(0.65, 1.65); this.mesh.setColorAt(i, c);
    }
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
  update(dt: number): void {
    for (let i = 0; i < WORLD.maxParticles; i++) {
      if (!this.alive[i]) continue;
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this.alive[i] = 0; this.dummy.scale.setScalar(0); }
      else {
        this.vy[i] -= 12 * dt; this.x[i] += this.vx[i] * dt; this.y[i] += this.vy[i] * dt; this.z[i] += this.vz[i] * dt;
        if (this.y[i] < 0.05) { this.y[i] = 0.05; this.vy[i] *= -0.28; this.vx[i] *= 0.72; this.vz[i] *= 0.72; }
        const t = this.life[i] / this.maxLife[i];
        this.dummy.position.set(this.x[i], this.y[i], this.z[i]); this.dummy.rotation.set(this.life[i] * 8, this.life[i] * 11, 0); this.dummy.scale.setScalar(this.size[i] * Math.min(1, t * 4));
      }
      this.dummy.updateMatrix(); this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
