import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import { wornSlab, pottery, branches } from "./forms.js";

export function books(parent, pos, m, count = 4, upright = false) {
  const g = group(parent, pos);
  for (let i = 0; i < count; i++) {
    const mat = [m.darkWood, m.blanket, m.rust, m.cushion][i % 4];
    if (upright) {
      const h = 0.28 + (i % 4) * 0.027;
      box(g, [0.085, h, 0.24], [i * 0.096, h / 2, 0], mat, 0.006);
      box(g, [0.062, h - 0.028, 0.244], [i * 0.096, h / 2, 0.002], m.paper);
    } else {
      const b = group(g, [(i % 2) * 0.021, i * 0.064, 0]);
      b.rotation.y = ((i % 3) - 1) * 0.06;
      wornSlab(b, [0.37, 0.058, 0.28], [0, 0.03, 0], mat, i);
      box(b, [0.344, 0.035, 0.284], [0, 0.03, 0.001], m.paper);
    }
  }
  return g;
}
export function linenStack(parent, pos, m, count = 3) {
  const g = group(parent, pos);
  for (let i = 0; i < count; i++) {
    const b = box(
      g,
      [0.52, 0.068, 0.35],
      [(i % 2) * 0.025, i * 0.062 + 0.034, 0],
      i % 2 ? m.blanket : m.linen,
      0.03,
    );
    b.rotation.y = (i - 1) * 0.04;
  }
  return g;
}
export function basket(parent, pos, m, scale = 1) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  cylinder(g, 0.23, 0.19, 0.35, [0, 0.175, 0], m.grass);
  cylinder(g, 0.212, 0.212, 0.015, [0, 0.339, 0], m.darkWood);
  for (let j = 0; j < 12; j++)
    torus(g, 0.193 + j * 0.0033, 0.006, [0, 0.018 + j * 0.029, 0], m.wood);
  for (let i = 0; i < 20; i++) {
    const a = (i * Math.PI) / 10;
    tube(
      g,
      [
        [Math.cos(a) * 0.19, 0.015, Math.sin(a) * 0.19],
        [Math.cos(a) * 0.23, 0.35, Math.sin(a) * 0.23],
      ],
      0.006,
      m.grass,
    );
  }
  torus(g, 0.23, 0.014, [0, 0.354, 0], m.wood);
  return g;
}
export function rug(parent, pos, w, d, m, angle = 0) {
  const g = group(parent, pos);
  g.rotation.y = angle;
  wornSlab(g, [w, 0.025, d], [0, 0.018, 0], m.mat, 3);
  for (const s of [-1, 1])
    for (let i = 0; i < 48; i++) {
      const x = -w / 2 + (i * w) / 47;
      tube(
        g,
        [
          [x, 0.022, (s * d) / 2],
          [x + 0.012, 0.022, s * (d / 2 + 0.055 + (i % 3) * 0.011)],
        ],
        0.004,
        m.grass,
      );
    }
  return g;
}
export function rumpled(
  parent,
  pos,
  w,
  d,
  m,
  { drop = 0, amp = 0.025, dropStart = 0.4 } = {},
) {
  const geo = new THREE.PlaneGeometry(w, d, 48, 44),
    p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      z = -p.getY(i),
      edge = Math.max(0, (z / d - dropStart) / (0.5 - dropStart));
    p.setZ(
      i,
      amp * (Math.sin(x * 19 + z * 5) + 0.5 * Math.sin(z * 27 - x * 7)) -
        edge * drop,
    );
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, m);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(...pos);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function cushion(parent, pos, m, r = 0.48) {
  const g = group(parent, pos);
  sphere(g, [r, 0.16, r * 0.94], [0, 0.15, 0], m.cushion);
  torus(g, r * 0.94, 0.009, [0, 0.15, 0], m.blanket);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    tube(
      g,
      [
        [Math.cos(a) * r * 0.15, 0.306, Math.sin(a) * r * 0.15],
        [Math.cos(a) * r * 0.6, 0.277, Math.sin(a) * r * 0.6],
        [Math.cos(a) * r * 0.92, 0.18, Math.sin(a) * r * 0.92],
      ],
      0.003,
      m.blanket,
    );
  }
  sphere(g, [0.027, 0.013, 0.027], [0, 0.3, 0], m.blanket);
  return g;
}
export function bonsai(parent, pos, m, scale = 1) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  wornSlab(g, [0.48, 0.095, 0.34], [0, 0.06, 0], m.darkWood, 3);
  box(g, [0.42, 0.015, 0.28], [0, 0.111, 0], m.charcoal, 0.025);
  tube(
    g,
    [
      [0, 0.11, 0],
      [-0.08, 0.24, 0],
      [0.08, 0.4, 0.015],
      [0.02, 0.58, 0],
    ],
    0.027,
    m.darkWood,
  );
  for (let i = 0; i < 20; i++) {
    const a = i * 2.399,
      tier = i % 4;
    sphere(
      g,
      [0.1, 0.045, 0.08],
      [
        Math.sin(tier * 2) * 0.1 + Math.cos(a) * 0.1,
        0.28 + tier * 0.095,
        Math.sin(a) * 0.11,
      ],
      m.moss,
    );
  }
  return g;
}
export function trailingPlant(parent, pos, m, scale = 1) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  pottery(g, [0, 0, 0], 0.42, m.clay);
  for (let strand = 0; strand < 3; strand++) {
    const x = (strand - 1) * 0.1;
    tube(
      g,
      [
        [0, 0.2, 0],
        [x, 0.32, 0.14],
        [x + 0.05, -0.1, 0.22],
        [x - 0.04, -0.6, 0.2],
        [x + 0.03, -1.14 + strand * 0.16, 0.17],
      ],
      0.005,
      m.darkWood,
    );
    for (let i = 0; i < 17; i++) {
      const y = 0.27 - i * 0.076,
        xx = x + Math.sin(i * 1.8) * 0.062;
      const leaf = sphere(
        g,
        [0.042, 0.068, 0.015],
        [xx, y, 0.2 + Math.cos(i) * 0.035],
        m.moss,
      );
      leaf.rotation.z = Math.sin(i * 2) * 0.8;
    }
  }
  return g;
}
export function stool(parent, pos, m) {
  const g = group(parent, pos);
  g.rotation.y = 0.18;
  for (const [x, z] of [
    [-0.19, -0.17],
    [0.19, -0.17],
    [0, 0.19],
  ])
    tube(
      g,
      [
        [x * 1.3, 0.03, z * 1.3],
        [x, 0.46, z],
      ],
      0.042,
      m.darkWood,
    );
  wornSlab(g, [0.62, 0.09, 0.54], [0, 0.49, 0], m.wood, 7);
  tube(
    g,
    [
      [-0.29, 0.545, 0.015],
      [-0.04, 0.544, 0.026],
      [0.22, 0.545, 0.008],
    ],
    0.004,
    m.charcoal,
  );
  return g;
}
