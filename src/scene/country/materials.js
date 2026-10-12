import * as THREE from "three";
import { createMaterials as existingMaterials } from "../renaissance/materials.js";
function texture(draw) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1024;
  let seed = 7631;
  const r = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  draw(canvas.getContext("2d"), r, 1024);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
export function countryTexture(day = true) {
  return texture((c, r, s) => {
    const sky = c.createLinearGradient(0, 0, 0, s);
    sky.addColorStop(0, day ? "#adadb9" : "#23354b");
    sky.addColorStop(0.52, day ? "#f2cf9f" : "#617286");
    sky.addColorStop(1, day ? "#ddd1a1" : "#344b47");
    c.fillStyle = sky;
    c.fillRect(0, 0, s, s);
    c.fillStyle = day ? "#fff0c3" : "#e2e7d8";
    c.beginPath();
    c.arc(720, 325, 29, 0, Math.PI * 2);
    c.fill();
    for (let j = 0; j < 5; j++) {
      c.fillStyle = (
        day
          ? ["#9b9d9e", "#87928a", "#798c72", "#697c54", "#617149"]
          : ["#536879", "#445d69", "#3a5655", "#304c43", "#294239"]
      )[j];
      c.beginPath();
      c.moveTo(0, s);
      for (let x = 0; x <= s; x += 15)
        c.lineTo(
          x,
          425 +
            j * 91 +
            Math.sin(x * 0.006 + j) * 48 +
            Math.sin(x * 0.015 + j) * 13,
        );
      c.lineTo(s, s);
      c.fill();
    }
    for (let i = 0; i < 1800; i++) {
      c.strokeStyle = i % 2 ? "#c4b57223" : "#2d493527";
      const x = r() * s,
        y = 600 + r() * 420;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 6 + r() * 20, y - 1);
      c.stroke();
    }
    for (let i = 0; i < 32; i++) {
      const x = i * 36,
        y = 660 + Math.sin(x * 0.005) * 45,
        h = 35 + r() * 80;
      c.fillStyle = "#47583e";
      c.fillRect(x - 2, y - h * 0.5, 4, h);
      for (let j = 0; j < 6; j++) {
        c.beginPath();
        c.ellipse(
          x + Math.sin(j * 2.4) * h * 0.18,
          y - h * 0.6 + j * 3,
          h * 0.2,
          h * 0.24,
          j,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
    }
    c.strokeStyle = day ? "#685342" : "#27332e";
    c.lineWidth = 8;
    for (const offset of [0, 37]) {
      c.beginPath();
      c.moveTo(0, 822 + offset);
      c.bezierCurveTo(280, 775 + offset, 690, 852 + offset, s, 775 + offset);
      c.stroke();
    }
    for (let x = 0; x < s; x += 75) {
      const y = 808 + Math.sin(x * 0.005) * 20;
      c.fillStyle = day ? "#685342" : "#27332e";
      c.fillRect(x, y - 20, 9, 102);
    }
  });
}
export function createMaterials() {
  const m = existingMaterials();
  m.floor.color.set("#9b8977");
  m.wood.color.set("#8b6948");
  m.woodDark.color.set("#7d715c");
  m.leather.color.set("#79503a");
  m.leather.roughness = 0.48;
  m.wall.color.set("#ede0c5");
  m.trim.color.set("#bcb9af");
  m.ceramic.color.set("#c6b69a");
  m.sheer.opacity = 0.68;
  m.panel = m.wood.clone();
  m.panel.color.set("#646054");
  m.greenCabinet = m.wood.clone();
  m.greenCabinet.color.set("#56614b");
  const plaid = texture((c, r, s) => {
    c.fillStyle = "#745444";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < s; i += 128) {
      c.fillStyle = "#333f3766";
      c.fillRect(i, 0, 57, s);
      c.fillRect(0, i, s, 57);
      c.fillStyle = "#cabd9188";
      c.fillRect(i + 68, 0, 9, s);
      c.fillRect(0, i + 68, s, 9);
      c.fillStyle = "#9a6e5c";
      c.fillRect(i + 90, 0, 3, s);
      c.fillRect(0, i + 90, s, 3);
    }
  });
  m.plaid = new THREE.MeshStandardMaterial({
    map: plaid,
    roughness: 1,
    bumpMap: plaid,
    bumpScale: 0.01,
  });
  const rug = texture((c, r, s) => {
    c.fillStyle = "#343e40";
    c.fillRect(0, 0, s, s);
    for (const [inset, color, width] of [
      [20, "#b39a72", 24],
      [42, "#733e2f", 15],
      [60, "#c0a580", 5],
      [78, "#a08058", 7],
    ]) {
      c.strokeStyle = color;
      c.lineWidth = width;
      c.strokeRect(inset, inset, s - inset * 2, s - inset * 2);
    }
    for (let y = 110; y < 930; y += 73)
      for (let x = 110; x < 930; x += 73) {
        c.save();
        c.translate(x + (y % 2) * 12, y);
        c.fillStyle = (x + y) % 3 ? "#a47a51" : "#7d4d39";
        for (let i = 0; i < 8; i++) {
          c.rotate(Math.PI / 4);
          c.beginPath();
          c.ellipse(0, 10, 4, 11, 0, 0, Math.PI * 2);
          c.fill();
        }
        c.fillStyle = "#d1b27c";
        c.fillRect(-3, -3, 6, 6);
        c.restore();
      }
    for (let i = 0; i < 45000; i++) {
      c.fillStyle = i % 2 ? "#e9d6ae24" : "#20282922";
      c.fillRect(r() * s, r() * s, 1 + r() * 3, 1 + r() * 2);
    }
  });
  m.rug.map = rug;
  m.rug.bumpMap = rug;
  m.landscape = new THREE.MeshStandardMaterial({
    map: countryTexture(),
    roughness: 1,
  });
  m.mirror = new THREE.MeshStandardMaterial({
    map: countryTexture(),
    color: "#b9ac87",
    metalness: 0.2,
    roughness: 0.33,
  });
  return m;
}
