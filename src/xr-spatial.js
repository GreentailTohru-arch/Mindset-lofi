import * as THREE from "three";

// Shared by pointer and XR rays: hidden ancestors and transparent panes must
// not become invisible blockers, but visible architecture still occludes items.
export function pickInteractive(ray, roots) {
  for (const hit of ray.intersectObjects(roots, true)) {
    let node = hit.object,
      hidden = false,
      entry;
    while (node) {
      hidden ||= !node.visible;
      entry ||= node.userData.interaction;
      node = node.parent;
    }
    const material = Array.isArray(hit.object.material)
      ? hit.object.material[hit.face?.materialIndex || 0]
      : hit.object.material;
    if (hidden || (material?.transparent && material.opacity < 0.05)) continue;
    return entry ? { ...hit, mesh: hit.object, entry } : null;
  }
  return null;
}

export function viewPlacement(scale, headHeight = 1.6) {
  // Scale the observer, not the assets: scene lights, animation coordinates and
  // fixture state retain their original units. Stereo eye separation scales too.
  const yaw = Math.atan2(12, 16);
  return {
    scale,
    yaw,
    position: new THREE.Vector3(
      Math.sin(yaw) * 4.4 * scale,
      (1.65 - headHeight) * scale,
      Math.cos(yaw) * 4.4 * scale,
    ),
  };
}

export function pageItems(entries, page, size = 6) {
  const pages = Math.max(1, Math.ceil(entries.length / size));
  const index = ((page % pages) + pages) % pages;
  return {
    index,
    pages,
    items: entries.slice(index * size, (index + 1) * size),
  };
}
