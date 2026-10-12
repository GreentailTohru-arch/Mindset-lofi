import * as THREE from "three";
import { box, cylinder, sphere, group, plant } from "./primitives.js";
import { seeded } from "./materials.js";
import { damp } from "../state.js";

export function createRoom(scene, m, store, register) {
  const room = group(scene);
  room.name = "Room";
  // The room footprint is square so the isometric view has equal depth and width.
  box(room, [10.2, 0.25, 10.2], [0, -0.15, 0], m.woodDark, 0.04);
  // Instanced floorboards keep the floor to a single draw call.
  const geo = new THREE.BoxGeometry(1.65, 0.055, 0.32),
    boards = new THREE.InstancedMesh(geo, m.floor, 192),
    r = seeded(84),
    dummy = new THREE.Object3D();
  let n = 0;
  for (let row = 0; row < 32; row++)
    for (let col = 0; col < 6; col++) {
      dummy.position.set(-4.17 + col * 1.668, -0.008, -4.96 + row * 0.32);
      dummy.updateMatrix();
      boards.setMatrixAt(n, dummy.matrix);
      boards.setColorAt(
        n,
        new THREE.Color().setHSL(0.075 + r() * 0.014, 0.13, 0.66 + r() * 0.2),
      );
      n++;
    }
  boards.receiveShadow = true;
  room.add(boards);
  box(room, [10.2, 4, 0.16], [0, 1.98, -5], m.wall);
  // The window ends at z=-3; fill continuously from there to the rear wall at -4.92.
  const leftWall = m.wall;
  box(room, [0.16, 4, 1.92], [-5, 1.98, -3.96], leftWall);
  box(room, [0.16, 4, 5.1], [-5, 1.98, 2.45], leftWall);
  box(room, [0.16, 1.45, 2.9], [-5, 0.705, -1.55], leftWall);
  box(room, [0.16, 0.57, 2.9], [-5, 3.715, -1.55], leftWall);
  // End each trim at the shared corner instead of overlapping two solids there.
  box(room, [10, 0.14, 0.07], [0, 0.09, -4.88], m.trim);
  box(room, [0.07, 0.14, 9.845], [-4.88, 0.09, 0.0775], m.trim);
  box(room, [10.17, 0.09, 0.22], [0, 4, -4.98], m.trim);
  box(room, [0.22, 0.09, 9.93], [-4.98, 4, 0.095], m.trim);

  const window = group(room, [-4.88, 2.42, -1.55]);
  window.rotation.y = Math.PI / 2;
  box(window, [3.1, 0.09, 0.27], [0, -0.99, 0.04], m.woodLight);
  for (const x of [-1.47, 1.47])
    box(window, [0.09, 1.98, 0.12], [x, 0, 0], m.woodDark);
  for (const y of [-0.95, 0.95])
    box(window, [3, 0.08, 0.12], [0, y, 0], m.woodDark);
  box(window, [0.045, 1.9, 0.08], [0, 0, 0.015], m.woodDark);
  const pane = group(window, [-1.42, 0, 0.04]);
  box(pane, [1.39, 1.84, 0.025], [0.695, 0, 0], m.glass);
  box(pane, [0.045, 1.86, 0.055], [1.39, 0, 0.02], m.woodDark);
  box(pane, [1.4, 0.04, 0.06], [0.7, 0.91, 0.02], m.woodDark);
  box(pane, [1.4, 0.04, 0.06], [0.7, -0.91, 0.02], m.woodDark);
  box(window, [1.38, 1.84, 0.025], [0.72, 0, 0.04], m.glass);
  const handle = box(
    pane,
    [0.04, 0.22, 0.07],
    [1.31, -0.16, 0.08],
    m.metal,
    0.015,
  );
  register(window, "窗户", "开一点窗，让晚风进来", () => {
    store.set("window", !store.state.window);
    return store.state.window ? "窗户已打开 · 晚风轻轻吹过" : "窗户已关闭";
  });
  const curtainM = m.curtain.clone();
  const curtains = [-1, 1].map((sign) => {
    const g = group(window, [sign * 1.47, 0, 0.22]);
    const geometry = new THREE.PlaneGeometry(1.5, 2.23, 40, 14);
    const a = geometry.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const x = a.getX(i),
        y = a.getY(i);
      a.setXYZ(
        i,
        x + sign * -0.75,
        y,
        Math.sin((x + 0.75) * Math.PI * 10) * 0.072 +
          Math.sin(y * 2 + x * 3) * 0.018,
      );
    }
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, curtainM);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
    register(g, "窗帘", "拉开窗帘，看看窗外", () => {
      store.set("curtains", !store.state.curtains);
      return store.state.curtains ? "窗帘缓缓拉开" : "窗帘缓缓合上";
    });
    return g;
  });
  const rod = cylinder(window, 0.022, 0.022, 3.32, [0, 1.17, 0.23], m.metal);
  rod.rotation.z = Math.PI / 2;
  for (let side of [-1, 1])
    sphere(window, [0.05, 0.05, 0.05], [side * 1.7, 1.17, 0.23], m.woodLight);

  // A compact diorama outside the window; no external image or network request.
  const outside = group(scene, [-5.06, 2.42, -1.55]);
  outside.rotation.y = Math.PI / 2;
  outside.scale.z = 0.12;
  const skyMat = new THREE.MeshBasicMaterial({ color: "#253553" });
  box(outside, [2.92, 1.92, 0.02], [0, 0, -0.7], skyMat);
  const moonMat = new THREE.MeshBasicMaterial({ color: "#f1ddb4" });
  const moon = sphere(outside, [0.14, 0.14, 0.03], [0.79, 0.7, -0.59], moonMat);
  const city = new THREE.Group();
  outside.add(city);
  const cityM = new THREE.MeshBasicMaterial({ color: "#283149" }),
    city2 = new THREE.MeshBasicMaterial({ color: "#35455b" }),
    lit = new THREE.MeshBasicMaterial({ color: "#ba9365" });
  const rr = seeded(9);
  for (let i = 0; i < 12; i++) {
    const h = 0.2 + rr() * 0.6,
      x = -1.65 + i * 0.3;
    box(city, [0.24, h, 0.1], [x, -1.17 + h / 2, -0.5], i % 2 ? cityM : city2);
    for (let w = 0; w < 3; w++) {
      if (rr() > 0.4)
        box(
          city,
          [0.025, 0.042, 0.012],
          [x - 0.065 + w * 0.065, -1.08 + rr() * h * 0.6, -0.44],
          lit,
        );
    }
  }
  const trees = group(outside);
  const treeM = new THREE.MeshBasicMaterial({ color: "#243d40" });
  for (const [x, y, s] of [
    [-1.4, -0.47, 0.45],
    [1.1, -0.7, 0.33],
    [-1, -0.9, 0.22],
  ]) {
    cylinder(trees, 0.015, 0.024, 0.7, [x, y - 0.3, -0.24], treeM, 8);
    for (let i = 0; i < 3; i++) {
      const t = new THREE.Mesh(
        new THREE.ConeGeometry(s * (1 - i * 0.19), s * 0.95, 7),
        treeM,
      );
      t.position.set(x, y + i * s * 0.43, -0.22);
      trees.add(t);
    }
  }
  const stars = new THREE.Group();
  outside.add(stars);
  for (let i = 0; i < 22; i++)
    sphere(
      stars,
      [0.007, 0.007, 0.007],
      [rr() * 3.1 - 1.55, rr() * 1.4 - 0.2, -0.56],
      moonMat,
    );
  const dayColor = new THREE.Color("#8faab7"),
    nightColor = new THREE.Color("#253553");
  let daylight = 0;

  // The large plant stays beside the reoriented bed and its floor lamp.
  plant(room, [-4.2, 0.015, 3.55], 1.13, m);
  const rug = box(room, [4.1, 0.035, 4.5], [-2.76, 0.042, 0.85], m.rug, 0.025);
  box(room, [3.35, 0.035, 2.3], [2.6, 0.045, 2.55], m.tatami, 0.018);
  for (let i = 0; i < 23; i++)
    for (let side of [-1, 1])
      box(
        room,
        [0.024, 0.015, 0.09],
        [1 + i * 0.145, 0.06, 2.55 + side * 1.17],
        m.tatami,
      );
  return {
    room,
    window,
    curtains,
    update(dt, t) {
      curtains.forEach(
        (g) =>
          (g.scale.x = damp(g.scale.x, store.state.curtains ? 0.19 : 1, dt, 2)),
      );
      curtainM.color.setRGB(1, 1, 1).multiply(new THREE.Color("#71647e"));
      curtains.forEach((g, i) => {
        g.rotation.y =
          Math.sin(t * 0.65 + i) * 0.013 * (store.state.window ? 1 : 0.2);
      });
      pane.rotation.y = damp(
        pane.rotation.y,
        store.state.window ? -0.38 : 0,
        dt,
        2,
      );
      daylight = damp(daylight, store.state.day ? 1 : 0, dt, 1.1);
      skyMat.color.copy(nightColor).lerp(dayColor, daylight);
      moon.position.y = 0.7 + daylight * 0.08;
      moonMat.color.set(store.state.day ? "#fff0c4" : "#f1ddb4");
      stars.visible = daylight < 0.5;
      lit.color.setRGB(0.68, 0.48, 0.29).multiplyScalar(1 - daylight * 0.7);
    },
  };
}
