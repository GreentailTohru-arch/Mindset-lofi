import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { createWalkMap, deadzone } from "../src/xr-navigation.js";

test("walking avoids furniture, slides along obstacles and cannot tunnel outside", () => {
  const obstacle = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 3),
    new THREE.MeshBasicMaterial(),
  );
  obstacle.position.set(0, 0.5, 0);
  const map = createWalkMap([obstacle]);
  assert.equal(map.free(0, 0), false);
  const start = new THREE.Vector3(-2, 0, 0);
  const stop = map.move(start, new THREE.Vector3(9, 0, 0));
  assert.ok(stop.x < -0.7);
  const slide = map.move(start, new THREE.Vector3(3, 0, 1));
  assert.ok(slide.x < -0.7);
  assert.ok(slide.z > 0.8);
  const edge = map.move(
    new THREE.Vector3(3, 0, 3),
    new THREE.Vector3(40, 0, 40),
  );
  assert.ok(edge.x <= 4.3 && edge.z <= 4.3);
  assert.ok(map.free(map.spawn().x, map.spawn().z));
});

test("rugs and overhead lights do not block walking; occupied rooms have no spawn", () => {
  const rug = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.08, 10),
    new THREE.MeshBasicMaterial(),
  );
  const lamp = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1, 10),
    new THREE.MeshBasicMaterial(),
  );
  lamp.position.y = 3;
  assert.ok(createWalkMap([rug, lamp]).free(0, 0));
  const solid = new THREE.Mesh(
    new THREE.BoxGeometry(10, 2, 10),
    new THREE.MeshBasicMaterial(),
  );
  assert.equal(createWalkMap([solid]).spawn(), null);
  assert.equal(deadzone(0.1), 0);
  assert.equal(deadzone(-1), -1);
});
