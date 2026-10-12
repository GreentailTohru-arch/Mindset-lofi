import * as THREE from "three";
import { box, cylinder, sphere, tube, group } from "../primitives.js";
import { wornSlab, branches } from "./forms.js";
import { gardenTexture } from "./materials.js";
import { damp } from "../../state.js";
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "Wabi-Sabi · Shelter";
  box(root, [10.35, 0.28, 10.35], [0, -0.17, 0], m.trim, 0.028);
  box(root, [10, 0.048, 10], [0, -0.006, 0], m.floor);
  // Recessed niches are actual openings in the wall, with interior reveals and backs.
  const wallShape = new THREE.Shape();
  wallShape.moveTo(-5.07, -0.02);
  wallShape.lineTo(5.07, -0.02);
  wallShape.lineTo(5.07, 3.78);
  wallShape.lineTo(-5.07, 3.78);
  wallShape.closePath();
  const niches = [
    { x: 0.55, y: 1.79, w: 0.81, h: 1.49 },
    { x: 4.13, y: 1.1, w: 0.91, h: 1.72 },
  ];
  for (const [i, n] of niches.entries()) {
    const path = new THREE.Path(),
      r = n.w / 2,
      sy = n.y + n.h - r;
    path.moveTo(n.x - r, n.y);
    path.lineTo(n.x + r, n.y);
    path.lineTo(n.x + r, sy);
    path.absarc(n.x, sy, r, 0, Math.PI, false);
    path.lineTo(n.x - r, n.y);
    wallShape.holes.push(path);
    const backShape = new THREE.Shape(path.getPoints(28));
    const back = new THREE.Mesh(new THREE.ShapeGeometry(backShape), m.wall);
    back.position.z = -5.181;
    back.name = `wabisabi-niche-back-${i}`;
    back.receiveShadow = true;
    root.add(back);
    wornSlab(root, [n.w, 0.045, 0.31], [n.x, n.y + 0.015, -5.035], m.stone, 4);
  }
  const wall = new THREE.Mesh(
    new THREE.ExtrudeGeometry(wallShape, {
      depth: 0.29,
      bevelEnabled: false,
      curveSegments: 24,
    }),
    m.wall,
  );
  const wallPositions = wall.geometry.attributes.position,
    wallUV = wall.geometry.attributes.uv;
  for (let i = 0; i < wallUV.count; i++)
    wallUV.setXY(
      i,
      (wallPositions.getX(i) + 5.07) / 10.14,
      (wallPositions.getY(i) + 0.02) / 3.8,
    );
  wallUV.needsUpdate = true;
  wall.position.z = -5.18;
  wall.castShadow = wall.receiveShadow = true;
  wall.name = "wabisabi-niche-wall";
  root.add(wall);
  for (const x of [-0.07, 1.16, 3.35])
    wornSlab(root, [0.16, 3.71, 0.17], [x, 1.9, -4.88], m.darkWood, 3);

  // A wide ungridded opening faces the garden. Wall surfaces never overlap.
  box(root, [0.18, 3.8, 1.4], [-5, 1.88, -4.3], m.wall);
  box(root, [0.18, 3.8, 3.8], [-5, 1.88, 3.1], m.wall);
  box(root, [0.18, 0.38, 4.8], [-5, 0.17, -1.2], m.wall);
  box(root, [0.18, 0.68, 4.8], [-5, 3.44, -1.2], m.wall);
  wornSlab(root, [10.16, 0.14, 0.19], [0, 3.8, -4.96], m.darkWood, 3);
  wornSlab(root, [0.19, 0.14, 10.05], [-4.96, 3.8, 0.04], m.darkWood, 7);
  for (const [x, z] of [
    [-4.87, -4.87],
    [4.88, -4.88],
  ])
    wornSlab(root, [0.15, 3.71, 0.15], [x, 1.9, z], m.darkWood, 2);
  const win = group(root, [-4.88, 1.73, -1.2]);
  win.rotation.y = Math.PI / 2;
  for (const x of [-2.41, 2.41])
    wornSlab(win, [0.09, 2.82, 0.14], [x, 0, 0], m.darkWood, x + 4);
  for (const y of [-1.36, 1.36])
    wornSlab(win, [4.9, 0.09, 0.17], [0, y, 0], m.darkWood, 8);
  const day = gardenTexture(),
    night = gardenTexture(false),
    viewMat = new THREE.MeshBasicMaterial({
      map: day,
      toneMapped: false,
      color: "#dedfd6",
    });
  const view = new THREE.Mesh(new THREE.PlaneGeometry(4.78, 2.7), viewMat);
  view.position.z = -0.16;
  win.add(view);
  register(view, "Misty garden", "Day / dusk", () => {
    store.set("day", !store.state.day);
    return store.state.day
      ? "Overcast light returns."
      : "The garden settles into dusk.";
  });
  // Local stones and branches overlap the misty view, providing foreground depth.
  for (let i = 0; i < 7; i++) {
    const rock = sphere(
      win,
      [0.16 + (i % 2) * 0.04, 0.075, 0.11],
      [-1.83 + i * 0.59, -1.26, -0.01],
      m.stone,
    );
    rock.rotation.z = i * 0.14;
    sphere(
      win,
      [0.12, 0.025, 0.075],
      [-1.83 + i * 0.59, -1.195, -0.005],
      m.moss,
    );
  }
  const tree = branches(win, [-1.67, -1.32, -0.025], 1.05, m.darkWood);
  for (let i = 0; i < 27; i++) {
    const leaf = sphere(
      tree,
      [0.025, 0.048, 0.009],
      [Math.sin(i * 2.399) * (0.15 + i * 0.01), 0.55 + i * 0.037, 0.05],
      m.rust,
    );
    leaf.rotation.z = i * 0.8;
  }
  const curtains = [];
  for (const [x, sign] of [
    [-2.32, 1],
    [2.32, -1],
  ]) {
    const g = group(win, [x, 1.32, 0.13]);
    const geo = new THREE.PlaneGeometry(2.35, 2.63, 48, 35),
      a = geo.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const xx = a.getX(i),
        yy = a.getY(i);
      a.setXYZ(
        i,
        (xx + 1.175) * sign,
        yy - 1.315 + Math.sin(xx * 15) * 0.016,
        Math.sin(xx * 25) * 0.062 + Math.sin(yy * 11 + xx * 3) * 0.018,
      );
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, m.linen);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    curtains.push(g);
    register(g, "Aged linen curtain", "Draw / gather", () => {
      store.set("curtains", !store.state.curtains);
      return store.state.curtains
        ? "Gathered linen, quiet daylight."
        : "A softer veil over the garden.";
    });
  }
  const rod = cylinder(win, 0.021, 0.021, 5.12, [0, 1.43, 0.15], m.darkWood);
  rod.rotation.z = Math.PI / 2;
  // Slightly stepped thresholds reinforce the handmade opening.
  wornSlab(root, [0.44, 0.09, 5.01], [-4.68, 0.035, -1.2], m.stone, 4);
  return {
    root,
    update(dt, t) {
      viewMat.map = store.state.day ? day : night;
      curtains.forEach((g, i) => {
        g.scale.x = damp(
          g.scale.x,
          store.state.curtains ? (i ? 0.17 : 0.28) : 1,
          dt,
          1.5,
        );
        g.position.z = 0.13 + Math.sin(t * 0.37 + i) * 0.008;
      });
    },
  };
}
