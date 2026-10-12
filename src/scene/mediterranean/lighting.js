import * as THREE from "three";
import { damp, rgbEnvelope } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const sky = new THREE.HemisphereLight("#c3d6e2", "#b19980", 1.65);
  scene.add(sky);
  const sun = new THREE.DirectionalLight("#ffdab0", 1.95);
  sun.position.set(-6, 7, 1);
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
  sun.shadow.normalBias = 0.025;
  sun.shadow.bias = -0.0003;
  sun.shadow.radius = 5;
  sun.shadow.blurSamples = 8;
  scene.add(sun);
  const right = new THREE.PointLight("#ffdeb6", 7, 6, 2);
  right.position.set(2.1, 2.65, -3.9);
  scene.add(right);
  const lamps = furniture.lamps.map((l) => {
    const light = l.power
      ? new THREE.PointLight("#ffd199", l.power, 3.4, 2)
      : null;
    if (light) {
      light.position.set(...l.pos);
      scene.add(light);
    }
    return { ...l, light };
  });
  const white = new THREE.SpotLight("#eedfc7", 4, 9, 1, 0.95, 2);
  white.position.set(0, 4.5, 1);
  white.target.position.set(0, 0, 1);
  scene.add(white, white.target);
  const accent = new THREE.PointLight("#819ba9", 0, 2.5, 2);
  accent.position.set(2, 0.5, 2);
  scene.add(accent);
  const color = new THREE.Color();
  return {
    whiteLight: white,
    fixtures: lamps,
    update(dt, t) {
      sky.intensity = damp(sky.intensity, store.state.day ? 1.65 : 0.8, dt);
      sun.intensity = damp(sun.intensity, store.state.day ? 1.95 : 0.7, dt);
      sun.color.lerp(
        color.set(store.state.day ? "#ffdab0" : "#9bb3d3"),
        1 - Math.exp(-dt * 2),
      );
      right.intensity = damp(right.intensity, store.state.day ? 7 : 1.5, dt);
      for (const l of lamps) {
        if (l.light)
          l.light.intensity = damp(
            l.light.intensity,
            store.state[l.key] ? l.power : 0,
            dt,
          );
        l.shade.emissiveIntensity = damp(
          l.shade.emissiveIntensity,
          store.state[l.key] ? 0.55 : 0,
          dt,
        );
      }
      white.intensity = damp(
        white.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 12 : 0,
        dt,
      );
      white.color.lerp(
        color.set(
          { 2700: "#eedfc7", 4000: "#e4e3dd", 6000: "#d1dfea" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 3),
      );
      accent.color.set(store.state.rgbColor);
      accent.intensity = damp(
        accent.intensity,
        store.state.rgbBrightness *
          0.5 *
          rgbEnvelope(store.state.rgbMode, t * (0.2 + store.state.rgbSpeed)),
        dt,
      );
    },
  };
}
