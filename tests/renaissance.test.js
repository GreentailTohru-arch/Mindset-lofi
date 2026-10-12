import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { createParquetGeometry } from "../src/scene/renaissance/parquet.js";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";

test("herringbone floor stays square, covers the room and faces upward", () => {
  const geo = createParquetGeometry(),
    p = geo.attributes.position,
    n = geo.attributes.normal;
  let area = 0;
  for (let i = 0; i < p.count; i++) {
    assert.ok(Number.isFinite(p.getX(i)) && Math.abs(p.getX(i)) <= 5.00001);
    assert.ok(Number.isFinite(p.getZ(i)) && Math.abs(p.getZ(i)) <= 5.00001);
    assert.ok(n.getY(i) > 0.99);
  }
  for (let i = 0; i < p.count; i += 3) {
    area +=
      Math.abs(
        (p.getX(i + 1) - p.getX(i)) * (p.getZ(i + 2) - p.getZ(i)) -
          (p.getX(i + 2) - p.getX(i)) * (p.getZ(i + 1) - p.getZ(i)),
      ) / 2;
  }
  assert.ok(area > 93 && area < 99, `Plank coverage including seams: ${area}`);
  geo.dispose();
});

test("American country layout, furniture interactions and lighting survive reset", () => {
  const previous = globalThis.document;
  const ctx = new Proxy(
    {},
    {
      get(target, key) {
        if (key in target) return target[key];
        if (key === "createLinearGradient")
          return () => ({ addColorStop() {} });
        return () => {};
      },
    },
  );
  globalThis.document = {
    createElement: () => ({ width: 0, height: 0, getContext: () => ctx }),
  };
  try {
    assert.equal(resolveScene("?scene=renaissance"), "renaissance");
    const preset = scenePresets.renaissance,
      store = createStore(preset.settings),
      scene = new THREE.Scene(),
      items = [];
    assert.equal(preset.label, "美式田园");
    const register = (object, name, hint, action) =>
      items.push({ object, name, action });
    const m = preset.createMaterials(),
      room = preset.createRoom(scene, m, store, register),
      furniture = preset.createFurniture(scene, m, store, register),
      lighting = preset.createLighting(scene, store, furniture, register);
    for (const name of [
      "乡村多格窗",
      "薄纱窗帘",
      "家庭实木餐桌",
      "书柜抽屉",
      "黄铜银行台灯",
    ]) {
      const item = items.find((e) => e.name === name);
      assert.ok(item, name);
      assert.equal(typeof item.action(), "string");
    }
    assert.equal(store.state.window, true);
    assert.equal(store.state.curtains, false);
    assert.equal(store.state.drawer, true);
    assert.equal(store.state.rgbMode, "off");
    assert.equal(store.state.day, true);
    assert.ok(!items.some((item) => /唱片|黑胶|音箱|显示器/.test(item.name)));
    const chairs = furniture.root.children.filter(
      (o) => o.name === "country-dining-chair",
    );
    assert.equal(chairs.length, 4);
    const dining = scene.getObjectByName("country-dining-table");
    const sofa = scene.getObjectByName("country-sofa");
    const coffee = scene.getObjectByName("country-coffee-table");
    const desk = scene.getObjectByName("country-writing-desk");
    const console = scene.getObjectByName("country-sofa-console");
    assert.ok(
      dining.position.x > 2 && dining.position.z < 0,
      "Dining stays at the right middle",
    );
    assert.ok(
      sofa.position.z > coffee.position.z &&
        console.position.z > sofa.position.z,
      "Foreground sofa faces the coffee table with console behind",
    );
    assert.ok(
      desk.position.x > 2 && desk.position.z > 2,
      "Writing desk stays in the right foreground",
    );
    const sofaItem = items.find((e) => e.name === "美式皮革大沙发");
    const restY = sofa.position.y;
    sofaItem.action();
    furniture.update(0.1, 0.1);
    assert.ok(
      sofa.position.y > restY && sofa.position.y < restY + 0.03,
      "Click gently lifts the sofa",
    );
    for (let i = 0; i < 30; i++) {
      room.update(0.05, i * 0.05);
      furniture.update(0.05, i * 0.05);
      lighting.update(0.05, i * 0.05);
    }
    scene.updateMatrixWorld(true);
    scene.traverse((obj) => {
      assert.ok(obj.matrixWorld.elements.every(Number.isFinite));
      if (obj.geometry)
        assert.ok(
          obj.geometry.attributes.position.array.every(Number.isFinite),
        );
    });
    assert.equal(
      scene.children.filter((obj) => obj.isLight && obj.castShadow).length,
      1,
    );
    store.reset();
    furniture.reset();
    assert.equal(store.state.window, false);
    assert.equal(store.state.drawer, false);
    assert.equal(store.state.floorLamp, true);
    assert.equal(store.state.rgbMode, "off");
    assert.equal(store.state.day, true);
    assert.equal(sofa.position.y, restY);
  } finally {
    globalThis.document = previous;
  }
});
