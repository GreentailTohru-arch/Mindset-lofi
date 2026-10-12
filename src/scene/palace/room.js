import * as THREE from "three";
import { box, cylinder, group, torus } from "../primitives.js";
import { lattice, giltMotif } from "./details.js";
import { palaceTexture } from "./materials.js";
import { damp } from "../../state.js";

export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "金碧辉煌 · 宫殿建筑";
  box(root, [10.35, 0.3, 10.35], [0, -0.18, 0], m.trim, 0.025);
  const boards = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1.66, 0.05, 0.31),
      m.floor,
      192,
    ),
    dummy = new THREE.Object3D();
  for (let row = 0, i = 0; row < 32; row++)
    for (let col = 0; col < 6; col++, i++) {
      dummy.position.set(
        -4.1667 + col * 1.6667,
        -0.002,
        -4.84375 + row * 0.3125,
      );
      dummy.updateMatrix();
      boards.setMatrixAt(i, dummy.matrix);
      boards.setColorAt(
        i,
        new THREE.Color().setScalar(0.78 + ((row * 7 + col * 3) % 11) * 0.018),
      );
    }
  boards.receiveShadow = true;
  root.add(boards);
  box(root, [10.15, 3.83, 0.19], [0, 1.91, -5], m.wall);
  // Left wall is built around a real large window, without overlapping wall panels.
  box(root, [0.19, 0.82, 10], [-5, 0.41, 0], m.lacquer);
  box(root, [0.19, 0.62, 10], [-5, 3.58, 0], m.lacquer);
  for (const z of [-4.57, 4.57])
    box(root, [0.19, 2.46, 0.86], [-5, 2.045, z], m.lacquer);
  for (const x of [-4.75, -1.4, 1.95, 4.75]) {
    const col = cylinder(root, 0.16, 0.19, 3.72, [x, 1.86, -4.79], m.lacquer);
    col.name = "朱红漆柱";
    for (const y of [0.18, 0.4, 3.34, 3.5])
      cylinder(root, 0.203, 0.203, 0.07, [x, y, -4.79], m.gold);
    box(root, [0.5, 0.2, 0.5], [x, 0.1, -4.79], m.trim, 0.025);
  }
  for (const z of [-1.5, 1.5, 4.72]) {
    cylinder(root, 0.16, 0.19, 3.72, [-4.77, 1.86, z], m.lacquer);
    for (const y of [0.18, 0.4, 3.34, 3.5])
      cylinder(root, 0.203, 0.203, 0.07, [-4.77, y, z], m.gold);
    box(root, [0.5, 0.2, 0.5], [-4.77, 0.1, z], m.trim, 0.025);
  }
  for (const orientation of [0, Math.PI / 2]) {
    const eave = group(root, orientation === 0 ? [0, 0, -4.9] : [-4.9, 0, 0]);
    eave.rotation.y = orientation;
    box(eave, [10.2, 0.29, 0.46], [0, 3.72, 0], m.lacquer, 0.012);
    box(eave, [10.3, 0.11, 0.58], [0, 3.93, 0], m.woodDark);
    box(eave, [10.1, 0.035, 0.47], [0, 3.52, 0.015], m.gold);
    // Stacked bracket arms and cloud-scroll filigree beneath the beam.
    for (const x of [-4.7, -3.2, -1.5, 0, 1.7, 3.2, 4.7]) {
      for (let level = 0; level < 3; level++) {
        box(
          eave,
          [0.33 + level * 0.19, 0.085, 0.19 + level * 0.07],
          [x, 3.23 + level * 0.11, 0.12 + level * 0.055],
          m.gold,
          0.012,
        );
        for (const side of [-1, 1])
          box(
            eave,
            [0.08, 0.15, 0.2],
            [
              x + side * (0.16 + level * 0.095),
              3.29 + level * 0.11,
              0.12 + level * 0.055,
            ],
            m.gold,
            0.01,
          );
      }
      giltMotif(eave, [x, 3.32, 0.38], 0.86, m);
    }
    const tileGeo = new THREE.CylinderGeometry(
      0.147,
      0.147,
      0.65,
      14,
      1,
      true,
      Math.PI / 2,
      Math.PI,
    );
    for (let i = 0; i < 34; i++) {
      const tile = new THREE.Mesh(tileGeo, m.jade);
      tile.rotation.x = Math.PI / 2;
      tile.position.set(-4.95 + i * 0.3, 4.045, 0);
      tile.castShadow = true;
      eave.add(tile);
      const end = cylinder(
        eave,
        0.115,
        0.115,
        0.035,
        [-4.95 + i * 0.3, 4.045, 0.34],
        m.jade,
        18,
      );
      end.rotation.x = Math.PI / 2;
      torus(
        eave,
        0.075,
        0.01,
        [-4.95 + i * 0.3, 4.045, 0.365],
        m.gold,
        [0, 0, 0],
      );
    }
  }
  const win = group(root, [-4.88, 2.055, 0]);
  win.rotation.y = Math.PI / 2;
  const night = palaceTexture("garden"),
    day = palaceTexture("garden", true);
  const sceneryMat = new THREE.MeshBasicMaterial({
    map: night,
    toneMapped: false,
    color: "#b5c4dd",
  });
  const scenery = new THREE.Mesh(
    new THREE.PlaneGeometry(8.28, 2.43),
    sceneryMat,
  );
  scenery.position.z = -0.16;
  win.add(scenery);
  for (const x of [-4.14, 4.14])
    box(win, [0.095, 2.46, 0.14], [x, 0, 0], m.woodDark);
  for (const y of [-1.23, 1.23]) box(win, [8.4, 0.09, 0.15], [0, y, 0], m.gold);
  for (const x of [-3.8, 3.8])
    lattice(win, 0.58, 2.37, [x, 0, 0.04], m.woodDark);
  lattice(win, 8.22, 0.47, [0, -0.965, 0.04], m.lacquer);
  for (const x of [-2.45, 0.05, 2.45])
    box(win, [0.055, 2.4, 0.08], [x, 0, 0.01], m.woodDark);
  register(scenery, "月下宫苑", "月夜 / 日景", () => {
    store.set("day", !store.state.day);
    return store.state.day ? "晨光入苑 · 竹影轻摇" : "月满宫苑 · 梅影入窗";
  });
  const curtains = [-1, 1].map((sign) => {
    const g = group(win, [sign * 4.03, 1.21, 0.24]);
    const geo = new THREE.PlaneGeometry(4.04, 2.42, 48, 24),
      a = geo.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i);
      a.setXYZ(
        i,
        (x + 2.02) * -sign,
        a.getY(i) - 1.21,
        Math.sin(x * 28) * 0.075,
      );
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, m.silk);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    register(g, "宫廷丝绸帷幔", "展开 / 收拢", () => {
      store.set("curtains", !store.state.curtains);
      return store.state.curtains
        ? "帷幔收拢 · 月色入室"
        : "帷幔垂落 · 一室安宁";
    });
    return g;
  });
  for (const x of [-3.1, 0.15, 3.35]) {
    lattice(root, 2.35, 0.49, [x, 2.95, -4.84], m.woodDark);
    box(root, [2.39, 0.07, 0.08], [x, 2.64, -4.83], m.gold);
  }
  // Unlettered decorative landscape above the music cabinet.
  box(root, [2.6, 1.85, 0.085], [0.25, 2.05, -4.82], m.woodDark, 0.01);
  box(root, [2.45, 1.7, 0.018], [0.25, 2.05, -4.766], m.gold);
  box(root, [2.35, 1.6, 0.015], [0.25, 2.05, -4.746], m.art);
  return {
    root,
    update(dt, t) {
      sceneryMat.map = store.state.day ? day : night;
      curtains.forEach((g) => {
        g.scale.x = damp(g.scale.x, store.state.curtains ? 0.145 : 1, dt, 2);
        g.position.z = 0.24 + Math.sin(t * 0.4) * 0.014;
      });
    },
  };
}
