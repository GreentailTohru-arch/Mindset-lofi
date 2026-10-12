import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
const leavesGeo = new THREE.SphereGeometry(1, 10, 7);
const rockGeo = new THREE.DodecahedronGeometry(1, 1);
const profiles = {
  vase: [
    [0.13, 0],
    [0.21, 0.08],
    [0.25, 0.28],
    [0.22, 0.46],
    [0.12, 0.58],
    [0.12, 0.7],
    [0.092, 0.7],
    [0.09, 0.59],
    [0.16, 0.38],
    [0.14, 0.12],
    [0, 0.1],
  ],
  bowl: [
    [0.11, 0],
    [0.2, 0.07],
    [0.23, 0.19],
    [0.21, 0.2],
    [0.17, 0.08],
    [0, 0.06],
  ],
};
const potteryGeo = Object.fromEntries(
  Object.entries(profiles).map(([key, ps]) => [
    key,
    new THREE.LatheGeometry(
      ps.map((p) => new THREE.Vector2(...p)),
      32,
    ),
  ]),
);
export function pottery(parent, pos, scale, mat, kind = "vase") {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  const mesh = new THREE.Mesh(potteryGeo[kind], mat);
  mesh.castShadow = mesh.receiveShadow = true;
  g.add(mesh);
  return g;
}
export function books(parent, pos, m, count = 3, upright = false) {
  const g = group(parent, pos);
  for (let i = 0; i < count; i++) {
    const mat = [m.paper, m.taupe, m.sage, m.dark][i % 4];
    if (upright) {
      const h = 0.32 + (i % 3) * 0.04;
      box(g, [0.087, h, 0.25], [i * 0.103, h / 2, 0], mat, 0.004);
      box(g, [0.064, h - 0.025, 0.254], [i * 0.103, h / 2, 0.001], m.paper);
    } else {
      const b = group(g, [(i % 2) * 0.018, i * 0.065, 0]);
      b.rotation.y = (i % 2) * 0.045;
      box(b, [0.37, 0.059, 0.28], [0, 0.03, 0], mat, 0.004);
      box(b, [0.344, 0.036, 0.284], [0, 0.03, 0.001], m.paper);
    }
  }
  return g;
}
function leafCloud(parent, entries, mat) {
  const mesh = new THREE.InstancedMesh(leavesGeo, mat, entries.length),
    d = new THREE.Object3D();
  entries.forEach((p, i) => {
    d.position.set(...p.pos);
    d.scale.set(...p.scale);
    d.rotation.set(...(p.rot || [0, 0, 0]));
    d.updateMatrix();
    mesh.setMatrixAt(i, d.matrix);
  });
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function bamboo(parent, pos, m, scale = 1, potted = true) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  const base = potted ? 0.35 : 0;
  if (potted) {
    cylinder(g, 0.27, 0.22, 0.34, [0, 0.17, 0], m.clay);
    cylinder(g, 0.246, 0.246, 0.01, [0, 0.345, 0], m.soil);
  }
  const leaves = [];
  for (let i = 0; i < 7; i++) {
    const x = Math.sin(i * 2.4) * 0.16,
      z = Math.cos(i * 2.4) * 0.15,
      h = 1.3 + (i % 3) * 0.24;
    cylinder(g, 0.013, 0.022, h, [x, base + h / 2, z], m.leaf, 8);
    for (let j = 0; j < 4; j++) {
      const y = base + 0.4 + j * 0.3;
      cylinder(g, 0.022, 0.022, 0.018, [x, y, z], m.leafLight, 8);
      for (const sign of [-1, 1]) {
        tube(
          g,
          [
            [x, y, z],
            [x + sign * 0.13, y + 0.08, z + 0.03],
            [x + sign * 0.32, y + 0.12, z + 0.06],
          ],
          0.004,
          m.leaf,
        );
        for (let k = 0; k < 3; k++)
          leaves.push({
            pos: [x + sign * (0.1 + k * 0.09), y + 0.11 + k * 0.045, z + 0.06],
            scale: [0.025, 0.115, 0.009],
            rot: [0.15, 0, sign * (0.7 + k * 0.19)],
          });
      }
    }
  }
  leafCloud(g, leaves, m.leafLight);
  return g;
}
export function plant(parent, pos, m, scale = 1) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  cylinder(g, 0.25, 0.2, 0.4, [0, 0.2, 0], m.clay);
  cylinder(g, 0.23, 0.23, 0.012, [0, 0.406, 0], m.soil);
  const leaves = [];
  for (let i = 0; i < 9; i++) {
    const a = i * 2.399,
      h = 0.67 + (i % 4) * 0.18,
      x = Math.cos(a) * 0.3,
      z = Math.sin(a) * 0.3;
    tube(
      g,
      [
        [0, 0.39, 0],
        [x * 0.5, h - 0.12, z * 0.5],
        [x, h, z],
      ],
      0.008,
      m.leaf,
    );
    leaves.push({
      pos: [x, h, z],
      scale: [0.12, 0.25, 0.024],
      rot: [0.2, a, -0.4],
    });
  }
  leafCloud(g, leaves, m.leaf);
  return g;
}
export function trailing(parent, pos, m, scale = 1) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  pottery(g, [0, 0, 0], 0.42, m.celadon);
  const leaves = [];
  for (let j = 0; j < 3; j++) {
    const x = (j - 1) * 0.09;
    tube(
      g,
      [
        [0, 0.2, 0],
        [x, 0.26, 0.2],
        [x + 0.08, -0.2, 0.23],
        [x - 0.03, -0.7, 0.19],
        [x + 0.07, -1.08 + j * 0.14, 0.17],
      ],
      0.004,
      m.leaf,
    );
    for (let i = 0; i < 17; i++)
      leaves.push({
        pos: [
          x + Math.sin(i * 2) * 0.06,
          0.22 - i * 0.072,
          0.2 + Math.cos(i) * 0.025,
        ],
        scale: [0.038, 0.064, 0.013],
        rot: [0, 0, Math.sin(i) * 0.8],
      });
  }
  leafCloud(g, leaves, m.leaf);
  return g;
}
export function stone(parent, pos, m, scale = [0.18, 0.32, 0.16]) {
  const mesh = new THREE.Mesh(rockGeo, m.rock);
  mesh.position.set(...pos);
  mesh.scale.set(...scale);
  mesh.rotation.y = 0.4;
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function bonsai(parent, pos, m, scale = 1) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  box(g, [0.48, 0.07, 0.34], [0, 0.035, 0], m.dark, 0.013);
  box(g, [0.4, 0.02, 0.26], [0, 0.08, 0], m.soil, 0.03);
  tube(
    g,
    [
      [0, 0.09, 0],
      [-0.08, 0.24, 0],
      [0.09, 0.41, 0],
      [0.02, 0.61, 0],
    ],
    0.027,
    m.wood,
  );
  const leaves = [];
  for (let i = 0; i < 26; i++) {
    const tier = i % 4,
      a = i * 2.399;
    leaves.push({
      pos: [
        Math.sin(tier * 2) * 0.12 + Math.cos(a) * 0.12,
        0.28 + tier * 0.11,
        Math.sin(a) * 0.12,
      ],
      scale: [0.1, 0.035, 0.07],
    });
  }
  leafCloud(g, leaves, m.leaf);
  return g;
}
export function branches(parent, pos, m, scale = 1, flowers = false) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  const buds = [];
  for (let i = 0; i < 6; i++) {
    const x = (i - 2.5) * 0.13,
      y = 0.4 + (i % 3) * 0.16,
      z = Math.sin(i) * 0.12;
    tube(
      g,
      [
        [0, 0, 0],
        [x * 0.35, y * 0.4, z * 0.4],
        [x, y, z],
        [x + 0.07, y + 0.17, z],
      ],
      0.008,
      m.dark,
    );
    tube(
      g,
      [
        [x * 0.7, y * 0.7, z * 0.7],
        [x - 0.1, y + 0.1, z - 0.07],
      ],
      0.004,
      m.dark,
    );
    if (flowers)
      for (let j = 0; j < 4; j++)
        buds.push({
          pos: [x + 0.01 * j, y + j * 0.05, z],
          scale: [0.024, 0.019, 0.023],
        });
  }
  if (buds.length) leafCloud(g, buds, m.paper);
  return g;
}
export function teaSet(parent, pos, m, scale = 1) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  box(g, [0.94, 0.035, 0.43], [0, 0.018, 0], m.dark, 0.025);
  const pot = group(g, [-0.06, 0.035, -0.04]);
  sphere(pot, [0.14, 0.12, 0.13], [0, 0.115, 0], m.celadon);
  cylinder(pot, 0.087, 0.09, 0.02, [0, 0.23, 0], m.celadon);
  sphere(pot, [0.023, 0.017, 0.023], [0, 0.255, 0], m.bronze);
  tube(
    pot,
    [
      [0.1, 0.12, 0],
      [0.21, 0.17, 0],
      [0.235, 0.22, 0],
    ],
    0.024,
    m.celadon,
  );
  torus(pot, 0.09, 0.014, [-0.12, 0.15, 0], m.celadon, [0, 0, 0]);
  for (const [x, z] of [
    [-0.32, 0.08],
    [0.18, 0.08],
    [0.36, -0.06],
  ]) {
    cylinder(g, 0.082, 0.086, 0.009, [x, 0.043, z], m.wood);
    pottery(g, [x, 0.049, z], 0.25, m.celadon, "bowl");
  }
  return g;
}
export function wovenPouf(parent, pos, m, r = 0.43) {
  const g = group(parent, pos);
  sphere(g, [r, 0.26, r], [0, 0.25, 0], m.woven);
  for (let i = 0; i < 18; i++) {
    const y = 0.018 + i * 0.026;
    const rr = r * Math.sqrt(Math.max(0.02, 1 - ((y - 0.25) / 0.26) ** 2));
    torus(g, rr, 0.007, [0, y, 0], m.taupe);
  }
  return g;
}
export function paperLamp(parent, pos, m, scale = 1, tall = false) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  const h = tall ? 1.25 : 0.57;
  box(g, [0.38, 0.05, 0.35], [0, 0.025, 0], m.dark, 0.012);
  const shade = box(
    g,
    [0.29, h, 0.27],
    [0, 0.065 + h / 2, 0],
    m.glow.clone(),
    0.012,
  );
  shade.castShadow = false;
  for (const x of [-0.168, 0.168])
    for (const z of [-0.158, 0.158])
      box(g, [0.018, h + 0.1, 0.018], [x, 0.07 + h / 2, z], m.dark);
  for (const y of [0.055, 0.07 + h / 2, h + 0.11]) {
    for (const x of [-0.168, 0.168])
      box(g, [0.018, 0.018, 0.34], [x, y, 0], m.dark);
    for (const z of [-0.158, 0.158])
      box(g, [0.36, 0.018, 0.018], [0, y, z], m.dark);
  }
  return { root: g, shade: shade.material, height: (0.07 + h / 2) * scale };
}
