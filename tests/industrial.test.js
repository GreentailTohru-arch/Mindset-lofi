import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";
test("Industrial loft preserves zones, furniture clearances, real glazing and resettable interactions", () => {
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
    const p = scenePresets.industrial,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (o, name, hint, action) => items.push({ o, name, action });
    const m = p.createMaterials(),
      room = p.createRoom(scene, m, store, register),
      f = p.createFurniture(scene, m, store, register),
      l = p.createLighting(scene, store, f);
    const get = (n) => {
      const o = scene.getObjectByName("industrial-" + n);
      assert.ok(o, n);
      return o;
    };
    const item = (n) => {
      const i = items.find((x) => x.name === n);
      assert.ok(i, n);
      return i;
    };
    const tick = () => {
      for (let i = 0; i < 100; i++) {
        room.update(0.05);
        f.update(0.05);
        l.update(0.05);
      }
      scene.updateMatrixWorld(true);
    };
    tick();
    assert.equal(resolveScene("?scene=industrial"), "industrial");
    assert.equal(p.label, "工业风");
    assert.equal(text, 0);
    assert.ok(get("workshop-shelf").position.x < -3);
    assert.ok(get("work-desk").position.z < -3.5);
    assert.ok(get("metal-locker").position.x > 2);
    const bounds = (n) => new THREE.Box3().setFromObject(get(n), true),
      sofa = bounds("leather-sofa"),
      coffee = bounds("coffee-table");
    assert.ok(
      coffee.min.z - sofa.max.z > 0.5,
      "At least 50 cm between sofa and coffee table",
    );
    for (const n of [
      "left-armchair",
      "right-armchair",
      "leather-ottoman",
      "round-side-table",
      "work-chair",
    ])
      assert.ok(!coffee.intersectsBox(bounds(n)), `Coffee table clear of ${n}`);
    for (const n of ["left-armchair", "right-armchair"]) {
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(
        get(n).quaternion,
      );
      assert.ok(forward.z < 0, "Foreground chairs face inward");
    }
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-4, 2, 0),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(ray.intersectObject(get("window-wall")).length, 0);
    const y = get("leather-sofa").position.y;
    item("做旧皮革沙发").action();
    f.update(0.13);
    assert.ok(get("leather-sofa").position.y > y);
    item("工业窗布帘").action();
    item("旧金属储物柜门").action();
    item("金属工作台灯").action();
    item("铜管阀门").action();
    tick();
    assert.ok(item("工业窗布帘").o.scale.x > 0.99);
    assert.ok(item("旧金属储物柜门").o.rotation.y < -1);
    assert.ok(item("铜管阀门").o.rotation.z > 3);
    assert.ok(
      f.lamps
        .filter((x) => x.key === "bedLamp")
        .every((x) => x.shade.emissiveIntensity < 0.001),
    );
    store.reset();
    room.reset();
    f.reset();
    tick();
    assert.ok(item("旧金属储物柜门").o.rotation.y > -0.001);
    assert.ok(item("工业窗布帘").o.scale.x < 0.18);
    assert.equal(get("leather-sofa").position.y, y);
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
