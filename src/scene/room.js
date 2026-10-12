import * as THREE from "three";
import { box, cylinder, sphere, group, plant } from "./primitives.js";
import { seeded } from "./materials.js";
import { damp } from "../state.js";

export function createRoom(scene, m, store, register) {
  const room = group(scene);
  room.name = "Room";
  // The room footprint is square so the isometric view has equal depth and width.
  box(room, [10.35, 0.32, 10.35], [0, -0.19, 0], m.trim, 0.04);
  // Large square marble tiles, with narrow joints and one instanced draw call.
  const tiles = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.238, 0.055, 1.238),
    m.floor,
    64,
  );
  tiles.name = "studio-marble-tiles";
  const dummy = new THREE.Object3D();
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 8; col++) {
      const i = row * 8 + col;
      dummy.position.set(-4.375 + col * 1.25, -0.008, -4.375 + row * 1.25);
      dummy.rotation.y = (((row * 3 + col) % 4) * Math.PI) / 2;
      dummy.updateMatrix();
      tiles.setMatrixAt(i, dummy.matrix);
      tiles.setColorAt(
        i,
        new THREE.Color((row + col) % 2 ? "#858b96" : "#efede7"),
      );
    }
  tiles.receiveShadow = true;
  room.add(tiles);
  box(room, [10.2, 4, 0.16], [0, 1.98, -5], m.wall);
  // Window opening z=.7..3.6, y=.92..3.28. Wall spans meet without gaps.
  const leftWall = m.wall;
  box(room, [0.16, 4, 5.62], [-5, 1.98, -2.11], leftWall);
  box(room, [0.16, 4, 1.4], [-5, 1.98, 4.3], leftWall);
  box(room, [0.16, 0.94, 2.9], [-5, 0.45, 2.15], leftWall);
  box(room, [0.16, 0.7, 2.9], [-5, 3.63, 2.15], leftWall);
  // End each trim at the shared corner instead of overlapping two solids there.
  box(room, [10, 0.14, 0.07], [0, 0.09, -4.88], m.trim);
  box(room, [0.07, 0.14, 9.845], [-4.88, 0.09, 0.0775], m.trim);
  box(room, [10.17, 0.09, 0.22], [0, 4, -4.98], m.trim);
  box(room, [0.22, 0.09, 9.93], [-4.98, 4, 0.095], m.trim);

  const window = group(room, [-4.88, 2.1, 2.15]);
  window.rotation.y = Math.PI / 2;
  window.scale.y = 1.25;
  box(window, [3.1, 0.09, 0.27], [0, -0.99, 0.04], m.cream);
  for (const x of [-1.47, 1.47])
    box(window, [0.09, 1.98, 0.12], [x, 0, 0], m.cream);
  for (const y of [-0.95, 0.95])
    box(window, [3, 0.08, 0.12], [0, y, 0], m.cream);
  box(window, [0.055, 1.9, 0.08], [0, 0, 0.015], m.cream);
  const pane = group(window, [-1.42, 0, 0.04]);
  pane.name = "studio-window-opening-pane";
  box(pane, [1.385, 1.84, 0.025], [0.6925, 0, 0], m.glass).name =
    "studio-window-glass";
  box(pane, [0.04, 1.86, 0.055], [1.385, 0, 0.02], m.cream);
  for (const y of [-0.91, 0.91])
    box(pane, [1.405, 0.04, 0.06], [0.7025, y, 0.02], m.cream);
  box(window, [1.385, 1.84, 0.025], [0.725, 0, 0.04], m.glass).name =
    "studio-window-glass";
  box(pane, [0.04, 0.22, 0.07], [1.31, -0.16, 0.08], m.metal, 0.015);
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
  const outside = group(scene, [-5.06, 2.1, 2.15]);
  outside.rotation.y = Math.PI / 2;
  outside.scale.z = 0.12;
  outside.scale.y = 1.25;
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
    const h = 0.5 + rr() * 1.25,
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
