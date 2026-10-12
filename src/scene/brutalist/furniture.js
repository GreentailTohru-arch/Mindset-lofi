import * as THREE from "three";
import { box, cylinder, sphere, tube, group, torus } from "../primitives.js";
import { pottery, books, trailing } from "../dongfang/details.js";
import { damp } from "../../state.js";
export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "brutalist-furniture";
  const lamps = [],
    motions = [],
    drawers = [];
  const named = (o, n) => ((o.name = "brutalist-" + n), o);
  function touch(o, name, message, action) {
    const e = { o, y: o.position.y, t: 1 };
    motions.push(e);
    register(o, name, "轻触互动", () => {
      e.t = 0;
      return action ? action() : message;
    });
    return o;
  }
  function cup(p, pos) {
    const g = pottery(p, pos, 0.38, m.ceramic, "bowl");
    torus(g, 0.065, 0.013, [0.085, 0.045, 0], m.ceramic, [0, 0, 0]);
    return g;
  }
  function cushion(p, pos, mat, w = 0.53) {
    const o = box(p, [w, 0.5, 0.19], pos, mat, 0.045);
    o.rotation.x = -0.13;
    return o;
  }
  function strip(p, pos, width, key = "floorLamp", power = 1.8) {
    const shade = m.glow.clone();
    box(p, [width, 0.025, 0.075], pos, shade).castShadow = false;
    root.updateMatrixWorld(true);
    lamps.push({
      shade,
      key,
      power,
      pos: p
        .localToWorld(
          new THREE.Vector3(...pos).add(new THREE.Vector3(0, -0.1, 0.18)),
        )
        .toArray(),
    });
    return shade;
  }
  function branches(p, pos, scale = 1) {
    const g = group(p, pos);
    g.scale.setScalar(scale);
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4,
        x = Math.cos(a) * 0.32,
        z = Math.sin(a) * 0.24,
        y = 0.48 + i * 0.065;
      tube(
        g,
        [
          [0, 0, 0],
          [x * 0.4, y * 0.6, z * 0.4],
          [x, y, z],
        ],
        0.007,
        m.dark,
      );
      for (let j = 0; j < 4; j++) {
        const leaf = sphere(
          g,
          [0.045, 0.075, 0.015],
          [x * 0.7 + (j % 2 ? 0.055 : -0.055), y - j * 0.075, z],
          m.leaf,
        );
        leaf.rotation.z = a;
      }
    }
    return g;
  }
  const bench = named(group(root, [-4.39, 0.025, 0.8]), "window-bench");
  bench.rotation.y = Math.PI / 2;
  box(bench, [5.65, 0.49, 0.66], [0, 0.245, 0], m.concrete, 0.015);
  box(bench, [4.27, 0.09, 0.69], [0.38, 0.535, 0], m.wood, 0.01);
  pottery(bench, [-2.38, 0.5, 0], 0.7, m.ceramic);
  box(bench, [0.76, 0.04, 0.74], [-1.17, 0.607, 0.02], m.throw, 0.013);
  box(bench, [0.76, 0.39, 0.035], [-1.17, 0.41, 0.405], m.throw, 0.01);
  touch(bench, "混凝土窗边长凳", "听一会儿窗外的风。");
  const shelf = named(group(root, [-2.65, 0.025, -4.38]), "recessed-storage");
  box(shelf, [3.13, 3.5, 0.065], [0, 1.78, -0.42], m.concrete);
  box(shelf, [3.1, 0.92, 0.9], [0, 0.46, 0], m.dark, 0.01);
  for (let i = 0; i < 4; i++) {
    const d = group(shelf, [-1.155 + i * 0.77, 0.48, 0.466]);
    box(d, [0.755, 0.83, 0.045], [0, 0, 0], m.wood, 0.005);
    drawers.push({ o: d, base: 0.466, key: "wardrobe" });
    register(d, "胡桃木无把手柜", "按压开启", () => {
      store.set("wardrobe", !store.state.wardrobe);
      return "将日常收进木色里。";
    });
  }
  for (const y of [0.97, 2.04, 3.12]) {
    box(shelf, [3.18, 0.095, 0.9], [0, y, 0], m.wood);
    if (y > 1) strip(shelf, [0, y - 0.064, 0.25], 2.94);
  }
  box(shelf, [0.11, 2.16, 0.79], [0.21, 2.05, 0], m.wall);
  books(shelf, [-1.37, 1.03, 0.03], m, 6, true);
  pottery(shelf, [-0.37, 1.03, 0.11], 0.92, m.ceramic);
  books(shelf, [0.91, 1.04, 0.14], m, 3);
  pottery(shelf, [1.12, 2.1, 0.12], 0.87, m.stone);
  books(shelf, [0.43, 2.1, 0.12], m, 4, true);
  books(shelf, [-0.57, 2.1, 0.13], m, 3);
  pottery(shelf, [-1.15, 2.1, 0.07], 0.66, m.ceramic);
  trailing(shelf, [-1.12, 3.18, 0.03], m, 0.59);
  pottery(shelf, [0.83, 3.18, 0], 0.61, m.ceramic);
  // A narrow illuminated alcove beside the structural pier.
  box(root, [0.56, 1.49, 0.075], [-0.59, 2, -4.11], m.dark);
  box(root, [0.6, 0.09, 0.35], [-0.59, 1.25, -4.02], m.wall);
  pottery(root, [-0.59, 1.3, -3.98], 0.9, m.stone);
  strip(root, [-0.59, 2.69, -4.02], 0.43, "floorLamp", 1.5);
  const desk = named(group(root, [2.16, 0.025, -3.98]), "writing-desk");
  box(desk, [3.83, 0.18, 0.98], [0, 1.08, 0], m.wood, 0.012);
  for (const x of [-1.77, 1.77])
    box(desk, [0.09, 1.02, 0.69], [x, 0.51, 0], m.black);
  const drawer = group(desk, [1.38, 0.025, 0.01]);
  box(drawer, [0.84, 0.95, 0.85], [0, 0.475, 0], m.stone);
  for (let i = 0; i < 3; i++) {
    const d = group(drawer, [0, 0.19 + i * 0.28, 0.44]);
    box(d, [0.79, 0.254, 0.045], [0, 0, 0], m.concrete);
    box(d, [0.14, 0.025, 0.02], [0, 0.05, 0.032], m.black);
    drawers.push({ o: d, base: 0.44, key: "drawer" });
    register(d, "工作台抽屉", "拉开 / 合上", () => {
      store.set("drawer", !store.state.drawer);
      return "整理一页安静的思绪。";
    });
  }
  box(desk, [0.58, 0.016, 0.4], [-0.2, 1.181, 0.04], m.paper, 0.005);
  box(desk, [0.008, 0.008, 0.39], [-0.2, 1.194, 0.04], m.dark);
  cup(desk, [0.65, 1.18, 0.12]);
  cylinder(desk, 0.085, 0.08, 0.21, [1.16, 1.28, -0.06], m.black);
  for (let i = 0; i < 4; i++)
    cylinder(
      desk,
      0.007,
      0.007,
      0.29,
      [1.13 + i * 0.017, 1.46, -0.06],
      m.dark,
      8,
    );
  const lamp = group(desk, [-1.24, 1.18, -0.1]);
  cylinder(lamp, 0.115, 0.13, 0.035, [0, 0.02, 0], m.black);
  cylinder(lamp, 0.025, 0.032, 0.35, [0, 0.2, 0], m.black);
  sphere(lamp, [0.26, 0.17, 0.26], [0, 0.43, 0], m.black);
  const shade = m.glow.clone();
  sphere(lamp, [0.21, 0.025, 0.21], [0, 0.38, 0], shade);
  root.updateMatrixWorld(true);
  lamps.push({
    shade,
    key: "bedLamp",
    power: 2.5,
    pos: lamp.localToWorld(new THREE.Vector3(0, 0.33, 0)).toArray(),
  });
  touch(lamp, "黑色圆顶台灯", "", () => {
    store.set("bedLamp", !store.state.bedLamp);
    return "留一盏暖灯。";
  });
  touch(desk, "胡桃木工作台", "空白的一页，不急着写满。");
  box(root, [2.5, 1.65, 0.055], [2.22, 2.56, -4.68], m.art);
  strip(root, [2.22, 3.42, -4.57], 2.6, "floorLamp", 2);
  const deskChair = group(root, [1.8, 0.025, -2.96]);
  deskChair.rotation.y = Math.PI;
  for (const x of [-0.37, 0.37])
    for (const z of [-0.34, 0.34])
      box(deskChair, [0.045, 0.65, 0.045], [x, 0.325, z], m.black);
  box(deskChair, [0.79, 0.15, 0.78], [0, 0.63, 0], m.leather, 0.025);
  box(deskChair, [0.8, 0.53, 0.13], [0, 0.94, -0.33], m.leather, 0.025);
  for (const x of [-0.39, 0.39])
    box(deskChair, [0.055, 0.055, 0.65], [x, 0.88, 0], m.black);
  // Fixed wall luminaire, restrained warm vertical slit.
  box(root, [0.16, 0.76, 0.12], [4.53, 2.19, -4.07], m.black, 0.015);
  const wallShade = m.glow.clone();
  box(root, [0.055, 0.58, 0.025], [4.53, 2.19, -3.995], wallShade);
  lamps.push({
    shade: wallShade,
    key: "floorLamp",
    power: 1.8,
    pos: [4.42, 2.2, -3.85],
  });
  const sofa = named(group(root, [-0.12, 0.035, -0.63]), "modular-sofa");
  box(sofa, [4.02, 0.17, 1.53], [0, 0.135, 0], m.black, 0.018);
  for (let i = 0; i < 3; i++) {
    const x = -1.32 + i * 1.32;
    box(sofa, [1.29, 0.43, 1.35], [x, 0.42, 0.07], m.fabric, 0.05);
    box(sofa, [1.29, 0.73, 0.3], [x, 0.78, -0.55], m.fabric, 0.04);
  }
  box(sofa, [1.3, 0.49, 0.78], [-1.32, 0.39, 1.09], m.fabric, 0.045);
  box(sofa, [0.25, 0.71, 2.12], [-2.03, 0.57, 0.45], m.fabric, 0.04);
  box(sofa, [0.66, 0.87, 1.51], [2.04, 0.445, 0.1], m.concrete, 0.018);
  cushion(sofa, [-1.32, 0.94, -0.31], m.rust, 0.64);
  cushion(sofa, [0.51, 0.94, -0.32], m.ochre, 0.56);
  cushion(sofa, [1.18, 0.94, -0.31], m.linen, 0.55);
  touch(sofa, "深灰模块沙发", "厚实的安静，留给慢下来的你。");
  const rug = named(
    box(root, [6.64, 0.027, 4.73], [0.14, 0.034, 1.42], m.rug),
    "geometric-rug",
  );
  const table = named(group(root, [0.04, 0.06, 1.85]), "concrete-coffee-table");
  box(table, [2.88, 0.19, 1.34], [0, 0.63, 0], m.concrete, 0.026);
  box(table, [2.87, 0.13, 1.32], [0, 0.115, 0], m.concrete, 0.018);
  for (const x of [-1.28, 1.28])
    box(table, [0.31, 0.5, 1.3], [x, 0.365, 0], m.concrete, 0.015);
  box(table, [2.52, 0.43, 0.1], [0, 0.36, -0.58], m.concrete);
  books(table, [-0.9, 0.19, 0.22], m, 2);
  books(table, [0.88, 0.19, 0.22], m, 2);
  box(table, [0.75, 0.06, 0.53], [-0.67, 0.765, -0.08], m.black, 0.03);
  pottery(table, [-0.68, 0.8, -0.08], 0.47, m.ceramic);
  branches(table, [-0.68, 1.12, -0.08], 0.65);
  books(table, [0.62, 0.734, 0.06], m, 2);
  cup(table, [0.94, 0.871, 0.04]);
  touch(table, "混凝土茶几", "石与木之间，一杯温热。");
  function chair(pos, angle, wood = false) {
    const g = group(root, pos);
    g.rotation.y = angle;
    box(g, [1.2, 0.17, 1.12], [0, 0.18, 0], wood ? m.wood : m.black, 0.015);
    for (const x of [-0.5, 0.5])
      for (const z of [-0.43, 0.43])
        box(
          g,
          [wood ? 0.19 : 0.11, 0.27, 0.19],
          [x, 0.135, z],
          wood ? m.wood : m.black,
        );
    box(g, [1.01, 0.29, 1], [0, 0.395, 0.04], m.leather, 0.055);
    const back = box(g, [1.06, 0.76, 0.23], [0, 0.82, -0.44], m.leather, 0.055);
    back.rotation.x = -0.16;
    for (const x of [-0.59, 0.59]) {
      box(
        g,
        [0.19, 0.51, 1.12],
        [x, 0.55, 0],
        wood ? m.wood : m.leather,
        0.025,
      );
      box(g, [0.2, 0.07, 1.16], [x, 0.84, 0], wood ? m.wood : m.leather, 0.02);
    }
    for (const x of [-0.26, 0.26])
      box(g, [0.006, 0.008, 0.87], [x, 0.544, 0.04], m.dark);
    touch(
      g,
      wood ? "胡桃木皮革休闲椅" : "黑色皮革休闲椅",
      "在厚重的轮廓中歇一会儿。",
    );
    return g;
  }
  named(chair([-2.6, 0.03, 2.75], 2.6), "black-lounge-chair");
  named(chair([3.15, 0.03, 1.97], -1.83, true), "walnut-lounge-chair");
  const side = named(group(root, [-0.91, 0.03, 3.63]), "cylinder-side-table");
  cylinder(side, 0.31, 0.32, 0.65, [0, 0.325, 0], m.concrete);
  cup(side, [0, 0.65, 0]);
  touch(side, "混凝土圆柱边桌", "一口温热，片刻停留。");
  const pouf = named(group(root, [2.19, 0.035, 3.64]), "rust-ottoman");
  box(pouf, [1.23, 0.43, 1.02], [0, 0.28, 0], m.rust, 0.065);
  box(pouf, [1.05, 0.13, 0.84], [0, 0.075, 0], m.black, 0.02);
  for (const x of [-0.3, 0, 0.3])
    box(pouf, [0.009, 0.008, 0.87], [x, 0.5, 0], m.taupe, 0.003);
  box(pouf, [1.07, 0.008, 0.009], [0, 0.5, 0], m.taupe, 0.003);
  touch(pouf, "铁锈色方形软墩", "一抹温暖，落在灰色之间。");
  const tree = named(group(root, [4.18, 0.025, -2.21]), "sparse-tree");
  cylinder(tree, 0.36, 0.34, 0.71, [0, 0.355, 0], m.stone);
  cylinder(tree, 0.329, 0.329, 0.018, [0, 0.718, 0], m.soil);
  branches(tree, [0, 0.73, 0], 2.05);
  register(shelf, "凹龛暖光", "开启 / 关闭", () => {
    store.set("floorLamp", !store.state.floorLamp);
    return "暖光描出混凝土的深度。";
  });
  return {
    root,
    lamps,
    update(dt) {
      for (const e of motions) {
        e.t = Math.min(1, e.t + dt * 1.8);
        e.o.position.y = e.y + Math.sin(e.t * Math.PI) * 0.022;
      }
      for (const d of drawers)
        d.o.position.z = damp(
          d.o.position.z,
          d.base + (store.state[d.key] ? 0.27 : 0),
          dt,
          3,
        );
    },
    reset() {
      for (const e of motions) {
        e.t = 1;
        e.o.position.y = e.y;
      }
      for (const d of drawers) d.o.position.z = d.base;
    },
  };
}
