import * as THREE from "three";
import { createMaterials as baseMaterials, seeded } from "../materials.js";

// All artwork is generated locally. No glyphs or lettering are painted.
export function palaceTexture(kind = "garden", day = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const c = canvas.getContext("2d"),
    rand = seeded(983);
  const sky = c.createLinearGradient(0, 0, 0, 640);
  sky.addColorStop(0, day ? "#b0c6cf" : "#101d38");
  sky.addColorStop(1, day ? "#efe1c1" : "#426781");
  c.fillStyle = kind === "garden" ? sky : "#d5c6a3";
  c.fillRect(0, 0, 1024, 640);
  if (kind === "porcelain") {
    c.fillStyle = "#eeeadd";
    c.fillRect(0, 0, 1024, 640);
    c.strokeStyle = "#275082";
    c.lineWidth = 5;
    for (let y = 35; y < 640; y += 570)
      for (let j = 0; j < 4; j++) {
        c.beginPath();
        c.moveTo(0, y + j * 8);
        c.lineTo(1024, y + j * 8);
        c.stroke();
      }
    for (let i = 0; i < 18; i++) {
      const x = 50 + (i % 9) * 115,
        y = 195 + Math.floor(i / 9) * 250;
      c.strokeStyle = "#396298";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(x - 35, y + 70);
      c.bezierCurveTo(x + 70, y - 35, x - 55, y - 95, x + 10, y - 40);
      c.stroke();
      for (let p = 0; p < 5; p++) {
        const a = (p * Math.PI * 2) / 5;
        c.beginPath();
        c.ellipse(
          x + Math.cos(a) * 17,
          y + Math.sin(a) * 17,
          19,
          9,
          a,
          0,
          Math.PI * 2,
        );
        c.stroke();
      }
      c.fillStyle = "#2b5486";
      c.beginPath();
      c.arc(x, y, 5, 0, Math.PI * 2);
      c.fill();
    }
  } else {
    c.fillStyle = kind === "garden" ? "#e5edf1" : "#efe1b8";
    c.beginPath();
    c.arc(650, 128, kind === "garden" ? 37 : 27, 0, Math.PI * 2);
    c.fill();
    for (let layer = 0; layer < 3; layer++) {
      c.fillStyle =
        kind === "garden"
          ? ["#405e79", "#30485c", "#1b354b"][layer]
          : ["#a2ac9a", "#7b9186", "#566e65"][layer];
      c.beginPath();
      c.moveTo(0, 640);
      for (let x = 0; x <= 1040; x += 12)
        c.lineTo(
          x,
          360 +
            layer * 72 -
            70 * Math.sin(x * 0.006 + layer * 1.8) -
            18 * Math.sin(x * 0.023),
        );
      c.lineTo(1024, 640);
      c.closePath();
      c.fill();
    }
    if (kind === "garden") {
      // A low palace roof silhouette, framed by bamboo and flowering plum.
      c.fillStyle = "#172b42";
      c.fillRect(420, 396, 450, 177);
      c.fillStyle = "#344c60";
      c.beginPath();
      c.moveTo(365, 414);
      c.quadraticCurveTo(460, 405, 540, 339);
      c.lineTo(760, 339);
      c.quadraticCurveTo(832, 397, 932, 414);
      c.quadraticCurveTo(720, 457, 365, 414);
      c.fill();
      c.strokeStyle = "#6e8797";
      c.lineWidth = 3;
      for (let i = 0; i < 19; i++) {
        c.beginPath();
        c.moveTo(545 + i * 12, 342);
        c.lineTo(404 + i * 27, 421);
        c.stroke();
      }
      for (let x = 453; x < 850; x += 63) {
        c.fillStyle = "#c79c58";
        c.fillRect(x, 458, 28, 53);
        c.fillStyle = "#28374b";
        c.fillRect(x + 12, 458, 4, 53);
        c.fillRect(x, 480, 28, 4);
      }
    }
    for (let i = 0; i < 8; i++) {
      const x = 40 + i * 24,
        h = 110 + (i % 3) * 44;
      c.strokeStyle = kind === "garden" ? "#15352f" : "#3d5a47";
      c.fillStyle = c.strokeStyle;
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(x, 640);
      c.quadraticCurveTo(x + 35, 350, x + 12, h);
      c.stroke();
      for (let j = 0; j < 7; j++) {
        const y = h + 45 + j * 57,
          s = j % 2 ? 1 : -1;
        c.beginPath();
        c.moveTo(x + 18, y);
        c.quadraticCurveTo(x + 70 * s, y - 43, x + 92 * s, y - 14);
        c.quadraticCurveTo(x + 55 * s, y + 3, x + 18, y);
        c.fill();
      }
    }
    c.strokeStyle = "#382d39";
    c.lineWidth = 9;
    c.beginPath();
    c.moveTo(1024, 640);
    c.bezierCurveTo(890, 500, 1030, 315, 831, 194);
    c.stroke();
    for (let i = 0; i < 55; i++) {
      const x = 825 + rand() * 200,
        y = 185 + rand() * 365;
      c.fillStyle = i % 2 ? "#e4bac3" : "#ede0d5";
      c.beginPath();
      c.arc(x, y, 3 + rand() * 4, 0, Math.PI * 2);
      c.fill();
    }
  }
  for (let i = 0; i < 8000; i++) {
    c.fillStyle = rand() > 0.5 ? "#ffffff07" : "#2e211909";
    c.fillRect(rand() * 1024, rand() * 640, 1, 2);
  }
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function createMaterials() {
  const m = baseMaterials();
  m.floor.color.set("#bf9477");
  m.floor.roughness = 0.52;
  m.wood.color.set("#9b6251");
  m.wood.roughness = 0.37;
  m.woodDark.color.set("#665042");
  m.woodDark.roughness = 0.43;
  m.wall.color.set("#d7c9af");
  m.trim.color.set("#78716b");
  m.leaf.color.set("#2d5041");
  m.leafLight.color.set("#5b7553");
  m.ceramic.color.set("#8fae9a");
  m.rug = m.tatami.clone();
  m.rug.color.set("#cfb58b");
  m.lacquer = new THREE.MeshStandardMaterial({
    color: "#922d24",
    roughness: 0.32,
    metalness: 0.13,
  });
  m.gold = new THREE.MeshStandardMaterial({
    color: "#d4a657",
    metalness: 0.7,
    roughness: 0.36,
  });
  m.bronze = new THREE.MeshStandardMaterial({
    color: "#88713e",
    metalness: 0.72,
    roughness: 0.49,
  });
  m.jade = new THREE.MeshStandardMaterial({
    color: "#347b78",
    metalness: 0.2,
    roughness: 0.28,
  });
  m.silk = new THREE.MeshStandardMaterial({
    color: "#e6ceaa",
    roughness: 0.62,
    side: THREE.DoubleSide,
  });
  m.cushion = m.rug.clone();
  m.cushion.color.set("#376461");
  m.paper = new THREE.MeshStandardMaterial({
    color: "#ecdfbd",
    roughness: 0.92,
  });
  m.porcelain = new THREE.MeshStandardMaterial({
    map: palaceTexture("porcelain"),
    roughness: 0.24,
    metalness: 0.05,
  });
  m.art = new THREE.MeshStandardMaterial({
    map: palaceTexture("art"),
    roughness: 0.94,
  });
  m.stone = new THREE.MeshStandardMaterial({
    color: "#777b73",
    roughness: 0.96,
    flatShading: true,
  });
  m.glow = new THREE.MeshStandardMaterial({
    color: "#ffe1a1",
    emissive: "#ffbd65",
    emissiveIntensity: 0.75,
    roughness: 0.7,
  });
  return m;
}
