import * as THREE from "three";
import { pickInteractive } from "./xr-spatial.js";

export function createInteractions(scene, camera, canvas, notify) {
  const registry = [];
  let enabled = true;
  const ray = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  let down = null,
    hover = null,
    highlight = null,
    original = null,
    hoverMaterial = null;
  const tooltip = document.querySelector("#object-tooltip");
  function register(object, name, hint, action) {
    const entry = { object, name, hint, action };
    object.userData.interaction = entry;
    registry.push(entry);
    return object;
  }
  function resolve(event) {
    const b = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - b.left) / b.width) * 2 - 1,
      -((event.clientY - b.top) / b.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    return pickInteractive(ray, scene.children);
  }

  function clear() {
    if (highlight) {
      highlight.material = original;
      hoverMaterial.dispose();
      highlight = null;
    }
    hover = null;
    canvas.style.cursor = "grab";
    tooltip.classList.remove("visible");
  }
  function activate(entry) {
    const result = entry.action();
    notify(result);
    return result;
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (!enabled) return;
    down = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      id: event.pointerId,
      moved: false,
    };
    clear();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!enabled) return;
    if (down) {
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 7)
        down.moved = true;
      return;
    }
    const hit = resolve(event);
    if (!hit) {
      clear();
      return;
    }
    if (hover !== hit.entry) {
      clear();
      hover = hit.entry;
      tooltip.textContent = hover.name + " · 点击互动";
      if (hit.mesh.material?.emissive) {
        highlight = hit.mesh;
        original = hit.mesh.material;
        hoverMaterial = original.clone();
        hoverMaterial.emissive = new THREE.Color("#998cba");
        hoverMaterial.emissiveIntensity = 0.22;
        highlight.material = hoverMaterial;
      }
    }
    canvas.style.cursor = "pointer";
    tooltip.style.left =
      Math.min(event.clientX + 16, window.innerWidth - 220) + "px";
    tooltip.style.top = Math.max(20, event.clientY - 38) + "px";
    tooltip.classList.add("visible");
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!enabled) return;
    if (
      down &&
      down.id === event.pointerId &&
      !down.moved &&
      performance.now() - down.time < 650
    ) {
      const hit = resolve(event);
      if (hit) activate(hit.entry);
    }
    down = null;
  });
  canvas.addEventListener("pointercancel", () => {
    down = null;
    clear();
  });
  canvas.addEventListener("pointerleave", () => {
    down = null;
    clear();
  });
  return {
    register,
    registry,
    activate,
    clear,
    setEnabled(value) {
      enabled = value;
      down = null;
      clear();
    },
  };
}
