import * as THREE from "three";
import { ARENA, COLORS, mulberry32 } from "./config.js";
import { createSign, createVendingMachine } from "./models.js";
function checkerTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const cells = 8;
    const size = canvas.width / cells;
    for (let z = 0; z < cells; z++) {
        for (let x = 0; x < cells; x++) {
            ctx.fillStyle = (x + z) % 2 ? COLORS.floorA : COLORS.floorB;
            ctx.fillRect(x * size, z * size, size, size);
            ctx.strokeStyle = "rgba(184,255,69,.055)";
            ctx.lineWidth = 2;
            ctx.strokeRect(x * size, z * size, size, size);
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5.5, 5.5);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
}
export function createWorld(scene) {
    const root = new THREE.Group();
    scene.add(root);
    const rng = mulberry32(0x51a1e5);
    const floorMat = new THREE.MeshStandardMaterial({ map: checkerTexture(), roughness: 0.83, metalness: 0.1 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(ARENA * 2 + 8, ARENA * 2 + 8), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    root.add(floor);
    const underfloor = new THREE.Mesh(new THREE.CylinderGeometry(ARENA * 1.55, ARENA * 1.55, 1.2, 4), new THREE.MeshStandardMaterial({ color: 0x0b0818, roughness: 0.8 }));
    underfloor.position.y = -0.65;
    underfloor.rotation.y = Math.PI / 4;
    root.add(underfloor);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x3b315b, roughness: 0.6, metalness: 0.35 });
    const trimMat = new THREE.MeshStandardMaterial({ color: COLORS.acid, emissive: COLORS.acid, emissiveIntensity: 0.22 });
    const productMats = [0xff4f9a, 0x52e5ff, 0xffe45c, 0xb8ff45, 0x8c52ff].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.72 }));
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const productGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.65, 8);
    const shelfParts = [];
    const productParts = productMats.map(() => []);
    const dummy = new THREE.Object3D();
    const addShelf = (x, z, rotation, length) => {
        const groupMatrix = new THREE.Matrix4().makeRotationY(rotation);
        groupMatrix.setPosition(x, 0, z);
        const addPart = (px, py, pz, sx, sy, sz) => {
            dummy.position.set(px, py, pz);
            dummy.scale.set(sx, sy, sz);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            shelfParts.push(new THREE.Matrix4().multiplyMatrices(groupMatrix, dummy.matrix));
        };
        addPart(0, 0.18, 0, length, 0.35, 1.1);
        addPart(0, 2.75, 0, length, 0.18, 1.1);
        addPart(0, 1.48, 0.48, length, 2.6, 0.08);
        for (const px of [-length / 2 + 0.1, length / 2 - 0.1])
            addPart(px, 1.45, 0, 0.13, 2.8, 1.05);
        for (const py of [0.85, 1.65, 2.45])
            addPart(0, py, 0, length, 0.11, 1.05);
        for (let row = 0; row < 3; row++) {
            const count = Math.floor(length / 0.65);
            for (let i = 0; i < count; i++) {
                dummy.position.set(-length / 2 + 0.4 + i * 0.64, 0.58 + row * 0.8, -0.05 + rng() * 0.15);
                dummy.scale.set(0.85 + rng() * 0.35, 0.8 + rng() * 0.45, 0.85 + rng() * 0.35);
                dummy.rotation.set(0, (rng() - 0.5) * 0.2, 0);
                dummy.updateMatrix();
                productParts[Math.floor(rng() * productParts.length)].push(new THREE.Matrix4().multiplyMatrices(groupMatrix, dummy.matrix));
            }
        }
    };
    for (let i = -2; i <= 2; i++) {
        addShelf(i * 8, -ARENA - 1.5, 0, 7.2);
        addShelf(i * 8, ARENA + 1.5, Math.PI, 7.2);
        if (Math.abs(i) > 0) {
            addShelf(-ARENA - 1.5, i * 8, Math.PI / 2, 7.2);
            addShelf(ARENA + 1.5, i * 8, -Math.PI / 2, 7.2);
        }
    }
    const shelves = new THREE.InstancedMesh(boxGeo, shelfMat, shelfParts.length);
    shelfParts.forEach((matrix, index) => shelves.setMatrixAt(index, matrix));
    shelves.castShadow = true;
    shelves.receiveShadow = true;
    root.add(shelves);
    productParts.forEach((parts, index) => {
        const products = new THREE.InstancedMesh(productGeo, productMats[index], parts.length);
        parts.forEach((matrix, i) => products.setMatrixAt(i, matrix));
        products.castShadow = true;
        root.add(products);
    });
    const signA = createSign("FROZEN REGRETS", "#52e5ff");
    signA.position.set(-9, 5.1, -ARENA - 0.8);
    root.add(signA);
    const signB = createSign("MEAT(?) & GREET", "#ff4f9a");
    signB.position.set(9, 5.1, -ARENA - 0.8);
    root.add(signB);
    const signC = createSign("AISLE 13½", "#ffe45c");
    signC.position.set(-ARENA - 0.8, 4.4, 0);
    signC.rotation.y = Math.PI / 2;
    root.add(signC);
    const signD = createSign("NO EXIT / NO REFUNDS", "#b8ff45");
    signD.position.set(ARENA + 0.8, 4.4, 0);
    signD.rotation.y = -Math.PI / 2;
    root.add(signD);
    const scanner = new THREE.Group();
    const poleGeo = new THREE.BoxGeometry(0.45, 3.2, 0.45);
    for (const x of [-2.1, 2.1]) {
        const pole = new THREE.Mesh(poleGeo, trimMat);
        pole.position.set(x, 1.6, 0);
        pole.castShadow = true;
        scanner.add(pole);
    }
    const scannerTop = new THREE.Mesh(new THREE.BoxGeometry(4.65, 0.35, 0.55), trimMat);
    scannerTop.position.y = 3.2;
    scanner.add(scannerTop);
    const checkout = createSign("CHECKOUT? CHECKMATE.", "#ffe45c");
    checkout.scale.setScalar(0.72);
    checkout.position.set(0, 4.15, 0);
    scanner.add(checkout);
    scanner.position.set(0, 0, 16.8);
    root.add(scanner);
    const vending = createVendingMachine();
    vending.position.set(-17.5, 0, -16.5);
    vending.rotation.y = -0.5;
    root.add(vending);
    const spinner = new THREE.Group();
    const moon = new THREE.Mesh(new THREE.SphereGeometry(5.5, 24, 16), new THREE.MeshBasicMaterial({ color: 0x5d3d96, wireframe: true, transparent: true, opacity: 0.18 }));
    moon.position.set(0, 15, -33);
    spinner.add(moon);
    root.add(spinner);
    const hemi = new THREE.HemisphereLight(0x9fcaff, 0x241335, 2.05);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1d1, 2.65);
    sun.position.set(-9, 20, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536);
    sun.shadow.camera.left = -25;
    sun.shadow.camera.right = 25;
    sun.shadow.camera.top = 25;
    sun.shadow.camera.bottom = -25;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 55;
    sun.shadow.bias = -0.00035;
    scene.add(sun);
    const acidLight = new THREE.PointLight(COLORS.acid, 24, 20, 2);
    acidLight.position.set(0, 4, 12);
    scene.add(acidLight);
    const pinkLight = new THREE.PointLight(COLORS.pink, 20, 22, 2);
    pinkLight.position.set(-13, 4, -13);
    scene.add(pinkLight);
    return {
        root,
        vending,
        scanner,
        spinner,
        update: (time) => {
            moon.rotation.y = time * 0.045;
            moon.rotation.x = Math.sin(time * 0.1) * 0.15;
            vending.position.y = Math.sin(time * 1.4) * 0.035;
            scannerTop.scale.x = 1 + Math.sin(time * 3) * 0.015;
        },
    };
}
