import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import {
  pottery,
  books,
  plant,
  trailing,
  branches,
} from "../dongfang/details.js";
import { flourish, ornateFrame, cabriole } from "../baroque/details.js";
import { archedShape } from "../athens/architecture.js";
import { damp } from "../../state.js";
export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "french-furniture";
  const lamps = [],
    motions = [],
    doors = [];
  const named = (o, n) => {
    o.name = "french-" + n;
    return o;
  };
  function touch(o, n, fn) {
    const e = { o, y: o.position.y, t: 1 };
    motions.push(e);
    register(o, n, "轻触互动", () => {
      e.t = 0;
      return fn ? fn() : "花影与暖光，慢慢相伴。";
    });
    return o;
  }
  function frame(p, pos, w, h, mat = m.art) {
    const g = group(p, pos);
    for (const x of [-w / 2, w / 2])
      box(g, [0.055, h + 0.06, 0.055], [x, 0, 0], m.gold, 0.01);
    for (const y of [-h / 2, h / 2])
      box(g, [w, 0.055, 0.055], [0, y, 0], m.gold, 0.01);
    box(g, [w - 0.045, h - 0.045, 0.016], [0, 0, 0.009], mat);
    return g;
  }
  function panel(p, x, y, w, h, z, mat = m.moulding) {
    for (const a of [-w / 2, w / 2])
      box(p, [0.023, h, 0.023], [x + a, y, z], mat, 0.006);
    for (const a of [-h / 2, h / 2])
      box(p, [w, 0.023, 0.023], [x, y + a, z], mat, 0.006);
  }
  function cup(p, pos) {
    const g = pottery(p, pos, 0.33, m.ceramic, "bowl");
    torus(g, 0.083, 0.015, [0.19, 0.08, 0], m.ceramic, [0, 0, 0]);
    cylinder(g, 0.13, 0.13, 0.005, [0, 0.13, 0], m.soil);
    return g;
  }
  function bouquet(p, pos, scale = 1, pink = false) {
    const g = group(p, pos);
    g.scale.setScalar(scale);
    pottery(g, [0, 0, 0], 0.7, m.ceramic);
    branches(g, [0, 0.42, 0], m, 0.6);
    for (let i = 0; i < 22; i++) {
      const a = i * 2.399,
        r = 0.15 + Math.sin(i * 7) * 0.1,
        x = Math.cos(a) * r,
        z = Math.sin(a) * r,
        y = 0.62 + (i % 5) * 0.045;
      tube(
        g,
        [
          [0, 0.3, 0],
          [x, y, z],
        ],
        0.006,
        m.leaf,
      );
      for (let j = 0; j < 5; j++) {
        const q = j * 1.256;
        sphere(
          g,
          [0.033, 0.024, 0.028],
          [x + Math.cos(q) * 0.025, y, z + Math.sin(q) * 0.025],
          pink ? m.rose : m.paper,
        );
      }
    }
    return g;
  }
  function candle(p, pos, h = 0.24, key = "floorLamp") {
    const g = group(p, pos),
      glow = m.glow.clone();
    cylinder(g, 0.055, 0.06, h, [0, h / 2, 0], m.paper);
    sphere(g, [0.016, 0.041, 0.016], [0, h + 0.035, 0], glow);
    lamps.push({ shade: glow, key, power: 0, pos: [0, 0, 0] });
    return g;
  }
  function lamp(
    p,
    pos,
    scale = 1,
    title = "奶油色台灯",
    key = "bedLamp",
    power = 1.8,
  ) {
    const g = group(p, pos);
    g.scale.setScalar(scale);
    cylinder(g, 0.16, 0.18, 0.03, [0, 0.015, 0], m.gold);
    sphere(g, [0.115, 0.18, 0.115], [0, 0.2, 0], m.ceramic);
    cylinder(g, 0.021, 0.023, 0.24, [0, 0.36, 0], m.gold);
    const glow = m.glow.clone();
    cylinder(g, 0.18, 0.29, 0.34, [0, 0.59, 0], m.paper);
    cylinder(g, 0.25, 0.25, 0.013, [0, 0.415, 0], glow).castShadow = false;
    root.updateMatrixWorld(true);
    lamps.push({
      shade: glow,
      key,
      power,
      pos: g.localToWorld(new THREE.Vector3(0, 0.41, 0)).toArray(),
    });
    touch(g, title, () => {
      store.set(key, !store.state[key]);
      return "台灯的暖光缓缓变化。";
    });
    return g;
  }
  function bust(p, pos, s = 0.4) {
    const g = group(p, pos);
    g.scale.setScalar(s);
    box(g, [0.65, 0.15, 0.42], [0, 0.075, 0], m.stone, 0.02);
    sphere(g, [0.3, 0.26, 0.18], [0, 0.36, 0], m.stone);
    cylinder(g, 0.09, 0.12, 0.2, [0, 0.62, 0], m.stone);
    sphere(g, [0.16, 0.22, 0.16], [0, 0.83, 0], m.stone);
    sphere(g, [0.043, 0.075, 0.05], [0, 0.82, 0.15], m.stone);
    for (let i = 0; i < 9; i++)
      sphere(
        g,
        [0.07, 0.075, 0.07],
        [Math.sin(i) * 0.13, 0.99 + Math.cos(i * 2) * 0.03, Math.cos(i) * 0.11],
        m.stone,
      );
    return g;
  }
  // The arched bookcase sits against the left wall at the rear corner.
  const shelf = named(group(root, [-4.42, 0, -3.5]), "arched-bookcase");
  shelf.rotation.y = Math.PI / 2;
  box(shelf, [2.2, 0.79, 0.69], [0, 0.57, 0], m.panel, 0.012);
  for (const x of [-0.91, 0.91])
    for (const z of [-0.24, 0.24])
      cabriole(shelf, x, z, 0.2, { ...m, wood: m.panel, gold: m.moulding });
  box(shelf, [2.15, 2.47, 0.04], [0, 2.05, -0.34], m.taupe);
  for (const x of [-1.08, 1.08])
    box(shelf, [0.11, 2.67, 0.76], [x, 2.13, 0], m.moulding);
  for (const y of [0.98, 1.61, 2.24, 2.87])
    box(shelf, [2.2, 0.065, 0.74], [0, y, 0], m.panel);
  const arch = [];
  for (let i = 0; i <= 28; i++) {
    const a = (i / 28) * Math.PI;
    arch.push([Math.cos(a) * 1.07, 2.87 + Math.sin(a) * 0.62, 0.34]);
  }
  tube(shelf, arch, 0.07, m.moulding);
  const crownShape = new THREE.Shape();
  crownShape.moveTo(-1.13, 3.57);
  crownShape.lineTo(1.13, 3.57);
  crownShape.lineTo(1.13, 2.87);
  crownShape.lineTo(1.07, 2.87);
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI;
    crownShape.lineTo(Math.cos(a) * 1.07, 2.87 + Math.sin(a) * 0.62);
  }
  crownShape.lineTo(-1.13, 2.87);
  crownShape.closePath();
  const crown = new THREE.Mesh(
    new THREE.ExtrudeGeometry(crownShape, { depth: 0.11, bevelEnabled: false }),
    m.panel,
  );
  crown.position.z = 0.29;
  crown.castShadow = true;
  shelf.add(crown);
  box(shelf, [2.36, 0.08, 0.82], [0, 3.6, 0], m.moulding, 0.012);
  for (let r = 0; r < 3; r++) {
    books(shelf, [-0.94, 1.02 + r * 0.63, 0.08], m, 6, true);
    if (r % 2) bust(shelf, [0.55, 1.02 + r * 0.63, 0.08], 0.45);
    else pottery(shelf, [0.57, 1.02 + r * 0.63, 0.08], 0.62, m.ceramic);
  }
  books(shelf, [-0.7, 2.91, 0.05], m, 10, true);
  trailing(shelf, [0.74, 2.92, 0.1], m, 0.65);
  for (const x of [-0.54, 0.54]) {
    const p = group(shelf, [x - 0.51, 0.55, 0.369]);
    box(p, [1.02, 0.7, 0.04], [0.51, 0, 0], m.panel);
    panel(p, 0.51, 0, 0.88, 0.56, 0.03);
    sphere(p, [0.025, 0.025, 0.025], [0.9, 0, 0.05], m.gold);
    doors.push(p);
    touch(p, "奶油书柜门", () => {
      store.set("wardrobe", !store.state.wardrobe);
      return "书柜轻轻打开。";
    });
  }
  const side = named(group(root, [-2.07, 0, -4.38]), "cream-sideboard");
  for (const x of [-1.15, 1.15])
    for (const z of [-0.27, 0.27])
      cabriole(side, x, z, 0.25, { ...m, wood: m.panel, gold: m.moulding });
  box(side, [2.64, 0.82, 0.73], [0, 0.65, 0], m.panel, 0.025);
  box(side, [2.76, 0.08, 0.85], [0, 1.1, 0], m.stone, 0.018);
  for (const x of [-0.86, 0, 0.86]) {
    panel(side, x, 0.66, 0.73, 0.67, 0.39);
    flourish(side, [x, 0.93, 0.41], 0.19, { gold: m.moulding });
    sphere(side, [0.022, 0.022, 0.022], [x + 0.24, 0.66, 0.42], m.gold);
  }
  bouquet(side, [-0.92, 1.15, 0], 0.8, true);
  books(side, [0.15, 1.15, 0], m, 3);
  for (const x of [0.73, 1.03]) {
    cylinder(side, 0.07, 0.1, 0.045, [x, 1.17, 0], m.gold);
    cylinder(side, 0.014, 0.02, 0.3, [x, 1.34, 0], m.gold);
    candle(side, [x, 1.5, 0], 0.25);
  }
  touch(side, "法式奶油边柜");
  frame(root, [-2.03, 2.58, -4.84], 1.3, 1.58);
  // Real open firebox, framed by a shallow carved marble arch.
  const fire = named(group(root, [1.05, 0, -4.36]), "candle-fireplace");
  box(fire, [2.78, 0.1, 1.04], [0, 0.055, 0.07], m.stone, 0.018);
  box(fire, [2.1, 1.38, 0.035], [0, 0.78, -0.35], m.dark);
  for (const x of [-1.06, 1.06]) {
    box(fire, [0.37, 1.36, 0.72], [x, 0.77, 0], m.stone, 0.022);
    panel(fire, x, 0.74, 0.24, 1.06, 0.375);
    flourish(fire, [x, 1.26, 0.39], 0.24, { gold: m.moulding });
  }
  const archS = new THREE.Shape();
  archS.moveTo(-1.25, 1.51);
  archS.lineTo(1.25, 1.51);
  archS.lineTo(1.25, 1.05);
  archS.lineTo(0.84, 1.05);
  archS.bezierCurveTo(0.73, 1.43, -0.73, 1.43, -0.84, 1.05);
  archS.lineTo(-1.25, 1.05);
  archS.closePath();
  const archMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(archS, { depth: 0.68, bevelEnabled: false }),
    m.stone,
  );
  archMesh.position.z = -0.32;
  archMesh.castShadow = true;
  fire.add(archMesh);
  box(fire, [2.73, 0.095, 0.92], [0, 1.57, 0], m.stone, 0.019);
  flourish(fire, [0, 1.42, 0.395], 0.48, { gold: m.moulding });
  const flames = [];
  for (let i = 0; i < 7; i++) {
    const c = candle(
      fire,
      [-0.62 + (i % 4) * 0.38, 0.12, -0.02 + Math.floor(i / 4) * 0.22],
      0.19 + (i % 3) * 0.1,
    );
    flames.push(c);
  }
  const fireGlow = m.glow.clone();
  lamps.push({
    shade: fireGlow,
    key: "floorLamp",
    power: 2.2,
    pos: [1.05, 0.65, -3.93],
  });
  touch(fire, "壁炉烛光", () => {
    store.set("floorLamp", !store.state.floorLamp);
    return "烛火轻轻摇曳。";
  });
  bouquet(fire, [-0.92, 1.63, 0], 0.66);
  books(fire, [0.63, 1.63, 0.06], m, 2);
  bust(fire, [0.65, 1.77, 0.05], 0.4);
  const mirror = named(
    ornateFrame(root, [1.05, 2.63, -4.77], 1.58, 1.65, {
      ...m,
      woodDark: m.gold,
    }),
    "gilded-mirror",
  );
  const reflective = new Reflector(new THREE.PlaneGeometry(1.42, 1.49), {
    textureWidth: 512,
    textureHeight: 512,
    color: 0xb9b4a6,
    clipBias: 0.003,
  });
  reflective.position.z = 0.01;
  mirror.add(reflective);
  touch(mirror, "古董金色镜框");
  const console = named(group(root, [3.7, 0, -4.36]), "slender-console");
  for (const x of [-0.83, 0.83])
    for (const z of [-0.25, 0.25]) {
      cylinder(console, 0.016, 0.018, 1.04, [x, 0.54, z], m.gold);
      box(console, [1.68, 0.022, 0.022], [0, 0.15, z], m.gold);
    }
  box(console, [1.95, 0.07, 0.7], [0, 1.1, 0], m.stone, 0.014);
  pottery(console, [-0.5, 1.14, 0], 0.54, m.dark);
  branches(console, [-0.5, 1.46, 0], m, 0.55);
  bust(console, [0.53, 1.14, 0], 0.5);
  frame(root, [3.72, 2.56, -4.84], 1.03, 1.42);
  // Paired, shaded brass sconces are meshes; two share a restrained local fill.
  for (const x of [-3.22, -0.63, 2.55]) {
    const g = group(root, [x, 2.75, -4.76]);
    sphere(g, [0.055, 0.16, 0.045], [0, -0.14, 0], m.gold);
    for (const sign of [-1, 1]) {
      tube(
        g,
        [
          [0, -0.17, 0],
          [sign * 0.18, -0.22, 0.1],
          [sign * 0.21, 0.02, 0.13],
        ],
        0.018,
        m.gold,
      );
      const glow = m.glow.clone();
      cylinder(g, 0.08, 0.12, 0.21, [sign * 0.21, 0.13, 0.13], glow);
      cylinder(
        g,
        0.09,
        0.09,
        0.012,
        [sign * 0.21, 0.02, 0.13],
        glow,
      ).castShadow = false;
      lamps.push({ shade: glow, key: "bedLamp", power: 0, pos: [0, 0, 0] });
    }
    touch(g, "黄铜双头壁灯", () => {
      store.set("bedLamp", !store.state.bedLamp);
      return "墙上泛起柔和暖光。";
    });
  }
  const desk = named(group(root, [-4.02, 0, -1.15]), "writing-desk");
  desk.rotation.y = Math.PI / 2;
  for (const x of [-1.05, 1.05])
    for (const z of [-0.31, 0.31]) cabriole(desk, x, z, 1.0, m);
  box(desk, [2.4, 0.085, 0.95], [0, 1.04, 0], m.wood, 0.018);
  box(desk, [2.24, 0.23, 0.84], [0, 0.88, 0], m.dark);
  panel(desk, 0, 0.88, 1.1, 0.15, 0.435, m.wood);
  const note = group(desk, [0.1, 1.096, 0.05]);
  for (const x of [-0.17, 0.17]) {
    const p = box(note, [0.32, 0.012, 0.43], [x, 0, 0], m.paper);
    p.rotation.z = x * 0.2;
  }
  books(desk, [0.83, 1.09, -0.2], m, 3);
  bouquet(desk, [-0.9, 1.09, -0.1], 0.5);
  lamp(desk, [0.74, 1.22, -0.17], 0.55, "书桌台灯", "bedLamp", 1.5);
  touch(note, "空白书页");
  touch(desk, "深木写字桌");
  function ovalChair(p, pos, mat, rot, title, small = false) {
    const g = group(p, pos);
    g.rotation.y = rot;
    const s = small ? 0.68 : 1;
    g.scale.setScalar(s);
    for (const x of [-0.43, 0.43])
      for (const z of [-0.35, 0.35])
        cabriole(g, x, z, 0.49, { ...m, wood: m.wood, gold: m.wood });
    box(g, [1.02, 0.12, 0.94], [0, 0.49, 0], m.wood, 0.1);
    box(g, [0.94, 0.22, 0.86], [0, 0.61, 0], mat, 0.12);
    sphere(g, [0.48, 0.58, 0.105], [0, 1.05, -0.38], m.wood);
    sphere(g, [0.432, 0.52, 0.12], [0, 1.06, -0.31], mat);
    for (const x of [-0.5, 0.5]) {
      tube(
        g,
        [
          [x, 0.45, 0.32],
          [x, 0.85, 0.29],
          [x, 0.94, -0.12],
          [x, 0.97, -0.32],
        ],
        0.035,
        m.wood,
      );
      box(g, [0.16, 0.14, 0.61], [x, 0.89, 0.05], mat, 0.07);
    }
    const pillow = box(g, [0.49, 0.43, 0.15], [0, 0.95, -0.11], m.linen, 0.08);
    pillow.rotation.x = -0.18;
    touch(g, title);
    return g;
  }
  const dc = named(
    ovalChair(
      root,
      [-2.98, 0, -1.12],
      m.linen,
      -Math.PI / 2,
      "圆背书写椅",
      true,
    ),
    "desk-chair",
  );
  const rug = named(
    box(root, [6.25, 0.03, 5.75], [0.2, 0.043, 1.38], m.rug, 0.012),
    "floral-rug",
  );
  // Arc-swept cushions make a continuous crescent sofa, with rounded ends.
  // A shared seating axis keeps the crescent and oval table centered together.
  // Set the sofa farther right/back so its curved arms leave a clear approach.
  const seatingAxisX = 0.05;
  const sofa = named(group(root, [seatingAxisX, 0.02, -0.9]), "curved-sofa");
  sofa.rotation.y = 0;
  function sweep(radius, radial, vertical, y, material) {
    const pos = [],
      uv = [],
      idx = [],
      n = 80,
      k = 18,
      start = -0.85,
      end = 0.85;
    for (let i = 0; i <= n; i++) {
      const a = start + ((end - start) * i) / n;
      for (let j = 0; j <= k; j++) {
        const b = (j / k) * Math.PI * 2,
          r = radius + Math.cos(b) * radial;
        pos.push(
          Math.sin(a) * r,
          y + Math.sin(b) * vertical,
          2.2 - Math.cos(a) * r,
        );
        uv.push((i / n) * 3, j / k);
        if (i < n && j < k) {
          const q = i * (k + 1) + j;
          idx.push(q, q + 1, q + k + 1, q + 1, q + k + 2, q + k + 1);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = mesh.receiveShadow = true;
    sofa.add(mesh);
    for (const a of [start, end]) {
      const cap = sphere(
        sofa,
        [radial, vertical, radial],
        [Math.sin(a) * radius, y, 2.2 - Math.cos(a) * radius],
        material,
      );
    }
    return mesh;
  }
  sweep(2.18, 0.61, 0.2, 0.36, m.linen);
  sweep(2.18, 0.59, 0.17, 0.59, m.linen);
  sweep(2.67, 0.2, 0.4, 0.96, m.linen);
  for (const x of [-1.7, 1.7])
    for (const z of [0.05, 0.7])
      cylinder(sofa, 0.035, 0.03, 0.2, [x, 0.1, z], m.wood);
  [m.sage, m.rose, m.pattern, m.taupe].forEach((mat, i) => {
    const a = -0.6 + i * 0.38;
    const p = box(
      sofa,
      [0.51, 0.51, 0.16],
      [Math.sin(a) * 2.35, 1.0, 2.2 - Math.cos(a) * 2.35 + 0.08],
      mat,
      0.085,
    );
    p.rotation.set(-0.15, -a, i % 2 ? 0.08 : -0.08);
  });
  const throwGeo = new THREE.PlaneGeometry(0.7, 1.38, 16, 30);
  const ap = throwGeo.attributes.position;
  for (let i = 0; i < ap.count; i++) {
    const x = ap.getX(i),
      v = (ap.getY(i) + 0.69) / 1.38;
    ap.setXYZ(
      i,
      x,
      1.06 - v * 0.94,
      0.68 + Math.sin(v * Math.PI) * 0.09 + Math.sin(x * 45) * 0.025,
    );
  }
  throwGeo.computeVertexNormals();
  const throwMat = m.rose.clone();
  throwMat.side = THREE.DoubleSide;
  const blanket = new THREE.Mesh(throwGeo, throwMat);
  blanket.position.set(-1.78, 0, 0.14);
  blanket.castShadow = true;
  sofa.add(blanket);
  touch(sofa, "奶油白弧形沙发");
  const table = named(group(root, [seatingAxisX, 0.03, 1.92]), "marble-table");
  const top = cylinder(table, 1, 1, 0.07, [0, 0.63, 0], m.stone, 64);
  top.scale.set(1.34, 1, 0.72);
  const lower = cylinder(table, 0.9, 0.9, 0.035, [0, 0.2, 0], m.gold, 64);
  lower.scale.set(1.34, 1, 0.72);
  for (const x of [-0.96, 0.96])
    for (const z of [-0.43, 0.43])
      cylinder(table, 0.016, 0.019, 0.6, [x, 0.3, z], m.gold);
  bouquet(table, [0.2, 0.67, -0.05], 0.65);
  books(table, [-0.66, 0.67, 0.08], m, 2);
  cup(table, [-0.62, 0.84, 0.08]);
  candle(table, [0.75, 0.67, 0.1], 0.17);
  touch(table, "椭圆大理石茶几");
  named(
    ovalChair(
      root,
      [-0.92, 0.025, 3.82],
      m.rose,
      Math.PI - 0.25,
      "灰粉法式扶手椅",
    ),
    "rose-armchair",
  );
  named(
    ovalChair(root, [3.04, 0.025, 1.7], m.sage, -1.15, "鼠尾草绿扶手椅"),
    "sage-armchair",
  );
  const round = group(root, [2.73, 0.03, 2.97]);
  cylinder(round, 0.29, 0.32, 0.035, [0, 0.025, 0], m.gold);
  cylinder(round, 0.022, 0.035, 0.64, [0, 0.34, 0], m.gold);
  cylinder(round, 0.39, 0.39, 0.03, [0, 0.67, 0], m.gold);
  books(round, [0.03, 0.69, -0.09], m, 1);
  cup(round, [-0.12, 0.7, 0.16]);
  touch(round, "黄铜立柱边桌");
  const left = named(group(root, [-3.13, 0.03, 2.2]), "lamp-side-table");
  for (let i = 0; i < 3; i++) {
    const a = i * 2.094;
    cylinder(
      left,
      0.018,
      0.021,
      0.7,
      [Math.cos(a) * 0.33, 0.35, Math.sin(a) * 0.33],
      m.gold,
    );
  }
  torus(left, 0.33, 0.015, [0, 0.12, 0], m.gold);
  cylinder(left, 0.47, 0.47, 0.045, [0, 0.72, 0], m.dark);
  lamp(left, [-0.15, 0.75, -0.08], 0.82, "边桌奶油台灯", "bedLamp", 2);
  bouquet(left, [0.2, 0.75, 0.08], 0.35);
  books(left, [0.14, 0.75, 0.14], m, 1);
  plant(root, [-4.22, 0.02, 3.48], m, 0.95);
  plant(root, [-3.61, 0.02, -4.26], m, 0.8);
  plant(root, [4.47, 0.02, -3.85], m, 0.95);
  const leftArt = frame(root, [-4.84, 2.6, 3.47], 0.8, 1.1);
  leftArt.rotation.y = Math.PI / 2;
  return {
    root,
    lamps,
    update(dt, t = 0) {
      for (const e of motions) {
        e.t = Math.min(1, e.t + dt * 1.9);
        e.o.position.y = e.y + Math.sin(e.t * Math.PI) * 0.025;
      }
      for (const d of doors)
        d.rotation.y = damp(
          d.rotation.y,
          store.state.wardrobe ? -1.08 : 0,
          dt,
          3,
        );
      for (const c of flames)
        c.scale.y = 1 + Math.sin(t * 3 + c.position.x) * 0.013;
    },
    reset() {
      for (const e of motions) {
        e.t = 1;
        e.o.position.y = e.y;
      }
      for (const d of doors) d.rotation.y = 0;
    },
  };
}
