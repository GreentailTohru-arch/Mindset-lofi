import * as THREE from "three";
import { createMaterials as baseMaterials, seeded } from "../materials.js";

export function textureCanvas(draw, size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size, seeded(621));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
export function seaTexture(day = true) {
  return textureCanvas((c, s, r) => {
    const g = c.createLinearGradient(0, 0, 0, s * 0.62);
    g.addColorStop(0, day ? "#889dbd" : "#122740");
    g.addColorStop(0.65, day ? "#eebba2" : "#475d7d");
    g.addColorStop(1, day ? "#f6ce8c" : "#748297");
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
    c.fillStyle = day ? "#fff0b7" : "#e7e8d8";
    c.beginPath();
    c.arc(s * 0.36, s * 0.43, s * 0.036, 0, Math.PI * 2);
    c.fill();
    for (let i = 0; i < 3; i++) {
      c.fillStyle = ["#8993a7", "#6a8095", "#506f84"][i];
      c.beginPath();
      c.moveTo(s * 0.55, s * 0.57);
      for (let x = s * 0.55; x <= s; x += 6)
        c.lineTo(
          x,
          s * (0.51 + i * 0.035) -
            Math.sin(x * 0.011 + i) * s * 0.045 -
            Math.sin(x * 0.021) * s * 0.016,
        );
      c.lineTo(s, s * 0.66);
      c.closePath();
      c.fill();
    }
    const water = c.createLinearGradient(0, s * 0.6, 0, s);
    water.addColorStop(0, day ? "#5788a7" : "#2f526f");
    water.addColorStop(1, day ? "#2c6481" : "#193e59");
    c.fillStyle = water;
    c.fillRect(0, s * 0.6, s, s * 0.4);
    for (let i = 0; i < 1100; i++) {
      const y = s * (0.61 + r() * 0.39),
        x = r() * s;
      const reflection = Math.abs(x / s - 0.36) < 0.015 + (y / s - 0.6) * 0.18;
      c.fillStyle = reflection
        ? day
          ? "#ffe2a680"
          : "#c4d6dc56"
        : "#b9dcdf24";
      c.fillRect(x, y, 3 + r() * 22, 1 + r());
    }
    c.fillStyle = "#496e75";
    c.beginPath();
    c.moveTo(s * 0.82, s);
    c.quadraticCurveTo(s * 0.84, s * 0.84, s, s * 0.78);
    c.lineTo(s, s);
    c.fill();
  }, 1024);
}

export function mosaicTexture() {
  return textureCanvas((c, s, r) => {
    const n = 100,
      u = s / n;
    for (let row = 0; row < n; row++)
      for (let col = 0; col < n; col++) {
        const dx = col - 49.5,
          dy = row - 49.5,
          edge = Math.min(row, col, n - 1 - row, n - 1 - col);
        let blue = edge === 3 || edge === 11;
        if (edge > 4 && edge < 10) {
          const along = (row < 12 || row > 87 ? col : row) % 10,
            across = edge - 5;
          blue =
            (across === 0 && along < 8) ||
            (across === 4 && along > 1) ||
            (along === 7 && across < 4) ||
            (along === 2 && across > 1) ||
            (across === 2 && along >= 2 && along <= 5);
        }
        const radius = Math.hypot(dx, dy),
          a = Math.atan2(dy, dx);
        if (radius < 20)
          blue =
            radius > 18 ||
            radius < 3 ||
            (radius > 6 &&
              radius < 14 + Math.cos(a * 8) * 3 &&
              Math.cos(a * 8) > 0.08);
        if (edge > 14 && radius > 23) blue = row % 12 < 2 && col % 12 < 2;
        c.fillStyle = blue
          ? ["#34617b", "#426e89", "#597e94"][Math.floor(r() * 3)]
          : ["#ddd8c9", "#eae4d2", "#d1d1c8", "#f0e8d5"][Math.floor(r() * 4)];
        c.fillRect(col * u, row * u, u - 0.6, u - 0.6);
      }
  }, 1024);
}

export function createMaterials() {
  const m = baseMaterials();
  const stone = textureCanvas((c, s, r) => {
    c.fillStyle = "#dfddd3";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 22000; i++) {
      c.fillStyle = r() > 0.5 ? "#fff9e41a" : "#756e5d10";
      c.fillRect(r() * s, r() * s, 1 + r() * 3, 1 + r() * 2);
    }
  });
  const marble = textureCanvas((c, s, r) => {
    c.fillStyle = "#e8e6dd";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 40; i++) {
      const y = r() * s;
      c.strokeStyle = "#717d8522";
      c.lineWidth = 0.5 + r() * 1.6;
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x <= s; x += 12)
        c.lineTo(x, y + x * 0.25 + Math.sin(x * 0.03 + i) * 13);
      c.stroke();
    }
  });
  m.wall.color.set("#eee6d3");
  m.wall.map = stone;
  m.wall.bumpMap = stone;
  m.wall.bumpScale = 0.018;
  m.trim = m.wall.clone();
  m.trim.color.set("#ded7c8");
  m.marble = new THREE.MeshStandardMaterial({
    color: "#ece9df",
    map: marble,
    roughness: 0.42,
    bumpMap: marble,
    bumpScale: 0.008,
  });
  m.blue = new THREE.MeshStandardMaterial({
    color: "#386b8b",
    roughness: 0.84,
  });
  m.bronze = new THREE.MeshStandardMaterial({
    color: "#967546",
    metalness: 0.68,
    roughness: 0.42,
  });
  m.terracotta = new THREE.MeshStandardMaterial({
    color: "#b2643e",
    roughness: 0.87,
    map: stone,
  });
  m.floor = new THREE.MeshStandardMaterial({
    map: mosaicTexture(),
    roughness: 0.64,
  });
  m.wood.color.set("#92704a");
  m.woodDark.color.set("#5b4534");
  m.woodLight.color.set("#b89664");
  m.paper = new THREE.MeshStandardMaterial({
    color: "#e6d5ae",
    roughness: 0.93,
  });
  m.linen = m.pillow.clone();
  m.linen.color.set("#e5dac4");
  m.cushion = m.duvet.clone();
  m.cushion.color.set("#53748b");
  m.curtain.color.set("#e7e0cb");
  m.curtain.transparent = true;
  m.curtain.opacity = 0.64;
  m.curtain.depthWrite = false;
  m.leaf.color.set("#556e44");
  m.leafLight.color.set("#82905d");
  m.ceramic.color.set("#d9d3ba");
  m.rug.color.set("#b8a279");
  m.glow = new THREE.MeshStandardMaterial({
    color: "#ffe3a6",
    emissive: "#ffd28b",
    emissiveIntensity: 0.6,
    roughness: 0.65,
  });
  return m;
}
