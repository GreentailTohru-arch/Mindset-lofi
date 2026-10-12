import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { scenePresets, resolveScene } from "../src/scene/presets.js";
import { createStore } from "../src/state.js";
test("French salon preserves reference zones, valid outward sofa geometry and independent interactions", () => {
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
    const p = scenePresets.french,
      store = createStore(p.settings),
      scene = new THREE.Scene(),
      items = [];
    const register = (o, name, hint, action) => items.push({ o, name, action });
    const m = p.createMaterials(),
      room = p.createRoom(scene, m, store, register),
      f = p.createFurniture(scene, m, store, register),
      l = p.createLighting(scene, store, f);
    const get = (n) => {
      const o = scene.getObjectByName("french-" + n);
      assert.ok(o, n);
      return o;
    };
    const item = (n) => {
      const i = items.find((x) => x.name === n);
      assert.ok(i, n);
      return i;
    };
    const tick = () => {
      for (let i = 0; i < 120; i++) {
        room.update(0.05);
        f.update(0.05, i * 0.05);
        l.update(0.05);
      }
      scene.updateMatrixWorld(true);
    };
    tick();
    assert.equal(resolveScene("?scene=french"), "french");
    assert.equal(p.label, "法式复古");
    assert.equal(text, 0);
    assert.ok(!items.some((x) => /唱机|音箱|耳机|显示器/.test(x.name)));
    assert.ok(get("writing-desk").position.x < -3.5);
    assert.ok(get("arched-bookcase").position.z < -3);
    assert.ok(get("cream-sideboard").position.x < 0);
    assert.ok(get("candle-fireplace").position.x > 0);
    assert.ok(get("curved-sofa").position.z < get("marble-table").position.z);
    const sofaBounds = new THREE.Box3().setFromObject(get("curved-sofa"), true);
    const tableBounds = new THREE.Box3().setFromObject(
      get("marble-table"),
      true,
    );
    assert.equal(
      get("curved-sofa").position.x,
      get("marble-table").position.x,
      "Sofa and oval table share the seating axis",
    );
    assert.ok(
      tableBounds.min.z - sofaBounds.max.z > 0.55,
      "Curved sofa arms leave at least 55 cm of clearance behind the coffee table",
    );
    for (const name of ["rose-armchair", "sage-armchair", "lamp-side-table"])
      assert.ok(
        !tableBounds.intersectsBox(
          new THREE.Box3().setFromObject(get(name), true),
        ),
        `Coffee table remains clear of ${name}`,
      );
    for (const name of [
      "rose-armchair",
      "sage-armchair",
      "writing-desk",
      "candle-fireplace",
    ])
      assert.ok(
        !sofaBounds.intersectsBox(
          new THREE.Box3().setFromObject(get(name), true),
        ),
        `Shifted sofa remains clear of ${name}`,
      );
    assert.ok(get("rose-armchair").position.z > get("marble-table").position.z);
    assert.ok(get("sage-armchair").position.x > 2);
    assert.ok(get("gilded-mirror").children.some((o) => o.isReflector));
    const ray = new THREE.Raycaster(
      new THREE.Vector3(-4, 2, 0.2),
      new THREE.Vector3(-1, 0, 0),
    );
    assert.equal(ray.intersectObject(get("window-wall")).length, 0);
    const sofa = get("curved-sofa"),
      shell = sofa.children.find(
        (o) => o.geometry?.attributes?.position?.count === 1539,
      );
    assert.ok(shell);
    const normal = shell.geometry.attributes.normal;
    assert.ok(normal.getZ(40 * 19) < -0.8, "Swept upholstery points outward");
    const y = sofa.position.y;
    item("奶油白弧形沙发").action();
    f.update(0.12);
    assert.ok(sofa.position.y > y);
    item("米白亚麻纱帘").action();
    item("奶油书柜门").action();
    item("壁炉烛光").action();
    tick();
    assert.ok(item("米白亚麻纱帘").o.scale.x > 0.99);
    assert.ok(item("奶油书柜门").o.rotation.y < -1);
    assert.equal(store.state.bedLamp, true);
    assert.ok(
      f.lamps
        .filter((x) => x.key === "floorLamp")
        .every((x) => x.shade.emissiveIntensity < 0.001),
    );
    assert.equal(
      scene.children.filter((o) => o.isLight && o.castShadow).length,
      1,
    );
    assert.equal(f.lamps.filter((x) => x.power > 0).length, 3);
    store.reset();
    f.reset();
    tick();
    assert.equal(sofa.position.y, y);
    assert.ok(item("米白亚麻纱帘").o.scale.x < 0.27);
    assert.equal(store.state.floorLamp, true);
    scene.traverse((o) => {
      assert.ok(o.matrixWorld.elements.every(Number.isFinite));
      if (o.geometry)
        assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));
    });
  } finally {
    globalThis.document = old;
  }
});
