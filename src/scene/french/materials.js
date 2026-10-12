import * as THREE from "three";
import { createMaterials as base } from "../italian/materials.js";
import { afternoonTexture } from "../midcentury/materials.js";
export { afternoonTexture };
function texture(draw) {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  let seed = 1963;
  const r = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  draw(c.getContext("2d"), r);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
export function createMaterials() {
  const m = base();
  const fabric = (c) => {
    const a = m.linen.clone();
    a.color.set(c);
    return a;
  };
  m.rose = fabric("#b38f86");
  m.sage = fabric("#89917b");
  m.linen.color.set("#fff7e5");
  m.panel = new THREE.MeshStandardMaterial({
    color: "#eee3ca",
    roughness: 0.78,
  });
  m.moulding = new THREE.MeshStandardMaterial({
    color: "#fff4dd",
    roughness: 0.72,
  });
  m.gold = new THREE.MeshStandardMaterial({
    color: "#b69a61",
    metalness: 0.73,
    roughness: 0.36,
  });
  m.bronze = m.gold;
  m.woodDark = m.dark;
  m.celadon = m.sage;
  m.woven = m.taupe;
  m.ceramic.color.set("#e2d6bd");
  m.wall.color.set("#fff5e3");
  m.stone.color.set("#fffaf0");
  m.stone.roughness = 0.38;
  const grain = texture((c, r) => {
    c.fillStyle = "#bd915e";
    c.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 2100; i++) {
      c.strokeStyle = i % 3 ? "#54391d18" : "#ffe1a322";
      c.lineWidth = 0.5 + r() * 2;
      c.beginPath();
      const x = r() * 1024;
      c.moveTo(x, 0);
      for (let y = 0; y <= 1024; y += 32)
        c.lineTo(x + Math.sin(y * 0.016 + i) * 3, y);
      c.stroke();
    }
  });
  m.floor = new THREE.MeshStandardMaterial({
    color: "#fff2da",
    map: grain,
    bumpMap: grain,
    bumpScale: 0.009,
    vertexColors: true,
    roughness: 0.62,
  });
  m.rug.map = texture((c, r) => {
    c.fillStyle = "#c4b49a";
    c.fillRect(0, 0, 1024, 1024);
    for (const [inset, color] of [
      [16, "#827b64"],
      [27, "#e0ceb1"],
      [63, "#9e8874"],
      [80, "#deceb3"],
    ]) {
      c.strokeStyle = color;
      c.lineWidth = 10;
      c.strokeRect(inset, inset, 1024 - inset * 2, 1024 - inset * 2);
    }
    for (let y = 45; y < 1024; y += 65)
      for (let x = 45; x < 1024; x += 65) {
        const xx = x + (Math.floor(y / 65) % 2) * 17;
        c.fillStyle = "#97806c";
        for (let k = 0; k < 6; k++) {
          const a = (k * Math.PI) / 3;
          c.beginPath();
          c.ellipse(
            xx + Math.cos(a) * 9,
            y + Math.sin(a) * 9,
            4,
            8,
            a,
            0,
            Math.PI * 2,
          );
          c.fill();
        }
        c.fillStyle = "#caa798";
        c.beginPath();
        c.arc(xx, y, 5, 0, 7);
        c.fill();
      }
    for (let i = 0; i < 85000; i++) {
      c.fillStyle = i % 2 ? "#fff8de16" : "#342a2115";
      c.fillRect(r() * 1024, r() * 1024, 1, 2);
    }
  });
  m.rug.color.set("#ffffff");
  m.rug.bumpMap = m.rug.map;
  m.pattern = m.rose.clone();
  m.pattern.map = m.rug.map;
  m.art = new THREE.MeshStandardMaterial({
    map: afternoonTexture(),
    color: "#b9a686",
    roughness: 0.96,
  });
  return m;
}
