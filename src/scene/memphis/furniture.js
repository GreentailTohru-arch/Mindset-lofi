import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import { pottery, books, plant, trailing } from "../dongfang/details.js";
import { damp } from "../../state.js";
export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "memphis-furniture";
  const lamps = [],
    motions = [],
    doors = [];
  const named = (o, n) => ((o.name = "memphis-" + n), o);
  function touch(o, name, message, action) {
    const e = { o, y: o.position.y, t: 1 };
    motions.push(e);
    register(o, name, "轻触互动", () => {
      e.t = 0;
      return action ? action() : message;
    });
    return o;
  }
  function cup(p, pos) {
    const g = pottery(p, pos, 0.38, m.white, "bowl");
    torus(g, 0.068, 0.016, [0.078, 0.041, 0], m.white, [0, 0, 0]);
    return g;
  }
  function pillow(p, pos, mat, w = 0.55) {
    const q = box(p, [w, 0.52, 0.18], pos, mat, 0.085);
    q.rotation.x = -0.12;
    return q;
  }
  function lamp(p, pos, mat, key = "bedLamp", power = 0, ball = false) {
    const g = group(p, pos);
    cylinder(g, 0.12, 0.15, 0.035, [0, 0.019, 0], mat);
    cylinder(g, 0.03, 0.038, 0.26, [0, 0.16, 0], mat);
    const shade = m.glow.clone();
    shade.color.copy(mat.color);
    shade.emissive.copy(mat.color);
    const o = sphere(
      g,
      ball ? [0.2, 0.2, 0.2] : [0.23, 0.15, 0.23],
      [0, 0.43, 0],
      mat,
    );
    sphere(g, [0.14, 0.055, 0.14], [0, 0.34, 0], shade).castShadow = false;
    if (ball) o.material = shade;
    root.updateMatrixWorld(true);
    lamps.push({
      shade,
      key,
      power,
      pos: g.localToWorld(new THREE.Vector3(0, 0.36, 0)).toArray(),
    });
    touch(g, "彩色几何台灯", "", () => {
      store.set(key, !store.state[key]);
      return "彩色灯光轻轻变化。";
    });
    return g;
  }
  function arch(p, pos, w, h, mat) {
    const g = group(p, pos),
      shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(-w / 2, h - w / 2);
    shape.absarc(0, h - w / 2, w / 2, Math.PI, 0, true);
    shape.lineTo(w / 2, 0);
    shape.lineTo(w * 0.22, 0);
    shape.lineTo(w * 0.22, h - w / 2);
    shape.absarc(0, h - w / 2, w * 0.22, 0, Math.PI, false);
    shape.lineTo(-w * 0.22, 0);
    shape.closePath();
    const mesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelSize: 0.015,
        bevelThickness: 0.015,
        bevelSegments: 2,
      }),
      mat,
    );
    mesh.castShadow = mesh.receiveShadow = true;
    g.add(mesh);
    return g;
  }
  function triangle(p, pos, w, h, mat) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(0, h);
    s.closePath();
    const o = new THREE.Mesh(
      new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false }),
      mat,
    );
    o.position.set(...pos);
    o.castShadow = true;
    p.add(o);
    return o;
  }
  // Left window bench: yellow seat, coral drawers and checkerboard storage.
  const bench = named(group(root, [-4.38, 0.025, 0.78]), "window-bench");
  bench.rotation.y = Math.PI / 2;
  box(bench, [3.92, 0.45, 0.7], [0, 0.26, 0], m.white, 0.025);
  box(bench, [4.08, 0.1, 0.8], [0, 0.535, 0], m.teal, 0.025);
  for (const x of [-1, 1])
    box(bench, [1.9, 0.15, 0.75], [x, 0.66, 0], m.yellowFabric, 0.07);
  box(bench, [0.12, 0.62, 0.83], [-2.02, 0.33, 0], m.teal, 0.025);
  for (const [x, mat] of [
    [-1, m.check],
    [1, m.coral],
  ]) {
    const d = group(bench, [x, 0.3, 0.375]);
    box(d, [1.85, 0.39, 0.04], [0, 0, 0], mat, 0.012);
    sphere(d, [0.035, 0.035, 0.026], [0.58, 0.025, 0.05], m.black);
    doors.push({ o: d, base: 0.375 });
    register(d, "彩色窗边抽屉", "拉开 / 合上", () => {
      store.set("drawer", !store.state.drawer);
      return "收好随手的小物。";
    });
  }
  pillow(bench, [-0.9, 0.97, -0.21], m.check, 0.62);
  sphere(bench, [0.25, 0.22, 0.15], [1.35, 0.9, -0.1], m.pinkFabric);
  touch(bench, "组合窗边长凳", "坐在城市色彩的旁边。");
  const pedestal = group(root, [-4.2, 0.03, 3.5]);
  cylinder(pedestal, 0.29, 0.32, 0.62, [0, 0.31, 0], m.dots);
  lamp(pedestal, [0, 0.62, 0], m.blue, "floorLamp", 1.4, true);
  // Rear modular storage. Round holes and diagonal dividers are real geometry.
  const shelf = named(group(root, [-3, 0.025, -4.45]), "modular-bookcase");
  const colors = [m.teal, m.pink, m.yellow, m.blue, m.black, m.white];
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 3; col++) {
      const x = (col - 1) * 0.83,
        y = 0.14 + row * 0.82,
        k = row * 3 + col,
        g = group(shelf, [x, y, 0]),
        mat = colors[(k + row) % 6];
      box(
        g,
        [0.79, 0.77, 0.045],
        [0, 0.385, -0.34],
        k % 3 === 0 ? m.black : mat,
      );
      for (const xx of [-0.4, 0.4])
        box(g, [0.052, 0.82, 0.73], [xx, 0.41, 0], mat);
      for (const yy of [0, 0.8]) box(g, [0.85, 0.052, 0.77], [0, yy, 0], mat);
      if (k === 0 || k === 7) {
        const s = new THREE.Shape();
        s.moveTo(-0.37, 0.025);
        s.lineTo(0.37, 0.025);
        s.lineTo(0.37, 0.77);
        s.lineTo(-0.37, 0.77);
        s.closePath();
        const h = new THREE.Path();
        h.absarc(0, 0.4, 0.235, 0, Math.PI * 2, true);
        s.holes.push(h);
        const panel = new THREE.Mesh(
          new THREE.ExtrudeGeometry(s, { depth: 0.047, bevelEnabled: false }),
          k === 0 ? m.yellow : m.pink,
        );
        panel.position.z = 0.37;
        panel.castShadow = true;
        g.add(panel);
      } else if (k === 4 || k === 10) {
        box(
          g,
          [0.056, 0.94, 0.68],
          [0, 0.4, 0],
          k === 4 ? m.yellow : m.pink,
        ).rotation.z = -0.66;
        triangle(g, [-0.1, 0.04, 0.15], 0.35, 0.4, m.blue);
      } else if (k === 2) {
        box(g, [0.53, 0.53, 0.52], [0, 0.292, 0.02], m.check, 0.02);
      } else if (k === 5) {
        box(g, [0.71, 0.68, 0.05], [0, 0.4, 0.35], m.dots);
      } else if (k === 8 || k === 9) {
        books(g, [-0.27, 0.035, 0], m, 4, true);
        sphere(g, [0.15, 0.15, 0.15], [0.23, 0.2, 0.09], m.blue);
      } else if (k === 1) {
        const cross = group(g, [0, 0.33, 0.07]);
        box(cross, [0.58, 0.09, 0.1], [0, 0, 0], m.red).rotation.z = 0.65;
        box(cross, [0.58, 0.09, 0.1], [0, 0, 0], m.red).rotation.z = -0.65;
      } else pottery(g, [0, 0.035, 0], 0.76, m.white);
    }
  arch(shelf, [-0.75, 3.45, 0], 0.38, 0.53, m.pink);
  trailing(shelf, [0.81, 3.44, 0.06], m, 1.03);
  plant(shelf, [0.02, 3.44, 0], { ...m, clay: m.pink }, 0.38);
  touch(shelf, "孟菲斯模块书架", "每一个格子，都有不同的形状。");
  // Back desk, round chair, primary-color artwork and sideboard.
  const desk = named(group(root, [0.13, 0.025, -3.95]), "red-writing-desk");
  box(desk, [2.52, 0.105, 1.02], [0, 1.1, 0], m.red, 0.045);
  for (const x of [-1.09, 1.09])
    tube(
      desk,
      [
        [x, 1.04, -0.4],
        [x, 0.13, -0.4],
        [x, 0.075, 0.43],
        [x, 1.04, 0.43],
      ],
      0.035,
      m.chrome,
    );
  for (const sign of [-1, 1])
    box(
      desk,
      [0.28, 0.02, 0.4],
      [sign * 0.146, 1.168, 0.07],
      m.paper,
      0.004,
    ).rotation.z = -sign * 0.06;
  lamp(desk, [-0.84, 1.158, -0.13], m.yellow, "bedLamp", 1.8);
  cylinder(desk, 0.075, 0.075, 0.22, [0.82, 1.27, -0.2], m.stripe);
  for (let i = 0; i < 6; i++)
    cylinder(
      desk,
      0.009,
      0.009,
      0.34,
      [0.785 + (i % 3) * 0.03, 1.34, -0.23 + Math.floor(i / 3) * 0.035],
      colors[i],
      8,
    ).rotation.z = (i - 2) * 0.07;
  const chair = named(group(root, [0.13, 0.025, -2.94]), "desk-chair");
  chair.rotation.y = Math.PI;
  for (const x of [-0.36, 0.36])
    tube(
      chair,
      [
        [x, 0.59, -0.34],
        [x, 0.06, -0.34],
        [x, 0.06, 0.42],
        [x, 0.59, 0.42],
      ],
      0.026,
      m.chrome,
    );
  box(chair, [0.8, 0.12, 0.77], [0, 0.6, 0], m.black, 0.1);
  tube(
    chair,
    [
      [0, 0.5, -0.35],
      [0, 1.16, -0.4],
    ],
    0.028,
    m.chrome,
  );
  const back = cylinder(chair, 0.32, 0.32, 0.095, [0, 1.13, -0.41], m.blue, 48);
  back.rotation.x = Math.PI / 2;
  const circle = sphere(chair, [0.2, 0.2, 0.04], [0.35, 0.29, 0.26], m.coral);
  touch(chair, "蓝色圆背椅", "圆与直线的小游戏。");
  const sideboard = named(
    group(root, [3.3, 0.025, -4.31]),
    "geometric-sideboard",
  );
  for (const x of [-1.29, 1.29])
    for (const z of [-0.26, 0.26])
      cylinder(sideboard, 0.03, 0.04, 0.21, [x, 0.105, z], m.black, 12);
  box(sideboard, [2.88, 0.75, 0.75], [0, 0.63, 0], m.pink, 0.025);
  box(sideboard, [3.04, 0.09, 0.85], [0, 1.045, 0], m.pink, 0.02);
  for (const [x, y, mat] of [
    [-0.94, 0.82, m.blue],
    [-0.94, 0.44, m.yellow],
  ]) {
    box(sideboard, [0.89, 0.34, 0.05], [x, y, 0.4], mat, 0.012);
    sphere(sideboard, [0.03, 0.03, 0.03], [x, y, 0.445], m.black);
  }
  const door = group(sideboard, [-0.48, 0.63, 0.412]);
  box(door, [1.91, 0.72, 0.05], [0.955, 0, 0], m.check);
  doors.push({ o: door, hinge: true });
  register(door, "棋盘格边柜门", "打开 / 合上", () => {
    store.set("wardrobe", !store.state.wardrobe);
    return "棋盘格柜门轻轻打开。";
  });
  lamp(sideboard, [-1, 1.09, 0], m.pink, "floorLamp", 1.5, true);
  triangle(sideboard, [-0.43, 1.09, 0.07], 0.35, 0.51, m.dots);
  arch(sideboard, [0.35, 1.09, 0], 0.44, 0.42, m.blue);
  plant(sideboard, [1.06, 1.09, 0], { ...m, clay: m.yellow }, 0.4);
  books(sideboard, [0.02, 1.09, 0.08], m, 2);
  touch(sideboard, "彩色组合边柜", "不对称，也可以很有秩序。");
  const clock = named(group(root, [-1.42, 2.96, -4.8]), "color-disc-clock");
  const face = cylinder(clock, 0.53, 0.53, 0.06, [0, 0, 0], m.black, 64);
  face.rotation.x = Math.PI / 2;
  for (let i = 0; i < 3; i++) {
    const q = new THREE.Mesh(
      new THREE.CircleGeometry(
        0.495,
        48,
        (i * Math.PI * 2) / 3,
        (Math.PI * 2) / 3,
      ),
      [m.pink, m.yellow, m.blue][i],
    );
    q.position.z = 0.036;
    clock.add(q);
  }
  tube(
    clock,
    [
      [0, 0, 0.07],
      [-0.24, 0.26, 0.07],
    ],
    0.016,
    m.black,
  );
  tube(
    clock,
    [
      [0, 0, 0.07],
      [0.26, 0.15, 0.07],
    ],
    0.014,
    m.black,
  );
  sphere(clock, [0.035, 0.035, 0.025], [0, 0, 0.075], m.black);
  tube(
    root,
    [
      [-1.99, 2.08, -4.8],
      [-1.8, 2.21, -4.8],
      [-1.6, 2.03, -4.8],
      [-1.38, 2.2, -4.8],
      [-1.16, 2.03, -4.8],
      [-0.99, 2.16, -4.8],
    ],
    0.04,
    m.blue,
  );
  // Wavy floor lamp placed behind the sofa, clear of the writing chair.
  const floorLight = named(
    group(root, [-1.53, 0.025, -3.59]),
    "wavy-floor-lamp",
  );
  cylinder(floorLight, 0.04, 0.25, 0.29, [0, 0.145, 0], m.red);
  const ps = [];
  for (let i = 0; i <= 30; i++)
    ps.push([
      Math.sin((i / 30) * Math.PI * 6) * 0.068,
      0.28 + (i / 30) * 1.7,
      0,
    ]);
  tube(floorLight, ps, 0.031, m.black);
  const glow = m.glow.clone();
  sphere(floorLight, [0.2, 0.2, 0.2], [0, 2.1, 0], glow).castShadow = false;
  lamps.push({
    shade: glow,
    key: "floorLamp",
    power: 1.5,
    pos: [-1.53, 2.12, -3.59],
  });
  touch(floorLight, "波浪落地灯", "", () => {
    store.set("floorLamp", !store.state.floorLamp);
    return "弯弯曲曲，也有温柔的光。";
  });
  // Sofa reads left-to-right as teal, yellow, pink, capped by coral round arms.
  const sofa = named(group(root, [0.06, 0.03, -0.35]), "colorblock-sofa");
  for (const x of [-1.79, 1.79])
    for (const z of [-0.47, 0.47])
      cylinder(sofa, 0.045, 0.045, 0.1, [x, 0.05, z], m.black, 12);
  for (const [i, mat] of [
    m.tealFabric,
    m.yellowFabric,
    m.pinkFabric,
  ].entries()) {
    const x = (i - 1) * 1.26;
    box(sofa, [1.28, 0.4, 1.57], [x, 0.34, 0], mat, 0.15);
    box(sofa, [1.25, 0.2, 1.27], [x, 0.6, 0.05], mat, 0.09);
    box(sofa, [1.28, 0.67, 0.29], [x, 0.9, -0.64], mat, 0.13);
  }
  for (const [x, mat] of [
    [-1.97, m.tealFabric],
    [1.97, m.coralFabric],
  ]) {
    box(sofa, [0.33, 0.49, 1.49], [x, 0.57, 0], mat, 0.15);
    const arm = cylinder(sofa, 0.21, 0.21, 1.4, [x, 0.86, -0.04], mat, 48);
    arm.rotation.x = Math.PI / 2;
    const cap = cylinder(
      sofa,
      0.207,
      0.207,
      0.02,
      [x, 0.86, 0.67],
      m.coralFabric,
      48,
    );
    cap.rotation.x = Math.PI / 2;
  }
  pillow(sofa, [-1.01, 0.98, -0.37], m.check, 0.62);
  pillow(sofa, [-0.29, 0.98, -0.37], m.squiggle, 0.59);
  sphere(sofa, [0.27, 0.27, 0.11], [0.45, 0.93, -0.25], m.blueFabric);
  sphere(sofa, [0.23, 0.23, 0.11], [1.2, 0.91, -0.29], m.pinkFabric);
  touch(sofa, "撞色模块沙发", "青绿、明黄、粉红，拼成一个午后。");
  const rug = named(group(root, [0.15, 0.043, 2.13]), "geometric-rug");
  box(rug, [5.7, 0.028, 4.78], [0, 0, 0], m.rug, 0.075);
  rug.rotation.y = -0.035;
  const coffee = named(group(root, [0.13, 0.07, 1.82]), "red-organic-table");
  const outline = new THREE.Shape();
  outline.moveTo(-1.4, -0.4);
  outline.bezierCurveTo(-1.52, -0.95, -0.64, -0.84, -0.22, -0.68);
  outline.bezierCurveTo(0.26, -0.48, 0.94, -0.97, 1.3, -0.5);
  outline.bezierCurveTo(1.6, -0.04, 1.01, 0.19, 1.17, 0.51);
  outline.bezierCurveTo(0.91, 0.99, 0.29, 0.52, -0.15, 0.61);
  outline.bezierCurveTo(-0.8, 0.83, -1.52, 0.2, -1.4, -0.4);
  outline.closePath();
  const top = new THREE.Mesh(
    new THREE.ExtrudeGeometry(outline, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSize: 0.034,
      bevelThickness: 0.025,
      bevelSegments: 3,
      curveSegments: 36,
    }),
    m.red,
  );
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.65;
  top.castShadow = top.receiveShadow = true;
  coffee.add(top);
  cylinder(coffee, 0.13, 0.13, 0.65, [-0.85, 0.325, 0.17], m.blue);
  sphere(coffee, [0.24, 0.2, 0.24], [-0.09, 0.2, -0.24], m.black);
  cylinder(coffee, 0.09, 0.12, 0.28, [-0.09, 0.48, -0.24], m.black);
  const leg = [];
  for (let i = 0; i <= 16; i++)
    leg.push([
      0.79 + Math.sin((i / 16) * Math.PI * 4) * 0.065,
      0.06 + (i / 16) * 0.56,
      0.19,
    ]);
  tube(coffee, leg, 0.098, m.yellow);
  books(coffee, [-0.15, 0.787, 0.05], m, 2);
  box(coffee, [0.4, 0.055, 0.32], [-0.15, 0.945, 0.05], m.blue, 0.004);
  cup(coffee, [0.23, 0.787, 0.38]);
  pottery(coffee, [-0.77, 0.787, -0.16], 0.63, m.stripe);
  plant(coffee, [-0.77, 1.05, -0.16], { ...m, clay: m.stripe }, 0.37);
  cylinder(coffee, 0.095, 0.12, 0.22, [0.76, 0.91, -0.07], m.teal);
  sphere(coffee, [0.09, 0.09, 0.09], [0.76, 1.11, -0.07], m.pink);
  touch(coffee, "红色波浪茶几", "不规则的曲线，盛着规律的小日子。");
  // Foreground chair pair: tubular teal on the left, coral barrel on the right.
  const left = named(group(root, [-2.74, 0.03, 1.9]), "teal-tube-chair");
  left.rotation.y = 2.05;
  for (const x of [-0.55, 0.55])
    tube(
      left,
      [
        [x, 0.58, -0.49],
        [x, 0.07, -0.49],
        [x, 0.065, 0.5],
        [x, 0.81, 0.5],
        [x, 0.94, -0.47],
      ],
      0.032,
      m.chrome,
    );
  box(left, [1.01, 0.2, 1], [0, 0.59, 0], m.tealFabric, 0.11);
  box(left, [1, 0.46, 0.2], [0, 0.99, -0.42], m.tealFabric, 0.09);
  pillow(left, [0, 0.93, -0.26], m.check, 0.55);
  touch(left, "青绿镀铬管椅", "一条钢管，弯出舒服的角落。");
  const right = named(group(root, [3.19, 0.03, 1.94]), "coral-armchair");
  right.rotation.y = -1.91;
  cylinder(right, 0.5, 0.5, 0.09, [0, 0.045, 0], m.black, 48);
  sphere(right, [0.65, 0.36, 0.64], [0, 0.4, 0], m.coralFabric);
  sphere(right, [0.48, 0.15, 0.49], [0, 0.65, 0.1], m.coralFabric);
  const shape = new THREE.Shape();
  const outer = 0.68,
    inner = 0.48;
  shape.absarc(0, 0, outer, Math.PI * 0.03, Math.PI * 0.97, false);
  shape.absarc(0, 0, inner, Math.PI * 0.97, Math.PI * 0.03, true);
  shape.closePath();
  const shell = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, {
      depth: 0.68,
      bevelEnabled: true,
      bevelSize: 0.06,
      bevelThickness: 0.06,
      bevelSegments: 3,
      curveSegments: 40,
    }),
    m.coralFabric,
  );
  shell.rotation.x = Math.PI / 2;
  shell.position.y = 1.07;
  right.add(shell);
  shell.castShadow = shell.receiveShadow = true;
  const line = [];
  for (let i = 0; i <= 40; i++) {
    const a = Math.PI * 0.03 + (i / 40) * Math.PI * 0.94;
    line.push([Math.cos(a) * 0.7, 1.08, -Math.sin(a) * 0.7]);
  }
  tube(right, line, 0.018, m.black);
  touch(right, "珊瑚红扶手椅", "圆润的色彩，也能拥抱你。");
  const side = named(group(root, [-1.99, 0.03, 3.34]), "checker-side-table");
  box(side, [0.65, 0.055, 0.65], [0, 0.028, 0], m.black, 0.008);
  cylinder(side, 0.16, 0.16, 0.59, [0, 0.34, 0], m.pink);
  cylinder(side, 0.47, 0.47, 0.065, [0, 0.67, 0], m.check, 64);
  lamp(side, [0, 0.709, 0], m.blue, "floorLamp", 0, true);
  touch(side, "棋盘格圆桌", "黑白之间，添一抹粉。");
  const pouf = named(group(root, [2.16, 0.03, 3.83]), "striped-pouf");
  for (let i = 0; i < 12; i++) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.57,
        12,
        12,
        (i * Math.PI) / 6,
        Math.PI / 6,
        0,
        Math.PI,
      ),
      [m.blueFabric, m.yellowFabric, m.pinkFabric, m.white][i % 4],
    );
    mesh.scale.y = 0.75;
    mesh.position.y = 0.43;
    mesh.castShadow = mesh.receiveShadow = true;
    pouf.add(mesh);
  }
  cylinder(pouf, 0.42, 0.45, 0.035, [0, 0.78, 0], m.dots, 48);
  touch(pouf, "彩色条纹坐墩", "把缤纷放在脚边。");
  plant(root, [-3.88, 0.03, -2.73], { ...m, clay: m.blue }, 1.24);
  plant(root, [4.34, 0.03, -3.2], { ...m, clay: m.blue }, 1.02);
  plant(root, [-4.48, 0.03, 4.22], { ...m, clay: m.dots }, 0.59);
  return {
    root,
    lamps,
    update(dt) {
      for (const e of motions) {
        e.t = Math.min(1, e.t + dt * 1.9);
        e.o.position.y = e.y + Math.sin(e.t * Math.PI) * 0.026;
      }
      for (const d of doors) {
        if (d.hinge)
          d.o.rotation.y = damp(
            d.o.rotation.y,
            store.state.wardrobe ? -1.05 : 0,
            dt,
            3,
          );
        else
          d.o.position.z = damp(
            d.o.position.z,
            d.base + (store.state.drawer ? 0.29 : 0),
            dt,
            3,
          );
      }
    },
    reset() {
      for (const e of motions) {
        e.t = 1;
        e.o.position.y = e.y;
      }
      for (const d of doors) {
        if (d.hinge) d.o.rotation.y = 0;
        else d.o.position.z = d.base;
      }
    },
  };
}
