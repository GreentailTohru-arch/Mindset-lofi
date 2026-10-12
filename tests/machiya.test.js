import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";

test("Machiya sliding doors reveal the garden and furniture/light state resets independently", () => {
  const previous = globalThis.document;
  let textCalls = 0;
  const ctx = new Proxy(
    {},
    {
      get(t, k) {
        if (k in t) return t[k];
        if (k === "fillText" || k === "strokeText") return () => textCalls++;
        if (k === "createLinearGradient" || k === "createRadialGradient")
          return () => ({ addColorStop() {} });
        return () => {};
      },
    },
  );
  globalThis.document = {
    createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }),
  };
  try {
    assert.equal(resolveScene("?scene=machiya"), "machiya");
    const p = scenePresets.machiya,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (object, name, hint, action) =>
      items.push({ object, name, action });
    const m = p.createMaterials(),
      room = p.createRoom(scene, m, store, register),
      furniture = p.createFurniture(scene, m, store, register),
      lighting = p.createLighting(scene, store, furniture);
    const get = (name) => {
      const i = items.find((i) => i.name === name);
      assert.ok(i, name);
      return i;
    };
    const tick = () => {
      for (let i = 0; i < 160; i++) {
        room.update(0.05, i * 0.05);
        furniture.update(0.05, i * 0.05);
        lighting.update(0.05, i * 0.05);
      }
      scene.updateMatrixWorld(true);
    };
    tick();
    assert.ok(
      scene.getObjectByName("machiya-futon").position.x > 3,
      "futon stays along the right side",
    );
    assert.ok(
      scene.getObjectByName("machiya-writing-desk").position.z > 3,
      "writing desk anchors the foreground",
    );
    assert.ok(
      scene.getObjectByName("machiya-tansu").position.z < -4,
      "full storage anchors the rear wall",
    );
    assert.ok(scene.getObjectByName("machiya-round-tea-table"));
    const cushion = get("坐垫").object;
    const restY = cushion.position.y;
    get("坐垫").action();
    furniture.update(0.35, 0);
    assert.ok(cushion.position.y > restY + 0.04, "click lifts cushion gently");
    furniture.update(0.4, 0.4);
    assert.ok(
      Math.abs(cushion.position.y - restY) < 0.0001,
      "cushion settles without drifting",
    );
    get("箪笥柜门").action();
    tick();
    assert.ok(get("箪笥柜门").object.rotation.y < -1.2);
    assert.equal(textCalls, 0);
    assert.equal(store.state.day, false);
    assert.equal(store.state.rgbMode, "off");
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-3, 1.3, 0.5),
      new THREE.Vector3(-1, 0, 0),
    );
    const shoji = scene.getObjectByName("shoji-right");
    assert.equal(ray.intersectObject(shoji, true).length, 0);
    get("障子纸门").action();
    get("杉木收纳抽屉").action();
    get("枕边纸灯").action();
    assert.match(get("铁壶").action(), /温/);
    tick();
    assert.ok(
      ray.intersectObject(shoji, true).length > 0,
      "closed paper door covers garden opening",
    );
    assert.ok(get("杉木收纳抽屉").object.position.z > 0.58);
    assert.ok(
      furniture.lamps.find((l) => l.key === "bedLamp").shade.emissiveIntensity <
        0.001,
    );
    assert.ok(
      furniture.lamps.find((l) => l.key === "floorLamp").shade
        .emissiveIntensity > 0.59,
    );
    assert.equal(store.state.whiteOn, true);
    let shadows = 0;
    scene.traverse((o) => {
      assert.ok(o.matrixWorld.elements.every(Number.isFinite));
      if (o.geometry)
        assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));
      if (o.isLight && o.castShadow) shadows++;
    });
    assert.equal(shadows, 1);
    let points = 0;
    scene.traverse((o) => {
      if (o.isPointLight) points++;
    });
    assert.ok(
      points <= 5,
      "decorative lamps do not each allocate a real light",
    );
    assert.ok(scene.getObjectByName("blank-scroll"));
    assert.ok(!items.some((i) => /唱片|唱机|音箱|转盘/.test(i.name)));
    store.reset();
    furniture.reset();
    tick();
    assert.ok(shoji.position.z > 3.69);
    assert.ok(Math.abs(get("箪笥柜门").object.rotation.y) < 0.001);
    assert.ok(get("杉木收纳抽屉").object.position.z < 0.031);
    assert.ok(furniture.lamps.every((l) => l.shade.emissiveIntensity > 0.59));
  } finally {
    globalThis.document = previous;
  }
});
