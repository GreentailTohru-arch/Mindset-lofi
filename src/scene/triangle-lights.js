import * as THREE from "three";
import { group } from "./primitives.js";
import { damp, rgbEnvelope } from "../state.js";

export function createTriangleLights(parent, store, register) {
  const root = group(parent, [-1.8, 2.77, -4.845]);
  root.name = "studio-triangle-light-array";
  const side = 0.54,
    height = (Math.sqrt(3) * side) / 2;
  const shape = new THREE.Shape();
  shape.moveTo(0, height / 2);
  shape.lineTo(-side / 2, -height / 2);
  shape.lineTo(side / 2, -height / 2);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.017,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.008,
    bevelSegments: 2,
    steps: 1,
  });
  const pos = geometry.attributes.position,
    uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++)
    uv.setXY(i, pos.getX(i) / side + 0.5, pos.getY(i) / height + 0.5);
  const palettes = [
    ["#ffa453", "#8ce968", "#ffe36b", "#66e8ac", "#ffac79", "#ffe475"],
    ["#ffe278", "#8ce765", "#a3e88b", "#ffe16a", "#ffb87a", "#ffe475"],
  ];
  const materials = [];
  const rim = new THREE.MeshStandardMaterial({
    color: "#fff4d7",
    emissive: "#fff2ce",
    emissiveIntensity: 0.55,
    roughness: 0.65,
  });
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 6; col++) {
      const color = palettes[row][col],
        canvas = document.createElement("canvas");
      canvas.width = canvas.height = 128;
      const ctx = canvas.getContext("2d"),
        gradient = ctx.createLinearGradient(0, 0, 128, 128);
      gradient.addColorStop(0, "#ffeeb6");
      gradient.addColorStop(0.47, color);
      gradient.addColorStop(1, color);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      const map = new THREE.CanvasTexture(canvas);
      map.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshStandardMaterial({
        color: "#999999",
        map,
        emissive: "#ffffff",
        emissiveMap: map,
        emissiveIntensity: 0.55,
        roughness: 0.7,
      });
      const tile = group(root, [
        (col - 2.5) * (side / 2 + 0.044),
        (row === 0 ? 1 : -1) * (height / 2 + 0.027),
        0,
      ]);
      // Top row starts downward; bottom row is its mirrored partner.
      tile.rotation.z = (row + col) % 2 === 0 ? Math.PI : 0;
      tile.name = "studio-triangle-panel";
      const border = new THREE.Mesh(geometry, rim);
      border.scale.set(1.055, 1.055, 1);
      tile.add(border);
      const face = new THREE.Mesh(geometry, material);
      face.position.z = 0.018;
      tile.add(face);
      materials.push(material);
    }
  register(root, "三角拼接灯板", "切换呼吸 / 静态", () => {
    store.set(
      "rgbMode",
      store.state.rgbMode === "breathing" ? "static" : "breathing",
    );
    return store.state.rgbMode === "breathing"
      ? "三角灯板 · 柔和呼吸"
      : "三角灯板 · 静态柔光";
  });
  return {
    root,
    update(dt, t) {
      const s = store.state;
      const power =
        s.rgbMode === "off"
          ? 0
          : s.rgbBrightness * rgbEnvelope(s.rgbMode, t * (0.2 + s.rgbSpeed));
      materials.forEach(
        (mat) =>
          (mat.emissiveIntensity = damp(
            mat.emissiveIntensity,
            power * 0.95,
            dt,
          )),
      );
      rim.emissiveIntensity = damp(rim.emissiveIntensity, power * 0.8, dt);
    },
  };
}
