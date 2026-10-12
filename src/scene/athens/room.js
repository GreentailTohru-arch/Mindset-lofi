import * as THREE from "three";
import { box, cylinder, group, tube } from "../primitives.js";
import { ionicColumn, archedShape } from "./architecture.js";
import { seaTexture } from "./materials.js";
import { damp } from "../../state.js";

export function createRoom(scene, m, store, register) {
  const root = group(scene);
  root.name = "雅典神话 · 海景别墅";
  box(root, [10.35, 0.3, 10.35], [0, -0.16, 0], m.trim, 0.02);
  box(root, [10, 0.055, 10], [0, 0.015, 0], m.floor);
  // The arched niche is a genuine recess cut out of the back wall.
  const wall = new THREE.Shape();
  wall.moveTo(-5, 0);
  wall.lineTo(5, 0);
  wall.lineTo(5, 4);
  wall.lineTo(-5, 4);
  wall.closePath();
  const niche = archedShape(1.3, 1.32, 2.35, 2.55);
  wall.holes.push(new THREE.Path(niche.getPoints(48)));
  const wallMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(wall, { depth: 0.19, bevelEnabled: false }),
    m.wall,
  );
  wallMesh.position.z = -5.08;
  wallMesh.name = "limestone-niche-wall";
  wallMesh.castShadow = true;
  wallMesh.receiveShadow = true;
  root.add(wallMesh);
  const backing = new THREE.Mesh(new THREE.ShapeGeometry(niche), m.blue);
  backing.position.z = -5.09;
  root.add(backing);
  const archPoints = [
    [0.125, 1.32, -4.86],
    [0.125, 2.55, -4.86],
  ];
  for (let i = 0; i <= 28; i++) {
    const a = Math.PI - (i * Math.PI) / 28;
    archPoints.push([
      1.3 + Math.cos(a) * 1.175,
      2.55 + Math.sin(a) * 1.175,
      -4.86,
    ]);
  }
  archPoints.push([2.475, 1.32, -4.86]);
  tube(root, archPoints, 0.04, m.trim);
  box(root, [2.49, 0.12, 0.46], [1.3, 1.31, -4.81], m.marble, 0.014);
  box(root, [10.18, 0.15, 0.3], [0, 3.96, -4.98], m.trim, 0.014);
  box(root, [10, 0.17, 0.085], [0, 0.12, -4.87], m.trim);
  box(root, [0.22, 0.51, 10], [-4.99, 0.27, 0], m.wall);
  box(root, [0.23, 4, 0.26], [-4.99, 2, -4.85], m.wall);
  box(root, [0.23, 4, 0.26], [-4.99, 2, 4.85], m.wall);
  box(root, [0.53, 0.26, 10.15], [-4.92, 3.8, 0], m.trim, 0.014);
  for (const z of [-4.2, -1.4, 1.4, 4.2]) {
    const column = ionicColumn(root, [-4.76, 0.24, z], m);
    column.rotation.y = Math.PI / 2;
  }
  // Short rows of barrel roof tiles suggest the roof without hiding the room.
  const tileGeo = new THREE.CylinderGeometry(
    0.145,
    0.145,
    0.57,
    16,
    1,
    true,
    0,
    Math.PI,
  );
  for (let i = 0; i < 35; i++) {
    const tile = new THREE.Mesh(tileGeo, m.terracotta);
    tile.rotation.set(0, 0, Math.PI / 2);
    tile.position.set(-4.96, 4.07, -4.84 + i * 0.285);
    tile.castShadow = true;
    root.add(tile);
  }
  const sunset = seaTexture(true),
    night = seaTexture(false);
  const seaMat = new THREE.MeshBasicMaterial({
    map: sunset,
    toneMapped: false,
    color: "#e3d5c5",
  });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 3.2), seaMat);
  sea.rotation.y = Math.PI / 2;
  sea.position.set(-5.015, 2.05, 0);
  root.add(sea);
  register(sea, "爱琴海远景", "夕照 / 月夜", () => {
    store.set("day", !store.state.day);
    return store.state.day ? "夕阳落海 · 金色涟漪" : "月色映海 · 潮声渐静";
  });
  const curtains = [-1, 1].map((sign) => {
    const g = group(root, [-4.38, 3.65, sign * 4.46]);
    g.rotation.y = Math.PI / 2;
    const geo = new THREE.PlaneGeometry(4.46, 3.07, 50, 20),
      a = geo.attributes.position;
    for (let i = 0; i < a.count; i++)
      a.setXYZ(
        i,
        (a.getX(i) + 2.23) * sign,
        a.getY(i) - 1.535,
        Math.sin(a.getX(i) * 24) * 0.065,
      );
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, m.curtain);
    mesh.receiveShadow = true;
    g.add(mesh);
    register(g, "亚麻海风帘", "展开 / 收拢", () => {
      store.set("curtains", !store.state.curtains);
      return store.state.curtains
        ? "收拢亚麻帘 · 海风入室"
        : "垂下亚麻帘 · 温柔遮光";
    });
    return g;
  });
  const rod = cylinder(root, 0.024, 0.024, 9.05, [-4.39, 3.69, 0], m.bronze);
  rod.rotation.x = Math.PI / 2;
  return {
    root,
    update(dt, t) {
      seaMat.map = store.state.day ? sunset : night;
      seaMat.color.set(store.state.day ? "#e3d5c5" : "#a8bfd1");
      curtains.forEach((g) => {
        g.scale.x = damp(g.scale.x, store.state.curtains ? 0.105 : 1, dt, 2);
        g.position.x = -4.38 + Math.sin(t * 0.45) * 0.018;
      });
    },
  };
}
