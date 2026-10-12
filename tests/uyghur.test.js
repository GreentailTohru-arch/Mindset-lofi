import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";
test("Uyghur reference zones, furniture clearance, recessed niches and independent controls", () => {
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
    createElement: () => {
      const palette = [];
      const tracked = new Proxy(
        {},
        {
          get(o, k) {
            return k in o ? o[k] : ctx[k];
          },
          set(o, k, v) {
            o[k] = v;
            if (k === "fillStyle" || k === "strokeStyle") palette.push(v);
            return true;
          },
        },
      );
      return { palette, getContext: () => tracked };
    },
  };
  try {
    const p = scenePresets.uyghur,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (o, name, hint, action) => items.push({ o, name, action });
    const m = p.createMaterials(),
      room = p.createRoom(scene, m, store, register),
      f = p.createFurniture(scene, m, store, register),
      l = p.createLighting(scene, store, f);
    const get = (n) => {
      const o = scene.getObjectByName("uyghur-" + n);
      assert.ok(o, n);
      return o;
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
    assert.equal(resolveScene("?scene=uyghur"), "uyghur");
    assert.equal(p.label, "维吾尔");
    assert.equal(text, 0);
    const view = get("oasis-view"),
      dayMap = view.material.map;
    const windowLight = get("window-light"),
      ambient = get("ambient-light");
    const dayIntensity = windowLight.intensity;
    const indoorBefore = f.lamps.map((x) => x.shade.emissiveIntensity);
    store.set("day", false);
    tick();
    assert.notEqual(view.material.map, dayMap);
    assert.notDeepEqual(
      view.material.map.image.palette,
      dayMap.image.palette,
      "night must render different scenery, not a second daytime texture",
    );
    assert.ok(
      view.material.map.image.palette.includes("#193e59"),
      "night water is dark blue",
    );
    assert.ok(
      view.material.map.image.palette.includes("#e5ac59"),
      "courtyard windows glow at night",
    );
    assert.ok(windowLight.intensity < dayIntensity * 0.25);
    assert.ok(ambient.intensity < 0.55);
    assert.ok(windowLight.color.b > windowLight.color.r, "moonlight is cool");
    f.lamps.forEach((x, i) =>
      assert.ok(
        Math.abs(x.shade.emissiveIntensity - indoorBefore[i]) < 0.001,
        "day/night preserves manual lamp settings",
      ),
    );
    store.set("day", true);
    tick();
    assert.equal(view.material.map, dayMap);
    assert.ok(Math.abs(windowLight.intensity - dayIntensity) < 0.001);

    assert.equal(get("octagonal-top").geometry.parameters.radialSegments, 8);
    const archRay = new THREE.Raycaster(
      new THREE.Vector3(-4, 3.45, 0.89),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(
      archRay
        .intersectObject(get("window-wall"), true)
        .filter((x) => x.object.material === m.wall).length,
      0,
      "arch crown is open",
    );
    const shoulderRay = new THREE.Raycaster(
      new THREE.Vector3(-4, 3.45, 3.39),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.ok(
      shoulderRay
        .intersectObject(get("window-wall"), true)
        .some((x) => x.object.material === m.wall),
      "arch shoulders retain plaster",
    );

    const bounds = (n) => new THREE.Box3().setFromObject(get(n), true),
      sofa = bounds("red-carved-sofa"),
      table = bounds("octagonal-tea-table");
    assert.ok(
      table.min.z - sofa.max.z > 0.3,
      "sofa and table have a clear gap",
    );
    for (const n of [
      "front-left-chair",
      "front-right-chair",
      "embroidered-pouf",
      "lantern-side-table",
    ]) {
      assert.ok(!table.intersectsBox(bounds(n)), n + " clears table");
      assert.ok(!sofa.intersectsBox(bounds(n)), n + " clears sofa");
    }
    assert.ok(get("painted-bookcase").position.x < -2);
    assert.ok(get("writing-desk").position.x > 3);
    assert.ok(get("window-bench").position.x < -4);
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-4, 2, 0.89),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(
      ray
        .intersectObject(get("window-wall"), true)
        .filter((x) => x.object.material === m.wall).length,
      0,
    );
    const nicheRay = new THREE.Raycaster(
      new THREE.Vector3(-0.83, 2.6, -4),
      new THREE.Vector3(0, 0, -1),
    );
    assert.equal(
      nicheRay
        .intersectObject(get("niche-wall"), true)
        .filter((x) => x.object.material === m.wall).length,
      0,
      "niche has a real recessed opening",
    );
    const item = (n) => items.find((x) => x.name === n),
      y = get("red-carved-sofa").position.y;
    item("雕花木坐榻").action();
    f.update(0.13);
    assert.ok(get("red-carved-sofa").position.y > y);
    item("绿洲纱帘").action();
    item("彩绘柜门").action();
    item("铜质书桌灯").action();
    tick();
    assert.equal(store.state.curtains, false);
    assert.ok(item("彩绘柜门").o.position.z > 0.69);
    assert.equal(store.state.bedLamp, false);
    assert.equal(store.state.floorLamp, true);
    item("铜质吊灯").action();
    tick();
    assert.equal(store.state.floorLamp, false);
    store.reset();
    f.reset();
    tick();
    assert.equal(store.state.curtains, true);
    assert.equal(store.state.bedLamp, true);
    assert.equal(get("red-carved-sofa").position.y, y);
    assert.equal(
      scene.children.filter((o) => o.isLight && o.castShadow).length,
      1,
    );
    assert.equal(f.lamps.filter((o) => o.power > 0).length, 4);
    scene.traverse((o) => {
      assert.ok(o.matrixWorld.elements.every(Number.isFinite));
      if (o.geometry)
        assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));
    });
  } finally {
    globalThis.document = old;
  }
});
