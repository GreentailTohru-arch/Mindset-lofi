import * as THREE from "three";
import { createMaterials as baseMaterials } from "../italian/materials.js";
export { reflectionEnvironment } from "../memphis/materials.js";
function tex(draw, size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  let seed = 84351;
  const r = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  draw(c.getContext("2d"), r, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function star(c, x, y, r, color, n = 8) {
  c.fillStyle = color;
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n,
      rr = i % 2 ? r * 0.46 : r;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath();
  c.fill();
}
function flower(c, x, y, r, color) {
  c.strokeStyle = "#ad9b5b";
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(x, y + r * 1.8);
  c.bezierCurveTo(x - r, y + r, x + r, y + r * 0.7, x, y);
  c.stroke();
  for (let i = 0; i < 8; i++) {
    c.save();
    c.translate(x, y);
    c.rotate((i * Math.PI) / 4);
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(0, -r * 0.57, r * 0.24, r * 0.56, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  star(c, x, y, r * 0.34, "#e2b45c");
}
function woven(c, r, s) {
  for (let i = 0; i < s; i += 3) {
    c.fillStyle = "#fff3d71c";
    c.fillRect(i, 0, 1, s);
    c.fillStyle = "#11182225";
    c.fillRect(0, i, s, 1);
  }
  for (let i = 0; i < 9000; i++) {
    c.fillStyle = i % 2 ? "#fff5d716" : "#140e1918";
    c.fillRect(r() * s, r() * s, 1 + r() * 3, 1);
  }
}
function textile(bg, hero = false) {
  return tex((c, r, s) => {
    c.fillStyle = bg;
    c.fillRect(0, 0, s, s);
    for (const [p, w, col] of [
      [14, 12, "#c99b55"],
      [40, 28, "#153c51"],
      [67, 7, "#dfc596"],
      [96, 36, "#90283b"],
      [120, 6, "#d8b77e"],
    ]) {
      c.strokeStyle = col;
      c.lineWidth = w;
      c.strokeRect(p, p, s - p * 2, s - p * 2);
    }
    for (let x = 55; x < 990; x += 76) {
      flower(c, x, 62, 21, "#d9b779");
      flower(c, x, 962, 21, "#d9b779");
      flower(c, 62, x, 21, "#d9b779");
      flower(c, 962, x, 21, "#d9b779");
    }
    if (hero) {
      flower(c, 512, 512, 345, "#d9bc8c");
      flower(c, 512, 512, 300, "#1b6270");
      flower(c, 512, 512, 205, "#d3b16f");
      flower(c, 512, 512, 116, "#96283d");
      for (const x of [217, 807])
        for (const y of [218, 805]) flower(c, x, y, 66, "#dcb779");
    } else {
      for (let y = 210; y < 900; y += 185)
        for (let x = 210; x < 900; x += 185) {
          star(c, x, y, 74, "#c9a363");
          star(c, x, y, 61, "#184b62");
          flower(c, x, y, 43, "#e3c6a1");
        }
    }
    woven(c, r, s);
  });
}
export function oasisTexture(day = true) {
  return tex((c, r, s) => {
    const sky = c.createLinearGradient(0, 0, 0, s);
    sky.addColorStop(0, day ? "#9ea7cf" : "#101d3e");
    sky.addColorStop(0.55, day ? "#f1c991" : "#344967");
    sky.addColorStop(1, day ? "#dfc49a" : "#53627b");
    c.fillStyle = sky;
    c.fillRect(0, 0, s, s);
    c.fillStyle = day ? "#ffe6a6" : "#dce8f3";
    c.beginPath();
    c.arc(day ? 260 : 715, day ? 300 : 225, day ? 48 : 34, 0, Math.PI * 2);
    c.fill();
    if (!day) {
      c.fillStyle = "#dbe7f0";
      for (let i = 0; i < 45; i++) {
        const x = (i * 179 + 47) % 1024,
          y = 45 + ((i * 71) % 270);
        c.beginPath();
        c.arc(x, y, i % 5 === 0 ? 1.8 : 1, 0, Math.PI * 2);
        c.fill();
      }
    }
    for (let j = 0; j < 3; j++) {
      c.fillStyle = (
        day
          ? ["#8f8cab", "#7f7c9a", "#8f9185"]
          : ["#34425e", "#283b50", "#213546"]
      )[j];
      c.beginPath();
      c.moveTo(0, 720);
      for (let x = 0; x <= 1100; x += 110)
        c.lineTo(x, 490 + j * 63 - r() * 110);
      c.lineTo(s, s);
      c.lineTo(0, s);
      c.fill();
    }
    for (let i = 0; i < 14; i++) {
      let x = i * 83 - 20,
        y = 565 + r() * 115,
        w = 70 + r() * 70,
        h = 85 + r() * 95;
      c.fillStyle = day
        ? i % 2
          ? "#d5bc94"
          : "#eed5aa"
        : i % 2
          ? "#46516a"
          : "#596175";
      c.fillRect(x, y, w, h);
      c.fillStyle = day ? "#715b50" : "#e5ac59";
      for (let k = 0; k < 3; k++) {
        c.beginPath();
        c.roundRect(x + 13 + k * 27, y + 25, 13, 27, 6);
        c.fill();
      }
    }
    c.fillStyle = day ? "#c5b58c" : "#384454";
    c.fillRect(0, 775, s, 249);
    c.fillStyle = day ? "#53959f" : "#193e59";
    c.beginPath();
    c.moveTo(305, 785);
    c.lineTo(720, 785);
    c.lineTo(960, 1024);
    c.lineTo(55, 1024);
    c.fill();
    c.strokeStyle = day ? "#c9d9c395" : "#abcbe068";
    c.lineWidth = 3;
    for (let i = 0; i < 60; i++) {
      let y = 795 + i * 4;
      c.beginPath();
      c.moveTo(300 - (y - 795) * 0.6 + r() * 170, y);
      c.lineTo(575 + r() * 160 + (y - 795) * 0.45, y);
      c.stroke();
    }
    for (const [x, y, h] of [
      [120, 820, 430],
      [820, 785, 325],
      [645, 725, 245],
      [360, 758, 235],
    ]) {
      c.strokeStyle = day ? "#76654b" : "#293438";
      c.lineWidth = 15;
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + 18, y - h * 0.5, x, y - h);
      c.stroke();
      for (let i = 0; i < 9; i++) {
        let a = (i * Math.PI * 2) / 9;
        c.strokeStyle = day
          ? i % 2
            ? "#425f42"
            : "#677844"
          : i % 2
            ? "#172f30"
            : "#29443d";
        c.lineWidth = 11;
        c.beginPath();
        c.moveTo(x, y - h);
        c.quadraticCurveTo(
          x + Math.cos(a) * 105,
          y - h + Math.sin(a) * 55 - 30,
          x + Math.cos(a) * 140,
          y - h + Math.sin(a) * 65 + 50,
        );
        c.stroke();
      }
    }
  });
}
export function createMaterials() {
  const m = baseMaterials(),
    mat = (color, map = null, extra = {}) =>
      new THREE.MeshStandardMaterial({ color, map, roughness: 0.8, ...extra });
  const plaster = tex((c, r, s) => {
    c.fillStyle = "#d1bfa3";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 15000; i++) {
      c.fillStyle = i % 2 ? "#fff0d321" : "#89745c17";
      c.fillRect(r() * s, r() * s, r() * 35 + 2, r() * 4 + 1);
    }
  });
  m.wall = mat("#fff0d7", plaster, { bumpMap: plaster, bumpScale: 0.017 });
  m.lower = m.wall.clone();
  m.lower.color.set("#d9ba86");
  m.trim = mat("#adaca8");
  m.wood.color.set("#8c5932");
  m.dark.color.set("#4c301e");
  m.floor.color.set("#a38b71");
  m.bronze = mat("#bd863e", null, { metalness: 0.8, roughness: 0.3 });
  m.copper = mat("#b66e3d", null, { metalness: 0.78, roughness: 0.3 });
  m.sage = m.taupe;
  m.woven = m.throw;
  m.rug = mat("#ffffff", textile("#8b2636"), { bumpScale: 0.013 });
  m.rug.bumpMap = m.rug.map;
  m.pattern = mat("#ffffff", textile("#155666"));
  m.pattern.bumpMap = m.pattern.map;
  m.pattern.bumpScale = 0.01;
  m.creamPattern = mat("#ffffff", textile("#e4c99b"));
  m.tapestry = mat("#ffffff", textile("#8e2438", true));
  m.painted = mat("#d9b887", textile("#173b4b"), { roughness: 0.51 });
  m.ikat = mat(
    "#ffffff",
    tex((c, r, s) => {
      c.fillStyle = "#e3cda5";
      c.fillRect(0, 0, s, s);
      const cols = ["#973b41", "#176277", "#d49e52", "#223b53"];
      for (let x = -100; x < s + 100; x += 86) {
        c.strokeStyle = cols[Math.floor((x + 100) / 86) % 4];
        c.lineWidth = 40;
        c.beginPath();
        for (let y = -100; y < s + 100; y += 8) {
          const xx =
            x + Math.abs(((y + 150) % 260) - 130) * 0.48 + (r() - 0.5) * 10;
          c.lineTo(xx, y);
        }
        c.stroke();
      }
      woven(c, r, s);
    }),
  );
  m.red = m.rug.clone();
  m.blue = m.pattern.clone();
  m.mustard = m.ikat.clone();
  const tile = tex((c, r, s) => {
    c.fillStyle = "#e8dcc4";
    c.fillRect(0, 0, s, s);
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        const xx = x * 256,
          yy = y * 256;
        c.strokeStyle = "#aa9c80";
        c.lineWidth = 4;
        c.strokeRect(xx, yy, 256, 256);
        star(c, xx + 128, yy + 128, 115, "#255a85");
        star(c, xx + 128, yy + 128, 71, "#e7d9b2");
        flower(c, xx + 128, yy + 128, 45, "#438b98");
      }
  });
  m.tile = mat("#ffffff", tile, { roughness: 0.48 });
  m.band = m.tile;
  m.ceramic = mat(
    "#ffffff",
    tex((c, r, s) => {
      c.fillStyle = "#ece4d0";
      c.fillRect(0, 0, s, s);
      for (let y = 70; y < s; y += 170)
        for (let x = 65; x < s; x += 150) flower(c, x, y, 55, "#285b88");
    }),
    { roughness: 0.24 },
  );
  m.celadon = m.ceramic;
  m.cornice = mat(
    "#b18453",
    tex((c, r, s) => {
      c.fillStyle = "#4a3021";
      c.fillRect(0, 0, s, s);
      for (let x = 0; x < s; x += 85) {
        star(c, x + 42, 512, 37, "#be955d");
        c.strokeStyle = "#b08755";
        c.lineWidth = 10;
        c.beginPath();
        c.moveTo(x, 180);
        c.lineTo(x + 42, 840);
        c.lineTo(x + 85, 180);
        c.stroke();
      }
    }),
  );
  m.curtain = m.linen.clone();
  m.curtain.side = THREE.DoubleSide;
  m.curtain.transparent = true;
  m.curtain.opacity = 0.78;
  return m;
}
