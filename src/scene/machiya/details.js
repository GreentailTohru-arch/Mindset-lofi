import * as THREE from "three";
import { box, group, cylinder, sphere, torus, tube } from "../primitives.js";

// Reusable small objects share the scene's local, procedural materials.
export function stackedBooks(parent, pos, m, count = 3) {
  const g = group(parent, pos);
  for (let i = 0; i < count; i++) {
    const b = group(g, [(i % 2) * 0.035, i * 0.072, 0]);
    b.rotation.y = i % 2 ? 0.07 : -0.04;
    box(
      b,
      [0.4, 0.065, 0.29],
      [0, 0.0325, 0],
      [m.indigo, m.book, m.red][i % 3],
      0.006,
    );
    box(b, [0.374, 0.041, 0.296], [0, 0.033, 0.004], m.pages);
  }
  return g;
}
export function basket(parent, pos, m, scale = 1) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  cylinder(g, 0.25, 0.21, 0.35, [0, 0.175, 0], m.bamboo);
  for (let i = 0; i < 12; i++)
    torus(g, 0.214 + i * 0.003, 0.008, [0, 0.02 + i * 0.029, 0], m.wood);
  for (let i = 0; i < 20; i++) {
    const a = (i * Math.PI) / 10;
    tube(
      g,
      [
        [Math.cos(a) * 0.21, 0.025, Math.sin(a) * 0.21],
        [Math.cos(a) * 0.233, 0.18, Math.sin(a) * 0.233],
        [Math.cos(a) * 0.251, 0.35, Math.sin(a) * 0.251],
      ],
      0.006,
      m.bamboo,
    );
  }
  cylinder(g, 0.227, 0.227, 0.008, [0, 0.345, 0], m.soil);
  torus(g, 0.247, 0.014, [0, 0.353, 0], m.bamboo);
  return g;
}
export function foldedCloth(parent, pos, m, count = 3) {
  const g = group(parent, pos);
  for (let i = 0; i < count; i++) {
    const b = box(
      g,
      [0.53, 0.065, 0.36],
      [(i % 2) * 0.025, 0.0325 + i * 0.061, 0],
      i % 2 ? m.indigo : m.linen,
      0.029,
    );
    b.rotation.y = 0.035 * (i - 1);
  }
  return g;
}
// A real folded surface, not parallel bars floating over the duvet.
export function cloth(parent, width, length, pos, material, amplitude = 0.02) {
  const geo = new THREE.PlaneGeometry(width, length, 30, 36);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      z = p.getY(i);
    p.setZ(
      i,
      amplitude * (Math.sin(x * 15 + z * 2) + 0.45 * Math.cos(z * 19 - x * 3)),
    );
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(...pos);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function blossoms(parent, pos, m, scale = 1) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.105,
      y = 0.27 + i * 0.055,
      z = Math.sin(i * 2) * 0.12;
    tube(
      g,
      [
        [0, 0, 0],
        [x * 0.45, y * 0.6, z * 0.3],
        [x, y, z],
        [x + 0.06, y + 0.13, z - 0.03],
      ],
      0.009,
      m.wood,
    );
    for (let j = 0; j < 3; j++) {
      const yy = y + j * 0.06;
      for (let k = 0; k < 5; k++)
        sphere(
          g,
          [0.019, 0.012, 0.021],
          [
            x + (0.06 * j) / 2 + Math.cos(k * 1.257) * 0.02,
            yy,
            z + Math.sin(k * 1.257) * 0.02,
          ],
          i % 3 ? m.linen : m.red,
        );
    }
  }
  return g;
}
