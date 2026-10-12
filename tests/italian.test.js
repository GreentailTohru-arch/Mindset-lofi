import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";
test("Italian room preserves its uncluttered layout, clear glazing and independent interactions", () => {
  const previous = globalThis.document;
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
  globalThis.document = {
    createElement: () => ({ width: 0, height: 0, getContext: () => ctx }),
  };
  try {
    const preset = scenePresets.italian,
      store = createStore(preset.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (o, name, hint, action) => items.push({ o, name, action });
    const m = preset.createMaterials(),
      room = preset.createRoom(scene, m, store, register),
      f = preset.createFurniture(scene, m, store, register),
      l = preset.createLighting(scene, store, f);
    const item = (name) => {
      const i = items.find((i) => i.name === name);
      assert.ok(i, name);
      return i;
    };
    const get = (name) => scene.getObjectByName("italian-" + name);
    const tick = () => {
      for (let i = 0; i < 160; i++) {
        room.update(0.05, i * 0.05);
        f.update(0.05, i * 0.05);
        l.update(0.05, i * 0.05);
      }
      scene.updateMatrixWorld(true);
    };
    tick();
    assert.equal(resolveScene("?scene=italian"), "italian");
    assert.equal(preset.label, "意式轻奢");
    assert.equal(text, 0);
    assert.equal(store.state.rgbMode, "off");
    assert.equal(store.state.day, false);
    assert.ok(get("built-in-cabinet").position.x < -2);
    assert.ok(get("floating-desk").position.z < -4);
    assert.ok(get("stone-console").position.x > 3);
    assert.ok(
      get("modular-sofa").position.z < get("stone-coffee-table").position.z,
    );
    assert.ok(get("caramel-chair").position.x < -3);
    assert.ok(get("chocolate-chair").position.z > 3);
    const ray = new THREE.Raycaster(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, -1, 0),
    );
    assert.equal(
      ray.intersectObjects([get("floor"), get("base")])[0].object,
      get("floor"),
    );
    ray.set(new THREE.Vector3(-4, 2, 0), new THREE.Vector3(-1, 0, 0));
    const hits = ray.intersectObject(room.root, true);
    assert.ok(hits.length);
    assert.equal(
      hits[0].object.parent,
      get("floor-window"),
      "glazing is not covered by a hidden wall",
    );
    item("落地米白纱帘").action();
    item("无把手柜门").action();
    item("黑色金属台灯").action();
    tick();
    assert.ok(item("落地米白纱帘").o.scale.x > 0.999);
    assert.ok(item("无把手柜门").o.rotation.y < -1);
    assert.equal(store.state.floorLamp, true);
    assert.equal(store.state.whiteOn, true);
    assert.ok(
      f.lamps
        .filter((l) => l.key === "bedLamp")
        .every((l) => l.shade.emissiveIntensity < 0.001),
    );
    assert.ok(
      f.lamps
        .filter((l) => l.key === "floorLamp")
        .every((l) => l.shade.emissiveIntensity > 0.57),
    );
    const sofa = item("米白模块化沙发"),
      y = sofa.o.position.y;
    sofa.action();
    f.update(0.375);
    assert.ok(sofa.o.position.y > y + 0.034);
    f.update(0.375);
    assert.ok(Math.abs(sofa.o.position.y - y) < 0.001);
    let shadows = 0,
      points = 0;
    scene.traverse((o) => {
      assert.ok(o.matrixWorld.elements.every(Number.isFinite));
      if (o.geometry)
        assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));
      if (o.isLight && o.castShadow) shadows++;
      if (o.isPointLight) points++;
    });
    assert.equal(shadows, 1);
    assert.ok(points <= 5);
    assert.ok(!items.some((i) => /音箱|转盘|唱机|显示器/.test(i.name)));
    store.reset();
    f.reset();
    tick();
    assert.ok(item("落地米白纱帘").o.scale.x < 0.261);
    assert.ok(Math.abs(item("无把手柜门").o.rotation.y) < 0.001);
    assert.equal(store.state.day, false);
  } finally {
    globalThis.document = previous;
  }
});
