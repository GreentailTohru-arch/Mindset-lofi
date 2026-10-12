import * as THREE from "three";
import { group, box, cylinder, sphere, tube, torus } from "../primitives.js";

// Leaves share one instanced mesh per plant so a lush room stays economical.
export function addNordicDetails(root, m, { touch, bookStack, vase, candle }) {
  const leafGeometry = new THREE.SphereGeometry(1, 10, 7);
  function greenery(parent, pos, scale = 1, kind = "small", basket = false) {
    const g = group(parent, pos);
    g.scale.setScalar(scale);
    g.userData.nordicPlant = true;
    const potMat = basket ? m.rug : m.ceramic;
    cylinder(g, 0.24, 0.19, 0.42, [0, 0.21, 0], potMat);
    cylinder(g, 0.213, 0.213, 0.012, [0, 0.426, 0], m.soil);
    if (basket) {
      for (let i = 0; i < 14; i++)
        torus(g, 0.194 + i * 0.0034, 0.008, [0, 0.035 + i * 0.026, 0], m.wool);
      for (const s of [-1, 1])
        torus(
          g,
          0.08,
          0.011,
          [s * 0.21, 0.4, 0],
          m.rug,
          [0, Math.PI / 2, 0],
          Math.PI,
        );
    }
    const transforms = [],
      dummy = new THREE.Object3D();
    const leaf = (p, size, rot) => transforms.push({ p, size, rot });
    if (kind === "trail") {
      for (let k = 0; k < 5; k++) {
        const x = (k - 2) * 0.08,
          len = 0.8 + (k % 3) * 0.42,
          pts = [];
        for (let j = 0; j < 7; j++) {
          const v = j / 6;
          pts.push([
            x + Math.sin(v * 5 + k) * 0.075,
            0.53 - len * v,
            0.1 + Math.min(v * 2, 1) * 0.31,
          ]);
        }
        tube(g, pts, 0.012, m.leaf);
        for (let j = 0; j < 13; j++) {
          const v = j / 12;
          leaf(
            [
              x + Math.sin(v * 5 + k) * 0.075 + (j % 2 ? -0.055 : 0.055),
              0.53 - len * v,
              0.1 + Math.min(v * 2, 1) * 0.31,
            ],
            [0.067, 0.096, 0.025],
            [0.3, Math.sin(j), j % 2 ? -0.65 : 0.65],
          );
        }
      }
    } else if (kind === "olive") {
      tube(
        g,
        [
          [0, 0.42, 0],
          [0.03, 0.9, 0],
          [-0.035, 1.55, 0.01],
          [0, 2.0, 0],
        ],
        0.025,
        m.darkWood,
      );
      for (let k = 0; k < 9; k++) {
        const a = k * 2.399,
          y = 0.88 + k * 0.115,
          x = Math.cos(a) * 0.4,
          z = Math.sin(a) * 0.38;
        tube(
          g,
          [
            [0, y, 0],
            [x * 0.5, y + 0.24, z * 0.5],
            [x, y + 0.45, z],
          ],
          0.012,
          m.darkWood,
        );
        for (let j = 0; j < 9; j++) {
          const v = j / 8;
          leaf(
            [x * v + (j % 2 ? -0.035 : 0.035), y + 0.45 * v, z * v],
            [0.032, 0.082, 0.018],
            [Math.sin(a) * 0.6, a, Math.cos(a) * 0.55],
          );
        }
      }
    } else {
      const broad = kind === "broad";
      for (let i = 0; i < (broad ? 11 : 18); i++) {
        const a = i * 2.399,
          y = 0.61 + i * (broad ? 0.11 : 0.025),
          x = Math.cos(a) * (broad ? 0.4 : 0.23),
          z = Math.sin(a) * (broad ? 0.35 : 0.2);
        tube(
          g,
          [
            [0, 0.4, 0],
            [x * 0.38, y - 0.13, z * 0.4],
            [x, y, z],
          ],
          broad ? 0.013 : 0.008,
          m.leaf,
        );
        leaf(
          [x, y + 0.11, z],
          broad ? [0.15, 0.29, 0.038] : [0.07, 0.13, 0.026],
          [Math.sin(a) * 0.6, a, Math.cos(a) * 0.6],
        );
      }
    }
    const leafMaterial = m.leaf.clone();
    leafMaterial.color.set("#ffffff");
    const leaves = new THREE.InstancedMesh(
      leafGeometry,
      leafMaterial,
      transforms.length,
    );
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    transforms.forEach((l, i) => {
      dummy.position.set(...l.p);
      dummy.scale.set(...l.size);
      dummy.rotation.set(...l.rot);
      dummy.updateMatrix();
      leaves.setMatrixAt(i, dummy.matrix);
      leaves.setColorAt(i, new THREE.Color(i % 3 ? "#6f8866" : "#9ba27a"));
    });
    g.add(leaves);
    touch(
      g,
      kind === "trail"
        ? "垂吊绿萝"
        : kind === "olive"
          ? "窗边橄榄树"
          : "北欧绿植",
      "叶影轻轻一动，又归于安静。",
    );
    return g;
  }
  // Floating shelves fill the wall beyond the left window without blocking it.
  const shelves = group(root, [-4.61, 0, -3.74]);
  shelves.rotation.y = Math.PI / 2;
  for (let row = 0; row < 5; row++) {
    const y = 0.69 + row * 0.56;
    box(shelves, [1.82, 0.065, 0.59], [0, y, 0], m.wood, 0.013);
    for (const x of [-0.61, 0.61])
      box(shelves, [0.045, 0.18, 0.28], [x, y - 0.1, -0.08], m.trim);
    for (let j = 0; j < 5; j++) {
      const h = 0.28 + (j % 3) * 0.041;
      box(
        shelves,
        [0.09, h, 0.27],
        [-0.7 + j * 0.11, y + 0.036 + h / 2, -0.06],
        [m.pages, m.book, m.darkWood][(j + row) % 3],
        0.006,
      );
    }
    if (row % 2) vase(shelves, [0.23, y + 0.034, 0.03], 0.57);
    else bookStack(shelves, [0.36, y + 0.035, 0], 2);
    if (row === 2) candle(shelves, [0.62, y + 0.036, 0.09], 0.14);
  }
  touch(shelves, "多层悬浮书架", "书、陶器与叶子，各安其位。");
  greenery(shelves, [0.55, 2.965, 0.08], 0.76, "trail");
  greenery(shelves, [-0.64, 2.965, -0.04], 0.44, "small");
  greenery(shelves, [0.46, 1.285, 0.09], 0.43, "trail");
  // Small shelves and wordless art next to the reading seat.
  for (const y of [2.68, 2.13]) {
    box(root, [0.6, 0.045, 0.3], [-3.71, y, -4.68], m.wood);
    vase(root, [-3.86, y + 0.024, -4.67], 0.35);
    bookStack(root, [-3.51, y + 0.024, -4.67], 2);
  }
  function art(pos, rot, scale = 1) {
    const g = group(root, pos);
    g.rotation.y = rot;
    g.scale.setScalar(scale);
    box(g, [0.73, 1.05, 0.035], [0, 0, 0], m.wood);
    box(g, [0.66, 0.98, 0.015], [0, 0, 0.028], m.pages);
    const disk = cylinder(g, 0.14, 0.14, 0.01, [0.06, 0.18, 0.041], m.clay);
    disk.rotation.x = Math.PI / 2;
    box(g, [0.31, 0.31, 0.01], [-0.08, -0.13, 0.041], m.sage);
    touch(g, "无字抽象画", "只看颜色与形状。");
  }
  art([-4.87, 2.07, 3.79], Math.PI / 2, 1.0);
  art([4.17, 3.23, -4.86], 0, 0.56);
  art([-3.72, 3.19, -4.86], 0, 0.38);
  // Reading chair has its own round woven rug, as in the reference.
  const round = group(root, [-1.47, 0.048, -2.99]);
  cylinder(round, 0.99, 0.99, 0.025, [0, 0, 0], m.rug, 64);
  for (let i = 0; i < 30; i++)
    torus(round, 0.11 + i * 0.029, 0.005, [0, 0.016, 0], m.wool);
  touch(round, "圆形阅读地毯", "在这里，读慢一点。");
  // Dense but deliberately localized planting preserves walkways and silhouettes.
  greenery(root, [-4.29, 0.03, 3.61], 0.94, "olive");
  greenery(root, [-4.39, 0.03, 4.49], 0.68, "broad");
  greenery(root, [-3.7, 0.03, 3.84], 0.73, "small", true);
  greenery(root, [-3.42, 0.03, -3.09], 0.85, "broad");
  greenery(root, [4.4, 0.03, -2.99], 1.05, "broad");
  greenery(root, [-4.26, 0.685, -1.86], 0.39, "small");
  greenery(root, [-4.25, 0.685, 2.02], 0.32, "small");
  greenery(root, [0.65, 1.443, -4.75], 0.37, "small");
  greenery(root, [1.28, 1.443, -4.75], 0.3, "small");
  greenery(root, [2.44, 1.443, -4.75], 0.27, "small");
  greenery(root, [0.75, 1.215, -4.05], 0.37, "small");
  greenery(root, [4.39, 2.87, -4.22], 0.68, "trail");
  greenery(root, [3.95, 1.535, -4.19], 0.48, "trail");
  greenery(root, [-1.44, 0.03, 4.39], 0.68, "small");
  greenery(root, [-0.92, 0.65, 4.19], 0.29, "small");
  greenery(root, [3.71, 0.03, 0.06], 0.52, "small");
  // Storage baskets on the tall right shelf, with a tightly woven rim.
  for (const y of [0.87, 2.19]) {
    const b = group(root, [4.55, y, -4.38]);
    box(b, [0.35, 0.24, 0.39], [0, 0.12, 0], m.rug, 0.035);
    for (let i = 0; i < 7; i++)
      box(b, [0.355, 0.008, 0.01], [0, 0.028 + i * 0.03, 0.201], m.wool, 0.003);
    touch(b, "编织收纳篮", "小东西，也有自己的归处。");
  }
  const pouf = group(root, [2.88, 0.065, 1.62]);
  pouf.name = "nordic-knit-pouf";
  sphere(pouf, [0.62, 0.36, 0.62], [0, 0.34, 0], m.sage);
  for (let i = 0; i < 36; i++) {
    const a = (i * Math.PI * 2) / 36,
      pts = [];
    for (let j = 0; j <= 14; j++) {
      const b = 0.11 + (j * (Math.PI - 0.22)) / 14;
      pts.push([
        Math.sin(b) * 0.624 * Math.cos(a),
        0.34 + Math.cos(b) * 0.362,
        Math.sin(b) * 0.624 * Math.sin(a),
      ]);
    }
    tube(pouf, pts, 0.007, m.sage);
  }
  touch(pouf, "绿色针织脚凳", "轻轻抬起，再稳稳落下。");
  // A second knitted throw folds over the window cushion and down its front.
  const clothGeo = new THREE.PlaneGeometry(1.02, 1.18, 36, 40),
    p = clothGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      v = p.getY(i);
    p.setZ(
      i,
      Math.sin(x * 23 + v * 4) * 0.022 +
        Math.sin(v * 17) * 0.012 -
        Math.max(0, -v - 0.22) * 1.3,
    );
  }
  clothGeo.computeVertexNormals();
  const cloth = new THREE.Mesh(clothGeo, m.wool);
  cloth.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
  cloth.position.set(-3.98, 0.738, 0.09);
  cloth.castShadow = true;
  cloth.receiveShadow = true;
  root.add(cloth);
  touch(cloth, "窗边针织毯", "柔软织物，接住冬日的光。");
}
