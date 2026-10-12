import * as THREE from "three";
import { damp } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const hemi = new THREE.HemisphereLight("#c2cfda", "#635b4f", 1.15),
    sun = new THREE.DirectionalLight("#c9d9e5", 2.1);
  sun.position.set(-7, 8, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 1,
    far: 28,
  });
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 4;
  sun.shadow.blurSamples = 8;
  scene.add(hemi, sun);
  const lights = furniture.lamps.map((l) => {
    const light = new THREE.PointLight("#ffc182", l.power, 3.4, 2);
    light.position.set(...l.pos);
    scene.add(light);
    return { ...l, light };
  });
  const fill = new THREE.DirectionalLight("#e6cfb2", 0.5);
  fill.position.set(3, 6, 5);
  scene.add(fill);
  const color = new THREE.Color();
  return {
    whiteLight: fill,
    fixtures: lights,
    update(dt) {
      hemi.intensity = damp(hemi.intensity, store.state.day ? 1.15 : 0.55, dt);
      sun.intensity = damp(sun.intensity, store.state.day ? 2.1 : 0.55, dt);
      for (const l of lights) {
        l.light.intensity = damp(
          l.light.intensity,
          store.state[l.key] ? l.power : 0,
          dt,
        );
        l.shade.emissiveIntensity = damp(
          l.shade.emissiveIntensity,
          store.state[l.key] ? 1.4 : 0,
          dt,
        );
      }
      fill.intensity = damp(
        fill.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 2 : 0,
        dt,
      );
      fill.color.lerp(
        color.set(
          Number(store.state.whiteTemp) === 6000
            ? "#b5c7d9"
            : Number(store.state.whiteTemp) === 4000
              ? "#e2dbcd"
              : "#e6c8a2",
        ),
        1 - Math.exp(-dt * 3),
      );
    },
  };
}
