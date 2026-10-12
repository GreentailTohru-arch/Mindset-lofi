import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";

// Canvas drawing is stubbed here; this checks scene structure, not rendered appearance.
test("scholar scene assembles finite geometry, responds to interactions and resets", () => {
  const previous = globalThis.document;
  const ctx = new Proxy(
    {},
    {
      get(target, key) {
        if (key in target) return target[key];
        if (key === "createLinearGradient")
          return () => ({ addColorStop() {} });
        return () => {};
      },
    },
  );
  globalThis.document = {
    createElement: () => ({ width: 0, height: 0, getContext: () => ctx }),
  };
  try {
    assert.equal(resolveScene("?scene=ruya"), "ruya");
    assert.ok(scenePresets.studio && scenePresets.classic);
    const preset = scenePresets.ruya,
      store = createStore(preset.settings);
    const scene = new THREE.Scene(),
      registry = [];
    const register = (object, name, hint, action) =>
      registry.push({ object, name, action });
    const m = preset.createMaterials();
    const room = preset.createRoom(scene, m, store, register);
    const furniture = preset.createFurniture(scene, m, store, register);
    const lights = preset.createLighting(scene, store, furniture, register);
    for (const name of [
      "木格窗",
      "竹帘",
      "七弦古琴",
      "宣纸习字",
      "青瓷茶壶",
      "黑胶唱机",
    ]) {
      const item = registry.find((entry) => entry.name === name);
      assert.ok(item, `Missing interaction: ${name}`);
      assert.equal(typeof item.action(), "string");
    }
    assert.equal(store.state.day, true);
    assert.equal(store.state.curtains, false);
    for (const mode of [
      "static",
      "breathing",
      "rainbow",
      "wave",
      "aurora",
      "random",
      "off",
    ]) {
      store.set("rgbMode", mode);
      for (let i = 0; i < 20; i++) {
        room.update(0.05, i * 0.05);
        furniture.update(0.05, i * 0.05);
        lights.update(0.05, i * 0.05);
      }
    }
    scene.updateMatrixWorld(true);
    scene.traverse((object) => {
      assert.ok(object.matrixWorld.elements.every(Number.isFinite));
      const vertices = object.geometry?.attributes.position?.array;
      if (vertices) assert.ok(vertices.every(Number.isFinite));
      if (object.isLight)
        assert.ok(Number.isFinite(object.intensity) && object.intensity >= 0);
    });
    assert.equal(
      scene.children.filter((object) => object.isLight && object.castShadow)
        .length,
      1,
    );
    store.reset();
    furniture.reset();
    assert.equal(store.state.day, false);
    assert.equal(store.state.curtains, true);
    assert.equal(store.state.rgbBrightness, 0.3);
  } finally {
    globalThis.document = previous;
  }
});
