import * as THREE from "three";
import { damp } from "../../state.js";
export function createLighting(scene, store, furniture) {
  const ambient = new THREE.HemisphereLight("#f5ebd9", "#9a8066", 1.35);
  const sun = new THREE.DirectionalLight("#ffdc9f", 2.5);
  sun.position.set(-8, 5, 1.8);
  sun.target.position.set(0, 0, 0);
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
  sun.shadow.bias = -0.00015;
  sun.shadow.normalBias = 0.008;
  sun.shadow.radius = 2;
  sun.shadow.blurSamples = 4;
  scene.add(ambient, sun, sun.target);
  const lamps = furniture.lamps.map((l) => {
    const light = new THREE.PointLight("#ffcf91", l.power, 3.2, 2);
    light.position.set(...l.pos);
    scene.add(light);
    return { ...l, light };
  });
  const fill = new THREE.SpotLight("#efdfc5", 4, 9, 1, 0.95, 2);
  fill.position.set(0, 4.8, 1);
  scene.add(fill, fill.target);
  const color = new THREE.Color();
  return {
    whiteLight: fill,
    fixtures: lamps,
    update(dt) {
      ambient.intensity = damp(
        ambient.intensity,
        store.state.day ? 1.35 : 0.65,
        dt,
      );
      sun.intensity = damp(sun.intensity, store.state.day ? 2.5 : 0.65, dt);
      sun.color.lerp(
        color.set(store.state.day ? "#ffdc9f" : "#b0c8e5"),
        1 - Math.exp(-dt * 2),
      );
      for (const l of lamps) {
        l.light.intensity = damp(
          l.light.intensity,
          store.state[l.key] ? l.power : 0,
          dt,
        );
        l.shade.emissiveIntensity = damp(
          l.shade.emissiveIntensity,
          store.state[l.key] ? 0.6 : 0,
          dt,
        );
      }
      fill.intensity = damp(
        fill.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 12 : 0,
        dt,
      );
      fill.color.lerp(
        color.set(
          { 2700: "#efdfc5", 4000: "#e9e6dc", 6000: "#d7e3ed" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 3),
      );
    },
  };
}
