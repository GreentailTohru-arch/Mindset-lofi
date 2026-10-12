import * as THREE from "three";
import { box, cylinder, sphere, torus, tube, group } from "../primitives.js";
import {
  books,
  pottery,
  plant,
  trailing,
  branches,
} from "../dongfang/details.js";
import { damp } from "../../state.js";

export function createFurniture(scene, m, store, register) {
  const root = group(scene);
  root.name = "industrial-furniture";
  const lamps = [],
    motions = [],
    doors = [];
  const named = (p, pos, n) => {
    const g = group(p, pos);
    g.name = "industrial-" + n;
    return g;
  };
  function touch(o, name, fn) {
    const e = { o, y: o.position.y, t: 1 };
    motions.push(e);
    register(o, name, "轻触互动", () => {
      e.t = 0;
      return fn ? fn() : "旧物与暖光，慢慢相伴。";
    });
    return o;
  }
  function rivet(p, x, y, z) {
    const b = cylinder(p, 0.015, 0.015, 0.015, [x, y, z], m.bolt, 6);
    b.rotation.x = Math.PI / 2;
  }
  function frameTable(p, w, d, h, top = m.wood) {
    box(p, [w, 0.13, d], [0, h, 0], top, 0.025);
    for (const x of [-w / 2 + 0.1, w / 2 - 0.1]) {
      for (const z of [-d / 2 + 0.1, d / 2 - 0.1])
        box(p, [0.075, h, 0.075], [x, h / 2, z], m.steel, 0.006);
      box(p, [0.09, 0.07, d - 0.13], [x, 0.13, 0], m.steel);
      for (const z of [-d / 2 + 0.012, d / 2 - 0.012]) {
        box(p, [0.12, 0.23, 0.023], [x, h - 0.1, z], m.steel);
        rivet(p, x, h - 0.06, z + 0.02);
        rivet(p, x, h - 0.17, z + 0.02);
      }
    }
    for (const z of [-d / 2 + 0.075, d / 2 - 0.075])
      box(p, [w - 0.13, 0.075, 0.055], [0, h - 0.14, z], m.steel);
  }
  function cup(p, pos) {
    const g = group(p, pos);
    cylinder(g, 0.072, 0.061, 0.13, [0, 0.065, 0], m.ceramic);
    cylinder(g, 0.063, 0.063, 0.004, [0, 0.133, 0], m.soil);
    torus(g, 0.043, 0.012, [0.075, 0.075, 0], m.ceramic, [
      Math.PI / 2,
      Math.PI / 2,
      0,
    ]);
    return g;
  }
  function bottle(p, pos, scale = 1) {
    const g = group(p, pos);
    g.scale.setScalar(scale);
    cylinder(g, 0.07, 0.08, 0.25, [0, 0.125, 0], m.glass);
    cylinder(g, 0.024, 0.06, 0.07, [0, 0.28, 0], m.glass);
    cylinder(g, 0.025, 0.025, 0.13, [0, 0.375, 0], m.glass);
    return g;
  }
  function cage(p, pos, power = 0, key = "floorLamp", scale = 1) {
    const g = group(p, pos);
    g.scale.setScalar(scale);
    const shade = m.glow.clone();
    sphere(g, [0.062, 0.14, 0.062], [0, 0.2, 0], shade);
    for (const y of [0.04, 0.13, 0.29, 0.38])
      torus(g, 0.12, 0.008, [0, y, 0], m.steel);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      tube(
        g,
        [
          [Math.cos(a) * 0.12, 0.04, Math.sin(a) * 0.12],
          [Math.cos(a) * 0.13, 0.22, Math.sin(a) * 0.13],
          [Math.cos(a) * 0.09, 0.4, Math.sin(a) * 0.09],
        ],
        0.007,
        m.steel,
      );
    }
    cylinder(g, 0.115, 0.15, 0.075, [0, 0.425, 0], m.steel);
    cylinder(g, 0.07, 0.1, 0.06, [0, 0.025, 0], m.steel);
    const world = new THREE.Vector3();
    g.updateWorldMatrix(true, false);
    g.localToWorld(world.set(0, 0.2, 0));
    lamps.push({ shade, power, key, pos: world.toArray() });
    register(g, "笼状暖光灯", "开关灯光", () => {
      store.set(key, !store.state[key]);
      return store.state[key] ? "暖光亮起。" : "灯光熄灭。";
    });
    return g;
  }
  function taskLamp(p, pos) {
    const g = group(p, pos);
    cylinder(g, 0.115, 0.13, 0.035, [0, 0.018, 0], m.steel);
    tube(
      g,
      [
        [0, 0.03, 0],
        [-0.07, 0.37, 0],
        [0.14, 0.62, 0],
        [0.26, 0.58, 0],
      ],
      0.018,
      m.steel,
    );
    for (const a of [
      [-0.07, 0.37, 0],
      [0.14, 0.62, 0],
    ])
      sphere(g, [0.035, 0.035, 0.035], a, m.bolt);
    const hood = cylinder(g, 0.075, 0.16, 0.13, [0.26, 0.52, 0], m.steel);
    hood.rotation.z = -0.3;
    const shade = m.glow.clone();
    sphere(g, [0.095, 0.025, 0.095], [0.27, 0.455, 0], shade);
    const v = new THREE.Vector3();
    g.updateWorldMatrix(true, false);
    g.localToWorld(v.set(0.25, 0.4, 0));
    lamps.push({ shade, pos: v.toArray(), power: 2.8, key: "bedLamp" });
    register(g, "金属工作台灯", "开关台灯", () => {
      store.set("bedLamp", !store.state.bedLamp);
      return "工作灯已切换。";
    });
  }
  function crate(p, pos, w = 0.55, metal = false) {
    const g = group(p, pos),
      mat = metal ? m.steel : m.wood;
    box(g, [w, 0.32, 0.38], [0, 0.16, 0], mat, 0.009);
    for (const x of [-w / 2 + 0.04, w / 2 - 0.04])
      box(g, [0.04, 0.35, 0.018], [x, 0.17, 0.198], m.steel);
    if (!metal)
      for (const y of [0.105, 0.215])
        box(g, [w - 0.09, 0.012, 0.008], [0, y, 0.198], m.black);
    box(g, [0.13, 0.045, 0.012], [0, 0.23, 0.205], m.bolt, 0.005);
    box(g, [0.105, 0.024, 0.013], [0, 0.23, 0.214], m.black);
    return g;
  }
  function pillow(p, pos, mat, angle = 0) {
    const o = box(p, [0.48, 0.48, 0.16], pos, mat, 0.075);
    o.rotation.set(-0.22, 0, angle);
    return o;
  }
  function chair(pos, angle, name) {
    const g = named(root, pos, name);
    g.rotation.y = angle;
    for (const x of [-0.48, 0.48]) {
      tube(
        g,
        [
          [x, 0.05, 0.42],
          [x, 0.49, 0.49],
          [x, 0.83, 0.42],
          [x, 0.84, -0.42],
          [x, 0.13, -0.5],
        ],
        0.025,
        m.steel,
      );
      box(g, [0.15, 0.08, 0.93], [x, 0.77, -0.01], m.leather, 0.025);
      for (const z of [-0.4, 0.4]) rivet(g, x, 0.73, z);
    }
    box(g, [0.88, 0.18, 0.87], [0, 0.42, 0], m.leather, 0.07);
    const back = box(g, [0.91, 0.66, 0.16], [0, 0.83, -0.38], m.leather, 0.065);
    back.rotation.x = -0.16;
    for (const x of [-0.24, 0, 0.24])
      for (const y of [0.74, 0.96])
        sphere(g, [0.012, 0.012, 0.007], [x, y, -0.273], m.chocolate);
    box(g, [0.9, 0.035, 0.035], [0, 0.24, -0.43], m.steel);
    pillow(g, [0.1, 0.68, -0.21], m.sage, -0.12);
    return touch(g, "做旧皮革扶手椅");
  }
  // Window wall: low storage and a restrained plant grouping.
  const bench = named(root, [-4.43, 0.015, -0.2], "window-bench");
  bench.rotation.y = Math.PI / 2;
  frameTable(bench, 4.65, 0.65, 0.61);
  box(bench, [4.5, 0.075, 0.57], [0, 0.13, 0], m.wood);
  for (const x of [-1.95, -0.5, 1.1]) crate(bench, [x, 0.17, 0], 0.62, true);
  books(bench, [0.15, 0.18, 0.05], m, 6, true);
  books(bench, [1.5, 0.68, 0.04], m, 3);
  plant(bench, [-1.5, 0.68, 0], m, 0.3);
  plant(root, [-4.3, 0.03, 3.42], m, 0.73);
  const shelf = named(root, [-3.46, 0.025, -4.35], "workshop-shelf");
  for (const x of [-1.05, 1.05])
    for (const z of [-0.33, 0.33])
      box(shelf, [0.065, 3.16, 0.065], [x, 1.58, z], m.steel);
  for (let level = 0; level < 5; level++) {
    const y = 0.18 + level * 0.63;
    box(shelf, [2.22, 0.095, 0.8], [0, y, 0], m.wood, 0.012);
    if (level % 2 === 0) {
      crate(shelf, [-0.65, y + 0.05, 0.02], 0.58, level === 2);
      books(shelf, [0.05, y + 0.05, 0.05], m, 7, true);
    } else {
      books(shelf, [-0.85, y + 0.05, 0.05], m, 4, true);
      crate(shelf, [0.52, y + 0.05, 0.02], 0.77, true);
    }
  }
  pottery(shelf, [0.7, 2.76, 0.08], 0.45, m.ceramic);
  bottle(shelf, [-0.65, 3.02, 0], 0.6);
  trailing(shelf, [0.7, 3.01, -0.05], m, 0.7);
  cage(shelf, [-1.17, 1.89, 0.43], 2.2);
  touch(shelf, "铁木开放置物架");
  // Rear-center desk and wire grid, with no electronic equipment.
  const desk = named(root, [-0.12, 0.025, -3.88], "work-desk");
  frameTable(desk, 2.6, 0.95, 1.04);
  taskLamp(desk, [-0.92, 1.12, -0.15]);
  const notebook = group(desk, [0.12, 1.12, 0.08]);
  box(notebook, [0.57, 0.03, 0.37], [0, 0, 0], m.paper, 0.005);
  box(notebook, [0.008, 0.033, 0.37], [0, 0.005, 0], m.taupe);
  cylinder(desk, 0.07, 0.065, 0.15, [0.86, 1.19, -0.19], m.steel);
  for (let i = 0; i < 6; i++) {
    const pen = cylinder(
      desk,
      0.006,
      0.006,
      0.25,
      [0.82 + i * 0.014, 1.29, -0.19],
      m.wood,
      6,
    );
    pen.rotation.z = (i - 3) * 0.05;
  }
  books(desk, [-0.55, 1.115, 0.13], m, 2);
  plant(desk, [1.04, 1.11, -0.21], m, 0.22);
  touch(desk, "旧木工作桌");
  const workChair = chair([-0.1, 0.02, -2.75], Math.PI, "work-chair");
  workChair.scale.set(0.7, 0.85, 0.7);
  const grid = named(root, [0, 2.2, -4.82], "wire-board");
  for (let i = 0; i <= 8; i++)
    box(grid, [0.014, 1.05, 0.014], [-0.77 + i * 0.1925, 0, 0], m.steel);
  for (let i = 0; i <= 6; i++)
    box(grid, [1.54, 0.014, 0.014], [0, -0.525 + i * 0.175, 0], m.steel);
  for (const [x, y, a] of [
    [-0.35, 0.17, -0.08],
    [0.33, -0.17, 0.07],
  ]) {
    const o = box(grid, [0.35, 0.42, 0.01], [x, y, 0.02], m.art);
    o.rotation.z = a;
    box(grid, [0.035, 0.03, 0.018], [x, y + 0.22, 0.034], m.bolt);
  }
  function cabinet(pos, w, h, locker = false) {
    const g = named(root, pos, locker ? "metal-locker" : "filing-cabinet");
    box(g, [w, h, 0.62], [0, h / 2, -0.03], m.steel, 0.02);
    if (locker)
      for (const x of [-w / 4, w / 4]) {
        const pivot = group(g, [x - w / 4 + 0.018, 0.11, 0.303]);
        box(
          pivot,
          [w / 2 - 0.035, h - 0.15, 0.035],
          [w / 4 - 0.018, (h - 0.15) / 2, 0],
          m.steel,
          0.008,
        );
        for (const y of [0.38, h - 0.47])
          for (let i = 0; i < 5; i++)
            box(
              pivot,
              [w / 2 - 0.16, 0.013, 0.01],
              [w / 4 - 0.018, y + i * 0.045, 0.025],
              m.black,
            );
        box(
          pivot,
          [0.028, 0.17, 0.035],
          [w / 2 - 0.12, h * 0.47, 0.035],
          m.bolt,
          0.008,
        );
        doors.push(pivot);
        register(pivot, "旧金属储物柜门", "开合柜门", () => {
          store.set("wardrobe", !store.state.wardrobe);
          return "金属柜门轻轻开合。";
        });
      }
    else
      for (let i = 0; i < 3; i++) {
        box(
          g,
          [w - 0.06, 0.32, 0.027],
          [0, 0.23 + i * 0.35, 0.301],
          m.steel,
          0.008,
        );
        box(
          g,
          [0.16, 0.045, 0.035],
          [0, 0.27 + i * 0.35, 0.335],
          m.bolt,
          0.006,
        );
        box(
          g,
          [0.13, 0.07, 0.015],
          [0, 0.17 + i * 0.35, 0.323],
          m.taupe,
          0.005,
        );
      }
    return g;
  }
  cabinet([1.8, 0.025, -4.38], 0.63, 1.16);
  plant(root, [1.8, 1.19, -4.38], m, 0.27);
  const locker = cabinet([2.83, 0.025, -4.37], 1.18, 2.55, true);
  crate(locker, [0, 2.56, 0], 0.62, true);
  trailing(locker, [0.36, 2.9, -0.12], m, 0.52);
  const console = named(root, [4.14, 0.025, -4.36], "narrow-console");
  frameTable(console, 1.28, 0.63, 0.86);
  plant(console, [-0.36, 0.94, 0], m, 0.3);
  bottle(console, [0.32, 0.94, 0], 0.6);
  pottery(console, [0.24, 0.05, 0], 0.7, m.glass);
  box(root, [1.04, 1.24, 0.07], [4.18, 2, -4.83], m.black);
  box(root, [0.93, 1.12, 0.015], [4.18, 2, -4.786], m.art);
  // Living zone: generous real clearances remain between each furniture group.
  const rug = named(root, [0, 0.025, 1.66], "distressed-rug");
  box(rug, [6.85, 0.027, 5.72], [0, 0, 0], m.rug, 0.015);
  const sofa = named(root, [0, 0.025, -0.12], "leather-sofa");
  box(sofa, [3.92, 0.27, 1.32], [0, 0.27, 0], m.leather, 0.07);
  for (const x of [-1.82, 1.82])
    box(sofa, [0.33, 0.69, 1.42], [x, 0.65, 0], m.leather, 0.1);
  for (const x of [-0.84, 0.84]) {
    box(sofa, [1.64, 0.26, 1.12], [x, 0.54, 0.09], m.leather, 0.085);
    const back = box(sofa, [1.68, 0.7, 0.3], [x, 0.99, -0.5], m.leather, 0.08);
    back.rotation.x = -0.12;
    // Piping and shallow irregular creases enhance the padded leather silhouette.
    for (const z of [-0.44, 0.61])
      tube(
        sofa,
        [
          [x - 0.72, 0.64, z],
          [x, 0.66, z],
          [x + 0.72, 0.64, z],
        ],
        0.006,
        m.stitch,
      );
    for (let i = 0; i < 5; i++)
      tube(
        sofa,
        [
          [x - 0.59 + i * 0.28, 0.77, -0.31],
          [x - 0.62 + i * 0.28, 0.95, -0.327],
          [x - 0.57 + i * 0.28, 1.16, -0.39],
        ],
        0.004,
        m.chocolate,
      );
  }
  for (const x of [-1.84, 1.84]) {
    for (let i = 0; i < 10; i++) rivet(sofa, x, 0.36 + i * 0.055, 0.716);
    for (const z of [-0.48, 0.48])
      box(sofa, [0.09, 0.17, 0.09], [x, 0.085, z], m.steel);
  }
  pillow(sofa, [-1.2, 0.98, -0.23], m.rust, -0.15);
  pillow(sofa, [-0.66, 0.97, -0.16], m.sage, 0.12);
  pillow(sofa, [0.92, 0.98, -0.21], m.taupe, -0.1);
  // A continuous draped fabric surface runs over the right arm and down its side.
  const clothGeo = new THREE.PlaneGeometry(0.68, 1.3, 18, 26),
    cp = clothGeo.attributes.position;
  for (let i = 0; i < cp.count; i++) {
    const u = cp.getX(i),
      t = (cp.getY(i) + 0.65) / 1.3;
    cp.setXYZ(
      i,
      1.47 + t * 0.67,
      0.99 - Math.max(0, t - 0.43) * 1.43 + Math.sin(u * 32) * 0.018,
      u + 0.13,
    );
  }
  clothGeo.computeVertexNormals();
  const cloth = new THREE.Mesh(clothGeo, m.throw);
  cloth.material = m.throw.clone();
  cloth.material.side = THREE.DoubleSide;
  sofa.add(cloth);
  touch(sofa, "做旧皮革沙发");
  const coffee = named(root, [0, 0.055, 1.9], "coffee-table");
  frameTable(coffee, 2.62, 1.26, 0.53);
  box(coffee, [2.38, 0.07, 1.02], [0, 0.17, 0], m.wood);
  books(coffee, [-0.61, 0.61, -0.18], m, 3);
  box(coffee, [0.73, 0.04, 0.47], [0.52, 0.61, 0.08], m.steel, 0.025);
  cup(coffee, [0.41, 0.635, 0.15]);
  bottle(coffee, [0.72, 0.635, -0.03], 0.64);
  touch(coffee, "铆钉旧木茶几");
  chair([-3.03, 0.025, 2.21], 2.55, "left-armchair");
  chair([3.05, 0.025, 2.42], -2.55, "right-armchair");
  const side = named(root, [-2.38, 0.025, 1.02], "round-side-table");
  cylinder(side, 0.36, 0.36, 0.055, [0, 0.66, 0], m.steel);
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    box(
      side,
      [0.035, 0.64, 0.035],
      [Math.cos(a) * 0.25, 0.32, Math.sin(a) * 0.25],
      m.steel,
    );
  }
  cage(side, [-0.12, 0.7, -0.03], 2.1, "floorLamp", 0.75);
  cup(side, [0.15, 0.69, 0.1]);
  const ottoman = named(root, [0.1, 0.04, 3.91], "leather-ottoman");
  box(ottoman, [1.38, 0.38, 0.97], [0, 0.27, 0], m.leather, 0.1);
  for (const x of [-0.6, 0.6])
    for (const z of [-0.38, 0.38])
      box(ottoman, [0.07, 0.14, 0.07], [x, 0.07, z], m.steel);
  for (const x of [-0.35, 0, 0.35])
    for (const z of [-0.25, 0, 0.25]) {
      sphere(ottoman, [0.013, 0.006, 0.013], [x, 0.463, z], m.chocolate);
      tube(
        ottoman,
        [
          [x - 0.1, 0.47, z - 0.13],
          [x, 0.462, z],
          [x + 0.1, 0.47, z + 0.13],
        ],
        0.004,
        m.stitch,
      );
    }
  touch(ottoman, "绗缝皮革坐墩");
  crate(root, [2.47, 0.04, -0.17], 0.64, true);
  plant(root, [2.47, 0.37, -0.17], m, 0.31);
  // The suspended lamp is attached to a rear-wall steel cantilever, no ceiling.
  tube(
    root,
    [
      [-1.4, 3.7, -4.78],
      [-1.4, 3.7, -1.75],
    ],
    0.028,
    m.steel,
  );
  tube(
    root,
    [
      [-1.4, 3.2, -4.78],
      [-1.4, 3.7, -3.35],
    ],
    0.022,
    m.steel,
  );
  for (let i = 0; i < 7; i++)
    torus(root, 0.045, 0.01, [-1.4, 3.64 - i * 0.072, -1.75], m.steel, [
      0,
      ((i % 2) * Math.PI) / 2,
      0,
    ]);
  const pendant = cage(root, [-1.4, 2.69, -1.75], 5, "floorLamp", 1.05);
  cylinder(pendant, 0.13, 0.42, 0.23, [0, 0.51, 0], m.steel);
  torus(pendant, 0.42, 0.013, [0, 0.395, 0], m.black);
  for (const [x, y, z, rot] of [
    [-4.71, 1.9, 3.76, Math.PI / 2],
    [4.36, 2.36, -4.69, 0],
  ]) {
    const mount = group(root, [x, y, z]);
    mount.rotation.y = rot;
    box(mount, [0.09, 0.3, 0.055], [0, 0.24, 0], m.steel);
    tube(
      mount,
      [
        [0, 0.32, 0],
        [0, 0.48, 0.16],
        [0, 0.39, 0.24],
      ],
      0.022,
      m.steel,
    );
    cage(mount, [0, -0.02, 0.24]);
  }
  return {
    root,
    lamps,
    update(dt) {
      for (const e of motions) {
        e.t = Math.min(1, e.t + dt / 1.05);
        e.o.position.y = e.y + Math.sin(e.t * Math.PI) * 0.045;
      }
      for (const door of doors)
        door.rotation.y = damp(
          door.rotation.y,
          store.state.wardrobe ? -1.15 : 0,
          dt,
          3,
        );
    },
    reset() {
      for (const e of motions) {
        e.t = 1;
        e.o.position.y = e.y;
      }
    },
  };
}
