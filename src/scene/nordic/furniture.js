import * as THREE from "three";
import {
  box,
  group,
  cylinder,
  sphere,
  tube,
  torus,
  plant,
} from "../primitives.js";
import { damp } from "../../state.js";
import { addNordicDetails } from "./details.js";

export function createFurniture(scene, m, store, registerItem) {
  const root = group(scene);
  root.name = "nordic-furniture";
  const lamps = [],
    candles = [],
    motions = [];
  let candlesOn = true,
    teaHeat = 0;
  const lifts = new Map();
  function register(obj, name, hint, action) {
    const lift = { object: obj, baseY: obj.position.y, elapsed: 0.7 };
    lifts.set(obj, lift);
    registerItem(obj, name, hint, () => {
      lift.elapsed = 0;
      return action();
    });
  }
  function touch(obj, name, message) {
    register(obj, name, "轻触", () => message);
  }
  function bookStack(parent, pos, count = 3) {
    const g = group(parent, pos);
    for (let i = 0; i < count; i++) {
      const b = group(g, [Math.sin(i * 2) * 0.018, i * 0.062, 0]);
      b.rotation.y = Math.sin(i) * 0.09;
      box(
        b,
        [0.33, 0.052, 0.44],
        [0, 0.026, 0],
        [m.book, m.blue, m.clay][i % 3],
        0.006,
      );
      box(b, [0.305, 0.033, 0.435], [0.008, 0.026, 0], m.pages);
    }
    return g;
  }
  function vase(parent, pos, scale = 1) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    const geo = new THREE.LatheGeometry(
      [
        [0, 0],
        [0.1, 0],
        [0.18, 0.05],
        [0.22, 0.26],
        [0.18, 0.39],
        [0.08, 0.47],
        [0.074, 0.6],
        [0.052, 0.6],
        [0.055, 0.47],
        [0.13, 0.37],
        [0.15, 0.23],
        [0.07, 0.045],
        [0, 0.045],
      ].map((p) => new THREE.Vector2(...p)),
      32,
    );
    const v = new THREE.Mesh(geo, m.ceramic);
    v.castShadow = true;
    v.receiveShadow = true;
    g.add(v);
    return g;
  }
  function cushion(parent, pos, mat, angle = 0) {
    const g = group(parent, pos);
    g.rotation.set(-0.12, angle, 0);
    box(g, [0.59, 0.57, 0.17], [0, 0, 0], mat, 0.11);
    const seam = torus(g, 0.19, 0.005, [0, 0, 0.087], mat, [0, 0, 0]);
    seam.scale.set(1.27, 1.24, 1);
    return g;
  }
  function rug(pos, w, d) {
    const g = group(root, pos);
    box(g, [w, 0.025, d], [0, 0, 0], m.rug, 0.012);
    for (const z of [-d / 2, d / 2])
      for (let i = 0; i < 46; i++) {
        const x = -w / 2 + (i * w) / 45;
        tube(
          g,
          [
            [x, 0.009, z],
            [x + 0.014, 0.009, z + Math.sign(z) * 0.09],
            [x - 0.008, 0.006, z + Math.sign(z) * 0.14],
          ],
          0.005,
          m.wool,
        );
      }
    return g;
  }
  function lamp(
    pos,
    scale,
    key,
    label = key === "floorLamp" ? "阅读落地灯" : "书桌台灯",
  ) {
    const g = group(root, pos);
    g.scale.setScalar(scale);
    cylinder(g, 0.16, 0.19, 0.045, [0, 0.025, 0], m.charcoal);
    const standing = key === "floorLamp";
    const shadeY = standing ? 1.55 : 0.58;
    cylinder(
      g,
      0.025,
      0.025,
      standing ? 1.36 : 0.4,
      [0, standing ? 0.72 : 0.24, 0],
      m.wood,
    );
    const shade = cylinder(g, 0.19, 0.27, 0.31, [0, shadeY, 0], m.glow.clone());
    shade.castShadow = false;
    lamps.push({
      key,
      shade: shade.material,
      pos: [pos[0], pos[1] + scale * shadeY, pos[2]],
      power: key === "floorLamp" ? 5 : 3,
    });
    register(g, label, "开关", () => {
      store.set(key, !store.state[key]);
      return store.state[key] ? "灯亮了，留一会儿吧。" : "灯已关闭。";
    });
    return g;
  }
  function candle(parent, pos, height) {
    const g = group(parent, pos);
    cylinder(g, 0.072, 0.072, height, [0, height / 2, 0], m.wax);
    cylinder(g, 0.008, 0.008, 0.02, [0, height + 0.007, 0], m.charcoal, 8);
    const flame = sphere(
      g,
      [0.018, 0.043, 0.018],
      [0, height + 0.042, 0],
      m.flame.clone(),
    );
    flame.castShadow = false;
    flame.receiveShadow = false;
    candles.push(flame);
    register(g, "暖色蜡烛", "点亮 / 熄灭", () => {
      candlesOn = !candlesOn;
      return candlesOn ? "烛光轻轻摇晃。" : "蜡烛熄灭，余温仍在。";
    });
  }
  // A long window seat provides its own reading nook and an opening storage drawer.
  const seat = group(root, [-4.28, 0, 0.15]);
  seat.rotation.y = Math.PI / 2;
  box(seat, [4.92, 0.48, 0.91], [0, 0.31, 0], m.wood, 0.035);
  box(seat, [4.77, 0.13, 0.83], [0, 0.615, 0], m.fabric, 0.085);
  for (const x of [-1.64, 0, 1.64]) {
    const front = group(seat, [x, 0.31, 0.47]);
    box(front, [1.57, 0.36, 0.043], [0, 0, 0], m.wood, 0.015);
    box(front, [0.2, 0.018, 0.026], [0, 0.075, 0.036], m.darkWood, 0.009);
    const state = { obj: front, open: false, closed: 0.47 };
    motions.push(state);
    register(front, "窗边收纳抽屉", "打开 / 收起", () => {
      state.open = !state.open;
      return state.open ? "书与毛毯，有各自的位置。" : "收纳已归位。";
    });
  }
  cushion(seat, [-1.46, 0.94, -0.24], m.sage, 0.08);
  cushion(seat, [-0.78, 0.94, -0.24], m.fabric, -0.12);
  bookStack(seat, [1.63, 0.69, 0], 3);
  // Sofa modules face the center, with one chaise and soft, separated seat cushions.
  const sofa = group(root, [-1.94, 0, 1.27]);
  sofa.rotation.y = Math.PI / 2;
  sofa.scale.set(1.28, 1.17, 1.2);
  sofa.name = "nordic-modular-sofa";
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 1.04;
    const depth = i === 0 ? 1.88 : 1.11,
      z = i === 0 ? 0.38 : 0;
    for (const dx of [-0.38, 0.38])
      for (const dz of [-0.38, depth - 0.55])
        cylinder(sofa, 0.035, 0.045, 0.18, [x + dx, 0.12, dz], m.wood, 12);
    box(sofa, [1.025, 0.29, depth], [x, 0.365, z], m.fabric, 0.09);
    box(sofa, [0.98, 0.2, depth - 0.13], [x, 0.606, z + 0.015], m.fabric, 0.09);
    box(sofa, [1.025, 0.76, 0.24], [x, 0.84, -0.46], m.fabric, 0.1);
  }
  for (const x of [-1.66, 1.66])
    box(sofa, [0.24, 0.63, 1.14], [x, 0.68, -0.01], m.fabric, 0.11);
  cushion(sofa, [-1.03, 0.96, -0.24], m.sage, 0.06);
  cushion(sofa, [-0.36, 0.92, -0.2], m.blue, -0.15);
  cushion(sofa, [1.01, 0.93, -0.24], m.fabric, 0.15);
  cushion(sofa, [0.35, 0.94, -0.22], m.clay, -0.13);
  cushion(sofa, [-1.1, 0.91, 0.25], m.fabric, 0.2);
  touch(sofa, "模块化沙发", "靠进柔软里，把冬天留在窗外。");
  // Woven throw drapes over the chaise edge rather than intersecting its cushion.
  const clothGeo = new THREE.PlaneGeometry(0.78, 1.36, 36, 52),
    a = clothGeo.attributes.position;
  for (let i = 0; i < a.count; i++) {
    const x = a.getX(i),
      v = a.getY(i);
    a.setXYZ(
      i,
      x,
      v,
      Math.sin(x * 26 + v * 4) * 0.014 +
        Math.sin(v * 19) * 0.009 -
        Math.max(0, -v - 0.38) * 1.25,
    );
  }
  clothGeo.computeVertexNormals();
  const throwMesh = new THREE.Mesh(clothGeo, m.wool);
  throwMesh.rotation.x = -Math.PI / 2;
  throwMesh.position.set(-1.06, 0.741, 0.86);
  throwMesh.castShadow = true;
  throwMesh.receiveShadow = true;
  sofa.add(throwMesh);
  touch(throwMesh, "羊毛毯", "松软的织纹，留住一点暖意。");
  const carpet = rug([0.62, 0.047, 1.28], 5.8, 5.03);
  carpet.rotation.y = 0.025;
  touch(carpet, "编织地毯", "细密的纤维，安静的脚步。");
  const table = group(root, [0.67, 0.04, 1.15]);
  table.scale.setScalar(1.09);
  touch(table, "圆形茶几", "茶香与烛光，都在手边。");
  cylinder(table, 0.86, 0.86, 0.09, [0, 0.57, 0], m.wood, 64);
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    tube(
      table,
      [
        [Math.cos(a) * 0.64, 0.045, Math.sin(a) * 0.64],
        [Math.cos(a) * 0.56, 0.3, Math.sin(a) * 0.56],
        [Math.cos(a) * 0.45, 0.54, Math.sin(a) * 0.45],
      ],
      0.045,
      m.wood,
    );
  }
  const flowers = vase(table, [-0.25, 0.618, -0.13], 0.64);
  for (let i = 0; i < 5; i++) {
    const a = i * 2.4;
    tube(
      flowers,
      [
        [0, 0.4, 0],
        [Math.cos(a) * 0.15, 0.78, Math.sin(a) * 0.12],
        [Math.cos(a) * 0.25, 0.9 + i * 0.035, Math.sin(a) * 0.2],
      ],
      0.01,
      m.leaf,
    );
    const leaf = sphere(
      flowers,
      [0.07, 0.17, 0.026],
      [Math.cos(a) * 0.23, 0.89 + i * 0.035, Math.sin(a) * 0.18],
      m.leafLight,
    );
    leaf.rotation.z = Math.cos(a) * 0.5;
  }
  bookStack(table, [0.27, 0.618, 0.05], 2);
  cylinder(table, 0.22, 0.22, 0.018, [-0.3, 0.628, 0.39], m.clay);
  candle(table, [-0.36, 0.64, 0.37], 0.14);
  candle(table, [-0.2, 0.64, 0.38], 0.095);
  const cup = group(table, [0.48, 0.618, -0.37]);
  cylinder(cup, 0.074, 0.066, 0.12, [0, 0.06, 0], m.ceramic);
  cylinder(cup, 0.064, 0.064, 0.008, [0, 0.124, 0], m.darkWood);
  torus(cup, 0.044, 0.01, [0.073, 0.069, 0], m.ceramic, [
    Math.PI / 2,
    Math.PI / 2,
    0,
  ]);
  register(cup, "热茶", "捧一杯热茶", () => {
    teaHeat = 1;
    return "热茶的水汽慢慢升起。";
  });
  const steam = [];
  for (let i = 0; i < 4; i++) {
    const s = sphere(
      cup,
      [0.017, 0.04, 0.017],
      [0, 0.2, 0],
      new THREE.MeshBasicMaterial({
        color: "#eee8db",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    s.castShadow = false;
    steam.push(s);
  }
  // Open shelving stays on the rear wall; all book spines are wordless.
  const shelf = group(root, [4.2, 0, -4.44]);
  shelf.scale.set(0.72, 1, 0.9);
  for (const x of [-0.76, 0.76])
    box(shelf, [0.085, 2.91, 0.64], [x, 1.51, 0], m.wood, 0.012);
  for (let row = 0; row < 5; row++) {
    const y = 0.18 + row * 0.66;
    box(shelf, [1.58, 0.07, 0.69], [0, y, 0], m.wood, 0.012);
    for (let j = 0; j < 6 - (row % 3); j++) {
      const h = 0.31 + (j % 3) * 0.058;
      box(
        shelf,
        [0.095, h, 0.29],
        [-0.58 + j * 0.113, y + 0.035 + h / 2, -0.05],
        [m.pages, m.book, m.blue][(row + j) % 3],
        0.007,
      );
    }
    if (row === 2 || row === 4) vase(shelf, [0.43, y + 0.035, 0.06], 0.54);
  }
  touch(shelf, "开放式书架", "下一本书，不必急着选。");
  plant(root, [4.15, 2.89, -4.39], 0.42, m);
  // A landscape print uses only tonal shapes, no symbols or readable text.
  const art = group(root, [-1.55, 2.43, -4.84]);
  art.scale.set(0.72, 1.18, 1);
  box(art, [1.95, 1.24, 0.055], [0, 0, 0], m.wood);
  box(art, [1.85, 1.14, 0.012], [0, 0, 0.035], m.pages);
  for (let i = 0; i < 3; i++) {
    const shape = new THREE.Shape();
    shape.moveTo(-0.86, -0.48);
    shape.lineTo(-0.86, -0.07 - i * 0.08);
    for (let j = 0; j < 8; j++)
      shape.lineTo(
        -0.86 + j * 0.246,
        Math.sin(j * 1.23 + i) * 0.11 + 0.02 - i * 0.12,
      );
    shape.lineTo(0.86, -0.48);
    shape.closePath();
    const mountain = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      [m.blue, m.sage, m.book][i],
    );
    mountain.position.z = 0.047 + i * 0.004;
    art.add(mountain);
  }
  const floorLamp = lamp([-2.67, 0.03, -3.09], 1.1, "floorLamp");
  floorLamp.rotation.y = 0.2;
  // Compact desk near the front-left wall, with an oak chair facing the worktop.
  const desk = group(root, [1.75, 0, -4.12]);
  desk.scale.x = 1.3;
  box(desk, [2.05, 0.09, 0.92], [0, 1.16, 0], m.wood, 0.03);
  for (const x of [-0.87, 0.87])
    for (const z of [-0.33, 0.33])
      cylinder(desk, 0.034, 0.048, 1.08, [x, 0.575, z], m.wood, 16);
  bookStack(desk, [-0.65, 1.21, -0.05], 2);
  const openBook = group(desk, [0.07, 1.221, 0.06]);
  for (const s of [-1, 1]) {
    const page = box(
      openBook,
      [0.235, 0.026, 0.37],
      [s * 0.116, 0.018, 0],
      m.pages,
      0.005,
    );
    page.rotation.z = -s * 0.075;
  }
  touch(openBook, "打开的空白书本", "纸页轻轻一抬，故事不必写满。");
  const coffee = group(desk, [0.58, 1.213, -0.04]);
  cylinder(coffee, 0.067, 0.059, 0.12, [0, 0.06, 0], m.ceramic);
  cylinder(coffee, 0.056, 0.056, 0.006, [0, 0.121, 0], m.darkWood);
  torus(coffee, 0.034, 0.009, [0.067, 0.065, 0], m.ceramic, [
    Math.PI / 2,
    Math.PI / 2,
    0,
  ]);
  touch(coffee, "书桌咖啡杯", "咖啡的温度，刚刚好。");
  vase(desk, [-0.08, 1.21, -0.28], 0.31);
  box(desk, [0.015, 0.014, 0.33], [0.43, 1.224, 0.05], m.charcoal, 0.005);
  lamp([2.78, 1.21, -4.18], 0.78, "bedLamp");
  touch(desk, "简洁书桌", "翻过一页，窗外仍是冬天。");
  const deskMat = rug([1.75, 0.047, -3.51], 2.9, 1.95);
  deskMat.rotation.y = 0.02;
  function chair(parent, pos, rotation = 0, mat = m.sage) {
    const g = group(parent, pos);
    g.rotation.y = rotation;
    for (const x of [-0.36, 0.36])
      for (const z of [-0.33, 0.33])
        tube(
          g,
          [
            [x * 1.16, 0.035, z * 1.15],
            [x, 0.46, z],
            [x, 0.61, z],
          ],
          0.035,
          m.wood,
        );
    box(g, [0.83, 0.1, 0.83], [0, 0.65, 0], m.wood, 0.06);
    box(g, [0.75, 0.14, 0.74], [0, 0.75, 0], mat, 0.08);
    box(g, [0.78, 0.65, 0.12], [0, 1.06, -0.36], m.wood, 0.07);
    box(g, [0.71, 0.55, 0.13], [0, 1.08, -0.28], mat, 0.065);
    return g;
  }
  const deskChair = chair(root, [1.75, 0.03, -2.91], Math.PI, m.fabric);
  touch(deskChair, "橡木书椅", "坐稳了，读一小会儿。");
  const reading = chair(root, [-1.46, 0.03, -3.02], 0.1, m.fabric);
  reading.scale.set(1.35, 1.12, 1.35);
  touch(reading, "阅读扶手椅", "给自己留一个安静的位置。");
  for (const x of [-0.48, 0.48]) {
    box(reading, [0.07, 0.07, 0.83], [x, 0.97, 0], m.wood, 0.025);
    box(reading, [0.04, 0.23, 0.04], [x, 0.84, 0.29], m.wood);
  }
  const side = group(root, [-0.67, 0.03, 4.27]);
  cylinder(side, 0.44, 0.44, 0.065, [0, 0.58, 0], m.wood);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.094;
    tube(
      side,
      [
        [Math.cos(a) * 0.34, 0.02, Math.sin(a) * 0.34],
        [Math.cos(a) * 0.25, 0.55, Math.sin(a) * 0.25],
      ],
      0.032,
      m.wood,
    );
  }
  bookStack(side, [-0.12, 0.615, 0], 2);
  lamp([-0.49, 0.645, 4.32], 0.43, "bedLamp", "边桌暖光灯");
  touch(side, "前景圆木边桌", "一盏灯，一本还没读完的书。");
  const footmat = group(root, [2.67, 0.13, 3.44]);
  footmat.rotation.y = -0.28;
  box(footmat, [0.88, 0.15, 0.76], [0, 0, 0], m.sage, 0.095);
  touch(footmat, "羊毛地垫", "脚下，是另一种温柔。");
  addNordicDetails(root, m, { touch, bookStack, vase, candle });
  return {
    root,
    lamps,
    candles,
    get candlesOn() {
      return candlesOn;
    },
    update(dt, t) {
      lifts.forEach((l) => {
        l.elapsed = Math.min(0.7, l.elapsed + dt);
        l.object.position.y =
          l.baseY + 0.055 * Math.sin((Math.PI * l.elapsed) / 0.7) ** 2;
      });
      motions.forEach(
        (d) =>
          (d.obj.position.z = damp(
            d.obj.position.z,
            d.closed + (d.open ? 0.37 : 0),
            dt,
          )),
      );
      candles.forEach((f, i) => {
        f.material.opacity = damp(
          f.material.opacity,
          candlesOn ? 0.82 + Math.sin(t * 2.1 + i) * 0.06 : 0,
          dt,
        );
        f.scale.y = 0.043 * (1 + Math.sin(t * 2.3 + i) * 0.065);
      });
      teaHeat = damp(teaHeat, 0, dt, 0.6);
      steam.forEach((s, i) => {
        const v = (t * 0.19 + i * 0.24) % 1;
        s.position.y = 0.16 + v * 0.25;
        s.position.x = Math.sin(t + i) * 0.015;
        s.material.opacity = teaHeat * Math.sin(v * Math.PI) * 0.14;
      });
    },
    reset() {
      lifts.forEach((l) => {
        l.elapsed = 0.7;
        l.object.position.y = l.baseY;
      });
      motions.forEach((d) => (d.open = false));
      candlesOn = true;
      teaHeat = 0;
    },
  };
}
