import * as THREE from "three";
import { seeded } from "../materials.js";
function texture(draw, w = 512, h = 512) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), seeded(173));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
export function gardenTexture(day = true) {
  return texture(
    (c, r) => {
      const sky = c.createLinearGradient(0, 0, 0, 640);
      sky.addColorStop(0, day ? "#c7cdca" : "#53616a");
      sky.addColorStop(1, day ? "#b0b6a6" : "#6c766e");
      c.fillStyle = sky;
      c.fillRect(0, 0, 1024, 640);
      for (let layer = 0; layer < 4; layer++) {
        c.fillStyle = ["#bcc2b7", "#a9b2a2", "#919b89", "#737f6e"][layer];
        c.globalAlpha = day ? 0.5 : 0.22;
        c.beginPath();
        c.moveTo(0, 640);
        for (let x = 0; x <= 1030; x += 12)
          c.lineTo(
            x,
            375 +
              layer * 58 +
              Math.sin(x * 0.006 + layer) * 26 +
              Math.sin(x * 0.017 + layer) * 11,
          );
        c.lineTo(1024, 640);
        c.fill();
      }
      c.globalAlpha = 1;
      for (let i = 0; i < 14; i++) {
        const x = r() * 1024,
          y = 510 + r() * 115;
        c.fillStyle = day ? "#858b7e" : "#4d5a57";
        c.beginPath();
        c.ellipse(x, y, 25 + r() * 57, 9 + r() * 20, -0.1, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#71806270";
        c.beginPath();
        c.ellipse(
          x - 5,
          y - 9,
          20 + r() * 32,
          5 + r() * 6,
          -0.1,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
      for (let i = 0; i < 7; i++) {
        const x = 55 + i * 151,
          y = 545 + (i % 3) * 28;
        for (let j = 0; j < 12; j++) {
          c.strokeStyle = day ? "#8c88767a" : "#87908640";
          c.lineWidth = 0.6 + r();
          c.beginPath();
          c.moveTo(x, y);
          c.quadraticCurveTo(
            x + (j - 6) * 4,
            y - 60,
            x + (j - 6) * 9,
            y - 95 - r() * 40,
          );
          c.stroke();
        }
      }
      for (let i = 0; i < 5; i++) {
        const x = 150 + i * 153;
        c.strokeStyle = "#77847b29";
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(x, 560);
        c.lineTo(x + 15, 65 + i * 12);
        c.stroke();
      }
      for (let i = 0; i < 8; i++) {
        const yy = 620 - i * 23,
          xx = 520 + Math.sin(i * 0.55) * 70,
          w = 68 - i * 5;
        c.fillStyle = day ? "#b8b9ad" : "#747e7a";
        c.beginPath();
        c.moveTo(xx - w, yy);
        c.lineTo(xx + w, yy - 3);
        c.lineTo(xx + w * 0.7, yy - 15);
        c.lineTo(xx - w * 0.75, yy - 12);
        c.closePath();
        c.fill();
      }
      c.strokeStyle = day ? "#655e52" : "#474e4c";
      c.lineWidth = 9;
      c.beginPath();
      c.moveTo(95, 640);
      c.bezierCurveTo(125, 400, 85, 220, 150, 5);
      c.stroke();
      for (let i = 0; i < 9; i++) {
        const y = 80 + i * 43,
          sign = i % 2 ? 1 : -1;
        c.lineWidth = 2.5;
        c.beginPath();
        c.moveTo(120, y + 70);
        c.quadraticCurveTo(120 + sign * 85, y + 10, 120 + sign * 155, y - 20);
        c.stroke();
        for (let j = 0; j < 13; j++) {
          const x = 120 + sign * (50 + r() * 120),
            yy = y - 25 + r() * 50;
          c.fillStyle = i % 2 ? "#9e765666" : "#ac896b66";
          c.beginPath();
          c.ellipse(x, yy, 3 + r() * 5, 2 + r() * 3, r() * 3, 0, Math.PI * 2);
          c.fill();
        }
      }
      // Autumn limbs cross the visible center, beyond the gathered curtain edges.
      for (const [tx, ty, lean] of [
        [380, 585, -0.28],
        [760, 580, 0.17],
      ]) {
        c.strokeStyle = day ? "#6871658c" : "#485751a0";
        c.lineWidth = 5;
        c.beginPath();
        c.moveTo(tx, ty);
        c.bezierCurveTo(
          tx + lean * 140,
          420,
          tx - lean * 80,
          230,
          tx + lean * 190,
          55,
        );
        c.stroke();
        for (let j = 0; j < 7; j++) {
          const yy = 105 + j * 57,
            sg = j % 2 ? 1 : -1,
            xx = tx + lean * (600 - yy) * 0.3;
          c.lineWidth = 1.4;
          c.beginPath();
          c.moveTo(xx, yy + 65);
          c.quadraticCurveTo(xx + sg * 52, yy + 16, xx + sg * 110, yy - 18);
          c.stroke();
          for (let k = 0; k < 15; k++) {
            c.fillStyle = k % 3 ? "#a084616b" : "#89694f73";
            const lx = xx + sg * (25 + r() * 110),
              ly = yy - 20 + r() * 52;
            c.beginPath();
            c.ellipse(
              lx,
              ly,
              3 + r() * 6,
              2 + r() * 3,
              r() * 2,
              0,
              Math.PI * 2,
            );
            c.fill();
          }
        }
      }
      const mist = c.createLinearGradient(0, 150, 0, 580);
      mist.addColorStop(0, "#dce0da60");
      mist.addColorStop(0.65, "#d6dcd465");
      mist.addColorStop(1, "#d7dbd211");
      c.fillStyle = mist;
      c.fillRect(0, 0, 1024, 640);
    },
    1024,
    640,
  );
}
export function createMaterials() {
  const plaster = texture((c, r) => {
    c.fillStyle = "#c7bfb0";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 500; i++) {
      c.strokeStyle = i % 2 ? "#f2ede608" : "#7c726607";
      c.lineWidth = 2 + r() * 8;
      const x = r() * 512,
        y = r() * 512;
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x + 30, y + 4, x + 55 + r() * 45, y - 12);
      c.stroke();
    }
    for (let i = 0; i < 17000; i++) {
      c.fillStyle = r() > 0.5 ? "#eee6d914" : "#71665c14";
      c.fillRect(r() * 512, r() * 512, 1, 1);
    }
  });
  // Broad, translucent trowel marks and hairline fractures remain matte.
  const plasterContext = plaster.image.getContext("2d");
  const pr = seeded(411);
  for (let i = 0; i < 65; i++) {
    const x = pr() * 512,
      y = pr() * 512;
    plasterContext.fillStyle = i % 2 ? "#776c5b16" : "#ede6d720";
    plasterContext.beginPath();
    plasterContext.moveTo(x, y);
    for (let k = 0; k < 7; k++)
      plasterContext.lineTo(
        x + Math.cos(k * 0.898) * (12 + pr() * 30),
        y + Math.sin(k * 0.898) * (15 + pr() * 38),
      );
    plasterContext.closePath();
    plasterContext.fill();
  }
  for (let i = 0; i < 6; i++) {
    let x = pr() * 512,
      y = pr() * 512;
    plasterContext.strokeStyle = "#625c4e30";
    plasterContext.lineWidth = 0.65;
    plasterContext.beginPath();
    plasterContext.moveTo(x, y);
    for (let k = 0; k < 7; k++) {
      x += (pr() - 0.5) * 15;
      y += 6 + pr() * 8;
      plasterContext.lineTo(x, y);
    }
    plasterContext.stroke();
  }
  const timber = texture((c, r) => {
    c.fillStyle = "#7a6856";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1200; i++) {
      const y = r() * 512;
      c.strokeStyle = i % 3 ? "#302d2828" : "#c9bba029";
      c.lineWidth = 0.3 + r() * 2;
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x <= 512; x += 12)
        c.lineTo(x, y + Math.sin(x * 0.024 + y) * 2);
      c.stroke();
    }
    for (let i = 0; i < 9; i++) {
      const x = r() * 512,
        y = r() * 512;
      c.strokeStyle = "#302a2470";
      c.lineWidth = 0.6;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + 60, y + 3);
      c.lineTo(x + 104, y + 1);
      c.lineTo(x + 133, y + 5);
      c.stroke();
    }
  });
  const linen = texture((c, r) => {
    c.fillStyle = "#d7ccba";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 3) {
      c.strokeStyle = i % 2 ? "#8c827026" : "#f2eadb38";
      c.lineWidth = 0.7;
      c.beginPath();
      c.moveTo(i, 0);
      c.lineTo(i + Math.sin(i) * 2, 512);
      c.moveTo(0, i);
      c.lineTo(512, i + 1);
      c.stroke();
    }
    for (let i = 0; i < 45; i++) {
      const x = r() * 512;
      c.strokeStyle = "#7266520c";
      c.lineWidth = 1 + r() * 8;
      c.beginPath();
      c.moveTo(x, 0);
      c.bezierCurveTo(x + 32, 170, x - 35, 330, x + 10, 512);
      c.stroke();
    }
  });
  const glaze = texture((c, r) => {
    c.fillStyle = "#b0a18c";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 850; i++) {
      const x = r() * 512,
        y = r() * 512;
      c.fillStyle = i % 3 ? "#6b564522" : "#d2c8b324";
      c.beginPath();
      c.ellipse(x, y, 1 + r() * 5, 1 + r() * 7, r() * 3, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = "#78604b";
    c.beginPath();
    c.moveTo(0, 0);
    for (let x = 0; x <= 512; x += 8)
      c.lineTo(x, 25 + Math.sin(x * 0.052) * 12 + Math.sin(x * 0.17) * 7);
    c.lineTo(512, 0);
    c.fill();
    for (let i = 0; i < 12; i++) {
      const x = r() * 512,
        y = r() * 512;
      c.fillStyle = "#7d6550";
      c.beginPath();
      c.ellipse(x, y, 3 + r() * 6, 2 + r() * 9, r() * 3, 0, Math.PI * 2);
      c.fill();
    }
  });
  const floorboards = texture(
    (c, r) => {
      c.fillStyle = "#393028";
      c.fillRect(0, 0, 1024, 1024);
      for (let row = 0; row < 20; row++) {
        const yy = row * 51.2;
        for (let col = -1; col < 4; col++) {
          const x = col * 341 + (row % 3) * 113;
          const v = Math.floor(r() * 17);
          c.fillStyle = `rgb(${91 + v},${69 + v},${51 + v})`;
          c.fillRect(x + 1, yy + 1, 339, 49.5);
          for (let k = 0; k < 70; k++) {
            const y = yy + 2 + r() * 47;
            c.strokeStyle = k % 4 ? "#211d193b" : "#e0c7a436";
            c.lineWidth = 0.4 + r() * 0.8;
            c.beginPath();
            c.moveTo(x, y);
            c.bezierCurveTo(x + 100, y + 2, x + 240, y - 2, x + 340, y + 1);
            c.stroke();
          }
          for (let k = 0; k < 3; k++) {
            const sx = x + r() * 250,
              sy = yy + 5 + r() * 39;
            c.strokeStyle = "#211a1680";
            c.lineWidth = 0.7;
            c.beginPath();
            c.moveTo(sx, sy);
            c.lineTo(sx + 25, sy + 1);
            c.lineTo(sx + 56, sy - 0.5);
            c.stroke();
          }
        }
      }
    },
    1024,
    1024,
  );
  const rug = texture((c, r) => {
    c.fillStyle = "#b5a78d";
    c.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 3)
      for (let x = 0; x < 512; x += 4) {
        c.fillStyle = (x + y) % 3 ? "#736b5975" : "#e5d8bc80";
        c.fillRect(x + (y % 2), y, 2.5, 1.6);
      }
    c.strokeStyle = "#766d5960";
    c.lineWidth = 3;
    for (let i = 0; i < 4; i++)
      c.strokeRect(9 + i * 5, 9 + i * 5, 494 - i * 10, 494 - i * 10);
  });
  const ink = texture((c, r) => {
    c.fillStyle = "#b9a98e";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 420; i++) {
      const x = 210 + Math.sin(i * 0.07) * 64 + (r() - 0.5) * 80,
        y = 45 + r() * 420;
      c.fillStyle = i % 3 ? "#44433b55" : "#58504635";
      c.beginPath();
      c.ellipse(x, y, 2 + r() * 22, 2 + r() * 15, r() * 3, 0, Math.PI * 2);
      c.fill();
    }
    for (let i = 0; i < 1400; i++) {
      c.fillStyle = i % 2 ? "#e4d6b849" : "#7e6d5333";
      c.fillRect(r() * 512, r() * 512, 1 + r() * 4, 1 + r() * 5);
    }
  });
  const mat = (color, map = null, extras = {}) =>
    new THREE.MeshStandardMaterial({ color, map, roughness: 0.95, ...extras });
  return {
    wall: mat("#eee9dd", plaster, { bumpMap: plaster, bumpScale: 0.005 }),
    floor: mat("#eee5d6", floorboards, {
      bumpMap: floorboards,
      bumpScale: 0.013,
    }),
    trim: mat("#c9c8bf", plaster),
    wood: mat("#c6b9a4", timber, { bumpMap: timber, bumpScale: 0.017 }),
    darkWood: mat("#9d8b76", timber),
    linen: mat("#eee6d7", linen, {
      bumpMap: linen,
      bumpScale: 0.015,
      side: THREE.DoubleSide,
    }),
    mat: mat("#e0d7c5", rug, { bumpMap: rug, bumpScale: 0.018 }),
    blanket: mat("#7b7465", linen, {
      bumpMap: linen,
      bumpScale: 0.025,
      side: THREE.DoubleSide,
    }),
    cushion: mat("#606454", linen, { bumpMap: linen, bumpScale: 0.02 }),
    ink: mat("#e0d4bb", ink),
    clay: mat("#bba995", glaze, { bumpMap: glaze, bumpScale: 0.01 }),
    rust: mat("#957762", glaze),
    stone: mat("#a09f92", plaster, { bumpMap: plaster, bumpScale: 0.025 }),
    moss: mat("#707861", plaster),
    grass: mat("#9e9983"),
    charcoal: mat("#423f38"),
    water: new THREE.MeshStandardMaterial({
      color: "#7a847b",
      roughness: 0.42,
      metalness: 0.16,
      transparent: true,
      opacity: 0.76,
    }),
    glow: new THREE.MeshStandardMaterial({
      color: "#e8dac0",
      emissive: "#edc88b",
      emissiveIntensity: 0.42,
      roughness: 0.92,
    }),
    metal: mat("#625f53", null, { metalness: 0.3 }),
    paper: mat("#d8ceba", linen),
    contact: new THREE.MeshBasicMaterial({
      color: "#38372e",
      transparent: true,
      opacity: 0.035,
      depthWrite: false,
    }),
  };
}
