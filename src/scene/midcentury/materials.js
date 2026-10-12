import * as THREE from "three";
import { createMaterials as baseMaterials } from "../italian/materials.js";
import { seeded } from "../materials.js";

function texture(draw, size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), seeded(1956), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
export function afternoonTexture(night = false) {
  return texture((c, r, s) => {
    const sky = c.createLinearGradient(0, 0, 0, s);
    sky.addColorStop(0, night ? "#26374e" : "#c8c3ac");
    sky.addColorStop(0.6, night ? "#607088" : "#eee0bb");
    sky.addColorStop(1, night ? "#72817d" : "#c0ba85");
    c.fillStyle = sky;
    c.fillRect(0, 0, s, s);
    c.fillStyle = night ? "#e0e2d4" : "#fff2bb";
    c.beginPath();
    c.arc(280, 350, 34, 0, Math.PI * 2);
    c.fill();
    for (let k = 0; k < 3; k++) {
      c.fillStyle = ["#a6a895", "#899581", "#748069"][k];
      c.beginPath();
      c.moveTo(0, s);
      for (let x = 0; x <= s; x += 20)
        c.lineTo(
          x,
          510 +
            k * 80 +
            Math.sin(x * 0.006 + k) * 55 +
            Math.sin(x * 0.017) * 12,
        );
      c.lineTo(s, s);
      c.fill();
    }
    for (let i = 0; i < 28; i++) {
      const x = r() * s,
        y = 630 + r() * 320,
        h = 40 + r() * 110;
      c.fillStyle = "#5d6550";
      c.fillRect(x - 2, y - h, 4, h + 12);
      for (let j = 0; j < 9; j++) {
        c.fillStyle = j % 2 ? "#748052" : "#68774e";
        c.beginPath();
        c.ellipse(
          x + Math.sin(j * 2.4) * h * 0.16,
          y - h * 0.75 + (j % 3) * h * 0.13,
          h * 0.18,
          h * 0.22,
          j,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
    }
  });
}
function artMap(variant = 0) {
  return texture((c, r, s) => {
    c.fillStyle = "#ded1af";
    c.fillRect(0, 0, s, s);
    const palette = ["#56614b", "#b88835", "#a65d3a", "#c99c62"];
    if (variant === 0) {
      for (let row = 0; row < 2; row++)
        for (let col = 0; col < 2; col++) {
          c.fillStyle = palette[row * 2 + col];
          c.beginPath();
          c.ellipse(
            292 + col * 420,
            290 + row * 425,
            187,
            203,
            (col - row) * 0.45,
            0,
            Math.PI * 2,
          );
          c.fill();
        }
    } else {
      for (let i = 0; i < 4; i++) {
        c.fillStyle = palette[i];
        c.beginPath();
        c.moveTo((i % 2) * 512, Math.floor(i / 2) * 512);
        c.lineTo(((i % 2) + 1) * 512, Math.floor(i / 2) * 512);
        c.quadraticCurveTo(
          ((i % 2) + 1) * 512,
          (Math.floor(i / 2) + 1) * 512,
          (i % 2) * 512,
          (Math.floor(i / 2) + 1) * 512,
        );
        c.closePath();
        c.fill();
      }
    }
    for (let i = 0; i < 14000; i++) {
      c.fillStyle = i % 2 ? "#ffffff0e" : "#433c2c12";
      c.fillRect(r() * s, r() * s, 1 + r() * 4, 1 + r() * 3);
    }
  });
}
export function createMaterials() {
  const m = baseMaterials();
  const fabric = (color) => {
    const mat = m.linen.clone();
    mat.color.set(color);
    return mat;
  };
  m.olive = fabric("#818452");
  m.mustard = fabric("#cf9a3f");
  m.rust = fabric("#a75430");
  m.sage = fabric("#647057");
  m.caramel.color.set("#bd8350");
  m.chocolate.color.set("#8a5e37");
  m.wood.color.set("#e4bd86");
  m.dark.color.set("#b99a70");
  m.floor.color.set("#c7ad89");
  m.wall.color.set("#fff3d9");
  m.ceramic.color.set("#e2d6b9");
  m.clay.color.set("#b78442");
  m.bronze = new THREE.MeshStandardMaterial({
    color: "#bc954e",
    metalness: 0.72,
    roughness: 0.34,
  });
  m.celadon = m.sage;
  m.woven = m.taupe;
  m.art = new THREE.MeshStandardMaterial({ map: artMap(), roughness: 1 });
  m.art2 = new THREE.MeshStandardMaterial({ map: artMap(1), roughness: 1 });
  const geometryRug = texture((c, r, s) => {
    c.fillStyle = "#d8c8a6";
    c.fillRect(0, 0, s, s);
    c.fillStyle = "#525b3d";
    c.beginPath();
    c.moveTo(42, 140);
    c.lineTo(390, 105);
    c.lineTo(60, 595);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(765, 70);
    c.lineTo(953, 75);
    c.lineTo(923, 610);
    c.quadraticCurveTo(854, 511, 765, 70);
    c.fill();
    c.fillStyle = "#bd913d";
    c.beginPath();
    c.ellipse(535, 625, 172, 162, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#a95633";
    c.beginPath();
    c.ellipse(783, 946, 280, 159, -0.25, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#c29258";
    c.beginPath();
    c.arc(157, 101, 90, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#454b3a";
    c.lineWidth = 5;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.moveTo(102 + i * 24, 670);
      c.lineTo(191 + i * 24, 531);
      c.stroke();
      c.beginPath();
      c.moveTo(798, 657 + i * 19);
      c.lineTo(940, 670 + i * 19);
      c.stroke();
    }
    for (let i = 0; i < 60000; i++) {
      c.fillStyle = i % 2 ? "#fcf0d520" : "#4e483522";
      c.fillRect(r() * s, r() * s, 1 + r() * 3, 1 + r() * 3);
    }
  });
  m.rug.map = geometryRug;
  m.rug.color.set("#ffffff");
  m.pattern = m.linen.clone();
  m.pattern.color.set("#fff4db");
  m.pattern.map = artMap(1);
  return m;
}
