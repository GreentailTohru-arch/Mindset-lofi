import * as THREE from "three";
import { createMaterials as baseMaterials, seeded } from "../materials.js";

export function paperTexture(kind = "landscape", day = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext("2d"),
    random = seeded(147);
  const sky = ctx.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, day ? "#acbec0" : "#101e35");
  sky.addColorStop(1, day ? "#e1dac2" : "#516775");
  ctx.fillStyle = kind === "window" ? sky : "#dfd4b7";
  ctx.fillRect(0, 0, 768, 512);
  if (kind === "writing") {
    ctx.fillStyle = "#323b36";
    ctx.font = '52px "KaiTi", "STKaiti", serif';
    ctx.textAlign = "center";
    [..."清風入弦明月在心"].forEach((char, i) =>
      ctx.fillText(char, 540 - Math.floor(i / 4) * 155, 110 + (i % 4) * 91),
    );
    ctx.fillStyle = "#a45242";
    ctx.fillRect(185, 356, 35, 38);
  } else {
    ctx.fillStyle = kind === "window" ? "#efe6c7" : "#f3e8c9";
    ctx.beginPath();
    ctx.arc(550, 105, kind === "window" ? 34 : 26, 0, Math.PI * 2);
    ctx.fill();
    for (let layer = 0; layer < 4; layer++) {
      ctx.fillStyle =
        kind === "window"
          ? ["#506a79", "#3c596a", "#294857", "#203d45"][layer]
          : ["#a2aca1", "#86948b", "#657c73", "#435f56"][layer];
      ctx.beginPath();
      ctx.moveTo(0, 512);
      for (let x = 0; x <= 780; x += 8)
        ctx.lineTo(
          x,
          285 +
            layer * 50 -
            Math.abs(Math.sin(x * 0.006 + layer * 2)) * (120 - layer * 14) +
            Math.sin(x * 0.035) * 10,
        );
      ctx.lineTo(768, 512);
      ctx.closePath();
      ctx.fill();
    }
    // Slender ink bamboo silhouettes frame the distant mountains.
    for (let stem = 0; stem < 5; stem++) {
      const x = 35 + stem * 26;
      ctx.strokeStyle = kind === "window" ? "#152f34" : "#3c554b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, 512);
      ctx.lineTo(x + 22, 85 + stem * 28);
      ctx.stroke();
      for (let j = 0; j < 5; j++) {
        const y = 175 + j * 65,
          sign = j % 2 ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(x + 15, y);
        ctx.quadraticCurveTo(x + sign * 65, y - 48, x + sign * 85, y - 23);
        ctx.quadraticCurveTo(x + sign * 40, y - 7, x + 15, y);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
      }
    }
    if (kind !== "window") {
      ctx.fillStyle = "#303e36";
      ctx.font = '26px "KaiTi", serif';
      [..."山靜日長"].forEach((s, i) => ctx.fillText(s, 682, 62 + i * 34));
      ctx.fillStyle = "#a84d3c";
      ctx.fillRect(686, 194, 21, 26);
    }
  }
  if (kind !== "window")
    for (let i = 0; i < 14000; i++) {
      ctx.fillStyle = random() > 0.5 ? "#ffffff10" : "#5540220b";
      ctx.fillRect(random() * 768, random() * 512, 1, 2);
    }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function createMaterials() {
  const m = baseMaterials();
  m.floor.color.set("#765039");
  m.floor.roughness = 0.78;
  m.wood.color.set("#59402d");
  m.wood.roughness = 0.52;
  m.woodDark.color.set("#352921");
  m.woodLight.color.set("#a68555");
  m.wall.color.set("#e2d8c1");
  m.trim.color.set("#4b463e");
  m.rug.color.set("#425a54");
  m.ceramic.color.set("#78998e");
  m.cream.color.set("#e7dcc0");
  m.leaf.color.set("#315f42");
  m.leafLight.color.set("#6d8950");
  m.curtain.color.set("#b3a277");
  m.gold = new THREE.MeshStandardMaterial({
    color: "#b49b63",
    metalness: 0.65,
    roughness: 0.38,
  });
  m.paper = new THREE.MeshStandardMaterial({
    color: "#efe4c9",
    roughness: 0.95,
  });
  m.ink = new THREE.MeshStandardMaterial({ color: "#182320", roughness: 0.58 });
  m.lantern = new THREE.MeshStandardMaterial({
    color: "#ecd49a",
    emissive: "#ffcd7a",
    emissiveIntensity: 0.65,
    roughness: 0.85,
  });
  return m;
}
