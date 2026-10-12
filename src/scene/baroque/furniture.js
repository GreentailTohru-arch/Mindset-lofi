import * as THREE from "three";
import {
  box,
  cylinder,
  sphere,
  torus,
  tube,
  group,
  plant,
} from "../primitives.js";
import { flourish, ornateFrame, cabriole, candles } from "./details.js";
import { damp } from "../../state.js";
export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "巴洛克 · 沙龙陈设";
  const pulses = [],
    lamps = [];
  const touch = (obj, name, text) => {
    const p = { obj, y: obj.position.y, v: 0 };
    pulses.push(p);
    register(obj, name, "轻点互动", () => {
      p.v = 1;
      return text;
    });
  };
  function book(parent, pos, w = 0.42, mat = m.forest) {
    const g = group(parent, pos);
    box(g, [w, 0.07, 0.31], [0, 0, 0], m.paper, 0.003);
    for (const y of [-0.045, 0.045])
      box(g, [w + 0.025, 0.019, 0.34], [0, y, 0], mat, 0.003);
    for (const x of [-w * 0.36, w * 0.36])
      box(g, [0.022, 0.09, 0.008], [x, 0, 0.176], m.gold);
    return g;
  }
  function table(pos, w, d, h) {
    const g = group(root, pos);
    box(g, [w, 0.1, d], [0, h, 0], m.wood, 0.028);
    for (const z of [-d / 2 + 0.06, d / 2 - 0.06]) {
      box(g, [w - 0.12, 0.16, 0.06], [0, h - 0.12, z], m.woodDark, 0.01);
      flourish(g, [0, h - 0.13, z + 0.045], w * 0.27, m);
    }
    for (const x of [-w / 2 + 0.12, w / 2 - 0.12])
      for (const z of [-d / 2 + 0.12, d / 2 - 0.12])
        cabriole(g, x, z, h - 0.05, m);
    return g;
  }
  function flowers(parent, pos, scale = 1) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    cylinder(g, 0.1, 0.14, 0.06, [0, 0.04, 0], m.gold);
    sphere(g, [0.2, 0.23, 0.2], [0, 0.24, 0], m.ceramic);
    cylinder(g, 0.1, 0.12, 0.1, [0, 0.45, 0], m.ceramic);
    const colors = [m.paper, m.velvet, m.gold];
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4,
        x = Math.cos(a) * 0.25,
        z = Math.sin(a) * 0.22,
        y = 0.73 + (i % 3) * 0.07;
      tube(
        g,
        [
          [0, 0.45, 0],
          [x, y, z],
        ],
        0.008,
        m.leaf,
      );
      sphere(g, [0.04, 0.06, 0.015], [x * 0.6, 0.6, z * 0.6], m.leaf);
      for (let p = 0; p < 6; p++) {
        const b = (p * Math.PI) / 3;
        sphere(
          g,
          [0.045, 0.029, 0.034],
          [x + Math.cos(b) * 0.045, y, z + Math.sin(b) * 0.045],
          colors[i % 3],
        );
      }
      sphere(g, [0.024, 0.025, 0.024], [x, y + 0.025, z], m.gold);
    }
    touch(g, "沙龙鲜花", "花开无声 · 静享此刻");
    return g;
  }
  function candleSet(parent, pos, scale, key, name) {
    const c = candles(parent, pos, scale, m);
    c.root.updateWorldMatrix(true, false);
    lamps.push({
      ...c,
      key,
      pos: c.root.localToWorld(new THREE.Vector3(0, 0.6, 0)),
    });
    register(c.root, name, "点亮 / 熄灭", () => {
      store.set(key, !store.state[key]);
      return store.state[key] ? "烛火亮起 · 温暖相伴" : "烛火熄灭";
    });
    return c;
  }

  const hearth = group(root, [0.3, 0, -4.16]);
  box(hearth, [2.43, 0.13, 1.12], [0, 0.08, 0], m.marble, 0.028);
  box(hearth, [1.61, 1.12, 0.035], [0, 0.69, -0.43], m.black);
  for (const x of [-0.94, 0.94]) {
    box(hearth, [0.31, 1.13, 0.67], [x, 0.69, -0.02], m.marble, 0.025);
    box(hearth, [0.4, 0.14, 0.77], [x, 0.23, 0], m.marble, 0.018);
    for (const dx of [-0.07, 0.07])
      box(hearth, [0.022, 0.67, 0.015], [x + dx, 0.79, 0.329], m.gold);
    flourish(hearth, [x, 1.16, 0.348], 0.24, m);
  }
  box(hearth, [2.4, 0.16, 0.89], [0, 1.34, 0], m.marble, 0.028);
  box(hearth, [1.62, 0.22, 0.53], [0, 1.16, 0.02], m.marble, 0.022);
  flourish(hearth, [0, 1.16, 0.3], 0.8, m);
  for (let i = 0; i < 3; i++) {
    const log = cylinder(
      hearth,
      0.068,
      0.074,
      0.77,
      [0, 0.23 + i * 0.027, (i - 1) * 0.12],
      m.ember,
      12,
    );
    log.rotation.z = Math.PI / 2;
    log.rotation.y = i * 0.27;
  }
  for (const x of [-0.65, 0.65])
    cylinder(hearth, 0.025, 0.025, 0.29, [x, 0.31, 0.39], m.gold, 10);
  for (let i = 0; i < 8; i++)
    cylinder(
      hearth,
      0.012,
      0.012,
      0.23,
      [-0.56 + i * 0.16, 0.31, 0.39],
      m.black,
      8,
    );
  box(hearth, [1.34, 0.029, 0.027], [0, 0.38, 0.39], m.black);
  const flames = [];
  for (let i = 0; i < 9; i++) {
    const flame = sphere(
      hearth,
      [0.045, 0.15 + (i % 3) * 0.04, 0.035],
      [(i - 4) * 0.11, 0.43, (i % 2) * 0.07 - 0.07],
      m.flame.clone(),
    );
    flames.push(flame);
  }
  let fireOn = true;
  register(hearth, "古典壁炉", "点燃 / 熄灭", () => {
    fireOn = !fireOn;
    return fireOn ? "炉火轻燃 · 冬夜渐暖" : "炉火熄灭 · 留一室月光";
  });
  const fireLight = new THREE.PointLight("#ffb76a", 3.5, 3.6, 2);
  fireLight.position.set(0.3, 0.57, -3.91);
  scene.add(fireLight);
  flowers(hearth, [-0.77, 1.43, -0.02], 0.58);
  candleSet(hearth, [0.22, 1.425, -0.02], 0.65, "bedLamp", "壁炉烛台");
  // A small idealised marble bust on the mantel; no living figures in the room.
  const bust = group(hearth, [0.84, 1.425, 0]);
  box(bust, [0.3, 0.065, 0.26], [0, 0.04, 0], m.marble, 0.012);
  cylinder(bust, 0.072, 0.105, 0.14, [0, 0.14, 0], m.sculpture);
  sphere(bust, [0.18, 0.13, 0.09], [0, 0.28, 0], m.sculpture);
  cylinder(bust, 0.043, 0.06, 0.12, [0, 0.38, 0], m.sculpture);
  sphere(bust, [0.098, 0.14, 0.095], [0, 0.53, 0], m.sculpture);
  sphere(bust, [0.023, 0.035, 0.035], [0, 0.51, 0.082], m.sculpture);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    sphere(
      bust,
      [0.035, 0.04, 0.032],
      [Math.cos(a) * 0.082, 0.61 + Math.sin(a) * 0.025, Math.sin(a) * 0.074],
      m.sculpture,
    );
  }
  touch(bust, "大理石古典雕像", "石上光影 · 岁月留痕");

  const shelf = group(root, [-2.45, 0, -4.33]);
  box(shelf, [1.74, 2.98, 0.08], [0, 1.65, -0.33], m.woodDark);
  for (const x of [-0.85, 0.85]) {
    box(shelf, [0.13, 3.03, 0.77], [x, 1.65, 0], m.wood, 0.01);
    for (const y of [0.25, 3.09])
      box(shelf, [0.18, 0.07, 0.83], [x, y, 0], m.gold, 0.012);
  }
  for (const y of [0.18, 0.8, 1.5, 2.21, 3.15])
    box(shelf, [1.93, 0.09, 0.88], [0, y, 0.03], m.wood, 0.014);
  flourish(shelf, [0, 3.22, 0.42], 1.15, m);
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < 9; i++) {
      const b = book(
        shelf,
        [-0.66 + i * 0.157, 1.1 + row * 0.706, 0.06],
        0.47 + (i % 3) * 0.025,
        [m.forest, m.velvet, m.woodLight][i % 3],
      );
      b.rotation.z = Math.PI / 2;
    }
  const doors = [];
  for (const x of [-0.41, 0.41]) {
    const g = group(shelf, [x - 0.38, 0.49, 0.44]);
    box(g, [0.75, 0.49, 0.035], [0.375, 0, 0], m.wood, 0.012);
    flourish(g, [0.375, 0, 0.03], 0.4, m);
    doors.push(g);
  }
  let cabinetOpen = false;
  register(shelf, "雕花古籍书柜", "柜门开合", () => {
    cabinetOpen = !cabinetOpen;
    return cabinetOpen ? "书柜轻启 · 寻一册旧书" : "书柜合拢";
  });
  const globe = group(shelf, [0, 3.21, 0]);
  cylinder(globe, 0.12, 0.18, 0.065, [0, 0.035, 0], m.gold);
  cylinder(globe, 0.018, 0.032, 0.21, [0, 0.15, 0], m.gold);
  for (const a of [0, Math.PI / 2])
    torus(globe, 0.21, 0.008, [0, 0.4, 0], m.gold, [0.3, a, 0]);

  const desk = table([3.25, 0, -3.76], 2.32, 1.02, 0.91);
  box(desk, [1.98, 0.014, 0.74], [0, 0.97, 0], m.forest, 0.012);
  for (const x of [-0.89, 0.91]) {
    book(desk, [x, 1.03, -0.18], 0.34);
    book(desk, [x, 1.135, -0.18], 0.33, m.velvet);
  }
  const notebook = group(desk, [0, 0.99, 0.12]);
  for (const s of [-1, 1]) {
    const page = box(
      notebook,
      [0.25, 0.016, 0.36],
      [s * 0.127, 0.01, 0],
      m.paper,
      0.003,
    );
    page.rotation.z = s * 0.06;
  }
  touch(notebook, "素面书册", "静读一页 · 不问时间");
  candleSet(desk, [0.64, 0.98, -0.27], 0.7, "floorLamp", "书桌烛台");
  const drawer = group(desk, [0, 0.77, 0.51]);
  box(drawer, [0.9, 0.16, 0.06], [0, 0, 0], m.wood);
  torus(drawer, 0.045, 0.008, [0, 0, 0.04], m.gold, [0, 0, 0]);
  register(drawer, "写字桌抽屉", "打开 / 合上", () => {
    store.set("drawer", !store.state.drawer);
    return store.state.drawer ? "抽屉缓缓滑出" : "抽屉归位";
  });
  const deskChair = group(root, [3.25, 0, -2.37]);
  deskChair.rotation.y = Math.PI;
  for (const x of [-0.32, 0.32])
    for (const z of [-0.27, 0.27]) cabriole(deskChair, x, z, 0.44, m);
  box(deskChair, [0.78, 0.13, 0.72], [0, 0.52, 0], m.velvet, 0.075);
  box(deskChair, [0.65, 0.68, 0.13], [0, 0.94, -0.31], m.velvet, 0.13);
  ornateFrame(deskChair, [0, 0.95, -0.24], 0.66, 0.69, m);
  touch(deskChair, "绒面书桌椅", "落座片刻 · 思绪渐静");

  // Compact single-manual harpsichord: tapered case, fine strings, hinged lid.
  const instrument = group(root, [-3.31, 0, -0.16]);
  const outline = new THREE.Shape();
  outline.moveTo(-0.67, 0.05);
  outline.lineTo(0.67, 0.05);
  outline.lineTo(0.6, 0.73);
  outline.bezierCurveTo(0.53, 1.18, 0.09, 1.52, -0.58, 1.95);
  outline.lineTo(-0.67, 1.95);
  outline.closePath();
  const caseGeo = new THREE.ExtrudeGeometry(outline, {
    depth: 0.15,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.012,
    bevelThickness: 0.012,
  });
  const body = new THREE.Mesh(caseGeo, m.woodDark);
  body.rotation.x = -Math.PI / 2;
  body.position.y = 0.97;
  body.castShadow = true;
  body.receiveShadow = true;
  instrument.add(body);
  const soundboard = new THREE.Mesh(
    new THREE.ShapeGeometry(outline),
    m.woodLight,
  );
  soundboard.rotation.x = -Math.PI / 2;
  soundboard.position.y = 1.13;
  instrument.add(soundboard);
  for (const [x, z] of [
    [-0.54, -0.04],
    [0.54, -0.04],
    [-0.5, -1.73],
  ])
    cabriole(instrument, x, z, 0.97, m);
  const lidPivot = group(instrument, [-0.68, 1.16, 0]);
  const lid = new THREE.Mesh(new THREE.ShapeGeometry(outline), m.forest);
  lid.rotation.x = -Math.PI / 2;
  lid.position.x = 0.68;
  lid.material = lid.material.clone();
  lid.material.side = THREE.DoubleSide;
  lidPivot.add(lid);
  lidPivot.rotation.z = 0.58;
  tube(
    instrument,
    [
      [-0.67, 1.16, -0.02],
      [-0.67, 1.16, -1.95],
    ],
    0.018,
    m.gold,
  );
  for (let i = 0; i < 26; i++) {
    const x = -0.55 + i * 0.043;
    const length = 1.8 - i * 0.047;
    tube(
      instrument,
      [
        [x, 1.148, -0.19],
        [x, 1.148, -length],
      ],
      0.0018,
      m.gold,
    );
  }
  box(instrument, [1.39, 0.12, 0.36], [0, 1.01, 0.16], m.wood, 0.022);
  const keys = [];
  for (let i = 0; i < 28; i++) {
    const key = box(
      instrument,
      [0.039, 0.022, 0.26],
      [-0.588 + i * 0.0436, 1.085, 0.165],
      m.paper,
      0.002,
    );
    keys.push(key);
    if (![2, 6].includes(i % 7))
      box(
        instrument,
        [0.023, 0.028, 0.14],
        [-0.565 + i * 0.0436, 1.11, 0.104],
        m.black,
        0.002,
      );
  }
  flourish(instrument, [0, 0.99, 0.35], 0.76, m);
  let playing = 0,
    lidOpen = true;
  register(instrument, "小型羽管键琴", "轻奏琴键", () => {
    playing = 1;
    return "琴键轻落 · 余韵如月光";
  });
  register(lidPivot, "羽管键琴琴盖", "打开 / 合上", () => {
    lidOpen = !lidOpen;
    return lidOpen ? "琴盖展开" : "琴盖合拢";
  });
  const bench = table([-3.31, 0, 0.9], 0.9, 0.58, 0.44);
  box(bench, [0.83, 0.14, 0.52], [0, 0.545, 0], m.velvet, 0.07);
  for (const x of [-0.25, 0, 0.25])
    sphere(bench, [0.018, 0.008, 0.018], [x, 0.619, 0], m.gold);
  touch(bench, "琴凳", "静坐聆听 · 片刻安宁");

  box(root, [5.25, 0.043, 4.24], [0.18, 0.054, 1.75], m.rug, 0.018);
  const chaise = group(root, [-0.74, 0, 3.01]);
  chaise.rotation.y = 0.12;
  for (const x of [-1.38, 1.38])
    for (const z of [-0.42, 0.42]) cabriole(chaise, x, z, 0.35, m);
  box(chaise, [3.13, 0.2, 1.1], [0, 0.43, 0], m.wood, 0.14);
  box(chaise, [3.02, 0.22, 1.02], [0, 0.61, 0], m.velvet, 0.17);
  const high = box(
    chaise,
    [0.32, 1.07, 1.06],
    [-1.34, 1.02, 0],
    m.velvet,
    0.15,
  );
  high.rotation.z = -0.17;
  box(chaise, [2.37, 0.47, 0.18], [-0.31, 0.88, -0.45], m.velvet, 0.12);
  tube(
    chaise,
    [
      [-1.48, 0.63, 0.5],
      [-1.54, 1.36, 0.48],
      [-1.28, 1.61, 0.36],
      [-1.12, 1.53, 0.02],
    ],
    0.045,
    m.gold,
  );
  tube(
    chaise,
    [
      [-1.45, 1.23, -0.51],
      [-0.9, 1.27, -0.51],
      [0.1, 1.11, -0.51],
      [0.98, 0.79, -0.51],
    ],
    0.038,
    m.gold,
  );
  for (const x of [-1.03, -0.63, -0.23, 0.17, 0.57, 0.97])
    for (const z of [-0.22, 0.22])
      sphere(chaise, [0.016, 0.009, 0.016], [x, 0.723, z], m.gold);
  flourish(chaise, [0, 0.42, 0.555], 1.4, m);
  const pillow = box(
    chaise,
    [0.54, 0.42, 0.19],
    [-0.8, 0.99, -0.1],
    m.silk,
    0.07,
  );
  pillow.rotation.z = -0.15;
  const drape = box(
    chaise,
    [0.51, 0.025, 0.95],
    [0.81, 0.742, 0.05],
    m.silk,
    0.018,
  );
  drape.rotation.y = 0.08;
  touch(chaise, "天鹅绒贵妃椅", "倚卧片刻 · 让夜晚慢下来");
  const round = group(root, [0.2, 0, 1.16]);
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    cabriole(round, Math.cos(a) * 0.52, Math.sin(a) * 0.52, 0.62, m);
  }
  cylinder(round, 0.8, 0.8, 0.095, [0, 0.71, 0], m.marble, 56);
  torus(round, 0.78, 0.025, [0, 0.658, 0], m.gold);
  flowers(round, [-0.2, 0.76, -0.11], 0.6);
  book(round, [0.3, 0.805, 0.21], 0.35, m.velvet);
  candleSet(round, [0.45, 0.76, -0.26], 0.55, "floorLamp", "圆桌烛台");
  touch(round, "大理石圆桌", "一杯茶 · 一段闲暇");
  const armchair = group(root, [2.73, 0, 1.83]);
  armchair.rotation.y = -0.95;
  for (const x of [-0.42, 0.42])
    for (const z of [-0.34, 0.34]) cabriole(armchair, x, z, 0.42, m);
  box(armchair, [1, 0.18, 0.9], [0, 0.54, 0], m.forest, 0.13);
  box(armchair, [0.9, 0.92, 0.2], [0, 0.99, -0.38], m.forest, 0.2);
  tube(
    armchair,
    [
      [-0.44, 0.68, -0.31],
      [-0.46, 1.32, -0.34],
      [0, 1.53, -0.36],
      [0.46, 1.32, -0.34],
      [0.44, 0.68, -0.31],
    ],
    0.035,
    m.gold,
  );
  for (const x of [-0.5, 0.5])
    tube(
      armchair,
      [
        [x, 0.57, 0.29],
        [x, 0.81, 0.34],
        [x, 0.9, -0.22],
      ],
      0.047,
      m.wood,
    );
  touch(armchair, "森林绿扶手椅", "坐看炉火 · 静享此刻");
  for (const [pos, scale] of [
    [[-4.14, 0, 4.03], 1.05],
    [[4.13, 0, 3.77], 1.18],
  ]) {
    const p = plant(root, pos, scale, m);
    touch(p, "沙龙绿植", "一抹绿色 · 松一口气");
  }
  for (const x of [-1.18, 1.79]) {
    const s = candleSet(root, [x, 2.2, -4.6], 0.65, "bedLamp", "古铜壁灯");
    flourish(root, [x, 2.25, -4.81], 0.46, m);
    tube(
      root,
      [
        [x, 2.22, -4.8],
        [x, 2.22, -4.6],
      ],
      0.028,
      m.gold,
    );
  }
  return {
    root,
    lamps,
    update(dt, t) {
      fireLight.intensity = damp(
        fireLight.intensity,
        fireOn ? 3.5 + Math.sin(t * 4) * 0.15 : 0,
        dt,
      );
      flames.forEach((f, i) => {
        f.visible = fireOn;
        f.scale.y =
          (0.15 + (i % 3) * 0.04) * (1 + Math.sin(t * 5 + i * 2) * 0.18);
      });
      lamps.forEach((l) =>
        l.flames.forEach((f, i) => {
          f.material.opacity = damp(
            f.material.opacity,
            store.state[l.key] ? 0.88 : 0,
            dt,
          );
          f.scale.y = 0.044 * (1 + Math.sin(t * 4 + i) * 0.07);
        }),
      );
      playing = damp(playing, 0, dt, 0.9);
      keys.forEach((key, i) => {
        key.position.y =
          1.085 - Math.max(0, Math.sin(t * 9 + i * 0.8)) * playing * 0.014;
      });
      lidPivot.rotation.z = damp(
        lidPivot.rotation.z,
        lidOpen ? 0.58 : 0,
        dt,
        2,
      );
      doors.forEach(
        (d) => (d.rotation.y = damp(d.rotation.y, cabinetOpen ? -1 : 0, dt, 3)),
      );
      drawer.position.z = damp(
        drawer.position.z,
        store.state.drawer ? 0.79 : 0.51,
        dt,
        3,
      );
      for (const p of pulses) {
        p.v = damp(p.v, 0, dt, 3);
        p.obj.position.y = p.y + Math.sin(p.v * Math.PI) * 0.015;
      }
    },
    reset() {
      fireOn = true;
      playing = 0;
      lidOpen = true;
      cabinetOpen = false;
      for (const p of pulses) {
        p.v = 0;
        p.obj.position.y = p.y;
      }
    },
  };
}
