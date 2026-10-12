import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const boxes = new Map();
const sphereGeometry = new THREE.SphereGeometry(1, 20, 14);
export function box(parent, size, pos, mat, radius = 0) {
  const key = size.join(",") + ":" + radius;
  let geo = boxes.get(key);
  if (!geo) {
    geo = radius
      ? new RoundedBoxGeometry(...size, 3, radius)
      : new THREE.BoxGeometry(...size);
    boxes.set(key, geo);
  }
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
export function sphere(parent, size, pos, mat) {
  const m = new THREE.Mesh(sphereGeometry, mat);
  m.scale.set(...size);
  m.position.set(...pos);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
export function cylinder(parent, top, bottom, height, pos, mat, segments = 32) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(top, bottom, height, segments),
    mat,
  );
  m.position.set(...pos);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
export function torus(
  parent,
  r,
  t,
  pos,
  mat,
  rotation = [Math.PI / 2, 0, 0],
  arc = Math.PI * 2,
) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 36, arc), mat);
  m.position.set(...pos);
  m.rotation.set(...rotation);
  parent.add(m);
  return m;
}
export function group(parent, pos = [0, 0, 0]) {
  const g = new THREE.Group();
  g.position.set(...pos);
  parent.add(g);
  return g;
}
export function tube(parent, points, r, mat) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(...p)),
  );
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, r, 6, false), mat);
  m.castShadow = true;
  parent.add(m);
  return m;
}
export function plant(parent, pos, scale, m) {
  const g = group(parent, pos);
  g.scale.setScalar(scale);
  cylinder(g, 0.24, 0.18, 0.43, [0, 0.23, 0], m.ceramic);
  cylinder(g, 0.219, 0.219, 0.02, [0, 0.448, 0], m.soil);
  for (let i = 0; i < 8; i++) {
    const a = i * 2.399,
      yy = 0.68 + i * 0.1;
    const x = Math.cos(a) * 0.34,
      z = Math.sin(a) * 0.34;
    tube(
      g,
      [
        [0, 0.42, 0],
        [x * 0.4, yy - 0.18, z * 0.4],
        [x, yy, z],
      ],
      0.012,
      m.leaf,
    );
    const leaf = sphere(
      g,
      [0.11, 0.26, 0.032],
      [x, yy, z],
      i % 2 ? m.leaf : m.leafLight,
    );
    leaf.rotation.set(Math.sin(a) * 0.75, a, Math.cos(a) * 0.7);
  }
  return g;
}
