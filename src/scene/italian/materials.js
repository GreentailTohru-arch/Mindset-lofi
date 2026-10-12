import * as THREE from "three";

function texture(draw, size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  let seed = 49217;
  const random = () =>
    (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  draw(c.getContext("2d"), random, size);
  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return map;
}
export function cityTexture(day = false) {
  return texture((c, r, s) => {
    const sky = c.createLinearGradient(0, 0, 0, s);
    sky.addColorStop(0, day ? "#879fae" : "#162439");
    sky.addColorStop(0.7, day ? "#d7d4c8" : "#596d85");
    sky.addColorStop(1, day ? "#c3baa8" : "#283b51");
    c.fillStyle = sky;
    c.fillRect(0, 0, s, s);
    for (let layer = 0; layer < 6; layer++) {
      c.fillStyle = (
        day
          ? ["#a7aeb0", "#909ea5", "#788d99", "#697e86", "#61727a", "#536572"]
          : ["#526277", "#405570", "#364b61", "#304457", "#273c4b", "#22323d"]
      )[layer];
      c.beginPath();
      c.moveTo(0, s);
      for (let x = 0; x <= s; x += 16) {
        const y =
          400 +
          layer * 63 +
          Math.sin(x * 0.006 + layer * 1.4) * 64 +
          Math.sin(x * 0.017 + layer) * 22;
        c.lineTo(x, y);
      }
      c.lineTo(s, s);
      c.closePath();
      c.fill();
    }
    for (let i = 0; i < 1000; i++) {
      const x = r() * s,
        y = 630 + x * 0.08 + Math.sin(x * 0.013) * 40 + r() * 245;
      if (y > 995) continue;
      const w = 2 + r() * 9,
        h = 4 + r() * 12;
      c.fillStyle = day ? "#95928a" : "#26313a";
      c.fillRect(x, y, w, h);
      c.fillStyle = i % 5 ? "#d8ac72" : "#ffe0a4";
      c.globalAlpha = day ? 0.15 : 0.35 + r() * 0.5;
      c.fillRect(x + 1, y + 2, 1.2 + r(), 1.4 + r());
    }
    c.globalAlpha = 1;
    for (let i = 0; i < 7; i++) {
      const x = 40 + i * 155;
      c.fillStyle = day ? "#435346" : "#172b2b";
      c.beginPath();
      c.moveTo(x - 17, 1024);
      c.bezierCurveTo(x - 12, 910, x - 12, 830, x, 768 + (i % 3) * 30);
      c.bezierCurveTo(x + 10, 854, x + 18, 952, x + 22, 1024);
      c.fill();
    }
  });
}
function artwork(variant = 0) {
  return texture((c, r, s) => {
    c.fillStyle = "#cfc2aa";
    c.fillRect(0, 0, s, s);
    c.fillStyle = "#e7deca";
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(680, 0);
    c.lineTo(600, 390);
    c.bezierCurveTo(470, 590, 710, 690, 535, 1024);
    c.lineTo(0, 1024);
    c.fill();
    c.fillStyle = "#736150";
    c.fillRect(
      variant ? 640 : 100,
      variant ? 550 : 710,
      variant ? 384 : 280,
      400,
    );
    c.fillStyle = "#372c24";
    c.beginPath();
    if (variant) {
      c.ellipse(705, 370, 240, 300, 0.2, 0, Math.PI * 2);
    } else {
      c.moveTo(730, 0);
      c.lineTo(s, 0);
      c.lineTo(s, 720);
      c.bezierCurveTo(850, 720, 735, 520, 730, 340);
    }
    c.fill();
    c.fillStyle = "#9e8a71";
    c.beginPath();
    c.moveTo(40, 530);
    c.lineTo(280, 490);
    c.lineTo(345, 820);
    c.lineTo(0, 780);
    c.fill();
    for (let i = 0; i < 20000; i++) {
      c.fillStyle = i % 2 ? "#f7f0da0d" : "#392e240b";
      c.fillRect(r() * s, r() * s, 2, 2);
    }
  });
}
export function createMaterials() {
  const grain = texture((c, r, s) => {
    c.fillStyle = "#695340";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 8500; i++) {
      const x = r() * s;
      c.strokeStyle = i % 3 ? "#271e1726" : "#d3af7922";
      c.lineWidth = 0.4 + r() * 1.2;
      c.beginPath();
      c.moveTo(x, 0);
      for (let y = 0; y <= s; y += 32)
        c.lineTo(x + Math.sin(y * 0.008 + x) * 2.5, y);
      c.stroke();
    }
  });
  const floor = texture((c, r, s) => {
    c.fillStyle = "#413429";
    c.fillRect(0, 0, s, s);
    for (let row = 0; row < 22; row++)
      for (let col = -1; col < 4; col++) {
        const x = col * 360 + (row % 3) * 120,
          y = (row * s) / 22,
          v = r() * 14;
        c.fillStyle = `rgb(${89 + v},${69 + v},${51 + v})`;
        c.fillRect(x + 0.6, y + 0.65, 359, s / 22 - 1.3);
        for (let j = 0; j < 85; j++) {
          const yy = y + 1 + r() * (s / 22 - 2);
          c.strokeStyle = j % 3 ? "#2a221a30" : "#d2b28624";
          c.lineWidth = 0.45;
          c.beginPath();
          c.moveTo(x, yy);
          c.bezierCurveTo(x + 100, yy + 2, x + 245, yy - 2, x + 360, yy);
          c.stroke();
        }
      }
  });
  const plaster = texture((c, r, s) => {
    c.fillStyle = "#c9bfb0";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 35000; i++) {
      c.fillStyle = i % 2 ? "#fffaec0d" : "#86796d0c";
      c.fillRect(r() * s, r() * s, 1 + r() * 4, 1 + r() * 3);
    }
  });
  const boucle = texture((c, r, s) => {
    c.fillStyle = "#e6ddcd";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 50000; i++) {
      c.strokeStyle = i % 3 ? "#a99d872c" : "#fff8e85c";
      c.lineWidth = 0.65;
      c.beginPath();
      c.ellipse(
        r() * s,
        r() * s,
        1 + r() * 1.8,
        1 + r() * 1.8,
        r() * 3,
        0,
        Math.PI * 2,
      );
      c.stroke();
    }
  });
  const leather = texture((c, r, s) => {
    c.fillStyle = "#c9c0b0";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < 35000; i++) {
      c.fillStyle = i % 3 ? "#31281f15" : "#fff8e31a";
      c.fillRect(r() * s, r() * s, 1 + r(), 1 + r());
    }
  });
  const stone = texture((c, r, s) => {
    c.fillStyle = "#dacdb7";
    c.fillRect(0, 0, s, s);
    for (let band = 0; band < 18; band++) {
      const y = band * 59 + r() * 40;
      c.strokeStyle = band % 3 ? "#a88f705a" : "#f7eddb88";
      c.lineWidth = 1 + r() * 11;
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x <= s; x += 18)
        c.lineTo(
          x,
          y +
            x * 0.22 +
            Math.sin(x * 0.01 + band) * 39 +
            Math.sin(x * 0.043 + band * 2.7) * 8 +
            r() * 4,
        );
      c.stroke();
    }
    for (let i = 0; i < 19000; i++) {
      c.fillStyle = i % 2 ? "#a28c7018" : "#fff6df27";
      c.fillRect(r() * s, r() * s, r() * 4, 1 + r() * 2);
    }
  });
  const rug = texture((c, r, s) => {
    c.fillStyle = "#ada18f";
    c.fillRect(0, 0, s, s);
    for (let i = 0; i < s; i += 3) {
      c.fillStyle = i % 2 ? "#eee4cf24" : "#6f665824";
      c.fillRect(i, 0, 1, s);
      c.fillRect(0, i, s, 1);
    }
    for (let i = 0; i < 25000; i++) {
      c.fillStyle = "#f9eed01c";
      c.fillRect(r() * s, r() * s, 1 + r() * 2, 1);
    }
  });
  const mat = (color, map = null, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, map, roughness: 0.78, ...extra });
  return {
    wood: mat("#eee1ce", grain, {
      bumpMap: grain,
      bumpScale: 0.008,
      roughness: 0.52,
    }),
    dark: mat("#817267", grain, { roughness: 0.55 }),
    floor: mat("#e7d8c2", floor, {
      roughness: 0.57,
      bumpMap: floor,
      bumpScale: 0.007,
    }),
    wall: mat("#f4eadd", plaster, { bumpMap: plaster, bumpScale: 0.006 }),
    trim: mat("#bcbab4"),
    linen: mat("#fff8e8", boucle, { bumpMap: boucle, bumpScale: 0.016 }),
    taupe: mat("#8b7d6b", boucle, { bumpMap: boucle, bumpScale: 0.009 }),
    caramel: mat("#a47d56", leather, {
      bumpMap: leather,
      bumpScale: 0.007,
      roughness: 0.42,
    }),
    chocolate: mat("#79614a", leather, {
      bumpMap: leather,
      bumpScale: 0.006,
      roughness: 0.44,
    }),
    stitch: mat("#b19b7a"),
    stone: mat("#fff6dd", stone, {
      bumpMap: stone,
      bumpScale: 0.013,
      roughness: 0.56,
    }),
    darkStone: mat("#564c40", stone, {
      bumpMap: stone,
      bumpScale: 0.004,
      roughness: 0.42,
    }),
    rug: mat("#e9dfce", rug, { bumpMap: rug, bumpScale: 0.018 }),
    throw: mat("#8c8071", rug, {
      bumpMap: rug,
      bumpScale: 0.014,
      side: THREE.DoubleSide,
    }),
    curtain: mat("#eee9df", rug, {
      transparent: true,
      opacity: 0.54,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    black: mat("#252420", null, { metalness: 0.62, roughness: 0.38 }),
    ceramic: mat("#252723", null, { roughness: 0.36 }),
    paper: mat("#e5decc", plaster),
    clay: mat("#a7a49a", plaster, { bumpMap: plaster, bumpScale: 0.018 }),
    leaf: mat("#465340"),
    leafLight: mat("#6c7452"),
    soil: mat("#37352b"),
    glow: mat("#fff0d0", null, { emissive: "#ffd3a0", emissiveIntensity: 0.6 }),
    art: mat("#efdfc9", artwork()),
    art2: mat("#efdfc9", artwork(1)),
  };
}
