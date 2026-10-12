import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import { wornSlab, pottery, branches } from "./forms.js";
import {
  books,
  linenStack,
  basket,
  rug,
  rumpled,
  cushion,
  bonsai,
  trailingPlant,
  stool,
} from "./details.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, registerItem) {
  const root = group(scene);
  root.name = "侘寂风 · Quiet objects";
  const pulses = [],
    lamps = [],
    drawers = [],
    candles = [];
  let teaWarm = 0,
    ripple = 0;
  function register(o, name, hint, action, lift = true) {
    const p = { obj: o, y: o.position.y, t: 0.8 };
    if (lift) pulses.push(p);
    registerItem(o, name, hint, () => {
      p.t = 0;
      return action();
    });
  }
  const touch = (o, name, message) => register(o, name, "Touch", () => message);
  // Grounded, subtle contact shadows supplement the single soft shadow map.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d"),
    gradient = ctx.createRadialGradient(64, 64, 9, 64, 64, 64);
  gradient.addColorStop(0, "#28272050");
  gradient.addColorStop(0.55, "#28272025");
  gradient.addColorStop(1, "#28272000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const contactMap = new THREE.CanvasTexture(canvas);
  function contact(x, z, w, d, y = 0.023) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({
        map: contactMap,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    root.add(mesh);
  }
  function lantern(parent, pos, size, key, name, power = 0) {
    const g = group(parent, pos);
    g.scale.setScalar(size);
    wornSlab(g, [0.4, 0.052, 0.37], [0, 0.026, 0], m.darkWood, 4);
    const shade = box(
      g,
      [0.29, 0.46, 0.27],
      [0, 0.294, 0],
      m.glow.clone(),
      0.023,
    );
    shade.castShadow = false;
    for (const x of [-0.166, 0.166])
      for (const z of [-0.156, 0.156])
        box(g, [0.018, 0.53, 0.018], [x, 0.295, z], m.darkWood);
    for (const y of [0.074, 0.23, 0.39, 0.555]) {
      for (const x of [-0.166, 0.166])
        box(g, [0.018, 0.018, 0.33], [x, y, 0], m.darkWood);
      for (const z of [-0.156, 0.156])
        box(g, [0.35, 0.018, 0.018], [0, y, z], m.darkWood);
    }
    torus(g, 0.055, 0.007, [0, 0.604, 0], m.metal, [0, 0, 0]);
    root.updateMatrixWorld(true);
    const point = g.localToWorld(new THREE.Vector3(0, 0.31, 0));
    lamps.push({ shade: shade.material, key, pos: point.toArray(), power });
    register(g, name, "Light / extinguish", () => {
      store.set(key, !store.state[key]);
      return store.state[key]
        ? "A faint glow in the quiet."
        : "Only the soft garden light.";
    });
    return shade.material;
  }
  function candle(parent, pos, scale = 1) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    cylinder(g, 0.08, 0.086, 0.023, [0, 0.012, 0], m.clay);
    cylinder(g, 0.052, 0.056, 0.15, [0, 0.098, 0], m.paper);
    tube(
      g,
      [
        [0, 0.174, 0],
        [0.004, 0.195, 0],
      ],
      0.004,
      m.charcoal,
    );
    const flame = sphere(
      g,
      [0.019, 0.05, 0.019],
      [0, 0.225, 0],
      m.glow.clone(),
    );
    flame.castShadow = false;
    const c = { flame, lit: true };
    candles.push(c);
    register(g, "小蜡烛", "点亮 / 熄灭", () => {
      c.lit = !c.lit;
      return c.lit ? "A little candlelight." : "The candle rests.";
    });
    return g;
  }
  function sideTable(pos, w = 0.78, d = 0.58, h = 0.54) {
    const g = group(root, pos);
    for (const x of [-w * 0.37, w * 0.37])
      for (const z of [-d * 0.34, d * 0.34])
        wornSlab(g, [0.08, h, 0.09], [x, h / 2, z], m.darkWood, 3);
    wornSlab(g, [w, 0.085, d], [0, h, 0], m.wood, 6);
    return g;
  }

  // Background: full low sleeping platform, long grain, irregular linen and an ink scroll.
  const bed = group(root, [-1.64, 0, -2.8]);
  bed.name = "wabisabi-platform-bed";
  for (const x of [-1.48, 1.48])
    for (const z of [-1.3, 1.3])
      wornSlab(bed, [0.22, 0.24, 0.27], [x, 0.14, z], m.darkWood, 3);
  for (let i = 0; i < 9; i++)
    wornSlab(
      bed,
      [3.6 - (i === 8 ? 0.09 : 0), 0.16, 0.365],
      [i === 8 ? -0.04 : 0, 0.32, -1.49 + i * 0.37],
      m.wood,
      i + 3,
    );
  wornSlab(bed, [3.25, 0.45, 0.12], [0, 0.55, -1.48], m.darkWood, 5);
  box(bed, [2.93, 0.19, 2.78], [-0.08, 0.492, -0.07], m.linen, 0.1);
  box(bed, [2.87, 0.12, 2.06], [-0.07, 0.638, 0.27], m.linen, 0.1);
  rumpled(bed, [-0.07, 0.711, 0.39], 2.92, 2.43, m.linen, {
    amp: 0.035,
    drop: 0.17,
  });
  box(bed, [1.25, 0.06, 1.38], [0.39, 0.771, 0.6], m.blanket, 0.025);
  rumpled(bed, [0.39, 0.838, 0.83], 1.32, 1.78, m.blanket, {
    amp: 0.031,
    drop: 0.21,
    dropStart: 0.44,
  }).rotation.z = 0.055;
  for (const [x, z, a] of [
    [-0.97, -1.02, -0.12],
    [0.12, -1.07, 0.06],
    [0.95, -0.99, 0.13],
  ]) {
    const pillow = box(bed, [0.8, 0.23, 0.55], [x, 0.674, z], m.linen, 0.1);
    pillow.rotation.y = a;
  }
  const accentPillow = box(
    bed,
    [0.67, 0.23, 0.5],
    [0.14, 0.79, -0.78],
    m.blanket,
    0.11,
  );
  accentPillow.rotation.y = -0.22;
  tube(
    bed,
    [
      [-1.72, 0.415, 1.1],
      [-1.27, 0.415, 1.12],
      [-0.81, 0.415, 1.09],
    ],
    0.004,
    m.charcoal,
  );
  touch(bed, "低矮老木平台床", "Let the linen keep its creases.");
  contact(-1.64, -2.8, 4.12, 3.84);
  rug(root, [-1.24, 0.024, -0.75], 2.3, 0.72, m, -0.04);
  const scroll = group(root, [-1.9, 2.32, -4.765]);
  scroll.name = "wabisabi-ink-scroll";
  wornSlab(scroll, [0.89, 1.78, 0.012], [0, 0, 0], m.ink, 2);
  for (const y of [-0.9, 0.9]) {
    const rod = cylinder(scroll, 0.02, 0.021, 1.02, [0, y, 0.006], m.darkWood);
    rod.rotation.z = Math.PI / 2;
  }
  register(
    scroll,
    "旧水墨挂轴",
    "静观",
    () => "Faded ink, with room to breathe.",
    false,
  );
  const left = sideTable([-3.96, 0, -3.8], 0.81, 0.92, 0.58);
  const shade = lantern(
    left,
    [0, 0.626, 0.1],
    0.9,
    "bedLamp",
    "Small paper lantern",
    3.6,
  );
  pottery(left, [-0.23, 0.626, -0.27], 0.4, m.clay);
  branches(left, [-0.23, 0.92, -0.27], 0.33, m.darkWood);
  const right = sideTable([0.71, 0, -3.42], 0.72, 0.6, 0.5);
  books(right, [-0.14, 0.551, 0.03], m, 2);
  const smallVase = pottery(right, [0.19, 0.551, -0.04], 0.35, m.rust);
  branches(smallVase, [0, 0.7, 0], 0.45, m.darkWood);
  const branchJar = pottery(root, [-3.87, 0.026, -2.68], 0.74, m.clay);
  branches(branchJar, [0, 0.68, 0], 0.8, m.darkWood);
  touch(
    branchJar,
    "Imperfect branch vase",
    "What remains can still be beautiful.",
  );
  // Objects sit within the depth of the two real arched recesses.
  bonsai(root, [0.55, 1.833, -4.99], m, 0.79);
  lantern(root, [1.02, 1.52, -4.63], 0.36, "bedLamp", "壁边纸灯");
  const nicheJar = pottery(root, [4.13, 1.148, -5.02], 0.61, m.clay);
  branches(nicheJar, [0, 0.71, 0], 0.68, m.darkWood);
  touch(nicheJar, "壁龛陶罐", "Cracked glaze, quietly kept.");
  sphere(root, [0.13, 0.085, 0.095], [3.84, 1.245, -4.99], m.stone);
  candle(root, [4.41, 1.15, -4.99], 0.59);

  // Rear-right shelves and a low drawer base, populated with everyday materials.
  const cabinet = group(root, [2.37, 0, -4.38]);
  cabinet.name = "wabisabi-rear-storage";
  for (const x of [-0.83, 0.83])
    wornSlab(cabinet, [0.1, 2.68, 0.78], [x, 1.4, 0], m.darkWood, 6);
  wornSlab(cabinet, [1.63, 2.49, 0.06], [0, 1.39, -0.365], m.darkWood, 7);
  for (const y of [0.15, 0.66, 1.23, 1.87, 2.71])
    wornSlab(cabinet, [1.82, 0.085, 0.83], [0, y, 0], m.wood, 3);
  for (let i = 0; i < 2; i++) {
    const g = group(cabinet, [-0.43 + i * 0.86, 0.405, 0.02]);
    wornSlab(g, [0.74, 0.37, 0.63], [0, 0, 0], m.wood, 4);
    wornSlab(g, [0.79, 0.39, 0.055], [0, 0, 0.375], m.darkWood, 8);
    torus(g, 0.035, 0.006, [0, 0.02, 0.412], m.metal, [0, 0, 0]);
    const d = { g, open: false };
    drawers.push(d);
    register(
      g,
      i ? "旧木右抽屉" : "旧木收纳抽屉",
      "拉开 / 收起",
      () => {
        d.open = !d.open;
        return d.open
          ? "Linen and small things, put away."
          : "The drawer settles closed.";
      },
      false,
    );
  }
  books(cabinet, [-0.58, 0.711, 0.03], m, 5);
  linenStack(cabinet, [0.4, 0.711, 0.03], m, 3);
  books(cabinet, [-0.58, 1.274, 0], m, 5, true);
  pottery(cabinet, [0.44, 1.274, 0.03], 0.49, m.rust, "bowl");
  pottery(cabinet, [-0.45, 1.914, 0.01], 0.65, m.clay);
  pottery(cabinet, [0.18, 1.914, 0.08], 0.31, m.charcoal, "bowl");
  books(cabinet, [0.52, 1.914, 0.05], m, 2);
  const incense = group(cabinet, [0.18, 2.025, 0.08]);
  tube(
    incense,
    [
      [0, 0, 0],
      [0.016, 0.15, 0],
    ],
    0.003,
    m.darkWood,
  );
  touch(incense, "香器", "A trace of incense in the still air.");
  candle(cabinet, [0.52, 2.045, 0.05], 0.7);
  const vine = trailingPlant(cabinet, [-0.68, 2.755, 0.22], m, 0.95);
  touch(vine, "垂落藤蔓", "Leaves follow the light.");
  pottery(cabinet, [0.02, 2.755, 0], 0.55, m.clay);
  const shelfVase = pottery(cabinet, [0.59, 2.755, 0], 0.39, m.charcoal);
  branches(shelfVase, [0, 0.7, 0], 0.57, m.darkWood);
  const sideChest = sideTable([4.02, 0, -3.71], 1.13, 0.73, 0.49);
  wornSlab(sideChest, [1.04, 0.37, 0.67], [0, 0.245, 0], m.darkWood, 2);
  books(sideChest, [-0.21, 0.54, 0], m, 3);
  candle(sideChest, [0.26, 0.54, 0.03], 0.85);
  linenStack(sideChest, [0.29, 0.54, -0.21], m, 2);
  const floorVase = pottery(root, [4.37, 0.024, -2.4], 0.97, m.clay);
  branches(floorVase, [0, 0.7, 0], 1.13, m.darkWood);
  touch(floorVase, "枯枝花器", "The bare branch makes its own shape.");
  basket(root, [4.65, 0.023, -1.43], m, 1.12);
  const rearStool = stool(root, [3.69, 0.024, -1.9], m);
  rumpled(rearStool, [0.05, 0.581, 0.1], 0.39, 0.8, m.linen, {
    amp: 0.015,
    drop: 0.29,
  });

  // Midground: generous woven rug, rough live-edge tea slab and offset round cushions.
  rug(root, [1.64, 0.024, 1.35], 5.62, 4.65, m, -0.012);
  const tea = group(root, [1.76, 0.064, 1.4]);
  tea.rotation.y = -0.055;
  tea.name = "wabisabi-tea-table";
  for (const x of [-1.22, 1.22])
    wornSlab(tea, [0.23, 0.44, 0.74], [x, 0.23, 0], m.darkWood, 6);
  wornSlab(tea, [3.12, 0.17, 1.09], [0, 0.51, 0], m.wood, 8);
  tube(
    tea,
    [
      [-1.54, 0.61, 0.16],
      [-0.88, 0.61, 0.18],
      [-0.44, 0.61, 0.135],
      [0.24, 0.61, 0.18],
    ],
    0.004,
    m.charcoal,
  );
  wornSlab(tea, [1.26, 0.027, 0.48], [0.29, 0.614, 0.04], m.darkWood, 4);
  const kettle = group(tea, [0.28, 0.632, 0.025]);
  sphere(kettle, [0.2, 0.17, 0.18], [0, 0.165, 0], m.charcoal);
  cylinder(kettle, 0.105, 0.126, 0.026, [0, 0.32, 0], m.charcoal);
  sphere(kettle, [0.025, 0.023, 0.026], [0, 0.354, 0], m.darkWood);
  tube(
    kettle,
    [
      [0.12, 0.17, 0],
      [0.24, 0.22, 0],
      [0.28, 0.3, 0],
    ],
    0.033,
    m.charcoal,
  );
  torus(kettle, 0.185, 0.012, [0, 0.29, 0], m.metal, [0, 0, 0], Math.PI);
  register(kettle, "Rough ceramic tea vessel", "Warm tea", () => {
    teaWarm = 1;
    return "A little warmth, held in both hands.";
  });
  for (const [x, z] of [
    [-0.23, 0.16],
    [0.76, 0.14],
    [-0.85, -0.04],
    [0.12, -0.32],
  ]) {
    cylinder(tea, 0.095, 0.1, 0.012, [x, 0.612, z], m.darkWood);
    const cup = pottery(tea, [x, 0.625, z], 0.245, m.clay, "bowl");
    touch(cup, "Chipped glaze cup", "A small flaw, kept and loved.");
  }
  const teaVase = pottery(tea, [-1.1, 0.608, -0.23], 0.46, m.rust);
  branches(teaVase, [0, 0.68, 0], 0.7, m.darkWood);
  books(tea, [1.15, 0.61, 0.02], m, 2);
  candle(tea, [1.14, 0.744, 0.01], 0.85);
  const steam = [];
  for (let i = 0; i < 5; i++) {
    const v = sphere(
      tea,
      [0.02, 0.055, 0.02],
      [0.28, 1.1, 0.025],
      new THREE.MeshBasicMaterial({
        color: "#dadbd2",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    v.castShadow = false;
    steam.push(v);
  }
  touch(tea, "Cracked tea slab", "The grain keeps a record of time.");
  contact(1.76, 1.4, 3.55, 1.46, 0.067);
  for (const [x, z, r] of [
    [1.05, 2.76, 0.57],
    [1.73, -0.21, 0.53],
    [2.35, 2.87, 0.44],
  ]) {
    const g = cushion(root, [x, 0.054, z], m, r);
    touch(g, "圆形坐垫", "Sit lightly. Stay a while.");
    contact(x, z, r * 2.3, r * 2.3, 0.064);
  }
  const teaStool = stool(root, [3.96, 0.059, 1.78], m);
  touch(teaStool, "Weathered stool", "Steady enough. Nothing more.");
  // A faint localized light belongs to the candle cluster, not the whole room.
  lamps.push({
    shade: candles[candles.length - 1].flame.material,
    key: "floorLamp",
    pos: [2.9, 1.08, 1.35],
    power: 1.8,
    candle: candles[candles.length - 1],
  });

  // Left foreground writing corner: blank paper, brush tools and a low backed chair.
  rug(root, [-2.3, 0.024, 2.7], 2.9, 2.18, m, 0.025);
  const desk = group(root, [-2.24, 0.065, 2.3]);
  desk.name = "wabisabi-writing-desk";
  for (const x of [-1.09, 1.09])
    for (const z of [-0.4, 0.4])
      wornSlab(desk, [0.12, 0.58, 0.13], [x, 0.29, z], m.darkWood, 5);
  wornSlab(desk, [2.62, 0.115, 1.13], [0, 0.62, 0], m.wood, 7);
  box(desk, [0.89, 0.009, 0.48], [-0.06, 0.683, 0.08], m.paper, 0.003);
  box(desk, [0.9, 0.008, 0.47], [-0.025, 0.693, 0.061], m.paper, 0.003);
  const ink = box(
    desk,
    [0.25, 0.04, 0.2],
    [0.55, 0.694, 0.08],
    m.charcoal,
    0.023,
  );
  box(desk, [0.18, 0.005, 0.12], [0.55, 0.716, 0.08], m.water, 0.01);
  touch(ink, "砚台", "A blank page asks for nothing.");
  tube(
    desk,
    [
      [0.42, 0.698, -0.13],
      [0.45, 0.698, 0.3],
    ],
    0.008,
    m.grass,
  );
  tube(
    desk,
    [
      [0.45, 0.698, 0.3],
      [0.46, 0.698, 0.37],
    ],
    0.009,
    m.charcoal,
  );
  books(desk, [-0.91, 0.681, -0.16], m, 4);
  const brushPot = pottery(desk, [-1.04, 0.683, 0.31], 0.28, m.charcoal);
  for (let i = 0; i < 4; i++)
    tube(
      brushPot,
      [
        [0, 0.4, 0],
        [(i - 1.5) * 0.09, 1.24 + i * 0.09, 0],
      ],
      0.015,
      m.darkWood,
    );
  lantern(desk, [0.94, 0.681, -0.21], 0.66, "floorLamp", "书写纸灯", 2.7);
  candle(desk, [0.96, 0.683, 0.3], 0.8);
  touch(desk, "低矮书写桌", "Paper, ink, and a slower afternoon.");
  contact(-2.24, 2.3, 2.93, 1.45, 0.064);
  const chair = group(root, [-2.3, 0.063, 3.35]);
  chair.name = "wabisabi-writing-chair";
  wornSlab(chair, [0.95, 0.085, 0.73], [0, 0.18, 0], m.darkWood, 4);
  box(chair, [0.83, 0.14, 0.6], [0, 0.278, -0.01], m.linen, 0.07);
  for (const x of [-0.4, 0.4])
    wornSlab(chair, [0.06, 0.78, 0.07], [x, 0.45, 0.31], m.wood, 5);
  wornSlab(chair, [0.88, 0.08, 0.09], [0, 0.86, 0.31], m.wood, 5);
  for (let i = 0; i < 5; i++)
    wornSlab(
      chair,
      [0.042, 0.46, 0.035],
      [-0.3 + i * 0.15, 0.57, 0.31],
      m.darkWood,
      3,
    );
  touch(chair, "旧木椅", "A familiar seat, worn smooth.");
  const tools = basket(root, [-3.89, 0.025, 3.29], m, 1.06);
  for (let i = 0; i < 7; i++) {
    const x = Math.sin(i * 2) * 0.09,
      z = Math.cos(i * 2) * 0.08;
    tube(
      tools,
      [
        [x, 0.22, z],
        [x * 1.8, 0.63 + (i % 3) * 0.09, z * 1.8],
      ],
      0.013,
      m.wood,
    );
  }
  touch(tools, "工具藤篮", "Tools find their place again.");

  // Foreground layer: open books, cloth and a small bonsai, below the room's sightline.
  const front = group(root, [0.05, 0.025, 4.24]);
  front.name = "wabisabi-foreground-storage";
  for (const y of [0.07, 0.48, 0.93])
    wornSlab(front, [2.66, 0.075, 0.66], [0, y, 0], m.wood, 6);
  for (const x of [-1.27, -0.38, 0.48, 1.27])
    wornSlab(front, [0.075, 0.87, 0.61], [x, 0.5, 0], m.darkWood, 4);
  wornSlab(front, [2.52, 0.83, 0.04], [0, 0.5, -0.3], m.darkWood, 3);
  books(front, [-1.14, 0.113, 0.03], m, 6, true);
  pottery(front, [-0.05, 0.113, 0.03], 0.4, m.clay);
  books(front, [0.87, 0.113, 0.04], m, 4);
  books(front, [-0.84, 0.52, 0.02], m, 4);
  linenStack(front, [0.03, 0.52, 0.04], m, 3);
  wornSlab(front, [0.47, 0.25, 0.43], [0.89, 0.65, 0.015], m.darkWood, 6);
  const littleTree = bonsai(front, [-0.76, 0.975, -0.04], m, 0.96);
  touch(littleTree, "前景盆景", "A small landscape within the room.");
  trailingPlant(front, [-1.13, 0.975, 0.17], m, 0.59);
  const frontVase = pottery(front, [0.74, 0.975, 0.04], 0.31, m.charcoal);
  branches(frontVase, [0, 0.7, 0], 0.49, m.darkWood);
  books(front, [0.17, 0.975, 0], m, 2);
  touch(front, "前景旧书架", "Old books and small things, close at hand.");
  contact(0.05, 4.24, 2.98, 0.99);
  const folded = group(root, [2.16, 0.03, 4.19]);
  box(folded, [0.93, 0.17, 0.74], [0, 0.095, 0], m.blanket, 0.07);
  box(folded, [0.88, 0.16, 0.68], [0.045, 0.254, -0.025], m.linen, 0.065);
  rumpled(folded, [0.03, 0.385, 0.08], 0.7, 0.7, m.blanket, {
    amp: 0.02,
    drop: 0.06,
  });
  touch(folded, "折叠坐垫与布包", "Kept ready for a quiet visit.");
  pottery(root, [1.5, 0.025, 4.38], 0.49, m.clay);
  const slippers = group(root, [3.29, 0.028, 3.77]);
  slippers.rotation.y = -0.25;
  for (const x of [-0.17, 0.17]) {
    wornSlab(slippers, [0.24, 0.034, 0.5], [x, 0.023, 0], m.wood, 4);
    tube(
      slippers,
      [
        [x - 0.095, 0.047, -0.09],
        [x, 0.13, -0.035],
        [x + 0.095, 0.047, 0.08],
      ],
      0.022,
      m.blanket,
    );
  }
  touch(slippers, "室内木屐", "Leave the hurry at the door.");

  // Left window-side basin with layered pebbles, moss and a wooden ladle.
  const basin = pottery(root, [-4.12, 0.026, 1.92], 0.93, m.stone, "basin");
  basin.name = "stone-basin";
  const water = cylinder(basin, 0.49, 0.49, 0.007, [0, 0.3, 0], m.water, 48);
  water.name = "basin-water";
  tube(
    basin,
    [
      [-0.48, 0.56, -0.2],
      [0.32, 0.52, 0.18],
    ],
    0.018,
    m.wood,
  );
  const ladle = cylinder(
    basin,
    0.095,
    0.083,
    0.079,
    [0.29, 0.48, 0.17],
    m.wood,
  );
  ladle.rotation.z = 0.18;
  cylinder(basin, 0.066, 0.067, 0.005, [0.29, 0.522, 0.17], m.charcoal);
  const ripples = [];
  for (let i = 0; i < 3; i++) {
    const ring = torus(basin, 0.08, 0.003, [0, 0.309, 0], m.paper.clone());
    ring.material.transparent = true;
    ring.material.opacity = 0;
    ring.material.depthWrite = false;
    ripples.push(ring);
  }
  register(
    basin,
    "Weathered stone basin",
    "Touch the water",
    () => {
      ripple = 1;
      return "One ripple, then stillness.";
    },
    false,
  );
  contact(-4.12, 1.92, 1.5, 1.34);
  for (let i = 0; i < 48; i++) {
    const a = i * 2.399,
      r = 0.58 + (i % 4) * 0.075,
      x = -4.12 + Math.cos(a) * r,
      z = 1.92 + Math.sin(a) * r;
    sphere(
      root,
      [0.035 + (i % 3) * 0.012, 0.029, 0.049],
      [x, 0.042, z],
      i % 4 ? m.stone : m.moss,
    );
  }
  wornSlab(root, [0.76, 0.13, 0.34], [-3.83, 0.095, 2.75], m.stone, 7);
  sphere(root, [0.18, 0.029, 0.12], [-3.87, 0.175, 2.77], m.moss);
  const basinJar = pottery(root, [-4.47, 0.028, 3.14], 0.68, m.rust);
  branches(basinJar, [0, 0.7, 0], 0.78, m.darkWood);
  lantern(root, [-4.55, 0.026, 2.71], 0.75, "floorLamp", "水钵纸灯");
  for (let i = 0; i < 12; i++) {
    const x = -4.69 + (i % 3) * 0.06,
      z = 1.04 + Math.floor(i / 3) * 0.05,
      h = 0.22 + (i % 4) * 0.09;
    tube(
      root,
      [
        [x, 0.035, z],
        [x + 0.03, h, z],
        [x + 0.09, h + 0.09, z + 0.03],
      ],
      0.003,
      m.grass,
    );
  }

  return {
    root,
    shade,
    lamps,
    update(dt, t) {
      teaWarm = damp(teaWarm, 0, dt, 0.75);
      steam.forEach((s, i) => {
        const p = (t * 0.15 + i * 0.19) % 1;
        s.position.y = 1 + p * 0.36;
        s.position.x = 0.28 + Math.sin(t + i) * 0.017;
        s.material.opacity = teaWarm * Math.sin(p * Math.PI) * 0.13;
      });
      ripple = damp(ripple, 0, dt, 1.1);
      ripples.forEach((r, i) => {
        const progress = 1 - ripple + i * 0.11;
        r.scale.setScalar(0.3 + progress * 4.5);
        r.material.opacity = ripple * 0.15 * (1 - i * 0.2);
      });
      for (const p of pulses) {
        p.t = Math.min(0.8, p.t + dt);
        p.obj.position.y = p.y + 0.034 * Math.sin((p.t / 0.8) * Math.PI) ** 2;
      }
      drawers.forEach(
        (d) =>
          (d.g.position.z = damp(d.g.position.z, d.open ? 0.36 : 0.02, dt)),
      );
      candles.forEach((c, i) => {
        c.flame.visible = c.lit;
        c.flame.scale.y = 0.05 * (1 + Math.sin(t * 3 + i) * 0.08);
      });
    },
    reset() {
      teaWarm = ripple = 0;
      drawers.forEach((d) => (d.open = false));
      candles.forEach((c) => (c.lit = true));
      pulses.forEach((p) => {
        p.t = 0.8;
        p.obj.position.y = p.y;
      });
    },
  };
}
