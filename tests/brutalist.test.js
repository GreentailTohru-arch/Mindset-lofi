import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";
test("Brutalist full layout, solid structure, window opening and resettable interactions", () => {
  const old = globalThis.document;
  let text = 0;
  const ctx = new Proxy(
    {},
    {
      get(o, k) {
        if (k in o) return o[k];
        if (k === "fillText" || k === "strokeText") return () => text++;
        if (k === "createLinearGradient" || k === "createRadialGradient")
          return () => ({ addColorStop() {} });
        return () => {};
      },
    },
  );
  globalThis.document = { createElement: () => ({ getContext: () => ctx }) };
  try {
    const p = scenePresets.brutalist,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (o, name, hint, action) => items.push({ o, name, action });
    const m = p.createMaterials(),
      room = p.createRoom(scene, m, store, register),
      f = p.createFurniture(scene, m, store, register),
      lights = p.createLighting(scene, store, f);
    const get = (n) => {
      const o = scene.getObjectByName("brutalist-" + n);
      assert.ok(o, n);
      return o;
    };
    const tick = () => {
      for (let i = 0; i < 120; i++) {
        room.update(0.05);
        f.update(0.05);
        lights.update(0.05);
      }
      scene.updateMatrixWorld(true);
    };
    tick();
    assert.equal(resolveScene("?scene=brutalist"), "brutalist");
    assert.equal(p.label, "粗野主义");
    assert.equal(text, 0);
    const bounds = (n) => new THREE.Box3().setFromObject(get(n), true),
      sofa = bounds("modular-sofa"),
      table = bounds("concrete-coffee-table");
    assert.ok(table.min.z - sofa.max.z > 0.3, "sofa/table circulation gap");
    for (const n of [
      "black-lounge-chair",
      "walnut-lounge-chair",
      "rust-ottoman",
      "cylinder-side-table",
    ]) {
      assert.ok(!table.intersectsBox(bounds(n)), n + " clears table");
      assert.ok(!sofa.intersectsBox(bounds(n)), n + " clears sofa");
    }
    assert.ok(get("writing-desk").position.z < -3.5);
    assert.ok(get("recessed-storage").position.z < -4);
    assert.ok(get("window-bench").position.x < -4);
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-3.5, 2, 0.75),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(
      ray
        .intersectObject(get("window-wall"), true)
        .filter((x) => x.object.material === m.wall).length,
      0,
      "window is a real opening",
    );
    const item = (n) => items.find((x) => x.name === n),
      y = get("modular-sofa").position.y;
    item("深灰模块沙发").action();
    f.update(0.12);
    assert.ok(get("modular-sofa").position.y > y);
    item("深灰亚麻窗帘").action();
    item("胡桃木无把手柜").action();
    item("工作台抽屉").action();
    item("黑色圆顶台灯").action();
    tick();
    assert.equal(store.state.curtains, false);
    assert.ok(item("工作台抽屉").o.position.z > 0.65);
    assert.ok(item("胡桃木无把手柜").o.position.z > 0.7);
    assert.equal(store.state.bedLamp, false);
    store.reset();
    f.reset();
    tick();
    assert.equal(store.state.curtains, true);
    assert.equal(store.state.bedLamp, true);
    assert.equal(get("modular-sofa").position.y, y);
    assert.equal(
      scene.children.filter((o) => o.isLight && o.castShadow).length,
      1,
    );
    scene.traverse((o) => {
      assert.ok(o.matrixWorld.elements.every(Number.isFinite));
      if (o.geometry)
        assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));
    });
  } finally {
    globalThis.document = old;
  }
});
