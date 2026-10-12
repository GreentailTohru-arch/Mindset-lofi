import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import {
  pottery,
  books,
  plant,
  trailing,
  branches,
  teaSet,
} from "../dongfang/details.js";
import { damp } from "../../state.js";
export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "uyghur-furniture";
  const lamps = [],
    motions = [],
    doors = [];
  const named = (o, n) => ((o.name = "uyghur-" + n), o);
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
    const g = pottery(p, pos, 0.33, m.ceramic, "bowl");
    torus(g, 0.071, 0.013, [0.074, 0.048, 0], m.bronze, [0, 0, 0]);
    return g;
  }
  function lampRecord(g, shade, key, power, local) {
    root.updateMatrixWorld(true);
    lamps.push({
      shade,
      key,
      power,
      pos: g.localToWorld(new THREE.Vector3(...local)).toArray(),
    });
  }
  function candle(p, pos, power = 0) {
    const g = group(p, pos);
    cylinder(g, 0.09, 0.14, 0.04, [0, 0.025, 0], m.bronze);
    cylinder(g, 0.045, 0.06, 0.12, [0, 0.1, 0], m.bronze);
    pottery(g, [0, 0.16, 0], 0.48, m.bronze, "bowl");
    const glow = m.glow.clone();
    sphere(g, [0.027, 0.078, 0.027], [0, 0.3, 0], glow);
    lampRecord(g, glow, "floorLamp", power, [0, 0.35, 0.04]);
    return g;
  }
  function lantern(p, pos, power = 0) {
    const g = group(p, pos);
    cylinder(g, 0.16, 0.23, 0.09, [0, 0.065, 0], m.bronze, 6);
    cylinder(g, 0.025, 0.225, 0.2, [0, 0.64, 0], m.bronze, 6);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      box(
        g,
        [0.025, 0.47, 0.025],
        [Math.cos(a) * 0.18, 0.34, Math.sin(a) * 0.18],
        m.bronze,
      );
    }
    const shade = m.glow.clone();
    cylinder(g, 0.13, 0.13, 0.37, [0, 0.32, 0], shade, 6);
    torus(g, 0.07, 0.014, [0, 0.8, 0], m.bronze, [0, 0, 0]);
    lampRecord(g, shade, "floorLamp", power, [0, 0.35, 0]);
    return g;
  }
  function basket(p, pos, r = 0.22) {
    const g = group(p, pos);
    cylinder(g, r, r * 0.84, r * 1.5, [0, r * 0.75, 0], m.woven, 24);
    for (let i = 0; i < 13; i++)
      torus(
        g,
        r * (0.85 + i * 0.011),
        0.012,
        [0, 0.03 + i * r * 0.112, 0],
        m.taupe,
      );
    torus(g, r * 0.65, 0.023, [0, r * 1.7, 0], m.taupe, [0, 0, 0]);
    return g;
  }
  function rug(pos, w, d, mat) {
    const g = group(root, pos);
    box(g, [w, 0.027, d], [0, 0, 0], mat, 0.008);
    for (const z of [-d / 2, d / 2])
      for (let x = -w / 2 + 0.04; x < w / 2; x += 0.075)
        box(g, [0.015, 0.01, 0.11], [x, 0, z + Math.sign(z) * 0.035], m.taupe);
    return g;
  }
  function panel(p, pos, w, h) {
    box(p, [w, h, 0.045], pos, m.painted, 0.009);
    for (const x of [-w / 2, w / 2])
      box(
        p,
        [0.025, h + 0.04, 0.05],
        [pos[0] + x, pos[1], pos[2] + 0.005],
        m.wood,
      );
    for (const y of [-h / 2, h / 2])
      box(
        p,
        [w + 0.04, 0.025, 0.05],
        [pos[0], pos[1] + y, pos[2] + 0.006],
        m.wood,
      );
  }
  function table(p, pos, w, d, h) {
    const g = group(p, pos);
    box(g, [w, 0.13, d], [0, h - 0.065, 0], m.wood, 0.018);
    for (const x of [-w / 2 + 0.14, w / 2 - 0.14])
      for (const z of [-d / 2 + 0.14, d / 2 - 0.14]) {
        box(g, [0.17, h - 0.12, 0.17], [x, (h - 0.12) / 2, z], m.dark, 0.02);
        sphere(g, [0.115, 0.08, 0.115], [x, 0.16, z], m.wood);
      }
    panel(g, [0, h - 0.23, d / 2 - 0.015], w - 0.23, 0.23);
    box(g, [w - 0.28, 0.07, d - 0.25], [0, 0.18, 0], m.dark);
    return g;
  }
  function pillow(p, pos, mat, w = 0.6) {
    const o = box(p, [w, 0.56, 0.19], pos, mat, 0.055);
    o.rotation.x = -0.14;
    o.rotation.z = pos[0] * 0.028;
    return o;
  }
  function scrollwork(p, pos, w) {
    const g = group(p, pos);
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * w * 0.29;
      torus(g, w * 0.105, 0.022, [x, 0, 0], m.wood, [0, 0, 0], Math.PI * 1.7);
      sphere(g, [0.027, 0.043, 0.019], [x + w * 0.07, 0.04, 0], m.bronze);
    }
    return g;
  }
  function lattice(p, pos, w, h, rotation = 0) {
    const g = group(p, pos);
    g.rotation.y = rotation;
    for (const sign of [-1, 1])
      for (let k = -h; k < w + h; k += 0.19) {
        const points = [];
        for (let i = 0; i <= 40; i++) {
          const y = -h / 2 + (h * i) / 40,
            x = k + sign * (y + h / 2) - w / 2;
          if (x >= -w / 2 && x <= w / 2) points.push([x, y, 0]);
        }
        if (points.length > 1)
          tube(g, [points[0], points.at(-1)], 0.018, m.wood);
      }
    for (const x of [-w / 2, w / 2]) box(g, [0.04, h, 0.06], [x, 0, 0], m.dark);
    for (const y of [-h / 2, h / 2])
      box(g, [w, 0.045, 0.06], [0, y, 0], m.dark);
    return g;
  }
  function drape(p, x) {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.11, -0.47),
      new THREE.Vector3(0, 1.19, -0.23),
      new THREE.Vector3(0, 0.66, 0.13),
      new THREE.Vector3(0, 0.64, 0.67),
      new THREE.Vector3(0, 0.12, 0.84),
    ]);
    const geo = new THREE.PlaneGeometry(0.71, 1, 25, 40),
      a = geo.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const xx = a.getX(i),
        q = path.getPoint(0.5 - a.getY(i));
      a.setXYZ(i, xx, q.y + Math.sin(xx * 62 + q.z * 3) * 0.02, q.z);
    }
    geo.computeVertexNormals();
    const mat = m.ikat.clone();
    mat.side = THREE.DoubleSide;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = x;
    mesh.castShadow = mesh.receiveShadow = true;
    p.add(mesh);
    for (let i = 0; i < 13; i++)
      tube(
        p,
        [
          [x - 0.35 + i * 0.055, 0.14, 0.84],
          [x - 0.35 + i * 0.055, 0.04, 0.89],
        ],
        0.007,
        m.taupe,
      );
  }
  // Left window seating and narrow woven runner.
  const bench = named(group(root, [-4.36, 0.04, 0.89]), "window-bench");
  bench.rotation.y = Math.PI / 2;
  box(bench, [5.1, 0.5, 0.76], [0, 0.26, 0], m.dark, 0.014);
  box(bench, [5.22, 0.1, 0.84], [0, 0.56, 0], m.wood, 0.018);
  for (let i = 0; i < 4; i++)
    panel(bench, [-1.89 + i * 1.26, 0.28, 0.406], 1.16, 0.38);
  for (const [x, mat] of [
    [-1.8, m.rug],
    [-0.5, m.pattern],
    [1.28, m.creamPattern],
  ])
    box(bench, [0.99, 0.16, 0.64], [x, 0.69, 0], mat, 0.045);
  plant(bench, [0.46, 0.62, -0.05], m, 0.43);
  lantern(bench, [2, 0.62, 0]);
  pottery(bench, [-0.53, 0.79, 0], 0.8, m.bronze, "bowl");
  for (let i = 0; i < 6; i++)
    sphere(
      bench,
      [0.09, 0.08, 0.09],
      [-0.71 + (i % 3) * 0.16, 0.87, -0.08 + Math.floor(i / 3) * 0.13],
      m.copper,
    );

  basket(root, [-4.22, 0.05, -2.15], 0.29);
  rug([-3.58, 0.058, 1], 1.04, 4.95, m.rug);
  touch(bench, "彩绘窗边长凳", "窗外绿洲，杯中暖茶。");
  // Rear carved cabinet, arranged like the reference in the back-left corner.
  const shelf = named(group(root, [-2.72, 0.04, -4.44]), "painted-bookcase");
  lattice(shelf, [0, 2.16, -0.38], 2.73, 2.23);
  const wing = group(root, [-4.36, 0.04, -3.1]);
  wing.rotation.y = Math.PI / 2;
  for (const x of [-0.73, 0.73])
    box(wing, [0.12, 2.95, 0.68], [x, 1.5, 0], m.wood);
  for (const y of [0.12, 0.97, 1.66, 2.32, 2.95])
    box(wing, [1.58, 0.09, 0.72], [0, y, 0], m.wood);
  lattice(wing, [0, 1.98, -0.3], 1.42, 1.92);
  panel(wing, [0, 0.52, 0.37], 1.39, 0.7);
  books(wing, [-0.27, 1.72, 0.02], m, 5, true);
  pottery(wing, [0.38, 2.38, 0], 0.56, m.ceramic);
  pottery(wing, [-0.35, 2.38, 0], 0.53, m.copper);
  basket(wing, [0.2, 1.02, 0], 0.2);

  for (const x of [-1.39, 1.39])
    box(shelf, [0.17, 3.36, 0.84], [x, 1.7, 0], m.wood, 0.015);
  for (const y of [0.11, 0.97, 1.73, 2.49, 3.27])
    box(shelf, [2.97, 0.105, 0.88], [0, y, 0], m.wood, 0.012);
  box(shelf, [0.1, 2.24, 0.8], [0.5, 2.14, 0], m.dark);
  for (let i = 0; i < 3; i++) {
    const d = group(shelf, [-0.94 + i * 0.94, 0.53, 0.458]);
    panel(d, [0, 0, 0], 0.85, 0.69);
    doors.push({ o: d, base: 0.458, key: "wardrobe" });
    register(d, "彩绘柜门", "按压开启", () => {
      store.set("wardrobe", !store.state.wardrobe);
      return "手工器物，各归其位。";
    });
  }
  for (const [pos, scale, mat] of [
    [[-1, 1.03, 0], 0.63, m.bronze],
    [[0.89, 1.03, 0], 0.52, m.ceramic],
    [[-1.04, 1.79, 0], 0.73, m.bronze],
    [[0.94, 1.79, 0], 0.9, m.ceramic],
    [[-0.45, 2.55, 0], 0.68, m.bronze],
    [[0.94, 2.55, 0], 0.69, m.ceramic],
  ])
    pottery(shelf, pos, scale, mat);
  books(shelf, [-0.36, 1.03, 0.08], m, 3);
  books(shelf, [-0.22, 1.79, 0.05], m, 4, true);
  books(shelf, [0.02, 2.55, 0.05], m, 3);
  for (const [x, y] of [
    [-0.68, 3.34],
    [-0.61, 1.08],
  ]) {
    box(shelf, [0.58, 0.32, 0.4], [x, y + 0.16, 0], m.dark, 0.02);
    panel(shelf, [x, y + 0.16, 0.218], 0.51, 0.22);
  }
  for (let i = 0; i < 3; i++)
    box(
      shelf,
      [0.62, 0.08, 0.44],
      [-0.6, 1.15 + i * 0.09, 0.05],
      i % 2 ? m.pattern : m.rug,
      0.018,
    );
  trailing(shelf, [1.1, 3.36, 0.46], m, 1.03);
  plant(shelf, [-0.2, 3.33, 0], m, 0.52);
  trailing(wing, [-0.65, 2.99, 0.36], m, 0.72);
  pottery(shelf, [0.39, 3.32, 0], 0.46, m.bronze);
  touch(shelf, "雕刻木质柜架", "铜器与织物，保存着手作的温度。");
  // Rear wall hanging, narrow woven companions and long painted sideboard.
  const tapestry = named(
    box(root, [2.48, 1.67, 0.045], [1.79, 2.77, -4.77], m.tapestry),
    "floral-tapestry",
  );
  for (const x of [0.18, 3.4])
    box(root, [0.34, 1.09, 0.035], [x, 2.73, -4.77], m.pattern);
  for (const y of [1.91, 3.63])
    box(root, [2.6, 0.05, 0.045], [1.79, y, -4.79], m.wood);
  const sideboard = named(group(root, [1.7, 0.04, -4.34]), "painted-sideboard");
  box(sideboard, [3.56, 0.78, 0.75], [0, 0.45, 0], m.dark, 0.02);
  box(sideboard, [3.67, 0.13, 0.86], [0, 0.9, 0], m.wood, 0.018);
  for (let i = 0; i < 4; i++)
    panel(sideboard, [-1.32 + i * 0.88, 0.48, 0.402], 0.79, 0.55);
  plant(sideboard, [-1.32, 0.98, 0], m, 0.45);
  books(sideboard, [-0.63, 0.98, 0], m, 2);
  pottery(sideboard, [0.16, 0.98, 0], 0.67, m.bronze, "bowl");
  pottery(sideboard, [0.91, 0.98, 0.03], 0.73, m.ceramic);
  pottery(sideboard, [1.45, 0.98, -0.05], 0.47, m.bronze);
  candle(sideboard, [0.7, 0.98, 0.09]);
  // Writing area occupies the right side rather than the center of the rear wall.
  const desk = named(
    table(root, [3.53, 0.045, -2.73], 2.34, 1.03, 1.08),
    "writing-desk",
  );
  box(desk, [0.41, 0.012, 1.02], [0.4, 1.088, 0], m.ikat);
  books(desk, [0.71, 1.1, -0.12], m, 2);
  box(desk, [0.63, 0.018, 0.43], [-0.22, 1.09, 0.13], m.paper, 0.003);
  box(desk, [0.012, 0.008, 0.42], [-0.22, 1.104, 0.13], m.taupe);
  cup(desk, [0.58, 1.1, 0.26]);
  cylinder(desk, 0.07, 0.06, 0.2, [0.9, 1.19, 0.11], m.dark);
  for (let i = 0; i < 4; i++)
    cylinder(
      desk,
      0.006,
      0.006,
      0.29,
      [0.875 + i * 0.018, 1.39, 0.11],
      m.dark,
      8,
    );
  const dl = group(desk, [-0.81, 1.09, -0.13]);
  cylinder(dl, 0.12, 0.16, 0.045, [0, 0.025, 0], m.bronze);
  cylinder(dl, 0.027, 0.038, 0.33, [0, 0.2, 0], m.bronze);
  sphere(dl, [0.25, 0.17, 0.25], [0, 0.46, 0], m.bronze);
  const shade = m.glow.clone();
  sphere(dl, [0.2, 0.027, 0.2], [0, 0.39, 0], shade);
  lampRecord(dl, shade, "bedLamp", 3.1, [0, 0.34, 0.05]);
  touch(dl, "铜质书桌灯", "", () => {
    store.set("bedLamp", !store.state.bedLamp);
    return "把暖光留在空白的一页。";
  });
  rug([3.51, 0.059, -2.06], 2.48, 2.32, m.pattern);
  basket(root, [4.61, 0.05, -1.77], 0.27);
  pottery(root, [4.64, 0.05, -3.67], 1.22, m.bronze);
  branches(root, [4.64, 0.91, -3.67], m, 0.61);
  const dc = group(root, [3.53, 0.05, -1.76]);
  dc.rotation.y = Math.PI;
  for (const x of [-0.33, 0.33])
    for (const z of [-0.31, 0.31])
      box(dc, [0.09, 0.58, 0.09], [x, 0.29, z], m.wood);
  box(dc, [0.76, 0.13, 0.72], [0, 0.61, 0], m.rug, 0.025);
  box(dc, [0.77, 0.7, 0.13], [0, 0.93, -0.32], m.dark, 0.015);
  panel(dc, [0, 0.97, -0.242], 0.59, 0.43);
  box(dc, [0.57, 0.47, 0.04], [0, 0.97, -0.208], m.pattern, 0.02);
  // Central red woven sofa with real scroll-shaped arm carving.
  const sofa = named(group(root, [-0.16, 0.05, -0.37]), "red-carved-sofa");
  box(sofa, [4.25, 0.28, 1.32], [0, 0.3, 0], m.dark, 0.02);
  panel(sofa, [0, 0.28, 0.68], 3.99, 0.24);
  for (const x of [-1.96, 1.96])
    for (const z of [-0.49, 0.49])
      box(sofa, [0.17, 0.26, 0.17], [x, 0.13, z], m.wood, 0.02);
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 1.29;
    box(sofa, [1.27, 0.27, 1.16], [x, 0.59, 0.04], m.red, 0.055);
    box(sofa, [1.29, 0.74, 0.21], [x, 0.97, -0.52], m.red, 0.04);
  }
  box(sofa, [4.07, 0.1, 0.13], [0, 1.37, -0.56], m.wood, 0.022);
  for (const x of [-2.11, 2.11]) {
    lattice(sofa, [x, 0.76, 0], 1.34, 0.5, Math.PI / 2);
    for (const z of [-0.64, 0.64]) {
      box(sofa, [0.12, 1.02, 0.12], [x, 0.57, z], m.dark);
      sphere(sofa, [0.105, 0.105, 0.105], [x, 1.17, z], m.wood);
    }
    box(sofa, [0.2, 0.11, 1.46], [x, 1.08, 0], m.wood, 0.025);
    const scroll = scrollwork(sofa, [x + 0.1, 0.83, 0], 1.15);
    scroll.rotation.y = Math.PI / 2;
  }
  for (const [x, mat] of [
    [-1.48, m.pattern],
    [-0.72, m.ikat],
    [0.06, m.creamPattern],
    [0.82, m.creamPattern],
    [1.47, m.ikat],
  ])
    pillow(sofa, [x, 1.06, -0.29], mat, 0.63);
  drape(sofa, 1.56);
  touch(sofa, "雕花木坐榻", "深红织物，把暮色变得温暖。");
  rug([0.02, 0.058, 1.57], 6.35, 5.3, m.creamPattern);
  rug([0.04, 0.082, 1.52], 6.1, 5.06, m.rug);
  rug([-2.1, 0.064, 4.18], 3.35, 0.74, m.pattern);
  const coffee = named(group(root, [-0.16, 0.1, 2.03]), "octagonal-tea-table");
  cylinder(coffee, 1.12, 1.12, 0.13, [0, 0.64, 0], m.wood, 8).name =
    "uyghur-octagonal-top";
  cylinder(coffee, 0.93, 0.98, 0.075, [0, 0.14, 0], m.dark, 8);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4,
      x = Math.sin(a) * 0.97,
      z = Math.cos(a) * 0.97;
    box(coffee, [0.09, 0.48, 0.09], [x, 0.36, z], m.dark);
    const face = group(coffee, [
      Math.sin(a + Math.PI / 8) * 0.91,
      0.39,
      Math.cos(a + Math.PI / 8) * 0.91,
    ]);
    face.rotation.y = a + Math.PI / 8;
    lattice(face, [0, 0, 0], 0.68, 0.38);
  }
  for (const radius of [0.99, 0.85]) {
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const a = (i * Math.PI) / 4;
      pts.push([Math.sin(a) * radius, 0.71, Math.cos(a) * radius]);
    }
    tube(coffee, pts, 0.009, m.bronze);
  }
  teaSet(coffee, [0, 0.72, 0.05], { ...m, celadon: m.copper }, 1);
  pottery(coffee, [-0.6, 0.72, -0.22], 0.44, m.ceramic);
  branches(coffee, [-0.6, 1.03, -0.22], m, 0.36);
  books(coffee, [0.5, 0.72, -0.13], m, 2);
  candle(coffee, [-0.57, 0.72, 0.44]);
  cup(coffee, [0.47, 0.72, 0.47]);
  touch(coffee, "八角雕花茶几", "铜壶里，留一杯温热。");
  function chair(pos, rot) {
    const g = group(root, pos);
    g.rotation.y = rot;
    for (const x of [-0.48, 0.48])
      for (const z of [-0.44, 0.44])
        box(g, [0.14, 0.55, 0.14], [x, 0.275, z], m.wood, 0.018);
    box(g, [1.1, 0.15, 1.1], [0, 0.5, 0], m.dark, 0.02);
    box(g, [0.99, 0.19, 0.99], [0, 0.67, 0.015], m.pattern, 0.045);
    box(g, [1.09, 0.71, 0.14], [0, 0.94, -0.46], m.wood, 0.015);
    box(g, [0.92, 0.53, 0.11], [0, 1, -0.36], m.rug, 0.03);
    for (const x of [-0.55, 0.55]) {
      box(g, [0.13, 0.1, 1.12], [x, 0.99, 0], m.wood, 0.02);
      box(g, [0.09, 0.45, 0.09], [x, 0.76, 0.44], m.wood);
      const s = scrollwork(g, [x, 0.82, 0], 0.9);
      s.rotation.y = Math.PI / 2;
    }
    pillow(g, [0.05, 0.95, -0.19], m.creamPattern, 0.63);
    touch(g, "雕花织物休闲椅", "慢慢坐下，听庭院的风。");
    return g;
  }
  named(chair([-2.76, 0.05, 2.19], 2.05), "front-left-chair");
  named(chair([2.59, 0.05, 3.05], -2.03), "front-right-chair");
  const pouf = named(group(root, [0.85, 0.11, 3.76]), "embroidered-pouf");
  cylinder(pouf, 0.49, 0.5, 0.42, [0, 0.24, 0], m.pattern, 48);
  sphere(pouf, [0.5, 0.115, 0.5], [0, 0.47, 0], m.rug);
  torus(pouf, 0.495, 0.012, [0, 0.44, 0], m.bronze);
  touch(pouf, "刺绣软墩", "织物的色彩，温柔地相遇。");
  const side = named(group(root, [-1.97, 0.07, 3.6]), "lantern-side-table");
  cylinder(side, 0.34, 0.33, 0.5, [0, 0.27, 0], m.painted, 8);
  cylinder(side, 0.4, 0.4, 0.07, [0, 0.555, 0], m.wood, 8);
  lantern(side, [0, 0.6, 0]);
  cup(side, [0.26, 0.6, 0.12]);
  basket(root, [2.15, 0.07, 4.18], 0.32);
  box(root, [0.43, 0.15, 0.4], [2.16, 0.5, 4.18], m.ikat, 0.03);
  const slippers = named(
    group(root, [1.53, 0.06, 4.49]),
    "embroidered-slippers",
  );
  for (const x of [-0.15, 0.15]) {
    const shoe = group(slippers, [x, 0, 0]);
    shoe.rotation.y = 0.2 + x;
    box(shoe, [0.19, 0.055, 0.42], [0, 0.04, 0], m.dark, 0.045);
    sphere(shoe, [0.091, 0.075, 0.13], [0, 0.095, -0.08], m.pattern);
  }
  // Niche flames and copper pendant; four actual point lights keep rendering lean.
  candle(root, [-4.77, 2.49, -3.5], 2);
  candle(root, [-0.83, 2.22, -4.92], 2);
  candle(root, [4.23, 1.98, -4.92]);
  lantern(root, [-4.81, 1.52, 4.25]);
  pottery(root, [-4.33, 0.055, 4.22], 1.12, m.ceramic);
  plant(root, [-4.33, 0.8, 4.22], m, 0.53);
  const hanging = lantern(root, [-3.89, 2.77, -2.33], 3.8);
  tube(
    root,
    [
      [-3.89, 3.6, -2.33],
      [-3.89, 4.07, -2.33],
    ],
    0.016,
    m.bronze,
  );
  touch(hanging, "铜质吊灯", "", () => {
    store.set("floorLamp", !store.state.floorLamp);
    return "金色灯火，照亮手作纹理。";
  });
  lantern(root, [-4.55, 0.07, 3.87]);
  pottery(root, [-4.48, 0.05, -3.51], 1.14, m.clay);
  branches(root, [-4.48, 0.85, -3.51], m, 0.7);
  return {
    root,
    lamps,
    update(dt) {
      for (const e of motions) {
        e.t = Math.min(1, e.t + dt * 1.9);
        e.o.position.y = e.y + Math.sin(e.t * Math.PI) * 0.022;
      }
      for (const d of doors)
        d.o.position.z = damp(
          d.o.position.z,
          d.base + (store.state[d.key] ? 0.24 : 0),
          dt,
          3,
        );
    },
    reset() {
      for (const e of motions) {
        e.t = 1;
        e.o.position.y = e.y;
      }
      for (const d of doors) d.o.position.z = d.base;
    },
  };
}
