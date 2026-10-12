import * as THREE from "three";
import { box, cylinder, sphere, tube, group, torus } from "../primitives.js";
export function flourish(parent, pos, scale, m) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  for (const s of [-1, 1]) {
    tube(
      g,
      [
        [0, 0, 0],
        [s * 0.14, 0.19, 0],
        [s * 0.37, 0.24, 0],
        [s * 0.48, 0.09, 0],
        [s * 0.36, -0.04, 0],
        [s * 0.24, 0.05, 0],
        [s * 0.33, 0.13, 0],
      ],
      0.023,
      m.gold,
    );
    tube(
      g,
      [
        [0, -0.07, 0],
        [s * 0.18, -0.22, 0],
        [s * 0.42, -0.16, 0],
      ],
      0.017,
      m.gold,
    );
    const leaf = sphere(g, [0.055, 0.12, 0.026], [s * 0.1, 0.16, 0], m.gold);
    leaf.rotation.z = s * 0.48;
  }
  sphere(g, [0.055, 0.095, 0.027], [0, 0.03, 0.01], m.gold);
  return g;
}
export function ornateFrame(parent, pos, w, h, m) {
  const g = group(parent, pos);
  for (const x of [-w / 2, w / 2]) {
    box(g, [0.095, h, 0.09], [x, 0, 0], m.gold, 0.022);
    box(
      g,
      [0.035, h - 0.08, 0.04],
      [x - Math.sign(x) * 0.067, 0, 0.02],
      m.woodDark,
      0.009,
    );
  }
  for (const y of [-h / 2, h / 2]) {
    box(g, [w + 0.08, 0.095, 0.09], [0, y, 0], m.gold, 0.022);
    box(
      g,
      [w - 0.08, 0.035, 0.04],
      [0, y - Math.sign(y) * 0.067, 0.02],
      m.woodDark,
      0.009,
    );
  }
  flourish(g, [0, h / 2 + 0.045, 0.035], Math.min(w, 1.8) * 0.52, m);
  for (const x of [-w / 2, w / 2])
    for (const y of [-h / 2, h / 2]) {
      const f = flourish(g, [x, y, 0.045], 0.32, m);
      f.rotation.z = (x * y > 0 ? 1 : -1) * 0.7;
    }
  return g;
}
export function cabriole(parent, x, z, height, m) {
  const s = x < 0 ? -1 : 1;
  tube(
    parent,
    [
      [x, height, z],
      [x + s * 0.065, height * 0.72, z + 0.025],
      [x - s * 0.03, height * 0.35, z],
      [x + s * 0.06, 0.075, z + 0.05],
    ],
    0.043,
    m.wood,
  );
  sphere(parent, [0.08, 0.045, 0.075], [x + s * 0.06, 0.062, z + 0.05], m.gold);
  sphere(
    parent,
    [0.055, 0.085, 0.05],
    [x + s * 0.035, height * 0.77, z + 0.04],
    m.gold,
  );
}
export function candles(parent, pos, scale, m) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  cylinder(g, 0.11, 0.17, 0.055, [0, 0.04, 0], m.gold);
  cylinder(g, 0.025, 0.046, 0.36, [0, 0.23, 0], m.gold);
  const flames = [];
  for (const x of [-0.21, 0, 0.21]) {
    const y = x === 0 ? 0.57 : 0.44;
    if (x)
      tube(
        g,
        [
          [0, 0.25, 0],
          [x * 0.7, 0.23, 0],
          [x, 0.32, 0],
          [x, y - 0.05, 0],
        ],
        0.019,
        m.gold,
      );
    cylinder(g, 0.075, 0.055, 0.035, [x, y, 0], m.gold);
    cylinder(g, 0.029, 0.029, 0.19, [x, y + 0.11, 0], m.paper);
    cylinder(g, 0.006, 0.006, 0.025, [x, y + 0.215, 0], m.black, 6);
    const flame = sphere(
      g,
      [0.017, 0.044, 0.017],
      [x, y + 0.25, 0],
      m.flame.clone(),
    );
    flames.push(flame);
  }
  return { root: g, flames };
}
