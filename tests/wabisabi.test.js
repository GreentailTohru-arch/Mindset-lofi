import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";

test("Wabi-Sabi opening, independent lantern, curtains and water interactions survive reset", () => {
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
    assert.equal(resolveScene("?scene=wabisabi"), "wabisabi");
    const p = scenePresets.wabisabi,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (object, name, hint, action) =>
      items.push({ object, name, action });
    const m = p.createMaterials(),
      room = p.createRoom(scene, m, store, register),
      furniture = p.createFurniture(scene, m, store, register),
      lights = p.createLighting(scene, store, furniture);
    const get = (name) => {
      const result = items.find((i) => i.name === name);
      assert.ok(result, name);
      return result;
    };
    const tick = () => {
      for (let i = 0; i < 160; i++) {
        room.update(0.05, i * 0.05);
        furniture.update(0.05, i * 0.05);
        lights.update(0.05, i * 0.05);
      }
      scene.updateMatrixWorld(true);
    };
    tick();
    assert.equal(p.label, "侘寂风");
    assert.ok(scene.getObjectByName("wabisabi-platform-bed").position.z < -2);
    assert.ok(scene.getObjectByName("wabisabi-writing-desk").position.x < -2);
    assert.ok(
      scene.getObjectByName("wabisabi-foreground-storage").position.z > 4,
    );
    assert.ok(scene.getObjectByName("wabisabi-rear-storage").position.z < -4);
    assert.ok(scene.getObjectByName("wabisabi-ink-scroll"));
    const wall = scene.getObjectByName("wabisabi-niche-wall");
    for (const [x, y] of [
      [0.55, 2.7],
      [4.13, 2.35],
    ]) {
      const nicheRay = new THREE.Raycaster(
        new THREE.Vector3(x, y, -4),
        new THREE.Vector3(0, 0, -1),
      );
      assert.equal(
        nicheRay.intersectObject(wall).length,
        0,
        "niche is a real opening, not a painted arch",
      );
    }
    get("旧木收纳抽屉").action();
    tick();
    assert.ok(get("旧木收纳抽屉").object.position.z > 0.35);
    const seat = get("圆形坐垫").object,
      base = seat.position.y;
    get("圆形坐垫").action();
    furniture.update(0.4, 0);
    assert.ok(seat.position.y > base + 0.03);
    furniture.update(0.4, 0.4);
    assert.ok(Math.abs(seat.position.y - base) < 0.001);
    assert.equal(letters, 0);
    assert.equal(store.state.rgbMode, "off");
    assert.ok(
      !items.some((i) => /speaker|turntable|record player/i.test(i.name)),
    );
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-4, 2, -1.2),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(
      ray.intersectObject(room.root, true)[0].object,
      get("Misty garden").object,
      "window opening is unobstructed",
    );
    get("Aged linen curtain").action();
    get("Small paper lantern").action();
    assert.match(get("Weathered stone basin").action(), /ripple/);
    assert.match(get("Rough ceramic tea vessel").action(), /warmth/);
    tick();
    assert.ok(get("Aged linen curtain").object.scale.x > 0.99);
    assert.ok(furniture.shade.emissiveIntensity < 0.001);
    assert.equal(
      store.state.whiteOn,
      true,
      "lantern does not change independent white light",
    );
    get("Misty garden").action();
    assert.equal(store.state.day, false);
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
    let points = 0;
    scene.traverse((o) => {
      if (o.isPointLight) points++;
    });
    assert.ok(points <= 4, "bounded local lighting budget");
    store.reset();
    furniture.reset();
    tick();
    assert.equal(store.state.day, true);
    assert.ok(get("旧木收纳抽屉").object.position.z < 0.021);
    assert.ok(get("Aged linen curtain").object.scale.x < 0.281);
    assert.ok(furniture.shade.emissiveIntensity > 0.419);
  } finally {
    globalThis.document = previous;
  }
});
