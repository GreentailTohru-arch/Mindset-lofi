import * as THREE from "three";
import { box, group } from "../primitives.js";
import { cityTexture } from "./materials.js";
import { damp } from "../../state.js";
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "italian-room";
  const shape = new THREE.Shape();
  shape.moveTo(-5.1, -5.1);
  shape.lineTo(5.1, -5.1);
  shape.lineTo(5.1, 5.1);
  shape.lineTo(-5.1, 5.1);
  shape.closePath();
  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.22,
      bevelSize: 0.075,
      bevelThickness: 0.055,
      bevelSegments: 1,
    }),
    m.trim,
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.28;
  base.name = "italian-base";
  root.add(base);
  box(root, [10, 0.05, 10], [0, -0.012, 0], m.floor).name = "italian-floor";
  box(root, [10.14, 3.8, 0.18], [0, 1.9, -5.01], m.wall);
  // Four separate wall sections leave the glazing clear from every allowed orbit.
  box(root, [0.18, 3.8, 0.87], [-5.01, 1.9, -4.635], m.wall);
  box(root, [0.18, 3.8, 2.1], [-5.01, 1.9, 4.0], m.wall);
  box(root, [0.18, 0.13, 7.1], [-5.01, 0.065, -0.65], m.wall);
  box(root, [0.18, 0.32, 7.1], [-5.01, 3.64, -0.65], m.wall);
  for (const y of [0.065, 3.79]) {
    box(root, [10.16, 0.055, 0.21], [0, y, -5], m.trim);
    box(root, [0.21, 0.055, 10.16], [-5, y, 0], m.trim);
  }
  const strip = m.glow.clone();
  for (const [size, pos] of [
    [
      [9.98, 0.019, 0.018],
      [0, 3.712, -4.886],
    ],
    [
      [0.018, 0.019, 9.98],
      [-4.886, 3.712, 0],
    ],
    [
      [0.017, 3.64, 0.016],
      [-4.885, 1.87, 4.91],
    ],
    [
      [0.016, 3.64, 0.017],
      [4.92, 1.87, -4.886],
    ],
  ]) {
    const mesh = box(root, size, pos, strip);
    mesh.castShadow = false;
  }
  const win = group(root, [-4.897, 1.8, -0.65]);
  win.name = "italian-floor-window";
  win.rotation.y = Math.PI / 2;
  const night = cityTexture(),
    day = cityTexture(true),
    view = new THREE.Mesh(
      new THREE.PlaneGeometry(7.08, 3.34),
      new THREE.MeshBasicMaterial({ map: night, toneMapped: false }),
    );
  view.position.z = -0.045;
  win.add(view);
  for (const x of [-3.55, -1.18, 1.18, 3.55])
    box(win, [0.028, 3.38, 0.064], [x, 0, 0.006], m.black);
  for (const y of [-1.68, 1.68])
    box(win, [7.14, 0.026, 0.064], [0, y, 0.006], m.black);
  const curtains = [];
  for (const sign of [-1, 1]) {
    const pivot = group(win, [sign * 2.9, 1.69, 0.12]);
    const geo = new THREE.PlaneGeometry(3.58, 3.46, 40, 30),
      p = geo.attributes.position;
    for (let i = 0; i < p.count; i++)
      p.setZ(
        i,
        0.047 * Math.sin(p.getX(i) * 42) + 0.014 * Math.sin(p.getY(i) * 9),
      );
    geo.computeVertexNormals();
    const cloth = new THREE.Mesh(geo, m.curtain);
    cloth.position.y = -1.73;
    pivot.add(cloth);
    pivot.scale.x = 0.26;
    curtains.push({ pivot, sign });
    register(pivot, "落地米白纱帘", "缓缓开合", () => {
      store.set("curtains", !store.state.curtains);
      return store.state.curtains
        ? "夜色回到窗前。"
        : "纱帘合上，光线安静下来。";
    });
  }
  register(view, "山城夜景", "日夜切换", () => {
    store.set("day", !store.state.day);
    return store.state.day ? "山城迎来柔和晨光。" : "远山与万家灯火。";
  });
  return {
    root,
    update(dt) {
      view.material.map = store.state.day ? day : night;
      strip.emissiveIntensity = damp(
        strip.emissiveIntensity,
        store.state.whiteOn ? 0.35 + store.state.whiteBrightness * 0.6 : 0,
        dt,
      );
      for (const { pivot, sign } of curtains) {
        pivot.scale.x = damp(
          pivot.scale.x,
          store.state.curtains ? 0.26 : 1,
          dt,
          2,
        );
        pivot.position.x = damp(
          pivot.position.x,
          sign * (store.state.curtains ? 2.94 : 1.775),
          dt,
          2,
        );
      }
    },
  };
}
