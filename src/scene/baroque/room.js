import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";
import { box, cylinder, group, tube, torus } from "../primitives.js";
import { createParquetGeometry } from "../renaissance/parquet.js";
import { cityTexture } from "../renaissance/materials.js";
import { archedShape } from "../athens/architecture.js";
import { flourish, ornateFrame } from "./details.js";
import { damp } from "../../state.js";
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "巴洛克 · 沙龙建筑";
  box(root, [10.35, 0.3, 10.35], [0, -0.17, 0], m.trim, 0.025);
  box(root, [10, 0.045, 10], [0, -0.006, 0], m.woodDark);
  const floor = new THREE.Mesh(createParquetGeometry(), m.floor);
  floor.receiveShadow = true;
  root.add(floor);
  box(root, [10.15, 4, 0.18], [0, 1.98, -5], m.wall);
  // Two genuine arched openings are cut from a single left-wall mesh.
  const shape = new THREE.Shape();
  shape.moveTo(-5, 0);
  shape.lineTo(5, 0);
  shape.lineTo(5, 4);
  shape.lineTo(-5, 4);
  shape.closePath();
  const arches = [-2.65, 0.8].map((x) => archedShape(x, 0.6, 2.05, 2.57));
  arches.forEach((s) => shape.holes.push(new THREE.Path(s.getPoints(48))));
  const wall = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: false }),
    m.wall,
  );
  wall.name = "baroque-arched-wall";
  wall.rotation.y = Math.PI / 2;
  wall.position.x = -5.08;
  wall.castShadow = true;
  wall.receiveShadow = true;
  root.add(wall);
  for (const rotation of [0, Math.PI / 2]) {
    const panel = group(root, rotation === 0 ? [0, 0, -4.88] : [-4.88, 0, 0]);
    panel.rotation.y = rotation;
    // Window-wall panelling stays below the sill.
    const h = rotation === 0 ? 0.83 : 0.47;
    box(panel, [10, h, 0.065], [0, h / 2, 0], m.woodDark);
    for (const x of [-4.4, -3.3, -2.2, -1.1, 0, 1.1, 2.2, 3.3, 4.4]) {
      for (const xx of [-0.43, 0.43])
        box(
          panel,
          [0.025, h - 0.13, 0.025],
          [x + xx, h / 2, 0.047],
          m.gold,
          0.005,
        );
      for (const y of [0.07, h - 0.07])
        box(panel, [0.86, 0.025, 0.025], [x, y, 0.047], m.gold, 0.005);
      flourish(panel, [x, h * 0.52, 0.063], 0.28, m);
    }
    for (const [y, hh, d, mat] of [
      [h + 0.055, 0.065, 0.09, m.wood],
      [3.86, 0.035, 0.09, m.gold],
      [3.97, 0.13, 0.24, m.trim],
    ])
      box(panel, [10.16, hh, d], [0, y, 0], mat, 0.007);
  }
  const textures = [cityTexture(false), cityTexture(true)],
    scenery = [];
  const curtains = [];
  for (let index = 0; index < arches.length; index++) {
    const center = [-2.65, 0.8][index],
      win = group(root, [-4.89, 0, -center]);
    win.rotation.y = Math.PI / 2;
    const local = archedShape(0, 0.6, 2.05, 2.57),
      mat = new THREE.MeshBasicMaterial({
        map: textures[0],
        toneMapped: false,
        color: "#aabbd8",
      });
    const geo = new THREE.ShapeGeometry(local);
    const p = geo.attributes.position,
      uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++)
      uv.setXY(i, (p.getX(i) + 1.025) / 2.05, (p.getY(i) - 0.6) / 3);
    const view = new THREE.Mesh(geo, mat);
    view.position.z = -0.2;
    win.add(view);
    scenery.push(mat);
    const points = [
      [-1.045, 0.6, 0],
      [-1.045, 2.57, 0],
    ];
    for (let i = 0; i <= 36; i++) {
      const a = Math.PI - (i * Math.PI) / 36;
      points.push([Math.cos(a) * 1.045, 2.57 + Math.sin(a) * 1.045, 0]);
    }
    points.push([1.045, 0.6, 0]);
    tube(win, points, 0.055, m.trim);
    for (const x of [-0.5, 0, 0.5]) {
      const top = 2.57 + Math.sqrt(1.025 ** 2 - x * x);
      box(win, [0.035, top - 0.6, 0.055], [x, (top + 0.6) / 2, 0], m.woodDark);
    }
    for (const y of [1.42, 2.3])
      box(win, [2.02, 0.032, 0.055], [0, y, 0.01], m.woodDark);
    box(win, [2.28, 0.09, 0.39], [0, 0.575, 0.06], m.marble, 0.014);
    const rod = cylinder(win, 0.029, 0.029, 2.68, [0, 3.69, 0.18], m.gold);
    rod.rotation.z = Math.PI / 2;
    for (const sign of [-1, 1]) {
      const g = group(win, [sign * 1.19, 3.63, 0.22]);
      const curtainGeo = new THREE.PlaneGeometry(1.22, 3.08, 32, 32),
        a = curtainGeo.attributes.position;
      for (let i = 0; i < a.count; i++) {
        const x = a.getX(i),
          y = a.getY(i);
        a.setXYZ(
          i,
          (x + 0.61) * -sign,
          y - 1.54,
          Math.sin(x * 33) * 0.065 + Math.sin((y + 1.54) * 1.15) * 0.045,
        );
      }
      curtainGeo.computeVertexNormals();
      const curtain = new THREE.Mesh(curtainGeo, m.velvet);
      curtain.castShadow = true;
      curtain.receiveShadow = true;
      g.add(curtain);
      curtains.push(g);
      register(g, "天鹅绒帷幔", "展开 / 收拢", () => {
        store.set("curtains", !store.state.curtains);
        return store.state.curtains
          ? "帷幔收拢 · 月色流入"
          : "帷幔垂落 · 一室温柔";
      });
      // Draped valance, fitted to the arch rather than covering the whole window.
      const swag = tube(
        win,
        [
          [sign * 1.2, 3.63, 0.2],
          [sign * 0.78, 3.37, 0.23],
          [sign * 0.34, 3.48, 0.23],
          [0, 3.67, 0.2],
        ],
        0.115,
        m.velvet,
      );
      tube(
        win,
        [
          [sign * 1.2, 3.51, 0.21],
          [sign * 0.78, 3.25, 0.25],
          [sign * 0.34, 3.36, 0.25],
          [0, 3.55, 0.21],
        ],
        0.014,
        m.gold,
      );
      swag.receiveShadow = true;
    }
    register(view, "月光拱窗", "日景 / 月景", () => {
      store.set("day", !store.state.day);
      return store.state.day ? "晨光映窗" : "月色漫入沙龙";
    });
  }
  // Raised gilt wall panels, flush against the cream plaster.
  for (const x of [-4.3, -0.1, 2.6, 4.3]) {
    for (const dx of [-0.32, 0.32])
      box(root, [0.021, 2.53, 0.025], [x + dx, 2.36, -4.888], m.gold);
    flourish(root, [x, 3.61, -4.85], 0.45, m);
  }
  const frame = ornateFrame(root, [0.3, 2.69, -4.73], 1.56, 1.68, m);
  const mirror = new Reflector(new THREE.PlaneGeometry(1.38, 1.5), {
    textureWidth: 512,
    textureHeight: 512,
    color: 0xa9a6a0,
    clipBias: 0.003,
  });
  mirror.position.set(0, 0, 0.005);
  mirror.name = "salon-mirror";
  frame.add(mirror);
  register(frame, "鎏金镜框", "欣赏镜中空间", () => "烛影与月光 · 相映成趣");
  const artMat = new THREE.MeshStandardMaterial({
    map: cityTexture(false, true),
    roughness: 0.92,
  });
  const art = ornateFrame(root, [3.2, 2.72, -4.8], 1.83, 1.5, m);
  box(art, [1.68, 1.35, 0.02], [0, 0, 0.013], artMat);
  register(art, "古典城市油画", "静静赏画", () => "旧城灯火 · 岁月悠长");
  return {
    root,
    update(dt) {
      scenery.forEach((s) => (s.map = textures[store.state.day ? 1 : 0]));
      curtains.forEach(
        (g) =>
          (g.scale.x = damp(g.scale.x, store.state.curtains ? 0.25 : 1, dt, 2)),
      );
    },
  };
}
