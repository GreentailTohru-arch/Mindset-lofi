import * as THREE from "three";
import { box, cylinder, group, torus } from "../primitives.js";
import { createParquetGeometry } from "./parquet.js";
import { cityTexture } from "./materials.js";
import { damp } from "../../state.js";

export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "文艺复兴 · 老公寓";
  box(root, [10.35, 0.3, 10.35], [0, -0.17, 0], m.trim, 0.03);
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
    box(root, [10.17, h, d], [0, y, -4.92], m.trim, 0.009);
    box(root, [d, h, 9.92], [-4.92, y, 0.08], m.trim, 0.009);
  }
  // Raised wall mouldings, understated and flush against the plaster.
  for (const x of [-2.95, -0.9, 1.2, 3.4])
    for (const yy of [0.32, 1.08])
      box(root, [1.85, 0.025, 0.025], [x, yy, -4.902], m.trim);
  const win = group(root, [-4.87, 1.83, -1.1]);
  win.rotation.y = Math.PI / 2;
  const night = cityTexture(),
    day = cityTexture(true);
  const view = new THREE.MeshBasicMaterial({
    map: night,
    color: "#b6cadf",
    toneMapped: false,
  });
  box(win, [5.38, 3.24, 0.018], [0, 0, -0.075], view).castShadow = false;
  for (const x of [-2.7, 2.7]) box(win, [0.11, 3.36, 0.18], [x, 0, 0], m.cream);
  for (const y of [-1.63, 1.63]) box(win, [5.48, 0.1, 0.2], [0, y, 0], m.cream);
  const doors = [];
  for (const sign of [-1, 1]) {
    const door = group(win, [sign * 2.66, 0, 0.03]);
    doors.push({ door, sign });
    const center = -sign * 1.32;
    for (const x of [0, -sign * 2.64])
      box(door, [0.075, 3.17, 0.075], [x, 0, 0], m.cream);
    for (const y of [-1.55, -0.65, 0.38, 1.55])
      box(door, [2.64, 0.045, 0.07], [center, y, 0], m.cream);
    box(door, [0.045, 3.1, 0.07], [center, 0, 0], m.cream);
    box(door, [0.028, 0.18, 0.05], [-sign * 2.51, -0.16, 0.07], m.brass, 0.01);
  }
  // Balcony ironwork gives depth behind the glazing.
  for (let i = 0; i < 19; i++)
    box(win, [0.022, 0.72, 0.025], [-2.5 + i * 0.278, -1.25, -0.035], m.metal);
  for (const y of [-1.58, -0.9])
    box(win, [5.12, 0.035, 0.045], [0, y, -0.035], m.metal);
  for (const x of [-1.7, -0.85, 0, 0.85, 1.7])
    torus(win, 0.15, 0.009, [x, -1.13, -0.018], m.metal, [0, 0, 0]);
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
        ? "薄纱轻拢 · 城市夜色入窗"
        : "合上薄纱 · 留一室温柔";
    });
    return g;
  });
  register(win, "法式落地窗", "打开 / 关闭窗扇", () => {
    store.set("window", !store.state.window);
    return store.state.window ? "法式窗微开 · 晚风轻拂" : "窗扇合拢 · 安静如初";
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
