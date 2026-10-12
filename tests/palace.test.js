import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";

test("palace scene has an unobstructed window, wordless art and resettable interactions", () => {
  const previous = globalThis.document;
  let paintedText = 0;
  const ctx = new Proxy(
    {},
    {
      get(target, key) {
        if (key in target) return target[key];
        if (key === "fillText" || key === "strokeText")
          return () => paintedText++;
        if (key === "createLinearGradient" || key === "createRadialGradient")
          return () => ({ addColorStop() {} });
        return () => {};
      },
    },
  );
  globalThis.document = {
    createElement: () => ({ width: 0, height: 0, getContext: () => ctx }),
  };
  try {
    assert.equal(resolveScene("?scene=palace"), "palace");
    const preset = scenePresets.palace,
      store = createStore(preset.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (object, name, hint, action) =>
      items.push({ object, name, action });
    const m = preset.createMaterials(),
      room = preset.createRoom(scene, m, store, register);
    const furniture = preset.createFurniture(scene, m, store, register),
      lighting = preset.createLighting(scene, store, furniture);
    const get = (name) => {
      const item = items.find((e) => e.name === name);
      assert.ok(item, name);
      return item;
    };
    const tick = () => {
      for (let i = 0; i < 100; i++) {
        room.update(0.05, i * 0.05);
        furniture.update(0.05, i * 0.05);
        lighting.update(0.05, i * 0.05);
      }
      scene.updateMatrixWorld(true);
    };
    tick();
    assert.equal(
      paintedText,
      0,
      "palace artwork and objects never paint readable text",
    );
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-4, 2, 0.8),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(
      ray.intersectObject(room.root, true)[0].object,
      get("月下宫苑").object,
      "opening is not covered by wall panels",
    );
    const record = scene.getObjectByName("palace-record");
    get("宫苑黑胶唱机").action();
    const stopped = record.rotation.y;
    tick();
    assert.equal(record.rotation.y, stopped);
    get("宫廷丝绸帷幔").action();
    get("月下宫苑").action();
    get("音乐柜门").action();
    get("悬挂宫灯").action();
    get("落地宫灯").action();
    for (const name of [
      "雕花折屏",
      "青瓷茶席",
      "青铜香炉",
      "案上烛火",
      "山石盆景",
    ])
      assert.equal(typeof get(name).action(), "string");
    tick();
    assert.equal(store.state.day, true);
    assert.ok(get("宫廷丝绸帷幔").object.scale.x > 0.99);
    assert.ok(get("音乐柜门").object.rotation.y < -1);
    assert.ok(furniture.lamps.every((l) => l.shade.emissiveIntensity < 0.001));
    assert.equal(
      store.state.whiteOn,
      true,
      "palace lanterns leave independent white lighting on",
    );
    let shadowLights = 0;
    scene.traverse((obj) => {
      assert.ok(obj.matrixWorld.elements.every(Number.isFinite));
      if (obj.geometry)
        assert.ok(
          obj.geometry.attributes.position.array.every(Number.isFinite),
        );
      if (obj.isLight && obj.castShadow) shadowLights++;
    });
    assert.equal(shadowLights, 1);
    store.reset();
    furniture.reset();
    tick();
    assert.equal(store.state.day, false);
    assert.ok(get("宫廷丝绸帷幔").object.scale.x < 0.15);
    assert.ok(get("音乐柜门").object.rotation.y > -0.01);
    assert.ok(record.rotation.y > stopped);
    assert.ok(furniture.lamps.every((l) => l.shade.emissiveIntensity > 0.74));
    assert.equal(store.state.floorStyle, "original");
  } finally {
    globalThis.document = previous;
  }
});
