import * as THREE from "three";
import { box, cylinder, group, tube } from "../primitives.js";
import { cityTexture, reflectionEnvironment } from "./materials.js";
import { damp } from "../../state.js";
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "memphis-room";
  scene.environment = reflectionEnvironment();
  scene.environmentIntensity = 0.24;
  const sq = new THREE.Shape();
  sq.moveTo(-5.1, -5.1);
  sq.lineTo(5.1, -5.1);
  sq.lineTo(5.1, 5.1);
  sq.lineTo(-5.1, 5.1);
  sq.closePath();
  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(sq, {
      depth: 0.22,
      bevelSize: 0.07,
      bevelThickness: 0.05,
      bevelSegments: 1,
    }),
    m.trim,
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.28;
  root.add(base);
  box(root, [10, 0.05, 10], [0, -0.013, 0], m.floor).name =
    "memphis-terrazzo-floor";
  for (let z = -4.65; z < 5; z += 0.65)
    for (let x = 3.7; x < 5; x += 0.65)
      box(
        root,
        [0.65, 0.013, 0.65],
        [x, 0.023, z],
        (Math.round((z + 4.65) / 0.65) + Math.round((x - 3.7) / 0.65)) % 2
          ? m.black
          : m.white,
      );
  for (let x = -4.67; x < 3.4; x += 0.65)
    for (const z of [4.35, 5])
      if (z < 5)
        box(
          root,
          [0.65, 0.014, 0.65],
          [x, 0.025, z],
          Math.round((x + 4.67) / 0.65) % 2 ? m.white : m.black,
        );
  const left = group(root, [-5, 0, 0]);
  left.rotation.y = Math.PI / 2;
  left.name = "memphis-window-wall";
  // Real rectangular opening, no opaque face behind the glazing.
  box(left, [10.2, 0.64, 0.22], [0, 0.32, 0], m.wall);
  box(left, [10.2, 0.58, 0.22], [0, 3.71, 0], m.wall);
  box(left, [1.48, 2.78, 0.22], [-4.36, 2.03, 0], m.wall);
  box(left, [3.02, 2.78, 0.22], [3.59, 2.03, 0], m.wall);
  box(root, [10.2, 4, 0.22], [0, 2, -5], m.wall);
  box(root, [10.2, 0.065, 0.25], [0, 4.03, -5], m.trim);
  box(root, [0.25, 0.065, 10.2], [-5, 4.03, 0], m.trim);
  box(root, [10, 0.1, 0.05], [0, 0.05, -4.86], m.pink);
  box(root, [0.05, 0.1, 10], [-4.86, 0.05, 0], m.red);
  box(left, [1.43, 3.36, 0.024], [4.32, 2.27, 0.132], m.blue);
  box(left, [0.61, 2.85, 0.028], [3.24, 2.4, 0.15], m.yellow);
  const win = group(left, [-0.77, 0, 0.14]);
  win.name = "memphis-blue-window";
  const day = cityTexture(),
    night = cityTexture(true);
  const view = new THREE.Mesh(
    new THREE.PlaneGeometry(5.7, 2.78),
    new THREE.MeshBasicMaterial({ map: day, toneMapped: false }),
  );
  view.position.set(0, 2.03, -0.13);
  win.add(view);
  for (const x of [-2.85, -0.95, 0.95, 2.85])
    box(win, [0.095, 2.92, 0.13], [x, 2.03, 0], m.blue, 0.007);
  for (const y of [0.6, 3.46])
    box(win, [5.83, 0.13, 0.17], [0, y, 0], m.blue, 0.008);
  box(win, [5.75, 0.05, 0.09], [0, 1.84, 0.025], m.blue);
  const slats = [];
  for (let i = 0; i < 20; i++) {
    const slat = box(
      win,
      [5.52, 0.096, 0.055],
      [0, 3.29 - i * 0.11, 0.115],
      m.coral,
      0.005,
    );
    slats.push(slat);
  }
  const cord = tube(
    win,
    [
      [2.62, 3.3, 0.2],
      [2.62, 0.85, 0.2],
    ],
    0.008,
    m.white,
  );
  register(win, "珊瑚百叶窗", "收起 / 放下", () => {
    store.set("curtains", !store.state.curtains);
    return "珊瑚色百叶，让城市光影变换。";
  });
  function circle(parent, x, y, r, mat) {
    const c = cylinder(parent, r, r, 0.025, [x, y, 0.155], mat, 48);
    c.rotation.x = Math.PI / 2;
    return c;
  }
  circle(left, -4.75, 3.23, 0.48, m.yellow);
  for (let i = 0; i < 20; i++) {
    const x = -4.78 + (i % 4) * 0.14,
      y = 0.94 + Math.floor(i / 4) * 0.21;
    circle(left, x, y, 0.022 + (i % 3) * 0.008, m.black);
  }
  tube(
    left,
    [
      [-4.73, 2.75, 0.17],
      [-4.47, 2.68, 0.17],
      [-4.43, 2.44, 0.17],
      [-4.16, 2.41, 0.17],
      [-4.08, 2.17, 0.17],
    ],
    0.031,
    m.black,
  );
  const slash = box(left, [0.11, 0.56, 0.024], [2.47, 3.4, 0.15], m.black);
  slash.rotation.z = -0.58;
  function art(pos, w, h, material) {
    const g = group(root, pos);
    box(g, [w + 0.09, h + 0.09, 0.065], [0, 0, 0], m.black, 0.008);
    box(g, [w, h, 0.016], [0, 0, 0.045], material);
    return g;
  }
  art([0.26, 2.65, -4.83], 1.6, 1.69, m.art);
  art([1.77, 2.65, -4.83], 0.77, 1.28, m.dots);
  const tri = new THREE.Shape();
  tri.moveTo(-0.29, -0.38);
  tri.lineTo(0.29, -0.38);
  tri.lineTo(-0.29, 0.36);
  tri.closePath();
  const tm = new THREE.Mesh(new THREE.ShapeGeometry(tri), m.blue);
  tm.position.set(1.8, 2.58, -4.73);
  root.add(tm);
  box(root, [0.87, 1.53, 0.03], [2.98, 2.77, -4.84], m.teal);
  tube(
    root,
    [
      [2.99, 2.22, -4.8],
      [3.13, 2.46, -4.8],
      [2.92, 2.7, -4.8],
      [3.13, 3, -4.8],
      [3.02, 3.29, -4.8],
    ],
    0.034,
    m.black,
  );
  const disc = group(root, [4.14, 2.8, -4.82]);
  const half = new THREE.Mesh(
    new THREE.CircleGeometry(0.64, 48, Math.PI / 2, Math.PI),
    m.pink,
  );
  disc.add(half);
  box(disc, [0.11, 1.28, 0.025], [0, 0, 0], m.yellow);
  return {
    root,
    update(dt) {
      view.material.map = store.state.day ? day : night;
      slats.forEach((s, i) => {
        s.scale.y = damp(s.scale.y, store.state.curtains ? 0.29 : 1, dt, 3);
        s.position.y = damp(
          s.position.y,
          3.29 - i * (store.state.curtains ? 0.036 : 0.128),
          dt,
          3,
        );
      });
    },
  };
}
