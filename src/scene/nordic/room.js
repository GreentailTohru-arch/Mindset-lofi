import * as THREE from "three";
import { box, group, cylinder } from "../primitives.js";
import { forestTexture } from "./materials.js";
import { damp } from "../../state.js";
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "nordic-room";
  box(root, [10.32, 0.28, 10.32], [0, -0.17, 0], m.trim);
  for (let row = 0; row < 25; row++) {
    const z = -4.8 + row * 0.4;
    let x = -5,
      index = 0;
    while (x < 4.999) {
      const width = Math.min(index === 0 ? 1.1 + (row % 3) * 0.66 : 2.5, 5 - x);
      box(
        root,
        [width - 0.012, 0.052, 0.391],
        [x + width / 2, 0.004, z],
        m.floor,
      );
      x += width;
      index++;
    }
  }
  // Two full cutaway walls and a short terminal return preserve the reference silhouette.
  box(root, [0.17, 3.8, 2.45], [-5, 1.9, -3.775], m.wall);
  box(root, [0.17, 3.8, 2.15], [-5, 1.9, 3.925], m.wall);
  box(root, [0.17, 0.93, 5.4], [-5, 0.465, 0.15], m.wall);
  box(root, [0.17, 0.43, 5.4], [-5, 3.585, 0.15], m.wall);
  box(root, [5.3, 3.8, 0.17], [-2.35, 1.9, -5], m.wall);
  box(root, [1.65, 3.8, 0.17], [4.175, 1.9, -5], m.wall);
  box(root, [3.05, 1.42, 0.17], [1.825, 0.71, -5], m.wall);
  box(root, [3.05, 0.48, 0.17], [1.825, 3.56, -5], m.wall);
  box(root, [0.17, 3.8, 0.22], [5, 1.9, -4.89], m.wall);
  box(root, [10.15, 0.065, 0.22], [0, 3.83, -5], m.trim);
  box(root, [0.22, 0.065, 10], [-5, 3.83, 0], m.trim);
  box(root, [9.94, 0.14, 0.045], [0.03, 0.1, -4.895], m.trim);
  box(root, [0.045, 0.14, 9.92], [-4.895, 0.1, 0.02], m.trim);
  const day = forestTexture(true),
    night = forestTexture(false),
    windows = [],
    shades = [];
  function window(pos, rotation, w, h, name) {
    const win = group(root, pos);
    win.rotation.y = rotation;
    const material = new THREE.MeshBasicMaterial({
      map: day,
      color: "#eceeeb",
      toneMapped: false,
    });
    const view = new THREE.Mesh(
      new THREE.PlaneGeometry(w - 0.03, h - 0.03),
      material,
    );
    view.position.z = -0.17;
    view.name = name;
    win.add(view);
    windows.push(material);
    for (const x of [-w / 2, w / 2])
      box(win, [0.085, h + 0.13, 0.12], [x, 0, 0], m.wood);
    for (const y of [-h / 2, h / 2])
      box(win, [w + 0.085, 0.075, 0.12], [0, y, 0], m.wood);
    for (const x of w > 4 ? [-w / 6, w / 6] : [0])
      box(win, [0.056, h, 0.095], [x, 0, 0.006], m.wood);
    box(win, [w + 0.23, 0.075, 0.35], [0, -h / 2 - 0.015, 0.09], m.wood);
    register(
      view,
      name === "winter-cedar-view" ? "雪松林窗景" : "右侧冬日窗景",
      "冬日 / 夜晚",
      () => {
        store.set("day", !store.state.day);
        return store.state.day
          ? "冬日散光，落满窗台。"
          : "雪林入夜，灯火更暖。";
      },
    );
    const shade = group(win, [0, h / 2 - 0.04, 0.08]);
    shade.name =
      name === "winter-cedar-view"
        ? "nordic-window-shade"
        : "nordic-right-shade";
    box(shade, [w - 0.1, h - 0.05, 0.018], [0, -(h - 0.05) / 2, 0], m.wool);
    const hem = cylinder(
      shade,
      0.017,
      0.017,
      w - 0.07,
      [0, -h + 0.05, 0.024],
      m.darkWood,
    );
    hem.rotation.z = Math.PI / 2;
    shades.push(shade);
    register(shade, "亚麻卷帘", "升起 / 放下", () => {
      store.set("curtains", !store.state.curtains);
      return store.state.curtains
        ? "卷帘升起，林间光影入室。"
        : "亚麻帘遮住了冬日的凉意。";
    });
  }
  window([-4.87, 2.15, 0.15], Math.PI / 2, 5.4, 2.44, "winter-cedar-view");
  window([1.825, 2.37, -4.87], 0, 3.05, 1.9, "right-winter-view");
  return {
    root,
    update(dt) {
      windows.forEach((m) => (m.map = store.state.day ? day : night));
      shades.forEach(
        (s) =>
          (s.scale.y = damp(
            s.scale.y,
            store.state.curtains ? 0.025 : 1,
            dt,
            1.8,
          )),
      );
    },
  };
}
