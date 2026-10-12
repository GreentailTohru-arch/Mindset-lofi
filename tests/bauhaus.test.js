import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";

test("Bauhaus studio has wordless artwork, usable window and independently resettable furniture", () => {
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
    assert.equal(resolveScene("?scene=bauhaus"), "bauhaus");
    const preset = scenePresets.bauhaus,
      store = createStore(preset.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (object, name, hint, action) =>
      items.push({ object, name, action });
    const m = preset.createMaterials(),
      room = preset.createRoom(scene, m, store, register),
      furniture = preset.createFurniture(scene, m, store, register),
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
    assert.equal(paintedText, 0);
    assert.ok(
      !items.some((i) => /唱机|唱片|转盘|record|turntable/i.test(i.name)),
    );
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-4, 2, 1.3),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(
      ray.intersectObject(room.root, true)[0].object,
      get("窗外街景").object,
    );
    get("黑钢框窗扇").action();
    get("书桌抽屉").action();
    get("亚麻遮光帘").action();
    get("书桌台灯").action();
    get("半球落地灯").action();
    get("窗外街景").action();
    for (const name of [
      "钢管皮革椅",
      "素面笔记本",
      "圆形组合茶几",
      "几何模块沙发",
    ])
      assert.equal(typeof get(name).action(), "string");
    tick();
    assert.ok(get("黑钢框窗扇").object.rotation.y < -0.47);
    assert.ok(get("书桌抽屉").object.position.z > 0.76);
    assert.ok(get("亚麻遮光帘").object.scale.y > 0.99);
    assert.ok(furniture.lamps.every((l) => l.shade.emissiveIntensity < 0.001));
    assert.equal(store.state.whiteOn, true);
    assert.equal(store.state.day, false);
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
    assert.equal(store.state.day, true);
    assert.equal(store.state.rgbMode, "off");
    assert.ok(get("书桌抽屉").object.position.z < 0.42);
    assert.ok(get("黑钢框窗扇").object.rotation.y > -0.01);
    assert.ok(get("亚麻遮光帘").object.scale.y < 0.05);
    assert.ok(furniture.lamps.every((l) => l.shade.emissiveIntensity > 0.69));
  } finally {
    globalThis.document = previous;
  }
});
