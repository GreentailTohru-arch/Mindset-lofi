import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";

test("Nordic winter window, shade, storage, candles and independent lamps assemble and reset", () => {
  const previous = globalThis.document;
  let textCalls = 0;
  const ctx = new Proxy(
    {},
    {
      get(t, k) {
        if (k in t) return t[k];
        if (k === "fillText" || k === "strokeText") return () => textCalls++;
        if (k === "createLinearGradient" || k === "createRadialGradient")
          return () => ({ addColorStop() {} });
        return () => {};
      },
    },
  );
  globalThis.document = {
    createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }),
  };
  try {
    assert.equal(resolveScene("?scene=nordic"), "nordic");
    const p = scenePresets.nordic,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (object, name, hint, action) =>
      items.push({ object, name, action });
    const m = p.createMaterials(),
      room = p.createRoom(scene, m, store, register),
      furniture = p.createFurniture(scene, m, store, register),
      lighting = p.createLighting(scene, store, furniture);
    const get = (name) => {
      const i = items.find((i) => i.name === name);
      assert.ok(i, name);
      return i;
    };
    const tick = () => {
      for (let i = 0; i < 160; i++) {
        room.update(0.05, i * 0.05);
        furniture.update(0.05, i * 0.05);
        lighting.update(0.05, i * 0.05);
      }
      scene.updateMatrixWorld(true);
    };
    tick();
    assert.equal(textCalls, 0);
    assert.equal(store.state.day, true);
    assert.equal(store.state.rgbMode, "off");
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-4, 2, -0.85),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(
      ray.intersectObject(room.root, true)[0].object.name,
      "winter-cedar-view",
      "opening shows the winter landscape rather than a wall",
    );
    get("亚麻卷帘").action();
    get("窗边收纳抽屉").action();
    get("暖色蜡烛").action();
    get("书桌台灯").action();
    assert.match(get("热茶").action(), /水汽/);
    tick();
    assert.notEqual(
      ray.intersectObject(room.root, true)[0].object.name,
      "winter-cedar-view",
      "closed shade covers opening",
    );
    assert.ok(get("窗边收纳抽屉").object.position.z > 0.839);
    assert.ok(furniture.candles.every((f) => f.material.opacity < 0.001));
    assert.ok(
      furniture.lamps.find((l) => l.key === "bedLamp").shade.emissiveIntensity <
        0.001,
    );
    assert.ok(
      furniture.lamps.find((l) => l.key === "floorLamp").shade
        .emissiveIntensity > 0.499,
    );
    assert.equal(store.state.whiteOn, true);
    const chair = get("橡木书椅").object;
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(
      chair.quaternion,
    );
    assert.ok(
      forward.z < -0.99,
      "desk chair faces its worktop below the right window",
    );
    const rightRay = new THREE.Raycaster(
      new THREE.Vector3(1, 2.4, -4),
      new THREE.Vector3(0, 0, -1),
    );
    store.set("curtains", true);
    tick();
    assert.equal(
      rightRay.intersectObject(room.root, true)[0].object.name,
      "right-winter-view",
    );
    const sofa = get("模块化沙发").object;
    assert.ok(
      sofa.position.x < -1 && sofa.position.z > 0,
      "sofa anchors the front-left lounge",
    );
    const desk = get("简洁书桌").object;
    assert.ok(
      desk.position.x > 0 && desk.position.z < -3.5,
      "desk remains against the right wall",
    );
    const pouf = get("绿色针织脚凳").object;
    const base = pouf.position.y;
    get("绿色针织脚凳").action();
    furniture.update(0.35, 0);
    assert.ok(pouf.position.y > base + 0.05, "click lifts the full object");
    get("绿色针织脚凳").action();
    furniture.update(0.35, 0);
    assert.ok(
      pouf.position.y < base + 0.056,
      "repeated clicks do not accumulate height",
    );
    furniture.update(0.35, 0);
    assert.ok(
      Math.abs(pouf.position.y - base) < 1e-9,
      "lift returns to exact resting height",
    );
    get("绿色针织脚凳").action();
    furniture.update(0.25, 0);
    furniture.reset();
    assert.ok(
      Math.abs(pouf.position.y - base) < 1e-9,
      "reset clears an active lift",
    );
    let plantCount = 0;
    scene.traverse((o) => {
      if (o.userData.nordicPlant) plantCount++;
    });
    assert.ok(
      plantCount >= 15,
      "reference planting is distributed through the room",
    );
    let shadows = 0;
    scene.traverse((o) => {
      assert.ok(o.matrixWorld.elements.every(Number.isFinite));
      if (o.geometry)
        assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));
      if (o.isLight && o.castShadow) shadows++;
    });
    assert.equal(shadows, 1);
    assert.ok(!items.some((i) => /唱片|唱机|音箱|转盘/.test(i.name)));
    get("雪松林窗景").action();
    assert.equal(store.state.day, false);
    store.reset();
    furniture.reset();
    tick();
    assert.equal(store.state.day, true);
    assert.ok(scene.getObjectByName("nordic-window-shade").scale.y < 0.026);
    assert.ok(get("窗边收纳抽屉").object.position.z < 0.471);
    assert.ok(furniture.candles.every((f) => f.material.opacity > 0.75));
    assert.ok(furniture.lamps.every((l) => l.shade.emissiveIntensity > 0.499));
  } finally {
    globalThis.document = previous;
  }
});
