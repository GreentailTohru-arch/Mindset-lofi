import * as THREE from "three";
import { damp } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const hemi = new THREE.HemisphereLight("#c5c5d5", "#8b7460", 1.75);
  const sun = new THREE.DirectionalLight("#a9b2e2", 1.5);
  sun.position.set(-6, 7, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 1,
    far: 25,
  });
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.022;
  sun.shadow.radius = 5;
  sun.shadow.blurSamples = 8;
  scene.add(hemi, sun);
  const lights = furniture.lamps.map((l) => {
    const light = l.power
      ? new THREE.PointLight("#ffc17a", l.power, 4, 2)
      : null;
    if (light) {
      light.position.set(...l.pos);
      scene.add(light);
    }
    return { ...l, light };
  });
  const fill = new THREE.SpotLight("#f4d1a2", 5, 12, 1, 0.95, 2);
  fill.position.set(0, 5, 1);
  scene.add(fill, fill.target);
  const color = new THREE.Color();
  return {
    whiteLight: fill,
    fixtures: lights,
    update(dt) {
      hemi.intensity = damp(hemi.intensity, store.state.day ? 2 : 1.75, dt);
      sun.intensity = damp(sun.intensity, store.state.day ? 2 : 1.5, dt);
      sun.color.lerp(
        color.set(store.state.day ? "#f9dbad" : "#a9b2e2"),
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
          store.state[l.key] ? 1.2 : 0,
          dt,
        );
      }
      fill.intensity = damp(
        fill.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 40 : 0,
        dt,
      );
      fill.color.lerp(
        color.set(
          { 2700: "#f4d1a2", 4000: "#e7dccc", 6000: "#cbd4e6" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 3),
      );
    },
  };
}
