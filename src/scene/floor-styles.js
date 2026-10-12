import * as THREE from "three";

export const floorStyles = {
  original: "经典暖木",
  oak: "浅色橡木",
  walnut: "深色胡桃木",
  ash: "烟灰木纹",
};

// Only the floor material changes; furniture keeps its original wood finish.
export function bindFloorStyle(material, store) {
  const original = {
    map: material.map,
    color: material.color.clone(),
    roughness: material.roughness,
  };
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#d0d0d0";
  ctx.fillRect(0, 0, 512, 512);
  let seed = 84;
  const random = () =>
    (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 0; i < 1600; i++) {
    const y = random() * 512;
    ctx.strokeStyle = `rgba(50,50,50,${random() * 0.12})`;
    ctx.lineWidth = 0.4 + random();
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 16)
      ctx.lineTo(x, y + Math.sin(x * 0.025 + y) * 2);
    ctx.stroke();
  }
  const grain = new THREE.CanvasTexture(canvas);
  grain.colorSpace = THREE.SRGBColorSpace;
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.anisotropy = 4;
  const colors = { oak: "#e5caa0", walnut: "#71503c", ash: "#969aa2" };
  const sync = (state) => {
    const color = colors[state.floorStyle];
    material.map = color ? grain : original.map;
    material.color.copy(color ? new THREE.Color(color) : original.color);
    material.roughness = color ? 0.76 : original.roughness;
    material.needsUpdate = true;
  };
  store.subscribe((state, key) => {
    if (key === "floorStyle" || key === "reset") sync(state);
  });
  sync(store.state);
}
