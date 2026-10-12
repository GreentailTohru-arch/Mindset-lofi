import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";

test("Bohemian cutaway keeps its reference zones, real arches and independent interactions", () => {
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
    const p = scenePresets.bohemian,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (o, name, hint, action) => items.push({ o, name, action });
    const m = p.createMaterials(),
      room = p.createRoom(scene, m, store, register),
      f = p.createFurniture(scene, m, store, register),
      l = p.createLighting(scene, store, f);
    const item = (name) => {
      const e = items.find((i) => i.name === name);
      assert.ok(e, name);
      return e;
    };
    const get = (name) => {
      const o = scene.getObjectByName("bohemian-" + name);
      assert.ok(o, name);
      return o;
    };
    const tick = () => {
      for (let i = 0; i < 120; i++) {
        room.update(0.05, i * 0.05);
        f.update(0.05, i * 0.05);
        l.update(0.05, i * 0.05);
      }
      scene.updateMatrixWorld(true);
    };
    tick();
    assert.equal(resolveScene("?scene=bohemian"), "bohemian");
    assert.equal(p.label, "波西米亚");
    assert.equal(text, 0, "All textures are free of readable text");
    assert.ok(!items.some((i) => /音箱|唱机|转盘|显示器/.test(i.name)));
    assert.ok(get("window-bench").position.x < -4);
    assert.ok(
      get("rear-bookcase").position.z < -4 &&
        get("rear-bookcase").position.x < 0,
    );
    assert.ok(
      get("writing-desk").position.x > 1 && get("writing-desk").position.z < -3,
    );
    assert.ok(get("cane-cabinet").position.x > 3);
    assert.ok(get("sofa").position.z < get("carved-coffee-table").position.z);
    assert.ok(
      get("folding-chair").position.x < get("carved-coffee-table").position.x,
    );
    assert.ok(
      get("rattan-lounge").position.x > get("carved-coffee-table").position.x,
    );
    assert.ok(
      get("leather-pouf").position.z > get("carved-coffee-table").position.z,
    );
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-4, 2, -0.6),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(
      ray.intersectObject(get("window-wall")).length,
      0,
      "Window cuts through the wall",
    );
    ray.set(new THREE.Vector3(-4.07, 1.8, -4), new THREE.Vector3(0, 0, -1));
    assert.equal(
      ray.intersectObject(get("niche-wall")).length,
      0,
      "Cactus niche is a real recess",
    );
    ray.set(new THREE.Vector3(0, 1, 4.6), new THREE.Vector3(0, -1, 0));
    assert.equal(
      ray.intersectObjects([get("base"), get("tile-floor")])[0].object,
      get("tile-floor"),
    );
    const restY = get("sofa").position.y;
    item("波西米亚布艺沙发").action();
    f.update(0.12, 0.12);
    assert.ok(
      get("sofa").position.y > restY && get("sofa").position.y < restY + 0.03,
    );
    item("拱形法式窗").action();
    item("米白纱帘").action();
    item("窗边收纳抽屉").action();
    item("书桌抽屉").action();
    item("藤编柜门").action();
    item("书桌黄铜灯").action();
    tick();
    assert.ok(Math.abs(get("window-leaf").rotation.y) > 0.12);
    assert.ok(item("米白纱帘").o.scale.x > 0.99);
    assert.ok(item("窗边收纳抽屉").o.position.z > 0.36);
    assert.ok(item("书桌抽屉").o.position.z > 0.37);
    assert.ok(Math.abs(item("藤编柜门").o.rotation.y) > 1);
    assert.equal(store.state.floorLamp, true);
    assert.equal(store.state.rgbMode, "off");
    assert.ok(
      f.lamps
        .filter((i) => i.key === "bedLamp")
        .every((i) => i.shade.emissiveIntensity < 0.001),
    );
    assert.equal(
      scene.children.filter((o) => o.isLight && o.castShadow).length,
      1,
    );
    assert.ok(f.lamps.filter((i) => i.power > 0).length <= 4);
    store.reset();
    f.reset();
    tick();
    assert.equal(store.state.day, true);
    assert.equal(store.state.wardrobe, false);
    assert.ok(Math.abs(get("window-leaf").rotation.y) < 0.001);
    assert.ok(Math.abs(item("书桌抽屉").o.position.z - 0.04) < 0.001);
    assert.equal(get("sofa").position.y, restY);
    scene.traverse((o) => {
      assert.ok(o.matrixWorld.elements.every(Number.isFinite));
      if (o.geometry)
        assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));
    });
  } finally {
    globalThis.document = previous;
  }
});
