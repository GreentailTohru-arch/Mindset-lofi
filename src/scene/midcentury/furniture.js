import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import {
  pottery,
  books,
  plant,
  trailing,
  branches,
} from "../dongfang/details.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "midcentury-furniture";
  const lamps = [],
    motions = [],
    drawers = [];
  function named(o, name) {
    o.name = "midcentury-" + name;
    return o;
  }
  function touch(o, name, action) {
    const e = { o, y: o.position.y, t: 1 };
    motions.push(e);
    register(o, name, "轻触互动", () => {
      e.t = 0;
      return action ? action() : "慢下来，享受午后的片刻。";
    });
    return o;
  }
  function leg(p, x, z, h, r = 0.045) {
    return cylinder(p, r * 1.6, r, h, [x, h / 2, z], m.wood, 12);
  }
  function cup(p, pos) {
    const g = pottery(p, pos, 0.36, m.clay, "bowl");
    torus(g, 0.1, 0.022, [0.22, 0.09, 0], m.clay, [0, 0, 0]);
    cylinder(g, 0.145, 0.145, 0.008, [0, 0.14, 0], m.soil);
    return g;
  }
  function lamp(
    p,
    pos,
    scale = 1,
    key = "bedLamp",
    title = "黄铜蘑菇台灯",
    power = 2,
  ) {
    const g = group(p, pos);
    g.scale.setScalar(scale);
    cylinder(g, 0.18, 0.2, 0.045, [0, 0.022, 0], m.bronze);
    cylinder(g, 0.035, 0.05, 0.42, [0, 0.25, 0], m.bronze);
    const shade = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      m.bronze,
    );
    shade.position.y = 0.47;
    shade.castShadow = true;
    g.add(shade);
    const glow = m.glow.clone();
    cylinder(g, 0.278, 0.278, 0.012, [0, 0.467, 0], glow).castShadow = false;
    root.updateMatrixWorld(true);
    const v = g.localToWorld(new THREE.Vector3(0, 0.43, 0));
    lamps.push({ shade: glow, key, power, pos: v.toArray() });
    touch(g, title, () => {
      store.set(key, !store.state[key]);
      return "灯光缓缓变化。";
    });
    return g;
  }
  function art(p, pos, w, h, mat = m.art) {
    const g = group(p, pos);
    box(g, [w + 0.09, h + 0.09, 0.055], [0, 0, 0], m.wood, 0.009);
    box(g, [w, h, 0.016], [0, 0, 0.034], mat);
    return g;
  }
  // Shapes are drawn in the room's X/Z plane, then extruded vertically.
  function organic(p, y, depth, mat, sofa = false, inset = 1) {
    const s = new THREE.Shape();
    if (sofa) {
      s.moveTo(-2.05, -0.62);
      s.bezierCurveTo(-2.55, -0.4, -2.35, 0.63, -1.65, 0.93);
      s.bezierCurveTo(-0.75, 1.24, 0.95, 1.23, 1.85, 0.75);
      s.bezierCurveTo(2.35, 0.47, 2.52, -0.48, 2.02, -0.67);
      s.bezierCurveTo(1.38, -0.98, 0.74, -0.05, -0.15, -0.13);
      s.bezierCurveTo(-0.93, -0.11, -1.45, -0.9, -2.05, -0.62);
    } else {
      s.moveTo(-1.32, -0.18);
      s.bezierCurveTo(-1.48, 0.42, -0.55, 0.76, 0.25, 0.64);
      s.bezierCurveTo(0.95, 0.64, 1.56, -0.12, 1.24, -0.5);
      s.bezierCurveTo(0.93, -0.89, 0.33, -0.24, -0.28, -0.39);
      s.bezierCurveTo(-0.91, -0.68, -1.23, -0.68, -1.32, -0.18);
    }
    const geo = new THREE.ExtrudeGeometry(s, {
      depth,
      bevelEnabled: true,
      bevelThickness: sofa ? 0.1 : 0.026,
      bevelSize: sofa ? 0.105 : 0.025,
      bevelSegments: 4,
      curveSegments: 28,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = y;
    mesh.scale.set(inset, inset, 1);
    mesh.castShadow = mesh.receiveShadow = true;
    p.add(mesh);
    return mesh;
  }
  const rug = named(
    box(root, [6.55, 0.025, 5.1], [0.25, 0.03, 1.6], m.rug, 0.012),
    "geometric-rug",
  );
  const sofa = named(group(root, [-0.1, 0.015, -0.05]), "curved-sofa");
  for (const x of [-1.8, 1.8])
    for (const z of [-0.65, 0.4]) leg(sofa, x, z, 0.22, 0.047);
  organic(sofa, 0.25, 0.18, m.olive, true);
  organic(sofa, 0.48, 0.12, m.olive, true, 0.975);
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.15, 0.86, 0.42),
    new THREE.Vector3(-2.04, 1.02, -0.46),
    new THREE.Vector3(-1.18, 1.08, -0.92),
    new THREE.Vector3(0.4, 1.08, -1),
    new THREE.Vector3(1.76, 1.02, -0.66),
    new THREE.Vector3(2.12, 0.86, 0.4),
  ]);
  const positions = [],
    uv = [],
    indices = [],
    n = 72,
    sides = 16;
  for (let i = 0; i <= n; i++) {
    const v = path.getPoint(i / n),
      t = path.getTangent(i / n),
      normal = new THREE.Vector3(t.z, 0, -t.x).normalize();
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      positions.push(
        v.x + normal.x * Math.cos(a) * 0.2,
        v.y - 0.04 + Math.sin(a) * 0.4,
        v.z + normal.z * Math.cos(a) * 0.2,
      );
      uv.push((i / n) * 4, j / sides);
      if (i < n && j < sides) {
        const k = i * (sides + 1) + j;
        indices.push(
          k,
          k + 1,
          k + sides + 1,
          k + 1,
          k + sides + 2,
          k + sides + 1,
        );
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const back = new THREE.Mesh(geo, m.olive);
  back.castShadow = back.receiveShadow = true;
  sofa.add(back);
  for (const t of [0, 1]) {
    const v = path.getPoint(t);
    v.y -= 0.04;
    sphere(sofa, [0.2, 0.4, 0.2], v.toArray(), m.olive);
  }
  [m.olive, m.mustard, m.rust, m.pattern].forEach((mat, i) => {
    const p = box(
      sofa,
      [0.53, 0.53, 0.16],
      [-1.2 + i * 0.65, 0.99, -0.59],
      mat,
      0.09,
    );
    p.rotation.set(-0.16, 0, (i % 2 ? 1 : -1) * 0.1);
  });
  touch(sofa, "橄榄绿弧形沙发");
  const table = named(group(root, [-0.15, 0.025, 1.62]), "kidney-table");
  for (const [x, z] of [
    [-0.95, 0.18],
    [0.9, 0.18],
    [0.02, -0.38],
  ])
    leg(table, x, z, 0.62, 0.035);
  organic(table, 0.62, 0.075, m.wood);
  books(table, [-0.61, 0.74, 0.07], m, 2);
  cup(table, [-0.38, 0.9, 0.07]);
  pottery(table, [0.32, 0.73, -0.12], 0.57, m.ceramic);
  branches(table, [0.32, 1.07, -0.12], m, 0.47);
  touch(table, "有机曲线胡桃木茶几");
  function chair(pos, swivel, rotation) {
    const g = named(
      group(root, pos),
      swivel ? "swivel-chair" : "leather-chair",
    );
    g.rotation.y = rotation;
    if (swivel) {
      cylinder(g, 0.055, 0.065, 0.35, [0, 0.23, 0], m.black);
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5;
        tube(
          g,
          [
            [0, 0.13, 0],
            [Math.cos(a) * 0.52, 0.08, Math.sin(a) * 0.52],
          ],
          0.026,
          m.black,
        );
      }
    } else {
      for (const x of [-0.44, 0.44])
        for (const z of [-0.37, 0.36]) leg(g, x, z, 0.49, 0.035);
    }
    box(g, [1.12, 0.12, 1.03], [0, 0.44, 0], m.wood, 0.1);
    box(g, [1.02, 0.23, 0.92], [0, 0.55, 0.04], m.caramel, 0.12);
    const b = group(g, [0, 0.88, -0.38]);
    b.rotation.x = -0.23;
    box(b, [1.12, 0.82, 0.13], [0, 0, -0.065], m.wood, 0.15);
    box(b, [1.03, 0.73, 0.2], [0, 0, 0.04], m.caramel, 0.14);
    if (swivel) {
      for (const x of [-0.255, 0.255])
        for (const y of [-0.18, 0.18])
          box(b, [0.5, 0.35, 0.075], [x, y, 0.12], m.caramel, 0.045);
      for (const x of [-0.26, 0.26])
        for (const y of [-0.18, 0.17])
          sphere(b, [0.02, 0.02, 0.008], [x, y, 0.161], m.chocolate);
      for (const x of [-0.25, 0.25])
        sphere(g, [0.025, 0.013, 0.025], [x, 0.67, 0.06], m.chocolate);
    }
    for (const x of [-0.55, 0.55]) {
      tube(
        g,
        [
          [x, 0.43, -0.24],
          [x, 0.72, -0.1],
          [x, 0.72, 0.28],
        ],
        0.025,
        swivel ? m.black : m.wood,
      );
      box(g, [0.17, 0.12, 0.63], [x, 0.75, 0.03], m.caramel, 0.055);
    }
    touch(g, swivel ? "焦糖皮革旋转椅" : "中古皮革休闲椅");
    return g;
  }
  chair([-2.88, 0.02, 2.28], true, 1.05);
  chair([2.8, 0.02, 2.75], false, -0.95);
  const pouf = named(group(root, [1.45, 0.02, 3.93]), "rust-ottoman");
  for (let i = 0; i < 3; i++)
    leg(pouf, Math.cos(i * 2.094) * 0.4, Math.sin(i * 2.094) * 0.4, 0.17, 0.03);
  sphere(pouf, [0.59, 0.24, 0.59], [0, 0.37, 0], m.rust);
  torus(pouf, 0.566, 0.009, [0, 0.35, 0], m.rust);
  touch(pouf, "砖红圆形软墩");
  const side = group(root, [-1.75, 0.025, 3.22]);
  cylinder(side, 0.12, 0.26, 0.58, [0, 0.29, 0], m.wood);
  cylinder(side, 0.39, 0.38, 0.055, [0, 0.61, 0], m.stone);
  lamp(side, [0, 0.645, 0], 0.52, "bedLamp", "边几小台灯", 0.8);
  touch(side, "圆形石材边几");

  const cabinet = named(group(root, [-2.25, 0, -4.43]), "rear-bookcase");
  for (const x of [-1.65, 1.65])
    for (const z of [-0.29, 0.29]) leg(cabinet, x, z, 0.27);
  box(cabinet, [3.75, 2.77, 0.075], [0, 1.65, -0.42], m.dark);
  for (const x of [-1.86, 1.86])
    box(cabinet, [0.08, 2.8, 0.89], [x, 1.66, 0], m.wood);
  for (const y of [0.27, 1.24, 1.83, 2.42, 3.06])
    box(cabinet, [3.8, 0.08, 0.91], [0, y, 0], m.wood);
  for (const x of [-0.57, 0.62])
    box(cabinet, [0.045, 1.8, 0.84], [x, 2.16, 0], m.wood);
  for (const x of [-1.38, -0.46, 0.46, 1.38]) {
    const pivot = group(cabinet, [x - 0.44, 0.77, 0.43]);
    box(pivot, [0.88, 0.87, 0.045], [0.44, 0, 0], m.wood);
    cylinder(pivot, 0.014, 0.014, 0.11, [0.77, 0.05, 0.037], m.black);
    drawers.push({ o: pivot, door: true, base: 0 });
    touch(pivot, "胡桃木收纳柜门", () => {
      store.set("wardrobe", !store.state.wardrobe);
      return "柜门轻轻打开。";
    });
  }
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      const x = -1.73 + c * 1.26,
        y = 1.29 + r * 0.59;
      if ((r + c) % 3 !== 1) books(cabinet, [x, y, 0.06], m, 8, true);
      else
        pottery(
          cabinet,
          [x + 0.5, y, 0.07],
          0.7,
          c ? m.sage : m.ceramic,
          r === 2 ? "bowl" : "vase",
        );
    }
  trailing(cabinet, [-1.55, 3.1, 0.14], m, 0.85);
  plant(cabinet, [0.35, 3.1, -0.1], m, 0.3);
  art(cabinet, [-0.85, 3.48, -0.1], 0.56, 0.7);
  const bird = named(group(cabinet, [1.02, 3.1, 0.01]), "wooden-bird");
  sphere(bird, [0.26, 0.16, 0.12], [0, 0.3, 0], m.wood);
  sphere(bird, [0.09, 0.1, 0.08], [-0.2, 0.49, 0], m.wood);
  tube(
    bird,
    [
      [-0.1, 0.31, 0],
      [-0.18, 0.42, 0],
      [-0.2, 0.48, 0],
    ],
    0.065,
    m.wood,
  );
  tube(
    bird,
    [
      [0.13, 0.3, 0],
      [0.4, 0.18, 0],
    ],
    0.055,
    m.wood,
  );
  tube(
    bird,
    [
      [-0.24, 0.5, 0],
      [-0.34, 0.5, 0],
    ],
    0.023,
    m.wood,
  );
  for (const x of [-0.045, 0.065])
    cylinder(bird, 0.008, 0.008, 0.18, [x, 0.1, 0], m.black);
  cylinder(bird, 0.13, 0.13, 0.02, [0, 0.01, 0], m.wood);
  touch(bird, "木雕鸟摆件");

  const credenza = named(group(root, [2.64, 0, -4.35]), "walnut-sideboard");
  for (const x of [-1.95, 1.95])
    for (const z of [-0.32, 0.32]) leg(credenza, x, z, 0.31);
  box(credenza, [4.35, 0.77, 0.86], [0, 0.71, 0], m.dark, 0.018);
  box(credenza, [4.4, 0.065, 0.92], [0, 1.125, 0], m.wood, 0.014);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 2; j++) {
      const g = group(credenza, [-1.44 + i * 1.44, 0.52 + j * 0.36, 0.447]);
      box(g, [1.4, 0.335, 0.05], [0, 0, 0], m.wood, 0.01);
      box(g, [0.22, 0.015, 0.026], [0, 0.04, 0.038], m.bronze, 0.005);
      drawers.push({ o: g, base: 0.447, on: false });
      const d = drawers.at(-1);
      touch(g, "餐边柜抽屉", () => {
        d.on = !d.on;
        return "抽屉缓缓滑动。";
      });
    }
  lamp(credenza, [-1.35, 1.16, 0], 0.9, "bedLamp", "餐边柜黄铜台灯", 2.2);
  books(credenza, [-0.2, 1.16, 0.05], m, 3);
  pottery(credenza, [1.06, 1.16, 0.03], 0.6, m.ceramic);
  plant(credenza, [1.75, 1.16, -0.06], m, 0.44);
  art(root, [2.74, 2.5, -4.865], 2.22, 1.61, m.art2);
  const clock = named(group(root, [0.22, 2.67, -4.84]), "sunburst-clock");
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    const ray = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.49, 4),
      i % 2 ? m.bronze : m.wood,
    );
    ray.position.set(Math.sin(a) * 0.4, Math.cos(a) * 0.4, 0.015);
    ray.rotation.z = -a;
    clock.add(ray);
  }
  cylinder(clock, 0.18, 0.18, 0.05, [0, 0, 0.05], m.bronze).rotation.x =
    Math.PI / 2;
  cylinder(clock, 0.155, 0.155, 0.008, [0, 0, 0.08], m.paper).rotation.x =
    Math.PI / 2;
  tube(
    clock,
    [
      [0, 0.12, 0.09],
      [0, 0, 0.09],
      [0.085, -0.04, 0.09],
    ],
    0.008,
    m.black,
  );
  touch(clock, "太阳纹挂钟");

  const desk = named(group(root, [-4.07, 0, -0.91]), "writing-desk");
  desk.rotation.y = Math.PI / 2;
  for (const x of [-1.44, 1.44])
    for (const z of [-0.38, 0.37]) leg(desk, x, z, 1.05, 0.036);
  box(desk, [3.22, 0.095, 1.03], [0, 1.12, 0], m.wood, 0.018);
  box(desk, [3, 0.24, 0.89], [0, 0.96, 0], m.dark);
  const drawer = group(desk, [0, 0.96, 0.46]);
  box(drawer, [1.45, 0.22, 0.045], [0, 0, 0], m.wood);
  box(drawer, [0.23, 0.018, 0.035], [0, 0, 0.038], m.bronze);
  const dr = { o: drawer, base: 0.46, on: false };
  drawers.push(dr);
  touch(drawer, "书桌抽屉", () => {
    dr.on = !dr.on;
    return "收好随手的笔记。";
  });
  const note = group(desk, [0.25, 1.182, 0.09]);
  box(note, [0.65, 0.02, 0.42], [0, 0, 0], m.dark);
  for (const x of [-0.155, 0.155]) {
    const page = box(note, [0.3, 0.012, 0.39], [x, 0.016, 0], m.paper);
    page.rotation.z = x < 0 ? -0.04 : 0.04;
  }
  touch(note, "空白笔记本");
  books(desk, [1.05, 1.172, -0.22], m, 3);
  lamp(desk, [-1.02, 1.17, -0.18], 0.76, "bedLamp", "书桌黄铜台灯", 1.8);
  const dc = named(group(root, [-3.02, 0, -1.55]), "desk-chair");
  dc.rotation.y = -Math.PI / 2;
  for (const x of [-0.32, 0.32])
    for (const z of [-0.3, 0.3]) leg(dc, x, z, 0.52, 0.026);
  box(dc, [0.78, 0.08, 0.7], [0, 0.53, 0], m.wood, 0.06);
  for (const x of [-0.29, 0.29])
    tube(
      dc,
      [
        [x, 0.48, -0.28],
        [x, 1.16, -0.4],
      ],
      0.025,
      m.wood,
    );
  box(dc, [0.76, 0.35, 0.07], [0, 1.02, -0.4], m.wood, 0.09);
  touch(dc, "胡桃木书写椅");
  const leftArt = art(root, [-4.87, 2.1, 3.23], 0.75, 1.06);
  leftArt.rotation.y = Math.PI / 2;
  plant(root, [-4.23, 0.02, 3.58], m, 1.15);
  plant(root, [0.17, 0.02, -4.1], m, 0.8);
  plant(desk, [1.32, 1.18, -0.26], m, 0.28);

  const arc = named(group(root, [3.5, 0, 0.54]), "arc-floor-lamp");
  cylinder(arc, 0.17, 0.18, 0.55, [0, 0.275, 0], m.stone);
  tube(
    arc,
    [
      [0, 0.5, 0],
      [0, 1.95, 0],
      [-0.15, 2.16, 0],
      [-0.57, 2.14, 0],
      [-0.74, 1.99, 0],
    ],
    0.014,
    m.bronze,
  );
  const shade = new THREE.Mesh(
    new THREE.SphereGeometry(0.29, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    m.ceramic,
  );
  shade.position.set(-0.74, 1.8, 0);
  arc.add(shade);
  const glow = m.glow.clone();
  cylinder(arc, 0.28, 0.28, 0.012, [-0.74, 1.8, 0], glow).castShadow = false;
  lamps.push({
    shade: glow,
    key: "floorLamp",
    power: 2.2,
    pos: [2.76, 1.75, 0.54],
  });
  touch(arc, "白色弧形落地灯", () => {
    store.set("floorLamp", !store.state.floorLamp);
    return "一盏灯，一段慢时光。";
  });
  return {
    root,
    lamps,
    update(dt) {
      for (const e of motions) {
        e.t = Math.min(1, e.t + dt * 1.9);
        e.o.position.y = e.y + Math.sin(e.t * Math.PI) * 0.026;
      }
      for (const d of drawers) {
        if (d.door)
          d.o.rotation.y = damp(
            d.o.rotation.y,
            store.state.wardrobe ? -1.15 : 0,
            dt,
            3,
          );
        else
          d.o.position.z = damp(
            d.o.position.z,
            d.base + (d.on ? 0.3 : 0),
            dt,
            3,
          );
      }
    },
    reset() {
      for (const e of motions) {
        e.t = 1;
        e.o.position.y = e.y;
      }
      for (const d of drawers) {
        d.on = false;
        if (d.door) d.o.rotation.y = 0;
        else d.o.position.z = d.base;
      }
    },
  };
}
