import * as THREE from "three";
import { createStore } from "./state.js";
import { supportsRgb } from "./lighting-capabilities.js";
import { bindFixtureInteractions } from "./fixture-interactions.js";
import { createWhiteLightControl } from "./white-light.js";

// A separate render scene lets the XR session survive scene changes while the
// desktop room and its UI subscriptions remain untouched until VR is exited.
export function buildVRWorld(preset, id) {
  const scene = new THREE.Scene();
  const store = createStore(preset.settings, {
    rgbEnabled: supportsRgb(id),
    dayNightLighting: true,
  });
  const registry = [];
  const register = (object, name, hint, action) => {
    const entry = { object, name, hint, action };
    object.userData.interaction = entry;
    registry.push(entry);
    return object;
  };
  const m = preset.createMaterials();
  const room = preset.createRoom(scene, m, store, register);
  const furniture = preset.createFurniture(scene, m, store, register);
  const lighting = preset.createLighting(
    scene,
    store,
    furniture,
    supportsRgb(id) ? register : (o) => o,
  );
  bindFixtureInteractions(lighting, registry, store);
  const white = createWhiteLightControl(lighting, store);
  store.subscribe((_, key) => {
    if (key === "reset") furniture.reset();
  });
  let time = 0;
  return {
    scene,
    store,
    registry,
    update(dt) {
      time += dt;
      room.update(dt, time);
      furniture.update(dt, time);
      lighting.update(dt, time);
      white.update(dt);
    },
    dispose() {
      const geometries = new Set(),
        materials = new Set();
      scene.traverse((o) => {
        if (o.geometry) geometries.add(o.geometry);
        for (const mat of [].concat(o.material || [])) materials.add(mat);
        o.shadow?.map?.dispose();
      });
      geometries.forEach((g) => g.dispose());
      const textures = new Set();
      materials.forEach((m) => {
        for (const [key, value] of Object.entries(m))
          if (value?.isTexture && key !== "envMap") textures.add(value);
        m.dispose();
      });
      textures.forEach((t) => t.dispose());
      // Environment and texture atlases can be shared by scene factories.
      scene.clear();
    },
  };
}
