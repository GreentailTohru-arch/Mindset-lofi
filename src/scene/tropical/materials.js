import * as THREE from "three";
import { createMaterials as textiles } from "../bohemian/materials.js";
import { createMaterials as natural } from "../dongfang/materials.js";
import { seeded } from "../materials.js";

function texture(draw, size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), seeded(6519), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function leaf(c, x, y, size, angle, color) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(0, 0);
  c.bezierCurveTo(
    -size * 0.4,
    -size * 0.5,
    -size * 0.25,
    -size * 0.95,
    0,
    -size,
  );
  c.bezierCurveTo(size * 0.34, -size * 0.65, size * 0.28, -size * 0.22, 0, 0);
  c.fill();
  c.strokeStyle = "#a6ae6780";
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(0, -size * 0.9);
  c.stroke();
  c.restore();
}
export function gardenTexture(night = false) {
  return texture((c, r, s) => {
    const sky = c.createLinearGradient(0, 0, 0, s);
    sky.addColorStop(0, night ? "#273f58" : "#d99068");
    sky.addColorStop(0.45, night ? "#68857e" : "#ffe2a7");
    sky.addColorStop(1, "#233f35");
    c.fillStyle = sky;
    c.fillRect(0, 0, s, s);
    c.fillStyle = night ? "#d9e5d9" : "#fff2bf";
    c.beginPath();
    c.arc(250, 240, 38, 0, Math.PI * 2);
    c.fill();
    for (let l = 0; l < 4; l++) {
      c.fillStyle = ["#9d9c7e", "#738772", "#50725c", "#34543f"][l];
      c.beginPath();
      c.moveTo(0, s);
      for (let x = 0; x <= s; x += 12)
        c.lineTo(
          x,
          380 +
            l * 69 +
            Math.sin(x * 0.009 + l) * 70 +
            Math.sin(x * 0.025) * 17,
        );
      c.lineTo(s, s);
      c.fill();
    }
    for (let i = 0; i < 14; i++) {
      const x = i * 81 - 12,
        y = 290 + r() * 175,
        h = 230 + r() * 130;
      c.strokeStyle = "#46523a";
      c.lineWidth = 9;
      c.beginPath();
      c.moveTo(x + 18, y + h);
      c.quadraticCurveTo(x - 15, y + 80, x, y);
      c.stroke();
      for (let j = 0; j < 9; j++) {
        const a = (j * Math.PI) / 4.5;
        for (let k = 1; k < 12; k++) {
          const t = k / 12,
            px = x + Math.cos(a) * t * 112,
            py = y + Math.sin(a) * t * 44 + t * t * 43;
          leaf(c, px, py, 30 * (1 - t) + 14, a + 1.1, "#385f41");
        }
      }
    }
    c.fillStyle = "#688d82";
    c.beginPath();
    c.ellipse(600, 848, 298, 172, -0.18, 0, Math.PI * 2);
    c.fill();
    for (let i = 0; i < 290; i++) {
      const x = 335 + r() * 540,
        y = 744 + r() * 265;
      c.strokeStyle = i % 3 ? "#d4d6a74c" : "#173f4744";
      c.lineWidth = 1 + r() * 2;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 12 + r() * 25, y);
      c.stroke();
    }
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 5; col++) {
        c.fillStyle = ["#877e63", "#a19477", "#6e725c"][(row + col) % 3];
        c.fillRect(560 + col * 48 + (row % 2) * 16, 510 + row * 38, 46, 35);
      }
    c.fillStyle = "#3a483e";
    c.beginPath();
    c.ellipse(676, 626, 31, 42, 0, 0, Math.PI * 2);
    c.fill();
    for (let i = 0; i < 32; i++) {
      c.strokeStyle = i % 3 ? "#dfeddb66" : "#fff3dca0";
      c.lineWidth = 1 + r() * 3;
      c.beginPath();
      c.moveTo(650 + r() * 42, 626);
      c.quadraticCurveTo(651 + r() * 56, 721, 621 + r() * 110, 791);
      c.stroke();
    }
    for (let i = 0; i < 10; i++) {
      c.strokeStyle = "#dde5cb80";
      c.beginPath();
      c.ellipse(674, 798 + i * 4, 32 + i * 8, 7 + i * 2, 0, 0, Math.PI * 2);
      c.stroke();
    }
    for (let i = 0; i < 110; i++) {
      const x = r() * s,
        y = 610 + r() * 420;
      if (x > 310 && x < 880 && y > 700) continue;
      leaf(
        c,
        x,
        y,
        65 + r() * 145,
        (r() - 0.5) * 2,
        ["#385941", "#4c7143", "#718443"][i % 3],
      );
    }
    for (let i = 0; i < 11; i++) {
      const x = 80 + r() * 220,
        y = 710 + r() * 250;
      leaf(c, x, y, 45, -1.0, "#c16b33");
      leaf(c, x + 12, y + 2, 35, 0.4, "#e89942");
    }
  });
}
export function createMaterials() {
  const m = textiles(),
    n = natural();
  m.flowerTile = m.floor;
  m.wall = n.wall;
  m.wall.color.set("#fff8e9");
  m.floor = n.floor;
  m.floor.color.set("#ffe2b1");
  m.floor.roughness = 0.48;
  m.wood.color.set("#c69c69");
  m.dark.color.set("#8c6949");
  m.lightWood.color.set("#c59d62");
  m.linen.color.set("#fff7e4");
  m.celadon.color.set("#66896d");
  m.clay.color.set("#c4956a");
  m.leaf.color.set("#315f35");
  m.leafLight.color.set("#668748");
  m.tiles = m.floor.clone();
  m.tiles.map = texture((c, r, s) => {
    c.fillStyle = "#cfb38d";
    c.fillRect(0, 0, s, s);
    const w = s / 12;
    for (let y = 0; y < 12; y++)
      for (let x = 0; x < 12; x++) {
        c.fillStyle = ["#bd704a", "#cb8454", "#c17c50", "#d6986c"][(x + y) % 4];
        c.fillRect(x * w + 1.5, y * w + 1.5, w - 3, w - 3);
        for (let i = 0; i < 20; i++) {
          c.fillStyle = "#e0b1821d";
          c.fillRect(x * w + r() * w, y * w + r() * w, r() * 15, 2);
        }
      }
  });
  m.tiles.bumpMap = m.tiles.map;

  const cane = texture((c, r, s) => {
    c.fillStyle = "#796144";
    c.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 32)
      for (let x = 0; x < s; x += 32) {
        c.strokeStyle = "#d1ab70";
        c.lineWidth = 4;
        c.strokeRect(x + 3, y + 3, 26, 26);
        c.strokeStyle = "#a4824f";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + 32, y + 32);
        c.moveTo(x + 32, y);
        c.lineTo(x, y + 32);
        c.stroke();
      }
  });
  m.woven = new THREE.MeshStandardMaterial({
    color: "#e2bf85",
    map: cane,
    bumpMap: cane,
    bumpScale: 0.014,
    roughness: 0.86,
  });
  const sisal = texture((c, r, s) => {
    c.fillStyle = "#c1a577";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < s; i += 3) {
      c.fillStyle = i % 2 ? "#f2d6a35e" : "#77614655";
      c.fillRect(i, 0, 1, s);
      c.fillRect(0, i, s, 1);
    }
    for (let i = 0; i < 24000; i++) {
      c.fillStyle = "#eee0b322";
      c.fillRect(r() * s, r() * s, 1, 3);
    }
  });
  m.rug = new THREE.MeshStandardMaterial({
    color: "#e8d4ad",
    map: sisal,
    bumpMap: sisal,
    bumpScale: 0.014,
    roughness: 1,
  });
  const carpet = texture((c, r, s) => {
    c.fillStyle = "#b99b73";
    c.fillRect(0, 0, s, s);
    for (const [inset, width, color] of [
      [14, 20, "#7f5442"],
      [37, 12, "#d1b38a"],
      [63, 34, "#354c53"],
      [89, 6, "#ba825d"],
    ]) {
      c.strokeStyle = color;
      c.lineWidth = width;
      c.strokeRect(inset, inset, s - inset * 2, s - inset * 2);
    }
    function motif(x, y, k) {
      c.save();
      c.translate(x, y);
      c.scale(k, k);
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        c.fillStyle = i % 2 ? "#ac684f" : "#40545a";
        c.beginPath();
        c.ellipse(
          Math.cos(a) * 10,
          Math.sin(a) * 10,
          4,
          10,
          a + Math.PI / 2,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
      c.fillStyle = "#d9bf94";
      c.beginPath();
      c.arc(0, 0, 4, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
    for (let y = 120; y < s - 100; y += 56)
      for (let x = 120; x < s - 100; x += 56)
        motif(x + (Math.floor(y / 56) % 2) * 16, y, 0.8);
    for (let a = 75; a < s - 50; a += 39) {
      motif(a, 63, 0.56);
      motif(a, s - 63, 0.56);
      motif(63, a, 0.56);
      motif(s - 63, a, 0.56);
    }
    for (let i = 0; i < s; i += 3) {
      c.fillStyle = i % 2 ? "#f7dec422" : "#30251c1c";
      c.fillRect(i, 0, 1, s);
      c.fillRect(0, i, s, 1);
    }
    for (let i = 0; i < 32000; i++) {
      c.fillStyle = "#e5d2b621";
      c.fillRect(r() * s, r() * s, 2, 2);
    }
  });
  m.persian = new THREE.MeshStandardMaterial({
    color: "#eee1cc",
    map: carpet,
    bumpMap: carpet,
    bumpScale: 0.01,
    roughness: 1,
  });
  m.artwork = new THREE.MeshStandardMaterial({
    roughness: 1,
    map: texture((c, r, s) => {
      c.fillStyle = "#e0d1b2";
      c.fillRect(0, 0, s, s);
      for (let i = 0; i < 16; i++) {
        const x = 200 + (i % 4) * 180,
          y = 900 - Math.floor(i / 4) * 160;
        leaf(
          c,
          x,
          y,
          220 + r() * 150,
          (r() - 0.5) * 1.6,
          ["#567253", "#365442", "#748562"][i % 3],
        );
      }
      for (let i = 0; i < 5; i++) {
        leaf(c, 660 + i * 17, 530 - i * 13, 100, -0.8, "#ba603b");
      }
    }),
  });
  return m;
}
