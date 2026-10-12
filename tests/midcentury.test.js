import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";

test("Mid-century reference zones, window aperture and independent furniture interactions", () => {
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
    const p = scenePresets.midcentury,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (o, name, hint, action) => items.push({ o, name, action });
    const m = p.createMaterials(),
      room = p.createRoom(scene, m, store, register),
      f = p.createFurniture(scene, m, store, register),
      light = p.createLighting(scene, store, f);
    const get = (name) => {
      const o = scene.getObjectByName("midcentury-" + name);
      assert.ok(o, name);
      return o;
    };
    const item = (name) => {
      const i = items.find((x) => x.name === name);
      assert.ok(i, name);
      return i;
    };
    const tick = () => {
      for (let i = 0; i < 100; i++) {
        room.update(0.05);
        f.update(0.05);
        light.update(0.05);
      }
      scene.updateMatrixWorld(true);
    };
    tick();
    assert.equal(resolveScene("?scene=midcentury"), "midcentury");
    assert.equal(p.label, "中古风");
    assert.equal(text, 0);
    assert.ok(!items.some((i) => /唱机|音箱|显示器|耳机/.test(i.name)));
    assert.ok(get("writing-desk").position.x < -4);
    assert.ok(
      get("rear-bookcase").position.z < -4 &&
        get("rear-bookcase").position.x < 0,
    );
    assert.ok(
      get("walnut-sideboard").position.z < -4 &&
        get("walnut-sideboard").position.x > 2,
    );
    assert.ok(get("curved-sofa").position.z < get("kidney-table").position.z);
    assert.ok(
      get("swivel-chair").position.x < -2 &&
        get("leather-chair").position.x > 2,
    );
    assert.ok(get("rust-ottoman").position.z > get("kidney-table").position.z);
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-4, 2, -1),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(
      ray.intersectObject(get("window-wall")).length,
      0,
      "Window is a real opening",
    );
    const slat = get("blinds").children.find(
        (o) => o.geometry?.parameters?.width === 6.12,
      ),
      open = slat.rotation.x;
    item("胡桃木百叶窗").action();
    tick();
    assert.ok(slat.rotation.x < open - 0.9);
    item("餐边柜抽屉").action();
    item("书桌抽屉").action();
    item("胡桃木收纳柜门").action();
    tick();
    assert.ok(item("餐边柜抽屉").o.position.z > 0.7);
    assert.ok(item("书桌抽屉").o.position.z > 0.7);
    assert.ok(item("胡桃木收纳柜门").o.rotation.y < -1);
    const y = get("curved-sofa").position.y;
    item("橄榄绿弧形沙发").action();
    f.update(0.12);
    assert.ok(get("curved-sofa").position.y > y);
    item("书桌黄铜台灯").action();
    tick();
    assert.equal(store.state.floorLamp, true);
    assert.equal(store.state.rgbMode, "off");
    assert.ok(
      f.lamps
        .filter((l) => l.key === "bedLamp")
        .every((l) => l.shade.emissiveIntensity < 0.001),
    );
    assert.equal(
      scene.children.filter((o) => o.isLight && o.castShadow).length,
      1,
    );
    assert.equal(f.lamps.length, 4);
    store.reset();
    f.reset();
    tick();
    assert.equal(get("curved-sofa").position.y, y);
    assert.ok(Math.abs(slat.rotation.x - open) < 0.001);
    assert.equal(item("书桌抽屉").o.position.z, 0.46);
    scene.traverse((o) => {
      assert.ok(o.matrixWorld.elements.every(Number.isFinite));
      if (o.geometry)
        assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));
    });
  } finally {
    globalThis.document = previous;
  }
});
