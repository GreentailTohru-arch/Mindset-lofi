import * as THREE from "three";
import {
  box,
  group,
  cylinder,
  sphere,
  torus,
  tube,
  plant,
} from "../primitives.js";
import { pottery } from "../wabisabi/forms.js";
import {
  stackedBooks,
  basket,
  foldedCloth,
  cloth,
  blossoms,
} from "./details.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, registerItem) {
  const root = group(scene);
  root.name = "machiya-furniture";
  const lamps = [],
    drawers = [],
    lifts = [],
    doors = [];
  let warmth = 0;
  function register(o, name, hint, action, lift = true) {
    const motion = { object: o, baseY: o.position.y, elapsed: 0.7 };
    if (lift) lifts.push(motion);
    registerItem(o, name, hint, () => {
      motion.elapsed = 0;
      return action();
    });
  }
  const touch = (o, name, message) => register(o, name, "轻触", () => message);
  function books(p, x, y, z, count) {
    for (let i = 0; i < count; i++) {
      const h = 0.29 + (i % 3) * 0.045;
      box(
        p,
        [0.09, h, 0.24],
        [x + i * 0.105, y + h / 2, z],
        [m.indigo, m.book, m.lacquer][i % 3],
        0.006,
      );
      box(p, [0.067, h - 0.035, 0.246], [x + i * 0.105, y + h / 2, z], m.pages);
    }
  }
  function lamp(pos, scale, key, name, power = 3.8) {
    const g = group(root, pos);
    g.scale.setScalar(scale);
    box(g, [0.42, 0.06, 0.42], [0, 0.03, 0], m.dark, 0.015);
    const shade = box(
      g,
      [0.32, 0.53, 0.32],
      [0, 0.335, 0],
      m.glow.clone(),
      0.025,
    );
    shade.castShadow = false;
    for (const x of [-0.185, 0.185])
      for (const z of [-0.185, 0.185])
        box(g, [0.024, 0.6, 0.024], [x, 0.34, z], m.dark);
    for (const y of [0.095, 0.29, 0.48, 0.62]) {
      for (const x of [-0.19, 0.19])
        box(g, [0.022, 0.022, 0.4], [x, y, 0], m.dark);
      for (const z of [-0.19, 0.19])
        box(g, [0.4, 0.022, 0.022], [0, y, z], m.dark);
    }
    lamps.push({
      shade: shade.material,
      key,
      pos: [pos[0], pos[1] + scale * 0.34, pos[2]],
      power,
    });
    register(g, name, "开关", () => {
      store.set(key, !store.state[key]);
      return store.state[key] ? "纸灯亮起，暖光如初。" : "灯火暂歇。";
    });
    return g;
  }
  // The rear tokonoma is deliberately separate from the everyday storage.
  const alcove = group(root, [-0.45, 0, -4.36]);
  alcove.name = "machiya-tokonoma";
  box(alcove, [2.6, 0.23, 1.03], [0, 0.225, 0], m.wood, 0.018);
  box(alcove, [2.57, 2.47, 0.08], [0, 1.58, -0.46], m.wall);
  for (const x of [-1.33, 1.33])
    box(alcove, [0.1, 2.86, 0.98], [x, 1.54, 0], m.dark);
  box(alcove, [2.75, 0.15, 1.03], [0, 2.96, 0], m.dark);
  box(alcove, [0.82, 1.8, 0.026], [-0.2, 1.85, -0.395], m.border);
  const scroll = box(alcove, [0.65, 1.3, 0.018], [-0.2, 1.85, -0.374], m.paper);
  scroll.name = "blank-scroll";
  for (const y of [0.93, 2.77]) {
    const rod = cylinder(alcove, 0.021, 0.021, 0.92, [-0.2, y, -0.36], m.wood);
    rod.rotation.z = Math.PI / 2;
  }
  register(scroll, "空白挂轴", "静观", () => "留白，容得下一整晚。", false);
  const vase = pottery(alcove, [-0.72, 0.344, 0.12], 0.57, m.ceramic);
  blossoms(alcove, [-0.72, 0.67, 0.12], m, 1.35);
  touch(vase, "梅枝插花", "几枝花，半室香。");
  const bonsai = group(alcove, [0.79, 0.35, 0.12]);
  box(bonsai, [0.54, 0.13, 0.36], [0, 0.065, 0], m.charcoal, 0.04);
  box(bonsai, [0.46, 0.01, 0.28], [0, 0.136, 0], m.soil, 0.02);
  tube(
    bonsai,
    [
      [0, 0.13, 0],
      [-0.08, 0.34, 0],
      [0.1, 0.54, 0],
      [0.05, 0.72, 0.04],
    ],
    0.035,
    m.wood,
  );
  for (let i = 0; i < 5; i++)
    sphere(
      bonsai,
      [0.22, 0.085, 0.15],
      [Math.sin(i * 2) * 0.17, 0.35 + i * 0.1, Math.cos(i) * 0.08],
      i % 2 ? m.leaf : m.moss,
    );
  touch(bonsai, "盆景", "一寸青山，静静生长。");
  const incense = group(alcove, [0.07, 0.35, 0.22]);
  cylinder(incense, 0.11, 0.13, 0.09, [0, 0.045, 0], m.bronze);
  cylinder(incense, 0.092, 0.092, 0.009, [0, 0.093, 0], m.soil);
  tube(
    incense,
    [
      [0, 0.098, 0],
      [0.015, 0.25, 0],
    ],
    0.003,
    m.red,
  );
  touch(incense, "香器", "一缕清香，慢慢散开。");

  // Full-height tansu: open display shelves, drawer bank and a hinged door.
  const cabinet = group(root, [3.11, 0, -4.38]);
  cabinet.name = "machiya-tansu";
  box(cabinet, [3.03, 2.78, 0.07], [0, 1.53, -0.43], m.dark);
  for (const x of [-1.51, 1.51])
    box(cabinet, [0.12, 2.94, 0.94], [x, 1.6, 0], m.dark);
  for (const y of [0.18, 1.62, 2.25, 3.07])
    box(cabinet, [3.16, 0.1, 1.01], [0, y, 0], m.wood, 0.012);
  box(cabinet, [0.08, 2.83, 0.88], [0.55, 1.61, 0], m.dark);
  for (let i = 0; i < 3; i++) {
    const g = group(cabinet, [-0.48, 0.43 + i * 0.43, 0.03]);
    box(g, [1.78, 0.36, 0.74], [0, 0, 0], m.wood);
    box(g, [1.96, 0.39, 0.065], [0, 0, 0.43], m.lacquer, 0.008);
    for (const x of [-0.52, 0.52]) {
      box(g, [0.1, 0.11, 0.012], [x, 0.02, 0.471], m.iron, 0.02);
      torus(g, 0.048, 0.009, [x, 0, 0.489], m.bronze, [0, 0, 0]);
    }
    const d = { object: g, open: false };
    drawers.push(d);
    register(
      g,
      i === 0 ? "杉木收纳抽屉" : `箪笥抽屉 ${i + 1}`,
      "拉开 / 收起",
      () => {
        d.open = !d.open;
        return d.open ? "收好纸笔，也收好今日。" : "抽屉已收好。";
      },
      false,
    );
  }
  const door = group(cabinet, [1.43, 0.88, 0.47]);
  box(door, [0.81, 1.3, 0.065], [-0.405, 0, 0], m.lacquer, 0.01);
  for (const x of [-0.73, -0.08])
    box(door, [0.035, 1.25, 0.023], [x, 0, 0.048], m.wood);
  torus(door, 0.045, 0.008, [-0.67, 0.03, 0.054], m.bronze, [0, 0, 0]);
  const doorState = { object: door, open: false };
  doors.push(doorState);
  foldedCloth(cabinet, [0.99, 0.23, 0.02], m, 4);
  register(
    door,
    "箪笥柜门",
    "打开 / 合上",
    () => {
      doorState.open = !doorState.open;
      return doorState.open ? "柜中是叠好的布巾。" : "柜门轻轻合上。";
    },
    false,
  );
  books(cabinet, -1.3, 1.67, 0, 12);
  pottery(cabinet, [0.98, 1.67, 0.03], 0.56, m.ceramic, "bowl");
  books(cabinet, -0.75, 2.3, 0, 8);
  const jar = pottery(cabinet, [-1.16, 2.3, 0.01], 0.53, m.iron);
  touch(jar, "陶罐", "陶土温润，收着岁月。");
  const bin = box(
    cabinet,
    [0.68, 0.32, 0.58],
    [0.99, 2.46, 0.01],
    m.border,
    0.028,
  );
  box(cabinet, [0.18, 0.045, 0.01], [0.99, 2.48, 0.306], m.linen, 0.01);
  touch(bin, "布艺收纳盒", "把零碎物件妥善收起。");
  const foliage = plant(cabinet, [0.95, 3.12, 0.04], 0.4, m);
  touch(foliage, "柜上绿植", "枝叶在灯下投出小小的影子。");
  stackedBooks(cabinet, [-1.05, 3.12, 0.04], m, 2);
  // Compact chest anchors the far corner without filling the circulation space.
  const chest = group(root, [-2.5, 0.115, -4.22]);
  box(chest, [0.83, 1.17, 0.78], [0, 0.585, 0], m.lacquer, 0.018);
  for (let i = 0; i < 4; i++) {
    box(
      chest,
      [0.75, 0.245, 0.028],
      [0, 0.16 + i * 0.27, 0.402],
      m.wood,
      0.005,
    );
    torus(chest, 0.035, 0.007, [0, 0.17 + i * 0.27, 0.428], m.iron, [0, 0, 0]);
  }
  touch(chest, "角落抽屉柜", "一角木香，一室安然。");
  plant(chest, [0, 1.17, -0.04], 0.53, m);

  // Right-side floor bedding: soft raised seams and a patterned indigo pillow.
  const futon = group(root, [3.63, 0.116, 1.65]);
  futon.name = "machiya-futon";
  box(futon, [1.86, 0.15, 3.55], [0, 0.075, 0], m.linen, 0.12);
  box(futon, [1.77, 0.17, 2.64], [0, 0.2, 0.36], m.indigo, 0.15);
  cloth(futon, 1.68, 2.46, [0, 0.29, 0.38], m.indigo, 0.012);
  box(futon, [1.7, 0.095, 0.38], [0, 0.278, -0.71], m.linen, 0.06);
  cloth(futon, 1.64, 0.36, [0, 0.33, -0.72], m.linen, 0.013);
  box(futon, [1.17, 0.2, 0.53], [0, 0.22, -1.34], m.linen, 0.12);
  box(futon, [0.67, 0.17, 0.45], [0.27, 0.31, -1.27], m.patterned, 0.07);
  for (let i = 0; i < 8; i++) {
    const z = -0.55 + i * 0.29;
    tube(
      futon,
      [
        [-0.8, 0.291, z],
        [-0.35, 0.308, z + 0.015],
        [0.15, 0.306, z],
        [0.79, 0.29, z + 0.02],
      ],
      0.0025,
      m.book,
    );
  }
  touch(futon, "铺好的被褥", "茶凉之前，不急着入梦。");
  box(root, [0.56, 0.36, 0.6], [4.32, 0.296, -0.74], m.wood, 0.018);
  lamp([4.32, 0.476, -0.74], 0.73, "bedLamp", "枕边纸灯", 3.5);
  plant(root, [4.45, 0.116, -1.78], 0.49, m);

  // The tea circle is the visual center, surrounded by three zabuton.
  const tea = group(root, [0.28, 0.116, 0.05]);
  tea.name = "machiya-round-tea-table";
  cylinder(tea, 1.07, 1.07, 0.105, [0, 0.55, 0], m.lacquer, 64);
  torus(tea, 1.055, 0.012, [0, 0.602, 0], m.wood);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    box(
      tea,
      [0.105, 0.5, 0.105],
      [Math.cos(a) * 0.72, 0.25, Math.sin(a) * 0.72],
      m.dark,
      0.01,
    );
  }
  box(tea, [0.79, 0.035, 0.53], [0.05, 0.62, 0], m.charcoal, 0.025);
  const kettle = group(tea, [0.03, 0.642, -0.07]);
  sphere(kettle, [0.185, 0.145, 0.17], [0, 0.14, 0], m.iron);
  cylinder(kettle, 0.115, 0.12, 0.023, [0, 0.269, 0], m.iron);
  sphere(kettle, [0.026, 0.025, 0.026], [0, 0.295, 0], m.bronze);
  tube(
    kettle,
    [
      [0.12, 0.14, 0],
      [0.24, 0.19, 0],
      [0.285, 0.27, 0],
    ],
    0.033,
    m.iron,
  );
  torus(kettle, 0.187, 0.014, [0, 0.24, 0], m.iron, [0, 0, 0], Math.PI);
  register(kettle, "铁壶", "温茶", () => {
    warmth = 1;
    return "温一壶茶，听庭院的风。";
  });
  for (const [x, z] of [
    [-0.24, 0.2],
    [0.32, 0.2],
    [0.61, -0.27],
  ]) {
    cylinder(tea, 0.12, 0.12, 0.014, [x, 0.613, z], m.wood);
    pottery(tea, [x, 0.625, z], 0.23, m.ceramic, "bowl");
  }
  stackedBooks(tea, [-0.43, 0.604, 0.6], m, 2);
  pottery(tea, [-0.49, 0.605, -0.44], 0.33, m.ceramic);
  blossoms(tea, [-0.49, 0.79, -0.44], m, 0.54);
  touch(tea, "圆形矮茶几", "一盏茶，三处安坐。");
  for (const [x, z, a] of [
    [-0.22, 1.76, -0.08],
    [-1.23, -0.18, 0.17],
    [1.54, -0.88, -0.23],
  ]) {
    const g = group(root, [x, 0.12, z]);
    g.rotation.y = a;
    box(g, [0.94, 0.14, 0.89], [0, 0.07, 0], m.border, 0.11);
    for (const dx of [-0.39, 0.39])
      box(g, [0.008, 0.01, 0.7], [dx, 0.134, 0], m.book, 0.003);
    sphere(g, [0.025, 0.01, 0.025], [0, 0.148, 0], m.indigo);
    touch(g, "坐垫", "坐下来，让时间慢一点。");
  }
  const steam = [];
  for (let i = 0; i < 4; i++) {
    const s = sphere(
      tea,
      [0.022, 0.065, 0.022],
      [0.03, 1, 0],
      new THREE.MeshBasicMaterial({
        color: "#e4e1d2",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    s.castShadow = false;
    steam.push(s);
  }

  // Foreground writing area and low everyday storage frame the open center.
  const desk = group(root, [-1.75, 0.116, 3.23]);
  desk.name = "machiya-writing-desk";
  box(desk, [1.86, 0.1, 1.03], [0, 0.58, 0], m.lacquer, 0.024);
  for (const x of [-0.78, 0.78])
    for (const z of [-0.37, 0.37])
      box(desk, [0.09, 0.54, 0.09], [x, 0.28, z], m.dark);
  box(desk, [0.6, 0.009, 0.44], [0.07, 0.636, 0.05], m.pages, 0.003);
  box(desk, [0.58, 0.008, 0.43], [0.09, 0.646, 0.025], m.paper, 0.003);
  const ink = box(
    desk,
    [0.19, 0.035, 0.26],
    [0.54, 0.648, 0.12],
    m.stone,
    0.028,
  );
  box(desk, [0.13, 0.005, 0.17], [0.54, 0.667, 0.12], m.charcoal, 0.02);
  touch(ink, "砚台", "磨墨之前，先静下心。");
  tube(
    desk,
    [
      [0.38, 0.657, -0.19],
      [0.4, 0.657, 0.16],
    ],
    0.009,
    m.bamboo,
  );
  tube(
    desk,
    [
      [0.4, 0.657, 0.16],
      [0.405, 0.657, 0.23],
    ],
    0.008,
    m.iron,
  );
  stackedBooks(desk, [-0.52, 0.632, 0.17], m, 3);
  lamp([-2.33, 0.746, 2.94], 0.57, "floorLamp", "书案台灯", 3.8);
  const brushes = group(desk, [0.63, 0.635, -0.29]);
  cylinder(brushes, 0.054, 0.047, 0.14, [0, 0.07, 0], m.ceramic);
  for (let i = 0; i < 3; i++)
    tube(
      brushes,
      [
        [i * 0.017 - 0.017, 0.09, 0],
        [i * 0.03 - 0.03, 0.31 + i * 0.018, 0],
      ],
      0.005,
      m.bamboo,
    );
  touch(brushes, "笔筒", "纸笔整齐，心也安定。");
  touch(desk, "读书案", "纸上留白，夜色正好。");
  const deskSeat = box(
    root,
    [0.88, 0.12, 0.78],
    [-1.65, 0.176, 4.23],
    m.indigo,
    0.08,
  );
  touch(deskSeat, "书案坐垫", "临窗而坐，慢慢落笔。");
  const shelf = group(root, [1.22, 0.116, 4.22]);
  shelf.name = "machiya-foreground-shelf";
  for (const y of [0.065, 0.68])
    box(shelf, [2.05, 0.095, 0.62], [0, y, 0], m.wood, 0.012);
  for (const x of [-0.98, 0, 0.98])
    box(shelf, [0.085, 0.57, 0.61], [x, 0.37, 0], m.dark);
  box(shelf, [1.92, 0.52, 0.04], [0, 0.38, -0.29], m.dark);
  books(shelf, -0.83, 0.113, 0.02, 7);
  const b = basket(shelf, [0.49, 0.115, 0], m, 0.88);
  foldedCloth(b, [0, 0.29, 0], m, 2);
  foldedCloth(shelf, [0.56, 0.732, 0], m, 3);
  stackedBooks(shelf, [-0.52, 0.732, 0], m, 2);
  pottery(shelf, [-0.02, 0.732, 0.02], 0.32, m.ceramic, "bowl");
  touch(shelf, "前景生活书架", "书卷与布巾，各有归处。");
  lamp([-0.16, 0.116, 4.25], 1.02, "floorLamp", "缘侧纸灯", 0);
  touch(
    basket(root, [-2.65, 0.116, 1.25], m, 1.05),
    "竹篮",
    "竹篾编起日常的温柔。",
  );
  plant(root, [-2.86, 0.116, 4.28], 0.64, m);
  pottery(root, [4.39, 0.116, 4.37], 0.66, m.ceramic);
  plant(root, [2.35, 0.116, 4.29], 0.46, m);
  lamp([-3.22, 0.106, -0.73], 0.76, "floorLamp", "庭前纸灯", 0);
  const slippers = group(root, [-3.2, 0.11, 1.24]);
  for (const z of [-0.16, 0.16]) {
    sphere(slippers, [0.2, 0.035, 0.09], [0, 0.035, z], m.bamboo);
    tube(
      slippers,
      [
        [-0.06, 0.065, z - 0.07],
        [-0.02, 0.14, z],
        [0.07, 0.065, z + 0.07],
      ],
      0.025,
      m.dark,
    );
  }
  touch(slippers, "缘廊草履", "脱下草履，把匆忙留在门外。");
  const fabricRest = group(root, [-2.67, 0.12, -2.04]);
  box(fabricRest, [0.62, 0.16, 0.58], [0, 0.08, 0], m.border, 0.08);
  foldedCloth(fabricRest, [0, 0.16, 0], m, 2);
  touch(fabricRest, "叠好的布巾", "一叠柔软，留待明日。");
  // Pendant hangs from the exposed beam and stays above the furniture sightline.
  const pendant = group(root, [-0.7, 2.85, -2.26]);
  pendant.name = "machiya-paper-pendant";
  tube(
    root,
    [
      [-0.7, 3.64, -4.85],
      [-0.7, 3.64, -2.26],
      [-0.7, 3.17, -2.26],
    ],
    0.012,
    m.charcoal,
  );
  const shade = sphere(pendant, [0.37, 0.43, 0.37], [0, 0, 0], m.glow.clone());
  shade.castShadow = false;
  for (let i = 1; i < 11; i++) {
    const y = -0.43 + (i * 0.86) / 11;
    torus(
      pendant,
      0.373 * Math.sqrt(1 - (y * y) / (0.43 * 0.43)),
      0.004,
      [0, y, 0],
      m.bamboo,
    );
  }
  cylinder(pendant, 0.105, 0.105, 0.035, [0, 0.426, 0], m.dark);
  cylinder(pendant, 0.078, 0.078, 0.025, [0, -0.429, 0], m.dark);
  lamps.push({
    shade: shade.material,
    key: "floorLamp",
    pos: [-0.7, 2.82, -2.26],
    power: 9,
    range: 5.5,
  });
  register(
    pendant,
    "中央纸灯笼",
    "开关",
    () => {
      store.set("floorLamp", !store.state.floorLamp);
      return store.state.floorLamp ? "纸灯笼温柔亮起。" : "灯笼静静歇下。";
    },
    false,
  );
  return {
    root,
    lamps,
    update(dt, t) {
      for (const l of lifts) {
        l.elapsed = Math.min(0.7, l.elapsed + dt);
        l.object.position.y =
          l.baseY + 0.045 * Math.sin((Math.PI * l.elapsed) / 0.7) ** 2;
      }
      drawers.forEach(
        (d) =>
          (d.object.position.z = damp(
            d.object.position.z,
            d.open ? 0.59 : 0.03,
            dt,
          )),
      );
      doors.forEach(
        (d) =>
          (d.object.rotation.y = damp(
            d.object.rotation.y,
            d.open ? -1.3 : 0,
            dt,
          )),
      );
      warmth = damp(warmth, 0, dt, 0.6);
      steam.forEach((s, i) => {
        const v = (t * 0.2 + i * 0.24) % 1;
        s.position.y = 0.98 + v * 0.37;
        s.position.x = 0.03 + Math.sin(t + i) * 0.025;
        s.material.opacity = warmth * Math.sin(v * Math.PI) * 0.15;
      });
    },
    reset() {
      drawers.forEach((d) => (d.open = false));
      doors.forEach((d) => (d.open = false));
      warmth = 0;
      lifts.forEach((l) => {
        l.elapsed = 0.7;
        l.object.position.y = l.baseY;
      });
    },
  };
}
