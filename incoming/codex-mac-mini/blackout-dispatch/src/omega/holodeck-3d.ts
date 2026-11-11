import {
  getDomainHighlightColor,
  getPlddtColor,
  projectKrasBackbone,
} from './kras-structure';

export type HolodeckModelId = 'kras_p01116' | 'helix_mech' | 'agy_swarm';

/**
 * Interactive 3D Biomolecular & Cyber-Mech Holodeck Renderer.
 * Renders the authentic 189-residue AlphaFold KRAS (P01116) backbone with per-residue pLDDT
 * and Switch-II / G12C covalent docking pockets, plus 3D Mech & Swarm CAD models.
 */
export class Holodeck3DViewer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  model: HolodeckModelId = 'kras_p01116';
  showPlddtOnly = false;
  covalentDocked = true;
  yaw = 0.55;
  pitch = 0.28;
  zoom = 1.0;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private time = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.canvas.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.yaw += dx * 0.012;
      this.pitch = Math.max(-1.3, Math.min(1.3, this.pitch + dy * 0.012));
    });

    window.addEventListener('pointerup', () => {
      this.dragging = false;
    });

    this.canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.zoom = Math.max(0.55, Math.min(2.1, this.zoom - e.deltaY * 0.001));
      },
      { passive: false }
    );
  }

  render(dt: number): void {
    this.time += dt;
    if (!this.dragging) {
      this.yaw += dt * 0.45;
    }

    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#040814';
    ctx.fillRect(0, 0, w, h);

    // Subtle holographic coordinate grid
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < w; x += 36) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y < h; y += 36) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    const center = { x: w * 0.5, y: h * 0.52 };

    if (this.model === 'kras_p01116') {
      const pts = projectKrasBackbone(
        center,
        5.8 * this.zoom,
        this.yaw,
        this.pitch,
        0,
        this.time
      );

      // Draw C-alpha backbone trace
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const col = this.showPlddtOnly
          ? getPlddtColor(a.plddt)
          : getDomainHighlightColor(a.domain, a.plddt);
        ctx.strokeStyle = col;
        ctx.lineWidth = (a.domain === 'core' ? 4.2 : 6.8) * this.zoom;
        ctx.beginPath();
        ctx.moveTo(a.screenX, a.screenY);
        ctx.lineTo(b.screenX, b.screenY);
        ctx.stroke();
      }

      // Draw C-alpha spheres
      for (const p of pts) {
        ctx.fillStyle = this.showPlddtOnly
          ? getPlddtColor(p.plddt)
          : getDomainHighlightColor(p.domain, p.plddt);
        ctx.beginPath();
        ctx.arc(
          p.screenX,
          p.screenY,
          (p.domain === 'core' ? 2.5 : 4.2) * this.zoom,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Highlight G12C (Residue 12) & Switch-II Pocket (Residue 64) Covalent Warhead Bridge
      const g12c = pts[11];
      const sw2 = pts[63];
      const sw1 = pts[33];
      const hvr = pts[184];

      if (this.covalentDocked && g12c && sw2) {
        const midX = (g12c.screenX + sw2.screenX) * 0.5;
        const midY = (g12c.screenY + sw2.screenY) * 0.5;

        ctx.save();
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(g12c.screenX, g12c.screenY);
        ctx.lineTo(midX, midY);
        ctx.lineTo(sw2.screenX, sw2.screenY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Sotorasib / PROTAC Warhead Ligand Core
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(midX, midY, 8 * this.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('COVALENT WARHEAD DOCKED (CYS12 ↔ SWITCH-II)', midX, midY - 14);
        ctx.restore();
      }

      // Annotated Pin Callouts matching the Mol* Biomolecular Structure Viewer Sidecar!
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      const pins = [
        { pt: g12c, label: 'A 10–17: P-Loop G12C [300% CRIT]', color: '#00f2fe' },
        { pt: sw2, label: 'A 58–72: Switch-II Allosteric Pocket', color: '#ff6a00' },
        { pt: sw1, label: 'A 30–38: Switch-I Effector Loop', color: '#b721ff' },
        { pt: hvr, label: 'A 176–189: Disordered HVR Tail (<50 pLDDT)', color: '#facc15' },
      ];
      for (const pin of pins) {
        if (!pin.pt) continue;
        ctx.fillStyle = pin.color;
        ctx.beginPath();
        ctx.arc(pin.pt.screenX, pin.pt.screenY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(pin.label, pin.pt.screenX + 10, pin.pt.screenY + 4);
      }
    } else if (this.model === 'helix_mech') {
      // 3D Wireframe CAD of HELIX-04 XENOFOLD + Double-Helix Emitters
      ctx.save();
      ctx.translate(center.x, center.y);
      const r = 85 * this.zoom;
      for (let i = 0; i < 28; i++) {
        const t = (i / 28) * Math.PI * 4 + this.time * 3;
        const x = (i - 14) * 11 * this.zoom;
        const y1 = Math.sin(t) * 38 * this.zoom;
        const y2 = Math.sin(t + Math.PI) * 38 * this.zoom;

        ctx.strokeStyle = 'rgba(0, 242, 254, 0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();

        ctx.fillStyle = '#00f2fe';
        ctx.beginPath();
        ctx.arc(x, y1, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(x, y2, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else {
      // 3D Multi-Agent Constellation (AGY-00 ANTIGRAVITY)
      ctx.save();
      ctx.translate(center.x, center.y);
      const agents = [
        { name: '[AGY:STRIKER]', color: '#00f2fe', r: 95 },
        { name: '[AGY:AEGIS-PARRY]', color: '#facc15', r: 120 },
        { name: '[AGY:CHEM-DOCK]', color: '#10b981', r: 145 },
        { name: '[AGY:RECON-ITHACA]', color: '#b721ff', r: 170 },
      ];

      // Parent Orchestrator Core
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 18 * this.zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '700 11px "JetBrains Mono", monospace';
      agents.forEach((ag, idx) => {
        const a = this.yaw * (1.2 + idx * 0.25) + (idx * Math.PI) / 2;
        const ax = Math.cos(a) * ag.r * this.zoom;
        const ay = Math.sin(a) * ag.r * 0.62 * this.zoom;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.beginPath();
        ctx.ellipse(0, 0, ag.r * this.zoom, ag.r * 0.62 * this.zoom, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = ag.color;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ax, ay);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = ag.color;
        ctx.beginPath();
        ctx.arc(ax, ay, 7 * this.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(ag.name, ax + 11, ay + 4);
      });
      ctx.restore();
    }
  }
}
