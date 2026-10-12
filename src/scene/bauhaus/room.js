import * as THREE from "three";
import { box, cylinder, group } from "../primitives.js";
import { courtyardTexture } from "./materials.js";
import { damp } from "../../state.js";

export function geometricArt(parent, pos, w, h, m, variant = 0) {
  const g = group(parent, pos);
  box(g, [w + 0.07, h + 0.07, 0.06], [0, 0, 0], m.charcoal);
  box(g, [w, h, 0.012], [0, 0, 0.039], m.paper);
  if (!variant) {
    box(g, [w * 0.27, h * 0.72, 0.012], [-w * 0.14, 0, 0.049], m.blue);
    box(g, [w * 0.43, h * 0.21, 0.013], [-w * 0.15, h * 0.3, 0.054], m.red);
    box(
      g,
      [w * 0.16, h * 0.43, 0.014],
      [w * 0.2, -h * 0.15, 0.054],
      m.charcoal,
    );
    const circle = cylinder(
      g,
      w * 0.145,
      w * 0.145,
      0.014,
      [w * 0.23, h * 0.22, 0.057],
      m.yellow,
      48,
    );
    circle.rotation.x = Math.PI / 2;
  } else {
    const circle = cylinder(
      g,
      w * 0.29,
      w * 0.29,
      0.014,
      [-w * 0.07, h * 0.13, 0.055],
      m.red,
      48,
    );
    circle.rotation.x = Math.PI / 2;
    box(
      g,
      [w * 0.68, h * 0.17, 0.016],
      [w * 0.05, -h * 0.22, 0.064],
      m.charcoal,
    );
    box(
      g,
      [w * 0.12, h * 0.38, 0.018],
      [-w * 0.19, -h * 0.15, 0.069],
      m.yellow,
    );
  }
  return g;
}
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "包豪斯 · 建筑";
  box(root, [10.35, 0.3, 10.35], [0, -0.18, 0], m.trim, 0.02);
  const boards = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1.666, 0.05, 0.31),
      m.floor,
      192,
    ),
    dummy = new THREE.Object3D();
  for (let row = 0, i = 0; row < 32; row++)
    for (let col = 0; col < 6; col++, i++) {
      dummy.position.set(
        -4.1667 + col * 1.6667,
        -0.002,
        -4.84375 + row * 0.3125,
      );
      dummy.updateMatrix();
      boards.setMatrixAt(i, dummy.matrix);
      boards.setColorAt(
        i,
        new THREE.Color().setScalar(0.91 + ((row * 7 + col * 3) % 9) * 0.01),
      );
    }
  boards.receiveShadow = true;
  root.add(boards);
  box(root, [10.15, 4, 0.17], [0, 1.98, -5], m.wall);
  // Large opening in the left wall; structural pieces never cover the view.
  box(root, [0.17, 4, 1.7], [-5, 1.98, -4.15], m.wall);
  box(root, [0.17, 4, 1.5], [-5, 1.98, 4.25], m.wall);
  box(root, [0.17, 1.03, 6.8], [-5, 0.495, 0.1], m.wall);
  box(root, [0.17, 0.6, 6.8], [-5, 3.68, 0.1], m.wall);
  box(root, [10.17, 0.09, 0.2], [0, 4, -5], m.trim);
  box(root, [0.2, 0.09, 10], [-5, 4, 0], m.trim);
  box(root, [10, 0.12, 0.06], [0, 0.065, -4.89], m.trim);
  box(root, [0.06, 0.12, 10], [-4.89, 0.065, 0], m.trim);
  const win = group(root, [-4.88, 2.2, 0.1]);
  win.rotation.y = Math.PI / 2;
  const day = courtyardTexture(true),
    night = courtyardTexture(false),
    sceneryMat = new THREE.MeshBasicMaterial({
      map: day,
      toneMapped: false,
      color: "#e8e2d5",
    });
  const view = new THREE.Mesh(new THREE.PlaneGeometry(6.78, 2.36), sceneryMat);
  view.position.z = -0.16;
  win.add(view);
  for (const x of [-3.4, 3.4])
    box(win, [0.075, 2.44, 0.12], [x, 0, 0], m.charcoal);
  for (const y of [-1.2, 1.2])
    box(win, [6.86, 0.075, 0.12], [0, y, 0], m.charcoal);
  for (const x of [-1.7, 0, 1.7])
    box(win, [0.055, 2.36, 0.075], [x, 0, 0.01], m.charcoal);
  box(win, [6.74, 0.045, 0.06], [0, 0.55, 0.025], m.charcoal);
  box(win, [7, 0.085, 0.43], [0, -1.25, 0.03], m.paper);
  const casement = group(win, [-3.38, -0.32, 0.04]);
  for (const x of [0, 1.66])
    box(casement, [0.04, 1.68, 0.04], [x, 0, 0], m.charcoal);
  for (const y of [-0.84, 0.84])
    box(casement, [1.7, 0.04, 0.04], [0.83, y, 0], m.charcoal);
  box(casement, [0.045, 0.16, 0.09], [1.56, -0.13, 0.055], m.steel, 0.008);
  register(casement, "黑钢框窗扇", "打开 / 关闭", () => {
    store.set("window", !store.state.window);
    return store.state.window ? "窗扇轻启 · 微风入室" : "窗扇合拢 · 安静如常";
  });
  register(view, "窗外街景", "日景 / 夜景", () => {
    store.set("day", !store.state.day);
    return store.state.day ? "日光漫进房间" : "灯火渐起 · 夜色温柔";
  });
  const blind = group(win, [0, 1.15, 0.16]);
  box(blind, [6.72, 2.32, 0.018], [0, -1.16, 0], m.fabric);
  box(blind, [6.76, 0.042, 0.038], [0, -2.32, 0], m.charcoal);
  const roll = cylinder(win, 0.055, 0.055, 6.88, [0, 1.26, 0.13], m.paper);
  roll.rotation.z = Math.PI / 2;
  register(blind, "亚麻遮光帘", "卷起 / 放下", () => {
    store.set("curtains", !store.state.curtains);
    return store.state.curtains
      ? "遮光帘卷起 · 拥抱日光"
      : "遮光帘放下 · 柔和漫射";
  });
  const art = geometricArt(root, [2.25, 2.55, -4.85], 2.14, 1.83, m);
  register(art, "几何艺术画", "欣赏色彩", () => "圆与方 · 平衡的一瞬");
  const small = geometricArt(root, [-4.87, 2.55, -4.15], 0.83, 1.55, m, 1);
  small.rotation.y = Math.PI / 2;
  return {
    root,
    update(dt) {
      sceneryMat.map = store.state.day ? day : night;
      sceneryMat.color.set(store.state.day ? "#e8e2d5" : "#a5b5ca");
      blind.scale.y = damp(
        blind.scale.y,
        store.state.curtains ? 0.045 : 1,
        dt,
        2,
      );
      casement.rotation.y = damp(
        casement.rotation.y,
        store.state.window ? -0.48 : 0,
        dt,
        3,
      );
    },
  };
}
