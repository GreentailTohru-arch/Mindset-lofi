import * as THREE from "three";
import { damp } from "../../state.js";
import { reflectionEnvironment } from "./materials.js";
export function createLighting(scene, store, furniture) {
  scene.environment = reflectionEnvironment();
  scene.environmentIntensity = 0.38;
  const hemi = new THREE.HemisphereLight("#bcc0dc", "#9b7850", 1.55),
    sun = new THREE.DirectionalLight("#acb6ec", 1.65);
  sun.position.set(-6, 7, 3);
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
  sun.shadow.bias = -0.0002;
  sun.shadow.normalBias = 0.018;
  sun.shadow.radius = 5;
  sun.shadow.blurSamples = 8;
  scene.add(hemi, sun);
  const lights = furniture.lamps.map((l) => {
    const light = l.power
      ? new THREE.PointLight("#ffd391", l.power, 4, 2)
      : null;
    if (light) {
      light.position.set(...l.pos);
      scene.add(light);
    }
    return { ...l, light };
  });
  const fill = new THREE.SpotLight("#ffddb2", 12, 12, 1, 0.9, 2);
  fill.position.set(0, 5, 1);
  scene.add(fill, fill.target);
  const color = new THREE.Color();
  return {
    whiteLight: fill,
    fixtures: lights,
    update(dt) {
      sun.intensity = damp(sun.intensity, store.state.day ? 2.2 : 1.65, dt);
      sun.color.lerp(
        color.set(store.state.day ? "#f7ddb7" : "#acb6ec"),
        1 - Math.exp(-dt * 2),
      );
      for (const l of lights) {
        if (l.light)
          l.light.intensity = damp(
            l.light.intensity,
            store.state[l.key] ? l.power : 0,
            dt,
          );
        l.shade.emissiveIntensity = damp(
          l.shade.emissiveIntensity,
          store.state[l.key] ? 0.95 : 0,
          dt,
        );
      }
      fill.intensity = damp(
        fill.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 36 : 0,
        dt,
      );
      fill.color.lerp(
        color.set(
          { 2700: "#ffddb2", 4000: "#efdfca", 6000: "#d4def0" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 3),
      );
    },
  };
}
