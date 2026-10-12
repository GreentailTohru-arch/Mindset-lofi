import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  pickInteractive,
  pageItems,
  viewPlacement,
} from "../src/xr-spatial.js";
import { createVR } from "../src/xr.js";
import { createStore } from "../src/state.js";

test("XR rays honor occlusion, parent visibility and translucent panes", () => {
  const scene = new THREE.Scene();
  const item = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial(),
  );
  item.position.z = -4;
  const entry = { name: "tea" };
  item.userData.interaction = entry;
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial(),
  );
  wall.position.z = -2;
  const parent = new THREE.Group();
  parent.add(wall);
  scene.add(item, parent);
  const ray = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, 0, -1),
  );
  scene.updateMatrixWorld(true);
  assert.equal(pickInteractive(ray, scene.children), null);
  parent.visible = false;
  assert.equal(pickInteractive(ray, scene.children).entry, entry);
  parent.visible = true;
  wall.material.transparent = true;
  wall.material.opacity = 0.01;
  assert.equal(pickInteractive(ray, scene.children).entry, entry);
  item.visible = false;
  assert.equal(pickInteractive(ray, scene.children), null);
});

test("VR page navigation wraps and seated/standing viewers have equal framing", () => {
  const items = Array.from({ length: 11 }, (_, n) => n);
  assert.deepEqual(pageItems(items, -1, 4).items, [8, 9, 10]);
  assert.deepEqual(pageItems(items, 3, 4).items, [0, 1, 2, 3]);
  assert.equal(pageItems([], 10).pages, 1);
  for (const scale of [3.2, 2.4, 1.65]) {
    const seated = viewPlacement(scale, 1.1),
      standing = viewPlacement(scale, 1.8);
    assert.ok(
      Math.abs(
        seated.position.y + 1.1 * scale - standing.position.y - 1.8 * scale,
      ) < 1e-9,
    );
    assert.ok(
      Math.abs(Math.hypot(seated.position.x, seated.position.z) / scale - 4.4) <
        1e-9,
    );
  }
});

