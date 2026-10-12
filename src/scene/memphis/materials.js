import * as THREE from "three";
import { seeded } from "../materials.js";
export const palette = [
  "#10a9a3",
  "#164ad8",
  "#f5c926",
  "#f06568",
  "#ed91b4",
  "#191923",
  "#faf7e9",
];
function texture(draw, size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), seeded(1984), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function circle(c, x, y, r, color) {
  c.fillStyle = color;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}
function wave(c, x, y, w, color = "#181922") {
  c.strokeStyle = color;
  c.lineWidth = 16;
  c.lineCap = "round";
  c.beginPath();
  for (let i = 0; i <= 60; i++) {
    const xx = x + (i * w) / 60,
      yy = y + Math.sin((i / 60) * Math.PI * 4) * 23;
    if (i) c.lineTo(xx, yy);
    else c.moveTo(xx, yy);
  }
  c.stroke();
}
export function cityTexture(night = false) {
  return texture((c, r, s) => {
    const sky = c.createLinearGradient(0, 0, 0, s);
    sky.addColorStop(0, night ? "#292758" : "#f3bed3");
    sky.addColorStop(1, night ? "#71528d" : "#ffe8b4");
    c.fillStyle = sky;
    c.fillRect(0, 0, s, s);
    circle(c, 770, 235, 74, night ? "#d8d9ff" : "#f395b8");
    for (let layer = 0; layer < 3; layer++)
      for (let i = 0; i < 15; i++) {
        const x = i * 78 + layer * 19,
          h = 100 + r() * 280,
          y = 590 + layer * 90 - h;
        c.fillStyle = ["#b7a4dc", "#8d9ede", "#7194ca"][layer];
        c.fillRect(x, y, 59, h + 310);
        c.fillStyle = night ? "#efd2a5" : "#f7d6b9";
        for (let yy = y + 23; yy < y + h; yy += 35)
          c.fillRect(x + 11, yy, 9, 14);
        if (i % 3 === 0) {
          c.fillStyle = "#b998b9";
          c.fillRect(x + 31, y - 64, 3, 64);
        }
      }
  });
}
export function createMaterials() {
  const mat = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.45, ...extra });
  const cloth = texture((c, r, s) => {
    c.fillStyle = "#e9e7de";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < s; i += 3) {
      c.fillStyle = "#696e651d";
      c.fillRect(i, 0, 1, s);
      c.fillRect(0, i, s, 1);
    }
    for (let i = 0; i < 16000; i++) {
      c.fillStyle = "#ffffff33";
      c.fillRect(r() * s, r() * s, 1, 2);
    }
  }, 512);
  const check = texture((c, r, s) => {
    const n = 8,
      w = s / n;
    c.fillStyle = "#fff9ed";
    c.fillRect(0, 0, s, s);
    c.fillStyle = "#181820";
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++)
        if ((x + y) % 2 === 0) c.fillRect(x * w, y * w, w + 0.2, w + 0.2);
  });
  const dots = texture((c, r, s) => {
    c.fillStyle = "#fff6e5";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 240; i++) {
      c.fillStyle = "#171923";
      c.beginPath();
      c.ellipse(
        r() * s,
        r() * s,
        3 + r() * 7,
        4 + r() * 9,
        r() * Math.PI,
        0,
        Math.PI * 2,
      );
      c.fill();
    }
  });
  const floor = texture((c, r, s) => {
    c.fillStyle = "#eae3d7";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 2700; i++) {
      const x = r() * s,
        y = r() * s,
        a = 2 + r() * 5;
      c.fillStyle = palette[i % palette.length];
      c.beginPath();
      c.moveTo(x - a, y);
      c.lineTo(x + a * 0.4, y - a);
      c.lineTo(x + a, y + a * 0.4);
      c.lineTo(x - a * 0.3, y + a);
      c.fill();
    }
    for (let i = 0; i < 21000; i++) {
      c.fillStyle = "#88827412";
      c.fillRect(r() * s, r() * s, 1, 1);
    }
  });
  const rug = texture((c, r, s) => {
    c.fillStyle = "#f2e4cf";
    c.fillRect(0, 0, s, s);
    c.fillStyle = palette[0];
    c.beginPath();
    c.moveTo(370, 120);
    c.lineTo(900, 190);
    c.lineTo(700, 600);
    c.lineTo(390, 690);
    c.fill();
    circle(c, 780, 730, 155, palette[2]);
    circle(c, 410, 520, 205, palette[4]);
    c.fillStyle = palette[3];
    c.beginPath();
    c.moveTo(595, 245);
    c.lineTo(915, 295);
    c.lineTo(833, 515);
    c.fill();
    c.fillRect(510, 810, 240, 92);
    c.fillStyle = palette[5];
    c.fillRect(60, 135, 195, 36);
    wave(c, 60, 800, 310);
    for (let i = 0; i < s; i += 3) {
      c.fillStyle = "#ffffff1d";
      c.fillRect(i, 0, 1, s);
      c.fillRect(0, i, s, 1);
    }
  });
  const art = texture((c, r, s) => {
    c.fillStyle = "#fff7e8";
    c.fillRect(0, 0, s, s);
    circle(c, 310, 300, 205, palette[2]);
    c.fillStyle = palette[1];
    c.fillRect(645, 120, 245, 400);
    c.strokeStyle = palette[5];
    c.lineWidth = 37;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(100 + i * 95, 725);
      c.lineTo(425 + i * 95, 445);
      c.stroke();
    }
    wave(c, 595, 795, 270, palette[3]);
  });
  const squiggle = texture((c, r, s) => {
    c.fillStyle = "#fff8e9";
    c.fillRect(0, 0, s, s);
    for (let y = 70; y < s; y += 170)
      for (let x = 50; x < s; x += 200) wave(c, x, y, 130);
  });
  const stripe = texture((c, r, s) => {
    c.fillStyle = "#fff8ef";
    c.fillRect(0, 0, s, s);
    c.fillStyle = "#181820";
    for (let x = 0; x < s; x += 128) c.fillRect(x, 0, 64, s);
  });
  const m = {
    wall: mat("#faf5ec", { roughness: 0.9 }),
    trim: mat("#c5c6c7"),
    black: mat("#161820", { roughness: 0.28 }),
    white: mat("#fffaf0"),
    chrome: mat("#d6e4ec", { metalness: 1, roughness: 0.15 }),
    floor: mat("#ffffff", {
      map: floor,
      roughness: 0.47,
      bumpMap: floor,
      bumpScale: 0.001,
    }),
    check: mat("#ffffff", { map: check }),
    dots: mat("#ffffff", { map: dots }),
    stripe: mat("#ffffff", { map: stripe }),
    rug: mat("#ffffff", {
      map: rug,
      roughness: 1,
      bumpMap: cloth,
      bumpScale: 0.009,
    }),
    art: mat("#ffffff", { map: art, roughness: 1 }),
    squiggle: mat("#ffffff", { map: squiggle, roughness: 0.9 }),
    leaf: mat("#426740", { roughness: 0.85 }),
    leafLight: mat("#6f9746"),
    soil: mat("#363624"),
    paper: mat("#fff9e7", { roughness: 1 }),
    glow: mat("#fff8e9", { emissive: "#ffdeb4", emissiveIntensity: 0.6 }),
  };
  for (const [key, color] of Object.entries({
    teal: palette[0],
    blue: palette[1],
    yellow: palette[2],
    red: "#ef4449",
    coral: palette[3],
    pink: palette[4],
  })) {
    m[key] = mat(color, { roughness: 0.29 });
    m[key + "Fabric"] = mat(color, {
      map: cloth,
      bumpMap: cloth,
      bumpScale: 0.009,
      roughness: 0.88,
    });
  }
  Object.assign(m, {
    wood: m.black,
    dark: m.blue,
    taupe: m.pink,
    sage: m.teal,
    clay: m.blue,
    celadon: m.yellow,
  });
  return m;
}
export function reflectionEnvironment() {
  const faces = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const p = c.getContext("2d");
    const g = p.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, "#dbe7f4");
    g.addColorStop(0.5, "#f4eee2");
    g.addColorStop(1, "#7d8494");
    p.fillStyle = g;
    p.fillRect(0, 0, 64, 64);
    p.fillStyle = "#ffffff";
    p.fillRect(14, 6, 12, 45);
    faces.push(c);
  }
  const t = new THREE.CubeTexture(faces);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}
