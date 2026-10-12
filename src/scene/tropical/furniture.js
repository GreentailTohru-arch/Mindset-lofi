import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import {
  pottery,
  books,
  plant,
  trailing as baseTrailing,
  branches,
} from "../dongfang/details.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "tropical-furniture";
  const lamps = [],
    motions = [];
  const smallLeafGeometry = new THREE.SphereGeometry(1, 10, 7);
  function trailing(parent, pos, materials, scale = 1) {
    const g = baseTrailing(parent, pos, materials, scale);
    const cluster = new THREE.InstancedMesh(
      smallLeafGeometry,
      materials.leaf,
      50,
    );
    const d = new THREE.Object3D();
    for (let i = 0; i < 50; i++) {
      const a = i * 2.399,
        hanging = i > 25;
      d.position.set(
        Math.cos(a) * (hanging ? 0.15 : 0.25),
        hanging ? 0.1 - (i - 25) * 0.035 : 0.17 + Math.sin(i * 3.1) * 0.12,
        Math.sin(a) * (hanging ? 0.09 : 0.2) + (hanging ? 0.2 : 0),
      );
      d.scale.set(0.066, 0.085, 0.018);
      d.rotation.set(0.3, a, Math.sin(a) * 0.6);
      d.updateMatrix();
      cluster.setMatrixAt(i, d.matrix);
    }
    cluster.castShadow = cluster.receiveShadow = true;
    g.add(cluster);
    return g;
  }
  function touch(o, name, message, action) {
    const e = { o, y: o.position.y, t: 1 };
    motions.push(e);
    register(o, name, "轻触互动", () => {
      e.t = 0;
      return action ? action() : message;
    });
    return o;
  }
  function cup(parent, pos) {
    const g = pottery(parent, pos, 0.39, m.ceramic, "bowl");
    torus(g, 0.1, 0.02, [0.21, 0.09, 0], m.ceramic, [0, 0, 0]);
    cylinder(g, 0.15, 0.15, 0.008, [0, 0.14, 0], m.soil);
    return g;
  }
  function candle(parent, pos) {
    const g = group(parent, pos),
      shade = m.glow.clone();
    cylinder(g, 0.09, 0.095, 0.016, [0, 0.008, 0], m.bronze);
    cylinder(g, 0.057, 0.06, 0.2, [0, 0.11, 0], m.paper);
    sphere(g, [0.019, 0.043, 0.019], [0, 0.25, 0], shade);
    lamps.push({ shade, key: "bedLamp", power: 0, pos: [0, 0, 0] });
    touch(g, "小蜡烛", "", () => {
      store.set("bedLamp", !store.state.bedLamp);
      return "烛光轻轻变化。";
    });
    return g;
  }
  function basket(parent, pos, w = 0.62, h = 0.4, d = 0.45) {
    const g = group(parent, pos);
    box(g, [w, h, d], [0, h / 2, 0], m.woven, 0.035);
    box(g, [w - 0.05, 0.01, d - 0.05], [0, h, 0], m.dark, 0.02);
    for (let y = 0.025; y < h; y += 0.035)
      box(g, [w + 0.008, 0.007, d + 0.008], [0, y, 0], m.taupe, 0.013);
    for (let x = -w / 2 + 0.035; x < w / 2; x += 0.06)
      for (const z of [-d / 2 - 0.007, d / 2 + 0.007])
        box(g, [0.008, h, 0.009], [x, h / 2, z], m.woven);
    box(g, [0.15, 0.05, 0.016], [0, h * 0.67, d / 2 + 0.014], m.dark, 0.018);
    return g;
  }
  function pad(parent, pos, w, d, mat = m.pattern) {
    return box(parent, [w, 0.14, d], pos, mat, 0.075);
  }
  function pillow(parent, pos, mat, w = 0.55) {
    const p = box(parent, [w, 0.49, 0.19], pos, mat, 0.085);
    p.rotation.x = -0.16;
    p.rotation.z = pos[0] * 0.08;
    return p;
  }
  function table(parent, pos, w, d, h) {
    const g = group(parent, pos);
    box(g, [w, 0.14, d], [0, h - 0.07, 0], m.wood, 0.025);
    for (const x of [-w / 2 + 0.14, w / 2 - 0.14])
      for (const z of [-d / 2 + 0.14, d / 2 - 0.14]) {
        cylinder(g, 0.075, 0.075, h - 0.14, [x, (h - 0.14) / 2, z], m.wood, 12);
        for (const y of [0.1, h - 0.22])
          sphere(g, [0.11, 0.085, 0.11], [x, y, z], m.wood);
      }
    for (const z of [-d / 2 + 0.065, d / 2 - 0.065])
      box(g, [w - 0.13, 0.19, 0.07], [0, h - 0.23, z], m.dark, 0.013);
    return g;
  }
  function rug(pos, w, d, material, rotation = 0) {
    const g = group(root, pos);
    g.rotation.y = rotation;
    box(g, [w, 0.025, d], [0, 0, 0], material, 0.015);
    for (const z of [-d / 2, d / 2])
      for (let x = -w / 2 + 0.04; x < w / 2; x += 0.08)
        box(g, [0.016, 0.012, 0.13], [x, 0, z + Math.sign(z) * 0.04], m.taupe);
    return g;
  }
  function drape(parent, pos, width, material) {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.13, -0.5),
      new THREE.Vector3(0, 1.2, -0.33),
      new THREE.Vector3(0, 0.62, 0.05),
      new THREE.Vector3(0, 0.62, 0.63),
      new THREE.Vector3(0, 0.08, 0.76),
    ]);
    const geo = new THREE.PlaneGeometry(width, 1, 22, 40),
      a = geo.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i),
        p = path.getPoint(0.5 - a.getY(i)),
        r = Math.sin(x * 65 + p.z * 5) * 0.02;
      a.setXYZ(i, x, p.y + r, p.z + r * 0.25);
    }
    geo.computeVertexNormals();
    const mat = material.clone();
    mat.side = THREE.DoubleSide;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.position.set(...pos);
    parent.add(mesh);
    for (let i = 0; i < 22; i++)
      tube(
        parent,
        [
          [pos[0] - width / 2 + (i * width) / 22, pos[1] + 0.09, pos[2] + 0.76],
          [pos[0] - width / 2 + (i * width) / 22, pos[1] + 0.015, pos[2] + 0.8],
        ],
        0.004,
        material,
      );
  }
  function rattanChair(pos, angle = 0, scale = 1) {
    const g = group(root, pos);
    g.rotation.y = angle;
    g.scale.setScalar(scale);
    for (const x of [-0.43, 0.43])
      for (const z of [-0.4, 0.4])
        tube(
          g,
          [
            [x * 1.16, 0.02, z * 1.13],
            [x, 0.61, z],
          ],
          0.034,
          m.lightWood,
        );
    box(g, [0.97, 0.1, 0.93], [0, 0.56, 0], m.woven, 0.12);
    pad(g, [0, 0.67, 0], 0.86, 0.81, m.linen);
    const back = box(g, [0.98, 0.73, 0.06], [0, 1.03, -0.42], m.woven, 0.1);
    back.rotation.x = -0.12;
    for (let i = 0; i < 17; i++) {
      const x = -0.43 + i * 0.054;
      tube(
        g,
        [
          [x, 0.68, -0.38],
          [x, 1.03, -0.43],
          [x, 1.39, -0.49],
        ],
        0.012,
        m.lightWood,
      );
    }
    for (let i = 0; i < 10; i++)
      tube(
        g,
        [
          [-0.46, 0.72 + i * 0.065, -0.4 - i * 0.008],
          [0, 0.72 + i * 0.065, -0.4 - i * 0.008],
          [0.46, 0.72 + i * 0.065, -0.4 - i * 0.008],
        ],
        0.009,
        m.taupe,
      );
    for (const x of [-0.5, 0.5])
      tube(
        g,
        [
          [x, 0.56, 0.4],
          [x, 0.94, 0.27],
          [x, 1.05, -0.35],
        ],
        0.027,
        m.lightWood,
      );
    pillow(g, [0, 0.98, -0.22], m.pattern, 0.62);
    touch(g, "藤编休闲椅", "坐下，让时间慢一点。");
    return g;
  }
  function named(o, name) {
    o.name = "tropical-" + name;
    return o;
  }
  // Curved cane frames: the open slats reveal the pale linen inside.
  function lounge(pos, angle, name) {
    const g = named(group(root, pos), name);
    g.rotation.y = angle;
    g.scale.setScalar(1.16);
    for (const x of [-0.49, 0.49])
      for (const z of [-0.39, 0.39])
        tube(
          g,
          [
            [x * 1.14, 0, z * 1.15],
            [x, 0.6, z],
          ],
          0.036,
          m.lightWood,
        );
    const seat = cylinder(g, 0.61, 0.55, 0.1, [0, 0.56, 0], m.woven, 48);
    seat.scale.z = 0.9;
    const pad = sphere(g, [0.54, 0.12, 0.48], [0, 0.69, 0], m.linen);
    function arc(y, r) {
      const ps = [];
      for (let i = 0; i <= 36; i++) {
        const a = -Math.PI * 0.52 + (i / 36) * Math.PI * 1.04;
        ps.push([Math.sin(a) * r, y, -Math.cos(a) * r * 0.87]);
      }
      return ps;
    }
    tube(g, arc(1.23, 0.68), 0.03, m.lightWood);
    tube(g, arc(0.57, 0.59), 0.025, m.lightWood);
    for (let i = 0; i < 41; i++) {
      const a = -Math.PI * 0.52 + (i / 40) * Math.PI * 1.04;
      tube(
        g,
        [
          [Math.sin(a) * 0.59, 0.58, -Math.cos(a) * 0.51],
          [Math.sin(a) * 0.65, 0.92, -Math.cos(a) * 0.57],
          [Math.sin(a) * 0.68, 1.23, -Math.cos(a) * 0.592],
        ],
        0.012,
        m.lightWood,
      );
    }
    for (const y of [0.63, 0.74, 0.85, 1.08])
      tube(g, arc(y, 0.6 + (y - 0.6) * 0.125), 0.007, m.taupe);
    pillow(
      g,
      [0, 0.99, -0.34],
      name === "left-chair" ? m.rust : m.pattern,
      0.53,
    );
    touch(g, "圆弧藤编休闲椅", "藤编与亚麻，留一处松弛。");
    return g;
  }
  function wovenLight(parent, pos, scale = 1, pendant = false, power = 0) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    const shade = m.glow.clone();
    const glow = sphere(g, [0.17, 0.26, 0.17], [0, 0.36, 0], shade);
    glow.castShadow = false;
    const rad = (t) => 0.085 + 0.31 * Math.sin(Math.PI * t) ** 0.7;
    for (let i = 0; i < 42; i++) {
      const a = (i * Math.PI * 2) / 42,
        ps = [];
      for (let j = 0; j <= 16; j++) {
        const t = j / 16,
          r = rad(t);
        ps.push([Math.sin(a) * r, 0.06 + t * 0.67, Math.cos(a) * r]);
      }
      tube(g, ps, 0.008, m.lightWood);
    }
    for (let i = 0; i < 23; i++) {
      const t = i / 22;
      torus(g, rad(t), 0.006, [0, 0.06 + t * 0.67, 0], m.taupe);
    }
    cylinder(g, 0.083, 0.12, 0.07, [0, 0.765, 0], m.dark);
    if (pendant)
      tube(
        g,
        [
          [0, 0.79, 0],
          [0, 1.5, 0],
        ],
        0.01,
        m.dark,
      );
    else cylinder(g, 0.14, 0.15, 0.05, [0, 0.025, 0], m.wood);
    root.updateMatrixWorld(true);
    lamps.push({
      shade,
      key: "floorLamp",
      power,
      pos: g.localToWorld(new THREE.Vector3(0, 0.35, 0)).toArray(),
    });
    touch(g, pendant ? "藤编吊灯" : "藤编地灯", "", () => {
      store.set("floorLamp", !store.state.floorLamp);
      return "藤影之间，琥珀光轻轻变化。";
    });
    return g;
  }
  function tropicalPlant(parent, pos, scale = 1, palm = false) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    pottery(g, [0, 0, 0], 0.95, m.clay);
    for (let i = 0; i < 8; i++) {
      const a = i * 2.399,
        h = 1.05 + (i % 3) * 0.29,
        x = Math.sin(a) * 0.34,
        z = Math.cos(a) * 0.34;
      tube(
        g,
        [
          [0, 0.5, 0],
          [x * 0.4, h - 0.3, z * 0.4],
          [x, h, z],
        ],
        0.012,
        m.leaf,
      );
      if (palm) {
        for (let k = 0; k < 9; k++)
          for (const sign of [-1, 1]) {
            const t = k / 9;
            const leaf = sphere(
              g,
              [0.028, 0.2 * (1 - t) + 0.06, 0.012],
              [
                x + Math.sin(a) * t * 0.54 + Math.cos(a) * sign * 0.1,
                h + 0.17 - t * t * 0.25,
                z + Math.cos(a) * t * 0.54 - Math.sin(a) * sign * 0.1,
              ],
              m.leafLight,
            );
            leaf.rotation.set(0.6, a, sign * 0.65);
          }
      } else {
        const leaf = sphere(
          g,
          [0.16, 0.47, 0.025],
          [x, h + 0.24, z],
          i % 2 ? m.leaf : m.leafLight,
        );
        leaf.rotation.set(-0.3, a, Math.sin(a) * 0.52);
        tube(
          g,
          [
            [x, h - 0.1, z],
            [x, h + 0.63, z],
          ],
          0.005,
          m.leafLight,
        );
      }
    }
    return g;
  }
  function monsteraPlant(pos, scale = 1) {
    const monstera = group(root, pos);
    monstera.scale.setScalar(scale);
    pottery(monstera, [0, 0, 0], 0.85, m.clay);
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, -0.35);
    leafShape.bezierCurveTo(-0.2, -0.2, -0.31, 0.13, -0.21, 0.31);
    leafShape.bezierCurveTo(-0.09, 0.43, 0, 0.29, 0, 0.24);
    leafShape.bezierCurveTo(0.05, 0.42, 0.23, 0.44, 0.25, 0.25);
    leafShape.bezierCurveTo(0.31, 0.03, 0.12, -0.22, 0, -0.35);
    for (const sign of [-1, 1])
      for (let i = 0; i < 3; i++) {
        const hole = new THREE.Path();
        hole.absellipse(
          sign * (0.09 + i * 0.025),
          -0.08 + i * 0.12,
          0.019,
          0.055,
          0,
          Math.PI * 2,
          false,
          -sign * 0.45,
        );
        leafShape.holes.push(hole);
      }
    const leafGeometry = new THREE.ShapeGeometry(leafShape, 12);
    const broadMaterial = m.leaf.clone();
    broadMaterial.side = THREE.DoubleSide;
    for (let i = 0; i < 9; i++) {
      const a = i * 2.399,
        h = 0.97 + (i % 3) * 0.25,
        x = Math.sin(a) * 0.36,
        z = Math.cos(a) * 0.32;
      tube(
        monstera,
        [
          [0, 0.47, 0],
          [x * 0.5, h - 0.22, z * 0.5],
          [x, h, z],
        ],
        0.011,
        m.leaf,
      );
      const leaf = new THREE.Mesh(leafGeometry, broadMaterial);
      leaf.position.set(x, h + 0.25, z);
      leaf.rotation.set(-0.35, a, Math.sin(a) * 0.35);
      leaf.castShadow = leaf.receiveShadow = true;
      monstera.add(leaf);
    }
  }
  function flower(parent, pos, scale = 0.4) {
    const g = plant(parent, pos, m, scale);
    for (let i = 0; i < 3; i++) {
      const stem = group(g, [0.13 * i, 0.83 + 0.12 * i, 0]);
      tube(
        stem,
        [
          [0, 0, 0],
          [0.03, 0.48, 0],
        ],
        0.012,
        m.leaf,
      );
      const petal = sphere(stem, [0.045, 0.2, 0.032], [0.09, 0.5, 0], m.rust);
      petal.rotation.z = -1.05;
      sphere(
        stem,
        [0.018, 0.12, 0.025],
        [0.03, 0.55, 0],
        m.mustard,
      ).rotation.z = -0.3;
    }
    return g;
  }
  function caneFront(parent, pos, w, h) {
    const g = group(parent, pos);
    box(g, [w, h, 0.065], [0, 0, 0], m.wood, 0.012);
    box(g, [w - 0.12, h - 0.13, 0.015], [0, 0, 0.042], m.woven);
    return g;
  }
  function screen(x, y, w, h) {
    const g = group(root, [x, y, -4.82]);
    box(g, [w, h, 0.055], [0, 0, 0], m.dark);
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 3; j++) {
        const k = group(g, [
          -w * 0.3 + j * w * 0.3,
          -h * 0.4 + i * h * 0.13,
          0.04,
        ]);
        tube(
          k,
          [
            [0, -0.065, 0],
            [-0.07, 0, 0],
            [0, 0.065, 0],
            [0.07, 0, 0],
            [0, -0.065, 0],
          ],
          0.009,
          m.lightWood,
        );
      }
    return g;
  }
  // Background: a bookcase, writing area, then a long low cane-front console.
  const shelf = named(group(root, [-2.35, 0.025, -4.42]), "bookcase");
  box(shelf, [1.96, 2.8, 0.06], [0, 1.55, -0.31], m.dark);
  for (const x of [-1, 1])
    box(shelf, [0.12, 3.18, 0.8], [x, 1.62, 0], m.wood, 0.012);
  for (const y of [0.08, 0.91, 1.51, 2.1, 2.69, 3.24])
    box(shelf, [2.12, 0.09, 0.86], [0, y, 0], m.wood, 0.014);
  box(shelf, [0.075, 2.22, 0.7], [0, 2.08, 0], m.wood);
  const doors = [];
  for (const sign of [-1, 1]) {
    const pivot = group(shelf, [sign * 0.97, 0.5, 0.41]);
    const d = caneFront(pivot, [-sign * 0.46, 0, 0], 0.9, 0.73);
    sphere(d, [0.03, 0.04, 0.025], [-sign * 0.33, 0, 0.082], m.bronze);
    doors.push({ o: pivot, sign });
    register(pivot, "藤格收纳柜门", "打开 / 合上", () => {
      store.set("wardrobe", !store.state.wardrobe);
      return "藤格柜门轻轻转动。";
    });
  }
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 2; col++) {
      const x = -0.5 + col,
        y = 0.96 + row * 0.593;
      if ((row + col) % 3 === 0) {
        pottery(shelf, [x - 0.13, y, 0.03], 0.62, m.clay);
        pottery(shelf, [x + 0.2, y, 0.1], 0.4, m.celadon, "bowl");
      } else if ((row + col) % 3 === 1)
        books(shelf, [x - 0.27, y, 0.04], m, 5, true);
      else basket(shelf, [x, y, 0], 0.68, 0.35, 0.55);
    }
  trailing(shelf, [-0.8, 3.29, 0], m, 0.95);
  trailing(shelf, [0.75, 2.75, 0.25], m, 0.7);
  pottery(shelf, [0.45, 3.29, 0], 0.65, m.celadon);
  candle(shelf, [0.65, 1.56, 0.14]);
  touch(shelf, "柚木藏书架", "书与陶器，静候一个悠长午后。");
  const desk = named(
    table(root, [-0.08, 0.025, -4.13], 2.02, 0.96, 1.03),
    "writing-desk",
  );
  for (const sign of [-1, 1])
    box(
      desk,
      [0.29, 0.022, 0.4],
      [-0.17 + sign * 0.15, 1.049, 0.08],
      m.paper,
      0.005,
    ).rotation.z = -sign * 0.07;
  books(desk, [-0.74, 1.035, -0.11], m, 2);
  cup(desk, [0.38, 1.035, 0.16]);
  const task = group(desk, [0.72, 1.035, -0.16]);
  cylinder(task, 0.13, 0.16, 0.035, [0, 0.02, 0], m.bronze);
  cylinder(task, 0.025, 0.032, 0.4, [0, 0.23, 0], m.bronze);
  const dome = sphere(task, [0.23, 0.16, 0.23], [0, 0.52, 0], m.bronze);
  const taskShade = m.glow.clone();
  cylinder(task, 0.21, 0.21, 0.012, [0, 0.452, 0], taskShade).castShadow =
    false;
  root.updateMatrixWorld(true);
  lamps.push({
    shade: taskShade,
    key: "bedLamp",
    power: 2.3,
    pos: task.localToWorld(new THREE.Vector3(0, 0.4, 0)).toArray(),
  });
  touch(task, "黄铜书桌台灯", "", () => {
    store.set("bedLamp", !store.state.bedLamp);
    return "书桌亮起温柔的光。";
  });
  const deskChair = rattanChair([-0.08, 0.025, -2.98], Math.PI, 0.74);
  deskChair.name = "tropical-desk-chair";
  basket(root, [0.9, 0.025, -3.63], 0.48, 0.4, 0.52);
  const console = named(group(root, [3.05, 0.025, -4.37]), "cane-sideboard");
  for (const x of [-1.35, 1.35])
    for (const z of [-0.26, 0.26])
      box(console, [0.09, 0.18, 0.09], [x, 0.09, z], m.wood);
  box(console, [2.96, 0.89, 0.74], [0, 0.62, 0], m.dark, 0.013);
  box(console, [3.09, 0.12, 0.88], [0, 1.12, 0], m.wood, 0.015);
  for (let i = 0; i < 4; i++)
    caneFront(console, [-1.11 + i * 0.74, 0.62, 0.395], 0.68, 0.74);
  flower(console, [-1.1, 1.18, -0.06], 0.5);
  books(console, [-0.45, 1.18, 0.05], m, 3);
  pottery(console, [0.18, 1.18, 0.06], 0.69, m.stone, "bowl");
  pottery(console, [0.78, 1.18, -0.11], 0.53, m.celadon);
  candle(console, [1.16, 1.18, 0.1]);
  touch(console, "柚木藤格边柜", "天然木纹与手编藤格。");
  for (const x of [2.43, 3.62]) {
    const art = group(root, [x, 2.65, -4.8]);
    box(art, [1.09, 1.7, 0.075], [0, 0, 0], m.dark, 0.008);
    box(art, [0.99, 1.6, 0.012], [0, 0, 0.044], m.artwork);
  }
  for (const x of [1.63, 4.43]) screen(x, 2.72, 0.28, 1.93);
  for (const x of [-3.65, -0.65, 1.55]) {
    pottery(root, [x, 1.52, -4.92], 0.46, m.celadon);
    if (x !== -0.65) flower(root, [x, 1.52, -4.92], 0.32);
  }
  const wallDisc = cylinder(
    root,
    0.38,
    0.38,
    0.035,
    [-0.35, 2.78, -4.84],
    m.woven,
    48,
  );
  wallDisc.rotation.x = Math.PI / 2;
  // Left window bench and the planted threshold remain outside the seating route.
  const bench = named(group(root, [-4.3, 0.025, 1.02]), "window-bench");
  bench.rotation.y = Math.PI / 2;
  box(bench, [3.35, 0.4, 0.76], [0, 0.25, 0], m.wood, 0.025);
  box(bench, [3.5, 0.08, 0.86], [0, 0.49, 0], m.wood, 0.018);
  pad(bench, [0, 0.6, 0], 3.25, 0.72, m.linen);
  for (const x of [-1.15, 0, 1.15])
    basket(bench, [x, 0.07, 0.15], 0.9, 0.31, 0.52);
  pillow(bench, [-1.12, 0.86, -0.2], m.pattern);
  pillow(bench, [-0.43, 0.86, -0.2], m.taupe);
  pillow(bench, [1.12, 0.86, -0.2], m.rust);
  pottery(bench, [0.37, 0.68, 0.06], 0.4, m.celadon, "bowl");
  touch(bench, "柚木窗边长凳", "庭院水声，陪你慢下来。");
  tropicalPlant(root, [-4.3, 0.03, 3.69], 1.14);
  tropicalPlant(root, [-3.77, 0.03, -3.5], 1.15, true);
  tropicalPlant(root, [4.34, 0.025, -3.13], 1.1);
  trailing(root, [-4.65, 2.74, 2.82], m, 0.88);
  wovenLight(root, [-3.75, 0.03, 2.9], 0.82);
  wovenLight(root, [-3.79, 0.03, -2.68], 0.81);
  wovenLight(root, [4.37, 0.03, -2.3], 0.85);
  // Reference layout: long sofa behind the oval tea table, two foreground chairs.
  rug([0.28, 0.046, 1.86], 7.08, 5.75, m.rug).name = "tropical-sisal-rug";
  rug([0.3, 0.073, 1.7], 6.25, 4.89, m.persian).name = "tropical-handwoven-rug";
  const sofa = named(group(root, [0.35, 0.092, -0.4]), "linen-sofa");
  box(sofa, [4.42, 0.17, 1.57], [0, 0.24, 0], m.wood, 0.045);
  for (const x of [-1.92, 1.92])
    for (const z of [-0.57, 0.57])
      cylinder(sofa, 0.065, 0.055, 0.18, [x, 0.09, z], m.dark, 12);
  box(sofa, [4.17, 0.25, 1.47], [0, 0.44, 0], m.linen, 0.115);
  box(sofa, [4.18, 0.7, 0.3], [0, 0.92, -0.58], m.linen, 0.14);
  for (const x of [-1.96, 1.96])
    box(sofa, [0.31, 0.58, 1.46], [x, 0.75, 0], m.linen, 0.14);
  for (const x of [-1.2, 0, 1.2])
    box(sofa, [1.17, 0.22, 1.18], [x, 0.64, 0.07], m.linen, 0.09);
  for (const [x, mat] of [
    [-1.55, m.linen],
    [-0.9, m.pattern],
    [-0.25, m.rust],
    [0.52, m.sage],
    [1.3, m.stripe],
  ])
    pillow(sofa, [x, 1.04, -0.35], mat, 0.61);
  drape(sofa, [1.51, 0.1, 0], 0.61, m.linen);
  touch(sofa, "亚麻度假沙发", "落座，把时间留给晚风。");
  const coffee = named(group(root, [0.32, 0.095, 1.83]), "oval-tea-table");
  const top = cylinder(coffee, 1, 1, 0.14, [0, 0.61, 0], m.wood, 64);
  top.scale.set(1.43, 1, 0.77);
  const lower = cylinder(coffee, 1, 1, 0.065, [0, 0.22, 0], m.woven, 64);
  lower.scale.set(1.22, 1, 0.64);
  for (const x of [-1.09, 1.09])
    for (const z of [-0.43, 0.43])
      cylinder(coffee, 0.045, 0.062, 0.61, [x, 0.305, z], m.wood, 12);
  const tray = cylinder(
    coffee,
    0.4,
    0.4,
    0.035,
    [-0.55, 0.705, 0],
    m.stone,
    48,
  );
  flower(coffee, [-0.66, 0.723, -0.06], 0.35);
  candle(coffee, [-0.3, 0.72, 0.13]);
  books(coffee, [0.61, 0.69, 0.05], m, 2);
  const tea = group(coffee, [0.54, 0.833, 0.02]);
  sphere(tea, [0.14, 0.105, 0.13], [0, 0.105, 0], m.celadon);
  cylinder(tea, 0.09, 0.09, 0.025, [0, 0.208, 0], m.celadon);
  sphere(tea, [0.023, 0.025, 0.023], [0, 0.237, 0], m.celadon);
  torus(tea, 0.077, 0.013, [-0.15, 0.13, 0], m.celadon, [0, 0, 0]);
  tube(
    tea,
    [
      [0.1, 0.09, 0],
      [0.2, 0.15, 0],
      [0.22, 0.21, 0],
    ],
    0.021,
    m.celadon,
  );
  cup(coffee, [0.96, 0.69, -0.07]);
  touch(coffee, "椭圆柚木茶几", "绿釉茶器，盛一盏悠闲。");
  lounge([-2.58, 0.08, 1.87], 2.1, "left-chair");
  const right = lounge([3.15, 0.075, 3.17], -2.35, "right-chair");
  drape(right, [0.43, 0, 0], 0.35, m.stripe);
  const pouf = named(group(root, [0.38, 0.072, 3.93]), "woven-pouf");
  sphere(pouf, [0.67, 0.34, 0.67], [0, 0.34, 0], m.woven);
  for (let i = 0; i < 30; i++) {
    const t = ((i / 30) * Math.PI) / 2;
    torus(
      pouf,
      0.67 * Math.cos(t),
      0.008,
      [0, 0.34 + 0.33 * Math.sin(t), 0],
      m.lightWood,
    );
  }
  touch(pouf, "天然藤编坐墩", "把脚步放慢一点。");
  const stump = named(group(root, [-1.85, 0.06, 3.23]), "stump-table");
  cylinder(stump, 0.35, 0.4, 0.57, [0, 0.285, 0], m.wood, 18);
  candle(stump, [-0.12, 0.574, 0]);
  cup(stump, [0.12, 0.574, 0]);
  touch(stump, "树桩边桌", "木头留着自然的温度。");
  monsteraPlant([-2.7, 0.03, -1.26], 0.82);
  monsteraPlant([1.27, 0.03, -3.42], 0.74);
  const end = group(root, [-2.28, 0.03, -0.65]);
  cylinder(end, 0.36, 0.29, 0.56, [0, 0.28, 0], m.woven);
  tropicalPlant(end, [0, 0.57, 0], 0.47);

  basket(root, [-3.74, 0.03, 4.36], 0.53, 0.39, 0.46);
  // Three distinct pendants hang in the background, leaving the sofa visible.
  for (const [i, x, y, z, k] of [
    [0, -1.4, 2.91, -3.08, 1.08],
    [1, 0.08, 2.99, -2.96, 1.15],
    [2, 1.5, 2.94, -3.12, 1.02],
  ])
    named(wovenLight(root, [x, y, z], k, true, 2.2), "pendant-" + i);
  return {
    root,
    lamps,
    update(dt) {
      for (const e of motions) {
        e.t = Math.min(1, e.t + dt * 1.9);
        e.o.position.y = e.y + Math.sin(e.t * Math.PI) * 0.026;
      }
      for (const d of doors)
        d.o.rotation.y = damp(
          d.o.rotation.y,
          store.state.wardrobe ? d.sign * 1.1 : 0,
          dt,
          3,
        );
    },
    reset() {
      for (const e of motions) {
        e.t = 1;
        e.o.position.y = e.y;
      }
      for (const d of doors) d.o.rotation.y = 0;
    },
  };
}
