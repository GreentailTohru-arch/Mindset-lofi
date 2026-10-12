import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";
test("Mediterranean layout has clear openings, visible tiles and independent resettable interactions", () => {
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
  globalThis.document = {
    createElement: () => ({ width: 0, height: 0, getContext: () => ctx }),
  };
  try {
    const p = scenePresets.mediterranean,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (o, name, hint, action) => items.push({ o, name, action }),
      m = p.createMaterials(),
      room = p.createRoom(scene, m, store, register),
      f = p.createFurniture(scene, m, store, register),
      l = p.createLighting(scene, store, f);
    const item = (name) => {
      const i = items.find((i) => i.name === name);
      assert.ok(i, name);
      return i;
    };
    const tick = () => {
      for (let i = 0; i < 160; i++) {
        room.update(0.05, i * 0.05);
        f.update(0.05, i * 0.05);
        l.update(0.05, i * 0.05);
      }
      scene.updateMatrixWorld(true);
    };
    tick();
    assert.equal(resolveScene("?scene=mediterranean"), "mediterranean");
    assert.equal(p.label, "地中海风");
    assert.equal(text, 0);
    assert.equal(store.state.window, true);
    assert.equal(store.state.day, true);
    assert.equal(store.state.rgbMode, "off");
    const get = (name) => scene.getObjectByName("mediterranean-" + name);
    assert.ok(get("window-bench").position.x < -4);
    assert.ok(get("rear-bookcase").position.x < -3);
    assert.ok(get("writing-desk").position.z < -4);
    assert.ok(get("sofa").position.z < get("limestone-table").position.z);
    assert.ok(get("mosaic-table").position.x > 3);
    const ray = new THREE.Raycaster(
      new THREE.Vector3(2.16, 2, -4),
      new THREE.Vector3(0, 0, -1),
    );
    assert.equal(
      ray.intersectObject(get("recessed-wall")).length,
      0,
      "right window is an actual wall opening",
    );
    ray.set(new THREE.Vector3(-1.125, 2, -4), new THREE.Vector3(0, 0, -1));
    assert.equal(
      ray.intersectObject(get("recessed-wall")).length,
      0,
      "arched niche is recessed",
    );
    ray.set(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0));
    assert.equal(
      ray.intersectObjects([get("terracotta-floor"), get("base")])[0].object,
      get("terracotta-floor"),
    );
    item("蓝绿百叶窗").action();
    item("白色亚麻纱帘").action();
    item("书桌抽屉").action();
    item("书桌台灯").action();
    assert.match(item("书桌咖啡").action(), /热气/);
    tick();
    assert.equal(store.state.window, false);
    assert.ok(item("白色亚麻纱帘").o.scale.x > 0.99);
    assert.ok(item("书桌抽屉").o.position.z > 0.44);
    assert.equal(store.state.floorLamp, true);
    assert.equal(store.state.whiteOn, true);
    assert.equal(store.state.rgbMode, "off");
    assert.ok(
      f.lamps
        .filter((l) => l.key === "bedLamp")
        .every((l) => l.shade.emissiveIntensity < 0.001),
    );
    assert.ok(
      f.lamps
        .filter((l) => l.key === "floorLamp")
        .every((l) => l.shade.emissiveIntensity > 0.54),
    );
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
    assert.ok(points <= 4);
    assert.ok(!items.some((i) => /音箱|转盘|唱机|显示器/.test(i.name)));
    const seat = item("亚麻海岸沙发"),
      y = seat.o.position.y;
    seat.action();
    f.update(0.375, 0);
    assert.ok(seat.o.position.y > y + 0.037);
    f.update(0.375, 0);
    assert.ok(Math.abs(seat.o.position.y - y) < 0.001);
    store.reset();
    f.reset();
    tick();
    assert.equal(store.state.window, true);
    assert.equal(store.state.day, true);
    assert.ok(item("书桌抽屉").o.position.z < 0.081);
    assert.ok(item("白色亚麻纱帘").o.scale.x < 0.251);
  } finally {
    globalThis.document = old;
  }
});
