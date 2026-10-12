import * as THREE from "three";
import { box, cylinder, sphere, torus, group } from "../primitives.js";
import { bamboo, stone } from "./details.js";
import { landscapeTexture } from "./materials.js";
import { damp } from "../../state.js";
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "dongfang-room";
  const baseShape = new THREE.Shape();
  baseShape.moveTo(-5.12, -5.12);
  baseShape.lineTo(5.12, -5.12);
  baseShape.lineTo(5.12, 5.12);
  baseShape.lineTo(-5.12, 5.12);
  baseShape.closePath();
  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(baseShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.065,
      bevelSegments: 1,
    }),
    m.trim,
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.28;
  base.name = "dongfang-beveled-base";
  base.receiveShadow = true;
  root.add(base);
  const floor = box(root, [10, 0.05, 10], [0, -0.009, 0], m.floor);
  floor.name = "dongfang-walnut-floor";
  const wallShape = new THREE.Shape();
  wallShape.moveTo(-5.08, -0.03);
  wallShape.lineTo(5.08, -0.03);
  wallShape.lineTo(5.08, 3.8);
  wallShape.lineTo(-5.08, 3.8);
  wallShape.closePath();
  const niche = new THREE.Path(),
    nx = -3.48,
    r = 0.71,
    bottom = 0.06,
    spring = 2.19;
  niche.moveTo(nx - r, bottom);
  niche.lineTo(nx + r, bottom);
  niche.lineTo(nx + r, spring);
  niche.absarc(nx, spring, r, 0, Math.PI, false);
  niche.lineTo(nx - r, bottom);
  wallShape.holes.push(niche);
  const wall = new THREE.Mesh(
    new THREE.ExtrudeGeometry(wallShape, {
      depth: 0.36,
      bevelEnabled: false,
      curveSegments: 32,
    }),
    m.wall,
  );
  const p = wall.geometry.attributes.position,
    uv = wall.geometry.attributes.uv;
  for (let i = 0; i < p.count; i++)
    uv.setXY(i, (p.getX(i) + 5.08) / 10.16, (p.getY(i) + 0.03) / 3.83);
  wall.position.z = -5.27;
  wall.castShadow = wall.receiveShadow = true;
  wall.name = "dongfang-recessed-wall";
  root.add(wall);
  const back = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(niche.getPoints(40))),
    m.wall,
  );
  back.position.z = -5.275;
  back.receiveShadow = true;
  root.add(back);
  const archPoints = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i * Math.PI) / 40;
    archPoints.push(
      new THREE.Vector3(nx + Math.cos(a) * r, spring + Math.sin(a) * r, -4.905),
    );
  }
  const trimGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(archPoints),
    40,
    0.023,
    6,
    false,
  );
  root.add(new THREE.Mesh(trimGeo, m.wood));
  for (const x of [nx - r, nx + r])
    box(
      root,
      [0.042, spring - bottom, 0.04],
      [x, (spring + bottom) / 2, -4.896],
      m.wood,
    );
  const garden = group(root, [nx, 0.08, -5.03]);
  garden.name = "dongfang-niche-garden";
  box(garden, [1.37, 0.055, 0.44], [0, 0.012, 0], m.moss, 0.012);
  bamboo(garden, [0.12, 0.045, -0.045], m, 0.96, false);
  for (let i = 0; i < 24; i++)
    sphere(
      garden,
      [0.035 + (i % 3) * 0.012, 0.018, 0.026],
      [-0.6 + (i % 8) * 0.17, 0.056, -0.16 + Math.floor(i / 8) * 0.13],
      m.trim,
    );
  stone(garden, [0.43, 0.21, 0.02], m, [0.16, 0.19, 0.13]);
  stone(garden, [-0.39, 0.15, 0.04], m, [0.14, 0.11, 0.14]);
  const stoneLantern = group(garden, [-0.33, 0.045, 0.015]);
  box(stoneLantern, [0.24, 0.1, 0.23], [0, 0.05, 0], m.stone, 0.015);
  box(stoneLantern, [0.13, 0.39, 0.13], [0, 0.275, 0], m.stone);
  box(stoneLantern, [0.22, 0.23, 0.21], [0, 0.575, 0], m.glow);
  for (const x of [-0.13, 0.13])
    for (const z of [-0.12, 0.12])
      box(stoneLantern, [0.036, 0.27, 0.035], [x, 0.58, z], m.stone);
  cylinder(
    stoneLantern,
    0.055,
    0.24,
    0.17,
    [0, 0.79, 0],
    m.stone,
    4,
  ).rotation.y = Math.PI / 4;
  register(garden, "月洞禅景", "静观竹影", () => "一隅竹影，半室清静。");
  // The wide garden window is cut out of the left wall, with no hidden wall behind it.
  box(root, [0.16, 3.83, 0.35], [-5, 1.885, -4.825], m.wall);
  box(root, [0.16, 3.83, 3.25], [-5, 1.885, 3.375], m.wall);
  box(root, [0.16, 0.58, 6.4], [-5, 0.26, -1.45], m.wall);
  box(root, [0.16, 0.35, 6.4], [-5, 3.625, -1.45], m.wall);
  for (const x of [-4.89, -2.52, 0.27, 3.63, 4.91])
    box(root, [0.09, 3.7, 0.11], [x, 1.85, -4.858], m.dark);
  box(root, [10.22, 0.095, 0.2], [0, 3.81, -4.96], m.trim);
  box(root, [0.2, 0.095, 10.02], [-4.96, 3.81, 0.04], m.trim);
  box(root, [10, 0.11, 0.065], [0, 0.071, -4.875], m.dark);
  box(root, [0.065, 0.11, 9.8], [-4.87, 0.071, 0], m.dark);
  const win = group(root, [-4.91, 2.035, -1.45]);
  win.rotation.y = Math.PI / 2;
  win.name = "dongfang-window";
  const day = landscapeTexture({ day: true }),
    night = landscapeTexture();
  const viewMat = new THREE.MeshBasicMaterial({
    map: night,
    color: "#c7d2db",
    toneMapped: false,
  });
  const view = new THREE.Mesh(new THREE.PlaneGeometry(6.37, 2.96), viewMat);
  view.position.z = -0.025;
  win.add(view);
  for (const x of [-3.22, 3.22])
    box(win, [0.09, 3.08, 0.14], [x, 0, 0.02], m.dark);
  for (const y of [-1.515, 1.515])
    box(win, [6.53, 0.09, 0.14], [0, y, 0.02], m.wood);
  box(win, [0.065, 3, 0.11], [0.2, 0, 0.05], m.dark);
  for (const side of [-1, 1])
    for (let i = 0; i < 7; i++)
      box(
        win,
        [0.034, 2.99, 0.1],
        [side * (2.55 + i * 0.092), 0, 0.12],
        m.dark,
      );
  const curtains = [];
  for (const [i, x, sign] of [
    [0, -2.41, 1],
    [1, 2.42, -1],
  ]) {
    const g = group(win, [x, 1.47, 0.15]);
    const geo = new THREE.PlaneGeometry(3.15, 2.93, 48, 28),
      p = geo.attributes.position;
    for (let j = 0; j < p.count; j++) {
      const px = p.getX(j),
        py = p.getY(j);
      p.setXYZ(
        j,
        (px + 1.575) * sign,
        py - 1.465 + Math.sin(px * 18) * 0.014,
        Math.sin(px * 30) * 0.05,
      );
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, m.curtain);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    g.add(mesh);
    curtains.push(g);
    register(g, "米白纱帘", "收拢 / 放下", () => {
      store.set("curtains", !store.state.curtains);
      return store.state.curtains
        ? "纱帘收拢，远山入室。"
        : "一层轻纱，一室柔光。";
    });
  }
  const rod = cylinder(win, 0.017, 0.017, 6.58, [0, 1.57, 0.15], m.bronze);
  rod.rotation.z = Math.PI / 2;
  register(view, "暮色山景", "日景 / 暮色", () => {
    store.set("day", !store.state.day);
    return store.state.day ? "山间晨光，缓缓醒来。" : "薄雾暮色，归于宁静。";
  });
  return {
    root,
    update(dt, t) {
      viewMat.map = store.state.day ? day : night;
      curtains.forEach((g, i) => {
        g.scale.x = damp(g.scale.x, store.state.curtains ? 0.23 : 1, dt, 1.8);
        g.position.z = 0.15 + Math.sin(t * 0.4 + i) * 0.006;
      });
    },
  };
}
