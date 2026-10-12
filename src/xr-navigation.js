import * as THREE from "three";

export function createWalkMap(roots, extent = 4.45, step = 0.2) {
  const size = Math.floor((extent * 2) / step) + 1;
  const blocked = new Uint8Array(size * size);
  const box = new THREE.Box3();
  for (const root of roots) {
    root.updateWorldMatrix(true, true);
    root.traverse((object) => {
      if (!object.isMesh || !object.visible) return;
      let parent = object.parent;
      while (parent) {
        if (!parent.visible) return;
        parent = parent.parent;
      }
      box.setFromObject(object);
      // Ignore rugs, overhead fixtures and outside scenery. Low furniture is solid.
      if (box.max.y < 0.25 || box.min.y > 1.45 || box.max.y > 20) return;
      const loX = Math.max(0, Math.floor((box.min.x - 0.22 + extent) / step));
      const hiX = Math.min(
        size - 1,
        Math.ceil((box.max.x + 0.22 + extent) / step),
      );
      const loZ = Math.max(0, Math.floor((box.min.z - 0.22 + extent) / step));
      const hiZ = Math.min(
        size - 1,
        Math.ceil((box.max.z + 0.22 + extent) / step),
      );
      for (let z = loZ; z <= hiZ; z++)
        for (let x = loX; x <= hiX; x++) blocked[z * size + x] = 1;
    });
  }
  function free(x, z) {
    if (Math.abs(x) > extent - 0.15 || Math.abs(z) > extent - 0.15)
      return false;
    const ix = Math.round((x + extent) / step),
      iz = Math.round((z + extent) / step);
    return !blocked[iz * size + ix];
  }
  function spawn(preferred = new THREE.Vector3(2.8, 0, 3.6)) {
    let best = null,
      distance = Infinity;
    for (let z = 0; z < size; z++)
      for (let x = 0; x < size; x++) {
        const p = new THREE.Vector3(x * step - extent, 0, z * step - extent);
        const d = p.distanceToSquared(preferred);
        if (d < distance && free(p.x, p.z)) {
          best = p;
          distance = d;
        }
      }
    return best;
  }
  function move(position, delta) {
    const result = position.clone();
    const steps = Math.max(1, Math.ceil(delta.length() / 0.06));
    for (let i = 0; i < steps; i++) {
      const x = result.x + delta.x / steps,
        z = result.z + delta.z / steps;
      if (free(x, result.z)) result.x = x;
      if (free(result.x, z)) result.z = z;
    }
    return result;
  }
  return { free, spawn, move, extent };
}

export function deadzone(value, threshold = 0.18) {
  return Math.abs(value) < threshold
    ? 0
    : (Math.sign(value) * (Math.abs(value) - threshold)) / (1 - threshold);
}
