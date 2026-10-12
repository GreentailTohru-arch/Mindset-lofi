import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import {
  pottery,
  books,
  plant,
  trailing as baseTrailing,
  branches,
} from "../dongfang/details.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "bohemian-furniture";
  const lamps = [],
    motions = [],
    drawers = [];
  const smallLeafGeometry = new THREE.SphereGeometry(1, 10, 7);
  function trailing(parent, pos, materials, scale = 1) {
    const g = baseTrailing(parent, pos, materials, scale);
    const cluster = new THREE.InstancedMesh(
      smallLeafGeometry,
      materials.leaf,
      50,
    );
    const d = new THREE.Object3D();
    for (let i = 0; i < 50; i++) {
      const a = i * 2.399,
        hanging = i > 25;
      d.position.set(
        Math.cos(a) * (hanging ? 0.15 : 0.25),
        hanging ? 0.1 - (i - 25) * 0.035 : 0.17 + Math.sin(i * 3.1) * 0.12,
        Math.sin(a) * (hanging ? 0.09 : 0.2) + (hanging ? 0.2 : 0),
      );
      d.scale.set(0.066, 0.085, 0.018);
      d.rotation.set(0.3, a, Math.sin(a) * 0.6);
      d.updateMatrix();
      cluster.setMatrixAt(i, d.matrix);
    }
    cluster.castShadow = cluster.receiveShadow = true;
    g.add(cluster);
    return g;
  }
  function touch(o, name, message, action) {
    const e = { o, y: o.position.y, t: 1 };
    motions.push(e);
    register(o, name, "轻触互动", () => {
      e.t = 0;
      return action ? action() : message;
    });
    return o;
  }
  function cup(parent, pos) {
    const g = pottery(parent, pos, 0.39, m.ceramic, "bowl");
    torus(g, 0.1, 0.02, [0.21, 0.09, 0], m.ceramic, [0, 0, 0]);
    cylinder(g, 0.15, 0.15, 0.008, [0, 0.14, 0], m.soil);
    return g;
  }
  function candle(parent, pos) {
    const g = group(parent, pos),
      shade = m.glow.clone();
    cylinder(g, 0.09, 0.095, 0.016, [0, 0.008, 0], m.bronze);
    cylinder(g, 0.057, 0.06, 0.2, [0, 0.11, 0], m.paper);
    sphere(g, [0.019, 0.043, 0.019], [0, 0.25, 0], shade);
    lamps.push({ shade, key: "bedLamp", power: 0, pos: [0, 0, 0] });
    touch(g, "小蜡烛", "", () => {
      store.set("bedLamp", !store.state.bedLamp);
      return "烛光轻轻变化。";
    });
    return g;
  }
  function basket(parent, pos, w = 0.62, h = 0.4, d = 0.45) {
    const g = group(parent, pos);
    box(g, [w, h, d], [0, h / 2, 0], m.woven, 0.035);
    box(g, [w - 0.05, 0.01, d - 0.05], [0, h, 0], m.dark, 0.02);
    for (let y = 0.025; y < h; y += 0.035)
      box(g, [w + 0.008, 0.007, d + 0.008], [0, y, 0], m.taupe, 0.013);
    for (let x = -w / 2 + 0.035; x < w / 2; x += 0.06)
      for (const z of [-d / 2 - 0.007, d / 2 + 0.007])
        box(g, [0.008, h, 0.009], [x, h / 2, z], m.woven);
    box(g, [0.15, 0.05, 0.016], [0, h * 0.67, d / 2 + 0.014], m.dark, 0.018);
    return g;
  }
  function lantern(parent, pos, scale = 1, power = 2.3) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    const shade = m.glow.clone();
    cylinder(g, 0.23, 0.26, 0.08, [0, 0.04, 0], m.bronze, 6);
    cylinder(g, 0.17, 0.17, 0.56, [0, 0.36, 0], shade, 6).castShadow = false;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3,
        x = Math.sin(a) * 0.225,
        z = Math.cos(a) * 0.225;
      tube(
        g,
        [
          [x, 0.08, z],
          [x, 0.65, z],
        ],
        0.014,
        m.bronze,
      );
      const panel = group(g, [
        Math.sin(a + Math.PI / 6) * 0.198,
        0,
        Math.cos(a + Math.PI / 6) * 0.198,
      ]);
      panel.rotation.y = a + Math.PI / 6;
      for (let j = 0; j < 4; j++) {
        const y = 0.15 + j * 0.115;
        tube(
          panel,
          [
            [0, y - 0.056, 0],
            [-0.09, y, 0],
            [0, y + 0.056, 0],
            [0.09, y, 0],
            [0, y - 0.056, 0],
          ],
          0.007,
          m.bronze,
        );
      }
    }
    cylinder(g, 0.04, 0.26, 0.23, [0, 0.75, 0], m.bronze, 6);
    torus(g, 0.067, 0.012, [0, 0.94, 0], m.bronze, [0, 0, 0]);
    root.updateMatrixWorld(true);
    lamps.push({
      shade,
      key: "floorLamp",
      power,
      pos: g.localToWorld(new THREE.Vector3(0, 0.38, 0)).toArray(),
    });
    touch(g, "镂空金属灯笼", "", () => {
      store.set("floorLamp", !store.state.floorLamp);
      return "灯笼透出温柔的琥珀光。";
    });
    return g;
  }
  function pad(parent, pos, w, d, mat = m.pattern) {
    return box(parent, [w, 0.14, d], pos, mat, 0.075);
  }
  function pillow(parent, pos, mat, w = 0.55) {
    const p = box(parent, [w, 0.49, 0.19], pos, mat, 0.085);
    p.rotation.x = -0.16;
    p.rotation.z = pos[0] * 0.08;
    return p;
  }
  function table(parent, pos, w, d, h) {
    const g = group(parent, pos);
    box(g, [w, 0.14, d], [0, h - 0.07, 0], m.wood, 0.025);
    for (const x of [-w / 2 + 0.14, w / 2 - 0.14])
      for (const z of [-d / 2 + 0.14, d / 2 - 0.14]) {
        cylinder(g, 0.075, 0.075, h - 0.14, [x, (h - 0.14) / 2, z], m.wood, 12);
        for (const y of [0.1, h - 0.22])
          sphere(g, [0.11, 0.085, 0.11], [x, y, z], m.wood);
      }
    for (const z of [-d / 2 + 0.065, d / 2 - 0.065])
      box(g, [w - 0.13, 0.19, 0.07], [0, h - 0.23, z], m.dark, 0.013);
    return g;
  }
  function rug(pos, w, d, material, rotation = 0) {
    const g = group(root, pos);
    g.rotation.y = rotation;
    box(g, [w, 0.025, d], [0, 0, 0], material, 0.015);
    for (const z of [-d / 2, d / 2])
      for (let x = -w / 2 + 0.04; x < w / 2; x += 0.08)
        box(g, [0.016, 0.012, 0.13], [x, 0, z + Math.sign(z) * 0.04], m.taupe);
    return g;
  }
  function drape(parent, pos, width, material) {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.13, -0.5),
      new THREE.Vector3(0, 1.2, -0.33),
      new THREE.Vector3(0, 0.62, 0.05),
      new THREE.Vector3(0, 0.62, 0.63),
      new THREE.Vector3(0, 0.08, 0.76),
    ]);
    const geo = new THREE.PlaneGeometry(width, 1, 22, 40),
      a = geo.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i),
        p = path.getPoint(0.5 - a.getY(i)),
        r = Math.sin(x * 65 + p.z * 5) * 0.02;
      a.setXYZ(i, x, p.y + r, p.z + r * 0.25);
    }
    geo.computeVertexNormals();
    const mat = material.clone();
    mat.side = THREE.DoubleSide;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.position.set(...pos);
    parent.add(mesh);
    for (let i = 0; i < 22; i++)
      tube(
        parent,
        [
          [pos[0] - width / 2 + (i * width) / 22, pos[1] + 0.09, pos[2] + 0.76],
          [pos[0] - width / 2 + (i * width) / 22, pos[1] + 0.015, pos[2] + 0.8],
        ],
        0.004,
        material,
      );
  }
  function rattanChair(pos, angle = 0, scale = 1) {
    const g = group(root, pos);
    g.rotation.y = angle;
    g.scale.setScalar(scale);
    for (const x of [-0.43, 0.43])
      for (const z of [-0.4, 0.4])
        tube(
          g,
          [
            [x * 1.16, 0.02, z * 1.13],
            [x, 0.61, z],
          ],
          0.034,
          m.lightWood,
        );
    box(g, [0.97, 0.1, 0.93], [0, 0.56, 0], m.woven, 0.12);
    pad(g, [0, 0.67, 0], 0.86, 0.81, m.linen);
    const back = box(g, [0.98, 0.73, 0.06], [0, 1.03, -0.42], m.woven, 0.1);
    back.rotation.x = -0.12;
    for (let i = 0; i < 17; i++) {
      const x = -0.43 + i * 0.054;
      tube(
        g,
        [
          [x, 0.68, -0.38],
          [x, 1.03, -0.43],
          [x, 1.39, -0.49],
        ],
        0.012,
        m.lightWood,
      );
    }
    for (let i = 0; i < 10; i++)
      tube(
        g,
        [
          [-0.46, 0.72 + i * 0.065, -0.4 - i * 0.008],
          [0, 0.72 + i * 0.065, -0.4 - i * 0.008],
          [0.46, 0.72 + i * 0.065, -0.4 - i * 0.008],
        ],
        0.009,
        m.taupe,
      );
    for (const x of [-0.5, 0.5])
      tube(
        g,
        [
          [x, 0.56, 0.4],
          [x, 0.94, 0.27],
          [x, 1.05, -0.35],
        ],
        0.027,
        m.lightWood,
      );
    pillow(g, [0, 0.98, -0.22], m.pattern, 0.62);
    touch(g, "藤编休闲椅", "坐下，让时间慢一点。");
    return g;
  }
  // LEFT: window bench, hanging foliage, and a lantern below the large plant.
  const bench = group(root, [-4.32, 0.025, -0.6]);
  bench.rotation.y = Math.PI / 2;
  bench.name = "bohemian-window-bench";
  box(bench, [4.83, 0.43, 0.8], [0, 0.255, 0], m.wood, 0.025);
  box(bench, [4.97, 0.075, 0.87], [0, 0.505, 0], m.wood, 0.015);
  pad(bench, [0, 0.6, 0], 4.73, 0.74, m.stripe);
  for (let i = 0; i < 4; i++) {
    const d = group(bench, [-1.8 + i * 1.2, 0.28, 0.03]);
    box(d, [1.05, 0.32, 0.72], [0, 0, 0], m.dark, 0.013);
    basket(d, [0, -0.15, 0.055], 0.98, 0.29, 0.61);
    drawers.push({ o: d, z: 0.03, key: "drawer" });
    register(d, "窗边收纳抽屉", "拉开 / 合上", () => {
      store.set("drawer", !store.state.drawer);
      return store.state.drawer ? "抽屉缓缓拉开。" : "抽屉轻轻合上。";
    });
  }
  pillow(bench, [-1.65, 0.88, -0.21], m.pattern);
  pillow(bench, [-0.85, 0.88, -0.21], m.rust);
  pillow(bench, [1.52, 0.88, -0.21], m.pattern);
  touch(bench, "图案窗边长凳", "把夕阳收藏在靠枕里。");
  plant(root, [-4.36, 0.025, 3.68], m, 1.32);
  basket(root, [-3.53, 0.025, 3.66], 0.52, 0.45, 0.49);
  cylinder(root, 0.68, 0.68, 0.018, [-3.85, 0.035, 2.97], m.woven, 48);
  lantern(root, [-4.01, 0.025, 4.38], 0.88, 2.8);
  for (const z of [2.67, -2.6]) {
    const hanger = trailing(root, [-4.38, 2.5, z], m, 0.9);
    for (const dz of [-0.16, 0.16])
      tube(
        root,
        [
          [-4.66, 3.79, z],
          [-4.39, 2.68, z + dz],
        ],
        0.009,
        m.taupe,
      );
    touch(hanger, "垂吊绿植", "藤蔓在晚风里轻轻舒展。");
  }
  const flowers = plant(root, [-4.65, 0.68, -2.73], m, 0.35);
  for (let i = 0; i < 18; i++)
    sphere(
      flowers,
      [0.07, 0.045, 0.07],
      [Math.sin(i * 2.4) * 0.43, 0.6 + (i % 4) * 0.13, Math.cos(i * 2.4) * 0.3],
      m.flower,
    );
  // BACK: cactus in the real recessed arch; stepped bookcase and baskets.
  const cactus = group(root, [-4.07, 0.185, -4.85]);
  cactus.name = "bohemian-niche-cactus";
  pottery(cactus, [0, 0, 0], 0.99, m.clay);
  const cactusMat = m.leaf.clone();
  cactusMat.color.set("#4d6c42");
  const stems = [
    [
      [0, 0.53, 0],
      [0, 2.33, 0],
    ],
    [
      [-0.06, 0.94, 0],
      [-0.31, 1.08, 0],
      [-0.33, 1.82, 0],
    ],
    [
      [0.07, 1.28, 0.015],
      [0.28, 1.4, 0.015],
      [0.29, 2.03, 0.015],
    ],
  ];
  for (const points of stems) tube(cactus, points, 0.055, cactusMat);
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    tube(
      cactus,
      [
        [Math.sin(a) * 0.053, 0.7, Math.cos(a) * 0.053],
        [Math.sin(a) * 0.053, 2.25, Math.cos(a) * 0.053],
      ],
      0.003,
      m.leafLight,
    );
  }
  touch(cactus, "壁龛仙人掌", "一抹安静的绿。 ");
  const shelf = group(root, [-1.76, 0.025, -4.45]);
  shelf.name = "bohemian-rear-bookcase";
  box(shelf, [2.83, 2.97, 0.07], [0, 1.52, -0.36], m.dark);
  for (const x of [-1.45, -0.48, 0.48, 1.45])
    box(shelf, [0.09, 3.12, 0.81], [x, 1.59, 0], m.wood, 0.012);
  for (const y of [0.14, 0.78, 1.4, 2.03, 2.66, 3.17])
    box(shelf, [3.02, 0.095, 0.86], [0, y, 0], m.wood, 0.016);
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < 3; col++) {
      const x = -0.96 + col * 0.96,
        y = [0.192, 0.832, 1.452, 2.082, 2.712][row];
      if (row === 0) basket(shelf, [x, y, 0], 0.8, 0.44, 0.66);
      else if ((row + col) % 3 === 0) {
        pottery(shelf, [x - 0.15, y, 0], 0.63, m.clay);
        pottery(shelf, [x + 0.25, y, 0.04], 0.37, m.ceramic, "bowl");
      } else if ((row + col) % 4 === 0) {
        books(shelf, [x - 0.18, y, 0], m, 4);
        candle(shelf, [x + 0.23, y, 0.17]);
      } else books(shelf, [x - 0.34, y, 0], m, 6, true);
    }
  trailing(shelf, [-1.22, 3.22, 0], m, 0.85);
  trailing(shelf, [1.13, 2.712, 0.2], m, 0.65);
  plant(shelf, [0.1, 3.22, 0], m, 0.34);
  pottery(shelf, [0.85, 3.22, 0], 0.48, m.ceramic);
  lantern(shelf, [0.6, 2.082, 0.14], 0.52, 1.2);
  touch(shelf, "旅行藏书架", "书籍、陶器，和一路带回的故事。");
  // RIGHT BACK: tapestry and writing desk, then the tall cane-front cabinet.
  const tapestry = group(root, [1.07, 2.87, -4.8]);
  tapestry.name = "bohemian-wall-tapestry";
  box(tapestry, [1.13, 1.34, 0.014], [0, -0.05, 0], m.pattern);
  const rod = cylinder(tapestry, 0.02, 0.02, 1.36, [0, 0.66, 0], m.wood);
  rod.rotation.z = Math.PI / 2;
  tube(
    tapestry,
    [
      [-0.64, 0.66, 0],
      [0, 1.04, 0],
      [0.64, 0.66, 0],
    ],
    0.008,
    m.taupe,
  );
  for (let i = 0; i < 47; i++)
    tube(
      tapestry,
      [
        [-0.55 + i * 0.024, -0.72, 0],
        [-0.55 + i * 0.024, -0.86 - Math.abs(i - 23) * 0.004, 0.01],
      ],
      0.003,
      m.linen,
    );
  touch(tapestry, "手织挂毯", "经纬之间，藏着手作的温度。");
  function art(x, y, w, h) {
    const g = group(root, [x, y, -4.81]);
    box(g, [w + 0.09, h + 0.09, 0.065], [0, 0, 0], m.dark, 0.006);
    box(g, [w, h, 0.012], [0, 0, 0.042], m.paper);
    box(g, [w - 0.1, h - 0.1, 0.012], [0, 0, 0.052], m.artwork);
    return g;
  }
  art(2.5, 2.55, 0.93, 1.21);
  art(-0.25, 3.08, 0.6, 0.8);
  const sculpture = group(root, [0.19, 2.08, -4.38]);
  box(root, [0.36, 0.07, 0.62], [0.19, 2.03, -4.59], m.wood, 0.012);
  box(sculpture, [0.26, 0.045, 0.22], [0, 0, 0], m.dark, 0.01);
  const loop = torus(sculpture, 0.14, 0.041, [0, 0.19, 0], m.dark, [0, 0, 0]);
  loop.scale.y = 1.28;
  touch(sculpture, "木雕摆件", "手工留下的曲线。 ");
  const desk = table(root, [1.82, 0.025, -4.03], 2.63, 0.98, 1.06);
  desk.name = "bohemian-writing-desk";
  const drawer = group(desk, [0, 0.84, 0.04]);
  box(drawer, [2.17, 0.22, 0.77], [0, 0, 0], m.wood, 0.016);
  sphere(drawer, [0.042, 0.023, 0.03], [0, 0, 0.406], m.bronze);
  const deskDrawer = { o: drawer, z: 0.04, on: false };
  drawers.push(deskDrawer);
  register(drawer, "书桌抽屉", "拉开 / 合上", () => {
    deskDrawer.on = !deskDrawer.on;
    return deskDrawer.on ? "抽屉打开了。" : "抽屉合上了。";
  });
  const notebook = group(desk, [-0.15, 1.067, 0.1]);
  for (const sign of [-1, 1]) {
    const p = box(
      notebook,
      [0.29, 0.022, 0.4],
      [sign * 0.15, 0.018, 0],
      m.paper,
      0.004,
    );
    p.rotation.z = -sign * 0.07;
  }
  touch(notebook, "空白笔记本", "留一页，写给明天。");
  cup(desk, [0.44, 1.068, 0.17]);
  candle(desk, [0.9, 1.068, -0.13]);
  pottery(desk, [-0.93, 1.068, -0.12], 0.42, m.clay);
  branches(desk, [-0.93, 1.35, -0.12], m, 0.35);
  plant(desk, [1.03, 1.068, 0.05], m, 0.29);
  const task = group(desk, [-0.66, 1.068, -0.23]);
  cylinder(task, 0.12, 0.15, 0.027, [0, 0.02, 0], m.bronze);
  tube(
    task,
    [
      [0, 0.03, 0],
      [0, 0.51, 0],
      [0.2, 0.57, 0],
    ],
    0.017,
    m.bronze,
  );
  cylinder(task, 0.065, 0.15, 0.14, [0.2, 0.52, 0], m.bronze);
  const shade = m.glow.clone();
  cylinder(task, 0.123, 0.123, 0.011, [0.2, 0.443, 0], shade).castShadow =
    false;
  root.updateMatrixWorld(true);
  lamps.push({
    shade,
    key: "bedLamp",
    power: 2.5,
    pos: task.localToWorld(new THREE.Vector3(0.2, 0.43, 0)).toArray(),
  });
  touch(task, "书桌黄铜灯", "", () => {
    store.set("bedLamp", !store.state.bedLamp);
    return "桌灯渐渐变化。";
  });
  rattanChair([1.78, 0.025, -2.93], Math.PI, 0.77).name = "bohemian-desk-chair";
  const cabinet = group(root, [4.07, 0.025, -4.23]);
  cabinet.name = "bohemian-cane-cabinet";
  box(cabinet, [1.51, 2.8, 0.065], [0, 1.49, -0.34], m.dark, 0.018);
  for (const x of [-0.72, 0.72])
    box(cabinet, [0.085, 2.8, 0.71], [x, 1.49, 0], m.wood, 0.014);
  for (const y of [0.13, 0.82, 1.5, 2.21, 2.86])
    box(cabinet, [1.5, 0.07, 0.71], [0, y, 0], m.wood);
  for (const y of [0.17, 0.86, 1.54, 2.25]) {
    basket(cabinet, [-0.3, y, 0], 0.55, 0.37, 0.48);
    books(cabinet, [0.15, y, 0], m, 4, true);
  }
  box(cabinet, [1.66, 0.11, 0.88], [0, 2.94, 0], m.wood, 0.018);
  const doors = [];
  for (const sign of [-1, 1]) {
    const door = group(cabinet, [sign * 0.73, 1.56, 0.403]);
    box(door, [0.71, 2.56, 0.063], [-sign * 0.355, 0, 0], m.wood, 0.012);
    box(door, [0.58, 2.38, 0.015], [-sign * 0.355, 0, 0.039], m.woven);
    for (let i = 0; i < 12; i++)
      box(
        door,
        [0.009, 2.36, 0.008],
        [-sign * 0.355 - 0.27 + i * 0.049, 0, 0.052],
        m.lightWood,
      );
    for (let i = 0; i < 43; i++)
      box(
        door,
        [0.58, 0.008, 0.008],
        [-sign * 0.355, -1.16 + i * 0.055, 0.054],
        m.taupe,
      );
    sphere(door, [0.022, 0.039, 0.022], [-sign * 0.65, 0, 0.08], m.bronze);
    doors.push({ o: door, sign });
    register(door, "藤编柜门", "打开 / 合上", () => {
      store.set("wardrobe", !store.state.wardrobe);
      return store.state.wardrobe ? "藤编柜门轻轻打开。" : "收好今日的小物。";
    });
  }
  trailing(cabinet, [-0.51, 3.0, 0], m, 0.6);
  plant(cabinet, [0.44, 3.0, 0], m, 0.37);
  pottery(cabinet, [0.1, 3, 0], 0.43, m.clay);
  // MIDDLE: central cream sofa faces the foreground table; layered rugs remain visible.
  rug([0.04, 0.043, 1.43], 6.75, 5.14, m.rug, -0.025).name =
    "bohemian-woven-rug";
  rug([-0.27, 0.067, 1.25], 5.92, 4.74, m.pattern, 0.027);
  rug([-0.2, 0.092, 1.19], 5.35, 4.31, m.persian, -0.02).name =
    "bohemian-persian-rug";
  const sofa = group(root, [-0.26, 0.115, -0.4]);
  sofa.name = "bohemian-sofa";
  for (const x of [-1.68, 1.68])
    for (const z of [-0.5, 0.5])
      cylinder(sofa, 0.067, 0.055, 0.17, [x, 0.085, z], m.wood, 12);
  box(sofa, [4.02, 0.28, 1.47], [0, 0.3, 0], m.linen, 0.13);
  box(sofa, [3.98, 0.72, 0.27], [0, 0.88, -0.59], m.linen, 0.13);
  for (const x of [-1.86, 1.86])
    box(sofa, [0.34, 0.62, 1.46], [x, 0.61, 0], m.linen, 0.12);
  for (const x of [-1.12, 0, 1.12]) {
    box(sofa, [1.075, 0.22, 1.15], [x, 0.57, 0.08], m.linen, 0.09);
    box(sofa, [1.075, 0.52, 0.16], [x, 0.93, -0.37], m.linen, 0.08);
  }
  for (const [x, mat, y] of [
    [-1.35, m.rust, 0.94],
    [-0.8, m.pattern, 1.01],
    [-0.25, m.mustard, 0.94],
    [0.45, m.stripe, 0.99],
    [1.22, m.pattern, 0.94],
  ])
    pillow(sofa, [x, y, -0.16], mat, 0.58);
  drape(sofa, [0.7, 0.06, 0.05], 0.71, m.rust);
  touch(sofa, "波西米亚布艺沙发", "陷进靠枕里，慢慢度过这一刻。");
  const coffee = table(root, [-0.44, 0.115, 1.58], 2.43, 1.27, 0.59);
  coffee.name = "bohemian-carved-coffee-table";
  box(coffee, [2.14, 0.066, 1.02], [0, 0.13, 0], m.wood, 0.015);
  for (const z of [-0.574, 0.574])
    for (let i = 0; i < 12; i++) {
      const trim = box(
        coffee,
        [0.068, 0.068, 0.018],
        [-1 + i * 0.18, 0.37, z],
        m.lightWood,
        0.009,
      );
      trim.rotation.z = Math.PI / 4;
    }
  box(coffee, [0.83, 0.038, 0.54], [-0.47, 0.61, 0.07], m.dark, 0.023);
  cup(coffee, [-0.66, 0.64, -0.02]);
  candle(coffee, [-0.26, 0.64, 0.15]);
  pottery(coffee, [0.53, 0.61, 0.07], 0.67, m.clay, "bowl");
  books(coffee, [0.63, 0.611, -0.23], m, 2);
  pottery(coffee, [-0.51, 0.61, -0.36], 0.49, m.ceramic);
  branches(coffee, [-0.51, 0.94, -0.36], m, 0.4);
  touch(coffee, "雕刻木茶几", "茶香、旧书，和温柔的烛光。");
  // FOREGROUND: a folding wood chair at left, cane lounge at right, stitched pouf.
  const folding = group(root, [-2.55, 0.115, 2.28]);
  folding.rotation.y = 1.89;
  folding.name = "bohemian-folding-chair";
  for (const x of [-0.46, 0.46]) {
    tube(
      folding,
      [
        [x, 0.02, -0.53],
        [x, 0.63, 0],
        [x, 1.28, -0.56],
      ],
      0.038,
      m.wood,
    );
    tube(
      folding,
      [
        [x, 0.02, 0.55],
        [x, 0.66, -0.31],
      ],
      0.038,
      m.wood,
    );
    box(folding, [0.07, 0.075, 0.91], [x, 0.82, -0.01], m.wood, 0.02);
  }
  for (let i = 0; i < 10; i++)
    box(
      folding,
      [0.9, 0.043, 0.07],
      [0, 0.56, -0.39 + i * 0.086],
      m.wood,
      0.01,
    );
  const fb = box(folding, [0.88, 0.65, 0.065], [0, 0.99, -0.43], m.wood, 0.017);
  fb.rotation.x = -0.16;
  pad(folding, [0, 0.62, 0], 0.83, 0.76, m.stripe);
  pillow(folding, [0, 0.97, -0.3], m.pattern, 0.6);
  touch(folding, "木质折叠椅", "坐下来，晒一会儿夕阳。");
  const lounge = rattanChair([3.1, 0.06, 2.13], -1.25, 1.08);
  lounge.name = "bohemian-rattan-lounge";
  drape(lounge, [0.37, 0.04, 0], 0.4, m.sage);
  const mosaic = group(root, [2.65, 0.055, 0.74]);
  mosaic.name = "bohemian-mosaic-table";
  cylinder(mosaic, 0.57, 0.57, 0.06, [0, 0.76, 0], m.mosaic, 64);
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    tube(
      mosaic,
      [
        [Math.sin(a) * 0.43, 0, Math.cos(a) * 0.43],
        [Math.sin(a) * 0.28, 0.47, Math.cos(a) * 0.28],
        [Math.sin(a) * 0.42, 0.73, Math.cos(a) * 0.42],
      ],
      0.027,
      m.wood,
    );
  }
  plant(mosaic, [0.13, 0.793, -0.12], m, 0.29);
  cup(mosaic, [-0.24, 0.793, 0.04]);
  candle(mosaic, [0.15, 0.793, 0.25]);
  touch(mosaic, "马赛克圆桌", "小小一隅，也有旅行的颜色。");
  const pouf = group(root, [1.51, 0.115, 3.13]);
  pouf.name = "bohemian-leather-pouf";
  sphere(pouf, [0.63, 0.36, 0.63], [0, 0.36, 0], m.leather);
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    tube(
      pouf,
      [
        [Math.sin(a) * 0.08, 0.71, Math.cos(a) * 0.08],
        [Math.sin(a) * 0.43, 0.63, Math.cos(a) * 0.43],
        [Math.sin(a) * 0.62, 0.35, Math.cos(a) * 0.62],
        [Math.sin(a) * 0.45, 0.08, Math.cos(a) * 0.45],
      ],
      0.005,
      m.taupe,
    );
  }
  torus(pouf, 0.16, 0.006, [0, 0.709, 0], m.taupe);
  touch(pouf, "皮革绗缝坐墩", "把脚步放慢一点。");
  const stump = group(root, [-1.75, 0.03, 3.88]);
  cylinder(stump, 0.37, 0.4, 0.52, [0, 0.26, 0], m.wood, 16);
  for (let i = 0; i < 15; i++) {
    const a = (i * Math.PI * 2) / 15;
    tube(
      stump,
      [
        [Math.sin(a) * 0.4, 0.02, Math.cos(a) * 0.4],
        [Math.sin(a) * 0.37, 0.51, Math.cos(a) * 0.37],
      ],
      0.009,
      m.dark,
    );
  }
  candle(stump, [-0.13, 0.528, -0.04]);
  pottery(stump, [0.14, 0.528, 0.02], 0.29, m.ceramic, "bowl");
  touch(stump, "树桩边桌", "木头仍然留着自然的纹路。");
  const floorPad = pad(root, [2.76, 0.13, 3.98], 0.91, 0.67, m.stripe);
  floorPad.rotation.y = 0.19;
  touch(floorPad, "条纹地垫", "随意坐下，也很舒服。");
  pad(root, [2.42, 0.105, 4.06], 0.91, 0.7, m.linen);
  // Layered planting frames, rather than covers, the furniture.
  plant(root, [3.7, 0.027, -2.45], m, 1.11);
  plant(root, [4.49, 0.027, -1.57], m, 0.76);
  plant(root, [0.24, 0.027, -3.45], m, 0.88);
  plant(root, [-3.4, 0.027, -3.28], m, 0.72);
  const reeds = pottery(root, [4.44, 0.025, -0.82], 1.03, m.clay);
  for (let i = 0; i < 9; i++) {
    const x = Math.sin(i * 2.4) * 0.29,
      z = Math.cos(i * 2.4) * 0.16,
      h = 1.45 + (i % 3) * 0.18;
    tube(
      reeds,
      [
        [0, 0.57, 0],
        [x * 0.5, 1, z],
        [x, h, z],
      ],
      0.005,
      m.taupe,
    );
    const tuft = sphere(reeds, [0.05, 0.22, 0.045], [x, h + 0.09, z], m.taupe);
    tuft.rotation.z = -x * 0.5;
  }
  lantern(root, [4.1, 0.025, -0.34], 0.8, 2.2);
  plant(root, [4.27, 0.025, 3.51], m, 0.63);
  // Split leaves distinguish the broad foreground plant from the trailing vines.
  const monstera = group(root, [3.75, 0.025, -1.31]);
  pottery(monstera, [0, 0, 0], 0.85, m.clay);
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, -0.35);
  leafShape.bezierCurveTo(-0.2, -0.2, -0.31, 0.13, -0.21, 0.31);
  leafShape.bezierCurveTo(-0.09, 0.43, 0, 0.29, 0, 0.24);
  leafShape.bezierCurveTo(0.05, 0.42, 0.23, 0.44, 0.25, 0.25);
  leafShape.bezierCurveTo(0.31, 0.03, 0.12, -0.22, 0, -0.35);
  for (const sign of [-1, 1])
    for (let i = 0; i < 3; i++) {
      const hole = new THREE.Path();
      hole.absellipse(
        sign * (0.09 + i * 0.025),
        -0.08 + i * 0.12,
        0.019,
        0.055,
        0,
        Math.PI * 2,
        false,
        -sign * 0.45,
      );
      leafShape.holes.push(hole);
    }
  const leafGeometry = new THREE.ShapeGeometry(leafShape, 12);
  const broadMaterial = m.leaf.clone();
  broadMaterial.side = THREE.DoubleSide;
  for (let i = 0; i < 9; i++) {
    const a = i * 2.399,
      h = 0.97 + (i % 3) * 0.25,
      x = Math.sin(a) * 0.36,
      z = Math.cos(a) * 0.32;
    tube(
      monstera,
      [
        [0, 0.47, 0],
        [x * 0.5, h - 0.22, z * 0.5],
        [x, h, z],
      ],
      0.011,
      m.leaf,
    );
    const leaf = new THREE.Mesh(leafGeometry, broadMaterial);
    leaf.position.set(x, h + 0.25, z);
    leaf.rotation.set(-0.35, a, Math.sin(a) * 0.35);
    leaf.castShadow = leaf.receiveShadow = true;
    monstera.add(leaf);
  }
  return {
    root,
    lamps,
    update(dt, t) {
      for (const e of motions) {
        e.t = Math.min(1, e.t + dt * 1.9);
        e.o.position.y = e.y + Math.sin(e.t * Math.PI) * 0.026;
      }
      for (const d of drawers)
        d.o.position.z = damp(
          d.o.position.z,
          d.z + ((d.key ? store.state[d.key] : d.on) ? 0.34 : 0),
          dt,
          3,
        );
      for (const d of doors)
        d.o.rotation.y = damp(
          d.o.rotation.y,
          store.state.wardrobe ? d.sign * 1.1 : 0,
          dt,
          3,
        );
    },
    reset() {
      for (const e of motions) {
        e.t = 1;
        e.o.position.y = e.y;
      }
      for (const d of drawers) {
        d.on = false;
        d.o.position.z = d.z;
      }
    },
  };
}
