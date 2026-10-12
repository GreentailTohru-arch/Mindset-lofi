import * as THREE from "three";
import { damp, rgbEnvelope } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const ambient = new THREE.HemisphereLight("#e6e4da", "#9b7c59", 1.5);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight("#ffcf91", 1.9);
  sun.position.set(-5, 7, 1);
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
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 5;
  sun.shadow.blurSamples = 8;
  scene.add(sun);
  const lamps = furniture.lamps.map((l) => {
    const light = l.power
      ? new THREE.PointLight("#ffd09a", l.power, 3.5, 2)
      : null;
    if (light) {
      light.position.set(...l.pos);
      scene.add(light);
    }
    return { ...l, light };
  });
  const fill = new THREE.SpotLight("#efd7b3", 6, 9, 1, 0.96, 2);
  fill.position.set(0, 4.8, 1);
  fill.target.position.set(0, 0, 0);
  scene.add(fill, fill.target);
  const accent = new THREE.PointLight("#aaa18d", 0, 2, 2);
  accent.position.set(2, 0.5, -1);
  scene.add(accent);
  const color = new THREE.Color();
  return {
    whiteLight: fill,
    fixtures: lamps,
    update(dt, t) {
      ambient.intensity = damp(
        ambient.intensity,
        store.state.day ? 1.5 : 0.83,
        dt,
      );
      sun.intensity = damp(sun.intensity, store.state.day ? 1.9 : 0.7, dt);
      sun.color.lerp(
        color.set(store.state.day ? "#ffcf91" : "#a4bfdc"),
        1 - Math.exp(-dt * 2),
      );
      for (const l of lamps) {
        if (l.light)
          l.light.intensity = damp(
            l.light.intensity,
            store.state[l.key] ? l.power : 0,
            dt,
          );
        l.shade.emissiveIntensity = damp(
          l.shade.emissiveIntensity,
          store.state[l.key] ? 0.58 : 0,
          dt,
        );
      }
      fill.intensity = damp(
        fill.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 14 : 0,
        dt,
      );
      fill.color.lerp(
        color.set(
          { 2700: "#efd7b3", 4000: "#e7e3d7", 6000: "#d5e0ec" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 3),
      );
      accent.color.set(store.state.rgbColor);
      accent.intensity = damp(
        accent.intensity,
        store.state.rgbBrightness * 0.4 * rgbEnvelope(store.state.rgbMode, t),
        dt,
      );
    },
  };
}
