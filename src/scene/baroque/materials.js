import * as THREE from "three";
import { createMaterials as europeanMaterials } from "../renaissance/materials.js";
import { seeded } from "../materials.js";
export function createMaterials() {
  const m = europeanMaterials();
  m.floor.color.set("#b18762");
  m.wood.color.set("#956d4e");
  m.woodDark.color.set("#654732");
  m.wall.color.set("#eadfcb");
  m.gold = m.brass.clone();
  m.gold.color.set("#cba563");
  m.gold.roughness = 0.42;
  m.velvet = m.burgundy.clone();
  m.velvet.color.set("#863444");
  m.velvet.roughness = 0.95;
  m.velvet.side = THREE.DoubleSide;
  m.forest = m.olive.clone();
  m.forest.color.set("#365b4c");
  m.silk = m.linen.clone();
  m.silk.color.set("#dfd1b8");
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const c = canvas.getContext("2d"),
    r = seeded(811);
  c.fillStyle = "#e5dece";
  c.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 27; i++) {
    c.strokeStyle = i % 2 ? "#aa9e8939" : "#ffffff70";
    c.lineWidth = 0.5 + r() * 1.4;
    c.beginPath();
    const y = r() * 512;
    c.moveTo(0, y);
    for (let x = 0; x <= 512; x += 12)
      c.lineTo(x, y + x * 0.21 + Math.sin(x * 0.021 + i) * 22);
    c.stroke();
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  m.marble = new THREE.MeshStandardMaterial({
    color: "#f0e6d5",
    map,
    roughness: 0.34,
    bumpMap: map,
    bumpScale: 0.006,
  });
  m.sculpture = new THREE.MeshStandardMaterial({
    color: "#e6dfcf",
    roughness: 0.67,
  });
  m.flame = new THREE.MeshBasicMaterial({
    color: "#ffb65f",
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });
  m.ember = new THREE.MeshStandardMaterial({
    color: "#462d20",
    emissive: "#cd5416",
    emissiveIntensity: 0.5,
    roughness: 1,
  });
  return m;
}
