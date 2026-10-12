import * as THREE from "three";
import { createMaterials as baseMaterials } from "../mediterranean/materials.js";
import { seeded } from "../materials.js";

function texture(draw, size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), seeded(7913), size);
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return map;
}
function diamond(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x, y - h);
  c.lineTo(x + w, y);
  c.lineTo(x, y + h);
  c.lineTo(x - w, y);
  c.closePath();
  c.fill();
}
function weave(c, r, s) {
  for (let i = 0; i < s; i += 3) {
    c.fillStyle = i % 2 ? "#e9d4a52b" : "#25262c23";
    c.fillRect(i, 0, 1, s);
    c.fillRect(0, i, s, 1);
  }
  for (let i = 0; i < 26000; i++) {
    c.fillStyle = i % 3 ? "#eee4cd25" : "#3e322625";
    c.fillRect(r() * s, r() * s, 1 + r() * 3, 1 + r() * 2);
  }
}
export function sunsetTexture(night = false) {
  return texture((c, r, s) => {
    const sky = c.createLinearGradient(0, 0, 0, s);
    sky.addColorStop(0, night ? "#202a48" : "#bc8c9b");
    sky.addColorStop(0.5, night ? "#59657c" : "#f3c98f");
    sky.addColorStop(1, night ? "#7a8187" : "#ffedb9");
    c.fillStyle = sky;
    c.fillRect(0, 0, s, s);
    c.fillStyle = night ? "#e3ded0" : "#fff6cb";
    c.beginPath();
    c.arc(320, 475, 35, 0, Math.PI * 2);
    c.fill();
    for (let layer = 0; layer < 3; layer++) {
      c.fillStyle = ["#8f8090", "#7a7980", "#656c6a"][layer];
      c.beginPath();
      c.moveTo(0, s);
      for (let x = 0; x <= s; x += 15)
        c.lineTo(
          x,
          560 +
            layer * 56 +
            Math.sin(x * 0.004 + layer) * 72 +
            Math.sin(x * 0.013) * 15,
        );
      c.lineTo(s, s);
      c.fill();
    }
    for (let i = 0; i < 29; i++) {
      const x = i * 39 - 18,
        y = 640 + r() * 115,
        h = 80 + r() * 80;
      c.fillStyle = ["#c4a38a", "#ae937d", "#dbc0a0"][i % 3];
      c.fillRect(x, y, 32, h);
      c.fillStyle = "#735b52";
      c.fillRect(x - 3, y - 5, 38, 6);
      for (let yy = y + 14; yy < y + h - 4; yy += 20)
        for (const xx of [x + 6, x + 21]) {
          c.fillStyle = night ? "#f2ca86" : "#606465";
          c.fillRect(xx, yy, 6, 10);
        }
    }
    c.fillStyle = "#71675d";
    c.fillRect(0, 889, s, 135);
    c.fillStyle = "#383d3a";
    c.fillRect(0, 823, s, 9);
    c.fillRect(0, 915, s, 8);
    for (let x = 12; x < s; x += 48) c.fillRect(x, 825, 5, 100);
    for (let i = 0; i < 110; i++) {
      const x = r() * s,
        y = 863 + r() * 117;
      c.fillStyle = i % 4 ? "#4c6341" : "#c27688";
      c.beginPath();
      c.ellipse(x, y, 7 + r() * 7, 4 + r() * 8, r() * 3, 0, Math.PI * 2);
      c.fill();
    }
  });
}
export function createMaterials() {
  const m = baseMaterials();
  const mat = (color, map, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, map, roughness: 0.88, ...extra });
  const plaster = texture((c, r, s) => {
    c.fillStyle = "#ba7653";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 9000; i++) {
      c.fillStyle = i % 3 ? "#f2bf890c" : "#75433e09";
      c.beginPath();
      c.ellipse(
        r() * s,
        r() * s,
        3 + r() * 23,
        3 + r() * 16,
        r() * 3,
        0,
        Math.PI * 2,
      );
      c.fill();
    }
  });
  const tiles = texture((c, r, s) => {
    c.fillStyle = "#9c8d76";
    c.fillRect(0, 0, s, s);
    const n = 16,
      w = s / n;
    for (let row = 0; row < n; row++)
      for (let col = 0; col < n; col++) {
        const x = col * w,
          y = row * w;
        c.fillStyle = ["#d3bd97", "#dfcdaa", "#c8b69b"][(row + col) % 3];
        c.fillRect(x + 1, y + 1, w - 2, w - 2);
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          c.fillStyle = i % 2 ? "#a45f3c" : "#405b68";
          c.beginPath();
          c.ellipse(
            x + 32 + Math.sin(a) * 13,
            y + 32 + Math.cos(a) * 13,
            4.7,
            12,
            -a,
            0,
            Math.PI * 2,
          );
          c.fill();
        }
        diamond(c, x + 32, y + 32, 5, 5, "#493e35");
        for (const xx of [6, 58])
          for (const yy of [6, 58]) diamond(c, x + xx, y + yy, 4, 4, "#b7794d");
        c.strokeStyle = "#6f77645d";
        c.lineWidth = 1;
        c.strokeRect(x + 4, y + 4, w - 8, w - 8);
      }
    weave(c, r, s);
  });
  function textile(background, variant = 0) {
    return texture((c, r, s) => {
      c.fillStyle = background;
      c.fillRect(0, 0, s, s);
      for (const [inset, color, width] of [
        [15, "#c7a574", 18],
        [38, "#553d33", 13],
        [59, "#b7784b", 20],
        [81, "#d0b188", 6],
      ]) {
        c.strokeStyle = color;
        c.lineWidth = width;
        c.strokeRect(inset, inset, s - inset * 2, s - inset * 2);
      }
      for (let y = 132; y < s - 90; y += 126)
        for (let x = 134; x < s - 90; x += 126) {
          diamond(c, x, y, 51, 53, variant ? "#cc9a5c" : "#b77a4f");
          diamond(c, x, y, 39, 41, "#344b57");
          diamond(c, x, y, 22, 24, "#d2b78e");
          diamond(c, x, y, 9, 12, "#904c35");
          for (const dx of [-53, 53])
            diamond(c, x + dx, y + 58, 6, 8, "#bfa37b");
        }
      weave(c, r, s);
    });
  }
  const stripe = texture((c, r, s) => {
    c.fillStyle = "#b77947";
    c.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 128) {
      c.fillStyle = "#334e5b";
      c.fillRect(0, y, s, 29);
      c.fillStyle = "#d5b281";
      c.fillRect(0, y + 39, s, 9);
      c.fillStyle = "#733f36";
      c.fillRect(0, y + 72, s, 25);
      for (let x = 15; x < s; x += 45) diamond(c, x, y + 85, 9, 10, "#d6b785");
    }
    weave(c, r, s);
  });
  const rug = textile("#945738"),
    bluePattern = textile("#344c59", 1);
  m.wall = mat("#fff7ed", plaster, { bumpMap: plaster, bumpScale: 0.008 });
  m.floor = mat("#ffffff", tiles, {
    bumpMap: tiles,
    bumpScale: 0.01,
    roughness: 0.83,
  });
  m.wood.color.set("#b28c64");
  m.dark.color.set("#8d7154");
  m.clay.color.set("#c58b5f");
  m.celadon.color.set("#928d64");
  m.linen.color.set("#f3e3c8");
  m.sage.color.set("#687254");
  m.persian = mat("#ffffff", rug, { bumpMap: rug, bumpScale: 0.017 });
  m.pattern = mat("#ffffff", bluePattern, {
    bumpMap: bluePattern,
    bumpScale: 0.013,
  });
  m.stripe = mat("#ffffff", stripe, { bumpMap: stripe, bumpScale: 0.016 });
  m.rust = mat("#b96836", m.linen.map, {
    bumpMap: m.linen.map,
    bumpScale: 0.015,
  });
  m.mustard = mat("#bb913f", m.linen.map);
  m.leather = mat("#966139", m.linen.map, {
    roughness: 0.55,
    bumpMap: m.linen.map,
    bumpScale: 0.006,
  });
  m.artwork = mat(
    "#ffffff",
    texture((c, r, s) => {
      c.fillStyle = "#d2ba93";
      c.fillRect(0, 0, s, s);
      c.fillStyle = "#ac633d";
      c.beginPath();
      c.arc(620, 235, 115, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#334a54";
      c.fillRect(150, 160, 175, 500);
      diamond(c, 605, 625, 205, 280, "#766d52");
      diamond(c, 615, 715, 160, 130, "#a66a44");
      weave(c, r, s);
    }),
  );
  return m;
}
