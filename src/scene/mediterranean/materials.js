import * as THREE from "three";
import { createMaterials as baseMaterials } from "../dongfang/materials.js";

function canvasTexture(draw, size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  let seed = 8239;
  const random = () =>
    (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  draw(canvas.getContext("2d"), random, size);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
export function coastTexture(night = false) {
  return canvasTexture((c, r, s) => {
    const sky = c.createLinearGradient(0, 0, 0, 580);
    sky.addColorStop(0, night ? "#29334d" : "#b69bab");
    sky.addColorStop(0.55, night ? "#43566d" : "#e9b7a3");
    sky.addColorStop(1, night ? "#778295" : "#ffdfaa");
    c.fillStyle = sky;
    c.fillRect(0, 0, s, s);
    c.fillStyle = night ? "#e4e7d7" : "#fff1c8";
    c.beginPath();
    c.arc(237, 372, night ? 23 : 34, 0, Math.PI * 2);
    c.fill();
    for (let layer = 0; layer < 4; layer++) {
      c.fillStyle = ["#a29caf", "#a7a1b0", "#9299ad", "#7d91a5"][layer];
      c.beginPath();
      c.moveTo(350, 550);
      for (let i = 0; i < 12; i++)
        c.lineTo(
          350 + i * 68,
          480 - layer * 12 - Math.sin(i * 0.82 + layer) * 45,
        );
      c.lineTo(s, 590);
      c.closePath();
      c.fill();
    }
    const sea = c.createLinearGradient(0, 540, 0, s);
    sea.addColorStop(0, night ? "#405b72" : "#688caa");
    sea.addColorStop(1, night ? "#254856" : "#235a77");
    c.fillStyle = sea;
    c.fillRect(0, 550, s, 474);
    for (let i = 0; i < 1600; i++) {
      const y = 556 + r() * 468,
        x = r() * s;
      c.strokeStyle = i % 3 ? "#d5d8cc30" : "#eff1dd55";
      c.lineWidth = 0.4 + r();
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 3 + r() * 24, y);
      c.stroke();
    }
    for (let i = 0; i < 200; i++) {
      const y = 570 + r() * 435;
      c.strokeStyle = "#f6d5a333";
      c.beginPath();
      c.moveTo(230 - (y - 550) * 0.2 + r() * 70, y);
      c.lineTo(235 + (y - 550) * 0.25 + r() * 40, y);
      c.stroke();
    }
    c.fillStyle = "#857b73";
    c.beginPath();
    c.moveTo(1030, 505);
    c.bezierCurveTo(785, 522, 935, 677, 756, 710);
    c.bezierCurveTo(662, 746, 814, 838, 556, 975);
    c.lineTo(1024, 1024);
    c.closePath();
    c.fill();
    c.fillStyle = "#70816b";
    c.beginPath();
    c.moveTo(1024, 540);
    c.bezierCurveTo(875, 614, 947, 722, 802, 761);
    c.lineTo(676, 1000);
    c.lineTo(1024, 1024);
    c.closePath();
    c.fill();
    for (let i = 0; i < 65; i++) {
      const y = 576 + r() * 357,
        x = 995 - (y - 570) * 0.43 + r() * 115 - 70,
        w = 15 + r() * 28,
        h = 12 + r() * 22;
      c.fillStyle = i % 3 ? "#e8dfca" : "#f8eedb";
      c.fillRect(x, y, w, h);
      c.fillStyle = i % 2 ? "#ba795c" : "#a5644e";
      c.beginPath();
      c.moveTo(x - 3, y);
      c.lineTo(x + w * 0.45, y - 7);
      c.lineTo(x + w + 3, y);
      c.closePath();
      c.fill();
      c.fillStyle = night ? "#e1ba75" : "#557a80";
      c.fillRect(x + w * 0.2, y + 5, 4, 7);
      c.fillRect(x + w * 0.65, y + 5, 4, 7);
    }
    for (let i = 0; i < 26; i++) {
      const x = 740 + r() * 260,
        y = 660 + r() * 335;
      c.fillStyle = "#36544e";
      c.beginPath();
      c.ellipse(x, y, 4 + r() * 5, 20 + r() * 25, 0, 0, Math.PI * 2);
      c.fill();
    }
  });
}
export function createMaterials() {
  const m = baseMaterials();
  const mat = (color, map = null, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, map, roughness: 0.83, ...extra });
  const tiles = canvasTexture((c, r, s) => {
    c.fillStyle = "#baaa94";
    c.fillRect(0, 0, s, s);
    for (let row = 0; row < 16; row++)
      for (let col = 0; col < 16; col++) {
        const x = col * 64,
          y = row * 64,
          pale = (row + col) % 7 === 0 || row === 15 || col === 0,
          v = r() * 22;
        c.fillStyle = pale
          ? `rgb(${204 + v},${184 + v},${154 + v})`
          : `rgb(${169 + v},${94 + v},${65 + v})`;
        c.fillRect(x + 1, y + 1, 62, 62);
        for (let j = 0; j < 65; j++) {
          c.fillStyle = j % 3 ? "#efe0bb24" : "#573b3222";
          c.fillRect(
            x + 2 + r() * 59,
            y + 2 + r() * 59,
            1 + r() * 8,
            1 + r() * 3,
          );
        }
        c.strokeStyle = "#f0dab342";
        c.strokeRect(x + 2, y + 2, 60, 60);
      }
  });
  const plaster = canvasTexture((c, r, s) => {
    c.fillStyle = "#e9dfcd";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 26000; i++) {
      c.fillStyle = i % 3 ? "#fff7e317" : "#a9977a13";
      c.fillRect(r() * s, r() * s, 1 + r() * 13, 1 + r() * 5);
    }
  });
  const stripes = canvasTexture((c, r, s) => {
    c.fillStyle = "#eee4d1";
    c.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 128) {
      c.fillStyle = "#647d8d";
      c.fillRect(x, 0, 51, s);
      c.fillStyle = "#a3adb0";
      c.fillRect(x + 62, 0, 10, s);
    }
    for (let i = 0; i < s; i += 3) {
      c.fillStyle = "#fff1d42b";
      c.fillRect(i, 0, 1, s);
      c.fillRect(0, i, s, 1);
    }
  });
  const woven = canvasTexture((c, r, s) => {
    c.fillStyle = "#bca078";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < s; i += 4) {
      c.fillStyle = i % 8 ? "#eee0bc55" : "#6a584233";
      c.fillRect(i, 0, 2, s);
      c.fillRect(0, i, s, 2);
    }
    for (let i = 0; i < 7000; i++) {
      c.fillStyle = "#f3dfb128";
      c.fillRect(r() * s, r() * s, 3, 2);
    }
  });
  const limestone = canvasTexture((c, r, s) => {
    c.fillStyle = "#d2c4ac";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 22000; i++) {
      c.fillStyle = i % 3 ? "#fff5df30" : "#8a7a6233";
      c.fillRect(r() * s, r() * s, 1 + r() * 6, 1 + r() * 3);
    }
  });
  const mosaic = canvasTexture((c, r, s) => {
    c.fillStyle = "#d6c8b0";
    c.fillRect(0, 0, s, s);
    for (let ring = 0; ring < 10; ring++) {
      const rad = ring * 47 + 22,
        n = 12 + ring * 8;
      for (let j = 0; j < n; j++) {
        const a = (j / n) * Math.PI * 2;
        c.save();
        c.translate(s / 2 + Math.cos(a) * rad, s / 2 + Math.sin(a) * rad);
        c.rotate(a);
        c.fillStyle = ["#ddd2b8", "#566268", "#ac7457", "#ece2cf"][
          (j + ring) % 4
        ];
        c.fillRect(
          -20,
          -((2 * Math.PI * rad) / n) * 0.43,
          40,
          ((2 * Math.PI * rad) / n) * 0.86,
        );
        c.restore();
      }
    }
  });
  m.floor = mat("#ffffff", tiles, {
    bumpMap: tiles,
    bumpScale: 0.008,
    roughness: 0.78,
  });
  m.wall = mat("#fff8e9", plaster, { bumpMap: plaster, bumpScale: 0.017 });
  m.stone = mat("#fff2d8", limestone, { bumpMap: limestone, bumpScale: 0.035 });
  m.clay = mat("#ba805c", limestone, { bumpMap: limestone, bumpScale: 0.012 });
  m.wood.color.set("#e0c5a2");
  m.lightWood = mat("#bc9c70", m.wood.map, { roughness: 0.65 });
  m.linen.color.set("#fff6e5");
  m.stripe = mat("#ffffff", stripes, { bumpMap: stripes, bumpScale: 0.013 });
  m.blue = mat("#6c8798", m.linen.map);
  m.shutter = mat("#709494", plaster, { bumpMap: plaster, bumpScale: 0.008 });
  m.rug = mat("#efe0c2", woven, { bumpMap: woven, bumpScale: 0.019 });
  m.woven = mat("#c8ac7d", woven, { bumpMap: woven, bumpScale: 0.015 });
  m.black = mat("#292b29", null, { metalness: 0.5, roughness: 0.48 });
  m.fruit = mat("#edc853");
  m.flower = mat("#b85e81");
  m.ceramic = mat("#e0d4ba", null, { roughness: 0.4 });
  m.mosaic = mat("#ffffff", mosaic, {
    roughness: 0.56,
    bumpMap: mosaic,
    bumpScale: 0.009,
  });
  m.artwork = mat("#e3dacb", coastTexture(), { roughness: 1 });
  return m;
}
