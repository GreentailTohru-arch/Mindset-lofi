import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";
import { supportsRgb } from "../src/lighting-capabilities.js";
import { createWhiteLightControl } from "../src/white-light.js";
import { bindFixtureInteractions } from "../src/fixture-interactions.js";

for (const [id, preset] of Object.entries(scenePresets)) {
  test(`${id}: actual lamp emitters follow global white controls and independent manual switches`, (t) => {
    const originalDocument = globalThis.document;
    const ctx = new Proxy(
      {},
      {
        get: (_, key) => {
          if (["createLinearGradient", "createRadialGradient"].includes(key))
            return () => ({ addColorStop() {} });
          if (key === "measureText") return () => ({ width: 40 });
          return () => {};
        },
      },
    );
    globalThis.document = { createElement: () => ({ getContext: () => ctx }) };
    t.after(() => {
      globalThis.document = originalDocument;
    });
    const scene = new THREE.Scene();
    const store = createStore(preset.settings, {
      rgbEnabled: supportsRgb(id),
      dayNightLighting: true,
    });
    const registry = [];
    const register = (object, name, hint, action) => {
      registry.push({ object, name, action });
      return object;
    };
    const materials = preset.createMaterials();
    const furniture = preset.createFurniture(scene, materials, store, register);
    const lighting = preset.createLighting(scene, store, furniture, register);
    const lampActions = [];
    const set = store.set;
    for (const entry of registry) {
      let lamp = false;
      store.set = (key) => { if (["bedLamp", "floorLamp", "whiteOn"].includes(key)) lamp = true; };
      entry.action();
      if (lamp) lampActions.push(entry);
    }
    store.set = set;
    const local = bindFixtureInteractions(lighting, registry, store);
    console.log(id, local.bindings.map(b => `${b.entry.name}:${b.fixtures.length}`).join(', '));
    for (const entry of lampActions) assert.ok(local.bindings.some(b => b.entry === entry), `unbound lamp: ${entry.name}`);
    const control = createWhiteLightControl(lighting, store);
    assert.ok(
      lighting.fixtures.length > 0,
      "scene exposes actual lamp fixtures",
    );
    const tick = () => {
      for (let i = 0; i < 90; i++) {
        furniture.update(1 / 30, i / 30);
        lighting.update(1 / 30, i / 30);
        control.update(1 / 30);
      }
    };
    const assertOff = () => {
      assert.equal((lighting.whiteLight ?? lighting.lights.white).intensity, 0);
      for (const fixture of lighting.fixtures) {
        if (fixture.light) assert.equal(fixture.light.intensity, 0);
        if (fixture.shade) assert.equal(fixture.shade.emissiveIntensity, 0);
        for (const flame of fixture.flames ?? [])
          assert.equal(flame.visible, false);
      }
    };
    store.set("day", true);
    tick();
    assertOff();
    store.set("bedLamp", true);
    tick();
    assert.equal(
      store.state.whiteOn,
      true,
      "a manual lamp switch works during daytime",
    );
    assert.ok(
      lighting.fixtures.some(
        (f) =>
          f.key === "bedLamp" &&
          (f.light?.intensity > 0 ||
            f.shade?.emissiveIntensity > 0 ||
            f.flames?.some((x) => x.visible)),
      ),
    );
    store.set("day", true); // Reapplying the same mode must not undo manual changes.
    assert.equal(store.state.bedLamp, true);
    store.set("day", false);
    assert.equal(store.state.whiteOn, true);
    assert.equal(store.state.floorLamp, true);
    store.set("whiteBrightness", 0.8);
    store.set("whiteTemp", "2700");
    tick();
    const emitters = lighting.fixtures
      .flatMap((f) => [
        f.light?.color,
        f.shade?.emissive,
        ...(f.flames ?? []).map((x) => x.material.color),
      ])
      .filter(Boolean);
    const warm = emitters.map((c) => c.clone());
    store.set("whiteTemp", "6000");
    tick();
    emitters.forEach((c, i) =>
      assert.ok(
        warm[i].r / warm[i].b > c.r / c.b,
        "lamp appearance shifts from warm to cool",
      ),
    );
    store.set("bedLamp", false);
    tick();
    for (const f of lighting.fixtures.filter((f) => f.key === "bedLamp")) {
      if (f.light) assert.equal(f.light.intensity, 0);
      if (f.shade) assert.equal(f.shade.emissiveIntensity, 0);
    }
    assert.equal(
      store.state.floorLamp,
      true,
      "other lamp groups remain independently on",
    );
    store.set("whiteBrightness", 0);
    tick();
    assertOff();
    assert.equal(
      store.state.whiteOn,
      false,
      "zero brightness also clears power state",
    );
    store.set("bedLamp", true);
    tick();
    assert.equal(
      store.state.whiteBrightness,
      0.8,
      "a single lamp click wakes it from zero brightness",
    );
    assert.equal(store.state.floorLamp, false);
    store.set("whiteBrightness", 0);
    store.set("whiteOn", true);
    tick();
    assert.equal(
      store.state.whiteBrightness,
      0.8,
      "manual power-on recalls a nonzero brightness",
    );
    store.set("whiteOn", false);
    tick();
    assertOff();
    assert.equal(
      store.state.day,
      false,
      "manual lights-off does not change night mode",
    );
    store.set("day", true);
    store.set("day", false);
    tick();
    assert.equal(
      store.state.whiteOn,
      true,
      "entering night restores default lights-on",
    );
    assert.equal(
      store.state.whiteTemp,
      "6000",
      "mode change preserves chosen temperature",
    );
    for (const binding of local.bindings) {
      for (const day of [true, false]) {
        store.set("day", !day);
        store.set("day", day);
        tick();
        const others = lighting.fixtures.filter(f => !binding.fixtures.includes(f));
        const before = others.map(f => [f.light?.intensity, f.shade?.emissiveIntensity]);
        binding.entry.action();
        tick();
        others.forEach((f, i) => {
          for (const [j, value] of [f.light?.intensity, f.shade?.emissiveIntensity].entries())
            if (value !== undefined) assert.ok(Math.abs(value - before[i][j]) < 0.001,
              `${binding.entry.name} changed another fixture in ${day ? 'day' : 'night'}`);
        });
        const targetOn = day;
        for (const f of binding.fixtures) {
          if (f.light) assert.equal(f.light.intensity > 0, targetOn);
          if (f.shade) assert.equal(f.shade.emissiveIntensity > 0, targetOn);
        }
        binding.entry.action();
        tick();
        for (const f of binding.fixtures) {
          if (f.light) assert.equal(f.light.intensity > 0, !targetOn);
          if (f.shade) assert.equal(f.shade.emissiveIntensity > 0, !targetOn);
        }
      }
    }
    local.dispose();
    store.reset();
    tick();
    assert.equal(
      store.state.whiteOn,
      !store.state.day,
      "reset respects initial day/night mode",
    );
    if (store.state.day) assertOff();
    scene.traverse((o) => {
      o.geometry?.dispose();
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
      else o.material?.dispose();
      o.shadow?.dispose();
    });
    scene.environment?.dispose();
  });
}
