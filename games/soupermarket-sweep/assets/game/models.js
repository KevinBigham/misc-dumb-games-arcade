import * as THREE from "three";
import { COLORS } from "./config.js";
const geometries = new Set();
const materials = new Set();
function geo(value) {
    geometries.add(value);
    return value;
}
function mat(color, options = {}) {
    const value = new THREE.MeshStandardMaterial({ color, roughness: 0.68, metalness: 0.08, ...options });
    materials.add(value);
    return value;
}
const M = {
    acid: mat(COLORS.acid, { emissive: COLORS.acid, emissiveIntensity: 0.18 }),
    yellow: mat(COLORS.yellow),
    pink: mat(COLORS.pink, { emissive: COLORS.pink, emissiveIntensity: 0.12 }),
    cyan: mat(COLORS.cyan, { emissive: COLORS.cyan, emissiveIntensity: 0.14 }),
    purple: mat(COLORS.purple),
    cream: mat(COLORS.cream),
    white: mat(0xf4f0e8),
    dark: mat(0x171329),
    black: mat(0x08060f),
    metal: mat(0x9db7bd, { metalness: 0.72, roughness: 0.3 }),
    red: mat(COLORS.red, { emissive: COLORS.red, emissiveIntensity: 0.12 }),
    green: mat(0x65d84f),
    bread: mat(0xd99b4a),
    crust: mat(0x8e4b27),
    glass: mat(0x82ccdd, { transparent: true, opacity: 0.58, roughness: 0.15 }),
};
const G = {
    box: geo(new THREE.BoxGeometry(1, 1, 1)),
    sphere: geo(new THREE.SphereGeometry(0.5, 16, 12)),
    lowSphere: geo(new THREE.SphereGeometry(0.5, 10, 8)),
    cylinder: geo(new THREE.CylinderGeometry(0.5, 0.5, 1, 16)),
    wheel: geo(new THREE.CylinderGeometry(0.5, 0.5, 0.25, 12)),
    cone: geo(new THREE.ConeGeometry(0.5, 1, 12)),
    capsule: geo(new THREE.CapsuleGeometry(0.5, 1, 5, 10)),
    torus: geo(new THREE.TorusGeometry(0.5, 0.12, 8, 20)),
};
function part(parent, geometry, material, x, y, z, sx = 1, sy = 1, sz = 1) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
}
function eye(parent, x, y, z, scale = 1) {
    part(parent, G.sphere, M.white, x, y, z, 0.22 * scale, 0.28 * scale, 0.13 * scale);
    part(parent, G.sphere, M.black, x, y, z - 0.12 * scale, 0.09 * scale, 0.13 * scale, 0.07 * scale);
}
function eyes(parent, y, z, spacing = 0.25, scale = 1) {
    eye(parent, -spacing, y, z, scale);
    eye(parent, spacing, y, z, scale);
}
export function createCart() {
    const cart = new THREE.Group();
    cart.name = "The Soup Cart";
    const wheels = [];
    part(cart, G.box, M.dark, 0, 0.26, 0.12, 1.25, 0.12, 1.65);
    part(cart, G.box, M.metal, 0, 0.65, 0, 1.35, 0.09, 1.7);
    for (const x of [-0.67, 0.67]) {
        for (let i = 0; i < 5; i++)
            part(cart, G.box, M.metal, x, 0.9 + i * 0.14, 0, 0.045, 0.045, 1.7 - i * 0.06);
        part(cart, G.box, M.metal, x, 1.18, 0, 0.05, 0.75, 0.05);
    }
    for (const z of [-0.82, 0.82]) {
        for (let i = 0; i < 4; i++)
            part(cart, G.box, M.metal, 0, 0.77 + i * 0.17, z, 1.35, 0.045, 0.045);
    }
    part(cart, G.box, M.pink, 0, 1.22, 1.05, 1.75, 0.12, 0.12);
    for (const x of [-0.62, 0.62]) {
        for (const z of [-0.65, 0.65]) {
            const wheel = part(cart, G.wheel, M.black, x, 0.22, z, 0.28, 0.28, 0.28);
            wheel.rotation.z = Math.PI / 2;
            wheels.push(wheel);
        }
    }
    const pot = part(cart, G.cylinder, M.acid, 0, 1.15, -0.1, 0.68, 0.85, 0.68);
    pot.name = "Illegal soup reservoir";
    part(cart, G.torus, M.metal, 0, 1.57, -0.1, 0.72, 0.72, 0.72).rotation.x = Math.PI / 2;
    part(cart, G.cylinder, M.purple, 0, 1.48, -0.1, 0.58, 0.08, 0.58);
    part(cart, G.cylinder, M.metal, 0, 1.55, -0.65, 0.16, 1.05, 0.16).rotation.x = Math.PI / 2;
    part(cart, G.cylinder, M.acid, 0, 1.55, -1.15, 0.24, 0.28, 0.24).rotation.x = Math.PI / 2;
    eyes(cart, 1.18, -0.69, 0.28, 1.15);
    const tongue = part(cart, G.box, M.pink, 0, 0.92, -0.77, 0.25, 0.09, 0.12);
    tongue.rotation.z = 0.12;
    cart.userData.wheels = wheels;
    return cart;
}
export function createEnemy(kind) {
    const enemy = new THREE.Group();
    enemy.name = kind;
    if (kind === "pea") {
        part(enemy, G.lowSphere, M.green, 0, 0.55, 0, 0.85, 0.85, 0.85);
        eyes(enemy, 0.68, -0.39, 0.19, 0.85);
        part(enemy, G.cone, M.acid, 0, 1.12, 0, 0.24, 0.42, 0.24).rotation.z = 0.35;
    }
    else if (kind === "lemon") {
        part(enemy, G.lowSphere, M.yellow, 0, 0.7, 0, 1.12, 1.35, 1.05);
        part(enemy, G.cone, M.yellow, 0, 0.7, -0.63, 0.25, 0.35, 0.25).rotation.x = -Math.PI / 2;
        part(enemy, G.cone, M.yellow, 0, 0.7, 0.63, 0.25, 0.35, 0.25).rotation.x = Math.PI / 2;
        eyes(enemy, 0.86, -0.48, 0.27, 1.1);
        part(enemy, G.box, M.dark, 0, 0.48, -0.56, 0.38, 0.07, 0.07).rotation.z = -0.15;
    }
    else if (kind === "milk") {
        part(enemy, G.box, M.white, 0, 0.9, 0, 1.0, 1.55, 0.85);
        const roof = part(enemy, G.cone, M.cyan, 0, 1.82, 0, 0.72, 0.7, 0.72);
        roof.rotation.y = Math.PI / 4;
        part(enemy, G.box, M.cyan, 0, 0.95, -0.44, 0.62, 0.54, 0.03);
        eyes(enemy, 1.22, -0.46, 0.24, 0.95);
        part(enemy, G.cylinder, M.purple, 0.5, 1.02, -0.25, 0.12, 1.15, 0.12).rotation.z = -0.65;
        part(enemy, G.sphere, M.pink, 0.84, 1.4, -0.25, 0.22, 0.22, 0.22);
    }
    else if (kind === "baguette") {
        const body = part(enemy, G.capsule, M.bread, 0, 1.0, 0, 0.75, 1.15, 0.75);
        body.rotation.x = 0.2;
        for (let i = 0; i < 4; i++) {
            const slash = part(enemy, G.box, M.cream, 0, 0.55 + i * 0.35, -0.37, 0.45, 0.08, 0.04);
            slash.rotation.z = -0.35;
        }
        eyes(enemy, 1.36, -0.38, 0.22, 1);
        part(enemy, G.box, M.red, 0, 0.25, 0, 1.1, 0.18, 0.8);
    }
    else if (kind === "auditor") {
        part(enemy, G.box, M.dark, 0, 0.92, 0, 1.12, 1.45, 0.75);
        part(enemy, G.sphere, M.cream, 0, 1.9, 0, 0.95, 1.0, 0.85);
        part(enemy, G.cone, M.red, 0, 1.05, -0.42, 0.24, 0.95, 0.18).rotation.x = Math.PI;
        eyes(enemy, 2.0, -0.39, 0.25, 1);
        part(enemy, G.box, M.black, 0, 1.98, -0.45, 0.85, 0.09, 0.06);
        part(enemy, G.box, M.crust, 0.82, 0.55, 0, 0.65, 0.85, 0.25);
        part(enemy, G.torus, M.metal, 0.82, 1.02, 0, 0.3, 0.35, 0.3);
    }
    else if (kind === "fridge") {
        part(enemy, G.box, M.white, 0, 1.75, 0, 2.5, 3.5, 1.8);
        part(enemy, G.box, M.cyan, 0, 2.35, -0.93, 2.15, 0.06, 0.05);
        part(enemy, G.box, M.metal, 0.82, 2.7, -1.02, 0.12, 0.85, 0.12);
        part(enemy, G.box, M.black, 0, 1.2, -0.96, 1.75, 0.58, 0.08);
        for (let i = 0; i < 6; i++) {
            const tooth = part(enemy, G.cone, M.cream, -0.7 + i * 0.28, 1.45, -1.05, 0.16, 0.35, 0.16);
            tooth.rotation.x = Math.PI;
        }
        eyes(enemy, 2.75, -0.96, 0.58, 2.1);
        part(enemy, G.box, M.pink, 0, 0.98, -1.1, 0.65, 0.16, 0.45);
        for (const x of [-0.85, 0.85])
            part(enemy, G.wheel, M.black, x, 0.18, 0, 0.38, 0.38, 0.38).rotation.z = Math.PI / 2;
    }
    else {
        part(enemy, G.sphere, M.cream, 0, 2.65, 0, 2.35, 2.2, 2.0);
        part(enemy, G.box, M.dark, 0, 0.85, 0, 2.65, 2.1, 1.3);
        part(enemy, G.cone, M.red, 0, 1.1, -0.75, 0.5, 1.8, 0.3).rotation.x = Math.PI;
        eyes(enemy, 2.9, -0.95, 0.66, 2.5);
        part(enemy, G.box, M.black, 0, 2.05, -0.95, 1.15, 0.18, 0.12);
        for (let i = 0; i < 5; i++)
            part(enemy, G.box, M.cream, -0.44 + i * 0.22, 2.02, -1.04, 0.16, 0.14, 0.05);
        part(enemy, G.box, M.yellow, 0.75, 1.35, -0.72, 0.75, 0.38, 0.05);
        part(enemy, G.cylinder, M.purple, 0, 4.1, 0, 1.65, 0.18, 1.65);
        part(enemy, G.cylinder, M.purple, 0, 4.4, 0, 1.15, 0.6, 1.15);
    }
    return enemy;
}
export function createVendingMachine() {
    const group = new THREE.Group();
    part(group, G.box, M.pink, 0, 1.5, 0, 1.9, 3, 1.25);
    part(group, G.box, M.dark, 0, 1.75, -0.65, 1.45, 1.65, 0.08);
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++)
            part(group, G.cylinder, row === 1 ? M.acid : M.cyan, -0.45 + col * 0.45, 1.25 + row * 0.45, -0.73, 0.15, 0.3, 0.15);
    }
    part(group, G.box, M.yellow, 0.42, 0.62, -0.68, 0.35, 0.25, 0.06);
    eyes(group, 2.85, -0.65, 0.38, 1.5);
    group.userData.interactive = true;
    return group;
}
export function createTextTexture(text, foreground = "#b8ff45", background = "#171329", width = 768, height = 192) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = foreground;
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.fillStyle = foreground;
    ctx.font = `900 ${Math.floor(height * 0.38)}px Arial Black, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2, width - 60);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}
export function createSign(text, color = "#b8ff45") {
    const texture = createTextTexture(text, color);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: false, side: THREE.DoubleSide });
    materials.add(material);
    const geometry = geo(new THREE.PlaneGeometry(5.8, 1.45));
    return new THREE.Mesh(geometry, material);
}
export function disposeModels() {
    for (const geometry of geometries)
        geometry.dispose();
    for (const material of materials)
        material.dispose();
    geometries.clear();
    materials.clear();
}
