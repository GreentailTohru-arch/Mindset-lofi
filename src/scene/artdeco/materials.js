import * as THREE from "three";
import { createMaterials as base } from "../italian/materials.js";
export { skyline } from "../industrial/materials.js";

function texture(draw, size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  let seed = 1925;
  const r = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  draw(c.getContext("2d"), r, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function marble(dark = false) {
  return texture((c, r, s) => {
    c.fillStyle = dark ? "#171c1c" : "#e2d9c6";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 27; i++) {
      let y = r() * s;
      c.strokeStyle = dark
        ? i % 3
          ? "#b5b4a06a"
          : "#e8ddc98a"
        : i % 3
          ? "#ad92723c"
          : "#95857344";
      c.lineWidth = 0.5 + r() * 2.3;
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x <= s; x += 12) {
        y += Math.sin(x * 0.026 + i) * 2 + r() * 7 - 1.8;
        c.lineTo(x, y);
      }
      c.stroke();
    }
    for (let i = 0; i < 24000; i++) {
      c.fillStyle = i % 2 ? "#fff7db0a" : "#56463408";
      c.fillRect(r() * s, r() * s, 1 + r() * 2, 1 + r() * 2);
    }
  });
}
function rugTexture() {
  return texture((c, r, s) => {
    c.fillStyle = "#dfd0b2";
    c.fillRect(0, 0, s, s);
    for (const [inset, color, width] of [
      [16, "#152e28", 28],
      [39, "#bc984f", 8],
      [54, "#191e1b", 12],
      [76, "#9a7943", 3],
    ]) {
      c.strokeStyle = color;
      c.lineWidth = width;
      c.strokeRect(inset, inset, s - inset * 2, s - inset * 2);
    }
    // Four mirrored stepped corners surround the balanced fan medallions.
    for (const sx of [-1, 1])
      for (const sy of [-1, 1]) {
        c.save();
        c.translate(sx < 0 ? s : 0, sy < 0 ? s : 0);
        c.scale(sx, sy);
        c.fillStyle = "#20372c";
        c.beginPath();
        c.moveTo(90, 90);
        c.lineTo(360, 90);
        c.lineTo(360, 135);
        c.lineTo(285, 135);
        c.lineTo(285, 185);
        c.lineTo(205, 185);
        c.lineTo(205, 240);
        c.lineTo(90, 240);
        c.closePath();
        c.fill();
        c.strokeStyle = "#b99754";
        c.lineWidth = 4;
        c.stroke();
        c.restore();
      }
    for (const flip of [false, true]) {
      c.save();
      if (flip) {
        c.translate(s, s);
        c.rotate(Math.PI);
      }
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * 1.13 + i * 0.093 * Math.PI,
          b = a + 0.085 * Math.PI;
        c.beginPath();
        c.moveTo(512, 365);
        c.arc(512, 365, 225, a, b);
        c.closePath();
        c.fillStyle = i % 2 ? "#203b31" : "#203029";
        c.fill();
        c.strokeStyle = "#b49658";
        c.lineWidth = 3;
        c.stroke();
      }
      c.restore();
    }
    c.strokeStyle = "#8f7545";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(290, 512);
    c.lineTo(512, 390);
    c.lineTo(734, 512);
    c.lineTo(512, 634);
    c.closePath();
    c.stroke();
    for (let i = 0; i < 45000; i++) {
      c.fillStyle = i % 2 ? "#fff3d218" : "#40362812";
      c.fillRect(r() * s, r() * s, 1 + r() * 2, 1);
    }
  });
}
export function createMaterials() {
  const m = base();
  const cream = marble(),
    black = marble(true);
  m.wall = new THREE.MeshStandardMaterial({
    map: cream,
    roughness: 0.46,
    bumpMap: cream,
    bumpScale: 0.003,
  });
  m.stone = new THREE.MeshPhysicalMaterial({
    map: black,
    roughness: 0.23,
    clearcoat: 0.7,
    clearcoatRoughness: 0.15,
  });
  m.gold = new THREE.MeshStandardMaterial({
    color: "#d5ad61",
    metalness: 0.82,
    roughness: 0.26,
  });
  m.bronze = m.gold;
  m.lacquer = new THREE.MeshPhysicalMaterial({
    color: "#131d1b",
    roughness: 0.22,
    clearcoat: 0.9,
    clearcoatRoughness: 0.18,
  });
  m.wood.color.set("#a38a6d");
  m.wood.roughness = 0.32;
  m.dark = m.wood;
  m.velvet = new THREE.MeshPhysicalMaterial({
    color: "#123f33",
    map: m.linen.map,
    bumpMap: m.linen.map,
    bumpScale: 0.008,
    roughness: 0.82,
    sheen: 0.8,
    sheenColor: "#426b55",
    sheenRoughness: 0.8,
  });
  m.wine = m.velvet.clone();
  m.wine.color.set("#612334");
  m.wine.sheenColor.set("#965669");
  m.sage = m.velvet;
  m.seam = new THREE.MeshStandardMaterial({ color: "#35584a", roughness: 0.9 });
  m.celadon = m.ceramic;
  m.woven = m.linen;
  m.ceramic.color.set("#e6dfcc");
  m.paper.color.set("#e4d5b7");
  m.taupe.color.set("#39332c");
  m.curtain = m.velvet.clone();
  m.curtain.side = THREE.DoubleSide;
  m.glass = new THREE.MeshPhysicalMaterial({
    color: "#e3e4d9",
    metalness: 0.05,
    roughness: 0.08,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  m.rug = new THREE.MeshStandardMaterial({
    map: rugTexture(),
    roughness: 1,
    bumpScale: 0.012,
  });
  m.rug.bumpMap = m.rug.map;
  const grain = texture((c, r, s) => {
    c.fillStyle = "#704726";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 2000; i++) {
      c.strokeStyle = i % 2 ? "#d0a46d25" : "#28190f30";
      c.lineWidth = 0.5 + r() * 2;
      const x = r() * s;
      c.beginPath();
      c.moveTo(x, 0);
      for (let y = 0; y <= s; y += 24)
        c.lineTo(x + Math.sin(y * 0.013 + i) * 5, y);
      c.stroke();
    }
  });
  m.floor = new THREE.MeshPhysicalMaterial({
    map: grain,
    vertexColors: true,
    roughness: 0.28,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    bumpMap: grain,
    bumpScale: 0.003,
  });
  m.trim.color.set("#aaa9a1");
  m.glazing = m.glass.clone();
  m.glazing.opacity = 0.065;
  return m;
}

// A local studio-light environment supplies coherent reflections without a remote HDRI.
export function reflectionEnvironment() {
  const faces = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const p = c.getContext("2d");
    const g = p.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "#cec4ac");
    g.addColorStop(0.5, i === 1 ? "#8b94c0" : "#9f9178");
    g.addColorStop(1, "#38352e");
    p.fillStyle = g;
    p.fillRect(0, 0, 128, 128);
    p.fillStyle = i === 1 ? "#c1c9e2" : "#f0d6a2";
    p.fillRect(22, 15, 13, 78);
    p.fillRect(75, 15, 5, 78);
    faces.push(c);
  }
  const env = new THREE.CubeTexture(faces);
  env.colorSpace = THREE.SRGBColorSpace;
  env.needsUpdate = true;
  return env;
}
