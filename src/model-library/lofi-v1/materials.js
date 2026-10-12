import * as THREE from "three";
export function seeded(seed = 12) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
function texture(kind) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d"),
    r = seeded();
  if (kind === "wood") {
    ctx.fillStyle = "#a9805e";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1800; i++) {
      const y = r() * 512;
      ctx.strokeStyle = `rgba(${r() > 0.5 ? "42,22,13" : "223,179,121"},${r() * 0.14})`;
      ctx.lineWidth = r() * 1.8 + 0.3;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 16)
        ctx.lineTo(x, y + Math.sin(x * 0.02 + y) * r() * 4);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = kind === "rug" ? "#a49794" : "#b4b0ac";
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 3) {
      ctx.strokeStyle = i % 2 ? "#c6c0b6" : "#898582";
      ctx.globalAlpha = 0.28;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 22000; i++) {
      ctx.fillStyle = r() > 0.5 ? "#ffffff13" : "#00000012";
      ctx.fillRect(r() * 512, r() * 512, 1, 2);
    }
    if (kind === "rug") {
      ctx.strokeStyle = "#e8d4bc";
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 2;
      for (let j = 0; j < 6; j++) {
        ctx.strokeRect(15 + j * 6, 15 + j * 6, 482 - j * 12, 482 - j * 12);
      }
      for (let x = 80; x < 480; x += 64)
        for (let y = 80; y < 480; y += 64) {
          ctx.beginPath();
          ctx.moveTo(x, y - 22);
          ctx.lineTo(x + 18, y);
          ctx.lineTo(x, y + 22);
          ctx.lineTo(x - 18, y);
          ctx.closePath();
          ctx.stroke();
        }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}
export function createMaterials() {
  const wood = texture("wood"),
    fabric = texture("fabric"),
    rug = texture("rug");
  const standard = (color, extras = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...extras });
  return {
    wood: standard("#81563a", {
      map: wood,
      roughness: 0.55,
      bumpMap: wood,
      bumpScale: 0.025,
    }),
    woodLight: standard("#b18a66", { map: wood, roughness: 0.62 }),
    woodDark: standard("#4e3024", { map: wood, roughness: 0.58 }),
    floor: standard("#bfa18a", { map: wood, roughness: 0.68 }),
    wall: standard("#8e827a", { roughness: 0.94 }),
    wallLeft: standard("#746c72"),
    trim: standard("#544039"),
    metal: standard("#222329", { metalness: 0.55, roughness: 0.38 }),
    black: standard("#15171e"),
    cream: standard("#d8cbbc"),
    ceramic: standard("#bab0a1", { roughness: 0.28 }),
    duvet: standard("#79687f", {
      map: fabric,
      bumpMap: fabric,
      bumpScale: 0.022,
    }),
    pillow: standard("#b0a2a5", {
      map: fabric,
      bumpMap: fabric,
      bumpScale: 0.018,
    }),
    blanket: standard("#4a3d58", {
      map: fabric,
      bumpMap: fabric,
      bumpScale: 0.035,
    }),
    rug: standard("#65546c", { map: rug, bumpMap: fabric, bumpScale: 0.04 }),
    tatami: standard("#ad8c64", {
      map: fabric,
      bumpMap: fabric,
      bumpScale: 0.025,
    }),
    curtain: standard("#71647e", {
      map: fabric,
      side: THREE.DoubleSide,
      bumpMap: fabric,
      bumpScale: 0.015,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#98b0bd",
      transparent: true,
      opacity: 0.13,
      roughness: 0.13,
      metalness: 0.15,
      depthWrite: false,
    }),
    leaf: standard("#466447"),
    leafLight: standard("#6d8349"),
    soil: standard("#30251f"),
    cat: standard("#b4a49a", { roughness: 1 }),
    catWhite: standard("#e0d5c8"),
    pink: standard("#d09791"),
  };
}
export function canvasScreen(mode = 0) {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 360;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 640, 360);
  g.addColorStop(0, ["#151934", "#142c3b", "#282131"][mode]);
  g.addColorStop(1, ["#514578", "#377d8e", "#9b6862"][mode]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 640, 360);
  ctx.fillStyle = "#eed8ac";
  ctx.beginPath();
  ctx.arc(455, 90, 32, 0, Math.PI * 2);
  ctx.fill();
  for (let j = 0; j < 4; j++) {
    ctx.fillStyle = ["#403c68", "#343455", "#272e4a", "#202a3e"][j];
    ctx.beginPath();
    ctx.moveTo(0, 360);
    for (let x = 0; x <= 660; x += 12)
      ctx.lineTo(
        x,
        190 +
          j * 34 +
          Math.sin(x * 0.011 + j) * 26 +
          Math.sin(x * 0.025 + j) * 10,
      );
    ctx.lineTo(660, 360);
    ctx.fill();
  }
  ctx.fillStyle = "#ede1d7";
  ctx.font = "20px monospace";
  ctx.fillText(
    [
      "S L O W   N I G H T S",
      "D E E P   F O C U S",
      "T A K E   A   B R E A T H",
    ][mode],
    35,
    48,
  );
  ctx.font = "12px monospace";
  ctx.globalAlpha = 0.65;
  ctx.fillText(
    [
      "lofi radio  /  01:28",
      "one thing at a time",
      "you are right where you need to be",
    ][mode],
    35,
    74,
  );
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
