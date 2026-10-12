import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import {
  books,
  pottery,
  plant,
  trailing,
  branches,
} from "../dongfang/details.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "artdeco-furniture";
  const lamps = [],
    motions = [],
    doors = [];
  function named(pos, n, parent = root) {
    const g = group(parent, pos);
    g.name = "artdeco-" + n;
    return g;
  }
  function touch(o, name, fn) {
    const e = { o, y: o.position.y, t: 1 };
    motions.push(e);
    register(o, name, "轻触互动", () => {
      e.t = 0;
      return fn ? fn() : "金色微光，静静流淌。";
    });
    return o;
  }
  function frame(p, pos, w, h) {
    for (const x of [-w / 2, w / 2])
      box(p, [0.016, h, 0.022], [pos[0] + x, pos[1], pos[2]], m.gold);
    for (const y of [-h / 2, h / 2])
      box(p, [w, 0.016, 0.022], [pos[0], pos[1] + y, pos[2]], m.gold);
  }
  function lampEntry(g, shade, pos, power, key = "bedLamp") {
    const v = new THREE.Vector3(...pos);
    g.updateWorldMatrix(true, false);
    g.localToWorld(v);
    lamps.push({ shade, power, key, pos: v.toArray() });
  }
  function globe(p, pos, scale = 0.7) {
    const g = group(p, pos);
    g.scale.setScalar(scale);
    cylinder(g, 0.15, 0.18, 0.07, [0, 0.035, 0], m.gold);
    cylinder(g, 0.024, 0.035, 0.43, [0, 0.27, 0], m.gold);
    const hood = new THREE.Mesh(
      new THREE.SphereGeometry(0.29, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      m.gold,
    );
    hood.position.y = 0.5;
    g.add(hood);
    const shade = m.glow.clone();
    sphere(g, [0.2, 0.022, 0.2], [0, 0.49, 0], shade);
    lampEntry(g, shade, [0, 0.42, 0], 3.5);
    touch(g, "黄铜书桌台灯", () => {
      store.set("bedLamp", !store.state.bedLamp);
      return "台灯已切换。";
    });
  }
  function glass(p, pos, scale = 1, kind = "decanter") {
    const g = group(p, pos);
    g.scale.setScalar(scale);
    if (kind === "cup") {
      cylinder(g, 0.065, 0.025, 0.12, [0, 0.18, 0], m.glass, 12);
      cylinder(g, 0.012, 0.012, 0.1, [0, 0.075, 0], m.glass, 12);
      cylinder(g, 0.055, 0.055, 0.012, [0, 0.012, 0], m.glass, 16);
    } else {
      box(g, [0.17, 0.26, 0.17], [0, 0.13, 0], m.glass, 0.018);
      cylinder(g, 0.032, 0.068, 0.08, [0, 0.3, 0], m.glass, 12);
      cylinder(g, 0.033, 0.033, 0.09, [0, 0.38, 0], m.glass, 12);
      sphere(g, [0.048, 0.05, 0.048], [0, 0.445, 0], m.glass);
      for (let i = 0; i < 5; i++)
        box(
          g,
          [0.006, 0.23, 0.007],
          [-0.067 + i * 0.034, 0.14, 0.088],
          m.glass,
        );
    }
    return g;
  }
  function cup(p, pos) {
    const g = group(p, pos);
    cylinder(g, 0.09, 0.11, 0.013, [0, 0.012, 0], m.gold);
    cylinder(g, 0.065, 0.051, 0.08, [0, 0.06, 0], m.gold);
    cylinder(g, 0.054, 0.054, 0.005, [0, 0.102, 0], m.soil);
    torus(g, 0.035, 0.009, [0.066, 0.063, 0], m.gold, [0, 0, 0]);
  }
  function bouquet(p, pos, scale = 1, mat = m.glass) {
    const g = group(p, pos);
    g.scale.setScalar(scale);
    pottery(g, [0, 0, 0], 0.65, mat);
    branches(g, [0, 0.35, 0], m, 0.52);
    for (let i = 0; i < 20; i++) {
      const a = i * 2.399,
        r = 0.05 + (i % 4) * 0.06,
        x = Math.cos(a) * r,
        z = Math.sin(a) * r,
        y = 0.55 + (i % 6) * 0.06;
      tube(
        g,
        [
          [0, 0.25, 0],
          [x * 0.6, y - 0.12, z * 0.6],
          [x, y, z],
        ],
        0.005,
        m.leaf,
      );
      for (let j = 0; j < 4; j++) {
        const b = (j * Math.PI) / 2;
        sphere(
          g,
          [0.031, 0.022, 0.03],
          [x + Math.cos(b) * 0.024, y, z + Math.sin(b) * 0.024],
          m.ceramic,
        );
      }
    }
    return g;
  }
  function bust(p, pos, s = 0.5) {
    const g = group(p, pos);
    g.scale.setScalar(s);
    box(g, [0.35, 0.1, 0.3], [0, 0.05, 0], m.ceramic);
    sphere(g, [0.23, 0.17, 0.12], [0, 0.22, 0], m.ceramic);
    cylinder(g, 0.065, 0.08, 0.17, [0, 0.38, 0], m.ceramic);
    sphere(g, [0.13, 0.18, 0.13], [0, 0.55, 0], m.ceramic);
    sphere(g, [0.034, 0.037, 0.045], [0, 0.55, 0.12], m.ceramic);
    return g;
  }
  function fan(p, pos, radius = 0.5) {
    const g = group(p, pos);
    for (let i = 0; i < 13; i++) {
      const a = -1.16 + (i * 2.32) / 12;
      tube(
        g,
        [
          [0, 0, 0],
          [Math.sin(a) * radius, Math.cos(a) * radius, 0],
        ],
        0.01,
        m.gold,
      );
    }
    torus(g, radius, 0.012, [0, 0, 0], m.gold, [0, 0, 0], Math.PI);
    return g;
  }
  function gildedPlant(pos, scale = 1) {
    const g = named(pos, "planter");
    g.scale.setScalar(scale);
    cylinder(g, 0.25, 0.21, 0.55, [0, 0.46, 0], m.lacquer);
    for (const y of [0.21, 0.68]) torus(g, 0.246, 0.017, [0, y, 0], m.gold);
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      cylinder(
        g,
        0.013,
        0.015,
        0.26,
        [Math.cos(a) * 0.19, 0.13, Math.sin(a) * 0.19],
        m.gold,
      );
    }
    const foliage = plant(g, [0, 0.5, 0], { ...m, clay: m.lacquer }, 0.9);
    return foliage;
  }
  // Window-side writing alcove: shelving above the desk instead of behind a second table.
  const library = named([-4.46, 0.02, -3.38], "writing-alcove");
  library.rotation.y = Math.PI / 2;
  box(library, [2.3, 3.47, 0.13], [0, 1.77, -0.37], m.wood);
  for (const x of [-1.18, 1.18]) {
    box(library, [0.12, 3.48, 0.74], [x, 1.78, 0], m.lacquer);
    for (const dx of [-0.025, 0.025])
      box(library, [0.01, 3.38, 0.01], [x + dx, 1.78, 0.38], m.gold);
  }
  for (const y of [1.42, 2.07, 2.74, 3.49]) {
    box(library, [2.42, 0.07, 0.74], [0, y, 0], m.lacquer);
    box(library, [2.42, 0.015, 0.017], [0, y, 0.38], m.gold);
  }
  books(library, [-0.98, 2.115, 0.09], m, 8, true);
  books(library, [-0.98, 2.78, 0.06], m, 14, true);
  books(library, [-0.96, 1.46, 0.1], m, 5, true);
  bust(library, [0.67, 2.12, 0.07], 0.62);
  pottery(library, [0.75, 1.46, 0.06], 0.38, m.gold);
  trailing(library, [0.81, 3.53, -0.1], m, 0.55);
  const desk = named([0.0, 0.0, 0.24], "writing-desk", library);
  box(desk, [2.53, 0.1, 1.02], [0, 1.03, 0.12], m.lacquer, 0.015);
  frame(desk, [0, 1.035, 0.638], 2.35, 0.075);
  for (const x of [-1.06, 1.06]) {
    box(desk, [0.21, 0.98, 0.88], [x, 0.51, 0.1], m.lacquer);
    for (const dx of [-0.075, 0, 0.075])
      box(desk, [0.012, 0.94, 0.012], [x + dx, 0.51, 0.552], m.gold);
  }
  globe(desk, [-0.78, 1.09, -0.01]);
  box(desk, [0.55, 0.025, 0.38], [0, 1.1, 0.19], m.paper, 0.004);
  box(desk, [0.007, 0.028, 0.38], [0, 1.103, 0.19], m.taupe);
  books(desk, [0.78, 1.09, 0.13], m, 2);
  touch(desk, "黑金写字桌");
  // Rear sideboard and its symmetric diamond inlays.
  const side = named([0.12, 0.02, -4.35], "marble-sideboard");
  box(side, [4.55, 0.97, 0.8], [0, 0.73, 0], m.wood, 0.025);
  box(side, [4.72, 0.085, 0.92], [0, 1.26, 0], m.stone, 0.018);
  for (const x of [-2.15, 2.15])
    for (const z of [-0.3, 0.3])
      cylinder(side, 0.025, 0.018, 0.26, [x, 0.13, z], m.gold);
  for (let i = 0; i < 4; i++) {
    const x = -1.68 + i * 1.12;
    box(side, [1.055, 0.84, 0.022], [x, 0.73, 0.415], m.lacquer, 0.007);
    frame(side, [x, 0.73, 0.433], 1.01, 0.78);
    const d = box(side, [0.39, 0.39, 0.012], [x, 0.73, 0.449], m.wood);
    d.rotation.z = Math.PI / 4;
    const a = box(
      side,
      [0.023, 0.38, 0.03],
      [x + (i % 2 ? -0.41 : 0.41), 0.75, 0.466],
      m.gold,
      0.005,
    );
    sphere(side, [0.018, 0.018, 0.012], [x, 0.73, 0.46], m.gold);
  }
  for (const x of [-2.3, 2.3])
    for (let i = 0; i < 4; i++)
      box(side, [0.01, 1.08, 0.014], [x + i * 0.025, 0.72, 0.46], m.gold);
  const tray = box(side, [0.62, 0.035, 0.39], [-1.55, 1.323, 0], m.gold, 0.025);
  glass(side, [-1.69, 1.344, 0], 0.83);
  glass(side, [-1.43, 1.344, 0.03], 0.65);
  bouquet(side, [1.27, 1.305, 0], 0.96, m.gold);
  pottery(side, [1.89, 1.31, 0.02], 0.35, m.gold, "bowl");
  bust(side, [0.63, 1.31, 0.01], 0.4);
  touch(side, "黑金大理石边柜");
  const mirror = named([0.12, 2.65, -4.74], "sunburst-mirror");
  const reflection = new Reflector(new THREE.CircleGeometry(0.43, 64), {
    textureWidth: 512,
    textureHeight: 512,
    color: 0x9d9480,
    clipBias: 0.003,
  });
  mirror.add(reflection);
  for (const r of [0.44, 0.47])
    torus(mirror, r, 0.015, [0, 0, 0.013], m.gold, [0, 0, 0]);
  for (let i = 0; i < 56; i++) {
    const a = (i * Math.PI * 2) / 56,
      len = 0.32 + (i % 4 === 0 ? 0.28 : i % 2 === 0 ? 0.15 : 0.03);
    const ray = box(
      mirror,
      [i % 2 ? 0.018 : 0.027, len, 0.026],
      [Math.sin(a) * (0.49 + len / 2), Math.cos(a) * (0.49 + len / 2), 0],
      m.gold,
    );
    ray.rotation.z = -a;
  }
  touch(mirror, "放射状太阳镜");
  // Glazed vitrine: hollow cabinet, movable glass door, visible crystal objects.
  const cabinet = named([3.92, 0.02, -4.33], "glass-vitrine");
  box(cabinet, [1.53, 3.22, 0.09], [0, 1.76, -0.36], m.wood);
  for (const x of [-0.77, 0.77]) {
    box(cabinet, [0.1, 3.37, 0.85], [x, 1.73, 0], m.lacquer);
    for (const dx of [-0.027, 0.027])
      box(cabinet, [0.012, 3.31, 0.012], [x + dx, 1.75, 0.43], m.gold);
  }
  for (const y of [0.12, 0.82, 1.48, 2.12, 2.78, 3.43]) {
    box(
      cabinet,
      [1.61, 0.06, 0.85],
      [0, y, 0],
      y < 1 || y > 3 ? m.lacquer : m.glazing,
    );
    box(cabinet, [1.62, 0.012, 0.02], [0, y, 0.437], m.gold);
  }
  box(cabinet, [1.49, 0.62, 0.08], [0, 0.45, 0.39], m.lacquer);
  frame(cabinet, [0, 0.45, 0.443], 1.42, 0.56);
  for (const x of [-0.12, 0.12])
    box(cabinet, [0.022, 0.29, 0.027], [x, 0.45, 0.454], m.gold);
  for (let level = 0; level < 3; level++) {
    const y = 0.86 + level * 0.66;
    for (const x of [-0.45, 0, 0.45])
      glass(
        cabinet,
        [x, y, 0.01],
        level % 2 ? 0.86 : 1,
        level % 2 ? "decanter" : "cup",
      );
  }
  fan(cabinet, [0, 2.91, 0.0], 0.59);
  const door = group(cabinet, [-0.72, 0.84, 0.47]);
  box(door, [1.44, 2.48, 0.017], [0.72, 1.24, 0], m.glazing).castShadow = false;
  frame(door, [0.72, 1.24, 0.014], 1.44, 2.48);
  box(door, [0.025, 0.28, 0.04], [1.29, 1.09, 0.033], m.gold);
  doors.push(door);
  register(door, "水晶展示柜门", "开合柜门", () => {
    store.set("wardrobe", !store.state.wardrobe);
    return "玻璃柜门缓缓开合。";
  });
  const cabinetGlow = m.glow.clone();
  box(cabinet, [1.37, 0.018, 0.018], [0, 3.35, 0.18], cabinetGlow);
  lampEntry(cabinet, cabinetGlow, [0, 2.41, 0.21], 2.5, "floorLamp");
  gildedPlant([-4.35, 0.02, 3.75], 1.05);
  gildedPlant([4.45, 0.02, -2.88], 0.95);
  // Repeated geometric sconces use only two local lights; the rest are emissive meshes.
  for (const [pos, rot, power] of [
    [[-4.73, 2.48, 3.94], Math.PI / 2, 3],
    [[-4.73, 2.64, -1.96], Math.PI / 2, 0],
    [[-2.78, 2.72, -4.74], 0, 0],
    [[2.85, 2.72, -4.74], 0, 3],
  ]) {
    const g = group(root, pos);
    g.rotation.y = rot;
    box(g, [0.12, 0.83, 0.055], [0, -0.02, 0], m.gold);
    const shade = m.glow.clone();
    for (const sign of [-1, 0, 1]) {
      const y = sign === 0 ? 0.04 : 0;
      box(
        g,
        [0.075, sign === 0 ? 0.58 : 0.43, 0.1],
        [sign * 0.081, y, 0.12],
        shade,
        0.008,
      );
      for (const dy of [-1, 1])
        box(
          g,
          [0.083, 0.025, 0.12],
          [sign * 0.081, y + dy * (sign === 0 ? 0.3 : 0.225), 0.12],
          m.gold,
        );
    }
    for (const x of [-0.122, 0.122])
      box(g, [0.01, 0.49, 0.012], [x, 0, 0.182], m.gold);
    lampEntry(g, shade, [0, 0.08, 0.3], power, "floorLamp");
    touch(g, "阶梯形几何壁灯", () => {
      store.set("floorLamp", !store.state.floorLamp);
      return "金色壁灯已切换。";
    });
  }
  const rug = box(root, [7.45, 0.03, 6.15], [0, 0.04, 1.4], m.rug, 0.01);
  rug.name = "artdeco-geometric-rug";
  // A swept cushion mesh keeps the crescent continuous and leaves the table clear.
  function sweep(
    p,
    radius,
    radial,
    vertical,
    y,
    material,
    start = -0.85,
    end = 0.85,
    center = 2.2,
  ) {
    const pos = [],
      uv = [],
      idx = [],
      n = 80,
      k = 18;
    for (let i = 0; i <= n; i++) {
      const a = start + ((end - start) * i) / n;
      for (let j = 0; j <= k; j++) {
        const b = (j / k) * Math.PI * 2,
          r = radius + Math.cos(b) * radial;
        pos.push(
          Math.sin(a) * r,
          y + Math.sin(b) * vertical,
          center - Math.cos(a) * r,
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
    p.add(mesh);
    for (const a of [start, end])
      sphere(
        p,
        [radial, vertical, radial],
        [Math.sin(a) * radius, y, center - Math.cos(a) * radius],
        material,
      );
  }
  const sofa = named([0, 0.035, -0.48], "emerald-sofa");
  sweep(sofa, 2.18, 0.6, 0.19, 0.35, m.velvet);
  sweep(sofa, 2.18, 0.59, 0.17, 0.57, m.velvet);
  sweep(sofa, 2.67, 0.21, 0.4, 0.96, m.velvet);
  const edge = [];
  for (let i = 0; i <= 48; i++) {
    const a = -0.85 + (i * 1.7) / 48;
    edge.push([Math.sin(a) * 2.78, 0.98, 2.2 - Math.cos(a) * 2.78]);
  }
  tube(sofa, edge, 0.01, m.gold);
  for (let i = 0; i <= 24; i++) {
    const a = -0.83 + (i * 1.66) / 24,
      pts = [];
    for (let j = 0; j < 9; j++) {
      const b = 0.0 + (j * Math.PI) / 8,
        r = 2.67 - Math.cos(b) * 0.212;
      pts.push([
        Math.sin(a) * r,
        0.96 + Math.sin(b) * 0.401,
        2.2 - Math.cos(a) * r,
      ]);
    }
    tube(sofa, pts, 0.006, m.seam);
  }
  for (const x of [-1.86, 1.86])
    for (const z of [0.02, 0.63])
      cylinder(sofa, 0.025, 0.022, 0.18, [x, 0.09, z], m.gold);
  for (const a of [-0.65, -0.43, 0.43, 0.65]) {
    const p = box(
      sofa,
      [0.47, 0.48, 0.15],
      [Math.sin(a) * 2.3, 0.98, 2.2 - Math.cos(a) * 2.3 + 0.05],
      Math.abs(a) > 0.5 ? m.wine : m.linen,
      0.075,
    );
    p.rotation.set(-0.15, -a, a < 0 ? -0.05 : 0.05);
  }
  touch(sofa, "翡翠绿弧形沙发");
  function chair(pos, angle, name, scale = 1) {
    const g = named(pos, name);
    g.rotation.y = angle;
    g.scale.setScalar(scale);
    const seat = cylinder(g, 0.47, 0.45, 0.19, [0, 0.45, 0], m.velvet, 48);
    seat.scale.z = 0.9;
    sweep(g, 0.48, 0.08, 0.31, 0.85, m.lacquer, -1.55, 1.55, 0);
    sweep(g, 0.423, 0.053, 0.275, 0.86, m.velvet, -1.52, 1.52, 0);
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const a = -1.55 + (i * 3.1) / 40;
      pts.push([Math.sin(a) * 0.5, 1.02, -Math.cos(a) * 0.5]);
    }
    tube(g, pts, 0.01, m.gold);
    for (const x of [-0.36, 0.36])
      for (const z of [-0.28, 0.28]) {
        cylinder(g, 0.015, 0.012, 0.36, [x, 0.18, z], m.gold);
      }
    for (const a of [-1.3, -0.65, 0, 0.65, 1.3])
      tube(
        g,
        [
          [Math.sin(a) * 0.56, 0.58, -Math.cos(a) * 0.56],
          [Math.sin(a) * 0.56, 1, -Math.cos(a) * 0.56],
        ],
        0.008,
        m.gold,
      );
    const pillow = box(g, [0.36, 0.37, 0.12], [0, 0.84, -0.18], m.linen, 0.065);
    pillow.rotation.x = -0.15;
    touch(g, "黑金丝绒扶手椅");
    return g;
  }
  chair([-2.97, 0.035, -3.35], -Math.PI / 2, "desk-chair", 0.8);
  chair([-2.96, 0.03, 2.08], 2.35, "left-armchair", 1.3);
  chair([2.96, 0.03, 2.08], -2.35, "right-armchair", 1.3);
  const table = named([0, 0.035, 2.01], "oval-marble-table");
  for (const [y, h, mat] of [
    [0.63, 0.075, m.stone],
    [0.585, 0.018, m.gold],
  ]) {
    const o = cylinder(table, 1, 1, h, [0, y, 0], mat, 64);
    o.scale.set(1.39, 1, 0.68);
  }
  for (const x of [-0.92, 0, 0.92]) {
    const leg = cylinder(
      table,
      0.24,
      0.24,
      0.5,
      [x, 0.32, 0],
      x === 0 ? m.lacquer : m.gold,
      40,
    );
    leg.scale.z = 1.6;
  }
  bouquet(table, [0.0, 0.675, -0.05], 0.66);
  books(table, [-0.7, 0.675, 0.06], m, 2);
  books(table, [0.61, 0.675, -0.1], { ...m, taupe: m.wine, paper: m.wine }, 1);
  cylinder(table, 0.24, 0.24, 0.025, [0.85, 0.697, 0.19], m.gold);
  torus(table, 0.23, 0.018, [0.85, 0.72, 0.19], m.gold);
  touch(table, "黑色大理石椭圆茶几");
  for (const sign of [-1, 1]) {
    const g = named(
      [sign * 2.45, 0.035, 3.36],
      sign < 0 ? "left-side-table" : "right-side-table",
    );
    cylinder(g, 0.23, 0.27, 0.64, [0, 0.34, 0], m.gold, 48);
    for (let i = 0; i < 20; i++) {
      const a = (i * Math.PI) / 10;
      cylinder(
        g,
        0.008,
        0.008,
        0.56,
        [Math.cos(a) * 0.235, 0.35, Math.sin(a) * 0.235],
        m.lacquer,
        6,
      );
    }
    cylinder(g, 0.39, 0.39, 0.045, [0, 0.69, 0], m.stone, 48);
    torus(g, 0.385, 0.012, [0, 0.688, 0], m.gold);
    cup(g, [0, 0.718, 0]);
    touch(g, "黑金圆形边桌");
  }
  const ottoman = named([0, 0.04, 4.06], "wine-ottoman");
  box(ottoman, [1.24, 0.12, 0.88], [0, 0.13, 0], m.gold, 0.065);
  box(ottoman, [1.3, 0.47, 0.94], [0, 0.405, 0], m.wine, 0.09);
  for (let i = 0; i < 5; i++) {
    const x = -0.49 + i * 0.245;
    tube(
      ottoman,
      [
        [x, 0.22, 0.472],
        [x, 0.55, 0.475],
        [x, 0.644, 0.34],
        [x, 0.647, -0.34],
        [x, 0.55, -0.475],
      ],
      0.005,
      m.wine,
    );
  }
  touch(ottoman, "酒红色绗缝软墩");
  return {
    root,
    lamps,
    update(dt) {
      for (const e of motions) {
        e.t = Math.min(1, e.t + dt / 1.05);
        e.o.position.y = e.y + Math.sin(e.t * Math.PI) * 0.045;
      }
      for (const d of doors)
        d.rotation.y = damp(
          d.rotation.y,
          store.state.wardrobe ? -1.12 : 0,
          dt,
          3,
        );
    },
    reset() {
      for (const e of motions) {
        e.t = 1;
        e.o.position.y = e.y;
      }
    },
  };
}
