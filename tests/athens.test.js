import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";

test("Athens architecture has a real niche and interactive scene resets to sunset", () => {
  const previous = globalThis.document;
  const ctx = new Proxy(
    {},
    {
      get(target, key) {
        if (key in target) return target[key];
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
    assert.equal(resolveScene("?scene=athens"), "athens");
    const preset = scenePresets.athens,
      store = createStore(preset.settings);
    const scene = new THREE.Scene(),
      items = [];
    const register = (object, name, hint, action) =>
      items.push({ object, name, action });
    const m = preset.createMaterials();
    const room = preset.createRoom(scene, m, store, register);
    const furniture = preset.createFurniture(scene, m, store, register);
    const lighting = preset.createLighting(scene, store, furniture);
    const get = (name) => {
      const entry = items.find((item) => item.name === name);
      assert.ok(entry, name);
      return entry;
    };
    const tick = () => {
      for (let i = 0; i < 80; i++) {
        room.update(0.05, i * 0.05);
        furniture.update(0.05, i * 0.05);
        lighting.update(0.05, i * 0.05);
      }
      scene.updateMatrixWorld(true);
    };
    assert.equal(store.state.day, true);
    tick();
    const wall = scene.getObjectByName("limestone-niche-wall");
    const ray = new THREE.Raycaster(
      new THREE.Vector3(1.3, 2.1, 0),
      new THREE.Vector3(0, 0, -1),
    );
    assert.equal(
      ray.intersectObject(wall).length,
      0,
      "niche must be an actual opening",
    );
    ray.ray.origin.x = 3.5;
    assert.ok(
      ray.intersectObject(wall).length > 0,
      "solid limestone remains alongside the niche",
    );
    assert.ok(get("亚麻海风帘").object.scale.x < 0.11);
    get("亚麻海风帘").action();
    get("爱琴海远景").action();
    assert.match(get("海岸黑胶唱机").action(), /暂停/);
    assert.match(get("古典竖琴").action(), /琴弦/);
    get("木柜格栅门").action();
    get("青铜灯笼").action();
    tick();
    assert.equal(store.state.day, false);
    assert.equal(store.state.bedLamp, false);
    assert.ok(get("亚麻海风帘").object.scale.x > 0.99);
    assert.ok(get("木柜格栅门").object.rotation.y < -1);
    assert.equal(
      store.state.whiteOn,
      true,
      "lantern controls leave white light independent",
    );
    scene.traverse((obj) => {
      assert.ok(obj.matrixWorld.elements.every(Number.isFinite));
      if (obj.geometry)
        assert.ok(
          obj.geometry.attributes.position.array.every(Number.isFinite),
        );
    });
    assert.equal(
      scene.children.filter((obj) => obj.isLight && obj.castShadow).length,
      1,
    );
    store.reset();
    furniture.reset();
    tick();
    assert.equal(store.state.day, true);
    assert.equal(store.state.bedLamp, true);
    assert.equal(store.state.floorStyle, "original");
    assert.ok(get("木柜格栅门").object.rotation.y > -0.01);
    assert.ok(get("亚麻海风帘").object.scale.x < 0.11);
  } finally {
    globalThis.document = previous;
  }
});
