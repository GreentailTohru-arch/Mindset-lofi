import * as THREE from "three";
import { box, group, tube } from "../primitives.js";
import { oasisTexture, reflectionEnvironment } from "./materials.js";
import { damp } from "../../state.js";
// Shallow elliptical arch matches the wide carved window in the reference.
function windowArch(cx = 0) {
  const p = new THREE.Path();
  p.moveTo(cx - 2.71, 0.66);
  p.lineTo(cx + 2.71, 0.66);
  p.lineTo(cx + 2.71, 2.92);
  p.absellipse(cx, 2.92, 2.71, 0.65, 0, Math.PI, false);
  p.closePath();
  return p;
}
function lattice(parent, pos, w, h, m) {
  const g = group(parent, pos);
  for (const sign of [-1, 1])
    for (let k = -h; k < w + h; k += 0.19) {
      const points = [];
      for (let i = 0; i <= 60; i++) {
        const y = -h / 2 + (h * i) / 60,
          x = k + sign * (y + h / 2) - w / 2;
        if (x >= -w / 2 && x <= w / 2) points.push([x, y, 0]);
      }
      if (points.length > 1) tube(g, [points[0], points.at(-1)], 0.016, m.dark);
    }
  for (const x of [-w / 2, w / 2])
    box(g, [0.055, h + 0.06, 0.07], [x, 0, 0], m.wood);
  for (const y of [-h / 2, h / 2])
    box(g, [w + 0.06, 0.055, 0.07], [0, y, 0], m.wood);
  return g;
}
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
  root.name = "uyghur-room";
  scene.environment = reflectionEnvironment();
  scene.environmentIntensity = 0.19;
  const base = box(root, [10.3, 0.28, 10.3], [0, -0.14, 0], m.trim, 0.055);
  base.name = "uyghur-base";
  box(root, [10, 0.05, 10], [0, 0.008, 0], m.floor).name = "uyghur-floor";
  box(root, [1.4, 0.025, 6.65], [-4.27, 0.047, 1.13], m.tile);
  function wall(pos, rotation, left) {
    const shape = new THREE.Shape();
    shape.moveTo(-5.1, 0);
    shape.lineTo(5.1, 0);
    shape.lineTo(5.1, 4.2);
    shape.lineTo(-5.1, 4.2);
    shape.closePath();
    if (left) shape.holes.push(windowArch(-0.89));
    const niches = left
      ? [
          { x: -4.25, b: 1.48, w: 0.7, h: 1.04 },
          { x: 3.5, b: 2.42, w: 0.61, h: 0.79 },
        ]
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
    g.name = left ? "uyghur-window-wall" : "uyghur-niche-wall";
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
    // Tile belts stop at the window rather than crossing the glazing.
    for (const [cx, w] of left
      ? [
          [-4.37, 1.44],
          [3.46, 3.28],
        ]
      : [[0, 10.2]]) {
      box(g, [w, 0.18, 0.028], [cx, 1.02, 0.299], m.band);
      box(g, [w, 0.14, 0.029], [cx, 0.18, 0.299], m.band);
    }
    if (left) box(g, [5.6, 0.12, 0.43], [-0.89, 0.63, 0.2], m.dark);
    box(g, [10.2, 0.15, 0.09], [0, 4.07, 0.3], m.cornice);
    box(g, [10.2, 0.055, 0.35], [0, 4.23, 0.12], m.trim);
    box(g, [0.12, 4.15, 0.13], [left ? 4.95 : -4.96, 2.08, 0.28], m.dark);
    return g;
  }
  const left = wall([-5.12, 0, 0], Math.PI / 2, true);
  wall([0, 0, -5.12], 0, false);
  const win = group(left, [-0.89, 0, 0.3]);
  win.name = "uyghur-oasis-window";
  const day = oasisTexture(true),
    night = oasisTexture(false);
  const view = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(windowArch().getPoints(80))),
    new THREE.MeshBasicMaterial({ map: day, color: "#ffffff" }),
  );
  view.name = "uyghur-oasis-view";
  const va = view.geometry.attributes.position,
    vu = view.geometry.attributes.uv;
  for (let i = 0; i < va.count; i++)
    vu.setXY(i, (va.getX(i) + 2.71) / 5.42, (va.getY(i) - 0.66) / 2.91);
  view.position.z = -0.29;
  win.add(view);
  for (const x of [-2.75, 2.75])
    box(win, [0.14, 2.32, 0.19], [x, 1.8, 0.02], m.wood);
  for (const x of [-1.35, 1.35])
    box(win, [0.035, 2.3, 0.07], [x, 1.8, 0.01], m.dark);
  box(win, [5.58, 0.1, 0.2], [0, 0.64, 0.02], m.wood);
  const arc = [];
  for (let i = 0; i <= 48; i++) {
    const t = (i * Math.PI) / 48;
    arc.push([Math.cos(t) * 2.76, 2.92 + Math.sin(t) * 0.68, 0.035]);
  }
  tube(win, arc, 0.075, m.wood);
  for (let i = 0; i < 20; i++) {
    const x = -2.55 + i * 0.267,
      y = 2.92 + 0.65 * Math.sqrt(Math.max(0, 1 - (x * x) / 7.35));
    tube(
      win,
      [
        [x, 2.92, 0.02],
        [x + 0.11, y - 0.06, 0.02],
      ],
      0.023,
      m.wood,
    );
  }
  box(win, [5.5, 0.045, 0.065], [0, 2.92, 0.025], m.dark);
  for (const x of [-2.98, 2.98]) lattice(win, [x, 1.96, 0.05], 0.38, 2.5, m);
  box(win, [5.72, 0.035, 0.035], [0, 3.56, 0.13], m.bronze);
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
    curtains.push({ g, sign });
  }
  register(win, "绿洲纱帘", "打开 / 合拢", () => {
    store.set("curtains", !store.state.curtains);
    return "夕阳与葡萄藤，映在纱帘上。";
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
