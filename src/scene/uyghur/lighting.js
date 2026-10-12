import * as THREE from "three";
import { damp } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const hemi = new THREE.HemisphereLight("#bbb6d3", "#7b5434", 1.2),
    sun = new THREE.DirectionalLight("#a5b4ed", 1.5);
  sun.name = "uyghur-window-light";
  hemi.name = "uyghur-ambient-light";
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
  sun.shadow.normalBias = 0.022;
  sun.shadow.radius = 4;
  sun.shadow.blurSamples = 8;
  scene.add(hemi, sun);
  const lights = furniture.lamps.map((l) => {
    const light = l.power
      ? new THREE.PointLight("#ffbe71", l.power, 4.5, 2)
      : null;
    if (light) {
      light.position.set(...l.pos);
      scene.add(light);
    }
    return { ...l, light };
  });
  const fill = new THREE.DirectionalLight("#efc591", 0.85);
  fill.position.set(3, 6, 5);
  scene.add(fill);
  const color = new THREE.Color();
  return {
    whiteLight: fill,
    fixtures: lights,
    update(dt) {
      hemi.intensity = damp(hemi.intensity, store.state.day ? 1.6 : 0.48, dt);
      sun.intensity = damp(sun.intensity, store.state.day ? 2 : 0.38, dt);
      scene.environmentIntensity = damp(
        scene.environmentIntensity,
        store.state.day ? 0.19 : 0.065,
        dt,
      );
      hemi.color.lerp(
        color.set(store.state.day ? "#d4c9b8" : "#788ab6"),
        1 - Math.exp(-dt * 2),
      );
      sun.color.lerp(
        color.set(store.state.day ? "#f3ce98" : "#a5b4ed"),
        1 - Math.exp(-dt * 2),
      );
      for (const l of lights) {
        if (l.light)
          l.light.intensity = damp(
            l.light.intensity,
            store.state[l.key] ? l.power : 0,
            dt,
          );
        l.shade.emissiveIntensity = damp(
          l.shade.emissiveIntensity,
          store.state[l.key] ? 1.5 : 0,
          dt,
        );
      }
      fill.intensity = damp(
        fill.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 2.5 : 0,
        dt,
      );
      fill.color.lerp(
        color.set(
          Number(store.state.whiteTemp) === 6000
            ? "#bfcbd9"
            : Number(store.state.whiteTemp) === 4000
              ? "#e8decc"
              : "#efc591",
        ),
        1 - Math.exp(-dt * 3),
      );
    },
  };
}
