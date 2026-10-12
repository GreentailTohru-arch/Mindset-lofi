import * as THREE from "three";
import {
  box,
  sphere,
  cylinder,
  torus,
  group,
  tube,
  plant,
} from "./primitives.js";
import { canvasScreen } from "./materials.js";
import { damp } from "../state.js";

export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  const glow = (c, p = 1) =>
    new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: p,
      roughness: 0.5,
    });
  const bed = group(root, [-3.05, 0, 0.42]);
  // Bed headboard faces the left wall; all child details rotate together.
  bed.rotation.y = Math.PI / 2;
  box(bed, [2.55, 0.34, 3.48], [0, 0.27, 0], m.woodDark, 0.06);
  for (const x of [-1.1, 1.1])
    for (const z of [-1.5, 1.5])
      box(bed, [0.13, 0.2, 0.13], [x, 0.1, z], m.woodDark);
  box(bed, [2.62, 1.14, 0.17], [0, 0.68, -1.76], m.blanket, 0.07);
  box(bed, [2.48, 0.27, 3.35], [0, 0.57, 0], m.pillow, 0.12);
  box(bed, [2.49, 0.25, 2.62], [0, 0.76, 0.39], m.duvet, 0.13);
  // Duvet seams and a knitted throw create a softened, layered silhouette.
  for (const x of [-1.19, 1.19])
    tube(
      bed,
      [
        [x, 0.78, -0.8],
        [x, 0.84, 0.4],
        [x, 0.69, 1.67],
      ],
      0.014,
      m.pillow,
    );
  box(bed, [2.5, 0.065, 0.79], [0, 0.913, 1.05], m.blanket, 0.025);
  for (let i = 0; i < 28; i++)
    tube(
      bed,
      [
        [-1.18 + i * 0.087, 0.937, 0.69],
        [-1.18 + i * 0.087, 0.954, 1],
        [-1.18 + i * 0.087, 0.933, 1.43],
      ],
      0.008,
      m.duvet,
    );
  for (let i = 0; i < 2; i++) {
    const pillow = box(
      bed,
      [1, 0.22, 0.69],
      [-0.57 + i * 1.14, 0.86, -1.08],
      m.pillow,
      0.105,
    );
    pillow.rotation.set(0.1, 0, i ? -0.04 : 0.03);
  }
  register(bed, "柔软的床", "在这里，什么都可以慢一点", () => {
    bedPulse = 1;
    return "被窝暖暖的 · 休息一下吧";
  });
  let bedPulse = 0;

  // Sit flush with the left wall and leave a clear gap beyond the bed's foot-side edge.
  const nightstand = group(root, [-4.58, 0, 2.14]);
  // Its drawer front points to the room's right, alongside the reoriented bed.
  nightstand.rotation.y = Math.PI / 2;
  box(nightstand, [0.7, 0.62, 0.67], [0, 0.43, 0], m.woodDark, 0.02);
  box(nightstand, [0.76, 0.06, 0.73], [0, 0.77, 0], m.wood, 0.015);
  for (const x of [-0.27, 0.27])
    for (const z of [-0.26, 0.26])
      box(nightstand, [0.05, 0.18, 0.05], [x, 0.09, z], m.metal);
  const drawer = group(nightstand, [0, 0.45, 0.025]);
  box(drawer, [0.6, 0.25, 0.6], [0, 0, 0], m.wood);
  box(drawer, [0.65, 0.28, 0.055], [0, 0, 0.323], m.wood, 0.015);
  box(drawer, [0.16, 0.025, 0.035], [0, 0, 0.365], m.metal, 0.01);
  register(drawer, "床头柜抽屉", "打开藏着小秘密的抽屉", () => {
    store.set("drawer", !store.state.drawer);
    return store.state.drawer ? "抽屉打开了 · 一本睡前读物" : "抽屉已合上";
  });
  box(drawer, [0.35, 0.03, 0.4], [0, 0.14, 0.03], m.pillow);
  box(drawer, [0.34, 0.015, 0.39], [0, 0.164, 0.03], m.blanket);
  const bedside = group(nightstand, [0, 0.8, 0]);
  cylinder(bedside, 0.14, 0.17, 0.07, [0, 0.03, 0], m.metal);
  cylinder(bedside, 0.025, 0.025, 0.29, [0, 0.2, 0], m.woodLight);
  const bedShade = glow("#ffcf8d", 0.7);
  cylinder(bedside, 0.16, 0.22, 0.26, [0, 0.43, 0], bedShade);
  register(bedside, "床头灯", "一盏留给自己的暖灯", () => {
    store.set("bedLamp", !store.state.bedLamp);
    return store.state.bedLamp ? "床头灯亮了" : "床头灯已关";
  });
  const lamp = group(root, [-4.55, 0, 3.0]);
  box(lamp, [0.36, 0.06, 0.36], [0, 0.05, 0], m.metal, 0.02);
  const floorShade = glow("#f9c987", 0.6);
  box(lamp, [0.29, 1.44, 0.29], [0, 1.11, 0], floorShade, 0.015);
  for (const x of [-0.17, 0.17])
    for (const z of [-0.17, 0.17])
      box(lamp, [0.026, 1.88, 0.026], [x, 0.98, z], m.metal);
  for (const y of [0.4, 0.85, 1.3, 1.85]) {
    box(lamp, [0.36, 0.024, 0.36], [0, y, 0], m.woodDark);
  }
  register(lamp, "落地灯", "让角落也温暖起来", () => {
    store.set("floorLamp", !store.state.floorLamp);
    return store.state.floorLamp ? "落地灯已打开" : "落地灯已关闭";
  });

  function shelf(pos, width, levels = 4) {
    const s = group(root, pos);
    for (const x of [-width / 2, width / 2])
      for (const z of [-0.28, 0.28])
        box(s, [0.045, 2.62, 0.045], [x, 1.34, z], m.metal);
    for (let y = 0.26; y < 2.91; y += 0.77)
      box(s, [width + 0.06, 0.065, 0.65], [0, y, 0], m.wood);
    return s;
  }
  const shelves = [
    shelf([-3.48, 0, -4.55], 2.65),
    shelf([2.15, 0, -4.55], 1.12),
  ];
  const bookM = ["#928078", "#677b7c", "#a08c67", "#565d80", "#9e6f69"].map(
    (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.85 }),
  );
  const books = [];
  shelves.forEach((s, si) => {
    for (let row = 0; row < 3; row++) {
      const stack = group(s, [-(si ? 0.35 : 1.06), 0.3 + row * 0.77, 0]);
      for (let b = 0; b < (si ? 3 : 5); b++) {
        const bk = box(
          stack,
          [0.115, 0.33 + (b % 3) * 0.06, 0.33],
          [b * 0.15, 0.2, 0],
          bookM[(row + b) % 5],
          0.009,
        );
        box(bk, [0.085, 0.015, 0.006], [0, 0.11, 0.169], m.cream);
        books.push(bk);
      }
      register(stack, "书架上的书", "翻开一本书，离开屏幕一会儿", () => {
        stack.userData.pulse = 1;
        return [
          "翻开《月亮与六便士》",
          "今日书签 · 把时间留给喜欢的事",
          "翻开《山间四季》",
        ][row];
      });
      if (!si) {
        const storage = box(
          s,
          [0.58, 0.36, 0.44],
          [0.63, 0.52 + row * 0.77, 0],
          row === 1 ? m.blanket : m.woodDark,
          0.015,
        );
        box(storage, [0.18, 0.065, 0.01], [0, 0.03, 0.225], m.pillow, 0.007);
        register(storage, "收纳盒", "整理好今天的小杂物", () => {
          storage.userData.pulse = 1;
          return "小物件都收好了";
        });
      }
    }
  });
  plant(shelves[0], [0.78, 2.61, 0], 0.48, m);
  plant(shelves[1], [0, 2.61, 0], 0.45, m);

  // The desk sits just inside the back wall, with its return wing facing the room.
  const desk = group(root, [-0.35, 0, -4.24]);
  box(desk, [3.65, 0.13, 1.18], [0, 1.16, 0], m.wood, 0.035);
  for (const x of [-1.63, 1.63])
    for (const z of [-0.46, 0.46])
      box(desk, [0.075, 1.12, 0.075], [x, 0.56, z], m.metal);
  box(desk, [3.3, 0.055, 0.05], [0, 0.18, -0.45], m.metal);
  // Return wing on the right, as in the reference.
  box(desk, [1.17, 0.13, 1.77], [1.24, 1.16, 1.05], m.wood, 0.03);
  for (const x of [0.76, 1.73])
    box(desk, [0.065, 1.13, 0.065], [x, 0.56, 1.85], m.metal);
  box(desk, [1.15, 0.025, 0.6], [-0.3, 1.24, 0.16], m.black, 0.04);
  const monitor = group(desk, [-0.24, 1.24, -0.34]);
  box(monitor, [0.45, 0.035, 0.25], [0, 0.02, 0.07], m.metal, 0.02);
  box(monitor, [0.05, 0.31, 0.04], [0, 0.17, 0], m.metal);
  box(monitor, [1.64, 0.92, 0.075], [0, 0.72, 0], m.black, 0.035);
  const screenTextures = [0, 1, 2].map(canvasScreen);
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTextures[0],
    toneMapped: false,
    color: "#b9b5bf",
  });
  box(monitor, [1.54, 0.82, 0.01], [0, 0.74, 0.043], screenMat, 0.006);
  box(monitor, [0.05, 0.008, 0.012], [0, 0.285, 0.049], glow("#bdc9dd", 0.8));
  register(monitor, "显示器", "切换一张安静的桌面", () => {
    store.set("screen", (store.state.screen + 1) % 3);
    return [
      "慢夜电台 · SLOW NIGHTS",
      "专注时刻 · DEEP FOCUS",
      "深呼吸 · TAKE A BREATH",
    ][store.state.screen];
  });
  const pc = group(desk, [1.22, 1.25, -0.04]);
  box(pc, [0.43, 0.77, 0.66], [0, 0.385, 0], m.black, 0.025);
  box(pc, [0.015, 0.67, 0.55], [0.224, 0.4, 0], m.glass);
  const fanMat = glow("#8faaff", 1.1);
  const fans = [];
  for (const y of [0.23, 0.57]) {
    torus(pc, 0.12, 0.014, [0, y, 0.339], fanMat, [0, 0, 0]);
    const fan = group(pc, [0, y, 0.341]);
    for (let i = 0; i < 5; i++) {
      const blade = sphere(
        fan,
        [0.027, 0.08, 0.012],
        [Math.sin(i * 1.257) * 0.04, Math.cos(i * 1.257) * 0.04, 0],
        m.metal,
      );
      blade.rotation.z = -i * 1.257;
    }
    fans.push(fan);
  }
  box(pc, [0.26, 0.35, 0.04], [0.08, 0.38, 0.09], m.metal);
  torus(pc, 0.09, 0.009, [0.239, 0.46, 0.01], fanMat, [0, Math.PI / 2, 0]);
  register(pc, "电脑主机", "按下电源键", () => {
    store.set("pc", !store.state.pc);
    return store.state.pc ? "主机已启动 · 风扇轻轻转动" : "主机已休眠";
  });
  const keyboard = group(desk, [-0.36, 1.265, 0.22]);
  box(keyboard, [0.73, 0.035, 0.26], [0, 0, 0], m.metal, 0.016);
  const keys = glow("#7f819e", 0.15);
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 12; col++)
      box(
        keyboard,
        [0.044, 0.015, 0.044],
        [-0.32 + col * 0.058, 0.025, -0.085 + row * 0.057],
        keys,
        0.005,
      );
  register(keyboard, "机械键盘", "轻敲一下，写下今天的心情", () => {
    keyPulse = 1;
    return "嗒、嗒 · 今天也辛苦了";
  });
  let keyPulse = 0;
  const mouse = sphere(
    desk,
    [0.061, 0.034, 0.095],
    [0.22, 1.28, 0.24],
    m.black,
  );
  register(mouse, "鼠标", "点一下，换个心情", () => {
    store.set("screen", (store.state.screen + 1) % 3);
    return "已切换显示器桌面";
  });
  const headphones = group(desk, [-1.35, 1.27, 0.08]);
  torus(
    headphones,
    0.15,
    0.025,
    [0, 0.1, 0],
    m.metal,
    [Math.PI / 2, 0, 0],
    Math.PI,
  );
  for (const x of [-0.15, 0.15])
    box(headphones, [0.085, 0.1, 0.14], [x, 0.1, 0], m.blanket, 0.03);
  register(headphones, "耳机", "戴上耳机，世界安静一点", () => {
    headPulse = 1;
    return "给自己留一段安静的时间";
  });
  let headPulse = 0;
  plant(desk, [-1.48, 1.24, -0.3], 0.34, m);

  // Keep the chair directly in front of the desk after the desk moves to the rear wall.
  const chair = group(root, [-0.35, 0, -2.69]);
  cylinder(chair, 0.05, 0.055, 0.52, [0, 0.3, 0], m.metal);
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    tube(
      chair,
      [
        [0, 0.2, 0],
        [Math.sin(a) * 0.37, 0.12, Math.cos(a) * 0.37],
      ],
      0.03,
      m.metal,
    );
    sphere(
      chair,
      [0.065, 0.065, 0.065],
      [Math.sin(a) * 0.37, 0.075, Math.cos(a) * 0.37],
      m.black,
    );
  }
  box(chair, [0.65, 0.14, 0.64], [0, 0.59, 0], m.black, 0.065);
  box(chair, [0.62, 0.91, 0.15], [0, 1.04, 0.29], m.black, 0.07);
  box(chair, [0.38, 0.2, 0.12], [0, 1.37, 0.2], m.blanket, 0.055);
  for (const x of [-0.37, 0.37]) {
    box(chair, [0.04, 0.3, 0.04], [x, 0.75, 0.05], m.metal);
    box(chair, [0.1, 0.07, 0.4], [x, 0.89, 0], m.black, 0.025);
  }
  register(chair, "电脑椅", "轻轻转一下", () => {
    chairTurn += Math.PI * 0.6;
    return "换个角度，放松一下";
  });
  let chairTurn = 0;

  // Keep the wardrobe's back just inside the rear wall of the square room.
  const wardrobe = group(root, [3.78, 0, -4.41]);
  box(wardrobe, [2.17, 2.92, 0.09], [0, 1.49, -0.44], m.woodDark, 0.015);
  for (const x of [-1.04, 1.04])
    box(wardrobe, [0.09, 2.92, 0.98], [x, 1.49, 0], m.woodDark, 0.015);
  box(wardrobe, [2.17, 0.1, 0.98], [0, 0.085, 0], m.woodDark, 0.015);
  box(wardrobe, [2.24, 0.1, 1.05], [0, 3, 0], m.wood, 0.018);
  // Door cavities, shelf, and hanging clothes are revealed when the doors swing.
  box(wardrobe, [2.0, 2.7, 0.04], [0, 1.52, -0.375], m.black);
  box(wardrobe, [1.94, 0.045, 0.8], [0, 0.71, 0.13], m.woodLight);
  const rod2 = cylinder(wardrobe, 0.018, 0.018, 1.85, [0, 2.42, 0.17], m.metal);
  rod2.rotation.z = Math.PI / 2;
  for (let i = 0; i < 5; i++) {
    box(
      wardrobe,
      [0.2, 0.9, 0.23],
      [-0.67 + i * 0.32, 1.93, 0.22],
      bookM[i],
      0.07,
    );
  }
  const doors = [-1, 1].map((sign) => {
    const pivot = group(wardrobe, [sign * 1.05, 1.5, 0.55]);
    box(pivot, [1.035, 2.85, 0.065], [-sign * 0.515, 0, 0], m.wood, 0.015);
    box(pivot, [0.025, 0.36, 0.045], [-sign * 0.9, -0.15, 0.06], m.metal, 0.01);
    register(pivot, "衣柜门", "打开衣柜", () => {
      store.set("wardrobe", !store.state.wardrobe);
      return store.state.wardrobe ? "衣柜已打开" : "衣柜已合上";
    });
    return pivot;
  });

  // Its rear rests against the left wall while the vents keep facing into the room.
  const ac = group(root, [-4.83, 3.33, 2.65]);
  ac.rotation.y = Math.PI / 2;
  box(ac, [1.73, 0.45, 0.27], [0, 0, 0.07], m.cream, 0.065);
  box(ac, [1.48, 0.105, 0.1], [0, -0.147, 0.204], m.black, 0.017);
  const flap = box(ac, [1.48, 0.065, 0.1], [0, -0.145, 0.26], m.cream, 0.015);
  const acLED = glow("#85c5b0", 1);
  box(ac, [0.09, 0.028, 0.01], [0.58, 0.01, 0.213], acLED, 0.006);
  const air = group(ac);
  for (let i = 0; i < 3; i++)
    tube(
      air,
      [
        [-0.4 + i * 0.4, -0.25, 0.3],
        [-0.38 + i * 0.4, -0.48, 0.38],
        [-0.45 + i * 0.4, -0.68, 0.48],
      ],
      0.006,
      new THREE.MeshBasicMaterial({
        color: "#9dd5d4",
        transparent: true,
        opacity: 0.24,
      }),
    );
  air.visible = false;
  register(ac, "空调", "让房间保持舒服的温度", () => {
    store.set("ac", !store.state.ac);
    return store.state.ac ? "空调运行中 · 26°C · 静音模式" : "空调已关闭";
  });

  const tea = group(root, [2.63, 0, 2.46]);
  cylinder(tea, 0.95, 0.96, 0.11, [0, 0.59, 0], m.wood);
  for (const x of [-0.62, 0.62])
    for (const z of [-0.47, 0.47])
      box(tea, [0.1, 0.52, 0.1], [x, 0.28, z], m.woodDark, 0.02);
  const tray = box(tea, [0.84, 0.028, 0.47], [0, 0.666, 0], m.woodDark, 0.035);
  const pot = group(tea, [0.02, 0.69, 0]);
  sphere(pot, [0.145, 0.115, 0.145], [0, 0.11, 0], m.ceramic);
  cylinder(pot, 0.095, 0.1, 0.025, [0, 0.205, 0], m.woodDark);
  sphere(pot, [0.035, 0.028, 0.035], [0, 0.235, 0], m.woodDark);
  tube(
    pot,
    [
      [0.11, 0.1, 0],
      [0.19, 0.15, 0],
      [0.2, 0.23, 0],
    ],
    0.035,
    m.ceramic,
  );
  torus(pot, 0.105, 0.02, [-0.11, 0.12, 0], m.woodDark, [0, 0, 0]);
  for (const x of [-0.29, 0.3]) {
    cylinder(tea, 0.065, 0.045, 0.082, [x, 0.729, 0.08], m.ceramic);
    cylinder(tea, 0.053, 0.053, 0.004, [x, 0.774, 0.08], m.woodDark);
  }
  plant(tea, [0.28, 0.665, -0.32], 0.28, m);
  const steam = group(tea, [0, 0.96, 0]);
  for (let i = 0; i < 3; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: "#dfd0c8",
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    });
    tube(
      steam,
      [
        [i * 0.043 - 0.05, 0, 0],
        [i * 0.043 - 0.02, 0.13, 0.015],
        [i * 0.043 - 0.065, 0.3, 0],
      ],
      0.009,
      mat,
    );
  }
  register(tea, "茶桌与茶具", "给自己倒一杯热茶", () => {
    teaPulse = 1;
    return "一杯热茶 · 慢慢来，时间还很多";
  });
  let teaPulse = 0;
  const cushions = [];
  for (const x of [-1.17, 1.17]) {
    const cushion = box(
      root,
      [0.95, 0.17, 0.78],
      [2.63 + x, 0.17, 2.67],
      m.pillow,
      0.08,
    );
    box(cushion, [0.79, 0.009, 0.63], [0, 0.087, 0], m.duvet, 0.06);
    sphere(cushion, [0.035, 0.006, 0.035], [0, 0.098, 0], m.blanket);
    register(cushion, "坐垫", "找个舒服的位置坐下", () => {
      cushion.userData.pulse = 1;
      return "坐下来，喝口茶吧";
    });
    cushions.push(cushion);
  }

  const catmat = group(root, [2.48, 0.09, -0.25]);
  cylinder(catmat, 0.56, 0.56, 0.06, [0, 0, 0], m.blanket);
  torus(catmat, 0.47, 0.07, [0, 0.065, 0], m.duvet);
  const cat = group(catmat, [0, 0.05, 0]);
  const body = sphere(cat, [0.29, 0.16, 0.2], [0, 0.17, 0], m.cat);
  sphere(cat, [0.15, 0.12, 0.17], [-0.16, 0.18, 0.07], m.catWhite);
  const head = group(cat, [-0.16, 0.32, 0.12]);
  sphere(head, [0.135, 0.13, 0.13], [0, 0, 0], m.cat);
  sphere(head, [0.095, 0.065, 0.075], [0, -0.047, 0.082], m.catWhite);
  for (const x of [-0.087, 0.087]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.145, 3), m.cat);
    ear.position.set(x, 0.13, 0);
    ear.rotation.z = x > 0 ? -0.22 : 0.22;
    head.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.09, 3), m.pink);
    inner.position.set(x, 0.135, 0.033);
    head.add(inner);
    sphere(head, [0.013, 0.008, 0.007], [x * 0.65, 0.015, 0.118], m.black);
  }
  sphere(head, [0.016, 0.012, 0.013], [0, -0.025, 0.143], m.pink);
  for (const x of [-0.12, 0.06])
    sphere(cat, [0.095, 0.045, 0.07], [x, 0.08, 0.185], m.catWhite);
  const tail = group(cat, [0.2, 0.16, -0.03]);
  tube(
    tail,
    [
      [0, 0, 0],
      [0.16, 0.03, -0.1],
      [0.18, 0.01, -0.28],
      [0.05, 0, -0.3],
    ],
    0.045,
    m.cat,
  );
  register(cat, "小猫 · 糯米", "轻轻摸摸它", () => {
    catPulse = 1;
    return "呼噜呼噜… 糯米很喜欢你";
  });
  register(catmat, "猫垫", "糯米最喜欢的小窝", () => {
    catPulse = 1;
    return "软乎乎的小窝 · 糯米伸了个懒腰";
  });
  let catPulse = 0;
  const wallArt = group(root, [-0.1, 2.98, -4.88]);
  const artM = ["#8973cf", "#63959c", "#be9166"].map((c) => glow(c, 0.48));
  for (let i = 0; i < 8; i++) {
    const tile = box(
      wallArt,
      [0.18, 0.18, 0.025],
      [(i % 4) * 0.23 - 0.34, Math.floor(i / 4) * 0.23, 0],
      artM[i % 3],
      0.015,
    );
  }
  register(wallArt, "光影装饰", "换一组灯光心情", () => {
    const modes = ["aurora", "wave", "rainbow", "breathing"];
    store.set("rgbMode", modes[(modes.indexOf(store.state.rgbMode) + 1) % 4]);
    return "氛围灯已换一种心情";
  });

  return {
    bedShade,
    floorShade,
    fanMat,
    update(dt, t) {
      drawer.position.z = damp(
        drawer.position.z,
        store.state.drawer ? 0.43 : 0.025,
        dt,
        3,
      );
      doors.forEach(
        (d, i) =>
          (d.rotation.y = damp(
            d.rotation.y,
            store.state.wardrobe ? (i ? 1 : -1) * 1.15 : 0,
            dt,
            3,
          )),
      );
      screenMat.map = screenTextures[store.state.screen];
      screenMat.color.setScalar(
        damp(screenMat.color.r, store.state.pc ? 0.72 : 0.035, dt, 3),
      );
      fans.forEach((f) => (f.rotation.z += store.state.pc ? dt * 2 : 0));
      fanMat.emissiveIntensity = damp(
        fanMat.emissiveIntensity,
        store.state.pc ? 0.9 : 0,
        dt,
        3,
      );
      flap.rotation.x = damp(
        flap.rotation.x,
        store.state.ac ? -0.55 : 0,
        dt,
        3,
      );
      acLED.emissiveIntensity = store.state.ac ? 1.1 : 0;
      acLED.color.set(store.state.ac ? "#89baa6" : "#746e64");
      air.visible = store.state.ac;
      air.position.y = Math.sin(t) * 0.025;
      body.scale.y = 0.16 * (1 + Math.sin(t * 1.6) * 0.035 + catPulse * 0.13);
      head.rotation.x = Math.sin(t) * 0.02 - catPulse * 0.18;
      tail.rotation.y = Math.sin(t * 0.9) * (0.09 + catPulse * 0.45);
      catPulse = damp(catPulse, 0, dt, 1.2);
      steam.rotation.y = t * 0.24;
      steam.children.forEach(
        (s, i) =>
          (s.material.opacity =
            0.12 + Math.sin(t + i) * 0.04 + teaPulse * 0.12),
      );
      pot.rotation.z = Math.sin(teaPulse * Math.PI) * -0.16;
      teaPulse = damp(teaPulse, 0, dt, 1.5);
      keys.emissiveIntensity = 0.15 + keyPulse * 1.3;
      keyPulse = damp(keyPulse, 0, dt, 2);
      headphones.position.y = 1.27 + Math.sin(headPulse * Math.PI) * 0.18;
      headPulse = damp(headPulse, 0, dt, 2);
      chair.rotation.y = damp(chair.rotation.y, chairTurn, dt, 2);
      bed.scale.y = 1 + Math.sin(bedPulse * Math.PI) * 0.018;
      bedPulse = damp(bedPulse, 0, dt, 1.5);
      root.traverse((o) => {
        if (o.userData.pulse) {
          o.userData.pulse = damp(o.userData.pulse, 0, dt, 3);
          o.rotation.z = Math.sin(o.userData.pulse * Math.PI) * 0.045;
        }
      });
    },
    reset() {
      bedPulse = catPulse = teaPulse = keyPulse = headPulse = 0;
      chairTurn = 0;
      root.traverse((o) => {
        if (o.userData.pulse) {
          o.userData.pulse = 0;
          o.rotation.z = 0;
        }
      });
    },
  };
}
