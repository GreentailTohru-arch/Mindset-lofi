import * as THREE from "three";
import { box, group, cylinder, sphere, tube } from "../primitives.js";
import { damp } from "../../state.js";

export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "machiya-room";
  box(root, [10.3, 0.28, 10.3], [0, -0.17, 0], m.stone);
  box(root, [10, 0.05, 10], [0, -0.005, 0], m.dark);
  // A continuous engawa separates the tatami interior from the courtyard.
  for (let i = 0; i < 25; i++)
    box(root, [1.04, 0.08, 0.39], [-3.25, 0.065, -4.8 + i * 0.4], m.wood);
  for (let col = 0; col < 4; col++)
    for (let row = 0; row < 3; row++) {
      const x = -1.75 + col * 1.9,
        z = -3.29 + row * 3.29;
      box(root, [1.86, 0.082, 3.24], [x, 0.066, z], m.floor, 0.012);
      for (const dx of [-0.91, 0.91])
        box(root, [0.05, 0.01, 3.24], [x + dx, 0.112, z], m.border);
    }
  box(root, [10.13, 3.8, 0.16], [0, 1.9, -5], m.wall);
  // The left enclosure is a garden backdrop rather than a solid wall across the shoji opening.
  box(root, [0.15, 0.5, 10], [-5, 0.25, 0], m.dark);
  box(root, [0.15, 0.42, 10], [-5, 3.59, 0], m.wall);
  for (const z of [-4.9, 4.9])
    box(root, [0.16, 3.8, 0.17], [-4.96, 1.9, z], m.dark);
  for (const z of [-4.85, -1.5, 1.6, 4.85])
    box(root, [0.16, 3.78, 0.16], [-3.78, 1.89, z], m.dark);
  box(root, [0.21, 0.23, 10.1], [-3.78, 3.72, 0], m.dark);
  box(root, [10.12, 0.21, 0.23], [0, 3.73, -4.9], m.dark);
  for (const x of [-4.89, -2.4, 1.08, 4.88])
    box(root, [0.17, 3.8, 0.18], [x, 1.9, -4.84], m.dark);
  box(root, [10, 0.12, 0.18], [0, 2.95, -4.85], m.wood);
  const skyMat = new THREE.MeshBasicMaterial({ color: "#20334d" });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.35), skyMat);
  sky.position.set(-5.035, 2.03, 0);
  sky.rotation.y = Math.PI / 2;
  root.add(sky);
  const moon = sphere(
    root,
    [0.16, 0.16, 0.04],
    [-4.94, 2.96, -0.05],
    new THREE.MeshBasicMaterial({ color: "#dddcca" }),
  );
  moon.rotation.y = Math.PI / 2;
  box(root, [1.08, 0.09, 9.6], [-4.39, 0.065, 0], m.moss, 0.03);
  // Local geometry makes the pond, stepping stones and bamboo visible at different orbit angles.
  const pond = sphere(root, [0.48, 0.035, 1.32], [-4.33, 0.126, 0.53], m.water);
  pond.name = "koi-pond";
  for (let i = 0; i < 13; i++) {
    const a = (i / 13) * Math.PI * 2;
    sphere(
      root,
      [0.1, 0.085, 0.18],
      [-4.33 + Math.cos(a) * 0.48, 0.13, 0.53 + Math.sin(a) * 1.34],
      m.stone,
    );
  }
  const fish = [];
  for (let i = 0; i < 3; i++) {
    const g = group(root);
    sphere(g, [0.045, 0.019, 0.115], [0, 0, 0], i % 2 ? m.linen : m.red);
    const tail = sphere(g, [0.062, 0.013, 0.047], [0, 0, 0.11], m.linen);
    tail.rotation.y = 0.3;
    fish.push(g);
  }
  for (let i = 0; i < 5; i++)
    sphere(root, [0.24, 0.055, 0.29], [-4.24, 0.15, -3.4 + i * 0.57], m.stone);
  for (let i = 0; i < 12; i++) {
    const z = -4.35 + i * 0.77,
      x = -4.79 + (i % 3) * 0.06,
      h = 1.7 + (i % 4) * 0.23;
    cylinder(root, 0.019, 0.025, h, [x, 0.12 + h / 2, z], m.leaf, 8);
    for (let j = 0; j < 4; j++) {
      const y = 0.55 + j * 0.38;
      cylinder(root, 0.027, 0.027, 0.035, [x, y, z], m.leafLight, 8);
      for (const s of [-1, 1]) {
        const leaf = sphere(
          root,
          [0.018, 0.17, 0.045],
          [x + 0.1, y + 0.07, z + s * 0.15],
          m.leaf,
        );
        leaf.rotation.x = s * 0.9;
      }
    }
  }
  // Moss banks, clustered rocks and finer bamboo sprays establish depth behind the engawa.
  for (let i = 0; i < 18; i++) {
    const z = -4.5 + i * 0.52;
    if (z > -0.85 && z < 2) continue;
    const rock = sphere(
      root,
      [0.18 + (i % 3) * 0.03, 0.12 + (i % 4) * 0.025, 0.24],
      [-4.58 + (i % 2) * 0.25, 0.19, z],
      m.stone,
    );
    rock.rotation.y = i * 0.7;
    sphere(
      root,
      [0.16, 0.035, 0.19],
      [-4.58 + (i % 2) * 0.25, 0.29 + (i % 4) * 0.025, z],
      m.moss,
    );
  }
  for (let i = 0; i < 18; i++) {
    const z = -4.45 + i * 0.51,
      x = -4.77 + (i % 3) * 0.065,
      y = 1.2 + (i % 5) * 0.28;
    for (const side of [-1, 1]) {
      tube(
        root,
        [
          [x, y, z],
          [x + 0.1, y + 0.12, z + side * 0.15],
          [x + 0.16, y + 0.2, z + side * 0.35],
        ],
        0.006,
        m.leaf,
      );
      for (let j = 0; j < 5; j++) {
        const leaf = sphere(
          root,
          [0.021, 0.12, 0.012],
          [
            x + 0.13 + (j % 2) * 0.05,
            y + 0.12 + j * 0.023,
            z + side * (0.06 + j * 0.075),
          ],
          j % 2 ? m.leaf : m.leafLight,
        );
        leaf.rotation.x = side * (0.65 + j * 0.13);
      }
    }
  }
  // A low railing sits at the garden edge; the open entrance remains unobstructed.
  for (const z of [-2.3, -1.6, -0.9])
    box(root, [0.055, 0.43, 0.055], [-3.8, 0.32, z], m.dark);
  box(root, [0.075, 0.07, 1.5], [-3.8, 0.55, -1.6], m.wood, 0.012);
  // Sliding tracks and a rolled bamboo blind give the opening a readable frame.
  for (const x of [-3.81, -3.74])
    box(root, [0.02, 0.018, 9.7], [x, 0.15, 0], m.wood);
  for (let j = 0; j < 12; j++)
    box(
      root,
      [0.034, 0.028, 4.45],
      [-3.65, 3.47 - j * 0.034, 0],
      m.bamboo,
      0.008,
    );
  for (const z of [-1.65, 0, 1.65])
    box(root, [0.045, 0.42, 0.014], [-3.622, 3.28, z], m.dark);
  const stoneLamp = group(root, [-4.64, 0.13, -1.88]);
  cylinder(stoneLamp, 0.13, 0.22, 0.2, [0, 0.1, 0], m.stone);
  cylinder(stoneLamp, 0.075, 0.1, 0.5, [0, 0.43, 0], m.stone);
  box(stoneLamp, [0.28, 0.32, 0.28], [0, 0.78, 0], m.glow);
  for (const x of [-0.15, 0.15])
    for (const z of [-0.15, 0.15])
      box(stoneLamp, [0.05, 0.38, 0.05], [x, 0.78, z], m.stone);
  cylinder(stoneLamp, 0.05, 0.32, 0.16, [0, 1.02, 0], m.stone, 4);
  const doors = [];
  for (const side of [-1, 1]) {
    const g = group(root, [-3.79, 0, side * 3.7]);
    g.name = side < 0 ? "shoji-left" : "shoji-right";
    box(g, [0.035, 2.69, 2.15], [0, 1.61, 0], m.paper);
    for (const z of [-1.1, 1.1])
      box(g, [0.085, 2.84, 0.065], [0.035, 1.61, z], m.wood);
    for (let j = 0; j <= 7; j++)
      box(g, [0.085, 0.032, 2.24], [0.04, 0.23 + j * 0.394, 0], m.wood);
    for (const z of [-0.55, 0, 0.55])
      box(g, [0.075, 2.8, 0.024], [0.05, 1.61, z], m.wood);
    register(g, "障子纸门", "滑动开合", () => {
      store.set("curtains", !store.state.curtains);
      return store.state.curtains
        ? "纸门敞开，月色入室。"
        : "纸门合拢，一室温暖。";
    });
    doors.push({ g, side });
  }
  // Fixed end panels leave a 4.4m sliding opening in the middle.
  for (const z of [-3.65, 3.65]) {
    box(root, [0.045, 2.8, 2.2], [-3.86, 1.62, z], m.paper);
    for (let i = 0; i < 7; i++)
      box(root, [0.08, 0.03, 2.22], [-3.82, 0.3 + i * 0.43, z], m.wood);
  }
  for (const z of [-3.65, 3.65])
    for (const dz of [-0.55, 0, 0.55])
      box(root, [0.065, 2.8, 0.025], [-3.811, 1.62, z + dz], m.wood);
  register(pond, "锦鲤池", "看鱼儿游动", () => "水面微动，锦鲤绕石而行。");
  return {
    root,
    update(dt, t) {
      doors.forEach(
        ({ g, side }) =>
          (g.position.z = damp(
            g.position.z,
            side * (store.state.curtains ? 3.7 : 1.11),
            dt,
            1.8,
          )),
      );
      skyMat.color.lerp(
        new THREE.Color(store.state.day ? "#809a9a" : "#20334d"),
        1 - Math.exp(-dt * 2),
      );
      moon.visible = !store.state.day;
      fish.forEach((f, i) => {
        const a = t * 0.22 + i * 2.1;
        f.position.set(
          -4.33 + Math.cos(a) * 0.25,
          0.167,
          0.53 + Math.sin(a) * 0.91,
        );
        f.rotation.y = Math.atan2(-0.25 * Math.sin(a), 0.91 * Math.cos(a));
      });
    },
  };
}
