import * as THREE from "three";
import { damp, rgbEnvelope } from "../../state.js";

export function createLighting(scene, store, furniture) {
  const sky = new THREE.HemisphereLight("#dbe8ee", "#9c9d98", 1.05);
  scene.add(sky);
  const sun = new THREE.DirectionalLight("#ffe0b0", 2.25);
  sun.position.set(-6, 5, 1.5);
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
  sun.shadow.radius = 4;
  scene.add(sun);
  const point = (color, intensity, distance, pos) => {
    const l = new THREE.PointLight(color, intensity, distance, 2);
    l.position.set(...pos);
    scene.add(l);
    return l;
  };
  const lamps = [
    point("#ffd28b", 4, 3, [-1.55, 1.45, -3.9]),
    point("#ffd28b", 3.6, 3, [2.98, 0.46, 3.64]),
  ];
  const sea = point("#91bed9", 2, 4, [-4.1, 2.5, 0]);
  const violet = point("#b4a6d2", 0.35, 2.6, [1.3, 2.7, -4.6]);
  const white = new THREE.SpotLight("#ffe0b7", 10, 8, 0.95, 0.9, 2);
  white.position.set(1, 4.7, 1);
  white.target.position.set(0, 0, 0);
  scene.add(white, white.target);
  const temp = new THREE.Color(),
    color = new THREE.Color();
  return {
    whiteLight: white,
    fixtures: lamps.map((light, i) => ({ light, shade: i ? furniture.floorShade : furniture.bedShade, key: i ? "floorLamp" : "bedLamp" })),
    update(dt, t) {
      sky.intensity = damp(sky.intensity, store.state.day ? 1.05 : 0.66, dt);
      sun.intensity = damp(sun.intensity, store.state.day ? 2.25 : 0.75, dt);
      sun.color.lerp(
        temp.set(store.state.day ? "#ffe0b0" : "#b0c7e3"),
        1 - Math.exp(-dt * 3),
      );
      sea.intensity = damp(sea.intensity, store.state.day ? 2 : 3.5, dt);
      for (const [i, on, mat] of [
        [0, store.state.bedLamp, furniture.bedShade],
        [1, store.state.floorLamp, furniture.floorShade],
      ]) {
        lamps[i].intensity = damp(
          lamps[i].intensity,
          on ? (i ? 3.6 : 4) : 0,
          dt,
        );
        mat.emissiveIntensity = damp(mat.emissiveIntensity, on ? 0.6 : 0, dt);
      }
      white.color.lerp(
        temp.set(
          { 2700: "#ffe0b7", 4000: "#eee9dc", 6000: "#d6e4ef" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 4),
      );
      white.intensity = damp(
        white.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 17 : 0,
        dt,
      );
      const mode = store.state.rgbMode,
        p = t * (0.2 + store.state.rgbSpeed * 1.8);
      if (["static", "breathing", "off"].includes(mode))
        color.set(store.state.rgbColor);
      else
        color.setHSL(
          mode === "aurora" ? 0.62 + 0.08 * Math.sin(p * 0.2) : (p * 0.03) % 1,
          0.28,
          0.65,
        );
      violet.color.lerp(color, 1 - Math.exp(-dt * 3));
      violet.intensity = damp(
        violet.intensity,
        store.state.rgbBrightness *
          1.3 *
          rgbEnvelope(mode, p) *
          (mode === "wave" ? 0.65 + 0.35 * Math.sin(p) : 1),
        dt,
      );
    },
  };
}
