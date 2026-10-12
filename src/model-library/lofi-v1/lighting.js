import * as THREE from "three";
import { box, group } from "./primitives.js";
import { damp, rgbEnvelope } from "../state.js";
import { seeded } from "./materials.js";

export function createLighting(scene, store, furniture, register) {
  const ambient = new THREE.HemisphereLight("#d5d6df", "#827066", 0.65);
  scene.add(ambient);
  // Neutral fill, with only one shadow map for the entire room.
  const key = new THREE.DirectionalLight("#fff0da", 1.6);
  key.position.set(3, 8, 5);
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
  key.shadow.normalBias = 0.04;
  key.shadow.radius = 3;
  scene.add(key);
  const point = (color, intensity, distance, pos) => {
    const l = new THREE.PointLight(color, intensity, distance, 2);
    l.position.set(...pos);
    scene.add(l);
    return l;
  };
  const bed = point("#ffd095", 3, 2.5, [-4.15, 1.21, 2.05]);
  const floor = point("#ffc68b", 5.5, 3.0, [-4.55, 1.7, 3.0]);
  const white = new THREE.SpotLight("#ffd7a6", 18, 7.5, 0.93, 0.85, 2);
  white.position.set(0.2, 4.7, 1.3);
  white.target.position.set(0, 0, 0);
  scene.add(white, white.target);
  const windowLight = point("#a3b8d1", 1.3, 4.4, [-4.65, 2.6, -1.5]);
  const rgbLights = [
    point("#ad8fff", 1.8, 2.4, [-1.55, 2.02, -4.05]),
    point("#88b9e1", 2, 2.6, [0.2, 0.52, -4.11]),
    point("#9a8cd2", 1.6, 2.3, [1.8, 2.0, -4.07]),
  ];
  const strips = group(scene),
    segments = [];
  function strip(start, end, count) {
    const a = new THREE.Vector3(...start),
      b = new THREE.Vector3(...end);
    for (let i = 0; i < count; i++) {
      const p = a.clone().lerp(b, (i + 0.5) / count);
      const length = a.distanceTo(b) / count;
      const alongX = Math.abs(a.x - b.x) > 0.01;
      const mat = new THREE.MeshStandardMaterial({
        color: "#9d88cc",
        emissive: "#9d88cc",
        emissiveIntensity: 1,
        roughness: 0.48,
      });
      const mesh = box(
        strips,
        alongX
          ? [length + 0.004, 0.025, 0.025]
          : [0.025, 0.025, length + 0.004],
        p.toArray(),
        mat,
      );
      mesh.castShadow = false;
      segments.push(mat);
    }
  }
  // Match the square room's left and back wall edges exactly.
  strip([-4.88, 3.99, 4.96], [-4.88, 3.99, -4.88], 44);
  strip([-4.88, 3.99, -4.88], [4.98, 3.99, -4.88], 45);
  strip([-2.11, 1.1, -4.71], [1.39, 1.1, -4.71], 20);
  strip([-4.76, 1.8, -4.29], [-2.21, 1.8, -4.29], 12);
  strip([1.62, 1.8, -4.28], [2.67, 1.8, -4.28], 6);
  register(strips, "RGB 灯带", "轻点切换极光与呼吸", () => {
    store.set(
      "rgbMode",
      store.state.rgbMode === "aurora" ? "breathing" : "aurora",
    );
    return store.state.rgbMode === "aurora"
      ? "极光 · 紫与蓝缓慢交织"
      : "呼吸灯 · 随着光慢下来";
  });
  const color = new THREE.Color(),
    base = new THREE.Color(),
    whiteColor = new THREE.Color(),
    waveColor = new THREE.Color("#79c6d3");
  let power = store.state.rgbBrightness,
    clock = 0;
  const random = seeded(53),
    randomFrom = new THREE.Color("#a68fcc"),
    randomTo = new THREE.Color("#85bec9"),
    randomColor = new THREE.Color();
  let randomStep = 0;
  const temps = { 2700: "#ffd4a3", 4000: "#ffe9ce", 6000: "#edf2ff" };
  function colorAt(out, mode, t, offset) {
    if (mode === "static" || mode === "breathing" || mode === "off")
      return out.copy(base);
    if (mode === "rainbow")
      return out.setHSL((t * 0.055 + offset) % 1, 0.85, 0.49);
    if (mode === "wave")
      return out
        .copy(base)
        .lerp(waveColor, 0.5 + 0.5 * Math.sin(t * 1.5 - offset * 10));
    if (mode === "aurora")
      return out.setHSL(
        0.59 + 0.16 * (0.5 + 0.5 * Math.sin(t * 0.37 - offset * 5)),
        0.78,
        0.48,
      );
    return out.copy(randomColor);
  }
  return {
    lights: { ambient, key, white, bed, floor, windowLight, rgb: rgbLights },
    fixtures: [{ light: bed, shade: furniture.bedShade, key: "bedLamp" }, { light: floor, shade: furniture.floorShade, key: "floorLamp" }],
    update(dt, t) {
      const s = store.state;
      clock += dt * (0.2 + s.rgbSpeed * 1.8);
      base.set(s.rgbColor);
      power = damp(power, s.rgbMode === "off" ? 0 : s.rgbBrightness, dt, 3);
      if (Math.floor(clock / 6) > randomStep) {
        randomStep = Math.floor(clock / 6);
        randomFrom.copy(randomTo);
        randomTo.setHSL(random(), 0.42 + random() * 0.15, 0.5);
      }
      randomColor
        .copy(randomFrom)
        .lerp(randomTo, THREE.MathUtils.smoothstep((clock % 6) / 6, 0, 1));
      segments.forEach((mat, i) => {
        colorAt(color, s.rgbMode, clock, i / segments.length);
        mat.color.lerp(color, 1 - Math.exp(-dt * 3));
        mat.emissive.copy(mat.color);
        mat.emissiveIntensity = damp(
          mat.emissiveIntensity,
          power *
            rgbEnvelope(s.rgbMode === "off" ? "static" : s.rgbMode, clock) *
            1.65,
          dt,
          5,
        );
      });
      rgbLights.forEach((l, i) => {
        colorAt(color, s.rgbMode, clock, i * 0.34);
        l.color.lerp(color, 1 - Math.exp(-dt * 3));
        l.intensity = damp(
          l.intensity,
          power *
            rgbEnvelope(s.rgbMode === "off" ? "static" : s.rgbMode, clock) *
            [2.7, 3.2, 2.4][i],
          dt,
          5,
        );
      });
      whiteColor.set(temps[s.whiteTemp]);
      white.color.lerp(whiteColor, 1 - Math.exp(-dt * 3));
      white.intensity = damp(
        white.intensity,
        s.whiteOn ? s.whiteBrightness * 26 : 0,
        dt,
        3,
      );
      bed.intensity = damp(bed.intensity, s.bedLamp ? 3 : 0, dt, 4);
      floor.intensity = damp(floor.intensity, s.floorLamp ? 5.5 : 0, dt, 4);
      furniture.bedShade.emissiveIntensity = damp(
        furniture.bedShade.emissiveIntensity,
        s.bedLamp ? 0.7 : 0,
        dt,
        4,
      );
      furniture.floorShade.emissiveIntensity = damp(
        furniture.floorShade.emissiveIntensity,
        s.floorLamp ? 0.55 : 0,
        dt,
        4,
      );
      ambient.intensity = damp(ambient.intensity, s.day ? 0.95 : 0.6, dt, 1.3);
      key.intensity = damp(key.intensity, s.day ? 2.3 : 1.45, dt, 1.3);
      windowLight.intensity = damp(
        windowLight.intensity,
        (s.day ? 8 : 1.3) * (s.curtains ? 1 : 0.12),
        dt,
        1.5,
      );
      windowLight.color.lerp(
        new THREE.Color(s.day ? "#ffe6bd" : "#adc2e2"),
        1 - Math.exp(-dt * 2),
      );
    },
  };
}
