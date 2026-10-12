import * as THREE from "three";
import { box, group, cylinder } from "../primitives.js";
import { afternoonTexture } from "./materials.js";
import { damp } from "../../state.js";

export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "midcentury-room";
  const square = new THREE.Shape();
  square.moveTo(-5.1, -5.1);
  square.lineTo(5.1, -5.1);
  square.lineTo(5.1, 5.1);
  square.lineTo(-5.1, 5.1);
  square.closePath();
  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(square, {
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
  base.name = "midcentury-base";
  box(root, [10, 0.05, 10], [0, -0.012, 0], m.floor).name = "midcentury-floor";
  box(root, [10.14, 3.8, 0.18], [0, 1.9, -5], m.wall).name =
    "midcentury-back-wall";
  const left = group(root);
  left.name = "midcentury-window-wall";
  box(left, [0.18, 3.8, 0.8], [-5, 1.9, -4.6], m.wall);
  box(left, [0.18, 3.8, 3], [-5, 1.9, 3.5], m.wall);
  box(left, [0.18, 0.9, 6.2], [-5, 0.45, -1.1], m.wall);
  box(left, [0.18, 0.45, 6.2], [-5, 3.575, -1.1], m.wall);
  for (const y of [0.065, 3.82]) {
    box(root, [10.18, 0.07, 0.22], [0, y, -4.98], m.trim);
    box(root, [0.22, 0.07, 10.15], [-4.98, y, 0], m.trim);
  }
  const win = group(root, [-4.87, 2.125, -1.1]);
  win.rotation.y = Math.PI / 2;
  win.name = "midcentury-window";
  const day = afternoonTexture(),
    night = afternoonTexture(true);
  const view = new THREE.Mesh(
    new THREE.PlaneGeometry(6.17, 2.43),
    new THREE.MeshBasicMaterial({ map: day, toneMapped: false }),
  );
  view.position.z = -0.16;
  win.add(view);
  for (const x of [-3.1, 0, 3.1])
    box(win, [0.065, 2.49, 0.11], [x, 0, 0], m.wood);
  for (const y of [-1.225, 1.225])
    box(win, [6.26, 0.075, 0.14], [0, y, 0], m.wood);
  box(win, [6.45, 0.08, 0.43], [0, -1.26, 0.04], m.paper, 0.009);
  const blind = group(win, [0, 1.23, 0.08]);
  blind.name = "midcentury-blinds";
  box(blind, [6.34, 0.12, 0.2], [0, 0.02, 0], m.dark, 0.008);
  const slats = [];
  for (let i = 0; i < 25; i++) {
    const slat = box(
      blind,
      [6.12, 0.018, 0.065],
      [0, -0.13 - i * 0.091, 0],
      m.wood,
      0.008,
    );
    slat.rotation.x = -0.08;
    slats.push(slat);
  }
  for (const x of [-2.58, -0.14, 0.14, 2.58])
    cylinder(blind, 0.007, 0.007, 2.36, [x, -1.17, 0.075], m.taupe, 6);
  register(blind, "胡桃木百叶窗", "转动叶片", () => {
    store.set("curtains", !store.state.curtains);
    return store.state.curtains
      ? "百叶轻转，午后阳光洒进来。"
      : "合拢百叶，让午后安静下来。";
  });
  return {
    root,
    update(dt) {
      view.material.map = store.state.day ? day : night;
      for (const slat of slats)
        slat.rotation.x = damp(
          slat.rotation.x,
          store.state.curtains ? -0.08 : -1.24,
          dt,
          3,
        );
    },
  };
}
