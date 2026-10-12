import * as THREE from "three";
import { box, cylinder, group, torus } from "../primitives.js";
import { createParquetGeometry } from "../renaissance/parquet.js";
import { countryTexture } from "./materials.js";
import { damp } from "../../state.js";

export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "美式田园 · 乡村之家";
  const shape = new THREE.Shape();
  shape.moveTo(-5.1, -5.1);
  shape.lineTo(5.1, -5.1);
  shape.lineTo(5.1, 5.1);
  shape.lineTo(-5.1, 5.1);
  shape.closePath();
  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
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
  box(root, [10, 0.045, 10], [0, -0.006, 0], m.woodDark);
  const floor = new THREE.Mesh(createParquetGeometry(), m.floor);
  floor.receiveShadow = true;
  root.add(floor);
  box(root, [10.16, 4, 0.16], [0, 1.98, -5], m.wall);
  // Full-height French window: the wall geometry leaves a real opening.
  box(root, [0.16, 4, 1.2], [-5, 1.98, -4.4], m.wall);
  box(root, [0.16, 4, 3.4], [-5, 1.98, 3.3], m.wall);
  box(root, [0.16, 0.22, 5.4], [-5, 0.09, -1.1], m.wall);
  box(root, [0.16, 0.52, 5.4], [-5, 3.72, -1.1], m.wall);
  for (const [y, h, d] of [
    [0.13, 0.23, 0.09],
    [3.85, 0.075, 0.12],
    [3.97, 0.11, 0.23],
  ]) {
    box(root, [10.17, h, d], [0, y, -4.92], m.wood, 0.009);
    box(root, [d, h, 9.92], [-4.92, y, 0.08], m.wood, 0.009);
  }
  // Solid lower wainscoting and narrow stiles, with no panel across the window.
  box(root, [10, 0.99, 0.085], [0, 0.515, -4.873], m.panel);
  for (const [z, d] of [
    [-4.4, 1.05],
    [3.3, 3.2],
  ])
    box(root, [0.085, 0.99, d], [-4.873, 0.515, z], m.panel);
  box(root, [0.085, 0.17, 5.4], [-4.873, 0.085, -1.1], m.panel);
  box(root, [10, 0.06, 0.12], [0, 1.04, -4.85], m.woodDark);
  for (const [z, d] of [
    [-4.4, 1.05],
    [3.3, 3.2],
  ])
    box(root, [0.12, 0.06, d], [-4.85, 1.04, z], m.woodDark);
  for (let x = -4.7; x < 5; x += 0.43)
    box(root, [0.03, 0.9, 0.025], [x, 0.51, -4.817], m.woodDark);
  for (let z = 1.73; z < 4.95; z += 0.43)
    box(root, [0.025, 0.9, 0.03], [-4.817, 0.51, z], m.woodDark);
  for (const z of [-4.91, 4.92])
    box(root, [0.1, 3.9, 0.1], [-4.9, 1.95, z], m.woodDark);
  box(root, [10.1, 0.1, 0.11], [0, 3.94, -4.91], m.woodDark);
  box(root, [0.11, 0.1, 10], [-4.91, 3.94, 0], m.woodDark);
  const win = group(root, [-4.87, 1.83, -1.1]);
  win.rotation.y = Math.PI / 2;
  const night = countryTexture(false),
    day = countryTexture(true);
  const view = new THREE.MeshBasicMaterial({
    map: night,
    color: "#b6cadf",
    toneMapped: false,
  });
  box(win, [5.38, 3.24, 0.018], [0, 0, -0.075], view).castShadow = false;
  for (const x of [-2.7, 2.7]) box(win, [0.11, 3.36, 0.18], [x, 0, 0], m.wood);
  for (const y of [-1.63, 1.63]) box(win, [5.48, 0.1, 0.2], [0, y, 0], m.wood);
  const doors = [];
  for (const sign of [-1, 1]) {
    const door = group(win, [sign * 2.66, 0, 0.03]);
    doors.push({ door, sign });
    const center = -sign * 1.32;
    for (const x of [0, -sign * 2.64])
      box(door, [0.075, 3.17, 0.075], [x, 0, 0], m.wood);
    for (const y of [-1.55, -0.65, 0.38, 1.55])
      box(door, [2.64, 0.045, 0.07], [center, y, 0], m.wood);
    box(door, [0.045, 3.1, 0.07], [center, 0, 0], m.wood);
    box(door, [0.028, 0.18, 0.05], [-sign * 2.51, -0.16, 0.07], m.brass, 0.01);
  }
  const rod = cylinder(win, 0.027, 0.027, 5.9, [0, 1.86, 0.21], m.metal);
  rod.rotation.z = Math.PI / 2;
  const curtains = [-1, 1].map((sign) => {
    const g = group(win, [sign * 2.72, 1.66, 0.22]);
    const geo = new THREE.PlaneGeometry(2.74, 3.24, 40, 25),
      a = geo.attributes.position;
    for (let i = 0; i < a.count; i++)
      a.setXYZ(
        i,
        (a.getX(i) + 1.37) * -sign,
        a.getY(i) - 1.62,
        Math.sin(a.getX(i) * 30) * 0.045,
      );
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, m.sheer);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    g.add(mesh);
    register(g, "薄纱窗帘", "拉开 / 合拢", () => {
      store.set("curtains", !store.state.curtains);
      return store.state.curtains
        ? "薄纱轻拢 · 田野夕阳入窗"
        : "合上薄纱 · 留一室温柔";
    });
    return g;
  });
  register(win, "乡村多格窗", "打开 / 关闭窗扇", () => {
    store.set("window", !store.state.window);
    return store.state.window ? "木窗微开 · 晚风轻拂" : "窗扇合拢 · 安静如初";
  });
  return {
    root,
    update(dt) {
      curtains.forEach(
        (g) =>
          (g.scale.x = damp(g.scale.x, store.state.curtains ? 0.15 : 1, dt, 2)),
      );
      doors.forEach(
        ({ door, sign }) =>
          (door.rotation.y = damp(
            door.rotation.y,
            store.state.window ? sign * 0.12 : 0,
            dt,
            2,
          )),
      );
      view.map = store.state.day ? day : night;
      view.color.set(store.state.day ? "#eeeeeb" : "#b6cadf");
    },
  };
}
