import * as THREE from "three";

// Trace the entire arc, not only its landing, so walls and furniture cannot be
// crossed. The room floor may be slightly raised above world zero.
export function traceTeleport(origin, direction, roots, map) {
  const points = [origin.clone()];
  const ray = new THREE.Raycaster();
  const velocity = direction.clone().normalize().multiplyScalar(5);
  const normal = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();
  for (let i = 1; i <= 60; i++) {
    const t = i * 0.035;
    const next = origin.clone().addScaledVector(velocity, t);
    next.y -= 4.9 * t * t;
    const previous = points.at(-1);
    const delta = next.clone().sub(previous);
    ray.set(previous, delta.clone().normalize());
    ray.far = delta.length();
    const hit = ray.intersectObjects(roots, true).find((h) => {
      for (let o = h.object; o; o = o.parent) if (!o.visible) return false;
      const m = Array.isArray(h.object.material)
        ? h.object.material[h.face?.materialIndex || 0]
        : h.object.material;
      return !(m?.transparent && m.opacity < 0.05);
    });
    if (hit) {
      points.push(hit.point.clone());
      normalMatrix.getNormalMatrix(hit.object.matrixWorld);
      normal
        .copy(hit.face?.normal || new THREE.Vector3())
        .applyMatrix3(normalMatrix)
        .normalize();
      const valid =
        hit.point.y >= -0.05 &&
        hit.point.y <= 0.24 &&
        normal.y > 0.8 &&
        map.free(hit.point.x, hit.point.z);
      return { points, target: hit.point, valid };
    }
    if (next.y < 0) {
      const landing = previous
        .clone()
        .lerp(next, previous.y / (previous.y - next.y));
      points.push(landing);
      return { points, target: landing, valid: map.free(landing.x, landing.z) };
    }
    points.push(next);
  }
  return { points, target: points.at(-1), valid: false };
}

export function teleportOffset(head, target) {
  return new THREE.Vector3(target.x - head.x, 0, target.z - head.z);
}
