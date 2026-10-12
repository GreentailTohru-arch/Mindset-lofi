import * as THREE from "three";
import { seeded } from "../materials.js";
function texture(draw, w = 512, h = 512) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), seeded(902), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
export function landscapeTexture({ ink = false, day = false } = {}) {
  return texture(
    (c, r, w, h) => {
      const sky = c.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, ink ? "#d6c9ac" : day ? "#aabdc7" : "#344a66");
      sky.addColorStop(1, ink ? "#ede2ca" : day ? "#e0d9c5" : "#98a8b3");
      c.fillStyle = sky;
      c.fillRect(0, 0, w, h);
      for (let layer = 0; layer < 6; layer++) {
        const base = ink
          ? ["#c0b7a4", "#aea894", "#989884", "#838575", "#626d60", "#48594d"]
          : ["#8093a5", "#6f8598", "#5c7489", "#48647b", "#354f63", "#2b4654"];
        const ridge = [];
        for (let x = 0; x <= w + 8; x += 8) {
          const y =
            h * (0.35 + layer * 0.09) -
            Math.abs(Math.sin(x * 0.004 + layer * 0.8)) * (140 - layer * 10) +
            Math.sin(x * 0.031 + layer) * 8;
          ridge.push([x, y]);
        }
        c.fillStyle = base[layer];
        c.beginPath();
        c.moveTo(0, h);
        ridge.forEach((p) => c.lineTo(...p));
        c.lineTo(w, h);
        c.closePath();
        c.fill();
        c.save();
        c.clip();
        for (let j = 0; j < 120; j++) {
          const x = r() * w,
            y = r() * h;
          c.strokeStyle = ink ? "#e7dec33d" : "#b3c1c620";
          c.lineWidth = 0.7;
          c.beginPath();
          c.moveTo(x, y);
          c.quadraticCurveTo(x - 25, y + 40, x - 38, y + 105);
          c.stroke();
        }
        c.restore();
        if (layer < 4) {
          const mist = c.createLinearGradient(
            0,
            h * (0.35 + layer * 0.09),
            0,
            h * (0.55 + layer * 0.09),
          );
          mist.addColorStop(0, "#cbd7dd00");
          mist.addColorStop(1, ink ? "#e9ddc22a" : "#c6d1d630");
          c.fillStyle = mist;
          c.fillRect(0, 0, w, h);
        }
      }
      // A few quiet village roofs, never labels or writing.
      for (let i = 0; i < 4; i++) {
        const x = w * (0.19 + i * 0.12),
          y = h * (0.72 + (i % 2) * 0.06),
          s = 1 - i * 0.09;
        c.fillStyle = ink ? "#9e947e" : "#b29d80";
        c.fillRect(x - 21 * s, y, 42 * s, 29 * s);
        c.fillStyle = ink ? "#5c6359" : "#293e50";
        c.beginPath();
        c.moveTo(x - 35 * s, y + 3);
        c.quadraticCurveTo(x - 14 * s, y - 6, x, y - 23 * s);
        c.quadraticCurveTo(x + 15 * s, y - 5, x + 36 * s, y + 3);
        c.closePath();
        c.fill();
        if (!ink) {
          c.fillStyle = "#e0be7c";
          c.fillRect(x - 7 * s, y + 8 * s, 9 * s, 11 * s);
        }
      }
      for (let i = 0; i < 14; i++) {
        const x = w * (0.68 + i * 0.023),
          y = h * (0.43 + (i % 4) * 0.09),
          height = 75 + (i % 3) * 20;
        c.strokeStyle = ink ? "#4e584b" : "#203e45";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(x, y + height);
        c.lineTo(x - 4, y);
        c.stroke();
        c.fillStyle = c.strokeStyle;
        for (let j = 0; j < 6; j++) {
          c.beginPath();
          c.ellipse(
            x + Math.sin(j * 2) * 19,
            y + (j * height) / 8,
            12 + j * 2,
            5 + (j % 3),
            0,
            0,
            Math.PI * 2,
          );
          c.fill();
        }
      }
      if (ink)
        for (let i = 0; i < 9000; i++) {
          c.fillStyle = i % 2 ? "#fff4d910" : "#675c4810";
          c.fillRect(r() * w, r() * h, 1, 2);
        }
    },
    1024,
    768,
  );
}
export function createMaterials() {
  const wood = texture((c, r) => {
    c.fillStyle = "#79583d";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1200; i++) {
      const y = r() * 512;
      c.strokeStyle = i % 3 ? "#251c1730" : "#d5b28036";
      c.lineWidth = 0.4 + r();
      c.beginPath();
      c.moveTo(0, y);
      c.bezierCurveTo(160, y - 3, 310, y + 3, 512, y + 1);
      c.stroke();
    }
  });
  const floor = texture(
    (c, r, w, h) => {
      c.fillStyle = "#332a22";
      c.fillRect(0, 0, w, h);
      for (let row = 0; row < 24; row++)
        for (let col = -1; col < 4; col++) {
          const x = col * 342 + (row % 3) * 114,
            y = (row * h) / 24,
            v = Math.floor(r() * 13);
          c.fillStyle = `rgb(${95 + v},${68 + v},${46 + v})`;
          c.fillRect(x + 0.7, y + 0.6, 340.6, h / 24 - 1.2);
          for (let j = 0; j < 55; j++) {
            const yy = y + 1 + r() * (h / 24 - 2);
            c.strokeStyle = j % 3 ? "#291e1635" : "#ddb58028";
            c.lineWidth = 0.5;
            c.beginPath();
            c.moveTo(x, yy);
            c.bezierCurveTo(x + 100, yy + 2, x + 220, yy - 2, x + 342, yy);
            c.stroke();
          }
        }
    },
    1024,
    1024,
  );
  const plaster = texture((c, r) => {
    c.fillStyle = "#ded6c9";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 14000; i++) {
      c.fillStyle = i % 2 ? "#897e6b0e" : "#fff8ea18";
      c.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1 + r() * 3);
    }
  });
  const fabric = texture((c, r) => {
    c.fillStyle = "#d7cebd";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 3) {
      c.fillStyle = i % 2 ? "#897f6b38" : "#fff4db37";
      c.fillRect(i, 0, 1, 512);
      c.fillRect(0, i, 512, 1);
    }
    for (let i = 0; i < 3000; i++) {
      c.fillStyle = "#84765f14";
      c.fillRect(r() * 512, r() * 512, 1, 2);
    }
  });
  const rug = texture((c, r) => {
    c.fillStyle = "#c4b59c";
    c.fillRect(0, 0, 512, 512);
    for (let x = 0; x < 512; x += 64)
      for (let y = 0; y < 512; y += 64) {
        c.strokeStyle = "#85796150";
        c.lineWidth = 2;
        c.strokeRect(x + 5, y + 5, 53, 53);
        c.strokeRect(x + 13, y + 13, 37, 37);
        c.beginPath();
        c.moveTo(x + 13, y + 13);
        c.lineTo(x + 49, y + 49);
        c.stroke();
      }
    for (let i = 0; i < 512; i += 3) {
      c.fillStyle = "#eee3c633";
      c.fillRect(i, 0, 1, 512);
      c.fillRect(0, i, 512, 1);
    }
  });
  const stone = texture((c, r) => {
    c.fillStyle = "#a4a396";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 17000; i++) {
      c.fillStyle = i % 3 ? "#525e5234" : "#eff0db30";
      c.fillRect(r() * 512, r() * 512, 1 + r() * 3, 1 + r() * 2);
    }
  });
  const mat = (color, map = null, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, map, roughness: 0.8, ...extra });
  return {
    wood: mat("#d3b393", wood, {
      bumpMap: wood,
      bumpScale: 0.009,
      roughness: 0.52,
    }),
    dark: mat("#97816b", wood, { roughness: 0.58 }),
    floor: mat("#e5d3be", floor, {
      bumpMap: floor,
      bumpScale: 0.008,
      roughness: 0.6,
    }),
    wall: mat("#f3ede1", plaster, { bumpMap: plaster, bumpScale: 0.004 }),
    trim: mat("#c5c4bd"),
    linen: mat("#f4ead8", fabric, { bumpMap: fabric, bumpScale: 0.012 }),
    sage: mat("#8b9980", fabric, { bumpMap: fabric, bumpScale: 0.012 }),
    taupe: mat("#ad9477", fabric),
    rug: mat("#eee3d1", rug, { bumpMap: fabric, bumpScale: 0.014 }),
    woven: mat("#c1a676", fabric, { bumpMap: fabric, bumpScale: 0.018 }),
    curtain: mat("#f3eee1", fabric, {
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    celadon: mat("#9caf9b", null, { roughness: 0.27 }),
    clay: mat("#90806a", stone, { bumpMap: stone, bumpScale: 0.009 }),
    stone: mat("#999e94", stone, { bumpMap: stone, bumpScale: 0.022 }),
    rock: mat("#586358", stone, { bumpMap: stone, bumpScale: 0.023 }),
    moss: mat("#637747", fabric),
    leaf: mat("#45684c"),
    leafLight: mat("#718654"),
    soil: mat("#383426"),
    ink: mat("#31392f"),
    paper: mat("#e3dbc6", plaster),
    bronze: mat("#8a7953", null, { metalness: 0.4, roughness: 0.49 }),
    rust: mat("#a2724c"),
    glow: mat("#ffe8bc", fabric, {
      emissive: "#ffd09a",
      emissiveIntensity: 0.58,
      roughness: 0.85,
    }),
    water: mat("#637e7f", null, { roughness: 0.2, metalness: 0.28 }),
    artwork: mat("#f1e7cf", landscapeTexture({ ink: true }), { roughness: 1 }),
  };
}
