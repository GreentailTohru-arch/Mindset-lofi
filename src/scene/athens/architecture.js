import * as THREE from "three";
import { box, cylinder, torus, tube, group } from "../primitives.js";

export function ionicColumn(parent, pos, m, height = 3.42) {
  const g = group(parent, pos);
  box(g, [0.72, 0.13, 0.72], [0, 0.085, 0], m.marble, 0.018);
  for (const [y, r, h] of [
    [0.19, 0.31, 0.09],
    [0.27, 0.27, 0.07],
    [height - 0.32, 0.27, 0.1],
  ])
    cylinder(g, r, r, h, [0, y, 0], m.marble);
  const shaftHeight = height - 0.66;
  cylinder(
    g,
    0.207,
    0.247,
    shaftHeight,
    [0, 0.32 + shaftHeight / 2, 0],
    m.marble,
    40,
  );
  // Convex narrow ribs leave continuous recessed flutes between them.
  for (let i = 0; i < 20; i++) {
    const a = (i * Math.PI) / 10;
    const rib = cylinder(
      g,
      0.012,
      0.017,
      shaftHeight - 0.025,
      [Math.cos(a) * 0.219, 0.32 + shaftHeight / 2, Math.sin(a) * 0.219],
      m.marble,
      6,
    );
    rib.castShadow = false;
  }
  box(g, [0.68, 0.12, 0.53], [0, height - 0.08, 0], m.marble, 0.02);
  for (const side of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 38; i++) {
      const a = (i / 38) * Math.PI * 3.7,
        r = 0.137 * (1 - i / 47);
      pts.push([
        side * 0.24 + Math.cos(a) * r,
        height - 0.235 + Math.sin(a) * r,
        0.24,
      ]);
    }
    tube(g, pts, 0.018, m.marble);
  }
  for (const side of [-1, 1])
    torus(g, 0.12, 0.035, [side * 0.24, height - 0.235, 0], m.marble, [
      Math.PI / 2,
      0,
      0,
    ]);
  return g;
}

export function archedShape(cx, bottom, width, spring) {
  const s = new THREE.Shape(),
    r = width / 2;
  s.moveTo(cx - r, bottom);
  s.lineTo(cx + r, bottom);
  s.lineTo(cx + r, spring);
  s.absarc(cx, spring, r, 0, Math.PI, false);
  s.lineTo(cx - r, bottom);
  return s;
}
