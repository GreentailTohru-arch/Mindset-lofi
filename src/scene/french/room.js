import * as THREE from "three";
import { box, cylinder, group, tube } from "../primitives.js";
import { createParquetGeometry } from "../renaissance/parquet.js";
import { afternoonTexture } from "./materials.js";
import { flourish } from "../baroque/details.js";
import { damp } from "../../state.js";
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "french-room";
  const s = new THREE.Shape();
  s.moveTo(-5.1, -5.1);
  s.lineTo(5.1, -5.1);
  s.lineTo(5.1, 5.1);
  s.lineTo(-5.1, 5.1);
  s.closePath();
  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(s, {
      depth: 0.22,
      bevelThickness: 0.055,
      bevelSize: 0.07,
      bevelSegments: 1,
    }),
    m.trim,
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.28;
  root.add(base);
  box(
    root,
    [10, 0.04, 10],
    [0, -0.01, 0],
    new THREE.MeshStandardMaterial({ color: "#9b7c57", roughness: 0.9 }),
  );
  const floor = new THREE.Mesh(createParquetGeometry(), m.floor);
  floor.name = "french-floor";
  floor.receiveShadow = true;
  root.add(floor);
  box(root, [10.16, 4, 0.18], [0, 2, -5], m.wall);
  const wall = group(root);
  wall.name = "french-window-wall";
  box(wall, [0.18, 4, 3.1], [-5, 2, -3.45], m.wall);
  box(wall, [0.18, 4, 2.7], [-5, 2, 3.65], m.wall);
  box(wall, [0.18, 0.18, 4.2], [-5, 0.09, 0.2], m.wall);
  box(wall, [0.18, 0.48, 4.2], [-5, 3.76, 0.2], m.wall);
  for (const rot of [0, Math.PI / 2]) {
    const p = group(root, rot ? [-4.88, 0, 0] : [0, 0, -4.88]);
    p.rotation.y = rot;
    for (const [y, h, d] of [
      [0.13, 0.22, 0.13],
      [1.03, 0.045, 0.08],
      [3.83, 0.065, 0.15],
      [3.98, 0.13, 0.24],
    ])
      box(p, [10.12, h, d], [0, y, 0], m.moulding, 0.008);
    for (const x of [-4.25, -2.55, -0.85, 0.85, 2.55, 4.25]) {
      if (rot && x > -2.4 && x < 2) continue;
      for (const xx of [x - 0.73, x + 0.73])
        box(p, [0.023, 2.56, 0.025], [xx, 2.42, 0.04], m.moulding, 0.005);
      for (const y of [1.14, 3.7])
        box(p, [1.46, 0.023, 0.025], [x, y, 0.04], m.moulding, 0.005);
      for (const xx of [x - 0.61, x + 0.61])
        flourish(p, [xx, 3.59, 0.06], 0.15, { gold: m.moulding });
      for (const xx of [x - 0.72, x + 0.72])
        box(p, [0.025, 0.7, 0.025], [xx, 0.55, 0.04], m.moulding);
      for (const y of [0.2, 0.9])
        box(p, [1.44, 0.025, 0.025], [x, y, 0.04], m.moulding);
    }
  }
  const win = group(root, [-4.86, 0.18, 0.2]);
  win.rotation.y = Math.PI / 2;
  win.name = "french-window";
  const maps = [afternoonTexture(), afternoonTexture(true)],
    mat = new THREE.MeshBasicMaterial({ map: maps[0], toneMapped: false });
  const view = new THREE.Mesh(new THREE.PlaneGeometry(4.18, 3.34), mat);
  view.position.set(0, 1.67, -0.16);
  win.add(view);
  for (const x of [-2.1, -1.05, 0, 1.05, 2.1])
    box(win, [0.045, 3.36, 0.075], [x, 1.68, 0], m.moulding);
  for (const y of [0, 0.83, 1.67, 2.51, 3.34])
    box(win, [4.24, 0.045, 0.075], [0, y, 0], m.moulding);
  const rod = cylinder(win, 0.024, 0.024, 4.7, [0, 3.51, 0.16], m.gold);
  rod.rotation.z = Math.PI / 2;
  const curtains = [];
  for (const sign of [-1, 1]) {
    const g = group(win, [sign * 2.17, 0, 0.2]);
    for (let i = 0; i < 16; i++) {
      const x = -sign * i * 0.095;
      const cloth = box(
        g,
        [0.108, 3.35, 0.03],
        [x, 1.68, Math.sin(i * 1.5) * 0.042],
        m.curtain,
        0.012,
      );
      cloth.castShadow = false;
    }
    curtains.push(g);
    register(g, "米白亚麻纱帘", "轻轻开合", () => {
      store.set("curtains", !store.state.curtains);
      return "微光穿过纱帘。";
    });
  }
  return {
    root,
    update(dt) {
      mat.map = maps[store.state.day ? 0 : 1];
      for (const g of curtains)
        g.scale.x = damp(g.scale.x, store.state.curtains ? 0.26 : 1, dt, 2);
    },
  };
}
