import * as THREE from "three";
import { box, group, cylinder } from "../primitives.js";
import { cityTexture, reflectionEnvironment } from "./materials.js";
import { damp } from "../../state.js";
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "brutalist-room";
  scene.environment = reflectionEnvironment();
  scene.environmentIntensity = 0.16;
  const s = new THREE.Shape();
  s.moveTo(-5.1, -5.1);
  s.lineTo(5.1, -5.1);
  s.lineTo(5.1, 5.1);
  s.lineTo(-5.1, 5.1);
  s.closePath();
  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(s, {
      depth: 0.25,
      bevelSize: 0.07,
      bevelThickness: 0.05,
      bevelSegments: 1,
    }),
    m.trim,
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.3;
  root.add(base);
  box(root, [10, 0.05, 10], [0, -0.012, 0], m.floor).name = "brutalist-floor";
  for (const z of [-2.75, 4.25])
    for (let x = -4.75; x < 5; x += 0.5)
      box(root, [0.493, 0.015, 0.32], [x, 0.024, z], m.stone);
  const left = group(root, [-5, 0, 0]);
  left.rotation.y = Math.PI / 2;
  left.name = "brutalist-window-wall";
  // Solid concrete surrounds a genuinely open, deep window reveal.
  box(left, [10.2, 0.75, 0.42], [0, 0.375, 0], m.wall);
  box(left, [10.2, 0.77, 0.52], [0, 3.865, 0], m.wall);
  box(left, [1.5, 2.73, 0.46], [-4.35, 2.115, 0], m.wall);
  box(left, [3, 2.73, 0.46], [3.6, 2.115, 0], m.wall);
  box(root, [10.2, 4.25, 0.36], [0, 2.125, -5], m.wall);
  box(root, [10.2, 0.44, 0.8], [0, 4.02, -4.72], m.wall);
  box(left, [10.2, 0.44, 0.8], [0, 4.02, 0.2], m.wall);
  for (const x of [-4.63, -0.62, 4.65])
    box(root, [0.64, 4.22, 0.88], [x, 2.11, -4.62], m.wall);
  for (const x of [-4.55, 2.42])
    box(left, [0.62, 4.2, 0.85], [x, 2.1, 0.23], m.wall);
  box(root, [10.2, 0.07, 0.45], [0, 4.3, -5], m.trim);
  box(left, [10.2, 0.07, 0.45], [0, 4.3, 0], m.trim);
  const win = group(left, [-0.75, 0, -0.08]);
  win.name = "brutalist-recessed-window";
  const day = cityTexture(),
    night = cityTexture(true),
    view = new THREE.Mesh(
      new THREE.PlaneGeometry(5.7, 2.72),
      new THREE.MeshBasicMaterial({ map: day, color: "#c5cbcc" }),
    );
  view.position.set(0, 2.11, -0.18);
  win.add(view);
  for (const x of [-2.86, -0.95, 0.95, 2.86])
    box(win, [0.065, 2.76, 0.12], [x, 2.11, 0], m.black);
  for (const y of [0.75, 3.48])
    box(win, [5.79, 0.07, 0.12], [0, y, 0], m.black);
  box(left, [6, 0.24, 0.92], [-0.75, 0.73, 0.35], m.wall);
  const curtains = [];
  for (const sign of [-1, 1]) {
    const g = group(win, [sign * 2.66, 0, 0.18]);
    for (let i = 0; i < 10; i++) {
      const x = (i - 4.5) * 0.07;
      const fold = cylinder(
        g,
        0.065,
        0.065,
        2.71,
        [x, 2.1, Math.cos(i * Math.PI) * 0.035],
        m.curtain,
        12,
      );
      fold.scale.z = 0.55;
    }
    curtains.push({ g, sign });
  }
  register(win, "深灰亚麻窗帘", "打开 / 合拢", () => {
    store.set("curtains", !store.state.curtains);
    return "冷灰天光，安静地流入。";
  });
  // Shallow formwork seams remain visible on all structural columns.
  for (const x of [-4.63, -0.62, 4.65])
    for (const y of [0.65, 1.9, 3.15])
      for (const dx of [-0.21, 0.21]) {
        const hole = cylinder(
          root,
          0.024,
          0.024,
          0.008,
          [x + dx, y, -4.172],
          m.dark,
          12,
        );
        hole.rotation.x = Math.PI / 2;
      }
  return {
    root,
    update(dt) {
      view.material.map = store.state.day ? day : night;
      for (const c of curtains) {
        c.g.position.x = damp(
          c.g.position.x,
          c.sign * (store.state.curtains ? 2.66 : 1.4),
          dt,
          3,
        );
        c.g.scale.x = damp(c.g.scale.x, store.state.curtains ? 1 : 4.1, dt, 3);
      }
    },
    reset() {
      for (const c of curtains) {
        c.g.position.x = c.sign * 2.66;
        c.g.scale.x = 1;
      }
    },
  };
}
