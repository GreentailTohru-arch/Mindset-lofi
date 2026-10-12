import * as THREE from "three";
import { damp, rgbEnvelope } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const ambient = new THREE.HemisphereLight("#f5f6ff", "#b7adb1", 1.15);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight("#fff2df", 1.3);
  sun.position.set(-3, 8, 4);
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
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 5;
  sun.shadow.blurSamples = 8;
  scene.add(sun);
  const lamps = furniture.lamps.map((l) => {
    const light = l.power
      ? new THREE.PointLight(l.shade.emissive, l.power, 3, 2)
      : null;
    if (light) {
      light.position.set(...l.pos);
      scene.add(light);
    }
    return { ...l, light };
  });
  const white = new THREE.DirectionalLight("#ffffff", 0.7);
  white.position.set(4, 5, 5);
  scene.add(white);
  const accent = new THREE.PointLight("#ffa3c9", 0, 3, 2);
  accent.position.set(1, 1, -2);
  scene.add(accent);
  return {
    whiteLight: white,
    fixtures: lamps,
    update(dt, t = 0) {
      ambient.intensity = damp(
        ambient.intensity,
        store.state.day ? 1.15 : 0.75,
        dt,
      );
      sun.intensity = damp(sun.intensity, store.state.day ? 1.3 : 0.5, dt);
      sun.color.set(store.state.day ? "#fff2df" : "#becafb");
      white.intensity = damp(
        white.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 2 : 0,
        dt,
      );
      white.color.set(
        { 2700: "#ffe4c8", 4000: "#fff6ec", 6000: "#e2ecff" }[
          store.state.whiteTemp
        ],
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
          store.state[l.key] ? 0.6 : 0,
          dt,
        );
      }
      accent.color.set(store.state.rgbColor);
      accent.intensity = damp(
        accent.intensity,
        store.state.rgbBrightness * 0.5 * rgbEnvelope(store.state.rgbMode, t),
        dt,
      );
    },
  };
}
