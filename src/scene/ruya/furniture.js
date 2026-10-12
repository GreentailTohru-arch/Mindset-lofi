import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import { paperTexture } from "./materials.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "儒风雅韵 · 陈设";
  const pulses = [];
  function interact(obj, name, message) {
    const rest = obj.position.y;
    const entry = { obj, rest, value: 0 };
    pulses.push(entry);
    register(obj, name, "轻点互动", () => {
      entry.value = 1;
      return message;
    });
  }
  function table(pos, w, d, h = 0.72) {
    const g = group(root, pos);
    box(g, [w, 0.12, d], [0, h, 0], m.wood, 0.035);
    box(
      g,
      [w - 0.13, 0.2, 0.075],
      [0, h - 0.16, d / 2 - 0.1],
      m.woodDark,
      0.015,
    );
    box(
      g,
      [w - 0.13, 0.2, 0.075],
      [0, h - 0.16, -d / 2 + 0.1],
      m.woodDark,
      0.015,
    );
    for (const x of [-w / 2 + 0.14, w / 2 - 0.14])
      for (const z of [-d / 2 + 0.12, d / 2 - 0.12]) {
        box(g, [0.095, h, 0.095], [x, h / 2, z], m.woodDark, 0.015);
        box(g, [0.15, 0.06, 0.15], [x, 0.04, z], m.wood, 0.015);
      }
    for (const x of [-w / 2 + 0.14, w / 2 - 0.14])
      box(g, [0.075, 0.065, d - 0.16], [x, 0.22, 0], m.woodDark);
    return g;
  }
  function cushion(pos, angle = 0) {
    const g = group(root, pos);
    g.rotation.y = angle;
    box(g, [1.08, 0.18, 0.94], [0, 0.14, 0], m.rug, 0.13);
    box(g, [0.94, 0.045, 0.8], [0, 0.235, 0], m.curtain, 0.08);
    cylinder(g, 0.035, 0.035, 0.01, [0, 0.261, 0], m.woodLight);
    interact(g, "织物坐垫", "端坐片刻 · 慢慢呼吸");
    return g;
  }
  function bamboo(parent, pos, scale = 1) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    cylinder(g, 0.36, 0.28, 0.46, [0, 0.26, 0], m.ceramic);
    cylinder(g, 0.32, 0.32, 0.025, [0, 0.49, 0], m.soil);
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.095,
        z = Math.sin(i * 2) * 0.15,
        h = 1.3 + (i % 3) * 0.28;
      cylinder(g, 0.019, 0.026, h, [x, 0.5 + h / 2, z], m.leaf);
      for (let j = 0; j < 5; j++) {
        const y = 0.7 + j * 0.25;
        cylinder(g, 0.027, 0.027, 0.025, [x, y, z], m.leafLight, 10);
        const a = i * 2.4 + j;
        const tip = [x + Math.cos(a) * 0.38, y + 0.12, z + Math.sin(a) * 0.38];
        tube(g, [[x, y, z], tip], 0.009, m.leaf);
        for (let k = 0; k < 3; k++) {
          const leaf = sphere(
            g,
            [0.04, 0.21, 0.018],
            [tip[0] + (k - 1) * 0.055, tip[1] + k * 0.06, tip[2]],
            m.leafLight,
          );
          leaf.rotation.set(0.4, a, (k - 1) * 0.55);
        }
      }
    }
    interact(g, "竹盆景", "虚心有节 · 清风自来");
    return g;
  }
  function orchid(parent, pos) {
    const g = group(parent, pos);
    cylinder(g, 0.19, 0.12, 0.33, [0, 0.18, 0], m.ceramic);
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4;
      tube(
        g,
        [
          [0, 0.33, 0],
          [Math.cos(a) * 0.17, 0.77, Math.sin(a) * 0.17],
          [Math.cos(a) * 0.34, 0.55, Math.sin(a) * 0.34],
        ],
        0.016,
        m.leaf,
      );
    }
    tube(
      g,
      [
        [0, 0.3, 0],
        [0.03, 0.8, 0],
        [0.12, 0.94, 0],
      ],
      0.009,
      m.leaf,
    );
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      const petal = sphere(
        g,
        [0.035, 0.095, 0.025],
        [0.12 + Math.sin(a) * 0.065, 0.94 + Math.cos(a) * 0.065, 0],
        m.cream,
      );
      petal.rotation.z = -a;
    }
    sphere(g, [0.026, 0.03, 0.03], [0.12, 0.94, 0.024], m.gold);
    interact(g, "兰花", "幽兰生庭 · 淡淡清香");
  }
  function lantern(pos, height, key) {
    const g = group(root, pos),
      shade = m.lantern.clone();
    cylinder(g, 0.32, 0.36, 0.12, [0, 0.08, 0], m.woodDark);
    box(g, [0.09, height, 0.09], [0, height / 2, 0], m.woodDark, 0.012);
    const y = height + 0.38;
    box(g, [0.57, 0.83, 0.57], [0, y, 0], shade, 0.06);
    for (const sy of [-0.45, 0.45])
      box(g, [0.69, 0.07, 0.69], [0, y + sy, 0], m.woodDark, 0.025);
    for (const x of [-0.29, 0.29])
      for (const z of [-0.29, 0.29])
        box(g, [0.026, 0.88, 0.026], [x, y, z], m.woodDark);
    for (const dy of [-0.22, 0, 0.22])
      box(g, [0.59, 0.014, 0.59], [0, y + dy, 0], m.woodLight);
    register(g, "暖纸灯笼", "点亮 / 熄灭", () => {
      store.set(key, !store.state[key]);
      return store.state[key] ? "一灯如豆 · 暖意渐生" : "灯笼熄灭 · 听风赏月";
    });
    return shade;
  }
  const bedShade = lantern([-3.95, 0, 2.45], 1.18, "bedLamp");
  const floorShade = lantern([3.95, 0, -3.9], 1.45, "floorLamp");

  // Writing corner: low Ming-inspired desk, paper, brush rest and inkstone.
  box(root, [3.5, 0.035, 3.1], [-2.25, 0.04, -0.5], m.tatami, 0.02);
  const desk = table([-2.3, 0, -1.1], 2.9, 1.35, 0.88);
  const writing = new THREE.MeshStandardMaterial({
    map: paperTexture("writing"),
    roughness: 0.97,
  });
  const paper = box(desk, [1.28, 0.014, 0.9], [-0.2, 0.954, 0.06], m.paper);
  // Put the printed image on the horizontal face without stretching its aspect.
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.9), writing);
  sheet.rotation.x = -Math.PI / 2;
  sheet.position.set(0, 0.01, 0);
  paper.add(sheet);
  let written = true;
  register(paper, "宣纸习字", "收笔 / 展卷", () => {
    written = !written;
    writing.color.set(written ? "#ffffff" : "#e2dccb");
    sheet.visible = written;
    return written ? "清风入弦 · 明月在心" : "留白，亦是一种心境";
  });
  box(desk, [0.47, 0.04, 0.09], [-0.25, 0.99, -0.33], m.woodDark, 0.015);
  const inkstone = box(
    desk,
    [0.37, 0.075, 0.27],
    [0.88, 0.99, 0.22],
    m.ink,
    0.045,
  );
  box(inkstone, [0.25, 0.009, 0.17], [0, 0.04, 0], m.black, 0.035);
  interact(inkstone, "砚台", "研墨静心 · 墨色渐浓");
  const brush = group(desk, [0.6, 1, 0.03]);
  brush.rotation.set(0, -0.3, Math.PI / 2);
  cylinder(brush, 0.018, 0.023, 0.52, [0, 0, 0], m.woodLight, 12);
  sphere(brush, [0.027, 0.09, 0.027], [0, -0.31, 0], m.ink);
  interact(brush, "毛笔", "提笔 · 落墨生香");
  cylinder(desk, 0.1, 0.085, 0.24, [1.06, 1.07, -0.35], m.wood);
  for (let i = 0; i < 4; i++) {
    const p = cylinder(
      desk,
      0.01,
      0.014,
      0.36,
      [1.02 + i * 0.028, 1.27, -0.35],
      m.woodLight,
      8,
    );
    p.rotation.z = (i - 2) * 0.1;
  }
  orchid(desk, [-1.08, 0.95, -0.27]);
  cushion([-2.25, 0, 0.52]);

  // A seven-string guqin with a shaped lacquer body and thirteen golden hui.
  const qinTable = table([-0.4, 0, 2.48], 3.25, 0.87, 0.69);
  const qin = group(qinTable, [0, 0.78, 0]);
  const outline = new THREE.Shape();
  outline.moveTo(-1.43, -0.22);
  outline.bezierCurveTo(-1.55, -0.18, -1.55, 0.2, -1.43, 0.23);
  outline.lineTo(-0.9, 0.23);
  outline.quadraticCurveTo(-0.7, 0.11, -0.5, 0.22);
  outline.lineTo(1.36, 0.16);
  outline.quadraticCurveTo(1.51, 0, 1.36, -0.16);
  outline.lineTo(-0.5, -0.22);
  outline.quadraticCurveTo(-0.7, -0.11, -0.9, -0.22);
  outline.closePath();
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(outline, {
      depth: 0.09,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      bevelSegments: 3,
      steps: 1,
    }),
    m.woodDark,
  );
  body.rotation.x = -Math.PI / 2;
  qin.add(body);
  for (const x of [-1.29, 1.24])
    box(qin, [0.045, 0.035, 0.36], [x, 0.115, 0], m.woodLight, 0.008);
  const strings = [];
  for (let i = 0; i < 7; i++)
    strings.push(
      box(
        qin,
        [2.56, 0.005, 0.005],
        [-0.025, 0.143, -0.13 + i * 0.043],
        m.gold,
      ),
    );
  for (let i = 0; i < 13; i++)
    sphere(qin, [0.018, 0.005, 0.018], [-1.12 + i * 0.18, 0.12, 0.19], m.cream);
  let pluck = 0;
  register(qin, "七弦古琴", "轻拨琴弦", () => {
    pluck = 1;
    return "一弦清韵 · 心随余音慢下来";
  });
  cushion([-0.4, 0, 3.66]);

  // Ancient book cabinet: grid joinery and thread-bound volumes.
  const shelf = group(root, [1.3, 0, -4.56]);
  for (const x of [-1.3, 1.3])
    box(shelf, [0.12, 2.9, 0.68], [x, 1.48, 0], m.woodDark, 0.015);
  box(shelf, [2.68, 2.86, 0.055], [0, 1.48, -0.31], m.wood);
  for (const y of [0.22, 0.92, 1.65, 2.38, 2.95])
    box(shelf, [2.77, 0.09, 0.74], [0, y, 0], m.woodDark, 0.015);
  for (const [x, y] of [
    [-0.35, 0.56],
    [0.5, 1.28],
    [-0.35, 2.02],
    [0.65, 2.66],
  ])
    box(shelf, [0.065, 0.65, 0.67], [x, y, 0], m.woodDark);
  const bookColors = ["#475d60", "#a49b7c", "#47554b", "#806251", "#656783"];
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < 7; i++) {
      const g = group(shelf, [-1.06 + i * 0.28, 0.28 + row * 0.73, 0]);
      const bm = new THREE.MeshStandardMaterial({
        color: bookColors[(row + i) % 5],
        roughness: 0.9,
      });
      const h = 0.42 + (i % 3) * 0.055;
      box(g, [0.2, h, 0.4], [0, h / 2, 0], bm, 0.007);
      box(g, [0.16, h - 0.04, 0.012], [0, h / 2, 0.205], m.paper);
      box(g, [0.052, h * 0.62, 0.014], [-0.06, h / 2, 0.215], bm);
      for (let j = 0; j < 4; j++)
        box(
          g,
          [0.07, 0.006, 0.006],
          [-0.052, 0.06 + j * 0.095, 0.224],
          m.cream,
        );
      interact(g, "线装古籍", "翻一页旧书 · 字里有山川");
    }
  for (let i = 0; i < 4; i++)
    box(
      shelf,
      [0.62, 0.07, 0.42],
      [-0.6, 2.48 + i * 0.073, 0],
      i % 2 ? m.paper : m.woodLight,
      0.006,
    );
  const vase = cylinder(shelf, 0.09, 0.17, 0.43, [0.82, 2.64, 0], m.ceramic);
  interact(vase, "青瓷小瓶", "青瓷温润 · 一器一景");
  bamboo(root, [-4.2, 0, -4.13], 0.94);
  bamboo(root, [4.24, 0, 3.7], 0.82);

  // Tea mat and celadon teaware.
  box(root, [2.85, 0.033, 2.7], [2.22, 0.035, -0.25], m.rug, 0.035);
  const tea = table([2.22, 0, -0.72], 1.85, 1.02, 0.5);
  box(tea, [1.36, 0.04, 0.69], [0, 0.585, 0], m.woodLight, 0.025);
  for (let i = 0; i < 12; i++)
    box(tea, [0.008, 0.012, 0.58], [-0.59 + i * 0.106, 0.611, 0], m.woodDark);
  const pot = group(tea, [-0.25, 0.64, 0]);
  sphere(pot, [0.2, 0.15, 0.18], [0, 0.13, 0], m.ceramic);
  cylinder(pot, 0.115, 0.13, 0.04, [0, 0.273, 0], m.ceramic);
  sphere(pot, [0.035, 0.032, 0.035], [0, 0.314, 0], m.gold);
  tube(
    pot,
    [
      [0.12, 0.12, 0],
      [0.25, 0.17, 0],
      [0.3, 0.25, 0],
    ],
    0.045,
    m.ceramic,
  );
  torus(pot, 0.12, 0.026, [-0.18, 0.15, 0], m.ceramic, [
    Math.PI / 2,
    Math.PI / 2,
    0,
  ]);
  interact(pot, "青瓷茶壶", "温一壶茶 · 人间有清欢");
  for (const [x, z] of [
    [0.38, 0.19],
    [0.39, -0.2],
    [-0.55, 0.22],
  ]) {
    cylinder(tea, 0.095, 0.095, 0.017, [x, 0.642, z], m.ceramic);
    cylinder(tea, 0.06, 0.039, 0.072, [x, 0.687, z], m.ceramic);
    cylinder(tea, 0.049, 0.049, 0.005, [x, 0.725, z], m.woodDark);
  }
  const steam = group(pot);
  const steamMat = new THREE.MeshBasicMaterial({
    color: "#d8ddd4",
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
  });
  for (let i = 0; i < 3; i++)
    tube(
      steam,
      [
        [i * 0.04 - 0.04, 0.35, 0],
        [0.04, 0.53, 0.01],
        [-0.03, 0.74, 0.025],
      ],
      0.009,
      steamMat,
    );
  cushion([2.25, 0, 0.62]);
  cushion([3.68, 0, -0.55], -Math.PI / 2);

  // Record player tucked into a traditional timber console.
  const music = table([4.04, 0, 1.42], 2.35, 0.73, 0.91);
  music.rotation.y = -Math.PI / 2;
  box(music, [2.16, 0.49, 0.58], [0, 0.57, 0], m.wood, 0.025);
  for (const x of [-0.56, 0.56]) {
    box(music, [1.01, 0.42, 0.035], [x, 0.58, 0.314], m.woodDark, 0.009);
    for (let i = 0; i < 8; i++)
      box(
        music,
        [0.028, 0.33, 0.02],
        [x - 0.4 + i * 0.114, 0.58, 0.34],
        m.woodLight,
      );
    cylinder(music, 0.024, 0.024, 0.04, [x, 0.59, 0.365], m.gold).rotation.x =
      Math.PI / 2;
  }
  const record = group(music, [-0.17, 1.03, 0]);
  box(record, [0.98, 0.12, 0.62], [0, 0, 0], m.woodLight, 0.025);
  const platter = group(record, [-0.16, 0.087, 0]);
  cylinder(platter, 0.255, 0.255, 0.022, [0, 0, 0], m.ink, 48);
  for (const r of [0.12, 0.16, 0.2, 0.24])
    torus(platter, r, 0.002, [0, 0.013, 0], m.black);
  cylinder(platter, 0.073, 0.073, 0.025, [0, 0.005, 0], m.gold);
  box(platter, [0.014, 0.006, 0.037], [0.025, 0.022, 0], m.ink);
  const arm = group(record, [0.32, 0.12, -0.2]);
  tube(
    arm,
    [
      [0, 0, 0],
      [-0.05, 0, 0.23],
      [-0.22, -0.012, 0.34],
    ],
    0.012,
    m.gold,
  );
  box(arm, [0.065, 0.035, 0.04], [-0.22, -0.012, 0.34], m.ink, 0.006);
  let playing = true;
  register(record, "黑胶唱机", "播放 / 暂停唱片", () => {
    playing = !playing;
    return playing ? "唱片缓缓转动 · 静享音乐角" : "唱片暂停 · 听见此刻的安静";
  });
  for (const x of [-0.95, 0.92]) {
    const speaker = box(
      music,
      [0.29, 0.41, 0.34],
      [x, 1.16, 0],
      m.woodDark,
      0.025,
    );
    for (const [y, r] of [
      [-0.07, 0.085],
      [0.105, 0.036],
    ]) {
      torus(speaker, r, 0.013, [0, y, 0.182], m.gold, [0, 0, 0]);
      sphere(speaker, [r * 0.8, r * 0.8, 0.013], [0, y, 0.179], m.ink);
    }
    interact(speaker, "木质小音箱", "小音箱待机 · 音乐角的温柔陪伴");
  }
  orchid(root, [3.91, 0.03, -2.35]);
  return {
    root,
    bedShade,
    floorShade,
    update(dt, t) {
      pluck = damp(pluck, 0, dt, 2);
      strings.forEach(
        (s, i) => (s.position.y = 0.143 + Math.sin(t * 38 + i) * pluck * 0.013),
      );
      if (playing) platter.rotation.y += dt * 0.68;
      arm.rotation.y = damp(arm.rotation.y, playing ? 0 : -0.6, dt, 3);
      steam.position.y = Math.sin(t * 0.7) * 0.035;
      steam.rotation.y = Math.sin(t * 0.4) * 0.13;
      for (const p of pulses) {
        p.value = damp(p.value, 0, dt, 3);
        p.obj.position.y = p.rest + Math.sin(p.value * Math.PI) * 0.035;
      }
    },
    reset() {
      playing = true;
      pluck = 0;
      written = true;
      sheet.visible = true;
      writing.color.set("#ffffff");
      for (const p of pulses) {
        p.value = 0;
        p.obj.position.y = p.rest;
      }
    },
  };
}
