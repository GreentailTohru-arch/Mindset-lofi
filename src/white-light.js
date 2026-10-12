import * as THREE from "three";
import { damp } from "./state.js";

const colors = {
  2700: new THREE.Color("#ffd0a0"),
  4000: new THREE.Color("#ffecd9"),
  6000: new THREE.Color("#e4efff"),
};

// Control existing indoor fill and fixture emitters, independently of sunlight/RGB.
export function createWhiteLightControl(lighting, store) {
  const light = lighting.whiteLight ?? lighting.lights?.white;
  if (!light?.isLight)
    throw new Error("Scene has no controllable indoor white light");
  const color = light.color.clone();
  let intensity = light.intensity;
  // Spot lights lose energy over the 4–5 m distance to the floor. Give the
  // brightness slider enough range to compete with the existing daylight fill.
  const maximum = light.isSpotLight ? 65 : 2.5;
  const fixtures = (lighting.fixtures ?? []).map((fixture) => ({
    ...fixture,
    source: fixture,
    power: fixture.power ?? fixture.light?.intensity ?? 0,
    strength: 0,
    emission: fixture.shade
      ? Math.max(0.65, fixture.shade.emissiveIntensity)
      : 0.65,
  }));
  const smooth = (current, target, dt) => {
    const next = damp(current, target, dt, 7);
    return target === 0 && next < 0.001 ? 0 : next;
  };
  return {
    update(dt) {
      const state = store.state;
      color.lerp(
        colors[state.whiteTemp] ?? colors[2700],
        1 - Math.exp(-dt * 4),
      );
      intensity = smooth(
        intensity,
        state.whiteOn ? state.whiteBrightness * maximum : 0,
        dt,
      );
      light.color.copy(color);
      light.intensity = intensity;
      for (const fixture of fixtures) {
        const enabled = fixture.source.manualOn ?? (fixture.enabled
          ? fixture.enabled(state)
          : !fixture.key || state[fixture.key]);
        const target = state.whiteOn && enabled ? state.whiteBrightness : 0;
        fixture.strength = smooth(fixture.strength, target, dt);
        if (fixture.light) {
          fixture.light.color.copy(color);
          fixture.light.intensity = fixture.power * fixture.strength;
        }
        if (fixture.shade?.emissive) {
          fixture.shade.emissive.copy(color);
          fixture.shade.emissiveIntensity = fixture.emission * fixture.strength;
        }
        for (const flame of fixture.flames ?? []) {
          flame.visible = fixture.strength > 0;
          flame.material.color.copy(color);
          if (flame.material.emissive) flame.material.emissive.copy(color);
          flame.material.opacity = fixture.strength * 0.88;
        }
      }
    },
  };
}
