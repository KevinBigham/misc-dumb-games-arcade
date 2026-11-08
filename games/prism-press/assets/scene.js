import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { BOARD_SIZE, PALETTE, TUNING, shapeBounds } from "./config.js";
const CELL = 1.03;
const HALF = (BOARD_SIZE - 1) / 2;
const MAX_GHOST = 9;
/** WebGL presentation layer. Rules and input state stay in GameModel. */
export class ReactorScene {
    canvas;
    model;
    renderer;
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-8, 8, 6, -6, 0.1, 100);
    boardGroup = new THREE.Group();
    blockGeometry = new RoundedBoxGeometry(0.86, 0.42, 0.86, 3, 0.09);
    blockMaterials;
    glitchMaterial;
    blocks = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () => null);
    dirty = true;
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    boardPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.3);
    hitPoint = new THREE.Vector3();
    ghosts = [];
    ghostMaterial = new THREE.MeshBasicMaterial({
        color: 0x66f7d4, transparent: true, opacity: 0.48, depthWrite: false,
    });
    particles = [];
    particleMesh;
    particleCursor = 0;
    dummy = new THREE.Object3D();
    beams = [];
    shockwaves = [];
    ringGroup = new THREE.Group();
    coreMaterial;
    starfield;
    time = 0;
    shake = 0;
    fps = 60;
    fpsFrames = 0;
    fpsTime = 0;
    lowFpsTime = 0;
    lowQuality = false;
    rendererName = "WebGL";
    constructor(canvas, model) {
        this.canvas = canvas;
        this.model = model;
        this.renderer = new THREE.WebGLRenderer({
            canvas, antialias: true, alpha: false, preserveDrawingBuffer: true,
            powerPreference: "high-performance",
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        this.renderer.setSize(window.innerWidth, window.innerHeight, false);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.18;
        // Contact shading comes from beveled geometry and rim lights. Avoiding a
        // depth pass keeps the game fast and avoids SwiftShader depth-validation bugs.
        this.renderer.shadowMap.enabled = false;
        try {
            const gl = this.renderer.getContext();
            const ext = gl.getExtension("WEBGL_debug_renderer_info");
            if (ext)
                this.rendererName = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
        }
        catch {
            // Renderer identification is diagnostic only.
        }
        this.scene.background = new THREE.Color(0x070911);
        this.scene.fog = new THREE.FogExp2(0x070911, 0.034);
        this.camera.position.set(0, 12.8, 9.4);
        this.camera.lookAt(0, 0, 0);
        this.blockMaterials = PALETTE.map(({ value }) => new THREE.MeshStandardMaterial({
            color: value, emissive: value, emissiveIntensity: 0.2,
            metalness: 0.28, roughness: 0.24,
        }));
        this.glitchMaterial = new THREE.MeshStandardMaterial({
            color: 0xff718b, emissive: 0xff274f, emissiveIntensity: 0.5,
            metalness: 0.55, roughness: 0.32,
        });
        this.buildLights();
        this.buildBoard();
        this.buildEnvironment();
        this.coreMaterial = new THREE.MeshStandardMaterial({
            color: 0x14273a, emissive: 0x24bfa5, emissiveIntensity: 0.8,
            metalness: 0.75, roughness: 0.28,
        });
        const core = new THREE.Mesh(new THREE.CylinderGeometry(3.25, 3.6, 0.75, 48), this.coreMaterial);
        core.position.y = -0.88;
        this.scene.add(core);
        const particleGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        this.particleMesh = new THREE.InstancedMesh(particleGeo, particleMat, TUNING.maxParticles);
        this.particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.particleMesh.frustumCulled = false;
        for (let i = 0; i < TUNING.maxParticles; i += 1) {
            this.particles.push({
                alive: false, position: new THREE.Vector3(), velocity: new THREE.Vector3(),
                life: 0, maxLife: 1, size: 1,
            });
            this.dummy.scale.setScalar(0);
            this.dummy.updateMatrix();
            this.particleMesh.setMatrixAt(i, this.dummy.matrix);
            this.particleMesh.setColorAt(i, new THREE.Color(0xffffff));
        }
        this.scene.add(this.particleMesh);
        this.starfield = this.buildStars();
        this.scene.add(this.starfield);
        this.resize();
    }
    buildLights() {
        const hemi = new THREE.HemisphereLight(0x9bbcff, 0x101222, 1.45);
        this.scene.add(hemi);
        const key = new THREE.DirectionalLight(0xe6f5ff, 3.4);
        key.position.set(-5, 12, 7);
        key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        key.shadow.camera.left = -7;
        key.shadow.camera.right = 7;
        key.shadow.camera.top = 7;
        key.shadow.camera.bottom = -7;
        key.shadow.bias = -0.0004;
        this.scene.add(key);
        const rim = new THREE.PointLight(0x9a6cff, 28, 20, 2);
        rim.position.set(6, 4, -4);
        this.scene.add(rim);
        const mint = new THREE.PointLight(0x48f5d1, 20, 16, 2);
        mint.position.set(-5, 2, 5);
        this.scene.add(mint);
    }
    buildBoard() {
        const base = new THREE.Mesh(new RoundedBoxGeometry(8.25, 0.5, 8.25, 4, 0.18), new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.72, roughness: 0.32 }));
        base.position.y = -0.38;
        base.receiveShadow = true;
        this.boardGroup.add(base);
        const inset = new THREE.Mesh(new RoundedBoxGeometry(7.75, 0.18, 7.75, 3, 0.12), new THREE.MeshStandardMaterial({ color: 0x080e19, metalness: 0.45, roughness: 0.5 }));
        inset.position.y = -0.09;
        this.boardGroup.add(inset);
        const tileGeo = new RoundedBoxGeometry(0.91, 0.12, 0.91, 2, 0.055);
        const tileMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.28, roughness: 0.46 });
        const tiles = new THREE.InstancedMesh(tileGeo, tileMat, BOARD_SIZE * BOARD_SIZE);
        tiles.receiveShadow = true;
        const matrix = new THREE.Matrix4();
        const color = new THREE.Color();
        for (let row = 0; row < BOARD_SIZE; row += 1) {
            for (let col = 0; col < BOARD_SIZE; col += 1) {
                const index = row * BOARD_SIZE + col;
                matrix.makeTranslation((col - HALF) * CELL, 0.035, (row - HALF) * CELL);
                tiles.setMatrixAt(index, matrix);
                color.setHex((row + col) % 2 === 0 ? 0x18273a : 0x142235);
                tiles.setColorAt(index, color);
            }
        }
        this.boardGroup.add(tiles);
        const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0x4df4d1, transparent: true, opacity: 0.38 });
        const edgeGeo = new THREE.BoxGeometry(7.95, 0.035, 0.035);
        for (const z of [-3.98, 3.98]) {
            const edge = new THREE.Mesh(edgeGeo, edgeMaterial);
            edge.position.set(0, -0.02, z);
            this.boardGroup.add(edge);
        }
        const sideGeo = new THREE.BoxGeometry(0.035, 0.035, 7.95);
        for (const x of [-3.98, 3.98]) {
            const edge = new THREE.Mesh(sideGeo, edgeMaterial);
            edge.position.set(x, -0.02, 0);
            this.boardGroup.add(edge);
        }
        for (let i = 0; i < MAX_GHOST; i += 1) {
            const ghost = new THREE.Mesh(this.blockGeometry, this.ghostMaterial);
            ghost.visible = false;
            ghost.renderOrder = 4;
            this.ghosts.push(ghost);
            this.boardGroup.add(ghost);
        }
        for (let i = 0; i < 14; i += 1) {
            const material = new THREE.MeshBasicMaterial({
                color: 0xa4fff0, transparent: true, opacity: 0,
                blending: THREE.AdditiveBlending, depthWrite: false,
            });
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.06, 1), material);
            mesh.visible = false;
            this.boardGroup.add(mesh);
            this.beams.push({ mesh, life: 0, maxLife: 0.5 });
        }
        for (let i = 0; i < 4; i += 1) {
            const material = new THREE.MeshBasicMaterial({
                color: 0xd798ff, transparent: true, opacity: 0, side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending, depthWrite: false,
            });
            const mesh = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.52, 48), material);
            mesh.rotation.x = -Math.PI / 2;
            mesh.visible = false;
            this.boardGroup.add(mesh);
            this.shockwaves.push({ mesh, life: 0 });
        }
        this.scene.add(this.boardGroup);
    }
    buildEnvironment() {
        const floor = new THREE.Mesh(new THREE.CircleGeometry(28, 64), new THREE.MeshStandardMaterial({ color: 0x080c16, roughness: 0.86, metalness: 0.18 }));
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1.28;
        floor.receiveShadow = true;
        this.scene.add(floor);
        const grid = new THREE.GridHelper(42, 42, 0x1a4050, 0x101a2d);
        grid.position.y = -1.25;
        const gridMat = grid.material;
        gridMat.transparent = true;
        gridMat.opacity = 0.34;
        this.scene.add(grid);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x327b90, transparent: true, opacity: 0.32,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        for (let i = 0; i < 3; i += 1) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(4.65 + i * 0.55, 0.018, 6, 96), ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = -0.85 - i * 0.08;
            this.ringGroup.add(ring);
        }
        this.scene.add(this.ringGroup);
    }
    buildStars() {
        const count = 420;
        const positions = new Float32Array(count * 3);
        let seed = 0xdecafbad;
        const random = () => {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            return seed / 4294967296;
        };
        for (let i = 0; i < count; i += 1) {
            const angle = random() * Math.PI * 2;
            const radius = 9 + random() * 25;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = -0.5 + random() * 15;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0x7baac8, size: 0.045, transparent: true, opacity: 0.6,
            sizeAttenuation: true, depthWrite: false,
        });
        return new THREE.Points(geometry, material);
    }
    markDirty() {
        this.dirty = true;
    }
    handleEvent(event) {
        this.dirty = true;
        if (event.type === "place") {
            this.shake = Math.max(this.shake, 0.06);
            if (event.cells)
                this.spawnParticles(event.cells, 3, 0.8);
        }
        else if (event.type === "clear") {
            this.shake = Math.max(this.shake, 0.16 + (event.strength ?? 1) * 0.018);
            if (event.cells)
                this.spawnParticles(event.cells, this.lowQuality ? 3 : 7, 2.4);
            for (const row of event.rows ?? [])
                this.spawnBeam(row, true);
            for (const col of event.cols ?? [])
                this.spawnBeam(col, false);
        }
        else if (event.type === "pulse") {
            this.shake = 0.28;
            if (event.cells) {
                this.spawnParticles(event.cells, this.lowQuality ? 5 : 10, 3.2);
                const center = event.cells[Math.floor(event.cells.length / 2)];
                this.spawnShockwave(center.row, center.col);
            }
        }
        else if (event.type === "invalid") {
            this.shake = Math.max(this.shake, 0.1);
        }
        else if (event.type === "victory" || event.type === "sector") {
            this.shake = 0.18;
        }
    }
    spawnParticles(cells, perCell, speed) {
        const limit = this.lowQuality ? TUNING.maxParticlesLow : TUNING.maxParticles;
        for (const cell of cells) {
            for (let n = 0; n < perCell; n += 1) {
                const index = this.particleCursor % limit;
                this.particleCursor = (this.particleCursor + 1) % limit;
                const particle = this.particles[index];
                const angle = ((index * 2.399963) + n * 1.73) % (Math.PI * 2);
                const radial = speed * (0.35 + ((index * 37) % 100) / 130);
                particle.alive = true;
                particle.position.set((cell.col - HALF) * CELL, 0.35, (cell.row - HALF) * CELL);
                particle.velocity.set(Math.cos(angle) * radial, 1.4 + ((index * 17) % 100) / 55, Math.sin(angle) * radial);
                particle.life = 0.55 + ((index * 13) % 100) / 180;
                particle.maxLife = particle.life;
                particle.size = 0.7 + ((index * 29) % 100) / 130;
                this.particleMesh.setColorAt(index, new THREE.Color(PALETTE[cell.color % PALETTE.length].value));
            }
        }
        if (this.particleMesh.instanceColor)
            this.particleMesh.instanceColor.needsUpdate = true;
    }
    spawnBeam(index, row) {
        const beam = this.beams.find((item) => item.life <= 0) ?? this.beams[0];
        beam.life = beam.maxLife;
        beam.mesh.visible = true;
        beam.mesh.position.set(row ? 0 : (index - HALF) * CELL, 0.55, row ? (index - HALF) * CELL : 0);
        beam.mesh.scale.set(row ? 7.4 : 0.22, 1, row ? 0.22 : 7.4);
        beam.mesh.material.opacity = 0.85;
    }
    spawnShockwave(row, col) {
        const wave = this.shockwaves.find((item) => item.life <= 0) ?? this.shockwaves[0];
        wave.life = 0.65;
        wave.mesh.visible = true;
        wave.mesh.position.set((col - HALF) * CELL, 0.5, (row - HALF) * CELL);
        wave.mesh.scale.setScalar(1);
        wave.mesh.material.opacity = 0.9;
    }
    syncBoard() {
        this.dirty = false;
        for (let index = 0; index < this.model.board.length; index += 1) {
            const cell = this.model.board[index];
            const existing = this.blocks[index];
            if (!cell) {
                if (existing) {
                    this.boardGroup.remove(existing);
                    this.blocks[index] = null;
                }
                continue;
            }
            if (existing && existing.userData.cellId === cell.id)
                continue;
            if (existing)
                this.boardGroup.remove(existing);
            const mesh = new THREE.Mesh(this.blockGeometry, cell.glitch ? this.glitchMaterial : this.blockMaterials[cell.color % this.blockMaterials.length]);
            const row = Math.floor(index / BOARD_SIZE);
            const col = index % BOARD_SIZE;
            mesh.position.set((col - HALF) * CELL, 0.29, (row - HALF) * CELL);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData.cellId = cell.id;
            mesh.userData.birth = this.time;
            mesh.userData.glitch = cell.glitch;
            mesh.scale.set(0.15, 0.01, 0.15);
            this.blocks[index] = mesh;
            this.boardGroup.add(mesh);
        }
    }
    updateBlocks() {
        for (let index = 0; index < this.blocks.length; index += 1) {
            const mesh = this.blocks[index];
            if (!mesh)
                continue;
            const age = this.time - Number(mesh.userData.birth);
            const t = Math.max(0, Math.min(1, age / 0.22));
            const overshoot = 1 + Math.sin(t * Math.PI) * 0.12;
            const ease = 1 - Math.pow(1 - t, 3);
            mesh.scale.set(ease * overshoot, ease * (1 + Math.sin(t * Math.PI) * 0.35), ease * overshoot);
            mesh.position.y = 0.29 + Math.sin(Math.min(1, age / 0.22) * Math.PI) * 0.12;
            if (mesh.userData.glitch) {
                mesh.rotation.y = Math.sin(this.time * 5 + index) * 0.035;
                mesh.position.y += Math.sin(this.time * 4 + index) * 0.025;
            }
        }
    }
    updateGhosts() {
        for (const ghost of this.ghosts)
            ghost.visible = false;
        if (this.model.phase !== "playing")
            return;
        if (this.model.pulseMode) {
            let cursor = 0;
            this.ghostMaterial.color.setHex(0xd891ff);
            this.ghostMaterial.opacity = 0.28 + Math.sin(this.time * 7) * 0.08;
            for (let dr = -1; dr <= 1; dr += 1) {
                for (let dc = -1; dc <= 1; dc += 1) {
                    const row = this.model.hoverRow + dr;
                    const col = this.model.hoverCol + dc;
                    if (row < 0 || col < 0 || row >= BOARD_SIZE || col >= BOARD_SIZE)
                        continue;
                    const ghost = this.ghosts[cursor++];
                    ghost.visible = true;
                    ghost.position.set((col - HALF) * CELL, 0.48, (row - HALF) * CELL);
                    ghost.scale.set(1, 0.18, 1);
                }
            }
            return;
        }
        const piece = this.model.rack[this.model.selected];
        if (!piece)
            return;
        const cells = this.model.cells(piece);
        const valid = this.model.canPlace(piece, this.model.hoverRow, this.model.hoverCol);
        this.ghostMaterial.color.setHex(valid ? 0x66f7d4 : 0xff526f);
        this.ghostMaterial.opacity = valid ? 0.5 : 0.34;
        for (let i = 0; i < cells.length && i < MAX_GHOST; i += 1) {
            const [dr, dc] = cells[i];
            const row = this.model.hoverRow + dr;
            const col = this.model.hoverCol + dc;
            if (row < 0 || col < 0 || row >= BOARD_SIZE || col >= BOARD_SIZE)
                continue;
            const ghost = this.ghosts[i];
            ghost.visible = true;
            ghost.position.set((col - HALF) * CELL, 0.55 + Math.sin(this.time * 6) * 0.035, (row - HALF) * CELL);
            ghost.scale.setScalar(0.96);
        }
    }
    updateEffects(dt) {
        const limit = this.lowQuality ? TUNING.maxParticlesLow : TUNING.maxParticles;
        for (let i = 0; i < TUNING.maxParticles; i += 1) {
            const particle = this.particles[i];
            if (i >= limit)
                particle.alive = false;
            if (particle.alive) {
                particle.life -= dt;
                if (particle.life <= 0)
                    particle.alive = false;
            }
            if (particle.alive) {
                particle.velocity.y -= 5.8 * dt;
                particle.position.addScaledVector(particle.velocity, dt);
                const scale = particle.size * Math.min(1, particle.life / (particle.maxLife * 0.45));
                this.dummy.position.copy(particle.position);
                this.dummy.rotation.set(this.time * 3 + i, this.time * 4 + i * 0.3, 0);
                this.dummy.scale.setScalar(scale);
            }
            else {
                this.dummy.position.set(0, -20, 0);
                this.dummy.scale.setScalar(0);
            }
            this.dummy.updateMatrix();
            this.particleMesh.setMatrixAt(i, this.dummy.matrix);
        }
        this.particleMesh.instanceMatrix.needsUpdate = true;
        for (const beam of this.beams) {
            if (beam.life <= 0)
                continue;
            beam.life -= dt;
            const t = Math.max(0, beam.life / beam.maxLife);
            beam.mesh.material.opacity = t * 0.8;
            beam.mesh.position.y = 0.55 + (1 - t) * 0.7;
            if (beam.life <= 0)
                beam.mesh.visible = false;
        }
        for (const wave of this.shockwaves) {
            if (wave.life <= 0)
                continue;
            wave.life -= dt;
            const t = Math.max(0, wave.life / 0.65);
            wave.mesh.scale.setScalar(1 + (1 - t) * 8);
            wave.mesh.material.opacity = t * 0.75;
            if (wave.life <= 0)
                wave.mesh.visible = false;
        }
    }
    updatePerformance(dt) {
        this.fpsFrames += 1;
        this.fpsTime += dt;
        if (this.fpsTime >= 1) {
            this.fps = Math.round(this.fpsFrames / this.fpsTime);
            if (this.fps < 45)
                this.lowFpsTime += this.fpsTime;
            else
                this.lowFpsTime = 0;
            this.fpsFrames = 0;
            this.fpsTime = 0;
            if (this.lowFpsTime >= 2 && !this.lowQuality) {
                this.lowQuality = true;
                this.renderer.setPixelRatio(1);
                this.renderer.shadowMap.enabled = false;
                this.resize();
            }
        }
    }
    update(dt) {
        this.time += dt;
        if (this.dirty)
            this.syncBoard();
        this.updateBlocks();
        this.updateGhosts();
        this.updateEffects(dt);
        this.updatePerformance(dt);
        this.ringGroup.rotation.y += dt * 0.065;
        this.starfield.rotation.y -= dt * 0.004;
        const heat = this.model.phase === "title" ? 0.2 : this.model.heat / 100;
        this.coreMaterial.emissive.setRGB(0.08 + heat * 0.65, 0.65 - heat * 0.5, 0.55 - heat * 0.45);
        this.coreMaterial.emissiveIntensity = 0.65 + heat * 0.8 + Math.sin(this.time * 3) * 0.08;
        if (this.model.phase === "title") {
            this.boardGroup.rotation.y = Math.sin(this.time * 0.32) * 0.055;
            this.boardGroup.position.y = Math.sin(this.time * 0.7) * 0.05;
        }
        else {
            this.boardGroup.rotation.y *= 0.88;
            this.boardGroup.position.y *= 0.88;
        }
        this.shake = Math.max(0, this.shake - dt * 1.7);
    }
    render() {
        const shakeX = Math.sin(this.time * 83) * this.shake;
        const shakeY = Math.cos(this.time * 71) * this.shake * 0.55;
        this.camera.position.set(shakeX, 12.8 + shakeY, 9.4);
        this.camera.lookAt(0, 0, 0);
        this.renderer.render(this.scene, this.camera);
    }
    resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / Math.max(1, height);
        const frustum = Math.max(10.7, 10.2 / aspect);
        this.camera.left = -frustum * aspect / 2;
        this.camera.right = frustum * aspect / 2;
        this.camera.top = frustum / 2;
        this.camera.bottom = -frustum / 2;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height, false);
    }
    screenToCell(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        this.pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
        this.raycaster.setFromCamera(this.pointer, this.camera);
        if (!this.raycaster.ray.intersectPlane(this.boardPlane, this.hitPoint))
            return null;
        const local = this.boardGroup.worldToLocal(this.hitPoint.clone());
        const col = Math.floor((local.x + BOARD_SIZE * CELL / 2) / CELL);
        const row = Math.floor((local.z + BOARD_SIZE * CELL / 2) / CELL);
        if (row < 0 || col < 0 || row >= BOARD_SIZE || col >= BOARD_SIZE)
            return null;
        return { row, col };
    }
    updatePointer(clientX, clientY) {
        const cell = this.screenToCell(clientX, clientY);
        if (!cell)
            return false;
        if (this.model.pulseMode) {
            this.model.hoverRow = cell.row;
            this.model.hoverCol = cell.col;
        }
        else {
            this.model.setHoverFromCell(cell.row, cell.col);
        }
        return true;
    }
    dropPointer(clientX, clientY) {
        if (!this.updatePointer(clientX, clientY))
            return false;
        if (this.model.pulseMode)
            return this.model.pulseAt(this.model.hoverRow, this.model.hoverCol);
        return this.model.placeSelected();
    }
    getStats() {
        let entities = 0;
        for (const block of this.blocks)
            if (block)
                entities += 1;
        for (const particle of this.particles)
            if (particle.alive)
                entities += 1;
        return {
            fps: this.fps,
            drawCalls: this.renderer.info.render.calls,
            triangles: this.renderer.info.render.triangles,
            entities,
            quality: this.lowQuality ? "adaptive-low" : "high",
            renderer: this.rendererName,
        };
    }
    dispose() {
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
                object.geometry.dispose();
                const materials = Array.isArray(object.material) ? object.material : [object.material];
                for (const material of materials)
                    material.dispose();
            }
        });
        for (const material of this.blockMaterials)
            material.dispose();
        this.glitchMaterial.dispose();
        this.ghostMaterial.dispose();
        this.renderer.dispose();
    }
}
