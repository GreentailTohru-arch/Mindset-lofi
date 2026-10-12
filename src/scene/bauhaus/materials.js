import * as THREE from "three";
import { createMaterials as baseMaterials, seeded } from "../materials.js";

function canvasTexture(draw, w = 512, h = 512) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), seeded(406));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
export function courtyardTexture(day = true) {
  return canvasTexture(
    (c, r) => {
      const sky = c.createLinearGradient(0, 0, 0, 640);
      sky.addColorStop(0, day ? "#c3d5dc" : "#192841");
      sky.addColorStop(1, day ? "#f5deaf" : "#596979");
      c.fillStyle = sky;
      c.fillRect(0, 0, 1024, 640);
      c.fillStyle = day ? "#ffedc1" : "#eee8d7";
      c.beginPath();
      c.arc(748, 120, 33, 0, Math.PI * 2);
      c.fill();
      for (let i = 0; i < 14; i++) {
        const x = i * 88 - 32,
          y = 200 + r() * 140,
          h = 640 - y;
        c.fillStyle = day
          ? ["#b9b5a4", "#c8bbaa", "#a4b0ad"][i % 3]
          : ["#34475a", "#293d51", "#3b4a5c"][i % 3];
        c.fillRect(x, y, 75, h);
        for (let yy = y + 22; yy < 625; yy += 35)
          for (let xx = x + 12; xx < x + 68; xx += 22) {
            c.fillStyle = day ? "#798a893b" : r() > 0.7 ? "#d9b784" : "#182f44";
            c.fillRect(xx, yy, 10, 17);
          }
      }
      for (let i = 0; i < 8; i++) {
        const x = i * 170 - 35,
          y = 430 + (i % 3) * 38;
        c.strokeStyle = day ? "#777c59" : "#243f3e";
        c.lineWidth = 10;
        c.beginPath();
        c.moveTo(x, 640);
        c.lineTo(x + 15, y);
        c.stroke();
        for (let j = 0; j < 22; j++) {
          c.fillStyle = day
            ? ["#93a274", "#a9b582", "#7e936f"][j % 3]
            : ["#344e47", "#405b51", "#2d4740"][j % 3];
          c.beginPath();
          c.ellipse(
            x + (r() - 0.5) * 100,
            y + (r() - 0.5) * 120,
            20 + r() * 22,
            20 + r() * 24,
            0,
            0,
            Math.PI * 2,
          );
          c.fill();
        }
      }
    },
    1024,
    640,
  );
}
export function createMaterials() {
  const m = baseMaterials();
  const oak = canvasTexture((c, r) => {
    c.fillStyle = "#ddc5a3";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 900; i++) {
      const y = r() * 512;
      c.strokeStyle = i % 2 ? "#93734818" : "#fff4d92b";
      c.lineWidth = 0.3 + r();
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x <= 512; x += 16)
        c.lineTo(x, y + Math.sin(x * 0.018 + i) * 1.6);
      c.stroke();
    }
  });
  const textile = canvasTexture((c, r) => {
    c.fillStyle = "#ece5d9";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 3) {
      c.strokeStyle = i % 2 ? "#cabfaa55" : "#ffffff45";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(i, 0);
      c.lineTo(i, 512);
      c.moveTo(0, i);
      c.lineTo(512, i);
      c.stroke();
    }
    for (let i = 0; i < 6000; i++) {
      c.fillStyle = "#7e715a10";
      c.fillRect(r() * 512, r() * 512, 1, 1);
    }
  });
  const mat = (color, extras = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...extras });
  m.floor = mat("#ffffff", { map: oak, roughness: 0.67 });
  m.oak = mat("#fff8e9", {
    map: oak,
    roughness: 0.55,
    bumpMap: oak,
    bumpScale: 0.007,
  });
  m.wall = mat("#eee9df", { roughness: 0.94 });
  m.trim = mat("#c8c7c3");
  m.charcoal = mat("#292c2c", { roughness: 0.43 });
  m.steel = mat("#aeb7bb", { metalness: 0.8, roughness: 0.24 });
  m.leather = mat("#33322e", {
    roughness: 0.56,
    bumpMap: textile,
    bumpScale: 0.002,
  });
  m.fabric = mat("#eee6d8", {
    map: textile,
    bumpMap: textile,
    bumpScale: 0.009,
  });
  m.rug = mat("#cbbb9e", { map: textile, bumpMap: textile, bumpScale: 0.014 });
  m.blue = mat("#345685");
  m.red = mat("#ad4a35");
  m.yellow = mat("#c39739");
  m.sage = mat("#819080");
  m.paper = mat("#f3ecdf");
  m.ceramic = mat("#eee9de", { roughness: 0.3 });
  m.leaf.color.set("#4d6850");
  m.leafLight.color.set("#758763");
  m.glow = mat("#fff1cf", { emissive: "#ffe0a8", emissiveIntensity: 0.7 });
  return m;
}
