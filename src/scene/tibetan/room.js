import * as THREE from "three";
import { box, group, tube } from "../primitives.js";
import { mountainTexture, reflectionEnvironment } from "./materials.js";
import { damp } from "../../state.js";
function arch(cx, bottom, w, h) {
  const p = new THREE.Path();
  p.moveTo(cx - w / 2, bottom);
  p.lineTo(cx + w / 2, bottom);
  p.lineTo(cx + w / 2, bottom + h - w / 2);
  p.absarc(cx, bottom + h - w / 2, w / 2, 0, Math.PI, false);
  p.closePath();
  return p;
}
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "tibetan-room";
  scene.environment = reflectionEnvironment();
  scene.environmentIntensity = 0.19;
  const base = box(root, [10.3, 0.28, 10.3], [0, -0.14, 0], m.trim, 0.055);
  base.name = "tibetan-base";
  box(root, [10, 0.05, 10], [0, 0.008, 0], m.floor).name = "tibetan-floor";
  // Staggered slate edging leaves most of the old timber floor exposed.
  for (let i = 0; i < 13; i++)
    for (const side of [0, 1]) {
      const x = side ? -4.57 : -4.57 + i * 0.76,
        z = side ? -4.57 + i * 0.76 : 4.57;
      const slab = box(
        root,
        [side ? 0.72 : 0.735, 0.018, side ? 0.735 : 0.72],
        [x, 0.043, z],
        m.stone,
        0.025,
      );
      slab.rotation.y = ((i % 3) - 1) * 0.015;
    }
  function wall(pos, rotation, left) {
    const shape = new THREE.Shape();
    shape.moveTo(-5.1, 0);
    shape.lineTo(5.1, 0);
    shape.lineTo(5.1, 4.2);
    shape.lineTo(-5.1, 4.2);
    shape.closePath();
    if (left) {
      const p = new THREE.Path();
      p.moveTo(-3.6, 0.66);
      p.lineTo(1.82, 0.66);
      p.lineTo(1.82, 3.55);
      p.lineTo(-3.6, 3.55);
      p.closePath();
      shape.holes.push(p);
    }
    const niches = left
      ? [{ x: 3.5, b: 2.42, w: 0.61, h: 0.79 }]
      : [
          { x: -0.83, b: 2.15, w: 0.62, h: 0.85 },
          { x: 4.23, b: 1.91, w: 0.66, h: 0.9 },
        ];
    for (const n of niches) shape.holes.push(arch(n.x, n.b, n.w, n.h));
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.28,
      bevelEnabled: false,
      curveSegments: 24,
    });
    const p = geo.attributes.position,
      uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++)
      uv.setXY(i, (p.getX(i) + 5.1) / 10.2, p.getY(i) / 4.2);
    const g = group(root, pos);
    g.rotation.y = rotation;
    g.name = left ? "tibetan-window-wall" : "tibetan-niche-wall";
    const mesh = new THREE.Mesh(geo, m.wall);
    mesh.castShadow = mesh.receiveShadow = true;
    g.add(mesh);
    for (const n of niches) {
      const back = new THREE.Mesh(
        new THREE.ShapeGeometry(
          new THREE.Shape(arch(n.x, n.b, n.w, n.h).getPoints(40)),
        ),
        m.lower,
      );
      back.position.z = -0.012;
      g.add(back);
      box(g, [n.w, 0.065, 0.33], [n.x, n.b, 0.13], m.dark);
    }
    box(g, [10.2, 0.79, 0.035], [0, 0.395, 0.295], m.lower);
    if (left) box(g, [5.48, 0.18, 0.45], [-0.89, 0.63, 0.2], m.dark);
    box(g, [10.2, 0.25, 0.35], [0, 4.02, 0.22], m.wood, 0.016);
    box(g, [10.1, 0.23, 0.045], [0, 3.78, 0.42], m.band);
    box(g, [10.2, 0.055, 0.35], [0, 4.23, 0.12], m.trim);
    for (const x of left ? [-4.77, 2.14, 4.8] : [-4.81, -0.11, 4.85]) {
      const h = left ? 4.18 : x === -4.81 ? 4.18 : 0.7;
      box(g, [0.31, h, 0.41], [x, 4.16 - h / 2, 0.29], m.dark, 0.012);
      for (const y of h > 1 ? [0.63, 3.62] : [3.61])
        box(g, [0.34, 0.23, 0.43], [x, y, 0.3], m.band);
    }
    return g;
  }
  const left = wall([-5.12, 0, 0], Math.PI / 2, true);
  wall([0, 0, -5.12], 0, false);
  const win = group(left, [-0.89, 0, 0.3]);
  win.name = "tibetan-mountain-window";
  const day = mountainTexture(true),
    night = mountainTexture();
  const view = new THREE.Mesh(
    new THREE.PlaneGeometry(5.43, 2.9),
    new THREE.MeshBasicMaterial({ map: night, color: "#d9dded" }),
  );
  view.position.set(0, 2.105, -0.29);
  win.add(view);
  for (const x of [-2.75, -1.37, 0, 1.37, 2.75])
    box(win, [0.075, 2.98, 0.13], [x, 2.1, 0.02], m.dark);
  for (const y of [0.64, 1.29, 2.81, 3.58])
    box(win, [5.58, 0.067, 0.14], [0, y, 0.02], m.dark);
  tube(
    win,
    [
      [-2.69, 1.89, -0.12],
      [0, 1.56, -0.12],
      [2.69, 1.89, -0.12],
    ],
    0.008,
    m.dark,
  );
  for (let i = 0; i < 15; i++) {
    const x = -2.5 + i * 0.35,
      y = 1.56 + 0.33 * ((x * x) / 7.24);
    const f = box(
      win,
      [0.26, 0.31, 0.009],
      [x, y - 0.17, -0.13],
      m.flags[i % 5],
    );
    f.rotation.z = Math.sin(i) * 0.1;
  }
  const curtains = [];
  for (const sign of [-1, 1]) {
    const g = group(win, [sign * 2.51, 0, 0.16]);
    const geo = new THREE.PlaneGeometry(0.73, 2.94, 36, 35);
    const a = geo.attributes.position;
    for (let i = 0; i < a.count; i++)
      a.setZ(i, Math.sin(a.getX(i) * 73) * 0.045);
    geo.computeVertexNormals();
    const cloth = new THREE.Mesh(geo, m.curtain);
    cloth.position.y = 2.09;
    cloth.castShadow = cloth.receiveShadow = true;
    g.add(cloth);
    for (const y of [0.86, 1.08]) {
      const band = new THREE.Mesh(
        new THREE.PlaneGeometry(0.73, 0.16, 36, 1),
        m.rug,
      );
      const p = band.geometry.attributes.position;
      for (let i = 0; i < p.count; i++)
        p.setZ(i, Math.sin(p.getX(i) * 73) * 0.045 + 0.008);
      band.position.y = y;
      g.add(band);
    }
    curtains.push({ g, sign });
  }
  register(win, "高原窗帘", "打开 / 合拢", () => {
    store.set("curtains", !store.state.curtains);
    return "雪山与暮色，静静相伴。";
  });
  return {
    root,
    update(dt) {
      view.material.map = store.state.day ? day : night;
      for (const c of curtains) {
        c.g.position.x = damp(
          c.g.position.x,
          c.sign * (store.state.curtains ? 2.51 : 1.34),
          dt,
          3,
        );
        c.g.scale.x = damp(c.g.scale.x, store.state.curtains ? 1 : 3.8, dt, 3);
      }
    },
    reset() {
      for (const c of curtains) {
        c.g.position.x = c.sign * 2.51;
        c.g.scale.x = 1;
      }
    },
  };
}
