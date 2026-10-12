import * as THREE from "three";

function canvas(draw, w = 512, h = 512) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  let seed = 1189;
  const r = () => (seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296;
  draw(c.getContext("2d"), r, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
export function forestTexture(day = true) {
  return canvas(
    (c, r, w, h) => {
      const sky = c.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, day ? "#c2d3df" : "#26374e");
      sky.addColorStop(1, day ? "#eef0ea" : "#8297a8");
      c.fillStyle = sky;
      c.fillRect(0, 0, w, h);
      for (let layer = 0; layer < 3; layer++) {
        c.fillStyle = day
          ? ["#d9e1e5", "#c5d2d8", "#b8c9d0"][layer]
          : ["#43556c", "#536a7c", "#627a89"][layer];
        c.beginPath();
        c.moveTo(0, h);
        for (let x = 0; x <= w; x += 32)
          c.lineTo(
            x,
            230 +
              layer * 60 +
              Math.sin(x * 0.006 + layer) * 45 +
              Math.cos(x * 0.013) * 15,
          );
        c.lineTo(w, h);
        c.fill();
      }
      // Layered drooping boughs distinguish cedar silhouettes from simple triangular trees.
      for (let layer = 0; layer < 3; layer++)
        for (let i = 0; i < 14; i++) {
          const x = (i * w) / 12 + (r() - 0.5) * 85,
            y = 135 + r() * 110 - layer * 21,
            height = 230 + r() * 150 + layer * 40;
          c.strokeStyle = day
            ? ["#91a8b2", "#698791", "#496c73"][layer]
            : ["#384c60", "#2f475a", "#283e51"][layer];
          c.lineWidth = 2 + layer;
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x, y + height);
          c.stroke();
          for (let j = 0; j < 13; j++) {
            const yy = y + (j * height) / 14,
              spread = 6 + j * (2.7 + layer * 0.45);
            c.strokeStyle = day
              ? ["#9fb2b8", "#789198", "#597a7e"][layer]
              : ["#41576b", "#344e62", "#2e4659"][layer];
            c.lineWidth = 3 + layer * 2;
            c.beginPath();
            c.moveTo(x - spread, yy + 16);
            c.quadraticCurveTo(x - 7, yy + 8, x, yy);
            c.quadraticCurveTo(x + 9, yy + 10, x + spread, yy + 17);
            c.stroke();
            c.fillStyle = day
              ? ["#a0b4ba", "#829b9f", "#64858a"][layer]
              : ["#41576b", "#344e62", "#2e4659"][layer];
            c.beginPath();
            c.moveTo(x, yy - 4);
            c.quadraticCurveTo(x - spread * 0.55, yy + 4, x - spread, yy + 23);
            c.lineTo(x - spread * 0.42, yy + 20);
            c.lineTo(x, yy + 14);
            c.lineTo(x + spread * 0.52, yy + 23);
            c.lineTo(x + spread, yy + 22);
            c.quadraticCurveTo(x + spread * 0.4, yy + 3, x, yy - 4);
            c.fill();
            c.strokeStyle = day ? "#f0f3ed" : "#a2b4c0";
            c.lineWidth = 2 + layer * 0.5;
            c.beginPath();
            c.moveTo(x - spread * 0.9, yy + 12);
            c.lineTo(x - 3, yy + 1);
            c.lineTo(x + spread * 0.85, yy + 13);
            c.stroke();
          }
        }
      const fog = c.createLinearGradient(0, 320, 0, h);
      fog.addColorStop(0, "#dfe9ec00");
      fog.addColorStop(1, day ? "#eaf0efb0" : "#899dac65");
      c.fillStyle = fog;
      c.fillRect(0, 0, w, h);
    },
    1024,
    640,
  );
}
export function createMaterials() {
  const oak = canvas((c, r) => {
    c.fillStyle = "#d5b68c";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1100; i++) {
      const y = r() * 512;
      c.lineWidth = 0.25 + r();
      c.strokeStyle = i % 2 ? "#6a502018" : "#ffedc726";
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x <= 512; x += 24)
        c.lineTo(x, y + Math.sin(x * 0.017 + i) * 1.9);
      c.stroke();
    }
  });
  const knit = canvas((c, r) => {
    c.fillStyle = "#d5cfc3";
    c.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 10)
      for (let x = 0; x < 512; x += 8) {
        c.lineWidth = 1.5;
        c.strokeStyle = (x + y) % 3 ? "#766b572a" : "#fff6e645";
        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(x + 5, y + 5, x + 4, y + 9);
        c.quadraticCurveTo(x + 7, y + 4, x + 8, y);
        c.stroke();
      }
  });
  const rug = canvas((c, r) => {
    c.fillStyle = "#b3a58d";
    c.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 3) {
      c.fillStyle = y % 2 ? "#f2e5c750" : "#60553e35";
      c.fillRect(0, y, 512, 1);
    }
    for (let x = 0; x < 512; x += 4) {
      c.fillStyle = "#e9d8b840";
      c.fillRect(x, 0, 1, 512);
    }
    for (let i = 0; i < 4000; i++) {
      c.fillStyle = "#685c4215";
      c.fillRect(r() * 512, r() * 512, 1, 2);
    }
  });
  const plaster = canvas((c, r) => {
    c.fillStyle = "#e8e6df";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 16000; i++) {
      c.fillStyle = i % 2 ? "#7c776f10" : "#ffffff18";
      c.fillRect(r() * 512, r() * 512, 1, 1);
    }
  });
  const mat = (color, map = null, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, map, roughness: 0.85, ...extra });
  return {
    floor: mat("#f2dfc3", oak, { bumpMap: oak, bumpScale: 0.005 }),
    wood: mat("#f0ddbb", oak),
    darkWood: mat("#9d8870", oak),
    wall: mat("#f3f1e8", plaster, { bumpMap: plaster, bumpScale: 0.003 }),
    trim: mat("#c3c2b8"),
    charcoal: mat("#303638", null, { roughness: 0.54 }),
    fabric: mat("#efebe2", knit, { bumpMap: knit, bumpScale: 0.015 }),
    sage: mat("#839083", knit, { bumpMap: knit, bumpScale: 0.013 }),
    blue: mat("#889da8", knit, { bumpMap: knit, bumpScale: 0.013 }),
    wool: mat("#eee2cb", knit, {
      side: THREE.DoubleSide,
      bumpMap: knit,
      bumpScale: 0.022,
    }),
    rug: mat("#d4c6ac", rug, { bumpMap: rug, bumpScale: 0.012 }),
    ceramic: mat("#e0dfd2", null, { roughness: 0.43 }),
    clay: mat("#ad7964", null, { roughness: 0.73 }),
    leaf: mat("#627f65"),
    leafLight: mat("#8a9c77"),
    soil: mat("#4a4538"),
    pages: mat("#e1ddd0", plaster),
    book: mat("#919a93"),
    wax: mat("#eedcbb"),
    glow: mat("#eee1c0", null, { emissive: "#ffcb83", emissiveIntensity: 0.5 }),
    flame: new THREE.MeshBasicMaterial({
      color: "#ffd798",
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    }),
  };
}
