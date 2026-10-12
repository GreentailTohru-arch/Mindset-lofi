import * as THREE from "three";
import { damp, rgbEnvelope } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const ambient = new THREE.HemisphereLight("#e8eef0", "#b4a58e", 1.18);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight("#ffe4bb", 2.2);
  sun.position.set(-6, 6, 1.2);
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
  sun.shadow.normalBias = 0.028;
  sun.shadow.radius = 4;
  scene.add(sun);
  const lamps = furniture.lamps.map((l) => {
    const light = new THREE.PointLight("#ffdda3", l.intensity, 3.2, 2);
    light.position.copy(l.pos);
    scene.add(light);
    return { ...l, light };
  });
  const white = new THREE.SpotLight("#ffe3bb", 8, 8, 1, 0.9, 2);
  white.position.set(0, 4.6, 0.5);
  white.target.position.set(0, 0, 0.5);
  scene.add(white, white.target);
  const accent = new THREE.PointLight("#aac1d8", 0, 2.4, 2);
  accent.position.set(2, 0.65, -3.8);
  scene.add(accent);
  const temp = new THREE.Color(),
    color = new THREE.Color();
  return {
    whiteLight: white,
    fixtures: lamps,
    update(dt, t) {
      ambient.intensity = damp(
        ambient.intensity,
        store.state.day ? 1.18 : 0.72,
        dt,
      );
      sun.intensity = damp(sun.intensity, store.state.day ? 2.2 : 0.65, dt);
      sun.color.lerp(
        temp.set(store.state.day ? "#ffe4bb" : "#b3cce7"),
        1 - Math.exp(-dt * 3),
      );
      lamps.forEach((l) => {
        l.light.intensity = damp(
          l.light.intensity,
          store.state[l.key] ? l.intensity : 0,
          dt,
        );
        l.shade.emissiveIntensity = damp(
          l.shade.emissiveIntensity,
          store.state[l.key] ? 0.7 : 0,
          dt,
        );
      });
      white.intensity = damp(
        white.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 18 : 0,
        dt,
      );
      white.color.lerp(
        temp.set(
          { 2700: "#ffe3bb", 4000: "#f0ede6", 6000: "#dbe7f2" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 4),
      );
      const mode = store.state.rgbMode,
        p = t * (0.2 + store.state.rgbSpeed * 1.8);
      if (["off", "static", "breathing"].includes(mode))
        color.set(store.state.rgbColor);
      else
        color.setHSL(
          mode === "aurora" ? 0.59 + 0.05 * Math.sin(p * 0.2) : (p * 0.03) % 1,
          0.18,
          0.7,
        );
      accent.color.lerp(color, 1 - Math.exp(-dt * 3));
      accent.intensity = damp(
        accent.intensity,
        store.state.rgbBrightness *
          0.8 *
          rgbEnvelope(mode, p) *
          (mode === "wave" ? 0.7 + 0.3 * Math.sin(p) : 1),
        dt,
      );
    },
  };
}
