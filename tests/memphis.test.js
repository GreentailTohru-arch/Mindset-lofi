import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";
test("Memphis layout clearances, real window, wordless patterns and resettable controls", () => {
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
    const p = scenePresets.memphis,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (o, name, hint, action) => items.push({ o, name, action });
    const m = p.createMaterials(),
      room = p.createRoom(scene, m, store, register),
      f = p.createFurniture(scene, m, store, register),
      l = p.createLighting(scene, store, f);
    const get = (n) => {
      const o = scene.getObjectByName("memphis-" + n);
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
    assert.equal(resolveScene("?scene=memphis"), "memphis");
    assert.equal(p.label, "孟菲斯风格");
    assert.equal(text, 0);
    assert.ok(get("modular-bookcase").position.z < -4);
    assert.ok(get("red-writing-desk").position.z < -3.5);
    assert.ok(get("window-bench").position.x < -4);
    const bounds = (n) => new THREE.Box3().setFromObject(get(n), true),
      sofa = bounds("colorblock-sofa"),
      table = bounds("red-organic-table");
    assert.ok(
      table.min.z - sofa.max.z > 0.3,
      "sofa and table keep a clear approach gap",
    );
    for (const n of [
      "teal-tube-chair",
      "coral-armchair",
      "striped-pouf",
      "checker-side-table",
    ]) {
      assert.ok(!table.intersectsBox(bounds(n)), n + " clears table");
      assert.ok(!sofa.intersectsBox(bounds(n)), n + " clears sofa");
    }
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-4, 2, 0.7),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(
      ray
        .intersectObject(get("window-wall"), true)
        .filter((x) => x.object.material === m.wall).length,
      0,
    );
    const y = get("colorblock-sofa").position.y;
    item("撞色模块沙发").action();
    f.update(0.13);
    assert.ok(get("colorblock-sofa").position.y > y);
    item("珊瑚百叶窗").action();
    item("彩色窗边抽屉").action();
    item("棋盘格边柜门").action();
    item("彩色几何台灯").action();
    tick();
    assert.equal(store.state.curtains, false);
    assert.ok(item("彩色窗边抽屉").o.position.z > 0.65);
    assert.ok(item("棋盘格边柜门").o.rotation.y < -1);
    assert.equal(store.state.bedLamp, true);
    store.reset();
    f.reset();
    tick();
    assert.equal(get("colorblock-sofa").position.y, y);
    assert.ok(Math.abs(item("棋盘格边柜门").o.rotation.y) < 0.001);
    assert.equal(store.state.curtains, true);
    assert.equal(f.lamps.filter((x) => x.power > 0).length, 4);
    assert.equal(
      scene.children.filter((x) => x.isLight && x.castShadow).length,
      1,
    );
    assert.ok(scene.environment.isCubeTexture);
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
