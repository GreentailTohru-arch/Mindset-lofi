import * as THREE from "three";
import { damp } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const hemi = new THREE.HemisphereLight("#f1efdf", "#b3a18b", 1.65);
  const sun = new THREE.DirectionalLight("#fff0d4", 1.8);
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
  sun.shadow.normalBias = 0.018;
  sun.shadow.radius = 5;
  sun.shadow.blurSamples = 8;
  scene.add(hemi, sun);
  const lights = furniture.lamps.map((l) => {
    const light = l.power
      ? new THREE.PointLight("#ffcf91", l.power, 3.2, 2)
      : null;
    if (light) {
      light.position.set(...l.pos);
      scene.add(light);
    }
    return { ...l, light };
  });
  const fill = new THREE.SpotLight("#f5e7d3", 5, 10, 1, 0.95, 2);
  fill.position.set(0, 5, 0);
  scene.add(fill, fill.target);
  const color = new THREE.Color();
  return {
    whiteLight: fill,
    fixtures: lights,
    update(dt) {
      hemi.intensity = damp(hemi.intensity, store.state.day ? 1.65 : 0.8, dt);
      sun.intensity = damp(sun.intensity, store.state.day ? 1.8 : 0.65, dt);
      sun.color.lerp(
        color.set(store.state.day ? "#fff0d4" : "#b4c5dc"),
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
          store.state[l.key] ? 0.65 : 0,
          dt,
        );
      }
      fill.intensity = damp(
        fill.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 12 : 0,
        dt,
      );
      fill.color.lerp(
        color.set(
          { 2700: "#f5e7d3", 4000: "#eeeae1", 6000: "#d7e1ed" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 3),
      );
    },
  };
}
