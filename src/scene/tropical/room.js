import * as THREE from "three";
import { box, cylinder, group, tube } from "../primitives.js";
import { gardenTexture } from "./materials.js";
import { damp } from "../../state.js";
import { archPath } from "../bohemian/room.js";
export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "tropical-room";
  const s = new THREE.Shape();
  s.moveTo(-5.1, -5.1);
  s.lineTo(5.1, -5.1);
  s.lineTo(5.1, 5.1);
  s.lineTo(-5.1, 5.1);
  s.closePath();
  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(s, {
      depth: 0.22,
      bevelSize: 0.065,
      bevelThickness: 0.045,
      bevelSegments: 1,
    }),
    m.trim,
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.28;
  root.add(base);
  box(root, [10, 0.05, 10], [0, -0.012, 0], m.floor).name =
    "tropical-teak-floor";
  box(root, [1.6, 0.014, 9.95], [-4.18, 0.021, 0], m.tiles).name =
    "tropical-entry-terracotta";
  const tile = m.flowerTile.clone();
  tile.map = tile.map.clone();
  tile.map.repeat.set(0.13, 0.8);
  tile.map.needsUpdate = true;
  box(root, [1.07, 0.016, 8.05], [-4.18, 0.032, -0.25], tile).name =
    "tropical-floral-tiles";
  function rectangle() {
    const p = new THREE.Shape();
    p.moveTo(-5.1, 0);
    p.lineTo(5.1, 0);
    p.lineTo(5.1, 4);
    p.lineTo(-5.1, 4);
    p.closePath();
    return p;
  }
  function wall(shape) {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.22,
      bevelEnabled: false,
      curveSegments: 32,
    });
    const p = g.attributes.position,
      uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++)
      uv.setXY(i, (p.getX(i) + 5.1) / 10.2, p.getY(i) / 4);
    const o = new THREE.Mesh(g, m.wall);
    o.castShadow = o.receiveShadow = true;
    root.add(o);
    return o;
  }
  const left = rectangle(),
    opening = new THREE.Path();
  opening.moveTo(-3.7, 0.18);
  opening.lineTo(3.35, 0.18);
  opening.lineTo(3.35, 3.42);
  opening.lineTo(-3.7, 3.42);
  opening.closePath();
  left.holes.push(opening);
  const lw = wall(left);
  lw.rotation.y = Math.PI / 2;
  lw.position.x = -5.12;
  lw.name = "tropical-window-wall";
  const back = rectangle();
  for (const x of [-3.65, -0.65, 1.55])
    back.holes.push(archPath(x, 1.5, 0.65, 2.75, 0.33));
  const bw = wall(back);
  bw.position.z = -5.12;
  for (const x of [-3.65, -0.65, 1.55]) {
    const o = new THREE.Mesh(
      new THREE.ShapeGeometry(archPath(x, 1.5, 0.65, 2.75, 0.33, THREE.Shape)),
      m.wall,
    );
    o.position.z = -5.13;
    root.add(o);
    box(root, [0.65, 0.06, 0.34], [x, 1.48, -4.98], m.stone);
  }
  for (const [size, pos] of [
    [
      [10.1, 0.22, 0.22],
      [0, 3.86, -4.88],
    ],
    [
      [0.22, 0.22, 10.1],
      [-4.88, 3.86, 0],
    ],
  ])
    box(root, size, pos, m.dark, 0.018);
  for (const x of [-4.78, 0.91, 4.75]) {
    cylinder(root, 0.13, 0.15, 3.82, [x, 1.91, -4.77], m.wood, 16);
    for (const y of [0.12, 3.55, 3.73])
      cylinder(root, 0.19, 0.19, 0.11, [x, y, -4.77], m.dark, 16);
  }
  box(root, [10.2, 0.055, 0.26], [0, 4.02, -5], m.trim);
  box(root, [0.26, 0.055, 10.2], [-5, 4.02, 0], m.trim);
  box(root, [10, 0.13, 0.08], [0, 0.075, -4.85], m.dark);
  box(root, [0.08, 0.13, 10], [-4.85, 0.075, 0], m.dark);
  const win = group(root, [-4.88, 0, 0.175]);
  win.rotation.y = Math.PI / 2;
  win.name = "tropical-garden-window";
  const day = gardenTexture(),
    night = gardenTexture(true);
  const view = new THREE.Mesh(
    new THREE.PlaneGeometry(7.05, 3.24),
    new THREE.MeshBasicMaterial({ map: day, toneMapped: false }),
  );
  view.position.set(0, 1.8, -0.17);
  win.add(view);
  for (const x of [-3.525, -1.175, 1.175, 3.525])
    box(win, [0.09, 3.32, 0.13], [x, 1.79, 0], m.dark, 0.006);
  for (const y of [0.16, 3.44])
    box(win, [7.17, 0.11, 0.16], [0, y, 0], m.wood, 0.008);
  for (const x of [-3.7, 3.7]) {
    box(win, [0.36, 3.28, 0.09], [x, 1.79, 0.09], m.wood);
    for (let y = 0.27; y < 3.38; y += 0.095)
      box(win, [0.32, 0.035, 0.085], [x, y, 0.15], m.lightWood).rotation.x =
        0.35;
  }
  for (let y = 3.51; y < 3.78; y += 0.07)
    box(win, [7.05, 0.025, 0.06], [0, y, 0.01], m.wood);
  const rod = cylinder(win, 0.022, 0.022, 7.4, [0, 3.54, 0.23], m.bronze);
  rod.rotation.z = Math.PI / 2;
  const curtains = [];
  for (const sign of [-1, 1]) {
    const g = group(win, [sign * 3.525, 3.45, 0.24]);
    const geo = new THREE.PlaneGeometry(3.525, 3.25, 48, 28),
      a = geo.attributes.position;
    for (let i = 0; i < a.count; i++)
      a.setXYZ(
        i,
        (a.getX(i) + 1.7625) * -sign,
        a.getY(i) - 1.625,
        Math.sin(a.getX(i) * 32) * 0.04 + Math.sin(a.getY(i) * 4) * 0.012,
      );
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, m.curtain);
    mesh.receiveShadow = true;
    g.add(mesh);
    g.scale.x = 0.18;
    curtains.push(g);
    register(g, "热带亚麻纱帘", "拉开 / 合拢", () => {
      store.set("curtains", !store.state.curtains);
      return "纱帘伴着庭院晚风轻轻开合。";
    });
  }
  const door = group(win, [0.95, 0, 0.015]);
  const glass = new THREE.MeshStandardMaterial({
    color: "#d3decf",
    transparent: true,
    opacity: 0.055,
    roughness: 0.18,
    depthWrite: false,
  });
  box(door, [1.83, 3.15, 0.012], [-0.95, 1.8, 0], glass).castShadow = false;
  for (const x of [0, -1.9])
    box(door, [0.06, 3.2, 0.07], [x, 1.8, 0.02], m.dark);
  for (const y of [0.2, 3.39])
    box(door, [1.9, 0.05, 0.07], [-0.95, y, 0.02], m.dark);
  box(door, [0.03, 0.25, 0.12], [-1.76, 1.2, 0.08], m.bronze, 0.008);
  register(door, "庭院玻璃门", "轻开 / 合上", () => {
    store.set("window", !store.state.window);
    return "庭院水声，随晚风入室。";
  });
  return {
    root,
    update(dt) {
      view.material.map = store.state.day ? day : night;
      for (const g of curtains)
        g.scale.x = damp(g.scale.x, store.state.curtains ? 0.18 : 1, dt, 2.4);
      door.rotation.y = damp(
        door.rotation.y,
        store.state.window ? -0.22 : 0,
        dt,
        3,
      );
    },
  };
}
