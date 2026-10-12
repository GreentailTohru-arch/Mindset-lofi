import * as THREE from "three";
import { createMaterials as baseMaterials } from "../italian/materials.js";
import { reflectionEnvironment } from "../memphis/materials.js";
export { reflectionEnvironment };
function texture(draw, size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  let seed = 4731;
  const random = () =>
    (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  draw(canvas.getContext("2d"), random, size);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function concrete(panels) {
  return texture((c, r, s) => {
    c.fillStyle = "#98968e";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 1200; i++) {
      const x = r() * s,
        y = r() * s;
      c.fillStyle = i % 2 ? "#464a4710" : "#f1ecdd12";
      c.beginPath();
      c.ellipse(x, y, 8 + r() * 40, 3 + r() * 70, r() * 3, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = 0; i < 48000; i++) {
      c.fillStyle = i % 3 ? "#33353130" : "#fff9e637";
      c.fillRect(r() * s, r() * s, 0.5 + r() * 2.6, 0.5 + r() * 2);
    }
    if (panels) {
      for (let y = 0; y < s; y += 256) {
        c.fillStyle = "#45474060";
        c.fillRect(0, y, s, 2);
        c.fillStyle = "#e3dfd150";
        c.fillRect(0, y + 3, s, 1);
      }
      for (let x = 0; x < s; x += 512) c.fillRect(x, 0, 2, s);
      for (let x = 65; x < s; x += 384)
        for (let y = 66; y < s; y += 256) {
          c.fillStyle = "#42453ee0";
          c.beginPath();
          c.arc(x, y, 5, 0, Math.PI * 2);
          c.fill();
          c.strokeStyle = "#dfdbcd90";
          c.lineWidth = 1.5;
          c.stroke();
        }
      for (let i = 0; i < 170; i++) {
        c.strokeStyle = "#343b3415";
        c.beginPath();
        const x = r() * s,
          y = r() * s;
        c.moveTo(x, y);
        c.lineTo(x + r() * 5, y + 12 + r() * 54);
        c.stroke();
      }
    }
  });
}
export function cityTexture(night = false) {
  return texture((c, r, s) => {
    const gradient = c.createLinearGradient(0, 0, 0, s);
    gradient.addColorStop(0, night ? "#17232d" : "#7f919e");
    gradient.addColorStop(1, night ? "#465560" : "#c1c6c4");
    c.fillStyle = gradient;
    c.fillRect(0, 0, s, s);
    for (let k = 0; k < 4; k++) {
      c.fillStyle = ["#8e9b9f", "#7b8d96", "#667b85", "#5c6e77"][k];
      c.beginPath();
      c.moveTo(0, s);
      for (let x = 0; x <= s; x += 12)
        c.lineTo(
          x,
          430 +
            k * 80 +
            Math.sin(x * 0.008 + k) * 50 +
            Math.sin(x * 0.021) * 20,
        );
      c.lineTo(s, s);
      c.fill();
    }
    for (let i = 0; i < 70; i++) {
      const x = r() * s,
        y = 540 + r() * 310,
        w = 15 + r() * 55,
        h = 40 + r() * 180;
      c.fillStyle = ["#4a5a63", "#65737a", "#7d898c"][i % 3];
      c.fillRect(x, y - h, w, h);
      for (let a = 4; a < w - 3; a += 8)
        for (let b = 5; b < h - 5; b += 12) {
          c.fillStyle = night && r() > 0.5 ? "#c9ae7a" : "#c4c9c52c";
          c.fillRect(x + a, y - h + b, 3, 5);
        }
    }
  });
}
export function createMaterials() {
  const m = baseMaterials(),
    wall = concrete(true),
    floor = concrete(false);
  const mat = (color, map = null, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, map, roughness: 0.83, ...extra });
  m.wall = mat("#c6c6c3", wall, { bumpMap: wall, bumpScale: 0.026 });
  m.floor = mat("#b1b2af", floor, {
    bumpMap: floor,
    bumpScale: 0.014,
    roughness: 0.48,
  });
  m.concrete = mat("#969994", wall, { bumpMap: wall, bumpScale: 0.02 });
  m.stone = mat("#737771", floor, {
    bumpMap: floor,
    bumpScale: 0.016,
    roughness: 0.65,
  });
  m.trim = mat("#999c9c");
  m.black = mat("#171918", null, { metalness: 0.5, roughness: 0.4 });
  m.ceramic = mat("#242622", null, { roughness: 0.48 });
  m.clay = m.stone;
  m.celadon = m.ceramic;
  m.sage = m.taupe;
  m.wood.color.set("#c3a889");
  m.dark.color.set("#6c5744");
  m.fabric = m.linen.clone();
  m.fabric.color.set("#454744");
  m.leather = m.chocolate.clone();
  m.leather.color.set("#242724");
  m.rust = m.taupe.clone();
  m.rust.color.set("#935137");
  m.ochre = m.taupe.clone();
  m.ochre.color.set("#9b7950");
  m.curtain = m.fabric.clone();
  m.curtain.side = THREE.DoubleSide;
  m.throw = m.throw.clone();
  m.throw.color.set("#826044");
  const rug = texture((c, r, s) => {
    c.fillStyle = "#55534c";
    c.fillRect(0, 0, s, s);
    const colors = ["#292c2b", "#9b8e76", "#81452f", "#514a3f", "#79766d"];
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 4; col++) {
        c.fillStyle = colors[(row * 3 + col) % 5];
        c.fillRect((col * s) / 4, (row * s) / 4, s / 4, s / 4);
      }
    for (let i = 0; i < 42000; i++) {
      c.fillStyle = i % 2 ? "#e8debe24" : "#12171624";
      c.fillRect(r() * s, r() * s, 1, 1 + r() * 4);
    }
  });
  m.rug = mat("#dedbd3", rug, { bumpMap: rug, bumpScale: 0.018 });
  const art = texture((c) => {
    c.fillStyle = "#b8b3a6";
    c.fillRect(0, 0, 1024, 1024);
    for (const [x, y, w, h, color] of [
      [0, 160, 380, 860, "#333634"],
      [380, 0, 280, 500, "#ddd6c3"],
      [660, 0, 364, 650, "#875238"],
      [380, 500, 644, 524, "#62625b"],
    ]) {
      c.fillStyle = color;
      c.fillRect(x, y, w, h);
    }
    for (let i = 0; i < 1024; i += 7) {
      c.fillStyle = "#2929210b";
      c.fillRect(0, i, 1024, 1);
    }
  });
  m.art = mat("#ffffff", art);
  return m;
}
