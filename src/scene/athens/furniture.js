import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "雅典神话 · 书房与音乐角";
  const pulses = [];
  function touch(obj, name, message) {
    const p = { obj, y: obj.position.y, value: 0 };
    pulses.push(p);
    register(obj, name, "轻点互动", () => {
      p.value = 1;
      return message;
    });
  }
  function amphora(parent, pos, scale = 1) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    const profile = [
      [0.12, 0],
      [0.18, 0.05],
      [0.18, 0.1],
      [0.27, 0.2],
      [0.35, 0.43],
      [0.33, 0.61],
      [0.24, 0.76],
      [0.12, 0.85],
      [0.115, 1.02],
      [0.18, 1.045],
    ].map((p) => new THREE.Vector2(...p));
    const body = new THREE.Mesh(
      new THREE.LatheGeometry(profile, 32),
      m.terracotta,
    );
    body.castShadow = body.receiveShadow = true;
    g.add(body);
    cylinder(g, 0.12, 0.12, 0.008, [0, 1.022, 0], m.woodDark);
    for (const side of [-1, 1])
      tube(
        g,
        [
          [side * 0.13, 0.96, 0],
          [side * 0.36, 0.97, 0],
          [side * 0.43, 0.73, 0],
          [side * 0.28, 0.59, 0],
        ],
        0.036,
        m.terracotta,
      );
    for (const [r, y] of [
      [0.18, 0.14],
      [0.335, 0.48],
      [0.305, 0.67],
      [0.13, 0.89],
    ])
      torus(g, r, 0.014, [0, y, 0], m.woodDark);
    for (let i = 0; i < 14; i++) {
      const a = (i * Math.PI) / 7;
      const mark = box(
        g,
        [0.047, 0.085, 0.012],
        [Math.sin(a) * 0.346, 0.49, Math.cos(a) * 0.346],
        m.woodDark,
      );
      mark.rotation.y = a;
    }
    touch(g, "陶制双耳瓶", "陶土留温 · 一器盛着海岸的颜色");
    return g;
  }
  function olive(parent, pos, scale = 1) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    cylinder(g, 0.35, 0.24, 0.52, [0, 0.29, 0], m.terracotta);
    torus(g, 0.35, 0.035, [0, 0.54, 0], m.terracotta);
    cylinder(g, 0.31, 0.31, 0.025, [0, 0.54, 0], m.soil);
    tube(
      g,
      [
        [0, 0.53, 0],
        [-0.04, 1, 0],
        [0.06, 1.52, 0.03],
        [0.02, 2.17, 0],
      ],
      0.043,
      m.woodDark,
    );
    for (let i = 0; i < 11; i++) {
      const a = i * 2.399,
        y = 1.05 + i * 0.09,
        x = Math.sin(a) * (0.4 + i * 0.017),
        z = Math.cos(a) * (0.4 + i * 0.017);
      tube(
        g,
        [
          [0, y - 0.15, 0],
          [x * 0.55, y + 0.1, z * 0.55],
          [x, y + 0.27, z],
        ],
        0.014,
        m.wood,
      );
      for (let j = 0; j < 6; j++) {
        const f = 0.4 + j * 0.11;
        for (const side of [-1, 1]) {
          const leaf = sphere(
            g,
            [0.035, 0.125, 0.014],
            [
              x * f + Math.cos(a) * side * 0.06,
              y + 0.05 + j * 0.045,
              z * f - Math.sin(a) * side * 0.06,
            ],
            j % 2 ? m.leaf : m.leafLight,
          );
          leaf.rotation.set(0.5, a, side * 0.65);
        }
      }
      if (i % 3 === 0)
        sphere(
          g,
          [0.023, 0.034, 0.023],
          [x * 0.65, y + 0.07, z * 0.65],
          m.leaf,
        );
    }
    touch(g, "橄榄树", "海风过叶 · 橄榄绿轻轻摇晃");
    return g;
  }
  function scroll(parent, pos, angle = 0) {
    const g = group(parent, pos);
    g.rotation.y = angle;
    box(g, [0.64, 0.012, 0.42], [0, 0.025, 0], m.paper);
    for (const x of [-0.34, 0.34]) {
      const roll = cylinder(g, 0.05, 0.05, 0.46, [x, 0.06, 0], m.paper, 20);
      roll.rotation.x = Math.PI / 2;
      for (const z of [-0.24, 0.24])
        sphere(g, [0.018, 0.018, 0.022], [x, 0.06, z], m.woodLight);
    }
    touch(g, "无字羊皮卷", "展开卷轴 · 让想象自由停留");
    return g;
  }
  function lantern(parent, pos, key) {
    const g = group(parent, pos),
      glow = m.glow.clone();
    box(g, [0.34, 0.055, 0.34], [0, 0.04, 0], m.bronze, 0.009);
    cylinder(g, 0.09, 0.09, 0.3, [0, 0.22, 0], m.paper);
    sphere(g, [0.026, 0.056, 0.026], [0, 0.4, 0], glow);
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#e9cc91",
      transparent: true,
      opacity: 0.19,
      roughness: 0.15,
      depthWrite: false,
    });
    box(g, [0.28, 0.42, 0.28], [0, 0.27, 0], glass, 0.005).castShadow = false;
    for (const x of [-0.155, 0.155])
      for (const z of [-0.155, 0.155])
        box(g, [0.018, 0.49, 0.018], [x, 0.285, z], m.bronze);
    cylinder(g, 0.04, 0.24, 0.12, [0, 0.575, 0], m.bronze, 4).rotation.y =
      Math.PI / 4;
    torus(g, 0.065, 0.012, [0, 0.7, 0], m.bronze, [0, 0, 0]);
    register(g, "青铜灯笼", "点亮 / 熄灭", () => {
      store.set(key, !store.state[key]);
      return store.state[key] ? "灯笼亮起 · 暖光映石" : "灯笼熄灭";
    });
    return glow;
  }
  function pedestal(pos, height = 1) {
    const g = group(root, pos);
    box(g, [0.69, 0.13, 0.69], [0, 0.085, 0], m.marble, 0.018);
    box(g, [0.48, height - 0.24, 0.48], [0, height / 2, 0], m.marble, 0.012);
    box(g, [0.75, 0.11, 0.75], [0, height, 0], m.marble, 0.018);
    for (const x of [-0.17, -0.085, 0, 0.085, 0.17])
      box(
        g,
        [0.021, height - 0.38, 0.025],
        [x, height / 2, 0.246],
        m.trim,
        0.005,
      );
    return g;
  }
  // Idealized marble sculpture, with carved rather than painted features.
  const bustStand = pedestal([3.73, 0, 0.8], 1.05);
  const bust = group(bustStand, [0, 1.12, 0]);
  cylinder(bust, 0.2, 0.26, 0.1, [0, 0.06, 0], m.marble);
  sphere(bust, [0.36, 0.24, 0.18], [0, 0.27, 0], m.marble);
  cylinder(bust, 0.105, 0.15, 0.25, [0, 0.48, 0], m.marble);
  sphere(bust, [0.195, 0.28, 0.178], [0, 0.76, 0], m.marble);
  sphere(bust, [0.125, 0.11, 0.13], [0, 0.59, 0.055], m.marble);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.13, 4), m.marble);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.754, 0.192);
  bust.add(nose);
  for (const x of [-0.066, 0.066]) {
    sphere(bust, [0.045, 0.018, 0.018], [x, 0.798, 0.157], m.trim);
    tube(
      bust,
      [
        [x - 0.035, 0.83, 0.15],
        [x, 0.846, 0.164],
        [x + 0.035, 0.83, 0.15],
      ],
      0.01,
      m.marble,
    );
  }
  for (const x of [-0.19, 0.19])
    sphere(bust, [0.029, 0.059, 0.03], [x, 0.74, 0], m.marble);
  for (let i = 0; i < 23; i++) {
    const a = i * 2.4,
      y = 0.91 + (i % 3) * 0.028;
    sphere(
      bust,
      [0.059, 0.045, 0.055],
      [Math.sin(a) * 0.16, y, Math.cos(a) * 0.13],
      m.marble,
    );
  }
  touch(bust, "大理石半身像", "石色温润 · 凝住一段古典时光");
  olive(root, [-3.85, 0, 3.6], 0.96);
  olive(root, [4.12, 0, -3.65], 0.82);
  amphora(root, [3.85, 0, 3.35], 1.05);
  amphora(root, [-4.03, 0, -3.81], 0.7);

  // A reclining stone bench faces the central room rather than following the reference seating.
  const bench = group(root, [-3.67, 0, -0.15]);
  bench.rotation.y = Math.PI / 2;
  for (const x of [-1.03, 1.03])
    box(bench, [0.3, 0.46, 0.76], [x, 0.25, 0], m.marble, 0.025);
  box(bench, [2.65, 0.16, 0.92], [0, 0.57, 0], m.marble, 0.045);
  box(bench, [2.45, 0.2, 0.83], [0, 0.75, 0], m.linen, 0.11);
  for (const x of [-1.2, 1.2]) {
    const arm = cylinder(bench, 0.11, 0.11, 0.84, [x, 0.94, 0], m.marble);
    arm.rotation.x = Math.PI / 2;
  }
  for (const x of [-0.75, 0.68]) {
    const cushion = box(
      bench,
      [0.58, 0.45, 0.18],
      [x, 1.01, -0.19],
      m.cushion,
      0.09,
    );
    cushion.rotation.z = x * 0.14;
  }
  touch(bench, "海景石榻", "靠坐片刻 · 望向海的尽头");

  // Scroll cabinet and writing instruments use unmarked surfaces.
  const shelf = group(root, [-2.8, 0, -4.53]);
  box(shelf, [1.95, 2.89, 0.06], [0, 1.55, -0.32], m.wood);
  for (const x of [-1, 1])
    box(shelf, [0.12, 3, 0.72], [x, 1.56, 0], m.woodDark, 0.015);
  for (const y of [0.17, 0.81, 1.49, 2.17, 2.92, 3.1])
    box(shelf, [2.16, 0.09, 0.78], [0, y, 0], m.wood, 0.018);
  for (let row = 0; row < 3; row++) {
    const rack = group(shelf, [0, 0.24 + row * 0.68, 0]);
    for (let i = 0; i < 7; i++) {
      const rolled = cylinder(
        rack,
        0.067,
        0.067,
        0.42,
        [-0.75 + i * 0.24, 0.08, 0.05],
        m.paper,
        16,
      );
      rolled.rotation.x = Math.PI / 2;
      torus(
        rack,
        0.069,
        0.007,
        [-0.75 + i * 0.24, 0.08, 0.04],
        m.bronze,
        [0, 0, 0],
      );
      if (i % 2 === 0) {
        const b = box(
          rack,
          [0.14, 0.43, 0.29],
          [-0.75 + i * 0.24, 0.34, -0.04],
          m.woodLight,
          0.006,
        );
        box(b, [0.11, 0.38, 0.008], [0, 0, 0.151], m.paper);
      }
    }
    touch(rack, "古典卷轴书架", "取下一卷 · 阅读海边的闲暇");
  }
  amphora(shelf, [-0.5, 2.22, 0], 0.55);
  amphora(shelf, [0.45, 2.22, 0], 0.42);
  const bedShade = lantern(root, [-1.55, 1.04, -3.9], "bedLamp");
  pedestal([-1.55, 0, -3.9], 0.99);
  const floorShade = lantern(root, [2.98, 0.05, 3.64], "floorLamp");

  // Laurel branches and a ceramic vessel occupy the blue arched niche.
  amphora(root, [1.3, 1.39, -4.82], 0.81);
  function laurel(pos, angle) {
    const g = group(root, pos);
    g.rotation.z = angle;
    tube(
      g,
      [
        [0, 0, 0],
        [0.12, 0.45, 0],
        [0.08, 0.96, 0],
      ],
      0.014,
      m.woodLight,
    );
    for (let i = 0; i < 7; i++)
      for (const side of [-1, 1]) {
        const leaf = sphere(
          g,
          [0.048, 0.14, 0.018],
          [0.1 + side * 0.074, 0.16 + i * 0.11, 0],
          m.leaf,
        );
        leaf.rotation.z = side * -0.65;
      }
    touch(g, "月桂枝饰", "月桂常青 · 愿心境安宁");
    return g;
  }
  laurel([-0.35, 2.08, -4.84], -0.21);
  laurel([2.95, 2.08, -4.84], 0.21);

  // Turntable nested in a pale timber sideboard below the niche.
  const cabinet = group(root, [0.76, 0, -3.98]);
  for (const x of [-1.23, 1.23])
    for (const z of [-0.3, 0.3])
      box(cabinet, [0.1, 0.22, 0.1], [x, 0.13, z], m.woodDark);
  box(cabinet, [2.85, 0.79, 0.83], [0, 0.63, 0], m.wood, 0.02);
  box(cabinet, [2.97, 0.095, 0.95], [0, 1.075, 0], m.woodLight, 0.02);
  const doorPivot = group(cabinet, [-1.3, 0.65, 0.431]);
  box(doorPivot, [1.25, 0.66, 0.038], [0.625, 0, 0], m.woodDark, 0.008);
  for (const side of [-1, 1]) {
    const parent = side < 0 ? doorPivot : cabinet;
    for (let i = 0; i < 10; i++)
      box(
        parent,
        [0.032, 0.59, 0.018],
        side < 0 ? [0.07 + i * 0.12, 0, 0.027] : [0.11 + i * 0.12, 0.65, 0.46],
        m.woodLight,
      );
  }
  sphere(doorPivot, [0.021, 0.021, 0.029], [1.14, 0, 0.044], m.bronze);
  let doorOpen = false;
  register(doorPivot, "木柜格栅门", "打开 / 合上", () => {
    doorOpen = !doorOpen;
    return doorOpen ? "柜门轻启" : "柜门合拢";
  });
  const player = group(cabinet, [0, 1.2, 0.02]);
  box(player, [1.13, 0.1, 0.65], [0, 0, 0], m.woodDark, 0.018);
  box(player, [1.04, 0.018, 0.56], [0, 0.061, 0], m.metal, 0.007);
  const record = group(player, [-0.14, 0.087, 0]);
  cylinder(record, 0.252, 0.252, 0.016, [0, 0, 0], m.black, 48);
  cylinder(record, 0.061, 0.061, 0.02, [0, 0.006, 0], m.terracotta);
  box(record, [0.015, 0.002, 0.032], [0.021, 0.018, 0], m.bronze);
  for (const r of [0.13, 0.18, 0.23])
    torus(record, r, 0.002, [0, 0.011, 0], m.metal);
  const arm = group(player, [0.4, 0.1, -0.19]);
  tube(
    arm,
    [
      [0, 0, 0],
      [-0.01, 0, 0.23],
      [-0.17, -0.006, 0.32],
    ],
    0.011,
    m.bronze,
  );
  box(arm, [0.054, 0.03, 0.04], [-0.17, -0.006, 0.32], m.black, 0.004);
  let playing = true;
  register(player, "海岸黑胶唱机", "播放 / 暂停", () => {
    playing = !playing;
    return playing ? "唱片缓缓转动 · 与潮汐同频" : "唱片暂停 · 留一段空白";
  });
  for (const x of [-1.05, 1.05]) {
    const sp = box(cabinet, [0.39, 0.52, 0.38], [x, 1.39, 0], m.woodDark, 0.02);
    for (const [y, r] of [
      [-0.095, 0.098],
      [0.14, 0.048],
    ]) {
      torus(sp, r, 0.013, [0, y, 0.204], m.bronze, [0, 0, 0]);
      sphere(sp, [r * 0.8, r * 0.8, 0.014], [0, y, 0.203], m.black);
    }
    touch(sp, "木柜小音箱", "音乐角待机 · 宁静陪伴");
  }

  // Foreground study island: marble writing table with restrained bronze supports.
  const desk = group(root, [0.42, 0, 1.97]);
  box(desk, [2.58, 0.13, 1.34], [0, 0.66, 0], m.marble, 0.034);
  for (const x of [-1.04, 1.04]) {
    box(desk, [0.2, 0.6, 1], [x, 0.32, 0], m.wood, 0.022);
    box(desk, [0.27, 0.035, 1.07], [x, 0.07, 0], m.bronze, 0.009);
  }
  scroll(desk, [-0.52, 0.741, 0.12], -0.14);
  scroll(desk, [0.58, 0.741, -0.23], 0.2);
  const bowl = cylinder(desk, 0.16, 0.07, 0.1, [0.55, 0.81, 0.38], m.bronze);
  touch(bowl, "青铜浅碗", "一器微光 · 留住夕阳");
  const twig = laurel([0.72, 0.76, 1.75], -0.3);
  twig.scale.setScalar(0.4);
  cylinder(desk, 0.074, 0.1, 0.2, [0.3, 0.84, -0.22], m.ceramic);
  const stylus = cylinder(
    desk,
    0.01,
    0.01,
    0.33,
    [-0.2, 0.77, 0.42],
    m.bronze,
    8,
  );
  stylus.rotation.z = Math.PI / 2;
  touch(desk, "大理石书案", "读一卷书 · 度过悠长午后");
  for (const [x, z, angle] of [
    [0.42, 3.24, 0],
    [2.22, 1.99, Math.PI / 2],
  ]) {
    const pad = group(root, [x, 0, z]);
    pad.rotation.y = angle;
    box(pad, [1.06, 0.22, 0.91], [0, 0.18, 0], m.linen, 0.12);
    for (const xx of [-0.35, 0.35])
      box(pad, [0.041, 0.008, 0.79], [xx, 0.298, 0], m.cushion, 0.004);
    touch(pad, "蓝纹亚麻坐垫", "席地而坐 · 慢慢呼吸");
  }
  // A triangular floor harp (not a guqin or a lyre), with individually animated strings.
  const harp = group(root, [-2.12, 0, 2.04]);
  harp.rotation.y = 0.26;
  box(harp, [1.19, 0.12, 0.65], [0, 0.09, 0], m.woodDark, 0.025);
  const soundbox = box(
    harp,
    [0.22, 1.74, 0.28],
    [-0.31, 0.94, 0],
    m.wood,
    0.04,
  );
  soundbox.rotation.z = 0.31;
  tube(
    harp,
    [
      [0.54, 0.17, 0],
      [0.63, 1.37, 0],
      [0.48, 2.07, 0],
    ],
    0.064,
    m.woodLight,
  );
  tube(
    harp,
    [
      [-0.59, 1.77, 0],
      [-0.33, 1.99, 0],
      [0.05, 1.95, 0],
      [0.48, 2.07, 0],
    ],
    0.079,
    m.wood,
  );
  torus(harp, 0.098, 0.022, [0.48, 2.1, 0], m.bronze, [0, 0, 0], Math.PI * 1.7);
  const strings = [];
  for (let i = 0; i < 12; i++) {
    const x = -0.46 + i * 0.076,
      top = 1.91 + 0.08 * Math.cos(i * 0.5);
    const start = new THREE.Vector3(x, top, 0.042),
      end = new THREE.Vector3(-0.53 + i * 0.044, 1.67 - i * 0.125, 0.042);
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const str = cylinder(
      harp,
      0.0025,
      0.0025,
      start.distanceTo(end),
      midpoint.toArray(),
      m.bronze,
      6,
    );
    str.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      start.clone().sub(end).normalize(),
    );
    strings.push(str);
    sphere(harp, [0.016, 0.016, 0.019], [x, top, 0.049], m.bronze);
  }
  let pluck = 0;
  register(harp, "古典竖琴", "轻拨琴弦", () => {
    pluck = 1;
    return "琴弦轻颤 · 余韵如海风";
  });
  return {
    root,
    bedShade,
    floorShade,
    update(dt, t) {
      if (playing) record.rotation.y += dt * 0.65;
      arm.rotation.y = damp(arm.rotation.y, playing ? 0 : -0.5, dt, 3);
      doorPivot.rotation.y = damp(
        doorPivot.rotation.y,
        doorOpen ? -1.05 : 0,
        dt,
        3,
      );
      pluck = damp(pluck, 0, dt, 2);
      strings.forEach(
        (s, i) => (s.position.z = 0.042 + Math.sin(t * 35 + i) * pluck * 0.012),
      );
      for (const p of pulses) {
        p.value = damp(p.value, 0, dt, 3);
        p.obj.position.y = p.y + Math.sin(p.value * Math.PI) * 0.024;
      }
    },
    reset() {
      playing = true;
      doorOpen = false;
      pluck = 0;
      for (const p of pulses) {
        p.value = 0;
        p.obj.position.y = p.y;
      }
    },
  };
}
