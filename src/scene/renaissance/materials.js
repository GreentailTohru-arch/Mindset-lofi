import * as THREE from "three";
import { createMaterials as baseMaterials, seeded } from "../materials.js";

function canvasMap(draw, size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size, seeded(928));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function cityTexture(day = false, painting = false) {
  return canvasMap((c, s, r) => {
    const sky = c.createLinearGradient(0, 0, 0, s);
    sky.addColorStop(0, painting ? "#8a6b68" : day ? "#8faebf" : "#111e39");
    sky.addColorStop(1, painting ? "#d5af77" : day ? "#d9d1b8" : "#526581");
    c.fillStyle = sky;
    c.fillRect(0, 0, s, s);
    c.fillStyle = "#d8d4b6";
    c.beginPath();
    c.arc(s * 0.79, s * 0.14, s * 0.032, 0, Math.PI * 2);
    c.fill();
    // Mansard rooftops, a domed skyline and warm windows, without text or logos.
    for (let layer = 0; layer < 2; layer++)
      for (let i = 0; i < 9; i++) {
        const x = (i * s) / 8 - s * 0.03,
          w = s * (0.095 + r() * 0.035),
          h = s * (0.28 + r() * 0.22),
          y = s * 0.89 - h + layer * s * 0.06;
        c.fillStyle = painting
          ? ["#59626a", "#515557"][layer]
          : ["#32465d", "#24384a"][layer];
        c.fillRect(x, y, w, h);
        c.beginPath();
        c.moveTo(x - 3, y);
        c.lineTo(x + w * 0.2, y - s * 0.047);
        c.lineTo(x + w * 0.83, y - s * 0.047);
        c.lineTo(x + w + 3, y);
        c.fill();
        c.fillStyle = "#767976";
        c.fillRect(x, y + s * 0.045, w, 2);
        for (let yy = y + s * 0.073; yy < s * 0.89; yy += s * 0.054)
          for (let xx = x + 9; xx < x + w - 5; xx += s * 0.031) {
            c.fillStyle =
              r() > 0.52 ? (day ? "#82959e" : "#e4b875") : "#192b3e";
            c.fillRect(xx, yy, s * 0.012, s * 0.028);
            c.fillStyle = "#bac0b529";
            c.fillRect(xx - 2, yy + s * 0.03, s * 0.019, 2);
          }
      }
    c.fillStyle = painting ? "#424c54" : "#263b51";
    c.fillRect(s * 0.48, s * 0.27, s * 0.15, s * 0.52);
    c.beginPath();
    c.ellipse(
      s * 0.555,
      s * 0.27,
      s * 0.095,
      s * 0.105,
      0,
      Math.PI,
      Math.PI * 2,
    );
    c.fill();
    c.fillRect(s * 0.55, s * 0.105, s * 0.01, s * 0.07);
    c.fillStyle = painting ? "#52626b" : "#263c51";
    c.fillRect(0, s * 0.89, s, s * 0.11);
    for (let i = 0; i < 100; i++) {
      c.fillStyle = i % 3 ? "#e4b87838" : "#b4cad329";
      c.fillRect(r() * s, s * 0.9 + r() * s * 0.1, 8 + r() * 26, 1 + r() * 2);
    }
    if (painting)
      for (let i = 0; i < 12000; i++) {
        c.fillStyle = r() > 0.5 ? "#f1d6a817" : "#17222a12";
        c.fillRect(r() * s, r() * s, 1 + r() * 3, 1);
      }
  }, 768);
}

