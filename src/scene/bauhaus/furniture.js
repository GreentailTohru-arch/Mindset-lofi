import * as THREE from "three";
import {
  box,
  cylinder,
  sphere,
  torus,
  tube,
  group,
  plant,
} from "../primitives.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "包豪斯 · 工作与休息";
  const pulses = [],
    lamps = [];
  const touch = (obj, name, message) => {
    const p = { obj, y: obj.position.y, v: 0 };
    pulses.push(p);
    register(obj, name, "轻点互动", () => {
      p.v = 1;
      return message;
    });
  };
  function book(parent, pos, w = 0.45, cover = m.red) {
    const g = group(parent, pos);
    box(g, [w, 0.067, 0.32], [0, 0, 0], m.paper, 0.003);
    for (const y of [-0.039, 0.039])
      box(g, [w + 0.015, 0.012, 0.34], [0, y, 0], cover, 0.002);
    return g;
  }
  function ceramicVase(parent, pos, scale = 1, color = m.ceramic) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    const points = [
      [0.13, 0],
      [0.2, 0.05],
      [0.22, 0.21],
      [0.17, 0.34],
      [0.09, 0.39],
      [0.09, 0.54],
    ].map((p) => new THREE.Vector2(...p));
    const body = new THREE.Mesh(new THREE.LatheGeometry(points, 28), color);
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);
    torus(g, 0.09, 0.013, [0, 0.54, 0], color);
    cylinder(g, 0.072, 0.072, 0.012, [0, 0.5, 0], m.charcoal);
    return g;
  }
  function chair(pos, angle = 0, scale = 1) {
    const g = group(root, pos);
    g.rotation.y = angle;
    g.scale.setScalar(scale);
    // Continuous cantilever steel rails, with suspended leather seat and back.
    for (const x of [-0.43, 0.43]) {
      tube(
        g,
        [
          [x, 0.07, -0.4],
          [x, 0.07, 0.45],
          [x, 0.14, 0.51],
          [x, 0.57, 0.47],
          [x, 0.63, 0.35],
          [x, 0.63, -0.25],
          [x, 1.18, -0.43],
        ],
        0.022,
        m.steel,
      );
      tube(
        g,
        [
          [x, 0.55, 0.37],
          [x, 0.83, 0.38],
          [x, 0.87, 0.27],
          [x, 0.87, -0.3],
        ],
        0.019,
        m.steel,
      );
    }
    for (const z of [-0.33, 0.36])
      tube(
        g,
        [
          [-0.43, 0.57, z],
          [0.43, 0.57, z],
        ],
        0.018,
        m.steel,
      );
    box(g, [0.78, 0.055, 0.72], [0, 0.59, 0.02], m.leather, 0.025);
    const back = box(
      g,
      [0.77, 0.48, 0.045],
      [0, 0.96, -0.37],
      m.leather,
      0.025,
    );
    back.rotation.x = -0.16;
    for (const x of [-0.43, 0.43])
      box(g, [0.09, 0.026, 0.48], [x, 0.884, 0.015], m.leather, 0.012);
    touch(g, "钢管皮革椅", "轻轻落座 · 留一点松弛");
    return g;
  }
  function lamp(parent, pos, key, height = 1.95) {
    const g = group(parent, pos),
      glow = m.glow.clone();
    cylinder(g, 0.2, 0.22, 0.035, [0, 0.03, 0], m.charcoal);
    cylinder(
      g,
      0.014,
      0.014,
      height - 0.22,
      [0, (height - 0.22) / 2 + 0.045, 0],
      m.steel,
      12,
    );
    tube(
      g,
      [
        [0, height - 0.18, 0],
        [0, height, 0],
        [0.2, height + 0.015, 0],
        [0.28, height - 0.08, 0],
      ],
      0.015,
      m.steel,
    );
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
      m.charcoal,
    );
    dome.position.set(0.28, height - 0.15, 0);
    dome.castShadow = true;
    g.add(dome);
    cylinder(g, 0.201, 0.201, 0.018, [0.28, height - 0.157, 0], glow);
    g.updateWorldMatrix(true, false);
    lamps.push({
      shade: glow,
      key,
      pos: g.localToWorld(new THREE.Vector3(0.28, height - 0.24, 0)),
      intensity: height > 1 ? 4.3 : 2.3,
    });
    register(g, height > 1 ? "半球落地灯" : "书桌台灯", "点亮 / 熄灭", () => {
      store.set(key, !store.state[key]);
      return store.state[key] ? "暖灯亮起 · 恰好的温度" : "灯光熄灭";
    });
    return g;
  }

  // Work bay under the large side window.
  const desk = group(root, [-3.88, 0, 0.82]);
  desk.rotation.y = Math.PI / 2;
  box(desk, [2.91, 0.09, 1.03], [0, 0.98, 0], m.oak, 0.015);
  for (const x of [-1.31, 1.31])
    for (const z of [-0.4, 0.4]) {
      cylinder(desk, 0.019, 0.019, 0.92, [x, 0.49, z], m.steel, 12);
      cylinder(desk, 0.026, 0.026, 0.025, [x, 0.034, z], m.charcoal, 12);
    }
  const drawer = group(desk, [-0.92, 0.63, 0]);
  box(drawer, [0.62, 0.54, 0.8], [0, 0, 0], m.red, 0.015);
  const drawerFront = group(drawer, [0, 0.04, 0.414]);
  box(drawerFront, [0.56, 0.38, 0.06], [0, 0, 0], m.red, 0.009);
  box(drawerFront, [0.14, 0.028, 0.035], [0, 0.08, 0.055], m.steel, 0.007);
  box(drawerFront, [0.48, 0.034, 0.65], [0, -0.17, -0.3], m.oak);
  register(drawerFront, "书桌抽屉", "打开 / 合上", () => {
    store.set("drawer", !store.state.drawer);
    return store.state.drawer ? "抽屉滑出 · 把琐事收好" : "抽屉归位";
  });
  lamp(desk, [-1.03, 1.033, -0.18], "bedLamp", 0.38);
  const notebook = group(desk, [0.01, 1.037, 0.06]);
  for (const s of [-1, 1]) {
    const page = box(
      notebook,
      [0.29, 0.015, 0.4],
      [s * 0.148, 0.01, 0],
      m.paper,
      0.003,
    );
    page.rotation.z = s * 0.05;
  }
  const pencil = cylinder(
    notebook,
    0.008,
    0.008,
    0.27,
    [0.15, 0.035, 0.08],
    m.yellow,
    6,
  );
  pencil.rotation.z = Math.PI / 2;
  touch(notebook, "素面笔记本", "翻开一页 · 留给新的想法");
  book(desk, [0.98, 1.08, -0.13], 0.45, m.sage);
  book(desk, [0.96, 1.17, -0.13], 0.44, m.charcoal);
  const cup = cylinder(
    desk,
    0.065,
    0.058,
    0.14,
    [0.55, 1.106, -0.26],
    m.ceramic,
  );
  cylinder(desk, 0.056, 0.056, 0.004, [0.55, 1.178, -0.26], m.charcoal);
  for (let i = 0; i < 4; i++) {
    const p = cylinder(
      cup,
      0.006,
      0.006,
      0.22,
      [(i - 1.5) * 0.019, 0.1, 0],
      m.yellow,
      6,
    );
    p.rotation.z = (i - 1.5) * 0.08;
  }
  chair([-2.38, 0, 0.82], -Math.PI / 2, 0.92);
  touch(desk, "橡木书桌", "日光为伴 · 专注于眼前");

  // Modular open storage, without a music player or turntable.
  const shelf = group(root, [-2.07, 0, -4.38]);
  for (const x of [-1.36, 0, 1.36])
    for (const z of [-0.3, 0.32])
      cylinder(shelf, 0.016, 0.016, 3.05, [x, 1.54, z], m.steel, 10);
  for (const y of [0.18, 0.92, 1.65, 2.39, 3.06])
    box(shelf, [2.88, 0.058, 0.79], [0, y, 0], m.oak, 0.006);
  box(shelf, [1.21, 0.62, 0.62], [-0.69, 0.56, 0], m.blue, 0.012);
  box(shelf, [1.21, 0.62, 0.62], [0.69, 0.56, 0], m.paper, 0.012);
  for (const x of [-0.68, 0.68])
    box(shelf, [0.17, 0.022, 0.035], [x, 0.66, 0.337], m.charcoal, 0.006);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 7; i++) {
      const left = row % 2 === 0 ? -1.08 : 0.18;
      const b = book(
        shelf,
        [left + i * 0.13, 1.18 + row * 0.735, 0.03],
        0.43 + (i % 3) * 0.035,
        [m.charcoal, m.sage, m.red, m.paper][i % 4],
      );
      b.rotation.z = Math.PI / 2;
    }
    for (let i = 0; i < 3; i++)
      book(
        shelf,
        [row % 2 === 0 ? 0.8 : -0.76, 0.99 + row * 0.735 + i * 0.092, 0.015],
        0.47,
        m.sage,
      );
  }
  const topVase = ceramicVase(shelf, [-0.79, 3.095, 0], 0.65, m.yellow);
  touch(topVase, "芥末黄花器", "一抹暖色 · 恰到好处");
  touch(shelf, "模块化书架", "书与留白 · 各得其所");
  lamp(root, [-0.28, 0, -3.08], "floorLamp", 1.98);
  chair([-1.32, 0, -2.42], 0.34, 1.05);

  const cabinet = group(root, [2.24, 0, -4.43]);
  box(cabinet, [3.37, 0.74, 0.81], [0, 0.62, 0], m.paper, 0.012);
  box(cabinet, [3.46, 0.065, 0.88], [0, 1.02, 0], m.oak, 0.012);
  for (const x of [-1.48, 1.48])
    for (const z of [-0.3, 0.3])
      cylinder(cabinet, 0.017, 0.017, 0.25, [x, 0.14, z], m.steel, 10);
  for (const x of [-0.56, 0.56])
    box(cabinet, [0.016, 0.69, 0.02], [x, 0.62, 0.418], m.trim);
  for (const x of [-1.1, 0, 1.1])
    box(cabinet, [0.12, 0.018, 0.032], [x, 0.84, 0.442], m.charcoal, 0.004);
  const cabinetVase = ceramicVase(cabinet, [-1.13, 1.056, 0], 0.82, m.sage);
  for (let i = 0; i < 4; i++) {
    const a = i * 2.3;
    const tip = [Math.cos(a) * 0.23, 0.93 + i * 0.1, Math.sin(a) * 0.18];
    tube(cabinetVase, [[0, 0.43, 0], tip], 0.006, m.leaf);
    for (let j = 0; j < 3; j++) {
      const leaf = sphere(
        cabinetVase,
        [0.033, 0.11, 0.01],
        [tip[0] + j * 0.03, tip[1] - 0.15 + j * 0.07, tip[2]],
        m.leafLight,
      );
      leaf.rotation.z = 0.9;
    }
  }
  touch(cabinetVase, "陶瓷枝叶花器", "少即是多 · 看一枝新绿");
  book(cabinet, [0, 1.11, 0], 0.48, m.red);
  book(cabinet, [0.04, 1.2, 0], 0.46, m.charcoal);
  // Three solid geometry objects, not a record/player.
  box(cabinet, [0.18, 0.24, 0.18], [1.03, 1.18, 0], m.yellow);
  sphere(cabinet, [0.13, 0.13, 0.13], [1.32, 1.19, 0], m.blue);
  touch(cabinet, "低矮收纳柜", "理清空间 · 也理清思绪");

  const rug = box(root, [5.45, 0.044, 4.65], [0.36, 0.054, 1.18], m.rug, 0.018);
  for (const [x, z, w, d, color] of [
    [-0.65, -0.83, 2.8, 0.11, m.red],
    [-2.03, 2.52, 0.12, 1.2, m.charcoal],
  ])
    box(root, [w, 0.009, d], [x, 0.081, z], color);
  touch(rug, "编织地毯", "柔软脚步 · 放慢一点");
  const sofa = group(root, [2.95, 0, 2.04]);
  sofa.rotation.y = -Math.PI / 2;
  for (const x of [-1.29, 1.29])
    for (const z of [-0.37, 0.37])
      cylinder(sofa, 0.022, 0.022, 0.18, [x, 0.11, z], m.charcoal, 10);
  box(sofa, [3.07, 0.28, 1.16], [0, 0.35, 0], m.fabric, 0.065);
  for (const x of [-0.98, 0, 0.98]) {
    box(sofa, [0.94, 0.2, 0.86], [x, 0.585, 0.105], m.fabric, 0.065);
    const back = box(
      sofa,
      [0.94, 0.62, 0.22],
      [x, 0.79, -0.42],
      m.fabric,
      0.065,
    );
    back.rotation.x = -0.06;
  }
  for (const x of [-1.49, 1.49])
    box(sofa, [0.2, 0.5, 1.07], [x, 0.6, 0], m.fabric, 0.055);
  for (const [x, color] of [
    [-0.87, m.red],
    [0.82, m.blue],
  ]) {
    const pillow = box(sofa, [0.49, 0.35, 0.17], [x, 0.86, -0.2], color, 0.075);
    pillow.rotation.z = x * 0.11;
    pillow.rotation.x = -0.12;
  }
  touch(sofa, "几何模块沙发", "靠一会儿 · 让时间慢下来");
  const pouf = box(
    root,
    [0.85, 0.52, 0.85],
    [2.18, 0.31, -0.98],
    m.yellow,
    0.12,
  );
  touch(pouf, "芥末黄软墩", "换个位置 · 换个心情");
  for (const x of [-0.22, 0.22])
    box(pouf, [0.006, 0.004, 0.68], [x, 0.264, 0], m.oak);

  const tables = [];
  for (const [pos, r, h, color] of [
    [[0.08, 0, 1.1], 0.75, 0.48, m.charcoal],
    [[-0.9, 0, 1.98], 0.44, 0.36, m.oak],
  ]) {
    const g = group(root, pos);
    cylinder(
      g,
      r * 0.66,
      r * 0.66,
      h - 0.08,
      [0, (h - 0.08) / 2 + 0.04, 0],
      m.charcoal,
      40,
    );
    cylinder(g, r, r, 0.045, [0, h, 0], color, 48);
    tables.push(g);
    touch(g, "圆形组合茶几", "圆与圆 · 相伴而不拥挤");
  }
  const vase = ceramicVase(tables[0], [-0.2, 0.505, -0.07], 0.6, m.ceramic);
  touch(vase, "白陶花器", "器物无声 · 日常有光");
  for (let i = 0; i < 3; i++) {
    const a = i * 2.4;
    const tip = [Math.cos(a) * 0.23, 0.87 + i * 0.09, Math.sin(a) * 0.17];
    tube(vase, [[0, 0.45, 0], tip], 0.009, m.leaf);
    const leaf = sphere(vase, [0.075, 0.2, 0.018], tip, m.leaf);
    leaf.rotation.z = a;
  }
  book(tables[0], [0.32, 0.54, 0.18], 0.34, m.red);
  book(tables[0], [0.31, 0.63, 0.18], 0.32, m.paper);
  const mug = group(tables[1], [0, 0.389, 0]);
  cylinder(mug, 0.075, 0.06, 0.105, [0, 0.063, 0], m.ceramic);
  cylinder(mug, 0.062, 0.062, 0.005, [0, 0.119, 0], m.oak);
  torus(mug, 0.04, 0.01, [0.085, 0.07, 0], m.ceramic, [0, 0, 0]);
  touch(mug, "陶瓷咖啡杯", "一口温热 · 一段留白");
  for (const [pos, scale] of [
    [[-4.17, 0, 3.91], 1.1],
    [[4.19, 0, -3.46], 1.32],
  ]) {
    const p = plant(root, pos, scale, m);
    touch(p, "室内绿植", "看看绿色 · 休息一下");
  }
  return {
    root,
    lamps,
    update(dt) {
      drawerFront.position.z = damp(
        drawerFront.position.z,
        store.state.drawer ? 0.77 : 0.414,
        dt,
        3,
      );
      for (const p of pulses) {
        p.v = damp(p.v, 0, dt, 3);
        p.obj.position.y = p.y + Math.sin(p.v * Math.PI) * 0.018;
      }
    },
    reset() {
      for (const p of pulses) {
        p.v = 0;
        p.obj.position.y = p.y;
      }
    },
  };
}
