import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import {
  pottery,
  books,
  plant,
  trailing,
  wovenPouf,
} from "../dongfang/details.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "mediterranean-furniture";
  const lamps = [],
    motions = [],
    drawers = [];
  let coffee = 0;
  const touch = (o, name, text, action) => {
    const a = { o, y: o.position.y, t: 1 };
    motions.push(a);
    register(o, name, "轻触互动", () => {
      a.t = 0;
      return action ? action() : text;
    });
  };
  function cup(parent, pos) {
    const g = pottery(parent, pos, 0.4, m.ceramic, "bowl");
    torus(g, 0.12, 0.027, [0.2, 0.1, 0], m.ceramic, [0, 0, 0]);
    cylinder(g, 0.158, 0.158, 0.006, [0, 0.13, 0], m.dark);
    return g;
  }
  function lamp(parent, pos, name, scale = 1, lantern = false, power = 3) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    const shade = m.glow.clone();
    if (lantern) {
      box(g, [0.38, 0.055, 0.38], [0, 0.028, 0], m.black, 0.02);
      box(g, [0.27, 0.5, 0.27], [0, 0.32, 0], shade, 0.01);
      for (const x of [-0.16, 0.16])
        for (const z of [-0.16, 0.16])
          box(g, [0.025, 0.56, 0.025], [x, 0.33, z], m.black);
      const roof = cylinder(g, 0.04, 0.29, 0.19, [0, 0.67, 0], m.black, 4);
      roof.rotation.y = Math.PI / 4;
      torus(g, 0.07, 0.013, [0, 0.83, 0], m.black, [0, 0, 0]);
    } else {
      cylinder(g, 0.15, 0.18, 0.045, [0, 0.023, 0], m.wood);
      sphere(g, [0.13, 0.16, 0.13], [0, 0.19, 0], m.clay);
      cylinder(g, 0.018, 0.018, 0.25, [0, 0.34, 0], m.bronze);
      cylinder(g, 0.16, 0.25, 0.33, [0, 0.53, 0], shade, 40);
    }
    root.updateMatrixWorld(true);
    const pos3 = g.localToWorld(new THREE.Vector3(0, lantern ? 0.35 : 0.53, 0));
    lamps.push({
      shade,
      key: lantern ? "floorLamp" : "bedLamp",
      pos: pos3.toArray(),
      power,
    });
    touch(g, name, "", () => {
      const key = lantern ? "floorLamp" : "bedLamp";
      store.set(key, !store.state[key]);
      return store.state[key] ? "暖灯亮起。" : "灯光暂歇。";
    });
    return g;
  }
  function candle(parent, pos) {
    const g = group(parent, pos);
    cylinder(g, 0.078, 0.086, 0.019, [0, 0.01, 0], m.clay);
    cylinder(g, 0.048, 0.048, 0.16, [0, 0.09, 0], m.paper);
    const shade = m.glow.clone();
    sphere(g, [0.02, 0.045, 0.02], [0, 0.205, 0], shade);
    lamps.push({ shade, key: "bedLamp", power: 0, pos: [0, 0, 0] });
    touch(g, "小蜡烛", "", () => {
      store.set("bedLamp", !store.state.bedLamp);
      return "烛光慢慢变化。";
    });
    return g;
  }
  function basket(parent, pos, s = 0.5) {
    const g = group(parent, pos);
    g.scale.setScalar(s);
    cylinder(g, 0.43, 0.35, 0.57, [0, 0.285, 0], m.woven, 24);
    cylinder(g, 0.39, 0.39, 0.012, [0, 0.566, 0], m.dark);
    for (let i = 0; i < 14; i++)
      torus(g, 0.355 + i * 0.0058, 0.012, [0, 0.04 + i * 0.039, 0], m.taupe);
    for (const x of [-0.34, 0.34])
      torus(g, 0.11, 0.017, [x, 0.64, 0], m.woven, [0, 0, 0]);
    return g;
  }
  function olive(parent, pos, s = 1, fruit = false, potted = true) {
    const g = group(parent, pos);
    g.scale.setScalar(s);
    if (potted) {
      const profile = [
        [0.24, 0],
        [0.34, 0.06],
        [0.41, 0.28],
        [0.4, 0.5],
        [0.35, 0.63],
        [0.37, 0.66],
        [0.37, 0.7],
        [0.32, 0.7],
        [0.31, 0.62],
        [0.34, 0.49],
        [0.3, 0.13],
        [0, 0.12],
      ];
      const pot = new THREE.Mesh(
        new THREE.LatheGeometry(
          profile.map((p) => new THREE.Vector2(...p)),
          32,
        ),
        m.clay,
      );
      pot.castShadow = pot.receiveShadow = true;
      g.add(pot);
      torus(g, 0.345, 0.022, [0, 0.68, 0], m.clay);
      cylinder(g, 0.3, 0.3, 0.008, [0, 0.645, 0], m.soil);
    } else g.position.y -= 0.65 * s;
    tube(
      g,
      [
        [0, 0.65, 0],
        [0.02, 1.15, 0],
        [-0.05, 1.65, 0.05],
        [0.04, 2.2, 0],
      ],
      0.043,
      m.wood,
    );
    const entries = [];
    for (let i = 0; i < 13; i++) {
      const a = i * 2.399,
        y = 1.03 + i * 0.087,
        x = Math.cos(a) * (0.4 + (i % 3) * 0.07),
        z = Math.sin(a) * 0.38;
      tube(
        g,
        [
          [0, y - 0.15, 0],
          [x * 0.5, y + 0.08, z * 0.5],
          [x, y + 0.28, z],
        ],
        0.012,
        m.wood,
      );
      for (let j = 0; j < 12; j++) {
        const t = j / 11,
          xx = x * t + Math.sin(j * 2.4) * 0.12,
          zz = z * t + Math.cos(j * 2.4) * 0.13;
        entries.push({
          p: [xx, y + 0.14 + t * 0.25, zz],
          s: fruit ? [0.065, 0.12, 0.029] : [0.025, 0.115, 0.012],
          r: [0.4, a, j % 2 ? 0.75 : -0.75],
        });
      }
      if (fruit && i % 2 === 0)
        sphere(g, [0.069, 0.082, 0.065], [x * 0.84, y + 0.16, z], m.fruit);
    }
    const leaves = new THREE.InstancedMesh(
        new THREE.SphereGeometry(1, 8, 6),
        m.leafLight,
        entries.length,
      ),
      d = new THREE.Object3D();
    entries.forEach((e, i) => {
      d.position.set(...e.p);
      d.scale.set(...e.s);
      d.rotation.set(...e.r);
      d.updateMatrix();
      leaves.setMatrixAt(i, d.matrix);
    });
    leaves.castShadow = true;
    g.add(leaves);
    return g;
  }
  function throwCloth(parent, pos, width = 0.6, length = 1.4) {
    const g = group(parent, pos);
    const geo = new THREE.PlaneGeometry(width, length, 22, 36),
      a = geo.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i),
        v = (a.getY(i) + length / 2) / length;
      const drop = Math.max(0, (v - 0.43) / 0.57);
      a.setXYZ(
        i,
        x + 0.025 * Math.sin(v * 12),
        -drop * 0.83 + 0.014 * Math.sin(x * 30 + v * 9),
        Math.min(v, 0.43) * 0.95 + 0.035 * Math.sin(x * 18),
      );
    }
    geo.computeVertexNormals();
    const mat = m.stripe.clone();
    mat.side = THREE.DoubleSide;
    const cloth = new THREE.Mesh(geo, mat);
    cloth.castShadow = cloth.receiveShadow = true;
    g.add(cloth);
    return g;
  }
  function chair(pos, angle, rattan = false) {
    const g = group(root, pos);
    g.rotation.y = angle;
    const w = rattan ? 0.6 : 0.98,
      d = rattan ? 0.58 : 0.85,
      h = rattan ? 0.58 : 0.49;
    for (const x of [-w * 0.43, w * 0.43])
      for (const z of [-d * 0.4, d * 0.4]) {
        const leg = box(
          g,
          [0.065, h + 0.15, 0.065],
          [x, (h + 0.15) / 2, z],
          m.lightWood,
          0.012,
        );
        leg.rotation.z = -x * 0.09;
      }
    box(g, [w, 0.12, d], [0, h, 0], m.lightWood, 0.025);
    box(
      g,
      [w - 0.1, 0.12, d - 0.04],
      [0, h + 0.105, 0],
      rattan ? m.woven : m.linen,
      0.05,
    );
    for (const x of [-w * 0.44, w * 0.44]) {
      box(g, [0.06, 0.73, 0.065], [x, h + 0.33, -d * 0.4], m.lightWood, 0.014);
      if (!rattan) {
        box(g, [0.067, 0.055, d + 0.08], [x, h + 0.38, 0], m.lightWood, 0.014);
        box(g, [0.055, 0.33, 0.055], [x, h + 0.2, d * 0.35], m.lightWood);
      }
    }
    const back = box(
      g,
      [w - 0.07, 0.55, 0.11],
      [0, h + 0.43, -d * 0.38],
      rattan ? m.woven : m.linen,
      0.045,
    );
    back.rotation.x = -0.13;
    if (!rattan) {
      const pillow = box(
        g,
        [0.46, 0.4, 0.16],
        [0, h + 0.41, -0.2],
        m.stripe,
        0.07,
      );
      pillow.rotation.x = -0.16;
    }
    touch(g, rattan ? "藤编木椅" : "海岸休闲椅", "坐下，听海风经过。");
    return g;
  }
  // Long masonry window seat and seaside planting occupy the left side.
  const bench = group(root, [-4.36, 0.018, -1.38]);
  bench.name = "mediterranean-window-bench";
  bench.rotation.y = Math.PI / 2;
  box(bench, [5.85, 0.46, 0.83], [0, 0.23, 0], m.stone, 0.045);
  for (let i = 0; i < 4; i++)
    box(bench, [1.36, 0.145, 0.7], [-2.13 + i * 1.42, 0.53, 0], m.linen, 0.06);
  for (const x of [-2.05, 1.96]) {
    const pillow = box(
      bench,
      [0.58, 0.43, 0.19],
      [x, 0.8, -0.19],
      m.stripe,
      0.07,
    );
    pillow.rotation.x = -0.16;
  }
  box(bench, [0.78, 0.055, 0.48], [0.87, 0.63, 0.04], m.stripe, 0.015);
  books(bench, [-0.74, 0.615, 0], m, 2);
  cup(bench, [-0.1, 0.615, 0.05]);
  touch(bench, "石质窗边长凳", "海湾的夕光落在亚麻上。");
  olive(root, [-4.3, 0.022, 3.25], 1.06, true).name =
    "mediterranean-citrus-tree";
  olive(root, [-3.75, 0.022, 2.67], 0.55);
  lamp(root, [-4.07, 0.024, 4.18], "窗边金属灯", 1.16, true, 3.5);
  basket(root, [-3.37, 0.02, 3.35], 0.74);
  box(root, [0.3, 0.04, 0.4], [-3.37, 0.47, 3.35], m.stripe, 0.016);
  const boug = plant(
    root,
    [-4.46, 0.54, -3.4],
    { ...m, leaf: m.leaf, leafLight: m.flower },
    0.58,
  );
  for (let i = 0; i < 24; i++)
    sphere(
      boug,
      [0.045, 0.032, 0.045],
      [
        Math.sin(i * 2.4) * 0.4,
        0.68 + (i % 5) * 0.11,
        Math.cos(i * 2.4) * 0.34,
      ],
      m.flower,
    );
  // Rear bookcase has storage below and books/pottery above.
  const shelf = group(root, [-3.55, 0.02, -4.47]);
  shelf.name = "mediterranean-rear-bookcase";
  box(shelf, [1.98, 3.29, 0.075], [0, 1.65, -0.34], m.dark);
  for (const x of [-0.98, 0.98])
    box(shelf, [0.1, 3.34, 0.77], [x, 1.67, 0], m.wood, 0.015);
  for (const y of [0.15, 0.84, 1.5, 2.18, 2.86, 3.37])
    box(shelf, [2.08, 0.09, 0.8], [0, y, 0], m.wood, 0.017);
  for (let row = 0; row < 5; row++) {
    const y = [0.195, 0.885, 1.545, 2.225, 2.905][row];
    books(shelf, [-0.78, y, 0], m, 3 + (row % 3), true);
    pottery(
      shelf,
      [0.57, y, 0],
      0.6 + (row % 2) * 0.12,
      row % 2 ? m.ceramic : m.clay,
    );
    if (row % 2 === 0) basket(shelf, [0.05, y, 0.01], 0.43);
  }
  pottery(shelf, [-0.1, 3.415, 0], 0.62, m.ceramic);
  pottery(shelf, [0.58, 3.415, 0], 0.5, m.clay);
  trailing(shelf, [-0.8, 3.42, 0.04], m, 0.85);
  trailing(shelf, [0.55, 1.545, 0.14], m, 0.52);
  candle(shelf, [0.54, 2.225, 0.25]);
  touch(shelf, "海岸旧木书架", "书页和陶器，收着旅行的记忆。");
  // The arch is recessed into the actual wall, with a coastal reflection above.
  pottery(root, [-1.76, 1.238, -4.92], 0.61, m.clay);
  olive(root, [-1.76, 1.65, -4.92], 0.26, false, false);
  books(root, [-1.11, 1.238, -4.92], m, 3);
  candle(root, [-0.6, 1.238, -4.86]);
  basket(root, [-1.14, 0.505, -4.94], 0.83);
  trailing(root, [-0.44, 1.25, -4.84], m, 0.65);
  pottery(root, [-1.86, 0.018, -4.32], 0.87, m.clay);
  // Writing desk below the smaller right window.
  const desk = group(root, [2.02, 0.024, -4.08]);
  desk.name = "mediterranean-writing-desk";
  box(desk, [2.46, 0.12, 1.01], [0, 1.07, 0], m.wood, 0.025);
  for (const x of [-1.08, 1.08])
    for (const z of [-0.39, 0.39])
      box(desk, [0.1, 1.03, 0.1], [x, 0.515, z], m.wood, 0.015);
  const drawer = group(desk, [0, 0.86, 0.08]);
  box(drawer, [1.97, 0.26, 0.7], [0, 0, 0], m.wood, 0.015);
  sphere(drawer, [0.048, 0.025, 0.028], [0, 0, 0.374], m.bronze);
  const dr = { o: drawer, on: false };
  drawers.push(dr);
  register(drawer, "书桌抽屉", "拉开或合上", () => {
    dr.on = !dr.on;
    return dr.on ? "抽屉缓缓打开。" : "抽屉轻轻合上。";
  });
  const notebook = group(desk, [0.06, 1.137, 0.1]);
  notebook.rotation.y = 0.12;
  for (const sign of [-1, 1]) {
    const page = box(
      notebook,
      [0.29, 0.025, 0.43],
      [sign * 0.15, 0.01, 0],
      m.paper,
      0.004,
    );
    page.rotation.z = -sign * 0.07;
  }
  box(notebook, [0.018, 0.013, 0.38], [0, 0.028, 0], m.taupe);
  touch(notebook, "空白笔记本", "留一页空白，记下此刻。");
  const mug = cup(desk, [0.53, 1.136, 0.23]);
  touch(mug, "书桌咖啡", "", () => {
    coffee = 1;
    return "咖啡的热气轻轻升起。";
  });
  pottery(desk, [0.89, 1.136, -0.21], 0.42, m.ceramic);
  olive(desk, [0.89, 1.43, -0.21], 0.23, false, false);
  lamp(desk, [-0.92, 1.13, -0.16], "书桌台灯", 0.88, false, 4.5);
  const deskChair = chair([2.03, 0.024, -2.92], Math.PI, true);
  deskChair.name = "mediterranean-desk-chair";
  const cabinet = group(root, [4.01, 0.025, -4.02]);
  cabinet.name = "mediterranean-low-cabinet";
  box(cabinet, [1.18, 0.79, 0.78], [0, 0.44, 0], m.wood, 0.022);
  box(cabinet, [1.3, 0.09, 0.9], [0, 0.89, 0], m.wood, 0.022);
  for (const x of [-0.27, 0.27]) {
    box(cabinet, [0.49, 0.67, 0.04], [x, 0.44, 0.409], m.dark, 0.009);
    sphere(cabinet, [0.024, 0.024, 0.027], [x, 0.5, 0.445], m.bronze);
  }
  pottery(cabinet, [-0.38, 0.937, 0], 0.54, m.ceramic);
  pottery(cabinet, [0.08, 0.937, -0.1], 0.65, m.clay);
  pottery(cabinet, [0.43, 0.937, 0.16], 0.4, m.ceramic);
  basket(root, [3.43, 0.025, -3.34], 0.58);
  box(root, [0.32, 0.055, 0.39], [3.45, 0.39, -3.34], m.linen, 0.02);
  olive(root, [4.4, 0.024, -2.97], 1.18).name = "mediterranean-olive-tree";
  box(root, [0.79, 1.08, 0.06], [4.08, 2.1, -4.855], m.lightWood, 0.008);
  box(root, [0.68, 0.97, 0.017], [4.08, 2.1, -4.815], m.artwork);
  // Main sofa is behind the coffee table, with its front toward the viewer.
  const sofa = group(root, [-0.42, 0.023, -0.39]);
  sofa.name = "mediterranean-sofa";
  for (const x of [-1.69, 1.69])
    for (const z of [-0.43, 0.43])
      cylinder(sofa, 0.05, 0.055, 0.18, [x, 0.09, z], m.wood, 12);
  box(sofa, [3.82, 0.3, 1.2], [0, 0.32, 0], m.linen, 0.105);
  box(sofa, [3.72, 0.66, 0.23], [0, 0.77, -0.49], m.linen, 0.1);
  for (const x of [-1.8, 1.8])
    box(sofa, [0.29, 0.63, 1.16], [x, 0.66, 0.025], m.linen, 0.1);
  for (let i = 0; i < 3; i++) {
    box(
      sofa,
      [1.06, 0.21, 0.99],
      [-1.12 + i * 1.12, 0.563, 0.04],
      m.linen,
      0.075,
    );
    const back = box(
      sofa,
      [1.04, 0.52, 0.21],
      [-1.12 + i * 1.12, 0.88, -0.29],
      m.linen,
      0.09,
    );
    back.rotation.x = -0.12;
  }
  for (const [x, mat] of [
    [-1.22, m.taupe],
    [-0.55, m.stripe],
    [1.13, m.linen],
  ]) {
    const pillow = box(sofa, [0.54, 0.5, 0.2], [x, 0.9, -0.12], mat, 0.09);
    pillow.rotation.z = x * 0.09;
  }
  throwCloth(sofa, [1.49, 0.98, -0.3], 0.57, 1.6);
  touch(sofa, "亚麻海岸沙发", "把午后的时间留给自己。");
  const rug = box(
    root,
    [5.36, 0.035, 4.45],
    [-0.44, 0.035, 1.82],
    m.rug,
    0.018,
  );
  rug.name = "mediterranean-woven-rug";
  for (let i = 0; i < 58; i++)
    for (const z of [-0.445, 4.085]) {
      const fringe = box(
        root,
        [0.012, 0.009, 0.12],
        [-3.03 + i * 0.091, 0.044, z],
        m.woven,
      );
      fringe.rotation.y = Math.sin(i * 5) * 0.2;
    }
  const table = group(root, [-0.45, 0.062, 1.33]);
  table.name = "mediterranean-limestone-table";
  const outline = new THREE.Shape();
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2,
      r = 1 + 0.045 * Math.sin(a * 7) + 0.027 * Math.cos(a * 11),
      x = Math.cos(a) * 1.14 * r,
      y = Math.sin(a) * 0.57 * r;
    if (i) outline.lineTo(x, y);
    else outline.moveTo(x, y);
  }
  outline.closePath();
  const slab = new THREE.Mesh(
    new THREE.ExtrudeGeometry(outline, {
      depth: 0.18,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.028,
      bevelSegments: 2,
    }),
    m.stone,
  );
  slab.rotation.x = -Math.PI / 2;
  slab.position.y = 0.39;
  slab.castShadow = slab.receiveShadow = true;
  table.add(slab);
  for (const x of [-0.68, 0.68])
    box(table, [0.34, 0.37, 0.51], [x, 0.185, 0], m.stone, 0.055);
  pottery(table, [-0.53, 0.61, -0.11], 0.48, m.ceramic);
  olive(table, [-0.53, 0.945, -0.11], 0.26, false, false);
  const fruitBowl = pottery(table, [0.04, 0.61, 0.02], 0.88, m.ceramic, "bowl");
  for (let i = 0; i < 5; i++)
    sphere(
      fruitBowl,
      [0.075, 0.075, 0.072],
      [Math.sin(i * 2.4) * 0.115, 0.15, Math.cos(i * 2.4) * 0.115],
      m.fruit,
    );
  books(table, [0.65, 0.61, 0.06], m, 2);
  cup(table, [-0.8, 0.61, 0.12]);
  cup(table, [0.68, 0.745, 0.06]);
  touch(table, "石灰岩茶几", "一杯咖啡，一碗阳光。");
  chair([-1.95, 0.025, 2.95], Math.atan2(1.5, -1.62));
  chair([1.25, 0.025, 2.71], Math.atan2(-1.7, -1.38));
  const stump = group(root, [-0.88, 0.022, 3.67]);
  cylinder(stump, 0.27, 0.33, 0.48, [0, 0.24, 0], m.wood, 12);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    box(
      stump,
      [0.018, 0.37, 0.016],
      [Math.sin(a) * 0.287, 0.22, Math.cos(a) * 0.287],
      m.dark,
    );
  }
  cup(stump, [0.1, 0.485, 0]);
  candle(stump, [-0.12, 0.486, 0]);
  touch(stump, "树桩边桌", "木纹留着岁月的温度。");
  // Foreground right bistro corner stays outside the main rug and circulation.
  const bistro = group(root, [3.6, 0.024, 1.55]);
  bistro.name = "mediterranean-mosaic-table";
  cylinder(bistro, 0.65, 0.65, 0.075, [0, 0.87, 0], m.mosaic, 64);
  cylinder(bistro, 0.045, 0.055, 0.83, [0, 0.425, 0], m.black, 12);
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    tube(
      bistro,
      [
        [0, 0.7, 0],
        [Math.cos(a) * 0.12, 0.22, Math.sin(a) * 0.12],
        [Math.cos(a) * 0.45, 0.04, Math.sin(a) * 0.45],
      ],
      0.025,
      m.black,
    );
  }
  cup(bistro, [-0.23, 0.91, 0.17]);
  plant(bistro, [0.16, 0.91, -0.12], m, 0.3);
  touch(bistro, "马赛克圆桌", "海边的小桌，等一杯慢咖啡。");
  chair([4.28, 0.024, 2.31], Math.atan2(-0.68, -0.76), true);
  chair([2.86, 0.024, 0.98], Math.atan2(0.74, 0.57), true);
  wovenPouf(root, [3.26, 0.025, 4.22], m, 0.41);
  const cushion = box(
    root,
    [0.8, 0.15, 0.66],
    [2.66, 0.12, 3.24],
    m.stripe,
    0.085,
  );
  cushion.rotation.y = 0.27;
  box(root, [0.56, 0.1, 0.5], [2.5, 0.087, 3.37], m.linen, 0.055);
  const mat = cylinder(
    root,
    0.5,
    0.5,
    0.022,
    [-3.72, 0.033, 4.13],
    m.woven,
    48,
  );
  touch(mat, "圆形编织地垫", "脚下是柔软的藤草纹理。");
  olive(root, [4.09, 0.024, 4.37], 0.47);
  pottery(root, [-3.63, 0.022, 1.85], 0.54, m.clay);
  const steam = [];
  for (let i = 0; i < 3; i++) {
    const sm = new THREE.Mesh(
      new THREE.TorusGeometry(0.035, 0.004, 5, 18),
      new THREE.MeshBasicMaterial({
        color: "#e8e1ce",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    sm.position.set(2.55, 1.4, -3.85);
    root.add(sm);
    steam.push(sm);
  }
  return {
    root,
    lamps,
    update(dt, t) {
      for (const a of motions) {
        a.t = Math.min(1, a.t + dt / 0.75);
        a.o.position.y = a.y + Math.sin(a.t * Math.PI) * 0.038;
      }
      for (const d of drawers)
        d.o.position.z = damp(d.o.position.z, d.on ? 0.45 : 0.08, dt);
      coffee = Math.max(0, coffee - dt * 0.055);
      steam.forEach((s, i) => {
        const phase = (t * 0.27 + i / 3) % 1;
        s.position.y = 1.39 + phase * 0.38;
        s.material.opacity = coffee * (1 - phase) * 0.22;
        s.scale.setScalar(1 + phase * 1.4);
      });
    },
    reset() {
      coffee = 0;
      for (const d of drawers) d.on = false;
      for (const a of motions) {
        a.t = 1;
        a.o.position.y = a.y;
      }
    },
  };
}
