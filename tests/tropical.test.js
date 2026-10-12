import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";
test("Tropical reference zones, clearances, three pendants and independent controls", () => {
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
    const p = scenePresets.tropical,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (o, name, hint, action) => items.push({ o, name, action });
    const m = p.createMaterials(),
      room = p.createRoom(scene, m, store, register),
      f = p.createFurniture(scene, m, store, register),
      l = p.createLighting(scene, store, f);
    const get = (n) => {
      const o = scene.getObjectByName("tropical-" + n);
      assert.ok(o, n);
      return o;
    };
    const item = (n) => {
      const o = items.find((x) => x.name === n);
      assert.ok(o, n);
      return o;
    };
    const tick = () => {
      for (let i = 0; i < 100; i++) {
        room.update(0.05);
        f.update(0.05);
        l.update(0.05, i * 0.05);
      }
      scene.updateMatrixWorld(true);
    };
    tick();
    assert.equal(resolveScene("?scene=tropical"), "tropical");
    assert.equal(p.label, "东南亚风");
    assert.equal(text, 0);
    assert.ok(get("window-bench").position.x < -4);
    assert.ok(get("writing-desk").position.z < -4);
    assert.ok(get("cane-sideboard").position.x > 2.5);
    for (let i = 0; i < 3; i++) get("pendant-" + i);
    const bounds = (n) => new THREE.Box3().setFromObject(get(n), true);
    const sofa = bounds("linen-sofa"),
      coffee = bounds("oval-tea-table");
    assert.ok(
      coffee.min.z - sofa.max.z > 0.38,
      "Tea table has an approach gap in front of sofa and blanket",
    );
    for (const n of [
      "left-chair",
      "right-chair",
      "woven-pouf",
      "stump-table",
    ]) {
      assert.ok(!coffee.intersectsBox(bounds(n)), n + " clears coffee table");
      assert.ok(!sofa.intersectsBox(bounds(n)), n + " clears sofa");
    }
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-4, 2, 0),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(ray.intersectObject(get("window-wall")).length, 0);
    const y = get("linen-sofa").position.y;
    item("亚麻度假沙发").action();
    f.update(0.13);
    assert.ok(get("linen-sofa").position.y > y);
    item("热带亚麻纱帘").action();
    item("藤格收纳柜门").action();
    item("黄铜书桌台灯").action();
    tick();
    assert.ok(item("热带亚麻纱帘").o.scale.x > 0.99);
    assert.ok(Math.abs(item("藤格收纳柜门").o.rotation.y) > 1);
    assert.equal(store.state.floorLamp, true);
    assert.ok(
      f.lamps
        .filter((x) => x.key === "bedLamp")
        .every((x) => x.shade.emissiveIntensity < 0.001),
    );
    store.reset();
    f.reset();
    tick();
    assert.ok(item("热带亚麻纱帘").o.scale.x < 0.2);
    assert.equal(get("linen-sofa").position.y, y);
    assert.ok(Math.abs(item("藤格收纳柜门").o.rotation.y) < 0.001);
    assert.equal(f.lamps.filter((x) => x.power > 0).length, 4);
    assert.equal(
      scene.children.filter((x) => x.isLight && x.castShadow).length,
      1,
    );
    assert.ok(!items.some((x) => /唱机|音箱|耳机|显示器/.test(x.name)));
    scene.traverse((o) => {
      assert.ok(o.matrixWorld.elements.every(Number.isFinite));
      if (o.geometry)
        assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));
    });
  } finally {
    globalThis.document = old;
  }
});
