import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";
test("Eastern aesthetics preserves its layered layout, real niche and independent interactions", () => {
  const old = globalThis.document;
  let letters = 0;
  const ctx = new Proxy(
    {},
    {
      get(o, k) {
        if (k in o) return o[k];
        if (k === "fillText" || k === "strokeText") return () => letters++;
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
    assert.equal(resolveScene("?scene=dongfang"), "dongfang");
    const p = scenePresets.dongfang,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const reg = (object, name, hint, action) =>
      items.push({ object, name, action });
    const m = p.createMaterials(),
      room = p.createRoom(scene, m, store, reg),
      f = p.createFurniture(scene, m, store, reg),
      lights = p.createLighting(scene, store, f, reg);
    const get = (name) => {
      const item = items.find((i) => i.name === name);
      assert.ok(item, name);
      return item;
    };
    const tick = () => {
      for (let i = 0; i < 160; i++) {
        room.update(0.05, i * 0.05);
        f.update(0.05, i * 0.05);
        lights.update(0.05, i * 0.05);
      }
      scene.updateMatrixWorld(true);
    };
    tick();
    const floorRay = new THREE.Raycaster(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, -1, 0),
    );
    assert.equal(
      floorRay.intersectObjects([
        scene.getObjectByName("dongfang-walnut-floor"),
        scene.getObjectByName("dongfang-beveled-base"),
      ])[0].object.name,
      "dongfang-walnut-floor",
      "the visible walnut floor must sit above the beveled base",
    );
    assert.equal(p.label, "东方美学");
    assert.equal(letters, 0);
    assert.equal(store.state.rgbMode, "off");
    assert.ok(scene.getObjectByName("dongfang-window-bench").position.x < -4);
    assert.ok(
      scene.getObjectByName("dongfang-raised-tea-platform").position.x > 2,
    );
    assert.ok(
      scene.getObjectByName("dongfang-raised-tea-platform").position.z < -2,
    );
    assert.ok(scene.getObjectByName("dongfang-sofa").position.z > 3);
    assert.ok(
      scene.getObjectByName("dongfang-foreground-cabinet").position.x < -2,
    );
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-3.48, 2.6, -4),
      new THREE.Vector3(0, 0, -1),
    );
    assert.equal(
      ray.intersectObject(scene.getObjectByName("dongfang-recessed-wall"))
        .length,
      0,
      "moon niche is cut through the wall face",
    );
    assert.ok(!items.some((i) => /音箱|唱机|转盘|电视|显示器/.test(i.name)));
    get("米白纱帘").action();
    get("书柜柜门 1").action();
    get("窗边柜抽屉").action();
    get("水景纸灯").action();
    assert.match(get("中央茶具").action(), /热气/);
    assert.match(get("方形石水钵").action(), /涟漪/);
    tick();
    assert.ok(get("米白纱帘").object.scale.x > 0.99);
    assert.ok(get("书柜柜门 1").object.rotation.y < -1);
    assert.ok(get("窗边柜抽屉").object.position.z > 0.27);
    assert.equal(store.state.whiteOn, true);
    assert.ok(
      f.lamps
        .filter((l) => l.key === "bedLamp")
        .every((l) => l.shade.emissiveIntensity < 0.001),
    );
    assert.ok(
      f.lamps
        .filter((l) => l.key === "floorLamp")
        .every((l) => l.shade.emissiveIntensity > 0.579),
    );
    const seat = get("圆形藤编坐墩"),
      y = seat.object.position.y;
    seat.action();
    f.update(0.375, 0);
    assert.ok(seat.object.position.y > y + 0.039);
    f.update(0.375, 0.375);
    assert.ok(Math.abs(seat.object.position.y - y) < 0.001);
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
    store.reset();
    f.reset();
    tick();
    assert.ok(get("米白纱帘").object.scale.x < 0.231);
    assert.ok(Math.abs(get("书柜柜门 1").object.rotation.y) < 0.001);
    assert.ok(get("窗边柜抽屉").object.position.z < 0.031);
    assert.equal(store.state.day, false);
  } finally {
    globalThis.document = old;
  }
});
