import * as THREE from "three";
import { damp, rgbEnvelope } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const sky = new THREE.HemisphereLight("#c2cbd7", "#998572", 1.32);
  scene.add(sky);
  const windowLight = new THREE.DirectionalLight("#afc3dd", 0.82);
  windowLight.position.set(-5, 7, 1.5);
  windowLight.castShadow = true;
  windowLight.shadow.mapSize.set(2048, 2048);
  Object.assign(windowLight.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 1,
    far: 24,
  });
  windowLight.shadow.normalBias = 0.025;
  windowLight.shadow.bias = -0.0003;
  windowLight.shadow.radius = 5;
  windowLight.shadow.blurSamples = 8;
  scene.add(windowLight);
  const lamps = furniture.lamps.map((l) => {
    const light = l.power
      ? new THREE.PointLight("#ffd5a0", l.power, 3.2, 2)
      : null;
    if (light) {
      light.position.set(...l.pos);
      scene.add(light);
    }
    return { ...l, light };
  });
  const niche = new THREE.PointLight("#ffd3a0", 2.8, 2.4, 2);
  niche.position.set(-2.775, 2.7, -3.95);
  scene.add(niche);
  const contour = new THREE.PointLight("#ffe0b8", 5.5, 5.5, 2);
  contour.position.set(1.2, 3.35, -3.8);
  scene.add(contour);
  const white = new THREE.SpotLight("#efdfc8", 4, 9, 1, 0.95, 2);
  white.position.set(-0.4, 4.7, 0.5);
  white.target.position.set(-0.4, 0, 1);
  scene.add(white, white.target);
  const accent = new THREE.PointLight("#9a9da9", 0, 2.2, 2);
  accent.position.set(2, 0.35, 2);
  scene.add(accent);
  const color = new THREE.Color();
  return {
    whiteLight: white,
    fixtures: [...lamps, { light: niche }, { light: contour }],
    update(dt, t) {
      sky.intensity = damp(sky.intensity, store.state.day ? 1.55 : 1.32, dt);
      windowLight.intensity = damp(
        windowLight.intensity,
        store.state.day ? 1.5 : 0.82,
        dt,
      );
      windowLight.color.lerp(
        color.set(store.state.day ? "#e9ddc8" : "#afc3dd"),
        1 - Math.exp(-dt * 2),
      );
      for (const l of lamps) {
        const on = store.state[l.key];
        if (l.light)
          l.light.intensity = damp(l.light.intensity, on ? l.power : 0, dt);
        l.shade.emissiveIntensity = damp(
          l.shade.emissiveIntensity,
          on ? 0.58 : 0,
          dt,
        );
      }
      niche.intensity = damp(
        niche.intensity,
        store.state.whiteOn ? 2.8 : 0,
        dt,
      );
      contour.intensity = damp(
        contour.intensity,
        store.state.whiteOn ? 5.5 : 0,
        dt,
      );
      white.intensity = damp(
        white.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 13 : 0,
        dt,
      );
      white.color.lerp(
        color.set(
          { 2700: "#efdfc8", 4000: "#e5e2da", 6000: "#d5dfea" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 3),
      );
      accent.color.set(store.state.rgbColor);
      accent.intensity = damp(
        accent.intensity,
        store.state.rgbBrightness *
          0.45 *
          rgbEnvelope(store.state.rgbMode, t * (0.2 + store.state.rgbSpeed)),
        dt,
      );
    },
  };
}
