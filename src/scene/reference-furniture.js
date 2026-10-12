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
import { createTriangleLights } from "./triangle-lights.js";
import { damp } from "../state.js";

// Each assembly owns its local coordinates, materials and interactions.
export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "Reference room furniture";
  const standard = (color, extras = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.65, ...extras });
  const glow = (color, strength = 0.7) =>
    standard(color, { emissive: color, emissiveIntensity: strength });
  const ink = standard("#151a22"),
    white = m.cream;
  const mahogany = standard("#39191e", { map: m.wood.map, roughness: 0.38 });
  const teal = standard("#194857", { map: m.duvet.map, roughness: 0.94 });
  const pink = glow("#e887bd"),
    red = standard("#9c2339"),
    cyan = glow("#6cf2f1");
  const bookM = [
    "#ba5360",
    "#5692bd",
    "#739485",
    "#dcd9c8",
    "#8c72aa",
    "#bc9364",
  ].map((c) => standard(c));
  const pulses = [],
    fans = [],
    monitors = [],
    chairs = [],
    drawers = [];
  const registerPulse = (obj, name, message) => {
    obj.userData.restY = obj.position.y;
    obj.userData.pulse = 0;
    pulses.push(obj);
    register(obj, name, "轻点互动", () => {
      obj.userData.pulse = 1;
      return message;
    });
  };
  function books(parent, x, y, z, count, pitch = 0.13) {
    const rack = group(parent, [x, y, z]);
    for (let i = 0; i < count; i++) {
      const h = 0.26 + (i % 4) * 0.037;
      const b = box(
        rack,
        [0.095, h, 0.24],
        [i * pitch, h / 2, 0],
        bookM[i % bookM.length],
        0.004,
      );
      box(b, [0.065, 0.015, 0.003], [0, h * 0.22, 0.123], white);
      if (i % 7 === 5) b.rotation.z = -0.12;
    }
    registerPulse(rack, "彩色书籍", "翻开一本书 · 今晚留给自己");
    return rack;
  }
  function controller(parent, pos, color, name = "游戏手柄") {
    const g = group(parent, pos),
      mat = standard(color);
    box(g, [0.27, 0.055, 0.13], [0, 0.03, 0], mat, 0.025);
    for (const x of [-0.11, 0.11]) {
      const grip = sphere(g, [0.069, 0.034, 0.095], [x, 0.025, 0.045], mat);
      grip.rotation.y = x * 2;
      cylinder(g, 0.023, 0.023, 0.018, [x * 0.65, 0.07, 0.01], ink, 12);
    }
    for (const [x, z] of [
      [0.11, -0.024],
      [0.09, -0.045],
      [0.13, -0.045],
    ])
      cylinder(g, 0.009, 0.009, 0.012, [x, 0.063, z], white, 8);
    registerPulse(g, name, "手柄已连接 · 开始一局轻松的游戏");
    return g;
  }
  function headset(parent, pos, mat, name) {
    const g = group(parent, pos);
    cylinder(g, 0.085, 0.1, 0.035, [0, 0.015, 0], ink);
    cylinder(g, 0.012, 0.018, 0.34, [0, 0.19, 0], ink);
    torus(g, 0.13, 0.021, [0, 0.35, 0], mat, [0, 0, 0], Math.PI);
    for (const x of [-0.13, 0.13])
      box(g, [0.063, 0.13, 0.09], [x, 0.29, 0], mat, 0.025);
    registerPulse(g, name, "耳机就位 · 世界安静下来");
  }
  function computer(parent, pos, scale = 1) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    box(g, [0.47, 0.79, 0.63], [0, 0.4, 0], standard("#bec5d1"), 0.022);
    // A dark cavity, clear front and side, and thin structural rails.
    box(g, [0.43, 0.68, 0.58], [0, 0.42, 0.02], ink, 0.012);
    box(g, [0.016, 0.67, 0.56], [0.245, 0.42, 0.02], m.glass);
    box(g, [0.4, 0.67, 0.012], [0, 0.42, 0.326], m.glass);
    for (const x of [-0.225, 0.225])
      box(g, [0.025, 0.79, 0.03], [x, 0.4, 0.32], white);
    const fanMat = glow("#d986ff", 1);
    for (const y of [0.25, 0.58]) {
      torus(g, 0.115, 0.016, [0, y, 0.337], fanMat, [0, 0, 0]);
      const fan = group(g, [0, y, 0.334]);
      for (let i = 0; i < 5; i++) {
        const blade = box(fan, [0.04, 0.17, 0.008], [0, 0, 0], white, 0.015);
        blade.rotation.z = (i * Math.PI) / 5;
      }
      fans.push({ fan, mat: fanMat });
    }
    torus(g, 0.12, 0.014, [0.252, 0.45, 0], cyan, [0, Math.PI / 2, 0]);
    register(g, "侧透 RGB 主机", "开关电脑", () => {
      store.set("pc", !store.state.pc);
      return store.state.pc ? "双机启动 · 风扇轻转" : "主机已休眠";
    });
    return g;
  }
  function gamingChair(pos, angle) {
    const g = group(root, pos);
    g.rotation.y = angle;
    cylinder(g, 0.04, 0.06, 0.5, [0, 0.31, 0], ink);
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5,
        x = Math.sin(a) * 0.39,
        z = Math.cos(a) * 0.39;
      tube(
        g,
        [
          [0, 0.22, 0],
          [x, 0.12, z],
        ],
        0.035,
        white,
      );
      sphere(g, [0.07, 0.055, 0.06], [x, 0.065, z], ink);
    }
    box(g, [0.7, 0.17, 0.67], [0, 0.61, 0], white, 0.07);
    box(g, [0.52, 0.06, 0.57], [0, 0.71, -0.025], ink, 0.027);
    box(g, [0.64, 1.05, 0.18], [0, 1.16, 0.28], white, 0.08);
    box(g, [0.34, 0.76, 0.04], [0, 1.15, 0.178], ink, 0.018);
    box(g, [0.28, 0.68, 0.025], [0, 1.12, 0.379], ink, 0.015);
    for (const x of [-0.12, 0.12])
      box(g, [0.07, 0.08, 0.024], [x, 1.51, 0.376], ink, 0.018);
    box(g, [0.29, 0.15, 0.09], [0, 1.48, 0.15], white, 0.045);
    for (const x of [-0.4, 0.4]) {
      box(g, [0.04, 0.32, 0.045], [x, 0.82, 0], ink);
      box(g, [0.1, 0.065, 0.43], [x, 0.99, -0.02], ink, 0.022);
    }
    const c = { g, angle, target: angle };
    chairs.push(c);
    register(g, "黑白电竞椅", "轻转椅子", () => {
      c.target += Math.PI / 3;
      return "换个角度，继续放松";
    });
  }

  // LEFT WALL: low storage beneath the two-panel window.
  const low = group(root, [-4.47, 0, 2.15]);
  low.rotation.y = Math.PI / 2;
  for (const y of [0.1, 0.42, 0.79])
    box(low, [2.6, 0.06, 0.65], [0, y, 0], ink);
  for (const x of [-1.27, -0.44, 0.44, 1.27])
    box(low, [0.045, 0.7, 0.63], [x, 0.43, 0], ink);
  for (let i = 0; i < 42; i++)
    box(low, [0.028, 0.035, 0.63], [-1.25 + i * 0.061, 0.835, 0], m.metal);
  books(low, -1.18, 0.14, 0.11, 18);
  books(low, -1.18, 0.46, 0.11, 18);
  controller(root, [-3.63, 0.02, 2.9], "#397fab", "蓝色游戏手柄");
  const nest = group(root, [-4.02, 0, 4.03]);
  box(nest, [1.07, 0.15, 0.88], [0, 0.12, 0], standard("#6bacb8"), 0.07);
  box(nest, [0.9, 0.12, 0.72], [0, 0.22, 0], m.pillow, 0.05);
  for (const x of [-0.49, 0.49])
    box(nest, [0.13, 0.27, 0.85], [x, 0.26, 0], standard("#6bacb8"), 0.055);
  box(nest, [1.02, 0.28, 0.13], [0, 0.26, -0.39], standard("#6bacb8"), 0.05);
  registerPulse(nest, "浅蓝宠物窝", "柔软的小窝 · 糯米的休息角落");

  // Two workstations, assembled along the window wall toward the back corner.
  const desk = group(root, [-4.27, 0, -2.12]);
  desk.rotation.y = Math.PI / 2;
  box(desk, [4.92, 0.13, 1.14], [0, 1.17, 0], ink, 0.035);
  box(desk, [1.0, 0.13, 0.9], [1.96, 1.17, 0.79], ink, 0.03);
  for (const x of [-2.25, 0, 2.25])
    for (const z of [-0.46, 0.43])
      box(desk, [0.07, 1.12, 0.07], [x, 0.57, z], ink);
  const screenTextures = [0, 1, 2].map(canvasScreen);
  const pixelTexture = (() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 288;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#111921";
    ctx.fillRect(0, 0, 512, 288);
    for (let y = 8; y < 210; y += 12)
      for (let x = 5; x < 510; x += 8) {
        ctx.fillStyle = (x + y) % 3 ? "#6c858d" : "#c2c9c8";
        ctx.fillRect(x, y, 3, 6);
      }
    ctx.fillStyle = "#d2d5d5";
    ctx.fillRect(0, 215, 512, 73);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  for (const x of [-1.18, 1.12]) {
    const monitor = group(desk, [x, 1.25, -0.3]);
    box(monitor, [0.45, 0.035, 0.28], [0, 0.02, 0.1], m.metal, 0.018);
    box(monitor, [0.045, 0.3, 0.045], [0, 0.18, 0], m.metal);
    box(monitor, [1.49, 0.89, 0.065], [0, 0.72, 0], ink, 0.022);
    const mat = new THREE.MeshBasicMaterial({
      map: pixelTexture,
      color: "#bdc7cf",
      toneMapped: false,
    });
    box(monitor, [1.41, 0.81, 0.008], [0, 0.72, 0.038], mat);
    monitors.push(mat);
    register(monitor, "电脑显示器", "切换双屏桌面", () => {
      store.set("screen", (store.state.screen + 1) % 3);
      return "双屏桌面已切换";
    });
  }
  for (const x of [-1.18, 1.12]) {
    const keyboard = group(desk, [x, 1.264, 0.25]);
    box(keyboard, [0.85, 0.035, 0.29], [0, 0, 0], m.metal, 0.015);
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 14; col++)
        box(
          keyboard,
          [0.045, 0.014, 0.043],
          [-0.39 + col * 0.059, 0.025, -0.1 + row * 0.063],
          (row + col) % 6 === 0 ? pink : white,
          0.003,
        );
    registerPulse(keyboard, "机械键盘", "嗒嗒 · 专注当前的一件事");
    const mouse = sphere(
      desk,
      [0.055, 0.035, 0.087],
      [x + 0.63, 1.28, 0.25],
      ink,
    );
    registerPulse(mouse, "鼠标", "鼠标轻响 · 光标已就位");
  }
  headset(desk, [-2.22, 1.25, 0.16], pink, "粉色耳机支架");
  headset(desk, [0, 1.25, 0.21], red, "红色耳机支架");
  plant(desk, [-2.22, 1.25, -0.31], 0.3, m);
  computer(desk, [-1.95, 0.03, 0.02], 0.95);
  computer(desk, [2.07, 1.25, -0.19], 0.81);
  const shelf = group(desk, [0, 3.04, -0.23]);
  box(shelf, [4.87, 0.095, 0.43], [0, 0, 0], ink);
  books(shelf, -2.25, 0.06, 0.01, 28, 0.137);
  box(shelf, [0.45, 0.07, 0.28], [1.86, 0.1, 0], bookM[0]);
  box(shelf, [0.4, 0.065, 0.25], [1.85, 0.17, 0], white);
  box(shelf, [0.17, 0.2, 0.17], [2.22, 0.33, 0], white, 0.009);
  cylinder(shelf, 0.09, 0.09, 0.16, [2.22, 0.14, 0], bookM[5]);
  const poster = group(desk, [-2.15, 2.48, -0.49]);
  box(poster, [0.45, 0.61, 0.024], [0, 0, 0], ink);
  // Small sculpted monochrome robot relief, rather than a downloaded poster.
  box(poster, [0.24, 0.21, 0.028], [0, 0.09, 0.025], white, 0.02);
  box(poster, [0.2, 0.19, 0.027], [0, -0.14, 0.025], white, 0.01);
  for (const x of [-0.065, 0.065])
    box(poster, [0.038, 0.035, 0.01], [x, 0.12, 0.045], ink);
  registerPulse(poster, "机器人装饰画", "HELLO, PLAYER · 欢迎回家");
  gamingChair([-2.67, 0, -0.9], Math.PI / 2);
  gamingChair([-2.48, 0, -3.25], Math.PI / 2 - 0.15);

  // RIGHT WALL: floating media console, TV and two floor-standing speakers.
  const media = group(root, [2.02, 0, -4.55]);
  box(media, [3.27, 0.26, 0.66], [0, 0.68, 0], standard("#858b94"), 0.018);
  box(media, [0.96, 0.12, 0.38], [0, 0.88, 0.04], ink, 0.012);
  for (const x of [-1.27, 1.27]) {
    const device = box(media, [0.12, 0.49, 0.3], [x, 1.05, 0.03], white, 0.025);
    box(device, [0.023, 0.42, 0.01], [0, 0, 0.154], ink);
    registerPulse(device, "影音设备", "影音系统已连接");
  }
  const tv = group(root, [2.02, 2.26, -4.855]);
  box(tv, [3.03, 1.74, 0.095], [0, 0, 0], ink, 0.018);
  const tvMat = new THREE.MeshBasicMaterial({
    color: "#8dbbdc",
    toneMapped: false,
  });
  box(tv, [2.97, 1.68, 0.008], [0, 0, 0.053], tvMat);
  let tvMode = 0;
  const toggleTV = () => {
    tvMode = (tvMode + 1) % 3;
    return ["电视 · 安静蓝屏", "电视 · 山间晚景", "电视已关闭"][tvMode];
  };
  register(tv, "壁挂电视", "蓝屏 / 风景 / 关闭", toggleTV);
  for (const x of [-0.15, 4.05]) {
    const speaker = group(root, [x, 0, -3.82]);
    box(speaker, [0.68, 1.25, 0.64], [0, 0.66, 0], ink, 0.025);
    for (const [y, r, c] of [
      [0.96, 0.1, "#a5b0bd"],
      [0.44, 0.225, "#b07853"],
    ]) {
      torus(speaker, r, 0.026, [0, y, 0.333], standard(c), [0, 0, 0]);
      const cone = cylinder(
        speaker,
        r * 0.86,
        r * 0.86,
        0.025,
        [0, y, 0.335],
        standard(c),
      );
      cone.rotation.x = Math.PI / 2;
      sphere(speaker, [r * 0.4, r * 0.4, 0.045], [0, y, 0.366], ink);
    }
    registerPulse(speaker, "落地音箱", "音箱指示灯亮起 · 静音待机");
  }
  const ac = group(root, [2.12, 3.55, -4.84]);
  box(ac, [3.6, 0.28, 0.16], [0, 0, 0], white, 0.024);
  for (let i = 0; i < 48; i++)
    box(
      ac,
      [0.035, 0.16, 0.008],
      [-1.65 + i * 0.07, 0, 0.09],
      standard("#abb4bd"),
    );
  const acLED = box(ac, [0.07, 0.015, 0.01], [1.53, -0.095, 0.092], cyan);
  register(ac, "空调", "切换静音空调", () => {
    store.set("ac", !store.state.ac);
    return store.state.ac ? "26°C · 静音送风" : "空调已关闭";
  });
  const air = group(ac);
  for (const x of [-0.8, 0, 0.8])
    tube(
      air,
      [
        [x, -0.18, 0.1],
        [x, -0.35, 0.22],
        [x + 0.08, -0.5, 0.32],
      ],
      0.009,
      standard("#aaf5f2", { transparent: true, opacity: 0.3 }),
    );
  const accents = group(root);
  for (const [x, y, w] of [
    [-2.7, 3.42, 1.8],
    [-1.73, 1.9, 1.6],
    [3.05, 1.31, 1.3],
  ])
    box(accents, [w, 0.038, 0.035], [x, y, -4.88], cyan);
  const triangleLights = createTriangleLights(root, store, register);
  register(accents, "青色几何灯饰", "切换氛围", () => {
    store.set(
      "rgbMode",
      store.state.rgbMode === "static" ? "aurora" : "static",
    );
    return "墙面氛围已切换";
  });
  const bigPlant = plant(root, [4.5, 0.31, -4.35], 1.05, {
    ...m,
    ceramic: white,
  });
  for (const x of [4.3, 4.7])
    for (const z of [-4.55, -4.15])
      box(root, [0.045, 0.35, 0.045], [x, 0.18, z], m.wood);

  // Low faceted coffee table and two upholstered beanbags.
  const table = group(root, [2.4, 0, -1.65]);
  cylinder(table, 0.73, 0.82, 0.33, [0, 0.23, 0], ink);
  for (let i = 0; i < 8; i++) {
    const geo = new THREE.CylinderGeometry(
      1.12,
      1.12,
      0.09,
      1,
      1,
      false,
      (i * Math.PI) / 4,
      Math.PI / 4,
    );
    const mesh = new THREE.Mesh(geo, standard(i % 2 ? "#747a92" : "#9299ad"));
    mesh.position.y = 0.49;
    mesh.receiveShadow = true;
    table.add(mesh);
  }
  const magazine = group(table, [0.24, 0.55, -0.2]);
  magazine.rotation.y = -0.3;
  for (const sign of [-1, 1]) {
    const page = box(
      magazine,
      [0.25, 0.015, 0.37],
      [sign * 0.126, 0, 0],
      white,
    );
    page.rotation.z = sign * 0.1;
    box(
      page,
      [0.18, 0.006, 0.15],
      [0, 0.013, -0.07],
      bookM[sign === 1 ? 0 : 5],
    );
    for (let i = 0; i < 4; i++)
      box(page, [0.16, 0.002, 0.008], [0, 0.013, 0.04 + i * 0.022], ink);
  }
  registerPulse(magazine, "打开的杂志", "翻到下一页 · 城市漫游特辑");
  const remote = box(
    table,
    [0.115, 0.025, 0.24],
    [0.22, 0.557, 0.64],
    standard("#e0b35c"),
    0.01,
  );
  for (let i = 0; i < 3; i++)
    box(remote, [0.045, 0.008, 0.028], [0, 0.02, -0.06 + i * 0.06], ink);
  register(remote, "电视遥控器", "切换电视画面", toggleTV);
  registerPulse(table, "圆形茶几", "坐下来，翻一会儿杂志");
  for (const [x, z, s] of [
    [0.61, -1.02, 1.05],
    [3.35, 0.19, 0.89],
  ]) {
    const bean = group(root, [x, 0, z]);
    // The seat opens toward local +Z; aim both seats at the TV center.
    bean.rotation.y = Math.atan2(tv.position.x - x, tv.position.z - z);
    bean.scale.setScalar(s);
    sphere(bean, [0.73, 0.43, 0.7], [0, 0.38, 0], teal);
    const back = sphere(bean, [0.66, 0.43, 0.28], [0, 0.62, -0.34], teal);
    back.rotation.x = -0.24;
    sphere(bean, [0.54, 0.1, 0.5], [0, 0.65, 0.08], teal);
    registerPulse(bean, "深蓝绿豆袋椅", "软软陷进去 · 今天也辛苦了");
  }

  // FOREGROUND BED: headboard toward the open front; dark curved timber silhouette.
  const bed = group(root, [0, 0, 2.6]);
  bed.rotation.y = Math.PI;
  bed.scale.setScalar(1.12);
  box(root, [5, 0.045, 4.7], [0, 0.03, 2.55], m.rug, 0.018);
  box(bed, [2.65, 0.3, 3.51], [0, 0.32, 0], mahogany, 0.045);
  box(bed, [2.57, 0.26, 3.43], [0, 0.59, 0], m.pillow, 0.12);
  box(bed, [2.58, 0.22, 2.67], [0, 0.79, 0.37], m.duvet, 0.1);
  box(
    bed,
    [2.59, 0.048, 0.48],
    [0, 0.927, 0.93],
    standard("#77706e", { map: m.duvet.map }),
    0.018,
  );
  for (const x of [-0.62, 0.62])
    box(bed, [1.05, 0.22, 0.64], [x, 0.86, -1.12], m.pillow, 0.1);
  function curvedBoard(z, height) {
    const shape = new THREE.Shape();
    shape.moveTo(-1.38, 0.1);
    shape.lineTo(-1.38, height - 0.22);
    shape.bezierCurveTo(-1.12, height - 0.32, -0.85, height + 0.14, 0, height);
    shape.bezierCurveTo(
      0.85,
      height + 0.14,
      1.12,
      height - 0.32,
      1.38,
      height - 0.22,
    );
    shape.lineTo(1.38, 0.1);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.11,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.02,
      bevelSegments: 2,
      steps: 1,
      curveSegments: 16,
    });
    const board = new THREE.Mesh(geo, mahogany);
    board.position.z = z;
    board.castShadow = true;
    bed.add(board);
  }
  curvedBoard(-1.8, 1.45);
  curvedBoard(1.68, 0.74);
  const phone = box(
    bed,
    [0.14, 0.015, 0.25],
    [-0.64, 0.923, 0.37],
    standard("#638698"),
    0.012,
  );
  registerPulse(phone, "床上的手机", "勿扰模式 · 今晚好好休息");
  registerPulse(bed, "双人床", "被窝暖暖的 · 明天再忙吧");
  const bedShade = glow("#ffe4b2", 0.8),
    floorShade = glow("#fff0cc", 0.6);
  for (const [i, x] of [
    [0, -1.95],
    [1, 1.95],
  ]) {
    const cabinet = group(root, [x, 0, 4.28]);
    box(cabinet, [0.68, 0.53, 0.64], [0, 0.51, 0], ink, 0.016);
    box(cabinet, [0.73, 0.065, 0.7], [0, 0.81, 0], ink, 0.014);
    for (const dx of [-0.27, 0.27])
      for (const dz of [-0.24, 0.24])
        box(cabinet, [0.045, 0.27, 0.045], [dx, 0.15, dz], ink);
    const drawer = group(cabinet, [0, 0.53, 0]);
    box(drawer, [0.61, 0.3, 0.58], [0, 0, 0], ink, 0.008);
    box(drawer, [0.2, 0.025, 0.03], [0, 0, 0.316], m.metal);
    drawers.push(drawer);
    register(drawer, "床头柜抽屉", "拉开抽屉", () => {
      store.set("drawer", !store.state.drawer);
      return store.state.drawer ? "抽屉已打开" : "抽屉已合上";
    });
    const lamp = group(cabinet, [-0.08, 0.85, -0.08]);
    cylinder(lamp, 0.1, 0.13, 0.055, [0, 0.03, 0], ink);
    cylinder(lamp, 0.025, 0.028, 0.19, [0, 0.15, 0], m.metal);
    if (i === 0) cylinder(lamp, 0.13, 0.2, 0.24, [0, 0.36, 0], bedShade);
    else sphere(lamp, [0.115, 0.12, 0.115], [0, 0.22, 0], floorShade);
    const key = i === 0 ? "bedLamp" : "floorLamp";
    register(lamp, i === 0 ? "白色床头灯" : "圆形床头灯", "开关灯光", () => {
      store.set(key, !store.state[key]);
      return store.state[key] ? "暖灯亮起" : "暖灯已关";
    });
    if (i === 1) {
      box(cabinet, [0.28, 0.045, 0.33], [0.16, 0.87, 0.12], bookM[5]);
      box(cabinet, [0.25, 0.04, 0.31], [0.17, 0.917, 0.12], white);
    }
  }
  const cactus = group(root, [4.11, 0, 2.2]);
  cylinder(cactus, 0.1, 0.075, 0.16, [0, 0.09, 0], standard("#bf7c36"));
  const green = glow("#7eef79", 1.4);
  tube(
    cactus,
    [
      [0, 0.17, 0],
      [0, 0.45, 0],
      [0, 0.7, 0],
    ],
    0.025,
    green,
  );
  tube(
    cactus,
    [
      [0, 0.33, 0],
      [-0.16, 0.4, 0],
      [-0.16, 0.59, 0],
    ],
    0.025,
    green,
  );
  tube(
    cactus,
    [
      [0, 0.45, 0],
      [0.14, 0.49, 0],
      [0.14, 0.66, 0],
    ],
    0.025,
    green,
  );
  registerPulse(cactus, "仙人掌装饰灯", "一点绿色的好心情");
  return {
    root,
    bedShade,
    floorShade,
    update(dt, t) {
      triangleLights.update(dt, t);
      for (const { fan, mat } of fans) {
        fan.rotation.z += store.state.pc ? dt * 2 : 0;
        mat.emissiveIntensity = damp(
          mat.emissiveIntensity,
          store.state.pc ? 0.9 : 0,
          dt,
        );
      }
      for (const mat of monitors) {
        mat.map =
          store.state.screen === 0
            ? pixelTexture
            : screenTextures[store.state.screen];
        mat.color.setScalar(
          damp(mat.color.r, store.state.pc ? 0.78 : 0.025, dt),
        );
      }
      for (const c of chairs)
        c.g.rotation.y = damp(c.g.rotation.y, c.target, dt, 2);
      for (const d of drawers)
        d.position.z = damp(d.position.z, store.state.drawer ? 0.34 : 0, dt, 3);
      for (const obj of pulses) {
        obj.userData.pulse = damp(obj.userData.pulse, 0, dt, 2);
        obj.position.y =
          obj.userData.restY + Math.sin(obj.userData.pulse * Math.PI) * 0.055;
      }
      tvMat.map = tvMode === 1 ? screenTextures[0] : null;
      tvMat.color.set(
        tvMode === 2 ? "#101820" : tvMode === 1 ? "#bfcddd" : "#8dbbdc",
      );
      if (tvMat.userData.mode !== tvMode) {
        tvMat.needsUpdate = true;
        tvMat.userData.mode = tvMode;
      }
      air.visible = store.state.ac;
      air.position.y = Math.sin(t) * 0.015;
      acLED.visible = store.state.ac;
      cyan.emissiveIntensity = damp(
        cyan.emissiveIntensity,
        store.state.rgbMode === "off" ? 0 : store.state.rgbBrightness * 1.2,
        dt,
      );
    },
    reset() {
      tvMode = 0;
      for (const c of chairs) c.target = c.angle;
      for (const obj of pulses) {
        obj.userData.pulse = 0;
        obj.position.y = obj.userData.restY;
      }
    },
  };
}
