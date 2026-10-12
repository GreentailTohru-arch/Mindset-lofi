import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import { table, lantern, vase, lattice, giltMotif } from "./details.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "金碧辉煌 · 音乐书房";
  const pulses = [];
  const touch = (obj, name, message) => {
    const p = { obj, y: obj.position.y, value: 0 };
    pulses.push(p);
    register(obj, name, "轻点互动", () => {
      p.value = 1;
      return message;
    });
  };
  function book(parent, pos, w = 0.43, color = m.cushion) {
    const g = group(parent, pos);
    box(g, [w, 0.074, 0.32], [0, 0, 0], m.paper, 0.003);
    for (const y of [-0.043, 0.043])
      box(g, [w + 0.025, 0.014, 0.35], [0, y, 0], color, 0.002);
    for (const x of [-w * 0.3, 0, w * 0.3])
      box(g, [0.012, 0.085, 0.018], [x, 0, 0.173], m.gold);
    return g;
  }
  function scroll(parent, pos, rotation = 0) {
    const g = group(parent, pos);
    g.rotation.y = rotation;
    box(g, [0.53, 0.018, 0.38], [0, 0.035, 0], m.paper, 0.005);
    for (const x of [-0.275, 0.275]) {
      const r = cylinder(g, 0.036, 0.036, 0.43, [x, 0.051, 0], m.paper);
      r.rotation.x = Math.PI / 2;
      for (const z of [-0.23, 0.23])
        sphere(g, [0.026, 0.026, 0.025], [x, 0.051, z], m.woodDark);
    }
    touch(g, "素面卷轴", "展卷静读 · 不知夜深");
    return g;
  }
  function bamboo(pos) {
    const g = group(root, pos);
    box(g, [0.65, 0.55, 0.65], [0, 0.29, 0], m.woodDark, 0.025);
    for (const y of [0.06, 0.52])
      box(g, [0.69, 0.04, 0.69], [0, y, 0], m.gold, 0.009);
    box(g, [0.57, 0.02, 0.57], [0, 0.572, 0], m.soil);
    giltMotif(g, [0, 0.31, 0.341], 0.5, m);
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.09,
        z = Math.sin(i * 2) * 0.13,
        h = 1.52 + (i % 3) * 0.23;
      cylinder(g, 0.018, 0.025, h, [x, 0.57 + h / 2, z], m.leaf, 10);
      for (let j = 0; j < 6; j++) {
        const y = 0.75 + j * 0.27,
          a = i * 2.4 + j;
        cylinder(g, 0.03, 0.03, 0.022, [x, y, z], m.leafLight, 10);
        const tip = [x + Math.cos(a) * 0.4, y + 0.14, z + Math.sin(a) * 0.4];
        tube(g, [[x, y, z], tip], 0.008, m.leaf);
        for (let k = 0; k < 3; k++) {
          const leaf = sphere(
            g,
            [0.035, 0.19, 0.014],
            [tip[0] + (k - 1) * 0.065, tip[1] + k * 0.04, tip[2]],
            m.leafLight,
          );
          leaf.rotation.set(0.35, a, 1.05 + k * 0.37);
        }
      }
    }
    touch(g, "宫苑竹盆景", "听竹声 · 静一静");
    return g;
  }
  bamboo([4.02, 0, -3.63]);
  const bonsai = table(root, [-3.48, 0, -3.42], 1.03, 0.83, 0.71, m);
  cylinder(bonsai, 0.39, 0.3, 0.17, [0, 0.86, 0], m.ceramic);
  cylinder(bonsai, 0.355, 0.355, 0.018, [0, 0.95, 0], m.soil);
  for (let i = 0; i < 5; i++) {
    const geo = new THREE.DodecahedronGeometry(0.3 + (i % 2) * 0.13, 0),
      stone = new THREE.Mesh(geo, m.stone);
    stone.position.set(
      (i - 2) * 0.105,
      1.06 + (i % 3) * 0.21,
      Math.cos(i) * 0.1,
    );
    stone.scale.set(0.8, 1.6, 0.7);
    stone.rotation.set(i * 0.3, i, 0);
    stone.castShadow = true;
    bonsai.add(stone);
  }
  tube(
    bonsai,
    [
      [0.2, 0.95, 0],
      [0.28, 1.42, -0.1],
      [0.5, 1.65, -0.15],
      [0.7, 1.6, -0.2],
    ],
    0.025,
    m.woodDark,
  );
  for (const p of [
    [0.48, 1.65, -0.15],
    [0.71, 1.65, -0.2],
    [0.25, 1.47, -0.14],
  ])
    sphere(bonsai, [0.22, 0.09, 0.17], p, m.leaf);
  touch(bonsai, "山石盆景", "山藏一隅 · 心有丘壑");

  const bench = table(root, [-3.53, 0, 0.05], 3.25, 1.04, 0.47, m);
  bench.rotation.y = Math.PI / 2;
  box(bench, [2.91, 0.16, 0.82], [0, 0.63, 0], m.silk, 0.075);
  for (const x of [-1.48, 1.48]) {
    box(bench, [0.1, 0.5, 0.89], [x, 0.74, 0], m.woodDark, 0.025);
    cylinder(bench, 0.06, 0.06, 0.95, [x, 0.99, 0], m.gold).rotation.x =
      Math.PI / 2;
  }
  lattice(bench, 2.87, 0.39, [0, 0.93, -0.43], m.woodDark);
  for (const x of [-0.84, 0.84]) {
    const pillow = box(
      bench,
      [0.6, 0.4, 0.18],
      [x, 0.88, -0.25],
      m.cushion,
      0.085,
    );
    pillow.rotation.x = -0.12;
    giltMotif(bench, [x, 0.89, -0.14], 0.4, m);
  }
  touch(bench, "宫廷软榻", "倚榻听风 · 一枕月色");
  const side = table(root, [-3.6, 0, 2.45], 0.83, 0.83, 0.75, m);
  const plum = vase(side, [0, 0.82, 0], 0.65, m);
  const petalMat = new THREE.MeshStandardMaterial({
    color: "#e8bec0",
    roughness: 0.73,
  });
  for (let i = 0; i < 4; i++) {
    const a = i * 2.2,
      tip = [Math.cos(a) * 0.43, 1.25 + i * 0.1, Math.sin(a) * 0.28];
    tube(
      plum,
      [[0, 0.68, 0], [tip[0] * 0.4, 1.12, tip[2] * 0.4], tip],
      0.015,
      m.woodDark,
    );
    for (let j = 0; j < 5; j++) {
      const p = [
        tip[0] + Math.cos(j * 2.4) * 0.11,
        tip[1] + Math.sin(j * 2.4) * 0.09,
        tip[2],
      ];
      for (let k = 0; k < 5; k++)
        sphere(
          plum,
          [0.031, 0.022, 0.016],
          [
            p[0] + Math.cos(k * 1.257) * 0.027,
            p[1] + Math.sin(k * 1.257) * 0.027,
            p[2],
          ],
          petalMat,
        );
    }
  }
  touch(plum, "青花梅瓶", "疏影横斜 · 暗香浮动");

  // Central reading and tea island, offset to keep an open path to the music cabinet.
  box(root, [4.95, 0.045, 4.05], [-0.25, 0.052, 1.5], m.rug, 0.014);
  for (const x of [-2.61, 2.11])
    box(root, [0.045, 0.008, 3.82], [x, 0.079, 1.5], m.cushion);
  for (const z of [-0.37, 3.37])
    box(root, [4.75, 0.008, 0.045], [-0.25, 0.079, z], m.cushion);
  for (const x of [-2.38, 1.88])
    for (const z of [-0.16, 3.16]) {
      const ornament = box(root, [0.24, 0.009, 0.24], [x, 0.079, z], m.cushion);
      ornament.rotation.y = Math.PI / 4;
      const inset = box(root, [0.15, 0.012, 0.15], [x, 0.083, z], m.rug);
      inset.rotation.y = Math.PI / 4;
    }
  const desk = table(root, [-0.3, 0.08, 1.24], 2.85, 1.43, 0.66, m);
  scroll(desk, [-0.28, 0.75, 0.13], -0.06);
  book(desk, [-0.93, 0.78, -0.3], 0.48);
  book(desk, [-0.9, 0.883, -0.3], 0.46, m.woodDark);
  const tea = group(desk, [0.81, 0.76, 0]);
  box(tea, [0.91, 0.045, 0.77], [0, 0, 0], m.woodDark, 0.02);
  const pot = group(tea, [0, 0.055, -0.14]);
  sphere(pot, [0.17, 0.12, 0.15], [0, 0.11, 0], m.ceramic);
  cylinder(pot, 0.11, 0.135, 0.028, [0, 0.22, 0], m.ceramic);
  sphere(pot, [0.027, 0.035, 0.027], [0, 0.253, 0], m.gold);
  tube(
    pot,
    [
      [0.12, 0.1, 0],
      [0.22, 0.17, 0],
      [0.25, 0.22, 0],
    ],
    0.038,
    m.ceramic,
  );
  torus(pot, 0.091, 0.018, [-0.18, 0.13, 0], m.ceramic, [0, 0, 0]);
  for (const x of [-0.24, 0.03, 0.28]) {
    cylinder(tea, 0.065, 0.042, 0.07, [x, 0.08, 0.2], m.ceramic);
    cylinder(tea, 0.052, 0.052, 0.005, [x, 0.117, 0.2], m.wood);
  }
  let teaPulse = 0;
  register(tea, "青瓷茶席", "温一盏茶", () => {
    teaPulse = 1;
    return "茶香温润 · 慢饮一盏";
  });
  const teaSteam = [];
  for (let i = 0; i < 5; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: "#f6e7cc",
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    teaSteam.push(
      sphere(tea, [0.026, 0.04, 0.026], [0, 0.35 + i * 0.06, -0.14], mat),
    );
  }
  for (const x of [-1.12, 0.5]) {
    const pad = group(root, [x, 0.09, 2.91]);
    cylinder(pad, 0.48, 0.47, 0.18, [0, 0.14, 0], m.cushion);
    torus(pad, 0.455, 0.016, [0, 0.215, 0], m.gold);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const stitch = box(
        pad,
        [0.026, 0.007, 0.16],
        [Math.cos(a) * 0.34, 0.237, Math.sin(a) * 0.34],
        m.gold,
        0.005,
      );
      stitch.rotation.y = -a;
    }
    touch(pad, "织金坐垫", "席地听曲 · 松一口气");
  }
  touch(desk, "红木低案", "半卷闲书 · 一夜清欢");

  // Music console, two small speakers and a movable lattice door.
  const cabinet = table(root, [0.05, 0, -4.02], 3.34, 0.97, 0.98, m);
  box(cabinet, [3.05, 0.72, 0.72], [0, 0.56, 0], m.woodDark, 0.01);
  for (const x of [-1.16, 1.16])
    lattice(cabinet, 0.65, 0.57, [x, 0.58, 0.39], m.wood);
  const door = group(cabinet, [-0.71, 0.58, 0.405]);
  box(door, [1.37, 0.58, 0.047], [0.685, 0, 0], m.wood, 0.01);
  torus(door, 0.105, 0.014, [0.91, 0, 0.035], m.gold, [0, 0, 0]);
  giltMotif(door, [0.44, 0, 0.028], 0.42, m);
  let doorOpen = false;
  register(door, "音乐柜门", "打开 / 合上", () => {
    doorOpen = !doorOpen;
    return doorOpen ? "格柜轻启 · 藏一室旧时光" : "格柜合拢";
  });
  const player = group(cabinet, [0, 1.095, 0]);
  box(player, [1.19, 0.13, 0.72], [0, 0, 0], m.wood, 0.025);
  box(player, [1.1, 0.025, 0.64], [0, 0.08, 0], m.bronze, 0.008);
  const record = cylinder(
    player,
    0.265,
    0.265,
    0.018,
    [-0.12, 0.105, 0],
    m.black,
    48,
  );
  record.name = "palace-record";
  for (const r of [0.13, 0.19, 0.23])
    torus(record, r, 0.002, [0, 0.011, 0], m.woodDark);
  cylinder(record, 0.06, 0.06, 0.004, [0, 0.012, 0], m.gold);
  box(record, [0.005, 0.004, 0.046], [0.11, 0.011, 0], m.gold);
  const arm = group(player, [0.43, 0.12, -0.23]);
  tube(
    arm,
    [
      [0, 0, 0],
      [-0.035, 0, 0.24],
      [-0.19, 0, 0.32],
    ],
    0.012,
    m.gold,
  );
  box(arm, [0.06, 0.03, 0.045], [-0.19, 0, 0.32], m.black, 0.004);
  let playing = true;
  register(player, "宫苑黑胶唱机", "播放 / 暂停", () => {
    playing = !playing;
    return playing ? "唱片缓转 · 宫苑慢时光" : "唱片暂停 · 只留月色";
  });
  for (const x of [-1.2, 1.2]) {
    const speaker = box(
      cabinet,
      [0.4, 0.56, 0.38],
      [x, 1.325, 0],
      m.woodDark,
      0.025,
    );
    for (const [y, r] of [
      [-0.095, 0.11],
      [0.155, 0.049],
    ]) {
      torus(speaker, r, 0.013, [0, y, 0.198], m.gold, [0, 0, 0]);
      sphere(speaker, [r * 0.79, r * 0.79, 0.02], [0, y, 0.2], m.black);
    }
    touch(speaker, "红木小音箱", "静静听 · 让节奏慢下来");
  }

  const shelf = group(root, [3.02, 0, -4.28]);
  for (const x of [-0.64, 0.64])
    box(shelf, [0.09, 2.54, 0.59], [x, 1.35, 0], m.woodDark, 0.008);
  box(shelf, [1.35, 2.48, 0.06], [0, 1.35, -0.27], m.woodDark);
  for (const y of [0.2, 0.94, 1.67, 2.61])
    box(shelf, [1.45, 0.1, 0.71], [0, y, 0.035], m.wood, 0.018);
  giltMotif(shelf, [0, 2.62, 0.41], 0.8, m);
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 6; i++) {
      const b = book(
        shelf,
        [-0.45 + i * 0.18, 0.53 + row * 0.74, 0.06],
        0.51,
        i % 2 ? m.cushion : m.wood,
      );
      b.rotation.z = Math.PI / 2;
    }
  }
  const shelfVase = vase(shelf, [-0.3, 1.72, 0], 0.73, m);
  touch(shelfVase, "青花瓷瓶", "青花映月 · 温润如玉");
  for (let i = 0; i < 3; i++) book(shelf, [0.29, 1.77 + i * 0.1, 0.03], 0.35);
  touch(shelf, "宫廷古籍架", "古籍无声 · 岁月有韵");

  // Three-panel carved folding screen at the right-hand side, not across the viewing opening.
  const screen = group(root, [3.47, 0, 0.2]);
  screen.rotation.y = 0.45;
  const panels = [];
  for (let i = 0; i < 3; i++) {
    const panel = group(screen, [(i - 1) * 0.84, 0, 0]);
    panel.rotation.y = i % 2 ? 0.18 : -0.18;
    for (const x of [-0.43, 0.43])
      box(panel, [0.055, 2.12, 0.07], [x, 1.08, 0], m.woodDark, 0.006);
    box(panel, [0.82, 0.08, 0.07], [0, 2.12, 0], m.wood);
    box(panel, [0.76, 1.45, 0.055], [0, 1.02, 0], m.paper);
    box(panel, [0.66, 1.31, 0.012], [0, 1.02, 0.035], m.art);
    box(panel, [0.66, 1.31, 0.012], [0, 1.02, -0.035], m.art);
    lattice(panel, 0.77, 0.27, [0, 1.93, 0], m.wood);
    giltMotif(panel, [0, 0.23, 0.045], 0.6, m);
    for (const y of [0.4, 1.75])
      cylinder(panel, 0.028, 0.028, 0.12, [0.46, y, 0], m.gold, 10);
    panels.push(panel);
  }
  let screenOpen = false;
  register(screen, "雕花折屏", "舒展 / 折起", () => {
    screenOpen = !screenOpen;
    return screenOpen ? "折屏轻收 · 月色相通" : "屏风舒展 · 留一隅静谧";
  });
  const scrollStand = table(root, [3.15, 0, 2.78], 0.8, 0.73, 0.58, m);
  vase(scrollStand, [0, 0.655, 0], 0.8, m);
  for (let i = 0; i < 3; i++) {
    const roll = cylinder(
      scrollStand,
      0.041,
      0.041,
      0.52,
      [0.1 * (i - 1), 1.44, 0],
      m.paper,
    );
    roll.rotation.z = (i - 1) * 0.12;
  }

  const incense = group(root, [1.65, 0.082, 2.48]);
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    cylinder(
      incense,
      0.024,
      0.035,
      0.14,
      [Math.cos(a) * 0.12, 0.09, Math.sin(a) * 0.12],
      m.bronze,
      10,
    );
  }
  sphere(incense, [0.23, 0.135, 0.23], [0, 0.23, 0], m.bronze);
  cylinder(incense, 0.15, 0.23, 0.085, [0, 0.35, 0], m.gold);
  sphere(incense, [0.034, 0.05, 0.034], [0, 0.43, 0], m.bronze);
  for (const s of [-1, 1])
    torus(incense, 0.065, 0.012, [s * 0.25, 0.31, 0], m.bronze, [0, 0, 0]);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    sphere(
      incense,
      [0.014, 0.009, 0.014],
      [Math.cos(a) * 0.155, 0.38, Math.sin(a) * 0.155],
      m.black,
    );
  }
  let incenseOn = true;
  register(incense, "青铜香炉", "香烟开关", () => {
    incenseOn = !incenseOn;
    return incenseOn ? "一缕轻烟 · 心绪渐静" : "香烟暂歇";
  });
  const smoke = [];
  for (let i = 0; i < 9; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: "#d5d4de",
      transparent: true,
      opacity: 0.11,
      depthWrite: false,
    });
    smoke.push(
      sphere(incense, [0.02, 0.065, 0.02], [0, 0.54 + i * 0.075, 0], mat),
    );
  }
  const lamps = [];
  for (const [pos, scale, key] of [
    [[-2.09, 1.85, -4.47], 0.8, "bedLamp"],
    [[2.05, 1.85, -4.47], 0.8, "bedLamp"],
    [[-3.64, 0.03, 3.52], 1, "floorLamp"],
  ]) {
    const l = lantern(root, pos, scale, m);
    lamps.push({
      ...l,
      pos: new THREE.Vector3(...pos).add(new THREE.Vector3(0, 0.4 * scale, 0)),
      key,
    });
    if (pos[1] > 1) {
      tube(
        root,
        [
          [pos[0], 3.05, pos[2] - 0.25],
          [pos[0], 3.05, pos[2]],
          [pos[0], pos[1] + 0.91 * scale, pos[2]],
        ],
        0.018,
        m.bronze,
      );
      cylinder(
        root,
        0.025,
        0.04,
        0.2,
        [pos[0], pos[1] - 0.05, pos[2]],
        m.lacquer,
        10,
      );
    }
    register(
      l.root,
      pos[1] > 1 ? "悬挂宫灯" : "落地宫灯",
      "点亮 / 熄灭",
      () => {
        store.set(key, !store.state[key]);
        return store.state[key] ? "宫灯亮起 · 暖意入夜" : "宫灯熄灭";
      },
    );
  }
  const candle = group(desk, [0.98, 0.76, -0.45]);
  cylinder(candle, 0.075, 0.11, 0.035, [0, 0.02, 0], m.bronze);
  cylinder(candle, 0.02, 0.025, 0.16, [0, 0.11, 0], m.gold);
  cylinder(candle, 0.079, 0.079, 0.03, [0, 0.2, 0], m.gold);
  cylinder(candle, 0.046, 0.046, 0.1, [0, 0.265, 0], m.paper);
  const flame = sphere(candle, [0.017, 0.045, 0.017], [0, 0.35, 0], m.glow);
  const candleLight = new THREE.PointLight("#ffd08b", 0.4, 1.5, 2);
  candleLight.position.set(0, 0.4, 0);
  candle.add(candleLight);
  let candleOn = true;
  register(candle, "案上烛火", "点亮 / 熄灭", () => {
    candleOn = !candleOn;
    return candleOn ? "烛火摇曳" : "烛火熄灭";
  });
  return {
    root,
    lamps,
    update(dt, t) {
      if (playing) record.rotation.y += dt * 0.6;
      arm.rotation.y = damp(arm.rotation.y, playing ? 0 : -0.48, dt, 3);
      door.rotation.y = damp(door.rotation.y, doorOpen ? -1.04 : 0, dt, 3);
      panels.forEach((p, i) => {
        p.rotation.y = damp(
          p.rotation.y,
          screenOpen ? (i % 2 ? 0.72 : -0.72) : i % 2 ? 0.18 : -0.18,
          dt,
          2,
        );
        p.position.x = damp(
          p.position.x,
          (i - 1) * (screenOpen ? 0.63 : 0.84),
          dt,
          2,
        );
      });
      smoke.forEach((s, i) => {
        const phase = (t * 0.2 + i / 9) % 1;
        s.position.set(
          Math.sin(t + i) * 0.045,
          0.48 + phase * 0.79,
          Math.cos(t * 0.7 + i) * 0.025,
        );
        s.material.opacity = damp(
          s.material.opacity,
          incenseOn ? Math.sin(phase * Math.PI) * 0.13 : 0,
          dt,
          3,
        );
      });
      teaPulse = damp(teaPulse, 0, dt, 0.7);
      teaSteam.forEach((s, i) => {
        s.material.opacity = teaPulse * 0.16;
        s.position.y = 0.32 + ((t * 0.2 + i * 0.13) % 1) * 0.45;
        s.position.x = Math.sin(t + i) * 0.024;
      });
      flame.visible = candleOn;
      candleLight.intensity = damp(
        candleLight.intensity,
        candleOn ? 0.4 : 0,
        dt,
      );
      flame.scale.y = 0.045 * (1 + Math.sin(t * 5) * 0.1);
      for (const p of pulses) {
        p.value = damp(p.value, 0, dt, 3);
        p.obj.position.y = p.y + Math.sin(p.value * Math.PI) * 0.018;
      }
    },
    reset() {
      playing = true;
      doorOpen = false;
      screenOpen = false;
      incenseOn = true;
      candleOn = true;
      teaPulse = 0;
      for (const p of pulses) {
        p.value = 0;
        p.obj.position.y = p.y;
      }
    },
  };
}
