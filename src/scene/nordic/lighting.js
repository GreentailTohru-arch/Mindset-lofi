import * as THREE from "three";
import { damp, rgbEnvelope } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const ambient = new THREE.HemisphereLight("#e0e8eb", "#c6baa7", 2);
  scene.add(ambient);
  const winter = new THREE.DirectionalLight("#e5edf0", 1.15);
  winter.position.set(-4, 7, 2);
  winter.castShadow = true;
  winter.shadow.mapSize.set(1024, 1024);
  Object.assign(winter.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 1,
    far: 25,
  });
  winter.shadow.bias = -0.0003;
  winter.shadow.normalBias = 0.025;
  winter.shadow.radius = 5;
  winter.shadow.blurSamples = 8;
  scene.add(winter);
  const lamps = furniture.lamps.map((l) => {
    const light = new THREE.PointLight("#ffda9e", l.power, 3.6, 2);
    light.position.set(...l.pos);
    scene.add(light);
    return { ...l, light };
  });
  const candles = new THREE.PointLight("#efc88d", 0.55, 1.65, 2);
  candles.position.set(0.4, 1.02, 1.56);
  scene.add(candles);
  const white = new THREE.SpotLight("#efe5cd", 3, 8, 1, 0.95, 2);
  white.position.set(1.2, 4, 0);
  white.target.position.set(1, 0, -0.5);
  scene.add(white, white.target);
  const accent = new THREE.PointLight("#b5c5d0", 0, 2.4, 2);
  accent.position.set(2, 0.8, -3.8);
  scene.add(accent);
  const c = new THREE.Color();
  return {
    whiteLight: white,
    fixtures: lamps,
    update(dt, t) {
      ambient.intensity = damp(
        ambient.intensity,
        store.state.day ? 2 : 1.05,
        dt,
      );
      winter.intensity = damp(
        winter.intensity,
        store.state.day ? 1.15 : 0.48,
        dt,
      );
      winter.color.lerp(
        c.set(store.state.day ? "#e5edf0" : "#b7c8dc"),
        1 - Math.exp(-dt * 2),
      );
      lamps.forEach((l) => {
        l.light.intensity = damp(
          l.light.intensity,
          store.state[l.key] ? l.power : 0,
          dt,
        );
        l.shade.emissiveIntensity = damp(
          l.shade.emissiveIntensity,
          store.state[l.key] ? 0.5 : 0,
          dt,
        );
      });
      candles.intensity = damp(
        candles.intensity,
        furniture.candlesOn ? 0.55 : 0,
        dt,
      );
      white.intensity = damp(
        white.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 10 : 0,
        dt,
      );
      white.color.lerp(
        c.set(
          { 2700: "#efe1c7", 4000: "#e9e8e0", 6000: "#d6e2eb" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 3),
      );
      accent.color.set(store.state.rgbColor);
      accent.intensity = damp(
        accent.intensity,
        0.45 *
          store.state.rgbBrightness *
          rgbEnvelope(store.state.rgbMode, t * (0.2 + store.state.rgbSpeed)),
        dt,
      );
    },
  };
}
