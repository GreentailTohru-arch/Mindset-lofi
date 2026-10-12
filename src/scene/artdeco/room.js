import * as THREE from "three";
import { box, group, cylinder, tube } from "../primitives.js";
import { createParquetGeometry } from "../renaissance/parquet.js";
import { skyline } from "./materials.js";
import { damp } from "../../state.js";

export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "artdeco-room";
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
  box(root, [10, 0.03, 10], [0, -0.015, 0], m.dark);
  const floor = new THREE.Mesh(createParquetGeometry(), m.floor);
  floor.receiveShadow = true;
  floor.name = "artdeco-floor";
  root.add(floor);
  box(root, [10.16, 4, 0.18], [0, 2, -5], m.wall);
  const left = group(root);
  left.name = "artdeco-window-wall";
  for (const [size, pos] of [
    [
      [0.18, 4, 3.25],
      [-5, 2, -3.375],
    ],
    [
      [0.18, 4, 1.95],
      [-5, 2, 4.025],
    ],
    [
      [0.18, 0.18, 4.8],
      [-5, 0.09, 0.65],
    ],
    [
      [0.18, 0.4, 4.8],
      [-5, 3.8, 0.65],
    ],
  ])
    box(left, size, pos, m.wall);
  function border(p, x, y, w, h, z = 0.025) {
    for (const dx of [-w / 2, w / 2])
      box(p, [0.015, h, 0.018], [x + dx, y, z], m.gold);
    for (const dy of [-h / 2, h / 2])
      box(p, [w, 0.015, 0.018], [x, y + dy, z], m.gold);
  }
  // Paired stepped pilasters, narrow gold inlays and black plinths define the geometry.
  for (const rot of [0, Math.PI / 2]) {
    const wall = group(root, rot ? [-4.88, 0, 0] : [0, 0, -4.88]);
    wall.rotation.y = rot;
    for (const y of [0.11, 3.87]) {
      box(wall, [10, 0.16, 0.12], [0, y, 0], m.lacquer);
      box(wall, [10, 0.014, 0.014], [0, y + 0.06, 0.073], m.gold);
    }
    for (const x of rot
      ? [-4.78, -3.16, 1.83, 4.75]
      : [-4.78, -3.2, -2.35, 2.45, 3.12, 4.75]) {
      box(wall, [0.21, 3.63, 0.11], [x, 2, 0], m.lacquer);
      for (const dx of [-0.079, 0.079])
        box(wall, [0.013, 3.57, 0.013], [x + dx, 2, 0.066], m.gold);
      for (const y of [0.29, 3.68]) border(wall, x, y, 0.3, 0.24, 0.083);
    }
    if (!rot) {
      border(wall, 0.03, 2.25, 4.45, 2.86);
      for (const sign of [-1, 1])
        for (let i = 0; i < 3; i++) {
          const x = 0.03 + sign * (2.04 - i * 0.19);
          box(wall, [0.2, 0.2, 0.045], [x, 3.57 - i * 0.2, 0.03], m.lacquer);
          border(wall, x, 3.57 - i * 0.2, 0.2, 0.2, 0.062);
        }
    }
  }
  const win = group(root, [-4.86, 0.18, 0.65]);
  win.rotation.y = Math.PI / 2;
  win.name = "artdeco-window";
  const views = [skyline(), skyline(true)],
    view = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 3.42),
      new THREE.MeshBasicMaterial({ map: views[0], toneMapped: false }),
    );
  view.position.set(0, 1.71, -0.13);
  win.add(view);
  for (const x of [-2.4, -1.2, 0, 1.2, 2.4])
    box(win, [0.052, 3.44, 0.085], [x, 1.71, 0], m.lacquer);
  for (const y of [0, 0.86, 1.72, 2.58, 3.42])
    box(win, [4.87, 0.042, 0.085], [0, y, 0], m.lacquer);
  for (const x of [-1.8, -0.6, 0.6, 1.8]) {
    tube(
      win,
      [
        [x - 0.3, 3.02, 0.04],
        [x, 2.76, 0.04],
        [x + 0.3, 3.02, 0.04],
      ],
      0.009,
      m.gold,
    );
    tube(
      win,
      [
        [x, 2.76, 0.04],
        [x, 3.4, 0.04],
      ],
      0.009,
      m.gold,
    );
  }
  border(win, 0, 1.71, 4.96, 3.55, 0.05);
  const rod = cylinder(win, 0.024, 0.024, 5.3, [0, 3.64, 0.17], m.gold);
  rod.rotation.z = Math.PI / 2;
  const curtains = [];
  for (const sign of [-1, 1]) {
    const g = group(win, [sign * 2.16, 3.51, 0.16]);
    g.scale.x = 0.23;
    const geo = new THREE.PlaneGeometry(2.49, 3.5, 40, 28),
      p = geo.attributes.position;
    for (let i = 0; i < p.count; i++)
      p.setZ(
        i,
        0.074 * Math.sin(p.getX(i) * 34) + 0.015 * Math.sin(p.getY(i) * 6),
      );
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, m.curtain);
    mesh.position.y = -1.75;
    mesh.castShadow = true;
    g.add(mesh);
    curtains.push({ g, sign });
    register(g, "翡翠绿天鹅绒窗帘", "缓缓开合", () => {
      store.set("curtains", !store.state.curtains);
      return "丝绒帷幕轻轻开合。";
    });
  }
  register(view, "爵士时代黄昏窗景", "日夜切换", () => {
    store.set("day", !store.state.day);
    return "城市的光影慢慢变换。";
  });
  return {
    root,
    update(dt) {
      view.material.map = views[store.state.day ? 1 : 0];
      for (const { g, sign } of curtains) {
        g.scale.x = damp(g.scale.x, store.state.curtains ? 0.23 : 1, dt, 2);
        g.position.x = damp(
          g.position.x,
          sign * (store.state.curtains ? 2.16 : 1.23),
          dt,
          2,
        );
      }
    },
  };
}
