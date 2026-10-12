import * as THREE from "three";
import { box, group } from "../primitives.js";
import { damp, rgbEnvelope } from "../../state.js";

export function createLighting(scene, store, furniture, register) {
  const ambient = new THREE.HemisphereLight("#e1e7ed", "#82745e", 0.8);
  scene.add(ambient);
  const key = new THREE.DirectionalLight("#f0dfbd", 1.6);
  key.position.set(1, 8, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 1,
    far: 24,
  });
  key.shadow.bias = -0.0003;
  key.shadow.normalBias = 0.03;
  key.shadow.radius = 4;
  scene.add(key);
  const point = (color, intensity, distance, pos) => {
    const l = new THREE.PointLight(color, intensity, distance, 2);
    l.position.set(...pos);
    scene.add(l);
    return l;
  };
  const warmA = point("#ffd191", 5, 4, [-3.95, 1.56, 2.45]);
  const warmB = point("#ffcf85", 4.5, 3.5, [3.95, 1.83, -3.9]);
  const moon = point("#91b7de", 5, 5, [-4.25, 2.6, -1.3]);
  const white = new THREE.SpotLight("#ffdbad", 12, 8, 0.9, 0.9, 2);
  white.position.set(0, 4.6, 0);
  white.target.position.set(0, 0, 0);
  scene.add(white, white.target);
  const accent = [
    point("#74bcb0", 1.5, 2.6, [1.3, 1.3, -4.22]),
    point("#b2a0c8", 1.2, 2.3, [3.75, 0.55, 1.42]),
  ];
  const strips = group(scene),
    materials = [];
  for (const [size, pos] of [
    [
      [2.35, 0.018, 0.018],
      [1.3, 0.98, -4.17],
    ],
    [
      [0.018, 0.018, 1.9],
      [3.7, 0.4, 1.42],
    ],
  ]) {
    const mat = new THREE.MeshStandardMaterial({
      color: "#79a99a",
      emissive: "#79a99a",
      emissiveIntensity: 0.45,
    });
    const mesh = box(strips, size, pos, mat);
    mesh.castShadow = false;
    materials.push(mat);
  }
  register(strips, "隐光灯带", "切换氛围", () => {
    store.set("rgbMode", store.state.rgbMode === "off" ? "aurora" : "off");
    return store.state.rgbMode === "off" ? "隐光熄灭" : "黛青与淡紫 · 微光流转";
  });
  const color = new THREE.Color();
  return {
    whiteLight: white,
    fixtures: [{ light: warmA, shade: furniture.bedShade, key: "bedLamp" }, { light: warmB, shade: furniture.floorShade, key: "floorLamp" }],
    update(dt, t) {
      warmA.intensity = damp(warmA.intensity, store.state.bedLamp ? 5 : 0, dt);
      warmB.intensity = damp(
        warmB.intensity,
        store.state.floorLamp ? 4.5 : 0,
        dt,
      );
      furniture.bedShade.emissiveIntensity = damp(
        furniture.bedShade.emissiveIntensity,
        store.state.bedLamp ? 0.65 : 0,
        dt,
      );
      furniture.floorShade.emissiveIntensity = damp(
        furniture.floorShade.emissiveIntensity,
        store.state.floorLamp ? 0.65 : 0,
        dt,
      );
      white.color.lerp(
        new THREE.Color(
          { 2700: "#ffdbad", 4000: "#efe9db", 6000: "#d9e5ef" }[
            store.state.whiteTemp
          ],
        ),
        1 - Math.exp(-dt * 4),
      );
      white.intensity = damp(
        white.intensity,
        store.state.whiteOn ? store.state.whiteBrightness * 20 : 0,
        dt,
      );
      ambient.intensity = damp(
        ambient.intensity,
        store.state.day ? 1.25 : 0.8,
        dt,
      );
      moon.intensity = damp(moon.intensity, store.state.day ? 7 : 5, dt);
      moon.color.lerp(
        new THREE.Color(store.state.day ? "#e9dcbc" : "#91b7de"),
        1 - Math.exp(-dt * 3),
      );
      const mode = store.state.rgbMode,
        speed = 0.2 + store.state.rgbSpeed * 1.8,
        phase = t * speed;
      materials.forEach((mat, i) => {
        if (mode === "static" || mode === "breathing" || mode === "off")
          color.set(store.state.rgbColor);
        else if (mode === "aurora")
          color.setHSL(
            0.45 + 0.23 * (0.5 + 0.5 * Math.sin(phase * 0.3 + i * 2)),
            0.28,
            0.62,
          );
        else if (mode === "random")
          color.setHSL((Math.sin(phase * 0.17) + 1) * 0.5, 0.3, 0.6);
        else color.setHSL((phase * 0.06 + i * 0.24) % 1, 0.4, 0.6);
        const strength =
          rgbEnvelope(mode, phase) *
          store.state.rgbBrightness *
          (mode === "wave" ? 0.5 + 0.5 * Math.sin(phase - i) : 1);
        mat.emissive.lerp(color, 1 - Math.exp(-dt * 3));
        mat.color.copy(mat.emissive);
        mat.emissiveIntensity = damp(mat.emissiveIntensity, strength * 0.8, dt);
        accent[i].color.copy(mat.emissive);
        accent[i].intensity = damp(accent[i].intensity, strength * 2, dt);
      });
    },
  };
}
