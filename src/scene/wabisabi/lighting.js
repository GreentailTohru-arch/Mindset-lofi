import * as THREE from "three";
import { damp, rgbEnvelope } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const sky = new THREE.HemisphereLight("#d6dcd9", "#aaa392", 1.65);
  scene.add(sky);
  const day = new THREE.DirectionalLight("#e6e5d9", 0.8);
  day.position.set(-5, 7, 1);
  day.castShadow = true;
  day.shadow.mapSize.set(1024, 1024);
  Object.assign(day.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 1,
    far: 25,
  });
  day.shadow.bias = -0.0004;
  day.shadow.normalBias = 0.035;
  day.shadow.radius = 6;
  day.shadow.blurSamples = 8;
  scene.add(day);
  // Only three local sources supplement daylight; decorative lanterns share emissive state.
  const lamps = furniture.lamps.map((l) => {
    const light = l.power
      ? new THREE.PointLight("#ead0a2", l.power, 3.1, 2)
      : null;
    if (light) {
      light.position.set(...l.pos);
      scene.add(light);
    }
    return { ...l, light };
  });
  const white = new THREE.SpotLight("#e4dfd2", 3, 8, 1, 0.95, 2);
  white.position.set(0, 4.5, 0);
  white.target.position.set(0, 0, 0);
  scene.add(white, white.target);
  const accent = new THREE.PointLight("#a9b3aa", 0, 2, 2);
  accent.position.set(3, 0.6, -3.6);
  scene.add(accent);
  const temp = new THREE.Color();
  scene.fog = new THREE.Fog("#a6aaa2", 38, 70);
  return {
    whiteLight: white,
    fixtures: lamps,
    update(dt, t) {
      sky.intensity = damp(sky.intensity, store.state.day ? 1.5 : 0.9, dt);
      day.intensity = damp(day.intensity, store.state.day ? 0.65 : 0.3, dt);
      day.color.lerp(
        temp.set(store.state.day ? "#cbd4db" : "#aebbc0"),
        1 - Math.exp(-dt * 2),
      );
      lamps.forEach((l) => {
        const on = store.state[l.key] && (!l.candle || l.candle.lit);
        if (l.light)
          l.light.intensity = damp(l.light.intensity, on ? l.power : 0, dt);
        l.shade.emissiveIntensity = damp(
          l.shade.emissiveIntensity,
          on ? 0.42 : 0,
          dt,
        );
      });
      white.intensity = damp(
        white.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 10 : 0,
        dt,
      );
      white.color.lerp(
        temp.set(
          { 2700: "#e8d9bf", 4000: "#e4e2da", 6000: "#d8e1e6" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 3),
      );
      accent.color.lerp(temp.set(store.state.rgbColor), 1 - Math.exp(-dt * 3));
      accent.intensity = damp(
        accent.intensity,
        store.state.rgbBrightness *
          0.4 *
          rgbEnvelope(store.state.rgbMode, t * (0.2 + store.state.rgbSpeed)),
        dt,
      );
    },
  };
}
