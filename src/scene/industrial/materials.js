import * as THREE from "three";
import { createMaterials as baseMaterials } from "../italian/materials.js";

// Seeded local textures keep the patina identical across reloads and offline.
function texture(draw, seed = 21) {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  let n = seed;
  const rand = () => (n = (n * 1664525 + 1013904223) >>> 0) / 4294967296;
  draw(c.getContext("2d"), rand);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function noise(c, r, count = 14000) {
  for (let i = 0; i < count; i++) {
    const v = r() > 0.5 ? 220 : 20;
    c.fillStyle = `rgba(${v},${v},${v},${r() * 0.09})`;
    c.fillRect(r() * 1024, r() * 1024, 1 + r() * 6, 1 + r() * 3);
  }
}
function weathered(kind) {
  return texture((c, r) => {
    c.fillStyle = {
      concrete: "#888078",
      floor: "#67635f",
      steel: "#555653",
      leather: "#62412d",
      wood: "#806348",
      rug: "#413c38",
    }[kind];
    c.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 320; i++) {
      const x = r() * 1024,
        y = r() * 1024,
        s = 10 + r() * 120;
      const g = c.createRadialGradient(x, y, 0, x, y, s);
      g.addColorStop(
        0,
        kind === "steel" ? "rgba(125,70,35,.15)" : "rgba(28,22,18,.1)",
      );
      g.addColorStop(1, "rgba(30,25,20,0)");
      c.fillStyle = g;
      c.fillRect(x - s, y - s, s * 2, s * 2);
    }
    if (kind === "wood")
      for (let i = 0; i < 1300; i++) {
        c.strokeStyle = `rgba(${r() > 0.5 ? "18,12,7" : "210,174,120"},${r() * 0.19})`;
        c.lineWidth = 0.5 + r() * 2;
        c.beginPath();
        const y = r() * 1024;
        c.moveTo(0, y);
        for (let x = 0; x <= 1024; x += 24)
          c.lineTo(x, y + Math.sin(x * 0.014 + i) * 3);
        c.stroke();
      }
    if (kind === "leather")
      for (let i = 0; i < 2400; i++) {
        const x = r() * 1024,
          y = r() * 1024;
        c.strokeStyle = "rgba(209,168,112,.14)";
        c.lineWidth = 0.7;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + 5 + r() * 24, y + 2 + r() * 10);
        c.lineTo(x + 8 + r() * 26, y + 15);
        c.stroke();
      }
    if (kind === "rug") {
      for (let i = 0; i < 9; i++) {
        c.fillStyle = ["#665b4b", "#744b3a", "#363c3c", "#82725a"][i % 4];
        c.fillRect(26 + i * 112, 22, 38 + (i % 3) * 20, 980);
      }
      for (let i = 0; i < 14000; i++) {
        c.fillStyle = r() > 0.5 ? "#524d44" : "#827464";
        c.globalAlpha = r() * 0.75;
        c.fillRect(r() * 1024, r() * 1024, 1 + r() * 7, 1 + r() * 2);
      }
      c.globalAlpha = 1;
      c.strokeStyle = "#736957";
      c.lineWidth = 8;
      c.strokeRect(28, 28, 968, 968);
    }
    if (kind === "concrete" || kind === "floor")
      for (let i = 0; i < 14; i++) {
        let x = r() * 1024,
          y = r() * 1024;
        c.strokeStyle = "rgba(33,31,29,.23)";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(x, y);
        for (let j = 0; j < 8; j++) {
          x += r() * 38 - 12;
          y += r() * 28;
          c.lineTo(x, y);
        }
        c.stroke();
      }
    if (kind === "concrete" || kind === "floor" || kind === "steel") {
      for (let i = 0; i < 1900; i++) {
        const x = r() * 1024,
          y = r() * 1024;
        c.fillStyle = i % 3 ? "rgba(44,36,29,.07)" : "rgba(213,196,167,.07)";
        c.beginPath();
        c.ellipse(
          x,
          y,
          1 + r() * 5,
          1 + r() * (kind === "steel" ? 16 : 5),
          r() * Math.PI,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
    }
    noise(c, r);
  });
}
function brickTexture() {
  return texture((c, r) => {
    c.fillStyle = "#86766a";
    c.fillRect(0, 0, 1024, 1024);
    for (let row = 0; row < 28; row++)
      for (let col = -1; col < 26; col++) {
        const x = col * 40 + (row % 2) * 20,
          y = row * 37;
        c.fillStyle = `rgb(${98 + r() * 38},${48 + r() * 22},${32 + r() * 17})`;
        c.fillRect(x + 1, y + 2, 38, 33);
        c.strokeStyle = "rgba(220,172,130,.17)";
        c.lineWidth = 1;
        c.strokeRect(x + 2, y + 3, 36, 31);
        for (let i = 0; i < 22; i++) {
          c.fillStyle =
            r() > 0.5 ? "rgba(215,170,128,.1)" : "rgba(20,15,12,.15)";
          c.fillRect(x + r() * 36, y + 3 + r() * 29, 1 + r() * 4, 1 + r() * 3);
        }
      }
    noise(c, r);
  });
}
export function skyline(day = false) {
  return texture((c, r) => {
    const g = c.createLinearGradient(0, 0, 0, 1024);
    g.addColorStop(0, day ? "#899ba8" : "#303852");
    g.addColorStop(0.6, day ? "#dac4a7" : "#aa8499");
    g.addColorStop(1, "#d9a080");
    c.fillStyle = g;
    c.fillRect(0, 0, 1024, 1024);
    for (let layer = 0; layer < 3; layer++)
      for (let i = 0; i < 18; i++) {
        const x = i * 64 - 12 + r() * 24,
          w = 34 + r() * 48,
          h = 120 + r() * 430,
          y = 1024 - h - layer * 80;
        c.fillStyle = ["#6a687b", "#43475e", "#2d3448"][layer];
        c.fillRect(x, y, w, h + 250);
        c.fillRect(x + w * 0.38, y - 20, w * 0.24, 22);
        for (let yy = y + 16; yy < 1024; yy += 21)
          for (let xx = x + 7; xx < x + w - 5; xx += 12)
            if (r() > 0.45) {
              c.fillStyle = r() > 0.4 ? "#d5a870" : "#8999b1";
              c.globalAlpha = day ? 0.3 : 0.7;
              c.fillRect(xx, yy, 4, 7);
            }
        c.globalAlpha = 1;
      }
    noise(c, r, 2500);
  }, 31);
}
export function createMaterials() {
  const m = baseMaterials();
  const finish = (map, roughness = 0.85, metalness = 0, bumpScale = 0.025) =>
    new THREE.MeshStandardMaterial({
      map,
      bumpMap: map,
      bumpScale,
      roughness,
      metalness,
    });
  m.wall = finish(weathered("concrete"));
  m.floor = finish(weathered("floor"), 0.83, 0, 0.012);
  m.brick = finish(brickTexture(), 0.95, 0, 0.014);
  m.steel = finish(weathered("steel"), 0.7, 0.35, 0.008);
  m.wood = finish(weathered("wood"), 0.79, 0, 0.018);
  m.dark = m.wood;
  m.leather = finish(weathered("leather"), 0.72, 0, 0.014);
  m.rug = finish(weathered("rug"), 1, 0, 0.035);
  m.copper = new THREE.MeshStandardMaterial({
    color: "#97603a",
    roughness: 0.55,
    metalness: 0.72,
  });
  m.bolt = new THREE.MeshStandardMaterial({
    color: "#777773",
    roughness: 0.5,
    metalness: 0.8,
  });
  m.rust = new THREE.MeshStandardMaterial({
    color: "#904c35",
    roughness: 1,
    map: m.taupe.map,
  });
  m.sage = m.taupe.clone();
  m.sage.color.set("#586048");
  m.taupe.color.set("#5d5953");
  m.throw.color.set("#4a4a41");
  m.curtain.color.set("#424249");
  m.curtain.opacity = 1;
  m.curtain.transparent = false;
  m.curtain.depthWrite = true;
  m.ceramic.color.set("#a39379");
  m.celadon = m.ceramic;
  m.woven = m.rug;
  m.glass = new THREE.MeshStandardMaterial({
    color: "#624222",
    roughness: 0.24,
    metalness: 0.15,
    transparent: true,
    opacity: 0.8,
  });
  m.trim.color.set("#989991");
  m.art = new THREE.MeshStandardMaterial({
    roughness: 1,
    map: texture((c, r) => {
      c.fillStyle = "#b2aca0";
      c.fillRect(0, 0, 1024, 1024);
      c.strokeStyle = "#383b3b";
      c.lineWidth = 20;
      for (let i = 0; i < 5; i++) {
        const x = 100 + i * 180;
        c.strokeRect(x, 200 + i * 30, 100, 710 - i * 30);
        c.beginPath();
        c.moveTo(x, 220);
        c.lineTo(x + 650, 50 + i * 100);
        c.stroke();
      }
      c.lineWidth = 7;
      for (let y = 400; y < 980; y += 70) {
        c.beginPath();
        c.moveTo(60, y);
        c.lineTo(960, y);
        c.stroke();
      }
      noise(c, r, 6000);
    }),
  });
  return m;
}
