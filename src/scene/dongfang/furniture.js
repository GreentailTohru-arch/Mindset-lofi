import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import {
  pottery,
  books,
  bamboo,
  plant,
  trailing,
  stone,
  bonsai,
  branches,
  teaSet,
  wovenPouf,
  paperLamp,
} from "./details.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, registerItem) {
  const root = group(scene);
  root.name = "dongfang-furniture";
  const lamps = [],
    motions = [],
    doors = [],
    drawers = [],
    steam = [];
  let heat = 0,
    ripple = 0;
  function register(o, name, hint, action, lift = true) {
    const a = { o, y: o.position.y, t: 0.75 };
    if (lift) motions.push(a);
    registerItem(o, name, hint, () => {
      a.t = 0;
      return action();
    });
  }
  const touch = (o, name, text) => register(o, name, "轻触", () => text);
  function lamp(parent, pos, scale, key, name, power = 0, tall = false) {
    const l = paperLamp(parent, pos, m, scale, tall);
    root.updateMatrixWorld(true);
    const p = l.root.localToWorld(new THREE.Vector3(0, l.height / scale, 0));
    lamps.push({
      shade: l.shade,
      key,
      power,
      pos: p.toArray(),
      range: tall ? 3.5 : 2.8,
    });
    register(l.root, name, "开关", () => {
      store.set(key, !store.state[key]);
      return store.state[key] ? "纸灯亮起，暖意渐生。" : "灯火暂歇。";
    });
    return l.root;
  }
  function glowStrip(parent, size, pos, key = "floorLamp") {
    const shade = m.glow.clone(),
      mesh = box(parent, size, pos, shade, 0.006);
    mesh.castShadow = false;
    lamps.push({ shade, key, power: 0, pos: [0, 0, 0] });
    return mesh;
  }
  function framedDoor(parent, x, y, w, h, z, name) {
    const g = group(parent, [x - w / 2, y, z]);
    box(g, [w, h, 0.055], [w / 2, 0, 0], m.wood, 0.008);
    for (const dx of [0.04, w - 0.04])
      box(g, [0.025, h - 0.07, 0.019], [dx, 0, 0.037], m.dark);
    for (const yy of [-h / 2 + 0.04, h / 2 - 0.04])
      box(g, [w - 0.07, 0.025, 0.019], [w / 2, yy, 0.037], m.dark);
    box(g, [0.016, 0.14, 0.026], [w - 0.105, 0.01, 0.049], m.bronze, 0.005);
    const d = { g, open: false };
    doors.push(d);
    register(
      g,
      name,
      "打开 / 合上",
      () => {
        d.open = !d.open;
        return d.open ? "柜门打开，物件各有所归。" : "木柜轻轻合上。";
      },
      false,
    );
  }
  function cabinet(parent, pos, w, h, depth, name, doorCount = 3) {
    const g = group(parent, pos);
    for (const yy of [0.07, h])
      box(g, [w, 0.085, depth], [0, yy, 0], m.wood, 0.012);
    for (const xx of [-w / 2 + 0.045, w / 2 - 0.045])
      box(g, [0.085, h, depth], [xx, h / 2, 0], m.dark);
    box(g, [w - 0.13, h - 0.08, 0.04], [0, h / 2, -depth / 2 + 0.02], m.dark);
    for (let i = 0; i < doorCount; i++)
      framedDoor(
        g,
        -w / 2 + ((i + 0.5) * w) / doorCount,
        0.08 + (h - 0.13) / 2,
        w / doorCount - 0.025,
        h - 0.16,
        depth / 2 - 0.02,
        `${name} ${i + 1}`,
      );
    return g;
  }
  function chair(pos, angle) {
    const g = group(root, pos);
    g.rotation.y = angle;
    for (const x of [-0.47, 0.47])
      for (const z of [-0.4, 0.4])
        box(g, [0.067, 0.53, 0.068], [x, 0.265, z], m.wood, 0.009);
    box(g, [1.03, 0.1, 0.91], [0, 0.49, 0], m.dark, 0.012);
    box(g, [0.9, 0.17, 0.8], [0, 0.615, 0.02], m.linen, 0.08);
    for (const x of [-0.47, 0.47]) {
      box(g, [0.05, 0.61, 0.06], [x, 0.81, -0.38], m.wood);
      box(g, [0.055, 0.27, 0.055], [x, 0.72, 0.36], m.wood);
      box(g, [0.075, 0.06, 0.91], [x, 0.88, 0], m.wood, 0.011);
    }
    box(g, [0.96, 0.06, 0.075], [0, 1.12, -0.38], m.wood);
    const back = box(g, [0.88, 0.51, 0.14], [0, 0.878, -0.36], m.linen, 0.063);
    back.rotation.x = 0.14;
    const pillow = box(
      g,
      [0.55, 0.4, 0.18],
      [0.09, 0.864, -0.205],
      m.sage,
      0.065,
    );
    pillow.rotation.z = -0.09;
    touch(g, "东方木质休闲椅", "坐下来，茶刚刚好。");
    return g;
  }

  // Left wall: a long bench cabinet, parallel to the window, with space for the basin.
  const bench = group(root, [-4.35, 0, -1.1]);
  bench.rotation.y = Math.PI / 2;
  bench.name = "dongfang-window-bench";
  box(bench, [5.63, 0.39, 0.79], [0, 0.24, 0], m.dark, 0.012);
  box(bench, [5.74, 0.095, 0.9], [0, 0.488, 0], m.wood, 0.019);
  for (let i = 0; i < 5; i++) {
    const d = group(bench, [-2.24 + i * 1.12, 0.264, 0.03]);
    box(d, [1.06, 0.28, 0.06], [0, 0, 0.375], m.wood, 0.007);
    box(d, [0.14, 0.018, 0.017], [0, 0.07, 0.413], m.bronze);
    const entry = { g: d, open: false };
    drawers.push(entry);
    register(
      d,
      "窗边柜抽屉",
      "拉开 / 收起",
      () => {
        entry.open = !entry.open;
        return entry.open ? "窗边小物，整齐收藏。" : "抽屉已合上。";
      },
      false,
    );
  }
  for (const [x, mat] of [
    [-1.98, m.sage],
    [1.94, m.linen],
  ]) {
    box(bench, [1.12, 0.08, 0.7], [x, 0.579, 0], m.linen, 0.04);
    const cushion = box(bench, [0.63, 0.5, 0.16], [x, 0.846, -0.24], mat, 0.06);
    cushion.rotation.x = 0.16;
    touch(cushion, "窗边靠垫", "倚窗望山，不急不忙。");
  }
  books(bench, [-1.23, 0.539, 0.11], m, 2);
  const windowTea = teaSet(bench, [-0.11, 0.539, 0.08], m, 0.77);
  touch(windowTea, "窗边茶席", "一盏清茶，远山如黛。");
  pottery(bench, [0.68, 0.539, -0.02], 0.45, m.clay);
  branches(bench, [0.68, 0.85, -0.02], m, 0.7, true);
  plant(bench, [2.55, 0.539, -0.05], m, 0.36);
  bamboo(root, [-4.37, 0.023, 2.26], m, 1.14);
  plant(root, [-4.52, 0.023, 1.58], m, 0.62);
  // Square stone water basin: four walls and an inset water surface, not a solid block.
  const basin = group(root, [-4.05, 0.023, 3.11]);
  basin.name = "dongfang-stone-basin";
  box(basin, [0.98, 0.08, 0.77], [0, 0.04, 0], m.stone, 0.025);
  for (const x of [-0.43, 0.43])
    box(basin, [0.12, 0.39, 0.77], [x, 0.237, 0], m.stone, 0.025);
  for (const z of [-0.326, 0.326])
    box(basin, [0.77, 0.39, 0.12], [0, 0.237, z], m.stone, 0.025);
  const water = box(basin, [0.75, 0.015, 0.53], [0, 0.284, 0], m.water, 0.008);
  water.name = "dongfang-basin-water";
  tube(
    basin,
    [
      [-0.47, 0.49, -0.25],
      [0.34, 0.475, 0.24],
    ],
    0.02,
    m.wood,
  );
  cylinder(basin, 0.075, 0.07, 0.07, [0.26, 0.439, 0.2], m.wood);
  const ripples = [];
  for (let i = 0; i < 3; i++) {
    const mat = m.linen.clone();
    mat.transparent = true;
    mat.opacity = 0;
    mat.depthWrite = false;
    const ring = torus(basin, 0.05, 0.0025, [0, 0.297, 0], mat);
    ripples.push(ring);
  }
  register(
    basin,
    "方形石水钵",
    "轻触水面",
    () => {
      ripple = 1;
      return "一圈涟漪，慢慢归静。";
    },
    false,
  );
  for (let i = 0; i < 36; i++) {
    const x = -4.75 + (i % 9) * 0.17,
      z = 2.58 + Math.floor(i / 9) * 0.35;
    sphere(root, [0.044, 0.025, 0.033], [x, 0.046, z], i % 5 ? m.trim : m.moss);
  }
  stone(root, [-3.45, 0.13, 3.07], m, [0.17, 0.11, 0.25]);
  lamp(root, [-4.47, 0.024, 4.02], 1, "bedLamp", "水景纸灯", 3.4, true);
  // Tall paper lantern in front of the rear moon-door bamboo garden.
  lamp(root, [-3.8, 0.023, -3.46], 0.9, "bedLamp", "月洞落地纸灯", 4.3, true);
  plant(root, [-4.14, 0.023, -3.8], m, 0.53);

  // Rear-left built-in library, with three horizontal shelf levels and concealed warm strips.
  const shelves = group(root, [-1.17, 0, -4.46]);
  shelves.name = "dongfang-main-library";
  cabinet(shelves, [0, 0, 0], 2.57, 0.77, 0.82, "书柜柜门", 3);
  for (const x of [-1.24, 1.24])
    box(shelves, [0.1, 2.83, 0.83], [x, 2.16, 0], m.wood);
  box(shelves, [2.45, 2.79, 0.05], [0, 2.13, -0.389], m.dark);
  box(shelves, [0.07, 2.78, 0.74], [-0.43, 2.13, 0], m.wood);
  for (const y of [0.825, 1.52, 2.22, 2.93, 3.59]) {
    box(shelves, [2.6, 0.075, 0.88], [0, y, 0], m.wood, 0.008);
    if (y > 0.9)
      glowStrip(shelves, [2.31, 0.016, 0.025], [0, y - 0.047, 0.292]);
  }
  const levels = [0.864, 1.56, 2.26, 2.969];
  books(shelves, [-1.1, levels[0], 0.08], m, 5, true);
  pottery(shelves, [-0.78, levels[1], 0.04], 0.43, m.celadon);
  books(shelves, [-0.82, levels[2], 0.08], m, 3);
  books(shelves, [-1.06, levels[3], 0.02], m, 4, true);
  for (let i = 0; i < 4; i++) {
    const y = levels[i];
    pottery(
      shelves,
      [0.14, y, 0.03],
      0.48 + (i % 2) * 0.12,
      i % 2 ? m.clay : m.celadon,
    );
    box(shelves, [0.39, 0.028, 0.31], [0.75, y + 0.014, 0], m.dark, 0.007);
    stone(shelves, [0.75, y + 0.22, 0], m, [
      0.12,
      0.13 + (i % 2) * 0.04,
      0.105,
    ]);
    books(shelves, [0.73, y + 0.03, 0.015], m, i === 3 ? 0 : 1);
  }
  const vine = trailing(shelves, [0.95, 2.968, 0.17], m, 0.8);
  touch(vine, "书柜垂藤", "枝叶向着微光垂落。");
  bonsai(shelves, [0.78, 0.864, 0.04], m, 0.55);
  lamps.push({
    shade: m.glow.clone(),
    key: "floorLamp",
    power: 4,
    pos: [-1.13, 2.31, -3.86],
    range: 3,
  });
  // Large ink landscape and its quiet warm backlight above the low console.
  const art = group(root, [1.96, 2.27, -4.79]);
  art.name = "dongfang-landscape-art";
  glowStrip(art, [3.06, 2.61, 0.024], [0, 0, -0.05]);
  box(art, [3.015, 2.565, 0.04], [0, 0, -0.025], m.wood, 0.008);
  box(art, [2.95, 2.5, 0.012], [0, 0, 0.003], m.artwork);
  touch(art, "水墨山水画", "山水无言，自有回响。");
  const console = cabinet(
    root,
    [1.96, 0, -4.46],
    3.1,
    0.78,
    0.74,
    "画下木柜",
    4,
  );
  console.name = "dongfang-art-console";
  bonsai(console, [-0.89, 0.826, 0.03], m, 0.83);
  pottery(console, [-1.35, 0.826, 0.04], 0.35, m.celadon, "bowl");
  box(console, [0.48, 0.035, 0.32], [0, 0.843, 0], m.wood);
  stone(console, [0, 1.012, 0], m, [0.13, 0.15, 0.12]);
  books(console, [0.61, 0.826, 0.07], m, 2);
  const branchVase = pottery(console, [1.25, 0.826, 0.01], 0.59, m.celadon);
  branches(branchVase, [0, 0.66, 0], m, 1.1, true);
  const incense = group(console, [0.3, 0.826, 0.14]);
  cylinder(incense, 0.07, 0.085, 0.05, [0, 0.025, 0], m.bronze);
  tube(
    incense,
    [
      [0, 0.05, 0],
      [0.005, 0.14, 0],
    ],
    0.002,
    m.ink,
  );
  touch(incense, "青铜香器", "一缕清香，安住当下。");
  const narrow = group(root, [4.26, 0, -4.47]);
  narrow.name = "dongfang-narrow-shelf";
  box(narrow, [1.05, 3.47, 0.055], [0, 1.78, -0.38], m.dark);
  for (const x of [-0.5, 0.5])
    box(narrow, [0.07, 3.57, 0.8], [x, 1.82, 0], m.wood);
  for (const y of [0.08, 1.29, 2.01, 2.78, 3.61]) {
    box(narrow, [1.08, 0.07, 0.82], [0, y, 0], m.wood, 0.006);
    if (y > 1.4) glowStrip(narrow, [0.87, 0.015, 0.02], [0, y - 0.041, 0.29]);
  }
  trailing(narrow, [0.15, 2.818, 0.14], m, 0.76);
  books(narrow, [-0.32, 2.048, 0], m, 4, true);
  pottery(narrow, [0.16, 1.329, 0], 0.66, m.clay);
  lamp(narrow, [0, 0.117, 0.035], 0.85, "floorLamp", "书架纸灯", 0, true);

  // Right middle: raised, rail-edged tea platform with an inset woven mat.
  const platform = group(root, [2.32, 0, -2.53]);
  platform.name = "dongfang-raised-tea-platform";
  box(platform, [4.57, 0.25, 2.83], [0, 0.145, 0], m.wood, 0.018);
  box(platform, [4.33, 0.026, 2.59], [0, 0.284, 0], m.woven, 0.008);
  for (const x of [-2.245, 2.245])
    box(platform, [0.08, 0.045, 2.85], [x, 0.303, 0], m.dark);
  for (const z of [-1.38, 1.38])
    box(platform, [4.56, 0.045, 0.08], [0, 0.303, z], m.dark);
  box(platform, [1.08, 0.13, 0.31], [-0.7, 0.07, 1.57], m.wood, 0.012);
  const rail = group(platform, [2.22, 0.31, 0]);
  for (const z of [-1.29, 1.29])
    box(rail, [0.08, 1.09, 0.08], [0, 0.545, z], m.wood);
  box(rail, [0.09, 0.065, 2.66], [0, 1.07, 0], m.wood);
  for (let i = 0; i < 17; i++)
    box(rail, [0.038, 0.91, 0.032], [0, 0.54, -1.19 + i * 0.149], m.dark);
  const tea = group(platform, [0.05, 0.305, 0.03]);
  for (const x of [-0.65, 0.65])
    for (const z of [-0.25, 0.25])
      box(tea, [0.075, 0.34, 0.075], [x, 0.17, z], m.dark);
  box(tea, [1.61, 0.085, 0.79], [0, 0.37, 0], m.wood, 0.018);
  const upstairsTea = teaSet(tea, [0.11, 0.416, 0.04], m, 0.84);
  touch(upstairsTea, "平台茶席", "高一阶，静一分。");
  pottery(tea, [-0.56, 0.416, -0.07], 0.31, m.clay);
  branches(tea, [-0.56, 0.635, -0.07], m, 0.6);
  for (const [x, z] of [
    [-1.31, -0.06],
    [1.24, 0.23],
  ]) {
    const g = group(platform, [x, 0.305, z]);
    sphere(g, [0.43, 0.1, 0.42], [0, 0.1, 0], m.linen);
    torus(g, 0.401, 0.007, [0, 0.102, 0], m.taupe);
    touch(g, "茶台圆坐垫", "落座，慢慢品茶。");
  }
  lamp(root, [4.63, 0.024, -3.3], 0.87, "floorLamp", "茶台落地灯", 3.4, true);

  // Main sitting area follows the reference's chair / table / foreground sofa triangle.
  const rug = box(
    root,
    [6.57, 0.029, 4.88],
    [-0.16, 0.038, 1.55],
    m.rug,
    0.012,
  );
  rug.name = "dongfang-main-rug";
  chair([-1.96, 0.055, -0.01], Math.atan2(1.88, 1.14));
  chair([2.19, 0.055, 1.9], Math.atan2(-2.27, -0.77));
  const sofa = group(root, [-0.03, 0.056, 3.38]);
  sofa.rotation.y = Math.PI;
  sofa.name = "dongfang-sofa";
  for (const x of [-1.83, 1.83])
    for (const z of [-0.42, 0.42])
      box(sofa, [0.12, 0.22, 0.12], [x, 0.11, z], m.dark);
  box(sofa, [3.97, 0.17, 1.08], [0, 0.3, 0], m.wood, 0.017);
  box(sofa, [3.91, 0.62, 0.11], [0, 0.684, -0.46], m.wood, 0.012);
  for (let i = 0; i < 4; i++) {
    const x = -1.47 + i * 0.98;
    box(sofa, [0.9, 0.46, 0.022], [x, 0.69, -0.528], m.dark, 0.004);
    box(sofa, [0.91, 0.22, 0.84], [x, 0.488, 0.035], m.linen, 0.07);
    const back = box(
      sofa,
      [0.94, 0.47, 0.2],
      [x, 0.828, -0.31],
      m.linen,
      0.078,
    );
    back.rotation.x = 0.14;
  }
  for (const x of [-1.93, 1.93]) {
    box(sofa, [0.09, 0.5, 0.96], [x, 0.53, 0], m.wood, 0.01);
    box(sofa, [0.22, 0.25, 0.94], [x, 0.777, 0], m.linen, 0.075);
  }
  for (const [x, z, mat, a] of [
    [-1.52, -0.11, m.taupe, -0.12],
    [-0.85, -0.05, m.sage, 0.07],
    [0.76, -0.08, m.sage, -0.08],
    [1.41, -0.09, m.linen, 0.16],
  ]) {
    const p = box(sofa, [0.53, 0.43, 0.2], [x, 0.795, z], mat, 0.074);
    p.rotation.z = a;
  }
  touch(sofa, "米白木框沙发", "把夜色留在窗外，慢慢坐一会儿。");
  const table = group(root, [-0.08, 0.057, 1.13]);
  table.name = "dongfang-natural-coffee-table";
  const outline = new THREE.Shape();
  for (let i = 0; i <= 72; i++) {
    const a = (i * Math.PI * 2) / 72,
      grain = 1 + 0.045 * Math.sin(a * 11) + 0.029 * Math.sin(a * 17);
    const x = Math.cos(a) * 1.21 * grain,
      z = Math.sin(a) * 0.61 * grain;
    if (i === 0) outline.moveTo(x, z);
    else outline.lineTo(x, z);
  }
  const slabGeo = new THREE.ExtrudeGeometry(outline, {
    depth: 0.18,
    bevelEnabled: true,
    bevelSize: 0.02,
    bevelThickness: 0.016,
    bevelSegments: 2,
  });
  const slab = new THREE.Mesh(slabGeo, m.wood);
  slab.rotation.x = -Math.PI / 2;
  slab.position.y = 0.35;
  slab.castShadow = slab.receiveShadow = true;
  table.add(slab);
  for (const x of [-0.81, 0.81])
    for (const z of [-0.31, 0.31])
      cylinder(table, 0.1, 0.125, 0.32, [x, 0.16, z], m.dark, 10);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    const knot = cylinder(
      table,
      0.057,
      0.075,
      0.18,
      [Math.cos(a) * 1.13, 0.44, Math.sin(a) * 0.55],
      m.wood,
      8,
    );
  }
  const centerTea = teaSet(table, [-0.15, 0.553, 0.08], m, 0.98);
  register(centerTea, "中央茶具", "温茶", () => {
    heat = 1;
    return "热气轻轻升起，茶香刚好。";
  });
  pottery(table, [0.48, 0.55, -0.25], 0.49, m.celadon);
  branches(table, [0.48, 0.89, -0.25], m, 0.9, true);
  books(table, [0.83, 0.55, 0.22], m, 2);
  const bowl = pottery(table, [-0.86, 0.55, -0.13], 0.27, m.clay, "bowl");
  touch(bowl, "粗陶小盏", "一只小盏，盛得下片刻清闲。");
  for (let i = 0; i < 4; i++) {
    const s = sphere(
      table,
      [0.021, 0.059, 0.021],
      [-0.2, 0.9, 0],
      new THREE.MeshBasicMaterial({
        color: "#e5e2d4",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    s.castShadow = false;
    steam.push(s);
  }
  touch(table, "天然原木茶几", "木纹与山水，都有自己的节奏。");

  // Foreground: low cabinet, rattan seat, stump side table and a vertical screen.
  const front = group(root, [-2.69, 0.022, 3.63]);
  front.name = "dongfang-foreground-cabinet";
  for (const y of [0.09, 0.43, 0.8])
    box(front, [1.32, 0.067, 0.73], [0, y, 0], m.wood, 0.009);
  for (const x of [-0.62, 0.62])
    box(front, [0.07, 0.73, 0.69], [x, 0.45, 0], m.dark);
  box(front, [1.22, 0.7, 0.03], [0, 0.44, -0.34], m.dark);
  books(front, [-0.39, 0.127, 0.05], m, 3);
  pottery(front, [0.34, 0.127, 0.04], 0.31, m.clay, "bowl");
  books(front, [-0.4, 0.465, 0.02], m, 5, true);
  box(front, [0.34, 0.2, 0.31], [0.37, 0.565, 0.025], m.dark, 0.005);
  bonsai(front, [-0.27, 0.838, 0], m, 0.78);
  books(front, [0.38, 0.838, 0.09], m, 2);
  touch(front, "前景边书柜", "书与盆景，陪着日常。");
  const pouf = wovenPouf(root, [2.09, 0.022, 4.24], m, 0.42);
  touch(pouf, "圆形藤编坐墩", "藤编柔韧，坐得自在。");
  const stump = group(root, [2.75, 0.022, 2.91]);
  stump.name = "dongfang-stump-side-table";
  cylinder(stump, 0.33, 0.4, 0.49, [0, 0.245, 0], m.wood, 13);
  cylinder(stump, 0.4, 0.36, 0.067, [0, 0.52, 0], m.wood, 24);
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5;
    tube(
      stump,
      [
        [Math.cos(a) * 0.39, 0.03, Math.sin(a) * 0.39],
        [Math.cos(a) * 0.31, 0.26, Math.sin(a) * 0.31],
        [Math.cos(a) * 0.32, 0.48, Math.sin(a) * 0.32],
      ],
      0.007,
      m.dark,
    );
  }
  pottery(stump, [0, 0.557, 0.02], 0.29, m.celadon, "bowl");
  touch(stump, "树桩边桌", "茶杯放下，心也放下。");
  const screen = group(root, [4.31, 0.022, 1.78]);
  screen.rotation.y = Math.PI / 2;
  screen.name = "dongfang-vertical-screen";
  for (const x of [-0.95, 0.95])
    box(screen, [0.09, 1.77, 0.1], [x, 0.885, 0], m.wood);
  for (const y of [0.13, 1.7]) box(screen, [2, 0.085, 0.08], [0, y, 0], m.wood);
  for (let i = 0; i < 19; i++)
    box(screen, [0.035, 1.54, 0.037], [-0.865 + i * 0.096, 0.918, 0], m.dark);
  const vase = pottery(root, [4.34, 0.023, 3.14], 0.96, m.celadon);
  branches(vase, [0, 0.68, 0], m, 1.42);
  touch(vase, "枝条大花瓶", "枝影疏朗，留一室清风。");
  lamp(root, [4.29, 0.024, 3.96], 0.6, "floorLamp", "屏风小纸灯");
  return {
    root,
    lamps,
    update(dt, t) {
      motions.forEach((a) => {
        a.t = Math.min(0.75, a.t + dt);
        a.o.position.y = a.y + 0.04 * Math.sin((a.t / 0.75) * Math.PI) ** 2;
      });
      doors.forEach(
        (d) => (d.g.rotation.y = damp(d.g.rotation.y, d.open ? -1.1 : 0, dt)),
      );
      drawers.forEach(
        (d) =>
          (d.g.position.z = damp(d.g.position.z, d.open ? 0.28 : 0.03, dt)),
      );
      heat = damp(heat, 0, dt, 0.65);
      steam.forEach((s, i) => {
        const p = (t * 0.17 + i * 0.24) % 1;
        s.position.y = 0.9 + p * 0.34;
        s.position.x = -0.2 + Math.sin(t + i) * 0.016;
        s.material.opacity = heat * Math.sin(p * Math.PI) * 0.13;
      });
      ripple = damp(ripple, 0, dt, 1.05);
      ripples.forEach((r, i) => {
        r.scale.setScalar(0.25 + (1 - ripple + i * 0.1) * 3.6);
        r.material.opacity = ripple * 0.21 * (1 - i * 0.2);
      });
    },
    reset() {
      heat = ripple = 0;
      doors.forEach((d) => (d.open = false));
      drawers.forEach((d) => (d.open = false));
      motions.forEach((a) => {
        a.t = 0.75;
        a.o.position.y = a.y;
      });
    },
  };
}
