import * as THREE from "three";
import { box, group, cylinder, torus } from "../primitives.js";
import { coastTexture } from "./materials.js";
import { damp } from "../../state.js";
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "mediterranean-room";
  const shape = new THREE.Shape();
  shape.moveTo(-5.1, -5.1);
  shape.lineTo(5.1, -5.1);
  shape.lineTo(5.1, 5.1);
  shape.lineTo(-5.1, 5.1);
  shape.closePath();
  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelSize: 0.075,
      bevelThickness: 0.055,
      bevelSegments: 1,
    }),
    m.trim,
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.28;
  root.add(base);
  base.name = "mediterranean-base";
  box(root, [10, 0.05, 10], [0, -0.012, 0], m.floor).name =
    "mediterranean-terracotta-floor";
  // Left wall is assembled around a genuine opening.
  box(root, [0.19, 3.8, 0.54], [-5.02, 1.9, -4.77], m.wall);
  box(root, [0.19, 3.8, 3.42], [-5.02, 1.9, 3.29], m.wall);
  box(root, [0.19, 0.51, 6.08], [-5.02, 0.255, -1.46], m.wall);
  box(root, [0.19, 0.42, 6.08], [-5.02, 3.59, -1.46], m.wall);
  const wallShape = new THREE.Shape();
  wallShape.moveTo(-5.1, 0);
  wallShape.lineTo(5.1, 0);
  wallShape.lineTo(5.1, 3.8);
  wallShape.lineTo(-5.1, 3.8);
  wallShape.closePath();
  const win = new THREE.Path();
  win.moveTo(0.92, 1.4);
  win.lineTo(3.4, 1.4);
  win.lineTo(3.4, 3.25);
  win.lineTo(0.92, 3.25);
  win.closePath();
  wallShape.holes.push(win);
  const niche = new THREE.Path();
  niche.moveTo(-2.1, 0.35);
  niche.lineTo(-0.15, 0.35);
  niche.lineTo(-0.15, 2.35);
  niche.absarc(-1.125, 2.35, 0.975, 0, Math.PI, false);
  niche.closePath();
  wallShape.holes.push(niche);
  const geo = new THREE.ExtrudeGeometry(wallShape, {
    depth: 0.28,
    bevelEnabled: false,
    curveSegments: 28,
  });
  const p = geo.attributes.position,
    uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++)
    uv.setXY(i, (p.getX(i) + 5.1) / 10.2, p.getY(i) / 3.8);
  const wall = new THREE.Mesh(geo, m.wall);
  wall.position.z = -5.18;
  wall.castShadow = wall.receiveShadow = true;
  wall.name = "mediterranean-recessed-wall";
  root.add(wall);
  const nicheBack = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(niche.getPoints(48))),
    m.wall,
  );
  nicheBack.position.z = -5.185;
  root.add(nicheBack);
  for (const y of [0.47, 1.2])
    box(root, [1.83, 0.07, 0.42], [-1.125, y, -4.94], m.stone, 0.018);
  for (const x of [-4.84, 4.86])
    box(root, [0.16, 3.78, 0.17], [x, 1.89, -4.87], m.wood, 0.015);
  box(root, [10.06, 0.18, 0.19], [0, 3.67, -4.84], m.wood, 0.015);
  box(root, [0.2, 0.18, 9.96], [-4.87, 3.67, 0.02], m.wood, 0.015);
  for (const x of [-4.48, -2.35, 0.5, 3.48])
    box(root, [0.23, 0.28, 0.37], [x, 3.62, -4.74], m.wood, 0.022);
  for (const z of [-3.2, 0.85, 3.9])
    box(root, [0.37, 0.26, 0.24], [-4.73, 3.63, z], m.wood, 0.02);
  box(root, [10.22, 0.055, 0.24], [0, 3.825, -4.99], m.trim);
  box(root, [0.24, 0.055, 10.22], [-4.99, 3.825, 0], m.trim);
  box(root, [10, 0.14, 0.07], [0, 0.07, -4.87], m.stone);
  box(root, [0.07, 0.14, 10], [-4.87, 0.07, 0], m.stone);
  const day = coastTexture(),
    night = coastTexture(true),
    views = [],
    shutters = [],
    curtains = [];
  function windowAt(name, pos, rot, w, h, withCurtains) {
    const g = group(root, pos);
    g.name = name;
    g.rotation.y = rot;
    const view = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: day, toneMapped: false }),
    );
    view.position.z = -0.07;
    g.add(view);
    views.push(view);
    for (const x of [-w / 2, w / 2])
      box(g, [0.075, h + 0.1, 0.13], [x, 0, 0], m.shutter, 0.008);
    for (const y of [-h / 2, h / 2])
      box(g, [w + 0.1, 0.08, 0.13], [0, y, 0], m.shutter, 0.008);
    box(g, [0.055, h, 0.09], [0, 0, 0], m.shutter);
    box(g, [w + 0.24, 0.1, 0.36], [0, -h / 2 - 0.025, 0.09], m.stone, 0.015);
    for (const sign of [-1, 1]) {
      const width = withCurtains ? 0.56 : 0.47,
        pivot = group(g, [(sign * w) / 2, 0, 0.13]);
      box(
        pivot,
        [width, 0.06, 0.07],
        [(sign * width) / 2, -h / 2 + 0.02, 0],
        m.shutter,
      );
      box(
        pivot,
        [width, 0.06, 0.07],
        [(sign * width) / 2, h / 2 - 0.02, 0],
        m.shutter,
      );
      for (const x of [0, sign * width])
        box(pivot, [0.055, h, 0.07], [x, 0, 0], m.shutter);
      for (let i = 0; i < Math.floor(h / 0.085); i++) {
        const slat = box(
          pivot,
          [width - 0.07, 0.056, 0.042],
          [(sign * width) / 2, -h / 2 + 0.1 + i * 0.082, 0],
          m.shutter,
        );
        slat.rotation.x = -0.38;
      }
      pivot.rotation.y = -sign * 0.5;
      shutters.push({ pivot, sign });
      register(pivot, "蓝绿百叶窗", "开合百叶窗", () => {
        store.set("window", !store.state.window);
        return store.state.window
          ? "百叶窗轻轻敞开。"
          : "百叶窗收拢，留下柔光。";
      });
    }
    if (withCurtains) {
      const rod = cylinder(
        g,
        0.018,
        0.018,
        w + 0.25,
        [0, h / 2 + 0.15, 0.19],
        m.black,
        12,
      );
      rod.rotation.z = Math.PI / 2;
      for (const sign of [-1, 1]) {
        const cg = group(g, [sign * w * 0.4, h / 2, 0.21]);
        const geo = new THREE.PlaneGeometry(w * 0.52, h + 0.24, 32, 24),
          a = geo.attributes.position;
        for (let i = 0; i < a.count; i++) {
          const x = a.getX(i),
            y = a.getY(i);
          a.setZ(
            i,
            0.055 * Math.sin(x * 37) + 0.017 * Math.sin(y * 7 + x * 11),
          );
        }
        geo.computeVertexNormals();
        const cloth = new THREE.Mesh(geo, m.curtain);
        cloth.position.y = -(h + 0.24) / 2;
        cg.add(cloth);
        cg.scale.x = 0.25;
        curtains.push({ cg, sign, w });
        register(cg, "白色亚麻纱帘", "缓缓开合", () => {
          store.set("curtains", !store.state.curtains);
          return store.state.curtains
            ? "海风穿过纱帘。"
            : "纱帘合上，光线变柔。";
        });
      }
    }
    register(view, "海湾夕景", "切换夕照与月夜", () => {
      store.set("day", !store.state.day);
      return store.state.day ? "海湾回到金色夕照。" : "海湾渐入蓝色月夜。";
    });
  }
  windowAt(
    "mediterranean-french-window",
    [-4.9, 1.945, -1.46],
    Math.PI / 2,
    6.05,
    2.87,
    true,
  );
  windowAt(
    "mediterranean-desk-window",
    [2.16, 2.325, -4.89],
    0,
    2.48,
    1.85,
    false,
  );
  const mirror = new THREE.Mesh(
    new THREE.CircleGeometry(0.53, 64),
    new THREE.MeshStandardMaterial({
      map: coastTexture(),
      color: "#acb7b2",
      metalness: 0.15,
      roughness: 0.24,
    }),
  );
  mirror.position.set(-1.125, 2.27, -5.13);
  mirror.name = "mediterranean-coastal-mirror";
  root.add(mirror);
  torus(root, 0.55, 0.026, [-1.125, 2.27, -5.105], m.lightWood, [0, 0, 0]);
  return {
    root,
    update(dt) {
      for (const { pivot, sign } of shutters)
        pivot.rotation.y = damp(
          pivot.rotation.y,
          store.state.window ? -sign * 0.55 : sign * Math.PI * 0.93,
          dt,
        );
      for (const { cg, sign, w } of curtains) {
        cg.scale.x = damp(cg.scale.x, store.state.curtains ? 0.25 : 1, dt, 2);
        cg.position.x = damp(
          cg.position.x,
          sign * w * (store.state.curtains ? 0.405 : 0.25),
          dt,
          2,
        );
      }
      for (const v of views) v.material.map = store.state.day ? day : night;
    },
  };
}
