import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { traceTeleport, teleportOffset } from "../src/xr-teleport.js";
import { createWalkMap } from "../src/xr-navigation.js";
import { createXRWeather } from "../src/xr-weather.js";

test("teleport arc rejects furniture, walls, hidden obstacles and outside landings", () => {
  const origin = new THREE.Vector3(0, 1.2, 3);
  const direction = new THREE.Vector3(0, -0.6, -1).normalize();
  const open = traceTeleport(origin, direction, [], createWalkMap([]));
  assert.equal(open.valid, true);
  assert.equal(open.target.y, 0);
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(10, 4, 0.2),
    new THREE.MeshBasicMaterial(),
  );
  wall.position.set(0, 2, 2.5);
  wall.updateMatrixWorld(true);
  const stop = traceTeleport(origin, direction, [wall], createWalkMap([wall]));
  assert.equal(stop.valid, false);
  assert.ok(stop.target.z > 2.5);
  wall.visible = false;
  assert.equal(
    traceTeleport(origin, direction, [wall], createWalkMap([wall])).valid,
    true,
  );
  const furniture = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.5, 3),
    new THREE.MeshBasicMaterial(),
  );
  furniture.position.set(0, 0.25, 1);
  furniture.updateMatrixWorld(true);
  assert.equal(
    traceTeleport(origin, direction, [furniture], createWalkMap([furniture]))
      .valid,
    false,
  );
  assert.equal(
    traceTeleport(origin, new THREE.Vector3(0, 0, 1), [], createWalkMap([]))
      .valid,
    false,
  );
});

test("teleport translation preserves tracked eye height and real-world offset", () => {
  const rig = new THREE.Vector3(1, 0, 2);
  const head = new THREE.Vector3(1.3, 1.65, 2.4);
  const target = new THREE.Vector3(-2, 0.06, -1);
  const delta = teleportOffset(head, target);
  const newHead = head.clone().add(delta);
  assert.equal(delta.y, 0);
  assert.ok(Math.abs(newHead.x - target.x) < 1e-8);
  assert.ok(Math.abs(newHead.z - target.z) < 1e-8);
  assert.equal(newHead.y, 1.65);
  assert.equal(rig.clone().add(delta).y, 0);
});

test("XR weather is spatial and respects mode, daylight and session visibility", () => {
  const weather = createXRWeather();
  const view = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 3),
    new THREE.MeshBasicMaterial({ map: new THREE.Texture() }),
  );
  view.name = "test-window-view";
  view.position.set(-5, 2, 0);
  view.rotation.y = Math.PI / 2;
  const painting = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), view.material);
  painting.position.set(1, 2, -5);
  weather.bind([view, painting]);
  assert.equal(
    weather.root.children.length,
    1,
    "weather matches the window, not wall art or niches",
  );
  weather.update(0.016, { weather: "rain", day: false }, true);
  assert.equal(weather.root.visible, true);
  const material = weather.root.children[0].material;
  weather.update(0.016, { weather: "snow", day: true }, true);
  assert.equal(material.uniforms.snow.value, 1);
  assert.equal(material.uniforms.daylight.value, 1);
  weather.update(0.016, { weather: "clear" }, true);
  assert.equal(weather.root.visible, false);
  weather.update(0.016, { weather: "snow" }, false);
  assert.equal(weather.root.visible, false);
});
