import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";

test("Baroque arches, mirror and independent harpsichord/fire interactions assemble and reset", () => {
  const previous = globalThis.document;
  let letters = 0;
  const ctx = new Proxy(
    {},
    {
      get(target, key) {
        if (key in target) return target[key];
        if (key === "fillText" || key === "strokeText") return () => letters++;
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
    assert.equal(resolveScene("?scene=baroque"), "baroque");
    const preset = scenePresets.baroque,
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
      const e = items.find((i) => i.name === name);
      assert.ok(e, name);
      return e;
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
    assert.equal(letters, 0);
    assert.ok(!items.some((i) => /唱机|唱片|转盘|音箱/.test(i.name)));
    const wall = scene.getObjectByName("baroque-arched-wall");
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-4, 2, 2.65),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(
      ray.intersectObject(wall).length,
      0,
      "arched window cuts through the wall",
    );
    ray.ray.origin.z = 4.3;
    assert.ok(
      ray.intersectObject(wall).length > 0,
      "plaster remains between the openings and room boundary",
    );
    const mirror = scene.getObjectByName("salon-mirror");
    assert.equal(mirror.isReflector, true);
    assert.equal(mirror.getRenderTarget().width, 512);
    get("羽管键琴琴盖").action();
    get("天鹅绒帷幔").action();
    get("写字桌抽屉").action();
    get("雕花古籍书柜").action();
    assert.match(get("小型羽管键琴").action(), /琴键/);
    assert.match(get("古典壁炉").action(), /熄灭/);
    get("壁炉烛台").action();
    get("书桌烛台").action();
    tick();
    assert.ok(get("羽管键琴琴盖").object.rotation.z < 0.001);
    assert.ok(get("天鹅绒帷幔").object.scale.x > 0.99);
    assert.ok(get("写字桌抽屉").object.position.z > 0.78);
    assert.ok(
      furniture.lamps.every((l) =>
        l.flames.every((f) => f.material.opacity < 0.001),
      ),
    );
    assert.equal(store.state.whiteOn, true);
    let shadows = 0;
    scene.traverse((obj) => {
      assert.ok(obj.matrixWorld.elements.every(Number.isFinite));
      if (obj.geometry)
        assert.ok(
          obj.geometry.attributes.position.array.every(Number.isFinite),
        );
      if (obj.isLight && obj.castShadow) shadows++;
    });
    assert.equal(shadows, 1);
    store.reset();
    furniture.reset();
    tick();
    assert.equal(store.state.day, false);
    assert.ok(get("羽管键琴琴盖").object.rotation.z > 0.57);
    assert.ok(get("天鹅绒帷幔").object.scale.x < 0.251);
    assert.ok(get("写字桌抽屉").object.position.z < 0.52);
    assert.ok(
      furniture.lamps.every((l) =>
        l.flames.every((f) => f.material.opacity > 0.87),
      ),
    );
    mirror.dispose();
  } finally {
    globalThis.document = previous;
  }
});
