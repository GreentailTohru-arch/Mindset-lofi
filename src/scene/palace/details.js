import * as THREE from "three";
import { box, cylinder, torus, group, tube } from "../primitives.js";

export function lattice(parent, w, h, pos, m) {
  const g = group(parent, pos);
  for (const x of [-w / 2, w / 2]) box(g, [0.06, h, 0.07], [x, 0, 0], m);
  for (const y of [-h / 2, h / 2]) box(g, [w, 0.06, 0.07], [0, y, 0], m);
  const cols = Math.max(2, Math.round(w / 0.22)),
    rows = Math.max(2, Math.round(h / 0.23));
  for (let i = 1; i < cols; i++)
    box(g, [0.026, h, 0.035], [-w / 2 + (i * w) / cols, 0, 0], m);
  for (let i = 1; i < rows; i++)
    box(g, [w, 0.026, 0.035], [0, -h / 2 + (i * h) / rows, 0], m);
  return g;
}
export function giltMotif(parent, pos, scale, m) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  for (const s of [-1, 1]) {
    tube(
      g,
      [
        [0, 0, 0],
        [s * 0.15, 0.16, 0],
        [s * 0.4, 0.13, 0],
        [s * 0.43, -0.07, 0],
        [s * 0.28, -0.16, 0],
        [s * 0.18, -0.045, 0],
        [s * 0.28, 0.025, 0],
      ],
      0.016,
      m.gold,
    );
    tube(
      g,
      [
        [0, -0.12, 0],
        [s * 0.15, -0.25, 0],
        [s * 0.34, -0.26, 0],
      ],
      0.014,
      m.gold,
    );
  }
  const diamond = box(g, [0.105, 0.105, 0.035], [0, 0.02, 0], m.gold, 0.012);
  diamond.rotation.z = Math.PI / 4;
  return g;
}
export function table(parent, pos, w, d, h, m) {
  const g = group(parent, pos);
  box(g, [w, 0.13, d], [0, h, 0], m.wood, 0.025);
  for (const z of [-d / 2 + 0.08, d / 2 - 0.08]) {
    box(g, [w - 0.14, 0.22, 0.065], [0, h - 0.17, z], m.woodDark, 0.015);
    for (let i = -1; i <= 1; i++)
      giltMotif(
        g,
        [i * w * 0.28, h - 0.16, z + (z > 0 ? 0.04 : -0.04)],
        0.42,
        m,
      );
  }
  for (const x of [-w / 2 + 0.14, w / 2 - 0.14])
    for (const z of [-d / 2 + 0.13, d / 2 - 0.13]) {
      box(g, [0.13, h - 0.05, 0.13], [x, h / 2 - 0.02, z], m.woodDark, 0.015);
      box(g, [0.19, 0.07, 0.19], [x, 0.06, z], m.wood, 0.02);
      box(g, [0.145, 0.035, 0.145], [x, h * 0.3, z], m.gold, 0.005);
    }
  return g;
}
export function lantern(parent, pos, scale, m) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  const shade = m.glow.clone();
  box(g, [0.39, 0.55, 0.39], [0, 0.4, 0], shade, 0.012);
  for (const y of [0.095, 0.7]) {
    box(g, [0.52, 0.065, 0.52], [0, y, 0], m.woodDark, 0.016);
    box(g, [0.49, 0.019, 0.49], [0, y + 0.04, 0], m.gold, 0.005);
  }
  for (const x of [-0.225, 0.225])
    for (const z of [-0.225, 0.225])
      cylinder(g, 0.017, 0.017, 0.6, [x, 0.4, z], m.gold, 8);
  for (const z of [-0.21, 0.21])
    for (const x of [-0.11, 0.11])
      box(g, [0.018, 0.51, 0.016], [x, 0.4, z], m.woodDark);
  tube(
    g,
    [
      [-0.15, 0.74, 0],
      [-0.1, 0.91, 0],
      [0.1, 0.91, 0],
      [0.15, 0.74, 0],
    ],
    0.015,
    m.bronze,
  );
  return { root: g, shade };
}
export function vase(parent, pos, scale, m) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  const p = [
    [0.12, 0],
    [0.17, 0.04],
    [0.25, 0.16],
    [0.27, 0.35],
    [0.18, 0.53],
    [0.095, 0.63],
    [0.09, 0.82],
    [0.13, 0.85],
  ].map((v) => new THREE.Vector2(...v));
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(p, 32), m.porcelain);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
  torus(g, 0.13, 0.012, [0, 0.85, 0], m.porcelain);
  cylinder(g, 0.083, 0.083, 0.01, [0, 0.79, 0], m.woodDark);
  return g;
}
