import * as THREE from "three";
import { damp, rgbEnvelope } from "../../state.js";

export function createLighting(scene, store, furniture) {
  const ambient = new THREE.HemisphereLight("#e5e9ee", "#897663", 0.88);
  scene.add(ambient);
  const key = new THREE.DirectionalLight("#f1dec0", 1.7);
  key.position.set(2, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 1,
    far: 25,
  });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.035;
  key.shadow.radius = 4;
  scene.add(key);
  const point = (color, intensity, distance, pos) => {
    const l = new THREE.PointLight(color, intensity, distance, 2);
    l.position.set(...pos);
    scene.add(l);
    return l;
  };
  const lamps = [
    point("#ffd093", 3.2, 3.3, [-0.23, 1.54, -4.2]),
    point("#ffce88", 3, 2.8, [4.14, 1.63, -2.77]),
    point("#ffce88", 3.5, 3.3, [-3.83, 1.55, 0.45]),
    point("#ffd09a", 2, 2.1, [0.4, 3.43, -4.28]),
  ];
  const moon = point("#94b9e7", 6, 5.3, [-4.3, 2.5, -1.1]);
  const white = new THREE.SpotLight("#ffdbb0", 11, 8, 0.95, 0.9, 2);
  white.position.set(0, 4.8, 1);
  white.target.position.set(0, 0, 0);
  scene.add(white, white.target);
  const accent = point("#a1b6ac", 0, 1.8, [0.55, 0.35, -4.12]);
  const temp = new THREE.Color(),
    rgb = new THREE.Color();
  return {
    update(dt, t) {
      lamps.forEach(
        (l, i) =>
          (l.intensity = damp(
            l.intensity,
            (i === 0 || i === 3 ? store.state.bedLamp : store.state.floorLamp)
              ? [3.2, 3, 3.5, 2][i]
              : 0,
            dt,
          )),
      );
      for (const [mat, on] of [
        [furniture.bedShade, store.state.bedLamp],
        [furniture.wallGlow, store.state.bedLamp],
        [furniture.floorShade, store.state.floorLamp],
        [furniture.readingGlow, store.state.floorLamp],
      ])
        mat.emissiveIntensity = damp(mat.emissiveIntensity, on ? 0.6 : 0, dt);
      temp.set(
        { 2700: "#ffdbb0", 4000: "#f1eadb", 6000: "#dbe6f0" }[
          store.state.whiteTemp
        ],
      );
      white.color.lerp(temp, 1 - Math.exp(-dt * 4));
      white.intensity = damp(
        white.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 20 : 0,
        dt,
      );
      ambient.intensity = damp(
        ambient.intensity,
        store.state.day ? 1.28 : 0.88,
        dt,
      );
      moon.intensity = damp(moon.intensity, store.state.day ? 8 : 6, dt);
      moon.color.lerp(
        temp.set(store.state.day ? "#e7ddc8" : "#94b9e7"),
        1 - Math.exp(-dt * 3),
      );
      const mode = store.state.rgbMode,
        phase = t * (0.2 + store.state.rgbSpeed * 1.8);
      if (["static", "breathing", "off"].includes(mode))
        rgb.set(store.state.rgbColor);
      else
        rgb.setHSL(
          mode === "aurora"
            ? 0.46 + Math.sin(phase * 0.2) * 0.1
            : (phase * 0.03) % 1,
          0.23,
          0.65,
        );
      accent.color.lerp(rgb, 1 - Math.exp(-dt * 3));
      accent.intensity = damp(
        accent.intensity,
        rgbEnvelope(mode, phase) *
          store.state.rgbBrightness *
          0.8 *
          (mode === "wave" ? 0.6 + 0.4 * Math.sin(phase) : 1),
        dt,
      );
    },
  };
}
