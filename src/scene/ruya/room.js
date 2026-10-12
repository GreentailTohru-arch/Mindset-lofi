import * as THREE from "three";
import { box, cylinder, group } from "../primitives.js";
import { damp } from "../../state.js";
import { paperTexture } from "./materials.js";

export function createRoom(scene, m, store, register) {
  const room = group(scene);
  room.name = "儒风雅韵 · 建筑";
  box(room, [10.35, 0.3, 10.35], [0, -0.19, 0], m.trim, 0.03);
  const boards = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.66, 0.055, 0.32),
    m.floor,
    192,
  );
  const dummy = new THREE.Object3D();
  for (let row = 0, i = 0; row < 32; row++)
    for (let col = 0; col < 6; col++, i++) {
      dummy.position.set(-4.17 + col * 1.668, -0.008, -4.96 + row * 0.32);
      dummy.updateMatrix();
      boards.setMatrixAt(i, dummy.matrix);
      boards.setColorAt(
        i,
        new THREE.Color().setScalar(0.78 + ((row * 7 + col * 3) % 11) * 0.018),
      );
    }
  boards.receiveShadow = true;
  room.add(boards);
  box(room, [10.16, 4, 0.16], [0, 1.98, -5], m.wall);
  // A true opening: no coplanar panels or colored wall patches.
  box(room, [0.16, 4, 1.2], [-5, 1.98, -4.4], m.wall);
  box(room, [0.16, 4, 3.8], [-5, 1.98, 3.1], m.wall);
  box(room, [0.16, 1.25, 5], [-5, 0.605, -1.3], m.wall);
  box(room, [0.16, 0.8, 5], [-5, 3.58, -1.3], m.wall);
  box(room, [10.16, 0.16, 0.23], [0, 3.96, -4.98], m.woodDark);
  box(room, [0.23, 0.16, 9.93], [-4.98, 3.96, 0.095], m.woodDark);
  box(room, [10, 0.22, 0.08], [0, 0.11, -4.88], m.woodDark);
  box(room, [0.08, 0.22, 9.8], [-4.88, 0.11, 0], m.woodDark);
  const win = group(room, [-4.9, 2.2, -1.3]);
  win.rotation.y = Math.PI / 2;
  const night = paperTexture("window"),
    day = paperTexture("window", true);
  const scenery = new THREE.MeshBasicMaterial({
    map: night,
    color: "#b6c3d4",
    toneMapped: false,
  });
  box(win, [4.96, 1.96, 0.02], [0, 0, -0.075], scenery).castShadow = false;
  for (const x of [-2.5, 2.5])
    box(win, [0.12, 2.1, 0.16], [x, 0, 0], m.woodDark);
  for (const y of [-1, 1]) box(win, [5.1, 0.12, 0.18], [0, y, 0], m.woodDark);
  for (let i = 0; i < 4; i++) {
    const leaf = group(win, [-2.5 + i * 1.25, 0, 0.04]);
    box(leaf, [0.065, 1.94, 0.07], [0, 0, 0], m.wood);
    for (const y of [-0.57, 0.57])
      box(leaf, [1.25, 0.045, 0.06], [0.625, y, 0], m.wood);
    for (const x of [0.31, 0.62, 0.94])
      box(leaf, [0.033, 1.94, 0.06], [x, 0, 0], m.wood);
    for (const y of [-0.77, 0.77])
      box(leaf, [1.25, 0.035, 0.06], [0.625, y, 0], m.wood);
  }
  box(win, [5.2, 0.11, 0.42], [0, -1.05, 0.12], m.wood, 0.02);
  const shade = group(win, [0, 1, 0.17]);
  for (let i = 0; i < 30; i++)
    box(shade, [4.94, 0.054, 0.025], [0, -i * 0.061, 0], m.curtain);
  const roll = cylinder(win, 0.09, 0.09, 5.05, [0, 1.08, 0.17], m.curtain);
  roll.rotation.z = Math.PI / 2;
  register(shade, "竹帘", "卷起 / 放下竹帘", () => {
    store.set("curtains", !store.state.curtains);
    return store.state.curtains
      ? "竹帘卷起 · 月色入窗"
      : "竹帘垂下 · 留一室清静";
  });
  register(win, "木格窗", "欣赏日景 / 月景", () => {
    store.set("day", !store.state.day);
    return store.state.day ? "竹影映日 · 远山如黛" : "月满西窗 · 竹影轻摇";
  });
  const scroll = group(room, [-1.5, 2.48, -4.85]);
  box(scroll, [1.53, 2.28, 0.045], [0, 0, 0], m.woodLight);
  const art = new THREE.MeshStandardMaterial({
    map: paperTexture(),
    roughness: 0.95,
  });
  box(scroll, [1.25, 1.76, 0.012], [0, 0.04, 0.03], art);
  for (const y of [-1.16, 1.16]) {
    const rod = cylinder(scroll, 0.045, 0.045, 1.75, [0, y, 0.02], m.woodDark);
    rod.rotation.z = Math.PI / 2;
  }
  register(scroll, "山水挂轴", "赏画", () => "山静日长 · 心随流水远");
  return {
    root: room,
    update(dt, t) {
      shade.scale.y = damp(
        shade.scale.y,
        store.state.curtains ? 0.055 : 1,
        dt,
        2,
      );
      scenery.map = store.state.day ? day : night;
      scenery.color.setScalar(
        store.state.day ? 0.95 : 0.8 + Math.sin(t * 0.12) * 0.015,
      );
    },
  };
}
