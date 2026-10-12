import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";
import { supportsRgb } from "../src/lighting-capabilities.js";
import { createWhiteLightControl } from "../src/white-light.js";

for (const [id, preset] of Object.entries(scenePresets)) {
  test(`${id}: real indoor lights respond to all temperatures, brightness and power in day and night`, (t) => {
    const store = createStore(preset.settings, { rgbEnabled: supportsRgb(id) });
    store.set("rgbMode", "off");
    if (id === "artdeco") {
      const originalDocument = globalThis.document;
      const context = new Proxy(
        {},
        {
          get: (_, key) =>
            key === "createLinearGradient" || key === "createRadialGradient"
              ? () => ({ addColorStop() {} })
              : () => {},
        },
      );
      globalThis.document = {
        createElement: () => ({ getContext: () => context }),
      };
      t.after(() => {
        globalThis.document = originalDocument;
      });
    }
    const scene = new THREE.Scene();
    // Lighting modules consume furniture lamp handles; geometry is irrelevant here.
    const furniture = { lamps: [], candlesOn: true };
    for (const key of ["bedShade", "floorShade", "wallGlow", "readingGlow"])
      furniture[key] = new THREE.MeshStandardMaterial({ emissive: "#ffffff" });
    const lighting = preset.createLighting(scene, store, furniture, () => {});
    const whiteControl = createWhiteLightControl(lighting, store);
    const lights = [];
    scene.traverse((object) => {
      if (object.isLight) lights.push(object);
    });
    const settle = () => {
      for (let i = 0; i < 160; i++) {
        lighting.update(0.05, i * 0.05);
        whiteControl.update(0.05);
      }
    };

    for (const day of [false, true]) {
      store.set("day", day);
      store.set("whiteOn", true);
      store.set("whiteBrightness", 0.7);
      store.set("whiteTemp", "2700");
      settle();
      const warm = lights.map((light) => light.color.clone());
      store.set("whiteTemp", "4000");
      settle();
      const natural = lights.map((light) => light.color.clone());
      store.set("whiteTemp", "6000");
      settle();
      const controlled = lights.filter(
        (light, i) =>
          warm[i].getHex() !== natural[i].getHex() &&
          natural[i].getHex() !== light.color.getHex(),
      );
      assert.ok(
        controlled.length > 0,
        "real light colors differ at 2700 / 4000 / 6000 K",
      );
      for (const light of controlled) {
        const old = warm[lights.indexOf(light)];
        assert.ok(
          old.r / old.b > light.color.r / light.color.b,
          "warm light has a higher red/blue ratio",
        );
      }
      store.set("whiteBrightness", 0.2);
      settle();
      const dim = controlled.map((light) => light.intensity);
      store.set("whiteBrightness", 0.8);
      settle();
      controlled.forEach((light, i) =>
        assert.ok(
          light.intensity > dim[i] * 3.9,
          "brightness affects real light intensity",
        ),
      );
      store.set("whiteOn", false);
      settle();
      controlled.forEach((light) =>
        assert.ok(light.intensity < 0.00001, "white light switches off"),
      );
    }
    for (const material of Object.values(furniture))
      if (material?.isMaterial) material.dispose();
    scene.traverse((object) => {
      object.geometry?.dispose();
      object.material?.dispose();
      object.shadow?.dispose();
    });
  });
}

test("RGB availability survives toggles, attempted item activation and reset", () => {
  for (const [id, preset] of Object.entries(scenePresets)) {
    const enabled = supportsRgb(id);
    assert.equal(enabled, ["studio", "classic"].includes(id));
    const store = createStore(preset.settings, { rgbEnabled: enabled });
    store.set("rgbMode", "aurora");
    store.set("rgbBrightness", 0.9);
    store.set("day", !store.state.day);
    assert.equal(store.state.rgbMode, enabled ? "aurora" : "off");
    assert.equal(store.state.rgbBrightness, enabled ? 0.9 : 0);
    store.reset();
    if (!enabled) {
      assert.equal(store.state.rgbMode, "off");
      assert.equal(store.state.rgbBrightness, 0);
    }
  }
});
