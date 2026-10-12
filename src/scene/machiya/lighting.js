import * as THREE from "three";
import { damp, rgbEnvelope } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const sky = new THREE.HemisphereLight("#becbd9", "#aa9071", 1.25);
  scene.add(sky);
  const moon = new THREE.DirectionalLight("#b0c6e6", 1.25);
  moon.position.set(-4, 7, 2);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  Object.assign(moon.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 1,
    far: 25,
  });
  moon.shadow.normalBias = 0.025;
  moon.shadow.bias = -0.0004;
  moon.shadow.radius = 4;
  moon.shadow.blurSamples = 8;
  scene.add(moon);
  const lamps = furniture.lamps.map((l) => {
    const light =
      l.power > 0
        ? new THREE.PointLight("#ffd499", l.power, l.range || 3.4, 2)
        : null;
    if (light) {
      light.position.set(...l.pos);
      scene.add(light);
    }
    return { ...l, light };
  });
  const white = new THREE.SpotLight("#edd4ab", 4, 9, 1, 0.85, 2);
  white.position.set(1, 4, 1);
  white.target.position.set(0.2, 0, -1);
  scene.add(white, white.target);
  const green = new THREE.PointLight("#839879", 0.45, 3.5, 2);
  green.position.set(-3.2, 0.85, 0.6);
  scene.add(green);
  const accent = new THREE.PointLight("#a8b8cf", 0, 2.5, 2);
  accent.position.set(2, 0.9, -3.3);
  scene.add(accent);
  const color = new THREE.Color();
  return {
    whiteLight: white,
    fixtures: lamps,
    update(dt, t) {
      sky.intensity = damp(sky.intensity, store.state.day ? 1.65 : 1.4, dt);
      moon.color.lerp(
        color.set(store.state.day ? "#eadfc3" : "#b0c6e6"),
        1 - Math.exp(-dt * 2),
      );
      moon.intensity = damp(moon.intensity, store.state.day ? 1.65 : 1.25, dt);
      lamps.forEach((l) => {
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
      });
      white.intensity = damp(
        white.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 12 : 0,
        dt,
      );
      white.color.lerp(
        color.set(
          { 2700: "#edd4ab", 4000: "#e5e0d2", 6000: "#cedbea" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 3),
      );
      accent.color.set(store.state.rgbColor);
      accent.intensity = damp(
        accent.intensity,
        0.6 *
          store.state.rgbBrightness *
          rgbEnvelope(store.state.rgbMode, t * (0.2 + store.state.rgbSpeed)),
        dt,
      );
    },
  };
}
