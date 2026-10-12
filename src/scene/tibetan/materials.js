import * as THREE from "three";
import { createMaterials as baseMaterials } from "../italian/materials.js";
export { reflectionEnvironment } from "../memphis/materials.js";
function tex(draw, size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  let seed = 90721;
  const r = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  draw(canvas.getContext("2d"), r, size);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
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
    c.fillStyle = "#e2caa92c";
    c.fillRect(i, 0, 1, s);
    c.fillStyle = "#130e1724";
    c.fillRect(0, i, s, 1);
  }
  for (let i = 0; i < 16000; i++) {
    c.fillStyle = i % 2 ? "#fff0d41b" : "#1916221b";
    c.fillRect(r() * s, r() * s, 1 + r() * 3, 1);
  }
}
function pattern(bg, mountain = false) {
  return tex((c, r, s) => {
    c.fillStyle = bg;
    c.fillRect(0, 0, s, s);
    for (const [n, color, w] of [
      [14, "#c49646", 15],
      [37, "#501b24", 24],
      [60, "#d5b879", 8],
      [83, "#203948", 28],
      [107, "#d5b879", 7],
    ]) {
      c.strokeStyle = color;
      c.lineWidth = w;
      c.strokeRect(n, n, s - 2 * n, s - 2 * n);
    }
    for (let x = 65; x < 980; x += 76) {
      diamond(c, x, 78, 20, 18, "#b87636");
      diamond(c, x, 946, 20, 18, "#b87636");
      diamond(c, 78, x, 18, 20, "#b87636");
      diamond(c, 946, x, 18, 20, "#b87636");
    }
    if (mountain) {
      c.fillStyle = "#24374c";
      c.fillRect(125, 125, 774, 774);
      c.fillStyle = "#d5a548";
      c.beginPath();
      c.arc(590, 295, 76, 0, Math.PI * 2);
      c.fill();
      for (const [x, y, w] of [
        [180, 585, 220],
        [470, 520, 250],
        [720, 650, 240],
      ]) {
        c.fillStyle = "#9c887a";
        c.beginPath();
        c.moveTo(x - w, 860);
        c.lineTo(x, y);
        c.lineTo(x + w, 860);
        c.fill();
        c.fillStyle = "#e7d8b8";
        c.beginPath();
        c.moveTo(x - w * 0.35, y + (860 - y) * 0.35);
        c.lineTo(x, y);
        c.lineTo(x + w * 0.35, y + (860 - y) * 0.35);
        c.lineTo(x + w * 0.11, y + (860 - y) * 0.25);
        c.lineTo(x - w * 0.04, y + (860 - y) * 0.36);
        c.fill();
      }
    } else
      for (let y = 185; y < 880; y += 160)
        for (let x = 185; x < 880; x += 160) {
          diamond(c, x, y, 62, 66, "#c38b44");
          diamond(c, x, y, 45, 48, "#233c48");
          diamond(c, x, y, 26, 30, "#e0c791");
          diamond(c, x, y, 12, 15, "#7f302c");
          for (const a of [-1, 1]) {
            c.fillStyle = "#b57b37";
            c.fillRect(x + a * 66 - 3, y - 13, 6, 26);
            c.fillRect(x + a * 66 - 13, y - 3, 26, 6);
          }
        }
    weave(c, r, s);
  });
}
export function mountainTexture(day = false) {
  return tex((c, r, s) => {
    const sky = c.createLinearGradient(0, 0, 0, s);
    sky.addColorStop(0, day ? "#779eb6" : "#535b91");
    sky.addColorStop(0.54, day ? "#d8d2bd" : "#c6a3ad");
    sky.addColorStop(1, "#6c88a2");
    c.fillStyle = sky;
    c.fillRect(0, 0, s, s);
    for (let layer = 0; layer < 4; layer++) {
      const y = 360 + layer * 133;
      c.fillStyle = ["#7588ac", "#536d94", "#365876", "#2d485d"][layer];
      c.beginPath();
      c.moveTo(0, s);
      for (let x = -90; x < s + 200; x += 160) {
        c.lineTo(x, y + 95);
        c.lineTo(x + 80, y - 75 - r() * 110);
      }
      c.lineTo(s, s);
      c.fill();
      if (layer < 2)
        for (let x = -90; x < s; x += 160) {
          c.fillStyle = layer ? "#d4c7d0" : "#f2d3d3";
          c.beginPath();
          c.moveTo(x + 28, y + 6);
          c.lineTo(x + 80, y - 92);
          c.lineTo(x + 132, y + 8);
          c.lineTo(x + 94, y - 14);
          c.lineTo(x + 77, y + 5);
          c.lineTo(x + 59, y - 24);
          c.fill();
        }
    }
  });
}
export function createMaterials() {
  const m = baseMaterials();
  const mat = (color, map = null, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, map, roughness: 0.85, ...extra });
  const plaster = tex((c, r, s) => {
    c.fillStyle = "#bda484";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 16000; i++) {
      c.fillStyle = i % 2 ? "#f9e3b51b" : "#69534215";
      c.fillRect(r() * s, r() * s, 4 + r() * 50, 1 + r() * 5);
    }
  });
  m.wall = mat("#f7dfb8", plaster, { bumpMap: plaster, bumpScale: 0.024 });
  m.lower = mat("#763426", plaster, { bumpMap: plaster, bumpScale: 0.015 });
  const wood = tex((c, r, s) => {
    c.fillStyle = "#59422e";
    c.fillRect(0, 0, s, s);
    for (let row = 0; row < 14; row++) {
      let y = (row * s) / 14;
      c.fillStyle = row % 3 ? "#695039" : "#745a41";
      c.fillRect(0, y, s, s / 14 - 2);
      for (let k = 0; k < 120; k++) {
        const yy = y + (r() * s) / 14;
        c.strokeStyle = k % 2 ? "#1e180f36" : "#b7996833";
        c.lineWidth = 0.3 + r();
        c.beginPath();
        for (let x = 0; x <= s; x += 16)
          c.lineTo(x, yy + Math.sin(x * 0.018 + k) * 1.8);
        c.stroke();
      }
      c.fillStyle = "#241b16";
      c.fillRect((row % 3) * 330 + 130, y, 2, s / 14);
    }
  });
  m.floor = mat("#c0aa91", wood, {
    bumpMap: wood,
    bumpScale: 0.018,
    roughness: 0.73,
  });
  m.wood.color.set("#a17a54");
  m.dark.color.set("#584331");
  const stone = tex((c, r, s) => {
    c.fillStyle = "#777970";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 24000; i++) {
      c.fillStyle = i % 2 ? "#d4d0bb28" : "#33363230";
      c.fillRect(r() * s, r() * s, 1 + r() * 7, 1 + r() * 2);
    }
  });
  m.stone = mat("#b2b0a1", stone, { bumpMap: stone, bumpScale: 0.025 });
  m.trim = mat("#9c9c97");
  m.bronze = mat("#ab6c32", null, { metalness: 0.82, roughness: 0.3 });
  m.copper = m.bronze;
  m.sage = m.taupe;
  m.celadon = m.ceramic;
  m.woven = m.throw;
  m.red = m.linen.clone();
  m.red.color.set("#79252a");
  m.blue = m.linen.clone();
  m.blue.color.set("#243f56");
  m.mustard = m.linen.clone();
  m.mustard.color.set("#c29948");
  m.rug = mat("#ffffff", pattern("#74252b"), { bumpScale: 0.012 });
  m.rug.bumpMap = m.rug.map;
  m.pattern = mat("#ffffff", pattern("#213b4d"));
  m.pattern.bumpMap = m.pattern.map;
  m.pattern.bumpScale = 0.012;
  m.creamPattern = mat("#ffffff", pattern("#d3bb8e"));
  m.creamPattern.bumpMap = m.creamPattern.map;
  m.creamPattern.bumpScale = 0.012;
  m.painted = mat("#e5c79e", pattern("#67272a"), { roughness: 0.6 });
  const band = tex((c, r, s) => {
    c.fillStyle = "#6c282b";
    c.fillRect(0, 0, s, s);
    for (const y of [60, 890]) {
      c.fillStyle = "#c79b4c";
      c.fillRect(0, y, s, 44);
    }
    for (let x = 0; x < s; x += 128) {
      c.fillStyle = "#b28b3e";
      c.fillRect(x + 8, 240, 112, 550);
      c.fillStyle = "#223e4b";
      c.fillRect(x + 20, 282, 88, 462);
      diamond(c, x + 64, 512, 29, 148, "#b96631");
      diamond(c, x + 64, 512, 14, 70, "#509085");
    }
  });
  m.band = mat("#ffffff", band);
  m.tapestry = mat("#ffffff", pattern("#842f30", true));
  m.curtain = m.linen.clone();
  m.curtain.side = THREE.DoubleSide;
  m.flags = ["#9b3030", "#2e5279", "#d3aa43", "#508875", "#e7dcc5"].map((c) =>
    mat(c),
  );
  return m;
}
