import * as THREE from "three";
import { damp, rgbEnvelope } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const sky = new THREE.HemisphereLight("#d6e1ed", "#a78a6a", 1.05);
  scene.add(sky);
  const moon = new THREE.DirectionalLight("#afc8e8", 1.25);
  moon.position.set(-6, 6, 1);
  moon.castShadow = true;
  moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 1,
    far: 25,
  });
  moon.shadow.bias = -0.0003;
  moon.shadow.normalBias = 0.025;
  scene.add(moon);
  // Local candle pools share switches; only the moon casts a shadow map.
  const points = [
    ["bedLamp", [-0.8, 2.6, -4.15], 4.8],
    ["bedLamp", [1.5, 2.6, -4.15], 4.8],
    ["floorLamp", [3.89, 1.5, -4.03], 2.4],
    ["floorLamp", [0.65, 1.4, 0.9], 2.2],
  ].map(([key, pos, power]) => {
    const light = new THREE.PointLight("#ffd298", power, 4, 2);
    light.position.set(...pos);
    scene.add(light);
    return { key, power, light };
  });
  const white = new THREE.SpotLight("#ffe1b4", 10, 9, 1, 0.9, 2);
  white.position.set(-0.5, 4.7, 1);
  white.target.position.set(0, 0, 0.7);
  scene.add(white, white.target);
  const accent = new THREE.PointLight("#a99bbd", 0.15, 2.6, 2);
  accent.position.set(-2, 1, -3.5);
  scene.add(accent);
  const temp = new THREE.Color(),
    color = new THREE.Color();
  return {
    whiteLight: white,
    fixtures: [...points, ...furniture.lamps],
    update(dt, t) {
      sky.intensity = damp(sky.intensity, store.state.day ? 1.3 : 1.05, dt);
      moon.intensity = damp(moon.intensity, store.state.day ? 2 : 1.25, dt);
      moon.color.lerp(
        temp.set(store.state.day ? "#ffe4bc" : "#afc8e8"),
        1 - Math.exp(-dt * 3),
      );
      points.forEach(
        (p) =>
          (p.light.intensity = damp(
            p.light.intensity,
            store.state[p.key] ? p.power : 0,
            dt,
          )),
      );
      white.intensity = damp(
        white.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 22 : 0,
        dt,
      );
      white.color.lerp(
        temp.set(
          { 2700: "#ffe1b4", 4000: "#eee9df", 6000: "#dae6f4" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 3),
      );
      const mode = store.state.rgbMode,
        p = t * (0.2 + store.state.rgbSpeed * 1.8);
      if (["off", "static", "breathing"].includes(mode))
        color.set(store.state.rgbColor);
      else
        color.setHSL(
          mode === "aurora" ? 0.65 + 0.06 * Math.sin(p * 0.2) : (p * 0.03) % 1,
          0.2,
          0.6,
        );
      accent.color.lerp(color, 1 - Math.exp(-dt * 3));
      accent.intensity = damp(
        accent.intensity,
        store.state.rgbBrightness *
          rgbEnvelope(mode, p) *
          (mode === "wave" ? 0.65 + 0.35 * Math.sin(p) : 1),
        dt,
      );
    },
  };
}