export function createMaterials() {
  const m = baseMaterials();
  const plaster = canvasMap((c, s, r) => {
    c.fillStyle = "#ccc9bf";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 22000; i++) {
      c.fillStyle = r() > 0.5 ? "#fff6df13" : "#5b4d3910";
      c.fillRect(r() * s, r() * s, 1 + r() * 3, 1 + r() * 3);
    }
  });
  const leather = canvasMap((c, s, r) => {
    c.fillStyle = "#beb5a7";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 22000; i++) {
      c.fillStyle = r() > 0.6 ? "#ffefd51d" : "#4632261d";
      c.fillRect(r() * s, r() * s, 1 + r() * 2, 1);
    }
  });
  const rug = canvasMap((c, s, r) => {
    c.fillStyle = "#514a43";
    c.fillRect(0, 0, s, s);
    for (const [p, col] of [
      [8, "#ba9871"],
      [17, "#574b43"],
      [30, "#aa805f"],
      [40, "#333f40"],
      [53, "#986e54"],
    ]) {
      c.strokeStyle = col;
      c.lineWidth = p === 30 ? 9 : 3;
      c.strokeRect(p, p, s - 2 * p, s - 2 * p);
    }
    for (let y = 67; y < s - 60; y += 25)
      for (let x = 67; x < s - 60; x += 25) {
        c.fillStyle = (x + y) % 3 ? "#bda07a" : "#536764";
        c.beginPath();
        c.moveTo(x, y - 8);
        c.lineTo(x + 7, y);
        c.lineTo(x, y + 8);
        c.lineTo(x - 7, y);
        c.closePath();
        c.fill();
      }
    for (const [rx, ry, col] of [
      [111, 163, "#303f40"],
      [88, 140, "#aa7e5c"],
      [67, 114, "#504743"],
      [40, 77, "#b09c79"],
    ]) {
      c.fillStyle = col;
      c.beginPath();
      c.moveTo(s / 2, s / 2 - ry);
      c.lineTo(s / 2 + rx, s / 2);
      c.lineTo(s / 2, s / 2 + ry);
      c.lineTo(s / 2 - rx, s / 2);
      c.closePath();
      c.fill();
    }
    for (let i = 0; i < 24000; i++) {
      c.fillStyle = r() > 0.5 ? "#f8e1b518" : "#221b1917";
      c.fillRect(r() * s, r() * s, 1, 2);
    }
  });
  m.floor.color.set("#8d6548");
  m.floor.roughness = 0.66;
  m.floor.vertexColors = true;
  m.wall.color.set("#e5d8bb");
  m.wall.map = plaster;
  m.wall.bumpMap = plaster;
  m.wall.bumpScale = 0.012;
  m.trim.color.set("#b4aa95");
  m.wood.color.set("#67432a");
  m.woodDark.color.set("#3e2a20");
  m.woodLight.color.set("#aa8157");
  m.leather = new THREE.MeshStandardMaterial({
    color: "#663421",
    map: leather,
    bumpMap: leather,
    bumpScale: 0.012,
    roughness: 0.5,
  });
  m.olive = m.duvet.clone();
  m.olive.color.set("#596044");
  m.linen = m.pillow.clone();
  m.linen.color.set("#d4c3a2");
  m.burgundy = m.duvet.clone();
  m.burgundy.color.set("#61303a");
  m.rug = new THREE.MeshStandardMaterial({
    map: rug,
    roughness: 1,
    bumpMap: rug,
    bumpScale: 0.018,
  });
  m.brass = new THREE.MeshStandardMaterial({
    color: "#b99756",
    metalness: 0.7,
    roughness: 0.33,
  });
  m.paper = new THREE.MeshStandardMaterial({
    color: "#d9c9a7",
    roughness: 0.94,
  });
  m.sheer = new THREE.MeshStandardMaterial({
    color: "#e9e0cb",
    transparent: true,
    opacity: 0.4,
    roughness: 1,
    side: THREE.DoubleSide,
    depthWrite: false,
    map: m.pillow.map,
  });
  m.lamp = new THREE.MeshStandardMaterial({
    color: "#efd39b",
    emissive: "#ffc477",
    emissiveIntensity: 0.6,
    roughness: 0.8,
  });
  m.greenGlass = new THREE.MeshStandardMaterial({
    color: "#31543e",
    metalness: 0.15,
    roughness: 0.22,
  });
  m.ceramic.color.set("#c0b494");
  return m;
}
