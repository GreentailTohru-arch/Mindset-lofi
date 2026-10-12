import * as THREE from "three";

function texture(draw) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  draw(c.getContext("2d"));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
export function createMaterials() {
  let seed = 3107;
  const r = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const cedar = texture((c) => {
    c.fillStyle = "#73503a";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1300; i++) {
      c.strokeStyle = i % 2 ? "#d5a66a16" : "#1b100e24";
      c.lineWidth = 0.4 + r() * 2;
      const y = r() * 512;
      c.beginPath();
      c.moveTo(0, y);
      c.bezierCurveTo(140, y - 3, 280, y + 4, 512, y + r() * 3);
      c.stroke();
    }
    for (let i = 0; i < 5; i++) {
      c.strokeStyle = "#25171425";
      c.beginPath();
      c.ellipse(
        r() * 512,
        r() * 512,
        25 + r() * 35,
        2 + r() * 4,
        0,
        0,
        Math.PI * 2,
      );
      c.stroke();
    }
  });
  const weave = texture((c) => {
    c.fillStyle = "#c8b995";
    c.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 3) {
      c.fillStyle = y % 2 ? "#dacb961f" : "#635e3a38";
      c.fillRect(0, y, 512, 1);
    }
    for (let x = 0; x < 512; x += 12)
      for (let y = 0; y < 512; y += 6) {
        c.fillStyle = r() > 0.5 ? "#ede1b129" : "#504f3323";
        c.fillRect(x + (y % 12 ? 2 : 0), y, 1, 4);
      }
  });
  const paper = texture((c) => {
    c.fillStyle = "#e6dfcb";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9500; i++) {
      c.fillStyle = i % 2 ? "#fef4d927" : "#8a816912";
      c.fillRect(r() * 512, r() * 512, 0.5 + r(), 2 + r() * 6);
    }
  });
  const textile = texture((c) => {
    c.fillStyle = "#d6ccbd";
    c.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 512; i += 3) {
      c.fillStyle = "#594c3322";
      c.fillRect(i, 0, 1, 512);
      c.fillRect(0, i, 512, 1);
    }
  });
  const geometric = texture((c) => {
    c.fillStyle = "#34485d";
    c.fillRect(0, 0, 512, 512);
    c.strokeStyle = "#c7c4af";
    c.lineWidth = 1.5;
    for (let x = -64; x < 576; x += 64)
      for (let y = -64; y < 576; y += 64) {
        c.beginPath();
        c.moveTo(x + 32, y);
        c.lineTo(x + 64, y + 32);
        c.lineTo(x + 32, y + 64);
        c.lineTo(x, y + 32);
        c.closePath();
        c.stroke();
        c.beginPath();
        c.moveTo(x, y + 32);
        c.lineTo(x + 64, y + 32);
        c.moveTo(x + 32, y);
        c.lineTo(x + 32, y + 64);
        c.stroke();
      }
  });
  const mat = (color, map = null, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, map, roughness: 0.86, ...extra });
  return {
    wood: mat("#e0c3a2", cedar),
    dark: mat("#a38b72", cedar),
    lacquer: mat("#bc9380", cedar, { roughness: 0.38 }),
    floor: mat("#f6eedb", weave, { bumpMap: weave, bumpScale: 0.009 }),
    border: mat("#50634d", textile),
    wall: mat("#e2d7c1", paper, { bumpMap: paper, bumpScale: 0.008 }),
    paper: mat("#f3e4c5", paper, { side: THREE.DoubleSide }),
    linen: mat("#eee5d4", textile, { bumpMap: textile, bumpScale: 0.01 }),
    indigo: mat("#354659", textile),
    patterned: mat("#ffffff", geometric, {
      bumpMap: textile,
      bumpScale: 0.008,
    }),
    bamboo: mat("#b39a69", textile),
    iron: mat("#292c2a", paper, { metalness: 0.32, roughness: 0.72 }),
    moss: mat("#455f43"),
    leaf: mat("#4f7355"),
    leafLight: mat("#739068"),
    ceramic: mat("#bec6b1", null, { roughness: 0.32 }),
    soil: mat("#312e24"),
    stone: mat("#7e8781", paper),
    charcoal: mat("#24282a"),
    bronze: mat("#807251", null, { metalness: 0.48, roughness: 0.42 }),
    glow: mat("#f6ddb0", paper, {
      emissive: "#ffd189",
      emissiveIntensity: 0.6,
    }),
    water: mat("#304f61", null, { roughness: 0.22, metalness: 0.25 }),
    red: mat("#b46442"),
    book: mat("#7c8470"),
    pages: mat("#e1d7ba", paper),
  };
}
