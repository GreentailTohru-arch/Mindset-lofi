import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import { pottery, books, plant } from "../dongfang/details.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "italian-furniture";
  const lamps = [],
    motions = [],
    doors = [];
  const touch = (o, name, message) => {
    const a = { o, y: o.position.y, t: 1 };
    motions.push(a);
    register(o, name, "轻触", () => {
      a.t = 0;
      return message;
    });
  };
  const bookMaterials = { ...m, sage: m.taupe };
  function cup(parent, pos) {
    const g = pottery(parent, pos, 0.29, m.ceramic, "bowl");
    torus(g, 0.11, 0.027, [0.2, 0.1, 0], m.ceramic, [0, 0, 0]);
    return g;
  }
  function bowl(parent, pos, scale = 0.7) {
    return pottery(parent, pos, scale, m.ceramic, "bowl");
  }
  function twigs(parent, pos, scale = 1) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    for (let i = 0; i < 5; i++) {
      const x = Math.sin(i * 2.4) * 0.28,
        z = Math.cos(i * 2.4) * 0.17,
        y = 0.42 + i * 0.12;
      tube(
        g,
        [
          [0, 0, 0],
          [x * 0.3, y * 0.35, z * 0.3],
          [x, y, z],
          [x + 0.035, y + 0.14, z],
        ],
        0.006,
        m.dark,
      );
      tube(
        g,
        [
          [x * 0.5, y * 0.6, z * 0.5],
          [x - 0.12, y + 0.01, z + 0.04],
        ],
        0.003,
        m.dark,
      );
      if (i % 2) sphere(g, [0.018, 0.055, 0.008], [x, y, z], m.leaf);
    }
    return g;
  }
  function tree(pos, scale = 1) {
    const g = group(root, pos);
    g.scale.setScalar(scale);
    const profile = [
      [0.23, 0],
      [0.31, 0.04],
      [0.37, 0.24],
      [0.36, 0.46],
      [0.3, 0.61],
      [0.27, 0.61],
      [0.29, 0.46],
      [0.25, 0.13],
      [0, 0.13],
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
    cylinder(g, 0.26, 0.26, 0.01, [0, 0.57, 0], m.soil);
    tube(
      g,
      [
        [0, 0.55, 0],
        [0.015, 1.15, 0],
        [-0.04, 1.66, 0.02],
        [0.03, 2.04, 0],
      ],
      0.028,
      m.wood,
    );
    const entries = [];
    for (let i = 0; i < 12; i++) {
      const a = i * 2.399,
        h = 1 + i * 0.09,
        x = Math.cos(a) * 0.44,
        z = Math.sin(a) * 0.34;
      tube(
        g,
        [
          [0, h - 0.12, 0],
          [x * 0.5, h + 0.06, z * 0.5],
          [x, h + 0.25, z],
        ],
        0.008,
        m.wood,
      );
      for (let j = 0; j < 11; j++) {
        const t = j / 10;
        entries.push([
          x * t + Math.sin(j * 2.4) * 0.09,
          h + 0.14 + t * 0.22,
          z * t + Math.cos(j * 2.4) * 0.1,
          a,
          j,
        ]);
      }
    }
    const leaves = new THREE.InstancedMesh(
        new THREE.SphereGeometry(1, 8, 6),
        m.leafLight,
        entries.length,
      ),
      d = new THREE.Object3D();
    entries.forEach(([x, y, z, a, j], i) => {
      d.position.set(x, y, z);
      d.scale.set(0.023, 0.09, 0.01);
      d.rotation.set(0.3, a, j % 2 ? 0.72 : -0.72);
      d.updateMatrix();
      leaves.setMatrixAt(i, d.matrix);
    });
    leaves.castShadow = true;
    g.add(leaves);
    return g;
  }
  function strip(parent, size, pos) {
    const shade = m.glow.clone();
    const mesh = box(parent, size, pos, shade);
    mesh.castShadow = false;
    lamps.push({ shade, key: "whiteOn", power: 0, pos: [0, 0, 0] });
  }
  function panel(parent, pos, w, h, name) {
    const g = group(parent, [pos[0] - w / 2, pos[1], pos[2]]);
    g.name = name;
    box(g, [w, h, 0.055], [w / 2, 0, 0], m.wood, 0.003);
    const d = { g, open: false };
    doors.push(d);
    register(g, "无把手柜门", "轻按开合", () => {
      d.open = !d.open;
      return d.open ? "轻按柜门，收纳缓缓展开。" : "柜门归位，接缝恢复平整。";
    });
    return g;
  }
  function lamp(parent, pos, name, floor = false) {
    const g = group(parent, pos),
      shade = m.glow.clone();
    if (floor) {
      cylinder(g, 0.2, 0.21, 0.04, [0, 0.02, 0], m.black);
      tube(
        g,
        [
          [0, 0.03, 0],
          [0, 1.54, 0],
          [0.08, 1.78, 0],
          [0.45, 1.84, 0],
          [0.6, 1.78, 0],
        ],
        0.014,
        m.black,
      );
      const hood = sphere(g, [0.16, 0.06, 0.11], [0.6, 1.77, 0], m.black);
      cylinder(g, 0.12, 0.12, 0.013, [0.6, 1.734, 0], shade);
    } else {
      cylinder(g, 0.13, 0.14, 0.026, [0, 0.014, 0], m.black);
      cylinder(g, 0.018, 0.018, 0.39, [0, 0.22, 0], m.black);
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        m.black,
      );
      cap.position.y = 0.43;
      cap.castShadow = true;
      g.add(cap);
      cylinder(g, 0.215, 0.215, 0.012, [0, 0.425, 0], shade);
    }
    root.updateMatrixWorld(true);
    lamps.push({
      shade,
      key: floor ? "floorLamp" : "bedLamp",
      power: floor ? 4 : 3,
      pos: g
        .localToWorld(
          new THREE.Vector3(floor ? 0.6 : 0, floor ? 1.73 : 0.42, 0),
        )
        .toArray(),
    });
    register(g, name, "开关", () => {
      const key = floor ? "floorLamp" : "bedLamp";
      store.set(key, !store.state[key]);
      return store.state[key] ? "一盏柔光，恰到好处。" : "灯光渐渐熄灭。";
    });
    return g;
  }
  function chair(pos, angle, material, desk = false) {
    const g = group(root, pos);
    g.rotation.y = angle;
    const w = desk ? 0.65 : 1.13,
      d = desk ? 0.59 : 1.04,
      h = desk ? 0.56 : 0.42;
    for (const x of [-w * 0.44, w * 0.44])
      for (const z of [-d * 0.42, d * 0.42])
        box(
          g,
          [0.024, h + 0.05, 0.024],
          [x, (h + 0.05) / 2, z],
          m.black,
          0.005,
        );
    box(g, [w, 0.14, d], [0, h, 0], material, 0.055);
    box(g, [w - 0.15, 0.15, d - 0.09], [0, h + 0.1, 0.02], material, 0.045);
    const back = box(
      g,
      [w, 0.55, 0.16],
      [0, h + 0.36, -d * 0.42],
      material,
      0.05,
    );
    back.rotation.x = -0.09;
    if (!desk)
      for (const x of [-w * 0.45, w * 0.45]) {
        box(g, [0.15, 0.39, d], [x, h + 0.22, 0], material, 0.04);
        box(g, [0.025, 0.025, d + 0.03], [x, h - 0.09, 0], m.black);
      }
    if (!desk) {
      for (const x of [-w * 0.45, w * 0.45])
        tube(
          g,
          [
            [x, h + 0.43, d * 0.44],
            [x, h + 0.43, -d * 0.4],
            [x, h + 0.52, -d * 0.44],
          ],
          0.003,
          m.stitch,
        );
    }
    touch(
      g,
      desk
        ? "皮革书桌椅"
        : material === m.caramel
          ? "焦糖鞍革休闲椅"
          : "巧克力皮革单椅",
      "皮革微微回弹，安静坐一会儿。",
    );
    return g;
  }
  // Rear smoked-oak cabinetry: a continuous closed lower band and a narrow lit display.
  const cabinet = group(root, [-2.7, 0.023, -4.5]);
  cabinet.name = "italian-built-in-cabinet";
  box(cabinet, [4.4, 3.62, 0.065], [0, 1.82, -0.38], m.dark);
  box(cabinet, [4.4, 0.08, 0.86], [0, 0.04, 0], m.dark);
  for (const x of [-2.2, -0.54, 0.39, 2.2])
    box(cabinet, [0.055, 3.62, 0.85], [x, 1.84, 0], m.wood);
  box(cabinet, [4.45, 0.075, 0.89], [0, 3.65, 0], m.wood, 0.004);
  for (const [x, w] of [
    [-1.78, 0.812],
    [-0.96, 0.812],
    [-0.075, 0.86],
    [0.855, 0.887],
    [1.75, 0.887],
  ])
    panel(cabinet, [x, 0.51, 0.432], w, 0.93, "italian-lower-flush-panel");
  for (const [x, w] of [
    [-1.78, 0.812],
    [-0.96, 0.812],
    [0.855, 0.887],
    [1.75, 0.887],
  ])
    panel(cabinet, [x, 2.3, 0.432], w, 2.62, "italian-tall-flush-panel");
  const niche = group(cabinet, [-0.075, 0, 0]);
  niche.name = "italian-lit-display";
  for (const y of [1.04, 1.71, 2.38, 3.06, 3.61]) {
    box(niche, [0.86, 0.045, 0.8], [0, y, 0], m.wood);
    strip(niche, [0.77, 0.012, 0.018], [0, y - 0.03, -0.18]);
  }
  bowl(niche, [0, 3.085, -0.02], 0.82);
  const sculpture = group(niche, [0, 2.415, 0]);
  torus(sculpture, 0.18, 0.061, [0, 0.22, 0], m.stone, [0, 0, 0]);
  box(sculpture, [0.22, 0.04, 0.14], [0, 0.02, 0], m.stone);
  plant(niche, [0, 1.733, 0], m, 0.41);
  books(niche, [0, 1.065, 0], bookMaterials, 2);
  pottery(niche, [0, 1.195, 0], 0.29, m.ceramic);
  // Desk is deliberately cantilevered, structurally anchored between side panels.
  const desk = group(root, [0.89, 0.024, -4.38]);
  desk.name = "italian-floating-desk";
  for (const x of [-1.28, 1.28])
    box(desk, [0.09, 3.53, 0.81], [x, 1.765, -0.05], m.wood, 0.005);
  box(desk, [2.64, 0.08, 0.87], [0, 3.57, -0.04], m.wood, 0.005);
  box(desk, [2.47, 0.105, 0.91], [0, 1.045, 0.03], m.darkStone, 0.015);
  box(desk, [2.41, 0.13, 0.6], [0, 0.946, -0.105], m.dark);
  strip(desk, [2.42, 0.016, 0.023], [0, 3.5, -0.22]);
  const art = group(desk, [0, 2.36, -0.42]);
  box(art, [1.53, 1.69, 0.045], [0, 0, 0], m.black, 0.004);
  box(art, [1.485, 1.645, 0.012], [0, 0, 0.03], m.art);
  touch(art, "书桌抽象画", "色块与留白，刚好平衡。");
  const notebook = group(desk, [-0.29, 1.108, 0.12]);
  for (const sign of [-1, 1]) {
    const page = box(
      notebook,
      [0.25, 0.016, 0.36],
      [sign * 0.126, 0.007, 0],
      m.paper,
      0.002,
    );
    page.rotation.z = -sign * 0.06;
  }
  touch(notebook, "空白笔记本", "留一页空白，留一点时间。");
  cylinder(desk, 0.048, 0.048, 0.12, [-0.95, 1.163, -0.13], m.ceramic);
  for (const x of [-0.972, -0.935]) {
    const pen = cylinder(desk, 0.005, 0.005, 0.2, [x, 1.26, -0.13], m.black, 8);
    pen.rotation.z = 0.12;
  }
  lamp(desk, [0.91, 1.103, 0.04], "黑色金属台灯");
  chair([0.91, 0.025, -3.26], Math.PI, m.caramel, true).name =
    "italian-desk-chair";
  // Right wall: a restrained floating stone console with a large abstract canvas.
  const console = group(root, [3.68, 0.025, -4.49]);
  console.name = "italian-stone-console";
  box(console, [2.32, 0.34, 0.66], [0, 0.72, 0], m.stone, 0.017);
  bowl(console, [0.51, 0.895, 0.07], 0.82);
  pottery(console, [-0.72, 0.895, -0.06], 0.63, m.ceramic);
  twigs(console, [-0.72, 1.328, -0.06], 0.94);
  const bigArt = group(root, [3.68, 2.28, -4.87]);
  box(bigArt, [1.8, 1.96, 0.055], [0, 0, 0], m.dark);
  box(bigArt, [1.756, 1.916, 0.013], [0, 0, 0.035], m.art2);
  touch(bigArt, "大幅几何艺术画", "深棕、象牙白与安静的线条。");
  tree([-4.36, 0.024, 3.15], 0.91).name = "italian-window-plant";
  tree([-4.22, 0.024, -2.93], 1.02).name = "italian-rear-plant";
  // Low modular sofa faces the foreground, with its chaise on the right.
  const sofa = group(root, [-0.38, 0.025, -0.55]);
  sofa.name = "italian-modular-sofa";
  box(sofa, [4.16, 0.09, 1.19], [0, 0.095, 0], m.dark, 0.018);
  for (let i = 0; i < 3; i++) {
    const x = -1.37 + i * 1.37;
    box(sofa, [1.35, 0.33, 1.32], [x, 0.29, 0.05], m.linen, 0.043);
    box(sofa, [1.34, 0.17, 1.26], [x, 0.535, 0.063], m.linen, 0.06);
    box(sofa, [1.35, 0.42, 0.24], [x, 0.755, -0.455], m.linen, 0.045);
  }
  box(sofa, [0.24, 0.62, 1.33], [-2.11, 0.495, 0.04], m.linen, 0.046);
  const chaise = box(
    sofa,
    [1.34, 0.43, 0.97],
    [1.37, 0.355, 1.19],
    m.linen,
    0.048,
  );
  box(sofa, [1.34, 0.12, 0.95], [1.37, 0.58, 1.19], m.linen, 0.055);
  for (const [x, material, z] of [
    [-1.51, m.taupe, -0.19],
    [-0.9, m.chocolate, -0.13],
  ]) {
    const pillow = box(
      sofa,
      [0.48, 0.45, 0.19],
      [x, 0.825, z],
      material,
      0.069,
    );
    pillow.rotation.z = -0.12;
    pillow.rotation.x = -0.12;
  }
  const throwGeo = new THREE.PlaneGeometry(0.67, 1.98, 24, 50),
    a = throwGeo.attributes.position;
  for (let i = 0; i < a.count; i++) {
    const x = a.getX(i),
      v = (a.getY(i) + 0.99) / 1.98,
      drop = Math.max(0, (v - 0.68) / 0.32);
    a.setXYZ(
      i,
      x + 0.021 * Math.sin(v * 16),
      0.66 - drop * 0.58 + 0.02 * Math.sin(x * 25 + v * 10),
      -0.09 + Math.min(v, 0.68) * 2.5 + 0.017 * Math.sin(x * 21),
    );
  }
  throwGeo.computeVertexNormals();
  const cloth = new THREE.Mesh(throwGeo, m.throw);
  cloth.position.x = 0.91;
  cloth.castShadow = cloth.receiveShadow = true;
  sofa.add(cloth);
  touch(sofa, "米白模块化沙发", "布面轻轻回弹，慢下来。");
  box(root, [6.48, 0.028, 4.63], [-0.48, 0.039, 1.8], m.rug, 0.014).name =
    "italian-wool-rug";
  // Thick, softly fractured luxury stone slab, with independent UVs on its broad top.
  const table = group(root, [-0.53, 0.054, 1.76]);
  table.name = "italian-stone-coffee-table";
  const outline = new THREE.Shape();
  for (let i = 0; i <= 50; i++) {
    const a = (i / 50) * Math.PI * 2,
      r = 1 + 0.064 * Math.sin(a * 5) + 0.027 * Math.sin(a * 9),
      x = Math.cos(a) * 1.19 * r,
      z = Math.sin(a) * 0.77 * r;
    if (i) outline.lineTo(x, z);
    else outline.moveTo(x, z);
  }
  outline.closePath();
  const slabGeo = new THREE.ExtrudeGeometry(outline, {
      depth: 0.32,
      bevelEnabled: true,
      bevelSize: 0.035,
      bevelThickness: 0.023,
      bevelSegments: 2,
    }),
    v = slabGeo.attributes.position,
    uv = slabGeo.attributes.uv;
  for (let i = 0; i < v.count; i++)
    uv.setXY(i, (v.getX(i) + 1.3) / 2.6, (v.getY(i) + 0.86) / 1.72);
  const slab = new THREE.Mesh(slabGeo, m.stone);
  slab.rotation.x = -Math.PI / 2;
  slab.position.y = 0.15;
  slab.castShadow = slab.receiveShadow = true;
  table.add(slab);
  box(table, [1.46, 0.16, 0.78], [0, 0.08, 0], m.darkStone, 0.025);
  books(table, [-0.39, 0.502, -0.08], bookMaterials, 1);
  pottery(table, [-0.39, 0.565, -0.08], 0.41, m.ceramic);
  twigs(table, [-0.39, 0.85, -0.08], 0.6);
  bowl(table, [0.62, 0.502, 0.16], 0.8);
  touch(table, "天然奢石茶几", "天然纹理，每一处都不同。");
  chair([-3.05, 0.025, 1.61], Math.atan2(2.52, 0.15), m.caramel).name =
    "italian-caramel-chair";
  chair([2.06, 0.025, 3.05], Math.atan2(-2.59, -1.29), m.chocolate).name =
    "italian-chocolate-chair";
  lamp(root, [-3.88, 0.025, 2.16], "极细弧线落地灯", true);
  const side = group(root, [-2.94, 0.025, 2.71]);
  cylinder(side, 0.23, 0.25, 0.46, [0, 0.23, 0], m.stone);
  cylinder(side, 0.3, 0.3, 0.06, [0, 0.49, 0], m.stone);
  cup(side, [0, 0.524, 0]);
  touch(side, "浅石边桌", "一只杯子，一点闲光。");
  const round = group(root, [1.06, 0.025, 3.53]);
  const sideStone = m.stone.clone();
  sideStone.color.set("#c4ae8e");
  cylinder(round, 0.31, 0.32, 0.54, [0, 0.27, 0], sideStone);
  cup(round, [0, 0.543, 0]);
  touch(round, "圆柱边桌", "让时间在这里慢一点。");
  return {
    root,
    lamps,
    update(dt) {
      for (const d of doors)
        d.g.rotation.y = damp(d.g.rotation.y, d.open ? -1.05 : 0, dt);
      for (const a of motions) {
        a.t = Math.min(1, a.t + dt / 0.75);
        a.o.position.y = a.y + Math.sin(a.t * Math.PI) * 0.035;
      }
    },
    reset() {
      for (const d of doors) d.open = false;
      for (const a of motions) {
        a.t = 1;
        a.o.position.y = a.y;
      }
    },
  };
}
