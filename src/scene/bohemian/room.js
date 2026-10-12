import * as THREE from "three";
import { box, cylinder, group, tube } from "../primitives.js";
import { sunsetTexture } from "./materials.js";
import { damp } from "../../state.js";

// A shallow elliptical crown preserves the generous opening in the reference.
export function archPath(cx, bottom, width, spring, rise, Shape = THREE.Path) {
  const s = new Shape();
  s.moveTo(cx - width / 2, bottom);
  s.lineTo(cx + width / 2, bottom);
  s.lineTo(cx + width / 2, spring);
  s.absellipse(cx, spring, width / 2, rise, 0, Math.PI, false, 0);
  s.closePath();
  return s;
}
function wallMesh(shape, m) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.22,
    bevelEnabled: false,
    curveSegments: 32,
  });
  const p = geo.attributes.position,
    uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++)
    uv.setXY(i, (p.getX(i) + 5.1) / 10.2, p.getY(i) / 4);
  const mesh = new THREE.Mesh(geo, m);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "bohemian-room";
  const square = new THREE.Shape();
  square.moveTo(-5.1, -5.1);
  square.lineTo(5.1, -5.1);
  square.lineTo(5.1, 5.1);
  square.lineTo(-5.1, 5.1);
  square.closePath();
  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(square, {
      depth: 0.22,
      bevelSize: 0.075,
      bevelThickness: 0.055,
      bevelSegments: 1,
    }),
    m.trim,
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.28;
  root.add(base);
  base.name = "bohemian-base";
  box(root, [10, 0.05, 10], [0, -0.012, 0], m.floor).name =
    "bohemian-tile-floor";
  const rectangle = () => {
    const s = new THREE.Shape();
    s.moveTo(-5.1, 0);
    s.lineTo(5.1, 0);
    s.lineTo(5.1, 4);
    s.lineTo(-5.1, 4);
    s.closePath();
    return s;
  };
  // Local x maps to -world z along the left wall.
  const leftShape = rectangle();
  leftShape.holes.push(archPath(0.6, 0.2, 5.1, 2.9, 0.61));
  const leftWall = wallMesh(leftShape, m.wall);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.x = -5.12;
  leftWall.name = "bohemian-window-wall";
  root.add(leftWall);
  const backShape = rectangle();
  const nichePath = archPath(-4.07, 0.16, 1.28, 2.48, 0.65);
  backShape.holes.push(nichePath);
  const back = wallMesh(backShape, m.wall);
  back.position.z = -5.12;
  back.name = "bohemian-niche-wall";
  root.add(back);
  const nicheBack = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape(nichePath.getPoints(64))),
    m.wall,
  );
  nicheBack.position.z = -5.13;
  root.add(nicheBack);
  box(root, [1.21, 0.075, 0.36], [-4.07, 0.14, -4.99], m.clay, 0.02);
  for (const [size, pos] of [
    [
      [10.1, 0.2, 0.23],
      [0, 3.83, -4.86],
    ],
    [
      [0.23, 0.2, 10.05],
      [-4.86, 3.83, 0],
    ],
    [
      [10.2, 0.055, 0.25],
      [0, 4.02, -5],
    ],
    [
      [0.25, 0.055, 10.2],
      [-5, 4.02, 0],
    ],
  ])
    box(root, size, pos, pos[1] > 4 ? m.trim : m.wood, 0.009);
  for (const x of [-3.1, -0.9, 1.4, 3.8]) {
    box(root, [0.24, 0.34, 0.36], [x, 3.72, -4.78], m.dark, 0.014);
    cylinder(
      root,
      0.038,
      0.038,
      0.025,
      [x, 3.7, -4.58],
      m.bronze,
      12,
    ).rotation.x = Math.PI / 2;
  }
  box(root, [10, 0.13, 0.08], [0, 0.075, -4.86], m.wood);
  box(root, [0.08, 0.13, 10], [-4.86, 0.075, 0], m.wood);
  const win = group(root, [-4.875, 0, -0.6]);
  win.rotation.y = Math.PI / 2;
  win.name = "bohemian-arched-window";
  const day = sunsetTexture(),
    night = sunsetTexture(true);
  const viewGeo = new THREE.ShapeGeometry(
    archPath(0, 0.2, 5.1, 2.9, 0.61, THREE.Shape),
    48,
  );
  const p = viewGeo.attributes.position,
    uv = viewGeo.attributes.uv;
  for (let i = 0; i < p.count; i++)
    uv.setXY(i, p.getX(i) / 5.1 + 0.5, (p.getY(i) - 0.2) / 3.31);
  const view = new THREE.Mesh(
    viewGeo,
    new THREE.MeshBasicMaterial({ map: day, toneMapped: false }),
  );
  view.position.z = -0.16;
  win.add(view);
  const crown = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI;
    crown.push([Math.cos(a) * 2.55, 2.9 + Math.sin(a) * 0.61, 0]);
  }
  tube(win, crown, 0.055, m.dark);
  for (const x of [-2.55, 2.55])
    box(win, [0.1, 2.75, 0.14], [x, 1.55, 0], m.dark);
  for (const x of [-1.7, -0.85, 0, 0.85, 1.7]) {
    const h = 0.61 * Math.sqrt(1 - (x / 2.55) ** 2);
    box(win, [0.047, h, 0.07], [x, 2.9 + h / 2, 0], m.dark);
  }
  box(win, [5.1, 0.06, 0.09], [0, 2.9, 0], m.dark);
  const leaves = [];
  const glass = new THREE.MeshStandardMaterial({
    color: "#d4caba",
    transparent: true,
    opacity: 0.07,
    roughness: 0.2,
    metalness: 0.15,
    depthWrite: false,
  });
  for (const sign of [-1, 1]) {
    const leaf = group(win, [sign * 2.55, 0, 0.015]);
    leaf.name = "bohemian-window-leaf";
    for (let i = 0; i <= 3; i++)
      box(leaf, [0.047, 2.65, 0.07], [-sign * i * 0.85, 1.55, 0], m.dark);
    for (const y of [0.23, 1.11, 2.02, 2.875])
      box(leaf, [2.55, 0.04, 0.07], [-sign * 1.275, y, 0], m.dark);
    const pane = box(leaf, [2.5, 2.59, 0.007], [-sign * 1.275, 1.55, 0], glass);
    pane.castShadow = false;
    box(leaf, [0.027, 0.22, 0.08], [-sign * 2.44, 1.1, 0.075], m.bronze, 0.009);
    leaves.push({ leaf, sign });
  }
  box(win, [5.24, 0.09, 0.36], [0, 0.17, 0.05], m.wood, 0.02);
  register(win, "拱形法式窗", "轻开 / 合上", () => {
    store.set("window", !store.state.window);
    return store.state.window ? "夕风从阳台轻轻吹来。" : "把晚风留在窗外。";
  });
  const rod = cylinder(win, 0.024, 0.024, 5.8, [0, 3.67, 0.23], m.black);
  rod.rotation.z = Math.PI / 2;
  const curtains = [];
  for (const sign of [-1, 1]) {
    const g = group(win, [sign * 2.72, 3.57, 0.25]);
    const geo = new THREE.PlaneGeometry(2.74, 3.37, 48, 28),
      a = geo.attributes.position;
    for (let i = 0; i < a.count; i++)
      a.setXYZ(
        i,
        (a.getX(i) + 1.37) * -sign,
        a.getY(i) - 1.685,
        Math.sin(a.getX(i) * 31) * 0.043 + Math.sin(a.getY(i) * 3) * 0.02,
      );
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, m.curtain);
    mesh.receiveShadow = true;
    g.add(mesh);
    curtains.push(g);
    register(g, "米白纱帘", "拉开 / 合拢", () => {
      store.set("curtains", !store.state.curtains);
      return store.state.curtains ? "纱帘轻拢，夕阳入室。" : "纱帘缓缓合上。";
    });
  }
  return {
    root,
    update(dt) {
      view.material.map = store.state.day ? day : night;
      for (const g of curtains)
        g.scale.x = damp(g.scale.x, store.state.curtains ? 0.16 : 1, dt, 2.4);
      for (const { leaf, sign } of leaves)
        leaf.rotation.y = damp(
          leaf.rotation.y,
          store.state.window ? sign * 0.13 : 0,
          dt,
          3,
        );
    },
  };
}
