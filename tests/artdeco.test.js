import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";
test("Art Deco symmetry, furniture clearances, live mirror and independent interactions", () => {
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
    const p = scenePresets.artdeco,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (o, name, hint, action) => items.push({ o, name, action });
    const m = p.createMaterials(),
      room = p.createRoom(scene, m, store, register),
      f = p.createFurniture(scene, m, store, register),
      l = p.createLighting(scene, store, f);
    const get = (n) => {
      const o = scene.getObjectByName("artdeco-" + n);
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
    assert.equal(resolveScene("?scene=artdeco"), "artdeco");
    assert.equal(p.label, "装饰艺术");
    assert.equal(text, 0);
    assert.ok(get("writing-alcove").position.x < -4);
    assert.ok(get("marble-sideboard").position.z < -4);
    assert.ok(get("glass-vitrine").position.x > 3);
    const bounds = (n) => new THREE.Box3().setFromObject(get(n), true),
      sofa = bounds("emerald-sofa"),
      coffee = bounds("oval-marble-table");
    assert.ok(
      coffee.min.z - sofa.max.z > 0.38,
      "Table clears the curved sofa arms",
    );
    for (const n of [
      "left-armchair",
      "right-armchair",
      "wine-ottoman",
      "left-side-table",
      "right-side-table",
    ])
      assert.ok(!coffee.intersectsBox(bounds(n)), `Coffee table clear of ${n}`);
    assert.equal(
      get("left-armchair").position.x,
      -get("right-armchair").position.x,
    );
    assert.equal(
      get("left-armchair").position.z,
      get("right-armchair").position.z,
    );
    assert.equal(
      get("left-side-table").position.x,
      -get("right-side-table").position.x,
    );
    assert.ok(get("sunburst-mirror").children.some((x) => x.isReflector));
    assert.ok(scene.environment.isCubeTexture);
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-4, 2, 0.5),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(ray.intersectObject(get("window-wall")).length, 0);
    const y = get("emerald-sofa").position.y;
    item("翡翠绿弧形沙发").action();
    f.update(0.13);
    assert.ok(get("emerald-sofa").position.y > y);
    item("翡翠绿天鹅绒窗帘").action();
    item("水晶展示柜门").action();
    item("黄铜书桌台灯").action();
    tick();
    assert.ok(item("翡翠绿天鹅绒窗帘").o.scale.x > 0.99);
    assert.ok(item("水晶展示柜门").o.rotation.y < -1);
    assert.equal(store.state.floorLamp, true);
    assert.ok(
      f.lamps
        .filter((x) => x.key === "bedLamp")
        .every((x) => x.shade.emissiveIntensity < 0.001),
    );
    store.reset();
    f.reset();
    tick();
    assert.ok(item("水晶展示柜门").o.rotation.y > -0.001);
    assert.ok(item("翡翠绿天鹅绒窗帘").o.scale.x < 0.24);
    assert.equal(get("emerald-sofa").position.y, y);
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
