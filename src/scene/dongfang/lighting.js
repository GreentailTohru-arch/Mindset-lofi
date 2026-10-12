import * as THREE from "three";
import { damp, rgbEnvelope } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const ambient = new THREE.HemisphereLight("#c4cfda", "#a69070", 1.22);
  scene.add(ambient);
  const daylight = new THREE.DirectionalLight("#b8cbdc", 1.05);
  daylight.position.set(-4.5, 7, 1.5);
  daylight.castShadow = true;
  daylight.shadow.mapSize.set(1536, 1536);
  Object.assign(daylight.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 1,
    far: 25,
  });
  daylight.shadow.normalBias = 0.025;
  daylight.shadow.bias = -0.0003;
  daylight.shadow.radius = 4;
  daylight.shadow.blurSamples = 8;
  scene.add(daylight);
  const lamps = furniture.lamps.map((l) => {
    const light = l.power
      ? new THREE.PointLight("#ffd29a", l.power, l.range || 3, 2)
      : null;
    if (light) {
      light.position.set(...l.pos);
      scene.add(light);
    }
    return { ...l, light };
  });
  const white = new THREE.SpotLight("#ecdbc0", 6, 9, 1, 0.95, 2);
  white.position.set(0, 4.6, 1);
  white.target.position.set(0, 0, 1);
  scene.add(white, white.target);
  const accent = new THREE.PointLight("#839f98", 0, 2.2, 2);
  accent.position.set(2.7, 0.7, -2.3);
  scene.add(accent);
  const color = new THREE.Color();
  return {
    whiteLight: white,
    fixtures: lamps,
    update(dt, t) {
      ambient.intensity = damp(
        ambient.intensity,
        store.state.day ? 1.55 : 1.22,
        dt,
      );
      daylight.intensity = damp(
        daylight.intensity,
        store.state.day ? 1.35 : 1.05,
        dt,
      );
      daylight.color.lerp(
        color.set(store.state.day ? "#dddcd0" : "#b8cbdc"),
        1 - Math.exp(-dt * 2),
      );
      lamps.forEach((l) => {
        const on = store.state[l.key];
        if (l.light)
          l.light.intensity = damp(l.light.intensity, on ? l.power : 0, dt);
        l.shade.emissiveIntensity = damp(
          l.shade.emissiveIntensity,
          on ? 0.58 : 0,
          dt,
        );
      });
      white.intensity = damp(
        white.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 13 : 0,
        dt,
      );
      white.color.lerp(
        color.set(
          { 2700: "#ecdbc0", 4000: "#e6e2d8", 6000: "#d4e0e9" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 3),
      );
      accent.color.set(store.state.rgbColor);
      accent.intensity = damp(
        accent.intensity,
        0.55 *
          store.state.rgbBrightness *
          rgbEnvelope(store.state.rgbMode, t * (0.2 + store.state.rgbSpeed)),
        dt,
      );
    },
  };
}