// Simulate session lifecycle and controller events without pretending to test
// headset optics or browser XR compositor behavior on this machine.
test("VR session restores desktop camera and routes controller actions to room state", async () => {
  class Element {
    constructor() {
      this.children = [];
      this.listeners = {};
      this.style = {};
    }
    append(...items) {
      this.children.push(...items);
    }
    addEventListener(name, fn) {
      this.listeners[name] = fn;
    }
    querySelector(selector) {
      return this.childrenBySelector[selector];
    }
    set innerHTML(_) {
      this.childrenBySelector = Object.fromEntries(
        [".xr-support", "[data-enter]", "[data-preview]", "[data-close]"].map(
          (s) => [s, new Element()],
        ),
      );
    }
    getContext() {
      return new Proxy(
        { canvas: this, createLinearGradient: () => ({ addColorStop() {} }) },
        {
          get: (target, key) => (key in target ? target[key] : () => {}),
        },
      );
    }
    close() {}
    showModal() {}
  }
  const documentBefore = globalThis.document,
    windowBefore = globalThis.window;
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "navigator",
  );
  const controlsElement = new Element();
  globalThis.document = {
    createElement: () => new Element(),
    documentElement: { dataset: {} },
    body: new Element(),
    querySelector: () => controlsElement,
  };
  globalThis.window = { isSecureContext: true, addEventListener() {} };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  });
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1.8, 0.1, 65);
    camera.position.set(12, 15, 16);
    camera.lookAt(0, 1.25, 0);
    const before = camera.clone();
    const target = new THREE.Vector3(0, 1.25, 0);
    const controls = { enabled: true, target: target.clone() };
    const xr = new THREE.EventDispatcher();
    const controllers = [new THREE.Group(), new THREE.Group()];
    Object.assign(xr, {
      setReferenceSpaceType() {},
      setFramebufferScaleFactor() {},
      setFoveation() {},
      getController: (i) => controllers[i],
      getCamera: () => camera,
      updateCamera() {},
    });
    camera.cameras = [];
    const canvas = new Element();
    const renderer = { xr, domElement: canvas };
    let enabled = true,
      actions = 0;
    const interaction = {
      registry: [],
      clear() {},
      setEnabled(v) {
        enabled = v;
      },
      activate(e) {
        return e.action();
      },
    };
    const store = createStore();
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshBasicMaterial(),
    );
    const entry = {
      object: cube,
      name: "灯光",
      action: () => {
        actions++;
        store.set("whiteOn", false);
      },
    };
    cube.userData.interaction = entry;
    interaction.registry.push(entry);
    scene.add(cube);
    const otherPreset = {
      label: "测试房间",
      settings: {},
      createMaterials: () => ({}),
      createRoom: () => ({ update() {} }),
      createFurniture: () => ({ update() {}, reset() {} }),
      createLighting: (target) => {
        const light = new THREE.PointLight();
        target.add(light);
        return { whiteLight: light, update() {} };
      },
    };
    const vr = createVR({
      presets: {
        studio: { ...otherPreset, label: "原房间" },
        other: otherPreset,
      },
      scene,
      camera,
      renderer,
      controls,
      interaction,
      store,
      notify() {},
    });
    assert.equal(vr.active, false);
    xr.dispatchEvent({ type: "sessionstart" });
    assert.equal(vr.active, true);
    assert.equal(enabled, false);
    assert.equal(controls.enabled, false);
    const rig = scene.getObjectByName("XR observer rig");
    assert.equal(camera.parent, rig);
    assert.equal(rig.visible, true);
    const panel = rig.children[0].children[0];
    panel.visible = false;
    const controller = controllers[0];
    controller.position.set(0, 1.6, 0);
    controller.quaternion.identity();
    cube.position.copy(rig.localToWorld(new THREE.Vector3(0, 1.6, -2)));
    scene.updateMatrixWorld(true);
    controller.dispatchEvent({ type: "select" });
    assert.equal(actions, 1);
    assert.equal(store.state.whiteOn, false);
    controller.dispatchEvent({ type: "squeezestart" });
    assert.equal(panel.visible, true);
    function useButton(name) {
      let found;
      rig.traverse((o) => {
        if (o.userData.interaction?.name === name)
          found = o.userData.interaction;
      });
      assert.ok(found, name);
      found.action();
    }
    useButton("切换场景");
    useButton("测试房间");
    assert.notEqual(vr.renderScene, scene);
    assert.equal(vr.diagnostics.scene, "other");
    assert.equal(vr.renderScene.getObjectByName("XR observer rig"), rig);
    useButton("走进房间");
    assert.equal(vr.diagnostics.walking, true);
    assert.equal(rig.scale.x, 1);
    useButton("漫游");
    const walkBefore = rig.position.clone();
    useButton("前进一步");
    assert.ok(rig.position.distanceTo(walkBefore) > 0.4);
    assert.equal(vr.diagnostics.wallPanels, true);
    const wall = vr.renderScene.getObjectByName("VR room information walls");
    assert.notEqual(wall.parent, rig);
    let weatherButton;
    wall.traverse((o) => {
      if (o.userData.interaction?.name === "天气 · 晴天")
        weatherButton = o.userData.interaction;
    });
    weatherButton.action();
    vr.update(0.016);
    assert.equal(vr.diagnostics.weather, "rain");
    assert.equal(
      vr.renderScene.getObjectByName("XR window weather").visible,
      true,
    );
    useButton("方式 · 混合移动");
    useButton("舒适传送");
    controller.dispatchEvent({
      type: "connected",
      data: { handedness: "left", gamepad: { axes: [0, 0, 0, -1] } },
    });
    const still = rig.position.clone();
    vr.update(0.05);
    assert.ok(
      rig.position.equals(still),
      "comfort disables continuous stick movement",
    );
    panel.visible = false;
    controller.position.set(-0.6, 1.2, 0);
    controller.rotation.set(-0.65, 0, 0);
    controller.dispatchEvent({ type: "selectstart" });
    assert.equal(vr.diagnostics.teleportValid, true);
    controller.dispatchEvent({ type: "select" });
    assert.ok(rig.position.equals(still), "aim does not move until release");
    controller.dispatchEvent({ type: "selectend" });
    assert.ok(rig.position.distanceTo(still) > 0.5);
    assert.equal(vr.diagnostics.teleportValid, false);
    const beforeStick = rig.position.clone();
    useButton("手柄移动");
    vr.update(0.05);
    assert.ok(rig.position.distanceTo(beforeStick) > 0.04);
    useButton("混合移动");
    controller.dispatchEvent({ type: "selectstart" });
    controller.dispatchEvent({ type: "disconnected" });
    const disconnected = rig.position.clone();
    controller.dispatchEvent({ type: "selectend" });
    assert.ok(
      rig.position.equals(disconnected),
      "disconnect cancels pending teleport",
    );
    useButton("漫游");
    useButton("返回立体展台");
    assert.equal(vr.diagnostics.walking, false);
    assert.equal(wall.visible, false);
    xr.dispatchEvent({ type: "sessionend" });
    assert.equal(vr.renderScene, scene);
    assert.equal(vr.diagnostics.scene, "studio");
    assert.equal(vr.active, false);
    assert.equal(enabled, true);
    assert.equal(controls.enabled, true);
    assert.equal(camera.parent, null);
    assert.equal(rig.visible, false);
    assert.ok(camera.position.equals(before.position));
    assert.ok(camera.quaternion.equals(before.quaternion));
    assert.equal(camera.fov, before.fov);
    assert.equal(camera.near, before.near);
    assert.ok(controls.target.equals(target));
    xr.dispatchEvent({ type: "sessionstart" });
    xr.dispatchEvent({ type: "sessionend" });
    assert.equal(camera.parent, null);
    vr.dispose();
    let homeReturns = 0;
    const homeVR = createVR({
      scene,
      camera,
      renderer,
      controls,
      interaction,
      store,
      notify() {},
      sceneId: "home",
      presets: { home: { label: "首页" }, other: otherPreset },
      home: {
        onHome() {
          homeReturns++;
        },
      },
    });
    xr.dispatchEvent({ type: "sessionstart" });
    assert.equal(homeVR.active, true);
    assert.equal(homeVR.diagnostics.menu, false);
    assert.equal(homeVR.openScene("unknown"), false);
    assert.equal(homeVR.openScene("other"), true);
    assert.equal(homeVR.active, true, "home to room retains the XR session");
    let backHome;
    homeVR.renderScene.traverse((o) => {
      if (o.userData.interaction?.name === "返回首页")
        backHome = o.userData.interaction;
    });
    assert.ok(backHome);
    backHome.action();
    assert.equal(homeReturns, 1);
    assert.equal(homeVR.diagnostics.scene, "home");
    assert.equal(homeVR.renderScene, scene);
    assert.equal(homeVR.active, true);
    assert.equal(homeVR.diagnostics.menu, false);
    homeVR.dispose();
    assert.equal(camera.parent, null);
    xr.dispatchEvent({ type: "sessionstart" });
    assert.equal(
      homeVR.active,
      false,
      "disposed XR listeners do not restart the old home renderer",
    );
  } finally {
    globalThis.document = documentBefore;
    globalThis.window = windowBefore;
    if (navigatorDescriptor)
      Object.defineProperty(globalThis, "navigator", navigatorDescriptor);
    else delete globalThis.navigator;
  }
});
