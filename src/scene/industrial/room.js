import * as THREE from "three";
import { box, group, cylinder, torus, tube } from "../primitives.js";
import { skyline } from "./materials.js";
import { damp } from "../../state.js";
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "industrial-room";
  const s = new THREE.Shape();
  s.moveTo(-5.1, -5.1);
  s.lineTo(5.1, -5.1);
  s.lineTo(5.1, 5.1);
  s.lineTo(-5.1, 5.1);
  s.closePath();
  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(s, {
      depth: 0.22,
      bevelSize: 0.075,
      bevelThickness: 0.055,
      bevelSegments: 1,
    }),
    m.trim,
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.28;
  root.add(base);
  box(root, [10, 0.05, 10], [0, -0.012, 0], m.floor).name = "industrial-floor";
  box(root, [10.14, 3.8, 0.18], [0, 1.9, -5.01], m.wall);
  const wall = group(root);
  wall.name = "industrial-window-wall";
  // World-space UVs keep brick courses aligned across the real window opening.
  for (const [size, pos] of [
    [
      [0.18, 3.8, 2],
      [-5.01, 1.9, -4],
    ],
    [
      [0.18, 3.8, 2.6],
      [-5.01, 1.9, 3.7],
    ],
    [
      [0.18, 0.75, 5.4],
      [-5.01, 0.375, -0.3],
    ],
    [
      [0.18, 0.35, 5.4],
      [-5.01, 3.625, -0.3],
    ],
  ]) {
    const mesh = box(wall, size, pos, m.brick);
    mesh.geometry = mesh.geometry.clone();
    const p = mesh.geometry.attributes.position,
      uv = mesh.geometry.attributes.uv;
    for (let i = 0; i < p.count; i++)
      uv.setXY(i, (p.getZ(i) + pos[2] + 5) / 10, (p.getY(i) + pos[1]) / 3.8);
  }
  for (const y of [0.07, 3.79]) {
    box(root, [10.16, 0.07, 0.21], [0, y, -5], m.trim);
    box(root, [0.21, 0.07, 10.16], [-5, y, 0], m.trim);
  }
  function column(x, z) {
    const g = group(root, [x, 0, z]);
    g.name = "industrial-riveted-column";
    box(g, [0.24, 3.8, 0.12], [0, 1.9, 0], m.steel);
    for (const dz of [-0.12, 0.12])
      box(g, [0.35, 3.8, 0.05], [0, 1.9, dz], m.steel);
    for (const y of [0.13, 1.85, 3.65]) {
      box(g, [0.37, 0.27, 0.04], [0, y, 0.16], m.steel);
      for (const a of [-0.12, 0.12])
        for (const b of [-0.08, 0.08]) {
          const bolt = cylinder(
            g,
            0.022,
            0.022,
            0.025,
            [a, y + b, 0.19],
            m.bolt,
            6,
          );
          bolt.rotation.x = Math.PI / 2;
        }
    }
    box(g, [0.46, 0.08, 0.46], [0, 0.04, 0], m.steel);
  }
  column(-4.8, -4.8);
  column(-4.8, 4.78);
  column(-4.8, -3.1);
  column(2.3, -4.83);
  const win = group(root, [-4.89, 2.1, -0.3]);
  win.rotation.y = Math.PI / 2;
  win.name = "industrial-grid-window";
  const night = skyline(),
    day = skyline(true);
  const view = new THREE.Mesh(
    new THREE.PlaneGeometry(5.4, 2.7),
    new THREE.MeshBasicMaterial({ map: night, toneMapped: false }),
  );
  view.position.z = -0.05;
  win.add(view);
  for (let i = 0; i <= 6; i++)
    box(
      win,
      [i % 6 === 0 ? 0.09 : 0.045, 2.73, 0.08],
      [-2.7 + i * 0.9, 0, 0],
      m.steel,
    );
  for (let i = 0; i <= 4; i++)
    box(win, [5.48, 0.055, 0.08], [0, -1.35 + i * 0.675, 0], m.steel);
  const rod = cylinder(win, 0.025, 0.025, 5.95, [0, 1.52, 0.18], m.black);
  rod.rotation.z = Math.PI / 2;
  const curtains = [];
  for (const sign of [-1, 1]) {
    const pivot = group(win, [sign * 2.62, 1.44, 0.15]);
    pivot.scale.x = 0.17;
    const geo = new THREE.PlaneGeometry(2.78, 2.9, 42, 16),
      p = geo.attributes.position;
    for (let i = 0; i < p.count; i++)
      p.setZ(
        i,
        0.075 * Math.sin(p.getX(i) * 34) + 0.012 * Math.sin(p.getY(i) * 6),
      );
    geo.computeVertexNormals();
    const cloth = new THREE.Mesh(geo, m.curtain);
    cloth.position.y = -1.45;
    cloth.castShadow = true;
    pivot.add(cloth);
    curtains.push({ pivot, sign });
    register(pivot, "工业窗布帘", "缓缓开合", () => {
      store.set("curtains", !store.state.curtains);
      return "窗帘缓缓移动。";
    });
  }
  register(view, "黄昏城市窗景", "日夜切换", () => {
    store.set("day", !store.state.day);
    return "窗外天色变换。";
  });
  // Pipes hug the walls; couplings, valve and conduit boxes expose the structure.
  tube(
    root,
    [
      [-4.72, 0.12, -3.35],
      [-4.72, 3.27, -3.35],
      [-4.72, 3.43, -3.55],
      [-4.72, 3.43, -4.65],
    ],
    0.055,
    m.copper,
  );
  tube(
    root,
    [
      [-4.68, 3.4, 4.5],
      [-4.68, 3.4, -4.66],
    ],
    0.06,
    m.steel,
  );
  tube(
    root,
    [
      [2.5, 3.73, -4.76],
      [2.5, 3.25, -4.76],
      [2.65, 3.12, -4.76],
      [4.05, 3.12, -4.76],
      [4.23, 2.97, -4.76],
      [4.23, 0.15, -4.76],
    ],
    0.047,
    m.copper,
  );
  for (const y of [0.5, 1.4, 2.4, 3.03]) {
    const ring = torus(root, 0.065, 0.015, [4.23, y, -4.76], m.copper);
    ring.rotation.x = Math.PI / 2;
  }
  for (const x of [-3.4, -0.6, 2.1]) {
    tube(
      root,
      [
        [x, 3.54, -4.78],
        [x, 2.65, -4.78],
      ],
      0.012,
      m.bolt,
    );
    box(root, [0.2, 0.25, 0.1], [x, 2.53, -4.75], m.steel, 0.012);
    for (const a of [-0.065, 0.065])
      box(root, [0.018, 0.018, 0.018], [x + a, 2.59, -4.69], m.bolt);
  }
  tube(
    root,
    [
      [-4.7, 3.54, -4.78],
      [4.65, 3.54, -4.78],
    ],
    0.018,
    m.bolt,
  );
  const valve = group(root, [-4.6, 1.75, -3.35]);
  valve.rotation.y = Math.PI / 2;
  torus(valve, 0.15, 0.019, [0, 0, 0], m.copper, [0, 0, 0]);
  for (let i = 0; i < 3; i++) {
    const spoke = box(valve, [0.27, 0.015, 0.015], [0, 0, 0], m.copper);
    spoke.rotation.z = (i * Math.PI) / 3;
  }
  let turn = 0;
  store.subscribe((_state, key) => {
    if (key === "reset") turn = 0;
  });
  register(valve, "铜管阀门", "旋转阀门", () => {
    turn += Math.PI;
    return "旧铜阀轻轻转动。";
  });
  return {
    root,
    update(dt) {
      view.material.map = store.state.day ? day : night;
      valve.rotation.z = damp(valve.rotation.z, turn, dt);
      for (const { pivot, sign } of curtains) {
        pivot.scale.x = damp(
          pivot.scale.x,
          store.state.curtains ? 0.17 : 1,
          dt,
          2,
        );
        pivot.position.x = damp(
          pivot.position.x,
          sign * (store.state.curtains ? 2.62 : 1.35),
          dt,
          2,
        );
      }
    },
    reset() {
      turn = 0;
    },
  };
}
