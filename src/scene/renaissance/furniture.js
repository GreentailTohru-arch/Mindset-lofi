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
import { cityTexture } from "./materials.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "文艺复兴 · 陈设";
  const pulses = [],
    candles = [];
  const palette = [
    "#49584d",
    "#763f37",
    "#465869",
    "#9c8764",
    "#625044",
    "#323e40",
  ].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.88 }));
  function touch(obj, name, message) {
    const e = { obj, y: obj.position.y, pulse: 0 };
    pulses.push(e);
    register(obj, name, "轻点互动", () => {
      e.pulse = 1;
      return message;
    });
  }
  function book(parent, pos, w = 0.18, h = 0.44, index = 0) {
    const g = group(parent, pos),
      mat = palette[index % palette.length];
    box(g, [w, h, 0.32], [0, h / 2, 0], mat, 0.006);
    box(g, [w - 0.02, h - 0.035, 0.295], [0, h / 2, 0.006], m.paper);
    box(g, [w, 0.95 * h, 0.03], [0, h / 2, 0.158], mat, 0.003);
    for (const y of [0.07, h - 0.07])
      box(g, [w - 0.025, 0.009, 0.009], [0, y, 0.177], m.brass);
    return g;
  }
  function stack(parent, pos, count = 3) {
    const g = group(parent, pos);
    for (let i = 0; i < count; i++) {
      const b = book(g, [0, i * 0.09, 0], 0.08, 0.46, i);
      b.rotation.z = -Math.PI / 2;
      b.position.x = -0.23;
      b.rotation.y = (i % 2) * 0.08;
    }
    touch(g, "旧书叠册", "翻过一页 · 让时间慢下来");
    return g;
  }
  function table(pos, w, d, h) {
    const g = group(root, pos);
    box(g, [w, 0.1, d], [0, h, 0], m.wood, 0.028);
    for (const x of [-w / 2 + 0.12, w / 2 - 0.12])
      for (const z of [-d / 2 + 0.12, d / 2 - 0.12]) {
        cylinder(
          g,
          0.055,
          0.037,
          h - 0.1,
          [x, (h - 0.1) / 2, z],
          m.woodDark,
          12,
        );
        sphere(g, [0.072, 0.09, 0.072], [x, h - 0.19, z], m.wood);
        cylinder(g, 0.043, 0.056, 0.08, [x, 0.05, z], m.brass, 12);
      }
    box(g, [w - 0.16, 0.15, 0.06], [0, h - 0.13, d / 2 - 0.08], m.woodDark);
    return g;
  }
  function trailing(parent, pos, scale = 0.8) {
    const g = plant(parent, pos, scale, m);
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 0.2;
      tube(
        g,
        [
          [0, 0.48, 0],
          [x, 0.55, 0.32],
          [x + 0.1, -0.3, 0.37],
          [x, -0.8, 0.42],
        ],
        0.011,
        m.leaf,
      );
      for (let j = 0; j < 7; j++) {
        const leaf = sphere(
          g,
          [0.09, 0.135, 0.022],
          [x + Math.sin(j * 2) * 0.11, 0.35 - j * 0.17, 0.37],
          j % 2 ? m.leaf : m.leafLight,
        );
        leaf.rotation.z = Math.sin(j) * 0.8;
      }
    }
    return g;
  }
  function candle(parent, pos) {
    const g = group(parent, pos);
    cylinder(g, 0.075, 0.075, 0.2, [0, 0.11, 0], m.paper);
    cylinder(g, 0.12, 0.12, 0.018, [0, 0.017, 0], m.brass);
    const mat = m.lamp.clone(),
      flame = sphere(g, [0.022, 0.054, 0.022], [0, 0.26, 0], mat);
    candles.push({ flame, mat });
    touch(g, "烛光", "烛光摇曳 · 片刻闲暇");
  }
  function lamp(parent, pos, key, green = false) {
    const g = group(parent, pos);
    cylinder(g, 0.19, 0.22, 0.055, [0, 0.03, 0], m.brass);
    cylinder(g, 0.025, 0.036, 0.39, [0, 0.245, 0], m.brass, 16);
    const emission = m.lamp.clone();
    if (green) {
      const hood = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.47, 24, 1, true, 0, Math.PI),
        m.greenGlass,
      );
      hood.rotation.set(0, 0, Math.PI / 2);
      hood.position.y = 0.49;
      g.add(hood);
      box(g, [0.42, 0.025, 0.22], [0, 0.48, 0], emission, 0.02);
      for (const x of [-0.22, 0.22])
        tube(
          g,
          [
            [0, 0.28, 0],
            [x, 0.35, 0],
            [x, 0.5, 0],
          ],
          0.013,
          m.brass,
        );
    } else {
      cylinder(g, 0.16, 0.31, 0.3, [0, 0.56, 0], emission, 40);
      torus(g, 0.31, 0.012, [0, 0.415, 0], m.brass);
      torus(g, 0.16, 0.009, [0, 0.71, 0], m.brass);
      for (let i = 0; i < 32; i++) {
        const a = (i * Math.PI) / 16;
        tube(
          g,
          [
            [Math.cos(a) * 0.308, 0.42, Math.sin(a) * 0.308],
            [Math.cos(a) * 0.16, 0.708, Math.sin(a) * 0.16],
          ],
          0.003,
          m.linen,
        );
      }
    }
    register(g, green ? "黄铜银行台灯" : "褶皱灯罩台灯", "点亮 / 熄灭", () => {
      store.set(key, !store.state[key]);
      return store.state[key] ? "琥珀灯光亮起" : "台灯已关闭";
    });
    return emission;
  }
  // Tall antique bookcase with cornice, plinth and lower drawers.
  const shelf = group(root, [-2.87, 0, -4.5]);
  box(shelf, [2.75, 0.16, 0.83], [0, 0.1, 0], m.woodDark, 0.025);
  box(shelf, [2.54, 3.2, 0.06], [0, 1.73, -0.35], m.wood);
  for (const x of [-1.28, 1.28])
    box(shelf, [0.14, 3.24, 0.75], [x, 1.73, 0], m.woodDark, 0.015);
  for (const [y, w, d] of [
    [0.59, 2.65, 0.79],
    [1.22, 2.56, 0.7],
    [1.86, 2.56, 0.7],
    [2.5, 2.56, 0.7],
    [3.15, 2.73, 0.8],
    [3.27, 2.85, 0.87],
  ])
    box(shelf, [w, 0.08, d], [0, y, 0], m.woodDark, 0.012);
  box(shelf, [0.075, 2.56, 0.72], [0, 1.89, 0], m.woodDark);
  for (let row = 0; row < 4; row++) {
    const collection = group(shelf, [0, 0.64 + row * 0.64, 0]);
    for (let i = 0; i < 10; i++) {
      if (row === 2 && i > 5) continue;
      const b = book(
        collection,
        [-1.08 + i * 0.237, 0, 0],
        0.155 + (i % 3) * 0.02,
        0.39 + (i % 4) * 0.04,
        i + row,
      );
      if (i === 3) b.rotation.z = -0.08;
    }
    touch(collection, "复古书架藏书", "纸页微黄 · 故事常新");
  }
  const globe = group(shelf, [0.63, 1.94, 0.05]);
  cylinder(globe, 0.15, 0.19, 0.045, [0, 0, 0], m.brass);
  cylinder(globe, 0.022, 0.035, 0.15, [0, 0.075, 0], m.brass);
  sphere(globe, [0.21, 0.21, 0.21], [0, 0.32, 0], m.woodLight);
  torus(globe, 0.245, 0.012, [0, 0.32, 0], m.brass, [0, 0, 0.3]);
  touch(globe, "黄铜地球仪", "转一圈 · 想象远方的城市");
  const drawers = [];
  for (const x of [-0.84, 0, 0.84]) {
    const drawer = group(shelf, [x, 0.34, 0]);
    box(drawer, [0.78, 0.36, 0.71], [0, 0, 0], m.wood);
    torus(drawer, 0.043, 0.009, [0, 0.02, 0.372], m.brass, [0, 0, 0], Math.PI);
    drawers.push(drawer);
    register(drawer, "书柜抽屉", "打开 / 合上", () => {
      store.set("drawer", !store.state.drawer);
      return store.state.drawer ? "抽屉拉开" : "抽屉合上";
    });
  }
  trailing(shelf, [-0.66, 3.32, 0], 0.7);
  trailing(shelf, [0.92, 3.32, 0], 0.52);
  candle(shelf, [0.8, 2.57, 0.02]);

  // Gallery wall: painted European skyline and small architectural studies.
  const painting = new THREE.MeshStandardMaterial({
    map: cityTexture(false, true),
    roughness: 0.86,
  });
  function frame(x, y, w, h) {
    const g = group(root, [x, y, -4.84]);
    box(g, [w + 0.12, h + 0.12, 0.08], [0, 0, 0], m.woodDark, 0.009);
    box(g, [w + 0.045, h + 0.045, 0.025], [0, 0, 0.047], m.brass);
    box(g, [w, h, 0.012], [0, 0, 0.064], m.paper);
    box(g, [w - 0.1, h - 0.1, 0.012], [0, 0, 0.077], painting);
    touch(g, "欧洲城市风景画", "旧城倒影 · 一段未完的旅程");
    return g;
  }
  frame(0.4, 2.65, 2.05, 1.61);
  for (const [x, y] of [
    [-1.04, 2.98],
    [-1.04, 2.08],
    [1.86, 2.75],
    [1.86, 1.91],
    [3.14, 2.68],
  ])
    frame(x, y, 0.47, 0.59);
  const sconce = group(root, [0.4, 3.67, -4.76]);
  tube(
    sconce,
    [
      [0, 0, 0],
      [0, 0, 0.17],
      [0, -0.09, 0.24],
    ],
    0.023,
    m.brass,
  );
  const hood = cylinder(sconce, 0.035, 0.035, 0.58, [0, -0.09, 0.24], m.brass);
  hood.rotation.z = Math.PI / 2;
  const wallGlow = m.lamp.clone();
  box(sconce, [0.48, 0.012, 0.045], [0, -0.123, 0.24], wallGlow);
  register(sconce, "画框壁灯", "点亮 / 熄灭", () => {
    store.set("bedLamp", !store.state.bedLamp);
    return store.state.bedLamp ? "画作笼上暖光" : "壁灯已关闭";
  });

  // Vinyl cabinet: records below and wood speakers beside the turntable.
  const music = table([0.55, 0, -4.22], 3.38, 0.91, 0.92);
  box(music, [3.17, 0.65, 0.045], [0, 0.48, -0.39], m.wood);
  for (const x of [-1.54, -0.51, 0.51, 1.54])
    box(music, [0.075, 0.71, 0.83], [x, 0.48, 0], m.woodDark);
  box(music, [3.23, 0.07, 0.85], [0, 0.17, 0], m.woodDark);
  for (const side of [-1, 1])
    for (let i = 0; i < 13; i++)
      box(
        music,
        [0.045, 0.55, 0.53],
        [side * 0.99 - 0.38 + i * 0.062, 0.5, 0],
        palette[i % 6],
      );
  for (const y of [0.38, 0.66]) {
    box(music, [0.9, 0.23, 0.73], [0, y, 0], m.wood);
    sphere(music, [0.032, 0.025, 0.025], [0, y, 0.39], m.brass);
  }
  const player = group(music, [0.25, 1.04, 0]);
  box(player, [1.22, 0.13, 0.66], [0, 0, 0], m.woodLight, 0.025);
  box(player, [1.14, 0.015, 0.59], [0, 0.074, 0], m.black, 0.01);
  const record = group(player, [-0.18, 0.1, 0]);
  cylinder(record, 0.275, 0.275, 0.022, [0, 0, 0], m.black, 48);
  for (const r of [0.13, 0.18, 0.23, 0.265])
    torus(record, r, 0.002, [0, 0.014, 0], m.metal);
  cylinder(record, 0.075, 0.075, 0.025, [0, 0.005, 0], m.woodLight);
  box(record, [0.015, 0.003, 0.036], [0.02, 0.021, 0], m.brass);
  const arm = group(player, [0.45, 0.14, -0.23]);
  tube(
    arm,
    [
      [0, 0, 0],
      [-0.025, 0, 0.33],
      [-0.2, -0.015, 0.4],
    ],
    0.012,
    m.brass,
  );
  box(arm, [0.07, 0.026, 0.042], [-0.2, -0.015, 0.4], m.black, 0.005);
  let playing = true;
  register(player, "黑胶唱机", "播放 / 暂停", () => {
    playing = !playing;
    return playing ? "唱片缓缓转动" : "唱片暂停 · 留住此刻的安静";
  });
  for (const x of [-1.37, 1.37]) {
    const speaker = box(music, [0.39, 0.63, 0.46], [x, 1.28, 0], m.wood, 0.022);
    box(speaker, [0.34, 0.57, 0.02], [0, 0, 0.24], m.black, 0.013);
    for (const [y, r] of [
      [-0.12, 0.119],
      [0.17, 0.058],
    ]) {
      torus(speaker, r, 0.015, [0, y, 0.26], m.brass, [0, 0, 0]);
      sphere(speaker, [r * 0.77, r * 0.77, 0.017], [0, y, 0.254], m.metal);
    }
    touch(speaker, "胡桃木音箱", "音箱待机 · 低声陪伴");
  }
  const bedShade = lamp(music, [-0.78, 0.98, 0.02], "bedLamp");

  // Leather club chair, sewn edges and brass upholstery tacks.
  function seat(pos, rotation, w, material, name) {
    const g = group(root, pos);
    g.rotation.y = rotation;
    for (const x of [-w / 2 + 0.17, w / 2 - 0.17])
      for (const z of [-0.38, 0.38])
        cylinder(g, 0.047, 0.035, 0.23, [x, 0.12, z], m.woodDark, 12);
    box(g, [w, 0.23, 1.03], [0, 0.34, 0], material, 0.095);
    const back = box(
      g,
      [w - 0.06, 0.97, 0.24],
      [0, 0.98, -0.43],
      material,
      0.12,
    );
    back.rotation.x = -0.1;
    box(g, [w - 0.35, 0.2, 0.87], [0, 0.57, 0.075], material, 0.1);
    for (const x of [-w / 2 + 0.1, w / 2 - 0.1]) {
      box(g, [0.23, 0.54, 0.99], [x, 0.68, 0], material, 0.11);
      tube(
        g,
        [
          [x, 0.95, -0.38],
          [x, 0.98, 0.15],
          [x, 0.94, 0.42],
        ],
        0.006,
        m.woodLight,
      );
      for (let j = 0; j < 7; j++)
        sphere(g, [0.012, 0.012, 0.012], [x, 0.54 + j * 0.045, 0.498], m.brass);
    }
    for (let i = 0; i < Math.round(w / 0.3); i++)
      sphere(
        g,
        [0.025, 0.025, 0.012],
        [-w * 0.3 + i * 0.3, 1.08, -0.29],
        material,
      );
    touch(g, name, "坐下来 · 今晚不必匆忙");
    return g;
  }
  const leather = seat(
    [-3.05, 0, 1.25],
    1.12,
    1.32,
    m.leather,
    "复古皮革扶手椅",
  );
  const pillow = box(
    leather,
    [0.61, 0.55, 0.18],
    [0, 0.93, -0.12],
    m.olive,
    0.09,
  );
  pillow.rotation.z = 0.12;
  const throwA = box(
    leather,
    [0.54, 0.035, 0.95],
    [0.15, 0.708, 0.25],
    m.olive,
    0.04,
  );
  throwA.rotation.z = -0.04;
  box(leather, [0.54, 0.42, 0.03], [0.15, 0.5, 0.72], m.olive, 0.02);
  const sofa = seat([2.12, 0, 2.4], -2.78, 2.37, m.olive, "橄榄绿双人沙发");
  for (const [x, mat] of [
    [-0.56, m.burgundy],
    [0.49, m.linen],
  ]) {
    const p = box(sofa, [0.58, 0.55, 0.18], [x, 0.97, -0.13], mat, 0.09);
    p.rotation.z = x * 0.25;
  }
  box(sofa, [0.46, 0.035, 1.02], [-0.77, 0.71, 0.14], m.linen, 0.025);
  box(sofa, [0.46, 0.44, 0.025], [-0.77, 0.47, 0.65], m.linen, 0.012);
  for (let i = 0; i < 15; i++)
    tube(
      sofa,
      [
        [-0.97 + i * 0.028, 0.28, 0.66],
        [-0.97 + i * 0.028, 0.2, 0.67],
      ],
      0.004,
      m.linen,
    );

  // Persian-inspired rug and a round coffee table.
  box(root, [5.6, 0.045, 4.3], [0.03, 0.06, 1.17], m.rug, 0.02);
  for (const z of [-1.02, 3.36])
    for (let i = 0; i < 83; i++)
      box(root, [0.022, 0.018, 0.13], [-2.68 + i * 0.065, 0.06, z], m.linen);
  const coffee = group(root, [-0.18, 0, 0.93]);
  cylinder(coffee, 1.01, 1.01, 0.095, [0, 0.62, 0], m.wood, 64);
  torus(coffee, 0.99, 0.014, [0, 0.67, 0], m.woodLight);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const x = Math.sin(a) * 0.65,
      z = Math.cos(a) * 0.65;
    cylinder(coffee, 0.032, 0.022, 0.54, [x, 0.31, z], m.woodDark, 12);
  }
  cylinder(coffee, 0.69, 0.69, 0.045, [0, 0.18, 0], m.woodDark, 48);
  stack(coffee, [-0.36, 0.7, -0.07], 3);
  candle(coffee, [0.37, 0.68, 0.22]);
  const vase = group(coffee, [0.32, 0.69, -0.28]);
  sphere(vase, [0.115, 0.16, 0.115], [0, 0.16, 0], m.ceramic);
  cylinder(vase, 0.05, 0.055, 0.12, [0, 0.31, 0], m.ceramic);
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4;
    const x = Math.sin(a) * 0.15,
      z = Math.cos(a) * 0.15;
    tube(
      vase,
      [
        [0, 0.35, 0],
        [x, 0.58 + i * 0.022, z],
      ],
      0.004,
      m.leaf,
    );
    for (let j = 0; j < 5; j++) {
      const b = j * 1.26;
      sphere(
        vase,
        [0.025, 0.017, 0.02],
        [x + Math.sin(b) * 0.03, 0.58 + i * 0.022, z + Math.cos(b) * 0.03],
        m.linen,
      );
    }
  }
  touch(coffee, "圆形茶几", "一杯茶，一本旧书");
  const ottoman = group(root, [-1.48, 0, 2.77]);
  sphere(ottoman, [0.59, 0.34, 0.56], [0, 0.36, 0], m.burgundy);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    tube(
      ottoman,
      [
        [Math.sin(a) * 0.16, 0.685, Math.cos(a) * 0.16],
        [Math.sin(a) * 0.5, 0.55, Math.cos(a) * 0.48],
        [Math.sin(a) * 0.55, 0.27, Math.cos(a) * 0.53],
      ],
      0.005,
      m.brass,
    );
  }
  touch(ottoman, "酒红色皮墩", "把疲惫轻轻放下");

  // Writing desk with a green banker lamp and a cane-back chair.
  const desk = table([3.6, 0, -2.5], 1.94, 1.05, 1.08);
  const notebook = box(
    desk,
    [0.54, 0.055, 0.39],
    [0.15, 1.16, 0.07],
    m.leather,
    0.007,
  );
  touch(notebook, "皮面笔记本", "翻开空白的一页");
  box(desk, [0.48, 0.012, 0.34], [0.15, 1.195, 0.07], m.paper);
  const pen = cylinder(
    desk,
    0.009,
    0.009,
    0.33,
    [0.23, 1.215, 0.08],
    m.brass,
    8,
  );
  pen.rotation.z = Math.PI / 2;
  stack(desk, [-0.52, 1.14, -0.1], 2);
  const floorShade = lamp(desk, [0.54, 1.14, -0.27], "floorLamp", true);
  const chair = group(root, [3.6, 0, -1.35]);
  chair.rotation.y = Math.PI;
  for (const x of [-0.31, 0.31])
    for (const z of [-0.28, 0.28])
      cylinder(chair, 0.025, 0.021, 0.62, [x, 0.31, z], m.woodDark, 12);
  box(chair, [0.74, 0.13, 0.7], [0, 0.66, 0], m.leather, 0.05);
  for (const x of [-0.34, 0.34])
    box(chair, [0.055, 0.85, 0.055], [x, 1, -0.3], m.woodDark, 0.012);
  box(chair, [0.7, 0.065, 0.06], [0, 1.42, -0.3], m.wood, 0.02);
  for (let i = 0; i < 12; i++) {
    box(
      chair,
      [0.017, 0.52, 0.022],
      [-0.28 + i * 0.052, 1.11, -0.3],
      m.woodLight,
    );
    box(
      chair,
      [0.59, 0.013, 0.022],
      [0, 0.88 + i * 0.043, -0.285],
      m.woodLight,
    );
  }
  touch(chair, "藤编书桌椅", "坐稳，写下今天的心情");
  const side = group(root, [-3.97, 0, 2.75]);
  cylinder(side, 0.41, 0.41, 0.06, [0, 0.68, 0], m.wood);
  cylinder(side, 0.045, 0.06, 0.64, [0, 0.33, 0], m.brass);
  cylinder(side, 0.26, 0.29, 0.045, [0, 0.04, 0], m.woodDark);
  cylinder(side, 0.075, 0.055, 0.13, [0.07, 0.78, 0.04], m.ceramic);
  torus(side, 0.043, 0.012, [0.14, 0.79, 0.04], m.ceramic, [
    Math.PI / 2,
    Math.PI / 2,
    0,
  ]);
  stack(side, [-0.15, 0.73, -0.14], 1);
  const stand = group(root, [-4.08, 0, 0.45]);
  cylinder(stand, 0.25, 0.27, 0.05, [0, 0.04, 0], m.brass);
  cylinder(stand, 0.019, 0.027, 1.72, [0, 0.91, 0], m.brass);
  tube(
    stand,
    [
      [0, 1.72, 0],
      [0.09, 1.88, 0],
      [0.25, 1.8, 0],
    ],
    0.021,
    m.brass,
  );
  cylinder(stand, 0.11, 0.21, 0.21, [0.25, 1.7, 0], m.brass);
  const readingGlow = m.lamp.clone();
  cylinder(stand, 0.17, 0.17, 0.016, [0.25, 1.588, 0], readingGlow);
  register(stand, "黄铜阅读落地灯", "点亮 / 熄灭", () => {
    store.set("floorLamp", !store.state.floorLamp);
    return store.state.floorLamp ? "阅读灯亮起" : "阅读灯关闭";
  });
  plant(root, [-4.25, 0, 3.65], 1.25, m);
  plant(root, [-4.18, 0, -3.95], 1.08, m);
  plant(root, [4.42, 0, -0.54], 1.2, m);
  plant(root, [2.66, 0, -3.85], 0.88, m);
  const smallShelf = table([1.38, 0, 4.23], 1.74, 0.65, 0.79);
  box(smallShelf, [1.59, 0.055, 0.59], [0, 0.15, 0], m.woodDark);
  for (let i = 0; i < 7; i++)
    book(smallShelf, [-0.65 + i * 0.15, 0.19, 0], 0.12, 0.4, i);
  trailing(smallShelf, [-0.47, 0.86, 0], 0.65);
  stack(smallShelf, [0.4, 0.84, 0], 2);
  return {
    root,
    bedShade,
    floorShade,
    wallGlow,
    readingGlow,
    update(dt, t) {
      if (playing) record.rotation.y += dt * 0.65;
      arm.rotation.y = damp(arm.rotation.y, playing ? 0 : -0.5, dt, 3);
      drawers.forEach(
        (d) =>
          (d.position.z = damp(
            d.position.z,
            store.state.drawer ? 0.28 : 0,
            dt,
            3,
          )),
      );
      for (const e of pulses) {
        e.pulse = damp(e.pulse, 0, dt, 3);
        e.obj.position.y = e.y + Math.sin(e.pulse * Math.PI) * 0.025;
      }
      candles.forEach(({ flame, mat }, i) => {
        flame.scale.y = 0.054 * (1 + Math.sin(t * 2 + i) * 0.07);
        mat.emissiveIntensity = 0.6 + Math.sin(t * 3 + i) * 0.04;
      });
    },
    reset() {
      playing = true;
      for (const e of pulses) {
        e.pulse = 0;
        e.obj.position.y = e.y;
      }
    },
  };
}
