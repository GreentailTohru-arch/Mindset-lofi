import * as THREE from "three";
import { damp, rgbEnvelope } from "../../state.js";

export function createLighting(scene, store, furniture) {
  const ambient = new THREE.HemisphereLight("#d3dfed", "#967454", 1.05);
  scene.add(ambient);
  const moon = new THREE.DirectionalLight("#a8c9f0", 1.4);
  moon.position.set(-6, 6, 2);
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
  moon.shadow.radius = 4;
  scene.add(moon);
  const lanterns = furniture.lamps.map((l) => {
    const light = new THREE.PointLight("#ffd18a", 5.3, 4.1, 2);
    light.position.copy(l.pos);
    scene.add(light);
    return { ...l, light };
  });
  const fill = new THREE.PointLight("#dba6e5", 0.3, 3, 2);
  fill.position.set(1, 1.8, -3.7);
  scene.add(fill);
  const white = new THREE.SpotLight("#ffdfb1", 12, 9, 1, 0.88, 2);
  white.position.set(-0.5, 4.6, 1.3);
  white.target.position.set(0, 0, 1);
  scene.add(white, white.target);
  const temp = new THREE.Color(),
    color = new THREE.Color();
  return {
    whiteLight: white,
    fixtures: lanterns,
    update(dt, t) {
      ambient.intensity = damp(
        ambient.intensity,
        store.state.day ? 1.25 : 1.05,
        dt,
      );
      moon.intensity = damp(moon.intensity, store.state.day ? 2.05 : 1.4, dt);
      moon.color.lerp(
        temp.set(store.state.day ? "#ffe2b8" : "#a8c9f0"),
        1 - Math.exp(-dt * 3),
      );
      lanterns.forEach((l) => {
        const on = store.state[l.key];
        l.light.intensity = damp(l.light.intensity, on ? 5.3 : 0, dt);
        l.shade.emissiveIntensity = damp(
          l.shade.emissiveIntensity,
          on ? 0.75 : 0,
          dt,
        );
      });
      white.color.lerp(
        temp.set(
          { 2700: "#ffdfb1", 4000: "#ede9dd", 6000: "#dbe8f5" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 4),
      );
      white.intensity = damp(
        white.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 22 : 0,
        dt,
      );
      const p = t * (0.2 + store.state.rgbSpeed * 1.8),
        mode = store.state.rgbMode;
      if (["static", "off", "breathing"].includes(mode))
        color.set(store.state.rgbColor);
      else
        color.setHSL(
          mode === "aurora" ? 0.63 + 0.07 * Math.sin(p * 0.2) : (p * 0.03) % 1,
          0.25,
          0.65,
        );
      fill.color.lerp(color, 1 - Math.exp(-dt * 3));
      fill.intensity = damp(
        fill.intensity,
        store.state.rgbBrightness *
          1.2 *
          rgbEnvelope(mode, p) *
          (mode === "wave" ? 0.65 + 0.35 * Math.sin(p) : 1),
        dt,
      );
    },
  };
}
