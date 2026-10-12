import * as THREE from "three";
import { tube, group } from "../primitives.js";
// Deformation depends on position, so shared edges stay joined.
export function wornSlab(parent, size, pos, m, seed = 0) {
  const geo = new THREE.BoxGeometry(...size, 14, 2, 8),
    p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      z = p.getZ(i);
    p.setXYZ(
      i,
      x + Math.sin(z * 11 + seed) * 0.017,
      y + Math.sin(x * 6 + z * 3 + seed) * 0.008,
      z + Math.sin(x * 9 + seed) * 0.015,
    );
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.set(...pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function pottery(parent, pos, scale, m, kind = "vase") {
  const profiles = {
    vase: [
      [0.13, 0],
      [0.19, 0.05],
      [0.245, 0.25],
      [0.22, 0.43],
      [0.12, 0.57],
      [0.105, 0.73],
      [0.125, 0.77],
      [0.099, 0.77],
      [0.087, 0.72],
      [0.09, 0.58],
      [0.16, 0.42],
      [0.18, 0.22],
      [0.1, 0.09],
      [0, 0.09],
    ],
    bowl: [
      [0.15, 0],
      [0.22, 0.05],
      [0.31, 0.2],
      [0.34, 0.3],
      [0.305, 0.3],
      [0.265, 0.19],
      [0.18, 0.09],
      [0, 0.09],
    ],
    basin: [
      [0.43, 0],
      [0.58, 0.13],
      [0.67, 0.38],
      [0.64, 0.48],
      [0.54, 0.48],
      [0.52, 0.36],
      [0.4, 0.17],
      [0, 0.15],
    ],
  };
  const geo = new THREE.LatheGeometry(
      profiles[kind].map((p) => new THREE.Vector2(...p)),
      40,
    ),
    p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      z = p.getZ(i),
      a = Math.atan2(z, x);
    const f =
      1 + 0.029 * Math.sin(a * 3 + y * 9) + 0.014 * Math.cos(a * 7 + y * 4);
    const lip = kind === "vase" ? 0.77 : kind === "basin" ? 0.48 : 0.3;
    const chip = y > lip - 0.015 && a > 0.48 && a < 0.83 ? 0.019 : 0;
    p.setXYZ(i, x * f, y + Math.sin(a * 5) * 0.009 * (y / lip) - chip, z * f);
  }
  geo.computeVertexNormals();
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  const mesh = new THREE.Mesh(geo, m);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
  return g;
}
export function branches(parent, pos, scale, m) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  tube(
    g,
    [
      [0, 0, 0],
      [0.05, 0.42, 0.01],
      [-0.08, 0.84, 0],
      [0.04, 1.27, 0.02],
      [-0.08, 1.65, 0.04],
    ],
    0.015,
    m,
  );
  for (const [y, s, length] of [
    [0.49, -1, 0.52],
    [0.72, 1, 0.55],
    [1.01, -1, 0.43],
    [1.2, 1, 0.31],
  ]) {
    const end = [s * length, y + 0.35, s * 0.07];
    tube(g, [[0, y, 0], [s * 0.17, y + 0.13, 0.02], end], 0.008, m);
    tube(
      g,
      [
        [s * 0.2, y + 0.16, 0.02],
        [s * 0.23, y + 0.43, -0.07],
        [s * 0.28, y + 0.55, -0.07],
      ],
      0.004,
      m,
    );
  }
  return g;
}
